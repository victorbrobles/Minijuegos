// server/sumacero/engine.js
// Motor puro de «Suma Cero» (sin red ni React). Lo usan:
//   - server/routes/sumacero.js (salas online)
//   - client/src/games/SumaCero/engine.js (modo un solo dispositivo)  <-- COPIA IDÉNTICA de este archivo
// Si cambias algo aquí:  npm run sync:sumacero  (en /server)
//
// Las especiales que se USAN salen del juego; al descarte solo va lo que se descarta de verdad.
// Equilibrio del plantón: el Escudo protege al que se planta (pero si te lo quedas, cuenta +2 como especial),
// Rayos X permite ver si un rival se guarda un Cambio de manos, y si te cambian la mano después de plantarte
// no pagas la penalización de plantón.
//
// IDEA: cada jugador empieza con 5 cartas con valores positivos y negativos. El objetivo es que la suma de tu
// mano sea exactamente 0 (o lo más cercana posible). En tu turno robas una carta (del mazo o la de arriba del
// descarte) y después juegas una carta especial o descartas una carta. Cuando creas que tu mano es buena,
// en lugar de robar te PLANTAS: cada rival juega un último turno… y puede destrozarte la mano justo antes
// del final (robarte, darte la vuelta a los signos, cambiarte la mano entera…).

export const ESPECIALES = {
  robar: { nombre: 'Mano rápida', e: '🫳', objetivo: 'jugador', desc: 'Roba una carta al azar de la mano de otro jugador.' },
  purga: { nombre: 'Purga', e: '🔥', objetivo: 'jugador', desc: 'Obliga a otro jugador a descartar su carta más alta.' },
  cambio: { nombre: 'Cambio de manos', e: '🔀', objetivo: 'jugador', desc: 'Intercambia tu mano entera con la de otro jugador.' },
  doble: { nombre: 'Doble', e: '✖️2', objetivo: 'propia', desc: 'Duplica el valor de una de tus cartas (también si es negativa).' },
  espejo: { nombre: 'Espejo', e: '🪞', objetivo: null, desc: 'Cambia el signo de todas tus cartas.' },
  congelar: { nombre: 'Congelar', e: '❄️', objetivo: 'jugador', desc: 'Ese jugador se salta su próximo turno.' },
  avalancha: { nombre: 'Avalancha', e: '🌊', objetivo: null, desc: 'Todos los demás roban 2 cartas.' },
  rayos: { nombre: 'Rayos X', e: '🔍', objetivo: 'jugador', desc: 'Mira en secreto la mano entera de otro jugador (¿se guarda un Cambio de manos?).' },
  escudo: { nombre: 'Escudo', e: '🛡️', objetivo: null, pasiva: true, desc: 'No se juega: si te atacan (Mano rápida, Purga, Cambio, Congelar o Avalancha), se gasta solo y lo anula.' }
};
// Cartas que el Escudo detiene
const ATAQUES = new Set(['robar', 'purga', 'cambio', 'congelar', 'avalancha']);

export const OPCIONES_RONDAS = [3, 5, 7];
export const AJUSTES = {
  min: 2, max: 6,
  manoInicial: 5, copiasEspecial: 3, maxValor: 10, copiasNumero: 2,
  bonusCero: 3, penalPlanton: 5, penalEspecial: 2,
  turnosMaxRonda: 80
};

// ---------------------------------------------------------------- Utilidades
const barajar = (arr, rng) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const jug = (est, id) => est.jugadores.find((j) => j.id === id);
const activos = (est) => est.jugadores.filter((j) => !j.fuera);
const ok = (extra = {}) => ({ ok: true, ...extra });
const err = (error) => ({ ok: false, error });
const log = (est, texto) => { est.log.push({ n: ++est.nlog, texto }); if (est.log.length > 60) est.log.shift(); };
// Avisos personales: cada implicado en una carta especial ve qué le ha pasado (lo que gana y lo que pierde).
function avisar(est, id, a) {
  est.avisos ||= {};
  est.nav = (est.nav || 0) + 1;
  (est.avisos[id] ||= []).push({ n: est.nav, ...a });
  if (est.avisos[id].length > 8) est.avisos[id].shift();
}
/** El jugador ya ha leído sus avisos hasta el número `n`. */
export function visto(est, id, n) {
  if (est.avisos?.[id]) est.avisos[id] = est.avisos[id].filter((x) => x.n > Number(n));
  return ok();
}
const nombres = (cartas) => cartas.map((c) => nombreCarta(c));
export const valor = (c) => (c.tipo === 'numero' ? c.valor : 0);
export const suma = (mano) => mano.reduce((a, c) => a + valor(c), 0);
export const nombreCarta = (c) => (c.tipo === 'numero' ? (c.valor > 0 ? `+${c.valor}` : String(c.valor)) : `${ESPECIALES[c.especial].e} ${ESPECIALES[c.especial].nombre}`);

