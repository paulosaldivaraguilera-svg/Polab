// Service Worker para Comenzar - Modo Offline
const CACHE_NAME = 'comenzar-v1';
const ASSETS = [
  '/index_v2.html',
  '/manifest.json',
  '/dashboard.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(response => response || fetch(e.request)));
});

console.log("✅ Service Worker cargado - Modo offline activo");
