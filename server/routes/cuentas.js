// server/routes/cuentas.js
import express from 'express';
import crypto from 'crypto';

const router = express.Router();
const salas = {};

const TIPOS_ACCION = [
  { id: 'ver_dos', nombre: 'Ojo Avizor', icono: '👁️', tipo: 'buena', desc: 'Elige un rival y descubre 2 de sus cartas.' },
  { id: 'cambiar_carta', nombre: 'Trueque Forzoso', icono: '🔄', tipo: 'buena', desc: 'Intercambia 1 carta de tu mano con 1 carta de un rival.' },
  { id: 'radar_menores', nombre: 'Radar Numérico', icono: '📡', tipo: 'buena', desc: 'Descubre cuántas cartas menores que tu carta más baja quedan en total.' },
  { id: 'descarte_seguro', nombre: 'Salvo Conducto', icono: '🛡️', tipo: 'buena', desc: 'Tu próximo intento no tendrá penalización si fallas.' },
  { id: 'pasar_turno', nombre: 'Paso Estratégico', icono: '⏭️', tipo: 'buena', desc: 'Pasa tu turno de inmediato sin riesgo a ser penalizado por retención.' },
  { id: 'robar_extra', nombre: 'Carga Pesada', icono: '📦', tipo: 'mala', desc: 'Mala suerte: tienes que robar 1 carta extra del mazo.' },
  { id: 'perder_puntos', nombre: 'Bancarrota', icono: '💸', tipo: 'mala', desc: 'Pierdes los puntos acumulados en esta ronda.' },
  { id: 'bloqueo_turno', nombre: 'Pies de Plomo', icono: '🛑', tipo: 'mala', desc: 'No puedes jugar cartas en tu siguiente turno.' },
  { id: 'regalo_envenenado', nombre: 'Encasquetar', icono: '🎁', tipo: 'buena', desc: 'Entrégale tu carta más alta a un rival de tu elección.' },
  { id: 'reordenar_mazo', nombre: 'Torbellino', icono: '🌪️', tipo: 'neutral', desc: 'Devuelve 1 carta al mazo y roba otra nueva al azar.' }
];

const generarCodigo = () => Math.random().toString(36).substring(2, 6).toUpperCase();

const cartasPorJugadorSegunCantidad = (n) => {
  if (n >= 9) return 3;
  if (n >= 7) return 4;
  if (n >= 5) return 5;
  if (n >= 3) return 8;
  return 15; // 2 jugadores
};

// Genera números únicos del 1 al 100
const barajarMazoNumeros = () => {
  const m = Array.from({ length: 100 }, (_, i) => i + 1);
  return m.sort(() => Math.random() - 0.5);
};

// Genera cartas de acción barajadas
const barajarMazoAcciones = () => {
  const pool = [...TIPOS_ACCION, ...TIPOS_ACCION].sort(() => Math.random() - 0.5);
  return pool.slice(0, 5); // 5 cartas de acción por partida
};

router.post('/crear', (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Falta nombre' });

  const code = generarCodigo();
  const token = crypto.randomUUID();

  salas[code] = {
    code,
    estado: 'lobby', // 'lobby' | 'jugando' | 'fin'
    cartaActual: 0,
    turnoId: null,
    retenciones: {}, // { [jugadorId]: contadorTurnosReteniendo }
    protegidos: {}, // { [token]: true }
    bloqueados: {}, // { [token]: true }
    mazoNumeros: [],
    mazoAcciones: [],
    accionesRobadas: 0,
    ordenTerminados: [], // IDs de jugadores según se quedan sin cartas
    log: [],
    jugadores: [{ id: 1, nombre: nombre.trim(), token, cartas: [], puntos: 0, esAdmin: true }]
  };

  res.json({ success: true, code, token });
});

router.post('/unirse', (req, res) => {
  const { nombre, joinCode } = req.body;
  const sala = salas[joinCode];
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'Partida ya empezada' });
  if (sala.jugadores.length >= 10) return res.status(400).json({ error: 'Sala llena (máximo 10 jugadores)' });

  const token = crypto.randomUUID();
  const newId = sala.jugadores.length > 0 ? Math.max(...sala.jugadores.map(j => j.id)) + 1 : 1;
  sala.jugadores.push({ id: newId, nombre: nombre.trim(), token, cartas: [], puntos: 0, esAdmin: false });

  res.json({ success: true, code: joinCode, token });
});

