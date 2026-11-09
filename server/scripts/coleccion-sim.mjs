// Simulación de «Colecciona con cabeza» con bots: comprueba que el motor no se atasca y mide la duración.
//   node scripts/coleccion-sim.mjs [partidas]
import * as E from '../coleccion/engine.js';

const N = Number(process.argv[2] || 300);
const azar = (a) => a[Math.floor(Math.random() * a.length)];
const necesita = (p, c) => (c.clase === 'comodin') || (p.encargo.distintos ? !p.vitrina.some((x) => x.palo === c.palo) : p.encargo.req.some((r) => r.palo === c.palo && p.vitrina.filter((x) => x.palo === c.palo).length < r.n));

function juegaBot(est, id) {
  const p = est.jugadores.find((j) => j.id === id);
  const otros = est.jugadores.filter((j) => !j.fuera && j.id !== id);
  for (let k = 0; k < 20 && est.turno?.jugadorId === id && est.turno.jugadas > 0 && est.fase === 'juego'; k++) {
    const util = p.mano.find((c) => E.esColeccion(c) && necesita(p, c));
    if (util && p.vitrina.length < E.AJUSTES.maxVitrina) { E.colocar(est, id, util.uid); continue; }
    if (p.vitrina.length >= E.AJUSTES.maxVitrina) { const sobra = p.vitrina.find((c) => !necesita({ ...p, vitrina: p.vitrina.filter((x) => x.uid !== c.uid) }, c)); if (sobra) { E.retirar(est, id, sobra.uid); continue; } }
    const acc = p.mano.find((c) => c.clase === 'accion' && c.accion !== 'escudo');
    if (acc) {
      const v = azar(otros);
      const params = { objetivo: v.id, palo: azar(E.PALOS).id, suUid: v.vitrina[0]?.uid, miUid: p.vitrina[0]?.uid };
      if (acc.accion === 'regalo') params.miUid = p.mano.find((c) => E.esColeccion(c))?.uid;
      if (acc.accion === 'rebuscar') params.suUid = est.descarte[0]?.uid;
      const r = E.jugarAccion(est, id, acc.uid, params);
      if (!r.ok) { p.mano = p.mano.filter((c) => c.uid !== acc.uid); est.descarte.push(acc); }
      continue;
    }
    break;
  }
  if (est.fase !== 'juego' || est.turno?.jugadorId !== id) return;
  E.terminarTurno(est, id);
  while (est.turno?.jugadorId === id && est.turno.paso === 'descartar') {
    const sobra = p.mano.find((c) => c.clase === 'accion') || p.mano[0];
    E.descartar(est, id, sobra.uid);
  }
}

const stats = {};
for (let n = 2; n <= 6; n++) {
  let atascos = 0; let rondas = 0;
  for (let k = 0; k < N; k++) {
    const est = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `B${i + 1}` })));
    let pasos = 0;
    while (est.fase === 'juego' && pasos++ < 3000) juegaBot(est, est.turno.jugadorId);
    if (est.fase !== 'fin') { atascos += 1; continue; }
    rondas += est.ronda;
  }
  stats[n] = { atascos, rondasMedias: (rondas / (N - atascos)).toFixed(1) };
}
console.table(stats);
