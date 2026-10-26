// server/routes/cancion.js
import express from 'express';
import parte1 from '../data/seeds/cancion/parte1.js';
import parte2 from '../data/seeds/cancion/parte2.js';
import parte3 from '../data/seeds/cancion/parte3.js';
import parte4 from '../data/seeds/cancion/parte4.js';
import parte5 from '../data/seeds/cancion/parte5.js';

const router = express.Router();
const TODAS_LAS_CANCIONES = [...parte1, ...parte2, ...parte3, ...parte4, ...parte5];

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

function esCoincidente(usuario, cancion) {
  const u = normalizar(usuario);
  if (!u) return false;

  const opciones = [cancion.titulo, ...(cancion.alias || [])].map(normalizar);
  return opciones.some((opc) => {
    if (u === opc) return true;
    const dist = distanciaLevenshtein(u, opc);
    const maxL = Math.max(u.length, opc.length);
    if (maxL <= 4) return dist <= 1;
    if (maxL <= 8) return dist <= 2;
    return dist <= 3;
  });
}

function barajarArray(array) {
  const c = [...array];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

async function obtenerAudioReal(titulo, artista) {
  try {
    const consulta = encodeURIComponent(`${titulo} ${artista}`);
    const respuesta = await fetch(`https://api.deezer.com/search?q=${consulta}&limit=5`);
    const data = await respuesta.json();
    if (data.data && data.data.length > 0) {
      // Intentamos evadir covers/instrumentales si la API devuelve varios
      const pista = data.data.find(t => !/instrumental|cover/i.test(t.title)) || data.data[0];
      return pista.preview;
    }
  } catch (error) {
    console.error('Error al obtener vista previa de Deezer:', error);
  }
  return null;
}

// ==========================================
// RUTAS MODO OFFLINE / LOCAL
// ==========================================
router.post('/iniciar-ronda', async (req, res) => {
  const { usados = [] } = req.body || {};
  const disponibles = TODAS_LAS_CANCIONES.filter((c) => !usados.includes(c.id));
  const pool = disponibles.length > 0 ? disponibles : TODAS_LAS_CANCIONES;
  const elegida = barajarArray(pool)[0];

  const audioReal = await obtenerAudioReal(elegida.titulo, elegida.artista);

  res.json({
    success: true,
    id: elegida.id,
    audio: audioReal || elegida.audio
  });
});

router.post('/validar', (req, res) => {
  const { id, respuesta = '' } = req.body || {};
  const cancion = TODAS_LAS_CANCIONES.find((c) => c.id === id);

  if (!cancion) {
    return res.status(404).json({ success: false, error: 'Canción no encontrada.' });
  }

  const acierto = esCoincidente(respuesta, cancion);
  
  res.json({
    success: true,
    acierto,
    puntosAcierto: 10,
    puntosFallo: 5,
    tituloReal: cancion.titulo,
    artistaReal: cancion.artista
  });
});

router.post('/solucion', (req, res) => {
  const { id } = req.body || {};
  const cancion = TODAS_LAS_CANCIONES.find((c) => c.id === id);

  if (!cancion) {
    return res.status(404).json({ success: false, error: 'Canción no encontrada.' });
  }

  res.json({
    success: true,
    titulo: cancion.titulo,
    artista: cancion.artista
  });
});

// ==========================================
// RUTAS MODO ONLINE
// ==========================================
const salasOnline = new Map();

function generarCodigo() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let cod = '';
  for (let i = 0; i < 4; i++) cod += letras[Math.floor(Math.random() * letras.length)];
  return cod;
}

async function prepararRondaOnline(sala) {
  const disp = TODAS_LAS_CANCIONES.filter((c) => !sala.usados.includes(c.id));
  const pool = disp.length > 0 ? disp : TODAS_LAS_CANCIONES;
  const elegida = barajarArray(pool)[0];

  sala.usados.push(elegida.id);
  sala.jugadores.forEach((j) => (j.bloqueado = false));

  const audioReal = await obtenerAudioReal(elegida.titulo, elegida.artista);

  sala.ronda = {
    id: elegida.id,
    audio: audioReal || elegida.audio,
    cancionReal: elegida,
    estadoRonda: 'activa',
    reproduciendo: false,
    pulsado: null,
    mensaje: null,
    solucion: null
  };
}

router.post('/online/crear', (req, res) => {
  const { nombre } = req.body || {};
  if (!nombre?.trim()) return res.status(400).json({ error: 'Nombre requerido.' });

  let code = generarCodigo();
  while (salasOnline.has(code)) code = generarCodigo();

  const tokenAdmin = 'tok_' + Math.random().toString(36).substring(2);
  const sala = {
    code,
    estado: 'lobby',
    adminToken: tokenAdmin,
    rondaNum: 1,
    usados: [],
    jugadores: [
      { id: 1, nombre: nombre.trim(), token: tokenAdmin, puntos: 0, bloqueado: false }
    ],
    ronda: null
  };

  salasOnline.set(code, sala);
  res.json({ success: true, code, token: tokenAdmin });
});

router.post('/online/unirse', (req, res) => {
  const { code, nombre } = req.body || {};
  const sala = salasOnline.get(code?.toUpperCase());

  if (!sala) return res.status(404).json({ error: 'Sala no encontrada.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha comenzado.' });
  if (sala.jugadores.length >= 20) return res.status(400).json({ error: 'La sala está llena (máx. 20).' });

  const token = 'tok_' + Math.random().toString(36).substring(2);
  const nuevoId = sala.jugadores.length + 1;

  sala.jugadores.push({
    id: nuevoId,
    nombre: nombre?.trim() || `Jugador ${nuevoId}`,
    token,
    puntos: 0,
    bloqueado: false
  });

  res.json({ success: true, code: sala.code, token });
});

