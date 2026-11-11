// server/laberinto/engine.js
// Motor puro de «El Laberinto». Lo usan las salas online (server/routes/laberinto.js) y, copiado al cliente con
// `npm run sync:laberinto`, el modo «un solo dispositivo».
//
// Tablero de 7×7 habitaciones que se descubren al entrar. En el centro está el CORAZÓN DEL LABERINTO (el tesoro
// principal); las salidas son las cuatro esquinas. Gana quien saque el Corazón por una salida. Por turnos, cada
// jugador mueve (3 pasos; la Exploradora, 4; con el Corazón, uno menos) y puede hacer UNA acción: robar a un rival
// que esté en su sala, dejar un cepo, poner una barricada, teletransportarse (Mago) o proponer un pacto.
// Hay trampas, tesoros, llaves para las puertas cerradas, pociones, mapas y caminos alternativos.

export const AJUSTES = { lado: 7, min: 2, max: 4, rondasMax: 30, segTurno: 75, maxObjetos: 4, rondasPacto: 3, rondasBarricada: 3, recargaTeleporte: 3, rondasEscudo: 2 };
export const PERSONAJES = {
  guerrera: { nombre: 'La Guerrera', e: '🛡️', vidas: 4, pasos: 3, desc: 'Rompe las puertas cerradas sin llave y suma +2 al robar y al defenderse.' },
  ladron: { nombre: 'El Ladrón', e: '🗝️', vidas: 3, pasos: 3, desc: 'Sus robos siempre salen bien, ve las trampas de las salas vecinas y salta las barricadas.' },
  exploradora: { nombre: 'La Exploradora', e: '🧭', vidas: 3, pasos: 4, desc: '4 pasos por turno y entrar en una sala nueva no la detiene.' },
  mago: { nombre: 'El Mago', e: '🔮', vidas: 3, pasos: 3, desc: `Puede teletransportarse a cualquier sala descubierta (cada ${3} turnos) y ve qué hay en las salas vecinas sin descubrir.` }
};
export const CONTENIDO = {
  vacia: { nombre: 'Sala vacía', e: '' },
  corazon: { nombre: 'El Corazón del Laberinto', e: '💎' },
  tesoro: { nombre: 'Tesoro', e: '💰' },
  trampa: { nombre: 'Trampa', e: '🕳️' },
  llave: { nombre: 'Llave', e: '🔑' },
  pocion: { nombre: 'Poción', e: '🧪' },
  mapa: { nombre: 'Mapa', e: '📜' },
  cepo: { nombre: 'Cepo', e: '🪤' },
  barricada: { nombre: 'Barricada', e: '🚧' },
  salida: { nombre: 'Salida', e: '🚪' }
};
const REPARTO = { tesoro: 9, trampa: 7, llave: 5, pocion: 3, mapa: 3, cepo: 3, barricada: 3 };
const DIRS = { N: [-1, 0], S: [1, 0], E: [0, 1], O: [0, -1] };

// ---------------------------------------------------------------- Tablero
const L = AJUSTES.lado;
const idDe = (f, c) => f * L + c;
const fc = (id) => [Math.floor(id / L), id % L];
const clavePaso = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
export const ESQUINAS = [idDe(0, 0), idDe(0, L - 1), idDe(L - 1, L - 1), idDe(L - 1, 0)];
const CENTRO = idDe(3, 3);
export function vecinos(id) {
  const [f, c] = fc(id);
  return Object.entries(DIRS).map(([d, [df, dc]]) => ({ d, f: f + df, c: c + dc })).filter((x) => x.f >= 0 && x.f < L && x.c >= 0 && x.c < L).map((x) => ({ dir: x.d, id: idDe(x.f, x.c) }));
}
const barajar = (a, rng) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const k = Math.floor(rng() * (i + 1)); [b[i], b[k]] = [b[k], b[i]]; } return b; };

