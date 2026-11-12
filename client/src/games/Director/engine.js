// server/director/engine.js
// Motor puro de «Director Deportivo». Lo usan las salas online (server/routes/director.js) y, copiado al cliente con
// `npm run sync:director`, el modo «un solo dispositivo».
//
// Cada jugador dirige un club con un presupuesto. Elige formación y, en varios MERCADOS, puja en secreto por
// futbolistas reales (gana la puja más alta y paga lo que pujó). Si hay pocos clubes, se completan con clubes de la
// máquina. Al acabar los mercados, cada uno elige táctica y se simula una liga a doble vuelta en la que cuentan:
// la media de cada línea (y si cada uno juega en su posición), la química (compañeros del mismo club o país),
// la edad (los jóvenes crecen hacia su potencial, los veteranos se cansan), el fondo de armario y la táctica.

export const AJUSTES = { min: 2, max: 10, minClubes: 6, maxPlantilla: 16, maxPujas: 5, canterano: 60, segJornada: 3 };
export const OPCIONES = { presupuesto: [150, 200, 300], mercados: [3, 4, 5] };
export const FORMACIONES = {
  '4-3-3': { DEF: 4, MED: 3, DEL: 3 },
  '4-4-2': { DEF: 4, MED: 4, DEL: 2 },
  '4-2-3-1': { DEF: 4, MED: 5, DEL: 1 },
  '3-5-2': { DEF: 3, MED: 5, DEL: 2 },
  '5-3-2': { DEF: 5, MED: 3, DEL: 2 }
};
export const TACTICAS = {
  equilibrada: { nombre: 'Equilibrada', e: '⚖️', desc: '+1 a todo si el equipo tiene buena química.' },
  ataque: { nombre: 'Ataque total', e: '🔥', desc: '+4 en ataque, −3 en defensa.' },
  defensa: { nombre: 'Autobús', e: '🧱', desc: '+4 en defensa, −3 en ataque.' },
  contra: { nombre: 'Contraataque', e: '⚡', desc: '+2 en defensa; +4 en ataque contra equipos que atacan.' },
  presion: { nombre: 'Presión alta', e: '🏃', desc: '+3 en el centro del campo y +1 en ataque; −3 si la plantilla es veterana (media de edad > 29).' }
};
export const NOMBRES_BOT = ['Real Gamonal', 'Atlético Patatal', 'Unión Gazpacho', 'Sporting Tortilla', 'Deportivo Siesta', 'Racing Churros', 'CD Botijo'];

// ---------------------------------------------------------------- Precios
/** Precio de mercado en millones (media, edad y potencial). */
export function precio(f) {
  const base = 60 * Math.pow(0.85, 92 - f.media);
  const edad = f.edad <= 21 ? 1.3 : f.edad <= 25 ? 1.15 : f.edad <= 29 ? 1 : f.edad <= 32 ? 0.7 : 0.45;
  const pot = 1 + Math.max(0, f.potencial - f.media) * 0.04;
  return Math.max(2, Math.round(base * edad * pot * 2) / 2);
}
/** Media con la que juega esta temporada: los jóvenes crecen hacia su potencial y los veteranos bajan. */
export const mediaTemporada = (f) => f.media + (f.edad <= 22 ? Math.round((f.potencial - f.media) * 0.35) : 0) - (f.edad >= 34 ? 2 : f.edad >= 32 ? 1 : 0);

// ---------------------------------------------------------------- Utilidades
const barajar = (a, rng) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const k = Math.floor(rng() * (i + 1)); [b[i], b[k]] = [b[k], b[i]]; } return b; };
const club = (p, id) => p.clubes.find((c) => c.id === id);
const humanos = (p) => p.clubes.filter((c) => !c.bot && !c.fuera);
const azar = (p) => (typeof p.rng === 'function' ? p.rng() : Math.random());

function anotar(p, texto, tipo = 'info') {
  p.nlog += 1;
  p.log.push({ n: p.nlog, texto, tipo });
  if (p.log.length > 80) p.log.shift();
}

