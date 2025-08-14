const CACHE_NAME = 'volleyball-app-v1';
const urlsToCache = [
  '/',
  '/index.html',  // نام فایل HTML شما (اگر index0012.txt باشه، تغییر بدید)
  // اضافه کردن فایل‌های دیگه اگر نیاز باشه، مثل CSS خارجی یا تصاویر
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;  // از کش استفاده کن
        }
        return fetch(event.request);  // از شبکه بگیر
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});