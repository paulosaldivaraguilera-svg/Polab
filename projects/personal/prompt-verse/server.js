/**
 * PromptVerse Marketplace Backend
 * 
 * Marketplace viral de prompts con:
 * - Sistema de compra/venta
 * - Pagos automáticos para IAs
 * - Affiliate program (50%)
 * - Wallet integration (BTC)
 * - Analytics viral
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// ============= DATABASE =============
const db = {
    prompts: [],
    users: [],
    transactions: [],
    affiliates: [],
    wallets: new Map() // user_id -> { btc: '', balance: 0, earned: 0 }
};

// ============= SMART CONTRACT SIMULATION =============
class PromptVerseContract {
    constructor() {
        this.fees = {
            platform: 0.05,      // 5% platform fee
            affiliate: 0.50,     // 50% to affiliate
            seller: 0.45         // 45% to seller
        };
    }

    // Calculate payment distribution
    calculatePayment(price, affiliateCode = null) {
        const distribution = {
            platform: price * this.fees.platform,
            seller: price * this.fees.seller,
            affiliate: 0,
            affiliateAddress: null
        };

        if (affiliateCode) {
            const affiliate = db.affiliates.find(a => a.code === affiliateCode);
            if (affiliate) {
                distribution.affiliate = price * this.fees.affiliate;
                distribution.affiliateAddress = affiliate.wallet;
            }
        }

        return distribution;
    }

    // Process payment (AI or human)
    async processPayment(promptId, buyerWallet, affiliateCode = null) {
        const prompt = db.prompts.find(p => p.id === promptId);
        if (!prompt) throw new Error('Prompt no encontrado');

        const payment = this.calculatePayment(prompt.price, affiliateCode);
        
        // Simulate blockchain transaction
        const txId = crypto.randomUUID();
        
        const transaction = {
            id: txId,
            promptId,
            buyerWallet,
            amount: prompt.price,
            distribution: payment,
            timestamp: Date.now(),
            status: 'confirmed'
        };

        // Update balances
        const sellerWallet = this.getWallet(prompt.sellerId);
        sellerWallet.balance += payment.seller;
        sellerWallet.earned += payment.seller;

        if (payment.affiliateAddress) {
            const affiliateWallet = this.getWalletByAddress(payment.affiliateAddress);
            if (affiliateWallet) {
                affiliateWallet.balance += payment.affiliate;
                affiliateWallet.earned += payment.affiliate;
            }
        }

        db.transactions.push(transaction);
        
        return {
            txId,
            prompt: prompt.content,
            distribution: payment,
            status: 'confirmed'
        };
    }

    getWallet(userId) {
        if (!db.wallets.has(userId)) {
            db.wallets.set(userId, { btc: '', balance: 0, earned: 0 });
        }
        return db.wallets.get(userId);
    }

    getWalletByAddress(address) {
        for (const [userId, wallet] of db.wallets) {
            if (wallet.btc === address) return wallet;
        }
        return null;
    }
}

const contract = new PromptVerseContract();

// ============= API ROUTES =============

// Get all prompts
app.get('/api/prompts', (req, res) => {
    const { category, minPrice, maxPrice, viral, aiCompatible } = req.query;
    
    let filtered = [...db.prompts];
    
    if (category && category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
    }
    if (viral === 'true') {
        filtered = filtered.filter(p => p.viral);
    }
    if (aiCompatible === 'true') {
        filtered = filtered.filter(p => p.aiCompatible);
    }
    if (minPrice) {
        filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
        filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
    }

    res.json(filtered);
});

// Get single prompt
app.get('/api/prompts/:id', (req, res) => {
    const prompt = db.prompts.find(p => p.id === parseInt(req.params.id));
    if (!prompt) return res.status(404).json({ error: 'Prompt no encontrado' });
    res.json(prompt);
});

// Create prompt
app.post('/api/prompts', (req, res) => {
    const { title, description, content, category, price, sellerId, aiCompatible } = req.body;
    
    const prompt = {
        id: db.prompts.length + 1,
        title,
        description,
        content,
        category,
        price: parseFloat(price),
        sellerId,
        aiCompatible: aiCompatible || false,
        viral: Math.random() > 0.8, // 20% chance of being viral
        sales: 0,
        rating: 0,
        reviews: [],
        createdAt: Date.now(),
        status: 'active'
    };

    db.prompts.push(prompt);
    res.json(prompt);
});

// Buy prompt
app.post('/api/prompts/:id/buy', async (req, res) => {
    try {
        const { buyerWallet, affiliateCode } = req.body;
        
        const result = await contract.processPayment(
            parseInt(req.params.id),
            buyerWallet,
            affiliateCode
        );

        // Update sales count
        const prompt = db.prompts.find(p => p.id === parseInt(req.params.id));
        if (prompt) {
            prompt.sales++;
        }

        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Affiliate registration
app.post('/api/affiliates', (req, res) => {
    const { userId, wallet } = req.body;
    
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const affiliate = {
        code,
        userId,
        wallet,
        referrals: 0,
        earned: 0,
        createdAt: Date.now()
    };

    db.affiliates.push(affiliate);
    
    // Set wallet
    const userWallet = contract.getWallet(userId);
    userWallet.btc = wallet;

    res.json(affiliate);
});

// Get affiliate stats
app.get('/api/affiliates/:code', (req, res) => {
    const affiliate = db.affiliates.find(a => a.code === req.params.code);
    if (!affiliate) return res.status(404).json({ error: 'Affiliate no encontrado' });
    
    const wallet = contract.getWallet(affiliate.userId);
    res.json({
        ...affiliate,
        balance: wallet.balance,
        earned: wallet.earned
    });
});

// Wallet balance
app.get('/api/wallet/:userId', (req, res) => {
    const wallet = contract.getWallet(req.params.userId);
    res.json(wallet);
});

// Connect wallet
app.post('/api/wallet/connect', (req, res) => {
    const { userId, btcAddress } = req.body;
    const wallet = contract.getWallet(userId);
    wallet.btc = btcAddress;
    res.json(wallet);
});

// Withdraw
app.post('/api/wallet/withdraw', (req, res) => {
    const { userId, amount, btcAddress } = req.body;
    const wallet = contract.getWallet(userId);
    
    if (wallet.balance < amount) {
        return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    // Simulate withdrawal
    wallet.balance -= amount;
    
    res.json({
        success: true,
        txId: crypto.randomUUID(),
        amount,
        to: btcAddress,
        timestamp: Date.now()
    });
});

// Analytics
app.get('/api/analytics', (req, res) => {
    const totalSales = db.transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalPrompts = db.prompts.length;
    const totalAffiliates = db.affiliates.length;
    
    // Calculate viral score
    const viralPrompts = db.prompts.filter(p => p.viral).length;
    const viralScore = totalPrompts > 0 ? Math.round((viralPrompts / totalPrompts) * 100) : 0;

    // Count AI buyers (wallets that make multiple purchases)
    const aiBuyers = new Set(
        db.transactions.filter(t => t.buyerWallet.startsWith('0x') || t.buyerWallet.includes('ai'))
        .map(t => t.buyerWallet)
    ).size;

    res.json({
        totalPrompts,
        totalSales,
        totalTransactions: db.transactions.length,
        totalAffiliates,
        aiBuyers,
        viralScore,
        revenueByCategory: calculateRevenueByCategory(),
        topSellers: getTopSellers(),
        topAffiliates: getTopAffiliates()
    });
});

// AI Self-Purchase endpoint (IAs can buy prompts)
app.post('/api/ai/purchase', async (req, res) => {
    const { aiId, promptId, apiKey } = req.body;
    
    // Verify AI (simplified - in production, verify API key)
    if (!apiKey) {
        return res.status(401).json({ error: 'API key requerida' });
    }

    const aiWallet = `0xAI${aiId.toUpperCase()}`;
    const result = await contract.processPayment(promptId, aiWallet);
    
    res.json({
        success: true,
        aiId,
        purchased: result,
        message: 'Prompt entregado. AI listo para usar.'
    });
});

// ============= HELPERS =============
function calculateRevenueByCategory() {
    const byCategory = {};
    db.transactions.forEach(t => {
        const prompt = db.prompts.find(p => p.id === t.promptId);
        if (prompt) {
            byCategory[prompt.category] = (byCategory[prompt.category] || 0) + t.amount;
        }
    });
    return byCategory;
}

function getTopSellers() {
    const sellerSales = {};
    db.prompts.forEach(p => {
        sellerSales[p.sellerId] = (sellerSales[p.sellerId] || 0) + p.sales;
    });
    return Object.entries(sellerSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([sellerId, sales]) => ({ sellerId, sales }));
}

function getTopAffiliates() {
    return db.affiliates
        .sort((a, b) => b.earned - a.earned)
        .slice(0, 5)
        .map(a => ({
            code: a.code,
            referrals: a.referrals,
            earned: contract.getWallet(a.userId).earned
        }));
}

// ============= START =============
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`
🧠 PromptVerse API Server running on port ${PORT}
📊 Analytics: http://localhost:${PORT}/api/analytics
💰 Marketplace: http://localhost:${PORT}/api/prompts
🤖 AI Purchase: http://localhost:${PORT}/api/ai/purchase
    `);
});

module.exports = app;
