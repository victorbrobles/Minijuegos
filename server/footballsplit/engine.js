// server/footballsplit/engine.js
// Motor puro de «FrankensFootball». Lo usan las salas online (server/routes/footballsplit.js) y, copiado al cliente
// con `npm run sync:footballsplit`, el modo «un solo dispositivo».
//
// Cada ronda se muestra una cara hecha con tres trozos de tres futbolistas (pelo, ojos y barbilla). Por turnos,
// cada jugador elige un trozo y dice de quién es: si acierta suma y sigue; si falla o pasa, turno del siguiente.
// La ronda acaba cuando se descubren los tres trozos o cuando todos han tenido su turno.

export const AJUSTES = { min: 2, max: 12, segTurno: 60, puntos: 5, puntosPista: 2 };
export const OPCIONES_RONDAS = [2, 3, 5]; // caras por jugador
export const PARTES = [
  { id: 'top', nombre: 'Pelo' },
  { id: 'middle', nombre: 'Ojos' },
  { id: 'bottom', nombre: 'Barbilla' }
];
const IDS = PARTES.map((x) => x.id);
const nombreParte = (id) => PARTES.find((x) => x.id === id)?.nombre ?? id;

// ---------------------------------------------------------------- Respuestas
const RELLENO = new Set(['de', 'del', 'la', 'el', 'da', 'do', 'dos', 'van', 'von', 'der', 'ter', 'jr', 'junior']);
export function normalizar(texto) {
  return String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
const palabras = (t) => normalizar(t).split(' ').filter((p) => p && !RELLENO.has(p));
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
const parecido = (a, b) => a === b || (b.length >= 6 && distancia(a, b) <= (b.length >= 12 ? 2 : 1));
/** Nombre completo (con erratas pequeñas), o cualquiera de sus palabras de 4+ letras, o varias de sus palabras. */
export function esCorrecta(texto, nombre) {
  const a = normalizar(texto);
  const pa = palabras(texto);
  const pn = palabras(nombre);
  if (!a || !pa.length) return false;
  if (parecido(a, normalizar(nombre))) return true;
  if (pa.length === 1) return pa[0].length >= 4 && pn.some((x) => parecido(pa[0], x));
  return pa.every((w) => pn.some((x) => parecido(w, x)));
}

// ---------------------------------------------------------------- Partida
const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);

function anotar(p, texto, tipo = '') {
  p.nlog += 1;
  p.log.push({ n: p.nlog, texto, tipo });
  if (p.log.length > 60) p.log.shift();
}

/** retos: [{ partes: { top:{jugador,pista,img}, middle, bottom } }] (uno por ronda). */
export function crearPartida(jugadores, retos, ahora = Date.now()) {
  const p = {
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, aciertos: 0, fuera: false })),
    retos,
    rondas: retos.length,
    ronda: 0,
    primero: null,
    turno: null,
    hasta: null,
    resueltas: {},
    pistas: {},
    turnosRonda: 0,
    fase: 'jugando',
    ultimo: null,
    log: [],
    nlog: 0,
    fin: null
  };
  const inicio = p.jugadores[Math.floor(Math.random() * p.jugadores.length)].id;
  empezarRonda(p, inicio, ahora);
  return p;
}

function siguienteActivo(p, desdeId, incluir = false) {
  const idx = Math.max(0, p.jugadores.findIndex((j) => j.id === desdeId));
  for (let k = incluir ? 0 : 1; k <= p.jugadores.length; k++) {
    const j = p.jugadores[(idx + k) % p.jugadores.length];
    if (!j.fuera) return j.id;
  }
  return null;
}

function empezarRonda(p, primeroId, ahora) {
  p.ronda += 1;
  p.resueltas = {};
  p.pistas = {};
  p.turnosRonda = 1;
  p.primero = siguienteActivo(p, primeroId, true);
  p.turno = p.primero;
  p.listo = false; // cada vez que el turno cambia de manos, el jugador pulsa «listo» y entonces corre su reloj
  p.hasta = null;
  p.fase = 'jugando';
  p.ultimo = null;
  anotar(p, `Cara ${p.ronda}: empieza ${jug(p, p.turno)?.nombre}.`);
}

function cerrarRonda(p, motivo) {
  p.fase = 'resuelta';
  p.hasta = null;
  p.motivo = motivo;
  anotar(p, motivo === 'completa' ? '🧩 ¡Cara completa!' : '⏹️ Ya habéis jugado todos: se desvela la cara.');
}

function pasarTurno(p, ahora) {
  const sig = siguienteActivo(p, p.turno);
  if (sig == null || p.turnosRonda >= activos(p).length) { cerrarRonda(p, 'vuelta'); return; }
  p.turno = sig;
  p.turnosRonda += 1;
  p.listo = false;
  p.hasta = null;
}

/** El jugador con el turno pulsa «listo»: empieza su reloj. */
export function listo(p, id, ahora = Date.now()) {
  if (p.fase !== 'jugando') return { ok: false, error: 'La ronda ya ha terminado.' };
  if (id != null && id !== p.turno) return { ok: false, error: 'No es tu turno.' };
  if (p.listo) return { ok: true };
  p.listo = true;
  p.hasta = ahora + AJUSTES.segTurno * 1000;
  return { ok: true };
}

