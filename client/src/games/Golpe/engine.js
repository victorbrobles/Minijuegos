// server/golpe/engine.js
// Motor puro de «El Golpe» (sin red ni React). Lo usa server/routes/golpe.js (salas online). Hay una copia
// idéntica en client/src/games/Golpe/engine.js para los textos y las reglas (npm run sync:golpe en /server).
//
// IDEA: todos participan en el mismo golpe. Cada misión tiene 3 pasos (entrar, dar el golpe y huir) con 4
// opciones cada uno. En secreto, cada opción es SEGURA, PELIGROSA (funciona, pero es una condición peligrosa)
// o IMPOSIBLE (si el plan la usa, fracasa). Cada jugador recibe pistas privadas sobre algunas opciones y un
// OBJETIVO SECRETO (traidor, ambicioso, oportunista, manipulador o infiltrado). Todos proponen un plan, lo
// debaten (pueden mentir sobre sus pistas), votan el mejor (no el suyo) y acusan a quien crean traidor.
// Al final se revela la verdad: se ejecuta el plan más votado y se reparten los puntos.

// ---------------------------------------------------------------- Escenarios
export const ESCENARIOS = [
  {
    id: 'museo', nombre: 'Robar el diamante', e: '💎', lugar: 'el Museo Nacional',
    intro: 'Hay que entrar en el museo, hacerse con el diamante y escapar antes de que llegue la policía.',
    publicas: ['Hay cuatro accesos posibles.', 'El museo tiene seguridad las 24 horas.', 'Solo hay tiempo para tres acciones.'],
    pasos: [
      { nombre: 'Entrada', opciones: ['Puerta principal', 'Puerta trasera', 'Túnel de mantenimiento', 'Tragaluz del tejado'] },
      { nombre: 'El golpe', opciones: ['Cortar la vitrina', 'Desactivar los láseres', 'Sobornar al guardia', 'Cambiarlo por una réplica'] },
      { nombre: 'Huida', opciones: ['Salida principal', 'Furgoneta en el callejón', 'Volver por el túnel', 'Helicóptero desde el tejado'] }
    ]
  },
  {
    id: 'banco', nombre: 'Vaciar la cámara acorazada', e: '🏦', lugar: 'el Banco Central',
    intro: 'Hay que llegar hasta la cámara acorazada del banco, abrirla y salir con el botín.',
    publicas: ['La cámara tiene cierre temporizado.', 'Hay guardias armados en la entrada.', 'Solo hay tiempo para tres acciones.'],
    pasos: [
      { nombre: 'Entrada', opciones: ['Disfrazados de técnicos', 'Por el alcantarillado', 'Ventana del despacho', 'Con un empleado comprado'] },
      { nombre: 'El golpe', opciones: ['Taladrar la cámara', 'Robar el código al director', 'Explosivo controlado', 'Hackear el sistema'] },
      { nombre: 'Huida', opciones: ['Coche por la autopista', 'Metro en hora punta', 'Lancha por el río', 'Dentro de un furgón blindado'] }
    ]
  },
  {
    id: 'prision', nombre: 'Fuga de la prisión', e: '⛓️', lugar: 'la prisión de Alcatraz del Norte',
    intro: 'Hay que sacar a nuestro contacto de la celda, cruzar el recinto y desaparecer.',
    publicas: ['Hay recuento de presos cada noche.', 'Los muros tienen torres de vigilancia.', 'Solo hay tiempo para tres acciones.'],
    pasos: [
      { nombre: 'Salir de la celda', opciones: ['Túnel excavado con una cuchara', 'Llave robada', 'Provocar un disturbio', 'Fingir una enfermedad'] },
      { nombre: 'Cruzar el recinto', opciones: ['Por la lavandería', 'Por los conductos de ventilación', 'Disfrazados de guardias', 'Durante el recuento'] },
      { nombre: 'Huida', opciones: ['Saltar el muro', 'Camión de la basura', 'Barca por el lago', 'Coche de un cómplice'] }
    ]
  },
  {
    id: 'central', nombre: 'Sabotear la central', e: '⚡', lugar: 'la central eléctrica',
    intro: 'Hay que colarse en la central, dejarla fuera de servicio y escapar sin dejar rastro.',
    publicas: ['La central tiene un perímetro vallado.', 'Hay técnicos trabajando por turnos.', 'Solo hay tiempo para tres acciones.'],
    pasos: [
      { nombre: 'Entrada', opciones: ['Saltar la valla', 'Acreditación falsa', 'Por el desagüe', 'Escondidos en un camión de suministros'] },
      { nombre: 'El sabotaje', opciones: ['Virus en el panel de control', 'Cortar los cables', 'Inundar la sala de turbinas', 'Sobrecargar el transformador'] },
      { nombre: 'Huida', opciones: ['En bicicleta por el bosque', 'Lancha por el embalse', 'Furgoneta de reparto', 'Mezclarse con los evacuados'] }
    ]
  }
];

