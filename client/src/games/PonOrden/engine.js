// client/src/games/PonOrden/engine.js
// «Ponlo en orden»: seis elementos (inventos, ríos, películas…) para ordenar según un criterio (cronológico, tamaño,
// distancia…). Todos responden a la vez; cada posición acertada es un punto y el orden perfecto vale 10.
// Motor puro (servidor y modo un dispositivo). item: { titulo, emoji, criterio, unidad, elementos: [{ nombre, valor }] }
// (los elementos vienen desordenados; la solución se calcula con el valor y `desc`).
import { crearMotor } from '../comun/simultaneo.js';

export const SEGUNDOS = 75;
export const PERFECTO = 10;

/** Índices de `elementos` en el orden correcto. */
export const solucion = (item) => item.elementos.map((e, i) => [e.valor, i]).sort((a, b) => (item.desc ? b[0] - a[0] : a[0] - b[0])).map(([, i]) => i);
/** Puntos de un orden propuesto (lista de índices). */
export function puntosOrden(item, orden) {
  if (!Array.isArray(orden)) return { aciertos: 0, puntos: 0 };
  const s = solucion(item);
  const aciertos = s.filter((x, k) => orden[k] === x).length;
  return { aciertos, puntos: aciertos === s.length ? PERFECTO : aciertos };
}

export const M = crearMotor({
  segundos: () => SEGUNDOS,
  validar(p, item, id, orden) {
    const n = item.elementos.length;
    if (!Array.isArray(orden) || orden.length !== n || new Set(orden).size !== n || orden.some((x) => !Number.isInteger(x) || x < 0 || x >= n)) {
      return { ok: false, error: 'Ordena los seis elementos antes de enviar.' };
    }
    return { ok: true, valor: orden };
  },
  puntuar(p, item, r) {
    const puntos = {}; const aciertos = {}; const detalle = { solucion: solucion(item), porJugador: {} };
    Object.entries(r).forEach(([id, orden]) => {
      const x = puntosOrden(item, orden);
      puntos[id] = x.puntos;
      aciertos[id] = x.aciertos === item.elementos.length;
      detalle.porJugador[id] = { orden, aciertos: x.aciertos };
    });
    return { puntos, aciertos, detalle };
  },
  vistaItem(p, item, id, fase) {
    return {
      titulo: item.titulo, emoji: item.emoji, criterio: item.criterio, unidad: item.unidad,
      elementos: item.elementos.map((e) => ({ nombre: e.nombre, valor: fase === 'resuelta' ? e.valor : undefined })),
      mio: p.respuestas[id] ?? null
    };
  }
});
