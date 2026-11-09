// server/data/seeds/futbolgrid/respuestas.js
// Calcula las respuestas válidas de cada casilla de «Fútbol en raya» cruzando la base de futbolistas (clubes con
// años, selección y títulos) y la de entrenadores. Se suman a las respuestas escritas a mano en los tableros.
import { CLUBES, EUROPA, ENTRENADORES } from './clubes.js';
import J1 from './jugadores1.js';
import J2 from './jugadores2.js';
import J3 from './jugadores3.js';
import J4 from './jugadores4.js';

const PAISES = new Set(Object.values(CLUBES).map(([, p]) => p));
const LIGA_CAT = { 'premier league': ['en'], laliga: ['es'], 'españa': ['es'], 'serie a': ['it'], italia: ['it'], 'ligue 1': ['fr'], mls: ['us'], 'arabia saudí': ['sa'], china: ['cn'] };

/** Interpreta las líneas de texto de la base. Lanza un error con la línea si algo no cuadra. */
function parsear(texto) {
  return texto.trim().split('\n').filter((l) => l.trim()).map((linea) => {
    const [nombre, alias = '', sel = '', clubes = '', marcas = ''] = linea.split('|');
    const ms = /^(.+?) (\d{4})-(\d{4})$/.exec(sel.trim());
    const etapas = clubes.trim() ? clubes.trim().split(/\s+(?=[A-Za-z0-9]+ \d{4}-\d{4})/).map((t) => {
      const m = /^([A-Za-z0-9]+) (\d{4})-(\d{4})$/.exec(t.trim());
      if (!m) throw new Error(`Etapa no válida en «${nombre}»: ${t}`);
      const [, c, d, h] = m;
      const pais = CLUBES[c] ? CLUBES[c][1] : c;
      if (!CLUBES[c] && c !== c.toLowerCase()) throw new Error(`Club desconocido en «${nombre}»: ${c}`);
      return { club: CLUBES[c] ? c : null, pais, desde: Number(d), hasta: Number(h) };
    }) : [];
    return {
      nombre: nombre.trim(),
      alias: alias.split(',').map((x) => x.trim()).filter(Boolean),
      seleccion: ms ? { pais: ms[1].trim(), desde: Number(ms[2]), hasta: Number(ms[3]) } : null,
      etapas,
      marcas: new Set(marcas.trim().split(/\s+/).filter(Boolean))
    };
  });
}

export const JUGADORES = [J1, J2, J3, J4].flatMap(parsear);
const POR_NOMBRE = new Map(JUGADORES.map((j) => [j.nombre.toLowerCase(), j]));
const solapan = (a1, a2, b1, b2) => Math.max(a1, b1) < Math.min(a2, b2);

// Nombres de clubes tal como aparecen en las categorías → código
const CLUB_POR_NOMBRE = new Map();
Object.entries(CLUBES).forEach(([c, [n]]) => CLUB_POR_NOMBRE.set(n.toLowerCase(), c));
CLUB_POR_NOMBRE.set('paris saint-germain', 'PSG');
CLUB_POR_NOMBRE.set('psg', 'PSG');
CLUB_POR_NOMBRE.set('roma', 'ROM');
CLUB_POR_NOMBRE.set('fenerbahce', 'FEN');

function entrenado(j, entrenador, margen = 0) {
  const etapas = ENTRENADORES[entrenador];
  if (!etapas) return false;
  return etapas.some(([donde, d, h]) => {
    if (donde.startsWith('SEL:')) return j.seleccion && j.seleccion.pais === donde.slice(4) && solapan(j.seleccion.desde - margen, j.seleccion.hasta + margen, d, h);
    return j.etapas.some((e) => e.club === donde && solapan(e.desde - margen, e.hasta + margen, d, h));
  });
}

/** ¿Seguro que NO lo entrenó? (ni con un año de margen, para cambios a mitad de temporada) */
export function nuncaEntrenado(j, cat) {
  const m = /^entrenado por (.+)$/i.exec(cat.trim());
  return Boolean(m && ENTRENADORES[m[1]] && !entrenado(j, m[1], 1));
}

