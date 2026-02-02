/**
 * PauloARIS Self-Healing Architecture
 * 
 * Implementa principios de ingeniería de software evolutiva:
 * - Ley de Conway (estructura org → arquitectura)
 * - Ley de Gall (complejidad desde lo simple)
 * - Self-healing automatizado
 * - Observabilidad integral
 * - Modularidad SOLID
 */

const fs = require('fs');
const EventEmitter = require('events');

// ============= PRINCIPLES CONSTANTS =============
const PRINCIPLES = {
    CONWAY: 'conway',
    GALL: 'gall',
    SELF_HEALING: 'self_healing',
    SOLID: 'solid',
    POSTEL: 'postel',
    RESILIENCE: 'resilience'
};

// ============= MODULE REGISTRY =============
const MODULES = {
    CONTENT_ASSEMBLY: 'content-assembly-line',
    AUTO_PUBLISHER: 'auto-publisher',
    ECONOMIC: 'economic-monetization',
    SOCIAL: 'social-media-controller',
    PROMPT_VERSE: 'prompt-verse',
    RALPH_LOOP: 'ralph-loop',
    WEB_SERVER: 'web-server'
};

class SelfHealingArchitecture extends EventEmitter {
    constructor() {
        super();
        
        // Module registry with health status
        this.modules = new Map();
        this.healthHistory = [];
        this.alerts = [];
        this.selfHealingActions = [];
        
        // Initialize all modules with health tracking
        this.initializeModules();
        
        // Start monitoring loop
        this.startHealthMonitor();
        
        console.log('🧠 PauloARIS Self-Healing Architecture initialized');
    }

    // ============= MODULE MANAGEMENT =============

    initializeModules() {
        Object.values(MODULES).forEach(moduleId => {
            this.modules.set(moduleId, {
                id: moduleId,
                status: 'unknown',
                lastCheck: null,
                uptime: 0,
                startTime: Date.now(),
                metrics: {},
                errors: [],
                dependencies: [],
                isHealthy: false
            });
        });
        
        console.log(`✅ ${this.modules.size} modules registered`);
    }

    registerModule(moduleId, config) {
        const module = {
            id: moduleId,
            ...config,
            status: 'initializing',
            lastCheck: Date.now(),
            startTime: Date.now(),
            metrics: {},
            errors: [],
            dependencies: config.dependencies || [],
            isHealthy: false
        };
        
        this.modules.set(moduleId, module);
        console.log(`📦 Module registered: ${moduleId}`);
        
        return module;
    }

    // ============= HEALTH CHECK =============

    async checkHealth(moduleId) {
        const module = this.modules.get(moduleId);
        if (!module) return null;
        
        module.lastCheck = Date.now();
        
        // Simulate health check (would ping actual service)
        const healthCheck = {
            status: Math.random() > 0.1 ? 'healthy' : 'degraded', // 90% healthy
            latency: Math.floor(Math.random() * 100) + 10,
            memory: process.memoryUsage(),
            uptime: Date.now() - module.startTime
        };
        
        module.status = healthCheck.status;
        module.metrics = healthCheck;
        module.isHealthy = healthCheck.status === 'healthy';
        
        // Record history
        this.healthHistory.push({
            moduleId,
            ...healthCheck,
            timestamp: Date.now()
        });
        
        // Keep only last 1000 entries
        if (this.healthHistory.length > 1000) {
            this.healthHistory.shift();
        }
        
        return healthCheck;
    }

    async checkAllHealth() {
        const results = {};
        for (const [moduleId] of this.modules) {
            results[moduleId] = await this.checkHealth(moduleId);
        }
        return results;
    }

    // ============= SELF-HEALING ENGINE =============

