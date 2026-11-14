// server/routes/social.js
// Funciones sociales:
//   GET  /api/social/cara?a=Ana#1234&b=Luis#5678   historial cara a cara entre dos jugadores
//   GET  /api/social/grupos?jugador=                tus grupos
//   POST /api/social/grupos { nombre, jugador }     crea un grupo (devuelve el código)
//   GET  /api/social/grupos/:codigo                 miembros, ranking interno, juegos, últimas partidas y noches
//   POST /api/social/grupos/:codigo/unirse|salir    { jugador }
//   POST /api/social/grupos/:codigo/noches          { noche } guarda una Noche de juegos terminada
//   GET  /api/social/sala/:juego/:code?desde=       «sala viva»: marcador y reacciones de una sala online (modo tele)
//   POST /api/social/sala/:juego/:code/estado       { nombre, jugadores: [{ nombre, puntos }], estado }
//   POST /api/social/sala/:juego/:code/reaccion     { nombre, emoji }
import express from 'express';
import db from '../db.js';
import { conVictorias } from '../../client/src/games/limites.js';

const router = express.Router();
const plano = (n) => String(n || '').replace(/#\d{4}$/, '');
const valido = (j) => /^[^#]{1,15}#\d{4}$/.test(String(j || ''));
const variantes = (j) => [...new Set([j, plano(j)])];

/* ───────── Cara a cara ───────── */
function caraACara(a, b) {
  const va = variantes(a); const vb = variantes(b);
  const filas = db.prepare(`SELECT ra.partida, ra.juego, ra.fecha, ra.puntos AS pa, ra.gana AS ga, rb.puntos AS pb, rb.gana AS gb,
      (SELECT orden FROM registros_partidas p WHERE p.id = ra.partida) AS orden
    FROM registros_resultados ra JOIN registros_resultados rb ON rb.partida = ra.partida AND rb.id <> ra.id
    WHERE ra.jugador IN (${va.map(() => '?').join(',')}) AND rb.jugador IN (${vb.map(() => '?').join(',')})
    ORDER BY ra.fecha DESC LIMIT 1000`).all(...va, ...vb);
  const vistas = new Set();
  const lista = filas.filter((f) => !vistas.has(f.partida) && vistas.add(f.partida));
  let ganaA = 0; let ganaB = 0; let empates = 0; let competidas = 0;
  const porJuego = {};
  lista.forEach((f) => {
    const j = (porJuego[f.juego] ||= { juego: f.juego, partidas: 0, a: 0, b: 0 });
    j.partidas += 1;
    if (!conVictorias(f.juego)) return;
    competidas += 1;
    // Quién queda por delante: la victoria manda; si ninguno gana (o los dos), los puntos
    let quien = f.ga && !f.gb ? 'a' : f.gb && !f.ga ? 'b' : null;
    if (!quien && f.pa != null && f.pb != null && f.pa !== f.pb) quien = (f.orden === 'asc' ? f.pa < f.pb : f.pa > f.pb) ? 'a' : 'b';
    if (quien === 'a') { ganaA += 1; j.a += 1; } else if (quien === 'b') { ganaB += 1; j.b += 1; } else empates += 1;
  });
  return {
    partidas: lista.length, competidas, ganaA, ganaB, empates,
    porJuego: Object.values(porJuego).sort((x, y) => y.partidas - x.partidas).slice(0, 8),
    ultimas: lista.slice(0, 6).map((f) => ({ juego: f.juego, fecha: f.fecha, puntosA: f.pa, puntosB: f.pb, ganaA: Boolean(f.ga), ganaB: Boolean(f.gb) }))
  };
}
router.get('/cara', (req, res) => {
  const a = String(req.query.a || ''); const b = String(req.query.b || '');
  if (!valido(a) || !valido(b) || a === b) return res.status(400).json({ error: 'Jugadores no válidos.' });
  res.json({ success: true, ...caraACara(a, b) });
});

/* ───────── Grupos de amigos ───────── */
db.exec(`
  CREATE TABLE IF NOT EXISTS grupos (codigo TEXT PRIMARY KEY, nombre TEXT NOT NULL, creador TEXT NOT NULL, creado INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS grupo_miembros (codigo TEXT NOT NULL, jugador TEXT NOT NULL, unido INTEGER NOT NULL, PRIMARY KEY (codigo, jugador));
  CREATE INDEX IF NOT EXISTS idx_grupo_miembros_jugador ON grupo_miembros (jugador);
  CREATE TABLE IF NOT EXISTS grupo_noches (id INTEGER PRIMARY KEY AUTOINCREMENT, codigo TEXT NOT NULL, fecha INTEGER NOT NULL, datos TEXT NOT NULL);
`);
const MAX_MIEMBROS = 40;
const codigoGrupo = () => { const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 6; i++) s += c[Math.floor(Math.random() * c.length)]; return s; };
const grupo = db.prepare('SELECT codigo, nombre, creador, creado FROM grupos WHERE codigo = ?');
const miembros = db.prepare('SELECT jugador, unido FROM grupo_miembros WHERE codigo = ? ORDER BY unido');
const misGrupos = db.prepare(`SELECT g.codigo, g.nombre, (SELECT COUNT(*) FROM grupo_miembros m2 WHERE m2.codigo = g.codigo) AS miembros
  FROM grupos g JOIN grupo_miembros m ON m.codigo = g.codigo WHERE m.jugador = ? ORDER BY m.unido DESC`);
const unir = db.prepare('INSERT OR IGNORE INTO grupo_miembros (codigo, jugador, unido) VALUES (?, ?, ?)');
const salir = db.prepare('DELETE FROM grupo_miembros WHERE codigo = ? AND jugador = ?');
const noches = db.prepare('SELECT id, fecha, datos FROM grupo_noches WHERE codigo = ? ORDER BY fecha DESC LIMIT 20');

function detalleGrupo(codigo) {
  const g = grupo.get(codigo);
  if (!g) return null;
  const lista = miembros.all(codigo).map((m) => m.jugador);
  // Nombre (con y sin etiqueta) → miembro
  const quien = {};
  lista.forEach((m) => { quien[m] = m; if (!quien[plano(m)]) quien[plano(m)] = m; });
  const nombres = Object.keys(quien);
  const filas = nombres.length ? db.prepare(`SELECT partida, juego, jugador, puntos, gana, fecha FROM registros_resultados
    WHERE jugador IN (${nombres.map(() => '?').join(',')}) ORDER BY fecha DESC LIMIT 4000`).all(...nombres) : [];
  const porPartida = new Map();
  filas.forEach((f) => {
    const m = quien[f.jugador];
    const p = porPartida.get(f.partida) || { juego: f.juego, fecha: f.fecha, resultados: [] };
    if (!p.resultados.some((r) => r.jugador === m)) p.resultados.push({ jugador: m, puntos: f.puntos, gana: Boolean(f.gana) });
    porPartida.set(f.partida, p);
  });
  // Solo cuentan las partidas jugadas entre al menos dos miembros
  const juntas = [...porPartida.values()].filter((p) => p.resultados.length >= 2);
  const ranking = Object.fromEntries(lista.map((m) => [m, { jugador: m, partidas: 0, victorias: 0 }]));
  const juegos = {};
  juntas.forEach((p) => {
    juegos[p.juego] = (juegos[p.juego] || 0) + 1;
    p.resultados.forEach((r) => { ranking[r.jugador].partidas += 1; if (r.gana && conVictorias(p.juego)) ranking[r.jugador].victorias += 1; });
  });
  return {
    codigo: g.codigo, nombre: g.nombre, creador: g.creador, creado: g.creado, miembros: lista,
    partidasJuntos: juntas.length,
    ranking: Object.values(ranking).sort((a, b) => b.victorias - a.victorias || b.partidas - a.partidas),
    juegos: Object.entries(juegos).map(([juego, n]) => ({ juego, n })).sort((a, b) => b.n - a.n).slice(0, 6),
    ultimas: juntas.slice(0, 8),
    noches: noches.all(codigo).map((n) => ({ id: n.id, fecha: n.fecha, ...JSON.parse(n.datos) }))
  };
}

router.get('/grupos', (req, res) => {
  const j = String(req.query.jugador || '');
  if (!valido(j)) return res.json({ success: true, grupos: [] });
  res.json({ success: true, grupos: misGrupos.all(j) });
});
router.post('/grupos', (req, res) => {
  const nombre = String(req.body?.nombre || '').replace(/\s+/g, ' ').trim().slice(0, 30);
  const jugador = String(req.body?.jugador || '');
  if (!nombre) return res.status(400).json({ error: 'Ponle un nombre al grupo.' });
  if (!valido(jugador)) return res.status(400).json({ error: 'Entra con tu nombre para crear un grupo.' });
  let codigo = codigoGrupo();
  while (grupo.get(codigo)) codigo = codigoGrupo();
  const ahora = Date.now();
  db.transaction(() => {
    db.prepare('INSERT INTO grupos (codigo, nombre, creador, creado) VALUES (?, ?, ?, ?)').run(codigo, nombre, jugador, ahora);
    unir.run(codigo, jugador, ahora);
  })();
  res.json({ success: true, codigo });
});
router.get('/grupos/:codigo', (req, res) => {
  const d = detalleGrupo(String(req.params.codigo).toUpperCase());
  if (!d) return res.status(404).json({ error: 'Ese grupo no existe.' });
  res.json({ success: true, ...d });
});
router.post('/grupos/:codigo/unirse', (req, res) => {
  const codigo = String(req.params.codigo).toUpperCase(); const jugador = String(req.body?.jugador || '');
  if (!grupo.get(codigo)) return res.status(404).json({ error: 'Ese grupo no existe.' });
  if (!valido(jugador)) return res.status(400).json({ error: 'Entra con tu nombre para unirte.' });
  if (miembros.all(codigo).length >= MAX_MIEMBROS) return res.status(400).json({ error: 'El grupo está completo.' });
  unir.run(codigo, jugador, Date.now());
  res.json({ success: true });
});
router.post('/grupos/:codigo/salir', (req, res) => {
  salir.run(String(req.params.codigo).toUpperCase(), String(req.body?.jugador || ''));
  res.json({ success: true });
});
router.post('/grupos/:codigo/noches', (req, res) => {
  const codigo = String(req.params.codigo).toUpperCase();
  if (!grupo.get(codigo)) return res.status(404).json({ error: 'Ese grupo no existe.' });
  const n = req.body?.noche || {};
  const marcador = (Array.isArray(n.marcador) ? n.marcador : []).slice(0, 20)
    .map((t) => ({ nombre: String(t?.nombre || '').slice(0, 20), puntos: Number(t?.puntos) || 0 })).filter((t) => t.nombre);
  const juegos = (Array.isArray(n.juegos) ? n.juegos : []).slice(0, 30).map((x) => String(x).slice(0, 30));
  if (marcador.length < 2 || !juegos.length) return res.status(400).json({ error: 'Noche incompleta.' });
  db.prepare('INSERT INTO grupo_noches (codigo, fecha, datos) VALUES (?, ?, ?)').run(codigo, Date.now(), JSON.stringify({ marcador, juegos }));
  res.json({ success: true });
});

/* ───────── Sala viva: marcador y reacciones de las salas online (para el modo tele) ───────── */
export const REACCIONES = ['😂', '🔥', '😱', '👏', '😡', '🤯', '❤️', '🐐'];
const salas = new Map();
const CADUCA = 3 * 60 * 60 * 1000;
setInterval(() => { const t = Date.now(); salas.forEach((s, k) => { if (t - s.actualizado > CADUCA) salas.delete(k); }); }, 10 * 60 * 1000).unref();
const clave = (req) => `${String(req.params.juego).slice(0, 30)}:${String(req.params.code).toUpperCase().slice(0, 8)}`;
const sala = (k) => { if (!salas.has(k)) salas.set(k, { jugadores: [], estado: '', reacciones: [], ultimoId: 0, presencia: {}, ultima: {}, actualizado: Date.now() }); return salas.get(k); };
const limpio = (t, n) => String(t ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

router.get('/sala/:juego/:code', (req, res) => {
  const s = salas.get(clave(req));
  const desde = Number(req.query.desde) || 0;
  if (!s) return res.json({ success: true, existe: false, jugadores: [], reacciones: [], ultimoId: 0 });
  const ahora = Date.now();
  res.json({
    success: true, existe: true, estado: s.estado, jugadores: s.jugadores, ultimoId: s.ultimoId, ahora,
    conectados: Object.entries(s.presencia).filter(([, t]) => ahora - t < 15000).map(([n]) => n),
    reacciones: s.reacciones.filter((r) => r.id > desde && ahora - r.t < 20000)
  });
});
router.post('/sala/:juego/:code/estado', (req, res) => {
  const s = sala(clave(req));
  const nombre = limpio(req.body?.nombre, 24);
  const lista = (Array.isArray(req.body?.jugadores) ? req.body.jugadores : []).slice(0, 30)
    .map((j) => ({ nombre: limpio(j?.nombre, 24), puntos: Number.isFinite(Number(j?.puntos)) && j?.puntos !== null ? Number(j.puntos) : null }))
    .filter((j) => j.nombre);
  if (lista.length) s.jugadores = lista;
  if (req.body?.estado) s.estado = limpio(req.body.estado, 20);
  if (nombre) s.presencia[nombre] = Date.now();
  s.actualizado = Date.now();
  res.json({ success: true });
});
router.post('/sala/:juego/:code/reaccion', (req, res) => {
  const s = sala(clave(req));
  const nombre = limpio(req.body?.nombre, 24) || 'Alguien';
  const emoji = String(req.body?.emoji || '');
  if (!REACCIONES.includes(emoji)) return res.status(400).json({ error: 'Reacción no válida.' });
  const ahora = Date.now();
  if (ahora - (s.ultima[nombre] || 0) < 250) return res.status(429).json({ error: 'Más despacio.' });
  s.ultima[nombre] = ahora;
  s.ultimoId += 1;
  s.reacciones.push({ id: s.ultimoId, emoji, nombre, t: ahora });
  if (s.reacciones.length > 60) s.reacciones = s.reacciones.slice(-60);
  s.actualizado = ahora;
  res.json({ success: true, id: s.ultimoId });
});

export default router;
