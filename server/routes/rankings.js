// server/routes/rankings.js
import { Router } from 'express';
import seed from '../data/seeds/rankings/rankings.seed.js';
import { barajar } from '../lib/barajar.js';

const router = Router();
const ordenCategorias = Object.keys(seed);
const MAX_RONDAS = 15;

const STOPWORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'de', 'del', 'al', 'en', 'y', 'o', 'the', 'of', 'and',
  'san', 'santa', 'rio', 'isla', 'islas', 'monte', 'mar',
  'club', 'fc', 'cd', 'deportivo', 'real'
]);

function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function colapsarDuplicadas(texto) {
  return texto.replace(/(.)\1+/g, '$1');
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
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function sonParecidas(strA, strB) {
  const maxLen = Math.max(strA.length, strB.length);
  if (maxLen === 0) return false;
  const dist = distanciaLevenshtein(strA, strB);

  if (maxLen <= 4) return dist <= 1;
  if (maxLen <= 7) return dist <= 2;
  return dist <= 3;
}

function esCoincidenciaDirecta(u, t) {
  if (u === t) return true;
  const uSinEspacios = u.replace(/\s+/g, '');
  const tSinEspacios = t.replace(/\s+/g, '');
  if (uSinEspacios === tSinEspacios) return true;
  if (colapsarDuplicadas(uSinEspacios) === colapsarDuplicadas(tSinEspacios)) return true;
  if (sonParecidas(u, t) || sonParecidas(uSinEspacios, tSinEspacios)) return true;
  return false;
}

function esCoincidenciaPorContencion(u, t) {
  if (!STOPWORDS.has(u) && u.length >= 4) {
    if (t.includes(u)) return true;
    if (t.length >= 4 && u.includes(t)) return true;
  }
  const palabrasT = t.split(' ').filter((w) => !STOPWORDS.has(w) && w.length >= 4);
  const palabrasU = u.split(' ').filter((w) => !STOPWORDS.has(w) && w.length >= 4);

  for (const pU of palabrasU) {
    for (const pT of palabrasT) {
      if (pU === pT || sonParecidas(pU, pT) || colapsarDuplicadas(pU) === colapsarDuplicadas(pT)) {
        return true;
      }
    }
  }
  return false;
}

// GET /api/rankings/categorias
router.get('/categorias', (req, res) => {
  const categorias = ordenCategorias.map((c) => ({
    nombre: c,
    total: seed[c].length
  }));
  const total = ordenCategorias.reduce((acc, c) => acc + seed[c].length, 0);
  res.json({ categorias, total });
});

// POST /api/rankings/iniciar-ronda
router.post('/iniciar-ronda', (req, res) => {
  const { categoria } = req.body ?? {};

  let catElegida = categoria;
  if (!catElegida || catElegida === 'Todas las categorías' || !seed[catElegida]) {
    catElegida = barajar([...ordenCategorias])[0];
  }

  const listaRankings = seed[catElegida];
  if (!listaRankings || !listaRankings.length) {
    return res.status(404).json({ error: 'No hay rankings para esta categoría.' });
  }

  const ranking = barajar([...listaRankings])[0];
  const total = ranking.elementos.length;

  const cantidadOcultos = Math.min(Math.max(2, Math.floor(total * 0.45)), 4);
  const indices = barajar(ranking.elementos.map((_, i) => i)).slice(0, cantidadOcultos);
  const setOcultos = new Set(indices);

  const elementosFront = ranking.elementos.map((elem, idx) => {
    const esOculto = setOcultos.has(idx);
    return {
      posicion: elem.posicion,
      oculto: esOculto,
      valor: esOculto ? null : elem.valor,
      pista: esOculto ? elem.pista : null
    };
  });

  res.json({
    categoria: catElegida,
    titulo: ranking.titulo,
    descripcion: ranking.descripcion,
    elementos: elementosFront
  });
});

// POST /api/rankings/validar
router.post('/validar', (req, res) => {
  const { categoria, titulo, respuesta, posicionesOcultas } = req.body ?? {};
  const lista = seed[categoria];
  if (!lista) return res.status(404).json({ error: 'Categoría no encontrada.' });

  const ranking = lista.find((r) => r.titulo === titulo);
  if (!ranking) return res.status(404).json({ error: 'Ranking no encontrado.' });

  const ocultasSet = new Set(Array.isArray(posicionesOcultas) ? posicionesOcultas : []);
  const uNorm = normalizar(respuesta);

  if (!uNorm) {
    return res.json({ acierto: false, mensaje: 'Introduce una respuesta.' });
  }

  for (const elem of ranking.elementos) {
    const opciones = [elem.valor, ...(elem.alias ?? [])].map(normalizar);
    if (opciones.some((opc) => esCoincidenciaDirecta(uNorm, opc))) {
      if (!ocultasSet.has(elem.posicion)) {
        return res.json({
          acierto: false,
          yaVisible: true,
          mensaje: `"${elem.valor}" ya está descubierto en el ranking.`
        });
      }
      return res.json({
        acierto: true,
        posicion: elem.posicion,
        valorReal: elem.valor
      });
    }
  }

  for (const elem of ranking.elementos) {
    const opciones = [elem.valor, ...(elem.alias ?? [])].map(normalizar);
    if (opciones.some((opc) => esCoincidenciaPorContencion(uNorm, opc))) {
      if (!ocultasSet.has(elem.posicion)) {
        return res.json({
          acierto: false,
          yaVisible: true,
          mensaje: `"${elem.valor}" ya está descubierto en el ranking.`
        });
      }
      return res.json({
        acierto: true,
        posicion: elem.posicion,
        valorReal: elem.valor
      });
    }
  }

  res.json({
    acierto: false,
    mensaje: 'Respuesta incorrecta.'
  });
});

// POST /api/rankings/solucion
router.post('/solucion', (req, res) => {
  const { categoria, titulo } = req.body ?? {};
  const lista = seed[categoria];
  if (!lista) return res.status(404).json({ error: 'Categoría no encontrada.' });

  const ranking = lista.find((r) => r.titulo === titulo);
  if (!ranking) return res.status(404).json({ error: 'Ranking no encontrado.' });

  res.json({
    titulo: ranking.titulo,
    descripcion: ranking.descripcion,
    elementos: ranking.elementos.map((e) => ({
      posicion: e.posicion,
      valor: e.valor
    }))
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

function inicializarRondaOnline(sala, catNombre) {
  let catElegida = catNombre;
  if (!catElegida || catElegida === 'Todas las categorías' || !seed[catElegida]) {
    catElegida = barajar([...ordenCategorias])[0];
  }

  const lista = seed[catElegida];
  const ranking = barajar([...lista])[0];
  const total = ranking.elementos.length;

  const cantidadOcultos = Math.min(Math.max(2, Math.floor(total * 0.45)), 4);
  const indices = barajar(ranking.elementos.map((_, i) => i)).slice(0, cantidadOcultos);
  const setOcultos = new Set(indices);

  const elementosFront = ranking.elementos.map((elem, idx) => {
    const esOculto = setOcultos.has(idx);
    return {
      posicion: elem.posicion,
      oculto: esOculto,
      valor: esOculto ? null : elem.valor,
      pista: esOculto ? elem.pista : null
    };
  });

  const ids = sala.jugadores.map((j) => j.id);
  
  let primerTurnoId;
  if (sala.rondaNum === 1 || !sala.proximoInicialId) {
    primerTurnoId = barajar([...ids])[0];
  } else {
    primerTurnoId = sala.proximoInicialId;
  }

  sala.ronda = {
    categoria: catElegida,
    titulo: ranking.titulo,
    descripcion: ranking.descripcion,
    elementosOriginales: ranking.elementos,
    puestos: elementosFront,
    pistasUsadas: {},
    pistasBloqueadas: {},
    jugadorInicialRondaId: primerTurnoId,
    jugadorTurnoId: primerTurnoId,
    jugadoresIntentados: [primerTurnoId],
    esRebote: false,
    motivo: null,
    mensajeFeedback: null,
    solucionFinal: null,
    faseRonda: 'jugando' 
  };
}

// Fija el siguiente jugador inicial de forma puramente secuencial
function fijarProximoInicial(sala) {
  const ids = sala.jugadores.map((j) => j.id);
  const idx = ids.indexOf(sala.ronda.jugadorInicialRondaId);
  sala.proximoInicialId = ids[(idx + 1) % ids.length];
}

function pasarReboteOnline(sala, tipoFallo) {
  const ronda = sala.ronda;

  const nuevosBloqueos = { ...ronda.pistasBloqueadas };
  ronda.puestos.forEach((p) => {
    if (p.oculto && !ronda.pistasUsadas[p.posicion]) {
      nuevosBloqueos[p.posicion] = true;
    }
  });
  ronda.pistasBloqueadas = nuevosBloqueos;

  const ids = sala.jugadores.map((j) => j.id);
  const idxActual = ids.indexOf(ronda.jugadorTurnoId);
  let siguienteIdx = (idxActual + 1) % ids.length;
  let intentos = 0;

  while (ronda.jugadoresIntentados.includes(ids[siguienteIdx]) && intentos < ids.length) {
    siguienteIdx = (siguienteIdx + 1) % ids.length;
    intentos++;
  }

  const elegido = ids[siguienteIdx];

  if (!ronda.jugadoresIntentados.includes(elegido)) {
    ronda.jugadorTurnoId = elegido;
    ronda.jugadoresIntentados.push(elegido);
    ronda.esRebote = true;
    ronda.motivo = tipoFallo;
    ronda.mensajeFeedback = null;
  } else {
    fijarProximoInicial(sala);
    ronda.solucionFinal = ronda.elementosOriginales.map((e) => ({
      posicion: e.posicion,
      valor: e.valor
    }));
    ronda.faseRonda = 'solucion';
  }
}

// POST /api/rankings/online/crear
router.post('/online/crear', (req, res) => {
  const { nombre } = req.body || {};
  if (!nombre?.trim()) return res.status(400).json({ error: 'Nombre requerido.' });

  let code = generarCodigo();
  while (salasOnline.has(code)) code = generarCodigo();

  const tokenAdmin = 'tok_' + Math.random().toString(36).substring(2);
  const sala = {
    code,
    estado: 'lobby',
    adminToken: tokenAdmin,
    rondaNum: 1,
    proximoInicialId: null,
    jugadores: [{ id: 1, nombre: nombre.trim(), token: tokenAdmin, puntos: 0 }],
    ronda: null
  };

  salasOnline.set(code, sala);
  res.json({ success: true, code, token: tokenAdmin });
});

// POST /api/rankings/online/unirse
router.post('/online/unirse', (req, res) => {
  const { code, nombre } = req.body || {};
  const sala = salasOnline.get(code?.toUpperCase());

  if (!sala) return res.status(404).json({ error: 'Sala no encontrada.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya comenzó.' });
  if (sala.jugadores.length >= 15) return res.status(400).json({ error: 'Sala llena (máx 15).' });

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

// GET /api/rankings/online/sala/:code
router.get('/online/sala/:code', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala) return res.status(404).json({ error: 'Sala no disponible.' });

  const token = req.query.token;
  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador) return res.status(401).json({ error: 'Token no válido.' });

  let infoRonda = null;
  if (sala.ronda) {
    const jTurno = sala.jugadores.find((j) => j.id === sala.ronda.jugadorTurnoId);
    infoRonda = {
      categoria: sala.ronda.categoria,
      titulo: sala.ronda.titulo,
      descripcion: sala.ronda.descripcion,
      puestos: sala.ronda.puestos,
      pistasUsadas: sala.ronda.pistasUsadas,
      pistasBloqueadas: sala.ronda.pistasBloqueadas,
      jugadorTurnoId: jTurno?.id,
      jugadorTurnoNombre: jTurno?.nombre,
      esRebote: sala.ronda.esRebote,
      motivo: sala.ronda.motivo,
      mensajeFeedback: sala.ronda.mensajeFeedback,
      solucionFinal: sala.ronda.solucionFinal,
      faseRonda: sala.ronda.faseRonda
    };
  }

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    esAdmin: sala.adminToken === token,
    yoId: jugador.id,
    rondaNum: sala.rondaNum,
    maxRondas: MAX_RONDAS,
    jugadores: sala.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos })),
    ronda: infoRonda
  });
});

