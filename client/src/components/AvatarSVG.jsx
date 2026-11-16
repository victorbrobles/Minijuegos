// client/src/components/AvatarSVG.jsx
// Dibuja el avatar personalizable (piezas de lib/avatarPartes.js) sobre un círculo de color.
import React from 'react';
import { PIELES, COLORES_PELO, COLORES_ROPA } from '../lib/avatarPartes.js';

const TINTA = '#1f2937';
const sombra = 'rgba(0, 0, 0, 0.14)';
const BORDE = 'rgba(15, 23, 42, 0.28)'; // contorno: que la ropa o el gorro se vean aunque sean del color del fondo

/* ───────── Pelo: parte de atrás (detrás de la cabeza) ───────── */
function PeloDetras({ estilo, c }) {
  switch (estilo) {
    case 3: // rizado
      return <ellipse cx="50" cy="38" rx="29" ry="24" fill={c} />;
    case 4: // largo
      return <path d="M27 42 C26 20 39 15 50 15 C61 15 74 20 73 42 L76 84 C70 87 64 86 61 81 L61 52 L39 52 L39 81 C36 86 30 87 24 84 Z" fill={c} />;
    case 5: // coleta
      return <path d="M66 30 C82 32 84 52 76 68 C74 58 70 48 64 42 Z" fill={c} />;
    case 6: // moño
      return <circle cx="50" cy="16" r="9" fill={c} />;
    case 8: // media melena
      return <path d="M28 42 C28 20 40 17 50 17 C60 17 72 20 72 42 L73 64 C67 67 62 65 61 60 L61 48 L39 48 L39 60 C38 65 33 67 27 64 Z" fill={c} />;
    case 11: // trenzas
      return (
        <g fill={c}>
          <path d="M30 44 C28 24 40 17 50 17 C60 17 72 24 70 44 Z" />
          {[0, 1, 2, 3].map((i) => <ellipse key={`l${i}`} cx="31" cy={56 + i * 7} rx="4.5" ry="4" />)}
          {[0, 1, 2, 3].map((i) => <ellipse key={`r${i}`} cx="69" cy={56 + i * 7} rx="4.5" ry="4" />)}
        </g>
      );
    default:
      return null;
  }
}