const MOTIVOS = {
  seguro: ['no hay vigilancia', 'está despejado', 'nadie lo controla', 'es la opción más tranquila'],
  peligro: ['salta una alarma silenciosa', 'hay cámaras grabando', 'un guardia patrulla cerca', 'avisa a la policía'],
  imposible: ['está bloqueado', 'es una trampa', 'lo vigilan día y noche', 'está averiado']
};
export const ESTADOS = {
  seguro: { nombre: 'Segura', e: '✅' },
  peligro: { nombre: 'Peligrosa', e: '⚠️' },
  imposible: { nombre: 'Imposible', e: '⛔' }
};

export const OBJETIVOS = {
  traidor: { nombre: 'El traidor', e: '🗡️', desc: 'Conseguir que el golpe fracase (que gane un plan con algo imposible).' },
  ambicioso: { nombre: 'El ambicioso', e: '👑', desc: 'Que tu plan sea el ganador.' },
  oportunista: { nombre: 'El oportunista', e: '🦊', desc: 'Que gane el plan de otro jugador y el golpe salga bien.' },
  manipulador: { nombre: 'El manipulador', e: '🎭', desc: 'Que tres jugadores voten tu plan (si sois 3, los otros dos).' },
  infiltrado: { nombre: 'El infiltrado', e: '🕶️', desc: 'Que gane un plan que incluya una condición peligrosa… y que aun así salga bien.' }
};

export const OPCIONES_MISIONES = [3, 5];
export const PUNTOS = { viable: 3, votado: 2, objetivo: 3, acusar: 2, traidorOculto: 2 };
export const AJUSTES = { min: 3, max: 8, briefingMs: 60000, planMs: 90000, debateMs: 150000, votoMs: 60000, resolucionMs: 60000, chatMax: 160 };

// ---------------------------------------------------------------- Utilidades
const barajar = (arr, rng) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const jug = (est, id) => est.jugadores.find((j) => j.id === id);
const activos = (est) => est.jugadores.filter((j) => !j.fuera);
const ok = (extra = {}) => ({ ok: true, ...extra });
const err = (error) => ({ ok: false, error });
const azar = (arr, rng) => arr[Math.floor(rng() * arr.length)];

export const textoPista = (esc, paso, opcion, estado, motivo) => {
  const nom = ESCENARIOS.find((e) => e.id === esc).pasos[paso].opciones[opcion];
  if (estado === 'seguro') return `«${nom}»: ${motivo}. Es SEGURO.`;
  if (estado === 'peligro') return `«${nom}»: ${motivo}. Funciona, pero es PELIGROSO.`;
  return `«${nom}»: ${motivo}. Es IMPOSIBLE.`;
};

// ---------------------------------------------------------------- Partida
export function crearPartida(jugadores, config = {}, { rng = Math.random, ahora = null } = {}) {
  const misiones = OPCIONES_MISIONES.includes(Number(config.misiones)) ? Number(config.misiones) : 3;
  const est = {
    rng, cfg: { misiones }, mision: 0, fase: 'briefing', limite: null, listos: {},
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, fuera: false })),
    orden: barajar(ESCENARIOS.map((e) => e.id), rng),
    escenario: null, verdad: [], pistas: {}, objetivos: {}, planes: {}, votos: {}, acusaciones: {}, chat: [], nchat: 0,
    resultado: null, historial: [], fin: null
  };
  empezarMision(est, ahora);
  return est;
}

