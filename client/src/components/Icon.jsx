// client/src/components/Icon.jsx
// Iconos SVG propios (dibujados a mano, sin copyright). Estilo de línea redondeada.
import React from 'react';

const P = {
  letters: <><path d="M2.5 18 7 6l4.5 12M4.3 14h5.4" /><path d="M15 6v12h3.5a3 3 0 0 0 0-6H15m0 0h3a3 3 0 0 0 0-6h-3" /></>,
  detective: <><path d="M3 10h18" /><path d="M6 10l1.6-5.500h8.800L18 10" /><path d="M7 10v1.500a5 5 0 0 0 7 4.500" /><path d="M10 12.500h.01M14 12.500h.01" /><circle cx="17.500" cy="17.500" r="3" /><path d="M19.700 19.700 22 22" /></>,
  landmark: <><path d="M3 10l9-6 9 6" /><path d="M5 10v8M9.500 10v8M14.500 10v8M19 10v8M3 20.500h18" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18" /></>,
  flask: <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.800 3h10.400a2 2 0 0 0 1.800-3l-5-9V3M7.500 15h9" />,
  heart: <path d="M12 20s-8-5-8-11a4.500 4.500 0 0 1 8-2.500A4.500 4.500 0 0 1 20 9c0 6-8 11-8 11z" />,
  brokenheart: <><path d="M12 20s-8-5-8-11a4.500 4.500 0 0 1 8-2.500A4.500 4.500 0 0 1 20 9c0 6-8 11-8 11z" /><path d="M12 6.500 10 11l3 2-2 5" /></>,
  basketball: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3v18M5.500 5.500c3 3 3 10 0 13M18.500 5.500c-3 3-3 10 0 13" /></>,
  chip: <><rect x="6" y="6" width="12" height="12" rx="2" /><rect x="9.500" y="9.500" width="5" height="5" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /></>,
  flag: <path d="M5 21V4M5 4h12l-2 4 2 4H5" />,
  chart: <path d="M4 20V4M4 20h16M8 16l4-5 3 3 5-7" />,
  clapper: <><rect x="3" y="10" width="18" height="11" rx="2" /><path d="m3 10 2.200-5.500 16 3.800-.7 1.700M8 5.200l2.500 4M13 6.400l2.500 4" /></>,
  book: <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M8 7h7" />,
  bulb: <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.500c.7.700 1 1.500 1 2.500h6c0-1 .3-1.800 1-2.500A6 6 0 0 0 12 3z" />,
  star: <path d="m12 3 2.800 5.700 6.200.9-4.500 4.400 1 6.200L12 17.200 6.500 20.200l1-6.200L3 9.600l6.200-.9z" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>,
  soccer: <><circle cx="12" cy="12" r="9" /><path d="m12 8 3.500 2.500-1.300 4H9.800l-1.300-4zM12 3v5M15.500 10.500 20 9M14.200 14.500l2.600 3.600M9.800 14.500l-2.600 3.600M8.500 10.500 4 9" /></>,
  paw: <><circle cx="7" cy="10" r="1.700" /><circle cx="11" cy="6.500" r="1.700" /><circle cx="16" cy="7.500" r="1.700" /><circle cx="19" cy="12" r="1.700" /><path d="M8 18c0-3 2.500-5.500 5-5.500s5 2 4 4.500c-.7 1.800-2.500 2-4.500 2S8 20 8 18z" /></>,
  tag: <><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.500" cy="8.500" r="1.200" /></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" /></>,
  music: <><path d="M9 18V5l11-2v13" /><circle cx="6.500" cy="18" r="2.500" /><circle cx="17.500" cy="16" r="2.500" /></>,
  hourglass: <path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9" />,
  trophy: <path d="M8 4h8v6a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 14v4M8 21h8M9 18h6" />,
  tower: <path d="M12 2v4M10 6h4l1 6 2 9H7l2-9zM9 13h6M8 17h8" />,
  hardhat: <path d="M3 17h18M5 17v-1a7 7 0 0 1 14 0v1M12 9v4M9.500 17v-3.500M14.500 17v-3.500" />,
  play: <><rect x="3" y="5" width="18" height="14" rx="4" /><path d="M10 9.500v5l4.500-2.500z" /></>,
  gamepad: <><rect x="2" y="7" width="20" height="11" rx="5.500" /><path d="M7 10.500v4M5 12.500h4M16 11.500h.01M18 13.500h.01" /></>,
  smile: <><circle cx="12" cy="12" r="9" /><path d="M8 14c1 2 2.500 3 4 3s3-1 4-3M9 9.500h.01M15 9.500h.01" /></>,
  laugh: <><circle cx="12" cy="12" r="9" /><path d="M7 13h10a5 5 0 0 1-10 0zM8.500 9l1.500 1M15.500 9 14 10" /></>,
  mask: <path d="M4 5h16v7a8 8 0 0 1-16 0zM8.500 10l2 1M15.500 10l-2 1M8.500 15c1 1.500 2 2 3.500 2s2.500-.5 3.500-2" />,
  food: <path d="M6 3v6a3 3 0 0 0 6 0V3M9 3v18M17 21V3c-2.500 1.500-3 5-3 8h3" />,
  box: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 12h18M10 15.500h4" /></>,
  speech: <><path d="M4 5h16v11H11l-5 4v-4H4z" /><path d="M8 9.500h8M8 12.500h5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  refresh: <path d="M20 11a8 8 0 0 0-14-4L4 9M4 4v5h5M4 13a8 8 0 0 0 14 4l2-2M20 20v-5h-5" />,
  check: <path d="m5 12.500 4.500 4.500L19 7" />,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  flagFinish: <path d="M5 21V4M5 4h14v9H5M9 4v9M14 4v9" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.900 4.900 7 7M17 17l2.100 2.100M4.900 19.100 7 17M17 7l2.100-2.100" /></>,
  door: <path d="M5 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17M3 21h18M12 12h.01" />,
  crown: <path d="m3 8 4.500 4L12 5l4.500 7L21 8l-2 11H5z" />,
  users: <><circle cx="9" cy="8" r="3.500" /><path d="M2.500 20a6.500 6.500 0 0 1 13 0M16 4.500a3.500 3.500 0 0 1 0 7M18 14.500a6.500 6.500 0 0 1 3.500 5.500" /></>,
  dice: <><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M8.500 8.500h.01M15.500 8.500h.01M12 12h.01M8.500 15.500h.01M15.500 15.500h.01" /></>,
  orb: <><circle cx="12" cy="12" r="9" /><path d="M3 12h5.500M15.500 12H21" /><circle cx="12" cy="12" r="3.500" /></>,
  home: <path d="M3 11.500 12 4l9 7.500M5.500 10v10h13V10M10 20v-5.500h4V20" />,
  key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9M17 6l3 3M14.500 8.500l2.500 2.500" /></>,
  shield: <><path d="M12 3 4.500 6v5.500c0 4.500 3 8 7.500 9.500 4.500-1.500 7.500-5 7.500-9.500V6z" /><path d="m9 12 2.200 2.200L15.500 10" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  leaf: <><path d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15" /><path d="M5 19l9-9" /></>,
  car: <><path d="M4 17v-4l2-5h12l2 5v4zM4 13h16" /><circle cx="8" cy="17" r="1.600" /><circle cx="16" cy="17" r="1.600" /></>,
  edit: <path d="M4 20h4L19 9a2.800 2.800 0 0 0-4-4L4 16zM13.500 6.500l4 4" />,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  moon: <path d="M20 14.500A8.500 8.500 0 0 1 9.500 4 8.500 8.500 0 1 0 20 14.500z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.900 4.900l1.400 1.400M17.700 17.700l1.400 1.400M2 12h2M20 12h2M4.900 19.100l1.400-1.400M17.700 6.300l1.400-1.400" /></>,
  flame: <path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z" />,
  skull: <><path d="M5 11a7 7 0 0 1 14 0v4l-2 1v3h-3v-2h-4v2H7v-3l-2-1z" /><path d="M9.500 11.500h.01M14.500 11.500h.01" /></>,
  bomb: <><circle cx="11" cy="13" r="8" /><path d="m17 7 2-2M19 5l2-1M19 5l1 2M16 8l1.5-1.5" /><path d="M8 11a3.5 3.5 0 0 1 3.5-3.5" /></>,
  brush: <><path d="m9 11-6 6v3h3l6-6" /><path d="m22 2-7.5 7.5a2.121 2.121 0 0 1-3 0l-1-1a2.121 2.121 0 0 1 0-3L18 2h4z" /></>,
  fashion: <><path d="M6 3h12l3 6-9 12L3 9z" /><path d="M11 3 8 9l4 12 4-12-3-6" /></>,
  scale: <><path d="M12 3v18M6 8l6-2 6 2M6 8l-3 7h6L6 8zm12 0-3 7h6l-3-7z" /></>,
  dagger: <><path d="M20.500 3.500 10 14" /><path d="M8 12l4 4" /><path d="M10 14 5 19" /><path d="M3.500 20.500l1.500-1.500" /><path d="M20.500 3.500 21 3" /></>,
  cards: <><rect x="4" y="6" width="12" height="15" rx="2" /><path d="M8 2h12v15" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />
};

