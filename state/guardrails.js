/**
 * Content Guardrails System
 * 
 * Sistema de seguridad para agentes sociales:
 * - Detección de toxicidad
 * - Prevención de jailbreak
 * - Validación de brand safety
 * - Verificación factual
 */

class Guardrails {
    constructor(config = {}) {
        this.bannedPatterns = [
            /jailbreak|ignore.*instructions|system.*prompt/i,
            /kill|murder|attack/i,
            /password|secret|api[_-]?key/i,
            /.*\$€£¥.*(bitcoin|eth|crypto|wallet)/i
        ];

        this.toxicityPatterns = {
            hate: /\b(bad|terrible|horrible|awful|worst|disgusting|stupid|idiot|dumb)\b/i,
            harassment: /\b(stupid|idiot|dumb|ugly|fat|lazy)\b/i,
            violence: /\b(kill|murder|hurt|injure|attack|hit|beat)\b/i,
            selfharm: /\b(suicide|kill.*self|end.*life)\b/i,
            sexual: /\b(sex|xxx|porn|nude|erotic)\b/i
        };

        this.brandSafety = {
            prohibitedTopics: ['politics', 'religion', 'controversy'],
            tone: {
                minComplexity: 0.3,
                maxEmotional: 0.7
            }
        };

        this.cache = new Map();  // Cache de verificaciones
    }

    // Verificar contenido antes de publicar
    async check(content, context = {}) {
        const cacheKey = this.hash(content);
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const results = {
            passed: true,
            issues: [],
            warnings: [],
            score: 1.0,
            timestamp: Date.now()
        };

        // 1. Detección de jailbreak
        const jailbreak = await this.detectJailbreak(content);
        if (jailbreak.detected) {
            results.passed = false;
            results.issues.push({ type: 'jailbreak', message: jailbreak.message });
        }

        // 2. Detección de toxicidad
        const toxicity = await this.detectToxicity(content);
        if (toxicity.level === 'high') {
            results.passed = false;
            results.issues.push({ type: 'toxicity', level: toxicity.level });
        } else if (toxicity.level === 'medium') {
            results.warnings.push({ type: 'toxicity', message: 'Potentially sensitive language' });
            results.score *= 0.8;
        }

        // 3. Validación de brand safety
        const brandSafety = await this.checkBrandSafety(content, context);
        if (!brandSafety.safe) {
            results.warnings.push({ type: 'brand', issues: brandSafety.issues });
            results.score *= 0.9;
        }

        // 4. Verificación factual básica
        const factual = await this.checkFactualAccuracy(content);
        if (!factual.accurate) {
            results.warnings.push({ type: 'factual', message: 'Unverified claims detected' });
        }

        // 5. Verificación de longitud y formato
        const format = this.checkFormat(content);
        if (!format.valid) {
            results.warnings.push({ type: 'format', message: format.message });
        }

        // Cache por 5 minutos
        this.cache.set(cacheKey, results);
        setTimeout(() => this.cache.delete(cacheKey), 300000);

        return results;
    }

    async detectJailbreak(content) {
        for (const pattern of this.bannedPatterns) {
            if (pattern.test(content)) {
                return {
                    detected: true,
                    message: 'Potential jailbreak attempt detected'
                };
            }
        }
        return { detected: false };
    }

    async detectToxicity(content) {
        let score = 0;
        let triggered = [];

        for (const [category, pattern] of Object.entries(this.toxicityPatterns)) {
            const matches = content.match(pattern);
            if (matches) {
                score += matches.length * 0.2;
                triggered.push(category);
            }
        }

        if (score >= 1) {
            return { level: 'high', score, triggered };
        } else if (score >= 0.3) {
            return { level: 'medium', score, triggered };
        }
        return { level: 'low', score };
    }

    async checkBrandSafety(content, context) {
        const issues = [];
        
        // Verificar temas prohibidos
        for (const topic of this.brandSafety.prohibitedTopics) {
            if (content.toLowerCase().includes(topic)) {
                issues.push(`Sensitive topic: ${topic}`);
            }
        }

        return {
            safe: issues.length === 0,
            issues
        };
    }

    async checkFactualAccuracy(content) {
        // Verificación básica de afirmaciones
        const claims = this.extractClaims(content);
        const verified = [];

        for (const claim of claims) {
            // Simulación - en producción usar verificación de hechos real
            if (claim.includes('%') || claim.includes('million') || claim.includes('billion')) {
                // Claims numéricos necesitan fuentes
                verified.push({ claim, verified: false, reason: 'Numeric claim needs citation' });
            } else {
                verified.push({ claim, verified: true });
            }
        }

        return {
            claims: verified,
            accurate: verified.every(v => v.verified)
        };
    }

    extractClaims(content) {
        // Extraer oraciones que parecen afirmaciones
        return content
            .split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length > 20 && (s.includes('is') || s.includes('are') || s.includes('%')));
    }

    checkFormat(content) {
        // Validaciones de formato para redes sociales
        if (content.length > 280) {
            return { valid: false, message: 'Exceeds character limit (280)' };
        }
        if (content.includes('http://')) {
            return { valid: false, message: 'Use HTTPS for links' };
        }
        return { valid: true };
    }

    hash(content) {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    // Rewrite automático para contenido problematico
    async rewrite(content, issues) {
        let rewritten = content;

        // Remover URLs cortas o acortadas
        rewritten = rewritten.replace(/https?:\/\/\S+/g, '[link]');

        // Neutralizar lenguaje sensible
        for (const [category, pattern] of Object.entries(this.toxicityPatterns)) {
            rewritten = rewritten.replace(pattern, '[sensitive content redacted]');
        }

        return rewritten;
    }
}

// Sistema de logging para compliance
class AuditLogger {
    constructor(config = {}) {
        this.logs = [];
        this.retentionDays = config.retentionDays || 90;
    }

    async log(event) {
        const entry = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            eventType: event.type,
            content: event.content,
            result: event.result,
            agentId: event.agentId || 'default',
            platform: event.platform || 'unknown',
            userId: event.userId || null
        };

        this.logs.push(entry);

        // En producción: enviar a base de datos
        console.log(`[AUDIT] ${entry.eventType}: ${entry.result.passed ? 'PASSED' : 'BLOCKED'}`);

        return entry;
    }

    async getLogs(filters = {}) {
        let filtered = [...this.logs];
        
        if (filters.eventType) {
            filtered = filtered.filter(l => l.eventType === filters.eventType);
        }
        if (filters.platform) {
            filtered = filtered.filter(l => l.platform === filters.platform);
        }
        if (filters.startDate) {
            filtered = filtered.filter(l => new Date(l.timestamp) >= new Date(filters.startDate));
        }

        return filtered.slice(-1000);  // Últimos 1000
    }
}

module.exports = { Guardrails, AuditLogger };
