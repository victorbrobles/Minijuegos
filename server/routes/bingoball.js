// server/routes/bingoball.js
import express from 'express';
import crypto from 'crypto';
import { getBingoPorId, getTodosJugadoresBingo, LISTA_BINGOS } from '../data/seeds/bingoball/bingoballData.js';

const router = express.Router();
const salasOnline = {};

const barajar = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const generarCodigoSala = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 4; i++) {
    c += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return c;
};

// Genera un cartón de 4 filas x 5 columnas (20 casillas)
function generarCartonParaJugador(bingoId) {
  const bingo = getBingoPorId(bingoId);
  // Barajamos todo el catálogo del bingo y tomamos exactamente 20 categorías distintas
  const pool = barajar([...bingo.categorias]);
  const seleccionadas = pool.slice(0, 20);
  const carton = [];

  for (let i = 0; i < seleccionadas.length; i++) {
    const cat = seleccionadas[i];
    const fila = Math.floor(i / 5); // 0, 1, 2, 3
    carton.push({
      id: `c_${i}_${Math.random().toString(36).substring(2, 7)}`,
      categoriaId: cat.id,
      nombre: cat.nombre,
      fila,
      marcada: false,
      jugadorAsignado: null
    });
  }
  return carton;
}

// Obtiene un futbolista aleatorio del pool del bingo evitando repetir los recientes
function obtenerSiguienteFutbolista(sala) {
  const todos = getTodosJugadoresBingo(sala.bingoId);
  if (!todos || todos.length === 0) return 'Futbolista Misterioso';

  const disponibles = todos.filter(f => !sala.historialJugadores.slice(-15).includes(f));
  const pool = disponibles.length > 0 ? disponibles : todos;
  const elegido = pool[Math.floor(Math.random() * pool.length)];

  sala.historialJugadores.push(elegido);
  return elegido;
}

// -------------------------------------------------------------
// Fases del Juego y Temporizadores
// -------------------------------------------------------------
function iniciarFasePreparacion(sala) {
  if (sala.timer) clearInterval(sala.timer);
  sala.estado = 'preparacion';
  sala.segundosRestantes = 10;

  sala.timer = setInterval(() => {
    sala.segundosRestantes -= 1;
    if (sala.segundosRestantes <= 0) {
      clearInterval(sala.timer);
      iniciarCuentaAtras(sala);
    }
  }, 1000);
}

function iniciarCuentaAtras(sala) {
  if (sala.timer) clearInterval(sala.timer);
  sala.estado = 'cuenta_atras';
  sala.cuentaAtras321 = 3;

  sala.timer = setInterval(() => {
    sala.cuentaAtras321 -= 1;
    if (sala.cuentaAtras321 <= 0) {
      clearInterval(sala.timer);
      iniciarPartidaJugando(sala);
    }
  }, 1000);
}

function iniciarPartidaJugando(sala) {
  sala.estado = 'jugando';
  sala.historialJugadores = [];
  sala.jugadores.forEach(j => {
    j.bloqueado = false;
    j.siguienteBloqueado = false;
    j.haMarcadoEsteTurno = false;
  });
  siguienteTurnoFutbolista(sala);
}

function siguienteTurnoFutbolista(sala) {
  if (sala.estado !== 'jugando') return;
  if (sala.timer) clearInterval(sala.timer);

  // Actualizar estados de bloqueo para este nuevo futbolista
  sala.jugadores.forEach(j => {
    j.bloqueado = Boolean(j.siguienteBloqueado);
    j.siguienteBloqueado = false;
    j.haMarcadoEsteTurno = false;
  });

  sala.jugadorActual = obtenerSiguienteFutbolista(sala);
  sala.segundosRestantes = 10;

  sala.timer = setInterval(() => {
    if (sala.estado !== 'jugando') {
      clearInterval(sala.timer);
      return;
    }

    sala.segundosRestantes -= 1;
    if (sala.segundosRestantes <= 0) {
      clearInterval(sala.timer);
      siguienteTurnoFutbolista(sala);
    }
  }, 1000);
}

// -------------------------------------------------------------
// Endpoints de la API
// -------------------------------------------------------------

// 1. Crear sala
router.post('/crear', (req, res) => {
  const { nombre } = req.body || {};
  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: 'Debes indicar un nombre' });
  }

  let code = generarCodigoSala();
  while (salasOnline[code]) code = generarCodigoSala();

  const token = crypto.randomUUID();

  salasOnline[code] = {
    code,
    estado: 'lobby', // 'lobby' | 'preparacion' | 'cuenta_atras' | 'jugando' | 'bingo_cantado' | 'final'
    bingoId: 'internacional_1',
    segundosRestantes: 10,
    cuentaAtras321: 3,
    jugadorActual: null,
    ganadorBingo: null,
    historialJugadores: [],
    timer: null,
    jugadores: [
      {
        id: 1,
        nombre: nombre.trim(),
        token,
        puntos: 0,
        esAdmin: true,
        carton: [],
        bloqueado: false,
        siguienteBloqueado: false,
        haMarcadoEsteTurno: false
      }
    ]
  };

  res.json({ success: true, code, token });
});

