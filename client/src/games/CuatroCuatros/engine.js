// client/src/games/CuatroCuatros/engine.js
// «Cuatro cuatros»: dados de farol (juego tradicional). Motor puro: salas online (server/routes/cuatrocuatros.js)
// y modo un solo dispositivo.
// Cada jugador tiene unos dados ocultos. Por turnos se apuesta cuántos dados de un valor hay en TODA la mesa
// («al menos cuatro cuatros»). Los unos son comodines (cuentan como cualquier valor). El siguiente puede:
//   · subir la apuesta: más cantidad, o la misma cantidad de un valor más alto;
//     a unos se pasa con la mitad de la cantidad (redondeando hacia arriba) y de unos a otro valor, con el doble + 1;
//   · «¡Mentiroso!»: se levantan los dados; si hay menos de lo apostado pierde un dado quien apostó, si no, quien dudó;
//   · «¡Exacto!»: si hay justo lo apostado gana un dado (máx. el inicial); si no, pierde uno.
// Quien pierde un dado empieza la ronda siguiente. Sin dados, eliminado. Gana el último que conserve dados.
export const OPCIONES_DADOS = [3, 5, 6];
const tirar = (n) => Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 6));

export function crearPartida(jugadores, items, reglas = {}, ahora = Date.now()) {
  const dados = OPCIONES_DADOS.includes(reglas.dados) ? reglas.dados : 5;
  const p = {
    fase: 'apostar', ronda: 1, rondas: null, maxDados: dados, eliminados: 0,
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, dados: tirar(dados), fuera: false, eliminado: false, eliminadoEn: null, listo: false })),
    turno: 0, apuesta: null, historial: [], revelado: null, fin: null, creada: ahora
  };
  p.turno = Math.floor(Math.random() * p.jugadores.length);
  return p;
}

const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const enJuego = (p) => p.jugadores.filter((j) => !j.fuera && !j.eliminado);
const actual = (p) => p.jugadores[p.turno];
const totalDados = (p) => enJuego(p).reduce((a, j) => a + j.dados.length, 0);

/** ¿Es `nueva` una subida válida sobre `vieja`? (los unos son comodines) */
export function subidaValida(vieja, nueva) {
  const { cantidad: c, valor: v } = nueva;
  if (!Number.isInteger(c) || c < 1 || !Number.isInteger(v) || v < 1 || v > 6) return false;
  if (!vieja) return true;
  const { cantidad: c0, valor: v0 } = vieja;
  if (v0 !== 1 && v !== 1) return c > c0 || (c === c0 && v > v0);
  if (v0 !== 1 && v === 1) return c >= Math.ceil(c0 / 2);
  if (v0 === 1 && v === 1) return c > c0;
  return c >= c0 * 2 + 1; // de unos a otro valor
}
/** La apuesta mínima válida con cada valor (para ayudar en la pantalla). */
export function minimoPara(vieja, valor) {
  if (!vieja) return 1;
  for (let c = 1; c <= 99; c++) if (subidaValida(vieja, { cantidad: c, valor })) return c;
  return 99;
}

function siguienteVivo(p, desde) {
  let i = desde;
  for (let k = 0; k < p.jugadores.length; k++) {
    i = (i + 1) % p.jugadores.length;
    if (!p.jugadores[i].fuera && !p.jugadores[i].eliminado) return i;
  }
  return desde;
}

export function apostar(p, id, cantidad, valor) {
  if (p.fase !== 'apostar') return { ok: false, error: 'Ahora no se apuesta.' };
  const a = actual(p);
  if (id !== a.id) return { ok: false, error: `Es el turno de ${a.nombre}.` };
  const nueva = { cantidad: Math.floor(Number(cantidad)), valor: Math.floor(Number(valor)) };
  if (nueva.cantidad > totalDados(p)) return { ok: false, error: `Solo hay ${totalDados(p)} dados en la mesa.` };
  if (!subidaValida(p.apuesta, nueva)) return { ok: false, error: 'Tienes que subir la apuesta: más cantidad o el mismo número de un valor más alto (con los unos, mira la ayuda).' };
  p.apuesta = { ...nueva, id: a.id };
  p.historial.push({ id: a.id, ...nueva });
  p.turno = siguienteVivo(p, p.turno);
  return { ok: true };
}

const cuenta = (p, valor) => enJuego(p).reduce((a, j) => a + j.dados.filter((d) => d === valor || (valor !== 1 && d === 1)).length, 0);

function perderDado(p, j) {
  j.dados.pop();
  if (!j.dados.length) { j.eliminado = true; p.eliminados += 1; j.eliminadoEn = p.eliminados; }
}

