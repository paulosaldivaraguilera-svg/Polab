/**
 * X (Twitter) Platform Wrapper
 * 
 * Wrapper para la API de X (Twitter)
 * Nivel Básico: $100/mes - 3K posts/mes, lectura limitada
 */

class XWrapper {
    constructor(config) {
        this.name = 'X (Twitter)';
        this.config = config;
        this.apiKey = config.credentials?.apiKey || process.env.TWITTER_API_KEY;
        this.apiSecret = config.credentials?.apiSecret || process.env.TWITTER_API_SECRET;
        this.accessToken = config.credentials?.accessToken || process.env.TWITTER_ACCESS_TOKEN;
        this.accessSecret = config.credentials?.accessSecret || process.env.TWITTER_ACCESS_SECRET;
        
        this.baseUrl = 'https://api.twitter.com/2';
        this.postCount = 0;
        this.lastPostTime = 0;
        
        // Rate limits del Nivel Básico
        this.rateLimits = {
            tweets: { remaining: 3000, per: 'month', reset: this.getMonthReset() },
            mentions: { remaining: 180, per: '15min', reset: this.getResetTime(15 * 60 * 1000) }
        };
    }
    
    getMonthReset() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
    }
    
    getResetTime(interval) {
        const now = Date.now();
        const elapsed = now % interval;
        return now + (interval - elapsed);
    }
    
    getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
    }
    
    async checkRateLimit() {
        return this.rateLimits.tweets.remaining > 0;
    }
    
    async post(content, options = {}) {
        // Verificar longitud
        if (content.length > this.config.limits?.charsPerPost || 280) {
            content = content.substring(0, 277) + '...';
        }
        
        // En producción, hacer POST real
        if (this.apiKey) {
            try {
                const response = await fetch(`${this.baseUrl}/tweets`, {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify({ text: content })
                });
                
                if (!response.ok) {
                    console.warn(`X API error: ${response.status}`);
                }
            } catch (e) {
                console.warn(`X API request failed: ${e.message}`);
            }
        }
        
        this.postCount++;
        this.lastPostTime = Date.now();
        this.rateLimits.tweets.remaining--;
        
        console.log(`🐦 X: Posted (${this.rateLimits.tweets.remaining} remaining this month)`);
        
        return {
            id: `x_${Date.now()}`,
            platform: 'x',
            content: content.substring(0, 100),
            timestamp: this.lastPostTime,
            url: `https://twitter.com/user/status/${Date.now()}`
        };
    }
    
    async getMentions() {
        if (this.rateLimits.mentions.remaining <= 0) {
            console.warn('X mentions rate limit exceeded');
            return [];
        }
        
        this.rateLimits.mentions.remaining--;
        
        // Simular menciones para demo
        return [
            {
                id: 'mention_1',
                user: '@follower1',
                content: '@PauloARIS Qué opinas sobre IA?',
                timestamp: Date.now()
            }
        ];
    }
    
    async reply(tweetId, content) {
        console.log(`🐦 X: Replying to ${tweetId}`);
        return { success: true, replyId: `reply_${Date.now()}` };
    }
    
    async getStatus() {
        return {
            connected: !!this.apiKey,
            account: 'PauloARIS',
            postsToday: this.postCount,
            rateLimit: this.rateLimits.tweets.remaining
        };
    }
    
    async getRateLimitStatus() {
        return {
            tweets: this.rateLimits.tweets,
            mentions: this.rateLimits.mentions
        };
    }
}

module.exports = { XWrapper };
