// Simulación del motor de «FrankensFootball»: turnos con aciertos, fallos, pistas, pases, tiempos y abandonos.
import * as E from '../footballsplit/engine.js';
import { generarRetos } from '../data/seeds/footballsplit/split.js';

for (let k = 0; k < 300; k++) {
  const n = E.AJUSTES.min + (k % (E.AJUSTES.max - E.AJUSTES.min + 1));
  const retos = generarRetos(5);
  let t = 1e6;
  const p = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` })), retos, t);
  let pasos = 0;
  while (p.fase !== 'fin' && pasos++ < 3000) {
    t += 3000;
    if (p.fase === 'resuelta') { E.siguiente(p, t); continue; }
    if (!p.listo && Math.random() < 0.9) { E.listo(p, p.turno, t); continue; }
    const r = Math.random();
    if (r < 0.01 && p.jugadores.filter((j) => !j.fuera).length > 1) { E.abandonar(p, p.turno, t); continue; }
    const libres = ['top', 'middle', 'bottom'].filter((x) => !p.resueltas[x]);
    const parte = libres[Math.floor(Math.random() * libres.length)];
    if (r < 0.06) E.tick(p, t + 70000);
    else if (r < 0.12) E.pasar(p, p.turno, t);
    else if (r < 0.2) E.pista(p, p.turno, parte);
    else {
      const real = retos[p.ronda - 1].partes[parte].jugador;
      const res = E.responder(p, p.turno, parte, r < 0.6 ? real.split(' ').pop() : 'Nadie', t);
      if (!res.ok && !/listo/.test(res.error)) throw new Error(res.error);
    }
    if (p.fase === 'jugando' && p.jugadores.find((j) => j.id === p.turno)?.fuera) throw new Error('turno de alguien fuera');
  }
  if (p.fase !== 'fin') throw new Error('partida sin acabar');
}
if (!E.esCorrecta('modric', 'Luka Modric') || !E.esCorrecta('Modrić', 'Luka Modric') || E.esCorrecta('Luk', 'Luka Modric') || !E.esCorrecta('ter stegen', 'Marc-André ter Stegen')) throw new Error('validación');
console.log('OK: 300 partidas sin bloqueos.');
