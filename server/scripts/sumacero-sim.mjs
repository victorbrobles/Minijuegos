// Simulación de «Suma Cero» con bots: comprueba que el motor no se atasca y mide las partidas.
//   node scripts/sumacero-sim.mjs [partidas]
import * as E from '../sumacero/engine.js';
const N = Number(process.argv[2] || 300);
const azar = (a) => a[Math.floor(Math.random() * a.length)];

function juegaBot(est, id) {
  const p = est.jugadores.find((j) => j.id === id);
  const otros = est.jugadores.filter((j) => !j.fuera && j.id !== id);
  if (est.turno.paso === 'robar') {
    if (est.plantado == null && Math.abs(E.suma(p.mano)) <= 2 && est.turnosRonda > est.jugadores.length) { E.plantarse(est, id); return; }
    const arriba = est.descarte[est.descarte.length - 1];
    const r = E.robar(est, id, arriba && arriba.tipo === 'numero' && Math.abs(E.suma(p.mano) + arriba.valor) < Math.abs(E.suma(p.mano)) ? 'descarte' : 'mazo');
    if (!r.ok) E.robar(est, id, 'descarte');
    return;
  }
  const esp = p.mano.find((c) => c.tipo === 'especial');
  if (esp && Math.random() < 0.6) {
    const r = E.jugarEspecial(est, id, esp.uid, { objetivo: azar(otros).id, cartaUid: p.mano.find((c) => c.tipo === 'numero')?.uid });
    if (r.ok) return;
  }
  // descarta la carta que más acerca la suma a 0
  const s = E.suma(p.mano);
  const mejor = [...p.mano].sort((a, b) => Math.abs(s - E.valor(a)) - Math.abs(s - E.valor(b)))[0];
  E.descartar(est, id, mejor.uid);
}

const stats = {};
for (let n = E.AJUSTES.min; n <= E.AJUSTES.max; n++) {
  let atascos = 0; let ceros = 0; let filas = 0; let turnos = 0;
  for (let k = 0; k < N; k++) {
    const est = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `B${i + 1}` })), { rondas: 3 });
    let pasos = 0;
    while (est.fase !== 'fin' && pasos++ < 5000) {
      if (est.fase === 'resultado') { est.jugadores.forEach((j) => E.continuar(est, j.id)); continue; }
      turnos += 1;
      juegaBot(est, est.turno.jugadorId);
    }
    if (est.fase !== 'fin') { atascos += 1; continue; }
    est.historial.forEach(() => {});
  }
  stats[n] = { atascos, turnosPorPartida: (turnos / N).toFixed(0) };
}
console.table(stats);
