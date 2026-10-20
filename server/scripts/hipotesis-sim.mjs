// Simulación de «La Hipótesis Ganadora» con bots de distintas «personalidades» para comprobar el motor y el equilibrio:
// si mentir nunca compensara (o compensara siempre), el juego no tendría gracia.
//   node scripts/hipotesis-sim.mjs [partidas]
import * as E from '../hipotesis/engine.js';
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rng = mulberry32(31337);
const azar = (n) => Math.floor(rng() * n);

// personalidades: pFarol = probabilidad de formular una hipótesis falsa; pFe = probabilidad de apostar sin saber
const PERFILES = { honesto: { pFarol: 0, pFe: 0.25 }, farolero: { pFarol: 0.6, pFe: 0.25 }, mentiroso: { pFarol: 1, pFe: 0.25 }, escéptico: { pFarol: 0, pFe: 0 } };

function hipotesisBot(est, v, perfil) {
  const conoc = v.conocimiento; const sabe = (m) => conoc.find((c) => c.m === m);
  const farol = rng() < perfil.pFarol;
  if (!farol) {
    // una verdad que conoce: tipo de una muestra suya
    const c = conoc[azar(conoc.length)];
    if (rng() < 0.5 || conoc.length < 2) return { forma: 'tipo', i: c.m, t: c.t };
    const [a, b] = [conoc[0], conoc[1]];
    return a.t === b.t ? { forma: 'igual', i: a.m, j: b.m } : { forma: 'distinta', i: a.m, j: b.m };
  }
  const c = conoc[azar(conoc.length)];
  return { forma: 'tipo', i: c.m, t: (c.t + 1 + azar(3)) % 4 }; // una mentira sobre una muestra que conoce
}

function posicionBot(v, h, perfil) {
  const c = (m) => v.conocimiento.find((x) => x.m === m);
  let veredicto = null; // true/false si lo sabe
  if (h.forma === 'tipo' && c(h.i)) veredicto = c(h.i).t === h.t;
  else if (h.forma !== 'tipo' && c(h.i) && c(h.j)) veredicto = h.forma === 'igual' ? c(h.i).t === c(h.j).t : c(h.i).t !== c(h.j).t;
  else if (h.forma !== 'tipo' && (c(h.i) || c(h.j))) veredicto = null;
  if (veredicto === true) return 'si';
  if (veredicto === false) return 'no';
  if (rng() < perfil.pFe) return h.forma === 'distinta' ? 'si' : (rng() < 0.5 ? 'si' : null);
  return null;
}

function jugar(n) {
  const est = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: 'J' + (i + 1) })), { rondas: 6 }, { rng });
  const nombres = Object.keys(PERFILES);
  const perfil = {}; est.jugadores.forEach((j, i) => { perfil[j.id] = nombres[i % nombres.length]; });
  let guard = 0;
  while (est.fase !== 'fin' && guard++ < 500) {
    if (est.fase === 'hipotesis') {
      for (const j of est.jugadores) {
        const v = E.vistaDe(est, j.id); const pf = PERFILES[perfil[j.id]];
        if (v.yo.instrumento.tipo === 'lupa' && !v.yo.instrumento.usado) { let m; do { m = azar(v.M); } while (v.conocimiento.some((c) => c.m === m)); E.usarLupa(est, j.id, m); }
        const h = hipotesisBot(est, E.vistaDe(est, j.id), pf);
        if (E.vistaDe(est, j.id).yo.instrumento.tipo === 'coartada' && !E.vistaDe(est, j.id).yo.instrumento.usado && pf.pFarol > 0.5) h.coartada = true;
        const r = E.enviarHipotesis(est, j.id, h); if (!r.ok) throw new Error('hipótesis: ' + r.error);
      }
    } else if (est.fase === 'apuestas') {
      for (const j of est.jugadores) {
        if (est.fase !== 'apuestas') break;
        const v = E.vistaDe(est, j.id); const pf = PERFILES[perfil[j.id]];
        const posiciones = {};
        v.hipotesis.filter((h) => h.autorId !== j.id).forEach((h) => { const p = posicionBot(v, h, pf); if (p) posiciones[h.autorId] = p; });
        if (!Object.keys(posiciones).length) { const o = v.hipotesis.filter((h) => h.autorId !== j.id); posiciones[o[azar(o.length)].autorId] = 'si'; }
        const datos = { posiciones };
        if (v.yo.instrumento.tipo === 'doble' && !v.yo.instrumento.usado) datos.doble = Number(Object.keys(posiciones)[0]);
        const r = E.apostar(est, j.id, datos); if (!r.ok) throw new Error('apuestas: ' + r.error);
      }
    } else if (est.fase === 'resolucion') est.jugadores.forEach((j) => { if (est.fase === 'resolucion') E.continuar(est, j.id); });
  }
  if (est.fase !== 'fin') throw new Error('la partida no terminó');
  return { perfil, est };
}

const N = Number(process.argv[2] || 400);
for (const n of [3, 4, 5, 6, 8]) {
  const acc = {}; const gan = {}; const cnt = {};
  for (let g = 0; g < N; g++) {
    const { perfil, est } = jugar(n);
    est.jugadores.forEach((j) => { const p = perfil[j.id]; acc[p] = (acc[p] || 0) + j.puntos; cnt[p] = (cnt[p] || 0) + 1; });
    est.fin.ganadores.forEach((id) => { const p = perfil[id]; gan[p] = (gan[p] || 0) + 1; });
  }
  console.log(`n=${n}  puntos medios por partida:`, Object.keys(acc).map((p) => `${p} ${(acc[p] / cnt[p]).toFixed(1)}`).join(' | '), '  victorias:', Object.keys(gan).map((p) => `${p} ${Math.round(gan[p] / N * 100)}%`).join(' '));
}
