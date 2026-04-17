const CACHE_NAME = 'kolabopos-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
  // Webpack bundles will be dynamically cached in the fetch event
];

self.addEventListener('install', (event) => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // We only cache GET requests that are NOT targeting the API
  // Bypassing Webpack Hot Module Replacement to prevent infinite local reloading loops
  if (
    event.request.method !== 'GET' || 
    event.request.url.includes('/api/') || 
    event.request.url.includes('railway.app') || 
    event.request.url.includes('kolabotech.com') ||
    event.request.url.includes('/ws') ||
    event.request.url.includes('sockjs-node') ||
    event.request.url.includes('hot-update') ||
    event.request.url.includes('chrome-extension')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request for fetch
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for cache
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // Dynamically cache bundled JS/CSS
                if (event.request.url.includes('.js') || event.request.url.includes('.css') || event.request.url.includes('.woff') || event.request.url.includes('.png')) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        ).catch(() => {
          // If network completely fails and we don't have it in cache, 
          // usually we'd return a fallback offline.html, but SPA index is enough.
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
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
