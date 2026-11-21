// server/routes/social.js
// Funciones sociales:
//   GET  /api/social/cara?a=Ana#1234&b=Luis#5678   historial cara a cara entre dos jugadores
//   GET  /api/social/grupos                         tus grupos (y cuál está activo)
//   POST /api/social/grupos { nombre }              crea un grupo (devuelve el código)
//   GET  /api/social/grupos/:codigo                 miembros, ranking interno, juegos, últimas partidas y noches
//   POST /api/social/grupos/:codigo/unirse|salir|activar|expulsar|readmitir   (con la sesión de la cuenta)
//   GET  /api/social/grupo-activo                    tu grupo activo: participantes, administrador y partida
//   POST /api/social/grupo-activo/partida            el administrador anuncia (o cierra) la partida del grupo
//   POST /api/social/grupos/:codigo/noches          { noche } guarda una Noche de juegos terminada
//   GET  /api/social/sala/:juego/:code?desde=       «sala viva»: marcador y reacciones de una sala online (modo tele)
//   POST /api/social/sala/:juego/:code/estado       { nombre, completo, jugadores: [{ nombre, puntos }], estado }
//   POST /api/social/sala/:juego/:code/reaccion     { nombre, emoji }
import { puntosSeguros, textoSeguro } from '../lib/validar.js';
import { JUEGOS_PREGUNTAS, preguntasDelGrupo } from '../lib/preguntasGrupo.js';
import express from 'express';
import { estaOnline, onlineDesde, adminOnline } from '../lib/usuarios.js';
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

/* ───────── Grupos de amigos ─────────
   Hace falta cuenta (sesión iniciada): el jugador es siempre el de la sesión, nunca el que diga el navegador.
   - El creador es el administrador del grupo (👑). Si sale del grupo, el puesto pasa al miembro más antiguo; si no
     queda nadie, el grupo se borra.
   - Cada cuenta tiene como mucho un grupo ACTIVO (tabla grupo_activo). Solo el grupo activo cambia cómo funciona la web.
   - «Online» = sesión iniciada (ver estaOnline en lib/usuarios.js).
   - Participantes = miembros online que tienen ESE grupo activo. Con 2 o más, el administrador efectivo (el creador, o
     si no está, el participante que lleva más tiempo online) es el único que abre partidas online, y los demás entran
     solos en su sala de espera. */
db.exec(`
  CREATE TABLE IF NOT EXISTS grupos (codigo TEXT PRIMARY KEY, nombre TEXT NOT NULL, creador TEXT NOT NULL, creado INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS grupo_miembros (codigo TEXT NOT NULL, jugador TEXT NOT NULL, unido INTEGER NOT NULL, PRIMARY KEY (codigo, jugador));
  CREATE INDEX IF NOT EXISTS idx_grupo_miembros_jugador ON grupo_miembros (jugador);
  CREATE TABLE IF NOT EXISTS grupo_noches (id INTEGER PRIMARY KEY AUTOINCREMENT, codigo TEXT NOT NULL, fecha INTEGER NOT NULL, datos TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS grupo_activo (jugador TEXT PRIMARY KEY, codigo TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS grupo_expulsados (codigo TEXT NOT NULL, jugador TEXT NOT NULL, fecha INTEGER NOT NULL, PRIMARY KEY (codigo, jugador));
`);
const MAX_MIEMBROS = 40;
const codigoGrupo = () => { const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 6; i++) s += c[Math.floor(Math.random() * c.length)]; return s; };
const grupo = db.prepare('SELECT codigo, nombre, creador, creado FROM grupos WHERE codigo = ?');
const miembros = db.prepare('SELECT jugador, unido FROM grupo_miembros WHERE codigo = ? ORDER BY unido');
const misGrupos = db.prepare(`SELECT g.codigo, g.nombre, g.creador, (SELECT COUNT(*) FROM grupo_miembros m2 WHERE m2.codigo = g.codigo) AS miembros
  FROM grupos g JOIN grupo_miembros m ON m.codigo = g.codigo WHERE m.jugador = ? ORDER BY m.unido DESC`);
