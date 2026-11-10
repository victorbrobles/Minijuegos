// server/datosobra/engine.js
// «El Dato que Sobra»: motor puro (sin red). Se copia al cliente con `npm run sync:datosobra`.
// Cada ronda, un jugador (por turnos) señala cuál de las cuatro afirmaciones sobre un futbolista es la falsa.
// Después, los demás deciden en secreto si aceptan su respuesta o la desafían señalando otra.

export const AJUSTES = { min: 2, max: 10, acierto: 3, aguante: 1, desafioGanado: 4, desafioPerdido: -1, segResponder: 30, segDesafio: 20 };
export const OPCIONES = { rondas: [4, 6, 8, 10] };
export const LETRAS = ['A', 'B', 'C', 'D'];

const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);
const sumar = (p, id, n) => { const j = jug(p, id); if (!j || !n) return; j.puntos += n; p.sumas[id] = (p.sumas[id] || 0) + n; };

/** items: [{ nombre, afirmaciones: [4], falsa: índice, porque }] (ya barajados). reglas: { rondas } */
export function crearPartida(jugadores, items, reglas = {}, ahora = Date.now()) {
  const rondas = Math.max(1, Math.min(reglas.rondas || 6, items.length));
  const p = {
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, aciertos: 0, desafios: 0, fuera: false })),
    items: items.slice(0, rondas), rondas, ronda: 0, fase: 'responder', turno: null, hasta: null,
    respuesta: null, decisiones: {}, sumas: {}, resultado: null, fin: null, sinReloj: Boolean(reglas.sinReloj)
  };
  empezarRonda(p, ahora);
  return p;
}
const reloj = (p, ahora, s) => (p.sinReloj ? null : ahora + s * 1000);

function empezarRonda(p, ahora) {
  p.ronda += 1;
  const a = activos(p);
  p.turno = a[(p.ronda - 1) % a.length].id;
  p.fase = 'responder';
  p.respuesta = null;
  p.decisiones = {};
  p.sumas = {};
  p.resultado = null;
  p.hasta = reloj(p, ahora, AJUSTES.segResponder);
}
const item = (p) => p.items[p.ronda - 1];
const retadores = (p) => activos(p).filter((j) => j.id !== p.turno);

/** El jugador del turno señala la afirmación falsa (índice 0..3). */
export function responder(p, id, indice, ahora = Date.now()) {
  if (p.fase !== 'responder') return { ok: false, error: 'Ahora no toca responder.' };
  if (id !== p.turno) return { ok: false, error: 'No es tu turno.' };
  const i = Number(indice);
  if (!(i >= 0 && i < 4)) return { ok: false, error: 'Elige una de las cuatro afirmaciones.' };
  p.respuesta = i;
  abrirDesafios(p, ahora);
  return { ok: true };
}
function abrirDesafios(p, ahora) {
  p.fase = 'desafiar';
  p.hasta = reloj(p, ahora, AJUSTES.segDesafio);
  if (!retadores(p).length) resolver(p);
}

/** Otro jugador acepta (indice = null) o desafía señalando otra afirmación. */
export function desafiar(p, id, indice, ahora = Date.now()) {
  if (p.fase !== 'desafiar') return { ok: false, error: 'Ahora no se puede desafiar.' };
  const j = jug(p, id);
  if (!j || j.fuera) return { ok: false, error: 'No estás en la partida.' };
  if (id === p.turno) return { ok: false, error: 'No puedes desafiarte a ti mismo.' };
  if (indice === null || indice === undefined || indice === 'acepto') p.decisiones[id] = 'acepto';
  else {
    const i = Number(indice);
    if (!(i >= 0 && i < 4)) return { ok: false, error: 'Elige una afirmación.' };
    if (i === p.respuesta) return { ok: false, error: 'Para desafiar tienes que señalar otra afirmación.' };
    p.decisiones[id] = i;
  }
  if (retadores(p).every((x) => p.decisiones[x.id] !== undefined)) resolver(p, ahora);
  return { ok: true };
}