function jugoCon(j, otro) {
  if (!otro || j === otro) return false;
  const club = j.etapas.some((e) => e.club && otro.etapas.some((o) => o.club === e.club && solapan(e.desde, e.hasta, o.desde, o.hasta)));
  const sel = j.seleccion && otro.seleccion && j.seleccion.pais === otro.seleccion.pais
    && solapan(j.seleccion.desde, j.seleccion.hasta, otro.seleccion.desde, otro.seleccion.hasta);
  return club || sel;
}

const MARCA = {
  'ganó el mundial': ['MUN'], 'ganó la champions league': ['UCL'], 'ganó la eurocopa': ['EURO'], 'ganó la copa américa': ['CA'],
  'ganó la copa libertadores': ['LIB'], 'ganó la copa de áfrica': ['CAN'], 'ganó la europa league': ['UEL'], 'ganó la serie a': ['SA'],
  'ganó el triplete': ['TRI'], 'balón de oro': ['BDO'], 'bota de oro': ['BOTA'], 'premio puskas': ['PUSK'],
  'más de 100 partidos con su selección': ['C100'], 'fichaje de más de 80m€': ['F80'], 'usó un dorsal mayor a 90': ['D90'],
  'ganó el mundial y la champions': ['MUN', 'UCL']
};

/** Tipo de categoría: solo las de selección y club se usan para descartar respuestas escritas a mano. */
export function tipo(cat) {
  const t = cat.trim().toLowerCase();
  if (MARCA[t]) return 'marca';
  if (t.startsWith('selección:')) return 'seleccion';
  if (t.startsWith('entrenado por')) return 'entrenador';
  if (t.startsWith('jugó con')) return 'companero';
  const m = /^jugó en (?:la |el )?(.+)$/.exec(t);
  const x = m ? m[1] : t;
  return CLUB_POR_NOMBRE.has(x) ? 'club' : 'liga';
}

/** Devuelve una función (jugador) => bool para el texto de una categoría, o null si no se sabe interpretar. */
export function predicado(cat) {
  const t = cat.trim().toLowerCase();
  if (MARCA[t]) return (j) => MARCA[t].every((m) => j.marcas.has(m));
  let m;
  if ((m = /^selección: (.+)$/.exec(t))) return (j) => j.seleccion?.pais.toLowerCase() === m[1];
  if ((m = /^entrenado por (.+)$/i.exec(cat.trim()))) { const e = m[1]; return ENTRENADORES[e] ? (j) => entrenado(j, e) : null; }
  if ((m = /^jugó con (.+)$/i.exec(cat.trim()))) {
    const alias = { 'leo messi': 'lionel messi', 'neymar jr': 'neymar jr', 'luka modric': 'luka modrić', 'zlatan ibrahimovic': 'zlatan ibrahimović', 'diego maradona': 'diego maradona', 'luis suárez': 'luis suárez' };
    const n = m[1].toLowerCase();
    const otro = POR_NOMBRE.get(alias[n] || n);
    return otro ? (j) => jugoCon(j, otro) : null;
  }
  if ((m = /^jugó en (?:la |el )?(.+)$/.exec(t))) {
    const x = m[1];
    if (LIGA_CAT[x]) return (j) => j.etapas.some((e) => LIGA_CAT[x].includes(e.pais));
    if (x === 'europa') return (j) => j.etapas.some((e) => EUROPA.has(e.pais));
    const c = CLUB_POR_NOMBRE.get(x);
    if (c) return (j) => j.etapas.some((e) => e.club === c);
    return null;
  }
  const c = CLUB_POR_NOMBRE.get(t);
  if (c) return (j) => j.etapas.some((e) => e.club === c);
  return null;
}

/** Lista de nombres que cumplen fila y columna según la base. */
export function calcularCasilla(fila, columna) {
  const pf = predicado(fila);
  const pc = predicado(columna);
  if (!pf || !pc) return null;
  return JUGADORES.filter((j) => pf(j) && pc(j)).map((j) => j.nombre);
}

/** Alias de cada futbolista de la base (para aceptar «messi», «cr7»…). */
export const ALIAS = Object.fromEntries(JUGADORES.map((j) => [j.nombre, j.alias]));
export { PAISES };
