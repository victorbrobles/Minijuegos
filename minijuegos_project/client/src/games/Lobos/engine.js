// Motor de reglas de «Luna de Sangre». Funciones sin React: el estado es un objeto plano
// que se clona (structuredClone) antes de modificarlo, así la interfaz y las simulaciones comparten reglas.

import { ROLES, estadoInicial } from './roles.js';

export const barajar = (arr, rnd = Math.random) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const pick = (arr, rnd) => arr[Math.floor(rnd() * arr.length)];

/* ───────── Mecánicas globales (todas opcionales) ───────── */
export const MEC_NINGUNA = { eventos: false, objetos: false, rumores: false, modif: false };
export const MEC_TODAS = { eventos: true, objetos: true, rumores: true, modif: true };

export const EVENTOS = {
  sangre:  { nombre: 'Luna de Sangre', icono: 'moon', peso: 1, texto: 'Los lobos están desatados: esta noche atacan a DOS víctimas.' },
  niebla:  { nombre: 'Niebla', icono: 'orb', peso: 2, texto: 'Una niebla espesa cubre la aldea: las visiones del Vidente y del Cartógrafo no son fiables.' },
  eclipse: { nombre: 'Eclipse', icono: 'sun', peso: 2, texto: 'Un eclipse enmudece la plaza: mañana se votará sin debate.' },
  paz:     { nombre: 'Noche de Paz', icono: 'heart', peso: 1, texto: 'Una calma extraña envuelve la aldea: esta noche los lobos no pueden atacar.' }
};
export const OBJETOS = {
  amuleto:   { nombre: 'Amuleto', icono: 'shield', texto: 'Quien lo tenga sobrevivirá a la primera muerte nocturna que sufra (se gasta).' },
  daga:      { nombre: 'Daga', icono: 'target', texto: 'Su dueño puede, una vez, matar a un jugador durante la noche.' },
  pergamino: { nombre: 'Pergamino', icono: 'book', texto: 'Su dueño puede, una vez, conocer el rol exacto de un jugador.' }
};
export const MODIFICADORES = {
  doble:    { nombre: 'Voto doble para los recién llegados', texto: 'Hoy los votos de los dos últimos jugadores de la lista (que sigan vivos) valen doble.' },
  inverso:  { nombre: 'Gana el menos votado', texto: 'Hoy será linchado el MENOS votado (entre los que han recibido algún voto). Si hay empate, nadie.' },
  quorum:   { nombre: 'Quórum', texto: 'Hoy solo hay linchamiento si el más votado reúne al menos un tercio de los votos posibles (de los jugadores vivos).' }
};

/* ───────── Bandos ───────── */
// Camaleón y Agente Doble guardan su bando real en su estado
export const bandoDe = (j) => {
  if (!j || !j.rol || !ROLES[j.rol]) return 'pueblo';
  if (j.rol === 'camaleon' || j.rol === 'agente_doble') return j.estado?.bando || 'pueblo';
  return ROLES[j.rol].bando;
};
export const esLobo = (j) => bandoDe(j) === 'lobos';
// Lo que ve el Vidente
export const bandoVisible = (j) => {
  if (j.rol === 'lobo_sigiloso') return 'pueblo';
  if (j.rol === 'agente_doble') return bandoDe(j) === 'lobos' ? 'pueblo' : 'lobos';
  if (j.rol === 'camaleon' && !j.estado.bando) return 'solitario';
  return bandoDe(j);
};

export const vivos = (e) => e.jugadores.filter((j) => j.vivo);
export const jugador = (e, id) => e.jugadores[id];
export const clonar = (e) => structuredClone(e);

export function crearPartida(nombres, roles, config = {}, rnd = Math.random) {
  const reparto = barajar(roles, rnd);
  const mec = { ...MEC_NINGUNA, ...(config.mec || {}) };
  return {
    config: { votosPublicos: true, ...config, mec },
    jugadores: nombres.map((nombre, id) => {
      const estado = estadoInicial();
      if (reparto[id] === 'agente_doble') estado.bando = rnd() < 0.5 ? 'lobos' : 'pueblo';
      return { id, nombre, rol: reparto[id], rolInicial: reparto[id], vivo: true, estado, avisos: [] };
    }),
    ronda: 1,
    amantes: null,
    flags: { sinAtaque: false, juezArmado: false, ladron: null },
    fichas: {},      // fichas de favor del Banquero por jugador
    cartas: [],      // cartas selladas del Notario
    falsos: {},      // roles falsificados que se mostrarán al morir
    eco: null,       // mensaje de los difuntos para el Eco
    modDia: null,    // modificador de votación de hoy
    noche: null,
    anuncio: null,
    pendientes: [],
    ganador: null,
    victoriasPersonales: []
  };
}

