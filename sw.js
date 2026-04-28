// MantePro 2026 — Service Worker v3 (Firebase conectado)
const CACHE_NAME = 'mantepro-v3';
const ASSETS = [
  './',
  './app_mantenimiento.html',
  './manifest.json',
];

// Install — cache core assets
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS).catch(()=>{}))
  );
});

// Activate — clean ALL old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — network first siempre (para obtener versión actualizada)
self.addEventListener('fetch', e => {
  // Skip Firebase, Google APIs — siempre network
  if (e.request.url.includes('firebase') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('gstatic') ||
      e.request.url.includes('cloudflare') ||
      e.request.url.includes('firestore') ||
      e.request.url.includes('firebasestorage')) {
    return;
  }

  // Network first — si falla, usa caché
  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (e.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
