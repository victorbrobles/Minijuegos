// client/src/games/Piramides/engine.js
// «Pirámides futbolísticas»: motor puro (salas online en server/routes/piramides.js y modo un dispositivo).
// Cada jugador tiene una categoría secreta («Ha ganado la Champions», «Es zurdo»…) que puede consultar cuando quiera.
// Turno de un jugador:
//   1. Si quiere, intenta adivinar la categoría de UN rival (solo hay un intento por rival en toda la partida):
//      acierto → el rival queda eliminado y sumas 2; fallo → −1 y todos ven que no era esa.
//   2. Cada rival vivo le dice un futbolista; él lo apunta y dice (honradamente) si encaja o no en SU categoría.
//      Cuando ha apuntado uno de cada rival, pasa el turno.
// Final: el último en pie suma 2·N (N = jugadores al empezar), el siguiente 2·N − 1, y así sucesivamente.
// Si se acaban las vueltas o nadie puede adivinar ya, los que siguen vivos comparten el primer puesto.
import { CATEGORIAS, categoria } from './categorias.js';

export const OPCIONES_VUELTAS = [5, 8, 12];
const barajar = (l) => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export function crearPartida(jugadores, items, reglas = {}, ahora = Date.now()) {
  const vueltas = OPCIONES_VUELTAS.includes(reglas.vueltas) ? reglas.vueltas : 8;
  const cats = barajar(CATEGORIAS).slice(0, jugadores.length);
  const p = {
    fase: 'ver', ronda: 1, rondas: vueltas, n: jugadores.length, turno: 0, paso: 'adivinar', dichos: [], eliminados: 0, log: [],
    jugadores: jugadores.map((j, i) => ({
      id: j.id, nombre: j.nombre, categoria: cats[i].id, puntos: 0, eliminado: false, eliminadoEn: null, eliminadoPor: null,
      intentos: {}, descartes: [], tablero: [], listo: false, fuera: false
    })),
    fin: null, creada: ahora
  };
  p.turno = Math.floor(Math.random() * p.jugadores.length);
  return p;
}

const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const enJuego = (p) => p.jugadores.filter((j) => !j.fuera && !j.eliminado);
const actual = (p) => p.jugadores[p.turno];
/** Rivales vivos a los que `j` todavía puede intentar adivinar. */
const objetivos = (p, j) => enJuego(p).filter((o) => o.id !== j.id && !j.intentos[o.id]);

export function visto(p, id) {
  if (p.fase !== 'ver') return { ok: false, error: 'Ya ha empezado.' };
  if (id == null) p.jugadores.forEach((j) => { j.listo = true; }); else { const j = jug(p, id); if (j) j.listo = true; }
  if (p.jugadores.filter((j) => !j.fuera).every((j) => j.listo)) { p.fase = 'turno'; empezarTurno(p); }
  return { ok: true };
}

function empezarTurno(p) {
  p.dichos = [];
  // Si no puede adivinar a nadie, va directo a apuntar futbolistas
  p.paso = objetivos(p, actual(p)).length ? 'adivinar' : 'apuntar';
}

export function adivinar(p, id, objetivo, catId) {
  if (p.fase !== 'turno' || p.paso !== 'adivinar') return { ok: false, error: 'Ahora no se puede adivinar.' };
  const a = actual(p);
  if (id !== a.id) return { ok: false, error: `Es el turno de ${a.nombre}.` };
  const o = jug(p, Number(objetivo));
  if (!o || o.id === a.id || o.eliminado || o.fuera) return { ok: false, error: 'Elige a un rival que siga en juego.' };
  if (a.intentos[o.id]) return { ok: false, error: `Ya gastaste tu intento con ${o.nombre}.` };
  const c = categoria(catId);
  if (!c) return { ok: false, error: 'Categoría desconocida.' };
  a.intentos[o.id] = catId;
  const acierta = o.categoria === catId;
  if (acierta) {
    a.puntos += 2;
    p.eliminados += 1;
    Object.assign(o, { eliminado: true, eliminadoEn: p.eliminados, eliminadoPor: a.id });
  } else {
    a.puntos -= 1;
    o.descartes.push(c.texto);
  }
  p.ultimo = { tipo: 'adivina', de: a.id, a: o.id, categoria: c.texto, acierta };
  p.log.unshift(p.ultimo);
  if (enJuego(p).length <= 1) { terminar(p); return { ok: true, acierta }; }
  p.paso = 'apuntar';
  return { ok: true, acierta };
}

