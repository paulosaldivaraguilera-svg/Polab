/**
 * Structured Logging con structlog-style
 * 
 * Características:
 * - Logs estructurados en JSON
 * - Diferentes niveles (DEBUG, INFO, WARNING, ERROR)
 * - Output a console y archivo
 */

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARNING: 2,
    ERROR: 3,
    CRITICAL: 4
};

class StructuredLogger {
    constructor(name = 'pauloaris', config = {}) {
        this.name = name;
        this.level = config.level || 'INFO';
        this.output = config.output || ['console']; // console, file
        this.logFile = config.logFile || './logs/pauloaris.log';
        this.hooks = [];
        
        // Crear directorio de logs si no existe
        if (this.output.includes('file')) {
            // En Node.js: fs.mkdirSync('./logs', { recursive: true });
        }
    }
    
    // Registrar hook para procesar logs
    addHook(hook) {
        this.hooks.push(hook);
    }
    
    // Formatear log
    formatLog(level, message, data = {}) {
        const log = {
            timestamp: new Date().toISOString(),
            level,
            logger: this.name,
            message,
            ...data,
            // Metadatos automáticos
            pid: typeof process !== 'undefined' ? process.pid : null,
            hostname: typeof process !== 'undefined' ? process.hostname : null,
            memory: typeof process !== 'undefined' ? process.memoryUsage() : null
        };
        
        return log;
    }
    
    // Procesar log a través de hooks
    process(log) {
        this.hooks.forEach(hook => hook(log));
        return log;
    }
    
    // Log methods
    debug(message, data = {}) {
        if (this.shouldLog('DEBUG')) {
            const log = this.formatLog('DEBUG', message, data);
            this.outputLog(this.process(log));
        }
    }
    
    info(message, data = {}) {
        if (this.shouldLog('INFO')) {
            const log = this.formatLog('INFO', message, data);
            this.outputLog(this.process(log));
        }
    }
    
    warning(message, data = {}) {
        if (this.shouldLog('WARNING')) {
            const log = this.formatLog('WARNING', message, data);
            this.outputLog(this.process(log));
        }
    }
    
    error(message, data = {}) {
        if (this.shouldLog('ERROR')) {
            const log = this.formatLog('ERROR', message, data);
            this.outputLog(this.process(log));
        }
    }
    
    critical(message, data = {}) {
        const log = this.formatLog('CRITICAL', message, data);
        this.outputLog(this.process(log));
    }
    
    // Verificar si debe loguear
    shouldLog(levelName) {
        return LOG_LEVELS[levelName] >= LOG_LEVELS[this.level];
    }
    
    // Output del log
    outputLog(log) {
        const formatted = JSON.stringify(log);
        
        if (this.output.includes('console')) {
            const colors = {
                DEBUG: '\x1b[36m',  // Cyan
                INFO: '\x1b[32m',   // Green
                WARNING: '\x1b[33m', // Yellow
                ERROR: '\x1b[31m',   // Red
                CRITICAL: '\x1b[35m' // Magenta
            };
            const reset = '\x1b[0m';
            const color = colors[log.level] || '';
            
            console.log(`${color}[${log.timestamp}] ${log.level}: ${log.message}${reset}`);
            if (log.data) {
                console.log(`${color}  ${JSON.stringify(log.data)}${reset}`);
            }
        }
        
        if (this.output.includes('file')) {
            // En Node.js: fs.appendFileSync(this.logFile, formatted + '\n');
            console.log(`[FILE] ${formatted}`);
        }
    }
    
    // Logger hijo para módulos específicos
    child(data) {
        const childLogger = new StructuredLogger(this.name, {
            level: this.level,
            output: this.output,
            logFile: this.logFile
        });
        
        // Agregar datos por defecto
        childLogger.addHook((log) => {
            log.parent = this.name;
            log.child_data = data;
        });
        
        return childLogger;
    }
    
    // Bind context
    bind(data) {
        this.context = { ...this.context, ...data };
        return this;
    }
}

// Logger instances
const loggers = {};

function getLogger(name = 'pauloaris') {
    if (!loggers[name]) {
        loggers[name] = new StructuredLogger(name, {
            level: process.env.LOG_LEVEL || 'INFO',
            output: ['console'],
            logFile: './logs/pauloaris.log'
        });
    }
    return loggers[name];
}

// Usage examples:
/*
const logger = getLogger('dashboard');

// Log simple
logger.info('User logged in', { userId: 123 });

// Logger hijo
const childLogger = logger.child({ component: 'auth' });
childLogger.info('Authentication successful');

// Con bind
logger.bind({ requestId: 'abc123' }).info('Request processed');
*/

module.exports = { StructuredLogger, getLogger, LOG_LEVELS };
