// client/src/components/AvatarSVG.jsx
// Pinta el avatar. Primero sale el dibujo plano (lib/avatarRealista.js, instantáneo) y, en cuanto está lista, la
// imagen 3D (lib/avatar3d.js, que se dibuja una vez y queda guardada). modo «cara»: busto en un círculo con el color
// de fondo; modo «cuerpo»: el personaje entero (sin fondo, para ponerlo sobre una escena).
import React, { useEffect, useMemo, useState } from 'react';
import { svgAvatar } from '../lib/avatarRealista.js';
import { imagenAvatar, pedirAvatar } from '../lib/avatar3d.js';

export default function AvatarSVG({ a, fondo = '#6366f1', tam = 40, modo = 'cara', titulo }) {
  const clave = JSON.stringify(a);
  const [img, setImg] = useState(() => imagenAvatar(a, modo));
  useEffect(() => {
    let vivo = true;
    const ya = imagenAvatar(a, modo);
    setImg(ya);
    if (ya) return undefined;
    const cancelar = pedirAvatar(a, modo, (url) => { if (vivo && url) setImg(url); });
    return () => { vivo = false; cancelar(); };
  }, [clave, modo]); // eslint-disable-line react-hooks/exhaustive-deps
  const svg = useMemo(() => (img ? null : svgAvatar(a, { modo, fondo: modo === 'cara' ? fondo : null })), [clave, modo, fondo, img]); // eslint-disable-line react-hooks/exhaustive-deps
  const estilo = modo === 'cara' ? { width: tam, height: tam } : { width: typeof tam === 'number' ? Math.round(tam * 200 / 420) : 'auto', height: tam };
  const aria = { role: titulo ? 'img' : undefined, 'aria-label': titulo, 'aria-hidden': titulo ? undefined : true };
  if (img) {
    return (
      <span className={`av-svg av-${modo} av-3d`} style={modo === 'cara' ? { ...estilo, '--fondo': fondo } : estilo} {...aria}>
        <img src={img} alt="" draggable="false" />
      </span>
    );
  }
  return <span className={`av-svg av-${modo}`} style={estilo} {...aria} dangerouslySetInnerHTML={{ __html: svg }} />;
}