export const ICONO_CATEGORIA = {
  'Todas las categorías': 'star',
  'Instituciones': 'landmark',
  'Marcas y empresas': 'briefcase',
  'Ciencia y salud': 'flask',
  'ONGs y ayuda humanitaria': 'heart',
  'Deportes': 'basketball',
  'Tecnología': 'chip',
  'España': 'flag',
  'Economía y finanzas': 'chart',
  'Cine, TV y música': 'clapper',
  'Cultura general': 'bulb',
  'Países': 'globe',
  'Futbolistas': 'soccer',
  'Animales': 'paw',
  'Marcas': 'tag',
  'Películas y series': 'clapper',
  'Cantantes': 'mic',
  'Canciones míticas': 'music',
  'Historia y política': 'hourglass',
  'Atletas y otros deportes': 'trophy',
  'Monumentos históricos': 'tower',
  'Profesiones': 'hardhat',
  'YouTube y ese mundo': 'play',
  'Videojuegos': 'gamepad',
  'Personajes de dibujos': 'smile',
  'Personajes de películas': 'mask',
  'Comida': 'food',
  'Leyendas del futbol': 'crown',
  'Pokemon': 'orb'
};

export const DEGRADADOS = [
  ['#ff6b6b', '#ff9f43'], ['#a855f7', '#6366f1'], ['#06b6d4', '#3b82f6'],
  ['#f43f5e', '#ec4899'], ['#22c55e', '#84cc16'], ['#3b82f6', '#8b5cf6'],
  ['#f59e0b', '#ef4444'], ['#14b8a6', '#22c55e'], ['#ec4899', '#8b5cf6'],
  ['#0ea5e9', '#14b8a6']
];
export const DEGRADADO_TODAS = ['#fbbf24', '#f97316'];

