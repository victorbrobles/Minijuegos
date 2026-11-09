// server/coleccion/engine.js
// Motor puro de «Colecciona con cabeza» (sin red ni React). Lo usan:
//   - server/routes/coleccion.js (salas online)
//   - client/src/games/Coleccion/engine.js (modo un solo dispositivo)  <-- COPIA IDÉNTICA de este archivo
// Si cambias algo aquí:  npm run sync:coleccion  (en /server)
//
// IDEA: cada jugador recibe un ENCARGO SECRETO (la colección concreta que tiene que reunir: 4 dinosaurios,
// 2 planetas y 2 piratas, una de cada…). Puede que varios vayan a por lo mismo sin saberlo. Las cartas de
// colección se ponen boca arriba en tu VITRINA (máx. 6) y ganas en cuanto tu vitrina cumple tu encargo.
// La gracia está en las CARTAS DE ACCIÓN: robar, bombardear o intercambiar vitrinas, espiar encargos,
// cambiar el tuyo, congelar rivales, apostar para remontar… y el escudo, que se activa solo.

// ---------------------------------------------------------------- Datos
export const PALOS = [
  { id: 'dino', nombre: 'Dinosaurios', e: '🦖', c: '#16a34a' },
  { id: 'planeta', nombre: 'Planetas', e: '🪐', c: '#7c3aed' },
  { id: 'pirata', nombre: 'Piratas', e: '🏴‍☠️', c: '#334155' },
  { id: 'dulce', nombre: 'Dulces', e: '🍬', c: '#ec4899' },
  { id: 'musica', nombre: 'Música', e: '🎸', c: '#f59e0b' },
  { id: 'bicho', nombre: 'Bichos', e: '🐞', c: '#dc2626' }
];
export const PALO = Object.fromEntries(PALOS.map((p) => [p.id, p]));
export const COMODIN = { id: 'comodin', nombre: 'Comodín', e: '🌟', c: '#0891b2' };

// objetivo: a quién afecta · escudo: el Escudo la bloquea
export const ACCIONES = {
  mapache: { nombre: 'Mapache', e: '🦝', copias: 4, objetivo: 'vitrina', escudo: true, desc: 'Roba una carta de la vitrina de otro jugador y llévatela a tu mano.' },
  bomba: { nombre: 'Bomba', e: '💣', copias: 3, objetivo: 'vitrina', escudo: true, desc: 'Destruye una carta de la vitrina de otro jugador.' },
  trueque: { nombre: 'Trueque', e: '🔄', copias: 3, objetivo: 'trueque', escudo: true, desc: 'Cambia una carta de tu vitrina por una de la vitrina de otro jugador.' },
  regalo: { nombre: 'Regalo envenenado', e: '🎁', copias: 2, objetivo: 'regalo', escudo: true, desc: 'Coloca una carta de colección de tu mano en la vitrina de otro (ocupa su sitio… o le ayuda sin querer).' },
  congelar: { nombre: 'Congelar', e: '❄️', copias: 2, objetivo: 'jugador', escudo: true, desc: 'Ese jugador se salta su próximo turno.' },
  espia: { nombre: 'Espía', e: '🔍', copias: 3, objetivo: 'jugador', escudo: true, desc: 'Mira en secreto el encargo de otro jugador.' },
  robaEncargo: { nombre: 'Cambiazo', e: '🎭', copias: 2, objetivo: 'jugador', escudo: true, desc: 'Intercambia tu encargo secreto con el de otro jugador (a ciegas).' },
  nuevoEncargo: { nombre: 'Nuevo encargo', e: '📜', copias: 2, objetivo: null, desc: 'Descarta tu encargo y roba otro nuevo.' },
  iman: { nombre: 'Imán', e: '🧲', copias: 2, objetivo: 'palo', desc: 'Elige un palo: cada rival que tenga alguno en su vitrina te da uno (a tu mano).' },
  apuesta: { nombre: 'Doble o nada', e: '🎲', copias: 3, objetivo: 'palo', desc: 'Di un palo y destapa 3 cartas: si sale alguno, te quedas las 3; si no, pierdes una carta de tu vitrina.' },
  rebuscar: { nombre: 'Rebuscar', e: '🗑️', copias: 2, objetivo: 'descarte', desc: 'Coge la carta que quieras del montón de descartes.' },
  tornado: { nombre: 'Tornado', e: '🌪️', copias: 2, objetivo: null, desc: 'Todos pasan su mano entera al jugador de su izquierda.' },
  turbo: { nombre: 'Turbo', e: '⚡', copias: 3, objetivo: null, desc: 'Este turno tienes 2 jugadas más.' },
  escudo: { nombre: 'Escudo', e: '🛡️', copias: 4, objetivo: null, pasiva: true, desc: 'No se juega: si te atacan con una acción, se gasta solo y la anula.' }
};