/** Laberinto perfecto (DFS) + atajos + algunas puertas cerradas. pasos: { 'a-b': 'paso' | 'puerta' } (sin clave = pared). */
export function crearTablero(rng = Math.random) {
  const pasos = {};
  const visto = new Set([0]);
  const pila = [0];
  while (pila.length) {
    const a = pila[pila.length - 1];
    const libres = barajar(vecinos(a).filter((v) => !visto.has(v.id)), rng);
    if (!libres.length) { pila.pop(); continue; }
    const b = libres[0].id;
    pasos[clavePaso(a, b)] = 'paso';
    visto.add(b);
    pila.push(b);
  }
  // Caminos alternativos: se abren paredes al azar
  for (let id = 0; id < L * L; id++) vecinos(id).forEach((v) => { if (v.id > id && !pasos[clavePaso(id, v.id)] && rng() < 0.22) pasos[clavePaso(id, v.id)] = 'paso'; });
  // Puertas cerradas (nunca junto a las salidas ni en la sala del Corazón: hay que poder empezar)
  Object.keys(pasos).forEach((k) => {
    const [a, b] = k.split('-').map(Number);
    if ([a, b].some((x) => ESQUINAS.includes(x))) return;
    if (rng() < 0.13) pasos[k] = 'puerta';
  });
  // El Corazón siempre tiene al menos una entrada sin puerta
  const alCentro = vecinos(CENTRO).map((v) => clavePaso(CENTRO, v.id)).filter((k) => pasos[k]);
  if (!alCentro.some((k) => pasos[k] === 'paso')) pasos[alCentro[0]] = 'paso';
  // Contenido
  const salas = Array.from({ length: L * L }, (_, id) => ({ id, contenido: 'vacia', oro: 0, descubierta: false }));
  ESQUINAS.forEach((id) => { salas[id].contenido = 'salida'; salas[id].descubierta = true; });
  salas[CENTRO].contenido = 'corazon';
  const libres = barajar(salas.filter((s) => s.contenido === 'vacia' && !ESQUINAS.some((e) => vecinos(e).some((v) => v.id === s.id))), rng);
  let k = 0;
  Object.entries(REPARTO).forEach(([tipo, n]) => { for (let i = 0; i < n && k < libres.length; i++) { const s = libres[k++]; s.contenido = tipo; if (tipo === 'tesoro') s.oro = 1 + Math.floor(rng() * 3); } });
  return { pasos, salas };
}

// ---------------------------------------------------------------- Partida
const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);
const nombre = (p, id) => jug(p, id)?.nombre ?? '¿?';
const enPacto = (p, a, b) => a !== b && p.pactos.some((x) => x.entre.includes(a) && x.entre.includes(b));
const azar = (p) => (typeof p.rng === 'function' ? p.rng() : Math.random());

function anotar(p, texto, tipo = 'info', privado = null) {
  p.nlog += 1;
  p.log.push({ n: p.nlog, texto, tipo, privado });
  if (p.log.length > 80) p.log.shift();
}

/** jugadores: [{ id, nombre, personaje? }] · reglas: { rondasMax } */
export function crearPartida(jugadores, reglas = {}, ahora = Date.now(), rng = Math.random) {
  const { pasos, salas } = crearTablero(rng);
  const n = jugadores.length;
  const esquinas = n === 2 ? [ESQUINAS[0], ESQUINAS[2]] : ESQUINAS;
  // Personajes: se respeta la elección de cada uno si no está repetida; el resto, al azar entre los que quedan
  const asignados = [];
  jugadores.forEach((j) => { asignados.push(PERSONAJES[j.personaje] && !asignados.includes(j.personaje) ? j.personaje : null); });
  const quedan = barajar(Object.keys(PERSONAJES).filter((x) => !asignados.includes(x)), rng);
  for (let i = 0; i < n; i++) if (!asignados[i]) asignados[i] = quedan.shift();
  const p = {
    pasos, salas, ronda: 1, rondasMax: Number(reglas.rondasMax) || AJUSTES.rondasMax,
    jugadores: jugadores.map((j, i) => ({
      id: j.id, nombre: j.nombre, personaje: asignados[i], sala: esquinas[i], inicio: esquinas[i], vidas: PERSONAJES[asignados[i]].vidas, oro: 0,
      llaves: 0, objetos: [], corazon: false, recarga: 0, escudo: 0, fuera: false
    })),
    turnoIdx: 0, turno: null, cepos: [], barricadas: [], pactos: [], propuestas: [], nprop: 0,
    log: [], nlog: 0, fin: null, fase: 'jugando', hasta: null
  };
  Object.defineProperty(p, 'rng', { value: rng, enumerable: false, writable: true });
  empezarTurno(p, ahora);
  return p;
}