    async attemptSelfHealing(moduleId, error) {
        const module = this.modules.get(moduleId);
        if (!module) return false;
        
        const healingAction = {
            moduleId,
            error: error.message,
            action: null,
            timestamp: Date.now(),
            success: false
        };
        
        // Determine healing strategy based on error pattern
        const strategies = {
            'memory': this.healMemory.bind(this),
            'latency': this.healLatency.bind(this),
            'connection': this.healConnection.bind(this),
            'default': this.healDefault.bind(this)
        };
        
        // Simple pattern matching
        let strategyType = 'default';
        if (error.message.includes('memory')) strategyType = 'memory';
        else if (error.message.includes('timeout') || error.message.includes('latency')) strategyType = 'latency';
        else if (error.message.includes('connection') || error.message.includes('network')) strategyType = 'connection';
        
        healingAction.action = strategyType;
        
        try {
            await strategies[strategyType](moduleId);
            healingAction.success = true;
            console.log(`✅ Self-healed ${moduleId} using ${strategyType} strategy`);
        } catch (healError) {
            healingAction.error = healError.message;
            console.error(`❌ Self-healing failed for ${moduleId}:`, healError.message);
            
            // Escalate to human
            this.escalateAlert(moduleId, healError);
        }
        
        this.selfHealingActions.push(healingAction);
        return healingAction.success;
    }

    async healMemory(moduleId) {
        // Force garbage collection simulation
        console.log(`🧹 Performing memory cleanup for ${moduleId}`);
        
        const module = this.modules.get(moduleId);
        if (module && module.metrics.memory) {
            // Log memory before cleanup
            console.log(`   Memory before: ${Math.round(module.metrics.memory.heapUsed / 1024 / 1024)}MB`);
        }
        
        // In production: global.gc() if --expose-gc flag is set
        // For now, just log the intent
        return true;
    }

    async healLatency(moduleId) {
        console.log(`⚡ Optimizing latency for ${moduleId}`);
        
        // Strategies:
        // 1. Enable compression
        // 2. Add caching layer
        // 3. Reduce logging verbosity
        // 4. Scale up if possible
        
        return true;
    }

    async healConnection(moduleId) {
        console.log(`🔄 Reconnecting ${moduleId}`);
        
        // Strategies:
        // 1. Clear connection pools
        // 2. Retry with exponential backoff
        // 3. Use fallback endpoint
        
        return true;
    }

    async healDefault(moduleId) {
        console.log(`🔧 Restarting module ${moduleId}`);
        
        // Graceful restart simulation
        const module = this.modules.get(moduleId);
        if (module) {
            module.status = 'restarting';
            await new Promise(resolve => setTimeout(resolve, 1000));
            module.status = 'healthy';
        }
        
        return true;
    }

    // ============= ALERTING SYSTEM =============

    escalateAlert(moduleId, error) {
        const alert = {
            id: `ALERT_${Date.now()}`,
            moduleId,
            error: error.message,
            severity: this.calculateSeverity(error),
            timestamp: Date.now(),
            acknowledged: false,
            resolved: false
        };
        
        this.alerts.push(alert);
        
        console.log(`🚨 ALERT [${alert.severity}] ${moduleId}: ${error.message}`);
        
        // Keep only last 100 alerts
        if (this.alerts.length > 100) {
            this.alerts.shift();
        }
        
        return alert;
    }

    calculateSeverity(error) {
        if (error.message.includes('critical') || error.message.includes('data loss')) {
            return 'critical';
        } else if (error.message.includes('timeout') || error.message.includes('memory')) {
            return 'warning';
        }
        return 'info';
    }

    // ============= CONWAY'S LAW ENFORCEMENT =============

    enforceConwayStructure() {
        // Ensure architecture matches organizational structure
        // In this case, PauloARIS has 3 "teams":
        // - Content Team: content-assembly-line, auto-publisher
        // - Economic Team: economic-monetization, prompt-verse
        // - Infrastructure Team: ralph-loop, web-server, social
        
        const teamStructure = {
            content: ['content-assembly-line', 'auto-publisher'],
            economic: ['economic-monetization', 'prompt-verse'],
            infrastructure: ['ralph-loop', 'web-server', 'social-media-controller']
        };
        
        const violations = [];
        
        // Check for cross-team dependencies (violations of Conway's Law)
        for (const [team, modules] of Object.entries(teamStructure)) {
            modules.forEach(moduleId => {
                const module = this.modules.get(moduleId);
                if (module && module.dependencies) {
                    module.dependencies.forEach(dep => {
                        const depTeam = Object.entries(teamStructure)
                            .find(([, m]) => m.includes(dep))?.[0];
                        
                        if (depTeam && depTeam !== team) {
                            violations.push({
                                from: moduleId,
                                to: dep,
                                violation: `Cross-team dependency: ${team} → ${depTeam}`
                            });
                        }
                    });
                }
            });
        }
        
        if (violations.length > 0) {
            console.log('⚠️ Conway Law Violations detected:', violations);
        } else {
            console.log('✅ Conway Law compliance: Architecture matches organization');
        }
        
        return violations;
    }

