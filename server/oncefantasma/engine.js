// server/oncefantasma/engine.js
// «El Once Fantasma»: motor puro (sin red). Se copia al cliente con `npm run sync:oncefantasma`.
// Cada ronda hay un once histórico oculto. Todos escriben nombres a la vez: quien acierta un hueco se lo queda
// (más puntos cuantas menos pistas tenía ese hueco) y su acierto destapa una pista de otro compañero.
// Además, el reloj va destapando pistas solo.

export const AJUSTES = { min: 2, max: 12, puntosNivel: [10, 7, 5, 3], segPista: 25, esperaFallo: 1500, bonusOnce: 5 };
export const OPCIONES = { rondas: [1, 2, 3, 5], segundos: [180, 240, 300] };
export const NIVELES = ['Posición y dorsal', 'Club o país', 'Trayectoria', 'Iniciales'];
export const POSICIONES = { POR: 'Portero', DEF: 'Defensa', MED: 'Centrocampista', DEL: 'Delantero' };

const base = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
function lev(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 9;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
  }
  return d[a.length][b.length];
}
/** ¿El texto nombra a este futbolista? Vale el nombre completo, el apellido o el alias; se perdonan erratas pequeñas. */
export function esJugador(texto, j) {
  const t = base(texto).replace(/ /g, '');
  if (t.length < 3) return false;
  const opciones = [j.nombre, ...(j.alias || [])].map((x) => base(x).replace(/ /g, ''));
  return opciones.some((o) => o === t || (o.length >= 8 && lev(o, t) <= 2) || (o.length >= 5 && lev(o, t) <= 1));
}
const iniciales = (n) => n.split(/\s+/).map((p) => `${p[0].toUpperCase()}.`).join(' ');
const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);

/** onces: lista de alineaciones (ya sorteadas). reglas: { rondas, segundos } */
export function crearPartida(jugadores, onces, reglas = {}, ahora = Date.now(), rng = Math.random) {
  const rondas = Math.max(1, Math.min(reglas.rondas || 2, onces.length));
  const p = {
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, aciertos: 0, fuera: false })),
    onces: onces.slice(0, rondas), rondas, segundos: reglas.segundos || 240,
    ronda: 0, fase: 'jugando', hasta: null, proximaPista: null, huecos: [], esperas: {}, ultimos: {}, registro: [], sumas: {}, fin: null
  };
  empezarRonda(p, ahora, rng);
  return p;
}

function empezarRonda(p, ahora, rng = Math.random) {
  p.ronda += 1;
  const o = p.onces[p.ronda - 1];
  p.huecos = o.jugadores.map((j) => ({ ...j, nivel: 0, por: null, puntos: 0 }));
  // Dos huecos empiezan con una pista extra para tener por dónde tirar
  [...p.huecos.keys()].sort(() => rng() - 0.5).slice(0, 2).forEach((i) => { p.huecos[i].nivel = 1; });
  p.fase = 'jugando';
  p.hasta = ahora + p.segundos * 1000;
  p.proximaPista = ahora + AJUSTES.segPista * 1000;
  p.esperas = {};
  p.ultimos = {};
  p.registro = [];
  p.sumas = {};
}

/** Sube un nivel de pista en un hueco oculto (el de menos pistas, al azar entre empatados). */
function destapar(p, rng = Math.random, salvo = -1) {
  const libres = p.huecos.map((h, i) => [h, i]).filter(([h, i]) => !h.por && h.nivel < NIVELES.length - 1 && i !== salvo);
  if (!libres.length) return null;
  const min = Math.min(...libres.map(([h]) => h.nivel));
  const cand = libres.filter(([h]) => h.nivel === min);
  const [h, i] = cand[Math.floor(rng() * cand.length)];
  h.nivel += 1;
  return i;
}

function cerrarRonda(p, motivo) {
  p.fase = 'resultado';
  p.hasta = null;
  p.proximaPista = null;
  const completo = p.huecos.every((h) => h.por);
  p.motivo = completo ? 'completo' : motivo;
  // Bonus a quien más huecos haya descubierto en un once completo
  if (completo) {
    const cuenta = {};
    p.huecos.forEach((h) => { cuenta[h.por] = (cuenta[h.por] || 0) + 1; });
    const max = Math.max(...Object.values(cuenta));
    Object.keys(cuenta).filter((id) => cuenta[id] === max).forEach((id) => {
      const j = p.jugadores.find((x) => String(x.id) === id);
      if (j) { j.puntos += AJUSTES.bonusOnce; p.sumas[j.id] = (p.sumas[j.id] || 0) + AJUSTES.bonusOnce; }
    });
  }
}

