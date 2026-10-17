// Genera un secreto MFA nuevo (invalida el anterior y cierra las sesiones de administrador abiertas).
// Uso:  node scripts/mfa-nuevo.js
//  - En LOCAL: se guarda en server/data/.admin-totp (en .gitignore).
//  - ONLINE: copia el valor en la variable de entorno ADMIN_TOTP_SECRET de tu hosting
//    (el fichero .admin-totp no se sube con git, por eso en un servidor hace falta la variable).
// Añádelo a tu app de autenticación (Google Authenticator, Authy, Microsoft Authenticator, 2FAS…) con
// "Introducir clave de configuración", o convierte la URL otpauth:// en un QR.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { nuevoSecreto, urlOtpauth } from '../lib/totp.js';

const secreto = nuevoSecreto();
writeFileSync(fileURLToPath(new URL('../data/.admin-totp', import.meta.url)), secreto, { mode: 0o600 });

console.log('Secreto MFA guardado en server/data/.admin-totp (uso local).');
console.log('\nClave de configuración (manual):', secreto.match(/.{1,4}/g).join(' '));
console.log('\nVariable de entorno para el servidor online:\n  ADMIN_TOTP_SECRET=' + secreto);
console.log('\nURL otpauth (para un QR):\n' + urlOtpauth(secreto));
console.log('\nReinicia el servidor. Esta información no se vuelve a mostrar.');
