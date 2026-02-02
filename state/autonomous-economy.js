/**
 * AUTONOMOUS ECONOMY ECOSYSTEM v1.0
 * 
 * Integrated Protocol Suite:
 * - x402: Machine-to-Machine micropayments
 * - Olas: Autonomous AI agents (DeFi)
 * - Story Protocol: Programmable IP
 * - Vana: Data DAO (user-owned data)
 * - Kleros: Decentralized dispute resolution
 * - MCP: Model Context Protocol
 * - Energy: Transactive energy (Tibber-style)
 * - DePIN: Physical infrastructure markets (Peaq-style)
 */

const http = require('http');
const crypto = require('crypto');
const EventEmitter = require('events');

// ============= CONFIGURATION =============
const CONFIG = {
    ports: {
        x402: 3100,      // M2M Payments
        olas: 3101,      // DeFi Agents
        story: 3102,     // IP Rights
        vana: 3103,      // Data DAO
        kleros: 3104,    // Disputes
        mcp: 3105,       // Context Protocol
        energy: 3106,    // Transactive Energy
        depin: 3107,     // Physical Infrastructure
        gateway: 3108    // Unified gateway
    },
    x402: {
        minPayment: 1, // 1 satoshi minimum
        expiryMs: 300000 // 5 minutes
    },
    olas: {
        pearlUrl: 'https://pearl.olas.network',
        mechUrl: 'https://mech.olas.network'
    },
    kleros: {
        jurorIncentive: 0.1, // 10% PNK reward
        appealPeriod: 86400000 // 24 hours
    }
};

// ============= DATA STORES =============
const db = {
    prompts: new Map(),
    agents: new Map(),       // Olas-style autonomous agents
    ipRights: new Map(),     // Story Protocol-style
    dataPools: new Map(),    // Vana Data DAOs
    disputes: new Map(),     // Kleros cases
    energyAssets: new Map(), // DePIN devices
    transactions: [],
    users: new Map(),
    contexts: new Map()      // MCP contexts
};

// ============= X402 M2M PAYMENTS =============
class X402Payment {
    constructor() {
        this.pending = new Map(); // paymentHash -> invoice
        this.macaroonSecret = crypto.randomBytes(32);
    }

    // Create payment request (402 response)
    createPaymentRequest(resource, amountSats, metadata = {}) {
        const paymentHash = crypto.randomBytes(32).toString('hex');
        const invoice = {
            paymentHash,
            resource,
            amountSats,
            metadata,
            createdAt: Date.now(),
            expiresAt: Date.now() + CONFIG.x402.expiryMs,
            status: 'pending'
        };

        this.pending.set(paymentHash, invoice);

        return {
            status: 402,
            headers: {
                'WWW-Authenticate': `x402 macaroon="${this.createMacaroon(invoice)}", invoice="${paymentHash}"`,
                'X402-Amount': amountSats,
                'X402-Resource': resource
            },
            body: {
                error: 'Payment required',
                paymentHash,
                amountSats,
                resource
            }
        };
    }

    // Verify payment and unlock resource
    async verifyPayment(paymentHash, preimage) {
        const invoice = this.pending.get(paymentHash);
        if (!invoice) return { valid: false, error: 'Invoice not found' };
        if (invoice.expiresAt < Date.now()) return { valid: false, error: 'Invoice expired' };
        
        // Verify preimage (simplified)
        const expectedHash = crypto.createHash('sha256').update(preimage).digest('hex');
        if (expectedHash !== paymentHash) return { valid: false, error: 'Invalid preimage' };

        invoice.status = 'paid';
        invoice.paidAt = Date.now();
        
        return { valid: true, invoice };
    }

    createMacaroon(invoice) {
        const caveat = `resource = ${invoice.resource} AND amount <= ${invoice.amountSats}`;
        const signature = crypto
            .createHmac('sha256', this.macaroonSecret)
            .update(caveat)
            .digest('hex');
        
        return Buffer.from(`${caveat}:${signature}`).toString('base64');
    }
}

const x402 = new X402Payment();

