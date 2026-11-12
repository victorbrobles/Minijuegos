// server/bingoball/engine.js
// Motor puro de «Bingoball». Lo usan las salas online (server/routes/bingoball.js). No guarda estado propio.
//
// Cada jugador recibe un cartón de 12 categorías (4 filas de 3). Van saliendo futbolistas (uno cada pocos
// segundos): si encaja en una categoría abierta de tu cartón, márcala. Acertar suma; fallar resta y te deja sin
// poder marcar hasta el siguiente futbolista. Con una fila completa puedes «cantar línea» (solo una por bingo, la
// primera): el bingo se para mientras decides; si la cantas sumas y esa fila cambia por tres categorías nuevas.
// Quien completa el cartón canta bingo.
//
// Qué futbolista sale: al azar, pero con pesos. Pesa más cuantas más casillas abiertas (de todos) encaja y cuanto
// más tiempo hace que no sale; los que acaban de salir pesan poco y los que no sirven a nadie, nada.

export const AJUSTES = {
  min: 2,
  max: 16,
  segPreparacion: 10,
  segFutbolista: 15,
  filas: 4,
  columnas: 3,
  puntosAcierto: 2,
  puntosFallo: 1,
  puntosLinea: 5,
  puntosBingo: 20,
  segDecidirLinea: 20,
  memoria: 12
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
    lineaCantada: null,
    pausa: null,
    avisoLinea: null,
    log: [],
    nlog: 0,
    fin: null
  };
  anotar(p, `Bingo: ${bingo.titulo}. ¡Mirad bien vuestro cartón!`);
  return p;
}

/** Peso de cada futbolista para el próximo sorteo (0 = no puede salir). */
export function pesos(p) {
  const abiertas = new Map();
  p.jugadores.filter((j) => !j.fuera).forEach((j) => j.carton.forEach((c) => {
    if (!c.marcada) abiertas.set(c.categoriaId, (abiertas.get(c.categoriaId) || 0) + 1);
  }));
  const casillas = new Map();
  p.bingo.categorias.forEach((cat) => {
    const n = abiertas.get(cat.id) || 0;
    if (n) cat.jugadores.forEach((f) => casillas.set(f, (casillas.get(f) || 0) + n));
  });
  const ultimaVez = new Map();
  p.historial.forEach((f, i) => ultimaVez.set(f, i));
  const total = p.historial.length;
  const res = new Map();
  casillas.forEach((n, f) => {
    // Hace cuántos futbolistas salió (1 = el último). Nunca: un poco más que el máximo.
    const hace = ultimaVez.has(f) ? total - ultimaVez.get(f) : AJUSTES.memoria * 1.5;
    const recencia = Math.min(1.5, Math.max(0.05, hace / AJUSTES.memoria));
    res.set(f, n * recencia);
  });
  return res;
}

function siguienteFutbolista(p) {
  const w = [...pesos(p).entries()].filter(([, x]) => x > 0);
  if (!w.length) return null;
  const suma = w.reduce((a, [, x]) => a + x, 0);
  let r = Math.random() * suma;
  for (const [f, x] of w) { r -= x; if (r <= 0) return f; }
  return w[w.length - 1][0];
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
  if (p.fase === 'linea') {
    if (ahora < p.pausa.hasta) return false;
    terminarPausa(p, false, ahora);
    return true;
  }
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
  if (p.fase === 'linea') return { ok: false, error: 'El bingo está en pausa: alguien está cantando línea.' };
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
  const fila = j.carton.filter((c) => c.fila === casilla.fila);
  const extra = fila.every((c) => c.marcada) && !p.lineaCantada ? ' ¡Fila completa: puedes cantar línea!' : '';
  j.ultimo = { ok: true, n: p.nlog + 1, texto: `¡${f} encaja en «${casilla.nombre}»! +${AJUSTES.puntosAcierto}.${extra}` };
  anotar(p, `✅ ${j.nombre} marca «${casilla.nombre}» con ${f}.`, 'bueno');
  if (j.carton.every((c) => c.marcada)) {
    j.puntos += AJUSTES.puntosBingo;
    anotar(p, `🎉 ¡${j.nombre} canta BINGO! (+${AJUSTES.puntosBingo})`, 'bueno');
    finalizar(p, j.id);
  }
  return { ok: true, acierto: true };
}

