// Copia el motor de «El Laberinto · El Minotauro» al cliente (el modo «un solo dispositivo» usa la misma lógica).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../minotauro/engine.js'), path.join(aqui, '../../client/src/games/Laberinto/minotauro.js'));
console.log('Motor de El Minotauro copiado al cliente.');
