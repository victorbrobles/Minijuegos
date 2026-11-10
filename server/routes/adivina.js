// server/routes/adivina.js
// «Luces, Cámara... ¡Música!»: adivina una película o una canción con pistas que se destapan solas cada pocos
// segundos (cuantas menos necesites, más puntos). En canciones, la última pista es el fragmento de audio (Deezer).
// Motor común de pulsador (../pulsador/engine.js) y salas de ../lib/salasPulsador.js.
import { Router } from 'express';
import { CANCIONES_MODERNAS, CANCIONES_ANTIGUAS, CANCIONES, PELICULAS } from '../data/seeds/adivina/adivina.js';
import { montarSalas, elegirSinRepetir } from '../lib/salasPulsador.js';
import { REGLAS, OPCIONES_RONDAS } from '../pulsador/engine.js';

const router = Router();
const cacheAudio = new Map();

const MODOS = ['canciones', 'peliculas'];
const EPOCAS = ['moderna', 'antigua', 'todas'];
function obtenerColeccion(modo, subcategoria) {
  if (modo === 'peliculas') return PELICULAS;
  if (subcategoria === 'antigua') return CANCIONES_ANTIGUAS;
  if (subcategoria === 'moderna') return CANCIONES_MODERNAS;
  return CANCIONES;
}
const TODOS = new Map([...CANCIONES, ...PELICULAS].map((x) => [x.id, x]));

