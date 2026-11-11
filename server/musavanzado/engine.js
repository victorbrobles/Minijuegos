// server/musavanzado/engine.js
// «Mus Avanzado»: motor puro (sin red). Se copia al cliente con `npm run sync:musavanzado`.
//
// Fases: 'pacto' (todos aceptan modificadores, reglas y categorías) → por cada categoría:
// 'cambio' (descartes secretos) → 'apuestas' (anunciar/subir, pasar o desafiar) → 'revelacion' → … → 'fin'.
// Se juega individual (4-8) o por parejas (4 o 6): cada «bando» es un jugador o una pareja con fichas compartidas.
// Las afirmaciones pueden ser falsas: si nadie te desafía, te llevas el bote igual.

export const AJUSTES = { min: 4, max: 8, cartas: 5, ante: 1, segTurno: 45, segCambio: 30, bomba: 2, subidaMax: 3, subidaLibre: 5 };
export const OPCIONES = { modo: ['individual', 'parejas'], fichas: [15, 20, 30] };
export const PALOS = ['oros', 'copas', 'espadas', 'bastos'];
export const ICONO_PALO = { oros: '🪙', copas: '🏆', espadas: '🗡️', bastos: '🪵' };
export const NOMBRE_RANGO = { 1: 'As', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: 'Sota (10)', 9: 'Caballo (11)', 10: 'Rey (12)' };
export const CORTO_RANGO = { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '10', 9: '11', 10: '12' };

export const CATEGORIAS = {
  grande: { nombre: 'La grande', e: '👑', desc: 'Tener la carta más alta.', niveles: ['Un 5 o más', 'Un 6 o más', 'Un 7 o más', 'Una sota (10) o más', 'Un caballo (11) o más', 'Un rey (12)', 'Dos reyes', 'Tres reyes o más'] },
  parejas: { nombre: 'Parejas', e: '👯', desc: 'Parejas, dobles parejas, tríos, full o póker.', niveles: ['Una pareja', 'Doble pareja', 'Trío', 'Full (trío y pareja)', 'Póker'] },
  escalera: { nombre: 'Escalera', e: '🪜', desc: 'La secuencia de cartas seguidas más larga (… 6, 7, 10, 11, 12: la sota va justo después del 7).', niveles: ['Dos seguidas', 'Tres seguidas', 'Cuatro seguidas', 'Cinco seguidas'] },
  colores: { nombre: 'Colores', e: '🎨', desc: 'Reunir cartas del mismo palo.', niveles: ['Dos del mismo palo', 'Tres del mismo palo', 'Cuatro del mismo palo', 'Cinco del mismo palo'] },
  suma: { nombre: 'La suma', e: '➕', desc: 'Que tus cartas sumen lo más cerca posible del objetivo (las figuras valen 10).', niveles: ['A 8 o menos', 'A 5 o menos', 'A 3 o menos', 'A 1 o menos', 'Exacto'] },
  pequena: { nombre: 'La pequeña', e: '🐜', desc: 'Que tus tres cartas más bajas sumen lo menos posible (figuras = 10).', niveles: ['12 o menos', '9 o menos', '7 o menos', '5 o menos', 'Tres ases'] },
  exactitud: { nombre: 'Exactitud', e: '🎯', desc: 'Cumplir los tres requisitos anunciados al empezar la categoría.', niveles: ['Uno de los tres', 'Dos de los tres', 'Los tres'], extra: true },
  caos: { nombre: 'El caos', e: '🌀', desc: 'Una regla rara, distinta cada vez.', niveles: ['Dos', 'Tres', 'Cuatro', 'Cinco'], extra: true }
};
export const CATEGORIAS_NORMALES = ['grande', 'parejas', 'escalera', 'colores', 'suma', 'pequena'];

