/**
 * Moltbook Platform Wrapper
 * 
 * Wrapper para Moltbook (red social chilena)
 * API: moltbook_sk_ON33XvdPjQEmjizLBQxqCejXYL2pYIyP
 * Rate limit: 1 post / 30 minutos
 */

class MoltbookWrapper {
    constructor(config) {
        this.name = 'Moltbook';
        this.config = config;
        this.apiKey = config.credentials?.apiKey || process.env.MOLTBOOK_API_KEY;
        this.baseUrl = 'https://www.moltbook.com/api/v1';

        this.postCount = 0;
        this.lastPostTime = 0;

        // Rate limits específicos de Moltbook
        this.rateLimits = {
            posts: { remaining: 48, per: 'day', reset: this.getDayReset() },
            requests: { remaining: 100, per: 'minute', reset: this.getResetTime(60 * 1000) }
        };
    }
    
    getDayReset() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0).getTime();
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

    generateTitle(content) {
        // Extraer primera línea o primeras 50 caracteres como título
        const firstLine = content.split('\n')[0].trim();
        if (firstLine.length <= 60) {
            return firstLine;
        }
        return firstLine.substring(0, 60) + '...';
    }
    
    async checkRateLimit() {
        const now = Date.now();
        const minInterval = 30 * 60 * 1000; // 30 minutos
        return (now - this.lastPostTime) > minInterval && this.rateLimits.posts.remaining > 0;
    }
    
    async post(content, options = {}) {
        const now = Date.now();

        if (!await this.checkRateLimit()) {
            const waitTime = 30 * 60 * 1000 - (now - this.lastPostTime);
            console.log(`⏳ Moltbook: Esperando ${Math.ceil(waitTime / 60000)} minutos`);
            return { success: false, reason: 'Rate limit' };
        }

        // Verificar longitud
        const maxChars = this.config.limits?.charsPerPost || 500;
        if (content.length > maxChars) {
            content = content.substring(0, maxChars - 3) + '...';
        }

        // Preparar payload - Moltbook API requiere title y submolt
        const payload = {
            submolt: options.submolt || 'general',
            title: options.title || this.generateTitle(content),
            content: content
        };

        // Hacer POST real a la API de Moltbook
        if (this.apiKey) {
            try {
                console.log(`📚 Moltbook: Publicando post a API real...`);
                const response = await fetch(`${this.baseUrl}/posts`, {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ Moltbook: Post publicado exitosamente (ID: ${data.post?.id || data.id || 'N/A'})`);
                    this.postCount++;
                    this.lastPostTime = now;
                    this.rateLimits.posts.remaining--;
                    return {
                        success: true,
                        id: data.post?.id || data.id,
                        platform: 'moltbook',
                        content: content,
                        timestamp: now,
                        url: data.post?.url || `https://www.moltbook.com/posts/${data.post?.id || data.id}`
                    };
                } else {
                    const errorText = await response.text();
                    console.error(`❌ Moltbook API error: ${response.status} - ${errorText}`);
                    return { success: false, reason: `API error: ${response.status}`, details: errorText };
                }
            } catch (e) {
                console.error(`❌ Moltbook API request failed: ${e.message}`);
                return { success: false, reason: 'Request failed', error: e.message };
            }
        } else {
            console.warn(`⚠️ Moltbook: Sin API key configurada - usando modo simulación`);
            // Modo simulación (sin API key)
            this.postCount++;
            this.lastPostTime = now;
            this.rateLimits.posts.remaining--;
            return {
                id: `moltbook_${Date.now()}`,
                platform: 'moltbook',
                content: content.substring(0, 100),
                timestamp: now,
                url: `https://www.moltbook.com/u/PauloARIS/post/${Date.now()}`,
                simulated: true
            };
        }
    }
    
    async getMentions() {
        // Moltbook no tiene menciones tradicionales
        return [];
    }
    
    async getNotifications() {
        return {
            notifications: [],
            unread: 0
        };
    }
    
    async reply(postId, content) {
        console.log(`📚 Moltbook: Replying to ${postId}`);
        return { success: true };
    }
    
    async getTimeline() {
        return {
            posts: [],
            hasMore: false
        };
    }
    
    async getStatus() {
        return {
            connected: !!this.apiKey,
            account: 'PauloARIS',
            profileUrl: 'https://www.moltbook.com/u/PauloARIS',
            postsToday: this.postCount,
            postsRemaining: this.rateLimits.posts.remaining,
            nextPostAvailable: this.lastPostTime + 30 * 60 * 1000
        };
    }
    
    async getRateLimitStatus() {
        return {
            posts: this.rateLimits.posts,
            requests: this.rateLimits.requests
        };
    }
}

module.exports = { MoltbookWrapper };
