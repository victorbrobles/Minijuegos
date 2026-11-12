// server/musavanzado/engine.js
// «Mus Avanzado»: motor puro (sin red). Se copia al cliente con `npm run sync:musavanzado`.
//
// Se juega individual (3-8) o por parejas (4 o 6) con la baraja española de 40 cartas, a 8 reyes: los treses
// valen como reyes y los doses como ases. Cada «bando» (un jugador o una pareja) suma puntos; gana quien llega
// antes al objetivo (o quien gana un órdago querido).
//
// Cada MANO: se reparten 5 cartas y se juegan las categorías en orden (grande, chica, pares, escalera, color y
// juego, o las que elija el anfitrión). Antes de cada categoría cada uno puede tirar de 0 a 5 cartas y robar otras
// tantas: la mano se conserva para la siguiente categoría, así que hay que elegir entre ir a por la actual o
// guardarse cartas. Luego se habla como en el mus: pasar, envidar lo que quieras u órdago; los demás quieren,
// suben, no quieren u órdago. Al acabar la mano se enseñan las cartas de cada categoría (tal y como estaban al
// cerrarse) de los que siguieron en la puja, y se cobra lance a lance con sus extras.

export const AJUSTES = { min: 3, max: 8, cartas: 5, segTurno: 45, segCambio: 40, envidoMin: 2, bomba: 2 };
export const OPCIONES = { modo: ['individual', 'parejas'], objetivo: [20, 30, 40] };
export const PALOS = ['oros', 'copas', 'espadas', 'bastos'];
export const NUMEROS = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
export const ORDEN_CATEGORIAS = ['grande', 'chica', 'pares', 'escalera', 'color', 'juego'];

export const CATEGORIAS = {
  grande: { nombre: 'Grande', e: '👑', desc: 'Gana la mano más alta, carta a carta: reyes (y treses), caballos, sotas, 7, 6…', extras: 'En paso: 1 punto para la mejor.' },
  chica: { nombre: 'Chica', e: '🐭', desc: 'Gana la mano más baja, carta a carta: ases (y doses), 4, 5, 6…', extras: 'En paso: 1 punto para la mejor.' },
  pares: { nombre: 'Pares', e: '👯', desc: 'Póker > full > duples > medias > pareja. A igualdad, las cartas más altas.', extras: 'Extras: pareja 1 · medias 2 · duples 3 · full 4 · póker 5.' },
  escalera: { nombre: 'Escalera', e: '🪜', desc: 'Más cartas seguidas en el orden A-4-5-6-7-S-C-R (sin vuelta). A igualdad, la más alta.', extras: 'Extras: escalera de 4 → 2 · de 5 → 5.' },
  color: { nombre: 'Color', e: '🎨', desc: 'Más cartas del mismo palo. A igualdad, las más altas de ese palo.', extras: 'Extras: 4 del mismo palo → 1 · las 5 → 5.' },
  juego: { nombre: 'Juego', e: '🎯', desc: 'Suma de las 5 cartas (figuras y treses 10, doses 1). Juego de 31 a 40: 31 > 32 > 40 > 37 > 36 > 35 > 34 > 33. Sin juego, punto (lo más cerca de 30). Más de 40: te pasas.', extras: 'Extras: la 31 → 3 · otro juego → 2 · ganar a punto → 1.' }
};

export const ESPECIALES = {
  comodines: { nombre: 'Comodines', e: '🃏', desc: 'Se añaden 2 comodines: valen como la carta que más te convenga en cada categoría.' },
  espejo: { nombre: 'Cartas espejo', e: '🪞', desc: 'Se añaden 2 espejos: copian la carta de tu mano que más te convenga.' },
  dobles: { nombre: 'Cartas dobles', e: '✌️', desc: 'Dos cartas de la baraja cuentan como dos cartas iguales.' },
  bombas: { nombre: 'Cartas bomba', e: '💣', desc: `Se añaden 2 bombas: no valen nada y quien la tenga al acabar la mano pierde ${AJUSTES.bomba} puntos.` },
  mutantes: { nombre: 'Cartas mutantes', e: '🧬', desc: 'Los cuatro cuatros cambian de número al azar en cada categoría.' },
  invertidas: { nombre: 'Ases y reyes invertidos', e: '🔃', desc: 'En la grande y la chica, los ases cuentan como reyes y los reyes como ases.' }
};

