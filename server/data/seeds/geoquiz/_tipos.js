// server/data/seeds/geoquiz/_tipos.js
// Constructores de preguntas de GeoQuiz. Cada respuesta admite alias separados por «|»
// (el primero es el que se muestra en la solución). Ej.: 'Países Bajos|Holanda'.
//
// Tipos:
//   R   respuesta única         R(prueba, pregunta, 'Canberra', dato?)
//   O   test de 4 opciones      O(prueba, pregunta, 'Correcta', ['Otra', 'Otra', 'Otra'], dato?)
//   E   enumerar                E(prueba, pregunta, ['Francia', 'Países Bajos|Holanda', ...])
//   P   país/lugar con pistas   P(prueba, ['pista 1', ... 'pista 5'], 'Bolivia', dato?)
//   ORD ordenar                 ORD(prueba, pregunta, ['1º', '2º', '3º', '4º', '5º'], 'de mayor a menor')
//   N   aproximación numérica   N(prueba, pregunta, 8849, 'metros', dato?)

export const R = (prueba, pregunta, respuestas, dato) => ({ tipo: 'respuesta', prueba, pregunta, respuestas, dato });
export const O = (prueba, pregunta, correcta, otras, dato) => ({ tipo: 'opciones', prueba, pregunta, correcta, opciones: [correcta, ...otras], dato });
export const E = (prueba, pregunta, elementos, dato) => ({ tipo: 'enumerar', prueba, pregunta, elementos, dato });
export const P = (prueba, pistas, respuestas, dato) => ({ tipo: 'pistas', prueba, pregunta: '¿De qué se trata?', pistas, respuestas, dato });
export const ORD = (prueba, pregunta, orden, criterio) => ({ tipo: 'ordenar', prueba, pregunta, orden, criterio });
export const N = (prueba, pregunta, valor, unidad, dato) => ({ tipo: 'numero', prueba, pregunta, valor, unidad, dato });
