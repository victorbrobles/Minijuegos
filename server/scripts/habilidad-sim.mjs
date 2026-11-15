// Prueba de «Test de habilidad»: lista elegida, resultados online y por turnos, puntos por puesto (más y menos), final.
import assert from 'assert';
import * as E from '../../client/src/games/Habilidad/engine.js';
import { IDS } from '../../client/src/games/Habilidad/catalogo.js';
import fs from 'fs';

assert.equal(IDS.length, 30, '30 minijuegos en el catálogo');
// Cada minijuego del catálogo está definido en los archivos del cliente
const fuentes = ['a', 'b', 'c', 'd', 'e', 'f'].map((k) => fs.readFileSync(new URL(`../../client/src/games/Habilidad/minijuegos/${k}.jsx`, import.meta.url), 'utf8')).join('\n');
IDS.forEach((id) => assert.ok(fuentes.includes(`id: '${id}'`), `falta el minijuego ${id}`));
assert.deepEqual(E.completarLista(['topos', 'semaforo', 'nada', 'topos'], 3).slice(0, 2), ['topos', 'semaforo']);
assert.equal(E.completarLista([], 30).length, 30);
const jug = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` }));
{
  const p = E.crearPartida(jug(3), ['topos', 'semaforo'], { online: true }, 0);
  E.accion(p, 1, { tipo: 'resultado', valor: 10 }); E.accion(p, 2, { tipo: 'resultado', valor: 15 }); E.accion(p, 3, { tipo: 'resultado', valor: 10 });
  assert.equal(p.fase, 'resultados');
  assert.deepEqual(p.ultimo.tabla.map((t) => [t.id, t.puesto, t.pts]), [[2, 1, 10], [1, 2, 8], [3, 2, 8]]);
  E.siguiente(p); // semáforo: gana el tiempo más bajo
  E.accion(p, 1, { tipo: 'resultado', valor: 250 }); E.accion(p, 2, { tipo: 'resultado', valor: 400 });
  E.tick(p, p.limite + 1); // el 3 no llegó
  assert.deepEqual(p.ultimo.tabla.map((t) => [t.id, t.pts]), [[1, 10], [2, 8], [3, 0]]);
  E.siguiente(p); assert.equal(p.fase, 'fin');
  assert.deepEqual(p.fin.tabla.map((t) => t.puntos), [18, 18, 8]); assert.deepEqual(p.fin.ganadores.sort(), [1, 2]);
}
{ // Un solo móvil: por turnos
  const p = E.crearPartida(jug(2), ['diana'], {}, 0);
  assert.equal(E.turnoLocal(p), 1); E.accion(p, null, { tipo: 'resultado', valor: 5 });
  assert.equal(E.turnoLocal(p), 2); E.accion(p, null, { tipo: 'resultado', valor: 7 });
  assert.equal(p.fase, 'resultados'); assert.equal(p.ultimo.tabla[0].id, 2);
}
console.log('Test de habilidad: OK');