// ---------------------------------------------------------------- Cartas
const ORDEN = [1, 4, 5, 6, 7, 10, 11, 12]; // de menos a más (los treses son reyes y los doses, ases)
const ORDEN_JUEGO = [31, 32, 40, 37, 36, 35, 34, 33];
export const rango = (n) => (n === 3 ? 12 : n === 2 ? 1 : n);
const fuerza = (n, inv = false) => {
  let r = rango(n);
  if (inv) r = r === 1 ? 12 : r === 12 ? 1 : r;
  return ORDEN.indexOf(r) + 1; // 1 (as) … 8 (rey)
};
export const valorJuego = (n) => (rango(n) >= 10 ? 10 : rango(n));
const CORTO = { 1: 'A', 10: 'S', 11: 'C', 12: 'R' };
const corto = (r) => CORTO[r] || String(r);
const PLURAL = { 12: 'reyes', 11: 'caballos', 10: 'sotas', 7: 'sietes', 6: 'seises', 5: 'cincos', 4: 'cuatros', 1: 'ases' };
const deFuerza = (f) => ORDEN[f - 1];

const barajar = (l, rng) => { const b = [...l]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const lexico = (a, b) => { for (let i = 0; i < Math.max(a.length, b.length); i++) { const d = (a[i] ?? 0) - (b[i] ?? 0); if (d) return d; } return 0; };

/** Baraja: 40 cartas españolas más las especiales que haya elegido el anfitrión. */
export function crearBaraja(esp = {}, rng = Math.random) {
  const b = [];
  let id = 0;
  PALOS.forEach((p) => NUMEROS.forEach((n) => b.push({ id: ++id, p, n, esp: esp.mutantes && n === 4 ? 'mutante' : null })));
  if (esp.dobles) barajar(b.filter((x) => !x.esp), rng).slice(0, 2).forEach((x) => { x.esp = 'doble'; });
  for (const [k, tipo] of [['comodines', 'comodin'], ['bombas', 'bomba'], ['espejo', 'espejo']]) {
    if (esp[k]) for (let i = 0; i < 2; i++) b.push({ id: ++id, p: null, n: 0, esp: tipo });
  }
  return b;
}

// ---------------------------------------------------------------- Evaluación
/** Clave comparable (mayor = mejor) de unas cartas concretas { n, p } en una categoría. */
function clave(cat, cs, inv) {
  switch (cat) {
    case 'grande': { const f = cs.map((c) => fuerza(c.n, inv)).sort((a, b) => b - a); while (f.length < 5) f.push(0); return f; }
    case 'chica': { const f = cs.map((c) => fuerza(c.n, inv)).sort((a, b) => a - b); while (f.length < 5) f.push(99); return f.map((x) => -x); }
    case 'pares': {
      const cuenta = {};
      cs.forEach((c) => { const f = fuerza(c.n); cuenta[f] = (cuenta[f] || 0) + 1; });
      const g = Object.entries(cuenta).map(([f, k]) => ({ f: Number(f), k })).sort((a, b) => b.k - a.k || b.f - a.f);
      if (!g.length || g[0].k < 2) return [0];
      if (g[0].k >= 4) return [5, g[0].f];
      if (g[0].k === 3) return g[1]?.k >= 2 ? [4, g[0].f, g[1].f] : [2, g[0].f];
      if (g[1]?.k === 2) return [3, Math.max(g[0].f, g[1].f), Math.min(g[0].f, g[1].f)];
      return [1, g[0].f];
    }
    case 'escalera': {
      const s = new Set(cs.map((c) => fuerza(c.n)));
      let mejor = [0, 0];
      for (let f = 1; f <= 8; f++) {
        let l = 0;
        while (s.has(f + l)) l++;
        if (l && lexico([l, f + l - 1], mejor) > 0) mejor = [l, f + l - 1];
      }
      return mejor;
    }
    case 'color': {
      let mejor = [0];
      PALOS.forEach((p) => {
        const f = cs.filter((c) => c.p === p).map((c) => fuerza(c.n)).sort((a, b) => b - a);
        const k = [f.length, ...f];
        while (k.length < 6) k.push(0);
        if (lexico(k, mejor) > 0) mejor = k;
      });
      return mejor;
    }
    case 'juego': {
      const t = cs.reduce((a, c) => a + valorJuego(c.n), 0);
      if (t >= 31 && t <= 40) return [2, -ORDEN_JUEGO.indexOf(t), t];
      if (t <= 30) return [1, t, t];
      return [0, -t, t];
    }
    default: return [0];
  }
}

const SUSTITUTOS = PALOS.flatMap((p) => ORDEN.map((n) => ({ n, p })));
function subconjuntos(l, k) {
  if (l.length <= k) return [l];
  const out = [];
  const rec = (i, acc) => { if (acc.length === k) { out.push(acc); return; } if (l.length - i < k - acc.length) return; rec(i + 1, [...acc, l[i]]); rec(i + 1, acc); };
  rec(0, []);
  return out;
}

/** Lo mejor que se puede hacer con una mano en una categoría (con comodines, espejos, dobles y bombas). */
export function evaluar(mano, cat, ctx = {}) {
  const fijas = mano.filter((c) => c.p && c.esp !== 'bomba').flatMap((c) => (c.esp === 'doble' ? [c, c] : [c])).map((c) => ({ n: c.n, p: c.p }));
  const comodines = mano.filter((c) => c.esp === 'comodin').length;
  const espejos = mano.filter((c) => c.esp === 'espejo').length;
  let mejor = null;
  const probar = (base, qc, qe) => {
    if (qc) { SUSTITUTOS.forEach((s) => probar([...base, s], qc - 1, qe)); return; }
    if (qe) {
      const vistos = new Set();
      fijas.forEach((t) => { const k = `${t.n}${t.p}`; if (!vistos.has(k)) { vistos.add(k); probar([...base, t], 0, qe - 1); } });
      if (!fijas.length) probar(base, 0, 0);
      return;
    }
    subconjuntos(base, 5).forEach((cs) => {
      const k = clave(cat, cs, ctx.invertidas);
      if (!mejor || lexico(k, mejor.clave) > 0) mejor = { clave: k, cartas: cs };
    });
  };
  probar(fijas, comodines, espejos);
  return mejor || { clave: clave(cat, [], ctx.invertidas), cartas: [] };
}

/** Puntos extra de una jugada (lo que cobra cada miembro del bando ganador). */
export function extra(cat, k) {
  if (cat === 'pares') return [0, 1, 2, 3, 4, 5][k[0]] || 0;
  if (cat === 'escalera') return k[0] >= 5 ? 5 : k[0] === 4 ? 2 : 0;
  if (cat === 'color') return k[0] >= 5 ? 5 : k[0] === 4 ? 1 : 0;
  if (cat === 'juego') return k[0] === 2 ? (k[2] === 31 ? 3 : 2) : 0;
  return 0;
}
const NOMBRE_EXTRA = {
  pares: (k) => ['', 'pareja', 'medias', 'duples', 'full', 'póker'][k[0]],
  escalera: (k) => `escalera de ${k[0]}`,
  color: (k) => `color de ${k[0]}`,
  juego: (k) => (k[2] === 31 ? 'la 31' : `juego de ${k[2]}`)
};

/** Cómo se llama una jugada: «Duples de reyes y sotas», «Escalera de 4 (4 a 7)», «Juego 31»… */
export function jugadaTexto(cat, ev, inv = false) {
  const k = ev.clave;
  const cs = ev.cartas;
  switch (cat) {
    case 'grande': case 'chica': {
      const l = [...cs].sort((a, b) => (cat === 'grande' ? fuerza(b.n, inv) - fuerza(a.n, inv) : fuerza(a.n, inv) - fuerza(b.n, inv)));
      return l.length ? l.map((c) => corto(rango(c.n))).join(' · ') : 'Sin cartas';
    }
    case 'pares': {
      const nom = (f) => PLURAL[deFuerza(f)];
      return ['Sin pares', `Pareja de ${nom(k[1])}`, `Medias de ${nom(k[1])}`, `Duples de ${nom(k[1])} y ${nom(k[2])}`, `Full de ${nom(k[1])} y ${nom(k[2])}`, `Póker de ${nom(k[1])}`][k[0]];
    }
    case 'escalera': return k[0] >= 2 ? `${k[0]} seguidas (${corto(deFuerza(k[1] - k[0] + 1))} a ${corto(deFuerza(k[1]))})` : 'Sin escalera';
    case 'color': {
      const palo = PALOS.find((p) => cs.filter((c) => c.p === p).length === k[0]);
      return `${k[0]} de ${palo || '—'}`;
    }
    case 'juego': return k[0] === 2 ? `Juego ${k[2]}` : k[0] === 1 ? `Punto ${k[2]}` : `Se pasa (${k[2]})`;
    default: return '';
  }
}

// ---------------------------------------------------------------- Partida
const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const bandoDe = (p, id) => p.bandos.find((b) => b.miembros.includes(id));
const bando = (p, bid) => p.bandos.find((b) => b.id === bid);
const vivos = (p, b) => b.miembros.filter((m) => !jug(p, m).fuera);
const bandosVivos = (p) => p.bandos.filter((b) => vivos(p, b).length);
const nombre = (p, id) => jug(p, id)?.nombre ?? '¿?';
const reloj = (p, ahora, s) => (p.sinReloj ? null : ahora + s * 1000);
const catActual = (p) => p.categorias[p.idx];

/** reglas: { modo, objetivo, categorias: [...], especiales: { comodines, … }, sinReloj } */
export function crearPartida(jugadores, reglas = {}, ahora = Date.now(), rng = Math.random) {
  const modo = reglas.modo === 'parejas' ? 'parejas' : 'individual';
  const n = jugadores.length;
  if (n < AJUSTES.min || n > AJUSTES.max) throw new Error(`Se juega de ${AJUSTES.min} a ${AJUSTES.max} jugadores.`);
  if (modo === 'parejas' && n !== 4 && n !== 6) throw new Error('Por parejas tenéis que ser 4 o 6 jugadores.');
  const cats = ORDEN_CATEGORIAS.filter((c) => !Array.isArray(reglas.categorias) || reglas.categorias.includes(c));
  if (cats.length < 3) throw new Error('Elige al menos 3 categorías.');
  // Por parejas, los compañeros se sientan alternados: 1-3 / 2-4 (o 1-4 / 2-5 / 3-6)
  const nb = modo === 'parejas' ? n / 2 : n;
  const p = {
    modo,
    objetivo: OPCIONES.objetivo.includes(Number(reglas.objetivo)) ? Number(reglas.objetivo) : 30,
    especiales: Object.fromEntries(Object.keys(ESPECIALES).map((k) => [k, Boolean(reglas.especiales?.[k])])),
    categorias: cats,
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, fuera: false })),
    bandos: Array.from({ length: nb }, (_, i) => ({ id: i + 1, miembros: modo === 'parejas' ? [jugadores[i].id, jugadores[i + nb].id] : [jugadores[i].id], puntos: 0, turnoMiembro: 0 })),
    numMano: 0, mano: Math.floor(rng() * n), mazo: [], descartes: [], manos: {}, idx: 0,
    fase: 'cambio', hasta: null, cambios: {}, L: null, cerradas: [], cobros: [], ganador: null, fin: null,
    log: [], nlog: 0, sinReloj: Boolean(reglas.sinReloj)
  };
  Object.defineProperty(p, 'rng', { value: rng, enumerable: false, writable: true });
  nuevaMano(p, ahora);
  return p;
}
const azar = (p) => (typeof p.rng === 'function' ? p.rng() : Math.random());
const mezclar = (p, l) => barajar(l, () => azar(p));
function anotar(p, texto, tipo = 'info') { p.nlog += 1; p.log.push({ n: p.nlog, texto, tipo }); if (p.log.length > 60) p.log.shift(); }

