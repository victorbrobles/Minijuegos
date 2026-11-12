// server/fundadores/engine.js
// Motor puro de «Fundadores» (sin red ni React). Lo usan:
//   - server/routes/fundadores.js (salas online)
//   - client/src/games/Fundadores/engine.js (modo un solo dispositivo)  <-- COPIA IDÉNTICA de este archivo
// Si cambias algo aquí:  npm run sync:fundadores  (en /server)
//
// IDEA: cada fundador levanta su propio pueblo. Todos empiezan con monedas y planos.
// Cada ronda se retiran al azar algunos de los 10 oficios, de modo que quedan tantos como jugadores,
// y por orden de prioridad cada uno elige uno EN SECRETO. Después los oficios se llaman en orden (1 → 10):
// quien tenga el oficio llamado juega su turno: 1) cobra monedas o toma planos, 2) usa la habilidad del
// oficio y 3) construye. Cuando alguien completa su pueblo se termina la ronda y gana el mejor pueblo
// (edificios + variedad + quien lo completó + monedas sobrantes + medallas + ventajas de los edificios).

// ---------------------------------------------------------------- Datos
export const TIPOS = {
  noble: { nombre: 'Noble', icono: 'crown', color: '#ca8a04' },
  templo: { nombre: 'Templo', icono: 'landmark', color: '#2563eb' },
  comercio: { nombre: 'Comercio', icono: 'tag', color: '#16a34a' },
  guardia: { nombre: 'Guardia', icono: 'shield', color: '#dc2626' },
  singular: { nombre: 'Singular', icono: 'star', color: '#9333ea' }
};
export const ORDEN_TIPOS = ['noble', 'templo', 'comercio', 'guardia', 'singular'];

// param: qué hay que indicar al usar la habilidad ('rol' = nombrar un oficio)
export const ROLES = [
  { id: 1, nombre: 'Saboteadora', icono: 'bomb', param: 'rol', breve: 'Anula un oficio',
    desc: 'Nombra un oficio: quien lo tenga pierde su turno entero esta ronda.' },
  { id: 2, nombre: 'Cobrador', icono: 'briefcase', param: 'rol', breve: 'Cobra a un oficio',
    desc: 'Nombra un oficio (no el saboteado): al empezar su turno, su dueño te entrega la mitad de sus monedas.' },
  { id: 3, nombre: 'Cartógrafa', icono: 'compass', param: null, breve: 'Más planos',
    desc: 'Roba 3 planos y quédate con 2.' },
  { id: 4, nombre: 'Heraldo', icono: 'crown', param: null, tipo: 'noble', breve: 'Prioridad',
    desc: 'Te llevas el sello (aunque te saboteen): la próxima ronda eliges oficio el primero. Cobras 1 moneda por cada edificio Noble.' },
  { id: 5, nombre: 'Guardiana', icono: 'shield', param: null, tipo: 'templo', breve: 'Protección',
    desc: 'El Capitán no puede derribar tus edificios esta ronda. Cobras 1 moneda por cada Templo.' },
  { id: 6, nombre: 'Mercader', icono: 'tag', param: null, tipo: 'comercio', breve: 'Monedas',
    desc: 'Cobras 1 moneda extra y 1 más por cada edificio de Comercio.' },
  { id: 7, nombre: 'Maestra de obras', icono: 'hardhat', param: null, breve: 'Construir más',
    desc: 'Robas 2 planos y este turno puedes construir hasta 3 edificios.' },
  { id: 8, nombre: 'Capitán', icono: 'flag', param: 'derribo', tipo: 'guardia', breve: 'Derribar',
    desc: 'Cobras 1 moneda por cada Guardia. Además puedes derribar un edificio de otro pueblo pagando su coste menos 1 (no a pueblos completos ni protegidos).' },
  { id: 9, nombre: 'Prestamista', icono: 'coin', param: null, breve: 'Ayuda al rezagado',
    desc: 'Cobras 1 moneda por cada jugador que tenga más edificios que tú (como mínimo 2).' },
  { id: 10, nombre: 'Alcaldesa', icono: 'landmark', param: null, breve: 'Medallas',
    desc: 'Ganas una medalla (+2 puntos al final) y este turno los edificios Singulares te cuestan 2 menos.' }
];
export const ROL = Object.fromEntries(ROLES.map((r) => [r.id, r]));
export const nombreRol = (id) => ROL[id]?.nombre ?? '—';

