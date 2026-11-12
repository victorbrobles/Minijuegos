// server/routes/conecta.js
import express from 'express';
import futbolistas from '../data/seeds/conecta/futbolistas.js';
import deportistas from '../data/seeds/conecta/deportistas.js';
import famosos from '../data/seeds/conecta/famosos.js';
import animales from '../data/seeds/conecta/animales.js';
import comidas from '../data/seeds/conecta/comidas.js';
import paises from '../data/seeds/conecta/paises.js';
import videojuegos from '../data/seeds/conecta/videojuegos.js';
import cine from '../data/seeds/conecta/cine.js';
import musica from '../data/seeds/conecta/musica.js';
import historia from '../data/seeds/conecta/historia.js';
import * as E from '../conecta/engine.js';
import { limitesOnline } from '../../client/src/games/limites.js';
import { totalRondas } from '../../client/src/games/rondas.js';
const LIM = limitesOnline('conecta');

const router = express.Router();

const CATEGORIAS = {
  futbolistas: { nombre: 'Futbolistas', data: futbolistas },
  deportistas: { nombre: 'Deportistas', data: deportistas },
  famosos: { nombre: 'Famosos y Celebridades', data: famosos },
  animales: { nombre: 'Animales y Naturaleza', data: animales },
  comidas: { nombre: 'Comidas y Gastronomía', data: comidas },
  paises: { nombre: 'Países y Geografía', data: paises },
  videojuegos: { nombre: 'Videojuegos', data: videojuegos },
  cine: { nombre: 'Cine y Series', data: cine },
  musica: { nombre: 'Música', data: musica },
  historia: { nombre: 'Historia y Mitología', data: historia }
};

function barajar(array) {
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// ==========================================
// ENDPOINTS OFFLINE / LOCAL (INTACTOS)
// ==========================================
router.get('/categorias', (req, res) => {
  const lista = Object.entries(CATEGORIAS).map(([id, info]) => ({
    id,
    nombre: info.nombre,
    totalTableros: info.data.length
  }));
  res.json({ success: true, categorias: lista });
});

router.get('/tablero', (req, res) => {
  try {
    const catId = req.query.categoria || 'futbolistas';
    const cat = CATEGORIAS[catId] || CATEGORIAS.futbolistas;

    const tableros = cat.data;
    const tableroElegido = tableros[Math.floor(Math.random() * tableros.length)];

    const items = [];
    tableroElegido.grupos.forEach((g, gIdx) => {
      g.elementos.forEach((el) => {
        items.push({
          texto: el,
          grupoId: gIdx
        });
      });
    });

    res.json({
      success: true,
      categoria: cat.nombre,
      grupos: tableroElegido.grupos.map((g, idx) => ({
        id: idx,
        tema: g.tema,
        palabrasClave: g.palabrasClave,
        elementos: g.elementos
      })),
      tablero: barajar(items)
    });
  } catch (error) {
    console.error('Error al obtener tablero de Conecta 4:', error);
    res.status(500).json({ success: false, error: 'Error del servidor' });
  }
});

// ==========================================
// SALAS ONLINE (POR TURNOS, CON EL MOTOR server/conecta/engine.js)
// ==========================================
const salasOnline = {};
const MAX_JUGADORES = LIM.max;

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

function elegirTablero(catId) {
  const cat = CATEGORIAS[catId] || CATEGORIAS.futbolistas;
  const tableros = cat.data;
  return { categoria: cat.nombre, datos: tableros[Math.floor(Math.random() * tableros.length)] };
}

// Lleva a la sala los puntos que se han ganado en la ronda
function sincronizarPuntos(sala) {
  if (!sala.ronda) return;
  sala.ronda.jugadores.forEach((rj) => {
    const j = sala.jugadores.find((x) => x.id === rj.id);
    if (j) j.puntos = rj.puntos;
  });
}

function obtenerSala(req, res, { admin = false } = {}) {
  const code = String(req.params.code || '').toUpperCase();
  const sala = salasOnline[code];
  if (!sala) { res.status(404).json({ error: 'La sala no existe o ha caducado.' }); return null; }
  const token = req.body?.token ?? req.query?.token;
  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador) { res.status(403).json({ error: 'No perteneces a esta sala.' }); return null; }
  if (admin && sala.adminToken !== token) { res.status(403).json({ error: 'Solo el anfitrión puede hacerlo.' }); return null; }
  return { sala, jugador };
}

