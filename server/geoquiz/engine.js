// server/geoquiz/engine.js
// Motor de reglas de GeoQuiz. Funciones puras sobre un objeto de estado (el tiempo se pasa
// como parámetro), sin dependencias de Express ni de React. Lo usan:
//   - server/routes/geoquiz.js (salas online)
//   - client/src/games/GeoQuiz/engine.js (modo un solo dispositivo)  <-- COPIA IDÉNTICA de este archivo
//
// La partida es por turnos: se sortea quién empieza y luego se sigue el orden.
// Cada turno: pantalla «Turno de X» → «Listo» → pregunta con cuenta atrás → resultado (todos lo ven).
//
// Modos:
//   geomix         preguntas de todas las categorías mezcladas, N turnos por jugador
//   especialista   igual, pero de una sola categoría
//   contrarreloj   cada turno son 60 s para responder tantas preguntas rápidas como se pueda
//   supervivencia  3 vidas; cada fallo quita una. Gana el último que sigue vivo

export const MODOS = {
  geomix: { nombre: 'GeoMix', rondas: [3, 5, 8], rondasPorDefecto: 5 },
  especialista: { nombre: 'Especialista', rondas: [3, 5, 8], rondasPorDefecto: 5 },
  contrarreloj: { nombre: 'Contrarreloj', rondas: [1, 2, 3], rondasPorDefecto: 2 },
  supervivencia: { nombre: 'Supervivencia', rondas: null, rondasPorDefecto: null }
};

export const AJUSTES = {
  vidas: 3,
  segundosContrarreloj: 60,
  segundosResultado: 12,
  tiempos: { respuesta: 25, opciones: 15, enumerar: 60, pistas: 60, ordenar: 45, numero: 25 },
  puntos: { respuesta: 2, opciones: 1, rapida: 1 }
};

// ---------------------------------------------------------------------------
// Comparación de respuestas
// ---------------------------------------------------------------------------
const PALABRAS_VACIAS = new Set([
  'el', 'la', 'los', 'las', 'lo', 'un', 'una', 'de', 'del', 'y', 'e', 'the', 'of',
  'rio', 'lago', 'monte', 'montes', 'montanas', 'volcan', 'desierto', 'cordillera', 'mar', 'oceano',
  'isla', 'islas', 'ciudad', 'estrecho', 'canal', 'republica', 'reino', 'parque', 'nacional'
]);

export function normalizar(texto) {
  const base = String(texto ?? '')
    .toLowerCase()
    .replace(/ł/g, 'l').replace(/ø/g, 'o').replace(/æ/g, 'ae').replace(/ß/g, 'ss').replace(/œ/g, 'oe')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ]+/g, ' ')
    .trim();
  const palabras = base.split(' ').filter(Boolean);
  const utiles = palabras.filter((p) => !PALABRAS_VACIAS.has(p));
  return (utiles.length ? utiles : palabras).join('');
}

function distancia(a, b) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 2) return 99;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
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

const tolerancia = (n) => (n >= 9 ? 2 : n >= 5 ? 1 : 0);
const alias = (s) => String(s).split('|').map((x) => x.trim()).filter(Boolean);
const mostrar = (s) => alias(s)[0];

// ¿Coincide el texto con alguno de los alias? Devuelve la distancia (0 exacto) o null
function coincide(texto, aliases) {
  const t = normalizar(texto);
  if (!t) return null;
  let mejor = null;
  for (const a of aliases) {
    const n = normalizar(a);
    if (!n) continue;
    if (n === t) return 0;
    const d = distancia(t, n);
    if (d <= tolerancia(Math.min(n.length, t.length)) && (mejor === null || d < mejor)) mejor = d;
  }
  return mejor;
}

export function esRespuestaCorrecta(texto, respuestas) {
  return coincide(texto, alias(respuestas)) !== null;
}

// Para enumerar: índice del elemento que corresponde al texto (o -1). Exige que no sea ambiguo.
function buscarElemento(texto, elementos) {
  let mejor = { idx: -1, d: 99 };
  let empate = false;
  elementos.forEach((el, idx) => {
    const d = coincide(texto, alias(el));
    if (d === null) return;
    if (d < mejor.d) { mejor = { idx, d }; empate = false; } else if (d === mejor.d) empate = true;
  });
  if (mejor.idx === -1 || (empate && mejor.d > 0)) return -1;
  return mejor.idx;
}

