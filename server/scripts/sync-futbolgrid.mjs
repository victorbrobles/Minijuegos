// Copia el motor de «Fútbol en raya» al cliente (el modo «un solo dispositivo» usa la misma lógica que el servidor).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../futbolgrid/engine.js'), path.join(aqui, '../../client/src/games/FutbolGrid/engine.js'));
console.log('Motor de Fútbol en raya copiado al cliente.');