function estadoPara(sala, jugador) {
  const ahora = Date.now();
  if (sala.ronda && sala.estado === 'juego') {
    E.tick(sala.ronda, ahora);
    sincronizarPuntos(sala);
    if (sala.ronda.fase === 'fin') sala.estado = 'ronda_fin';
  }
  return {
    success: true,
    code: sala.code,
    estado: sala.estado, // 'lobby' | 'categoria' | 'juego' | 'ronda_fin' | 'final'
    esAdmin: sala.adminToken === jugador.token,
    yoId: jugador.id,
    rondaActual: sala.rondaActual,
    maxRondas: sala.maxRondas || totalRondas('conecta', null),
    partida: sala.ronda ? E.vista(sala.ronda, ahora) : null,
    jugadores: sala.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos }))
  };
}

// 1. Crear sala online
router.post('/online/crear', (req, res) => {
  const nombre = (req.body?.nombre || '').trim().slice(0, 20);
  if (!nombre) return res.status(400).json({ error: 'Debes indicar un nombre.' });

  let code = generarCodigoSala();
  while (salasOnline[code]) code = generarCodigoSala();

  const tokenAdmin = generarToken();
  salasOnline[code] = {
    code,
    adminToken: tokenAdmin,
    estado: 'lobby',
    rondaActual: 0,
    siguienteId: 2,
    ronda: null,
    jugadores: [{ id: 1, token: tokenAdmin, nombre, puntos: 0 }]
  };

  res.json({ success: true, code, token: tokenAdmin, jugadorId: 1 });
});

// 2. Unirse a sala online
router.post('/online/unirse', (req, res) => {
  const code = (req.body?.code || '').trim().toUpperCase();
  const nombre = (req.body?.nombre || '').trim().slice(0, 20);
  if (!nombre) return res.status(400).json({ error: 'Debes indicar un nombre.' });

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe o el código es incorrecto.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha comenzado.' });
  if (sala.jugadores.length >= LIM.max) return res.status(400).json({ error: `La sala está llena (máx. ${LIM.max}).` });
  if (sala.jugadores.some((j) => j.nombre.toLowerCase() === nombre.toLowerCase())) {
    return res.status(400).json({ error: 'Ya hay un jugador con ese nombre en la sala.' });
  }

  const token = generarToken();
  const nuevoId = sala.siguienteId++;
  sala.jugadores.push({ id: nuevoId, token, nombre, puntos: 0 });

  res.json({ success: true, code, token, jugadorId: nuevoId });
});

// 3. Estado sincronizado de la sala
router.get('/online/sala/:code', (req, res) => {
  const r = obtenerSala(req, res);
  if (!r) return;
  res.json(estadoPara(r.sala, r.jugador));
});

// 4. Iniciar partida: pasa al selector de categoría (sólo anfitrión)
router.post('/online/sala/:code/iniciar', (req, res) => {
  const r = obtenerSala(req, res, { admin: true });
  if (!r) return;
  const { sala } = r;
  if (sala.jugadores.length < LIM.min) return res.status(400).json({ error: `Se necesitan al menos ${LIM.min} jugadores.` });
  sala.jugadores.forEach((j) => { j.puntos = 0; });
  sala.rondaActual = 0;
  sala.maxRondas = totalRondas('conecta', req.body?.rondas);
  sala.ronda = null;
  sala.estado = 'categoria';
  res.json({ success: true });
});