export const SINGULARES = [
  { efecto: 'archivo', nombre: 'Archivo Real', coste: 5, puntos: 5, texto: 'Al tomar planos te quedas con uno más.' },
  { efecto: 'atalaya', nombre: 'Atalaya', coste: 4, puntos: 4, texto: 'Al tomar planos robas uno más para elegir.' },
  { efecto: 'canteros', nombre: 'Gremio de canteros', coste: 5, puntos: 5, texto: 'Puedes construir edificios repetidos.' },
  { efecto: 'cajafuerte', nombre: 'Caja fuerte', coste: 4, puntos: 4, texto: 'Al final, 1 punto por cada 2 monedas (en vez de cada 3).' },
  { efecto: 'empalizada', nombre: 'Empalizada', coste: 4, puntos: 4, texto: 'El Capitán no puede derribar tus edificios.' },
  { efecto: 'plaza', nombre: 'Plaza mayor', coste: 3, puntos: 3, texto: 'Cuenta como el tipo que te falte para el bonus de variedad.' },
  { efecto: 'imprenta', nombre: 'Imprenta', coste: 4, puntos: 4, texto: 'Una vez por turno: paga 1 moneda y roba 1 plano.' },
  { efecto: 'abastos', nombre: 'Mercado de abastos', coste: 3, puntos: 3, texto: 'Una vez por turno: descarta 1 plano y cobra 2 monedas.' },
  { efecto: 'puerto', nombre: 'Puerto', coste: 5, puntos: 5, texto: 'Al final, +1 punto por cada edificio de Comercio.' },
  { efecto: 'catedral', nombre: 'Catedral', coste: 6, puntos: 8, texto: 'Vale 8 puntos.' },
  { efecto: 'fuente', nombre: 'Fuente de la plaza', coste: 5, puntos: 5, texto: 'Al final, +1 punto por cada otro edificio Singular.' },
  { efecto: 'posada', nombre: 'Posada', coste: 3, puntos: 3, texto: 'Si eres el último en elegir oficio, cobras 2 monedas.' }
];

const BASE = {
  noble: [['Casa solariega', 3, 5], ['Palacete', 4, 4], ['Palacio', 5, 3]],
  templo: [['Ermita', 1, 3], ['Capilla', 2, 3], ['Monasterio', 3, 3], ['Basílica', 5, 2]],
  comercio: [['Taberna', 1, 5], ['Mercado', 2, 4], ['Lonja', 3, 3], ['Casa de cambio', 4, 3], ['Ayuntamiento', 5, 2]],
  guardia: [['Garita', 1, 3], ['Cuartel', 2, 3], ['Torre vigía', 3, 3], ['Fortaleza', 5, 2]]
};

// Con 6 o más jugadores se duplican los edificios básicos para que no se acabe el mazo.
export function crearMazo(numJugadores = 4) {
  const cartas = [];
  const factor = numJugadores >= 6 ? 2 : 1;
  let n = 0;
  Object.entries(BASE).forEach(([tipo, lista]) => {
    lista.forEach(([nombre, coste, copias]) => {
      for (let i = 0; i < copias * factor; i++) cartas.push({ uid: ++n, nombre, tipo, coste, puntos: coste });
    });
  });
  SINGULARES.forEach((s) => cartas.push({ uid: ++n, nombre: s.nombre, tipo: 'singular', coste: s.coste, puntos: s.puntos, efecto: s.efecto, texto: s.texto }));
  return cartas;
}

export const DURACIONES = { corto: 6, normal: 7, largo: 8 }; // edificios para completar el pueblo
export const AJUSTES = {
  monedasIni: 2, planosIni: 4, cobro: 2, planosRobo: 2,
  bonusPrimero: 3, bonusCompleto: 2, bonusVariedad: 3, monedasPorPunto: 3, puntosMedalla: 2,
  rondasMax: 30,
  min: 3, max: 9
};

