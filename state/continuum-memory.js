/**
 * Continuum Memory Architecture (CMA) - Permanent Agent Memory System
 * 
 * Implements the memory architecture described in the research document:
 * - Sensory Memory (Context Window)
 * - Short-Term Memory (Session)
 * - Long-Term Memory (Vector + Graph)
 * - Episodic, Semantic, Procedural Memory
 * 
 * Based on MemGPT concepts with paging and system interrupts
 */

const crypto = require('crypto');

// Memory Types (matching biological taxonomy)
const MEMORY_TYPES = {
    SENSORY: 'sensory',      // Current context (tokens)
    SHORT_TERM: 'short_term', // Session history
    EPISODIC: 'episodic',    // Events and experiences
    SEMANTIC: 'semantic',    // Facts and knowledge
    PROCEDURAL: 'procedural' // Skills and tools
};

// Salience scoring for memory consolidation
const SALIENCE_WEIGHTS = {
    recency: 0.3,
    importance: 0.4,
    emotional_valence: 0.15,
    repetition: 0.15
};

class ContinuumMemoryArchitecture {
    constructor(config = {}) {
        this.config = {
            // Sensory (Context Window)
            maxContextTokens: config.maxContextTokens || 128000,
            
            // Short-Term Memory
            sessionTimeout: config.sessionTimeout || 3600000, // 1 hour
            
            // Long-Term Memory
            vectorStore: config.vectorStore || 'chromadb', // chromadb, pinecone, qdrant
            graphStore: config.graphStore || 'neo4j',      // neo4j, networkx
            storagePath: config.storagePath || './memory',
            
            // Consolidation
            consolidationInterval: config.consolidationInterval || 300000, // 5 min
            salienceThreshold: config.salienceThreshold || 0.7,
            
            // Paging
            pageSize: config.pageSize || 1000,
            maxPagesInContext: config.maxPagesInContext || 5,
            
            ...config
        };

        // Memory Stores
        this.sensoryMemory = []; // Current context
        this.shortTermMemory = new Map(); // Session-based
        this.longTermMemory = {
            episodic: new Map(),    // Event logs
            semantic: null,         // GraphRAG instance
            procedural: new Map()   // Skills library
        };

        // State
        this.stateId = crypto.randomUUID();
        this.birthTime = Date.now();
        this.lastActivity = Date.now();
        this.pageFaults = 0;
        this.memoryOps = { reads: 0, writes: 0, faults: 0 };

        // Checkpoint system
        this.checkpointInterval = null;
        
        // Initialize stores
        this.initializeStores();
    }

    /**
     * Initialize memory stores
     */
    async initializeStores() {
        console.log(`🧠 CMA Initializing with stores:`);
        console.log(`   - Sensory: ${this.config.maxContextTokens} tokens`);
        console.log(`   - Short-Term: ${this.config.sessionTimeout / 1000}s timeout`);
        console.log(`   - Vector Store: ${this.config.vectorStore}`);
        console.log(`   - Graph Store: ${this.config.graphStore}`);

        // Initialize GraphRAG for semantic memory
        this.longTermMemory.semantic = new GraphRAGStore({
            storagePath: this.config.storagePath,
            vectorStore: this.config.vectorStore
        });

        // Start checkpoint system
        this.startCheckpointSystem();

        console.log(`✅ CMA Ready (State ID: ${this.stateId})`);
    }

    /**
     * Page information in/out of sensory memory
     */
    async pageIn(memoryId) {
        this.pageFaults++;
        this.memoryOps.faults++;
        
        // Check short-term first
        if (this.shortTermMemory.has(memoryId)) {
            const memory = this.shortTermMemory.get(memoryId);
            this.sensoryMemory.push(memory);
            return memory;
        }

        // Check episodic memory
        const episodic = this.longTermMemory.episodic.get(memoryId);
        if (episodic) {
            // Assess salience before paging in
            const salience = await this.assessSalience(episodic);
            if (salience >= this.config.salienceThreshold) {
                this.sensoryMemory.push(episodic);
                return episodic;
            }
        }

        return null;
    }

    /**
     * Page out less important memories
     */
    pageOut(preserveCount = null) {
        const limit = preserveCount || this.config.maxPagesInContext;
        
        while (this.sensoryMemory.length > limit) {
            const memory = this.sensoryMemory.shift(); // Remove oldest
            
            // Check if should be promoted to long-term
            const salience = this.assessSalienceSync(memory);
            if (salience >= this.config.salienceThreshold) {
                this.storeInLongTerm(memory);
            }
        }
    }

