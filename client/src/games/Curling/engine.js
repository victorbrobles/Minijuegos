// client/src/games/Curling/engine.js
// «Curling»: motor puro (salas online en server/routes/curling.js y modo un móvil).
// Pista de hielo con la diana («casa») al fondo. Por turnos, cada jugador lanza sus piedras: apunta, elige el efecto
// (la piedra se curva al frenar), para la barra de fuerza y, mientras la piedra desliza, BARRE frotando la pantalla:
// barrer hace que frene menos y se curve menos. Cada manga se juega en un MAPA distinto (la casa más cerca o más lejos,
// hielo que frena más o menos, pilares en medio…), así que la fuerza buena cambia de una manga a otra. Cada jugador
// tiene una «piedra pesada» por manga para sacar piedras. Puntúa quien tenga la piedra más cerca del centro: un punto
// por cada piedra suya más cerca que la mejor de cualquier rival; la que se queda en el botón (el centro) vale doble.
//
// El barrido va como una lista de intensidades (0-3), una por cada BARRIDO_FRAMES fotogramas de simulación: quien tira
// lo juega en directo en su móvil y manda la lista; el servidor repite la simulación y da exactamente lo mismo.
import { simular, crearSimulacion } from '../comun/fisica2d.js';

export const W = 34;
const E0 = 17; // centro de la pista
export const L = 150;
export const CASA = { x: W / 2, y: 125, r: 12 };
export const ANILLOS = [12, 8, 4, 1.4];
export const HOG = 92; // la piedra tiene que pasar esta línea (en el mapa clásico; cada mapa tiene la suya)
export const FONDO = 139; // línea roja del fondo (solo marca: las bandas y el fondo son paredes y la piedra rebota)
export const R = 1.45;
export const SALIDA = { x: W / 2, y: 8 };
export const OPCIONES_MANGAS = [2, 3, 4];
export const SEG_TURNO = 45;
export const BOTON = 1.4; // radio del botón (centro de la diana): una piedra con el centro dentro vale doble
export const BARRIDO_FRAMES = 12; // fotogramas de simulación (1/60 s) por cada valor del barrido
export const BARRIDO_MAX = 3;
export const BARRIDO_ROCE = 0.15; // roce que quita cada nivel de barrido
const BARRIDO_LARGO = 500;
const PESO_PESADA = 2.2;
/**
 * Mapas: cada manga se juega en uno distinto. casa = y del centro de la diana (más cerca o más lejos), roce = cuánto
 * frena el hielo, curva = cuánto se curva con efecto, obst = pilares fijos [x, y, radio] que hay que esquivar.
 * Fuerza aproximada para dejarla en el centro sin barrer: corta 27, rápida 22, clásica 45, pilares 41, muralla 43,
 * larga 60, pegajosa 63, desierto 68.
 */
export const MAPAS = [
  { id: 'clasica', nombre: 'Pista clásica', emoji: '❄️', pista: 'Hielo normal, la casa al fondo', casa: 125, roce: 2.6, curva: 1, obst: [] },
  { id: 'corta', nombre: 'Pista corta', emoji: '📏', pista: 'La casa está muy cerca: ¡flojito!', casa: 96, roce: 2.6, curva: 1, obst: [] },
  { id: 'rapida', nombre: 'Hielo pulido', emoji: '⚡', pista: 'Apenas frena y se curva mucho', casa: 118, roce: 1.9, curva: 1.4, obst: [] },
  { id: 'pilares', nombre: 'Los pilares', emoji: '🏛️', pista: 'Dos pilares en el centro: rodéalos con efecto', casa: 120, roce: 2.6, curva: 1.15, obst: [[E0 - 4.2, 84, 1.6], [E0 + 4.2, 84, 1.6]] },
  { id: 'muralla', nombre: 'La muralla', emoji: '🧱', pista: 'Un bloque tapa el centro: entra curvando', casa: 112, roce: 2.9, curva: 1.2, obst: [[E0, 80, 3.2]] },
  { id: 'larga', nombre: 'Pista larga', emoji: '🔭', pista: 'La casa está lejísimos y el hielo frena', casa: 130, roce: 3.2, curva: 0.9, obst: [] },
  { id: 'pegajosa', nombre: 'Hielo pegajoso', emoji: '🍯', pista: 'Frena muchísimo: tira fuerte', casa: 125, roce: 3.4, curva: 0.8, obst: [] },
  { id: 'desierto', nombre: 'Hielo arenoso', emoji: '🏜️', pista: 'Hay arena en el hielo: hace falta mucha fuerza', casa: 105, roce: 4.5, curva: 0.7, obst: [] }
];
export const HIELOS = MAPAS;
/** Datos de un mapa: casa (x, y, r), línea de juego (hog), línea del fondo y obstáculos. */
export function mapaDe(id) {
  const m = MAPAS.find((x) => x.id === id) || MAPAS[0];
  return { ...m, CASA: { x: W / 2, y: m.casa, r: 12 }, HOG: m.casa - 33, FONDO: m.casa + 14 };
}
const hieloDe = mapaDe;

