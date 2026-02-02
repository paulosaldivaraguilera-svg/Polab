/**
 * Economic Dashboard - Monitoreo del Agente Económico
 * 
 * Métricas:
 * - Rendimiento de inferencia local
 * - Actividad del agente
 * - Ingresos/Costs
 * - Salud del sistema
 */

class EconomicDashboard {
    constructor(config = {}) {
        this.metrics = {
            inference: {
                totalTokens: 0,
                totalTime: 0,
                avgTPS: 0,
                modelsUsed: new Map(),
                costSavings: 0  // vs APIs comerciales
            },
            agent: {
                posts: 0,
                interactions: 0,
                engagement: 0,
                activeHours: []
            },
            finance: {
                revenue: 0,
                costs: 0,
                investments: 0,
                passiveIncome: 0
            },
            system: {
                uptime: 0,
                temperature: 0,
                memory: 0,
                storage: 0
            }
        };
        this.history = [];
        this.alerts = [];
    }
    
    // Registrar inferencia
    recordInference(model, tokens, timeMs) {
        const tps = tokens / (timeMs / 1000);
        
        this.metrics.inference.totalTokens += tokens;
        this.metrics.inference.totalTime += timeMs;
        
        // Calcular TPS promedio
        const currentAvg = this.metrics.inference.avgTPS;
        const count = this.metrics.inference.modelsUsed.size + 1;
        this.metrics.inference.avgTPS = (currentAvg * (count - 1) + tps) / count;
        
        // Tracking por modelo
        if (!this.metrics.inference.modelsUsed.has(model)) {
            this.metrics.inference.modelsUsed.set(model, { tokens: 0, time: 0, count: 0 });
        }
        const modelStats = this.metrics.inference.modelsUsed.get(model);
        modelStats.tokens += tokens;
        modelStats.time += timeMs;
        modelStats.count += 1;
        
        // Calcular ahorro vs API
        // GPT-4o: ~$30/millón tokens input, $60/millón output
        // Ollama local: $0 (solo electricidad)
        const apiCost = (tokens / 1000000) * 0.03; // Costo promedio
        this.metrics.inference.costSavings += apiCost;
        
        return { tps, model, costSaved: apiCost };
    }
    
    // Registrar actividad del agente
    recordActivity(type, data = {}) {
        if (type === 'post') {
            this.metrics.agent.posts++;
        } else if (type === 'interaction') {
            this.metrics.agent.interactions++;
        }
        
        const hour = new Date().getHours();
        if (!this.metrics.agent.activeHours.includes(hour)) {
            this.metrics.agent.activeHours.push(hour);
        }
        
        if (data.engagement) {
            this.metrics.agent.engagement = 
                (this.metrics.agent.engagement * 0.9) + (data.engagement * 0.1);
        }
    }
    
    // Registrar financials
    recordTransaction(type, amount, description = '') {
        if (type === 'revenue') {
            this.metrics.finance.revenue += amount;
        } else if (type === 'cost') {
            this.metrics.finance.costs += amount;
        } else if (type === 'investment') {
            this.metrics.finance.investments += amount;
        } else if (type === 'passive') {
            this.metrics.finance.passiveIncome += amount;
        }
        
        this.history.push({
            type,
            amount,
            description,
            timestamp: Date.now()
        });
        
        // Mantener historial de 1000 registros
        if (this.history.length > 1000) {
            this.history.shift();
        }
    }
    
    // Actualizar métricas del sistema
    updateSystemMetrics(data) {
        this.metrics.system.uptime = data.uptime || this.metrics.system.uptime;
        this.metrics.system.temperature = data.temperature || this.metrics.system.temperature;
        this.metrics.system.memory = data.memory || this.metrics.system.memory;
        this.metrics.system.storage = data.storage || this.metrics.system.storage;
    }
    
