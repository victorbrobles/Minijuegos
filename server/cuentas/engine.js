// server/cuentas/engine.js
// Motor puro de «Lleva la cuenta» (sin red ni React). Lo usan:
//   - server/routes/cuentas.js (salas online)
//   - client/src/games/Cuentas/engine.js (modo un solo dispositivo)  <-- COPIA IDÉNTICA de este archivo
// Si cambias algo aquí:  npm run sync:cuentas  (en /server)
//
// IDEA: cada jugador recibe unos cuantos números del 1 al 100, secretos. Entre todos hay que colocarlos en
// orden ascendente SIN HABLAR. En tu turno puedes: soltar un número, usar una carta de acción (aleatoria; tienes
// 3 en toda la partida) o pasar. Si sueltas un número que no tocaba (había otro más bajo en alguna mano) pierdes
// una vida; con 2 fallos quedas eliminado. Y ojo: si pasas dos turnos seguidos sin soltar carta teniendo tú el
// número que había que colocar, también pierdes una vida. Gana quien se queda antes sin cartas.

export const ACCIONES = {
  chivato: { nombre: 'Chivatazo', e: '🔔', tipo: 'buena', desc: 'Te dice si tu número más bajo es el siguiente que hay que colocar.' },
  radar: { nombre: 'Radar', e: '📡', tipo: 'buena', desc: 'Te dice cuántos números de los demás hay por debajo de tu número más bajo.' },
  escudo: { nombre: 'Escudo', e: '🛡️', tipo: 'buena', desc: 'Tu próximo fallo no te quitará vida.' },
  encasquetar: { nombre: 'Encasquetar', e: '🎁', tipo: 'buena', desc: 'Le das tu número más alto al siguiente jugador.' },
  quemar: { nombre: 'Quemar', e: '🔥', tipo: 'buena', desc: 'Tu número más alto se elimina del juego.' },
  espia: { nombre: 'Espía', e: '👀', tipo: 'buena', desc: 'Ves el número más bajo de un rival al azar.' },
  congelar: { nombre: 'Congelar', e: '❄️', tipo: 'neutral', desc: 'El siguiente jugador se salta su turno.' },
  ruleta: { nombre: 'Ruleta', e: '🎲', tipo: 'neutral', desc: 'Cambias un número al azar con un rival al azar.' },
  carga: { nombre: 'Carga pesada', e: '📦', tipo: 'mala', desc: 'Mala suerte: robas un número nuevo.' },
  apagon: { nombre: 'Apagón', e: '🌑', tipo: 'mala', desc: 'Mala suerte: pierdes otra de tus cartas de acción.' }
};
const BOLSA = ['chivato', 'chivato', 'radar', 'radar', 'escudo', 'encasquetar', 'quemar', 'espia', 'congelar', 'ruleta', 'carga', 'apagon'];

export const AJUSTES = {
  min: 2, max: 8, vidas: 2, accionesPorJugador: 3, pasesPenaliza: 2, maxNumero: 100,
  cartasPor: { 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 3, 8: 3 },
  puntos: [3, 2, 1]
};

const barajar = (arr, rng) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const jug = (est, id) => est.jugadores.find((j) => j.id === id);
const enJuego = (est) => est.jugadores.filter((j) => !j.fuera && !j.eliminado && j.mano.length > 0);
const ok = (extra = {}) => ({ ok: true, ...extra });
const err = (error) => ({ ok: false, error });
const log = (est, texto, extra = {}) => { est.log.push({ n: ++est.nlog, texto, ...extra }); if (est.log.length > 60) est.log.shift(); };
const ordenar = (m) => m.sort((a, b) => a - b);

/** El número que toca colocar: el más bajo que queda en las manos de los que siguen jugando. */
export function siguienteNumero(est) {
  let min = null;
  est.jugadores.forEach((j) => { if (!j.fuera && !j.eliminado) j.mano.forEach((n) => { if (min == null || n < min) min = n; }); });
  return min;
}

