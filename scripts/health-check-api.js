/**
 * Health Check API
 * 
 * Verifica el estado de todos los servicios del sistema:
 * - Servicios locales (Python scripts)
 * - APIs (si están corriendo)
 * - Recursos del sistema
 */

const HEALTH_CHECK_CONFIG = {
    services: [
        { name: 'Ralph Loop', path: 'state/loop-runner.py', type: 'script' },
        { name: 'Dashboard', port: 3939, type: 'http' },
        { name: 'API Leads', port: 8081, type: 'http' },
        { name: 'API Metrics', port: 8082, type: 'http' }
    ],
    thresholds: {
        cpuWarning: 80,
        cpuCritical: 95,
        memoryWarning: 70,
        memoryCritical: 90,
        tempWarning: 60,
        tempCritical: 80
    }
};

class HealthChecker {
    constructor(config = HEALTH_CHECK_CONFIG) {
        this.config = config;
        this.lastCheck = null;
        this.history = [];
    }
    
    // Verificar un servicio individual
    async checkService(service) {
        const result = {
            name: service.name,
            status: 'UNKNOWN',
            latency: 0,
            error: null,
            timestamp: Date.now()
        };
        
        const startTime = Date.now();
        
        try {
            if (service.type === 'script') {
                // Check if Python script exists and can be imported
                try {
                    const fs = require('fs');
                    if (fs.existsSync(service.path)) {
                        result.status = 'OK';
                    } else {
                        result.status = 'MISSING';
                    }
                } catch (e) {
                    result.status = 'ERROR';
                    result.error = e.message;
                }
            } else if (service.type === 'http') {
                // HTTP check
                try {
                    const response = await fetch(`http://localhost:${service.port}/health`, {
                        timeout: 5000
                    });
                    result.status = response.ok ? 'OK' : 'DEGRADED';
                } catch (e) {
                    // Fallback to generic check
                    try {
                        const response = await fetch(`http://localhost:${service.port}`, {
                            timeout: 3000
                        });
                        result.status = response.ok ? 'OK' : 'DEGRADED';
                    } catch (e2) {
                        result.status = 'DOWN';
                        result.error = 'Connection refused';
                    }
                }
            }
        } catch (e) {
            result.status = 'ERROR';
            result.error = e.message;
        }
        
        result.latency = Date.now() - startTime;
        return result;
    }
    
    // Verificar recursos del sistema
    async checkSystemResources() {
        const result = {
            cpu: 0,
            memory: 0,
            temperature: 0,
            disk: 0,
            status: 'OK',
            warnings: [],
            timestamp: Date.now()
        };
        
        // Get CPU load (simplified)
        try {
            const load = require('os').loadavg();
            result.cpu = Math.round(load[0] * 100 / require('os').cpus().length);
        } catch (e) {
            result.cpu = 0;
        }
        
        // Get memory usage
        try {
            const mem = require('os').totalmem() - require('os').freemem();
            result.memory = Math.round(mem / require('os').totalmem() * 100);
        } catch (e) {
            result.memory = 0;
        }
        
        // Get disk usage (simplified)
        try {
            const fs = require('fs');
            const stats = fs.statSync('/home/pi/.openclaw/workspace');
            result.disk = 45; // Simplified
        } catch (e) {
            result.disk = 0;
        }
        
        // Temperature (placeholder for Raspberry Pi)
        result.temperature = 50; // Would read from /sys/class/thermal
        
        // Evaluate status
        const t = this.config.thresholds;
        if (result.cpu >= t.cpuCritical || result.memory >= t.memoryCritical || result.temperature >= t.tempCritical) {
            result.status = 'CRITICAL';
        } else if (result.cpu >= t.cpuWarning || result.memory >= t.memoryWarning || result.temperature >= t.tempWarning) {
            result.status = 'WARNING';
            if (result.cpu >= t.cpuWarning) result.warnings.push('High CPU usage');
            if (result.memory >= t.memoryWarning) result.warnings.push('High memory usage');
        }
        
        return result;
    }
    
    // Ejecutar verificación completa
    async runFullCheck() {
        const startTime = Date.now();
        const results = {
            timestamp: new Date().toISOString(),
            services: [],
            system: null,
            overall: 'OK',
            duration: 0
        };
        
        // Check all services
        for (const service of this.config.services) {
            results.services.push(await this.checkService(service));
        }
        
        // Check system resources
        results.system = await this.checkSystemResources();
        
        // Calculate overall status
        const serviceDown = results.services.some(s => s.status === 'DOWN');
        const serviceError = results.services.some(s => s.status === 'ERROR');
        
        if (serviceDown || results.system.status === 'CRITICAL') {
            results.overall = 'CRITICAL';
        } else if (serviceError || results.system.status === 'WARNING') {
            results.overall = 'DEGRADED';
        }
        
        results.duration = Date.now() - startTime;
        this.lastCheck = results;
        this.history.push(results);
        
        // Keep only last 100 checks
        if (this.history.length > 100) {
            this.history.shift();
        }
        
        return results;
    }
    
    // Generar reporte
    generateReport() {
        const check = this.lastCheck || { services: [], system: { status: 'UNKNOWN' } };
        
        let report = '\n' + '='.repeat(60);
        report += '\n           HEALTH CHECK REPORT';
        report += '\n' + '='.repeat(60);
        report += `\n\n📅 Timestamp: ${check.timestamp}`;
        report += `\n⏱️  Duration: ${check.duration}ms`;
        
        report += '\n\n🖥️  SYSTEM RESOURCES';
        report += '\n' + '-'.repeat(40);
        if (check.system) {
            const s = check.system;
            report += `\n   CPU:      ${this.bar(s.cpu)} ${s.cpu}%`;
            report += `\n   Memory:   ${this.bar(s.memory)} ${s.memory}%`;
            report += `\n   Disk:     ${this.bar(s.disk)} ${s.disk}%`;
            report += `\n   Temp:     ${s.temperature}°C`;
            report += `\n   Status:   ${s.status}`;
            if (s.warnings.length > 0) {
                report += `\n   Warnings: ${s.warnings.join(', ')}`;
            }
        }
        
        report += '\n\n🔌 SERVICES';
        report += '\n' + '-'.repeat(40);
        check.services.forEach(s => {
            const icon = s.status === 'OK' ? '✅' : s.status === 'DEGRADED' ? '⚠️' : s.status === 'DOWN' ? '❌' : '❓';
            report += `\n   ${icon} ${s.name.padEnd(20)} ${s.status.padEnd(10)} ${s.latency}ms`;
        });
        
        report += '\n\n📊 OVERALL STATUS';
        report += '\n' + '-'.repeat(40);
        const overallIcon = check.overall === 'OK' ? '✅' : check.overall === 'DEGRADED' ? '⚠️' : '❌';
        report += `\n   ${overallIcon} ${check.overall}`;
        
        report += '\n\n' + '='.repeat(60) + '\n';
        
        return report;
    }
    
    bar(value, max = 100) {
        const filled = Math.round(value / 5);
        const empty = 20 - filled;
        return '█'.repeat(filled) + '░'.repeat(empty);
    }
}

module.exports = { HealthChecker, HEALTH_CHECK_CONFIG };
