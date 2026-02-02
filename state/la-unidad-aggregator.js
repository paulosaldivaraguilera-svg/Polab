/**
 * LA UNIDAD - News Aggregator & Content Curator
 * 
 * Backend para agencia de prensa digital
 * Fuentes: CGTN, El Siglo, Radio Nuevo Mundo, Granma, Telesur, Prensa Latina
 */

const Parser = require('rss-parser');
const crypto = require('crypto');

// Configuración con fuentes del usuario (perspectiva editorial específica)
const CONFIG = {
    refreshInterval: 15 * 60 * 1000, // 15 minutos
    maxArticlesPerSource: 30,
    categories: ['politica', 'internacional', 'economia', 'cultura', 'sociedad', 'opinion'],
    
    // FUENTES CORREGIDAS (del usuario)
    sources: {
        // CGTN Español - China Global
        cgtn: {
            name: 'CGTN Español',
            url: 'https://espanol.cgtn.com/',
            rss: 'https://espanol.cgtn.com/rss/',
            category: 'internacional',
            language: 'es'
        },
        
        // El Siglo - Chile
        elsiglo: {
            name: 'El Siglo',
            url: 'https://elsiglo.cl/',
            rss: 'https://elsiglo.cl/feed/',
            category: 'politica',
            language: 'es'
        },
        
        // Radio Nuevo Mundo - Chile
        nuevomundo: {
            name: 'Radio Nuevo Mundo',
            url: 'https://radionuevomundo.cl/',
            rss: 'https://radionuevomundo.cl/feed/',
            category: 'cultura',
            language: 'es'
        },
        
        // Granma - Cuba
        granma: {
            name: 'Granma',
            url: 'https://www.granma.cu/',
            rss: 'https://www.granma.cu/rss/',
            category: 'internacional',
            language: 'es'
        },
        
        // Telesur - Venezuela
        telesur: {
            name: 'TeleSUR',
            url: 'https://www.telesurtv.net/',
            rss: 'https://www.telesurtv.net/rss/',
            category: 'internacional',
            language: 'es'
        },
        
        // Prensa Latina - Cuba
        prensalatina: {
            name: 'Prensa Latina',
            url: 'https://www.prensa-latina.cu/',
            rss: 'https://www.prensa-latina.cu/rss/',
            category: 'internacional',
            language: 'es'
        }
    }
};

class NewsAggregator {
    constructor() {
        this.parser = new Parser({
            timeout: 10000,
            headers: {
                'User-Agent': 'LaUnidad-Bot/1.0'
            }
        });
        
        this.articles = new Map(); // url -> article
        this.categories = new Map(); // category -> articles[]
        this.trending = []; // trending topics
        this.stats = {
            totalArticles: 0,
            publishedToday: 0,
            bySource: {},
            byCategory: {},
            lastUpdate: null
        };
    }

    /**
     * Agregar artículo desde feed RSS
     */
    async processFeed(sourceKey) {
        const source = CONFIG.sources[sourceKey];
        if (!source) return [];

        try {
            console.log(`📰 Procesando: ${source.name}...`);
            
            const feed = await this.parser.parseURL(source.rss);
            const articles = [];

            for (const item of feed.items.slice(0, CONFIG.maxArticlesPerSource)) {
                // Skip si no tiene link válido
                if (!item.link || !item.link.startsWith('http')) continue;

                const article = {
                    id: crypto.createHash('md5').update(item.link).digest('hex').slice(0, 12),
                    title: this.cleanTitle(item.title),
                    link: item.link,
                    source: source.name,
                    sourceKey: sourceKey,
                    sourceUrl: source.url,
                    publishedAt: new Date(item.pubDate || item.isoDate || item.date),
                    category: source.category,
                    content: item.contentSnippet || item.content || item.summary || '',
                    summary: this.generateSummary(item.contentSnippet || item.content || ''),
                    author: item.creator || item.author || source.name,
                    sentiment: null,
                    engagement: 0,
                    curated: false,
                    published: false,
                    sharedTo: [],
                    createdAt: Date.now()
                };

                // Detectar idioma
                article.lang = this.detectLanguage(article.title + ' ' + article.summary);

                // Analizar sentimiento
                article.sentiment = this.analyzeSentiment(article.summary);

                // Verificar duplicado
                if (!this.articles.has(article.link)) {
                    this.articles.set(article.link, article);
                    articles.push(article);
                }
            }

            // Actualizar estadísticas
            if (!this.stats.bySource[source.name]) {
                this.stats.bySource[source.name] = 0;
            }
            this.stats.bySource[source.name] += articles.length;

            if (!this.stats.byCategory[source.category]) {
                this.stats.byCategory[source.category] = 0;
            }
            this.stats.byCategory[source.category] += articles.length;

            console.log(`   ✅ ${source.name}: ${articles.length} artículos nuevos`);
            return articles;

        } catch (error) {
            console.error(`   ❌ Error ${source.name}: ${error.message}`);
            return [];
        }
    }

    /**
     * Procesar todos los feeds configurados
     */
    async refreshAll() {
        console.log('\n🔄 LA UNIDAD: Refrescando feeds de noticias...');
        const startTime = Date.now();
        let totalNew = 0;

        const sourceKeys = Object.keys(CONFIG.sources);
        
        for (const sourceKey of sourceKeys) {
            const newArticles = await this.processFeed(sourceKey);
            totalNew += newArticles.length;
        }

        // Actualizar trending topics
        this.updateTrending();

        this.stats.lastUpdate = Date.now();
        this.stats.totalArticles = this.articles.size;

        const duration = Date.now() - startTime;
        console.log(`\n✅ Feed refresh completo: ${totalNew} artículos nuevos en ${duration}ms\n`);

        return { totalNew, duration };
    }