export const AJUSTES = {
  min: 2, max: 6,
  manoInicial: 5, roboTurno: 2, jugadasTurno: 2, maxMano: 7, maxVitrina: 6,
  copiasPalo: 10, comodines: 4
};

// Encargos: plantillas de colección (P1, P2, P3 se sustituyen por palos al azar)
const PLANTILLAS = [
  { tipo: 'pleno', nombre: 'Pleno', req: [4] },
  { tipo: 'doble', nombre: 'Doble pareja', req: [2, 2] },
  { tipo: 'trio', nombre: 'Trío y uno', req: [3, 1] },
  { tipo: 'familia', nombre: 'Familia', req: [2, 1, 1] },
  { tipo: 'arcoiris', nombre: 'Arcoíris', distintos: 5 }
];

// ---------------------------------------------------------------- Utilidades
const barajar = (arr, rng) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const jug = (est, id) => est.jugadores.find((j) => j.id === id);
const activos = (est) => est.jugadores.filter((j) => !j.fuera);
const ok = (extra = {}) => ({ ok: true, ...extra });
const err = (error) => ({ ok: false, error });
const log = (est, texto) => { est.log.push({ n: ++est.nlog, texto }); if (est.log.length > 60) est.log.shift(); };
export const esColeccion = (c) => c.clase === 'palo' || c.clase === 'comodin';
export const nombreCarta = (c) => (c.clase === 'accion' ? `${ACCIONES[c.accion].e} ${ACCIONES[c.accion].nombre}` : c.clase === 'comodin' ? `${COMODIN.e} Comodín` : `${PALO[c.palo].e} ${PALO[c.palo].nombre}`);

export function crearMazo() {
  const cartas = [];
  let uid = 0;
  PALOS.forEach((p) => { for (let i = 0; i < AJUSTES.copiasPalo; i++) cartas.push({ uid: ++uid, clase: 'palo', palo: p.id }); });
  for (let i = 0; i < AJUSTES.comodines; i++) cartas.push({ uid: ++uid, clase: 'comodin' });
  Object.entries(ACCIONES).forEach(([id, a]) => { for (let i = 0; i < a.copias; i++) cartas.push({ uid: ++uid, clase: 'accion', accion: id }); });
  return cartas;
}

export function nuevoEncargo(rng) {
  const pl = PLANTILLAS[Math.floor(rng() * PLANTILLAS.length)];
  if (pl.distintos) return { tipo: pl.tipo, nombre: pl.nombre, distintos: pl.distintos, req: [] };
  const palos = barajar(PALOS.map((p) => p.id), rng).slice(0, pl.req.length);
  return { tipo: pl.tipo, nombre: pl.nombre, req: pl.req.map((n, k) => ({ palo: palos[k], n })) };
}

export function textoEncargo(e) {
  if (!e) return '—';
  if (e.distintos) return `${e.distintos} palos distintos`;
  return e.req.map((r) => `${r.n} × ${PALO[r.palo].e} ${PALO[r.palo].nombre}`).join(' + ');
}

/** ¿Cumple la vitrina el encargo? Los comodines cubren cualquier hueco. Devuelve también lo que falta. */
export function progresoEncargo(vitrina, e) {
  const cuenta = {};
  let comodines = 0;
  vitrina.forEach((c) => { if (c.clase === 'comodin') comodines += 1; else if (c.clase === 'palo') cuenta[c.palo] = (cuenta[c.palo] || 0) + 1; });
  if (e.distintos) {
    const distintos = Object.keys(cuenta).length;
    const faltan = Math.max(0, e.distintos - distintos - comodines);
    return { cumple: faltan === 0, faltan, total: e.distintos };
  }
  const deficit = e.req.reduce((a, r) => a + Math.max(0, r.n - (cuenta[r.palo] || 0)), 0);
  const total = e.req.reduce((a, r) => a + r.n, 0);
  const faltan = Math.max(0, deficit - comodines);
  return { cumple: faltan === 0, faltan, total };
}

