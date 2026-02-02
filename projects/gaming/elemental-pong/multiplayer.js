/*
 * Elemental Pong Multiplayer System v1.0
 * Allows real-time multiplayer via WebSocket
 */

class PongMultiplayer {
    constructor(gameId) {
        this.gameId = gameId || this.generateId();
        this.ws = null;
        this.playerId = null;
        this.opponent = null;
        this.gameState = 'waiting'; // waiting, ready, playing, ended
        
        this.setupWebSocket();
    }
    
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
    
    setupWebSocket() {
        // Simulated WebSocket for local play
        // In production, connect to: ws://your-server:8080/multiplayer
        
        this.ws = {
            send: (data) => {
                console.log('📡 Sending:', data);
                // Store in localStorage for local multiplayer
                localStorage.setItem(`pong_${this.gameId}_${data.type}`, JSON.stringify(data));
            },
            onmessage: null
        };
        
        // Check for opponent messages
        this.pollOpponent();
    }
    
    pollOpponent() {
        setInterval(() => {
            const data = localStorage.getItem(`pong_${this.gameId}_opponent`);
            if (data && this.ws.onmessage) {
                localStorage.removeItem(`pong_${this.gameId}_opponent`);
                this.ws.onmessage({ data: JSON.parse(data) });
            }
        }, 100);
    }
    
    createGame() {
        this.playerId = 'player1';
        this.gameState = 'waiting';
        console.log(`🎮 Game created: ${this.gameId}`);
        return { gameId: this.gameId, playerId: this.playerId };
    }
    
    joinGame(targetGameId) {
        this.gameId = targetGameId;
        this.playerId = 'player2';
        this.gameState = 'ready';
        
        // Notify creator
        this.ws.send({ type: 'player_joined', playerId: this.playerId, gameId: this.gameId });
        console.log(`🎮 Joined game: ${this.gameId}`);
        return { gameId: this.gameId, playerId: this.playerId };
    }
    
    sendMove(direction) {
        this.ws.send({ 
            type: 'player_move', 
            playerId: this.playerId, 
            direction: direction,
            gameId: this.gameId 
        });
    }
    
    sendScore(player1Score, player2Score) {
        this.ws.send({
            type: 'score_update',
            scores: { player1: player1Score, player2: player2Score },
            gameId: this.gameId
        });
    }
}

// Export for use
window.PongMultiplayer = PongMultiplayer;
console.log("✅ PongMultiplayer loaded");
