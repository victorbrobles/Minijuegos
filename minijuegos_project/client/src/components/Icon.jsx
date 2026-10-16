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
  skull: <><path d="M5 11a7 7 0 0 1 14 0v4l-2 1v3h-3v-2h-4v2H7v-3l-2-1z" /><path d="M9.500 11.500h.01M14.500 11.500h.01" /></>
};

// Icono por nombre de categoría (Siglas y Quién es Quién)
export const ICONO_CATEGORIA = {
  'Todas las categorías': 'star',
  // Siglas
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
  // Quién es Quién
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

// Pares de colores para los degradados de las tarjetas
export const DEGRADADOS = [
  ['#ff6b6b', '#ff9f43'], ['#a855f7', '#6366f1'], ['#06b6d4', '#3b82f6'],
  ['#f43f5e', '#ec4899'], ['#22c55e', '#84cc16'], ['#3b82f6', '#8b5cf6'],
  ['#f59e0b', '#ef4444'], ['#14b8a6', '#22c55e'], ['#ec4899', '#8b5cf6'],
  ['#0ea5e9', '#14b8a6']
];
export const DEGRADADO_TODAS = ['#fbbf24', '#f97316'];

// Iconos añadidos/redefinidos (tienen prioridad sobre los de P)
const NUEVOS = {
  // Juegos
  whois: <><circle cx="12" cy="8" r="5" /><path d="M10.500 7a1.500 1.500 0 1 1 2.100 1.400c-.4.200-.6.500-.6.900M12 10.600h.01" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  globe: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.300 15.300 0 0 1 4 10 15.300 15.300 0 0 1-4 10 15.300 15.300 0 0 1-4-10 15.300 15.300 0 0 1 4-10z" /></>,
  clapperboard: <><path d="M4 11v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8H4z" /><path d="m4 11 1.600-4.800A2 2 0 0 1 7.500 5h9a2 2 0 0 1 1.900 1.200L20 11H4z" /><path d="m9 5 2.500 6M14 5l2.500 6" /><circle cx="10" cy="16" r="1.500" /><path d="M11.500 16V13h3" /></>,
  detective: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.350-4.350" /><path d="M11 8a3 3 0 0 1 3 3" /></>,
  speedometer: <><path d="M12 2a10 10 0 0 0-10 10c0 4.400 2.800 8.100 6.800 9.500.4.100.7-.2.7-.6v-1.400c0-.3-.2-.6-.5-.7A7.500 7.500 0 1 1 19.500 12" /><circle cx="12" cy="12" r="2" /><path d="m13.400 10.600 3.600-3.600" /></>,
  target: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
  // Interfaz
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

const ICONOS = { ...P, ...NUEVOS };

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