    /**
     * Store memory in appropriate long-term store
     */
    async storeInLongTerm(memory) {
        this.memoryOps.writes++;
        
        switch (memory.type) {
            case MEMORY_TYPES.EPISODIC:
                this.longTermMemory.episodic.set(memory.id, memory);
                await this.longTermMemory.semantic.add(memory);
                break;
                
            case MEMORY_TYPES.SEMANTIC:
                await this.longTermMemory.semantic.add(memory);
                break;
                
            case MEMORY_TYPES.PROCEDURAL:
                this.longTermMemory.procedural.set(memory.id, memory);
                break;
        }
    }

    /**
     * Assess salience (importance) of a memory
     */
    async assessSalience(memory) {
        let score = 0;
        
        // Recency score (normalized)
        const ageHours = (Date.now() - memory.timestamp) / (1000 * 60 * 60);
        const recencyScore = Math.max(0, 1 - (ageHours / 168)); // Decay over week
        score += SALIENCE_WEIGHTS.recency * recencyScore;
        
        // Importance score
        score += SALIENCE_WEIGHTS.importance * (memory.importance || 0.5);
        
        // Emotional valence
        score += SALIENCE_WEIGHTS.emotional_valence * (memory.emotionalValence || 0.5);
        
        // Repetition
        const repetitionScore = Math.min(1, (memory.accessCount || 0) / 5);
        score += SALIENCE_WEIGHTS.repetition * repetitionScore;
        
        return Math.min(1, score);
    }

    assessSalienceSync(memory) {
        let score = 0;
        const ageHours = (Date.now() - memory.timestamp) / (1000 * 60 * 60);
        const recencyScore = Math.max(0, 1 - (ageHours / 168));
        score += SALIENCE_WEIGHTS.recency * recencyScore;
        score += SALIENCE_WEIGHTS.importance * (memory.importance || 0.5);
        score += SALIENCE_WEIGHTS.emotional_valence * (memory.emotionalValence || 0.5);
        return Math.min(1, score);
    }

    /**
     * Store in short-term memory (session)
     */
    storeShortTerm(key, value, ttl = null) {
        const memory = {
            id: key,
            value,
            type: MEMORY_TYPES.SHORT_TERM,
            timestamp: Date.now(),
            expiresAt: ttl ? Date.now() + ttl : Date.now() + this.config.sessionTimeout
        };
        
        this.shortTermMemory.set(key, memory);
        this.memoryOps.writes++;
        return memory;
    }

    /**
     * Retrieve from memory
     */
    async retrieve(query, memoryType = 'all', options = {}) {
        this.memoryOps.reads++;
        
        const results = [];
        
        // Check sensory memory first
        if (memoryType === 'all' || memoryType === 'sensory') {
            results.push(...this.sensoryMemory.filter(m => 
                JSON.stringify(m).toLowerCase().includes(query.toLowerCase())
            ));
        }
        
        // Check short-term
        if (memoryType === 'all' || memoryType === 'short_term') {
            for (const [key, memory] of this.shortTermMemory) {
                if (JSON.stringify(memory.value).includes(query)) {
                    memory.accessCount = (memory.accessCount || 0) + 1;
                    results.push(memory);
                }
            }
        }
        
        // Query semantic memory (GraphRAG)
        if (memoryType === 'all' || memoryType === 'semantic') {
            const semanticResults = await this.longTermMemory.semantic.query(query, options.limit || 5);
            results.push(...semanticResults);
        }
        
        // Query episodic memory
        if (memoryType === 'all' || memoryType === 'episodic') {
            for (const [id, memory] of this.longTermMemory.episodic) {
                if (JSON.stringify(memory).includes(query)) {
                    memory.accessCount = (memory.accessCount || 0) + 1;
                    results.push(memory);
                }
            }
        }
        
        return results;
    }

    /**
     * Multi-hop reasoning via graph traversal
     */
    async multiHopQuery(initialQuery, hops = 2) {
        let currentContext = initialQuery;
        const path = [initialQuery];
        
        for (let i = 0; i < hops; i++) {
            const results = await this.longTermMemory.semantic.query(currentContext, 3);
            
            if (results.length === 0) break;
            
            // Extract new context from results
            const relevantInfo = results.map(r => r.content).join(' ');
            currentContext = `${initialQuery} ${relevantInfo}`;
            path.push(currentContext);
        }
        
        return {
            finalContext: currentContext,
            path,
            hops: path.length - 1
        };
    }

    /**
     * Store procedural memory (skill)
     */
    storeProcedural(skillName, code, metadata = {}) {
        const skill = {
            id: `skill_${skillName}`,
            name: skillName,
            code,
            type: MEMORY_TYPES.PROCEDURAL,
            metadata,
            timestamp: Date.now(),
            usageCount: 0,
            successRate: 1.0,
            lastUsed: null
        };
        
        this.longTermMemory.procedural.set(skillName, skill);
        return skill;
    }

