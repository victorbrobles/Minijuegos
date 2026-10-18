import express from 'express';
import crypto from 'crypto';

const router = express.Router();
const salas = {};

const generarCodigo = () => Math.random().toString(36).substring(2, 6).toUpperCase();

const PALOS = [
  { id: 'manzana', nombre: 'Manzana', icono: '🍎' }, { id: 'seta', nombre: 'Seta', icono: '🍄' },
  { id: 'diamante', nombre: 'Diamante', icono: '💎' }, { id: 'espada', nombre: 'Espada', icono: '🗡️' },
  { id: 'pocion', nombre: 'Poción', icono: '🧪' }, { id: 'pergamino', nombre: 'Pergamino', icono: '📜' },
  { id: 'corona', nombre: 'Corona', icono: '👑' }, { id: 'ojo', nombre: 'Ojo', icono: '👁️' },
  { id: 'luna', nombre: 'Luna', icono: '🌙' }, { id: 'rayo', nombre: 'Rayo', icono: '⚡' }
];

const ACCIONES = [
  { id: 'ladron', nombre: 'Ladrón', icono: '🥷' },
  { id: 'cambio', nombre: 'Intercambio', icono: '🔄' },
  { id: 'suministros', nombre: 'Suministros', icono: '📦' }
];

const generarMazo = () => {
  let mazo = [];
  let uid = 1;
  PALOS.forEach(p => {
    for (let i = 0; i < 8; i++) mazo.push({ uid: uid++, tipo: 'palo', palo: p.id, icono: p.icono, nombre: p.nombre });
  });
  ACCIONES.forEach(a => {
    for (let i = 0; i < 5; i++) mazo.push({ uid: uid++, tipo: 'accion', accion: a.id, icono: a.icono, nombre: a.nombre });
  });
  return mazo.sort(() => Math.random() - 0.5);
};

const rellenarMazo = (sala) => {
  if (sala.mazo.length === 0 && sala.descarte.length > 1) {
    const top = sala.descarte.pop();
    sala.mazo = sala.descarte.sort(() => Math.random() - 0.5);
    sala.descarte = [top];
  }
};

const comprobarVictoriaDerrota = (sala) => {
  sala.jugadores.filter(j => j.vivo).forEach(j => {
    const palosCount = {};
    let palosDistintos = 0;
    j.mano.forEach(c => {
      if (c.tipo === 'palo') {
        if (!palosCount[c.palo]) { palosCount[c.palo] = 0; palosDistintos++; }
        palosCount[c.palo]++;
      }
    });

    const maxMismoPalo = Math.max(0, ...Object.values(palosCount));
    
    if (maxMismoPalo >= 5) {
      sala.ganador = j.nombre;
      sala.log.unshift(`🏆 ¡${j.nombre} ha reunido 5 cartas iguales y gana!`);
    } else if (palosDistintos >= 5) {
      j.vivo = false;
      sala.descarte.push(...j.mano);
      j.mano = [];
      sala.log.unshift(`💀 ¡${j.nombre} acumuló 5 tipos distintos y fue eliminado!`);
    }
  });

  const vivos = sala.jugadores.filter(j => j.vivo);
  if (vivos.length === 1 && !sala.ganador) {
    sala.ganador = vivos[0].nombre;
    sala.log.unshift(`🏆 ¡${vivos[0].nombre} es el único superviviente!`);
  }
  
  if (sala.ganador) sala.estado = 'fin';
};

const avanzarTurno = (sala) => {
  let next = (sala.turnoActivoIdx + 1) % sala.jugadores.length;
  while (!sala.jugadores[next].vivo && sala.jugadores.filter(j => j.vivo).length > 1) {
    next = (next + 1) % sala.jugadores.length;
  }
  sala.turnoActivoIdx = next;
  sala.turnoActivoId = sala.jugadores[next].id;
  sala.faseTurno = 'robar';
};

router.post('/crear', (req, res) => {
  const { nombre } = req.body;
  const code = generarCodigo();
  const token = crypto.randomUUID();

  salas[code] = {
    code, estado: 'lobby', mazo: [], descarte: [], log: [],
    turnoActivoIdx: 0, turnoActivoId: null, faseTurno: 'robar', ganador: null,
    jugadores: [{ id: 1, nombre, token, esAdmin: true, vivo: true, mano: [] }]
  };
  res.json({ success: true, code, token });
});

router.post('/unirse', (req, res) => {
  const { nombre, joinCode } = req.body;
  const sala = salas[joinCode];
  if (!sala || sala.estado !== 'lobby' || sala.jugadores.length >= 8) return res.status(400).json({ error: 'No se puede unir a la sala' });
  const token = crypto.randomUUID();
  sala.jugadores.push({ id: sala.jugadores.length + 1, nombre, token, esAdmin: false, vivo: true, mano: [] });
  res.json({ success: true, code: joinCode, token });
});

