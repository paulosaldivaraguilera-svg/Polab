/**
 * LangGraph-Style Agent Orchestrator with Cyclic State Machines
 * 
 * Implements:
 * - Cyclic graph execution (not just DAG)
 * - Checkpoint persistence
 * - Human-in-the-loop breakpoints
 * - Multi-agent coordination
 */

const crypto = require('crypto');

// Node types
const NODE_TYPES = {
    AGENT: 'agent',
    TOOL: 'tool',
    DECISION: 'decision',
    START: 'start',
    END: 'end',
    PARALLEL: 'parallel'
};

// Edge types
const EDGE_TYPES = {
    SEQUENTIAL: 'sequential',
    CONDITIONAL: 'conditional',
    FEEDBACK: 'feedback'  // For cycles
};

class LangGraphOrchestrator {
    constructor(config = {}) {
        this.config = {
            checkpointStorage: config.checkpointStorage || 'redis',
            storagePath: config.storagePath || './checkpoints',
            maxHistory: config.maxHistory || 100,
            ...config
        };

        // Graph structure
        this.nodes = new Map();      // nodeId -> node definition
        this.edges = [];             // [source, target, type, condition]
        this.state = {};             // Current graph state
        
        // Execution
        this.executionId = null;
        this.currentNode = null;
        this.history = [];           // Execution history
        this.checkpoints = [];       // Saved checkpoints
        
        // State persistence
        this.persistentState = new Map(); // key -> value
        
        // Human-in-the-loop
        this.breakpoints = new Map(); // nodeId -> condition
        this.paused = false;
        
        // Multi-agent
        this.agents = new Map();     // agentId -> agent instance
        
        // Metrics
        this.metrics = {
            totalExecutions: 0,
            successfulExecutions: 0,
            totalSteps: 0,
            averageLatency: 0
        };
    }

    /**
     * Define a node in the graph
     */
    defineNode(nodeId, type, handler, config = {}) {
        const node = {
            id: nodeId,
            type,
            handler,
            config: {
                description: config.description || '',
                inputSchema: config.inputSchema || {},
                outputSchema: config.outputSchema || {},
                ...config
            }
        };
        
        this.nodes.set(nodeId, node);
        return this;
    }

    /**
     * Add edge between nodes
     */
    addEdge(sourceId, targetId, type = EDGE_TYPES.SEQUENTIAL, condition = null) {
        this.edges.push({
            source: sourceId,
            target: targetId,
            type,
            condition,
            id: crypto.randomUUID()
        });
        return this;
    }

    /**
     * Create a cycle (feedback edge)
     */
    createCycle(fromNodeId, toNodeId, condition = null) {
        this.addEdge(fromNodeId, toNodeId, EDGE_TYPES.FEEDBACK, condition);
        return this;
    }

    /**
     * Set a breakpoint (human-in-the-loop)
     */
    setBreakpoint(nodeId, condition = 'always') {
        this.breakpoints.set(nodeId, condition);
        return this;
    }

