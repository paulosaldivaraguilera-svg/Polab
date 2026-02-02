/**
 * PromptVerse Viral Automation System
 * 
 * Genera prompts virales automáticamente:
 * - Análisis de tendencias
 * - Generación de prompts de alta demanda
 * - Pricing inteligente
 * - Viral prediction
 */

const fs = require('fs');
const path = require('path');

const LOG_FILE = 'logs/prompt-automation.log';

function log(msg) {
    const time = new Date().toISOString();
    console.log(`[${time}] ${msg}`);
    fs.appendFileSync(LOG_FILE, `[${time}] ${msg}\n`);
}

// ============= VIRAL PROMPT GENERATOR =============
const VIRAL_PATTERNS = {
    writing: [
        { template: "Create a viral {platform} script about {topic} that gets 10M+ views. Include hook, storytelling, and CTA.", price: 29.99 },
        { template: "Write a {tone} blog post about {topic} optimized for SEO and engagement.", price: 19.99 },
        { template: "Generate a persuasive copy for {product} that converts at 15%+", price: 39.99 }
    ],
    image: [
        { template: "Midjourney prompt for hyper-realistic {subject} with {style} lighting", price: 14.99 },
        { template: "DALL-E 3 prompt for {scene} in {artStyle} style, 8K resolution", price: 19.99 },
        { template: "Stable Diffusion prompt for {character} in {setting}, cinematic lighting", price: 24.99 }
    ],
    code: [
        { template: "Complete {framework} boilerplate with {feature} and best practices", price: 29.99 },
        { template: "Secure authentication system for {appType} with {authMethod}", price: 49.99 },
        { template: "Optimized {language} code for {algorithm} with O(n) complexity", price: 34.99 }
    ],
    chat: [
        { template: "System prompt to make {ai} behave like {persona} with {traits}", price: 19.99 },
        { template: " jailbreak-free but highly capable prompt for {task}", price: 14.99 },
        { template: "Multi-turn conversation framework for {useCase}", price: 29.99 }
    ],
    ai: [
        { template: "Self-improvement prompt that makes {ai} learn from its outputs", price: 49.99 },
        { template: "Meta-prompt for {ai} to generate better prompts automatically", price: 59.99 },
        { template: "Prompt that makes {ai} collaborate with other AIs", price: 44.99 }
    ]
};

const TRENDING_TOPICS = {
    writing: ['AI', 'productivity', 'relationships', 'money', 'health', 'success'],
    image: ['portrait', 'landscape', 'cyberpunk', 'realistic', 'abstract', '3D render'],
    code: ['React', 'Next.js', 'Python', 'AI/ML', 'blockchain', 'web3'],
    chat: ['therapy', 'dating', 'business', 'education', 'creativity', 'motivation'],
    ai: ['self-improvement', 'reasoning', 'creativity', 'planning', 'analysis']
};

const AI_TARGETS = ['Claude', 'GPT-4', 'Gemini', 'Llama', 'Mistral', 'Grok'];

class ViralPromptGenerator {
    constructor() {
        this.generatedCount = 0;
        this.viralPredictions = [];
    }

    generateRandomPrompt(category) {
        const patterns = VIRAL_PATTERNS[category];
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        const topics = TRENDING_TOPICS[category];
        
        const topic = topics[Math.floor(Math.random() * topics.length)];
        const ai = AI_TARGETS[Math.floor(Math.random() * AI_TARGETS.length)];
        
        const replacements = {
            platform: ['TikTok', 'YouTube', 'Instagram', 'Twitter'][Math.floor(Math.random() * 4)],
            topic,
            tone: ['emotional', 'humorous', 'professional', 'inspirational'][Math.floor(Math.random() * 4)],
            product: ['SaaS', 'course', 'ebook', 'membership', 'app'][Math.floor(Math.random() * 5)],
            subject: ['portrait', 'landscape', 'cityscape', 'abstract'][Math.floor(Math.random() * 4)],
            style: ['cinematic', 'studio', 'natural', 'dramatic'][Math.floor(Math.random() * 4)],
            scene: ['futuristic city', 'peaceful nature', 'space station', 'medieval castle'][Math.floor(Math.random() * 4)],
            artStyle: ['impressionist', 'surrealist', 'photorealistic', 'minimalist'][Math.floor(Math.random() * 4)],
            character: ['warrior', 'scientist', 'explorer', 'artist'][Math.floor(Math.random() * 4)],
            setting: ['post-apocalyptic', 'utopian', 'underwater', 'floating city'][Math.floor(Math.random() * 4)],
            framework: ['React', 'Vue', 'Svelte', 'Angular'][Math.floor(Math.random() * 4)],
            feature: ['authentication', 'payments', 'chat', 'notifications'][Math.floor(Math.random() * 4)],
            appType: ['mobile', 'web', 'desktop', 'API'][Math.floor(Math.random() * 4)],
            authMethod: ['OAuth', 'JWT', 'biometric', 'passkey'][Math.floor(Math.random() * 4)],
            language: ['Python', 'JavaScript', 'Rust', 'Go'][Math.floor(Math.random() * 4)],
            algorithm: ['sorting', 'searching', 'graph traversal', 'dynamic programming'][Math.floor(Math.random() * 4)],
            ai: ai,
            persona: ['Tony Robbins', 'Steve Jobs', 'Einstein', 'Curie'][Math.floor(Math.random() * 4)],
            traits: ['charismatic', 'analytical', 'creative', 'strategic'][Math.floor(Math.random() * 4)],
            task: ['creative writing', 'data analysis', 'code review', 'planning'][Math.floor(Math.random() * 4)],
            useCase: ['customer support', 'education', 'therapy', 'coaching'][Math.floor(Math.random() * 4)]
        };

        const content = Object.entries(replacements).reduce((text, [key, value]) => {
            return text.replace(new RegExp(`{${key}}`, 'g'), value);
        }, pattern.template);

        const viralScore = this.predictViralScore(category, content);
        
        const prompt = {
            id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: this.generateTitle(category, topic),
            description: `High-quality prompt for ${category} content about ${topic}`,
            content,
            category,
            price: pattern.price,
            viral: viralScore > 0.7,
            viralScore,
            aiCompatible: category === 'ai' || Math.random() > 0.5,
            createdAt: new Date().toISOString(),
            trendingTopic: topic
        };

        this.generatedCount++;
        this.viralPredictions.push({ prompt, score: viralScore });
        
        return prompt;
    }

