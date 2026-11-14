// client/src/games/Transmision/engine.js
// «Última Transmisión»: motor puro de las salas online (server/routes/transmision.js). Cooperativo y en tiempo real.
// La nave tiene varias secciones (motores, oxígeno…) y cada jugador controla una o dos. Cada sección tiene un panel:
// tres palancas (A, B, C), un dial del 0 al 9 y un botón de color. Van saltando averías: el dueño de la sección ve la
// alarma, pero el MANUAL con la solución lo tiene otro jugador. Hay que hablar: uno lee, el otro ejecuta.
// Si una avería no se arregla a tiempo, el casco pierde un punto. Si aguantáis hasta el final, llega la transmisión.
export const SECCIONES = [
  { id: 'motores', nombre: 'Motores', e: '🚀' },
  { id: 'oxigeno', nombre: 'Oxígeno', e: '🫧' },
  { id: 'navegacion', nombre: 'Navegación', e: '🧭' },
  { id: 'electricidad', nombre: 'Electricidad', e: '⚡' },
  { id: 'escudos', nombre: 'Escudos', e: '🛡️' },
  { id: 'comunicaciones', nombre: 'Comunicaciones', e: '📡' }
];
export const COLORES = ['rojo', 'azul', 'verde', 'amarillo'];
export const PALANCAS = ['A', 'B', 'C'];
export const OPCIONES_DURACION = [120, 180, 240];
const CASCO = 5;
const AVERIAS = ['Fuga de plasma', 'Cortocircuito', 'Sobrecalentamiento', 'Fallo de presión', 'Interferencia', 'Bucle de datos', 'Vibración extraña', 'Chispazos', 'Alarma fantasma',
  'Válvula atascada', 'Pérdida de señal', 'Pico de tensión', 'Filtro obstruido', 'Desajuste orbital', 'Ruido de fondo', 'Cristal agrietado', 'Ventilador loco', 'Microfisura'];
const r = (n) => Math.floor(Math.random() * n);
const barajar = (l) => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = r(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export function crearPartida(jugadores, items, reglas = {}, ahora = Date.now()) {
  const duracion = OPCIONES_DURACION.includes(reglas.duracion) ? reglas.duracion : 180;
  const n = jugadores.length;
  const nSec = Math.min(SECCIONES.length, n >= 4 ? n : n * 2);
  const secciones = SECCIONES.slice(0, nSec).map((s, i) => ({
    ...s, dueno: jugadores[i % n].id,
    panel: { palancas: { A: Math.random() < 0.5, B: Math.random() < 0.5, C: Math.random() < 0.5 }, dial: r(10), color: null }
  }));
  return {
    fase: 'jugando', ronda: 1, rondas: 1, inicio: ahora, finEn: ahora + duracion * 1000, duracion,
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, fuera: false, arregladas: 0 })),
    secciones, averias: [], casco: CASCO, reparadas: 0, perdidas: 0, siguienteEn: ahora + 4000, contador: 0, log: [], fin: null
  };
}
const activos = (p) => p.jugadores.filter((j) => !j.fuera);

/** Requisitos de una avería: 1 a 3 cosas del panel, al menos una distinta de como está ahora. */
function requisitos(panel, nivel) {
  const cuantos = Math.min(3, 1 + Math.floor(Math.random() * (nivel >= 2 ? 3 : 2)));
  const tipos = barajar(['palanca', 'dial', 'color', 'palanca2']).slice(0, cuantos);
  const req = {};
  const pals = barajar(PALANCAS);
  for (const t of tipos) {
    if (t === 'palanca') req[`p${pals[0]}`] = !panel.palancas[pals[0]];
    if (t === 'palanca2') req[`p${pals[1]}`] = Math.random() < 0.5;
    if (t === 'dial') { let d = r(10); if (d === panel.dial) d = (d + 1 + r(9)) % 10; req.dial = d; }
    if (t === 'color') req.color = COLORES.filter((c) => c !== panel.color)[r(3)];
  }
  // Nunca nace arreglada
  if (cumple(panel, req)) req[`p${pals[1]}`] = !panel.palancas[pals[1]];
  return req;
}
export const cumple = (panel, req) => Object.entries(req).every(([k, v]) => (k === 'dial' ? panel.dial === v : k === 'color' ? panel.color === v : panel.palancas[k.slice(1)] === v));

export function textoRequisitos(req) {
  const partes = [];
  for (const [k, v] of Object.entries(req)) {
    if (k === 'dial') partes.push(`gira el dial al ${v}`);
    else if (k === 'color') partes.push(`pulsa el botón ${v.toUpperCase()}`);
    else partes.push(`palanca ${k.slice(1)} ${v ? 'ARRIBA' : 'ABAJO'}`);
  }
  return partes.join(', ');
}

function crearAveria(p, ahora) {
  const libres = p.secciones.filter((s) => !p.averias.some((a) => a.seccion === s.id));
  if (!libres.length) return;
  const s = libres[r(libres.length)];
  const transcurrido = (ahora - p.inicio) / (p.duracion * 1000);
  const nivel = transcurrido < 0.3 ? 1 : transcurrido < 0.65 ? 2 : 3;
  // El manual lo tiene alguien que NO es el dueño (si hay más de un jugador)
  const otros = activos(p).filter((j) => j.id !== s.dueno);
  const lector = (otros.length ? otros : activos(p))[r((otros.length ? otros : activos(p)).length)].id;
  const usados = new Set(p.averias.map((a) => a.nombre));
  const nombre = barajar(AVERIAS).find((x) => !usados.has(x));
  p.contador += 1;
  p.averias.push({ id: p.contador, seccion: s.id, nombre, req: requisitos(s.panel, nivel), lector, creada: ahora, vence: ahora + (nivel === 1 ? 45000 : nivel === 2 ? 38000 : 32000) });
}