/** Orden de los jugadores vivos empezando por la mano (desempata a favor del más cercano). */
function ordenJugadores(p) {
  const n = p.jugadores.length;
  return Array.from({ length: n }, (_, k) => p.jugadores[(p.mano + k) % n]).filter((j) => !j.fuera).map((j) => j.id);
}
function ordenBandos(p) {
  const out = [];
  ordenJugadores(p).forEach((id) => { const b = bandoDe(p, id).id; if (!out.includes(b)) out.push(b); });
  return out;
}

function robar(p, k) {
  const c = [];
  for (let i = 0; i < k; i++) {
    if (!p.mazo.length && p.descartes.length) { p.mazo = mezclar(p, p.descartes); p.descartes = []; }
    if (!p.mazo.length) break;
    c.push(p.mazo.pop());
  }
  return c;
}

function nuevaMano(p, ahora) {
  p.numMano += 1;
  if (p.numMano > 1) {
    const n = p.jugadores.length;
    do { p.mano = (p.mano + 1) % n; } while (p.jugadores[p.mano].fuera);
  } else {
    while (p.jugadores[p.mano].fuera) p.mano = (p.mano + 1) % p.jugadores.length;
  }
  p.mazo = mezclar(p, crearBaraja(p.especiales, () => azar(p)));
  p.descartes = [];
  p.manos = {};
  ordenJugadores(p).forEach((id) => { p.manos[id] = robar(p, AJUSTES.cartas); });
  p.cerradas = [];
  p.cobros = [];
  p.idx = 0;
  anotar(p, `— Mano ${p.numMano}: es mano ${nombre(p, p.jugadores[p.mano].id)} —`);
  empezarCategoria(p, ahora);
}