// ---------------------------------------------------------------- Utilidades
const barajar = (arr, rng) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const jug = (est, id) => est.jugadores.find((j) => j.id === id);
const activos = (est) => est.jugadores.filter((j) => !j.fuera);
const ok = () => ({ ok: true });
const err = (error) => ({ ok: false, error });
const cuenta = (j, tipo) => j.pueblo.filter((c) => c.tipo === tipo).length;
const tiene = (j, efecto) => j.pueblo.some((c) => c.efecto === efecto);
const log = (est, texto) => { est.log.push({ ronda: est.ronda, texto }); if (est.log.length > 120) est.log.shift(); };
const s = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

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
  const meta = DURACIONES[cfg.duracion] || DURACIONES.normal;
  const est = {
    rng, cfg: { duracion: DURACIONES[cfg.duracion] ? cfg.duracion : 'normal' }, meta,
    jugadores: [], mazo: barajar(crearMazo(jugadores.length), rng), descarte: [],
    ronda: 0, sello: Math.floor(rng() * jugadores.length), fase: 'eleccion',
    enJuego: [], retirados: [], pool: [], ordenEleccion: [], eligiendo: 0, elecciones: {},
    turnoRol: 0, turno: null, saboteado: null, cobrado: null, protegidoId: null, reveladas: {},
    ordenCompleto: [], log: [], fin: null
  };
  est.jugadores = jugadores.map((j) => ({ id: j.id, nombre: j.nombre, monedas: AJUSTES.monedasIni, mano: [], pueblo: [], medallas: 0, fuera: false }));
  est.jugadores.forEach((j) => { j.mano = robar(est, AJUSTES.planosIni); });
  iniciarRonda(est);
  return est;
}

function iniciarRonda(est) {
  est.ronda += 1;
  est.fase = 'eleccion';
  const n = activos(est).length;
  const ids = barajar(ROLES.map((r) => r.id), est.rng);
  est.retirados = ids.slice(0, Math.max(0, ROLES.length - n)).sort((a, b) => a - b);
  est.enJuego = ids.slice(Math.max(0, ROLES.length - n)).sort((a, b) => a - b);
  est.pool = [...est.enJuego];
  est.ordenEleccion = [];
  for (let k = 0; k < est.jugadores.length; k++) {
    const j = est.jugadores[(est.sello + k) % est.jugadores.length];
    if (!j.fuera) est.ordenEleccion.push(j.id);
  }
  est.eligiendo = 0;
  est.elecciones = {};
  est.turnoRol = 0; est.turno = null;
  est.saboteado = null; est.cobrado = null; est.protegidoId = null; est.reveladas = {};
  log(est, `— Ronda ${est.ronda} · empieza a elegir ${est.jugadores[est.sello].nombre}. Hoy no se presentan: ${est.retirados.map(nombreRol).join(', ') || 'nadie'} —`);
}

// ---------------------------------------------------------------- Elegir oficio (en secreto, por turnos)
export const eligeAhora = (est) => (est.fase === 'eleccion' ? est.ordenEleccion[est.eligiendo] ?? null : null);

export function elegirRol(est, id, rol) {
  if (est.fase !== 'eleccion') return err('Ahora no se eligen oficios.');
  if (eligeAhora(est) !== id) return err('Todavía no te toca elegir.');
  if (!est.pool.includes(rol)) return err('Ese oficio no está disponible.');
  const p = jug(est, id);
  const ultimo = est.eligiendo === est.ordenEleccion.length - 1;
  est.pool = est.pool.filter((r) => r !== rol);
  est.elecciones[id] = rol;
  if (ultimo && tiene(p, 'posada')) { p.monedas += 2; log(est, `${p.nombre} elige el último y su Posada le da 2 monedas.`); }
  avanzarEleccion(est);
  return ok();
}

