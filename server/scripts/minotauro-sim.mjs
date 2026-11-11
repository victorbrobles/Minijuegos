// Simulación de «El Laberinto · El Minotauro»: laberintos válidos, capturas, llaves, salidas y equilibrio con bots.
import assert from 'assert';
import * as E from '../minotauro/engine.js';

const L = E.AJUSTES.lado;
// Todo el laberinto está conectado
for (let k = 0; k < 50; k++) {
  const ab = E.crearLaberinto(L);
  const visto = new Set([0]); const cola = [0];
  while (cola.length) { const c = cola.shift(); E.vecinos(L, ab, c).forEach((n) => { if (!visto.has(n)) { visto.add(n); cola.push(n); } }); }
  assert.equal(visto.size, L * L, 'laberinto conectado');
}

/** Camino más corto (por los pasillos) de a a b. */
function camino(p, a, b) {
  const prev = new Map([[a, null]]); const cola = [a];
  while (cola.length) { const c = cola.shift(); if (c === b) break; E.vecinos(p.L, p.abiertas, c).forEach((n) => { if (!prev.has(n)) { prev.set(n, c); cola.push(n); } }); }
  if (!prev.has(b)) return [];
  const r = []; let c = b; while (c !== a) { r.unshift(c); c = prev.get(c); } return r;
}
const dist = (p, a, b) => camino(p, a, b).length;

// Caso a mano: el Minotauro atrapa a quien se cruza con él
let p = E.crearPartida([1, 2, 3].map((id) => ({ id, nombre: `J${id}` })), { minotauro: 1, sinReloj: true }, 0, () => 0.4);
assert.ok(E.vistaDe(p, 3).jugadores.find((j) => j.id === 1).estado === 'oculto', 'el Minotauro es secreto');
assert.ok(E.vistaDe(p, 3).celdas.length < L * L, 'niebla para los exploradores');
assert.equal(E.vistaDe(p, 1).celdas.length, L * L, 'el Minotauro conoce el laberinto');
const mino = p.jugadores[0]; const ana = p.jugadores[1];
const ruta = camino(p, mino.pos, ana.pos);
mino.pos = ruta[ruta.length - 3] ?? mino.pos; // a 2 pasos de Ana
E.planificar(p, 1, camino(p, mino.pos, ana.pos).slice(0, 3));
E.planificar(p, 2, []);
assert.equal(E.planificar(p, 3, [99999]).ok, false, 'no se atraviesan paredes');
E.planificar(p, 3, []);
assert.equal(p.jugadores[1].rol, 'ayudante', 'Ana atrapada');

// Partidas con bots
let ganaE = 0; let ganaM = 0; let turnos = 0; let capturas = 0; let escapes = 0;
const N = 300;
for (let k = 0; k < N; k++) {
  const n = 3 + (k % 6);
  const q = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` })), { turnos: 25, sinReloj: true }, 0);
  let pasos = 0;
  while (q.fase !== 'fin') {
    assert.ok(pasos++ < 200, 'la partida acaba');
    for (const j of q.jugadores.filter((x) => !x.escapado && !x.fuera && !x.listo)) {
      const v = E.vistaDe(q, j.id);
      const max = v.yo.maxPasos;
      let objetivo;
      if (j.rol === 'explorador') {
        const llaves = q.llaves.filter((x) => !x.cogida).map((x) => x.pos);
        // va a la llave más cercana (las busca) o a la salida más cercana
        const metas = llaves.length ? llaves : q.salidas;
        objetivo = metas.sort((a, b) => dist(q, j.pos, a) - dist(q, j.pos, b))[0];
        const m = q.jugadores.find((x) => x.rol === 'minotauro');
        const cerca = v.piezas.some((x) => x.rol !== 'explorador');
        const r = camino(q, j.pos, objetivo).slice(0, cerca ? max : Math.random() < 0.3 ? max : 2);
        E.planificar(q, j.id, r, j.trampas > 0 && cerca && Math.random() < 0.6);
      } else {
        const vistos = v.piezas.filter((x) => x.rol === 'explorador');
        if (vistos.length) objetivo = vistos[0].pos;
        else {
          const oye = v.yo.mensajes.find((t) => t.startsWith('👂'));
          const libres = v.llaves;
          objetivo = (oye && Math.random() < 0.5) || !libres.length ? q.salidas[Math.floor(Math.random() * 2)] : libres[Math.floor(Math.random() * libres.length)];
        }
        E.planificar(q, j.id, camino(q, j.pos, objetivo).slice(0, max));
      }
      if (q.fase === 'fin') break;
    }
    // invariantes
    q.jugadores.forEach((j) => assert.ok(j.pos >= 0 && j.pos < L * L));
  }
  turnos += q.turno;
  capturas += q.jugadores.filter((j) => j.rolInicial === 'explorador' && j.rol === 'ayudante').length;
  escapes += q.fin.escapados;
  if (q.fin.ganan === 'exploradores') ganaE++; else ganaM++;
  assert.ok(q.fin.ganadores.length > 0);
}
console.log(`minotauro-sim OK (${N} partidas · exploradores ${Math.round(ganaE / N * 100)} % · Minotauro ${Math.round(ganaM / N * 100)} % · ${Math.round(turnos / N)} turnos de media · ${capturas} capturas · ${escapes} escapes)`);
