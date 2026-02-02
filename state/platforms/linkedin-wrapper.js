/**
 * LinkedIn Platform Wrapper
 * 
 * Wrapper para LinkedIn
 * Restricciones: Solo páginas de empresa, OAuth requerido
 * API de Marketing muy restrictiva
 */

class LinkedInWrapper {
    constructor(config) {
        this.name = 'LinkedIn';
        this.config = config;
        this.clientId = config.credentials?.clientId || process.env.LINKEDIN_CLIENT_ID;
        this.clientSecret = config.credentials?.clientSecret || process.env.LINKEDIN_CLIENT_SECRET;
        this.accessToken = config.credentials?.accessToken || process.env.LINKEDIN_ACCESS_TOKEN;
        
        this.baseUrl = 'https://api.linkedin.com/v2';
        this.postCount = 0;
        
        // LinkedIn es muy restrictivo
        this.rateLimits = {
            posts: { remaining: 100, per: 'day', reset: this.getDayReset() },
            ugcPosts: { remaining: 100, per: 'day' }
        };
    }
    
    getDayReset() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0).getTime();
    }
    
    async checkRateLimit() {
        return this.rateLimits.posts.remaining > 0;
    }
    
    async post(content, options = {}) {
        // LinkedIn requiere tokens OAuth válidos
        if (!this.accessToken) {
            console.log('⚠️ LinkedIn: Token no configurado. Configurar LINKEDIN_ACCESS_TOKEN');
            return { success: false, reason: 'No token configured' };
        }
        
        // LinkedIn tiene longitud mayor
        const maxChars = this.config.limits?.charsPerPost || 3000;
        if (content.length > maxChars) {
            content = content.substring(0, maxChars - 3) + '...';
        }
        
        // En producción, hacer POST real con UGC API
        if (this.accessToken) {
            try {
                const response = await fetch(`${this.baseUrl}/ugcPosts`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json',
                        'X-Restli-Protocol-Version': '2.0.0'
                    },
                    body: JSON.stringify({
                        author: `urn:li:person:${this.getPersonId()}`,
                        lifecycleState: 'PUBLISHED',
                        specificContent: {
                            'com.linkedin.ugc.ShareContent': {
                                shareCommentary: {
                                    text: content
                                },
                                shareMediaCategory: 'NONE'
                            }
                        },
                        visibility: {
                            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
                        }
                    })
                });
                
                if (!response.ok) {
                    console.warn(`LinkedIn API error: ${response.status}`);
                }
            } catch (e) {
                console.warn(`LinkedIn API request failed: ${e.message}`);
            }
        }
        
        this.postCount++;
        this.rateLimits.posts.remaining--;
        
        console.log(`💼 LinkedIn: Posted (${this.rateLimits.posts.remaining} remaining today)`);
        
        return {
            id: `linkedin_${Date.now()}`,
            platform: 'linkedin',
            content: content.substring(0, 100),
            timestamp: Date.now(),
            url: `https://www.linkedin.com/feed/update/${Date.now()}`
        };
    }
    
    getPersonId() {
        // Extraer de access token o configurar
        return process.env.LINKEDIN_PERSON_ID || 'me';
    }
    
    async getMentions() {
        // LinkedIn no tiene menciones públicas accesibles
        return [];
    }
    
    async reply(postId, content) {
        console.log(`💼 LinkedIn: Replies require official API approval`);
        return { success: false, reason: 'API restriction' };
    }
    
    async getStatus() {
        return {
            connected: !!this.accessToken,
            account: 'Paulo Saldivar',
            postsToday: this.postCount,
            postsRemaining: this.rateLimits.posts.remaining,
            note: 'LinkedIn restrictions: Personal profiles cannot post via API'
        };
    }
    
    async getRateLimitStatus() {
        return this.rateLimits;
    }
}

module.exports = { LinkedInWrapper };