// Números escritos en español: «8.849» = 8849 · «9,2» = 9.2 · «17.1» = 17.1
export function leerNumero(texto) {
  let t = String(texto ?? '').trim().replace(/\s/g, '');
  if (!t) return null;
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) t = t.replace(/\./g, '').replace(',', '.');
  else t = t.replace(',', '.');
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

// ---------------------------------------------------------------------------
// Partida
// ---------------------------------------------------------------------------
function barajar(lista, azar) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const RAPIDAS = new Set(['respuesta', 'opciones']);

/**
 * - jugadores: [{ id, nombre }] en el orden de turnos
 * - preguntas: banco ya filtrado por categoría: [{ ...pregunta, categoria: 'Nombre' }]
 * - opciones: { modo, rondas, azar }
 */
export function crearPartida(jugadores, preguntas, { modo = 'geomix', rondas, azar = Math.random } = {}) {
  const info = MODOS[modo] || MODOS.geomix;
  const lista = jugadores.map((j) => ({
    id: j.id, nombre: j.nombre, puntos: 0, vidas: AJUSTES.vidas, turnos: 0, aciertos: 0, fallos: 0
  }));
  const pool = barajar(modo === 'contrarreloj' ? preguntas.filter((p) => RAPIDAS.has(p.tipo)) : preguntas, azar);
  const e = {
    modo: info === MODOS[modo] ? modo : 'geomix',
    rondas: info.rondas ? (Number.isInteger(Number(rondas)) && Number(rondas) >= 1 && Number(rondas) <= 20 ? Number(rondas) : info.rondasPorDefecto) : null,
    jugadores: lista,
    pool,
    siguiente: 0,
    turnosJugados: 0,
    fase: lista.length && pool.length ? 'jugando' : 'fin',
    turno: null,
    motivoFin: null,
    evento: null,
    nEvento: 0
  };
  if (e.fase === 'jugando') {
    const primero = lista[Math.floor(azar() * lista.length)].id;
    e.turno = { jugadorId: primero, paso: 'listo', fin: null };
  } else {
    e.motivoFin = 'sin-preguntas';
  }
  return e;
}

const jugador = (e, id) => e.jugadores.find((j) => j.id === id);
const vivo = (e, j) => j && (e.modo !== 'supervivencia' || j.vidas > 0);

function emitir(e, tipo, j, texto, extra = {}) {
  e.nEvento += 1;
  e.evento = { n: e.nEvento, tipo, jugadorId: j?.id ?? null, nombre: j?.nombre ?? '', texto, ...extra };
}

function sacarPregunta(e, azar = Math.random) {
  if (e.siguiente >= e.pool.length) {
    // Se acabó el banco: se vuelve a barajar (pueden repetirse preguntas)
    e.pool = barajar(e.pool, azar);
    e.siguiente = 0;
  }
  return e.pool[e.siguiente++];
}

// Estado de juego de una pregunta (lo que el jugador va construyendo)
function prepararPregunta(q, azar = Math.random) {
  const est = { q };
  if (q.tipo === 'opciones') est.opciones = barajar(q.opciones, azar);
  if (q.tipo === 'ordenar') est.items = barajar(q.orden, azar);
  if (q.tipo === 'enumerar') { est.encontrados = []; est.intentos = []; }
  if (q.tipo === 'pistas') { est.vistas = 1; est.intentos = []; }
  return est;
}

function terminar(e, motivo) {
  e.fase = 'fin';
  e.turno = null;
  e.motivoFin = motivo;
}

function exigir(e, jugadorId, pasos) {
  if (e.fase !== 'jugando' || !e.turno) return 'La partida ha terminado.';
  if (e.turno.jugadorId !== jugadorId) return 'No es tu turno.';
  if (!pasos.includes(e.turno.paso)) return 'Ahora no puedes hacer eso.';
  return null;
}

