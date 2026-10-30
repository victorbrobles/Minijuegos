// server/routes/footballsplit.routes.js
import express from 'express';
import crypto from 'crypto';
import SPLIT_RETO, { generarRetoAleatorio } from '../data/seeds/footballsplit/split.js';

const router = express.Router();

const normalizar = (texto) => 
  typeof texto === 'string' ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

const obtenerRetoAleatorio = () => {
  return generarRetoAleatorio();
};

// ================= LOCAL =================
router.get('/reto', (req, res) => {
  res.json({ success: true, reto: obtenerRetoAleatorio() });
});

// ================= ONLINE =================
const salas = new Map();
const generarCodigo = () => crypto.randomBytes(2).toString('hex').toUpperCase();
const generarToken = () => crypto.randomBytes(16).toString('hex');

router.post('/online/crear', (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Nombre obligatorio' });

  const code = generarCodigo();
  const token = generarToken();

  salas.set(code, {
    code,
    estado: 'lobby', // 'lobby' | 'jugando' | 'ronda_fin' | 'final_partida'
    adminId: 1,
    nextId: 2,
    jugadores: [{ id: 1, nombre, token, puntos: 0 }],
    rondaActual: 1,
    maxRondas: 15,
    retoActual: null,
    estadoReto: { top: false, middle: false, bottom: false },
    pistasUsadas: { top: false, middle: false, bottom: false },
    turnoId: 1,
    primerTurnoRondaId: 1
  });

  res.json({ success: true, code, token });
});

router.post('/online/unirse', (req, res) => {
  const { code, nombre } = req.body;
  const sala = salas.get(code?.toUpperCase());
  
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'Partida en curso' });

  const token = generarToken();
  sala.jugadores.push({ id: sala.nextId++, nombre, token, puntos: 0 });
  res.json({ success: true, code: sala.code, token });
});

router.get('/online/sala/:code', (req, res) => {
  const { token } = req.query;
  const sala = salas.get(req.params.code?.toUpperCase());
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });
  
  const jugador = sala.jugadores.find(j => j.token === token);
  if (!jugador) return res.status(403).json({ error: 'No autorizado' });

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    esAdmin: sala.adminId === jugador.id,
    yoId: jugador.id,
    rondaActual: sala.rondaActual,
    maxRondas: sala.maxRondas,
    jugadores: sala.jugadores.map(j => ({ id: j.id, nombre: j.nombre, puntos: j.puntos || 0 })),
    retoActual: sala.retoActual,
    estadoReto: sala.estadoReto,
    pistasUsadas: sala.pistasUsadas,
    turnoId: sala.turnoId
  });
});

router.post('/online/sala/:code/:accion', (req, res) => {
  const { code, accion } = req.params;
  const { token, respuesta, parte } = req.body;
  const sala = salas.get(code?.toUpperCase());

  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });
  const usuario = sala.jugadores.find(j => j.token === token);
  if (!usuario) return res.status(403).json({ error: 'No autorizado' });

  const pasarTurno = () => {
    const idx = sala.jugadores.findIndex(j => j.id === sala.turnoId);
    const nextIdx = (idx + 1) % sala.jugadores.length;
    const siguienteId = sala.jugadores[nextIdx].id;

    if (siguienteId === sala.primerTurnoRondaId) {
      sala.estado = 'ronda_fin';
    } else {
      sala.turnoId = siguienteId;
    }
  };

  if (accion === 'iniciar') {
    if (sala.adminId !== usuario.id) return res.status(403).json({ error: 'Solo admin' });
    sala.estado = 'jugando';
    sala.rondaActual = 1;
    sala.retoActual = obtenerRetoAleatorio();
    sala.estadoReto = { top: false, middle: false, bottom: false };
    sala.pistasUsadas = { top: false, middle: false, bottom: false };
    
    const randomIndex = Math.floor(Math.random() * sala.jugadores.length);
    sala.turnoId = sala.jugadores[randomIndex].id;
    sala.primerTurnoRondaId = sala.turnoId;
    
    sala.jugadores.forEach(j => { j.puntos = 0; });
    return res.json({ success: true });
  }

  if (accion === 'validar') {
    if (sala.turnoId !== usuario.id) return res.status(403).json({ error: 'No es tu turno' });
    if (!parte || sala.estadoReto[parte]) return res.status(400).json({ error: 'Parte no válida' });
    
    let acierto = false;
    const inputNorm = normalizar(respuesta);
    const parteObj = sala.retoActual.partes && sala.retoActual.partes[parte];
    const nombreReal = parteObj ? normalizar(parteObj.jugador) : '';

    if (nombreReal && (nombreReal === inputNorm || (inputNorm.length >= 4 && nombreReal.includes(inputNorm)))) {
      sala.estadoReto[parte] = true;
      acierto = true;

      const conPista = sala.pistasUsadas[parte];
      const pts = conPista ? 1 : 5;
      usuario.puntos = (usuario.puntos || 0) + pts;

      if (sala.estadoReto.top && sala.estadoReto.middle && sala.estadoReto.bottom) {
        sala.estado = 'ronda_fin';
      }
    } else {
      pasarTurno();
    }

    return res.json({ success: true, acierto, puntosGanados: acierto ? (sala.pistasUsadas[parte] ? 1 : 5) : 0 });
  }

  if (accion === 'pasar-turno') {
    if (sala.turnoId !== usuario.id) return res.status(403).json({ error: 'No es tu turno' });
    pasarTurno();
    return res.json({ success: true });
  }

  if (accion === 'pista') {
    if (!parte) return res.status(400).json({ error: 'Parte requerida' });
    sala.pistasUsadas[parte] = true;
    return res.json({ success: true, pista: sala.retoActual.partes[parte].pista });
  }

  if (accion === 'siguiente-ronda') {
    if (sala.adminId !== usuario.id) return res.status(403).json({ error: 'Solo admin' });
    if (sala.rondaActual >= sala.maxRondas) {
      sala.estado = 'final_partida';
      return res.json({ success: true });
    }
    sala.rondaActual += 1;
    sala.estado = 'jugando';
    sala.retoActual = obtenerRetoAleatorio();
    sala.estadoReto = { top: false, middle: false, bottom: false };
    sala.pistasUsadas = { top: false, middle: false, bottom: false };
    
    const idxActual = sala.jugadores.findIndex(j => j.id === sala.primerTurnoRondaId);
    const siguienteIdx = (idxActual + 1) % sala.jugadores.length;
    sala.turnoId = sala.jugadores[siguienteIdx].id;
    sala.primerTurnoRondaId = sala.turnoId;

    return res.json({ success: true });
  }

  if (accion === 'finalizar-partida') {
    if (sala.adminId !== usuario.id) return res.status(403).json({ error: 'Solo admin' });
    sala.estado = 'final_partida';
    return res.json({ success: true });
  }

  if (accion === 'volver-lobby') {
    if (sala.adminId !== usuario.id) return res.status(403).json({ error: 'Solo admin' });
    sala.estado = 'lobby';
    sala.retoActual = null;
    sala.jugadores.forEach(j => { j.puntos = 0; });
    return res.json({ success: true });
  }

  if (accion === 'abandonar') {
    const idx = sala.jugadores.findIndex(j => j.token === token);
    if (idx !== -1) {
      sala.jugadores.splice(idx, 1);
      if (sala.jugadores.length === 0) {
        salas.delete(code);
      } else if (sala.adminId === usuario.id) {
        sala.adminId = sala.jugadores[0].id;
      }
    }
    return res.json({ success: true });
  }

  res.json({ success: false });
});

export default router;