function empezarTurno(p, ahora) {
  const j = p.jugadores[p.turnoIdx];
  const base = PERSONAJES[j.personaje].pasos - (j.corazon ? 1 : 0);
  p.turno = { jugadorId: j.id, pasos: base, accion: true, movido: false };
  p.hasta = ahora + AJUSTES.segTurno * 1000;
  if (j.recarga > 0) j.recarga -= 1;
  if (j.escudo > 0) j.escudo -= 1;
}

function finTurno(p, ahora) {
  if (p.fase !== 'jugando') return;
  // Siguiente jugador (los que abandonan no juegan)
  let vueltas = 0;
  do {
    p.turnoIdx = (p.turnoIdx + 1) % p.jugadores.length;
    if (p.turnoIdx === 0) {
      p.ronda += 1;
      p.pactos.forEach((x) => { x.quedan -= 1; });
      p.pactos = p.pactos.filter((x) => x.quedan > 0);
      p.barricadas.forEach((x) => { x.quedan -= 1; });
      p.barricadas = p.barricadas.filter((x) => x.quedan > 0);
      if (p.ronda > p.rondasMax) { finalizar(p, null); return; }
    }
    vueltas += 1;
  } while (p.jugadores[p.turnoIdx].fuera && vueltas < 10);
  empezarTurno(p, ahora);
}

const delTurno = (p, id) => (p.fase !== 'jugando' ? 'La partida ha terminado.' : p.turno?.jugadorId !== id ? 'No es tu turno.' : null);

/** ¿Se puede pasar de `a` a `b`? Devuelve null si se puede o el motivo si no. */
function bloqueo(p, j, a, b) {
  const t = p.pasos[clavePaso(a, b)];
  if (!t) return 'Hay una pared.';
  const bar = p.barricadas.find((x) => x.paso === clavePaso(a, b));
  if (bar && bar.de !== j.id && !enPacto(p, bar.de, j.id) && j.personaje !== 'ladron') return `Hay una barricada de ${nombre(p, bar.de)}.`;
  if (t === 'puerta' && j.personaje !== 'guerrera' && j.llaves <= 0) return 'La puerta está cerrada: necesitas una llave.';
  return null;
}

/** Moverse a una sala vecina (gasta un paso). */
export function mover(p, id, destino, ahora = Date.now()) {
  const e = delTurno(p, id); if (e) return { ok: false, error: e };
  const j = jug(p, id);
  const b = Number(destino);
  if (!vecinos(j.sala).some((v) => v.id === b)) return { ok: false, error: 'Solo puedes ir a una sala vecina.' };
  if (p.turno.pasos <= 0) return { ok: false, error: 'No te quedan pasos este turno.' };
  const motivo = bloqueo(p, j, j.sala, b);
  if (motivo) return { ok: false, error: motivo };
  const k = clavePaso(j.sala, b);
  if (p.pasos[k] === 'puerta') {
    if (j.personaje === 'guerrera') anotar(p, `🛡️ ${j.nombre} derriba una puerta cerrada.`);
    else { j.llaves -= 1; anotar(p, `🔑 ${j.nombre} abre una puerta con una llave.`); }
    p.pasos[k] = 'paso';
  }
  j.sala = b;
  p.turno.pasos -= 1;
  p.turno.movido = true;
  const s = p.salas[b];
  const nueva = !s.descubierta;
  if (nueva) { s.descubierta = true; anotar(p, `${j.nombre} descubre una sala nueva${s.contenido !== 'vacia' ? `: ${CONTENIDO[s.contenido].e} ${CONTENIDO[s.contenido].nombre.toLowerCase()}` : ''}.`); }
  const r = entrar(p, j, s, ahora);
  if (r === 'fin') return { ok: true, fin: true };
  if (r === 'caido' || r === 'atrapado') { finTurno(p, ahora); return { ok: true, [r]: true }; }
  // Entrar en una sala nueva detiene (salvo a la Exploradora)
  if (nueva && j.personaje !== 'exploradora') p.turno.pasos = 0;
  return { ok: true };
}

