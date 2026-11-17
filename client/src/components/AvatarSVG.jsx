// client/src/components/AvatarSVG.jsx
// Pinta el avatar (lib/avatarRealista.js). modo «cara»: busto en un círculo con el color de fondo;
// modo «cuerpo»: el personaje entero (sin fondo, para ponerlo sobre una escena).
import React, { useMemo } from 'react';
import { svgAvatar } from '../lib/avatarRealista.js';

export default function AvatarSVG({ a, fondo = '#6366f1', tam = 40, modo = 'cara', titulo }) {
  const clave = JSON.stringify(a);
  const svg = useMemo(() => svgAvatar(a, { modo, fondo: modo === 'cara' ? fondo : null }), [clave, modo, fondo]); // eslint-disable-line react-hooks/exhaustive-deps
  const estilo = modo === 'cara' ? { width: tam, height: tam } : { width: Math.round(tam * 200 / 420), height: tam };
  return <span className={`av-svg av-${modo}`} style={estilo} role={titulo ? 'img' : undefined} aria-label={titulo} aria-hidden={titulo ? undefined : true} dangerouslySetInnerHTML={{ __html: svg }} />;
}
