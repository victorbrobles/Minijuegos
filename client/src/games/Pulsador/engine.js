// server/pulsador/engine.js
// Motor puro común a los juegos de pulsador: «El paparazzi» (rasgos), «Luces, Cámara... ¡Música!» (adivina) y
// «Frases Célebres». Lo usan las salas online (server/routes/*.js) y, copiado al cliente con `npm run sync:pulsador`,
// el modo «un solo dispositivo».
//
// Cada ronda muestra un estímulo (una foto recortada, unas pistas que se van destapando, una frase con cuatro
// autores…). El reloj corre; quien pulsa lo detiene y tiene unos segundos para responder. Si acierta se lleva los
// puntos y se resuelve la ronda; si falla, puede perder puntos, queda fuera de la ronda y el reloj sigue.
//
// reglas = {
//   segRonda,            // duración del reloj de la ronda (s)
//   segRespuesta,        // tiempo para responder tras pulsar (s)
//   segPistas: [0, …],   // segundo en el que se destapa cada pista (la primera siempre en 0)
//   puntos: 'segundos' | 'pista' | 'fijo',
//   puntosPista: [10, 5, 3], acierto: 3, fallo: 0 | 1 | 'segundos',
//   respuesta: 'texto' | 'opciones'
// }
// item = { pistas: [{ tipo, etiqueta, valor }], opciones?: [..], correcta?: '..', respuestas?: [..], solucion: {...} }

export const CUENTA_ATRAS_MS = 3000;
export const OPCIONES_RONDAS = [5, 10, 15];

/** Reglas de cada juego (las mismas online y en un dispositivo). */
export const REGLAS = {
  rasgos: { segRonda: 60, segRespuesta: 15, segPistas: [0], puntos: 'segundos', fallo: 'segundos', respuesta: 'texto' },
  adivina: { segRonda: 75, segRespuesta: 20, segPistas: [0, 20, 40], puntos: 'pista', puntosPista: [10, 5, 3], fallo: 0, respuesta: 'texto' },
  frasescelebres: { segRonda: 30, segRespuesta: 10, segPistas: [0], puntos: 'fijo', acierto: 3, fallo: 1, respuesta: 'opciones' },
  hemeroteca: { segRonda: 75, segRespuesta: 20, segPistas: [0, 15, 30, 45], puntos: 'pista', puntosPista: [10, 7, 5, 3], fallo: 0, respuesta: 'texto' },
  acta: { segRonda: 80, segRespuesta: 20, segPistas: [0, 12, 24, 36, 48], puntos: 'pista', puntosPista: [10, 8, 6, 4, 2], fallo: 0, respuesta: 'texto' }
};

// ---------------------------------------------------------------- Respuestas
const RELLENO = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'lo', 'y', 'e', 'a', 'al', 'un', 'una', 'the', 'of', 'and', 'jr']);
const base = (t) => String(t ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
/** Minúsculas, sin tildes ni signos y sin palabras de relleno («el», «the», «de»…). */
export function normalizar(texto) {
  return base(texto).split(' ').filter((p) => p && !RELLENO.has(p)).join(' ');
}
function distancia(a, b) {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}
const tolerancia = (n) => (n >= 14 ? 3 : n >= 9 ? 2 : n >= 5 ? 1 : 0);

/** ¿La respuesta escrita coincide con alguna de las válidas? Perdona tildes, signos, espacios y erratas pequeñas. */
export function coincide(texto, validas = []) {
  // Se compara con y sin palabras de relleno, y sin espacios («therock» = «The Rock»).
  const formas = (t) => [...new Set([normalizar(t), base(t)].map((x) => x.replace(/ /g, '')).filter(Boolean))];
  const mias = formas(texto);
  if (!mias.length) return false;
  return validas.some((v) => formas(v).some((b) => mias.some((a) => a === b || distancia(a, b) <= tolerancia(b.length))));
}

/**
 * Respuesta por palabras clave: vale si contiene todas las palabras de alguno de los grupos
 * (claves: [['liverpool', 'milan'], ['estambul']]). Se perdonan erratas pequeñas en cada palabra.
 */
export function coincideClaves(texto, claves = []) {
  const palabras = base(texto).split(' ').filter(Boolean);
  const unido = palabras.join('');
  const esta = (k) => {
    const kk = base(k).replace(/ /g, '');
    if (!kk) return false;
    if (unido.includes(kk)) return true;
    return palabras.some((w) => w.length >= 4 && distancia(w, kk) <= (kk.length >= 8 ? 2 : kk.length >= 5 ? 1 : 0));
  };
  return claves.some((grupo) => grupo.every(esta));
}

// ---------------------------------------------------------------- Partida
const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);
const nombre = (p, id) => jug(p, id)?.nombre ?? '¿?';
const item = (p) => p.items[p.ronda - 1];

