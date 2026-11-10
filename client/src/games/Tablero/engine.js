// server/tablero/engine.js
// «El Tablero de Puntos»: motor puro (sin red). Se copia al cliente con `npm run sync:tablero`.
// Tablero de categorías × valores (100, 200, 300, 500). Por turnos, cada jugador elige casilla y responde:
// si acierta suma su valor y si falla lo resta. Una casilla oculta es doble. Se acaba cuando no quedan casillas.

export const AJUSTES = { min: 2, max: 8, segElegir: 30, valores: [100, 200, 300, 500] };
export const OPCIONES = { categorias: [3, 4, 5, 6], segundos: [15, 20, 30] };

const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);
const clave = (cat, v) => `${cat}:${v}`;

/** tablero: { categorias: [{ id, nombre, emoji }], preguntas: { 'cat:v': { p, opciones, correcta } }, doble: 'cat:v' } */
export function crearPartida(jugadores, tablero, reglas = {}, ahora = Date.now()) {
  const p = {
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, aciertos: 0, fallos: 0, fuera: false })),
    categorias: tablero.categorias, preguntas: tablero.preguntas, doble: tablero.doble,
    usadas: {}, segundos: reglas.segundos || 20, sinReloj: Boolean(reglas.sinReloj),
    fase: 'elegir', turno: activos({ jugadores }).length ? jugadores[0].id : null, hasta: null, actual: null, ultimo: null, jugadas: 0, fin: null
  };
  p.hasta = reloj(p, ahora, AJUSTES.segElegir);
  return p;
}
const reloj = (p, ahora, s) => (p.sinReloj ? null : ahora + s * 1000);
const libres = (p) => p.categorias.flatMap((c) => AJUSTES.valores.map((v) => clave(c.id, v))).filter((k) => !p.usadas[k] && p.preguntas[k]);

/** El jugador del turno elige casilla. */
export function elegir(p, id, cat, v, ahora = Date.now()) {
  if (p.fase !== 'elegir') return { ok: false, error: 'Ahora no se elige casilla.' };
  if (id !== p.turno) return { ok: false, error: 'No es tu turno.' };
  const k = clave(cat, Number(v));
  if (!p.preguntas[k] || p.usadas[k]) return { ok: false, error: 'Esa casilla no está disponible.' };
  p.actual = { k, cat, v: Number(v), doble: k === p.doble };
  p.fase = 'pregunta';
  p.hasta = reloj(p, ahora, p.segundos);
  return { ok: true, doble: p.actual.doble };
}

/** El jugador del turno responde (texto de la opción; null = se acabó el tiempo). */
export function responder(p, id, opcion, ahora = Date.now()) {
  if (p.fase !== 'pregunta') return { ok: false, error: 'No hay pregunta abierta.' };
  if (id !== p.turno) return { ok: false, error: 'No es tu turno.' };
  const q = p.preguntas[p.actual.k];
  const bien = opcion !== null && opcion === q.correcta;
  const valor = p.actual.v * (p.actual.doble ? 2 : 1);
  const puntos = bien ? valor : -valor;
  const j = jug(p, id);
  j.puntos += puntos;
  if (bien) j.aciertos += 1; else j.fallos += 1;
  p.usadas[p.actual.k] = { por: id, bien };
  p.ultimo = { id, cat: p.actual.cat, v: p.actual.v, doble: p.actual.doble, pregunta: q.p, correcta: q.correcta, elegida: opcion, bien, puntos };
  p.actual = null;
  p.jugadas += 1;
  if (!libres(p).length) { terminar(p); return { ok: true, bien, puntos }; }
  pasarTurno(p, ahora);
  return { ok: true, bien, puntos };
}

function pasarTurno(p, ahora) {
  const a = activos(p);
  const i = a.findIndex((j) => j.id === p.turno);
  p.turno = a[(i + 1) % a.length].id;
  p.fase = 'elegir';
  p.hasta = reloj(p, ahora, AJUSTES.segElegir);
}

export function terminar(p) {
  if (p.fase === 'fin') return { ok: false, error: 'La partida ya ha terminado.' };
  p.fase = 'fin';
  p.hasta = null;
  p.actual = null;
  const tabla = [...p.jugadores].sort((a, b) => (a.fuera - b.fuera) || b.puntos - a.puntos || b.aciertos - a.aciertos);
  let puesto = 0;
  tabla.forEach((j, k) => { if (k === 0 || j.puntos !== tabla[k - 1].puntos) puesto = k + 1; j.puesto = puesto; });
  const a = activos(p);
  const max = a.length ? Math.max(...a.map((j) => j.puntos)) : 0;
  p.fin = {
    tabla: tabla.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, fallos: j.fallos, puesto: j.puesto, fuera: j.fuera })),
    ganadores: max > 0 ? a.filter((j) => j.puntos === max).map((j) => j.id) : [], max
  };
  return { ok: true };
}

/** Si se acaba el tiempo: al elegir, se coge la casilla libre más barata; al responder, cuenta como fallo. */
export function tick(p, ahora = Date.now()) {
  if (!p.hasta || ahora < p.hasta) return;
  if (p.fase === 'elegir') {
    const k = libres(p).sort((a, b) => Number(a.split(':')[1]) - Number(b.split(':')[1]))[0];
    if (k) { const [cat, v] = k.split(':'); elegir(p, p.turno, cat, v, ahora); }
  } else if (p.fase === 'pregunta') responder(p, p.turno, null, ahora);
}

export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id);
  if (!j || j.fuera || p.fase === 'fin') return;
  if (p.turno === id) {
    if (p.fase === 'pregunta') { p.actual = null; }
    j.fuera = true;
    if (activos(p).length < 2) { terminar(p); return; }
    const a = activos(p);
    const orden = p.jugadores.filter((x) => !x.fuera || x.id === id);
    const i = orden.findIndex((x) => x.id === id);
    p.turno = (orden.slice(i + 1).find((x) => !x.fuera) || a[0]).id;
    p.fase = 'elegir';
    p.hasta = reloj(p, ahora, AJUSTES.segElegir);
    return;
  }
  j.fuera = true;
  if (activos(p).length < 2) terminar(p);
}

export function vistaDe(p, id) {
  const q = p.actual ? p.preguntas[p.actual.k] : null;
  return {
    fase: p.fase, turno: p.turno, hasta: p.hasta, segundos: p.fase === 'pregunta' ? p.segundos : AJUSTES.segElegir,
    ronda: p.jugadas + 1, rondas: Object.keys(p.preguntas).length, quedan: libres(p).length,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, fallos: j.fallos, fuera: j.fuera })),
    yo: jug(p, id) ? { id } : null,
    categorias: p.categorias.map((c) => ({
      ...c,
      celdas: AJUSTES.valores.map((v) => {
        const u = p.usadas[clave(c.id, v)];
        return { v, usada: Boolean(u), por: u?.por ?? null, bien: u?.bien ?? null, doble: u && clave(c.id, v) === p.doble };
      })
    })),
    actual: p.actual ? { cat: p.actual.cat, v: p.actual.v, doble: p.actual.doble, pregunta: q.p, opciones: q.opciones } : null,
    ultimo: p.ultimo,
    fin: p.fin
  };
}