// POST /api/rankings/online/sala/:code/iniciar-partida
router.post('/online/sala/:code/iniciar-partida', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });
  if (sala.jugadores.length < 2) return res.status(400).json({ error: 'Mínimo 2 jugadores requeridos.' });

  sala.estado = 'categoria';
  sala.rondaNum = 1;
  sala.proximoInicialId = null;
  res.json({ success: true });
});

// POST /api/rankings/online/sala/:code/elegir-categoria
router.post('/online/sala/:code/elegir-categoria', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  const { categoria } = req.body || {};
  inicializarRondaOnline(sala, categoria);
  sala.estado = 'jugando';

  res.json({ success: true });
});

// POST /api/rankings/online/sala/:code/pista
router.post('/online/sala/:code/pista', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || !sala.ronda || sala.ronda.faseRonda !== 'jugando') {
    return res.status(400).json({ error: 'Ronda no activa.' });
  }

  const jugador = sala.jugadores.find((j) => j.token === req.body?.token);
  if (!jugador || jugador.id !== sala.ronda.jugadorTurnoId) {
    return res.status(403).json({ error: 'No es tu turno para pedir pista.' });
  }

  const { posicion } = req.body || {};
  const pNum = parseInt(posicion, 10);
  if (sala.ronda.pistasBloqueadas[pNum]) {
    return res.status(400).json({ error: 'Pista bloqueada.' });
  }

  sala.ronda.pistasUsadas[pNum] = true;
  res.json({ success: true });
});

