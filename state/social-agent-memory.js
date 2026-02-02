/**
 * Social Agent Memory System - RAG + Graph Memory
 * 
 * Sistema de memoria avanzado para agentes sociales:
 * - RAG híbrido (vectorial + relacional)
 * - Grafos de conocimiento temporal
 * - Memoria de corto/largo plazo
 * - Zep/Mem0 style implementation
 */

class MemorySystem {
    constructor(config = {}) {
        this.shortTerm = [];  // Buffer de conversación
        this.longTerm = new VectorStore(config.vectorDb || 'chromadb');
        this.graph = new KnowledgeGraph();
        this.config = {
            maxShortTerm: config.maxShortTerm || 50,
            relevanceThreshold: config.relevanceThreshold || 0.7,
            decayRate: config.decayRate || 0.1
        };
    }

    // Agregar mensaje a memoria
    async addMessage(role, content, metadata = {}) {
        const message = {
            role,  // 'user' | 'assistant' | 'system'
            content,
            timestamp: Date.now(),
            metadata,
            embedding: await this.longTerm.embed(content)
        };

        // Memoria a corto plazo
        this.shortTerm.push(message);

        // Limpiamos si excede el límite
        if (this.shortTerm.length > this.config.maxShortTerm) {
            // Promover los más relevantes a largo plazo
            const toPromote = await this.selectRelevant(this.shortTerm.slice(0, -20));
            for (const msg of toPromote) {
                await this.longTerm.add(msg);
            }
            this.shortTerm = this.shortTerm.slice(-20);
        }

        // Extraer entidades y relaciones para el grafo
        await this.graph.extract(message);

        return message;
    }

    // Recuperar contexto relevante
    async retrieve(query, options = {}) {
        const { limit = 5, recencyBoost = true } = options;

        // Buscar en memoria a corto plazo (más reciente)
        const shortResults = this.shortTerm
            .filter(m => this.similarity(m.embedding, await this.longTerm.embed(query)) > 0.5)
            .slice(-10);

        // Buscar en memoria a largo plazo (RAG)
        const longResults = await this.longTerm.search(query, limit);

        // Buscar en grafo de conocimiento
        const graphResults = await this.graph.search(query);

        // Fusionar y ranking
        const results = [...shortResults, ...longResults, ...graphResults];
        
        // Eliminar duplicados
        const unique = Array.from(new Map(results.map(r => [r.content, r])).values());

        // Ranking final
        return unique
            .sort((a, b) => {
                let scoreA = this.similarity(a.embedding, query);
                let scoreB = this.similarity(b.embedding, query);
                if (recencyBoost) {
                    scoreA *= (1 + Math.log(1 + (Date.now() - a.timestamp) / 86400000) * 0.1);
                    scoreB *= (1 + Math.log(1 + (Date.now() - b.timestamp) / 86400000) * 0.1);
                }
                return scoreB - scoreA;
            })
            .slice(0, limit);
    }

    async selectRelevant(messages) {
        // Seleccionar mensajes para promover a largo plazo
        const scored = messages.map(m => ({
            msg: m,
            score: await this.longTerm.embed(m.content).then(emb => 
                this.similarity(emb, await this.longTerm.embed('important key information'))
            )
        }));
        return scored
            .filter(s => s.score > this.config.relevanceThreshold)
            .map(s => s.msg);
    }

    similarity(a, b) {
        // Cosine similarity
        let dot = 0, magA = 0, magB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            magA += a[i] * a[i];
            magB += b[i] * b[i];
        }
        return dot / (Math.sqrt(magA) * Math.sqrt(magB) + 0.0001);
    }

    // Resumen del contexto actual
    async getContextSummary() {
        const recent = this.shortTerm.slice(-10);
        return {
            messageCount: recent.length,
            lastMessage: recent[recent.length - 1]?.content,
            entities: await this.graph.getEntityCount(),
            relationships: await this.graph.getRelationshipCount()
        };
    }
}

// Grafos de conocimiento
class KnowledgeGraph {
    constructor() {
        this.entities = new Map();  // entity -> properties
        this.relations = [];        // [source, target, type]
    }

