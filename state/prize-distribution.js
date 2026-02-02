/**
 * OpenClaw Services - Prize Distribution System
 * 
 * Handles digital prizes (Gift Cards, Steam Codes) and physical rewards
 */

const crypto = require('crypto');

// Simulated API clients (would be real integrations in production)
class PrizeDistribution {
    constructor(config = {}) {
        this.config = {
            // Digital Prize Providers
            digitalProviders: {
                steam: {
                    name: 'Steam Wallet',
                    enabled: config.steamEnabled || false,
                    margin: 0.10, // 10% markup
                    codes: [] // Would be populated from inventory
                },
                tillo: {
                    name: 'Tillo Gift Cards',
                    enabled: config.tilloEnabled || false,
                    apiKey: config.tilloApiKey || '',
                    margin: 0.05 // 5% markup
                },
                tremendous: {
                    name: 'Tremendous Rewards',
                    enabled: config.tremendousEnabled || false,
                    apiKey: config.tremendousApiKey || '',
                    margin: 0.08
                }
            },
            // Physical Prize Configuration
            physical: {
                enabled: config.physicalEnabled || true,
                shippingFreeThreshold: config.shippingFreeThreshold || 15000, // CLP
                providers: ['chilexpress', 'starken', 'bluexpress'],
                defaultProvider: 'chilexpress'
            },
            // Win Rate Configuration
            winRate: config.winRate || 0.15, // 15% base win rate
            maxDailyPrizes: config.maxDailyPrizes || 50,
            ...config
        };

        this.inventory = new Map(); // prizeId -> inventory data
        this.redemptions = []; // Redemption history
        this.stats = {
            totalRedemptions: 0,
            totalValue: 0,
            digitalCount: 0,
            physicalCount: 0,
            dailyStats: new Map() // date -> stats
        };
    }

    /**
     * Initialize inventory from config/database
     */
    async initialize() {
        // Load initial inventory
        const defaultPrizes = [
            // Digital Prizes
            {
                id: 'steam_5',
                type: 'digital',
                name: 'Steam Wallet $5 USD',
                value: 5,
                currency: 'USD',
                category: 'gaming',
                image: '🎮',
                stock: 100,
                provider: 'steam',
                metadata: { region: 'global' }
            },
            {
                id: 'steam_10',
                type: 'digital',
                name: 'Steam Wallet $10 USD',
                value: 10,
                currency: 'USD',
                category: 'gaming',
                image: '🎮',
                stock: 50,
                provider: 'steam',
                metadata: { region: 'global' }
            },
            {
                id: 'steam_25',
                type: 'digital',
                name: 'Steam Wallet $25 USD',
                value: 25,
                currency: 'USD',
                category: 'gaming',
                image: '🎮',
                stock: 20,
                provider: 'steam',
                metadata: { region: 'global' }
            },
            // Gift Cards
            {
                id: 'amazon_10',
                type: 'digital',
                name: 'Amazon Gift Card $10 USD',
                value: 10,
                currency: 'USD',
                category: 'shopping',
                image: '📦',
                stock: 30,
                provider: 'tillo',
                metadata: { brands: ['amazon'] }
            },
            {
                id: 'playstation_20',
                type: 'digital',
                name: 'PlayStation Store $20 USD',
                value: 20,
                currency: 'USD',
                category: 'gaming',
                image: '🎮',
                stock: 25,
                provider: 'tillo',
                metadata: { brands: ['playstation'] }
            },
            // Physical Prizes (Chile)
            {
                id: 'merch_sticker_pack',
                type: 'physical',
                name: 'Pack Stickers OFICIAL',
                value: 3000,
                currency: 'CLP',
                category: 'merch',
                image: '⭐',
                stock: 200,
                provider: 'internal',
                metadata: { weight: 50, dimensions: '15x10x2' }
            },
            {
                id: 'merch_tshirt',
                type: 'physical',
                name: 'Polera OFICIAL (Talla M/L/XL)',
                value: 15000,
                currency: 'CLP',
                category: 'merch',
                image: '👕',
                stock: 30,
                provider: 'internal',
                metadata: { weight: 200, dimensions: '30x20x5' }
            },
            {
                id: 'tech_mousepad',
                type: 'physical',
                name: 'Mousepad Gaming XL',
                value: 12000,
                currency: 'CLP',
                category: 'tech',
                image: '🖱️',
                stock: 20,
                provider: 'internal',
                metadata: { weight: 300, dimensions: '40x30x1' }
            },
            {
                id: 'tech_headset_stand',
                type: 'physical',
                name: 'Soporte Audífonos RGB',
                value: 25000,
                currency: 'CLP',
                category: 'tech',
                image: '🎧',
                stock: 10,
                provider: 'internal',
                metadata: { weight: 500, dimensions: '15x15x20' }
            }
        ];

        for (const prize of defaultPrizes) {
            this.inventory.set(prize.id, {
                ...prize,
                createdAt: Date.now(),
                redemptions: 0
            });
        }

        console.log(`✅ Prize inventory initialized with ${this.inventory.size} items`);
    }

