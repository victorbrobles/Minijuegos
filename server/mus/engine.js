// server/mus/engine.js
// Motor puro del Mus clásico (4 jugadores, dos parejas, baraja española de 40, a 8 reyes). Lo usan las salas online
// (server/routes/mus.js) y, copiado al cliente con `npm run sync:mus`, el modo «contra la máquina».
//
// Asientos 0..3 en sentido de juego; pareja = asiento % 2 (0 y 2 contra 1 y 3). En cada mano:
//   1. MUS: desde la mano, cada uno dice «mus» o «no hay mus». Si los cuatro piden mus, todos descartan (1-4 cartas)
//      y se reparte de nuevo; si alguien corta, empiezan los lances.
//   2. LANCES: grande, chica, pares y juego (o punto si nadie tiene juego). En cada uno se puede pasar, envidar,
//      reenvidar, querer, no querer o lanzar un órdago. En pares y juego solo hablan los que tienen.
//   3. CONTEO: al final de la mano se enseñan las cartas y se cobra lance a lance; quien llega a los puntos gana el juego.
// Los empates los gana quien está más cerca de la mano. Los treses son reyes y los doses, ases.

export const PALOS = ['oros', 'copas', 'espadas', 'bastos'];
export const NUMEROS = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
export const LANCES = ['grande', 'chica', 'pares', 'juego'];
export const NOMBRE_LANCE = { grande: 'Grande', chica: 'Chica', pares: 'Pares', juego: 'Juego', punto: 'Punto' };
export const OPCIONES = { objetivo: [30, 40], vacas: [1, 3] };
export const AJUSTES = { msBot: 1100, simulaciones: 70 };

// ---------------------------------------------------------------- Cartas
const rango = (c) => (c.n === 3 ? 12 : c.n === 2 ? 1 : c.n); // a 8 reyes
export const valorJuego = (c) => (c.n >= 10 || c.n === 3 ? 10 : c.n === 2 ? 1 : c.n);
const ORDEN_GRANDE = [12, 11, 10, 7, 6, 5, 4, 1];
const fuerzaRango = (r) => ORDEN_GRANDE.length - ORDEN_GRANDE.indexOf(r); // 12 → 8 … 1 → 1
export const sumaJuego = (mano) => mano.reduce((a, c) => a + valorJuego(c), 0);
const ORDEN_JUEGO = [31, 32, 40, 37, 36, 35, 34, 33];
export const nombreCarta = (c) => `${{ 1: 'As', 10: 'Sota', 11: 'Caballo', 12: 'Rey' }[c.n] || c.n} de ${c.p}`;

export function crearBaraja() {
  const b = [];
  let id = 0;
  PALOS.forEach((p) => NUMEROS.forEach((n) => b.push({ id: ++id, p, n })));
  return b;
}
const barajar = (a, rng) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/** Pares de una mano: null o { tipo: 'pareja'|'medias'|'duples', valor: [..], bonus }. */
export function paresDe(mano) {
  const cuenta = {};
  mano.forEach((c) => { const r = rango(c); cuenta[r] = (cuenta[r] || 0) + 1; });
  const grupos = Object.entries(cuenta).map(([r, n]) => ({ r: Number(r), n })).filter((g) => g.n >= 2)
    .sort((a, b) => fuerzaRango(b.r) - fuerzaRango(a.r));
  if (!grupos.length) return null;
  if (grupos.some((g) => g.n === 4)) return { tipo: 'duples', valor: [fuerzaRango(grupos[0].r), fuerzaRango(grupos[0].r)], bonus: 3 };
  if (grupos.length === 2) return { tipo: 'duples', valor: grupos.map((g) => fuerzaRango(g.r)), bonus: 3 };
  if (grupos[0].n === 3) return { tipo: 'medias', valor: [fuerzaRango(grupos[0].r)], bonus: 2 };
  return { tipo: 'pareja', valor: [fuerzaRango(grupos[0].r)], bonus: 1 };
}
const TIPO_PARES = { pareja: 1, medias: 2, duples: 3 };
export const NOMBRE_PARES = { pareja: 'pareja', medias: 'medias', duples: 'duples' };
export const tieneJuego = (mano) => sumaJuego(mano) >= 31;

const lexico = (a, b) => { for (let i = 0; i < Math.max(a.length, b.length); i++) { if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) - (b[i] ?? 0); } return 0; };

