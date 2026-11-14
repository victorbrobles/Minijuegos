// client/src/games/Patata/engine.js
// «La Patata Caliente»: motor puro (salas online en server/routes/patata.js y modo un dispositivo).
// Una bomba con mecha oculta pasa de mano en mano. Quien la tiene debe jugar cartas que cumplan la condición
// para pasarla: superar la cifra de la carta anterior (una carta o dos del mismo color sumadas), o jugar del color
// pedido. Las cartas especiales (invertir, saltar, dirigir, calentar, enfriar, color) se pueden jugar siempre.
// Si no puedes o no quieres, roba (y el tiempo corre). Cuando la mecha se acaba, quien tiene la bomba pierde una
// vida. Gana el último que quede en pie.
export const COLORES = ['rojo', 'azul', 'verde', 'amarillo'];
export const ESPECIALES = {
  invertir: { e: '🔄', nombre: 'Invertir', texto: 'Cambia el sentido y pasa la bomba.' },
  saltar: { e: '⏭️', nombre: 'Saltar', texto: 'La bomba se salta al siguiente jugador.' },
  dirigir: { e: '🎯', nombre: 'A dedo', texto: 'Eliges a quién le pasas la bomba.' },
  calentar: { e: '🌶️', nombre: 'Calentar', texto: 'La cifra a superar sube 4 (o pasa a ser 8).' },
  enfriar: { e: '🧊', nombre: 'Enfriar', texto: 'El siguiente puede jugar cualquier carta.' },
  color: { e: '🎨', nombre: 'Color', texto: 'Eliges el color que tendrá que jugar el siguiente.' }
};
export const OPCIONES_VIDAS = [2, 3, 4];
export const MANO = 5;
const MAX_MANO = 9;
const TOPE = 20;
const MECHA = [22000, 48000];
const barajar = (l) => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function mazoNuevo(p) {
  const cartas = [];
  for (const color of COLORES) for (let v = 1; v <= 12; v++) cartas.push({ tipo: 'numero', color, valor: v });
  for (const t of Object.keys(ESPECIALES)) for (let k = 0; k < 2; k++) cartas.push({ tipo: t });
  return barajar(cartas).map((c) => ({ ...c, uid: ++p.uid }));
}
function robarCarta(p) {
  if (!p.mazo.length) { p.mazo = barajar(p.descarte); p.descarte = []; }
  if (!p.mazo.length) p.mazo = mazoNuevo(p);
  return p.mazo.pop();
}

export function crearPartida(jugadores, items, reglas = {}, ahora = Date.now()) {
  const vidas = OPCIONES_VIDAS.includes(reglas.vidas) ? reglas.vidas : 3;
  const p = {
    fase: 'jugando', ronda: 1, rondas: null, uid: 0, sentido: 1, mazo: [], descarte: [], vidas,
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, vidas, mano: [], fuera: false, eliminado: false, eliminadoEn: null })),
    condicion: { tipo: 'libre' }, portador: null, mecha: 0, mechaTotal: 1, ultimoTick: ahora, pausa: false,
    log: [], explosion: null, fin: null
  };
  p.mazo = mazoNuevo(p);
  p.jugadores.forEach((j) => { while (j.mano.length < MANO) j.mano.push(robarCarta(p)); });
  nuevaRonda(p, p.jugadores[Math.floor(Math.random() * p.jugadores.length)].id, ahora);
  return p;
}
const vivos = (p) => p.jugadores.filter((j) => !j.fuera && !j.eliminado);
const jug = (p, id) => p.jugadores.find((j) => j.id === id);

function nuevaRonda(p, portador, ahora) {
  p.fase = 'jugando'; p.portador = portador; p.condicion = { tipo: 'libre' }; p.explosion = null;
  p.mecha = MECHA[0] + Math.random() * (MECHA[1] - MECHA[0]); p.mechaTotal = p.mecha; p.ultimoTick = ahora;
  vivos(p).forEach((j) => { while (j.mano.length < MANO) j.mano.push(robarCarta(p)); });
}

