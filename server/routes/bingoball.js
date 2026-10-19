// server/routes/bingoball.js
import express from 'express';
import crypto from 'crypto';
import { BINGOS, LISTA_BINGOS, getBingoPorId, getTodosJugadoresBingo } from '../data/seeds/bingoball/bingoballData.js';

const router = express.Router();
const salas = {};

const generarCodigo = () => Math.random().toString(36).substring(2, 6).toUpperCase();

// Genera un cartón de 4 filas x 5 columnas (20 casillas) sin categorías repetidas
const generarCarton = (bingoId) => {
  const bingo = getBingoPorId(bingoId);
  const pool = [...bingo.categorias].sort(() => Math.random() - 0.5);
  const seleccionadas = pool.slice(0, 20);

  const casillas = [];
  let idx = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      const cat = seleccionadas[idx++];
      casillas.push({
        id: `${r}-${c}`,
        fila: r,
        col: c,
        categoriaId: cat.id,
        nombre: cat.nombre,
        marcada: false,
        jugadorAsignado: null
      });
    }
  }
  return casillas;
};

// Genera 5 categorías nuevas que no estén ya en el cartón
const generarNuevaLinea = (bingoId, casillasActuales, filaIndex) => {
  const bingo = getBingoPorId(bingoId);
  const usadas = new Set(casillasActuales.map(c => c.categoriaId));
  const disponibles = bingo.categorias.filter(c => !usadas.has(c.id)).sort(() => Math.random() - 0.5);

  const nuevas = [];
  for (let c = 0; c < 5; c++) {
    const cat = disponibles[c] || bingo.categorias[Math.floor(Math.random() * bingo.categorias.length)];
    nuevas.push({
      id: `${filaIndex}-${c}-${Date.now()}`,
      fila: filaIndex,
      col: c,
      categoriaId: cat.id,
      nombre: cat.nombre,
      marcada: false,
      jugadorAsignado: null
    });
  }
  return nuevas;
};

router.get('/temas', (req, res) => {
  res.json({ success: true, temas: LISTA_BINGOS });
});

router.post('/crear', (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Falta nombre' });

  const code = generarCodigo();
  const token = crypto.randomUUID();

  salas[code] = {
    code,
    estado: 'lobby', // 'lobby' | 'preparacion' (10s ver tablero) | 'cuenta_atras' (3.2.1) | 'jugando' | 'fin'
    bingoId: 'internacional',
    segundosRestantes: 10,
    cuentaAtras321: 3,
    jugadorActual: null,
    indiceJugador: 0,
    jugadoresBarajados: [],
    timer: null,
    bloqueosSiguiente: {}, // { [token]: true }
    lineasCantadas: {}, // { [token]: [fila0, fila1, ...] }
    jugadores: [{ id: 1, nombre: nombre.trim(), token, puntos: 0, esAdmin: true, carton: [] }]
  };

  res.json({ success: true, code, token });
});

router.post('/unirse', (req, res) => {
  const { nombre, joinCode } = req.body;
  const sala = salas[joinCode];
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha comenzado' });
  if (sala.jugadores.length >= 15) return res.status(400).json({ error: 'Sala llena (máximo 15 jugadores)' });

  const token = crypto.randomUUID();
  const newId = sala.jugadores.length > 0 ? Math.max(...sala.jugadores.map(j => j.id)) + 1 : 1;
  sala.jugadores.push({ id: newId, nombre: nombre.trim(), token, puntos: 0, esAdmin: false, carton: [] });

  res.json({ success: true, code: joinCode, token });
});

router.post('/sala/:code/configurar', (req, res) => {
  const { code } = req.params;
  const { token, bingoId } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || !yo.esAdmin || sala.estado !== 'lobby') return res.status(403).json({ error: 'No autorizado' });

  if (BINGOS[bingoId]) {
    sala.bingoId = bingoId;
  }
  res.json({ success: true, bingoId: sala.bingoId });
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
    bingoId: sala.bingoId,
    segundosRestantes: sala.segundosRestantes,
    cuentaAtras321: sala.cuentaAtras321,
    jugadorActual: sala.jugadorActual,
    esAdmin: yo.esAdmin,
    miCarton: yo.carton,
    bloqueado: Boolean(sala.bloqueosSiguiente[token]),
    puntos: yo.puntos,
    jugadores: sala.jugadores.map(j => ({
      id: j.id,
      nombre: j.nombre,
      puntos: j.puntos,
      esTu: j.id === yo.id,
      esAdmin: j.esAdmin
    }))
  });
});

// Rutina del bucle de futbolistas (cada 10s)
const iniciarTurnoFutbolista = (sala) => {
  if (sala.estado === 'fin') return;

  if (sala.indiceJugador >= sala.jugadoresBarajados.length) {
    // Si se agotan, se barajan de nuevo
    sala.jugadoresBarajados = getTodosJugadoresBingo(sala.bingoId).sort(() => Math.random() - 0.5);
    sala.indiceJugador = 0;
  }

  sala.jugadorActual = sala.jugadoresBarajados[sala.indiceJugador++];
  sala.segundosRestantes = 10;
  sala.estado = 'jugando';

  // Aplicar bloqueos pendientes para este turno y limpiar para el siguiente
  sala.bloqueosActivos = { ...sala.bloqueosSiguiente };
  sala.bloqueosSiguiente = {};
  sala.asignadosEnTurno = {}; // { [token]: true }

  if (sala.timer) clearInterval(sala.timer);
  sala.timer = setInterval(() => {
    sala.segundosRestantes -= 1;
    if (sala.segundosRestantes <= 0) {
      clearInterval(sala.timer);
      if (sala.estado === 'jugando') {
        iniciarTurnoFutbolista(sala);
      }
    }
  }, 1000);
};

