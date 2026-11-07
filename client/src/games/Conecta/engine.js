// client/src/games/Conecta/engine.js  (COPIA IDÉNTICA de server/conecta/engine.js: cambia los dos a la vez)
// Motor de reglas de «Conecta 4» por turnos. Funciones puras sobre un objeto de estado
// (el tiempo se pasa como parámetro), sin dependencias de Express ni de React.
// Lo usan:
//   - server/routes/conecta.js (salas online)
//   - client/src/games/Conecta/engine.js (modo un solo dispositivo)  <-- COPIA IDÉNTICA de este archivo
//
// Reglas de una ronda:
//   - Se sortea quién empieza; después el turno va en orden (saltando a los eliminados).
//   - Cada turno: pantalla de «Turno de X» y botón «Listo». Al pulsarlo hay 90 s.
//   - El jugador elige 4 elementos. Si forman una conexión gana puntos (5 / 3 / 1 según el orden)
//     y puede intentar adivinar qué los une (+1). Si falla (o se acaba el tiempo) pierde una vida.
//     En ambos casos el turno pasa al siguiente. Sin vidas, el jugador queda eliminado.
//   - Con 3 conexiones resueltas solo queda adivinar qué une a los 4 últimos: lo intenta quien tenga
//     el turno; si acierta suma los puntos y termina la ronda; si falla pasa al siguiente.
//     Si todos fallan, termina la ronda.
//   - El anfitrión puede saltar el turno de alguien ausente o terminar la ronda en cualquier momento.

export const AJUSTES = {
  vidas: 3,
  segundosTurno: 90,
  puntosConexion: [5, 3, 1], // 1ª, 2ª y 3ª conexión encontradas
  puntosTema: 1,             // extra por adivinar qué une a un grupo resuelto
  puntosUltima: 2            // por adivinar qué une a los 4 últimos (1 conexión + 1 tema)
};

const quitarTildes = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

export function temaCorrecto(grupo, texto) {
  const t = quitarTildes(texto);
  if (!t || !grupo) return false;
  const claves = [...(grupo.palabrasClave || []), grupo.tema].filter(Boolean);
  return claves.some((kw) => {
    const k = quitarTildes(kw);
    return k && (t.includes(k) || (t.length >= 4 && k === t));
  });
}

function barajar(lista, azar) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Crea una ronda.
 * - jugadores: [{ id, nombre, puntos }] en el orden de turnos
 * - tableroDatos: { grupos: [{ tema, palabrasClave, elementos[4] }] }
 */
export function crearRonda(jugadores, tableroDatos, { azar = Math.random, ronda = 1, categoria = '' } = {}) {
  const grupos = tableroDatos.grupos.map((g, idx) => ({
    id: idx,
    tema: g.tema,
    palabrasClave: g.palabrasClave || [],
    elementos: [...g.elementos]
  }));
  const piezas = [];
  grupos.forEach((g) => g.elementos.forEach((texto) => piezas.push({ texto, grupoId: g.id })));
  // Los ids de las piezas se asignan después de barajar: no delatan el grupo
  const tablero = barajar(piezas, azar).map((p, i) => ({ ...p, id: i }));

  const lista = jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos || 0, vidas: AJUSTES.vidas }));
  const primero = lista.length ? lista[Math.floor(azar() * lista.length)].id : null;

  const e = {
    ronda,
    categoria,
    fase: lista.length ? 'turnos' : 'fin', // 'turnos' | 'ultima' | 'fin'
    grupos,
    tablero,             // piezas que siguen en el tablero
    resueltas: [],       // [{ grupoId, jugadorId, nombre, puntos, temaAcertado, temaRevelado, final }]
    jugadores: lista,
    turno: null,         // { jugadorId, paso: 'listo' | 'elegir' | 'tema' | 'adivinar', fin, grupoId? }
    intentosUltima: [],  // ids de quien ya intentó la última conexión
    motivoFin: null,     // 'resuelta' | 'fallos' | 'eliminados' | 'anfitrion'
    evento: null,        // último suceso para avisar a todos: { n, tipo, jugadorId, nombre, texto }
    nEvento: 0
  };
  if (primero !== null) e.turno = { jugadorId: primero, paso: 'listo', fin: null };
  return e;
}

