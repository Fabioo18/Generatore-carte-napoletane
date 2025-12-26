const CORE = "core-v1";
const RUNTIME = "runtime-v1";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CORE).then(c =>
      c.addAll([
        "/",
        "/index.html",
        "/manifest.json",
        "/static/sfondo.jpg",
        "/static/Carte_Napoletane_retro.jpg"
      ])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => ![CORE,RUNTIME].includes(k) && caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if(e.request.method!=="GET") return;

  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached) return cached;
      return fetch(e.request).then(resp=>{
        if(resp.ok && (e.request.destination==="image" || e.request.destination==="audio")){
          caches.open(RUNTIME).then(c=>c.put(e.request, resp.clone()));
        }
        return resp;
      }).catch(()=>{
        if(e.request.destination==="image")
          return caches.match("/static/Carte_Napoletane_retro.jpg");
        return new Response("",{status:404});
      });
    })
  );
});
