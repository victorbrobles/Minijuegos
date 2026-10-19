// server/routes/conoce.js
import express from 'express';
import crypto from 'crypto';
import { getPreguntaAleatoria } from '../data/seeds/conoce/conoceData.js';

const router = express.Router();
const salas = {};

const MAX_RONDAS = 15;
const generarCodigo = () => Math.random().toString(36).substring(2, 6).toUpperCase();

// Baraja un array
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

router.post('/crear', (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Falta nombre' });

  const code = generarCodigo();
  const token = crypto.randomUUID();

  salas[code] = {
    code,
    estado: 'lobby', // 'lobby' | 'respondiendo' | 'cuenta_atras' | 'adivinando' | 'resultados' | 'fin'
    rondaNum: 1,
    preguntaActual: '',
    preguntasUsadas: [],
    segundosRestantes: 60,
    cuentaAtras10s: 10,
    timer: null,
    respuestas: {}, // { [jugadorId]: string }
    adivinanzas: {}, // { [adivinadorId]: { [targetId]: respuestaSeleccionada } }
    comparaciones: {}, // Resultados de la ronda
    jugadores: [{ id: 1, nombre: nombre.trim(), token, puntos: 0, esAdmin: true }]
  };

  res.json({ success: true, code, token });
});

router.post('/unirse', (req, res) => {
  const { nombre, joinCode } = req.body;
  const sala = salas[joinCode];
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'Partida ya en curso' });
  if (sala.jugadores.length >= 16) return res.status(400).json({ error: 'Sala llena (máximo 16 jugadores)' });

  const token = crypto.randomUUID();
  const newId = sala.jugadores.length > 0 ? Math.max(...sala.jugadores.map(j => j.id)) + 1 : 1;
  sala.jugadores.push({ id: newId, nombre: nombre.trim(), token, puntos: 0, esAdmin: false });

  res.json({ success: true, code: joinCode, token });
});

router.get('/sala/:code', (req, res) => {
  const { code } = req.params;
  const { token } = req.query;
  const sala = salas[code];
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });

  const yo = sala.jugadores.find(j => j.token === token);
  if (!yo) return res.status(403).json({ error: 'No autorizado' });

  // Lista de respuestas desordenadas de todos los demás para la fase de adivinar
  const respuestasDesordenadas = sala.estado === 'adivinando'
    ? Object.entries(sala.respuestas)
        .filter(([idStr]) => Number(idStr) !== yo.id)
        .map(([idStr, texto]) => ({ idTemp: idStr, texto }))
        .sort((a, b) => a.texto.localeCompare(b.texto))
    : [];

  const yaRespondio = Boolean(sala.respuestas[yo.id]);
  const yaAdivino = Boolean(sala.adivinanzas[yo.id] && Object.keys(sala.adivinanzas[yo.id]).length >= sala.jugadores.length - 1);

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    rondaNum: sala.rondaNum,
    maxRondas: MAX_RONDAS,
    preguntaActual: sala.preguntaActual,
    segundosRestantes: sala.segundosRestantes,
    cuentaAtras10s: sala.cuentaAtras10s,
    esAdmin: yo.esAdmin,
    yoId: yo.id,
    yaRespondio,
    yaAdivino,
    miRespuesta: sala.respuestas[yo.id] || '',
    respuestasOpciones: respuestasDesordenadas,
    misComparaciones: sala.comparaciones[yo.id] || [],
    jugadores: sala.jugadores.map(j => ({
      id: j.id,
      nombre: j.nombre,
      puntos: j.puntos,
      haRespondido: Boolean(sala.respuestas[j.id]),
      haAdivinado: Boolean(sala.adivinanzas[j.id] && Object.keys(sala.adivinanzas[j.id]).length >= sala.jugadores.length - 1),
      esTu: j.id === yo.id,
      esAdmin: j.esAdmin
    }))
  });
});

