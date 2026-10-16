import { useSyncExternalStore } from 'react';

// Sesión de administrador: el servidor devuelve un token firmado al introducir un código MFA válido.
// Se guarda en el navegador y se envía en la cabecera X-Admin-Token. El código nunca se guarda aquí.
const CLAVE_ALMACEN = 'minigames-admin-token';
const oyentes = new Set();

function leer() {
  try { return localStorage.getItem(CLAVE_ALMACEN); } catch { return null; }
}
let token = leer();

function guardar(nuevo) {
  token = nuevo;
  try {
    if (nuevo) localStorage.setItem(CLAVE_ALMACEN, nuevo);
    else localStorage.removeItem(CLAVE_ALMACEN);
  } catch { /* sin acceso al almacenamiento */ }
  oyentes.forEach((f) => f());
}

export const adminHeaders = () => (token ? { 'X-Admin-Token': token } : {});

// Devuelve true si el código era correcto. Lanza Error con mensaje si hay bloqueo o fallo de red.
export async function activarAdmin(codigo) {
  let res;
  try {
    res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo })
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor.');
  }
  if (res.status === 429) throw new Error('Demasiados intentos. Espera unos minutos.');
  if (res.status === 503) throw new Error('El modo administrador no está configurado en el servidor.');
  if (!res.ok) return false;
  guardar((await res.json()).token);
  return true;
}

export const salirAdmin = () => guardar(null);

// Comprueba que el token guardado sigue siendo válido (caduca a las 12 h o si se regenera el MFA)
export async function comprobarSesionAdmin() {
  if (!token) return;
  try {
    const res = await fetch('/api/admin/status', { headers: adminHeaders() });
    if (res.ok && !(await res.json()).admin) guardar(null);
  } catch { /* sin servidor: se mantiene */ }
}

export function useAdmin() {
  return useSyncExternalStore(
    (f) => { oyentes.add(f); return () => oyentes.delete(f); },
    () => token !== null
  );
}