    /**
     * Retrieve and execute skill
     */
    async retrieveSkill(skillName, context) {
        const skill = this.longTermMemory.procedural.get(skillName);
        if (!skill) return null;
        
        skill.usageCount++;
        skill.lastUsed = Date.now();
        
        return {
            skill,
            code: skill.code,
            context
        };
    }

    /**
     * Checkpoint system for persistence
     */
    startCheckpointSystem() {
        this.checkpointInterval = setInterval(() => {
            this.createCheckpoint();
        }, this.config.consolidationInterval);
    }

    createCheckpoint() {
        const checkpoint = {
            stateId: this.stateId,
            timestamp: Date.now(),
            sensoryMemory: this.sensoryMemory.slice(-50), // Last 50 items
            state: {
                episodicCount: this.longTermMemory.episodic.size,
                proceduralCount: this.longTermMemory.procedural.size,
                graphNodes: this.longTermMemory.semantic?.nodeCount || 0,
                shortTermCount: this.shortTermMemory.size
            },
            stats: { ...this.memoryOps }
        };
        
        // In production, save to persistent storage
        console.log(`💾 Checkpoint created: ${checkpoint.timestamp}`);
        return checkpoint;
    }

    /**
     * Restore from checkpoint
     */
    async restoreFromCheckpoint(checkpoint) {
        this.sensoryMemory = checkpoint.sensoryMemory || [];
        this.stateId = checkpoint.stateId;
        
        // Restore long-term from persistent storage
        if (checkpoint.longTermMemory) {
            this.longTermMemory.episodic = new Map(checkpoint.longTermMemory.episodic);
            this.longTermMemory.procedural = new Map(checkpoint.longTermMemory.procedural);
        }
        
        console.log(`♻️ Restored from checkpoint: ${this.stateId}`);
    }

    /**
     * Get dashboard stats
     */
    getDashboard() {
        return {
            stateId: this.stateId,
            age: Date.now() - this.birthTime,
            lastActivity: Date.now() - this.lastActivity,
            memory: {
                sensory: this.sensoryMemory.length,
                shortTerm: this.shortTermMemory.size,
                episodic: this.longTermMemory.episodic.size,
                procedural: this.longTermMemory.procedural.size,
                semantic: this.longTermMemory.semantic?.nodeCount || 0
            },
            ops: this.memoryOps,
            pageFaults: this.pageFaults
        };
    }
}

/**
 * GraphRAG Store for Semantic Memory
 */
class GraphRAGStore {
    constructor(config = {}) {
        this.storagePath = config.storagePath || './memory';
        this.nodes = new Map(); // entityId -> node
        this.relations = [];    // [source, relation, target]
        this.vectors = new Map(); // entityId -> vector (simplified)
    }

    async add(memory) {
        const nodeId = memory.id || crypto.randomUUID();
        
        // Create node
        this.nodes.set(nodeId, {
            id: nodeId,
            type: memory.type,
            content: memory.content || JSON.stringify(memory),
            timestamp: memory.timestamp,
            importance: memory.importance || 0.5,
            embeddings: memory.embeddings || []
        });

        // Extract relations if content provides them
        if (memory.relations) {
            for (const rel of memory.relations) {
                this.relations.push({
                    source: nodeId,
                    relation: rel.type,
                    target: rel.targetId,
                    timestamp: Date.now()
                });
            }
        }

        return nodeId;
    }

    async query(query, limit = 5) {
        // Simplified semantic search (would use vector similarity in production)
        const results = [];
        for (const [id, node] of this.nodes) {
            if (JSON.stringify(node.content).toLowerCase().includes(query.toLowerCase())) {
                results.push({
                    id,
                    content: node.content,
                    relevance: 1 - (Math.random() * 0.2), // Simplified scoring
                    type: node.type
                });
            }
        }
        
        return results.slice(0, limit);
    }

    async traverse(startNodeId, relationType, maxDepth = 3) {
        const visited = new Set();
        const queue = [{ node: startNodeId, depth: 0 }];
        const results = [];
        
        while (queue.length > 0 && results.length < 20) {
            const { node: currentId, depth } = queue.shift();
            
            if (visited.has(currentId)) continue;
            visited.add(currentId);
            
            if (depth >= maxDepth) continue;
            
            // Find relations
            const outgoing = this.relations.filter(r => r.source === currentId);
            const incoming = this.relations.filter(r => r.target === currentId);
            
            for (const rel of outgoing) {
                results.push({
                    node: this.nodes.get(rel.target),
                    relation: rel.relation,
                    depth: depth + 1
                });
                queue.push({ node: rel.target, depth: depth + 1 });
            }
        }
        
        return results;
    }

    get nodeCount() {
        return this.nodes.size;
    }
}

module.exports = { ContinuumMemoryArchitecture, GraphRAGStore, MEMORY_TYPES };
