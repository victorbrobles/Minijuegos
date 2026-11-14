// client/src/games/Subasta/engine.js
// «Subasta a ciegas»: motor puro (salas online en server/routes/subasta.js y modo un dispositivo).
// Todos empiezan con 100 monedas. Sale un lote con una tasación orientativa; algunos jugadores reciben además el
// soplo de su experto. Todos pujan a la vez y en secreto: gana la puja más alta y la paga. Si hay empate arriba,
// nadie se lo lleva y los empatados pagan la mitad. El contenido puede ser un tesoro, un trasto o un efecto
// especial (que se aplica al momento). Al final se abren todos los lotes: gana quien tenga más monedas + valor.
export const OPCIONES_LOTES = [6, 8, 10];
export const INICIAL = 100;
const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const barajar = (l) => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export const OBJETOS = [
  ['Baúl del abuelo', '🧳'], ['Cuadro sin firmar', '🖼️'], ['Caja fuerte oxidada', '🗄️'], ['Jarrón de porcelana', '🏺'], ['Mapa arrugado', '🗺️'],
  ['Huevo dorado', '🥚'], ['Reloj de bolsillo', '⏱️'], ['Guitarra firmada', '🎸'], ['Cofre pirata', '🏴‍☠️'], ['Botella con mensaje', '🍾'],
  ['Lámpara de aceite', '🪔'], ['Maleta perdida', '💼'], ['Disco de vinilo', '💿'], ['Espada antigua', '🗡️'], ['Corona de un rey', '👑'],
  ['Telescopio de latón', '🔭'], ['Muñeca de porcelana', '🪆'], ['Caja de música', '🎶'], ['Moneda de oro', '🪙'], ['Diamante en bruto', '💎'],
  ['Camiseta de un mundial', '👕'], ['Bola de cristal', '🔮'], ['Libro encuadernado en piel', '📕'], ['Robot de hojalata', '🤖'], ['Saco misterioso', '🎒'],
  ['Trofeo de bolos', '🏆'], ['Máscara veneciana', '🎭'], ['Paraguas de seda', '☂️'], ['Pergamino sellado', '📜'], ['Caja de cartón', '📦']
];
export const EFECTOS = {
  maldicion: { e: '💀', nombre: 'Maldición', texto: 'Pierdes 25 monedas.' },
  ladron: { e: '🦹', nombre: 'Ladrón', texto: 'Robas 20 monedas al jugador más rico (sin contarte a ti).' },
  doble: { e: '✨', nombre: 'Varita duplicadora', texto: 'El próximo tesoro que ganes valdrá el doble.' },
  lupa: { e: '🔍', nombre: 'Lupa del tasador', texto: 'Ves el contenido de los dos próximos lotes.' },
  reembolso: { e: '💸', nombre: 'Garantía', texto: 'Te devuelven lo que has pagado y 10 monedas más.' },
  reparto: { e: '🎁', nombre: 'Regalo para todos', texto: 'Los demás jugadores reciben 10 monedas cada uno.' }
};

/** Lotes de una partida: contenido oculto, tasación pública (un rango) y soplos privados. */
export function generarLotes(n) {
  const efectos = barajar(Object.keys(EFECTOS));
  return barajar(OBJETOS).slice(0, n).map(([nombre, e], i) => {
    const t = Math.random();
    let contenido;
    if (t < 0.45) contenido = { tipo: 'tesoro', valor: r(25, 110) };
    else if (t < 0.75) contenido = { tipo: 'trasto', valor: r(0, 8) };
    else contenido = { tipo: 'efecto', efecto: efectos[i % efectos.length], valor: 0 };
    // Tasación: un rango amplio que suele (no siempre) contener el valor
    const centro = contenido.tipo === 'efecto' ? r(15, 60) : contenido.valor;
    const ancho = r(30, 60);
    const min = Math.max(0, Math.round(centro - ancho * Math.random()));
    return { n: i + 1, nombre, e, contenido, tasacion: [min, min + ancho] };
  });
}
const SOPLOS = {
  tesoro: (c) => (Math.random() < 0.5 ? 'Mi experto dice: «Esto es auténtico».' : `Mi experto dice: «Vale más de ${Math.max(10, c.valor - r(5, 20))}».`),
  trasto: () => (Math.random() < 0.5 ? 'Mi experto dice: «Huele a imitación barata».' : 'Mi experto dice: «Yo no pagaría más de 10».'),
  efecto: () => 'Mi experto dice: «Aquí hay algo raro… no es lo que parece».'
};

