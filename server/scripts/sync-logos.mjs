// Decide qué logos se pueden jugar y escribe server/data/seeds/logos/disponibles.js
//   npm run sync:logos                → solo logos con imagen y SIN el nombre escrito dentro
//   npm run sync:logos -- --con-texto → incluye también los logos que llevan su nombre escrito
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as simpleIcons from 'simple-icons';
import { LOGOS_SIN_FILTRAR } from '../data/seeds/logos/logosData.js';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/seeds/logos');
const CON_TEXTO_OK = process.argv.includes('--con-texto');

// Su slug existe en Simple Icons, pero es el logo de OTRA marca (la editora): se descartan
const SLUG_INCORRECTO = new Set(['Grand Theft Auto', "Assassin's Creed", 'Final Fantasy']);

// El propio logo lleva escrito el nombre (o sus siglas): regalaría la respuesta. Revisado a ojo.
const LLEVA_NOMBRE = new Set([
  'Uber', 'Visa', 'BMW', 'Porsche', 'Ford', 'Coca Cola', 'Burger King', 'KFC', 'Chupa Chups', 'Fiat', 'Aston Martin',
  'Mini', 'Volvo', 'Kia', 'Nissan', 'Jeep', 'Chrysler', 'RAM', 'Ducati', 'KTM', 'Vespa', 'Airbus', 'Delta', 'KLM',
  'SNCF', 'Deutsche Bahn', 'Garmin', 'Caterpillar', 'MAN', 'Iveco', 'DAF', 'NASA', 'Airbus Helicopters', 'DHL', 'FIFA',
  'Zara', 'Uniqlo', 'Dior', 'The North Face', 'HBO Max', 'Apple TV+', 'IMDb', 'Activision', 'Epic Games', 'Konami',
  'Supercell', 'Electronic Arts'
]);

const iconos = new Set(Object.values(simpleIcons).filter((i) => i && i.slug).map((i) => i.slug));
const local = (slug) => ['svg', 'png', 'webp', 'jpg', 'jpeg'].some((e) => fs.existsSync(path.join(dir, 'img', `${slug}.${e}`)));

const incluidos = [], sinImagen = [], conTexto = [], erroneos = [];
for (const l of LOGOS_SIN_FILTRAR) {
  const propia = local(l.slug);
  if (!propia && SLUG_INCORRECTO.has(l.nombre)) { erroneos.push(l.nombre); continue; }
  if (!propia && !iconos.has(l.slug)) { sinImagen.push(l.nombre); continue; }
  if (!propia && LLEVA_NOMBRE.has(l.nombre) && !CON_TEXTO_OK) { conTexto.push(l.nombre); continue; }
  incluidos.push(l.id);
}

fs.writeFileSync(path.join(dir, 'disponibles.js'),
`// GENERADO por scripts/sync-logos.mjs (npm run sync:logos). No editar a mano.
// Ids de los logos con imagen real que se usan en la partida.
export const LOGOS_DISPONIBLES = [${incluidos.join(', ')}];
`);

console.log(`Logos jugables: ${incluidos.length} de ${LOGOS_SIN_FILTRAR.length}`);
console.log(`  Sin imagen disponible (${sinImagen.length}): ${sinImagen.join(', ')}`);
console.log(`  Con su nombre escrito, omitidos (${conTexto.length}): ${conTexto.join(', ')}`);
console.log(`  Slug de otra marca, omitidos (${erroneos.length}): ${erroneos.join(', ')}`);
