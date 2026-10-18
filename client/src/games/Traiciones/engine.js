// server/traiciones/engine.js
// Motor puro de «Traiciones» v2: TIEMPO REAL continuo (sin noches ni rondas).
// Se usa desde server/routes/traiciones.js y desde la simulación (scripts/traiciones-sim.mjs).
// Todas las funciones reciben `ahora` (ms) para poder simular el tiempo sin esperar.
//
// IDEA: una caravana acampa en un oasis lejano. Los viajeros se mueven por el campamento (siete lugares
// conectados), hacen tareas y solo ven a quien está en SU mismo lugar, en directo. La partida no se detiene
// hasta que alguien reporta un cuerpo o toca la campana. Los traidores eliminan a quien se quede a solas
// con ellos (con tiempo de espera entre muertes) y sabotean para dispersar a los viajeros.

// ---------------------------------------------------------------- Datos
const SALAS_BASE = [
  { id: 'hoguera', nombre: 'La Hoguera', icono: 'flame', tarea: 'Avivar el fuego', vecinos: ['pozo', 'establo', 'bazar', 'carreta'], pos: [50, 48] },
  { id: 'pozo', nombre: 'El Pozo', icono: 'well', tarea: 'Sacar agua del pozo', vecinos: ['hoguera', 'atalaya'], pos: [17, 24] },
  { id: 'atalaya', nombre: 'La Atalaya', icono: 'tower', tarea: null, vecinos: ['pozo', 'establo'], pos: [50, 8] },
  { id: 'establo', nombre: 'El Establo', icono: 'stable', tarea: 'Dar de beber a los camellos', vecinos: ['hoguera', 'atalaya'], pos: [83, 24] },
  { id: 'carreta', nombre: 'La Carreta', icono: 'cart', tarea: 'Reparar la carreta', vecinos: ['hoguera', 'tienda'], pos: [17, 74] },
  { id: 'bazar', nombre: 'El Bazar', icono: 'box', tarea: 'Hacer trueque de provisiones', vecinos: ['hoguera', 'tienda'], pos: [83, 74] },
  { id: 'tienda', nombre: 'La Tienda', icono: 'tag', tarea: 'Contar las provisiones', vecinos: ['carreta', 'bazar'], pos: [50, 92] }
];
// Conexiones simétricas
export const SALAS = SALAS_BASE.map((s) => ({ ...s, vecinos: [...new Set([...s.vecinos, ...SALAS_BASE.filter((o) => o.vecinos.includes(s.id)).map((o) => o.id)])] }));
export const SALA = Object.fromEntries(SALAS.map((s) => [s.id, s]));
export const SALAS_TAREA = SALAS.filter((s) => s.tarea).map((s) => s.id);

export const ROLES = {
  viajero: { nombre: 'Viajero', equipo: 'leales', tarea: true, desc: 'Completa tus tareas repartidas por el campamento. Fíjate en quién ves, dónde y cuándo: si alguien desaparece, puede que lo hayan eliminado.' },
  vigia: { nombre: 'Vigía', equipo: 'leales', tarea: true, desc: 'Eres un viajero con vista de águila. Una vez por partida puedes ojear en directo cualquier lugar del campamento durante unos segundos.' },
  protegido: { nombre: 'Protegido', equipo: 'leales', tarea: true, desc: 'Tu amuleto te salva del primer ataque de un traidor y te chiva quién fue. Después, ya no te protege.' },
  traidor: { nombre: 'Traidor', equipo: 'traidores', tarea: false, desc: 'Finge hacer tareas. Elimina a quien se quede a solas contigo y sabotea el campamento para dispersar y distraer a los viajeros. Que nadie te pille.' },
  bufon: { nombre: 'Bufón', equipo: 'neutral', tarea: false, desc: 'Ni leal ni traidor: ganas tú solo si la caravana te expulsa en una votación. Haz que sospechen de ti… pero sin pasarte.' }
};

export const CONFIG_DEFECTO = { rolesEspeciales: true, segDebate: 90 };
export const OPCIONES_DEBATE = [0, 45, 90, 120, 180]; // 0 = hasta que todos estén listos

