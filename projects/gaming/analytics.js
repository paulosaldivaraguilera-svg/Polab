/**
 * Analytics Module - Player Stats para Videojuegos
 * 
 * Características:
 * - Tracking de métricas de jugadores
 * - Guardado localStorage
 * - Análisis de patrones de juego
 * - Exportación de datos
 */

class PlayerAnalytics {
    constructor(gameId) {
        this.gameId = gameId;
        this.sessionId = this.generateSessionId();
        this.events = [];
        this.startTime = Date.now();
        this.loadFromStorage();
    }
    
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Trackear evento
    track(eventType, data = {}) {
        const event = {
            eventType,
            data,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            gameTime: this.getSessionTime()
        };
        
        this.events.push(event);
        this.saveToStorage();
        
        return event;
    }
    
    // Eventos comunes
    trackGameStart(level = 1) {
        this.track('game_start', { level });
    }
    
    trackGameEnd(score, duration, outcome = 'completed') {
        this.track('game_end', { 
            score, 
            duration, 
            outcome,
            sessionTime: this.getSessionTime()
        });
    }
    
    trackDeath(cause, location) {
        this.track('death', { cause, location });
    }
    
    trackAchievement(achievementId) {
        this.track('achievement', { achievementId });
    }
    
    trackItemCollect(itemId, quantity = 1) {
        this.track('item_collect', { itemId, quantity });
    }
    
    trackLevelUp(newLevel, skills = []) {
        this.track('level_up', { newLevel, skills });
    }
    
    trackPowerUp(powerUpId, duration) {
        this.track('power_up', { powerUpId, duration });
    }
    
    trackError(errorType, message) {
        this.track('error', { errorType, message });
    }
    
    // Obtener tiempo de sesión en segundos
    getSessionTime() {
        return Math.floor((Date.now() - this.startTime) / 1000);
    }
    
    // Obtener estadísticas agregadas
    getStats() {
        const eventsByType = {};
        this.events.forEach(e => {
            if (!eventsByType[e.eventType]) {
                eventsByType[e.eventType] = 0;
            }
            eventsByType[e.eventType]++;
        });
        
        return {
            totalEvents: this.events.length,
            sessionTime: this.getSessionTime(),
            eventsByType,
            totalSessions: this.getTotalSessions(),
            avgSessionDuration: this.getAvgSessionDuration(),
            totalScore: this.getTotalScore(),
            achievements: this.getAchievements(),
            mostUsedPowerUps: this.getMostUsedPowerUps(),
            deathCount: this.getDeathCount()
        };
    }
    
    getTotalSessions() {
        const sessions = this.getAllSessions();
        return new Set(sessions.map(s => s.sessionId)).size;
    }
    
    getAvgSessionDuration() {
        const sessions = this.getAllSessions();
        if (sessions.length === 0) return 0;
        
        const totalDuration = sessions.reduce((sum, s) => {
            return sum + (s.duration || 0);
        }, 0);
        
        return Math.round(totalDuration / sessions.length);
    }
    
    getTotalScore() {
        const endEvents = this.events.filter(e => e.eventType === 'game_end');
        return endEvents.reduce((sum, e) => sum + (e.data.score || 0), 0);
    }
    
    getAchievements() {
        const achEvents = this.events.filter(e => e.eventType === 'achievement');
        return achEvents.map(e => e.data.achievementId);
    }
    
    getMostUsedPowerUps() {
        const powerUpEvents = this.events.filter(e => e.eventType === 'power_up');
        const counts = {};
        powerUpEvents.forEach(e => {
            const id = e.data.powerUpId;
            counts[id] = (counts[id] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }
    
    getDeathCount() {
        return this.events.filter(e => e.eventType === 'death').length;
    }
    
    // Persistencia
    getStorageKey() {
        return `analytics_${this.gameId}`;
    }
    
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.getStorageKey());
            if (stored) {
                const data = JSON.parse(stored);
                this.allSessions = data.sessions || [];
                this.currentSessionEvents = data.currentSessionEvents || [];
                this.events = this.currentSessionEvents;
            } else {
                this.allSessions = [];
                this.events = [];
            }
        } catch (e) {
            this.allSessions = [];
            this.events = [];
        }
    }
    
    saveToStorage() {
        const currentSessionData = {
            sessionId: this.sessionId,
            startTime: this.startTime,
            events: this.events
        };
        
        // Mantener solo últimas 10 sesiones
        this.allSessions.push(currentSessionData);
        if (this.allSessions.length > 10) {
            this.allSessions.shift();
        }
        
        const storageData = {
            sessions: this.allSessions,
            currentSessionEvents: this.events,
            lastUpdated: Date.now()
        };
        
        localStorage.setItem(this.getStorageKey(), JSON.stringify(storageData));
    }
    
    getAllSessions() {
        return this.allSessions;
    }
    
    // Exportar datos
    exportJSON() {
        return JSON.stringify({
            gameId: this.gameId,
            exportDate: new Date().toISOString(),
            totalSessions: this.getTotalSessions(),
            stats: this.getStats(),
            events: this.events
        }, null, 2);
    }
    
    exportCSV() {
        let csv = 'timestamp,event_type,data\n';
        this.events.forEach(e => {
            csv += `${e.timestamp},${e.eventType},"${JSON.stringify(e.data).replace(/"/g, '""')}"\n`;
        });
        return csv;
    }
    
    clearData() {
        this.allSessions = [];
        this.events = [];
        localStorage.removeItem(this.getStorageKey());
    }
}

// Integración con cada juego
window.PlayerAnalytics = PlayerAnalytics;
