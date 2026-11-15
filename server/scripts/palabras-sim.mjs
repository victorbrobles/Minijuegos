// Simulación de «Palabra a palabra» y «Letras en cadena»: bancos válidos, colores con letras repetidas y raíces.
import { existe, normalizar, partidaPalabra, partidaLetras, objetivosValidos, raicesValidas, ESCALONES } from '../lib/palabras.js';
import { OBJETIVOS } from '../data/palabras/banco.js';
let mal = 0; const fallo = (m) => { mal++; console.log('FALLO', m); };
// Colorear (misma función que el cliente, copiada para no depender de React)
function colorear(intento, objetivo) {
  const res = Array(intento.length).fill('g'); const quedan = {};
  for (let i = 0; i < objetivo.length; i++) { if (intento[i] === objetivo[i]) res[i] = 'v'; else quedan[objetivo[i]] = (quedan[objetivo[i]] || 0) + 1; }
  for (let i = 0; i < intento.length; i++) if (res[i] !== 'v' && quedan[intento[i]]) { res[i] = 'a'; quedan[intento[i]]--; }
  return res.join('');
}
if (colorear('casa', 'saco') !== 'avag') fallo('colores casa/saco ' + colorear('casa', 'saco'));
if (colorear('llama', 'lapiz') !== 'vgagg') fallo('colores llama/lapiz ' + colorear('llama', 'lapiz'));
if (colorear('aaa', 'ana') !== 'vgv') fallo('colores aaa/ana');
if (normalizar('Camión') !== 'camion' || normalizar('PINGÜINO') !== 'pinguino' || normalizar('Niño') !== 'niño') fallo('normalizar');
if (!existe('ratón') || existe('qzxw')) fallo('existe');
const o = objetivosValidos();
for (const n of [3, 4, 5, 6, 7, 8]) {
  if (o[n].length < 30) fallo(`pocas palabras de ${n}: ${o[n].length}`);
  if (o[n].some((p) => p.length !== n)) fallo(`longitud mal en ${n}`);
  const fuera = [...new Set(OBJETIVOS[n])].filter((p) => !o[n].includes(p));
  if (fuera.length) console.log(`  (${n} letras, no están en el diccionario y se descartan: ${fuera.join(', ')})`);
}
for (let k = 0; k < 200; k++) {
  const { palabras } = partidaPalabra();
  ESCALONES.forEach((n, i) => { if (palabras[i].length !== n) fallo(`escalón ${i} con ${palabras[i]}`); });
  if (new Set(palabras.slice(0, 30)).size !== 30) fallo('palabras repetidas en una partida');
}
const r = raicesValidas(); if (r.length < 30) fallo('pocas raíces ' + r.length);
for (let k = 0; k < 100; k++) {
  const L = partidaLetras();
  if (L.letras.length !== 7) fallo('no son 7 letras');
  if (!L.secretas.length || L.secretas[0].length !== 7) fallo('sin palabra de 7');
  if ([...L.secretas[0]].sort().join('') !== [...L.letras].sort().join('')) fallo('la raíz no usa las 7 letras');
  if (L.validas.length < 80) fallo('pocas válidas');
}
console.log(`objetivos: ${[3, 4, 5, 6, 7, 8].map((n) => `${n}→${o[n].length}`).join(' ')} · raíces: ${r.length}`);
if (mal) process.exit(1);
console.log('Juegos de palabras: OK');
