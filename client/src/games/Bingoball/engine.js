// server/bingoball/engine.js
// Motor puro de «Bingoball». Lo usan las salas online (server/routes/bingoball.js). No guarda estado propio.
//
// Cada jugador recibe un cartón de 12 categorías (4 filas de 3). Van saliendo futbolistas (uno cada pocos
// segundos): si encaja en una categoría abierta de tu cartón, márcala. Acertar suma; fallar resta y te deja sin
// poder marcar hasta el siguiente futbolista. Cada fila completa es una línea; quien completa el cartón canta bingo.

export const AJUSTES = {
  min: 2,
  max: 15,
  segPreparacion: 10,
  segFutbolista: 15,
  filas: 4,
  columnas: 3,
  puntosAcierto: 2,
  puntosFallo: 1,
  puntosLinea: 5,
  puntosBingo: 20,
  sinRepetir: 15
};

const barajar = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const igual = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();
const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);

function anotar(p, texto, tipo = '') {
  p.nlog += 1;
  p.log.push({ n: p.nlog, texto, tipo });
  if (p.log.length > 60) p.log.shift();
}

function generarCarton(bingo) {
  const total = AJUSTES.filas * AJUSTES.columnas;
  return barajar(bingo.categorias).slice(0, total).map((cat, i) => ({
    id: `c${i}`,
    categoriaId: cat.id,
    nombre: cat.nombre,
    fila: Math.floor(i / AJUSTES.columnas),
    marcada: false,
    futbolista: null
  }));
}

export function crearPartida(jugadores, bingo, ahora = Date.now()) {
  const p = {
    bingo: { id: bingo.id, titulo: bingo.titulo, categorias: bingo.categorias },
    jugadores: jugadores.map((j) => ({
      id: j.id, nombre: j.nombre, puntos: 0, aciertos: 0, fallos: 0, lineas: 0, fuera: false,
      carton: generarCarton(bingo), bloqueado: false, actuado: false, ultimo: null
    })),
    fase: 'preparacion',
    hasta: ahora + AJUSTES.segPreparacion * 1000,
    futbolista: null,
    numero: 0,
    historial: [],
    ganadorId: null,
    log: [],
    nlog: 0,
    fin: null
  };
  anotar(p, `Bingo: ${bingo.titulo}. ¡Mirad bien vuestro cartón!`);
  return p;
}

/** Futbolistas que encajan en alguna casilla abierta de algún cartón (los recientes, solo si no queda otro). */
function siguienteFutbolista(p) {
  const abiertas = new Set();
  activos(p).forEach((j) => j.carton.forEach((c) => { if (!c.marcada) abiertas.add(c.categoriaId); }));
  const utiles = new Set();
  p.bingo.categorias.forEach((cat) => { if (abiertas.has(cat.id)) cat.jugadores.forEach((f) => utiles.add(f)); });
  const lista = [...utiles];
  if (!lista.length) return null;
  const recientes = p.historial.slice(-AJUSTES.sinRepetir);
  const libres = lista.filter((f) => !recientes.includes(f));
  const pool = libres.length ? libres : lista;
  return pool[Math.floor(Math.random() * pool.length)];
}

function sacarFutbolista(p, ahora) {
  const nombre = siguienteFutbolista(p);
  if (!nombre) { finalizar(p, null); return; }
  p.numero += 1;
  p.historial.push(nombre);
  p.futbolista = { nombre, n: p.numero, hasta: ahora + AJUSTES.segFutbolista * 1000 };
  p.jugadores.forEach((j) => { j.bloqueado = false; j.actuado = false; });
}

function finalizar(p, ganadorId) {
  p.fase = 'fin';
  p.futbolista = null;
  p.ganadorId = ganadorId;
  const orden = [...p.jugadores].sort((a, b) => (a.fuera - b.fuera) || (b.puntos - a.puntos));
  let puesto = 0;
  let previo = null;
  const tabla = orden.map((j, i) => {
    if (j.puntos !== previo) { puesto = i + 1; previo = j.puntos; }
    return { id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, lineas: j.lineas, marcadas: j.carton.filter((c) => c.marcada).length, fuera: j.fuera, puesto: j.fuera ? null : puesto };
  });
  const max = Math.max(0, ...activos(p).map((j) => j.puntos));
  const ganadores = max > 0 ? activos(p).filter((j) => j.puntos === max).map((j) => j.id) : [];
  p.fin = { tabla, ganadores, max, bingoId: ganadorId };
}

/** Avanza el reloj: fin de la preparación y cambio de futbolista. Devuelve true si algo cambia. */
export function tick(p, ahora = Date.now()) {
  let cambio = false;
  let guard = 0;
  while (guard++ < 20) {
    if (p.fase === 'preparacion' && ahora >= p.hasta) {
      p.fase = 'jugando';
      sacarFutbolista(p, p.hasta);
      cambio = true;
    } else if (p.fase === 'jugando' && p.futbolista && ahora >= p.futbolista.hasta) {
      sacarFutbolista(p, Math.max(p.futbolista.hasta, ahora - AJUSTES.segFutbolista * 1000 + 1));
      cambio = true;
    } else break;
  }
  return cambio;
}

