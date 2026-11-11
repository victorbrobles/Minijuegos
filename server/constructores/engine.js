// server/constructores/engine.js
// «El Laberinto · Constructores y corredores»: motor puro (sin red). Se copia al cliente con `npm run sync:constructores`.
//
// Cada ronda tiene dos fases:
//  1. CONSTRUIR: cada jugador diseña en secreto un laberinto de 9×9 para otro jugador, con un presupuesto de muros,
//     casillas de hielo (resbalas hasta chocar), flechas (te empujan) y un par de portales. Tiene que tener salida.
//  2. CARRERA: todos recorren a la vez el laberinto que les han hecho, con niebla (solo ven a su alrededor).
// Puntos por puestos: el corredor más rápido suma más, y el constructor cuyo laberinto más tarda en resolverse, también.

export const AJUSTES = {
  min: 2, max: 8, lado: 9, segCuenta: 3,
  presupuesto: { muro: 26, hielo: 6, flecha: 4, portal: 2 },
  vision: 2, puntos: [5, 3, 2, 1]
};
export const OPCIONES = { rondas: [2, 3, 4], segConstruir: [60, 90, 120], segCarrera: [60, 90, 120] };
export const DIRS = { N: [0, -1], E: [1, 0], S: [0, 1], O: [-1, 0] };
const L = AJUSTES.lado;
export const INICIO = 0;
export const META = L * L - 1;
const idx = (x, y) => y * L + x;
const xy = (i) => [i % L, Math.floor(i / L)];
const dentro = (x, y) => x >= 0 && y >= 0 && x < L && y < L;

// ---------------------------------------------------------------- Laberintos
/**
 * Un laberinto es un objeto { [casilla]: 'muro' | 'hielo' | 'portal' | 'N' | 'E' | 'S' | 'O' } (las flechas, por su
 * dirección). Las casillas vacías no aparecen.
 */
export function cuenta(lab) {
  const c = { muro: 0, hielo: 0, flecha: 0, portal: 0 };
  Object.values(lab || {}).forEach((t) => { if (DIRS[t]) c.flecha += 1; else if (c[t] != null) c[t] += 1; });
  return c;
}

/** Desde `pos`, intenta moverse en `dir`: aplica hielo (resbalas), flechas (te empujan) y portales. */
export function mover(lab, pos, dir) {
  const [dx, dy] = DIRS[dir];
  const [x, y] = xy(pos);
  if (!dentro(x + dx, y + dy) || lab[idx(x + dx, y + dy)] === 'muro') return pos;
  let c = idx(x + dx, y + dy);
  let d = dir;
  const vistos = new Set();
  for (let k = 0; k < 4 * L * L; k++) {
    const t = lab[c];
    const clave = `${c}${d}`;
    if (vistos.has(clave)) break; // bucle de flechas: te quedas donde estás
    vistos.add(clave);
    if (t === 'hielo' || DIRS[t]) {
      if (DIRS[t]) d = t;
      const [ex, ey] = DIRS[d]; const [cx, cy] = xy(c);
      if (!dentro(cx + ex, cy + ey) || lab[idx(cx + ex, cy + ey)] === 'muro') break;
      c = idx(cx + ex, cy + ey);
      continue;
    }
    if (t === 'portal') {
      const otro = Object.keys(lab).map(Number).find((i) => lab[i] === 'portal' && i !== c);
      if (otro != null) c = otro;
    }
    break;
  }
  return c;
}

/** Distancia (en movimientos) desde el inicio hasta la meta; null si no hay salida. */
export function resolver(lab, desde = INICIO) {
  const d = new Map([[desde, 0]]);
  const cola = [desde];
  while (cola.length) {
    const c = cola.shift();
    if (c === META) return d.get(c);
    Object.keys(DIRS).forEach((dir) => { const n = mover(lab, c, dir); if (!d.has(n)) { d.set(n, d.get(c) + 1); cola.push(n); } });
  }
  return null;
}