const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);

// Las bandas y el fondo son paredes: la piedra rebota (y pierde algo de velocidad)
const REBOTE_PARED = 0.5; // bandas
const REBOTE_FONDO = 0.3; // el fondo amortigua más
function paredes(cs) {
  for (const c of cs) {
    if (c.fuera || c.m === Infinity) continue;
    if (c.x < c.r) { c.x = c.r; if (c.vx < 0) c.vx = -c.vx * REBOTE_PARED; }
    else if (c.x > W - c.r) { c.x = W - c.r; if (c.vx > 0) c.vx = -c.vx * REBOTE_PARED; }
    if (c.y > L - c.r) { c.y = L - c.r; if (c.vy > 0) c.vy = -c.vy * REBOTE_FONDO; }
    else if (c.y < c.r) { c.y = c.r; if (c.vy < 0) c.vy = -c.vy * REBOTE_PARED; }
  }
}

/** Velocidad inicial a partir de la fuerza (0-100). */
export const velocidad = (pot) => 16 + (Math.max(0, Math.min(100, pot)) / 100) * 20;
/** Intensidad de barrido en el fotograma f (desde 1). */
export const barridoEn = (barrido, f) => (barrido && barrido[Math.floor(f / BARRIDO_FRAMES)]) || 0;
/** Deja la lista de barrido limpia: enteros 0-3 y como mucho BARRIDO_LARGO valores. */
export const limpiarBarrido = (b) => (Array.isArray(b) ? b.slice(0, BARRIDO_LARGO).map((x) => Math.max(0, Math.min(BARRIDO_MAX, Math.round(Number(x) || 0)))) : []);

/**
 * Prepara la simulación de un lanzamiento, paso a paso. piedras: [{ id, de, x, y, pesada }],
 * tiro = { vx, vy, efecto (-1, 0, 1), pesada, barrido: [0-3, …] }, hielo = id del hielo de la manga.
 * `barrido` puede ir creciendo mientras se simula (el que tira barre en directo).
 */
export function crearLanzamiento(piedras, tiro, de, hielo) {
  const h = hieloDe(hielo);
  const cs = [{ id: 'nueva', de, x: SALIDA.x, y: SALIDA.y, vx: tiro.vx, vy: tiro.vy, r: R, m: tiro.pesada ? PESO_PESADA : 1, pesada: Boolean(tiro.pesada) },
    ...piedras.map((s) => ({ ...s, vx: 0, vy: 0, r: R, m: s.pesada ? PESO_PESADA : 1 })),
    ...h.obst.map(([x, y, r], i) => ({ id: `obst${i}`, obst: true, x, y, vx: 0, vy: 0, r, m: Infinity }))];
  const efecto = tiro.efecto || 0;
  const barrido = tiro.barrido || [];
  const fuerza = (c, dt, f) => {
    if (c.id !== 'nueva' || !efecto) return;
    const v = Math.sqrt(c.vx * c.vx + c.vy * c.vy);
    if (v < 0.3) return;
    // Se curva más cuanto más despacio va (como en el hielo de verdad); barrer la endereza
    const a = efecto * 0.34 * (1.4 - v / 30) * h.curva * (1 - 0.2 * barridoEn(barrido, f));
    const px = c.vy / v; const py = -c.vx / v; // perpendicular (hacia la derecha de la marcha)
    c.vx += px * a * dt; c.vy += py * a * dt;
  };
  // Barrer reduce el roce de la piedra lanzada (hasta un 45 %, se nota: puede alargarla más de media casa)
  const roceDe = (c, f) => (c.id === 'nueva' ? h.roce * (1 - BARRIDO_ROCE * barridoEn(barrido, f)) : h.roce);
  return crearSimulacion(cs, { roce: h.roce, roceDe, rebote: 0.85, paredes, fuerza, pasosMax: 60 * 16, cadaFrame: 3 });
}
/** Reglas al acabar el lanzamiento: si la lanzada no pasa la línea de juego (y no ha tocado nada), se retira. */
export function cerrarLanzamiento(cs, hielo) {
  const nueva = cs[0];
  if (!nueva.fuera && nueva.y < mapaDe(hielo).HOG && !nueva.toco) nueva.fuera = true;
}
/** Simula un lanzamiento entero. Mismo resultado en todos lados. */
export function simularLanzamiento(piedras, tiro, de, hielo) {
  const s = crearLanzamiento(piedras, tiro, de, hielo);
  while (s.paso()) { /* sigue */ }
  cerrarLanzamiento(s.cs, hielo);
  // Los pilares no son piedras: fuera de la lista (sí van en los fotogramas, al final, y no se mueven)
  return { cuerpos: s.cs.filter((c) => !c.obst), frames: s.frames };
}
void simular;

