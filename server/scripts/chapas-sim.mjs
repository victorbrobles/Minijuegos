// Prueba de «Fútbol chapas» (individual, 2-5 jugadores): campos de cada tamaño, tiros al azar, goles (también en
// propia) que suben el marcador, turnos rotando entre todos y fin de partida.
import assert from 'assert';
import * as E from '../../client/src/games/Chapas/engine.js';
// Campos: un lado con portería por jugador y todo dentro de los límites
for (let n = 2; n <= 5; n++) {
  const c = E.campo(n); assert.equal(c.lados.filter((l) => l.dueno != null).length, n, `porterías con ${n}`);
  E.colocacion(n).forEach((k) => c.lados.forEach((l) => { const d = (k.x - l.a[0]) * l.n[0] + (k.y - l.a[1]) * l.n[1]; assert.ok(d >= -1.5, `${k.id} fuera del campo de ${n}`); }));
  assert.equal(E.idsDe(n).filter((id) => /^e\dc/.test(id)).length, 3 * n);
}
let goles = 0; let terminadas = 0; let propias = 0;
for (let k = 0; k < 48; k++) {
  const n = 2 + (k % 4);
  const p = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i}` })), [], { goles: 2 }, 0);
  const c = E.campo(n); let t = 0; let guard = 0; const turnos = new Set();
  while (p.fase !== 'fin' && guard++ < 260) {
    const quien = E.jugadorDeTurno(p); const e = p.turno.equipo; turnos.add(e);
    const chapa = `e${e}c${Math.floor(Math.random() * 3)}`;
    const [cx, cy] = p.posiciones[chapa]; const [bx, by] = p.posiciones.balon;
    const dx = bx - cx; const dy = by - cy; const d = Math.hypot(dx, dy) || 1;
    const r = E.accion(p, quien, { tipo: 'tirar', chapa, vx: (dx / d) * 55 + (Math.random() - 0.5) * 10, vy: (dy / d) * 55 + (Math.random() - 0.5) * 10 }, t);
    assert.ok(r.ok, r.error);
    if (p.ultimo?.propia) propias++;
    // todo sigue dentro del campo
    Object.entries(p.posiciones).forEach(([id, [x, y]]) => c.lados.forEach((l) => { const dd = (x - l.a[0]) * l.n[0] + (y - l.a[1]) * l.n[1]; assert.ok(dd >= -1.5, `${id} fuera (${x}, ${y}) con ${n}`); }));
    t += 1000;
  }
  assert.ok(turnos.size === n || p.fase === 'fin', 'todos tiran');
  goles += p.marcador.reduce((a, b) => a + b, 0);
  if (p.fase === 'fin') { terminadas += 1; assert.ok(p.fin.ganadores.length >= 1); }
  if (p.ultimo?.tiro) { const r2 = E.simularTiro(p.ultimo.antes, p.ultimo.tiro, n); assert.ok(r2.frames.length > 1); }
}
// Gol en propia: punto para todos los demás
{
  const p = E.crearPartida([1, 2, 3].map((id) => ({ id, nombre: `J${id}` })), [], { goles: 5 }, 0);
  const l = E.campo(3).lados.find((x) => x.dueno === 0);
  p.posiciones = { ...p.posiciones, balon: [l.medio[0] + l.n[0] * 4, l.medio[1] + l.n[1] * 4], e0c0: [l.medio[0] + l.n[0] * 10, l.medio[1] + l.n[1] * 10] };
  E.accion(p, 1, { tipo: 'tirar', chapa: 'e0c0', vx: -l.n[0] * 40, vy: -l.n[1] * 40 }, 0);
  assert.deepEqual(p.marcador, [0, 1, 1], 'propia: +1 a los demás');
}
// tiempo agotado pasa el turno y no se puede tirar fuera de turno
const p = E.crearPartida([{ id: 1, nombre: 'A' }, { id: 2, nombre: 'B' }], [], {}, 0);
E.tick(p, (E.SEG_TURNO + 1) * 1000); assert.equal(p.turno.equipo, 1);
assert.ok(E.accion(p, 1, { tipo: 'tirar', chapa: 'e0c0', vx: 0, vy: -40 }, 0).ok === false, 'no es su turno');
console.log(`Fútbol chapas: ${terminadas}/48 partidas terminadas, ${goles} goles (${propias} en propia). OK`);
assert.ok(terminadas >= 30 && goles > 50);