/** Comprueba que un laberinto respeta el presupuesto y tiene salida. Devuelve { ok, error, pasos }. */
export function validar(lab) {
  if (!lab || typeof lab !== 'object') return { ok: false, error: 'Laberinto vacío.' };
  for (const [k, t] of Object.entries(lab)) {
    const i = Number(k);
    if (!Number.isInteger(i) || i < 0 || i >= L * L) return { ok: false, error: 'Casilla fuera del tablero.' };
    if (i === INICIO || i === META) return { ok: false, error: 'La salida y la meta tienen que quedar libres.' };
    if (!['muro', 'hielo', 'portal', ...Object.keys(DIRS)].includes(t)) return { ok: false, error: 'Pieza desconocida.' };
  }
  const c = cuenta(lab);
  for (const [k, max] of Object.entries(AJUSTES.presupuesto)) if (c[k] > max) return { ok: false, error: `Te pasas de ${k === 'flecha' ? 'flechas' : `${k}s`}: máximo ${max}.` };
  if (c.portal === 1) return { ok: false, error: 'Los portales van por parejas: pon los dos.' };
  const pasos = resolver(lab);
  if (pasos == null) return { ok: false, error: 'Tu laberinto no tiene salida: el corredor tiene que poder llegar a la meta.' };
  return { ok: true, pasos };
}

/** Laberinto al azar (para quien no termina a tiempo): muros sueltos que dejan salida. */
export function laberintoAzar(rng = Math.random, n = 18) {
  const lab = {};
  for (let k = 0; k < 400 && Object.keys(lab).length < n; k++) {
    const i = Math.floor(rng() * L * L);
    if (i === INICIO || i === META || lab[i]) continue;
    lab[i] = 'muro';
    if (resolver(lab) == null) delete lab[i];
  }
  return lab;
}

/** Repite una carrera (lista de direcciones) y devuelve las casillas por las que pasa. */
export function recorrer(lab, movs) {
  const camino = [INICIO];
  let c = INICIO;
  for (const d of movs || []) {
    if (!DIRS[d]) continue;
    c = mover(lab, c, d);
    camino.push(c);
    if (c === META) break;
  }
  return camino;
}

// ---------------------------------------------------------------- Partida
const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);

/** reglas: { rondas, segConstruir, segCarrera, niebla, sinReloj } */
export function crearPartida(jugadores, reglas = {}, ahora = Date.now(), rng = Math.random) {
  if (jugadores.length < AJUSTES.min) throw new Error(`Hacen falta al menos ${AJUSTES.min} jugadores.`);
  const p = {
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, ptsCorredor: 0, ptsConstructor: 0, fuera: false })),
    rondas: OPCIONES.rondas.includes(Number(reglas.rondas)) ? Number(reglas.rondas) : 3,
    segConstruir: OPCIONES.segConstruir.includes(Number(reglas.segConstruir)) ? Number(reglas.segConstruir) : 90,
    segCarrera: OPCIONES.segCarrera.includes(Number(reglas.segCarrera)) ? Number(reglas.segCarrera) : 90,
    niebla: reglas.niebla !== false, sinReloj: Boolean(reglas.sinReloj),
    ronda: 0, fase: 'construir', hasta: null, inicio: null, encargos: [], historial: [], fin: null
  };
  Object.defineProperty(p, 'rng', { value: rng, enumerable: false, writable: true });
  empezarRonda(p, ahora);
  return p;
}
const azar = (p) => (typeof p.rng === 'function' ? p.rng() : Math.random());

/** En la ronda r, cada jugador construye para el que está r posiciones más allá (sin tocarse a sí mismo). */
function empezarRonda(p, ahora) {
  p.ronda += 1;
  const a = activos(p);
  const n = a.length;
  const salto = ((p.ronda - 1) % (n - 1)) + 1;
  p.encargos = a.map((j, i) => ({ constructor: j.id, corredor: a[(i + salto) % n].id, lab: null, auto: false, pasos: null, movs: null, tiempo: null, llego: false, pos: INICIO }));
  p.fase = 'construir';
  p.inicio = null;
  p.hasta = p.sinReloj ? null : ahora + p.segConstruir * 1000;
}
const encargoDe = (p, id, rol) => p.encargos.find((e) => e[rol] === id);

/** El constructor entrega su laberinto (validado). */
export function entregar(p, id, lab, ahora = Date.now()) {
  if (p.fase !== 'construir') return { ok: false, error: 'Ahora no se construye.' };
  const e = encargoDe(p, id, 'constructor');
  if (!e) return { ok: false, error: 'No construyes esta ronda.' };
  const limpio = Object.fromEntries(Object.entries(lab || {}).map(([k, t]) => [Number(k), t]));
  const r = validar(limpio);
  if (!r.ok) return r;
  e.lab = limpio; e.pasos = r.pasos; e.auto = false;
  if (p.encargos.every((x) => x.lab)) empezarCarrera(p, ahora);
  return { ok: true, pasos: r.pasos };
}
export function retirarEntrega(p, id) {
  if (p.fase !== 'construir') return { ok: false, error: 'Ahora no.' };
  const e = encargoDe(p, id, 'constructor');
  if (!e) return { ok: false, error: 'No construyes esta ronda.' };
  e.lab = null;
  return { ok: true };
}

