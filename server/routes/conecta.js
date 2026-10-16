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

function generarTableroParaSala(catId) {
  const cat = CATEGORIAS[catId] || CATEGORIAS.futbolistas;
  const tableros = cat.data;
  const tableroElegido = tableros[Math.floor(Math.random() * tableros.length)];

  const items = [];
  tableroElegido.grupos.forEach((g, gIdx) => {
    g.elementos.forEach((el) => {
      items.push({ texto: el, grupoId: gIdx });
    });
  });

  return {
    categoriaNombre: cat.nombre,
    grupos: tableroElegido.grupos.map((g, idx) => ({
      id: idx,
      tema: g.tema,
      palabrasClave: g.palabrasClave,
      elementos: g.elementos
    })),
    tablero: barajar(items)
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
    estado: 'lobby', // 'lobby' | 'categoria' | 'juego' | 'resolucion_grupo' | 'ultima_conexion' | 'ronda_fin' | 'final'
    rondaActual: 1,
    categoriaElegida: 'futbolistas',
    tablero: [],
    grupos: [],
    conexionesResueltas: [],
    jugadorPulsado: null, // { jugadorId, nombre }
    grupoParaTema: null,
    ultimoGrupoPendiente: null,
    feedbackTema: null,
    jugadores: [{ id: 1, token: tokenAdmin, nombre, puntos: 0, vidas: 3, conectado: true }]
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

// 3. Estado sincronizado de la sala
router.get('/online/sala/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const token = req.query.token;

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe o ha caducado.' });

  const jugadorActual = sala.jugadores.find((j) => j.token === token);
  if (!jugadorActual) return res.status(403).json({ error: 'No perteneces a esta sala.' });

  const esAdmin = sala.adminToken === token;

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    esAdmin,
    yoId: jugadorActual.id,
    rondaActual: sala.rondaActual,
    categoriaElegida: sala.categoriaElegida,
    tablero: sala.tablero,
    grupos: sala.grupos,
    conexionesResueltas: sala.conexionesResueltas,
    jugadorPulsado: sala.jugadorPulsado,
    grupoParaTema: sala.grupoParaTema,
    ultimoGrupoPendiente: sala.ultimoGrupoPendiente,
    feedbackTema: sala.feedbackTema,
    jugadores: sala.jugadores.map((j) => ({
      id: j.id,
      nombre: j.nombre,
      puntos: j.puntos,
      vidas: j.vidas
    }))
  });
});

// 4. Iniciar partida y pasar a selector de categoría (sólo anfitrión)
router.post('/online/sala/:code/iniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede iniciar.' });

  sala.jugadores.forEach((j) => {
    j.puntos = 0;
    j.vidas = 3;
  });
  sala.rondaActual = 1;
  sala.estado = 'categoria';

  res.json({ success: true });
});

// 5. Seleccionar categoría y generar tablero para la ronda
router.post('/online/sala/:code/seleccionar-categoria', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, categoriaId } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede elegir categoría.' });

  sala.categoriaElegida = categoriaId || 'futbolistas';
  sala.jugadores.forEach((j) => { j.vidas = 3; });
  sala.conexionesResueltas = [];
  sala.jugadorPulsado = null;
  sala.grupoParaTema = null;
  sala.ultimoGrupoPendiente = null;
  sala.feedbackTema = null;

  const datos = generarTableroParaSala(sala.categoriaElegida);
  sala.tablero = datos.tablero;
  sala.grupos = datos.grupos;
  sala.estado = 'juego';

  res.json({ success: true });
});

// 6. Pulsador rojo online (fase tablero o 4ª conexión)
router.post('/online/sala/:code/pulsar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || (sala.estado !== 'juego' && sala.estado !== 'ultima_conexion')) {
    return res.status(400).json({ error: 'Fase de juego no activa.' });
  }

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador) return res.status(403).json({ error: 'Jugador no válido.' });
  if (jugador.vidas <= 0) return res.status(403).json({ error: 'No te quedan vidas.' });
  if (sala.jugadorPulsado !== null) return res.status(409).json({ error: 'Otro jugador ya ha pulsado.' });

  sala.jugadorPulsado = {
    jugadorId: jugador.id,
    nombre: jugador.nombre
  };

  res.json({ success: true });
});

// 7. Cancelar pulsación voluntaria
router.post('/online/sala/:code/cancelar-turno', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || !sala.jugadorPulsado) return res.json({ success: true });

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador || (jugador.id !== sala.jugadorPulsado.jugadorId && sala.adminToken !== token)) {
    return res.status(403).json({ error: 'No autorizado.' });
  }

  sala.jugadorPulsado = null;
  res.json({ success: true });
});

