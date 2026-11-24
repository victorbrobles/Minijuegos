// server/routes/soporte.js
// Rutas públicas del soporte de la web:
//   POST /api/soporte/reporte  { juego, ruta, mensaje, quien?, navegador? }  → un fallo o sugerencia que manda alguien
//   POST /api/soporte/error    { mensaje, pila?, juego?, ruta?, navegador? }  → error de JavaScript capturado solo
//   GET  /api/soporte/portada  → anuncio activo, Top del Creador fijado y juegos en mantenimiento (para la portada)
// El panel de administración (routes/adminPanel.js) lee y gestiona todo esto.
import express from 'express';
import db from '../db.js';
import { anuncio, topCreador, ajustesJuegos } from '../lib/ajustesWeb.js';

db.exec(`
  CREATE TABLE IF NOT EXISTS reportes (id INTEGER PRIMARY KEY AUTOINCREMENT, fecha INTEGER NOT NULL, juego TEXT, ruta TEXT,
    quien TEXT, mensaje TEXT NOT NULL, navegador TEXT, tipo TEXT NOT NULL DEFAULT 'fallo', estado TEXT NOT NULL DEFAULT 'nuevo');
  CREATE TABLE IF NOT EXISTS errores_web (firma TEXT PRIMARY KEY, mensaje TEXT NOT NULL, pila TEXT, juego TEXT, ruta TEXT,
    navegador TEXT, veces INTEGER NOT NULL DEFAULT 1, primera INTEGER NOT NULL, ultima INTEGER NOT NULL);
`);

const router = express.Router();
const corto = (v, n, saltos = false) => String(v ?? '').replace(saltos ? /[\u0000-\u0009\u000b-\u001f\u007f]/g : /[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);

// Límite propio, además del general: como mucho 10 reportes y 40 errores por IP cada hora
const cuenta = new Map();
function demasiados(req, clave, max) {
  const k = `${clave}:${req.ip}`; const ahora = Date.now();
  const l = (cuenta.get(k) || []).filter((t) => ahora - t < 3600_000);
  if (l.length >= max) return true;
  l.push(ahora); cuenta.set(k, l); return false;
}
setInterval(() => { const ahora = Date.now(); for (const [k, l] of cuenta) if (!l.some((t) => ahora - t < 3600_000)) cuenta.delete(k); }, 3600_000).unref();

const insReporte = db.prepare('INSERT INTO reportes (fecha, juego, ruta, quien, mensaje, navegador, tipo) VALUES (?, ?, ?, ?, ?, ?, ?)');
router.post('/reporte', (req, res) => {
  if (demasiados(req, 'rep', 10)) return res.status(429).json({ error: 'Ya has enviado muchos avisos. Gracias, prueba más tarde.' });
  const mensaje = corto(req.body?.mensaje, 1500, true);
  if (mensaje.length < 5) return res.status(400).json({ error: 'Cuéntanos un poco más qué ha pasado.' });
  const tipo = ['fallo', 'sugerencia', 'contenido'].includes(req.body?.tipo) ? req.body.tipo : 'fallo';
  insReporte.run(Date.now(), corto(req.body?.juego, 40), corto(req.body?.ruta, 200), corto(req.body?.quien || req.usuario?.jugador, 40), mensaje, corto(req.body?.navegador || req.get('user-agent'), 300), tipo);
  res.json({ success: true });
});

const insError = db.prepare(`INSERT INTO errores_web (firma, mensaje, pila, juego, ruta, navegador, veces, primera, ultima) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
  ON CONFLICT(firma) DO UPDATE SET veces = veces + 1, ultima = excluded.ultima, ruta = excluded.ruta, navegador = excluded.navegador`);
const totalErrores = db.prepare('SELECT COUNT(*) AS n FROM errores_web');
router.post('/error', (req, res) => {
  if (demasiados(req, 'err', 40)) return res.json({ success: true }); // en silencio: no hace falta avisar a nadie
  const mensaje = corto(req.body?.mensaje, 500);
  if (!mensaje) return res.json({ success: true });
  const pila = corto(req.body?.pila, 3000, true);
  const juego = corto(req.body?.juego, 40);
  // Mismo error en el mismo juego = una fila con su contador (sin números de línea, que cambian en cada versión)
  const firma = `${juego}|${mensaje}|${(pila.split('\n')[1] || '').replace(/:\d+:\d+/g, '').replace(/-[A-Za-z0-9_]{8}\.js/g, '.js').trim()}`.slice(0, 600);
  if (totalErrores.get().n > 2000) db.prepare('DELETE FROM errores_web WHERE firma IN (SELECT firma FROM errores_web ORDER BY ultima LIMIT 200)').run();
  const ahora = Date.now();
  insError.run(firma, mensaje, pila, juego, corto(req.body?.ruta, 200), corto(req.body?.navegador || req.get('user-agent'), 300), ahora, ahora);
  res.json({ success: true });
});

router.get('/portada', (req, res) => {
  const juegos = ajustesJuegos();
  res.set('Cache-Control', 'no-cache');
  res.json({
    success: true,
    anuncio: anuncio(),
    top: topCreador(),
    mantenimiento: Object.entries(juegos).filter(([, a]) => a.estado === 'mantenimiento').map(([id]) => id),
    nuevos: Object.entries(juegos).filter(([, a]) => typeof a.nuevo === 'boolean').map(([id, a]) => [id, a.nuevo])
  });
});

export default router;