function setFase(est, fase, ahora, ms) { est.fase = fase; est.listos = {}; est.limite = ahora != null && ms ? ahora + ms : null; }

function empezarMision(est, ahora) {
  est.mision += 1;
  const act = activos(est);
  est.escenario = est.orden[(est.mision - 1) % est.orden.length];
  // Verdad: en cada paso hay al menos una opción segura, una peligrosa y una imposible
  est.verdad = [0, 1, 2].map(() => barajar(['seguro', 'peligro', 'imposible', azar(['seguro', 'peligro', 'imposible'], est.rng)], est.rng)
    .map((estado) => ({ estado, motivo: azar(MOTIVOS[estado], est.rng) })));
  // Pistas: 2 por jugador (3 si sois 3), repartidas para cubrir el máximo de opciones
  const porJugador = act.length <= 3 ? 3 : 2;
  let cola = [];
  est.pistas = {};
  act.forEach((j) => {
    const mias = []; let guard = 0;
    while (mias.length < porJugador && guard++ < 100) {
      if (!cola.length) cola = barajar(Array.from({ length: 12 }, (_, k) => k), est.rng);
      const k = cola.shift();
      if (!mias.includes(k)) mias.push(k);
    }
    est.pistas[j.id] = mias.map((k) => ({ paso: Math.floor(k / 4), opcion: k % 4 }));
  });
  // Objetivos: un traidor; el resto, al azar entre los demás
  const traidor = azar(act, est.rng).id;
  const otros = ['ambicioso', 'oportunista', 'manipulador', 'infiltrado'];
  est.objetivos = Object.fromEntries(act.map((j) => [j.id, j.id === traidor ? 'traidor' : azar(otros, est.rng)]));
  est.planes = {}; est.votos = {}; est.acusaciones = {}; est.chat = []; est.resultado = null;
  setFase(est, 'briefing', ahora, AJUSTES.briefingMs);
}

// ---------------------------------------------------------------- Acciones
export function listo(est, id, ahora = null) {
  tick(est, ahora);
  const p = jug(est, id);
  if (!p || p.fuera) return err('No puedes actuar.');
  if (!['briefing', 'debate', 'resolucion'].includes(est.fase)) return err('Ahora no toca.');
  est.listos[id] = true;
  if (activos(est).every((j) => est.listos[j.id])) avanzar(est, ahora);
  return ok();
}

export function enviarPlan(est, id, plan, ahora = null) {
  tick(est, ahora);
  const p = jug(est, id);
  if (est.fase !== 'plan') return err('Ahora no se proponen planes.');
  if (!p || p.fuera) return err('No puedes actuar.');
  if (!Array.isArray(plan) || plan.length !== 3 || plan.some((x) => !Number.isInteger(x) || x < 0 || x > 3)) return err('Elige una opción para cada uno de los tres pasos.');
  est.planes[id] = [...plan];
  if (activos(est).every((j) => est.planes[j.id])) avanzar(est, ahora);
  return ok();
}

export function chat(est, id, texto, ahora = null) {
  tick(est, ahora);
  const p = jug(est, id);
  if (!['plan', 'debate', 'voto'].includes(est.fase)) return err('Ahora no se puede hablar.');
  if (!p || p.fuera) return err('No puedes actuar.');
  const t = String(texto || '').trim().slice(0, AJUSTES.chatMax);
  if (!t) return err('Mensaje vacío.');
  est.chat.push({ n: ++est.nchat, id, texto: t });
  if (est.chat.length > 100) est.chat.shift();
  return ok();
}

