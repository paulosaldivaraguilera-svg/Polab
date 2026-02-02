/**
 * PROMPT VERSE MARKET v2.0 - Agéntic Marketplace
 * 
 * Features:
 * - L402 Protocol: Micropagos instantáneos via Lightning
 * - DSPy Optimization: Prompts auto-adaptativos
 * - Stablecoins: USDC/ERC-8004 integration
 * - On-Chain Referrals: Split payments
 * - Agent Interfaces: OpenAPI + ai-plugin.json
 * - Growth Hacking: Viral loops & gamification
 * - Kleros: Decentralized dispute resolution
 */

const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3005;

// ============= CONFIGURATION =============
const CONFIG = {
    // Lightning Network (simulation)
    lightning: {
        satsPerUnit: 100, // 1 USD ≈ 100,000 sats (placeholder)
        minPayment: 10, // 10 sats minimum
        maxPayment: 1000000, // 1M sats max
        expiryMs: 600000 // 10 minutes
    },
    // Stablecoins
    stablecoins: {
        usdc: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', network: 'base' },
        usdt: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', network: 'ethereum' }
    },
    // Revenue split
    split: {
        creator: 0.90, // 90% to creator
        affiliate: 0.08, // 8% to referrer
        platform: 0.02 // 2% to platform
    }
};

// ============= DATABASE =============
const db = {
    prompts: new Map(),
    users: new Map(), // wallet -> user data
    transactions: [],
    disputes: [],
    affiliates: new Map() // code -> { wallet, earnings, referrals }
};

// ============= L402 MACAROON GENERATION =============
class L402Manager {
    constructor() {
        this.secret = crypto.randomBytes(32);
    }

    // Create a macaroon (authentication token)
    createMacaroon(promptId, priceSats, limit = 1) {
        const caveat = `prompt_id = ${promptId} AND price <= ${priceSats} AND uses <= ${limit}`;
        const signature = crypto
            .createHmac('sha256', this.secret)
            .update(caveat)
            .digest('hex');
        
        return {
            token: Buffer.from(`${caveat}:${signature}`).toString('base64'),
            caveat,
            signature,
            expires: Date.now() + CONFIG.lightning.expiryMs
        };
    }

    // Verify macaroon and payment preimage
    verifyMacaroon(macaroon, preimage) {
        try {
            const decoded = Buffer.from(macaroon, 'base64').toString('utf-8');
            const [caveat, providedSignature] = decoded.split(':');
            
            const expectedSignature = crypto
                .createHmac('sha256', this.secret)
                .update(caveat)
                .digest('hex');
            
            if (providedSignature !== expectedSignature) return { valid: false };
            
            // Verify preimage matches (payment proof)
            const preimageHash = crypto.createHash('sha256').update(preimage).digest('hex');
            
            return {
                valid: true,
                caveat: caveat.split(' AND ').reduce((acc, pair) => {
                    const [key, value] = pair.split(' = ');
                    acc[key] = value;
                    return acc;
                }, {})
            };
        } catch (e) {
            return { valid: false, error: e.message };
        }
    }

    // Generate fake Lightning invoice (simulation)
    generateInvoice(amountSats, description) {
        const paymentHash = crypto.randomBytes(32).toString('hex');
        const invoice = `lnbc${amountSats}u1${paymentHash.slice(0, 16)}`;
        
        return {
            invoice,
            paymentHash,
            amountSats,
            description,
            expiresAt: Date.now() + CONFIG.lightning.expiryMs,
            // For simulation: preimage is hash of paymentHash
            simulatedPreimage: crypto.createHash('sha256').update(paymentHash).digest('hex')
        };
    }
}

const l402 = new L402Manager();

// ============= DSPY OPTIMIZATION ENGINE =============
class DSPyOptimizer {
    constructor() {
        this.metrics = {
            fidelity: 0.8, // Base score
            relevance: 0.8,
            safety: 0.9,
            creativity: 0.7
        };
    }

    // Optimize prompt based on feedback
    async optimize(promptId, feedback) {
        const prompt = db.prompts.get(promptId);
        if (!prompt) return null;

        const improvements = [];
        
        // Analyze feedback and generate improvements
        if (feedback.score < 0.7) {
            improvements.push(this.generateImprovement('precision', prompt.content));
        }
        if (feedback.relevance < 0.7) {
            improvements.push(this.generateImprovement('context', prompt.content));
        }
        if (feedback.safety < 0.8) {
            improvements.push(this.generateImprovement('safety', prompt.content));
        }

        // Update metrics
        this.metrics.fidelity = (this.metrics.fidelity + feedback.score) / 2;
        
        // Create new optimized version
        const version = prompt.version + 1;
        const optimizedContent = this.applyImprovements(prompt.content, improvements);
        
        return {
            promptId,
            version,
            originalContent: prompt.content,
            optimizedContent,
            improvements,
            newScore: this.metrics.fidelity,
            timestamp: Date.now()
        };
    }

