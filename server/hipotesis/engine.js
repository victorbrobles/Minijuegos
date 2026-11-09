// server/hipotesis/engine.js
// Motor puro de «La Hipótesis Ganadora» (sin red ni React). Lo usan:
//   - server/routes/hipotesis.js (salas online)
//   - client/src/games/Hipotesis/engine.js (modo un solo dispositivo)  <-- COPIA IDÉNTICA de este archivo
// Si cambias algo aquí:  npm run sync:hipotesis  (en /server)
//
// IDEA: cada ronda hay una VERDAD ABSOLUTA oculta (una fila de casillas con un valor cada una: tubos de
// laboratorio, cartas, casas de un barrio o los dígitos de una caja fuerte). Cada jugador ve solo unas pocas
// casillas. Todos formulan EN SECRETO una hipótesis, que puede ser cierta… o un farol. Después se desvelan
// todas y cada uno decide si confía en cada hipótesis o cree que es mentira. Se comprueba la verdad:
//   · quien acierta su juicio puntúa (y más si se juega el «¡Seguro!»),
//   · el autor gana por cada persona que se la cree (el doble si era un farol) y pierde si le pillan mintiendo.
// Cada ronda cambia el escenario y trae un EVENTO sorpresa (ronda doble, rumor, topo, juicio a ciegas…).

// ---------------------------------------------------------------- Escenarios (la «verdad absoluta»)
export const VARIANTES = {
  laboratorio: {
    nombre: 'El laboratorio', icono: 'flask', celda: 'Tubo', articulo: 'el', intro: 'Cada tubo contiene una sustancia.',
    valores: [
      { n: 'Rubí', e: '🔴', c: '#dc2626' }, { n: 'Zafiro', e: '🔵', c: '#2563eb' },
      { n: 'Jade', e: '🟢', c: '#16a34a' }, { n: 'Ámbar', e: '🟡', c: '#d97706' }
    ],
    plantillas: ['es', 'noes', 'iguales', 'distintos', 'alMenos', 'comoMucho', 'masQue']
  },
  cartas: {
    nombre: 'La baraja', icono: 'star', celda: 'Carta', articulo: 'la', intro: 'Cada carta tiene un número del 1 al 9.', base: 1,
    valores: Array.from({ length: 9 }, (_, k) => ({ n: String(k + 1), e: String(k + 1), c: '#7c3aed' })),
    plantillas: ['es', 'mayorN', 'menorN', 'par', 'impar', 'mayor', 'sumaMas', 'sumaMenos'], numerico: true
  },
  barrio: {
    nombre: 'El barrio', icono: 'home', celda: 'Casa', articulo: 'la', intro: 'En cada casa vive una mascota.',
    valores: [
      { n: 'un gato', e: '🐱', c: '#f97316' }, { n: 'un perro', e: '🐶', c: '#a16207' }, { n: 'un loro', e: '🦜', c: '#16a34a' },
      { n: 'un pez', e: '🐟', c: '#0284c7' }, { n: 'una tortuga', e: '🐢', c: '#65a30d' }
    ],
    plantillas: ['es', 'noes', 'iguales', 'distintos', 'alMenos', 'comoMucho', 'masQue']
  },
  caja: {
    nombre: 'La caja fuerte', icono: 'lock', celda: 'Dígito', articulo: 'el', intro: 'La combinación tiene un dígito del 0 al 9 en cada posición.', base: 0,
    valores: Array.from({ length: 10 }, (_, k) => ({ n: String(k), e: String(k), c: '#0f766e' })),
    plantillas: ['es', 'contiene', 'noContiene', 'mayor', 'par', 'impar', 'sumaTotalMas', 'sumaTotalMenos'], numerico: true
  }
};
export const ORDEN_VARIANTES = Object.keys(VARIANTES);