// Constantes de equilibrio (ms) — se calibran con scripts/traiciones-sim.mjs
export const AJUSTES = {
  traidores: [[4, 1], [8, 2], [11, 3]],
  tareasPorJugador: 14,
  tareaMs: 10000,
  apagarMs: 4000,
  viajeMs: 5000,
  primerMatarMs: 25000,
  matarEnfriaMs: 22000,
  trasAsambleaMatarMs: 20000,
  primerSabotajeMs: 30000,
  sabotajeEnfriaMs: 40000,
  tormentaMs: 25000,
  incendioMs: 45000,
  campanaEsperaMs: 30000,
  ojeoMs: 12000,
  votoMs: 40000,
  veredictoMs: 10000,
  chatMaxCaracteres: 140,
  chatEsperaMs: 700
};

export const numTraidores = (n) => AJUSTES.traidores.reduce((t, [min, c]) => (n >= min ? c : t), 1);

// ---------------------------------------------------------------- Utilidades
const barajar = (arr, rng) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const jug = (est, id) => est.jugadores.find((j) => j.id === id);
const vivos = (est) => est.jugadores.filter((j) => j.vivo);
const esTraidor = (j) => j.rol === 'traidor';
const equipoDe = (j) => ROLES[j.rol].equipo;
const tormentaActiva = (est, t) => !!est.tormentaHasta && t < est.tormentaHasta;
const ok = () => ({ ok: true });
const err = (error) => ({ ok: false, error });

export function repartirRoles(n, cfg, rng) {
  const roles = [];
  for (let i = 0; i < numTraidores(n); i++) roles.push('traidor');
  if (cfg.rolesEspeciales) {
    if (n >= 5) roles.push('vigia');
    if (n >= 6) roles.push('protegido');
    if (n >= 7) roles.push('bufon');
  }
  while (roles.length < n) roles.push('viajero');
  return barajar(roles, rng);
}

// ---------------------------------------------------------------- Crear partida
export function crearPartida(jugadores, config = {}, { rng = Math.random } = {}) {
  const cfg = { ...CONFIG_DEFECTO, ...config };
  const roles = repartirRoles(jugadores.length, cfg, rng);
  const js = jugadores.map((j, i) => {
    // varias tareas por jugador; los lugares pueden repetirse (cada lugar se recorre en tandas barajadas)
    let salas = [];
    while (salas.length < AJUSTES.tareasPorJugador) salas = salas.concat(barajar(SALAS_TAREA, rng));
    salas = salas.slice(0, AJUSTES.tareasPorJugador);
    return {
      id: j.id, nombre: j.nombre, rol: roles[i], vivo: true, causa: null, abandono: false,
      sala: 'hoguera', mov: null, trabajo: null,
      tareas: salas.map((s) => ({ sala: s, hecha: false })),
      campanas: 1, matarListo: 0, asesinatos: 0, ojeoUsado: false, ojeo: null,
      feed: [], avisos: [], ultimoChat: 0
    };
  });
  return {
    rng, config: cfg, jugadores: js, fase: 'roles', limite: null, listos: {},
    cuerpos: [], tormentaHasta: 0, incendio: null, sabotajeListo: 0, campanaListaEn: 0, amuletoUsado: false,
    asamblea: null, votos: {}, veredicto: null, registro: [], reveladas: {}, fin: null, inicio: null
  };
}

export function progreso(est) {
  let hechas = 0, total = 0;
  est.jugadores.forEach((j) => {
    if (!ROLES[j.rol].tarea || j.abandono) return;
    total += j.tareas.length;
    hechas += j.tareas.filter((t) => t.hecha).length;
  });
  return { hechas, total };
}

// ---------------------------------------------------------------- Roles vistos → empieza el juego
export function confirmarRol(est, id, ahora) {
  if (est.fase !== 'roles') return err('Ahora no toca.');
  if (!jug(est, id)) return err('Jugador desconocido.');
  est.listos[id] = true;
  reevaluar(est, ahora);
  return ok();
}

function empezarJuego(est, ahora) {
  est.fase = 'juego'; est.limite = null; est.listos = {}; est.inicio = ahora;
  est.sabotajeListo = ahora + AJUSTES.primerSabotajeMs;
  est.campanaListaEn = ahora + AJUSTES.campanaEsperaMs;
  est.jugadores.forEach((j) => { if (esTraidor(j)) j.matarListo = ahora + AJUSTES.primerMatarMs; });
}

