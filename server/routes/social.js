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
import { JUEGOS_PREGUNTAS, preguntasDelGrupo } from '../lib/preguntasGrupo.js';
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
  // Liga mensual: 3 puntos por victoria y 1 por partida jugada juntos; también los campeones de meses anteriores
  const mesDe = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };
  const meses = {};
  juntas.forEach((p) => {
    const m = (meses[mesDe(p.fecha)] ||= {});
    p.resultados.forEach((r) => {
      const j = (m[r.jugador] ||= { jugador: r.jugador, puntos: 0, partidas: 0, victorias: 0, porJuego: {} });
      const gana = r.gana && conVictorias(p.juego);
      j.partidas += 1; j.puntos += 1 + (gana ? 3 : 0); if (gana) j.victorias += 1;
      const pj = (j.porJuego[p.juego] ||= { p: 0, v: 0 }); pj.p += 1; if (gana) pj.v += 1;
    });
  });
  const ordenar = (m) => Object.values(m || {}).sort((a, b) => b.puntos - a.puntos || b.victorias - a.victorias);
  const mesActual = mesDe(Date.now());
  const liga = {
    mes: mesActual,
    clasificacion: ordenar(meses[mesActual]),
    campeones: Object.keys(meses).filter((k) => k !== mesActual).sort().reverse().slice(0, 6)
      .map((k) => { const c = ordenar(meses[k])[0]; return c ? { mes: k, jugador: c.jugador, puntos: c.puntos } : null; }).filter(Boolean)
  };
  return {
    codigo: g.codigo, nombre: g.nombre, creador: g.creador, creado: g.creado, miembros: lista, liga,
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
/* ───────── Preguntas propias del grupo ───────── */
router.get('/grupos/:codigo/preguntas', (req, res) => {
  const codigo = String(req.params.codigo).toUpperCase();
  if (!grupo.get(codigo)) return res.status(404).json({ error: 'Ese grupo no existe.' });
  const preguntas = db.prepare('SELECT id, juego, texto, autor, creado FROM grupo_preguntas WHERE codigo = ? ORDER BY id DESC').all(codigo);
  res.json({ success: true, preguntas, juegos: JUEGOS_PREGUNTAS });
});
router.post('/grupos/:codigo/preguntas', (req, res) => {
  const codigo = String(req.params.codigo).toUpperCase();
  const jugador = String(req.body?.jugador || '');
  const juego = String(req.body?.juego || '');
  const texto = String(req.body?.texto || '').replace(/\s+/g, ' ').trim().slice(0, 160);
  if (!grupo.get(codigo)) return res.status(404).json({ error: 'Ese grupo no existe.' });
  if (!miembros.all(codigo).some((m) => m.jugador === jugador)) return res.status(403).json({ error: 'Solo los del grupo pueden añadir preguntas.' });
  if (!JUEGOS_PREGUNTAS[juego]) return res.status(400).json({ error: 'Juego no válido.' });
  if (texto.length < 6) return res.status(400).json({ error: 'Escribe una pregunta un poco más larga.' });
  const n = db.prepare('SELECT COUNT(*) AS n FROM grupo_preguntas WHERE codigo = ?').get(codigo).n;
  if (n >= 400) return res.status(400).json({ error: 'El grupo ya tiene 400 preguntas: borra alguna antes.' });
  if (db.prepare('SELECT 1 FROM grupo_preguntas WHERE codigo = ? AND juego = ? AND lower(texto) = lower(?)').get(codigo, juego, texto)) return res.status(400).json({ error: 'Esa pregunta ya está.' });
  const r = db.prepare('INSERT INTO grupo_preguntas (codigo, juego, texto, autor, creado) VALUES (?, ?, ?, ?, ?)').run(codigo, juego, texto, jugador, Date.now());
  res.json({ success: true, id: r.lastInsertRowid });
});
router.post('/grupos/:codigo/preguntas/:id/borrar', (req, res) => {
  const codigo = String(req.params.codigo).toUpperCase();
  const jugador = String(req.body?.jugador || '');
  if (!miembros.all(codigo).some((m) => m.jugador === jugador)) return res.status(403).json({ error: 'Solo los del grupo pueden borrar preguntas.' });
  db.prepare('DELETE FROM grupo_preguntas WHERE codigo = ? AND id = ?').run(codigo, Number(req.params.id));
  res.json({ success: true });
});
// Para el selector de los juegos: tus grupos y cuántas preguntas tiene cada uno para ese juego
router.get('/preguntas-grupo', (req, res) => {
  const jugador = String(req.query.jugador || '');
  const juego = String(req.query.juego || '');
  if (!valido(jugador) || !JUEGOS_PREGUNTAS[juego]) return res.json({ success: true, grupos: [] });
  const grupos = misGrupos.all(jugador).map((g) => ({ codigo: g.codigo, nombre: g.nombre, preguntas: preguntasDelGrupo(g.codigo, juego).length }));
  res.json({ success: true, grupos });
});
router.get('/grupos/:codigo/preguntas/:juego/lista', (req, res) => {
  res.json({ success: true, preguntas: preguntasDelGrupo(req.params.codigo, req.params.juego) });
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

/* ───────── Sala fija del grupo ─────────
   Cada grupo tiene una sala (con el código del grupo) donde los miembros conectados esperan juntos. El anfitrión
   elige un juego, crea su partida online y la anuncia aquí; los demás entran en ella sin teclear el código.
   Al acabar, todos vuelven a la sala y el anfitrión elige el siguiente. Se guarda en memoria (si el servidor se
   reinicia, la sala vuelve a estar vacía, pero el grupo y su código siguen). */
const salasGrupo = new Map(); // codigo → { anfitrion, presencia: { jugador: t }, juego: { id, codigo, desde, por } | null, cambios }
const VIVO_MS = 15000;
const salaGrupo = (codigo) => {
  if (!salasGrupo.has(codigo)) salasGrupo.set(codigo, { anfitrion: null, presencia: {}, juego: null, cambios: 0, actualizado: Date.now() });
  return salasGrupo.get(codigo);
};
const CADUCA_GRUPO = 6 * 60 * 60 * 1000;
setInterval(() => { const t = Date.now(); salasGrupo.forEach((s, k) => { if (t - s.actualizado > CADUCA_GRUPO) salasGrupo.delete(k); }); }, 10 * 60 * 1000).unref();
const conectadosDe = (s, ahora = Date.now()) => Object.entries(s.presencia).filter(([, t]) => ahora - t < VIVO_MS).map(([j]) => j);
function vistaSalaGrupo(codigo, s) {
  const ahora = Date.now();
  const conectados = conectadosDe(s, ahora);
  // Si el anfitrión se ha ido, pasa al que más tiempo lleva conectado
  if (!s.anfitrion || !conectados.includes(s.anfitrion)) { s.anfitrion = conectados[0] || null; s.cambios++; }
  return { success: true, codigo, anfitrion: s.anfitrion, conectados, juego: s.juego, cambios: s.cambios, ahora };
}
function comprobarMiembro(req, res) {
  const codigo = String(req.params.codigo).toUpperCase();
  const jugador = String(req.body?.jugador || '');
  if (!grupo.get(codigo)) { res.status(404).json({ error: 'Ese grupo no existe.' }); return null; }
  if (!valido(jugador)) { res.status(400).json({ error: 'Entra con tu nombre.' }); return null; }
  if (!miembros.all(codigo).some((m) => m.jugador === jugador)) { res.status(403).json({ error: 'No eres de este grupo: únete primero.' }); return null; }
  return { codigo, jugador, s: salaGrupo(codigo) };
}
// Latido: estoy en la sala (o jugando un juego de la sala). Devuelve el estado.
router.post('/grupos/:codigo/sala/latido', (req, res) => {
  const c = comprobarMiembro(req, res); if (!c) return;
  const nuevo = !c.s.presencia[c.jugador] || Date.now() - c.s.presencia[c.jugador] > VIVO_MS;
  c.s.presencia[c.jugador] = Date.now(); c.s.actualizado = Date.now();
  if (nuevo) c.s.cambios++;
  res.json(vistaSalaGrupo(c.codigo, c.s));
});
router.post('/grupos/:codigo/sala/salir', (req, res) => {
  const c = comprobarMiembro(req, res); if (!c) return;
  delete c.s.presencia[c.jugador]; c.s.cambios++;
  if (c.s.anfitrion === c.jugador) c.s.anfitrion = null;
  res.json(vistaSalaGrupo(c.codigo, c.s));
});
// El anfitrión anuncia la partida que acaba de crear (o la cierra con juego: null)
router.post('/grupos/:codigo/sala/juego', (req, res) => {
  const c = comprobarMiembro(req, res); if (!c) return;
  vistaSalaGrupo(c.codigo, c.s);
  if (c.s.anfitrion !== c.jugador) return res.status(403).json({ error: 'Solo el anfitrión elige el juego.' });
  const j = req.body?.juego;
  if (j === null) c.s.juego = null;
  else {
    const id = String(j?.id || '').slice(0, 30); const cod = String(j?.codigo || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    if (!/^[a-z0-9-]+$/.test(id)) return res.status(400).json({ error: 'Juego no válido.' });
    const api = String(j?.api || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30) || null;
    // Si es la misma partida (ya anunciada sin código), se completa; si no, empieza una nueva
    const misma = c.s.juego && c.s.juego.id === id && !c.s.juego.codigo && cod;
    c.s.juego = { id, codigo: cod || null, api, desde: misma ? c.s.juego.desde : Date.now(), por: c.jugador };
  }
  c.s.cambios++; c.s.actualizado = Date.now();
  res.json(vistaSalaGrupo(c.codigo, c.s));
});
// Pasar la corona a otro conectado
router.post('/grupos/:codigo/sala/anfitrion', (req, res) => {
  const c = comprobarMiembro(req, res); if (!c) return;
  vistaSalaGrupo(c.codigo, c.s);
  const nuevo = String(req.body?.nuevo || '');
  if (c.s.anfitrion !== c.jugador) return res.status(403).json({ error: 'Solo el anfitrión puede pasar la corona.' });
  if (!conectadosDe(c.s).includes(nuevo)) return res.status(400).json({ error: 'Esa persona no está en la sala.' });
  c.s.anfitrion = nuevo; c.s.cambios++;
  res.json(vistaSalaGrupo(c.codigo, c.s));
});
// Quién está ahora en la sala (para la página del grupo, sin contar como presente)
router.get('/grupos/:codigo/sala', (req, res) => {
  const codigo = String(req.params.codigo).toUpperCase();
  if (!grupo.get(codigo)) return res.status(404).json({ error: 'Ese grupo no existe.' });
  const s = salasGrupo.get(codigo);
  res.json(s ? vistaSalaGrupo(codigo, s) : { success: true, codigo, anfitrion: null, conectados: [], juego: null, cambios: 0, ahora: Date.now() });
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