/** Siguiente jugador vivo en el sentido actual (saltando `saltos` jugadores). */
function siguiente(p, desde, saltos = 0) {
  const orden = p.jugadores.filter((j) => !j.fuera && !j.eliminado).map((j) => j.id);
  if (!orden.length) return null;
  let i = orden.indexOf(desde);
  if (i < 0) {
    // El portador ya no está: el siguiente en la lista original
    const todos = p.jugadores.map((j) => j.id); let k = todos.indexOf(desde);
    do { k = (k + p.sentido + todos.length) % todos.length; } while (!orden.includes(todos[k]));
    return todos[k];
  }
  for (let s = 0; s <= saltos; s++) i = (i + p.sentido + orden.length) % orden.length;
  return orden[i];
}

export function cumple(cond, cartas) {
  if (cartas.length === 1 && cartas[0].tipo !== 'numero') return true;
  if (!cartas.length || cartas.length > 2 || cartas.some((c) => c.tipo !== 'numero')) return false;
  if (cartas.length === 2 && cartas[0].color !== cartas[1].color) return false;
  const suma = cartas.reduce((a, c) => a + c.valor, 0);
  if (cond.tipo === 'superar') return suma > cond.valor;
  if (cond.tipo === 'color') return cartas.every((c) => c.color === cond.color);
  return true;
}

export function jugar(p, id, uids = [], params = {}, ahora = Date.now()) {
  if (p.fase !== 'jugando') return { ok: false, error: 'La bomba no está en juego.' };
  if (p.portador !== id) return { ok: false, error: 'No tienes la bomba.' };
  const j = jug(p, id);
  const cartas = uids.map((u) => j.mano.find((c) => c.uid === Number(u))).filter(Boolean);
  if (cartas.length !== uids.length || !cartas.length) return { ok: false, error: 'Elige una o dos cartas.' };
  if (!cumple(p.condicion, cartas)) return { ok: false, error: textoNoCumple(p.condicion) };
  let destino = null; let saltos = 0;
  const especial = cartas[0].tipo !== 'numero' ? cartas[0].tipo : null;
  if (especial === 'dirigir') {
    const d = jug(p, Number(params.destino));
    if (!d || d.id === id || d.fuera || d.eliminado) return { ok: false, error: 'Elige a quién le pasas la bomba.' };
    destino = d.id;
  }
  if (especial === 'color' && !COLORES.includes(params.color)) return { ok: false, error: 'Elige un color.' };
  j.mano = j.mano.filter((c) => !cartas.includes(c));
  p.descarte.push(...cartas);
  if (especial === 'invertir') p.sentido *= -1;
  if (especial === 'saltar') saltos = 1;
  if (especial === 'calentar') p.condicion = { tipo: 'superar', valor: Math.min(TOPE, p.condicion.tipo === 'superar' ? p.condicion.valor + 4 : 8) };
  if (especial === 'enfriar') p.condicion = { tipo: 'libre' };
  if (especial === 'color') p.condicion = { tipo: 'color', color: params.color };
  if (!especial) p.condicion = { tipo: 'superar', valor: Math.min(TOPE, cartas.reduce((a, c) => a + c.valor, 0)) };
  const a = destino ?? siguiente(p, id, saltos);
  p.portador = a;
  p.log.unshift({ de: id, a, cartas: cartas.map(({ tipo, color, valor }) => ({ tipo, color, valor })), condicion: p.condicion, t: ahora });
  p.log = p.log.slice(0, 8);
  // Si te quedas sin cartas, robas tres
  if (!j.mano.length) for (let k = 0; k < 3; k++) j.mano.push(robarCarta(p));
  return { ok: true };
}

export function robar(p, id) {
  if (p.fase !== 'jugando') return { ok: false, error: 'La bomba no está en juego.' };
  if (p.portador !== id) return { ok: false, error: 'No tienes la bomba.' };
  const j = jug(p, id);
  if (j.mano.length >= MAX_MANO) return { ok: false, error: `Ya tienes ${MAX_MANO} cartas: tienes que jugar.` };
  j.mano.push(robarCarta(p));
  return { ok: true };
}

