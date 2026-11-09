// Simulación de «La Hipótesis Ganadora» con bots: comprueba que el motor no se atasca y muestra el equilibrio.
//   node scripts/hipotesis-sim.mjs [partidas]
import * as E from '../hipotesis/engine.js';

const N = Number(process.argv[2] || 300);
const azar = (a) => a[Math.floor(Math.random() * a.length)];
const ent = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

export function hipotesisAlAzar(est, id, honesto) {
  const V = E.VARIANTES[est.variante];
  for (let k = 0; k < 400; k++) {
    const pl = azar(V.plantillas);
    const p = {};
    E.PLANTILLAS[pl].params.forEach((x) => {
      if (x === 'i' || x === 'j') p[x] = ent(0, est.K - 1);
      if (x === 'v' || x === 'w') p[x] = ent(0, V.valores.length - 1);
      if (x === 'n') { const [lo, hi] = E.rangoN(est.variante, pl, est.K); p[x] = ent(lo, hi); }
    });
    const h = { pl, p };
    if (E.validar(est, h)) continue;
    if (honesto == null) return h;
    if (E.evaluar(est.variante, h, est.verdad) === honesto) return h;
  }
  return null;
}

const stats = {};
for (let n = 3; n <= 8; n++) {
  let atascos = 0; let ciertas = 0; let total = 0; let maxPts = 0;
  for (let k = 0; k < N; k++) {
    const est = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `B${i + 1}` })), { rondas: 5 }, { local: true });
    let pasos = 0;
    while (est.fase !== 'fin' && pasos++ < 500) {
      const pend = E.faltan(est);
      if (!pend.length) { E.forzar(est); continue; }
      const id = pend[0];
      if (est.fase === 'formular') {
        const h = hipotesisAlAzar(est, id, Math.random() < 0.6);
        if (!h) { E.forzar(est); continue; }
        const r = E.formular(est, id, h); if (!r.ok) throw new Error(r.error);
        total += 1; if (E.evaluar(est.variante, h, est.verdad)) ciertas += 1;
      } else if (est.fase === 'juicio') {
        const votos = {};
        Object.entries(est.hipotesis).forEach(([a, h]) => { if (Number(a) !== id) votos[h.hid] = Math.random() < 0.5 ? 'si' : 'no'; });
        const hids = Object.keys(votos);
        const r = E.juzgar(est, id, { votos, seguro: hids.length && Math.random() < 0.5 ? azar(hids) : null }); if (!r.ok) throw new Error(r.error);
      } else if (est.fase === 'revelacion') E.continuar(est, id);
    }
    if (est.fase !== 'fin') { atascos += 1; continue; }
    maxPts += est.fin.tabla[0].puntos;
  }
  stats[n] = { atascos, ciertasPct: `${Math.round((ciertas / total) * 100)}%`, puntosGanador: (maxPts / N).toFixed(1) };
}
console.table(stats);
