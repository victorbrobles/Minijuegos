// client/src/games/Conoce/respuestas.js
// Lógica pura de «Conoce a tus amigos» compartida por el modo local y el servidor (server/routes/conoce.js):
// comparar respuestas parecidas («Fútbol», «futbol», «Furbo» cuentan como la misma) y el bonus de mejor amigo.

export function normalizarRespuesta(str = '') {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Cómo se guarda y se enseña una respuesta: sin espacios sobrantes y EN MAYÚSCULAS. */
export const formatearRespuesta = (str = '') => String(str).trim().replace(/\s+/g, ' ').toUpperCase();

function distancia(a = '', b = '') {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const fila = [i];
    for (let j = 1; j <= b.length; j++) {
      fila[j] = Math.min(prev[j] + 1, fila[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = fila;
  }
  return prev[b.length];
}

/**
 * Dos respuestas son «la misma» si, sin tildes, mayúsculas, signos ni espacios, coinciden o se parecen mucho:
 * hasta 1 letra de diferencia en palabras de 5 letras y hasta 2 a partir de 6 («futbol» ~ «furbo»).
 * También si una es la otra en plural o con artículo («el perro» ~ «perros»).
 */
export function sonRespuestasEquivalentes(r1 = '', r2 = '') {
  const limpiar = (s) => normalizarRespuesta(s).replace(/^(el|la|los|las|un|una|unos|unas) /, '').replace(/\s+/g, '');
  const a = limpiar(r1);
  const b = limpiar(r2);
  if (!a || !b) return false;
  if (a === b) return true;
  const sinPlural = (s) => s.replace(/(es|s)$/, '');
  if (a.length > 3 && b.length > 3 && sinPlural(a) === sinPlural(b)) return true;
  const largo = Math.max(a.length, b.length);
  const corto = Math.min(a.length, b.length);
  if (corto < 4) return false;
  const d = distancia(a, b);
  if (largo <= 4) return false; // «gato» y «pato» son cosas distintas
  if (largo === 5) return d <= 1;
  return d <= 2;
}

/** Respuestas sin repetir (agrupando las parecidas; se queda la primera que se escribió), en orden alfabético. */
export function agruparRespuestasUnicas(listaTextos = []) {
  const unicas = [];
  listaTextos.forEach((txt) => {
    const limpio = formatearRespuesta(txt);
    if (!limpio) return;
    if (!unicas.some((x) => sonRespuestasEquivalentes(x, limpio))) unicas.push(limpio);
  });
  return unicas.sort((a, b) => a.localeCompare(b));
}

/**
 * Puntos de una pareja (A, B) en una ronda. `amigos`: { [jugadorId]: idDeSuMejorAmigo }.
 * Acierto mutuo: +3 a cada uno (+6 para quien eligió al otro como mejor amigo). Solo uno acierta: +2 / −1.
 * Ninguno: −1 cada uno.
 */
export function puntosPareja(aciertaA, aciertaB, idA, idB, amigos = {}) {
  if (aciertaA && aciertaB) {
    const dobleA = amigos[idA] === idB;
    const dobleB = amigos[idB] === idA;
    return { estado: 'os_conoceis', a: dobleA ? 6 : 3, b: dobleB ? 6 : 3, dobleA, dobleB };
  }
  if (aciertaA) return { estado: 'a', a: 2, b: -1, dobleA: false, dobleB: false };
  if (aciertaB) return { estado: 'b', a: -1, b: 2, dobleA: false, dobleB: false };
  return { estado: 'ninguno', a: -1, b: -1, dobleA: false, dobleB: false };
}