/**
 * jugadores: [{ id, nombre }] · futbolistas: base de datos · reglas: { presupuesto, mercados }
 */
export function crearPartida(jugadores, futbolistas, reglas = {}, ahora = Date.now(), rng = Math.random) {
  const presupuesto = OPCIONES.presupuesto.includes(Number(reglas.presupuesto)) ? Number(reglas.presupuesto) : 200;
  const mercados = OPCIONES.mercados.includes(Number(reglas.mercados)) ? Number(reglas.mercados) : 4;
  const clubes = jugadores.map((j) => ({ id: j.id, nombre: `${j.nombre} FC`, dueno: j.nombre, bot: false }));
  const nBots = Math.max(0, AJUSTES.minClubes - clubes.length);
  for (let k = 0; k < nBots; k++) clubes.push({ id: `bot${k + 1}`, nombre: NOMBRES_BOT[k], dueno: 'la máquina 🤖', bot: true });
  const p = {
    presupuestoInicial: presupuesto, mercados, mercado: 0, fase: 'formacion',
    base: futbolistas.map((f) => ({ ...f, precio: precio(f) })),
    disponibles: barajar(futbolistas.map((f) => f.id), rng),
    clubes: clubes.map((c) => ({ ...c, presupuesto, formacion: null, tactica: null, plantilla: [], pujas: null, listo: false, fuera: false })),
    oferta: [], resultadoMercado: null, liga: null, jornadaVista: 0, hasta: null, log: [], nlog: 0, fin: null
  };
  Object.defineProperty(p, 'rng', { value: rng, enumerable: false, writable: true });
  p.clubes.filter((c) => c.bot).forEach((c) => { c.formacion = Object.keys(FORMACIONES)[Math.floor(azar(p) * 5)]; c.listo = true; });
  void ahora;
  return p;
}
const fut = (p, id) => p.base.find((f) => f.id === id);

export function elegirFormacion(p, id, formacion) {
  if (p.fase !== 'formacion') return { ok: false, error: 'Ahora no se elige formación.' };
  const c = club(p, id);
  if (!c || c.bot) return { ok: false, error: 'No diriges ningún club.' };
  if (!FORMACIONES[formacion]) return { ok: false, error: 'Formación no válida.' };
  c.formacion = formacion;
  c.listo = true;
  if (humanos(p).every((x) => x.listo)) abrirMercado(p);
  return { ok: true };
}

// ---------------------------------------------------------------- Mercados
function abrirMercado(p) {
  p.mercado += 1;
  p.fase = 'mercado';
  p.resultadoMercado = null;
  const n = Math.max(12, p.clubes.length * 3);
  // Se intenta que salgan de todas las posiciones (con algún portero en cada mercado)
  const oferta = [];
  const libres = p.disponibles.map((id) => fut(p, id));
  const tomar = (filtro, k) => { libres.filter(filtro).slice(0, k).forEach((f) => { if (!oferta.includes(f.id)) oferta.push(f.id); }); };
  tomar((f) => f.pos === 'POR', 2);
  tomar((f) => f.pos === 'DEF', Math.ceil(n * 0.3));
  tomar((f) => f.pos === 'MED', Math.ceil(n * 0.3));
  tomar((f) => f.pos === 'DEL', Math.ceil(n * 0.25));
  p.oferta = oferta.slice(0, n + 2);
  p.disponibles = p.disponibles.filter((id) => !p.oferta.includes(id));
  p.clubes.forEach((c) => { c.pujas = null; c.listo = c.bot || c.fuera; });
  anotar(p, `🛒 Abre el mercado ${p.mercado} de ${p.mercados} (${p.oferta.length} futbolistas).`);
}