export const distancia = (s, casa = CASA) => Math.sqrt((s.x - casa.x) * (s.x - casa.x) + (s.y - casa.y) * (s.y - casa.y));

/** Puntos de la manga: { ganador, puntos } */
export function puntuarManga(piedras, hielo) {
  const casa = mapaDe(hielo).CASA; const distancia2 = (s) => distancia(s, casa);
  const en = piedras.filter((s) => distancia2(s) <= casa.r + R).sort((a, b) => distancia2(a) - distancia2(b));
  if (!en.length) return { ganador: null, puntos: 0, boton: 0 };
  const g = en[0].de;
  const mejorRival = en.find((s) => s.de !== g);
  const valen = en.filter((s) => s.de === g && (!mejorRival || distancia2(s) < distancia2(mejorRival)));
  const boton = valen.filter((s) => distancia2(s) <= BOTON).length;
  return { ganador: g, puntos: valen.length + boton, boton };
}

export function crearPartida(jugadores, items = [], reglas = {}, ahora = Date.now()) {
  const mangas = OPCIONES_MANGAS.includes(reglas.mangas) ? reglas.mangas : 3;
  const porJugador = jugadores.length <= 2 ? 4 : jugadores.length <= 4 ? 3 : 2;
  const p = {
    fase: 'turno', manga: 1, mangas, porJugador, n: 0, piedras: [], lanzadas: 0, contador: 0,
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, fuera: false })),
    orden: [], ultimo: null, resumen: null, fin: null, limite: 0, hielo: 'clasica', pesadas: {},
    // Un mapa distinto en cada manga (orden al azar)
    mapas: barajarMapas()
  };
  prepararManga(p, ahora, 0);
  return p;
}
function prepararManga(p, ahora, espera) {
  // Orden de lanzamiento: rota en cada manga (el último en tirar tiene ventaja)
  const ids = activos(p).map((j) => j.id);
  const k = (p.manga - 1) % ids.length;
  const base = [...ids.slice(k), ...ids.slice(0, k)];
  p.orden = [];
  for (let r = 0; r < p.porJugador; r++) p.orden.push(...base);
  p.lanzadas = 0; p.piedras = [];
  // Cada manga, un mapa distinto; cada jugador recupera su piedra pesada
  p.hielo = p.mapas[(p.manga - 1) % p.mapas.length];
  p.pesadas = {};
  p.limite = ahora + espera + SEG_TURNO * 1000;
}
function barajarMapas() {
  const ids = MAPAS.map((m) => m.id);
  for (let i = ids.length - 1; i > 0; i--) { const k = Math.floor(Math.random() * (i + 1)); [ids[i], ids[k]] = [ids[k], ids[i]]; }
  return ids;
}
export const turnoDe = (p) => p.orden[p.lanzadas] ?? null;
/** El tiro a partir de lo que elige el jugador (ángulo en grados, fuerza 0-100…). Igual en el móvil y en el servidor. */
export function tiroDe(ang, pot, efecto, pesada, barrido) {
  const v = velocidad(pot); const rad = (Math.max(-10, Math.min(10, ang)) * Math.PI) / 180;
  return { vx: Math.round(Math.sin(rad) * v * 1000) / 1000, vy: Math.round(Math.cos(rad) * v * 1000) / 1000, efecto, ang, pot, pesada: Boolean(pesada), barrido };
}