router.get('/sala/:code', (req, res) => {
  const { code } = req.params;
  const { token } = req.query;
  const sala = salas[code];
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });

  const yo = sala.jugadores.find(j => j.token === token);
  if (!yo) return res.status(403).json({ error: 'No autorizado' });

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    cartaActual: sala.cartaActual,
    turnoId: sala.turnoId,
    esAdmin: yo.esAdmin,
    misCartas: yo.cartas.sort((a, b) => a - b),
    misPuntos: yo.puntos,
    bloqueado: Boolean(sala.bloqueados[token]),
    protegido: Boolean(sala.protegidos[token]),
    accionesRestantes: Math.max(0, 5 - sala.accionesRobadas),
    log: sala.log.slice(0, 6),
    jugadores: sala.jugadores.map(j => ({
      id: j.id,
      nombre: j.nombre,
      puntos: j.puntos,
      cantidadCartas: j.cartas.length,
      terminado: sala.ordenTerminados.includes(j.id),
      esTu: j.id === yo.id,
      esAdmin: j.esAdmin
    }))
  });
});

const avanzarTurno = (sala) => {
  const jugadoresActivos = sala.jugadores.filter(j => j.cartas.length > 0);
  if (jugadoresActivos.length <= 1) {
    finalizarPartida(sala);
    return;
  }

  const idxActual = sala.jugadores.findIndex(j => j.id === sala.turnoId);
  let nextIdx = (idxActual + 1) % sala.jugadores.length;

  while (sala.jugadores[nextIdx].cartas.length === 0) {
    nextIdx = (nextIdx + 1) % sala.jugadores.length;
  }

  sala.turnoId = sala.jugadores[nextIdx].id;
};

// Roba una carta asegurando que sea mayor a la carta actual del tablero si es posible
const robarCartaMayorQue = (sala, referencia) => {
  let idx = sala.mazoNumeros.findIndex(n => n > referencia);
  if (idx !== -1) {
    return sala.mazoNumeros.splice(idx, 1)[0];
  }
  // Si no quedan mayores, se extrae la más alta disponible
  if (sala.mazoNumeros.length > 0) {
    return sala.mazoNumeros.pop();
  }
  return Math.min(100, referencia + Math.floor(Math.random() * 5) + 1);
};

const verificarRetencion = (sala) => {
  // Comprueba quién tiene la carta más baja de toda la mesa
  let minGlobal = Infinity;
  let idConMinima = null;

  sala.jugadores.forEach(j => {
    if (j.cartas.length > 0) {
      const minJ = Math.min(...j.cartas);
      if (minJ < minGlobal) {
        minGlobal = minJ;
        idConMinima = j.id;
      }
    }
  });

  Object.keys(sala.retenciones).forEach(idStr => {
    const jId = Number(idStr);
    if (jId !== idConMinima) {
      sala.retenciones[jId] = 0;
    }
  });

  if (idConMinima) {
    sala.retenciones[idConMinima] = (sala.retenciones[idConMinima] || 0) + 1;
    // Si la retiene durante 2 turnos consecutivos
    if (sala.retenciones[idConMinima] >= 2) {
      const culpable = sala.jugadores.find(j => j.id === idConMinima);
      if (culpable) {
        culpable.puntos = Math.max(0, culpable.puntos - 1);
        const nuevaC = robarCartaMayorQue(sala, sala.cartaActual);
        culpable.cartas.push(nuevaC);
        sala.retenciones[idConMinima] = 0;
        sala.log.unshift(`⚠️ ${culpable.nombre} retuvo la carta más baja (${minGlobal}) durante 2 turnos: pierde 1 pto y roba el ${nuevaC}.`);
      }
    }
  }
};

const finalizarPartida = (sala) => {
  // Añadir a los que aún tengan cartas en orden de menor cantidad a mayor
  const restantes = sala.jugadores
    .filter(j => !sala.ordenTerminados.includes(j.id))
    .sort((a, b) => a.cartas.length - b.cartas.length);

  restantes.forEach(r => sala.ordenTerminados.push(r.id));

  // Asignar puntos: 1º recibe N puntos, 2º N-1... hasta el último que recibe 1 punto
  const totalJugadores = sala.jugadores.length;
  sala.ordenTerminados.forEach((id, puesto) => {
    const pts = Math.max(1, totalJugadores - puesto);
    const j = sala.jugadores.find(x => x.id === id);
    if (j) j.puntos += pts;
  });

  sala.estado = 'fin';
  sala.log.unshift('🏁 ¡Partida terminada! Se han repartido los puntos según el orden de finalización.');
};

