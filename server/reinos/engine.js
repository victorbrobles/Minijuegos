// server/reinos/engine.js
// Motor puro de «Los Siete Reinos». Lo usan las salas online (server/routes/reinos.js) y, copiado al cliente con
// `npm run sync:reinos`, el modo «un solo dispositivo».
//
// Cada jugador gobierna un reino en un mapa de hexágonos: territorios que producen oro y alimento, soldados que hay
// que alimentar y siete TRONOS repartidos por el mapa. Cada ronda:
//   1. Ingresos y manutención (cada 2 soldados comen 1 de alimento; si falta, desertan).
//   2. Órdenes SECRETAS y simultáneas: dos acciones por reino (conquistar, entrenar, fortificar, comerciar o negociar).
//   3. Diplomacia: los reinos responden a las propuestas recibidas (alianzas e intercambios).
//   4. Resolución, todo a la vez: pactos → mercado → reclutas y murallas → movimientos y batallas.
// Gana quien más puntos tiene al final (tronos, territorios y objetivos secretos), o quien domine 4 tronos.
// Las batallas no tienen azar: fuerza = soldados (+2 por nivel de muralla al defender). Atacar a un aliado es
// una TRAICIÓN: rompe la alianza, queda a la vista de todos y resta puntos al final.

export const AJUSTES = {
  min: 2, max: 7, radio: 3, acciones: 2,
  inicio: { oro: 6, alimento: 6, soldados: 4 },
  coste: { soldadoOro: 2, soldadoAlimento: 1, muralla: 4 }, maxEntrenar: 5, maxMuralla: 3,
  mercado: { da: 3, recibe: 2, maxLotes: 3 },
  puntos: { trono: 3, territorio: 1, objetivo: 5, traicion: -2 }, tronosVictoria: 4, botin: 5
};
export const OPCIONES_RONDAS = [6, 8, 10, 12];

export const REINOS = [
  { nombre: 'Reino del León', e: '🦁', c: '#dc2626' },
  { nombre: 'Reino del Águila', e: '🦅', c: '#2563eb' },
  { nombre: 'Reino del Ciervo', e: '🦌', c: '#16a34a' },
  { nombre: 'Reino del Dragón', e: '🐉', c: '#9333ea' },
  { nombre: 'Reino del Lobo', e: '🐺', c: '#475569' },
  { nombre: 'Reino del Halcón', e: '🦉', c: '#ea580c' },
  { nombre: 'Reino del Oso', e: '🐻', c: '#a16207' }
];
export const TIPOS = {
  capital: { nombre: 'Capital', e: '🏰', oro: 3, alimento: 3 },
  trono: { nombre: 'Trono', e: '👑', oro: 1, alimento: 1 },
  granja: { nombre: 'Granja', e: '🌾', oro: 0, alimento: 2 },
  mina: { nombre: 'Mina', e: '⛏️', oro: 2, alimento: 0 },
  ciudad: { nombre: 'Ciudad', e: '🏘️', oro: 1, alimento: 1 }
};
export const ACCIONES = {
  conquistar: { nombre: 'Conquistar', e: '⚔️', desc: 'Mueve soldados a un territorio vecino: si es tuyo, refuerzas; si no, atacas.' },
  entrenar: { nombre: 'Entrenar tropas', e: '🛡️', desc: `Recluta hasta ${AJUSTES.maxEntrenar} soldados en un territorio tuyo (${AJUSTES.coste.soldadoOro} oro + ${AJUSTES.coste.soldadoAlimento} alimento cada uno).` },
  fortificar: { nombre: 'Fortificar', e: '🧱', desc: `Sube un nivel de muralla (máx. ${AJUSTES.maxMuralla}) por ${AJUSTES.coste.muralla} de oro: +2 de defensa por nivel.` },
  comerciar: { nombre: 'Comerciar', e: '⚖️', desc: `Cambia en el mercado ${AJUSTES.mercado.da} de oro por ${AJUSTES.mercado.recibe} de alimento (o al revés), hasta ${AJUSTES.mercado.maxLotes} veces.` },
  negociar: { nombre: 'Negociar', e: '🤝', desc: 'Propón a otro reino una alianza, un intercambio de recursos o rompe una alianza.' }
};
export const OBJETIVOS = {
  tesoro: { nombre: 'Tesoro real', desc: 'Termina con 15 de oro o más.' },
  granero: { nombre: 'Graneros llenos', desc: 'Termina con 15 de alimento o más.' },
  ejercito: { nombre: 'Gran ejército', desc: 'Termina con 18 soldados o más.' },
  imperio: { nombre: 'Imperio', desc: 'Termina con 9 territorios o más.' },
  murallas: { nombre: 'Maestro de murallas', desc: 'Suma 5 niveles de muralla entre tus territorios.' },
  regicida: { nombre: 'Regicida', desc: 'Termina controlando la capital de otro reino.' },
  diplomatico: { nombre: 'Diplomático', desc: 'Termina con 2 alianzas activas o más.' },
  pacifista: { nombre: 'Pacifista', desc: 'No ataques nunca a otro reino y termina con 6 territorios o más.' },
  punal: { nombre: 'Puñal en la espalda', desc: 'Traiciona a un aliado y gana esa batalla.' },
  dosTronos: { nombre: 'Doble corona', desc: 'Termina controlando 2 tronos o más.' },
  invicto: { nombre: 'Invicto', desc: 'No pierdas ningún territorio en toda la partida.' },
  mercader: { nombre: 'Mercader', desc: 'Cierra 3 intercambios con otros reinos.' },
  tronoSol: { nombre: 'El Trono del Sol', desc: 'Termina controlando el Trono del Sol (el del centro).' }
};