function comprobar(p, ahora) {
  for (const a of [...p.averias]) {
    const s = p.secciones.find((x) => x.id === a.seccion);
    if (cumple(s.panel, a.req)) {
      p.averias = p.averias.filter((x) => x !== a);
      p.reparadas += 1;
      const d = p.jugadores.find((j) => j.id === s.dueno); const l = p.jugadores.find((j) => j.id === a.lector);
      if (d) d.arregladas += 1; if (l && l !== d) l.arregladas += 1;
      p.log.unshift({ t: ahora, ok: true, texto: `✅ ${a.nombre} en ${s.nombre} reparada` });
    }
  }
  p.log = p.log.slice(0, 6);
}

export function tick(p, ahora = Date.now()) {
  if (p.fase !== 'jugando') return;
  for (const a of [...p.averias]) {
    if (ahora >= a.vence) {
      p.averias = p.averias.filter((x) => x !== a);
      p.casco -= 1; p.perdidas += 1;
      const s = p.secciones.find((x) => x.id === a.seccion);
      p.log.unshift({ t: ahora, ok: false, texto: `💥 ${a.nombre} en ${s.nombre}: ¡daño en el casco!` });
    }
  }
  if (p.casco <= 0) { terminar(p, false); return; }
  if (ahora >= p.finEn) { terminar(p, true); return; }
  const maxActivas = Math.min(p.secciones.length, activos(p).length + 1);
  if (ahora >= p.siguienteEn) {
    if (p.averias.length < maxActivas) crearAveria(p, ahora);
    const t = (ahora - p.inicio) / (p.duracion * 1000);
    p.siguienteEn = ahora + Math.max(5000, 13000 - t * 8000) * (0.8 + Math.random() * 0.4);
  }
}

export function control(p, id, d, ahora = Date.now()) {
  if (p.fase !== 'jugando') return { ok: false, error: 'La misión ha terminado.' };
  const s = p.secciones.find((x) => x.id === d.seccion);
  if (!s) return { ok: false, error: 'Sección desconocida.' };
  if (s.dueno !== id) return { ok: false, error: 'Esa sección no es tuya.' };
  if (d.tipo === 'palanca' && PALANCAS.includes(d.cual)) s.panel.palancas[d.cual] = !s.panel.palancas[d.cual];
  else if (d.tipo === 'dial') s.panel.dial = Math.max(0, Math.min(9, Math.floor(Number(d.valor) || 0)));
  else if (d.tipo === 'color' && COLORES.includes(d.color)) s.panel.color = d.color;
  else return { ok: false, error: 'Control no válido.' };
  comprobar(p, ahora);
  return { ok: true };
}

export function terminar(p, exito = false) {
  p.fase = 'fin';
  const tabla = [...p.jugadores].map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.arregladas, arregladas: j.arregladas, fuera: j.fuera }))
    .sort((a, b) => b.puntos - a.puntos);
  tabla.forEach((t, i) => { t.puesto = i + 1; });
  p.fin = { exito, tabla, max: 0, reparadas: p.reparadas, perdidas: p.perdidas, casco: Math.max(0, p.casco), ganadores: exito ? activos(p).map((j) => j.id) : [] };
  return { ok: true };
}

export function abandonar(p, id) {
  const j = p.jugadores.find((x) => x.id === id);
  if (!j || p.fase === 'fin') return;
  j.fuera = true;
  const quedan = activos(p);
  if (!quedan.length) { terminar(p, false); return; }
  // Sus secciones y manuales pasan a otros
  p.secciones.filter((s) => s.dueno === id).forEach((s, i) => { s.dueno = quedan[i % quedan.length].id; });
  p.averias.filter((a) => a.lector === id).forEach((a) => { a.lector = quedan[Math.floor(Math.random() * quedan.length)].id; });
}

export function accion(p, id, d, ahora) {
  if (['palanca', 'dial', 'color'].includes(d.tipo)) return control(p, id, d, ahora);
  return null;
}

export function vistaDe(p, id, ahora = Date.now()) {
  return {
    fase: p.fase, ronda: 1, rondas: 1, ahora, quedan: Math.max(0, p.finEn - ahora), duracion: p.duracion, casco: p.casco, cascoMax: CASCO, reparadas: p.reparadas,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.arregladas, fuera: j.fuera })),
    yo: p.jugadores.some((j) => j.id === id) ? { id } : null,
    // Paneles: el tuyo entero; de los demás, solo de quién es
    secciones: p.secciones.map((s) => ({ id: s.id, nombre: s.nombre, e: s.e, dueno: s.dueno, panel: s.dueno === id ? s.panel : null })),
    // Alarmas: todos ven qué falla y dónde (y cuánto queda); el manual, solo quien lo tiene
    averias: p.averias.map((a) => ({ id: a.id, seccion: a.seccion, nombre: a.nombre, quedan: Math.max(0, a.vence - ahora), total: a.vence - a.creada,
      mia: p.secciones.find((s) => s.id === a.seccion)?.dueno === id, manual: a.lector === id ? textoRequisitos(a.req) : null })),
    log: p.log, fin: p.fin
  };
}
export const forzar = () => ({ ok: true });
