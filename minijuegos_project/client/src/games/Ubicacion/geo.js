// Utilidades de «Ubica el lugar»: distancias, puntuación por rangos y carga de fotos.

// Nuevo sistema escalonado de puntuación según la distancia del marcador real
export const RANGOS_PUNTOS = [
  { hasta: 10, puntos: 10 },
  { hasta: 50, puntos: 9 },
  { hasta: 100, puntos: 8 },
  { hasta: 200, puntos: 7 },
  { hasta: 300, puntos: 6 },
  { hasta: 500, puntos: 5 },
  { hasta: 1000, puntos: 4 },
  { hasta: 2000, puntos: 3 },
  { hasta: 3000, puntos: 2 },
  { hasta: 5000, puntos: 1 }
];

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
  const rango = RANGOS_PUNTOS.find((r) => km <= r.hasta);
  return rango ? rango.puntos : 0;
}

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