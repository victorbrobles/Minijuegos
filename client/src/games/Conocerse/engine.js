// client/src/games/Conocerse/engine.js
// «Qué malo es conocerse»: motor puro (salas online en server/routes/conocerse.js y modo de un solo dispositivo).
//
// Por turnos, cada ronda va dirigida a un jugador (el PROTAGONISTA): «Laura, si fueras un animal, ¿qué serías?».
//  1. responder: el resto escribe lo que cree que contestaría Laura.
//  2. elegir: salen todas las respuestas mezcladas y sin autor; cada jugador (Laura incluida) elige la que cree mejor.
//     La que elige Laura es la «correcta».
//  3. desglose: de quién era cada respuesta, quién la votó y cuál marcó Laura.
//  4. puntos: el resumen de la ronda.
// Puntos: el protagonista no suma nada esa ronda · el autor de la respuesta que elige el protagonista, +3 · quien vota
// la correcta, +1 (también su autor si se votó) · una respuesta que no es la correcta gana +1 por cada voto ajeno ·
// votarte a ti mismo sin que sea la correcta resta 1.
// La partida dura «jugadores × vueltas» rondas: cada jugador es protagonista `vueltas` veces.

export const AJUSTES = { min: 4, max: 20, maxRespuesta: 120, puntosElegida: 3 };
export const OPCIONES = { vueltas: [3, 4, 5] };

const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);
const barajar = (a, rng) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const k = Math.floor(rng() * (i + 1)); [b[i], b[k]] = [b[k], b[i]]; } return b; };
const azar = (p) => (typeof p.rng === 'function' ? p.rng() : Math.random());

/** preguntas: [{ id, tema, texto }] · reglas: { vueltas } */
export function crearPartida(jugadores, preguntas, reglas = {}, ahora = Date.now(), rng = Math.random) {
  const vueltas = OPCIONES.vueltas.includes(Number(reglas.vueltas)) ? Number(reglas.vueltas) : 3;
  const ids = jugadores.map((j) => j.id);
  const p = {
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, fuera: false, elegidas: 0, aciertos: 0 })),
    preguntas: barajar(preguntas, rng), cursor: 0, vueltas,
    // Turnos: todos una vez, luego todos otra vez… (cada vuelta en el mismo orden)
    turnos: Array.from({ length: vueltas }, () => ids).flat(),
    ronda: 0, rondas: ids.length * vueltas, fase: 'responder',
    protagonista: null, pregunta: null, respuestas: {}, orden: [], votos: {}, resultado: null, fin: null, inicio: ahora
  };
  Object.defineProperty(p, 'rng', { value: rng, enumerable: false, writable: true });
  empezarRonda(p);
  return p;
}

function robarPregunta(p) {
  const q = p.preguntas[p.cursor % p.preguntas.length];
  p.cursor += 1;
  return q;
}

/** Siguiente ronda: el siguiente protagonista que siga en la partida. */
function empezarRonda(p) {
  while (p.ronda < p.turnos.length && jug(p, p.turnos[p.ronda])?.fuera) p.ronda += 1; // se salta a quien se fue
  if (p.ronda >= p.turnos.length) { finalizar(p); return; }
  p.protagonista = p.turnos[p.ronda];
  p.ronda += 1;
  p.pregunta = robarPregunta(p);
  p.fase = 'responder'; p.respuestas = {}; p.orden = []; p.votos = {}; p.resultado = null;
}

const quienesResponden = (p) => activos(p).filter((j) => j.id !== p.protagonista);

/** Cambiar la pregunta (protagonista o anfitrión) mientras nadie haya respondido. */
export function otraPregunta(p, id, esAdmin = false) {
  if (p.fase !== 'responder') return { ok: false, error: 'Ahora no se puede cambiar la pregunta.' };
  if (id !== p.protagonista && !esAdmin) return { ok: false, error: 'Solo el protagonista o el anfitrión pueden cambiarla.' };
  if (Object.keys(p.respuestas).length) return { ok: false, error: 'Ya ha respondido alguien: esta se queda.' };
  p.pregunta = robarPregunta(p);
  return { ok: true };
}

