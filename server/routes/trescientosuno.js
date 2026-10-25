import express from 'express';
import { equiposData } from '../data/seeds/trescientosuno/index.js';

const router = express.Router();

const ESTADISTICAS = ['goles', 'asistencias', 'partidos'];
const TIEMPO_TURNO = 60; // segundos
const PAUSA_MS = { acierto: 2500, plantado: 1500, eliminado: 3000, ganador: 3500, fallo: 2000 };

const normalizar = (str) =>
  String(str ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function buscarJugador(equipo, texto) {
  const q = normalizar(texto);
  if (q.length < 3) return { corto: true };

  const listaJugadores = equipo.data || equipo.jugadores || [];

  const exacto = listaJugadores.find((j) => normalizar(j.nombre) === q);
  if (exacto) return { jugador: exacto };

  const palabrasQ = q.split(' ');
  const candidatos = listaJugadores.filter((j) => {
    const palabrasJ = normalizar(j.nombre).split(' ');
    return palabrasQ.every((pq) => palabrasJ.some((pj) => pj.startsWith(pq)));
  });
  if (candidatos.length === 1) return { jugador: candidatos[0] };
  if (candidatos.length > 1) return { ambiguo: candidatos.slice(0, 4).map((j) => j.nombre) };
  return null;
}

const mensajeAmbiguo = (nombres) => `Hay varios jugadores que encajan (${nombres.join(', ')}). Escribe nombre y apellido.`;

// Función para mezclar arrays
const mezclar = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ==========================================
// ENDPOINTS OFFLINE / LOCAL
// ==========================================

router.get('/equipos', (req, res) => {
  try {
    const lista = Object.keys(equiposData).map((key) => ({
      id: key,
      nombre: equiposData[key].nombre,
      escudo: equiposData[key].escudo
    }));
    res.json({ success: true, equipos: lista });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al cargar equipos' });
  }
});

router.post('/validar-jugador', (req, res) => {
  try {
    const { equipoId, nombreJugador } = req.body || {};
    if (!equipoId || !nombreJugador) {
      return res.status(400).json({ success: false, error: 'Datos incompletos' });
    }
    const equipo = equiposData[equipoId];
    if (!equipo) return res.status(404).json({ success: false, error: 'Equipo no encontrado' });

    const r = buscarJugador(equipo, nombreJugador);
    if (r?.jugador) return res.json({ success: true, encontrado: true, jugador: r.jugador });
    if (r?.corto) return res.json({ success: true, encontrado: false, mensaje: 'Escribe al menos 3 letras.' });
    if (r?.ambiguo) return res.json({ success: true, encontrado: false, mensaje: mensajeAmbiguo(r.ambiguo) });
    res.json({ success: true, encontrado: false });
  } catch (error) {
    console.error("Error en /validar-jugador:", error);
    res.status(500).json({ success: false, error: 'Error interno en la base de datos de jugadores.' });
  }
});

router.post('/revelar-opciones', (req, res) => {
  try {
    const { equipoId, usados } = req.body || {};
    const equipo = equiposData[equipoId];
    if (!equipo) return res.status(404).json({ success: false, error: 'Equipo no encontrado' });

    const listaJugadores = equipo.data || equipo.jugadores || [];
    const disponibles = listaJugadores.filter(j => !(usados || []).includes(j.nombre));
    const mezclados = mezclar(disponibles).slice(0, 3);

    res.json({ success: true, opciones: mezclados });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener opciones' });
  }
});

// ==========================================
// MODO ONLINE
// ==========================================
export const salasOnline = new Map();

function generarCodigo() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let cod = '';
  for (let i = 0; i < 4; i++) cod += letras[Math.floor(Math.random() * letras.length)];
  return cod;
}

const nuevoToken = () => 'tok_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

const turnoActual = (sala) => sala.jugadores[sala.turnoActualIndex];

function empezarTurno(sala) {
  sala.turnoFin = Date.now() + TIEMPO_TURNO * 1000;
}

function avanzarTurno(sala) {
  const n = sala.jugadores.length;
  if (!sala.jugadores.some((j) => j.estado === 'vivo')) {
    sala.estado = 'resultados';
    return;
  }
  let i = sala.turnoActualIndex;
  do { i = (i + 1) % n; } while (sala.jugadores[i].estado !== 'vivo');
  sala.turnoActualIndex = i;
  empezarTurno(sala);
}