// POST /api/rankings/online/sala/:code/validar
router.post('/online/sala/:code/validar', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || !sala.ronda || sala.ronda.faseRonda !== 'jugando') {
    return res.status(400).json({ error: 'Ronda no activa.' });
  }

  const jugador = sala.jugadores.find((j) => j.token === req.body?.token);
  if (!jugador || jugador.id !== sala.ronda.jugadorTurnoId) {
    return res.status(403).json({ error: 'No es tu turno de responder.' });
  }

  const { respuesta = '' } = req.body || {};
  const uNorm = normalizar(respuesta);
  if (!uNorm) return res.status(400).json({ error: 'Respuesta vacía.' });

  const posicionesOcultas = sala.ronda.puestos.filter((p) => p.oculto).map((p) => p.posicion);
  const ocultasSet = new Set(posicionesOcultas);

  let matchElem = null;

  for (const elem of sala.ronda.elementosOriginales) {
    const opciones = [elem.valor, ...(elem.alias ?? [])].map(normalizar);
    if (opciones.some((opc) => esCoincidenciaDirecta(uNorm, opc))) {
      matchElem = elem;
      break;
    }
  }

  if (!matchElem) {
    for (const elem of sala.ronda.elementosOriginales) {
      const opciones = [elem.valor, ...(elem.alias ?? [])].map(normalizar);
      if (opciones.some((opc) => esCoincidenciaPorContencion(uNorm, opc))) {
        matchElem = elem;
        break;
      }
    }
  }

  if (matchElem) {
    if (!ocultasSet.has(matchElem.posicion)) {
      sala.ronda.mensajeFeedback = {
        tipo: 'alerta',
        texto: `"${matchElem.valor}" ya está descubierto en el ranking.`
      };
      return res.json({ success: true, yaVisible: true });
    }

    const usoPista = sala.ronda.pistasUsadas[matchElem.posicion];
    const pts = usoPista ? 1 : 3;
    jugador.puntos += pts;

    sala.ronda.puestos = sala.ronda.puestos.map((p) =>
      p.posicion === matchElem.posicion
        ? { ...p, oculto: false, valor: matchElem.valor }
        : p
    );

    sala.ronda.mensajeFeedback = {
      tipo: 'exito',
      texto: `¡Correcto! ${jugador.nombre} acertó el puesto #${matchElem.posicion}: "${matchElem.valor}" (+${pts} pts).`
    };

    const quedanOcultos = sala.ronda.puestos.some((p) => p.oculto);
    if (!quedanOcultos) {
      fijarProximoInicial(sala);
      setTimeout(() => {
        if (!sala.ronda) return;
        sala.ronda.faseRonda = 'resumen';
      }, 1500);
    }

    return res.json({ success: true, acierto: true });
  }

  // Fallo: rebote
  sala.ronda.mensajeFeedback = {
    tipo: 'error',
    texto: `"${respuesta}" es incorrecto. Turno para el siguiente jugador.`
  };
  pasarReboteOnline(sala, 'fallo');
  res.json({ success: true, acierto: false });
});

