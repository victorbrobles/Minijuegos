// Simulación del motor de «Modo carrera»: partidas aleatorias con pulsaciones, fallos, abandonos y tiempos.
import * as E from '../trayectoria/engine.js';
import { RETOS_TRAYECTORIAS } from '../data/seeds/trayectoria/trayectorias.seed.js';

const azar = (a) => a[Math.floor(Math.random() * a.length)];
let aciertos = 0; let nadie = 0;
for (let k = 0; k < 300; k++) {
  const n = E.AJUSTES.min + (k % (E.AJUSTES.max - E.AJUSTES.min + 1));
  const retos = [...RETOS_TRAYECTORIAS].sort(() => Math.random() - 0.5).slice(0, 5);
  let t = 1e6;
  const p = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` })), retos, t);
  let pasos = 0;
  while (p.fase !== 'fin' && pasos++ < 20000) {
    t += 700 + Math.random() * 3000;
    E.tick(p, t);
    const r = Math.random();
    if (r < 0.003) { const v = p.jugadores.filter((j) => !j.fuera); if (v.length > 1) E.abandonar(p, azar(v).id, t); continue; }
    if (p.fase === 'resuelta') { E.siguiente(p, t); continue; }
    if (p.fase !== 'jugando') continue;
    const v = E.vistaDe(p, 1);
    if (v.pulsado) {
      const reto = retos[p.ronda - 1];
      if (r < 0.4) E.responder(p, v.pulsado.jugadorId, reto.alias?.[0] || reto.nombre, t);
      else if (r < 0.8) E.responder(p, v.pulsado.jugadorId, 'Pepe', t);
    } else if (r < 0.25) {
      const libres = p.jugadores.filter((j) => !j.fuera && !v.bloqueados.includes(j.id));
      if (libres.length) { const res = E.pulsar(p, azar(libres).id, t); if (!res.ok && !/pulsado|terminado/.test(res.error)) throw new Error(res.error); }
    }
    if (p.fase === 'resuelta') { if (p.estado.resultado.tipo === 'acierto') aciertos++; else nadie++; }
  }
  if (p.fase !== 'fin') throw new Error('partida sin acabar');
  if (p.jugadores.some((j) => j.puntos < 0)) throw new Error('puntos negativos');
}
const r = RETOS_TRAYECTORIAS[0];
if (!E.esCorrecta('Leo Mesi', r) || !E.esCorrecta('MESSI', r) || E.esCorrecta('Ronaldo', r)) throw new Error('validación');
console.log(`OK: 300 partidas sin bloqueos (rondas acertadas ${aciertos}, sin acertar ${nadie}).`);