const unir = db.prepare('INSERT OR IGNORE INTO grupo_miembros (codigo, jugador, unido) VALUES (?, ?, ?)');
const quitarMiembro = db.prepare('DELETE FROM grupo_miembros WHERE codigo = ? AND jugador = ?');
const noches = db.prepare('SELECT id, fecha, datos FROM grupo_noches WHERE codigo = ? ORDER BY fecha DESC LIMIT 20');
const activoDe = db.prepare('SELECT codigo FROM grupo_activo WHERE jugador = ?');
const ponerActivo = db.prepare('INSERT OR REPLACE INTO grupo_activo (jugador, codigo) VALUES (?, ?)');
const quitarActivo = db.prepare('DELETE FROM grupo_activo WHERE jugador = ? AND codigo = ?');
const conActivo = db.prepare('SELECT jugador FROM grupo_activo WHERE codigo = ?');
const expulsados = db.prepare('SELECT jugador, fecha FROM grupo_expulsados WHERE codigo = ? ORDER BY fecha DESC');
const esMiembro = (codigo, jugador) => miembros.all(codigo).some((m) => m.jugador === jugador);

/** El creador, o (si ya no es del grupo, p. ej. borró su cuenta) el miembro más antiguo, que pasa a serlo. */
function creadorDe(g) {
  const lista = miembros.all(g.codigo);
  if (lista.some((m) => m.jugador === g.creador)) return g.creador;
  const nuevo = lista[0]?.jugador || null;
  if (nuevo) db.prepare('UPDATE grupos SET creador = ? WHERE codigo = ?').run(nuevo, g.codigo);
  return nuevo;
}
function borrarGrupo(codigo) {
  db.transaction(() => {
    ['grupo_miembros', 'grupo_activo', 'grupo_expulsados', 'grupo_noches', 'grupo_preguntas'].forEach((t) => {
      try { db.prepare(`DELETE FROM ${t} WHERE codigo = ?`).run(codigo); } catch { /* nada */ }
    });
    db.prepare('DELETE FROM grupos WHERE codigo = ?').run(codigo);
  })();
  partidasGrupo.delete(codigo);
}
// Toda la API de grupos necesita sesión: el jugador es el de la cuenta
function cuenta(req, res) {
  if (!req.usuario) { res.status(401).json({ error: 'Inicia sesión con tu cuenta para usar los grupos.', necesitaSesion: true }); return null; }
  return req.usuario.jugador;
}
function grupoDeMiembro(req, res) {
  const yo = cuenta(req, res); if (!yo) return null;
  const codigo = String(req.params.codigo || '').toUpperCase();
  const g = grupo.get(codigo);
  if (!g) { res.status(404).json({ error: 'Ese grupo no existe.' }); return null; }
  if (!esMiembro(codigo, yo)) { res.status(403).json({ error: 'No eres de este grupo.' }); return null; }
  return { yo, codigo, g, creador: creadorDe(g) };
}