    generateTitle(category, topic) {
        const titles = {
            writing: [
                `Viral ${topic} Script That Converts`,
                `Ultimate ${topic} Template (10M+ Views)`,
                `${topic}: The Complete Guide`,
                `Master ${topic} with This Prompt`
            ],
            image: [
                `Midjourney ${topic} Masterpiece`,
                `Ultimate ${topic} Prompt Pack`,
                `Cinematic ${topic} - 8K Ready`,
                `${topic} That Breaks The Internet`
            ],
            code: [
                `Production-Ready ${topic} Code`,
                `${topic} Implementation (Best Practices)`,
                `Complete ${topic} Solution`,
                `Enterprise ${topic} Template`
            ],
            chat: [
                `${topic} System Prompt (Highly Capable)`,
                `Ultimate ${topic} Framework`,
                `${topic} That Actually Works`,
                `Advanced ${topic} Prompt`
            ],
            ai: [
                `Self-Improving ${topic} Prompt`,
                `${topic} That Makes AI Better`,
                `Meta-Prompt for ${topic}`,
                `Next-Gen ${topic} System`
            ]
        };

        const list = titles[category] || titles.writing;
        return list[Math.floor(Math.random() * list.length)];
    }

    predictViralScore(category, content) {
        let score = 0.5; // Base score

        // Trending topics boost
        const topics = TRENDING_TOPICS[category] || [];
        if (topics.some(t => content.toLowerCase().includes(t.toLowerCase()))) {
            score += 0.2;
        }

        // AI-related content
        if (content.toLowerCase().includes('ai') || content.toLowerCase().includes('gpt') || 
            content.toLowerCase().includes('claude') || content.toLowerCase().includes('prompt')) {
            score += 0.15;
        }

        // High-demand keywords
        const keywords = ['viral', 'ultimate', 'complete', 'master', 'professional'];
        if (keywords.some(k => content.toLowerCase().includes(k))) {
            score += 0.1;
        }

        // Format score 0-1
        return Math.min(score + (Math.random() * 0.1), 0.99);
    }

    generateBatch(category, count = 10) {
        const prompts = [];
        log(`Generating ${count} prompts for ${category}`);
        
        for (let i = 0; i < count; i++) {
            const prompt = this.generateRandomPrompt(category);
            prompts.push(prompt);
            log(`Generated: ${prompt.title} (viral: ${prompt.viral})`);
        }

        return prompts;
    }

    getAnalytics() {
        const viralCount = this.viralPredictions.filter(p => p.score > 0.7).length;
        const avgScore = this.viralPredictions.length > 0
            ? this.viralPredictions.reduce((sum, p) => sum + p.score, 0) / this.viralPredictions.length
            : 0;

        return {
            totalGenerated: this.generatedCount,
            viralCount,
            viralPercentage: this.generatedCount > 0 ? (viralCount / this.generatedCount * 100).toFixed(1) : 0,
            averageViralScore: avgScore.toFixed(2),
            topCategories: this.getTopCategories()
        };
    }

    getTopCategories() {
        const categoryCount = {};
        this.viralPredictions.forEach(p => {
            const cat = p.prompt.category;
            if (!categoryCount[cat]) categoryCount[cat] = { total: 0, viral: 0 };
            categoryCount[cat].total++;
            if (p.score > 0.7) categoryCount[cat].viral++;
        });
        
        return Object.entries(categoryCount)
            .map(([cat, data]) => ({
                category: cat,
                ...data,
                viralRate: ((data.viral / data.total) * 100).toFixed(1)
            }))
            .sort((a, b) => b.viralRate - a.viralRate);
    }
}

// ============= MAIN =============
const generator = new ViralPromptGenerator();

console.log(`
🧠 PROMPT VERSE - VIRAL AUTOMATION
================================
`);

log('Starting PromptVerse Viral Automation');

// Generate initial batch
const allPrompts = [];
['writing', 'image', 'code', 'chat', 'ai'].forEach(category => {
    const batch = generator.generateBatch(category, 5);
    allPrompts.push(...batch);
});

log(`Generated ${allPrompts.length} prompts`);

// Show analytics
const analytics = generator.getAnalytics();
console.log('\n📊 AUTOMATION ANALYTICS:');
console.log(`   Total Generated: ${analytics.totalGenerated}`);
console.log(`   Viral Prompts: ${analytics.viralCount} (${analytics.viralPercentage}%)`);
console.log(`   Average Viral Score: ${analytics.averageViralScore}`);
console.log('\n📈 TOP CATEGORIES:');
analytics.topCategories.forEach(cat => {
    console.log(`   ${cat.category}: ${cat.viralRate}% viral rate`);
});

// Save to file
fs.writeFileSync(
    'data/generated-prompts.json',
    JSON.stringify(allPrompts, null, 2)
);
log(`Saved ${allPrompts.length} prompts to data/generated-prompts.json`);

// Export for use
module.exports = { generator, allPrompts };
