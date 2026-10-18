// server/fundadores/engine.js
// Motor puro de «Fundadores» (sin red ni React). Lo usan:
//   - server/routes/fundadores.js (salas online)
//   - client/src/games/Fundadores/engine.js (modo un solo dispositivo)  <-- COPIA IDÉNTICA de este archivo
// Si cambias algo aquí:  npm run sync:fundadores  (en /server)
//
// IDEA: varios fundadores levantan juntos un mismo pueblo. Cada ronda todos eligen EN SECRETO un oficio;
// si dos eligen el mismo, gana quien tenga prioridad y el otro se queda de Peón. Los oficios actúan por
// orden (1 → 8) y cada uno altera la partida de una forma distinta. El pueblo se «inaugura» cuando entre
// todos se alcanza una meta común de obra; gana quien tenga más prestigio.

// ---------------------------------------------------------------- Datos
export const TIPOS = {
  hogar: { nombre: 'Hogar', icono: 'home', color: '#ea580c', pasivo: 'Cada 3 Hogares: +1 prestigio al final.' },
  comercio: { nombre: 'Comercio', icono: 'tag', color: '#0891b2', pasivo: 'Al cobrar jornal: +1 moneda por Comercio (máx. 2).' },
  taller: { nombre: 'Taller', icono: 'flame', color: '#64748b', pasivo: 'Cada 2 Talleres: tus edificios cuestan 1 menos (mín. 1).' },
  saber: { nombre: 'Saber', icono: 'book', color: '#db2777', pasivo: 'Cada 2 de Saber: ves 1 plano más al proyectar.' },
  hito: { nombre: 'Hito', icono: 'landmark', color: '#ca8a04', pasivo: 'Edificios únicos con efectos especiales.' }
};
export const TIPOS_BASE = ['hogar', 'comercio', 'taller', 'saber'];

// param: qué hay que indicar al usar la habilidad
export const ROLES = [
  { id: 1, nombre: 'Inspector', icono: 'search', param: 'rol', min: 2, max: 8,
    desc: 'Nombra un oficio (2–8). Quien lo tenga queda clausurado: no podrá usar su habilidad. Si alguien lo tenía, cobras 1 moneda.' },
  { id: 2, nombre: 'Contrabandista', icono: 'mask', param: 'rol', min: 3, max: 8,
    desc: 'Nombra un oficio (3–8). Cuando le toque actuar, su dueño te entrega 2 monedas (o las que tenga).' },
  { id: 3, nombre: 'Carpintero', icono: 'hardhat', param: null,
    desc: 'Este turno puedes construir hasta 2 edificios y cada uno cuesta 1 menos (mín. 1).' },
  { id: 4, nombre: 'Notario', icono: 'edit', param: 'jugador',
    desc: 'Mira la mano de otro jugador y quédate con una copia de uno de sus planos (él conserva el suyo).' },
  { id: 5, nombre: 'Gremial', icono: 'users', param: 'tipo',
    desc: 'Elige un tipo: cobras 1 moneda por cada edificio de ese tipo que tengas y el primero de ese tipo que construyas hoy cuesta 1 menos.' },
  { id: 6, nombre: 'Recaudador', icono: 'briefcase', param: null,
    desc: 'Cobras 1 moneda de cada jugador que tenga más monedas que tú.' },
  { id: 7, nombre: 'Reformista', icono: 'key', param: 'edificio',
    desc: 'Compra un edificio de otro jugador pagándole su coste +1. Pasa a tu pueblo (y el dueño se lleva las monedas).' },
  { id: 8, nombre: 'Aprendiz', icono: 'bulb', param: 'copiar',
    desc: 'Usa la habilidad de un oficio (3–7) que NADIE haya elegido esta ronda. Actúas el último.' }
];
export const ROL = Object.fromEntries(ROLES.map((r) => [r.id, r]));
export const PEON = { id: 0, nombre: 'Peón', icono: 'flag', desc: 'Sin habilidad: solo cobras/proyectas y construyes 1 edificio. Es lo que le toca a quien perdió un empate de oficio.' };
export const nombreRol = (id) => (id === 0 ? PEON.nombre : ROL[id].nombre);

