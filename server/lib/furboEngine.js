// server/lib/furboEngine.js
// Motor de Furbo: lógica pura de la partida, compartida por el modo local
// (el cliente guarda el estado y lo reenvía) y por el modo online (las salas
// guardan el estado en el servidor).
//
// Fases (en este orden): vestuario · rebote · quiniela · prorroga · penaltis
//
// Estados de la partida:  'intro' -> 'ronda' -> 'resultado' -> ... -> 'fin'

import { PREGUNTAS } from '../data/seeds/furbo/preguntas.js';

export const FASES = ['vestuario', 'rebote', 'quiniela', 'prorroga', 'penaltis'];

export const DURACIONES = {
  corto: 2,
  normal: 3,
  largo: 5
};

// Tiempo límite (ms) de cada tipo de ronda
const TIEMPO = {
  vestuario: 30000,
  rebote: 25000,
  quiniela: 20000,
  prorroga: 60000,
  penaltis: 20000
};

export const PUNTOS = {
  vestuario: 2,
  reboteExacto: 3,
  reboteDireccion: 1,
  quiniela: 2,
  prorrogaDescriptor: 1,
  prorrogaAdivino: 1,
  prorrogaFalta: -1,
  penaltiCentro: 1,
  penaltiEscuadra: 3
};

