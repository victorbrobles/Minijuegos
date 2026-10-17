// server/routes/masmenos.js
import express from 'express';
import geo1 from '../data/seeds/masmenos/geografia1.js';
import geo2 from '../data/seeds/masmenos/geografia2.js';
import hist1 from '../data/seeds/masmenos/historia1.js';
import hist2 from '../data/seeds/masmenos/historia2.js';
import cine1 from '../data/seeds/masmenos/cine1.js';
import cine2 from '../data/seeds/masmenos/cine2.js';
import mus1 from '../data/seeds/masmenos/musica1.js';
import mus2 from '../data/seeds/masmenos/musica2.js';
import dep1 from '../data/seeds/masmenos/deportes1.js';
import dep2 from '../data/seeds/masmenos/deportes2.js';
import cien1 from '../data/seeds/masmenos/ciencia1.js';
import cien2 from '../data/seeds/masmenos/ciencia2.js';
import econ1 from '../data/seeds/masmenos/economia1.js';
import econ2 from '../data/seeds/masmenos/economia2.js';
import tec1 from '../data/seeds/masmenos/tecnologia1.js';
import tec2 from '../data/seeds/masmenos/tecnologia2.js';
import nat1 from '../data/seeds/masmenos/naturaleza1.js';
import nat2 from '../data/seeds/masmenos/naturaleza2.js';
import cult1 from '../data/seeds/masmenos/cultura1.js';
import cult2 from '../data/seeds/masmenos/cultura2.js';

const router = express.Router();

const CATEGORIAS = {
  geografia: { nombre: 'Geografía y Demografía', icono: 'globe', data: [...geo1, ...geo2] },
  historia: { nombre: 'Historia y Guerras', icono: 'hourglass', data: [...hist1, ...hist2] },
  cine: { nombre: 'Cine y Taquilla', icono: 'clapperboard', data: [...cine1, ...cine2] },
  musica: { nombre: 'Música y Ventas', icono: 'music', data: [...mus1, ...mus2] },
  deportes: { nombre: 'Deportes y Récords', icono: 'trophy', data: [...dep1, ...dep2] },
  ciencia: { nombre: 'Ciencia y Universo', icono: 'flask', data: [...cien1, ...cien2] },
  economia: { nombre: 'Economía y Riqueza', icono: 'chart', data: [...econ1, ...econ2] },
  tecnologia: { nombre: 'Tecnología y Redes', icono: 'chip', data: [...tec1, ...tec2] },
  naturaleza: { nombre: 'Animales y Naturaleza', icono: 'paw', data: [...nat1, ...nat2] },
  cultura: { nombre: 'Cultura y Arquitectura', icono: 'tower', data: [...cult1, ...cult2] }
};

