// Simulación de «Lleva la cuenta» con bots: comprueba que el motor no se atasca.
//   node scripts/cuentas-sim.mjs [partidas]
import * as E from '../cuentas/engine.js';
const N = Number(process.argv[2] || 300);
const stats = {};
for (let n = E.AJUSTES.min; n <= E.AJUSTES.max; n++) {
  let atascos = 0; let turnos = 0; let elim = 0;
  for (let k = 0; k < N; k++) {
    const est = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `B${i + 1}` })));
    let pasos = 0;
    while (est.fase === 'juego' && pasos++ < 3000) {
      const id = est.turno.jugadorId; const p = est.jugadores.find((j) => j.id === id);
      const bajo = p.mano[0];
      const r = Math.random();
      // bot: cuanto más cerca del último colocado, más se atreve
      if (bajo - est.ultimo < 12 || r < 0.25) E.soltar(est, id, bajo);
      else if (p.acciones > 0 && r < 0.45) E.usarAccion(est, id);
      else E.pasar(est, id);
    }
    if (est.fase !== 'fin') { atascos += 1; continue; }
    turnos += est.turnos; elim += est.jugadores.filter((j) => j.eliminado).length;
  }
  stats[n] = { atascos, turnosMedios: (turnos / N).toFixed(0), eliminadosMedios: (elim / N).toFixed(1) };
}
console.table(stats);
