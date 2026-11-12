// server/routes/velocidad.js
import { Router } from 'express';
import { PREGUNTAS_NORMALES, PREGUNTAS_ESPECIALES } from '../data/seeds/velocidad/index.js';
import { barajar } from '../lib/barajar.js';
import { limitesOnline } from '../../client/src/games/limites.js';
import { totalRondas } from '../../client/src/games/rondas.js';
const LIM = limitesOnline('velocidad');

const router = Router();

function normalizar(txt) {
  return String(txt ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sanitizarEspecial(esp) {
  if (!esp) return null;
  return { id: esp.id, pregunta: esp.pregunta };
}

// ==========================================
// ENDPOINTS OFFLINE / LOCAL
// ==========================================
router.post('/iniciar-turno', (req, res) => {
  const preguntasBarajadas = barajar([...PREGUNTAS_NORMALES]).slice(0, 70);
  const especialElegida = barajar([...PREGUNTAS_ESPECIALES])[0];

  res.json({
    preguntas: preguntasBarajadas,
    especial: sanitizarEspecial(especialElegida)
  });
});

router.post('/validar-especial', (req, res) => {
  const { id, respuesta } = req.body ?? {};
  const esp = PREGUNTAS_ESPECIALES.find((p) => p.id === id);

  if (!esp) return res.status(404).json({ error: 'Pregunta no encontrada' });

  const u = normalizar(respuesta);
  const esCorrecta = esp.alias.some((a) => normalizar(a) === u);

  res.json({
    acierto: esCorrecta,
    respuestaCorrecta: esp.respuesta
  });
});

// ==========================================
// SALAS ONLINE (MULTIDISPOSITIVO CON TURNOS)
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
    nextId: 2,
    estado: 'lobby', // 'lobby' | 'cuenta_atras' | 'jugando' | 'resumen_turno' | 'final'
    jugadores: [
      { id: 1, token: tokenAdmin, nombre, aciertos: 0, jugo: false, lastSeen: Date.now() }
    ],
    jugadorActualId: null,
    cuentaAtrasInicioTs: null,
    progresoEnVivo: null,
    preguntasTurno: null,
    especialTurno: null
  };

  res.json({ success: true, code, token: tokenAdmin, jugadorId: 1 });
});

// 2. Unirse a sala online
router.post('/online/unirse', (req, res) => {
  const code = (req.body?.code || '').trim().toUpperCase();
  const nombre = (req.body?.nombre || '').trim();

  if (!nombre) return res.status(400).json({ error: 'Debes indicar un nombre.' });

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe o el código es incorrecto.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha comenzado.' });
  if (sala.jugadores.length >= LIM.max) return res.status(400).json({ error: `La sala está llena (máx. ${LIM.max}).` });
  if (sala.jugadores.some((j) => j.nombre.toLowerCase() === nombre.toLowerCase())) {
    return res.status(400).json({ error: 'Ya hay un jugador con ese nombre en la sala.' });
  }

  const token = generarToken();
  const nuevoId = sala.nextId++;
  sala.jugadores.push({
    id: nuevoId,
    token,
    nombre,
    aciertos: 0,
    jugo: false,
    lastSeen: Date.now()
  });

  res.json({ success: true, code, token, jugadorId: nuevoId });
});

// 3. Estado sincronizado de la sala
router.get('/online/sala/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const token = req.query.token;

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe o ha caducado.' });

  const jugadorActual = sala.jugadores.find((j) => j.token === token);
  if (!jugadorActual) return res.status(403).json({ error: 'No perteneces a esta sala.' });

  const ahora = Date.now();
  jugadorActual.lastSeen = ahora;

  const esAdmin = sala.adminToken === token;
  const adminJug = sala.jugadores.find((j) => j.token === sala.adminToken);

  let cuentaAtrasSegundos = 10;
  if (sala.estado === 'cuenta_atras' && sala.cuentaAtrasInicioTs) {
    const transcurrido = (ahora - sala.cuentaAtrasInicioTs) / 1000;
    cuentaAtrasSegundos = Math.max(0, Math.ceil(10 - transcurrido));
  }

  const jugadorEnTurno = sala.jugadores.find((j) => j.id === sala.jugadorActualId);

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    esAdmin,
    anfitrionId: adminJug ? adminJug.id : null,
    yoId: jugadorActual.id,
    jugadorActualId: sala.jugadorActualId,
    jugadorActualNombre: jugadorEnTurno ? jugadorEnTurno.nombre : null,
    ronda: sala.ronda || 1,
    maxRondas: sala.maxRondas || totalRondas('velocidad', null),
    cuentaAtrasSegundos,
    progresoEnVivo: sala.progresoEnVivo,
    jugadores: sala.jugadores.map((j) => ({
      id: j.id,
      nombre: j.nombre,
      aciertos: j.aciertos,
      jugo: j.jugo,
      conectado: ahora - (j.lastSeen || ahora) < 8000
    }))
  });
});

