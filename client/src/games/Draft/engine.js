// client/src/games/Draft/engine.js
// «El Draft de Estrellas»: motor puro (salas online en server/routes/draft.js y modo un móvil).
// Cada ronda sale una CATEGORÍA y un CRITERIO claros desde el principio (por ejemplo: futbolistas · los más altos) y
// una lista de famosos con sus datos ocultos. Online, todos fichan a la vez: el más rápido se lo queda y ya nadie más
// puede ficharlo. Cada uno ficha 4. Cuando todos tienen sus 4 (o se acaba el tiempo) se desvelan los datos, se suman
// y cada jugador gana un punto por cada rival al que supera. En un solo móvil se ficha por turnos (en serpiente).
// Comodines, una vez por partida cada uno: 🦹 robar un famoso a un rival, 🔁 cambiar uno de los tuyos por otro
// y 👁️ chivato (ver el dato de un famoso antes de ficharlo).
import { CATEGORIAS, FAMOSOS } from './famosos.js';

export const OPCIONES_RONDAS = [3, 5, 7];
export const POR_JUGADOR = 4;
export const SEG_DRAFT = 75;   // online: tiempo de la ronda para fichar los 4
export const SEG_TURNO = 30;   // un móvil: tiempo de cada turno
export const SEG_REVELAR = 15;
export const EXTRAS = {
  robar: { emoji: '🦹', nombre: 'Robar', texto: 'Quítale un famoso a un rival y pásalo a tu equipo.' },
  cambiar: { emoji: '🔁', nombre: 'Cambiar', texto: 'Devuelve uno de los tuyos a la lista para fichar otro.' },
  chivato: { emoji: '👁️', nombre: 'Chivato', texto: 'Mira el dato de un famoso antes de ficharlo.' }
};

const anio = (f) => (f.a < 0 ? `${-f.a} a. C.` : String(f.a));
export const CRITERIOS = {
  antes: { nombre: 'Los que nacieron ANTES', corto: 'nacieron antes', emoji: '📜', valor: (f) => f.a, mejor: -1, dato: anio, unidad: 'suma de años de nacimiento' },
  despues: { nombre: 'Los que nacieron DESPUÉS', corto: 'nacieron después', emoji: '🍼', valor: (f) => f.a, mejor: 1, dato: anio, unidad: 'suma de años de nacimiento' },
  alto: { nombre: 'Los más ALTOS', corto: 'más altos', emoji: '📏', valor: (f) => f.h, mejor: 1, dato: (f) => `${f.h} cm`, unidad: 'cm sumados', altura: true },
  bajo: { nombre: 'Los más BAJITOS', corto: 'más bajitos', emoji: '🐭', valor: (f) => f.h, mejor: -1, dato: (f) => `${f.h} cm`, unidad: 'cm sumados', altura: true }
};

const barajar = (l) => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);
const libres = (p) => p.pool.map((f, i) => (f.de == null ? i : -1)).filter((i) => i >= 0);
const completo = (j) => j.equipo.length >= POR_JUGADOR;

export function crearPartida(jugadores, items = [], reglas = {}, ahora = Date.now()) {
  const rondas = OPCIONES_RONDAS.includes(Number(reglas.rondas)) ? Number(reglas.rondas) : 5;
  const p = {
    fase: 'draft', ronda: 0, rondas, local: Boolean(reglas.local), rondasJugadas: [], pool: [], categoria: null, criterio: null,
    orden: [], turno: 0, limite: 0,
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, equipo: [], fuera: false, usados: {}, vistos: [] })),
    resultado: null, historial: [], ultimo: null, fin: null
  };
  nuevaRonda(p, ahora);
  return p;
}

function nuevaRonda(p, ahora) {
  p.ronda += 1;
  // Categoría y criterio: que no se repita la misma combinación y que no salga la misma categoría dos veces seguidas
  const previa = p.rondasJugadas[p.rondasJugadas.length - 1];
  const combinaciones = [];
  Object.keys(CATEGORIAS).forEach((c) => {
    const conAltura = FAMOSOS.filter((f) => f.c === c).every((f) => f.h);
    Object.keys(CRITERIOS).forEach((k) => { if (conAltura || !CRITERIOS[k].altura) combinaciones.push([c, k]); });
  });
  const nuevas = combinaciones.filter(([c, k]) => c !== previa?.[0] && !p.rondasJugadas.some(([c2, k2]) => c2 === c && k2 === k));
  const [cat, crit] = barajar(nuevas.length ? nuevas : combinaciones)[0];
  p.rondasJugadas.push([cat, crit]);
  p.categoria = cat; p.criterio = crit;
  const n = activos(p).length;
  const todos = FAMOSOS.filter((f) => f.c === cat);
  const tam = Math.min(todos.length, Math.max(20, n * POR_JUGADOR + 10));
  p.pool = barajar(todos).slice(0, tam).map((f) => ({ ...f, de: null }));
  p.jugadores.forEach((j) => { j.equipo = []; j.vistos = []; });
  p.fase = 'draft'; p.resultado = null; p.ultimo = null;
  if (p.local) {
    // Turnos en serpiente; quien empieza rota cada ronda
    const ids = activos(p).map((j) => j.id);
    const k = (p.ronda - 1) % ids.length;
    const base = [...ids.slice(k), ...ids.slice(0, k)];
    p.orden = [];
    for (let r = 0; r < POR_JUGADOR; r++) p.orden.push(...(r % 2 ? [...base].reverse() : base));
    p.turno = 0;
    p.limite = ahora + SEG_TURNO * 1000;
  } else {
    p.orden = []; p.turno = 0;
    p.limite = ahora + SEG_DRAFT * 1000;
  }
}

