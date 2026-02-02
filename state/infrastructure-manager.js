/**
 * INFRASTRUCTURE & DONATION MANAGEMENT SYSTEM
 * 
 * Manages PayPal donations and infrastructure spending
 * Priorities: Claude API → Video AI → Cloud Infrastructure
 */

const crypto = require('crypto');

// Donation Tracking
class DonationManager {
    constructor(config = {}) {
        this.paypalBusiness = config.paypalBusiness || 'ANM2KU4NFUXHQ';
        this.currency = config.currency || 'USD';
        this.donations = new Map();
        this.spending = new Map();
        this.budget = config.monthlyBudget || 200; // USD monthly budget
        
        this.services = this.initializeServices();
    }

    initializeServices() {
        return {
            // High Priority - AI APIs
            anthropic: {
                name: 'Anthropic Claude API',
                priority: 'high',
                cost: 50, // USD/month
                endpoint: 'https://api.anthropic.com',
                required: true
            },
            openai: {
                name: 'OpenAI API (GPT-4)',
                priority: 'high',
                cost: 30,
                endpoint: 'https://api.openai.com/v1',
                required: true
            },
            huggingface: {
                name: 'HuggingFace Pro',
                priority: 'medium',
                cost: 20,
                endpoint: 'https://api.huggingface.co',
                required: false
            },
            
            // Medium Priority - Cloud
            vercel: {
                name: 'Vercel Pro',
                priority: 'medium',
                cost: 20,
                endpoint: 'https://api.vercel.com',
                required: false
            },
            railway: {
                name: 'Railway',
                priority: 'medium',
                cost: 15,
                endpoint: 'https://railway.app',
                required: false
            },
            supabase: {
                name: 'Supabase',
                priority: 'medium',
                cost: 25,
                endpoint: 'https://api.supabase.com',
                required: false
            },
            
            // Low Priority - Video/Content
            elevenlabs: {
                name: 'ElevenLabs',
                priority: 'low',
                cost: 30,
                endpoint: 'https://api.elevenlabs.io',
                required: false
            },
            runway: {
                name: 'RunwayML',
                priority: 'low',
                cost: 30,
                endpoint: 'https://api.runwayml.com',
                required: false
            },
            midjourney: {
                name: 'Midjourney',
                priority: 'low',
                cost: 30,
                endpoint: 'discord.com',
                required: false
            },
            
            // Infrastructure
            cloudflare: {
                name: 'Cloudflare Pro',
                priority: 'low',
                cost: 20,
                endpoint: 'https://api.cloudflare.com',
                required: false
            },
            domain: {
                name: 'Domains',
                priority: 'low',
                cost: 15,
                required: false
            }
        };
    }

    // Track incoming donation
    trackDonation(donation) {
        const record = {
            id: `don_${Date.now()}`,
            amount: donation.amount,
            currency: donation.currency || this.currency,
            donor: donation.donor || 'anonymous',
            message: donation.message,
            platform: donation.platform || 'paypal',
            status: 'confirmed',
            timestamp: Date.now(),
            allocatedTo: null
        };
        
        this.donations.set(record.id, record);
        return record;
    }

    // Allocate budget for service
    allocateBudget(serviceId, amount) {
        const service = this.services[serviceId];
        if (!service) throw new Error('Service not found');
        
        const allocation = {
            serviceId,
            amount,
            allocatedAt: Date.now(),
            status: 'active'
        };
        
        if (!this.spending.has(serviceId)) {
            this.spending.set(serviceId, []);
        }
        this.spending.get(serviceId).push(allocation);
        
        return allocation;
    }

    // Check if we can afford a service
    canAfford(serviceId) {
        const service = this.services[serviceId];
        if (!service) return false;
        
        const totalBudget = this.getTotalBudget();
        const allocated = this.getAllocated();
        const remaining = totalBudget - allocated;
        
        return remaining >= service.cost;
    }

