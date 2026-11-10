// Copia el motor de «El Dato que Sobra» al cliente (el modo «un solo dispositivo» usa la misma lógica).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../datosobra/engine.js'), path.join(aqui, '../../client/src/games/DatoSobra/engine.js'));
console.log('Motor de El Dato que Sobra copiado al cliente.');