export const MODIFICADORES = {
  comodines: { nombre: 'Comodines', e: '🃏', desc: 'Se añaden 2 comodines: valen como la carta que más te convenga.' },
  invertidas: { nombre: 'Ases y reyes invertidos', e: '🔃', desc: 'En la grande, la pequeña y la suma, el as vale como un rey y el rey como un as.' },
  dobles: { nombre: 'Cartas dobles', e: '✌️', desc: 'Dos cartas de la baraja cuentan como dos cartas iguales.' },
  bombas: { nombre: 'Cartas bomba', e: '💣', desc: `Se añaden 2 bombas: no valen nada y quien la tenga al revelar pierde ${2} fichas.` },
  mutantes: { nombre: 'Cartas mutantes', e: '🧬', desc: 'Los cuatro cuatros cambian de valor al azar en cada categoría.' },
  espejo: { nombre: 'Cartas espejo', e: '🪞', desc: 'Se añaden 2 espejos: copian la carta de tu mano que más te convenga.' }
};
export const REGLAS_ESPECIALES = {
  faroldoble: { nombre: 'Farol caro', e: '🤥', desc: 'Si te pillan mintiendo, pagas además tu apuesta a quien te desafió.' },
  intercambio3: { nombre: 'Cambio generoso', e: '🔄', desc: 'Se pueden cambiar hasta 3 cartas (normalmente 2).' },
  subidalibre: { nombre: 'Subidas grandes', e: '📈', desc: `Se puede subir hasta ${5} fichas de golpe (normalmente 3).` }
};

const EXACTITUD = [
  ['Un as', (c) => c.some((x) => x.r === 1)], ['Un rey', (c) => c.some((x) => x.r === 10)], ['Una figura', (c) => c.some((x) => x.r >= 8)],
  ['Un siete', (c) => c.some((x) => x.r === 7)], ['Dos cartas de oros', (c) => c.filter((x) => x.p === 'oros').length >= 2],
  ['Una carta de espadas', (c) => c.some((x) => x.p === 'espadas')], ['Una pareja', (c) => maxRepe(c) >= 2], ['Una carta de copas', (c) => c.some((x) => x.p === 'copas')],
  ['Un cinco o un seis', (c) => c.some((x) => x.r === 5 || x.r === 6)]
];
const CAOS = {
  impares: { nombre: 'Cartas impares (1, 3, 5, 7)', f: (c) => c.filter((x) => x.r <= 7 && x.r % 2 === 1).length },
  pares: { nombre: 'Cartas pares (2, 4, 6)', f: (c) => c.filter((x) => x.r <= 7 && x.r % 2 === 0).length },
  figuras: { nombre: 'Figuras (sota, caballo, rey)', f: (c) => c.filter((x) => x.r >= 8).length },
  bastos: { nombre: 'Cartas de bastos', f: (c) => c.filter((x) => x.p === 'bastos').length }
};