// 2. Unirse a sala
router.post('/unirse', (req, res) => {
  const { nombre, joinCode } = req.body || {};
  const code = (joinCode || '').trim().toUpperCase();
  const sala = salasOnline[code];

  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha comenzado' });
  if (sala.jugadores.length >= 15) return res.status(400).json({ error: 'La sala está llena (máx. 15 jugadores)' });

  if (sala.jugadores.some(j => j.nombre.toLowerCase() === nombre.trim().toLowerCase())) {
    return res.status(400).json({ error: 'Ya hay un jugador con ese nombre en la sala' });
  }

  const token = crypto.randomUUID();
  const nuevoId = sala.jugadores.length > 0 ? Math.max(...sala.jugadores.map(j => j.id)) + 1 : 1;

  sala.jugadores.push({
    id: nuevoId,
    nombre: nombre.trim(),
    token,
    puntos: 0,
    esAdmin: false,
    carton: [],
    bloqueado: false,
    siguienteBloqueado: false,
    haMarcadoEsteTurno: false
  });

  res.json({ success: true, code, token });
});

// 3. Consultar estado de sala
router.get('/sala/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.query;
  const sala = salasOnline[code];

  if (!sala) return res.status(404).json({ error: 'Sala no encontrada o cerrada' });

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
    ganadorBingo: sala.ganadorBingo,
    miCarton: yo.carton || [],
    bloqueado: Boolean(yo.bloqueado),
    puntos: yo.puntos,
    esAdmin: yo.esAdmin,
    jugadores: sala.jugadores.map(j => ({
      id: j.id,
      nombre: j.nombre,
      puntos: j.puntos,
      esTu: j.id === yo.id,
      esAdmin: j.esAdmin
    }))
  });
});

// 4. Configurar temática de Bingo
router.post('/sala/:code/configurar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, bingoId } = req.body || {};
  const sala = salasOnline[code];

  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });
  const yo = sala.jugadores.find(j => j.token === token);
  if (!yo || !yo.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión puede cambiar la temática' });

  sala.bingoId = bingoId || 'internacional_1';
  res.json({ success: true, bingoId: sala.bingoId });
});

// 5. Iniciar partida desde el lobby (reinicio total a 0)
router.post('/sala/:code/iniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};
  const sala = salasOnline[code];

  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });
  const yo = sala.jugadores.find(j => j.token === token);
  if (!yo || !yo.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión puede iniciar la partida' });
  if (sala.jugadores.length < 3) return res.status(400).json({ error: 'Se necesitan mínimo 3 jugadores' });

  // Reiniciar puntuaciones para una partida completa desde cero
  sala.jugadores.forEach(j => {
    j.puntos = 0;
    j.carton = generarCartonParaJugador(sala.bingoId);
    j.bloqueado = false;
    j.siguienteBloqueado = false;
    j.haMarcadoEsteTurno = false;
  });

  sala.ganadorBingo = null;
  iniciarFasePreparacion(sala);

  res.json({ success: true });
});

// 6. Marcar casilla en el cartón
router.post('/sala/:code/marcar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, casillaId } = req.body || {};
  const sala = salasOnline[code];

  if (!sala || sala.estado !== 'jugando') return res.status(400).json({ error: 'Partida no activa' });

  const yo = sala.jugadores.find(j => j.token === token);
  if (!yo) return res.status(403).json({ error: 'Jugador no encontrado' });

  if (yo.bloqueado) {
    return res.status(400).json({ error: 'Estás bloqueado este turno por tu fallo anterior' });
  }

  if (yo.haMarcadoEsteTurno) {
    return res.status(400).json({ error: 'Ya has actuado con este futbolista' });
  }

  const casilla = (yo.carton || []).find(c => c.id === casillaId);
  if (!casilla || casilla.marcada) {
    return res.status(400).json({ error: 'Casilla no válida o ya marcada' });
  }

  const bingo = getBingoPorId(sala.bingoId);
  const categoria = bingo.categorias.find(c => c.id === casilla.categoriaId);
  const futbolistaActual = sala.jugadorActual;

  const esCorrecto = categoria && categoria.jugadores.some(
    nombreJugador => nombreJugador.toLowerCase() === (futbolistaActual || '').toLowerCase()
  );

  yo.haMarcadoEsteTurno = true;

  if (esCorrecto) {
    casilla.marcada = true;
    casilla.jugadorAsignado = futbolistaActual;

    // Verificar si ha completado todo el cartón (Bingo)
    const cartonCompleto = yo.carton.every(c => c.marcada);
    if (cartonCompleto) {
      yo.puntos += 10;
      sala.ganadorBingo = yo.nombre;
      sala.estado = 'bingo_cantado';
      if (sala.timer) clearInterval(sala.timer);

      return res.json({
        success: true,
        acierto: true,
        mensaje: `¡CORRECTO! ¡${yo.nombre} ha cantado BINGO!`
      });
    }

    return res.json({
      success: true,
      acierto: true,
      mensaje: `¡Correcto! ${futbolistaActual} encaja en "${casilla.nombre}".`
    });
  } else {
    // Fallo: queda bloqueado en el siguiente turno
    yo.siguienteBloqueado = true;

    return res.json({
      success: true,
      acierto: false,
      mensaje: `¡Fallo! ${futbolistaActual} NO encaja en "${casilla.nombre}". Quedarás bloqueado el próximo turno.`
    });
  }
});

