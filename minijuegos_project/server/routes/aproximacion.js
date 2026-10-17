// server/routes/aproximacion.js
import { Router } from 'express';
import { PREGUNTAS } from '../data/seeds/aproximacion/aproximacion.seed.js';
import { barajar } from '../lib/barajar.js';

const router = Router();
const MAX_RONDAS = 15;

// GET /api/aproximacion/preguntas
router.get('/preguntas', (req, res) => {
  const barajadas = barajar([...PREGUNTAS]);
  res.json(barajadas);
});

// GET /api/aproximacion/aleatoria
router.get('/aleatoria', (req, res) => {
  const index = Math.floor(Math.random() * PREGUNTAS.length);
  res.json(PREGUNTAS[index]);
});

// ==========================================
// RUTAS MODO ONLINE
// ==========================================
const salasOnline = new Map();

function generarCodigo() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let cod = '';
  for (let i = 0; i < 4; i++) cod += letras[Math.floor(Math.random() * letras.length)];
  return cod;
}

function resolverPuntuacionesRonda(sala, objetivoReal) {
  const scoresRonda = {};
  sala.jugadores.forEach((j) => (scoresRonda[j.id] = 0));

  const respuestasUnicasMap = new Map();

  Object.entries(sala.ronda.decisiones).forEach(([jId, dec]) => {
    if (dec.tipo === 'propia') {
      respuestasUnicasMap.set(dec.valor, {
        autorId: Number(jId),
        valor: dec.valor,
        distancia: Math.abs(dec.valor - objetivoReal)
      });
    }
  });

  const listaUnicas = Array.from(respuestasUnicasMap.values()).sort(
    (a, b) => a.distancia - b.distancia
  );

  const exactas = listaUnicas.filter((it) => it.distancia === 0);
  const noExactas = listaUnicas.filter((it) => it.distancia > 0);

  exactas.forEach((item) => {
    scoresRonda[item.autorId] += 15;
    Object.entries(sala.ronda.decisiones).forEach(([jId, dec]) => {
      if (Number(jId) !== item.autorId && dec.valor === item.valor) {
        scoresRonda[Number(jId)] += 8;
      }
    });
  });

  if (noExactas.length > 0) {
    const minDist = noExactas[0].distancia;
    const maxDist = noExactas[noExactas.length - 1].distancia;

    const masCercanas = noExactas.filter((it) => it.distancia === minDist);
    masCercanas.forEach((item) => {
      scoresRonda[item.autorId] += 6;
      Object.entries(sala.ronda.decisiones).forEach(([jId, dec]) => {
        if (Number(jId) !== item.autorId && dec.valor === item.valor) {
          scoresRonda[Number(jId)] += 3;
        }
      });
    });

    if (maxDist > minDist) {
      const masLejanas = noExactas.filter((it) => it.distancia === maxDist);
      masLejanas.forEach((item) => {
        scoresRonda[item.autorId] -= 5;
      });

      const intermedias = noExactas.filter(
        (it) => it.distancia > minDist && it.distancia < maxDist
      );

      if (intermedias.length > 0) {
        const mitadIndex = Math.ceil(intermedias.length / 2);
        intermedias.forEach((item, idx) => {
          const delta = idx < mitadIndex ? 1 : -1;
          scoresRonda[item.autorId] += delta;
        });
      }
    }
  }

  // Acumular puntos
  sala.jugadores.forEach((j) => {
    j.puntos = (j.puntos || 0) + (scoresRonda[j.id] || 0);
  });

  sala.ronda.resultado = {
    objetivo: objetivoReal,
    scoresRonda,
    listaUnicas,
    decsFinales: sala.ronda.decisiones
  };
}

function prepararNuevaRonda(sala) {
  const preg = sala.preguntas[(sala.rondaNum - 1) % sala.preguntas.length] || {
    id: 999,
    pregunta: '¿Cuántos países hay en el mundo?',
    respuesta: 195,
    manual: false
  };

  const primerIndex = Math.floor(Math.random() * sala.jugadores.length);
  const orden = [];
  for (let i = 0; i < sala.jugadores.length; i++) {
    orden.push((primerIndex + i) % sala.jugadores.length);
  }

  sala.ronda = {
    pregunta: preg,
    ordenTurnos: orden, // Índices sobre sala.jugadores
    subTurnoIndex: 0,
    decisiones: {}, // { [jugadorId]: { tipo, valor, confiaEnId } }
    faseRonda: 'turno', // 'turno' | 'segunda_vuelta' | 'introducir_real' | 'resultados'
    resultado: null
  };
}