// ---------- Utilidades ----------
const barajar = (l, rng) => { const b = [...l]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const maxRepe = (c) => Math.max(0, ...Object.values(c.reduce((m, x) => { m[x.r] = (m[x.r] || 0) + 1; return m; }, {})));

/** Baraja según los modificadores: 40 cartas españolas + especiales. */
export function crearBaraja(mod = {}, rng = Math.random) {
  const b = [];
  let id = 0;
  PALOS.forEach((p) => { for (let r = 1; r <= 10; r++) b.push({ id: ++id, r, p, esp: mod.mutantes && r === 4 ? 'mutante' : null }); });
  if (mod.dobles) barajar(b.filter((x) => !x.esp), rng).slice(0, 2).forEach((x) => { x.esp = 'doble'; });
  for (const [m, esp] of [['comodines', 'comodin'], ['bombas', 'bomba'], ['espejo', 'espejo']]) {
    if (mod[m]) for (let i = 0; i < 2; i++) b.push({ id: ++id, r: 0, p: null, esp });
  }
  return b;
}

// ---------- Evaluación de manos ----------
const valorOrden = (r, inv) => (inv ? (r === 1 ? 10 : r === 10 ? 1 : r) : r);
const valorSuma = (r, inv) => { const o = valorOrden(r, inv); return o >= 8 ? 10 : o; };

/** Nivel (0 = nada) de un conjunto concreto de hasta 5 cartas { r, p }. */
function nivelConcreto(c, cat, ctx) {
  const inv = ctx.invertidas;
  switch (cat) {
    case 'grande': {
      const ord = c.map((x) => valorOrden(x.r, inv));
      const reyes = ord.filter((o) => o === 10).length;
      if (reyes >= 3) return 8;
      if (reyes === 2) return 7;
      const top = Math.max(0, ...ord);
      return top >= 5 ? top - 4 : 0;
    }
    case 'parejas': {
      const n = Object.values(c.reduce((m, x) => { m[x.r] = (m[x.r] || 0) + 1; return m; }, {})).sort((a, b) => b - a);
      if (n[0] >= 4) return 5;
      if (n[0] === 3 && n[1] >= 2) return 4;
      if (n[0] === 3) return 3;
      if (n[0] === 2 && n[1] === 2) return 2;
      return n[0] === 2 ? 1 : 0;
    }
    case 'escalera': {
      const s = new Set(c.map((x) => x.r));
      let mejor = 0;
      for (let r = 1; r <= 10; r++) { let l = 0; while (s.has(r + l)) l++; mejor = Math.max(mejor, l); }
      return Math.max(0, Math.min(5, mejor) - 1);
    }
    case 'colores': {
      const m = Math.max(0, ...PALOS.map((p) => c.filter((x) => x.p === p).length));
      return Math.max(0, m - 1);
    }
    case 'suma': {
      const d = Math.abs(c.reduce((s, x) => s + valorSuma(x.r, inv), 0) - ctx.objetivo);
      return d === 0 ? 5 : d <= 1 ? 4 : d <= 3 ? 3 : d <= 5 ? 2 : d <= 8 ? 1 : 0;
    }
    case 'pequena': {
      if (c.length < 3) return 0;
      const v = c.map((x) => valorSuma(x.r, inv)).sort((a, b) => a - b).slice(0, 3);
      const s = v[0] + v[1] + v[2];
      return s <= 3 ? 5 : s <= 5 ? 4 : s <= 7 ? 3 : s <= 9 ? 2 : s <= 12 ? 1 : 0;
    }
    case 'exactitud': return ctx.requisitos.filter((i) => EXACTITUD[i][1](c)).length;
    case 'caos': return Math.max(0, Math.min(5, CAOS[ctx.caos].f(c)) - 1);
    default: return 0;
  }
}

const TODAS = PALOS.flatMap((p) => Array.from({ length: 10 }, (_, i) => ({ r: i + 1, p })));
function subconjuntos(l, k) {
  if (l.length <= k) return [l];
  const out = [];
  const rec = (i, acc) => { if (acc.length === k) { out.push(acc); return; } if (l.length - i < k - acc.length) return; rec(i + 1, [...acc, l[i]]); rec(i + 1, acc); };
  rec(0, []);
  return out;
}
/** Mejor nivel de unas cartas (5 de un jugador o 10 de una pareja) con todas las cartas especiales. */
export function evaluar(cartas, cat, ctx) {
  // Las bombas no cuentan; las dobles cuentan dos veces
  const fisicas = cartas.filter((x) => x.esp !== 'bomba');
  const max = CATEGORIAS[cat].niveles.length;
  let mejor = 0;
  for (const sub of subconjuntos(fisicas, 5)) {
    const fijas = sub.filter((x) => x.esp !== 'comodin' && x.esp !== 'espejo').flatMap((x) => (x.esp === 'doble' ? [x, x] : [x])).map((x) => ({ r: x.r, p: x.p }));
    const comodines = sub.filter((x) => x.esp === 'comodin').length;
    const espejos = sub.filter((x) => x.esp === 'espejo').length;
    const probar = (base, quedanC, quedanE) => {
      if (mejor >= max) return;
      if (quedanC) { for (const t of TODAS) probar([...base, t], quedanC - 1, quedanE); return; }
      if (quedanE) { const vistos = new Set(); for (const t of fijas) { const k = `${t.r}${t.p}`; if (vistos.has(k)) continue; vistos.add(k); probar([...base, t], 0, quedanE - 1); } if (!fijas.length) probar(base, 0, 0); return; }
      // Con cartas dobles puede haber 6: se queda con las 5 mejores
      for (const c of subconjuntos(base, 5)) mejor = Math.max(mejor, nivelConcreto(c, cat, ctx));
    };
    probar(fijas, comodines, espejos);
    if (mejor >= max) break;
  }
  return mejor;
}

// ---------- Partida ----------
const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const bandoDe = (p, id) => p.bandos.find((b) => b.miembros.includes(id));
const bandosVivos = (p) => p.bandos.filter((b) => b.miembros.some((m) => !jug(p, m).fuera));
const cartasDeBando = (p, b) => b.miembros.flatMap((m) => p.manos[m] || []);

/** reglas: { modo, fichas }. */
export function crearPartida(jugadores, reglas = {}, ahora = Date.now(), rng = Math.random) {
  const modo = reglas.modo === 'parejas' ? 'parejas' : 'individual';
  const n = jugadores.length;
  if (n < AJUSTES.min || n > AJUSTES.max) throw new Error(`Se juega de ${AJUSTES.min} a ${AJUSTES.max} jugadores.`);
  if (modo === 'parejas' && n !== 4 && n !== 6) throw new Error('Por parejas tenéis que ser 4 o 6 jugadores.');
  const fichas = reglas.fichas || 20;
  // Por parejas, los compañeros se sientan alternados: 1-3 / 2-4 (o 1-4 / 2-5 / 3-6)
  const nb = modo === 'parejas' ? n / 2 : n;
  const bandos = Array.from({ length: nb }, (_, i) => ({
    id: i + 1, miembros: modo === 'parejas' ? [jugadores[i].id, jugadores[i + nb].id] : [jugadores[i].id],
    fichas: fichas * (modo === 'parejas' ? 2 : 1), turnoMiembro: 0
  }));
  return {
    modo, fichasIniciales: fichas,
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, fuera: false })),
    bandos,
    pacto: { modificadores: {}, reglas: {}, categorias: [...CATEGORIAS_NORMALES], aceptan: [] },
    fase: 'pacto', hasta: null, orden: [], ronda: 0, rondas: 0, ctx: null, baraja: [], manos: {}, cambios: {},
    bote: 0, apuesta: null, activos: [], turno: null, sinNuevo: 0, registro: [], revelacion: null, inicio: 0, fin: null, sinReloj: Boolean(reglas.sinReloj)
  };
}
const reloj = (p, ahora, s) => (p.sinReloj ? null : ahora + s * 1000);

