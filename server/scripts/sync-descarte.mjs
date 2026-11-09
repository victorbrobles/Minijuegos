// Copia el motor de «¡Descarta y Elimina!» al cliente (el modo «un solo dispositivo» usa la misma lógica que el servidor).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../descarte/engine.js'), path.join(aqui, '../../client/src/games/Descarte/engine.js'));
console.log('Motor de Descarte copiado al cliente.');
