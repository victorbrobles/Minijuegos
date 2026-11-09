// Simulación de «El Golpe» con bots: comprueba el motor y el reparto de puntos.
//   node scripts/golpe-sim.mjs [partidas]
import * as E from '../golpe/engine.js';
const N = Number(process.argv[2] || 300);
const azar = (a) => a[Math.floor(Math.random() * a.length)];
const stats = {};
for (let n = 3; n <= 8; n++) {
  let atascos = 0; let exitos = 0; let misiones = 0; const objetivos = {}; const cumplidos = {};
  for (let k = 0; k < N; k++) {
    const est = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `B${i + 1}` })), { misiones: 3 });
    let pasos = 0;
    while (est.fase !== 'fin' && pasos++ < 500) {
      const id = E.faltan(est)[0];
      if (id == null) { E.forzar(est); continue; }
      if (est.fase === 'plan') {
        // los bots evitan las opciones que saben imposibles (salvo el traidor)
        const pistas = est.pistas[id] || []; const traidor = est.objetivos[id] === 'traidor';
        const plan = [0, 1, 2].map((paso) => {
          const malas = pistas.filter((p) => p.paso === paso && est.verdad[paso][p.opcion].estado === 'imposible').map((p) => p.opcion);
          const buenas = [0, 1, 2, 3].filter((o) => (traidor ? true : !malas.includes(o)));
          return traidor && malas.length ? malas[0] : azar(buenas);
        });
        E.enviarPlan(est, id, plan);
      } else if (est.fase === 'voto') {
        const otros = Object.keys(est.planes).map(Number).filter((a) => a !== id);
        if (!otros.length) { E.forzar(est); continue; }
        E.votar(est, id, { plan: azar(otros), traidor: azar(est.jugadores.filter((j) => j.id !== id)).id });
      } else E.listo(est, id);
      if (est.fase === 'resolucion' && est.resultado && !est.resultado.contado) {
        est.resultado.contado = true; misiones += 1; if (est.resultado.exito) exitos += 1;
        est.resultado.filas.forEach((f) => { objetivos[f.objetivo] = (objetivos[f.objetivo] || 0) + 1; if (f.cumple) cumplidos[f.objetivo] = (cumplidos[f.objetivo] || 0) + 1; });
      }
    }
    if (est.fase !== 'fin') atascos += 1;
  }
  const pct = (o) => `${Math.round(((cumplidos[o] || 0) / (objetivos[o] || 1)) * 100)}%`;
  stats[n] = { atascos, exito: `${Math.round((exitos / misiones) * 100)}%`, traidor: pct('traidor'), ambicioso: pct('ambicioso'), oportunista: pct('oportunista'), manipulador: pct('manipulador'), infiltrado: pct('infiltrado') };
}
console.table(stats);