// ----- Fase de pacto
/** Cualquiera puede cambiar la propuesta; al cambiarla, se borran las aceptaciones. */
export function proponer(p, id, cambio = {}) {
  if (p.fase !== 'pacto') return { ok: false, error: 'La baraja ya está pactada.' };
  if (!jug(p, id)) return { ok: false, error: 'No estás en la partida.' };
  const t = p.pacto;
  if (cambio.modificador && MODIFICADORES[cambio.modificador]) t.modificadores[cambio.modificador] = !t.modificadores[cambio.modificador];
  else if (cambio.regla && REGLAS_ESPECIALES[cambio.regla]) t.reglas[cambio.regla] = !t.reglas[cambio.regla];
  else if (cambio.categoria && CATEGORIAS[cambio.categoria]) {
    const i = t.categorias.indexOf(cambio.categoria);
    if (i >= 0) { if (t.categorias.length <= 3) return { ok: false, error: 'Tiene que haber al menos 3 categorías.' }; t.categorias.splice(i, 1); }
    else t.categorias.push(cambio.categoria);
  } else return { ok: false, error: 'Cambio no válido.' };
  t.aceptan = [];
  return { ok: true };
}
export function aceptar(p, id, ahora = Date.now(), rng = Math.random) {
  if (p.fase !== 'pacto') return { ok: false, error: 'La baraja ya está pactada.' };
  if (!jug(p, id)) return { ok: false, error: 'No estás en la partida.' };
  if (!p.pacto.aceptan.includes(id)) p.pacto.aceptan.push(id);
  if (p.jugadores.filter((j) => !j.fuera).every((j) => p.pacto.aceptan.includes(j.id))) arrancar(p, ahora, rng);
  return { ok: true };
}
function arrancar(p, ahora, rng) {
  p.orden = barajar(p.pacto.categorias, rng);
  p.rondas = p.orden.length;
  empezarCategoria(p, ahora, rng);
}

