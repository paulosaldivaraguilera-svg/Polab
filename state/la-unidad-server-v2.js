/**
 * La Unidad - Content Aggregator v2
 * Versión simplificada con rss-parser API correcta
 */

const http = require('http');
const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

// Configuración
const CONFIG = {
    port: process.env.PORT || 8085,
    refreshInterval: 15 * 60 * 1000, // 15 minutos
    maxArticlesPerSource: 5
};

// Fuentes RSS
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
    }
];

// Parser RSS
const parser = new Parser({
    timeout: 10000,
    customFields: {
        item: ['description']
    }
});

class LaUnidadAggregator {
    constructor() {
        this.articles = [];
        this.trends = [];
        this.sources = new Map();
        this.startTime = Date.now();
        
        console.log('📰 La Unidad v2 - Aggregator iniciado');
    }
    
    async fetchRSS(source) {
        try {
            console.log(`📡 Fetching: ${source.name}...`);
            const feed = await parser.parseURL(source.url);
            console.log(`✅ Fetched: ${source.name} (${feed.items?.length || 0} items)`);
            return { feed, source };
        } catch (error) {
            console.error(`❌ Error fetching ${source.name}:`, error.message);
            return null;
        }
    }
    
    async fetchAllSources() {
        console.log('\n' + '='.repeat(60));
        console.log('📡 FETCHING RSS SOURCES');
        console.log('='.repeat(60) + '\n');
        
        const fetchedAt = new Date().toISOString();
        
        // Fetch en paralelo
        const promises = RSS_SOURCES.map(source => this.fetchRSS(source));
        const results = await Promise.all(promises);
        
        // Procesar resultados
        for (const result of results) {
            if (result && result.feed && result.feed.items) {
                const { feed, source } = result;
                
                this.sources.set(source.id, {
                    ...source,
                    lastFetch: fetchedAt,
                    articleCount: feed.items.length,
                    title: feed.title
                });
                
                const articles = feed.items.slice(0, CONFIG.maxArticlesPerSource).map(item => ({
                    id: `${source.id}_${item.guid || Date.now()}`,
                    sourceId: source.id,
                    sourceName: source.name,
                    sourceCountry: source.country,
                    title: item.title || 'Sin título',
                    description: item.description || item.contentSnippet || '',
                    link: item.link,
                    pubDate: item.pubDate || item.isoDate,
                    category: source.category,
                    fetchedAt: fetchedAt
                }));
                
                this.articles.push(...articles);
            }
        }
        
        // Detectar trends (simple word count)
        this.detectTrends();
        
        console.log(`\n📊 Total artículos: ${this.articles.length}`);
        console.log(`📈 Trending topics: ${this.trends.length}`);
    }
    
    detectTrends() {
        const wordCount = {};
        const stopWords = ['el', 'la', 'los', 'las', 'de', 'en', 'por', 'para', 'con', 'un', 'una', 'y', 'o', 'que'];
        
        this.articles.forEach(article => {
            const words = article.title.toLowerCase().split(/\s+/);
            words.forEach(word => {
                if (word.length > 3 && !stopWords.includes(word)) {
                    wordCount[word] = (wordCount[word] || 0) + 1;
                }
            });
        });
        
        // Top 10 trending
        this.trends = Object.entries(wordCount)
            .filter(([word, count]) => count >= 3)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));
        
        if (this.trends.length > 0) {
            console.log(`📈 Trending: ${this.trends.map(t => t.word).join(', ')}`);
        }
    }
    
    getArticles(options = {}) {
        let filtered = [...this.articles];
        
        if (options.category) {
            filtered = filtered.filter(a => a.category === options.category);
        }
        
        if (options.sourceId) {
            filtered = filtered.filter(a => a.sourceId === options.sourceId);
        }
        
        // Ordenar por fecha
        filtered.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        
        if (options.limit) {
            filtered = filtered.slice(0, options.limit);
        }
        
        return filtered;
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

// Crear servidor HTTP
const aggregator = new LaUnidadAggregator();

function serveStaticFile(filePath, contentType) {
    const fullPath = path.join(__dirname, 'projects/personal/la-unidad', filePath);
    
    try {
        const data = fs.readFileSync(fullPath);
        return { success: true, data, contentType };
    } catch (err) {
        return { success: false, error: err };
    }
}

async function handleRequest(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    // Servir frontend
    if (pathname === '/' || pathname === '/index.html') {
        const result = serveStaticFile('index.html', 'text/html');
        if (result.success) {
            res.writeHead(200, { 'Content-Type': result.contentType });
            res.end(result.data);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
        return;
    }
    
    // API Endpoints
    if (pathname.startsWith('/api/')) {
        res.setHeader('Content-Type', 'application/json');
        
        if (pathname === '/api/articles') {
            const category = url.searchParams.get('category');
            const sourceId = url.searchParams.get('sourceId');
            const limit = parseInt(url.searchParams.get('limit')) || 20;
            
            const articles = aggregator.getArticles({ category, sourceId, limit });
            
            res.end(JSON.stringify({
                success: true,
                data: articles,
                meta: { total: articles.length }
            }));
        }
        else if (pathname === '/api/trends') {
            res.end(JSON.stringify({
                success: true,
                data: aggregator.trends
            }));
        }
        else if (pathname === '/api/sources') {
            res.end(JSON.stringify({
                success: true,
                data: Array.from(aggregator.sources.values())
            }));
        }
        else if (pathname === '/api/stats') {
            res.end(JSON.stringify({
                success: true,
                data: aggregator.getStats()
            }));
        }
        else {
            res.writeHead(404);
            res.end(JSON.stringify({ success: false, error: 'Not Found' }));
        }
        return;
    }
    
    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
}

const server = http.createServer(handleRequest);

server.listen(CONFIG.port, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 LA UNIDAD v2 - SERVER INICIADO');
    console.log('='.repeat(60));
    console.log(`📡 Port: ${CONFIG.port}`);
    console.log(`🌐 URL: http://localhost:${CONFIG.port}`);
    console.log('');
    
    // Fetch inicial
    aggregator.fetchAllSources().then(() => {
        // Auto-refresh
        setInterval(() => {
            console.log('\n🔄 Auto-refreshing...');
            aggregator.fetchAllSources();
        }, CONFIG.refreshInterval);
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n👋 Apagando...');
    server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
    console.log('\n👋 Apagando...');
    server.close(() => process.exit(0));
});
