// server/oncefantasma/engine.js
// «El Once Fantasma»: motor puro (sin red). Se copia al cliente con `npm run sync:oncefantasma`.
//
// Cada partido histórico tiene sus dos onces titulares. Por turnos, a cada jugador le toca reconstruir UN once
// (los dos onces de un partido van a jugadores seguidos). Durante su turno solo él puede adivinar: cada acierto
// destapa una pista de otro compañero y el reloj va destapando más. Si se le acaba el tiempo o se planta con
// huecos sin descubrir, hay REBOTE: los demás pueden adivinar los que faltan (valen menos).

export const AJUSTES = { min: 1, max: 12, puntosNivel: [10, 7, 5, 3], puntosRebote: [5, 4, 3, 2], segPista: 20, segRebote: 40, esperaFallo: 1500, bonusPleno: 5 };
export const OPCIONES = { onces: [2, 3, 4], segundos: [120, 180, 240] };
export const NIVELES = ['Posición y dorsal', 'Club o país', 'Trayectoria', 'Iniciales'];
export const POSICIONES = { POR: 'Portero', DEF: 'Defensa', MED: 'Centrocampista', DEL: 'Delantero' };

const base = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
function lev(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 9;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
  }
  return d[a.length][b.length];
}
/** ¿El texto nombra a este futbolista? Vale el nombre completo, el apellido o el alias; se perdonan erratas pequeñas. */
export function esJugador(texto, j) {
  const t = base(texto).replace(/ /g, '');
  if (t.length < 3) return false;
  const opciones = [j.nombre, ...(j.alias || [])].map((x) => base(x).replace(/ /g, ''));
  return opciones.some((o) => o === t || (o.length >= 8 && lev(o, t) <= 2) || (o.length >= 5 && lev(o, t) <= 1));
}
const iniciales = (n) => n.split(/\s+/).map((p) => `${p[0].toUpperCase()}.`).join(' ');
const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);

/** partidos: lista ya barajada de { partido, onces: [2] }. reglas: { onces (por jugador), segundos (por turno) } */
export function crearPartida(jugadores, partidos, reglas = {}, ahora = Date.now(), rng = Math.random) {
  const n = jugadores.length;
  const k = OPCIONES.onces.includes(Number(reglas.onces)) ? Number(reglas.onces) : 3;
  // Todos juegan el mismo número de onces: si no hay partidos para todos, se recorta por igual
  const total = Math.max(Math.min(n, partidos.length * 2), Math.floor(Math.min(n * k, partidos.length * 2) / n) * n);
  // Turno t: partido ⌊t/2⌋, once t%2, jugador t%n (los dos onces de un partido, a jugadores seguidos)
  const turnos = Array.from({ length: total }, (_, t) => {
    const m = partidos[Math.floor(t / 2)];
    return { jugador: jugadores[t % n].id, partido: m.partido, ...m.onces[t % 2], lado: t % 2 };
  });
  const p = {
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, aciertos: 0, rebotes: 0, plenos: 0, fuera: false })),
    turnos, ronda: 0, rondas: turnos.length, segundos: Number(reglas.segundos) || 180, sinReloj: Boolean(reglas.sinReloj),
    fase: 'turno', hasta: null, proximaPista: null, huecos: [], esperas: {}, ultimos: {}, pasados: [], registro: [], sumas: {}, motivo: null, fin: null
  };
  empezarTurno(p, ahora, rng);
  return p;
}
const turnoActual = (p) => p.turnos[p.ronda - 1];

function empezarTurno(p, ahora, rng = Math.random) {
  p.ronda += 1;
  // Si el jugador de este turno se ha ido, se salta
  while (p.ronda <= p.rondas && jug(p, turnoActual(p).jugador)?.fuera) p.ronda += 1;
  if (p.ronda > p.rondas) { terminar(p); return; }
  p.huecos = turnoActual(p).jugadores.map((j) => ({ ...j, nivel: 0, por: null, puntos: 0, rebote: false }));
  // Dos huecos empiezan con una pista extra para tener por dónde tirar
  [...p.huecos.keys()].sort(() => rng() - 0.5).slice(0, 2).forEach((i) => { p.huecos[i].nivel = 1; });
  p.fase = 'turno';
  p.hasta = p.sinReloj ? null : ahora + p.segundos * 1000;
  p.proximaPista = ahora + AJUSTES.segPista * 1000;
  p.esperas = {};
  p.ultimos = {};
  p.pasados = [];
  p.registro = [];
  p.sumas = {};
  p.motivo = null;
}

