/**
 * La Unidad - Content Aggregator
 * 
 * Aggrega contenido de fuentes RSS internacionales
 * NLP para categorización
 * Trend detection
 * Auto-refresh cada 15 min
 */

const https = require('https');
const RSSParser = require('rss-parser');
const fs = require('fs');
const path = require('path');

// Configuración
const CONFIG = {
    port: process.env.PORT || 8085,  // Cambiado de 8084 (ocupado por juegos)
    refreshInterval: 15 * 60 * 1000, // 15 minutos
    maxArticlesPerSource: 5,
    apiEndpoint: '/api/articles'
};

// Fuentes RSS configuradas
const RSS_SOURCES = [
    {
        id: 'cgtn-espanol',
        name: 'CGTN Español',
        country: 'CN',
        url: 'https://espanol.cgtv.com/rss/news.xml',
        category: 'internacional'
    },
    {
        id: 'el-siglo',
        name: 'El Siglo',
        country: 'CL',
        url: 'https://www.elsiglo.com.mx/rss/politica.xml',
        category: 'politica'
    },
    {
        id: 'radio-nuevo-mundo',
        name: 'Radio Nuevo Mundo',
        country: 'CL',
        url: 'https://www.radiomundial.com/rss/',
        category: 'cultura'
    },
    {
        id: 'granma',
        name: 'Granma',
        country: 'CU',
        url: 'https://www.granma.cu/rss/',
        category: 'internacional'
    },
    {
        id: 'tele-sur',
        name: 'Telesur',
        country: 'VE',
        url: 'https://www.telesurtv.net/rss/',
        category: 'internacional'
    },
    {
        id: 'prensa-latina',
        name: 'Prensa Latina',
        country: 'CU',
        url: 'https://www.prensalatina.cu/feed.php',
        category: 'internacional'
    }
];

// Categorías para NLP simplificado
const KEYWORDS = {
    politica: ['elecciones', 'gobierno', 'parlamento', 'congreso', 'presidente', 'ministro', 'candidato', 'voto', 'ley', 'constitucion'],
    economia: ['economía', 'inflación', 'desempleo', 'gdp', 'comercio', 'exportación', 'importación', 'mercado', 'dólar', 'peso'],
    internacional: ['ee.uu.', 'china', 'rusia', 'latinoamérica', 'brasil', 'méxico', 'argentina', 'un', 'onu', 'diplomacia'],
    ciencia: ['ciencia', 'tecnología', 'investigación', 'descubrimiento', 'innovación', 'nasa', 'investigador'],
    cultura: ['cultura', 'arte', 'música', 'cine', 'literatura', 'festival', 'museo', 'exposición'],
    medio_ambiente: ['medio ambiente', 'cambio climático', 'calentamiento global', 'contaminación', 'energía renovable', 'sostenibilidad']
};

class LaUnidadAggregator {
    constructor() {
        this.articles = [];
        this.trends = {};
        this.sources = new Map();
        this.startTime = Date.now();
        
        console.log('📰 La Unidad - Aggregator iniciado');
        console.log(`📡 RSS Sources: ${RSS_SOURCES.length}`);
    }
    
    async fetchRSS(url) {
        try {
            const feed = await RSSParser.parseURL(url);
            console.log(`✅ Fetched: ${feed.title || url} (${feed.items?.length || 0} items)`);
            return feed;
        } catch (error) {
            console.error(`❌ Error fetching ${url}:`, error.message);
            return null;
        }
    }
    
    categorizeArticle(article) {
        const text = `${article.title} ${article.description || ''}`.toLowerCase();
        const categories = [];
        
        for (const [category, keywords] of Object.entries(KEYWORDS)) {
            if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
                categories.push(category);
            }
        }
        
