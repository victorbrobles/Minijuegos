// client/src/games/Draft/engine.js
// «El Draft de Estrellas»: motor puro (salas online en server/routes/draft.js y modo un móvil).
// En cada ronda sale una categoría y una lista de famosos. Se sabe que el criterio para puntuar será UNO de tres
// posibles (por ejemplo: los más mayores, los más altos o el nombre más largo), pero no cuál. Por turnos (en
// serpiente) cada jugador ficha 3 famosos. Al final se desvela el criterio y se suman los datos de cada equipo:
// cada jugador gana un punto por cada rival al que supera.
import { CATEGORIAS, FAMOSOS } from './famosos.js';

export const OPCIONES_RONDAS = [3, 5, 7];
export const POR_JUGADOR = 3;
export const SEG_PICK = 25;
export const SEG_REVELAR = 12;
const ANIO = 2026;

const letras = (n) => (n.match(/\p{L}/gu) || []).length;
export const CRITERIOS = {
  mayor: { nombre: 'Los más mayores', emoji: '👴', unidad: 'años sumados', valor: (f) => ANIO - f.a, mejor: 1, dato: (f) => `${f.a < 0 ? `${-f.a} a. C.` : f.a}` },
  joven: { nombre: 'Los más jóvenes', emoji: '👶', unidad: 'años sumados', valor: (f) => ANIO - f.a, mejor: -1, dato: (f) => `${f.a < 0 ? `${-f.a} a. C.` : f.a}` },
  alto: { nombre: 'Los más altos', emoji: '📏', unidad: 'cm sumados', valor: (f) => f.h, mejor: 1, dato: (f) => `${f.h} cm`, altura: true },
  bajo: { nombre: 'Los más bajitos', emoji: '🐭', unidad: 'cm sumados', valor: (f) => f.h, mejor: -1, dato: (f) => `${f.h} cm`, altura: true },
  largo: { nombre: 'Nombre más largo', emoji: '🔤', unidad: 'letras', valor: (f) => letras(f.n), mejor: 1, dato: (f) => `${letras(f.n)} letras` },
  corto: { nombre: 'Nombre más corto', emoji: '✂️', unidad: 'letras', valor: (f) => letras(f.n), mejor: -1, dato: (f) => `${letras(f.n)} letras` }
};

const barajar = (l) => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);

export function crearPartida(jugadores, items = [], reglas = {}, ahora = Date.now()) {
  const rondas = OPCIONES_RONDAS.includes(reglas.rondas) ? reglas.rondas : 5;
  const p = {
    fase: 'draft', ronda: 0, rondas, categorias: [], pool: [], candidatos: [], criterio: null, orden: [], pick: 0, limite: 0,
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, equipo: [], fuera: false })),
    resultado: null, historial: [], fin: null
  };
  nuevaRonda(p, ahora);
  return p;
}

function nuevaRonda(p, ahora) {
  p.ronda += 1;
  const usadas = p.categorias.slice(-3);
  const cats = barajar(Object.keys(CATEGORIAS).filter((c) => !usadas.includes(c)));
  const cat = cats[0];
  p.categorias.push(cat);
  const ids = activos(p).map((j) => j.id);
  const tam = Math.min(FAMOSOS.filter((f) => f.c === cat).length, ids.length * POR_JUGADOR + 4);
  p.pool = barajar(FAMOSOS.filter((f) => f.c === cat)).slice(0, tam).map((f) => ({ ...f, de: null }));
  const conAltura = p.pool.every((f) => f.h);
  p.candidatos = barajar(Object.keys(CRITERIOS).filter((k) => conAltura || !CRITERIOS[k].altura)).slice(0, 3);
  p.criterio = null;
  // Orden en serpiente; quien empieza rota cada ronda
  const k = (p.ronda - 1) % ids.length;
  const base = [...ids.slice(k), ...ids.slice(0, k)];
  p.orden = [];
  for (let r = 0; r < POR_JUGADOR; r++) p.orden.push(...(r % 2 ? [...base].reverse() : base));
  p.pick = 0; p.fase = 'draft'; p.resultado = null;
  p.jugadores.forEach((j) => { j.equipo = []; });
  p.limite = ahora + SEG_PICK * 1000;
}

