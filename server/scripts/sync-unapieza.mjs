// Copia el motor de «Una Pieza Más» al cliente (el modo «un solo dispositivo» usa la misma lógica).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../unapieza/engine.js'), path.join(aqui, '../../client/src/games/UnaPieza/engine.js'));
console.log('Motor de Una Pieza Más copiado al cliente.');
