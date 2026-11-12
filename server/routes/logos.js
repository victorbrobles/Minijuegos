// server/routes/logos.js
// «Logo Mania»: reconoce la marca del logo antes de que se acabe el reloj.
// Motor en ../logos/engine.js; salas online de ../lib/salasJuego.js.
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as simpleIcons from 'simple-icons';
import { TODOS_LOS_LOGOS } from '../data/seeds/logos/logosData.js';
import * as E from '../logos/engine.js';
import { montarSalas, elegirSinRepetir } from '../lib/salasJuego.js';
import { limitesOnline } from '../../client/src/games/limites.js';

const router = express.Router();

// Imágenes propias opcionales: server/data/seeds/logos/img/<slug>.(svg|png|webp|jpg)
// Tienen prioridad sobre Simple Icons. Quien las añade es responsable de tener derecho a usarlas.
const DIR_IMG = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/seeds/logos/img');
const EXT_IMG = { svg: 'image/svg+xml', png: 'image/png', webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg' };

// Simple Icons va incluido en el paquete npm: sin descargas ni dependencia de ningún CDN
const ICONOS = new Map(Object.values(simpleIcons).filter((i) => i && i.slug && i.svg).map((i) => [i.slug, i]));
const svgCache = {};

// SVG con el color oficial de la marca y sin <title> (el título contiene el nombre de la marca)
const luminosidad = (hex) => {
  const [r, g, b] = [0, 2, 4].map((k) => parseInt(hex.slice(k, k + 2), 16));
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};
const svgDeMarca = (icono) => {
  // Los colores casi blancos no se verían sobre el fondo claro del logo
  const color = luminosidad(icono.hex) > 0.85 ? '1f2937' : icono.hex;
  return icono.svg.replace(/<title>.*?<\/title>/s, '').replace('<svg ', `<svg fill="#${color}" `);
};

const imagenLocal = (slug) => {
  for (const ext of Object.keys(EXT_IMG)) {
    const f = path.join(DIR_IMG, `${slug}.${ext}`);
    if (fs.existsSync(f)) return { f, tipo: EXT_IMG[ext] };
  }
  return null;
};

// ==========================================================
// IMAGEN DEL LOGO (sin CDN: imagen propia o Simple Icons del paquete npm)
// ==========================================================
const normalizar = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

function enviarLogo(res, logo) {
  if (!logo) return res.status(404).send('Logo no encontrado');
  const slug = logo.slug || normalizar(logo.nombre);
  res.setHeader('Cache-Control', 'public, max-age=86400');

  const local = imagenLocal(slug);
  if (local) {
    res.setHeader('Content-Type', local.tipo);
    return res.sendFile(local.f);
  }
  const icono = ICONOS.get(slug);
  if (icono) {
    svgCache[slug] ??= svgDeMarca(icono);
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(svgCache[slug]);
  }
  // Sin imagen real no se inventa ninguna (antes salía un círculo con la inicial, que delataba la respuesta)
  return res.status(404).send('Sin imagen');
}


const POR_ID = new Map(TODOS_LOS_LOGOS.map((l) => [l.id, l]));
const itemDe = (l, imagen) => ({ id: l.id, imagen, nombre: l.nombre, validas: [l.nombre, ...(l.sinonimos || [])] });
const rondasValidas = (n, def = 15) => (E.OPCIONES_RONDAS.includes(Number(n)) ? Number(n) : def);

// ---------------------------------------------------------------- Un solo dispositivo
router.get('/imagen/:id', (req, res) => enviarLogo(res, POR_ID.get(Number(req.params.id))));
router.get('/local', (req, res) => {
  const lista = elegirSinRepetir({ usados: new Set() }, TODOS_LOS_LOGOS, rondasValidas(req.query.n));
  res.json({ success: true, items: lista.map((l) => itemDe(l, `/api/logos/imagen/${l.id}`)) });
});

// ---------------------------------------------------------------- Salas online
// La imagen se pide por sala y ronda, para que la URL no delate qué marca es.
const { itemDe: itemDeSala } = montarSalas(router, {
  ...limitesOnline('logos'),
  engine: E,
  config: { rondas: 15 },
  validarConfig: (b, c) => ({ ...c, rondas: rondasValidas(b.rondas, c.rondas) }),
  prepararItems: async (sala) => {
    const p = sala.numPartida + 1;
    const items = elegirSinRepetir(sala, TODOS_LOS_LOGOS, sala.config.rondas)
      .map((l, i) => itemDe(l, `/api/logos/online/sala/${sala.code}/imagen?r=${i + 1}&p=${p}`));
    return { items, reglas: { porTurnos: false } };
  },
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    const soloAdmin = { ok: false, error: 'Solo el anfitrión puede hacerlo.' };
    switch (d.tipo) {
      case 'responder': return M.responder(p, id, d.respuesta, ahora);
      case 'pasar': return M.pasar(p, id);
      case 'siguiente': return esAdmin ? M.siguiente(p, ahora) : soloAdmin;
      case 'terminar': return esAdmin ? M.terminar(p) : soloAdmin;
      default: return null;
    }
  }
});
router.get('/online/sala/:code/imagen', (req, res) => {
  const c = itemDeSala(req, res);
  if (c) enviarLogo(res, POR_ID.get(c.item.id));
});

export default router;
