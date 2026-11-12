// server/tablero/engine.js
// «El Tablero de Puntos»: motor puro (sin red). Se copia al cliente con `npm run sync:tablero`.
//
// 1. CATEGORÍAS: por turnos (empieza alguien al azar), cada jugador elige una categoría que no haya elegido nadie
//    hasta completar las que se juegan (jugadores × 1, 2 o 3).
// 2. TABLERO: categorías × valores (100, 200, 300, 400 y 500). El primer turno es al azar y luego van en orden.
//    Quien tiene el turno elige casilla y responde: si acierta suma su valor; si falla lo resta y hay REBOTE solo
//    para el siguiente jugador, que puede responder sin riesgo (si acierta suma; si falla no resta).
//    Una casilla oculta vale el doble. Se acaba cuando no quedan casillas.

export const AJUSTES = { min: 2, max: 12, segElegir: 30, segCategoria: 30, valores: [100, 200, 300, 400, 500] };
// porJugador: categorías que elige cada jugador (×1, ×2, ×3). El tablero tiene jugadores × porJugador (máx. 25).
export const OPCIONES = { porJugador: [1, 2, 3], segundos: [15, 20, 30] };
/** Número de categorías del tablero según jugadores y multiplicador. */
export const categoriasPara = (nJugadores, porJugador, total = 25) => Math.min(total, nJugadores * porJugador);

const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);
const clave = (cat, v) => `${cat}:${v}`;
const reloj = (p, ahora, s) => (p.sinReloj ? null : ahora + s * 1000);
/** El siguiente jugador activo después de `id` (en el orden de la mesa). */
function siguienteDe(p, id) {
  const orden = p.jugadores;
  const i = orden.findIndex((j) => j.id === id);
  for (let k = 1; k <= orden.length; k++) {
    const j = orden[(i + k) % orden.length];
    if (!j.fuera) return j.id;
  }
  return null;
}

/**
 * banco: { categorias: [{ id, nombre, emoji, color }], preguntas: { 'cat:v': { p, opciones, correcta } } }
 * (todas las categorías disponibles con una pregunta por valor). reglas: { porJugador: 1|2|3, segundos, sinReloj }
 */
export function crearPartida(jugadores, banco, reglas = {}, ahora = Date.now(), rng = Math.random) {
  const m = OPCIONES.porJugador.includes(Number(reglas.porJugador)) ? Number(reglas.porJugador) : 1;
  const n = categoriasPara(jugadores.length, m, banco.categorias.length);
  const p = {
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, aciertos: 0, fallos: 0, rebotes: 0, fuera: false })),
    disponibles: banco.categorias, preguntas: banco.preguntas, necesarias: Math.min(n, banco.categorias.length),
    elegidas: [], categorias: [], doble: null,
    usadas: {}, segundos: reglas.segundos || 20, sinReloj: Boolean(reglas.sinReloj),
    fase: 'categorias', turno: jugadores[Math.floor(rng() * jugadores.length)].id, hasta: null,
    actual: null, rebote: null, ultimo: null, nAviso: 0, jugadas: 0, fin: null
  };
  Object.defineProperty(p, 'rng', { value: rng, enumerable: false, writable: true });
  p.hasta = reloj(p, ahora, AJUSTES.segCategoria);
  return p;
}
const azar = (p) => (typeof p.rng === 'function' ? p.rng() : Math.random());
const libres = (p) => p.categorias.flatMap((c) => AJUSTES.valores.map((v) => clave(c.id, v))).filter((k) => !p.usadas[k] && p.preguntas[k]);

/** El jugador del turno elige una categoría que no haya elegido nadie. */
export function elegirCategoria(p, id, cat, ahora = Date.now()) {
  if (p.fase !== 'categorias') return { ok: false, error: 'Ya se han elegido las categorías.' };
  if (id !== p.turno) return { ok: false, error: 'No es tu turno.' };
  const c = p.disponibles.find((x) => x.id === cat);
  if (!c) return { ok: false, error: 'Esa categoría no existe.' };
  if (p.elegidas.some((e) => e.cat === cat)) return { ok: false, error: 'Esa categoría ya está elegida.' };
  p.elegidas.push({ cat, por: id });
  if (p.elegidas.length >= p.necesarias) empezarTablero(p, ahora);
  else { p.turno = siguienteDe(p, id); p.hasta = reloj(p, ahora, AJUSTES.segCategoria); }
  return { ok: true };
}

