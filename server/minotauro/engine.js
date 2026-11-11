// server/minotauro/engine.js
// «El Laberinto · El Minotauro»: motor puro (sin red). Se copia al cliente con `npm run sync:minotauro`.
//
// Un laberinto de 11×11 casillas con niebla. A un jugador le toca en secreto ser el Minotauro; los demás son
// exploradores que salen del centro. Cada turno todos planean a la vez su recorrido (2 pasos, o 3 corriendo, que hace
// ruido; el Minotauro da 3) y se mueven a la vez, paso a paso. Si el Minotauro (o un ayudante) coincide con un
// explorador o se cruzan, lo atrapa y ese jugador pasa a ser su ayudante. Los exploradores abren las salidas
// recogiendo las 3 llaves (que brillan: los exploradores saben dónde están, el Minotauro no) y ganan si escapa al
// menos un tercio de ellos (mínimo uno); si no, gana el Minotauro con sus ayudantes.

export const AJUSTES = {
  min: 3, max: 8, lado: 11, llaves: 3, segTurno: 45,
  pasos: { explorador: 2, correr: 3, minotauro: 3, ayudante: 2 },
  vista: { explorador: 2, antorcha: 4, cazador: 2 },
  trampas: 1, turnosAntorcha: 3, antorchas: 2, atajos: 0.14, ayudantesCazan: true, fraccionEscape: 1 / 3
};
export const OPCIONES = { turnos: [20, 25, 30] };
const DIRS = [[0, -1, 'N'], [1, 0, 'E'], [0, 1, 'S'], [-1, 0, 'O']];