// ============= OLAS AUTONOMOUS AGENTS =============
class OlasAgent {
    constructor(config) {
        this.id = `olas_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.name = config.name;
        this.owner = config.owner;
        this.type = config.type || 'trading'; // trading, defi, prediction
        this.skills = config.skills || [];
        this.earnings = 0;
        this.transactions = 0;
        this.status = 'active';
        this.lastAction = Date.now();
        
        // Agent capabilities
        this.capabilities = {
            canTrade: true,
            canNegotiate: true,
            canLearn: true,
            crossChain: ['base', 'optimism', 'ethereum']
        };
    }

    async executeTask(task) {
        this.lastAction = Date.now();
        this.transactions++;
        
        // Simulate task execution
        const result = {
            taskId: task.id,
            agentId: this.id,
            result: `Executed: ${task.type}`,
            value: Math.random() * 100, // sats earned
            timestamp: Date.now()
        };

        this.earnings += result.value;
        
        return result;
    }

    async negotiateWith(otherAgent, proposal) {
        // Agent-to-Agent negotiation
        return {
            negotiationId: `neg_${Date.now()}`,
            agent1: this.id,
            agent2: otherAgent,
            proposal,
            status: 'pending',
            timestamp: Date.now()
        };
    }
}

class OlasPlatform {
    constructor() {
        this.agents = new Map();
        this.tasks = [];
        this.marketplace = [];
    }

    registerAgent(config) {
        const agent = new OlasAgent(config);
        this.agents.set(agent.id, agent);
        this.marketplace.push({
            id: agent.id,
            name: agent.name,
            type: agent.type,
            skills: agent.skills,
            earnings: agent.earnings,
            rating: 4.5 + Math.random() * 0.5
        });
        return agent;
    }

    // Agent-to-Agent marketplace (Mech style)
    postTask(task) {
        const taskEntry = {
            id: `task_${Date.now()}`,
            ...task,
            status: 'open',
            bids: [],
            createdAt: Date.now()
        };
        this.tasks.push(taskEntry);
        return taskEntry;
    }

    async submitBid(taskId, agentId, bid) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) throw new Error('Task not found');
        
        task.bids.push({
            agentId,
            bid,
            timestamp: Date.now()
        });
        
        return { status: 'bid_submitted', taskId, agentId };
    }
}

const olasPlatform = new OlasPlatform();

// ============= STORY PROTOCOL - PROGRAMMABLE IP =============
class IPManager {
    constructor() {
        this.assets = new Map();     // IP Assets
        this.licenses = new Map();   // Programmable licenses
        this.royalties = new Map();  // Royalty tracking
    }

    // Create programmable IP asset
    createIPAsset(config) {
        const assetId = `ip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const asset = {
            id: assetId,
            name: config.name,
            type: config.type, // 'image', 'audio', 'text', 'code', 'character'
            creator: config.creator,
            contentHash: crypto.createHash('sha256').update(config.content).digest('hex'),
            metadata: config.metadata,
            licenses: [],
            royaltyRate: config.royaltyRate || 0.10, // 10% default
            createdAt: Date.now(),
            status: 'active'
        };

        this.assets.set(assetId, asset);
        return asset;
    }

    // Create programmable license (PIL-style)
    createLicense(config) {
        const licenseId = `lic_${Date.now()}`;
        const license = {
            id: licenseId,
            ipAssetId: config.ipAssetId,
            terms: {
                commercialUse: config.commercialUse || false,
                modifications: config.modifications || true,
                attributionRequired: config.attributionRequired || true,
                royaltyRate: config.royaltyRate || asset.royaltyRate,
                restrictions: config.restrictions || []
            },
            token: this.generateLicenseToken(config.ipAssetId, config.terms),
            createdAt: Date.now(),
            status: 'active'
        };

        const asset = this.assets.get(config.ipAssetId);
        if (asset) {
            asset.licenses.push(licenseId);
        }

        this.licenses.set(licenseId, license);
        return license;
    }