const jugador = (e, id) => e.jugadores.find((j) => j.id === id);
const vivo = (j) => j && j.vidas > 0;

function emitir(e, tipo, j, texto, extra = {}) {
  e.nEvento += 1;
  e.evento = { n: e.nEvento, tipo, jugadorId: j?.id ?? null, nombre: j?.nombre ?? '', texto, ...extra };
}

function terminar(e, motivo) {
  e.fase = 'fin';
  e.turno = null;
  e.motivoFin = motivo;
  e.resueltas.forEach((r) => { r.temaRevelado = true; });
}

// Siguiente jugador vivo en orden (cíclico) a partir del actual; en la última fase, que no lo haya intentado
function pasarTurno(e, desdeId) {
  const n = e.jugadores.length;
  let idx = e.jugadores.findIndex((j) => j.id === desdeId);
  for (let k = 1; k <= n; k++) {
    const cand = e.jugadores[(idx + k + n) % n];
    if (!vivo(cand)) continue;
    if (e.fase === 'ultima' && e.intentosUltima.includes(cand.id)) continue;
    e.turno = { jugadorId: cand.id, paso: 'listo', fin: null };
    return;
  }
  // Nadie puede seguir
  if (e.fase === 'ultima') terminar(e, 'fallos');
  else terminar(e, 'eliminados');
}

function entrarEnUltima(e, desdeId) {
  e.fase = 'ultima';
  e.intentosUltima = [];
  pasarTurno(e, desdeId);
}

function exigirTurno(e, jugadorId, pasos) {
  if (e.fase === 'fin' || !e.turno) return 'La ronda ha terminado.';
  if (e.turno.jugadorId !== jugadorId) return 'No es tu turno.';
  if (!pasos.includes(e.turno.paso)) return 'Ahora no puedes hacer eso.';
  return null;
}

/** El jugador con el turno pulsa «Listo»: empieza su cuenta atrás. */
export function empezarTurno(e, jugadorId, ahora = Date.now()) {
  const err = exigirTurno(e, jugadorId, ['listo']);
  if (err) return { error: err };
  e.turno.paso = e.fase === 'ultima' ? 'adivinar' : 'elegir';
  e.turno.fin = ahora + AJUSTES.segundosTurno * 1000;
  return { ok: true };
}

function fallarSeleccion(e, j, texto, tipo = 'fallo') {
  j.vidas = Math.max(0, j.vidas - 1);
  const eliminado = j.vidas === 0;
  emitir(e, tipo, j, eliminado ? `${texto} ${j.nombre} queda eliminado.` : texto, { eliminado });
  pasarTurno(e, j.id);
}

/** Comprueba 4 piezas (ids) elegidas por el jugador con el turno. */
export function confirmarSeleccion(e, jugadorId, ids, ahora = Date.now()) {
  tick(e, ahora);
  const err = exigirTurno(e, jugadorId, ['elegir']);
  if (err) return { error: err };
  const unicos = [...new Set((ids || []).map(Number))];
  const piezas = unicos.map((id) => e.tablero.find((p) => p.id === id)).filter(Boolean);
  if (piezas.length !== 4) return { error: 'Elige exactamente 4 elementos del tablero.' };

  const j = jugador(e, jugadorId);
  const cuenta = {};
  piezas.forEach((p) => { cuenta[p.grupoId] = (cuenta[p.grupoId] || 0) + 1; });
  const grupoId = Object.keys(cuenta).find((g) => cuenta[g] === 4);

  if (grupoId === undefined) {
    const casi = Object.values(cuenta).some((c) => c === 3);
    fallarSeleccion(e, j, casi ? `${j.nombre} se ha quedado a uno: pierde una vida.` : `${j.nombre} falla y pierde una vida.`);
    return { ok: true, correcto: false, casi };
  }

  const gId = Number(grupoId);
  const puntos = AJUSTES.puntosConexion[e.resueltas.length] ?? 1;
  j.puntos += puntos;
  e.tablero = e.tablero.filter((p) => p.grupoId !== gId);
  e.resueltas.push({ grupoId: gId, jugadorId: j.id, nombre: j.nombre, puntos, temaAcertado: false, temaRevelado: false, final: false });
  emitir(e, 'acierto', j, `${j.nombre} encuentra una conexión: +${puntos} puntos.`, { grupoId: gId });
  // Mismo turno (mismo reloj): ahora puede adivinar qué los une
  e.turno.paso = 'tema';
  e.turno.grupoId = gId;
  return { ok: true, correcto: true, puntos, grupoId: gId };
}

