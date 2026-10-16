// server/routes/adivina.js
import { Router } from 'express';
import { CANCIONES, PELICULAS } from '../data/seeds/adivina/adivina.seed.js';
import { barajar } from '../lib/barajar.js';

const router = Router();
const cacheAudio = new Map();

async function obtenerAudioPreview(titulo, artista) {
  const clave = `${titulo}-${artista}`.toLowerCase();
  if (cacheAudio.has(clave)) return cacheAudio.get(clave);

  try {
    const qInst = encodeURIComponent(`${titulo} ${artista} instrumental`);
    let res = await fetch(`https://itunes.apple.com/search?term=${qInst}&entity=song&limit=3`);
    let data = await res.json();
    let preview = data.results?.find((r) => r.previewUrl)?.previewUrl;

    if (!preview) {
      const qOrig = encodeURIComponent(`${titulo} ${artista}`);
      res = await fetch(`https://itunes.apple.com/search?term=${qOrig}&entity=song&limit=1`);
      data = await res.json();
      preview = data.results?.[0]?.previewUrl || null;
    }

    if (preview) cacheAudio.set(clave, preview);
    return preview;
  } catch {
    return null;
  }
}

function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

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

function sonParecidas(strA, strB) {
  const maxLen = Math.max(strA.length, strB.length);
  if (maxLen === 0) return false;
  const dist = distanciaLevenshtein(strA, strB);
  if (maxLen <= 4) return dist <= 1;
  if (maxLen <= 8) return dist <= 2;
  return dist <= 3;
}

function esCoincidencia(usuario, objetivo) {
  const u = normalizar(usuario);
  const o = normalizar(objetivo);
  if (!u || !o) return false;
  if (u === o) return true;
  if (sonParecidas(u, o)) return true;
  if (u.length >= 4 && (o.includes(u) || u.includes(o))) return true;
  return false;
}

// ==========================================
// ENDPOINTS OFFLINE / LOCAL (INTACTOS)
// ==========================================
router.post('/iniciar-ronda', async (req, res) => {
  const { modo, usados = [] } = req.body ?? {};
  const coleccion = modo === 'canciones' ? CANCIONES : PELICULAS;
  const disponibles = coleccion.filter((item) => !usados.includes(item.id));
  const pool = disponibles.length > 0 ? disponibles : coleccion;
  const elegido = barajar([...pool])[0];

  let audioUrl = null;
  if (modo === 'canciones') {
    audioUrl = await obtenerAudioPreview(elegido.titulo, elegido.artista);
  }

  res.json({
    id: elegido.id,
    modo,
    pista1: modo === 'canciones' ? elegido.frase : elegido.protagonistas,
    pista2: modo === 'canciones' ? `${elegido.artista} (${elegido.año})` : `${elegido.genero} (${elegido.año})`,
    pista3: modo === 'canciones' ? audioUrl : elegido.sinopsis
  });
});

router.post('/validar', (req, res) => {
  const { modo, id, respuesta } = req.body ?? {};
  const coleccion = modo === 'canciones' ? CANCIONES : PELICULAS;
  const item = coleccion.find((x) => x.id === id);

  if (!item) return res.status(404).json({ error: 'Ronda no encontrada' });

  const opciones = [item.titulo, ...(item.alias ?? [])];
  const acierto = opciones.some((opc) => esCoincidencia(respuesta, opc));

  res.json({
    acierto,
    tituloReal: item.titulo,
    mensaje: acierto ? `¡Correcto! Era "${item.titulo}"` : 'Respuesta incorrecta'
  });
});

router.post('/solucion', (req, res) => {
  const { modo, id } = req.body ?? {};
  const coleccion = modo === 'canciones' ? CANCIONES : PELICULAS;
  const item = coleccion.find((x) => x.id === id);

  if (!item) return res.status(404).json({ error: 'Ronda no encontrada' });

  res.json({
    titulo: item.titulo,
    extra: modo === 'canciones' ? `${item.artista} (${item.año})` : `${item.genero} (${item.año})`
  });
});

// ==========================================
// SALAS ONLINE (MULTIDISPOSITIVO CON PULSADOR)
// ==========================================
const salasOnline = {};

function generarCodigoSala() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 4; i++) {
    c += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return c;
}

function generarToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

async function prepararNuevaRondaOnline(sala) {
  const coleccion = sala.modo === 'canciones' ? CANCIONES : PELICULAS;
  const disponibles = coleccion.filter((item) => !sala.usados.includes(item.id));
  const pool = disponibles.length > 0 ? disponibles : coleccion;
  const elegido = barajar([...pool])[0];
  sala.usados.push(elegido.id);

  let audioUrl = null;
  if (sala.modo === 'canciones') {
    audioUrl = await obtenerAudioPreview(elegido.titulo, elegido.artista);
  }

  sala.ronda = {
    id: elegido.id,
    item: elegido,
    pistaActual: 1, // 1, 2, 3
    pista1: sala.modo === 'canciones' ? elegido.frase : elegido.protagonistas,
    pista2: sala.modo === 'canciones' ? `${elegido.artista} (${elegido.año})` : `${elegido.genero} (${elegido.año})`,
    pista3: sala.modo === 'canciones' ? audioUrl : elegido.sinopsis,
    bloqueados: [],
    pulsado: null, // { jugadorId, nombre, texto }
    estadoRonda: 'activa', // 'activa' | 'resuelta'
    solucion: null,
    extra: null,
    mensaje: null
  };
}

