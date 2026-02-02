/**
 * RECTA PROVINCIA v2.1 - NPC MEMORY & RAG SYSTEM
 * 
 * Mejoras aplicadas:
 * - Sistema de memoria RAG para NPCs
 * - Diálogos contextuales dinámicos
 * - Estado serializado para checkpoints
 * - Audio posicional optimizado
 */

class NPCMemorySystem {
    constructor() {
        this.memoryStore = new Map(); // NPC ID -> Vector embeddings
        this.conversationHistory = new Map();
        this.contextWindow = 5; // Últimas 5 interacciones
    }
    
    // Simular embeddings (en producción usaría modelo real)
    embed(text) {
        // Hash simple como representación del embedding
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return new Float32Array([hash % 100 / 100, Math.sin(hash) * 0.5 + 0.5]);
    }
    
    addInteraction(npcId, speaker, text, sentiment = 0) {
        const memory = {
            speaker,
            text,
            sentiment, // -1 a 1
            timestamp: Date.now(),
            embedding: this.embed(text)
        };
        
        if (!this.conversationHistory.has(npcId)) {
            this.conversationHistory.set(npcId, []);
        }
        
        const history = this.conversationHistory.get(npcId);
        history.push(memory);
        
        // Mantener solo contexto reciente
        if (history.length > this.contextWindow) {
            history.shift();
        }
    }
    
    retrieveContext(npcId, currentContext) {
        const history = this.conversationHistory.get(npcId) || [];
        const currentEmbedding = this.embed(currentContext);
        
        // RAG: Recuperar memorias relevantes
        const relevant = history
            .map(m => ({
                ...m,
                similarity: this.cosineSimilarity(m.embedding, currentEmbedding)
            }))
            .filter(m => m.similarity > 0.3)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 3);
        
        return relevant;
    }
    
    cosineSimilarity(a, b) {
        let dot = 0, magA = 0, magB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            magA += a[i] * a[i];
            magB += b[i] * b[i];
        }
        return dot / (Math.sqrt(magA) * Math.sqrt(magB) + 0.0001);
    }
    
    generateDialogue(npcId, systemPrompt, currentInput) {
        const context = this.retrieveContext(npcId, currentInput);
        
        let contextSection = '';
        if (context.length > 0) {
            contextSection = '\n\nMemorias relevantes:\n';
            for (const m of context) {
                const timeStr = new Date(m.timestamp).toLocaleTimeString();
                contextSection += `- [${m.speaker} a las ${timeStr}]: "${m.text}" (sentimiento: ${m.sentiment > 0 ? 'positivo' : m.sentiment < 0 ? 'negativo' : 'neutral'})\n`;
            }
        }
        
        return {
            fullPrompt: `${systemPrompt}${contextSection}\n\nConversación actual:\n${currentInput}`,
            contextUsed: context
        };
    }
}

class QuestSystem {
    constructor() {
        this.quests = new Map();
        this.activeQuests = [];
        this.completedQuests = [];
        
        this.loadQuests();
    }
    
    loadQuests() {
        this.quests.set('brujo_intro', {
            id: 'brujo_intro',
            title: 'El Camino del Brujo',
            giver: 'Brujo Anciando',
            description: 'Encuentra al Brujo Anciando en el bosque.',
            objectives: [
                { type: 'talk', target: 'brujo', completed: false },
                { type: 'collect', target: 'hierbas', count: 5, collected: 0, completed: false }
            ],
            rewards: { karma: 10, xp: 50, items: ['amuleto_poder'] }
        });
        
        this.quests.set('pincoya_mision', {
            id: 'pincoya_mision',
            title: 'La Pincoya Esclarecida',
            giver: 'La Pincoya',
            description: 'Descubre los secretos de la Pincoya.',
            objectives: [
                { type: 'talk', target: 'pincoya', completed: false },
                { type: 'explore', target: 'cascada_secreta', completed: false }
            ],
            rewards: { karma: 15, xp: 75, items: ['concha_sagrada'] }
        });
    }
    
    getActiveQuests() {
        return this.activeQuests;
    }
    
