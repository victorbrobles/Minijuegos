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
    if (d.modo === 'famoso') {
      const firma = (i) => d.preguntas.map((p) => p.si.includes(i)).join();
      assert.equal(d.candidatos.filter((_, i) => firma(i) === firma(d.objetivo)).length, 1, 'famoso sin firma única');
    }
    if (d.modo === 'ahorcado') d.palabras.forEach((p) => assert.match(p.palabra, /^[A-Z ]+$/));
    if (d.modo === 'anagramas') d.palabras.forEach((p) => assert.equal([...p.desordenada].sort().join(), [...p.palabra].sort().join()));
    if (d.modo === 'aproximar') d.preguntas.forEach((q) => assert.ok(Number.isFinite(q.respuesta) && q.respuesta > 0, q.p));
    if (d.modo === 'seleccionar') { assert.equal(d.correctos.length, 11); assert.ok(d.correctos.every((c) => d.nombres.includes(c))); assert.equal(new Set(d.nombres).size, d.nombres.length); }
    if (d.modo === 'stroop') d.items.forEach((it) => assert.ok(['rojo', 'azul', 'verde', 'amarillo'].includes(it.tinta)));
    if (d.modo === 'reflejos') assert.ok(d.esperas.length >= 3);
    if (d.modo === 'parejas') assert.ok(d.cartas.length % 2 === 0 && d.maxIntentos >= d.cartas.length / 2);
  }
}
// Rotación: dos días seguidos nunca tienen el mismo tipo, y en 31 días salen los 31
assert.ok(Object.keys(TIPOS).length >= 31);
const dias = Array.from({ length: 62 }, (_, i) => new Date(Date.UTC(2026, 10, 1 + i, 12)).toISOString().slice(0, 10));
const tipos = dias.map((f) => retoDe(f).tipo);
tipos.forEach((t, i) => { if (i) assert.notEqual(t, tipos[i - 1]); });
assert.equal(new Set(tipos.slice(0, 31)).size, 31);
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
