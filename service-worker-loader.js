//this assumes engine's service-worker.js is put along index.html and has
// message = true

window.registerServiceWorker = (url = "./service-worker.js", scope = "./") => {
    return navigator.serviceWorker.register(url, {scope})
}

window.serviceWorkerLoader = (div = "loader") => {
    const loaderHolder = (typeof div == "string") ? document.getElementById(div) : div

    const serviceWorkerLoaderHolder = document.createElement("div")
    loaderHolder.appendChild(serviceWorkerLoaderHolder)

    const loaders = {}

    const createLoader = (url) => {
        const loader = document.createElement("span")
        serviceWorkerLoaderHolder.appendChild(loader)
        loader.innerText = `\nFetching ${url}...`
        loaderHolder.scrollTo(0, loaderHolder.scrollHeight)
        return loader
    }

    const handler = (event) => {
        if (event.data.type === "fetch") {
            loaders[event.data.data.url] = createLoader(event.data.data.url)
        }
        if (event.data.type === "got") {
            const loader = loaders[event.data.data.url]
            if (!loader)
                return
            loader.innerText += " Done"
            if (event.data.data.cache)
                loader.innerText += " (from cache)"
            delete loaders[event.data.data.url]
        }

    }//console.log(event.data)

    navigator.serviceWorker.addEventListener("message", handler)

    window.stopServiceWorkerLoader = () => {
        navigator.serviceWorker.removeEventListener("message", handler)
        serviceWorkerLoaderHolder.remove()
        delete window.stopServiceWorkerLoader
    }
}
