/**
 * Automated Code Review System
 * 
 * Linting y análisis estático automatizado para Python y JavaScript.
 * 
 * Reglas implementadas:
 * - Estilo de código (PEP8, Airbnb style)
 * - Seguridad básica
 * - Best practices
 * - Complexidad
 */

class CodeReviewer {
    constructor(config = {}) {
        this.rules = [];
        this.violations = [];
        this.config = {
            maxLineLength: config.maxLineLength || 100,
            maxFunctionLength: config.maxFunctionLength || 50,
            maxCyclomaticComplexity: config.maxCyclomaticComplexity || 10,
            strictMode: config.strictMode || false
        };
        
        this.loadRules();
    }
    
    loadRules() {
        this.rules = [
            // Python Rules
            {
                name: 'no-print-in-production',
                lang: 'python',
                severity: 'warning',
                check: (content) => {
                    const lines = content.split('\n');
                    const issues = [];
                    lines.forEach((line, i) => {
                        if (/print\s*\(/.test(line) && !line.includes('# debug')) {
                            issues.push({ line: i + 1, message: 'print() found - use logging instead' });
                        }
                    });
                    return issues;
                }
            },
            {
                name: 'no-hardcoded-passwords',
                lang: 'python',
                severity: 'error',
                check: (content) => {
                    const lines = content.split('\n');
                    const issues = [];
                    lines.forEach((line, i) => {
                        if (/password\s*=\s*['"][^'"]+['"]/.test(line) ||
                            /api_key\s*=\s*['"][^'"]+['"]/.test(line) ||
                            /secret\s*=\s*['"][^'"]+['"]/.test(line)) {
                            issues.push({ line: i + 1, message: 'Hardcoded secret detected - use environment variables' });
                        }
                    });
                    return issues;
                }
            },
            {
                name: 'no-tabs',
                lang: 'python',
                severity: 'warning',
                check: (content) => {
                    const lines = content.split('\n');
                    const issues = [];
                    lines.forEach((line, i) => {
                        if (/\t/.test(line)) {
                            issues.push({ line: i + 1, message: 'Tab character found - use spaces' });
                        }
                    });
                    return issues;
                }
            },
            
            // JavaScript Rules
            {
                name: 'no-var',
                lang: 'javascript',
                severity: 'warning',
                check: (content) => {
                    const lines = content.split('\n');
                    const issues = [];
                    lines.forEach((line, i) => {
                        if (/\bvar\s+\w+/.test(line)) {
                            issues.push({ line: i + 1, message: 'var found - use const or let' });
                        }
                    });
                    return issues;
                }
            },
            {
                name: 'use-const',
                lang: 'javascript',
                severity: 'info',
                check: (content) => {
                    const lines = content.split('\n');
                    const issues = [];
                    lines.forEach((line, i) => {
                        if (/\blet\s+\w+\s*=/.test(line) && !/let\s+\w+\s*=\s*\[/.test(line) && !/let\s+\w+\s*=\s*\{/.test(line)) {
                            issues.push({ line: i + 1, message: 'Consider using const for values that never change' });
                        }
                    });
                    return issues;
                }
            },
            {
                name: 'no-console-log',
                lang: 'javascript',
                severity: 'warning',
                check: (content) => {
                    const lines = content.split('\n');
                    const issues = [];
                    lines.forEach((line, i) => {
                        if (/console\.log\s*\(/.test(line)) {
                            issues.push({ line: i + 1, message: 'console.log found - consider using a logger' });
                        }
                    });
                    return issues;
                }
            },
            
            // General Rules
            {
                name: 'line-too-long',
                lang: 'all',
                severity: this.config.strictMode ? 'warning' : 'info',
                check: (content) => {
                    const lines = content.split('\n');
                    const issues = [];
                    lines.forEach((line, i) => {
                        if (line.length > this.config.maxLineLength) {
                            issues.push({ 
                                line: i + 1, 
                                message: `Line exceeds ${this.config.maxLineLength} characters (${line.length})` 
                            });
                        }
                    });
                    return issues;
                }
            },
            {
                name: 'no-debug-code',
                lang: 'all',
                severity: 'warning',
                check: (content) => {
                    const lines = content.split('\n');
                    const issues = [];
                    lines.forEach((line, i) => {
                        if (/debugger;?/.test(line) || 
                            /pdb\.set_trace/.test(line) ||
                            /import\s+pdb/.test(line)) {
                            issues.push({ line: i + 1, message: 'Debug code found - remove before committing' });
                        }
                    });
                    return issues;
                }
            },
            {
                name: 'no-git-conflicts',
                lang: 'all',
                severity: 'error',
                check: (content) => {
                    const lines = content.split('\n');
                    const issues = [];
                    lines.forEach((line, i) => {
                        if (/^<<<<<<</.test(line) || /^=======/.test(line) || /^>>>>>>>$/.test(line)) {
                            issues.push({ line: i + 1, message: 'Git conflict markers found - resolve conflicts' });
                        }
                    });
                    return issues;
                }
            }
        ];
    }
    
    // Detectar lenguaje
    detectLanguage(filename) {
        if (filename.endsWith('.py')) return 'python';
        if (filename.endsWith('.js') || filename.endsWith('.ts')) return 'javascript';
        if (filename.endsWith('.html') || filename.endsWith('.css')) return 'all';
        return 'all';
    }
    
    // Revisar archivo
    review(filename, content) {
        const lang = this.detectLanguage(filename);
        const result = {
            filename,
            language: lang,
            violations: [],
            score: 100,
            status: 'PASSED'
        };
        
        for (const rule of this.rules) {
            if (rule.lang !== 'all' && rule.lang !== lang) continue;
            
            const issues = rule.check(content);
            issues.forEach(issue => {
                result.violations.push({
                    rule: rule.name,
                    severity: rule.severity,
                    line: issue.line,
                    message: issue.message
                });
                
                // Calcular score
                const penalty = rule.severity === 'error' ? 10 : 
                                rule.severity === 'warning' ? 5 : 1;
                result.score -= penalty;
            });
        }
        
        // Determinar status
        if (result.violations.length > 0) {
            const hasErrors = result.violations.some(v => v.severity === 'error');
            result.status = hasErrors ? 'FAILED' : 'WARNING';
        }
        
        return result;
    }
    
    // Revisar múltiples archivos
    reviewAll(files) {
        const results = files.map(f => this.review(f.name, f.content));
        return {
            totalFiles: results.length,
            passed: results.filter(r => r.status === 'PASSED').length,
            warnings: results.filter(r => r.status === 'WARNING').length,
            failed: results.filter(r => r.status === 'FAILED').length,
            avgScore: Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length),
            results
        };
    }
    
    // Imprimir reporte
    printReport(report) {
        console.log('\n' + '='.repeat(60));
        console.log('         AUTOMATED CODE REVIEW REPORT');
        console.log('='.repeat(60));
        
        console.log(`\n📊 SUMMARY`);
        console.log(`   Total Files: ${report.totalFiles}`);
        console.log(`   ✅ Passed: ${report.passed}`);
        console.log(`   ⚠️  Warnings: ${report.warnings}`);
        console.log(`   ❌ Failed: ${report.failed}`);
        console.log(`   📈 Avg Score: ${report.avgScore}/100`);
        
        if (report.results.some(r => r.violations.length > 0)) {
            console.log(`\n⚠️  VIOLATIONS FOUND`);
            report.results
                .filter(r => r.violations.length > 0)
                .forEach(r => {
                    console.log(`\n   📄 ${r.filename}`);
                    r.violations.forEach(v => {
                        const icon = v.severity === 'error' ? '❌' : v.severity === 'warning' ? '⚠️' : 'ℹ️';
                        console.log(`      ${icon} Line ${v.line}: ${v.message} [${v.rule}]`);
                    });
                });
        }
        
        console.log('\n' + '='.repeat(60) + '\n');
    }
}

// CLI Interface
if (require.main === module) {
    const fs = require('fs');
    const args = process.argv.slice(2);
    
    const reviewer = new CodeReviewer({ strictMode: true });
    
    if (args[0] === '--file' && args[1]) {
        const content = fs.readFileSync(args[1], 'utf8');
        const result = reviewer.review(args[1], content);
        reviewer.printReport({ totalFiles: 1, passed: result.status === 'PASSED' ? 1 : 0, warnings: 0, failed: result.status === 'FAILED' ? 1 : 0, avgScore: result.score, results: [result] });
    } else {
        console.log('Usage: code-review.js --file <filename>');
    }
}

module.exports = { CodeReviewer };