/** Pulsa «Listo»: aparece la pregunta y empieza la cuenta atrás. */
export function empezarTurno(e, jugadorId, ahora = Date.now(), azar = Math.random) {
  const err = exigir(e, jugadorId, ['listo']);
  if (err) return { error: err };
  const t = e.turno;
  t.paso = 'pregunta';
  if (e.modo === 'contrarreloj') {
    t.fin = ahora + AJUSTES.segundosContrarreloj * 1000;
    t.rapidas = { respondidas: [], actual: prepararPregunta(sacarPregunta(e, azar), azar) };
  } else {
    t.est = prepararPregunta(sacarPregunta(e, azar), azar);
    t.fin = ahora + (AJUSTES.tiempos[t.est.q.tipo] || 30) * 1000;
  }
  return { ok: true };
}

// Corrige una pregunta y devuelve el resultado { correcto, puntos, solucion, detalle }
function corregir(est, valor) {
  const q = est.q;
  switch (q.tipo) {
    case 'respuesta': {
      const ok = esRespuestaCorrecta(valor, q.respuestas);
      const otras = alias(q.respuestas).slice(1);
      return {
        correcto: ok, puntos: ok ? AJUSTES.puntos.respuesta : 0,
        solucion: mostrar(q.respuestas) + (otras.length ? ` (también vale: ${otras.join(', ')})` : ''),
        detalle: { tuRespuesta: String(valor ?? '').trim() }
      };
    }
    case 'opciones': {
      const ok = String(valor) === q.correcta;
      return { correcto: ok, puntos: ok ? AJUSTES.puntos.opciones : 0, solucion: q.correcta, detalle: { tuRespuesta: String(valor ?? '') } };
    }
    case 'enumerar': {
      const n = est.encontrados.length;
      const faltan = q.elementos.map((el, i) => (est.encontrados.includes(i) ? null : mostrar(el))).filter(Boolean);
      return {
        correcto: n >= Math.min(3, q.elementos.length), puntos: n,
        solucion: `${n} de ${q.elementos.length}`,
        detalle: { encontrados: est.encontrados.map((i) => mostrar(q.elementos[i])), faltan, total: q.elementos.length }
      };
    }
    case 'pistas': {
      const ok = valor !== null && esRespuestaCorrecta(valor, q.respuestas);
      return { correcto: ok, puntos: ok ? Math.max(1, 6 - est.vistas) : 0, solucion: mostrar(q.respuestas), detalle: { pistasUsadas: est.vistas, pistas: q.pistas } };
    }
    case 'ordenar': {
      const orden = Array.isArray(valor) ? valor : [];
      const aciertos = q.orden.filter((it, i) => orden[i] === it).length;
      return {
        correcto: aciertos >= 3, puntos: aciertos,
        solucion: q.orden.join(' → '),
        detalle: { tuOrden: orden, ordenCorrecto: q.orden, aciertos, criterio: q.criterio }
      };
    }
    case 'numero': {
      const n = leerNumero(valor);
      const err = n === null ? Infinity : Math.abs(n - q.valor) / Math.abs(q.valor || 1);
      const puntos = err <= 0.02 ? 3 : err <= 0.1 ? 2 : err <= 0.25 ? 1 : 0;
      return {
        correcto: err <= 0.1, puntos,
        solucion: `${q.valor.toLocaleString('es-ES')} ${q.unidad}`,
        detalle: { tuValor: n, valor: q.valor, unidad: q.unidad, errorPct: Number.isFinite(err) ? Math.round(err * 100) : null }
      };
    }
    default:
      return { correcto: false, puntos: 0, solucion: '', detalle: {} };
  }
}

function cerrarPregunta(e, j, res, ahora) {
  const t = e.turno;
  j.puntos += res.puntos;
  if (res.correcto) j.aciertos += 1; else j.fallos += 1;
  let perdioVida = false;
  if (e.modo === 'supervivencia' && !res.correcto) {
    j.vidas = Math.max(0, j.vidas - 1);
    perdioVida = true;
  }
  t.paso = 'resultado';
  t.resultado = { ...res, perdioVida, eliminado: perdioVida && j.vidas === 0, dato: t.est?.q?.dato || null };
  t.fin = ahora + AJUSTES.segundosResultado * 1000;
  const txt = res.correcto
    ? `${j.nombre} acierta: +${res.puntos} ${res.puntos === 1 ? 'punto' : 'puntos'}.`
    : res.puntos > 0
      ? `${j.nombre} suma ${res.puntos} ${res.puntos === 1 ? 'punto' : 'puntos'}.`
      : `${j.nombre} falla.`;
  emitir(e, res.correcto ? 'acierto' : 'fallo', j,
    t.resultado.eliminado ? `${txt} ¡Queda eliminado!` : perdioVida ? `${txt} Pierde una vida.` : txt,
    { eliminado: t.resultado.eliminado });
}

