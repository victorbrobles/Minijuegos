// server/descarte/engine.js
// Motor puro de «¡Descarta y Elimina!». Lo usan las salas online (server/routes/descarte.js) y, copiado al cliente
// con `npm run sync:descarte`, el modo «un solo dispositivo». No guarda estado propio: todo vive en el objeto partida.
//
// Dinámica: el RETADOR elige a un rival (que aún no haya jugado en la vuelta) y le pone una de tres categorías.
// El rival tiene 30 s para decir una palabra de esa categoría que empiece por una letra que siga en el tablero.
// Si vale, la letra se elimina y el rival suma sus puntos (1, 2 o 3 según lo difícil que sea la letra).
// Después, el rival pasa a ser el retador. El tablero acaba cuando no quedan letras o fallan todos seguidos.
//
// Online la palabra se escribe y el resto de jugadores la revisa (mayoría para rechazarla; si nadie dice nada, vale).
// En un solo dispositivo la palabra se dice en voz alta y el grupo marca la letra y si es correcta.

export const LETRAS = [
  { l: 'A', pts: 1 }, { l: 'B', pts: 1 }, { l: 'C', pts: 1 }, { l: 'D', pts: 1 }, { l: 'E', pts: 1 },
  { l: 'F', pts: 2 }, { l: 'G', pts: 2 }, { l: 'H', pts: 2 }, { l: 'I', pts: 2 }, { l: 'J', pts: 3 },
  { l: 'K', pts: 3 }, { l: 'L', pts: 1 }, { l: 'M', pts: 1 }, { l: 'N', pts: 2 }, { l: 'Ñ', pts: 3 },
  { l: 'O', pts: 2 }, { l: 'P', pts: 1 }, { l: 'Q', pts: 3 }, { l: 'R', pts: 1 }, { l: 'S', pts: 1 },
  { l: 'T', pts: 1 }, { l: 'U', pts: 2 }, { l: 'V', pts: 2 }, { l: 'W', pts: 3 }, { l: 'X', pts: 3 },
  { l: 'Y', pts: 3 }, { l: 'Z', pts: 3 }
];
export const PUNTOS = Object.fromEntries(LETRAS.map((x) => [x.l, x.pts]));
const ABECEDARIO = LETRAS.map((x) => x.l);

export const AJUSTES = { min: 3, max: 12, segundosRespuesta: 30, segundosRevision: 12 };
export const OPCIONES_TABLEROS = [3, 5, 7];

const barajar = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Letra del tablero por la que empieza una palabra (sin tildes; la Ñ cuenta como letra propia). */
export function primeraLetra(palabra) {
  const c = String(palabra || '').trim().charAt(0).toUpperCase();
  if (c === 'Ñ') return 'Ñ';
  const base = c.normalize('NFD').replace(/[̀-ͯ]/g, '');
  return ABECEDARIO.includes(base) ? base : null;
}

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
  p.palabra = '';
  p.letra = null;
  p.votos = {};
  p.limite = null;
  if (activos(p).filter((j) => j.id !== p.retadorId && !p.ciclo.includes(j.id)).length === 0) p.ciclo = [];
  sacarCategorias(p);
  p.fase = 'retar';
}

