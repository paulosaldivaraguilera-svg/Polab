/**
 * Rate Limiting Middleware para APIs
 * 
 * Características:
 * - Limitar requests por IP
 * - Ventanas de tiempo configurables
 * - Headers de rate limit
 */

const RATE_LIMIT_CONFIG = {
    windowMs: 60 * 1000,        // 1 minuto
    maxRequests: 30,            // 30 requests por minuto
    skipFailedRequests: false,  // Contar requests fallidos
    keyGenerator: (req) => req.ip || req.connection.remoteAddress
};

class RateLimiter {
    constructor(config = RATE_LIMIT_CONFIG) {
        this.config = config;
        this.windows = new Map(); // ip -> { count, startTime }
    }
    
    middleware() {
        return (req, res, next) => {
            const key = this.config.keyGenerator(req);
            const now = Date.now();
            
            // Obtener o crear ventana
            let window = this.windows.get(key);
            
            if (!window || (now - window.startTime) > this.config.windowMs) {
                window = { count: 0, startTime: now };
                this.windows.set(key, window);
            }
            
            // Verificar límite
            window.count++;
            
            const remaining = Math.max(0, this.config.maxRequests - window.count);
            const resetTime = Math.ceil((window.startTime + this.config.windowMs) / 1000);
            
            // Headers de rate limit
            res.setHeader('X-RateLimit-Limit', this.config.maxRequests);
            res.setHeader('X-RateLimit-Remaining', remaining);
            res.setHeader('X-RateLimit-Reset', resetTime);
            
            // Verificar si excedió
            if (window.count > this.config.maxRequests) {
                res.setHeader('Retry-After', Math.ceil((window.startTime + this.config.windowMs - now) / 1000));
                
                return res.status(429).json({
                    error: 'Too Many Requests',
                    message: 'Rate limit exceeded. Please try again later.',
                    retryAfter: Math.ceil((window.startTime + this.config.windowMs - now) / 1000)
                });
            }
            
            next();
        };
    }
    
    // Limitar por endpoint específico
    createLimiter(path, maxRequests, windowMs) {
        const config = { ...this.config, maxRequests, windowMs };
        const limiter = new RateLimiter(config);
        
        return (req, res, next) => {
            if (req.path.startsWith(path)) {
                return limiter.middleware()(req, res, next);
            }
            next();
        };
    }
    
    // Limpiar ventanas expiradas
    cleanup() {
        const now = Date.now();
        for (const [key, window] of this.windows) {
            if ((now - window.startTime) > this.config.windowMs) {
                this.windows.delete(key);
            }
        }
    }
    
    // Obtener estadísticas
    getStats() {
        return {
            activeWindows: this.windows.size,
            totalRequests: Array.from(this.windows.values()).reduce((sum, w) => sum + w.count, 0)
        };
    }
}

// Usage con Express.js
/*
const express = require('express');
const app = express();

const limiter = new RateLimiter();
app.use(limiter.middleware());

// Endpoints específicos con límites diferentes
app.use('/api/leads', limiter.createLimiter('/api/leads', 10, 60 * 1000));
app.use('/api/metrics', limiter.createLimiter('/api/metrics', 30, 60 * 1000));
*/

module.exports = { RateLimiter, RATE_LIMIT_CONFIG };