const nuevoAnuncio = () => ({ muertes: [], rebobinada: false, cartas: [], rumor: null, evento: null });

// Rol que se muestra públicamente de un jugador muerto (puede estar falsificado)
export const rolRevelado = (e, id) => e.falsos[id] || e.jugadores[id].rol;

/* ───────────────────────── NOCHE ───────────────────────── */

export function iniciarNoche(e, rnd = Math.random) {
  const s = clonar(e);
  let ids = barajar(vivos(s).map((j) => j.id), rnd);

  if (s.ronda === 1) {
    const c = ids.find((id) => s.jugadores[id].rol === 'cupido');
    if (c != null) ids = [c, ...ids.filter((id) => id !== c)];
  }
  const bruja = ids.find((id) => s.jugadores[id].rol === 'bruja');
  if (bruja != null) {
    const sinBruja = ids.filter((id) => id !== bruja);
    let ultimoLobo = -1;
    sinBruja.forEach((id, i) => { if (esLobo(s.jugadores[id])) ultimoLobo = i; });
    const posicion = ultimoLobo + 1 + Math.floor(rnd() * (sinBruja.length - ultimoLobo));
    sinBruja.splice(Math.min(posicion, sinBruja.length), 0, bruja);
    ids = sinBruja;
  }

  // Evento aleatorio (a partir de la segunda noche)
  let evento = null;
  if (s.config.mec.eventos && s.ronda >= 2 && rnd() < 0.4) {
    const bolsa = Object.entries(EVENTOS).flatMap(([k, v]) => Array(v.peso).fill(k));
    evento = pick(bolsa, rnd);
  }
  s.noche = { orden: ids, idx: 0, acc: {}, victima: undefined, evento };
  s.anuncio = null;
  s.modDia = null;
  return s;
}

export function distanciaAsientos(e, a, b) {
  const n = e.jugadores.length;
  const d = Math.abs(a - b);
  return Math.min(d, n - d);
}

export function victimaFinal(e, rnd = Math.random) {
  const n = e.noche;
  if (n.victima !== undefined) return n.victima;
  if (e.flags.sinAtaque || n.evento === 'paz') { n.victima = null; return null; }
  const cuenta = {};
  vivos(e).filter(esLobo).forEach((l) => {
    const t = n.acc[l.id]?.objetivo;
    if (t != null) cuenta[t] = (cuenta[t] || 0) + 1;
  });
  const max = Math.max(0, ...Object.values(cuenta));
  const top = Object.keys(cuenta).filter((k) => cuenta[k] === max).map(Number);
  n.victima = top.length ? top[Math.floor(rnd() * top.length)] : null;
  return n.victima;
}

export function fijarVictima(e, rnd = Math.random) {
  const s = clonar(e);
  victimaFinal(s, rnd);
  return s;
}

export function registrarAccion(e, id, acc) {
  const s = clonar(e);
  const j = s.jugadores[id];
  s.noche.acc[id] = acc;
  // Acciones de preparación (se aplican al momento y no las anula el Hechicero)
  if (j.rol === 'cupido' && s.ronda === 1 && acc.a != null && acc.b != null) {
    s.amantes = [acc.a, acc.b];
    [[acc.a, acc.b], [acc.b, acc.a]].forEach(([x, y]) => s.jugadores[x].avisos.push({ tipo: 'amor', con: y }));
  }
  if (j.rol === 'parasito' && s.ronda === 1 && acc.objetivo != null) j.estado.huesped = acc.objetivo;
  return s;
}

export function avanzarTurno(e) {
  const s = clonar(e);
  s.noche.idx += 1;
  return s;
}

export function limpiarAvisos(e, id) {
  const s = clonar(e);
  s.jugadores[id].avisos = [];
  if (s.jugadores[id].rol === 'eco') s.eco = null; // ya ha leído el mensaje
  return s;
}

