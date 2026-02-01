#!/usr/bin/env node
/**
 * LA UNIDAD v3.0 — CLI
 * Generador de informes de coyuntura
 * 
 * Uso: node la-unidad-cli.js [--fecha YYYY-MM-DD] [--preview]
 */

const fs = require('fs');
const path = require('path');

// Configuración
const CONFIG = {
  template: fs.readFileSync(path.join(__dirname, 'template-informe.html'), 'utf8'),
  sources: {
    elsiglo: { name: 'El Siglo', count: 0 },
    telesur: { name: 'Telesur', count: 0 },
    apl: { name: 'APL', count: 0 }
  }
};

// Templates
const TEMPLATES = {
  tema: `
    <div class="mb-4 p-4 bg-gray-800/50 rounded-lg">
      <div class="flex items-center gap-2 mb-2">
        <span class="tag tag-#{TIPO}">#{TIPO}</span>
        <span class="mono text-yellow-400 text-xs">#{FUENTES}</span>
      </div>
      <h4 class="font-bold mb-1">#{TITULO}</h4>
      <p class="text-gray-400 text-sm">#{DESCRIPCION}</p>
    </div>
  `,
  contradiccion: `
    <div class="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
      <h4 class="font-bold text-red-400 mb-2">#{TITULO}</h4>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-green-400">✓</span> #{LADO_A}
        </div>
        <div>
          <span class="text-red-400">✗</span> #{LADO_B}
        </div>
      </div>
    </div>
  `,
  oportunidad: `
    <div class="mb-3 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
      <div class="flex justify-between items-start">
        <div>
          <span class="tag tag-pol">#{SECTOR}</span>
          <span class="font-bold">#{TITULO}</span>
        </div>
        <span class="mono text-yellow-400 text-xs">#{PRIORIDAD}</span>
      </div>
    </div>
  `
};

// Datos simulados (en producción vendrían del workflow)
const generateMockData = () => ({
  fecha: new Date().toISOString().split('T')[0],
  titulo: `Coyuntura ${new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}`,
  articulos_procesados: 24,
  fuentes_procesadas: 3,
  sintesis_ejecutiva: "La jornada política chilena muestra una intensificación del debate presupuestario junto con tensiones internacionales por la situación geopolítica regional. Se detectan contradicciones significativas en la cobertura de medios respecto a la reforma tributaria.",
  temas: [
    { titulo: "Presupuesto 2026 en discusión", tipo: "pol", fuentes: "El Siglo, APL", descripcion: "Comisiones mixtas discuten modificaciones al proyecto de ley de presupuestos." },
    { titulo: "Cumbre internacional en LATAM", tipo: "int", fuentes: "Telesur, El Siglo", descripcion: "Presidentes de la región se reúnen para abordar integración económica." },
    { titulo: "Huelga sectorial en negociación", tipo: "econ", fuentes: "APL", descripcion: "Sindicatos del sector público rechazan propuesta gubernamental." }
  ],
  contradicciones: [
    { titulo: "Impacto económico de medida X", lado_a: "Gobierno: 'Impacto neutro en inflación'", lado_b: "Expertos: 'Inflación subiría 2%'" }
  ],
  mapa_fuerzas: {
    izquierda: "APL y El Siglo critican insuficiencia de propuesta presupuestaria",
    centro: "Partidos moderados buscan consenso",
    derecha: "Oposición pide ajustes menores"
  },
  oportunidades: [
    { titulo: "Proyecto de ley ambiental con vacíos", sector: "Medioambiente", prioridad: "ALTA" },
    { titulo: "Reforma laboral en comisiones", sector: "Laboral", prioridad: "MEDIA" }
  ],
  analisis_marxista: `El análisis de la jornada revela una vez más la función ideológica del Estado como árbitro aparente entre clases en conflicto. La discusión presupuestaria no es técnica, es política: decide quién paga y quién recibe.

La propuesta gubernamental, presentada como "equilibrada", beneficia estructuralmente al capital financiero mientras pretende justificar "ajustes" en el gasto social. Los argumentos de "responsabilidad fiscal" operan como máscara ideológica de la redistribución regresiva.

La posición de los medios de izquierda (APL, El Siglo) aunque crítica, permanece dentro del marco del posible. No cuestionan el modo de producción, solo su gestión. La verdadera contradicción es esta: el sistema puede tolerar crítica, pero no alternativas.

La huelga del sector público muestra el límite de la negociación colectiva bajo el capitalismo: los trabajadores pueden resistir, pero no determinar.`,
  prediccion: "Para las próximas 72h se espera votación clave en presupuesto. Movilizaciones convocadas para mid semana. La tensión entre bloques будет intensificarse.",
  elsiglo_count: 8,
  telesur_count: 10,
  apl_count: 6
});

