// Copia el motor de «El Laberinto · Constructores y corredores» al cliente (el modo «un solo dispositivo» usa la misma lógica).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../constructores/engine.js'), path.join(aqui, '../../client/src/games/Laberinto/constructores.js'));
console.log('Motor de Constructores y corredores copiado al cliente.');