// ---------------------------------------------------------------- Laberinto
const idx = (L, x, y) => y * L + x;
const xy = (L, i) => [i % L, Math.floor(i / L)];
const arista = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
const barajar = (l, rng) => { const b = [...l]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/** Laberinto perfecto (DFS) con algunos atajos para que haya rodeos y persecuciones. Devuelve las aristas abiertas. */
export function crearLaberinto(L, rng = Math.random) {
  const abiertas = new Set();
  const visto = new Set([0]);
  const pila = [0];
  while (pila.length) {
    const c = pila[pila.length - 1];
    const [x, y] = xy(L, c);
    const libres = DIRS.map(([dx, dy]) => [x + dx, y + dy]).filter(([a, b]) => a >= 0 && b >= 0 && a < L && b < L && !visto.has(idx(L, a, b)));
    if (!libres.length) { pila.pop(); continue; }
    const [a, b] = libres[Math.floor(rng() * libres.length)];
    const n = idx(L, a, b);
    abiertas.add(arista(c, n));
    visto.add(n);
    pila.push(n);
  }
  // Atajos: se abren algunas paredes interiores
  for (let i = 0; i < L * L; i++) {
    const [x, y] = xy(L, i);
    if (x + 1 < L && rng() < AJUSTES.atajos) abiertas.add(arista(i, idx(L, x + 1, y)));
    if (y + 1 < L && rng() < AJUSTES.atajos) abiertas.add(arista(i, idx(L, x, y + 1)));
  }
  return abiertas;
}
export const vecinos = (L, abiertas, i) => {
  const [x, y] = xy(L, i);
  return DIRS.map(([dx, dy]) => [x + dx, y + dy]).filter(([a, b]) => a >= 0 && b >= 0 && a < L && b < L)
    .map(([a, b]) => idx(L, a, b)).filter((n) => abiertas.has(arista(i, n)));
};
/** Distancias por los pasillos desde `origen` (hasta `max`). */
function distancias(L, abiertas, origen, max = Infinity) {
  const d = new Map([[origen, 0]]);
  const cola = [origen];
  while (cola.length) {
    const c = cola.shift();
    if (d.get(c) >= max) continue;
    vecinos(L, abiertas, c).forEach((n) => { if (!d.has(n)) { d.set(n, d.get(c) + 1); cola.push(n); } });
  }
  return d;
}

// ---------------------------------------------------------------- Partida
const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const exploradores = (p) => p.jugadores.filter((j) => j.rolInicial === 'explorador');
const activos = (p) => p.jugadores.filter((j) => !j.fuera && !j.escapado && !j.eliminado);
const cazadores = (p) => p.jugadores.filter((j) => (j.rol === 'minotauro' || j.rol === 'ayudante') && !j.fuera);
const necesarios = (p) => Math.max(1, Math.ceil(exploradores(p).length * AJUSTES.fraccionEscape));
const reloj = (p, ahora) => (p.sinReloj ? null : ahora + AJUSTES.segTurno * 1000);
const rumbo = (L, desde, hacia) => {
  const [x1, y1] = xy(L, desde); const [x2, y2] = xy(L, hacia);
  const ns = y2 < y1 - 1 ? 'norte' : y2 > y1 + 1 ? 'sur' : '';
  const eo = x2 > x1 + 1 ? 'este' : x2 < x1 - 1 ? 'oeste' : '';
  return ns && eo ? `${ns}${eo === 'este' ? 'este' : 'oeste'}` : ns || eo || 'muy cerca';
};

/** reglas: { turnos, sinReloj }. Si no viene `minotauro`, se sortea quién lo es. */
export function crearPartida(jugadores, reglas = {}, ahora = Date.now(), rng = Math.random) {
  if (jugadores.length < AJUSTES.min) throw new Error(`Hacen falta al menos ${AJUSTES.min} jugadores.`);
  const L = AJUSTES.lado;
  const abiertas = crearLaberinto(L, rng);
  const centro = idx(L, Math.floor(L / 2), Math.floor(L / 2));
  const esquinas = [idx(L, 0, 0), idx(L, L - 1, 0), idx(L, 0, L - 1), idx(L, L - 1, L - 1)];
  const guarida = esquinas[Math.floor(rng() * 4)];
  const [gx, gy] = xy(L, guarida);
  // Dos salidas en los lados que no tocan la guarida
  const m = Math.floor(L / 2);
  const salidas = [gy === 0 ? idx(L, m, L - 1) : idx(L, m, 0), gx === 0 ? idx(L, L - 1, m) : idx(L, 0, m)];
  // Llaves lejos del centro y de las salidas, repartidas
  const dc = distancias(L, abiertas, centro);
  const candidatas = barajar([...Array(L * L).keys()].filter((i) => (dc.get(i) ?? 0) >= 6 && !salidas.includes(i) && i !== guarida), rng);
  const llaves = [];
  candidatas.forEach((i) => {
    if (llaves.length >= AJUSTES.llaves) return;
    const [x, y] = xy(L, i);
    if (llaves.every((k) => { const [a, b] = xy(L, k.pos); return Math.abs(a - x) + Math.abs(b - y) >= 5; })) llaves.push({ pos: i, cogida: false });
  });
  const antorchas = barajar([...Array(L * L).keys()].filter((i) => i !== centro && !salidas.includes(i) && !llaves.some((k) => k.pos === i) && (dc.get(i) ?? 0) >= 3), rng)
    .slice(0, AJUSTES.antorchas).map((pos) => ({ pos, cogida: false }));
  const elegido = reglas.minotauro ?? jugadores[Math.floor(rng() * jugadores.length)].id;
  const p = {
    L, abiertas, centro, guarida, salidas, llaves, antorchas, trampas: [],
    jugadores: jugadores.map((j) => {
      const rol = j.id === elegido ? 'minotauro' : 'explorador';
      return {
        id: j.id, nombre: j.nombre, rol, rolInicial: rol, pos: rol === 'minotauro' ? guarida : centro,
        escapado: false, atrapadoEn: null, fuera: false, trampas: rol === 'explorador' ? AJUSTES.trampas : 0, aturdido: 0, antorcha: 0,
        conocidas: new Set(), plan: null, listo: false, privado: []
      };
    }),
    turno: 1, maxTurnos: OPCIONES.turnos.includes(Number(reglas.turnos)) ? Number(reglas.turnos) : 25,
    fase: 'planificar', hasta: null, eventos: [], historial: [], recorridos: {}, fin: null, sinReloj: Boolean(reglas.sinReloj)
  };
  p.jugadores.forEach((j) => ver(p, j));
  p.hasta = reloj(p, ahora);
  return p;
}

/** Casillas que ve un jugador ahora (por los pasillos, hasta su radio). */
function vision(p, j) {
  const r = j.rol === 'explorador' ? (j.antorcha > 0 ? AJUSTES.vista.antorcha : AJUSTES.vista.explorador) : AJUSTES.vista.cazador;
  return new Set(distancias(p.L, p.abiertas, j.pos, r).keys());
}
function ver(p, j) { vision(p, j).forEach((c) => j.conocidas.add(c)); }
export const maxPasos = (j) => (j.aturdido > 0 ? 0 : j.rol === 'minotauro' ? AJUSTES.pasos.minotauro : j.rol === 'ayudante' ? AJUSTES.pasos.ayudante : AJUSTES.pasos.correr);

/** Recorrido del turno: lista de casillas (cada una vecina de la anterior). trampa: dejar una trampa al salir. */
export function planificar(p, id, pasos = [], trampa = false, ahora = Date.now()) {
  if (p.fase !== 'planificar') return { ok: false, error: 'Ahora no se puede mover.' };
  const j = jug(p, id);
  if (!j || j.fuera || j.escapado) return { ok: false, error: 'No juegas este turno.' };
  const lista = (pasos || []).map(Number);
  if (lista.length > maxPasos(j)) return { ok: false, error: `Como mucho ${maxPasos(j)} pasos.` };
  let c = j.pos;
  for (const n of lista) {
    if (!vecinos(p.L, p.abiertas, c).includes(n)) return { ok: false, error: 'Ese recorrido atraviesa una pared.' };
    c = n;
  }
  if (trampa && (j.rol !== 'explorador' || j.trampas <= 0)) return { ok: false, error: 'No te quedan trampas.' };
  j.plan = { pasos: lista, trampa: Boolean(trampa) };
  j.listo = true;
  if (activos(p).every((x) => x.listo)) resolver(p, ahora);
  return { ok: true };
}
export function deshacer(p, id) {
  const j = jug(p, id);
  if (p.fase !== 'planificar' || !j) return { ok: false, error: 'Ahora no.' };
  j.listo = false; j.plan = null;
  return { ok: true };
}

const publico = (p, texto, tipo = 'info') => p.eventos.push({ texto, tipo });
const privado = (j, texto) => j.privado.push(texto);
const nombreVisible = (j) => (j.rol === 'minotauro' ? 'el Minotauro' : j.nombre);

function resolver(p, ahora) {
  p.eventos = [];
  p.jugadores.forEach((j) => { j.privado = []; });
  const enJuego = activos(p);
  const recorridos = {};
  enJuego.forEach((j) => { recorridos[j.id] = [j.pos]; });
  // Trampas que se dejan al salir
  enJuego.forEach((j) => {
    if (j.plan?.trampa && j.rol === 'explorador' && j.trampas > 0) { j.trampas -= 1; p.trampas.push({ pos: j.pos, por: j.id }); privado(j, '🪤 Dejas una trampa escondida.'); }
  });
  const atrapados = new Set();
  const parados = new Set(); // cazadores que han caído en una trampa este turno
  const corrio = new Set(enJuego.filter((j) => j.rol === 'explorador' && (j.plan?.pasos.length || 0) >= AJUSTES.pasos.correr).map((j) => j.id));
  const llavesCogidas = [];
  const largo = Math.max(0, ...enJuego.map((j) => j.plan?.pasos.length || 0));
  for (let s = 0; s < largo; s++) {
    const antes = Object.fromEntries(enJuego.map((j) => [j.id, j.pos]));
    enJuego.forEach((j) => {
      if (atrapados.has(j.id) || j.escapado || parados.has(j.id)) return;
      const n = j.plan?.pasos[s];
      if (n == null) return;
      j.pos = n;
      recorridos[j.id].push(n);
    });
    // Capturas: misma casilla o se cruzan
    const cz = enJuego.filter((j) => j.rol === 'minotauro' || (j.rol === 'ayudante' && AJUSTES.ayudantesCazan));
    enJuego.filter((e) => e.rol === 'explorador' && !atrapados.has(e.id) && !e.escapado).forEach((e) => {
      const c = cz.find((h) => h.pos === e.pos || (h.pos === antes[e.id] && e.pos === antes[h.id]));
      if (c) { atrapados.add(e.id); e.atrapadoEn = p.turno; publico(p, `🐂 ¡${c.rol === 'minotauro' ? 'El Minotauro' : `${c.nombre} (ayudante)`} atrapa a ${e.nombre}! Ahora sirve al Minotauro.`, 'malo'); }
    });
    // Llaves, antorchas y salidas
    enJuego.filter((e) => e.rol === 'explorador' && !atrapados.has(e.id) && !e.escapado).forEach((e) => {
      const k = p.llaves.find((x) => !x.cogida && x.pos === e.pos);
      if (k) {
        k.cogida = true; k.por = e.id; llavesCogidas.push(e);
        const n = p.llaves.filter((x) => x.cogida).length;
        publico(p, `🔑 ${e.nombre} encuentra una llave: candados abiertos ${n}/${AJUSTES.llaves}.${n === AJUSTES.llaves ? ' ¡Las salidas están abiertas!' : ''}`, 'bueno');
      }
      const a = p.antorchas.find((x) => !x.cogida && x.pos === e.pos);
      if (a) { a.cogida = true; e.antorcha = AJUSTES.turnosAntorcha; privado(e, `🔦 Coges una antorcha: ves más lejos durante ${AJUSTES.turnosAntorcha} turnos.`); }
      if (p.salidas.includes(e.pos) && p.llaves.every((x) => x.cogida)) { e.escapado = true; publico(p, `🚪 ¡${e.nombre} escapa del laberinto!`, 'bueno'); }
    });
    // Trampas: el cazador que pisa una se queda quieto (y el siguiente turno, aturdido)
    cz.forEach((h) => {
      if (parados.has(h.id)) return;
      const t = p.trampas.findIndex((x) => x.pos === h.pos);
      if (t >= 0) {
        const tr = p.trampas.splice(t, 1)[0];
        parados.add(h.id); h.aturdido = 1;
        publico(p, `🪤 ¡${h.rol === 'minotauro' ? 'El Minotauro' : h.nombre} cae en una trampa de ${jug(p, tr.por)?.nombre ?? 'alguien'} y se queda aturdido un turno!`, 'bueno');
      }
    });
  }
  // Los atrapados pasan a ser ayudantes
  atrapados.forEach((id) => { const j = jug(p, id); j.rol = 'ayudante'; j.trampas = 0; j.antorcha = 0; });
  // Ruidos: los cazadores oyen a quien corre o abre un candado; los exploradores oyen los pasos del Minotauro cerca
  const mino = p.jugadores.find((j) => j.rol === 'minotauro');
  cazadores(p).forEach((h) => {
    enJuego.filter((e) => e.rol === 'explorador' && !e.escapado && (corrio.has(e.id) || llavesCogidas.includes(e))).forEach((e) => {
      privado(h, `👂 Oyes ${llavesCogidas.includes(e) ? 'un chirrido de cerrojo' : 'a alguien corriendo'} al ${rumbo(p.L, h.pos, e.pos)}.`);
    });
  });
  if (mino) {
    activos(p).filter((e) => e.rol === 'explorador').forEach((e) => {
      const [x1, y1] = xy(p.L, e.pos); const [x2, y2] = xy(p.L, mino.pos);
      if (Math.abs(x1 - x2) + Math.abs(y1 - y2) <= 4) privado(e, `🐾 Oyes pasos pesados al ${rumbo(p.L, e.pos, mino.pos)}…`);
    });
  }
  // Aturdimientos y antorchas
  p.jugadores.forEach((j) => {
    if (j.aturdido > 0 && !parados.has(j.id)) j.aturdido -= 1;
    if (j.antorcha > 0) j.antorcha -= 1;
    j.plan = null; j.listo = false;
  });
  p.recorridos = recorridos;
  p.historial.push({ turno: p.turno, eventos: p.eventos });
  p.jugadores.forEach((j) => ver(p, j));
  if (!p.eventos.length) publico(p, 'Silencio en el laberinto…');
  // ¿Fin?
  const escapados = exploradores(p).filter((j) => j.escapado).length;
  const libres = activos(p).filter((j) => j.rol === 'explorador').length;
  if (escapados >= necesarios(p) || escapados + libres < necesarios(p) || libres === 0 || p.turno >= p.maxTurnos) { terminar(p); return; }
  p.turno += 1;
  // Los aturdidos no mueven: se dan por listos
  activos(p).forEach((j) => { if (maxPasos(j) === 0) { j.plan = { pasos: [], trampa: false }; j.listo = true; } });
  p.hasta = reloj(p, ahora);
  if (activos(p).every((x) => x.listo)) resolver(p, ahora);
}

export function terminar(p) {
  if (p.fase === 'fin') return { ok: false, error: 'La partida ya ha terminado.' };
  p.fase = 'fin';
  p.hasta = null;
  const escapados = exploradores(p).filter((j) => j.escapado);
  const ganaExpl = escapados.length >= necesarios(p);
  const ganadores = ganaExpl ? escapados.map((j) => j.id) : p.jugadores.filter((j) => j.rol === 'minotauro' || j.rol === 'ayudante').map((j) => j.id);
  const tabla = p.jugadores.map((j) => ({
    id: j.id, nombre: j.nombre, rol: j.rolInicial, final: j.escapado ? 'escapado' : j.rol, fuera: j.fuera,
    puntos: ganadores.includes(j.id) ? 1 : 0, puesto: ganadores.includes(j.id) ? 1 : 2
  })).sort((a, b) => a.puesto - b.puesto);
  p.fin = { ganan: ganaExpl ? 'exploradores' : 'minotauro', escapados: escapados.length, necesarios: necesarios(p), tabla, ganadores, max: 1, minotauro: p.jugadores.find((j) => j.rolInicial === 'minotauro')?.id };
  return { ok: true };
}

/** Reloj (online): quien no ha planeado se queda quieto. */
export function tick(p, ahora = Date.now()) {
  if (p.fase !== 'planificar' || !p.hasta || ahora < p.hasta) return false;
  activos(p).filter((j) => !j.listo).forEach((j) => { j.plan = { pasos: [], trampa: false }; j.listo = true; });
  resolver(p, ahora);
  return true;
}

export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id);
  if (!j || j.fuera || p.fase === 'fin') return;
  j.fuera = true;
  publico(p, `🚪 ${j.nombre} abandona la partida.`, 'malo');
  if (j.rol === 'minotauro' || !activos(p).some((x) => x.rol === 'explorador')) { terminar(p); return; }
  if (activos(p).length && activos(p).every((x) => x.listo)) resolver(p, ahora);
}

