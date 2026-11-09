// Copia el motor de «Modo carrera» al cliente (el modo «un solo dispositivo» usa la misma lógica que el servidor).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../trayectoria/engine.js'), path.join(aqui, '../../client/src/games/Trayectoria/engine.js'));
console.log('Motor de Modo carrera copiado al cliente.');