export function dejarMensajeEco(e, texto) {
  const s = clonar(e);
  s.eco = texto.trim() ? texto.trim().slice(0, 200) : null;
  return s;
}

/* ───────────────────────── MUERTES ───────────────────────── */

function matar(s, id, causa) {
  const j = s.jugadores[id];
  if (!j.vivo) return;
  j.vivo = false;
  s.anuncio.muertes.push({ id, rol: s.falsos[id] || j.rol, causa });

  if (j.rol === 'heredero' && s.ronda >= 3 && causa === 'linchamiento') s.victoriasPersonales.push({ id, rol: 'heredero', texto: `${j.nombre} era el Heredero Maldito y ha conseguido que el pueblo lo linche en la ronda ${s.ronda}: ¡ha cumplido su destino!` });
  if (j.rol === 'martir' && causa === 'linchamiento') s.flags.sinAtaque = true;
  if (j.rol === 'cazador') s.pendientes.push(id);

  // Notario: se abren sus cartas selladas
  if (j.rol === 'notario') {
    s.cartas.filter((c) => c.autor === id).forEach((c) => s.anuncio.cartas.push({ ...c, sobreNombre: s.jugadores[c.sobre].nombre }));
  }

  // Parásito: hereda el rol del huésped
  s.jugadores.forEach((p) => {
    if (p.vivo && p.rol === 'parasito' && p.estado.huesped === id) {
      p.rol = j.rol;
      p.estado = structuredClone(j.estado);
      p.avisos.push({ tipo: 'herencia', de: j.nombre, rol: j.rol });
    }
  });

  if (s.amantes && s.amantes.includes(id)) {
    const otro = s.amantes.find((x) => x !== id);
    if (s.jugadores[otro].vivo) matar(s, otro, 'amor');
  }
}

// Muerte nocturna: el Amuleto la evita una vez. Devuelve true si la víctima ha muerto.
function matarNoche(s, id, causa) {
  const j = s.jugadores[id];
  if (!j.vivo) return false;
  if (j.estado.objeto === 'amuleto') { j.estado.objeto = null; return false; }
  matar(s, id, causa);
  return true;
}

export function disparar(e, cazadorId, objetivo) {
  const s = clonar(e);
  s.pendientes = s.pendientes.filter((x) => x !== cazadorId);
  s.anuncio = s.anuncio || nuevoAnuncio();
  if (objetivo != null) matar(s, objetivo, 'cazador');
  return s;
}

/* ───────────────────────── AMANECER ───────────────────────── */

export function generarRumor(s, rnd = Math.random) {
  const v = vivos(s).map((j) => j.id);
  if (v.length < 3) return null;
  const verdad = rnd() < 0.5;
  if (rnd() < 0.5) {
    const activos = v.filter((id) => s.noche.acc[id]);
    const pasivos = v.filter((id) => !s.noche.acc[id]);
    const pool = verdad ? activos : pasivos;
    if (pool.length) return { texto: `Alguien vio luz en casa de ${s.jugadores[pick(pool, rnd)].nombre} durante la noche.`, verdad };
  }
  const pares = [];
  for (let i = 0; i < v.length; i++) for (let k = i + 1; k < v.length; k++) pares.push([v[i], v[k]]);
  const mismo = (p) => bandoDe(s.jugadores[p[0]]) === bandoDe(s.jugadores[p[1]]);
  let pool = pares.filter((p) => mismo(p) === verdad);
  if (!pool.length) pool = pares;
  const [a, b] = pick(pool, rnd);
  return { texto: `${s.jugadores[a].nombre} y ${s.jugadores[b].nombre} fueron vistos hablando en voz baja.`, verdad };
}

export const PROB_CONTAGIO = 0.5;

