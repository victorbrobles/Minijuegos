// client/src/games/Piramides/engine.js
// «Pirámides futbolísticas»: motor puro (salas online en server/routes/piramides.js y modo un dispositivo).
// Cada jugador tiene una regla secreta sobre futbolistas («juega en la Premier», «tiene 30 años o más»…).
// En tu turno dices un futbolista y a quién se lo preguntas: su regla responde si encaja o no (lo apunta su
// pirámide, a la vista de todos). Después puedes intentar adivinar la regla de alguien (+3, o −1 si fallas).
// Al final, cada regla que nadie ha descubierto da 2 puntos a su dueño.
// Los futbolistas (items) son los de la temporada 2025/26: { nombre, pais, cont, club, liga, pos, edad, media }.
export const OPCIONES_VUELTAS = [3, 4, 5];
const norm = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim();
const barajar = (l) => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const apellido = (f) => norm(f.nombre).split(' ').slice(-1)[0];
const MADRID = ['Real Madrid', 'Atlético', 'Rayo Vallecano'];
const LONDRES = ['Arsenal', 'Chelsea', 'Tottenham', 'West Ham', 'Crystal Palace', 'Fulham'];

export const REGLAS = [
  { id: 'laliga', texto: 'Juega en LaLiga', fn: (f) => f.liga === 'LaLiga' },
  { id: 'premier', texto: 'Juega en la Premier League', fn: (f) => f.liga === 'Premier League' },
  { id: 'italia', texto: 'Juega en la Serie A italiana', fn: (f) => f.liga === 'Serie A' },
  { id: 'otras', texto: 'No juega ni en LaLiga ni en la Premier', fn: (f) => f.liga !== 'LaLiga' && f.liga !== 'Premier League' },
  { id: 'espanol', texto: 'Es español', fn: (f) => f.pais === 'España' },
  { id: 'america', texto: 'Es de un país de América', fn: (f) => f.cont === 'am' },
  { id: 'africa', texto: 'Es de un país de África', fn: (f) => f.cont === 'af' },
  { id: 'europeo', texto: 'Es europeo pero no español', fn: (f) => f.cont === 'eu' && f.pais !== 'España' },
  { id: 'extranjero', texto: 'Juega en una liga que no es la de su país', fn: (f) => !({ España: 'LaLiga', Inglaterra: 'Premier League', Italia: 'Serie A', Alemania: 'Bundesliga', Francia: 'Ligue 1' }[f.pais] === f.liga) },
  { id: 'portdef', texto: 'Es portero o defensa', fn: (f) => f.pos === 'POR' || f.pos === 'DEF' },
  { id: 'medio', texto: 'Es centrocampista', fn: (f) => f.pos === 'MED' },
  { id: 'delantero', texto: 'Es delantero', fn: (f) => f.pos === 'DEL' },
  { id: 'veterano', texto: 'Tiene 30 años o más', fn: (f) => f.edad >= 30 },
  { id: 'joven', texto: 'Tiene 23 años o menos', fn: (f) => f.edad <= 23 },
  { id: 'edadpar', texto: 'Su edad es un número par', fn: (f) => f.edad % 2 === 0 },
  { id: 'crack', texto: 'Tiene media 86 o más', fn: (f) => f.media >= 86 },
  { id: 'normal', texto: 'Tiene media de 82 o menos', fn: (f) => f.media <= 82 },
  { id: 'madrid', texto: 'Juega en un equipo de Madrid', fn: (f) => MADRID.includes(f.club) },
  { id: 'londres', texto: 'Juega en un equipo de Londres', fn: (f) => LONDRES.includes(f.club) },
  { id: 'grandes', texto: 'Juega en el Real Madrid, el Barça o el Bayern', fn: (f) => ['Real Madrid', 'Barcelona', 'Bayern'].includes(f.club) },
  { id: 'vocal', texto: 'Su apellido (última palabra) empieza por vocal', fn: (f) => /^[aeiou]/.test(apellido(f)) },
  { id: 'apellidoA', texto: 'Su apellido (última palabra) acaba en vocal', fn: (f) => /[aeiou]$/.test(apellido(f)) },
  { id: 'largo', texto: 'Su nombre completo tiene más de 13 letras', fn: (f) => norm(f.nombre).replace(/ /g, '').length > 13 },
  { id: 'unapalabra', texto: 'Se le conoce por una sola palabra (Pedri, Rodri…)', fn: (f) => !norm(f.nombre).includes(' ') },
  { id: 'letraR', texto: 'Su nombre lleva la letra R', fn: (f) => norm(f.nombre).includes('r') }
];
const regla = (id) => REGLAS.find((r) => r.id === id);

