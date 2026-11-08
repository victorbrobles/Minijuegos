// Utilidades de «Test del viajero»: distancias, puntuación y carga de fotos.

// Puntuación: cada jugador suma tantos puntos como kilómetros le separan del lugar.
// Gana quien MENOS puntos tenga. Si no colocas tu marcador, sumas la penalización.
export const PENALIZACION_SIN_MARCA = 20000;
export const OPCIONES_RONDAS = [5, 10, 15];

const RADIO_TIERRA_KM = 6371;
const aRad = (grados) => (grados * Math.PI) / 180;

// Distancia en km sobre la esfera terrestre (fórmula de Haversine)
export function distanciaKm(a, b) {
  const dLat = aRad(b.lat - a.lat);
  const dLng = aRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRad(a.lat)) * Math.cos(aRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * RADIO_TIERRA_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function puntosPorDistancia(km) {
  return km == null || !Number.isFinite(km) ? PENALIZACION_SIN_MARCA : Math.round(km);
}

export const formatearPuntos = (n) => Math.round(n).toLocaleString('es-ES');

export function formatearKm(km) {
  if (km < 1) return 'menos de 1 km';
  if (km < 100) return `${km.toFixed(1).replace('.', ',')} km`;
  return `${Math.round(km).toLocaleString('es-ES')} km`;
}

// Fisher-Yates
export function barajar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Fotos: se piden a Wikipedia (imagen principal del artículo, 960 px de ancho).
export async function resolverImagen(tituloWiki) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    redirects: '1',
    prop: 'pageimages',
    piprop: 'thumbnail',
    pithumbsize: '960',
    titles: tituloWiki
  });
  const r = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
  if (!r.ok) return null;
  const data = await r.json();
  const pagina = Object.values(data?.query?.pages ?? {})[0];
  const src = pagina?.thumbnail?.source;
  return src && src.includes('/wikipedia/commons/') ? src : null;
}

export async function resolverImagenes(candidatos) {
  const resueltos = await Promise.all(
    candidatos.map(async (lugar) => {
      if (lugar.imagen) return { ...lugar, imagenUrl: lugar.imagen };
      try {
        const url = await resolverImagen(lugar.wiki);
        return url ? { ...lugar, imagenUrl: url } : null;
      } catch {
        return null;
      }
    })
  );
  return resueltos.filter(Boolean);
}