/** Sube un nivel de pista en un hueco oculto (el de menos pistas, al azar entre empatados). */
function destapar(p, rng = Math.random, salvo = -1) {
  const libres = p.huecos.map((h, i) => [h, i]).filter(([h, i]) => !h.por && h.nivel < NIVELES.length - 1 && i !== salvo);
  if (!libres.length) return null;
  const min = Math.min(...libres.map(([h]) => h.nivel));
  const cand = libres.filter(([h]) => h.nivel === min);
  const [h, i] = cand[Math.floor(rng() * cand.length)];
  h.nivel += 1;
  return i;
}
const quedan = (p) => p.huecos.filter((h) => !h.por).length;
const sumar = (p, j, n) => { j.puntos += n; p.sumas[j.id] = (p.sumas[j.id] || 0) + n; };

/** ¿Puede este jugador adivinar ahora? En su turno solo él; en el rebote, todos menos él. */
export function puedeAdivinar(p, id) {
  const j = jug(p, id);
  if (!j || j.fuera) return false;
  const delTurno = turnoActual(p)?.jugador === id;
  if (p.fase === 'turno') return delTurno;
  if (p.fase === 'rebote') return !delTurno && !p.pasados.includes(id);
  return false;
}

/** Fin del turno del jugador: rebote si quedan huecos; si no, resultado (y bonus por once completo). */
function cerrarTurno(p, ahora, motivo) {
  const t = turnoActual(p);
  if (!quedan(p)) {
    const j = jug(p, t.jugador);
    if (j && p.huecos.every((h) => h.por === t.jugador)) { sumar(p, j, AJUSTES.bonusPleno); j.plenos += 1; p.motivo = 'pleno'; } else p.motivo = 'completo';
    p.fase = 'resultado';
    p.hasta = null;
    p.proximaPista = null;
    return;
  }
  const rivales = activos(p).filter((j) => j.id !== t.jugador);
  if (!rivales.length) { p.fase = 'resultado'; p.motivo = motivo; p.hasta = null; p.proximaPista = null; return; }
  p.fase = 'rebote';
  p.motivo = motivo;
  p.pasados = [];
  p.esperas = {};
  p.hasta = p.sinReloj ? null : ahora + AJUSTES.segRebote * 1000;
  p.proximaPista = null;
}
function cerrarRebote(p) {
  p.fase = 'resultado';
  p.hasta = null;
  p.proximaPista = null;
}

/** Un jugador escribe un nombre. */
export function adivinar(p, id, texto, ahora = Date.now(), rng = Math.random) {
  const j = jug(p, id);
  if (!j || j.fuera) return { ok: false, error: 'No estás en la partida.' };
  if (p.fase !== 'turno' && p.fase !== 'rebote') return { ok: false, error: 'Ahora no se puede adivinar.' };
  if (!puedeAdivinar(p, id)) return { ok: false, error: p.fase === 'turno' ? `Es el turno de ${jug(p, turnoActual(p).jugador)?.nombre}.` : 'En el rebote juegan los demás.' };
  if ((p.esperas[id] || 0) > ahora) return { ok: false, error: 'Espera un momento antes de volver a probar.' };
  const limpio = String(texto || '').trim().slice(0, 40);
  if (!limpio) return { ok: false, error: 'Escribe un nombre.' };
  const i = p.huecos.findIndex((h) => !h.por && esJugador(limpio, h));
  if (i < 0) {
    const ya = p.huecos.find((h) => h.por && esJugador(limpio, h));
    p.esperas[id] = ahora + AJUSTES.esperaFallo;
    const mensaje = ya ? `${ya.nombre} ya estaba descubierto.` : `«${limpio}» no está en este once.`;
    p.ultimos[id] = { acierto: false, mensaje, t: ahora };
    return { ok: true, acierto: false, mensaje };
  }
  const h = p.huecos[i];
  const rebote = p.fase === 'rebote';
  const puntos = (rebote ? AJUSTES.puntosRebote : AJUSTES.puntosNivel)[h.nivel];
  h.por = id;
  h.puntos = puntos;
  h.rebote = rebote;
  sumar(p, j, puntos);
  if (rebote) j.rebotes += 1; else j.aciertos += 1;
  const otro = destapar(p, rng, i);
  p.registro.unshift({ id, hueco: i, puntos, pista: otro, rebote });
  p.ultimos[id] = { acierto: true, mensaje: `¡${h.nombre}! +${puntos}`, t: ahora };
  if (!quedan(p)) { if (rebote) cerrarRebote(p); else cerrarTurno(p, ahora, 'completo'); }
  return { ok: true, acierto: true, hueco: i, puntos, nombre: h.nombre, pista: otro };
}

/** El jugador del turno pide otra pista (o el anfitrión, para desatascar). */
export function pista(p, rng = Math.random, ahora = Date.now()) {
  if (p.fase !== 'turno' && p.fase !== 'rebote') return { ok: false, error: 'Ahora no hay pistas.' };
  const i = destapar(p, rng);
  if (i === null) return { ok: false, error: 'No quedan más pistas.' };
  if (p.fase === 'turno') p.proximaPista = ahora + AJUSTES.segPista * 1000;
  return { ok: true, hueco: i };
}

