// server/hipotesis/engine.js
// Motor puro de «La Hipótesis Ganadora» (sin red ni React). Lo usan:
//   - server/routes/hipotesis.js (salas online)
//   - client/src/games/Hipotesis/engine.js (modo un solo dispositivo)  <-- COPIA IDÉNTICA de este archivo
// Si cambias algo aquí:  npm run sync:hipotesis  (en /server)
//
// RITMO (v2): rondas cortas y con sorpresa. Cada ronda trae un EVENTO (puntos dobles, rumor, caza de faroles), un PODER
// NUEVO por jugador («úsalo o se pierde»), hipótesis en un toque, reacciones públicas mientras se apuesta, cuenta atrás
// «apurada» cuando casi todos han terminado y premios cómicos al resolver.
//
// IDEA: congreso de científicos. Cada ronda el laboratorio esconde una «verdad»: varias muestras, cada una de una
// sustancia. Cada jugador conoce con certeza solo 2 muestras. Todos formulan EN SECRETO una hipótesis (que puede ser
// verdadera… o un farol). Se revelan todas a la vez y cada jugador apuesta por las hipótesis ajenas: las respalda
// (cree que son ciertas) o las refuta (cree que son falsas). Se comprueba la verdad y se reparte reputación.

// ---------------------------------------------------------------- Datos
export const SUSTANCIAS = [
  { id: 0, nombre: 'Rubí', color: '#dc2626', icono: 'heart' },
  { id: 1, nombre: 'Zafiro', color: '#2563eb', icono: 'moon' },
  { id: 2, nombre: 'Jade', color: '#16a34a', icono: 'leaf' },
  { id: 3, nombre: 'Ámbar', color: '#d97706', icono: 'star' }
];

// peso: lo que vale una hipótesis (las que se aciertan por azar más a menudo valen menos)
export const FORMAS = {
  tipo: { nombre: 'Es de esta sustancia', peso: 2, desc: 'Una muestra es de una sustancia concreta.' },
  igual: { nombre: 'Son iguales', peso: 2, desc: 'Dos muestras son de la misma sustancia.' },
  distinta: { nombre: 'Son distintas', peso: 1, desc: 'Dos muestras son de sustancias diferentes.' }
};

export const INSTRUMENTOS = {
  lupa: { nombre: 'Lupa', icono: 'search', cuando: 'Al formular', desc: 'Averigua la sustancia exacta de una muestra que no conozcas.' },
  coartada: { nombre: 'Coartada', icono: 'shield', cuando: 'Al formular', desc: 'Si tu hipótesis resulta falsa, no pierdes puntos por quienes la refutaron.' },
  doble: { nombre: 'Apuesta doble', icono: 'scale', cuando: 'Al apostar', desc: 'Duplica lo que ganes o pierdas con una hipótesis concreta.' },
  censura: { nombre: 'Censura', icono: 'eyeoff', cuando: 'Al apostar', desc: 'Anula una hipótesis ajena: nadie puntúa por ella.' },
  detector: { nombre: 'Detector', icono: 'eye', cuando: 'Al apostar', desc: 'Descubre en secreto si la hipótesis de otro jugador es cierta o falsa. Los demás verán que lo has usado.' }
};

// Cada ronda trae un evento. La primera es normal y la última siempre es de puntos dobles (remontadas y suspense).
export const EVENTOS = {
  normal: { nombre: 'Ronda normal', emoji: '🔬', desc: '', mult: 1 },
  doble: { nombre: '¡Puntos dobles!', emoji: '💥', desc: 'Todo lo que se gane o se pierda esta ronda vale el doble.', mult: 2 },
  rumor: { nombre: 'Rumor en el pasillo', emoji: '📣', desc: 'Una muestra se ha filtrado: todos saben qué es. ¡Mentir sobre ella será muy arriesgado!', mult: 1 },
  cazador: { nombre: 'Caza de faroles', emoji: '🎯', desc: 'Cada refutación acertada de una hipótesis falsa da +1 extra.', mult: 1 }
};
export const REACCIONES = ['🤥', '🤔', '👍'];

