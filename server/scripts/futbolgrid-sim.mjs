// Simulación del motor de «Fútbol en raya»: partidas con aciertos, fallos, pases, tiempos y abandonos.
import * as E from '../futbolgrid/engine.js';
import { GRIDS_JUGABLES } from '../data/seeds/futbolgrid/index.js';

let ganadas = 0; let empates = 0;
for (let k = 0; k < 400; k++) {
  const grid = GRIDS_JUGABLES[k % GRIDS_JUGABLES.length];
  const n = 2 + (k % 5);
  let t = 1e6;
  const p = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` })), grid, k % 2 ? 'O' : 'X');
  let pasos = 0;
  while (p.fase !== 'fin' && pasos++ < 500) {
    t += 2000;
    const id = p.jugadores.find((j) => !j.fuera && j.equipo === p.turno)?.id;
    if (Math.random() < 0.01 && n > 2) { E.abandonar(p, p.jugadores.find((j) => !j.fuera).id); continue; }
    if (p.fase === 'elegir') {
      const libres = p.tablero.map((c, i) => (c ? null : i)).filter((x) => x != null);
      const r = E.elegirCasilla(p, id, libres[Math.floor(Math.random() * libres.length)], t);
      if (!r.ok) throw new Error(r.error);
    } else {
      const r0 = Math.random();
      if (r0 < 0.05) E.tick(p, t + 60000);
      else if (r0 < 0.1) E.pasar(p, id);
      else {
        const validos = grid.respuestas[Math.floor(p.celda / 3)][p.celda % 3].filter((v) => !p.usados.includes(v));
        const texto = r0 < 0.75 && validos.length ? validos[0] : 'Pepito Grillo';
        const r = E.responder(p, id, texto, t);
        if (!r.ok) E.pasar(p, id);
      }
    }
  }
  if (p.fase !== 'fin') {
    // sin respuestas válidas para alguna casilla puede alargarse: se termina a mano
    E.terminar(p);
  }
  if (p.fin.ganador) ganadas++; else empates++;
}
const v = ['Luis Figo', 'Ronaldo Nazario', 'Vinicius Junior', 'Casemiro'];
const ok = E.buscar('figo', v) === 'Luis Figo' && E.buscar('Vinicius', v) === 'Vinicius Junior' && E.buscar('vinicius jr', v) === 'Vinicius Junior'
  && E.buscar('Casemiro', v) === 'Casemiro' && E.buscar('a', v) === null && E.buscar('Luis', v) === null && E.buscar('Ronaldo Nazário', v) === 'Ronaldo Nazario';
if (!ok) throw new Error('validación de nombres');
console.log(`OK: 400 partidas (con ganador ${ganadas}, empate ${empates}).`);
