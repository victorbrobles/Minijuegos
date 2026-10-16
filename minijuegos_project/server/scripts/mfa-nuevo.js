// Genera un secreto MFA nuevo y lo guarda en server/data/.admin-totp (invalida el anterior).
// Uso:  node scripts/mfa-nuevo.js
// Imprime el secreto y la URL otpauth:// para añadirlo a tu app de autenticación (Google Authenticator,
// Authy, Microsoft Authenticator, 2FAS…): "Introducir clave de configuración" o convierte la URL en QR.
import { writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { nuevoSecreto, urlOtpauth } from '../lib/totp.js';

const secreto = nuevoSecreto();
writeFileSync(fileURLToPath(new URL('../data/.admin-totp', import.meta.url)), secreto, { mode: 0o600 });
const viejo = fileURLToPath(new URL('../data/.admin-secret', import.meta.url));
if (existsSync(viejo)) unlinkSync(viejo); // cierra las sesiones de administrador abiertas

console.log('Secreto MFA guardado en server/data/.admin-totp');
console.log('\nClave de configuración (manual):', secreto.match(/.{4}/g).join(' '));
console.log('\nURL otpauth (para un QR):\n' + urlOtpauth(secreto));
console.log('\nReinicia el servidor. Esta información no se vuelve a mostrar.');