export const OPCIONES_RONDAS = [3, 5, 7];
export const CONFIG_DEFECTO = { rondas: 5 };
export const AJUSTES = {
  min: 3, max: 8,
  conocidas: 2,           // muestras que conoce con certeza cada jugador (3 si solo hay 3 jugadores)
  bonusGanadora: 2,       // premio a la «hipótesis ganadora» de la ronda
  bonusOjo: 2,            // «ojo clínico»: aciertas todas tus apuestas (mínimo 2)
  hipotesisMs: 45000, apuestasMs: 40000, resolucionMs: 22000,
  apuraMs: 10000          // cuando solo faltan unos pocos, el reloj baja a esto
};

export const numMuestras = (n) => Math.min(9, Math.max(6, n + 2));
export const textoHipotesis = (h) => (h.forma === 'tipo'
  ? `La muestra ${h.i + 1} es de ${SUSTANCIAS[h.t].nombre}`
  : h.forma === 'igual' ? `Las muestras ${h.i + 1} y ${h.j + 1} son de la misma sustancia` : `Las muestras ${h.i + 1} y ${h.j + 1} son de sustancias distintas`);

export function evaluar(h, verdad) {
  if (h.forma === 'tipo') return verdad[h.i] === h.t;
  if (h.forma === 'igual') return verdad[h.i] === verdad[h.j];
  return verdad[h.i] !== verdad[h.j];
}

// ---------------------------------------------------------------- Utilidades
const barajar = (arr, rng) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const jug = (est, id) => est.jugadores.find((j) => j.id === id);
const activos = (est) => est.jugadores.filter((j) => !j.fuera);
const ok = () => ({ ok: true });
const err = (error) => ({ ok: false, error });

// ---------------------------------------------------------------- Crear partida
export function crearPartida(jugadores, config = {}, { rng = Math.random } = {}) {
  const cfg = { ...CONFIG_DEFECTO, ...config };
  const est = {
    rng, cfg, ronda: 0, fase: 'hipotesis', limite: null, listos: {}, apurando: false,
    jugadores: jugadores.map((j) => ({
      id: j.id, nombre: j.nombre, puntos: 0, aciertos: 0, fuera: false,
      instrumento: { tipo: null, usado: false }   // se reparte uno nuevo al empezar cada ronda
    })),
    evento: 'normal', publica: null, detecciones: {}, reacciones: {},
    M: 0, verdad: [], conocimiento: {}, ojeadas: {}, hipotesis: {}, posiciones: {}, usos: {}, enviadas: {},
    resultado: null, historial: [], fin: null
  };
  empezarRonda(est, null);
  return est;
}

function setFase(est, fase, ahora, ms = 0) { est.fase = fase; est.listos = {}; est.apurando = false; est.limite = ahora != null && ms > 0 ? ahora + ms : null; }

function empezarRonda(est, ahora) {
  est.ronda += 1;
  const act = activos(est);
  est.M = numMuestras(act.length);
  est.verdad = Array.from({ length: est.M }, () => Math.floor(est.rng() * SUSTANCIAS.length));
  // cada jugador conoce 2 muestras distintas; se reparten dando vueltas a una baraja para cubrir todas
  est.conocimiento = {}; est.ojeadas = {}; est.hipotesis = {}; est.posiciones = {}; est.usos = {}; est.enviadas = {}; est.resultado = null;
  let cola = [];
  act.forEach((j) => {
    const mias = [];
    while (mias.length < (act.length <= 3 ? AJUSTES.conocidas + 1 : AJUSTES.conocidas)) {
      if (!cola.length) cola = barajar([...Array(est.M).keys()], est.rng);
      const m = cola.shift();
      if (!mias.includes(m)) mias.push(m);
    }
    est.conocimiento[j.id] = mias.sort((a, b) => a - b).map((m) => ({ m, t: est.verdad[m] }));
  });
  est.evento = elegirEvento(est); est.publica = null; est.detecciones = {}; est.reacciones = {};
  if (est.evento === 'rumor') {
    est.publica = Math.floor(est.rng() * est.M);
    act.forEach((j) => {
      if (!est.conocimiento[j.id].some((c) => c.m === est.publica)) est.conocimiento[j.id] = [...est.conocimiento[j.id], { m: est.publica, t: est.verdad[est.publica] }].sort((a, b) => a.m - b.m);
    });
  }
  // poder nuevo cada ronda (distinto del anterior): se usa en esta ronda o se pierde
  const tipos = Object.keys(INSTRUMENTOS);
  act.forEach((j) => {
    const previo = j.instrumento?.tipo;
    const opc = tipos.filter((t) => t !== previo);
    j.instrumento = { tipo: opc[Math.floor(est.rng() * opc.length)], usado: false };
  });
  setFase(est, 'hipotesis', ahora, AJUSTES.hipotesisMs);
}