// ----- Categoría: reparto y cambio
function empezarCategoria(p, ahora, rng = Math.random) {
  p.ronda += 1;
  const cat = p.orden[p.ronda - 1];
  p.baraja = barajar(crearBaraja(p.pacto.modificadores, rng), rng);
  p.baraja.filter((x) => x.esp === 'mutante').forEach((x) => { x.r = 1 + Math.floor(rng() * 10); });
  p.manos = {};
  p.jugadores.filter((j) => !j.fuera).forEach((j) => { p.manos[j.id] = p.baraja.splice(0, AJUSTES.cartas); });
  p.ctx = { cat, invertidas: Boolean(p.pacto.modificadores.invertidas) };
  if (cat === 'suma') p.ctx.objetivo = 20 + Math.floor(rng() * 21);
  if (cat === 'exactitud') p.ctx.requisitos = barajar([...EXACTITUD.keys()], rng).slice(0, 3);
  if (cat === 'caos') p.ctx.caos = barajar(Object.keys(CAOS), rng)[0];
  p.cambios = {};
  p.revelacion = null;
  p.registro = [];
  p.apuesta = null;
  p.fase = 'cambio';
  p.hasta = reloj(p, ahora, AJUSTES.segCambio);
}
export const maxCambio = (p) => (p.pacto.reglas.intercambio3 ? 3 : 2);

/** Descarta las cartas indicadas (ids) y roba otras tantas. [] = no cambiar. */
export function cambiar(p, id, ids = [], ahora = Date.now()) {
  if (p.fase !== 'cambio') return { ok: false, error: 'Ahora no se pueden cambiar cartas.' };
  const mano = p.manos[id];
  if (!mano) return { ok: false, error: 'No estás en la partida.' };
  if (p.cambios[id] !== undefined) return { ok: false, error: 'Ya has hecho tu cambio.' };
  const quitar = [...new Set(ids.map(Number))].filter((x) => mano.some((c) => c.id === x)).slice(0, maxCambio(p));
  const n = Math.min(quitar.length, p.baraja.length);
  const fuera = quitar.slice(0, n);
  p.manos[id] = [...mano.filter((c) => !fuera.includes(c.id)), ...p.baraja.splice(0, n)];
  p.cambios[id] = n;
  if (p.jugadores.filter((j) => !j.fuera).every((j) => p.cambios[j.id] !== undefined)) abrirApuestas(p, ahora);
  return { ok: true, cambiadas: n };
}

function abrirApuestas(p, ahora) {
  p.fase = 'apuestas';
  // Cada bando pone su ante (1 ficha por jugador) si tiene
  p.bandos.forEach((b) => {
    if (!bandosVivos(p).includes(b)) return;
    const n = Math.min(b.fichas, AJUSTES.ante * b.miembros.filter((m) => !jug(p, m).fuera).length);
    b.fichas -= n;
    p.bote += n;
  });
  p.activos = bandosVivos(p).map((b) => b.id);
  const vivos = bandosVivos(p);
  p.turno = vivos[(p.ronda - 1) % vivos.length].id;
  p.sinNuevo = 0;
  p.hasta = reloj(p, ahora, AJUSTES.segTurno);
}