/** Responder (o corregir mientras no hayan respondido todos). */
export function responder(p, id, texto) {
  if (p.fase !== 'responder') return { ok: false, error: 'Ya no se puede responder.' };
  const j = jug(p, id);
  if (!j || j.fuera) return { ok: false, error: 'No juegas esta partida.' };
  if (id === p.protagonista) return { ok: false, error: 'La pregunta es para ti: esta vez respondéis los demás.' };
  const t = String(texto ?? '').replace(/\s+/g, ' ').trim().slice(0, AJUSTES.maxRespuesta);
  if (!t) return { ok: false, error: 'Escribe una respuesta.' };
  p.respuestas[id] = t;
  if (quienesResponden(p).every((x) => p.respuestas[x.id])) aElegir(p);
  return { ok: true };
}

/** Quiere cambiar su respuesta (solo mientras siga la fase de responder). */
export function retirar(p, id) {
  if (p.fase !== 'responder' || !p.respuestas[id]) return { ok: false, error: 'Ahora no.' };
  delete p.respuestas[id];
  return { ok: true };
}

function aElegir(p) {
  const autores = Object.keys(p.respuestas).map(Number).filter((a) => jug(p, a) && !jug(p, a).fuera);
  if (!autores.length) { cerrarRonda(p); return; }
  p.orden = barajar(autores, () => azar(p));
  p.fase = 'elegir';
}

/** Elegir la respuesta que crees mejor, por letra (A, B, C…) para que nadie sepa de quién es. */
export function elegir(p, id, letra) {
  if (p.fase !== 'elegir') return { ok: false, error: 'Ahora no se elige.' };
  const j = jug(p, id);
  if (!j || j.fuera) return { ok: false, error: 'No juegas esta partida.' };
  const k = String(letra ?? '').toUpperCase().charCodeAt(0) - 65;
  const autor = p.orden[k];
  if (autor == null) return { ok: false, error: 'Elige una de las respuestas.' };
  p.votos[id] = autor;
  if (activos(p).every((x) => p.votos[x.id] != null)) cerrarRonda(p);
  return { ok: true };
}

/** Puntos de la ronda: { [id]: { total, motivos: [[texto, pts]] } } */
export function puntuar(autores, votos, protagonista) {
  const r = {};
  const suma = (id, pts, motivo) => { if (id === protagonista) return; r[id] = r[id] || { total: 0, motivos: [] }; r[id].total += pts; r[id].motivos.push([motivo, pts]); };
  const correcta = votos[protagonista];
  if (correcta == null || !autores.includes(correcta)) return { puntos: r, correcta: null };
  suma(correcta, AJUSTES.puntosElegida, 'elegida');
  Object.entries(votos).forEach(([v, a]) => {
    const votante = Number(v);
    if (votante === protagonista) return;
    if (a === correcta) suma(votante, 1, 'acierto');
    else if (a === votante) suma(votante, -1, 'autovoto');
    else suma(a, 1, 'engaño');
  });
  return { puntos: r, correcta };
}

function cerrarRonda(p) {
  const { puntos, correcta } = puntuar(p.orden, p.votos, p.protagonista);
  Object.entries(puntos).forEach(([id, x]) => { const j = jug(p, Number(id)); if (j) j.puntos += x.total; });
  if (correcta != null) {
    const a = jug(p, correcta); if (a) a.elegidas += 1;
    Object.entries(p.votos).forEach(([v, x]) => { if (Number(v) !== p.protagonista && x === correcta) { const j = jug(p, Number(v)); if (j) j.aciertos += 1; } });
  }
  p.resultado = { puntos, correcta, anulada: correcta == null };
  p.fase = 'desglose';
}

/** desglose → puntos → siguiente ronda (o final). */
export function siguiente(p) {
  if (p.fase === 'desglose') { p.fase = 'puntos'; return { ok: true }; }
  if (p.fase === 'puntos') { empezarRonda(p); return { ok: true }; }
  return { ok: false, error: 'Ahora no.' };
}

