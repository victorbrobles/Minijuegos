// Copia el motor de «Director Deportivo» al cliente (el modo «un solo dispositivo» usa la misma lógica).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../director/engine.js'), path.join(aqui, '../../client/src/games/Director/engine.js'));
console.log('Motor de Director Deportivo copiado al cliente.');