export function resolverNoche(e, rnd = Math.random) {
  const s = clonar(e);
  s.anuncio = nuevoAnuncio();
  s.anuncio.evento = s.noche.evento;
  const acc = s.noche.acc;
  const vivosNoche = vivos(s);
  const quien = (rol) => vivosNoche.find((j) => j.rol === rol && acc[j.id]);

  const hechicero = quien('hechicero');
  const rebobina = hechicero && acc[hechicero.id].rebobinar && !hechicero.estado.hechizoUsado;
  s.flags.ladron = null;

  if (rebobina) {
    hechicero.estado.hechizoUsado = true;
    s.anuncio.rebobinada = true;
    s.flags.sinAtaque = false;
    return s;
  }

  /* 1) Preparativos sin muertes */
  const protector = quien('protector');
  const protegido = protector ? acc[protector.id].objetivo : null;
  if (protector) s.jugadores[protector.id].estado.ultimoProtegido = protegido;

  const banquero = quien('banquero');
  if (banquero && banquero.estado.fichasBanquero > 0 && acc[banquero.id].objetivo != null) {
    const t = acc[banquero.id].objetivo;
    s.jugadores[banquero.id].estado.fichasBanquero -= 1;
    s.fichas[t] = (s.fichas[t] || 0) + 1;
    s.jugadores[t].avisos.push({ tipo: 'ficha' });
  }
  const notario = quien('notario');
  if (notario && notario.estado.notarioCartas < 3 && acc[notario.id].sobre != null) {
    s.jugadores[notario.id].estado.notarioCartas += 1;
    s.cartas.push({ autor: notario.id, sobre: acc[notario.id].sobre, veredicto: acc[notario.id].veredicto });
  }
  const falsificador = vivosNoche.find((j) => j.rol === 'falsificador' && acc[j.id]?.falsificar && !j.estado.falsificacionUsada);
  if (falsificador) {
    s.jugadores[falsificador.id].estado.falsificacionUsada = true;
    s.falsos[acc[falsificador.id].falsificar.objetivo] = acc[falsificador.id].falsificar.rol;
  }
  const contagiado = quien('contagiado');
  if (contagiado) {
    const t = acc[contagiado.id].objetivo;
    if (t != null && s.jugadores[t].vivo && !s.jugadores[t].estado.contagiado && rnd() < PROB_CONTAGIO) {
      s.jugadores[t].estado.contagiado = true;
      s.jugadores[t].avisos.push({ tipo: 'contagio' });
    }
  }
  // Objetos de un solo uso
  const dagas = [];
  vivosNoche.forEach((j) => {
    const o = acc[j.id]?.objeto;
    if (!o || j.estado.objeto !== o.tipo) return;
    if (o.tipo === 'pergamino') j.estado.objeto = null;
    if (o.tipo === 'daga' && o.objetivo != null) { dagas.push(o.objetivo); j.estado.objeto = null; }
  });

  /* 2) Ataque de la manada */
  const victima = victimaFinal(s, rnd);
  const alfa = vivosNoche.find((j) => j.rol === 'lobo_alfa' && acc[j.id]?.infectar && !j.estado.infeccionUsada);
  if (alfa) s.jugadores[alfa.id].estado.infeccionUsada = true;

  const bruja = quien('bruja');
  const salvar = !!(bruja && acc[bruja.id].salvar && bruja.estado.pocionVida);
  const veneno = bruja && acc[bruja.id].veneno != null && bruja.estado.pocionVeneno ? acc[bruja.id].veneno : null;
  if (salvar) s.jugadores[bruja.id].estado.pocionVida = false;
  if (veneno != null) s.jugadores[bruja.id].estado.pocionVeneno = false;

  const viuda = quien('viuda');
  const marca = viuda ? acc[viuda.id].objetivo : null;
  const ataque = (id, puedeSalvarBruja, puedeInfectar) => {
    if (id == null || !s.jugadores[id].vivo) return;
    const salvada = protegido === id || (puedeSalvarBruja && salvar);
    if (salvada) return;
    if (puedeInfectar && alfa) {
      s.jugadores[id].rol = 'lobo';
      s.jugadores[id].avisos.push({ tipo: 'infectado' });
      return;
    }
    const murio = matarNoche(s, id, 'lobos');
    // Viuda Negra: si los lobos matan a su marca, cae ella y arrastra a un lobo
    if (murio && viuda && s.jugadores[viuda.id].vivo && marca === id) {
      matar(s, viuda.id, 'viuda');
      const lobos = vivos(s).filter(esLobo);
      if (lobos.length) matar(s, pick(lobos, rnd).id, 'viuda');
    }
  };
  ataque(victima, true, true);
  // Luna de Sangre: segunda víctima
  if (s.noche.evento === 'sangre' && victima != null) {
    const candidatos = vivos(s).filter((j) => !esLobo(j) && j.id !== victima).map((j) => j.id);
    if (candidatos.length) ataque(pick(candidatos, rnd), false, false);
  }

  /* 3) Veneno, dagas y fuego */
  if (veneno != null) matarNoche(s, veneno, 'veneno');
  dagas.forEach((t) => matarNoche(s, t, 'daga'));

  const piro = quien('piromano');
  if (piro) {
    const a = acc[piro.id];
    const est = s.jugadores[piro.id].estado;
    if (a.incendiar && !est.incendioUsado) {
      est.incendioUsado = true;
      est.rociados.filter((id) => s.jugadores[id].vivo).forEach((id) => matar(s, id, 'fuego'));
    } else if (a.rociar != null && !est.rociados.includes(a.rociar)) {
      est.rociados.push(a.rociar);
    }
  }

  /* 4) Preparan el día siguiente */
  const juez = quien('juez');
  if (juez && acc[juez.id].armar && !juez.estado.juezUsado) s.flags.juezArmado = true;
  const ladron = quien('ladron');
  if (ladron && acc[ladron.id].objetivo != null) s.flags.ladron = { ladron: ladron.id, objetivo: acc[ladron.id].objetivo };

  s.flags.sinAtaque = false;
  if (s.config.mec.rumores) s.anuncio.rumor = generarRumor(s, rnd);
  return s;
}