export const HITOS = [
  { efecto: 'pozo', nombre: 'Pozo Dorado', coste: 5, prestigio: 5, texto: 'Al cobrar jornal, +1 moneda.' },
  { efecto: 'biblioteca', nombre: 'Biblioteca Mayor', coste: 5, prestigio: 5, texto: 'Al proyectar ves 1 plano más.' },
  { efecto: 'faro', nombre: 'El Faro', coste: 6, prestigio: 6, texto: 'Cuenta como el tipo que te falte para el bonus de Variedad.' },
  { efecto: 'mercado', nombre: 'Mercado Central', coste: 6, prestigio: 6, texto: 'El primer edificio que construyas cada turno cuesta 1 menos.' },
  { efecto: 'puerta', nombre: 'Puerta Fortificada', coste: 5, prestigio: 5, texto: 'Ni el Reformista ni el Notario pueden elegirte.' },
  { efecto: 'monumento', nombre: 'El Monumento', coste: 7, prestigio: 8, texto: 'Tus edificios aportan +1 de obra a la meta común (acercan el final).' }
];

const NOMBRES = {
  hogar: { 1: 'Choza', 2: 'Cabaña', 3: 'Casa de adobe', 4: 'Casona', 5: 'Mansión' },
  comercio: { 1: 'Puesto', 2: 'Tienda', 3: 'Taberna', 4: 'Bazar', 5: 'Gran Lonja' },
  taller: { 1: 'Alfarería', 2: 'Carpintería', 3: 'Telar', 4: 'Herrería', 5: 'Fundición' },
  saber: { 1: 'Escuela', 2: 'Botica', 3: 'Archivo', 4: 'Observatorio', 5: 'Academia' }
};
const COSTES = [1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5];

export function crearMazo() {
  const cartas = [];
  let n = 0;
  TIPOS_BASE.forEach((tipo) => {
    const costes = tipo === 'hogar' ? [...COSTES, 1, 2] : COSTES;
    costes.forEach((c) => cartas.push({ uid: ++n, nombre: NOMBRES[tipo][c], tipo, coste: c, prestigio: c }));
  });
  HITOS.forEach((h) => cartas.push({ uid: ++n, nombre: h.nombre, tipo: 'hito', coste: h.coste, prestigio: h.prestigio, efecto: h.efecto, texto: h.texto }));
  return cartas;
}

export const AJUSTES = {
  monedasIni: 3, planosIni: 3, jornal: 2, proyectar: 3,
  metaPorJugador: 17,
  rondasMax: 20,
  consuelo: 1, // moneda extra que recibe el Peón
  bonusVariedad: 3, bonusInauguracion: 3, hogaresPorBonus: 3,
  min: 3, max: 7
};

// ---------------------------------------------------------------- Utilidades
const barajar = (arr, rng) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const jug = (est, id) => est.jugadores.find((j) => j.id === id);
const activos = (est) => est.jugadores.filter((j) => !j.fuera);
const ok = () => ({ ok: true });
const err = (error) => ({ ok: false, error });
const cuenta = (j, tipo) => j.pueblo.filter((c) => c.tipo === tipo).length;
const tiene = (j, efecto) => j.pueblo.some((c) => c.efecto === efecto);
const log = (est, texto) => { est.log.push({ ronda: est.ronda, texto }); if (est.log.length > 80) est.log.shift(); };

function robar(est, n) {
  const sacadas = [];
  for (let i = 0; i < n; i++) {
    if (!est.mazo.length) { est.mazo = barajar(est.descarte, est.rng); est.descarte = []; }
    if (!est.mazo.length) break;
    sacadas.push(est.mazo.pop());
  }
  return sacadas;
}

