// client/src/games/Excusas/motor.js
import { HECHOS, SUJETOS, ACCIONES, OBJETOS, PREGUNTAS } from './datos.js';

export const DIAS = 10;
const barajar = (l) => [...l].sort(() => Math.random() - 0.5);

export function nuevaPartida() {
  const claves = barajar(Object.keys(HECHOS));
  return {
    dia: 1,
    credibilidad: 100,
    // Lo que el jefe sabe que NO es verdad (empieza sabiendo 3 cosas)
    sabe: claves.slice(0, 3),
    porRevelar: claves.slice(3),
    afirmados: [], // hechos que tú has afirmado (ya no se pueden revelar como falsos)
    usados: [], // textos de sujetos y objetos ya usados
    preguntas: barajar(PREGUNTAS),
    opciones: null
  };
}

const contradice = (pieza, sabe) => pieza.hecho && sabe.includes(pieza.hecho);

/** Tres opciones por fila; siempre al menos una que no contradiga lo que sabe el jefe. */
export function generarOpciones(estado) {
  const elegir = (lista) => {
    let ops = barajar(lista).slice(0, 3);
    if (ops.every((p) => contradice(p, estado.sabe))) {
      const buena = barajar(lista).find((p) => !contradice(p, estado.sabe));
      ops = [buena, ...ops.slice(1)];
    }
    return barajar(ops);
  };
  return {
    sujetos: elegir(SUJETOS),
    acciones: barajar(ACCIONES).slice(0, 3),
    objetos: elegir(OBJETOS)
  };
}

/** Evalúa la excusa. Devuelve { penalizacion, motivo, tipo: 'pillado' | 'repetida' | 'absurda' | 'ok' } */
export function evaluar(estado, sujeto, objeto) {
  const pieza = [sujeto, objeto].find((p) => contradice(p, estado.sabe));
  if (pieza) return { tipo: 'pillado', penalizacion: 50, hecho: pieza.hecho };
  if (sujeto.hecho && sujeto.hecho === objeto.hecho) return { tipo: 'absurda', penalizacion: 20 };
  const repetida = [sujeto.texto, objeto.texto].find((t) => estado.usados.includes(t));
  if (repetida) return { tipo: 'repetida', penalizacion: 15, texto: repetida };
  return { tipo: 'ok', penalizacion: 0 };
}

/** Aplica la excusa y, a veces, el jefe descubre algo nuevo de ti. */
export function avanzar(estado, sujeto, objeto, resultado) {
  const afirmados = [...estado.afirmados, ...[sujeto.hecho, objeto.hecho].filter(Boolean)];
  let { sabe, porRevelar } = estado;
  let revelado = null;
  const candidatos = porRevelar.filter((h) => !afirmados.includes(h));
  if (candidatos.length && Math.random() < 0.55) {
    revelado = candidatos[Math.floor(Math.random() * candidatos.length)];
    sabe = [...sabe, revelado];
    porRevelar = porRevelar.filter((h) => h !== revelado);
  }
  return {
    ...estado,
    dia: estado.dia + 1,
    credibilidad: Math.max(0, estado.credibilidad - resultado.penalizacion),
    sabe,
    porRevelar,
    afirmados,
    usados: [...estado.usados, sujeto.texto, objeto.texto],
    revelado
  };
}
