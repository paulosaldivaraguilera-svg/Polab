/**
 * OpenClaw Services - Game Queue & Session Manager
 * 
 * Manages player queue, session limits, and game state
 */

const crypto = require('crypto');

class GameQueueManager {
    constructor(config = {}) {
        this.config = {
            maxConcurrentPlayers: config.maxConcurrentPlayers || 3,
            sessionDuration: config.sessionDuration || 60000, // 60 seconds
            maxPlaysPerSession: config.maxPlaysPerSession || 1,
            queueTimeout: config.queueTimeout || 300000, // 5 minutes
            priorityMultiplier: config.priorityMultiplier || {
                bits: 1,           // 1 bit = 1 point
                subscription: 10,  // Sub = 10 points
                donation: 5        // $1 = 5 points
            },
            ...config
        };

        this.queue = []; // Waiting players
        this.activeSessions = new Map(); // userId -> session
        this.completedGames = []; // History
        this.waitingPlayers = new Map(); // userId -> wait start time
        this.playerStats = new Map(); // userId -> lifetime stats
        
        this.stats = {
            totalPlayers: 0,
            totalPlays: 0,
            totalWins: 0,
            avgWaitTime: 0,
            queueLength: 0
        };
    }

    /**
     * Add player to queue
     */
    enqueue(userId, username, priority = 0, metadata = {}) {
        // Check if already in queue or playing
        if (this.isInQueue(userId) || this.hasActiveSession(userId)) {
            return { success: false, reason: 'already_in_queue' };
        }

        const player = {
            userId,
            username,
            priority: this.calculatePriority(userId, priority),
            joinedAt: Date.now(),
            playsRemaining: metadata.plays || this.config.maxPlaysPerSession,
            metadata: metadata
        };

        // Insert based on priority (higher priority = earlier in queue)
        const insertIndex = this.queue.findIndex(p => p.priority < player.priority);
        if (insertIndex === -1) {
            this.queue.push(player);
        } else {
            this.queue.splice(insertIndex, 0, player);
        }

        this.waitingPlayers.set(userId, Date.now());
        this.stats.queueLength = this.queue.length;

        console.log(`🎮 ${username} joined queue (position: ${insertIndex + 1})`);

        return {
            success: true,
            position: insertIndex + 1,
            estimatedWait: this.estimateWaitTime(insertIndex)
        };
    }

    /**
     * Calculate player priority score
     */
    calculatePriority(userId, basePriority = 0) {
        const stats = this.playerStats.get(userId) || {
            totalPlays: 0,
            wins: 0,
            bitsSpent: 0,
            isSubscriber: false,
            isVip: false,
            isModerator: false
        };

        // Base priority + stat bonuses
        let priority = basePriority;

        // Subscriber bonus
        if (stats.isSubscriber) priority += 100;

        // VIP bonus
        if (stats.isVip) priority += 50;

        // Moderator bonus (lower priority to let others play first)
        if (stats.isModerator) priority += 10;

        // Losing streak bonus (give chance to win)
        const lossStreak = stats.totalPlays - stats.wins;
        if (lossStreak > 5) priority += 10;

        // Rare player bonus (first time in a while)
        const lastPlay = stats.lastPlayAt || 0;
        const daysSinceLastPlay = (Date.now() - lastPlay) / (1000 * 60 * 60 * 24);
        if (daysSinceLastPlay > 7) priority += 20;

        return priority;
    }

    /**
     * Get next player from queue
     */
    dequeue() {
        if (this.queue.length === 0) return null;

        const player = this.queue.shift();
        this.waitingPlayers.delete(player.userId);

        // Create active session
        const session = this.createSession(player);
        this.stats.queueLength = this.queue.length;

        return session;
    }

    /**
     * Create an active game session
     */
    createSession(player) {
        const sessionId = crypto.randomUUID();
        const session = {
            sessionId,
            userId: player.userId,
            username: player.username,
            startTime: Date.now(),
            expiresAt: Date.now() + this.config.sessionDuration,
            playsRemaining: player.playsRemaining,
            status: 'active',
            queuePosition: null,
            winCount: 0,
            playHistory: []
        };

        this.activeSessions.set(player.userId, session);
        this.stats.totalPlayers++;

        // Update player stats
        this.updatePlayerStats(player.userId, { lastPlayAt: Date.now() });

        return session;
    }

    /**
     * Get session for user
     */
    getSession(userId) {
        return this.activeSessions.get(userId);
    }

    /**
     * Check if user has active session
     */
    hasActiveSession(userId) {
        const session = this.activeSessions.get(userId);
        return session && session.status === 'active';
    }

    /**
     * Check if user is in queue
     */
    isInQueue(userId) {
        return this.queue.some(p => p.userId === userId);
    }

    /**
     * Remove player from queue
     */
    removeFromQueue(userId) {
        const index = this.queue.findIndex(p => p.userId === userId);
        if (index !== -1) {
            this.queue.splice(index, 1);
            this.waitingPlayers.delete(userId);
            this.stats.queueLength = this.queue.length;
            return true;
        }
        return false;
    }

