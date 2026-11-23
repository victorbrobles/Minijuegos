// client/src/games/Habilidad/minijuegos/index.js
// Catálogo de los 40 minijuegos de «Test de habilidad» (en el orden en que se muestran).
import A from './a.jsx';
import B from './b.jsx';
import C from './c.jsx';
import D from './d.jsx';
import E from './e.jsx';
import F from './f.jsx';
import G from './g.jsx';

export const MINIJUEGOS = [...A, ...B, ...C, ...D, ...E, ...F, ...G];
export const POR_ID = Object.fromEntries(MINIJUEGOS.map((j) => [j.id, j]));