/** Milisegundos de reloj ya consumidos en la ronda (el reloj se para mientras alguien responde). */
export function transcurrido(p, ahora = Date.now()) {
  return p.reloj.acumulado + (p.reloj.desde != null ? Math.max(0, ahora - p.reloj.desde) : 0);
}
const restanteMs = (p, ahora) => Math.max(0, p.reglas.segRonda * 1000 - transcurrido(p, ahora));
export function pistasVisibles(p, ahora = Date.now()) {
  const t = transcurrido(p, ahora) / 1000;
  const seg = p.reglas.segPistas || [0];
  const n = seg.filter((s) => s <= t).length;
  return Math.max(1, Math.min(item(p).pistas.length, p.fase === 'jugando' ? n : item(p).pistas.length));
}
function puntosAhora(p, ahora) {
  const r = p.reglas;
  if (r.puntos === 'segundos') return Math.max(1, Math.ceil(restanteMs(p, ahora) / 1000));
  if (r.puntos === 'pista') {
    const tabla = r.puntosPista || [10, 5, 3];
    return tabla[Math.min(tabla.length, pistasVisibles(p, ahora)) - 1];
  }
  return r.acierto ?? 3;
}
function penalizacion(p, ganados) {
  const f = p.reglas.fallo ?? 0;
  return f === 'segundos' ? ganados : Number(f) || 0;
}

function anotar(p, texto, tipo = 'info') {
  p.nlog += 1;
  p.log.push({ n: p.nlog, texto, tipo });
  if (p.log.length > 40) p.log.shift();
}

export function crearPartida(jugadores, items, reglas, ahora = Date.now()) {
  const p = {
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, aciertos: 0, fuera: false })),
    items, reglas, rondas: items.length, ronda: 0, fase: 'jugando',
    reloj: { acumulado: 0, desde: null }, inicio: null, pulsado: null, bloqueados: [], sumas: {},
    resultado: null, log: [], nlog: 0, fin: null
  };
  empezarRonda(p, ahora);
  return p;
}

function empezarRonda(p, ahora) {
  p.ronda += 1;
  p.fase = 'jugando';
  p.inicio = ahora + CUENTA_ATRAS_MS;
  p.reloj = { acumulado: 0, desde: p.inicio };
  p.pulsado = null;
  p.bloqueados = [];
  p.sumas = {};
  p.resultado = null;
  anotar(p, `Ronda ${p.ronda} de ${p.rondas}.`);
}

function parar(p, ahora) {
  p.reloj = { acumulado: transcurrido(p, ahora), desde: null };
}
function seguir(p, ahora) {
  if (p.reloj.desde == null) p.reloj.desde = Math.max(ahora, p.inicio ?? ahora);
}

function resolver(p, tipo, ahora, ganadorId = null, puntos = 0) {
  parar(p, ahora);
  p.fase = 'resuelta';
  p.pulsado = null;
  p.resultado = { tipo, ganadorId, puntos };
  const sol = item(p).solucion?.titulo ?? '';
  if (tipo === 'acierto') anotar(p, `¡${nombre(p, ganadorId)} acierta: ${sol}! (+${puntos})`, 'acierto');
  else if (tipo === 'tiempo') anotar(p, `Se acabó el tiempo. Era ${sol}.`, 'fallo');
  else if (tipo === 'todos') anotar(p, `Todos habéis fallado. Era ${sol}.`, 'fallo');
  else anotar(p, `Os rendís. Era ${sol}.`, 'fallo');
}

const puedePulsar = (p, id) => {
  const j = id != null ? jug(p, id) : null;
  return !(id != null && (!j || j.fuera || p.bloqueados.includes(id)));
};

/**
 * Alguien pulsa. Online `id` es quien pulsa; en un solo dispositivo puede llegar `null` (se elige después quién fue
 * con `identificar`). El reloj de la ronda se para y empieza la cuenta atrás para responder.
 */
