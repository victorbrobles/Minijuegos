// server/routes/registros.js
// Registros de partidas para el «salón de la fama» de cada juego (SQLite, el mismo fichero que el resto: db.js).
//   POST /api/registros                 { juego, orden: 'desc'|'asc', jugadores: [{ nombre, puntos, gana }] }
//   GET  /api/registros/salon/:juego    top 3 histórico + podios de los últimos 30 días (partidas y victorias)
//   GET  /api/registros/mes             podios de la portada: más partidas y más victorias del mes actual
//   GET  /api/registros/recientes       los 10 últimos jugadores (de cualquier juego)
// En las salas online cada móvil envía el mismo resultado: se guarda una sola vez (misma partida = mismo juego,
// mismos jugadores y mismos puntos en los últimos 30 minutos).
import express from 'express';
import { readFileSync } from 'node:fs';
import db from '../db.js';
import { conVictorias } from '../../client/src/games/limites.js';

db.exec(`
  CREATE TABLE IF NOT EXISTS registros_partidas (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    juego  TEXT NOT NULL,
    clave  TEXT NOT NULL,
    orden  TEXT NOT NULL DEFAULT 'desc',
    fecha  INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_reg_partidas_clave ON registros_partidas (clave, fecha);
  CREATE TABLE IF NOT EXISTS registros_resultados (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    partida  INTEGER NOT NULL REFERENCES registros_partidas(id) ON DELETE CASCADE,
    juego    TEXT NOT NULL,
    jugador  TEXT NOT NULL,
    puntos   REAL,
    gana     INTEGER NOT NULL DEFAULT 0,
    fecha    INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_reg_res_juego ON registros_resultados (juego, fecha);
  CREATE INDEX IF NOT EXISTS idx_reg_res_fecha ON registros_resultados (fecha);
`);

const JUEGOS = new Set(JSON.parse(readFileSync(new URL('../data/games.json', import.meta.url), 'utf8')).map((g) => g.id));
const DIA = 24 * 60 * 60 * 1000;
const VENTANA_DUPLICADO = 30 * 60 * 1000;
const limpiarNombre = (n) => String(n ?? '').replace(/\s+/g, ' ').trim().slice(0, 24);

const buscarDuplicada = db.prepare('SELECT id FROM registros_partidas WHERE clave = ? AND fecha > ? LIMIT 1');
const insertarPartida = db.prepare('INSERT INTO registros_partidas (juego, clave, orden, fecha) VALUES (?, ?, ?, ?)');
const completarEtiqueta = db.prepare('UPDATE registros_resultados SET jugador = ? WHERE partida = ? AND jugador = ?');
const insertarResultado = db.prepare('INSERT INTO registros_resultados (partida, juego, jugador, puntos, gana, fecha) VALUES (?, ?, ?, ?, ?, ?)');