// Cada plantilla: parámetros que hay que rellenar, texto y cómo se comprueba.
// i, j: casillas · v, w: valores · n: número
export const PLANTILLAS = {
  es: { nombre: 'Es…', params: ['i', 'v'] },
  noes: { nombre: 'No es…', params: ['i', 'v'] },
  iguales: { nombre: 'Son iguales', params: ['i', 'j'] },
  distintos: { nombre: 'Son distintos', params: ['i', 'j'] },
  alMenos: { nombre: 'Hay al menos…', params: ['n', 'v'] },
  comoMucho: { nombre: 'Hay como mucho…', params: ['n', 'v'] },
  masQue: { nombre: 'Hay más… que…', params: ['v', 'w'] },
  mayorN: { nombre: 'Es mayor que…', params: ['i', 'n'] },
  menorN: { nombre: 'Es menor que…', params: ['i', 'n'] },
  par: { nombre: 'Es par', params: ['i'] },
  impar: { nombre: 'Es impar', params: ['i'] },
  mayor: { nombre: 'Una mayor que otra', params: ['i', 'j'] },
  sumaMas: { nombre: 'Dos suman más de…', params: ['i', 'j', 'n'] },
  sumaMenos: { nombre: 'Dos suman menos de…', params: ['i', 'j', 'n'] },
  contiene: { nombre: 'Contiene un…', params: ['v'] },
  noContiene: { nombre: 'No contiene ningún…', params: ['v'] },
  sumaTotalMas: { nombre: 'Todo suma más de…', params: ['n'] },
  sumaTotalMenos: { nombre: 'Todo suma menos de…', params: ['n'] }
};

/** Rango permitido para el número «n» de una plantilla. */
export function rangoN(varId, pl, K) {
  const V = VARIANTES[varId];
  const lo = V.base ?? 0; const hi = lo + V.valores.length - 1;
  switch (pl) {
    case 'alMenos': return [1, K];
    case 'comoMucho': return [0, K - 1];
    case 'mayorN': return [lo, hi - 1];
    case 'menorN': return [lo + 1, hi];
    case 'sumaMas': return [lo * 2, hi * 2 - 1];
    case 'sumaMenos': return [lo * 2 + 1, hi * 2];
    case 'sumaTotalMas': return [lo * K, hi * K - 1];
    case 'sumaTotalMenos': return [lo * K + 1, hi * K];
    default: return [0, 0];
  }
}

const val = (V, x) => (V.base ?? 0) + x;
const cuenta = (t, v) => t.filter((x) => x === v).length;

export function evaluar(varId, h, t) {
  const V = VARIANTES[varId]; const p = h.p;
  switch (h.pl) {
    case 'es': return t[p.i] === p.v;
    case 'noes': return t[p.i] !== p.v;
    case 'iguales': return t[p.i] === t[p.j];
    case 'distintos': return t[p.i] !== t[p.j];
    case 'alMenos': return cuenta(t, p.v) >= p.n;
    case 'comoMucho': return cuenta(t, p.v) <= p.n;
    case 'masQue': return cuenta(t, p.v) > cuenta(t, p.w);
    case 'mayorN': return val(V, t[p.i]) > p.n;
    case 'menorN': return val(V, t[p.i]) < p.n;
    case 'par': return val(V, t[p.i]) % 2 === 0;
    case 'impar': return val(V, t[p.i]) % 2 === 1;
    case 'mayor': return val(V, t[p.i]) > val(V, t[p.j]);
    case 'sumaMas': return val(V, t[p.i]) + val(V, t[p.j]) > p.n;
    case 'sumaMenos': return val(V, t[p.i]) + val(V, t[p.j]) < p.n;
    case 'contiene': return t.includes(p.v);
    case 'noContiene': return !t.includes(p.v);
    case 'sumaTotalMas': return t.reduce((a, x) => a + val(V, x), 0) > p.n;
    case 'sumaTotalMenos': return t.reduce((a, x) => a + val(V, x), 0) < p.n;
    default: return false;
  }
}

