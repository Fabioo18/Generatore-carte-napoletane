const CACHE_NAME = "carte-napoletane-v12";

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


// Funzione sicura per cache (ignora partial/206)
async function safeCache(cache, urls) {
  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok || response.status !== 200) {
        console.warn("❌ Skip non-200 or partial:", url, response.status);
        continue;
      }
      await cache.put(url, response.clone());
      console.log("✅ Cached:", url);
    } catch (err) {
      console.warn("❌ Error caching:", url, err);
    }
  }
}

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log("📦 Caching CORE_ASSETS...");
      await safeCache(cache, CORE_ASSETS);
      console.log("📦 Caching ASSETS...");
      await safeCache(cache, ASSETS);
    })()
  );
  self.skipWaiting();
});

// FETCH (cache-first + fallback)
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(resp => {
          if (!resp.ok) throw new Error("Network response not ok");
          return resp;
        })
        .catch(() => {
          // fallback per immagini
          if (event.request.destination === "image") {
            return caches.match("/static/Carte_Napoletane_retro.jpg");
          }
          // fallback per audio
          if (event.request.destination === "audio") {
            return new Response(new Blob([], { type: "audio/mpeg" }));
          }
          return new Response("", { status: 404 });
        });
    })
  );
});

// ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});