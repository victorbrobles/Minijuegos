// server/routes/colores.js
import express from 'express';
import parte1 from '../data/seeds/colores/parte1.js';
import parte2 from '../data/seeds/colores/parte2.js';
import parte3 from '../data/seeds/colores/parte3.js';
import parte4 from '../data/seeds/colores/parte4.js';
import parte5 from '../data/seeds/colores/parte5.js';
import parte6 from '../data/seeds/colores/parte6.js';
import { limitesOnline } from '../../client/src/games/limites.js';
const LIM = limitesOnline('colores');

const router = express.Router();
const TODOS_LOS_CASOS = [...parte1, ...parte2, ...parte3, ...parte4, ...parte5, ...parte6];
const PALETA = ['rojo', 'azul', 'amarillo', 'verde', 'naranja', 'morado', 'marron', 'blanco', 'negro', 'gris', 'rosa'];
const RONDAS_PERMITIDAS = [10, 15, 20];
const SEGUNDOS_RESPUESTA = 45;
const MAX_JUGADORES = LIM.max;

const prepararCaso = (item) => ({ id: item.id, item: item.item, numColores: item.colores.length, colores: item.colores });

/** Limpia la selección: solo colores de la paleta, sin repetir y como mucho los que pide la ronda. */
function limpiarSeleccion(colores, max) {
  if (!Array.isArray(colores)) return null;
  const unicos = [...new Set(colores.filter((c) => PALETA.includes(c)))];
  return unicos.slice(0, max);
}