export function votar(est, id, { plan, traidor = null } = {}, ahora = null) {
  tick(est, ahora);
  const p = jug(est, id);
  if (est.fase !== 'voto') return err('Ahora no se vota.');
  if (!p || p.fuera) return err('No puedes actuar.');
  const autor = Number(plan);
  if (!est.planes[autor]) return err('Elige un plan.');
  if (autor === id) return err('No puedes votar tu propio plan.');
  if (traidor != null && (!jug(est, Number(traidor)) || Number(traidor) === id)) return err('Acusación no válida.');
  est.votos[id] = autor;
  est.acusaciones[id] = traidor == null ? null : Number(traidor);
  if (activos(est).every((j) => est.votos[j.id] != null || !Object.keys(est.planes).some((a) => Number(a) !== j.id))) avanzar(est, ahora);
  return ok();
}

function avanzar(est, ahora) {
  if (est.fase === 'briefing') setFase(est, 'plan', ahora, AJUSTES.planMs);
  else if (est.fase === 'plan') {
    if (Object.keys(est.planes).length < 2) return resolver(est, ahora);
    setFase(est, 'debate', ahora, AJUSTES.debateMs);
  } else if (est.fase === 'debate') setFase(est, 'voto', ahora, AJUSTES.votoMs);
  else if (est.fase === 'voto') resolver(est, ahora);
  else if (est.fase === 'resolucion') siguiente(est, ahora);
}

// ---------------------------------------------------------------- Resolución
export function evaluarPlan(verdad, plan) {
  const estados = plan.map((op, paso) => verdad[paso][op].estado);
  return { viable: !estados.includes('imposible'), peligroso: estados.includes('peligro'), estados };
}

function resolver(est, ahora) {
  const act = activos(est);
  const autores = Object.keys(est.planes).map(Number).filter((a) => jug(est, a) && !jug(est, a).fuera);
  const recuento = Object.fromEntries(autores.map((a) => [a, 0]));
  Object.values(est.votos).forEach((a) => { if (recuento[a] != null) recuento[a] += 1; });
  const max = Math.max(0, ...Object.values(recuento));
  const empatados = autores.filter((a) => recuento[a] === max);
  const ganador = empatados.length ? azar(empatados, est.rng) : null;
  const evals = Object.fromEntries(autores.map((a) => [a, evaluarPlan(est.verdad, est.planes[a])]));
  const exito = ganador != null && evals[ganador].viable;
  const traidorId = Object.keys(est.objetivos).map(Number).find((k) => est.objetivos[k] === 'traidor');
  const acusanAlTraidor = act.filter((j) => est.acusaciones[j.id] === traidorId).length;
  const descubierto = acusanAlTraidor * 2 >= act.length - 1 && act.length > 1; // la mitad o más de los demás le acusan

  const filas = act.map((j) => {
    const lineas = [];
    const sumar = (n, texto) => lineas.push({ n, texto });
    const ev = evals[j.id];
    if (ev?.viable) sumar(PUNTOS.viable, 'Tu plan era viable');
    if ((recuento[j.id] || 0) > 0) sumar(PUNTOS.votado, `Tu plan recibió ${recuento[j.id]} voto${recuento[j.id] > 1 ? 's' : ''}`);
    const obj = est.objetivos[j.id];
    let cumple = false;
    if (obj === 'traidor') cumple = ganador != null && !exito;
    if (obj === 'ambicioso') cumple = ganador === j.id;
    if (obj === 'oportunista') cumple = ganador != null && ganador !== j.id && exito;
    if (obj === 'manipulador') cumple = (recuento[j.id] || 0) >= Math.min(3, act.length - 1);
    if (obj === 'infiltrado') cumple = ganador != null && evals[ganador].peligroso && exito;
    if (cumple) sumar(PUNTOS.objetivo, `Objetivo secreto cumplido (${OBJETIVOS[obj].nombre})`);
    if (obj !== 'traidor' && est.acusaciones[j.id] === traidorId) sumar(PUNTOS.acusar, 'Acertaste quién era el traidor');
    if (obj === 'traidor' && cumple && !descubierto) sumar(PUNTOS.traidorOculto, 'Saboteaste el golpe sin que te descubrieran');
    const total = lineas.reduce((a, l) => a + l.n, 0);
    j.puntos += total;
    return { id: j.id, objetivo: obj, cumple, lineas, total };
  });

  est.resultado = {
    verdad: est.verdad, planes: est.planes, recuento, ganador, empate: empatados.length > 1, exito,
    evals, traidorId, acusaciones: est.acusaciones, descubierto, filas, objetivos: est.objetivos, pistas: est.pistas
  };
  est.historial.push({ mision: est.mision, escenario: est.escenario, exito, ganador, puntos: Object.fromEntries(filas.map((f) => [f.id, f.total])) });
  setFase(est, 'resolucion', ahora, AJUSTES.resolucionMs);
}

