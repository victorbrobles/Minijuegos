// server/routes/rasgos.js
// «El paparazzi»: se ve un recorte de la foto de un famoso y hay que reconocerlo antes que nadie.
// Motor común de pulsador (../pulsador/engine.js) y salas de ../lib/salasJuego.js. El servidor recorta la foto
// para que la imagen completa (y el nombre del archivo) no lleguen al navegador hasta que se resuelve la ronda.
import express from 'express';
import { randomUUID } from 'node:crypto';
import { famosos, recorte, fotoCompleta } from '../lib/rasgosImagen.js';
import { montarSalas, elegirSinRepetir } from '../lib/salasJuego.js';
import { REGLAS, OPCIONES_RONDAS } from '../pulsador/engine.js';

const router = express.Router();
const RASGO = {
  ojos: 'son estos ojos', nariz: 'es esta nariz', boca: 'es esta boca', labios: 'son estos labios', dientes: 'es esta sonrisa',
  barbilla: 'es esta barbilla', frente: 'es esta frente', pelo: 'es este pelo', 'pelo pelirrojo': 'es este pelo', rizos: 'son estos rizos',
  flequillo: 'es este flequillo', orejas: 'son estas orejas', cejas: 'son estas cejas', barba: 'es esta barba', bigote: 'es este bigote',
  gafas: 'son estas gafas', gorra: 'es esta gorra', pecho: 'es este pecho', brazos: 'son estos brazos', hombros: 'son estos hombros',
  piernas: 'son estas piernas', cuerpo: 'es este cuerpo', traje: 'es este traje'
};
const rondasValidas = (n, def = 10) => (OPCIONES_RONDAS.includes(Number(n)) ? Number(n) : def);

/** Ítem del motor para un famoso: la imagen y la foto se sirven por las URLs que se pasan. */
function itemDe(f, imagen, foto) {
  return {
    famoso: f,
    pistas: [{ tipo: 'imagen', etiqueta: RASGO[f.rasgo] ? `¿De quién ${RASGO[f.rasgo]}?` : '¿Quién es?', valor: imagen }],
    respuestas: [f.nombre, ...(f.alias ?? [])],
    solucion: { titulo: f.nombre, imagen: foto, atribucion: f.attribution ?? null }
  };
}

async function enviarImagen(res, fn, famoso) {
  try {
    const buffer = await fn(famoso);
    res.set('Cache-Control', 'private, max-age=3600').type('jpeg').send(buffer);
  } catch (e) {
    console.error('[rasgos] No se pudo cargar la imagen:', e.message);
    res.status(502).json({ error: 'No se pudo cargar la imagen.' });
  }
}

// ---------------------------------------------------------------- Un solo dispositivo
const partidas = new Map();
const CADUCIDAD_MS = 4 * 60 * 60 * 1000;

router.get('/local', (req, res) => {
  if (!famosos.length) return res.status(404).json({ error: 'No hay famosos disponibles.' });
  const ahora = Date.now();
  for (const [k, v] of partidas) if (ahora - v.creada > CADUCIDAD_MS) partidas.delete(k);
  while (partidas.size > 300) partidas.delete(partidas.keys().next().value);
  const id = randomUUID();
  const elegidos = elegirSinRepetir({ usados: new Set() }, famosos, rondasValidas(req.query.n));
  partidas.set(id, { creada: ahora, famosos: elegidos });
  res.json({
    success: true,
    reglas: REGLAS.rasgos,
    items: elegidos.map((f, i) => {
      const { famoso, ...it } = itemDe(f, `/api/rasgos/imagen/${id}/${i}`, `/api/rasgos/foto/${id}/${i}`);
      void famoso;
      return it;
    })
  });
});

function famosoLocal(req, res) {
  const f = partidas.get(req.params.id)?.famosos[Number(req.params.i)];
  if (!f) res.status(404).json({ error: 'La partida ha caducado.' });
  return f;
}
router.get('/imagen/:id/:i', (req, res) => { const f = famosoLocal(req, res); if (f) enviarImagen(res, recorte, f); });
router.get('/foto/:id/:i', (req, res) => { const f = famosoLocal(req, res); if (f) enviarImagen(res, fotoCompleta, f); });

// ---------------------------------------------------------------- Salas online
const { itemDe: itemDeSala } = montarSalas(router, {
  config: { rondas: 10 },
  validarConfig: (b, c) => ({ ...c, rondas: rondasValidas(b.rondas, c.rondas) }),
  reglas: () => REGLAS.rasgos,
  prepararItems: async (sala) => {
    const p = sala.numPartida + 1;
    return elegirSinRepetir(sala, famosos, sala.config.rondas).map((f, i) =>
      itemDe(f, `/api/rasgos/online/sala/${sala.code}/imagen?r=${i + 1}&p=${p}`, `/api/rasgos/online/sala/${sala.code}/foto?r=${i + 1}&p=${p}`));
  }
});

router.get('/online/sala/:code/imagen', (req, res) => {
  const c = itemDeSala(req, res);
  if (c) enviarImagen(res, recorte, c.item.famoso);
});
router.get('/online/sala/:code/foto', (req, res) => {
  const c = itemDeSala(req, res);
  if (!c) return;
  if (!c.resuelta) return res.status(403).json({ error: 'La ronda aún no ha terminado.' });
  enviarImagen(res, fotoCompleta, c.item.famoso);
});

export default router;
