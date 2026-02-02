/**
 * CODE AESTHETICS & GENERATIVE ART ENGINE
 * 
 * Integration of:
 * - Literate Programming (Knuth)
 * - Perlin Noise Generative Art
 * - Demoscene Visuals
 * - Code City Visualization
 * - Clean Code Patterns
 * - Procedural Rhetoric
 * - Code Beauty Metrics
 * - Self-Documenting Code
 */

const crypto = require('crypto');

// ============= PERLIN NOISE GENERATIVE ART =============
class PerlinNoise {
    constructor(seed = Math.random()) {
        this.permutation = this.generatePermutation(seed);
        this.gradients = this.generateGradients();
    }

    generatePermutation(seed) {
        const perm = [];
        for (let i = 0; i < 256; i++) perm.push(i);
        
        // Fisher-Yates shuffle with seed
        let random = this.seededRandom(seed);
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [perm[i], perm[j]] = [perm[j], perm[i]];
        }
        
        // Duplicate for overflow
        return [...perm, ...perm];
    }

    seededRandom(seed) {
        return function() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }

    generateGradients() {
        const gradients = {};
        const directions = [
            [1, 1], [-1, 1], [1, -1], [-1, -1],
            [1, 0], [-1, 0], [0, 1], [0, -1]
        ];
        
        for (let i = 0; i < 256; i++) {
            gradients[i] = directions[i % 8];
        }
        return gradients;
    }

    dot(gx, gy, x, y) {
        return gx * x + gy * y;
    }

    lerp(a, b, t) {
        return a + t * (b - a);
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    noise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        
        x -= Math.floor(x);
        y -= Math.floor(y);
        
        const u = this.fade(x);
        const v = this.fade(y);
        
        const n00 = this.dot(...this.gradients[this.permutation[X + this.permutation[Y]], x, y);
        const n01 = this.dot(...this.gradients[this.permutation[X + this.permutation[Y + 1]], x, y - 1);
        const n10 = this.dot(...this.gradients[this.permutation[X + 1 + this.permutation[Y]], x - 1, y);
        const n11 = this.dot(...this.gradients[this.permutation[X + 1 + this.permutation[Y + 1]], x - 1, y - 1);
        
        return this.lerp(
            this.lerp(n00, n10, u),
            this.lerp(n01, n11, u),
            v
        );
    }

    // Generate texture with multiple octaves
    fractalNoise(x, y, octaves = 4, persistence = 0.5, lacunarity = 2) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;
        
        for (let i = 0; i < octaves; i++) {
            total += this.noise(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }
        
        return total / maxValue;
    }

    // Generate terrain-like surface
    generateTerrain(width, height, scale = 0.02) {
        const canvas = [];
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                const value = this.fractalNoise(x * scale, y * scale);
                // Map to terrain colors
                let color;
                if (value < -0.3) color = [20, 60, 120]; // Deep water
                else if (value < -0.1) color = [40, 100, 160]; // Water
                else if (value < 0.1) color = [200, 180, 140]; // Sand
                else if (value < 0.4) color = [80, 140, 60]; // Grass
                else if (value < 0.7) color = [60, 100, 40]; // Forest
                else color = [200, 200, 200]; // Snow
                row.push({ x, y, value, color: `rgb(${color.join(',')})` });
            }
            canvas.push(row);
        }
        return canvas;
    }
}

// ============= DEMOSCENE EFFECTS =============
class DemosceneEngine {
    constructor() {
        this.effects = new Map();
    }

    // Plasma effect
    createPlasmaEffect(width, height, time) {
        const canvas = [];
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                const v1 = Math.sin(x * 0.1 + time);
                const v2 = Math.sin(y * 0.1 + time);
                const v3 = Math.sin((x + y) * 0.1 + time);
                const v4 = Math.sin(Math.sqrt(x * x + y * y) * 0.1 + time);
                
                const r = Math.floor(128 + 127 * Math.sin(v1 * Math.PI));
                const g = Math.floor(128 + 127 * Math.sin(v2 * Math.PI));
                const b = Math.floor(128 + 127 * Math.sin(v3 * Math.PI));
                
                row.push({ x, y, color: `rgb(${r},${g},${b})` });
            }
            canvas.push(row);
        }
        return canvas;
    }

    // Tunnel effect
    createTunnelEffect(width, height, time) {
        const canvas = [];
        const centerX = width / 2;
        const centerY = height / 2;
        
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);
                
                const tex = Math.floor((angle / Math.PI + 1) * 32 + time * 2) % 64;
                const dep = Math.floor(dist + time * 5) % 64;
                
                const v = Math.abs(tex - dep);
                const c = Math.floor(255 - v * 4);
                
                row.push({ x, y, color: `rgb(${c},${c/2},${c/4})` });
            }
            canvas.push(row);
        }
        return canvas;
    }

    // Starfield with depth
    createStarfield(count, time) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            const x = Math.random() * 2000 - 1000;
            const y = Math.random() * 2000 - 1000;
            const z = 500 + (Math.sin(time * 0.001 + i) * 400 + 400) % 1000;
            stars.push({ x, y, z, brightness: Math.random() });
        }
        return stars.sort((a, b) => b.z - a.z);
    }
}