function avanzarEleccion(est) {
  est.eligiendo += 1;
  while (est.eligiendo < est.ordenEleccion.length && jug(est, est.ordenEleccion[est.eligiendo]).fuera) est.eligiendo += 1;
  if (est.eligiendo >= est.ordenEleccion.length) empezarTurnos(est);
}

function empezarTurnos(est) {
  est.fase = 'turnos';
  est.turnoRol = 0;
  llamarSiguiente(est);
}

const duenoDe = (est, rol) => est.jugadores.find((j) => !j.fuera && est.elecciones[j.id] === rol) || null;

function llamarSiguiente(est) {
  est.turno = null;
  for (let rol = est.turnoRol + 1; rol <= ROLES.length; rol++) {
    est.turnoRol = rol;
    if (!est.enJuego.includes(rol)) continue;
    const p = duenoDe(est, rol);
    if (!p) { log(est, `${nombreRol(rol)}: nadie lo eligió.`); continue; }
    est.reveladas[rol] = p.id;
    if (est.saboteado === rol) { log(est, `${nombreRol(rol)} era ${p.nombre}: está saboteado y pierde el turno.`); continue; }
    if (est.cobrado && est.cobrado.rol === rol) {
      const c = jug(est, est.cobrado.por);
      const paga = Math.floor(p.monedas / 2);
      if (c && !c.fuera && paga > 0) { p.monedas -= paga; c.monedas += paga; }
      log(est, `${p.nombre} (${nombreRol(rol)}) paga ${s(paga, 'moneda', 'monedas')} al Cobrador.`);
    }
    est.turno = { jugadorId: p.id, rol, paso: 'recurso', pendiente: [], quedar: 0, despues: null, construidos: 0, limite: 1, descuentoSingular: 0, usados: {} };
    log(est, `${nombreRol(rol)} es ${p.nombre}.`);
    return;
  }
  finRonda(est);
}

function finRonda(est) {
  est.turno = null;
  const heraldo = est.enJuego.includes(4) ? duenoDe(est, 4) : null;
  if (heraldo) {
    est.sello = est.jugadores.indexOf(heraldo);
    est.reveladas[4] = heraldo.id;
  }
  if (est.ordenCompleto.length || est.ronda >= AJUSTES.rondasMax || activos(est).length < 2) return terminar(est);
  iniciarRonda(est);
}

// ---------------------------------------------------------------- Turno
function delTurno(est, id) {
  if (est.fase !== 'turnos' || !est.turno) return err('Ahora no es momento de jugar turnos.');
  if (est.turno.jugadorId !== id) return err('No es tu turno.');
  return null;
}

/** Paso 1: cobrar monedas o tomar planos. */
export function recurso(est, id, tipo) {
  const e = delTurno(est, id); if (e) return e;
  const t = est.turno; const p = jug(est, id);
  if (t.paso !== 'recurso') return err('Ya has cobrado este turno.');
  if (tipo === 'monedas') {
    p.monedas += AJUSTES.cobro;
    t.paso = 'habilidad';
    log(est, `${p.nombre} cobra ${AJUSTES.cobro} monedas.`);
    return ok();
  }
  if (tipo !== 'planos') return err('Elige monedas o planos.');
  const robados = robar(est, AJUSTES.planosRobo + (tiene(p, 'atalaya') ? 1 : 0));
  if (!robados.length) return err('No quedan planos en el mazo: cobra monedas.');
  const quedar = 1 + (tiene(p, 'archivo') ? 1 : 0);
  log(est, `${p.nombre} toma planos.`);
  ofrecerPlanos(est, p, robados, quedar, 'habilidad');
  return ok();
}

function ofrecerPlanos(est, p, robados, quedar, despues) {
  const t = est.turno;
  if (robados.length <= quedar) { p.mano.push(...robados); t.paso = despues; return; }
  t.pendiente = robados; t.quedar = quedar; t.despues = despues; t.paso = 'planos';
}

