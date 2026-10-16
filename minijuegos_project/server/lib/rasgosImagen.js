// server/lib/rasgosImagen.js
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { FAMOSOS } from '../data/seeds/rasgos/rasgos.seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CARPETA_IMAGENES = path.resolve(__dirname, '../data/seeds/rasgos');

// Memoria caché para no descargar la misma imagen dos veces
const cacheBuffer = new Map();

async function obtenerBufferImagen(famoso) {
  if (cacheBuffer.has(famoso.id)) {
    return cacheBuffer.get(famoso.id);
  }

  let buffer;

  if (famoso.imagen.startsWith('http://') || famoso.imagen.startsWith('https://')) {
    // Añadimos ?width=1000 a Special:FilePath para que descargue la versión optimizada
    // de ~150 KB en vez del archivo de 25 MB original
    let url = famoso.imagen;
    if (url.includes('Special:FilePath') && !url.includes('width=')) {
      url += (url.includes('?') ? '&' : '?') + 'width=1000';
    }

    const res = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });

    if (!res.ok) {
      throw new Error(`Error ${res.status} al descargar imagen de ${famoso.nombre}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } else {
    const rutaLocal = path.join(CARPETA_IMAGENES, famoso.imagen);
    buffer = await fs.readFile(rutaLocal);
  }

  cacheBuffer.set(famoso.id, buffer);
  return buffer;
}

export async function recorte(famoso) {
  const bufferOriginal = await obtenerBufferImagen(famoso);
  const metadata = await sharp(bufferOriginal).metadata();

  const rec = famoso.recorte || { x: 0.2, y: 0.2, ancho: 0.6, alto: 0.3 };

  // Límites para evitar desbordamiento de dimensiones al recortar
  const left = Math.max(0, Math.min(metadata.width - 2, Math.round(rec.x * metadata.width)));
  const top = Math.max(0, Math.min(metadata.height - 2, Math.round(rec.y * metadata.height)));
  const width = Math.max(1, Math.min(metadata.width - left, Math.round(rec.ancho * metadata.width)));
  const height = Math.max(1, Math.min(metadata.height - top, Math.round(rec.alto * metadata.height)));

  return await sharp(bufferOriginal)
    .extract({ left, top, width, height })
    .jpeg({ quality: 85 })
    .toBuffer();
}

export async function fotoCompleta(famoso) {
  const bufferOriginal = await obtenerBufferImagen(famoso);
  return await sharp(bufferOriginal)
    .resize({ width: 800, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
}

// Filtra las entradas pendientes mientras no tengan URL asignada
export const famosos = FAMOSOS.filter((f) => {
  if (!f.imagen || f.imagen.startsWith('TU_URL_AQUI')) return false;
  return true;
});