const NUEVOS = {
  whois: <><circle cx="12" cy="8" r="5" /><path d="M10.500 7a1.500 1.500 0 1 1 2.100 1.400c-.4.200-.6.500-.6.900M12 10.600h.01" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  globe: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.300 15.300 0 0 1 4 10 15.300 15.300 0 0 1-4 10 15.300 15.300 0 0 1-4-10 15.300 15.300 0 0 1 4-10z" /></>,
  clapperboard: <><path d="M4 11v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8H4z" /><path d="m4 11 1.600-4.800A2 2 0 0 1 7.500 5h9a2 2 0 0 1 1.900 1.200L20 11H4z" /><path d="m9 5 2.500 6M14 5l2.500 6" /><circle cx="10" cy="16" r="1.500" /><path d="M11.500 16V13h3" /></>,
  detective: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.350-4.350" /><path d="M11 8a3 3 0 0 1 3 3" /></>,
  speedometer: <><path d="M12 2a10 10 0 0 0-10 10c0 4.400 2.800 8.100 6.800 9.500.4.100.7-.2.7-.6v-1.400c0-.3-.2-.6-.5-.7A7.500 7.500 0 1 1 19.500 12" /><circle cx="12" cy="12" r="2" /><path d="m13.400 10.600 3.600-3.600" /></>,
  target: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
  users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.870M16 3.130a4 4 0 0 1 0 7.750" /></>,
  play: <polygon points="5 3 19 12 5 21 5 3" />,
  pause: <><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></>,
  forward: <><polygon points="5 4 15 12 5 20 5 4" /><path d="M19 5v14" /></>,
  bell: <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.300 21a1.900 1.900 0 0 0 3.400 0" />,
  pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></>,
  trophy: <><path d="M6 9H4.500a2.500 2.500 0 0 1 0-5H6M18 9h1.500a2.500 2.500 0 0 0 0-5H18M4 22h16" /><path d="M10 14.660V17c0 .55-.45 1-1 1H7c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-2c-.55 0-1-.45-1-1v-2.340" /><path d="M6 4h12a2 2 0 0 1 2 2v3a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6V6a2 2 0 0 1 2-2Z" /></>,
  crown: <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />,
  clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
};

