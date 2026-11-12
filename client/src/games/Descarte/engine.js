// server/descarte/engine.js
// Motor puro de «¡Descarta y Elimina!». Lo usan las salas online (server/routes/descarte.js) y, copiado al cliente
// con `npm run sync:descarte`, el modo «un solo dispositivo». No guarda estado propio: todo vive en el objeto partida.
//
// Dinámica: el RETADOR elige a un rival (que aún no haya jugado en la vuelta) y le pone una de tres categorías.
// El rival tiene 30 s para decir una palabra de esa categoría que empiece por una letra que siga en el tablero.
// Si vale, la letra se elimina y el rival suma sus puntos (1, 2 o 3 según lo difícil que sea la letra).
// Después, el rival pasa a ser el retador. El tablero acaba cuando no quedan letras o fallan todos seguidos.
//
// Fases de cada reto: retar → turno (el rival se prepara y pulsa «listo») → responder (30 s: elige letra y dice la
// palabra en voz alta) → validar (online: el anfitrión decide si vale). En un solo dispositivo se marca directamente
// acierto, fallo o pasar turno. Pasar también cuenta como fallo para cerrar el tablero.

export const LETRAS = [
  { l: 'A', pts: 1 }, { l: 'B', pts: 1 }, { l: 'C', pts: 1 }, { l: 'D', pts: 1 }, { l: 'E', pts: 1 },
  { l: 'F', pts: 2 }, { l: 'G', pts: 2 }, { l: 'H', pts: 2 }, { l: 'I', pts: 2 }, { l: 'J', pts: 3 },
  { l: 'K', pts: 3 }, { l: 'L', pts: 1 }, { l: 'M', pts: 1 }, { l: 'N', pts: 2 },
  { l: 'O', pts: 2 }, { l: 'P', pts: 1 }, { l: 'Q', pts: 3 }, { l: 'R', pts: 1 }, { l: 'S', pts: 1 },
  { l: 'T', pts: 1 }, { l: 'U', pts: 2 }, { l: 'V', pts: 2 }, { l: 'W', pts: 3 }, { l: 'X', pts: 3 },
  { l: 'Y', pts: 3 }, { l: 'Z', pts: 3 }
];
export const PUNTOS = Object.fromEntries(LETRAS.map((x) => [x.l, x.pts]));
const ABECEDARIO = LETRAS.map((x) => x.l);

export const AJUSTES = { min: 3, max: 12, segundosRespuesta: 30 };
export const OPCIONES_TABLEROS = [1, 3, 5];

const barajar = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);
const nombre = (p, id) => jug(p, id)?.nombre ?? '¿?';

function anotar(p, texto, tipo = '') {
  p.nlog += 1;
  p.log.push({ n: p.nlog, texto, tipo });
  if (p.log.length > 60) p.log.shift();
}

function sacarCategorias(p) {
  if (p.bolsa.length < 3) p.bolsa = barajar(p.todas);
  p.categorias = p.bolsa.splice(0, 3);
}

/** Rivales a los que puede retar el retador: activos que no han jugado en esta vuelta (si no queda nadie, empieza otra). */
export function elegibles(p) {
  const posibles = activos(p).filter((j) => j.id !== p.retadorId);
  const libres = posibles.filter((j) => !p.ciclo.includes(j.id));
  return (libres.length ? libres : posibles).map((j) => j.id);
}

/** Siguiente jugador activo a partir de `desdeId` (él incluido si sigue en juego). */
function siguienteActivo(p, desdeId) {
  const idx = Math.max(0, p.jugadores.findIndex((j) => j.id === desdeId));
  for (let k = 0; k < p.jugadores.length; k++) {
    const j = p.jugadores[(idx + k) % p.jugadores.length];
    if (!j.fuera) return j.id;
  }
  return null;
}

function prepararReto(p, retadorId) {
  p.retadorId = siguienteActivo(p, retadorId);
  p.rivalId = null;
  p.categoria = '';
  p.letra = null;
  p.limite = null;
  if (activos(p).filter((j) => j.id !== p.retadorId && !p.ciclo.includes(j.id)).length === 0) p.ciclo = [];
  sacarCategorias(p);
  p.fase = 'retar';
}

export function crearPartida(jugadores, config = {}, categorias = []) {
  const lista = jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, aciertos: 0, fuera: false }));
  const p = {
    jugadores: lista,
    tableros: OPCIONES_TABLEROS.includes(Number(config.tableros)) ? Number(config.tableros) : 3,
    tablero: 1,
    letras: [...ABECEDARIO],
    fallos: 0,
    ciclo: [],
    fase: 'retar',
    retadorId: null,
    rivalId: null,
    todas: categorias.length >= 3 ? [...categorias] : ['Animales', 'Comidas', 'Países', 'Profesiones'],
    bolsa: [],
    categorias: [],
    categoria: '',
    letra: null,
    limite: null,
    resumen: null,
    ultimo: null,
    log: [],
    nlog: 0,
    fin: null
  };
  p.bolsa = barajar(p.todas);
  const primero = lista[Math.floor(Math.random() * lista.length)].id;
  prepararReto(p, primero);
  anotar(p, `Empieza la partida (${p.tableros} tableros). ${nombre(p, p.retadorId)} es el primer retador.`);
  return p;
}

