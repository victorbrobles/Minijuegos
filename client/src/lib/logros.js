// client/src/lib/logros.js
// Comprueba si hay logros nuevos (tras guardar una partida) y lo avisa con el evento «minijuegos-logro».
import { nombreCompleto } from './identidad.js';

const clave = (yo) => `minijuegos_logros_${yo}`;
export async function cargarLogros(yo = nombreCompleto()) {
  if (!yo) return [];
  const r = await fetch(`/api/registros/logros?nombre=${encodeURIComponent(yo)}`);
  if (!r.ok) return [];
  return (await r.json()).logros || [];
}
export async function comprobarLogros() {
  const yo = nombreCompleto();
  if (!yo) return;
  try {
    const logros = await cargarLogros(yo);
    const ahora = logros.filter((l) => l.conseguido).map((l) => l.id);
    let antes = null;
    try { antes = JSON.parse(localStorage.getItem(clave(yo))); } catch { antes = null; }
    try { localStorage.setItem(clave(yo), JSON.stringify(ahora)); } catch { /* nada */ }
    if (!Array.isArray(antes)) return; // primera vez en este navegador: no se avisa de todo lo antiguo
    const nuevos = logros.filter((l) => l.conseguido && !antes.includes(l.id));
    if (nuevos.length) window.dispatchEvent(new CustomEvent('minijuegos-logro', { detail: nuevos }));
  } catch { /* sin red */ }
}

/** Al abrir la app: si este navegador aún no tiene la lista de referencia, la guarda (sin avisar de nada). */
export async function prepararLogros() {
  const yo = nombreCompleto();
  if (!yo) return;
  try { if (localStorage.getItem(clave(yo))) return; } catch { return; }
  try {
    const ids = (await cargarLogros(yo)).filter((l) => l.conseguido).map((l) => l.id);
    localStorage.setItem(clave(yo), JSON.stringify(ids));
  } catch { /* sin red */ }
}
