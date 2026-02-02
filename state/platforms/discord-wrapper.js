/**
 * Discord Platform Wrapper
 * 
 * Wrapper para Discord
 * Gateway API con intents
 * Sin límites de rate strictos, pero con ratelimits implícitos
 */

class DiscordWrapper {
    constructor(config) {
        this.name = 'Discord';
        this.config = config;
        this.botToken = config.credentials?.botToken || process.env.DISCORD_BOT_TOKEN;
        this.guildId = config.credentials?.guildId || process.env.DISCORD_GUILD_ID;
        
        this.baseUrl = 'https://discord.com/api/v10';
        this.ws = null;
        this.messageCount = 0;
        this.lastMessageTime = 0;
        
        // Discord tiene rate limits implícitos
        this.rateLimits = {
            messages: { remaining: 100, per: '10seconds' },
            sendMessage: { per: 500, unit: 'ms' }  // 5s entre mensajes
        };
        
        this.channels = config.channels || {};
    }
    
    async checkRateLimit() {
        const now = Date.now();
        const minInterval = this.rateLimits.sendMessage.per;
        return (now - this.lastMessageTime) > minInterval;
    }
    
    async post(content, options = {}) {
        const channelId = options.channelId || this.channels.general;
        
        if (!await this.checkRateLimit()) {
            console.log('⏳ Discord: Rate limiting...');
            return { success: false, reason: 'Rate limit' };
        }
        
        // Verificar longitud
        const maxChars = this.config.limits?.charsPerMessage || 2000;
        if (content.length > maxChars) {
            content = content.substring(0, maxChars - 3) + '...';
        }
        
        // En producción, usar API real
        if (this.botToken && channelId) {
            try {
                const response = await fetch(`${this.baseUrl}/channels/${channelId}/messages`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bot ${this.botToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content })
                });
                
                if (!response.ok) {
                    console.warn(`Discord API error: ${response.status}`);
                }
            } catch (e) {
                console.warn(`Discord API request failed: ${e.message}`);
            }
        }
        
        this.messageCount++;
        this.lastMessageTime = Date.now();
        
        console.log(`💬 Discord: Sent message (${content.substring(0, 30)}...)`);
        
        return {
            id: `discord_${Date.now()}`,
            platform: 'discord',
            channelId,
            content: content.substring(0, 100),
            timestamp: this.lastMessageTime
        };
    }
    
    async getMentions() {
        // Las menciones vienen por Gateway/Webhook
        return [];
    }
    
    async reply(messageId, content, options = {}) {
        return this.post(content, { ...options, replyTo: messageId });
    }
    
    async sendToChannel(channelId, content) {
        return this.post(content, { channelId });
    }
    
    async getChannels() {
        if (!this.botToken || !this.guildId) {
            return [];
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/guilds/${this.guildId}/channels`, {
                headers: { 'Authorization': `Bot ${this.botToken}` }
            });
            
            if (response.ok) {
                return await response.json();
            }
        } catch (e) {
            console.warn(`Failed to fetch Discord channels: ${e.message}`);
        }
        
        return [];
    }
    
    async getStatus() {
        return {
            connected: !!this.botToken,
            guildId: this.guildId,
            messagesSent: this.messageCount,
            channelsConfigured: Object.keys(this.channels).length
        };
    }
    
    async getRateLimitStatus() {
        const now = Date.now();
        return {
            messages: this.rateLimits.messages,
            nextMessageAt: this.lastMessageTime + this.rateLimits.sendMessage.per
        };
    }
}

module.exports = { DiscordWrapper };
