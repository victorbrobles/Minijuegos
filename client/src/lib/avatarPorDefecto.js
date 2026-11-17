// client/src/lib/avatarPorDefecto.js
// Todo el mundo tiene avatar desde que entra: si tu nick no tiene ninguno, se le asigna uno al azar (marcado como
// «automático»). Con cuenta, se queda hasta que lo cambies; sin cuenta, se renueva en cada sesión.
import { nombreCompleto } from './identidad.js';
import { cuentaActual } from './cuenta.js';
import { avatarAleatorio, textoAvatar, esAvatarAuto, COLORES_FONDO } from './avatarPartes.js';
import { guardarPerfil } from './perfil.js';

const HECHO = 'minijuegos_avatar_ok';
let enCurso = null;

async function asegurar() {
  const yo = nombreCompleto();
  if (!yo) return;
  try { if (sessionStorage.getItem(HECHO) === yo) return; } catch { /* sin almacenamiento */ }
  const d = await fetch(`/api/perfil?nombres=${encodeURIComponent(yo)}`).then((r) => (r.ok ? r.json() : null));
  if (!d) return;
  const actual = d.perfiles?.[yo]?.avatar;
  const conCuenta = cuentaActual()?.jugador === yo;
  const renovar = !actual || (!conCuenta && esAvatarAuto(actual));
  if (renovar) {
    const color = COLORES_FONDO[Math.floor(Math.random() * COLORES_FONDO.length)];
    await guardarPerfil(yo, textoAvatar(avatarAleatorio(), { auto: true }), color);
  }
  try { sessionStorage.setItem(HECHO, yo); } catch { /* nada */ }
}

/** Comprueba (una vez por sesión y nick) que tienes avatar. Se puede llamar tantas veces como se quiera. */
export function asegurarAvatar() {
  if (!enCurso) enCurso = asegurar().catch(() => {}).finally(() => { enCurso = null; });
  return enCurso;
}
