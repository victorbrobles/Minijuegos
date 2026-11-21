import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { verificarCodigo, base32Decodificar } from './totp.js';

const ruta = (nombre) => fileURLToPath(new URL(`../data/${nombre}`, import.meta.url));

// --- Secreto TOTP (el que está sincronizado en tu app de autenticación) ---
// Prioridad: variable de entorno ADMIN_TOTP_SECRET (la forma correcta en un servidor online) y,
// si no existe, el fichero server/data/.admin-totp (cómodo en local; está en .gitignore, así que
// NO llega a un despliegue hecho con git: ahí hay que usar la variable de entorno).
function cargarTotp() {
  const deEntorno = process.env.ADMIN_TOTP_SECRET?.trim();
  if (deEntorno) return { secreto: deEntorno, origen: 'variable de entorno ADMIN_TOTP_SECRET' };
  try {
    const f = ruta('.admin-totp');
    if (existsSync(f)) {
      const deFichero = readFileSync(f, 'utf8').trim();
      if (deFichero) return { secreto: deFichero, origen: 'fichero server/data/.admin-totp' };
    }
  } catch { /* sin permisos de lectura: se trata como no configurado */ }
  return null;
}

let secretoTotp = null;
const cargado = cargarTotp();
if (cargado) {
  try {
    if (base32Decodificar(cargado.secreto).length === 0) throw new Error('vacío');
    secretoTotp = cargado.secreto;
    console.log(`[admin] Modo administrador ACTIVO (secreto leído de ${cargado.origen}).`);
  } catch {
    console.error(`[admin] El secreto de ${cargado.origen} no es base32 válido: modo administrador DESACTIVADO.`);
  }
} else {
  console.warn('[admin] Modo administrador DESACTIVADO: define ADMIN_TOTP_SECRET (o crea server/data/.admin-totp).');
}
export const mfaConfigurado = secretoTotp !== null;

let ultimoPaso = -1; // un código ya usado no se puede reutilizar

// Devuelve true si el código de 6 dígitos es válido ahora mismo (y lo marca como usado)
export function codigoCorrecto(codigo) {
  if (!secretoTotp) return false;
  const paso = verificarCodigo(secretoTotp, codigo, { ultimoPaso });
  if (paso === null) return false;
  ultimoPaso = paso;
  return true;
}

// --- Sesión de administrador ---
// Ya no hay token aparte guardado en el navegador: el modo administrador va dentro de la cookie de sesión de la cuenta
// (firmada y HttpOnly, ver server/lib/usuarios.js). Así solo lo tiene quien lo activó, en su sesión: otra cuenta (o la
// misma en otro navegador) no lo ve, y al cerrar la sesión (a mano o por inactividad) se acaba también.
export const DURACION_ADMIN_MS = 12 * 60 * 60 * 1000; // como mucho 12 horas seguidas

export const esAdmin = (req) => mfaConfigurado && req.admin === true && Boolean(req.usuario);