export function crearPartida(jugadores, items, reglas = {}, ahora = Date.now()) {
  const vueltas = OPCIONES_VUELTAS.includes(reglas.vueltas) ? reglas.vueltas : 4;
  const futbolistas = Array.isArray(items) ? items : [];
  // Reglas razonables: que entre el 15 % y el 85 % de los futbolistas encajen
  const validas = REGLAS.filter((r) => { const n = futbolistas.filter(r.fn).length; return !futbolistas.length || (n > futbolistas.length * 0.12 && n < futbolistas.length * 0.88); });
  const asignadas = barajar(validas).slice(0, jugadores.length);
  const p = {
    fase: 'ver', ronda: 1, rondas: vueltas, futbolistas, turno: 0, paso: 'preguntar', ultimo: null, log: [],
    jugadores: jugadores.map((j, i) => {
      const r = asignadas[i % asignadas.length];
      const opciones = barajar([r.id, ...barajar(validas.filter((x) => x.id !== r.id)).slice(0, 5).map((x) => x.id)]);
      return { id: j.id, nombre: j.nombre, regla: r.id, opciones, descubierta: false, descubiertaPor: null, fallos: [], puntos: 0, tablero: [], listo: false, fuera: false };
    }),
    fin: null, creada: ahora
  };
  p.turno = Math.floor(Math.random() * p.jugadores.length);
  return p;
}
const activos = (p) => p.jugadores.filter((j) => !j.fuera);
const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const actual = (p) => p.jugadores[p.turno];

export function visto(p, id) {
  if (p.fase !== 'ver') return { ok: false, error: 'Ya ha empezado.' };
  if (id == null) activos(p).forEach((j) => { j.listo = true; }); else { const j = jug(p, id); if (j) j.listo = true; }
  if (activos(p).every((j) => j.listo)) { p.fase = 'jugando'; if (actual(p).fuera) avanzar(p); }
  return { ok: true };
}

const objetivoValido = (p, actor, objetivo) => {
  const o = jug(p, objetivo);
  if (!o || o.fuera || o.id === actor.id) return { error: 'Elige a otro jugador.' };
  if (o.descubierta) return { error: `La regla de ${o.nombre} ya está descubierta.` };
  return { o };
};

export function preguntar(p, id, objetivo, futbolista) {
  if (p.fase !== 'jugando') return { ok: false, error: 'Ahora no.' };
  const a = actual(p);
  if (id !== a.id) return { ok: false, error: `Es el turno de ${a.nombre}.` };
  if (p.paso !== 'preguntar') return { ok: false, error: 'Ya has preguntado: adivina o pasa.' };
  const { o, error } = objetivoValido(p, a, Number(objetivo));
  if (error) return { ok: false, error };
  const f = p.futbolistas.find((x) => norm(x.nombre) === norm(futbolista));
  if (!f) return { ok: false, error: 'No conozco a ese futbolista: elige uno de la lista.' };
  if (o.tablero.some((t) => t.nombre === f.nombre)) return { ok: false, error: `Ya se le preguntó por ${f.nombre}.` };
  const si = regla(o.regla).fn(f);
  o.tablero.push({ nombre: f.nombre, si, por: a.id });
  p.ultimo = { tipo: 'pregunta', de: a.id, a: o.id, futbolista: f.nombre, si };
  p.log.unshift(p.ultimo);
  p.paso = 'decidir';
  return { ok: true, si };
}

export function adivinar(p, id, objetivo, reglaId) {
  if (p.fase !== 'jugando') return { ok: false, error: 'Ahora no.' };
  const a = actual(p);
  if (id !== a.id) return { ok: false, error: `Es el turno de ${a.nombre}.` };
  const { o, error } = objetivoValido(p, a, Number(objetivo));
  if (error) return { ok: false, error };
  if (!o.opciones.includes(reglaId)) return { ok: false, error: 'Regla no válida.' };
  const acierta = o.regla === reglaId;
  if (acierta) { a.puntos += 3; o.descubierta = true; o.descubiertaPor = a.id; } else { a.puntos -= 1; o.fallos.push(reglaId); }
  p.ultimo = { tipo: 'adivina', de: a.id, a: o.id, regla: regla(reglaId).texto, acierta };
  p.log.unshift(p.ultimo);
  avanzar(p);
  return { ok: true, acierta };
}

