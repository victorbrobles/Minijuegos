// client/src/lib/avatar3d.js
// Imágenes de los avatares 3D. Cada avatar se dibuja UNA vez (con lib/avatar3dEscena.js, que carga three.js solo
// si hace falta) y la imagen se guarda en memoria y en el navegador: el resto de la web usa esa imagen, así que da
// igual cuántos jugadores haya en pantalla. Si el dispositivo no puede dibujar en 3D, se queda el avatar en SVG.

const PREFIJO = 'av3d:v1:';
const INDICE = 'av3d:v1:indice';
const MAX_GUARDADAS = 70;
const memoria = new Map();
const pendientes = new Map(); // clave → [callbacks]
const cola = [];
let motor = null; let roto = false; let trabajando = false;

/** Tamaños de imagen (px) según el modo. */
const ANCHO = { cara: 160, cuerpo: 260, mini: 96 };

export const claveAvatar = (a, modo) => `${modo}:${Object.keys(a).sort().map((k) => `${k}${a[k]}`).join('')}`;

function leerGuardada(clave) {
  try { return localStorage.getItem(PREFIJO + clave); } catch { return null; }
}
function guardar(clave, url) {
  try {
    const idx = JSON.parse(localStorage.getItem(INDICE) || '[]').filter((k) => k !== clave);
    idx.push(clave);
    while (idx.length > MAX_GUARDADAS) localStorage.removeItem(PREFIJO + idx.shift());
    localStorage.setItem(PREFIJO + clave, url);
    localStorage.setItem(INDICE, JSON.stringify(idx));
  } catch { /* lleno o sin almacenamiento: solo en memoria */ }
}

/** La imagen ya hecha (memoria o navegador) o null. */
export function imagenAvatar(a, modo = 'cara') {
  const clave = claveAvatar(a, modo);
  if (memoria.has(clave)) return memoria.get(clave);
  const g = leerGuardada(clave);
  if (g) { memoria.set(clave, g); return g; }
  return null;
}

async function procesar() {
  if (trabajando) return;
  trabajando = true;
  try {
    if (!motor) motor = await import('./avatar3dEscena.js');
    while (cola.length) {
      const { clave, a, modo } = cola.shift();
      let url = null;
      try { url = motor.fotoAvatar(a, modo === 'mini' ? 'cara' : modo, ANCHO[modo] || 160); } catch { roto = true; }
      if (url) { memoria.set(clave, url); guardar(clave, url); }
      (pendientes.get(clave) || []).forEach((f) => f(url));
      pendientes.delete(clave);
      if (roto) break;
      // Deja respirar a la página entre avatar y avatar
      await new Promise((r) => setTimeout(r, 0));
    }
  } catch { roto = true; }
  if (roto) { pendientes.forEach((fs) => fs.forEach((f) => f(null))); pendientes.clear(); cola.length = 0; }
  trabajando = false;
}

/** Pide la imagen; `listo(url | null)` se llama cuando esté. Devuelve una función para cancelar el aviso. */
export function pedirAvatar(a, modo, listo) {
  if (roto || typeof document === 'undefined') { listo(null); return () => {}; }
  const clave = claveAvatar(a, modo);
  const hecha = imagenAvatar(a, modo);
  if (hecha) { listo(hecha); return () => {}; }
  if (!pendientes.has(clave)) { pendientes.set(clave, []); cola.push({ clave, a: { ...a }, modo }); }
  pendientes.get(clave).push(listo);
  procesar();
  return () => { const l = pendientes.get(clave); if (l) { const i = l.indexOf(listo); if (i >= 0) l.splice(i, 1); } };
}
