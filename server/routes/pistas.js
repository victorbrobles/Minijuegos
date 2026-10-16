// server/routes/pistas.js
import { Router } from 'express';
import { PISTAS_SEED } from '../data/seeds/pistas/pistas.seed.js';
import { barajar } from '../lib/barajar.js';

const router = Router();

function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function distanciaLevenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function esParecido(u, o) {
  const maxL = Math.max(u.length, o.length);
  if (maxL <= 4) return distanciaLevenshtein(u, o) <= 1;
  if (maxL <= 8) return distanciaLevenshtein(u, o) <= 2;
  return distanciaLevenshtein(u, o) <= 3;
}

function comprobarRespuesta(usuario, item) {
  const u = normalizar(usuario);
  if (!u) return false;
  const opciones = [item.nombre, ...item.alias].map(normalizar);

  return opciones.some((opc) => {
    if (u === opc) return true;
    if (esParecido(u, opc)) return true;
    if (u.length >= 4 && (opc.includes(u) || u.includes(opc))) return true;
    return false;
  });
}

// ==========================================
// ENDPOINTS OFFLINE / LOCAL (INTACTOS)
// ==========================================
router.post('/iniciar-ronda', (req, res) => {
  const { usados = [] } = req.body ?? {};
  const disponibles = PISTAS_SEED.filter((p) => !usados.includes(p.id));
  const pool = disponibles.length > 0 ? disponibles : PISTAS_SEED;
  const elegido = barajar([...pool])[0];

  res.json({
    id: elegido.id,
    pistas: elegido.pistas
  });
});

router.post('/validar', (req, res) => {
  const { id, respuesta } = req.body ?? {};
  const item = PISTAS_SEED.find((p) => p.id === id);
  if (!item) return res.status(404).json({ error: 'Elemento no encontrado' });

  const acierto = comprobarRespuesta(respuesta, item);
  res.json({
    acierto,
    nombreReal: item.nombre
  });
});

router.post('/solucion', (req, res) => {
  const { id } = req.body ?? {};
  const item = PISTAS_SEED.find((p) => p.id === id);
  if (!item) return res.status(404).json({ error: 'Elemento no encontrado' });

  res.json({
    nombre: item.nombre
  });
});

// ==========================================
// SALAS ONLINE (MULTIDISPOSITIVO CON PULSADOR)
// ==========================================
const salasOnline = {};

function generarCodigoSala() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 4; i++) {
    c += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return c;
}

function generarToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function iniciarNuevaRondaOnline(sala) {
  const disponibles = PISTAS_SEED.filter((p) => !sala.usados.includes(p.id));
  const pool = disponibles.length > 0 ? disponibles : PISTAS_SEED;
  const elegido = barajar([...pool])[0];
  sala.usados.push(elegido.id);

  sala.ronda = {
    id: elegido.id,
    pistas: elegido.pistas,
    pistasReveladas: 1,
    segundosRestantes: 10,
    ultimaPistaTs: Date.now(),
    estaPausado: false,
    bloqueados: [],
    acertados: [],
    pulsado: null, // { jugadorId, nombre, texto }
    estadoRonda: 'activa', // 'activa' | 'resuelta'
    solucion: null,
    mensaje: null
  };
}

// 1. Crear sala online
router.post('/online/crear', (req, res) => {
  const nombre = (req.body?.nombre || '').trim();
  if (!nombre) return res.status(400).json({ error: 'Debes indicar un nombre.' });

  let code = generarCodigoSala();
  while (salasOnline[code]) code = generarCodigoSala();

  const tokenAdmin = generarToken();

  salasOnline[code] = {
    code,
    adminToken: tokenAdmin,
    estado: 'lobby', // 'lobby' | 'jugando' | 'final'
    modo: 'estandar', // 'estandar' | 'supervivencia'
    rondaNum: 1,
    usados: [],
    jugadores: [{ id: 1, token: tokenAdmin, nombre, puntos: 0, vidas: 3, conectado: true }],
    ronda: null
  };

  res.json({ success: true, code, token: tokenAdmin, jugadorId: 1 });
});

// 2. Unirse a sala online
router.post('/online/unirse', (req, res) => {
  const code = (req.body?.code || '').trim().toUpperCase();
  const nombre = (req.body?.nombre || '').trim();

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe o el código es incorrecto.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha comenzado.' });
  if (sala.jugadores.length >= 15) return res.status(400).json({ error: 'La sala está completa.' });
  if (sala.jugadores.some((j) => j.nombre.toLowerCase() === nombre.toLowerCase())) {
    return res.status(400).json({ error: 'Ya hay un jugador con ese nombre en la sala.' });
  }

  const token = generarToken();
  const nuevoId = sala.jugadores.length + 1;
  sala.jugadores.push({ id: nuevoId, token, nombre, puntos: 0, vidas: 3, conectado: true });

  res.json({ success: true, code, token, jugadorId: nuevoId });
});

// 3. Cambiar modo de juego (sólo anfitrión en el lobby)
router.post('/online/sala/:code/modo', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, modo } = req.body || {};
  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  sala.modo = modo === 'supervivencia' ? 'supervivencia' : 'estandar';
  res.json({ success: true, modo: sala.modo });
});

