// Engine Area — Service Worker v1
// Cachează totul la prima vizită → funcționează offline
const CACHE_NAME = 'engine-area-v1';

const CORE_FILES = [
  './',
  './engine_area_interactive_ios.html',
  './engine_area_interactive-2.html',
  './manifest.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

// INSTALL — precachează fișierele core
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_FILES))
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE — șterge cache-urile vechi
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// FETCH — cache-first, fallback la rețea, fallback la cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match('./engine_area_interactive_ios.html'));
    })
  );
});
