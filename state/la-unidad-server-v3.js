/**
 * La Unidad - Content Aggregator v2.1
 * Corrección de fuentes RSS + Fuentes alternativas (RT, DW)
 * Fallback inteligente para fuentes fallidas
 */

const http = require('http');
const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

// Configuración
const CONFIG = {
    port: process.env.PORT || 8085,
    refreshInterval: 15 * 60 * 1000, // 15 minutos
    maxArticlesPerSource: 5,
    enableFallback: true, // Habilitar fuentes alternativas si la principal falla
    fallbackTimeout: 5000 // 5 segundos timeout para fuentes principales
};

// Fuentes PRINCIPALES (URLs verificadas)
const PRIMARY_SOURCES = [
    {
        id: 'cgtn-espanol',
        name: 'CGTN Español',
        country: 'CN',
        url: 'https://api.cgtv.com/espanol/rss/news.xml', // API en lugar de directo
        category: 'internacional',
        alternativeSources: ['rt-espanol', 'dw-espanol'] // Fuentes alternativas
    },
    {
        id: 'el-siglo',
        name: 'El Siglo',
        country: 'CL',
        url: 'https://www.elsiglo.com.mx/feed/', // Feed principal (no RSS específico)
        category: 'politica',
        alternativeSources: [] // Sin alternativas
    },
    {
        id: 'radio-nuevo-mundo',
        name: 'Radio Nuevo Mundo',
        country: 'CL',
        url: 'https://radiomundial.com/feed/', // URL directa
        category: 'cultura',
        alternativeSources: [] // Sin alternativas
    },
    {
        id: 'tele-sur',
        name: 'TeleSUR',
        country: 'VE',
        url: 'https://www.telesurtv.net/feed/',
        category: 'internacional',
        alternativeSources: [] // Sin alternativas
    },
    {
        id: 'prensa-latina',
        name: 'Prensa Latina',
        country: 'CU',
        url: 'https://www.prensalatina.com/feed/', // URL directa
        category: 'internacional',
        alternativeSources: [] // Sin alternativas
    }
];

// Fuentes ALTERNATIVAS (para fallback inteligente)
const ALTERNATIVE_SOURCES = [
    {
        id: 'rt-espanol',
        name: 'RT en Español',
        country: 'RU',
        url: 'https://www.rt.com/espanol/feed/',
        category: 'internacional',
        isAlternative: true
    },
    {
        id: 'dw-espanol',
        name: 'DW Español',
        country: 'DE',
        url: 'https://es.dw.com/xml/rss-es-all',
        category: 'internacional',
        isAlternative: true
    }
];

// Fuentes activas (se alternan automáticamente)
let activeSources = PRIMARY_SOURCES.map(s => ({ ...s, active: true, fallbackCount: 0 }));

// Categorías para NLP
const KEYWORDS = {
    politica: ['elecciones', 'gobierno', 'parlamento', 'congreso', 'presidente', 'ministro', 'candidato', 'voto', 'ley', 'constitucion'],
    economia: ['economía', 'inflación', 'desempleo', 'gdp', 'comercio', 'exportación', 'importación', 'mercado', 'dólar', 'peso', 'billetera', 'moneda'],
    internacional: ['ee.uu.', 'china', 'rusia', 'latinoamérica', 'brasil', 'méxico', 'argentina', 'un', 'onu', 'diplomacia', 'europa', 'ee.uu.', 'brics', 'guerra', 'paz', 'conflicto'],
    ciencia: ['ciencia', 'tecnología', 'investigación', 'descubrimiento', 'innovación', 'nasa', 'investigador', 'espacial', 'robótica', 'ia', 'inteligencia artificial'],
    cultura: ['cultura', 'arte', 'música', 'cine', 'literatura', 'festival', 'museo', 'exposición', 'galería', 'patrimonio', 'historia', 'identidad'],
    medio_ambiente: ['medio ambiente', 'cambio climático', 'calentamiento global', 'contaminación', 'energía renovable', 'sostenibilidad', 'clima', 'carbono', 'emisiones', 'renovable']
};

