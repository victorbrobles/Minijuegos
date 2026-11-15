// client/src/games/Garabato/engine.js
// «Garabato Encadenado»: el teléfono escacharrado con dibujos. Motor puro (salas online y modo un dispositivo).
// Cada jugador empieza una cadena con una frase. En cada paso, cada uno recibe la última entrada de otra cadena:
// si es una frase, la dibuja; si es un dibujo, lo describe sin ver nada más. Al final se destapan las cadenas
// entrada a entrada y se vota el mejor dibujo y la mejor frase.
// Puntos: cada voto al mejor dibujo +3 y a la mejor frase +2; quien describe un dibujo usando alguna palabra de la
// frase original de la cadena («¡lo pillaste!») suma +1.
import { FRASES } from './frases.js';

export const TIEMPOS = { normal: { frase: 45, dibujo: 90, texto: 45 }, relajado: { frase: 70, dibujo: 140, texto: 70 } };
export const OPCIONES_TIEMPO = [['normal', 'Normal'], ['relajado', 'Relajado'], ['sin', 'Sin reloj']];
export const COLORES = ['#0f172a', '#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#92400e', '#ffffff'];
export const GROSORES = [6, 14, 30];
const MAX_PUNTOS = 3000;
const MAX_TRAZOS = 400;

const barajar = (l) => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const nuevoId = () => Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);
const tipoPaso = (s) => (s === 0 ? 'frase' : s % 2 === 1 ? 'dibujo' : 'texto');

export function crearPartida(jugadores, items = [], reglas = {}, ahora = Date.now()) {
  const n = jugadores.length;
  const p = {
    fase: 'jugando', paso: 0, pasos: n, n, reglas: { tiempo: reglas.tiempo || 'normal', online: Boolean(reglas.online) },
    jugadores: barajar(jugadores).map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, fuera: false })),
    cadenas: [], dibujos: {}, entregas: {}, limite: null, mostrar: null, votos: {}, sugerencias: barajar(items.length ? items : FRASES), fin: null
  };
  p.cadenas = p.jugadores.map((j) => ({ autor: j.id, entradas: [] }));
  empezarPaso(p, ahora);
  return p;
}

const conReloj = (p) => p.reglas.online && p.reglas.tiempo !== 'sin';
function empezarPaso(p, ahora) {
  p.entregas = {};
  const seg = TIEMPOS[p.reglas.tiempo]?.[tipoPaso(p.paso)];
  p.limite = conReloj(p) && seg ? ahora + seg * 1000 : null;
  // Los que se fueron entregan solos
  p.jugadores.forEach((j) => { if (j.fuera) entregarAuto(p, j); });
  if (activos(p).every((j) => p.entregas[j.id])) cerrarPaso(p, ahora);
}

/** Índice de la cadena que le toca a `j` en el paso actual. */
const cadenaDe = (p, j) => (p.jugadores.indexOf(j) - p.paso + p.n * 2) % p.n;

function sugerencia(p, j) {
  const i = (p.jugadores.indexOf(j) + p.paso * 7) % p.sugerencias.length;
  return p.sugerencias[i];
}

function entregarAuto(p, j) {
  if (p.entregas[j.id]) return;
  const t = tipoPaso(p.paso);
  if (t === 'dibujo') {
    const did = nuevoId();
    p.dibujos[did] = { trazos: [] };
    p.entregas[j.id] = { tipo: 'dibujo', por: j.id, valor: did, auto: true };
  } else {
    p.entregas[j.id] = { tipo: 'texto', por: j.id, valor: t === 'frase' ? sugerencia(p, j) : '(se quedó en blanco)', auto: true };
  }
}

/** Limpia y recorta un dibujo: [{ c: color, g: grosor, p: [x, y, x, y…] }] con coordenadas 0-1000. */
export function limpiarTrazos(trazos) {
  let total = 0;
  const out = [];
  for (const t of Array.isArray(trazos) ? trazos.slice(0, MAX_TRAZOS) : []) {
    const c = Number.isInteger(t?.c) && t.c >= 0 && t.c < COLORES.length ? t.c : 0;
    const g = Number.isInteger(t?.g) && t.g >= 0 && t.g < GROSORES.length ? t.g : 0;
    const pts = (Array.isArray(t?.p) ? t.p : []).slice(0, 2 * (MAX_PUNTOS - total)).map((x) => Math.max(0, Math.min(1000, Math.round(Number(x) || 0))));
    if (pts.length % 2) pts.pop();
    if (pts.length < 2) continue;
    total += pts.length / 2;
    out.push({ c, g, p: pts });
    if (total >= MAX_PUNTOS) break;
  }
  return out;
}

