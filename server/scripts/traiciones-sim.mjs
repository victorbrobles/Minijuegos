// Simulación en tiempo (acelerado) de «Traiciones» con bots simples: comprueba el motor y calibra el equilibrio.
//   node scripts/traiciones-sim.mjs            (300 partidas por tamaño de grupo)
//   node scripts/traiciones-sim.mjs 100 6 8    (100 partidas, solo grupos de 6 y 8)
// Variables para probar valores: MATAR=30000 TAREAS=5 TAREAMS=8000 VIAJE=4000 TRAI=4:1,7:2,11:3
// Los bots NO razonan como personas: sirven para detectar bloqueos y desequilibrios gordos, no la diversión real.
import * as E from '../traiciones/engine.js';

const env = (k, f) => { if (process.env[k]) f(process.env[k]); };
env('MATAR', (x) => { E.AJUSTES.matarEnfriaMs = Number(x); });
env('TAREAS', (x) => { E.AJUSTES.tareasPorJugador = Number(x); });
env('TAREAMS', (x) => { E.AJUSTES.tareaMs = Number(x); });
env('VIAJE', (x) => { E.AJUSTES.viajeMs = Number(x); });
env('SABOTAJE', (x) => { E.AJUSTES.sabotajeEnfriaMs = Number(x); });
env('TRAI', (x) => { E.AJUSTES.traidores = x.split(',').map((y) => y.split(':').map(Number)); });

// tiempo que tarda un bot en superar la prueba de una tarea (una persona tardará algo más, entre 10 y 25 s)
const TAREA_BOT_MS = Number(process.env.TAREABOT || 14000);
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// camino más corto entre salas (BFS) → siguiente paso
function siguientePaso(desde, hasta) {
  if (desde === hasta) return null;
  const prev = { [desde]: null }; const cola = [desde];
  while (cola.length) {
    const s = cola.shift();
    for (const n of E.SALA[s].vecinos) if (!(n in prev)) { prev[n] = s; cola.push(n); }
  }
  let s = hasta; while (prev[s] !== desde) s = prev[s];
  return s;
}
const dist = (a, b) => { let d = 0, s = a; while (s !== b) { s = siguientePaso(s, b); d++; } return d; };