function robar(est, n) {
  const sacadas = [];
  for (let i = 0; i < n; i++) {
    if (!est.mazo.length) {
      est.mazo = barajar(est.descarte, est.rng); est.descarte = [];
      if (est.mazo.length) log(est, 'Se baraja el montón de descartes para hacer un mazo nuevo.');
    }
    if (!est.mazo.length) break;
    sacadas.push(est.mazo.pop());
  }
  return sacadas;
}

// ---------------------------------------------------------------- Crear partida
export function crearPartida(jugadores, cfg = {}, { rng = Math.random } = {}) {
  const est = {
    rng, cfg, mazo: barajar(crearMazo(), rng), descarte: [], log: [], nlog: 0,
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, mano: [], vitrina: [], encargo: null, congelado: false, fuera: false, espiados: {}, jugadas: 0 })),
    turno: null, ronda: 1, fase: 'juego', fin: null, ultimo: null
  };
  est.jugadores.forEach((j) => { j.mano = robar(est, AJUSTES.manoInicial); j.encargo = nuevoEncargo(rng); });
  const primero = est.jugadores[Math.floor(rng() * est.jugadores.length)];
  log(est, `Empieza ${primero.nombre}.`);
  empezarTurno(est, primero.id);
  return est;
}

function empezarTurno(est, id) {
  const p = jug(est, id);
  if (p.congelado) {
    p.congelado = false;
    log(est, `❄️ ${p.nombre} está congelado y se salta el turno.`);
    est.turno = null;
    return pasarTurno(est, id);
  }
  const robadas = robar(est, AJUSTES.roboTurno);
  p.mano.push(...robadas);
  est.turno = { jugadorId: id, jugadas: AJUSTES.jugadasTurno, paso: 'jugar' };
  return null;
}

function pasarTurno(est, desdeId) {
  const lista = est.jugadores;
  let idx = lista.findIndex((j) => j.id === desdeId);
  for (let k = 0; k < lista.length; k++) {
    idx = (idx + 1) % lista.length;
    if (idx === 0) est.ronda += 1;
    if (!lista[idx].fuera) return empezarTurno(est, lista[idx].id);
  }
  return null;
}

// Tras cualquier cambio: ¿alguien ha completado su encargo? Primero quien juega y luego en orden.
function comprobarVictoria(est) {
  if (est.fase === 'fin') return true;
  const actual = est.turno?.jugadorId;
  const orden = [...activos(est)].sort((a, b) => (a.id === actual ? -1 : b.id === actual ? 1 : 0));
  const g = orden.find((j) => progresoEncargo(j.vitrina, j.encargo).cumple);
  if (!g) return false;
  est.fase = 'fin';
  est.fin = { ganadorId: g.id, encargos: est.jugadores.map((j) => ({ id: j.id, encargo: j.encargo, vitrina: j.vitrina })) };
  log(est, `🏆 ¡${g.nombre} completa su encargo (${textoEncargo(g.encargo)}) y gana!`);
  est.turno = null;
  return true;
}

// ---------------------------------------------------------------- Acciones del turno
function delTurno(est, id) {
  if (est.fase !== 'juego') return err('La partida ha terminado.');
  if (!est.turno || est.turno.jugadorId !== id) return err('No es tu turno.');
  return null;
}

const gastarJugada = (est) => { est.turno.jugadas -= 1; };

/** Colocar una carta de colección de tu mano en tu vitrina. */
export function colocar(est, id, uid) {
  const e = delTurno(est, id); if (e) return e;
  const p = jug(est, id); const t = est.turno;
  if (t.paso !== 'jugar') return err('Primero termina lo que estás haciendo.');
  if (t.jugadas <= 0) return err('No te quedan jugadas este turno.');
  const c = p.mano.find((x) => x.uid === Number(uid));
  if (!c || !esColeccion(c)) return err('Elige una carta de colección de tu mano.');
  if (p.vitrina.length >= AJUSTES.maxVitrina) return err(`Tu vitrina está llena (máx. ${AJUSTES.maxVitrina}). Quita una carta antes.`);
  p.mano = p.mano.filter((x) => x.uid !== c.uid);
  p.vitrina.push(c);
  gastarJugada(est);
  est.ultimo = { tipo: 'colocar', por: id, carta: c };
  log(est, `${p.nombre} pone ${nombreCarta(c)} en su vitrina.`);
  comprobarVictoria(est);
  return ok();
}

