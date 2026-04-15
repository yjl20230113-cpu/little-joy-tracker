const CACHE_NAME = "little-joy-tracker-shell-v2";
const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];
const DEV_HOSTNAMES = new Set(["localhost", "127.0.0.1", "198.18.0.1"]);

function isLocalDevHost() {
  return DEV_HOSTNAMES.has(self.location.hostname);
}

async function putInCache(request, response, cacheKey = request) {
  if (!response || !response.ok) {
    return response;
  }

  const cache = await caches.open(CACHE_NAME);
  await cache.put(cacheKey, response.clone());
  return response;
}

async function networkFirst(request, cacheKey = request) {
  try {
    const response = await fetch(request);
    return putInCache(request, response, cacheKey);
  } catch {
    const cached = await caches.match(cacheKey);
    if (cached) {
      return cached;
    }

    throw new Error("Network request failed");
  }
}

self.addEventListener("install", (event) => {
  if (isLocalDevHost()) {
    self.skipWaiting();
    return;
  }

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  if (isLocalDevHost()) {
    event.waitUntil(
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("little-joy-tracker-shell-"))
            .map((key) => caches.delete(key)),
        ),
      ),
    );
    self.clients.claim();
    return;
  }

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (isLocalDevHost()) {
    return;
  }

  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      networkFirst(request, "/")
        .catch(async () => {
          const cached = await caches.match("/");
          return (
            cached ||
            new Response("Offline", {
              status: 503,
              statusText: "Offline",
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            })
          );
        }),
    );
    return;
  }

  if (["script", "style", "image", "font"].includes(request.destination)) {
    event.respondWith(
      networkFirst(request).catch(async () => {
        const cached = await caches.match(request);
        if (cached) {
          return cached;
        }

        return new Response("Offline", {
          status: 503,
          statusText: "Offline",
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }),
    );
  }
});
