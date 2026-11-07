// server/routes/popular.js
import express from 'express';
import parte1 from '../data/seeds/popular/parte1.js';
import parte2 from '../data/seeds/popular/parte2.js';
import parte3 from '../data/seeds/popular/parte3.js';

const router = express.Router();
const TODAS_LAS_PREGUNTAS = [...parte1, ...parte2, ...parte3];
const MAX_RONDAS = 15;

const PUNTUACION_PUESTOS = {
  1: 2,
  2: 4,
  3: 6,
  4: 8,
  5: 10
};

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
  if (!u || !o) return false;
  if (u === o) return true;
  const maxL = Math.max(u.length, o.length);
  if (maxL <= 4) return distanciaLevenshtein(u, o) <= 1;
  if (maxL <= 8) return distanciaLevenshtein(u, o) <= 2;
  return distanciaLevenshtein(u, o) <= 3;
}

// Palabras vacías y verbos auxiliares que no aportan significado nuclear
const STOPWORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al', 'a', 'en',
  'con', 'por', 'para', 'sin', 'sobre', 'entre', 'hacia', 'hasta', 'desde', 'como',
  'que', 'o', 'u', 'y', 'e', 'ni', 'no', 'si', 'se', 'su', 'sus', 'mi', 'mis', 'tu', 'tus',
  'me', 'te', 'lo', 'le', 'les', 'nos', 'os', 'mas', 'menos', 'muy', 'mucho', 'mucha',
  'muchos', 'muchas', 'poco', 'poca', 'pocos', 'pocas', 'todo', 'toda', 'todos', 'todas',
  'otro', 'otra', 'otros', 'otras', 'mismo', 'misma', 'tan', 'tanto', 'tanta', 'algun',
  'alguna', 'algunos', 'algunas', 'algo', 'alguien', 'nada', 'nadie', 'casi', 'bien',
  'mal', 'ya', 'cuando', 'donde', 'porque', 'aunque', 'pero', 'sino', 'tambien', 'solo',
  'ser', 'es', 'son', 'era', 'fue', 'estar', 'esta', 'estan', 'estaba', 'haber', 'ha',
  'han', 'hay', 'habia', 'tener', 'tiene', 'tienen', 'tenia', 'hacer', 'hace', 'hacen',
  'ir', 'va', 'van', 'iba', 'venir', 'viene', 'vienen', 'quedar', 'queda', 'quedan',
  'dar', 'da', 'dan', 'poner', 'pone', 'ponen', 'poder', 'puede', 'pueden', 'parecer',
  'parece', 'parecia', 'dejar', 'deja', 'salir', 'sale', 'llevar', 'lleva', 'pasar',
  'pasa', 'tomar', 'toma', 'usar', 'usa', 'ver', 've', 'comer', 'come', 'beber', 'bebe',
  'demasiado', 'demasiada', 'bastante', 'tipo', 'tipos', 'forma', 'cosa', 'cosas',
  'dia', 'dias', 'vez', 'veces', 'parte', 'lugar', 'sitio', 'casa', 'fabrica'
]);

