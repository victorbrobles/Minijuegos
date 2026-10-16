// Mejor puntuación guardada en el navegador, una por categoría (null = todas mezcladas).
const clave = (categoria) => `siglas-mejor-${categoria ?? 'todas'}`;

export function leerRecord(categoria) {
  try {
    return Number(localStorage.getItem(clave(categoria))) || 0;
  } catch {
    return 0;
  }
}

export function guardarRecord(categoria, puntos) {
  try {
    localStorage.setItem(clave(categoria), String(puntos));
  } catch { /* sin acceso al almacenamiento */ }
}