// ---------------------------------------------------------------- Crear partida
export function crearPartida(jugadores, cfg = {}, { rng = Math.random } = {}) {
  const n = jugadores.length;
  const porJugador = AJUSTES.cartasPor[Math.min(AJUSTES.max, Math.max(AJUSTES.min, n))];
  const mazo = barajar(Array.from({ length: AJUSTES.maxNumero }, (_, i) => i + 1), rng);
  const est = {
    rng, cfg, fase: 'juego', log: [], nlog: 0, mazo, tablero: [], ultimo: 0, turno: null, terminados: [], fin: null, turnos: 0,
    jugadores: jugadores.map((j) => ({
      id: j.id, nombre: j.nombre, mano: ordenar(mazo.splice(0, porJugador)),
      vidas: AJUSTES.vidas, acciones: AJUSTES.accionesPorJugador, pases: 0, escudo: false, congelado: false,
      eliminado: false, fuera: false, privado: []
    }))
  };
  const primero = est.jugadores[Math.floor(rng() * n)];
  log(est, `Empieza ${primero.nombre}. Cada uno tiene ${porJugador} números.`);
  empezarTurno(est, primero.id);
  return est;
}

function empezarTurno(est, id) {
  const p = jug(est, id);
  est.turnos += 1;
  if (p.congelado) {
    p.congelado = false;
    log(est, `❄️ ${p.nombre} está congelado y se salta el turno.`);
    return pasarA(est, id);
  }
  est.turno = { jugadorId: id };
  return null;
}

function pasarA(est, desdeId) {
  est.turno = null;
  if (comprobarFin(est)) return;
  const lista = est.jugadores;
  let idx = lista.findIndex((j) => j.id === desdeId);
  for (let k = 0; k < lista.length; k++) {
    idx = (idx + 1) % lista.length;
    const j = lista[idx];
    if (!j.fuera && !j.eliminado && j.mano.length) { empezarTurno(est, j.id); return; }
  }
}

function comprobarFin(est) {
  if (est.fase === 'fin') return true;
  const quedan = enJuego(est);
  if (quedan.length > 1) return false;
  est.fase = 'fin'; est.turno = null;
  // clasificación: quienes terminaron (en orden), luego quien se quedó con cartas, y los eliminados al final
  const resto = est.jugadores.filter((j) => !est.terminados.includes(j.id) && !j.eliminado && !j.fuera).sort((a, b) => a.mano.length - b.mano.length);
  const elim = est.jugadores.filter((j) => j.eliminado || j.fuera);
  const orden = [...est.terminados.map((id) => jug(est, id)), ...resto, ...elim];
  est.fin = {
    tabla: orden.map((j, i) => ({ id: j.id, nombre: j.nombre, puesto: i + 1, cartas: j.mano.length, eliminado: j.eliminado, fuera: j.fuera, puntos: !j.eliminado && !j.fuera ? (AJUSTES.puntos[i] || 0) : 0 })),
    ganadorId: orden[0]?.id ?? null
  };
  log(est, `🏁 Fin de la partida: gana ${orden[0]?.nombre}.`);
  return true;
}

function perderVida(est, p, motivo) {
  if (p.escudo) { p.escudo = false; log(est, `🛡️ El escudo de ${p.nombre} le salva de perder una vida (${motivo}).`); return; }
  p.vidas -= 1;
  if (p.vidas <= 0) {
    p.eliminado = true;
    log(est, `💀 ${p.nombre} pierde su última vida (${motivo}) y queda eliminado. Sus números salen del juego: ${p.mano.join(', ') || 'ninguno'}.`);
    p.mano = [];
  } else log(est, `💔 ${p.nombre} pierde una vida (${motivo}).`);
}

// Al terminar un turno sin soltar número: si tenías el que tocaba, cuenta como «retener»
function finTurnoSinSoltar(est, p, sig) {
  if (!p.eliminado && sig != null && p.mano.includes(sig)) {
    p.pases += 1;
    if (p.pases >= AJUSTES.pasesPenaliza) {
      p.pases = 0;
      perderVida(est, p, `retuvo el ${sig} dos turnos seguidos`);
    }
  } else p.pases = 0;
  pasarA(est, p.id);
}