function barajarArray(array) {
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// GET /api/masmenos/categorias
router.get('/categorias', (req, res) => {
  const lista = Object.entries(CATEGORIAS).map(([id, info]) => ({
    id,
    nombre: info.nombre,
    icono: info.icono,
    totalElementos: info.data.length
  }));
  res.json({ success: true, categorias: lista });
});

// POST /api/masmenos/partida { categoria: 'geografia' }
router.post('/partida', (req, res) => {
  const { categoria } = req.body || {};
  const cat = CATEGORIAS[categoria] || CATEGORIAS.geografia;
  const poolBarajado = barajarArray(cat.data);

  res.json({
    success: true,
    categoria: cat.nombre,
    elementos: poolBarajado
  });
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

function inicializarTurnoJugador(sala, cursor) {
  const actId = sala.ordenTurnos[sala.indiceTurno];
  const jugador = sala.jugadores.find((j) => j.id === actId);

  sala.ronda = {
    jugadorActivoId: jugador.id,
    jugadorActivoNombre: jugador.nombre,
    puntosTurno: 0,
    tarjetaA: { item: sala.poolElementos[cursor], tiempo: 1 },
    tarjetaB: { item: sala.poolElementos[cursor + 1], tiempo: 1 },
    indicePool: cursor + 2,
    estadoEleccion: null, // { eleccion: 'A'|'B', esAcierto: boolean, valA, valB, unidadA, unidadB }
    faseRonda: 'jugando' // 'jugando' | 'turno_fin'
  };
}

// POST /api/masmenos/online/crear
router.post('/online/crear', (req, res) => {
  const { nombre } = req.body || {};
  if (!nombre?.trim()) return res.status(400).json({ error: 'Nombre requerido.' });

  let code = generarCodigo();
  while (salasOnline.has(code)) code = generarCodigo();

  const tokenAdmin = 'tok_' + Math.random().toString(36).substring(2);
  const sala = {
    code,
    estado: 'lobby', // 'lobby' | 'categoria' | 'jugando' | 'final'
    adminToken: tokenAdmin,
    jugadores: [{ id: 1, nombre: nombre.trim(), token: tokenAdmin, puntos: 0, jugo: false }],
    categoriaId: null,
    categoriaNombre: '',
    poolElementos: [],
    ordenTurnos: [],
    indiceTurno: 0,
    ronda: null
  };

  salasOnline.set(code, sala);
  res.json({ success: true, code, token: tokenAdmin });
});

// POST /api/masmenos/online/unirse
router.post('/online/unirse', (req, res) => {
  const { code, nombre } = req.body || {};
  const sala = salasOnline.get(code?.toUpperCase());

  if (!sala) return res.status(404).json({ error: 'Sala no encontrada.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha comenzado.' });
  if (sala.jugadores.length >= 10) return res.status(400).json({ error: 'Sala llena (máx 10).' });

  const token = 'tok_' + Math.random().toString(36).substring(2);
  const nuevoId = sala.jugadores.length + 1;

  sala.jugadores.push({
    id: nuevoId,
    nombre: nombre?.trim() || `Jugador ${nuevoId}`,
    token,
    puntos: 0,
    jugo: false
  });

  res.json({ success: true, code: sala.code, token });
});

// GET /api/masmenos/online/sala/:code
router.get('/online/sala/:code', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada.' });

  const token = req.query.token;
  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador) return res.status(401).json({ error: 'Token no válido.' });

  let infoRonda = null;
  if (sala.ronda) {
    const hayEleccion = sala.ronda.estadoEleccion !== null;

    // Solo se envían las cifras cuando se ha pulsado y se muestra la resolución visual
    infoRonda = {
      jugadorActivoId: sala.ronda.jugadorActivoId,
      jugadorActivoNombre: sala.ronda.jugadorActivoNombre,
      puntosTurno: sala.ronda.puntosTurno,
      faseRonda: sala.ronda.faseRonda,
      estadoEleccion: sala.ronda.estadoEleccion,
      tarjetaA: {
        nombre: sala.ronda.tarjetaA.item.nombre,
        detalle: sala.ronda.tarjetaA.item.detalle,
        valor: hayEleccion ? sala.ronda.tarjetaA.item.valor : null,
        unidad: hayEleccion ? sala.ronda.tarjetaA.item.unidad : null
      },
      tarjetaB: {
        nombre: sala.ronda.tarjetaB.item.nombre,
        detalle: sala.ronda.tarjetaB.item.detalle,
        valor: hayEleccion ? sala.ronda.tarjetaB.item.valor : null,
        unidad: hayEleccion ? sala.ronda.tarjetaB.item.unidad : null
      }
    };
  }

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    esAdmin: sala.adminToken === token,
    yoId: jugador.id,
    categoriaNombre: sala.categoriaNombre,
    jugadores: sala.jugadores.map((j) => ({
      id: j.id,
      nombre: j.nombre,
      puntos: j.puntos,
      jugo: j.jugo
    })),
    ronda: infoRonda
  });
});

// POST /api/masmenos/online/sala/:code/iniciar-partida
router.post('/online/sala/:code/iniciar-partida', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });
  if (sala.jugadores.length < 2) return res.status(400).json({ error: 'Mínimo 2 jugadores para el modo online.' });

  sala.estado = 'categoria';
  res.json({ success: true });
});

