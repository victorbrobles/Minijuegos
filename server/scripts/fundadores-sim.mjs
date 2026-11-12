// Simulación de partidas de Fundadores con bots sencillos (para comprobar el motor y el equilibrio).
//   node scripts/fundadores-sim.mjs [partidas]
import * as E from '../fundadores/engine.js';

const N = Number(process.argv[2] || 300);
const azar = (a) => a[Math.floor(Math.random() * a.length)];

function jugarTurno(est, id) {
  const p = est.jugadores.find((j) => j.id === id);
  const t = est.turno;
  if (t.paso === 'recurso') {
    const caro = Math.min(...p.mano.map((c) => c.coste), 99);
    const r = E.recurso(est, id, p.mano.length < 2 || (p.monedas >= caro + 2 && Math.random() < 0.5) ? 'planos' : 'monedas');
    if (!r.ok) E.recurso(est, id, 'monedas');
    return;
  }
  if (t.paso === 'planos') { const mejor = [...t.pendiente].sort((a, b) => b.puntos - a.puntos)[0]; E.quedarPlano(est, id, mejor.uid); return; }
  if (t.paso === 'habilidad') {
    const params = {};
    if (t.rol === 1) params.rol = azar(est.enJuego.filter((r) => r !== 1));
    if (t.rol === 2) params.rol = azar(est.enJuego.filter((r) => r > 2 && r !== est.saboteado)) ?? 3;
    if (t.rol === 8 && Math.random() < 0.5) {
      const v = est.jugadores.find((q) => !E.puedeDerribar(est, p, q) && q.pueblo.some((c) => c.coste - 1 <= p.monedas));
      if (v) { const c = v.pueblo.find((x) => x.coste - 1 <= p.monedas); params.derribo = { jugadorId: v.id, uid: c.uid }; }
    }
    const r = E.habilidad(est, id, params);
    if (!r.ok) E.omitirHabilidad(est, id);
    return;
  }
  const opciones = p.mano.filter((c) => !E.motivoNoConstruir(est, p, c)).sort((a, b) => b.puntos - a.puntos);
  if (opciones.length) { E.construir(est, id, opciones[0].uid); return; }
  E.terminarTurno(est, id);
}

const stats = {};
for (let n = E.AJUSTES.min; n <= E.AJUSTES.max; n++) {
  let rondas = 0; let ganPrimero = 0; let totales = 0; let atascos = 0;
  for (let k = 0; k < N; k++) {
    const est = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `B${i + 1}` })));
    let pasos = 0;
    while (est.fase !== 'fin' && pasos++ < 20000) {
      if (est.fase === 'eleccion') E.elegirRol(est, E.eligeAhora(est), azar(est.pool));
      else jugarTurno(est, est.turno.jugadorId);
    }
    if (est.fase !== 'fin') { atascos += 1; continue; }
    rondas += est.ronda;
    totales += est.fin.tabla[0].total;
    if (est.fin.ganadores.includes(est.ordenCompleto[0])) ganPrimero += 1;
  }
  stats[n] = { rondas: (rondas / N).toFixed(1), puntosGanador: (totales / N).toFixed(1), ganaQuienCompleta: `${Math.round((ganPrimero / N) * 100)}%`, atascos };
}
console.table(stats);