router.post('/sala/:code/iniciar', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || !yo.esAdmin) return res.status(403).json({ error: 'No autorizado' });
  if (sala.jugadores.length < 2) return res.status(400).json({ error: 'Mínimo 2 jugadores' });

  sala.mazoNumeros = barajarMazoNumeros();
  sala.mazoAcciones = barajarMazoAcciones();
  sala.accionesRobadas = 0;
  sala.cartaActual = 0;
  sala.ordenTerminados = [];
  sala.retenciones = {};
  sala.protegidos = {};
  sala.bloqueados = {};
  sala.log = [];

  const cantidadPorJugador = cartasPorJugadorSegunCantidad(sala.jugadores.length);

  // Reparto de cartas
  sala.jugadores.forEach(j => {
    j.puntos = 0;
    j.cartas = sala.mazoNumeros.splice(0, cantidadPorJugador).sort((a, b) => a - b);
    sala.retenciones[j.id] = 0;
  });

  // Elegir jugador al azar para empezar
  const primerJugador = sala.jugadores[Math.floor(Math.random() * sala.jugadores.length)];
  sala.turnoId = primerJugador.id;
  sala.estado = 'jugando';
  sala.log.unshift(`🎲 ¡Comienza la partida! Turno de ${primerJugador.nombre}.`);

  res.json({ success: true });
});

router.post('/sala/:code/jugar-carta', (req, res) => {
  const { code, token, numero } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || sala.estado !== 'jugando') return res.status(400).json({ error: 'Partida no activa' });

  if (sala.turnoId !== yo.id) return res.status(400).json({ error: 'No es tu turno' });
  if (sala.bloqueados[token]) {
    delete sala.bloqueados[token];
    avanzarTurno(sala);
    return res.json({ success: true, mensaje: 'Estestabas bloqueado este turno. Se pasa al siguiente jugador.' });
  }

  const indexCarta = yo.cartas.indexOf(numero);
  if (indexCarta === -1) return res.status(400).json({ error: 'No tienes esa carta en tu mano' });

  // Comprobar si algún jugador tenía una carta menor a la jugada y mayor que la carta actual
  let menorExistente = null;
  let duenoMenor = null;

  sala.jugadores.forEach(j => {
    j.cartas.forEach(c => {
      if (c < numero && c > sala.cartaActual) {
        if (menorExistente === null || c < menorExistente) {
          menorExistente = c;
          duenoMenor = j.nombre;
        }
      }
    });
  });

  if (menorExistente !== null) {
    // FALLO: Alguien tenía una menor
    if (sala.protegidos[token]) {
      delete sala.protegidos[token];
      sala.log.unshift(`🛡️ ${yo.nombre} jugó el ${numero}, pero ${duenoMenor} tenía el ${menorExistente}. ¡Tu escudo te salvó de la penalización!`);
    } else {
      yo.puntos = Math.max(0, yo.puntos - 1);
      const nuevaCarta = robarCartaMayorQue(sala, sala.cartaActual);
      yo.cartas.push(nuevaCarta);
      yo.cartas.sort((a, b) => a - b);
      sala.log.unshift(`❌ ${yo.nombre} jugó el ${numero}, pero ${duenoMenor} tenía el ${menorExistente}. Pierde 1 pto y roba el ${nuevaCarta}.`);
    }
  } else {
    // ACIERTO: Era la carta menor válida
    yo.cartas.splice(indexCarta, 1);
    sala.cartaActual = numero;
    yo.puntos += 1;
    sala.log.unshift(`✅ ¡Correcto! ${yo.nombre} colocó el ${numero} (+1 pto).`);

    if (yo.cartas.length === 0) {
      sala.ordenTerminados.push(yo.id);
      sala.log.unshift(`🎉 ¡${yo.nombre} se ha quedado sin cartas!`);
    }
  }

  verificarRetencion(sala);
  avanzarTurno(sala);

  res.json({ success: true });
});