export function pulsar(p, id, ahora = Date.now()) {
  if (p.fase !== 'jugando') return { ok: false, error: 'La ronda ya ha terminado.' };
  if (ahora < p.inicio) return { ok: false, error: '¡Espera a que empiece la ronda!' };
  if (p.pulsado) return { ok: false, error: `${p.pulsado.jugadorId != null ? nombre(p, p.pulsado.jugadorId) : 'Alguien'} ya ha pulsado.` };
  if (!puedePulsar(p, id)) return { ok: false, error: 'Ya has fallado en esta ronda.' };
  const vale = puntosAhora(p, ahora);
  parar(p, ahora);
  p.pulsado = { jugadorId: id ?? null, hasta: ahora + p.reglas.segRespuesta * 1000, vale, texto: '' };
  if (id != null) anotar(p, `🔴 ${nombre(p, id)} ha pulsado.`);
  return { ok: true };
}

/** Un solo dispositivo: tras pulsar, se dice quién ha sido. */
export function identificar(p, id) {
  if (p.fase !== 'jugando' || !p.pulsado) return { ok: false, error: 'Nadie ha pulsado.' };
  if (!puedePulsar(p, id) || id == null) return { ok: false, error: 'Ese jugador ya ha fallado en esta ronda.' };
  p.pulsado.jugadorId = id;
  return { ok: true };
}

/** Cancela una pulsación sin castigo (un solo dispositivo, si se pulsó sin querer). */
export function cancelar(p, ahora = Date.now()) {
  if (p.fase !== 'jugando' || !p.pulsado) return { ok: false, error: 'Nadie ha pulsado.' };
  p.pulsado = null;
  seguir(p, ahora);
  return { ok: true };
}

/** El que ha pulsado va escribiendo (online lo ven los demás). */
export function teclear(p, id, texto) {
  if (p.fase !== 'jugando' || !p.pulsado || p.pulsado.jugadorId !== id) return { ok: false, error: 'No estás respondiendo.' };
  p.pulsado.texto = String(texto ?? '').slice(0, 80);
  return { ok: true };
}

function fallo(p, id, ahora, motivo) {
  const j = jug(p, id);
  const menos = penalizacion(p, p.pulsado?.vale ?? 0);
  if (j) {
    j.puntos -= menos;
    p.sumas[id] = (p.sumas[id] || 0) - menos;
  }
  p.bloqueados.push(id);
  p.pulsado = null;
  anotar(p, `${motivo === 'tiempo' ? '⏰' : '❌'} ${nombre(p, id)} ${motivo === 'tiempo' ? 'no ha respondido a tiempo' : 'ha fallado'}${menos ? ` (−${menos})` : ''}. Queda fuera de esta ronda.`, 'fallo');
  if (activos(p).every((x) => p.bloqueados.includes(x.id))) resolver(p, 'todos', ahora);
  else seguir(p, ahora);
}

export function responder(p, id, respuesta, ahora = Date.now()) {
  if (p.fase !== 'jugando' || !p.pulsado) return { ok: false, error: 'Ahora no se puede responder.' };
  const quien = p.pulsado.jugadorId;
  if (quien == null) return { ok: false, error: 'Elige quién ha pulsado.' };
  if (id != null && id !== quien) return { ok: false, error: 'No te toca responder.' };
  const texto = String(respuesta ?? '').trim().slice(0, 100);
  if (!texto) return { ok: false, error: 'Escribe una respuesta.' };
  const it = item(p);
  const bien = p.reglas.respuesta === 'opciones' ? texto === it.correcta
    : coincide(texto, it.respuestas || []) || (it.claves ? coincideClaves(texto, it.claves) : false);
  if (!bien) {
    fallo(p, quien, ahora, 'mal');
    return { ok: true, correcto: false, texto };
  }
  const gana = p.pulsado.vale;
  const j = jug(p, quien);
  j.puntos += gana;
  j.aciertos += 1;
  p.sumas[quien] = (p.sumas[quien] || 0) + gana;
  resolver(p, 'acierto', ahora, quien, gana);
  return { ok: true, correcto: true, texto };
}

