// Prueba de «Minigolf»: 200 hoyos con semilla validada, motor (online y por turnos) y física del bot.
import assert from 'assert';
import * as CANNON from 'cannon-es';
import fs from 'fs';
import { generarHoyo, elegirRecorrido, TOTAL_HOYOS } from '../../client/src/games/Minigolf/hoyos.js';
import { crearSimulador, golpeBot } from '../../client/src/games/Minigolf/fisica.js';
import * as E from '../../client/src/games/Minigolf/engine.js';

const semillas = JSON.parse(fs.readFileSync(new URL('../../client/src/games/Minigolf/semillas.json', import.meta.url), 'utf8'));
assert.equal(Object.keys(semillas).length, TOTAL_HOYOS, 'los 200 hoyos tienen semilla validada');
// La dificultad sube: más casillas de media al final que al principio
const media = (a, b) => { let s = 0; for (let n = a; n <= b; n++) s += generarHoyo(n, semillas[n]).casillas.length; return s / (b - a + 1); };
assert.ok(media(181, 200) > media(1, 20) + 2, 'los últimos hoyos son más largos');
// Recorrido: 18 hoyos ordenados por dificultad
const rec = elegirRecorrido(semillas);
assert.equal(rec.length, 18); assert.ok(rec.every((h, i) => i === 0 || h.n > rec[i - 1].n)); assert.ok(rec[17].n > 188);
// El bot emboca un hoyo fácil
{ const s = crearSimulador(generarHoyo(rec[0].n, rec[0].semilla), CANNON); let ok = false; for (let g = 0; g < 12 && !ok; g++) ok = golpeBot(s) === 'embocada'; assert.ok(ok); }
// Online: todos a la vez
const jug = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` }));
{
  const p = E.crearPartida(jug(3), rec, { online: true, hoyos: 9 }, 0);
  assert.equal(p.recorrido.length, 9); assert.equal(p.recorrido[8].n, rec[17].n, 'el último es el más difícil');
  for (let h = 0; h < 9; h++) {
    assert.equal(p.fase, 'jugando');
    E.accion(p, 1, { tipo: 'estado', golpes: 1, pos: [0, 0, 0] }, 0);
    E.accion(p, 1, { tipo: 'estado', golpes: 3, embocada: true }, 0);
    E.accion(p, 2, { tipo: 'estado', golpes: 2, embocada: true }, 0);
    E.accion(p, 3, { tipo: 'estado', golpes: 10, parada: true }, 0);
    assert.equal(p.fase, 'resumen');
    E.tick(p, 10_000_000 * (h + 1));
  }
  assert.equal(p.fase, 'fin');
  assert.deepEqual(p.fin.tabla.map((t) => t.puntos), [18, 27, 90]);
  assert.deepEqual(p.fin.ganadores, [2]);
}
// Por turnos (un móvil): golpe a golpe
{
  const p = E.crearPartida(jug(2), rec, { hoyos: 6 }, 0);
  assert.equal(p.limite, null);
  assert.equal(E.vistaDe(p, -1).turno, 1);
  E.accion(p, null, { tipo: 'estado', golpes: 1, parada: true }, 0);
  assert.equal(E.vistaDe(p, -1).turno, 2, 'pasa el turno tras el golpe');
  E.accion(p, null, { tipo: 'estado', golpes: 1, embocada: true }, 0);
  assert.equal(E.vistaDe(p, -1).turno, 1);
  E.accion(p, null, { tipo: 'estado', golpes: 2, embocada: true }, 0);
  assert.equal(p.fase, 'resumen');
  E.siguiente(p); assert.equal(p.hoyo, 1); assert.equal(p.jugadores[0].golpes, 0);
}
// Tiempo agotado: máximo para los que no acaban
{ const p = E.crearPartida(jug(2), rec, { online: true }, 0); E.tick(p, E.SEG_HOYO * 1000 + 1); assert.equal(p.fase, 'resumen'); assert.ok(p.jugadores.every((j) => j.tarjeta[0] === E.MAX_GOLPES)); }
console.log('Minigolf: OK');