export function textoHipotesis(varId, h) {
  const V = VARIANTES[varId]; const p = h.p;
  const C = (i) => `${V.celda.toLowerCase()} ${i + 1}`;
  const Cc = (i) => `${V.articulo === 'la' ? 'La' : 'El'} ${C(i)}`;
  const X = (v) => (V.numerico ? String(val(V, v)) : `${V.valores[v].e} ${V.valores[v].n}`);
  const plural = (v) => (V.numerico ? X(v) : `${V.valores[v].e} ${V.valores[v].n.replace(/^una? /, '')}`);
  const vive = varId === 'barrio';
  switch (h.pl) {
    case 'es': return vive ? `En la ${C(p.i)} vive ${X(p.v)}` : `${Cc(p.i)} es ${X(p.v)}`;
    case 'noes': return vive ? `En la ${C(p.i)} NO vive ${X(p.v)}` : `${Cc(p.i)} NO es ${X(p.v)}`;
    case 'iguales': return `${Cc(p.i)} y ${V.articulo} ${C(p.j)} ${vive ? 'tienen la misma mascota' : 'son iguales'}`;
    case 'distintos': return `${Cc(p.i)} y ${V.articulo} ${C(p.j)} ${vive ? 'tienen mascotas distintas' : 'son distintos'}`;
    case 'alMenos': return `Hay al menos ${p.n} × ${plural(p.v)}`;
    case 'comoMucho': return `Hay como mucho ${p.n} × ${plural(p.v)}`;
    case 'masQue': return `Hay más ${plural(p.v)} que ${plural(p.w)}`;
    case 'mayorN': return `${Cc(p.i)} es mayor que ${p.n}`;
    case 'menorN': return `${Cc(p.i)} es menor que ${p.n}`;
    case 'par': return `${Cc(p.i)} es par`;
    case 'impar': return `${Cc(p.i)} es impar`;
    case 'mayor': return `${Cc(p.i)} es mayor que ${V.articulo} ${C(p.j)}`;
    case 'sumaMas': return `${Cc(p.i)} y ${V.articulo} ${C(p.j)} suman más de ${p.n}`;
    case 'sumaMenos': return `${Cc(p.i)} y ${V.articulo} ${C(p.j)} suman menos de ${p.n}`;
    case 'contiene': return `La combinación tiene algún ${X(p.v)}`;
    case 'noContiene': return `La combinación no tiene ningún ${X(p.v)}`;
    case 'sumaTotalMas': return `Todos los dígitos suman más de ${p.n}`;
    case 'sumaTotalMenos': return `Todos los dígitos suman menos de ${p.n}`;
    default: return '?';
  }
}

// ---------------------------------------------------------------- Eventos sorpresa
export const EVENTOS = {
  normal: { nombre: 'Ronda tranquila', emoji: '☕', desc: 'Sin sorpresas: formula, juzga y que gane el mejor.' },
  doble: { nombre: 'Ronda doble', emoji: '✖️2', desc: 'Todos los puntos de esta ronda valen el doble.' },
  rumor: { nombre: 'Rumor', emoji: '👂', desc: 'Una casilla se ha filtrado: todo el mundo la conoce.' },
  topo: { nombre: 'Hay un topo', emoji: '🕵️', desc: 'Alguien tiene la misión secreta de mentir: +3 si engaña a la mayoría, −2 si dice la verdad.' },
  sincera: { nombre: 'Ronda sincera', emoji: '😇', desc: 'Formular una hipótesis falsa cuesta 2 puntos.' },
  ciegas: { nombre: 'Juicio a ciegas', emoji: '🙈', desc: 'No se sabe quién ha escrito cada hipótesis hasta el final.' },
  chismorreo: { nombre: 'Chismorreo', emoji: '🗣️', desc: 'Además de lo tuyo, conoces una casilla de tu vecino.' },
  relampago: { nombre: 'Relámpago', emoji: '⚡', desc: 'Medio tiempo para formular y para juzgar.' }
};
const BOLSA_EVENTOS = ['normal', 'doble', 'rumor', 'topo', 'sincera', 'ciegas', 'chismorreo', 'relampago'];

export const OPCIONES_RONDAS = [3, 5, 7];
export const REACCIONES = ['🤔', '😂', '🙄', '😱', '👀'];
export const AJUSTES = {
  min: 3, max: 8,
  formularMs: 75000, juicioMs: 60000, revelacionMs: 40000,
  puntosAcierto: 1, puntosSeguro: 2, penalSeguro: -1,
  autorCierta: 1, autorFarol: 2, autorPillado: -1,
  topoGana: 3, topoFalla: -2, sinceraFalsa: -2, ganadora: 1
};

// ---------------------------------------------------------------- Utilidades
const barajar = (arr, rng) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const jug = (est, id) => est.jugadores.find((j) => j.id === id);
const activos = (est) => est.jugadores.filter((j) => !j.fuera);
const ok = () => ({ ok: true });
const err = (error) => ({ ok: false, error });
export const numCasillas = (n) => Math.min(9, Math.max(6, n + 3));