/** pujas: { [futbolistaId]: millones } — secretas. Mientras no hayan terminado todos, se pueden cambiar. */
export function pujar(p, id, pujas) {
  if (p.fase !== 'mercado') return { ok: false, error: 'El mercado está cerrado.' };
  const c = club(p, id);
  if (!c || c.bot || c.fuera) return { ok: false, error: 'No diriges ningún club.' };
  const limpias = {};
  let total = 0;
  for (const [k, val] of Object.entries(pujas || {})) {
    const f = fut(p, Number(k));
    const m = Math.round(Number(val) * 2) / 2;
    if (!f || !p.oferta.includes(f.id)) return { ok: false, error: 'Ese futbolista no está en este mercado.' };
    if (!(m >= f.precio)) return { ok: false, error: `Por ${f.nombre} hay que pujar al menos ${f.precio} M€.` };
    limpias[f.id] = m;
    total += m;
  }
  if (Object.keys(limpias).length > AJUSTES.maxPujas) return { ok: false, error: `Como mucho ${AJUSTES.maxPujas} pujas por mercado.` };
  if (total > c.presupuesto) return { ok: false, error: `Tus pujas suman ${total} M€ y tienes ${c.presupuesto} M€.` };
  if (c.plantilla.length + Object.keys(limpias).length > AJUSTES.maxPlantilla) return { ok: false, error: `La plantilla no puede pasar de ${AJUSTES.maxPlantilla}.` };
  c.pujas = limpias;
  c.listo = true;
  if (humanos(p).every((x) => x.listo)) cerrarMercado(p);
  return { ok: true };
}

export function retirar(p, id) {
  const c = club(p, id);
  if (!c?.listo || c.bot) return { ok: false, error: 'Ahora no.' };
  if (p.fase === 'mercado') { c.listo = false; c.pujas = null; return { ok: true }; }
  if (p.fase === 'tactica') { c.listo = false; return { ok: true }; }
  return { ok: false, error: 'Ya no se puede cambiar.' };
}

/** Lo que le falta a un club para su once (por posición). */
function necesidades(c) {
  const F = { POR: 1, ...FORMACIONES[c.formacion || '4-3-3'] };
  const tiene = {};
  c.plantilla.forEach((f) => { tiene[f.pos] = (tiene[f.pos] || 0) + 1; });
  return Object.fromEntries(Object.entries(F).map(([pos, n]) => [pos, Math.max(0, n + (pos === 'POR' ? 0 : 1) - (tiene[pos] || 0))]));
}

function pujasBot(p, c) {
  const nec = necesidades(c);
  const quedan = p.mercados - p.mercado + 1;
  let caja = (c.presupuesto / quedan) * 1.6;
  const pujas = {};
  // Reparte el dinero entre los huecos que le faltan: no se gasta todo en una estrella
  const huecos = Math.max(1, Object.values(nec).reduce((a, x) => a + x, 0));
  const porHueco = c.presupuesto / huecos;
  const opciones = p.oferta.map((id) => fut(p, id)).filter((f) => nec[f.pos] > 0 && f.precio <= porHueco * 1.8)
    .sort((a, b) => (mediaTemporada(b) - b.precio * 0.08) - (mediaTemporada(a) - a.precio * 0.08));
  for (const f of opciones) {
    if (Object.keys(pujas).length >= AJUSTES.maxPujas || c.plantilla.length + Object.keys(pujas).length >= AJUSTES.maxPlantilla) break;
    const oferta = Math.round(f.precio * (1.15 + azar(p) * 0.45) * 2) / 2;
    if (oferta <= caja && nec[f.pos] > 0) { pujas[f.id] = oferta; caja -= oferta; nec[f.pos] -= 1; }
  }
  return pujas;
}