// Reemplazar endpoint de cantar línea:
router.post('/sala/:code/linea', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, filaIndex } = req.body || {};
  const sala = salasOnline[code];

  if (!sala || sala.estado !== 'jugando') return res.status(400).json({ error: 'Partida no activa' });

  const yo = sala.jugadores.find(j => j.token === token);
  if (!yo) return res.status(403).json({ error: 'No autorizado' });

  const casillasFila = (yo.carton || []).filter(c => c.fila === filaIndex);
  if (casillasFila.length === 5 && casillasFila.every(c => c.marcada)) {
    yo.puntos += 5;

    const bingo = getBingoPorId(sala.bingoId);
    
    // 1. Categorías presentes en las otras 3 filas del cartón
    const categoriasEnOtrasFilas = new Set(
      yo.carton.filter(c => c.fila !== filaIndex).map(c => c.categoriaId)
    );

    // 2. Categorías del bingo que NO están en las otras 3 filas
    const candidatas = bingo.categorias.filter(c => !categoriasEnOtrasFilas.has(c.id));

    // 3. Priorizar las que tampoco acaban de completarse en esta fila
    const categoriasCompletadas = new Set(casillasFila.map(c => c.categoriaId));
    const frescas = candidatas.filter(c => !categoriasCompletadas.has(c.id));

    const seleccionadasParaFila = barajar(frescas.length >= 5 ? frescas : candidatas).slice(0, 5);

    casillasFila.forEach((casilla, idx) => {
      const nuevaCat = seleccionadasParaFila[idx];
      casilla.id = `c_${filaIndex}_${idx}_${Math.random().toString(36).substring(2, 7)}`;
      casilla.categoriaId = nuevaCat.id;
      casilla.nombre = nuevaCat.nombre;
      casilla.marcada = false;
      casilla.jugadorAsignado = null;
    });

    return res.json({ success: true, mensaje: '¡Línea cantada! +5 puntos.' });
  }

  res.status(400).json({ error: 'Fila incompleta' });
});

// 8. Siguiente Bingo (conservando los puntos de cada jugador)
router.post('/sala/:code/siguiente-bingo', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, bingoId } = req.body || {};
  const sala = salasOnline[code];

  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });
  const yo = sala.jugadores.find(j => j.token === token);
  if (!yo || !yo.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión puede iniciar el siguiente bingo' });

  if (bingoId) {
    sala.bingoId = bingoId;
  }

  // Se regeneran los cartones pero se conservan los puntos acumulados
  sala.jugadores.forEach(j => {
    j.carton = generarCartonParaJugador(sala.bingoId);
    j.bloqueado = false;
    j.siguienteBloqueado = false;
    j.haMarcadoEsteTurno = false;
  });

  sala.ganadorBingo = null;
  sala.historialJugadores = [];
  iniciarFasePreparacion(sala);

  res.json({ success: true });
});

// 9. Finalizar partida y mostrar Podio Definitivo
router.post('/sala/:code/finalizar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};
  const sala = salasOnline[code];

  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });
  const yo = sala.jugadores.find(j => j.token === token);
  if (!yo || !yo.esAdmin) return res.status(403).json({ error: 'No autorizado' });

  if (sala.timer) clearInterval(sala.timer);
  sala.estado = 'final';

  res.json({ success: true });
});

// 10. Salir de la sala
router.post('/sala/:code/salir', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};
  const sala = salasOnline[code];

  if (sala) {
    const idx = sala.jugadores.findIndex(j => j.token === token);
    if (idx !== -1) {
      const eraAdmin = sala.jugadores[idx].esAdmin;
      sala.jugadores.splice(idx, 1);

      if (sala.jugadores.length === 0) {
        if (sala.timer) clearInterval(sala.timer);
        delete salasOnline[code];
      } else if (eraAdmin) {
        sala.jugadores[0].esAdmin = true;
      }
    }
  }

  res.json({ success: true });
});

export default router;