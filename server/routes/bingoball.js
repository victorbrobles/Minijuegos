// server/routes/bingoball.js
import express from 'express';
import crypto from 'crypto';
import { GRUPOS_BINGOS, getBingoPorId, getTodosJugadoresBingo } from '../data/seeds/bingoball/bingoballData.js';

const router = express.Router();
const salasOnline = {};

const TIEMPO_FUTBOLISTA = 15; // 15 segundos por futbolista

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

// Selecciona un sub-bingo aleatorio dentro del grupo principal seleccionado
function elegirBingoAleatorioDeGrupo(grupoId) {
  const grupo = GRUPOS_BINGOS.find(g => g.id === grupoId) || GRUPOS_BINGOS[0];
  const bingos = grupo.bingos;
  const elegido = bingos[Math.floor(Math.random() * bingos.length)];
  return elegido.id;
}

// Genera un cartón de 4 filas x 3 columnas (12 casillas en total)
function generarCartonParaJugador(bingoId) {
  const bingo = getBingoPorId(bingoId);
  const pool = barajar([...bingo.categorias]);
  const seleccionadas = pool.slice(0, 12);
  const carton = [];

  for (let i = 0; i < seleccionadas.length; i++) {
    const cat = seleccionadas[i];
    const fila = Math.floor(i / 3); // 0, 1, 2, 3
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

// Obtiene un futbolista aleatorio que tenga UTILIDAD REAL para al menos un jugador
function obtenerSiguienteFutbolista(sala) {
  const bingo = getBingoPorId(sala.bingoId);
  if (!bingo || !bingo.categorias) return 'Futbolista Misterioso';

  // 1. Recopilar qué categorías siguen ABIERTAS (no marcadas) en los cartones de todos los jugadores
  const categoriasAbiertasIds = new Set();
  sala.jugadores.forEach(j => {
    (j.carton || []).forEach(casilla => {
      if (!casilla.marcada) {
        categoriasAbiertasIds.add(casilla.categoriaId);
      }
    });
  });

  // Si ya no quedan casillas abiertas en ningún cartón (o todos terminaron)
  if (categoriasAbiertasIds.size === 0) {
    return 'Fin del Cartón';
  }

  // 2. Buscar únicamente los futbolistas que pertenezcan a alguna de esas categorías abiertas
  const futbolistasUtilesSet = new Set();
  bingo.categorias.forEach(cat => {
    if (categoriasAbiertasIds.has(cat.id)) {
      cat.jugadores.forEach(f => futbolistasUtilesSet.add(f));
    }
  });

  const futbolistasUtiles = Array.from(futbolistasUtilesSet);
  if (futbolistasUtiles.length === 0) {
    return 'Futbolista Misterioso';
  }

  // 3. Filtrar para evitar que se repitan los recién salidos (últimos 15) entre los que siguen siendo útiles
  const disponibles = futbolistasUtiles.filter(f => !sala.historialJugadores.slice(-15).includes(f));
  const pool = disponibles.length > 0 ? disponibles : futbolistasUtiles;
  
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
    j.haMarcadoEsteTurno = false;
  });
  siguienteTurnoFutbolista(sala);
}

function siguienteTurnoFutbolista(sala) {
  if (sala.estado !== 'jugando') return;
  if (sala.timer) clearInterval(sala.timer);

  // Al salir un nuevo futbolista, el bloqueo temporal por fallo se resetea
  sala.jugadores.forEach(j => {
    j.bloqueado = false;
    j.haMarcadoEsteTurno = false;
  });

  sala.jugadorActual = obtenerSiguienteFutbolista(sala);
  sala.segundosRestantes = TIEMPO_FUTBOLISTA;

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
    estado: 'lobby',
    grupoId: 'internacional',
    bingoId: 'internacional_unico',
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
    grupoId: sala.grupoId,
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

// 4. Configurar categoría principal del Bingo
router.post('/sala/:code/configurar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, grupoId } = req.body || {};
  const sala = salasOnline[code];

  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });
  const yo = sala.jugadores.find(j => j.token === token);
  if (!yo || !yo.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión puede cambiar la temática' });

  sala.grupoId = grupoId || 'internacional';
  res.json({ success: true, grupoId: sala.grupoId });
});

