// Iconos propios de Traiciones. Así el juego no depende de que components/Icon.jsx los tenga registrados:
// los que no están aquí se delegan en el Icon.jsx normal.
import React from 'react';
import Icon from '../../components/Icon.jsx';

const PROPIOS = {
  dagger: <><path d="M20.500 3.500 10 14" /><path d="M8 12l4 4" /><path d="M10 14 5 19" /><path d="M3.500 20.500l1.500-1.500" /><path d="M20.500 3.500 21 3" /></>,
  well: <><path d="M5 12h14v8H5z" /><path d="M7 12V6M17 12V6M6 6h12" /><path d="M12 6v4" /><path d="M10 10h4" /></>,
  stable: <><path d="M3 20V9l9-5 9 5v11" /><path d="M9 20v-6h6v6" /><path d="M3 20h18" /></>,
  cart: <><path d="M3 5h3l2 9h10l2-7H7" /><circle cx="9" cy="19" r="1.500" /><circle cx="17" cy="19" r="1.500" /></>,
  sack: <><path d="M9 3h6l-1.500 3h-3z" /><path d="M10.500 6C6 8 4 12 4 16c0 3 2 5 8 5s8-2 8-5c0-4-2-8-6.500-10" /><path d="M10 14h4" /></>,
  bellring: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.300 21a1.900 1.900 0 0 0 3.400 0" /><path d="M2 8c0-2 1-4 2.500-5M22 8c0-2-1-4-2.500-5" /></>
};

export default function IconoT({ name, size = 24, strokeWidth = 2, className = '', style = {} }) {
  const p = PROPIOS[name];
  if (!p) return <Icon name={name} size={size} strokeWidth={strokeWidth} className={className} style={style} />;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">{p}</svg>
  );
}