// ---------------------------------------------------------------- utilidades
function barajar(arr) {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

function norm(t) {
  return String(t ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function lev(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

/**
 * ¿Dos respuestas de «Vestuario» se refieren a lo mismo?
 * "Fernando Torres" ~ "Torres" ~ "torres" ~ "F. Torres" ~ "Fernando Torre"
 */
export function coincideRespuesta(a, b) {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  if (x === y) return true;

  const tx = x.split(' ');
  const ty = y.split(' ');
  const ux = tx[tx.length - 1];
  const uy = ty[ty.length - 1];

  // Una de las dos es una sola palabra y coincide con la última de la otra
  if (tx.length === 1 && ux.length >= 4 && ux === uy) return true;
  if (ty.length === 1 && uy.length >= 4 && uy === ux) return true;

  // Misma última palabra y la primera es una inicial o es parecida ("F. Torres")
  if (ux.length >= 4 && ux === uy) {
    const px = tx[0];
    const py = ty[0];
    if (px.length === 1 || py.length === 1) {
      if (px[0] === py[0]) return true;
    } else if (lev(px, py) <= 1) {
      return true;
    }
  }

  // Erratas
  const maxL = Math.max(x.length, y.length);
  const d = lev(x, y);
  if (maxL >= 6 && maxL <= 10 && d <= 1) return true;
  if (maxL > 10 && d <= 2) return true;
  if (tx.length === 1 && ty.length === 1 && maxL >= 6 && d <= 1) return true;

  return false;
}

const err = (error) => ({ ok: false, error });
const ok = () => ({ ok: true });

function presentes(p) {
  return p.jugadores.filter((j) => !j.ausente);
}
function jugador(p, id) {
  return p.jugadores.find((j) => j.id === id);
}
function sumar(p, id, n) {
  const j = jugador(p, id);
  if (j) j.puntos = Math.max(0, j.puntos + n);
}
function turnoDe(p, numRonda) {
  const pres = presentes(p);
  return pres[(numRonda - 1) % pres.length];
}
function siguienteDe(p, id) {
  const pres = presentes(p);
  if (pres.length < 2) return null;
  const i = pres.findIndex((j) => j.id === id);
  return pres[(i + 1) % pres.length].id;
}

function elegir(p, clave) {
  const banco = PREGUNTAS[clave];
  p.usados[clave] = p.usados[clave] || [];
  let libres = banco.map((_, i) => i).filter((i) => !p.usados[clave].includes(i));
  if (libres.length === 0) {
    p.usados[clave] = [];
    libres = banco.map((_, i) => i);
  }
  const idx = libres[Math.floor(Math.random() * libres.length)];
  p.usados[clave].push(idx);
  return banco[idx];
}

function fijarTiempo(r, ahora, ms, p = null) {
  // En el modo local (un solo móvil que se pasa de mano en mano) no hay cuenta atrás:
  // el reloj correría mientras el móvil cambia de manos. Solo la Prórroga se cronometra.
  if (p?.local && r.tipo !== 'prorroga') return quitarTiempo(r);
  r.cierraEn = ahora + ms;
  r.totalMs = ms;
}
function quitarTiempo(r) {
  r.cierraEn = null;
  r.totalMs = null;
}

// ----------------------------------------------------------------- creación
function totalDeFase(p, fase) {
  if (!FASES.includes(fase)) return 0;
  const n = presentes(p).length;
  const mult = DURACIONES[p.config.duracion] || DURACIONES.normal;
  return n * mult;
}

function empezarFase(p) {
  p.fase = p.config.fases[p.faseIdx];
  p.estado = 'intro';
  p.rondaNum = 0;
  p.totalRondas = totalDeFase(p, p.fase);
  p.ronda = null;
}

/**
 * @param {{id:number,nombre:string}[]} jugadores
 * @param {{fases?:string[], duracion?:string}} config
 */
export function crearPartida(jugadores, config = {}, { local = false } = {}) {
  let fases = FASES.filter((f) => (config.fases || FASES).includes(f));
  if (fases.length === 0) fases = [...FASES];
  const duracion = DURACIONES[config.duracion] ? config.duracion : 'normal';

  const p = {
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, ausente: false })),
    config: { fases, duracion },
    faseIdx: 0,
    fase: fases[0],
    estado: 'intro',
    rondaNum: 0,
    totalRondas: 0,
    usados: {},
    ronda: null,
    local: Boolean(local)
  };
  empezarFase(p);
  return p;
}

export function marcarAusente(p, id) {
  const j = jugador(p, id);
  if (!j || j.ausente) return;
  j.ausente = true;
  if (presentes(p).length < 2) {
    p.estado = 'fin';
    p.ronda = null;
    return;
  }
  // Si la ronda en curso esperaba a quien se ha ido, se resuelve ya (antes se quedaba esperando al reloj
  // o, en la Prórroga, bloqueada para siempre porque solo el que describe podía empezar).
  if (p.estado !== 'ronda' || !p.ronda) return;
  const r = p.ronda;
  const pres = presentes(p);
  switch (r.tipo) {
    case 'vestuario':
      if (r.etapa === 'respondiendo' && pres.every((x) => r.respuestas[x.id] !== undefined)) revelarVestuario(p);
      break;
    case 'quiniela':
      if (r.etapa === 'respondiendo' && pres.every((x) => r.respuestas[x.id] !== undefined)) revelarQuiniela(p);
      break;
    case 'rebote':
      if (r.etapa === 'j1' && r.activoId === id) revelarRebote(p, { ausente: true });
      else if (r.etapa === 'rebote' && r.reboteId === id) revelarRebote(p, { intento: r.intento, ausente: true });
      break;
    case 'prorroga':
      if (r.describidorId === id) terminarProrroga(p);
      break;
    case 'penaltis':
      if (r.tiradorId === id) {
        r.gol = false;
        r.etapa = 'revelado';
        terminarRonda(p);
      }
      break;
    default:
      break;
  }
}

// ------------------------------------------------------------------- rondas
function iniciarRonda(p, ahora) {
  p.rondaNum += 1;
  p.estado = 'ronda';

  switch (p.fase) {
    case 'vestuario': {
      const pregunta = elegir(p, 'vestuario');
      p.ronda = { tipo: 'vestuario', pregunta, respuestas: {}, etapa: 'respondiendo', resultado: null };
      fijarTiempo(p.ronda, ahora, TIEMPO.vestuario, p);
      break;
    }
    case 'rebote': {
      const [pregunta, correcta, clase] = elegir(p, 'rebote');
      const activoId = turnoDe(p, p.rondaNum).id;
      p.ronda = {
        tipo: 'rebote',
        pregunta,
        correcta,
        esAnio: clase === 'anio',
        activoId,
        reboteId: siguienteDe(p, activoId),
        etapa: 'j1',
        intento: null,
        resultado: null
      };
      fijarTiempo(p.ronda, ahora, TIEMPO.rebote, p);
      break;
    }
    case 'quiniela': {
      const [pregunta, buena, ...malas] = elegir(p, 'quiniela');
      const opciones = barajar([buena, ...malas]);
      p.ronda = {
        tipo: 'quiniela',
        pregunta,
        opciones,
        correcta: opciones.indexOf(buena),
        respuestas: {},
        etapa: 'respondiendo',
        resultado: null
      };
      fijarTiempo(p.ronda, ahora, TIEMPO.quiniela, p);
      break;
    }
    case 'prorroga': {
      p.ronda = {
        tipo: 'prorroga',
        describidorId: turnoDe(p, p.rondaNum).id,
        etapa: 'preparado',
        actual: null,
        aciertos: 0,
        pasadas: 0,
        faltas: 0,
        historial: [],
        resultado: null
      };
      quitarTiempo(p.ronda);
      break;
    }
    case 'penaltis': {
      p.ronda = {
        tipo: 'penaltis',
        tiradorId: turnoDe(p, p.rondaNum).id,
        etapa: 'elegir',
        zona: null,
        pregunta: null,
        opciones: null,
        correcta: null,
        respuesta: null,
        gol: null,
        puntos: 0,
        resultado: null
      };
      fijarTiempo(p.ronda, ahora, TIEMPO.penaltis, p);
      break;
    }
    default:
      break;
  }
}

function terminarRonda(p) {
  quitarTiempo(p.ronda);
  p.estado = 'resultado';
}

// -- Vestuario
function revelarVestuario(p) {
  const r = p.ronda;
  const ids = Object.keys(r.respuestas).map(Number);
  const padre = {};
  ids.forEach((i) => { padre[i] = i; });
  const raiz = (x) => (padre[x] === x ? x : (padre[x] = raiz(padre[x])));
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      if (coincideRespuesta(r.respuestas[ids[i]], r.respuestas[ids[j]])) {
        padre[raiz(ids[i])] = raiz(ids[j]);
      }
    }
  }
  const comp = {};
  ids.forEach((i) => {
    const k = raiz(i);
    (comp[k] = comp[k] || []).push(i);
  });
  const grupos = Object.values(comp);
  const ganadores = grupos.filter((g) => g.length > 1).flat();
  ganadores.forEach((id) => sumar(p, id, PUNTOS.vestuario));
  r.resultado = { grupos, ganadores, puntos: PUNTOS.vestuario };
  r.etapa = 'revelado';
  terminarRonda(p);
}