// ---------------------------------------------------------------- Movimiento y feed
function avisarSala(est, sala, evento) {
  est.jugadores.forEach((q) => {
    if (!q.vivo || q.mov || q.sala !== sala || q.id === evento.id) return;
    q.feed.push(evento);
    if (q.feed.length > 10) q.feed.shift();
  });
}
const aviso = (j, t, tipo, x) => { j.avisos.push({ t, tipo, x }); if (j.avisos.length > 8) j.avisos.shift(); };

export function mover(est, id, destino, ahora) {
  tick(est, ahora);
  const p = jug(est, id);
  if (est.fase !== 'juego') return err('Ahora no puedes moverte.');
  if (!p || p.abandono) return err('No puedes actuar.');
  if (p.mov) return err('Ya estás de camino.');
  if (!SALA[p.sala].vecinos.includes(destino)) return err('Desde aquí no se llega directamente.');
  cancelarTrabajo(p);
  if (p.vivo) avisarSala(est, p.sala, { t: ahora, tipo: 'sale', id: p.id, anon: tormentaActiva(est, ahora) });
  p.mov = { destino, llegaEn: ahora + AJUSTES.viajeMs, origen: p.sala };
  p.sala = null;
  return ok();
}

function llegar(est, p, t) {
  p.sala = p.mov.destino; p.mov = null;
  if (p.vivo) avisarSala(est, p.sala, { t, tipo: 'llega', id: p.id, anon: tormentaActiva(est, t) });
}

const cancelarTrabajo = (p) => { p.trabajo = null; };

// ---------------------------------------------------------------- Tareas y fuego
export function trabajar(est, id, ahora) {
  tick(est, ahora);
  const p = jug(est, id);
  if (est.fase !== 'juego') return err('Ahora no toca.');
  if (!p || p.abandono || p.mov) return err('No puedes hacerlo ahora.');
  if (p.trabajo) return err('Ya estás trabajando.');
  if (est.incendio) return err('¡Hay un incendio! Hasta que se apague no se puede trabajar.');
  const idx = p.tareas.findIndex((t) => !t.hecha && t.sala === p.sala);
  if (idx === -1) return err('No tienes tareas pendientes aquí.');
  p.trabajo = { tipo: 'tarea', ref: idx, sala: p.sala, finEn: ahora + AJUSTES.tareaMs };
  return ok();
}

export function apagar(est, id, ahora) {
  tick(est, ahora);
  const p = jug(est, id);
  if (est.fase !== 'juego' || !est.incendio) return err('No hay ningún incendio.');
  if (!p || !p.vivo || p.mov) return err('No puedes hacerlo ahora.');
  if (est.incendio.salas[p.sala] !== false) return err('Aquí no hay fuego que apagar.');
  if (p.trabajo) return err('Ya estás trabajando.');
  p.trabajo = { tipo: 'fuego', ref: p.sala, sala: p.sala, finEn: ahora + AJUSTES.apagarMs };
  return ok();
}

function completarTrabajo(est, p, t) {
  const w = p.trabajo; p.trabajo = null;
  if (w.tipo === 'tarea') {
    p.tareas[w.ref].hecha = true;
    aviso(p, t, 'ok', `Has completado: ${SALA[w.sala].tarea}.`);
    const fin = comprobarFin(est);
    if (fin) terminar(est, fin);
  } else if (w.tipo === 'fuego' && est.incendio) {
    est.incendio.salas[w.ref] = true;
    if (Object.values(est.incendio.salas).every(Boolean)) {
      est.incendio = null;
      est.sabotajeListo = Math.max(est.sabotajeListo, t + AJUSTES.sabotajeEnfriaMs);
    }
  }
}