// POST /api/masmenos/online/sala/:code/elegir-categoria
router.post('/online/sala/:code/elegir-categoria', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  const { categoriaId } = req.body || {};
  const cat = CATEGORIAS[categoriaId] || CATEGORIAS.geografia;

  sala.categoriaId = categoriaId;
  sala.categoriaNombre = cat.nombre;
  sala.poolElementos = barajarArray(cat.data);

  // Sorteo de orden de turnos
  sala.ordenTurnos = barajarArray(sala.jugadores.map((j) => j.id));
  sala.indiceTurno = 0;
  sala.estado = 'jugando';

  inicializarTurnoJugador(sala, 0);

  res.json({ success: true });
});

// POST /api/masmenos/online/sala/:code/elegir
router.post('/online/sala/:code/elegir', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || !sala.ronda || sala.ronda.faseRonda !== 'jugando') {
    return res.status(400).json({ error: 'No hay turno activo.' });
  }

  const jugador = sala.jugadores.find((j) => j.token === req.body?.token);
  if (!jugador || jugador.id !== sala.ronda.jugadorActivoId) {
    return res.status(403).json({ error: 'No es tu turno de responder.' });
  }

  if (sala.ronda.estadoEleccion !== null) {
    return res.status(400).json({ error: 'Elección ya procesada.' });
  }

  const { opcion } = req.body || {}; // 'A' | 'B'
  const valA = sala.ronda.tarjetaA.item.valor;
  const valB = sala.ronda.tarjetaB.item.valor;
  const esMayorA = valA >= valB;
  const esMayorB = valB >= valA;

  const esAcierto = (opcion === 'A' && esMayorA) || (opcion === 'B' && esMayorB);

  sala.ronda.estadoEleccion = {
    eleccion: opcion,
    esAcierto
  };

  if (esAcierto) {
    sala.ronda.puntosTurno += 1;

    setTimeout(() => {
      if (!sala.ronda) return;
      sala.ronda.estadoEleccion = null;

      const nuevoItem = sala.poolElementos[sala.ronda.indicePool % sala.poolElementos.length];
      sala.ronda.indicePool += 1;

      if (sala.ronda.puntosTurno === 1) {
        if (opcion === 'A') {
          sala.ronda.tarjetaA.tiempo += 1;
          sala.ronda.tarjetaB = { item: nuevoItem, tiempo: 1 };
        } else {
          sala.ronda.tarjetaB.tiempo += 1;
          sala.ronda.tarjetaA = { item: nuevoItem, tiempo: 1 };
        }
      } else {
        if (sala.ronda.tarjetaA.tiempo >= sala.ronda.tarjetaB.tiempo) {
          sala.ronda.tarjetaA = { item: nuevoItem, tiempo: 1 };
          sala.ronda.tarjetaB.tiempo += 1;
        } else {
          sala.ronda.tarjetaB = { item: nuevoItem, tiempo: 1 };
          sala.ronda.tarjetaA.tiempo += 1;
        }
      }
    }, 1600);
  } else {
    setTimeout(() => {
      if (!sala.ronda) return;
      jugador.puntos = sala.ronda.puntosTurno;
      jugador.jugo = true;
      sala.ronda.faseRonda = 'turno_fin';
    }, 2000);
  }

  res.json({ success: true });
});

// POST /api/masmenos/online/sala/:code/siguiente-jugador
router.post('/online/sala/:code/siguiente-jugador', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  const siguientes = sala.ordenTurnos.slice(sala.indiceTurno + 1);
  if (siguientes.length > 0) {
    sala.indiceTurno += 1;
    inicializarTurnoJugador(sala, sala.ronda.indicePool);
  } else {
    sala.estado = 'final';
  }

  res.json({ success: true });
});

// POST /api/masmenos/online/sala/:code/finalizar
router.post('/online/sala/:code/finalizar', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'final';
  res.json({ success: true });
});

export default router;