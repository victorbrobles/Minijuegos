// client/src/games/CronoCourier/motor.js
// «Crono-Courier»: ciudad en cuadrícula vista desde arriba. Cada vehículo sigue una ruta fija.
// El jugador programa CUÁNTO ESPERA cada vehículo antes de salir y los SEMÁFOROS de los cruces.
// Al darle a Play todo se mueve a la vez, una casilla por tic. Si dos vehículos coinciden en
// una casilla (o se cruzan de frente), chocan. Todos deben llegar dentro de su hora límite.

export const COLS = 7;
export const FILAS = 9;
export const MAX_ESPERA = 4;

const azar = (n) => Math.floor(Math.random() * n);

// Calles: columnas 1, 3, 5 y filas 1, 4, 7 (el resto son edificios)
export const CALLES_C = [1, 3, 5];
export const CALLES_F = [1, 4, 7];
export const esCalle = (c, f) => CALLES_C.includes(c) || CALLES_F.includes(f);
export const esCruce = (c, f) => CALLES_C.includes(c) && CALLES_F.includes(f);

const VEHICULOS = [
  { emoji: '🚕', nombre: 'Taxi', color: '#facc15' },
  { emoji: '🚌', nombre: 'Autobús', color: '#3b82f6' },
  { emoji: '🚓', nombre: 'Policía', color: '#64748b' },
  { emoji: '🚒', nombre: 'Bomberos', color: '#ef4444' },
  { emoji: '🚗', nombre: 'Coche', color: '#f97316' }
];

/** Ruta en L de un borde de la ciudad a otro (lista de casillas [c, f]). */
function rutaAlAzar() {
  const vertical = Math.random() < 0.5;
  const camino = [];
  if (vertical) {
    const c0 = CALLES_C[azar(3)];
    const deArriba = Math.random() < 0.5;
    const giraEn = Math.random() < 0.55 ? CALLES_F[azar(3)] : null;
    const f0 = deArriba ? 0 : FILAS - 1;
    const df = deArriba ? 1 : -1;
    let c = c0; let f = f0;
    camino.push([c, f]);
    if (giraEn == null) {
      while (f !== (deArriba ? FILAS - 1 : 0)) { f += df; camino.push([c, f]); }
    } else {
      while (f !== giraEn) { f += df; camino.push([c, f]); }
      const dc = c < 3 ? 1 : c > 3 ? -1 : (Math.random() < 0.5 ? 1 : -1);
      while (c !== (dc > 0 ? COLS - 1 : 0)) { c += dc; camino.push([c, f]); }
    }
  } else {
    const f0 = CALLES_F[azar(3)];
    const deIzq = Math.random() < 0.5;
    const giraEn = Math.random() < 0.55 ? CALLES_C[azar(3)] : null;
    const c0 = deIzq ? 0 : COLS - 1;
    const dc = deIzq ? 1 : -1;
    let c = c0; let f = f0;
    camino.push([c, f]);
    if (giraEn == null) {
      while (c !== (deIzq ? COLS - 1 : 0)) { c += dc; camino.push([c, f]); }
    } else {
      while (c !== giraEn) { c += dc; camino.push([c, f]); }
      const df = f < 4 ? 1 : f > 4 ? -1 : (Math.random() < 0.5 ? 1 : -1);
      while (f !== (df > 0 ? FILAS - 1 : 0)) { f += df; camino.push([c, f]); }
    }
  }
  return camino;
}

/**
 * Simula la programación. plan = { esperas: [n], semaforos: { 'c,f': 0|1 } }
 * Semáforo en fase 0: verde para el tráfico horizontal en tics pares y vertical en impares; fase 1 al revés.
 * Un vehículo que va a entrar en un cruce con semáforo rojo espera en su casilla.
 * Devuelve { pasos: [[{c,f,activo,llegado}]], choque: {tic, c, f, ids} | null, llegadas: [tic], retrasos: [ids] }
 */