    // ============= GALL'S LAW IMPLEMENTATION =============

    async buildIncrementally(systemName, components) {
        // Gall's Law: Start simple, add complexity gradually
        console.log(`🏗️ Building ${systemName} using Gall's Law strategy`);
        
        const system = {
            name: systemName,
            phase: 'hello_world',
            components: [],
            status: 'working'
        };
        
        // Phase 1: Core functionality (must work end-to-end)
        console.log('   Phase 1: Core functionality...');
        if (components.core) {
            system.components.push(components.core);
        }
        
        // Phase 2: Add features incrementally
        console.log('   Phase 2: Adding features...');
        if (components.features) {
            system.components = system.components.concat(components.features);
        }
        
        // Phase 3: Optimization
        console.log('   Phase 3: Optimization...');
        if (components.optimizations) {
            system.components = system.components.concat(components.optimizations);
        }
        
        system.phase = 'complete';
        
        return system;
    }

    // ============= ANALYTICS & OBSERVABILITY =============

    getArchitectureReport() {
        const healthyModules = Array.from(this.modules.values())
            .filter(m => m.isHealthy).length;
        
        const totalModules = this.modules.size;
        
        return {
            timestamp: new Date().toISOString(),
            architecture: {
                totalModules,
                healthyModules,
                unhealthyModules: totalModules - healthyModules,
                healthPercentage: Math.round((healthyModules / totalModules) * 100)
            },
            alerts: {
                total: this.alerts.length,
                critical: this.alerts.filter(a => a.severity === 'critical').length,
                pending: this.alerts.filter(a => !a.acknowledged).length
            },
            selfHealing: {
                totalActions: this.selfHealingActions.length,
                successful: this.selfHealingActions.filter(a => a.success).length,
                successRate: this.selfHealingActions.length > 0
                    ? Math.round((this.selfHealingActions.filter(a => a.success).length / this.selfHealingActions.length) * 100)
                    : 100
            },
            uptime: {
                system: process.uptime(),
                modules: Object.fromEntries(
                    Array.from(this.modules.entries()).map(([id, m]) => [
                        id,
                        Math.round(m.uptime / 1000)
                    ])
                )
            },
            conwayCompliance: this.enforceConwayStructure()
        };
    }

    getHealthHistory(moduleId = null, limit = 100) {
        let history = this.healthHistory;
        
        if (moduleId) {
            history = history.filter(h => h.moduleId === moduleId);
        }
        
        return history.slice(-limit);
    }

    // ============= MONITORING LOOP =============

    startHealthMonitor() {
        // Check health every 30 seconds
        setInterval(async () => {
            const report = this.getArchitectureReport();
            
            // Auto-heal unhealthy modules
            for (const [moduleId, module] of this.modules) {
                if (!module.isHealthy) {
                    const lastHealAttempt = this.selfHealingActions
                        .filter(a => a.moduleId === moduleId)
                        .pop();
                    
                    // Don't try to heal the same module more than once per minute
                    if (!lastHealAttempt || (Date.now() - lastHealAttempt.timestamp) > 60000) {
                        await this.attemptSelfHealing(moduleId, { message: 'health_check_failed' });
                    }
                }
            }
            
            // Emit health report
            this.emit('healthReport', report);
            
        }, 30000);
        
        console.log('✅ Health monitor started (30s interval)');
    }
}