    generateLicenseToken(ipAssetId, terms) {
        const data = JSON.stringify({ ipAssetId, terms, timestamp: Date.now() });
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    // Verify and pay royalties
    async payRoyalties(ipAssetId, usageValue) {
        const asset = this.assets.get(ipAssetId);
        if (!asset) throw new Error('IP asset not found');

        const royaltyAmount = usageValue * asset.royaltyRate;
        const distribution = {
            creator: royaltyAmount * 0.80,
            protocol: royaltyAmount * 0.20
        };

        // Record royalty
        const recordId = `royalty_${Date.now()}`;
        this.royalties.set(recordId, {
            ipAssetId,
            usageValue,
            royaltyAmount,
            distribution,
            timestamp: Date.now()
        });

        return {
            status: 'royalties_paid',
            recordId,
            distribution
        };
    }
}

const ipManager = new IPManager();

// ============= VANA DATA DAO =============
class DataDAOManager {
    constructor() {
        this.pools = new Map();
        this.contributions = new Map();
    }

    // Create data pool (DLP)
    createPool(config) {
        const poolId = `pool_${Date.now()}`;
        const pool = {
            id: poolId,
            name: config.name,
            description: config.description,
            dataType: config.dataType, // 'comments', 'genetic', 'behavioral', etc.
            contributors: 0,
            totalDataSize: 0,
            tokenSupply: 1000000,
            tokenDistribution: {
                contributors: 0.70,
                treasury: 0.20,
                team: 0.10
            },
            governanceToken: `VANA-${poolId.toUpperCase()}`,
            createdAt: Date.now(),
            status: 'active'
        };

        this.pools.set(poolId, pool);
        return pool;
    }

    // Contribute data and earn tokens
    contributeData(poolId, dataHash, proof) {
        const pool = this.pools.get(poolId);
        if (!pool) throw new Error('Pool not found');

        const contributionId = `contrib_${Date.now()}`;
        const contribution = {
            id: contributionId,
            poolId,
            dataHash,
            proof, // Proof of contribution
            tokensEarned: this.calculateTokens(pool, dataHash),
            timestamp: Date.now()
        };

        pool.contributors++;
        pool.totalDataSize += dataHash.length;
        
        this.contributions.set(contributionId, contribution);
        return contribution;
    }

    calculateTokens(pool, dataHash) {
        // Simplified token calculation based on data contribution
        const baseTokens = 100;
        const qualityMultiplier = 1 + Math.random() * 0.5;
        return Math.floor(baseTokens * qualityMultiplier);
    }

    // Query data (for AI training)
    async queryData(poolId, query) {
        const pool = this.pools.get(poolId);
        if (!pool) throw new Error('Pool not found');

        // Return aggregated statistics (privacy-preserving)
        return {
            poolId,
            query,
            resultCount: pool.contributors,
            totalSize: pool.totalDataSize,
            avgQuality: 0.85,
            accessFee: 1000 // sats
        };
    }
}

const dataDAO = new DataDAOManager();

// ============= KLEROS DISPUTE RESOLUTION =============
class KlerosManager {
    constructor() {
        this.cases = new Map();
        this.jurors = new Map();
        this.rulings = [];
    }

    // File dispute
    fileDispute(config) {
        const caseId = `KLR_${Date.now()}`;
        const dispute = {
            id: caseId,
            type: config.type, // 'ip', 'data', 'payment', 'contract'
            parties: config.parties,
            evidence: config.evidence || [],
            arbitrationFee: config.arbitrationFee || 5000, // sats
            status: 'open', // open, voting, appealed, resolved
            createdAt: Date.now(),
            appealPeriodEnds: Date.now() + CONFIG.kleros.appealPeriod,
            jurors: [],
            ruling: null
        };

        this.cases.set(caseId, dispute);
        return dispute;
    }

    // Register as juror
    registerJuror(wallet, stake) {
        const jurorId = `juror_${Date.now()}`;
        this.jurors.set(wallet, {
            id: jurorId,
            wallet,
            stake,
            casesVoted: 0,
            correctVotes: 0,
            rewards: 0
        });
        return this.jurors.get(wallet);
    }