// POST /api/aproximacion/online/crear
router.post('/online/crear', (req, res) => {
  const { nombre } = req.body || {};
  if (!nombre?.trim()) return res.status(400).json({ error: 'Nombre requerido.' });

  let code = generarCodigo();
  while (salasOnline.has(code)) code = generarCodigo();

  const tokenAdmin = 'tok_' + Math.random().toString(36).substring(2);
  const sala = {
    code,
    estado: 'lobby', // 'lobby' | 'jugando' | 'final'
    adminToken: tokenAdmin,
    rondaNum: 1,
    preguntas: barajar([...PREGUNTAS]),
    jugadores: [{ id: 1, nombre: nombre.trim(), token: tokenAdmin, puntos: 0 }],
    ronda: null
  };

  salasOnline.set(code, sala);
  res.json({ success: true, code, token: tokenAdmin });
});

// POST /api/aproximacion/online/unirse
router.post('/online/unirse', (req, res) => {
  const { code, nombre } = req.body || {};
  const sala = salasOnline.get(code?.toUpperCase());

  if (!sala) return res.status(404).json({ error: 'Sala no encontrada.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha comenzado.' });
  if (sala.jugadores.length >= 20) return res.status(400).json({ error: 'La sala está llena (máx. 20).' });

  const token = 'tok_' + Math.random().toString(36).substring(2);
  const nuevoId = sala.jugadores.length + 1;

  sala.jugadores.push({
    id: nuevoId,
    nombre: nombre?.trim() || `Jugador ${nuevoId}`,
    token,
    puntos: 0
  });

  res.json({ success: true, code: sala.code, token });
});

// GET /api/aproximacion/online/sala/:code
router.get('/online/sala/:code', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala) return res.status(404).json({ error: 'Sala no disponible.' });

  const token = req.query.token;
  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador) return res.status(401).json({ error: 'Token no válido.' });

  let infoTurno = null;
  if (sala.ronda && sala.ronda.faseRonda === 'turno') {
    const jIndex = sala.ronda.ordenTurnos[sala.ronda.subTurnoIndex];
    const jTurno = sala.jugadores[jIndex];
    infoTurno = {
      jugadorId: jTurno?.id,
      jugadorNombre: jTurno?.nombre,
      subTurnoIndex: sala.ronda.subTurnoIndex,
      esPrimerJugador: sala.ronda.subTurnoIndex === 0
    };
  }

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    esAdmin: sala.adminToken === token,
    yoId: jugador.id,
    rondaNum: sala.rondaNum,
    maxRondas: MAX_RONDAS,
    jugadores: sala.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos })),
    ronda: sala.ronda
      ? {
          faseRonda: sala.ronda.faseRonda,
          pregunta: sala.ronda.pregunta,
          decisiones: sala.ronda.decisiones,
          primerJugadorId: sala.jugadores[sala.ronda.ordenTurnos[0]]?.id,
          primerJugadorNombre: sala.jugadores[sala.ronda.ordenTurnos[0]]?.nombre,
          infoTurno,
          resultado: sala.ronda.resultado
        }
      : null
  });
});

// POST /api/aproximacion/online/sala/:code/iniciar
router.post('/online/sala/:code/iniciar', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });
  if (sala.jugadores.length < 4) return res.status(400).json({ error: 'Mínimo 4 jugadores requeridos.' });

  sala.estado = 'jugando';
  sala.rondaNum = 1;
  prepararNuevaRonda(sala);

  res.json({ success: true });
});