/** Elige uno de los planos robados (se repite hasta quedarse con los que tocan). */
export function quedarPlano(est, id, uid) {
  const e = delTurno(est, id); if (e) return e;
  const t = est.turno; const p = jug(est, id);
  if (t.paso !== 'planos') return err('No estás eligiendo planos.');
  const c = t.pendiente.find((x) => x.uid === uid);
  if (!c) return err('Ese plano no está entre los robados.');
  p.mano.push(c);
  t.pendiente = t.pendiente.filter((x) => x.uid !== uid);
  t.quedar -= 1;
  if (t.quedar <= 0 || !t.pendiente.length) {
    est.descarte.push(...t.pendiente);
    t.pendiente = []; t.quedar = 0; t.paso = t.despues; t.despues = null;
  }
  return ok();
}

/** Paso 2: habilidad del oficio. params: { rol } | { derribo: { jugadorId, uid } } */
export function habilidad(est, id, params = {}) {
  const e = delTurno(est, id); if (e) return e;
  const t = est.turno; const p = jug(est, id);
  if (t.paso !== 'habilidad') return err(t.paso === 'recurso' ? 'Primero cobra monedas o toma planos.' : 'Ya has usado tu habilidad.');
  switch (t.rol) {
    case 1: {
      const r = Number(params.rol);
      if (!ROL[r] || r === 1) return err('Nombra un oficio distinto del tuyo.');
      if (!est.enJuego.includes(r)) return err('Ese oficio no se presenta esta ronda.');
      est.saboteado = r;
      log(est, `La Saboteadora anula al ${nombreRol(r)}.`);
      break;
    }
    case 2: {
      const r = Number(params.rol);
      if (!ROL[r] || r <= 2) return err('Nombra un oficio del 3 al 10.');
      if (!est.enJuego.includes(r)) return err('Ese oficio no se presenta esta ronda.');
      if (r === est.saboteado) return err('Ese oficio está saboteado: no jugará su turno.');
      est.cobrado = { rol: r, por: p.id };
      log(est, `El Cobrador irá a por el ${nombreRol(r)}.`);
      break;
    }
    case 3: {
      const robados = robar(est, 3);
      log(est, `${p.nombre} (Cartógrafa) estudia ${s(robados.length, 'plano', 'planos')}.`);
      ofrecerPlanos(est, p, robados, 2, 'construir');
      return ok();
    }
    case 4: case 5: case 6: {
      const tipo = ROL[t.rol].tipo;
      let gana = cuenta(p, tipo) + (t.rol === 6 ? 1 : 0);
      p.monedas += gana;
      if (t.rol === 5) est.protegidoId = p.id;
      log(est, `${p.nombre} (${nombreRol(t.rol)}) cobra ${s(gana, 'moneda', 'monedas')}${t.rol === 5 ? ' y protege su pueblo' : ''}.`);
      break;
    }
    case 7: {
      const robados = robar(est, 2);
      p.mano.push(...robados);
      t.limite = 3;
      log(est, `${p.nombre} (Maestra de obras) roba ${s(robados.length, 'plano', 'planos')} y podrá construir hasta 3 edificios.`);
      break;
    }
    case 8: {
      const gana = cuenta(p, 'guardia');
      if (params.derribo) {
        const r = derribar(est, p, params.derribo);
        if (!r.ok) return r;
      }
      p.monedas += gana;
      log(est, `${p.nombre} (Capitán) cobra ${s(gana, 'moneda', 'monedas')}.`);
      break;
    }
    case 9: {
      const mios = p.pueblo.length;
      const gana = Math.max(2, activos(est).filter((q) => q.id !== p.id && q.pueblo.length > mios).length);
      p.monedas += gana;
      log(est, `${p.nombre} (Prestamista) cobra ${s(gana, 'moneda', 'monedas')}.`);
      break;
    }
    case 10: {
      p.medallas += 1;
      t.descuentoSingular = 2;
      log(est, `${p.nombre} (Alcaldesa) recibe una medalla.`);
      break;
    }
    default: return err('Oficio desconocido.');
  }
  t.paso = 'construir';
  return ok();
}

export function puedeDerribar(est, atacante, objetivo) {
  if (!objetivo || objetivo.fuera || objetivo.id === atacante.id) return 'Elige el pueblo de otro jugador.';
  if (objetivo.pueblo.length >= est.meta) return 'No se puede derribar en un pueblo completo.';
  if (est.protegidoId === objetivo.id) return 'Ese pueblo está protegido por la Guardiana.';
  if (tiene(objetivo, 'empalizada')) return 'Ese pueblo tiene una Empalizada.';
  return null;
}