router.get('/sala/:code', (req, res) => {
  const sala = salas[req.params.code];
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });
  const yo = sala.jugadores.find(j => j.token === req.query.token);
  if (!yo) return res.status(403).json({ error: 'No autorizado' });

  const data = {
    code: sala.code, estado: sala.estado, log: sala.log, ganador: sala.ganador,
    turnoActivo: sala.turnoActivoId, faseTurno: sala.faseTurno,
    mazoCount: sala.mazo.length, topDescarte: sala.descarte[sala.descarte.length - 1] || null,
    jugadores: sala.jugadores.map(j => ({
      id: j.id, nombre: j.nombre, vivo: j.vivo, esAdmin: j.esAdmin, esTu: j.id === yo.id,
      cartasCount: j.mano.length, mano: j.id === yo.id ? j.mano : []
    }))
  };
  res.json({ success: true, ...data });
});

router.post('/iniciar', (req, res) => {
  const sala = salas[req.body.code];
  if (!sala || !sala.jugadores.find(j => j.token === req.body.token)?.esAdmin) return res.status(403).json({ error: 'Prohibido' });

  sala.mazo = generarMazo();
  // Empiezan con 4 cartas en la mano
  sala.jugadores.forEach(j => { j.vivo = true; j.mano = sala.mazo.splice(0, 4); });
  sala.descarte = [sala.mazo.pop()];
  sala.estado = 'jugando';
  sala.ganador = null;
  sala.log = ['La partida ha comenzado con 4 cartas por jugador.'];
  sala.turnoActivoIdx = 0;
  sala.turnoActivoId = sala.jugadores[0].id;
  sala.faseTurno = 'robar';
  
  res.json({ success: true });
});

router.post('/robar', (req, res) => {
  const { code, token, origen } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  
  if (!yo || sala.turnoActivoId !== yo.id || sala.faseTurno !== 'robar') return res.status(400).json({ error: 'No es momento de robar' });

  rellenarMazo(sala);
  const carta = origen === 'mazo' ? sala.mazo.pop() : sala.descarte.pop();
  if (carta) {
    yo.mano.push(carta);
    sala.log.unshift(`📥 ${yo.nombre} robó del ${origen}.`);
  }

  comprobarVictoriaDerrota(sala);
  if (sala.estado === 'fin') return res.json({ success: true });
  
  if (!yo.vivo) avanzarTurno(sala);
  else sala.faseTurno = 'jugar';

  res.json({ success: true });
});

router.post('/jugar', (req, res) => {
  const { code, token, cartaId, targetId, miCartaId } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);

  if (!yo || sala.turnoActivoId !== yo.id || sala.faseTurno !== 'jugar') return res.status(400).json({ error: 'No es momento de jugar' });

  const cartaIdx = yo.mano.findIndex(c => c.uid === cartaId);
  if (cartaIdx === -1) return res.status(400).json({ error: 'Carta no encontrada' });
  const carta = yo.mano.splice(cartaIdx, 1)[0];
  sala.descarte.push(carta);

  if (carta.tipo === 'palo') {
    sala.log.unshift(`📤 ${yo.nombre} descartó ${carta.nombre}.`);
  } 
  else if (carta.accion === 'suministros') {
    rellenarMazo(sala); yo.mano.push(sala.mazo.pop());
    rellenarMazo(sala); yo.mano.push(sala.mazo.pop());
    sala.log.unshift(`📦 ${yo.nombre} jugó Suministros (2 cartas extra).`);
  }
  else if (carta.accion === 'ladron') {
    const target = sala.jugadores.find(j => j.id === targetId);
    if (target && target.mano.length > 0) {
      const robada = target.mano.splice(Math.floor(Math.random() * target.mano.length), 1)[0];
      yo.mano.push(robada);
      rellenarMazo(sala);
      target.mano.push(sala.mazo.pop());
      sala.log.unshift(`🥷 ${yo.nombre} le robó una carta a ${target.nombre}.`);
    }
  }
  else if (carta.accion === 'cambio') {
    const target = sala.jugadores.find(j => j.id === targetId);
    if (target && target.mano.length > 0) {
      const miCIdx = yo.mano.findIndex(c => c.uid === miCartaId);
      const miC = yo.mano.splice(miCIdx, 1)[0];
      const robada = target.mano.splice(Math.floor(Math.random() * target.mano.length), 1)[0];
      target.mano.push(miC);
      yo.mano.push(robada);
      sala.log.unshift(`🔄 ${yo.nombre} intercambió una carta con ${target.nombre}.`);
    }
  }

  comprobarVictoriaDerrota(sala);
  if (sala.estado !== 'fin') avanzarTurno(sala);

  res.json({ success: true });
});

router.post('/salir', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  if (sala) {
    sala.jugadores = sala.jugadores.filter(j => j.token !== token);
    if (sala.jugadores.length === 0) delete salas[code];
  }
  res.json({ success: true });
});

export default router;