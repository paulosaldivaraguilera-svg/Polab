/**
 * LA UNIDAD v3.0 — AGENTE RSS
 * Recolecta noticias de fuentes configuradas
 */

export const tool = {
  name: "la_unidad_rss_collect",
  description: "Recolecta noticias de fuentes RSS configuradas",
  parameters: {
    type: "object",
    properties: {
      fuentes: {
        type: "array",
        items: { type: "string" },
        default: ["elsiglo", "telesur", "apl"],
        description: "Fuentes RSS a monitorear"
      },
      limite: {
        type: "number",
        default: 10,
        description: "Artículos por fuente"
      }
    },
    required: ["fuentes"]
  },
  code: async ({ fuentes = ["elsiglo", "telesur", "apl"], limite = 10 }) => {
    // Configuración de fuentes RSS
    const FEEDS = {
      elsiglo: {
        url: "https://www.elsiglo.cl/feed/",
        selector: "item",
        campos: ["title", "link", "description", "pubDate", "category"]
      },
      telesur: {
        url: "https://www.telesurtv.net/rss/",
        selector: "item",
        campos: ["title", "link", "description", "pubDate", "category"]
      },
      apl: {
        url: "https://www.apl.cl/rss",
        selector: "item",
        campos: ["title", "link", "description", "pubDate", "category"]
      }
    };

    const resultados = {
      timestamp: new Date().toISOString(),
      fuentes_monitoreadas: [],
      articulos: []
    };

    for (const fuente of fuentes) {
      const config = FEEDS[fuente];
      if (!config) continue;

      try {
        // Fetch RSS (simplificado - en producción usar parser real)
        const response = await fetch(config.url);
        const texto = await response.text();
        
        // Parsear XML (simplificado)
        const articulos = texto.match(/<item>([\s\S]*?)<\/item>/g)?.slice(0, limite) || [];
        
        resultados.fuentes_monitoreadas.push({
          nombre: fuente,
          articulos_encontrados: articulos.length,
          estado: "ok"
        });

        for (const articulo of articulos) {
          const titulo = articulo.match(/<title>(.*?)<\/title>/)?.[1] || "";
          const link = articulo.match(/<link>(.*?)<\/link>/)?.[1] || "";
          const descripcion = articulo.match(/<description>(.*?)<\/description>/s)?.[1] || "";
          const fecha = articulo.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
          const categoria = articulo.match(/<category>(.*?)<\/category>/)?.[1] || "";

          resultados.articulos.push({
            fuente,
            titulo,
            link,
            descripcion: descripcion.substring(0, 300) + "...",
            fecha,
            categoria,
            embedding: null // Para análisis de similitud
          });
        }
      } catch (error) {
        resultados.fuentes_monitoreadas.push({
          nombre: fuente,
          error: error.message,
          estado: "error"
        });
      }
    }

    // Guardar raw data
    const fs = await import('fs');
    const path = await import('path');
    const outputDir = path.join(process.cwd(), "projects/polab/la-unidad/v3-informe");
    fs.mkdirSync(outputDir, { recursive: true });
    
    const outputPath = path.join(outputDir, `raw-${Date.now()}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(resultados, null, 2));

    return {
      success: true,
      articulos_recolectados: resultados.articulos.length,
      fuentes_ok: resultados.fuentes_monitoreadas.filter(f => f.estado === "ok").length,
      archivo_guardado: outputPath,
      proximo_paso: "la_unidad_sintetizar",
      input_para_sintesis: resultados.articulos.map(a => a.titulo).join("\n---\n")
    };
  }
};