function derribar(est, p, { jugadorId, uid }) {
  const v = jug(est, Number(jugadorId));
  const motivo = puedeDerribar(est, p, v);
  if (motivo) return err(motivo);
  const c = v.pueblo.find((x) => x.uid === Number(uid));
  if (!c) return err('Ese edificio no existe.');
  const precio = Math.max(0, c.coste - 1);
  if (p.monedas < precio) return err(`Necesitas ${s(precio, 'moneda', 'monedas')} para derribarlo.`);
  p.monedas -= precio;
  v.pueblo = v.pueblo.filter((x) => x.uid !== c.uid);
  est.descarte.push(c);
  log(est, `${p.nombre} (Capitán) derriba ${c.nombre} del pueblo de ${v.nombre} pagando ${s(precio, 'moneda', 'monedas')}.`);
  return ok();
}

export function omitirHabilidad(est, id) {
  const e = delTurno(est, id); if (e) return e;
  if (est.turno.paso !== 'habilidad') return err('Ahora no puedes hacer eso.');
  if (est.turno.rol === 4) log(est, `${jug(est, id).nombre} no usa la habilidad del Heraldo (pero se lleva el sello).`);
  est.turno.paso = 'construir';
  return ok();
}

export function costeDe(est, p, carta) {
  const t = est.turno;
  const desc = t && t.jugadorId === p.id && carta.tipo === 'singular' ? t.descuentoSingular : 0;
  return Math.max(0, carta.coste - desc);
}

export function motivoNoConstruir(est, p, carta) {
  const t = est.turno;
  if (!t || t.jugadorId !== p.id) return 'No es tu turno.';
  if (t.paso === 'recurso') return 'Primero cobra monedas o toma planos.';
  if (t.paso === 'planos') return 'Termina de elegir los planos.';
  if (t.construidos >= t.limite) return t.limite === 1 ? 'Solo puedes construir 1 edificio por turno.' : `Ya has construido ${t.limite} edificios.`;
  if (!tiene(p, 'canteros') && p.pueblo.some((c) => c.nombre === carta.nombre)) return 'Ya tienes ese edificio en tu pueblo.';
  if (p.pueblo.length >= est.meta) return 'Tu pueblo ya está completo.';
  const coste = costeDe(est, p, carta);
  if (p.monedas < coste) return `Te faltan ${s(coste - p.monedas, 'moneda', 'monedas')}.`;
  return null;
}

/** Paso 3: construir (se puede hacer tras la habilidad o saltándosela). */
export function construir(est, id, uid) {
  const e = delTurno(est, id); if (e) return e;
  const t = est.turno; const p = jug(est, id);
  const carta = p.mano.find((c) => c.uid === Number(uid));
  if (!carta) return err('Ese plano no está en tu mano.');
  const motivo = motivoNoConstruir(est, p, carta);
  if (motivo) return err(motivo);
  if (t.paso === 'habilidad') t.paso = 'construir'; // construir antes de la habilidad = renunciar a ella
  const coste = costeDe(est, p, carta);
  p.monedas -= coste;
  p.mano = p.mano.filter((c) => c.uid !== carta.uid);
  p.pueblo.push(carta);
  t.construidos += 1;
  log(est, `${p.nombre} construye ${carta.nombre} (${coste}).`);
  if (p.pueblo.length >= est.meta && !est.ordenCompleto.includes(p.id)) {
    est.ordenCompleto.push(p.id);
    log(est, est.ordenCompleto.length === 1
      ? `¡${p.nombre} completa su pueblo! Esta es la última ronda.`
      : `${p.nombre} también completa su pueblo.`);
  }
  return ok();
}