/* ───────────────────────── VOTACIÓN ───────────────────────── */

export function generarModDia(e, rnd = Math.random) {
  if (!e.config.mec.modif || e.ronda < 2 || rnd() >= 0.5) return null;
  return pick(Object.keys(MODIFICADORES), rnd);
}

// votos: { idVotante: idCandidato | null }
export function contarVotos(e, votos, modif = null) {
  const vivosIds = vivos(e).map((j) => j.id);
  const conteo = {};
  vivosIds.forEach((id) => { conteo[id] = 0; });
  const dobles = modif === 'doble' ? vivosIds.slice(-2) : [];
  Object.entries(votos).forEach(([votante, c]) => {
    if (c != null && conteo[c] != null) conteo[c] += dobles.includes(Number(votante)) ? 2 : 1;
  });
  let candidatos = Object.keys(conteo).map(Number);
  let max;
  if (modif === 'inverso') {
    const con = candidatos.filter((k) => conteo[k] > 0);
    max = con.length ? Math.min(...con.map((k) => conteo[k])) : 0;
    candidatos = con.filter((k) => conteo[k] === max);
  } else {
    max = Math.max(0, ...Object.values(conteo));
    candidatos = candidatos.filter((k) => conteo[k] === max);
  }
  let victima = max > 0 && candidatos.length === 1 ? candidatos[0] : null;
  if (modif === 'quorum' && victima != null && conteo[victima] * 3 < vivosIds.length) victima = null;
  return { conteo, max, empatados: candidatos, victima, modif };
}

// Camaleón: se une al bando contrario al de su primer acusador
export function convertirCamaleon(e, votos, rnd = Math.random) {
  const camaleon = e.jugadores.find((j) => j.vivo && j.rol === 'camaleon' && !j.estado.bando);
  if (!camaleon) return e;
  const acusadores = Object.keys(votos).map(Number).filter((v) => votos[v] === camaleon.id && v !== camaleon.id);
  if (!acusadores.length) return e;
  const s = clonar(e);
  const ac = s.jugadores[pick(acusadores, rnd)];
  const nuevo = bandoDe(ac) === 'pueblo' ? 'lobos' : 'pueblo';
  s.jugadores[camaleon.id].estado.bando = nuevo;
  s.jugadores[camaleon.id].avisos.push({ tipo: 'camaleon', acusador: ac.nombre, bandoAcusador: bandoDe(ac), nuevo });
  return s;
}

// Banquero: la ficha de favor anula el linchamiento
export function aplicarFicha(e, victima) {
  if (victima == null || !(e.fichas[victima] > 0)) return { e, usada: false };
  const s = clonar(e);
  s.fichas[victima] -= 1;
  return { e: s, usada: true };
}

export function juezActivo(e) {
  return e.flags.juezArmado && e.jugadores.some((j) => j.vivo && j.rol === 'juez');
}

export function aplicarVotacion(e, victima, { juezMuere = false } = {}) {
  const s = clonar(e);
  s.anuncio = nuevoAnuncio();
  if (victima != null) matar(s, victima, 'linchamiento');
  if (juezMuere) {
    const juez = s.jugadores.find((j) => j.vivo && j.rol === 'juez');
    if (juez) matar(s, juez.id, 'juez');
  }
  return s;
}

