// server/routes/ubicacion.js
import { Router } from 'express';
import { LUGARES } from '../data/seeds/ubicacion/ubicacion.seed.js';
import { barajar } from '../lib/barajar.js';

const router = Router();
const RONDAS = 10;
const TIEMPO_MAPA_S = 90;

const RADIO_TIERRA_KM = 6371;
const aRad = (grados) => (grados * Math.PI) / 180;

function distanciaKm(a, b) {
  const dLat = aRad(b.lat - a.lat);
  const dLng = aRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRad(a.lat)) * Math.cos(aRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * RADIO_TIERRA_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

const RANGOS_PUNTOS = [
  { hasta: 10, puntos: 10 },
  { hasta: 50, puntos: 9 },
  { hasta: 100, puntos: 8 },
  { hasta: 200, puntos: 7 },
  { hasta: 300, puntos: 6 },
  { hasta: 500, puntos: 5 },
  { hasta: 1000, puntos: 4 },
  { hasta: 2000, puntos: 3 },
  { hasta: 3000, puntos: 2 },
  { hasta: 5000, puntos: 1 }
];

function puntosPorDistancia(km) {
  const rango = RANGOS_PUNTOS.find((r) => km <= r.hasta);
  return rango ? rango.puntos : 0;
}

// GET /api/ubicacion/lote
router.get('/lote', (req, res) => {
  const pedidos = parseInt(req.query.n, 10) || 16;
  const n = Math.min(Math.max(pedidos, 1), LUGARES.length);
  res.json(barajar(LUGARES).slice(0, n));
});

// ==========================================
// MODO ONLINE
// ==========================================
const salasOnline = new Map();
const COLORES = ['#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#ec4899', '#0d9488', '#ea580c', '#475569', '#65a30d'];

function generarCodigo() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let cod = '';
  for (let i = 0; i < 4; i++) cod += letras[Math.floor(Math.random() * letras.length)];
  return cod;
}

function inicializarRondaOnline(sala) {
  const lugar = sala.lugares[sala.rondaNum - 1];

  sala.ronda = {
    lugar,
    faseRonda: 'foto', // 'foto' (10s) | 'mapa' (90s) | 'resultados'
    tiempoFinFoto: Date.now() + 10000,
    tiempoInicioMapa: null,
    tiempoFinMapa: null,
    ultimoDestelloTimestamp: 0,
    // Marcadores de cada jugador: { [jugadorId]: { lat, lng, confirmado: boolean } }
    marcadores: {},
    resultado: null
  };
}

function cerrarRondaOnline(sala) {
  const lugar = sala.ronda.lugar;
  const filas = [];

  sala.jugadores.forEach((j) => {
    const m = sala.ronda.marcadores[j.id];
    if (m && m.lat !== undefined && m.lng !== undefined) {
      const km = distanciaKm(m, lugar);
      const pts = puntosPorDistancia(km);
      j.puntos += pts;
      filas.push({
        jugadorId: j.id,
        nombre: j.nombre,
        color: j.color,
        real: { lat: m.lat, lng: m.lng },
        km,
        puntos: pts
      });
    } else {
      filas.push({
        jugadorId: j.id,
        nombre: j.nombre,
        color: j.color,
        real: null,
        km: 99999,
        puntos: 0
      });
    }
  });

  filas.sort((a, b) => a.km - b.km);

  sala.ronda.resultado = {
    lugar,
    filas
  };
  sala.ronda.faseRonda = 'resultados';
}

// POST /api/ubicacion/online/crear
router.post('/online/crear', (req, res) => {
  const { nombre, lugares = [] } = req.body || {};
  if (!nombre?.trim()) return res.status(400).json({ error: 'Nombre requerido.' });
  if (!lugares.length) return res.status(400).json({ error: 'No se recibieron lugares para la partida.' });

  let code = generarCodigo();
  while (salasOnline.has(code)) code = generarCodigo();

  const tokenAdmin = 'tok_' + Math.random().toString(36).substring(2);
  const sala = {
    code,
    estado: 'lobby', // 'lobby' | 'jugando' | 'final'
    adminToken: tokenAdmin,
    rondaNum: 1,
    lugares,
    jugadores: [{ id: 1, nombre: nombre.trim(), token: tokenAdmin, color: COLORES[0], puntos: 0 }],
    ronda: null
  };

  salasOnline.set(code, sala);
  res.json({ success: true, code, token: tokenAdmin });
});

