// client/src/lib/ajustes.js
// Ajustes de accesibilidad de este navegador: tamaño de letra, alto contraste y reducir animaciones.
// Se aplican como clases en <html> (ver styles/accesibilidad.css) en cuanto carga la web.
const CLAVE = 'minijuegos_ajustes';
export const LETRAS = [['normal', 'Normal', '100%'], ['grande', 'Grande', '112.5%'], ['enorme', 'Muy grande', '125%']];
export const PREDETERMINADOS = { letra: 'normal', contraste: false, animaciones: 'sistema', castigo: 'familiar' }; // animaciones: sistema | menos | todas · castigo: familiar | adultos | no

export function leerAjustes() {
  try { return { ...PREDETERMINADOS, ...JSON.parse(localStorage.getItem(CLAVE) || '{}') }; } catch { return { ...PREDETERMINADOS }; }
}
export function aplicarAjustes(a = leerAjustes()) {
  const h = document.documentElement;
  const letra = LETRAS.find(([id]) => id === a.letra) || LETRAS[0];
  h.style.fontSize = letra[2] === '100%' ? '' : letra[2];
  h.classList.toggle('alto-contraste', Boolean(a.contraste));
  const sistemaMenos = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  h.classList.toggle('sin-animaciones', a.animaciones === 'menos' || (a.animaciones === 'sistema' && sistemaMenos));
}
export function guardarAjustes(a) {
  try { localStorage.setItem(CLAVE, JSON.stringify(a)); } catch { /* sin almacenamiento: se aplica solo ahora */ }
  aplicarAjustes(a);
}