function empezarCategoria(p, ahora) {
  if (p.especiales.mutantes) {
    const todas = [...Object.values(p.manos).flat(), ...p.mazo, ...p.descartes];
    todas.filter((c) => c.esp === 'mutante').forEach((c) => { c.n = NUMEROS[Math.floor(azar(p) * NUMEROS.length)]; });
  }
  p.fase = 'cambio';
  p.cambios = {};
  p.L = null;
  p.hasta = reloj(p, ahora, AJUSTES.segCambio);
}

/** Tira las cartas indicadas (0 a 5) y roba otras tantas. Las que te quedas siguen en la siguiente categoría. */
export function cambiar(p, id, ids = [], ahora = Date.now()) {
  if (p.fase !== 'cambio') return { ok: false, error: 'Ahora no se cambian cartas.' };
  const mano = p.manos[id];
  if (!mano || jug(p, id)?.fuera) return { ok: false, error: 'No juegas esta mano.' };
  if (p.cambios[id] !== undefined) return { ok: false, error: 'Ya has cambiado.' };
  const quitar = new Set((ids || []).map(Number));
  const fuera = mano.filter((c) => quitar.has(c.id)).slice(0, AJUSTES.cartas);
  const nuevas = robar(p, fuera.length);
  // Si no queda nada en el mazo ni en los descartes, recuperas tus propias cartas
  const propias = mezclar(p, fuera);
  while (nuevas.length < fuera.length) nuevas.push(propias.pop());
  const recuperadas = new Set(nuevas.map((c) => c.id));
  p.descartes.push(...fuera.filter((c) => !recuperadas.has(c.id)));
  p.manos[id] = [...mano.filter((c) => !quitar.has(c.id)), ...nuevas];
  p.cambios[id] = fuera.length;
  if (ordenJugadores(p).every((j) => p.cambios[j] !== undefined)) abrirApuestas(p, ahora);
  return { ok: true, cambiadas: fuera.length };
}