export function noAdivinar(p, id) {
  if (p.fase !== 'turno' || p.paso !== 'adivinar') return { ok: false, error: 'Ahora no.' };
  if (id !== actual(p).id) return { ok: false, error: 'No es tu turno.' };
  p.paso = 'apuntar';
  return { ok: true };
}

/** El jugador del turno apunta el futbolista que le ha dicho `por` y si encaja en su categoría. */
export function apuntar(p, id, por, futbolista, encaja) {
  if (p.fase !== 'turno' || p.paso !== 'apuntar') return { ok: false, error: 'Ahora no se apuntan futbolistas.' };
  const a = actual(p);
  if (id !== a.id) return { ok: false, error: `Es el turno de ${a.nombre}.` };
  const quien = jug(p, Number(por));
  if (!quien || quien.id === a.id || quien.eliminado || quien.fuera) return { ok: false, error: 'Ese jugador no puede decir futbolista.' };
  if (p.dichos.includes(quien.id)) return { ok: false, error: `${quien.nombre} ya ha dicho su futbolista.` };
  const nombre = String(futbolista ?? '').trim().slice(0, 40);
  if (!nombre) return { ok: false, error: 'Escribe el futbolista.' };
  if (a.tablero.some((t) => t.futbolista.toLowerCase() === nombre.toLowerCase())) return { ok: false, error: `${nombre} ya está apuntado en tu pirámide.` };
  a.tablero.push({ futbolista: nombre, encaja: Boolean(encaja), por: quien.id, ronda: p.ronda });
  p.dichos.push(quien.id);
  p.ultimo = { tipo: 'apunta', de: a.id, por: quien.id, futbolista: nombre, encaja: Boolean(encaja) };
  if (enJuego(p).filter((j) => j.id !== a.id).every((j) => p.dichos.includes(j.id))) avanzar(p);
  return { ok: true };
}

/** Deshacer el último futbolista apuntado en este turno (por si te equivocas al tocar). */
export function deshacer(p, id) {
  if (p.fase !== 'turno' || p.paso !== 'apuntar' || id !== actual(p).id || !p.dichos.length) return { ok: false, error: 'No hay nada que deshacer.' };
  const a = actual(p);
  const por = p.dichos.pop();
  const i = a.tablero.map((t) => t.por === por && t.ronda === p.ronda).lastIndexOf(true);
  if (i >= 0) a.tablero.splice(i, 1);
  return { ok: true };
}

function avanzar(p) {
  const vivos = enJuego(p);
  if (vivos.length <= 1) { terminar(p); return; }
  // Si ya nadie puede adivinar a nadie, no se puede eliminar a nadie más: se acaba
  if (vivos.every((j) => !objetivos(p, j).length)) { terminar(p); return; }
  let n = p.turno;
  do {
    n = (n + 1) % p.jugadores.length;
    if (n === 0) p.ronda += 1;
  } while (p.jugadores[n].eliminado || p.jugadores[n].fuera);
  if (p.ronda > p.rondas) { terminar(p); return; }
  p.turno = n;
  empezarTurno(p);
}