/**
 * Responde a la pregunta del turno.
 * - respuesta / numero / pistas: texto · opciones: texto de la opción · ordenar: array con el orden
 * En contrarreloj pasa automáticamente a la siguiente pregunta.
 */
export function responder(e, jugadorId, valor, ahora = Date.now(), azar = Math.random) {
  tick(e, ahora);
  const err = exigir(e, jugadorId, ['pregunta']);
  if (err) return { error: err };
  const j = jugador(e, jugadorId);
  const t = e.turno;

  if (e.modo === 'contrarreloj') {
    const est = t.rapidas.actual;
    const res = corregir(est, valor);
    const puntos = res.correcto ? AJUSTES.puntos.rapida : 0;
    j.puntos += puntos;
    if (res.correcto) j.aciertos += 1; else j.fallos += 1;
    t.rapidas.respondidas.push({ pregunta: est.q.pregunta, prueba: est.q.prueba, correcto: res.correcto, solucion: res.solucion, tuRespuesta: String(valor ?? '') });
    t.rapidas.actual = prepararPregunta(sacarPregunta(e, azar), azar);
    return { ok: true, correcto: res.correcto, solucion: res.solucion };
  }

  const est = t.est;
  if (est.q.tipo === 'enumerar') return { error: 'En esta prueba se añaden los elementos de uno en uno.' };
  if (est.q.tipo === 'pistas') {
    // Fallo: se muestra otra pista; sin más pistas, se termina
    if (!esRespuestaCorrecta(valor, est.q.respuestas)) {
      est.intentos.push(String(valor ?? '').trim());
      if (est.vistas < est.q.pistas.length) {
        est.vistas += 1;
        return { ok: true, correcto: false, otraPista: true };
      }
      cerrarPregunta(e, j, corregir(est, null), ahora);
      return { ok: true, correcto: false };
    }
  }
  const res = corregir(est, valor);
  cerrarPregunta(e, j, res, ahora);
  return { ok: true, correcto: res.correcto, puntos: res.puntos };
}

/** Enumerar: añade un elemento. Devuelve { estado: 'nuevo' | 'repetido' | 'no' }. */
export function enumerar(e, jugadorId, texto, ahora = Date.now()) {
  tick(e, ahora);
  const err = exigir(e, jugadorId, ['pregunta']);
  if (err) return { error: err };
  const est = e.turno.est;
  if (!est || est.q.tipo !== 'enumerar') return { error: 'Esta prueba no es de enumerar.' };
  const limpio = String(texto ?? '').trim().slice(0, 60);
  if (!limpio) return { ok: true, estado: 'vacio' };
  const idx = buscarElemento(limpio, est.q.elementos);
  let estado = 'no';
  if (idx !== -1) {
    estado = est.encontrados.includes(idx) ? 'repetido' : 'nuevo';
    if (estado === 'nuevo') est.encontrados.push(idx);
  }
  est.intentos.push({ texto: limpio, estado, elemento: idx !== -1 ? mostrar(est.q.elementos[idx]) : null });
  if (est.intentos.length > 80) est.intentos.shift();
  // ¿Ya no queda ninguno? Se cierra la prueba
  if (est.encontrados.length === est.q.elementos.length) {
    cerrarPregunta(e, jugador(e, jugadorId), corregir(est), ahora);
  }
  return { ok: true, estado, elemento: idx !== -1 ? mostrar(est.q.elementos[idx]) : null };
}

/** Pistas: pide la siguiente pista (vale un punto menos). */
export function pedirPista(e, jugadorId, ahora = Date.now()) {
  tick(e, ahora);
  const err = exigir(e, jugadorId, ['pregunta']);
  if (err) return { error: err };
  const est = e.turno.est;
  if (!est || est.q.tipo !== 'pistas') return { error: 'Esta prueba no tiene pistas.' };
  if (est.vistas >= est.q.pistas.length) return { error: 'No quedan más pistas.' };
  est.vistas += 1;
  return { ok: true };
}

