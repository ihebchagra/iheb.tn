// Service Worker for iheb.tn
// Strategy: Stale-While-Revalidate for everything

const CACHE_NAME = 'iheb-tn-v2';

// Install event - cache core files
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching core files');
            return cache.addAll([
                '/',
                '/index.html',
                '/css/style.css',
                '/js/theme.js',
                '/404.html',
                '/manifest.json'
            ]);
        })
    );
    
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Take control of all pages immediately
    return self.clients.claim();
});

// Fetch event - Stale-While-Revalidate strategy
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip chrome extensions and other protocols
    if (!event.request.url.startsWith('http')) {
        return;
    }
    
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            // Try to get from cache first
            return cache.match(event.request).then((cachedResponse) => {
                // Fetch from network regardless of cache hit/miss
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    // Only cache successful responses
                    if (networkResponse && networkResponse.status === 200) {
                        // Clone the response because it can only be consumed once
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch((error) => {
                    // Network failed, return cached response if available
                    console.log('[Service Worker] Fetch failed:', error);
                    return cachedResponse;
                });
                
                // Return cached response immediately (stale), or wait for network
                return cachedResponse || fetchPromise;
            });
        })
    );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