export function crearMazo(numJugadores = 4) {
  const cartas = [];
  let uid = 0;
  const factor = numJugadores >= 5 ? 2 : 1;
  for (let f = 0; f < factor; f++) {
    for (let v = 1; v <= AJUSTES.maxValor; v++) {
      for (let k = 0; k < AJUSTES.copiasNumero; k++) {
        cartas.push({ uid: ++uid, tipo: 'numero', valor: v, base: v });
        cartas.push({ uid: ++uid, tipo: 'numero', valor: -v, base: -v });
      }
    }
    Object.keys(ESPECIALES).forEach((e) => { for (let k = 0; k < AJUSTES.copiasEspecial; k++) cartas.push({ uid: ++uid, tipo: 'especial', especial: e }); });
  }
  return cartas;
}

// Al ir al descarte, la carta recupera su valor original (pierde el Doble y el Espejo)
function aDescarte(est, c) {
  if (c.tipo === 'numero') { c.valor = c.base; delete c.doble; }
  est.descarte.push(c);
}

function robarDelMazo(est, n) {
  const sacadas = [];
  for (let i = 0; i < n; i++) {
    if (!est.mazo.length) {
      const arriba = est.descarte.pop();
      est.mazo = barajar(est.descarte, est.rng);
      est.descarte = arriba ? [arriba] : [];
      if (est.mazo.length) log(est, 'Se baraja el descarte para formar un mazo nuevo.');
    }
    if (!est.mazo.length) break;
    sacadas.push(est.mazo.pop());
  }
  return sacadas;
}

// ---------------------------------------------------------------- Crear partida y rondas
export function crearPartida(jugadores, config = {}, { rng = Math.random } = {}) {
  const rondas = OPCIONES_RONDAS.includes(Number(config.rondas)) ? Number(config.rondas) : 3;
  const est = {
    rng, cfg: { rondas }, ronda: 0, fase: 'juego', log: [], nlog: 0,
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, mano: [], total: 0, congelado: false, fuera: false, listo: false })),
    mazo: [], descarte: [], turno: null, plantado: null, pendientesFinal: [], turnosRonda: 0,
    empieza: Math.floor(rng() * jugadores.length), resultado: null, historial: [], fin: null, ultimo: null
  };
  empezarRonda(est);
  return est;
}

function empezarRonda(est) {
  est.ronda += 1;
  est.fase = 'juego';
  est.mazo = barajar(crearMazo(est.jugadores.length), est.rng);
  est.descarte = [];
  est.plantado = null; est.pendientesFinal = []; est.turnosRonda = 0; est.resultado = null; est.ultimo = null; est.cambiadoAlPlantado = false;
  activos(est).forEach((j) => { j.mano = robarDelMazo(est, AJUSTES.manoInicial); j.congelado = false; j.listo = false; });
  // la primera carta del descarte siempre es un número
  const k = est.mazo.findIndex((c) => c.tipo === 'numero');
  if (k >= 0) est.descarte.push(est.mazo.splice(k, 1)[0]);
  const lista = est.jugadores;
  let idx = (est.empieza + est.ronda - 1) % lista.length;
  while (lista[idx].fuera) idx = (idx + 1) % lista.length;
  log(est, `— Ronda ${est.ronda}: empieza ${lista[idx].nombre} —`);
  empezarTurno(est, lista[idx].id);
}

function empezarTurno(est, id) {
  const p = jug(est, id);
  est.turnosRonda += 1;
  if (p.congelado) {
    p.congelado = false;
    log(est, `❄️ ${p.nombre} está congelado y pierde el turno.`);
    return finTurno(est, id);
  }
  est.turno = { jugadorId: id, paso: 'robar', robada: null };
  return null;
}