export function lanzar(p, id, d, ahora = Date.now()) {
  if (p.fase !== 'turno') return { ok: false, error: 'Ahora no.' };
  const quien = id == null || id < 0 ? turnoDe(p) : id;
  if (quien !== turnoDe(p)) return { ok: false, error: 'No es tu turno.' };
  const ang = Math.max(-10, Math.min(10, Number(d.ang) || 0));
  const efecto = [-1, 0, 1].includes(Number(d.efecto)) ? Number(d.efecto) : 0;
  const pesada = Boolean(d.pesada) && !p.pesadas[quien];
  const tiro = tiroDe(ang, Number(d.pot) || 0, efecto, pesada, limpiarBarrido(d.barrido));
  const antes = p.piedras;
  const r = simularLanzamiento(antes, tiro, quien, p.hielo);
  if (pesada) p.pesadas[quien] = true;
  p.contador += 1;
  const nuevas = r.cuerpos.filter((c) => !c.fuera).map((c) => ({ id: c.id === 'nueva' ? `p${p.contador}` : c.id, de: c.de, x: c.x, y: c.y, ...(c.pesada ? { pesada: true } : {}) }));
  p.piedras = nuevas; p.lanzadas += 1; p.n += 1;
  const ms = Math.round((r.frames.length / 40) * 1000); // los móviles lo reproducen a doble velocidad
  p.ultimo = { n: p.n, de: quien, antes, tiro, ms, hielo: p.hielo };
  if (p.lanzadas >= p.orden.length) cerrarManga(p, ahora, ms);
  else p.limite = ahora + ms + SEG_TURNO * 1000;
  return { ok: true };
}

function cerrarManga(p, ahora, espera = 0) {
  const res = puntuarManga(p.piedras, p.hielo);
  if (res.ganador != null) { const g = jug(p, res.ganador); if (g) g.puntos += res.puntos; }
  p.resumen = { manga: p.manga, ...res, nombre: res.ganador != null ? jug(p, res.ganador)?.nombre : null, piedras: p.piedras, hasta: ahora + espera + 5000 };
  p.fase = 'manga';
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
  if (p.fase === 'turno' && ahora > p.limite) {
    // Se le pasa el turno: pierde esa piedra
    p.n += 1; p.ultimo = { n: p.n, salto: true, de: turnoDe(p) }; p.lanzadas += 1;
    if (p.lanzadas >= p.orden.length) cerrarManga(p, ahora); else p.limite = ahora + SEG_TURNO * 1000;
  } else if (p.fase === 'manga' && ahora > p.resumen.hasta) {
    // La última piedra ya se vio antes del resumen de la manga: el final no tiene que esperar otra vez
    if (p.manga >= p.mangas) { if (p.ultimo) p.ultimo = { ...p.ultimo, ms: 0 }; terminar(p); return; }
    p.manga += 1; p.fase = 'turno'; p.resumen = null;
    prepararManga(p, ahora, 0);
  }
}
export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id); if (!j || p.fase === 'fin') return;
  j.fuera = true;
  if (activos(p).length < 2) { terminar(p); return; }
  p.orden = [...p.orden.slice(0, p.lanzadas), ...p.orden.slice(p.lanzadas).filter((x) => x !== id)];
  if (p.fase === 'turno' && p.lanzadas >= p.orden.length) cerrarManga(p, ahora);
}
export function accion(p, id, d, ahora = Date.now()) {
  if (d.tipo === 'lanzar') return lanzar(p, id, d, ahora);
  return null;
}
export function forzar(p, ahora = Date.now()) {
  if (p.fase === 'manga') { p.resumen.hasta = 0; tick(p, ahora); }
  else if (p.fase === 'turno') { p.limite = 0; tick(p, ahora); }
  return { ok: true };
}
export const turnoLocal = () => null;

export function vistaDe(p, id, ahora = Date.now()) {
  const yo = jug(p, id);
  const pendientes = Object.fromEntries(p.jugadores.map((j) => [j.id, p.orden.slice(p.lanzadas).filter((x) => x === j.id).length]));
  return {
    fase: p.fase, manga: p.manga, mangas: p.mangas, ronda: p.manga, rondas: p.mangas, piedras: p.piedras, turno: turnoDe(p), limite: p.limite, ahora,
    ultimo: p.ultimo, resumen: p.resumen, lanzadas: p.lanzadas, total: p.orden.length, hielo: p.hielo,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, fuera: j.fuera, quedan: pendientes[j.id] || 0, pesada: !p.pesadas[j.id] })),
    yo: yo ? { id: yo.id } : null, fin: p.fin
  };
}
