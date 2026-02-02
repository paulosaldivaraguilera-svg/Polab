/**
 * LA UNIDAD - Auto-Repost & Content Distribution System
 * 
 * Sistema de curaduría y distribución automática de contenido
 * con cumplimiento legal completo de fuentes.
 */

const Parser = require('rss-parser');
const crypto = require('crypto');

// Fuentes autorizadas (del usuario)
const AUTHORIZED_SOURCES = {
    cgtn: {
        name: 'CGTN Español',
        url: 'https://espanol.cgtn.com/',
        rss: 'https://espanol.cgtn.com/rss/',
        country: 'China',
        perspective: 'Internacional'
    },
    elsiglo: {
        name: 'El Siglo',
        url: 'https://elsiglo.cl/',
        rss: 'https://elsiglo.cl/feed/',
        country: 'Chile',
        perspective: 'Progresista Nacional'
    },
    nuevomundo: {
        name: 'Radio Nuevo Mundo',
        url: 'https://radionuevomundo.cl/',
        rss: 'https://radionuevomundo.cl/feed/',
        country: 'Chile',
        perspective: 'Cultural/Social'
    },
    granma: {
        name: 'Granma',
        url: 'https://www.granma.cu/',
        rss: 'https://www.granma.cu/rss/',
        country: 'Cuba',
        perspective: 'Oficial Cubana'
    },
    telesur: {
        name: 'TeleSUR',
        url: 'https://www.telesurtv.net/',
        rss: 'https://www.telesurtv.net/rss/',
        country: 'Venezuela',
        perspective: 'Latinoamericana Alternativa'
    },
    prensalatina: {
        name: 'Prensa Latina',
        url: 'https://www.prensa-latina.cu/',
        rss: 'https://www.prensa-latina.cu/rss/',
        country: 'Cuba',
        perspective: 'Internacional'
    }
};

class ContentReposter {
    constructor() {
        this.parser = new Parser({
            timeout: 15000,
            headers: { 'User-Agent': 'LaUnidad-Bot/1.0' }
        });
        
        this.contentQueue = [];
        this.publishedContent = [];
        this.stats = {
            totalCurated: 0,
            totalPublished: 0,
            bySource: {},
            byCategory: {}
        };
    }

    /**
     * Obtener contenido de todas las fuentes
     */
    async fetchAllSources() {
        console.log('📰 LA UNIDAD: Obteniendo contenido de fuentes autorizadas...\n');
        
        for (const [key, source] of Object.entries(AUTHORIZED_SOURCES)) {
            await this.fetchSource(key, source);
        }
        
        console.log(`\n✅ Total curado: ${this.contentQueue.length} artículos`);
        return this.contentQueue;
    }

    /**
     * Obtener contenido de una fuente específica
     */
    async fetchSource(sourceKey, source) {
        try {
            console.log(`📡 ${source.name} (${source.country})...`);
            
            const feed = await this.parser.parseURL(source.rss);
            const articles = [];
            
            for (const item of feed.items.slice(0, 10)) {
                if (!item.link || !item.title) continue;
                
                const article = this.createArticle(item, sourceKey, source);
                this.contentQueue.push(article);
                articles.push(article);
            }
            
            this.stats.totalCurated += articles.length;
            this.stats.bySource[source.name] = (this.stats.bySource[source.name] || 0) + articles.length;
            
            console.log(`   ✅ ${articles.length} artículos obtenidos`);
            
        } catch (error) {
            console.error(`   ❌ Error: ${error.message}`);
        }
    }

    /**
     * Crear artículo con toda la información legal
     */
    createArticle(item, sourceKey, source) {
        const article = {
            id: crypto.randomUUID(),
            title: item.title?.trim(),
            link: item.link,
            publishedAt: new Date(item.pubDate || item.isoDate || item.date),
            
            // Fuente original (LEGAL)
            sourceName: source.name,
            sourceUrl: source.url,
            sourceCountry: source.country,
            sourcePerspective: source.perspective,
            sourceKey: sourceKey,
            originalDate: item.pubDate || item.isoDate,
            
            // Contenido
            content: item.contentSnippet || item.content || item.summary || '',
            summary: this.generateSummary(item.contentSnippet || item.content || ''),
            author: item.creator || item.author || source.name,
            
            // Metadatos
            category: this.categorizeArticle(item.title + ' ' + (item.contentSnippet || '')),
            sentiment: this.analyzeSentiment(item.title + ' ' + (item.contentSnippet || '')),
            tags: this.extractTags(item.title + ' ' + (item.contentSnippet || '')),
            
            // Estado
            curated: false,
            published: false,
            createdAt: Date.now(),
            
            // Legal notice will be added on publish
            legalNotice: null
        };
        
        return article;
    }