function siguienteId(est, desdeId) {
  const lista = est.jugadores;
  let idx = lista.findIndex((j) => j.id === desdeId);
  for (let k = 0; k < lista.length; k++) {
    idx = (idx + 1) % lista.length;
    if (!lista[idx].fuera) return lista[idx].id;
  }
  return null;
}

function finTurno(est, id) {
  est.turno = null;
  if (est.plantado != null) {
    est.pendientesFinal = est.pendientesFinal.filter((x) => x !== id);
    if (!est.pendientesFinal.length) return resolverRonda(est);
  }
  if (est.turnosRonda >= AJUSTES.turnosMaxRonda) { log(est, 'Se acaba el tiempo de la ronda.'); return resolverRonda(est); }
  const sig = siguienteId(est, id);
  if (sig == null || sig === est.plantado) return resolverRonda(est);
  return empezarTurno(est, sig);
}

// ---------------------------------------------------------------- Acciones
function delTurno(est, id) {
  if (est.fase !== 'juego') return err('Ahora no se juega.');
  if (!est.turno || est.turno.jugadorId !== id) return err('No es tu turno.');
  return null;
}

/** Paso 1: robar del mazo o coger la carta de arriba del descarte. */
export function robar(est, id, origen = 'mazo') {
  const e = delTurno(est, id); if (e) return e;
  const p = jug(est, id); const t = est.turno;
  if (t.paso !== 'robar') return err('Ya has robado este turno.');
  let c;
  if (origen === 'descarte') {
    c = est.descarte[est.descarte.length - 1];
    if (!c) return err('El descarte está vacío.');
    est.descarte.pop();
    log(est, `${p.nombre} coge ${nombreCarta(c)} del descarte.`);
  } else {
    [c] = robarDelMazo(est, 1);
    if (!c) return err('No quedan cartas: coge del descarte.');
    log(est, `${p.nombre} roba del mazo.`);
  }
  p.mano.push(c);
  t.robada = c.uid;
  t.paso = 'jugar';
  return ok({ robada: c });
}

/** En lugar de robar: plantarse. Cada rival juega un último turno. */
export function plantarse(est, id) {
  const e = delTurno(est, id); if (e) return e;
  const p = jug(est, id);
  if (est.turno.paso !== 'robar') return err('Solo puedes plantarte al empezar tu turno.');
  if (est.plantado != null) return err('Alguien ya se ha plantado.');
  est.plantado = id;
  est.pendientesFinal = activos(est).filter((j) => j.id !== id).map((j) => j.id);
  log(est, `✋ ¡${p.nombre} se planta! Los demás tienen un último turno.`);
  est.ultimo = { tipo: 'plantarse', por: id };
  return ok(finTurno(est, id));
}

/** Paso 2 (opción A): descartar una carta y terminar el turno. */
export function descartar(est, id, uid) {
  const e = delTurno(est, id); if (e) return e;
  const p = jug(est, id);
  if (est.turno.paso !== 'jugar') return err('Primero roba una carta.');
  const c = p.mano.find((x) => x.uid === Number(uid));
  if (!c) return err('Esa carta no está en tu mano.');
  p.mano = p.mano.filter((x) => x.uid !== c.uid);
  aDescarte(est, c);
  log(est, `${p.nombre} descarta ${nombreCarta(c)}.`);
  est.ultimo = { tipo: 'descartar', por: id, carta: c };
  finTurno(est, id);
  return ok();
}

