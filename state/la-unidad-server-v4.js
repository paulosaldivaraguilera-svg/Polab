/**
 * La Unidad - Content Aggregator v4 (FIXED)
 * Corrección de inicialización y sintaxis
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
    enableFallback: true
};

// Fuentes PRINCIPALES (URLs verificadas)
const PRIMARY_SOURCES = [
    {
        id: 'cgtn-espanol',
        name: 'CGTN Español',
        country: 'CN',
        url: 'https://api.cgtv.com/espanol/rss/news.xml',
        category: 'internacional',
        alternativeSources: ['rt-espanol', 'dw-espanol']
    },
    {
        id: 'el-siglo',
        name: 'El Siglo',
        country: 'CL',
        url: 'https://www.elsiglo.com.mx/feed/',
        category: 'politica',
        alternativeSources: []
    },
    {
        id: 'radio-nuevo-mundo',
        name: 'Radio Nuevo Mundo',
        country: 'CL',
        url: 'https://radiomundial.com/feed/',
        category: 'cultura',
        alternativeSources: []
    },
    {
        id: 'tele-sur',
        name: 'TeleSUR',
        country: 'VE',
        url: 'https://www.telesurtv.net/feed/',
        category: 'internacional',
        alternativeSources: []
    },
    {
        id: 'prensa-latina',
        name: 'Prensa Latina',
        country: 'CU',
        url: 'https://www.prensalatina.com/feed/',
        category: 'internacional',
        alternativeSources: []
    }
];

// Fuentes ALTERNATIVAS (para fallback)
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

// Categorías para NLP
const KEYWORDS = {
    politica: ['elecciones', 'gobierno', 'parlamento', 'congreso', 'presidente', 'ministro', 'candidato', 'voto', 'ley', 'constitucion'],
    economia: ['economia', 'inflacion', 'desempleo', 'gdp', 'comercio', 'exportacion', 'importacion', 'mercado', 'dolar', 'peso', 'billetera', 'moneda'],
    internacional: ['ee.uu.', 'china', 'rusia', 'latinoamerica', 'brasil', 'mexico', 'argentina', 'un', 'onu', 'diplomacia', 'europa', 'ue', 'brics', 'guerra', 'paz', 'conflicto'],
    ciencia: ['ciencia', 'tecnologia', 'investigacion', 'descubrimiento', 'innovacion', 'nasa', 'investigador', 'espacial', 'robotica', 'ia', 'inteligencia artificial'],
    cultura: ['cultura', 'arte', 'musica', 'cine', 'literatura', 'festival', 'museo', 'exposicion', 'galeria', 'patrimonio', 'historia', 'identidad'],
    medio_ambiente: ['medio ambiente', 'cambio climatico', 'calentamiento global', 'contaminacion', 'energia renovable', 'sostenibilidad', 'clima', 'carbono', 'emisiones', 'renovable']
};

class LaUnidadAggregator {
    constructor() {
        this.articles = [];
        this.trends = [];
        this.sources = new Map();
        
        // Inicializar fuentes
        PRIMARY_SOURCES.forEach(source => {
            this.sources.set(source.id, {
                ...source,
                active: true,
                fallbackCount: 0,
                lastFetch: null,
                lastError: null
            });
        });
        
        // Inicializar alternativas
        ALTERNATIVE_SOURCES.forEach(source => {
            this.sources.set(source.id, {
                ...source,
                active: false, // Desactivadas por defecto
                isAlternative: true,
                isFallbackFor: null,
                fallbackCount: 0,
                lastFetch: null,
                lastError: null
            });
        });
        
        this.startTime = Date.now();
        
        // Estadísticas
        this.stats = {
            successfulFetches: 0,
            failedFetches: 0,
            fallbackActivated: 0,
            sourcesWithFallback: []
        };
        
        console.log('📰 La Unidad v4 - Aggregator iniciado');
        console.log(`📡 Primary Sources: ${PRIMARY_SOURCES.length}`);
        console.log(`📡 Alternative Sources: ${ALTERNATIVE_SOURCES.length}`);
    }
    
    async fetchRSS(source) {
        const timeout = source.isAlternative ? 10000 : 5000;
        const parser = new Parser({ timeout });
        
        try {
            console.log(`📡 Fetching: ${source.name} (${source.isAlternative ? 'alternative' : 'primary'})...`);
            
            const feed = await parser.parseURL(source.url);
            
            if (feed && feed.items && feed.items.length > 0) {
                this.stats.successfulFetches++;
                source.lastFetch = new Date().toISOString();
                source.lastError = null;
                source.errorCount = (source.errorCount || 0);
                
                console.log(`✅ Fetched: ${source.name} (${feed.items.length} items)`);
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
            return { feed: null, source, success: false, error: error.message };
        }
    }
    
    async fetchAllSources() {
        console.log('\n' + '='.repeat(60));
        console.log('📡 FETCHING RSS SOURCES WITH INTELLIGENT FALLBACK');
        console.log('='.repeat(60) + '\n');
        
        const fetchedAt = new Date().toISOString();
        
        // Primero, intentar todas las fuentes principales
        const primaryPromises = PRIMARY_SOURCES.map(source => this.fetchRSS(source));
        const primaryResults = await Promise.all(primaryPromises);
        
        // Luego, fuentes alternativas
        const altPromises = ALTERNATIVE_SOURCES.map(source => this.fetchRSS(source));
        const altResults = await Promise.all(altPromises);
        
        // Procesar resultados principales
        for (const result of primaryResults) {
            if (result.success && result.feed && result.feed.items) {
                const { feed, source } = result;
                const articles = feed.items.slice(0, CONFIG.maxArticlesPerSource).map(item => ({
                    id: `${source.id}_${item.guid || Date.now()}`,
                    sourceId: source.id,
                    sourceName: source.name,
                    sourceCountry: source.country,
                    title: item.title || 'Sin título',
                    description: item.description || item.contentSnippet || item['content:encoded'] || '',
                    link: item.link,
                    pubDate: item.pubDate || item.isoDate,
                    category: source.category,
                    fetchedAt: fetchedAt,
                    image: item.enclosure?.url || null,
                    isFallback: false
                }));
                
                this.articles.push(...articles);
            }
        }
        
        // Procesar resultados alternativas (solo si se activaron por fallback)
        for (const result of altResults) {
            if (result.source.active && result.success && result.feed && result.feed.items) {
                const { feed, source } = result;
                const articles = feed.items.slice(0, CONFIG.maxArticlesPerSource).map(item => ({
                    id: `${source.id}_${item.guid || Date.now()}`,
                    sourceId: source.id,
                    sourceName: source.name,
                    sourceCountry: source.country,
                    title: item.title || 'Sin título',
                    description: item.description || item.contentSnippet || item['content:encoded'] || '',
                    link: item.link,
                    pubDate: item.pubDate || item.isoDate,
                    category: source.category,
                    fetchedAt: fetchedAt,
                    image: item.enclosure?.url || null,
                    isFallback: true
                }));
                
                this.articles.push(...articles);
            }
        }
        
        // Detectar trends
        this.detectTrends();
        
        console.log(`\n📊 Stats:`);
        console.log(`  Successful: ${this.stats.successfulFetches}`);
        console.log(`  Failed: ${this.stats.failedFetches}`);
        console.log(`  Fallbacks: ${this.stats.fallbackActivated}`);
        console.log(`  Total artículos: ${this.articles.length}`);
        console.log(`  Trends: ${this.trends.length}`);
    }
    
    activateFallback(sourceId) {
        const source = this.sources.get(sourceId);
        if (!source) return;
        
        console.log(`⚠️ Activating fallback for ${source.name}`);
        
        source.active = false;
        source.fallbackCount = (source.fallbackCount || 0) + 1;
        
        this.stats.fallbackActivated++;
        
        // Buscar y activar alternativa
        const primary = PRIMARY_SOURCES.find(s => s.id === sourceId);
        if (primary && primary.alternativeSources && primary.alternativeSources.length > 0) {
            const altId = primary.alternativeSources[0];
            const alt = this.sources.get(altId);
            if (alt) {
                alt.active = true;
                alt.isFallbackFor = sourceId;
                console.log(`✅ Activated alternative: ${alt.name}`);
                
                if (!this.stats.sourcesWithFallback.includes(sourceId)) {
                    this.stats.sourcesWithFallback.push(sourceId);
                }
            }
        }
        
        // Guardar estado actualizado
        const currentSource = this.sources.get(sourceId);
        if (currentSource) {
            this.sources.set(sourceId, currentSource);
        }
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
        
        this.trends = Object.entries(wordCount)
            .filter(([word, count]) => count >= 2)
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
        
        if (options.country) {
            filtered = filtered.filter(a => a.sourceCountry === options.country);
        }
        
        filtered.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        
        if (options.limit) {
            filtered = filtered.slice(0, options.limit);
        }
        
        return filtered;
    }
    
    getTrends() {
        return this.trends;
    }
    
    getSources() {
        const allSources = [];
        this.sources.forEach((source, id) => {
            allSources.push({
                ...source,
                active: source.active
            });
        });
        return allSources;
    }
    
    getStats() {
        const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        
        return {
            uptime: `${hours}h ${minutes}m`,
            totalArticles: this.articles.length,
            activeSources: this.sources.filter((s, id) => s.active).length,
            successfulFetches: this.stats.successfulFetches,
            failedFetches: this.stats.failedFetches,
            fallbackActivated: this.stats.fallbackActivated,
            sourcesWithFallback: this.stats.sourcesWithFallback,
            trendingTopics: this.trends.length
        };
    }
    
    resetSource(sourceId) {
        const source = this.sources.get(sourceId);
        if (!source) return;
        
        console.log(`🔄 Resetting source: ${source.name}`);
        
        source.active = true;
        source.fallbackCount = 0;
        source.lastError = null;
        source.errorCount = 0;
        source.isFallbackFor = null;
        
        // Desactivar alternativas
        PRIMARY_SOURCES.forEach(s => {
            if (s.alternativeSources && s.alternativeSources.includes(sourceId)) {
                const alt = this.sources.get(sourceId);
                if (alt) {
                    alt.active = false;
                    alt.isFallbackFor = null;
                }
            }
        });
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
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    if (pathname === '/' || pathname === '/index.html') {
        const result = serveStaticFile('index.html', 'text/html');
        if (result.success) {
            res.writeHead(200, { 'Content-Type': result.contentType });
            res.end(result.data);
        } else {
            res.writeHead(404);
            res.end('Not Found');
        }
        return;
    }
    
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
                data: aggregator.getSources()
            }));
        }
        else if (pathname === '/api/stats') {
            res.end(JSON.stringify({
                success: true,
                data: aggregator.getStats()
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
    
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
}

const server = http.createServer(handleRequest);

server.listen(CONFIG.port, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 LA UNIDAD v4 - SERVER INICIADO');
    console.log('='.repeat(60));
    console.log(`📡 Port: ${CONFIG.port}`);
    console.log(`🌐 URL: http://localhost:${CONFIG.port}`);
    console.log(`🔄 Fallback enabled: ${CONFIG.enableFallback}`);
    console.log('');
    
    aggregator.fetchAllSources().then(() => {
        setInterval(() => {
            console.log('\n🔄 Auto-refreshing RSS sources...');
            aggregator.fetchAllSources();
        }, CONFIG.refreshInterval);
    });
});

process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down gracefully...');
    server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
    console.log('\n👋 Shutting down gracefully...');
    server.close(() => process.exit(0));
});