// ----- Apuestas
const bandoTurno = (p) => p.bandos.find((b) => b.id === p.turno);
/** Jugador que habla por el bando del turno (en parejas se alternan). */
export function quienHabla(p) {
  const b = bandoTurno(p);
  if (!b) return null;
  const vivos = b.miembros.filter((m) => !jug(p, m).fuera);
  return vivos[b.turnoMiembro % vivos.length];
}
function siguienteTurno(p, ahora) {
  const b = bandoTurno(p);
  if (b) b.turnoMiembro += 1;
  const ids = p.bandos.map((x) => x.id);
  let i = ids.indexOf(p.turno);
  for (let k = 0; k < ids.length; k++) {
    i = (i + 1) % ids.length;
    if (p.activos.includes(ids[i])) { p.turno = ids[i]; break; }
  }
  p.hasta = reloj(p, ahora, AJUSTES.segTurno);
  // Si le vuelve el turno a quien lleva la apuesta sin que nadie la mejore ni la desafíe, se la lleva
  if (p.apuesta && p.turno === p.apuesta.bando) { revelar(p, { tipo: 'sinDesafio', gana: p.apuesta.bando }); return; }
  if (!p.apuesta && p.activos.length === 0) revelar(p, { tipo: 'nadie' });
}
function validarTurno(p, id) {
  if (p.fase !== 'apuestas') return 'Ahora no se apuesta.';
  if (quienHabla(p) !== id) return 'No es tu turno.';
  return null;
}
export const subidaMax = (p) => (p.pacto.reglas.subidalibre ? AJUSTES.subidaLibre : AJUSTES.subidaMax);

/** Anunciar (o subir): «tengo al menos este nivel» y pone fichas. */
export function anunciar(p, id, nivel, subida = 1, ahora = Date.now()) {
  const e = validarTurno(p, id);
  if (e) return { ok: false, error: e };
  const b = bandoTurno(p);
  const nv = Number(nivel);
  const niveles = CATEGORIAS[p.ctx.cat].niveles.length;
  if (!(nv >= 1 && nv <= niveles)) return { ok: false, error: 'Elige qué anuncias.' };
  if (p.apuesta && nv <= p.apuesta.nivel) return { ok: false, error: 'Tienes que anunciar algo mejor que lo que hay.' };
  const s = Math.max(1, Math.min(subidaMax(p), Number(subida) || 1));
  const total = (p.apuesta?.fichas || 0) + s;
  if (b.fichas < total) return { ok: false, error: `Necesitas ${total} fichas para esa apuesta.` };
  b.fichas -= total;
  p.bote += total;
  p.apuesta = { bando: b.id, jugador: id, nivel: nv, fichas: total };
  p.registro.unshift({ id, tipo: p.registro.some((r) => r.tipo !== 'paso') ? 'sube' : 'anuncia', nivel: nv, fichas: total });
  siguienteTurno(p, ahora);
  return { ok: true };
}
export function pasar(p, id, ahora = Date.now()) {
  const e = validarTurno(p, id);
  if (e) return { ok: false, error: e };
  const b = bandoTurno(p);
  p.activos = p.activos.filter((x) => x !== b.id);
  p.registro.unshift({ id, tipo: 'paso' });
  if (p.apuesta && p.activos.length === 1 && p.activos[0] === p.apuesta.bando) { revelar(p, { tipo: 'sinDesafio', gana: p.apuesta.bando }); return { ok: true }; }
  if (!p.activos.length) { revelar(p, { tipo: 'nadie' }); return { ok: true }; }
  siguienteTurno(p, ahora);
  return { ok: true };
}
/** Desafiar a quien lleva la apuesta: se iguala su apuesta y se miran sus cartas. */
export function desafiar(p, id) {
  const e = validarTurno(p, id);
  if (e) return { ok: false, error: e };
  if (!p.apuesta) return { ok: false, error: 'Nadie ha anunciado nada todavía.' };
  const b = bandoTurno(p);
  if (b.fichas < 1) return { ok: false, error: 'Necesitas fichas para desafiar.' };
  const pone = Math.min(b.fichas, p.apuesta.fichas);
  b.fichas -= pone;
  p.bote += pone;
  const acusado = p.bandos.find((x) => x.id === p.apuesta.bando);
  const real = evaluar(cartasDeBando(p, acusado), p.ctx.cat, p.ctx);
  const verdad = real >= p.apuesta.nivel;
  p.registro.unshift({ id, tipo: 'desafia' });
  revelar(p, { tipo: 'desafio', desafiante: b.id, desafianteJugador: id, verdad, real, gana: verdad ? acusado.id : b.id });
  return { ok: true, verdad };
}

