// Copia el motor de «Del 1 al 10» al cliente (el modo «un solo dispositivo» usa la misma lógica).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../unoadiez/engine.js'), path.join(aqui, '../../client/src/games/UnoADiez/engine.js'));
console.log('Motor de Del 1 al 10 copiado al cliente.');
