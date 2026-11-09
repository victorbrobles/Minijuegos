// Copia el motor de «Bingoball» al cliente (las pantallas usan sus ajustes).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../bingoball/engine.js'), path.join(aqui, '../../client/src/games/Bingoball/engine.js'));
console.log('Motor de Bingoball copiado al cliente.');