// ---------------------------------------------------------------- Línea
/** Un jugador con una fila completa pide cantar línea: el bingo se para hasta que confirme o la descarte. */
export function pedirLinea(p, id, fila, ahora = Date.now()) {
  tick(p, ahora);
  if (p.fase !== 'jugando') return { ok: false, error: 'Ahora no se puede cantar línea.' };
  if (p.lineaCantada) return { ok: false, error: 'La línea ya la ha cantado otro jugador.' };
  const j = jug(p, id);
  if (!j || j.fuera) return { ok: false, error: 'No estás en la partida.' };
  const f = Number(fila);
  const casillas = j.carton.filter((c) => c.fila === f);
  if (!casillas.length || !casillas.every((c) => c.marcada)) return { ok: false, error: 'Esa fila no está completa.' };
  p.fase = 'linea';
  p.pausa = { jugadorId: id, fila: f, desde: ahora, hasta: ahora + AJUSTES.segDecidirLinea * 1000 };
  anotar(p, `⏸️ ${j.nombre} quiere cantar línea: bingo en pausa.`);
  return { ok: true };
}

function terminarPausa(p, cantar, ahora) {
  const { jugadorId, fila, desde } = p.pausa;
  const j = jug(p, jugadorId);
  p.pausa = null;
  p.fase = 'jugando';
  if (j) j.ultimo = null;
  if (p.futbolista) p.futbolista.hasta += ahora - desde;
  if (cantar && j) {
    j.lineas += 1;
    j.puntos += AJUSTES.puntosLinea;
    p.lineaCantada = jugadorId;
    // Tres categorías nuevas que no estén ya en su cartón
    const enCarton = new Set(j.carton.map((c) => c.categoriaId));
    const nuevas = barajar(p.bingo.categorias.filter((c) => !enCarton.has(c.id))).slice(0, AJUSTES.columnas);
    j.carton.filter((c) => c.fila === fila).forEach((c, k) => {
      const cat = nuevas[k];
      if (!cat) return;
      c.id = `c${fila}_${p.nlog}_${k}`;
      c.categoriaId = cat.id;
      c.nombre = cat.nombre;
      c.marcada = false;
      c.futbolista = null;
    });
    anotar(p, `📣 ¡${j.nombre} canta LÍNEA! (+${AJUSTES.puntosLinea})`, 'bueno');
  } else {
    anotar(p, `▶️ ${j?.nombre ?? 'El jugador'} no canta la línea. Sigue el bingo.`);
  }
  p.avisoLinea = { n: p.nlog, jugadorId, cantada: Boolean(cantar && j) };
}

/** Respuesta a la pantalla de confirmación: cantar la línea (sí) o seguir sin cantarla (no). */
export function decidirLinea(p, id, cantar, ahora = Date.now()) {
  if (p.fase !== 'linea' || !p.pausa) return { ok: false, error: 'No hay ninguna línea pendiente.' };
  if (p.pausa.jugadorId !== id) return { ok: false, error: 'No eres quien está cantando línea.' };
  terminarPausa(p, Boolean(cantar), ahora);
  return { ok: true };
}

export function terminar(p) {
  if (p.fase === 'fin') return { ok: false, error: 'La partida ya ha terminado.' };
  finalizar(p, null);
  return { ok: true };
}

/** El anfitrión pasa al siguiente futbolista sin esperar. */
export function saltar(p, ahora = Date.now()) {
  if (p.fase === 'linea') { terminarPausa(p, false, ahora); return { ok: true }; }
  if (p.fase !== 'jugando') return { ok: false, error: 'Ahora no se puede.' };
  sacarFutbolista(p, ahora);
  return { ok: true };
}

export function abandonar(p, id) {
  const j = jug(p, id);
  if (!j || j.fuera || p.fase === 'fin') return;
  j.fuera = true;
  anotar(p, `🚪 ${j.nombre} abandona la partida.`, 'malo');
  if (p.fase === 'linea' && p.pausa?.jugadorId === id) terminarPausa(p, false, Date.now());
  if (!activos(p).length) finalizar(p, null);
}

export function vistaDe(p, yoId) {
  const yo = jug(p, yoId);
  return {
    fase: p.fase,
    titulo: p.bingo.titulo,
    hasta: p.fase === 'preparacion' ? p.hasta : p.futbolista?.hasta ?? null,
    pausadoEn: p.pausa?.desde ?? null,
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
    lineaCantada: p.lineaCantada,
    pausa: p.pausa ? { jugadorId: p.pausa.jugadorId, fila: p.pausa.jugadorId === yoId ? p.pausa.fila : null, hasta: p.pausa.hasta } : null,
    avisoLinea: p.avisoLinea,
    ganadorId: p.ganadorId,
    log: p.log.slice(-30),
    fin: p.fin
  };
}
