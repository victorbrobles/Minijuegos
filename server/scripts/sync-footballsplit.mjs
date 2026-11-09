// Copia el motor de «FrankensFootball» al cliente (el modo «un solo dispositivo» usa la misma lógica que el servidor).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../footballsplit/engine.js'), path.join(aqui, '../../client/src/games/FootballSplit/engine.js'));
console.log('Motor de FrankensFootball copiado al cliente.');