// ---------------------------------------------------------------- Traidores
export function opcionesTraidor(est, id, ahora) {
  const p = jug(est, id);
  const vacio = { puedeMatar: false, objetivo: null, esperaMatar: 0, esperaSabotaje: 0, sabotaje: false };
  if (!p || !p.vivo || !esTraidor(p) || est.fase !== 'juego') return vacio;
  const esperaMatar = Math.max(0, p.matarListo - ahora);
  const esperaSabotaje = Math.max(0, est.sabotajeListo - ahora);
  let objetivo = null;
  if (!p.mov) {
    const otros = est.jugadores.filter((q) => q.vivo && !q.mov && q.sala === p.sala && q.id !== id && !esTraidor(q));
    if (otros.length === 1) objetivo = otros[0].id;
  }
  return {
    puedeMatar: objetivo !== null && esperaMatar === 0,
    objetivo, esperaMatar, esperaSabotaje,
    sabotaje: esperaSabotaje === 0 && !est.incendio
  };
}

export function matar(est, id, objetivoId, ahora) {
  tick(est, ahora);
  const p = jug(est, id);
  if (est.fase !== 'juego') return err('Ahora no toca.');
  const op = opcionesTraidor(est, id, ahora);
  if (!op.puedeMatar || op.objetivo !== objetivoId) return err('No puedes eliminar a nadie ahora.');
  const v = jug(est, objetivoId);
  cancelarTrabajo(p);
  p.matarListo = ahora + AJUSTES.matarEnfriaMs;
  if (v.rol === 'protegido' && !est.amuletoUsado) {
    est.amuletoUsado = true;
    aviso(v, ahora, 'alerta', `¡Tu amuleto brilla! ${p.nombre} intentó eliminarte. Es un traidor… y el amuleto ya se ha gastado.`);
    aviso(p, ahora, 'alerta', `Tu ataque a ${v.nombre} ha fallado: llevaba un amuleto. Ahora sabe quién eres.`);
    return ok();
  }
  v.vivo = false; v.causa = 'asesinado'; cancelarTrabajo(v);
  p.asesinatos += 1;
  est.cuerpos.push({ id: v.id, sala: v.sala });
  aviso(p, ahora, 'secreto', `Has eliminado a ${v.nombre}.`);
  aviso(v, ahora, 'alerta', 'Te han eliminado. Eres un espíritu: puedes seguir con tus tareas, pero no puedes hablar con los vivos.');
  const fin = comprobarFin(est);
  if (fin) terminar(est, fin);
  return ok();
}

export function sabotear(est, id, tipo, ahora) {
  tick(est, ahora);
  const p = jug(est, id);
  if (est.fase !== 'juego') return err('Ahora no toca.');
  if (!p || !p.vivo || !esTraidor(p)) return err('Solo los traidores sabotean.');
  const op = opcionesTraidor(est, id, ahora);
  if (!op.sabotaje) return err('El sabotaje aún no está listo.');
  if (tipo === 'tormenta') {
    est.tormentaHasta = ahora + AJUSTES.tormentaMs;
  } else if (tipo === 'incendio') {
    const salas = barajar(SALAS.map((s) => s.id), est.rng).slice(0, 2);
    est.incendio = { hasta: ahora + AJUSTES.incendioMs, salas: Object.fromEntries(salas.map((s) => [s, false])) };
    est.jugadores.forEach((q) => { if (q.trabajo?.tipo === 'tarea') cancelarTrabajo(q); });
  } else return err('Sabotaje desconocido.');
  est.sabotajeListo = ahora + AJUSTES.sabotajeEnfriaMs;
  return ok();
}

export function ojear(est, id, sala, ahora) {
  tick(est, ahora);
  const p = jug(est, id);
  if (est.fase !== 'juego') return err('Ahora no toca.');
  if (!p || !p.vivo || p.rol !== 'vigia' || p.ojeoUsado) return err('No puedes ojear.');
  if (!SALA[sala]) return err('Lugar desconocido.');
  p.ojeoUsado = true;
  p.ojeo = { sala, hasta: ahora + AJUSTES.ojeoMs };
  return ok();
}

// ---------------------------------------------------------------- Asambleas
export function reportar(est, id, ahora) {
  tick(est, ahora);
  const p = jug(est, id);
  if (est.fase !== 'juego') return err('Ahora no toca.');
  if (!p || !p.vivo || p.mov) return err('No puedes hacerlo ahora.');
  const c = est.cuerpos.find((x) => x.sala === p.sala);
  if (!c) return err('Aquí no hay ningún cuerpo.');
  iniciarAsamblea(est, { motivo: 'cuerpo', por: id, cuerpo: { id: c.id, sala: c.sala } }, ahora);
  return ok();
}