router.post('/sala/:code/iniciar', (req, res) => {
  const { code } = req.params;
  const { token } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || !yo.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión puede iniciar' });
  if (sala.jugadores.length < 3) return res.status(400).json({ error: 'Se necesitan mínimo 3 jugadores' });

  // 1. Repartir cartones individuales 4x5
  sala.jugadores.forEach(j => {
    j.puntos = 0;
    j.carton = generarCarton(sala.bingoId);
  });

  sala.jugadoresBarajados = getTodosJugadoresBingo(sala.bingoId).sort(() => Math.random() - 0.5);
  sala.indiceJugador = 0;
  sala.lineasCantadas = {};
  sala.bloqueosSiguiente = {};

  // 2. Fase de 10s para observar el tablero
  sala.estado = 'preparacion';
  sala.segundosRestantes = 10;

  if (sala.timer) clearInterval(sala.timer);
  sala.timer = setInterval(() => {
    sala.segundosRestantes -= 1;
    if (sala.segundosRestantes <= 0) {
      clearInterval(sala.timer);

      // 3. Cuenta atrás 3..2..1 en medio de la pantalla
      sala.estado = 'cuenta_atras';
      sala.cuentaAtras321 = 3;

      sala.timer = setInterval(() => {
        sala.cuentaAtras321 -= 1;
        if (sala.cuentaAtras321 <= 0) {
          clearInterval(sala.timer);
          iniciarTurnoFutbolista(sala);
        }
      }, 1000);
    }
  }, 1000);

  res.json({ success: true });
});

router.post('/sala/:code/marcar', (req, res) => {
  const { code } = req.params;
  const { token, casillaId } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || sala.estado !== 'jugando') return res.status(400).json({ error: 'No es momento de marcar' });

  if (sala.bloqueosActivos?.[token]) {
    return res.status(400).json({ error: 'Estás bloqueado durante este turno por fallar el anterior' });
  }

  if (sala.asignadosEnTurno?.[token]) {
    return res.status(400).json({ error: 'Ya has asignado a este jugador en tu cartón' });
  }

  const casilla = yo.carton.find(c => c.id === casillaId);
  if (!casilla || casilla.marcada) return res.status(400).json({ error: 'Casilla inválida o ya completada' });

  const bingo = getBingoPorId(sala.bingoId);
  const categoria = bingo.categorias.find(c => c.id === casilla.categoriaId);
  const encaja = categoria?.jugadores.includes(sala.jugadorActual);

  if (encaja) {
    casilla.marcada = true;
    casilla.jugadorAsignado = sala.jugadorActual;
    sala.asignadosEnTurno[token] = true;

    // Verificar si ha completado todo el cartón (Bingo = 10 pts y fin de partida)
    const todasCompletas = yo.carton.every(c => c.marcada);
    if (todasCompletas) {
      yo.puntos += 10;
      if (sala.timer) clearInterval(sala.timer);
      sala.estado = 'fin';
      return res.json({ success: true, encaja: true, bingo: true, ganador: yo.nombre });
    }

    return res.json({ success: true, encaja: true });
  } else {
    // Si no encaja, mensaje de fallo y queda bloqueado para el siguiente futbolista
    sala.bloqueosSiguiente[token] = true;
    return res.json({ success: true, encaja: false, mensaje: `¡Fallo! ${sala.jugadorActual} no encaja en "${casilla.nombre}". Quedas bloqueado en el siguiente turno.` });
  }
});

// Enviar / Cantar línea
router.post('/sala/:code/linea', (req, res) => {
  const { code } = req.params;
  const { token, filaIndex } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || sala.estado !== 'jugando') return res.status(400).json({ error: 'Partida no activa' });

  // Comprobar que las 5 casillas de esa fila estén marcadas
  const casillasFila = yo.carton.filter(c => c.fila === filaIndex);
  if (casillasFila.length !== 5 || !casillasFila.every(c => c.marcada)) {
    return res.status(400).json({ error: 'La línea no está completa todavía' });
  }

  // Comprobar que no se haya cobrado ya esa fila
  sala.lineasCantadas[token] = sala.lineasCantadas[token] || [];
  if (sala.lineasCantadas[token].includes(filaIndex)) {
    return res.status(400).json({ error: 'Ya has cantado y renovado esta línea' });
  }

  // Sumar 5 puntos
  yo.puntos += 5;
  sala.lineasCantadas[token].push(filaIndex);

  // Asignar una nueva línea vacía con 5 categorías nuevas
  const nuevasCasillas = generarNuevaLinea(sala.bingoId, yo.carton, filaIndex);
  yo.carton = yo.carton.map(c => c.fila === filaIndex ? nuevasCasillas.find(nc => nc.col === c.col) : c);

  res.json({ success: true, puntos: yo.puntos, miCarton: yo.carton });
});

router.post('/sala/:code/salir', (req, res) => {
  const { code } = req.params;
  const { token } = req.body;
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