export function crearPartida(jugadores, config = {}, categorias = []) {
  const lista = jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, aciertos: 0, fuera: false }));
  const p = {
    jugadores: lista,
    tableros: OPCIONES_TABLEROS.includes(Number(config.tableros)) ? Number(config.tableros) : 5,
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
    palabra: '',
    letra: null,
    votos: {},
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
    p.ultimo = { ok: true, jugadorId: rivalId, letra: p.letra, palabra: p.palabra, pts, categoria: p.categoria };
    anotar(p, `✅ ${nombre(p, rivalId)}${p.palabra ? ` dijo «${p.palabra}»` : ' acertó'} por la ${p.letra} (+${pts}) en «${p.categoria}».`, 'bueno');
  } else {
    p.fallos += 1;
    p.ultimo = { ok: false, jugadorId: rivalId, palabra: p.palabra, motivo, categoria: p.categoria };
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
export function retar(p, id, { rivalId, categoria } = {}, ahora = Date.now()) {
  if (p.fase !== 'retar') return { ok: false, error: 'Ahora no toca retar.' };
  if (id !== p.retadorId) return { ok: false, error: 'No eres el retador.' };
  const rid = Number(rivalId);
  if (!elegibles(p).includes(rid)) return { ok: false, error: 'Ese jugador no puede ser retado ahora.' };
  if (!p.categorias.includes(categoria)) return { ok: false, error: 'Elige una de las tres categorías.' };
  p.rivalId = rid;
  p.categoria = categoria;
  p.palabra = '';
  p.letra = null;
  p.votos = {};
  p.fase = 'responder';
  p.limite = ahora + AJUSTES.segundosRespuesta * 1000;
  anotar(p, `🎯 ${nombre(p, id)} reta a ${nombre(p, rid)} con «${categoria}».`);
  return { ok: true };
}

/** Online: el rival escribe su palabra; pasa a revisión de los demás. */
export function proponer(p, id, palabra, ahora = Date.now()) {
  if (p.fase !== 'responder') return { ok: false, error: 'Ahora no se puede responder.' };
  if (id !== p.rivalId) return { ok: false, error: 'No es tu reto.' };
  const texto = String(palabra || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  if (texto.length < 2) return { ok: false, error: 'Escribe una palabra.' };
  const letra = primeraLetra(texto);
  if (!letra) return { ok: false, error: 'La palabra tiene que empezar por una letra.' };
  if (!p.letras.includes(letra)) return { ok: false, error: `La ${letra} ya está eliminada: prueba con otra letra.` };
  p.palabra = texto;
  p.letra = letra;
  p.votos = {};
  if (activos(p).filter((j) => j.id !== id).length === 0) { resolver(p, true); return { ok: true }; }
  p.fase = 'revision';
  p.limite = ahora + AJUSTES.segundosRevision * 1000;
  return { ok: true };
}

function cerrarRevision(p, final) {
  const jueces = activos(p).filter((j) => j.id !== p.rivalId).map((j) => j.id);
  const votos = jueces.map((jid) => p.votos[jid]).filter((x) => x !== undefined);
  const si = votos.filter(Boolean).length;
  const no = votos.length - si;
  if (no * 2 > jueces.length) return resolver(p, false, 'los demás no la aceptan');
  if (si * 2 >= jueces.length && si > 0) return resolver(p, true);
  if (final) return no > si ? resolver(p, false, 'los demás no la aceptan') : resolver(p, true);
  return undefined;
}

/** Online: un jugador (que no sea el rival) acepta o rechaza la palabra. */
export function votar(p, id, valida) {
  if (p.fase !== 'revision') return { ok: false, error: 'No hay ninguna palabra que revisar.' };
  if (id === p.rivalId) return { ok: false, error: 'No puedes votar tu propia palabra.' };
  const j = jug(p, id);
  if (!j || j.fuera) return { ok: false, error: 'No estás en la partida.' };
  p.votos[id] = Boolean(valida);
  const jueces = activos(p).filter((x) => x.id !== p.rivalId);
  cerrarRevision(p, jueces.every((x) => p.votos[x.id] !== undefined));
  return { ok: true };
}

/** El anfitrión decide directamente si la palabra vale (en revisión). */
export function arbitrar(p, valida) {
  if (p.fase !== 'revision') return { ok: false, error: 'No hay ninguna palabra que revisar.' };
  resolver(p, Boolean(valida), valida ? '' : 'el anfitrión no la acepta');
  return { ok: true };
}

/** El rival se rinde: cuenta como fallo. */
export function rendirse(p, id) {
  if (p.fase !== 'responder' || id !== p.rivalId) return { ok: false, error: 'Ahora no puedes pasar.' };
  resolver(p, false, 'se ha rendido');
  return { ok: true };
}

/** Un solo dispositivo: el grupo marca la letra que se ha dicho (o null si ha fallado). */
export function marcar(p, letra) {
  if (p.fase !== 'responder') return { ok: false, error: 'Ahora no se puede marcar.' };
  if (letra == null) { resolver(p, false, 'no ha valido'); return { ok: true }; }
  if (!p.letras.includes(letra)) return { ok: false, error: 'Esa letra ya está eliminada.' };
  p.letra = letra;
  p.palabra = '';
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

/** Avanza el reloj: se acaba el tiempo de respuesta o de revisión. Devuelve true si algo ha cambiado. */
export function tick(p, ahora = Date.now()) {
  if (!p.limite || ahora < p.limite) return false;
  if (p.fase === 'responder') { resolver(p, false, 'se acabó el tiempo'); return true; }
  if (p.fase === 'revision') { cerrarRevision(p, true); return true; }
  return false;
}

/** El anfitrión desbloquea un turno de alguien que no responde. */
export function forzar(p, ahora = Date.now()) {
  if (p.fase === 'retar') {
    const ids = elegibles(p);
    if (!ids.length) return { ok: false, error: 'No hay a quién retar.' };
    const rid = ids[Math.floor(Math.random() * ids.length)];
    const cat = p.categorias[Math.floor(Math.random() * p.categorias.length)];
    const quien = p.retadorId;
    anotar(p, `⏩ ${nombre(p, quien)} no respondía: se elige el reto al azar.`);
    return retar(p, quien, { rivalId: rid, categoria: cat }, ahora);
  }
  if (p.fase === 'responder') { resolver(p, false, 'no respondía'); return { ok: true }; }
  if (p.fase === 'revision') { cerrarRevision(p, true); return { ok: true }; }
  if (p.fase === 'tablero') return siguienteTablero(p);
  return { ok: false, error: 'No hay nada que forzar.' };
}

export function abandonar(p, id) {
  const j = jug(p, id);
  if (!j || j.fuera || p.fase === 'fin') return;
  j.fuera = true;
  anotar(p, `🚪 ${j.nombre} abandona la partida.`, 'malo');
  if (activos(p).length < 2) { finalizar(p); return; }
  if ((p.fase === 'responder' || p.fase === 'revision') && p.rivalId === id) { resolver(p, false, 'abandonó'); return; }
  if (p.fase === 'retar' && p.retadorId === id) { prepararReto(p, id); return; }
  if (p.fase === 'retar' && !elegibles(p).length) { prepararReto(p, p.retadorId); return; }
  if (p.fase === 'tablero' && p.retadorId === id) { p.retadorId = siguienteActivo(p, id); return; }
  if (p.fase === 'revision') cerrarRevision(p, false);
}

// ---------------------------------------------------------------- Vista
export function vistaDe(p, yoId) {
  const jueces = activos(p).filter((j) => j.id !== p.rivalId);
  const votos = Object.entries(p.votos).map(([k, x]) => ({ id: Number(k), valida: x }));
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
    palabra: p.fase === 'revision' ? p.palabra : '',
    letra: p.fase === 'revision' ? p.letra : null,
    votos: p.fase === 'revision' ? votos : [],
    jueces: jueces.length,
    limite: p.limite,
    resumen: p.resumen,
    ultimo: p.ultimo,
    log: p.log.slice(-30),
    fin: p.fin,
    yo: jug(p, yoId) ? { id: yoId } : null
  };
}