/** Compara dos manos en un lance: > 0 si gana `a`, < 0 si gana `b`, 0 si empatan (desempata la cercanía a la mano). */
export function comparar(lance, a, b) {
  if (lance === 'grande') return lexico(a.map(rango).map(fuerzaRango).sort((x, y) => y - x), b.map(rango).map(fuerzaRango).sort((x, y) => y - x));
  if (lance === 'chica') return -lexico(a.map(rango).map(fuerzaRango).sort((x, y) => x - y), b.map(rango).map(fuerzaRango).sort((x, y) => x - y));
  if (lance === 'pares') {
    const pa = paresDe(a); const pb = paresDe(b);
    if (!pa || !pb) return (pa ? 1 : 0) - (pb ? 1 : 0);
    return TIPO_PARES[pa.tipo] - TIPO_PARES[pb.tipo] || lexico(pa.valor, pb.valor);
  }
  const sa = sumaJuego(a); const sb = sumaJuego(b);
  if (lance === 'juego') {
    const ia = ORDEN_JUEGO.indexOf(sa); const ib = ORDEN_JUEGO.indexOf(sb);
    return (ia === -1 ? -99 : -ia) - (ib === -1 ? -99 : -ib);
  }
  return sa - sb; // punto: más cerca de 30
}

// ---------------------------------------------------------------- Estado
const pareja = (s) => s % 2;
const desdeMano = (p) => [0, 1, 2, 3].map((k) => (p.mano + k) % 4);
const nombre = (p, s) => p.jugadores[s].nombre;
const nombrePareja = (p, k) => `${nombre(p, k)} y ${nombre(p, k + 2)}`;

function anotar(p, texto, tipo = 'info') {
  p.nlog += 1;
  p.log.push({ n: p.nlog, texto, tipo });
  if (p.log.length > 60) p.log.shift();
}
/** Lo que ha dicho cada asiento (bocadillos de la mesa). */
function decir(p, s, texto, clase = 'info') {
  p.dichos[s] = { texto, n: ++p.nlog, clase };
  if (p.fase === 'lance' && p.lance) (p.voces[p.lance.nombre] ||= []).push({ s, texto, clase });
}

/**
 * jugadores: 4 { id, nombre, bot } en orden de asiento (0 y 2 forman pareja contra 1 y 3).
 * config: { objetivo: 30|40, vacas: 1|3 }
 */
export function crearPartida(jugadores, config = {}, ahora = Date.now(), rng = Math.random) {
  const p = {
    jugadores: jugadores.map((j, s) => ({ id: j.id, nombre: j.nombre, bot: Boolean(j.bot), asiento: s, fuera: false })),
    objetivo: OPCIONES.objetivo.includes(Number(config.objetivo)) ? Number(config.objetivo) : 40,
    vacas: OPCIONES.vacas.includes(Number(config.vacas)) ? Number(config.vacas) : 1,
    puntos: [0, 0], juegos: [0, 0], numMano: 0, mano: Math.floor(rng() * 4),
    mazo: [], descartes: [], cartas: [[], [], [], []],
    fase: 'mus', turno: null, musDichos: [], descartes4: {}, lance: null, resultados: {}, dichos: {},
    conteo: null, listos: [], hasta: null, log: [], nlog: 0, fin: null, voces: {}, cobros: [], revelado: false
  };
  Object.defineProperty(p, 'rng', { value: rng, enumerable: false, writable: true });
  nuevaMano(p, ahora, true);
  return p;
}
const azar = (p) => (typeof p.rng === 'function' ? p.rng() : Math.random());

function robar(p, n) {
  const c = [];
  for (let i = 0; i < n; i++) {
    if (!p.mazo.length) { p.mazo = barajarCon(p, p.descartes); p.descartes = []; anotar(p, 'Se barajan los descartes.'); }
    c.push(p.mazo.pop());
  }
  return c;
}
const barajarCon = (p, a) => barajar(a, () => azar(p));

function nuevaMano(p, ahora, primera = false) {
  p.numMano += 1;
  if (!primera) p.mano = (p.mano + 1) % 4;
  p.mazo = barajarCon(p, crearBaraja());
  p.descartes = [];
  p.cartas = [0, 1, 2, 3].map(() => robar(p, 4));
  p.fase = 'mus';
  p.musDichos = [];
  p.descartes4 = {};
  p.lance = null;
  p.resultados = {};
  p.dichos = {};
  p.conteo = null;
  p.voces = {};
  p.cobros = [];
  p.revelado = false;
  p.listos = [];
  p.turno = p.mano;
  anotar(p, `— Mano ${p.numMano}: es mano ${nombre(p, p.mano)} —`);
  programarBot(p, ahora);
}

