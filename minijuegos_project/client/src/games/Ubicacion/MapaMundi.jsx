import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Capa base mundial libre de OpenStreetMap (no requiere API key ni añade marcas de agua)
const TESELAS_OSM = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
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

    L.tileLayer(TESELAS_OSM, {
      maxZoom: 19,
      noWrap: true,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

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