/** Quitar una carta de tu vitrina (vuelve a tu mano). Gasta una jugada. */
export function retirar(est, id, uid) {
  const e = delTurno(est, id); if (e) return e;
  const p = jug(est, id); const t = est.turno;
  if (t.paso !== 'jugar') return err('Primero termina lo que estás haciendo.');
  if (t.jugadas <= 0) return err('No te quedan jugadas este turno.');
  const c = p.vitrina.find((x) => x.uid === Number(uid));
  if (!c) return err('Esa carta no está en tu vitrina.');
  p.vitrina = p.vitrina.filter((x) => x.uid !== c.uid);
  p.mano.push(c);
  gastarJugada(est);
  log(est, `${p.nombre} retira ${nombreCarta(c)} de su vitrina.`);
  return ok();
}

/** ¿Bloquea el escudo? (lo gasta si sí) */
function escudo(est, atacante, victima, accion) {
  const k = victima.mano.findIndex((c) => c.clase === 'accion' && c.accion === 'escudo');
  if (k === -1) return false;
  const [c] = victima.mano.splice(k, 1);
  est.descarte.push(c);
  log(est, `🛡️ ¡${victima.nombre} tenía un Escudo! La ${ACCIONES[accion].nombre} de ${atacante.nombre} no tiene efecto.`);
  return true;
}

/** Jugar una carta de acción. params según la acción: { objetivo, uid, miUid, suUid, palo } */
export function jugarAccion(est, id, uid, params = {}) {
  const e = delTurno(est, id); if (e) return e;
  const p = jug(est, id); const t = est.turno;
  if (t.paso !== 'jugar') return err('Primero termina lo que estás haciendo.');
  if (t.jugadas <= 0) return err('No te quedan jugadas este turno.');
  const carta = p.mano.find((x) => x.uid === Number(uid));
  if (!carta || carta.clase !== 'accion') return err('Elige una carta de acción de tu mano.');
  const A = ACCIONES[carta.accion];
  if (A.pasiva) return err('El Escudo no se juega: se activa solo cuando te atacan.');
  const v = params.objetivo != null ? jug(est, Number(params.objetivo)) : null;
  const necesitaVictima = ['vitrina', 'trueque', 'regalo', 'jugador'].includes(A.objetivo);
  if (necesitaVictima && (!v || v.fuera || v.id === id)) return err('Elige a otro jugador.');

  // Validaciones previas (antes de gastar la carta)
  let cartaSuya = null; let cartaMia = null;
  if (A.objetivo === 'vitrina') {
    cartaSuya = v.vitrina.find((x) => x.uid === Number(params.suUid));
    if (!cartaSuya) return err('Elige una carta de su vitrina.');
  }
  if (A.objetivo === 'trueque') {
    cartaSuya = v.vitrina.find((x) => x.uid === Number(params.suUid));
    cartaMia = p.vitrina.find((x) => x.uid === Number(params.miUid));
    if (!cartaSuya || !cartaMia) return err('Elige una carta de tu vitrina y otra de la suya.');
  }
  if (A.objetivo === 'regalo') {
    cartaMia = p.mano.find((x) => x.uid === Number(params.miUid));
    if (!cartaMia || !esColeccion(cartaMia)) return err('Elige una carta de colección de tu mano para regalar.');
    if (v.vitrina.length >= AJUSTES.maxVitrina) return err('Su vitrina está llena.');
  }
  if (A.objetivo === 'palo' && !PALO[params.palo]) return err('Elige un palo.');
  if (A.objetivo === 'descarte') {
    cartaSuya = est.descarte.find((x) => x.uid === Number(params.suUid));
    if (!cartaSuya) return err('Elige una carta del montón de descartes.');
  }

  // Se juega: la carta va al descarte y gasta una jugada
  p.mano = p.mano.filter((x) => x.uid !== carta.uid);
  gastarJugada(est);
  est.ultimo = { tipo: 'accion', por: id, accion: carta.accion, objetivo: v?.id ?? null };
  const r = aplicarAccion(est, p, v, carta.accion, { cartaSuya, cartaMia, palo: params.palo });
  est.descarte.push(carta);
  comprobarVictoria(est);
  return ok(r);
}