/** El jugador del turno se planta: pasa al rebote. */
export function plantarse(p, id, ahora = Date.now()) {
  if (p.fase !== 'turno') return { ok: false, error: 'Ahora no.' };
  if (id !== null && turnoActual(p).jugador !== id) return { ok: false, error: 'No es tu turno.' };
  cerrarTurno(p, ahora, 'plantado');
  return { ok: true };
}

/** En el rebote: «no sé más». Cuando pasan todos, se cierra. id = null cierra el rebote (anfitrión o grupo). */
export function pasarRebote(p, id) {
  if (p.fase !== 'rebote') return { ok: false, error: 'No hay rebote.' };
  if (id === null) { cerrarRebote(p); return { ok: true }; }
  if (!puedeAdivinar(p, id)) return { ok: false, error: 'Ya has pasado.' };
  p.pasados.push(id);
  const t = turnoActual(p);
  if (activos(p).filter((j) => j.id !== t.jugador).every((j) => p.pasados.includes(j.id))) cerrarRebote(p);
  return { ok: true };
}

export function siguiente(p, ahora = Date.now(), rng = Math.random) {
  if (p.fase !== 'resultado') return { ok: false, error: 'Todavía no ha terminado el turno.' };
  if (p.ronda >= p.rondas) { terminar(p); return { ok: true }; }
  empezarTurno(p, ahora, rng);
  return { ok: true };
}

export function terminar(p) {
  if (p.fase === 'fin') return { ok: false, error: 'La partida ya ha terminado.' };
  p.fase = 'fin';
  p.hasta = null;
  p.proximaPista = null;
  const tabla = [...p.jugadores].sort((a, b) => (a.fuera - b.fuera) || b.puntos - a.puntos || b.aciertos - a.aciertos);
  let puesto = 0;
  tabla.forEach((j, k) => { if (k === 0 || j.puntos !== tabla[k - 1].puntos) puesto = k + 1; j.puesto = puesto; });
  const max = Math.max(0, ...activos(p).map((j) => j.puntos));
  p.fin = {
    tabla: tabla.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, rebotes: j.rebotes, plenos: j.plenos, puesto: j.puesto, fuera: j.fuera })),
    ganadores: max > 0 ? activos(p).filter((j) => j.puntos === max).map((j) => j.id) : [], max
  };
  return { ok: true };
}

export function tick(p, ahora = Date.now(), rng = Math.random) {
  if (p.fase === 'turno') {
    if (p.hasta && ahora >= p.hasta) { cerrarTurno(p, ahora, 'tiempo'); return; }
    while (p.proximaPista && ahora >= p.proximaPista && p.fase === 'turno') {
      destapar(p, rng);
      p.proximaPista += AJUSTES.segPista * 1000;
    }
  } else if (p.fase === 'rebote' && p.hasta && ahora >= p.hasta) cerrarRebote(p);
}

export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id);
  if (!j || j.fuera || p.fase === 'fin') return;
  j.fuera = true;
  if (activos(p).length < 1) { terminar(p); return; }
  if (p.fase === 'turno' && turnoActual(p).jugador === id) cerrarTurno(p, ahora, 'abandono');
  else if (p.fase === 'rebote') {
    const t = turnoActual(p);
    if (activos(p).filter((x) => x.id !== t.jugador).every((x) => p.pasados.includes(x.id))) cerrarRebote(p);
  }
}

/** Lo que ve cada jugador: los huecos ocultos solo enseñan las pistas destapadas. */
export function vistaDe(p, id) {
  const t = turnoActual(p);
  const abierto = p.fase === 'resultado' || p.fase === 'fin';
  return {
    fase: p.fase, ronda: p.ronda, rondas: p.rondas, hasta: p.hasta, proximaPista: p.proximaPista, motivo: p.motivo,
    segundos: p.fase === 'rebote' ? AJUSTES.segRebote : p.segundos,
    turno: t ? t.jugador : null,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, fuera: j.fuera, pasado: p.pasados.includes(j.id) })),
    yo: jug(p, id) ? { id, puedo: puedeAdivinar(p, id), espera: p.esperas[id] || 0, ultimo: p.ultimos[id] || null } : null,
    once: t ? { equipo: t.equipo, partido: t.partido, entrenador: t.entrenador, tipo: t.tipo, lado: t.lado } : null,
    huecos: p.huecos.map((h) => {
      const visto = abierto || h.por;
      return {
        pos: h.pos, dorsal: h.dorsal, nivel: visto ? 3 : h.nivel,
        dato: visto || h.nivel >= 1 ? h.dato : null,
        pista: visto || h.nivel >= 2 ? h.pista : null,
        iniciales: visto || h.nivel >= 3 ? iniciales(h.nombre) : null,
        nombre: visto ? h.nombre : null, por: h.por, puntos: h.puntos, rebote: h.rebote
      };
    }),
    registro: p.registro.slice(0, 6),
    sumas: p.sumas,
    fin: p.fin
  };
}