function programarBot(p, ahora) {
  const s = quienActua(p);
  p.hasta = s != null && p.jugadores[s].bot ? ahora + AJUSTES.msBot : null;
  if (p.fase === 'descarte' && p.jugadores.some((j, k) => j.bot && !p.descartes4[k])) p.hasta = ahora + AJUSTES.msBot;
}
/** Asiento que debe hablar ahora (null si nadie en concreto: descarte simultáneo, conteo…). */
export function quienActua(p) {
  if (p.fase === 'mus') return p.turno;
  if (p.fase === 'lance') return p.lance.cola[0] ?? null;
  return null;
}

// ---------------------------------------------------------------- Mus
export function mus(p, s, pide, ahora = Date.now()) {
  if (p.fase !== 'mus') return { ok: false, error: 'Ahora no se habla de mus.' };
  if (s !== p.turno) return { ok: false, error: 'No es tu turno.' };
  if (pide) {
    decir(p, s, 'Mus');
    p.musDichos.push(s);
    if (p.musDichos.length === 4) {
      p.fase = 'descarte';
      p.descartes4 = {};
      p.turno = null;
      anotar(p, 'Mus corrido: todos descartan.');
    } else p.turno = (p.turno + 1) % 4;
  } else {
    decir(p, s, 'No hay mus');
    anotar(p, `✋ ${nombre(p, s)} corta: no hay mus.`);
    empezarLances(p);
  }
  programarBot(p, ahora);
  return { ok: true };
}

export function descartar(p, s, ids, ahora = Date.now()) {
  if (p.fase !== 'descarte') return { ok: false, error: 'Ahora no se descarta.' };
  if (p.descartes4[s]) return { ok: false, error: 'Ya has descartado.' };
  const set = new Set((ids || []).map(Number));
  const fuera = p.cartas[s].filter((c) => set.has(c.id));
  if (fuera.length < 1) return { ok: false, error: 'Descarta al menos una carta.' };
  p.descartes4[s] = fuera.map((c) => c.id);
  decir(p, s, `Me descarto de ${fuera.length}`);
  if (Object.keys(p.descartes4).length === 4) {
    // Se reparte a la vez, desde la mano
    desdeMano(p).forEach((k) => {
      const tirar = new Set(p.descartes4[k]);
      const quedan = p.cartas[k].filter((c) => !tirar.has(c.id));
      p.descartes.push(...p.cartas[k].filter((c) => tirar.has(c.id)));
      p.cartas[k] = [...quedan, ...robar(p, tirar.size)];
    });
    anotar(p, `Descartes: ${desdeMano(p).map((k) => `${nombre(p, k)} ${p.descartes4[k].length}`).join(', ')}.`);
    p.fase = 'mus';
    p.musDichos = [];
    p.dichos = {};
    p.turno = p.mano;
  }
  programarBot(p, ahora);
  return { ok: true };
}

// ---------------------------------------------------------------- Lances
function participantes(p, lance) {
  const orden = desdeMano(p);
  if (lance === 'pares') return orden.filter((s) => paresDe(p.cartas[s]));
  if (lance === 'juego') return orden.filter((s) => tieneJuego(p.cartas[s]));
  return orden;
}

function empezarLances(p) {
  p.fase = 'lance';
  p.turno = null;
  p.dichos = {};
  // Declaraciones de pares y juego (se dicen sin mentir)
  p.declaraciones = desdeMano(p).map((s) => ({ asiento: s, pares: Boolean(paresDe(p.cartas[s])), juego: tieneJuego(p.cartas[s]) }));
  abrirLance(p, 'grande');
}