function aplicarAccion(est, p, v, accion, { cartaSuya, cartaMia, palo }) {
  const A = ACCIONES[accion];
  if (A.escudo && v && escudo(est, p, v, accion)) return { bloqueada: true };
  switch (accion) {
    case 'mapache':
      v.vitrina = v.vitrina.filter((x) => x.uid !== cartaSuya.uid);
      p.mano.push(cartaSuya);
      log(est, `🦝 ${p.nombre} le roba ${nombreCarta(cartaSuya)} a ${v.nombre}.`);
      break;
    case 'bomba':
      v.vitrina = v.vitrina.filter((x) => x.uid !== cartaSuya.uid);
      est.descarte.push(cartaSuya);
      log(est, `💣 ${p.nombre} destruye ${nombreCarta(cartaSuya)} de la vitrina de ${v.nombre}.`);
      break;
    case 'trueque':
      v.vitrina = v.vitrina.map((x) => (x.uid === cartaSuya.uid ? cartaMia : x));
      p.vitrina = p.vitrina.map((x) => (x.uid === cartaMia.uid ? cartaSuya : x));
      log(est, `🔄 ${p.nombre} cambia su ${nombreCarta(cartaMia)} por ${nombreCarta(cartaSuya)} de ${v.nombre}.`);
      break;
    case 'regalo':
      p.mano = p.mano.filter((x) => x.uid !== cartaMia.uid);
      v.vitrina.push(cartaMia);
      log(est, `🎁 ${p.nombre} coloca ${nombreCarta(cartaMia)} en la vitrina de ${v.nombre}.`);
      break;
    case 'congelar':
      v.congelado = true;
      log(est, `❄️ ${p.nombre} congela a ${v.nombre}: se saltará su próximo turno.`);
      break;
    case 'espia':
      p.espiados[v.id] = { ...v.encargo };
      log(est, `🔍 ${p.nombre} espía el encargo de ${v.nombre}.`);
      return { espiado: { id: v.id, encargo: v.encargo } };
    case 'robaEncargo': {
      const mio = p.encargo; p.encargo = v.encargo; v.encargo = mio;
      // lo que se sabía de esos encargos ya no vale
      est.jugadores.forEach((j) => { delete j.espiados[p.id]; delete j.espiados[v.id]; });
      p.espiados[v.id] = { ...v.encargo };
      log(est, `🎭 ¡Cambiazo! ${p.nombre} intercambia su encargo con el de ${v.nombre}.`);
      break;
    }
    case 'nuevoEncargo':
      p.encargo = nuevoEncargo(est.rng);
      est.jugadores.forEach((j) => { delete j.espiados[p.id]; });
      log(est, `📜 ${p.nombre} cambia su encargo por uno nuevo.`);
      break;
    case 'iman': {
      const recibidas = [];
      activos(est).filter((q) => q.id !== p.id).forEach((q) => {
        const c = q.vitrina.find((x) => x.clase === 'palo' && x.palo === palo);
        if (c) { q.vitrina = q.vitrina.filter((x) => x.uid !== c.uid); p.mano.push(c); recibidas.push(q.nombre); }
      });
      log(est, `🧲 ${p.nombre} atrae ${PALO[palo].e} ${PALO[palo].nombre}: ${recibidas.length ? `se lo dan ${recibidas.join(', ')}` : 'nadie tenía'}.`);
      break;
    }
    case 'apuesta': {
      const destapadas = robar(est, 3);
      const acierto = destapadas.some((c) => (c.clase === 'palo' && c.palo === palo) || c.clase === 'comodin');
      if (acierto) {
        p.mano.push(...destapadas);
        log(est, `🎲 ${p.nombre} apuesta por ${PALO[palo].e} y ¡acierta! Se queda: ${destapadas.map(nombreCarta).join(', ')}.`);
      } else {
        est.descarte.push(...destapadas);
        let perdida = null;
        if (p.vitrina.length) {
          perdida = p.vitrina[Math.floor(est.rng() * p.vitrina.length)];
          p.vitrina = p.vitrina.filter((x) => x.uid !== perdida.uid);
          est.descarte.push(perdida);
        }
        log(est, `🎲 ${p.nombre} apuesta por ${PALO[palo].e} y falla${perdida ? `: pierde ${nombreCarta(perdida)} de su vitrina` : ''}.`);
      }
      return { apuesta: { acierto, destapadas } };
    }
    case 'rebuscar':
      est.descarte = est.descarte.filter((x) => x.uid !== cartaSuya.uid);
      p.mano.push(cartaSuya);
      log(est, `🗑️ ${p.nombre} rebusca en los descartes y se lleva ${nombreCarta(cartaSuya)}.`);
      break;
    case 'tornado': {
      const act = activos(est);
      const manos = act.map((j) => j.mano);
      act.forEach((j, k) => { j.mano = manos[(k - 1 + act.length) % act.length]; });
      log(est, `🌪️ ¡Tornado! Todos pasan su mano al jugador de la izquierda.`);
      break;
    }
    case 'turbo':
      est.turno.jugadas += 2;
      log(est, `⚡ ${p.nombre} activa el Turbo: 2 jugadas más.`);
      break;
    default:
      break;
  }
  return {};
}

