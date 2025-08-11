const VERSION = 'v4';
const STATIC_CACHE = `sudoku-static-${VERSION}`;
const RUNTIME_CACHE = `sudoku-runtime-${VERSION}`;
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => ![STATIC_CACHE, RUNTIME_CACHE].includes(k))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Allow page to trigger immediate activation
self.addEventListener('message', (event) => {
  if (
    event.data &&
    (event.data.type === 'SKIP_WAITING' || event.data === 'SKIP_WAITING')
  ) {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  // Only handle same-origin
  if (url.origin !== location.origin) return;

  const dest = req.destination;

  // Network-first for navigations and core assets (HTML, JS, CSS, workers)
  if (
    req.mode === 'navigate' ||
    dest === 'document' ||
    dest === 'script' ||
    dest === 'style' ||
    dest === 'worker'
  ) {
    event.respondWith(
      fetch(req, { cache: 'reload' })
        .then((resp) => {
          const copy = resp.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, copy));
          return resp;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Stale-while-revalidate for other same-origin requests (images, fonts, data)
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, copy));
          return resp;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});


