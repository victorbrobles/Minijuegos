// client/src/games/Emojis/engine.js
// «Biografía en emojis»: motor puro (salas online en server/routes/emojis.js).
// La vida de un famoso contada en 5 emojis que van apareciendo uno a uno, de la pista más vaga a la más clara.
// Todos escriben a la vez quién creen que es (vale el nombre, el apellido o el apodo, con faltas pequeñas):
// cuanto antes se acierta, más puntos (5 con el primer emoji, 4 con el segundo…). Hay 3 intentos por ronda.
// Modo «autor»: en cada ronda un jugador elige un famoso y escribe él mismo los emojis; gana 2 puntos por cada
// jugador que acierte (le interesa que sean claros, pero cada emoji de más da menos puntos a los demás).
import { BANCO, CATEGORIAS } from './banco.js';

export const OPCIONES_RONDAS = [6, 10, 15];
export const MODOS = ['banco', 'autor'];
export const MS_EMOJI = 5000;
export const SEG_EXTRA = 10;
export const INTENTOS = 3;
export const SEG_ESCRIBIR = 45;
export const SEG_RESULTADO = 6;
export const MAX_EMOJIS = 6;

const barajar = (l) => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);

/** Solo emojis (incluye banderas y emojis compuestos), como mucho MAX_EMOJIS. */
export function limpiarEmojis(texto) {
  const seg = typeof Intl !== 'undefined' && Intl.Segmenter ? [...new Intl.Segmenter('es', { granularity: 'grapheme' }).segment(String(texto || ''))].map((s) => s.segment) : [...String(texto || '')];
  return seg.filter((g) => /\p{Extended_Pictographic}|\p{Regional_Indicator}|[#-9]️?⃣/u.test(g)).slice(0, MAX_EMOJIS);
}

const normalizar = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim();
function distancia(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
/** ¿Lo escrito es este famoso? Vale el nombre completo, el apellido (o los dos últimos nombres) y los alias. */
export function esFamoso(texto, item) {
  const t = normalizar(texto);
  if (t.length < 3) return false;
  const palabras = normalizar(item.n).split(' ');
  const formas = new Set([palabras.join(' '), ...(item.alias || []).map(normalizar)]);
  if (palabras.length > 1) {
    const ultima = palabras[palabras.length - 1];
    if (ultima.length >= 4) formas.add(ultima);
    if (palabras.length > 2) formas.add(palabras.slice(-2).join(' '));
  }
  return [...formas].some((f) => f === t || (f.length >= 5 && distancia(f, t) <= (f.length >= 9 ? 2 : 1)));
}

export function crearPartida(jugadores, items = [], reglas = {}, ahora = Date.now()) {
  const rondas = OPCIONES_RONDAS.includes(reglas.rondas) ? reglas.rondas : 10;
  const modo = MODOS.includes(reglas.modo) ? reglas.modo : 'banco';
  const p = {
    fase: 'adivinar', modo, ronda: 0, rondas, mazo: barajar(BANCO), item: null, emojis: [], intentos: {}, inicio: 0, limite: 0,
    autor: null, candidatos: [], respuestas: {}, resultado: null, fin: null,
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, fuera: false }))
  };
  nuevaRonda(p, ahora);
  return p;
}
const sacar = (p) => { if (!p.mazo.length) p.mazo = barajar(BANCO); return p.mazo.pop(); };

function nuevaRonda(p, ahora) {
  p.ronda += 1; p.respuestas = {}; p.resultado = null;
  if (p.modo === 'autor') {
    const ids = activos(p).map((j) => j.id);
    p.autor = ids[(p.ronda - 1) % ids.length];
    p.candidatos = [sacar(p), sacar(p), sacar(p)];
    p.item = null; p.emojis = [];
    p.fase = 'escribir'; p.limite = ahora + SEG_ESCRIBIR * 1000;
  } else {
    p.item = sacar(p); p.emojis = p.item.e;
    empezarAdivinar(p, ahora);
  }
}
function empezarAdivinar(p, ahora) {
  p.intentos = {};
  p.fase = 'adivinar'; p.inicio = ahora;
  p.limite = ahora + p.emojis.length * MS_EMOJI + SEG_EXTRA * 1000;
}
export const visibles = (p, ahora) => Math.min(p.emojis.length, 1 + Math.floor(Math.max(0, ahora - p.inicio) / MS_EMOJI));

export function escribir(p, id, d, ahora = Date.now()) {
  if (p.fase !== 'escribir' || id !== p.autor) return { ok: false, error: 'Ahora no.' };
  const cand = p.candidatos[Number(d.elegido)];
  const emojis = limpiarEmojis(d.emojis);
  if (!cand) return { ok: false, error: 'Elige un famoso.' };
  if (emojis.length < 2) return { ok: false, error: 'Escribe al menos 2 emojis (solo emojis).' };
  p.item = cand; p.emojis = emojis;
  empezarAdivinar(p, ahora);
  return { ok: true };
}