// ============= CODE CITY VISUALIZATION =============
class CodeCityVisualizer {
    constructor() {
        this.buildings = [];
    }

    // Analyze codebase and create city representation
    analyzeCodebase(analysis) {
        this.buildings = [];
        
        // Files become districts
        const districts = Object.keys(analysis.files || {});
        
        districts.forEach((file, districtIdx) => {
            const fileData = analysis.files[file];
            const baseX = (districtIdx % 4) * 300 - 450;
            const baseZ = Math.floor(districtIdx / 4) * 300 - 300;
            
            // Classes become buildings
            const classes = fileData.classes || [fileData.name];
            classes.forEach((cls, buildingIdx) => {
                const width = 30 + Math.random() * 40;
                const depth = 30 + Math.random() * 40;
                const height = 50 + fileData.methods * 20 + fileData.lines * 0.1;
                
                // Color based on quality metrics
                const quality = this.calculateQuality(fileData);
                const color = this.qualityToColor(quality);
                
                this.buildings.push({
                    name: cls,
                    file,
                    position: { x: baseX + (buildingIdx % 3) * 120 - 120, y: 0, z: baseZ + Math.floor(buildingIdx / 3) * 120 - 120 },
                    size: { width, height, depth },
                    color,
                    quality,
                    metrics: {
                        methods: fileData.methods || 0,
                        lines: fileData.lines || 0,
                        complexity: fileData.complexity || 0,
                        debt: fileData.debt || 0
                    }
                });
            });
        });
        
        return this.buildings;
    }

    calculateQuality(fileData) {
        let score = 100;
        score -= (fileData.complexity || 0) * 0.5;
        score -= (fileData.debt || 0) * 0.2;
        score += (fileData.tests || 0) * 2;
        return Math.max(0, Math.min(100, score));
    }

    qualityToColor(quality) {
        if (quality >= 80) return '#10B981'; // Green - excellent
        if (quality >= 60) return '#3B82F6'; // Blue - good
        if (quality >= 40) return '#F59E0B'; // Yellow - warning
        return '#EF4444'; // Red - critical
    }

    // Get skyline statistics
    getSkyline() {
        const heights = this.buildings.map(b => b.size.height);
        return {
            maxHeight: Math.max(...heights),
            minHeight: Math.min(...heights),
            avgHeight: heights.reduce((a, b) => a + b, 0) / heights.length,
            totalBuildings: this.buildings.length,
            qualityDistribution: {
                excellent: this.buildings.filter(b => b.quality >= 80).length,
                good: this.buildings.filter(b => b.quality >= 60 && b.quality < 80).length,
                warning: this.buildings.filter(b => b.quality >= 40 && b.quality < 60).length,
                critical: this.buildings.filter(b => b.quality < 40).length
            }
        };
    }
}

