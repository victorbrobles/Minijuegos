// server/routes/rasgos.js
import express from 'express';
import { randomUUID } from 'node:crypto';
import { famosos, recorte, fotoCompleta } from '../lib/rasgosImagen.js';
import { esCorrecta } from '../lib/normalizar.js';
import { barajar } from '../lib/barajar.js';

const router = express.Router();

const MAX_RONDAS = 15;
const MIN_JUGADORES = 2;
const MAX_JUGADORES = 15;
const TIEMPO_RONDA_MS = 60 * 1000;
const MIN_PARA_SOLUCION_MS = TIEMPO_RONDA_MS - 5000;
const CADUCIDAD_MS = 3 * 60 * 60 * 1000;
const MAX_PARTIDAS = 500;

// ==========================================
// PARTIDAS OFFLINE / LOCAL (INTACTAS)
// ==========================================
const partidas = new Map();

function limpiarPartidas() {
  const ahora = Date.now();
  for (const [id, p] of partidas) {
    if (ahora - p.ultima > CADUCIDAD_MS) partidas.delete(id);
  }
  while (partidas.size >= MAX_PARTIDAS) {
    partidas.delete(partidas.keys().next().value);
  }
}

function cargar(partidaId, ronda) {
  if (typeof partidaId !== 'string' || !Number.isInteger(ronda)) {
    return { status: 400, error: 'Petición no válida.' };
  }
  const partida = partidas.get(partidaId);
  if (!partida || Date.now() - partida.ultima > CADUCIDAD_MS) {
    partidas.delete(partidaId);
    return { status: 404, error: 'La partida ha caducado. Empieza una nueva.' };
  }
  const estado = partida.rondas[ronda];
  if (!estado) return { status: 404, error: 'Ronda no encontrada.' };
  partida.ultima = Date.now();
  return { partida, estado, famoso: estado.famoso };
}

router.post('/partida', (req, res) => {
  const { jugadores } = req.body ?? {};
  if (!Number.isInteger(jugadores) || jugadores < MIN_JUGADORES || jugadores > MAX_JUGADORES) {
    return res.status(400).json({ error: 'Número de jugadores no válido.' });
  }
  if (!famosos.length) {
    return res.status(404).json({
      error: 'Todavía no hay famosos cargados en rasgos.seed.js.'
    });
  }

  limpiarPartidas();
  const elegidos = barajar(famosos).slice(0, MAX_RONDAS);
  const partidaId = randomUUID();
  partidas.set(partidaId, {
    jugadores,
    ultima: Date.now(),
    rondas: elegidos.map((famoso) => ({ famoso, inicio: null, fallidos: new Set(), cerrada: false }))
  });
  res.json({ partidaId, rondas: elegidos.map((f) => ({ rasgo: f.rasgo ?? null })) });
});

router.get('/imagen/:partidaId/:ronda', async (req, res) => {
  const r = cargar(req.params.partidaId, Number(req.params.ronda));
  if (r.error) return res.status(r.status).json({ error: r.error });
  try {
    const buffer = await recorte(r.famoso);
    res.set('Cache-Control', 'no-store').type('jpeg').send(buffer);
  } catch (e) {
    console.error('[rasgos] No se pudo generar el recorte:', e.message);
    res.status(500).json({ error: 'No se pudo cargar la imagen.' });
  }
});

router.post('/empezar', (req, res) => {
  const r = cargar(req.body?.partidaId, req.body?.ronda);
  if (r.error) return res.status(r.status).json({ error: r.error });
  r.estado.inicio ??= Date.now();
  res.json({ ok: true });
});

function comprobarRespuesta(respuesta, famoso) {
  const opciones = [famoso.nombre, ...(famoso.alias ?? [])];
  let correcto = esCorrecta(respuesta, opciones);
  if (!correcto) {
    const limpiarEspacios = (txt) =>
      String(txt)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '');
    const respSinEspacios = limpiarEspacios(respuesta);
    correcto = opciones.some((opcion) => limpiarEspacios(opcion) === respSinEspacios);
  }
  return correcto;
}