    /**
     * Curar artículo para publicación
     */
    curateArticle(articleId, editorNotes = '', customCategory = null) {
        const article = Array.from(this.articles.values())
            .find(a => a.id === articleId);

        if (!article) {
            throw new Error('Artículo no encontrado');
        }

        article.curated = true;
        article.editorNotes = editorNotes;
        article.customCategory = customCategory || article.category;
        article.curatedAt = Date.now();

        // Añadir a categoría
        const cat = article.customCategory;
        if (!this.categories.has(cat)) {
            this.categories.set(cat, []);
        }
        this.categories.get(cat).push(article);

        return article;
    }

    /**
     * Publicar artículo
     */
    publishArticle(articleId, platforms = ['web']) {
        const article = Array.from(this.articles.values())
            .find(a => a.id === articleId);

        if (!article) {
            throw new Error('Artículo no encontrado');
        }

        if (!article.curated) {
            throw new Error('Artículo debe ser curado primero');
        }

        article.published = true;
        article.publishedAt = Date.now();
        article.sharedTo = platforms;
        article.preview = this.generatePreview(article);
        article.publishedBy = 'La Unidad Editorial';

        this.stats.publishedToday++;

        return article;
    }

    /**
     * Generar tweet para compartir
     */
    generateShareText(article) {
        const maxLength = 280;
        const hashtag = `#LaUnidad #${this.capitalize(article.customCategory || article.category)}`;
        
        let text = `📰 ${article.title}\n\n`;
        text += `${article.summary.slice(0, 120)}...\n\n`;
        text += `🔗 ${new URL(article.link).hostname}\n`;
        text += `${hashtag}`;

        if (text.length > maxLength) {
            text = text.slice(0, maxLength - 3) + '...';
        }

        return text;
    }

    /**
     * Obtener dashboard
     */
    getDashboard() {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        return {
            stats: {
                totalArticles: this.stats.totalArticles,
                publishedToday: this.stats.publishedToday,
                bySource: this.stats.bySource,
                byCategory: this.stats.byCategory,
                lastUpdate: this.stats.lastUpdate,
                sourcesConfigured: Object.keys(CONFIG.sources).length
            },
            trending: this.trending.slice(0, 10),
            recentArticles: Array.from(this.articles.values())
                .sort((a, b) => b.publishedAt - a.publishedAt)
                .slice(0, 10)
                .map(a => ({
                    id: a.id,
                    title: a.title,
                    source: a.source,
                    category: a.category,
                    sentiment: a.sentiment,
                    published: a.published,
                    publishedAt: a.publishedAt
                })),
            categories: Array.from(this.categories.entries()).map(([cat, arts]) => ({
                name: cat,
                count: arts.length,
                latest: arts.sort((a, b) => b.publishedAt - a.publishedAt)[0]
            }))
        };
    }

    // Helpers
    cleanTitle(title) {
        return title?.replace(/\s+/g, ' ').trim() || '';
    }

    generateSummary(content) {
        if (!content) return '';
        const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        return text.slice(0, 400);
    }

    detectLanguage(text) {
        const spanishWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'una', 'es', 'son', 'los', 'las', 'por', 'con'];
        const englishWords = ['the', 'and', 'of', 'to', 'a', 'in', 'is', 'it', 'that', 'for', 'are', 'was'];
        
        const words = text.toLowerCase().split(/\s+/);
        const esCount = words.filter(w => spanishWords.includes(w)).length;
        const enCount = words.filter(w => englishWords.includes(w)).length;
        
        return esCount > enCount ? 'es' : 'en';
    }

    analyzeSentiment(text) {
        const positive = ['bueno', 'mejor', 'avance', 'progreso', 'acuerdo', 'cooperación', 'paz', 'solidaridad'];
        const negative = ['crisis', 'conflicto', 'guerra', 'bloqueo', 'sanciones', 'ataque', 'crisis', 'problema'];
        
        const lower = text.toLowerCase();
        const posCount = positive.filter(w => lower.includes(w)).length;
        const negCount = negative.filter(w => lower.includes(w)).length;
        
        if (posCount > negCount) return 'positive';
        if (negCount > posCount) return 'negative';
        return 'neutral';
    }

    updateTrending() {
        const keywords = {};
        
        for (const article of this.articles.values()) {
            const words = article.title.toLowerCase().split(/\s+/);
            for (const word of words) {
                if (word.length > 5 && !['como', 'donde', 'cuando', 'porque', 'entre', 'hacia'].includes(word)) {
                    keywords[word] = (keywords[word] || 0) + 1;
                }
            }
        }

        this.trending = Object.entries(keywords)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));
    }

    generatePreview(article) {
        return {
            title: article.title,
            description: article.summary.slice(0, 200),
            source: article.source,
            url: article.link,
            image: null
        };
    }

    capitalize(str) {
        return str?.charAt(0).toUpperCase() + str?.slice(1) || '';
    }

    startAutoRefresh() {
        setInterval(() => this.refreshAll(), CONFIG.refreshInterval);
        console.log(`🔄 La Unidad: Auto-refresh cada ${CONFIG.refreshInterval / 60000} minutos`);
    }
}

module.exports = { NewsAggregator, CONFIG };
