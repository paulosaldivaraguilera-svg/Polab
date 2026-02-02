/**
 * Simple Cache System (Redis-like)
 * 
 * Características:
 * - Cache con TTL (Time To Live)
 * - LRU eviction
 * - Serialización JSON
 */

class SimpleCache {
    constructor(config = {}) {
        this.maxSize = config.maxSize || 1000;
        this.defaultTTL = config.defaultTTL || 3600000; // 1 hora
        this.store = new Map();
        this.accessOrder = [];
    }
    
    // Set value with optional TTL
    set(key, value, ttl = null) {
        const now = Date.now();
        const expiry = ttl ? now + ttl : now + this.defaultTTL;
        
        const entry = {
            value,
            expiry,
            createdAt: now,
            accessedAt: now
        };
        
        // Evict if needed
        if (this.store.size >= this.maxSize) {
            this.evict();
        }
        
        this.store.set(key, entry);
        this.accessOrder.push(key);
        
        return true;
    }
    
    // Get value
    get(key) {
        const entry = this.store.get(key);
        
        if (!entry) {
            return null;
        }
        
        if (Date.now() > entry.expiry) {
            this.store.delete(key);
            this.accessOrder = this.accessOrder.filter(k => k !== key);
            return null;
        }
        
        entry.accessedAt = Date.now();
        return entry.value;
    }
    
    // Get or set (cache-aside)
    async getOrSet(key, fetchFn, ttl = null) {
        const cached = this.get(key);
        if (cached !== null) {
            return cached;
        }
        
        const value = await fetchFn();
        this.set(key, value, ttl);
        return value;
    }
    
    // Delete key
    delete(key) {
        const deleted = this.store.delete(key);
        this.accessOrder = this.accessOrder.filter(k => k !== key);
        return deleted;
    }
    
    // Check if key exists
    has(key) {
        return this.get(key) !== null;
    }
    
    // Clear all
    clear() {
        this.store.clear();
        this.accessOrder = [];
    }
    
    // Evict least recently used
    evict() {
        if (this.accessOrder.length === 0) return;
        
        const oldestKey = this.accessOrder[0];
        this.store.delete(oldestKey);
        this.accessOrder.shift();
    }
    
    // Get stats
    stats() {
        const now = Date.now();
        let expired = 0;
        
        for (const entry of this.store.values()) {
            if (now > entry.expiry) expired++;
        }
        
        return {
            size: this.store.size,
            maxSize: this.maxSize,
            expired,
            hitRate: this.hitRate || 0
        };
    }
    
    // Track hits/misses for hit rate
    trackHit() { this.hits = (this.hits || 0) + 1; }
    trackMiss() { this.misses = (this.misses || 0) + 1; }
    
    get hitRate() {
        const total = (this.hits || 0) + (this.misses || 0);
        return total > 0 ? (this.hits || 0) / total : 0;
    }
    
    // Wrap function with caching
    memoize(fn, keyGenerator, ttl) {
        return async (...args) => {
            const key = keyGenerator(...args);
            const cached = this.get(key);
            if (cached !== null) {
                this.trackHit();
                return cached;
            }
            this.trackMiss();
            const result = await fn(...args);
            this.set(key, result, ttl);
            return result;
        };
    }
}

// Cache middleware para APIs
function cacheMiddleware(cache, ttl = 60000) {
    return (req, res, next) => {
        const cacheKey = req.originalUrl;
        
        const cached = cache.get(cacheKey);
        if (cached) {
            return res.json(cached);
        }
        
        // Override res.json
        const originalJson = res.json.bind(res);
        res.json = (data) => {
            cache.set(cacheKey, data, ttl);
            return originalJson(data);
        };
        
        next();
    };
}

module.exports = { SimpleCache, cacheMiddleware };