function cerrarTurno(sala, tipo, mensaje, jugadorId = null, valor = null) {
  const jugador = turnoActual(sala);
  const idObjetivo = jugadorId || jugador.id;
  
  if (tipo === 'eliminado') jugador.estado = 'eliminado';
  if (tipo === 'plantado') jugador.estado = 'plantado';
  if (tipo === 'ganador') { jugador.estado = 'ganador'; jugador.puntuacionActual = 0; }
  
  const sinJugadores = !sala.jugadores.some((j) => j.estado === 'vivo');
  sala.evento = {
    tipo,
    mensaje,
    jugadorId: idObjetivo,
    valor,
    hasta: Date.now() + PAUSA_MS[tipo],
    fin: tipo === 'ganador' || sinJugadores
  };
}

function consumirComodin(jugador, comodin) {
  if (comodin && jugador.comodines) {
    jugador.comodines = jugador.comodines.filter(c => c !== comodin);
  }
}

function tick(sala) {
  if (sala.estado !== 'jugando') return;
  const ahora = Date.now();
  if (sala.evento) {
    if (ahora < sala.evento.hasta) return;
    const fin = sala.evento.fin;
    sala.evento = null;
    if (fin) sala.estado = 'resultados';
    else avanzarTurno(sala);
    return;
  }
  if (ahora >= sala.turnoFin) {
    const jugador = turnoActual(sala);
    cerrarTurno(sala, 'fallo', `¡Tiempo agotado para ${jugador.nombre}!`);
  }
}

function contexto(req, res, token) {
  const sala = salasOnline.get(String(req.params.code || '').toUpperCase());
  if (!sala) { res.status(404).json({ error: 'Sala no encontrada.' }); return null; }
  const yo = sala.jugadores.find((j) => j.token === token);
  if (!yo) { res.status(401).json({ error: 'Token no válido.' }); return null; }
  tick(sala);
  return { sala, yo };
}

router.post('/online/crear', (req, res) => {
  const { nombre } = req.body || {};
  if (!nombre?.trim()) return res.status(400).json({ error: 'Nombre requerido.' });

  let code = generarCodigo();
  while (salasOnline.has(code)) code = generarCodigo();

  const tokenAdmin = nuevoToken();
  salasOnline.set(code, {
    code,
    estado: 'lobby',
    adminToken: tokenAdmin,
    jugadores: [{ id: 1, nombre: nombre.trim(), token: tokenAdmin, puntuacionActual: 0, estado: 'vivo', comodines: ['x2', 'x3', 'x5', 'revelar'] }],
    equipoSeleccionado: null,
    configuracion: { objetivo: 301, estadistica: 'goles' },
    jugadoresUsados: [], 
    usadosClaves: [],
    turnoActualIndex: 0,
    turnoFin: 0,
    evento: null
  });
  res.json({ success: true, code, token: tokenAdmin });
});

router.post('/online/unirse', (req, res) => {
  const { code, nombre } = req.body || {};
  const sala = salasOnline.get(String(code || '').toUpperCase());
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha comenzado.' });
  if (sala.jugadores.length >= 12) return res.status(400).json({ error: 'Sala llena (máx 12).' });

  const token = nuevoToken();
  const nuevoId = Math.max(...sala.jugadores.map((j) => j.id)) + 1;
  sala.jugadores.push({
    id: nuevoId,
    nombre: nombre?.trim() || `Jugador ${nuevoId}`,
    token,
    puntuacionActual: 0,
    estado: 'vivo',
    comodines: ['x2', 'x3', 'x5', 'revelar']
  });
  res.json({ success: true, code: sala.code, token });
});

router.get('/online/sala/:code', (req, res) => {
  const ctx = contexto(req, res, req.query.token);
  if (!ctx) return;
  const { sala, yo } = ctx;

  const segundos = sala.estado === 'jugando' && !sala.evento
    ? Math.max(0, Math.ceil((sala.turnoFin - Date.now()) / 1000))
    : 0;

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    esAdmin: sala.adminToken === yo.token,
    yoId: yo.id,
    equipoSeleccionado: sala.equipoSeleccionado,
    configuracion: sala.configuracion,
    turnoActualId: sala.estado === 'jugando' ? turnoActual(sala)?.id : null,
    tiempoTurno: TIEMPO_TURNO,
    tiempoRestante: segundos,
    evento: sala.evento ? { tipo: sala.evento.tipo, mensaje: sala.evento.mensaje, jugadorId: sala.evento.jugadorId, valor: sala.evento.valor } : null,
    jugadoresUsados: sala.jugadoresUsados,
    jugadores: sala.jugadores.map((j) => ({
      id: j.id,
      nombre: j.nombre,
      puntuacionActual: j.puntuacionActual,
      estado: j.estado,
      comodines: j.comodines,
      esAdmin: sala.adminToken === j.token
    }))
  });
});