    async extract(message) {
        // Extraer entidades nombradas (simulado)
        const entities = this.extractEntities(message.content);
        const relations = this.extractRelations(message.content);

        for (const entity of entities) {
            if (!this.entities.has(entity.name)) {
                this.entities.set(entity.name, {
                    type: entity.type,
                    mentions: 0,
                    firstSeen: message.timestamp,
                    lastSeen: message.timestamp
                });
            }
            const e = this.entities.get(entity.name);
            e.mentions++;
            e.lastSeen = message.timestamp;
        }

        for (const [source, target, type] of relations) {
            if (this.entities.has(source) && this.entities.has(target)) {
                this.relations.push({ source, target, type, timestamp: message.timestamp });
            }
        }
    }

    extractEntities(text) {
        // Simulación de NER
        const patterns = {
            PERSON: /[A-Z][a-z]+ [A-Z][a-z]+/g,
            ORGANIZATION: /[A-Z][a-z]+ (Inc|LLC|Corp|Company)/g,
            TOPIC: /#[a-zA-Z]+/g
        };
        
        const entities = [];
        for (const [type, pattern] of Object.entries(patterns)) {
            const matches = text.match(pattern) || [];
            for (const match of matches) {
                entities.push({ name: match, type });
            }
        }
        return entities;
    }

    extractRelations(text) {
        // Simulación de extracción de relaciones
        const relations = [];
        const patterns = [
            { regex: /([A-Z].+) (likes?|hates?|uses?) ([A-Z].+)/i, type: 'OPINION' },
            { regex: /([A-Z].+) works (at|for) ([A-Z].+)/i, type: 'WORKS_AT' }
        ];
        
        for (const { regex, type } of patterns) {
            const matches = text.match(new RegExp(regex.source, 'gi')) || [];
            for (const match of matches) {
                const parts = match.split(regex.exec(match)[1].length);
                // Extraer source y target (simplificado)
                relations.push([parts[0], parts[2], type]);
            }
        }
        return relations;
    }

    async search(query) {
        // Buscar en el grafo
        const queryEntities = this.extractEntities(query);
        const results = [];

        for (const entity of queryEntities) {
            if (this.entities.has(entity.name)) {
                const node = this.entities.get(entity.name);
                results.push({
                    type: 'entity',
                    content: `${entity.name} es un/a ${node.type}`,
                    score: 0.9,
                    metadata: node
                });

                // Encontrar relaciones
                const related = this.relations
                    .filter(r => r.source === entity.name || r.target === entity.name)
                    .map(r => `${r.source} ${r.type} ${r.target}`);

                results.push({
                    type: 'relations',
                    content: related.join('; '),
                    score: 0.8
                });
            }
        }
        return results;
    }

    async getEntityCount() { return this.entities.size; }
    async getRelationshipCount() { return this.relations.length; }
}

// Vector Store simple (chromadb-like)
class VectorStore {
    constructor(dbPath = './data/vectors') {
        this.vectors = [];  // [{embedding, content, metadata}]
        this.dbPath = dbPath;
    }

    async embed(text) {
        // En producción: usar OpenAI embeddings o local (BAAI/bge-small)
        const encoder = new SimpleEncoder();
        return encoder.encode(text);
    }

    async add(item) {
        const embedding = item.embedding || await this.embed(item.content);
        this.vectors.push({
            embedding,
            content: item.content,
            metadata: item.metadata || {},
            timestamp: Date.now()
        });
    }

    async search(query, limit = 5) {
        const queryEmbedding = await this.embed(query);
        const results = this.vectors
            .map(v => ({
                ...v,
                score: this.cosineSimilarity(v.embedding, queryEmbedding)
            }))
            .filter(v => v.score > 0.5)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
        return results;
    }

    cosineSimilarity(a, b) {
        let dot = 0, magA = 0, magB = 0;
        for (let i = 0; i < Math.min(a.length, b.length); i++) {
            dot += a[i] * b[i];
            magA += a[i] * a[i];
            magB += b[i] * b[i];
        }
        return dot / (Math.sqrt(magA) * Math.sqrt(magB) + 0.0001);
    }
}

// Encoder simple para embedding simulado
class SimpleEncoder {
    encode(text) {
        const words = text.toLowerCase().split(/\s+/);
        const vec = new Array(100).fill(0);
        words.forEach((word, i) => {
            vec[Math.abs(word.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)), 0) % 100] += 1 / (i + 1);
        });
        return vec;
    }
}

module.exports = { MemorySystem, KnowledgeGraph, VectorStore };