// -- Rebote
function revelarRebote(p, datos = {}) {
  const r = p.ronda;
  r.resultado = {
    exacto: false,
    direccionAcertada: null,
    ptsActivo: 0,
    ptsRebote: 0,
    ...datos
  };
  r.etapa = 'revelado';
  terminarRonda(p);
}

// -- Quiniela
function revelarQuiniela(p) {
  const r = p.ronda;
  const ganadores = Object.entries(r.respuestas)
    .filter(([, op]) => op === r.correcta)
    .map(([id]) => Number(id));
  ganadores.forEach((id) => sumar(p, id, PUNTOS.quiniela));
  r.resultado = { ganadores, puntos: PUNTOS.quiniela };
  r.etapa = 'revelado';
  terminarRonda(p);
}

// -- Prórroga (palabras prohibidas)
function nuevaPalabra(p) {
  const [objetivo, ...prohibidas] = elegir(p, 'prohibidas');
  return { objetivo, prohibidas };
}
function terminarProrroga(p) {
  const r = p.ronda;
  r.actual = null;
  r.etapa = 'fin';
  r.resultado = { aciertos: r.aciertos, pasadas: r.pasadas, faltas: r.faltas };
  terminarRonda(p);
}

// -- Penaltis
function revelarPenalti(p, gol) {
  const r = p.ronda;
  r.gol = gol;
  r.puntos = gol ? (r.zona === 'escuadra' ? PUNTOS.penaltiEscuadra : PUNTOS.penaltiCentro) : 0;
  if (gol) sumar(p, r.tiradorId, r.puntos);
  r.etapa = 'revelado';
  terminarRonda(p);
}

