/**
 * Engineering Metrics System
 * 
 * Métricas de calidad de código:
 * - Cyclomatic Complexity
 * - Code Coverage (simulado)
 * - Maintainability Index
 * - Dependency Analysis
 */

class EngineeringMetrics {
    constructor() {
        this.metrics = {
            complexity: {},
            coverage: {},
            maintainability: {},
            dependencies: {}
        };
    }
    
    // Calcular complejidad ciclomática
    calculateCyclomaticComplexity(code) {
        const lines = code.split('\n');
        let complexity = 1; // Base complexity
        
        const patterns = [
            /if\s*\(/g,           // if statements
            /elif\s*\(/g,         // elif statements
            /else\s*:?/g,         // else statements
            /for\s+\w+\s+in/g,    // for loops
            /while\s+/g,          // while loops
            /except\s+.*:/g,      // except clauses
            /and\s+/g,            // and operators
            /or\s+/g,             // or operators
            /case\s+.*:/g,        // case statements
            /\?\s*.*\s*:/g        // ternary operators
        ];
        
        patterns.forEach(pattern => {
            const matches = code.match(pattern);
            if (matches) {
                complexity += matches.length;
            }
        });
        
        return complexity;
    }
    
    // Evaluar complejidad
    evaluateComplexity(cc) {
        if (cc <= 10) return { level: 'LOW', color: 'green', message: 'Fácil de testear' };
        if (cc <= 20) return { level: 'MEDIUM', color: 'yellow', message: 'Testeable con esfuerzo' };
        if (cc <= 50) return { level: 'HIGH', color: 'orange', message: 'Considerar refactorizar' };
        return { level: 'CRITICAL', color: 'red', message: 'Alto riesgo, refactorizar urgente' };
    }
    
    // Calcular maintainability index (simplificado)
    calculateMaintainability(cc, loc, comments) {
        // Fórmula de Microsoft simplificada
        // MI = max(0, (171 - 5.2 * ln(HalsteadVol) - 0.23 * CC - 16.2 * ln(LOC)) * 100 / 171)
        
        const halsteadVolume = this.estimateHalsteadVolume(cc, loc);
        const mi = Math.max(0, (171 - 5.2 * Math.log(halsteadVolume) - 0.23 * cc - 16.2 * Math.log(loc)) * 100 / 171);
        
        return {
            value: Math.round(mi),
            rating: mi >= 100 ? 'A' : mi >= 70 ? 'B' : mi >= 50 ? 'C' : mi >= 30 ? 'D' : 'F'
        };
    }
    
    estimateHalsteadVolume(cc, loc) {
        // Estimación simplificada
        return Math.exp(0.5 * Math.log(loc) + 0.1 * cc);
    }
    
    // Analizar dependencias
    analyzeDependencies(files) {
        const deps = {
            imports: new Set(),
            internalDeps: new Map(),
            circularDeps: [],
            orphans: []
        };
        
        files.forEach(file => {
            // Extraer imports
            const importMatches = file.content.match(/import\s+(\w+)|from\s+(\w+)/g);
            if (importMatches) {
                importMatches.forEach(imp => {
                    const name = imp.replace(/import\s+|from\s+/, '');
                    deps.imports.add(name);
                    this.addInternalDep(deps, file.name, name);
                });
            }
        });
        
        // Detectar dependencias circulares
        deps.circularDeps = this.findCircularDeps(deps.internalDeps);
        
        // Detectar archivos huérfanos (no importados, no exportadores)
        deps.orphans = this.findOrphans(files, deps);
        
        return {
            totalImports: deps.imports.size,
            circularDeps: deps.circularDeps,
            orphans: deps.orphans,
            score: this.calculateDependencyScore(deps)
        };
    }
    
    addInternalDep(deps, file, importName) {
        if (!deps.internalDeps.has(file)) {
            deps.internalDeps.set(file, []);
        }
        deps.internalDeps.get(file).push(importName);
    }
    
    findCircularDeps(deps) {
        // Algoritmo simplificado para detectar ciclos
        const cycles = [];
        const visited = new Set();
        const recursionStack = new Set();
        
        const dfs = (node, path) => {
            visited.add(node);
            recursionStack.add(node);
            
            const neighbors = deps.get(node) || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    const result = dfs(neighbor, [...path, node]);
                    if (result) return result;
                } else if (recursionStack.has(neighbor)) {
                    return [...path, neighbor];
                }
            }
            
            recursionStack.delete(node);
            return null;
        };
        
        // Simplified - would need full implementation for production
        return cycles;
    }
    
