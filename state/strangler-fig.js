/**
 * Strangler Fig Pattern - Legacy Migration
 * 
 * Implementación del patrón para migrar sistemas legacy paso a paso.
 * 
 * Concepto: En lugar de reescribir todo (Big Bang), se migra funcionalidad
 * por funcionalidad, dejando el sistema legacy运行 hasta que el nuevo
 * esté completamente funcional.
 */

class StranglerFigRouter {
    constructor(config = {}) {
        this.routes = new Map();     // path -> newImplementation
        this.legacyHandler = null;   // Fallback al sistema legacy
        this.metrics = {
            requests: { legacy: 0, new: 0 },
            latency: { legacy: 0, new: 0 },
            errors: { legacy: 0, new: 0 }
        };
        this.mirroringEnabled = config.mirror || false;
    }
    
    // Registrar una ruta migrada
    registerRoute(path, newHandler, options = {}) {
        this.routes.set(path, {
            handler: newHandler,
            mirror: options.mirror || false,
            canary: options.canary || 0,  // % de tráfico al nuevo
            migratedAt: Date.now()
        });
        console.log(`[Strangler] Route migrated: ${path}`);
    }
    
    // Establecer handler legacy
    setLegacyHandler(handler) {
        this.legacyHandler = handler;
    }
    
    // Ejecutar request
    async handle(request) {
        const path = this.getPath(request);
        const route = this.routes.get(path);
        
        const startTime = Date.now();
        
        if (route) {
            // Determinar si va a nuevo o legacy (canary release)
            const useNew = this.shouldUseNew(route);
            
            try {
                let result;
                if (useNew) {
                    result = await route.handler(request);
                    this.metrics.requests.new++;
                    this.metrics.latency.new = Date.now() - startTime;
                    
                    // Mirroring: también ejecutar legacy para comparación
                    if (this.mirroringEnabled && route.mirror) {
                        this.mirrorRequest(request, route);
                    }
                } else {
                    result = await this.legacyHandler(request);
                    this.metrics.requests.legacy++;
                    this.metrics.latency.legacy = Date.now() - startTime;
                }
                return result;
            } catch (error) {
                this.metrics.errors[useNew ? 'new' : 'legacy']++;
                throw error;
            }
        } else {
            // Ruta no migrada, todo al legacy
            return this.legacyHandler(request);
        }
    }
    
    shouldUseNew(route) {
        // Canary release: % de tráfico al nuevo sistema
        const canaryPercent = route.canary || 0;
        return Math.random() * 100 < canaryPercent;
    }
    
    async mirrorRequest(request, route) {
        // Ejecutar en background sin bloquear
        setTimeout(async () => {
            try {
                const legacyResult = await this.legacyHandler(request);
                const newResult = await route.handler(request);
                
                // Comparar resultados
                this.compareResults(route.handler.name, legacyResult, newResult);
            } catch (e) {
                console.log(`[Mirror] Error comparing: ${e.message}`);
            }
        }, 0);
    }
    
    compareResults(handlerName, legacy, newResult) {
        const diff = this.deepDiff(legacy, newResult);
        if (Object.keys(diff).length > 0) {
            console.log(`[Mirror] Diff detected in ${handlerName}:`, diff);
        }
    }
    
    deepDiff(a, b) {
        const diff = {};
        if (JSON.stringify(a) !== JSON.stringify(b)) {
            // Simple comparison - enhance as needed
            diff.timestamp = new Date().toISOString();
        }
        return diff;
    }
    
    getPath(request) {
        return request.url || request.path || '/';
    }
    
    // Obtener métricas de migración
    getMigrationStatus() {
        const total = this.metrics.requests.legacy + this.metrics.requests.new;
        const percentNew = total > 0 ? (this.metrics.requests.new / total * 100) : 0;
        
        return {
            routesMigrated: this.routes.size,
            trafficToNew: `${percentNew.toFixed(1)}%`,
            metrics: this.metrics,
            readyToCutover: percentNew > 95  // 95% tráfico = migrado
        };
    }
}

// Migration Orchestrator
class MigrationOrchestrator {
    constructor() {
        this.phases = [];
        this.currentPhase = 0;
    }
    
    // Definir fases de migración
    addPhase(phase) {
        this.phases.push({
            ...phase,
            status: 'pending',
            startedAt: null,
            completedAt: null
        });
    }
    
    async executePhase(phaseIndex) {
        const phase = this.phases[phaseIndex];
        phase.status = 'running';
        phase.startedAt = Date.now();
        
        try {
            await phase.execute();
            phase.status = 'completed';
            phase.completedAt = Date.now();
            return { success: true, phase };
        } catch (error) {
            phase.status = 'failed';
            phase.error = error.message;
            return { success: false, error };
        }
    }
    
    async runAll() {
        const results = [];
        for (let i = 0; i < this.phases.length; i++) {
            const result = await this.executePhase(i);
            results.push(result);
            if (!result.success) break;
        }
        return results;
    }
    
    getStatus() {
        return this.phases.map((p, i) => ({
            phase: i + 1,
            name: p.name,
            status: p.status,
            readyToStart: p.status === 'pending' && 
                          (i === 0 || this.phases[i-1].status === 'completed')
        }));
    }
}

// Ejemplo de uso para migrar APIs legacy
/*
const router = new StranglerFigRouter({ mirror: true });

// Fase 1: Rutas simples (GET)
router.registerRoute('/api/health', newHealthCheckHandler, { canary: 10 });

// Fase 2: Rutas de lectura (GET con lógica)
router.registerRoute('/api/users/:id', newUserHandler, { canary: 25 });

// Fase 3: Rutas de escritura (POST/PUT)
router.registerRoute('/api/leads', newLeadHandler, { canary: 50 });

// Ejecutar migraciones
const orchestrator = new MigrationOrchestrator();
orchestrator.addPhase({ name: 'Health Check', execute: async () => {...} });
orchestrator.addPhase({ name: 'Read Operations', execute: async () => {...} });
*/

module.exports = { StranglerFigRouter, MigrationOrchestrator };