function revelar(p, r) {
  const ganador = r.gana ? p.bandos.find((b) => b.id === r.gana) : null;
  const ultima = p.ronda >= p.rondas;
  const cambiosFichas = {};
  const mover = (b, n) => { if (!n) return; b.fichas += n; cambiosFichas[b.id] = (cambiosFichas[b.id] || 0) + n; };
  let bote = p.bote;
  if (ganador) { mover(ganador, bote); bote = 0; }
  else if (ultima) {
    // Nadie apostó en la última: el bote se reparte (lo que no da para todos se pierde)
    const vivos = bandosVivos(p);
    const cada = Math.floor(bote / vivos.length);
    vivos.forEach((b) => mover(b, cada));
    bote = 0;
  }
  // Farol caro: el mentiroso paga además su apuesta a quien le pilló
  if (r.tipo === 'desafio' && !r.verdad && p.pacto.reglas.faroldoble) {
    const acusado = p.bandos.find((b) => b.id === p.apuesta.bando);
    const extra = Math.min(acusado.fichas, p.apuesta.fichas);
    mover(acusado, -extra);
    mover(ganador, extra);
  }
  // Bombas
  const bombas = [];
  p.jugadores.forEach((j) => {
    const n = (p.manos[j.id] || []).filter((c) => c.esp === 'bomba').length;
    if (!n) return;
    const b = bandoDe(p, j.id);
    const q = Math.min(b.fichas, n * AJUSTES.bomba);
    mover(b, -q);
    bombas.push({ id: j.id, fichas: q });
  });
  p.bote = bote;
  p.revelacion = {
    ...r, apuesta: p.apuesta, cambios: cambiosFichas, bombas,
    niveles: Object.fromEntries(p.bandos.map((b) => [b.id, evaluar(cartasDeBando(p, b), p.ctx.cat, p.ctx)]))
  };
  p.fase = 'revelacion';
  p.hasta = null;
}

export function siguiente(p, ahora = Date.now(), rng = Math.random) {
  if (p.fase !== 'revelacion') return { ok: false, error: 'La categoría no ha terminado.' };
  if (p.ronda >= p.rondas || bandosVivos(p).filter((b) => b.fichas > 0).length < 2) return terminar(p);
  empezarCategoria(p, ahora, rng);
  return { ok: true };
}

export function terminar(p) {
  if (p.fase === 'fin') return { ok: false, error: 'La partida ya ha terminado.' };
  p.fase = 'fin';
  p.hasta = null;
  const tabla = [...p.jugadores].map((j) => ({ ...j, fichas: bandoDe(p, j.id).fichas, bando: bandoDe(p, j.id).id }))
    .sort((a, b) => (a.fuera - b.fuera) || b.fichas - a.fichas);
  let puesto = 0;
  tabla.forEach((j, k) => { if (k === 0 || j.fichas !== tabla[k - 1].fichas) puesto = k + 1; j.puesto = puesto; });
  const vivos = tabla.filter((j) => !j.fuera);
  const max = vivos.length ? Math.max(...vivos.map((j) => j.fichas)) : 0;
  p.fin = {
    tabla: tabla.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.fichas, fichas: j.fichas, bando: j.bando, puesto: j.puesto, fuera: j.fuera })),
    ganadores: max > 0 ? vivos.filter((j) => j.fichas === max).map((j) => j.id) : [], max
  };
  return { ok: true };
}

/** Relojes: en el cambio, quien no ha cambiado se queda sus cartas; en las apuestas, quien no habla pasa. */
export function tick(p, ahora = Date.now()) {
  if (!p.hasta || ahora < p.hasta) return;
  if (p.fase === 'cambio') {
    p.jugadores.filter((j) => !j.fuera && p.cambios[j.id] === undefined).forEach((j) => cambiar(p, j.id, [], ahora));
  } else if (p.fase === 'apuestas') pasar(p, quienHabla(p), ahora);
}

