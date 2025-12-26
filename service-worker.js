const CACHE_NAME = "carte-napoletane-v17";

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/static/sfondo.jpg",
  "/static/Carte_Napoletane_retro.jpg"
];

// Genera automaticamente tutte le immagini e audio
const semi = ['denari','coppe','spade','bastoni'];
const valori = ['01_Asso','02_Due','03_Tre','04_Quattro','05_Cinque','06_Sei','07_Sette','08_Otto','09_Nove','10_Dieci'];

let ASSETS = [];

semi.forEach(s => {
  valori.forEach(v => {
    ASSETS.push(`/static/${v}_di_${s}.jpg`);
    ASSETS.push(`/static/${v}_di_${s}.mp3`);
  });
});

// Aggiunge i CORE_ASSETS
ASSETS = [...CORE_ASSETS, ...ASSETS];

// Funzione per cache-are tutti i file uno alla volta
async function cacheAllFiles() {
  const cache = await caches.open(CACHE_NAME);
  for (const url of ASSETS) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
      await cache.put(url, response.clone());
      console.log("✅ Cached:", url);
    } catch (err) {
      console.error("❌ Failed to cache:", url, err);
    }
  }
}

// INSTALL: cache iniziale sicura
self.addEventListener("install", event => {
  event.waitUntil(cacheAllFiles());
  self.skipWaiting();
});

// FETCH: cache-first + fallback
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(async cached => {
      if (cached) return cached;
      try {
        const resp = await fetch(event.request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, resp.clone());
        return resp;
      } catch {
        if (event.request.destination === "image") {
          return caches.match("/static/Carte_Napoletane_retro.jpg");
        }
        if (event.request.destination === "audio") {
          return new Response("", { status: 404 });
        }
        return new Response("", { status: 404 });
      }
    })
  );
});

// ACTIVATE: rimuove vecchie cache
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null))
    )
  );
  self.clients.claim();
});
