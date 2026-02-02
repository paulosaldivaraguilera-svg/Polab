/**
 * OpenClaw Services - Twitch Integration Module
 * 
 * Handles Twitch EventSub for channel points and Bits
 * Integrates with the Claw-as-a-Service platform
 */

const crypto = require('crypto');
const EventEmitter = require('events');

// Twitch API Configuration
const TWITCH_CONFIG = {
    clientId: process.env.TWITCH_CLIENT_ID || '',
    clientSecret: process.env.TWITCH_CLIENT_SECRET || '',
    botAccessToken: process.env.TWITCH_BOT_TOKEN || '',
    broadcasterAccessToken: process.env.TWITCH_BROADCASTER_TOKEN || '',
    webhookSecret: process.env.TWITCH_WEBHOOK_SECRET || 'openclaw_secret',
    apiBaseUrl: 'https://api.twitch.tv/helix'
};

class TwitchIntegration extends EventEmitter {
    constructor(config = {}) {
        super();
        this.config = { ...TWITCH_CONFIG, ...config };
        this.accessToken = null;
        this.tokenExpiry = null;
        this.subscriptions = new Map();
        this.gameSessions = new Map(); // userId -> session data
    }

    /**
     * Authenticate with Twitch API (App Access Token)
     */
    async authenticate() {
        try {
            const response = await fetch(`${this.config.apiBaseUrl}/oauth2/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: this.config.clientId,
                    client_secret: this.config.clientSecret,
                    grant_type: 'client_credentials'
                })
            });

            const data = await response.json();
            this.accessToken = data.access_token;
            this.tokenExpiry = Date.now() + (data.expires_in * 1000);
            
            console.log('✅ Twitch API authenticated');
            return true;
        } catch (error) {
            console.error('❌ Twitch auth failed:', error.message);
            return false;
        }
    }

    /**
     * Make authenticated API request
     */
    async apiRequest(endpoint, method = 'GET', body = null) {
        if (!this.accessToken || Date.now() > this.tokenExpiry - 60000) {
            await this.authenticate();
        }

        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Client-Id': this.config.clientId,
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${this.config.apiBaseUrl}${endpoint}`, options);
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Twitch API Error: ${response.status} - ${error}`);
        }

        return response.json();
    }

    /**
     * Subscribe to channel events (channel.channel_points_custom_reward_redemption, channel.cheer)
     */
    async subscribeToEvents(broadcasterId, userId = 'broadcaster') {
        const events = [
            {
                type: 'channel.channel_points_custom_reward_redemption.add',
                version: '1',
                condition: { broadcaster_user_id: broadcasterId }
            },
            {
                type: 'channel.cheer',
                version: '1',
                condition: { broadcaster_user_id: broadcasterId }
            },
            {
                type: 'channel.subscription.message',
                version: '1',
                condition: { broadcaster_user_id: broadcasterId }
            }
        ];

        for (const event of events) {
            try {
                const result = await this.apiRequest('/eventsub/subscriptions', 'POST', {
                    type: event.type,
                    version: event.version,
                    condition: event.condition,
                    transport: {
                        method: 'webhook',
                        callback: `${process.env.WEBHOOK_URL || 'http://localhost:3000'}/twitch/webhook`,
                        secret: this.config.webhookSecret
                    }
                });

                this.subscriptions.set(`${event.type}_${broadcasterId}`, result.data[0].id);
                console.log(`✅ Subscribed to ${event.type}`);
            } catch (error) {
                console.error(`❌ Failed to subscribe to ${event.type}:`, error.message);
            }
        }
    }

    /**
     * Verify Twitch webhook signature
     */
    verifyWebhookSignature(message, signature, secret) {
        const expectedSignature = 'sha256=' + crypto
            .createHmac('sha256', secret)
            .update(message)
            .digest('hex');

        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    }

    /**
     * Handle incoming webhook event
     */
    async handleWebhook(event, body) {
        const messageId = event['Twitch-Eventsub-Message-Id'];
        const messageType = event['Twitch-Eventsub-Message-Type'];

        // Handle verification challenge
        if (messageType === 'webhook_callback_verification') {
            return body.challenge;
        }

        // Handle revocation
        if (messageType === 'notification') {
            // Verify signature (in production)
            this.emit('event', body.event);
            
            // Process based on event type
            await this.processEvent(body.event);
        }

        return 'OK';
    }

    /**
     * Process incoming event and emit specific actions
     */
    async processEvent(event) {
        const { type } = event;

        switch (type) {
            case 'channel.channel_points_custom_reward_redemption.add':
                await this.handleChannelPoints(event);
                break;
                
            case 'channel.cheer':
                await this.handleCheer(event);
                break;
                
            case 'channel.subscription.message':
                await this.handleSubscription(event);
                break;
        }
    }

    /**
     * Handle channel points redemption
     */
    async handleChannelPoints(event) {
        const { user_id, user_name, reward, user_input } = event;
        
        console.log(`🎮 Channel Points: ${user_name} redeemed "${reward.title}"`);

        // Emit event for game queue system
        this.emit('gameRequest', {
            userId: user_id,
            username: user_name,
            type: 'channel_points',
            cost: reward.cost,
            input: user_input || '',
            redemptionId: event.id
        });
    }

    /**
     * Handle Bits cheer
     */
    async handleCheer(event) {
        const { user_id, user_name, bits, message } = event;
        
        console.log(`💰 Cheer: ${user_name} sent ${bits} bits`);

        // Emit event for bonus game plays
        this.emit('bitsReceived', {
            userId: user_id,
            username: user_name,
            bits: bits,
            message: message
        });
    }

    /**
     * Handle subscription
     */
    async handleSubscription(event) {
        const { user_id, user_name, tier, message } = event;
        
        console.log(`🎉 Subscription: ${user_name} subscribed (Tier ${tier})`);

        // Emit event for bonus plays
        this.emit('subReceived', {
            userId: user_id,
            username: user_name,
            tier: tier,
            message: message
        });
    }

    /**
     * Create a game session for a user
     */
    createGameSession(userId, username, options = {}) {
        const session = {
            userId,
            username,
            startTime: Date.now(),
            duration: options.duration || 60000, // 60 seconds default
            maxPlays: options.maxPlays || 1,
            playsUsed: 0,
            status: 'waiting', // waiting, active, completed, expired
            queuePosition: null
        };

        this.gameSessions.set(userId, session);
        return session;
    }

    /**
     * Get active session for user
     */
    getActiveSession(userId) {
        return this.gameSessions.get(userId);
    }

    /**
     * Check if user can play
     */
    canPlay(userId) {
        const session = this.gameSessions.get(userId);
        if (!session) return false;
        if (session.status !== 'active') return false;
        if (session.playsUsed >= session.maxPlays) return false;
        if (Date.now() > session.startTime + session.duration) {
            session.status = 'expired';
            return false;
        }
        return true;
    }

    /**
     * Record a play
     */
    recordPlay(userId) {
        const session = this.gameSessions.get(userId);
        if (session) {
            session.playsUsed++;
            if (session.playsUsed >= session.maxPlays) {
                session.status = 'completed';
            }
        }
    }

    /**
     * Get user info
     */
    async getUserInfo(username) {
        return this.apiRequest(`/users?login=${username}`);
    }

    /**
     * Send chat message
     */
    async sendMessage(channelId, message) {
        return this.apiRequest('/chat/_messages', 'POST', {
            broadcaster_id: channelId,
            sender_id: process.env.TWITCH_BOT_ID,
            message: message
        });
    }

    /**
     * Get channel info
     */
    async getChannelInfo(broadcasterId) {
        return this.apiRequest(`/channels?broadcaster_id=${broadcasterId}`);
    }

    /**
     * Moderate chat
     */
    async deleteMessage(broadcasterId, messageId) {
        return this.apiRequest('/moderation/enforcements/delete', 'POST', {
            broadcaster_id: broadcasterId,
            message_id: messageId
        });
    }

    /**
     * Get dashboard stats
     */
    getDashboardStats() {
        const stats = {
            activeSessions: 0,
            totalSessions: this.gameSessions.size,
            subscriptions: this.subscriptions.size,
            timestamp: Date.now()
        };

        for (const session of this.gameSessions.values()) {
            if (session.status === 'active') {
                stats.activeSessions++;
            }
        }

        return stats;
    }
}

module.exports = { TwitchIntegration, TWITCH_CONFIG };