function cerrarTema(e, j) {
  const r = e.resueltas[e.resueltas.length - 1];
  if (r) r.temaRevelado = true;
  if (e.resueltas.length >= 3 && e.tablero.length === 4) entrarEnUltima(e, j.id);
  else pasarTurno(e, j.id);
}

/** Tras resolver un grupo: intento de adivinar el tema (+1). texto vacío o saltar = sin intento. */
export function adivinarTema(e, jugadorId, texto, ahora = Date.now()) {
  tick(e, ahora);
  const err = exigirTurno(e, jugadorId, ['tema', 'adivinar']);
  if (err) return { error: err };
  const j = jugador(e, jugadorId);

  if (e.turno.paso === 'tema') {
    const grupo = e.grupos.find((g) => g.id === e.turno.grupoId);
    const acierto = temaCorrecto(grupo, texto);
    const r = e.resueltas[e.resueltas.length - 1];
    if (acierto) {
      j.puntos += AJUSTES.puntosTema;
      r.temaAcertado = true;
      r.puntos += AJUSTES.puntosTema;
      emitir(e, 'tema_ok', j, `${j.nombre} adivina qué los une: +${AJUSTES.puntosTema} punto extra.`, { grupoId: grupo.id });
    } else {
      emitir(e, texto && String(texto).trim() ? 'tema_ko' : 'tema_saltado', j,
        texto && String(texto).trim() ? `${j.nombre} no adivina qué los une.` : `${j.nombre} no intenta adivinar qué los une.`,
        { grupoId: grupo.id });
    }
    cerrarTema(e, j);
    return { ok: true, acierto };
  }

  // Última conexión
  const restantes = e.tablero;
  const gId = restantes[0]?.grupoId;
  const grupo = e.grupos.find((g) => g.id === gId);
  const acierto = temaCorrecto(grupo, texto);
  e.intentosUltima.push(j.id);
  if (acierto) {
    j.puntos += AJUSTES.puntosUltima;
    e.tablero = [];
    e.resueltas.push({ grupoId: gId, jugadorId: j.id, nombre: j.nombre, puntos: AJUSTES.puntosUltima, temaAcertado: true, temaRevelado: true, final: true });
    emitir(e, 'ultima_ok', j, `${j.nombre} adivina la última conexión: +${AJUSTES.puntosUltima} puntos.`, { grupoId: gId });
    terminar(e, 'resuelta');
  } else {
    emitir(e, 'ultima_ko', j, `${j.nombre} no acierta la última conexión.`);
    pasarTurno(e, j.id);
  }
  return { ok: true, acierto };
}

/** Aplica el fin del tiempo si ha vencido. Devuelve true si ha cambiado algo. */
export function tick(e, ahora = Date.now()) {
  const t = e.turno;
  if (e.fase === 'fin' || !t || !t.fin || ahora < t.fin) return false;
  const j = jugador(e, t.jugadorId);
  if (t.paso === 'elegir') {
    fallarSeleccion(e, j, `Se acabó el tiempo de ${j.nombre}: pierde una vida.`, 'tiempo');
  } else if (t.paso === 'tema') {
    emitir(e, 'tema_saltado', j, `Se acabó el tiempo de ${j.nombre} para adivinar qué los une.`, { grupoId: t.grupoId });
    cerrarTema(e, j);
  } else if (t.paso === 'adivinar') {
    e.intentosUltima.push(j.id);
    emitir(e, 'ultima_ko', j, `Se acabó el tiempo de ${j.nombre}.`);
    pasarTurno(e, j.id);
  }
  return true;
}