// Iconos exclusivos para que cada uno de los 36 minijuegos tenga un icono único sin repetir
const EXTRA = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.500-3.500" /></>,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  sleuth: <><path d="M3 10h18" /><path d="M6 10l1.600-5.500h8.800L18 10" /><path d="M7 10v1.500a5 5 0 0 0 7 4.500" /><path d="M10 12.500h.01M14 12.500h.01" /><circle cx="17.500" cy="17.500" r="3" /><path d="M19.700 19.700 22 22" /></>,
  stopwatch: <><circle cx="12" cy="14" r="8" /><path d="M12 14l3-3M10 2h4M12 2v4M19 6l1.500-1.500" /></>,
  podium: <><path d="m12 2 1.100 2.200 2.400.4-1.700 1.700.4 2.400L12 7.500 9.800 8.700l.4-2.400-1.700-1.700 2.400-.4z" /><path d="M9 21V11h6v10M3 21v-6h6M15 21v-4h6M2 21h20" /></>,
  eyeoff: <><path d="M9.900 9.900a3 3 0 1 0 4.200 4.200" /><path d="M10.700 5.100A10.400 10.400 0 0 1 12 5c7 0 10 7 10 7a13.200 13.200 0 0 1-1.700 2.700" /><path d="M6.600 6.600A13.500 13.500 0 0 0 2 12s3 7 10 7a9.700 9.700 0 0 0 5.400-1.600" /><path d="m2 2 20 20" /></>,
  connect: <><circle cx="6" cy="6" r="2.500" /><circle cx="18" cy="6" r="2.500" /><circle cx="6" cy="18" r="2.500" /><circle cx="18" cy="18" r="2.500" /><path d="M8.500 6h7M8.500 18h7M6 8.500v7M18 8.500v7M7.800 7.800l8.400 8.400" /></>,
  quote: <><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" /><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" /></>,
  palette: <><circle cx="13.500" cy="6.500" r=".8" /><circle cx="17.500" cy="10.500" r=".8" /><circle cx="8.500" cy="7.500" r=".8" /><circle cx="6.500" cy="12.500" r=".8" /><path d="M12 2C6.500 2 2 6.500 2 12s4.500 10 10 10c.9 0 1.600-.7 1.600-1.700 0-.4-.2-.8-.4-1.100-.3-.3-.4-.7-.4-1.100a1.600 1.600 0 0 1 1.700-1.700H16.500c3 0 5.500-2.500 5.500-5.500C22 6 17.500 2 12 2z" /></>,
  zoomface: <><circle cx="10.500" cy="10.500" r="7.500" /><path d="m21 21-5.200-5.200" /><path d="M8 9h.01M13 9h.01M8 12.500a3 3 0 0 0 5 0" /></>,
  // Nuevos iconos diferenciados para cada minijuego:
  bingocard: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /><circle cx="12" cy="12" r="1.6" fill="currentColor" /></>,
  careerpath: <><path d="M4 19c3-6 5-6 8-2s5 4 8-6" /><polyline points="16 7 20 11 15 12" /><circle cx="4" cy="19" r="2" /><circle cx="12" cy="17" r="2" /></>,
  numcards: <><rect x="3" y="5" width="11" height="15" rx="2" /><path d="M17 7h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-9" /><path d="M7 10h3v5M7 12.5h2.5" /></>,
  dial10: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5 11 8v8M14.5 8a1.8 1.8 0 0 1 1.8 2v4a1.8 1.8 0 0 1-3.6 0v-4a1.8 1.8 0 0 1 1.8-2z" /></>,
  heartchat: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" /><path d="M12 14.5s-3.5-2.2-3.5-4.6a2 2 0 0 1 3.5-1.2 2 2 0 0 1 3.5 1.2c0 2.4-3.5 4.6-3.5 4.6z" /></>,
  telepathy: <><path d="M9 18a6 6 0 1 1 6 0v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2z" /><path d="M4 9a9 9 0 0 1 2.5-6M20 9a9 9 0 0 0-2.5-6M2 13c0-1.8.5-3.5 1.4-5M22 13c0-1.8-.5-3.5-1.4-5" /><circle cx="12" cy="11" r="1.5" /></>,
  logobadge: <><polygon points="12 2 19 6 19 14 12 22 5 14 5 6 12 2" /><path d="m9 12 2 2 4-4" /></>,
  goal301: <><path d="M3 19V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12" /><path d="M3 10h18M8 5v14M16 5v14" /><circle cx="12" cy="14.5" r="3" /></>,
  teammates: <><circle cx="7.5" cy="7" r="3" /><circle cx="16.5" cy="7" r="3" /><path d="M2.5 19a5 5 0 0 1 10 0M11.5 19a5 5 0 0 1 10 0" /><path d="M10 13h4" /></>,
  futbolgrid: <><rect x="3" y="3" width="18" height="18" rx="2.5" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /><path d="m5 5 2 2M7 5 5 7M11 11l2 2M13 11l-2 2M17 17l2 2M19 17l-2 2" /></>,
  frankenstein: <><rect x="5" y="4" width="14" height="16" rx="4" /><path d="M5 9h14M9 7v3M12 7v3M15 7v3M3 13h2M19 13h2" /><circle cx="9.5" cy="13.5" r="1" /><circle cx="14.5" cy="13.5" r="1" /><path d="M9.5 17h5" /></>,
  tacticboard: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M12 4v16M3 9h3v6H3M21 9h-3v6h3" /><circle cx="12" cy="12" r="2.5" /><path d="m8 15 5-5M11 10h2v2" /></>,
  fourshields: <><path d="M7 3 3.5 4.5v3.5c0 2.5 1.5 4.5 3.5 5.5 2-1 3.5-3 3.5-5.5V4.5z" /><path d="M17 3l-3.5 1.5v3.5c0 2.5 1.5 4.5 3.5 5.5 2-1 3.5-3 3.5-5.5V4.5z" /><path d="M7 13.5 3.5 15v2.5c0 2 1.5 3.5 3.5 4.5 2-1 3.5-2.5 3.5-4.5V15z" /><path d="M17 13.5 13.5 15v2.5c0 2 1.5 3.5 3.5 4.5 2-1 3.5-2.5 3.5-4.5V15z" /></>
};

const ICONOS = { ...P, ...NUEVOS, ...EXTRA };

export default function Icon({ name, size = 24, strokeWidth = 2, className = '', style = {} }) {
  const contenido = ICONOS[name] ?? ICONOS.star;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {contenido}
    </svg>
  );
}