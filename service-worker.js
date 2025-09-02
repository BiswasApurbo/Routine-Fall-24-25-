// service-worker.js
const CACHE_NAME = "routine-app-v1"; // bump to v2, v3 when you release updates

const ASSETS = [
  "/Routine-Fall-24-25-/",              // root route
  "/Routine-Fall-24-25-/index.html",
  "/Routine-Fall-24-25-/Routine.css",
  "/Routine-Fall-24-25-/manifest.webmanifest",
  "/Routine-Fall-24-25-/icons/icon-512.png"
];

// Install: cache core files
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// Network-first for HTML; cache-first for others
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const wantsHTML = req.headers.get("accept")?.includes("text/html");

  if (wantsHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then((res) => res || caches.match("/Routine-Fall-24-25-/index.html"))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((res) => {
      return (
        res ||
        fetch(req).then((live) => {
          const copy = live.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return live;
        })
      );
    })
  );
});

// Allow page to trigger immediate activation
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