// ---------------------------------------------------------------- Crear partida
export function crearPartida(jugadores, config = {}, { rng = Math.random, local = false, ahora = null } = {}) {
  const rondas = OPCIONES_RONDAS.includes(Number(config.rondas)) ? Number(config.rondas) : 5;
  const est = {
    rng, local, cfg: { rondas }, ronda: 0, fase: 'formular', limite: null, listos: {},
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, engaños: 0, aciertos: 0, fuera: false })),
    variantes: barajar(ORDEN_VARIANTES, rng), variante: null, evento: 'normal', topoId: null,
    K: 0, verdad: [], rumor: null, conoce: {}, hipotesis: {}, votos: {}, seguros: {}, reacciones: {},
    resultado: null, historial: [], fin: null
  };
  empezarRonda(est, ahora);
  return est;
}

function setFase(est, fase, ahora, ms) {
  est.fase = fase; est.listos = {};
  const factor = est.evento === 'relampago' && fase !== 'revelacion' ? 0.5 : 1;
  est.limite = !est.local && ahora != null && ms ? ahora + Math.round(ms * factor) : null;
}

function empezarRonda(est, ahora) {
  est.ronda += 1;
  const act = activos(est);
  est.variante = est.variantes[(est.ronda - 1) % est.variantes.length];
  est.evento = est.ronda === 1 ? 'normal' : BOLSA_EVENTOS[Math.floor(est.rng() * BOLSA_EVENTOS.length)];
  const V = VARIANTES[est.variante];
  est.K = numCasillas(act.length);
  est.verdad = Array.from({ length: est.K }, () => Math.floor(est.rng() * V.valores.length));
  est.hipotesis = {}; est.votos = {}; est.seguros = {}; est.reacciones = {}; est.resultado = null;
  est.rumor = est.evento === 'rumor' ? Math.floor(est.rng() * est.K) : null;
  est.topoId = est.evento === 'topo' ? act[Math.floor(est.rng() * act.length)].id : null;
  // cada jugador ve 2 casillas (3 si sois solo 3); se reparten dando vueltas a una baraja para cubrirlas todas
  const porJugador = act.length <= 3 ? 3 : 2;
  let cola = [];
  est.conoce = {};
  act.forEach((j) => {
    const mias = [];
    let guard = 0;
    while (mias.length < porJugador && guard++ < 100) {
      if (!cola.length) cola = barajar([...Array(est.K).keys()], est.rng);
      const m = cola.shift();
      if (!mias.includes(m) && m !== est.rumor) mias.push(m);
    }
    est.conoce[j.id] = mias;
  });
  if (est.evento === 'chismorreo') {
    const base = Object.fromEntries(Object.entries(est.conoce).map(([k, l]) => [k, [...l]]));
    act.forEach((j, k) => {
      const vecino = act[(k + 1) % act.length];
      const nueva = base[vecino.id].find((m) => !est.conoce[j.id].includes(m));
      if (nueva != null) est.conoce[j.id].push(nueva);
    });
  }
  Object.values(est.conoce).forEach((l) => l.sort((a, b) => a - b));
  setFase(est, 'formular', ahora, AJUSTES.formularMs);
}

// ---------------------------------------------------------------- Fase 1: formular
export function validar(est, h) {
  if (!h || typeof h !== 'object') return 'Hipótesis vacía.';
  const V = VARIANTES[est.variante];
  if (!V.plantillas.includes(h.pl) || !PLANTILLAS[h.pl]) return 'Tipo de hipótesis no válido en este escenario.';
  const p = h.p || {};
  const celda = (x) => Number.isInteger(x) && x >= 0 && x < est.K;
  const valor = (x) => Number.isInteger(x) && x >= 0 && x < V.valores.length;
  for (const k of PLANTILLAS[h.pl].params) {
    if ((k === 'i' || k === 'j') && !celda(p[k])) return `Elige ${V.articulo} ${V.celda.toLowerCase()}.`;
    if ((k === 'v' || k === 'w') && !valor(p[k])) return 'Elige un valor.';
    if (k === 'n') { const [lo, hi] = rangoN(est.variante, h.pl, est.K); if (!Number.isInteger(p.n) || p.n < lo || p.n > hi) return `El número debe estar entre ${lo} y ${hi}.`; }
  }
  if (p.j != null && PLANTILLAS[h.pl].params.includes('j') && p.i === p.j) return `Elige dos ${V.celda.toLowerCase()}s distintos.`;
  if (p.w != null && PLANTILLAS[h.pl].params.includes('w') && p.v === p.w) return 'Elige dos valores distintos.';
  return null;
}