// ---------------------------------------------------------------- Mapa (hexágonos, coordenadas axiales)
const DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
const clave = (q, r) => `${q},${r}`;
const dist = (a, b) => (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.q + a.r - b.q - b.r)) / 2;
/** Hexágonos del anillo `k` en orden alrededor del centro. */
function anillo(k) {
  if (k === 0) return [{ q: 0, r: 0 }];
  const res = [];
  let q = -k; let r = k; // empieza en la esquina suroeste
  for (let d = 0; d < 6; d++) for (let i = 0; i < k; i++) { res.push({ q, r }); q += DIRS[d][0]; r += DIRS[d][1]; }
  return res;
}
const NOMBRES_TRONO = ['del Norte', 'del Este', 'del Sureste', 'del Sur', 'del Oeste', 'del Noroeste'];

/** Crea el mapa para `n` reinos: capitales repartidas por el borde, tronos en el centro y el anillo 2. */
export function crearMapa(n, rng = Math.random) {
  const R = AJUSTES.radio;
  const hexes = [];
  for (let k = 0; k <= R; k++) anillo(k).forEach((h) => hexes.push(h));
  const idx = new Map(hexes.map((h, i) => [clave(h.q, h.r), i]));
  const t = hexes.map((h, i) => ({ id: i, q: h.q, r: h.r, tipo: null, nombre: null, dueno: null, soldados: 0, muralla: 0, capitalDe: null, vecinos: [] }));
  t.forEach((x) => { x.vecinos = DIRS.map(([dq, dr]) => idx.get(clave(x.q + dq, x.r + dr))).filter((v) => v != null); });
  // Tronos: el centro y seis del anillo 2 (uno de cada dos)
  const centro = t[idx.get(clave(0, 0))];
  centro.tipo = 'trono'; centro.nombre = 'Trono del Sol'; centro.soldados = 5; centro.muralla = 1;
  anillo(2).filter((_, i) => i % 2 === 1).forEach((h, k) => {
    const x = t[idx.get(clave(h.q, h.r))];
    x.tipo = 'trono'; x.nombre = `Trono ${NOMBRES_TRONO[k]}`; x.soldados = 3; x.muralla = 1;
  });
  // Capitales: repartidas por el anillo exterior
  const borde = anillo(R);
  const capitales = Array.from({ length: n }, (_, k) => t[idx.get(clave(borde[Math.round((k * borde.length) / n) % borde.length].q, borde[Math.round((k * borde.length) / n) % borde.length].r))]);
  // El resto: granjas, minas y ciudades con alguna guarnición neutral
  const tipos = ['granja', 'mina', 'ciudad'];
  t.forEach((x) => {
    if (x.tipo) return;
    x.tipo = tipos[Math.floor(rng() * tipos.length)];
    x.soldados = 1 + Math.floor(rng() * 2);
  });
  // Cada capital tiene al lado al menos una granja y una mina (y sus vecinos empiezan sin guarnición fuerte)
  capitales.forEach((cap) => {
    const vec = cap.vecinos.map((v) => t[v]).filter((x) => x.tipo !== 'trono' && !capitales.includes(x));
    if (vec[0]) vec[0].tipo = 'granja';
    if (vec[1]) vec[1].tipo = 'mina';
    vec.forEach((x) => { x.soldados = 1; });
  });
  return { territorios: t, capitales: capitales.map((c) => c.id) };
}

