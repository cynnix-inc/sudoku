const VERSION = 'v4.1';
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

  // Lightweight fallbacks for missing icons to avoid noisy 404s
  if (
    url.pathname === '/favicon.ico' ||
    url.pathname === '/icons/icon-192.png' ||
    url.pathname === '/icons/icon-512.png'
  ) {
    event.respondWith((async () => {
      try {
        const network = await fetch(req);
        if (network && network.ok) return network;
      } catch (_) {}
      const isPng = url.pathname.endsWith('.png');
      if (isPng) {
        // 192/512 fallback PNGs (simple gradient square with S) – tiny inline PNGs via data URL
        const size = url.pathname.includes('512') ? 512 : 192;
        // Use an SVG served as PNG by drawing via OffscreenCanvas is not available in SW; return SVG instead
        const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' width='${size}' height='${size}'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#6376f1'/><stop offset='1' stop-color='#8aa2ff'/></linearGradient></defs><rect width='64' height='64' rx='12' fill='url(#g)'/><text x='32' y='43' font-size='34' font-weight='700' text-anchor='middle' fill='white' font-family='Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif'>S</text></svg>`;
        return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=31536000, immutable' } });
      } else {
        // favicon.ico fallback as SVG
        const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#6376f1'/><stop offset='1' stop-color='#8aa2ff'/></linearGradient></defs><rect width='64' height='64' rx='12' fill='url(#g)'/><text x='32' y='43' font-size='34' font-weight='700' text-anchor='middle' fill='white' font-family='Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif'>S</text></svg>`;
        return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=31536000, immutable' } });
      }
    })());
    return;
  }

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


