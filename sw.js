// ATHLON : hors ligne. La page est toujours relue sur le réseau quand il y en a (mises à jour), sinon elle vient du cache.
const CACHE = "fonte-1.1.0";
const SHELL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put("./index.html", cp)); return res; })
      .catch(() => caches.match("./index.html").then(h => h || caches.match("./"))));
    return;
  }
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => {
    if (res.ok || res.type === "opaque") { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
    return res;
  })));
});
