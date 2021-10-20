# Cache service worker
## Description
This is simple and not too elegant solution to make your web page accessible offline after opening it 2 times online.

### Why two times?
First time page is loaded, service worker is registered, but by the time it is, page has likely already finished loading.

Second time, service worker takes control, and for every file requested by browser, it stores a copy in local cache.

Every next time, whenever file is requested, worker tries to get it from online source, and resorts to cached copy if it fails.

Note: refreshing page with `Ctrl+F5` bypasses service worker.

###Can I make it work after first load?

Well, yes, see advanced usage below, but you have to list every file to cache manually.

## Usage
Just put `service-worker.js` along with your index page (usually `index.html`) and add following right before `</body>`:
```html
    <script>
        window.navigator.serviceWorker.register("./service-worker.js", {scope : "./"})
    </script>
```
With this, basic caching mechanism explained above is set in action.

### Advanced usage

#### Caching on the first run
You can modify `service-worker.js`, adding relative links to files of your project, like this:
```js
const forceCache = [
    "./index.html",
    "./main.css",
    "./index.js",
]
```
Files listed this way will be added to cache upon service-worker registering.
You can also list files that are not requested on page's load but might be needed later.

#### Removing absolete files from cache
Just modify `cacheName` constant in `service-worker.js`:
```js
const latestCache = "v2"
```
Next time this service-worker is installed, files that were cached under old `cacheName` and were not under new one will be forgotten.

#### Switch to ty ache first
Just set `cacheFirst` constant in `service-worker.js` to `true`:
```js
const cacheFirst = true
```

#### Get info on processed requests
You can add event listener to `navigator.serviceWorker`'s `message` event.
Messages will have an object with `type` set to `fetch` or `got` and `url` to requested url. In case of `got` there will also be `cache` field that's set to `true` if file was fetched from cache.

`service-worker-loader.js` has this scenario covered in `serviceWorkerLoader`, logging loading process to element with given id.