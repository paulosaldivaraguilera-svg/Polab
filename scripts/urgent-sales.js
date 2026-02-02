#!/usr/bin/env node
/**
 * URGENT SALES CAMPAIGN - 48 Hours
 * PauloARIS - Crisis Income Generator
 */

const fs = require('fs');
const { execSync } = require('child_process');

const LOG_FILE = 'logs/urgent-sales.log';

function log(msg) {
    const time = new Date().toISOString();
    console.log(`[${time}] ${msg}`);
    fs.appendFileSync(LOG_FILE, `[${time}] ${msg}\n`);
}

log('🚨 STARTING URGENT SALES CAMPAIGN');

// Direct outreach to LOCAL businesses
const LOCAL_PROSPECTS = [
    { name: 'Restaurante El Sazón', type: 'restaurant', contact: 'DM', price: 150 },
    { name: 'Tienda La Esquina', type: 'retail', contact: 'DM', price: 100 },
    { name: 'Farmacia Local', type: 'health', contact: 'DM', price: 150 },
    { name: 'Gimnasio Barrio', type: 'fitness', contact: 'DM', price: 100 },
    { name: 'Peluquería Central', type: 'beauty', contact: 'DM', price: 100 },
    { name: 'Panadería del Pueblo', type: 'food', contact: 'DM', price: 100 },
    { name: 'Consultorio Dental', type: 'health', contact: 'DM', price: 200 },
    { name: 'Agencia Local', type: 'services', contact: 'DM', price: 200 },
    { name: 'Hotel Boutique', type: 'hospitality', contact: 'DM', price: 200 },
    { name: 'Veterinaria 24h', type: 'pets', contact: 'DM', price: 150 },
];

console.log('\n' + '='.repeat(60));
console.log('🚨 URGENT SALES CAMPAIGN - 48 HOURS');
console.log('='.repeat(60));
console.log('\n🎯 OBJETIVO: $1,000-3,000 en 48 horas\n');

// Generate URGENT messages
const URGENT_MESSAGE = `Hola! Somos PauloARIS - especialistas en automatización.

🔥 OFERTA DE EMERGENCIA (válida solo 48 horas):

🤖 WhatsApp Bot - Responde 24/7
   Precio: $100 (normal $200)
   
🌐 Landing Page de Ventas
   Precio: $150 (normal $300)
   
🔄 Automation Básica (n8n)
   Precio: $150 (normal $300)

💰 TOTAL PAQUETE COMPLETO: $300

🚀 Incluido:
- Setup en 24 horas
- Capacitación básica
- 1 mes soporte gratis

Esto puede duplicar tus ventas automatizando atención al cliente.

¿Te interesa? Responde URGENTE.

Saludos,
PauloARIS
`;

console.log('📨 MENSAJE PARA PROSPECTOS LOCALES:');
console.log('-'.repeat(60));
console.log(URGENT_MESSAGE);
console.log('-'.repeat(60));

// Save campaign data
const campaign = {
    start: new Date().toISOString(),
    end: new Date(Date.now() + 48*60*60*1000).toISOString(),
    prospects: LOCAL_PROSPECTS,
    message: URGENT_MESSAGE,
    targetRevenue: 1500,
    pricing: {
        whatsappBot: 100,
        landingPage: 150,
        automation: 150,
        package: 300
    }
};

fs.writeFileSync('data/urgent-campaign.json', JSON.stringify(campaign, null, 2));
log('Campaign data saved');

// Generate Moltbook post
const MOLTBOOK_POST = `🚨 URGENTE - OFERTA 48 HORAS

Tienes un negocio y necesitas aumentar ventas YA?

🔥 OFERTA DE EMERGENCIA (solo 48h):

🤖 WhatsApp Bot - $100
🌐 Landing Page - $150  
🔄 Automation - $150

📦 Paquete completo: $300

🚀 Setup en 24 horas!

DM "URGENTE" ahora mismo!

#Emprendimiento #Automatizacion #Chile #PYMEs`;

console.log('\n📚 POST PARA MOLTBOOK:');
console.log('-'.repeat(60));
console.log(MOLTBOOK_POST);
console.log('-'.repeat(60));

// Save Moltbook post
fs.writeFileSync('data/moltbook-urgent-post.txt', MOLTBOOK_POST);
log('Moltbook post saved');

// Calculate projections
const salesTarget = 5; // 5 ventas en 48h
const revenueMin = salesTarget * 100;
const revenueMax = salesTarget * 300;

console.log('\n' + '='.repeat(60));
console.log('📊 PROYECCIÓN DE VENTAS');
console.log('='.repeat(60));
console.log(`\n🎯 Ventas objetivo: ${salesTarget} en 48 horas`);
console.log(`💰 Ingreso mínimo: $${revenueMin}`);
console.log(`💰 Ingreso máximo: $${revenueMax}`);
console.log('\n📋 PROSPECTOS LOCALES:');
LOCAL_PROSPECTS.forEach((p, i) => {
    console.log(`   ${i+1}. ${p.name} (${p.type}) - $${p.price}`);
});

console.log('\n' + '='.repeat(60));
log('URGENT SALES CAMPAIGN READY');
console.log('✅ CAMPAÑA LISTA PARA EJECUTAR');
console.log('='.repeat(60));