function herir(p, j, cuanto, motivo, ahora) {
  j.vidas -= cuanto;
  anotar(p, `💥 ${j.nombre} ${motivo} (−${cuanto} vida${cuanto > 1 ? 's' : ''}).`, 'malo');
  if (j.vidas > 0) return false;
  // Aturdido: suelta el Corazón y la mitad del oro, y vuelve a su entrada
  const s = p.salas[j.sala];
  if (j.corazon) { j.corazon = false; s.contenido = 'corazon'; anotar(p, `💎 ¡${j.nombre} suelta el Corazón del Laberinto!`, 'malo'); }
  const suelta = Math.floor(j.oro / 2);
  if (suelta) { j.oro -= suelta; if (s.contenido === 'vacia') s.contenido = 'tesoro'; s.oro += suelta; }
  j.sala = j.inicio;
  j.vidas = PERSONAJES[j.personaje].vidas;
  anotar(p, `😵 ${j.nombre} cae aturdido y despierta en su entrada${suelta ? ` (pierde ${suelta} de oro)` : ''}.`, 'malo');
  void ahora;
  return true;
}

/** Lo que pasa al entrar en una sala. */
function entrar(p, j, s, ahora) {
  // Cepos de rivales
  const cepo = p.cepos.find((c) => c.sala === s.id && c.de !== j.id && !enPacto(p, c.de, j.id));
  if (cepo) {
    p.cepos = p.cepos.filter((c) => c !== cepo);
    anotar(p, `🪤 ¡${j.nombre} cae en un cepo de ${nombre(p, cepo.de)}!`, 'malo');
    if (herir(p, j, 1, 'queda atrapado en el cepo', ahora)) return 'caido';
    p.turno.pasos = 0;
    return 'atrapado';
  }
  switch (s.contenido) {
    case 'trampa':
      s.contenido = 'vacia';
      if (herir(p, j, 1, 'cae en una trampa', ahora)) return 'caido';
      p.turno.pasos = 0;
      return 'atrapado';
    case 'tesoro':
      j.oro += s.oro; anotar(p, `💰 ${j.nombre} coge ${s.oro} de oro.`, 'bueno'); s.oro = 0; s.contenido = 'vacia'; break;
    case 'llave': j.llaves += 1; s.contenido = 'vacia'; anotar(p, `🔑 ${j.nombre} encuentra una llave.`, 'bueno'); break;
    case 'pocion': {
      const max = PERSONAJES[j.personaje].vidas;
      if (j.vidas < max) { j.vidas += 1; anotar(p, `🧪 ${j.nombre} se bebe una poción (+1 vida).`, 'bueno'); s.contenido = 'vacia'; }
      break;
    }
    case 'mapa': {
      const [f, c] = fc(s.id);
      for (let df = -2; df <= 2; df++) for (let dc = -2; dc <= 2; dc++) { const ff = f + df; const cc = c + dc; if (ff >= 0 && ff < L && cc >= 0 && cc < L && Math.abs(df) + Math.abs(dc) <= 2) p.salas[idDe(ff, cc)].descubierta = true; }
      s.contenido = 'vacia';
      anotar(p, `📜 ${j.nombre} lee un mapa: se descubren las salas de alrededor.`, 'bueno');
      break;
    }
    case 'cepo': case 'barricada':
      if (j.objetos.length < AJUSTES.maxObjetos) {
        const o = s.contenido;
        j.objetos.push(o); s.contenido = 'vacia';
        anotar(p, `${CONTENIDO[o].e} ${j.nombre} recoge ${o === 'barricada' ? 'una barricada' : 'un cepo'}.`, 'bueno');
      }
      break;
    case 'corazon':
      j.corazon = true; s.contenido = 'vacia';
      p.turno.pasos = Math.max(0, p.turno.pasos - 1);
      anotar(p, `💎 ¡${j.nombre} coge el Corazón del Laberinto! Ahora tiene que salir por una esquina.`, 'bueno');
      break;
    default: break;
  }
  if (j.corazon && ESQUINAS.includes(s.id)) { finalizar(p, j.id); return 'fin'; }
  return null;
}

