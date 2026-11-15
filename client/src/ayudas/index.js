// client/src/ayudas/index.js
// Ayudas de todos los juegos, por id. Cada ayuda es un objeto con (todo opcional):
//   objetivo: 'texto'                        → recuadro «Objetivo»
//   chips: ['📱 …']                           → etiquetas extra bajo el título
//   pasos: ['…']                              → «Paso a paso» numerado (tituloPasos para cambiar el título)
//   secciones: [{ icono, titulo, color, texto, items: ['…'], tabla: [[icono, texto, valor?]] }]
//   puntos: [[icono, concepto, valor]]        → «Puntuación» (valor en verde si suma, rojo si resta)
//   notasPuntos: ['…'], tituloPuntos
//   gana: 'texto'                             → recuadro «¿Quién gana?»
//   consejos: ['…']
// En los textos, **así** se escribe en negrita. Colores: azul, violeta, verde, rosa, naranja, cian, rojo, ambar.
import a from './a.js';
import b from './b.js';
import c from './c.js';
import d from './d.js';

export const AYUDAS = { ...a, ...b, ...c, ...d };
