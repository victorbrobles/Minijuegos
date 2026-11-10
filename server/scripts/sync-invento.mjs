// Copia el motor de «El Invento del Siglo» al cliente (el modo «un solo dispositivo» usa la misma lógica).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../invento/engine.js'), path.join(aqui, '../../client/src/games/Invento/engine.js'));
console.log('Motor de El Invento del Siglo copiado al cliente.');