/** A quién le toca (solo en un móvil; online fichan todos a la vez). */
export const turnoDe = (p) => (p.local && p.fase === 'draft' ? p.orden[p.turno] ?? null : null);

function puedeActuar(p, id) {
  if (p.fase !== 'draft') return 'Ahora no se ficha.';
  const j = jug(p, id);
  if (!j || j.fuera) return 'No estás en la partida.';
  if (p.local && turnoDe(p) !== id) return 'No es tu turno.';
  return null;
}

/** Tras un fichaje (o un robo) en un móvil, pasa el turno al siguiente que aún tenga hueco. */
function avanzarTurno(p, ahora) {
  if (!p.local) return;
  p.turno += 1;
  while (p.turno < p.orden.length && (completo(jug(p, p.orden[p.turno])) || jug(p, p.orden[p.turno]).fuera)) p.turno += 1;
  // Alguien con hueco (por un robo) y sin turnos por delante: se le añade uno al final
  if (p.turno >= p.orden.length) {
    const pendiente = activos(p).find((j) => !completo(j));
    if (pendiente) p.orden.push(pendiente.id);
  }
  p.limite = ahora + SEG_TURNO * 1000;
}

function comprobarFin(p, ahora) {
  if (activos(p).every(completo)) revelar(p, ahora);
}

export function fichar(p, id, idx, ahora = Date.now()) {
  const e = puedeActuar(p, id); if (e) return { ok: false, error: e };
  const j = jug(p, id);
  if (completo(j)) return { ok: false, error: `Ya tienes tus ${POR_JUGADOR} famosos.` };
  const f = p.pool[Number(idx)];
  if (!f) return { ok: false, error: 'Ese famoso no está en la lista.' };
  if (f.de != null) return { ok: false, error: f.de === id ? 'Ya es tuyo.' : `¡Demasiado tarde! Ya es de ${jug(p, f.de)?.nombre}.` };
  f.de = id; j.equipo.push(Number(idx));
  p.ultimo = { tipo: 'fichar', id, idx: Number(idx), t: ahora };
  avanzarTurno(p, ahora);
  comprobarFin(p, ahora);
  return { ok: true };
}

export function robar(p, id, idx, ahora = Date.now()) {
  const e = puedeActuar(p, id); if (e) return { ok: false, error: e };
  const j = jug(p, id);
  if (j.usados.robar) return { ok: false, error: 'Ya has robado en esta partida.' };
  if (completo(j)) return { ok: false, error: 'Necesitas un hueco libre para robar (usa antes «Cambiar»).' };
  const f = p.pool[Number(idx)];
  if (!f || f.de == null || f.de === id) return { ok: false, error: 'Elige un famoso de otro jugador.' };
  const victima = jug(p, f.de);
  victima.equipo = victima.equipo.filter((i) => i !== Number(idx));
  f.de = id; j.equipo.push(Number(idx)); j.usados.robar = true;
  p.ultimo = { tipo: 'robar', id, victima: victima.id, idx: Number(idx), t: ahora };
  if (p.local) {
    // La víctima recupera un turno para rellenar el hueco
    p.orden.splice(p.turno + 1, 0, victima.id);
    avanzarTurno(p, ahora);
  } else if (p.limite - ahora < 15000) p.limite = ahora + 15000; // le da tiempo a la víctima a fichar otro
  comprobarFin(p, ahora);
  return { ok: true };
}

export function cambiar(p, id, idx, ahora = Date.now()) {
  const e = puedeActuar(p, id); if (e) return { ok: false, error: e };
  const j = jug(p, id);
  if (j.usados.cambiar) return { ok: false, error: 'Ya has cambiado en esta partida.' };
  const f = p.pool[Number(idx)];
  if (!f || f.de !== id) return { ok: false, error: 'Elige uno de tus famosos.' };
  f.de = null; j.equipo = j.equipo.filter((i) => i !== Number(idx)); j.usados.cambiar = true;
  p.ultimo = { tipo: 'cambiar', id, idx: Number(idx), t: ahora };
  if (p.local) { p.orden.splice(p.turno, 0, id); p.limite = ahora + SEG_TURNO * 1000; }
  return { ok: true };
}

