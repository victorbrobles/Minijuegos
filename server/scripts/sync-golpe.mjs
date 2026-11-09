// Copia el motor de El Golpe al cliente (el modo «un solo dispositivo» usa la misma lógica que el servidor).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.mkdirSync(path.join(aqui, '../../client/src/games/Golpe'), { recursive: true });
fs.copyFileSync(path.join(aqui, '../golpe/engine.js'), path.join(aqui, '../../client/src/games/Golpe/engine.js'));
console.log('Motor de El Golpe copiado al cliente.');