// ---------------------------------------------------------------- Crear partida
export function crearPartida(jugadores, cfg = {}, { rng = Math.random } = {}) {
  const est = {
    rng, cfg, jugadores: [], mazo: barajar(crearMazo(), rng), descarte: [],
    ronda: 0, sello: Math.floor(rng() * jugadores.length), fase: 'elegir',
    elecciones: {}, asignados: {}, orden: [], paso: -1, turno: null,
    clausurado: null, contrabando: {}, reveladas: {}, ultimaRonda: null,
    progreso: 0, meta: AJUSTES.metaPorJugador * jugadores.length, inaugurador: null,
    log: [], fin: null
  };
  est.jugadores = jugadores.map((j) => ({ id: j.id, nombre: j.nombre, monedas: AJUSTES.monedasIni, mano: [], pueblo: [], fuera: false }));
  est.jugadores.forEach((j) => { j.mano = robar(est, AJUSTES.planosIni); });
  iniciarRonda(est);
  return est;
}

function iniciarRonda(est) {
  est.ronda += 1; est.fase = 'elegir'; est.elecciones = {}; est.asignados = {}; est.orden = []; est.paso = -1;
  est.turno = null; est.clausurado = null; est.contrabando = {}; est.reveladas = {};
  log(est, `— Ronda ${est.ronda}: ${est.jugadores[est.sello].nombre} tiene la prioridad —`);
}

// ---------------------------------------------------------------- Elegir oficio (secreto y simultáneo)
export function elegirRol(est, id, rol) {
  const p = jug(est, id);
  if (est.fase !== 'elegir') return err('Ahora no se eligen oficios.');
  if (!p || p.fuera) return err('No puedes actuar.');
  if (!ROL[rol]) return err('Oficio desconocido.');
  est.elecciones[id] = rol;
  if (activos(est).every((j) => est.elecciones[j.id])) resolverElecciones(est);
  return ok();
}

function resolverElecciones(est) {
  const n = est.jugadores.length;
  const prioridad = [];
  for (let k = 0; k < n; k++) { const j = est.jugadores[(est.sello + k) % n]; if (!j.fuera) prioridad.push(j); }
  const dueno = {}; const peones = [];
  prioridad.forEach((j) => {
    const r = est.elecciones[j.id];
    if (dueno[r] === undefined) { dueno[r] = j.id; est.asignados[j.id] = r; } else { peones.push(j.id); est.asignados[j.id] = 0; }
  });
  est.orden = ROLES.map((r) => ({ rol: r.id, jugadorId: dueno[r.id] ?? null }));
  peones.forEach((id) => est.orden.push({ rol: 0, jugadorId: id }));
  est.fase = 'turnos'; est.paso = -1;
  if (peones.length) log(est, `${peones.length} ${peones.length === 1 ? 'jugador perdió' : 'jugadores perdieron'} un empate de oficio y actuarán de Peón.`);
  log(est, 'Los oficios están repartidos. Se va llamando por orden…');
  siguienteTurno(est);
}

// ---------------------------------------------------------------- Turnos
function siguienteTurno(est) {
  for (;;) {
    est.paso += 1;
    if (est.paso >= est.orden.length) return finRonda(est);
    const e = est.orden[est.paso];
    const p = e.jugadorId ? jug(est, e.jugadorId) : null;
    if (!p || p.fuera) continue;
    empezarTurno(est, p, e.rol);
    return;
  }
}