export function simular(nivel, plan, maxTics = 40) {
  const { vehiculos, semaforos } = nivel;
  const n = vehiculos.length;
  const pos = vehiculos.map(() => -1); // índice dentro de la ruta (-1 = no ha salido)
  const llegadas = vehiculos.map(() => null);
  const pasos = [];
  const foto = () => vehiculos.map((v, i) => {
    const k = pos[i];
    if (k < 0) return { c: v.ruta[0][0], f: v.ruta[0][1], activo: false, llegado: false };
    const [c, f] = v.ruta[Math.min(k, v.ruta.length - 1)];
    return { c, f, activo: llegadas[i] == null, llegado: llegadas[i] != null };
  });
  pasos.push(foto());
  for (let t = 1; t <= maxTics; t++) {
    const anterior = [...pos];
    for (let i = 0; i < n; i++) {
      if (llegadas[i] != null) continue;
      if (pos[i] < 0) {
        if (t > plan.esperas[i]) pos[i] = 0;
        continue;
      }
      const sig = vehiculos[i].ruta[pos[i] + 1];
      if (!sig) continue;
      const clave = `${sig[0]},${sig[1]}`;
      if (semaforos.includes(clave)) {
        const [c0] = vehiculos[i].ruta[pos[i]];
        const horizontal = c0 !== sig[0];
        const fase = plan.semaforos[clave] || 0;
        const verdeHorizontal = (Math.floor(t / 2) + fase) % 2 === 0;
        if (horizontal !== verdeHorizontal) continue; // rojo: espera
      }
      pos[i] += 1;
    }
    for (let i = 0; i < n; i++) {
      if (llegadas[i] == null && pos[i] === vehiculos[i].ruta.length - 1) llegadas[i] = t;
    }
    const f = foto();
    pasos.push(f);
    // Choques: misma casilla entre vehículos en circulación (los que acaban de llegar aún cuentan ese tic)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const enI = pos[i] >= 0 && (llegadas[i] == null || llegadas[i] === t);
        const enJ = pos[j] >= 0 && (llegadas[j] == null || llegadas[j] === t);
        if (!enI || !enJ) continue;
        const a = f[i]; const b = f[j];
        if (a.c === b.c && a.f === b.f) return { pasos, choque: { tic: t, c: a.c, f: a.f, ids: [i, j] }, llegadas, retrasos: [] };
        // Cruce de frente (intercambian casillas)
        if (anterior[i] >= 0 && anterior[j] >= 0) {
          const ai = vehiculos[i].ruta[anterior[i]]; const aj = vehiculos[j].ruta[anterior[j]];
          if (ai[0] === b.c && ai[1] === b.f && aj[0] === a.c && aj[1] === a.f) {
            return { pasos, choque: { tic: t, c: a.c, f: a.f, ids: [i, j] }, llegadas, retrasos: [] };
          }
        }
      }
    }
    if (llegadas.every((x) => x != null)) break;
  }
  const retrasos = vehiculos.map((v, i) => i).filter((i) => llegadas[i] == null || llegadas[i] > vehiculos[i].limite);
  return { pasos, choque: null, llegadas, retrasos };
}

export const exito = (r) => !r.choque && !r.retrasos.length;

function* todasLasEsperas(n) {
  const e = new Array(n).fill(0);
  while (true) {
    yield [...e];
    let k = 0;
    while (k < n && e[k] === MAX_ESPERA) { e[k] = 0; k++; }
    if (k === n) return;
    e[k]++;
  }
}

/** Genera un nivel con solución que no sea «no tocar nada». */
export function generarNivel(numero) {
  const n = Math.min(2 + Math.floor((numero + 1) / 2), 5);
  const numSemaforos = numero >= 3 ? Math.min(1 + Math.floor((numero - 3) / 3), 2) : 0;
  for (let intento = 0; intento < 600; intento++) {
    const rutas = [];
    while (rutas.length < n) {
      const r = rutaAlAzar();
      // Que no empiecen en la misma casilla ni sean la misma calle en el mismo sentido
      if (rutas.some((o) => o[0][0] === r[0][0] && o[0][1] === r[0][1])) continue;
      if (rutas.some((o) => o[o.length - 1][0] === r[r.length - 1][0] && o[o.length - 1][1] === r[r.length - 1][1])) continue;
      rutas.push(r);
    }
    // Cruces por los que pasan al menos dos rutas → candidatos a semáforo
    const uso = {};
    rutas.forEach((r) => r.forEach(([c, f]) => { if (esCruce(c, f)) uso[`${c},${f}`] = (uso[`${c},${f}`] || 0) + 1; }));
    const compartidos = Object.keys(uso).filter((k) => uso[k] >= 2).sort(() => Math.random() - 0.5);
    if (!compartidos.length) continue;
    const semaforos = compartidos.slice(0, numSemaforos);
    const holgura = numero <= 2 ? 4 : numero <= 5 ? 3 : 2;
    const tipos = [...VEHICULOS.slice(1)].sort(() => Math.random() - 0.5);
    const vehiculos = rutas.map((ruta, i) => ({
      ...(i === 0 ? { emoji: '🚐', nombre: 'Tu furgoneta', color: '#22c55e', courier: true } : tipos[(i - 1) % tipos.length]),
      ruta,
      limite: ruta.length - 1 + holgura + (semaforos.length ? 2 : 0)
    }));
    const nivel = { numero, vehiculos, semaforos };
    // Sin tocar nada tiene que chocar
    const base = simular(nivel, { esperas: new Array(n).fill(0), semaforos: {} });
    if (!base.choque) continue;
    // Buscar soluciones (con todas las combinaciones de semáforos)
    let soluciones = 0; let total = 0; let ejemplo = null;
    const fasesSem = semaforos.length === 0 ? [{}] : semaforos.length === 1
      ? [{ [semaforos[0]]: 0 }, { [semaforos[0]]: 1 }]
      : [0, 1, 2, 3].map((m) => ({ [semaforos[0]]: m & 1, [semaforos[1]]: (m >> 1) & 1 }));
    for (const esperas of todasLasEsperas(n)) {
      for (const sem of fasesSem) {
        total++;
        if (exito(simular(nivel, { esperas, semaforos: sem }))) { soluciones++; if (!ejemplo) ejemplo = { esperas, semaforos: sem }; }
      }
    }
    if (!soluciones) continue;
    const ratio = soluciones / total;
    const maxRatio = numero <= 2 ? 0.5 : numero <= 5 ? 0.3 : 0.15;
    if (ratio > maxRatio) continue;
    return { ...nivel, ejemplo, ratio };
  }
  return null;
}