function cerrarMercado(p) {
  p.clubes.filter((c) => c.bot && !c.fuera).forEach((c) => { c.pujas = pujasBot(p, c); });
  const fichajes = [];
  p.oferta.forEach((fid) => {
    const f = fut(p, fid);
    const ofertas = p.clubes.filter((c) => c.pujas?.[fid] != null).map((c) => ({ c, m: c.pujas[fid] }))
      .sort((a, b) => b.m - a.m || azar(p) - 0.5);
    const g = ofertas.find((o) => o.c.presupuesto >= o.m && o.c.plantilla.length < AJUSTES.maxPlantilla);
    if (!g) { p.disponibles.push(fid); return; }
    g.c.presupuesto = Math.round((g.c.presupuesto - g.m) * 2) / 2;
    g.c.plantilla.push({ ...f, pagado: g.m });
    fichajes.push({ futbolista: fid, nombre: f.nombre, pos: f.pos, club: g.c.id, pagado: g.m, pujas: ofertas.length, rivales: ofertas.filter((o) => o.c !== g.c).map((o) => ({ club: o.c.id, m: o.m })) });
    anotar(p, `✍️ ${g.c.nombre} ficha a ${f.nombre} por ${g.m} M€${ofertas.length > 1 ? ` (${ofertas.length} pujas)` : ''}.`, 'bueno');
  });
  p.resultadoMercado = { mercado: p.mercado, fichajes };
  p.fase = 'resultadoMercado';
  p.clubes.forEach((c) => { c.listo = c.bot || c.fuera; });
}

/** Tras ver el resultado del mercado: siguiente mercado o elegir táctica. */
export function seguir(p, id) {
  if (p.fase !== 'resultadoMercado') return { ok: false, error: 'Ahora no.' };
  const c = club(p, id);
  if (c) c.listo = true;
  if (humanos(p).every((x) => x.listo)) avanzarMercado(p);
  return { ok: true };
}
function avanzarMercado(p) {
  if (p.mercado < p.mercados) { abrirMercado(p); return; }
  p.fase = 'tactica';
  p.clubes.forEach((c) => { c.listo = c.bot || c.fuera; if (c.bot) c.tactica = Object.keys(TACTICAS)[Math.floor(azar(p) * 5)]; });
}

export function elegirTactica(p, id, tactica, ahora = Date.now()) {
  if (p.fase !== 'tactica') return { ok: false, error: 'Ahora no se elige táctica.' };
  const c = club(p, id);
  if (!c || c.bot) return { ok: false, error: 'No diriges ningún club.' };
  if (!TACTICAS[tactica]) return { ok: false, error: 'Táctica no válida.' };
  c.tactica = tactica;
  c.listo = true;
  if (humanos(p).every((x) => x.listo)) simularLiga(p, ahora);
  return { ok: true };
}

// ---------------------------------------------------------------- Equipo y simulación
/** Mejor once según la formación (si falta alguien en una posición, juega otro fuera de sitio o un canterano). */
export function onceDe(c) {
  const F = { POR: 1, ...FORMACIONES[c.formacion || '4-3-3'] };
  const libres = [...c.plantilla].sort((a, b) => mediaTemporada(b) - mediaTemporada(a));
  const once = [];
  for (const [pos, n] of Object.entries(F)) {
    for (let k = 0; k < n; k++) {
      const i = libres.findIndex((f) => f.pos === pos);
      if (i >= 0) { once.push({ ...libres[i], juegaDe: pos, efectiva: mediaTemporada(libres[i]) }); libres.splice(i, 1); }
      else once.push({ id: null, nombre: 'Canterano', pos, juegaDe: pos, efectiva: AJUSTES.canterano, edad: 18, pais: null, club: null });
    }
  }
  // Un canterano se puede cambiar por alguien de la plantilla que juegue fuera de su posición (−8)
  once.forEach((o, k) => {
    if (o.id != null || !libres.length) return;
    if (o.juegaDe === 'POR') return;
    const f = libres.shift();
    if (mediaTemporada(f) - 8 > AJUSTES.canterano) once[k] = { ...f, juegaDe: o.juegaDe, efectiva: mediaTemporada(f) - 8, fuera: true };
    else libres.unshift(f);
  });
  return { once, banquillo: libres };
}

/** Química del once: compañeros del mismo club (+1 cada pareja) o del mismo país (+0,5), hasta 10. */
export function quimica(once) {
  let q = 0;
  for (let i = 0; i < once.length; i++) for (let k = i + 1; k < once.length; k++) {
    const a = once[i]; const b = once[k];
    if (a.id == null || b.id == null) continue;
    if (a.club === b.club) q += 1;
    else if (a.pais === b.pais) q += 0.5;
  }
  return Math.min(10, Math.round(q * 2) / 2);
}

