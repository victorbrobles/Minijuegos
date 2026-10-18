import express from 'express';
import crypto from 'crypto';

const router = express.Router();
const salas = {};

const generarCodigo = () => Math.random().toString(36).substring(2, 6).toUpperCase();

const PALOS = [
  { id: 'manzana', nombre: 'Manzana', icono: '🍎' },
  { id: 'seta', nombre: 'Seta', icono: '🍄' },
  { id: 'diamante', nombre: 'Diamante', icono: '💎' },
  { id: 'espada', nombre: 'Espada', icono: '🗡️' },
  { id: 'pocion', nombre: 'Poción', icono: '🧪' },
  { id: 'corona', nombre: 'Corona', icono: '👑' },
  { id: 'luna', nombre: 'Luna', icono: '🌙' },
  { id: 'rayo', nombre: 'Rayo', icono: '⚡' }
];

const ACCIONES = [
  { id: 'intercambio_azar', nombre: 'Ruleta', icono: '🔀', desc: 'Intercambias 1 carta al azar con un rival.' },
  { id: 'robar_tres', nombre: 'Suministros', icono: '📦', desc: 'Robas 3 cartas de una en una. Al robar la 3ª acaba tu turno.' },
  { id: 'descartar_tres', nombre: 'Purga', icono: '🗑️', desc: 'Descarta hasta 3 cartas de tu mano.' },
  { id: 'robar_elegida', nombre: 'Robo Preciso', icono: '🎯', desc: 'Miras la mano de un rival y le robas la que elijas.' },
  { id: 'dar_carta', nombre: 'Regalo Envenenado', icono: '🎁', desc: 'Obligas a un rival a recibir una carta de tu mano.' },
  { id: 'ver_mano', nombre: 'Espionaje', icono: '👁️‍🗨️', desc: 'Miras todas las cartas que tiene un rival.' },
  { id: 'retar', nombre: 'Duelo', icono: '⚔️', desc: 'Pides un palo a un rival. Si lo tiene te lo da; si no, te roba él a ti.' },
  { id: 'cambiar_mano', nombre: 'Torbellino', icono: '🌪️', desc: 'Intercambias tu mano completa con la de un rival.' }
];

const generarMazo = () => {
  let mazo = [];
  let uid = 1;
  // 80 Cartas de recursos (8 palos x 10)
  PALOS.forEach(p => {
    for (let i = 0; i < 10; i++) {
      mazo.push({ uid: uid++, tipo: 'palo', palo: p.id, icono: p.icono, nombre: p.nombre });
    }
  });
  // 13 cartas de Suministros (3 + 10 extras)
  for (let i = 0; i < 13; i++) {
    mazo.push({ uid: uid++, tipo: 'accion', accion: 'robar_tres', icono: '📦', nombre: 'Suministros', desc: 'Robas 3 cartas de una en una.' });
  }
  // 3 copias de las otras 7 acciones (21 cartas)
  ACCIONES.filter(a => a.id !== 'robar_tres').forEach(a => {
    for (let i = 0; i < 3; i++) {
      mazo.push({ uid: uid++, tipo: 'accion', accion: a.id, icono: a.icono, nombre: a.nombre, desc: a.desc });
    }
  });
  return mazo.sort(() => Math.random() - 0.5);
};