// POST /api/rankings/online/sala/:code/tiempo-agotado
router.post('/online/sala/:code/tiempo-agotado', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || !sala.ronda || sala.ronda.faseRonda !== 'jugando') {
    return res.status(400).json({ error: 'Ronda no activa.' });
  }

  const jugador = sala.jugadores.find((j) => j.token === req.body?.token);
  if (!jugador || jugador.id !== sala.ronda.jugadorTurnoId) {
    return res.status(403).json({ error: 'No autorizado.' });
  }

  pasarReboteOnline(sala, 'tiempo');
  res.json({ success: true });
});

// POST /api/rankings/online/sala/:code/pasar
router.post('/online/sala/:code/pasar', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || !sala.ronda || sala.ronda.faseRonda !== 'jugando') {
    return res.status(400).json({ error: 'Ronda no activa.' });
  }

  const jugador = sala.jugadores.find((j) => j.token === req.body?.token);
  if (!jugador || jugador.id !== sala.ronda.jugadorTurnoId) {
    return res.status(403).json({ error: 'No es tu turno.' });
  }

  pasarReboteOnline(sala, 'rebote');
  res.json({ success: true });
});

// POST /api/rankings/online/sala/:code/avanzar-resumen
router.post('/online/sala/:code/avanzar-resumen', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || !sala.ronda) return res.status(400).json({ error: 'Ronda no activa.' });

  sala.ronda.faseRonda = 'resumen';
  res.json({ success: true });
});

// POST /api/rankings/online/sala/:code/siguiente-ronda
router.post('/online/sala/:code/siguiente-ronda', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  if (sala.rondaNum >= MAX_RONDAS) {
    sala.estado = 'final';
  } else {
    sala.rondaNum += 1;
    sala.ronda = null;
    sala.estado = 'categoria';
  }

  res.json({ success: true });
});

// POST /api/rankings/online/sala/:code/finalizar
router.post('/online/sala/:code/finalizar', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'final';
  res.json({ success: true });
});

export default router;