function abrirLance(p, nombreLance) {
  const lance = nombreLance === 'juego' && !p.cartas.some(tieneJuego) ? 'punto' : nombreLance;
  const parts = participantes(p, lance);
  p.lance = { nombre: lance, participantes: parts, cola: [...parts], propuesta: null, querido: null };
  p.dichos = {};
  const parejas = new Set(parts.map(pareja));
  if (parejas.size < 2) {
    // Solo una pareja (o ninguna) tiene: no hay apuesta
    p.resultados[lance] = { tipo: parts.length ? 'solo' : 'nadie', pareja: parts.length ? pareja(parts[0]) : null };
    anotar(p, parts.length ? `${NOMBRE_LANCE[lance]}: solo tiene la pareja de ${nombrePareja(p, pareja(parts[0]))}.` : `${NOMBRE_LANCE[lance]}: nadie tiene.`);
    return siguienteLance(p);
  }
  return undefined;
}

function siguienteLance(p) {
  const orden = ['grande', 'chica', 'pares', 'juego'];
  const actual = p.lance.nombre === 'punto' ? 'juego' : p.lance.nombre;
  const i = orden.indexOf(actual);
  if (p.fase !== 'lance') return;
  if (i < orden.length - 1) abrirLance(p, orden[i + 1]);
  else contar(p);
}

/** Quien rechaza: la otra pareja se lleva el deje, que se cobra en el momento. */
function sumar(p, k, n, motivo) {
  if (!n || p.fase === 'fin' || p.fase === 'finJuego') return false;
  p.puntos[k] += n;
  if (motivo) anotar(p, `+${n} para ${nombrePareja(p, k)} (${motivo}).`, 'bueno');
  if (p.puntos[k] >= p.objetivo) { ganarJuego(p, k); return true; }
  return false;
}

/**
 * accion: { tipo: 'paso' | 'envido' | 'quiero' | 'noquiero' | 'ordago', cantidad }
 * Sin propuesta: paso / envido / órdago. Ante una propuesta: quiero / no quiero / envido (reenvite) / órdago.
 */
export function hablar(p, s, accion, ahora = Date.now()) {
  if (p.fase !== 'lance') return { ok: false, error: 'Ahora no se envida.' };
  const L = p.lance;
  if (L.cola[0] !== s) return { ok: false, error: 'No es tu turno.' };
  const tipo = accion?.tipo;
  const cant = Math.max(2, Math.min(30, Math.floor(Number(accion?.cantidad) || 2)));
  const nom = NOMBRE_LANCE[L.nombre];
  const otraPareja = (k) => L.participantes.filter((x) => pareja(x) !== k);
  if (!L.propuesta) {
    if (tipo === 'paso') {
      decir(p, s, 'Paso', 'paso');
      L.cola.shift();
      if (!L.cola.length) {
        p.resultados[L.nombre] = { tipo: 'paso' };
        anotar(p, `${nom}: en paso.`);
        siguienteLance(p);
      }
    } else if (tipo === 'envido' || tipo === 'ordago') {
      const ord = tipo === 'ordago';
      L.propuesta = { pareja: pareja(s), total: ord ? null : cant, deje: 1, ordago: ord, por: s };
      L.cola = otraPareja(pareja(s));
      decir(p, s, ord ? '¡Órdago!' : `Envido ${cant}`, ord ? 'ordago' : 'envido');
      anotar(p, ord ? `🔥 ${nombre(p, s)} echa un ÓRDAGO a la ${nom.toLowerCase()}.` : `${nombre(p, s)} envida ${cant} a la ${nom.toLowerCase()}.`, ord ? 'malo' : 'info');
    } else return { ok: false, error: 'Puedes pasar, envidar o echar un órdago.' };
  } else {
    const pr = L.propuesta;
    if (tipo === 'quiero') {
      decir(p, s, 'Quiero', 'quiero');
      if (pr.ordago) {
        anotar(p, `⚔️ ${nombre(p, s)} quiere el órdago.`, 'malo');
        L.querido = { ordago: true };
        p.resultados[L.nombre] = { tipo: 'ordago' };
        ordagoQuerido(p, L.nombre);
        programarBot(p, ahora);
        return { ok: true };
      }
      L.querido = { total: pr.total };
      p.resultados[L.nombre] = { tipo: 'querido', total: pr.total };
      anotar(p, `${nombre(p, s)} quiere: ${pr.total} a la ${nom.toLowerCase()}.`);
      siguienteLance(p);
    } else if (tipo === 'noquiero') {
      decir(p, s, 'No quiero', 'noquiero');
      L.cola.shift();
      if (!L.cola.length) {
        p.resultados[L.nombre] = { tipo: 'rechazado', pareja: pr.pareja, deje: pr.deje };
        anotar(p, `${nom}: no quieren.`);
        p.cobros.push({ lance: L.nombre, pareja: pr.pareja, puntos: pr.deje, texto: pr.deje === 1 ? 'envite no querido' : `envite no querido (había ${pr.deje})` });
        if (!sumar(p, pr.pareja, pr.deje, `${nom.toLowerCase()} no querida`)) siguienteLance(p);
      }
    } else if (tipo === 'envido' || tipo === 'ordago') {
      if (pr.ordago) return { ok: false, error: 'A un órdago solo se puede querer o no querer.' };
      const ord = tipo === 'ordago';
      L.propuesta = { pareja: pareja(s), total: ord ? null : pr.total + cant, deje: pr.total, ordago: ord, por: s };
      L.cola = otraPareja(pareja(s));
      decir(p, s, ord ? '¡Órdago!' : `${cant} más`, ord ? 'ordago' : 'envido');
      anotar(p, ord ? `🔥 ${nombre(p, s)} responde con ÓRDAGO a la ${nom.toLowerCase()}.` : `${nombre(p, s)} sube ${cant} más (${pr.total + cant}).`, ord ? 'malo' : 'info');
    } else return { ok: false, error: 'Quiero, no quiero, sube o echa un órdago.' };
  }
  programarBot(p, ahora);
  return { ok: true };
}