    // Cast vote
    async castVote(caseId, wallet, vote, reasoning) {
        const dispute = this.cases.get(caseId);
        if (!dispute) throw new Error('Case not found');
        if (dispute.status !== 'voting') throw new Error('Case not in voting state');

        const juror = this.jurors.get(wallet);
        if (!juror) throw new Error('Not registered as juror');

        dispute.jurors.push({
            wallet,
            vote,
            reasoning,
            timestamp: Date.now()
        });

        juror.casesVoted++;

        // Check if voting period should end
        if (dispute.jurors.length >= 3) {
            await this.resolveCase(caseId);
        }
    }

    // Resolve case (simplified voting)
    async resolveCase(caseId) {
        const dispute = this.cases.get(caseId);
        if (!dispute) throw new Error('Case not found');

        const votes = dispute.jurors.map(j => j.vote);
        const ruling = votes.sort((a, b) =>
            votes.filter(v => v === a).length - votes.filter(v => v === b).length
        ).pop();

        dispute.ruling = ruling;
        dispute.status = 'resolved';
        dispute.resolvedAt = Date.now();

        // Reward jurors
        dispute.jurors.forEach(j => {
            const juror = this.jurors.get(j.wallet);
            if (j.vote === ruling) {
                juror.correctVotes++;
                juror.rewards += dispute.arbitrationFee / dispute.jurors.length;
            }
        });

        this.rulings.push({ caseId, ruling, timestamp: Date.now() });

        return { caseId, ruling, dispute };
    }
}

const klerosManager = new KlerosManager();

// ============= MCP - MODEL CONTEXT PROTOCOL =============
class MCPContextManager {
    constructor() {
        this.contexts = new Map();
        this.resources = new Map();
        this.tools = new Map();
    }

    // Create context for agent
    createContext(config) {
        const contextId = `ctx_${Date.now()}`;
        const context = {
            id: contextId,
            name: config.name,
            agentId: config.agentId,
            resources: [],
            systemPrompt: config.systemPrompt || '',
            tools: config.tools || [],
            memory: [],
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000 // 1 hour default
        };

        this.contexts.set(contextId, context);
        return context;
    }

    // Add resource to context
    addResource(contextId, resource) {
        const context = this.contexts.get(contextId);
        if (!context) throw new Error('Context not found');

        const resourceId = `res_${Date.now()}`;
        const resourceEntry = {
            id: resourceId,
            type: resource.type, // 'file', 'database', 'api'
            uri: resource.uri,
            metadata: resource.metadata,
            accessedAt: Date.now()
        };

        context.resources.push(resourceId);
        this.resources.set(resourceId, resourceEntry);

        return resourceEntry;
    }

    // Define tool for agent
    defineTool(config) {
        const toolId = `tool_${Date.now()}`;
        const tool = {
            id: toolId,
            name: config.name,
            description: config.description,
            inputSchema: config.inputSchema,
            handler: config.handler
        };

        this.tools.set(toolId, tool);
        return tool;
    }

    // Get context for agent execution
    getContext(contextId) {
        const context = this.contexts.get(contextId);
        if (!context) return null;
        if (context.expiresAt < Date.now()) {
            this.contexts.delete(contextId);
            return null;
        }
        return context;
    }

    // Generate Agent Card for discovery
    getAgentCard(agentId) {
        return {
            agentId,
            capabilities: {
                tools: Array.from(this.tools.values()).map(t => ({
                    name: t.name,
                    description: t.description,
                    inputSchema: t.inputSchema
                })),
                resources: Array.from(this.resources.values()).map(r => ({
                    type: r.type,
                    uri: r.uri
                }))
            },
            protocolVersion: '1.0'
        };
    }
}

const mcpManager = new MCPContextManager();

// ============= ENERGY TRANSACTIVE (Tibber-style) =============
class EnergyTransactive {
    constructor() {
        this.assets = new Map();     // Batteries, solar panels, EVs
        this.markets = new Map();    // Energy markets
        this.bids = new Map();       // Grid balancing bids
    }

