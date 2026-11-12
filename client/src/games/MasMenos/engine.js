// server/masmenos/engine.js
// Motor puro de «Entre dos aguas» (masmenos). Lo usan las salas online (server/routes/masmenos.js) y, copiado al
// cliente con `npm run sync:masmenos`, el modo «un solo dispositivo».
//
// Cada jugador tiene un turno: salen dos elementos con su cifra oculta y hay que elegir el que tiene más. Si aciertas,
// sale el elemento que más tiempo llevaba en la mesa y entra otro; la racha sigue hasta el primer fallo (o hasta que se
// acaba el tiempo). Gana quien consiga la racha más larga.

export const AJUSTES = { min: 1, max: 10, segEleccion: 30, msRevelar: 1800, msFallo: 2600, margen: 0.03 };
export const OPCIONES_VUELTAS = [1, 2, 3];

const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);
const nombre = (p, id) => jug(p, id)?.nombre ?? '¿?';
const turnoId = (p) => p.orden[p.turnoIdx] ?? null;

/** ¿Son tan parecidas que no es justo compararlas? */
const parecidas = (a, b) => a.nombre === b.nombre || Math.abs(a.valor - b.valor) <= AJUSTES.margen * Math.max(Math.abs(a.valor), Math.abs(b.valor));

/** Siguiente elemento del mazo que se pueda comparar con `otro` (los que no valen pasan al fondo). */
function robar(p, otro) {
  for (let k = 0; k < p.pool.length; k++) {
    const x = p.pool[p.cursor % p.pool.length];
    p.cursor += 1;
    if (!otro || !parecidas(x, otro)) return x;
  }
  return p.pool[p.cursor++ % p.pool.length];
}

function anotar(p, texto, tipo = 'info') {
  p.nlog += 1;
  p.log.push({ n: p.nlog, texto, tipo });
  if (p.log.length > 40) p.log.shift();
}

/**
 * pool: [{ nombre, detalle, valor, unidad }] ya barajado.
 * reglas: { categoria: { nombre, pregunta, emoji }, vueltas }
 */
export function crearPartida(jugadores, pool, reglas, ahora = Date.now()) {
  const ids = jugadores.map((j) => j.id);
  const vueltas = Math.max(1, reglas.vueltas || 1);
  const p = {
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, mejor: 0, rachas: [], fuera: false })),
    pool, cursor: 0, reglas, orden: Array.from({ length: vueltas }, () => ids).flat(), turnoIdx: 0,
    fase: 'turno', cartas: null, racha: 0, eleccion: null, hasta: null, ultimoTurno: null, log: [], nlog: 0, fin: null
  };
  void ahora;
  anotar(p, `Empieza ${nombre(p, turnoId(p))}.`);
  return p;
}

/** El jugador del turno está listo: salen las dos primeras cartas. */
export function listo(p, id, ahora = Date.now()) {
  if (p.fase !== 'turno') return { ok: false, error: 'Ahora no.' };
  if (id != null && id !== turnoId(p)) return { ok: false, error: 'No es tu turno.' };
  const a = robar(p, null);
  const b = robar(p, a);
  p.cartas = [{ item: a, edad: 0 }, { item: b, edad: 0 }];
  p.racha = 0;
  p.eleccion = null;
  p.fase = 'eligiendo';
  p.hasta = ahora + AJUSTES.segEleccion * 1000;
  return { ok: true };
}

export function elegir(p, id, lado, ahora = Date.now()) {
  if (p.fase !== 'eligiendo') return { ok: false, error: 'Ahora no se puede elegir.' };
  if (id != null && id !== turnoId(p)) return { ok: false, error: 'No es tu turno.' };
  if (lado !== 0 && lado !== 1) return { ok: false, error: 'Elige una de las dos.' };
  const [a, b] = p.cartas.map((c) => c.item.valor);
  const bien = lado === 0 ? a >= b : b >= a;
  p.eleccion = { lado, bien };
  p.fase = 'revelado';
  p.hasta = ahora + (bien ? AJUSTES.msRevelar : AJUSTES.msFallo);
  if (bien) p.racha += 1;
  return { ok: true, bien };
}