    /**
     * Execute the graph from start node
     */
    async execute(startNodeId, initialState = {}, options = {}) {
        this.executionId = crypto.randomUUID();
        this.state = { ...initialState };
        this.history = [];
        this.paused = false;
        
        const startTime = Date.now();
        console.log(`🚀 Graph Execution ${this.executionId}: Starting at ${startNodeId}`);

        // Create initial checkpoint
        await this.createCheckpoint('start', initialState);

        // Find start node
        let currentNodeId = startNodeId;
        let stepCount = 0;
        const maxSteps = options.maxSteps || 1000;

        while (currentNodeId && stepCount < maxSteps) {
            stepCount++;
            this.currentNode = currentNodeId;
            
            // Check for breakpoint
            if (this.breakpoints.has(currentNodeId)) {
                const condition = this.breakpoints.get(currentNodeId);
                if (await this.evaluateBreakpointCondition(condition)) {
                    this.paused = true;
                    await this.createCheckpoint('breakpoint', this.state);
                    console.log(`⏸️ Execution paused at ${currentNodeId}`);
                    break;
                }
            }

            // Execute node
            const node = this.nodes.get(currentNodeId);
            if (!node) {
                throw new Error(`Node ${currentNodeId} not found`);
            }

            // Update state
            this.state.node = currentNodeId;
            this.state.step = stepCount;

            try {
                // Execute node handler
                const result = await this.executeNode(node, this.state);
                
                // Update state with result
                this.state = { ...this.state, ...result.state };
                
                // Record history
                this.history.push({
                    node: currentNodeId,
                    input: result.input,
                    output: result.output,
                    timestamp: Date.now()
                });

                // Create checkpoint after each step
                if (stepCount % 10 === 0) {
                    await this.createCheckpoint('step', this.state);
                }

            } catch (error) {
                console.error(`❌ Error at node ${currentNodeId}:`, error.message);
                
                // Check for error handling edge
                const errorEdge = this.edges.find(
                    e => e.source === currentNodeId && e.type === EDGE_TYPES.CONDITIONAL && 
                    e.condition?.type === 'error'
                );
                
                if (errorEdge) {
                    this.state.error = error.message;
                    currentNodeId = errorEdge.target;
                    continue;
                } else {
                    throw error;
                }
            }

            // Determine next node
            currentNodeId = await this.determineNextNode(currentNodeId, this.state);
            
            // Check for end condition
            if (currentNodeId === null || currentNodeId === 'end') {
                break;
            }
        }

        // Execution complete
        const latency = Date.now() - startTime;
        this.metrics.totalExecutions++;
        this.metrics.successfulExecutions++;
        this.metrics.totalSteps += stepCount;
        this.metrics.averageLatency = 
            (this.metrics.averageLatency * (this.metrics.totalExecutions - 1) + latency) /
            this.metrics.totalExecutions;

        // Final checkpoint
        await this.createCheckpoint('end', this.state);

        console.log(`✅ Execution ${this.executionId} complete: ${stepCount} steps, ${latency}ms`);

        return {
            executionId: this.executionId,
            state: this.state,
            steps: stepCount,
            latency,
            history: this.history
        };
    }

    /**
     * Execute a single node
     */
    async executeNode(node, state) {
        const input = { ...state };
        
        let output;
        switch (node.type) {
            case NODE_TYPES.AGENT:
                output = await node.handler(input);
                break;
                
            case NODE_TYPES.TOOL:
                output = await this.executeTool(node, input);
                break;
                
            case NODE_TYPES.DECISION:
                output = await this.executeDecision(node, input);
                break;
                
            case NODE_TYPES.PARALLEL:
                output = await this.executeParallel(node, input);
                break;
                
            default:
                output = { state: input };
        }

        return { input, output: output.state || output };
    }

    /**
     * Execute tool node
     */
    async executeTool(node, input) {
        const tool = node.handler;
        const args = node.config.inputSchema 
            ? this.extractArgs(input, node.config.inputSchema)
            : input;
        
        try {
            const result = await tool(args);
            return { state: { ...input, [node.config.outputKey || 'result']: result } };
        } catch (error) {
            throw new Error(`Tool ${node.id} failed: ${error.message}`);
        }
    }

    /**
     * Execute decision node
     */
    async executeDecision(node, input) {
        const condition = node.handler(input);
        
        // Find conditional edge
        const edge = this.edges.find(
            e => e.source === node.id && 
            e.type === EDGE_TYPES.CONDITIONAL &&
            (e.condition?.value === condition || !e.condition)
        );
        
        return {
            state: { ...input, decision: condition },
            nextNode: edge?.target || null
        };
    }

    /**
     * Execute parallel nodes
     */
    async executeParallel(node, input) {
        const results = await Promise.all(
            node.config.nodes.map(async childId => {
                const childNode = this.nodes.get(childId);
                const result = await this.executeNode(childNode, input);
                return { node: childId, result: result.output };
            })
        );
        
        return {
            state: { ...input, parallel: results }
        };
    }

    /**
     * Determine next node based on current state and edges
     */
    async determineNextNode(currentNodeId, state) {
        // Find outgoing edges
        const outgoing = this.edges.filter(e => e.source === currentNodeId);
        
        if (outgoing.length === 0) return null;
        
        // Check conditional edges first
        for (const edge of outgoing) {
            if (edge.type === EDGE_TYPES.CONDITIONAL && edge.condition) {
                if (await this.evaluateCondition(edge.condition, state)) {
                    return edge.target;
                }
            }
        }
        
        // Return sequential edge or first edge
        const sequential = outgoing.find(e => e.type === EDGE_TYPES.SEQUENTIAL);
        return sequential?.target || outgoing[0]?.target || null;
    }