    // Register energy asset
    registerAsset(config) {
        const assetId = `energy_${Date.now()}`;
        const asset = {
            id: assetId,
            owner: config.owner,
            type: config.type, // 'solar', 'battery', 'ev', 'wind'
            capacity: config.capacity, // kWh
            currentCharge: config.currentCharge || 0,
            gridConnected: true,
            flexScore: 0.85, // Flexibility score
            earnings: 0,
            createdAt: Date.now()
        };

        this.assets.set(assetId, asset);
        return asset;
    }

    // Submit grid balancing bid
    submitBid(assetId, action, pricePerKwh, amount) {
        const asset = this.assets.get(assetId);
        if (!asset) throw new Error('Asset not found');

        const bidId = `bid_${Date.now()}`;
        const bid = {
            id: bidId,
            assetId,
            action, // 'charge', 'discharge', 'curtail'
            pricePerKwh,
            amount,
            status: 'pending',
            timestamp: Date.now()
        };

        this.bids.set(bidId, bid);
        return bid;
    }

    // Execute grid balancing (dispatch)
    async executeDispatch(marketSignal) {
        const availableBids = Array.from(this.bids.values())
            .filter(b => b.status === 'pending' && b.pricePerKwh <= marketSignal.priceThreshold);

        // Sort by price (cheapest first)
        availableBids.sort((a, b) => a.pricePerKwh - b.pricePerKwh);

        const dispatched = [];
        let remaining = marketSignal.amountNeeded;

        for (const bid of availableBids) {
            if (remaining <= 0) break;
            
            const amount = Math.min(bid.amount, remaining);
            bid.status = 'dispatched';
            bid.dispatchedAmount = amount;
            
            const asset = this.assets.get(bid.assetId);
            if (asset) {
                const earnings = amount * bid.pricePerKwh;
                asset.earnings += earnings;
            }

            dispatched.push({ ...bid, amount });
            remaining -= amount;
        }

        return {
            marketSignal,
            dispatched,
            totalDispatched: dispatched.reduce((sum, d) => sum + d.amount, 0),
            timestamp: Date.now()
        };
    }

    // Get grid rewards for flexibility
    calculateFlexRewards(assetId, gridService) {
        const asset = this.assets.get(assetId);
        if (!asset) return null;

        // Base reward calculation
        const baseReward = asset.capacity * asset.flexScore * 0.1;
        const serviceMultiplier = gridService === 'frequency' ? 1.5 : 1.0;

        return {
            assetId,
            gridService,
            estimatedReward: baseReward * serviceMultiplier,
            currency: 'sats'
        };
    }
}

const energyTransactive = new EnergyTransactive();

// ============= DePIN MARKETPLACE (Peaq-style) =============
class DePINMarketplace {
    constructor() {
        this.devices = new Map();
        this.services = new Map();
        this.leases = new Map();
    }

    // Register physical infrastructure device
    registerDevice(config) {
        const deviceId = `depin_${Date.now()}`;
        const device = {
            id: deviceId,
            owner: config.owner,
            type: config.type, // 'sensor', 'server', 'antenna', 'charger'
            specs: config.specs,
            location: config.location, // geo coordinates
            status: 'online',
            uptime: 0,
            earnings: 0,
            reputation: 100, // 0-100
            tokenized: false,
            createdAt: Date.now()
        };

        this.devices.set(deviceId, device);
        return device;
    }

    // Tokenize device (create RWA token)
    async tokenizeDevice(deviceId) {
        const device = this.devices.get(deviceId);
        if (!device) throw new Error('Device not found');

        device.tokenized = true;
        device.tokenSymbol = `DEPIN-${deviceId.toUpperCase().slice(-6)}`;
        
        return {
            deviceId,
            tokenSymbol: device.tokenSymbol,
            status: 'tokenized',
            createdAt: Date.now()
        };
    }

