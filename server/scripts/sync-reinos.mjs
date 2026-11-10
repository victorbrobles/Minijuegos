// Copia el motor de «Los Siete Reinos» al cliente (el modo «un solo dispositivo» usa la misma lógica).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../reinos/engine.js'), path.join(aqui, '../../client/src/games/Reinos/engine.js'));
console.log('Motor de Los Siete Reinos copiado al cliente.');