export function responder(p, id, parte, texto, ahora = Date.now()) {
  if (p.fase !== 'jugando') return { ok: false, error: 'La ronda ya ha terminado.' };
  if (id !== p.turno) return { ok: false, error: 'No es tu turno.' };
  if (!p.listo) return { ok: false, error: 'Pulsa «listo» para empezar tu turno.' };
  if (!IDS.includes(parte) || p.resueltas[parte]) return { ok: false, error: 'Elige un trozo de la cara sin resolver.' };
  if (!String(texto || '').trim()) return { ok: false, error: 'Escribe un futbolista.' };
  const real = p.retos[p.ronda - 1].partes[parte].jugador;
  const j = jug(p, id);
  if (esCorrecta(texto, real)) {
    const pts = p.pistas[parte] ? AJUSTES.puntosPista : AJUSTES.puntos;
    j.puntos += pts;
    j.aciertos += 1;
    p.resueltas[parte] = { jugadorId: id, puntos: pts };
    p.ultimo = { ok: true, jugadorId: id, parte, futbolista: real, puntos: pts };
    anotar(p, `✅ ${j.nombre} acierta el ${nombreParte(parte).toLowerCase()}: ${real} (+${pts}).`, 'bueno');
    if (IDS.every((x) => p.resueltas[x])) cerrarRonda(p, 'completa');
    else p.hasta = ahora + AJUSTES.segTurno * 1000;
    return { ok: true, correcto: true };
  }
  p.ultimo = { ok: false, jugadorId: id, parte, texto: String(texto).trim().slice(0, 40) };
  anotar(p, `❌ ${j.nombre} falla con «${String(texto).trim().slice(0, 40)}».`, 'malo');
  pasarTurno(p, ahora);
  return { ok: true, correcto: false };
}

export function pista(p, id, parte) {
  if (p.fase !== 'jugando') return { ok: false, error: 'La ronda ya ha terminado.' };
  if (id != null && id !== p.turno) return { ok: false, error: 'Solo quien tiene el turno puede pedir pista.' };
  if (!p.listo) return { ok: false, error: 'Pulsa «listo» para empezar tu turno.' };
  if (!IDS.includes(parte) || p.resueltas[parte]) return { ok: false, error: 'Ese trozo ya está resuelto.' };
  if (!p.pistas[parte]) anotar(p, `💡 Pista para el ${nombreParte(parte).toLowerCase()}.`);
  p.pistas[parte] = true;
  return { ok: true };
}

export function pasar(p, id, ahora = Date.now()) {
  if (p.fase !== 'jugando') return { ok: false, error: 'La ronda ya ha terminado.' };
  if (id != null && id !== p.turno) return { ok: false, error: 'No es tu turno.' };
  p.ultimo = { ok: false, jugadorId: p.turno, pasa: true };
  anotar(p, `⏭️ ${jug(p, p.turno)?.nombre} pasa.`);
  pasarTurno(p, ahora);
  return { ok: true };
}

export function tick(p, ahora = Date.now()) {
  if (p.fase !== 'jugando' || !p.listo || !p.hasta || ahora < p.hasta) return false;
  p.ultimo = { ok: false, jugadorId: p.turno, tiempo: true };
  anotar(p, `⏰ Se acabó el tiempo de ${jug(p, p.turno)?.nombre}.`, 'malo');
  pasarTurno(p, ahora);
  return true;
}

export function siguiente(p, ahora = Date.now()) {
  if (p.fase !== 'resuelta') return { ok: false, error: 'La ronda aún no ha terminado.' };
  if (p.ronda >= p.rondas) { finalizar(p); return { ok: true }; }
  empezarRonda(p, siguienteActivo(p, p.primero), ahora);
  return { ok: true };
}

function finalizar(p) {
  p.fase = 'fin';
  p.hasta = null;
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
  anotar(p, `🚪 ${j.nombre} abandona la partida.`, 'malo');
  if (!activos(p).length) { finalizar(p); return; }
  if (p.primero === id) p.primero = siguienteActivo(p, id);
  if (p.fase === 'jugando' && p.turno === id) { p.turnosRonda -= 1; pasarTurno(p, ahora); }
}

export function vistaDe(p, yoId) {
  const reto = p.retos[p.ronda - 1];
  const resuelta = p.fase !== 'jugando';
  return {
    fase: p.fase,
    ronda: p.ronda,
    rondas: p.rondas,
    turno: p.turno,
    listo: Boolean(p.listo),
    hasta: p.hasta,
    motivo: p.motivo,
    partes: Object.fromEntries(IDS.map((k) => {
      const x = reto.partes[k];
      const r = p.resueltas[k];
      return [k, {
        img: x.img,
        resuelta: Boolean(r),
        jugadorId: r?.jugadorId ?? null,
        puntos: r?.puntos ?? null,
        futbolista: r || resuelta ? x.jugador : null,
        pista: p.pistas[k] || resuelta ? x.pista : null
      }];
    })),
    ultimo: p.ultimo,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, fuera: j.fuera })),
    log: p.log.slice(-30),
    fin: p.fin,
    yo: jug(p, yoId) ? { id: yoId } : null
  };
}
