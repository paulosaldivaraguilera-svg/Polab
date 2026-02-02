/**
 * Observability System - Agent Tracing
 * 
 * Sistema de observabilidad para agentes:
 - Distributed tracing (LangSmith-style)
 - Metrics collection
 - Logging estructurado
 - Alerting
 */

class Tracing {
    constructor(config = {}) {
        this.traces = new Map();
        this.spans = new Map();
        this.config = {
            serviceName: config.serviceName || 'pauloaris-agent',
            sampleRate: config.sampleRate || 1.0,
            maxDepth: config.maxDepth || 10
        };
        this.currentSpan = null;
    }

    // Iniciar trace
    startTrace(name, context = {}) {
        const traceId = crypto.randomUUID();
        const trace = {
            traceId,
            name,
            context,
            startTime: Date.now(),
            endTime: null,
            status: 'pending',
            spans: [],
            errors: []
        };

        this.traces.set(traceId, trace);
        return traceId;
    }

    // Iniciar span dentro de trace
    startSpan(traceId, name, attributes = {}) {
        const trace = this.traces.get(traceId);
        if (!trace) return null;

        const spanId = crypto.randomUUID();
        const span = {
            spanId,
            traceId,
            name,
            attributes,
            startTime: Date.now(),
            endTime: null,
            parentSpanId: this.currentSpan?.spanId,
            status: 'pending',
            events: []
        };

        this.spans.set(spanId, span);
        trace.spans.push(span);
        this.currentSpan = span;

        return spanId;
    }

    // Agregar evento a span
    addEvent(spanId, eventName, attributes = {}) {
        const span = this.spans.get(spanId);
        if (!span) return;

        span.events.push({
            name: eventName,
            timestamp: Date.now(),
            attributes
        });
    }

    // Finalizar span
    endSpan(spanId, status = 'ok', attributes = {}) {
        const span = this.spans.get(spanId);
        if (!span) return;

        span.endTime = Date.now();
        span.status = status;
        span.attributes = { ...span.attributes, ...attributes };
        span.duration = span.endTime - span.startTime;

        this.currentSpan = span.parentSpanId 
            ? this.spans.get(span.parentSpanId) 
            : null;

        return span;
    }

    // Finalizar trace
    endTrace(traceId, status = 'ok') {
        const trace = this.traces.get(traceId);
        if (!trace) return null;

        trace.endTime = Date.now();
        trace.status = status;
        trace.duration = trace.endTime - trace.startTime;

        // Calcular métricas
        trace.summary = this.calculateTraceSummary(trace);

        return trace;
    }

    calculateTraceSummary(trace) {
        const spans = trace.spans;
        return {
            totalDuration: trace.duration,
            spanCount: spans.length,
            errorCount: spans.filter(s => s.status === 'error').length,
            avgSpanDuration: spans.reduce((a, s) => a + (s.duration || 0), 0) / spans.length,
            slowestSpan: spans.reduce((max, s) => 
                (s.duration || 0) > (max.duration || 0) ? s : max, spans[0] || {}),
            eventCount: spans.reduce((a, s) => a + s.events.length, 0)
        };
    }

    // Buscar traces
    search(filters = {}) {
        let results = Array.from(this.traces.values());

        if (filters.serviceName) {
            results = results.filter(t => t.context?.serviceName === filters.serviceName);
        }
        if (filters.status) {
            results = results.filter(t => t.status === filters.status);
        }
        if (filters.startDate) {
            results = results.filter(t => t.startTime >= new Date(filters.startDate).getTime());
        }

        return results.sort((a, b) => b.startTime - a.startTime).slice(0, 100);
    }

    // Obtener trace completo
    getTrace(traceId) {
        const trace = this.traces.get(traceId);
        if (!trace) return null;

        trace.spans = trace.spans.map(span => ({
            ...span,
            events: this.spans.get(span.spanId)?.events || []
        }));

        return trace;
    }

    // Export para debugging
    exportTrace(traceId) {
        const trace = this.getTrace(traceId);
        return trace ? JSON.stringify(trace, null, 2) : null;
    }
}

// Métricas
class Metrics {
    constructor(config = {}) {
        this.counters = new Map();
        this.gauges = new Map();
        this.histograms = new Map();
        this.config = config;
    }

