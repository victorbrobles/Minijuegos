import { createHmac, timingSafeEqual } from 'node:crypto';

// TOTP (RFC 6238): HMAC-SHA1, 6 dígitos, pasos de 30 s. Compatible con Google Authenticator, Authy, etc.
const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export const PERIODO = 30;
export const DIGITOS = 6;

export function base32Decodificar(texto) {
  const limpio = String(texto).toUpperCase().replace(/[\s=-]/g, '');
  let bits = 0, valor = 0;
  const bytes = [];
  for (const c of limpio) {
    const i = ALFABETO.indexOf(c);
    if (i < 0) throw new Error('Secreto TOTP no válido');
    valor = (valor << 5) | i;
    bits += 5;
    if (bits >= 8) {
      bytes.push((valor >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

export function codigoDelPaso(secretoBase32, paso, digitos = DIGITOS) {
  const contador = Buffer.alloc(8);
  contador.writeBigUInt64BE(BigInt(paso));
  const h = createHmac('sha1', base32Decodificar(secretoBase32)).update(contador).digest();
  const o = h[h.length - 1] & 15;
  const n = ((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 10 ** digitos).padStart(digitos, '0');
}

export const pasoActual = (ahoraMs = Date.now()) => Math.floor(ahoraMs / 1000 / PERIODO);

// Devuelve el paso (número) que ha validado el código, o null. Admite ±1 paso por desfase de reloj.
// `ultimoPaso` evita reutilizar un código ya usado (solo se aceptan pasos posteriores).
export function verificarCodigo(secretoBase32, codigo, { ultimoPaso = -1, ahoraMs = Date.now() } = {}) {
  const texto = String(codigo ?? '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(texto)) return null;
  const actual = pasoActual(ahoraMs);
  let acertado = null;
  for (const paso of [actual - 1, actual, actual + 1]) {
    const esperado = Buffer.from(codigoDelPaso(secretoBase32, paso));
    // se recorren los tres pasos siempre, para no filtrar información por tiempos
    if (timingSafeEqual(esperado, Buffer.from(texto)) && paso > ultimoPaso) acertado = paso;
  }
  return acertado;
}