export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id);
  if (!j || j.fuera || p.fase === 'fin') return;
  const hablaba = p.fase === 'apuestas' && quienHabla(p) === id;
  j.fuera = true;
  const b = bandoDe(p, id);
  const vivos = bandosVivos(p);
  if (vivos.length < 2) { terminar(p); return; }
  if (p.fase === 'pacto') { if (p.jugadores.filter((x) => !x.fuera).every((x) => p.pacto.aceptan.includes(x.id))) arrancar(p, ahora, Math.random); return; }
  if (p.fase === 'cambio') { delete p.cambios[id]; if (p.jugadores.filter((x) => !x.fuera).every((x) => p.cambios[x.id] !== undefined)) abrirApuestas(p, ahora); return; }
  if (p.fase === 'apuestas' && !vivos.includes(b)) {
    p.activos = p.activos.filter((x) => x !== b.id);
    if (p.apuesta?.bando === b.id) { revelar(p, { tipo: 'nadie' }); return; }
    if (hablaba) { if (!p.activos.length) revelar(p, { tipo: 'nadie' }); else siguienteTurno(p, ahora); }
  }
}

/** Texto de los requisitos o la regla de la categoría actual. */
export function detalleCategoria(ctx) {
  if (!ctx) return '';
  if (ctx.cat === 'suma') return `Objetivo: ${ctx.objetivo}`;
  if (ctx.cat === 'exactitud') return `Requisitos: ${ctx.requisitos.map((i) => EXACTITUD[i][0].toLowerCase()).join(' · ')}`;
  if (ctx.cat === 'caos') return `Hoy gana quien más tenga: ${CAOS[ctx.caos].nombre.toLowerCase()}`;
  return '';
}

export function vistaDe(p, id) {
  const yo = jug(p, id);
  const miBando = yo ? bandoDe(p, id) : null;
  const abierto = p.fase === 'revelacion' || p.fase === 'fin';
  return {
    fase: p.fase, modo: p.modo, ronda: p.ronda, rondas: p.rondas, hasta: p.hasta,
    segundos: p.fase === 'cambio' ? AJUSTES.segCambio : AJUSTES.segTurno,
    pacto: p.pacto,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, fuera: j.fuera, bando: bandoDe(p, j.id).id, puntos: bandoDe(p, j.id).fichas, cambio: p.cambios[j.id] ?? null })),
    bandos: p.bandos.map((b) => ({ id: b.id, miembros: b.miembros, fichas: b.fichas, activo: p.activos.includes(b.id) })),
    categoria: p.ctx ? { id: p.ctx.cat, ...CATEGORIAS[p.ctx.cat], detalle: detalleCategoria(p.ctx) } : null,
    orden: p.orden,
    yo: yo ? {
      id, bando: miBando.id, mano: p.manos[id] || [], cambio: p.cambios[id] ?? null, maxCambio: maxCambio(p),
      companero: p.modo === 'parejas' ? miBando.miembros.find((m) => m !== id) : null,
      // Pista para ti: lo que de verdad tienes tú solo
      nivelPropio: p.ctx && p.manos[id] ? evaluar(p.manos[id], p.ctx.cat, p.ctx) : 0
    } : null,
    turno: p.fase === 'apuestas' ? p.turno : null, habla: p.fase === 'apuestas' ? quienHabla(p) : null,
    bote: p.bote, apuesta: p.apuesta, registro: p.registro.slice(0, 8), subidaMax: subidaMax(p),
    manos: abierto ? p.manos : null,
    revelacion: abierto ? p.revelacion : null,
    sumas: abierto && p.revelacion ? Object.fromEntries(p.jugadores.map((j) => [j.id, p.revelacion.cambios[bandoDe(p, j.id).id] || 0])) : {},
    fin: p.fin
  };
}
