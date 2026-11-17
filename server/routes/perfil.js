// server/routes/perfil.js
// Perfil de cada jugador (Nombre#1234): avatar (dibujado con piezas, o un emoji en los perfiles antiguos) y color. Lo ven los demás en podios y en su página de perfil.
//   GET  /api/perfil?nombres=Ana#1234,Pablo#5678   → { perfiles: { 'Ana#1234': { avatar, color } } }
//   POST /api/perfil { jugador, avatar, color }
import express from 'express';
import db from '../db.js';
import { leerAvatar, textoAvatar, esAvatarAuto, COLORES_FONDO } from '../../client/src/lib/avatarPartes.js';

export const AVATARES = ['😎', '🤓', '🥳', '😺', '🐶', '🦊', '🐼', '🐸', '🐵', '🦁', '🐯', '🐧', '🦄', '🐙', '🦖', '🐲', '👽', '🤖', '👻', '🎃',
  '🧙', '🥷', '🦸', '🧛', '🧑‍🚀', '🧑‍🍳', '⚽', '🏀', '🎸', '🎮', '🎲', '🃏', '♟️', '🚀', '🌵', '🍕', '🍩', '🌈', '🔥', '⭐'];
export const COLORES = COLORES_FONDO;

db.exec(`CREATE TABLE IF NOT EXISTS perfiles (jugador TEXT PRIMARY KEY, avatar TEXT NOT NULL, color TEXT NOT NULL, actualizado INTEGER NOT NULL)`);
const leer = db.prepare('SELECT avatar, color FROM perfiles WHERE jugador = ?');
const guardar = db.prepare(`INSERT INTO perfiles (jugador, avatar, color, actualizado) VALUES (?, ?, ?, ?)
  ON CONFLICT(jugador) DO UPDATE SET avatar = excluded.avatar, color = excluded.color, actualizado = excluded.actualizado`);
const valido = (j) => /^.{1,15}#\d{4}$/.test(j);

const router = express.Router();
router.get('/', (req, res) => {
  const nombres = String(req.query.nombres || '').split(',').map((x) => x.trim()).filter(valido).slice(0, 60);
  const perfiles = {};
  nombres.forEach((n) => { const p = leer.get(n); if (p) perfiles[n] = p; });
  res.json({ success: true, perfiles, avatares: AVATARES, colores: COLORES });
});
router.post('/', (req, res) => {
  const { jugador, avatar, color } = req.body || {};
  if (!valido(String(jugador || ''))) return res.status(400).json({ error: 'Jugador no válido.' });
  const dibujo = leerAvatar(avatar); // avatar dibujado (JSON con sus piezas) o, como antes, un emoji
  if ((!dibujo && !AVATARES.includes(avatar)) || !COLORES.includes(color)) return res.status(400).json({ error: 'Avatar o color no válido.' });
  guardar.run(jugador, dibujo ? textoAvatar(dibujo, { auto: esAvatarAuto(avatar) }) : avatar, color, Date.now());
  res.json({ success: true });
});

/* ───────── Copia del perfil para pasarlo a otro móvil ─────────
   POST /api/perfil/copia { datos, codigo?, clave? } → { codigo, clave }   (con codigo+clave, actualiza la misma copia)
   GET  /api/perfil/copia/:codigo                     → { datos, fecha }
   El código (6 letras) es lo que se teclea en el otro móvil; la clave solo la guarda el móvil que creó la copia. */
db.exec(`CREATE TABLE IF NOT EXISTS copias_perfil (codigo TEXT PRIMARY KEY, clave TEXT NOT NULL, datos TEXT NOT NULL, fecha INTEGER NOT NULL)`);
const LETRAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const nuevoCodigo = () => Array.from({ length: 6 }, () => LETRAS[Math.floor(Math.random() * LETRAS.length)]).join('');
const nuevaClave = () => Array.from({ length: 24 }, () => LETRAS[Math.floor(Math.random() * LETRAS.length)]).join('');
const copia = db.prepare('SELECT clave, datos, fecha FROM copias_perfil WHERE codigo = ?');
const intentos = new Map(); // ip → [marcas de tiempo] (frena a quien prueba códigos al azar)
const demasiados = (ip) => {
  const ahora = Date.now();
  const l = (intentos.get(ip) || []).filter((t) => ahora - t < 10 * 60 * 1000);
  l.push(ahora); intentos.set(ip, l);
  return l.length > 30;
};

router.post('/copia', (req, res) => {
  const datos = req.body?.datos;
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) return res.status(400).json({ error: 'No hay datos que guardar.' });
  const limpio = {};
  Object.entries(datos).forEach(([k, v]) => { if (/^[\w.:-]{1,60}$/.test(k) && typeof v === 'string') limpio[k] = v; });
  const texto = JSON.stringify(limpio);
  if (texto.length > 900000) return res.status(413).json({ error: 'Hay demasiados datos para copiar.' });
  let { codigo, clave } = req.body || {};
  codigo = String(codigo || '').toUpperCase();
  const previa = codigo ? copia.get(codigo) : null;
  if (!previa || previa.clave !== clave) {
    do { codigo = nuevoCodigo(); } while (copia.get(codigo));
    clave = nuevaClave();
  }
  db.prepare(`INSERT INTO copias_perfil (codigo, clave, datos, fecha) VALUES (?, ?, ?, ?)
    ON CONFLICT(codigo) DO UPDATE SET datos = excluded.datos, fecha = excluded.fecha`).run(codigo, clave, texto, Date.now());
  res.json({ success: true, codigo, clave });
});

router.get('/copia/:codigo', (req, res) => {
  if (demasiados(req.ip)) return res.status(429).json({ error: 'Demasiados intentos. Espera unos minutos.' });
  const c = copia.get(String(req.params.codigo || '').toUpperCase().replace(/[^A-Z0-9]/g, ''));
  if (!c) return res.status(404).json({ error: 'No hay ninguna copia con ese código.' });
  res.json({ success: true, datos: JSON.parse(c.datos), fecha: c.fecha });
});

export default router;