// Grupos de sinónimos y familias léxicas equivalentes
const GRUPOS_SINONIMOS = [
  ['roto', 'rota', 'rotos', 'rotas', 'romper', 'rotura', 'partido', 'quebrado', 'rajado', 'estrellado', 'fractura', 'fracturado'],
  ['defectuoso', 'defectuosa', 'defecto', 'tara', 'fallo', 'falla', 'averiado', 'averia', 'estropeado', 'danado', 'malo'],
  ['dolor', 'duelen', 'duele', 'molestia', 'molestias', 'pinchazo', 'punzada', 'malestar', 'resentido', 'fatiga', 'agujetas', 'cansancio', 'pesadez', 'cargado'],
  ['musculo', 'musculos', 'muscular', 'musculares', 'cuerpo', 'fisico', 'piernas', 'espalda'],
  ['cansado', 'cansada', 'cansancio', 'agotado', 'agotamiento', 'fatiga', 'fatigado', 'extenuado', 'rendido', 'pesadez', 'sueno'],
  ['talla', 'tamano', 'medida', 'grande', 'pequeno', 'pequena', 'estrecho', 'ancho', 'aprieta', 'holgado', 'justo'],
  ['color', 'tono', 'tonalidad', 'pintura'],
  ['regalo', 'presente', 'obsequio', 'repetido', 'tenia'],
  ['arrepentimiento', 'arrepentirse', 'impulsivo', 'impulsiva', 'capricho', 'quiero', 'gusta', 'convence'],
  ['coche', 'auto', 'automovil', 'carro', 'vehiculo', 'turismo'],
  ['movil', 'telefono', 'celular', 'smartphone', 'iphone'],
  ['ordenador', 'computadora', 'pc', 'portatil', 'laptop'],
  ['nevera', 'frigorifico', 'refrigerador', 'heladera', 'frigo'],
  ['dinero', 'efectivo', 'plata', 'pasta', 'billetes', 'monedas', 'caro', 'barato', 'precio', 'gastos', 'economia'],
  ['trabajo', 'empleo', 'curro', 'oficina', 'laboral', 'trabajar', 'jefe'],
  ['medico', 'doctor', 'hospital', 'urgencias', 'ambulatorio', 'salud', 'enfermo', 'clinica', 'sanitario'],
  ['frio', 'helado', 'congelado', 'fresco', 'baja', 'invierno'],
  ['calor', 'caliente', 'ardiendo', 'bochorno', 'verano', 'alta'],
  ['lluvia', 'llover', 'lloviendo', 'diluvio', 'tormenta', 'agua', 'mojarse', 'paraguas'],
  ['ruido', 'ruidos', 'sonido', 'escandalo', 'gritos', 'musica', 'fiesta', 'molesto'],
  ['limpiar', 'limpieza', 'fregar', 'barrer', 'lavar', 'asear', 'higiene', 'sucio', 'polvo', 'mancha'],
  ['dormir', 'sueno', 'acostarse', 'cama', 'siesta', 'descansar', 'insomnio', 'despertarse', 'madrugar'],
  ['comer', 'comida', 'alimento', 'cenar', 'cena', 'almorzar', 'desayunar', 'hambre', 'apetito', 'picar'],
  ['beber', 'bebida', 'tomar', 'sed', 'trago', 'copa', 'vaso'],
  ['perro', 'can', 'mascota', 'cachorro', 'perrito', 'ladrar'],
  ['gato', 'felino', 'minino', 'gatito'],
  ['rapido', 'veloz', 'prisa', 'correr', 'urgencia', 'tarde', 'retraso'],
  ['lento', 'despacio', 'tardar', 'cola', 'esperar', 'atasco', 'trafico'],
  ['bateria', 'pila', 'pilas', 'carga', 'cargador', 'descargado', 'enchufe'],
  ['gafas', 'lentes', 'anteojos', 'lentillas', 'vista', 'ojos'],
  ['ropa', 'prenda', 'vestido', 'camiseta', 'pantalon', 'camisa', 'chaqueta', 'abrigo', 'vestirse'],
  ['zapatos', 'zapatillas', 'calzado', 'botas', 'deportivas', 'tenis', 'bambas', 'chanclas', 'sandalias']
];

function obtenerRaiz(palabra) {
  let w = palabra;
  if (w.length > 4 && w.endsWith('es')) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith('s')) w = w.slice(0, -1);
  return w;
}

function sonPalabrasEquivalentes(w1, w2) {
  if (!w1 || !w2) return false;
  if (w1 === w2) return true;

  const r1 = obtenerRaiz(w1);
  const r2 = obtenerRaiz(w2);
  if (r1 === r2 && r1.length >= 3) return true;

  // Misma familia léxica (ej. musculo <-> muscular, cansado <-> cansancio, defectuoso <-> defecto)
  if (r1.length >= 5 && r2.length >= 5 && r1.slice(0, 5) === r2.slice(0, 5)) {
    return true;
  }

  if (r1.length >= 4 && r2.length >= 4 && esParecido(r1, r2)) {
    return true;
  }

  for (const grupo of GRUPOS_SINONIMOS) {
    const en1 = grupo.some((g) => g === w1 || obtenerRaiz(g) === r1);
    const en2 = grupo.some((g) => g === w2 || obtenerRaiz(g) === r2);
    if (en1 && en2) return true;
  }

  return false;
}

