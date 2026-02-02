/**
 * Browser Fingerprint Rotation System
 * 
 * Sistema para rotación de huellas digitales de navegador:
 * - User-Agent rotation
 * - Canvas fingerprint randomization
 * - WebGL vendor spoofing
 * - Screen resolution management
 * - Timezone spoofing
 */

class FingerprintGenerator {
    constructor() {
        this.profiles = new Map();
        this.currentProfile = null;
        this.initProfiles();
    }
    
    initProfiles() {
        // Perfiles pre-definidos de navegadores comunes
        this.profiles.set('chrome_win10', {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            platform: 'Win32',
            appName: 'Netscape',
            product: 'Gecko',
            language: 'en-US',
            languages: ['en-US', 'en'],
            colorDepth: 24,
            pixelRatio: 1,
            screenResolution: [1920, 1080],
            windowSize: [1920, 1080],
            timezone: 'America/New_York',
            canvas: {
                vendor: 'Google Inc.',
                renderer: 'ANGLE (NVIDIA GeForce RTX 3080 Direct3D11 vs_12_0 fl_12_1)',
                fingerprint: null  // Se genera dinámicamente
            },
            webgl: {
                vendor: 'WebKit',
                renderer: 'WebKit WebGL'
            },
            fonts: ['Arial', 'Times New Roman', 'Courier New', 'Verdana'],
            hardwareConcurrency: 8,
            deviceMemory: 8
        });
        
        this.profiles.set('chrome_mac', {
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            platform: 'MacIntel',
            appName: 'Netscape',
            product: 'Gecko',
            language: 'en-US',
            languages: ['en-US', 'en', 'es'],
            colorDepth: 24,
            pixelRatio: 2,
            screenResolution: [2560, 1600],
            windowSize: [2560, 1600],
            timezone: 'America/Los_Angeles',
            canvas: {
                vendor: 'Google Inc.',
                renderer: 'ANGLE (Apple M1 Pro Direct3D11 vs_12_0 fl_12_1)',
                fingerprint: null
            },
            webgl: {
                vendor: 'WebKit',
                renderer: 'WebKit WebGL'
            },
            fonts: ['Arial', 'Helvetica', 'Times New Roman'],
            hardwareConcurrency: 8,
            deviceMemory: 8
        });
        
        this.profiles.set('safari_iphone', {
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
            platform: 'iPhone',
            appName: 'Mozilla',
            product: 'Mozilla',
            language: 'es-ES',
            languages: ['es-ES', 'es', 'en'],
            colorDepth: 32,
            pixelRatio: 3,
            screenResolution: [390, 844],
            windowSize: [390, 844],
            timezone: 'Europe/Madrid',
            canvas: {
                vendor: 'Apple Inc.',
                renderer: 'Apple GPU',
                fingerprint: null
            },
            webgl: {
                vendor: 'WebKit',
                renderer: 'WebKit WebGL'
            },
            fonts: ['San Francisco', 'Arial', 'Times New Roman'],
            hardwareConcurrency: 6,
            deviceMemory: 4
        });
        
        this.profiles.set('firefox_linux', {
            userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
            platform: 'Linux x86_64',
            appName: 'Netscape',
            product: 'Gecko',
            language: 'en-US',
            languages: ['en-US', 'en'],
            colorDepth: 24,
            pixelRatio: 1,
            screenResolution: [1920, 1080],
            windowSize: [1920, 1080],
            timezone: 'Europe/London',
            canvas: {
                vendor: 'Mozilla',
                renderer: 'llvmpipe (LLVM 17.0.6, 256 bits)',
                fingerprint: null
            },
            webgl: {
                vendor: 'Mozilla',
                renderer: 'llvmpipe (LLVM 17.0.6, 256 bits)'
            },
            fonts: ['DejaVu Sans', 'Arial', 'Liberation Sans'],
            hardwareConcurrency: 4,
            deviceMemory: 8
        });
    }
    
    // Obtener perfil aleatorio
    getRandomProfile() {
        const profiles = Array.from(this.profiles.keys());
        const randomKey = profiles[Math.floor(Math.random() * profiles.length)];
        return this.profiles.get(randomKey);
    }
    
    // Obtener perfil específico
    getProfile(profileName) {
        return this.profiles.get(profileName) || this.getRandomProfile();
    }
    
    // Generar fingerprint de canvas único
    generateCanvasFingerprint(profile) {
        // Simulación de renderizado de canvas
        // En producción: renderizar canvas real con WebGL
        const seed = Math.random().toString(36).substring(7);
        return {
            dataURL: `canvas_data_${seed}`,
            fingerprint: `cfp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            width: profile.screenResolution[0],
            height: profile.screenResolution[1]
        };
    }
    
    // Obtener perfil para sesión
    getSessionProfile(options = {}) {
        let profile;
        
        if (options.profileName) {
            profile = this.getProfile(options.profileName);
        } else if (options.rotate) {
            profile = this.getRandomProfile();
        } else {
            profile = this.getRandomProfile();
        }
        
        // Generar canvas fingerprint único
        const canvasData = this.generateCanvasFingerprint(profile);
        profile.canvas.fingerprint = canvasData.fingerprint;
        profile.canvas.dataURL = canvasData.dataURL;
        
        this.currentProfile = profile;
        return profile;
    }
    
    // Aplicar perfil a navegador (simulado)
    async applyProfile(profile) {
        console.log(`[Fingerprint] Applied profile: ${profile.userAgent.substring(0, 50)}...`);
        
        // En producción con Playwright:
        // const context = await browser.newContext({
        //     userAgent: profile.userAgent,
        //     viewport: { width: profile.screenResolution[0], height: profile.screenResolution[1] },
        //     locale: profile.language
        // });
        
        return {
            success: true,
            profile: {
                userAgent: profile.userAgent,
                screen: profile.screenResolution,
                timezone: profile.timezone,
                canvasFingerprint: profile.canvas.fingerprint
            }
        };
    }
}

// Browser Context Manager para Playwright
class BrowserContextManager {
    constructor() {
        this.fingerprintGen = new FingerprintGenerator();
        this.contexts = new Map();
    }
    
    async createContext(options = {}) {
        const profile = this.fingerprintGen.getSessionProfile(options);
        
        const contextId = `context_${Date.now()}`;
        const context = {
            id: contextId,
            profile,
            createdAt: Date.now(),
            browser: null,  // Would be Playwright browser context
            pages: []
        };
        
        // En producción:
        // context.browser = await chromium.launch({ headless: true });
        // const playwrightContext = await context.browser.newContext({
        //     ...this.getPlaywrightConfig(profile),
        //     fingerprint: false  // Let us handle it
        // });
        
        this.contexts.set(contextId, context);
        
        return context;
    }
    
    getPlaywrightConfig(profile) {
        return {
            userAgent: profile.userAgent,
            viewport: {
                width: profile.screenResolution[0],
                height: profile.screenResolution[1]
            },
            deviceScaleFactor: profile.pixelRatio,
            locale: profile.language,
            timezoneId: profile.timezone,
            permissions: [],
            acceptDownloads: false,
            extraHTTPHeaders: {
                'Accept-Language': profile.languages.join(',')
            }
        };
    }
    
    async closeContext(contextId) {
        const context = this.contexts.get(contextId);
        if (context && context.browser) {
            // await context.browser.close();
        }
        this.contexts.delete(contextId);
    }
    
    async closeAll() {
        for (const contextId of this.contexts.keys()) {
            await this.closeContext(contextId);
        }
    }
}

module.exports = { FingerprintGenerator, BrowserContextManager };
