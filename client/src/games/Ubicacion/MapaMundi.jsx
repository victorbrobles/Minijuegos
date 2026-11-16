import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PAISES, OCEANOS } from './etiquetas.js';

// Mapa de satélite de Esri (gratis y sin clave de API) con dos capas transparentes encima:
//  - carreteras y nombres de calles (a partir de zoom 6)
//  - fronteras, ciudades y lugares (a partir de zoom 4; antes se ven los nombres de países en español del juego)
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services';
const SATELITE = `${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`;
const CALLES = `${ESRI}/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}`;
const LUGARES = `${ESRI}/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`;
const ATRIBUCION = 'Imágenes &copy; <a href="https://www.esri.com" target="_blank" rel="noopener">Esri</a>, Maxar, Earthstar Geographics &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';
// Hasta este zoom se ven los nombres de países y océanos en español; a partir de ahí, los del mapa (ciudades…)
const ZOOM_LUGARES = 4;
const LIMITES_MUNDO = [[-85, -180], [85, 180]];

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Chincheta SVG con la punta exactamente en la coordenada
function crearIcono({ color, glifo = '', grande = false, fantasma = false }) {
  const w = grande ? 40 : 32;
  const h = Math.round((w * 44) / 34);
  const html =
    `<svg width="${w}" height="${h}" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg" style="opacity:${fantasma ? 0.9 : 1}">` +
    `<path d="M17 43C17 43 3 28.5 3 16.5A14 14 0 0 1 31 16.5C31 28.5 17 43 17 43Z" fill="${color}" stroke="#fff" stroke-width="2.5"/>` +
    `<text x="17" y="22" text-anchor="middle" font-size="15" font-weight="800" font-family="Figtree, system-ui, sans-serif" fill="#fff">${esc(glifo)}</text>` +
    `</svg>`;
  return L.divIcon({ html, className: 'ub-pin', iconSize: [w, h], iconAnchor: [w / 2, h - 1] });
}

export default function MapaMundi({ marcadores = [], lineas = [], onClickMapa, onMoverMarcador, ajustar = false, enfoque = null }) {
  const contenedor = useRef(null);
  const mapaRef = useRef(null);
  const capaRef = useRef(null);
  const yaAjustado = useRef(false);
  const alClick = useRef(onClickMapa);
  const alMover = useRef(onMoverMarcador);
  alClick.current = onClickMapa;
  alMover.current = onMoverMarcador;

  // Crear el mapa
  useEffect(() => {
    yaAjustado.current = false;
    const mapa = L.map(contenedor.current, {
      center: [28, 10],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      zoomSnap: 0.5,
      maxBounds: LIMITES_MUNDO,
      maxBoundsViscosity: 1
    });

    L.tileLayer(SATELITE, { maxZoom: 19, maxNativeZoom: 18, noWrap: true, attribution: ATRIBUCION }).addTo(mapa);
    L.tileLayer(CALLES, { maxZoom: 19, maxNativeZoom: 18, minZoom: 6, noWrap: true }).addTo(mapa);
    L.tileLayer(LUGARES, { maxZoom: 19, maxNativeZoom: 18, minZoom: ZOOM_LUGARES, noWrap: true }).addTo(mapa);

    // Nombres en español: cada etiqueta aparece a partir de su zoom mínimo
    mapa.createPane('etiquetas');
    mapa.getPane('etiquetas').style.zIndex = 450;
    mapa.getPane('etiquetas').style.pointerEvents = 'none';
    const etiquetas = [...OCEANOS.map((e) => [...e, 'oceano']), ...PAISES.map((e) => [...e, 'pais'])].map(([nombre, lat, lng, zmin, tipo]) => ({
      zmin,
      marca: L.marker([lat, lng], {
        pane: 'etiquetas', interactive: false, keyboard: false,
        icon: L.divIcon({ className: `ub-etiqueta ${tipo}`, html: `<span>${esc(nombre)}</span>`, iconSize: [0, 0] })
      })
    }));
    const pintarEtiquetas = () => {
      const z = mapa.getZoom();
      // Al acercarse, mandan los nombres del propio mapa (ciudades, calles…) y se quitan los nuestros
      etiquetas.forEach((e) => { if (z >= e.zmin && z < ZOOM_LUGARES) e.marca.addTo(mapa); else e.marca.remove(); });
    };
    mapa.on('zoomend', pintarEtiquetas);
    pintarEtiquetas();

    capaRef.current = L.layerGroup().addTo(mapa);
    mapa.on('click', (e) => {
      const p = e.latlng.wrap();
      alClick.current?.(p.lat, p.lng);
    });
    mapaRef.current = mapa;

    return () => {
      mapa.remove();
      mapaRef.current = null;
      capaRef.current = null;
    };
  }, []);

  // Pintar marcadores y líneas cuando cambian
  const firma = JSON.stringify({ marcadores, lineas });
  useEffect(() => {
    const mapa = mapaRef.current;
    const capa = capaRef.current;
    if (!mapa || !capa) return;
    capa.clearLayers();

    lineas.forEach((l) => {
      L.polyline([[l.desde.lat, l.desde.lng], [l.hasta.lat, l.hasta.lng]], {
        color: l.color, weight: 2.5, opacity: 0.75, dashArray: '6 8', interactive: false
      }).addTo(capa);
    });

    marcadores.forEach((m) => {
      const marker = L.marker([m.lat, m.lng], {
        icon: crearIcono(m),
        draggable: !!m.arrastrable,
        interactive: m.interactivo !== false,
        keyboard: false,
        zIndexOffset: m.z ?? (m.arrastrable ? 500 : 0)
      });
      if (m.etiqueta) {
        marker.bindTooltip(esc(m.etiqueta), { permanent: true, direction: 'right', offset: [14, -26], className: 'ub-etiqueta' });
      }
      if (m.arrastrable) {
        marker.on('dragend', () => {
          const p = marker.getLatLng().wrap();
          alMover.current?.(m.id, p.lat, p.lng);
        });
      }
      marker.addTo(capa);
    });

    if (ajustar && !yaAjustado.current && marcadores.length) {
      yaAjustado.current = true;
      mapa.fitBounds(L.latLngBounds(marcadores.map((m) => [m.lat, m.lng])), { padding: [60, 60], maxZoom: 6, animate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firma, ajustar]);

  // Volar hasta un marcador
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!enfoque || !mapa) return;
    mapa.flyTo([enfoque.lat, enfoque.lng], Math.max(mapa.getZoom(), 5), { duration: 0.8 });
  }, [enfoque]);

  return <div ref={contenedor} className="ub-mapa" role="application" aria-label="Mapa del mundo" />;
}