router.post('/validar', (req, res) => {
  const r = cargar(req.body?.partidaId, req.body?.ronda);
  if (r.error) return res.status(r.status).json({ error: r.error });
  const { partida, estado, famoso } = r;

  const { jugadorId, respuesta } = req.body;
  if (
    !Number.isInteger(jugadorId) || jugadorId < 1 || jugadorId > partida.jugadores ||
    typeof respuesta !== 'string' || !respuesta.trim() || respuesta.length > 100
  ) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos' });
  }
  if (estado.cerrada) return res.status(409).json({ error: 'La ronda ya ha terminado.' });
  if (!estado.inicio) return res.status(403).json({ error: 'La ronda aún no ha empezado.' });
  if (estado.fallidos.has(jugadorId)) {
    return res.status(403).json({ error: 'Ya has fallado en esta ronda.' });
  }

  const correcto = comprobarRespuesta(respuesta, famoso);
  if (correcto) estado.cerrada = true;
  else estado.fallidos.add(jugadorId);

  res.json({
    correcto,
    nombreReal: correcto ? famoso.nombre : undefined,
    attribution: correcto ? (famoso.attribution ?? null) : undefined
  });
});

router.post('/solucion', (req, res) => {
  const r = cargar(req.body?.partidaId, req.body?.ronda);
  if (r.error) return res.status(r.status).json({ error: r.error });
  const { partida, estado, famoso } = r;

  const todosFallaron = estado.fallidos.size >= partida.jugadores;
  const sinTiempo = estado.inicio !== null && Date.now() - estado.inicio >= MIN_PARA_SOLUCION_MS;
  if (!estado.cerrada && !todosFallaron && !sinTiempo) {
    return res.status(403).json({ error: 'Aún no puedes ver la solución.' });
  }
  estado.cerrada = true;
  res.json({
    nombre: famoso.nombre,
    attribution: famoso.attribution ?? null
  });
});

router.get('/foto/:partidaId/:ronda', async (req, res) => {
  const r = cargar(req.params.partidaId, Number(req.params.ronda));
  if (r.error) return res.status(r.status).json({ error: r.error });
  if (!r.estado.cerrada) return res.status(403).json({ error: 'La ronda aún no ha terminado.' });
  try {
    const buffer = await fotoCompleta(r.famoso);
    res.set('Cache-Control', 'no-store').type('jpeg').send(buffer);
  } catch (e) {
    console.error('[rasgos] No se pudo cargar la foto:', e.message);
    res.status(500).json({ error: 'No se pudo cargar la foto.' });
  }
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
  const famoso = sala.famososElegidos[sala.rondaIdx];
  sala.ronda = {
    rasgo: famoso.rasgo ?? null,
    segundosRestantes: 60,
    estaPausado: false,
    ultimoTickTs: Date.now(),
    bloqueados: [],
    pulsado: null, // { jugadorId, nombre, texto }
    estadoRonda: 'activa', // 'activa' | 'resuelta'
    solucion: null,
    attribution: null,
    mensaje: null
  };
}

// 1. Crear sala online
router.post('/online/crear', (req, res) => {
  const nombre = (req.body?.nombre || '').trim();
  if (!nombre) return res.status(400).json({ error: 'Debes indicar un nombre.' });
  if (!famosos.length) return res.status(404).json({ error: 'No hay famosos disponibles.' });

  let code = generarCodigoSala();
  while (salasOnline[code]) code = generarCodigoSala();

  const tokenAdmin = generarToken();
  const elegidos = barajar(famosos).slice(0, MAX_RONDAS);

  salasOnline[code] = {
    code,
    adminToken: tokenAdmin,
    estado: 'lobby', // 'lobby' | 'jugando' | 'podio'
    famososElegidos: elegidos,
    rondaIdx: 0,
    jugadores: [{ id: 1, token: tokenAdmin, nombre, puntos: 0, conectado: true }],
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
  if (sala.jugadores.length >= MAX_JUGADORES) return res.status(400).json({ error: 'La sala está completa.' });
  if (sala.jugadores.some((j) => j.nombre.toLowerCase() === nombre.toLowerCase())) {
    return res.status(400).json({ error: 'Ya hay un jugador con ese nombre en la sala.' });
  }

  const token = generarToken();
  const nuevoId = sala.jugadores.length + 1;
  sala.jugadores.push({ id: nuevoId, token, nombre, puntos: 0, conectado: true });

  res.json({ success: true, code, token, jugadorId: nuevoId });
});

// 3. Estado de la sala (sincroniza cronómetro y estado de pulsador)
router.get('/online/sala/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const token = req.query.token;

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe o ha caducado.' });

  const jugadorActual = sala.jugadores.find((j) => j.token === token);
  if (!jugadorActual) return res.status(403).json({ error: 'No perteneces a esta sala.' });

  const esAdmin = sala.adminToken === token;

  // Lógica de avance del temporizador de 60s
  if (sala.estado === 'jugando' && sala.ronda && sala.ronda.estadoRonda === 'activa') {
    if (!sala.ronda.estaPausado && !sala.ronda.pulsado) {
      const ahora = Date.now();
      const delta = (ahora - sala.ronda.ultimoTickTs) / 1000;
      sala.ronda.segundosRestantes = Math.max(0, sala.ronda.segundosRestantes - delta);
      sala.ronda.ultimoTickTs = ahora;

      if (sala.ronda.segundosRestantes <= 0) {
        const famoso = sala.famososElegidos[sala.rondaIdx];
        sala.ronda.estadoRonda = 'resuelta';
        sala.ronda.solucion = famoso.nombre;
        sala.ronda.attribution = famoso.attribution || null;
        sala.ronda.mensaje = {
          tipo: 'info',
          texto: `¡Se acabó el tiempo! Nadie ha acertado. Era ${famoso.nombre}`
        };
      }
    } else {
      sala.ronda.ultimoTickTs = Date.now();
    }
  }

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    esAdmin,
    yoId: jugadorActual.id,
    rondaIdx: sala.rondaIdx,
    totalRondas: sala.famososElegidos.length,
    jugadores: sala.jugadores.map((j) => ({
      id: j.id,
      nombre: j.nombre,
      puntos: j.puntos,
      bloqueado: sala.ronda ? sala.ronda.bloqueados.includes(j.id) : false
    })),
    ronda: sala.ronda
  });
});