/** Salta el turno de quien no está (sin perder vida). En la última fase cuenta como intento. */
export function saltarTurno(e) {
  if (e.fase === 'fin' || !e.turno) return { error: 'No hay turno activo.' };
  const j = jugador(e, e.turno.jugadorId);
  if (e.turno.paso === 'tema') {
    emitir(e, 'tema_saltado', j, `Se salta el turno de ${j.nombre}.`, { grupoId: e.turno.grupoId });
    cerrarTema(e, j);
    return { ok: true };
  }
  if (e.fase === 'ultima') e.intentosUltima.push(j.id);
  emitir(e, 'saltado', j, `Se salta el turno de ${j.nombre}.`);
  pasarTurno(e, j.id);
  return { ok: true };
}

/** El anfitrión termina la ronda con las puntuaciones actuales. */
export function finalizarRonda(e) {
  if (e.fase !== 'fin') {
    emitir(e, 'fin', null, 'El anfitrión ha terminado la ronda.');
    terminar(e, 'anfitrion');
  }
  return { ok: true };
}

/** Un jugador abandona la partida en mitad de la ronda. */
export function quitarJugador(e, jugadorId) {
  const idx = e.jugadores.findIndex((j) => j.id === jugadorId);
  if (idx === -1) return;
  const eraSuTurno = e.turno?.jugadorId === jugadorId;
  const anterior = e.jugadores[(idx - 1 + e.jugadores.length) % e.jugadores.length]?.id;
  e.jugadores.splice(idx, 1);
  if (!e.jugadores.length) return terminar(e, 'eliminados');
  if (eraSuTurno && e.fase !== 'fin') {
    if (e.turno.paso === 'tema') {
      const r = e.resueltas[e.resueltas.length - 1];
      if (r) r.temaRevelado = true;
      if (e.resueltas.length >= 3 && e.tablero.length === 4) { e.fase = 'ultima'; e.intentosUltima = []; }
    }
    pasarTurno(e, anterior === jugadorId ? e.jugadores[0].id : anterior);
  }
}

/** Vista para un jugador: el tablero no delata los grupos hasta que se resuelven. */
export function vista(e, ahora = Date.now()) {
  const fin = e.fase === 'fin';
  const grupoPublico = (gId, revelarTema) => {
    const g = e.grupos.find((x) => x.id === gId);
    return { id: g.id, elementos: g.elementos, tema: revelarTema ? g.tema : null };
  };
  const t = e.turno;
  const jt = t ? jugador(e, t.jugadorId) : null;
  return {
    ronda: e.ronda,
    categoria: e.categoria,
    fase: e.fase,
    tablero: e.tablero.map((p) => ({ id: p.id, texto: p.texto })),
    resueltas: e.resueltas.map((r) => ({
      ...grupoPublico(r.grupoId, r.temaRevelado || fin),
      jugadorId: r.jugadorId,
      nombre: r.nombre,
      puntos: r.puntos,
      temaAcertado: r.temaAcertado,
      final: r.final
    })),
    jugadores: e.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, vidas: j.vidas, eliminado: j.vidas <= 0 })),
    turno: t ? {
      jugadorId: t.jugadorId,
      nombre: jt?.nombre ?? '',
      paso: t.paso,
      restanteMs: t.fin ? Math.max(0, t.fin - ahora) : null,
      grupo: t.paso === 'tema' ? grupoPublico(t.grupoId, false) : null
    } : null,
    ultimaPendiente: e.fase === 'ultima' ? e.tablero.map((p) => p.texto) : null,
    intentosUltima: [...e.intentosUltima],
    motivoFin: e.motivoFin,
    soluciones: fin ? e.grupos.map((g) => {
      const r = e.resueltas.find((x) => x.grupoId === g.id);
      return { id: g.id, tema: g.tema, elementos: g.elementos, resueltoPor: r?.nombre ?? null, puntos: r?.puntos ?? 0, temaAcertado: r?.temaAcertado ?? false };
    }) : null,
    evento: e.evento,
    segundosTurno: AJUSTES.segundosTurno
  };
}