/** Ventajas activas de algunos edificios (una vez por turno). */
export function usarEdificio(est, id, efecto, params = {}) {
  const e = delTurno(est, id); if (e) return e;
  const t = est.turno; const p = jug(est, id);
  if (t.paso === 'recurso' || t.paso === 'planos') return err('Primero termina de cobrar.');
  if (!tiene(p, efecto)) return err('No tienes ese edificio.');
  if (t.usados[efecto]) return err('Ya lo has usado este turno.');
  if (efecto === 'imprenta') {
    if (p.monedas < 1) return err('Necesitas 1 moneda.');
    const r = robar(est, 1);
    if (!r.length) return err('No quedan planos.');
    p.monedas -= 1; p.mano.push(...r);
  } else if (efecto === 'abastos') {
    const c = p.mano.find((x) => x.uid === Number(params.uid));
    if (!c) return err('Elige un plano de tu mano para descartar.');
    p.mano = p.mano.filter((x) => x.uid !== c.uid);
    est.descarte.push(c);
    p.monedas += 2;
  } else return err('Ese edificio no tiene una acción que usar.');
  t.usados[efecto] = true;
  log(est, `${p.nombre} usa su ${SINGULARES.find((x) => x.efecto === efecto).nombre}.`);
  return ok();
}

export function terminarTurno(est, id) {
  const e = delTurno(est, id); if (e) return e;
  const t = est.turno;
  if (t.paso === 'recurso') return err('Primero cobra monedas o toma planos.');
  if (t.paso === 'planos') return err('Termina de elegir los planos.');
  llamarSiguiente(est);
  return ok();
}

// ---------------------------------------------------------------- Ausencias
/** El anfitrión desbloquea la partida si alguien no responde: elige o juega por él lo mínimo. */
export function forzar(est) {
  if (est.fase === 'eleccion') {
    const id = eligeAhora(est);
    if (id == null) return false;
    const rol = est.pool[Math.floor(est.rng() * est.pool.length)];
    log(est, `${jug(est, id).nombre} no respondía: se le asigna un oficio al azar.`);
    return elegirRol(est, id, rol).ok;
  }
  if (est.fase === 'turnos' && est.turno) {
    const t = est.turno; const p = jug(est, t.jugadorId);
    if (t.paso === 'recurso') { p.monedas += AJUSTES.cobro; }
    if (t.paso === 'planos') {
      while (t.quedar > 0 && t.pendiente.length) { p.mano.push(t.pendiente.shift()); t.quedar -= 1; }
      est.descarte.push(...t.pendiente); t.pendiente = [];
    }
    log(est, `${p.nombre} no respondía: termina su turno.`);
    llamarSiguiente(est);
    return true;
  }
  return false;
}

export function abandonar(est, id) {
  const p = jug(est, id);
  if (!p || p.fuera || est.fase === 'fin') return;
  p.fuera = true;
  log(est, `${p.nombre} abandona la partida.`);
  if (activos(est).length < 2) return terminar(est);
  if (est.fase === 'eleccion' && eligeAhora(est) === id) avanzarEleccion(est);
  else if (est.fase === 'turnos' && est.turno?.jugadorId === id) {
    est.descarte.push(...est.turno.pendiente);
    llamarSiguiente(est);
  }
}

// ---------------------------------------------------------------- Puntuación
export function puntuar(est, p) {
  const edificios = p.pueblo.reduce((a, c) => a + c.puntos, 0);
  const tipos = new Set(p.pueblo.map((c) => c.tipo));
  const variedad = tipos.size >= 5 || (tiene(p, 'plaza') && tipos.size === 4) ? AJUSTES.bonusVariedad : 0;
  const pos = est.ordenCompleto.indexOf(p.id);
  const completar = pos === 0 ? AJUSTES.bonusPrimero : pos > 0 ? AJUSTES.bonusCompleto : 0;
  const monedas = Math.floor(p.monedas / (tiene(p, 'cajafuerte') ? 2 : AJUSTES.monedasPorPunto));
  const medallas = p.medallas * AJUSTES.puntosMedalla;
  let ventajas = 0;
  if (tiene(p, 'puerto')) ventajas += cuenta(p, 'comercio');
  if (tiene(p, 'fuente')) ventajas += cuenta(p, 'singular') - 1;
  return { edificios, variedad, completar, monedas, medallas, ventajas, total: edificios + variedad + completar + monedas + medallas + ventajas };
}

