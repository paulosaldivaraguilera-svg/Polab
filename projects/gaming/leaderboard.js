/*
 * Global Leaderboard System v1.0
 * Stores and displays high scores across sessions
 */

class Leaderboard {
    constructor() {
        this.storageKey = 'polab_leaderboard';
        this.ensureStorage();
    }
    
    ensureStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify({
                'elemental-pong': [],
                'recta-provincia': [],
                'delitos': []
            }));
        }
    }
    
    getLeaderboard(game) {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        return data[game] || [];
    }
    
    addScore(game, player, score, metadata = {}) {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        
        if (!data[game]) data[game] = [];
        
        data[game].push({
            player,
            score,
            metadata,
            date: new Date().toISOString()
        });
        
        // Sort by score descending
        data[game].sort((a, b) => b.score - a.score);
        
        // Keep top 50
        data[game] = data[game].slice(0, 50);
        
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        return this.getRank(game, score);
    }
    
    getRank(game, score) {
        const scores = this.getLeaderboard(game).map(s => s.score);
        const rank = scores.filter(s => s > score).length + 1;
        return rank <= 50 ? rank : null;
    }
    
    getTop(game, limit = 10) {
        return this.getLeaderboard(game).slice(0, limit);
    }
    
    clear(game) {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        data[game] = [];
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }
    
    display(game, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const top = this.getTop(game, 10);
        let html = '<div class="leaderboard"><h3>🏆 Top 10</h3><ol>';
        
        top.forEach((entry, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
            html += `<li>${medal} ${entry.player}: ${entry.score} <small>(${new Date(entry.date).toLocaleDateString()})</small></li>`;
        });
        
        html += '</ol></div>';
        container.innerHTML = html;
    }
}

// Global instance
window.leaderboard = new Leaderboard();
console.log("✅ Leaderboard system loaded");
