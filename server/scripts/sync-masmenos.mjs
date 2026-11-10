// Copia el motor de «Entre dos aguas» al cliente (el modo «un solo dispositivo» usa la misma lógica).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(aqui, '../masmenos/engine.js'), path.join(aqui, '../../client/src/games/MasMenos/engine.js'));
console.log('Motor de Entre dos aguas copiado al cliente.');