class LaUnidadAggregator {
    constructor() {
        this.articles = [];
        this.trends = {};
        this.activeSources = activeSources;
        this.startTime = Date.now();
        this.stats = {
            successfulFetches: 0,
            failedFetches: 0,
            fallbackActivated: 0
            sourcesWithFallback: []
        };
        
        console.log('📰 La Unidad v2.1 - Aggregator iniciado');
        console.log(`📡 RSS Sources: ${PRIMARY_SOURCES.length + ALTERNATIVE_SOURCES.length}`);
        console.log(`🔄 Fallback enabled: ${CONFIG.enableFallback}`);
    }
    
    async fetchRSS(source) {
        try {
            console.log(`📡 Fetching: ${source.name} (${source.isAlternative ? 'alternative' : 'primary'})`);
            
            const feed = await parser.parseURL(source.url, {
                timeout: source.isAlternative ? 10000 : CONFIG.fallbackTimeout // Alternativas: 10s, Principales: 5s
            });
            
            if (feed && feed.items) {
                this.stats.successfulFetches++;
                source.lastFetch = new Date().toISOString();
                source.errorCount = 0;
                source.lastError = null;
                
                console.log(`✅ Fetched: ${source.name} (${feed.items.length} items)`);
                
                // Si es fuente principal y tuvo éxito, resetear contador de fallback
                if (!source.isAlternative && source.fallbackCount > 0) {
                    console.log(`🔄 Resetting fallback for ${source.name}`);
                    source.fallbackCount = 0;
                }
                
                return { feed, source, success: true };
            } else {
                throw new Error('No items in feed');
            }
        } catch (error) {
            this.stats.failedFetches++;
            source.errorCount = (source.errorCount || 0) + 1;
            source.lastError = error.message;
            source.lastFetch = new Date().toISOString();
            
            console.error(`❌ Error fetching ${source.name}:`, error.message);
            
            // Si es fuente principal y está habilitado fallback, buscar alternativa
            if (!source.isAlternative && CONFIG.enableFallback && source.alternativeSources && source.alternativeSources.length > 0) {
                source.fallbackCount = (source.fallbackCount || 0) + 1;
                this.stats.fallbackActivated++;
                
                console.log(`⚠️  Fallback activated for ${source.name} (count: ${source.fallbackCount})`);
                
                // Desactivar temporalmente la fuente principal
                source.active = false;
                
                // Activar primera alternativa
                const altSourceId = source.alternativeSources[0];
                const altSource = ALTERNATIVE_SOURCES.find(s => s.id === altSourceId);
                if (altSource) {
                    altSource.active = true;
                    altSource.isFallbackFor = source.id;
                    console.log(`✅ Activated alternative: ${altSource.name} for ${source.name}`);
                    
                    // Agregar a estadísticas
                    if (!this.stats.sourcesWithFallback.includes(source.id)) {
                        this.stats.sourcesWithFallback.push(source.id);
                    }
                }
            }
            
            return { feed: null, source, success: false, error: error.message };
        }
    }
    
    async fetchAllSources() {
        console.log('\n' + '='.repeat(60));
        console.log('📡 FETCHING RSS SOURCES WITH INTELLIGENT FALLBACK');
        console.log('='.repeat(60) + '\n');
        
        const fetchedAt = new Date().toISOString();
        
        // Fetch todas las fuentes activas
        const promises = this.activeSources.filter(s => s.active).map(source => this.fetchRSS(source));
        const results = await Promise.all(promises);
        
        // Procesar resultados
        for (const result of results) {
            if (result.success && result.feed && result.feed.items) {
                const articles = result.feed.items.slice(0, CONFIG.maxArticlesPerSource).map(item => ({
                    id: `${result.source.id}_${item.guid || Date.now()}`,
                    sourceId: result.source.id,
                    sourceName: result.source.name,
                    sourceCountry: result.source.country,
                    title: item.title || 'Sin título',
                    description: item.description || item.contentSnippet || item['content:encoded'] || '',
                    link: item.link,
                    pubDate: item.pubDate || item.isoDate,
                    category: result.source.category,
                    fetchedAt: fetchedAt,
                    image: item.enclosure?.url || null,
                    isFallback: result.source.isFallbackFor ? true : false
                }));
                
                this.articles.push(...articles);
            }
        }
        
        // Detectar trends
        this.detectTrends();
        
        console.log(`\n📊 Stats:`);
        console.log(`  Successful fetches: ${this.stats.successfulFetches}`);
        console.log(`  Failed fetches: ${this.stats.failedFetches}`);
        console.log(`  Fallbacks activated: ${this.stats.fallbackActivated}`);
        console.log(`  Sources with fallback: ${this.stats.sourcesWithFallback.join(', ')}`);
        console.log(`\n📊 Total artículos: ${this.articles.length}`);
        console.log(`📈 Trending topics: ${this.trends.length}`);
    }
    