export function marcar(p, id, casillaId, ahora = Date.now()) {
  tick(p, ahora);
  if (p.fase !== 'jugando' || !p.futbolista) return { ok: false, error: 'Ahora no se puede marcar.' };
  const j = jug(p, id);
  if (!j || j.fuera) return { ok: false, error: 'No estás en la partida.' };
  if (j.bloqueado) return { ok: false, error: 'Has fallado con este futbolista: espera al siguiente.' };
  if (j.actuado) return { ok: false, error: 'Ya has marcado con este futbolista.' };
  const casilla = j.carton.find((c) => c.id === casillaId);
  if (!casilla || casilla.marcada) return { ok: false, error: 'Esa casilla ya está marcada.' };
  const f = p.futbolista.nombre;
  const cat = p.bingo.categorias.find((c) => c.id === casilla.categoriaId);
  const encaja = Boolean(cat?.jugadores.some((x) => igual(x, f)));
  if (!encaja) {
    const antes = j.puntos;
    j.puntos = Math.max(0, j.puntos - AJUSTES.puntosFallo);
    j.bloqueado = true;
    j.fallos += 1;
    j.ultimo = { ok: false, n: p.nlog + 1, texto: `${f} no encaja en «${casilla.nombre}»${j.puntos < antes ? ` (−${antes - j.puntos})` : ''}.` };
    anotar(p, `❌ ${j.nombre} falla con ${f} en «${casilla.nombre}».`, 'malo');
    return { ok: true, acierto: false };
  }
  casilla.marcada = true;
  casilla.futbolista = f;
  j.actuado = true;
  j.aciertos += 1;
  j.puntos += AJUSTES.puntosAcierto;
  let extra = '';
  const fila = j.carton.filter((c) => c.fila === casilla.fila);
  if (fila.every((c) => c.marcada)) {
    j.lineas += 1;
    j.puntos += AJUSTES.puntosLinea;
    extra = ` ¡Línea! (+${AJUSTES.puntosLinea})`;
    anotar(p, `📏 ${j.nombre} canta línea.`, 'bueno');
  }
  j.ultimo = { ok: true, n: p.nlog + 1, texto: `¡${f} encaja en «${casilla.nombre}»! +${AJUSTES.puntosAcierto}.${extra}` };
  anotar(p, `✅ ${j.nombre} marca «${casilla.nombre}» con ${f}.`, 'bueno');
  if (j.carton.every((c) => c.marcada)) {
    j.puntos += AJUSTES.puntosBingo;
    anotar(p, `🎉 ¡${j.nombre} canta BINGO! (+${AJUSTES.puntosBingo})`, 'bueno');
    finalizar(p, j.id);
  }
  return { ok: true, acierto: true };
}

export function terminar(p) {
  if (p.fase === 'fin') return { ok: false, error: 'La partida ya ha terminado.' };
  finalizar(p, null);
  return { ok: true };
}

/** El anfitrión pasa al siguiente futbolista sin esperar. */
export function saltar(p, ahora = Date.now()) {
  if (p.fase !== 'jugando') return { ok: false, error: 'Ahora no se puede.' };
  sacarFutbolista(p, ahora);
  return { ok: true };
}

export function abandonar(p, id) {
  const j = jug(p, id);
  if (!j || j.fuera || p.fase === 'fin') return;
  j.fuera = true;
  anotar(p, `🚪 ${j.nombre} abandona la partida.`, 'malo');
  if (!activos(p).length) finalizar(p, null);
}

export function vistaDe(p, yoId) {
  const yo = jug(p, yoId);
  return {
    fase: p.fase,
    titulo: p.bingo.titulo,
    hasta: p.fase === 'preparacion' ? p.hasta : p.futbolista?.hasta ?? null,
    futbolista: p.futbolista ? { nombre: p.futbolista.nombre, n: p.futbolista.n } : null,
    jugadores: p.jugadores.map((j) => ({
      id: j.id, nombre: j.nombre, puntos: j.puntos, lineas: j.lineas, fuera: j.fuera,
      marcadas: j.carton.filter((c) => c.marcada).length
    })),
    yo: yo ? {
      id: yo.id, carton: yo.carton.map((c) => ({ id: c.id, nombre: c.nombre, fila: c.fila, marcada: c.marcada, futbolista: c.futbolista })),
      bloqueado: yo.bloqueado, actuado: yo.actuado, ultimo: yo.ultimo
    } : null,
    total: AJUSTES.filas * AJUSTES.columnas,
    ganadorId: p.ganadorId,
    log: p.log.slice(-30),
    fin: p.fin
  };
}
