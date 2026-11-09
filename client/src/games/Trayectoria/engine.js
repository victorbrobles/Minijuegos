// server/trayectoria/engine.js
// Motor puro de «Modo carrera». Lo usan las salas online (server/routes/trayectoria.js) y, copiado al cliente con
// `npm run sync:trayectoria`, el modo «un solo dispositivo». No guarda estado propio: todo vive en el objeto partida.
//
// Cada ronda es un futbolista: sus clubes aparecen uno a uno (cada pocos segundos). Quien crea saberlo pulsa: el
// reloj se para y tiene unos segundos para escribirlo. Cuantos menos clubes se hayan visto, más puntos.
// Fallar resta un punto y deja fuera de esa ronda. Tras el último club queda un margen (y en los retos difíciles
// aparece una pista); si nadie acierta, se revela la solución.

export const AJUSTES = {
  min: 2,
  max: 15,
  segClub: 6,
  segRespuesta: 20,
  segTrasUltimo: 15,
  segPista: 15,
  puntosMax: 5,
  puntosTodos: 2,
  puntosPista: 1,
  puntosFallo: 1
};
export const OPCIONES_RONDAS = [5, 10, 15];
export const DIFICULTADES = [
  { id: 'mixta', nombre: 'Mixta' },
  { id: 'baja', nombre: 'Fácil' },
  { id: 'media', nombre: 'Media' },
  { id: 'alta', nombre: 'Difícil' }
];

// ---------------------------------------------------------------- Respuestas
const RELLENO = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', 'da', 'do', 'dos', 'van', 'von', 'der']);
export function normalizar(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((p) => p && !RELLENO.has(p))
    .join(' ');
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
/** Acepta el nombre o cualquier alias, sin tildes y con pequeñas erratas en nombres largos. */
export function esCorrecta(intento, reto) {
  const a = normalizar(intento);
  if (!a) return false;
  return [reto.nombre, ...(reto.alias || [])].some((v) => {
    const b = normalizar(v);
    if (!b) return false;
    if (a === b) return true;
    const tolerancia = b.length >= 12 ? 2 : b.length >= 6 ? 1 : 0;
    return tolerancia > 0 && distancia(a, b) <= tolerancia;
  });
}

// ---------------------------------------------------------------- Utilidades
const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);
const nombre = (p, id) => jug(p, id)?.nombre ?? '¿?';
const reto = (p) => p.retos[p.ronda - 1];
const hayPista = (r) => r.dificultad === 'alta' && Boolean(r.pista);

function anotar(p, texto, tipo = '') {
  p.nlog += 1;
  p.log.push({ n: p.nlog, texto, tipo });
  if (p.log.length > 60) p.log.shift();
}

/** Puntos que vale acertar ahora mismo. */
export function puntosAhora(p) {
  const r = reto(p);
  const e = p.estado;
  if (e.pistaVisible) return AJUSTES.puntosPista;
  const ocultos = r.clubes.length - e.reveladas;
  return Math.max(AJUSTES.puntosTodos, Math.min(AJUSTES.puntosMax, 1 + ocultos));
}

/** Duración (ms) de la etapa actual del reloj de la ronda. */
function duracionEtapa(p) {
  const r = reto(p);
  const e = p.estado;
  if (e.reveladas < r.clubes.length) return AJUSTES.segClub * 1000;
  return (e.pistaVisible ? AJUSTES.segPista : AJUSTES.segTrasUltimo) * 1000;
}

function empezarRonda(p, ahora) {
  p.estado = {
    reveladas: 1,
    pistaVisible: false,
    desde: ahora,
    pausadoEn: null,
    bloqueados: [],
    pulsado: null,
    sumas: {},
    resultado: null
  };
  p.fase = 'jugando';
}

export function crearPartida(jugadores, retos, ahora = Date.now()) {
  const p = {
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, aciertos: 0, fuera: false })),
    retos,
    rondas: retos.length,
    ronda: 1,
    fase: 'jugando',
    estado: null,
    log: [],
    nlog: 0,
    fin: null
  };
  empezarRonda(p, ahora);
  anotar(p, `Empieza la partida: ${p.rondas} futbolistas.`);
  return p;
}