/** Fuerza de un club: portería, defensa, medio y ataque, con química, edad, banquillo y táctica. */
export function fuerzaDe(c) {
  const { once, banquillo } = onceDe(c);
  const media = (pos) => { const l = once.filter((o) => o.juegaDe === pos); return l.reduce((a, o) => a + o.efectiva, 0) / l.length; };
  const q = quimica(once);
  const edadMedia = once.reduce((a, o) => a + (o.edad || 25), 0) / once.length;
  const bonusQ = q * 0.35;
  let def = (media('POR') * 0.4 + media('DEF') * 0.6) + bonusQ;
  let med = media('MED') + bonusQ;
  let ata = (media('DEL') * 0.7 + med * 0.3) + bonusQ;
  const t = c.tactica || 'equilibrada';
  if (t === 'equilibrada' && q >= 4) { def += 1; med += 1; ata += 1; }
  if (t === 'ataque') { ata += 4; def -= 3; }
  if (t === 'defensa') { def += 4; ata -= 3; }
  if (t === 'contra') { def += 2; }
  if (t === 'presion') { med += 3; ata += 1; if (edadMedia > 29) { def -= 3; med -= 3; ata -= 3; } }
  // El centro del campo empuja a las dos líneas
  def += (med - 80) * 0.15; ata += (med - 80) * 0.15;
  return { def, med, ata, quimica: q, edadMedia: Math.round(edadMedia * 10) / 10, fondo: banquillo.length, tactica: t, once };
}

function poisson(lambda, rng) {
  const L = Math.exp(-lambda); let k = 0; let pr = 1;
  do { k += 1; pr *= rng(); } while (pr > L && k < 12);
  return k - 1;
}

function partido(p, local, visita, jornada, total) {
  const a = p.fuerzas[local.id]; const b = p.fuerzas[visita.id];
  const cansancio = (f) => (jornada > total / 2 && f.fondo < 3 ? 2 : 0);
  let ataA = a.ata - cansancio(a); let ataB = b.ata - cansancio(b);
  if (a.tactica === 'contra' && b.tactica === 'ataque') ataA += 4;
  if (b.tactica === 'contra' && a.tactica === 'ataque') ataB += 4;
  const lA = Math.max(0.15, 1.45 * Math.exp((ataA - b.def) / 9));
  const lB = Math.max(0.15, 1.15 * Math.exp((ataB - a.def) / 9));
  const r = () => azar(p);
  const gA = poisson(lA, r); const gB = poisson(lB, r);
  const goleadores = (f, n) => Array.from({ length: n }, () => {
    const pesos = f.once.map((o) => (o.juegaDe === 'DEL' ? 3 : o.juegaDe === 'MED' ? 1.4 : o.juegaDe === 'DEF' ? 0.35 : 0));
    let x = r() * pesos.reduce((s, w) => s + w, 0);
    const k = pesos.findIndex((w) => (x -= w) < 0);
    return f.once[Math.max(0, k)].nombre;
  });
  return { local: local.id, visita: visita.id, gl: gA, gv: gB, goles: [...goleadores(a, gA).map((n) => ({ n, c: local.id })), ...goleadores(b, gB).map((n) => ({ n, c: visita.id }))] };
}

function simularLiga(p, ahora) {
  const clubes = p.clubes.filter((c) => !c.fuera);
  p.fuerzas = Object.fromEntries(clubes.map((c) => [c.id, fuerzaDe(c)]));
  // Calendario a doble vuelta (método del círculo)
  const ids = clubes.map((c) => c.id);
  if (ids.length % 2) ids.push(null);
  const n = ids.length;
  const ida = [];
  let rot = [...ids];
  for (let j = 0; j < n - 1; j++) {
    const jornada = [];
    for (let k = 0; k < n / 2; k++) { const a = rot[k]; const b = rot[n - 1 - k]; if (a != null && b != null) jornada.push(j % 2 ? [b, a] : [a, b]); }
    ida.push(jornada);
    rot = [rot[0], rot[n - 1], ...rot.slice(1, n - 1)];
  }
  const calendario = [...ida, ...ida.map((j) => j.map(([a, b]) => [b, a]))];
  const jornadas = calendario.map((j, k) => j.map(([a, b]) => partido(p, club(p, a), club(p, b), k + 1, calendario.length)));
  p.liga = { jornadas };
  p.fase = 'liga';
  p.jornadaVista = 0;
  p.hasta = ahora + AJUSTES.segJornada * 1000;
  delete p.fuerzas;
  p.fuerzasPublicas = Object.fromEntries(clubes.map((c) => { const f = fuerzaDe(c); return [c.id, { def: Math.round(f.def), med: Math.round(f.med), ata: Math.round(f.ata), quimica: f.quimica, edadMedia: f.edadMedia, fondo: f.fondo, tactica: f.tactica }]; }));
}