// 4. Expulsar jugador (sólo anfitrión)
router.post('/online/sala/:code/expulsar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, jugadorId } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede expulsar.' });

  const idx = sala.jugadores.findIndex((j) => j.id === Number(jugadorId) && j.token !== token);
  if (idx !== -1) {
    const expulsado = sala.jugadores[idx];
    sala.jugadores.splice(idx, 1);

    if (
      expulsado.id === sala.jugadorActualId &&
      (sala.estado === 'cuenta_atras' || sala.estado === 'jugando')
    ) {
      sala.estado = 'resumen_turno';
      sala.progresoEnVivo = null;
      sala.preguntasTurno = null;
      sala.especialTurno = null;
    }
  }

  res.json({ success: true });
});

// 5. Iniciar partida y sortear primer jugador (sólo anfitrión)
router.post('/online/sala/:code/iniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede iniciar.' });
  if (sala.jugadores.length < LIM.min) return res.status(400).json({ error: `Se necesitan al menos ${LIM.min} jugadores.` });

  sala.jugadores.forEach((j) => {
    j.aciertos = 0;
    j.jugo = false;
  });
  sala.maxRondas = totalRondas('velocidad', req.body?.rondas);
  sala.ronda = 1;

  const elegido = sala.jugadores[Math.floor(Math.random() * sala.jugadores.length)];
  sala.jugadorActualId = elegido.id;
  sala.preguntasTurno = null;
  sala.especialTurno = null;
  sala.estado = 'cuenta_atras';
  sala.cuentaAtrasInicioTs = Date.now();
  sala.progresoEnVivo = {
    aciertos: 0,
    tiempoRestante: 60,
    preguntaNum: 1,
    preguntaTexto: '',
    mostrandoEspecial: false
  };

  res.json({ success: true, jugadorActualId: elegido.id });
});

// 6. Cargar preguntas para el jugador activo al arrancar su turno (idempotente ante reconexión)
router.post('/online/sala/:code/arrancar-turno', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador || jugador.id !== sala.jugadorActualId) {
    return res.status(403).json({ error: 'No es tu turno de jugar.' });
  }

  if (sala.estado === 'jugando' && sala.preguntasTurno) {
    return res.json({
      success: true,
      preguntas: sala.preguntasTurno,
      especial: sanitizarEspecial(sala.especialTurno)
    });
  }

  const preguntasBarajadas = barajar([...PREGUNTAS_NORMALES]).slice(0, 70);
  const especialElegida = barajar([...PREGUNTAS_ESPECIALES])[0];

  sala.preguntasTurno = preguntasBarajadas;
  sala.especialTurno = especialElegida;
  sala.estado = 'jugando';
  sala.cuentaAtrasInicioTs = null;
  sala.progresoEnVivo = {
    aciertos: 0,
    tiempoRestante: 60,
    preguntaNum: 1,
    preguntaTexto: preguntasBarajadas[0]?.pregunta || '',
    mostrandoEspecial: false
  };

  res.json({
    success: true,
    preguntas: preguntasBarajadas,
    especial: sanitizarEspecial(especialElegida)
  });
});