export function gastarJuez(e) {
  const s = clonar(e);
  s.flags.juezArmado = false;
  const juez = s.jugadores.find((j) => j.vivo && j.rol === 'juez');
  if (juez) juez.estado.juezUsado = true;
  return s;
}

export function siguienteRonda(e) {
  const s = clonar(e);
  s.ronda += 1;
  s.anuncio = null;
  s.noche = null;
  return s;
}

/* ───────────────────────── OBJETOS ───────────────────────── */

export function sortearObjeto(e, rnd = Math.random) {
  if (!e.config.mec.objetos || e.ronda < 2 || rnd() >= 0.4) return null;
  if (!vivos(e).some((j) => !j.estado.objeto)) return null;
  return pick(Object.keys(OBJETOS), rnd);
}

export function reclamarObjeto(e, id, tipo) {
  const s = clonar(e);
  s.jugadores[id].estado.objeto = tipo;
  return s;
}

/* ───────────────────────── VICTORIA ───────────────────────── */

export function comprobarVictoria(e) {
  const v = vivos(e);
  if (v.length === 0) return { bando: 'nadie', ids: [], texto: 'Todos han muerto. Esta vez no gana nadie.' };

  if (e.amantes && v.length === 2 && v.every((j) => e.amantes.includes(j.id)) && bandoDe(v[0]) !== bandoDe(v[1])) {
    return { bando: 'amantes', ids: v.map((j) => j.id), texto: 'El amor lo ha vencido todo: los enamorados de bandos opuestos han sobrevivido juntos.' };
  }
  const enfermos = v.filter((j) => j.estado.contagiado || j.rolInicial === 'contagiado');
  if (e.jugadores.some((j) => j.rolInicial === 'contagiado') && enfermos.length * 2 > v.length) {
    return { bando: 'epidemia', ids: enfermos.map((j) => j.id), texto: 'Más de la mitad de la aldea está contagiada: ¡la epidemia ha vencido a todos!' };
  }
  const lobos = v.filter(esLobo);
  const piro = v.find((j) => j.rol === 'piromano');

  if (piro && (v.length === 1 || (lobos.length === 0 && v.length <= 2))) {
    return { bando: 'solitario', ids: [piro.id], texto: `${piro.nombre} era el Pirómano y ha dejado el pueblo en cenizas.` };
  }
  if (lobos.length > 0 && lobos.length >= v.length - lobos.length) {
    return { bando: 'lobos', ids: lobos.map((j) => j.id), texto: 'Los lobos igualan en número al pueblo: ¡la aldea ha caído!' };
  }
  if (lobos.length === 0 && !piro) {
    return { bando: 'pueblo', ids: v.filter((j) => bandoDe(j) === 'pueblo').map((j) => j.id), texto: 'Los lobos han sido exterminados: ¡el pueblo sobrevive!' };
  }
  return null;
}

/* ───────────────────────── CONSULTAS ───────────────────────── */

export const TEXTO_CAUSA = {
  lobos: 'devorado por los lobos',
  veneno: 'envenenado',
  fuego: 'quemado por el fuego',
  daga: 'apuñalado',
  viuda: 'arrastrado por la Viuda Negra',
  amor: 'murió de pena por su enamorado',
  cazador: 'abatido por el Cazador',
  linchamiento: 'linchado por el pueblo',
  juez: 'condenado por su propio veredicto'
};
// Causas que se revelan públicamente (las demás, no delatan al asesino)
export const CAUSAS_PUBLICAS = ['linchamiento', 'amor', 'cazador', 'juez'];

export function guiaNoche(e, id) {
  const j = e.jugadores[id];
  const r = ROLES[j.rol];
  let texto = r.guiaNoche(j.estado, e.ronda);
  if (j.rol === 'juez' && e.flags.juezArmado) texto = 'Tu veredicto ya está armado para el próximo juicio. No tienes nada más que hacer.';
  if (esLobo(j) && ['agente_doble', 'camaleon'].includes(j.rol)) texto = 'Eres del bando de los lobos: mira a tu manada y elige a la víctima de esta noche.';
  if (e.noche?.evento) texto += ` (Evento de esta noche: ${EVENTOS[e.noche.evento].nombre}.)`;
  return texto;
}
