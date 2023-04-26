// - Name of App Shell Cache for assets files
const StaticCacheName = 'site-static-v1'

// - Name of dynamic cache
const dynamicCacheName = 'app-dynamic-v1'

// Array with assets files for static cache 

const assets = [
    '/',
    '/index.html',
    '/js/app.js',
    '/js/ui.js',
    '/js/materialize.min.js',
    '/css/styles.css',
    '/css/materialize.min.css',
    '/img/dish.png',
    'https://fonts.googleapis.com/icon?family=Material+Icons'
]

const limitCacheSize = (cacheName, numAllowedFiles) => {
    caches.open(cacheName).then(cache => {
        cache.keys().then(keys => {
            if(keys.length > numAllowedFiles) {
                cache.delete(keys[0]).then(limitCacheSize(cacheName, numAllowedFiles))
            }
        })
    })
}
// - install service worker
self.addEventListener('install', event => {
    // console.log('service worker has been installed');
    event.waitUntil( // - good to have "waitUntil" if you have many large files/img/etc. set in your cache/storage


// - Open static cache        
    caches.open(StaticCacheName).then(cache => {
            // console.log('Caching all assets');
// - adding array of assets files to cache
            cache.addAll(assets)
        })
    )
});

// - activate service worker 
self.addEventListener('activate', event => {
    console.log('service worker has been activated');
// - Wait until all tasks are completed
    event.waitUntil(
// - Delete previous cached versions */
        
// - Call all cache keys (name of cache collections)
        caches.keys().then(keys => {
// - Returns an array of promises (one promise for each file)
            return Promise.all(keys
// - Filter everyone who is not a member of the current cache version 
                .filter(key => key !== StaticCacheName)
// - map filter array and delete files 
                .map(key => caches.delete(key)))
        })
    )
    return;
});

// - fetch event 
self.addEventListener('fetch', event => {
    limitCacheSize(dynamicCacheName, 2)

// - fix problem with dynamic cache and chrome-extension bug
    if (!(event.request.url.indexOf('http') === 0)) return;

    //console.log(event.request);
// - controlling answer on request
    event.respondWith(
        caches.match(event.request).then(cacheRes => {
// - return if match from cache - or taking file to server
            return cacheRes || fetch(event.request)
            .then(fetchRes => {
// - open dynamic cache
                return caches.open(dynamicCacheName).then(cache => {
// - adding page to dynamic cache
// - clone takes a copy of the variable
                    cache.put(event.request.url, fetchRes.clone())
                    
                    limitCacheSize(dynamicCacheName, 1)

//returning request
                    return fetchRes
                })
            })
        })
    )
})