function siguiente(est, ahora) {
  if (est.mision >= est.cfg.misiones || activos(est).length < 2) return terminar(est);
  return empezarMision(est, ahora);
}

function terminar(est) {
  est.fase = 'fin'; est.limite = null;
  const tabla = est.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, fuera: j.fuera }))
    .sort((a, b) => (a.fuera - b.fuera) || (b.puntos - a.puntos));
  const top = tabla.find((t) => !t.fuera);
  est.fin = { tabla, ganadores: top ? tabla.filter((t) => !t.fuera && t.puntos === top.puntos).map((t) => t.id) : [] };
}

// ---------------------------------------------------------------- Reloj y ausencias
export function tick(est, ahora) {
  if (ahora == null || !est.limite || ahora < est.limite || est.fase === 'fin') return;
  avanzar(est, ahora);
}

export function forzar(est, ahora = null) {
  if (est.fase === 'fin') return false;
  avanzar(est, ahora);
  return true;
}

export function abandonar(est, id, ahora = null) {
  const p = jug(est, id);
  if (!p || p.fuera || est.fase === 'fin') return;
  p.fuera = true;
  delete est.listos[id]; delete est.votos[id];
  if (activos(est).length < 2) return terminar(est);
  if (['briefing', 'debate', 'resolucion'].includes(est.fase) && activos(est).every((j) => est.listos[j.id])) avanzar(est, ahora);
  else if (est.fase === 'plan' && activos(est).every((j) => est.planes[j.id])) avanzar(est, ahora);
  else if (est.fase === 'voto' && activos(est).every((j) => est.votos[j.id] != null)) avanzar(est, ahora);
  return undefined;
}

export const faltan = (est) => activos(est).filter((j) => {
  if (est.fase === 'plan') return !est.planes[j.id];
  if (est.fase === 'voto') return est.votos[j.id] == null;
  return !est.listos[j.id];
}).map((j) => j.id);

// ---------------------------------------------------------------- Vista
export function vistaDe(est, id, ahora = null) {
  tick(est, ahora);
  const yo = jug(est, id);
  const revelado = est.fase === 'resolucion' || est.fase === 'fin';
  const planesVisibles = ['debate', 'voto', 'resolucion', 'fin'].includes(est.fase);
  const esc = ESCENARIOS.find((e) => e.id === est.escenario);
  return {
    fase: est.fase, mision: est.mision, misiones: est.cfg.misiones, limite: est.limite, ahora,
    escenario: est.escenario,
    jugadores: est.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, fuera: j.fuera })),
    faltan: est.fase === 'fin' ? [] : faltan(est),
    yo: yo ? {
      id: yo.id,
      objetivo: est.objetivos[id] || null,
      pistas: (est.pistas[id] || []).map((p) => ({ ...p, estado: est.verdad[p.paso][p.opcion].estado, texto: textoPista(esc.id, p.paso, p.opcion, est.verdad[p.paso][p.opcion].estado, est.verdad[p.paso][p.opcion].motivo) })),
      plan: est.planes[id] || null, voto: est.votos[id] ?? null, acusacion: est.acusaciones[id] ?? null, listo: Boolean(est.listos[id])
    } : null,
    planes: planesVisibles ? Object.entries(est.planes).map(([a, plan]) => ({ autorId: Number(a), plan })) : [],
    planListos: est.fase === 'plan' ? Object.keys(est.planes).map(Number) : [],
    chat: est.chat.slice(-60),
    resultado: revelado ? est.resultado : null,
    historial: est.historial,
    fin: est.fin
  };
}