/** Paso 2 (opción B): jugar una carta especial (se gasta) y terminar el turno. params: { objetivo, cartaUid } */
export function jugarEspecial(est, id, uid, params = {}) {
  const e = delTurno(est, id); if (e) return e;
  const p = jug(est, id);
  if (est.turno.paso !== 'jugar') return err('Primero roba una carta.');
  const carta = p.mano.find((x) => x.uid === Number(uid));
  if (!carta || carta.tipo !== 'especial') return err('Elige una carta especial de tu mano.');
  const E = ESPECIALES[carta.especial];
  const v = params.objetivo != null ? jug(est, Number(params.objetivo)) : null;
  if (E.objetivo === 'jugador' && (!v || v.fuera || v.id === id)) return err('Elige a otro jugador.');
  let propia = null;
  if (E.objetivo === 'propia') {
    propia = p.mano.find((x) => x.uid === Number(params.cartaUid) && x.tipo === 'numero');
    if (!propia) return err('Elige una carta numérica de tu mano.');
  }
  if (E.pasiva) return err('El Escudo no se juega: se activa solo cuando te atacan.');
  // La carta usada sale del juego (no va al descarte)
  p.mano = p.mano.filter((x) => x.uid !== carta.uid);
  est.usadas = (est.usadas || 0) + 1;
  let resultado = {};
  const tit = `${E.e} ${E.nombre}`;
  // Escudo: un ataque contra quien lo tiene se anula y el escudo se gasta
  const protegido = (q) => {
    if (!ATAQUES.has(carta.especial)) return false;
    const k = q.mano.findIndex((x) => x.tipo === 'especial' && x.especial === 'escudo');
    if (k === -1) return false;
    q.mano.splice(k, 1);
    log(est, `🛡️ ¡${q.nombre} tenía un Escudo! ${E.nombre} de ${p.nombre} no le afecta.`);
    avisar(est, q.id, { e: '🛡️', titulo: '¡Tu Escudo te ha protegido!', texto: `${p.nombre} te ha atacado con ${E.e} ${E.nombre}, pero tu Escudo lo ha parado (se gasta).`, pierde: ['🛡️ Escudo'] });
    return true;
  };
  if (v && protegido(v)) {
    avisar(est, id, { e: '🛡️', titulo: `${v.nombre} tenía un Escudo`, texto: `Tu ${E.e} ${E.nombre} no tiene efecto.` });
    est.ultimo = { tipo: 'especial', por: id, especial: carta.especial, objetivo: v.id, bloqueada: true };
    finTurno(est, id);
    return ok({ bloqueada: true });
  }
  switch (carta.especial) {
    case 'robar': {
      if (!v.mano.length) {
        log(est, `🫳 ${p.nombre} intenta robar a ${v.nombre}, pero no tiene cartas.`);
        avisar(est, id, { e: E.e, titulo: tit, texto: `${v.nombre} no tenía cartas: no le robas nada.` });
        break;
      }
      const c = v.mano[Math.floor(est.rng() * v.mano.length)];
      v.mano = v.mano.filter((x) => x.uid !== c.uid);
      p.mano.push(c);
      resultado = { robada: c };
      log(est, `🫳 ${p.nombre} le roba una carta a ${v.nombre}.`);
      avisar(est, id, { e: E.e, titulo: tit, texto: `Le robas una carta a ${v.nombre}.`, gana: nombres([c]) });
      avisar(est, v.id, { e: E.e, titulo: `¡${p.nombre} te ha robado!`, texto: `${p.nombre} ha usado ${E.nombre} contra ti y se lleva una de tus cartas.`, pierde: nombres([c]), ataque: true });
      break;
    }
    case 'purga': {
      const nums = v.mano.filter((x) => x.tipo === 'numero');
      if (!nums.length) {
        log(est, `🔥 ${v.nombre} no tenía números que descartar.`);
        avisar(est, id, { e: E.e, titulo: tit, texto: `${v.nombre} no tenía números: no pasa nada.` });
        break;
      }
      const alta = nums.reduce((a, b) => (b.valor > a.valor ? b : a));
      v.mano = v.mano.filter((x) => x.uid !== alta.uid);
      aDescarte(est, alta);
      log(est, `🔥 ${p.nombre} obliga a ${v.nombre} a descartar su carta más alta: ${nombreCarta(alta)}.`);
      avisar(est, id, { e: E.e, titulo: tit, texto: `${v.nombre} tira su carta más alta: ${nombreCarta(alta)}.` });
      avisar(est, v.id, { e: E.e, titulo: `¡${p.nombre} te ha atacado!`, texto: `${p.nombre} ha usado ${E.nombre}: tiras tu carta más alta.`, pierde: nombres([alta]), ataque: true });
      break;
    }
    case 'cambio': {
      const m = p.mano; p.mano = v.mano; v.mano = m;
      if (est.plantado === v.id) est.cambiadoAlPlantado = true;
      log(est, `🔀 ${p.nombre} intercambia su mano con la de ${v.nombre}.`);
      avisar(est, id, { e: E.e, titulo: tit, texto: `Cambias tu mano entera con la de ${v.nombre}.`, gana: nombres(p.mano), pierde: nombres(v.mano) });
      avisar(est, v.id, { e: E.e, titulo: `¡${p.nombre} te ha cambiado la mano!`, texto: `${p.nombre} ha usado ${E.nombre}: os intercambiáis las manos enteras.`, gana: nombres(v.mano), pierde: nombres(p.mano), ataque: true });
      break;
    }
    case 'doble': {
      const antes = nombreCarta(propia);
      propia.valor *= 2;
      propia.doble = (propia.doble || 1) * 2;
      log(est, `✖️2 ${p.nombre} duplica una de sus cartas.`);
      avisar(est, id, { e: E.e, titulo: tit, texto: `Tu ${antes} pasa a valer ${nombreCarta(propia)}.` });
      break;
    }
    case 'espejo':
      p.mano.forEach((c) => { if (c.tipo === 'numero') c.valor = -c.valor; });
      log(est, `🪞 ${p.nombre} cambia el signo de todas sus cartas.`);
      avisar(est, id, { e: E.e, titulo: tit, texto: `Todas tus cartas cambian de signo: ahora sumas ${suma(p.mano)}.` });
      break;
    case 'congelar':
      v.congelado = true;
      log(est, `❄️ ${p.nombre} congela a ${v.nombre}.`);
      avisar(est, id, { e: E.e, titulo: tit, texto: `${v.nombre} se saltará su próximo turno.` });
      avisar(est, v.id, { e: E.e, titulo: `¡${p.nombre} te ha congelado!`, texto: 'Te saltas tu próximo turno.', ataque: true });
      break;
    case 'avalancha': {
      const rivales = activos(est).filter((q) => q.id !== id && !protegido(q));
      rivales.forEach((q) => {
        const nuevas = robarDelMazo(est, 2);
        q.mano.push(...nuevas);
        avisar(est, q.id, { e: E.e, titulo: `¡${p.nombre} te ha atacado!`, texto: `${p.nombre} ha usado ${E.nombre}: robas ${nuevas.length} ${nuevas.length === 1 ? 'carta' : 'cartas'}.`, gana: nombres(nuevas), ataque: true });
      });
      log(est, `🌊 ¡Avalancha! ${p.nombre} hace que ${rivales.length ? 'los demás roben' : 'nadie robe'} 2 cartas.`);
      avisar(est, id, { e: E.e, titulo: tit, texto: rivales.length ? `${rivales.map((q) => q.nombre).join(', ').replace(/, ([^,]*)$/, ' y $1')} ${rivales.length === 1 ? 'roba' : 'roban'} 2 cartas.` : 'Todos tenían Escudo: nadie roba.' });
      break;
    }
    case 'rayos':
      log(est, `🔍 ${p.nombre} mira la mano de ${v.nombre} con Rayos X.`);
      avisar(est, id, { e: E.e, titulo: tit, texto: v.mano.length ? `La mano de ${v.nombre} (suma ${suma(v.mano)}):` : `${v.nombre} no tiene cartas.`, ve: nombres(v.mano) });
      avisar(est, v.id, { e: E.e, titulo: `¡${p.nombre} ha visto tu mano!`, texto: `${p.nombre} ha usado Rayos X: ya sabe qué cartas tienes.`, ataque: true });
      break;
    default: break;
  }
  est.ultimo = { tipo: 'especial', por: id, especial: carta.especial, objetivo: v?.id ?? null };
  finTurno(est, id);
  return ok(resultado);
}