export function campana(est, id, ahora) {
  tick(est, ahora);
  const p = jug(est, id);
  if (est.fase !== 'juego') return err('Ahora no toca.');
  if (!p || !p.vivo) return err('No puedes hacerlo ahora.');
  if (p.campanas <= 0) return err('Ya has usado tu campana.');
  if (est.incendio) return err('No se puede tocar la campana durante un incendio.');
  if (ahora < est.campanaListaEn) return err('La campana aún no está disponible.');
  p.campanas -= 1;
  iniciarAsamblea(est, { motivo: 'campana', por: id, cuerpo: null }, ahora);
  return ok();
}

function setFase(est, fase, ahora, ms = 0) {
  est.fase = fase; est.listos = {};
  est.limite = ms > 0 ? ahora + ms : null;
}

function iniciarAsamblea(est, { motivo, por, cuerpo }, ahora) {
  est.jugadores.forEach((j) => { j.trabajo = null; j.mov = null; j.sala = 'hoguera'; j.ojeo = null; });
  est.incendio = null; est.tormentaHasta = 0;
  est.cuerpos = [];
  est.asamblea = { motivo, por, cuerpo, chat: [], contador: 0 };
  est.votos = {}; est.veredicto = null;
  setFase(est, 'asamblea', ahora, est.config.segDebate * 1000);
}

export function chat(est, id, texto, ahora) {
  tick(est, ahora);
  const p = jug(est, id);
  if (est.fase !== 'asamblea' && est.fase !== 'votacion') return err('Ahora no se puede hablar.');
  if (!p || !p.vivo) return err('Los espíritus no pueden hablar.');
  const t = String(texto || '').trim().slice(0, AJUSTES.chatMaxCaracteres);
  if (!t) return err('Mensaje vacío.');
  if (ahora - p.ultimoChat < AJUSTES.chatEsperaMs) return err('Vas muy deprisa.');
  p.ultimoChat = ahora;
  est.asamblea.contador += 1;
  est.asamblea.chat.push({ n: est.asamblea.contador, id, texto: t });
  if (est.asamblea.chat.length > 80) est.asamblea.chat.shift();
  return ok();
}

export function listoVotar(est, id, ahora) {
  tick(est, ahora);
  const p = jug(est, id);
  if (est.fase !== 'asamblea') return err('Ahora no toca.');
  if (!p || !p.vivo) return err('No puedes actuar.');
  est.listos[id] = true;
  reevaluar(est, ahora);
  return ok();
}

export function votar(est, id, objetivo, ahora) {
  tick(est, ahora);
  const p = jug(est, id);
  if (est.fase !== 'votacion') return err('Ahora no se vota.');
  if (!p || !p.vivo) return err('No puedes votar.');
  if (objetivo === null || objetivo === undefined) est.votos[id] = 'skip';
  else {
    const o = jug(est, objetivo);
    if (!o || !o.vivo || o.id === id) return err('Voto no válido.');
    est.votos[id] = objetivo;
  }
  reevaluar(est, ahora);
  return ok();
}

function resolverVotos(est, ahora) {
  const cuenta = {}; let saltos = 0; const publicos = {};
  vivos(est).forEach((j) => {
    const v = est.votos[j.id] ?? 'skip';
    publicos[j.id] = v === 'skip' ? null : v;
    if (v === 'skip') saltos += 1; else cuenta[v] = (cuenta[v] || 0) + 1;
  });
  const orden = Object.entries(cuenta).sort((a, b) => b[1] - a[1]);
  let expulsadoId = null;
  if (orden.length && (orden.length === 1 || orden[0][1] > orden[1][1]) && orden[0][1] > saltos) expulsadoId = Number(orden[0][0]);
  est.veredicto = { votos: publicos, cuenta, saltos, expulsadoId };
  if (expulsadoId !== null) {
    const e = jug(est, expulsadoId);
    e.vivo = false; e.causa = 'expulsado'; cancelarTrabajo(e);
    est.reveladas[expulsadoId] = true;
    est.veredicto.rol = e.rol;
  }
  est.registro.push({ tipo: 'asamblea', motivo: est.asamblea.motivo, por: est.asamblea.por, expulsadoId, rol: est.veredicto.rol || null });
  if (expulsadoId !== null && jug(est, expulsadoId).rol === 'bufon') return terminar(est, { ganador: 'bufon', motivo: 'bufon' });
  const fin = comprobarFin(est);
  if (fin) return terminar(est, fin);
  setFase(est, 'veredicto', ahora, AJUSTES.veredictoMs);
}