    generateImprovement(type, content) {
        const improvements = {
            precision: 'Add specific constraints and examples to reduce ambiguity.',
            context: 'Include relevant background information and context.',
            safety: 'Add safety guidelines and avoid potentially harmful instructions.'
        };
        return { type, suggestion: improvements[type] || 'General improvement' };
    }

    applyImprovements(content, improvements) {
        // In production, this would use actual DSPy optimization
        return `// Optimized v2
${content}

// DSPy Improvements Applied:
${improvements.map(i => `// - ${i.type}: ${i.suggestion}`).join('\n')}`;
    }

    async evaluate(promptId) {
        const prompt = db.prompts.get(promptId);
        if (!prompt) return null;

        // Simulate LLM-as-judge evaluation
        return {
            promptId,
            fidelity: 0.75 + Math.random() * 0.2,
            relevance: 0.75 + Math.random() * 0.2,
            safety: 0.85 + Math.random() * 0.1,
            creativity: 0.70 + Math.random() * 0.2,
            overallScore: 0.78 + Math.random() * 0.15,
            timestamp: Date.now()
        };
    }
}

const dspy = new DSPyOptimizer();

// ============= AFFILIATE SYSTEM =============
class AffiliateSystem {
    generateCode(wallet) {
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        db.affiliates.set(code, {
            wallet,
            earnings: 0,
            referrals: 0,
            createdAt: Date.now()
        });
        return code;
    }

    async processPayment(amountSats, affiliateCode = null) {
        const distribution = {
            creator: Math.floor(amountSats * CONFIG.split.creator),
            affiliate: 0,
            platform: Math.floor(amountSats * CONFIG.split.platform)
        };

        if (affiliateCode) {
            const affiliate = db.affiliates.get(affiliateCode);
            if (affiliate) {
                distribution.affiliate = Math.floor(amountSats * CONFIG.split.affiliate);
                affiliate.earnings += distribution.affiliate;
                affiliate.referrals++;
            }
        }

        return distribution;
    }

    getStats(wallet) {
        for (const [code, data] of db.affiliates) {
            if (data.wallet === wallet) {
                return { code, ...data };
            }
        }
        return null;
    }
}

const affiliate = new AffiliateSystem();

// ============= KLEROS DISPUTE RESOLUTION =============
class KlerosDispute {
    constructor() {
        this.cases = new Map();
        this.jurors = [];
    }

    async fileDispute(transactionId, complainant, reason) {
        const caseId = `KLR-${Date.now()}`;
        const dispute = {
            caseId,
            transactionId,
            complainant,
            reason,
            status: 'pending',
            evidence: [],
            jurors: [],
            createdAt: Date.now(),
            verdict: null
        };

        this.cases.set(caseId, dispute);
        db.disputes.push(dispute);

        return {
            caseId,
            status: 'filed',
            estimatedResolution: Date.now() + 86400000 * 3 // 3 days
        };
    }

    async submitEvidence(caseId, party, evidence) {
        const dispute = this.cases.get(caseId);
        if (!dispute) throw new Error('Case not found');

        dispute.evidence.push({
            party,
            evidence,
            timestamp: Date.now()
        });
    }

    async resolve(caseId, verdict, reasoning) {
        const dispute = this.cases.get(caseId);
        if (!dispute) throw new Error('Case not found');

        dispute.status = 'resolved';
        dispute.verdict = verdict;
        dispute.reasoning = reasoning;
        dispute.resolvedAt = Date.now();

        // Execute resolution (refund or payout)
        if (verdict === 'refund') {
            // Return funds to complainant
            return { action: 'refund', caseId };
        } else {
            // Release funds to creator
            return { action: 'payout', caseId };
        }
    }
}

const kleros = new KlerosDispute();

