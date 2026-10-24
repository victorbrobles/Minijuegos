// server/routes/rapidfire.js
import express from 'express';
import { CATEGORIAS } from '../data/seeds/rapidfire/rapidfire.js';

const router = express.Router();
const TIEMPO_S = 60;
const PREPARACION_S = 3;
const PUNTOS_POR_ACIERTO = 2;
const NUM_OPCIONES = 3;

function barajarArray(array) {
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// ==========================================
// RUTAS MODO LOCAL
// ==========================================
router.get('/categorias', (req, res) => {
  const lista = CATEGORIAS.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    icono: c.icono
  }));
  res.json({ success: true, categorias: lista });
});

router.post('/reto-local', (req, res) => {
  const { categoriaId, usados = [] } = req.body || {};
  const catObj = CATEGORIAS.find((c) => c.id === categoriaId);
  if (!catObj) return res.status(404).json({ error: 'Categoría no encontrada.' });

  let libres = catObj.retos.map((_, i) => i).filter((i) => !usados.includes(`${catObj.id}:${i}`));
  if (libres.length === 0) {
    libres = catObj.retos.map((_, i) => i);
  }

  const indiceElegido = libres[Math.floor(Math.random() * libres.length)];
  const [n, texto] = catObj.retos[indiceElegido];

  res.json({
    success: true,
    retoClave: `${catObj.id}:${indiceElegido}`,
    reto: { n, texto }
  });
});

// ==========================================
// GESTIÓN Y RUTAS MODO ONLINE
// ==========================================
const salasOnline = new Map();

function generarCodigo() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let cod = '';
  for (let i = 0; i < 4; i++) cod += letras[Math.floor(Math.random() * letras.length)];
  return cod;
}

function sortearCategorias() {
  return barajarArray(CATEGORIAS).slice(0, NUM_OPCIONES).map((c) => ({
    id: c.id,
    nombre: c.nombre,
    icono: c.icono
  }));
}

function elegirSiguienteRebote(sala, actualId) {
  const ids = sala.jugadores.map((j) => j.id);
  const idxActual = ids.indexOf(actualId);
  let siguienteIdx = (idxActual + 1) % ids.length;
  let intentos = 0;

  while (sala.ronda.intentados.includes(ids[siguienteIdx]) && intentos < ids.length) {
    siguienteIdx = (siguienteIdx + 1) % ids.length;
    intentos++;
  }

  const elegido = ids[siguienteIdx];
  if (!sala.ronda.intentados.includes(elegido)) {
    sala.ronda.intentados.push(elegido);
    return elegido;
  }
  return null; // Todos han jugado
}

// POST /api/rapidfire/online/crear
router.post('/online/crear', (req, res) => {
  const { nombre } = req.body || {};
  if (!nombre?.trim()) return res.status(400).json({ error: 'Nombre requerido.' });

  let code = generarCodigo();
  while (salasOnline.has(code)) code = generarCodigo();

  const tokenAdmin = 'tok_' + Math.random().toString(36).substring(2);
  const sala = {
    code,
    estado: 'lobby', // 'lobby' | 'categorias' | 'turno' | 'puntuaciones' | 'final'
    adminToken: tokenAdmin,
    rondaNum: 1,
    proximoInicialId: null,
    usados: [],
    jugadores: [{ id: 1, nombre: nombre.trim(), token: tokenAdmin, puntos: 0 }],
    ronda: null
  };

  salasOnline.set(code, sala);
  res.json({ success: true, code, token: tokenAdmin });
});

