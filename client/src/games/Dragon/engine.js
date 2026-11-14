// client/src/games/Dragon/engine.js
// «El Dragón»: motor puro (salas online en server/routes/dragon.js y modo un dispositivo).
// Varias expediciones a una mazmorra. Se abre una sala: su tesoro se reparte entre los que siguen dentro (lo que
// no se puede repartir se queda en el suelo). Después, TODOS deciden a la vez y en secreto si siguen o vuelven:
//   · los que vuelven guardan su mochila en el cofre y se reparten lo que había en el suelo (y, si sale uno solo,
//     se lleva también las reliquias);
//   · si queda alguien dentro, se abre otra sala… y cada sala aumenta la probabilidad de que aparezca el dragón:
//     si aparece, los que siguen dentro pierden la mochila de esa expedición.
// Gana quien tenga más oro en el cofre al final.
export const OPCIONES_EXPEDICIONES = [3, 5, 7];
const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

/** Probabilidad de que la sala número n (la primera es 1) sea la del dragón. */
export const riesgo = (n) => (n <= 1 ? 0 : Math.min(0.55, 0.05 + 0.055 * (n - 2)));

export function crearPartida(jugadores, items, reglas = {}, ahora = Date.now()) {
  const p = {
    fase: 'decidir', ronda: 1, rondas: OPCIONES_EXPEDICIONES.includes(reglas.expediciones) ? reglas.expediciones : 5,
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, cofre: 0, mochila: 0, dentro: true, decision: null, fuera: false, listo: false })),
    salas: [], suelo: 0, reliquias: [], ultimo: null, historial: [], fin: null, creada: ahora
  };
  empezarExpedicion(p);
  return p;
}

const activos = (p) => p.jugadores.filter((j) => !j.fuera);
const dentro = (p) => activos(p).filter((j) => j.dentro);

function empezarExpedicion(p) {
  p.salas = []; p.suelo = 0; p.reliquias = []; p.ultimo = null;
  activos(p).forEach((j) => { j.mochila = 0; j.dentro = true; j.decision = null; j.listo = false; });
  abrirSala(p);
}

function abrirSala(p) {
  const n = p.salas.length + 1;
  const quedan = dentro(p);
  if (Math.random() < riesgo(n)) {
    const perdido = quedan.map((j) => ({ id: j.id, nombre: j.nombre, pierde: j.mochila }));
    quedan.forEach((j) => { j.mochila = 0; j.dentro = false; });
    p.salas.push({ n, tipo: 'dragon' });
    p.ultimo = { ...p.ultimo, dragon: perdido };
    terminarExpedicion(p, 'dragon');
    return;
  }
  if (n > 2 && Math.random() < 0.16) {
    const valor = 6 + 2 * n;
    p.reliquias.push(valor);
    p.salas.push({ n, tipo: 'reliquia', valor });
    return;
  }
  const valor = r(n + 1, 3 * n + 4);
  const cada = Math.floor(valor / quedan.length);
  const resto = valor - cada * quedan.length;
  quedan.forEach((j) => { j.mochila += cada; });
  p.suelo += resto;
  p.salas.push({ n, tipo: 'tesoro', valor, cada, resto });
}

function terminarExpedicion(p, motivo) {
  p.historial.push({ expedicion: p.ronda, salas: p.salas.length, motivo });
  p.fase = 'resumen';
  activos(p).forEach((j) => { j.listo = false; });
  p.motivo = motivo;
}

/** Cuando todos los de dentro han decidido: salen los que vuelven y, si queda alguien, se abre otra sala. */
function resolver(p) {
  const quedan = dentro(p);
  const vuelven = quedan.filter((j) => j.decision === 'volver');
  const siguen = quedan.filter((j) => j.decision === 'seguir');
  const reparto = {};
  if (vuelven.length) {
    const cada = Math.floor(p.suelo / vuelven.length);
    p.suelo -= cada * vuelven.length;
    let reliquias = 0;
    if (vuelven.length === 1 && p.reliquias.length) { reliquias = p.reliquias.reduce((a, b) => a + b, 0); p.reliquias = []; }
    vuelven.forEach((j) => {
      const extra = cada + (vuelven.length === 1 ? reliquias : 0);
      j.mochila += extra; reparto[j.id] = { suelo: cada, reliquias: vuelven.length === 1 ? reliquias : 0, guarda: j.mochila };
      j.cofre += j.mochila; j.mochila = 0; j.dentro = false;
    });
  }
  p.ultimo = { sala: p.salas.length, vuelven: vuelven.map((j) => ({ id: j.id, nombre: j.nombre, ...reparto[j.id] })), siguen: siguen.map((j) => ({ id: j.id, nombre: j.nombre })) };
  quedan.forEach((j) => { j.decision = null; j.listo = false; });
  if (!siguen.length) { terminarExpedicion(p, 'todos'); return; }
  abrirSala(p);
}

