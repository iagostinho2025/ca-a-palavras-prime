const CACHE_VERSION = 'v81';
const PRECACHE_NAME = `wordhunter-precache-${CACHE_VERSION}`;
const RUNTIME_NAME = `wordhunter-runtime-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/audio.js',
  './js/campaign-levels.js',
  './js/game-engine.js',
  './js/knowledge-paths.js',
  './js/prime-event.js',
  './js/progression.js',
  './js/themes.js',
  './assets/images/background/tela_inicial.webp',
  './assets/images/background/tela_ajustes.webp',
  './assets/images/ui/logo_tela_inicial_trim.webp',
  './assets/images/ui/gold.webp',
  './assets/images/ui/gems.webp',
  './assets/images/ui/desafio_diario_trim.webp',
  './assets/images/ui/temas_trim.webp',
  './assets/images/ui/eventos_trim.webp',
  './assets/images/ui/caminho_conhecimento_trim.webp',
  './assets/images/ui/footer/icon-shop.png',
  './assets/images/ui/footer/icon-themes.png',
  './assets/images/ui/footer/icon-home.png',
  './assets/images/ui/footer/icon-achievements.png',
  './assets/images/ui/footer/icon-settings.png',
  './assets/images/ui/wallet/coin-stack.png',
  './assets/images/ui/wallet/gem.png',
  './assets/images/ui/wallet/button-plus-coins.png',
  './assets/images/ui/wallet/button-plus-gems.png',
  './assets/images/ui/wallet/coin-stack-ui.png',
  './assets/images/ui/wallet/gem-ui.png',
  './assets/images/ui/wallet/button-plus-coins-ui.png',
  './assets/images/ui/wallet/button-plus-gems-ui.png',
  './assets/images/avatar/avatar-01.webp',
  './assets/images/avatar/avatar-02.webp',
  './assets/images/avatar/avatar-03.webp',
  './assets/images/avatar/avatar-04.webp',
  './assets/images/avatar/avatar-05.webp',
  './assets/images/avatar/avatar-06.webp',
  './assets/images/avatar/avatar-07.webp',
  './assets/images/avatar/avatar-08.webp',
  './assets/images/avatar/avatar-09.webp',
  './assets/images/avatar/avatar-10.webp',
  './assets/icons/icon-192.svg',
  './assets/icons/icon-512.svg',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(PRECACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![PRECACHE_NAME, RUNTIME_NAME].includes(key))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then((cached) => cached || fetch(request))
    );
    return;
  }

  const isFont = url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com';
  if (isFont) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (url.origin === self.location.origin && request.method === 'GET') {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(fetch(request));
});

function cacheFirst(request) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;
    return fetch(request).then((response) => {
      if (!response || response.status !== 200) return response;
      const copy = response.clone();
      caches.open(RUNTIME_NAME).then((cache) => cache.put(request, copy));
      return response;
    });
  });
}

function staleWhileRevalidate(request) {
  return caches.open(RUNTIME_NAME).then((cache) =>
    cache.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
}
