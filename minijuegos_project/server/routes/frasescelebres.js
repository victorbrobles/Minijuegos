// server/routes/frasescelebres.js
import express from 'express';
import parte1 from '../data/seeds/frasescelebres/parte1.js';
import parte2 from '../data/seeds/frasescelebres/parte2.js';
import parte3 from '../data/seeds/frasescelebres/parte3.js';

const router = express.Router();
const TODAS_LAS_FRASES = [...parte1, ...parte2, ...parte3];

function barajarArray(array) {
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// ==========================================
// ENDPOINT OFFLINE / LOCAL (INTACTO)
// ==========================================
router.get('/preguntas', (req, res) => {
  try {
    const frasesPreparadas = barajarArray(TODAS_LAS_FRASES).map((item) => ({
      ...item,
      opciones: barajarArray(item.opciones)
    }));

    res.json({
      success: true,
      total: frasesPreparadas.length,
      preguntas: frasesPreparadas
    });
  } catch (error) {
    console.error('Error al obtener preguntas de Frases Célebres:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
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

function prepararNuevaFraseOnline(sala) {
  const item = sala.preguntas[sala.rondaActualIdx % sala.preguntas.length];

  sala.ronda = {
    frase: item.frase,
    autor: item.autor,
    opciones: barajarArray(item.opciones),
    segundosRestantes: 30,
    ultimoTickTs: Date.now(),
    estaPausado: false,
    bloqueados: [],
    pulsado: null, // { jugadorId, nombre }
    estadoRonda: 'activa', // 'activa' | 'resuelta'
    solucion: null,
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
  const barajadas = barajarArray(TODAS_LAS_FRASES).slice(0, 30);

  salasOnline[code] = {
    code,
    adminToken: tokenAdmin,
    estado: 'lobby', // 'lobby' | 'jugando' | 'final'
    rondaActualIdx: 0,
    totalRondas: 10,
    preguntas: barajadas,
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
  if (sala.jugadores.length >= 15) return res.status(400).json({ error: 'La sala está completa.' });
  if (sala.jugadores.some((j) => j.nombre.toLowerCase() === nombre.toLowerCase())) {
    return res.status(400).json({ error: 'Ya hay un jugador con ese nombre en la sala.' });
  }

  const token = generarToken();
  const nuevoId = sala.jugadores.length + 1;
  sala.jugadores.push({ id: nuevoId, token, nombre, puntos: 0, conectado: true });

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

  const esAdmin = sala.adminToken === token;

  // Lógica del temporizador de 30s
  if (sala.estado === 'jugando' && sala.ronda && sala.ronda.estadoRonda === 'activa') {
    if (!sala.ronda.estaPausado && !sala.ronda.pulsado) {
      const ahora = Date.now();
      const delta = (ahora - sala.ronda.ultimoTickTs) / 1000;
      sala.ronda.segundosRestantes = Math.max(0, sala.ronda.segundosRestantes - delta);
      sala.ronda.ultimoTickTs = ahora;

      if (sala.ronda.segundosRestantes <= 0) {
        sala.ronda.estadoRonda = 'resuelta';
        sala.ronda.solucion = sala.ronda.autor;
        sala.ronda.mensaje = {
          tipo: 'info',
          texto: `¡Se agotó el tiempo! El autor era: ${sala.ronda.autor}`
        };
      }
    } else {
      sala.ronda.ultimoTickTs = Date.now();
    }
  }

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    esAdmin,
    yoId: jugadorActual.id,
    rondaActualIdx: sala.rondaActualIdx,
    totalRondas: sala.totalRondas,
    jugadores: sala.jugadores.map((j) => ({
      id: j.id,
      nombre: j.nombre,
      puntos: j.puntos,
      bloqueado: sala.ronda ? sala.ronda.bloqueados.includes(j.id) : false
    })),
    ronda: sala.ronda ? {
      frase: sala.ronda.frase,
      opciones: sala.ronda.opciones,
      segundosRestantes: sala.ronda.segundosRestantes,
      pulsado: sala.ronda.pulsado,
      estadoRonda: sala.ronda.estadoRonda,
      solucion: sala.ronda.solucion,
      mensaje: sala.ronda.mensaje
    } : null
  });
});

// 4. Iniciar partida
router.post('/online/sala/:code/iniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede iniciar.' });

  sala.estado = 'jugando';
  sala.rondaActualIdx = 0;
  sala.jugadores.forEach((j) => { j.puntos = 0; });
  prepararNuevaFraseOnline(sala);

  res.json({ success: true });
});

// 5. Pulsador rojo online: detiene el tiempo y activa las opciones para quien pulsó
router.post('/online/sala/:code/pulsar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || !sala.ronda) return res.status(404).json({ error: 'Partida no activa.' });

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador) return res.status(403).json({ error: 'Jugador no válido.' });

  if (sala.ronda.estadoRonda !== 'activa') return res.status(400).json({ error: 'La ronda ya terminó.' });
  if (sala.ronda.pulsado !== null) return res.status(409).json({ error: 'Otro jugador ya ha pulsado el botón.' });
  if (sala.ronda.bloqueados.includes(jugador.id)) return res.status(403).json({ error: 'Ya has fallado en esta frase.' });

  sala.ronda.pulsado = {
    jugadorId: jugador.id,
    nombre: jugador.nombre
  };
  sala.ronda.estaPausado = true;
  sala.ronda.mensaje = {
    tipo: 'info',
    texto: `¡${jugador.nombre} ha pulsado el botón! Está respondiendo...`
  };

  res.json({ success: true });
});

// 6. Enviar y validar respuesta directamente con la opción pulsada (+3 / -1)
router.post('/online/sala/:code/responder', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, opcion } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || !sala.ronda || !sala.ronda.pulsado) return res.status(400).json({ error: 'No hay turno para responder.' });

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador || sala.ronda.pulsado.jugadorId !== jugador.id) return res.status(403).json({ error: 'No es tu turno de responder.' });

  const esCorrecto = Boolean(opcion && opcion === sala.ronda.autor);

  if (esCorrecto) {
    jugador.puntos += 3;
    sala.ronda.estadoRonda = 'resuelta';
    sala.ronda.solucion = sala.ronda.autor;
    sala.ronda.mensaje = {
      tipo: 'success',
      texto: `¡Correcto! ${jugador.nombre} acertó: era ${sala.ronda.autor} (+3 pts)`
    };
    sala.ronda.pulsado = null;
  } else {
    jugador.puntos -= 1;
    sala.ronda.bloqueados.push(jugador.id);
    sala.ronda.pulsado = null;

    if (sala.ronda.bloqueados.length >= sala.jugadores.length) {
      sala.ronda.estadoRonda = 'resuelta';
      sala.ronda.solucion = sala.ronda.autor;
      sala.ronda.mensaje = {
        tipo: 'error',
        texto: `Todos los jugadores han fallado. El autor era: ${sala.ronda.autor}`
      };
    } else {
      sala.ronda.estaPausado = false;
      sala.ronda.ultimoTickTs = Date.now();
      sala.ronda.mensaje = {
        tipo: 'error',
        texto: `¡${jugador.nombre} ha fallado! (-1 pt). Queda fuera de esta frase.`
      };
    }
  }

  res.json({ success: true, correcto: esCorrecto });
});

// 7. Siguiente frase online
router.post('/online/sala/:code/siguiente-ronda', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede avanzar.' });

  if (sala.rondaActualIdx + 1 < sala.totalRondas) {
    sala.rondaActualIdx += 1;
    prepararNuevaFraseOnline(sala);
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