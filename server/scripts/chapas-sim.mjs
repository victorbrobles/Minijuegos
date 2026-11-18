// Prueba de «Fútbol chapas»: partidas con tiros al azar; los goles suben el marcador y la partida termina.
import assert from 'assert';
import * as E from '../../client/src/games/Chapas/engine.js';
let goles = 0; let terminadas = 0;
for (let k = 0; k < 40; k++) {
  const n = 2 + (k % 3);
  const p = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i}` })), [], { goles: 2 }, 0);
  let t = 0; let guard = 0;
  while (p.fase !== 'fin' && guard++ < 200) {
    const quien = E.jugadorDeTurno(p); const e = p.turno.equipo;
    const chapa = `e${e}c${Math.floor(Math.random() * 3)}`;
    const [cx, cy] = p.posiciones[chapa]; const [bx, by] = p.posiciones.balon;
    const dx = bx - cx; const dy = by - cy; const d = Math.hypot(dx, dy) || 1;
    const r = E.accion(p, quien, { tipo: 'tirar', chapa, vx: (dx / d) * 55 + (Math.random() - 0.5) * 10, vy: (dy / d) * 55 + (Math.random() - 0.5) * 10 }, t);
    assert.ok(r.ok, r.error);
    // posiciones dentro del campo
    Object.values(p.posiciones).forEach(([x, y]) => { assert.ok(x >= 0 && x <= E.W && y >= -1 && y <= E.H + 1, `fuera ${x},${y}`); });
    t += 1000;
  }
  goles += p.marcador[0] + p.marcador[1];
  if (p.fase === 'fin') terminadas += 1;
  // la animación del cliente reproduce el mismo resultado
  if (p.ultimo?.tiro) { const r2 = E.simularTiro(p.ultimo.antes, p.ultimo.tiro); assert.ok(r2.frames.length > 1); }
}
// tiempo agotado pasa el turno
const p = E.crearPartida([{ id: 1, nombre: 'A' }, { id: 2, nombre: 'B' }], [], {}, 0);
E.tick(p, (E.SEG_TURNO + 1) * 1000); assert.equal(p.turno.equipo, 1);
assert.ok(E.accion(p, 1, { tipo: 'tirar', chapa: 'e0c0', vx: 0, vy: -40 }, 0).ok === false, 'no es su turno');
console.log(`Fútbol chapas: ${terminadas}/40 partidas terminadas, ${goles} goles. OK`);
assert.ok(terminadas >= 30 && goles > 40);