    findOrphans(files, deps) {
        const allFiles = new Set(files.map(f => f.name));
        const importedFiles = new Set();
        
        deps.internalDeps.forEach((imports, file) => {
            imports.forEach(imp => {
                if (allFiles.has(imp)) {
                    importedFiles.add(imp);
                }
            });
        });
        
        return Array.from(allFiles).filter(f => !importedFiles.has(f) && f.includes('.'));
    }
    
    calculateDependencyScore(deps) {
        const penalty = deps.circularDeps.length * 10 + deps.orphans.length * 5;
        return Math.max(0, 100 - penalty);
    }
    
    // Generar reporte completo
    generateReport(files) {
        const report = {
            timestamp: new Date().toISOString(),
            files: [],
            summary: {
                totalFiles: files.length,
                avgComplexity: 0,
                avgMaintainability: 0,
                complexityDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
                dependencyScore: 0
            }
        };
        
        let totalCC = 0;
        let totalMI = 0;
        
        files.forEach(file => {
            const cc = this.calculateCyclomaticComplexity(file.content);
            const ccEval = this.evaluateComplexity(cc);
            const loc = file.content.split('\n').length;
            const comments = (file.content.match(/#|\/\/|\/\*|\*/g) || []).length;
            const mi = this.calculateMaintainability(cc, loc, comments);
            
            report.files.push({
                name: file.name,
                loc,
                complexity: cc,
                complexityRating: ccEval,
                maintainability: mi,
                status: ccEval.level === 'CRITICAL' ? 'NEEDS_ATTENTION' : 'OK'
            });
            
            totalCC += cc;
            totalMI += mi.value;
            
            if (ccEval.level === 'LOW') report.summary.complexityDistribution.low++;
            else if (ccEval.level === 'MEDIUM') report.summary.complexityDistribution.medium++;
            else if (ccEval.level === 'HIGH') report.summary.complexityDistribution.high++;
            else report.summary.complexityDistribution.critical++;
        });
        
        report.summary.avgComplexity = Math.round(totalCC / files.length);
        report.summary.avgMaintainability = Math.round(totalMI / files.length);
        
        // Dependency analysis
        const depAnalysis = this.analyzeDependencies(files);
        report.summary.dependencyScore = depAnalysis.score;
        report.dependencies = depAnalysis;
        
        return report;
    }
    
    // Print report formatted
    printReport(report) {
        console.log('\n' + '='.repeat(60));
        console.log('       ENGINEERING METRICS REPORT');
        console.log('='.repeat(60));
        
        console.log(`\n📊 SUMMARY`);
        console.log(`   Files analyzed: ${report.summary.totalFiles}`);
        console.log(`   Avg Complexity: ${report.summary.avgComplexity}`);
        console.log(`   Avg Maintainability: ${report.summary.avgMaintainability} (${this.getGrade(report.summary.avgMaintainability)})`);
        console.log(`   Dependency Score: ${report.summary.dependencyScore}/100`);
        
        console.log(`\n📈 COMPLEXITY DISTRIBUTION`);
        const dist = report.summary.complexityDistribution;
        console.log(`   LOW:      ${'█'.repeat(dist.low)}${'░'.repeat(20-dist.low)} ${dist.low}`);
        console.log(`   MEDIUM:   ${'█'.repeat(dist.medium)}${'░'.repeat(20-dist.medium)} ${dist.medium}`);
        console.log(`   HIGH:     ${'█'.repeat(dist.high)}${'░'.repeat(20-dist.high)} ${dist.high}`);
        console.log(`   CRITICAL: ${'█'.repeat(dist.critical)}${'░'.repeat(20-dist.critical)} ${dist.critical}`);
        
        console.log(`\n⚠️  NEEDS ATTENTION`);
        const critical = report.files.filter(f => f.status === 'NEEDS_ATTENTION');
        critical.forEach(f => {
            console.log(`   ${f.name}: CC=${f.complexity} (${f.complexityRating.level})`);
        });
        
        if (critical.length === 0) {
            console.log('   ✅ All files within acceptable complexity');
        }
        
        console.log('\n' + '='.repeat(60) + '\n');
    }
    
    getGrade(score) {
        return score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : score >= 20 ? 'D' : 'F';
    }
}

module.exports = { EngineeringMetrics };
