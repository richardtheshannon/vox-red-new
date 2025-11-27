// Service Worker for Offline PWA Support
const CACHE_VERSION = 'v3';
const APP_CACHE = `app-shell-${CACHE_VERSION}`;
const CONTENT_CACHE = `content-${CACHE_VERSION}`;
const MEDIA_CACHE = `media-${CACHE_VERSION}`;

// App shell resources (critical for offline operation)
const APP_SHELL_URLS = [
  '/'
  // Note: Next.js dynamic chunks will be cached on-demand via fetch handler
  // Static assets like CSS/JS are auto-cached when first loaded
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(APP_SHELL_URLS).catch(err => {
        console.warn('[SW] Failed to cache some app shell resources:', err);
      });
    }).then(() => {
      console.log('[SW] Service worker installed');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.includes('app-shell-') && cacheName !== APP_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          if (cacheName.includes('content-') && cacheName !== CONTENT_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          if (cacheName.includes('media-') && cacheName !== MEDIA_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline, network when online
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Skip API requests for now - handled by offline manager
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached response if available
      if (cachedResponse) {
        console.log('[SW] Serving from cache:', url.pathname);
        return cachedResponse;
      }

      // Otherwise fetch from network
      return fetch(request).then((response) => {
        // Only cache successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Determine which cache to use based on content type and URL
        const responseToCache = response.clone();
        const contentType = response.headers.get('content-type') || '';

        let cacheName = APP_CACHE;

        // Cache Next.js static assets in app cache
        if (url.pathname.startsWith('/_next/')) {
          cacheName = APP_CACHE;
          console.log('[SW] Caching Next.js asset:', url.pathname);
        }
        // Cache media files
        else if (contentType.includes('image/')) {
          cacheName = MEDIA_CACHE;
        } else if (contentType.includes('audio/')) {
          cacheName = MEDIA_CACHE;
          console.log('[SW] Auto-caching audio file:', url.pathname);
        }
        // Cache fonts
        else if (contentType.includes('font/') || url.pathname.includes('.woff')) {
          cacheName = APP_CACHE;
        }
        // Cache CSS and JS
        else if (contentType.includes('text/css') || contentType.includes('javascript')) {
          cacheName = APP_CACHE;
        }
        // Cache JSON API responses
        else if (contentType.includes('application/json')) {
          cacheName = CONTENT_CACHE;
        }

        caches.open(cacheName).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      }).catch(() => {
        // If network fails, try to find cached version with different strategies
        console.log('[SW] Network failed for:', url.pathname);

        // For audio files, try to find in media cache even if exact match failed
        if (url.pathname.includes('.mp3') || url.pathname.includes('.wav') || url.pathname.includes('.ogg')) {
          return caches.open(MEDIA_CACHE).then((cache) => {
            return cache.match(request).then((cachedAudio) => {
              if (cachedAudio) {
                console.log('[SW] Found audio in media cache:', url.pathname);
                return cachedAudio;
              }
              console.warn('[SW] Audio not found in cache:', url.pathname);
              return new Response('Audio file not available offline', {
                status: 503,
                headers: { 'Content-Type': 'text/plain' }
              });
            });
          });
        }

        // If network fails and no cache, serve the root page (which handles offline mode)
        // This allows the React app to load and detect offline state
        if (url.pathname === '/') {
          return caches.match('/').then((rootResponse) => {
            return rootResponse || new Response('Offline - please connect to the internet', {
              status: 503,
              headers: { 'Content-Type': 'text/html' }
            });
          });
        }

        // For other resources, return a basic offline response
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

// Message handler for cache management from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Received message:', event.data);

  if (event.data.type === 'CACHE_URLS') {
    // Cache specific URLs sent from offline manager
    const { urls, cacheName = CONTENT_CACHE } = event.data;
    console.log('[SW] Received CACHE_URLS request for', urls.length, 'URLs into cache:', cacheName);

    event.waitUntil(
      caches.open(cacheName).then((cache) => {
        console.log('[SW] Cache opened:', cacheName);
        let successCount = 0;
        let failCount = 0;

        return Promise.all(
          urls.map((url) => {
            console.log('[SW] Fetching for cache:', url);
            return fetch(url, {
              mode: 'cors',
              credentials: 'same-origin'
            }).then((response) => {
              if (response.ok) {
                console.log('[SW] Successfully fetched, caching:', url);
                successCount++;
                return cache.put(url, response);
              } else {
                console.warn('[SW] Fetch failed with status', response.status, 'for:', url);
                failCount++;
              }
            }).catch(err => {
              console.error('[SW] Failed to fetch/cache:', url, err);
              failCount++;
            });
          })
        ).then(() => {
          console.log('[SW] Cache operation complete. Success:', successCount, 'Failed:', failCount);
          // Send success message back
          self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: 'CACHE_COMPLETE',
                count: successCount,
                failed: failCount
              });
            });
          });
        });
      })
    );
  }

  if (event.data.type === 'CLEAR_CACHE') {
    // Clear all caches
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('[SW] All caches cleared');
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'CACHE_CLEARED' });
          });
        });
      })
    );
  }

  if (event.data.type === 'GET_CACHE_STATUS') {
    // Return cache status
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.open(cacheName).then((cache) => {
              return cache.keys().then((keys) => {
                return { cacheName, count: keys.length };
              });
            });
          })
        );
      }).then((cacheStats) => {
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'CACHE_STATUS',
              stats: cacheStats
            });
          });
        });
      })
    );
  }
});