router.post('/online/sala/:code/empezar', (req, res) => {
  const ctx = contexto(req, res, req.body?.token);
  if (!ctx) return;
  const { sala, yo } = ctx;
  if (sala.adminToken !== yo.token) return res.status(403).json({ error: 'Solo el anfitrión puede empezar.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha empezado.' });
  if (sala.jugadores.length < 2) return res.status(400).json({ error: 'Hacen falta al menos 2 jugadores.' });
  sala.estado = 'configuracion';
  res.json({ success: true });
});

router.post('/online/sala/:code/configurar', (req, res) => {
  const { token, equipoId, estadistica, objetivo } = req.body || {};
  const ctx = contexto(req, res, token);
  if (!ctx) return;
  const { sala, yo } = ctx;
  if (sala.adminToken !== yo.token) return res.status(403).json({ error: 'Solo el anfitrión puede configurar.' });
  if (sala.estado !== 'configuracion') return res.status(400).json({ error: 'Ahora no se puede configurar la partida.' });

  const equipo = equiposData[equipoId];
  if (!equipo) return res.status(400).json({ error: 'Equipo no válido.' });
  if (!ESTADISTICAS.includes(estadistica)) return res.status(400).json({ error: 'Estadística no válida.' });
  if (!Number(objetivo) || Number(objetivo) <= 0) return res.status(400).json({ error: 'Objetivo no válido.' });

  sala.equipoSeleccionado = { id: equipoId, nombre: equipo.nombre, escudo: equipo.escudo };
  sala.configuracion = { objetivo: Number(objetivo), estadistica };
  
  sala.jugadores.forEach((j) => { 
    j.puntuacionActual = sala.configuracion.objetivo; 
    j.estado = 'vivo';
    j.comodines = ['x2', 'x3', 'x5', 'revelar'];
  });
  sala.jugadoresUsados = [];
  sala.usadosClaves = [];
  sala.turnoActualIndex = Math.floor(Math.random() * sala.jugadores.length);
  sala.evento = null;
  sala.estado = 'jugando';
  empezarTurno(sala);
  res.json({ success: true });
});

router.post('/online/sala/:code/revelar-opciones', (req, res) => {
  const ctx = contexto(req, res, req.body?.token);
  if (!ctx) return;
  const { sala, yo } = ctx;
  if (sala.estado !== 'jugando' || sala.evento) return res.status(400).json({ error: 'No es el momento.' });
  if (turnoActual(sala).id !== yo.id) return res.status(400).json({ error: 'No es tu turno.' });
  if (!yo.comodines.includes('revelar')) return res.status(400).json({ error: 'Ya no tienes este comodín.' });

  const equipo = equiposData[sala.equipoSeleccionado.id];
  const listaJugadores = equipo.data || equipo.jugadores || [];
  const disponibles = listaJugadores.filter(j => !sala.jugadoresUsados.includes(j.nombre));
  const mezclados = mezclar(disponibles).slice(0, 3);

  res.json({ success: true, opciones: mezclados });
});