const limpiar = (h) => ({ pl: h.pl, p: Object.fromEntries(PLANTILLAS[h.pl].params.map((k) => [k, Number(h.p[k])])) });

export function formular(est, id, h, ahora = null) {
  tick(est, ahora);
  const p = jug(est, id);
  if (est.fase !== 'formular') return err('Ya no se pueden formular hipótesis.');
  if (!p || p.fuera) return err('No puedes actuar.');
  const hh = h && PLANTILLAS[h.pl] ? limpiar(h) : h;
  const e = validar(est, hh);
  if (e) return err(e);
  const previa = est.hipotesis[id];
  est.hipotesis[id] = { ...hh, hid: previa?.hid || `h${est.ronda}-${Math.floor(est.rng() * 1e9).toString(36)}`, texto: textoHipotesis(est.variante, hh) };
  if (activos(est).every((j) => est.hipotesis[j.id])) empezarJuicio(est, ahora);
  return ok();
}

function empezarJuicio(est, ahora) {
  if (Object.keys(est.hipotesis).length === 0) return resolver(est, ahora);
  setFase(est, 'juicio', ahora, AJUSTES.juicioMs);
  // quien no tiene a nadie a quien juzgar ya está listo
  activos(est).forEach((j) => { if (!Object.keys(est.hipotesis).some((a) => Number(a) !== j.id)) est.listos[j.id] = true; });
  comprobarJuicio(est, ahora);
}

// ---------------------------------------------------------------- Fase 2: juzgar
const autorDeHid = (est, hid) => { const e = Object.entries(est.hipotesis).find(([, h]) => h.hid === hid); return e ? Number(e[0]) : null; };

/** votos: { hid: 'si' | 'no' } · seguro: hid (opcional) */
export function juzgar(est, id, { votos = {}, seguro = null } = {}, ahora = null) {
  tick(est, ahora);
  const p = jug(est, id);
  if (est.fase !== 'juicio') return err('Ahora no se juzga.');
  if (!p || p.fuera) return err('No puedes actuar.');
  const limpios = {};
  for (const [hid, voto] of Object.entries(votos || {})) {
    const autor = autorDeHid(est, hid);
    if (autor == null) return err('Esa hipótesis no existe.');
    if (autor === id) return err('No puedes juzgar tu propia hipótesis.');
    if (voto !== 'si' && voto !== 'no') return err('Voto no válido.');
    limpios[hid] = voto;
  }
  const ajenas = Object.entries(est.hipotesis).filter(([a]) => Number(a) !== id).map(([, h]) => h.hid);
  if (ajenas.some((hid) => !limpios[hid])) return err('Decide en todas las hipótesis antes de enviar tu veredicto.');
  if (seguro != null && !limpios[seguro]) return err('El «¡Seguro!» tiene que ir sobre una hipótesis que hayas juzgado.');
  est.votos[id] = limpios;
  est.seguros[id] = seguro ?? null;
  est.listos[id] = true;
  comprobarJuicio(est, ahora);
  return ok();
}

function comprobarJuicio(est, ahora) {
  if (est.fase === 'juicio' && activos(est).every((j) => est.listos[j.id])) resolver(est, ahora);
}

export function reaccionar(est, id, hid, emoji) {
  if (est.fase !== 'juicio') return err('Solo se reacciona durante el juicio.');
  if (!REACCIONES.includes(emoji)) return err('Reacción no válida.');
  const autor = autorDeHid(est, hid);
  if (autor == null) return err('Esa hipótesis no existe.');
  est.reacciones[hid] = est.reacciones[hid] || {};
  if (est.reacciones[hid][id] === emoji) delete est.reacciones[hid][id];
  else est.reacciones[hid][id] = emoji;
  return ok();
}

