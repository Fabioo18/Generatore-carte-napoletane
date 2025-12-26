const CACHE_NAME = "carte-napoletane-v19";

// CORE assets
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/static/sfondo.jpg",
  "/static/Carte_Napoletane_retro.jpg"
];

// Immagini carte
const semi = ['denari','coppe','spade','bastoni'];
const valori = ['01_Asso','02_Due','03_Tre','04_Quattro','05_Cinque','06_Sei','07_Sette','08_Otto','09_Nove','10_Dieci'];

let ASSETS = [];

// Aggiungi immagini
semi.forEach(s => {
  valori.forEach(v => {
    ASSETS.push(`/static/${v}_di_${s}.jpg`);
  });
});

// Aggiungi audio usando i nomi reali
const audioFiles = [
  "Asso_di_denari.mp3","Due_di_denari.mp3","Tre_di_denari.mp3","Quattro_di_denari.mp3","Cinque_di_denari.mp3",
  "Sei_di_denari.mp3","Sette_di_denari.mp3","Otto_di_denari.mp3","Nove_di_denari.mp3","Dieci_di_denari.mp3",
  "Asso_di_coppe.mp3","Due_di_coppe.mp3","Tre_di_coppe.mp3","Quattro_di_coppe.mp3","Cinque_di_coppe.mp3",
  "Sei_di_coppe.mp3","Sette_di_coppe.mp3","Otto_di_coppe.mp3","Nove_di_coppe.mp3","Dieci_di_coppe.mp3",
  "Asso_di_spade.mp3","Due_di_spade.mp3","Tre_di_spade.mp3","Quattro_di_spade.mp3","Cinque_di_spade.mp3",
  "Sei_di_spade.mp3","Sette_di_spade.mp3","Otto_di_spade.mp3","Nove_di_spade.mp3","Dieci_di_spade.mp3",
  "Asso_di_bastoni.mp3","Due_di_bastoni.mp3","Tre_di_bastoni.mp3","Quattro_di_bastoni.mp3","Cinque_di_bastoni.mp3",
  "Sei_di_bastoni.mp3","Sette_di_bastoni.mp3","Otto_di_bastoni.mp3","Nove_di_bastoni.mp3","Dieci_di_bastoni.mp3"
];

audioFiles.forEach(f => ASSETS.push(`/static/${f}`));

// Combina tutto
ASSETS = [...CORE_ASSETS, ...ASSETS];

// Funzione per cache sicuro
async function cacheAllFiles() {
  const cache = await caches.open(CACHE_NAME);
  for (const url of ASSETS) {
    try {
      const resp = await fetch(url, { cache: "no-cache" }); // forza rete per evitare 304 problematici
      if (!resp.ok && resp.status !== 304) throw new Error(`HTTP error! ${resp.status}`);
      await cache.put(url, resp.clone());
      console.log("✅ Cached:", url);
    } catch (err) {
      console.warn("❌ Failed to cache:", url, err);
    }
  }
}

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(cacheAllFiles());
  self.skipWaiting();
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

// FETCH: cache-first con fallback
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(async cached => {
      if (cached) return cached;

      try {
        const resp = await fetch(event.request);
        if (resp.ok || resp.status === 304) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, resp.clone());
          return resp;
        } else {
          throw new Error("HTTP status not OK: " + resp.status);
        }
      } catch (err) {
        console.warn("Network error, fallback:", event.request.url, err);

        // fallback immagini
        if (event.request.destination === "image") {
          return caches.match("/static/Carte_Napoletane_retro.jpg");
        }
        // fallback audio
        if (event.request.destination === "audio") {
          return new Response("", { status: 404 });
        }
        // fallback generico
        return new Response("Offline", { status: 503, statusText: "Service Worker Offline" });
      }
    })
  );
});