/** Clasificación tras las `hasta` primeras jornadas. */
export function clasificacion(p, hasta = p.liga?.jornadas.length ?? 0) {
  const t = Object.fromEntries(p.clubes.filter((c) => !c.fuera || p.liga).map((c) => [c.id, { id: c.id, nombre: c.nombre, pj: 0, g: 0, e: 0, pe: 0, gf: 0, gc: 0, pts: 0 }]));
  (p.liga?.jornadas || []).slice(0, hasta).flat().forEach((m) => {
    const L = t[m.local]; const V = t[m.visita];
    if (!L || !V) return;
    L.pj += 1; V.pj += 1; L.gf += m.gl; L.gc += m.gv; V.gf += m.gv; V.gc += m.gl;
    if (m.gl > m.gv) { L.g += 1; V.pe += 1; L.pts += 3; } else if (m.gl < m.gv) { V.g += 1; L.pe += 1; V.pts += 3; } else { L.e += 1; V.e += 1; L.pts += 1; V.pts += 1; }
  });
  return Object.values(t).sort((a, b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc) || b.gf - a.gf);
}

/** La liga se va enseñando jornada a jornada. */
export function tick(p, ahora = Date.now()) {
  if (p.fase !== 'liga' || !p.hasta || ahora < p.hasta) return false;
  avanzarJornada(p, ahora);
  return true;
}
export function avanzarJornada(p, ahora = Date.now()) {
  if (p.fase !== 'liga') return { ok: false, error: 'Ahora no.' };
  p.jornadaVista += 1;
  if (p.jornadaVista >= p.liga.jornadas.length) finalizar(p);
  else p.hasta = ahora + AJUSTES.segJornada * 1000;
  return { ok: true };
}

function finalizar(p) {
  p.fase = 'fin';
  p.hasta = null;
  const tabla = clasificacion(p);
  const goles = {};
  (p.liga?.jornadas || []).flat().forEach((m) => m.goles.forEach((g) => { if (g.n === 'Canterano') return; const k = `${g.n}|${g.c}`; goles[k] = (goles[k] || 0) + 1; }));
  const pichichi = Object.entries(goles).sort((a, b) => b[1] - a[1])[0];
  // Mejor fichaje: más media por millón (entre los humanos)
  const fichajes = p.clubes.filter((c) => !c.bot).flatMap((c) => c.plantilla.map((f) => ({ ...f, clubId: c.id })));
  const ganga = fichajes.sort((a, b) => mediaTemporada(b) / b.pagado - mediaTemporada(a) / a.pagado)[0] || null;
  const campeon = tabla[0];
  p.fin = {
    tabla, campeon: campeon?.id ?? null,
    ganadores: campeon ? [campeon.id] : [],
    pichichi: pichichi ? { nombre: pichichi[0].split('|')[0], club: pichichi[0].split('|')[1], goles: pichichi[1] } : null,
    ganga: ganga ? { nombre: ganga.nombre, club: ganga.clubId, pagado: ganga.pagado, media: mediaTemporada(ganga) } : null
  };
  anotar(p, `🏆 ¡${campeon?.nombre} gana la liga!`, 'bueno');
}

