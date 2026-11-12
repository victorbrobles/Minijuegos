// server/routes/cancion.js
// «Afina ese oído»: adivina la canción mientras su volumen va subiendo.
//
// - El fragmento (30 s) se busca en Deezer y se sirve desde este servidor (/api/cancion/audio/:clave)
//   para que el navegador pueda controlar el volumen también en móviles (sin problemas de CORS).
// - Si una canción no tiene fragmento, se elige otra (antes sonaba un efecto de sonido cualquiera).
// - Online, el servidor lleva el reloj de la canción: todos la oyen sincronizada, se pausa cuando alguien
//   pulsa, se reanuda tras un fallo y la ronda termina sola al acabar el fragmento.
// - Puntuación: cuanto antes aciertes, más puntos (de 10 a 3). Fallar resta 3.
import express from 'express';
import crypto from 'node:crypto';
import parte1 from '../data/seeds/cancion/parte1.js';
import parte2 from '../data/seeds/cancion/parte2.js';
import parte3 from '../data/seeds/cancion/parte3.js';
import parte4 from '../data/seeds/cancion/parte4.js';
import parte5 from '../data/seeds/cancion/parte5.js';
import parte6 from '../data/seeds/cancion/parte6.js';
import { limitesOnline } from '../../client/src/games/limites.js';
const LIM = limitesOnline('cancion');

const router = express.Router();

export const DURACION_MS = 30000;
export const RESPUESTA_MS = 20000;
const PTS_MAX = 10;
const PTS_MIN = 3;
const PTS_FALLO = 3;
const RONDAS_PERMITIDAS = [10, 15, 20];
const MAX_JUGADORES = LIM.max;

export function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Título sin añadidos entre paréntesis o tras un guion («(Remix)», «- Live»…)
const tituloBase = (t) => normalizar(String(t).replace(/\(.*?\)|\[.*?\]/g, ' ').split(/ - | – /)[0]);

// Arreglo: varias canciones tenían como alias el nombre del artista («queen», «oasis»…),
// así que bastaba con decir el artista para acertar. Esos alias se descartan al cargar.
const nombresArtista = (artista) =>
  String(artista).split(/&|,|\/| y | x | feat\.? | ft\.? | con /i).map(normalizar).filter(Boolean);

// Arreglo: había unas 30 canciones repetidas (mismo título y artista con distinto id),
// que salían el doble de veces. Se quedan solo una vez.
const vistas = new Set();
const TODAS_LAS_CANCIONES = [...parte1, ...parte2, ...parte3, ...parte4, ...parte5, ...parte6]
  .filter((c) => {
    const clave = `${tituloBase(c.titulo).replace(/^una /, '')}|${nombresArtista(c.artista)[0]}`;
    if (vistas.has(clave)) return false;
    vistas.add(clave);
    return true;
  })
  .map((c) => {
    const artistas = nombresArtista(c.artista);
    return { ...c, alias: (c.alias || []).filter((a) => !artistas.includes(normalizar(a)) && normalizar(a) !== normalizar(c.artista)) };
  });

function distanciaLevenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

export function esCoincidente(usuario, cancion) {
  const u = normalizar(usuario);
  if (!u) return false;
  const opciones = [...new Set([cancion.titulo, tituloBase(cancion.titulo), ...(cancion.alias || [])].map(normalizar).filter(Boolean))];
  return opciones.some((opc) => {
    if (u === opc) return true;
    // «monaco de bad bunny» contiene el título completo
    if (opc.length >= 4 && ` ${u} `.includes(` ${opc} `)) return true;
    const dist = distanciaLevenshtein(u, opc);
    const maxL = Math.max(u.length, opc.length);
    if (maxL <= 4) return dist <= 1;
    if (maxL <= 8) return dist <= 2;
    return dist <= 3;
  });
}

const puntosPorTiempo = (ms) => Math.max(PTS_MIN, Math.round(PTS_MAX - ((PTS_MAX - PTS_MIN) * Math.min(ms, DURACION_MS)) / DURACION_MS));