export function pasar(p, id) {
  if (p.fase !== 'jugando') return { ok: false, error: 'Ahora no.' };
  if (id !== actual(p).id) return { ok: false, error: 'No es tu turno.' };
  if (p.paso !== 'decidir') return { ok: false, error: 'Primero pregunta por un futbolista.' };
  avanzar(p);
  return { ok: true };
}

function avanzar(p) {
  const quedan = activos(p).filter((j) => !j.descubierta);
  // Se acaba si ya solo queda (como mucho) una regla sin descubrir que nadie más pueda investigar
  if (quedan.length === 0 || (quedan.length === 1 && activos(p).length <= 1)) { terminar(p); return; }
  // Siguiente jugador que pueda investigar a alguien (si la única regla oculta es la suya, pasa)
  const puede = (j) => !j.fuera && activos(p).some((o) => o.id !== j.id && !o.descubierta);
  let n = p.turno; let vueltas = 0;
  do {
    n = (n + 1) % p.jugadores.length;
    if (n === 0) p.ronda += 1;
    vueltas += 1;
  } while (!puede(p.jugadores[n]) && vueltas <= p.jugadores.length);
  if (p.ronda > p.rondas || !puede(p.jugadores[n])) { terminar(p); return; }
  p.turno = n; p.paso = 'preguntar';
}

export function terminar(p) {
  activos(p).forEach((j) => { j.bonus = j.descubierta ? 0 : 2; });
  const tabla = [...p.jugadores].map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos + (j.bonus || 0), bonus: j.bonus || 0, regla: regla(j.regla).texto, descubierta: j.descubierta, fuera: j.fuera }))
    .sort((a, b) => b.puntos - a.puntos);
  let puesto = 0; let previo = null;
  tabla.forEach((t, i) => { if (t.puntos !== previo) { puesto = i + 1; previo = t.puntos; } t.puesto = puesto; });
  const max = Math.max(...tabla.filter((t) => !t.fuera).map((t) => t.puntos));
  p.fase = 'fin';
  p.fin = { tabla, max, ganadores: tabla.filter((t) => !t.fuera && t.puntos === max).map((t) => t.id) };
  return { ok: true };
}

export function forzar(p) {
  if (p.fase === 'ver') visto(p, null);
  else if (p.fase === 'jugando') avanzar(p);
  return { ok: true };
}

export function abandonar(p, id) {
  const j = jug(p, id);
  if (!j || p.fase === 'fin') return;
  j.fuera = true;
  if (activos(p).length < 2) { terminar(p); return; }
  if (p.fase === 'ver' && activos(p).every((x) => x.listo)) p.fase = 'jugando';
  if (p.fase === 'jugando' && actual(p).id === id) avanzar(p);
}

export function tick() {}

export function accion(p, id, d) {
  const actor = id ?? (p.fase === 'jugando' ? actual(p).id : null);
  switch (d.tipo) {
    case 'visto': return visto(p, id);
    case 'preguntar': return preguntar(p, actor, d.objetivo, String(d.futbolista ?? '').slice(0, 60));
    case 'adivinar': return adivinar(p, actor, d.objetivo, String(d.regla ?? ''));
    case 'pasar': return pasar(p, actor);
    default: return null;
  }
}

/** En un solo móvil solo es privado ver tu regla al principio; luego se juega a la vista de todos. */
export function turnoLocal(p) {
  return p.fase === 'ver' ? activos(p).find((j) => !j.listo)?.id ?? null : null;
}

export function vistaDe(p, id) {
  const yo = jug(p, id);
  const fin = p.fase === 'fin';
  return {
    fase: p.fase, ronda: Math.min(p.ronda, p.rondas), rondas: p.rondas, turno: p.fase === 'jugando' ? actual(p).id : null, paso: p.paso,
    jugadores: p.jugadores.map((j) => ({
      id: j.id, nombre: j.nombre, puntos: j.puntos, listo: j.listo, fuera: j.fuera, descubierta: j.descubierta, descubiertaPor: j.descubiertaPor,
      tablero: j.tablero, fallos: j.fallos.map((r) => regla(r).texto),
      opciones: j.opciones.map((r) => ({ id: r, texto: regla(r).texto })),
      regla: j.descubierta || fin ? regla(j.regla).texto : null
    })),
    yo: yo ? { id: yo.id, regla: regla(yo.regla).texto, listo: yo.listo } : null,
    ultimo: p.ultimo, log: p.log.slice(0, 6), fin: p.fin
  };
}