// ---- Búsqueda de previews con validación de título y artista ----
function normalizarBusqueda(t) {
  return String(t ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Quita "(feat. X)", "(Instrumental)", "- Remastered 2011", etc.
function limpiarTituloItunes(t) {
  return normalizarBusqueda(
    String(t ?? '').replace(/\(.*?\)|\[.*?\]/g, ' ').replace(/\s[-–]\s.*$/, ' ')
  );
}

function artistasDe(texto) {
  // Se separa ANTES de normalizar, porque normalizar elimina el "&" y las comas
  return String(texto ?? '')
    .split(/\s*(?:&|,|\bfeat\.?|\bft\.?|\bcon\b|\bx\b|\by\b)\s*/i)
    .map(normalizarBusqueda)
    .filter(Boolean);
}

function coincideTituloArtista(r, titulos, artistas) {
  if (!r.previewUrl) return false;
  const tituloR = limpiarTituloItunes(r.trackName);
  if (!titulos.includes(tituloR)) return false;
  const artistaR = normalizarBusqueda(r.artistName);
  return artistas.some((a) => artistaR.includes(a));
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

// Deezer: clips de 30 s, sin clave de API. Lanza error si falla o limita (no confundir con "no encontrada").
async function buscarDeezer(consulta) {
  const url = `https://api.deezer.com/search?q=${encodeURIComponent(consulta)}&limit=25`;
  const esperas = [0, 3000, 10000];
  let ultimoError;
  for (const espera of esperas) {
    if (espera) await esperar(espera);
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const data = await res.json();
        if (data.error) throw new Error(`Deezer: ${data.error.message || data.error.code}`);
        // Normalizamos al formato que usa coincideTituloArtista
        return (data.data ?? []).map((r) => ({
          trackName: r.title,
          artistName: r.artist?.name,
          previewUrl: r.preview || null
        }));
      }
      ultimoError = new Error(`Deezer HTTP ${res.status}`);
    } catch (e) {
      ultimoError = e;
    }
  }
  throw ultimoError;
}

// Lanza error en fallos de red/limitación. Devuelve null SOLO si de verdad no hay coincidencia.
export async function buscarPreview(titulo, artista, alias = []) {
  const titulos = [titulo, ...alias].map(limpiarTituloItunes).filter(Boolean);
  const artistas = artistasDe(artista);

  const elegir = (resultados) => {
    const validos = resultados.filter((r) => coincideTituloArtista(r, titulos, artistas));
    // Preferimos la versión instrumental si existe (para que no se cante el título)
    return validos.find((r) => /instrumental/i.test(r.trackName)) ?? validos[0];
  };

  let elegido = elegir(await buscarDeezer(`${titulo} ${artista}`));

  // Segundo intento más preciso, solo si el primero no dio coincidencia
  if (!elegido && artistas[0]) {
    const principal = String(artista).split(/\s*(?:&|,|\bfeat\.?|\bft\.?)\s*/i)[0].trim();
    elegido = elegir(await buscarDeezer(`artist:"${principal}" track:"${titulo}"`));
  }
  return elegido?.previewUrl ?? null;
}

// Las URLs de preview de Deezer llevan un token que caduca: se cachean poco tiempo.
const TTL_URL_MS = 20 * 60 * 1000;
const TTL_NULO_MS = 24 * 60 * 60 * 1000;

export async function obtenerAudioPreview(titulo, artista, alias = []) {
  const clave = `${titulo}-${artista}`.toLowerCase();
  const hit = cacheAudio.get(clave);
  if (hit && hit.expira > Date.now()) return hit.url;

  try {
    const url = await buscarPreview(titulo, artista, alias);
    cacheAudio.set(clave, { url, expira: Date.now() + (url ? TTL_URL_MS : TTL_NULO_MS) });
    return url;
  } catch {
    // fallo temporal (red, límite de Deezer): se recuerda solo un par de minutos
    cacheAudio.set(clave, { url: null, expira: Date.now() + 2 * 60 * 1000 });
    return null;
  }
}

/** Igual, pero sin esperar más de `ms` (la partida no puede quedarse colgada por Deezer). */
const audioConPrisa = (it, ms = 5000) => Promise.race([
  obtenerAudioPreview(it.titulo, it.artista, it.alias),
  new Promise((r) => { setTimeout(() => r(null), ms).unref?.(); })
]);


// ---------------------------------------------------------------- Pistas
/** «M _ _ _ _ _ _ _»: la inicial de cada palabra y un hueco por letra. */
export function tituloOculto(t) {
  return String(t).split(' ').map((w) => [...w].map((ch, i) => (/[\p{L}\p{N}]/u.test(ch) ? (i === 0 ? ch.toUpperCase() : '_') : ch)).join(' ')).join('   ');
}

function itemDe(x, conAudio, urlAudio) {
  const cancion = 'artista' in x;
  const pistas = cancion
    ? [
        { tipo: 'texto', etiqueta: 'Un trozo de la letra', valor: `«${x.frase}»` },
        { tipo: 'texto', etiqueta: 'Artista y año', valor: `${x.artista} (${x.año})` },
        conAudio
          ? { tipo: 'audio', etiqueta: 'Escucha la canción', valor: urlAudio }
          : { tipo: 'hueco', etiqueta: 'El título', valor: tituloOculto(x.titulo) }
      ]
    : [
        { tipo: 'texto', etiqueta: 'Protagonistas', valor: x.protagonistas },
        { tipo: 'texto', etiqueta: 'Género y año', valor: `${x.genero} (${x.año})` },
        { tipo: 'texto', etiqueta: 'Sinopsis', valor: x.sinopsis }
      ];
  return {
    ref: x.id,
    pistas,
    respuestas: [x.titulo, ...(x.alias ?? [])],
    solucion: { titulo: x.titulo, detalle: cancion ? `${x.artista} · ${x.año}` : `${x.genero} · ${x.año}`, tipo: cancion ? 'cancion' : 'pelicula' }
  };
}

async function prepararItems(lista, urlAudio) {
  const audios = await Promise.all(lista.map((x) => ('artista' in x ? audioConPrisa(x) : null)));
  return lista.map((x, i) => itemDe(x, Boolean(audios[i]), urlAudio(i)));
}

const leerConfig = (b, c = { rondas: 10, modo: 'canciones', epoca: 'moderna' }) => ({
  rondas: OPCIONES_RONDAS.includes(Number(b.rondas)) ? Number(b.rondas) : c.rondas,
  modo: MODOS.includes(b.modo) ? b.modo : c.modo,
  epoca: EPOCAS.includes(b.epoca) ? b.epoca : c.epoca
});

async function redirigirAudio(res, x) {
  const url = x ? await audioConPrisa(x, 9000) : null;
  if (!url) return res.status(404).json({ error: 'No hay audio para esta canción.' });
  res.set('Cache-Control', 'no-store').redirect(302, url);
}

// ---------------------------------------------------------------- Un solo dispositivo
router.get('/local', async (req, res) => {
  const c = leerConfig({ rondas: req.query.n, modo: req.query.modo, epoca: req.query.epoca });
  const lista = elegirSinRepetir({ usados: new Set() }, obtenerColeccion(c.modo, c.epoca), c.rondas);
  const items = await prepararItems(lista, (i) => `/api/adivina/audio/${lista[i].id}`);
  res.json({ success: true, reglas: REGLAS.adivina, items: items.map(({ ref, ...it }) => it) });
});
router.get('/audio/:id', (req, res) => redirigirAudio(res, CANCIONES.find((x) => x.id === req.params.id)));

// ---------------------------------------------------------------- Salas online
const { itemDe: itemDeSala } = montarSalas(router, {
  config: leerConfig({}),
  validarConfig: leerConfig,
  reglas: () => REGLAS.adivina,
  prepararItems: (sala) => {
    const p = sala.numPartida + 1;
    const lista = elegirSinRepetir(sala, obtenerColeccion(sala.config.modo, sala.config.epoca), sala.config.rondas);
    return prepararItems(lista, (i) => `/api/adivina/online/sala/${sala.code}/audio?r=${i + 1}&p=${p}`);
  }
});
router.get('/online/sala/:code/audio', (req, res) => {
  const c = itemDeSala(req, res);
  if (c) redirigirAudio(res, TODOS.get(c.item.ref));
});

export default router;