/** Ganador de un lance entre todos los que participan (empate: el más cercano a la mano). */
function ganadorLance(p, lance) {
  const parts = lance === 'pares' ? desdeMano(p).filter((s) => paresDe(p.cartas[s]))
    : lance === 'juego' ? desdeMano(p).filter((s) => tieneJuego(p.cartas[s])) : desdeMano(p);
  let mejor = null;
  parts.forEach((s) => { if (mejor == null || comparar(lance, p.cartas[s], p.cartas[mejor]) > 0) mejor = s; });
  return mejor;
}

function ordagoQuerido(p, lance) {
  const g = ganadorLance(p, lance);
  p.conteo = { ordago: { lance, ganador: g }, filas: [] };
  p.cobros.push({ lance, pareja: pareja(g), puntos: null, texto: 'órdago querido: gana el juego' });
  anotar(p, `🏆 El órdago a la ${NOMBRE_LANCE[lance].toLowerCase()} lo gana ${nombrePareja(p, pareja(g))}.`, 'bueno');
  p.puntos[pareja(g)] = p.objetivo;
  ganarJuego(p, pareja(g), true);
}

/** Fin de la mano: se enseñan las cartas y se cobra lance a lance. */
function contar(p) {
  p.fase = 'conteo';
  p.lance = null;
  p.dichos = {};
  const filas = [];
  const ganadores = Object.fromEntries(['grande', 'chica', 'pares', 'juego', 'punto'].map((l) => [l, p.resultados[l] ? ganadorLance(p, l) : null]));
  p.conteo = { filas, ganadores };
  const cobrar = (lanceNombre, k, n, motivo, s = null) => {
    if (!n || p.fase !== 'conteo') return;
    filas.push({ lance: lanceNombre, pareja: k, puntos: n, motivo });
    p.cobros.push({ lance: lanceNombre, pareja: k, puntos: n, texto: motivo, s });
    sumar(p, k, n, `${NOMBRE_LANCE[lanceNombre].toLowerCase()}: ${motivo}`);
  };
  for (const l of ['grande', 'chica', 'pares', 'juego', 'punto']) {
    const r = p.resultados[l];
    if (!r || r.tipo === 'nadie') continue;
    if (l === 'juego' && !p.cartas.some(tieneJuego)) continue;
    const g = ganadorLance(p, l);
    if (g == null) continue;
    const k = pareja(g);
    if (r.tipo === 'paso') cobrar(l, k, (l === 'pares' || l === 'juego') ? 0 : 1, 'en paso');
    if (r.tipo === 'querido') cobrar(l, k, r.total, `envite querido de ${r.total}`);
    if (l === 'pares') {
      [k, k + 2].forEach((s) => { const pr = paresDe(p.cartas[s]); if (pr) cobrar(l, k, pr.bonus, NOMBRE_PARES[pr.tipo], s); });
    }
    if (l === 'juego') {
      [k, k + 2].forEach((s) => { if (tieneJuego(p.cartas[s])) { const t = sumaJuego(p.cartas[s]); cobrar(l, k, t === 31 ? 3 : 2, t === 31 ? 'juego de 31' : `juego de ${t}`, s); } });
    }
  }
  if (p.fase === 'conteo') { p.listos = []; marcarBotsListos(p); }
}