/** Robar a un rival que esté en tu sala: el Corazón si lo lleva o hasta 3 de oro. */
export function robar(p, id, victimaId, ahora = Date.now()) {
  const e = delTurno(p, id); if (e) return { ok: false, error: e };
  if (!p.turno.accion) return { ok: false, error: 'Ya has hecho tu acción este turno.' };
  const j = jug(p, id); const v = jug(p, Number(victimaId));
  if (!v || v.id === id || v.fuera || v.sala !== j.sala) return { ok: false, error: 'Solo puedes robar a alguien de tu sala.' };
  if (enPacto(p, id, v.id)) return { ok: false, error: `Tienes un pacto con ${v.nombre}.` };
  if (!v.corazon && !v.oro) return { ok: false, error: `${v.nombre} no lleva nada.` };
  // Quien acaba de robar el Corazón está protegido un tiempo: así puede huir y no se lo quitan de vuelta
  if (v.escudo > 0) return { ok: false, error: `${v.nombre} está protegido 🛡️ ${v.escudo === 1 ? 'hasta que acabe su turno' : 'durante 2 rondas'}: acaba de robar el Corazón.` };
  p.turno.accion = false;
  const fuerza = (x) => x.vidas + (x.personaje === 'guerrera' ? 2 : 0);
  const sale = j.personaje === 'ladron' || fuerza(j) >= fuerza(v);
  if (!sale) {
    anotar(p, `👊 ${j.nombre} intenta robar a ${v.nombre}, pero sale mal parado.`, 'malo');
    if (herir(p, j, 1, 'se lleva un golpe', ahora)) finTurno(p, ahora);
    return { ok: true, exito: false };
  }
  if (v.corazon) {
    v.corazon = false; j.corazon = true;
    j.escudo = AJUSTES.rondasEscudo;
    p.turno.pasos = Math.max(0, p.turno.pasos - 1);
    anotar(p, `🦹 ¡${j.nombre} le roba el Corazón del Laberinto a ${v.nombre}! Nadie podrá robarle durante ${AJUSTES.rondasEscudo} rondas 🛡️.`, 'malo');
    if (ESQUINAS.includes(j.sala)) finalizar(p, j.id);
  } else {
    const q = Math.min(3, v.oro); v.oro -= q; j.oro += q;
    anotar(p, `🦹 ${j.nombre} le roba ${q} de oro a ${v.nombre}.`, 'malo');
  }
  return { ok: true, exito: true };
}

/** Dejar un cepo (invisible para los rivales) en tu sala. */
export function ponerCepo(p, id) {
  const e = delTurno(p, id); if (e) return { ok: false, error: e };
  const j = jug(p, id);
  if (!p.turno.accion) return { ok: false, error: 'Ya has hecho tu acción este turno.' };
  const k = j.objetos.indexOf('cepo');
  if (k === -1) return { ok: false, error: 'No llevas ningún cepo.' };
  if (ESQUINAS.includes(j.sala)) return { ok: false, error: 'En las salidas no se pueden dejar cepos.' };
  j.objetos.splice(k, 1);
  p.cepos.push({ sala: j.sala, de: id });
  p.turno.accion = false;
  anotar(p, `🪤 ${j.nombre} deja algo escondido en una sala…`, 'info');
  return { ok: true };
}

/** Bloquear uno de los pasos de tu sala durante unas rondas. */
export function barricada(p, id, destino) {
  const e = delTurno(p, id); if (e) return { ok: false, error: e };
  const j = jug(p, id);
  if (!p.turno.accion) return { ok: false, error: 'Ya has hecho tu acción este turno.' };
  const k = j.objetos.indexOf('barricada');
  if (k === -1) return { ok: false, error: 'No llevas ninguna barricada.' };
  const paso = clavePaso(j.sala, Number(destino));
  if (!vecinos(j.sala).some((v) => v.id === Number(destino)) || !p.pasos[paso]) return { ok: false, error: 'Elige un pasillo de tu sala.' };
  if (p.barricadas.some((x) => x.paso === paso)) return { ok: false, error: 'Ese pasillo ya está bloqueado.' };
  j.objetos.splice(k, 1);
  p.barricadas.push({ paso, de: id, quedan: AJUSTES.rondasBarricada });
  p.turno.accion = false;
  anotar(p, `🚧 ${j.nombre} bloquea un pasillo durante ${AJUSTES.rondasBarricada} rondas.`, 'info');
  return { ok: true };
}