export function continuar(est, id, ahora) {
  tick(est, ahora);
  const p = jug(est, id);
  if (est.fase !== 'veredicto') return err('Ahora no toca.');
  if (!p || !p.vivo) return err('No puedes actuar.');
  est.listos[id] = true;
  reevaluar(est, ahora);
  return ok();
}

function volverAlJuego(est, ahora) {
  setFase(est, 'juego', ahora, 0);
  est.jugadores.forEach((j) => {
    j.sala = 'hoguera'; j.mov = null; j.trabajo = null; j.feed = [];
    if (esTraidor(j)) j.matarListo = ahora + AJUSTES.trasAsambleaMatarMs;
  });
  est.sabotajeListo = ahora + AJUSTES.sabotajeEnfriaMs;
  est.campanaListaEn = ahora + AJUSTES.campanaEsperaMs;
  est.asamblea = null;
}

// ---------------------------------------------------------------- Final
export function comprobarFin(est) {
  const { hechas, total } = progreso(est);
  if (total > 0 && hechas >= total) return { ganador: 'leales', motivo: 'tareas' };
  const v = vivos(est);
  const t = v.filter(esTraidor).length;
  if (t === 0) return { ganador: 'leales', motivo: 'traidores_fuera' };
  if (t >= v.length - t) return { ganador: 'traidores', motivo: 'mayoria' };
  return null;
}

export function calcularPuntos(est, ganador) {
  const p = {};
  est.jugadores.forEach((j) => {
    let pts = 0;
    if (ganador === 'leales' && equipoDe(j) === 'leales') pts = 3 + (j.vivo ? 1 : 0);
    if (ganador === 'traidores' && esTraidor(j)) pts = 5 + j.asesinatos;
    if (ganador === 'bufon' && j.rol === 'bufon') pts = 7;
    p[j.id] = pts;
  });
  return p;
}

function terminar(est, { ganador, motivo }) {
  if (est.fase === 'fin') return;
  est.fase = 'fin'; est.limite = null;
  est.fin = { ganador, motivo, puntos: calcularPuntos(est, ganador) };
}

// ---------------------------------------------------------------- Reloj
function faltantes(est) {
  const v = vivos(est);
  if (est.fase === 'roles') return est.jugadores.filter((j) => !j.abandono && !est.listos[j.id]);
  if (est.fase === 'asamblea' || est.fase === 'veredicto') return v.filter((j) => !est.listos[j.id]);
  if (est.fase === 'votacion') return v.filter((j) => est.votos[j.id] === undefined);
  return [];
}

function avanzarFase(est, ahora) {
  if (est.fase === 'roles') empezarJuego(est, ahora);
  else if (est.fase === 'asamblea') { setFase(est, 'votacion', ahora, AJUSTES.votoMs); est.votos = {}; }
  else if (est.fase === 'votacion') resolverVotos(est, ahora);
  else if (est.fase === 'veredicto') volverAlJuego(est, ahora);
}

export function reevaluar(est, ahora) {
  if (est.fase === 'fin' || est.fase === 'juego') return;
  if (faltantes(est).length === 0) avanzarFase(est, ahora);
}

// Procesa todo lo que ha ocurrido hasta `ahora` (llegadas, tareas terminadas, sabotajes, temporizadores)
export function tick(est, ahora) {
  if (est.fase === 'fin') return;
  if (est.fase === 'juego') {
    // eventos con hora propia, en orden
    for (let guard = 0; guard < 500 && est.fase === 'juego'; guard++) {
      let sig = null;
      est.jugadores.forEach((p) => {
        if (p.mov && p.mov.llegaEn <= ahora && (!sig || p.mov.llegaEn < sig.t)) sig = { t: p.mov.llegaEn, tipo: 'llega', p };
        if (p.trabajo && p.trabajo.finEn <= ahora && (!sig || p.trabajo.finEn < sig.t)) sig = { t: p.trabajo.finEn, tipo: 'trabajo', p };
      });
      if (est.incendio && est.incendio.hasta <= ahora && (!sig || est.incendio.hasta < sig.t)) sig = { t: est.incendio.hasta, tipo: 'incendio' };
      if (!sig) break;
      if (sig.tipo === 'llega') llegar(est, sig.p, sig.t);
      else if (sig.tipo === 'trabajo') completarTrabajo(est, sig.p, sig.t);
      else terminar(est, { ganador: 'traidores', motivo: 'incendio' });
    }
    return;
  }
  if (est.limite && ahora >= est.limite) { avanzarFase(est, ahora); }
}

