// Copia el motor de «El Once Fantasma» al cliente (el modo «un solo dispositivo» usa la misma lógica).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../oncefantasma/engine.js'), path.join(aqui, '../../client/src/games/OnceFantasma/engine.js'));
console.log('Motor de El Once Fantasma copiado al cliente.');
