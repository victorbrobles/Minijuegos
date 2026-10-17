import { createHmac, timingSafeEqual } from 'node:crypto';
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

// --- Clave para firmar los tokens de sesión ---
// Antes se generaba al azar y se guardaba en un fichero: en un servidor con disco efímero o de solo
// lectura (Render, Railway, Fly, contenedores...) fallaba o cerraba la sesión en cada reinicio.
// Ahora se deriva del secreto TOTP (o de ADMIN_TOKEN_SECRET si se define): es estable entre reinicios
// y despliegues, no escribe nada en disco, y regenerar el MFA invalida todas las sesiones abiertas.
const secreto = process.env.ADMIN_TOKEN_SECRET
  ? Buffer.from(process.env.ADMIN_TOKEN_SECRET)
  : createHmac('sha256', secretoTotp ?? 'admin-desactivado').update('minigames-admin-token-v1').digest();

const DURACION_MS = 12 * 60 * 60 * 1000; // la sesión de administrador dura 12 horas

const firmar = (datos) => createHmac('sha256', secreto).update(datos).digest('base64url');

export function crearToken() {
  const datos = Buffer.from(JSON.stringify({ exp: Date.now() + DURACION_MS })).toString('base64url');
  return `${datos}.${firmar(datos)}`;
}

export function tokenValido(token) {
  if (!mfaConfigurado || typeof token !== 'string') return false;
  const [datos, firma] = token.split('.');
  if (!datos || !firma) return false;
  const esperada = Buffer.from(firmar(datos));
  const recibida = Buffer.from(firma);
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return false;
  try {
    return JSON.parse(Buffer.from(datos, 'base64url').toString()).exp > Date.now();
  } catch {
    return false;
  }
}

export const esAdmin = (req) => tokenValido(req.get('x-admin-token'));