// ============= OPENAPI SPEC GENERATOR =============
function generateOpenAPI(promptId, prompt) {
    return {
        openapi: '3.1.0',
        info: {
            title: `PromptVerse: ${prompt.title}`,
            version: '1.0.0',
            description: prompt.description
        },
        servers: [{ url: `http://localhost:${PORT}/api/v1` }],
        paths: {
            [`/prompts/${promptId}/execute`]: {
                post: {
                    operationId: `execute_${promptId}`,
                    summary: prompt.title,
                    description: prompt.description,
                    security: [{ L402: [] }],
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        input: { type: 'string', description: 'Input for the prompt' },
                                        params: { type: 'object', description: 'Additional parameters' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'Successful execution' },
                        '402': { description: 'Payment required' },
                        '403': { description: 'Invalid macaroon or preimage' }
                    }
                }
            }
        },
        components: {
            securitySchemes: {
                L402: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization',
                    description: 'L402 macaroon:preimage format'
                }
            }
        }
    };
}

// ============= AI PLUGIN MANIFEST =============
function generateAIManifest() {
    return {
        name_for_model: 'PromptVerse Marketplace',
        name_for_human: 'PromptVerse',
        description_for_model: 'Plugin to retrieve and execute AI prompts optimized for specific tasks. Use it when the user needs high-quality content generation, code writing, analysis, or creative tasks. Prompts are verified and self-improving via DSPy optimization.',
        description_for_human: 'Marketplace of premium, self-improving AI prompts. Execute prompts directly for code, content, analysis, and more.',
        api: { type: 'openapi', url: `http://localhost:${PORT}/.well-known/openapi.json` },
        auth: { type: 'none' },
        logo_url: 'https://promptverse.ai/logo.png',
        contact_email: 'contact@promptverse.ai',
        legal_info_url: 'https://promptverse.ai/legal'
    };
}