export function chivato(p, id, idx, ahora = Date.now()) {
  const e = puedeActuar(p, id); if (e) return { ok: false, error: e };
  const j = jug(p, id);
  if (j.usados.chivato) return { ok: false, error: 'Ya has usado el chivato en esta partida.' };
  const f = p.pool[Number(idx)];
  if (!f) return { ok: false, error: 'Ese famoso no está en la lista.' };
  j.vistos.push(Number(idx)); j.usados.chivato = true;
  if (p.local) p.limite = Math.max(p.limite, ahora + 10000);
  return { ok: true };
}

function revelar(p, ahora) {
  const cr = CRITERIOS[p.criterio];
  const sumas = activos(p).map((j) => ({ id: j.id, suma: j.equipo.reduce((s, i) => s + cr.valor(p.pool[i]), 0) }));
  const puntos = {};
  sumas.forEach((a) => { puntos[a.id] = sumas.filter((b) => b.id !== a.id && (a.suma - b.suma) * cr.mejor > 0).length; });
  Object.entries(puntos).forEach(([id, n]) => { jug(p, Number(id)).puntos += n; });
  // El mejor famoso de la lista para este criterio (para enseñar «el que se os escapó»)
  const mejor = p.pool.map((f, i) => i).sort((a, b) => (cr.valor(p.pool[b]) - cr.valor(p.pool[a])) * cr.mejor)[0];
  p.resultado = { criterio: p.criterio, sumas, puntos, mejor };
  p.historial.push({ ronda: p.ronda, categoria: p.categoria, criterio: p.criterio, puntos });
  p.fase = 'revelar'; p.limite = ahora + SEG_REVELAR * 1000;
}

/** Se acaba el tiempo de fichar: los huecos que queden se rellenan al azar. */
function rellenar(p, ahora) {
  activos(p).forEach((j) => {
    while (!completo(j)) {
      const l = libres(p); if (!l.length) break;
      const i = l[Math.floor(Math.random() * l.length)];
      p.pool[i].de = j.id; j.equipo.push(i);
    }
  });
  revelar(p, ahora);
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
    if (p.local) {
      // Se le acaba el turno: ficha al azar
      const l = libres(p);
      if (l.length) fichar(p, turnoDe(p), l[Math.floor(Math.random() * l.length)], ahora); else rellenar(p, ahora);
    } else rellenar(p, ahora);
  } else if (p.fase === 'revelar' && ahora > p.limite) {
    if (p.ronda >= p.rondas || activos(p).length < 2) terminar(p);
    else nuevaRonda(p, ahora);
  }
}
export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id); if (!j || p.fase === 'fin') return;
  j.fuera = true;
  j.equipo.forEach((i) => { p.pool[i].de = null; });
  j.equipo = [];
  if (activos(p).length < 2) { terminar(p); return; }
  if (p.fase === 'draft') {
    if (p.local) {
      p.orden = [...p.orden.slice(0, p.turno), ...p.orden.slice(p.turno).filter((x) => x !== id)];
      if (p.turno >= p.orden.length) avanzarTurno(p, ahora);
    }
    comprobarFin(p, ahora);
  }
}
export function accion(p, idRaw, d, ahora = Date.now()) {
  // En un móvil la pantalla es común: actúa quien tiene el turno
  const id = p.local && (idRaw == null || idRaw < 0) ? turnoDe(p) : idRaw;
  if (d.tipo === 'fichar') return fichar(p, id, d.idx, ahora);
  if (d.tipo === 'robar') return robar(p, id, d.idx, ahora);
  if (d.tipo === 'cambiar') return cambiar(p, id, d.idx, ahora);
  if (d.tipo === 'chivato') return chivato(p, id, d.idx, ahora);
  return null;
}
export function forzar(p, ahora = Date.now()) { p.limite = 0; tick(p, ahora); return { ok: true }; }
// En un móvil todos ven la misma mesa (los datos están ocultos para todos): no hace falta pasar el móvil en privado
export const turnoLocal = () => null;

export function vistaDe(p, id, ahora = Date.now()) {
  const yo = jug(p, id);
  const revelado = p.fase !== 'draft';
  // En un móvil, lo que ha visto con el chivato quien tiene el turno
  const quien = p.local ? jug(p, turnoDe(p)) : yo;
  const vistos = new Set(quien?.vistos || []);
  return {
    fase: p.fase, ronda: p.ronda, rondas: p.rondas, local: p.local, categoria: p.categoria, criterio: p.criterio,
    turno: turnoDe(p), porJugador: POR_JUGADOR, limite: p.limite, ahora,
    pool: p.pool.map((f, i) => ({ n: f.n, de: f.de, ...(revelado || vistos.has(i) ? { dato: CRITERIOS[p.criterio].dato(f), visto: !revelado } : {}) })),
    resultado: p.resultado, ultimo: p.ultimo,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, equipo: j.equipo, fuera: j.fuera, usados: j.usados })),
    yo: yo ? { id: yo.id } : null, fin: p.fin
  };
}
