// server/logos/engine.js
// Motor puro de «Logo Mania» (logos). Lo usan las salas online (server/routes/logos.js) y, copiado al cliente con
// `npm run sync:logos-motor`, el modo «un solo dispositivo».
//
// Cada ronda sale un logo y un reloj. Cada jugador responde una vez: si acierta suma los segundos que quedaban, si
// falla los resta y si pasa no arriesga nada. Online responden todos a la vez; en un dispositivo, por turnos (cada uno
// con su reloj, sin ver lo que han dicho los demás).

export const AJUSTES = { min: 1, max: 12, segRonda: 45 };
export const OPCIONES_RONDAS = [10, 15, 20];

// ---------------------------------------------------------------- Respuestas
const normalizar = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
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
/** Perdona mayúsculas, tildes, espacios y erratas pequeñas (1 en nombres de 5+ letras, 2 en los de 10+). */
export function esCorrecta(texto, validas) {
  const a = normalizar(texto);
  if (!a) return false;
  return validas.map(normalizar).filter(Boolean).some((b) => a === b || (b.length >= 5 && distancia(a, b) <= (b.length >= 10 ? 2 : 1)));
}

// ---------------------------------------------------------------- Partida
const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);
const nombre = (p, id) => jug(p, id)?.nombre ?? '¿?';
const logo = (p) => p.items[p.ronda - 1];
const segundosQuedan = (hasta, ahora) => Math.max(0, Math.ceil((hasta - ahora) / 1000));

function anotar(p, texto, tipo = 'info') {
  p.nlog += 1;
  p.log.push({ n: p.nlog, texto, tipo });
  if (p.log.length > 40) p.log.shift();
}

/** items: [{ imagen, nombre, validas: [..] }]. reglas: { porTurnos } (un dispositivo). */
export function crearPartida(jugadores, items, reglas = {}, ahora = Date.now()) {
  const p = {
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, aciertos: 0, fuera: false })),
    items, reglas: { porTurnos: Boolean(reglas.porTurnos), segRonda: reglas.segRonda || AJUSTES.segRonda },
    rondas: items.length, ronda: 0, fase: 'jugando', hasta: null, jugadas: {}, turnoIdx: 0, listo: false,
    log: [], nlog: 0, fin: null
  };
  empezarRonda(p, ahora);
  return p;
}

function empezarRonda(p, ahora) {
  p.ronda += 1;
  p.fase = 'jugando';
  p.jugadas = {};
  p.turnoIdx = 0;
  if (p.reglas.porTurnos) {
    saltarFuera(p);
    p.listo = false;
    p.hasta = null;
  } else {
    p.listo = true;
    p.hasta = ahora + p.reglas.segRonda * 1000;
  }
}

const enTurno = (p) => (p.reglas.porTurnos ? activos(p)[p.turnoIdx]?.id ?? null : null);
function saltarFuera(p) {
  const vivos = activos(p);
  while (p.turnoIdx < vivos.length && p.jugadas[vivos[p.turnoIdx].id]) p.turnoIdx += 1;
}

function quizasCerrar(p) {
  if (activos(p).every((j) => p.jugadas[j.id])) {
    p.fase = 'resuelta';
    p.hasta = null;
    const bien = activos(p).filter((j) => p.jugadas[j.id].acierto).length;
    anotar(p, `Era ${logo(p).nombre}: ${bien} ${bien === 1 ? 'acierto' : 'aciertos'}.`);
    return;
  }
  if (p.reglas.porTurnos) {
    saltarFuera(p);
    p.listo = false;
    p.hasta = null;
  }
}

/** Un dispositivo: el jugador del turno ya tiene el móvil; empieza su reloj. */
export function listo(p, id, ahora = Date.now()) {
  if (p.fase !== 'jugando' || !p.reglas.porTurnos) return { ok: false, error: 'Ahora no.' };
  if (id != null && id !== enTurno(p)) return { ok: false, error: 'No es tu turno.' };
  if (!p.listo) { p.listo = true; p.hasta = ahora + p.reglas.segRonda * 1000; }
  return { ok: true };
}