export function entregar(p, id, valor, ahora = Date.now()) {
  if (p.fase !== 'jugando') return { ok: false, error: 'Ahora no toca.' };
  const j = jug(p, id);
  if (!j || j.fuera) return { ok: false, error: 'No estás en la partida.' };
  if (p.entregas[id]) return { ok: false, error: 'Ya has entregado: espera a los demás.' };
  const t = tipoPaso(p.paso);
  if (t === 'dibujo') {
    const trazos = limpiarTrazos(valor);
    const did = nuevoId();
    p.dibujos[did] = { trazos };
    p.entregas[id] = { tipo: 'dibujo', por: id, valor: did };
  } else {
    const texto = String(valor ?? '').replace(/\s+/g, ' ').trim().slice(0, 90);
    if (!texto) return { ok: false, error: t === 'frase' ? 'Escribe una frase (o usa la sugerencia).' : 'Describe el dibujo.' };
    p.entregas[id] = { tipo: 'texto', por: id, valor: texto };
  }
  if (activos(p).every((x) => p.entregas[x.id])) cerrarPaso(p, ahora);
  return { ok: true };
}

function cerrarPaso(p, ahora) {
  p.jugadores.forEach((j) => { if (!p.entregas[j.id]) entregarAuto(p, j); });
  p.jugadores.forEach((j) => { p.cadenas[cadenaDe(p, j)].entradas.push(p.entregas[j.id]); });
  p.paso += 1;
  if (p.paso >= p.pasos) {
    p.fase = 'revelar';
    p.limite = null;
    p.mostrar = { cadena: 0, entrada: 0 };
    return;
  }
  empezarPaso(p, ahora);
}

/** Avanza la revelación: entrada a entrada y cadena a cadena; después, a votar. */
export function siguiente(p) {
  if (p.fase !== 'revelar') return { ok: false, error: 'Ahora no.' };
  const m = p.mostrar;
  if (m.entrada < p.pasos - 1) m.entrada += 1;
  else if (m.cadena < p.n - 1) { m.cadena += 1; m.entrada = 0; } else { p.fase = 'votar'; p.mostrar = null; }
  return { ok: true };
}

const claveTexto = (c, e) => `${c}-${e}`;
export function votar(p, id, dibujo, texto) {
  if (p.fase !== 'votar') return { ok: false, error: 'Ahora no se vota.' };
  const j = jug(p, id);
  if (!j || j.fuera) return { ok: false, error: 'No estás en la partida.' };
  const entradaDibujo = p.cadenas.flatMap((c) => c.entradas).find((e) => e.tipo === 'dibujo' && e.valor === dibujo);
  const [ci, ei] = String(texto ?? '').split('-').map(Number);
  const entradaTexto = p.cadenas[ci]?.entradas[ei];
  if (!entradaDibujo || entradaDibujo.por === id || entradaDibujo.auto) return { ok: false, error: 'Elige un dibujo de otro jugador.' };
  if (!entradaTexto || entradaTexto.tipo !== 'texto' || entradaTexto.por === id || entradaTexto.auto) return { ok: false, error: 'Elige una frase de otro jugador.' };
  p.votos[id] = { dibujo, texto: claveTexto(ci, ei) };
  if (activos(p).every((x) => p.votos[x.id])) terminar(p);
  return { ok: true };
}

const raiz = (w) => w.slice(0, 5);
const palabras = (t) => new Set(String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(/[^a-zñ]+/).filter((w) => w.length >= 4).map(raiz));

export function terminar(p) {
  const pts = Object.fromEntries(p.jugadores.map((j) => [j.id, { dibujo: 0, texto: 0, pillados: 0 }]));
  Object.values(p.votos).forEach((v) => {
    const d = p.cadenas.flatMap((c) => c.entradas).find((e) => e.valor === v.dibujo);
    if (d && pts[d.por]) pts[d.por].dibujo += 1;
    const [ci, ei] = v.texto.split('-').map(Number);
    const t = p.cadenas[ci]?.entradas[ei];
    if (t && pts[t.por]) pts[t.por].texto += 1;
  });
  // «¡Lo pillaste!»: la descripción comparte alguna palabra con la frase original
  p.cadenas.forEach((c) => {
    const original = palabras(c.entradas[0]?.valor || '');
    c.entradas.forEach((e, i) => {
      if (i > 0 && e.tipo === 'texto' && !e.auto && [...palabras(e.valor)].some((w) => original.has(w))) { pts[e.por].pillados += 1; e.pillado = true; }
    });
  });
  p.jugadores.forEach((j) => { const x = pts[j.id]; j.puntos = x.dibujo * 3 + x.texto * 2 + x.pillados; });
  const tabla = p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, ...pts[j.id], fuera: j.fuera }))
    .sort((a, b) => Number(a.fuera) - Number(b.fuera) || b.puntos - a.puntos);
  let puesto = 0; let previo = null;
  tabla.forEach((t, i) => { if (t.puntos !== previo) { puesto = i + 1; previo = t.puntos; } t.puesto = puesto; });
  const max = Math.max(0, ...tabla.filter((t) => !t.fuera).map((t) => t.puntos));
  p.fase = 'fin';
  p.fin = { tabla, max, ganadores: max > 0 ? tabla.filter((t) => !t.fuera && t.puntos === max).map((t) => t.id) : [] };
  return { ok: true };
}