function abrirApuestas(p, ahora) {
  const orden = ordenBandos(p);
  p.fase = 'apuestas';
  p.L = { cat: catActual(p), orden, activos: [...orden], pendientes: [...orden], apuesta: null, voces: [] };
  p.hasta = reloj(p, ahora, AJUSTES.segTurno);
}

/** Bando al que le toca hablar. */
export const turnoBando = (p) => (p.fase === 'apuestas' ? p.L.pendientes[0] ?? null : null);
/** Jugador que habla por su bando cuando hay un solo móvil (en parejas se alternan). */
export function quienHabla(p) {
  const bid = turnoBando(p);
  if (bid == null) return null;
  const b = bando(p, bid);
  const v = vivos(p, b);
  return v[b.turnoMiembro % v.length];
}
/** Online, en parejas, puede hablar cualquiera de los dos. */
export function puedeHablar(p, id) {
  const bid = turnoBando(p);
  return bid != null && !jug(p, id)?.fuera && bandoDe(p, id)?.id === bid;
}
const otros = (p, bid) => {
  const L = p.L;
  const i = L.orden.indexOf(bid);
  return [...L.orden.slice(i + 1), ...L.orden.slice(0, i)].filter((x) => x !== bid && L.activos.includes(x));
};

/**
 * accion: { tipo: 'paso' | 'envido' | 'quiero' | 'noquiero' | 'ordago', cantidad }
 * Sin envite: paso, envido (lo que quieras, mínimo 2) u órdago. Con envite: quiero, no quiero, subir (envido) u órdago.
 */
export function hablar(p, id, accion = {}, ahora = Date.now()) {
  if (p.fase !== 'apuestas') return { ok: false, error: 'Ahora no se habla.' };
  if (!puedeHablar(p, id)) return { ok: false, error: 'No es tu turno.' };
  const L = p.L;
  const bid = L.pendientes[0];
  const tipo = accion.tipo;
  const tope = p.objetivo;
  const cant = Math.max(1, Math.min(tope, Math.floor(Number(accion.cantidad) || 0)));
  const voz = (texto, clase) => L.voces.push({ id, bando: bid, texto, clase });
  const pr = L.apuesta;
  if (!pr) {
    if (tipo === 'paso') { voz('Paso', 'paso'); L.pendientes.shift(); }
    else if (tipo === 'envido') {
      if (cant < AJUSTES.envidoMin) return { ok: false, error: `El envite mínimo es de ${AJUSTES.envidoMin}.` };
      L.apuesta = { total: cant, previo: 1, por: bid, porJugador: id, ordago: false };
      L.pendientes = otros(p, bid);
      voz(`Envido ${cant}`, 'envido');
    } else if (tipo === 'ordago') {
      L.apuesta = { total: null, previo: 1, por: bid, porJugador: id, ordago: true };
      L.pendientes = otros(p, bid);
      voz('¡Órdago!', 'ordago');
    } else return { ok: false, error: 'Puedes pasar, envidar o echar un órdago.' };
  } else if (tipo === 'quiero') { voz('Quiero', 'quiero'); L.pendientes.shift(); }
  else if (tipo === 'noquiero') { voz('No quiero', 'noquiero'); L.activos = L.activos.filter((x) => x !== bid); L.pendientes.shift(); }
  else if (tipo === 'envido' || tipo === 'ordago') {
    if (pr.ordago) return { ok: false, error: 'A un órdago solo se puede querer o no querer.' };
    const ord = tipo === 'ordago';
    L.apuesta = { total: ord ? null : pr.total + cant, previo: pr.total, por: bid, porJugador: id, ordago: ord };
    L.pendientes = otros(p, bid);
    voz(ord ? '¡Órdago!' : `${cant} más (${pr.total + cant})`, ord ? 'ordago' : 'envido');
  } else return { ok: false, error: 'Quiero, no quiero, sube o echa un órdago.' };
  const b = bando(p, bid);
  b.turnoMiembro += 1;
  if (!L.pendientes.length) cerrarLance(p, ahora);
  else p.hasta = reloj(p, ahora, AJUSTES.segTurno);
  return { ok: true };
}

