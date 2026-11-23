// Prueba de «Carrera de Canicas»: en cada circuito, un bot por el camino principal y otro por cada camino alternativo
// completan todas las vueltas.
import assert from 'assert';
import * as CANNON from 'cannon-es';
import { IDS_CIRCUITOS, construirCircuito } from '../../client/src/games/Canicas/circuitos.js';
import { crearMundo, crearCanica, posSalida, controlar, revisar, crearBot, dirBot, paso } from '../../client/src/games/Canicas/fisica.js';

import { spawn } from 'node:child_process';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const DT = 1 / 60;
// Cada camino de cada circuito se prueba en un proceso aparte y en paralelo (la física es lenta: todos seguidos
// superaban el tiempo límite de la revisión). Con «id:n» como argumento, solo se prueba ese camino.
const solo = process.argv[2];
if (!solo) {
  const yo = fileURLToPath(import.meta.url); const max = Math.max(2, os.cpus().length); let fallos = 0;
  const cola = IDS_CIRCUITOS.flatMap((id) => Array.from({ length: 1 + construirCircuito(id).ramas.length }, (_, n) => `${id}:${n}`));
  const uno = () => new Promise((ok) => {
    const id = cola.shift(); if (!id) { ok(); return; }
    const p = spawn(process.execPath, [yo, id], { stdio: ['ignore', 'pipe', 'pipe'] }); let salida = '';
    p.stdout.on('data', (d) => { salida += d; }); p.stderr.on('data', (d) => { salida += d; });
    p.on('close', (codigo) => { process.stdout.write(salida); if (codigo !== 0) fallos++; uno().then(ok); });
  });
  await Promise.all(Array.from({ length: Math.min(max, cola.length) }, uno));
  assert.equal(fallos, 0, 'algún circuito falla');
}
for (const id of solo ? [solo.split(':')[0]] : []) {
  const c = construirCircuito(id);
  const pruebas = [{ nombre: 'principal', atajos: c.ramas.map(() => false) }, ...c.ramas.map((r, i) => ({ nombre: r.nombre, atajos: c.ramas.map((_, j) => j === i) }))];
  for (const pr of pruebas.filter((_, n) => String(n) === solo.split(':')[1])) {
    const w = crearMundo(c, CANNON);
    const k = crearCanica(w, 'garra', posSalida(c, 1), { c, orden: 1 });
    const bot = crearBot(c, Math.random, 1); bot.forzar = pr.atajos; bot.error = 0;
    let t = 0; let caidas = 0; let usado = false;
    while (t < 420 && !k.terminada) {
      controlar(k, dirBot(c, k, bot, c.def.hielo), t, DT, c.def.hielo);
      paso(w, DT); t += DT;
      if (bot.rama !== null && bot.k > 10) usado = true;
      const ev = revisar(c, k, [], t); if (ev.caida) caidas++;
    }
    console.log(`${c.def.nombre} · ${pr.nombre}: ${k.terminada ? `meta en ${t.toFixed(1)} s` : `NO LLEGA (prog ${(k.prog * 100).toFixed(0)}%)`} · caídas ${caidas}${pr.nombre !== 'principal' ? (usado ? ' · usó el atajo' : ' · NO usó el atajo') : ''} · largo ${c.principal.largo.toFixed(0)} m`);
    assert.ok(k.terminada, `${id} ${pr.nombre}: el bot llega a la meta`);
  }
}
// Motor online: elegir → cuenta → carrera → podio → fin, sincronización, rayos y aceite
import * as E from '../../client/src/games/Canicas/engine.js';
if (!solo) {
  const jug = [{ id: 1, nombre: 'A' }, { id: 2, nombre: 'B' }, { id: 3, nombre: 'C' }];
  const p = E.crearPartida(jug, ['valle', 'canon', 'espiral'], { carreras: 3 }, 0);
  assert.equal(p.fase, 'elegir');
  E.accion(p, 1, { tipo: 'canica', canica: 'roca' }, 0); E.accion(p, 2, { tipo: 'canica', canica: 'iman' }, 0);
  E.tick(p, E.SEG_ELEGIR * 1000 + 1); assert.equal(p.fase, 'cuenta'); assert.ok(p.jugadores[2].canica, 'canica al azar a quien no eligió');
  E.tick(p, p.inicio); assert.equal(p.fase, 'carrera');
  const r = E.sincronizar(p, 1, { p: [1, 2, 3], v: [0, 0, 0], prog: 0.5 }, 0, p.inicio + 1000);
  assert.equal(r.otros.length, 2);
  E.accion(p, 2, { tipo: 'objeto', objeto: 'rayo' }, p.inicio + 2000);
  E.accion(p, 3, { tipo: 'objeto', objeto: 'aceite', pos: [0, 0, 0] }, p.inicio + 2000);
  const r2 = E.sincronizar(p, 1, null, 0, p.inicio + 2100);
  assert.equal(r2.eventos.length, 1); assert.equal(r2.trampas.length, 1);
  E.accion(p, 1, { tipo: 'objeto', objeto: 'pisada', trampa: r2.trampas[0].id }, p.inicio + 2200);
  E.accion(p, 3, { tipo: 'objeto', objeto: 'misil', a: 1 }, p.inicio + 2250);
  E.accion(p, 3, { tipo: 'objeto', objeto: 'misil', a: 3 }, p.inicio + 2250); // a sí mismo: no vale
  const misiles = E.sincronizar(p, 1, null, 1, p.inicio + 2260).eventos.filter((e) => e.tipo === 'misil');
  assert.equal(misiles.length, 1); assert.equal(misiles[0].a, 1);
  assert.equal(E.sincronizar(p, 1, null, 1, p.inicio + 2300).trampas.length, 0);
  E.accion(p, 2, { tipo: 'llegada' }, p.inicio + 30000); E.accion(p, 1, { tipo: 'llegada' }, p.inicio + 31000);
  E.tick(p, p.inicio + 30000 + E.SEG_TRAS_PRIMERO * 1000 + 1);
  assert.equal(p.fase, 'podio'); assert.deepEqual(p.resultados.map((x) => x.id), [2, 1, 3]);
  E.siguiente(p); assert.equal(p.fase, 'elegir'); assert.equal(p.carrera, 1);
  for (let k = 0; k < 2; k++) { E.forzar(p, 0); E.tick(p, p.inicio); E.forzar(p, 0); E.forzar(p, 0); }
  assert.equal(p.fase, 'fin'); assert.ok(p.fin.ganadores.length);
}
if (!solo) console.log('Carrera de Canicas: OK');
