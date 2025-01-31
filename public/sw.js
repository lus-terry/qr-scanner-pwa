const CACHE_NAME = "qr-scanner-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/main.js",
  "/App.css",
  "/pwa-192x192.png",
  "/pwa-512x512.png",
];


self.addEventListener("install", (event) => {
  console.log("Service Worker installed.");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cashed.");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});


self.addEventListener("activate", (event) => {
  console.log("Service Worker active.");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Deleting old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});


self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    })
  );
});


self.addEventListener("sync", (event) => {
  if (event.tag === "sync-qr-data") {
    console.log("Background sync started.");
    event.waitUntil(syncQrData());
  }
});

async function syncQrData() {
  try {
    const unsyncedData = JSON.parse(localStorage.getItem("outbox")) || [];
    if (unsyncedData.length === 0) {
      console.log("No data for sync");
      return;
    }

    for (const data of unsyncedData) {
      await fetch("http://localhost:5050/sync", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    }

    localStorage.removeItem("outbox");


    self.registration.showNotification("Sync Complete", {
      body: "Synced.",
      icon: "/pwa-192x192.png",
    });

    console.log("Background Sync done.");
  } catch (error) {
    console.error("Background Sync error:", error);
  }
}


self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.message || "Default message",
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "QR Scanner PWA", options)
  );
});