// ============= CLEAN CODE PATTERNS =============
const CleanCodePatterns = {
    // Single Responsibility Principle check
    singleResponsibility(module) {
        const responsibilities = module.responsibilities || [];
        return {
            compliant: responsibilities.length <= 1,
            count: responsibilities.length,
            message: responsibilities.length > 1 
                ? 'Module has multiple responsibilities - consider splitting'
                : 'Module has single, clear responsibility'
        };
    },

    // DRY (Don't Repeat Yourself) analysis
    dryAnalysis(code, threshold = 0.3) {
        const blocks = this.extractBlocks(code);
        const duplicates = this.findDuplicates(blocks);
        const duplicationRatio = duplicates.length / blocks.length;
        
        return {
            ratio: duplicationRatio,
            compliant: duplicationRatio < threshold,
            duplicates: duplicates.map(d => ({ line: d.start, length: d.length }))
        };
    },

    extractBlocks(code) {
        const blocks = [];
        const lines = code.split('\n');
        let currentBlock = [];
        let braceCount = 0;
        
        lines.forEach((line, idx) => {
            braceCount += (line.match(/{/g) || []).length;
            braceCount -= (line.match(/}/g) || []).length;
            
            if (line.trim() && braceCount > 0) {
                currentBlock.push(line.trim());
            }
            
            if (braceCount === 0 && currentBlock.length > 5) {
                blocks.push({ start: idx - currentBlock.length + 1, content: currentBlock.join(' ') });
                currentBlock = [];
            }
        });
        
        return blocks;
    },

    findDuplicates(blocks) {
        const signatures = new Map();
        const duplicates = [];
        
        blocks.forEach(block => {
            const sig = this.hashBlock(block.content);
            if (signatures.has(sig)) {
                duplicates.push({ ...block, duplicateOf: signatures.get(sig) });
            } else {
                signatures.set(sig, block.start);
            }
        });
        
        return duplicates;
    },

    hashBlock(content) {
        return crypto.createHash('md5').update(content).digest('hex');
    },

    // Naming conventions
    analyzeNaming(code) {
        const issues = [];
        const camelCase = /^[a-z][a-zA-Z0-9]*$/;
        const pascalCase = /^[A-Z][a-zA-Z0-9]*$/;
        const snakeCase = /^[a-z][a-z0-9_]*$/;
        
        const variables = code.match(/\b(?:const|let|var)\s+([a-z][a-zA-Z0-9]*)/g) || [];
        const functions = code.match(/function\s+([a-z][a-zA-Z0-9]*)/g) || [];
        const classes = code.match(/class\s+([A-Z][a-zA-Z0-9]*)/g) || [];
        
        // Check for naming convention violations
        if (variables.length > 0 && !variables.every(v => camelCase.test(v))) {
            issues.push({ type: 'variable_naming', message: 'Use camelCase for variables' });
        }
        if (functions.length > 0 && !functions.every(f => camelCase.test(f))) {
            issues.push({ type: 'function_naming', message: 'Use camelCase for functions' });
        }
        if (classes.length > 0 && !classes.every(c => pascalCase.test(c))) {
            issues.push({ type: 'class_naming', message: 'Use PascalCase for classes' });
        }
        
        return {
            compliant: issues.length === 0,
            issues,
            score: Math.max(0, 100 - issues.length * 25)
        };
    }
};

// ============= PROCEDURAL RHETORIC ENGINE =============
class RhetoricEngine {
    constructor() {
        this.arguments = new Map();
    }

    // Create procedural argument
    createArgument(config) {
        const argument = {
            id: `arg_${Date.now()}`,
            thesis: config.thesis,
            claims: config.claims || [],
            evidence: config.evidence || [],
            mechanics: config.mechanics, // How rules enforce the argument
            constraints: config.constraints || [], // Restrictions that embody the message
            targetEmotion: config.targetEmotion || 'understanding',
            createdAt: Date.now()
        };
        
        this.arguments.set(argument.id, argument);
        return argument;
    }

    // Generate UI feedback based on rhetoric
    generateFeedback(argumentId, playerAction) {
        const argument = this.arguments.get(argumentId);
        if (!argument) return { error: 'Argument not found' };
        
        // Check if action aligns with thesis
        const alignment = this.checkAlignment(argument, playerAction);
        
        return {
            feedback: alignment.message,
            emotionalTone: alignment.aligned 
                ? this.positiveTone(argument.targetEmotion)
                : this.negativeTone(argument.targetEmotion),
            visualCue: alignment.aligned ? 'success' : 'restriction',
            rhetoric: {
                claim: argument.claims[0],
                mechanic: argument.mechanics
            }
        };
    }

    checkAlignment(argument, action) {
        // Simple alignment check - in real implementation, this would be more sophisticated
        const aligns = Math.random() > 0.3;
        return {
            aligned: aligns,
            message: aligns 
                ? 'Your action aligns with the core message of this experience'
                : 'The rules prevent this action, reflecting a deeper truth'
        };
    }

    positiveTone(emotion) {
        const tones = {
            understanding: 'clara',
            empathy: 'cálida',
            empowerment: 'poderosa',
            curiosity: 'luminosa'
        };
        return tones[emotion] || 'positiva';
    }

