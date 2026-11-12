// server/data/seeds/futbolgrid/index.js
// Tableros de «Fútbol en raya» con sus respuestas: las escritas a mano en categorias*.js más las que se calculan
// con la base de futbolistas (respuestas.js). Las respuestas a mano de futbolistas que están en la base pero no
// cumplen la casilla se descartan (eran errores). Solo se juegan los tableros con respuestas en todas las casillas.
import GRIDS_VOL_1 from './categorias.js';
import GRIDS_VOL_2 from './categorias1.js';
import GRIDS_VOL_3 from './categorias2.js';
import { calcularCasilla, JUGADORES, predicado, tipo, nuncaEntrenado, ALIAS } from './respuestas.js';

// Categorías imposibles o casi (ninguna o una respuesta real) sustituidas por otras parecidas.
const CAMBIOS = {
  grid_24: { columnas: { 'Selección: Italia': 'Selección: Uruguay' } },
  grid_27: { columnas: { 'Jugó en el Atlético de Madrid': 'Jugó en LaLiga' } },
  grid_30: { columnas: { 'Balón de Oro': 'Selección: Brasil' } },
  grid_12: { filas: { 'Bota de Oro': 'Ganó el Mundial' } },
  grid_32: { columnas: { 'Jugó con Diego Maradona': 'AC Milan' } },
  grid_8: { filas: { 'Premio Puskas': 'Ganó la Champions League' } },
  grid_9: { filas: { 'Usó un dorsal mayor a 90': 'Ganó la Champions League' } }
};

const norm = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const EN_BASE = new Map();
JUGADORES.forEach((j) => EN_BASE.set(norm(j.nombre), j));
// Solo alias de varias palabras («leo messi»): los de una («pedro», «alex») pueden ser otro futbolista.
JUGADORES.forEach((j) => j.alias.forEach((a) => { if (a.includes(' ') && !EN_BASE.has(norm(a))) EN_BASE.set(norm(a), j); }));
const SEGURAS = new Set(['seleccion', 'club']);

function completar(g) {
  const cambios = CAMBIOS[g.id] || {};
  const filas = g.filas.map((f) => cambios.filas?.[f] || f);
  const columnas = g.columnas.map((c) => cambios.columnas?.[c] || c);
  const alias = {};
  const respuestas = filas.map((f, i) => columnas.map((c, k) => {
    const cambiada = f !== g.filas[i] || c !== g.columnas[k];
    const aMano = cambiada ? [] : (g.respuestas?.[i]?.[k] || []);
    const pf = predicado(f);
    const pc = predicado(c);
    const vistos = new Map();
    // Respuestas a mano: si el futbolista está en la base y no cumple, se descarta
    aMano.forEach((n) => {
      const j = EN_BASE.get(norm(n));
      // Se descarta solo si falla una categoría de datos seguros (selección, club o entrenador con margen)
      if (j && pf && pc && ((SEGURAS.has(tipo(f)) && !pf(j)) || (SEGURAS.has(tipo(c)) && !pc(j)) || nuncaEntrenado(j, f) || nuncaEntrenado(j, c))) return;
      const nombre = j ? j.nombre : n;
      vistos.set(norm(nombre), nombre);
    });
    (calcularCasilla(f, c) || []).forEach((n) => vistos.set(norm(n), n));
    const lista = [...vistos.values()];
    lista.forEach((n) => { if (ALIAS[n]?.length) alias[n] = ALIAS[n]; });
    return lista;
  }));
  return { ...g, filas, columnas, respuestas, alias };
}

export const TODOS_LOS_GRIDS = [...GRIDS_VOL_1, ...GRIDS_VOL_2, ...GRIDS_VOL_3].map(completar);
export const GRIDS_JUGABLES = TODOS_LOS_GRIDS.filter((g) => g.respuestas.every((f) => f.every((c) => c.length > 0)));