export function terminar(p) {
  const N = p.n;
  const vivos = enJuego(p);
  const caidos = p.jugadores.filter((j) => j.eliminado && !j.fuera).sort((a, b) => b.eliminadoEn - a.eliminadoEn);
  const posicion = {};
  vivos.forEach((j) => { posicion[j.id] = 1; });
  caidos.forEach((j, i) => { posicion[j.id] = vivos.length + i + 1; });
  const tabla = p.jugadores.map((j) => {
    const pos = posicion[j.id];
    const supervivencia = pos ? 2 * N - (pos - 1) : 0;
    return { id: j.id, nombre: j.nombre, puntos: j.puntos + supervivencia, aciertos: j.puntos, supervivencia, categoria: categoria(j.categoria).texto, eliminado: j.eliminado, fuera: j.fuera };
  }).sort((a, b) => b.puntos - a.puntos);
  let puesto = 0; let previo = null;
  tabla.forEach((t, i) => { if (t.puntos !== previo) { puesto = i + 1; previo = t.puntos; } t.puesto = puesto; });
  const max = Math.max(...tabla.filter((t) => !t.fuera).map((t) => t.puntos));
  p.fase = 'fin';
  p.fin = { tabla, max, ganadores: tabla.filter((t) => !t.fuera && t.puntos === max).map((t) => t.id) };
  return { ok: true };
}

/** El anfitrión no espera más: se empieza (fase de ver) o se pasa el turno. */
export function forzar(p) {
  if (p.fase === 'ver') visto(p, null);
  else if (p.fase === 'turno') avanzar(p);
  return { ok: true };
}

export function abandonar(p, id) {
  const j = jug(p, id);
  if (!j || p.fase === 'fin') return;
  const eraSuTurno = p.fase === 'turno' && actual(p).id === id;
  j.fuera = true;
  if (enJuego(p).length <= 1) { terminar(p); return; }
  if (p.fase === 'ver' && p.jugadores.filter((x) => !x.fuera).every((x) => x.listo)) { p.fase = 'turno'; if (actual(p).fuera) avanzar(p); else empezarTurno(p); return; }
  if (eraSuTurno) { avanzar(p); return; }
  if (p.fase === 'turno' && p.paso === 'apuntar' && enJuego(p).filter((x) => x.id !== actual(p).id).every((x) => p.dichos.includes(x.id))) avanzar(p);
}

export function tick() {}

export function accion(p, id, d) {
  // En un solo móvil (id null) actúa quien tiene el turno
  const actor = id ?? (p.fase === 'turno' ? actual(p).id : null);
  switch (d.tipo) {
    case 'visto': return visto(p, id);
    case 'adivinar': return adivinar(p, actor, d.objetivo, String(d.categoria ?? ''));
    case 'noAdivinar': return noAdivinar(p, actor);
    case 'apuntar': return apuntar(p, actor, d.por, d.futbolista, d.encaja);
    case 'deshacer': return deshacer(p, actor);
    default: return null;
  }
}

/** En un solo móvil: al principio cada uno mira su categoría en privado; luego se juega a la vista de todos. */
export function turnoLocal(p) {
  return p.fase === 'ver' ? p.jugadores.find((j) => !j.listo && !j.fuera)?.id ?? null : null;
}

export function vistaDe(p, id) {
  const yo = jug(p, id);
  const fin = p.fase === 'fin';
  const act = p.fase === 'turno' ? actual(p) : null;
  return {
    fase: p.fase, ronda: Math.min(p.ronda, p.rondas), rondas: p.rondas, n: p.n, paso: p.paso, dichos: p.dichos,
    turno: act?.id ?? null,
    jugadores: p.jugadores.map((j) => ({
      id: j.id, nombre: j.nombre, puntos: j.puntos, listo: j.listo, fuera: j.fuera, eliminado: j.eliminado, eliminadoPor: j.eliminadoPor,
      tablero: j.tablero, descartes: j.descartes, intentos: j.intentos,
      categoria: j.eliminado || fin ? categoria(j.categoria).texto : null
    })),
    yo: yo ? { id: yo.id, categoria: categoria(yo.categoria).texto, listo: yo.listo, eliminado: yo.eliminado } : null,
    // Un solo móvil: quien tiene el turno puede consultar su categoría (manteniendo pulsado)
    categoriaTurno: id === -1 && act ? categoria(act.categoria).texto : null,
    ultimo: p.ultimo, log: p.log.slice(0, 8), fin: p.fin
  };
}
