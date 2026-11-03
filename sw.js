const CACHE = "shuowang-v7";
const ASSETS = [
  "./",
  "./index.html",
  "./css/app.css",
  "./js/model.js",
  "./js/app.js",
  "./vendor/lunar.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (key) {
        return key !== CACHE;
      }).map(function (key) {
        return caches.delete(key);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(request).then(function (cached) {
        const network = fetch(request).then(function (response) {
          if (response && response.ok) cache.put(request, response.clone());
          return response;
        }).catch(function () {
          return cached;
        });
        if (cached) return cached;
        return network.then(function (response) {
          if (response) return response;
          if (request.mode === "navigate") return cache.match("./index.html");
          return response;
        });
      });
    })
  );
});
