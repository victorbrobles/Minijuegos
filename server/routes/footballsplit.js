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
    estado: 'lobby',
    adminId: 1,
    nextId: 2,
    jugadores: [{ id: 1, nombre, token }],
    retoActual: null,
    estadoReto: { top: false, middle: false, bottom: false },
    intentos: 0,
    turnoId: 1
  });

  res.json({ success: true, code, token });
});

router.post('/online/unirse', (req, res) => {
  const { code, nombre } = req.body;
  const sala = salas.get(code?.toUpperCase());
  
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'Partida en curso' });

  const token = generarToken();
  sala.jugadores.push({ id: sala.nextId++, nombre, token });
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
    jugadores: sala.jugadores.map(j => ({ id: j.id, nombre: j.nombre })),
    retoActual: sala.retoActual,
    estadoReto: sala.estadoReto,
    intentos: sala.intentos,
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
    sala.turnoId = sala.jugadores[nextIdx].id;
  };

  if (accion === 'iniciar') {
    if (sala.adminId !== usuario.id) return res.status(403).json({ error: 'Solo admin' });
    sala.estado = 'jugando';
    sala.retoActual = obtenerRetoAleatorio();
    sala.estadoReto = { top: false, middle: false, bottom: false };
    sala.intentos = 0;
    sala.turnoId = sala.jugadores[0].id;
    return res.json({ success: true });
  }

  if (accion === 'validar') {
    if (sala.turnoId !== usuario.id && sala.adminId !== usuario.id) return res.status(403).json({ error: 'No es tu turno' });
    
    sala.intentos += 1;
    let acierto = false;
    const inputNorm = normalizar(respuesta);

    // Revisar las 3 partes
    ['top', 'middle', 'bottom'].forEach(p => {
      if (!sala.estadoReto[p]) {
        const nombreReal = normalizar(sala.retoActual.partes[p].jugador);
        if (nombreReal === inputNorm || nombreReal.includes(inputNorm) || inputNorm.includes(nombreReal)) {
          sala.estadoReto[p] = true;
          acierto = true;
        }
      }
    });

    if (!acierto) pasarTurno();

    // Comprobar victoria o derrota
    if (sala.estadoReto.top && sala.estadoReto.middle && sala.estadoReto.bottom) {
      sala.estado = 'victoria';
    } else if (sala.intentos >= 20) {
      sala.estado = 'derrota';
    }

    return res.json({ success: true, acierto });
  }

  if (accion === 'pista') {
    sala.intentos += 1;
    return res.json({ success: true, pista: sala.retoActual.partes[parte].pista });
  }

  if (accion === 'rendirse') {
    sala.estado = 'derrota';
    return res.json({ success: true });
  }

  if (accion === 'volver') {
    sala.estado = 'lobby';
    sala.retoActual = null;
    return res.json({ success: true });
  }

  if (accion === 'abandonar') {
    salas.delete(code);
    return res.json({ success: true });
  }

  res.json({ success: false });
});

export default router;