const rellenarMazo = (sala) => {
  if (sala.mazo.length === 0) {
    const top = sala.descarte.pop();
    const cartasReutilizables = [...sala.descarte, ...(sala.accionesGastadas || [])];
    sala.mazo = cartasReutilizables.sort(() => Math.random() - 0.5);
    sala.descarte = top ? [top] : [];
    sala.accionesGastadas = [];
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
      // Las cartas de palo al descarte; las acciones van a accionesGastadas
      j.mano.forEach(c => {
        if (c.tipo === 'palo') sala.descarte.push(c);
        else (sala.accionesGastadas = sala.accionesGastadas || []).push(c);
      });
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
  sala.robosSuministros = 0;
};

router.post('/crear', (req, res) => {
  const { nombre } = req.body;
  const code = generarCodigo();
  const token = crypto.randomUUID();

  salas[code] = {
    code, estado: 'lobby', mazo: [], descarte: [], accionesGastadas: [], log: [],
    turnoActivoIdx: 0, turnoActivoId: null, faseTurno: 'robar', robosSuministros: 0, ganador: null,
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
    robosSuministros: sala.robosSuministros || 0,
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
  sala.jugadores.forEach(j => { j.vivo = true; j.mano = sala.mazo.splice(0, 4); });
  
  // Garantizar que la primera carta del descarte sea un palo normal
  const primerPaloIdx = sala.mazo.findIndex(c => c.tipo === 'palo');
  sala.descarte = [sala.mazo.splice(primerPaloIdx, 1)[0]];
  sala.accionesGastadas = [];
  
  sala.estado = 'jugando';
  sala.ganador = null;
  sala.log = ['Partida iniciada. ¡Cada jugador comienza con 4 cartas!'];
  sala.turnoActivoIdx = 0;
  sala.turnoActivoId = sala.jugadores[0].id;
  sala.faseTurno = 'robar';
  sala.robosSuministros = 0;

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

  if (!yo.vivo) {
    avanzarTurno(sala);
    return res.json({ success: true });
  }

  // Si está bajo efecto de Suministros
  if (sala.robosSuministros > 0) {
    sala.robosSuministros -= 1;
    if (sala.robosSuministros > 0) {
      sala.faseTurno = 'robar';
    } else {
      avanzarTurno(sala);
    }
    return res.json({ success: true });
  }

  sala.faseTurno = 'jugar';
  res.json({ success: true });
});

router.post('/espiar', (req, res) => {
  const { code, token, targetId } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || sala.turnoActivoId !== yo.id) return res.status(400).json({ error: 'No autorizado' });
  const target = sala.jugadores.find(j => j.id === targetId);
  res.json({ success: true, mano: target ? target.mano : [] });
});

router.post('/jugar', (req, res) => {
  const { code, token, cartaId, targetId, miCartaId, purgaIds, paloPedido } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);

  if (!yo || sala.turnoActivoId !== yo.id || sala.faseTurno !== 'jugar') return res.status(400).json({ error: 'No es momento de jugar' });

  const cartaIdx = yo.mano.findIndex(c => c.uid === cartaId);
  if (cartaIdx === -1) return res.status(400).json({ error: 'Carta no encontrada' });
  const carta = yo.mano.splice(cartaIdx, 1)[0];

  // Las cartas de acción NUNCA van al descarte
  if (carta.tipo === 'palo') {
    sala.descarte.push(carta);
  } else {
    (sala.accionesGastadas = sala.accionesGastadas || []).push(carta);
  }

  let resultado = {
    titulo: 'Acción realizada',
    icono: carta.icono || '✨',
    mensaje: ''
  };

  if (carta.tipo === 'palo') {
    sala.log.unshift(`📤 ${yo.nombre} descartó un(a) ${carta.nombre}.`);
    resultado = {
      titulo: 'Palo descartado',
      icono: carta.icono,
      mensaje: `Has descartado ${carta.nombre}.`
    };
  } else {
    switch (carta.accion) {
      case 'robar_tres': {
        sala.robosSuministros = 3;
        sala.faseTurno = 'robar';
        sala.log.unshift(`📦 ${yo.nombre} activó Suministros: debe robar 3 cartas de una en una.`);
        // No se muestra modal de resultado: se pasa a robar de inmediato
        return res.json({ success: true });
      }

      case 'descartar_tres': {
        if (Array.isArray(purgaIds)) {
          const descartadas = yo.mano.filter(c => purgaIds.includes(c.uid));
          yo.mano = yo.mano.filter(c => !purgaIds.includes(c.uid));
          descartadas.forEach(c => {
            if (c.tipo === 'palo') sala.descarte.push(c);
            else (sala.accionesGastadas = sala.accionesGastadas || []).push(c);
          });
          sala.log.unshift(`🗑️ ${yo.nombre} purgó ${descartadas.length} carta(s).`);
          resultado = {
            titulo: 'Purga completada',
            icono: '🗑️',
            mensaje: `Has descartado ${descartadas.length} carta(s).`
          };
        }
        break;
      }

      case 'intercambio_azar': {
        const target = sala.jugadores.find(j => j.id === targetId);
        if (target && target.mano.length > 0 && yo.mano.length > 0) {
          const miC = yo.mano.splice(Math.floor(Math.random() * yo.mano.length), 1)[0];
          const suC = target.mano.splice(Math.floor(Math.random() * target.mano.length), 1)[0];
          yo.mano.push(suC);
          target.mano.push(miC);
          sala.log.unshift(`🔀 ${yo.nombre} intercambió cartas a ciegas con ${target.nombre}.`);
          resultado = {
            titulo: 'Ruleta completada',
            icono: '🔀',
            mensaje: `Has entregado un(a) ${miC.nombre} y recibido ${suC.icono} ${suC.nombre} de ${target.nombre}.`
          };
        }
        break;
      }

      case 'robar_elegida': {
        const target = sala.jugadores.find(j => j.id === targetId);
        if (target && target.mano.length > 0) {
          const robada = target.mano.splice(Math.floor(Math.random() * target.mano.length), 1)[0];
          yo.mano.push(robada);
          sala.log.unshift(`🎯 ${yo.nombre} le quitó un(a) ${robada.nombre} a ${target.nombre}.`);
          resultado = {
            titulo: 'Robo preciso completado',
            icono: '🎯',
            mensaje: `Le has quitado ${robada.icono} ${robada.nombre} a ${target.nombre}.`
          };
        }
        break;
      }

      case 'dar_carta': {
        const target = sala.jugadores.find(j => j.id === targetId);
        const cartaIdx = yo.mano.findIndex(c => c.uid === miCartaId);
        if (target && cartaIdx !== -1) {
          const regalada = yo.mano.splice(cartaIdx, 1)[0];
          target.mano.push(regalada);
          sala.log.unshift(`🎁 ${yo.nombre} le endosó un(a) ${regalada.nombre} a ${target.nombre}.`);
          resultado = {
            titulo: 'Regalo entregado',
            icono: '🎁',
            mensaje: `Le has metido ${regalada.icono} ${regalada.nombre} a ${target.nombre}.`
          };
        }
        break;
      }

      case 'retar': {
        const target = sala.jugadores.find(j => j.id === targetId);
        if (target) {
          const idxPalo = target.mano.findIndex(x => x.palo === paloPedido);
          if (idxPalo !== -1) {
            const ganada = target.mano.splice(idxPalo, 1)[0];
            yo.mano.push(ganada);
            sala.log.unshift(`⚔️ Duelo: ${yo.nombre} acertó y le quitó ${ganada.nombre} a ${target.nombre}!`);
            resultado = {
              titulo: '¡HAS GANADO EL DUELO!',
              dueloGanado: true,
              icono: '⚔️',
              mensaje: `¡Acertaste! ${target.nombre} tenía ese palo y te ha entregado ${ganada.icono} ${ganada.nombre}.`
            };
          } else {
            let perdida = null;
            if (yo.mano.length > 0) {
              perdida = yo.mano.splice(Math.floor(Math.random() * yo.mano.length), 1)[0];
              target.mano.push(perdida);
            }
            sala.log.unshift(`⚔️ Duelo: ${target.nombre} no tenía ese palo. ¡${yo.nombre} perdió una carta!`);
            resultado = {
              titulo: '¡HAS PERDIDO EL DUELO!',
              dueloGanado: false,
              icono: '❌',
              mensaje: `${target.nombre} NO tenía ese palo. Has perdido una carta de tu mano.`
            };
          }
        }
        break;
      }

      case 'cambiar_mano': {
        const target = sala.jugadores.find(j => j.id === targetId);
        if (target) {
          const temp = [...yo.mano];
          yo.mano = [...target.mano];
          target.mano = temp;
          sala.log.unshift(`🌪️ ¡Torbellino! ${yo.nombre} y ${target.nombre} intercambiaron sus manos.`);
          resultado = {
            titulo: '¡Torbellino ejecutado!',
            icono: '🌪️',
            mensaje: `Has intercambiado todas tus cartas con ${target.nombre}.`
          };
        }
        break;
      }

      default:
        break;
    }
  }

  comprobarVictoriaDerrota(sala);
  res.json({ success: true, resultado });
});

router.post('/finalizarTurno', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);

  if (!yo || sala.turnoActivoId !== yo.id) return res.status(400).json({ error: 'No es tu turno' });

  if (sala.estado !== 'fin') {
    avanzarTurno(sala);
  }
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