const CACHE_NAME = "carte-napoletane-v10";

/* asset fondamentali */
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/static/sfondo.jpg",
  "/static/Carte_Napoletane_retro.jpg"
];

/* immagini + audio */
const ASSETS = [
  // IMMAGINI
  "/static/01_Asso_di_denari.jpg",
  "/static/02_Due_di_denari.jpg",
  "/static/03_Tre_di_denari.jpg",
  "/static/04_Quattro_di_denari.jpg",
  "/static/05_Cinque_di_denari.jpg",
  "/static/06_Sei_di_denari.jpg",
  "/static/07_Sette_di_denari.jpg",
  "/static/08_Otto_di_denari.jpg",
  "/static/09_Nove_di_denari.jpg",
  "/static/10_Dieci_di_denari.jpg",
  "/static/11_Asso_di_coppe.jpg",
  "/static/12_Due_di_coppe.jpg",
  "/static/13_Tre_di_coppe.jpg",
  "/static/14_Quattro_di_coppe.jpg",
  "/static/15_Cinque_di_coppe.jpg",
  "/static/16_Sei_di_coppe.jpg",
  "/static/17_Sette_di_coppe.jpg",
  "/static/18_Otto_di_coppe.jpg",
  "/static/19_Nove_di_coppe.jpg",
  "/static/20_Dieci_di_coppe.jpg",
  "/static/21_Asso_di_spade.jpg",
  "/static/22_Due_di_spade.jpg",
  "/static/23_Tre_di_spade.jpg",
  "/static/24_Quattro_di_spade.jpg",
  "/static/25_Cinque_di_spade.jpg",
  "/static/26_Sei_di_spade.jpg",
  "/static/27_Sette_di_spade.jpg",
  "/static/28_Otto_di_spade.jpg",
  "/static/29_Nove_di_spade.jpg",
  "/static/30_Dieci_di_spade.jpg",
  "/static/31_Asso_di_bastoni.jpg",
  "/static/32_Due_di_bastoni.jpg",
  "/static/33_Tre_di_bastoni.jpg",
  "/static/34_Quattro_di_bastoni.jpg",
  "/static/35_Cinque_di_bastoni.jpg",
  "/static/36_Sei_di_bastoni.jpg",
  "/static/37_Sette_di_bastoni.jpg",
  "/static/38_Otto_di_bastoni.jpg",
  "/static/39_Nove_di_bastoni.jpg",
  "/static/40_Dieci_di_bastoni.jpg",

  // AUDIO
  "/static/Asso_di_denari.mp3",
  "/static/Due_di_denari.mp3",
  "/static/Tre_di_denari.mp3",
  "/static/Quattro_di_denari.mp3",
  "/static/Cinque_di_denari.mp3",
  "/static/Sei_di_denari.mp3",
  "/static/Sette_di_denari.mp3",
  "/static/Otto_di_denari.mp3",
  "/static/Nove_di_denari.mp3",
  "/static/Dieci_di_denari.mp3",
  "/static/Asso_di_coppe.mp3",
  "/static/Due_di_coppe.mp3",
  "/static/Tre_di_coppe.mp3",
  "/static/Quattro_di_coppe.mp3",
  "/static/Cinque_di_coppe.mp3",
  "/static/Sei_di_coppe.mp3",
  "/static/Sette_di_coppe.mp3",
  "/static/Otto_di_coppe.mp3",
  "/static/Nove_di_coppe.mp3",
  "/static/Dieci_di_coppe.mp3",
  "/static/Asso_di_spade.mp3",
  "/static/Due_di_spade.mp3",
  "/static/Tre_di_spade.mp3",
  "/static/Quattro_di_spade.mp3",
  "/static/Cinque_di_spade.mp3",
  "/static/Sei_di_spade.mp3",
  "/static/Sette_di_spade.mp3",
  "/static/Otto_di_spade.mp3",
  "/static/Nove_di_spade.mp3",
  "/static/Dieci_di_spade.mp3",
  "/static/Asso_di_bastoni.mp3",
  "/static/Due_di_bastoni.mp3",
  "/static/Tre_di_bastoni.mp3",
  "/static/Quattro_di_bastoni.mp3",
  "/static/Cinque_di_bastoni.mp3",
  "/static/Sei_di_bastoni.mp3",
  "/static/Sette_di_bastoni.mp3",
  "/static/Otto_di_bastoni.mp3",
  "/static/Nove_di_bastoni.mp3",
  "/static/Dieci_di_bastoni.mp3"
];

/* cache sicura */
async function safeCache(cache, urls) {
  for (const url of urls) {
    try {
      await cache.add(url);
      console.log("✅ Cache:", url);
    } catch {
      console.warn("❌ Skip:", url);
    }
  }
}

/* INSTALL */
self.addEventListener("install", event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await safeCache(cache, CORE_ASSETS);
      await safeCache(cache, ASSETS);
    })()
  );
  self.skipWaiting();
});

/* FETCH – OFFLINE SAFE */
self.addEventListener("fetch", event => {
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      if (!self.navigator.onLine) {
        return new Response("", { status: 404 });
      }

      try {
        return await fetch(event.request);
      } catch {
        return new Response("", { status: 404 });
      }
    })()
  );
});

/* ACTIVATE */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});