router.get('/online/sala/:code', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada.' });

  const token = req.query.token;
  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador) return res.status(401).json({ error: 'Token no válido.' });

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    esAdmin: sala.adminToken === token,
    yoId: jugador.id,
    rondaNum: sala.rondaNum,
    jugadores: sala.jugadores.map((j) => ({
      id: j.id,
      nombre: j.nombre,
      puntos: j.puntos,
      bloqueado: j.bloqueado
    })),
    ronda: sala.ronda
      ? {
          estadoRonda: sala.ronda.estadoRonda,
          audio: sala.ronda.audio,
          reproduciendo: sala.ronda.reproduciendo,
          pulsado: sala.ronda.pulsado,
          mensaje: sala.ronda.mensaje,
          solucion: sala.ronda.solucion
        }
      : null
  });
});

router.post('/online/sala/:code/iniciar', async (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'jugando';
  sala.rondaNum = 1;
  sala.usados = [];
  await prepararRondaOnline(sala);

  res.json({ success: true });
});

router.post('/online/sala/:code/reproducir', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || !sala.ronda) return res.status(404).json({ error: 'Ronda no activa.' });

  // Se convierte en un interruptor Toggle para que el admin pueda pausar manualmente si quiere
  sala.ronda.reproduciendo = !sala.ronda.reproduciendo;
  res.json({ success: true });
});

router.post('/online/sala/:code/pulsar', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || !sala.ronda || sala.ronda.estadoRonda !== 'activa') {
    return res.status(400).json({ error: 'Ronda no disponible.' });
  }

  const jugador = sala.jugadores.find((j) => j.token === req.body?.token);
  if (!jugador || jugador.bloqueado) {
    return res.status(403).json({ error: 'Jugador bloqueado o no válido.' });
  }

  if (sala.ronda.pulsado) return res.status(400).json({ error: 'Alguien ya ha pulsado.' });

  // Detener el audio para todos automáticamente
  sala.ronda.reproduciendo = false;
  sala.ronda.pulsado = {
    jugadorId: jugador.id,
    nombre: jugador.nombre,
    texto: ''
  };

  res.json({ success: true });
});

router.post('/online/sala/:code/teclear', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || !sala.ronda?.pulsado) return res.json({ success: true });

  const jugador = sala.jugadores.find((j) => j.token === req.body?.token);
  if (sala.ronda.pulsado.jugadorId === jugador?.id) {
    sala.ronda.pulsado.texto = req.body?.texto || '';
  }
  res.json({ success: true });
});

router.post('/online/sala/:code/responder', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || !sala.ronda || !sala.ronda.pulsado) {
    return res.status(400).json({ error: 'Sin turno activo.' });
  }

  const jugador = sala.jugadores.find((j) => j.token === req.body?.token);
  if (!jugador || sala.ronda.pulsado.jugadorId !== jugador.id) {
    return res.status(403).json({ error: 'No es tu turno.' });
  }

  const respuesta = req.body?.respuesta || '';
  const acierto = esCoincidente(respuesta, sala.ronda.cancionReal);
  const ptsAcierto = 10;
  const ptsFallo = 5;

  if (acierto) {
    jugador.puntos += ptsAcierto;
    sala.ronda.estadoRonda = 'resuelta';
    sala.ronda.solucion = `${sala.ronda.cancionReal.titulo} — ${sala.ronda.cancionReal.artista}`;
    sala.ronda.mensaje = {
      tipo: 'acierto',
      texto: `¡Correcto! ${jugador.nombre} suma +${ptsAcierto} puntos.`
    };
    sala.ronda.pulsado = null;
  } else {
    jugador.puntos = Math.max(0, jugador.puntos - ptsFallo);
    jugador.bloqueado = true;
    sala.ronda.pulsado = null;

    const activosRestantes = sala.jugadores.filter((j) => !j.bloqueado);
    if (activosRestantes.length === 0) {
      sala.ronda.estadoRonda = 'resuelta';
      sala.ronda.solucion = `${sala.ronda.cancionReal.titulo} — ${sala.ronda.cancionReal.artista}`;
      sala.ronda.mensaje = {
        tipo: 'fallo',
        texto: `¡Han fallado todos! (${jugador.nombre} -${ptsFallo} pts)`
      };
    } else {
      sala.ronda.reproduciendo = true; // Reanudamos el audio automáticamente para el rebote
      sala.ronda.mensaje = {
        tipo: 'fallo',
        texto: `¡Incorrecto! ${jugador.nombre} resta -${ptsFallo} pts. ¡Rebote para el resto!`
      };
    }
  }

  res.json({ success: true, acierto });
});

router.post('/online/sala/:code/solucion', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || !sala.ronda) return res.status(404).json({ error: 'Ronda no activa.' });

  sala.ronda.estadoRonda = 'resuelta';
  sala.ronda.reproduciendo = false;
  sala.ronda.solucion = `${sala.ronda.cancionReal.titulo} — ${sala.ronda.cancionReal.artista}`;
  sala.ronda.mensaje = { tipo: 'info', texto: 'Ronda finalizada por decisión del grupo.' };
  sala.ronda.pulsado = null;

  res.json({ success: true });
});

router.post('/online/sala/:code/siguiente-ronda', async (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  sala.rondaNum += 1;
  await prepararRondaOnline(sala);
  res.json({ success: true });
});

router.post('/online/sala/:code/finalizar', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'final';
  res.json({ success: true });
});

router.post('/online/sala/:code/salir', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (sala) {
    sala.jugadores = sala.jugadores.filter((j) => j.token !== req.body?.token);
    if (sala.jugadores.length === 0) {
      salasOnline.delete(sala.code);
    }
  }
  res.json({ success: true });
});

export default router;