// Copia el motor de «Mus Avanzado» al cliente (el modo «un solo dispositivo» usa la misma lógica).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../musavanzado/engine.js'), path.join(aqui, '../../client/src/games/MusAvanzado/engine.js'));
console.log('Motor de Mus Avanzado copiado al cliente.');