/* ───────── Estadísticas del grupo ───────── */
function detalleGrupo(codigo) {
  const g = grupo.get(codigo);
  if (!g) return null;
  const lista = miembros.all(codigo).map((m) => m.jugador);
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
  const ranking = Object.fromEntries(lista.map((m) => [m, { jugador: m, partidas: 0, victorias: 0, juegos: new Set(), racha: 0, mejorRacha: 0 }]));
  const juegos = {};
  // De la más antigua a la más reciente, para las rachas
  [...juntas].reverse().forEach((p) => {
    juegos[p.juego] = (juegos[p.juego] || 0) + 1;
    p.resultados.forEach((r) => {
      const x = ranking[r.jugador];
      x.partidas += 1; x.juegos.add(p.juego);
      if (!conVictorias(p.juego)) return;
      if (r.gana) { x.victorias += 1; x.racha += 1; x.mejorRacha = Math.max(x.mejorRacha, x.racha); } else x.racha = 0;
    });
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
  const filasRanking = Object.values(ranking).map((r) => ({ jugador: r.jugador, partidas: r.partidas, victorias: r.victorias, juegosDistintos: r.juegos.size, mejorRacha: r.mejorRacha }));
  // Insignias: quién destaca en el grupo
  const insignias = [];
  const mejor = (campo, minimo = 1) => filasRanking.filter((r) => r[campo] >= minimo).sort((a, b) => b[campo] - a[campo])[0];
  const poner = (emoji, titulo, r, texto) => { if (r) insignias.push({ emoji, titulo, jugador: r.jugador, texto }); };
  let r = mejor('victorias'); poner('👑', 'Rey del grupo', r, r && `${r.victorias} victorias`);
  r = mejor('partidas', 3); poner('🔥', 'Incansable', r, r && `${r.partidas} partidas`);
  r = mejor('mejorRacha', 2); poner('⚡', 'Imparable', r, r && `${r.mejorRacha} victorias seguidas`);
  r = mejor('juegosDistintos', 3); poner('🧭', 'Explorador', r, r && `${r.juegosDistintos} juegos distintos`);
  const pct = filasRanking.filter((x) => x.partidas >= 5).map((x) => ({ ...x, pct: Math.round((x.victorias / x.partidas) * 100) })).sort((a, b) => b.pct - a.pct)[0];
  if (pct && pct.pct > 0) poner('🎯', 'Francotirador', pct, `${pct.pct} % de victorias`);
  // Logros del grupo: hitos que se desbloquean jugando juntos
  const n = juntas.length; const distintos = Object.keys(juegos).length; const nNoches = noches.all(codigo).length;
  const logros = [
    ['🎲', 'Primera partida juntos', n >= 1], ['🔟', '10 partidas juntos', n >= 10], ['🏟️', '50 partidas juntos', n >= 50],
    ['💯', '100 partidas juntos', n >= 100], ['🗺️', '5 juegos distintos', distintos >= 5], ['🌍', '20 juegos distintos', distintos >= 20],
    ['🎉', 'Primera Noche de juegos', nNoches >= 1], ['👨‍👩‍👧‍👦', 'Grupo de 5 o más', lista.length >= 5]
  ].map(([emoji, titulo, ok]) => ({ emoji, titulo, ok }));
  return {
    codigo: g.codigo, nombre: g.nombre, creador: creadorDe(g), creado: g.creado, miembros: lista, liga,
    partidasJuntos: n,
    ranking: filasRanking.sort((a, b) => b.victorias - a.victorias || b.partidas - a.partidas),
    juegos: Object.entries(juegos).map(([juego, k]) => ({ juego, n: k })).sort((a, b) => b.n - a.n).slice(0, 6),
    ultimas: juntas.slice(0, 8),
    noches: noches.all(codigo).map((x) => ({ id: x.id, fecha: x.fecha, ...JSON.parse(x.datos) })),
    insignias, logros
  };
}

/* ───────── Rutas de los grupos ───────── */
router.get('/grupos', (req, res) => {
  if (!req.usuario) return res.json({ success: true, grupos: [], necesitaSesion: true });
  const yo = req.usuario.jugador;
  const activo = activoDe.get(yo)?.codigo || null;
  res.json({ success: true, activo, grupos: misGrupos.all(yo).map((g) => ({ ...g, creador: creadorDe(g), activo: g.codigo === activo })) });
});
router.post('/grupos', (req, res) => {
  const yo = cuenta(req, res); if (!yo) return;
  const nombre = String(req.body?.nombre || '').replace(/\s+/g, ' ').trim().slice(0, 30);
  if (!nombre) return res.status(400).json({ error: 'Ponle un nombre al grupo.' });
  let codigo = codigoGrupo();
  while (grupo.get(codigo)) codigo = codigoGrupo();
  const ahora = Date.now();
  db.transaction(() => {
    db.prepare('INSERT INTO grupos (codigo, nombre, creador, creado) VALUES (?, ?, ?, ?)').run(codigo, nombre, yo, ahora);
    unir.run(codigo, yo, ahora);
  })();
  res.json({ success: true, codigo });
});
router.get('/grupos/:codigo', (req, res) => {
  const c = grupoDeMiembro(req, res); if (!c) return;
  const d = detalleGrupo(c.codigo);
  const activo = activoDe.get(c.yo)?.codigo === c.codigo;
  const conEste = new Set(conActivo.all(c.codigo).map((x) => x.jugador));
  res.json({
    success: true, ...d, activo, soyCreador: c.creador === c.yo,
    gente: d.miembros.map((m) => ({ jugador: m, online: estaOnline(m), activo: conEste.has(m), creador: m === c.creador })),
    expulsados: c.creador === c.yo ? expulsados.all(c.codigo) : []
  });
});
router.post('/grupos/:codigo/unirse', (req, res) => {
  const yo = cuenta(req, res); if (!yo) return;
  const codigo = String(req.params.codigo).toUpperCase();
  const g = grupo.get(codigo);
  if (!g) return res.status(404).json({ error: 'No hay ningún grupo con ese código.' });
  if (esMiembro(codigo, yo)) return res.json({ success: true, codigo, ya: true });
  if (db.prepare('SELECT 1 FROM grupo_expulsados WHERE codigo = ? AND jugador = ?').get(codigo, yo)) return res.status(403).json({ error: 'El administrador te ha sacado de este grupo. Pídele que te readmita.' });
  if (miembros.all(codigo).length >= MAX_MIEMBROS) return res.status(400).json({ error: 'El grupo está completo.' });
  unir.run(codigo, yo, Date.now());
  res.json({ success: true, codigo, nombre: g.nombre });
});
router.post('/grupos/:codigo/salir', (req, res) => {
  const c = grupoDeMiembro(req, res); if (!c) return;
  quitarMiembro.run(c.codigo, c.yo); quitarActivo.run(c.yo, c.codigo);
  if (!miembros.all(c.codigo).length) borrarGrupo(c.codigo); else creadorDe(grupo.get(c.codigo));
  res.json({ success: true });
});
// Activar (y desactivar el que hubiera) o desactivar
router.post('/grupos/:codigo/activar', (req, res) => {
  const c = grupoDeMiembro(req, res); if (!c) return;
  if (req.body?.activo === false) quitarActivo.run(c.yo, c.codigo); else ponerActivo.run(c.yo, c.codigo);
  res.json({ success: true, activo: req.body?.activo !== false });
});
router.post('/grupos/:codigo/expulsar', (req, res) => {
  const c = grupoDeMiembro(req, res); if (!c) return;
  if (c.creador !== c.yo) return res.status(403).json({ error: 'Solo el administrador del grupo puede sacar a alguien.' });
  const quien = String(req.body?.miembro || '');
  if (quien === c.yo) return res.status(400).json({ error: 'No puedes sacarte a ti mismo: usa «Salir del grupo».' });
  if (!esMiembro(c.codigo, quien)) return res.status(404).json({ error: 'Esa persona no está en el grupo.' });
  db.transaction(() => {
    quitarMiembro.run(c.codigo, quien); quitarActivo.run(quien, c.codigo);
    db.prepare('INSERT OR REPLACE INTO grupo_expulsados (codigo, jugador, fecha) VALUES (?, ?, ?)').run(c.codigo, quien, Date.now());
  })();
  res.json({ success: true });
});
router.post('/grupos/:codigo/readmitir', (req, res) => {
  const c = grupoDeMiembro(req, res); if (!c) return;
  if (c.creador !== c.yo) return res.status(403).json({ error: 'Solo el administrador del grupo.' });
  db.prepare('DELETE FROM grupo_expulsados WHERE codigo = ? AND jugador = ?').run(c.codigo, String(req.body?.miembro || ''));
  res.json({ success: true });
});

/* ───────── Preguntas propias del grupo (las crea el administrador) ───────── */
router.get('/grupos/:codigo/preguntas', (req, res) => {
  const c = grupoDeMiembro(req, res); if (!c) return;
  const preguntas = db.prepare('SELECT id, juego, texto, autor, creado FROM grupo_preguntas WHERE codigo = ? ORDER BY id DESC').all(c.codigo);
  res.json({ success: true, preguntas, juegos: JUEGOS_PREGUNTAS, creador: c.creador });
});
router.post('/grupos/:codigo/preguntas', (req, res) => {
  const c = grupoDeMiembro(req, res); if (!c) return;
  if (c.creador !== c.yo) return res.status(403).json({ error: 'Solo el administrador del grupo puede crear preguntas.' });
  const juego = String(req.body?.juego || '');
  const texto = String(req.body?.texto || '').replace(/\s+/g, ' ').trim().slice(0, 160);
  if (!JUEGOS_PREGUNTAS[juego]) return res.status(400).json({ error: 'Juego no válido.' });
  if (texto.length < 6) return res.status(400).json({ error: 'Escribe una pregunta un poco más larga.' });
  const n = db.prepare('SELECT COUNT(*) AS n FROM grupo_preguntas WHERE codigo = ?').get(c.codigo).n;
  if (n >= 400) return res.status(400).json({ error: 'El grupo ya tiene 400 preguntas: borra alguna antes.' });
  if (db.prepare('SELECT 1 FROM grupo_preguntas WHERE codigo = ? AND juego = ? AND lower(texto) = lower(?)').get(c.codigo, juego, texto)) return res.status(400).json({ error: 'Esa pregunta ya está.' });
  const r = db.prepare('INSERT INTO grupo_preguntas (codigo, juego, texto, autor, creado) VALUES (?, ?, ?, ?, ?)').run(c.codigo, juego, texto, c.yo, Date.now());
  res.json({ success: true, id: r.lastInsertRowid });
});
router.post('/grupos/:codigo/preguntas/:id/borrar', (req, res) => {
  const c = grupoDeMiembro(req, res); if (!c) return;
  if (c.creador !== c.yo) return res.status(403).json({ error: 'Solo el administrador del grupo puede borrar preguntas.' });
  db.prepare('DELETE FROM grupo_preguntas WHERE codigo = ? AND id = ?').run(c.codigo, Number(req.params.id));
  res.json({ success: true });
});
// Para el selector de los juegos: tus grupos y cuántas preguntas tiene cada uno para ese juego
router.get('/preguntas-grupo', (req, res) => {
  const juego = String(req.query.juego || '');
  if (!req.usuario || !JUEGOS_PREGUNTAS[juego]) return res.json({ success: true, grupos: [] });
  const grupos = misGrupos.all(req.usuario.jugador).map((g) => ({ codigo: g.codigo, nombre: g.nombre, preguntas: preguntasDelGrupo(g.codigo, juego).length }));
  res.json({ success: true, grupos });
});
router.get('/grupos/:codigo/preguntas/:juego/lista', (req, res) => {
  res.json({ success: true, preguntas: preguntasDelGrupo(req.params.codigo, req.params.juego) });
});

router.post('/grupos/:codigo/noches', (req, res) => {
  const c = grupoDeMiembro(req, res); if (!c) return;
  const n = req.body?.noche || {};
  const marcador = (Array.isArray(n.marcador) ? n.marcador : []).slice(0, 20)
    .map((t) => ({ nombre: textoSeguro(t?.nombre, 20), puntos: puntosSeguros(t?.puntos) ?? 0 })).filter((t) => t.nombre);
  const juegos = (Array.isArray(n.juegos) ? n.juegos : []).slice(0, 30).map((x) => textoSeguro(x, 30)).filter((x) => /^[a-z0-9-]{2,30}$/.test(x));
  if (marcador.length < 2 || !juegos.length) return res.status(400).json({ error: 'Noche incompleta.' });
  db.prepare('INSERT INTO grupo_noches (codigo, fecha, datos) VALUES (?, ?, ?)').run(c.codigo, Date.now(), JSON.stringify({ marcador, juegos }));
  res.json({ success: true });
});

/* ───────── Grupo activo: participantes, administrador efectivo y partida del grupo ─────────
   La partida del grupo vive en memoria: { juego, codigo, api, estado, ronda, por, desde }.
   - La anuncia el administrador efectivo en cuanto está en una sala online; los participantes entran solos mientras
     esté en la sala de espera (estado «lobby»). Si ya están jugando, los que llegan tarde esperan a la siguiente.
   - `ronda` sube cada vez que la misma sala vuelve a la sala de espera (repetir partida): así quien se salió de una
     partida no vuelve a entrar en ella, pero sí en la siguiente. */
const partidasGrupo = new Map(); // codigo → partida
const CADUCA_PARTIDA = 3 * 60 * 60 * 1000;
setInterval(() => { const t = Date.now(); partidasGrupo.forEach((p, k) => { if (t - p.visto > CADUCA_PARTIDA) partidasGrupo.delete(k); }); }, 10 * 60 * 1000).unref();

function estadoGrupoActivo(yo) {
  const codigo = activoDe.get(yo)?.codigo;
  const g = codigo && grupo.get(codigo);
  if (!g || !esMiembro(codigo, yo)) { if (codigo) quitarActivo.run(yo, codigo); return { grupo: null }; }
  const creador = creadorDe(g);
  const conEste = new Set(conActivo.all(codigo).map((x) => x.jugador));
  const gente = miembros.all(codigo).map((m) => ({ jugador: m.jugador, online: estaOnline(m.jugador), activo: conEste.has(m.jugador), desde: onlineDesde(m.jugador) }));
  const participantes = gente.filter((m) => m.online && m.activo).sort((a, b) => a.desde - b.desde).map((m) => m.jugador);
  const admin = participantes.includes(creador) ? creador : participantes[0] || null;
  const partida = partidasGrupo.get(codigo) || null;
  return {
    grupo: { codigo, nombre: g.nombre, creador },
    participantes, admin, soyAdmin: admin === yo, enGrupo: participantes.length >= 2,
    adminTemporal: Boolean(admin && admin !== creador),
    partida: partida && { ...partida }
  };
}
export function grupoActivoDe(jugador) { return estadoGrupoActivo(jugador); }

router.get('/grupo-activo', (req, res) => {
  if (!req.usuario) return res.json({ success: true, grupo: null });
  res.json({ success: true, ...estadoGrupoActivo(req.usuario.jugador), ahora: Date.now() });
});
// El administrador efectivo anuncia en qué sala está (o la cierra con { cerrar: true })
router.post('/grupo-activo/partida', (req, res) => {
  const yo = cuenta(req, res); if (!yo) return;
  const e = estadoGrupoActivo(yo);
  if (!e.grupo) return res.status(400).json({ error: 'No tienes ningún grupo activo.' });
  const actual = partidasGrupo.get(e.grupo.codigo);
  if (req.body?.cerrar) {
    // Puede cerrarla quien la abrió (aunque ya no sea el administrador) o el administrador
    if (actual && (actual.por === yo || e.soyAdmin) && (!req.body.codigo || req.body.codigo === actual.codigo)) partidasGrupo.delete(e.grupo.codigo);
    return res.json({ success: true, ...estadoGrupoActivo(yo) });
  }
  if (!e.soyAdmin && !(actual && actual.por === yo)) return res.status(403).json({ error: 'Solo el administrador del grupo abre partidas.' });
  const juego = String(req.body?.juego || '').slice(0, 30);
  const codigo = String(req.body?.codigo || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  const api = String(req.body?.api || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30) || null;
  const estado = ['lobby', 'jugando', 'fin'].includes(req.body?.estado) ? req.body.estado : 'lobby';
  if (!/^[a-z0-9-]+$/.test(juego) || !codigo) return res.status(400).json({ error: 'Partida no válida.' });
  const ahora = Date.now();
  if (actual && actual.juego === juego && actual.codigo === codigo) {
    if (estado === 'lobby' && actual.estado !== 'lobby') actual.ronda += 1; // han vuelto a la sala de espera: partida nueva
    actual.estado = estado; actual.visto = ahora; if (api) actual.api = api;
  } else {
    partidasGrupo.set(e.grupo.codigo, { juego, codigo, api, estado, ronda: 1, por: yo, desde: ahora, visto: ahora });
  }
  res.json({ success: true, ...estadoGrupoActivo(yo) });
});

/* ───────── Juegos ocultos ─────────
   Algunos juegos solo los ve el administrador de la web… y los demás participantes de su grupo activo mientras él
   esté online con el modo administrador. */
export function accesoPorGrupo(jugador) {
  if (!valido(jugador) || !estaOnline(jugador)) return false;
  const e = estadoGrupoActivo(jugador);
  return Boolean(e.grupo && e.participantes.includes(jugador) && e.participantes.some((p) => adminOnline(p)));
}

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
    success: true, existe: true, estado: s.estado, jugadores: s.jugadores, ultimoId: s.ultimoId, ahora, caras: s.caras || {},
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
  // Quién es quién en la sala («Ana» → «Ana#1234»), para enseñar el avatar de cada jugador
  const completo = String(req.body?.completo || '');
  if (nombre && valido(completo) && plano(completo).toLowerCase() === nombre.toLowerCase()) {
    s.caras = s.caras || {};
    if (s.caras[nombre] || Object.keys(s.caras).length < 40) s.caras[nombre] = completo;
  }
  // Quien crea la sala es el primero que la anuncia (la sala solo existe con él dentro)
  if (!s.creador && valido(completo)) s.creador = completo;
  s.actualizado = Date.now();
  res.json({ success: true, creador: s.creador || null, cerrada: Boolean(s.cerrada) });
});
// El creador de la sala vuelve a la portada al acabar (o cierra la sala de espera): la sala se cierra para todos
router.post('/sala/:juego/:code/cerrar', (req, res) => {
  const s = salas.get(clave(req));
  const completo = String(req.body?.completo || '');
  if (s && s.creador && s.creador === completo) { s.cerrada = Date.now(); s.actualizado = Date.now(); }
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
