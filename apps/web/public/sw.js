const CACHE = "eventrack-v2";
/** Ne precache que des assets statiques — jamais des pages HTML Next.js */
const PRECACHE = ["/logo-icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Ne jamais intercepter les navigations — évite ERR_FAILED avec Next.js / Netlify
  if (event.request.mode === "navigate") return;
  const accept = event.request.headers.get("accept") ?? "";
  if (accept.includes("text/html")) return;

  const isStatic =
    url.pathname.startsWith("/_next/static") ||
    /\.(png|jpg|jpeg|webp|gif|ico|svg|woff2?)$/i.test(url.pathname);

  if (!isStatic) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
