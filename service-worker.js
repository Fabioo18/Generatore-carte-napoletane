const CACHE_NAME = "carte-napoletane-v22";

// File core, immagini, audio e offline.html
const CORE_ASSETS = [
  "/", "/index.html", "/manifest.json", "/offline.html",
  "/static/sfondo.jpg",
  "/static/Carte_Napoletane_retro.jpg"
];

const IMAGE_ASSETS = [
  "/static/01_Asso_di_denari.jpg","/static/02_Due_di_denari.jpg","/static/03_Tre_di_denari.jpg",
  "/static/04_Quattro_di_denari.jpg","/static/05_Cinque_di_denari.jpg","/static/06_Sei_di_denari.jpg",
  "/static/07_Sette_di_denari.jpg","/static/08_Otto_di_denari.jpg","/static/09_Nove_di_denari.jpg",
  "/static/10_Dieci_di_denari.jpg","/static/11_Asso_di_coppe.jpg","/static/12_Due_di_coppe.jpg",
  "/static/13_Tre_di_coppe.jpg","/static/14_Quattro_di_coppe.jpg","/static/15_Cinque_di_coppe.jpg",
  "/static/16_Sei_di_coppe.jpg","/static/17_Sette_di_coppe.jpg","/static/18_Otto_di_coppe.jpg",
  "/static/19_Nove_di_coppe.jpg","/static/20_Dieci_di_coppe.jpg","/static/21_Asso_di_spade.jpg",
  "/static/22_Due_di_spade.jpg","/static/23_Tre_di_spade.jpg","/static/24_Quattro_di_spade.jpg",
  "/static/25_Cinque_di_spade.jpg","/static/26_Sei_di_spade.jpg","/static/27_Sette_di_spade.jpg",
  "/static/28_Otto_di_spade.jpg","/static/29_Nove_di_spade.jpg","/static/30_Dieci_di_spade.jpg",
  "/static/31_Asso_di_bastoni.jpg","/static/32_Due_di_bastoni.jpg","/static/33_Tre_di_bastoni.jpg",
  "/static/34_Quattro_di_bastoni.jpg","/static/35_Cinque_di_bastoni.jpg","/static/36_Sei_di_bastoni.jpg",
  "/static/37_Sette_di_bastoni.jpg","/static/38_Otto_di_bastoni.jpg","/static/39_Nove_di_bastoni.jpg",
  "/static/40_Dieci_di_bastoni.jpg"
];

const AUDIO_ASSETS = [
  "Asso_di_denari.mp3","Due_di_denari.mp3","Tre_di_denari.mp3","Quattro_di_denari.mp3","Cinque_di_denari.mp3",
  "Sei_di_denari.mp3","Sette_di_denari.mp3","Otto_di_denari.mp3","Nove_di_denari.mp3","Dieci_di_denari.mp3",
  "Asso_di_coppe.mp3","Due_di_coppe.mp3","Tre_di_coppe.mp3","Quattro_di_coppe.mp3","Cinque_di_coppe.mp3",
  "Sei_di_coppe.mp3","Sette_di_coppe.mp3","Otto_di_coppe.mp3","Nove_di_coppe.mp3","Dieci_di_coppe.mp3",
  "Asso_di_spade.mp3","Due_di_spade.mp3","Tre_di_spade.mp3","Quattro_di_spade.mp3","Cinque_di_spade.mp3",
  "Sei_di_spade.mp3","Sette_di_spade.mp3","Otto_di_spade.mp3","Nove_di_spade.mp3","Dieci_di_spade.mp3",
  "Asso_di_bastoni.mp3","Due_di_bastoni.mp3","Tre_di_bastoni.mp3","Quattro_di_bastoni.mp3","Cinque_di_bastoni.mp3",
  "Sei_di_bastoni.mp3","Sette_di_bastoni.mp3","Otto_di_bastoni.mp3","Nove_di_bastoni.mp3","Dieci_di_bastoni.mp3"
].map(f => `/static/${f}`);

// Combina tutti gli assets
const ASSETS = [...CORE_ASSETS, ...IMAGE_ASSETS, ...AUDIO_ASSETS];

async function cacheAllFiles() {
  const cache = await caches.open(CACHE_NAME);
  for (const url of ASSETS) {
    try {
      const resp = await fetch(url, { cache: "no-cache" });
      if (!resp.ok && resp.status !== 304) throw new Error(`HTTP error ${resp.status}`);
      await cache.put(url, resp.clone());
    } catch (err) {
      console.warn("Failed to cache:", url, err);
    }
  }
}

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(cacheAllFiles());
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null))
    )
  );
  self.clients.claim();
});

// FETCH
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
        }
        throw new Error(`HTTP status ${resp.status}`);
      } catch (err) {
        console.warn("Network error, fallback:", event.request.url, err);

        // fallback offline per HTML/navigation
        if (event.request.mode === "navigate") {
          return caches.match("/offline.html");
        }
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