// ---------------------------------------------------------------- Fin de ronda
export function puntosMano(mano) {
  const s = suma(mano);
  const especiales = mano.filter((c) => c.tipo === 'especial').length;
  return { suma: s, especiales, puntos: Math.abs(s) + especiales * AJUSTES.penalEspecial - (s === 0 && mano.length ? AJUSTES.bonusCero : 0) };
}

function resolverRonda(est) {
  est.turno = null;
  const filas = activos(est).map((j) => ({ id: j.id, nombre: j.nombre, mano: j.mano.map((c) => ({ ...c })), ...puntosMano(j.mano) }));
  const mejor = Math.min(...filas.map((f) => f.puntos));
  filas.forEach((f) => {
    f.planton = false;
    // Si te cambiaron la mano después de plantarte, no pagas el plantón
    if (f.id === est.plantado && f.puntos > mejor && !est.cambiadoAlPlantado) { f.puntos += AJUSTES.penalPlanton; f.planton = true; }
    jug(est, f.id).total += f.puntos;
  });
  filas.sort((a, b) => a.puntos - b.puntos);
  est.resultado = { ronda: est.ronda, plantado: est.plantado, filas, mejor };
  est.historial.push({ ronda: est.ronda, puntos: Object.fromEntries(filas.map((f) => [f.id, f.puntos])) });
  est.fase = 'resultado';
  est.jugadores.forEach((j) => { j.listo = false; });
  log(est, `— Fin de la ronda ${est.ronda} —`);
}