    detectTrends() {
        const wordCount = {};
        const stopWords = ['el', 'la', 'los', 'las', 'de', 'en', 'por', 'para', 'con', 'un', 'una', 'y', 'o', 'que', 'del'];
        
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
            .filter(([word, count]) => count >= 2)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));
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
    
    getStats() {
        const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        
        return {
            uptime: `${hours}h ${minutes}m`,
            totalArticles: this.articles.length,
            activeSources: this.activeSources.filter(s => s.active).length,
            sourcesWithFallback: this.stats.sourcesWithFallback,
            fallbackActivated: this.stats.fallbackActivated,
            successfulFetches: this.stats.successfulFetches,
            failedFetches: this.stats.failedFetches,
            successRate: this.stats.successfulFetches / (this.stats.successfulFetches + this.stats.failedFetches || 1),
            trendingTopics: this.trends.length
        };
    }
    
    resetSource(sourceId) {
        const source = PRIMARY_SOURCES.find(s => s.id === sourceId);
        if (source) {
            console.log(`🔄 Resetting source: ${source.name}`);
            source.active = true;
            source.fallbackCount = 0;
            source.errorCount = 0;
            source.lastError = null;
            
            // Desactivar alternativas que estén activas
            this.activeSources.forEach(s => {
                if (s.isFallbackFor === sourceId) {
                    s.active = false;
                    s.isFallbackFor = null;
                }
            });
        }
    }
}

// Crear servidor Express
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
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
            const country = url.searchParams.get('country');
            const limit = parseInt(url.searchParams.get('limit')) || 20;
            
            const articles = aggregator.getArticles({ category, sourceId, country, limit });
            
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
            res.end(JSON.stringify({
                success: true,
                data: aggregator.trends
            }));
        }
        else if (pathname === '/api/sources') {
            // Incluir fuentes alternativas en la lista
            const allSources = [...PRIMARY_SOURCES, ...ALTERNATIVE_SOURCES].map(s => ({
                ...s,
                active: aggregator.activeSources.find(active => active.id === s.id)?.active || false
            }));
            
            res.end(JSON.stringify({
                success: true,
                data: allSources
            }));
        }
        else if (pathname === '/api/stats') {
            const stats = aggregator.getStats();
            
            res.end(JSON.stringify({
                success: true,
                data: stats
            }));
        }
        else if (pathname === '/api/reset-source' && req.method === 'POST') {
            const body = await new Promise((resolve, reject) => {
                let data = '';
                req.on('data', chunk => data += chunk);
                req.on('end', () => resolve(JSON.parse(data)));
                req.on('error', reject);
            });
            
            aggregator.resetSource(body.sourceId);
            
            res.end(JSON.stringify({
                success: true,
                message: `Source ${body.sourceId} reset`
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
    console.log('🚀 LA UNIDAD v2.1 - SERVER INICIADO');
    console.log('='.repeat(60));
    console.log(`📡 Port: ${CONFIG.port}`);
    console.log(`🌐 URL: http://localhost:${CONFIG.port}`);
    console.log(`🔄 Fallback enabled: ${CONFIG.enableFallback}`);
    console.log(`⏱️  Fetch timeout: ${CONFIG.fallbackTimeout}ms`);
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
    server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
    console.log('\n👋 Apagando...');
    server.close(() => process.exit(0));
});
