// client/src/games/comun/simultaneo.js
// Motor puro de juegos por RONDAS SIMULTÁNEAS: cada ronda sale un ítem, los jugadores que tocan responden
// (cada uno en su móvil o pasándose el móvil), se resuelve, se reparten puntos y se pasa a la siguiente.
// Lo usan el servidor (salas de server/lib/salasJuego.js) y el modo «un dispositivo», sin copias.
//
// crearMotor(def) devuelve { crearPartida, tick, vistaDe, abandonar, responder, borrador, votar, finRevision,
// siguiente, terminar }. `def` define el juego:
//   segundos(p, item)                -> segundos de la ronda (0 = sin reloj)
//   alEmpezar(p, item)               -> prepara la ronda (p.ext es libre para el juego)
//   quienes(p, item)                 -> ids que deben responder esta ronda (por defecto, todos los activos)
//   validar(p, item, id, valor)      -> { ok: true, valor } | { ok: false, error, ...extra }  (valor null = sin respuesta)
//   puntuar(p, item, respuestas, anuladas) -> { puntos: { id: n }, aciertos: { id: bool }, detalle }
//   vistaItem(p, item, id, fase)     -> lo que ve cada jugador del ítem
//   revision: true                   -> tras responder hay fase de revisión (votar respuestas no válidas)
//   cierre: s                        -> cuando alguien responde, a los demás les quedan como mucho s segundos

const reloj = (p, ahora, s) => (p.sinReloj || !s ? null : ahora + s * 1000);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);

export function crearMotor(def) {
  const quienes = (p, item) => (def.quienes ? def.quienes(p, item) : activos(p).map((j) => j.id)).filter((id) => !p.jugadores.find((j) => j.id === id)?.fuera);
  const item = (p) => p.items[p.ronda - 1];

  function empezarRonda(p, ahora) {
    p.fase = 'jugando';
    p.respuestas = {};
    p.tiempos = {};
    p.borradores = {};
    p.votos = {};
    p.sumas = {};
    p.resultado = null;
    p.ext = {};
    p.inicio = ahora;
    def.alEmpezar?.(p, item(p));
    p.hasta = reloj(p, ahora, def.segundos ? def.segundos(p, item(p)) : 0);
  }

  function crearPartida(jugadores, items, reglas = {}, ahora = Date.now()) {
    const p = {
      jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, aciertos: 0, fuera: false })),
      items, reglas, sinReloj: Boolean(reglas.sinReloj), ronda: 1, rondas: items.length, fin: null, nAviso: 0
    };
    empezarRonda(p, ahora);
    return p;
  }

  function finalizar(p) {
    p.fase = 'fin';
    p.hasta = null;
    const lista = [...p.jugadores].sort((a, b) => (a.fuera - b.fuera) || (b.puntos - a.puntos));
    const max = Math.max(0, ...lista.filter((j) => !j.fuera).map((j) => j.puntos));
    let puesto = 0; let previo = null;
    const tabla = lista.map((j, i) => {
      if (j.puntos !== previo) { puesto = i + 1; previo = j.puntos; }
      return { id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, fuera: j.fuera, puesto };
    });
    p.fin = { tabla, max, ganadores: max > 0 ? tabla.filter((j) => !j.fuera && j.puntos === max).map((j) => j.id) : [] };
  }

  function resolver(p) {
    const it = item(p);
    const anuladas = Object.entries(p.votos).filter(([, v]) => v.anulada).map(([k]) => k);
    const r = def.puntuar(p, it, p.respuestas, new Set(anuladas));
    Object.entries(r.puntos || {}).forEach(([id, n]) => {
      const j = p.jugadores.find((x) => x.id === Number(id));
      if (j && n) j.puntos += n;
    });
    Object.entries(r.aciertos || {}).forEach(([id, ok]) => {
      const j = p.jugadores.find((x) => x.id === Number(id));
      if (j && ok) j.aciertos += 1;
    });
    p.sumas = r.puntos || {};
    p.resultado = r.detalle ?? null;
    p.fase = 'resuelta';
    p.hasta = null;
    p.nAviso += 1;
  }

  function cerrar(p) {
    const it = item(p);
    // Quien no llegó a enviar: vale lo que tuviera escrito (si el juego guarda borradores)
    quienes(p, it).forEach((id) => {
      if (id in p.respuestas) return;
      const b = p.borradores[id];
      const v = b !== undefined ? def.validar(p, it, id, b, { borrador: true }) : null;
      p.respuestas[id] = v?.ok ? v.valor : null;
    });
    if (def.revision) { p.fase = 'revision'; p.hasta = null; } else resolver(p);
  }

  const todosHan = (p) => quienes(p, item(p)).every((id) => id in p.respuestas);

  function responder(p, id, valor, ahora = Date.now()) {
    if (p.fase !== 'jugando') return { ok: false, error: 'Ahora no se puede responder.' };
    const it = item(p);
    if (!quienes(p, it).includes(id)) return { ok: false, error: 'En esta ronda no te toca responder.' };
    if (id in p.respuestas) return { ok: false, error: 'Ya has respondido.' };
    const v = valor === null ? { ok: true, valor: null } : def.validar(p, it, id, valor);
    if (!v.ok) return v;
    p.respuestas[id] = v.valor;
    p.tiempos[id] = ahora - p.inicio;
    if (def.cierre && !p.sinReloj) {
      const tope = ahora + def.cierre * 1000;
      if (!p.hasta || tope < p.hasta) p.hasta = tope;
    }
    if (todosHan(p)) cerrar(p);
    return { ok: true };
  }

  function borrador(p, id, valor) {
    if (p.fase !== 'jugando') return { ok: true };
    p.borradores[id] = valor;
    return { ok: true };
  }

  /** Revisión: un jugador marca (o desmarca) como no válida la respuesta `clave` («autor:campo»). Se anula por mayoría. */
  function votar(p, id, clave, { directo = false } = {}) {
    if (p.fase !== 'revision') return { ok: false, error: 'No estamos revisando.' };
    const autor = Number(String(clave).split(':')[0]);
    if (autor === id && !directo) return { ok: false, error: 'No puedes votar tus propias respuestas.' };
    const v = (p.votos[clave] ||= { por: [], anulada: false });
    v.por = v.por.includes(id) ? v.por.filter((x) => x !== id) : [...v.por, id];
    const jueces = activos(p).filter((j) => j.id !== autor).length;
    v.anulada = directo ? v.por.length > 0 : v.por.length > 0 && v.por.length * 2 >= jueces;
    return { ok: true };
  }

  function finRevision(p) {
    if (p.fase !== 'revision') return { ok: false, error: 'No estamos revisando.' };
    resolver(p);
    return { ok: true };
  }

  function siguiente(p, ahora = Date.now()) {
    if (p.fase !== 'resuelta') return { ok: false, error: 'La ronda no ha terminado.' };
    if (p.ronda >= p.rondas) finalizar(p);
    else { p.ronda += 1; empezarRonda(p, ahora); }
    return { ok: true };
  }

  function terminar(p) {
    if (p.fase === 'fin') return { ok: true };
    finalizar(p);
    return { ok: true };
  }

  function tick(p, ahora = Date.now()) {
    if (p.fase === 'jugando' && p.hasta && ahora >= p.hasta) cerrar(p);
  }

  function abandonar(p, id) {
    const j = p.jugadores.find((x) => x.id === id);
    if (!j || p.fase === 'fin') return;
    j.fuera = true;
    if (activos(p).length === 0) { finalizar(p); return; }
    if (p.fase === 'jugando' && todosHan(p)) cerrar(p);
  }

  function vistaDe(p, id) {
    const it = item(p);
    const deben = p.fase === 'fin' ? [] : quienes(p, it);
    return {
      fase: p.fase, ronda: p.ronda, rondas: p.rondas, hasta: p.hasta, nAviso: p.nAviso,
      segundos: def.segundos ? def.segundos(p, it) : 0,
      jugadores: p.jugadores.map((j) => ({
        id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, fuera: j.fuera,
        debe: deben.includes(j.id), respondido: j.id in (p.respuestas || {})
      })),
      yo: p.jugadores.some((j) => j.id === id) ? { id } : null,
      item: p.fase === 'fin' ? null : def.vistaItem(p, it, id, p.fase),
      sumas: p.fase === 'resuelta' ? p.sumas : {},
      resultado: p.fase === 'resuelta' ? p.resultado : null,
      votos: p.fase === 'revision' ? Object.fromEntries(Object.entries(p.votos).map(([k, v]) => [k, { n: v.por.length, mio: v.por.includes(id), anulada: v.anulada }])) : null,
      fin: p.fin
    };
  }

  return { crearPartida, tick, vistaDe, abandonar, responder, borrador, votar, finRevision, siguiente, terminar, finalizar };
}