// 5. Iniciar partida desde el lobby
router.post('/sala/:code/iniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};
  const sala = salasOnline[code];

  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });
  const yo = sala.jugadores.find(j => j.token === token);
  if (!yo || !yo.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión puede iniciar la partida' });
  if (sala.jugadores.length < 3) return res.status(400).json({ error: 'Se necesitan mínimo 3 jugadores' });

  sala.bingoId = elegirBingoAleatorioDeGrupo(sala.grupoId);

  sala.jugadores.forEach(j => {
    j.puntos = 0;
    j.carton = generarCartonParaJugador(sala.bingoId);
    j.bloqueado = false;
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
    return res.status(400).json({ error: 'Estás bloqueado durante este turno por haber fallado.' });
  }

  if (yo.haMarcadoEsteTurno) {
    return res.status(400).json({ error: 'Ya has actuado con este futbolista.' });
  }

  const casilla = (yo.carton || []).find(c => c.id === casillaId);
  if (!casilla || casilla.marcada) {
    return res.status(400).json({ error: 'Casilla no válida o ya marcada.' });
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
    yo.puntos += 2;

    const cartonCompleto = yo.carton.every(c => c.marcada);
    if (cartonCompleto) {
      yo.puntos += 25;
      sala.ganadorBingo = yo.nombre;
      sala.estado = 'bingo_cantado';
      if (sala.timer) clearInterval(sala.timer);

      return res.json({
        success: true,
        acierto: true,
        mensaje: `¡CORRECTO (+2 pts)! ¡${yo.nombre} ha cantado BINGO (+25 pts)!`
      });
    }

    return res.json({
      success: true,
      acierto: true,
      mensaje: `¡Correcto (+2 pts)! ${futbolistaActual} encaja en "${casilla.nombre}".`
    });
  } else {
    yo.puntos = Math.max(0, yo.puntos - 1);
    yo.bloqueado = true;

    return res.json({
      success: true,
      acierto: false,
      mensaje: `¡Fallo (-1 pt)! ${futbolistaActual} NO encaja en "${casilla.nombre}". Bloqueado hasta el siguiente futbolista.`
    });
  }
});

// 7. Cantar línea (Fila de 3 casillas)
router.post('/sala/:code/linea', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, filaIndex } = req.body || {};
  const sala = salasOnline[code];

  if (!sala || sala.estado !== 'jugando') return res.status(400).json({ error: 'Partida no activa' });

  const yo = sala.jugadores.find(j => j.token === token);
  if (!yo) return res.status(403).json({ error: 'No autorizado' });

  const casillasFila = (yo.carton || []).filter(c => c.fila === filaIndex);
  if (casillasFila.length === 3 && casillasFila.every(c => c.marcada)) {
    yo.puntos += 15;

    const bingo = getBingoPorId(sala.bingoId);
    
    // Categorías presentes en las otras 3 filas del cartón
    const categoriasEnOtrasFilas = new Set(
      yo.carton.filter(c => c.fila !== filaIndex).map(c => c.categoriaId)
    );

    // Categorías del bingo que NO están en las otras 3 filas
    const candidatas = bingo.categorias.filter(c => !categoriasEnOtrasFilas.has(c.id));

    // Priorizar las que no acaban de completarse en esta fila
    const categoriasCompletadas = new Set(casillasFila.map(c => c.categoriaId));
    const frescas = candidatas.filter(c => !categoriasCompletadas.has(c.id));

    const seleccionadasParaFila = barajar(frescas.length >= 3 ? frescas : candidatas).slice(0, 3);

    casillasFila.forEach((casilla, idx) => {
      const nuevaCat = seleccionadasParaFila[idx];
      casilla.id = `c_${filaIndex}_${idx}_${Math.random().toString(36).substring(2, 7)}`;
      casilla.categoriaId = nuevaCat.id;
      casilla.nombre = nuevaCat.nombre;
      casilla.marcada = false;
      casilla.jugadorAsignado = null;
    });

    return res.json({ success: true, mensaje: '¡Línea cantada! +15 puntos.' });
  }

  res.status(400).json({ error: 'Fila incompleta' });
});

// 8. Siguiente Bingo (conservando puntos)
router.post('/sala/:code/siguiente-bingo', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, grupoId } = req.body || {};
  const sala = salasOnline[code];

  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });
  const yo = sala.jugadores.find(j => j.token === token);
  if (!yo || !yo.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión puede iniciar el siguiente bingo' });

  if (grupoId) {
    sala.grupoId = grupoId;
  }

  sala.bingoId = elegirBingoAleatorioDeGrupo(sala.grupoId);

  sala.jugadores.forEach(j => {
    j.carton = generarCartonParaJugador(sala.bingoId);
    j.bloqueado = false;
    j.haMarcadoEsteTurno = false;
  });

  sala.ganadorBingo = null;
  sala.historialJugadores = [];
  iniciarFasePreparacion(sala);

  res.json({ success: true });
});

// 9. Finalizar partida
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