// 7. El jugador activo reporta su progreso en vivo (para los espectadores)
router.post('/online/sala/:code/reportar-progreso', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, aciertos, tiempoRestante, preguntaNum, preguntaTexto, mostrandoEspecial } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.estado !== 'jugando') return res.json({ success: true });

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador || jugador.id !== sala.jugadorActualId) return res.json({ success: true });

  sala.progresoEnVivo = {
    aciertos: Number(aciertos || 0),
    tiempoRestante: Number(tiempoRestante || 0),
    preguntaNum: Number(preguntaNum || 1),
    preguntaTexto: String(preguntaTexto || ''),
    mostrandoEspecial: Boolean(mostrandoEspecial)
  };

  res.json({ success: true });
});

// 8. Validar pregunta especial online
router.post('/online/sala/:code/validar-especial', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, respuesta } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || !sala.especialTurno) return res.status(404).json({ error: 'Turno no activo.' });

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador || jugador.id !== sala.jugadorActualId) return res.status(403).json({ error: 'No es tu turno.' });

  const esp = sala.especialTurno;
  const u = normalizar(respuesta);
  const esCorrecta = esp.alias.some((a) => normalizar(a) === u);

  res.json({
    acierto: esCorrecta,
    respuestaCorrecta: esp.respuesta
  });
});

// 9. Finalizar turno individual
router.post('/online/sala/:code/finalizar-turno', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, aciertos } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador || jugador.id !== sala.jugadorActualId) return res.status(403).json({ error: 'No es tu turno.' });

  jugador.aciertos = (jugador.aciertos || 0) + Number(aciertos || 0);
  jugador.jugo = true;
  sala.estado = 'resumen_turno';
  sala.progresoEnVivo = null;
  sala.preguntasTurno = null;
  sala.especialTurno = null;

  res.json({ success: true });
});

// 10. Sortear siguiente jugador o finalizar partida
router.post('/online/sala/:code/siguiente-jugador', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede avanzar.' });

  let pendientes = sala.jugadores.filter((j) => !j.jugo);

  if (pendientes.length === 0) {
    if ((sala.ronda || 1) >= (sala.maxRondas || 1)) {
      sala.estado = 'final';
      return res.json({ success: true, final: true });
    }
    // Nueva ronda: todos vuelven a jugar su minuto (los aciertos se suman)
    sala.ronda = (sala.ronda || 1) + 1;
    sala.jugadores.forEach((j) => { j.jugo = false; });
    pendientes = sala.jugadores;
  }

  const elegido = pendientes[Math.floor(Math.random() * pendientes.length)];
  sala.jugadorActualId = elegido.id;
  sala.preguntasTurno = null;
  sala.especialTurno = null;
  sala.estado = 'cuenta_atras';
  sala.cuentaAtrasInicioTs = Date.now();
  sala.progresoEnVivo = {
    aciertos: 0,
    tiempoRestante: 60,
    preguntaNum: 1,
    preguntaTexto: '',
    mostrandoEspecial: false
  };

  res.json({ success: true, jugadorActualId: elegido.id });
});

// 11. Reiniciar para otra partida
router.post('/online/sala/:code/reiniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'lobby';
  sala.jugadorActualId = null;
  sala.progresoEnVivo = null;
  sala.preguntasTurno = null;
  sala.especialTurno = null;
  sala.jugadores.forEach((j) => {
    j.aciertos = 0;
    j.jugo = false;
  });

  res.json({ success: true });
});

// 12. Salir
router.post('/online/sala/:code/salir', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.json({ success: true });

  const idx = sala.jugadores.findIndex((j) => j.token === token);
  if (idx !== -1) {
    const saliente = sala.jugadores[idx];
    sala.jugadores.splice(idx, 1);

    if (sala.jugadores.length === 0) {
      delete salasOnline[code];
      return res.json({ success: true });
    }

    if (sala.adminToken === token) {
      sala.adminToken = sala.jugadores[0].token;
    }

    if (
      saliente.id === sala.jugadorActualId &&
      (sala.estado === 'cuenta_atras' || sala.estado === 'jugando')
    ) {
      sala.estado = 'resumen_turno';
      sala.progresoEnVivo = null;
      sala.preguntasTurno = null;
      sala.especialTurno = null;
    }
  }

  res.json({ success: true });
});

export default router;