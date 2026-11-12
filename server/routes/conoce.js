// server/routes/conoce.js
import express from 'express';
import crypto from 'crypto';
import { getPreguntaAleatoria } from '../data/seeds/conoce/conoceData.js';
import { limitesOnline } from '../../client/src/games/limites.js';
import { totalRondas } from '../../client/src/games/rondas.js';
import { sonRespuestasEquivalentes, formatearRespuesta, puntosPareja } from '../../client/src/games/Conoce/respuestas.js';
const LIM = limitesOnline('conoce');

const router = express.Router();
const salas = {};

// Rondas: las elige el anfitrión al empezar (games/rondas.js)
const maxRondasDe = (sala) => sala.maxRondas || totalRondas('conoce', null, sala.jugadores.length);
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
    estado: 'lobby', // 'lobby' | 'mejor_amigo' | 'respondiendo' | 'cuenta_atras' | 'adivinando' | 'resultados' | 'fin'
    rondaNum: 1,
    preguntaActual: '',
    preguntasUsadas: [],
    segundosRestantes: 60,
    cuentaAtras10s: 3,
    amigos: {}, // { [jugadorId]: idDeSuMejorAmigo }
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
  if (sala.jugadores.length >= LIM.max) return res.status(400).json({ error: `La sala está llena (máx. ${LIM.max}).` });

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
    maxRondas: maxRondasDe(sala),
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
    miAmigoId: sala.amigos?.[yo.id] ?? null,
    jugadores: sala.jugadores.map(j => ({
      id: j.id,
      nombre: j.nombre,
      puntos: j.puntos,
      haRespondido: Boolean(sala.respuestas[j.id]),
      haAdivinado: Boolean(sala.adivinanzas[j.id] && Object.keys(sala.adivinanzas[j.id]).length >= sala.jugadores.length - 1),
      haElegidoAmigo: Boolean(sala.amigos?.[j.id]),
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
      sala.respuestas[j.id] = 'SIN RESPUESTA';
    }
  });

  sala.estado = 'cuenta_atras';
  sala.cuentaAtras10s = 3;

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

      const respA = sala.respuestas[pA.id] || '';
      const respB = sala.respuestas[pB.id] || '';
      // Respuestas parecidas («FÚTBOL» y «FURBO») cuentan como la misma
      const aciertaA = sonRespuestasEquivalentes(sala.adivinanzas[pA.id]?.[pB.id] || '', respB);
      const aciertaB = sonRespuestasEquivalentes(sala.adivinanzas[pB.id]?.[pA.id] || '', respA);
      const r = puntosPareja(aciertaA, aciertaB, pA.id, pB.id, sala.amigos);
      pA.puntos += r.a;
      pB.puntos += r.b;
      const fila = (rival, estado, etiqueta, pts, doble) => ({
        rival: rival.nombre, rivalId: rival.id, estado, etiqueta: doble ? `${etiqueta} 💛 ×2` : etiqueta,
        puntos: `${pts > 0 ? '+' : ''}${pts} ${Math.abs(pts) === 1 ? 'pto' : 'pts'}`, doble, respuestaRival: sala.respuestas[rival.id]
      });
      if (r.estado === 'os_conoceis') {
        compMap[pA.id].push(fila(pB, 'os_conoceis', '¡Os conocéis bien!', r.a, r.dobleA));
        compMap[pB.id].push(fila(pA, 'os_conoceis', '¡Os conocéis bien!', r.b, r.dobleB));
      } else if (r.estado === 'a') {
        compMap[pA.id].push(fila(pB, 'le_conoces', 'Le conoces', r.a));
        compMap[pB.id].push(fila(pA, 'te_conoce', 'Te conoce (tú fallaste)', r.b));
      } else if (r.estado === 'b') {
        compMap[pA.id].push(fila(pB, 'te_conoce', 'Te conoce (tú fallaste)', r.a));
        compMap[pB.id].push(fila(pA, 'le_conoces', 'Le conoces', r.b));
      } else {
        compMap[pA.id].push(fila(pB, 'no_os_conoceis', 'No os conocéis', r.a));
        compMap[pB.id].push(fila(pA, 'no_os_conoceis', 'No os conocéis', r.b));
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
  if (sala.jugadores.length < LIM.min) return res.status(400).json({ error: `Se necesitan al menos ${LIM.min} jugadores.` });
  sala.maxRondas = totalRondas('conoce', req.body?.rondas, sala.jugadores.length);

  sala.jugadores.forEach(j => { j.puntos = 0; });
  sala.rondaNum = 1;
  sala.preguntasUsadas = [];
  // Antes de la primera ronda cada uno elige en secreto a su mejor amigo
  if (sala.timer) clearInterval(sala.timer);
  sala.amigos = {};
  sala.estado = 'mejor_amigo';
  res.json({ success: true });
});

router.post('/sala/:code/mejor-amigo', (req, res) => {
  const { code, token, amigoId } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || sala.estado !== 'mejor_amigo') return res.status(400).json({ error: 'No es momento de elegir mejor amigo' });
  const amigo = sala.jugadores.find(j => j.id === Number(amigoId));
  if (!amigo || amigo.id === yo.id) return res.status(400).json({ error: 'Elige a otro jugador' });
  sala.amigos[yo.id] = amigo.id;
  if (sala.jugadores.every(j => sala.amigos[j.id])) iniciarRonda(sala);
  res.json({ success: true });
});

router.post('/sala/:code/responder', (req, res) => {
  const { code, token, respuesta } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || sala.estado !== 'respondiendo') return res.status(400).json({ error: 'No es momento de responder' });
  if (!respuesta || !respuesta.trim()) return res.status(400).json({ error: 'Respuesta vacía' });

  sala.respuestas[yo.id] = formatearRespuesta(respuesta);

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

  if (sala.rondaNum >= maxRondasDe(sala)) {
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