/** Adelanta la siguiente pista (anfitrión online o grupo en un dispositivo). */
export function adelantarPista(p, ahora = Date.now()) {
  if (p.fase !== 'jugando' || p.pulsado) return { ok: false, error: 'Ahora no se puede.' };
  const seg = p.reglas.segPistas || [0];
  const n = pistasVisibles(p, ahora);
  if (n >= Math.min(seg.length, item(p).pistas.length)) return { ok: false, error: 'Ya están todas las pistas.' };
  const objetivo = seg[n] * 1000;
  const extra = objetivo - transcurrido(p, ahora);
  if (extra > 0) p.reloj.acumulado += extra;
  return { ok: true };
}

export function rendirse(p, ahora = Date.now()) {
  if (p.fase !== 'jugando') return { ok: false, error: 'La ronda ya ha terminado.' };
  resolver(p, 'rendicion', ahora);
  return { ok: true };
}

export function tick(p, ahora = Date.now()) {
  if (p.fase !== 'jugando') return false;
  if (p.pulsado) {
    if (ahora < p.pulsado.hasta) return false;
    if (p.pulsado.jugadorId == null) { p.pulsado = null; seguir(p, ahora); anotar(p, 'Nadie dijo quién pulsó: sigue la ronda.'); return true; }
    fallo(p, p.pulsado.jugadorId, ahora, 'tiempo');
    return true;
  }
  if (restanteMs(p, ahora) <= 0) { resolver(p, 'tiempo', ahora); return true; }
  return false;
}

export function siguiente(p, ahora = Date.now()) {
  if (p.fase !== 'resuelta') return { ok: false, error: 'La ronda aún no ha terminado.' };
  if (p.ronda >= p.rondas) { finalizar(p); return { ok: true }; }
  empezarRonda(p, ahora);
  return { ok: true };
}

function finalizar(p) {
  p.fase = 'fin';
  p.pulsado = null;
  const orden = [...p.jugadores].sort((a, b) => (a.fuera - b.fuera) || (b.puntos - a.puntos) || (b.aciertos - a.aciertos));
  const max = Math.max(...activos(p).map((j) => j.puntos), 0);
  let puesto = 0;
  let previo = null;
  const tabla = orden.map((j, i) => {
    if (j.puntos !== previo) { puesto = i + 1; previo = j.puntos; }
    return { id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, fuera: j.fuera, puesto: j.fuera ? null : puesto };
  });
  p.fin = { tabla, ganadores: max > 0 ? activos(p).filter((j) => j.puntos === max).map((j) => j.id) : [], max };
}

export function terminar(p) {
  if (p.fase === 'fin') return { ok: false, error: 'La partida ya ha terminado.' };
  finalizar(p);
  return { ok: true };
}

export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id);
  if (!j || j.fuera || p.fase === 'fin') return;
  j.fuera = true;
  anotar(p, `🚪 ${j.nombre} abandona la partida.`, 'fallo');
  if (!activos(p).length) { finalizar(p); return; }
  if (p.fase !== 'jugando') return;
  if (p.pulsado?.jugadorId === id) { p.pulsado = null; seguir(p, ahora); }
  if (activos(p).every((x) => p.bloqueados.includes(x.id))) resolver(p, 'todos', ahora);
}

/** Lo que puede ver cada jugador: nunca la solución mientras la ronda está en juego. */
export function vistaDe(p, yoId, ahora = Date.now()) {
  const it = item(p);
  const resuelta = p.fase !== 'jugando';
  const n = pistasVisibles(p, ahora);
  return {
    fase: p.fase,
    ronda: p.ronda,
    rondas: p.rondas,
    reglas: p.reglas,
    inicio: p.inicio,
    transcurrido: transcurrido(p, ahora),
    corriendo: p.fase === 'jugando' && p.reloj.desde != null,
    pistas: it.pistas.slice(0, n),
    totalPistas: Math.min(it.pistas.length, (p.reglas.segPistas || [0]).length),
    opciones: it.opciones ?? null,
    vale: p.fase === 'jugando' ? (p.pulsado ? p.pulsado.vale : puntosAhora(p, ahora)) : null,
    pulsado: p.pulsado ? { ...p.pulsado } : null,
    bloqueados: [...p.bloqueados],
    sumas: { ...p.sumas },
    resultado: p.resultado,
    solucion: resuelta ? it.solucion : null,
    correcta: resuelta ? (it.correcta ?? null) : null,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, fuera: j.fuera })),
    log: p.log.slice(-12),
    fin: p.fin,
    yo: jug(p, yoId) ? { id: yoId } : null
  };
}