function quien(p, id) {
  if (p.fase !== 'jugando') return { error: 'La ronda ya ha terminado.' };
  const q = p.reglas.porTurnos ? enTurno(p) : id;
  if (p.reglas.porTurnos && id != null && id !== q) return { error: 'No es tu turno.' };
  if (p.reglas.porTurnos && !p.listo) return { error: 'Pulsa «¡Listo!» primero.' };
  const j = jug(p, q);
  if (!j || j.fuera) return { error: 'No estás en la partida.' };
  if (p.jugadas[q]) return { error: 'Ya has respondido en esta ronda.' };
  return { j };
}

export function responder(p, id, texto, ahora = Date.now()) {
  const { j, error } = quien(p, id);
  if (error) return { ok: false, error };
  const t = String(texto ?? '').trim().slice(0, 60);
  if (!t) return { ok: false, error: 'Escribe la marca.' };
  const seg = Math.max(1, segundosQuedan(p.hasta, ahora));
  const acierto = esCorrecta(t, logo(p).validas);
  const delta = acierto ? seg : -seg;
  j.puntos += delta;
  if (acierto) j.aciertos += 1;
  p.jugadas[j.id] = { texto: t, acierto, delta };
  quizasCerrar(p);
  return { ok: true, acierto, delta };
}

export function pasar(p, id) {
  const { j, error } = quien(p, id);
  if (error) return { ok: false, error };
  p.jugadas[j.id] = { texto: null, acierto: false, delta: 0, paso: true };
  quizasCerrar(p);
  return { ok: true };
}

export function tick(p, ahora = Date.now()) {
  if (p.fase !== 'jugando' || !p.hasta || ahora < p.hasta) return false;
  if (p.reglas.porTurnos) {
    const id = enTurno(p);
    if (id != null) p.jugadas[id] = { texto: null, acierto: false, delta: 0, tiempo: true };
  } else {
    activos(p).forEach((j) => { if (!p.jugadas[j.id]) p.jugadas[j.id] = { texto: null, acierto: false, delta: 0, tiempo: true }; });
  }
  quizasCerrar(p);
  return true;
}

export function siguiente(p, ahora = Date.now()) {
  if (p.fase !== 'resuelta') return { ok: false, error: 'La ronda aún no ha terminado.' };
  if (p.ronda >= p.rondas) { finalizar(p); return { ok: true }; }
  empezarRonda(p, ahora);
  return { ok: true };
}

function finalizar(p) {
  p.fase = 'fin';
  p.hasta = null;
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

export function abandonar(p, id) {
  const j = jug(p, id);
  if (!j || j.fuera || p.fase === 'fin') return;
  const eraSuTurno = enTurno(p) === id;
  j.fuera = true;
  anotar(p, `🚪 ${j.nombre} abandona la partida.`, 'malo');
  if (!activos(p).length) { finalizar(p); return; }
  if (p.fase !== 'jugando') return;
  if (p.reglas.porTurnos) {
    // Al quitarle de la lista de activos, el índice ya apunta al siguiente
    const vivos = activos(p);
    if (!eraSuTurno) p.turnoIdx = vivos.findIndex((x) => !p.jugadas[x.id]);
    else { p.listo = false; p.hasta = null; }
    if (p.turnoIdx < 0) p.turnoIdx = vivos.length;
  }
  quizasCerrar(p);
}

/** El nombre de la marca solo viaja al acabar la ronda; lo que responde cada uno, también. */
export function vistaDe(p, yoId) {
  const it = logo(p);
  const resuelta = p.fase !== 'jugando';
  const turno = enTurno(p);
  return {
    fase: p.fase,
    ronda: p.ronda,
    rondas: p.rondas,
    reglas: p.reglas,
    imagen: it.imagen,
    solucion: resuelta ? it.nombre : null,
    hasta: p.hasta,
    listo: p.listo,
    turno,
    jugadas: Object.fromEntries(Object.entries(p.jugadas).map(([id, x]) => [id, resuelta || Number(id) === yoId ? x : { hecho: true }])),
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, fuera: j.fuera })),
    log: p.log.slice(-10),
    fin: p.fin,
    yo: jug(p, yoId) ? { id: yoId } : null
  };
}