    /**
     * Determine if player wins
     * Uses skill-based system (not RNG gambling)
     */
    determineWin(sessionData, options = {}) {
        // Base win rate
        let winChance = this.config.winRate;

        // Adjust based on player history
        const playerStats = sessionData.playerStats || {};
        const lossStreak = (playerStats.totalPlays || 0) - (playerStats.wins || 0);
        
        // Increase chance for losing streak (up to max 40%)
        if (lossStreak > 3) winChance = Math.min(0.40, winChance + 0.05 * lossStreak);

        // Subscriber bonus
        if (playerStats.isSubscriber) winChance += 0.05;

        // VIP bonus
        if (playerStats.isVip) winChance += 0.03;

        // Random factor (skill variance)
        const roll = Math.random();
        const didWin = roll < winChance;

        return {
            didWin,
            winChance: (winChance * 100).toFixed(1) + '%',
            roll: roll.toFixed(3)
        };
    }

    /**
     * Select a prize for the winner
     */
    selectPrize(winData, preferences = {}) {
        const { didWin } = winData;

        if (!didWin) {
            return {
                type: 'loss',
                message: '¡Casi lo logras! Sigue intentándolo 🎯'
            };
        }

        // Filter available prizes
        const availablePrizes = Array.from(this.inventory.values())
            .filter(p => p.stock > 0);

        if (availablePrizes.length === 0) {
            return {
                type: 'error',
                message: '¡Lo sentimos! Se agotaron los premios por hoy 😢'
            };
        }

        // Weight prizes by stock (more stock = more likely)
        const totalStock = availablePrizes.reduce((sum, p) => sum + p.stock, 0);
        let random = Math.random() * totalStock;

        let selectedPrize = null;
        for (const prize of availablePrizes) {
            random -= prize.stock;
            if (random <= 0) {
                selectedPrize = prize;
                break;
            }
        }

        // Fallback
        if (!selectedPrize) {
            selectedPrize = availablePrizes[0];
        }

        return {
            type: 'win',
            prize: selectedPrize,
            message: `¡FELICIDADES! Ganaste: ${selectedPrize.name} ${selectedPrize.image}`
        };
    }

