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

// Devuelve true si el código era correcto, false si es incorrecto.
// Lanza Error con un mensaje claro si hay bloqueo, el servidor no tiene el MFA configurado o falla la red.
export async function activarAdmin(codigo) {
  let res;
  try {
    res = await fetch('/api/admin/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo })
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor.');
  }
  let datos = null;
  try { datos = await res.json(); } catch { /* la respuesta no era JSON (p. ej. una página de error del hosting) */ }

  if (res.ok && datos?.token) {
    guardar(datos.token);
    return true;
  }
  // 401 con el JSON del servidor = código mal escrito. Un 401 sin JSON es la contraseña de acceso al sitio.
  if (res.status === 401 && datos?.error) return false;
  if (res.status === 401) throw new Error('El sitio ha pedido de nuevo la contraseña de acceso. Recarga la página.');
  if (res.status === 429) throw new Error(datos?.error ?? 'Demasiados intentos. Espera unos minutos.');
  if (res.status === 503) throw new Error('El modo administrador no está configurado en el servidor (falta ADMIN_TOTP_SECRET).');
  if (res.status === 404) throw new Error('El servidor no tiene el modo administrador: despliega la versión actual del servidor.');
  throw new Error(datos?.error ?? `Error del servidor (${res.status}).`);
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