function resolver(p, tipo, jugadorId = null, puntos = 0) {
  const r = reto(p);
  const e = p.estado;
  e.pulsado = null;
  e.pausadoEn = null;
  e.resultado = { tipo, jugadorId, puntos, solucion: r.nombre };
  p.fase = 'resuelta';
  if (tipo === 'acierto') anotar(p, `✅ ${nombre(p, jugadorId)} acierta: era ${r.nombre} (+${puntos}).`, 'bueno');
  else anotar(p, `⚽ Nadie lo ha sacado: era ${r.nombre}.`);
}

function finalizar(p) {
  p.fase = 'fin';
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

/** Avanza el reloj de la ronda (clubes, pista, tiempo de respuesta). Devuelve true si algo cambia. */
export function tick(p, ahora = Date.now()) {
  if (p.fase !== 'jugando') return false;
  const e = p.estado;
  let cambio = false;
  if (e.pulsado) {
    if (ahora >= e.pulsado.hasta) { fallar(p, e.pulsado.jugadorId, ahora, 'se le acabó el tiempo'); return true; }
    return false;
  }
  if (e.pausadoEn != null) return false;
  const r = reto(p);
  let guard = 0;
  while (p.fase === 'jugando' && ahora - e.desde >= duracionEtapa(p) && guard++ < 50) {
    e.desde += duracionEtapa(p);
    if (e.reveladas < r.clubes.length) e.reveladas += 1;
    else resolver(p, 'nadie');
    cambio = true;
  }
  return cambio;
}

function reanudar(p, ahora) {
  const e = p.estado;
  if (e.pausadoEn != null) e.desde += ahora - e.pausadoEn;
  e.pausadoEn = null;
}

function fallar(p, id, ahora, motivo) {
  const e = p.estado;
  const j = jug(p, id);
  if (j) {
    const antes = j.puntos;
    j.puntos = Math.max(0, j.puntos - AJUSTES.puntosFallo);
    e.sumas[id] = (e.sumas[id] || 0) + (j.puntos - antes);
  }
  if (!e.bloqueados.includes(id)) e.bloqueados.push(id);
  e.pulsado = null;
  anotar(p, `❌ ${nombre(p, id)} falla${motivo ? ` (${motivo})` : ''} y queda fuera de esta ronda.`, 'malo');
  if (activos(p).every((x) => e.bloqueados.includes(x.id))) { resolver(p, 'nadie'); return; }
  reanudar(p, ahora);
}

// ---------------------------------------------------------------- Acciones
export function pulsar(p, id, ahora = Date.now()) {
  tick(p, ahora);
  if (p.fase !== 'jugando') return { ok: false, error: 'La ronda ya ha terminado.' };
  const e = p.estado;
  const j = jug(p, id);
  if (!j || j.fuera) return { ok: false, error: 'No estás en la partida.' };
  if (e.pulsado) return { ok: false, error: `${nombre(p, e.pulsado.jugadorId)} ya ha pulsado.` };
  if (e.bloqueados.includes(id)) return { ok: false, error: 'Ya has fallado en esta ronda.' };
  e.pulsado = { jugadorId: id, hasta: ahora + AJUSTES.segRespuesta * 1000, puntos: puntosAhora(p) };
  if (e.pausadoEn == null) e.pausadoEn = ahora;
  return { ok: true };
}

/** Un solo dispositivo: para el reloj (alguien ha pulsado y se está eligiendo quién, o pausa manual). */
export function pausar(p, ahora = Date.now()) {
  tick(p, ahora);
  if (p.fase !== 'jugando' || p.estado.pulsado || p.estado.pausadoEn != null) return { ok: false, error: 'No se puede pausar ahora.' };
  p.estado.pausadoEn = ahora;
  return { ok: true };
}

export function seguir(p, ahora = Date.now()) {
  if (p.fase !== 'jugando' || p.estado.pulsado) return { ok: false, error: 'No se puede seguir ahora.' };
  reanudar(p, ahora);
  return { ok: true };
}

export function cancelarPulsado(p, ahora = Date.now()) {
  const e = p.estado;
  if (p.fase !== 'jugando' || !e.pulsado) return { ok: false, error: 'Nadie ha pulsado.' };
  e.pulsado = null;
  reanudar(p, ahora);
  return { ok: true };
}

export function responder(p, id, texto, ahora = Date.now()) {
  if (p.fase !== 'jugando') return { ok: false, error: 'La ronda ya ha terminado.' };
  const e = p.estado;
  if (!e.pulsado || e.pulsado.jugadorId !== id) return { ok: false, error: 'No es tu turno de responder.' };
  if (ahora >= e.pulsado.hasta) { fallar(p, id, ahora, 'se le acabó el tiempo'); return { ok: true, correcto: false }; }
  if (!String(texto || '').trim()) return { ok: false, error: 'Escribe un nombre.' };
  const r = reto(p);
  if (esCorrecta(texto, r)) {
    const pts = e.pulsado.puntos;
    const j = jug(p, id);
    j.puntos += pts;
    j.aciertos += 1;
    e.sumas[id] = (e.sumas[id] || 0) + pts;
    resolver(p, 'acierto', id, pts);
    return { ok: true, correcto: true };
  }
  fallar(p, id, ahora, `dijo «${String(texto).trim().slice(0, 40)}»`);
  return { ok: true, correcto: false };
}

/** Con todos los clubes a la vista, cualquiera puede pedir la pista (vale menos acertar, y da algo más de tiempo). */
export function desvelarPista(p, ahora = Date.now()) {
  tick(p, ahora);
  if (p.fase !== 'jugando') return { ok: false, error: 'La ronda ya ha terminado.' };
  const r = reto(p);
  const e = p.estado;
  if (!hayPista(r)) return { ok: false, error: 'Este futbolista no tiene pista.' };
  if (e.reveladas < r.clubes.length) return { ok: false, error: 'La pista se puede ver cuando hayan salido todos los clubes.' };
  if (e.pistaVisible) return { ok: false, error: 'La pista ya está a la vista.' };
  if (e.pulsado) return { ok: false, error: 'Espera a que responda quien ha pulsado.' };
  e.pistaVisible = true;
  if (e.pausadoEn == null) e.desde = ahora; else e.desde = e.pausadoEn;
  anotar(p, '💡 Se desvela la pista.');
  return { ok: true };
}

/** Se rinden todos (o el anfitrión salta el futbolista): se ve la solución. */
export function rendirse(p) {
  if (p.fase !== 'jugando') return { ok: false, error: 'La ronda ya ha terminado.' };
  resolver(p, 'nadie');
  return { ok: true };
}

export function siguiente(p, ahora = Date.now()) {
  if (p.fase !== 'resuelta') return { ok: false, error: 'La ronda aún no ha terminado.' };
  if (p.ronda >= p.rondas) { finalizar(p); return { ok: true }; }
  p.ronda += 1;
  empezarRonda(p, ahora);
  return { ok: true };
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
  if (p.fase !== 'jugando') return;
  const e = p.estado;
  if (e.pulsado?.jugadorId === id) { e.pulsado = null; reanudar(p, ahora); }
  if (activos(p).every((x) => e.bloqueados.includes(x.id))) resolver(p, 'nadie');
}

// ---------------------------------------------------------------- Vista
export function vistaDe(p, yoId) {
  const r = reto(p);
  const e = p.estado;
  const resuelta = p.fase !== 'jugando';
  const n = resuelta ? r.clubes.length : e.reveladas;
  const pausado = Boolean(e.pulsado);
  return {
    fase: p.fase,
    ronda: p.ronda,
    rondas: p.rondas,
    reto: {
      dificultad: r.dificultad,
      clubes: r.clubes.slice(0, n).map((c) => ({ nombre: c.nombre, logo: c.logo, colores: c.colores, siglas: c.siglas, periodo: c.periodo })),
      todos: n >= r.clubes.length,
      hayPista: hayPista(r) && n >= r.clubes.length,
      pista: e.pistaVisible || resuelta ? (hayPista(r) ? r.pista : null) : null,
      nacionalidad: resuelta ? r.nacionalidad : null,
      solucion: resuelta ? r.nombre : null
    },
    reveladas: n,
    pistaVisible: e.pistaVisible,
    etapa: { desde: e.desde, duracion: duracionEtapa(p), pausadoEn: e.pausadoEn },
    puntosAhora: p.fase === 'jugando' ? (e.pulsado ? e.pulsado.puntos : puntosAhora(p)) : 0,
    pulsado: e.pulsado ? { jugadorId: e.pulsado.jugadorId, hasta: e.pulsado.hasta } : null,
    pausado: pausado || e.pausadoEn != null,
    bloqueados: [...e.bloqueados],
    sumas: { ...e.sumas },
    resultado: e.resultado,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, fuera: j.fuera })),
    log: p.log.slice(-30),
    fin: p.fin,
    yo: jug(p, yoId) ? { id: yoId } : null
  };
}