// ---------------------------------------------------------------- Fase 3: revelar y puntuar
function resolver(est, ahora) {
  const deltas = Object.fromEntries(est.jugadores.map((j) => [j.id, 0]));
  const motivos = Object.fromEntries(est.jugadores.map((j) => [j.id, []]));
  const anotar = (id, n, texto) => { if (!n) return; deltas[id] += n; motivos[id].push({ n, texto }); };
  const hips = Object.entries(est.hipotesis).map(([a, h]) => {
    const autorId = Number(a);
    const cierta = evaluar(est.variante, h, est.verdad);
    const creen = []; const dudan = [];
    Object.entries(est.votos).forEach(([vid, vs]) => { const x = vs[h.hid]; if (x === 'si') creen.push(Number(vid)); if (x === 'no') dudan.push(Number(vid)); });
    return { autorId, hid: h.hid, texto: h.texto, pl: h.pl, p: h.p, cierta, creen, dudan };
  });
  const autorNombre = (id) => jug(est, id)?.nombre ?? '?';
  hips.forEach((h) => {
    // jueces
    [...h.creen, ...h.dudan].forEach((vid) => {
      const acierta = h.creen.includes(vid) === h.cierta;
      const seguro = est.seguros[vid] === h.hid;
      if (acierta) { anotar(vid, seguro ? AJUSTES.puntosSeguro : AJUSTES.puntosAcierto, `${seguro ? '¡Seguro! ' : ''}Acertaste con ${autorNombre(h.autorId)}`); jug(est, vid).aciertos += 1; }
      else if (seguro) anotar(vid, AJUSTES.penalSeguro, `Tu «¡Seguro!» con ${autorNombre(h.autorId)} falló`);
    });
    // autor
    if (h.cierta) anotar(h.autorId, h.creen.length * AJUSTES.autorCierta, `${h.creen.length} se creyeron tu verdad`);
    else {
      anotar(h.autorId, h.creen.length * AJUSTES.autorFarol, `${h.creen.length} picaron con tu farol`);
      anotar(h.autorId, h.dudan.length * AJUSTES.autorPillado, `${h.dudan.length} te pillaron el farol`);
      if (h.creen.length) jug(est, h.autorId).engaños += h.creen.length;
    }
    if (h.autorId === est.topoId) {
      if (!h.cierta && h.creen.length > h.dudan.length) anotar(h.autorId, AJUSTES.topoGana, 'Misión de topo cumplida');
      else if (h.cierta) anotar(h.autorId, AJUSTES.topoFalla, 'El topo dijo la verdad');
    }
    if (est.evento === 'sincera' && !h.cierta) anotar(h.autorId, AJUSTES.sinceraFalsa, 'Mentiste en la ronda sincera');
  });
  // hipótesis ganadora: la que más gente se creyó (sin empate)
  const max = Math.max(0, ...hips.map((h) => h.creen.length));
  const top = hips.filter((h) => h.creen.length === max);
  let ganadora = null;
  if (max > 0 && top.length === 1) { ganadora = top[0].hid; anotar(top[0].autorId, AJUSTES.ganadora, '¡Hipótesis ganadora!'); }
  if (est.evento === 'doble') Object.keys(deltas).forEach((id) => { deltas[id] *= 2; motivos[id].forEach((m) => { m.n *= 2; }); });
  est.jugadores.forEach((j) => { j.puntos = Math.max(0, j.puntos + deltas[j.id]); });
  est.resultado = { verdad: [...est.verdad], hipotesis: hips.map((h) => ({ ...h, ganadora: h.hid === ganadora })), deltas, motivos, topoId: est.topoId };
  est.historial.push({ ronda: est.ronda, variante: est.variante, evento: est.evento, deltas });
  setFase(est, 'revelacion', ahora, AJUSTES.revelacionMs);
}

export function continuar(est, id, ahora = null) {
  tick(est, ahora);
  if (est.fase !== 'revelacion') return err('Ahora no toca.');
  const p = jug(est, id);
  if (!p || p.fuera) return err('No puedes actuar.');
  est.listos[id] = true;
  if (activos(est).every((j) => est.listos[j.id])) siguiente(est, ahora);
  return ok();
}

function siguiente(est, ahora) {
  if (est.ronda >= est.cfg.rondas || activos(est).length < AJUSTES.min - 1) return terminar(est);
  empezarRonda(est, ahora);
}