/** Mago: aparecer en cualquier sala descubierta. */
export function teletransporte(p, id, destino, ahora = Date.now()) {
  const e = delTurno(p, id); if (e) return { ok: false, error: e };
  const j = jug(p, id);
  if (j.personaje !== 'mago') return { ok: false, error: 'Solo el Mago se teletransporta.' };
  if (!p.turno.accion) return { ok: false, error: 'Ya has hecho tu acción este turno.' };
  if (j.recarga > 0) return { ok: false, error: `Aún te faltan ${j.recarga} turnos para volver a hacerlo.` };
  const s = p.salas[Number(destino)];
  if (!s?.descubierta || s.id === j.sala) return { ok: false, error: 'Elige una sala descubierta.' };
  if (j.corazon) return { ok: false, error: 'Con el Corazón encima la magia no funciona.' };
  if (p.jugadores.some((x) => x.id !== id && !x.fuera && x.sala === s.id)) return { ok: false, error: 'No puedes aparecer en una sala donde hay alguien.' };
  j.sala = s.id;
  j.recarga = AJUSTES.recargaTeleporte;
  p.turno.accion = false;
  p.turno.pasos = 0;
  anotar(p, `🔮 ${j.nombre} se teletransporta.`);
  const r = entrar(p, j, s, ahora);
  if (r === 'caido' || r === 'atrapado') finTurno(p, ahora);
  return { ok: true };
}

/** Pacto temporal: ni robos, ni cepos, ni barricadas entre vosotros durante unas rondas. */
export function proponerPacto(p, id, aQuien) {
  if (p.fase !== 'jugando') return { ok: false, error: 'La partida ha terminado.' };
  const otro = jug(p, Number(aQuien));
  if (!otro || otro.id === id || otro.fuera) return { ok: false, error: 'Elige a otro jugador.' };
  if (enPacto(p, id, otro.id)) return { ok: false, error: 'Ya tenéis un pacto.' };
  if (p.propuestas.some((x) => x.de === id && x.a === otro.id)) return { ok: false, error: 'Ya se lo has propuesto.' };
  p.nprop += 1;
  p.propuestas.push({ id: p.nprop, de: id, a: otro.id });
  anotar(p, `🤝 ${nombre(p, id)} propone un pacto a ${otro.nombre}.`);
  return { ok: true };
}
export function responderPacto(p, id, propuestaId, acepta) {
  const x = p.propuestas.find((y) => y.id === Number(propuestaId));
  if (!x || x.a !== id) return { ok: false, error: 'Esa propuesta no es para ti.' };
  p.propuestas = p.propuestas.filter((y) => y !== x);
  if (acepta) {
    p.pactos.push({ entre: [x.de, x.a], quedan: AJUSTES.rondasPacto });
    anotar(p, `🤝 Pacto entre ${nombre(p, x.de)} y ${nombre(p, x.a)} durante ${AJUSTES.rondasPacto} rondas.`, 'bueno');
  } else anotar(p, `${nombre(p, id)} rechaza el pacto de ${nombre(p, x.de)}.`);
  return { ok: true };
}

export function terminarTurno(p, id, ahora = Date.now()) {
  const e = delTurno(p, id); if (e) return { ok: false, error: e };
  finTurno(p, ahora);
  return { ok: true };
}

export function tick(p, ahora = Date.now()) {
  if (p.fase !== 'jugando' || !p.hasta || ahora < p.hasta) return false;
  anotar(p, `⏰ Se acaba el turno de ${nombre(p, p.turno.jugadorId)}.`);
  finTurno(p, ahora);
  return true;
}

