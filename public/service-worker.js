const FILES_TO_CACHE = [
    "/",
    "/carsforsale/",
    "/css/style.css",
    "/js/client.js",
    "/dist/js/client.min.js",
    "/images/bugatti.jpg",
    "/images/ferrari.jpg",
    "/images/mazda.jpg",
    "/images/mulsanne.jpg",
    "/manifest.webmanifest",
    "/images/icons/icon-72x72.png",
    "/images/icons/icon-96x96.png",
    "/images/icons/icon-128x128.png",
    "/images/icons/icon-144x144.png",
    "/images/icons/icon-152x152.png",
    "/images/icons/icon-192x192.png",
    "/images/icons/icon-384x384.png",
    "/images/icons/icon-512x512.png",
];

const CACHE_NAME = "static-cache-v6";
const DATA_CACHE_NAME = "data-cache-v6";


// install
self.addEventListener("install", function (evt) {
    console.log("SW install")
    // pre cache image data
    // evt.waitUntil(
    //     caches.open(DATA_CACHE_NAME).then((cache) => cache.add("/api/images"))
    // );

    // pre cache all static assets
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
    );

    // tell the browser to activate this service worker immediately once it
    // has finished installing
    self.skipWaiting();
});

// activate
self.addEventListener("activate", function (evt) {
    console.log("SW activate")
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Removing old cache data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

// fetch
self.addEventListener('fetch', function (evt) {
    console.log("SW fetch")
    if (evt.request.url.includes('/api/') || evt.request.url.includes('/carsforsale/')) {
        console.log("evt.request.url", evt.request.url)
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                    .then(response => {
                        if (response.status === 200) {
                            cache.put(evt.request.url, response.clone());
                        }

                        return response;
                    })
                    .catch(err => {
                        return cache.match(evt.request);
                    });
            })
        );

        return;
    }

    evt.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(evt.request).then(response => {
                return response || fetch(evt.request);
            });
        })
    );
});