    /**
     * Redeem a prize for a user
     */
    async redeemPrize(prizeId, userId, username, deliveryInfo = {}) {
        const prize = this.inventory.get(prizeId);
        
        if (!prize) {
            throw new Error('Prize not found');
        }

        if (prize.stock <= 0) {
            throw new Error('Prize out of stock');
        }

        // Check daily limits
        const today = new Date().toISOString().split('T')[0];
        const dailyStats = this.stats.dailyStats.get(today) || { count: 0, value: 0 };
        
        if (dailyStats.count >= this.config.maxDailyPrizes) {
            throw new Error('Daily prize limit reached');
        }

        // Generate redemption code
        const redemptionCode = this.generateRedemptionCode();
        
        // Process based on prize type
        let deliveryResult;
        if (prize.type === 'digital') {
            deliveryResult = await this.deliverDigitalPrize(prize, userId, username, deliveryInfo);
        } else {
            deliveryResult = await this.deliverPhysicalPrize(prize, userId, username, deliveryInfo);
        }

        // Update inventory
        prize.stock--;
        prize.redemptions++;

        // Record redemption
        const redemption = {
            id: redemptionCode,
            prizeId: prize.id,
            prizeName: prize.name,
            userId,
            username,
            type: prize.type,
            value: prize.value,
            currency: prize.currency,
            status: 'completed',
            delivery: deliveryResult,
            createdAt: Date.now()
        };

        this.redemptions.push(redemption);
        this.stats.totalRedemptions++;
        this.stats.totalValue += prize.value;
        
        if (prize.type === 'digital') {
            this.stats.digitalCount++;
        } else {
            this.stats.physicalCount++;
        }

        // Update daily stats
        this.stats.dailyStats.set(today, {
            count: dailyStats.count + 1,
            value: dailyStats.value + prize.value
        });

        return {
            success: true,
            redemption,
            message: this.formatPrizeMessage(prize, deliveryResult)
        };
    }

