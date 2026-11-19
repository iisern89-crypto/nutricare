const CACHE_NAME = "nutricare-offline-v4";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./foto-agent.html",
  "./css/styles.css",
  "./js/data.js",
  "./js/app.js",
  "./manifest.json",
  "./manifest-agent.json",
  "./favicon.svg",
  "./favicon.png",
  "./apple-touch-icon.png",
  "./icon-192.png",
  "./icon-512.png"
];

// Instal·lació: descarrega i guarda tots els fitxers de l'App a la memòria del mòbil
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activació: neteja versions antigues de la memòria cau
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Intercepció de peticions:
// - Si hi ha internet ràpid, actualitza la memòria cau amb l'última versió i la retorna.
// - Si no hi ha cobertura / Mode Avió (o triga més de 2.5s), carrega a l'instant des de la memòria interna del mòbil.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    new Promise((resolve) => {
      let settled = false;

      // Temporitzador de seguretat per a cobertura hospitalària feble (2.5 segons)
      const timeoutId = setTimeout(() => {
        if (settled) return;
        caches.match(event.request, { ignoreSearch: true }).then((cached) => {
          if (cached && !settled) {
            settled = true;
            resolve(cached);
          }
        });
      }, 2500);

      fetch(event.request)
        .then((networkResponse) => {
          clearTimeout(timeoutId);
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          if (!settled) {
            settled = true;
            resolve(networkResponse);
          }
        })
        .catch(() => {
          clearTimeout(timeoutId);
          if (settled) return;
          caches
            .match(event.request, { ignoreSearch: true })
            .then((cached) => {
              settled = true;
              if (cached) {
                resolve(cached);
              } else {
                resolve(caches.match("./index.html"));
              }
            });
        });
    })
  );
});