export function responder(p, id, d, ahora = Date.now()) {
  if (p.fase !== 'adivinar') return { ok: false, error: 'Ahora no.' };
  const j = jug(p, id);
  if (!j || j.fuera || id === p.autor) return { ok: false };
  if (p.respuestas[id]) return { ok: false, error: 'Ya has terminado esta ronda.' };
  const texto = String(d.texto ?? '').trim().slice(0, 60);
  if (texto.length < 3) return { ok: false, error: 'Escribe un nombre.' };
  const vistos = visibles(p, ahora);
  const bien = esFamoso(texto, p.item);
  const usados = (p.intentos[id] || []);
  if (!bien) {
    usados.push(texto); p.intentos[id] = usados;
    if (usados.length < INTENTOS) return { ok: true, bien: false, quedan: INTENTOS - usados.length };
  }
  const pts = bien ? Math.max(1, 6 - vistos) : 0;
  p.respuestas[id] = { nombre: texto, bien, vistos, pts, t: ahora - p.inicio, fallos: usados.length };
  if (bien) j.puntos += pts;
  const faltan = activos(p).filter((x) => x.id !== p.autor && !p.respuestas[x.id]);
  if (!faltan.length) cerrar(p, ahora);
  return { ok: true, bien };
}

function cerrar(p, ahora) {
  let ptsAutor = 0;
  if (p.autor != null) {
    const aciertos = Object.values(p.respuestas).filter((r) => r.bien).length;
    ptsAutor = p.autorFallo ? 0 : Math.min(8, aciertos * 2);
    const a = jug(p, p.autor); if (a) a.puntos += ptsAutor;
  }
  p.resultado = { nombre: p.item.n, categoria: p.item.c, emojis: p.emojis, respuestas: p.respuestas, autor: p.autor, ptsAutor };
  p.fase = 'resultado'; p.limite = ahora + SEG_RESULTADO * 1000;
  p.autorFallo = false;
}

export function terminar(p) {
  const tabla = p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, fuera: j.fuera })).sort((a, b) => Number(a.fuera) - Number(b.fuera) || b.puntos - a.puntos);
  let puesto = 0; let previo = null;
  tabla.forEach((t, i) => { if (t.puntos !== previo) { puesto = i + 1; previo = t.puntos; } t.puesto = puesto; });
  const max = Math.max(0, ...tabla.filter((t) => !t.fuera).map((t) => t.puntos));
  p.fase = 'fin';
  p.fin = { tabla, max, ganadores: tabla.filter((t) => !t.fuera && t.puntos === max).map((t) => t.id) };
  return { ok: true };
}

export function tick(p, ahora = Date.now()) {
  if (p.fase === 'escribir' && ahora > p.limite) {
    // El autor no escribió a tiempo: se usan los emojis del banco y él no puntúa
    p.item = p.candidatos[0]; p.emojis = p.item.e; p.autorFallo = true;
    empezarAdivinar(p, ahora);
  } else if (p.fase === 'adivinar' && ahora > p.limite) cerrar(p, ahora);
  else if (p.fase === 'resultado' && ahora > p.limite) {
    if (p.ronda >= p.rondas || activos(p).length < 2) terminar(p);
    else nuevaRonda(p, ahora);
  }
}
export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id); if (!j || p.fase === 'fin') return;
  j.fuera = true;
  if (activos(p).length < 2) { terminar(p); return; }
  if (p.fase === 'escribir' && p.autor === id) { p.limite = 0; tick(p, ahora); }
  if (p.fase === 'adivinar' && !activos(p).some((x) => x.id !== p.autor && !p.respuestas[x.id])) cerrar(p, ahora);
}
export function accion(p, id, d, ahora = Date.now()) {
  if (d.tipo === 'responder') return responder(p, id, d, ahora);
  if (d.tipo === 'escribir') return escribir(p, id, d, ahora);
  return null;
}
export function forzar(p, ahora = Date.now()) { p.limite = 0; tick(p, ahora); return { ok: true }; }
export const turnoLocal = () => null;

export function vistaDe(p, id, ahora = Date.now()) {
  const yo = jug(p, id);
  const vistos = p.fase === 'adivinar' ? visibles(p, ahora) : p.fase === 'resultado' ? p.emojis.length : 0;
  return {
    fase: p.fase, modo: p.modo, ronda: p.ronda, rondas: p.rondas, inicio: p.inicio, limite: p.limite, ahora, msEmoji: MS_EMOJI,
    categoria: p.item ? CATEGORIAS[p.item.c] : null, emojis: p.emojis.slice(0, vistos), total: p.emojis.length, misFallos: (p.intentos || {})[id] || [], intentos: INTENTOS,
    autor: p.autor, candidatos: p.fase === 'escribir' && id === p.autor ? p.candidatos.map((c) => ({ n: c.n, cat: CATEGORIAS[c.c].nombre })) : [],
    miRespuesta: p.respuestas[id] || null, respondidos: Object.keys(p.respuestas).map(Number), resultado: p.resultado,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, fuera: j.fuera })),
    yo: yo ? { id: yo.id } : null, fin: p.fin
  };
}
