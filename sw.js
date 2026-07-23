const CACHE_NAME = 'siggraph-2026-scheduler-v1';
const PRECACHE_URLS = [
  './',
  './index.html',
  './styles/app.css',
  './js/app.js',
  './js/qr.js',
  './assets/data/siggraph2026-catalog.json',
  './assets/maps/lacc-level1.svg',
  './assets/maps/lacc-level2.svg',
];

function sameOrigin(request) {
  return new URL(request.url).origin === self.location.origin;
}

function cacheKey(url) {
  return new URL(url, self.location.href).href;
}

const PRECACHE_KEYS = new Set(PRECACHE_URLS.map(cacheKey));

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.map(name => (
        name === CACHE_NAME ? null : caches.delete(name)
      ))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request, {ignoreSearch: true});
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener('fetch', event => {
  const {request} = event;
  if (request.method !== 'GET' || !sameOrigin(request)) return;

  const url = new URL(request.url);
  if (request.mode === 'navigate' || PRECACHE_KEYS.has(cacheKey(url.pathname))) {
    event.respondWith(networkFirst(request));
  }
});