// 4. Iniciar partida online (solo anfitrión)
router.post('/online/sala/:code/iniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede iniciar.' });

  sala.estado = 'jugando';
  sala.rondaIdx = 0;
  sala.jugadores.forEach((j) => { j.puntos = 0; });
  iniciarNuevaRondaOnline(sala);

  res.json({ success: true });
});

// 5. Pulsador rojo online: detiene el tiempo y asigna el turno a quien pulsó
router.post('/online/sala/:code/pulsar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || !sala.ronda) return res.status(404).json({ error: 'Partida no activa.' });

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador) return res.status(403).json({ error: 'Jugador no válido.' });

  if (sala.ronda.estadoRonda !== 'activa') return res.status(400).json({ error: 'La ronda ya terminó.' });
  if (sala.ronda.pulsado !== null) return res.status(409).json({ error: 'Otro jugador ya ha pulsado el botón.' });
  if (sala.ronda.bloqueados.includes(jugador.id)) return res.status(403).json({ error: 'Estás bloqueado por fallar en esta ronda.' });

  sala.ronda.pulsado = {
    jugadorId: jugador.id,
    nombre: jugador.nombre,
    texto: '',
    segundosCongelados: Math.max(1, Math.ceil(sala.ronda.segundosRestantes))
  };
  sala.ronda.estaPausado = true;
  sala.ronda.mensaje = {
    tipo: 'info',
    texto: `¡${jugador.nombre} ha pulsado el botón! Está respondiendo...`
  };

  res.json({ success: true });
});

// 6. Transmisión de tecleo en directo
router.post('/online/sala/:code/teclear', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, texto } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || !sala.ronda || !sala.ronda.pulsado) return res.json({ success: true });

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador || sala.ronda.pulsado.jugadorId !== jugador.id) return res.json({ success: true });

  sala.ronda.pulsado.texto = String(texto || '').slice(0, 100);
  res.json({ success: true });
});