function barajar(array) {
  const c = [...array];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

/* ───────────────────────── Fragmentos de audio ───────────────────────── */

// Busca el fragmento en Deezer intentando que el artista coincida (antes cogía el primer resultado)
async function buscarPreview(cancion) {
  const artistas = nombresArtista(cancion.artista);
  const consultas = [
    `artist:"${cancion.artista.split(/&|,| feat/i)[0].trim()}" track:"${tituloBase(cancion.titulo)}"`,
    `${tituloBase(cancion.titulo)} ${cancion.artista}`
  ];
  for (const q of consultas) {
    try {
      const r = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=10`, { signal: AbortSignal.timeout(6000) });
      const data = await r.json();
      const pistas = (data?.data || []).filter((t) => t.preview && !/instrumental|karaoke|cover|tribute/i.test(`${t.title} ${t.artist?.name}`));
      const buena = pistas.find((t) => artistas.some((a) => normalizar(t.artist?.name).includes(a) || a.includes(normalizar(t.artist?.name))));
      if (buena) return buena.preview;
      if (pistas.length && q === consultas[1]) return pistas[0].preview;
    } catch {
      /* se prueba la siguiente consulta */
    }
  }
  return null;
}

// Fragmentos servidos por este servidor: clave → { url, buffer, tipo, creado }
const fragmentos = new Map();
const CADUCIDAD_MS = 60 * 60 * 1000;

function registrarFragmento(url) {
  const clave = crypto.randomBytes(9).toString('hex');
  fragmentos.set(clave, { url, buffer: null, tipo: 'audio/mpeg', creado: Date.now() });
  // Limpieza sencilla
  if (fragmentos.size > 300) {
    const ahora = Date.now();
    for (const [k, v] of fragmentos) if (ahora - v.creado > CADUCIDAD_MS) fragmentos.delete(k);
  }
  return `/api/cancion/audio/${clave}`;
}

/** Elige una canción no usada que tenga fragmento disponible (prueba varias). */
async function elegirCancion(usados = []) {
  const disponibles = TODAS_LAS_CANCIONES.filter((c) => !usados.includes(c.id));
  const pool = barajar(disponibles.length ? disponibles : TODAS_LAS_CANCIONES).slice(0, 6);
  for (const c of pool) {
    const preview = await buscarPreview(c);
    if (preview) return { cancion: c, audio: registrarFragmento(preview) };
  }
  return null;
}

router.get('/audio/:clave', async (req, res) => {
  const f = fragmentos.get(req.params.clave);
  if (!f) return res.status(404).end();
  try {
    if (!f.buffer) {
      const r = await fetch(f.url, { signal: AbortSignal.timeout(10000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      f.buffer = Buffer.from(await r.arrayBuffer());
      f.tipo = r.headers.get('content-type') || 'audio/mpeg';
    }
    const total = f.buffer.length;
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', f.tipo);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    const rango = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
    if (rango) {
      const inicio = rango[1] ? Number(rango[1]) : 0;
      const fin = rango[2] ? Math.min(Number(rango[2]), total - 1) : total - 1;
      if (inicio >= total) return res.status(416).setHeader('Content-Range', `bytes */${total}`).end();
      res.status(206);
      res.setHeader('Content-Range', `bytes ${inicio}-${fin}/${total}`);
      res.setHeader('Content-Length', fin - inicio + 1);
      return res.end(f.buffer.subarray(inicio, fin + 1));
    }
    res.setHeader('Content-Length', total);
    return res.end(f.buffer);
  } catch (err) {
    console.error('[cancion] No se pudo servir el fragmento:', err.message);
    return res.status(502).end();
  }
});

/* ───────────────────────── Modo local ───────────────────────── */

router.post('/iniciar-ronda', async (req, res) => {
  const usados = Array.isArray(req.body?.usados) ? req.body.usados : [];
  const elegido = await elegirCancion(usados);
  if (!elegido) {
    return res.status(503).json({ success: false, error: 'No se ha podido descargar ninguna canción. Comprueba la conexión a internet del servidor.' });
  }
  res.json({ success: true, id: elegido.cancion.id, audio: elegido.audio, duracionMs: DURACION_MS });
});

router.post('/validar', (req, res) => {
  const { id, respuesta = '', segundo = 0 } = req.body || {};
  const cancion = TODAS_LAS_CANCIONES.find((c) => c.id === id);
  if (!cancion) return res.status(404).json({ success: false, error: 'Canción no encontrada.' });
  const acierto = esCoincidente(respuesta, cancion);
  res.json({
    success: true,
    acierto,
    puntosAcierto: puntosPorTiempo(Number(segundo) * 1000 || 0),
    puntosFallo: PTS_FALLO,
    tituloReal: cancion.titulo,
    artistaReal: cancion.artista
  });
});

router.post('/solucion', (req, res) => {
  const cancion = TODAS_LAS_CANCIONES.find((c) => c.id === req.body?.id);
  if (!cancion) return res.status(404).json({ success: false, error: 'Canción no encontrada.' });
  res.json({ success: true, titulo: cancion.titulo, artista: cancion.artista });
});

/* ───────────────────────── Modo online ───────────────────────── */

const salasOnline = new Map();

function generarCodigo() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let cod = '';
  for (let i = 0; i < 4; i++) cod += letras[Math.floor(Math.random() * letras.length)];
  return cod;
}

const nuevoToken = () => 'tok_' + crypto.randomBytes(12).toString('hex');
const obtenerSala = (code) => salasOnline.get(String(code ?? '').toUpperCase());
const jugadorDe = (sala, token) => sala?.jugadores.find((j) => j.token === token);

// Milisegundos de canción ya sonados
const posicion = (r, ahora = Date.now()) => Math.min(DURACION_MS, r.acumulado + (r.estado === 'sonando' ? ahora - r.inicioTs : 0));

function pausar(r, ahora = Date.now()) {
  if (r.estado === 'sonando') r.acumulado = posicion(r, ahora);
  r.estado = 'pausa';
}

function sonar(r, ahora = Date.now()) {
  r.inicioTs = ahora;
  r.estado = 'sonando';
}

function resolver(sala, tipo, texto) {
  const r = sala.ronda;
  pausar(r);
  r.estado = 'resuelta';
  r.pulsado = null;
  r.solucion = { titulo: r.cancion.titulo, artista: r.cancion.artista };
  r.mensaje = { tipo, texto };
}

async function prepararRonda(sala) {
  const elegido = await elegirCancion(sala.usados);
  if (!elegido) throw new Error('No se ha podido descargar ninguna canción. Comprueba la conexión a internet del servidor.');
  sala.usados.push(elegido.cancion.id);
  sala.jugadores.forEach((j) => { j.bloqueado = false; });
  sala.ronda = {
    cancion: elegido.cancion,
    audio: elegido.audio,
    estado: 'espera', // espera | sonando | pausa | resuelta
    acumulado: 0,
    inicioTs: null,
    pulsado: null, // { jugadorId, nombre, texto, finTs, ms }
    mensaje: null,
    solucion: null,
    aciertos: {} // jugadorId -> puntos sumados en la ronda (negativos si falla)
  };
}

/** Avances automáticos que dependen del tiempo: fin del fragmento y tiempo de respuesta agotado. */
function revisarTiempo(sala) {
  const r = sala.ronda;
  if (!r || sala.estado !== 'jugando') return;
  const ahora = Date.now();
  if (r.pulsado && ahora >= r.pulsado.finTs) {
    fallar(sala, sala.jugadores.find((j) => j.id === r.pulsado.jugadorId), true);
  }
  if (r.estado === 'sonando' && posicion(r, ahora) >= DURACION_MS) {
    resolver(sala, 'nadie', 'Se acabó la canción y nadie la ha adivinado.');
  }
}

function fallar(sala, jugador, porTiempo = false) {
  const r = sala.ronda;
  if (!jugador) { r.pulsado = null; return; }
  jugador.puntos = Math.max(0, jugador.puntos - PTS_FALLO);
  jugador.bloqueado = true;
  r.aciertos[jugador.id] = (r.aciertos[jugador.id] || 0) - PTS_FALLO;
  r.pulsado = null;
  const quedan = sala.jugadores.filter((j) => !j.bloqueado);
  if (!quedan.length) {
    resolver(sala, 'fallo', `¡Han fallado todos! (${jugador.nombre} −${PTS_FALLO})`);
  } else {
    r.mensaje = { tipo: 'fallo', texto: `${porTiempo ? '¡Se acabó el tiempo!' : '¡Incorrecto!'} ${jugador.nombre} −${PTS_FALLO}. ¡Rebote para el resto!` };
    sonar(r); // la canción sigue para los demás
  }
}

function vistaSala(sala, jugador) {
  const r = sala.ronda;
  const ahora = Date.now();
  return {
    success: true,
    code: sala.code,
    estado: sala.estado,
    esAdmin: sala.adminToken === jugador.token,
    anfitrionId: sala.jugadores.find((j) => j.token === sala.adminToken)?.id ?? null,
    yoId: jugador.id,
    rondaNum: sala.rondaNum,
    totalRondas: sala.totalRondas,
    ahora,
    jugadores: sala.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, bloqueado: j.bloqueado })),
    ronda: r
      ? {
          estado: r.estado,
          audio: r.audio,
          posicionMs: posicion(r, ahora),
          duracionMs: DURACION_MS,
          pulsado: r.pulsado ? { ...r.pulsado, restanteMs: Math.max(0, r.pulsado.finTs - ahora) } : null,
          mensaje: r.mensaje,
          solucion: r.solucion,
          aciertos: r.estado === 'resuelta' ? r.aciertos : null
        }
      : null
  };
}

router.post('/online/crear', (req, res) => {
  const nombre = String(req.body?.nombre ?? '').trim().slice(0, 20);
  if (!nombre) return res.status(400).json({ error: 'Nombre requerido.' });
  let code = generarCodigo();
  while (salasOnline.has(code)) code = generarCodigo();
  const token = nuevoToken();
  salasOnline.set(code, {
    code,
    estado: 'lobby',
    adminToken: token,
    rondaNum: 1,
    totalRondas: RONDAS_PERMITIDAS.includes(Number(req.body?.rondas)) ? Number(req.body.rondas) : 15,
    usados: [],
    jugadores: [{ id: 1, nombre, token, puntos: 0, bloqueado: false }],
    ronda: null,
    creada: Date.now()
  });
  res.json({ success: true, code, token });
});

router.post('/online/unirse', (req, res) => {
  const sala = obtenerSala(req.body?.code);
  const nombre = String(req.body?.nombre ?? '').trim().slice(0, 20);
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada.' });
  if (!nombre) return res.status(400).json({ error: 'Nombre requerido.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha comenzado.' });
  if (sala.jugadores.length >= LIM.max) return res.status(400).json({ error: `La sala está llena (máx. ${LIM.max}).` });
  if (sala.jugadores.some((j) => normalizar(j.nombre) === normalizar(nombre))) return res.status(400).json({ error: 'Ya hay un jugador con ese nombre.' });
  const token = nuevoToken();
  // Arreglo: el id ya no se repite aunque alguien haya salido de la sala
  const id = Math.max(0, ...sala.jugadores.map((j) => j.id)) + 1;
  sala.jugadores.push({ id, nombre, token, puntos: 0, bloqueado: false });
  res.json({ success: true, code: sala.code, token });
});

router.get('/online/sala/:code', (req, res) => {
  const sala = obtenerSala(req.params.code);
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada.' });
  const jugador = jugadorDe(sala, req.query.token);
  if (!jugador) return res.status(401).json({ error: 'Token no válido.' });
  revisarTiempo(sala);
  res.json(vistaSala(sala, jugador));
});

const soloAnfitrion = (req, res) => {
  const sala = obtenerSala(req.params.code);
  if (!sala || sala.adminToken !== req.body?.token) { res.status(403).json({ error: 'Solo el anfitrión puede hacer eso.' }); return null; }
  return sala;
};

router.post('/online/sala/:code/iniciar', async (req, res) => {
  const sala = soloAnfitrion(req, res);
  if (!sala) return;
  if (sala.jugadores.length < LIM.min) return res.status(400).json({ error: `Se necesitan al menos ${LIM.min} jugadores.` });
  sala.estado = 'cargando';
  sala.rondaNum = 1;
  sala.usados = [];
  sala.jugadores.forEach((j) => { j.puntos = 0; });
  try {
    await prepararRonda(sala);
    sala.estado = 'jugando';
    res.json({ success: true });
  } catch (err) {
    sala.estado = 'lobby';
    res.status(503).json({ error: err.message });
  }
});

// Empezar / pausar / reanudar la canción (solo el anfitrión; antes cualquiera podía)
router.post('/online/sala/:code/reproducir', (req, res) => {
  const sala = soloAnfitrion(req, res);
  if (!sala) return;
  const r = sala.ronda;
  if (!r || r.estado === 'resuelta' || r.pulsado) return res.status(400).json({ error: 'Ahora no se puede.' });
  if (r.estado === 'sonando') pausar(r); else sonar(r);
  res.json({ success: true });
});

router.post('/online/sala/:code/pulsar', (req, res) => {
  const sala = obtenerSala(req.params.code);
  revisarTiempo(sala);
  const r = sala?.ronda;
  if (!r || r.estado === 'resuelta' || r.estado === 'espera') return res.status(400).json({ error: 'Ahora no se puede pulsar.' });
  const jugador = jugadorDe(sala, req.body?.token);
  if (!jugador || jugador.bloqueado) return res.status(403).json({ error: 'Ya has fallado en esta ronda.' });
  if (r.pulsado) return res.status(409).json({ error: `${r.pulsado.nombre} ha pulsado antes.` });
  const ms = posicion(r);
  pausar(r);
  r.pulsado = { jugadorId: jugador.id, nombre: jugador.nombre, texto: '', ms, finTs: Date.now() + RESPUESTA_MS };
  r.mensaje = null;
  res.json({ success: true });
});

router.post('/online/sala/:code/teclear', (req, res) => {
  const sala = obtenerSala(req.params.code);
  const jugador = jugadorDe(sala, req.body?.token);
  if (sala?.ronda?.pulsado && sala.ronda.pulsado.jugadorId === jugador?.id) {
    sala.ronda.pulsado.texto = String(req.body?.texto ?? '').slice(0, 80);
  }
  res.json({ success: true });
});

router.post('/online/sala/:code/responder', (req, res) => {
  const sala = obtenerSala(req.params.code);
  revisarTiempo(sala);
  const r = sala?.ronda;
  if (!r || !r.pulsado) return res.status(400).json({ error: 'Se acabó tu turno.' });
  const jugador = jugadorDe(sala, req.body?.token);
  if (!jugador || r.pulsado.jugadorId !== jugador.id) return res.status(403).json({ error: 'No es tu turno.' });

  const respuesta = String(req.body?.respuesta ?? '');
  const acierto = esCoincidente(respuesta, r.cancion);
  if (acierto) {
    const pts = puntosPorTiempo(r.pulsado.ms);
    jugador.puntos += pts;
    r.aciertos[jugador.id] = (r.aciertos[jugador.id] || 0) + pts;
    resolver(sala, 'acierto', `¡${jugador.nombre} la ha acertado en ${Math.max(1, Math.round(r.pulsado.ms / 1000))} s! +${pts} puntos`);
  } else {
    fallar(sala, jugador);
  }
  res.json({ success: true, acierto });
});

// Rendirse y ver la solución (solo el anfitrión)
router.post('/online/sala/:code/solucion', (req, res) => {
  const sala = soloAnfitrion(req, res);
  if (!sala) return;
  if (!sala.ronda || sala.ronda.estado === 'resuelta') return res.json({ success: true });
  resolver(sala, 'info', 'El anfitrión ha revelado la solución.');
  res.json({ success: true });
});

router.post('/online/sala/:code/siguiente-ronda', async (req, res) => {
  const sala = soloAnfitrion(req, res);
  if (!sala) return;
  if (sala.rondaNum >= sala.totalRondas) {
    sala.estado = 'final';
    return res.json({ success: true });
  }
  try {
    sala.estado = 'cargando';
    await prepararRonda(sala);
    sala.rondaNum += 1;
    sala.estado = 'jugando';
    res.json({ success: true });
  } catch (err) {
    sala.estado = 'jugando';
    res.status(503).json({ error: err.message });
  }
});

router.post('/online/sala/:code/finalizar', (req, res) => {
  const sala = soloAnfitrion(req, res);
  if (!sala) return;
  sala.estado = 'final';
  if (sala.ronda && sala.ronda.estado !== 'resuelta') pausar(sala.ronda);
  res.json({ success: true });
});

router.post('/online/sala/:code/reiniciar', (req, res) => {
  const sala = soloAnfitrion(req, res);
  if (!sala) return;
  sala.estado = 'lobby';
  sala.ronda = null;
  sala.rondaNum = 1;
  sala.jugadores.forEach((j) => { j.puntos = 0; j.bloqueado = false; });
  res.json({ success: true });
});

router.post('/online/sala/:code/salir', (req, res) => {
  const sala = obtenerSala(req.params.code);
  if (sala) {
    const saliente = jugadorDe(sala, req.body?.token);
    sala.jugadores = sala.jugadores.filter((j) => j.token !== req.body?.token);
    if (!sala.jugadores.length) {
      salasOnline.delete(sala.code);
    } else {
      // Arreglo: si sale el anfitrión, el mando pasa a otro jugador (antes la sala se quedaba sin anfitrión)
      if (sala.adminToken === req.body?.token) sala.adminToken = sala.jugadores[0].token;
      // Si estaba respondiendo, se libera el turno y sigue la canción
      if (saliente && sala.ronda?.pulsado?.jugadorId === saliente.id) {
        sala.ronda.pulsado = null;
        if (sala.ronda.estado === 'pausa') sonar(sala.ronda);
      }
      if (sala.ronda && sala.ronda.estado !== 'resuelta' && sala.jugadores.every((j) => j.bloqueado)) {
        resolver(sala, 'fallo', '¡Han fallado todos!');
      }
    }
  }
  res.json({ success: true });
});

// Limpieza de salas viejas
setInterval(() => {
  const ahora = Date.now();
  for (const [code, s] of salasOnline) if (ahora - (s.creada || 0) > 8 * 3600 * 1000) salasOnline.delete(code);
}, 30 * 60 * 1000).unref();

export default router;
