// ─── HireLens PWA Service Worker ─────────────────────────────────────────────
// Strategy:
//  - Network-first + offline fallback: Navigation requests (HTML)
//  - Cache-first + network update:     Static assets (JS, CSS, images, fonts)
//  - Stale-while-revalidate:           Google Fonts stylesheets
//  - Network-only:                     API calls (/api/*)
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_VERSION = 'v1';
const SHELL_CACHE = `hirelens-shell-${CACHE_VERSION}`;
const FONT_CACHE = `hirelens-fonts-${CACHE_VERSION}`;
const ALL_CACHES = [SHELL_CACHE, FONT_CACHE];

// Paths that should NEVER be cached
const NETWORK_ONLY_PATHS = ['/api/'];

// ─── Install ─────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.allSettled([
        '/',
        '/manifest.json',
        '/favicon.svg',
        '/offline.html',
        '/icons/icon-192.png',
        '/icons/icon-512.png',
        '/icons/apple-touch-icon.png',
      ].map((url) => cache.add(url).catch(() => null)))
    ).then(() => self.skipWaiting())
  );
});

// ─── Activate: wipe old cache versions ───────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !ALL_CACHES.includes(k))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch routing ────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Only handle http(s)
  if (!url.protocol.startsWith('http')) return;

  // ── Network-only: API calls (never cache sensitive data) ─────────────────
  if (NETWORK_ONLY_PATHS.some((p) => url.pathname.startsWith(p))) {
    event.respondWith(fetch(request));
    return;
  }

  // ── Stale-while-revalidate: Google Fonts ─────────────────────────────────
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(swrFonts(request));
    return;
  }

  // ── Navigation: Network-first, fallback to cached shell or offline page ───
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            caches.open(SHELL_CACHE).then((c) => c.put(request, res.clone()));
          }
          return res;
        })
        .catch(() =>
          caches.match(request)
            .then((cached) => cached || caches.match('/offline.html'))
        )
    );
    return;
  }

  // ── Static assets: Cache-first, populate on miss ──────────────────────────
  if (
    url.hostname === self.location.hostname ||
    url.hostname === 'localhost'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((res) => {
            if (res.ok) {
              caches.open(SHELL_CACHE).then((c) => c.put(request, res.clone()));
            }
            return res;
          })
          .catch(() => caches.match('/offline.html'));
      })
    );
  }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function swrFonts(request) {
  const cache = await caches.open(FONT_CACHE);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then((res) => {
    if (res.ok) cache.put(request, res.clone());
    return res;
  }).catch(() => cached);
  return cached || networkPromise;
}

// ─── SW update message ────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