const textoNoCumple = (c) => (c.tipo === 'superar' ? `Tienes que superar ${c.valor} (una carta o dos del mismo color sumadas), o jugar una especial.` : c.tipo === 'color' ? `Tienes que jugar ${c.color} (o una especial).` : 'Jugada no válida.');

function explotar(p, ahora) {
  const j = jug(p, p.portador);
  if (j) {
    j.vidas -= 1;
    if (j.vidas <= 0) { j.eliminado = true; j.eliminadoEn = ahora; }
  }
  p.explosion = { id: j?.id, nombre: j?.nombre, eliminado: Boolean(j?.eliminado), hasta: ahora + 4500 };
  p.fase = 'explosion';
  if (vivos(p).length <= 1) terminar(p);
}

export function tick(p, ahora = Date.now()) {
  if (p.fase === 'jugando') {
    if (!p.pausa) p.mecha -= Math.max(0, ahora - p.ultimoTick);
    p.ultimoTick = ahora;
    if (p.mecha <= 0) explotar(p, ahora);
  } else if (p.fase === 'explosion' && ahora >= p.explosion.hasta && !p.pausa) {
    const ex = p.explosion;
    const sig = jug(p, ex.id) && !jug(p, ex.id).eliminado ? siguiente(p, ex.id) : siguiente(p, ex.id);
    p.ronda += 1;
    nuevaRonda(p, sig, ahora);
  }
  p.ultimoTick = ahora;
}

/** En un solo móvil, mientras se pasa el móvil la mecha no corre. */
export function pausar(p, pausa, ahora = Date.now()) {
  if (p.fase === 'jugando' && !p.pausa) p.mecha -= Math.max(0, ahora - p.ultimoTick);
  p.ultimoTick = ahora; p.pausa = Boolean(pausa);
}

export function terminar(p) {
  const tabla = [...p.jugadores].map((j) => ({ id: j.id, nombre: j.nombre, puntos: Math.max(0, j.vidas), vidas: Math.max(0, j.vidas), fuera: j.fuera, t: j.eliminado ? j.eliminadoEn : Infinity }))
    .sort((a, b) => b.puntos - a.puntos || b.t - a.t);
  tabla.forEach((t, i) => { t.puesto = i + 1; });
  const ganadores = vivos(p).map((j) => j.id);
  p.fase = 'fin';
  p.fin = { tabla, max: Math.max(0, ...tabla.map((t) => t.puntos)), ganadores };
  return { ok: true };
}

export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id);
  if (!j) return;
  j.fuera = true;
  if (p.fase === 'fin') return;
  if (vivos(p).length <= 1) { terminar(p); return; }
  if (p.portador === id) p.portador = siguiente(p, id);
  p.ultimoTick = ahora;
}

export function accion(p, id, d, ahora = Date.now()) {
  switch (d.tipo) {
    case 'jugar': return jugar(p, id, Array.isArray(d.cartas) ? d.cartas.slice(0, 2) : [], { destino: d.destino, color: d.color }, ahora);
    case 'robar': return robar(p, id);
    default: return null;
  }
}
export const forzar = () => ({ ok: true });

/** En un solo móvil, la mano del portador es privada. */
export function turnoLocal(p) { return p.fase === 'jugando' ? p.portador : null; }

/** Nivel de nervios de la mecha (sin decir cuánto queda): 0 tranquila, 1 caliente, 2 a punto. */
const nervios = (p) => (p.mecha / p.mechaTotal < 0.25 ? 2 : p.mecha / p.mechaTotal < 0.55 ? 1 : 0);

export function vistaDe(p, id) {
  const yo = jug(p, id);
  return {
    fase: p.fase, ronda: p.ronda, rondas: null, sentido: p.sentido, condicion: p.condicion, portador: p.portador, nervios: nervios(p), maxVidas: p.vidas,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: Math.max(0, j.vidas), vidas: Math.max(0, j.vidas), cartas: j.mano.length, eliminado: j.eliminado, fuera: j.fuera })),
    yo: yo ? { id: yo.id, mano: yo.mano, vidas: yo.vidas, eliminado: yo.eliminado } : null,
    log: p.log, explosion: p.explosion, fin: p.fin
  };
}
