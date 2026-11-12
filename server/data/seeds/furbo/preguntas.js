// server/data/seeds/furbo/preguntas.js
// Ensamblador principal del banco de preguntas de Furbo.
// Combina base.js, manual.js y las preguntas generadas automáticamente desde hechos.js.

import { BASE } from './bancos/base.js';
import { VESTUARIO, REBOTE, ELECCION, PROHIBIDAS } from './bancos/manual.js';
import { generar } from './bancos/generador.js';
import { VESTUARIO_EXTRA, REBOTE_EXTRA, QUINIELA_DIFICIL, PROHIBIDAS_EXTRA, PENALTIS_FACIL_EXTRA, PENALTIS_DIFICIL_EXTRA } from './bancos/extra.js';

const gen = generar();

// Repartimos las preguntas manuales de ELECCION (4 opciones) entre Quiniela (3 opciones) y Penaltis (4 opciones)
const quinielaManual = [];
const penaltisFacilManual = [];
const penaltisDificilManual = [];

ELECCION.forEach((item, idx) => {
  const [pregunta, correcta, d1, d2, d3] = item;
  if (idx % 3 === 0) {
    quinielaManual.push([pregunta, correcta, d1, d2]);
  } else if (idx % 3 === 1) {
    penaltisFacilManual.push([pregunta, correcta, d1, d2, d3]);
  } else {
    penaltisDificilManual.push([pregunta, correcta, d1, d2, d3]);
  }
});

// Función para evitar preguntas duplicadas comparando el enunciado normalizado
function unicos(lista, fnClave = (x) => (Array.isArray(x) ? x[0] : x)) {
  const vistos = new Set();
  return lista.filter((item) => {
    const k = String(fnClave(item)).trim().toLowerCase();
    if (vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
}

export const PREGUNTAS = {
  vestuario: unicos([
    ...BASE.vestuario,
    ...VESTUARIO,
    ...VESTUARIO_EXTRA
  ]),

  rebote: unicos([
    ...BASE.rebote,
    ...REBOTE,
    ...gen.rebote,
    ...REBOTE_EXTRA
  ]),

  quiniela: unicos([
    ...BASE.quiniela,
    ...quinielaManual,
    ...gen.quiniela,
    ...QUINIELA_DIFICIL
  ]),

  prohibidas: unicos([
    ...BASE.prohibidas,
    ...PROHIBIDAS,
    ...PROHIBIDAS_EXTRA
  ]),

  penaltisFacil: unicos([
    ...BASE.penaltisFacil,
    ...penaltisFacilManual,
    ...gen.penaltisMedio,
    ...PENALTIS_FACIL_EXTRA
  ]),

  penaltisDificil: unicos([
    ...BASE.penaltisDificil,
    ...penaltisDificilManual,
    ...gen.penaltisAlto,
    ...PENALTIS_DIFICIL_EXTRA
  ])
};

// Las quinielas difíciles van al final de la lista: el motor saca la mitad de las veces una de ellas
const claveQ = (x) => String(x[0]).trim().toLowerCase();
const dificiles = new Set(QUINIELA_DIFICIL.map(claveQ));
export const QUINIELA_DIFICILES = PREGUNTAS.quiniela.map((x, i) => (dificiles.has(claveQ(x)) ? i : -1)).filter((i) => i >= 0);

export default PREGUNTAS;