export function crearPartida(jugadores, items, reglas = {}, ahora = Date.now()) {
  const n = OPCIONES_LOTES.includes(reglas.lotes) ? reglas.lotes : 8;
  const lotes = items?.length ? items : generarLotes(n);
  const p = {
    fase: 'pujar', ronda: 1, rondas: lotes.length, lotes,
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, monedas: INICIAL, lotes: [], puja: null, listo: false, doble: false, soplos: {}, fuera: false })),
    resultado: null, historial: [], fin: null, creada: ahora
  };
  repartirSoplos(p);
  return p;
}
const activos = (p) => p.jugadores.filter((j) => !j.fuera);

function repartirSoplos(p) {
  const lote = p.lotes[p.ronda - 1];
  const elegidos = barajar(activos(p)).slice(0, Math.max(1, Math.floor(activos(p).length / 2)));
  elegidos.forEach((j) => { j.soplos[lote.n] = SOPLOS[lote.contenido.tipo](lote.contenido); });
}

export function pujar(p, id, cantidad) {
  if (p.fase !== 'pujar') return { ok: false, error: 'Ahora no se puja.' };
  const j = p.jugadores.find((x) => x.id === id);
  if (!j || j.fuera) return { ok: false, error: 'No estás en la partida.' };
  const c = Math.floor(Number(cantidad));
  if (!Number.isFinite(c) || c < 0) return { ok: false, error: 'Puja no válida.' };
  if (c > j.monedas) return { ok: false, error: `Solo tienes ${j.monedas} monedas.` };
  j.puja = c; j.listo = true;
  if (activos(p).every((x) => x.listo)) resolver(p);
  return { ok: true };
}

function resolver(p) {
  const lote = p.lotes[p.ronda - 1];
  const pujas = activos(p).map((j) => ({ id: j.id, nombre: j.nombre, puja: j.puja })).sort((a, b) => b.puja - a.puja);
  const max = pujas[0]?.puja ?? 0;
  const arriba = pujas.filter((x) => x.puja === max);
  const res = { lote: lote.n, pujas, ganador: null, empate: false, efecto: null };
  if (max === 0) {
    res.desierto = true;
  } else if (arriba.length > 1) {
    res.empate = true;
    arriba.forEach((x) => { const j = p.jugadores.find((y) => y.id === x.id); j.monedas -= Math.floor(x.puja / 2); });
  } else {
    const j = p.jugadores.find((y) => y.id === arriba[0].id);
    j.monedas -= max; res.ganador = j.id;
    const c = lote.contenido;
    const item = { n: lote.n, nombre: lote.nombre, e: lote.e, tipo: c.tipo, valor: c.valor, pagado: max };
    if (c.tipo === 'tesoro' && j.doble) { item.valor *= 2; item.doble = true; j.doble = false; }
    if (c.tipo === 'efecto') {
      const ef = EFECTOS[c.efecto]; item.efecto = c.efecto;
      res.efecto = { clave: c.efecto, ...ef };
      if (c.efecto === 'maldicion') j.monedas = Math.max(0, j.monedas - 25);
      if (c.efecto === 'ladron') {
        const rico = activos(p).filter((x) => x.id !== j.id).sort((a, b) => b.monedas - a.monedas)[0];
        if (rico) { const q = Math.min(20, rico.monedas); rico.monedas -= q; j.monedas += q; res.efecto.victima = rico.nombre; res.efecto.cantidad = q; }
      }
      if (c.efecto === 'doble') j.doble = true;
      if (c.efecto === 'reembolso') j.monedas += max + 10;
      if (c.efecto === 'reparto') activos(p).filter((x) => x.id !== j.id).forEach((x) => { x.monedas += 10; });
    }
    j.lotes.push(item);
  }
  p.resultado = res; p.historial.push(res);
  p.fase = 'resultado';
  activos(p).forEach((x) => { x.listo = false; });
}

