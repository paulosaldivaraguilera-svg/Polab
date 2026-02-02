/**
 * E-commerce Price Monitor Agent
 * 
 Agente de monitoreo de precios para e-commerce:
 * - Rastrea precios de múltiples sitios
 * - Detecta cambios y alertas
 * - Histórico de precios
 * - Integración con notifications
 */

class PriceMonitor {
    constructor(config = {}) {
        this.targets = new Map();  // productId -> target config
        this.history = new Map();  // productId -> price history
        this.checkInterval = config.interval || 3600000;  // 1 hora
        this.alertThreshold = config.alertThreshold || 0.1;  // 10% cambio
        this.notifier = config.notifier || null;
        this.running = false;
    }
    
    // Agregar producto a monitorear
    addTarget(product) {
        this.targets.set(product.id, {
            ...product,
            addedAt: Date.now(),
            lastCheck: null,
            lastPrice: null,
            active: true
        });
        
        this.history.set(product.id, []);
        console.log(`[PriceMonitor] Added target: ${product.name} (${product.url})`);
    }
    
    // Remover producto
    removeTarget(productId) {
        this.targets.delete(productId);
        this.history.delete(productId);
    }
    
    // Ejecutar verificación
    async checkPrice(productId) {
        const target = this.targets.get(productId);
        if (!target || !target.active) return null;
        
        try {
            // En producción: usar Playwright/Puppeteer
            // const page = await browser.newPage();
            // await page.goto(target.url, { waitUntil: 'networkidle' });
            // const price = await this.extractPrice(page, target.selectors);
            // await page.close();
            
            // Simulación
            const price = this.simulatePrice(target);
            
            const record = {
                productId,
                price,
                timestamp: Date.now(),
                url: target.url
            };
            
            // Guardar en histórico
            const productHistory = this.history.get(productId);
            productHistory.push(record);
            
            // Mantener solo últimos 100 registros
            if (productHistory.length > 100) {
                productHistory.shift();
            }
            
            // Actualizar target
            target.lastCheck = Date.now();
            target.lastPrice = price;
            
            // Verificar cambios
            await this.checkForAlerts(target, price);
            
            return record;
        } catch (error) {
            console.error(`[PriceMonitor] Error checking ${productId}:`, error.message);
            return null;
        }
    }
    
    simulatePrice(target) {
        // Simular variación de precio para demo
        const basePrice = target.basePrice || 100;
        const variation = (Math.random() - 0.5) * 20;
        return Math.round((basePrice + variation) * 100) / 100;
    }
    
    // Extraer precio de página (template)
    async extractPrice(page, selectors) {
        // Template para implementar según sitio específico
        const selectorsArray = selectors || ['.price', '[data-price]', '.amount'];
        
        for (const selector of selectorsArray) {
            const element = await page.$(selector);
            if (element) {
                const text = await element.textContent();
                const price = this.parsePrice(text);
                if (price) return price;
            }
        }
        return null;
    }
    
    parsePrice(text) {
        if (!text) return null;
        // Extraer número de string
        const match = text.replace(/[^0-9.,]/g, '').replace(/,/g, '.');
        const price = parseFloat(match);
        return isNaN(price) ? null : price;
    }
    
    // Verificar alertas
    async checkForAlerts(target, currentPrice) {
        if (!target.lastPrice || target.lastPrice === currentPrice) return;
        
        const change = (currentPrice - target.lastPrice) / target.lastPrice;
        const absChange = Math.abs(change);
        
        if (absChange >= this.alertThreshold) {
            const alert = {
                productId: target.id,
                productName: target.name,
                oldPrice: target.lastPrice,
                newPrice: currentPrice,
                change: `${(change * 100).toFixed(1)}%`,
                direction: change < 0 ? 'BAJÓ' : 'SUBIÓ',
                timestamp: Date.now()
            };
            
            console.log(`[PriceMonitor] ALERT: ${alert.productName} ${alert.direction} a $${alert.newPrice}`);
            
            // Enviar notificación
            if (this.notifier) {
                await this.notifier.send(alert);
            }
        }
    }
    
    // Ejecutar verificación de todos
    async checkAll() {
        const results = [];
        for (const productId of this.targets.keys()) {
            const result = await this.checkPrice(productId);
            if (result) results.push(result);
        }
        return results;
    }
    
    // Iniciar monitoreo automático
    start() {
        if (this.running) return;
        this.running = true;
        
        this.intervalId = setInterval(async () => {
            if (this.running) {
                await this.checkAll();
            }
        }, this.checkInterval);
        
        console.log(`[PriceMonitor] Started with ${this.targets.size} targets`);
    }
    
    // Detener monitoreo
    stop() {
        this.running = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        console.log('[PriceMonitor] Stopped');
    }
    
    // Obtener estadísticas
    getStats() {
        const stats = {
            totalTargets: this.targets.size,
            activeTargets: Array.from(this.targets.values()).filter(t => t.active).length,
            priceHistory: {},
            lowestPrices: {},
            highestPrices: {}
        };
        
        for (const [productId, history] of this.history) {
            if (history.length > 0) {
                const prices = history.map(h => h.price);
                stats.priceHistory[productId] = history.length;
                stats.lowestPrices[productId] = Math.min(...prices);
                stats.highestPrices[productId] = Math.max(...prices);
            }
        }
        
        return stats;
    }
    
    // Exportar histórico
    exportHistory(productId) {
        const history = this.history.get(productId);
        if (!history) return null;
        
        return history.map(h => ({
            price: h.price,
            timestamp: new Date(h.timestamp).toISOString(),
            url: h.url
        }));
    }
}

// Notificador simple
class PriceAlertNotifier {
    constructor(config = {}) {
        this.channels = config.channels || ['console'];
    }
    
    async send(alert) {
        const message = `📦 ${alert.productName}\n${alert.direction} $${alert.newPrice} (${alert.change})\n\nAntes: $${alert.oldPrice}`;
        
        for (const channel of this.channels) {
            switch (channel) {
                case 'console':
                    console.log(`\n${'='.repeat(40)}`);
                    console.log(`   💰 ALERTA DE PRECIO`);
                    console.log(`${'='.repeat(40)}`);
                    console.log(message);
                    break;
                case 'webhook':
                    // await fetch(config.webhookUrl, { method: 'POST', body: JSON.stringify(alert) });
                    break;
                case 'whatsapp':
                    // await whatsapp.send(message);
                    break;
            }
        }
    }
}

// Uso del sistema
async function main() {
    const notifier = new PriceAlertNotifier({ channels: ['console'] });
    const monitor = new PriceMonitor({
        interval: 60000,  // 1 minuto para demo
        alertThreshold: 0.05,  // 5% cambio
        notifier
    });
    
    // Agregar productos
    monitor.addTarget({
        id: 'laptop-001',
        name: 'MacBook Pro 14"',
        url: 'https://example.com/macbook-pro',
        basePrice: 1999,
        selectors: ['.price-current', '[data-price]']
    });
    
    monitor.addTarget({
        id: 'gpu-001',
        name: 'NVIDIA RTX 4080',
        url: 'https://example.com/rtx-4080',
        basePrice: 1199,
        selectors: ['.price', '.amount']
    });
    
    // Iniciar
    monitor.start();
    
    // Verificar una vez
    await monitor.checkAll();
    
    // Mostrar stats
    console.log('\n[Stats]', monitor.getStats());
}

module.exports = { PriceMonitor, PriceAlertNotifier };
