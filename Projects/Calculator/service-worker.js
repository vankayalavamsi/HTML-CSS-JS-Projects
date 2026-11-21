self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('engcalc-v3').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/icon-192.png',
        '/icon-512.png',
        'https://cdn.jsdelivr.net/npm/mathjs@11.11.0/lib/browser/math.js'
      ]);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
