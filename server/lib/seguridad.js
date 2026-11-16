// server/lib/seguridad.js
// Protecciones generales del servidor: cabeceras de seguridad y límite de peticiones por IP.

// Cabeceras de seguridad (lo mismo que haría «helmet», a medida de esta web):
//  - CSP: solo se ejecuta JavaScript de la propia web; imágenes, audio y mapas pueden venir de fuera (Wikimedia,
//    Deezer, mapas). Las fuentes son de la propia web. Conexiones: la propia web y Wikipedia (Test del viajero).
//  - Nadie puede meter la web dentro de otra página (clickjacking), ni el navegador «adivina» tipos de archivo.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "connect-src 'self' https: wss:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'"
].join('; ');

export function cabecerasSeguridad(req, res, next) {
  res.set({
    'Content-Security-Policy': CSP,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    'Cross-Origin-Opener-Policy': 'same-origin'
  });
  // Mientras la web no esté terminada, los buscadores no la indexan. Para publicarla: PERMITIR_BUSCADORES=1 (y
  // quitar la etiqueta «robots» de client/index.html).
  if (!process.env.PERMITIR_BUSCADORES) res.set('X-Robots-Tag', 'noindex, nofollow');
  // En HTTPS (Render), el navegador recordará usar siempre HTTPS
  if (req.secure) res.set('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  next();
}

/**
 * Límite de peticiones por IP en una ventana deslizante (en memoria; basta para un solo servidor).
 * `clave` separa contadores (p. ej. 'api' y 'crear'). Responde 429 al pasarse.
 */
export function limitePeticiones({ clave, maximo, ventanaMs = 60_000, mensaje = 'Demasiadas peticiones. Espera un momento.' }) {
  const marcas = new Map(); // ip → [instantes]
  // Limpieza periódica para que el mapa no crezca sin límite
  setInterval(() => {
    const limite = Date.now() - ventanaMs;
    for (const [ip, l] of marcas) { const v = l.filter((t) => t > limite); if (v.length) marcas.set(ip, v); else marcas.delete(ip); }
  }, ventanaMs).unref();
  return (req, res, next) => {
    const ahora = Date.now();
    const ip = `${clave}:${req.ip}`;
    const l = (marcas.get(ip) || []).filter((t) => ahora - t < ventanaMs);
    if (l.length >= maximo) {
      res.set('Retry-After', String(Math.ceil(ventanaMs / 1000)));
      return res.status(429).json({ error: mensaje });
    }
    l.push(ahora);
    marcas.set(ip, l);
    next();
  };
}

// Peticiones que crean o guardan algo (salas, grupos, votos, resultados, copias…): más estrictas
export const ES_ESCRITURA = (req) => req.method !== 'GET' && (
  /\/(crear|create)(\/|$)/.test(req.path) ||
  /^\/(registros|valoraciones|metricas|perfil|reto|solo)(\/|$)/.test(req.path) ||
  /^\/social\/grupos(\/[A-Z0-9]+\/(preguntas|noches|unirse))?\/?$/i.test(req.path)
);