function marcarBotsListos(p) {
  p.jugadores.forEach((j, s) => { if ((j.bot || j.fuera) && !p.listos.includes(s)) p.listos.push(s); });
}

function ganarJuego(p, k, porOrdago = false) {
  p.juegos[k] += 1;
  anotar(p, `🏆 ¡Juego para ${nombrePareja(p, k)}${porOrdago ? ' por órdago' : ''}!`, 'bueno');
  if (!p.conteo) p.conteo = { filas: [], ganadores: {} };
  p.conteo.juegoPara = k;
  const necesarios = Math.ceil(p.vacas / 2);
  p.lance = null;
  if (p.juegos[k] >= necesarios) {
    p.fase = 'fin';
    p.fin = { ganadora: k, juegos: [...p.juegos], puntos: [...p.puntos], ganadores: [p.jugadores[k].id, p.jugadores[k + 2].id] };
  } else {
    p.fase = 'finJuego';
    p.listos = [];
    marcarBotsListos(p);
  }
}

/** Tras enseñar las cartas, el anfitrión (o quien juega solo) pasa a las puntuaciones de la mano. */
export function verPuntos(p) {
  if (p.fase !== 'conteo' && p.fase !== 'finJuego') return { ok: false, error: 'Ahora no.' };
  p.revelado = true;
  return { ok: true };
}

/** Cada jugador pulsa «seguir» tras el conteo (los bots ya están listos). */
export function seguir(p, s, ahora = Date.now()) {
  if (p.fase !== 'conteo' && p.fase !== 'finJuego') return { ok: false, error: 'Ahora no.' };
  if (!p.listos.includes(s)) p.listos.push(s);
  if (p.listos.length >= 4) avanzar(p, ahora);
  return { ok: true };
}
/** El anfitrión (o el modo un dispositivo) pasa sin esperar a todos. */
export function forzarSeguir(p, ahora = Date.now()) {
  if (p.fase !== 'conteo' && p.fase !== 'finJuego') return { ok: false, error: 'Ahora no.' };
  avanzar(p, ahora);
  return { ok: true };
}
function avanzar(p, ahora) {
  if (p.fase === 'finJuego') { p.puntos = [0, 0]; anotar(p, `— Nuevo juego (${p.juegos[0]}-${p.juegos[1]}) —`); }
  nuevaMano(p, ahora);
}

// ---------------------------------------------------------------- Bots
/** Probabilidad aproximada de ganar un lance con estas cartas (simulando las manos de los rivales). */
export function fuerza(p, s, lance) {
  const mias = p.cartas[s];
  const conocidas = new Set(mias.map((c) => c.id));
  const resto = crearBaraja().filter((c) => !conocidas.has(c.id));
  if (lance === 'pares' && !paresDe(mias)) return 0;
  if (lance === 'juego' && !tieneJuego(mias)) return 0;
  let gana = 0;
  const N = AJUSTES.simulaciones;
  const orden = desdeMano(p);
  for (let k = 0; k < N; k++) {
    const b = barajarCon(p, resto);
    const r1 = b.slice(0, 4); const r2 = b.slice(4, 8);
    let ok = true;
    for (const r of [r1, r2]) {
      if (lance === 'pares' && !paresDe(r)) continue;
      if (lance === 'juego' && !tieneJuego(r)) continue;
      const c = comparar(lance, mias, r);
      if (c < 0 || (c === 0 && orden.indexOf(s) > 1)) { ok = false; break; }
    }
    if (ok) gana += 1;
  }
  return gana / N;
}

