// client/src/games/UnTrazo/motor.js
// Figuras de puntos y líneas sobre una cuadrícula. Una figura se puede dibujar de un solo trazo
// (sin repetir líneas) si es conexa y tiene 0 o 2 puntos con un número impar de líneas.
export const COLS = 4;
export const FILAS = 5;

const azar = (n) => Math.floor(Math.random() * n);
const clave = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
export const idNodo = (x, y) => y * COLS + x;
export const posNodo = (id) => [id % COLS, Math.floor(id / COLS)];

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];

/** ¿La arista a-b cruza alguna diagonal existente de la misma celda? */
function cruza(a, b, aristas) {
  const [ax, ay] = posNodo(a); const [bx, by] = posNodo(b);
  if (ax === bx || ay === by) return false;
  const x0 = Math.min(ax, bx); const y0 = Math.min(ay, by);
  const otra = (ax - bx) * (ay - by) > 0
    ? clave(idNodo(x0 + 1, y0), idNodo(x0, y0 + 1))
    : clave(idNodo(x0, y0), idNodo(x0 + 1, y0 + 1));
  return aristas.has(otra);
}

export function grados(aristas) {
  const g = new Map();
  for (const k of aristas) {
    const [a, b] = k.split('-').map(Number);
    g.set(a, (g.get(a) || 0) + 1);
    g.set(b, (g.get(b) || 0) + 1);
  }
  return g;
}

export function esConexa(aristas) {
  const ady = new Map();
  for (const k of aristas) {
    const [a, b] = k.split('-').map(Number);
    if (!ady.has(a)) ady.set(a, []); if (!ady.has(b)) ady.set(b, []);
    ady.get(a).push(b); ady.get(b).push(a);
  }
  const nodos = [...ady.keys()];
  if (!nodos.length) return false;
  const visto = new Set([nodos[0]]);
  const pila = [nodos[0]];
  while (pila.length) for (const v of ady.get(pila.pop())) if (!visto.has(v)) { visto.add(v); pila.push(v); }
  return visto.size === nodos.length;
}

export function sePuede(aristas) {
  const impares = [...grados(aristas).values()].filter((g) => g % 2).length;
  return esConexa(aristas) && (impares === 0 || impares === 2);
}

function vecinosLibres(n, aristas) {
  const [x, y] = posNodo(n);
  return DIRS.map(([dx, dy]) => [x + dx, y + dy])
    .filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < COLS && ny < FILAS)
    .map(([nx, ny]) => idNodo(nx, ny))
    .filter((m) => !aristas.has(clave(n, m)) && !cruza(n, m, aristas));
}

/** Genera una figura. imposible = true → se añaden líneas hasta que no se pueda de un trazo. */
export function generarFigura(nivel, imposible = false) {
  const largo = Math.min(5 + nivel, 17);
  for (let intento = 0; intento < 500; intento++) {
    const aristas = new Set();
    let actual = idNodo(azar(COLS), azar(FILAS));
    for (let i = 0; i < largo; i++) {
      const libres = vecinosLibres(actual, aristas);
      if (!libres.length) break;
      // Preferimos no alejarnos en diagonal demasiado a menudo
      const sig = libres[azar(libres.length)];
      aristas.add(clave(actual, sig));
      actual = sig;
    }
    if (aristas.size < Math.min(largo, 5)) continue;
    if (imposible) {
      // Añade líneas entre nodos ya usados hasta tener 4 o más puntos impares
      const nodos = [...grados(aristas).keys()];
      for (let k = 0; k < 20 && sePuede(aristas); k++) {
        const n = nodos[azar(nodos.length)];
        const libres = vecinosLibres(n, aristas).filter((m) => nodos.includes(m));
        if (libres.length) aristas.add(clave(n, libres[azar(libres.length)]));
      }
      if (sePuede(aristas) || !esConexa(aristas)) continue;
    } else if (!sePuede(aristas)) continue;
    return { aristas: [...aristas], posible: !imposible };
  }
  return generarFigura(Math.max(1, nivel - 1), imposible);
}

export { clave };
