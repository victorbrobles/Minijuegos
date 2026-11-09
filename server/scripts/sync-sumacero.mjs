// Copia el motor de Suma Cero al cliente (el modo «un solo dispositivo» usa la misma lógica que el servidor).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.mkdirSync(path.join(aqui, '../../client/src/games/SumaCero'), { recursive: true });
fs.copyFileSync(path.join(aqui, '../sumacero/engine.js'), path.join(aqui, '../../client/src/games/SumaCero/engine.js'));
console.log('Motor de Suma Cero copiado al cliente.');