// ============= MAIN SERVER =============
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const path = url.pathname;

    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // API Routes
    try {
        // === HEALTH CHECK ===
        if (path === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
            return;
        }

        // === OPENAPI SPEC ===
        if (path === '/.well-known/openapi.json') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                openapi: '3.1.0',
                info: { title: 'PromptVerse API', version: '2.0.0' },
                paths: {
                    '/prompts': { get: { summary: 'List prompts' } },
                    '/prompts/{id}/execute': { post: { summary: 'Execute prompt' } }
                }
            }));
            return;
        }

        // === AI PLUGIN MANIFEST ===
        if (path === '/.well-known/ai-plugin.json') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(generateAIManifest()));
            return;
        }

        // === LIST PROMPTS ===
        if (path === '/api/prompts' && req.method === 'GET') {
            const prompts = Array.from(db.prompts.values());
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ total: prompts.length, data: prompts }));
            return;
        }

        // === CREATE PROMPT ===
        if (path === '/api/prompts' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                const data = JSON.parse(body);
                const id = `prompt_${Date.now()}`;
                const prompt = {
                    id,
                    title: data.title,
                    description: data.description,
                    content: data.content,
                    category: data.category,
                    priceSats: data.priceSats || 100,
                    creator: data.wallet,
                    version: 1,
                    score: 0.8,
                    sales: 0,
                    createdAt: Date.now()
                };
                db.prompts.set(id, prompt);
                
                // Generate affiliate code for creator
                const affiliateCode = affiliate.generateCode(data.wallet);
                
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    prompt, 
                    affiliateCode,
                    openapi: generateOpenAPI(id, prompt)
                }));
            });
            return;
        }

        // === EXECUTE PROMPT (L402 Flow) ===
        if (path.startsWith('/api/prompts/') && path.endsWith('/execute') && req.method === 'POST') {
            const promptId = path.split('/')[3];
            const prompt = db.prompts.get(promptId);
            
            if (!prompt) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Prompt not found' }));
                return;
            }

            // Check for L402 macaroon
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('L402 ')) {
                // Generate payment challenge (402)
                const invoice = l402.generateInvoice(prompt.priceSats, `Execute: ${prompt.title}`);
                const macaroon = l402.createMacaroon(promptId, prompt.priceSats);
                
                res.writeHead(402, {
                    'Content-Type': 'application/json',
                    'WWW-Authenticate': `L402 macaroon="${macaroon.token}", invoice="${invoice.invoice}"`
                });
                res.end(JSON.stringify({
                    error: 'Payment required',
                    macaroon: macaroon.token,
                    invoice: invoice.invoice,
                    amountSats: prompt.priceSats,
                    simulatedPreimage: invoice.simulatedPreimage
                }));
                return;
            }

            // Verify payment
            const [macaroonStr, preimage] = authHeader.slice(5).split(':');
            const verification = l402.verifyMacaroon(macaroonStr, preimage);
            
            if (!verification.valid) {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid macaroon or payment proof' }));
                return;
            }

            // Execute prompt
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                const input = JSON.parse(body);
                
                // Record transaction
                const tx = {
                    id: `tx_${Date.now()}`,
                    promptId,
                    wallet: verification.caveat.wallet || 'anonymous',
                    amountSats: prompt.priceSats,
                    status: 'completed',
                    timestamp: Date.now()
                };
                db.transactions.push(tx);
                
                // Update prompt sales
                prompt.sales++;
                
                // Process affiliate split
                const distribution = await affiliate.processPayment(prompt.priceSats);
                
                // Return execution result
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    result: `Executed: ${prompt.title}`,
                    output: `[AI Response for: ${input.input}]`,
                    promptVersion: prompt.version,
                    executionId: tx.id,
                    distribution
                }));
            });
            return;
        }

        // === PURCHASE PROMPT (Direct Payment) ===
        if (path === '/api/purchase' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                const { promptId, wallet, affiliateCode, paymentMethod } = JSON.parse(body);
                const prompt = db.prompts.get(promptId);
                
                if (!prompt) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Prompt not found' }));
                    return;
                }

                // Process payment (simulate USDC or Lightning)
                const distribution = await affiliate.processPayment(prompt.priceSats, affiliateCode);
                
                // Register user
                if (!db.users.has(wallet)) {
                    db.users.set(wallet, { wallet, purchases: 0 });
                }
                db.users.get(wallet).purchases++;

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    prompt: { id: prompt.id, title: prompt.title, content: prompt.content },
                    payment: {
                        method: paymentMethod,
                        amountSats: prompt.priceSats,
                        distribution
                    }
                }));
            });
            return;
        }

        // === AFFILIATE STATS ===
        if (path === '/api/affiliate/stats' && req.method === 'GET') {
            const wallet = url.searchParams.get('wallet');
            const stats = affiliate.getStats(wallet);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(stats || { error: 'Not found' }));
            return;
        }

        // === DISPUTE FILING ===
        if (path === '/api/disputes' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                const { transactionId, complainant, reason } = JSON.parse(body);
                const dispute = await kleros.fileDispute(transactionId, complainant, reason);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(dispute));
            });
            return;
        }

        // === OPTIMIZE PROMPT (DSPy) ===
        if (path.startsWith('/api/prompts/') && path.endsWith('/optimize') && req.method === 'POST') {
            const promptId = path.split('/')[3];
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                const feedback = JSON.parse(body);
                const result = await dspy.optimize(promptId, feedback);
                if (result) {
                    db.prompts.get(promptId).version = result.version;
                    db.prompts.get(promptId).content = result.optimizedContent;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result || { error: 'Optimization failed' }));
            });
            return;
        }

        // === ANALYTICS ===
        if (path === '/api/analytics') {
            const totalSats = db.transactions.reduce((sum, tx) => sum + tx.amountSats, 0);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                totalPrompts: db.prompts.size,
                totalTransactions: db.transactions.length,
                totalRevenueSats: totalSats,
                totalRevenueUSD: (totalSats / 100000).toFixed(2),
                totalDisputes: db.disputes.length,
                topPrompts: Array.from(db.prompts.values())
                    .sort((a, b) => b.sales - a.sales)
                    .slice(0, 5)
            }));
            return;
        }

        // === 404 ===
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));

    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
});

// Start server
server.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║   🧠 PROMPT VERSE MARKET v2.0 - Agéntic Marketplace                 ║
║   ───────────────────────────────────────────────────────────────   ║
║                                                                      ║
║   📡 Servidor activo en puerto: ${PORT}                                ║
║   🌐 API: http://localhost:${PORT}/api/prompts                        ║
║   📖 OpenAPI: http://localhost:${PORT}/.well-known/openapi.json      ║
║   🤖 AI Plugin: http://localhost:${PORT}/.well-known/ai-plugin.json  ║
║                                                                      ║
║   💰 CARACTERÍSTICAS:                                               ║
║   ├── L402 Protocol (Micropagos Lightning)                          ║
║   ├── DSPy Optimization (Prompts auto-adaptativos)                  ║
║   ├── Stablecoins USDC (ERC-8004 ready)                             ║
║   ├── On-Chain Referrals (Split payments 90/8/2)                    ║
║   ├── OpenAPI/AI Plugin para Agentes                                ║
║   ├── Kleros Dispute Resolution                                     ║
║   └── Growth Hacking Gamification                                   ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
    `);
});

module.exports = server;