function empezarTablero(p, ahora) {
  p.categorias = p.elegidas.map((e) => p.disponibles.find((c) => c.id === e.cat));
  // La casilla doble nunca es de 100
  const candidatas = libres(p).filter((k) => !k.endsWith(':100'));
  p.doble = candidatas[Math.floor(azar(p) * candidatas.length)] ?? null;
  const a = activos(p);
  p.turno = a[Math.floor(azar(p) * a.length)].id;
  p.fase = 'elegir';
  p.hasta = reloj(p, ahora, AJUSTES.segElegir);
}

/** El jugador del turno elige casilla. */
export function elegir(p, id, cat, v, ahora = Date.now()) {
  if (p.fase !== 'elegir') return { ok: false, error: 'Ahora no se elige casilla.' };
  if (id !== p.turno) return { ok: false, error: 'No es tu turno.' };
  const k = clave(cat, Number(v));
  if (!p.categorias.some((c) => c.id === cat) || !p.preguntas[k] || p.usadas[k]) return { ok: false, error: 'Esa casilla no está disponible.' };
  p.actual = { k, cat, v: Number(v), doble: k === p.doble };
  p.fase = 'pregunta';
  p.hasta = reloj(p, ahora, p.segundos);
  return { ok: true, doble: p.actual.doble };
}

/** Responde quien tiene la pregunta (o el rebote). opcion: texto de la opción; null = se acabó el tiempo. */
export function responder(p, id, opcion, ahora = Date.now()) {
  if (p.fase !== 'pregunta' && p.fase !== 'rebote') return { ok: false, error: 'No hay pregunta abierta.' };
  const responde = p.fase === 'rebote' ? p.rebote.id : p.turno;
  if (id !== responde) return { ok: false, error: 'No te toca responder.' };
  const q = p.preguntas[p.actual.k];
  if (opcion !== null && p.rebote?.quitada === opcion) return { ok: false, error: 'Esa opción ya está descartada.' };
  const bien = opcion !== null && opcion === q.correcta;
  const valor = p.actual.v * (p.actual.doble ? 2 : 1);
  const j = jug(p, id);
  const esRebote = p.fase === 'rebote';
  const puntos = bien ? valor : esRebote ? 0 : -valor;
  j.puntos += puntos;
  if (bien) { j.aciertos += 1; if (esRebote) j.rebotes += 1; } else if (!esRebote) j.fallos += 1;
  p.nAviso += 1;
  const siguiente = !bien && !esRebote ? siguienteDe(p, id) : null;
  const hayRebote = siguiente != null && siguiente !== id;
  p.ultimo = {
    n: p.nAviso, id, cat: p.actual.cat, v: p.actual.v, doble: p.actual.doble, pregunta: q.p, elegida: opcion, bien, puntos,
    rebote: esRebote, reboteSiguiente: hayRebote ? siguiente : null, correcta: bien || esRebote || !hayRebote ? q.correcta : null
  };
  if (hayRebote) {
    p.fase = 'rebote';
    p.rebote = { id: siguiente, quitada: opcion };
    p.hasta = reloj(p, ahora, p.segundos);
    return { ok: true, bien, puntos, rebote: siguiente };
  }
  cerrarCasilla(p, esRebote && bien ? id : p.turno, bien, ahora);
  return { ok: true, bien, puntos };
}

function cerrarCasilla(p, por, bien, ahora) {
  p.usadas[p.actual.k] = { por, bien, rebote: p.fase === 'rebote' };
  p.actual = null;
  p.rebote = null;
  p.jugadas += 1;
  if (!libres(p).length) { terminar(p); return; }
  p.turno = siguienteDe(p, p.turno);
  p.fase = 'elegir';
  p.hasta = reloj(p, ahora, AJUSTES.segElegir);
}

