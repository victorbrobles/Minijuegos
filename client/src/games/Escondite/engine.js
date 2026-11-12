// client/src/games/Escondite/engine.js
// «El Escondite»: sale una categoría con pocas respuestas posibles (de 5 a 11). Cada ronda un jugador es el
// ESCONDIDO: elige en secreto una de ellas intentando que nadie la adivine. Los demás intentan adivinar cuál ha
// elegido. Si nadie la adivina, el escondido suma 1; si alguien la adivina, el escondido no suma y los que la
// adivinan suman 1. Las respuestas que no están en la lista no valen: se recuerda cuáles son las posibles.
// Motor puro: lo usan el servidor (server/routes/escondite.js) y el modo un dispositivo.
import { crearMotor, buscarOpcion, nombreOpcion } from '../comun/simultaneo.js';

export const SEGUNDOS = 60;

/** Mínimo de respuestas posibles de la categoría según los jugadores (con muchos, nada de categorías de 5). */
export const minimoOpciones = (n) => (n >= 11 ? 9 : n >= 9 ? 8 : n >= 7 ? 7 : n >= 5 ? 6 : 5);

const escondidoDe = (p) => {
  const lista = p.jugadores;
  for (let k = 0; k < lista.length; k++) {
    const j = lista[(p.ronda - 1 + k) % lista.length];
    if (!j.fuera) return j.id;
  }
  return lista[0].id;
};

export const M = crearMotor({
  segundos: () => SEGUNDOS,
  alEmpezar(p) { p.ext.escondido = escondidoDe(p); },
  validar(p, item, id, texto) {
    const i = buscarOpcion(texto, item.opciones);
    if (i < 0) {
      return {
        ok: false,
        error: `«${String(texto).trim()}» no es una de las respuestas posibles.`,
        opciones: item.opciones.map(nombreOpcion)
      };
    }
    return { ok: true, valor: i };
  },
  puntuar(p, item, r) {
    const esc = p.ext.escondido;
    const elegida = r[esc];
    const buscadores = p.jugadores.filter((j) => !j.fuera && j.id !== esc).map((j) => j.id);
    const puntos = {}; const aciertos = {};
    let pillado = false;
    if (elegida != null) {
      buscadores.forEach((id) => { if (r[id] === elegida) { puntos[id] = 1; aciertos[id] = true; pillado = true; } });
      if (!pillado) { puntos[esc] = 1; aciertos[esc] = true; }
    }
    return {
      puntos, aciertos,
      detalle: {
        escondido: esc, elegida, pillado, sinRespuesta: elegida == null,
        respuestas: Object.fromEntries(Object.entries(r).map(([id, v]) => [id, v == null ? null : nombreOpcion(item.opciones[v])]))
      }
    };
  },
  vistaItem(p, item, id, fase) {
    const esc = p.ext.escondido;
    const r = p.respuestas[id];
    return {
      titulo: item.titulo, emoji: item.emoji, nOpciones: item.opciones.length, escondido: esc,
      soyEscondido: id === esc,
      mia: r == null ? null : nombreOpcion(item.opciones[r]),
      opciones: fase === 'resuelta' ? item.opciones.map(nombreOpcion) : null
    };
  }
});
