// client/src/games/Estelas/engine.js
// «Estelas»: motor puro en tiempo real (salas online en server/routes/estelas.js y práctica contra bots).
// Cada jugador es una línea de luz que avanza sola por una cuadrícula y deja rastro. Se gira a izquierda o derecha;
// quien choca con una pared o con cualquier rastro queda fuera. Gana la ronda el último en pie.
// El servidor manda: avanza la cuadrícula según el tiempo (un paso cada PASO_MS) y aplica los giros que le llegan.
export const C = 40;
export const F = 56;
export const PASO_MS = 105;
export const SEG_CUENTA = 3;
export const SEG_FIN_RONDA = 3.5;
export const OPCIONES_RONDAS = [3, 5, 7];
export const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // arriba, derecha, abajo, izquierda

const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const enJuego = (p) => p.jugadores.filter((j) => !j.fuera);

/** Puestos de salida repartidos alrededor, mirando hacia dentro. */
function salidas(n) {
  const lista = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.PI / 4;
    const x = Math.round(C / 2 + Math.cos(a) * (C / 2 - 5));
    const y = Math.round(F / 2 + Math.sin(a) * (F / 2 - 6));
    const dx = C / 2 - x; const dy = F / 2 - y;
    const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0);
    lista.push({ x, y, dir });
  }
  return lista;
}

export function crearPartida(jugadores, items = [], reglas = {}, ahora = Date.now()) {
  const rondas = OPCIONES_RONDAS.includes(reglas.rondas) ? reglas.rondas : 5;
  const p = {
    fase: 'cuenta', ronda: 1, rondas, paso: 0, inicio: 0, hasta: 0, rejilla: null, ultimoGanador: null, fin: null,
    jugadores: jugadores.map((j, i) => ({ id: j.id, nombre: j.nombre, color: i, puntos: 0, fuera: false, bot: Boolean(j.bot), vivo: true, dir: 0, cola: [], rastro: [] }))
  };
  nuevaRonda(p, ahora);
  return p;
}

function nuevaRonda(p, ahora) {
  p.rejilla = new Array(C * F).fill(0);
  const js = enJuego(p);
  const pos = salidas(js.length);
  js.forEach((j, i) => {
    const s = pos[i];
    j.vivo = true; j.dir = s.dir; j.cola = []; j.rastro = [[s.x, s.y]]; j.murio = null;
    p.rejilla[s.y * C + s.x] = j.id;
  });
  p.paso = 0; p.fase = 'cuenta'; p.inicio = ahora + SEG_CUENTA * 1000; p.hasta = 0;
}

/** Avanza un paso: todos se mueven a la vez; chocar con algo (o con otro en la misma casilla) elimina. */
function avanzar(p) {
  const vivos = p.jugadores.filter((j) => j.vivo && !j.fuera);
  const destinos = vivos.map((j) => {
    while (j.cola.length) { const d = j.cola.shift(); if (d !== j.dir && (d + 2) % 4 !== j.dir) { j.dir = d; break; } }
    const [x, y] = j.rastro[j.rastro.length - 1];
    return { j, x: x + DIRS[j.dir][0], y: y + DIRS[j.dir][1] };
  });
  p.paso += 1;
  const muertos = new Set();
  destinos.forEach((d) => {
    if (d.x < 0 || d.y < 0 || d.x >= C || d.y >= F || p.rejilla[d.y * C + d.x]) muertos.add(d.j.id);
    if (destinos.some((o) => o !== d && o.x === d.x && o.y === d.y)) muertos.add(d.j.id);
  });
  destinos.forEach((d) => {
    if (muertos.has(d.j.id)) { d.j.vivo = false; d.j.murio = p.paso; return; }
    d.j.rastro.push([d.x, d.y]);
    p.rejilla[d.y * C + d.x] = d.j.id;
  });
  // Puntos: cada eliminación da 1 punto a los que siguen vivos
  if (muertos.size) p.jugadores.forEach((j) => { if (j.vivo && !j.fuera) j.puntos += muertos.size; });
}

function cerrarRonda(p, ahora) {
  const vivos = p.jugadores.filter((j) => j.vivo && !j.fuera);
  if (vivos.length === 1) { vivos[0].puntos += 2; p.ultimoGanador = vivos[0].id; } else p.ultimoGanador = null;
  p.fase = 'finRonda'; p.hasta = ahora + SEG_FIN_RONDA * 1000;
}

export function tick(p, ahora = Date.now()) {
  if (p.fase === 'fin') return;
  if (p.fase === 'cuenta' && ahora >= p.inicio) p.fase = 'jugando';
  if (p.fase === 'jugando') {
    const objetivo = Math.floor((ahora - p.inicio) / PASO_MS);
    let n = 0;
    while (p.paso < objetivo && n < 200) {
      p.jugadores.forEach((j) => { if (j.bot && j.vivo) { const d = dirBot(p, j); if (d !== j.dir) j.cola = [d]; } });
      avanzar(p); n += 1;
      if (p.jugadores.filter((j) => j.vivo && !j.fuera).length <= 1) { cerrarRonda(p, ahora); break; }
    }
  } else if (p.fase === 'finRonda' && ahora >= p.hasta) {
    if (p.ronda >= p.rondas || enJuego(p).length < 2) terminar(p);
    else { p.ronda += 1; nuevaRonda(p, ahora); }
  }
}

