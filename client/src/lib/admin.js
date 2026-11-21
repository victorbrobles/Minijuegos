import { useSyncExternalStore } from 'react';

// Modo administrador. Se activa en /admin con el código de 6 dígitos de la app de autenticación y el servidor lo guarda
// dentro de la cookie de sesión de la cuenta (firmada y HttpOnly): solo lo tiene quien lo activó, en su sesión, y se
// acaba al cerrarla. Aquí solo se refleja si está activo; el navegador no guarda ningún token ni el secreto.
const oyentes = new Set();
let activo = false;
export function ponerAdmin(valor) {
  const nuevo = Boolean(valor);
  if (nuevo === activo) return;
  activo = nuevo;
  oyentes.forEach((f) => f());
}
// Restos de la versión anterior (token en localStorage): fuera
try { localStorage.removeItem('minigames-admin-token'); } catch { /* nada */ }

// Se mantiene por compatibilidad: la cookie ya viaja sola en las peticiones a /api
export const adminHeaders = () => ({});

// Devuelve true si el código era correcto, false si es incorrecto.
// Lanza Error con un mensaje claro si hay bloqueo, falta la sesión o falla la red.
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
  try { datos = await res.json(); } catch { /* la respuesta no era JSON */ }

  if (res.ok && datos?.admin) { ponerAdmin(true); return true; }
  if (res.status === 401 && datos?.error) return false;
  if (res.status === 403) throw new Error(datos?.error ?? 'Inicia sesión con tu cuenta.');
  if (res.status === 429) throw new Error(datos?.error ?? 'Demasiados intentos. Espera unos minutos.');
  if (res.status === 503) throw new Error('El modo administrador no está disponible en el servidor.');
  throw new Error(datos?.error ?? `Error del servidor (${res.status}).`);
}

export async function salirAdmin() {
  ponerAdmin(false);
  try { await fetch('/api/admin/salir', { method: 'POST', credentials: 'same-origin' }); } catch { /* nada */ }
}

// Pregunta al servidor si esta sesión sigue en modo administrador (caduca a las 12 h o al cerrar la sesión)
export async function comprobarSesionAdmin() {
  try {
    const res = await fetch('/api/admin/status', { credentials: 'same-origin' });
    if (res.ok) ponerAdmin((await res.json()).admin);
  } catch { /* sin servidor: se mantiene */ }
}

export function useAdmin() {
  return useSyncExternalStore(
    (f) => { oyentes.add(f); return () => oyentes.delete(f); },
    () => activo
  );
}