function empezarCarrera(p, ahora) {
  p.encargos.forEach((e) => { if (!e.lab) { e.lab = laberintoAzar(() => azar(p)); e.auto = true; e.pasos = resolver(e.lab); } });
  p.fase = 'carrera';
  p.inicio = ahora + AJUSTES.segCuenta * 1000;
  p.hasta = p.sinReloj ? null : p.inicio + p.segCarrera * 1000;
}

/** El corredor va informando de por dónde va (para que los demás vean el progreso). */
export function posicion(p, id, pos) {
  // Puede llegar tarde (tras cruzar la meta o cerrar la carrera): se ignora sin avisar
  if (p.fase !== 'carrera') return { ok: true };
  const e = encargoDe(p, id, 'corredor');
  if (!e || e.llego) return { ok: true };
  const n = Number(pos);
  if (Number.isInteger(n) && n >= 0 && n < L * L) e.pos = n;
  return { ok: true };
}

/** El corredor llega: se repiten sus movimientos para comprobar que de verdad alcanza la meta. */
export function llegar(p, id, movs = [], ahora = Date.now(), tiempoLocal = null) {
  if (p.fase !== 'carrera') return { ok: false, error: 'Ahora no se corre.' };
  const e = encargoDe(p, id, 'corredor');
  if (!e) return { ok: false, error: 'No corres esta ronda.' };
  if (e.llego) return { ok: false, error: 'Ya has llegado.' };
  const camino = recorrer(e.lab, movs);
  if (camino[camino.length - 1] !== META) return { ok: false, error: 'Ese recorrido no llega a la meta.' };
  e.llego = true;
  e.movs = movs.slice(0, camino.length - 1);
  e.pos = META;
  e.tiempo = p.sinReloj && tiempoLocal != null ? Math.max(0, Number(tiempoLocal)) : Math.max(0, (ahora - (p.inicio || ahora)) / 1000);
  e.tiempo = Math.round(e.tiempo * 10) / 10;
  if (p.encargos.every((x) => x.llego || jug(p, x.corredor)?.fuera)) cerrarCarrera(p);
  return { ok: true, tiempo: e.tiempo };
}

/** Quien no llega (se rinde o se acaba el tiempo) cuenta con el tiempo máximo. */
export function rendirse(p, id, ahora = Date.now()) {
  if (p.fase !== 'carrera') return { ok: false, error: 'Ahora no se corre.' };
  const e = encargoDe(p, id, 'corredor');
  if (!e || e.llego) return { ok: false, error: 'No corres.' };
  e.llego = true; e.tiempo = null; e.rendido = true;
  if (p.encargos.every((x) => x.llego || jug(p, x.corredor)?.fuera)) cerrarCarrera(p);
  return { ok: true };
}

/** Puntos por puestos (los empates comparten el mejor puesto). mejor(a, b) < 0 si a va antes. */
function repartir(lista, valor, mejor) {
  const orden = [...lista].sort((a, b) => mejor(valor(a), valor(b)));
  const pts = new Map();
  orden.forEach((x, i) => {
    const igual = orden.findIndex((y) => mejor(valor(y), valor(x)) === 0);
    pts.set(x, AJUSTES.puntos[igual] ?? 0);
  });
  return pts;
}

function cerrarCarrera(p) {
  const max = p.segCarrera + 1;
  const t = (e) => (e.tiempo == null ? max : e.tiempo);
  const corr = repartir(p.encargos, t, (a, b) => a - b);
  const cons = repartir(p.encargos, t, (a, b) => b - a);
  p.encargos.forEach((e) => {
    const c = jug(p, e.corredor); const k = jug(p, e.constructor);
    e.ptsCorredor = corr.get(e); e.ptsConstructor = e.auto ? 0 : cons.get(e);
    if (c && !c.fuera) { c.puntos += e.ptsCorredor; c.ptsCorredor += e.ptsCorredor; }
    if (k && !k.fuera) { k.puntos += e.ptsConstructor; k.ptsConstructor += e.ptsConstructor; }
  });
  p.historial.push({ ronda: p.ronda, encargos: p.encargos.map((e) => ({ ...e })) });
  p.fase = 'resultados';
  p.hasta = null;
}

/** El anfitrión pasa a la siguiente ronda (o al final). */
export function siguiente(p, ahora = Date.now()) {
  if (p.fase !== 'resultados') return { ok: false, error: 'La ronda no ha terminado.' };
  if (p.ronda >= p.rondas || activos(p).length < 2) return terminar(p);
  empezarRonda(p, ahora);
  return { ok: true };
}

