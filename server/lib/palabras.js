// server/lib/palabras.js
// Diccionario de español (3 a 8 letras, sin tildes) y partidas de «Palabra oculta» y «Letras en cadena».
import fs from 'fs';
import zlib from 'zlib';
import path from 'path';
import { fileURLToPath } from 'url';
import { OBJETIVOS, RAICES } from '../data/palabras/banco.js';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/palabras');
let dic = null;
let hasta7 = null;
function diccionario() {
  if (!dic) {
    const lista = zlib.gunzipSync(fs.readFileSync(path.join(DIR, 'diccionario.txt.gz'))).toString('utf8').split('\n');
    dic = new Set(lista);
    hasta7 = lista.filter((p) => p.length <= 7);
  }
  return dic;
}

/** Quita tildes y diéresis (la ñ se queda) y deja solo letras. */
export const normalizar = (t) => String(t ?? '').toLowerCase().replace(/ñ/g, '\u0001').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\u0001/g, 'ñ').replace(/[^a-zñ]/g, '');
export const existe = (p) => diccionario().has(normalizar(p));

// rnd: generador de números en [0, 1). Por defecto Math.random; los retos diarios usan uno con semilla (la fecha).
const azar = (l, rnd = Math.random) => l[Math.floor(rnd() * l.length)];
const barajar = (l, rnd = Math.random) => { const b = [...l]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

// ---------------------------------------------------------------- Palabra oculta
export const ESCALONES = [3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8]; // después, palabras de 8 sin fin
let objetivos = null;
export function objetivosValidos() {
  if (!objetivos) {
    const d = diccionario();
    objetivos = Object.fromEntries(Object.entries(OBJETIVOS).map(([n, l]) => [n, [...new Set(l)].filter((p) => d.has(p))]));
  }
  return objetivos;
}
export function partidaPalabra(rnd = Math.random) {
  const o = objetivosValidos();
  const usadas = new Set();
  const sacar = (n) => { const libres = o[n].filter((p) => !usadas.has(p)); const p = azar(libres.length ? libres : o[n], rnd); usadas.add(p); return p; };
  const palabras = ESCALONES.map(sacar);
  for (let i = 0; i < 40; i++) palabras.push(sacar(8));
  return { palabras };
}

// ---------------------------------------------------------------- Letras en cadena
const cacheRaiz = new Map();
/** Palabras de 3 a 7 letras que se pueden formar con las letras de `raiz` (cada letra una vez). */
export function escondidas(raiz) {
  if (cacheRaiz.has(raiz)) return cacheRaiz.get(raiz);
  diccionario();
  const c = {}; for (const ch of raiz) c[ch] = (c[ch] || 0) + 1;
  const res = hasta7.filter((p) => { const d = { ...c }; for (const ch of p) { if (!d[ch]) return false; d[ch]--; } return true; });
  cacheRaiz.set(raiz, res);
  return res;
}
let raices = null;
export function raicesValidas() {
  if (!raices) { const d = diccionario(); raices = [...new Set(RAICES)].filter((r) => d.has(r) && escondidas(r).length >= 80); }
  return raices;
}
export function partidaLetras(rnd = Math.random) {
  const raiz = azar(raicesValidas(), rnd);
  let letras = barajar([...raiz], rnd); let n = 0;
  while (letras.join('') === raiz && n++ < 10) letras = barajar([...raiz], rnd);
  const validas = escondidas(raiz);
  return { letras, validas, secretas: [raiz, ...validas.filter((p) => p.length === 7 && p !== raiz)], segundos: 120 };
}

// Precarga en segundo plano para que la primera partida no espere a leer el diccionario.
setTimeout(() => { try { raicesValidas(); objetivosValidos(); } catch (e) { console.error('Diccionario:', e.message); } }, 1500).unref?.();