    // Calcular ROI
    calculateROI() {
        const totalCosts = this.metrics.finance.costs + this.metrics.finance.investments;
        const totalRevenue = this.metrics.finance.revenue + this.metrics.finance.passiveIncome;
        const costSavings = this.metrics.inference.costSavings;
        
        return {
            grossProfit: totalRevenue - totalCosts,
            netProfit: totalRevenue - totalCosts + costSavings,
            roi: totalCosts > 0 ? ((totalRevenue + costSavings - totalCosts) / totalCosts) * 100 : 0,
            breakEven: totalCosts > 0 ? totalCosts / Math.max(1, totalRevenue + costSavings) : 0
        };
    }
    
    // Generar reporte
    generateReport() {
        const roi = this.calculateROI();
        
        return {
            timestamp: new Date().toISOString(),
            inference: {
                totalTokens: this.metrics.inference.totalTokens,
                avgTPS: this.metrics.inference.avgTPS.toFixed(2),
                costSavings: this.metrics.inference.costSavings.toFixed(2),
                models: Object.fromEntries(this.metrics.inference.modelsUsed)
            },
            agent: {
                posts: this.metrics.agent.posts,
                interactions: this.metrics.agent.interactions,
                engagementRate: (this.metrics.agent.engagement * 100).toFixed(2) + '%',
                activeHours: this.metrics.agent.activeHours
            },
            finance: {
                revenue: this.metrics.finance.revenue.toFixed(2),
                costs: this.metrics.finance.costs.toFixed(2),
                passiveIncome: this.metrics.finance.passiveIncome.toFixed(2),
                totalInvestments: this.metrics.finance.investments.toFixed(2)
            },
            roi: {
                grossProfit: roi.grossProfit.toFixed(2),
                netProfit: roi.netProfit.toFixed(2),
                roiPercent: roi.roi.toFixed(2) + '%'
            },
            system: {
                uptime: this.formatUptime(this.metrics.system.uptime),
                temperature: this.metrics.system.temperature + '°C',
                memory: this.metrics.system.memory + '%'
            }
        };
    }
    
    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${mins}m`;
    }
    
    // Renderizar dashboard HTML
    renderDashboard() {
        const report = this.generateReport();
        
        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PauloARIS Economic Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>
        * { font-family: 'JetBrains Mono', monospace; }
        .glow { animation: glow 2s ease-in-out infinite alternate; }
        @keyframes glow { from { box-shadow: 0 0 5px #10b981; } to { box-shadow: 0 0 20px #10b981; } }
    </style>
</head>
<body class="bg-gray-900 text-green-400 min-h-screen p-6">
    <header class="mb-8 border-b border-green-500/30 pb-4">
        <h1 class="text-3xl font-bold glow">💰 PauloARIS Economic Dashboard</h1>
        <p class="text-gray-500 mt-2">Monitoreo de agente económico autónomo</p>
    </header>

    <!-- KPIs -->
    <div class="grid grid-cols-4 gap-4 mb-8">
        <div class="bg-gray-800 p-4 rounded-lg border border-green-500/30">
            <div class="text-gray-500 text-xs">Ahorro en APIs</div>
            <div class="text-3xl font-bold text-green-400">$${report.inference.costSavings}</div>
            <div class="text-xs text-gray-600">vs GPT-4o</div>
        </div>
        <div class="bg-gray-800 p-4 rounded-lg border border-green-500/30">
            <div class="text-gray-500 text-xs">ROI</div>
            <div class="text-3xl font-bold ${report.roi.roiPercent.includes('-') ? 'text-red-400' : 'text-green-400'}">${report.roi.roiPercent}</div>
            <div class="text-xs text-gray-600">Retorno sobre inversión</div>
        </div>
        <div class="bg-gray-800 p-4 rounded-lg border border-green-500/30">
            <div class="text-gray-500 text-xs">Tokens Procesados</div>
            <div class="text-3xl font-bold text-green-400">${(report.inference.totalTokens / 1000).toFixed(0)}K</div>
            <div class="text-xs text-gray-600">TPS: ${report.inference.avgTPS}</div>
        </div>
        <div class="bg-gray-800 p-4 rounded-lg border border-green-500/30">
            <div class="text-gray-500 text-xs">Posts Publicados</div>
            <div class="text-3xl font-bold text-green-400">${report.agent.posts}</div>
            <div class="text-xs text-gray-600">Engagement: ${report.agent.engagementRate}</div>
        </div>
    </div>

    <!-- Detalles -->
    <div class="grid grid-cols-2 gap-6">
        <!-- Inference -->
        <div class="bg-gray-800 p-6 rounded-lg border border-green-500/30">
            <h2 class="text-xl font-bold mb-4">🧠 Inferencia Local</h2>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span>Tokens/segundo promedio:</span>
                    <span class="text-white">${report.inference.avgTPS}</span>
                </div>
                <div class="flex justify-between">
                    <span>Modelos usados:</span>
                    <span class="text-white">${Object.keys(report.inference.models).length}</span>
                </div>
                ${Object.entries(report.inference.models).map(([model, stats]) => `
                <div class="flex justify-between text-xs text-gray-400">
                    <span>${model}:</span>
                    <span>${stats.count} veces</span>
                </div>
                `).join('')}
            </div>
        </div>

        <!-- Finance -->
        <div class="bg-gray-800 p-6 rounded-lg border border-green-500/30">
            <h2 class="text-xl font-bold mb-4">💹 Finanzas</h2>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span>Ingresos:</span>
                    <span class="text-green-400">+$${report.finance.revenue}</span>
                </div>
                <div class="flex justify-between">
                    <span>Costos:</span>
                    <span class="text-red-400">-$${report.finance.costs}</span>
                </div>
                <div class="flex justify-between">
                    <span>Ingresos Pasivos:</span>
                    <span class="text-green-400">+$${report.finance.passiveIncome}</span>
                </div>
                <div class="flex justify-between border-t border-gray-700 pt-2 mt-2">
                    <span>Beneficio Neto:</span>
                    <span class="text-white font-bold">$${report.roi.netProfit}</span>
                </div>
            </div>
        </div>

        <!-- System -->
        <div class="bg-gray-800 p-6 rounded-lg border border-green-500/30">
            <h2 class="text-xl font-bold mb-4">🖥️ Sistema</h2>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span>Uptime:</span>
                    <span class="text-white">${report.system.uptime}</span>
                </div>
                <div class="flex justify-between">
                    <span>Temperatura:</span>
                    <span class="${report.system.temperature > 70 ? 'text-red-400' : 'text-white'}">${report.system.temperature}</span>
                </div>
                <div class="flex justify-between">
                    <span>Memoria:</span>
                    <span class="text-white">${report.system.memory}</span>
                </div>
            </div>
        </div>

        <!-- Agent Activity -->
        <div class="bg-gray-800 p-6 rounded-lg border border-green-500/30">
            <h2 class="text-xl font-bold mb-4">📱 Actividad del Agente</h2>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span>Total Posts:</span>
                    <span class="text-white">${report.agent.posts}</span>
                </div>
                <div class="flex justify-between">
                    <span>Interacciones:</span>
                    <span class="text-white">${report.agent.interactions}</span>
                </div>
                <div class="flex justify-between">
                    <span>Horas Activas:</span>
                    <span class="text-white">${report.agent.activeHours.join(', ') || 'Ninguna'}</span>
                </div>
            </div>
        </div>
    </div>

    <footer class="text-center text-gray-600 text-sm mt-8">
        <p>PauloARIS v2.1 | Soberanía Digital con Raspberry Pi 5</p>
        <p>Última actualización: ${report.timestamp}</p>
    </footer>
</body>
</html>`;
    }
}

module.exports = { EconomicDashboard };
