// Copia el motor de los juegos de pulsador al cliente (el modo «un solo dispositivo» usa la misma lógica).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../pulsador/engine.js'), path.join(aqui, '../../client/src/games/Pulsador/engine.js'));
console.log('Motor de pulsador copiado al cliente.');
