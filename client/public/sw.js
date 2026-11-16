// Service worker de Al juego, juego: permite instalar la web como app, abrirla más rápido y jugar sin conexión.
// - Navegación: primero la red (para tener siempre la última versión) y, sin conexión, la portada guardada.
// - Recursos estáticos (JS/CSS con huella, portadas, iconos, fuentes): primero la caché.
// - API de contenido (preguntas, palabras… de los juegos de un móvil): primero la red y, sin conexión, la última
//   respuesta guardada. Lo que es en directo (salas, grupos, récords, retos) nunca se guarda.
const VERSION = 'mj-v2';
const API = 'mj-api-v1';
const MAX_API = 200;
// Lo que nunca se sirve de la caché: salas online, social, registros, retos, administración, retos diarios.
// (La lista de juegos, /api/games, sí: así la portada funciona sin conexión.)
const EN_DIRECTO = /\/(online|sala|salas|social|registros|reto|retos|diario|admin|copia|metricas)(\/|$)|\/api\/(grupos|social)/;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(['/', '/manifest.webmanifest', '/icon-192.png'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION && k !== API).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

async function recortar() {
  const c = await caches.open(API);
  const ks = await c.keys();
  if (ks.length > MAX_API) await Promise.all(ks.slice(0, ks.length - MAX_API).map((k) => c.delete(k)));
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const propio = url.origin === self.location.origin;

  if (propio && url.pathname.startsWith('/api')) {
    if (EN_DIRECTO.test(url.pathname)) return;
    e.respondWith(
      fetch(req).then((r) => {
        if (r.ok) { const copia = r.clone(); caches.open(API).then((c) => c.put(req, copia)).then(recortar).catch(() => {}); }
        return r;
      }).catch(() => caches.open(API).then((c) => c.match(req, { ignoreSearch: false })).then((hit) => hit || Response.error()))
    );
    return;
  }

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

  const estatico = propio
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