/** El anfitrión no espera: entrega por los que faltan, avanza la revelación o cierra la votación. */
export function forzar(p, ahora = Date.now()) {
  if (p.fase === 'jugando') { cerrarPaso(p, ahora); return { ok: true }; }
  if (p.fase === 'revelar') return siguiente(p);
  if (p.fase === 'votar') return terminar(p);
  return { ok: true };
}

export function tick(p, ahora = Date.now()) {
  if (p.fase === 'jugando' && p.limite && ahora >= p.limite) cerrarPaso(p, ahora);
}

export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id);
  if (!j || p.fase === 'fin') return;
  j.fuera = true;
  if (activos(p).length < 2) { terminar(p); return; }
  if (p.fase === 'jugando') { entregarAuto(p, j); if (activos(p).every((x) => p.entregas[x.id])) cerrarPaso(p, ahora); }
  if (p.fase === 'votar' && activos(p).every((x) => p.votos[x.id])) terminar(p);
}

export function accion(p, id, d, ahora = Date.now()) {
  const actor = id ?? turnoLocal(p);
  switch (d.tipo) {
    case 'entregar': return entregar(p, actor, d.valor, ahora);
    case 'siguiente': return siguiente(p);
    case 'votar': return votar(p, actor, d.dibujo, d.texto);
    default: return null;
  }
}

/** En un solo móvil: cada paso (y la votación) se hace en privado, uno detrás de otro. */
export function turnoLocal(p) {
  if (p.fase === 'jugando') return activos(p).find((j) => !p.entregas[j.id])?.id ?? null;
  if (p.fase === 'votar') return activos(p).find((j) => !p.votos[j.id])?.id ?? null;
  return null;
}

/** El dibujo va dentro de la vista en un solo móvil; online se pide aparte (para no mandarlo en cada consulta). */
function verEntrada(p, e) {
  if (!e) return null;
  if (e.tipo === 'dibujo') return { tipo: 'dibujo', por: e.por, auto: Boolean(e.auto), dibujo: p.reglas.online ? { id: e.valor } : { id: e.valor, trazos: p.dibujos[e.valor]?.trazos || [] } };
  return { tipo: 'texto', por: e.por, auto: Boolean(e.auto), valor: e.valor, pillado: Boolean(e.pillado) };
}

export function dibujoPublico(p, did) {
  // Solo dibujos ya entregados en pasos anteriores (los del paso en curso no se pueden pedir)
  const ok = p.cadenas.some((c) => c.entradas.some((e) => e.tipo === 'dibujo' && e.valor === did));
  return ok ? p.dibujos[did] : null;
}

export function vistaDe(p, id, ahora = Date.now()) {
  const yo = jug(p, id);
  const base = {
    fase: p.fase, paso: p.paso, pasos: p.pasos, ronda: Math.min(p.paso + 1, p.pasos), rondas: p.pasos, ahora, limite: p.limite,
    tiempo: p.reglas.tiempo, online: p.reglas.online,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, fuera: j.fuera, hecho: Boolean(p.entregas[j.id]), votado: Boolean(p.votos[j.id]) })),
    yo: yo ? { id: yo.id } : null, fin: p.fin
  };
  if (p.fase === 'jugando' && yo && !yo.fuera) {
    const c = p.cadenas[cadenaDe(p, yo)];
    base.tarea = { tipo: tipoPaso(p.paso), previo: verEntrada(p, c.entradas[c.entradas.length - 1]), hecho: Boolean(p.entregas[yo.id]), sugerencia: p.paso === 0 ? sugerencia(p, yo) : null };
  }
  if (p.fase !== 'jugando') {
    const hasta = p.fase === 'revelar' ? p.mostrar : null;
    base.mostrar = hasta;
    base.cadenas = p.cadenas.map((c, ci) => {
      if (hasta && ci > hasta.cadena) return null;
      const n = hasta && ci === hasta.cadena ? hasta.entrada + 1 : c.entradas.length;
      return { autor: c.autor, entradas: c.entradas.slice(0, n).map((e) => verEntrada(p, e)) };
    }).filter(Boolean);
  }
  if (p.fase === 'votar' || p.fase === 'fin') base.miVoto = yo ? p.votos[yo.id] || null : null;
  if (p.fase === 'fin') base.votos = p.votos;
  return base;
}