function barajarArray(arr) {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

// ==========================================
// ENDPOINT OFFLINE / LOCAL (INTACTO)
// ==========================================
router.get('/preguntas', (req, res) => {
  try {
    const n = RONDAS_PERMITIDAS.includes(Number(req.query.n)) ? Number(req.query.n) : 15;
    const seleccionados = barajarArray(TODOS_LOS_CASOS).slice(0, n).map(prepararCaso);

    res.json({
      success: true,
      total: seleccionados.length,
      preguntas: seleccionados
    });
  } catch (error) {
    console.error('Error al obtener preguntas de Colores:', error);
    res.status(500).json({ success: false, error: 'Error del servidor' });
  }
});

// ==========================================
// SALAS ONLINE (MULTIDISPOSITIVO CON RESPUESTA SIMULTÁNEA)
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

function prepararRondaOnline(sala) {
  const casoActual = sala.preguntas[sala.rondaActualIdx % sala.preguntas.length];

  sala.ronda = {
    id: casoActual.id,
    item: casoActual.item,
    numColores: casoActual.numColores,
    coloresCorrectos: casoActual.colores,
    respuestas: {}, // { [jugadorId]: ['azul', 'rojo'] }
    finTs: Date.now() + SEGUNDOS_RESPUESTA * 1000, // al acabar el tiempo la ronda se cierra sola
    estadoRonda: 'votando', // 'votando' | 'resultado'
    resultadoRonda: null
  };
}

function calcularResultadosOnline(sala) {
  const r = sala.ronda;
  const correctosSet = new Set(r.coloresCorrectos);
  const desglose = [];

  sala.jugadores.forEach((j) => {
    const elegidos = r.respuestas[j.id] || [];
    let aciertos = 0;

    elegidos.forEach((col) => {
      if (correctosSet.has(col)) {
        aciertos += 1;
      }
    });

    j.puntos = (j.puntos || 0) + aciertos;

    desglose.push({
      id: j.id,
      jugador: j.nombre,
      elegidos,
      aciertos,
      pleno: aciertos === r.coloresCorrectos.length,
      respondio: Boolean(r.respuestas[j.id])
    });
  });

  r.resultadoRonda = {
    desglose,
    coloresCorrectos: r.coloresCorrectos,
    item: r.item
  };
  r.estadoRonda = 'resultado';
}

// 1. Crear sala online
router.post('/online/crear', (req, res) => {
  const nombre = (req.body?.nombre || '').trim().slice(0, 20);
  if (!nombre) return res.status(400).json({ error: 'Debes indicar un nombre.' });
  const totalRondas = RONDAS_PERMITIDAS.includes(Number(req.body?.rondas)) ? Number(req.body.rondas) : 15;

  let code = generarCodigoSala();
  while (salasOnline[code]) code = generarCodigoSala();

  const tokenAdmin = generarToken();
  const barajados = barajarArray(TODOS_LOS_CASOS).slice(0, totalRondas).map(prepararCaso);

  salasOnline[code] = {
    code,
    adminToken: tokenAdmin,
    estado: 'lobby', // 'lobby' | 'jugando' | 'final'
    rondaActualIdx: 0,
    totalRondas,
    preguntas: barajados,
    jugadores: [{ id: 1, token: tokenAdmin, nombre, puntos: 0, conectado: true }],
    ronda: null
  };

  res.json({ success: true, code, token: tokenAdmin, jugadorId: 1 });
});

// 2. Unirse a sala online
router.post('/online/unirse', (req, res) => {
  const code = (req.body?.code || '').trim().toUpperCase();
  const nombre = (req.body?.nombre || '').trim().slice(0, 20);
  if (!nombre) return res.status(400).json({ error: 'Debes indicar un nombre.' });

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe o el código es incorrecto.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha comenzado.' });
  if (sala.jugadores.length >= LIM.max) return res.status(400).json({ error: `La sala está llena (máx. ${LIM.max}).` });
  if (sala.jugadores.some((j) => j.nombre.toLowerCase() === nombre.toLowerCase())) {
    return res.status(400).json({ error: 'Ya hay un jugador con ese nombre en la sala.' });
  }

  const token = generarToken();
  // El id no se repite aunque alguien haya salido de la sala
  const nuevoId = Math.max(0, ...sala.jugadores.map((j) => j.id)) + 1;
  sala.jugadores.push({ id: nuevoId, token, nombre, puntos: 0, conectado: true });

  res.json({ success: true, code, token, jugadorId: nuevoId });
});

// 3. Iniciar partida desde el lobby (sólo anfitrión)
router.post('/online/sala/:code/iniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede iniciar.' });

  if (sala.jugadores.length < LIM.min) return res.status(400).json({ error: `Se necesitan al menos ${LIM.min} jugadores.` });

  sala.estado = 'jugando';
  sala.rondaActualIdx = 0;
  sala.preguntas = barajarArray(TODOS_LOS_CASOS).slice(0, sala.totalRondas).map(prepararCaso);
  sala.jugadores.forEach((j) => { j.puntos = 0; });
  prepararRondaOnline(sala);

  res.json({ success: true });
});

// 4. Estado sincronizado de la sala
router.get('/online/sala/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const token = req.query.token;

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe o ha caducado.' });

  const jugadorActual = sala.jugadores.find((j) => j.token === token);
  if (!jugadorActual) return res.status(403).json({ error: 'No perteneces a esta sala.' });

  const esAdmin = sala.adminToken === token;
  const r = sala.ronda;
  // Si se acabó el tiempo, la ronda se cierra sola con lo que haya
  if (sala.estado === 'jugando' && r && r.estadoRonda === 'votando' && Date.now() >= r.finTs) {
    calcularResultadosOnline(sala);
  }

  // Filtrado de seguridad: durante la fase de votación no se envían los colores correctos ni los votos de los demás
  let rondaPayload = null;
  if (r) {
    const yaRespondio = Boolean(r.respuestas[jugadorActual.id]);
    const miSeleccion = r.respuestas[jugadorActual.id] || [];

    rondaPayload = {
      item: r.item,
      numColores: r.numColores,
      estadoRonda: r.estadoRonda,
      yaRespondio,
      miSeleccion,
      totalRespondieron: Object.keys(r.respuestas).length,
      totalJugadores: sala.jugadores.length,
      restanteMs: r.estadoRonda === 'votando' ? Math.max(0, r.finTs - Date.now()) : 0,
      resultadoRonda: r.estadoRonda === 'resultado' ? r.resultadoRonda : null
    };
  }

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    esAdmin,
    yoId: jugadorActual.id,
    anfitrionId: sala.jugadores.find((j) => j.token === sala.adminToken)?.id ?? null,
    rondaActualIdx: sala.rondaActualIdx,
    totalRondas: sala.totalRondas,
    jugadores: sala.jugadores.map((j) => ({
      id: j.id,
      nombre: j.nombre,
      puntos: j.puntos,
      haRespondido: r ? Boolean(r.respuestas[j.id]) : false
    })),
    ronda: rondaPayload
  });
});

