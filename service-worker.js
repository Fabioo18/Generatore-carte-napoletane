const CACHE_NAME = "carte-napoletane-v18";

// Solo immagini seguono lo schema valori + semi
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

// Aggiungi CORE_ASSETS
const CORE_ASSETS = ["/","/index.html","/static/sfondo.jpg","/static/Carte_Napoletane_retro.jpg"];
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