function empezarTurno(est, p, rol) {
  est.reveladas[p.id] = rol;
  est.turno = {
    jugadorId: p.id, rol, basica: false, habilidadUsada: false, construidos: 0, maxConstruir: 1,
    bloqueada: est.clausurado === rol && rol !== 0, pendiente: null, descuentoRol: 0, gremial: null
  };
  log(est, `Turno del ${nombreRol(rol)}: ${p.nombre}.`);
  if (rol === 0) { p.monedas += AJUSTES.consuelo; log(est, `${p.nombre} recibe ${AJUSTES.consuelo} moneda de consuelo.`); }
  if (est.turno.bloqueada) log(est, `El ${nombreRol(rol)} está clausurado: no podrá usar su habilidad.`);
  const ladron = est.contrabando[rol];
  if (ladron) {
    const l = jug(est, ladron);
    const pago = Math.min(2, p.monedas);
    p.monedas -= pago;
    if (l && !l.fuera) { l.monedas += pago; log(est, `${p.nombre} paga ${pago} ${pago === 1 ? 'moneda' : 'monedas'} al Contrabandista (${l.nombre}).`); }
  }
}

function finRonda(est) {
  est.ultimaRonda = est.orden.filter((e) => e.jugadorId).map((e) => ({ rol: e.rol, jugadorId: e.jugadorId }));
  est.turno = null;
  if (est.inaugurador !== null) return terminar(est, 'inauguracion');
  if (activos(est).length < 2) return terminar(est, 'abandono');
  if (est.mazo.length + est.descarte.length === 0) { log(est, 'Ya no quedan planos en el pueblo: se acabó la obra.'); return terminar(est, 'sin_planos'); }
  if (est.ronda >= AJUSTES.rondasMax) { log(est, 'Se acabó el tiempo de obra.'); return terminar(est, 'tiempo'); }
  const n = est.jugadores.length;
  do { est.sello = (est.sello + 1) % n; } while (est.jugadores[est.sello].fuera);
  iniciarRonda(est);
}

// ---------------------------------------------------------------- Acción básica
function bonusJornal(p) {
  return AJUSTES.jornal + Math.min(2, cuenta(p, 'comercio')) + (tiene(p, 'pozo') ? 1 : 0);
}
const proyectarN = (p) => AJUSTES.proyectar + Math.floor(cuenta(p, 'saber') / 2) + (tiene(p, 'biblioteca') ? 1 : 0);

function esActivo(est, id) { return est.fase === 'turnos' && est.turno && est.turno.jugadorId === id; }

export function basica(est, id, tipo) {
  if (!esActivo(est, id)) return err('No es tu turno.');
  const t = est.turno; const p = jug(est, id);
  if (t.basica || t.pendiente) return err('Ya has hecho tu acción básica.');
  if (tipo === 'jornal') {
    const g = bonusJornal(p);
    p.monedas += g; t.basica = true;
    log(est, `${p.nombre} cobra jornal (+${g}).`);
  } else if (tipo === 'proyectar') {
    const cartas = robar(est, proyectarN(p));
    if (!cartas.length) { p.monedas += AJUSTES.jornal; t.basica = true; log(est, `${p.nombre} no encuentra planos y cobra jornal.`); return ok(); }
    t.pendiente = { tipo: 'proyectar', cartas };
    log(est, `${p.nombre} proyecta nuevos planos.`);
  } else return err('Acción desconocida.');
  return ok();
}

export function elegirPendiente(est, id, uid) {
  if (!esActivo(est, id)) return err('No es tu turno.');
  const t = est.turno; const p = jug(est, id);
  if (!t.pendiente) return err('No hay nada que elegir.');
  const c = t.pendiente.cartas.find((x) => x.uid === uid);
  if (!c) return err('Plano no válido.');
  if (t.pendiente.tipo === 'proyectar') {
    p.mano.push(c);
    est.descarte.push(...t.pendiente.cartas.filter((x) => x.uid !== uid));
    t.basica = true;
    log(est, `${p.nombre} se queda con un plano.`);
  } else { // notario
    const copia = { ...c, uid: 1000 + Math.floor(est.rng() * 1e9) };
    p.mano.push(copia);
    log(est, `${p.nombre} copia un plano de la mano de ${jug(est, t.pendiente.objetivo).nombre}.`);
  }
  t.pendiente = null;
  return ok();
}