/** Guarda una partida (si no estaba ya). Devuelve { guardada: bool }. Exportada para las pruebas. */
export function guardarPartida({ juego, orden, jugadores }, ahora = Date.now()) {
  if (!JUEGOS.has(juego)) return { error: 'Juego desconocido.' };
  const lista = (Array.isArray(jugadores) ? jugadores : [])
    .map((j) => ({ nombre: limpiarNombre(j?.nombre), puntos: Number.isFinite(Number(j?.puntos)) && j?.puntos !== null && j?.puntos !== '' ? Number(j.puntos) : null, gana: j?.gana ? 1 : 0 }))
    .filter((j) => j.nombre)
    .slice(0, 30);
  if (!lista.length) return { error: 'Sin jugadores.' };
  // La clave usa los nombres SIN etiqueta: en una sala online cada móvil solo conoce la suya y manda
  // «Ana#1234» y «Luis»; el de Luis manda «Ana» y «Luis#5678». Es la misma partida: se guarda una vez y
  // se completan las etiquetas que falten.
  const plano = (n) => n.replace(/#\d{4}$/, '');
  const clave = `${juego}|${[...lista].sort((a, b) => plano(a.nombre).localeCompare(plano(b.nombre))).map((j) => `${plano(j.nombre).toLowerCase()}:${j.puntos}:${j.gana}`).join(',')}`;
  const previa = buscarDuplicada.get(clave, ahora - VENTANA_DUPLICADO);
  if (previa) {
    lista.filter((j) => /#\d{4}$/.test(j.nombre)).forEach((j) => completarEtiqueta.run(j.nombre, previa.id, plano(j.nombre)));
    return { guardada: false };
  }
  db.transaction(() => {
    const { lastInsertRowid: id } = insertarPartida.run(juego, clave, orden === 'asc' ? 'asc' : 'desc', ahora);
    lista.forEach((j) => insertarResultado.run(id, juego, j.nombre, j.puntos, j.gana, ahora));
  })();
  return { guardada: true };
}

const topDesc = db.prepare('SELECT jugador, puntos, fecha FROM registros_resultados WHERE juego = ? AND puntos IS NOT NULL AND puntos > 0 ORDER BY puntos DESC, fecha ASC LIMIT 3');
const topAsc = db.prepare('SELECT jugador, puntos, fecha FROM registros_resultados WHERE juego = ? AND puntos IS NOT NULL ORDER BY puntos ASC, fecha ASC LIMIT 3');
const ordenJuego = db.prepare('SELECT orden FROM registros_partidas WHERE juego = ? ORDER BY fecha DESC LIMIT 1');
const masPartidas = db.prepare(`SELECT jugador, COUNT(*) AS n, MAX(fecha) AS ultima FROM registros_resultados
  WHERE juego = ? AND fecha > ? GROUP BY jugador ORDER BY n DESC, ultima DESC LIMIT 3`);
const masVictorias = db.prepare(`SELECT jugador, SUM(gana) AS n, MAX(fecha) AS ultima FROM registros_resultados
  WHERE juego = ? AND fecha > ? GROUP BY jugador HAVING SUM(gana) > 0 ORDER BY n DESC, ultima DESC LIMIT 3`);
const recientes = db.prepare('SELECT jugador, MAX(fecha) AS ultima FROM registros_resultados GROUP BY jugador ORDER BY ultima DESC LIMIT 10');

export function salon(juego, ahora = Date.now()) {
  const orden = ordenJuego.get(juego)?.orden || 'desc';
  const desde = ahora - 30 * DIA;
  return {
    orden,
    top: (orden === 'asc' ? topAsc : topDesc).all(juego),
    partidas: masPartidas.all(juego, desde),
    victorias: masVictorias.all(juego, desde)
  };
}

/** Instante (ms) en que empezó el mes actual en España. */
export function inicioMes(ahora = Date.now()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', year: 'numeric', month: 'numeric', hour: 'numeric', hourCycle: 'h23' })
    .formatToParts(new Date(ahora)).map((x) => [x.type, Number(x.value)]));
  const utc = Date.UTC(p.year, p.month - 1, 1);
  const h = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', hour: 'numeric', hourCycle: 'h23' }).format(new Date(utc)));
  return utc - h * 3600000; // a las 00:00 UTC en Madrid son la 1 o las 2
}
const juegosConVictorias = () => [...JUEGOS].filter(conVictorias);
const masPartidasMes = db.prepare(`SELECT jugador, COUNT(*) AS n, MAX(fecha) AS ultima FROM registros_resultados
  WHERE fecha >= ? GROUP BY jugador ORDER BY n DESC, ultima DESC LIMIT 3`);
const victoriasMes = db.prepare(`SELECT r.jugador, r.juego, MAX(r.fecha) AS ultima, SUM(r.gana) AS n FROM registros_resultados r
  WHERE r.fecha >= ? AND r.gana = 1 AND (SELECT COUNT(*) FROM registros_resultados o WHERE o.partida = r.partida) > 1
  GROUP BY r.jugador, r.juego`);

/** Podios de la portada: más partidas y más victorias (en partidas de 2+ jugadores con ganador claro) del mes. */
export function podiosMes(ahora = Date.now()) {
  const desde = inicioMes(ahora);
  const validos = new Set(juegosConVictorias());
  const suma = new Map();
  for (const f of victoriasMes.all(desde)) {
    if (!validos.has(f.juego)) continue;
    const a = suma.get(f.jugador) || { jugador: f.jugador, n: 0, ultima: 0 };
    a.n += f.n; a.ultima = Math.max(a.ultima, f.ultima); suma.set(f.jugador, a);
  }
  const victorias = [...suma.values()].sort((a, b) => b.n - a.n || b.ultima - a.ultima).slice(0, 3);
  return { desde, partidas: masPartidasMes.all(desde), victorias };
}

const router = express.Router();

router.post('/', (req, res) => {
  const r = guardarPartida(req.body || {});
  if (r.error) return res.status(400).json({ error: r.error });
  res.json({ success: true, ...r });
});

router.get('/salon/:juego', (req, res) => {
  if (!JUEGOS.has(req.params.juego)) return res.status(404).json({ error: 'Juego desconocido.' });
  res.json({ success: true, ...salon(req.params.juego) });
});

router.get('/mes', (req, res) => {
  res.json({ success: true, ...podiosMes() });
});

router.get('/recientes', (req, res) => {
  res.json({ success: true, jugadores: recientes.all().map((x) => x.jugador) });
});

export default router;
