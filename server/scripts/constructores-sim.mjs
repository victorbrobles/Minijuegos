// Simulación de «El Laberinto · Constructores y corredores»: física (hielo, flechas, portales), validación,
// rotación de encargos, carreras verificadas y puntos por puestos.
import assert from 'assert';
import * as E from '../constructores/engine.js';

const L = E.AJUSTES.lado;
const i = (x, y) => y * L + x;
// Hielo: resbalas hasta chocar
let lab = { [i(1, 0)]: 'hielo', [i(2, 0)]: 'hielo', [i(4, 0)]: 'muro' };
assert.equal(E.mover(lab, 0, 'E'), i(3, 0), 'resbala por el hielo y para en la primera casilla normal');
lab = { [i(1, 0)]: 'hielo', [i(2, 0)]: 'hielo', [i(3, 0)]: 'muro' };
assert.equal(E.mover(lab, 0, 'E'), i(2, 0), 'el hielo para contra un muro');
// Flechas: te empujan
lab = { [i(0, 1)]: 'E' };
assert.equal(E.mover(lab, 0, 'S'), i(1, 1));
// Portales
lab = { [i(1, 0)]: 'portal', [i(7, 7)]: 'portal' };
assert.equal(E.mover(lab, 0, 'E'), i(7, 7));
// Bucle de flechas: no se cuelga
lab = { [i(1, 0)]: 'S', [i(1, 1)]: 'O', [i(0, 1)]: 'N' };
E.mover(lab, 0, 'E');
// Validación
assert.equal(E.validar({ [i(1, 0)]: 'muro', [i(0, 1)]: 'muro' }).ok, false, 'sin salida');
assert.equal(E.validar({ [E.META]: 'muro' }).ok, false, 'la meta libre');
assert.equal(E.validar({ [i(3, 3)]: 'portal' }).ok, false, 'portales por parejas');
const muchos = {}; for (let k = 1; k <= 30; k++) muchos[k * 2] = 'muro';
assert.equal(E.validar(muchos).ok, false, 'presupuesto de muros');
for (let k = 0; k < 100; k++) assert.ok(E.validar(E.laberintoAzar()).ok, 'el laberinto al azar es válido');

/** Camino más corto (direcciones) con la física del juego. */
function ruta(l) {
  const prev = new Map([[E.INICIO, null]]); const cola = [E.INICIO];
  while (cola.length) {
    const c = cola.shift(); if (c === E.META) break;
    Object.keys(E.DIRS).forEach((d) => { const n = E.mover(l, c, d); if (!prev.has(n)) { prev.set(n, [c, d]); cola.push(n); } });
  }
  const r = []; let c = E.META; while (prev.get(c)) { const [a, d] = prev.get(c); r.unshift(d); c = a; } return r;
}
/** Un constructor «malvado»: pone piezas al azar mientras quede salida y alarga el camino. */
function construir() {
  const l = {}; const P = { ...E.AJUSTES.presupuesto };
  const piezas = ['muro', 'hielo', 'N', 'E', 'S', 'O'];
  for (let k = 0; k < 500; k++) {
    const c = 1 + Math.floor(Math.random() * (L * L - 2));
    if (l[c]) continue;
    const t = piezas[Math.floor(Math.random() * piezas.length)];
    const tipo = E.DIRS[t] ? 'flecha' : t;
    if (E.cuenta(l)[tipo] >= P[tipo]) continue;
    l[c] = t;
    if (E.resolver(l) == null) delete l[c];
  }
  return l;
}

let partidas = 0; let pasosMedios = 0; let encargos = 0;
for (let k = 0; k < 120; k++) {
  const n = 2 + (k % 7);
  const J = Array.from({ length: n }, (_, x) => ({ id: x + 1, nombre: `J${x + 1}` }));
  const p = E.crearPartida(J, { rondas: E.OPCIONES.rondas[k % 3], segConstruir: 90, segCarrera: 90 }, 0);
  let t = 0;
  while (p.fase !== 'fin') {
    if (p.fase === 'construir') {
      // Nadie construye para sí mismo y cada uno recibe un laberinto
      assert.ok(p.encargos.every((e) => e.constructor !== e.corredor));
      assert.equal(new Set(p.encargos.map((e) => e.corredor)).size, p.encargos.length);
      p.encargos.forEach((e) => { if (Math.random() < 0.9) assert.ok(E.entregar(p, e.constructor, construir(), t).ok); });
      if (p.fase === 'construir') E.tick(p, (t += 200000));
    } else if (p.fase === 'carrera') {
      t = p.inicio;
      p.encargos.forEach((e) => {
        const r = ruta(e.lab);
        pasosMedios += r.length; encargos += 1;
        assert.equal(E.llegar(p, e.corredor, r.slice(0, -1), t).ok, false, 'un recorrido incompleto no vale');
        if (Math.random() < 0.9) assert.ok(E.llegar(p, e.corredor, r, (t += 1000 + Math.random() * 30000)).ok);
      });
      if (p.fase === 'carrera') E.tick(p, (t += 500000));
    } else if (p.fase === 'resultados') {
      const v = E.vistaDe(p, 1);
      assert.ok(v.resultados.length === n);
      E.siguiente(p, t);
    }
  }
  const total = p.jugadores.reduce((a, j) => a + j.puntos, 0);
  assert.ok(total > 0);
  partidas += 1;
}
console.log(`constructores-sim OK (${partidas} partidas · camino medio de ${Math.round(pasosMedios / encargos)} movimientos)`);