// 7. Enviar y validar respuesta online
router.post('/online/sala/:code/responder', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, respuesta } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || !sala.ronda || !sala.ronda.pulsado) return res.status(400).json({ error: 'No hay turno para responder.' });

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador || sala.ronda.pulsado.jugadorId !== jugador.id) return res.status(403).json({ error: 'No es tu turno de responder.' });

  const famoso = sala.famososElegidos[sala.rondaIdx];
  const correcto = comprobarRespuesta(respuesta, famoso);
  const puntosRonda = sala.ronda.pulsado.segundosCongelados || Math.max(1, Math.ceil(sala.ronda.segundosRestantes));

  if (correcto) {
    jugador.puntos += puntosRonda;
    sala.ronda.estadoRonda = 'resuelta';
    sala.ronda.solucion = famoso.nombre;
    sala.ronda.attribution = famoso.attribution || null;
    sala.ronda.mensaje = {
      tipo: 'success',
      texto: `¡Correcto! ${jugador.nombre} acertó: era ${famoso.nombre} (+${puntosRonda} pts)`
    };
    sala.ronda.pulsado = null;
  } else {
    jugador.puntos -= puntosRonda;
    sala.ronda.bloqueados.push(jugador.id);
    sala.ronda.pulsado = null;

    if (sala.ronda.bloqueados.length >= sala.jugadores.length) {
      sala.ronda.estadoRonda = 'resuelta';
      sala.ronda.solucion = famoso.nombre;
      sala.ronda.attribution = famoso.attribution || null;
      sala.ronda.mensaje = {
        tipo: 'error',
        texto: `Todos los jugadores han fallado. El famoso era: ${famoso.nombre}`
      };
    } else {
      sala.ronda.estaPausado = false;
      sala.ronda.ultimoTickTs = Date.now();
      sala.ronda.mensaje = {
        tipo: 'error',
        texto: `¡${jugador.nombre} ha fallado! (-${puntosRonda} pts). Queda fuera de esta ronda.`
      };
    }
  }

  res.json({ success: true, correcto });
});

// 8. Imagen recortada para online
router.get('/online/sala/:code/imagen', async (req, res) => {
  const sala = salasOnline[req.params.code.toUpperCase()];
  if (!sala || !sala.ronda) return res.status(404).json({ error: 'No hay ronda activa.' });
  const famoso = sala.famososElegidos[sala.rondaIdx];
  try {
    const buffer = await recorte(famoso);
    res.set('Cache-Control', 'no-store').type('jpeg').send(buffer);
  } catch (e) {
    res.status(500).json({ error: 'Error al procesar recorte.' });
  }
});

// 9. Foto completa para online
router.get('/online/sala/:code/foto', async (req, res) => {
  const sala = salasOnline[req.params.code.toUpperCase()];
  if (!sala || !sala.ronda) return res.status(404).json({ error: 'No hay ronda activa.' });
  if (sala.ronda.estadoRonda !== 'resuelta') return res.status(403).json({ error: 'Ronda aún no resuelta.' });
  const famoso = sala.famososElegidos[sala.rondaIdx];
  try {
    const buffer = await fotoCompleta(famoso);
    res.set('Cache-Control', 'no-store').type('jpeg').send(buffer);
  } catch (e) {
    res.status(500).json({ error: 'Error al procesar foto.' });
  }
});

// 10. Siguiente ronda online
router.post('/online/sala/:code/siguiente-ronda', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede avanzar.' });

  if (sala.rondaIdx + 1 < sala.famososElegidos.length) {
    sala.rondaIdx += 1;
    iniciarNuevaRondaOnline(sala);
  } else {
    sala.estado = 'podio';
  }

  res.json({ success: true });
});

// 11. Reiniciar partida online
router.post('/online/sala/:code/reiniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede reiniciar.' });

  sala.estado = 'lobby';
  sala.rondaIdx = 0;
  sala.ronda = null;
  sala.jugadores.forEach((j) => { j.puntos = 0; });

  res.json({ success: true });
});

// 12. Salir
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