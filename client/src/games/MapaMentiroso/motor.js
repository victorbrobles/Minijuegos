// client/src/games/MapaMentiroso/motor.js
// Genera un mapa con pueblos y una ruta de indicaciones (Norte, Sur, Este, Oeste).
// Giros por nivel: brújula girada (el norte no está arriba) y una indicación invertida.
export const LADO = 5;

export const DIRECCIONES = {
  N: { nombre: 'Norte', v: [0, -1] },
  S: { nombre: 'Sur', v: [0, 1] },
  E: { nombre: 'Este', v: [1, 0] },
  O: { nombre: 'Oeste', v: [-1, 0] }
};
const OPUESTA = { N: 'S', S: 'N', E: 'O', O: 'E' };

const PUEBLOS = [
  ['🏰', 'Castillo'], ['⛪', 'Ermita'], ['🏭', 'Fábrica'], ['🏡', 'Granja'], ['🗼', 'Torre'], ['⛲', 'Fuente'],
  ['🌲', 'Bosque'], ['🏟️', 'Estadio'], ['⚓', 'Puerto'], ['🎪', 'Circo'], ['🏛️', 'Museo'], ['🗿', 'Estatua'],
  ['🌋', 'Volcán'], ['🏕️', 'Campamento'], ['🎡', 'Feria'], ['🛖', 'Cabaña']
];

const azar = (n) => Math.floor(Math.random() * n);
const barajar = (l) => [...l].sort(() => Math.random() - 0.5);

/** Gira un vector de pantalla `cuartos` cuartos de vuelta en sentido horario */
export const girar = ([x, y], cuartos) => {
  let v = [x, y];
  for (let i = 0; i < ((cuartos % 4) + 4) % 4; i++) v = [-v[1], v[0]];
  return v;
};

export function configuracion(nivel) {
  return {
    movimientos: Math.min(2 + Math.floor(nivel / 2), 6),
    giro: nivel >= 3 ? 1 + azar(3) : 0, // cuartos de vuelta de la rosa de los vientos
    invertida: nivel >= 5,
    memorizar: 3.5 + Math.min(2 + Math.floor(nivel / 2), 6) * 1.1
  };
}

export function generarRuta(nivel) {
  const c = configuracion(nivel);
  for (let intento = 0; intento < 500; intento++) {
    const inicio = [azar(LADO), azar(LADO)];
    let pos = [...inicio];
    const pasos = [];
    const invertida = c.invertida ? azar(c.movimientos) : -1;
    let ok = true;
    for (let i = 0; i < c.movimientos; i++) {
      const opciones = barajar(Object.keys(DIRECCIONES)).filter((d) => !pasos.length || d !== OPUESTA[pasos[pasos.length - 1].dir]);
      let hecho = false;
      for (const dir of opciones) {
        const n = 1 + azar(2);
        // Movimiento real en pantalla: dirección dicha (invertida si toca) girada según la brújula
        const real = i === invertida ? OPUESTA[dir] : dir;
        const [dx, dy] = girar(DIRECCIONES[real].v, c.giro);
        const nx = pos[0] + dx * n; const ny = pos[1] + dy * n;
        if (nx < 0 || ny < 0 || nx >= LADO || ny >= LADO) continue;
        pasos.push({ dir, n });
        pos = [nx, ny];
        hecho = true;
        break;
      }
      if (!hecho) { ok = false; break; }
    }
    if (!ok || (pos[0] === inicio[0] && pos[1] === inicio[1])) continue;
    // Pueblos: salida, llegada y otros 5 al azar
    const lugares = barajar(PUEBLOS);
    const ocupadas = new Set([`${inicio}`, `${pos}`]);
    const pueblos = [
      { x: inicio[0], y: inicio[1], emoji: lugares[0][0], nombre: lugares[0][1], salida: true },
      { x: pos[0], y: pos[1], emoji: lugares[1][0], nombre: lugares[1][1], destino: true }
    ];
    let k = 2;
    while (pueblos.length < 7) {
      const p = [azar(LADO), azar(LADO)];
      if (ocupadas.has(`${p}`)) continue;
      ocupadas.add(`${p}`);
      pueblos.push({ x: p[0], y: p[1], emoji: lugares[k][0], nombre: lugares[k][1] });
      k++;
    }
    return { ...c, pasos, invertida, pueblos: barajar(pueblos), destino: pos };
  }
  throw new Error('Sin ruta');
}

export const textoPaso = (p) => `${p.n} ${p.n === 1 ? 'casilla' : 'casillas'} al ${DIRECCIONES[p.dir].nombre}`;
