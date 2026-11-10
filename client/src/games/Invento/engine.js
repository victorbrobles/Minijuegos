// server/invento/engine.js
// Motor puro de «El Invento del Siglo». Lo usan las salas online (server/routes/invento.js) y, copiado al cliente con
// `npm run sync:invento`, el modo «un solo dispositivo».
//
// Cada ronda, cada jugador recibe tres cartas: un OBJETO, un PROBLEMA y una CARACTERÍSTICA absurda (puede cambiar
// una de ellas). Inventa un producto que combine las tres: nombre y descripción. Después se enseñan todos sin autor y
// cada uno vota en tres categorías (no a sí mismo): el que compraría, el más absurdo y el que triunfará.
// Cada voto da 1 punto; ganar una categoría, 2 más.

export const AJUSTES = { min: 3, max: 12, cambiosPorRonda: 1, bonusCategoria: 2, maxNombre: 50, maxDesc: 280 };
export const OPCIONES = { rondas: [2, 3, 4, 5], segundos: [120, 180, 300] };
export const CATEGORIAS = {
  compraria: { nombre: 'Lo compraría', e: '🛒' },
  absurdo: { nombre: 'El más absurdo', e: '🤪' },
  exito: { nombre: 'Triunfará', e: '🚀' }
};
const TIPOS = ['objeto', 'problema', 'rasgo'];

const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);
const barajar = (a, rng) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const k = Math.floor(rng() * (i + 1)); [b[i], b[k]] = [b[k], b[i]]; } return b; };

/** mazos: { objeto: [...], problema: [...], rasgo: [...] } · reglas: { rondas, segundos } */
export function crearPartida(jugadores, mazos, reglas = {}, ahora = Date.now(), rng = Math.random) {
  const p = {
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, titulos: { compraria: 0, absurdo: 0, exito: 0 }, fuera: false })),
    mazos: { objeto: barajar(mazos.objeto, rng), problema: barajar(mazos.problema, rng), rasgo: barajar(mazos.rasgo, rng) },
    cursor: { objeto: 0, problema: 0, rasgo: 0 },
    rondas: OPCIONES.rondas.includes(Number(reglas.rondas)) ? Number(reglas.rondas) : 3,
    segundos: OPCIONES.segundos.includes(Number(reglas.segundos)) ? Number(reglas.segundos) : 180,
    ronda: 0, fase: 'inventar', hasta: null, cartas: {}, cambios: {}, inventos: {}, orden: [], votos: {}, resultado: null, historial: [], fin: null
  };
  Object.defineProperty(p, 'rng', { value: rng, enumerable: false, writable: true });
  empezarRonda(p, ahora);
  return p;
}
const azar = (p) => (typeof p.rng === 'function' ? p.rng() : Math.random());
function robar(p, tipo) {
  const m = p.mazos[tipo];
  const c = m[p.cursor[tipo] % m.length];
  p.cursor[tipo] += 1;
  return c;
}

function empezarRonda(p, ahora) {
  p.ronda += 1;
  p.fase = 'inventar';
  p.hasta = ahora + p.segundos * 1000;
  p.cartas = {}; p.cambios = {}; p.inventos = {}; p.votos = {}; p.resultado = null; p.orden = [];
  activos(p).forEach((j) => { p.cartas[j.id] = { objeto: robar(p, 'objeto'), problema: robar(p, 'problema'), rasgo: robar(p, 'rasgo') }; p.cambios[j.id] = 0; });
}

export function cambiarCarta(p, id, tipo) {
  if (p.fase !== 'inventar') return { ok: false, error: 'Ahora no se cambian cartas.' };
  if (!p.cartas[id]) return { ok: false, error: 'No juegas esta ronda.' };
  if (!TIPOS.includes(tipo)) return { ok: false, error: 'Elige qué carta cambias.' };
  if (p.inventos[id]) return { ok: false, error: 'Ya has presentado tu invento.' };
  if (p.cambios[id] >= AJUSTES.cambiosPorRonda) return { ok: false, error: 'Ya has cambiado una carta esta ronda.' };
  p.cambios[id] += 1;
  p.cartas[id][tipo] = robar(p, tipo);
  return { ok: true };
}

