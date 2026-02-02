/**
 * Engagement Analytics System
 * 
 * Sistema de métricas para trackear engagement:
 - Vistas, clicks, conversiones
 - Tiempo en página, bounce rate
 - Heatmaps de interacción
 - A/B testing de contenido
 */

class EngagementAnalytics {
    constructor(config = {}) {
        this.events = [];
        this.sessionId = crypto.randomUUID();
        this.config = {
            sessionTimeout: config.sessionTimeout || 30 * 60 * 1000,  // 30 min
            retentionDays: config.retentionDays || 30,
            sampleRate: config.sampleRate || 0.1  // 10% sample para métricas
        };
    }

    // Trackear evento
    track(eventType, data = {}) {
        const event = {
            eventId: crypto.randomUUID(),
            sessionId: this.sessionId,
            eventType,  // 'pageview', 'click', 'scroll', 'conversion', 'form_submit'
            data,
            timestamp: Date.now(),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
            url: typeof window !== 'undefined' ? window.location.href : null
        };

        this.events.push(event);

        // En producción: enviar a servidor
        if (typeof fetch !== 'undefined') {
            this.sendToServer(event);
        }

        return event;
    }

    async sendToServer(event) {
        try {
            await fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event)
            });
        } catch (e) {
            console.warn('Analytics sync failed:', e);
        }
    }

    // Métricas de sesión
    getSessionMetrics() {
        const now = Date.now();
        const sessionEvents = this.events.filter(e => 
            e.timestamp > now - this.config.sessionTimeout
        );

        return {
            pageViews: sessionEvents.filter(e => e.eventType === 'pageview').length,
            clicks: sessionEvents.filter(e => e.eventType === 'click').length,
            scrolls: sessionEvents.filter(e => e.eventType === 'scroll').length,
            conversions: sessionEvents.filter(e => e.eventType === 'conversion').length,
            formSubmits: sessionEvents.filter(e => e.eventType === 'form_submit').length,
            avgTimeOnPage: this.calculateAvgTime(sessionEvents),
            bounceRate: this.calculateBounceRate(sessionEvents)
        };
    }

    calculateAvgTime(events) {
        const pageViews = events.filter(e => e.eventType === 'pageview');
        if (pageViews.length < 2) return 0;

        let totalTime = 0;
        for (let i = 0; i < pageViews.length - 1; i++) {
            totalTime += pageViews[i + 1].timestamp - pageViews[i].timestamp;
        }
        return totalTime / (pageViews.length - 1);
    }

    calculateBounceRate(events) {
        const pageViews = events.filter(e => e.eventType === 'pageview');
        const singlePageSessions = pageViews.filter((pv, i, arr) => 
            arr.filter(e => e.sessionId === pv.sessionId).length === 1
        );
        return pageViews.length > 0 ? singlePageSessions.length / pageViews.length : 0;
    }

    // A/B Testing
    runABTest(testId, variants) {
        const variant = variants[Math.floor(Math.random() * variants.length)];
        this.track('ab_test_assignment', { testId, variant });
        return variant;
    }

    // Heatmap data
    getHeatmapData(elementSelector) {
        const clicks = this.events.filter(e => 
            e.eventType === 'click' && 
            e.data.target === elementSelector
        );
        return {
            element: elementSelector,
            clicks: clicks.length,
            positions: clicks.map(c => c.data.position)
        };
    }

    // Conversion funnel
    getConversionFunnel(steps) {
        const events = this.events.filter(e => 
            steps.some(s => s.event === e.eventType)
        );

        return steps.map((step, i) => ({
            step: step.name,
            event: step.event,
            count: events.filter(e => e.eventType === step.event).length,
            dropoff: i > 0 
                ? 1 - (events.filter(e => e.eventType === step.event).length / 
                       events.filter(e => e.eventType === steps[i-1].event).length)
                : 0
        }));
    }

    // Export para análisis
    export() {
        return {
            summary: this.getSessionMetrics(),
            funnel: this.getConversionFunnel([
                { name: 'Landing', event: 'pageview' },
                { name: 'CTA Click', event: 'click' },
                { name: 'Form', event: 'form_submit' },
                { name: 'Success', event: 'conversion' }
            ]),
            events: this.events.slice(-1000)  // Últimos 1000
        };
    }
}

// Dashboard de métricas
class MetricsDashboard {
    constructor() {
        this.analytics = new EngagementAnalytics();
        this.charts = new Map();
    }

    init() {
        this.trackPageView();
        this.setupScrollTracking();
        this.setupClickTracking();
    }

    trackPageView() {
        this.analytics.track('pageview', {
            path: typeof window !== 'undefined' ? window.location.pathname : '/',
            referrer: typeof document !== 'undefined' ? document.referrer : null
        });
    }

    setupScrollTracking() {
        if (typeof window === 'undefined') return;
        
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                if (maxScroll % 25 === 0) {  // Track cada 25%
                    this.analytics.track('scroll', { percent: maxScroll });
                }
            }
        });
    }

    setupClickTracking() {
        if (typeof document === 'undefined') return;
        
        document.addEventListener('click', (e) => {
            this.analytics.track('click', {
                target: e.target.tagName,
                id: e.target.id,
                className: e.target.className,
                position: { x: e.clientX, y: e.clientY }
            });
        });
    }

    // Track conversión (ej: lead captado)
    trackConversion(conversionType, data = {}) {
        this.analytics.track('conversion', { type: conversionType, ...data });
    }

    // Track formulario
    trackFormSubmit(formId, fields = {}) {
        this.analytics.track('form_submit', { formId, fields });
    }

    // Mostrar métricas en consola
    showMetrics() {
        const metrics = this.analytics.getSessionMetrics();
        console.log('📊 Engagement Metrics:', JSON.stringify(metrics, null, 2));
        return metrics;
    }
}

module.exports = { EngagementAnalytics, MetricsDashboard };