    /**
     * Publicar artículo con todas las menciones legales
     */
    publishArticle(articleId, platforms = ['web']) {
        const article = this.contentQueue.find(a => a.id === articleId);
        
        if (!article) {
            throw new Error('Artículo no encontrado');
        }
        
        // Generar contenido con todas las menciones legales
        const legalContent = this.generateLegalContent(article);
        
        article.published = true;
        article.publishedAt = new Date();
        article.legalContent = legalContent;
        article.sharedTo = platforms;
        article.publishedBy = 'La Unidad';
        
        this.publishedContent.push(article);
        this.stats.totalPublished++;
        
        // Generar previsualizaciones para compartir
        article.socialPreviews = {
            twitter: this.generateTwitterPreview(article),
            whatsapp: this.generateWhatsAppPreview(article),
            web: this.generateWebPreview(article)
        };
        
        return article;
    }

    /**
     * Generar contenido con menciones legales completas
     */
    generateLegalContent(article) {
        return {
            // Header legal
            header: `
<!-- LEGAL HEADER -->
<div class="la-unidad-article">
<div class="source-disclaimer">
    <p class="source-title">📰 Artículo originalmente publicado en:</p>
    <p class="source-name">${article.sourceName}</p>
    <p class="source-country">${article.sourceCountry}</p>
    <p class="source-link"><a href="${article.link}" target="_blank" rel="noopener noreferrer">Ver artículo original</a></p>
    <p class="source-date">Fecha de publicación original: ${new Date(article.originalDate).toLocaleDateString('es-CL')}</p>
</div>

<div class="legal-notice">
    <p><strong>🔒 Nota Legal:</strong> Este contenido ha sido curado y redistribuido con fines informativos y educativos. 
    La Unidad actúa como agregador de contenido periodístico alternativo. El contenido original es propiedad intelectual 
    de ${article.sourceName} y sus respectivos autores. La reproducción se realiza bajo el principio de 
    "uso justo" (fair use) para fines de crítica, comentario y análisis periodístico.</p>
    <p class="perspective-note">📊 Perspectiva editorial de la fuente: ${article.sourcePerspective}</p>
</div>
</div>
            `.trim(),
            
            // Título
            title: article.title,
            
            // Metadata
            metadata: `
<p class="article-meta">
    <strong>Autor:</strong> ${article.author}<br>
    <strong>Fuente:</strong> ${article.sourceName} (${article.sourceCountry})<br>
    <strong>Fecha:</strong> ${new Date(article.originalDate).toLocaleDateString('es-CL')}<br>
    <strong>Categoría:</strong> ${this.capitalize(article.category)}
</p>
            `.trim(),
            
            // Contenido
            content: article.content,
            
            // Footer legal
            footer: `
<!-- LEGAL FOOTER -->
<div class="article-footer">
    <div class="source-attribution">
        <p>🔗 <strong>Atribución:</strong> Este artículo fue obtenido de ${article.sourceName}. 
        La Unidad proporciona acceso a contenido periodístico alternativo para enriquecer el debate público.</p>
    </div>
    
    <div class="correction-policy">
        <p><strong>📝 Política de Correcciones:</strong> Si detectas errores en la reproducción de este contenido, 
        por favor contacta a редакция@launidad.cl para realizar las correcciones pertinentes.</p>
    </div>
    
    <div class="copyright-notice">
        <p>© ${new Date().getFullYear()} La Unidad - Agencia de Prensa Digital. 
        Este contenido se distribuye bajo licencia de uso justo.</p>
    </div>
</div>
            `.trim()
        };
    }

    /**
     * Generar previsualización para Twitter/X
     */
    generateTwitterPreview(article) {
        const maxLength = 280;
        let text = `📰 ${article.title}\n\n`;
        text += `📰 Fuente: ${article.sourceName} (${article.sourceCountry})\n`;
        text += `🔗 ${article.link}\n\n`;
        text += `📊 Perspectiva: ${article.sourcePerspective}\n`;
        text += `#LaUnidad #PrensaAlternativa`;
        
        if (text.length > maxLength) {
            text = text.slice(0, maxLength - 3) + '...';
        }
        
        return text;
    }