function jugar(n, rng) {
  const est = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` })), {}, { rng });
  let t = 0;
  est.jugadores.forEach((j) => E.confirmarRol(est, j.id, t));
  const mem = {}; // bot -> { visto: {id: {t, sala}}, sospechosoCierto }
  est.jugadores.forEach((j) => { mem[j.id] = { visto: {}, cierto: null, esperaHasta: 0 }; });
  let reuniones = 0, asesinatos = 0, saltos = 0;
  const LIMITE = 3000 * 1000;

  while (est.fase !== 'fin' && t < LIMITE) {
    t += 1000;
    E.tick(est, t);
    if (est.fase === 'juego') {
      for (const j of est.jugadores) {
        if (est.fase !== 'juego') break;
        const v = E.vistaDe(est, j.id, t);
        const m = mem[j.id];
        if (v.sala) v.sala.presentes.forEach((p) => { m.visto[p.id] = { t, sala: v.sala.id }; });
        v.avisos.forEach((a) => { const r = a.x.match(/amuleto brilla! (.+?) intentó/); if (r) m.cierto = Number(r[1].replace('J', '')); });
        if (v.yo.trabajo?.tipo === 'tarea' && t - v.yo.trabajo.inicio >= TAREA_BOT_MS) { E.tareaHecha(est, j.id, t); continue; }
        if (v.yo.mov || v.yo.trabajo) continue;
        const traidor = j.rol === 'traidor';
        if (traidor && j.vivo) {
          const op = v.opciones;
          if (op.puedeMatar && rng() < 0.9) { E.matar(est, j.id, op.objetivo, t); asesinatos++; continue; }
          if (op.sabotaje && rng() < 0.03) { E.sabotear(est, j.id, rng() < 0.6 ? 'tormenta' : 'incendio', t); continue; }
          if (v.yo.atajos > 0 && rng() < 0.7) { const lejos = E.SALAS.filter((x) => x.id !== v.sala.id && !E.SALA[v.sala.id].vecinos.includes(x.id)); E.mover(est, j.id, lejos[Math.floor(rng() * lejos.length)].id, t); saltos++; continue; }
          if (v.sala?.cuerpos.length && rng() < 0.1) { E.reportar(est, j.id, t); reuniones++; continue; }
          if (v.sala?.tarea && rng() < 0.3 && !v.incendio) { E.trabajar(est, j.id, t); continue; }
          if (rng() < 0.45) { const vec = E.SALA[v.sala.id].vecinos; E.mover(est, j.id, vec[Math.floor(rng() * vec.length)], t); }
          continue;
        }
        // viajeros, bufón y fantasmas
        if (j.vivo && v.sala?.cuerpos.length && rng() < 0.95) { E.reportar(est, j.id, t); reuniones++; continue; }
        if (j.vivo && v.incendio) {
          const pend = v.incendio.salas.filter((s) => !s.apagado);
          if (pend.length) {
            if (v.sala.fuego) { E.apagar(est, j.id, t); continue; }
            const dest = pend.sort((a, b) => dist(v.sala.id, a.id) - dist(v.sala.id, b.id))[0].id;
            E.mover(est, j.id, siguientePaso(v.sala.id, dest), t); continue;
          }
        }
        if (v.sala.tarea && !v.incendio) { E.trabajar(est, j.id, t); continue; }
        const pend = v.yo.tareas.filter((x) => !x.hecha);
        if (pend.length && !v.incendio) {
          const dest = pend.sort((a, b) => dist(v.sala.id, a.sala) - dist(v.sala.id, b.sala))[0].sala;
          const paso = siguientePaso(v.sala.id, dest);
          if (paso) E.mover(est, j.id, paso, t);
        } else if (rng() < 0.3) { const vec = E.SALA[v.sala.id].vecinos; E.mover(est, j.id, vec[Math.floor(rng() * vec.length)], t); }
      }
    } else if (est.fase === 'asamblea') {
      const R = est.asamblea.cuerpo?.sala;
      for (const j of est.jugadores.filter((x) => x.vivo)) E.listoVotar(est, j.id, t);
      est._R = R;
    } else if (est.fase === 'votacion') {
      const vivos = est.jugadores.filter((x) => x.vivo);
      const R = est._R;
      for (const j of vivos) {
        if (est.fase !== 'votacion') break;
        const otros = vivos.filter((x) => x.id !== j.id);
        const m = mem[j.id];
        let voto = null;
        if (j.rol === 'traidor') {
          const nt = otros.filter((x) => x.rol !== 'traidor');
          if (rng() < 0.4 && nt.length) voto = nt[Math.floor(rng() * nt.length)].id;
        } else if (m.cierto && otros.some((x) => x.id === m.cierto)) voto = m.cierto;
        else if (R) {
          const cand = otros.map((x) => ({ x, s: m.visto[x.id] })).filter((c) => c.s && dist(c.s.sala, R) <= 1 && t - c.s.t < 25000).sort((a, b) => b.s.t - a.s.t);
          if (cand.length && rng() < 0.7) voto = cand[0].x.id;
          else if (rng() < 0.2) voto = otros[Math.floor(rng() * otros.length)].id;
        } else if (rng() < 0.15) voto = otros[Math.floor(rng() * otros.length)].id;
        E.votar(est, j.id, voto, t);
      }
    } else if (est.fase === 'veredicto') {
      for (const j of est.jugadores.filter((x) => x.vivo)) E.continuar(est, j.id, t);
    }
  }
  if (est.fase !== 'fin') throw new Error('la partida no terminó en el límite');
  return { ganador: est.fin.ganador, motivo: est.fin.motivo, seg: Math.round(t / 1000), reuniones, asesinatos, saltos };
}

const [, , nPart = '300', ...tams] = process.argv;
const tamanos = tams.length ? tams.map(Number) : [4, 5, 6, 7, 8, 10, 12];
const rng = mulberry32(777);
console.log('n  | leales | traid. | bufón | min medios | reuniones | asesinatos | saltos | motivos');
for (const n of tamanos) {
  const res = [];
  for (let i = 0; i < Number(nPart); i++) res.push(jugar(n, rng));
  const c = (f) => res.filter(f).length;
  const media = (k) => res.reduce((s, r) => s + r[k], 0) / res.length;
  const motivos = {}; res.forEach((r) => { motivos[r.motivo] = (motivos[r.motivo] || 0) + 1; });
  const pct = (x) => `${((x / res.length) * 100).toFixed(0)}%`.padStart(4);
  console.log(`${String(n).padEnd(2)} |  ${pct(c((r) => r.ganador === 'leales'))}  |  ${pct(c((r) => r.ganador === 'traidores'))}  | ${pct(c((r) => r.ganador === 'bufon'))}  |    ${(media('seg') / 60).toFixed(1)}     |   ${media('reuniones').toFixed(1)}    |    ${media("asesinatos").toFixed(1)}    |   ${media("saltos").toFixed(1)}   | ${JSON.stringify(motivos)}`);
}