export function terminar(p) {
  if (p.fase === 'fin') return { ok: false, error: 'La partida ya ha terminado.' };
  p.fase = 'fin';
  p.hasta = null;
  p.actual = null;
  p.rebote = null;
  const tabla = [...p.jugadores].sort((a, b) => (a.fuera - b.fuera) || b.puntos - a.puntos || b.aciertos - a.aciertos);
  let puesto = 0;
  tabla.forEach((j, k) => { if (k === 0 || j.puntos !== tabla[k - 1].puntos) puesto = k + 1; j.puesto = puesto; });
  const a = activos(p);
  const max = a.length ? Math.max(...a.map((j) => j.puntos)) : 0;
  p.fin = {
    tabla: tabla.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, fallos: j.fallos, rebotes: j.rebotes, puesto: j.puesto, fuera: j.fuera })),
    ganadores: max > 0 ? a.filter((j) => j.puntos === max).map((j) => j.id) : [], max
  };
  return { ok: true };
}

/** Si se acaba el tiempo: categoría al azar; casilla libre más barata; al responder cuenta como fallo. */
export function tick(p, ahora = Date.now()) {
  if (!p.hasta || ahora < p.hasta) return false;
  if (p.fase === 'categorias') {
    const libresCat = p.disponibles.filter((c) => !p.elegidas.some((e) => e.cat === c.id));
    elegirCategoria(p, p.turno, libresCat[Math.floor(azar(p) * libresCat.length)].id, ahora);
  } else if (p.fase === 'elegir') {
    const k = libres(p).sort((a, b) => Number(a.split(':')[1]) - Number(b.split(':')[1]))[0];
    if (k) { const [cat, v] = k.split(':'); elegir(p, p.turno, cat, v, ahora); }
  } else if (p.fase === 'pregunta') responder(p, p.turno, null, ahora);
  else if (p.fase === 'rebote') responder(p, p.rebote.id, null, ahora);
  return true;
}

export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id);
  if (!j || j.fuera || p.fase === 'fin') return;
  const siguiente = siguienteDe(p, id);
  j.fuera = true;
  if (activos(p).length < 2) { terminar(p); return; }
  if (p.fase === 'categorias' && p.turno === id) { p.turno = siguiente; p.hasta = reloj(p, ahora, AJUSTES.segCategoria); return; }
  if (p.fase === 'rebote' && p.rebote.id === id) { cerrarCasilla(p, p.turno, false, ahora); return; }
  if (p.turno === id && (p.fase === 'elegir' || p.fase === 'pregunta' || p.fase === 'rebote')) {
    p.actual = null;
    p.rebote = null;
    p.turno = siguiente;
    p.fase = 'elegir';
    p.hasta = reloj(p, ahora, AJUSTES.segElegir);
  }
}

export function vistaDe(p, id) {
  const q = p.actual ? p.preguntas[p.actual.k] : null;
  return {
    fase: p.fase, turno: p.turno, hasta: p.hasta,
    segundos: p.fase === 'pregunta' || p.fase === 'rebote' ? p.segundos : p.fase === 'categorias' ? AJUSTES.segCategoria : AJUSTES.segElegir,
    ronda: p.jugadas + 1, rondas: p.categorias.length * AJUSTES.valores.length, quedan: libres(p).length,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, fallos: j.fallos, rebotes: j.rebotes, fuera: j.fuera })),
    yo: jug(p, id) ? { id } : null,
    disponibles: p.fase === 'categorias' ? p.disponibles.map((c) => ({ ...c, por: p.elegidas.find((e) => e.cat === c.id)?.por ?? null })) : null,
    elegidas: p.elegidas, necesarias: p.necesarias,
    categorias: p.categorias.map((c) => ({
      ...c,
      celdas: AJUSTES.valores.map((v) => {
        const u = p.usadas[clave(c.id, v)];
        return { v, usada: Boolean(u), por: u?.por ?? null, bien: u?.bien ?? null, doble: Boolean(u) && clave(c.id, v) === p.doble };
      })
    })),
    actual: p.actual ? { cat: p.actual.cat, v: p.actual.v, doble: p.actual.doble, pregunta: q.p, opciones: q.opciones } : null,
    rebote: p.rebote,
    responde: p.fase === 'rebote' ? p.rebote.id : p.fase === 'pregunta' ? p.turno : null,
    ultimo: p.ultimo,
    fin: p.fin
  };
}
