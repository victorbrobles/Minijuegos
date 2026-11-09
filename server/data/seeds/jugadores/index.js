// server/data/seeds/jugadores/index.js
// Parejas de «¿Con quién he jugado?» con TODAS las respuestas que conocemos: las escritas a mano (jugadores.js) más
// los futbolistas de la base de «Fútbol en raya» que coincidieron en algún club (no selección) con los dos, aunque
// fuera en clubes y épocas distintas. Las escritas a mano que la base desmiente se descartan.
import PAREJAS from './jugadores.js';
import { JUGADORES, companerosDeClub } from '../futbolgrid/respuestas.js';

const norm = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const BASE = new Map();
JUGADORES.forEach((j) => BASE.set(norm(j.nombre), j));
JUGADORES.forEach((j) => j.alias.forEach((a) => { if (a.includes(' ') && !BASE.has(norm(a))) BASE.set(norm(a), j); }));
// Nombres de las parejas escritos de otra forma
const EQUIVALE = { aubameyang: 'pierre-emerick aubameyang', icardi: 'mauro icardi', 'sadio mane': 'sadio mané', 'mario mandzukic': 'mario mandžukić', 'gonzalo higuain': 'gonzalo higuaín', 'ousmane dembele': 'ousmane dembélé', 'edin dzeko': 'edin džeko', pedro: 'pedro rodríguez' };
const buscar = (n) => BASE.get(norm(EQUIVALE[norm(n)] || n)) || null;
const solapan = (a1, a2, b1, b2) => Math.max(a1, b1) < Math.min(a2, b2);

/**
 * Seguro que nunca fueron compañeros de club: ni en un club conocido (con un año de margen, por los fichajes de
 * invierno) ni, posiblemente, en uno pequeño del mismo país.
 */
function seguroQueNo(a, b) {
  if (!a || !b || companerosDeClub(a, b, 1)) return false;
  const pequenos = (j) => j.etapas.filter((e) => !e.club);
  return !pequenos(a).some((e) => pequenos(b).some((o) => o.pais === e.pais && solapan(e.desde, e.hasta, o.desde, o.hasta)));
}

export const DUPLAS = PAREJAS.map((d) => {
  const a = buscar(d.jugador1);
  const b = buscar(d.jugador2);
  const nombres = new Map();
  d.comunes.forEach((n) => {
    if (/\(como entrenador\)/i.test(n)) return;
    const j = buscar(n);
    if (j && (j === a || j === b)) return;
    if (norm(n) === norm(d.jugador1) || norm(n) === norm(d.jugador2)) return;
    if (j && (seguroQueNo(j, a) || seguroQueNo(j, b))) return;
    const nombre = j ? j.nombre : n;
    nombres.set(norm(nombre), nombre);
  });
  if (a && b) {
    JUGADORES.filter((j) => j !== a && j !== b && companerosDeClub(j, a) && companerosDeClub(j, b))
      .forEach((j) => nombres.set(norm(j.nombre), j.nombre));
  }
  const comunes = [...nombres.values()];
  const alias = {};
  comunes.forEach((n) => { const j = buscar(n); if (j?.alias.length) alias[n] = j.alias; });
  return { ...d, jugador1: a ? a.nombre : d.jugador1, jugador2: b ? b.nombre : d.jugador2, comunes, alias };
}).filter((d) => d.comunes.length > 0);