/** «¡Mentiroso!» (tipo 'dudar') o «¡Exacto!» (tipo 'exacto'). */
export function cantar(p, id, tipo) {
  if (p.fase !== 'apostar') return { ok: false, error: 'Ahora no.' };
  const a = actual(p);
  if (id !== a.id) return { ok: false, error: `Es el turno de ${a.nombre}.` };
  if (!p.apuesta) return { ok: false, error: 'Aún no hay ninguna apuesta: empieza tú apostando.' };
  const ap = p.apuesta; const apostador = jug(p, ap.id);
  const hay = cuenta(p, ap.valor);
  const manos = enJuego(p).map((j) => ({ id: j.id, nombre: j.nombre, dados: [...j.dados] }));
  let pierde = null; let gana = null;
  if (tipo === 'exacto') {
    if (hay === ap.cantidad) { gana = a.id; if (a.dados.length < p.maxDados) a.dados.push(1); } else pierde = a.id;
  } else {
    pierde = hay < ap.cantidad ? apostador.id : a.id;
  }
  if (pierde != null) perderDado(p, jug(p, pierde));
  p.revelado = { tipo, apuesta: ap, hay, por: a.id, pierde, gana, manos, eliminado: pierde != null && jug(p, pierde).eliminado };
  p.fase = 'revelar';
  p.jugadores.forEach((j) => { j.listo = false; });
  if (enJuego(p).length <= 1) terminar(p);
  return { ok: true };
}

export function seguir(p, id) {
  if (p.fase !== 'revelar') return { ok: false, error: 'Ahora no.' };
  if (id == null) p.jugadores.forEach((j) => { j.listo = true; });
  else { const j = jug(p, id); if (j) j.listo = true; }
  if (enJuego(p).every((j) => j.listo)) nuevaRonda(p);
  return { ok: true };
}

function nuevaRonda(p) {
  const r = p.revelado;
  // Empieza quien ha perdido el dado (o, si ha quedado eliminado, el siguiente); con «¡Exacto!» acertado, quien lo cantó
  const quien = r.pierde != null ? r.pierde : r.gana;
  let idx = p.jugadores.findIndex((j) => j.id === quien);
  if (idx < 0 || p.jugadores[idx].eliminado || p.jugadores[idx].fuera) idx = siguienteVivo(p, idx < 0 ? p.turno : idx);
  p.turno = idx; p.ronda += 1; p.apuesta = null; p.historial = []; p.revelado = null; p.fase = 'apostar';
  enJuego(p).forEach((j) => { j.dados = tirar(j.dados.length); j.listo = false; });
}

export function terminar(p) {
  const N = p.jugadores.length;
  const vivos = enJuego(p);
  const caidos = p.jugadores.filter((j) => j.eliminado && !j.fuera).sort((a, b) => b.eliminadoEn - a.eliminadoEn);
  const orden = [...vivos.sort((a, b) => b.dados.length - a.dados.length), ...caidos];
  const tabla = orden.map((j, i) => ({ id: j.id, nombre: j.nombre, puntos: N - 1 - i, dados: j.dados.length, puesto: i + 1, fuera: false }));
  p.jugadores.filter((j) => j.fuera).forEach((j) => tabla.push({ id: j.id, nombre: j.nombre, puntos: 0, dados: 0, puesto: tabla.length + 1, fuera: true }));
  p.fase = 'fin';
  p.fin = { tabla, max: N - 1, ganadores: tabla.length ? [tabla[0].id] : [], revelado: p.revelado };
  return { ok: true };
}

/** El anfitrión no espera: quien tiene el turno abre con una apuesta mínima o canta «¡Mentiroso!»; o se pasa de ronda. */
export function forzar(p) {
  if (p.fase === 'revelar') return seguir(p, null);
  if (p.fase !== 'apostar') return { ok: true };
  const a = actual(p);
  if (p.apuesta) return cantar(p, a.id, 'dudar');
  const valor = [2, 3, 4, 5, 6].sort((x, y) => a.dados.filter((d) => d === y || d === 1).length - a.dados.filter((d) => d === x || d === 1).length)[0];
  return apostar(p, a.id, 1, valor);
}

export function abandonar(p, id) {
  const j = jug(p, id);
  if (!j || p.fase === 'fin') return;
  const suTurno = p.fase === 'apostar' && actual(p).id === id;
  j.fuera = true; j.dados = [];
  if (enJuego(p).length <= 1) { terminar(p); return; }
  if (p.apuesta?.id === id) p.apuesta = { ...p.apuesta };
  if (suTurno) p.turno = siguienteVivo(p, p.turno);
  if (p.fase === 'revelar' && enJuego(p).every((x) => x.listo)) nuevaRonda(p);
}

export function tick() {}

export function accion(p, id, d) {
  const actor = id ?? (p.fase === 'apostar' ? actual(p).id : null);
  switch (d.tipo) {
    case 'apostar': return apostar(p, actor, d.cantidad, d.valor);
    case 'dudar': return cantar(p, actor, 'dudar');
    case 'exacto': return cantar(p, actor, 'exacto');
    case 'seguir': return seguir(p, id);
    default: return null;
  }
}

/** En un solo móvil: quien tiene el turno mira sus dados en privado. */
export function turnoLocal(p) {
  return p.fase === 'apostar' ? actual(p).id : null;
}

export function vistaDe(p, id) {
  const yo = jug(p, id);
  return {
    fase: p.fase, ronda: p.ronda, rondas: null, maxDados: p.maxDados, total: totalDados(p),
    turno: p.fase === 'apostar' ? actual(p).id : null, apuesta: p.apuesta, historial: p.historial,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.dados.length, dados: j.dados.length, eliminado: j.eliminado, fuera: j.fuera, listo: j.listo })),
    yo: yo ? { id: yo.id, dados: yo.dados, eliminado: yo.eliminado, listo: yo.listo } : null,
    revelado: p.revelado, fin: p.fin
  };
}