// Robar y ejecutar una carta de acción (máximo 5 por partida)
router.post('/sala/:code/robar-accion', (req, res) => {
  const { code, token, rivalId, cartaIdIntercambio } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || sala.estado !== 'jugando') return res.status(400).json({ error: 'Partida no activa' });
  if (sala.turnoId !== yo.id) return res.status(400).json({ error: 'Solo puedes usar acciones en tu turno' });

  if (sala.accionesRobadas >= 5 || sala.mazoAcciones.length === 0) {
    return res.status(400).json({ error: 'Ya no quedan cartas de acción disponibles en esta partida' });
  }

  const accion = sala.mazoAcciones.pop();
  sala.accionesRobadas += 1;
  let detalle = '';

  switch (accion.id) {
    case 'ver_dos': {
      const rival = sala.jugadores.find(j => j.id === rivalId && j.id !== yo.id);
      if (rival && rival.cartas.length > 0) {
        const reveladas = [...rival.cartas].sort(() => Math.random() - 0.5).slice(0, 2);
        detalle = `Has visto las cartas [${reveladas.join(', ')}] de ${rival.nombre}.`;
      }
      break;
    }
    case 'cambiar_carta': {
      const rival = sala.jugadores.find(j => j.id === rivalId && j.id !== yo.id);
      if (rival && rival.cartas.length > 0 && yo.cartas.length > 0) {
        const miCarta = cartaIdIntercambio || yo.cartas[0];
        const suCarta = rival.cartas.splice(Math.floor(Math.random() * rival.cartas.length), 1)[0];
        yo.cartas = yo.cartas.filter(c => c !== miCarta);
        yo.cartas.push(suCarta);
        rival.cartas.push(miCarta);
        yo.cartas.sort((a, b) => a - b);
        rival.cartas.sort((a, b) => a - b);
        detalle = `Has cambiado tu ${miCarta} por el ${suCarta} de ${rival.nombre}.`;
      }
      break;
    }
    case 'radar_menores': {
      const miMin = Math.min(...yo.cartas);
      let menores = 0;
      sala.jugadores.forEach(j => {
        if (j.id !== yo.id) {
          menores += j.cartas.filter(c => c < miMin && c > sala.cartaActual).length;
        }
      });
      detalle = `Quedan exactamente ${menores} cartas en juego menores que tu próxima carta (${miMin}).`;
      break;
    }
    case 'descarte_seguro': {
      sala.protegidos[token] = true;
      detalle = 'Tu próximo fallo estará protegido y no recibirás penalización.';
      break;
    }
    case 'pasar_turno': {
      sala.retenciones[yo.id] = 0;
      avanzarTurno(sala);
      detalle = 'Has pasado tu turno de forma segura.';
      break;
    }
    case 'robar_extra': {
      const extra = robarCartaMayorQue(sala, sala.cartaActual);
      yo.cartas.push(extra);
      yo.cartas.sort((a, b) => a - b);
      detalle = `¡Efecto negativo! Has tenido que robar el ${extra}.`;
      break;
    }
    case 'perder_puntos': {
      yo.puntos = 0;
      detalle = '¡Bancarrota! Tus puntos acumulados en esta ronda se han reducido a 0.';
      break;
    }
    case 'bloqueo_turno': {
      sala.bloqueados[token] = true;
      detalle = '¡Pies de plomo! No podrás jugar cartas en tu siguiente turno.';
      break;
    }
    case 'regalo_envenenado': {
      const rival = sala.jugadores.find(j => j.id === rivalId && j.id !== yo.id);
      if (rival && yo.cartas.length > 0) {
        const mayor = yo.cartas.pop(); // carta más alta
        rival.cartas.push(mayor);
        rival.cartas.sort((a, b) => a - b);
        detalle = `Le has encasquetado tu carta más alta (${mayor}) a ${rival.nombre}.`;
      }
      break;
    }
    case 'reordenar_mazo': {
      if (yo.cartas.length > 0) {
        const descartada = yo.cartas.splice(Math.floor(Math.random() * yo.cartas.length), 1)[0];
        sala.mazoNumeros.push(descartada);
        sala.mazoNumeros.sort(() => Math.random() - 0.5);
        const nueva = sala.mazoNumeros.pop();
        yo.cartas.push(nueva);
        yo.cartas.sort((a, b) => a - b);
        detalle = `Cambiaste el ${descartada} por el ${nueva}.`;
      }
      break;
    }
  }

  sala.log.unshift(`✨ ${yo.nombre} usó la carta de acción «${accion.nombre}» ${accion.icono}.`);
  res.json({ success: true, accion, detalle, misCartas: yo.cartas });
});

router.post('/sala/:code/salir', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  if (sala) {
    sala.jugadores = sala.jugadores.filter(j => j.token !== token);
    if (sala.jugadores.length === 0) {
      delete salas[code];
    }
  }
  res.json({ success: true });
});

export default router;