    // List service from device
    listService(deviceId, config) {
        const device = this.devices.get(deviceId);
        if (!device) throw new Error('Device not found');

        const serviceId = `svc_${Date.now()}`;
        const service = {
            id: serviceId,
            deviceId,
            name: config.name,
            type: config.type, // 'compute', 'storage', 'connectivity', 'sensing'
            pricePerUnit: config.pricePerUnit,
            unit: config.unit, // 'hour', 'gb', 'request'
            specs: device.specs,
            status: 'available',
            createdAt: Date.now()
        };

        this.services.set(serviceId, service);
        return service;
    }

    // Lease service
    async leaseService(serviceId, customer, duration) {
        const service = this.services.get(serviceId);
        if (!service) throw new Error('Service not found');
        if (service.status !== 'available') throw new Error('Service not available');

        const leaseId = `lease_${Date.now()}`;
        const lease = {
            id: leaseId,
            serviceId,
            customer,
            duration,
            cost: service.pricePerUnit * duration,
            status: 'active',
            startedAt: Date.now(),
            expiresAt: Date.now() + duration * 3600000 // convert hours to ms
        };

        service.status = 'leased';
        this.leases.set(leaseId, lease);

        const device = this.devices.get(service.deviceId);
        if (device) {
            device.earnings += lease.cost;
            device.uptime += duration;
        }

        return lease;
    }

    // Get marketplace stats
    getStats() {
        const services = Array.from(this.services.values());
        return {
            totalDevices: this.devices.size,
            totalServices: services.length,
            availableServices: services.filter(s => s.status === 'available').length,
            totalRevenue: Array.from(this.devices.values()).reduce((sum, d) => sum + d.earnings, 0),
            avgReputation: Array.from(this.devices.values())
                .reduce((sum, d) => sum + d.reputation, 0) / this.devices.size || 0
        };
    }
}

const depinMarketplace = new DePINMarketplace();

// ============= UNIFIED GATEWAY =============
function createGateway() {
    const server = http.createServer(async (req, res) => {
        const url = new URL(req.url, `http://localhost:${CONFIG.ports.gateway}`);
        const path = url.pathname;

        // CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X402-Payment');

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        try {
            // === X402 PAYMENTS ===
            if (path === '/api/x402/pay' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', () => {
                    const { resource, amountSats } = JSON.parse(body);
                    const response = x402.createPaymentRequest(resource, amountSats);
                    res.writeHead(response.status, { 'Content-Type': 'application/json', ...response.headers });
                    res.end(JSON.stringify(response.body));
                });
                return;
            }

            if (path === '/api/x402/verify' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', async () => {
                    const { paymentHash, preimage } = JSON.parse(body);
                    const result = await x402.verifyPayment(paymentHash, preimage);
                    res.writeHead(result.valid ? 200 : 403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result));
                });
                return;
            }

            // === OLAS AGENTS ===
            if (path === '/api/olas/register' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', () => {
                    const config = JSON.parse(body);
                    const agent = olasPlatform.registerAgent(config);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ agent, marketplace: olasPlatform.marketplace }));
                });
                return;
            }

            if (path === '/api/olas/marketplace') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(olasPlatform.marketplace));
                return;
            }

            // === STORY IP ===
            if (path === '/api/ip/create' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', () => {
                    const config = JSON.parse(body);
                    const asset = ipManager.createIPAsset(config);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(asset));
                });
                return;
            }

            if (path === '/api/ip/license' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', () => {
                    const config = JSON.parse(body);
                    const license = ipManager.createLicense(config);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(license));
                });
                return;
            }

            // === VANA DATA DAO ===
            if (path === '/api/data/pool' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', () => {
                    const config = JSON.parse(body);
                    const pool = dataDAO.createPool(config);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(pool));
                });
                return;
            }

            if (path === '/api/data/contribute' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', () => {
                    const { poolId, dataHash, proof } = JSON.parse(body);
                    const contribution = dataDAO.contributeData(poolId, dataHash, proof);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(contribution));
                });
                return;
            }

            // === KLEROS DISPUTES ===
            if (path === '/api/disputes/file' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', () => {
                    const config = JSON.parse(body);
                    const dispute = klerosManager.fileDispute(config);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(dispute));
                });
                return;
            }

            // === MCP CONTEXT ===
            if (path === '/api/mcp/context' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', () => {
                    const config = JSON.parse(body);
                    const context = mcpManager.createContext(config);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(context));
                });
                return;
            }

            if (path === '/api/mcp/agent-card') {
                const agentId = url.searchParams.get('agentId');
                const card = mcpManager.getAgentCard(agentId);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(card));
                return;
            }

            // === ENERGY TRANSACTIVE ===
            if (path === '/api/energy/register' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', () => {
                    const config = JSON.parse(body);
                    const asset = energyTransactive.registerAsset(config);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(asset));
                });
                return;
            }

            if (path === '/api/energy/dispatch' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', async () => {
                    const signal = JSON.parse(body);
                    const result = await energyTransactive.executeDispatch(signal);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result));
                });
                return;
            }

            // === DePIN MARKETPLACE ===
            if (path === '/api/depin/register' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', () => {
                    const config = JSON.parse(body);
                    const device = depinMarketplace.registerDevice(config);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(device));
                });
                return;
            }

            if (path === '/api/depin/stats') {
                const stats = depinMarketplace.getStats();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(stats));
                return;
            }

            // === UNIFIED ANALYTICS ===
            if (path === '/api/analytics') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    x402: {
                        pendingPayments: x402.pending.size,
                        transactions: db.transactions.length
                    },
                    olas: {
                        agents: olasPlatform.agents.size,
                        tasks: olasPlatform.tasks.length,
                        marketplace: olasPlatform.marketplace.length
                    },
                    ip: {
                        assets: ipManager.assets.size,
                        licenses: ipManager.licenses.size
                    },
                    dataDAO: {
                        pools: dataDAO.pools.size,
                        contributions: dataDAO.contributions.size
                    },
                    kleros: {
                        cases: klerosManager.cases.size,
                        resolved: klerosManager.rulings.length
                    },
                    energy: {
                        assets: energyTransactive.assets.size,
                        bids: energyTransactive.bids.size
                    },
                    depin: depinMarketplace.getStats()
                }));
                return;
            }

            // === HEALTH CHECK ===
            if (path === '/health') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
                return;
            }

            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not found' }));

        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    });

    return server;
}

