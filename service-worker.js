const CACHE_NAME = "me-todo-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.webmanifest",
  "./assets/empty-image.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/maskable-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k)))
        )
      )
  );
  self.clients.claim();
});

// Cache-first cho tài nguyên tĩnh; network fallback.
// Các file CDN (Font Awesome, confetti...) sẽ được cache "runtime" sau khi tải lần đầu.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return; // chỉ cache GET

  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          const isOK = copy.ok || copy.type === "opaque";
          if (isOK)
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => {
          // Nếu offline và request là HTML -> trả index.html
          if (req.headers.get("accept")?.includes("text/html")) {
            return caches.match("./index.html");
          }
        });
    })
  );
});