// POST /api/ubicacion/online/unirse
router.post('/online/unirse', (req, res) => {
  const { code, nombre } = req.body || {};
  const sala = salasOnline.get(code?.toUpperCase());

  if (!sala) return res.status(404).json({ error: 'Sala no encontrada.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya comenzó.' });
  if (sala.jugadores.length >= 10) return res.status(400).json({ error: 'Sala llena (máx 10).' });

  const token = 'tok_' + Math.random().toString(36).substring(2);
  const nuevoId = sala.jugadores.length + 1;

  sala.jugadores.push({
    id: nuevoId,
    nombre: nombre?.trim() || `Jugador ${nuevoId}`,
    token,
    color: COLORES[(nuevoId - 1) % COLORES.length],
    puntos: 0
  });

  res.json({ success: true, code: sala.code, token });
});

// GET /api/ubicacion/online/sala/:code
router.get('/online/sala/:code', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada.' });

  const token = req.query.token;
  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador) return res.status(401).json({ error: 'Token no válido.' });

  const ahora = Date.now();
  let infoRonda = null;

  if (sala.ronda) {
    // 1. Transición automática de 'foto' a 'mapa' tras los 10 segundos
    if (sala.ronda.faseRonda === 'foto' && ahora >= sala.ronda.tiempoFinFoto) {
      sala.ronda.faseRonda = 'mapa';
      sala.ronda.tiempoInicioMapa = ahora;
      sala.ronda.tiempoFinMapa = ahora + TIEMPO_MAPA_S * 1000;
      sala.ronda.ultimoDestelloTimestamp = ahora;
    }

    // 2. Transición automática a 'resultados' si se agotan los 90s o todos confirman
    if (sala.ronda.faseRonda === 'mapa') {
      const todosConfirmaron = sala.jugadores.every((j) => sala.ronda.marcadores[j.id]?.confirmado);
      if (ahora >= sala.ronda.tiempoFinMapa || todosConfirmaron) {
        cerrarRondaOnline(sala);
      }
    }

    // 3. Cálculo de destellos de 1 segundo cada 15 segundos
    let destellosVisibles = [];
    if (sala.ronda.faseRonda === 'mapa') {
      const tiempoTranscurridoMapa = Math.floor((ahora - sala.ronda.tiempoInicioMapa) / 1000);
      // Cada 15 segundos exactos: ciclo de 15 segundos donde en el segundo 0 está activo
      const segundoDelCiclo = tiempoTranscurridoMapa % 15;
      const hayDestelloActivo = tiempoTranscurridoMapa > 0 && segundoDelCiclo === 0;

      if (hayDestelloActivo) {
        // Marcadores provisionales no confirmados de OTROS jugadores
        Object.entries(sala.ronda.marcadores).forEach(([jIdStr, m]) => {
          const jId = Number(jIdStr);
          if (jId !== jugador.id && m && !m.confirmado) {
            const rival = sala.jugadores.find((j) => j.id === jId);
            destellosVisibles.push({
              id: `destello-${jId}`,
              jugadorId: jId,
              nombre: rival?.nombre || 'Jugador',
              color: rival?.color || '#ef4444',
              lat: m.lat,
              lng: m.lng
            });
          }
        });
      }
    }

    const miMarcador = sala.ronda.marcadores[jugador.id] || null;

    infoRonda = {
      faseRonda: sala.ronda.faseRonda,
      lugar: sala.ronda.faseRonda === 'resultados' ? sala.ronda.lugar : { imagenUrl: sala.ronda.lugar.imagenUrl },
      segundosRestantesFoto: Math.max(0, Math.ceil((sala.ronda.tiempoFinFoto - ahora) / 1000)),
      segundosRestantesMapa: sala.ronda.tiempoFinMapa ? Math.max(0, Math.ceil((sala.ronda.tiempoFinMapa - ahora) / 1000)) : TIEMPO_MAPA_S,
      miMarcador,
      destellosVisibles,
      jugadoresConfirmados: sala.jugadores.filter((j) => sala.ronda.marcadores[j.id]?.confirmado).map((j) => j.id),
      resultado: sala.ronda.resultado
    };
  }

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    esAdmin: sala.adminToken === token,
    yoId: jugador.id,
    rondaNum: sala.rondaNum,
    totalRondas: RONDAS,
    jugadores: sala.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, color: j.color, puntos: j.puntos })),
    ronda: infoRonda
  });
});