// POST /api/aproximacion/online/sala/:code/responder
router.post('/online/sala/:code/responder', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || !sala.ronda || sala.ronda.faseRonda !== 'turno') {
    return res.status(400).json({ error: 'No es momento de responder.' });
  }

  const jugador = sala.jugadores.find((j) => j.token === req.body?.token);
  const jIndex = sala.ronda.ordenTurnos[sala.ronda.subTurnoIndex];
  const jTurno = sala.jugadores[jIndex];

  if (!jugador || jugador.id !== jTurno.id) {
    return res.status(403).json({ error: 'No es tu turno de responder.' });
  }

  const { tipo, valor, confiaEnId } = req.body || {};

  // Validaciones
  if (tipo === 'propia') {
    const yaExiste = Object.values(sala.ronda.decisiones).some(
      (d) => d.tipo === 'propia' && d.valor === valor
    );
    if (yaExiste) {
      return res.status(400).json({ error: `El número ${valor} ya ha sido dicho. Introduce otro o confía en él.` });
    }
    sala.ronda.decisiones[jugador.id] = { tipo: 'propia', valor, confiaEnId: null };
  } else if (tipo === 'confia') {
    sala.ronda.decisiones[jugador.id] = { tipo: 'confia', valor, confiaEnId };
  } else {
    return res.status(400).json({ error: 'Tipo de decisión no válido.' });
  }

  // Avanzar turno
  if (sala.ronda.subTurnoIndex + 1 < sala.ronda.ordenTurnos.length) {
    sala.ronda.subTurnoIndex += 1;
  } else {
    const idPrimero = sala.jugadores[sala.ronda.ordenTurnos[0]].id;
    const otrasRespuestas = Object.entries(sala.ronda.decisiones).filter(
      ([id, d]) => Number(id) !== idPrimero && d.tipo === 'propia'
    );

    if (otrasRespuestas.length === 0) {
      if (sala.ronda.pregunta.manual) {
        sala.ronda.faseRonda = 'introducir_real';
      } else {
        resolverPuntuacionesRonda(sala, sala.ronda.pregunta.respuesta);
        sala.ronda.faseRonda = 'resultados';
      }
    } else {
      sala.ronda.faseRonda = 'segunda_vuelta';
    }
  }

  res.json({ success: true });
});

// POST /api/aproximacion/online/sala/:code/segunda-vuelta
router.post('/online/sala/:code/segunda-vuelta', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || !sala.ronda || sala.ronda.faseRonda !== 'segunda_vuelta') {
    return res.status(400).json({ error: 'No es fase de segunda oportunidad.' });
  }

  const jugador = sala.jugadores.find((j) => j.token === req.body?.token);
  const idPrimero = sala.jugadores[sala.ronda.ordenTurnos[0]].id;

  if (!jugador || jugador.id !== idPrimero) {
    return res.status(403).json({ error: 'Solo el primer jugador tiene segunda oportunidad.' });
  }

  const { cambiarAId } = req.body || {}; // null para mantener, o id de a quién confiar

  if (cambiarAId) {
    const refDecision = sala.ronda.decisiones[cambiarAId];
    if (refDecision) {
      sala.ronda.decisiones[idPrimero] = {
        tipo: 'confia',
        valor: refDecision.valor,
        confiaEnId: Number(cambiarAId)
      };
    }
  }

  if (sala.ronda.pregunta.manual) {
    sala.ronda.faseRonda = 'introducir_real';
  } else {
    resolverPuntuacionesRonda(sala, sala.ronda.pregunta.respuesta);
    sala.ronda.faseRonda = 'resultados';
  }

  res.json({ success: true });
});

// POST /api/aproximacion/online/sala/:code/introducir-real
router.post('/online/sala/:code/introducir-real', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || !sala.ronda || sala.ronda.faseRonda !== 'introducir_real') {
    return res.status(400).json({ error: 'No es momento de introducir la cifra real.' });
  }

  const { valorReal, token } = req.body || {};
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión introduce el resultado final.' });

  const cifra = Math.round(Number(valorReal));
  if (isNaN(cifra)) return res.status(400).json({ error: 'Cifra no válida.' });

  resolverPuntuacionesRonda(sala, cifra);
  sala.ronda.faseRonda = 'resultados';

  res.json({ success: true });
});

// POST /api/aproximacion/online/sala/:code/siguiente-ronda
router.post('/online/sala/:code/siguiente-ronda', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  if (sala.rondaNum >= MAX_RONDAS) {
    sala.estado = 'final';
  } else {
    sala.rondaNum += 1;
    prepararNuevaRonda(sala);
  }

  res.json({ success: true });
});

// POST /api/aproximacion/online/sala/:code/finalizar
router.post('/online/sala/:code/finalizar', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'final';
  res.json({ success: true });
});

export default router;