// 5. Enviar selección de colores
router.post('/online/sala/:code/responder', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, colores } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || !sala.ronda || sala.ronda.estadoRonda !== 'votando') {
    return res.status(400).json({ error: 'Fase de selección no activa.' });
  }

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador) return res.status(403).json({ error: 'Jugador no válido.' });

  // Arreglo: antes, si se acababa el tiempo con la selección incompleta, la respuesta se rechazaba
  // y el jugador se quedaba sin responder; además se podían repetir colores para puntuar doble.
  const seleccion = limpiarSeleccion(colores, sala.ronda.numColores);
  if (!seleccion) return res.status(400).json({ error: 'Selección no válida.' });
  if (sala.ronda.respuestas[jugador.id]) return res.status(400).json({ error: 'Ya has respondido en esta ronda.' });

  sala.ronda.respuestas[jugador.id] = seleccion;

  // Si todos los jugadores han respondido, calculamos los resultados automáticamente
  if (Object.keys(sala.ronda.respuestas).length >= sala.jugadores.length) {
    calcularResultadosOnline(sala);
  }

  res.json({ success: true });
});

// 6. Cerrar selección manualmente (sólo anfitrión)
router.post('/online/sala/:code/cerrar-ronda', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });
  if (!sala.ronda || sala.ronda.estadoRonda !== 'votando') {
    return res.status(400).json({ error: 'No está en fase de votación.' });
  }

  calcularResultadosOnline(sala);
  res.json({ success: true });
});

// 7. Siguiente ronda online
router.post('/online/sala/:code/siguiente-ronda', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede avanzar.' });

  if (sala.rondaActualIdx + 1 < sala.totalRondas) {
    sala.rondaActualIdx += 1;
    prepararRondaOnline(sala);
  } else {
    sala.estado = 'final';
  }

  res.json({ success: true });
});

// 8. Finalizar partida y ver podio
router.post('/online/sala/:code/finalizar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'final';
  res.json({ success: true });
});

// 9. Reiniciar partida
router.post('/online/sala/:code/reiniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'lobby';
  sala.rondaActualIdx = 0;
  sala.ronda = null;
  sala.jugadores.forEach((j) => { j.puntos = 0; });

  res.json({ success: true });
});

// 10. Salir
router.post('/online/sala/:code/salir', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.json({ success: true });

  const idx = sala.jugadores.findIndex((j) => j.token === token);
  if (idx !== -1) {
    const saliente = sala.jugadores.splice(idx, 1)[0];
    if (sala.ronda) {
      delete sala.ronda.respuestas[saliente.id];
    }

    if (sala.jugadores.length === 0) {
      delete salasOnline[code];
    } else {
      if (sala.adminToken === token) {
        sala.adminToken = sala.jugadores[0].token;
      }
      if (sala.ronda && sala.ronda.estadoRonda === 'votando' && Object.keys(sala.ronda.respuestas).length >= sala.jugadores.length) {
        calcularResultadosOnline(sala);
      }
    }
  }

  res.json({ success: true });
});

export default router;