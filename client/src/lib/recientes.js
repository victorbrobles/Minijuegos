// client/src/lib/recientes.js
// Últimos juegos abiertos por el jugador (solo en su navegador).
const CLAVE = 'minigames_recientes';
const MAX = 8;

export function leerRecientes() {
  try {
    const lista = JSON.parse(localStorage.getItem(CLAVE));
    return Array.isArray(lista) ? lista.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function registrarReciente(id) {
  if (!id) return;
  try {
    const lista = [id, ...leerRecientes().filter((x) => x !== id)].slice(0, MAX);
    localStorage.setItem(CLAVE, JSON.stringify(lista));
  } catch { /* almacenamiento no disponible: se ignora */ }
}

export function borrarRecientes() {
  try { localStorage.removeItem(CLAVE); } catch { /* nada */ }
}