        return categories.length > 0 ? categories : ['general'];
    }
    
    detectTrends(articles) {
        const wordCount = {};
        const minArticles = 3; // Mínimo de artículos para trending
        
        articles.forEach(article => {
            const words = article.title.toLowerCase().split(/\s+/);
            words.forEach(word => {
                if (word.length > 3 && !['el', 'la', 'los', 'las', 'de', 'en', 'por', 'para', 'con'].includes(word)) {
                    wordCount[word] = (wordCount[word] || 0) + 1;
                }
            });
        });
        
        // Filtrar trending topics
        const trends = Object.entries(wordCount)
            .filter(([word, count]) => count >= minArticles)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));
        
        console.log(`📈 Trending topics: ${trends.map(t => t.word).join(', ')}`);
        
        return trends;
    }
    
    async fetchAllSources() {
        console.log('\n' + '='.repeat(60));
        console.log('📡 FETCHING RSS SOURCES');
        console.log('='.repeat(60) + '\n');
        
        const fetchedAt = new Date().toISOString();
        
        for (const source of RSS_SOURCES) {
            const feed = await this.fetchRSS(source.url);
            
            if (feed && feed.items) {
                this.sources.set(source.id, {
                    ...source,
                    lastFetch: fetchedAt,
                    articleCount: feed.items.length,
                    title: feed.title
                });
                
                // Procesar artículos
                const articles = feed.items.slice(0, CONFIG.maxArticlesPerSource).map(item => ({
                    id: `${source.id}_${item.guid || item.link}`,
                    sourceId: source.id,
                    sourceName: source.name,
                    sourceCountry: source.country,
                    title: item.title || 'Sin título',
                    description: item.contentSnippet || item.content || '',
                    link: item.link,
                    pubDate: item.pubDate || item.isoDate,
                    category: source.category,
                    fetchedAt: fetchedAt,
                    image: item.enclosure?.url || null
                }));
                
                this.articles.push(...articles);
            }
        }
        
        // Detectar trends
        this.trends = this.detectTrends(this.articles);
        
        console.log(`\n📊 Total artículos agregados: ${this.articles.length}`);
        console.log(`📈 Trending topics: ${this.trends.length}`);
    }
    
    getArticles(options = {}) {
        let filtered = [...this.articles];
        
        // Filtro por categoría
        if (options.category) {
            filtered = filtered.filter(a => a.category === options.category);
        }
        
        // Filtro por fuente
        if (options.sourceId) {
            filtered = filtered.filter(a => a.sourceId === options.sourceId);
        }
        
        // Filtro por país
        if (options.country) {
            filtered = filtered.filter(a => a.sourceCountry === options.country);
        }
        
        // Ordenar por fecha (más recientes primero)
        filtered.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        
        // Limitar resultados
        if (options.limit) {
            filtered = filtered.slice(0, options.limit);
        }
        
        return filtered;
    }
    
    getTrends() {
        return this.trends;
    }
    
    getSources() {
        return Array.from(this.sources.values());
    }
    
    getStats() {
        const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        
        return {
            uptime: `${hours}h ${minutes}m`,
            totalArticles: this.articles.length,
            activeSources: this.sources.size,
            trendingTopics: this.trends.length,
            lastFetch: new Date().toISOString()
        };
    }
}

// Crear servidor Express (o Node.js http)
const http = require('http');

const aggregator = new LaUnidadAggregator();

// Función para servir contenido estático
function serveStaticFile(req, res, filePath, contentType) {
    const fullPath = path.join(__dirname, filePath);
    
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            console.error(`❌ Error serving ${filePath}:`, err);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
            return;
        }
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

// Manejar peticiones API
async function handleAPI(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    // API Endpoints
    if (pathname === '/api/articles') {
        const category = url.searchParams.get('category');
        const sourceId = url.searchParams.get('sourceId');
        const country = url.searchParams.get('country');
        const limit = parseInt(url.searchParams.get('limit')) || 20;
        
        const articles = aggregator.getArticles({ category, sourceId, country, limit });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            data: articles,
            meta: {
                total: articles.length,
                params: { category, sourceId, country, limit }
            }
        }));
    } 
    else if (pathname === '/api/trends') {
        const trends = aggregator.getTrends();
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            data: trends
        }));
    }
    else if (pathname === '/api/sources') {
        const sources = aggregator.getSources();
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            data: sources
        }));
    }
    else if (pathname === '/api/stats') {
        const stats = aggregator.getStats();
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            data: stats
        }));
    }
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false,
            error: 'Not Found'
        }));
    }
}

// Crear servidor
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    
    // Servir frontend
    if (pathname === '/' || pathname === '/index.html') {
        serveStaticFile(req, res, 'projects/personal/la-unidad/index.html', 'text/html');
    }
    // Servir CSS/JS si están en el mismo directorio
    else if (pathname.endsWith('.css')) {
        const fs = require('fs');
        const filePath = path.join(__dirname, 'projects/personal/la-unidad', pathname);
        
        if (fs.existsSync(filePath)) {
            serveStaticFile(req, res, filePath, 'text/css');
        }
    }
    else if (pathname.endsWith('.js')) {
        const fs = require('fs');
        const filePath = path.join(__dirname, 'projects/personal/la-unidad', pathname);
        
        if (fs.existsSync(filePath)) {
            serveStaticFile(req, res, filePath, 'application/javascript');
        }
    }
    // API endpoints
    else if (pathname.startsWith('/api/')) {
        await handleAPI(req, res);
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Iniciar
server.listen(CONFIG.port, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 LA UNIDAD - SERVER INICIADO');
    console.log('='.repeat(60));
    console.log(`📡 Port: ${CONFIG.port}`);
    console.log(`🌐 URL: http://localhost:${CONFIG.port}`);
    console.log('');
    
    // Fetch inicial
    aggregator.fetchAllSources().then(() => {
        // Auto-refresh cada 15 min
        setInterval(() => {
            console.log('\n🔄 Auto-refreshing RSS sources...');
            aggregator.fetchAllSources();
        }, CONFIG.refreshInterval);
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n👋 Apagando gracefully...');
    server.close(() => {
        console.log('✅ Server detenido');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n👋 Apagando...');
    server.close(() => {
        console.log('✅ Server detenido');
        process.exit(0);
    });
});