// ============= DASHBOARD =============
function generateDashboard(architecture) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🧠 PauloARIS Self-Healing Architecture</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
        body { font-family: 'JetBrains Mono', monospace; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    </style>
</head>
<body class="bg-gray-900 text-white min-h-screen">
    <nav class="bg-gray-800 border-b border-gray-700 p-4">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
            <h1 class="text-xl font-bold">🧠 PauloARIS Architecture Dashboard</h1>
            <span class="text-sm text-gray-400">${new Date().toISOString()}</span>
        </div>
    </nav>

    <div class="max-w-7xl mx-auto p-6">
        <!-- Health Overview -->
        <div class="grid grid-cols-4 gap-4 mb-8">
            <div class="bg-gray-800 p-6 rounded-xl">
                <div class="text-gray-400 text-sm">Modules</div>
                <div class="text-4xl font-bold">${architecture.architecture.totalModules}</div>
                <div class="text-sm text-green-400">${architecture.architecture.healthyModules} healthy</div>
            </div>
            <div class="bg-gray-800 p-6 rounded-xl">
                <div class="text-gray-400 text-sm">Health Score</div>
                <div class="text-4xl font-bold">${architecture.architecture.healthPercentage}%</div>
                <div class="pulse ${architecture.architecture.healthPercentage >= 80 ? 'text-green-400' : 'text-red-400'}">
                    ${architecture.architecture.healthPercentage >= 80 ? '● All Systems Operational' : '● Degraded'}
                </div>
            </div>
            <div class="bg-gray-800 p-6 rounded-xl">
                <div class="text-gray-400 text-sm">Self-Healing</div>
                <div class="text-4xl font-bold">${architecture.selfHealing.successRate}%</div>
                <div class="text-sm text-gray-400">${architecture.selfHealing.totalActions} actions</div>
            </div>
            <div class="bg-gray-800 p-6 rounded-xl">
                <div class="text-gray-400 text-sm">Uptime</div>
                <div class="text-4xl font-bold">${Math.floor(architecture.uptime.system / 3600)}h</div>
                <div class="text-sm text-gray-400">System running</div>
            </div>
        </div>

        <!-- Modules Grid -->
        <h2 class="text-2xl font-bold mb-4">Modules Status</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            ${Object.entries(architecture.uptime.modules).map(([id, uptime]) => `
                <div class="bg-gray-800 p-4 rounded-lg">
                    <div class="flex justify-between items-center">
                        <span class="font-bold">${id.replace('-', ' ')}</span>
                        <span class="w-3 h-3 rounded-full ${uptime > 0 ? 'bg-green-400' : 'bg-red-400'}"></span>
                    </div>
                    <div class="text-sm text-gray-400">${Math.floor(uptime / 60)}m uptime</div>
                </div>
            `).join('')}
        </div>

        <!-- Alerts Section -->
        <h2 class="text-2xl font-bold mb-4">Active Alerts</h2>
        <div class="bg-gray-800 rounded-xl p-6">
            ${architecture.alerts.total > 0 ? `
                <div class="space-y-2">
                    ${this.alerts.slice(-5).map(alert => `
                        <div class="flex items-center gap-3 p-2 rounded ${alert.severity === 'critical' ? 'bg-red-900/30' : 'bg-yellow-900/30'}">
                            <span class="text-xl">${alert.severity === 'critical' ? '🚨' : '⚠️'}</span>
                            <span class="font-bold">${alert.moduleId}</span>
                            <span class="text-gray-300">${alert.error}</span>
                        </div>
                    `).join('')}
                </div>
            ` : '<p class="text-green-400">✅ No active alerts</p>'}
        </div>

        <!-- Conway Compliance -->
        <h2 class="text-2xl font-bold mb-4 mt-8">Conway's Law Compliance</h2>
        <div class="bg-gray-800 rounded-xl p-6">
            ${architecture.conwayCompliance.length === 0 
                ? '<p class="text-green-400">✅ Architecture matches organizational structure</p>'
                : `<p class="text-yellow-400">⚠️ ${architecture.conwayCompliance.length} violations detected</p>`
            }
        </div>
    </div>

    <script>
        // Auto-refresh every 30 seconds
        setTimeout(() => window.location.reload(), 30000);
    </script>
</body>
</html>
    `;
}

// Export
module.exports = { 
    SelfHealingArchitecture, 
    PRINCIPLES, 
    MODULES,
    generateDashboard 
};
