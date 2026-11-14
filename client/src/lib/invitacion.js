// client/src/lib/invitacion.js
// Invitaciones a salas por enlace o QR: /juego/<id>?sala=CODIGO deja el código preparado para «Unirse con código».
const CLAVE = 'minijuegos_invitacion';

export const enlaceSala = (codigo) => `${window.location.origin}${window.location.pathname}?sala=${encodeURIComponent(codigo)}`;

/** Lee ?sala= de la URL (y lo quita) y lo guarda para el juego actual. Devuelve el código o null. */
export function capturarInvitacion(juego) {
  try {
    const url = new URL(window.location.href);
    const codigo = url.searchParams.get('sala');
    if (!codigo) return leerInvitacion(juego);
    url.searchParams.delete('sala');
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    const limpio = codigo.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    sessionStorage.setItem(CLAVE, JSON.stringify({ juego, codigo: limpio }));
    return limpio;
  } catch { return null; }
}
export function leerInvitacion(juego) {
  try { const i = JSON.parse(sessionStorage.getItem(CLAVE)); return i && i.juego === juego ? i.codigo : null; } catch { return null; }
}
/** El formulario de unirse lo consume una vez. */
export function usarInvitacion() {
  try {
    const i = JSON.parse(sessionStorage.getItem(CLAVE));
    const juego = window.location.pathname.split('/').filter(Boolean)[1];
    if (i && i.juego === juego) { sessionStorage.removeItem(CLAVE); return i.codigo; }
  } catch { /* nada */ }
  return null;
}
/** Código de invitación del juego abierto, sin consumirlo (para los juegos con su propio formulario). */
export function codigoInvitado() {
  return leerInvitacion(window.location.pathname.split('/').filter(Boolean)[1]) || '';
}