const iniciarRonda = (sala) => {
  if (sala.timer) clearInterval(sala.timer);

  const pregunta = getPreguntaAleatoria(sala.preguntasUsadas);
  sala.preguntaActual = pregunta;
  sala.preguntasUsadas.push(pregunta);
  sala.respuestas = {};
  sala.adivinanzas = {};
  sala.comparaciones = {};
  sala.segundosRestantes = 60;
  sala.estado = 'respondiendo';

  sala.timer = setInterval(() => {
    sala.segundosRestantes -= 1;
    if (sala.segundosRestantes <= 0) {
      clearInterval(sala.timer);
      pasarACuentaAtras(sala);
    }
  }, 1000);
};

const pasarACuentaAtras = (sala) => {
  if (sala.timer) clearInterval(sala.timer);

  // Asignar respuestas por defecto si alguien no respondió a tiempo
  sala.jugadores.forEach(j => {
    if (!sala.respuestas[j.id]) {
      sala.respuestas[j.id] = 'Sin respuesta';
    }
  });

  sala.estado = 'cuenta_atras';
  sala.cuentaAtras10s = 10;

  sala.timer = setInterval(() => {
    sala.cuentaAtras10s -= 1;
    if (sala.cuentaAtras10s <= 0) {
      clearInterval(sala.timer);
      iniciarFaseAdivinanza(sala);
    }
  }, 1000);
};

const iniciarFaseAdivinanza = (sala) => {
  if (sala.timer) clearInterval(sala.timer);

  sala.estado = 'adivinando';
  sala.segundosRestantes = 90;

  sala.timer = setInterval(() => {
    sala.segundosRestantes -= 1;
    if (sala.segundosRestantes <= 0) {
      clearInterval(sala.timer);
      calcularResultadosRonda(sala);
    }
  }, 1000);
};

const calcularResultadosRonda = (sala) => {
  if (sala.timer) clearInterval(sala.timer);

  const jugadores = sala.jugadores;
  const compMap = {};
  jugadores.forEach(j => { compMap[j.id] = []; });

  // Comparación por pares: (A vs B)
  for (let i = 0; i < jugadores.length; i++) {
    for (let j = i + 1; j < jugadores.length; j++) {
      const pA = jugadores[i];
      const pB = jugadores[j];

      const respRealA = sala.respuestas[pA.id]?.trim().toLowerCase();
      const respRealB = sala.respuestas[pB.id]?.trim().toLowerCase();

      const guessA_sobre_B = sala.adivinanzas[pA.id]?.[pB.id]?.trim().toLowerCase();
      const guessB_sobre_A = sala.adivinanzas[pB.id]?.[pA.id]?.trim().toLowerCase();

      const aciertaA = Boolean(guessA_sobre_B && guessA_sobre_B === respRealB);
      const aciertaB = Boolean(guessB_sobre_A && guessB_sobre_A === respRealA);

      if (aciertaA && aciertaB) {
        // Os conocéis bien: +3 cada uno
        pA.puntos += 3;
        pB.puntos += 3;
        compMap[pA.id].push({ rival: pB.nombre, rivalId: pB.id, estado: 'os_conoceis', etiqueta: '¡Os conocéis bien!', puntos: '+3 pts', respuestaRival: sala.respuestas[pB.id] });
        compMap[pB.id].push({ rival: pA.nombre, rivalId: pA.id, estado: 'os_conoceis', etiqueta: '¡Os conocéis bien!', puntos: '+3 pts', respuestaRival: sala.respuestas[pA.id] });
      } else if (aciertaA && !aciertaB) {
        // A le conoce a B: +2 para A, -1 para B
        pA.puntos += 2;
        pB.puntos = pB.puntos - 1;
        compMap[pA.id].push({ rival: pB.nombre, rivalId: pB.id, estado: 'le_conoces', etiqueta: 'Le conoces', puntos: '+2 pts', respuestaRival: sala.respuestas[pB.id] });
        compMap[pB.id].push({ rival: pA.nombre, rivalId: pA.id, estado: 'te_conoce', etiqueta: 'Te conoce (tú fallaste)', puntos: '-1 pto', respuestaRival: sala.respuestas[pA.id] });
      } else if (!aciertaA && aciertaB) {
        // B le conoce a A: +2 para B, -1 para A
        pA.puntos = pA.puntos - 1;
        pB.puntos += 2;
        compMap[pA.id].push({ rival: pB.nombre, rivalId: pB.id, estado: 'te_conoce', etiqueta: 'Te conoce (tú fallaste)', puntos: '-1 pto', respuestaRival: sala.respuestas[pB.id] });
        compMap[pB.id].push({ rival: pA.nombre, rivalId: pA.id, estado: 'le_conoces', etiqueta: 'Le conoces', puntos: '+2 pts', respuestaRival: sala.respuestas[pA.id] });
      } else {
        // Ninguno acierta: -1 cada uno
        pA.puntos = pA.puntos - 1;
        pB.puntos = pB.puntos - 1;
        compMap[pA.id].push({ rival: pB.nombre, rivalId: pB.id, estado: 'no_os_conoceis', etiqueta: 'No os conocéis', puntos: '-1 pto', respuestaRival: sala.respuestas[pB.id] });
        compMap[pB.id].push({ rival: pA.nombre, rivalId: pA.id, estado: 'no_os_conoceis', etiqueta: 'No os conocéis', puntos: '-1 pto', respuestaRival: sala.respuestas[pA.id] });
      }
    }
  }

  sala.comparaciones = compMap;
  sala.estado = 'resultados';
};