// 8. Confirmar selección de 4 elementos
router.post('/online/sala/:code/confirmar-seleccion', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, seleccionados } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.estado !== 'juego' || !sala.jugadorPulsado) {
    return res.status(400).json({ error: 'No hay turno activo para responder.' });
  }

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador || jugador.id !== sala.jugadorPulsado.jugadorId) {
    return res.status(403).json({ error: 'No es tu turno de respuesta.' });
  }

  if (!Array.isArray(seleccionados) || seleccionados.length !== 4) {
    return res.status(400).json({ error: 'Debes seleccionar exactamente 4 elementos.' });
  }

  const cuentas = {};
  seleccionados.forEach((s) => {
    cuentas[s.grupoId] = (cuentas[s.grupoId] || 0) + 1;
  });

  const grupoAcertado = Object.entries(cuentas).find(([, cant]) => cant === 4);
  const tresCorrectos = Object.entries(cuentas).find(([, cant]) => cant === 3);

  if (grupoAcertado) {
    const gId = parseInt(grupoAcertado[0], 10);
    const grupoObj = sala.grupos.find((g) => g.id === gId);

    const numResueltas = sala.conexionesResueltas.length;
    let ptsGanados = 1;
    if (numResueltas === 0) ptsGanados = 5;
    else if (numResueltas === 1) ptsGanados = 3;

    jugador.puntos += ptsGanados;

    const textosEliminar = new Set(seleccionados.map((s) => s.texto));
    sala.tablero = sala.tablero.filter((item) => !textosEliminar.has(item.texto));

    const nuevaResuelta = {
      ...grupoObj,
      resueltoPor: jugador.nombre,
      puntosGanados: ptsGanados
    };
    sala.conexionesResueltas.push(nuevaResuelta);

    sala.grupoParaTema = nuevaResuelta;
    sala.feedbackTema = null;
    sala.estado = 'resolucion_grupo';

    res.json({ success: true, correcto: true, ptsGanados });
  } else {
    jugador.vidas -= 1;
    sala.jugadorPulsado = null;

    const quedanVivos = sala.jugadores.some((j) => j.vidas > 0);
    if (!quedanVivos) {
      sala.estado = 'ronda_fin';
    }

    res.json({
      success: true,
      correcto: false,
      tresCorrectos: Boolean(tresCorrectos),
      vidasRestantes: jugador.vidas
    });
  }
});

// 9. Validar temática de la conexión (+1 pt extra)
router.post('/online/sala/:code/validar-tema', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, inputTema, saltar } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || (sala.estado !== 'resolucion_grupo' && sala.estado !== 'ultima_conexion')) {
    return res.status(400).json({ error: 'Fase no activa.' });
  }

  const grupoObjetivo = sala.estado === 'resolucion_grupo' ? sala.grupoParaTema : sala.ultimoGrupoPendiente;
  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador) return res.status(403).json({ error: 'No autorizado.' });

  let esAcierto = false;
  if (!saltar && inputTema && grupoObjetivo?.palabrasClave) {
    const texto = String(inputTema).trim().toLowerCase();
    esAcierto = grupoObjetivo.palabrasClave.some((kw) => texto.includes(kw.toLowerCase()));
    if (esAcierto) {
      jugador.puntos += 1;
    }
  }

  if (sala.estado === 'ultima_conexion' && !saltar && !esAcierto) {
    jugador.vidas -= 1;
  }

  sala.feedbackTema = {
    esCorrecto: esAcierto,
    saltado: Boolean(saltar),
    temaReal: grupoObjetivo?.tema || '',
    jugadorNombre: jugador.nombre
  };

  res.json({ success: true, esAcierto });
});

// 10. Continuar tras el feedback de la temática
router.post('/online/sala/:code/continuar-tras-tema', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede avanzar.' });

  sala.feedbackTema = null;
  sala.grupoParaTema = null;
  sala.jugadorPulsado = null;

  if (sala.conexionesResueltas.length === 3) {
    const idsResueltos = new Set(sala.conexionesResueltas.map((r) => r.id));
    sala.ultimoGrupoPendiente = sala.grupos.find((g) => !idsResueltos.has(g.id));
    sala.estado = 'ultima_conexion';
  } else if (sala.conexionesResueltas.length >= 4) {
    sala.estado = 'ronda_fin';
  } else {
    sala.estado = 'juego';
  }

  res.json({ success: true });
});

// 11. Rendirse / soluciones
router.post('/online/sala/:code/rendirse', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'ronda_fin';
  res.json({ success: true });
});

// 12. Siguiente ronda (volver a categorías)
router.post('/online/sala/:code/siguiente-ronda', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  sala.rondaActual += 1;
  sala.estado = 'categoria';
  res.json({ success: true });
});

// 13. Finalizar partida y ver podio
router.post('/online/sala/:code/finalizar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'final';
  res.json({ success: true });
});

// 14. Reiniciar partida
router.post('/online/sala/:code/reiniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'lobby';
  sala.rondaActual = 1;
  sala.tablero = [];
  sala.grupos = [];
  sala.conexionesResueltas = [];
  sala.jugadores.forEach((j) => {
    j.puntos = 0;
    j.vidas = 3;
  });

  res.json({ success: true });
});

// 15. Salir
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