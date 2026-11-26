// Prueba de «El Draft de Estrellas»: categoría y criterio claros, fichajes a la vez (online) o por turnos (un móvil),
// comodines (robar, cambiar, chivato), tiempo agotado, abandonos y puntos.
import assert from 'assert';
import * as E from '../../client/src/games/Draft/engine.js';
import { FAMOSOS, CATEGORIAS } from '../../client/src/games/Draft/famosos.js';

assert.equal(new Set(FAMOSOS.map((f) => f.n)).size, FAMOSOS.length, 'famosos repetidos');
FAMOSOS.forEach((f) => { assert.ok(Number.isInteger(f.a) && f.a < 2010, f.n); if (f.h != null) assert.ok(f.h > 130 && f.h < 235, f.n); });
Object.keys(CATEGORIAS).forEach((c) => assert.ok(FAMOSOS.filter((f) => f.c === c).length >= 6 * E.POR_JUGADOR + 10, `pocos famosos en ${c}`));

const azar = (l) => l[Math.floor(Math.random() * l.length)];
let robos = 0; let cambios = 0; let chivatos = 0;
for (let k = 0; k < 120; k++) {
  const n = 2 + (k % 5);
  const local = k % 3 === 0;
  const p = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i}` })), [], { rondas: 3, local }, 0);
  let t = 0; let pasos = 0;
  while (p.fase !== 'fin') {
    assert.ok(++pasos < 5000, 'bucle infinito');
    if (p.fase === 'draft') {
      const v = E.vistaDe(p, 1, t);
      assert.ok(v.categoria && v.criterio, 'categoría y criterio visibles desde el principio');
      assert.ok(v.pool.every((f) => f.dato == null || f.visto), 'los datos no se ven durante el draft');
      // Ningún famoso en dos equipos
      const dueños = p.pool.map((f) => f.de).filter((d) => d != null);
      assert.equal(dueños.length, p.jugadores.reduce((s, j) => s + j.equipo.length, 0));
      const quien = local ? E.turnoDe(p) : azar(p.jugadores.filter((j) => !j.fuera && j.equipo.length < E.POR_JUGADOR)).id;
      const yo = p.jugadores.find((j) => j.id === quien);
      const libres = p.pool.map((f, i) => (f.de == null ? i : -1)).filter((i) => i >= 0);
      const ajenos = p.pool.map((f, i) => (f.de != null && f.de !== quien ? i : -1)).filter((i) => i >= 0);
      const r = Math.random();
      if (r < 0.06 && !yo.usados.robar && ajenos.length && yo.equipo.length < E.POR_JUGADOR) {
        const victima = p.pool[ajenos[0]].de;
        assert.ok(E.accion(p, local ? -1 : quien, { tipo: 'robar', idx: ajenos[0] }, t).ok); robos++;
        if (p.fase === 'draft') assert.equal(p.pool[ajenos[0]].de, quien);
        assert.ok(!p.jugadores.find((j) => j.id === victima).equipo.includes(ajenos[0]));
        assert.ok(!E.accion(p, quien, { tipo: 'robar', idx: ajenos[0] }, t).ok, 'solo se roba una vez');
      } else if (r < 0.1 && !yo.usados.cambiar && yo.equipo.length) {
        assert.ok(E.accion(p, local ? -1 : quien, { tipo: 'cambiar', idx: yo.equipo[0] }, t).ok); cambios++;
      } else if (r < 0.14 && !yo.usados.chivato && libres.length) {
        assert.ok(E.accion(p, local ? -1 : quien, { tipo: 'chivato', idx: libres[0] }, t).ok); chivatos++;
        if (!local) assert.ok(E.vistaDe(p, quien, t).pool[libres[0]].dato, 'el chivato enseña el dato');
        const otro = quien === 1 ? 2 : 1;
        if (!local && !p.jugadores.find((j) => j.id === otro).vistos.includes(libres[0])) assert.ok(!E.vistaDe(p, otro, t).pool[libres[0]].dato, 'solo a quien lo usa');
      } else if (k % 11 === 0 && Math.random() < 0.3) {
        t += ((local ? E.SEG_TURNO : E.SEG_DRAFT) + 1) * 1000; E.tick(p, t); // por tiempo
      } else if (libres.length) {
        // Online: si alguien se lo ha quitado antes, falla y lo intenta con otro
        const idx = azar(libres);
        assert.ok(E.accion(p, local ? -1 : quien, { tipo: 'fichar', idx }, t).ok);
        if (!local) assert.ok(!E.accion(p, quien === 1 ? 2 : 1, { tipo: 'fichar', idx }, t).ok, 'el más rápido se lo queda');
      }
      if (k % 17 === 0 && p.fase === 'draft' && p.jugadores.filter((j) => !j.fuera).length > 2 && Math.random() < 0.02) E.abandonar(p, p.jugadores.find((j) => !j.fuera).id, t);
    } else if (p.fase === 'revelar') {
      p.jugadores.filter((j) => !j.fuera).forEach((j) => assert.equal(j.equipo.length, E.POR_JUGADOR));
      assert.ok(E.vistaDe(p, 1, t).pool.every((f) => f.dato), 'al final se ven todos los datos');
      const activos = p.jugadores.filter((j) => !j.fuera).length;
      const total = Object.values(p.resultado.puntos).reduce((a, b) => a + b, 0);
      assert.ok(total <= (activos * (activos - 1)) / 2);
      t += (E.SEG_REVELAR + 1) * 1000; E.tick(p, t);
    }
  }
  assert.ok(p.fin.ganadores.length);
  assert.ok(new Set(p.rondasJugadas.map((x) => x.join())).size === p.rondasJugadas.length, 'categoría+criterio sin repetir');
}
console.log(`El Draft de Estrellas: 120 partidas (online y en un móvil), ${FAMOSOS.length} famosos, ${robos} robos, ${cambios} cambios, ${chivatos} chivatos. OK`);