export function seguir(p, id) {
  if (p.fase !== 'resultado') return { ok: false, error: 'Aún no se ha resuelto el lote.' };
  if (id == null) activos(p).forEach((j) => { j.listo = true; });
  else { const j = p.jugadores.find((x) => x.id === id); if (j) j.listo = true; }
  if (activos(p).every((j) => j.listo)) siguienteLote(p);
  return { ok: true };
}

function siguienteLote(p) {
  if (p.ronda >= p.rondas) { terminar(p); return; }
  p.ronda += 1; p.fase = 'pujar'; p.resultado = null;
  activos(p).forEach((j) => { j.puja = null; j.listo = false; });
  repartirSoplos(p);
}

const valorDe = (j) => j.lotes.reduce((a, l) => a + (l.tipo === 'efecto' ? 0 : l.valor), 0);
export function terminar(p) {
  const tabla = [...p.jugadores].map((j) => ({ id: j.id, nombre: j.nombre, monedas: j.monedas, objetos: valorDe(j), puntos: j.monedas + valorDe(j), lotes: j.lotes, fuera: j.fuera }))
    .sort((a, b) => b.puntos - a.puntos);
  let puesto = 0; let previo = null;
  tabla.forEach((t, i) => { if (t.puntos !== previo) { puesto = i + 1; previo = t.puntos; } t.puesto = puesto; });
  const max = Math.max(0, ...tabla.filter((t) => !t.fuera).map((t) => t.puntos));
  p.fase = 'fin';
  p.fin = { tabla, max, ganadores: tabla.filter((t) => !t.fuera && t.puntos === max).map((t) => t.id), lotes: p.lotes };
  return { ok: true };
}

export function forzar(p) {
  if (p.fase === 'pujar') { activos(p).filter((j) => !j.listo).forEach((j) => { j.puja = 0; j.listo = true; }); resolver(p); }
  else if (p.fase === 'resultado') seguir(p, null);
  return { ok: true };
}

export function abandonar(p, id) {
  const j = p.jugadores.find((x) => x.id === id);
  if (!j) return;
  j.fuera = true;
  if (activos(p).length < 2 && p.fase !== 'fin') { terminar(p); return; }
  if (p.fase === 'pujar' && activos(p).every((x) => x.listo)) resolver(p);
  else if (p.fase === 'resultado' && activos(p).every((x) => x.listo)) siguienteLote(p);
}

export function tick() {}
export function accion(p, id, d) {
  switch (d.tipo) {
    case 'pujar': return pujar(p, id, d.cantidad);
    case 'seguir': return seguir(p, id);
    default: return null;
  }
}
export function turnoLocal(p) {
  if (p.fase !== 'pujar') return null;
  return activos(p).find((j) => !j.listo)?.id ?? null;
}

/** ¿Qué lotes ve por adelantado este jugador gracias a la lupa? */
function vistosConLupa(p, j) {
  if (!j.lotes.some((l) => l.efecto === 'lupa')) return [];
  const desde = j.lotes.filter((l) => l.efecto === 'lupa').map((l) => l.n);
  return p.lotes.filter((l) => desde.some((n) => l.n > n && l.n <= n + 2)).map((l) => l.n);
}

export function vistaDe(p, id) {
  const yo = p.jugadores.find((j) => j.id === id);
  const lote = p.lotes[p.ronda - 1];
  const lupa = yo ? vistosConLupa(p, yo) : [];
  const fin = p.fase === 'fin';
  return {
    fase: p.fase, ronda: p.ronda, rondas: p.rondas,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.monedas, lotes: j.lotes.length, listo: j.listo, fuera: j.fuera })),
    lote: lote && { n: lote.n, nombre: lote.nombre, e: lote.e, tasacion: lote.tasacion, contenido: lupa.includes(lote.n) || fin ? lote.contenido : undefined },
    resultado: p.resultado,
    yo: yo ? {
      id: yo.id, monedas: yo.monedas, puja: yo.puja, listo: yo.listo, doble: yo.doble, soplo: lote ? yo.soplos[lote.n] : null,
      lotes: yo.lotes, lupa: lupa.filter((n) => n >= p.ronda).map((n) => { const l = p.lotes[n - 1]; return { n, nombre: l.nombre, e: l.e, contenido: l.contenido }; })
    } : null,
    historial: p.historial, fin: p.fin
  };
}
