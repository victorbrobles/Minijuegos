// server/lib/ajustesWeb.js
// Lo que el administrador cambia desde el panel sin tocar el código: estado de cada juego (normal, en mantenimiento u
// oculto, «Nuevo»), el Top del Creador, el anuncio de la portada, las palabras prohibidas y los jugadores bloqueados.
// Se guarda en la base de datos (tabla ajustes_web, una fila JSON por clave) y se tiene en memoria para leerlo rápido.
import db from '../db.js';

db.exec(`
  CREATE TABLE IF NOT EXISTS ajustes_web (clave TEXT PRIMARY KEY, valor TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS bloqueados (jugador TEXT PRIMARY KEY COLLATE NOCASE, motivo TEXT, fecha INTEGER NOT NULL);
`);
const leer = db.prepare('SELECT valor FROM ajustes_web WHERE clave = ?');
const escribir = db.prepare('INSERT INTO ajustes_web (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor');

const cache = new Map();
function obtener(clave, defecto) {
  if (cache.has(clave)) return cache.get(clave);
  let v = defecto;
  try { const f = leer.get(clave); if (f) v = JSON.parse(f.valor); } catch { /* nada */ }
  cache.set(clave, v);
  return v;
}
function guardar(clave, valor) { escribir.run(clave, JSON.stringify(valor)); cache.set(clave, valor); return valor; }

/* ───────── Juegos ───────── */
/** { [juego]: { estado: 'normal' | 'mantenimiento' | 'oculto', nuevo: true | false | undefined } } */
export const ajustesJuegos = () => obtener('juegos', {});
export function cambiarJuego(id, cambios) {
  const todos = { ...ajustesJuegos() };
  const a = { ...(todos[id] || {}), ...cambios };
  if (a.estado === 'normal') delete a.estado;
  if (a.nuevo === null) delete a.nuevo;
  if (Object.keys(a).length) todos[id] = a; else delete todos[id];
  return guardar('juegos', todos);
}
export const estadoJuego = (id) => ajustesJuegos()[id]?.estado || 'normal';
/** Top del Creador fijado desde el panel (lista de ids) o null para el de serie. */
export const topCreador = () => obtener('top', null);
export const cambiarTop = (lista) => guardar('top', Array.isArray(lista) && lista.length ? lista.slice(0, 15) : null);

/* ───────── Anuncio en la portada ───────── */
/** { id, texto, tipo: 'info' | 'aviso' | 'novedad', hasta } o null */
export function anuncio() {
  const a = obtener('anuncio', null);
  if (!a || (a.hasta && a.hasta < Date.now())) return null;
  return a;
}
export const cambiarAnuncio = (a) => guardar('anuncio', a ? { ...a, id: Date.now() } : null);

/* ───────── Moderación ───────── */
export const palabrasProhibidas = () => obtener('palabras', []);
export const cambiarPalabras = (lista) => guardar('palabras', [...new Set((lista || []).map((p) => normalizar(p)).filter((p) => p.length >= 2))].slice(0, 500));
export function normalizar(t) {
  return String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[4@]/g, 'a').replace(/3/g, 'e').replace(/[1!]/g, 'i').replace(/0/g, 'o').replace(/[5$]/g, 's').trim();
}
/** ¿Contiene alguna palabra prohibida? (sin tildes, mayúsculas ni trucos como 4→a; también pegada a otras letras) */
export function contieneProhibida(texto) {
  const lista = palabrasProhibidas();
  if (!lista.length || !texto) return null;
  const t = normalizar(texto); const pegado = t.replace(/[^a-z0-9ñ]/g, '');
  return lista.find((p) => t.includes(p) || pegado.includes(p.replace(/[^a-z0-9ñ]/g, ''))) || null;
}
const estaBloqueado = db.prepare('SELECT 1 FROM bloqueados WHERE jugador = ?');
export const bloqueado = (jugador) => Boolean(jugador && estaBloqueado.get(String(jugador)));
export const listaBloqueados = () => db.prepare('SELECT jugador, motivo, fecha FROM bloqueados ORDER BY fecha DESC').all();
export const bloquear = (jugador, motivo = '') => db.prepare('INSERT OR REPLACE INTO bloqueados (jugador, motivo, fecha) VALUES (?, ?, ?)').run(String(jugador).slice(0, 40), String(motivo).slice(0, 200), Date.now());
export const desbloquear = (jugador) => db.prepare('DELETE FROM bloqueados WHERE jugador = ?').run(String(jugador));

// Campos en los que la gente escribe nombres o textos que ven los demás
const CAMPOS = ['nombre', 'nick', 'jugador', 'quien', 'autor', 'texto', 'pregunta', 'titulo', 'mensaje', 'nombreGrupo'];
/**
 * Middleware para /api: en lo que se envía (POST/PUT), rechaza nombres o textos con palabras prohibidas y a los
 * jugadores bloqueados. Los reportes de fallos y los errores no se filtran (tienen que llegar siempre).
 */
export function filtroModeracion(req, res, next) {
  if (req.method !== 'POST' && req.method !== 'PUT') return next();
  if (/^\/(soporte|admin|usuarios\/(entrar|salir|latido))/.test(req.path)) return next();
  const b = req.body;
  if (!b || typeof b !== 'object') return next();
  for (const c of ['jugador', 'quien', 'autor', 'nombre']) {
    if (typeof b[c] === 'string' && b[c].includes('#') && bloqueado(b[c])) {
      return res.status(403).json({ error: 'Esta cuenta está bloqueada. Si crees que es un error, escribe al correo de contacto de la web.' });
    }
  }
  if (req.usuario && bloqueado(req.usuario.jugador)) return res.status(403).json({ error: 'Esta cuenta está bloqueada.' });
  for (const c of CAMPOS) {
    if (typeof b[c] === 'string' && contieneProhibida(b[c])) return res.status(400).json({ error: 'Ese texto contiene palabras que no están permitidas.' });
  }
  return next();
}
