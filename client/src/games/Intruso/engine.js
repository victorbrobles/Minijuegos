// client/src/games/Intruso/engine.js
// «El Intruso Histórico»: cinco elementos (inventos, obras, hechos…) y uno no encaja en la época o en la categoría.
// Hay 10 segundos para encontrarlo. Acertar da 1 punto y 1 más si se responde en menos de 5 segundos.
// Motor puro (servidor y modo un dispositivo). item: { titulo, emoji, pregunta, opciones: [5], intruso: i, explicacion }
import { crearMotor } from '../comun/simultaneo.js';

export const SEGUNDOS = 10;
export const RAPIDO_MS = 5000;

export const M = crearMotor({
  segundos: () => SEGUNDOS,
  validar(p, item, id, valor) {
    const i = Number(valor?.i);
    if (!Number.isInteger(i) || i < 0 || i >= item.opciones.length) return { ok: false, error: 'Elige uno de los cinco.' };
    return { ok: true, valor: { i, ms: Math.max(0, Number(valor.ms) || 0) } };
  },
  puntuar(p, item, r) {
    const puntos = {}; const aciertos = {}; const elegidas = {};
    Object.entries(r).forEach(([id, v]) => {
      elegidas[id] = v ? v.i : null;
      if (v && v.i === item.intruso) {
        // En línea manda el reloj del servidor; en un dispositivo, el que mide la pantalla
        const ms = p.sinReloj ? v.ms : Math.min(v.ms || Infinity, p.tiempos[id] ?? Infinity);
        puntos[id] = ms < RAPIDO_MS ? 2 : 1;
        aciertos[id] = true;
      }
    });
    return { puntos, aciertos, detalle: { elegidas } };
  },
  vistaItem(p, item, id, fase) {
    return {
      titulo: item.titulo, emoji: item.emoji, pregunta: item.pregunta, opciones: item.opciones,
      mia: p.respuestas[id]?.i ?? null,
      intruso: fase === 'resuelta' ? item.intruso : null,
      explicacion: fase === 'resuelta' ? item.explicacion : null
    };
  }
});