// ============= START SERVERS =============
const gateway = createGateway();

gateway.listen(CONFIG.ports.gateway, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   🌍 AUTONOMOUS ECONOMY ECOSYSTEM v1.0                                      ║
║   ─────────────────────────────────────────────────────────────────────────  ║
║                                                                              ║
║   📡 Unified Gateway: http://localhost:${CONFIG.ports.gateway}                     ║
║                                                                              ║
║   🔗 INTEGRATED PROTOCOLS:                                                  ║
║   ├── x402       M2M Payments (micropagos instantáneos)                     ║
║   ├── Olas       Autonomous AI Agents (DeFi, Prediction)                    ║
║   ├── Story      Programmable IP (licencias automáticas)                    ║
║   ├── Vana       Data DAO (datos propiedad del usuario)                    ║
║   ├── Kleros     Decentralized Dispute Resolution                           ║
║   ├── MCP        Model Context Protocol (contextos agénticos)               ║
║   ├── Energy     Transactive Energy (grid balancing)                       ║
║   └── DePIN      Physical Infrastructure Marketplace (Peaq-style)           ║
║                                                                              ║
║   💰 REVENUE STREAMS:                                                       ║
║   ├── x402:      Micropagos 1 satoshi mínimo                                ║
║   ├── Olas:      Trading/DeFi agents                                        ║
║   ├── Story IP:  10% regalías automáticas                                   ║
║   ├── Data DAO:  Compensación por datos                                     ║
║   ├── Energy:    Grid rewards por flexibilidad                              ║
║   └── DePIN:     Alquiler de infraestructura                                ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
    `);
});

module.exports = {
    x402,
    olasPlatform,
    ipManager,
    dataDAO,
    klerosManager,
    mcpManager,
    energyTransactive,
    depinMarketplace,
    createGateway,
    CONFIG
};
