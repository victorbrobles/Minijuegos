// server/routes/popular.js
import express from 'express';
import parte1 from '../data/seeds/popular/parte1.js';
import parte2 from '../data/seeds/popular/parte2.js';
import parte3 from '../data/seeds/popular/parte3.js';

const router = express.Router();
const TODAS_LAS_PREGUNTAS = [...parte1, ...parte2, ...parte3];

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
  const maxL = Math.max(u.length, o.length);
  if (maxL <= 4) return distanciaLevenshtein(u, o) <= 1;
  if (maxL <= 8) return distanciaLevenshtein(u, o) <= 2;
  return distanciaLevenshtein(u, o) <= 3;
}

function barajarArray(array) {
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
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

  if (!item) {
    return res.status(404).json({ success: false, error: 'Pregunta no encontrada.' });
  }

  const pNum = parseInt(puesto, 10);
  const resp = item.respuestas.find((r) => r.puesto === pNum);

  if (!resp) {
    return res.status(404).json({ success: false, error: 'Puesto no encontrado.' });
  }

  const texto = resp.texto;
  const palabras = texto.split(/\s+/);

  if (tipo === 'longitud') {
    // Separa cada letra con espacio y marca la separación de palabras con ' / '
    const esqueleto = palabras
      .map((pal) =>
        pal
          .split('')
          .map((char) => (/[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/.test(char) ? '_' : char))
          .join(' ')
      )
      .join('   /   ');

    return res.json({
      success: true,
      tipo: 'longitud',
      puesto: pNum,
      esqueleto
    });
  }

  if (tipo === 'letras') {
    // Revela al menos el 20% de las letras
    const indicesLetras = [];
    for (let i = 0; i < texto.length; i++) {
      if (/[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/.test(texto[i])) {
        indicesLetras.push(i);
      }
    }

    const cantidadARevelar = Math.max(1, Math.ceil(indicesLetras.length * 0.2));
    const indicesBarajados = barajarArray(indicesLetras);
    const indicesElegidos = new Set(indicesBarajados.slice(0, cantidadARevelar));

    let cursor = 0;
    const esqueletoConLetras = palabras
      .map((pal) => {
        const palChars = pal.split('').map((char) => {
          const actualIdx = cursor;
          cursor += 1;
          if (!/[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/.test(char)) return char;
          return indicesElegidos.has(actualIdx) ? char : '_';
        });
        cursor += 1; // Salto del espacio
        return palChars.join(' ');
      })
      .join('   /   ');

    return res.json({
      success: true,
      tipo: 'letras',
      puesto: pNum,
      esqueleto: esqueletoConLetras
    });
  }

  res.status(400).json({ success: false, error: 'Tipo de pista no válido.' });
});

// POST /api/popular/validar
router.post('/validar', (req, res) => {
  const { id, respuesta = '', acertados = [] } = req.body || {};
  const item = TODAS_LAS_PREGUNTAS.find((p) => p.id === id);

  if (!item) {
    return res.status(404).json({ success: false, error: 'Pregunta no encontrada.' });
  }

  const inputNorm = normalizar(respuesta);
  if (!inputNorm) {
    return res.json({ acierto: false });
  }

  for (const resp of item.respuestas) {
    if (acertados.includes(resp.puesto)) continue;

    const opciones = [resp.texto, ...(resp.alias || [])].map(normalizar);
    const coincide = opciones.some((opc) => {
      if (inputNorm === opc) return true;
      if (esParecido(inputNorm, opc)) return true;
      if (inputNorm.length >= 4 && (opc.includes(inputNorm) || inputNorm.includes(opc))) return true;
      return false;
    });

    if (coincide) {
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

  if (!item) {
    return res.status(404).json({ success: false, error: 'Pregunta no encontrada.' });
  }

  res.json({
    success: true,
    respuestas: item.respuestas.map((r) => ({
      ...r,
      puntos: PUNTUACION_PUESTOS[r.puesto] || 2
    }))
  });
});

export default router;