/* ───────── Pelo: parte de delante (encima de la frente) ───────── */
function PeloDelante({ estilo, c }) {
  switch (estilo) {
    case 1: // corto
    case 5: // coleta
    case 6: // moño
      return <path d="M31 44 C30 26 40 20 50 20 C61 20 70 26 69 44 C66 35 59 31 50 31 C41 31 34 35 31 44 Z" fill={c} />;
    case 2: // flequillo
    case 8: // media melena
      return <path d="M31 47 C29 25 41 18 51 19 C63 20 71 28 69 47 C67 40 64 36 60 33 C53 38 42 38 35 35 C33 38 32 42 31 47 Z" fill={c} />;
    case 3: // rizado
      return (
        <g fill={c}>
          {[[34, 32, 6], [41, 27, 6.5], [50, 25, 7], [59, 27, 6.5], [66, 32, 6], [31, 40, 4.5], [69, 40, 4.5]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
        </g>
      );
    case 4: // largo
      return <path d="M31 46 C29 24 41 18 50 18 C60 18 71 24 69 46 C66 37 60 32 54 31 C50 36 40 38 34 38 C33 40 32 43 31 46 Z" fill={c} />;
    case 7: // cresta
      return <path d="M44 33 C43 20 46 10 50 7 C54 10 57 20 56 33 C53 31 47 31 44 33 Z" fill={c} />;
    case 9: // pinchos
      return <path d="M31 42 L32 27 L38 31 L40 18 L46 26 L50 14 L54 26 L60 18 L62 31 L68 27 L69 42 C64 34 57 31 50 31 C43 31 36 34 31 42 Z" fill={c} />;
    case 10: // raya al lado
      return <path d="M31 46 C29 25 40 19 50 19 C61 19 71 25 69 44 C64 36 58 32 44 31 C40 34 35 39 31 46 Z" fill={c} />;
    case 11: // trenzas (raya en medio)
      return <path d="M31 44 C30 26 40 20 50 20 C61 20 70 26 69 44 C65 35 56 30 50 27 C44 30 35 35 31 44 Z" fill={c} />;
    default:
      return null;
  }
}

/* ───────── Cara ───────── */
function Ojos({ tipo, cejas }) {
  const ceja = (enfado) => (
    <g stroke={cejas} strokeWidth="2.2" strokeLinecap="round">
      <path d={enfado ? 'M38 40 L46 43' : 'M38 41 Q42 39 46 41'} fill="none" />
      <path d={enfado ? 'M62 40 L54 43' : 'M54 41 Q58 39 62 41'} fill="none" />
    </g>
  );
  const punto = (x) => <circle cx={x} cy="47" r="2.6" fill={TINTA} />;
  const arco = (x, abajo = false) => <path d={abajo ? `M${x - 3} 46 Q${x} 49 ${x + 3} 46` : `M${x - 3} 48 Q${x} 44 ${x + 3} 48`} stroke={TINTA} strokeWidth="2" fill="none" strokeLinecap="round" />;
  switch (tipo) {
    case 1: return <g>{ceja()}{arco(42)}{arco(58)}</g>;
    case 2: return <g>{ceja()}{punto(42)}{arco(58)}</g>;
    case 3: return <g>{ceja()}<circle cx="42" cy="47" r="4.2" fill="#fff" /><circle cx="58" cy="47" r="4.2" fill="#fff" /><circle cx="42.6" cy="47.4" r="2.4" fill={TINTA} /><circle cx="58.6" cy="47.4" r="2.4" fill={TINTA} /></g>;
    case 4: return <g>{ceja()}{arco(42, true)}{arco(58, true)}</g>;
    case 5: return <g>{ceja(true)}{punto(42)}{punto(58)}</g>;
    case 6: return <g>{ceja()}<path d="M38.5 47.5 L45.5 47.5 M54.5 47.5 L61.5 47.5" stroke={TINTA} strokeWidth="2" strokeLinecap="round" /></g>;
    default: return <g>{ceja()}{punto(42)}{punto(58)}</g>;
  }
}

function Boca({ tipo }) {
  const trazo = { stroke: '#7f1d1d', strokeWidth: 2.2, fill: 'none', strokeLinecap: 'round' };
  switch (tipo) {
    case 1: return <g><path d="M43 58 Q50 67 57 58 Z" fill="#7f1d1d" /><path d="M44 58.4 L56 58.4 L55 60.4 L45 60.4 Z" fill="#fff" /></g>;
    case 2: return <path d="M45 61 L55 61" {...trazo} />;
    case 3: return <g><path d="M43 58 Q50 66 57 58 Z" fill="#7f1d1d" /><path d="M47 61.5 Q50 67 53 61.5 Z" fill="#f472b6" /></g>;
    case 4: return <ellipse cx="50" cy="61" rx="3" ry="4" fill="#7f1d1d" />;
    case 5: return <path d="M45 61 Q52 63 56 58" {...trazo} />;
    case 6: return <path d="M44 63 Q50 58 56 63" {...trazo} />;
    default: return <path d="M44 59 Q50 64 56 59" {...trazo} />;
  }
}

function Barba({ tipo, c }) {
  switch (tipo) {
    case 1: return <path d="M42.5 56.5 Q50 52.5 57.5 56.5 Q54 59.5 50 57.6 Q46 59.5 42.5 56.5 Z" fill={c} />;
    case 2: return <g fill={c}><path d="M42.5 56.5 Q50 52.5 57.5 56.5 Q54 59.5 50 57.6 Q46 59.5 42.5 56.5 Z" /><path d="M45.5 64.5 Q50 72 54.5 64.5 Q50 66.5 45.5 64.5 Z" /></g>;
    case 3: return <path d="M32 50 C32 66 40 72 50 72 C60 72 68 66 68 50 C66 59 61 63 57 63 C55 58 45 58 43 63 C39 63 34 59 32 50 Z" fill={c} opacity="0.92" />;
    case 4: return <path d="M31 47 C30 72 40 80 50 80 C60 80 70 72 69 47 C67 58 62 64 58 64 C56 58 44 58 42 64 C38 64 33 58 31 47 Z" fill={c} />;
    default: return null;
  }
}

function Gafas({ tipo, color }) {
  const marco = { fill: 'none', stroke: TINTA, strokeWidth: 1.7 };
  switch (tipo) {
    case 1: return <g {...marco}><circle cx="42" cy="47" r="5.6" /><circle cx="58" cy="47" r="5.6" /><path d="M47.6 47 L52.4 47" /></g>;
    case 2: return <g {...marco}><rect x="35.5" y="42.5" width="13" height="9.5" rx="2" /><rect x="51.5" y="42.5" width="13" height="9.5" rx="2" /><path d="M48.5 46 L51.5 46" /></g>;
    case 3: return <g><rect x="35" y="42.5" width="13.5" height="9" rx="3.5" fill="#111827" opacity="0.92" /><rect x="51.5" y="42.5" width="13.5" height="9" rx="3.5" fill="#111827" opacity="0.92" /><path d="M48.5 45.5 L51.5 45.5" stroke="#111827" strokeWidth="1.7" /><path d="M37 44.5 L41 44.5" stroke="#fff" strokeWidth="1.2" opacity="0.6" /></g>;
    case 4: return <g fill="none" stroke={color} strokeWidth="3"><rect x="35" y="42" width="14" height="10" rx="3" /><rect x="51" y="42" width="14" height="10" rx="3" /><path d="M49 46 L51 46" /></g>;
    default: return null;
  }
}

/* ───────── Ropa ───────── */
function Ropa({ tipo, c, piel }) {
  const cuerpo = <path d="M17 100 C17 82 30 74 50 74 C70 74 83 82 83 100 Z" fill={c} stroke={BORDE} strokeWidth="1.6" />;
  switch (tipo) {
    case 1: // sudadera
      return <g>{cuerpo}<path d="M33 79 C36 70 64 70 67 79 C62 76 56 75 50 79 C44 75 38 76 33 79 Z" fill={c} /><path d="M33 79 C36 70 64 70 67 79" stroke={sombra} strokeWidth="3" fill="none" /><path d="M46 79 L45 90 M54 79 L55 90" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" /></g>;
    case 2: // camisa
      return <g>{cuerpo}<path d="M44 74 Q50 80 56 74 Z" fill={piel} /><path d="M43 73 L50 81 L46 86 L39 76 Z M57 73 L50 81 L54 86 L61 76 Z" fill="#ffffff" /><g fill={sombra}><circle cx="50" cy="88" r="1.3" /><circle cx="50" cy="94" r="1.3" /></g></g>;
    case 3: // cuello alto
      return <g>{cuerpo}<rect x="42" y="66" width="16" height="11" rx="4" fill={c} /><rect x="42" y="66" width="16" height="11" rx="4" fill={sombra} /></g>;
    case 4: // tirantes
      return <g>{cuerpo}<path d="M33 79 Q50 96 67 79 L67 76 Q50 86 33 76 Z" fill={piel} /><path d="M33 76 Q50 88 67 76 L67 74 L33 74 Z" fill={piel} /><path d="M36 100 L38 77 M64 100 L62 77" stroke={c} strokeWidth="4" /></g>;
    case 5: // traje
      return <g>{cuerpo}<path d="M43 74 L50 94 L57 74 Z" fill="#ffffff" /><path d="M49 77 L51 77 L52.6 90 L50 94 L47.4 90 Z" fill="#dc2626" /><path d="M43 74 L50 94 L40 84 Z M57 74 L50 94 L60 84 Z" fill={sombra} /></g>;
    default: // camiseta
      return <g>{cuerpo}<path d="M43 74 Q50 82 57 74 Z" fill={piel} /></g>;
  }
}

/* ───────── Complementos ───────── */
function Extra({ tipo, c }) {
  switch (tipo) {
    case 1: // gorra
      return <g><path d="M30 37 C30 21 40 16 50 16 C61 16 70 21 70 37 Z" fill={c} stroke={BORDE} strokeWidth="1.4" /><path d="M58 33 Q78 31 84 37 Q72 40 58 38 Z" fill={c} stroke={BORDE} strokeWidth="1.4" /><path d="M58 33 Q78 31 84 37 Q72 40 58 38 Z" fill={sombra} /><circle cx="50" cy="17" r="2.2" fill={sombra} /></g>;
    case 2: // gorro de lana
      return <g><path d="M30 39 C30 15 70 15 70 39 Z" fill={c} stroke={BORDE} strokeWidth="1.4" /><rect x="28.5" y="33" width="43" height="8" rx="4" fill={c} /><rect x="28.5" y="33" width="43" height="8" rx="4" fill={sombra} /><circle cx="50" cy="13" r="5.5" fill="#f8fafc" /></g>;
    case 3: // corona
      return <path d="M34 27 L33 13 L42 20 L50 9 L58 20 L67 13 L66 27 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1.2" />;
    case 4: // auriculares
      return <g><path d="M28 47 C27 15 73 15 72 47" stroke="#111827" strokeWidth="4" fill="none" /><rect x="24" y="41" width="9" height="14" rx="4" fill={c} /><rect x="67" y="41" width="9" height="14" rx="4" fill={c} /></g>;
    case 5: // pendientes
      return <g fill="#facc15" stroke="#ca8a04" strokeWidth="0.8"><circle cx="31" cy="56" r="2.6" /><circle cx="69" cy="56" r="2.6" /></g>;
    case 6: // lazo
      return <g fill={c}><path d="M60 21 L52 15 L53 27 Z" /><path d="M60 21 L68 15 L67 27 Z" /><circle cx="60" cy="21" r="2.6" /></g>;
    case 7: // pecas
      return <g fill="#a16207" opacity="0.45">{[[39, 53], [42, 55], [45, 53], [55, 53], [58, 55], [61, 53]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="0.9" />)}</g>;
    default:
      return null;
  }
}

/** Avatar dibujado. `a` = piezas; `fondo` = color del círculo. */
export default function AvatarSVG({ a, fondo = '#6366f1', tam = 40, titulo }) {
  const piel = PIELES[a.piel] || PIELES[1];
  const pelo = COLORES_PELO[a.colorPelo] || COLORES_PELO[0];
  const ropa = COLORES_ROPA[a.colorRopa] || COLORES_ROPA[6];
  const gorro = a.extra === 1 || a.extra === 2;
  const id = React.useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 100 100" width={tam} height={tam} role={titulo ? 'img' : undefined} aria-label={titulo} aria-hidden={titulo ? undefined : true} className="av-svg">
      <defs><clipPath id={`c${id}`}><circle cx="50" cy="50" r="50" /></clipPath></defs>
      <g clipPath={`url(#c${id})`}>
        <circle cx="50" cy="50" r="50" fill={fondo} />
        {!gorro && <PeloDetras estilo={a.pelo} c={pelo} />}
        <Ropa tipo={a.ropa} c={ropa} piel={piel} />
        <rect x="43.5" y="60" width="13" height="16" rx="5" fill={piel} />
        <rect x="43.5" y="60" width="13" height="8" fill={sombra} />
        <ellipse cx="31" cy="48" rx="4.2" ry="6" fill={piel} />
        <ellipse cx="69" cy="48" rx="4.2" ry="6" fill={piel} />
        <ellipse cx="50" cy="46" rx="19.5" ry="22" fill={piel} />
        <circle cx="38" cy="55" r="3.2" fill="#f43f5e" opacity="0.13" />
        <circle cx="62" cy="55" r="3.2" fill="#f43f5e" opacity="0.13" />
        <path d="M50 49 Q47.8 54.5 50.5 55.5" stroke={sombra} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <Barba tipo={a.barba} c={pelo} />
        <Boca tipo={a.boca} />
        <Ojos tipo={a.ojos} cejas={a.pelo === 0 ? 'rgba(31, 41, 55, 0.55)' : pelo} />
        <Gafas tipo={a.gafas} color={ropa} />
        {!gorro && <PeloDelante estilo={a.pelo} c={pelo} />}
        {gorro && a.pelo !== 0 && <path d="M31 46 C31 40 33 37 36 36 L64 36 C67 37 69 40 69 46 C66 41 60 39 50 39 C40 39 34 41 31 46 Z" fill={pelo} />}
        <Extra tipo={a.extra} c={a.extra === 6 ? '#ec4899' : ropa} />
      </g>
    </svg>
  );
}
