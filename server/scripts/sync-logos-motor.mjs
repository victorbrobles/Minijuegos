// Copia el motor de «Logo Mania» al cliente (el modo «un solo dispositivo» usa la misma lógica).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../logos/engine.js'), path.join(aqui, '../../client/src/games/Logos/engine.js'));
console.log('Motor de Logo Mania copiado al cliente.');