    negativeTone(emotion) {
        const tones = {
            understanding: 'fría',
            empathy: 'distante',
            empowerment: 'frustrante',
            curiosity: 'cerrada'
        };
        return tones[emotion] || 'negativa';
    }
}

// ============= CODE BEAUTY METRICS =============
class CodeBeautyMetrics {
    constructor() {
        this.history = [];
    }

    // Calculate overall beauty score
    calculateBeauty(code, analysis) {
        const metrics = {
            clarity: this.clarityScore(code),
            simplicity: this.simplicityScore(code),
            consistency: this.consistencyScore(code),
            expressiveness: this.expressivenessScore(code),
            structure: this.structureScore(analysis)
        };
        
        const overall = Object.values(metrics).reduce((a, b) => a + b, 0) / 5;
        
        const result = {
            overall: Math.round(overall * 100) / 100,
            metrics,
            grade: this.gradeFromScore(overall),
            timestamp: Date.now()
        };
        
        this.history.push(result);
        return result;
    }

    clarityScore(code) {
        const lines = code.split('\n').length;
        const avgLineLength = code.length / lines;
        const comments = (code.match(/\/\//g) || []).length + (code.match(/\/\*[\s\S]*?\*\//g) || []).length;
        const commentRatio = comments / lines;
        
        // Optimal line length is 20-60 chars
        let lengthScore = 0;
        if (avgLineLength < 80) lengthScore = 1;
        else if (avgLineLength < 120) lengthScore = 0.8;
        else lengthScore = 0.5;
        
        // Comments should be present but not excessive (5-20%)
        let commentScore = 0;
        if (commentRatio >= 0.05 && commentRatio <= 0.2) commentScore = 1;
        else if (commentRatio > 0.02 && commentRatio < 0.3) commentScore = 0.7;
        else commentScore = 0.4;
        
        return (lengthScore * 0.6 + commentScore * 0.4);
    }

    simplicityScore(code) {
        const cyclomatic = this.cyclomaticComplexity(code);
        const nesting = this.maxNesting(code);
        const duplication = this.duplicationRatio(code);
        
        // Lower is better
        const cScore = Math.max(0, 1 - cyclomatic / 20);
        const nScore = Math.max(0, 1 - nesting / 10);
        const dScore = Math.max(0, 1 - duplication * 2);
        
        return (cScore * 0.4 + nScore * 0.3 + dScore * 0.3);
    }

    consistencyScore(code) {
        // Check indentation consistency
        const indentations = code.match(/^[\t ]+/gm) || [];
        const counts = {};
        indentations.forEach(i => {
            const len = i.length;
            counts[len] = (counts[len] || 0) + 1;
        });
        
        const total = indentations.length;
        const consistent = Math.max(...Object.values(counts));
        
        return consistent / total;
    }

    expressivenessScore(code) {
        // Check for descriptive names
        const variables = code.match(/\b(?:const|let|var)\s+([a-z][a-zA-Z0-9]*)/g) || [];
        const functions = code.match(/function\s+([a-z][a-zA-Z0-9]*)|const\s+([a-z][a-zA-Z0-9]*)\s*=/g) || [];
        
        const goodNames = variables.filter(v => v.length > 3).length / Math.max(variables.length, 1);
        const goodFns = functions.filter(f => f.length > 5).length / Math.max(functions.length, 1);
        
        return (goodNames * 0.6 + goodFns * 0.4);
    }

    structureScore(analysis) {
        const score = {
            modularity: analysis.modules > 1 ? 1 : 0.5,
            layered: analysis.layers > 1 ? 1 : 0.5,
            tested: analysis.tests > 0 ? 1 : 0,
            documented: analysis.documented > 0 ? 1 : 0
        };
        return Object.values(score).reduce((a, b) => a + b, 0) / 4;
    }

    cyclomaticComplexity(code) {
        const decisions = (code.match(/if|else|switch|case|for|while|&&|\|\|/g) || []).length;
        return decisions + 1;
    }

    maxNesting(code) {
        let max = 0;
        let current = 0;
        for (const char of code) {
            if (char === '{') {
                current++;
                max = Math.max(max, current);
            } else if (char === '}') {
                current--;
            }
        }
        return max;
    }

    duplicationRatio(code) {
        // Simplified check
        return 0;
    }

    gradeFromScore(score) {
        if (score >= 0.9) return 'A';
        if (score >= 0.8) return 'B';
        if (score >= 0.7) return 'C';
        if (score >= 0.6) return 'D';
        return 'F';
    }
}

// ============= LITERATE PROGRAMMING DOCUMENTER =============
class LiterateDocumenter {
    constructor() {
        this.documents = new Map();
    }

    // Convert code to literate document
    document(code, options = {}) {
        const sections = [];
        let currentSection = { title: 'Introduction', content: [], code: [] };
        
        const lines = code.split('\n');
        let inComment = false;
        let commentBuffer = [];
        
        lines.forEach((line, idx) => {
            // Handle comments
            if (line.includes('/*')) {
                inComment = true;
                commentBuffer.push(line);
                return;
            }
            if (line.includes('*/')) {
                inComment = false;
                const comment = commentBuffer.join('\n');
                if (currentSection.code.length > 0) {
 ...currentSection });
                    currentSection = { title: this                    sections.push({.extractTitle(comment) || 'Next Section', content: [], code: [] };
                }
                currentSection.content.push(this.markdownFromComment(comment));
                commentBuffer = [];
                return;
            }
            if (inComment) {
                commentBuffer.push(line);
                return;
            }
            
            // Handle code
            if (line.trim() && !line.trim().startsWith('//')) {
                currentSection.code.push({ line: idx + 1, content: line });
            } else if (line.trim().startsWith('//')) {
                currentSection.content.push(this.markdownFromComment(line));
            }
        });
        
        sections.push({ ...currentSection });
        
        const document = {
            id: `doc_${Date.now()}`,
            title: options.title || 'Program Documentation',
            sections,
            statistics: this.calculateStats(sections),
            createdAt: Date.now()
        };
        
        this.documents.set(document.id, document);
        return document;
    }

    extractTitle(comment) {
        const match = comment.match(/\*?\s*(?:Title|Chapter|Section):\s*(.+)/i);
        return match ? match[1].trim() : null;
    }

    markdownFromComment(comment) {
        return comment
            .replace(/^\s*\*?\s*/, '')
            .replace(/\*\/$/, '')
            .replace(/\*\s/g, '\n- ')
            .replace(/\*\//, '');
    }

    calculateStats(sections) {
        return {
            sections: sections.length,
            totalLines: sections.reduce((s, sec) => s + sec.code.length, 0),
            totalProse: sections.reduce((s, sec) => s + sec.content.length, 0),
            codeToProseRatio: (() => {
                const code = sections.reduce((s, sec) => s + sec.code.length, 0);
                const prose = sections.reduce((s, sec) => s + sec.content.length, 0);
                return prose > 0 ? code / prose : code;
            })()
        };
    }

    // Generate HTML from literate document
    toHTML(document) {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>${document.title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
    <style>
        body { 
            font-family: 'Merriweather', serif; 
            max-width: 900px; 
            margin: 0 auto; 
            padding: 2rem;
            background: #fafafa;
            color: #333;
        }
        h1 { 
            border-bottom: 3px solid #333; 
            padding-bottom: 0.5rem;
        }
        h2 { 
            margin-top: 2rem;
            color: #2c3e50;
        }
        .prose {
            font-size: 1.1rem;
            line-height: 1.8;
            margin: 1rem 0;
            padding: 1rem;
            background: #fff;
            border-left: 4px solid #3498db;
        }
        pre {
            font-family: 'JetBrains Mono', monospace;
            background: #2d3748;
            color: #e2e8f0;
            padding: 1rem;
            border-radius: 8px;
            overflow-x: auto;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin: 2rem 0;
            padding: 1rem;
            background: #f0f0f0;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <h1>${document.title}</h1>
    
    <div class="stats">
        <div>Sections: ${document.statistics.sections}</div>
        <div>Code Lines: ${document.statistics.totalLines}</div>
        <div>Prose Blocks: ${document.statistics.totalProse}</div>
    </div>
    
    ${document.sections.map(section => `
        <h2>${section.title}</h2>
        <div class="prose">${section.content.join('\n')}</div>
        <pre>${section.code.map(c => c.content).join('\n')}</pre>
    `).join('')}
</body>
</html>`;
    }
}

// Export
module.exports = {
    PerlinNoise,
    DemosceneEngine,
    CodeCityVisualizer,
    CleanCodePatterns,
    RhetoricEngine,
    CodeBeautyMetrics,
    LiterateDocumenter
};