// POST /api/ubicacion/online/sala/:code/iniciar
router.post('/online/sala/:code/iniciar', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });
  if (sala.jugadores.length < 2) return res.status(400).json({ error: 'Mínimo 2 jugadores para el modo online.' });

  sala.estado = 'jugando';
  sala.rondaNum = 1;
  inicializarRondaOnline(sala);

  res.json({ success: true });
});

// POST /api/ubicacion/online/sala/:code/posicionar
// Registra o actualiza la posición provisional del marcador
router.post('/online/sala/:code/posicionar', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || !sala.ronda || sala.ronda.faseRonda !== 'mapa') {
    return res.status(400).json({ error: 'No es momento de posicionar.' });
  }

  const jugador = sala.jugadores.find((j) => j.token === req.body?.token);
  if (!jugador) return res.status(401).json({ error: 'No autorizado.' });

  const { lat, lng } = req.body || {};
  const actual = sala.ronda.marcadores[jugador.id];
  if (actual?.confirmado) {
    return res.status(400).json({ error: 'Ya has confirmado tu marcador en esta ronda.' });
  }

  sala.ronda.marcadores[jugador.id] = { lat, lng, confirmado: false };
  res.json({ success: true });
});

// POST /api/ubicacion/online/sala/:code/confirmar
// Confirma definitivamente el marcador (deja de emitir destellos)
router.post('/online/sala/:code/confirmar', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || !sala.ronda || sala.ronda.faseRonda !== 'mapa') {
    return res.status(400).json({ error: 'No es momento de confirmar.' });
  }

  const jugador = sala.jugadores.find((j) => j.token === req.body?.token);
  if (!jugador) return res.status(401).json({ error: 'No autorizado.' });

  const actual = sala.ronda.marcadores[jugador.id];
  if (!actual || actual.lat === undefined) {
    return res.status(400).json({ error: 'Debes colocar el marcador en el mapa antes de confirmar.' });
  }

  actual.confirmado = true;
  res.json({ success: true });
});

// POST /api/ubicacion/online/sala/:code/siguiente-ronda
router.post('/online/sala/:code/siguiente-ronda', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  if (sala.rondaNum >= RONDAS || sala.rondaNum >= sala.lugares.length) {
    sala.estado = 'final';
  } else {
    sala.rondaNum += 1;
    inicializarRondaOnline(sala);
  }

  res.json({ success: true });
});

// POST /api/ubicacion/online/sala/:code/finalizar
router.post('/online/sala/:code/finalizar', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'final';
  res.json({ success: true });
});

// POST /api/ubicacion/online/sala/:code/salir
router.post('/online/sala/:code/salir', (req, res) => {
  const code = req.params.code?.toUpperCase();
  const sala = salasOnline.get(code);
  if (!sala) return res.json({ success: true });

  const token = req.body?.token;
  const idx = sala.jugadores.findIndex((j) => j.token === token);

  if (idx !== -1) {
    sala.jugadores.splice(idx, 1);
    if (sala.jugadores.length === 0) {
      salasOnline.delete(code);
    } else if (sala.adminToken === token) {
      sala.adminToken = sala.jugadores[0].token;
    }
  }

  res.json({ success: true });
});

export default router;