function resolver(p) {
  const it = item(p);
  const bien = p.respuesta === it.falsa;
  const quien = jug(p, p.turno);
  if (bien) { sumar(p, p.turno, AJUSTES.acierto); quien.aciertos += 1; }
  const detalle = {};
  retadores(p).forEach((j) => {
    const d = p.decisiones[j.id] ?? 'acepto';
    if (d === 'acepto') { detalle[j.id] = 'acepta'; return; }
    j.desafios += 1;
    if (!bien && d === it.falsa) { sumar(p, j.id, AJUSTES.desafioGanado); j.aciertos += 1; detalle[j.id] = 'gana'; }
    else if (bien) { sumar(p, j.id, AJUSTES.desafioPerdido); sumar(p, p.turno, AJUSTES.aguante); detalle[j.id] = 'pierde'; }
    else detalle[j.id] = 'falla';
  });
  p.fase = 'resultado';
  p.hasta = null;
  p.resultado = { bien, falsa: it.falsa, porque: it.porque, detalle };
}

export function siguiente(p, ahora = Date.now()) {
  if (p.fase !== 'resultado') return { ok: false, error: 'La ronda no ha terminado.' };
  if (p.ronda >= p.rondas) return terminar(p);
  empezarRonda(p, ahora);
  return { ok: true };
}

export function terminar(p) {
  if (p.fase === 'fin') return { ok: false, error: 'La partida ya ha terminado.' };
  p.fase = 'fin';
  p.hasta = null;
  const tabla = [...p.jugadores].sort((a, b) => (a.fuera - b.fuera) || b.puntos - a.puntos || b.aciertos - a.aciertos);
  let puesto = 0;
  tabla.forEach((j, k) => { if (k === 0 || j.puntos !== tabla[k - 1].puntos) puesto = k + 1; j.puesto = puesto; });
  const max = Math.max(0, ...activos(p).map((j) => j.puntos));
  p.fin = {
    tabla: tabla.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, desafios: j.desafios, puesto: j.puesto, fuera: j.fuera })),
    ganadores: max > 0 ? activos(p).filter((j) => j.puntos === max).map((j) => j.id) : [], max
  };
  return { ok: true };
}

export function tick(p, ahora = Date.now()) {
  if (!p.hasta || ahora < p.hasta) return;
  if (p.fase === 'responder') { p.respuesta = null; abrirDesafios(p, ahora); return; }
  if (p.fase === 'desafiar') resolver(p, ahora);
}

export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id);
  if (!j || j.fuera || p.fase === 'fin') return;
  j.fuera = true;
  if (activos(p).length < 2) { terminar(p); return; }
  if (p.turno === id && p.fase === 'responder') { p.respuesta = null; abrirDesafios(p, ahora); }
  else if (p.fase === 'desafiar' && retadores(p).every((x) => p.decisiones[x.id] !== undefined)) resolver(p, ahora);
}

export function vistaDe(p, id) {
  const it = item(p);
  const abierto = p.fase === 'resultado' || p.fase === 'fin';
  return {
    fase: p.fase, ronda: p.ronda, rondas: p.rondas, hasta: p.hasta, turno: p.turno,
    segundos: p.fase === 'responder' ? AJUSTES.segResponder : AJUSTES.segDesafio,
    jugadores: p.jugadores.map((j) => ({
      id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, desafios: j.desafios, fuera: j.fuera,
      decidido: p.fase === 'desafiar' && j.id !== p.turno ? p.decisiones[j.id] !== undefined : null
    })),
    yo: jug(p, id) ? { id, decision: p.decisiones[id] ?? null } : null,
    futbolista: it ? it.nombre : null,
    afirmaciones: it ? it.afirmaciones : [],
    respuesta: p.fase === 'responder' ? null : p.respuesta,
    // Las decisiones de los demás son secretas hasta el resultado
    decisiones: abierto ? p.decisiones : null,
    resultado: abierto ? p.resultado : null,
    sumas: abierto ? p.sumas : {},
    fin: p.fin
  };
}