// ------------------------------------------------------------------- tiempo
function cerrarPorTiempo(p) {
  const r = p.ronda;
  if (!r) return;
  switch (r.tipo) {
    case 'vestuario': return revelarVestuario(p);
    case 'quiniela': return revelarQuiniela(p);
    case 'rebote': return revelarRebote(p, { tiempoAgotado: true });
    case 'prorroga': return terminarProrroga(p);
    case 'penaltis': return revelarPenalti(p, false);
    default: return undefined;
  }
}

/** Resuelve las rondas cuyo tiempo ya ha vencido (el servidor lo llama al consultar). */
export function tick(p, ahora = Date.now()) {
  if (p.estado === 'ronda' && p.ronda && p.ronda.cierraEn && ahora >= p.ronda.cierraEn) {
    cerrarPorTiempo(p);
  }
}

function saltarRonda(p) {
  const r = p.ronda;
  if (!r) return;
  r.saltada = true;
  switch (r.tipo) {
    case 'vestuario':
      r.resultado = { grupos: [], ganadores: [], puntos: PUNTOS.vestuario };
      r.etapa = 'revelado';
      return terminarRonda(p);
    case 'quiniela':
      r.resultado = { ganadores: [], puntos: PUNTOS.quiniela };
      r.etapa = 'revelado';
      return terminarRonda(p);
    case 'rebote':
      return revelarRebote(p, { saltada: true });
    case 'prorroga':
      return terminarProrroga(p);
    case 'penaltis':
      r.gol = false;
      r.etapa = 'revelado';
      return terminarRonda(p);
    default:
      return undefined;
  }
}

// ------------------------------------------------------------------ acciones
/**
 * Aplica una acción al estado (lo modifica). Devuelve { ok } o { ok:false, error }.
 * La acción lleva siempre `jugadorId` (lo fija el servidor en el modo online).
 */
export function aplicar(p, a, ahora = Date.now()) {
  if (!a || typeof a.tipo !== 'string') return err('Acción no válida.');
  if (p.estado === 'fin') return err('La partida ha terminado.');

  tick(p, ahora);

  switch (a.tipo) {
    case 'tiempo': {
      // Modo local: el cliente avisa de que su cuenta atrás ha llegado a 0
      if (p.estado === 'ronda' && p.ronda?.cierraEn && ahora >= p.ronda.cierraEn - 2500) {
        cerrarPorTiempo(p);
      }
      return ok();
    }

    case 'continuar': {
      if (p.estado === 'intro') {
        iniciarRonda(p, ahora);
        return ok();
      }
      if (p.estado === 'resultado') {
        if (p.rondaNum < p.totalRondas) {
          iniciarRonda(p, ahora);
        } else if (p.faseIdx + 1 < p.config.fases.length) {
          p.faseIdx += 1;
          empezarFase(p);
        } else {
          p.estado = 'fin';
          p.ronda = null;
        }
        return ok();
      }
      return err('Ahora no se puede continuar.');
    }

    case 'saltar': {
      if (p.estado !== 'ronda') return err('No hay ronda activa.');
      saltarRonda(p);
      return ok();
    }

    case 'finalizar': {
      p.estado = 'fin';
      p.ronda = null;
      return ok();
    }

    case 'responder':
      return responder(p, a, ahora);

    case 'tirar':
      return tirar(p, a, ahora);

    case 'empezar':
    case 'acertada':
    case 'pasar':
    case 'prohibida':
    case 'terminar':
      return accionProrroga(p, a, ahora);

    default:
      return err('Acción desconocida.');
  }
}

