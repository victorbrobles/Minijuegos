// Copia el motor de «¿Con quién he jugado?» al cliente (el modo «un solo dispositivo» usa la misma lógica).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../jugadores/engine.js'), path.join(aqui, '../../client/src/games/Jugadores/engine.js'));
console.log('Motor de ¿Con quién he jugado? copiado al cliente.');
