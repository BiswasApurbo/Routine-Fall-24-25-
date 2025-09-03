// service-worker.js
const CACHE_NAME = "routine-app-v2"; // bump to v4, v5... when you release updates

const ASSETS = [
  "/Routine-Fall-24-25-/",              // root route (GitHub Pages base path)
  "/Routine-Fall-24-25-/index.html",
  "/Routine-Fall-24-25-/Routine.css",
  "/Routine-Fall-24-25-/manifest.webmanifest",
  "/Routine-Fall-24-25-/icons/icon-512.png",
  // Schedules (cache for offline viewing)
  "/Routine-Fall-24-25-/schedule-fall-24-25.json",
  "/Routine-Fall-24-25-/schedule-summer-24-25.json"
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
    caches.match(req).then((res) =>
      res ||
      fetch(req).then((live) => {
        const copy = live.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return live;
      })
    )
  );
});

// Allow page to trigger immediate activation
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

// Focus the app when user clicks a reminder
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) {
        return clients.openWindow('/Routine-Fall-24-25-/'); // keep base path
      }
    })
  );
});