// ---------------------------------------------------------------- Habilidades
export function libresParaAprendiz(est) {
  const tomados = new Set(Object.values(est.asignados).filter((r) => r > 0));
  return ROLES.filter((r) => r.id >= 3 && r.id <= 7 && !tomados.has(r.id)).map((r) => r.id);
}

export function habilidad(est, id, params = {}) {
  if (!esActivo(est, id)) return err('No es tu turno.');
  const t = est.turno; const p = jug(est, id);
  if (t.rol === 0) return err('El Peón no tiene habilidad.');
  if (t.bloqueada) return err('Tu oficio está clausurado.');
  if (t.habilidadUsada) return err('Ya has usado tu habilidad.');
  if (t.pendiente) return err('Termina primero de elegir.');
  let rolEf = t.rol;
  if (t.rol === 8) {
    rolEf = Number(params.copiar);
    if (!libresParaAprendiz(est).includes(rolEf)) return err('Ese oficio no está libre.');
  }
  const r = aplicar(est, p, rolEf, params, t.rol === 8);
  if (!r.ok) return r;
  t.habilidadUsada = true;
  return ok();
}

function aplicar(est, p, rol, prm, copiado) {
  const t = est.turno;
  const quien = copiado ? `${p.nombre} (Aprendiz, como ${nombreRol(rol)})` : `${p.nombre} (${nombreRol(rol)})`;
  switch (rol) {
    case 1: {
      const x = Number(prm.rolObjetivo);
      if (!(x >= 2 && x <= 8)) return err('Elige un oficio del 2 al 8.');
      est.clausurado = x;
      const objetivo = est.orden.find((e) => e.rol === x)?.jugadorId;
      if (objetivo) { p.monedas += 1; }
      log(est, `${quien} clausura al ${nombreRol(x)}.`);
      return ok();
    }
    case 2: {
      const x = Number(prm.rolObjetivo);
      if (!(x >= 3 && x <= 8)) return err('Elige un oficio del 3 al 8.');
      est.contrabando[x] = p.id;
      log(est, `${quien} apunta al ${nombreRol(x)}: cuando le toque, tendrá que pagar.`);
      return ok();
    }
    case 3:
      t.maxConstruir = 2; t.descuentoRol = 1;
      log(est, `${quien} podrá construir hasta 2 edificios con descuento.`);
      return ok();
    case 4: {
      const o = jug(est, Number(prm.objetivo));
      if (!o || o.fuera || o.id === p.id) return err('Elige a otro jugador.');
      if (tiene(o, 'puerta')) return err(`${o.nombre} tiene la Puerta Fortificada: no se puede.`);
      if (!o.mano.length) return err(`${o.nombre} no tiene planos.`);
      t.pendiente = { tipo: 'notario', objetivo: o.id, cartas: o.mano.map((c) => ({ ...c })) };
      log(est, `${quien} revisa la mano de ${o.nombre}.`);
      return ok();
    }
    case 5: {
      const tipo = prm.tipo;
      if (!TIPOS_BASE.includes(tipo) && tipo !== 'hito') return err('Elige un tipo.');
      const g = cuenta(p, tipo);
      p.monedas += g; t.gremial = tipo;
      log(est, `${quien} elige ${TIPOS[tipo].nombre} y cobra ${g}.`);
      return ok();
    }
    case 6: {
      let total = 0;
      activos(est).forEach((o) => { if (o.id !== p.id && o.monedas > p.monedas) { o.monedas -= 1; total += 1; } });
      p.monedas += total;
      log(est, `${quien} recauda ${total} ${total === 1 ? 'moneda' : 'monedas'}.`);
      return ok();
    }
    case 7: {
      const o = jug(est, Number(prm.objetivo));
      if (!o || o.fuera || o.id === p.id) return err('Elige a otro jugador.');
      if (tiene(o, 'puerta')) return err(`${o.nombre} tiene la Puerta Fortificada: no se puede.`);
      const c = o.pueblo.find((x) => x.uid === Number(prm.cartaUid));
      if (!c) return err('Edificio no válido.');
      if (p.pueblo.some((x) => x.nombre === c.nombre)) return err('Ya tienes un edificio igual.');
      const precio = c.coste + 1;
      if (p.monedas < precio) return err(`Necesitas ${precio} monedas.`);
      p.monedas -= precio; o.monedas += precio;
      o.pueblo = o.pueblo.filter((x) => x.uid !== c.uid); p.pueblo.push(c);
      log(est, `${quien} compra ${c.nombre} a ${o.nombre} por ${precio}.`);
      return ok();
    }
    default: return err('Este oficio no tiene habilidad que usar.');
  }
}