function responder(p, a, ahora) {
  if (p.estado !== 'ronda' || !p.ronda) return err('La ronda ya ha terminado.');
  const r = p.ronda;
  const j = jugador(p, a.jugadorId);
  if (!j || j.ausente) return err('Jugador no válido.');

  switch (r.tipo) {
    case 'vestuario': {
      if (r.etapa !== 'respondiendo') return err('La ronda ya ha terminado.');
      if (r.respuestas[j.id] !== undefined) return err('Ya has respondido.');
      const texto = String(a.texto ?? '').trim().slice(0, 40);
      if (!texto) return err('Escribe una respuesta.');
      r.respuestas[j.id] = texto;
      if (presentes(p).every((x) => r.respuestas[x.id] !== undefined)) revelarVestuario(p);
      return ok();
    }

    case 'quiniela': {
      if (r.etapa !== 'respondiendo') return err('La ronda ya ha terminado.');
      if (r.respuestas[j.id] !== undefined) return err('Ya has respondido.');
      const op = Number(a.opcion);
      if (!Number.isInteger(op) || op < 0 || op > 2) return err('Opción no válida.');
      r.respuestas[j.id] = op;
      if (presentes(p).every((x) => r.respuestas[x.id] !== undefined)) revelarQuiniela(p);
      return ok();
    }

    case 'rebote': {
      if (r.etapa === 'j1') {
        if (j.id !== r.activoId) return err('No es tu turno.');
        const limpio = String(a.numero ?? '').replace(/[^\d]/g, '');
        if (!limpio) return err('Escribe un número.');
        const n = Number(limpio);
        if (n === r.correcta) {
          sumar(p, r.activoId, PUNTOS.reboteExacto);
          revelarRebote(p, { exacto: true, ptsActivo: PUNTOS.reboteExacto, intento: n });
          return ok();
        }
        r.intento = n;
        if (r.reboteId == null || !jugador(p, r.reboteId) || jugador(p, r.reboteId).ausente) {
          revelarRebote(p, { intento: n });
          return ok();
        }
        r.etapa = 'rebote';
        fijarTiempo(r, ahora, TIEMPO.rebote, p);
        return ok();
      }
      if (r.etapa === 'rebote') {
        if (j.id !== r.reboteId) return err('No es tu turno.');
        if (a.direccion !== 'menos' && a.direccion !== 'mas') return err('Dirección no válida.');
        const real = r.correcta < r.intento ? 'menos' : 'mas';
        const acierto = a.direccion === real;
        if (acierto) sumar(p, r.reboteId, PUNTOS.reboteDireccion);
        revelarRebote(p, {
          intento: r.intento,
          direccionAcertada: acierto,
          ptsRebote: acierto ? PUNTOS.reboteDireccion : 0
        });
        return ok();
      }
      return err('La ronda ya ha terminado.');
    }

    case 'penaltis': {
      if (r.etapa !== 'pregunta') return err('Primero hay que elegir dónde tirar.');
      if (j.id !== r.tiradorId) return err('No es tu turno.');
      const op = Number(a.opcion);
      if (!Number.isInteger(op) || op < 0 || op > 3) return err('Opción no válida.');
      r.respuesta = op;
      revelarPenalti(p, op === r.correcta);
      return ok();
    }

    default:
      return err('Esta ronda no admite respuestas.');
  }
}

function tirar(p, a, ahora) {
  if (p.estado !== 'ronda' || !p.ronda || p.ronda.tipo !== 'penaltis') return err('No hay penalti.');
  const r = p.ronda;
  if (r.etapa !== 'elegir') return err('Ya has elegido dónde tirar.');
  if (a.jugadorId !== r.tiradorId) return err('No es tu turno.');
  if (a.zona !== 'centro' && a.zona !== 'escuadra') return err('Zona no válida.');

  const clave = a.zona === 'centro' ? 'penaltisFacil' : 'penaltisDificil';
  const [pregunta, buena, ...malas] = elegir(p, clave);
  const opciones = barajar([buena, ...malas]);
  r.zona = a.zona;
  r.pregunta = pregunta;
  r.opciones = opciones;
  r.correcta = opciones.indexOf(buena);
  r.etapa = 'pregunta';
  fijarTiempo(r, ahora, TIEMPO.penaltis, p);
  return ok();
}