// 4. Estado de la sala (sincroniza el tiempo y avanza pistas automáticamente)
router.get('/online/sala/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const token = req.query.token;

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe o ha caducado.' });

  const jugadorActual = sala.jugadores.find((j) => j.token === token);
  if (!jugadorActual) return res.status(403).json({ error: 'No perteneces a esta sala.' });

  const esAdmin = sala.adminToken === token;

  // Lógica de avance de pistas cada 10 s cuando la ronda está activa
  if (sala.estado === 'jugando' && sala.ronda && sala.ronda.estadoRonda === 'activa') {
    if (!sala.ronda.estaPausado && !sala.ronda.pulsado) {
      const ahora = Date.now();
      const transcurrido = (ahora - sala.ronda.ultimaPistaTs) / 1000;

      if (transcurrido >= 10) {
        if (sala.ronda.pistasReveladas < 6) {
          sala.ronda.pistasReveladas += 1;
          sala.ronda.ultimaPistaTs = ahora;
          sala.ronda.segundosRestantes = 10;
        } else {
          // Se agotan las 6 pistas
          const item = PISTAS_SEED.find((p) => p.id === sala.ronda.id);
          sala.ronda.estadoRonda = 'resuelta';
          sala.ronda.solucion = item ? item.nombre : '';
          sala.ronda.segundosRestantes = 0;
          sala.ronda.mensaje = {
            tipo: 'info',
            texto: `¡Se acabaron las pistas! Nadie más ha acertado. Era: ${item?.nombre}`
          };
        }
      } else {
        sala.ronda.segundosRestantes = Math.max(0, 10 - transcurrido);
      }
    } else {
      sala.ronda.ultimaPistaTs = Date.now();
    }
  }

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    modo: sala.modo,
    esAdmin,
    yoId: jugadorActual.id,
    rondaNum: sala.rondaNum,
    jugadores: sala.jugadores.map((j) => ({
      id: j.id,
      nombre: j.nombre,
      puntos: j.puntos,
      vidas: j.vidas,
      bloqueado: sala.ronda ? sala.ronda.bloqueados.includes(j.id) : false,
      acerto: sala.ronda ? sala.ronda.acertados.some((a) => a.jugadorId === j.id) : false
    })),
    ronda: sala.ronda
  });
});

// 5. Iniciar partida desde el lobby (sólo anfitrión)
router.post('/online/sala/:code/iniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede iniciar.' });

  sala.estado = 'jugando';
  sala.rondaNum = 1;
  sala.usados = [];
  sala.jugadores.forEach((j) => {
    j.puntos = 0;
    j.vidas = 3;
  });
  iniciarNuevaRondaOnline(sala);

  res.json({ success: true });
});

// 6. Pulsador rojo online: detiene el tiempo y asigna el turno a quien pulsó
router.post('/online/sala/:code/pulsar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || !sala.ronda) return res.status(404).json({ error: 'Partida no activa.' });

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador) return res.status(403).json({ error: 'Jugador no válido.' });

  if (sala.ronda.estadoRonda !== 'activa') return res.status(400).json({ error: 'La ronda ya terminó.' });
  if (sala.ronda.pulsado !== null) return res.status(409).json({ error: 'Otro jugador ya ha pulsado el botón.' });
  if (sala.ronda.bloqueados.includes(jugador.id)) return res.status(403).json({ error: 'Ya has fallado en esta ronda.' });
  if (sala.ronda.acertados.some((a) => a.jugadorId === jugador.id)) return res.status(400).json({ error: 'Ya has acertado.' });
  if (sala.modo === 'supervivencia' && jugador.vidas <= 0) return res.status(403).json({ error: 'No te quedan vidas.' });

  sala.ronda.pulsado = {
    jugadorId: jugador.id,
    nombre: jugador.nombre,
    texto: ''
  };
  sala.ronda.estaPausado = true;
  sala.ronda.mensaje = {
    tipo: 'info',
    texto: `¡${jugador.nombre} ha pulsado el botón! Está respondiendo...`
  };

  res.json({ success: true });
});

// 7. Transmisión de tecleo en tiempo real
router.post('/online/sala/:code/teclear', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, texto } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || !sala.ronda || !sala.ronda.pulsado) return res.json({ success: true });

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador || sala.ronda.pulsado.jugadorId !== jugador.id) return res.json({ success: true });

  sala.ronda.pulsado.texto = String(texto || '').slice(0, 80);
  res.json({ success: true });
});

