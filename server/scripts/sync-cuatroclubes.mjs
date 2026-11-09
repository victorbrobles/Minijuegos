// Copia el motor de «El club de los cuatro» al cliente (el modo «un solo dispositivo» usa la misma lógica).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../cuatroclubes/engine.js'), path.join(aqui, '../../client/src/games/CuatroClubes/engine.js'));
console.log('Motor de El club de los cuatro copiado al cliente.');
