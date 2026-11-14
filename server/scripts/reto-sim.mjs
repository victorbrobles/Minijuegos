// Prueba del reto diario: tipos válidos, rotación sin repetir, un solo intento y abandono = fallado.
import assert from 'assert';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
process.env.DB_PATH = join(mkdtempSync(join(tmpdir(), 'reto-')), 'reto.db');
const { TIPOS, retoDe, fechaHoy } = await import('../routes/reto.js');
const { default: router } = await import('../routes/reto.js');

for (const [k, t] of Object.entries(TIPOS)) {
  for (let n = 0; n < 30; n++) {
    const d = t.generar();
    if (d.modo === 'quiz') {
      assert.ok(d.preguntas.length >= d.umbral, k);
      d.preguntas.forEach((q) => { assert.ok(q.opciones.includes(q.correcta), `${k}: ${q.p}`); assert.equal(new Set(q.opciones).size, q.opciones.length, `${k}: opciones repetidas`); });
    }
    if (d.modo === 'ordenar') assert.equal(d.series.length, 2);
    if (d.modo === 'memoria') assert.ok(d.secuencia.length >= d.objetivo);
    if (d.modo === 'calculo') d.operaciones.forEach((o) => assert.ok(Number.isInteger(o.res) && o.res > 0, o.texto));
  }
}
// Rotación: dos días seguidos nunca tienen el mismo tipo, y en 8 días salen todos
const dias = Array.from({ length: 16 }, (_, i) => new Date(Date.UTC(2026, 10, 1 + i, 12)).toISOString().slice(0, 10));
const tipos = dias.map((f) => retoDe(f).tipo);
tipos.forEach((t, i) => { if (i) assert.notEqual(t, tipos[i - 1]); });
assert.equal(new Set(tipos.slice(0, 8)).size, 8);
// El reto de un día no cambia
assert.deepEqual(retoDe(dias[0]), retoDe(dias[0]));

// Flujo por HTTP sobre el router
const express = (await import('express')).default;
const app = express(); app.use(express.json()); app.use('/r', router);
const srv = app.listen(0); const base = `http://127.0.0.1:${srv.address().port}/r`;
const post = (u, b) => fetch(base + u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
const yo = 'Ana#1234';
assert.equal((await post('/empezar', { jugador: 'Ana' })).status, 400);
assert.equal((await post('/empezar', { jugador: yo })).status, 200);
let h = await (await fetch(`${base}/hoy?jugador=${encodeURIComponent(yo)}`)).json();
assert.equal(h.intento.estado, 'fallado'); assert.ok(h.intento.abandonado); // empezado y sin terminar = fallado
assert.equal((await post('/empezar', { jugador: yo })).status, 409); // no hay segundo intento
assert.equal((await post('/terminar', { jugador: yo, fecha: fechaHoy(), superado: true, puntos: 9, resumen: 'x' })).status, 200);
h = await (await fetch(`${base}/hoy?jugador=${encodeURIComponent(yo)}`)).json();
assert.equal(h.intento.estado, 'superado');
assert.equal((await post('/terminar', { jugador: yo, superado: false })).status, 409); // ya cerrado
assert.equal(h.hoy.superados, 1);
srv.close();
console.log('Reto diario: OK');
