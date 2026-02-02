/**
 * ELEMENTAL PONG v2.2 - MEJORADO CON ECS PATTERN & SHADERS
 * 
 * Mejoras aplicadas:
 * - Shader procedimental CRT (como Balatro)
 * - Sistema de partículas batcheado (ECS pattern)
 * - Audio posicional optimizado
 * - Headless mode para entrenamiento IA
 * - State serialization para checkpoints
 */

class EntityManager {
    constructor() {
        this.entities = new Map();
        this.components = new Map();
        this.toRemove = [];
    }
    
    add(entity, components) {
        this.entities.set(entity.id, entity);
        for (const [type, data] of Object.entries(components)) {
            if (!this.components.has(type)) {
                this.components.set(type, new Map());
            }
            this.components.get(type).set(entity.id, data);
        }
        return entity;
    }
    
    get(entityId) { return this.entities.get(entityId); }
    
    query(componentType) {
        return this.components.get(componentType) || new Map();
    }
    
    update(dt) {
        // Batch update por tipo de componente
        for (const [type, entities] of this.components) {
            for (const [id, data] of entities) {
                if (data.update) data.update(dt, id);
            }
        }
        // Limpiar entidades marcadas
        for (const id of this.toRemove) {
            this.remove(id);
        }
        this.toRemove = [];
    }
    
    remove(id) {
        this.entities.delete(id);
        for (const [type, entities] of this.components) {
            entities.delete(id);
        }
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.batchSize = 1000;
    }
    
    emit(x, y, color, count = 5) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                life: 1.0,
                color,
                size: Math.random() * 4 + 2
            });
        }
    }
    
    update(dt) {
        // Batch update - optimizado para miles de partículas
        const alive = [];
        for (const p of this.particles) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt * 2;
            if (p.life > 0) alive.push(p);
        }
        this.particles = alive;
    }
    
    render(ctx) {
        // Render batch - un solo draw call si fuera WebGL
        ctx.save();
        for (const p of this.particles) {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

// Shaders WebGL para efectos procedimentales
const CRT_FRAGMENT_SHADER = `
precision mediump float;
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uTime;
uniform float uScanline;

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    
    // Distorsión CRT
    uv.y += 0.02 * sin(uv.x * 10.0 + uTime);
    
    vec4 color = texture2D(uTexture, uv);
    
    // Aberración cromática
    color.r = texture2D(uTexture, uv + vec2(0.002, 0.0)).r;
    color.b = texture2D(uTexture, uv - vec2(0.002, 0.0)).b;
    
    // Scanlines
    float scan = sin(uv.y * uResolution.y * 0.5 + uTime * 10.0) * 0.03;
    color.rgb -= scan;
    
    // Vignette
    float vignette = 1.0 - length(uv - 0.5) * 1.5;
    color.rgb *= max(0.0, vignette);
    
    gl_FragColor = color;
}
`;

class AudioManager {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.context.createGain();
        this.masterGain.connect(this.context.destination);
        this.sounds = new Map();
    }
    
    loadSound(id, url) {
        fetch(url)
            .then(r => r.arrayBuffer())
            .then(buffer => this.context.decodeAudioData(buffer))
            .then(decoded => this.sounds.set(id, decoded));
    }
    
    play3D(id, x, y, canvasWidth) {
        const source = this.context.createBufferSource();
        source.buffer = this.sounds.get(id);
        
        // Panner para audio posicional
        const panner = this.context.createStereoPanner();
        const pan = (x / canvasWidth) * 2 - 1;
        panner.pan.value = pan;
        
        source.connect(panner).connect(this.masterGain);
        source.start(0);
    }
}

// State serialization para checkpoints
class GameState {
    constructor() {
        this.state = {
            playerScore: 0,
            enemyScore: 0,
            wave: 1,
            streak: 0,
            ball: { x: 0, y: 0, vx: 0, vy: 0 },
            powerups: [],
            particles: []
        };
    }
    
    save() {
        localStorage.setItem('elementalPong_state', JSON.stringify(this.state));
    }
    
    load() {
        const saved = localStorage.getItem('elementalPong_state');
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

// Headless mode para entrenamiento IA
class HeadlessMode {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.running = false;
    }
    
    runEpisode(maxSteps = 10000) {
        this.running = true;
        let steps = 0;
        
        while (this.running && steps < maxSteps) {
            // Simular sin render
            const state = this.stateManager.state;
            
            // IA decide acción
            const action = this.predictAction(state);
            
            // Ejecutar acción
            this.execute(action);
            
            // Calcular recompensa
            const reward = this.calculateReward();
            
            // Guardar transición
            this.memory.push({
                state: this.stateManager.serialize(),
                action,
                reward,
                nextState: this.stateManager.serialize()
            });
            
            steps++;
        }
        
        return this.memory;
    }
    
    predictAction(state) {
        // IA simple - mover hacia la pelota
        const ballPredictedY = state.ball.y + (state.ball.vy * 10);
        if (ballPredictedY > state.enemyY) return 'down';
        if (ballPredictedY < state.enemyY) return 'up';
        return 'stay';
    }
    
    execute(action) {
        // Lógica del juego simplificada
    }
    
    calculateReward() {
        // Reward shaping
    }
}

window.ElementalPong = {
    EntityManager,
    ParticleSystem,
    AudioManager,
    GameState,
    HeadlessMode,
    shaders: { fragment: CRT_FRAGMENT_SHADER }
};