function decidirBot(p, s) {
  if (p.fase === 'mus') {
    const fg = fuerza(p, s, 'grande');
    const fp = fuerza(p, s, 'pares');
    const fj = tieneJuego(p.cartas[s]) ? fuerza(p, s, 'juego') : 0;
    const corta = fp > 0.7 || fj > 0.7 || fg > 0.85 || [31, 32].includes(sumaJuego(p.cartas[s]));
    return { tipo: 'mus', pide: !corta };
  }
  if (p.fase === 'lance') {
    const L = p.lance;
    const f = Math.min(1, fuerza(p, s, L.nombre) + 0.08); // el compañero también cuenta
    const pr = L.propuesta;
    const r = azar(p);
    if (!pr) {
      if (f > 0.93 && r < 0.12) return { tipo: 'ordago' };
      if (f > 0.82) return { tipo: 'envido', cantidad: r < 0.5 ? 2 : 4 };
      if (f > 0.66) return { tipo: 'envido', cantidad: 2 };
      if (f < 0.15 && r < 0.08) return { tipo: 'envido', cantidad: 2 }; // algún farol
      return { tipo: 'paso' };
    }
    if (pr.ordago) {
      const vamos = p.puntos[pareja(s)] - p.puntos[1 - pareja(s)];
      return { tipo: f > 0.78 || (vamos < -15 && f > 0.5) ? 'quiero' : 'noquiero' };
    }
    const umbral = Math.min(0.85, 0.42 + pr.total * 0.035);
    if (f > 0.9 && pr.total < 12 && r < 0.6) return { tipo: 'envido', cantidad: r < 0.3 ? 5 : 2 };
    return { tipo: f >= umbral ? 'quiero' : 'noquiero' };
  }
  return null;
}

function descarteBot(p, s) {
  const mano = p.cartas[s];
  const pares = paresDe(mano);
  const cuenta = {};
  mano.forEach((c) => { cuenta[rango(c)] = (cuenta[rango(c)] || 0) + 1; });
  // Se queda reyes, figuras emparejadas y ases si va a chica; tira el resto
  let tirar = mano.filter((c) => rango(c) !== 12 && !(pares && cuenta[rango(c)] >= 2) && !(rango(c) === 1 && cuenta[1] >= 2));
  if (!tirar.length) tirar = [[...mano].sort((a, b) => fuerzaRango(rango(a)) - fuerzaRango(rango(b)))[0]];
  return tirar.map((c) => c.id);
}

/** Hace jugar a los bots cuando les toca (con una pequeña pausa). */
export function tick(p, ahora = Date.now()) {
  if (!p.hasta || ahora < p.hasta) return false;
  p.hasta = null;
  if (p.fase === 'descarte') {
    p.jugadores.forEach((j, s) => { if ((j.bot || j.fuera) && !p.descartes4[s] && p.fase === 'descarte') descartar(p, s, descarteBot(p, s), ahora); });
    return true;
  }
  const s = quienActua(p);
  if (s == null || !(p.jugadores[s].bot || p.jugadores[s].fuera)) return false;
  const d = decidirBot(p, s);
  if (!d) return false;
  if (d.tipo === 'mus') mus(p, s, d.pide, ahora);
  else hablar(p, s, d, ahora);
  return true;
}

/** Quien abandona pasa a jugar como bot (el mus necesita a los cuatro). */
export function abandonar(p, id, ahora = Date.now()) {
  const j = p.jugadores.find((x) => x.id === id);
  if (!j || j.fuera || p.fase === 'fin') return;
  j.fuera = true;
  j.bot = true;
  anotar(p, `🚪 ${j.nombre} abandona: juega la máquina por él.`, 'malo');
  if (!p.listos.includes(j.asiento) && (p.fase === 'conteo' || p.fase === 'finJuego')) seguir(p, j.asiento, ahora);
  programarBot(p, ahora);
}

export function terminar(p) {
  if (p.fase === 'fin') return { ok: false, error: 'La partida ya ha terminado.' };
  const k = p.juegos[0] !== p.juegos[1] ? (p.juegos[0] > p.juegos[1] ? 0 : 1) : (p.puntos[0] >= p.puntos[1] ? 0 : 1);
  p.fase = 'fin';
  p.lance = null;
  p.fin = { ganadora: k, juegos: [...p.juegos], puntos: [...p.puntos], terminada: true, ganadores: [p.jugadores[k].id, p.jugadores[k + 2].id] };
  return { ok: true };
}