function elegirEvento(est) {
  if (est.ronda === 1) return 'normal';
  if (est.ronda >= est.cfg.rondas) return 'doble';
  const pool = ['normal', 'rumor', 'cazador', 'doble', 'rumor', 'cazador'];
  return pool[Math.floor(est.rng() * pool.length)];
}

// ---------------------------------------------------------------- Fase 1: formular
export function usarLupa(est, id, m) {
  const p = jug(est, id);
  if (est.fase !== 'hipotesis') return err('Ahora no puedes usar la lupa.');
  if (!p || p.fuera) return err('No puedes actuar.');
  if (p.instrumento.tipo !== 'lupa' || p.instrumento.usado) return err('No tienes la lupa disponible.');
  if (est.enviadas[id]) return err('Ya has enviado tu hipótesis.');
  if (!Number.isInteger(m) || m < 0 || m >= est.M) return err('Muestra no válida.');
  if (est.conocimiento[id].some((c) => c.m === m)) return err('Esa muestra ya la conoces.');
  p.instrumento.usado = true;
  est.ojeadas[id] = [{ m, t: est.verdad[m] }];
  return ok();
}

function validarHipotesis(est, h) {
  if (!h || !FORMAS[h.forma]) return 'Tipo de hipótesis desconocido.';
  const m = (x) => Number.isInteger(x) && x >= 0 && x < est.M;
  if (!m(h.i)) return 'Elige una muestra.';
  if (h.forma === 'tipo') { if (!Number.isInteger(h.t) || h.t < 0 || h.t >= SUSTANCIAS.length) return 'Elige una sustancia.'; }
  else if (!m(h.j) || h.j === h.i) return 'Elige dos muestras distintas.';
  return null;
}

export function enviarHipotesis(est, id, datos, ahora = null) {
  const p = jug(est, id);
  if (est.fase !== 'hipotesis') return err('Ahora no se formulan hipótesis.');
  if (!p || p.fuera) return err('No puedes actuar.');
  if (est.enviadas[id]) return err('Ya has enviado tu hipótesis.');
  const e = validarHipotesis(est, datos);
  if (e) return err(e);
  const h = { forma: datos.forma, i: datos.i, j: datos.forma === 'tipo' ? null : datos.j, t: datos.forma === 'tipo' ? datos.t : null, coartada: false };
  if (datos.coartada) {
    if (p.instrumento.tipo !== 'coartada' || p.instrumento.usado) return err('No tienes la coartada disponible.');
    p.instrumento.usado = true; h.coartada = true;
  }
  est.hipotesis[id] = h; est.enviadas[id] = true;
  reevaluar(est, ahora);
  return ok();
}

// ---------------------------------------------------------------- Fase 2: apostar
export function apostar(est, id, datos, ahora = null) {
  const p = jug(est, id);
  if (est.fase !== 'apuestas') return err('Ahora no se apuesta.');
  if (!p || p.fuera) return err('No puedes actuar.');
  if (est.listos[id]) return err('Ya has enviado tus apuestas.');
  const pos = {};
  Object.entries(datos.posiciones || {}).forEach(([k, v]) => {
    const a = Number(k);
    if (a !== id && est.hipotesis[a] && (v === 'si' || v === 'no')) pos[a] = v;
  });
  if (!Object.keys(pos).length) return err('Posiciónate en al menos una hipótesis ajena (respaldar o refutar).');
  const uso = {};
  if (datos.doble != null) {
    if (p.instrumento.tipo !== 'doble' || p.instrumento.usado) return err('No tienes la apuesta doble disponible.');
    if (!pos[Number(datos.doble)]) return err('Solo puedes duplicar una hipótesis en la que te hayas posicionado.');
    uso.tipo = 'doble'; uso.objetivo = Number(datos.doble);
  }
  if (datos.censura != null) {
    if (p.instrumento.tipo !== 'censura' || p.instrumento.usado) return err('No tienes la censura disponible.');
    const a = Number(datos.censura);
    if (a === id || !est.hipotesis[a]) return err('Elige la hipótesis de otro jugador.');
    uso.tipo = 'censura'; uso.objetivo = a;
  }
  if (uso.tipo) { p.instrumento.usado = true; est.usos[id] = uso; }
  est.posiciones[id] = pos; est.listos[id] = true;
  reevaluar(est, ahora);
  return ok();
}