/** Se acaba de hablar en una categoría: se guardan las cartas de los que siguen y se pasa a la siguiente. */
function cerrarLance(p, ahora) {
  const L = p.L;
  const pr = L.apuesta;
  let tipo = 'paso';
  if (pr) tipo = L.activos.length <= 1 ? 'rechazado' : pr.ordago ? 'ordago' : 'querido';
  // Si el que envidó se ha ido y no queda nadie en el lance, la categoría queda en paso entre los que siguen
  if (!L.activos.length) tipo = 'paso';
  const participantes = L.activos.length ? L.activos : ordenBandos(p);
  const cartas = {};
  participantes.forEach((bid) => vivos(p, bando(p, bid)).forEach((m) => { cartas[m] = p.manos[m].map((c) => ({ ...c })); }));
  const cl = { cat: L.cat, tipo, total: pr?.total ?? null, previo: pr?.previo ?? null, por: pr?.por ?? null, porJugador: pr?.porJugador ?? null, participantes: [...participantes], cartas, voces: L.voces, orden: ordenJugadores(p) };
  p.cerradas.push(cl);
  const nom = CATEGORIAS[L.cat].nombre;
  if (tipo === 'rechazado') {
    anotar(p, `${nom}: no quieren. ${nombre(p, pr.porJugador)} se lleva ${pr.previo}.`);
    sumar(p, pr.por, pr.previo, L.cat, pr.ordago ? 'órdago no querido' : pr.previo === 1 ? 'envite no querido' : `envite no querido (había ${pr.previo})`);
  } else if (tipo === 'ordago') {
    const r = resolver(p, cl);
    const g = bandoDe(p, r.ganador).id;
    p.cobros.push({ cat: L.cat, bando: g, puntos: null, texto: 'órdago querido: gana la partida' });
    bando(p, g).puntos = Math.max(bando(p, g).puntos, p.objetivo);
    p.ganador = g;
    anotar(p, `🔥 Órdago a la ${nom.toLowerCase()} querido: lo gana ${nombre(p, r.ganador)}.`, 'bueno');
  } else anotar(p, tipo === 'paso' ? `${nom}: en paso.` : `${nom}: ${pr.total} querido.`);
  p.L = null;
  if (p.ganador != null || p.idx + 1 >= p.categorias.length) contar(p);
  else { p.idx += 1; empezarCategoria(p, ahora); }
}

function sumar(p, bid, n, cat, texto, jugador = null) {
  if (!n || p.ganador != null) return;
  const b = bando(p, bid);
  b.puntos = Math.max(0, b.puntos + n);
  p.cobros.push({ cat, bando: bid, puntos: n, texto, jugador });
  if (b.puntos >= p.objetivo) p.ganador = bid;
}

/** Quién gana una categoría cerrada (y su mejor rival), con la jugada de cada participante. */
function resolver(p, cl) {
  const inv = cl.cat === 'grande' || cl.cat === 'chica' ? p.especiales.invertidas : false;
  const jugadas = {};
  Object.entries(cl.cartas).forEach(([id, cs]) => { const ev = evaluar(cs, cl.cat, { invertidas: inv }); jugadas[id] = { ...ev, texto: jugadaTexto(cl.cat, ev, inv) }; });
  const ids = cl.orden.filter((id) => jugadas[id]);
  let ganador = null;
  ids.forEach((id) => { if (ganador == null || lexico(jugadas[id].clave, jugadas[ganador].clave) > 0) ganador = id; });
  let rival = null;
  ids.forEach((id) => { if (bandoDe(p, id).id !== bandoDe(p, ganador).id && (rival == null || lexico(jugadas[id].clave, jugadas[rival].clave) > 0)) rival = id; });
  return { ganador, rival, jugadas };
}