function finalizar(p) {
  p.fase = 'fin';
  const orden = [...p.jugadores].sort((a, b) => (a.fuera - b.fuera) || (b.puntos - a.puntos));
  const max = Math.max(...activos(p).map((j) => j.puntos), 0);
  let puesto = 0; let previo = null;
  const tabla = orden.map((j, i) => { if (j.puntos !== previo) { puesto = i + 1; previo = j.puntos; } return { id: j.id, nombre: j.nombre, puntos: j.puntos, elegidas: j.elegidas, aciertos: j.aciertos, fuera: j.fuera, puesto }; });
  // Quien mejor conoce al grupo (más aciertos) y quien más veces dio en el clavo (respuestas elegidas)
  const mejor = (k) => { const m = Math.max(0, ...activos(p).map((j) => j[k])); return m > 0 ? activos(p).filter((j) => j[k] === m).map((j) => j.id) : []; };
  p.fin = { tabla, max, ganadores: activos(p).filter((j) => j.puntos === max).map((j) => j.id), conocedores: mejor('aciertos'), clavos: mejor('elegidas') };
}

export function terminar(p) {
  if (p.fase === 'fin') return { ok: false, error: 'La partida ya ha terminado.' };
  finalizar(p);
  return { ok: true };
}

export const tick = () => false;

/** El anfitrión desbloquea a quien no contesta: cierra las respuestas o la elección. */
export function forzar(p) {
  if (p.fase === 'responder') { aElegir(p); return { ok: true }; }
  if (p.fase === 'elegir') { cerrarRonda(p); return { ok: true }; }
  return { ok: false, error: 'Nada que forzar.' };
}

export function abandonar(p, id) {
  const j = jug(p, id);
  if (!j || j.fuera || p.fase === 'fin') return;
  j.fuera = true;
  if (activos(p).length < 2) { finalizar(p); return; }
  if (id === p.protagonista && (p.fase === 'responder' || p.fase === 'elegir')) {
    // Sin protagonista no hay respuesta correcta: la ronda se anula
    p.resultado = { puntos: {}, correcta: null, anulada: true, seFue: true };
    p.fase = 'desglose';
    return;
  }
  delete p.respuestas[id];
  if (p.fase === 'responder' && quienesResponden(p).every((x) => p.respuestas[x.id])) aElegir(p);
  else if (p.fase === 'elegir' && activos(p).every((x) => p.votos[x.id] != null)) cerrarRonda(p);
}

export function accion(p, id, d, { esAdmin = false } = {}) {
  switch (d.tipo) {
    case 'responder': return responder(p, id, d.texto);
    case 'retirar': return retirar(p, id);
    case 'elegir': return elegir(p, id, d.letra);
    case 'otra': return otraPregunta(p, id, esAdmin);
    default: return null;
  }
}

export function vistaDe(p, id) {
  const yo = jug(p, id);
  const publico = p.fase === 'desglose' || p.fase === 'puntos' || p.fase === 'fin';
  const letra = (a) => String.fromCharCode(65 + p.orden.indexOf(a));
  const prota = jug(p, p.protagonista);
  return {
    fase: p.fase, ronda: p.ronda, rondas: p.rondas, vueltas: p.vueltas,
    protagonista: p.protagonista, pregunta: p.pregunta, enunciado: prota && p.pregunta ? `${prota.nombre}, ${p.pregunta.texto}` : '',
    jugadores: p.jugadores.map((j) => ({
      id: j.id, nombre: j.nombre, puntos: j.puntos, fuera: j.fuera, elegidas: j.elegidas, aciertos: j.aciertos,
      listo: p.fase === 'responder' ? (j.id === p.protagonista || Boolean(p.respuestas[j.id])) : p.fase === 'elegir' ? p.votos[j.id] != null : true
    })),
    respondidas: Object.keys(p.respuestas).length,
    yo: yo ? {
      id: yo.id, protagonista: yo.id === p.protagonista, respuesta: p.respuestas[id] ?? null,
      eleccion: p.votos[id] != null && p.orden.includes(p.votos[id]) ? letra(p.votos[id]) : null
    } : null,
    // Al elegir, las respuestas van sin autor; en el desglose, con autor, votantes y la elegida por el protagonista
    respuestas: p.fase === 'elegir' || (publico && p.orden.length) ? p.orden.map((a) => ({
      letra: letra(a), texto: p.respuestas[a], mia: a === id,
      autor: publico ? a : null,
      votantes: publico ? Object.entries(p.votos).filter(([, x]) => x === a).map(([v]) => Number(v)) : null,
      correcta: publico ? p.resultado?.correcta === a : null
    })) : [],
    resultado: publico ? p.resultado : null,
    fin: p.fin
  };
}
