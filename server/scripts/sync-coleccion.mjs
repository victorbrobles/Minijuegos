// Copia el motor de Colecciona con cabeza al cliente (el modo «un solo dispositivo» usa la misma lógica que el servidor).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../coleccion/engine.js'), path.join(aqui, '../../client/src/games/Coleccion/engine.js'));
console.log('Motor de Colecciona con cabeza copiado al cliente.');