    /**
     * Generar previsualización para WhatsApp
     */
    generateWhatsAppPreview(article) {
        return `📰 *${article.title}*

📰 *Fuente:* ${article.sourceName}
🌐 *País:* ${article.sourceCountry}
📅 *Fecha:* ${new Date(article.originalDate).toLocaleDateString('es-CL')}
🔗 *Enlace:* ${article.link}

📊 *Perspectiva editorial:* ${article.sourcePerspective}

---
🔒 Contenido curado por La Unidad - Agencia de Prensa Digital`;
    }

    /**
     * Generar previsualización para web
     */
    generateWebPreview(article) {
        return {
            title: article.title,
            description: article.summary.slice(0, 200),
            source: article.sourceName,
            sourceUrl: article.link,
            image: null,
            publishedAt: article.publishedAt
        };
    }

    /**
     * Categorizar artículo
     */
    categorizeArticle(text) {
        const lower = text.toLowerCase();
        
        if (lower.match(/polític|eleccion|congreso|gobierno|estado/)) return 'politica';
        if (lower.match(/económ|trabaj|comerci|empres|dinero/)) return 'economia';
        if (lower.match(/internacion|internacional|exterior|extranjer/)) return 'internacional';
        if (lower.match(/cultur|art|músic|cine|medi/)) return 'cultura';
        if (lower.match(/socied|social|comunid|públic/)) return 'sociedad';
        if (lower.match(/opinión|editori|column/)) return 'opinion';
        if (lower.match(/cientí|tecnolog|innovac/)) return 'ciencia';
        
        return 'general';
    }

    /**
     * Analizar sentimiento
     */
    analyzeSentiment(text) {
        const positive = ['acuerdo', 'cooperación', 'paz', 'progreso', 'solidaridad', 'justicia', 'derechos'];
        const negative = ['conflicto', 'crisis', 'bloqueo', 'sanciones', 'guerra', 'ataque', 'tensión'];
        
        const lower = text.toLowerCase();
        const pos = positive.filter(w => lower.includes(w)).length;
        const neg = negative.filter(w => lower.includes(w)).length;
        
        if (pos > neg) return 'positive';
        if (neg > pos) return 'negative';
        return 'neutral';
    }

    /**
     * Extraer etiquetas
     */
    extractTags(text) {
        const tags = new Set();
        const words = text.toLowerCase().split(/\s+/);
        
        for (const word of words) {
            if (word.length > 4 && word.length < 15) {
                tags.add(word.replace(/[^a-záéíóúñü]/g, ''));
            }
        }
        
        return Array.from(tags).slice(0, 5);
    }

    /**
     * Generar resumen
     */
    generateSummary(content) {
        if (!content) return '';
        const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        return text.slice(0, 500);
    }

    /**
     * Capitalizar texto
     */
    capitalize(str) {
        return str?.charAt(0).toUpperCase() + str?.slice(1) || '';
    }

    /**
     * Obtener dashboard
     */
    getDashboard() {
        return {
            stats: {
                totalCurated: this.stats.totalCurated,
                totalPublished: this.stats.totalPublished,
                bySource: this.stats.bySource,
                byCategory: this.stats.byCategory
            },
            queue: this.contentQueue.length,
            published: this.publishedContent.length,
            sources: Object.keys(AUTHORIZED_SOURCES).length,
            lastUpdate: new Date()
        };
    }

    /**
     * Exportar artículo como HTML completo
     */
    exportAsHTML(article) {
        if (!article.legalContent) {
            this.publishArticle(article.id);
        }
        
        const legal = article.legalContent;
        
        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} - La Unidad</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .prose { font-family: 'Merriweather', serif; }
        .source-disclaimer { 
            background: #f3f4f6; 
            border-left: 4px solid #3b82f6;
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 0.5rem;
        }
        .legal-notice {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 0.5rem;
            font-size: 0.875rem;
        }
        .article-footer {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #e5e7eb;
            font-size: 0.75rem;
            color: #6b7280;
        }
    </style>
</head>
<body class="bg-white text-gray-900">
    <div class="max-w-3xl mx-auto px-4 py-8">
        ${legal.header}
        
        <h1 class="text-3xl font-serif font-bold mb-4">${article.title}</h1>
        
        <div class="prose text-lg leading-relaxed">
            ${article.content}
        </div>
        
        ${legal.metadata}
        
        ${legal.footer}
    </div>
</body>
</html>`;
    }
}

module.exports = { ContentReposter, AUTHORIZED_SOURCES };
