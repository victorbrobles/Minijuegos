// Simulación de partidas de «Fundadores» con bots simples, para comprobar el motor y calibrar la meta común.
//   node scripts/fundadores-sim.mjs            (400 partidas por tamaño de grupo)
//   node scripts/fundadores-sim.mjs 200 4 6    (200 partidas, solo grupos de 4 y 6)
//   META=12 node scripts/fundadores-sim.mjs    (probar otra meta por jugador)
import * as E from '../fundadores/engine.js';
if (process.env.META) E.AJUSTES.metaPorJugador = Number(process.env.META);
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function jugarTurno(est, rng) {
  const id = est.turno.jugadorId;
  let v = E.vistaDe(est, id);
  const yo = () => E.vistaDe(est, id).yo;
  const mejor = (cartas, f) => cartas.slice().sort((a, b) => f(b) - f(a))[0];
  // básica
  const m = yo();
  const minCoste = m.mano.length ? Math.min(...m.mano.map((c) => c.coste)) : 99;
  const quiereProyectar = m.mano.length === 0 || (m.monedas >= minCoste && m.mano.length < 2 && rng() < 0.6);
  E.basica(est, id, quiereProyectar ? 'proyectar' : 'jornal');
  v = E.vistaDe(est, id);
  if (v.turno.pendiente) E.elegirPendiente(est, id, mejor(v.turno.pendiente.cartas, (c) => c.prestigio / c.coste + (c.tipo === 'hito' ? 0.5 : 0)).uid);
  // habilidad
  v = E.vistaDe(est, id);
  const t = v.turno;
  if (t.rol !== 0 && !t.bloqueada && rng() < 0.9) {
    const otros = v.jugadores.filter((j) => j.id !== id && !j.fuera);
    const probar = (rol) => {
      if (rol === 1) return E.habilidad(est, id, { rolObjetivo: 2 + Math.floor(rng() * 7), copiar: rol });
      if (rol === 2) return E.habilidad(est, id, { rolObjetivo: 3 + Math.floor(rng() * 6) });
      if (rol === 4) return E.habilidad(est, id, { objetivo: otros[Math.floor(rng() * otros.length)].id });
      if (rol === 5) { const tp = E.TIPOS_BASE.slice().sort((a, b) => v.jugadores.find((j) => j.id === id).pueblo.filter((c) => c.tipo === b).length - v.jugadores.find((j) => j.id === id).pueblo.filter((c) => c.tipo === a).length)[0]; return E.habilidad(est, id, { tipo: tp }); }
      if (rol === 7) {
        const monedas = E.vistaDe(est, id).yo.monedas;
        const cand = otros.flatMap((o) => o.pueblo.map((c) => ({ o, c }))).filter((x) => x.c.coste + 1 <= monedas).sort((a, b) => b.c.prestigio - a.c.prestigio)[0];
        return cand ? E.habilidad(est, id, { objetivo: cand.o.id, cartaUid: cand.c.uid }) : { ok: false };
      }
      return E.habilidad(est, id, {});
    };
    if (t.rol === 8) {
      const libres = t.libres;
      if (libres.length) { const r = libres[Math.floor(rng() * libres.length)]; const res = (() => { const sav = probar; return null; })(); const otros2 = otros; 
        const pr = { copiar: r, objetivo: otros2[Math.floor(rng() * otros2.length)].id, tipo: 'hogar' };
        if (r === 7) { const monedas = E.vistaDe(est, id).yo.monedas; const cand = otros2.flatMap((o) => o.pueblo.map((c) => ({ o, c }))).filter((x) => x.c.coste + 1 <= monedas)[0]; if (cand) { pr.objetivo = cand.o.id; pr.cartaUid = cand.c.uid; } }
        E.habilidad(est, id, pr); }
    } else probar(t.rol);
    v = E.vistaDe(est, id);
    if (v.turno.pendiente) E.elegirPendiente(est, id, mejor(v.turno.pendiente.cartas, (c) => c.prestigio / c.coste).uid);
  }
  // construir
  for (let i = 0; i < 3; i++) {
    v = E.vistaDe(est, id);
    if (!v.turno || v.turno.jugadorId !== id) break;
    const asequibles = v.yo.mano.filter((c) => v.turno.costes[c.uid] <= v.yo.monedas && !v.jugadores.find((j) => j.id === id).pueblo.some((x) => x.nombre === c.nombre));
    if (!asequibles.length) break;
    const c = mejor(asequibles, (x) => x.prestigio);
    if (!E.construir(est, id, c.uid).ok) break;
  }
  const r = E.terminarTurno(est, id);
  if (!r.ok) throw new Error('terminarTurno: ' + r.error);
}

function jugar(n, rng) {
  const est = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` })), {}, { rng });
  let guard = 0; let conflictos = 0, peones = 0;
  while (est.fase !== 'fin' && guard++ < 4000) {
    if (est.fase === 'elegir') {
      est.jugadores.forEach((j) => E.elegirRol(est, j.id, 1 + Math.floor(rng() * 8)));
      peones += Object.values(est.asignados).filter((r) => r === 0).length;
    } else jugarTurno(est, rng);
  }
  if (est.fase !== 'fin') throw new Error('la partida no terminó');
  const ganador = est.fin.ganadores[0];
  const pos = (ganador - 1 - 0 + n) % n;
  return { rondas: est.ronda, pts: est.fin.tabla[0].total, peones, edificios: est.jugadores.reduce((s, j) => s + j.pueblo.length, 0) / n, empate: est.fin.ganadores.length > 1 };
}

const [, , nPart = '400', ...tams] = process.argv;
const tamanos = tams.length ? tams.map(Number) : [3, 4, 5, 6, 7];
const rng = mulberry32(2024);
console.log('n | rondas | edif/jugador | puntos ganador | peones/ronda | empates');
for (const n of tamanos) {
  const r = []; for (let i = 0; i < Number(nPart); i++) r.push(jugar(n, rng));
  const med = (k) => (r.reduce((s, x) => s + x[k], 0) / r.length);
  console.log(`${n} |  ${med('rondas').toFixed(1)}   |     ${med('edificios').toFixed(1)}      |      ${med('pts').toFixed(1)}      |     ${(med('peones') / med('rondas')).toFixed(2)}     | ${(r.filter((x) => x.empate).length / r.length * 100).toFixed(0)}%`);
}