/** Acción online común (server/lib/salasJuego.js → opciones.accion). */
export function accionSimultaneo(M, p, d, { id, esAdmin, ahora }) {
  const soloAdmin = { ok: false, error: 'Solo el anfitrión puede hacerlo.' };
  switch (d.tipo) {
    case 'responder': return M.responder(p, id, d.valor ?? null, ahora);
    case 'borrador': return M.borrador(p, id, d.valor);
    case 'votar': return M.votar(p, id, String(d.clave || ''));
    case 'finRevision': return esAdmin ? M.finRevision(p) : soloAdmin;
    case 'siguiente': return esAdmin ? M.siguiente(p, ahora) : soloAdmin;
    case 'terminar': return esAdmin ? M.terminar(p) : soloAdmin;
    default: return null;
  }
}

// ---------------------------------------------------------------- Texto
const RELLENO = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'lo', 'y', 'e', 'a', 'al', 'un', 'una', 'the', 'of']);
export const base = (t) => String(t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9+-]+/g, ' ').trim();
/** Sin espacios ni palabras de relleno («la palma» → «palma»); si solo hay relleno («La», nota musical), se deja tal cual. */
export const compacto = (t) => base(t).split(' ').filter((w) => w && !RELLENO.has(w)).join('') || base(t).replace(/ /g, '');
export function distancia(a, b) {
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
const tolerancia = (n) => (n >= 12 ? 2 : n >= 6 ? 1 : 0);

/**
 * ¿Cuál de las opciones es el texto? opciones: ['Nombre|alias|alias', …]. Devuelve el índice o -1.
 * Primero coincidencia exacta (sin tildes, mayúsculas, signos ni «el/la/de»); si no, una errata pequeña,
 * pero solo si apunta a una única opción.
 */
export function buscarOpcion(texto, opciones) {
  const t = compacto(texto);
  if (!t) return -1;
  const formas = opciones.map((o) => String(o).split('|').map(compacto).filter(Boolean));
  const exacta = formas.findIndex((f) => f.includes(t));
  if (exacta >= 0) return exacta;
  const cerca = formas.map((f, i) => (f.some((x) => distancia(x, t) <= tolerancia(x.length)) ? i : -1)).filter((i) => i >= 0);
  return cerca.length === 1 ? cerca[0] : -1;
}
export const nombreOpcion = (o) => String(o).split('|')[0];