// 1. Crear sala online
router.post('/online/crear', (req, res) => {
  const nombre = (req.body?.nombre || '').trim();
  if (!nombre) return res.status(400).json({ error: 'Debes indicar un nombre.' });

  let code = generarCodigoSala();
  while (salasOnline[code]) code = generarCodigoSala();

  const tokenAdmin = generarToken();

  salasOnline[code] = {
    code,
    adminToken: tokenAdmin,
    estado: 'lobby', // 'lobby' | 'jugando' | 'final'
    modo: 'canciones', // 'canciones' | 'peliculas'
    rondaNum: 1,
    usados: [],
    jugadores: [{ id: 1, token: tokenAdmin, nombre, puntos: 0, conectado: true }],
    ronda: null
  };

  res.json({ success: true, code, token: tokenAdmin, jugadorId: 1 });
});

// 2. Unirse a sala online
router.post('/online/unirse', (req, res) => {
  const code = (req.body?.code || '').trim().toUpperCase();
  const nombre = (req.body?.nombre || '').trim();

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe o el código es incorrecto.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha comenzado.' });
  if (sala.jugadores.length >= 15) return res.status(400).json({ error: 'La sala está llena.' });
  if (sala.jugadores.some((j) => j.nombre.toLowerCase() === nombre.toLowerCase())) {
    return res.status(400).json({ error: 'Ya hay un jugador con ese nombre en la sala.' });
  }

  const token = generarToken();
  const nuevoId = sala.jugadores.length + 1;
  sala.jugadores.push({ id: nuevoId, token, nombre, puntos: 0, conectado: true });

  res.json({ success: true, code, token, jugadorId: nuevoId });
});

// 3. Cambiar modalidad (sólo anfitrión en el lobby)
router.post('/online/sala/:code/modo', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, modo } = req.body || {};
  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  sala.modo = modo === 'peliculas' ? 'peliculas' : 'canciones';
  res.json({ success: true, modo: sala.modo });
});

// 4. Estado de la sala
router.get('/online/sala/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const token = req.query.token;

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe o ha caducado.' });

  const jugadorActual = sala.jugadores.find((j) => j.token === token);
  if (!jugadorActual) return res.status(403).json({ error: 'No perteneces a esta sala.' });

  const esAdmin = sala.adminToken === token;

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    modo: sala.modo,
    esAdmin,
    yoId: jugadorActual.id,
    rondaNum: sala.rondaNum,
    jugadores: sala.jugadores.map((j) => ({
      id: j.id,
      nombre: j.nombre,
      puntos: j.puntos,
      bloqueado: sala.ronda ? sala.ronda.bloqueados.includes(j.id) : false
    })),
    ronda: sala.ronda ? {
      id: sala.ronda.id,
      pistaActual: sala.ronda.pistaActual,
      pista1: sala.ronda.pista1,
      pista2: sala.ronda.pista2,
      pista3: sala.ronda.pista3,
      bloqueados: sala.ronda.bloqueados,
      pulsado: sala.ronda.pulsado,
      estadoRonda: sala.ronda.estadoRonda,
      solucion: sala.ronda.solucion,
      extra: sala.ronda.extra,
      mensaje: sala.ronda.mensaje
    } : null
  });
});

// 5. Iniciar partida desde el lobby (sólo anfitrión)
router.post('/online/sala/:code/iniciar', async (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede iniciar.' });

  sala.estado = 'jugando';
  sala.rondaNum = 1;
  sala.usados = [];
  sala.jugadores.forEach((j) => { j.puntos = 0; });
  await prepararNuevaRondaOnline(sala);

  res.json({ success: true });
});

// 6. Avanzar pista (1 -> 2 -> 3)
router.post('/online/sala/:code/pista-siguiente', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || !sala.ronda) return res.status(404).json({ error: 'Ronda no activa.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede avanzar de pista.' });

  if (sala.ronda.pistaActual < 3) {
    sala.ronda.pistaActual += 1;
  }
  res.json({ success: true, pistaActual: sala.ronda.pistaActual });
});