// ---------------------------------------------------------------- Utilidades
const jug = (p, id) => p.reinos.find((r) => r.id === id);
const vivos = (p) => p.reinos.filter((r) => !r.fuera && !r.eliminado);
const nombreR = (p, id) => (id == null ? 'los neutrales' : jug(p, id)?.nombre ?? '¿?');
const territoriosDe = (p, id) => p.mapa.filter((x) => x.dueno === id);
const aliados = (p, a, b) => a != null && b != null && p.alianzas.some((al) => (al[0] === a && al[1] === b) || (al[0] === b && al[1] === a));
const barajar = (arr, rng) => { const b = [...arr]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

function cronica(p, texto, tipo = 'info', implicados = []) {
  p.nlog += 1;
  const e = { n: p.nlog, ronda: p.ronda, texto, tipo, implicados };
  p.cronica.push(e);
  p.log.push(e);
  if (p.log.length > 80) p.log.shift();
}

// ---------------------------------------------------------------- Partida
/** jugadores: [{ id, nombre }]. reglas: { rondas }. */
export function crearPartida(jugadores, reglas = {}, ahora = Date.now(), rng = Math.random) {
  void ahora;
  const n = Math.min(AJUSTES.max, jugadores.length);
  const { territorios, capitales } = crearMapa(n, rng);
  const orden = barajar(REINOS.map((_, k) => k), rng).slice(0, n);
  const objs = Object.keys(OBJETIVOS);
  const p = {
    rondas: OPCIONES_RONDAS.includes(Number(reglas.rondas)) ? Number(reglas.rondas) : 8,
    ronda: 0, fase: 'ordenes', mapa: territorios, alianzas: [], propuestas: [], nprop: 0,
    reinos: jugadores.slice(0, n).map((j, k) => {
      const R = REINOS[orden[k]];
      const elegidos = barajar(objs, rng).slice(0, 2);
      return {
        id: j.id, jugador: j.nombre, nombre: R.nombre, e: R.e, c: R.c, capital: capitales[k],
        oro: AJUSTES.inicio.oro, alimento: AJUSTES.inicio.alimento, objetivos: elegidos,
        ordenes: null, listo: false, fuera: false, eliminado: false,
        historia: { atacoReino: false, perdioTerritorio: false, punal: false, intercambios: 0, traiciones: 0 }
      };
    }),
    cronica: [], log: [], nlog: 0, listosCronica: [], fin: null
  };
  p.reinos.forEach((r) => {
    const cap = p.mapa[r.capital];
    Object.assign(cap, { tipo: 'capital', dueno: r.id, capitalDe: r.id, soldados: AJUSTES.inicio.soldados, muralla: 1, nombre: `Capital del ${r.nombre.replace('Reino del ', '')}` });
  });
  empezarRonda(p);
  return p;
}

function empezarRonda(p) {
  p.ronda += 1;
  p.fase = 'ordenes';
  p.cronica = [];
  p.propuestas = [];
  p.listosCronica = [];
  cronica(p, `— Ronda ${p.ronda} de ${p.rondas} —`, 'titulo');
  vivos(p).forEach((r) => {
    r.ordenes = null;
    r.listo = false;
    // Ingresos
    let oro = 0; let ali = 0;
    territoriosDe(p, r.id).forEach((x) => { oro += TIPOS[x.tipo].oro; ali += TIPOS[x.tipo].alimento; });
    r.oro += oro;
    r.alimento += ali;
    r.ingresos = { oro, alimento: ali };
    // Manutención: cada 2 soldados comen 1 de alimento
    const soldados = territoriosDe(p, r.id).reduce((a, x) => a + x.soldados, 0);
    const come = Math.ceil(soldados / 2);
    r.ingresos.comen = come;
    if (r.alimento >= come) r.alimento -= come;
    else {
      const falta = come - r.alimento;
      r.alimento = 0;
      let desertan = falta * 2;
      const lista = territoriosDe(p, r.id).sort((a, b) => b.soldados - a.soldados);
      for (const x of lista) { const q = Math.min(x.soldados, desertan); x.soldados -= q; desertan -= q; if (!desertan) break; }
      cronica(p, `🍞 El ${r.nombre} no tiene alimento para su ejército: desertan ${falta * 2 - desertan} soldados.`, 'malo', [r.id]);
    }
  });
  p.reinos.filter((r) => r.fuera || r.eliminado).forEach((r) => { r.ordenes = []; r.listo = true; });
}

// ---------------------------------------------------------------- Órdenes
function validar(p, r, acciones) {
  if (!Array.isArray(acciones) || acciones.length > AJUSTES.acciones) return `Como mucho ${AJUSTES.acciones} acciones.`;
  let oro = 0; let ali = 0;
  const salen = {};
  const muros = {};
  const limpias = [];
  for (const a of acciones) {
    const tipo = a?.tipo;
    if (tipo === 'conquistar') {
      const o = p.mapa[Number(a.desde)]; const d = p.mapa[Number(a.hacia)]; const n = Math.floor(Number(a.soldados));
      if (!o || o.dueno !== r.id) return 'Elige un territorio tuyo de origen.';
      if (!d || !o.vecinos.includes(d.id)) return 'Solo se puede ir a un territorio vecino.';
      if (!(n >= 1)) return 'Envía al menos un soldado.';
      salen[o.id] = (salen[o.id] || 0) + n;
      if (salen[o.id] > o.soldados) return `En ${o.nombre || TIPOS[o.tipo].nombre} solo tienes ${o.soldados} soldados.`;
      limpias.push({ tipo, desde: o.id, hacia: d.id, soldados: n });
    } else if (tipo === 'entrenar') {
      const x = p.mapa[Number(a.en)]; const n = Math.floor(Number(a.soldados));
      if (!x || x.dueno !== r.id) return 'Solo puedes entrenar en tus territorios.';
      if (!(n >= 1 && n <= AJUSTES.maxEntrenar)) return `Entre 1 y ${AJUSTES.maxEntrenar} soldados.`;
      oro += n * AJUSTES.coste.soldadoOro; ali += n * AJUSTES.coste.soldadoAlimento;
      limpias.push({ tipo, en: x.id, soldados: n });
    } else if (tipo === 'fortificar') {
      const x = p.mapa[Number(a.en)];
      if (!x || x.dueno !== r.id) return 'Solo puedes fortificar tus territorios.';
      muros[x.id] = (muros[x.id] || 0) + 1;
      if (x.muralla + muros[x.id] > AJUSTES.maxMuralla) return `La muralla ya está al máximo (${AJUSTES.maxMuralla}).`;
      oro += AJUSTES.coste.muralla;
      limpias.push({ tipo, en: x.id });
    } else if (tipo === 'comerciar') {
      const da = a.da === 'alimento' ? 'alimento' : 'oro'; const lotes = Math.floor(Number(a.lotes));
      if (!(lotes >= 1 && lotes <= AJUSTES.mercado.maxLotes)) return `Entre 1 y ${AJUSTES.mercado.maxLotes} lotes.`;
      if (da === 'oro') oro += lotes * AJUSTES.mercado.da; else ali += lotes * AJUSTES.mercado.da;
      limpias.push({ tipo, da, lotes });
    } else if (tipo === 'negociar') {
      const otro = jug(p, a.a);
      if (!otro || otro.id === r.id || otro.fuera || otro.eliminado) return 'Elige otro reino.';
      const clase = ['alianza', 'intercambio', 'romper'].includes(a.clase) ? a.clase : null;
      if (!clase) return 'Elige qué propones.';
      if (clase === 'alianza' && aliados(p, r.id, otro.id)) return `Ya sois aliados del ${otro.nombre}.`;
      if (clase === 'romper' && !aliados(p, r.id, otro.id)) return `No sois aliados del ${otro.nombre}.`;
      const doy = { oro: Math.max(0, Math.floor(Number(a.doy?.oro) || 0)), alimento: Math.max(0, Math.floor(Number(a.doy?.alimento) || 0)) };
      const pido = { oro: Math.max(0, Math.floor(Number(a.pido?.oro) || 0)), alimento: Math.max(0, Math.floor(Number(a.pido?.alimento) || 0)) };
      if (clase === 'intercambio' && !doy.oro && !doy.alimento && !pido.oro && !pido.alimento) return 'Di qué das y qué pides.';
      if (clase === 'intercambio') { oro += doy.oro; ali += doy.alimento; }
      limpias.push({ tipo, a: otro.id, clase, doy, pido });
    } else return 'Acción desconocida.';
  }
  if (oro > r.oro) return `Te falta oro: necesitas ${oro} y tienes ${r.oro}.`;
  if (ali > r.alimento) return `Te falta alimento: necesitas ${ali} y tienes ${r.alimento}.`;
  return limpias;
}

/** El reino entrega sus órdenes (secretas). Mientras los demás no hayan terminado, puede cambiarlas. */
export function ordenar(p, id, acciones) {
  if (p.fase !== 'ordenes') return { ok: false, error: 'Ahora no se dan órdenes.' };
  const r = jug(p, id);
  if (!r || r.fuera || r.eliminado) return { ok: false, error: 'No gobiernas ningún reino.' };
  const v = validar(p, r, acciones);
  if (typeof v === 'string') return { ok: false, error: v };
  // Sustituye sus propuestas anteriores (las ya respondidas se mantienen)
  p.propuestas = p.propuestas.filter((x) => x.de !== id || x.estado !== 'pendiente');
  v.filter((a) => a.tipo === 'negociar').forEach((a) => {
    p.nprop += 1;
    p.propuestas.push({ id: p.nprop, de: id, a: a.a, clase: a.clase, doy: a.doy, pido: a.pido, estado: a.clase === 'romper' ? 'aceptada' : 'pendiente' });
  });
  r.ordenes = v;
  r.listo = true;
  comprobarListos(p);
  return { ok: true };
}

/** Quiere cambiar sus órdenes (solo mientras alguien no haya terminado). */
export function retirar(p, id) {
  if (p.fase !== 'ordenes') return { ok: false, error: 'Ya no se pueden cambiar.' };
  const r = jug(p, id);
  if (!r?.listo) return { ok: false, error: 'No has dado órdenes.' };
  r.listo = false;
  r.ordenes = null;
  p.propuestas = p.propuestas.filter((x) => x.de !== id || x.estado !== 'pendiente');
  return { ok: true };
}

/** Responder a una propuesta recibida (en cualquier momento antes de resolver). */
export function responder(p, id, propuestaId, acepta) {
  if (p.fase !== 'ordenes' && p.fase !== 'diplomacia') return { ok: false, error: 'Ahora no.' };
  const pr = p.propuestas.find((x) => x.id === Number(propuestaId));
  if (!pr || pr.a !== id) return { ok: false, error: 'Esa propuesta no es para ti.' };
  if (pr.estado !== 'pendiente') return { ok: false, error: 'Ya la has respondido.' };
  pr.estado = acepta ? 'aceptada' : 'rechazada';
  if (p.fase === 'diplomacia' && !p.propuestas.some((x) => x.estado === 'pendiente')) resolver(p);
  return { ok: true };
}

function comprobarListos(p) {
  if (!vivos(p).every((r) => r.listo)) return;
  // Propuestas a reinos que ya no juegan: rechazadas
  p.propuestas.forEach((x) => { if (x.estado === 'pendiente' && !vivos(p).some((r) => r.id === x.a)) x.estado = 'rechazada'; });
  if (p.propuestas.some((x) => x.estado === 'pendiente')) { p.fase = 'diplomacia'; return; }
  resolver(p);
}

// ---------------------------------------------------------------- Resolución
function resolver(p) {
  p.fase = 'resolviendo';
  const act = vivos(p);
  // 1. Diplomacia
  p.propuestas.forEach((x) => {
    const a = jug(p, x.de); const b = jug(p, x.a);
    if (!a || !b) return;
    if (x.clase === 'romper') {
      p.alianzas = p.alianzas.filter((al) => !(al.includes(a.id) && al.includes(b.id)));
      cronica(p, `💔 El ${a.nombre} rompe su alianza con el ${b.nombre}.`, 'malo', [a.id, b.id]);
    } else if (x.estado !== 'aceptada') {
      cronica(p, `${b.nombre} rechaza ${x.clase === 'alianza' ? 'la alianza' : 'el intercambio'} del ${a.nombre}.`, 'info', [a.id, b.id]);
    } else if (x.clase === 'alianza') {
      if (!aliados(p, a.id, b.id)) p.alianzas.push([a.id, b.id]);
      cronica(p, `🤝 Alianza entre el ${a.nombre} y el ${b.nombre}.`, 'bueno', [a.id, b.id]);
    } else {
      const puede = b.oro >= x.pido.oro && b.alimento >= x.pido.alimento && a.oro >= x.doy.oro && a.alimento >= x.doy.alimento;
      if (!puede) { cronica(p, `El intercambio entre el ${a.nombre} y el ${b.nombre} falla: no tenían los recursos.`, 'malo', [a.id, b.id]); return; }
      a.oro += x.pido.oro - x.doy.oro; a.alimento += x.pido.alimento - x.doy.alimento;
      b.oro += x.doy.oro - x.pido.oro; b.alimento += x.doy.alimento - x.pido.alimento;
      a.historia.intercambios += 1; b.historia.intercambios += 1;
      cronica(p, `⚖️ Intercambio: el ${a.nombre} da ${textoRec(x.doy)} y recibe ${textoRec(x.pido)} del ${b.nombre}.`, 'bueno', [a.id, b.id]);
    }
  });
  // 2. Mercado, reclutas y murallas
  act.forEach((r) => (r.ordenes || []).forEach((o) => {
    if (o.tipo === 'comerciar') {
      const recibe = o.da === 'oro' ? 'alimento' : 'oro';
      const pagar = o.lotes * AJUSTES.mercado.da;
      if (r[o.da] < pagar) return;
      r[o.da] -= pagar; r[recibe] += o.lotes * AJUSTES.mercado.recibe;
      cronica(p, `⚖️ El ${r.nombre} comercia en el mercado.`, 'info', [r.id]);
    }
  }));
  act.forEach((r) => (r.ordenes || []).forEach((o) => {
    const x = o.en != null ? p.mapa[o.en] : null;
    if (o.tipo === 'entrenar' && x?.dueno === r.id) {
      const n = Math.min(o.soldados, Math.floor(r.oro / AJUSTES.coste.soldadoOro), Math.floor(r.alimento / AJUSTES.coste.soldadoAlimento));
      if (n <= 0) return;
      r.oro -= n * AJUSTES.coste.soldadoOro; r.alimento -= n * AJUSTES.coste.soldadoAlimento; x.soldados += n;
      cronica(p, `🛡️ El ${r.nombre} entrena ${n} soldados.`, 'info', [r.id]);
    }
    if (o.tipo === 'fortificar' && x?.dueno === r.id && x.muralla < AJUSTES.maxMuralla && r.oro >= AJUSTES.coste.muralla) {
      r.oro -= AJUSTES.coste.muralla; x.muralla += 1;
      cronica(p, `🧱 El ${r.nombre} levanta murallas (nivel ${x.muralla}).`, 'info', [r.id]);
    }
  }));
  // 3. Movimientos: salen todos a la vez
  const llegadas = {}; // destino -> [{ reino, soldados, desde }]
  act.forEach((r) => (r.ordenes || []).forEach((o) => {
    if (o.tipo !== 'conquistar') return;
    const desde = p.mapa[o.desde];
    if (desde.dueno !== r.id) return;
    const n = Math.min(o.soldados, desde.soldados);
    if (n <= 0) return;
    desde.soldados -= n;
    (llegadas[o.hacia] ||= []).push({ reino: r.id, soldados: n, desde: desde.id });
  }));
  // Refuerzos a territorios propios (llegan antes de las batallas)
  Object.entries(llegadas).forEach(([dest, lista]) => {
    const x = p.mapa[dest];
    llegadas[dest] = lista.filter((l) => { if (l.reino === x.dueno) { x.soldados += l.soldados; return false; } return true; });
  });
  // 4. Batallas
  Object.entries(llegadas).forEach(([dest, lista]) => { if (lista.length) batalla(p, p.mapa[dest], lista); });
  // 5. Reinos sin territorios: eliminados
  act.forEach((r) => {
    if (!territoriosDe(p, r.id).length) { r.eliminado = true; cronica(p, `☠️ El ${r.nombre} ha caído: ya no le quedan territorios.`, 'malo', [r.id]); }
  });
  p.alianzas = p.alianzas.filter((al) => al.every((id) => vivos(p).some((r) => r.id === id)));
  // ¿Fin?
  const conTronos = vivos(p).find((r) => tronosDe(p, r.id) >= AJUSTES.tronosVictoria);
  if (conTronos || p.ronda >= p.rondas || vivos(p).length <= 1) { finalizar(p, conTronos?.id ?? null); return; }
  p.fase = 'cronica';
  p.listosCronica = p.reinos.filter((r) => r.fuera || r.eliminado).map((r) => r.id);
}

const textoRec = (x) => [x.oro ? `${x.oro} de oro` : '', x.alimento ? `${x.alimento} de alimento` : ''].filter(Boolean).join(' y ') || 'nada';
const tronosDe = (p, id) => p.mapa.filter((x) => x.tipo === 'trono' && x.dueno === id).length;
const nombreT = (x) => x.nombre || `${TIPOS[x.tipo].nombre} ${x.id}`;

function batalla(p, x, atacantes) {
  const defensor = x.dueno;
  // Traiciones: atacar el territorio de un aliado rompe la alianza
  atacantes.forEach((a) => {
    if (defensor != null && aliados(p, a.reino, defensor)) {
      p.alianzas = p.alianzas.filter((al) => !(al.includes(a.reino) && al.includes(defensor)));
      const r = jug(p, a.reino);
      r.historia.traiciones += 1;
      a.traicion = true;
      cronica(p, `🗡️ ¡TRAICIÓN! El ${r.nombre} ataca a su aliado, el ${nombreR(p, defensor)}.`, 'malo', [a.reino, defensor]);
    }
    if (defensor != null) jug(p, a.reino).historia.atacoReino = true;
  });
  // Bandos: los aliados que atacan juntos suman fuerzas
  const bandos = [];
  atacantes.forEach((a) => {
    const b = bandos.find((g) => g.miembros.some((m) => m.reino === a.reino || aliados(p, m.reino, a.reino)));
    if (b) b.miembros.push(a); else bandos.push({ miembros: [a] });
  });
  bandos.forEach((b) => { b.fuerza = b.miembros.reduce((s, m) => s + m.soldados, 0); });
  const def = { defensor: true, fuerza: x.soldados + 2 * x.muralla };
  const todos = [def, ...bandos].sort((a, b) => b.fuerza - a.fuerza);
  const [primero, segundo] = todos;
  const titulo = `${defensor == null ? '' : `del ${nombreR(p, defensor)} `}`;
  const quien = (b) => (b.defensor ? `${nombreR(p, defensor)} (defiende con ${x.soldados}${x.muralla ? ` + muralla ${x.muralla}` : ''})` : b.miembros.map((m) => `${nombreR(p, m.reino)} (${m.soldados})`).join(' + '));
  const implicados = [defensor, ...atacantes.map((a) => a.reino)].filter((v) => v != null);
  const retirada = (b) => b.miembros.forEach((m) => {
    const vuelven = Math.floor(m.soldados / 3);
    const o = p.mapa[m.desde];
    if (vuelven && o.dueno === m.reino) o.soldados += vuelven;
  });
  if (segundo && primero.fuerza === segundo.fuerza && !primero.defensor && !segundo.defensor) {
    // Empate entre atacantes: nadie entra; todos pierden la mitad
    bandos.forEach((b) => b.miembros.forEach((m) => { const o = p.mapa[m.desde]; if (o.dueno === m.reino) o.soldados += Math.floor(m.soldados / 2); }));
    x.soldados = Math.max(0, x.soldados - Math.ceil((segundo.fuerza) / 2));
    cronica(p, `⚔️ ${nombreT(x)} ${titulo}: choque igualado entre ${bandos.map(quien).join(' y ')}. Nadie entra.`, 'info', implicados);
    return;
  }
  const ganaDefensa = primero.defensor || (segundo && segundo.defensor && primero.fuerza === segundo.fuerza);
  if (ganaDefensa) {
    const rival = todos.find((b) => !b.defensor);
    x.soldados = Math.max(0, x.soldados - Math.ceil((rival?.fuerza || 0) / 2));
    bandos.forEach(retirada);
    cronica(p, `🛡️ ${nombreT(x)} ${titulo}resiste: ${quien(def)} frena a ${bandos.map(quien).join(' y ')}.`, defensor == null ? 'info' : 'bueno', implicados);
    return;
  }
  // Gana un bando atacante: entra quien más soldados aporta
  const ganador = primero;
  const bajas = Math.ceil((segundo?.fuerza || 0) / 2);
  const dentro = Math.max(1, ganador.fuerza - bajas);
  const jefe = [...ganador.miembros].sort((a, b) => b.soldados - a.soldados)[0];
  // El resto del bando ganador vuelve a casa con su parte de supervivientes
  ganador.miembros.filter((m) => m !== jefe).forEach((m) => {
    const parte = Math.floor((m.soldados / ganador.fuerza) * dentro);
    const o = p.mapa[m.desde];
    if (parte && o.dueno === m.reino) o.soldados += parte;
  });
  const propios = Math.max(1, Math.round((jefe.soldados / ganador.fuerza) * dentro));
  bandos.filter((b) => b !== ganador).forEach(retirada);
  if (defensor != null) jug(p, defensor).historia.perdioTerritorio = true;
  if (jefe.traicion) jug(p, jefe.reino).historia.punal = true;
  const antes = x.dueno;
  x.dueno = jefe.reino;
  x.soldados = propios;
  if (x.muralla > 0) x.muralla -= 1;
  const conquistador = jug(p, jefe.reino);
  let extra = '';
  if (x.tipo === 'capital' && antes != null) { conquistador.oro += AJUSTES.botin; extra = ` ¡Saquea la capital: +${AJUSTES.botin} de oro!`; }
  cronica(p, `🏴 ${nombreT(x)} ${titulo}cae: ${quien(ganador)} vence${segundo ? ` a ${quien(segundo)}` : ''}. Ahora es del ${conquistador.nombre}.${extra}`, 'malo', implicados);
}

// ---------------------------------------------------------------- Puntos y final
export function cumple(p, r, obj) {
  const ts = territoriosDe(p, r.id);
  const h = r.historia;
  switch (obj) {
    case 'tesoro': return r.oro >= 15;
    case 'granero': return r.alimento >= 15;
    case 'ejercito': return ts.reduce((a, x) => a + x.soldados, 0) >= 18;
    case 'imperio': return ts.length >= 9;
    case 'murallas': return ts.reduce((a, x) => a + x.muralla, 0) >= 5;
    case 'regicida': return ts.some((x) => x.capitalDe != null && x.capitalDe !== r.id);
    case 'diplomatico': return p.alianzas.filter((al) => al.includes(r.id)).length >= 2;
    case 'pacifista': return !h.atacoReino && ts.length >= 6;
    case 'punal': return h.punal;
    case 'dosTronos': return tronosDe(p, r.id) >= 2;
    case 'invicto': return !h.perdioTerritorio;
    case 'mercader': return h.intercambios >= 3;
    case 'tronoSol': return p.mapa.some((x) => x.nombre === 'Trono del Sol' && x.dueno === r.id);
    default: return false;
  }
}

export function puntuacion(p, r) {
  const ts = territoriosDe(p, r.id);
  const tronos = ts.filter((x) => x.tipo === 'trono').length;
  const objetivos = r.objetivos.map((o) => ({ id: o, ...OBJETIVOS[o], cumplido: cumple(p, r, o) }));
  const total = tronos * AJUSTES.puntos.trono + (ts.length - tronos) * AJUSTES.puntos.territorio
    + objetivos.filter((o) => o.cumplido).length * AJUSTES.puntos.objetivo + r.historia.traiciones * AJUSTES.puntos.traicion;
  return { tronos, territorios: ts.length, objetivos, traiciones: r.historia.traiciones, total };
}

function finalizar(p, porTronos = null) {
  p.fase = 'fin';
  const tabla = p.reinos.map((r) => ({ id: r.id, nombre: r.nombre, jugador: r.jugador, e: r.e, c: r.c, eliminado: r.eliminado, fuera: r.fuera, ...puntuacion(p, r) }))
    .sort((a, b) => (b.id === porTronos) - (a.id === porTronos) || b.total - a.total || b.tronos - a.tronos || b.territorios - a.territorios);
  const top = tabla[0];
  const ganadores = porTronos != null ? [porTronos] : tabla.filter((t) => t.total === top.total && t.tronos === top.tronos && t.territorios === top.territorios).map((t) => t.id);
  p.fin = { tabla, ganadores, porTronos };
  cronica(p, porTronos != null ? `👑 ¡El ${nombreR(p, porTronos)} domina ${AJUSTES.tronosVictoria} tronos y gana la partida!` : '🏁 Fin de la partida: se cuentan los puntos.', 'titulo');
}

/** Tras leer la crónica, cada reino pulsa «seguir». */
export function seguir(p, id) {
  if (p.fase !== 'cronica') return { ok: false, error: 'Ahora no.' };
  if (!p.listosCronica.includes(id)) p.listosCronica.push(id);
  if (vivos(p).every((r) => p.listosCronica.includes(r.id))) empezarRonda(p);
  return { ok: true };
}

/** El anfitrión desbloquea la partida: órdenes vacías, propuestas rechazadas o siguiente ronda. */
export function forzar(p) {
  if (p.fase === 'ordenes') { vivos(p).forEach((r) => { if (!r.listo) { r.ordenes = []; r.listo = true; } }); comprobarListos(p); return { ok: true }; }
  if (p.fase === 'diplomacia') { p.propuestas.forEach((x) => { if (x.estado === 'pendiente') x.estado = 'rechazada'; }); resolver(p); return { ok: true }; }
  if (p.fase === 'cronica') { empezarRonda(p); return { ok: true }; }
  return { ok: false, error: 'Nada que forzar.' };
}

export function terminar(p) {
  if (p.fase === 'fin') return { ok: false, error: 'La partida ya ha terminado.' };
  finalizar(p);
  return { ok: true };
}

export const tick = () => false;

export function abandonar(p, id) {
  const r = jug(p, id);
  if (!r || r.fuera || p.fase === 'fin') return;
  r.fuera = true;
  r.listo = true;
  r.ordenes = r.ordenes || [];
  p.propuestas.forEach((x) => { if (x.a === id && x.estado === 'pendiente') x.estado = 'rechazada'; });
  p.alianzas = p.alianzas.filter((al) => !al.includes(id));
  cronica(p, `🚪 ${r.jugador} abandona: el ${r.nombre} queda sin rey (sus tropas solo defienden).`, 'malo', [id]);
  if (vivos(p).length <= 1) { finalizar(p); return; }
  if (p.fase === 'ordenes') comprobarListos(p);
  else if (p.fase === 'diplomacia' && !p.propuestas.some((x) => x.estado === 'pendiente')) resolver(p);
  else if (p.fase === 'cronica' && vivos(p).every((x) => p.listosCronica.includes(x.id))) empezarRonda(p);
}

// ---------------------------------------------------------------- Vista
export function vistaDe(p, id) {
  const yo = jug(p, id);
  const fin = p.fase === 'fin';
  return {
    fase: p.fase, ronda: p.ronda, rondas: p.rondas,
    mapa: p.mapa.map((x) => ({ id: x.id, q: x.q, r: x.r, tipo: x.tipo, nombre: x.nombre, dueno: x.dueno, soldados: x.soldados, muralla: x.muralla, capitalDe: x.capitalDe, vecinos: x.vecinos })),
    reinos: p.reinos.map((r) => ({
      id: r.id, nombre: r.nombre, jugador: r.jugador, e: r.e, c: r.c, capital: r.capital, listo: r.listo, fuera: r.fuera, eliminado: r.eliminado,
      territorios: territoriosDe(p, r.id).length, tronos: tronosDe(p, r.id), soldados: territoriosDe(p, r.id).reduce((a, x) => a + x.soldados, 0),
      traiciones: r.historia.traiciones, listoCronica: p.listosCronica.includes(r.id),
      ...(fin || r.id === id ? { oro: r.oro, alimento: r.alimento } : {})
    })),
    alianzas: p.alianzas.map((a) => [...a]),
    yo: yo ? {
      id: yo.id, oro: yo.oro, alimento: yo.alimento, ingresos: yo.ingresos, ordenes: yo.ordenes, listo: yo.listo,
      objetivos: yo.objetivos.map((o) => ({ id: o, ...OBJETIVOS[o], cumplido: cumple(p, yo, o) })),
      eliminado: yo.eliminado
    } : null,
    propuestas: p.propuestas.filter((x) => x.de === id || x.a === id).map((x) => ({ ...x })),
    cronica: p.fase === 'ordenes' || p.fase === 'diplomacia' ? [] : p.cronica.map((e) => ({ ...e })),
    log: p.log.slice(-30),
    fin: p.fin
  };
}