/** Fin de la mano: se cobra categoría a categoría (si nadie ha ganado ya la partida). */
function contar(p) {
  for (const cl of p.cerradas) {
    if (p.ganador != null) break;
    if (cl.tipo === 'ordago') continue;
    const r = resolver(p, cl);
    if (r.ganador == null) continue; // Nadie siguió en la categoría (p. ej. el que envidó abandonó)
    const g = bandoDe(p, r.ganador).id;
    if (cl.tipo === 'querido') sumar(p, g, cl.total, cl.cat, `envite querido de ${cl.total}`);
    if (cl.tipo === 'paso' && (cl.cat === 'grande' || cl.cat === 'chica')) sumar(p, g, 1, cl.cat, 'en paso');
    if (CATEGORIAS[cl.cat] && cl.cat !== 'grande' && cl.cat !== 'chica') {
      let alguno = false;
      vivos(p, bando(p, g)).filter((m) => r.jugadas[m]).forEach((m) => {
        const k = r.jugadas[m].clave;
        const n = extra(cl.cat, k);
        if (n) { alguno = true; sumar(p, g, n, cl.cat, NOMBRE_EXTRA[cl.cat](k), m); }
      });
      if (cl.cat === 'juego' && !alguno && r.jugadas[r.ganador].clave[0] === 1) sumar(p, g, 1, cl.cat, `punto (${r.jugadas[r.ganador].clave[2]})`, r.ganador);
    }
  }
  // Bombas: quien tenga una al acabar la mano pierde puntos
  if (p.especiales.bombas && p.ganador == null) {
    ordenJugadores(p).forEach((id) => {
      const nb = (p.manos[id] || []).filter((c) => c.esp === 'bomba').length;
      if (!nb) return;
      const b = bandoDe(p, id);
      const q = Math.min(b.puntos, nb * AJUSTES.bomba);
      if (q) { b.puntos -= q; p.cobros.push({ cat: 'bomba', bando: b.id, puntos: -q, texto: `bomba en la mano`, jugador: id }); }
    });
  }
  p.fase = 'conteo';
  p.hasta = null;
  if (p.ganador != null) anotar(p, `🏆 ¡${nombreBando(p, p.ganador)} gana la partida!`, 'bueno');
}
const nombreBando = (p, bid) => vivos(p, bando(p, bid)).map((m) => nombre(p, m)).join(' y ') || bando(p, bid).miembros.map((m) => nombre(p, m)).join(' y ');

/** El anfitrión pasa del conteo a la siguiente mano (o al final si alguien ha ganado). */
export function siguiente(p, ahora = Date.now()) {
  if (p.fase !== 'conteo') return { ok: false, error: 'La mano no ha terminado.' };
  if (p.ganador != null || bandosVivos(p).length < 2) return terminar(p);
  nuevaMano(p, ahora);
  return { ok: true };
}

export function terminar(p) {
  if (p.fase === 'fin') return { ok: false, error: 'La partida ya ha terminado.' };
  p.fase = 'fin';
  p.hasta = null;
  p.L = null;
  const tabla = p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, fuera: j.fuera, bando: bandoDe(p, j.id).id, puntos: bandoDe(p, j.id).puntos }))
    .sort((a, b) => (a.fuera - b.fuera) || b.puntos - a.puntos);
  let puesto = 0;
  tabla.forEach((j, k) => { if (k === 0 || j.puntos !== tabla[k - 1].puntos) puesto = k + 1; j.puesto = puesto; });
  const enJuego = tabla.filter((j) => !j.fuera);
  const max = enJuego.length ? Math.max(...enJuego.map((j) => j.puntos)) : 0;
  const ganadores = p.ganador != null ? vivos(p, bando(p, p.ganador)) : max > 0 ? enJuego.filter((j) => j.puntos === max).map((j) => j.id) : [];
  p.fin = { tabla, ganadores, max, terminada: p.ganador == null };
  return { ok: true };
}

/** Relojes (online): quien no cambia se queda sus cartas; quien no habla pasa (o no quiere). */
export function tick(p, ahora = Date.now()) {
  if (!p.hasta || ahora < p.hasta) return false;
  if (p.fase === 'cambio') {
    ordenJugadores(p).filter((id) => p.cambios[id] === undefined).forEach((id) => { if (p.fase === 'cambio') cambiar(p, id, [], ahora); });
    return true;
  }
  if (p.fase === 'apuestas') { hablar(p, quienHabla(p), { tipo: p.L.apuesta ? 'noquiero' : 'paso' }, ahora); return true; }
  return false;
}

