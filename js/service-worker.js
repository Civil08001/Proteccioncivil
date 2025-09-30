const CACHE_NAME = 'proteccion-civil-v1';
const urlsToCache = [
    '/',
    '/login.php',
    '/dashboard.php',
    '/css/styles.css',
    '/js/app.js',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://cdn.tailwindcss.com'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function(event) {
    if (event.request.url.includes('api/')) {
        // Para APIs, intentar network primero, luego cache
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match(event.request);
                })
        );
    } else {
        // Para recursos estáticos, cache primero
        event.respondWith(
            caches.match(event.request)
                .then(function(response) {
                    return response || fetch(event.request);
                })
        );
    }
});