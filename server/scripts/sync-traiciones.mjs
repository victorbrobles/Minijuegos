// Copia el motor de Traiciones al cliente (el modo «un solo dispositivo» usa la misma lógica que el servidor).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
const origen = path.join(aqui, '../traiciones/engine.js');
const destino = path.join(aqui, '../../client/src/games/Traiciones/engine.js');
fs.copyFileSync(origen, destino);
console.log('Motor de Traiciones copiado al cliente.');
