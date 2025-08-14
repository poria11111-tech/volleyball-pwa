
const CACHE_NAME = 'vb-pwa-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-256.png',
  './icon-384.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => {
      if (key !== CACHE_NAME) {
        return caches.delete(key);
      }
    })))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((res) => {
        if (event.request.method === 'GET') {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, resClone);
          });
        }
        return res;
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_SIZE') {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE_NAME);
      const requests = await cache.keys();
      let total = 0;
      for (const req of requests) {
        const res = await cache.match(req);
        if (res) {
          const buf = await res.clone().arrayBuffer();
          total += buf.byteLength || 0;
        }
      }
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ size: total });
      }
    })());
  }
});
