//this file should be placed together with index.html!  

const latestCache = "v1"

const cacheFirst = false
const log = false
const message = true

const forceCache = [
]

const announce = (clientId, type, data) => {
    if (!message)
        return

    self.clients.get(clientId).then(client => {
        if (!client)
            return
        client.postMessage({
            type, data
        })
    })
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(latestCache).then((cache) => {
            return cache.addAll(forceCache)
        })
    )
})

self.addEventListener('fetch', (event) => {
    const announceTarget = event.resultingClientId || event.clientId
    announce(announceTarget, "fetch", {
        url : event.request.url
    })
    if (cacheFirst) {
        if (log)
            console.log(`try cache ${event.request.url}`)
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        announce(announceTarget, "got", {
                            url : event.request.url,
                            cache : true,
                        })
                        return response
                    }
                    if (log)
                        console.log(`failed cache ${event.request.url}, trying fetch`)
                    return fetch(event.request)
                        .then(response => caches.open(latestCache)
                            .then(cache => cache.put(event.request, response.clone())
                                .then(() => {
                                    announce(announceTarget, "got", {
                                        url : event.request.url,
                                        cache : false,
                                    })
                                    return response
                                })
                            )
                        )
                })
        )
    } else {
        if (log)
            console.log(`try fetch ${event.request.url}`)
        event.respondWith(
            caches.open(latestCache)
                .then(cache => fetch(event.request)
                    .then(response => {
                        announce(announceTarget, "got", {
                            url: event.request.url,
                            cache: false,
                        })
                        return cache.put(event.request, response.clone())
                            .then(() => response)
                    })
                    .catch(() => {
                        if (log)
                            console.log(`failed fetch ${event.request.url}, trying cache`)
                        return cache.match(event.request).then(response => {
                            announce(announceTarget, "got", {
                                url : event.request.url,
                                cache : true,
                            })
                            return response
                        })
                    })
                )
        )
    }
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== latestCache) {
                    return caches.delete(key)
                }
            }))
        })
    )
})
