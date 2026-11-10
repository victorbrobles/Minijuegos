// client/src/lib/centrarActivo.js
// Centra el jugador activo dentro de la fila del marcador moviendo SOLO esa fila.
// (scrollIntoView también desplazaba la página y descuadraba la cabecera en el móvil.)
export function centrarActivo(contenedor, selector = '.activo') {
  const el = contenedor?.querySelector(selector);
  if (!el) return;
  // La fila que se desplaza: el antecesor más cercano (hasta `contenedor`) con contenido más ancho que él
  let fila = el.parentElement;
  while (fila && fila !== contenedor && fila.scrollWidth <= fila.clientWidth) fila = fila.parentElement;
  if (!fila || fila.scrollWidth <= fila.clientWidth) return;
  const izq = el.getBoundingClientRect().left - fila.getBoundingClientRect().left + fila.scrollLeft;
  const destino = izq - (fila.clientWidth - el.offsetWidth) / 2;
  fila.scrollTo({ left: Math.max(0, destino), behavior: 'smooth' });
}