// Reemplazar placeholders
const renderTemplate = (template, data) => {
  let html = template;
  
  // Reemplazos simples
  html = html.replace(/#{FECHA_CORTA}/g, new Date().toLocaleDateString('es-CL'));
  html = html.replace(/#{TITULO}/g, data.titulo || 'Informe de Coyuntura');
  html = html.replace(/#{SINTESIS_EJECUTIVA}/g, data.sintesis_ejecutiva || '');
  html = html.replace(/#{ANALISIS_MARXISTA}/g, data.analisis_marxista || '');
  html = html.replace(/#{PREDICCION}/g, data.prediccion || '');
  html = html.replace(/#{ARTICULOS_PROCESADOS}/g, data.articulos_procesados || 0);
  html = html.replace(/#{FUENTES_PROCESADAS}/g, data.fuentes_procesadas || 0);
  html = html.replace(/#{TIMESTAMP}/g, new Date().toISOString());
  
  html = html.replace(/#{ELSIGLO_COUNT}/g, data.elsiglo_count || 0);
  html = html.replace(/#{TELESUR_COUNT}/g, data.telesur_count || 0);
  html = html.replace(/#{APL_COUNT}/g, data.apl_count || 0);
  
  // Mapa de fuerzas
  html = html.replace(/#{FUERZA_IZQUIERDA}/g, data.mapa_fuerzas?.izquierda || 'Sin datos');
  html = html.replace(/#{FUERZA_CENTRO}/g, data.mapa_fuerzas?.centro || 'Sin datos');
  html = html.replace(/#{FUERZA_DERECHA}/g, data.mapa_fuerzas?.derecha || 'Sin datos');
  
  // Temas
  const temasHtml = (data.temas || []).map(t => 
    TEMPLATES.tema
      .replace(/#{TITULO}/g, t.titulo)
      .replace(/#{TIPO}/g, t.tipo)
      .replace(/#{FUENTES}/g, t.fuentes)
      .replace(/#{DESCRIPCION}/g, t.descripcion)
  ).join('');
  html = html.replace(/#{TEMAS_PRINCIPALES_HTML}/g, temasHtml || '<p class="text-gray-500">No se detectaron temas principales</p>');
  
  // Contradicciones
  const contraHtml = (data.contradicciones || []).map(c =>
    TEMPLATES.contradiccion
      .replace(/#{TITULO}/g, c.titulo)
      .replace(/#{LADO_A}/g, c.lado_a)
      .replace(/#{LADO_B}/g, c.lado_b)
  ).join('');
  html = html.replace(/#{CONTRADICCIONES_HTML}/g, contraHtml || '<p class="text-gray-500">No se detectaron contradicciones</p>');
  
  // Oportunidades
  const oppHtml = (data.oportunidades || []).map(o =>
    TEMPLATES.oportunidad
      .replace(/#{TITULO}/g, o.titulo)
      .replace(/#{SECTOR}/g, o.sector)
      .replace(/#{PRIORIDAD}/g, o.prioridad)
  ).join('');
  html = html.replace(/#{OPORTUNIDADES_LEGISLATIVAS_HTML}/g, oppHtml || '<p class="text-gray-500">No se detectaron oportunidades</p>');
  
  return html;
};

// CLI
const args = process.argv.slice(2);
const fecha = args.find(a => a.startsWith('--fecha='))?.split('=')[1] || new Date().toISOString().split('T')[0];
const preview = args.includes('--preview');

// Generar
const data = generateMockData();
const html = renderTemplate(CONFIG.template, data);

if (preview) {
  console.log(html);
} else {
  const outputPath = path.join(__dirname, `informe-${fecha}.html`);
  fs.writeFileSync(outputPath, html);
  console.log(`✅ Informe generado: ${outputPath}`);
}