export function forzar(est, ahora) {
  tick(est, ahora);
  if (est.fase === 'juego' || est.fase === 'fin') return false;
  avanzarFase(est, ahora);
  return true;
}

export function abandonar(est, id, ahora) {
  tick(est, ahora);
  const p = jug(est, id);
  if (!p || est.fase === 'fin' || p.abandono) return;
  p.abandono = true; p.vivo = false; p.causa = 'abandono'; p.trabajo = null; p.mov = null;
  est.reveladas[id] = true;
  delete est.votos[id]; delete est.listos[id];
  const fin = comprobarFin(est);
  if (fin) return terminar(est, fin);
  reevaluar(est, ahora);
}

export const quienFalta = (est) => faltantes(est);

// ---------------------------------------------------------------- Vista de un jugador (lo único que se envía al cliente)
const nombreDe = (est, id) => jug(est, id)?.nombre ?? '?';

export function vistaDe(est, id, ahora) {
  tick(est, ahora);
  const yo = jug(est, id);
  const fase = est.fase;
  const fin = fase === 'fin';
  const fantasma = !yo.vivo && !fin;
  const rolInfo = ROLES[yo.rol];
  const pr = progreso(est);
  const revelaVivos = fase !== 'juego' && fase !== 'roles';

  const v = {
    fase, limite: est.limite, ahora, progreso: pr,
    yo: {
      id: yo.id, nombre: yo.nombre, rol: yo.rol, rolNombre: rolInfo.nombre, equipo: rolInfo.equipo, desc: rolInfo.desc,
      vivo: yo.vivo, campanas: yo.campanas,
      aliados: yo.rol === 'traidor' ? est.jugadores.filter((j) => esTraidor(j) && j.id !== id).map((j) => ({ id: j.id, nombre: j.nombre, vivo: j.vivo })) : [],
      amuleto: yo.rol === 'protegido' ? !est.amuletoUsado : null,
      ojeoUsado: yo.rol === 'vigia' ? yo.ojeoUsado : null
    },
    jugadores: est.jugadores.map((j) => ({
      id: j.id, nombre: j.nombre,
      vivo: revelaVivos || fantasma || fin ? j.vivo : true,
      causa: revelaVivos || fantasma || fin ? j.causa : null,
      rol: fin || est.reveladas[j.id] ? j.rol : null
    })),
    listo: !!est.listos[id],
    faltan: faltantes(est).map((j) => j.nombre),
    registro: est.registro.map((r) => ({ ...r, nombre: r.expulsadoId != null ? nombreDe(est, r.expulsadoId) : null, pornombre: nombreDe(est, r.por) }))
  };

  if (fase === 'juego') {
    const tormenta = tormentaActiva(est, ahora);
    v.yo.sala = yo.sala;
    v.yo.mov = yo.mov ? { destino: yo.mov.destino, llegaEn: yo.mov.llegaEn } : null;
    v.yo.trabajo = yo.trabajo ? { tipo: yo.trabajo.tipo, finEn: yo.trabajo.finEn, ref: yo.trabajo.ref } : null;
    v.yo.tareas = yo.tareas.map((t) => ({ sala: t.sala, texto: SALA[t.sala].tarea, hecha: t.hecha }));
    v.yo.tareasFalsas = !rolInfo.tarea;
    v.yo.campanaEn = Math.max(0, est.campanaListaEn - ahora);
    v.tormenta = tormenta ? { hasta: est.tormentaHasta } : null;
    v.incendio = est.incendio ? { hasta: est.incendio.hasta, salas: Object.entries(est.incendio.salas).map(([s, f]) => ({ id: s, nombre: SALA[s].nombre, apagado: f })) } : null;
    v.feed = yo.vivo ? yo.feed.slice(-8).map((e) => ({
      t: e.t, tipo: e.tipo,
      texto: `${e.anon ? 'Alguien' : nombreDe(est, e.id)} ${e.tipo === 'llega' ? 'ha llegado' : 'se ha ido'}`
    })) : [];
    v.avisos = yo.avisos.slice(-6);
    if (yo.sala) {
      const sala = SALA[yo.sala];
      const aqui = est.jugadores.filter((q) => q.id !== id && !q.mov && q.sala === yo.sala && (fantasma ? true : q.vivo));
      const oculta = tormenta && yo.vivo && !esTraidor(yo);
      v.sala = {
        id: sala.id, nombre: sala.nombre, icono: sala.icono, vecinos: sala.vecinos.map((s) => ({ id: s, nombre: SALA[s].nombre })),
        presentes: oculta ? [] : aqui.map((q) => ({ id: q.id, nombre: q.nombre, trabajando: !!q.trabajo, fantasma: !q.vivo })),
        anonimos: oculta ? aqui.length : 0,
        cuerpos: est.cuerpos.filter((c) => c.sala === yo.sala).map((c) => ({ id: c.id, nombre: nombreDe(est, c.id) })),
        fuego: est.incendio ? est.incendio.salas[yo.sala] === false : false,
        tarea: yo.tareas.find((t) => !t.hecha && t.sala === yo.sala) ? SALA[yo.sala].tarea : null
      };
      if (yo.sala === 'atalaya') {
        v.radar = {};
        SALAS.forEach((s) => { v.radar[s.id] = est.jugadores.filter((q) => q.vivo && !q.mov && q.sala === s.id).length; });
      }
    }
    if (yo.ojeo && yo.ojeo.hasta > ahora) {
      v.ojeo = { sala: yo.ojeo.sala, hasta: yo.ojeo.hasta, presentes: est.jugadores.filter((q) => q.vivo && !q.mov && q.sala === yo.ojeo.sala).map((q) => ({ id: q.id, nombre: q.nombre })) };
    }
    if (yo.rol === 'traidor' && yo.vivo) {
      const op = opcionesTraidor(est, id, ahora);
      v.opciones = { ...op, objetivoNombre: op.objetivo ? nombreDe(est, op.objetivo) : null };
    }
    if (fantasma) {
      v.espectro = est.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, rolNombre: ROLES[j.rol].nombre, equipo: ROLES[j.rol].equipo, vivo: j.vivo, sala: j.mov ? 'en camino' : j.sala ? SALA[j.sala].nombre : '—' }));
    }
  }

  if (fase === 'asamblea' || fase === 'votacion' || fase === 'veredicto') {
    const a = est.asamblea;
    v.asamblea = {
      motivo: a.motivo, por: nombreDe(est, a.por),
      cuerpo: a.cuerpo ? { nombre: nombreDe(est, a.cuerpo.id), sala: a.cuerpo.sala } : null,
      muertos: est.jugadores.filter((j) => !j.vivo && j.causa === 'asesinado').map((j) => j.nombre),
      chat: a.chat.slice(-60).map((m) => ({ n: m.n, id: m.id, nombre: nombreDe(est, m.id), texto: m.texto }))
    };
    if (fase === 'votacion') { const mv = est.votos[id]; v.miVoto = mv === undefined ? undefined : (mv === 'skip' ? null : mv); }
    if (fase === 'veredicto' && est.veredicto) v.veredicto = { ...est.veredicto, expulsado: est.veredicto.expulsadoId != null ? nombreDe(est, est.veredicto.expulsadoId) : null };
    if (fantasma) v.espectro = est.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, rolNombre: ROLES[j.rol].nombre, equipo: ROLES[j.rol].equipo, vivo: j.vivo, sala: '—' }));
  }

  if (fin) {
    v.fin = {
      ...est.fin,
      roles: est.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, rol: j.rol, rolNombre: ROLES[j.rol].nombre, vivo: j.vivo, causa: j.causa, asesinatos: j.asesinatos }))
    };
  }
  return v;
}