// Detector: antes de enviar tus apuestas, averigua si una hipótesis ajena es cierta o falsa.
export function detectar(est, id, a) {
  const p = jug(est, id);
  if (est.fase !== 'apuestas') return err('Ahora no puedes usar el detector.');
  if (!p || p.fuera) return err('No puedes actuar.');
  if (p.instrumento.tipo !== 'detector' || p.instrumento.usado) return err('No tienes el detector disponible.');
  if (est.listos[id]) return err('Ya has enviado tus apuestas.');
  if (a === id || !est.hipotesis[a]) return err('Elige la hipótesis de otro jugador.');
  p.instrumento.usado = true;
  est.detecciones[id] = { a, verdadera: evaluar(est.hipotesis[a], est.verdad) };
  est.usos[id] = { tipo: 'detector', objetivo: a };
  return ok();
}

// Reacción pública y anónima (🤥 mentira, 🤔 duda, 👍 confío) sobre una hipótesis ajena. Pulsar de nuevo la quita.
export function reaccionar(est, id, a, emoji) {
  const p = jug(est, id);
  if (est.fase !== 'apuestas') return err('Ahora no se reacciona.');
  if (!p || p.fuera) return err('No puedes actuar.');
  if (!REACCIONES.includes(emoji)) return err('Reacción no válida.');
  if (a === id || !est.hipotesis[a]) return err('Elige la hipótesis de otro jugador.');
  const m = est.reacciones[a] || (est.reacciones[a] = {});
  if (m[id] === emoji) delete m[id]; else m[id] = emoji;
  return ok();
}

// ---------------------------------------------------------------- Resolución
function resolver(est, ahora) {
  const ev = EVENTOS[est.evento] || EVENTOS.normal; const f = ev.mult;
  const dobles = {}; const censurados = new Set();
  Object.entries(est.usos).forEach(([k, u]) => {
    if (u.tipo === 'doble') (dobles[u.objetivo] = dobles[u.objetivo] || []).push(Number(k));
    else if (u.tipo === 'censura') censurados.add(u.objetivo);
  });
  const totales = {}; activos(est).forEach((j) => { totales[j.id] = 0; });
  const votos = {}; const cazas = {};
  const cuenta = (q, acierto) => { const c = votos[q] || (votos[q] = { ok: 0, n: 0 }); c.n += 1; if (acierto) c.ok += 1; };
  const hips = [];
  Object.keys(est.hipotesis).forEach((k) => {
    const a = Number(k); const h = est.hipotesis[a];
    const w = FORMAS[h.forma].peso;
    const verdadera = evaluar(h, est.verdad);
    const anulada = censurados.has(a);
    const respaldos = Object.keys(est.posiciones).map(Number).filter((q) => est.posiciones[q][a] === 'si');
    const refutan = Object.keys(est.posiciones).map(Number).filter((q) => est.posiciones[q][a] === 'no');
    const d = {};
    const sumar = (q, x) => { d[q] = (d[q] || 0) + x * f; };
    const mult = (q) => ((dobles[a] || []).includes(q) ? 2 : 1);
    if (!anulada) {
      if (verdadera) {
        sumar(a, w * (1 + respaldos.length));
        respaldos.forEach((q) => sumar(q, w * mult(q)));
        refutan.forEach((q) => sumar(q, -2 * w * mult(q)));
      } else {
        sumar(a, 2 * w * respaldos.length - (h.coartada ? 0 : 2 * w * refutan.length));
        respaldos.forEach((q) => sumar(q, -2 * w * mult(q)));
        refutan.forEach((q) => sumar(q, 2 * w * mult(q)));
        refutan.forEach((q) => { cazas[q] = (cazas[q] || 0) + 1; if (est.evento === 'cazador') sumar(q, 1); });
      }
      respaldos.forEach((q) => cuenta(q, verdadera));
      refutan.forEach((q) => cuenta(q, !verdadera));
    }
    Object.entries(d).forEach(([q, x]) => { totales[q] = (totales[q] || 0) + x; });
    if (verdadera && !anulada) jug(est, a).aciertos += 1;
    hips.push({ autorId: a, ...h, verdadera, anulada, respaldos, refutan, dobles: dobles[a] || [], deltas: d });
  });
  // hipótesis ganadora: verdadera, no censurada, con más respaldos (mínimo 1)
  const cand = hips.filter((x) => x.verdadera && !x.anulada && x.respaldos.length > 0);
  const maxR = cand.length ? Math.max(...cand.map((x) => x.respaldos.length)) : 0;
  const ganadoras = cand.filter((x) => x.respaldos.length === maxR).map((x) => x.autorId);
  ganadoras.forEach((a) => { totales[a] += AJUSTES.bonusGanadora * f; });
  // ojo clínico: acertar TODAS tus apuestas (mínimo 2) da un extra
  const ojos = Object.keys(votos).map(Number).filter((q) => votos[q].n >= 2 && votos[q].ok === votos[q].n);
  ojos.forEach((q) => { totales[q] += AJUSTES.bonusOjo * f; });
  // premios cómicos de la ronda
  const premios = [];
  const farol = hips.filter((x) => !x.verdadera && !x.anulada && x.respaldos.length > 0).sort((a, b) => b.respaldos.length - a.respaldos.length)[0];
  if (farol) premios.push({ clave: 'farol', id: farol.autorId, n: farol.respaldos.length });
  const caza = Object.entries(cazas).sort((a, b) => b[1] - a[1])[0];
  if (caza) premios.push({ clave: 'caza', id: Number(caza[0]), n: caza[1] });
  ojos.forEach((q) => premios.push({ clave: 'ojo', id: q, n: votos[q].n }));
  const peor = Object.entries(totales).sort((a, b) => a[1] - b[1])[0];
  if (peor && peor[1] < 0) premios.push({ clave: 'pringado', id: Number(peor[0]), n: peor[1] });
  activos(est).forEach((j) => { j.puntos += totales[j.id] || 0; });
  const usosPublicos = Object.entries(est.usos).map(([k, u]) => ({ id: Number(k), ...u }));
  est.resultado = { ronda: est.ronda, verdad: [...est.verdad], hipotesis: hips, totales, ganadoras, usos: usosPublicos, evento: est.evento, premios };
  est.historial.push({ ronda: est.ronda, totales, premios });
  setFase(est, 'resolucion', ahora, AJUSTES.resolucionMs);
}

