// server/lib/rankingRespuestas.js
// Cuándo vale una respuesta en «Ranking oculto». Se acepta:
//   1. el nombre del elemento, uno de sus alias o una de sus palabras clave (data/seeds/rankings/claves.js),
//      sin importar mayúsculas, tildes, signos, espacios ni el artículo inicial («El padrino» = «padrino»);
//   2. una errata pequeña de cualquiera de ellos (una letra cambiada, de más o de menos; dos en nombres largos),
//      siempre que empiece igual y que lo escrito no sea el nombre de otra cosa conocida.
// No se aceptan trozos sueltos que no estén definidos como clave: «Los Angeles» no vale por «Los Angeles Dodgers»,
// ni «Austria» por «Australia», ni «China» por «Chile».
import seed from '../data/seeds/rankings/rankings.seed.js';
import CLAVES from '../data/seeds/rankings/claves.js';

const ARTICULOS = /^(el|la|los|las|lo|un|una|the)\s+/;

export function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' y ')
    .replace(/\+/g, ' plus ')
    .replace(/#/g, ' sharp ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(ARTICULOS, '');
}
const compacto = (t) => t.replace(/\s+/g, '').replace(/(.)\1+/g, '$1');

function distancia(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

/** Errata pequeña: misma inicial, como mucho una letra más o menos, y 1 cambio (2 si el nombre es largo). */
function esErrata(u, t) {
  if (t.length < 5 || u[0] !== t[0] || Math.abs(u.length - t.length) > 1) return false;
  return distancia(u, t) <= (t.length >= 9 ? 2 : 1);
}

// Todos los nombres conocidos (de cualquier ranking): si escribes uno de ellos, no se toma como errata de otro
const CONOCIDOS = new Set();
const formasDe = (elem) => [elem.valor, ...(elem.alias ?? []), ...(CLAVES[elem.valor] ?? [])].map(normalizar).filter(Boolean);
Object.values(seed).forEach((lista) => lista.forEach((r) => r.elementos.forEach((e) => formasDe(e).forEach((f) => CONOCIDOS.add(compacto(f))))));

/** El elemento de la lista al que corresponde la respuesta (o null). */
export function buscarElemento(elementos, respuesta) {
  const u = normalizar(respuesta);
  if (!u) return null;
  const uc = compacto(u);
  // 1. Exacta (nombre, alias o clave)
  for (const e of elementos) if (formasDe(e).some((f) => f === u || compacto(f) === uc)) return e;
  // 2. Errata, si lo escrito no es otro nombre conocido
  if (CONOCIDOS.has(uc)) return null;
  for (const e of elementos) if (formasDe(e).some((f) => esErrata(uc, compacto(f)) || esErrata(u, f))) return e;
  return null;
}
