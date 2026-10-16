import { Router } from 'express';
import seed from '../data/seeds/rankings/rankings.seed.js';
import { barajar } from '../lib/barajar.js';

const router = Router();

const ordenCategorias = Object.keys(seed);

// Palabras vacías que no deben activar la coincidencia por contención por sí solas
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
    .replace(/[\u0300-\u036f]/g, '') // Quita tildes y diacríticos
    .replace(/[^a-z0-9\s]/g, ' ')   // Quita signos y puntuación
    .replace(/\s+/g, ' ')           // Unifica espacios
    .trim();
}

// Colapsa letras repetidas consecutivas ("mississippi" -> "misisipi")
function colapsarDuplicadas(texto) {
  return texto.replace(/(.)\1+/g, '$1');
}

// Distancia de edición Levenshtein para tolerancia a erratas
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

// Comprobación estricta (exacta, espacios o errata tipográfica)
function esCoincidenciaDirecta(u, t) {
  if (u === t) return true;

  const uSinEspacios = u.replace(/\s+/g, '');
  const tSinEspacios = t.replace(/\s+/g, '');
  if (uSinEspacios === tSinEspacios) return true;

  // "misisipi" vs "mississippi"
  if (colapsarDuplicadas(uSinEspacios) === colapsarDuplicadas(tSinEspacios)) return true;

  if (sonParecidas(u, t) || sonParecidas(uSinEspacios, tSinEspacios)) return true;

  return false;
}

// Comprobación por contención de palabras o subcadenas ("kansas" en "kansas city chiefs")
function esCoincidenciaPorContencion(u, t) {
  // Si lo escrito por el usuario tiene al menos 4 caracteres y no es una palabra vacía
  if (!STOPWORDS.has(u) && u.length >= 4) {
    if (t.includes(u)) return true;
    if (t.length >= 4 && u.includes(t)) return true;
  }

  // Comprobar palabra a palabra significativa
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

// GET /api/rankings/categorias[cite: 17]
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

  // PASO 1: Buscar coincidencia directa/errata en todos los elementos
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

  // PASO 2: Si no hubo coincidencia directa, buscar por contención (subcadena o palabra clave)
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

export default router;