export function continuar(est, id, ahora = null) {
  const p = jug(est, id);
  if (est.fase !== 'resolucion') return err('Ahora no toca.');
  if (!p || p.fuera) return err('No puedes actuar.');
  est.listos[id] = true;
  reevaluar(est, ahora);
  return ok();
}

function terminar(est) {
  est.fase = 'fin'; est.limite = null;
  const tabla = activos(est).map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos }))
    .sort((a, b) => b.puntos - a.puntos || b.aciertos - a.aciertos);
  const mejor = tabla[0];
  // títulos de la partida: quién ha acumulado más premios de cada tipo
  const cont = {};
  est.historial.forEach((h) => (h.premios || []).forEach((p) => { const c = cont[p.clave] || (cont[p.clave] = {}); c[p.id] = (c[p.id] || 0) + 1; }));
  const titulos = [];
  Object.entries(cont).forEach(([clave, por]) => {
    const orden = tabla.filter((x) => por[x.id]).sort((a, b) => por[b.id] - por[a.id]);
    if (orden.length) titulos.push({ clave, id: orden[0].id, n: por[orden[0].id] });
  });
  est.fin = { tabla, titulos, ganadores: tabla.filter((x) => x.puntos === mejor.puntos && x.aciertos === mejor.aciertos).map((x) => x.id) };
}

// ---------------------------------------------------------------- Reloj y avance
function faltantes(est) {
  const a = activos(est);
  if (est.fase === 'hipotesis') return a.filter((j) => !est.enviadas[j.id]);
  if (est.fase === 'apuestas' || est.fase === 'resolucion') return a.filter((j) => !est.listos[j.id]);
  return [];
}
export const quienFalta = (est) => faltantes(est);

function avanzar(est, ahora) {
  if (est.fase === 'hipotesis') {
    // quien no formuló nada recibe una hipótesis tibia (dos muestras distintas) para no bloquear la partida
    activos(est).forEach((j) => {
      if (est.enviadas[j.id]) return;
      const i = Math.floor(est.rng() * est.M); let k = Math.floor(est.rng() * est.M); if (k === i) k = (i + 1) % est.M;
      est.hipotesis[j.id] = { forma: 'distinta', i, j: k, t: null, coartada: false, auto: true }; est.enviadas[j.id] = true;
    });
    setFase(est, 'apuestas', ahora, AJUSTES.apuestasMs);
  } else if (est.fase === 'apuestas') resolver(est, ahora);
  else if (est.fase === 'resolucion') {
    if (est.ronda >= est.cfg.rondas || activos(est).length < AJUSTES.min - 1) terminar(est);
    else empezarRonda(est, ahora);
  }
}