/** Termina la prueba antes de tiempo (enumerar: «he terminado» · otras: «me rindo»). */
export function plantarse(e, jugadorId, ahora = Date.now()) {
  tick(e, ahora);
  const err = exigir(e, jugadorId, ['pregunta']);
  if (err) return { error: err };
  const t = e.turno;
  if (e.modo === 'contrarreloj') {
    t.fin = ahora;
    tick(e, ahora);
    return { ok: true };
  }
  cerrarPregunta(e, jugador(e, jugadorId), corregir(t.est, null), ahora);
  return { ok: true };
}

function siguienteTurno(e, ahora) {
  const actual = jugador(e, e.turno.jugadorId);
  if (actual) actual.turnos += 1;
  e.turnosJugados += 1;

  if (e.modo === 'supervivencia') {
    const vivos = e.jugadores.filter((j) => j.vidas > 0);
    if (vivos.length === 0 || (e.jugadores.length > 1 && vivos.length <= 1)) {
      if (vivos.length === 1) emitir(e, 'ganador', vivos[0], `¡${vivos[0].nombre} es el último superviviente!`);
      return terminar(e, 'supervivencia');
    }
  } else if (e.jugadores.every((j) => j.turnos >= e.rondas)) {
    return terminar(e, 'rondas');
  }

  const n = e.jugadores.length;
  const idx = e.jugadores.findIndex((j) => j.id === e.turno.jugadorId);
  for (let k = 1; k <= n; k++) {
    const cand = e.jugadores[(idx + k + n) % n];
    if (!vivo(e, cand)) continue;
    if (e.modo !== 'supervivencia' && cand.turnos >= e.rondas) continue;
    e.turno = { jugadorId: cand.id, paso: 'listo', fin: null };
    return undefined;
  }
  return terminar(e, 'rondas');
}

/** Tras ver el resultado, pasa al siguiente turno. */
export function continuar(e, ahora = Date.now()) {
  if (e.fase !== 'jugando' || !e.turno || e.turno.paso !== 'resultado') return { error: 'Ahora no se puede continuar.' };
  siguienteTurno(e, ahora);
  return { ok: true };
}

/** Aplica los fines de tiempo. Devuelve true si ha cambiado algo. */
export function tick(e, ahora = Date.now()) {
  const t = e.turno;
  if (e.fase !== 'jugando' || !t || !t.fin || ahora < t.fin) return false;
  const j = jugador(e, t.jugadorId);
  if (t.paso === 'pregunta') {
    if (e.modo === 'contrarreloj') {
      const r = t.rapidas.respondidas;
      const aciertos = r.filter((x) => x.correcto).length;
      const res = { correcto: aciertos > 0, puntos: 0, solucion: `${aciertos} aciertos`, detalle: { respondidas: r, aciertos } };
      // Los puntos ya se sumaron pregunta a pregunta
      t.paso = 'resultado';
      t.resultado = { ...res, puntosTurno: aciertos * AJUSTES.puntos.rapida, perdioVida: false, eliminado: false };
      t.fin = ahora + AJUSTES.segundosResultado * 1000;
      emitir(e, 'fin-turno', j, `¡Tiempo! ${j.nombre} consigue ${aciertos} ${aciertos === 1 ? 'acierto' : 'aciertos'}.`);
    } else {
      cerrarPregunta(e, j, corregir(t.est, null), ahora);
    }
    return true;
  }
  if (t.paso === 'resultado') {
    siguienteTurno(e, ahora);
    return true;
  }
  return false;
}

/** El anfitrión salta el turno de alguien ausente (sin penalización). */
export function saltarTurno(e, ahora = Date.now()) {
  if (e.fase !== 'jugando' || !e.turno) return { error: 'No hay turno activo.' };
  const j = jugador(e, e.turno.jugadorId);
  emitir(e, 'saltado', j, `Se salta el turno de ${j.nombre}.`);
  siguienteTurno(e, ahora);
  return { ok: true };
}

/** El anfitrión termina la partida con las puntuaciones actuales. */
export function finalizar(e) {
  if (e.fase !== 'fin') terminar(e, 'anfitrion');
  return { ok: true };
}