// ---------------------------------------------------------------- Construir
export function costeReal(est, p, carta) {
  const t = est.turno;
  let d = Math.floor(cuenta(p, 'taller') / 2);
  if (t) {
    d += t.descuentoRol;
    if (t.gremial && t.gremial === carta.tipo && !p.pueblo.some((x) => x.tipo === t.gremial && x._hoy === est.ronda)) d += 1;
    if (tiene(p, 'mercado') && t.construidos === 0) d += 1;
  }
  return Math.max(1, carta.coste - d);
}

export function construir(est, id, uid) {
  if (!esActivo(est, id)) return err('No es tu turno.');
  const t = est.turno; const p = jug(est, id);
  if (!t.basica || t.pendiente) return err('Primero haz tu acción básica.');
  if (t.construidos >= t.maxConstruir) return err('Ya has construido todo lo que podías este turno.');
  const c = p.mano.find((x) => x.uid === uid);
  if (!c) return err('Ese plano no está en tu mano.');
  if (p.pueblo.some((x) => x.nombre === c.nombre)) return err('Ya tienes un edificio igual en tu pueblo.');
  const coste = costeReal(est, p, c);
  if (p.monedas < coste) return err(`Necesitas ${coste} monedas.`);
  p.monedas -= coste;
  p.mano = p.mano.filter((x) => x.uid !== uid);
  p.pueblo.push({ ...c, _hoy: est.ronda });
  t.construidos += 1;
  est.progreso += c.coste + (tiene(p, 'monumento') ? 1 : 0);
  log(est, `${p.nombre} construye ${c.nombre} (${TIPOS[c.tipo].nombre}).`);
  if (est.progreso >= est.meta && est.inaugurador === null) {
    est.inaugurador = p.id;
    log(est, `¡${p.nombre} pone la última piedra! El pueblo se inaugura al acabar la ronda.`);
  }
  return ok();
}

export function terminarTurno(est, id) {
  if (!esActivo(est, id)) return err('No es tu turno.');
  const t = est.turno;
  if (!t.basica || t.pendiente) return err('Primero haz tu acción básica.');
  siguienteTurno(est);
  return ok();
}

// ---------------------------------------------------------------- Puntuación y final
export function puntuar(est) {
  return est.jugadores.map((p) => {
    const base = p.pueblo.reduce((s, c) => s + c.prestigio, 0);
    const presentes = TIPOS_BASE.filter((t) => cuenta(p, t) > 0).length;
    const comodin = tiene(p, 'faro') ? 1 : 0;
    const variedad = presentes === 4 || (presentes === 3 && comodin) ? AJUSTES.bonusVariedad : 0;
    const hogares = Math.floor(cuenta(p, 'hogar') / AJUSTES.hogaresPorBonus);
    const inaug = est.inaugurador === p.id ? AJUSTES.bonusInauguracion : 0;
    const total = p.fuera ? 0 : base + variedad + hogares + inaug;
    return { id: p.id, nombre: p.nombre, edificios: p.pueblo.length, base, variedad, hogares, inauguracion: inaug, total, monedas: p.monedas, fuera: p.fuera };
  });
}