export function girar(p, id, dir) {
  const j = jug(p, id);
  const d = Number(dir);
  if (!j || !j.vivo || ![0, 1, 2, 3].includes(d)) return { ok: false };
  const ultima = j.cola.length ? j.cola[j.cola.length - 1] : j.dir;
  if (d === ultima || (d + 2) % 4 === ultima) return { ok: true };
  if (j.cola.length < 3) j.cola.push(d);
  return { ok: true };
}

export function terminar(p) {
  const tabla = p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, fuera: j.fuera })).sort((a, b) => Number(a.fuera) - Number(b.fuera) || b.puntos - a.puntos);
  let puesto = 0; let previo = null;
  tabla.forEach((t, i) => { if (t.puntos !== previo) { puesto = i + 1; previo = t.puntos; } t.puesto = puesto; });
  const max = Math.max(0, ...tabla.filter((t) => !t.fuera).map((t) => t.puntos));
  p.fase = 'fin';
  p.fin = { tabla, max, ganadores: tabla.filter((t) => !t.fuera && t.puntos === max).map((t) => t.id) };
  return { ok: true };
}

export function abandonar(p, id) {
  const j = jug(p, id); if (!j || p.fase === 'fin') return;
  j.fuera = true; j.vivo = false;
  if (enJuego(p).length < 2) terminar(p);
}
export function accion(p, id, d) {
  if (d.tipo === 'girar') return girar(p, id, d.dir);
  return null;
}
export const forzar = (p, ahora = Date.now()) => { if (p.fase === 'jugando') cerrarRonda(p, ahora); else if (p.fase === 'finRonda') { p.hasta = 0; tick(p, ahora); } return { ok: true }; };
export const turnoLocal = () => null;

/** Vista lenta (la de la sala): marcador y fase. El dibujo va por `sincronizar`. */
export function vistaDe(p, id, ahora = Date.now()) {
  const yo = jug(p, id);
  return {
    fase: p.fase, ronda: p.ronda, rondas: p.rondas, inicio: p.inicio, hasta: p.hasta, ahora, ultimoGanador: p.ultimoGanador,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, color: j.color, puntos: j.puntos, vivo: j.vivo, fuera: j.fuera })),
    yo: yo ? { id: yo.id } : null, fin: p.fin
  };
}

/** Sincronización rápida: lo nuevo de cada rastro desde el paso `desde` de la ronda `ronda`. */
export function sincronizar(p, id, { desde = -1, ronda = 0 } = {}, ahora = Date.now()) {
  const nueva = ronda !== p.ronda;
  return {
    ahora, fase: p.fase, ronda: p.ronda, rondas: p.rondas, paso: p.paso, inicio: p.inicio, hasta: p.hasta, ultimoGanador: p.ultimoGanador,
    jugadores: p.jugadores.map((j) => ({
      id: j.id, color: j.color, vivo: j.vivo, dir: j.dir, puntos: j.puntos, fuera: j.fuera,
      desde: nueva ? 0 : Math.max(0, desde + 1), nuevos: j.rastro.slice(nueva ? 0 : Math.max(0, desde + 1))
    })),
    fin: p.fin
  };
}

/* ───────── Bot (práctica): elige el giro con más sitio libre por delante ───────── */
function libres(p, x0, y0, limite = 90) {
  const vis = new Set(); const cola = [[x0, y0]]; let n = 0;
  while (cola.length && n < limite) {
    const [x, y] = cola.shift(); const k = y * C + x;
    if (x < 0 || y < 0 || x >= C || y >= F || p.rejilla[k] || vis.has(k)) continue;
    vis.add(k); n += 1;
    DIRS.forEach(([dx, dy]) => cola.push([x + dx, y + dy]));
  }
  return n;
}
export function dirBot(p, j) {
  const [x, y] = j.rastro[j.rastro.length - 1];
  const opciones = [j.dir, (j.dir + 1) % 4, (j.dir + 3) % 4].map((d) => {
    const nx = x + DIRS[d][0]; const ny = y + DIRS[d][1];
    let espacio = libres(p, nx, ny);
    // Mira un poco más adelante en línea recta
    let recto = 0; for (let k = 1; k <= 6; k++) { const xx = x + DIRS[d][0] * k; const yy = y + DIRS[d][1] * k; if (xx < 0 || yy < 0 || xx >= C || yy >= F || p.rejilla[yy * C + xx]) break; recto += 1; }
    espacio += recto * 2 + (d === j.dir ? 3 : 0) + Math.random() * 4;
    return { d, espacio };
  });
  opciones.sort((a, b) => b.espacio - a.espacio);
  return opciones[0].d;
}
