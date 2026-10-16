import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { verificarCodigo } from './totp.js';

const ruta = (nombre) => fileURLToPath(new URL(`../data/${nombre}`, import.meta.url));

// --- Secreto TOTP (el que está sincronizado en tu app de autenticación) ---
// Se lee de la variable ADMIN_TOTP_SECRET o del fichero server/data/.admin-totp (fuera del repositorio).
// Si no existe, el modo administrador queda DESACTIVADO (nadie puede darlo de alta desde la web).
function cargarTotp() {
  if (process.env.ADMIN_TOTP_SECRET) return process.env.ADMIN_TOTP_SECRET.trim();
  const f = ruta('.admin-totp');
  return existsSync(f) ? readFileSync(f, 'utf8').trim() : null;
}
const secretoTotp = cargarTotp();
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

// --- Secreto para firmar los tokens de sesión: se crea solo y no va al repositorio ---
const rutaSecreto = ruta('.admin-secret');
function cargarSecreto() {
  if (process.env.ADMIN_TOKEN_SECRET) return Buffer.from(process.env.ADMIN_TOKEN_SECRET);
  if (existsSync(rutaSecreto)) return Buffer.from(readFileSync(rutaSecreto, 'utf8').trim(), 'hex');
  const nuevo = randomBytes(32);
  mkdirSync(dirname(rutaSecreto), { recursive: true });
  writeFileSync(rutaSecreto, nuevo.toString('hex'), { mode: 0o600 });
  return nuevo;
}
const secreto = cargarSecreto();

const DURACION_MS = 12 * 60 * 60 * 1000; // la sesión de administrador dura 12 horas

const firmar = (datos) => createHmac('sha256', secreto).update(datos).digest('base64url');

export function crearToken() {
  const datos = Buffer.from(JSON.stringify({ exp: Date.now() + DURACION_MS })).toString('base64url');
  return `${datos}.${firmar(datos)}`;
}

export function tokenValido(token) {
  if (typeof token !== 'string') return false;
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