/** Un jugador abandona la partida. */
export function quitarJugador(e, jugadorId, ahora = Date.now()) {
  const idx = e.jugadores.findIndex((j) => j.id === jugadorId);
  if (idx === -1) return;
  const eraSuTurno = e.turno?.jugadorId === jugadorId;
  if (eraSuTurno && e.fase === 'jugando') {
    // El turno pasa al siguiente antes de quitarlo
    e.turno.paso = 'resultado';
    siguienteTurno(e, ahora);
    if (e.turno?.jugadorId === jugadorId) e.turno = null;
  }
  e.jugadores.splice(idx, 1);
  if (!e.jugadores.length) return terminar(e, 'rondas');
  if (e.fase === 'jugando' && !e.turno) return terminar(e, 'rondas');
  if (e.modo === 'supervivencia' && e.fase === 'jugando' && e.jugadores.filter((j) => j.vidas > 0).length <= 1 && e.jugadores.length > 1) {
    terminar(e, 'supervivencia');
  }
}

// ---------------------------------------------------------------------------
// Vista pública (no incluye soluciones mientras se responde)
// ---------------------------------------------------------------------------
function vistaPregunta(est) {
  const q = est.q;
  const v = { tipo: q.tipo, prueba: q.prueba, categoria: q.categoria || null, pregunta: q.pregunta };
  if (q.tipo === 'opciones') v.opciones = est.opciones;
  if (q.tipo === 'ordenar') { v.items = est.items; v.criterio = q.criterio; }
  if (q.tipo === 'numero') v.unidad = q.unidad;
  if (q.tipo === 'pistas') { v.pistas = q.pistas.slice(0, est.vistas); v.totalPistas = q.pistas.length; v.intentos = est.intentos; v.puntosPosibles = Math.max(1, 6 - est.vistas); }
  if (q.tipo === 'enumerar') {
    v.encontrados = est.encontrados.map((i) => mostrar(q.elementos[i]));
    v.total = q.elementos.length;
    v.intentos = est.intentos.slice(-6);
  }
  return v;
}

export function vista(e, ahora = Date.now()) {
  const t = e.turno;
  const jt = t ? jugador(e, t.jugadorId) : null;
  let turno = null;
  if (t) {
    turno = {
      jugadorId: t.jugadorId,
      nombre: jt?.nombre ?? '',
      paso: t.paso,
      restanteMs: t.fin ? Math.max(0, t.fin - ahora) : null,
      totalMs: null,
      pregunta: null,
      resultado: null,
      contrarreloj: null
    };
    if (t.paso === 'pregunta') {
      if (e.modo === 'contrarreloj') {
        const r = t.rapidas.respondidas;
        turno.pregunta = vistaPregunta(t.rapidas.actual);
        turno.contrarreloj = { aciertos: r.filter((x) => x.correcto).length, respondidas: r.length, ultima: r[r.length - 1] || null };
        turno.totalMs = AJUSTES.segundosContrarreloj * 1000;
      } else {
        turno.pregunta = vistaPregunta(t.est);
        turno.totalMs = (AJUSTES.tiempos[t.est.q.tipo] || 30) * 1000;
      }
    }
    if (t.paso === 'resultado') {
      turno.resultado = t.resultado;
      if (t.est) {
        turno.pregunta = vistaPregunta(t.est);
        turno.pregunta.respuestaCorrecta = t.est.q.tipo === 'opciones' ? t.est.q.correcta : null;
      }
      turno.totalMs = AJUSTES.segundosResultado * 1000;
    }
  }
  const nJug = e.jugadores.length || 1;
  return {
    modo: e.modo,
    nombreModo: MODOS[e.modo]?.nombre || e.modo,
    rondas: e.rondas,
    ronda: e.rondas ? Math.min(e.rondas, Math.floor(e.turnosJugados / nJug) + 1) : null,
    fase: e.fase,
    motivoFin: e.motivoFin,
    jugadores: e.jugadores.map((j) => ({
      id: j.id, nombre: j.nombre, puntos: j.puntos, vidas: j.vidas, turnos: j.turnos, aciertos: j.aciertos, fallos: j.fallos,
      eliminado: e.modo === 'supervivencia' && j.vidas <= 0
    })),
    turno,
    evento: e.evento,
    vidasMax: AJUSTES.vidas
  };
}
