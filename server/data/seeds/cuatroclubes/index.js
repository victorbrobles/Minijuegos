// server/data/seeds/cuatroclubes/index.js
// Combinaciones de «El club de los cuatro» preparadas para puntuar solas: para cada combinación, qué futbolistas de la
// base de «Fútbol en raya» pasaron por cada uno de los cuatro clubes. Si un club no está en la base (Parma, Getafe…)
// y el futbolista pudo jugar allí, o no está en la base, la puntuación la decide el anfitrión.
import COMBINACIONES from './cuatroclubes.js';
import { JUGADORES } from '../futbolgrid/respuestas.js';
import { CLUBES } from '../futbolgrid/clubes.js';

const norm = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const CODIGO = new Map(Object.entries(CLUBES).map(([c, [n]]) => [norm(n), c]));
const ALIAS_CLUB = {
  'as monaco': 'ASM', 'sevilla fc': 'SEV', 'olympique de marsella': 'OM', 'valencia cf': 'VAL', 'paris saint germain': 'PSG',
  'psv eindhoven': 'PSV', 'malaga cf': 'MLG', 'villarreal cf': 'VIL', 'olympique de lyon': 'OL', 'tottenham hotspur': 'TOT',
  'rcd espanyol': 'ESY', 'west ham united': 'WHU'
};
const PAIS_SIN_CODIGO = { parma: 'it', sampdoria: 'it', 'getafe cf': 'es', 'rcd mallorca': 'es' };
const codigoDe = (nombre) => CODIGO.get(norm(nombre)) || ALIAS_CLUB[norm(nombre)] || null;

/** Lista de todos los nombres (y alias de varias palabras) de la base, para saber si un futbolista es «conocido». */
export const NOMBRES_BASE = JUGADORES.map((j) => ({ nombre: j.nombre, alias: j.alias }));

// Los SVG de Wikipedia se piden como miniatura PNG (algunos no traen viewBox y se salen de su caja)
const miniatura = (url) => {
  const m = /^https:\/\/upload\.wikimedia\.org\/wikipedia\/(commons|en)\/([0-9a-f])\/([0-9a-f]{2})\/([^/]+\.svg)$/i.exec(url || '');
  return m ? `https://upload.wikimedia.org/wikipedia/${m[1]}/thumb/${m[2]}/${m[3]}/${m[4]}/120px-${m[4]}.png` : url;
};

export const RETOS = COMBINACIONES.map((c0) => {
  const c = { ...c0, clubes: c0.clubes.map((x) => ({ ...x, escudo: miniatura(x.escudo) })) };
  const codigos = c.clubes.map((x) => codigoDe(x.nombre));
  const paises = c.clubes.map((x) => PAIS_SIN_CODIGO[norm(x.nombre)] || null);
  const conocidos = {};
  const dudosos = [];
  JUGADORES.forEach((j) => {
    const fila = codigos.map((cod) => Boolean(cod && j.etapas.some((e) => e.club === cod)));
    // ¿Pudo jugar en un club que no está en la base? (tiene etapas sin club concreto en ese país)
    const duda = codigos.some((cod, k) => !cod && paises[k] && j.etapas.some((e) => !e.club && e.pais === paises[k]));
    if (duda) dudosos.push(j.nombre);
    if (fila.some(Boolean)) conocidos[j.nombre] = fila;
  });
  // Las listas escritas a mano (pleno y 3 de 4) también cuentan
  const pleno = (c.jugadores4 || []).map((n) => n.trim());
  const tres = (c.jugadores3 || []).map((t) => {
    const m = /^(.+?)\s*\((.+)\)\s*$/.exec(t);
    return m ? { nombre: m[1].trim(), clubes: m[2].split(',').map((x) => norm(x)) } : { nombre: t.trim(), clubes: [] };
  });
  pleno.forEach((n) => { conocidos[n] = [true, true, true, true]; });
  tres.forEach(({ nombre, clubes }) => {
    if (!clubes.length) return;
    conocidos[nombre] = c.clubes.map((x) => clubes.includes(norm(x.nombre)));
  });
  const valor = (n) => conocidos[n].filter(Boolean).length;
  const mejores = Object.keys(conocidos).filter((n) => valor(n) >= 3).sort((a, b) => valor(b) - valor(a));
  return { id: c.id, clubes: c.clubes, conocidos, dudosos, mejores: mejores.map((n) => ({ nombre: n, clubes: conocidos[n] })) };
});