/** Presentar (o corregir, mientras dure el tiempo) el invento. */
export function inventar(p, id, nombre, desc, ahora = Date.now()) {
  if (p.fase !== 'inventar') return { ok: false, error: 'Ya no se puede inventar.' };
  if (!p.cartas[id]) return { ok: false, error: 'No juegas esta ronda.' };
  const n = String(nombre ?? '').trim().slice(0, AJUSTES.maxNombre);
  const d = String(desc ?? '').trim().slice(0, AJUSTES.maxDesc);
  if (!n) return { ok: false, error: 'Ponle nombre a tu invento.' };
  if (d.length < 10) return { ok: false, error: 'Explica un poco cómo funciona.' };
  p.inventos[id] = { nombre: n, desc: d };
  if (activos(p).every((j) => p.inventos[j.id])) aVotar(p, ahora);
  return { ok: true };
}

/** Quiere seguir editando (solo mientras no hayan terminado todos). */
export function retirar(p, id) {
  if (p.fase !== 'inventar' || !p.inventos[id]) return { ok: false, error: 'Ahora no.' };
  delete p.inventos[id];
  return { ok: true };
}

function aVotar(p) {
  const autores = Object.keys(p.inventos).map(Number).filter((id) => jug(p, id) && !jug(p, id).fuera);
  p.hasta = null;
  if (autores.length < 2) { cerrarRonda(p); return; }
  p.orden = barajar(autores, () => azar(p));
  p.fase = 'votar';
}

/** votos: { compraria: 'A', absurdo: 'C', exito: 'B' } — por letra, para que nadie sepa de quién es cada invento. */
export function votar(p, id, votos) {
  if (p.fase !== 'votar') return { ok: false, error: 'Ahora no se vota.' };
  const j = jug(p, id);
  if (!j || j.fuera) return { ok: false, error: 'No votas en esta partida.' };
  const v = {};
  for (const c of Object.keys(CATEGORIAS)) {
    const k = String(votos?.[c] ?? '').toUpperCase().charCodeAt(0) - 65;
    const a = p.orden[k];
    if (a == null) return { ok: false, error: `Elige un invento para «${CATEGORIAS[c].nombre}».` };
    if (a === id) return { ok: false, error: 'No puedes votarte a ti mismo.' };
    v[c] = a;
  }
  p.votos[id] = v;
  if (activos(p).every((x) => p.votos[x.id])) cerrarRonda(p);
  return { ok: true };
}

function cerrarRonda(p) {
  const recuento = {};
  p.orden.forEach((a) => { recuento[a] = { compraria: 0, absurdo: 0, exito: 0, puntos: 0 }; });
  Object.values(p.votos).forEach((v) => Object.entries(v).forEach(([c, a]) => { if (recuento[a]) { recuento[a][c] += 1; recuento[a].puntos += 1; } }));
  const ganadores = {};
  Object.keys(CATEGORIAS).forEach((c) => {
    const max = Math.max(0, ...Object.values(recuento).map((r) => r[c]));
    ganadores[c] = max > 0 ? Object.keys(recuento).map(Number).filter((a) => recuento[a][c] === max) : [];
    ganadores[c].forEach((a) => { recuento[a].puntos += AJUSTES.bonusCategoria; jug(p, a).titulos[c] += 1; });
  });
  Object.entries(recuento).forEach(([a, r]) => { jug(p, Number(a)).puntos += r.puntos; });
  p.resultado = { recuento, ganadores };
  p.historial.push({
    ronda: p.ronda,
    inventos: p.orden.map((a) => ({ autor: a, ...p.inventos[a], cartas: p.cartas[a], puntos: recuento[a].puntos }))
  });
  p.fase = 'resultados';
  p.hasta = null;
}