/** Un jugador escribe un nombre. */
export function adivinar(p, id, texto, ahora = Date.now(), rng = Math.random) {
  const j = jug(p, id);
  if (!j || j.fuera) return { ok: false, error: 'No estás en la partida.' };
  if (p.fase !== 'jugando') return { ok: false, error: 'La ronda ya ha terminado.' };
  if ((p.esperas[id] || 0) > ahora) return { ok: false, error: 'Espera un momento antes de volver a probar.' };
  const limpio = String(texto || '').trim().slice(0, 40);
  if (!limpio) return { ok: false, error: 'Escribe un nombre.' };
  const i = p.huecos.findIndex((h) => !h.por && esJugador(limpio, h));
  if (i < 0) {
    const ya = p.huecos.find((h) => h.por && esJugador(limpio, h));
    p.esperas[id] = ahora + AJUSTES.esperaFallo;
    const mensaje = ya ? `${ya.nombre} ya estaba descubierto.` : `«${limpio}» no está en este once.`;
    p.ultimos[id] = { acierto: false, mensaje, t: ahora };
    return { ok: true, acierto: false, mensaje };
  }
  const h = p.huecos[i];
  const puntos = AJUSTES.puntosNivel[h.nivel];
  h.por = id;
  h.puntos = puntos;
  j.puntos += puntos;
  j.aciertos += 1;
  p.sumas[id] = (p.sumas[id] || 0) + puntos;
  // El acierto destapa una pista de otro compañero
  const otro = destapar(p, rng, i);
  p.registro.unshift({ id, hueco: i, puntos, pista: otro });
  p.ultimos[id] = { acierto: true, mensaje: `¡${h.nombre}! +${puntos}`, t: ahora };
  if (p.huecos.every((x) => x.por)) cerrarRonda(p, 'completo');
  return { ok: true, acierto: true, hueco: i, puntos, nombre: h.nombre, pista: otro };
}

/** El anfitrión (o el grupo) adelanta una pista. */
export function pista(p, rng = Math.random, ahora = Date.now()) {
  if (p.fase !== 'jugando') return { ok: false, error: 'La ronda ya ha terminado.' };
  const i = destapar(p, rng);
  if (i === null) return { ok: false, error: 'No quedan más pistas.' };
  p.proximaPista = ahora + AJUSTES.segPista * 1000;
  return { ok: true, hueco: i };
}

export function rendirse(p) {
  if (p.fase !== 'jugando') return { ok: false, error: 'La ronda ya ha terminado.' };
  cerrarRonda(p, 'rendicion');
  return { ok: true };
}

export function siguiente(p, ahora = Date.now(), rng = Math.random) {
  if (p.fase !== 'resultado') return { ok: false, error: 'Todavía no ha terminado la ronda.' };
  if (p.ronda >= p.rondas) { terminar(p); return { ok: true }; }
  empezarRonda(p, ahora, rng);
  return { ok: true };
}

export function terminar(p) {
  if (p.fase === 'fin') return { ok: false, error: 'La partida ya ha terminado.' };
  p.fase = 'fin';
  p.hasta = null;
  p.proximaPista = null;
  const tabla = [...p.jugadores].sort((a, b) => b.puntos - a.puntos || b.aciertos - a.aciertos);
  let puesto = 0;
  tabla.forEach((j, k) => { if (k === 0 || j.puntos !== tabla[k - 1].puntos) puesto = k + 1; j.puesto = puesto; });
  const max = Math.max(0, ...activos(p).map((j) => j.puntos));
  p.fin = {
    tabla: tabla.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, puesto: j.puesto, fuera: j.fuera })),
    ganadores: max > 0 ? activos(p).filter((j) => j.puntos === max).map((j) => j.id) : [], max
  };
  return { ok: true };
}

export function tick(p, ahora = Date.now(), rng = Math.random) {
  if (p.fase !== 'jugando') return;
  if (p.hasta && ahora >= p.hasta) { cerrarRonda(p, 'tiempo'); return; }
  while (p.proximaPista && ahora >= p.proximaPista && p.fase === 'jugando') {
    destapar(p, rng);
    p.proximaPista += AJUSTES.segPista * 1000;
  }
}

export function abandonar(p, id) {
  const j = jug(p, id);
  if (!j || j.fuera || p.fase === 'fin') return;
  j.fuera = true;
  if (activos(p).length < 1) terminar(p);
}

/** Lo que ve cada jugador: los huecos ocultos solo enseñan las pistas destapadas. */
export function vistaDe(p, id) {
  const o = p.onces[p.ronda - 1];
  const abierto = p.fase !== 'jugando';
  return {
    fase: p.fase, ronda: p.ronda, rondas: p.rondas, segundos: p.segundos, hasta: p.hasta, proximaPista: p.proximaPista, motivo: p.motivo || null,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, fuera: j.fuera })),
    yo: jug(p, id) ? { id, espera: p.esperas[id] || 0, ultimo: p.ultimos[id] || null } : null,
    once: o ? { equipo: o.equipo, partido: o.partido, entrenador: o.entrenador, tipo: o.tipo } : null,
    huecos: p.huecos.map((h) => {
      const visto = abierto || h.por;
      return {
        pos: h.pos, dorsal: h.dorsal, nivel: visto ? 3 : h.nivel,
        dato: visto || h.nivel >= 1 ? h.dato : null,
        pista: visto || h.nivel >= 2 ? h.pista : null,
        iniciales: visto || h.nivel >= 3 ? iniciales(h.nombre) : null,
        nombre: visto ? h.nombre : null, por: h.por, puntos: h.puntos
      };
    }),
    registro: p.registro.slice(0, 6),
    sumas: p.fase === 'jugando' ? {} : p.sumas,
    fin: p.fin
  };
}