// 8. Responder y validar online
router.post('/online/sala/:code/responder', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, respuesta } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || !sala.ronda || !sala.ronda.pulsado) return res.status(400).json({ error: 'No hay turno para responder.' });

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador || sala.ronda.pulsado.jugadorId !== jugador.id) return res.status(403).json({ error: 'No es tu turno de responder.' });

  const item = PISTAS_SEED.find((p) => p.id === sala.ronda.id);
  const acierto = comprobarRespuesta(respuesta, item);
  const pistaActual = sala.ronda.pistasReveladas;

  if (acierto) {
    let ptsGanados = 0;
    let deltaVidas = 0;

    if (sala.modo === 'estandar') {
      ptsGanados = 6 - pistaActual + 1;
      jugador.puntos += ptsGanados;
    } else {
      if (pistaActual <= 2) deltaVidas = 1;
      else if (pistaActual >= 5) deltaVidas = -1;
      jugador.vidas = Math.min(3, Math.max(0, jugador.vidas + deltaVidas));
    }

    sala.ronda.acertados.push({
      jugadorId: jugador.id,
      nombre: jugador.nombre,
      pistaNum: pistaActual,
      puntos: ptsGanados,
      deltaVidas
    });

    sala.ronda.pulsado = null;
    sala.ronda.estaPausado = false;
    sala.ronda.ultimaPistaTs = Date.now();
    sala.ronda.mensaje = {
      tipo: 'success',
      texto: `¡Correcto! ${jugador.nombre} acertó en la pista #${pistaActual}`
    };

    // Comprobar si todos los jugadores restantes ya han acertado o fallado
    const activos = sala.jugadores.filter((j) => {
      const yaAcerto = sala.ronda.acertados.some((a) => a.jugadorId === j.id);
      const bloqueado = sala.ronda.bloqueados.includes(j.id);
      const sinVidas = sala.modo === 'supervivencia' && j.vidas <= 0;
      return !yaAcerto && !bloqueado && !sinVidas;
    });

    if (activos.length === 0) {
      sala.ronda.estadoRonda = 'resuelta';
      sala.ronda.solucion = item.nombre;
    }
  } else {
    // Respuesta incorrecta
    if (sala.modo === 'estandar') {
      sala.ronda.bloqueados.push(jugador.id);
      sala.ronda.pulsado = null;
      sala.ronda.estaPausado = false;
      sala.ronda.ultimaPistaTs = Date.now();
      sala.ronda.mensaje = {
        tipo: 'error',
        texto: `¡${jugador.nombre} ha fallado! Queda fuera de esta ronda.`
      };
    } else {
      jugador.vidas = 0;
      sala.ronda.bloqueados.push(jugador.id);
      sala.ronda.pulsado = null;
      sala.ronda.estaPausado = false;
      sala.ronda.ultimaPistaTs = Date.now();
      sala.ronda.mensaje = {
        tipo: 'error',
        texto: `¡${jugador.nombre} ha fallado y pierde todas sus vidas! 💀`
      };
    }

    // Comprobar si todos han fallado
    const activos = sala.jugadores.filter((j) => {
      const yaAcerto = sala.ronda.acertados.some((a) => a.jugadorId === j.id);
      const bloqueado = sala.ronda.bloqueados.includes(j.id);
      const sinVidas = sala.modo === 'supervivencia' && j.vidas <= 0;
      return !yaAcerto && !bloqueado && !sinVidas;
    });

    if (activos.length === 0) {
      sala.ronda.estadoRonda = 'resuelta';
      sala.ronda.solucion = item.nombre;
    }
  }

  res.json({ success: true, acierto });
});

// 9. Finalizar ronda manualmente y ver solución
router.post('/online/sala/:code/solucion', (req, res) => {
  const code = req.params.code.toUpperCase();
  const sala = salasOnline[code];
  if (!sala || !sala.ronda) return res.status(404).json({ error: 'Ronda no activa.' });

  const item = PISTAS_SEED.find((p) => p.id === sala.ronda.id);
  sala.ronda.estadoRonda = 'resuelta';
  sala.ronda.solucion = item ? item.nombre : '';
  sala.ronda.pulsado = null;

  res.json({ success: true, nombre: item ? item.nombre : '' });
});

// 10. Siguiente ronda online
router.post('/online/sala/:code/siguiente-ronda', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede avanzar.' });

  if (sala.modo === 'supervivencia') {
    const vivos = sala.jugadores.filter((j) => j.vidas > 0);
    if (vivos.length <= 1) {
      sala.estado = 'final';
      return res.json({ success: true, final: true });
    }
  }

  sala.rondaNum += 1;
  iniciarNuevaRondaOnline(sala);
  res.json({ success: true });
});

// 11. Finalizar partida y ver podio
router.post('/online/sala/:code/finalizar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'final';
  res.json({ success: true });
});

// 12. Reiniciar para nueva partida
router.post('/online/sala/:code/reiniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'lobby';
  sala.rondaNum = 1;
  sala.usados = [];
  sala.ronda = null;
  sala.jugadores.forEach((j) => {
    j.puntos = 0;
    j.vidas = 3;
  });

  res.json({ success: true });
});

// 13. Salir
router.post('/online/sala/:code/salir', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.json({ success: true });

  const idx = sala.jugadores.findIndex((j) => j.token === token);
  if (idx !== -1) {
    sala.jugadores.splice(idx, 1);
    if (sala.jugadores.length === 0) {
      delete salasOnline[code];
    } else if (sala.adminToken === token) {
      sala.adminToken = sala.jugadores[0].token;
    }
  }

  res.json({ success: true });
});

export default router;