export function terminar(p) {
  if (p.fase === 'fin') return { ok: false, error: 'La partida ya ha terminado.' };
  if (p.fase === 'carrera') cerrarCarrera(p);
  p.fase = 'fin';
  p.hasta = null;
  const tabla = [...p.jugadores].sort((a, b) => (a.fuera - b.fuera) || b.puntos - a.puntos);
  let puesto = 0;
  tabla.forEach((j, k) => { if (k === 0 || j.puntos !== tabla[k - 1].puntos) puesto = k + 1; j.puesto = puesto; });
  const a = activos(p);
  const max = a.length ? Math.max(...a.map((j) => j.puntos)) : 0;
  p.fin = {
    tabla: tabla.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, ptsCorredor: j.ptsCorredor, ptsConstructor: j.ptsConstructor, puesto: j.puesto, fuera: j.fuera })),
    ganadores: max > 0 ? a.filter((j) => j.puntos === max).map((j) => j.id) : [], max
  };
  return { ok: true };
}

/** Relojes (online): al acabar la construcción, quien no entregó recibe un laberinto al azar; al acabar la carrera, los que no llegaron se cuentan con el tiempo máximo. */
export function tick(p, ahora = Date.now()) {
  if (!p.hasta || ahora < p.hasta) return false;
  if (p.fase === 'construir') { empezarCarrera(p, ahora); return true; }
  if (p.fase === 'carrera') {
    p.encargos.forEach((e) => { if (!e.llego) { e.llego = true; e.tiempo = null; e.rendido = true; } });
    cerrarCarrera(p);
    return true;
  }
  return false;
}

export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id);
  if (!j || j.fuera || p.fase === 'fin') return;
  j.fuera = true;
  if (activos(p).length < 2) { terminar(p); return; }
  if (p.fase === 'construir') {
    const e = encargoDe(p, id, 'constructor');
    if (e && !e.lab) { e.lab = laberintoAzar(() => azar(p)); e.auto = true; e.pasos = resolver(e.lab); }
    if (p.encargos.every((x) => x.lab)) empezarCarrera(p, ahora);
  } else if (p.fase === 'carrera') {
    const e = encargoDe(p, id, 'corredor');
    if (e && !e.llego) { e.llego = true; e.tiempo = null; e.rendido = true; }
    if (p.encargos.every((x) => x.llego || jug(p, x.corredor)?.fuera)) cerrarCarrera(p);
  }
}

// ---------------------------------------------------------------- Vista
export function vistaDe(p, id) {
  const yo = jug(p, id);
  const mio = yo ? encargoDe(p, id, 'constructor') : null;
  const corro = yo ? encargoDe(p, id, 'corredor') : null;
  const publico = p.fase === 'resultados' || p.fase === 'fin';
  return {
    fase: p.fase, ronda: p.ronda, rondas: p.rondas, hasta: p.hasta, inicio: p.inicio, lado: L, niebla: p.niebla,
    segundos: p.fase === 'construir' ? p.segConstruir : p.segCarrera, presupuesto: AJUSTES.presupuesto, vision: AJUSTES.vision,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, fuera: j.fuera })),
    yo: yo ? {
      id,
      construyePara: mio ? mio.corredor : null, entregado: Boolean(mio?.lab && !mio.auto), miLab: mio?.lab && !mio.auto ? mio.lab : null,
      // En la carrera, el laberinto que te han hecho (la niebla la aplica la pantalla)
      corre: corro && p.fase === 'carrera' ? { lab: corro.lab, constructor: corro.constructor, llego: corro.llego, tiempo: corro.tiempo } : null
    } : null,
    entregas: p.encargos.map((e) => ({ constructor: e.constructor, corredor: e.corredor, listo: Boolean(e.lab) })),
    carrera: p.fase === 'carrera' ? p.encargos.map((e) => ({ corredor: e.corredor, constructor: e.constructor, pos: e.pos, llego: e.llego, tiempo: e.tiempo, rendido: Boolean(e.rendido), pasos: e.pasos })) : null,
    resultados: publico && p.historial.length ? p.historial[p.historial.length - 1].encargos.map((e) => ({
      constructor: e.constructor, corredor: e.corredor, lab: e.lab, auto: e.auto, pasos: e.pasos, tiempo: e.tiempo, rendido: Boolean(e.rendido),
      camino: e.movs ? recorrer(e.lab, e.movs) : null, ptsCorredor: e.ptsCorredor, ptsConstructor: e.ptsConstructor
    })) : null,
    fin: p.fin
  };
}
