// Copia el motor de «El Tablero de Puntos» al cliente (el modo «un solo dispositivo» usa la misma lógica).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../tablero/engine.js'), path.join(aqui, '../../client/src/games/Tablero/engine.js'));
console.log('Motor de El Tablero de Puntos copiado al cliente.');