function terminar(est) {
  est.fase = 'fin'; est.limite = null;
  const tabla = est.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, engaños: j.engaños, fuera: j.fuera }))
    .sort((a, b) => (a.fuera - b.fuera) || (b.puntos - a.puntos) || (b.aciertos - a.aciertos));
  const top = tabla.find((t) => !t.fuera);
  const ganadores = top ? tabla.filter((t) => !t.fuera && t.puntos === top.puntos && t.aciertos === top.aciertos).map((t) => t.id) : [];
  const mentiroso = [...tabla].filter((t) => t.engaños > 0).sort((a, b) => b.engaños - a.engaños)[0] || null;
  const detective = [...tabla].sort((a, b) => b.aciertos - a.aciertos)[0] || null;
  est.fin = { tabla, ganadores, premios: { mentiroso: mentiroso && { id: mentiroso.id, n: mentiroso.engaños }, detective: detective && { id: detective.id, n: detective.aciertos } } };
}

// ---------------------------------------------------------------- Reloj, ausencias
export function tick(est, ahora) {
  if (ahora == null || !est.limite || ahora < est.limite) return;
  if (est.fase === 'formular') empezarJuicio(est, ahora);
  else if (est.fase === 'juicio') resolver(est, ahora);
  else if (est.fase === 'revelacion') siguiente(est, ahora);
}

/** El anfitrión avanza sin esperar a quien no responde. */
export function forzar(est, ahora = null) {
  if (est.fase === 'formular') empezarJuicio(est, ahora);
  else if (est.fase === 'juicio') resolver(est, ahora);
  else if (est.fase === 'revelacion') siguiente(est, ahora);
}

export function abandonar(est, id, ahora = null) {
  const p = jug(est, id);
  if (!p || p.fuera || est.fase === 'fin') return;
  p.fuera = true;
  delete est.hipotesis[id]; delete est.votos[id]; delete est.listos[id];
  if (activos(est).length < 2) return terminar(est);
  if (est.fase === 'formular' && activos(est).every((j) => est.hipotesis[j.id])) empezarJuicio(est, ahora);
  else if (est.fase === 'juicio') comprobarJuicio(est, ahora);
  else if (est.fase === 'revelacion' && activos(est).every((j) => est.listos[j.id])) siguiente(est, ahora);
}

export const faltan = (est) => activos(est).filter((j) => (est.fase === 'formular' ? !est.hipotesis[j.id] : !est.listos[j.id])).map((j) => j.id);

// ---------------------------------------------------------------- Vista de un jugador
export function vistaDe(est, id, ahora = null) {
  tick(est, ahora);
  const yo = jug(est, id);
  const V = VARIANTES[est.variante];
  const conocidas = new Set([...(est.conoce[id] || []), ...(est.rumor != null ? [est.rumor] : [])]);
  const revelado = est.fase === 'revelacion' || est.fase === 'fin';
  const ciegas = est.evento === 'ciegas' && est.fase === 'juicio';
  const orden = Object.entries(est.hipotesis).sort((a, b) => a[1].hid.localeCompare(b[1].hid));
  return {
    fase: est.fase, ronda: est.ronda, rondas: est.cfg.rondas, limite: est.limite, ahora,
    variante: est.variante, evento: est.evento, K: est.K,
    casillas: Array.from({ length: est.K }, (_, i) => ({
      i,
      v: revelado || conocidas.has(i) ? est.verdad[i] : null,
      mia: (est.conoce[id] || []).includes(i), rumor: est.rumor === i
    })),
    soyTopo: est.topoId === id && !revelado,
    jugadores: est.jugadores.map((j) => ({
      id: j.id, nombre: j.nombre, puntos: j.puntos, fuera: j.fuera,
      listo: est.fase === 'formular' ? Boolean(est.hipotesis[j.id]) : Boolean(est.listos[j.id])
    })),
    yo: yo ? { id: yo.id, hipotesis: est.hipotesis[id] || null, votos: est.votos[id] || null, seguro: est.seguros[id] ?? null, listo: Boolean(est.listos[id]) } : null,
    hipotesis: est.fase === 'juicio' ? orden.map(([a, h]) => ({
      hid: h.hid, texto: h.texto, mia: Number(a) === id, autorId: ciegas && Number(a) !== id ? null : Number(a),
      reacciones: Object.values(est.reacciones[h.hid] || {}).reduce((acc, e) => ({ ...acc, [e]: (acc[e] || 0) + 1 }), {}),
      miReaccion: est.reacciones[h.hid]?.[id] || null
    })) : [],
    faltan: faltan(est),
    resultado: revelado ? est.resultado : null,
    historial: est.historial,
    fin: est.fase === 'fin' ? est.fin : null,
    valores: V.valores
  };
}
