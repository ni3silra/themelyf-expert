const CACHE_NAME = 'themelyf-dashboard-v1';
const urlsToCache = [
    '/',
    '/components',
    '/forms',
    '/css/styles.css',
    '/js/dashboard.js',
    '/js/modal.js',
    '/js/notification.js',
    '/js/form-validation.js',
    '/js/ui-components.js',
    '/js/form-inputs.js',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/notyf/3.10.0/notyf.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/notyf/3.10.0/notyf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/choices.js/10.2.0/choices.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/choices.js/10.2.0/choices.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.snow.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/sortablejs/1.15.0/Sortable.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.min.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache.map(url => {
                    return new Request(url, { mode: 'no-cors' });
                })).catch(error => {
                    console.error('Failed to cache some resources:', error);
                    // Cache individual resources that succeed
                    return Promise.allSettled(
                        urlsToCache.map(url => 
                            cache.add(new Request(url, { mode: 'no-cors' }))
                        )
                    );
                });
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                
                return fetch(event.request).then(response => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response as it can only be consumed once
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }).catch(() => {
                    // Network failed, try to return offline page for navigation requests
                    if (event.request.mode === 'navigate') {
                        return caches.match('/');
                    }
                    return new Response('Offline', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

function doBackgroundSync() {
    // Handle offline form submissions or data synchronization
    return new Promise((resolve, reject) => {
        // Implementation for syncing offline data
        console.log('Background sync executed');
        resolve();
    });
}

// Push notifications
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'New notification from Themelyf Dashboard',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'themelyf-notification',
        data: {
            url: '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification('Themelyf Dashboard', options)
    );
});

// Notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});