function terminar(est) {
  if (est.fase === 'fin') return;
  est.fase = 'fin'; est.turno = null;
  const tabla = est.jugadores
    .map((p) => ({ id: p.id, nombre: p.nombre, fuera: p.fuera, monedasFinal: p.monedas, ...puntuar(est, p) }))
    .sort((a, b) => (a.fuera - b.fuera) || (b.total - a.total) || (b.monedasFinal - a.monedasFinal));
  const mejores = tabla.filter((f) => !f.fuera);
  const top = mejores[0];
  const ganadores = top ? mejores.filter((f) => f.total === top.total && f.monedasFinal === top.monedasFinal).map((f) => f.id) : [];
  est.fin = { tabla, ganadores };
  log(est, `— Fin de la partida: gana ${ganadores.map((g) => jug(est, g).nombre).join(' y ')} —`);
}

// ---------------------------------------------------------------- Vista de un jugador
const cartaVista = (c, est, p) => ({ uid: c.uid, nombre: c.nombre, tipo: c.tipo, coste: c.coste, puntos: c.puntos, efecto: c.efecto || null, texto: c.texto || null });

export function vistaDe(est, id) {
  const yo = jug(est, id);
  const fin = est.fase === 'fin';
  const elige = eligeAhora(est);
  const t = est.turno;
  const miTurno = t && t.jugadorId === id;
  const rolDe = (j) => {
    if (j.id === id) return est.elecciones[j.id] ?? null;
    const r = est.elecciones[j.id];
    return r && (fin || est.reveladas[r] === j.id) ? r : null;
  };
  const v = {
    fase: est.fase, ronda: est.ronda, meta: est.meta, duracion: est.cfg.duracion,
    sello: est.jugadores[est.sello]?.id ?? null,
    enJuego: est.enJuego, retirados: est.retirados,
    turnoRol: est.fase === 'turnos' ? est.turnoRol : null,
    saboteado: est.saboteado, cobrado: est.cobrado ? est.cobrado.rol : null,
    protegidoId: est.protegidoId,
    mazo: est.mazo.length + est.descarte.length,
    eleccion: est.fase === 'eleccion' ? {
      turnoDe: elige,
      orden: est.ordenEleccion,
      yaEligieron: Object.keys(est.elecciones).map(Number),
      pool: elige === id ? est.pool : null,
      quedan: est.pool.length
    } : null,
    turno: t ? {
      jugadorId: t.jugadorId, rol: t.rol, paso: t.paso, construidos: t.construidos, limite: t.limite,
      descuentoSingular: t.descuentoSingular, usados: t.usados,
      pendiente: miTurno ? t.pendiente.map((c) => cartaVista(c)) : [], quedar: miTurno ? t.quedar : 0,
      nPendiente: t.pendiente.length
    } : null,
    jugadores: est.jugadores.map((j) => ({
      id: j.id, nombre: j.nombre, monedas: j.monedas, planos: j.mano.length, medallas: j.medallas, fuera: j.fuera,
      pueblo: j.pueblo.map((c) => cartaVista(c)), rol: rolDe(j),
      eligiendo: elige === j.id, completo: est.ordenCompleto.indexOf(j.id) + 1 || null,
      puntos: puntuar(est, j).total - Math.floor(j.monedas / (tiene(j, 'cajafuerte') ? 2 : AJUSTES.monedasPorPunto))
    })),
    yo: yo ? {
      id: yo.id, monedas: yo.monedas, medallas: yo.medallas, rol: est.elecciones[yo.id] ?? null,
      mano: yo.mano.map((c) => ({ ...cartaVista(c), costeReal: costeDe(est, yo, c), motivo: miTurno ? motivoNoConstruir(est, yo, c) : 'No es tu turno.' })),
      ventajas: yo.pueblo.filter((c) => c.efecto).map((c) => c.efecto)
    } : null,
    log: est.log.slice(-40),
    fin: fin ? est.fin : null
  };
  return v;
}