function finalizar(p, ganadorId) {
  p.fase = 'fin';
  p.hasta = null;
  const puntos = (j) => j.oro + (j.corazon ? 5 : 0);
  const tabla = [...p.jugadores].sort((a, b) => (b.id === ganadorId) - (a.id === ganadorId) || (a.fuera - b.fuera) || puntos(b) - puntos(a))
    .map((j) => ({ id: j.id, nombre: j.nombre, personaje: j.personaje, oro: j.oro, corazon: j.corazon, fuera: j.fuera, puntos: puntos(j) }));
  let ganadores = ganadorId != null ? [ganadorId] : [];
  if (ganadorId == null) {
    const max = Math.max(...activos(p).map(puntos));
    ganadores = activos(p).filter((j) => puntos(j) === max).map((j) => j.id);
  }
  p.fin = { ganadores, escapado: ganadorId, tabla };
  anotar(p, ganadorId != null ? `🏆 ¡${nombre(p, ganadorId)} escapa con el Corazón del Laberinto!` : '⌛ Se acabó el tiempo: gana quien más oro tiene.', 'bueno');
}

export function terminar(p) {
  if (p.fase === 'fin') return { ok: false, error: 'La partida ya ha terminado.' };
  finalizar(p, null);
  return { ok: true };
}

export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id);
  if (!j || j.fuera || p.fase === 'fin') return;
  j.fuera = true;
  if (j.corazon) { j.corazon = false; p.salas[j.sala].contenido = 'corazon'; }
  anotar(p, `🚪 ${j.nombre} abandona el laberinto.`, 'malo');
  if (activos(p).length < 2) { finalizar(p, activos(p)[0]?.id ?? null); return; }
  if (p.turno?.jugadorId === id) finTurno(p, ahora);
}

/** Pasos posibles desde la sala del jugador (para el cliente). */
function opciones(p, j) {
  return vecinos(j.sala).map((v) => ({ id: v.id, dir: v.dir, motivo: bloqueo(p, j, j.sala, v.id), puerta: p.pasos[clavePaso(j.sala, v.id)] === 'puerta' })).filter((o) => p.pasos[clavePaso(j.sala, o.id)]);
}

export function vistaDe(p, id) {
  const yo = jug(p, id);
  const fin = p.fase === 'fin';
  // Lo que «sabe» cada uno: el Ladrón ve trampas vecinas; el Mago, el contenido de salas vecinas sin descubrir
  const pistas = {};
  if (yo && !fin) {
    vecinos(yo.sala).forEach((v) => {
      const s = p.salas[v.id];
      if (yo.personaje === 'ladron' && (s.contenido === 'trampa' || p.cepos.some((c) => c.sala === v.id && c.de !== id))) pistas[v.id] = '🕳️';
      if (yo.personaje === 'mago' && !s.descubierta) pistas[v.id] = CONTENIDO[s.contenido].e || '·';
    });
  }
  return {
    fase: p.fase, ronda: p.ronda, rondasMax: p.rondasMax, lado: L, esquinas: ESQUINAS, hasta: p.hasta,
    pasos: Object.entries(p.pasos).map(([k, t]) => {
      const [a, b] = k.split('-').map(Number);
      // Solo se ven los pasillos que tocan alguna sala descubierta
      return (fin || p.salas[a].descubierta || p.salas[b].descubierta) ? { a, b, t, barricada: p.barricadas.some((x) => x.paso === k) } : null;
    }).filter(Boolean),
    salas: p.salas.map((s) => (fin || s.descubierta ? { id: s.id, descubierta: true, contenido: s.contenido, oro: s.oro } : { id: s.id, descubierta: false })),
    turno: p.turno ? { jugadorId: p.turno.jugadorId, pasos: p.turno.pasos, accion: p.turno.accion } : null,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, personaje: j.personaje, sala: j.sala, inicio: j.inicio, vidas: j.vidas, oro: j.oro, llaves: j.llaves, corazon: j.corazon, escudo: j.escudo, fuera: j.fuera, nObjetos: j.objetos.length })),
    yo: yo ? {
      id: yo.id, objetos: [...yo.objetos], recarga: yo.recarga, opciones: p.turno?.jugadorId === id ? opciones(p, yo) : [],
      misCepos: p.cepos.filter((c) => c.de === id).map((c) => c.sala), pistas,
      propuestas: p.propuestas.filter((x) => x.a === id)
    } : null,
    pactos: p.pactos.map((x) => ({ ...x })),
    log: p.log.filter((l) => !l.privado || l.privado === id).slice(-25),
    fin: p.fin
  };
}