export const turnoDe = (p) => (p.fase === 'draft' ? p.orden[p.pick] ?? null : null);

export function fichar(p, id, idx, ahora = Date.now()) {
  if (p.fase !== 'draft') return { ok: false, error: 'Ahora no se ficha.' };
  const quien = id == null || id < 0 ? turnoDe(p) : id;
  if (quien !== turnoDe(p)) return { ok: false, error: 'No es tu turno.' };
  const f = p.pool[Number(idx)];
  if (!f || f.de != null) return { ok: false, error: 'Ese famoso ya tiene equipo.' };
  f.de = quien; jug(p, quien).equipo.push(Number(idx));
  p.pick += 1;
  if (p.pick >= p.orden.length) revelar(p, ahora);
  else p.limite = ahora + SEG_PICK * 1000;
  return { ok: true };
}

function revelar(p, ahora) {
  p.criterio = p.candidatos[Math.floor(Math.random() * p.candidatos.length)];
  const cr = CRITERIOS[p.criterio];
  const sumas = activos(p).map((j) => ({ id: j.id, suma: j.equipo.reduce((s, i) => s + cr.valor(p.pool[i]), 0) }));
  const puntos = {};
  sumas.forEach((a) => { puntos[a.id] = sumas.filter((b) => b.id !== a.id && (a.suma - b.suma) * cr.mejor > 0).length; });
  Object.entries(puntos).forEach(([id, n]) => { jug(p, Number(id)).puntos += n; });
  p.resultado = { criterio: p.criterio, sumas, puntos };
  p.historial.push({ ronda: p.ronda, categoria: p.categorias[p.categorias.length - 1], criterio: p.criterio, puntos });
  p.fase = 'revelar'; p.limite = ahora + SEG_REVELAR * 1000;
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
  if (p.fase === 'draft' && ahora > p.limite) {
    // Se le acaba el tiempo: ficha al azar
    const libres = p.pool.map((f, i) => (f.de == null ? i : -1)).filter((i) => i >= 0);
    fichar(p, turnoDe(p), libres[Math.floor(Math.random() * libres.length)], ahora);
  } else if (p.fase === 'revelar' && ahora > p.limite) {
    if (p.ronda >= p.rondas || activos(p).length < 2) terminar(p);
    else nuevaRonda(p, ahora);
  }
}
export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id); if (!j || p.fase === 'fin') return;
  j.fuera = true;
  if (activos(p).length < 2) { terminar(p); return; }
  if (p.fase === 'draft') {
    p.orden = [...p.orden.slice(0, p.pick), ...p.orden.slice(p.pick).filter((x) => x !== id)];
    if (p.pick >= p.orden.length) revelar(p, ahora); else p.limite = ahora + SEG_PICK * 1000;
  }
}
export function accion(p, id, d, ahora = Date.now()) {
  if (d.tipo === 'fichar') return fichar(p, id, d.idx, ahora);
  return null;
}
export function forzar(p, ahora = Date.now()) { p.limite = 0; tick(p, ahora); return { ok: true }; }
export const turnoLocal = () => null;

export function vistaDe(p, id, ahora = Date.now()) {
  const yo = jug(p, id);
  const revelado = p.fase !== 'draft';
  return {
    fase: p.fase, ronda: p.ronda, rondas: p.rondas, categoria: p.categorias[p.categorias.length - 1], candidatos: p.candidatos,
    criterio: revelado ? p.criterio : null, turno: turnoDe(p), pick: p.pick, totalPicks: p.orden.length, orden: p.orden, limite: p.limite, ahora,
    pool: p.pool.map((f) => ({ n: f.n, de: f.de, ...(revelado ? { a: f.a, h: f.h } : {}) })),
    resultado: p.resultado,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, equipo: j.equipo, fuera: j.fuera })),
    yo: yo ? { id: yo.id } : null, fin: p.fin
  };
}