export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id);
  if (!j || j.fuera || p.fase === 'fin') return;
  j.fuera = true;
  anotar(p, `🚪 ${j.nombre} abandona la partida.`, 'malo');
  if (bandosVivos(p).length < 2) { terminar(p); return; }
  const b = bandoDe(p, id);
  if (p.fase === 'cambio') {
    delete p.cambios[id];
    if (ordenJugadores(p).every((x) => p.cambios[x] !== undefined)) abrirApuestas(p, ahora);
    return;
  }
  if (p.fase === 'apuestas' && !vivos(p, b).length) {
    const L = p.L;
    L.activos = L.activos.filter((x) => x !== b.id);
    L.pendientes = L.pendientes.filter((x) => x !== b.id);
    L.orden = L.orden.filter((x) => x !== b.id);
    if (!L.pendientes.length) cerrarLance(p, ahora);
  }
}

// ---------------------------------------------------------------- Vista
const publica = (c) => ({ id: c.id, p: c.p, n: c.n, esp: c.esp });
/** Resumen de la mano para el conteo: por categoría, quién siguió, sus cartas, quién ganó y qué se cobró. */
function resumen(p) {
  return p.cerradas.map((cl) => {
    const r = resolver(p, cl);
    const cobros = p.cobros.filter((c) => c.cat === cl.cat);
    return {
      cat: cl.cat, tipo: cl.tipo, total: cl.total, previo: cl.previo, por: cl.por, porJugador: cl.porJugador, voces: cl.voces,
      participantes: cl.orden.filter((id) => cl.cartas[id]).map((id) => ({ id, bando: bandoDe(p, id).id, cartas: cl.cartas[id].map(publica), jugada: r.jugadas[id].texto })),
      ganador: cl.tipo === 'rechazado' ? cl.porJugador : r.ganador, rival: cl.tipo === 'rechazado' ? null : r.rival,
      cobros, puntos: Object.fromEntries(p.bandos.map((b) => [b.id, cobros.filter((c) => c.bando === b.id).reduce((a, c) => a + (c.puntos || 0), 0)]))
    };
  });
}

export function vistaDe(p, id) {
  const yo = jug(p, id);
  const miBando = yo ? bandoDe(p, id) : null;
  const L = p.L;
  const abierto = p.fase === 'conteo' || p.fase === 'fin';
  const cat = catActual(p);
  return {
    fase: p.fase, modo: p.modo, objetivo: p.objetivo, numMano: p.numMano, categorias: p.categorias, idx: p.idx, especiales: p.especiales,
    hasta: p.hasta, segundos: p.fase === 'cambio' ? AJUSTES.segCambio : AJUSTES.segTurno,
    mano: p.jugadores[p.mano]?.id ?? null,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, fuera: j.fuera, bando: bandoDe(p, j.id).id, puntos: bandoDe(p, j.id).puntos, cambio: p.cambios[j.id] ?? null })),
    bandos: p.bandos.map((b) => ({ id: b.id, miembros: b.miembros, puntos: b.puntos, activo: L ? L.activos.includes(b.id) : true })),
    categoria: cat ? { id: cat, ...CATEGORIAS[cat] } : null,
    yo: yo ? {
      id, bando: miBando.id, mano: (p.manos[id] || []).map(publica), cambio: p.cambios[id] ?? null,
      companero: p.modo === 'parejas' ? miBando.miembros.find((m) => m !== id) : null,
      // Lo que llevas ahora en cada categoría, para decidir qué guardas
      jugadas: Object.fromEntries(p.categorias.map((c) => {
        const inv = (c === 'grande' || c === 'chica') && p.especiales.invertidas;
        return [c, jugadaTexto(c, evaluar(p.manos[id] || [], c, { invertidas: inv }), inv)];
      }))
    } : null,
    lance: L ? { cat: L.cat, apuesta: L.apuesta, voces: L.voces, activos: L.activos, turno: L.pendientes[0] ?? null } : null,
    habla: quienHabla(p),
    cerradas: p.cerradas.map((cl) => ({ cat: cl.cat, tipo: cl.tipo, total: cl.total })),
    resumen: abierto ? resumen(p) : null,
    bombas: abierto ? p.cobros.filter((c) => c.cat === 'bomba') : [],
    ganador: p.ganador,
    log: p.log.slice(-14),
    fin: p.fin
  };
}