function finalizar(p) {
  p.fase = 'fin';
  p.limite = null;
  const orden = [...p.jugadores].sort((a, b) => (a.fuera - b.fuera) || (b.puntos - a.puntos));
  const max = Math.max(0, ...activos(p).map((j) => j.puntos));
  let puesto = 0;
  let previo = null;
  const tabla = orden.map((j, i) => {
    if (j.puntos !== previo) { puesto = i + 1; previo = j.puntos; }
    return { id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, fuera: j.fuera, puesto: j.fuera ? null : puesto };
  });
  const ganadores = max > 0 ? activos(p).filter((j) => j.puntos === max).map((j) => j.id) : [];
  p.fin = { tabla, ganadores, max };
  anotar(p, ganadores.length ? `🏆 Fin de la partida: gana ${ganadores.map((id) => nombre(p, id)).join(' y ')} con ${max} puntos.` : 'Fin de la partida: nadie ha puntuado.', 'bueno');
}

function resolver(p, ok, motivo = '') {
  const rivalId = p.rivalId;
  const rival = jug(p, rivalId);
  if (ok && p.letra && p.letras.includes(p.letra)) {
    const pts = PUNTOS[p.letra] || 1;
    p.letras = p.letras.filter((l) => l !== p.letra);
    if (rival) { rival.puntos += pts; rival.aciertos += 1; }
    p.fallos = 0;
    p.ultimo = { ok: true, jugadorId: rivalId, letra: p.letra, pts, categoria: p.categoria };
    anotar(p, `✅ ${nombre(p, rivalId)} acierta por la ${p.letra} (+${pts}) en «${p.categoria}».`, 'bueno');
  } else {
    p.fallos += 1;
    p.ultimo = { ok: false, pasa: motivo === 'pasa turno', jugadorId: rivalId, letra: p.letra, motivo, categoria: p.categoria };
    anotar(p, `❌ ${nombre(p, rivalId)} falla en «${p.categoria}»${motivo ? ` (${motivo})` : ''}.`, 'malo');
  }
  if (rivalId != null && !p.ciclo.includes(rivalId)) p.ciclo.push(rivalId);

  if (activos(p).length < 2) return finalizar(p);
  const sinLetras = p.letras.length === 0;
  const todosFallan = p.fallos >= activos(p).length;
  if (sinLetras || todosFallan) {
    p.resumen = { tablero: p.tablero, motivo: sinLetras ? 'sin_letras' : 'fallos', quedan: [...p.letras] };
    anotar(p, `🧩 Fin del tablero ${p.tablero}: ${sinLetras ? '¡no queda ninguna letra!' : 'todos han fallado seguidos.'}`);
    if (p.tablero >= p.tableros) return finalizar(p);
    p.fase = 'tablero';
    p.limite = null;
    p.retadorId = rivalId;
    return undefined;
  }
  prepararReto(p, rivalId);
  return undefined;
}

// ---------------------------------------------------------------- Acciones
export function retar(p, id, { rivalId, categoria } = {}) {
  if (p.fase !== 'retar') return { ok: false, error: 'Ahora no toca retar.' };
  if (id !== p.retadorId) return { ok: false, error: 'No eres el retador.' };
  const rid = Number(rivalId);
  if (!elegibles(p).includes(rid)) return { ok: false, error: 'Ese jugador no puede ser retado ahora.' };
  if (!p.categorias.includes(categoria)) return { ok: false, error: 'Elige una de las tres categorías.' };
  p.rivalId = rid;
  p.categoria = categoria;
  p.letra = null;
  p.limite = null;
  p.fase = 'turno';
  anotar(p, `🎯 ${nombre(p, id)} reta a ${nombre(p, rid)} con «${categoria}».`);
  return { ok: true };
}

/** El rival pulsa «listo»: ve la categoría y empiezan sus 30 segundos. */
export function empezar(p, id, ahora = Date.now()) {
  if (p.fase !== 'turno') return { ok: false, error: 'Ahora no toca empezar.' };
  if (id !== p.rivalId) return { ok: false, error: 'No es tu reto.' };
  p.fase = 'responder';
  p.limite = ahora + AJUSTES.segundosRespuesta * 1000;
  return { ok: true };
}

/** Online: el rival elige la letra por la que ha dicho su palabra; el anfitrión la valida. */
export function elegirLetra(p, id, letra) {
  if (p.fase !== 'responder' && p.fase !== 'validar') return { ok: false, error: 'Ahora no se puede elegir letra.' };
  if (id !== p.rivalId) return { ok: false, error: 'No es tu reto.' };
  if (!p.letras.includes(letra)) return { ok: false, error: 'Esa letra ya no está en el tablero.' };
  p.letra = letra;
  p.fase = 'validar';
  p.limite = null;
  return { ok: true };
}