export function siguiente(p, ahora = Date.now()) {
  if (p.fase !== 'resultados') return { ok: false, error: 'Ahora no.' };
  if (p.ronda >= p.rondas) { finalizar(p); return { ok: true }; }
  empezarRonda(p, ahora);
  return { ok: true };
}

function finalizar(p) {
  p.fase = 'fin';
  const orden = [...p.jugadores].sort((a, b) => (a.fuera - b.fuera) || (b.puntos - a.puntos));
  const max = Math.max(0, ...activos(p).map((j) => j.puntos));
  let puesto = 0; let previo = null;
  const tabla = orden.map((j, i) => { if (j.puntos !== previo) { puesto = i + 1; previo = j.puntos; } return { id: j.id, nombre: j.nombre, puntos: j.puntos, titulos: { ...j.titulos }, fuera: j.fuera, puesto }; });
  // El mejor invento de la partida (más puntos en una ronda)
  const todos = p.historial.flatMap((h) => h.inventos);
  const mejor = todos.sort((a, b) => b.puntos - a.puntos)[0] || null;
  p.fin = { tabla, ganadores: max > 0 ? activos(p).filter((j) => j.puntos === max).map((j) => j.id) : [], max, mejor };
}

export function terminar(p) {
  if (p.fase === 'fin') return { ok: false, error: 'La partida ya ha terminado.' };
  finalizar(p);
  return { ok: true };
}

/** Se acaba el tiempo de inventar: votan los que han presentado algo. */
export function tick(p, ahora = Date.now()) {
  if (p.fase !== 'inventar' || !p.hasta || ahora < p.hasta) return false;
  aVotar(p, ahora);
  return true;
}

/** El anfitrión desbloquea: cierra la invención o la votación. */
export function forzar(p, ahora = Date.now()) {
  if (p.fase === 'inventar') { aVotar(p, ahora); return { ok: true }; }
  if (p.fase === 'votar') { cerrarRonda(p); return { ok: true }; }
  return { ok: false, error: 'Nada que forzar.' };
}

export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id);
  if (!j || j.fuera || p.fase === 'fin') return;
  j.fuera = true;
  if (activos(p).length < 2) { finalizar(p); return; }
  if (p.fase === 'inventar' && activos(p).every((x) => p.inventos[x.id])) aVotar(p, ahora);
  else if (p.fase === 'votar' && activos(p).every((x) => p.votos[x.id])) cerrarRonda(p);
}

export function vistaDe(p, id) {
  const yo = jug(p, id);
  const publico = p.fase === 'resultados' || p.fase === 'fin';
  const letra = (a) => String.fromCharCode(65 + p.orden.indexOf(a));
  return {
    fase: p.fase, ronda: p.ronda, rondas: p.rondas, segundos: p.segundos, hasta: p.hasta,
    jugadores: p.jugadores.map((j) => ({
      id: j.id, nombre: j.nombre, puntos: j.puntos, titulos: j.titulos, fuera: j.fuera,
      listo: p.fase === 'inventar' ? Boolean(p.inventos[j.id]) : p.fase === 'votar' ? Boolean(p.votos[j.id]) : true
    })),
    yo: yo ? {
      id: yo.id, cartas: p.cartas[id] || null, cambios: p.cambios[id] ?? 0, invento: p.inventos[id] || null,
      votos: p.votos[id] ? Object.fromEntries(Object.entries(p.votos[id]).map(([c, a]) => [c, letra(a)])) : null
    } : null,
    // En la votación, los inventos van sin autor (solo una letra); en los resultados, con autor y votos
    inventos: p.fase === 'votar' || publico ? p.orden.map((a) => ({
      letra: letra(a), ...p.inventos[a], cartas: p.cartas[a], mio: a === id,
      autor: publico ? a : null, votos: publico && p.resultado ? p.resultado.recuento[a] : null
    })) : [],
    // Ganadores de cada categoría, por letra
    ganadores: publico && p.resultado ? Object.fromEntries(Object.entries(p.resultado.ganadores).map(([c, l]) => [c, l.map(letra)])) : null,
    fin: p.fin
  };
}