    updateProgress(questId, objectiveType, target) {
        const quest = this.quests.get(questId);
        if (!quest) return;
        
        for (const obj of quest.objectives) {
            if (obj.type === objectiveType && obj.target === target && !obj.completed) {
                if (objectiveType === 'collect') {
                    obj.collected++;
                    if (obj.collected >= obj.count) {
                        obj.completed = true;
                        this.checkQuestCompletion(quest);
                    }
                } else if (objectiveType === 'talk' || objectiveType === 'explore') {
                    obj.completed = true;
                    this.checkQuestCompletion(quest);
                }
            }
        }
    }
    
    checkQuestCompletion(quest) {
        const allComplete = quest.objectives.every(o => o.completed);
        if (allComplete && !this.activeQuests.includes(quest)) {
            this.activeQuests.push(quest);
            return { completed: quest, rewards: quest.rewards };
        }
        return null;
    }
    
    serialize() {
        return {
            active: this.activeQuests.map(q => q.id),
            completed: this.completedQuests
        };
    }
    
    deserialize(data) {
        if (data.active) {
            this.activeQuests = data.active.map(id => this.quests.get(id)).filter(Boolean);
        }
        this.completedQuests = data.completed || [];
    }
}

class AudioEngine {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = new Map();
        this.positions = new Map(); // Sound ID -> {x, y}
        this.listener = { x: 0, y: 0 };
        this.loadSounds();
    }
    
    loadSounds() {
        const soundMap = {
            'steps': '/projects/gaming/recta-provincia/audio/pasos.mp3',
            'attack': '/projects/gaming/recta-provincia/audio/ataque.mp3',
            'transform': '/projects/gaming/recta-provincia/audio/transformacion.mp3',
            'level_up': '/projects/gaming/recta-provincia/audio/nivel.mp3',
            'ambient_forest': '/projects/gaming/recta-provincia/audio/bosque.mp3'
        };
        
        for (const [id, url] of Object.entries(soundMap)) {
            this.loadSound(id, url);
        }
    }
    
    loadSound(id, url) {
        fetch(url).then(r => r.arrayBuffer())
            .then(buffer => this.context.decodeAudioData(buffer))
            .then(decoded => this.sounds.set(id, decoded));
    }
    
    setListenerPosition(x, y) {
        this.listener = { x, y };
    }
    
    play3D(id, x, y) {
        const source = this.context.createBufferSource();
        source.buffer = this.sounds.get(id);
        
        const panner = this.context.createStereoPanner();
        const pan = (x - this.listener.x) / 1000; // Normalizado
        panner.pan.value = Math.max(-1, Math.min(1, pan));
        
        source.connect(panner).connect(this.context.destination);
        source.start(0);
    }
    
    playAmbient(id, volume = 0.3) {
        const source = this.context.createBufferSource();
        source.buffer = this.sounds.get(id);
        source.loop = true;
        
        const gain = this.context.createGain();
        gain.gain.value = volume;
        
        source.connect(gain).connect(this.context.destination);
        source.start(0);
    }
}

class GameState {
    constructor() {
        this.state = {
            player: {
                x: 400, y: 300,
                hp: 100, maxHp: 100,
                xp: 0, level: 1,
                karma: 0,
                transformation: 'humano' // humano, alcatraz, chonchon
            },
            npcs: {
                brujo: { x: 150, y: 200, name: 'Brujo Anciando', trust: 0 },
                pincoya: { x: 600, y: 400, name: 'La Pincoya', trust: 0 }
            },
            position: { zone: 'entrada', x: 400, y: 300 },
            time: 0 // 0-24 horas
        };
    }
    
    save() {
        localStorage.setItem('rectaProvincia_state', JSON.stringify(this.state));
    }
    
    load() {
        const saved = localStorage.getItem('rectaProvincia_state');
        if (saved) {
            this.state = JSON.parse(saved);
        }
    }
    
    serialize() {
        return btoa(JSON.stringify(this.state));
    }
    
    deserialize(data) {
        this.state = JSON.parse(atob(data));
    }
}

window.RectaProvincia = {
    NPCMemorySystem,
    QuestSystem,
    AudioEngine,
    GameState
};
