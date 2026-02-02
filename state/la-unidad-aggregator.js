/**
 * LA UNIDAD - News Aggregator & Content Curator
 * 
 * Backend para el medio de prensa digital
 * Funciones: RSS feeds, NLP, distribución, monetización
 */

const Parser = require('rss-parser');
const { JSDOM } = require('jsdom');
const crypto = require('crypto');

// Configuración
const CONFIG = {
    refreshInterval: 15 * 60 * 1000, // 15 minutos
    maxArticlesPerSource: 50,
    categories: ['politica', 'economia', 'derecho', 'sociedad', 'ciencia', 'opinion'],
    sources: {
        nacional: [
            { name: 'El Mercurio', url: 'https://www.mer.cl/rss/', category: 'politica' },
            { name: 'La Tercera', url: 'https://www.latercera.com/feed/', category: 'actualidad' },
            { name: 'CNN Chile', url: 'https://www.cnnchile.com/feed/', category: 'politica' },
            { name: 'BioBioChile', url: 'https://www.biobiochile.cl/rss/', category: 'actualidad' }
        ],
        internacional: [
            { name: 'NYT', url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', category: 'world' },
            { name: 'WaPo', url: 'https://feeds.washingtonpost.com/rss/world', category: 'world' },
            { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss', category: 'world' },
            { name: 'BBC', url: 'http://feeds.bbci.co.uk/news/rss.xml', category: 'world' }
        ],
        economia: [
            { name: 'Diario Financiero', url: 'https://www.df.cl/rss/', category: 'economia' },
            { name: 'Estrategia', url: 'https://www.estrategia.cl/rss/', category: 'economia' }
        ],
        opinion: [
            { name: 'CIPER', url: 'https://www.ciperchile.cl/rss/', category: 'investigacion' },
            { name: 'El Mostrador', url: 'https://www.elmostrador.cl/feed/', category: 'opinion' }
        ]
    }
};

class NewsAggregator {
    constructor() {
        this.parser = new Parser();
        this.articles = new Map(); // url -> article
        this.categories = new Map(); // category -> articles[]
        this.trending = []; // trending topics
        this.stats = {
            totalArticles: 0,
            publishedToday: 0,
            byCategory: {},
            lastUpdate: null
        };
    }

    /**
     * Agregar artículo desde feed RSS
     */
    async processFeed(source) {
        try {
            const feed = await this.parser.parseURL(source.url);
            const articles = [];

            for (const item of feed.items.slice(0, CONFIG.maxArticlesPerSource)) {
                const article = {
                    id: crypto.createHash('md5').update(item.link).digest('hex').slice(0, 12),
                    title: item.title,
                    link: item.link,
                    source: source.name,
                    sourceUrl: source.url,
                    publishedAt: new Date(item.pubDate || item.isoDate),
                    category: source.category,
                    content: item.contentSnippet || item.content || '',
                    summary: this.generateSummary(item.contentSnippet || item.content || ''),
                    sentiment: null,
                    engagement: 0,
                    curated: false,
                    published: false,
                    sharedTo: [], // ['twitter', 'facebook', 'whatsapp']
                    createdAt: Date.now()
                };

                // Detectar idioma
                article.lang = this.detectLanguage(article.title + ' ' + article.summary);

                // Analizar sentimiento (simplificado)
                article.sentiment = this.analyzeSentiment(article.summary);

                // Verificar si ya existe
                if (!this.articles.has(article.link)) {
                    this.articles.set(article.link, article);
                    articles.push(article);
                }
            }

            // Actualizar estadísticas por categoría
            if (!this.stats.byCategory[source.category]) {
                this.stats.byCategory[source.category] = 0;
            }
            this.stats.byCategory[source.category] += articles.length;

            console.log(`✅ ${source.name}: ${articles.length} artículos nuevos`);
            return articles;

        } catch (error) {
            console.error(`❌ Error procesando ${source.name}:`, error.message);
            return [];
        }
    }

    /**
     * Procesar todos los feeds
     */
    async refreshAll() {
        console.log('🔄 La Unidad: Refrescando feeds de noticias...');
        const startTime = Date.now();
        let totalNew = 0;

        const allSources = [
            ...CONFIG.sources.nacional,
            ...CONFIG.sources.internacional,
            ...CONFIG.sources.economia,
            ...CONFIG.sources.opinion
        ];

        for (const source of allSources) {
            const newArticles = await this.processFeed(source);
            totalNew += newArticles.length;
        }

        // Actualizar trending topics
        this.updateTrending();

        this.stats.lastUpdate = Date.now();
        this.stats.totalArticles = this.articles.size;

        const duration = Date.now() - startTime;
        console.log(`✅ Feed refresh completo: ${totalNew} artículos nuevos en ${duration}ms`);

        return { totalNew, duration };
    }

    /**
     * Curar artículo para publicación
     */
    curateArticle(articleId, editorNotes = '') {
        const article = Array.from(this.articles.values())
            .find(a => a.id === articleId);

        if (!article) {
            throw new Error('Artículo no encontrado');
        }

        article.curated = true;
        article.editorNotes = editorNotes;
        article.curatedAt = Date.now();

        // Añadir a categoría
        if (!this.categories.has(article.category)) {
            this.categories.set(article.category, []);
        }
        this.categories.get(article.category).push(article);

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

        // Generar preview para compartir
        article.preview = this.generatePreview(article);

        // Actualizar estadísticas
        this.stats.publishedToday++;

        return article;
    }

    /**
     * Generar tweet para compartir
     */
    generateShareText(article) {
        const maxLength = 280;
        const hashtag = `#LaUnidad #${this.capitalize(article.category)}`;
        
        let text = `📰 ${article.title}\n\n`;
        text += `${article.summary.slice(0, 150)}...\n\n`;
        text += `🔗 ${article.link.split('/').slice(0, 3).join('/')}\n`;
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
                byCategory: this.stats.byCategory,
                lastUpdate: this.stats.lastUpdate
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
    generateSummary(content) {
        if (!content) return '';
        // Strip HTML
        const text = content.replace(/<[^>]*>/g, '').trim();
        // Take first 300 chars
        return text.slice(0, 300);
    }

    detectLanguage(text) {
        const spanishWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'una', 'es', 'son'];
        const englishWords = ['the', 'and', 'of', 'to', 'a', 'in', 'is', 'it', 'that', 'for'];
        
        const words = text.toLowerCase().split(/\s+/);
        const esCount = words.filter(w => spanishWords.includes(w)).length;
        const enCount = words.filter(w => englishWords.includes(w)).length;
        
        return esCount > enCount ? 'es' : 'en';
    }

    analyzeSentiment(text) {
        const positive = ['bueno', 'mejor', 'avance', 'progreso', 'good', 'better', 'advance', 'progress'];
        const negative = ['malo', 'peor', 'crisis', 'problema', 'bad', 'worse', 'crisis', 'problem'];
        
        const lower = text.toLowerCase();
        const posCount = positive.filter(w => lower.includes(w)).length;
        const negCount = negative.filter(w => lower.includes(w)).length;
        
        if (posCount > negCount) return 'positive';
        if (negCount > posCount) return 'negative';
        return 'neutral';
    }

    updateTrending() {
        // Simple trending algorithm based on recency and keywords
        const keywords = {};
        
        for (const article of this.articles.values()) {
            const words = article.title.toLowerCase().split(/\s+/);
            for (const word of words) {
                if (word.length > 4) {
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
            image: null // Would extract from OG tags
        };
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Auto-refresh loop
    startAutoRefresh() {
        setInterval(() => this.refreshAll(), CONFIG.refreshInterval);
        console.log(`🔄 La Unidad: Auto-refresh cada ${CONFIG.refreshInterval / 60000} minutos`);
    }
}

module.exports = { NewsAggregator, CONFIG };