    /**
     * Use a play in the session
     */
    usePlay(userId) {
        const session = this.activeSessions.get(userId);
        if (!session) return { success: false, reason: 'no_session' };

        session.playsRemaining--;
        session.playHistory.push({
            at: Date.now(),
            playsRemaining: session.playsRemaining
        });

        this.stats.totalPlays++;

        if (session.playsRemaining <= 0) {
            session.status = 'completed';
            this.completedGames.push({
                ...session,
                completedAt: Date.now()
            });
            this.activeSessions.delete(userId);
        }

        return { success: true, playsRemaining: session.playsRemaining };
    }

    /**
     * Record a win
     */
    recordWin(userId, prize) {
        const session = this.activeSessions.get(userId);
        if (!session) return { success: false, reason: 'no_session' };

        session.winCount++;
        this.stats.totalWins++;

        // Update player stats
        this.updatePlayerStats(userId, {
            wins: (this.playerStats.get(userId)?.wins || 0) + 1,
            lastWinAt: Date.now()
        });

        // Add to completed games
        this.completedGames.push({
            ...session,
            won: true,
            prize: prize,
            wonAt: Date.now()
        });

        // Remove session if no plays remaining
        if (session.playsRemaining <= 0) {
            session.status = 'completed';
            this.activeSessions.delete(userId);
        }

        return { success: true, totalWins: session.winCount };
    }

    /**
     * Update player statistics
     */
    updatePlayerStats(userId, updates) {
        if (!this.playerStats.has(userId)) {
            this.playerStats.set(userId, {
                totalPlays: 0,
                wins: 0,
                bitsSpent: 0,
                isSubscriber: false,
                isVip: false,
                isModerator: false,
                firstPlayAt: null,
                lastPlayAt: null,
                lastWinAt: null,
                ...updates
            });
        } else {
            const current = this.playerStats.get(userId);
            this.playerStats.set(userId, { ...current, ...updates });
        }
    }

    /**
     * Set player attributes
     */
    setPlayerAttribute(userId, attribute, value) {
        const stats = this.playerStats.get(userId) || {};
        stats[attribute] = value;
        this.playerStats.set(userId, stats);
    }

    /**
     * Estimate wait time based on queue position
     */
    estimateWaitTime(position) {
        const avgSessionTime = this.config.sessionDuration;
        const activePlayers = this.activeSessions.size;
        const effectivePosition = Math.max(0, position - (this.config.maxConcurrentPlayers - activePlayers));
        
        return effectivePosition * avgSessionTime;
    }

    /**
     * Get current queue status
     */
    getQueueStatus() {
        return {
            waiting: this.queue.length,
            playing: this.activeSessions.size,
            maxConcurrent: this.config.maxConcurrentPlayers,
            estimatedNextPlayer: this.queue[0]?.username || null,
            timestamp: Date.now()
        };
    }

    /**
     * Get full dashboard
     */
    getDashboard() {
        const waitTimes = Array.from(this.waiting.values());
        const avgWait = waitTimes.length > 0
            ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length
            : 0;

        return {
            queue: {
                waiting: this.queue.length,
                players: this.queue.map(p => ({
                    username: p.username,
                    position: this.queue.indexOf(p) + 1,
                    priority: p.priority
                }))
            },
            activeSessions: Array.from(this.activeSessions.entries()).map(([userId, session]) => ({
                username: session.username,
                playsRemaining: session.playsRemaining,
                timeRemaining: Math.max(0, session.expiresAt - Date.now()),
                winCount: session.winCount
            })),
            stats: {
                ...this.stats,
                avgWaitTime: avgWait,
                winRate: this.stats.totalPlays > 0
                    ? (this.stats.totalWins / this.stats.totalPlays * 100).toFixed(1) + '%'
                    : '0%'
            },
            leaderboard: this.getLeaderboard(10),
            timestamp: Date.now()
        };
    }

    /**
     * Get leaderboard
     */
    getLeaderboard(limit = 10) {
        return Array.from(this.playerStats.entries())
            .sort((a, b) => b[1].wins - a[1].wins)
            .slice(0, limit)
            .map(([userId, stats]) => ({
                userId,
                username: this.getUsernameById(userId) || 'Unknown',
                wins: stats.wins,
                totalPlays: stats.totalPlays,
                winRate: stats.totalPlays > 0
                    ? (stats.wins / stats.totalPlays * 100).toFixed(1) + '%'
                    : '0%'
            }));
    }

    /**
     * Helper to get username (would normally query database)
     */
    getUsernameById(userId) {
        // Check active sessions
        const session = this.activeSessions.get(userId);
        if (session) return session.username;

        // Check queue
        const queued = this.queue.find(p => p.userId === userId);
        if (queued) return queued.username;

        return null;
    }

    /**
     * Clean up expired sessions
     */
    cleanup() {
        const now = Date.now();
        let cleaned = 0;

        for (const [userId, session] of this.activeSessions.entries()) {
            if (session.expiresAt < now) {
                session.status = 'expired';
                this.completedGames.push({
                    ...session,
                    completedAt: now,
                    expired: true
                });
                this.activeSessions.delete(userId);
                cleaned++;
            }
        }

        // Clean up queue timeout
        for (const player of [...this.queue]) {
            if (now - player.joinedAt > this.config.queueTimeout) {
                this.removeFromQueue(player.userId);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`🧹 Cleaned ${cleaned} expired sessions`);
        }

        return cleaned;
    }

    /**
     * Start cleanup interval
     */
    startCleanupInterval(intervalMs = 30000) {
        return setInterval(() => this.cleanup(), intervalMs);
    }
}

module.exports = { GameQueueManager };
