// Simulación del motor de «¿Con quién he jugado?»: pulsaciones, aciertos, respuestas que revisa el juez, tiempos.
import * as E from '../jugadores/engine.js';
import { DUPLAS } from '../data/seeds/jugadores/index.js';

const azar = (a) => a[Math.floor(Math.random() * a.length)];
let aciertos = 0; let revisiones = 0;
for (let k = 0; k < 300; k++) {
  const n = 2 + (k % 6);
  const retos = [...DUPLAS].sort(() => Math.random() - 0.5).slice(0, 5);
  let t = 1e6;
  const p = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` })), retos, t);
  let pasos = 0;
  while (p.fase !== 'fin' && pasos++ < 5000) {
    t += 1000 + Math.random() * 6000;
    E.tick(p, t);
    if (p.fase === 'resuelta') { if (p.estado.resultado.tipo === 'acierto') aciertos++; E.siguiente(p, t); continue; }
    if (p.fase !== 'jugando') continue;
    const v = E.vistaDe(p, 1);
    if (v.revision) { revisiones++; E.juzgar(p, Math.random() < 0.3, t); continue; }
    if (v.pulsado) {
      const r = retos[p.ronda - 1];
      const x = Math.random();
      const res = E.responder(p, v.pulsado.jugadorId, x < 0.4 ? azar(r.comunes) : x < 0.5 ? r.jugador1 : 'Fulanito', t);
      if (!res.ok && !/pareja/.test(res.error)) throw new Error(res.error);
      if (!res.ok) E.responder(p, v.pulsado.jugadorId, 'Menganito', t);
    } else if (Math.random() < 0.3) {
      const libres = p.jugadores.filter((j) => !j.fuera && !v.bloqueados.includes(j.id));
      if (libres.length) E.pulsar(p, azar(libres).id, t);
    }
  }
  if (p.fase !== 'fin') throw new Error('partida sin acabar');
}
const d = DUPLAS.find((x) => x.comunes.includes('Lionel Messi'));
if (d && !E.buscar('messi', d.comunes, d.alias)) throw new Error('alias');
console.log(`OK: 300 partidas (aciertos ${aciertos}, revisiones del juez ${revisiones}).`);