function extraerTokensClave(textoNorm) {
  // Dividimos también por barras o guiones que ya fueron pasados a espacios
  const partes = textoNorm.split(' ').filter(Boolean);
  const claves = partes.filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  return claves.length > 0 ? claves : partes.filter((w) => w.length >= 2);
}

function coincideConRespuesta(inputRaw, resp) {
  const inputNorm = normalizar(inputRaw);
  if (!inputNorm || inputNorm.length < 2) return false;

  // Separamos las variantes que en el seed vienen con "/" o entre paréntesis
  const subOpcionesTexto = String(resp.texto ?? '')
    .split(/[\/(),]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const todasLasOpciones = [
    resp.texto,
    ...subOpcionesTexto,
    ...(resp.alias || [])
  ].map(normalizar).filter(Boolean);

  const tokensUsuario = extraerTokensClave(inputNorm);

  for (const opc of todasLasOpciones) {
    // 1. Coincidencia exacta o muy parecida de toda la frase
    if (inputNorm === opc || esParecido(inputNorm, opc)) return true;

    // 2. Inclusión directa de subcadena si tiene al menos 4 letras
    if (inputNorm.length >= 4 && (opc.includes(inputNorm) || inputNorm.includes(opc))) {
      return true;
    }

    // 3. Comparación flexible por palabras clave y sinónimos
    const tokensOpc = extraerTokensClave(opc);
    if (tokensOpc.length === 0 || tokensUsuario.length === 0) continue;

    // Cuántas palabras clave del usuario encuentran equivalente en la opción oficial
    let coincidenciasUsuario = 0;
    for (const tu of tokensUsuario) {
      if (tokensOpc.some((to) => sonPalabrasEquivalentes(tu, to))) {
        coincidenciasUsuario += 1;
      }
    }

    // Caso A: El usuario escribió 1 sola palabra clave (ej. "defectuoso", "roto", "trafico", "llaves")
    // y esa palabra es una de las palabras clave principales de la respuesta o su sinónimo.
    if (tokensUsuario.length === 1 && coincidenciasUsuario === 1 && tokensUsuario[0].length >= 4) {
      return true;
    }

    // Caso B: El usuario escribió varias palabras (ej. "dolor de musculos", "fatiga muscular", "viene roto")
    // y al menos 2 palabras clave coinciden, o todas las palabras clave que dijo el usuario están en la respuesta.
    if (tokensUsuario.length >= 2) {
      if (coincidenciasUsuario >= 2) return true;
      if (coincidenciasUsuario === tokensUsuario.length && coincidenciasUsuario >= 1) return true;
      if (tokensOpc.length === 1 && coincidenciasUsuario >= 1) return true;
    }
  }

  return false;
}

function barajarArray(array) {
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Generador de esqueleto de pista
function calcularEsqueletoPista(texto, tipo) {
  const palabras = texto.split(/\s+/);

  if (tipo === 'longitud') {
    return palabras
      .map((pal) =>
        pal
          .split('')
          .map((char) => (/[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/.test(char) ? '_' : char))
          .join(' ')
      )
      .join('   /   ');
  }

  if (tipo === 'letras') {
    const indicesLetras = [];
    for (let i = 0; i < texto.length; i++) {
      if (/[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/.test(texto[i])) {
        indicesLetras.push(i);
      }
    }

    const cantidadARevelar = Math.max(1, Math.ceil(indicesLetras.length * 0.25));
    const indicesBarajados = barajarArray(indicesLetras);
    const indicesElegidos = new Set(indicesBarajados.slice(0, cantidadARevelar));

    let cursor = 0;
    return palabras
      .map((pal) => {
        const palChars = pal.split('').map((char) => {
          const actualIdx = cursor;
          cursor += 1;
          if (!/[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/.test(char)) return char;
          return indicesElegidos.has(actualIdx) ? char : '_';
        });
        cursor += 1;
        return palChars.join(' ');
      })
      .join('   /   ');
  }
  return '';
}

// POST /api/popular/ronda
router.post('/ronda', (req, res) => {
  const { usados = [] } = req.body || {};
  const disponibles = TODAS_LAS_PREGUNTAS.filter((p) => !usados.includes(p.id));
  const pool = disponibles.length > 0 ? disponibles : TODAS_LAS_PREGUNTAS;
  const elegida = barajarArray(pool)[0];

  res.json({
    success: true,
    id: elegida.id,
    pregunta: elegida.pregunta
  });
});

// POST /api/popular/pista
router.post('/pista', (req, res) => {
  const { id, puesto, tipo } = req.body || {};
  const item = TODAS_LAS_PREGUNTAS.find((p) => p.id === id);

  if (!item) return res.status(404).json({ success: false, error: 'Pregunta no encontrada.' });

  const pNum = parseInt(puesto, 10);
  const resp = item.respuestas.find((r) => r.puesto === pNum);
  if (!resp) return res.status(404).json({ success: false, error: 'Puesto no encontrado.' });

  const esqueleto = calcularEsqueletoPista(resp.texto, tipo);
  res.json({ success: true, tipo, puesto: pNum, esqueleto });
});

// POST /api/popular/validar
router.post('/validar', (req, res) => {
  const { id, respuesta = '', acertados = [] } = req.body || {};
  const item = TODAS_LAS_PREGUNTAS.find((p) => p.id === id);

  if (!item) return res.status(404).json({ success: false, error: 'Pregunta no encontrada.' });

  if (!normalizar(respuesta)) return res.json({ acierto: false });

  for (const resp of item.respuestas) {
    if (acertados.includes(resp.puesto)) continue;

    if (coincideConRespuesta(respuesta, resp)) {
      const pts = PUNTUACION_PUESTOS[resp.puesto] || 2;
      return res.json({
        acierto: true,
        puesto: resp.puesto,
        texto: resp.texto,
        puntos: pts
      });
    }
  }

  res.json({ acierto: false });
});

// POST /api/popular/solucion
router.post('/solucion', (req, res) => {
  const { id } = req.body || {};
  const item = TODAS_LAS_PREGUNTAS.find((p) => p.id === id);

  if (!item) return res.status(404).json({ success: false, error: 'Pregunta no encontrada.' });

  res.json({
    success: true,
    respuestas: item.respuestas.map((r) => ({
      ...r,
      puntos: PUNTUACION_PUESTOS[r.puesto] || 2
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

function inicializarRondaOnline(sala) {
  const disponibles = TODAS_LAS_PREGUNTAS.filter((p) => !sala.usados.includes(p.id));
  const pool = disponibles.length > 0 ? disponibles : TODAS_LAS_PREGUNTAS;
  const elegida = barajarArray(pool)[0];

  sala.usados.push(elegida.id);

  const ids = sala.jugadores.map((j) => j.id);
  const orden = barajarArray(ids);

  sala.ronda = {
    preguntaId: elegida.id,
    pregunta: elegida.pregunta,
    respuestasOriginales: elegida.respuestas,
    acertados: {}, // { [puesto]: { texto, puntos, jugador } }
    ordenTurnos: orden,
    indiceTurno: 0,
    pistasJugadores: {}, // { [jugadorId]: { [puesto]: { longitud?, letras? } } }
    feedback: null, // { tipo, msg }
    solucionFinal: null,
    faseRonda: 'jugando' // 'jugando' | 'resolucion'
  };
}

function rotarTurnoOnline(sala) {
  sala.ronda.indiceTurno = (sala.ronda.indiceTurno + 1) % sala.ronda.ordenTurnos.length;
}

// POST /api/popular/online/crear
router.post('/online/crear', (req, res) => {
  const { nombre } = req.body || {};
  if (!nombre?.trim()) return res.status(400).json({ error: 'Nombre requerido.' });

  let code = generarCodigo();
  while (salasOnline.has(code)) code = generarCodigo();

  const tokenAdmin = 'tok_' + Math.random().toString(36).substring(2);
  const sala = {
    code,
    estado: 'lobby', // 'lobby' | 'jugando' | 'final'
    adminToken: tokenAdmin,
    rondaNum: 1,
    usados: [],
    jugadores: [{ id: 1, nombre: nombre.trim(), token: tokenAdmin, puntos: 0 }],
    ronda: null
  };

  salasOnline.set(code, sala);
  res.json({ success: true, code, token: tokenAdmin });
});

// POST /api/popular/online/unirse
router.post('/online/unirse', (req, res) => {
  const { code, nombre } = req.body || {};
  const sala = salasOnline.get(code?.toUpperCase());

  if (!sala) return res.status(404).json({ error: 'Sala no encontrada.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya comenzó.' });
  if (sala.jugadores.length >= 12) return res.status(400).json({ error: 'Sala llena (máx 12).' });

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

// GET /api/popular/online/sala/:code
router.get('/online/sala/:code', (req, res) => {
  const todosDescubiertos = Object.keys(sala.ronda.acertados || {}).length >= 5;
  if (todosDescubiertos && sala.ronda.faseRonda !== 'resolucion') {
    sala.ronda.solucionFinal = sala.ronda.respuestasOriginales.map((r) => ({
      ...r,
      puntos: PUNTUACION_PUESTOS[r.puesto] || 2
    }));
    sala.ronda.feedback = null;
    sala.ronda.faseRonda = 'resolucion';
  }

  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala) return res.status(404).json({ error: 'Sala no disponible.' });

  const token = req.query.token;
  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador) return res.status(401).json({ error: 'Token no válido.' });

  let infoRonda = null;
  if (sala.ronda) {
    const actId = sala.ronda.ordenTurnos[sala.ronda.indiceTurno];
    const jugadorActivo = sala.jugadores.find((j) => j.id === actId);
    const misPistas = sala.ronda.pistasJugadores[jugador.id] || {};

    infoRonda = {
      preguntaId: sala.ronda.preguntaId,
      pregunta: sala.ronda.pregunta,
      acertados: sala.ronda.acertados,
      jugadorActivoId: jugadorActivo?.id,
      jugadorActivoNombre: jugadorActivo?.nombre,
      misPistas,
      feedback: sala.ronda.feedback,
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

// POST /api/popular/online/sala/:code/iniciar
router.post('/online/sala/:code/iniciar', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });
  if (sala.jugadores.length < 2) return res.status(400).json({ error: 'Mínimo 2 jugadores para el modo online.' });

  sala.estado = 'jugando';
  sala.rondaNum = 1;
  sala.usados = [];
  inicializarRondaOnline(sala);

  res.json({ success: true });
});

// POST /api/popular/online/sala/:code/pista
router.post('/online/sala/:code/pista', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || !sala.ronda || sala.ronda.faseRonda !== 'jugando') {
    return res.status(400).json({ error: 'Ronda no activa.' });
  }

  const jugador = sala.jugadores.find((j) => j.token === req.body?.token);
  const actId = sala.ronda.ordenTurnos[sala.ronda.indiceTurno];
  if (!jugador || jugador.id !== actId) {
    return res.status(403).json({ error: 'Solo el jugador con turno puede pedir pistas.' });
  }

  const { puesto, tipo } = req.body || {};
  const pNum = parseInt(puesto, 10);
  const resp = sala.ronda.respuestasOriginales.find((r) => r.puesto === pNum);
  if (!resp) return res.status(404).json({ error: 'Puesto no encontrado.' });

  const esqueleto = calcularEsqueletoPista(resp.texto, tipo);

  jugador.puntos -= 1; // Coste de la pista

  if (!sala.ronda.pistasJugadores[jugador.id]) {
    sala.ronda.pistasJugadores[jugador.id] = {};
  }
  if (!sala.ronda.pistasJugadores[jugador.id][pNum]) {
    sala.ronda.pistasJugadores[jugador.id][pNum] = {};
  }

  sala.ronda.pistasJugadores[jugador.id][pNum][tipo] = esqueleto;

  res.json({ success: true });
});

// POST /api/popular/online/sala/:code/validar
router.post('/online/sala/:code/validar', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || !sala.ronda || sala.ronda.faseRonda !== 'jugando') {
    return res.status(400).json({ error: 'Ronda no activa.' });
  }

  const jugador = sala.jugadores.find((j) => j.token === req.body?.token);
  const actId = sala.ronda.ordenTurnos[sala.ronda.indiceTurno];
  if (!jugador || jugador.id !== actId) {
    return res.status(403).json({ error: 'No es tu turno de responder.' });
  }

  const { respuesta = '' } = req.body || {};
  if (!normalizar(respuesta)) return res.status(400).json({ error: 'Texto vacío.' });

  const puestosDescubiertos = Object.keys(sala.ronda.acertados).map(Number);
  let encontrado = null;

  for (const resp of sala.ronda.respuestasOriginales) {
    if (puestosDescubiertos.includes(resp.puesto)) continue;

    if (coincideConRespuesta(respuesta, resp)) {
      encontrado = resp;
      break;
    }
  }

  if (encontrado) {
    const pts = PUNTUACION_PUESTOS[encontrado.puesto] || 2;
    jugador.puntos += pts;

    sala.ronda.acertados[encontrado.puesto] = {
      texto: encontrado.texto,
      puntos: pts,
      jugador: jugador.nombre
    };

    // Si ya se han descubierto los 5 puestos, pasamos inmediatamente a la pantalla de fin de ronda
    if (Object.keys(sala.ronda.acertados).length >= 5) {
      sala.ronda.solucionFinal = sala.ronda.respuestasOriginales.map((r) => ({
        ...r,
        puntos: PUNTUACION_PUESTOS[r.puesto] || 2
      }));
      sala.ronda.feedback = null;
      sala.ronda.faseRonda = 'resolucion';
    } else {
      sala.ronda.feedback = {
        tipo: 'acierto',
        msg: `¡Acierto! ${jugador.nombre} encontró el Top ${encontrado.puesto}: «${encontrado.texto}» (+${pts} pts)`
      };

      setTimeout(() => {
        if (!sala.ronda || sala.ronda.faseRonda !== 'jugando') return;
        sala.ronda.feedback = null;
        rotarTurnoOnline(sala);
      }, 1500);
    }
  } else {
    sala.ronda.feedback = {
      tipo: 'fallo',
      msg: `«${respuesta}» no está entre los 5 más populares. ${jugador.nombre} pierde el turno.`
    };

    setTimeout(() => {
      if (!sala.ronda) return;
      sala.ronda.feedback = null;
      rotarTurnoOnline(sala);
    }, 1500);
  }

  res.json({ success: true, acierto: Boolean(encontrado) });
});

// POST /api/popular/online/sala/:code/pasar
router.post('/online/sala/:code/pasar', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || !sala.ronda || sala.ronda.faseRonda !== 'jugando') {
    return res.status(400).json({ error: 'Ronda no activa.' });
  }

  const jugador = sala.jugadores.find((j) => j.token === req.body?.token);
  const actId = sala.ronda.ordenTurnos[sala.ronda.indiceTurno];
  if (!jugador || jugador.id !== actId) {
    return res.status(403).json({ error: 'No es tu turno.' });
  }

  rotarTurnoOnline(sala);
  res.json({ success: true });
});

// POST /api/popular/online/sala/:code/rendirse
router.post('/online/sala/:code/rendirse', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || !sala.ronda) return res.status(400).json({ error: 'Ronda no activa.' });

  sala.ronda.solucionFinal = sala.ronda.respuestasOriginales.map((r) => ({
    ...r,
    puntos: PUNTUACION_PUESTOS[r.puesto] || 2
  }));
  sala.ronda.feedback = null;
  sala.ronda.faseRonda = 'resolucion';

  res.json({ success: true });
});

// POST /api/popular/online/sala/:code/siguiente-ronda
router.post('/online/sala/:code/siguiente-ronda', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  if (sala.rondaNum >= MAX_RONDAS) {
    sala.estado = 'final';
  } else {
    sala.rondaNum += 1;
    inicializarRondaOnline(sala);
  }

  res.json({ success: true });
});

// POST /api/popular/online/sala/:code/finalizar
router.post('/online/sala/:code/finalizar', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'final';
  res.json({ success: true });
});

export default router;