/** Terminar el turno (si te pasas del límite de mano, primero hay que descartar). */
export function terminarTurno(est, id) {
  const e = delTurno(est, id); if (e) return e;
  const p = jug(est, id);
  if (p.mano.length > AJUSTES.maxMano) {
    est.turno.paso = 'descartar';
    return ok({ descartar: p.mano.length - AJUSTES.maxMano });
  }
  est.turno = null;
  pasarTurno(est, id);
  return ok();
}

export function descartar(est, id, uid) {
  const e = delTurno(est, id); if (e) return e;
  const p = jug(est, id);
  const c = p.mano.find((x) => x.uid === Number(uid));
  if (!c) return err('Esa carta no está en tu mano.');
  if (p.mano.length <= AJUSTES.maxMano && est.turno.paso !== 'descartar') return err('No necesitas descartar.');
  p.mano = p.mano.filter((x) => x.uid !== c.uid);
  est.descarte.push(c);
  if (p.mano.length <= AJUSTES.maxMano && est.turno.paso === 'descartar') {
    est.turno = null;
    log(est, `${p.nombre} descarta y termina su turno.`);
    pasarTurno(est, id);
  }
  return ok();
}

// ---------------------------------------------------------------- Ausencias
export function forzar(est) {
  if (est.fase !== 'juego' || !est.turno) return false;
  const p = jug(est, est.turno.jugadorId);
  while (p.mano.length > AJUSTES.maxMano) est.descarte.push(p.mano.pop());
  log(est, `${p.nombre} no respondía: pierde el turno.`);
  est.turno = null;
  pasarTurno(est, p.id);
  return true;
}

export function abandonar(est, id) {
  const p = jug(est, id);
  if (!p || p.fuera || est.fase !== 'juego') return;
  p.fuera = true;
  est.descarte.push(...p.mano, ...p.vitrina);
  p.mano = []; p.vitrina = [];
  log(est, `${p.nombre} abandona la partida.`);
  const act = activos(est);
  if (act.length === 1) {
    est.fase = 'fin';
    est.fin = { ganadorId: act[0].id, porAbandono: true, encargos: est.jugadores.map((j) => ({ id: j.id, encargo: j.encargo, vitrina: j.vitrina })) };
    est.turno = null;
    return;
  }
  if (est.turno?.jugadorId === id) { est.turno = null; pasarTurno(est, id); }
}

// ---------------------------------------------------------------- Vista de un jugador
export function vistaDe(est, id) {
  const yo = jug(est, id);
  const fin = est.fase === 'fin';
  return {
    fase: est.fase, ronda: est.ronda, mazo: est.mazo.length,
    descarte: est.descarte.slice(-12).reverse(),
    turno: est.turno ? { jugadorId: est.turno.jugadorId, jugadas: est.turno.jugadas, paso: est.turno.paso } : null,
    jugadores: est.jugadores.map((j) => ({
      id: j.id, nombre: j.nombre, vitrina: j.vitrina, nMano: j.mano.length, congelado: j.congelado, fuera: j.fuera,
      encargo: fin || j.id === id ? j.encargo : (yo?.espiados[j.id] || null),
      progreso: fin || j.id === id || yo?.espiados[j.id] ? progresoEncargo(j.vitrina, j.encargo) : null
    })),
    yo: yo ? { id: yo.id, mano: yo.mano, encargo: yo.encargo, progreso: progresoEncargo(yo.vitrina, yo.encargo) } : null,
    ultimo: est.ultimo,
    log: est.log.slice(-25),
    fin: est.fin
  };
}