    /**
     * Deliver digital prize (Gift Card, Steam Code, etc.)
     */
    async deliverDigitalPrize(prize, userId, username, deliveryInfo) {
        // Simulate API call to provider
        if (prize.provider === 'steam') {
            // Would integrate with Steam WebAPI
            return {
                type: 'code',
                code: this.generateSteamCode(),
                instructions: 'Ve a Canjear código en Steam y pega el código.',
                expiry: null
            };
        } else if (['tillo', 'tremendous'].includes(prize.provider)) {
            // Would call Tillo/Tremendous API
            const link = await this.generateGiftCardLink(prize, userId);
            return {
                type: 'link',
                url: link,
                instructions: 'Clickea el enlace y elige tu tarjeta de regalo.',
                expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
            };
        }

        // Fallback for demo
        return {
            type: 'manual',
            code: `OC-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
            instructions: 'Contacta soporte para canjear tu premio.'
        };
    }

    /**
     * Deliver physical prize
     */
    async deliverPhysicalPrize(prize, userId, username, deliveryInfo) {
        const { address, city, region, phone } = deliveryInfo;

        if (!address || !city) {
            return {
                type: 'pending_address',
                status: 'awaiting_info',
                message: 'Necesitamos tu dirección para enviar el premio.'
            };
        }

        // Calculate shipping
        const shipping = this.calculateShipping(prize, address, region);

        return {
            type: 'shipping',
            status: 'processing',
            provider: this.config.physical.defaultProvider,
            trackingNumber: null, // Will be generated after pickup
            estimatedDelivery: this.estimateDeliveryDate(region),
            address: { address, city, region, phone },
            shippingCost: shipping,
            freeShipping: shipping === 0
        };
    }

    /**
     * Calculate shipping cost
     */
    calculateShipping(prize, address, region) {
        const prizeValue = prize.value;
        
        // Free shipping above threshold
        if (prizeValue >= this.config.physical.shippingFreeThreshold) {
            return 0;
        }

        // Region-based pricing (simplified)
        const regionMultipliers = {
            'Santiago': 1.0,
            'Metropolitana': 1.0,
            'Valparaíso': 1.3,
            'Biobío': 1.5,
            'default': 2.0
        };

        const multiplier = regionMultipliers[region] || regionMultipliers.default;
        const baseCost = 3500; // Base shipping in CLP
        
        return Math.round(baseCost * multiplier);
    }

    /**
     * Estimate delivery date
     */
    estimateDeliveryDate(region) {
        const baseDays = {
            'Santiago': 2,
            'Metropolitan': 2,
            'Valparaíso': 3,
            'Biobío': 4,
            'default': 7
        };

        const days = baseDays[region] || baseDays.default;
        const date = new Date();
        date.setDate(date.getDate() + days);

        return date.toISOString().split('T')[0];
    }

    /**
     * Generate redemption code
     */
    generateRedemptionCode() {
        return `OC-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    }

    /**
     * Generate Steam code (simulated)
     */
    generateSteamCode() {
        return `XXXXX-XXXXX-XXXXX`;
    }

    /**
     * Generate gift card link (simulated)
     */
    async generateGiftCardLink(prize, userId) {
        // Would call Tillo/Tremendous API
        return `https://reward.link/${prize.id}/${userId}`;
    }

    /**
     * Format prize delivery message
     */
    formatPrizeMessage(prize, deliveryResult) {
        if (prize.type === 'digital') {
            if (deliveryResult.type === 'link') {
                return `🎁 Tu tarjeta de regalo: ${deliveryResult.url}`;
            }
            return `🎮 Tu código Steam: \`${deliveryResult.code}\``;
        }
        
        if (deliveryResult.type === 'pending_address') {
            return `📦 Necesitamos tu dirección para enviar: ${prize.name}`;
        }
        
        return `🚚 Tu premio ${prize.name} está en camino!`;
    }

    /**
     * Get available prizes
     */
    getAvailablePrizes(filter = {}) {
        let prizes = Array.from(this.inventory.values())
            .filter(p => p.stock > 0);

        if (filter.type) {
            prizes = prizes.filter(p => p.type === filter.type);
        }
        if (filter.category) {
            prizes = prizes.filter(p => p.category === filter.category);
        }
        if (filter.maxValue) {
            prizes = prizes.filter(p => p.value <= filter.maxValue);
        }

        return prizes.map(p => ({
            id: p.id,
            name: p.name,
            type: p.type,
            category: p.category,
            value: p.value,
            currency: p.currency,
            image: p.image,
            stock: p.stock
        }));
    }

    /**
     * Get inventory status
     */
    getInventoryStatus() {
        const digital = Array.from(this.inventory.values())
            .filter(p => p.type === 'digital');
        const physical = Array.from(this.inventory.values())
            .filter(p => p.type === 'physical');

        return {
            digital: {
                total: digital.length,
                inStock: digital.filter(p => p.stock > 0).length,
                lowStock: digital.filter(p => p.stock > 0 && p.stock < 10).length
            },
            physical: {
                total: physical.length,
                inStock: physical.filter(p => p.stock > 0).length,
                lowStock: physical.filter(p => p.stock > 0 && p.stock < 5).length
            },
            totalValue: Array.from(this.inventory.values())
                .reduce((sum, p) => sum + (p.value * p.stock), 0)
        };
    }

    /**
     * Get dashboard stats
     */
    getDashboard() {
        const today = new Date().toISOString().split('T')[0];
        const dailyStats = this.stats.dailyStats.get(today) || { count: 0, value: 0 };

        return {
            redemptions: {
                total: this.stats.totalRedemptions,
                today: dailyStats.count,
                digital: this.stats.digitalCount,
                physical: this.stats.physicalCount
            },
            value: {
                total: this.stats.totalValue,
                today: dailyStats.value
            },
            inventory: this.getInventoryStatus(),
            recentRedemptions: this.redemptions.slice(-10).reverse(),
            topPrizes: Array.from(this.inventory.values())
                .sort((a, b) => b.redemptions - a.redemptions)
                .slice(0, 5)
                .map(p => ({
                    name: p.name,
                    redemptions: p.redemptions,
                    stock: p.stock
                })),
            timestamp: Date.now()
        };
    }

    /**
     * Add stock to prize
     */
    addStock(prizeId, amount) {
        const prize = this.inventory.get(prizeId);
        if (prize) {
            prize.stock += amount;
            return true;
        }
        return false;
    }

    /**
     * Add new prize
     */
    addPrize(prizeData) {
        const id = prizeData.id || crypto.randomUUID();
        this.inventory.set(id, {
            ...prizeData,
            id,
            stock: prizeData.stock || 0,
            redemptions: 0,
            createdAt: Date.now()
        });
        return id;
    }
}

module.exports = { PrizeDistribution };
