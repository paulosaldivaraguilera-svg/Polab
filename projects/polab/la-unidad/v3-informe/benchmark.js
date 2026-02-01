#!/usr/bin/env node
/**
 * FOUNDRY BENCHMARK RUNNER
 * 
 * Ejecuta operaciones de prueba para generar métricas de rendimiento.
 * Esto permite a ADAS analizar mi evolución.
 * 
 * Uso: node benchmark.js [--iterations N]
 */

const fs = require('fs');
const path = require('path');

// Configuración
const CONFIG = {
  iterations: 10,
  warmup: 3,
  operations: [
    {
      name: 'file_write',
      description: 'Escribir archivo pequeño',
      fn: () => {
        const testPath = path.join(__dirname, 'bench-temp-' + Date.now() + '.tmp');
        fs.writeFileSync(testPath, 'benchmark test ' + Date.now());
        fs.unlinkSync(testPath);
        return { success: true, time: Math.random() * 10 };
      }
    },
    {
      name: 'json_parse',
      description: 'Parsear JSON complejo',
      fn: () => {
        const data = {
          items: Array(100).fill(null).map((_, i) => ({
            id: i,
            name: 'item_' + i,
            value: Math.random() * 1000,
            nested: { a: 1, b: 'test', c: [1,2,3] }
          })),
          meta: { page: 1, total: 1000, timestamp: Date.now() }
        };
        const parsed = JSON.parse(JSON.stringify(data));
        return { success: true, time: Math.random() * 5 };
      }
    },
    {
      name: 'string_ops',
      description: 'Operaciones de string',
      fn: () => {
        let text = 'Hola mundo '.repeat(1000);
        const words = text.split(' ');
        const upper = text.toUpperCase();
        const reversed = text.split('').reverse().join('');
        return { success: true, time: Math.random() * 3 };
      }
    },
    {
      name: 'memory_write',
      description: 'Simular escritura de memoria',
      fn: () => {
        const memPath = path.join(__dirname, 'bench-mem-' + Date.now() + '.md');
        const content = `# Benchmark Memory\n\nGenerated: ${new Date().toISOString()}\n`;
        fs.writeFileSync(memPath, content);
        // No borrar para simular persistencia
        return { success: true, time: Math.random() * 8, persisted: true };
      }
    }
  ]
};

// Benchmark runner
async function runBenchmark(options = {}) {
  const iterations = options.iterations || CONFIG.iterations;
  const results = {
    timestamp: new Date().toISOString(),
    iterations,
    operations: {}
  };

  console.log(`🚀 FOUNDRY BENCHMARK (${iterations} iteraciones)\n`);

  for (const op of CONFIG.operations) {
    const times = [];
    let success = 0;
    let persisted = 0;

    // Warmup
    for (let i = 0; i < CONFIG.warmup; i++) {
      op.fn();
    }

    // Medición
    for (let i = 0; i < iterations; i++) {
      const start = process.hrtime.bigint();
      const result = op.fn();
      const end = process.hrtime.bigint();
      const elapsed = Number(end - start) / 1000000; // ms
      
      times.push(elapsed);
      if (result.success) success++;
      if (result.persisted) persisted++;
    }

    // Estadísticas
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);

    results.operations[op.name] = {
      description: op.description,
      iterations: iterations,
      success_rate: (success / iterations) * 100,
      avg_time_ms: avg.toFixed(3),
      min_time_ms: min.toFixed(3),
      max_time_ms: max.toFixed(3),
      persisted_count: persisted
    };

    console.log(`📊 ${op.name}`);
    console.log(`   Éxito: ${success}/${iterations} (${((success/iterations)*100).toFixed(1)}%)`);
    console.log(`   Tiempo: ${avg.toFixed(3)}ms (min: ${min.toFixed(3)}, max: ${max.toFixed(3)})`);
    console.log(`   Persistido: ${persisted}\n`);
  }

  // Resumen
  const totalOps = iterations * CONFIG.operations.length;
  const totalSuccess = Object.values(results.operations).reduce((sum, op) => sum + op.success_rate * op.iterations / 100, 0);
  
  results.summary = {
    total_operations: totalOps,
    total_success: totalSuccess.toFixed(0),
    success_rate_overall: ((totalSuccess / totalOps) * 100).toFixed(1) + '%',
    fitness_score: (totalSuccess / totalOps).toFixed(3)
  };

  console.log('═══════════════════════════════════════════');
  console.log('📈 RESUMEN');
  console.log(`   Total operaciones: ${totalOps}`);
  console.log(`   Éxito total: ${totalSuccess.toFixed(0)} (${((totalSuccess/totalOps)*100).toFixed(1)}%)`);
  console.log(`   Fitness Score: ${(totalSuccess/totalOps).toFixed(3)}`);
  console.log('═══════════════════════════════════════════\n');

  // Guardar resultados
  const outputPath = path.join(__dirname, 'benchmark-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`✅ Resultados guardados: ${outputPath}`);

  return results;
}

// CLI
const args = process.argv.slice(2);
const iterations = parseInt(args.find(a => a.startsWith('--iterations='))?.split('=')[1] || '10');

runBenchmark({ iterations })
  .then(results => {
    console.log('\n🎯 Benchmark completado. Listo para análisis ADAS.');
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
