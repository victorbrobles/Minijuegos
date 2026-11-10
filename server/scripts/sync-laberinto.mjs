// Copia el motor de «El Laberinto» al cliente (el modo «un solo dispositivo» usa la misma lógica).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../laberinto/engine.js'), path.join(aqui, '../../client/src/games/Laberinto/engine.js'));
console.log('Motor de El Laberinto copiado al cliente.');