/** Online: el anfitrión decide si la palabra dicha por la letra elegida vale. */
export function validar(p, valida) {
  if (p.fase !== 'validar') return { ok: false, error: 'No hay ninguna letra que validar.' };
  resolver(p, Boolean(valida), valida ? '' : 'no ha valido');
  return { ok: true };
}

/** El rival pasa turno: no suma y cuenta como fallo. */
export function pasar(p, id) {
  if (!['turno', 'responder', 'validar'].includes(p.fase) || id !== p.rivalId) return { ok: false, error: 'Ahora no puedes pasar.' };
  resolver(p, false, 'pasa turno');
  return { ok: true };
}

/** Un solo dispositivo: acierto con la letra elegida, fallo (letra null) o pasar turno. */
export function marcar(p, letra, pasa = false) {
  if (p.fase !== 'responder') return { ok: false, error: 'Ahora no se puede marcar.' };
  if (pasa) { resolver(p, false, 'pasa turno'); return { ok: true }; }
  if (letra == null) { resolver(p, false, 'no ha valido'); return { ok: true }; }
  if (!p.letras.includes(letra)) return { ok: false, error: 'Esa letra ya está eliminada.' };
  p.letra = letra;
  resolver(p, true);
  return { ok: true };
}

export function siguienteTablero(p) {
  if (p.fase !== 'tablero') return { ok: false, error: 'El tablero aún no ha terminado.' };
  p.tablero += 1;
  p.letras = [...ABECEDARIO];
  p.fallos = 0;
  p.ciclo = [];
  p.resumen = null;
  p.ultimo = null;
  prepararReto(p, p.retadorId);
  anotar(p, `🆕 Tablero ${p.tablero}: vuelven todas las letras. Reta ${nombre(p, p.retadorId)}.`);
  return { ok: true };
}

/** El anfitrión termina la partida antes de tiempo. */
export function terminar(p) {
  if (p.fase === 'fin') return { ok: false, error: 'La partida ya ha terminado.' };
  finalizar(p);
  return { ok: true };
}

/** Avanza el reloj: si se acaban los 30 s sin elegir letra, es fallo. Devuelve true si algo ha cambiado. */
export function tick(p, ahora = Date.now()) {
  if (p.fase !== 'responder' || !p.limite || ahora < p.limite) return false;
  resolver(p, false, 'se acabó el tiempo');
  return true;
}

/** El anfitrión desbloquea un turno de alguien que no responde. */
export function forzar(p) {
  if (p.fase === 'retar') {
    const ids = elegibles(p);
    if (!ids.length) return { ok: false, error: 'No hay a quién retar.' };
    const rid = ids[Math.floor(Math.random() * ids.length)];
    const cat = p.categorias[Math.floor(Math.random() * p.categorias.length)];
    const quien = p.retadorId;
    anotar(p, `⏩ ${nombre(p, quien)} no respondía: se elige el reto al azar.`);
    return retar(p, quien, { rivalId: rid, categoria: cat });
  }
  if (p.fase === 'turno' || p.fase === 'responder') { resolver(p, false, 'no respondía'); return { ok: true }; }
  if (p.fase === 'validar') { resolver(p, true); return { ok: true }; }
  if (p.fase === 'tablero') return siguienteTablero(p);
  return { ok: false, error: 'No hay nada que forzar.' };
}

export function abandonar(p, id) {
  const j = jug(p, id);
  if (!j || j.fuera || p.fase === 'fin') return;
  j.fuera = true;
  anotar(p, `🚪 ${j.nombre} abandona la partida.`, 'malo');
  if (activos(p).length < 2) { finalizar(p); return; }
  if (['turno', 'responder', 'validar'].includes(p.fase) && p.rivalId === id) { resolver(p, false, 'abandonó'); return; }
  if (p.fase === 'retar' && p.retadorId === id) { prepararReto(p, id); return; }
  if (p.fase === 'retar' && !elegibles(p).length) { prepararReto(p, p.retadorId); return; }
  if (p.fase === 'tablero' && p.retadorId === id) p.retadorId = siguienteActivo(p, id);
}

// ---------------------------------------------------------------- Vista
export function vistaDe(p, yoId) {
  return {
    fase: p.fase,
    tablero: p.tablero,
    tableros: p.tableros,
    letras: [...p.letras],
    fallos: p.fallos,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, fuera: j.fuera, jugado: p.ciclo.includes(j.id) })),
    retadorId: p.retadorId,
    rivalId: p.rivalId,
    elegibles: p.fase === 'retar' ? elegibles(p) : [],
    categorias: p.fase === 'retar' ? [...p.categorias] : [],
    categoria: p.categoria,
    letra: p.fase === 'validar' ? p.letra : null,
    limite: p.limite,
    resumen: p.resumen,
    ultimo: p.ultimo,
    log: p.log.slice(-30),
    nlog: p.nlog,
    fin: p.fin,
    yo: jug(p, yoId) ? { id: yoId } : null
  };
}
