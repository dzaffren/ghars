const CACHE_NAME = "ghars-v1";
const STATIC_ASSETS = ["/", "/today", "/history", "/manifest.webmanifest"];

// Install: cache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for audio CDN, network-first for everything else
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Cache audio from QF CDN
  if (
    url.hostname === "verses.quran.foundation" ||
    url.hostname === "download.quranicaudio.com"
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const response = await fetch(event.request);
        cache.put(event.request, response.clone());
        return response;
      })
    );
    return;
  }

  // Network-first for API routes
  if (url.pathname.startsWith("/api/")) {
    return; // Let the browser handle normally
  }
});

// Push notifications
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? "Ghars";
  const body = data.body ?? "Your daily mission awaits.";
  const url = data.url ?? "/today";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: "ghars-daily",
      renotify: true,
      data: { url },
    })
  );
});

// Notification click → open app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/today";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => c.url.includes(url));
        if (existing) return existing.focus();
        return self.clients.openWindow(url);
      })
  );
});