function terminar(est, motivo = 'inauguracion') {
  est.fase = 'fin'; est.turno = null;
  const tabla = puntuar(est).sort((a, b) => b.total - a.total || b.monedas - a.monedas || b.edificios - a.edificios);
  const mejor = tabla[0];
  const ganadores = tabla.filter((x) => x.total === mejor.total && x.monedas === mejor.monedas).map((x) => x.id);
  est.fin = { tabla, ganadores, motivo };
}

// ---------------------------------------------------------------- Avance forzado y abandono
export function forzar(est) {
  if (est.fase === 'fin') return false;
  if (est.fase === 'elegir') {
    activos(est).forEach((j) => { if (!est.elecciones[j.id]) est.elecciones[j.id] = 1 + Math.floor(est.rng() * 8); });
    resolverElecciones(est);
    return true;
  }
  const t = est.turno; if (!t) return false;
  if (!t.basica && !t.pendiente) basica(est, t.jugadorId, 'jornal');
  if (t.pendiente) elegirPendiente(est, t.jugadorId, t.pendiente.cartas[0].uid);
  terminarTurno(est, t.jugadorId);
  return true;
}

export function abandonar(est, id) {
  const p = jug(est, id);
  if (!p || p.fuera || est.fase === 'fin') return;
  p.fuera = true; est.descarte.push(...p.mano); p.mano = [];
  delete est.elecciones[id];
  log(est, `${p.nombre} abandona el pueblo.`);
  if (activos(est).length < 2) return terminar(est, 'abandono');
  if (est.fase === 'elegir') { if (activos(est).every((j) => est.elecciones[j.id])) resolverElecciones(est); }
  else if (est.turno && est.turno.jugadorId === id) siguienteTurno(est);
}

// ---------------------------------------------------------------- Vista de un jugador
export function vistaDe(est, id) {
  const yo = jug(est, id);
  const t = est.turno;
  const miTurno = esActivo(est, id);
  const marcador = puntuar(est);
  const v = {
    fase: est.fase, ronda: est.ronda, meta: est.meta, progreso: est.progreso,
    sello: { id: est.jugadores[est.sello].id, nombre: est.jugadores[est.sello].nombre },
    inaugurador: est.inaugurador,
    yo: { id: yo.id, nombre: yo.nombre, monedas: yo.monedas, mano: yo.mano, rol: est.asignados[id] ?? null, eleccion: est.elecciones[id] ?? null, fuera: yo.fuera },
    jugadores: est.jugadores.map((p) => ({
      id: p.id, nombre: p.nombre, monedas: p.monedas, nMano: p.mano.length, pueblo: p.pueblo, fuera: p.fuera,
      esSello: est.jugadores[est.sello].id === p.id,
      eligio: est.fase === 'elegir' ? !!est.elecciones[p.id] : null,
      rolRevelado: est.reveladas[p.id] ?? null,
      puntos: marcador.find((m) => m.id === p.id).total,
      protegido: tiene(p, 'puerta')
    })),
    log: est.log.slice(-30),
    ultimaRonda: est.ultimaRonda
  };
  if (est.fase === 'elegir') v.faltan = activos(est).filter((j) => !est.elecciones[j.id]).map((j) => j.nombre);
  if (t) {
    const p = jug(est, t.jugadorId);
    v.turno = {
      jugadorId: p.id, nombre: p.nombre, rol: t.rol, rolNombre: nombreRol(t.rol), basica: t.basica,
      habilidadUsada: t.habilidadUsada, construidos: t.construidos, maxConstruir: t.maxConstruir, bloqueada: t.bloqueada
    };
    if (miTurno) {
      v.turno.pendiente = t.pendiente;
      v.turno.costes = Object.fromEntries(yo.mano.map((c) => [c.uid, costeReal(est, yo, c)]));
      v.turno.bonusJornal = bonusJornal(yo);
      v.turno.proyectarN = proyectarN(yo);
      if (t.rol === 8) v.turno.libres = libresParaAprendiz(est);
    }
  }
  if (est.fase === 'fin') v.fin = est.fin;
  return v;
}
