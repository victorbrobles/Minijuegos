// server/routes/cuatroclubes.js
import express from 'express';
import combinaciones from '../data/seeds/cuatroclubes/cuatroclubes.js';

const router = express.Router();
const TIEMPO_S = 90; // 90 segundos por turno de cada jugador
const MAX_JUGADORES = 10;
const MIN_JUGADORES = 2;

function barajarArray(array) {
  if (!Array.isArray(array)) return [];
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Construye el orden de turnos de la ronda empezando por el jugador correspondiente a esa ronda
function construirOrdenTurnos(jugadores, rondaNum) {
  const n = jugadores.length;
  if (n === 0) return [];
  const inicioIdx = ((rondaNum - 1) % n + n) % n;
  const orden = [];
  for (let k = 0; k < n; k++) {
    orden.push(jugadores[(inicioIdx + k) % n].id);
  }
  return orden;
}

// MODO LOCAL (OFFLINE)
router.post('/reto-local', (req, res) => {
  try {
    const { usados = [] } = req.body || {};
    let libres = (combinaciones || []).filter((c) => !usados.includes(c.id));
    if (libres.length === 0) libres = combinaciones || [];
    const elegida = libres[Math.floor(Math.random() * libres.length)];

    res.json({
      success: true,
      reto: elegida || null
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// MODO ONLINE
const salasCuatroClubes = new Map();

function generarCodigo() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let cod = '';
  for (let i = 0; i < 4; i++) cod += letras[Math.floor(Math.random() * letras.length)];
  return cod;
}

router.post('/online/crear', (req, res) => {
  try {
    const { nombre } = req.body || {};
    if (!nombre?.trim()) return res.status(400).json({ error: 'Nombre requerido.' });

    let code = generarCodigo();
    while (salasCuatroClubes.has(code)) code = generarCodigo();

    const tokenAdmin = 'tok_' + Math.random().toString(36).substring(2);
    const sala = {
      code,
      estado: 'lobby', // 'lobby' | 'jugando' | 'resumen' | 'final'
      adminToken: tokenAdmin,
      rondaNum: 1,
      maxRondas: 6,
      usados: [],
      jugadores: [{ id: 1, nombre: nombre.trim(), token: tokenAdmin, puntos: 0 }],
      ronda: null
    };

    salasCuatroClubes.set(code, sala);
    res.json({ success: true, code, token: tokenAdmin });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/online/unirse', (req, res) => {
  try {
    const { code, nombre } = req.body || {};
    const sala = salasCuatroClubes.get(code?.toUpperCase());

    if (!sala) return res.status(404).json({ error: 'Sala no encontrada.' });
    if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha comenzado.' });
    if (sala.jugadores.length >= MAX_JUGADORES) {
      return res.status(400).json({ error: `Sala llena (máx ${MAX_JUGADORES} jugadores).` });
    }

    const token = 'tok_' + Math.random().toString(36).substring(2);
    const nuevoId = sala.jugadores.length > 0 ? Math.max(...sala.jugadores.map((j) => j.id)) + 1 : 1;

    sala.jugadores.push({
      id: nuevoId,
      nombre: nombre?.trim() || `Jugador ${nuevoId}`,
      token,
      puntos: 0
    });

    res.json({ success: true, code: sala.code, token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/online/sala/:code', (req, res) => {
  try {
    const sala = salasCuatroClubes.get(req.params.code?.toUpperCase());
    if (!sala) return res.status(404).json({ error: 'Sala no disponible.' });

    const token = req.query.token;
    const jugador = sala.jugadores.find((j) => j.token === token);
    if (!jugador) return res.status(401).json({ error: 'Token no válido.' });

    const adminPlayer = sala.jugadores.find((j) => j.token === sala.adminToken);
    const ahora = Date.now();

    let infoRonda = null;
    if (sala.ronda) {
      const ordenTurnos = sala.ronda.ordenTurnos || [];
      let segsRestantes = 0;

      if (sala.estado === 'jugando') {
        segsRestantes = Math.max(0, Math.ceil((sala.ronda.finTurno - ahora) / 1000));

        // Si el temporizador de 90s del jugador actual llega a 0, suma 0 pts y pasa al siguiente turno
        if (segsRestantes === 0) {
          const jugadorActualId = ordenTurnos[sala.ronda.turnoIdx];
          const targetPlayer = sala.jugadores.find((j) => j.id === jugadorActualId);

          if (targetPlayer) {
            sala.ronda.respuestasRonda.push({
              jugadorId: targetPlayer.id,
              nombre: targetPlayer.nombre,
              puntos: 0,
              tiempoAgotado: true
            });
            sala.ronda.ultimo = {
              tipo: 'tiempo_agotado',
              jugador: targetPlayer.nombre,
              puntos: 0
            };
          }

          sala.ronda.turnoIdx += 1;
          if (sala.ronda.turnoIdx >= ordenTurnos.length) {
            sala.estado = 'resumen';
          } else {
            sala.ronda.finTurno = ahora + TIEMPO_S * 1000;
            segsRestantes = TIEMPO_S;
          }
        }
      }

      const turnoIdx = sala.ronda.turnoIdx ?? 0;
      const turnoJugadorId = ordenTurnos[turnoIdx] ?? null;
      const jugadorActual = sala.jugadores.find((j) => j.id === turnoJugadorId) || null;
      const jugadorInicial = sala.jugadores.find((j) => j.id === ordenTurnos[0]) || null;

      infoRonda = {
        reto: sala.ronda.reto,
        segsRestantes,
        ordenTurnos,
        turnoIdx,
        turnoJugadorId,
        turnoJugadorNombre: jugadorActual ? jugadorActual.nombre : null,
        iniciaRondaId: jugadorInicial ? jugadorInicial.id : null,
        iniciaRondaNombre: jugadorInicial ? jugadorInicial.nombre : null,
        respuestasRonda: sala.ronda.respuestasRonda || [],
        ultimo: sala.ronda.ultimo || null
      };
    }

    res.json({
      success: true,
      code: sala.code,
      estado: sala.estado,
      esAdmin: sala.adminToken === token,
      adminId: adminPlayer ? adminPlayer.id : 1,
      yoId: jugador.id,
      rondaNum: sala.rondaNum || 1,
      maxRondas: sala.maxRondas || sala.jugadores.length * 3,
      jugadores: sala.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos || 0 })),
      ronda: infoRonda
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/online/sala/:code/iniciar', (req, res) => {
  try {
    const sala = salasCuatroClubes.get(req.params.code?.toUpperCase());
    if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });
    if (sala.jugadores.length < MIN_JUGADORES) {
      return res.status(400).json({ error: 'Se necesitan al menos 2 jugadores.' });
    }
    if (!combinaciones || combinaciones.length === 0) {
      return res.status(400).json({ error: 'No hay combinaciones cargadas.' });
    }

    sala.jugadores.forEach((j) => { j.puntos = 0; });
    sala.estado = 'jugando';
    sala.rondaNum = 1;
    sala.maxRondas = sala.jugadores.length * 3;
    sala.usados = [];

    const elegida = barajarArray(combinaciones)[0];
    sala.usados.push(elegida.id);

    // Ronda 1: empieza el jugador 1 (índice 0)
    sala.ronda = {
      reto: elegida,
      ordenTurnos: construirOrdenTurnos(sala.jugadores, 1),
      turnoIdx: 0,
      finTurno: Date.now() + TIEMPO_S * 1000,
      respuestasRonda: [],
      ultimo: null
    };

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/online/sala/:code/puntuar', (req, res) => {
  try {
    const sala = salasCuatroClubes.get(req.params.code?.toUpperCase());
    if (!sala || sala.adminToken !== req.body?.token) {
      return res.status(403).json({ error: 'Solo el anfitrión puede validar la puntuación.' });
    }
    if (!sala.ronda || sala.estado !== 'jugando') {
      return res.status(400).json({ error: 'La ronda no está activa.' });
    }

    const { tipo, puntos } = req.body || {};

    if (tipo === 'fin-ronda') {
      sala.ronda.ultimo = { tipo: 'fin_manual' };
      sala.estado = 'resumen';
      return res.json({ success: true });
    }

    const pts = Math.max(0, Math.min(4, parseInt(puntos, 10) || 0));
    const ordenTurnos = sala.ronda.ordenTurnos || [];
    const jugadorActualId = ordenTurnos[sala.ronda.turnoIdx];
    const targetPlayer = sala.jugadores.find((j) => j.id === jugadorActualId);

    if (!targetPlayer) {
      sala.estado = 'resumen';
      return res.json({ success: true });
    }

    targetPlayer.puntos = (targetPlayer.puntos || 0) + pts;
    sala.ronda.respuestasRonda.push({
      jugadorId: targetPlayer.id,
      nombre: targetPlayer.nombre,
      puntos: pts
    });
    sala.ronda.ultimo = {
      tipo: 'puntuado',
      jugador: targetPlayer.nombre,
      puntos: pts
    };

    sala.ronda.turnoIdx += 1;
    if (sala.ronda.turnoIdx >= ordenTurnos.length) {
      sala.estado = 'resumen';
    } else {
      // Reiniciar el temporizador de 90s para el siguiente jugador del turno
      sala.ronda.finTurno = Date.now() + TIEMPO_S * 1000;
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/online/sala/:code/siguiente-ronda', (req, res) => {
  try {
    const sala = salasCuatroClubes.get(req.params.code?.toUpperCase());
    if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

    const maxRondas = sala.maxRondas || sala.jugadores.length * 3;
    if (sala.rondaNum >= maxRondas) {
      sala.estado = 'final';
    } else {
      sala.rondaNum += 1;
      let libres = (combinaciones || []).filter((c) => !sala.usados.includes(c.id));
      if (libres.length === 0) {
        sala.usados = [];
        libres = combinaciones || [];
      }
      const elegida = libres[Math.floor(Math.random() * libres.length)];
      if (elegida) sala.usados.push(elegida.id);

      // Al cambiar los 4 clubes, empieza la ronda el siguiente jugador secuencialmente
      sala.ronda = {
        reto: elegida || null,
        ordenTurnos: construirOrdenTurnos(sala.jugadores, sala.rondaNum),
        turnoIdx: 0,
        finTurno: Date.now() + TIEMPO_S * 1000,
        respuestasRonda: [],
        ultimo: null
      };
      sala.estado = 'jugando';
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/online/sala/:code/finalizar', (req, res) => {
  try {
    const sala = salasCuatroClubes.get(req.params.code?.toUpperCase());
    if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

    sala.estado = 'final';
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/online/sala/:code/volver-sala', (req, res) => {
  try {
    const sala = salasCuatroClubes.get(req.params.code?.toUpperCase());
    if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

    sala.estado = 'lobby';
    sala.ronda = null;
    sala.rondaNum = 1;
    sala.jugadores.forEach((j) => { j.puntos = 0; });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/online/sala/:code/abandonar', (req, res) => {
  try {
    const sala = salasCuatroClubes.get(req.params.code?.toUpperCase());
    if (!sala) return res.json({ success: true });

    const token = req.body?.token;
    const idx = sala.jugadores.findIndex((j) => j.token === token);
    if (idx !== -1) {
      const eliminado = sala.jugadores[idx];
      sala.jugadores.splice(idx, 1);
      if (sala.jugadores.length === 0) {
        salasCuatroClubes.delete(req.params.code?.toUpperCase());
      } else {
        if (sala.adminToken === token) {
          sala.adminToken = sala.jugadores[0].token;
        }
        if (sala.ronda && Array.isArray(sala.ronda.ordenTurnos)) {
          const posEliminado = sala.ronda.ordenTurnos.indexOf(eliminado.id);
          if (posEliminado !== -1) {
            sala.ronda.ordenTurnos.splice(posEliminado, 1);
            if (posEliminado < sala.ronda.turnoIdx) {
              sala.ronda.turnoIdx = Math.max(0, sala.ronda.turnoIdx - 1);
            } else if (posEliminado === sala.ronda.turnoIdx) {
              sala.ronda.finTurno = Date.now() + TIEMPO_S * 1000;
            }
            if (sala.ronda.turnoIdx >= sala.ronda.ordenTurnos.length && sala.estado === 'jugando') {
              sala.estado = 'resumen';
            }
          }
        }
      }
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