    // Counter (incrementa)
    increment(name, value = 1, tags = {}) {
        const key = `${name}:${JSON.stringify(tags)}`;
        this.counters.set(key, (this.counters.get(key) || 0) + value);
    }

    // Gauge (valor actual)
    gauge(name, value, tags = {}) {
        const key = `${name}:${JSON.stringify(tags)}`;
        this.gauges.set(key, { value, timestamp: Date.now() });
    }

    // Histogram (distribución)
    histogram(name, value, tags = {}) {
        const key = `${name}:${JSON.stringify(tags)}`;
        if (!this.histograms.has(key)) {
            this.histograms.set(key, []);
        }
        this.histograms.get(key).push({ value, timestamp: Date.now() });
    }

    // Obtener métricas
    getMetrics() {
        return {
            counters: Object.fromEntries(this.counters),
            gauges: Object.fromEntries(this.gauges),
            histograms: Object.fromEntries(
                Array.from(this.histograms).map(([k, v]) => {
                    const values = v.map(x => x.value);
                    return [k, {
                        count: values.length,
                        sum: values.reduce((a, b) => a + b, 0),
                        min: Math.min(...values),
                        max: Math.max(...values),
                        avg: values.reduce((a, b) => a + b, 0) / values.length
                    }];
                })
            )
        };
    }
}

// Logger estructurado
class StructuredLogger {
    constructor(config = {}) {
        this.service = config.serviceName || 'pauloaris';
        this.levels = ['debug', 'info', 'warn', 'error'];
        this.logs = [];
    }

    log(level, message, context = {}) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            service: this.service,
            context,
            logId: crypto.randomUUID()
        };

        this.logs.push(entry);

        // Console output con formato
        const format = {
            debug: '🔍',
            info: 'ℹ️',
            warn: '⚠️',
            error: '❌'
        };
        console.log(`${format[level]} [${entry.timestamp}] ${message}`, context);

        return entry;
    }

    debug(msg, ctx) { return this.log('debug', msg, ctx); }
    info(msg, ctx) { return this.log('info', msg, ctx); }
    warn(msg, ctx) { return this.log('warn', msg, ctx); }
    error(msg, ctx) { return this.log('error', msg, ctx); }
}

// Sistema de alertas
class Alerting {
    constructor(config = {}) {
        this.alerts = [];
        this.rules = new Map();
        this.config = {
            evaluationInterval: config.interval || 60000,
            ...config
        };
    }

    addRule(name, condition, threshold, action) {
        this.rules.set(name, { condition, threshold, action });
    }

    check(metrics) {
        for (const [name, rule] of this.rules) {
            const value = rule.condition(metrics);
            if (value >= rule.threshold) {
                this.triggerAlert(name, value, rule.action);
            }
        }
    }

    triggerAlert(name, value, action) {
        const alert = {
            alertId: crypto.randomUUID(),
            name,
            value,
            timestamp: Date.now(),
            status: 'firing'
        };

        this.alerts.push(alert);
        console.log(`🚨 ALERT: ${name} (value: ${value})`);

        if (action) action(alert);

        return alert;
    }

    getAlerts() {
        return this.alerts.slice(-100);
    }
}

// Combine everything
class ObservabilitySystem {
    constructor(config = {}) {
        this.tracing = new Tracing(config);
        this.metrics = new Metrics(config);
        this.logger = new StructuredLogger(config);
        this.alerting = new Alerting(config);
    }

    // Helper para crear trace completo
    trace(name, context, callback) {
        const traceId = this.tracing.startTrace(name, context);
        const spanId = this.tracing.startSpan(traceId, name);

        try {
            this.logger.info(`Starting trace: ${name}`, { traceId });
            
            const result = callback(spanId);
            
            this.tracing.endSpan(spanId, 'ok');
            this.tracing.endTrace(traceId, 'ok');
            
            this.logger.info(`Completed trace: ${name}`, { traceId, duration: this.tracing.getTrace(traceId)?.duration });
            
            return result;
        } catch (error) {
            this.tracing.endSpan(spanId, 'error', { error: error.message });
            this.tracing.endTrace(traceId, 'error');
            this.logger.error(`Trace failed: ${name}`, { traceId, error: error.message });
            throw error;
        }
    }
}

module.exports = { Tracing, Metrics, StructuredLogger, Alerting, ObservabilitySystem };