// 5. Elegir categoría: crea la ronda y sortea quién empieza
router.post('/online/sala/:code/seleccionar-categoria', (req, res) => {
  const r = obtenerSala(req, res, { admin: true });
  if (!r) return;
  const { sala } = r;
  if (sala.estado !== 'categoria') return res.status(400).json({ error: 'Ahora no se puede elegir categoría.' });

  const { categoria, datos } = elegirTablero(req.body?.categoriaId);
  sala.rondaActual += 1;
  sala.ronda = E.crearRonda(
    sala.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos })),
    datos,
    { ronda: sala.rondaActual, categoria }
  );
  sala.estado = 'juego';
  res.json(estadoPara(sala, r.jugador));
});

// 6. Acciones de la ronda
//    listo · confirmar { ids } · tema { texto } (texto vacío = no intentar)  [jugador con el turno]
//    saltar-turno · finalizar-ronda                                       [anfitrión]
router.post('/online/sala/:code/accion', (req, res) => {
  const r = obtenerSala(req, res);
  if (!r) return;
  const { sala, jugador } = r;
  if (sala.estado !== 'juego' || !sala.ronda) return res.status(400).json({ error: 'No hay ninguna ronda en juego.' });

  const ahora = Date.now();
  const esAdmin = sala.adminToken === jugador.token;
  const { tipo } = req.body || {};
  let resultado;
  switch (tipo) {
    case 'listo': resultado = E.empezarTurno(sala.ronda, jugador.id, ahora); break;
    case 'confirmar': resultado = E.confirmarSeleccion(sala.ronda, jugador.id, req.body?.ids, ahora); break;
    case 'tema': resultado = E.adivinarTema(sala.ronda, jugador.id, String(req.body?.texto || '').slice(0, 120), ahora); break;
    case 'saltar-turno':
      if (!esAdmin) return res.status(403).json({ error: 'Solo el anfitrión puede saltar turnos.' });
      resultado = E.saltarTurno(sala.ronda);
      break;
    case 'finalizar-ronda':
      if (!esAdmin) return res.status(403).json({ error: 'Solo el anfitrión puede terminar la ronda.' });
      resultado = E.finalizarRonda(sala.ronda);
      break;
    default:
      return res.status(400).json({ error: 'Acción desconocida.' });
  }
  if (resultado?.error) return res.status(400).json({ error: resultado.error });
  res.json({ ...estadoPara(sala, jugador), resultado });
});

// 7. Nueva ronda (vuelve a elegir categoría)
router.post('/online/sala/:code/siguiente-ronda', (req, res) => {
  const r = obtenerSala(req, res, { admin: true });
  if (!r) return;
  sincronizarPuntos(r.sala);
  r.sala.ronda = null;
  r.sala.estado = r.sala.rondaActual >= (r.sala.maxRondas || Infinity) ? 'final' : 'categoria';
  res.json({ success: true });
});

// 8. Finalizar partida y ver podio
router.post('/online/sala/:code/finalizar', (req, res) => {
  const r = obtenerSala(req, res, { admin: true });
  if (!r) return;
  sincronizarPuntos(r.sala);
  r.sala.estado = 'final';
  res.json({ success: true });
});

// 9. Volver a la sala de espera
router.post('/online/sala/:code/reiniciar', (req, res) => {
  const r = obtenerSala(req, res, { admin: true });
  if (!r) return;
  const { sala } = r;
  sala.estado = 'lobby';
  sala.rondaActual = 0;
  sala.ronda = null;
  sala.jugadores.forEach((j) => { j.puntos = 0; });
  res.json({ success: true });
});

// 10. Salir
router.post('/online/sala/:code/salir', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.json({ success: true });

  const idx = sala.jugadores.findIndex((j) => j.token === token);
  if (idx !== -1) {
    const [saliente] = sala.jugadores.splice(idx, 1);
    if (sala.jugadores.length === 0) {
      delete salasOnline[code];
      return res.json({ success: true });
    }
    if (sala.adminToken === token) sala.adminToken = sala.jugadores[0].token;
    if (sala.ronda && sala.estado === 'juego') {
      E.quitarJugador(sala.ronda, saliente.id);
      if (sala.ronda.fase === 'fin') sala.estado = 'ronda_fin';
    }
  }

  res.json({ success: true });
});

export default router;