export function decidir(p, id, decision) {
  if (p.fase !== 'decidir') return { ok: false, error: 'Ahora no se decide.' };
  const j = p.jugadores.find((x) => x.id === id);
  if (!j || j.fuera || !j.dentro) return { ok: false, error: 'Ya no estás dentro de la mazmorra.' };
  if (!['seguir', 'volver'].includes(decision)) return { ok: false, error: 'Decisión no válida.' };
  j.decision = decision; j.listo = true;
  if (dentro(p).every((x) => x.listo)) resolver(p);
  return { ok: true };
}

export function seguir(p, id) {
  if (p.fase !== 'resumen') return { ok: false, error: 'Aún no ha terminado la expedición.' };
  if (id == null) activos(p).forEach((j) => { j.listo = true; });
  else { const j = p.jugadores.find((x) => x.id === id); if (j) j.listo = true; }
  if (activos(p).every((j) => j.listo)) siguienteExpedicion(p);
  return { ok: true };
}

function siguienteExpedicion(p) {
  if (p.ronda >= p.rondas) { terminar(p); return; }
  p.ronda += 1; p.fase = 'decidir';
  empezarExpedicion(p);
}

export function terminar(p) {
  const tabla = [...p.jugadores].sort((a, b) => b.cofre - a.cofre)
    .map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.cofre, fuera: j.fuera }));
  let puesto = 0; let previo = null;
  tabla.forEach((t, i) => { if (t.puntos !== previo) { puesto = i + 1; previo = t.puntos; } t.puesto = puesto; });
  const max = Math.max(0, ...tabla.filter((t) => !t.fuera).map((t) => t.puntos));
  p.fase = 'fin';
  p.fin = { tabla, max, ganadores: max > 0 ? tabla.filter((t) => !t.fuera && t.puntos === max).map((t) => t.id) : [] };
  return { ok: true };
}

/** El anfitrión no espera más: los indecisos vuelven a casa (o se pasa a la siguiente expedición). */
export function forzar(p) {
  if (p.fase === 'decidir') { dentro(p).filter((j) => !j.listo).forEach((j) => { j.decision = 'volver'; j.listo = true; }); resolver(p); }
  else if (p.fase === 'resumen') seguir(p, null);
  return { ok: true };
}

export function abandonar(p, id) {
  const j = p.jugadores.find((x) => x.id === id);
  if (!j) return;
  j.fuera = true; j.dentro = false;
  if (activos(p).length < 2 && p.fase !== 'fin') { terminar(p); return; }
  if (p.fase === 'decidir' && dentro(p).length && dentro(p).every((x) => x.listo)) resolver(p);
  if (p.fase === 'decidir' && !dentro(p).length) terminarExpedicion(p, 'todos');
  if (p.fase === 'resumen' && activos(p).every((x) => x.listo)) siguienteExpedicion(p);
}

export function tick() {}

export function accion(p, id, d) {
  switch (d.tipo) {
    case 'decidir': return decidir(p, id, d.decision);
    case 'seguir': return seguir(p, id);
    default: return null;
  }
}

/** En un solo móvil: quién tiene que decidir en secreto (null = pantalla común). */
export function turnoLocal(p) {
  if (p.fase !== 'decidir') return null;
  return dentro(p).find((j) => !j.listo)?.id ?? null;
}

export function vistaDe(p, id) {
  const yo = p.jugadores.find((j) => j.id === id);
  return {
    fase: p.fase, ronda: p.ronda, rondas: p.rondas,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.cofre, mochila: j.mochila, dentro: j.dentro, listo: j.listo, fuera: j.fuera })),
    yo: yo ? { id: yo.id, decision: yo.decision, dentro: yo.dentro, listo: yo.listo, mochila: yo.mochila, cofre: yo.cofre } : null,
    salas: p.salas, suelo: p.suelo, reliquias: p.reliquias, riesgo: riesgo(p.salas.length + 1),
    ultimo: p.ultimo, motivo: p.motivo, historial: p.historial, fin: p.fin
  };
}