// ---------------------------------------------------------------- Vista
const publicas = (c) => ({ id: c.id, p: c.p, n: c.n });
const NOMBRE_RANGO = { 12: 'reyes', 11: 'caballos', 10: 'sotas', 7: 'sietes', 6: 'seises', 5: 'cincos', 4: 'cuatros', 1: 'ases' };
/** Cómo se llama lo que lleva una mano en un lance («Duples de reyes y sotas», «Juego 31», «Punto 27»…). */
export function jugadaDe(lance, mano) {
  if (lance === 'pares') {
    const pr = paresDe(mano);
    if (!pr) return 'Sin pares';
    const nom = (f) => NOMBRE_RANGO[ORDEN_GRANDE[ORDEN_GRANDE.length - f]];
    if (pr.tipo === 'duples') return pr.valor[0] === pr.valor[1] ? `Duples de ${nom(pr.valor[0])}` : `Duples de ${nom(pr.valor[0])} y ${nom(pr.valor[1])}`;
    return `${pr.tipo === 'medias' ? 'Medias' : 'Pareja'} de ${nom(pr.valor[0])}`;
  }
  const t = sumaJuego(mano);
  if (lance === 'juego') return t >= 31 ? `Juego ${t}` : `Sin juego (${t})`;
  if (lance === 'punto') return `Punto ${t}`;
  const orden = mano.map(rango).sort((a, b) => (lance === 'grande' ? fuerzaRango(b) - fuerzaRango(a) : fuerzaRango(a) - fuerzaRango(b)));
  return orden.map((r) => ({ 12: 'R', 11: 'C', 10: 'S', 1: 'A' }[r] || r)).join(' · ');
}
/** Resumen de la mano para el conteo: por cada lance, quién se enfrentó, quién ganó y qué se cobró. */
function resumenMano(p) {
  const orden = ['grande', 'chica', 'pares', p.resultados.punto ? 'punto' : 'juego'];
  return orden.map((l) => {
    const r = p.resultados[l] || null;
    const parts = l === 'pares' ? desdeMano(p).filter((s) => paresDe(p.cartas[s])) : l === 'juego' ? desdeMano(p).filter((s) => tieneJuego(p.cartas[s])) : desdeMano(p);
    const g = r && parts.length ? ganadorLance(p, l) : null;
    let rival = null;
    if (g != null) parts.forEach((s) => { if (pareja(s) !== pareja(g) && (rival == null || comparar(l, p.cartas[s], p.cartas[rival]) > 0)) rival = s; });
    const cobros = p.cobros.filter((c) => c.lance === l);
    return {
      lance: l, tipo: r?.tipo ?? null, total: r?.total ?? null, ganador: g, rival,
      jugadaGanador: g != null ? jugadaDe(l, p.cartas[g]) : null, jugadaRival: rival != null ? jugadaDe(l, p.cartas[rival]) : null,
      voces: p.voces[l] || [], cobros, puntos: [0, 1].map((k) => cobros.filter((c) => c.pareja === k).reduce((a, c) => a + (c.puntos || 0), 0))
    };
  });
}
export function vistaDe(p, id) {
  const yo = p.jugadores.find((j) => j.id === id) || null;
  const ensenar = p.fase === 'conteo' || p.fase === 'finJuego' || p.fase === 'fin';
  const L = p.lance;
  return {
    fase: p.fase,
    objetivo: p.objetivo, vacas: p.vacas, puntos: [...p.puntos], juegos: [...p.juegos], numMano: p.numMano, mano: p.mano,
    turno: quienActua(p),
    jugadores: p.jugadores.map((j, s) => ({
      id: j.id, nombre: j.nombre, bot: j.bot, fuera: j.fuera, asiento: s, pareja: pareja(s),
      nCartas: p.cartas[s].length, dicho: p.dichos[s]?.texto ?? null, dichoN: p.dichos[s]?.n ?? 0, dichoClase: p.dichos[s]?.clase ?? 'info',
      descartado: p.fase === 'descarte' ? Boolean(p.descartes4[s]) : null,
      cartas: ensenar || (yo && yo.asiento === s) ? p.cartas[s].map(publicas) : null,
      listo: p.listos.includes(s)
    })),
    yo: yo ? { id: yo.id, asiento: yo.asiento, pareja: pareja(yo.asiento), suma: sumaJuego(p.cartas[yo.asiento]), pares: paresDe(p.cartas[yo.asiento]), juego: tieneJuego(p.cartas[yo.asiento]) } : null,
    lance: L ? { nombre: L.nombre, participantes: L.participantes, propuesta: L.propuesta, cola: L.cola } : null,
    declaraciones: p.fase === 'lance' ? p.declaraciones : null,
    resultados: p.resultados,
    conteo: ensenar ? p.conteo : null,
    resumen: ensenar ? resumenMano(p) : null,
    revelado: p.revelado,
    voces: p.voces,
    log: p.log.slice(-14),
    fin: p.fin
  };
}
