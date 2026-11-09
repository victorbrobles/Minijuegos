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
// SALAS ONLINE (RESPUESTA SIMULTÁNEA Y PRIVADA)
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
    bloqueados: [],
    acertados: [], // [{ jugadorId, nombre, pistaNum, puntos, deltaVidas }]
    estadoRonda: 'activa', // 'activa' | 'resuelta'
    solucion: null
  };
}

// Si ya no queda nadie con vida por responder, se cierra la ronda
function comprobarPendientes(sala) {
  if (sala.estado !== 'jugando' || sala.ronda?.estadoRonda !== 'activa') return;
  const pendientes = sala.jugadores.filter((j) => {
    const acertoJ = sala.ronda.acertados.some((a) => a.jugadorId === j.id);
    const bloqueadoJ = sala.ronda.bloqueados.includes(j.id);
    const sinVidas = sala.modo === 'supervivencia' && j.vidas <= 0;
    return !acertoJ && !bloqueadoJ && !sinVidas;
  });
  if (pendientes.length === 0) resolverRondaOnline(sala);
}

// Aplica los puntos y cambios de vidas al cerrar la ronda para no dar pistas en directo
function resolverRondaOnline(sala) {
  if (!sala?.ronda || sala.ronda.estadoRonda === 'resuelta') return;

  const item = PISTAS_SEED.find((p) => p.id === sala.ronda.id);
  sala.ronda.estadoRonda = 'resuelta';
  sala.ronda.solucion = item ? item.nombre : '';
  sala.ronda.segundosRestantes = 0;

  // Sumar puntos o actualizar vidas de quienes acertaron
  sala.ronda.acertados.forEach((a) => {
    const j = sala.jugadores.find((x) => x.id === a.jugadorId);
    if (!j) return;
    if (sala.modo === 'estandar') {
      j.puntos += a.puntos;
    } else {
      j.vidas = Math.min(3, Math.max(0, j.vidas + a.deltaVidas));
    }
  });

  // En modo supervivencia, quienes fallaron pierden sus vidas al resolverse la ronda
  if (sala.modo === 'supervivencia') {
    sala.ronda.bloqueados.forEach((jId) => {
      const j = sala.jugadores.find((x) => x.id === jId);
      if (j) j.vidas = 0;
    });
  }
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
    siguienteId: 2,
    creada: Date.now(),
    jugadores: [{ id: 1, token: tokenAdmin, nombre: nombre.slice(0, 20), puntos: 0, vidas: 3, visto: Date.now() }],
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
  if (!nombre) return res.status(400).json({ error: 'Debes indicar un nombre.' });
  if (sala.jugadores.length >= 15) return res.status(400).json({ error: 'La sala está completa.' });
  if (sala.jugadores.some((j) => j.nombre.toLowerCase() === nombre.toLowerCase())) {
    return res.status(400).json({ error: 'Ya hay un jugador con ese nombre en la sala.' });
  }

  const token = generarToken();
  const nuevoId = sala.siguienteId++;
  sala.jugadores.push({ id: nuevoId, token, nombre: nombre.slice(0, 20), puntos: 0, vidas: 3, visto: Date.now() });

  res.json({ success: true, code, token, jugadorId: nuevoId });
});

// 3. Cambiar modo de juego (sólo anfitrión en el lobby)
router.post('/online/sala/:code/modo', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, modo } = req.body || {};
  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha comenzado.' });

  sala.modo = modo === 'supervivencia' ? 'supervivencia' : 'estandar';
  res.json({ success: true, modo: sala.modo });
});

// 4. Estado de la sala (avanza pistas cada 10s sin pausas y oculta quién acertó hasta el final)
router.get('/online/sala/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const token = req.query.token;

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe o ha caducado.' });

  const jugadorActual = sala.jugadores.find((j) => j.token === token);
  if (!jugadorActual) return res.status(403).json({ error: 'No perteneces a esta sala.' });

  const esAdmin = sala.adminToken === token;
  jugadorActual.visto = Date.now();
  const anfitrion = sala.jugadores.find((j) => j.token === sala.adminToken);

  // Avance automático de pistas cada 10 s cuando la ronda está activa
  if (sala.estado === 'jugando' && sala.ronda && sala.ronda.estadoRonda === 'activa') {
    const ahora = Date.now();
    const transcurrido = (ahora - sala.ronda.ultimaPistaTs) / 1000;

    if (transcurrido >= 10) {
      if (sala.ronda.pistasReveladas < 6) {
        sala.ronda.pistasReveladas += 1;
        sala.ronda.ultimaPistaTs = ahora;
        sala.ronda.segundosRestantes = 10;
      } else {
        resolverRondaOnline(sala);
      }
    } else {
      sala.ronda.segundosRestantes = Math.max(0, 10 - transcurrido);
    }
  }

  const rondaActiva = sala.ronda?.estadoRonda === 'activa';

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    modo: sala.modo,
    esAdmin,
    anfitrionId: anfitrion ? anfitrion.id : null,
    yoId: jugadorActual.id,
    rondaNum: sala.rondaNum,
    jugadores: sala.jugadores.map((j) => {
      const bloqueadoReal = sala.ronda ? sala.ronda.bloqueados.includes(j.id) : false;
      const acertoReal = sala.ronda ? sala.ronda.acertados.some((a) => a.jugadorId === j.id) : false;
      const haRespondido = bloqueadoReal || acertoReal;
      const esYo = j.id === jugadorActual.id;

      return {
        id: j.id,
        nombre: j.nombre,
        puntos: j.puntos,
        vidas: j.vidas,
        conectado: Date.now() - (j.visto || 0) < 15000,
        respondido: haRespondido,
        // Mientras la ronda está activa, solo el propio jugador sabe si ha acertado o ha fallado
        bloqueado: rondaActiva ? (esYo ? bloqueadoReal : false) : bloqueadoReal,
        acerto: rondaActiva ? (esYo ? acertoReal : false) : acertoReal
      };
    }),
    ronda: sala.ronda
      ? {
          id: sala.ronda.id,
          pistas: sala.ronda.pistas.slice(0, sala.ronda.pistasReveladas),
          pistasReveladas: sala.ronda.pistasReveladas,
          segundosRestantes: sala.ronda.segundosRestantes,
          estadoRonda: sala.ronda.estadoRonda,
          solucion: sala.ronda.estadoRonda === 'resuelta' ? sala.ronda.solucion : null,
          acertados: sala.ronda.estadoRonda === 'resuelta' ? sala.ronda.acertados : []
        }
      : null
  });
});

