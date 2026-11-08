// Iconos propios de Fundadores (los que no estén aquí se delegan en el Icon.jsx normal).
import React from 'react';
import Icon from '../../components/Icon.jsx';

const PROPIOS = {
  coin: <><circle cx="12" cy="12" r="9" /><path d="M12 7v10M9.500 9.500c0-1 1-1.500 2.500-1.500s2.500.7 2.500 1.800c0 2.200-5 1.200-5 3.400 0 1.100 1 1.800 2.500 1.800s2.500-.5 2.500-1.500" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.500 8.500-2 5-5 2 2-5z" /></>,
  scroll: <><path d="M8 3h11a2 2 0 0 1 0 4H8" /><path d="M8 3a2 2 0 0 0-2 2v14a2 2 0 0 1-2 2h11a2 2 0 0 0 2-2V7" /><path d="M10 11h5M10 15h4" /></>,
  brick: <><rect x="3" y="5" width="18" height="14" rx="1" /><path d="M3 12h18M9 5v7M15 12v7" /></>
};

export default function IconoF({ name, size = 24, strokeWidth = 2, className = '', style = {} }) {
  const p = PROPIOS[name];
  if (!p) return <Icon name={name} size={size} strokeWidth={strokeWidth} className={className} style={style} />;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">{p}</svg>
  );
}