/** El anfitrión desbloquea la partida. */
export function forzar(p, ahora = Date.now()) {
  if (p.fase === 'formacion') { humanos(p).forEach((c) => { if (!c.listo) { c.formacion = '4-3-3'; c.listo = true; } }); abrirMercado(p); return { ok: true }; }
  if (p.fase === 'mercado') { humanos(p).forEach((c) => { if (!c.listo) { c.pujas = {}; c.listo = true; } }); cerrarMercado(p); return { ok: true }; }
  if (p.fase === 'resultadoMercado') { avanzarMercado(p); return { ok: true }; }
  if (p.fase === 'tactica') { humanos(p).forEach((c) => { if (!c.listo) { c.tactica = 'equilibrada'; c.listo = true; } }); simularLiga(p, ahora); return { ok: true }; }
  if (p.fase === 'liga') { p.jornadaVista = p.liga.jornadas.length; finalizar(p); return { ok: true }; }
  return { ok: false, error: 'Nada que forzar.' };
}

export function terminar(p) { return forzar(p); }

/** Quien abandona deja su club en manos de la máquina. */
export function abandonar(p, id, ahora = Date.now()) {
  const c = club(p, id);
  if (!c || c.bot || p.fase === 'fin') return;
  c.bot = true;
  c.dueno = 'la máquina 🤖';
  c.formacion ||= '4-3-3';
  c.listo = true;
  if (p.fase === 'tactica' && !c.tactica) c.tactica = 'equilibrada';
  if (!humanos(p).length) { forzar(p, ahora); return; }
  if (humanos(p).every((x) => x.listo)) {
    if (p.fase === 'formacion') abrirMercado(p);
    else if (p.fase === 'mercado') cerrarMercado(p);
    else if (p.fase === 'resultadoMercado') avanzarMercado(p);
    else if (p.fase === 'tactica') simularLiga(p, ahora);
  }
}

// ---------------------------------------------------------------- Vista
export function vistaDe(p, id) {
  const yo = club(p, id);
  const fin = p.fase === 'fin';
  const vistas = p.fase === 'liga' || fin ? p.jornadaVista : 0;
  return {
    fase: p.fase, mercado: p.mercado, mercados: p.mercados, presupuestoInicial: p.presupuestoInicial, hasta: p.hasta,
    oferta: p.fase === 'mercado' ? p.oferta.map((fid) => fut(p, fid)) : [],
    clubes: p.clubes.map((c) => ({
      id: c.id, nombre: c.nombre, dueno: c.dueno, bot: c.bot, presupuesto: c.presupuesto, formacion: c.formacion,
      tactica: p.fase === 'liga' || fin ? c.tactica : null, listo: c.listo,
      plantilla: c.plantilla.map((f) => ({ id: f.id, nombre: f.nombre, pos: f.pos, edad: f.edad, media: f.media, potencial: f.potencial, pais: f.pais, club: f.club, pagado: f.pagado, temporada: mediaTemporada(f) }))
    })),
    yo: yo ? { id: yo.id, pujas: yo.pujas, listo: yo.listo, formacion: yo.formacion, tactica: yo.tactica, presupuesto: yo.presupuesto, previa: p.fase === 'tactica' || p.fase === 'resultadoMercado' ? previa(yo) : null } : null,
    resultadoMercado: p.resultadoMercado,
    fuerzas: p.fase === 'liga' || fin ? p.fuerzasPublicas : null,
    jornadas: p.liga ? p.liga.jornadas.slice(0, vistas) : [],
    totalJornadas: p.liga?.jornadas.length ?? 0,
    clasificacion: p.liga ? clasificacion(p, vistas) : null,
    log: p.log.slice(-20),
    fin: p.fin
  };
}

/** Cómo quedaría tu equipo (once, química…) para decidir la táctica. */
function previa(c) {
  const f = fuerzaDe(c);
  return { once: f.once.map((o) => ({ nombre: o.nombre, juegaDe: o.juegaDe, efectiva: o.efectiva, fuera: Boolean(o.fuera) })), quimica: f.quimica, edadMedia: f.edadMedia, fondo: f.fondo, def: Math.round(f.def), med: Math.round(f.med), ata: Math.round(f.ata) };
}