// ---------------------------------------------------------------- Vista
/** Lo que ve un jugador: el mapa que conoce, las piezas a la vista, los objetos y los mensajes del último turno. */
export function vistaDe(p, id) {
  const yo = jug(p, id);
  const fin = p.fase === 'fin';
  const cazador = yo && yo.rol !== 'explorador';
  const ve = yo && !fin ? vision(p, yo) : null;
  // Los cazadores conocen todo el laberinto; los exploradores, lo que han visto
  const conocidas = fin || !yo || cazador ? null : [...yo.conocidas];
  const celdas = fin || cazador || !yo ? [...Array(p.L * p.L).keys()] : conocidas;
  const muros = {};
  celdas.forEach((c) => { muros[c] = vecinos(p.L, p.abiertas, c); });
  const visible = (j) => fin || !yo || j.id === yo.id || ve.has(j.pos) || (cazador && j.rol !== 'explorador');
  return {
    fase: p.fase, turno: p.turno, maxTurnos: p.maxTurnos, hasta: p.hasta, segundos: AJUSTES.segTurno, L: p.L,
    ronda: p.turno, rondas: p.maxTurnos,
    celdas, abiertos: muros, vistas: ve ? [...ve] : null, centro: p.centro, salidas: p.salidas,
    salidasAbiertas: p.llaves.every((k) => k.cogida), llavesCogidas: p.llaves.filter((k) => k.cogida).length, totalLlaves: AJUSTES.llaves,
    // Las llaves brillan: los exploradores saben dónde están; el Minotauro solo las conoce si las ha visto
    llaves: p.llaves.filter((k) => !k.cogida && (fin || !yo || !cazador || yo.conocidas.has(k.pos))).map((k) => k.pos),
    antorchas: p.antorchas.filter((a) => !a.cogida && (fin || cazador || (yo && yo.conocidas.has(a.pos)))).map((a) => a.pos),
    trampas: fin || (yo && yo.rol === 'explorador') ? p.trampas.map((t) => t.pos) : [],
    piezas: p.jugadores.filter((j) => !j.fuera && !j.escapado && visible(j)).map((j) => ({
      id: j.id, rol: j.rol, pos: j.pos, nombre: j.rol === 'minotauro' && !fin && j.id !== yo?.id ? 'Minotauro' : j.nombre, aturdido: j.aturdido > 0
    })),
    jugadores: p.jugadores.map((j) => ({
      id: j.id, nombre: j.nombre, fuera: j.fuera, listo: j.listo, escapado: j.escapado,
      // El papel del Minotauro es secreto: los demás solo saben quién ha escapado y quién es ayudante
      estado: j.escapado ? 'escapado' : j.rol === 'ayudante' ? 'ayudante' : (fin || j.id === yo?.id || cazador) ? j.rol : 'oculto',
      puntos: 0
    })),
    yo: yo ? {
      id, rol: yo.rol, pos: yo.pos, escapado: yo.escapado, listo: yo.listo, plan: yo.plan, trampas: yo.trampas, antorcha: yo.antorcha,
      aturdido: yo.aturdido, maxPasos: maxPasos(yo), mensajes: yo.privado
    } : null,
    eventos: p.eventos, necesarios: necesarios(p), escapados: exploradores(p).filter((j) => j.escapado).length, exploradores: exploradores(p).length,
    recorridos: fin ? p.recorridos : null,
    fin: p.fin
  };
}