router.post('/online/sala/:code/jugar', (req, res) => {
  const { token, nombreJugador, comodin } = req.body || {};
  const ctx = contexto(req, res, token);
  if (!ctx) return;
  const { sala, yo } = ctx;
  if (sala.estado !== 'jugando' || sala.evento) return res.status(400).json({ error: 'Ahora no puedes responder.' });
  if (turnoActual(sala).id !== yo.id) return res.status(400).json({ error: 'No es tu turno.' });
  if (comodin && !yo.comodines.includes(comodin)) return res.status(400).json({ error: 'No tienes ese comodín.' });

  const r = buscarJugador(equiposData[sala.equipoSeleccionado.id], nombreJugador);
  if (r?.corto) { 
    consumirComodin(yo, comodin);
    cerrarTurno(sala, 'fallo', 'Escribe al menos 3 letras. Pierdes el turno.'); return res.json({ success: true }); 
  }
  if (r?.ambiguo) { 
    consumirComodin(yo, comodin);
    cerrarTurno(sala, 'fallo', mensajeAmbiguo(r.ambiguo) + ' Pierdes el turno.'); return res.json({ success: true }); 
  }
  if (!r?.jugador) { 
    consumirComodin(yo, comodin);
    cerrarTurno(sala, 'fallo', 'Jugador no encontrado. Pierdes el turno.'); return res.json({ success: true }); 
  }

  const jug = r.jugador;
  const clave = normalizar(jug.nombre);
  if (sala.usadosClaves.includes(clave)) { 
    consumirComodin(yo, comodin);
    cerrarTurno(sala, 'fallo', `${jug.nombre} ya ha sido dicho. Pierdes el turno.`); return res.json({ success: true }); 
  }

  const { estadistica } = sala.configuracion;
  const valorBase = Number(jug[estadistica]) || 0;

  if (valorBase === 0) {
    consumirComodin(yo, comodin);
    cerrarTurno(sala, 'eliminado', `${jug.nombre} tiene 0 ${estadistica}. ¡Eliminado!`);
    return res.json({ success: true });
  }

  consumirComodin(yo, comodin);

  let multiplicador = 1;
  if (comodin === 'x2') multiplicador = 2;
  if (comodin === 'x3') multiplicador = 3;
  if (comodin === 'x5') multiplicador = 5;

  const valorFinal = valorBase * multiplicador;

  sala.usadosClaves.push(clave);
  sala.jugadoresUsados.push(jug.nombre);
  const nueva = yo.puntuacionActual - valorFinal;
  if (nueva === 0) {
    cerrarTurno(sala, 'ganador', `¡DIANA! Ha clavado el 0 con ${jug.nombre}.`, yo.id, valorFinal);
  } else if (nueva < 0) {
    yo.puntuacionActual = nueva;
    cerrarTurno(sala, 'eliminado', `${jug.nombre} restó ${valorFinal}. ¡Te has pasado de 0!`);
  } else {
    yo.puntuacionActual = nueva;
    cerrarTurno(sala, 'acierto', `¡${jug.nombre}!`, yo.id, valorFinal);
  }
  res.json({ success: true });
});

router.post('/online/sala/:code/plantarse', (req, res) => {
  const ctx = contexto(req, res, req.body?.token);
  if (!ctx) return;
  const { sala, yo } = ctx;
  if (sala.estado !== 'jugando' || sala.evento) return res.status(400).json({ error: 'Ahora no puedes plantarte.' });
  if (turnoActual(sala).id !== yo.id) return res.status(400).json({ error: 'No es tu turno.' });
  cerrarTurno(sala, 'plantado', `${yo.nombre} se ha plantado.`);
  res.json({ success: true });
});

router.post('/online/sala/:code/revancha', (req, res) => {
  const ctx = contexto(req, res, req.body?.token);
  if (!ctx) return;
  const { sala, yo } = ctx;
  if (sala.adminToken !== yo.token) return res.status(403).json({ error: 'Solo el anfitrión puede repetir.' });
  if (sala.estado !== 'resultados') return res.status(400).json({ error: 'La partida aún no ha terminado.' });
  if (sala.jugadores.length < 2) return res.status(400).json({ error: 'Hacen falta al menos 2 jugadores.' });
  sala.estado = 'configuracion';
  res.json({ success: true });
});

router.post('/online/sala/:code/salir', (req, res) => {
  const sala = salasOnline.get(String(req.params.code || '').toUpperCase());
  const idx = sala ? sala.jugadores.findIndex((j) => j.token === req.body?.token) : -1;
  if (!sala || idx === -1) return res.json({ success: true });

  tick(sala);
  const eraSuTurno = sala.estado === 'jugando' && sala.turnoActualIndex === sala.jugadores.findIndex((j) => j.token === req.body.token);
  const [salio] = sala.jugadores.splice(sala.jugadores.findIndex((j) => j.token === req.body.token), 1);

  if (sala.jugadores.length === 0) {
    salasOnline.delete(sala.code);
    return res.json({ success: true });
  }
  if (sala.adminToken === salio.token) sala.adminToken = sala.jugadores[0].token;

  if (sala.estado === 'jugando') {
    const posicion = idx;
    if (posicion < sala.turnoActualIndex) sala.turnoActualIndex -= 1;
    if (sala.jugadores.length < 2) {
      sala.estado = 'resultados';
      sala.evento = null;
    } else if (eraSuTurno) {
      sala.evento = null;
      sala.turnoActualIndex = (posicion - 1 + sala.jugadores.length) % sala.jugadores.length;
      avanzarTurno(sala);
    }
  } else if (sala.estado === 'configuracion' && sala.jugadores.length < 2) {
    sala.estado = 'lobby';
  }
  res.json({ success: true });
});

export default router;