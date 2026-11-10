// Copia el motor de «Mus» al cliente (el modo «un solo dispositivo» usa la misma lógica).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../mus/engine.js'), path.join(aqui, '../../client/src/games/Mus/engine.js'));
console.log('Motor del Mus copiado al cliente.');