function delTurno(est, id) {
  if (est.fase !== 'juego') return err('La partida ha terminado.');
  if (!est.turno || est.turno.jugadorId !== id) return err('No es tu turno.');
  return null;
}

// ---------------------------------------------------------------- Acciones
export function soltar(est, id, numero) {
  const e = delTurno(est, id); if (e) return e;
  const p = jug(est, id);
  const n = Number(numero);
  if (!p.mano.includes(n)) return err('Ese número no está en tu mano.');
  const sig = siguienteNumero(est);
  p.mano = p.mano.filter((x) => x !== n);
  if (n === sig) {
    est.tablero.push({ n, por: id, ok: true });
    est.ultimo = n;
    p.pases = 0;
    log(est, `✅ ${p.nombre} coloca el ${n}.`, { tipo: 'ok' });
  } else {
    // el número equivocado vuelve a su mano (si no, fallar te acercaría a ganar)
    p.mano = ordenar([...p.mano, n]);
    est.tablero.push({ n, por: id, ok: false });
    log(est, `❌ ${p.nombre} intenta soltar el ${n}, pero tocaba un número más bajo. El ${n} vuelve a su mano.`, { tipo: 'mal' });
    perderVida(est, p, 'número equivocado');
  }
  if (!p.eliminado && p.mano.length === 0 && !est.terminados.includes(id)) {
    est.terminados.push(id);
    log(est, `🎉 ¡${p.nombre} se queda sin números! Queda en el puesto ${est.terminados.length}.`);
  }
  pasarA(est, id);
  return ok({ correcto: n === sig });
}

export function pasar(est, id) {
  const e = delTurno(est, id); if (e) return e;
  const p = jug(est, id);
  const sig = siguienteNumero(est);
  log(est, `⏭️ ${p.nombre} pasa.`);
  finTurnoSinSoltar(est, p, sig);
  return ok();
}