export function reevaluar(est, ahora = null) {
  if (est.fase === 'fin') return;
  const falt = faltantes(est).length;
  if (falt === 0) { avanzar(est, ahora); return; }
  // cuando solo faltan unos pocos, el reloj se acorta: nadie espera eternamente a los lentos
  if (ahora != null && est.limite && (est.fase === 'hipotesis' || est.fase === 'apuestas')) {
    const n = activos(est).length;
    if (falt <= Math.max(1, Math.floor(n / 3)) && est.limite - ahora > AJUSTES.apuraMs) { est.limite = ahora + AJUSTES.apuraMs; est.apurando = true; }
  }
}
export function tick(est, ahora) {
  if (est.fase === 'fin' || !est.limite || ahora < est.limite) return false;
  avanzar(est, ahora); return true;
}
export function forzar(est, ahora = null) {
  if (est.fase === 'fin') return false;
  avanzar(est, ahora); return true;
}

export function abandonar(est, id, ahora = null) {
  const p = jug(est, id);
  if (!p || p.fuera || est.fase === 'fin') return;
  p.fuera = true;
  delete est.hipotesis[id]; delete est.posiciones[id]; delete est.usos[id]; delete est.enviadas[id]; delete est.listos[id];
  delete est.detecciones[id]; delete est.reacciones[id];
  Object.values(est.reacciones).forEach((m) => { delete m[id]; });
  Object.values(est.posiciones).forEach((m) => { delete m[id]; });
  if (activos(est).length < AJUSTES.min - 1) return terminar(est);
  reevaluar(est, ahora);
}

// ---------------------------------------------------------------- Vista de un jugador
export function vistaDe(est, id) {
  const yo = jug(est, id);
  const fase = est.fase;
  const instr = INSTRUMENTOS[yo.instrumento.tipo];
  const v = {
    fase, ronda: est.ronda, rondas: est.cfg.rondas, M: est.M, limite: est.limite, apurando: est.apurando, evento: { clave: est.evento, ...EVENTOS[est.evento] },
    yo: { id: yo.id, nombre: yo.nombre, puntos: yo.puntos, fuera: yo.fuera, instrumento: { tipo: yo.instrumento.tipo, usado: yo.instrumento.usado, ...instr } },
    jugadores: est.jugadores.map((j) => ({
      id: j.id, nombre: j.nombre, puntos: j.puntos, fuera: j.fuera,
      hecho: fase === 'hipotesis' ? !!est.enviadas[j.id] : (fase === 'apuestas' || fase === 'resolucion') ? !!est.listos[j.id] : null
    })),
    faltan: faltantes(est).map((j) => j.nombre),
    historial: est.historial
  };
  if (fase === 'hipotesis' || fase === 'apuestas') {
    v.conocimiento = [...(est.conocimiento[id] || []).map((c) => (c.m === est.publica ? { ...c, publica: true } : c)), ...(est.ojeadas[id] || []).map((c) => ({ ...c, lupa: true }))].sort((a, b) => a.m - b.m);
    v.miHipotesis = est.hipotesis[id] || null;
  }
  if (fase === 'apuestas') {
    v.hipotesis = Object.keys(est.hipotesis).map(Number).map((a) => {
      const h = est.hipotesis[a];
      const reac = est.reacciones[a] || {}; const reacciones = {};
      Object.values(reac).forEach((e) => { reacciones[e] = (reacciones[e] || 0) + 1; });
      return { autorId: a, nombre: jug(est, a).nombre, forma: h.forma, i: h.i, j: h.j, t: h.t, peso: FORMAS[h.forma].peso, reacciones, miReaccion: reac[id] || null };
    });
    v.detector = est.detecciones[id] || null;
    v.listo = !!est.listos[id];
  }
  if (fase === 'resolucion' || fase === 'fin') {
    v.resultado = est.resultado ? { ...est.resultado, hipotesis: est.resultado.hipotesis.map((h) => ({ ...h, nombre: jug(est, h.autorId).nombre })) } : null;
    v.listo = !!est.listos[id];
  }
  if (fase === 'fin') v.fin = est.fin;
  return v;
}