const CACHE_NAME = 'pm-app-v1';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './js/app.js',
    './js/models.js',
    './js/store.js',
    './assets/logo.jpg'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request))
    );
});
