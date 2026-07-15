const CACHE_NAME = 'gerenciador_despesas-auto-backup-22h-v1';
const FILES_TO_CACHE = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'config.js',
  'sync.js',
  'manifest.json',
  'icon-180.png',
  'icon-192.png',
  'icon-512.png',
  'favicon-32.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Supabase and any other external API must always go directly to the network.
  if (url.origin !== self.location.origin || request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then(cached => cached || caches.match('index.html')))
  );
});
