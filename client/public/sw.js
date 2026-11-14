// Service worker de Minigames Hub: permite instalar la web como app y abrirla más rápido.
// - Navegación: primero la red (para tener siempre la última versión) y, sin conexión, la portada guardada.
// - Recursos estáticos (JS/CSS con hash, portadas, iconos, fuentes): primero la caché.
// - /api nunca se guarda: las partidas, salas y registros siempre van al servidor.
const VERSION = 'mj-v1';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(['/', '/manifest.webmanifest', '/icon-192.png'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin && url.pathname.startsWith('/api')) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((r) => {
        const copia = r.clone();
        caches.open(VERSION).then((c) => c.put('/', copia)).catch(() => {});
        return r;
      }).catch(() => caches.match('/'))
    );
    return;
  }

  const estatico = url.origin === self.location.origin
    ? /^\/(assets|covers)\/|\.(png|svg|webp|jpg|woff2?)$/.test(url.pathname)
    : /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!estatico) return;
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((r) => {
      if (r.ok || r.type === 'opaque') { const copia = r.clone(); caches.open(VERSION).then((c) => c.put(req, copia)).catch(() => {}); }
      return r;
    }))
  );
});
