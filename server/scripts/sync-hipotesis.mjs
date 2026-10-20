// Copia el motor de La Hipótesis Ganadora al cliente (el modo «un solo dispositivo» usa la misma lógica que el servidor).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../hipotesis/engine.js'), path.join(aqui, '../../client/src/games/Hipotesis/engine.js'));
console.log('Motor de La Hipótesis Ganadora copiado al cliente.');