// POST /api/rapidfire/online/unirse
router.post('/online/unirse', (req, res) => {
  const { code, nombre } = req.body || {};
  const sala = salasOnline.get(code?.toUpperCase());

  if (!sala) return res.status(404).json({ error: 'Sala no encontrada.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha comenzado.' });
  if (sala.jugadores.length >= 10) return res.status(400).json({ error: 'Sala llena (máximo 10 jugadores).' });

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

// GET /api/rapidfire/online/sala/:code
router.get('/online/sala/:code', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala) return res.status(404).json({ error: 'Sala no disponible.' });

  const token = req.query.token;
  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador) return res.status(401).json({ error: 'Token no válido.' });

  const ahora = Date.now();
  let infoRonda = null;

  if (sala.ronda) {
    let segsPrep = 0;
    let segsTurno = TIEMPO_S;

    if (sala.estado === 'turno') {
      if (ahora < sala.ronda.finPrep) {
        segsPrep = Math.max(0, Math.ceil((sala.ronda.finPrep - ahora) / 1000));
        segsTurno = TIEMPO_S;
      } else {
        segsPrep = 0;
        segsTurno = Math.max(0, Math.ceil((sala.ronda.finTurno - ahora) / 1000));
        if (segsTurno === 0 && !sala.ronda.tiempoAgotadoProcesado) {
          sala.ronda.tiempoAgotadoProcesado = true;
          
          const siguienteId = elegirSiguienteRebote(sala, sala.ronda.jugadorTurnoId);
          if (siguienteId) {
            sala.ronda.jugadorTurnoId = siguienteId;
            sala.ronda.intento += 1;
            sala.ronda.motivo = 'tiempo';
            sala.ronda.finPrep = ahora + PREPARACION_S * 1000;
            sala.ronda.finTurno = ahora + (PREPARACION_S + TIEMPO_S) * 1000;
            sala.ronda.tiempoAgotadoProcesado = false;
          } else {
            // Todos han fallado
            const ids = sala.jugadores.map(j => j.id);
            const idxInicial = ids.indexOf(sala.ronda.jugadorInicialRondaId);
            sala.proximoInicialId = ids[(idxInicial + 1) % ids.length];
            sala.ronda.ultimo = { tipo: 'rendido' };
            sala.estado = 'puntuaciones';
          }
        }
      }
    }

    const jTurno = sala.jugadores.find((j) => j.id === sala.ronda.jugadorTurnoId);

    infoRonda = {
      jugadorTurnoId: jTurno?.id,
      jugadorTurnoNombre: jTurno?.nombre,
      categoria: sala.ronda.categoria,
      reto: sala.ronda.reto,
      opciones: sala.ronda.opciones,
      intento: sala.ronda.intento,
      motivo: sala.ronda.motivo,
      segsPrep,
      segsTurno,
      ultimo: sala.ronda.ultimo
    };
  }

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    esAdmin: sala.adminToken === token,
    yoId: jugador.id,
    rondaNum: sala.rondaNum,
    jugadores: sala.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos })),
    ronda: infoRonda
  });
});

// POST /api/rapidfire/online/sala/:code/iniciar
router.post('/online/sala/:code/iniciar', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });
  if (sala.jugadores.length < 2) return res.status(400).json({ error: 'Mínimo 2 jugadores para iniciar.' });

  sala.estado = 'categorias';
  sala.rondaNum = 1;
  sala.usados = [];

  const ids = sala.jugadores.map((j) => j.id);
  const primerTurno = ids[Math.floor(Math.random() * ids.length)];
  sala.proximoInicialId = ids[(ids.indexOf(primerTurno) + 1) % ids.length];

  sala.ronda = {
    jugadorInicialRondaId: primerTurno,
    jugadorTurnoId: primerTurno,
    opciones: sortearCategorias(),
    categoria: null,
    reto: null,
    intento: 0,
    motivo: null,
    intentados: [primerTurno],
    finPrep: 0,
    finTurno: 0,
    tiempoAgotadoProcesado: false,
    ultimo: null
  };

  res.json({ success: true });
});