// 5. Iniciar partida desde el lobby (sólo anfitrión)
router.post('/online/sala/:code/iniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede iniciar.' });
  if (sala.estado === 'jugando') return res.json({ success: true });
  if (sala.jugadores.length < 2) return res.status(400).json({ error: 'Hacen falta al menos 2 jugadores.' });

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

// 6. Responder y validar online directamente en cualquier momento (sin detener el tiempo)
router.post('/online/sala/:code/responder', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, respuesta } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || !sala.ronda || sala.ronda.estadoRonda !== 'activa') {
    return res.status(400).json({ error: 'La ronda ya no está activa.' });
  }

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador) return res.status(403).json({ error: 'Jugador no válido.' });

  const yaAcerto = sala.ronda.acertados.some((a) => a.jugadorId === jugador.id);
  const yaFallo = sala.ronda.bloqueados.includes(jugador.id);
  if (yaAcerto || yaFallo) {
    return res.status(400).json({ error: 'Ya has enviado una respuesta en esta ronda.' });
  }

  if (sala.modo === 'supervivencia' && jugador.vidas <= 0) {
    return res.status(403).json({ error: 'Estás eliminado.' });
  }

  const item = PISTAS_SEED.find((p) => p.id === sala.ronda.id);
  const acierto = comprobarRespuesta(respuesta, item);
  const pistaActual = sala.ronda.pistasReveladas;

  if (acierto) {
    let ptsGanados = 0;
    let deltaVidas = 0;

    if (sala.modo === 'estandar') {
      ptsGanados = 6 - pistaActual + 1;
    } else {
      if (pistaActual <= 2) deltaVidas = 1;
      else if (pistaActual >= 5) deltaVidas = -1;
    }

    sala.ronda.acertados.push({
      jugadorId: jugador.id,
      nombre: jugador.nombre,
      pistaNum: pistaActual,
      puntos: ptsGanados,
      deltaVidas
    });
  } else {
    sala.ronda.bloqueados.push(jugador.id);
  }

  comprobarPendientes(sala);

  res.json({ success: true, acierto });
});

// 7. Finalizar ronda manualmente y ver solución
router.post('/online/sala/:code/solucion', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};
  const sala = salasOnline[code];
  if (!sala || !sala.ronda) return res.status(404).json({ error: 'Ronda no activa.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede revelar la solución.' });

  resolverRondaOnline(sala);
  res.json({ success: true, nombre: sala.ronda.solucion });
});

// 8. Siguiente ronda online
router.post('/online/sala/:code/siguiente-ronda', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede avanzar.' });
  if (sala.estado !== 'jugando' || sala.ronda?.estadoRonda !== 'resuelta') return res.json({ success: true });

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

// 9. Finalizar partida y ver podio
router.post('/online/sala/:code/finalizar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'final';
  res.json({ success: true });
});

// 10. Reiniciar para nueva partida
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

// 11. Salir
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
    } else {
      if (sala.adminToken === token) sala.adminToken = sala.jugadores[0].token;
      comprobarPendientes(sala);
    }
  }

  res.json({ success: true });
});

// 12. Expulsar a un jugador (sólo anfitrión, en el lobby)
router.post('/online/sala/:code/expulsar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, jugadorId } = req.body || {};
  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'Solo se puede quitar jugadores antes de empezar.' });
  const idx = sala.jugadores.findIndex((j) => j.id === Number(jugadorId) && j.token !== token);
  if (idx !== -1) sala.jugadores.splice(idx, 1);
  res.json({ success: true });
});

// Limpieza de salas abandonadas (nadie consulta en 2 horas)
setInterval(() => {
  const limite = Date.now() - 2 * 60 * 60 * 1000;
  Object.keys(salasOnline).forEach((c) => {
    const s = salasOnline[c];
    if (!s.jugadores.some((j) => (j.visto || 0) > limite)) delete salasOnline[c];
  });
}, 10 * 60 * 1000).unref();

export default router;