router.post('/sala/:code/iniciar', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || !yo.esAdmin) return res.status(403).json({ error: 'No autorizado' });
  if (sala.jugadores.length < 4) return res.status(400).json({ error: 'Mínimo 4 jugadores' });

  sala.jugadores.forEach(j => { j.puntos = 0; });
  sala.rondaNum = 1;
  sala.preguntasUsadas = [];

  iniciarRonda(sala);
  res.json({ success: true });
});

router.post('/sala/:code/responder', (req, res) => {
  const { code, token, respuesta } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || sala.estado !== 'respondiendo') return res.status(400).json({ error: 'No es momento de responder' });
  if (!respuesta || !respuesta.trim()) return res.status(400).json({ error: 'Respuesta vacía' });

  sala.respuestas[yo.id] = respuesta.trim();

  // Si todos los jugadores han respondido, avanzar a la cuenta atrás
  const todosRespondieron = sala.jugadores.every(j => sala.respuestas[j.id]);
  if (todosRespondieron) {
    pasarACuentaAtras(sala);
  }

  res.json({ success: true });
});

router.post('/sala/:code/enviar-adivinanzas', (req, res) => {
  const { code, token, asignaciones } = req.body; // { [targetId]: respuestaTexto }
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || sala.estado !== 'adivinando') return res.status(400).json({ error: 'No es momento de adivinar' });

  sala.adivinanzas[yo.id] = asignaciones || {};

  // Si todos los jugadores han enviado sus apuestas
  const todosAdivinaron = sala.jugadores.every(j => sala.adivinanzas[j.id] && Object.keys(sala.adivinanzas[j.id]).length >= sala.jugadores.length - 1);
  if (todosAdivinaron) {
    calcularResultadosRonda(sala);
  }

  res.json({ success: true });
});

router.post('/sala/:code/siguiente-ronda', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || !yo.esAdmin) return res.status(403).json({ error: 'No autorizado' });

  if (sala.rondaNum >= MAX_RONDAS) {
    sala.estado = 'fin';
    return res.json({ success: true, fin: true });
  }

  sala.rondaNum += 1;
  iniciarRonda(sala);
  res.json({ success: true });
});

router.post('/sala/:code/terminar-ya', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || !yo.esAdmin) return res.status(403).json({ error: 'No autorizado' });

  if (sala.timer) clearInterval(sala.timer);
  sala.estado = 'fin';
  res.json({ success: true });
});

router.post('/sala/:code/salir', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  if (sala) {
    sala.jugadores = sala.jugadores.filter(j => j.token !== token);
    if (sala.jugadores.length === 0) {
      if (sala.timer) clearInterval(sala.timer);
      delete salas[code];
    }
  }
  res.json({ success: true });
});

export default router;