    getTotalBudget() {
        const donations = Array.from(this.donations.values())
            .filter(d => d.status === 'confirmed');
        const donationTotal = donations.reduce((sum, d) => sum + d.amount, 0);
        
        return Math.min(donationTotal + this.budget, 1000); // Cap at $1000
    }

    getAllocated() {
        let total = 0;
        for (const allocations of this.spending.values()) {
            total += allocations.reduce((sum, a) => sum + a.amount, 0);
        }
        return total;
    }

    // Get recommendation for best service to enable
    getRecommendation() {
        const enabled = Object.entries(this.services)
            .filter(([id, s]) => this.canAfford(id) && !this.isEnabled(id))
            .sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a[1].priority] - priorityOrder[b[1].priority];
            });
        
        if (enabled.length === 0) return null;
        
        return {
            serviceId: enabled[0][0],
            service: enabled[0][1],
            reason: `Highest priority service (${enabled[0][1].priority}) that fits budget`
        };
    }

    isEnabled(serviceId) {
        const allocations = this.spending.get(serviceId) || [];
        return allocations.some(a => a.status === 'active');
    }

    // Generate PayPal donation link
    generateDonationLink(config = {}) {
        const baseUrl = 'https://www.paypal.com/donate';
        const params = new URLSearchParams({
            business: this.paypalBusiness,
            no_recurring: '0',
            currency_code: this.currency
        });
        
        if (config.amount) params.append('amount', config.amount);
        if (config.itemName) params.append('item_name', config.itemName);
        
        return `${baseUrl}?${params.toString()}`;
    }

    getDashboard() {
        const totalBudget = this.getTotalBudget();
        const allocated = this.getAllocated();
        
        const serviceStatus = {};
        for (const [id, service] of Object.entries(this.services)) {
            serviceStatus[id] = {
                ...service,
                enabled: this.isEnabled(id),
                allocated: this.spending.has(id) 
                    ? this.spending.get(id).reduce((sum, a) => sum + a.amount, 0) 
                    : 0
            };
        }

        return {
            totalBudget,
            allocated,
            available: totalBudget - allocated,
            monthlyBudget: this.budget,
            donationCount: this.donations.size,
            servicesEnabled: Object.values(serviceStatus).filter(s => s.enabled).length,
            servicesTotal: Object.keys(this.services).length,
            recommendations: this.getRecommendation(),
            serviceStatus,
            timestamp: Date.now()
        };
    }
}

// API Usage Tracker
class APIUsageTracker {
    constructor() {
        this.usage = new Map();
        this.limits = {
            anthropic: { monthly: 100000, unit: 'tokens' },
            openai: { monthly: 500000, unit: 'tokens' },
            huggingface: { monthly: 10000, unit: 'requests' },
            elevenlabs: { monthly: 10000, unit: 'characters' },
            runw 300, unit: 'seconds' }
        };
    }

    trackUsage(apiId, usage) {
        if (!this.usage.has(apiId)) {
            this.usage.set(apiId, []);
        }
        this.usage.get(apiId).push({
            ...usage,
            timestamp: Date.now()
        });
    }

    getRemaining(apiId) {
        const used = this.usage.get(apiId)?.reduce((sum, u) => sum + (u.amount || 1), 0) || 0;
        const limit = this.limits[apiId]?.monthly || Infinity;
        return Math.max(0, limit - used);
    }

    getDashboard() {
        const status = {};
        for (const apiId of Object.keys(this.limits)) {
            status[apiId] = {
                used: this.usage.get(apiId)?.reduce((sum, u) => sum + (u.amount || 1), 0) || 0,
                limit: this.limits[apiId]?.monthly,
                remaining: this.getRemaining(apiId),
                percentage: this.getRemaining(apiId) / (this.limits[apiId]?.monthly || 1) * 100
            };
        }
        return status;
    }
}

// Export
module.exports = {
    DonationManager,
    APIUsageTracker
};
