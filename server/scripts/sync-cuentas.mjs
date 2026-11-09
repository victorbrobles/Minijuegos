// Copia el motor de Lleva la cuenta al cliente (el modo «un solo dispositivo» usa la misma lógica que el servidor).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.mkdirSync(path.join(aqui, '../../client/src/games/Cuentas'), { recursive: true });
fs.copyFileSync(path.join(aqui, '../cuentas/engine.js'), path.join(aqui, '../../client/src/games/Cuentas/engine.js'));
console.log('Motor de Lleva la cuenta copiado al cliente.');
