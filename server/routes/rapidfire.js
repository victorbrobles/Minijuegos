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

function elegirSiguienteApertura(sala) {
  if (sala.bolsa.length === 0) {
    sala.bolsa = sala.jugadores.map((j) => j.id);
  }
  const sinRepetir = sala.bolsa.filter((id) => id !== sala.ultimoAbre);
  const candidatos = sinRepetir.length > 0 ? sinRepetir : sala.bolsa;
  const elegido = candidatos[Math.floor(Math.random() * candidatos.length)];
  sala.bolsa = sala.bolsa.filter((id) => id !== elegido);
  sala.ultimoAbre = elegido;
  return elegido;
}

function elegirSiguienteRebote(sala, actualId) {
  let candidatos = sala.jugadores.map((j) => j.id).filter((id) => !sala.ronda.intentados.includes(id));
  if (candidatos.length === 0) {
    sala.ronda.intentados = [actualId];
    candidatos = sala.jugadores.map((j) => j.id).filter((id) => id !== actualId);
  }
  const elegido = candidatos[Math.floor(Math.random() * candidatos.length)];
  sala.ronda.intentados.push(elegido);
  return elegido;
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
    bolsa: [],
    ultimoAbre: -1,
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
  if (sala.jugadores.length >= 10) return res.status(400).json({ error: 'Sala llena (máx 10).' });

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
          // El tiempo expiró automáticamente
          sala.ronda.tiempoAgotadoProcesado = true;
          const siguienteId = elegirSiguienteRebote(sala, sala.ronda.jugadorTurnoId);
          sala.ronda.jugadorTurnoId = siguienteId;
          sala.ronda.intento += 1;
          sala.ronda.motivo = 'tiempo';
          sala.ronda.finPrep = ahora + PREPARACION_S * 1000;
          sala.ronda.finTurno = ahora + (PREPARACION_S + TIEMPO_S) * 1000;
          sala.ronda.tiempoAgotadoProcesado = false;
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
  if (sala.jugadores.length < 2) return res.status(400).json({ error: 'Mínimo 2 jugadores.' });

  sala.estado = 'categorias';
  sala.rondaNum = 1;
  sala.bolsa = [];
  sala.ultimoAbre = -1;
  sala.usados = [];

  const primerTurno = elegirSiguienteApertura(sala);

  sala.ronda = {
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
    return res.status(403).json({ error: 'Solo el jugador de turno puede elegir categoría.' });
  }

  const { categoriaId } = req.body || {};
  const catObj = CATEGORIAS.find((c) => c.id === categoriaId);
  if (!catObj) return res.status(400).json({ error: 'Categoría inválida.' });

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
// Solo el anfitrión decide si es 'acierto', 'rebote' o 'rendirse'
router.post('/online/sala/:code/accion-admin', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) {
    return res.status(403).json({ error: 'Solo el anfitrión tiene el rol de juez.' });
  }

  const { accion } = req.body || {}; // 'acierto' | 'rebote' | 'rendirse'
  const ahora = Date.now();
  const jTurno = sala.jugadores.find((j) => j.id === sala.ronda.jugadorTurnoId);

  if (accion === 'acierto') {
    const ganados = sala.ronda.reto.n * PUNTOS_POR_ACIERTO;
    jTurno.puntos += ganados;

    sala.ronda.ultimo = {
      tipo: sala.ronda.intento > 0 ? 'rebote' : 'acierto',
      jugador: jTurno.nombre,
      puntos: ganados
    };
    sala.ronda.jugadorTurnoId = elegirSiguienteApertura(sala);
    sala.estado = 'puntuaciones';
  } else if (accion === 'rebote') {
    const siguienteId = elegirSiguienteRebote(sala, sala.ronda.jugadorTurnoId);
    sala.ronda.jugadorTurnoId = siguienteId;
    sala.ronda.intento += 1;
    sala.ronda.motivo = 'rebote';
    sala.ronda.finPrep = ahora + PREPARACION_S * 1000;
    sala.ronda.finTurno = ahora + (PREPARACION_S + TIEMPO_S) * 1000;
    sala.ronda.tiempoAgotadoProcesado = false;
  } else if (accion === 'rendirse') {
    sala.ronda.ultimo = { tipo: 'rendido' };
    sala.ronda.jugadorTurnoId = elegirSiguienteApertura(sala);
    sala.estado = 'puntuaciones';
  }

  res.json({ success: true });
});

// POST /api/rapidfire/online/sala/:code/continuar-ronda
router.post('/online/sala/:code/continuar-ronda', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  sala.rondaNum += 1;
  sala.ronda.opciones = sortearCategorias();
  sala.ronda.categoria = null;
  sala.ronda.reto = null;
  sala.ronda.intento = 0;
  sala.ronda.motivo = null;
  sala.ronda.intentados = [sala.ronda.jugadorTurnoId];
  sala.ronda.ultimo = null;
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