    /**
     * Evaluate a condition
     */
    async evaluateCondition(condition, state) {
        if (typeof condition === 'function') {
            return condition(state);
        }
        if (typeof condition === 'object') {
            return state[condition.field] === condition.value;
        }
        return true;
    }

    /**
     * Evaluate breakpoint condition
     */
    async evaluateBreakpointCondition(condition) {
        if (condition === 'always') return true;
        return this.evaluateCondition(condition, this.state);
    }

    /**
     * Create checkpoint
     */
    async createCheckpoint(reason, state) {
        const checkpoint = {
            id: crypto.randomUUID(),
            executionId: this.executionId,
            reason,
            state: JSON.parse(JSON.stringify(state)), // Deep clone
            node: this.currentNode,
            timestamp: Date.now(),
            historyLength: this.history.length
        };
        
        this.checkpoints.push(checkpoint);
        
        // Persist to storage
        await this.persistCheckpoint(checkpoint);
        
        // Trim old checkpoints
        while (this.checkpoints.length > this.config.maxHistory) {
            this.checkpoints.shift();
        }
        
        return checkpoint;
    }

    /**
     * Persist checkpoint to storage
     */
    async persistCheckpoint(checkpoint) {
        const key = `checkpoint_${this.executionId}_${checkpoint.id}`;
        this.persistentState.set(key, checkpoint);
        
        // In production, save to Redis/Postgres
        console.log(`💾 Checkpoint ${checkpoint.id} saved (${checkpoint.reason})`);
    }

    /**
     * Restore from checkpoint
     */
    async restoreFromCheckpoint(checkpointId) {
        const checkpoint = this.checkpoints.find(c => c.id === checkpointId);
        if (!checkpoint) {
            throw new Error(`Checkpoint ${checkpointId} not found`);
        }
        
        this.state = checkpoint.state;
        this.executionId = checkpoint.executionId;
        
        // Restore persistent state
        for (const [key, value] of this.persistentState) {
            if (key.startsWith(`checkpoint_${this.executionId}`)) {
                // Keep checkpoints for this execution
            }
        }
        
        console.log(`♻️ Restored from checkpoint ${checkpointId}`);
        return checkpoint;
    }

    /**
     * Edit state and resume execution
     */
    async editAndResume(checkpointId, stateEdits) {
        const checkpoint = await this.restoreFromCheckpoint(checkpointId);
        
        // Apply edits
        this.state = { ...this.state, ...stateEdits };
        
        console(`✏️ State edited, resuming from node ${checkpoint.node}`);
        
        // Resume execution
        return this.execute(checkpoint.node, this.state);
    }

    /**
     * Register an agent
     */
    registerAgent(agentId, agent) {
        this.agents.set(agentId, agent);
        return this;
    }

    /**
     * Extract args based on schema
     */
    extractArgs(input, schema) {
        const args = {};
        for (const [key, type] of Object.entries(schema)) {
            if (input[key] !== undefined) {
                args[key] = input[key];
            }
        }
        return args;
    }

    /**
     * Get dashboard
     */
    getDashboard() {
        return {
            nodes: this.nodes.size,
            edges: this.edges.length,
            cycles: this.edges.filter(e => e.type === EDGE_TYPES.FEEDBACK).length,
            breakpoints: this.breakpoints.size,
            agents: this.agents.size,
            checkpoints: this.checkpoints.length,
            metrics: { ...this.metrics },
            graph: {
                nodeDefinitions: Array.from(this.nodes.entries()).map(([id, n]) => ({
                    id,
                    type: n.type,
                    config: n.config
                })),
                edges: this.edges.map(e => ({
                    source: e.source,
                    target: e.target,
                    type: e.type
                }))
            }
        };
    }
}

module.exports = { LangGraphOrchestrator, NODE_TYPES, EDGE_TYPES };
