/**
 * WebSocket Server para Métricas en Tiempo Real
 * 
 * Características:
 * - Servidor WebSocket embebido
 * - Broadcasting de métricas
 * - Heartbeat para conexión viva
 */

const WS_CONFIG = {
    port: 3938,
    heartbeatInterval: 30000,  // 30 segundos
    maxClients: 50
};

class WebSocketServer {
    constructor(config = WS_CONFIG) {
        this.config = config;
        this.wss = null;
        this.clients = new Map();
        this.metrics = {
            cpu: [],
            memory: [],
            temperature: [],
            tasks: { pending: 0, completed: 0 }
        };
        this.running = false;
    }
    
    // Inicializar servidor (usando ws library)
    async init() {
        try {
            const WebSocket = require('ws');
            this.wss = new WebSocket.Server({ port: this.config.port });
            
            this.wss.on('connection', (ws, req) => {
                const clientId = this.generateClientId();
                this.clients.set(clientId, { ws, connectedAt: Date.now() });
                
                console.log(`Client connected: ${clientId}`);
                
                // Enviar métricas iniciales
                ws.send(JSON.stringify({
                    type: 'init',
                    metrics: this.metrics,
                    timestamp: Date.now()
                }));
                
                // Heartbeat
                ws.isAlive = true;
                ws.on('pong', () => { ws.isAlive = true; });
                
                ws.on('message', (message) => {
                    this.handleMessage(clientId, message);
                });
                
                ws.on('close', () => {
                    this.clients.delete(clientId);
                    console.log(`Client disconnected: ${clientId}`);
                });
                
                ws.on('error', (err) => {
                    console.error(`Client error ${clientId}:`, err);
                });
            });
            
            // Heartbeat interval
            this.heartbeatInterval = setInterval(() => {
                this.wss.clients.forEach((ws) => {
                    if (!ws.isAlive) {
                        return ws.terminate();
                    }
                    ws.isAlive = false;
                    ws.ping();
                });
            }, this.config.heartbeatInterval);
            
            this.running = true;
            console.log(`WebSocket server started on port ${this.config.port}`);
            
            return true;
        } catch (e) {
            console.error('WebSocket init error:', e);
            return false;
        }
    }
    
    generateClientId() {
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    handleMessage(clientId, message) {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'subscribe':
                    // Ya está suscrito al conectar
                    break;
                    
                case 'get_metrics':
                    this.sendToClient(clientId, {
                        type: 'metrics',
                        metrics: this.metrics,
                        timestamp: Date.now()
                    });
                    break;
                    
                case 'ping':
                    this.sendToClient(clientId, { type: 'pong' });
                    break;
            }
        } catch (e) {
            console.error('Message parse error:', e);
        }
    }
    
    sendToClient(clientId, data) {
        const client = this.clients.get(clientId);
        if (client && client.ws.readyState === 1) {
            client.ws.send(JSON.stringify(data));
        }
    }
    
    // Broadcast a todos los clientes
    broadcast(data) {
        const message = JSON.stringify(data);
        this.clients.forEach((client) => {
            if (client.ws.readyState === 1) {
                client.ws.send(message);
            }
        });
    }
    
    // Actualizar métricas
    updateMetrics(newMetrics) {
        if (newMetrics.cpu) this.metrics.cpu.push({
            value: newMetrics.cpu,
            timestamp: Date.now()
        });
        if (newMetrics.memory) this.metrics.memory.push({
            value: newMetrics.memory,
            timestamp: Date.now()
        });
        if (newMetrics.temperature) this.metrics.temperature.push({
            value: newMetrics.temperature,
            timestamp: Date.now()
        });
        
        // Mantener solo últimos 100 puntos
        const maxPoints = 100;
        if (this.metrics.cpu.length > maxPoints) this.metrics.cpu.shift();
        if (this.metrics.memory.length > maxPoints) this.metrics.memory.shift();
        if (this.metrics.temperature.length > maxPoints) this.metrics.temperature.shift();
        
        // Broadcast
        this.broadcast({
            type: 'metrics_update',
            metrics: newMetrics,
            timestamp: Date.now()
        });
    }
    
    updateTasks(pending, completed) {
        this.metrics.tasks = { pending, completed };
        this.broadcast({
            type: 'tasks_update',
            tasks: this.metrics.tasks,
            timestamp: Date.now()
        });
    }
    
    // Obtener estadísticas
    getStats() {
        return {
            connectedClients: this.clients.size,
            uptime: this.running ? Date.now() - this.startTime : 0,
            metricsBufferSize: {
                cpu: this.metrics.cpu.length,
                memory: this.metrics.memory.length,
                temperature: this.metrics.temperature.length
            }
        };
    }
    
    // Detener servidor
    stop() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        if (this.wss) {
            this.wss.close();
        }
        this.running = false;
    }
}

// Client-side connection
class WebSocketClient {
    constructor(url = 'ws://localhost:3938') {
        this.url = url;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.callbacks = {};
    }
    
    connect() {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
            this.emit('connect');
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.emit(data.type, data);
        };
        
        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.emit('disconnect');
            this.reconnect();
        };
        
        this.ws.onerror = (err) => {
            console.error('WebSocket error:', err);
            this.emit('error', err);
        };
    }
    
    reconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.connect(), this.reconnectDelay);
        }
    }
    
    on(type, callback) {
        if (!this.callbacks[type]) {
            this.callbacks[type] = [];
        }
        this.callbacks[type].push(callback);
    }
    
    emit(type, data) {
        if (this.callbacks[type]) {
            this.callbacks[type].forEach(cb => cb(data));
        }
    }
    
    send(data) {
        if (this.ws && this.ws.readyState === 1) {
            this.ws.send(JSON.stringify(data));
        }
    }
}

module.exports = { WebSocketServer, WebSocketClient, WS_CONFIG };