function accionProrroga(p, a, ahora) {
  if (p.estado !== 'ronda' || !p.ronda || p.ronda.tipo !== 'prorroga') return err('No hay turno de descripción.');
  const r = p.ronda;
  if (a.jugadorId !== r.describidorId) return err('Solo quien describe puede hacer esto.');

  if (a.tipo === 'empezar') {
    if (r.etapa !== 'preparado') return err('El turno ya ha empezado.');
    r.etapa = 'jugando';
    r.actual = nuevaPalabra(p);
    fijarTiempo(r, ahora, TIEMPO.prorroga);
    return ok();
  }

  if (r.etapa !== 'jugando') return err('El turno no está en marcha.');

  switch (a.tipo) {
    case 'acertada': {
      sumar(p, r.describidorId, PUNTOS.prorrogaDescriptor);
      const adivino = jugador(p, a.adivinoId);
      if (adivino && !adivino.ausente && adivino.id !== r.describidorId) {
        sumar(p, adivino.id, PUNTOS.prorrogaAdivino);
      }
      r.aciertos += 1;
      r.historial.push({ objetivo: r.actual.objetivo, resultado: 'acierto', adivinoId: adivino ? adivino.id : null });
      r.actual = nuevaPalabra(p);
      return ok();
    }
    case 'pasar': {
      r.pasadas += 1;
      r.historial.push({ objetivo: r.actual.objetivo, resultado: 'pasada' });
      r.actual = nuevaPalabra(p);
      return ok();
    }
    case 'prohibida': {
      sumar(p, r.describidorId, PUNTOS.prorrogaFalta);
      r.faltas += 1;
      r.historial.push({ objetivo: r.actual.objetivo, resultado: 'falta' });
      r.actual = nuevaPalabra(p);
      return ok();
    }
    case 'terminar':
      terminarProrroga(p);
      return ok();
    default:
      return err('Acción desconocida.');
  }
}

// --------------------------------------------------------------------- vista
/**
 * Estado «seguro» para enviar al cliente: oculta respuestas correctas y respuestas
 * de otros jugadores hasta que se revelan.
 * @param viewerId  id del jugador que mira (null en local)
 * @param opts.todo true en modo local (un solo dispositivo)
 */
export function vista(p, viewerId = null, opts = {}, ahora = Date.now()) {
  const r = p.ronda;
  let ronda = null;

  if (r) {
    const rev = r.etapa === 'revelado' || r.etapa === 'fin';
    const base = { tipo: r.tipo, etapa: r.etapa, saltada: Boolean(r.saltada) };

    switch (r.tipo) {
      case 'vestuario':
        ronda = {
          ...base,
          pregunta: r.pregunta,
          respondieron: Object.keys(r.respuestas).map(Number),
          respuestas: rev ? r.respuestas : undefined,
          resultado: rev ? r.resultado : undefined
        };
        break;
      case 'quiniela':
        ronda = {
          ...base,
          pregunta: r.pregunta,
          opciones: r.opciones,
          respondieron: Object.keys(r.respuestas).map(Number),
          miRespuesta: viewerId != null ? r.respuestas[viewerId] : undefined,
          respuestas: rev ? r.respuestas : undefined,
          correcta: rev ? r.correcta : undefined,
          resultado: rev ? r.resultado : undefined
        };
        break;
      case 'rebote':
        ronda = {
          ...base,
          pregunta: r.pregunta,
          esAnio: r.esAnio,
          activoId: r.activoId,
          reboteId: r.reboteId,
          intento: r.intento,
          correcta: rev ? r.correcta : undefined,
          resultado: rev ? r.resultado : undefined
        };
        break;
      case 'prorroga': {
        const veActual = r.actual && (opts.todo || viewerId === r.describidorId);
        ronda = {
          ...base,
          describidorId: r.describidorId,
          aciertos: r.aciertos,
          pasadas: r.pasadas,
          faltas: r.faltas,
          actual: veActual ? r.actual : undefined,
          historial: rev ? r.historial : undefined,
          resultado: rev ? r.resultado : undefined
        };
        break;
      }
      case 'penaltis':
        ronda = {
          ...base,
          tiradorId: r.tiradorId,
          zona: r.zona,
          pregunta: r.pregunta,
          opciones: r.opciones,
          respuesta: rev ? r.respuesta : undefined,
          correcta: rev ? r.correcta : undefined,
          gol: rev ? r.gol : undefined,
          puntos: rev ? r.puntos : undefined
        };
        break;
      default:
        break;
    }

    ronda.restanteMs = r.cierraEn ? Math.max(0, r.cierraEn - ahora) : null;
    ronda.totalMs = r.totalMs || null;
  }

  return {
    estado: p.estado,
    fase: p.fase,
    faseIdx: p.faseIdx,
    fases: p.config.fases,
    duracion: p.config.duracion,
    rondaNum: p.rondaNum,
    totalRondas: p.totalRondas,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, ausente: j.ausente })),
    ronda
  };
}