function terminarTurno(p, motivo) {
  const id = turnoId(p);
  const j = jug(p, id);
  if (j) {
    j.rachas.push(p.racha);
    j.mejor = Math.max(j.mejor, p.racha);
    j.puntos = j.mejor;
  }
  p.ultimoTurno = { jugadorId: id, racha: p.racha, motivo, cartas: p.cartas?.map((c) => c.item) ?? null };
  anotar(p, `${nombre(p, id)}: racha de ${p.racha}${motivo === 'tiempo' ? ' (se le acabó el tiempo)' : ''}.`, p.racha ? 'bueno' : 'malo');
  p.cartas = null;
  p.eleccion = null;
  p.hasta = null;
  do { p.turnoIdx += 1; } while (p.turnoIdx < p.orden.length && jug(p, turnoId(p))?.fuera);
  if (p.turnoIdx >= p.orden.length) finalizar(p);
  else p.fase = 'turno';
}

export function tick(p, ahora = Date.now()) {
  if (!p.hasta || ahora < p.hasta) return false;
  if (p.fase === 'eligiendo') { terminarTurno(p, 'tiempo'); return true; }
  if (p.fase === 'revelado') {
    if (!p.eleccion.bien) { terminarTurno(p, 'fallo'); return true; }
    // Sale la carta más antigua (en el primer acierto, la que no se eligió) y entra otra
    const [c0, c1] = p.cartas;
    const sale = c0.edad === c1.edad ? 1 - p.eleccion.lado : (c0.edad > c1.edad ? 0 : 1);
    const queda = p.cartas[1 - sale];
    queda.edad += 1;
    p.cartas[sale] = { item: robar(p, queda.item), edad: 0 };
    p.eleccion = null;
    p.fase = 'eligiendo';
    p.hasta = ahora + AJUSTES.segEleccion * 1000;
    return true;
  }
  return false;
}

function finalizar(p) {
  p.fase = 'fin';
  p.hasta = null;
  const orden = [...p.jugadores].sort((a, b) => (a.fuera - b.fuera) || (b.puntos - a.puntos));
  const max = Math.max(0, ...activos(p).map((j) => j.puntos));
  let puesto = 0;
  let previo = null;
  const tabla = orden.map((j, i) => {
    if (j.puntos !== previo) { puesto = i + 1; previo = j.puntos; }
    return { id: j.id, nombre: j.nombre, puntos: j.puntos, rachas: [...j.rachas], fuera: j.fuera, puesto: j.fuera ? null : puesto };
  });
  p.fin = { tabla, ganadores: max > 0 ? activos(p).filter((j) => j.puntos === max).map((j) => j.id) : [], max };
}

export function terminar(p) {
  if (p.fase === 'fin') return { ok: false, error: 'La partida ya ha terminado.' };
  finalizar(p);
  return { ok: true };
}

export function abandonar(p, id) {
  const j = jug(p, id);
  if (!j || j.fuera || p.fase === 'fin') return;
  j.fuera = true;
  anotar(p, `🚪 ${j.nombre} abandona la partida.`, 'malo');
  if (!activos(p).length) { finalizar(p); return; }
  if (turnoId(p) === id) {
    p.cartas = null; p.eleccion = null; p.hasta = null;
    do { p.turnoIdx += 1; } while (p.turnoIdx < p.orden.length && jug(p, turnoId(p))?.fuera);
    if (p.turnoIdx >= p.orden.length) finalizar(p);
    else p.fase = 'turno';
  }
}

const publica = (c, ver) => ({ nombre: c.item.nombre, detalle: c.item.detalle, unidad: c.item.unidad, valor: ver ? c.item.valor : null, nueva: c.edad === 0 });

/** Las cifras solo se ven al revelar. */
export function vistaDe(p, yoId) {
  const ver = p.fase === 'revelado';
  return {
    fase: p.fase,
    categoria: p.reglas.categoria,
    turno: turnoId(p),
    turnoN: p.turnoIdx + 1,
    turnos: p.orden.length,
    hasta: p.hasta,
    cartas: p.cartas ? p.cartas.map((c) => publica(c, ver)) : null,
    eleccion: p.eleccion,
    racha: p.racha,
    ultimoTurno: p.ultimoTurno,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, mejor: j.mejor, rachas: [...j.rachas], fuera: j.fuera })),
    log: p.log.slice(-10),
    fin: p.fin,
    yo: jug(p, yoId) ? { id: yoId } : null
  };
}