/** Usar una carta de acción: sale una al azar. */
export function usarAccion(est, id) {
  const e = delTurno(est, id); if (e) return e;
  const p = jug(est, id);
  if (p.acciones <= 0) return err('Ya no te quedan cartas de acción.');
  p.acciones -= 1;
  const tipo = BOLSA[Math.floor(est.rng() * BOLSA.length)];
  const A = ACCIONES[tipo];
  const sig = siguienteNumero(est);
  const rivales = est.jugadores.filter((q) => q.id !== id && !q.fuera && !q.eliminado && q.mano.length);
  let secreto = null;
  const siguiente = () => {
    const lista = est.jugadores; let idx = lista.findIndex((j) => j.id === id);
    for (let k = 0; k < lista.length; k++) { idx = (idx + 1) % lista.length; const j = lista[idx]; if (!j.fuera && !j.eliminado && j.mano.length) return j; }
    return null;
  };
  switch (tipo) {
    case 'chivato': {
      const bajo = p.mano[0];
      secreto = bajo === sig ? `Tu ${bajo} ES el siguiente número. ¡Suéltalo!` : `Tu ${bajo} todavía NO es el siguiente: hay alguno más bajo.`;
      break;
    }
    case 'radar': {
      const bajo = p.mano[0];
      const cuantos = rivales.reduce((a, q) => a + q.mano.filter((x) => x < bajo).length, 0);
      secreto = `Hay ${cuantos} número${cuantos === 1 ? '' : 's'} de los demás por debajo de tu ${bajo}.`;
      break;
    }
    case 'escudo': p.escudo = true; secreto = 'Tu próximo fallo no te quitará vida.'; break;
    case 'encasquetar': {
      const v = siguiente();
      if (v && v.id !== id && p.mano.length > 1) {
        const alto = p.mano[p.mano.length - 1];
        p.mano = p.mano.filter((x) => x !== alto); v.mano = ordenar([...v.mano, alto]);
        secreto = `Le has dado tu ${alto} a ${v.nombre}.`;
      } else secreto = 'No había a quién dárselo (o solo te queda un número).';
      break;
    }
    case 'quemar':
      if (p.mano.length > 1) { const alto = p.mano.pop(); secreto = `Tu ${alto} sale del juego.`; } else secreto = 'Solo te queda un número: no se quema.';
      break;
    case 'espia': {
      const v = rivales[Math.floor(est.rng() * rivales.length)];
      secreto = v ? `El número más bajo de ${v.nombre} es el ${v.mano[0]}.` : 'No hay nadie a quien espiar.';
      break;
    }
    case 'congelar': { const v = siguiente(); if (v && v.id !== id) { v.congelado = true; secreto = `${v.nombre} se saltará su próximo turno.`; } break; }
    case 'ruleta': {
      const v = rivales[Math.floor(est.rng() * rivales.length)];
      if (v) {
        const mio = p.mano[Math.floor(est.rng() * p.mano.length)];
        const suyo = v.mano[Math.floor(est.rng() * v.mano.length)];
        p.mano = ordenar([...p.mano.filter((x) => x !== mio), suyo]);
        v.mano = ordenar([...v.mano.filter((x) => x !== suyo), mio]);
        secreto = `Cambias tu ${mio} por el ${suyo} de ${v.nombre}.`;
      }
      break;
    }
    case 'carga': {
      const k = est.mazo.findIndex((x) => x > est.ultimo);
      if (k >= 0) { const nuevo = est.mazo.splice(k, 1)[0]; p.mano = ordenar([...p.mano, nuevo]); secreto = `Robas el ${nuevo}.`; }
      break;
    }
    case 'apagon':
      if (p.acciones > 0) { p.acciones -= 1; secreto = 'Pierdes otra carta de acción.'; } else secreto = 'No te quedaban más cartas de acción que perder.';
      break;
    default: break;
  }
  log(est, `${A.e} ${p.nombre} usa una carta de acción: ${A.nombre}.`, { tipo: A.tipo });
  p.privado.push({ n: est.nlog, texto: `${A.e} ${A.nombre}: ${secreto || A.desc}` });
  if (p.privado.length > 10) p.privado.shift();
  // usar una acción no es soltar número: cuenta para la retención
  finTurnoSinSoltar(est, p, sig);
  return ok({ accion: tipo, secreto });
}

// ---------------------------------------------------------------- Ausencias
export function forzar(est) {
  if (est.fase !== 'juego' || !est.turno) return false;
  const p = jug(est, est.turno.jugadorId);
  log(est, `${p.nombre} no respondía: pasa turno.`);
  finTurnoSinSoltar(est, p, siguienteNumero(est));
  return true;
}

export function abandonar(est, id) {
  const p = jug(est, id);
  if (!p || p.fuera || est.fase !== 'juego') return;
  p.fuera = true; p.mano = [];
  log(est, `${p.nombre} abandona la partida.`);
  if (est.turno?.jugadorId === id) pasarA(est, id);
  else comprobarFin(est);
}

// ---------------------------------------------------------------- Vista
export function vistaDe(est, id) {
  const yo = jug(est, id);
  const fin = est.fase === 'fin';
  return {
    fase: est.fase, ultimo: est.ultimo, tablero: est.tablero.slice(-12),
    quedan: est.jugadores.reduce((a, j) => a + (j.eliminado || j.fuera ? 0 : j.mano.length), 0),
    turno: est.turno ? { jugadorId: est.turno.jugadorId } : null,
    jugadores: est.jugadores.map((j) => ({
      id: j.id, nombre: j.nombre, nCartas: j.mano.length, vidas: j.vidas, acciones: j.acciones, congelado: j.congelado,
      eliminado: j.eliminado, fuera: j.fuera, terminado: est.terminados.indexOf(j.id) + 1 || null,
      mano: fin ? j.mano : undefined
    })),
    yo: yo ? { id: yo.id, mano: yo.mano, vidas: yo.vidas, acciones: yo.acciones, escudo: yo.escudo, privado: yo.privado.slice(-5) } : null,
    log: est.log.slice(-25),
    fin: est.fin
  };
}