export function continuar(est, id) {
  if (est.fase !== 'resultado') return err('Ahora no toca.');
  const p = jug(est, id);
  if (!p || p.fuera) return err('No puedes actuar.');
  p.listo = true;
  if (activos(est).every((j) => j.listo)) siguiente(est);
  return ok();
}

function siguiente(est) {
  if (est.ronda >= est.cfg.rondas || activos(est).length < 2) return terminar(est);
  return empezarRonda(est);
}

function terminar(est) {
  est.fase = 'fin'; est.turno = null;
  const tabla = est.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, total: j.total, fuera: j.fuera }))
    .sort((a, b) => (a.fuera - b.fuera) || (a.total - b.total));
  const top = tabla.find((t) => !t.fuera);
  est.fin = { tabla, ganadores: top ? tabla.filter((t) => !t.fuera && t.total === top.total).map((t) => t.id) : [] };
}

// ---------------------------------------------------------------- Ausencias
export function forzar(est) {
  if (est.fase === 'resultado') { activos(est).forEach((j) => { j.listo = true; }); siguiente(est); return true; }
  if (est.fase !== 'juego' || !est.turno) return false;
  const p = jug(est, est.turno.jugadorId);
  if (est.turno.paso === 'jugar') {
    const c = p.mano.find((x) => x.uid === est.turno.robada) || p.mano[p.mano.length - 1];
    if (c) { p.mano = p.mano.filter((x) => x.uid !== c.uid); aDescarte(est, c); }
  }
  log(est, `${p.nombre} no respondía: pierde el turno.`);
  finTurno(est, p.id);
  return true;
}

export function abandonar(est, id) {
  const p = jug(est, id);
  if (!p || p.fuera || est.fase === 'fin') return;
  p.fuera = true;
  p.mano.forEach((c) => aDescarte(est, c)); p.mano = [];
  log(est, `${p.nombre} abandona la partida.`);
  if (activos(est).length < 2) return terminar(est);
  if (est.fase === 'resultado') { if (activos(est).every((j) => j.listo)) siguiente(est); return undefined; }
  est.pendientesFinal = est.pendientesFinal.filter((x) => x !== id);
  if (est.plantado === id) { est.plantado = null; est.pendientesFinal = []; }
  if (est.turno?.jugadorId === id) finTurno(est, id);
  else if (est.plantado != null && !est.pendientesFinal.length) resolverRonda(est);
  return undefined;
}

// ---------------------------------------------------------------- Vista
export function vistaDe(est, id) {
  const yo = jug(est, id);
  const revelado = est.fase !== 'juego';
  return {
    fase: est.fase, ronda: est.ronda, rondas: est.cfg.rondas, mazo: est.mazo.length,
    descarteArriba: est.descarte[est.descarte.length - 1] || null, nDescarte: est.descarte.length,
    turno: est.turno ? { jugadorId: est.turno.jugadorId, paso: est.turno.paso, robada: est.turno.jugadorId === id ? est.turno.robada : null } : null,
    plantado: est.plantado, ultimosTurnos: est.pendientesFinal,
    jugadores: est.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, nMano: j.mano.length, total: j.total, congelado: j.congelado, fuera: j.fuera, listo: j.listo })),
    yo: yo ? { id: yo.id, mano: yo.mano, ...puntosMano(yo.mano), avisos: est.avisos?.[id] || [] } : null,
    ultimo: est.ultimo,
    resultado: revelado ? est.resultado : null,
    historial: est.historial,
    log: est.log.slice(-25),
    fin: est.fin
  };
}