// 7. Pulsador rojo online
router.post('/online/sala/:code/pulsar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || !sala.ronda) return res.status(404).json({ error: 'Partida no activa.' });

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador) return res.status(403).json({ error: 'Jugador no válido.' });

  if (sala.ronda.estadoRonda !== 'activa') return res.status(400).json({ error: 'La ronda ya terminó.' });
  if (sala.ronda.pulsado !== null) return res.status(409).json({ error: 'Otro jugador ya ha pulsado.' });
  if (sala.ronda.bloqueados.includes(jugador.id)) return res.status(403).json({ error: 'Ya has fallado en esta ronda.' });

  sala.ronda.pulsado = {
    jugadorId: jugador.id,
    nombre: jugador.nombre,
    texto: ''
  };
  sala.ronda.mensaje = {
    tipo: 'info',
    texto: `¡${jugador.nombre} ha pulsado el botón! Está respondiendo...`
  };

  res.json({ success: true });
});

// 8. Transmisión de tecleo en vivo
router.post('/online/sala/:code/teclear', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, texto } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || !sala.ronda || !sala.ronda.pulsado) return res.json({ success: true });

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador || sala.ronda.pulsado.jugadorId !== jugador.id) return res.json({ success: true });

  sala.ronda.pulsado.texto = String(texto || '').slice(0, 100);
  res.json({ success: true });
});

// 9. Responder y validar online
router.post('/online/sala/:code/responder', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, respuesta } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || !sala.ronda || !sala.ronda.pulsado) return res.status(400).json({ error: 'No hay turno para responder.' });

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador || sala.ronda.pulsado.jugadorId !== jugador.id) return res.status(403).json({ error: 'No es tu turno de responder.' });

  const item = sala.ronda.item;
  const opciones = [item.titulo, ...(item.alias ?? [])];
  const acierto = opciones.some((opc) => esCoincidencia(respuesta, opc));
  const ptsGanados = sala.ronda.pistaActual === 1 ? 10 : sala.ronda.pistaActual === 2 ? 5 : 3;

  if (acierto) {
    jugador.puntos += ptsGanados;
    sala.ronda.estadoRonda = 'resuelta';
    sala.ronda.solucion = item.titulo;
    sala.ronda.extra = sala.modo === 'canciones' ? `${item.artista} (${item.año})` : `${item.genero} (${item.año})`;
    sala.ronda.mensaje = {
      tipo: 'success',
      texto: `¡Correcto! ${jugador.nombre} acertó "${item.titulo}" (+${ptsGanados} pts)`
    };
    sala.ronda.pulsado = null;
  } else {
    sala.ronda.bloqueados.push(jugador.id);
    sala.ronda.pulsado = null;

    if (sala.ronda.bloqueados.length >= sala.jugadores.length) {
      sala.ronda.estadoRonda = 'resuelta';
      sala.ronda.solucion = item.titulo;
      sala.ronda.extra = sala.modo === 'canciones' ? `${item.artista} (${item.año})` : `${item.genero} (${item.año})`;
      sala.ronda.mensaje = {
        tipo: 'error',
        texto: `Todos los jugadores han fallado. Era "${item.titulo}"`
      };
    } else {
      sala.ronda.mensaje = {
        tipo: 'error',
        texto: `¡${jugador.nombre} ha fallado! Queda fuera de esta ronda.`
      };
    }
  }

  res.json({ success: true, acierto });
});

// 10. Rendirse / solución
router.post('/online/sala/:code/solucion', (req, res) => {
  const code = req.params.code.toUpperCase();
  const sala = salasOnline[code];
  if (!sala || !sala.ronda) return res.status(404).json({ error: 'Ronda no activa.' });

  const item = sala.ronda.item;
  sala.ronda.estadoRonda = 'resuelta';
  sala.ronda.solucion = item.titulo;
  sala.ronda.extra = sala.modo === 'canciones' ? `${item.artista} (${item.año})` : `${item.genero} (${item.año})`;
  sala.ronda.mensaje = {
    tipo: 'error',
    texto: `Os habéis rendido. Era: "${item.titulo}"`
  };
  sala.ronda.pulsado = null;

  res.json({ success: true });
});

// 11. Siguiente ronda online
router.post('/online/sala/:code/siguiente-ronda', async (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede avanzar.' });

  sala.rondaNum += 1;
  await prepararNuevaRondaOnline(sala);
  res.json({ success: true });
});

// 12. Finalizar partida y ver podio
router.post('/online/sala/:code/finalizar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'final';
  res.json({ success: true });
});

// 13. Reiniciar
router.post('/online/sala/:code/reiniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'lobby';
  sala.rondaNum = 1;
  sala.usados = [];
  sala.ronda = null;
  sala.jugadores.forEach((j) => { j.puntos = 0; });

  res.json({ success: true });
});

// 14. Salir
router.post('/online/sala/:code/salir', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.json({ success: true });

  const idx = sala.jugadores.findIndex((j) => j.token === token);
  if (idx !== -1) {
    sala.jugadores.splice(idx, 1);
    if (sala.jugadores.length === 0) {
      delete salasOnline[code];
    } else if (sala.adminToken === token) {
      sala.adminToken = sala.jugadores[0].token;
    }
  }

  res.json({ success: true });
});

export default router;