// POST /api/rapidfire/online/sala/:code/elegir-categoria
router.post('/online/sala/:code/elegir-categoria', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || !sala.ronda || sala.estado !== 'categorias') return res.status(400).json({ error: 'Fase incorrecta.' });

  const jugador = sala.jugadores.find((j) => j.token === req.body?.token);
  if (!jugador || jugador.id !== sala.ronda.jugadorTurnoId) {
    return res.status(403).json({ error: 'Solo el jugador con el turno actual puede elegir la categoría.' });
  }

  const { categoriaId } = req.body || {};
  const catObj = CATEGORIAS.find((c) => c.id === categoriaId);
  if (!catObj) return res.status(400).json({ error: 'Categoría no válida.' });

  let libres = catObj.retos.map((_, i) => i).filter((i) => !sala.usados.includes(`${catObj.id}:${i}`));
  if (libres.length === 0) {
    sala.usados = sala.usados.filter((u) => !u.startsWith(`${catObj.id}:`));
    libres = catObj.retos.map((_, i) => i);
  }

  const i = libres[Math.floor(Math.random() * libres.length)];
  sala.usados.push(`${catObj.id}:${i}`);
  const [n, texto] = catObj.retos[i];

  const ahora = Date.now();
  sala.ronda.categoria = { id: catObj.id, nombre: catObj.nombre, icono: catObj.icono };
  sala.ronda.reto = { n, texto };
  sala.ronda.intento = 0;
  sala.ronda.motivo = null;
  sala.ronda.intentados = [jugador.id];
  sala.ronda.finPrep = ahora + PREPARACION_S * 1000;
  sala.ronda.finTurno = ahora + (PREPARACION_S + TIEMPO_S) * 1000;
  sala.ronda.tiempoAgotadoProcesado = false;
  sala.estado = 'turno';

  res.json({ success: true });
});

// POST /api/rapidfire/online/sala/:code/accion-admin
router.post('/online/sala/:code/accion-admin', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) {
    return res.status(403).json({ error: 'Solo el anfitrión tiene el rol de juez.' });
  }

  const { accion } = req.body || {}; 
  const ahora = Date.now();
  const jTurno = sala.jugadores.find((j) => j.id === sala.ronda.jugadorTurnoId);
  const ids = sala.jugadores.map((j) => j.id);

  if (accion === 'acierto') {
    const ganados = sala.ronda.reto.n * PUNTOS_POR_ACIERTO;
    jTurno.puntos += ganados;

    const esRebote = sala.ronda.intento > 0;
    
    // Siempre avanza al siguiente secuencial
    const idx = ids.indexOf(sala.ronda.jugadorInicialRondaId);
    sala.proximoInicialId = ids[(idx + 1) % ids.length];

    sala.ronda.ultimo = {
      tipo: esRebote ? 'rebote' : 'acierto',
      jugador: jTurno.nombre,
      puntos: ganados
    };
    sala.estado = 'puntuaciones';

  } else if (accion === 'rebote') {
    const siguienteId = elegirSiguienteRebote(sala, sala.ronda.jugadorTurnoId);
    if (siguienteId) {
      sala.ronda.jugadorTurnoId = siguienteId;
      sala.ronda.intento += 1;
      sala.ronda.motivo = 'rebote';
      sala.ronda.finPrep = ahora + PREPARACION_S * 1000;
      sala.ronda.finTurno = ahora + (PREPARACION_S + TIEMPO_S) * 1000;
      sala.ronda.tiempoAgotadoProcesado = false;
    } else {
      // Si todos han fallado
      const idx = ids.indexOf(sala.ronda.jugadorInicialRondaId);
      sala.proximoInicialId = ids[(idx + 1) % ids.length];
      sala.ronda.ultimo = { tipo: 'rendido' };
      sala.estado = 'puntuaciones';
    }

  } else if (accion === 'rendirse') {
    const idx = ids.indexOf(sala.ronda.jugadorInicialRondaId);
    sala.proximoInicialId = ids[(idx + 1) % ids.length];
    sala.ronda.ultimo = { tipo: 'rendido' };
    sala.estado = 'puntuaciones';
  }

  res.json({ success: true });
});

// POST /api/rapidfire/online/sala/:code/continuar-ronda
router.post('/online/sala/:code/continuar-ronda', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  sala.rondaNum += 1;
  const siguienteTurno = sala.proximoInicialId;

  sala.ronda = {
    jugadorInicialRondaId: siguienteTurno,
    jugadorTurnoId: siguienteTurno,
    opciones: sortearCategorias(),
    categoria: null,
    reto: null,
    intento: 0,
    motivo: null,
    intentados: [siguienteTurno],
    finPrep: 0,
    finTurno: 0,
    tiempoAgotadoProcesado: false,
    ultimo: null
  };
  sala.estado = 'categorias';

  res.json({ success: true });
});

// POST /api/rapidfire/online/sala/:code/finalizar
router.post('/online/sala/:code/finalizar', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'final';
  res.json({ success: true });
});

export default router;