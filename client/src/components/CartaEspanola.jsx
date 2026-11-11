// client/src/components/CartaEspanola.jsx
// Carta de la baraja española dibujada en SVG: pinta en el marco, palos dibujados, números del 1 al 7 y 10, 11, 12
// (sota, caballo y rey). La usan el Mus y el Mus Avanzado.
import React from 'react';
import './CartaEspanola.css';

const COLOR = { oros: '#b45309', copas: '#b91c1c', espadas: '#1d4ed8', bastos: '#15803d' };
// La «pinta»: cortes en el marco que dicen el palo (oros ninguno, copas uno, espadas dos, bastos tres)
const PINTA = { oros: 'none', copas: '22 4 100', espadas: '16 3 6 3 100', bastos: '12 3 5 3 5 3 100' };
const FIGURA = { 10: { e: '💂', t: 'Sota' }, 11: { e: '🏇', t: 'Caballo' }, 12: { e: '🤴', t: 'Rey' } };
const PIPS = {
  1: [[30, 46]],
  2: [[30, 30], [30, 62]],
  3: [[30, 26], [30, 46], [30, 66]],
  4: [[20, 30], [40, 30], [20, 62], [40, 62]],
  5: [[20, 28], [40, 28], [30, 46], [20, 64], [40, 64]],
  6: [[20, 26], [40, 26], [20, 46], [40, 46], [20, 66], [40, 66]],
  7: [[20, 24], [40, 24], [30, 35], [20, 46], [40, 46], [20, 68], [40, 68]]
};

/** El símbolo de un palo, centrado en (0, 0), de unos 10×10. */
export function Palo({ p }) {
  switch (p) {
    case 'oros': return (
      <g>
        <circle r="4.6" fill="#fbbf24" stroke="#92400e" strokeWidth="0.9" />
        <circle r="2.8" fill="none" stroke="#b45309" strokeWidth="0.6" />
        <circle r="1" fill="#b45309" />
      </g>
    );
    case 'copas': return (
      <g stroke="#7f1d1d" strokeWidth="0.6" strokeLinejoin="round">
        <path d="M-4.2,-4.6 H4.2 Q4.2,0 0.9,0.9 V2.6 H2.4 V4.4 H-2.4 V2.6 H-0.9 V0.9 Q-4.2,0 -4.2,-4.6 Z" fill="#dc2626" />
        <path d="M-4.2,-4.6 H4.2" stroke="#fbbf24" strokeWidth="1.1" />
      </g>
    );
    case 'espadas': return (
      <g strokeWidth="0.5" stroke="#1e3a8a">
        <path d="M0,-5.4 L1.1,-4 V2.2 H-1.1 V-4 Z" fill="#bfdbfe" />
        <rect x="-3.2" y="2.1" width="6.4" height="1.2" rx="0.5" fill="#1d4ed8" />
        <rect x="-0.65" y="3.3" width="1.3" height="2" fill="#1e3a8a" />
      </g>
    );
    case 'bastos': return (
      <g transform="rotate(-18)" stroke="#365314" strokeWidth="0.55">
        <path d="M-1,5.2 L-1.5,-2.6 Q-1.6,-5.2 0.2,-5.3 Q1.9,-5.2 1.6,-2.6 L1,5.2 Z" fill="#65a30d" />
        <circle cx="-1.4" cy="-0.6" r="0.6" fill="#3f6212" />
        <circle cx="1.3" cy="1.6" r="0.6" fill="#3f6212" />
      </g>
    );
    default: return null;
  }
}

/**
 * c: { p: palo, n: 1-7 | 10 | 11 | 12 } · esp: marca de carta especial ({ e, t }) · comodin: dibujar un comodín en vez de palo.
 * Sin onClick se pinta como imagen (no como botón).
 */
export default function CartaEspanola({ c, sel = false, onClick, chica = false, oculta = false, marca = null, especial = null, className = '' }) {
  const cls = `cesp${chica ? ' chica' : ''}${sel ? ' sel' : ''}${oculta || (!c && !especial) ? ' dorso' : ''}${especial ? ` esp ${especial.clase || ''}` : ''} ${className}`;
  let dibujo;
  if (oculta || (!c && !especial)) {
    dibujo = (
      <svg viewBox="0 0 60 92" aria-hidden="true">
        <rect x="1" y="1" width="58" height="90" rx="6" fill="#b91c1c" stroke="#7f1d1d" />
        <rect x="5" y="5" width="50" height="82" rx="4" fill="none" stroke="#fde68a" strokeWidth="1.2" />
        <g opacity="0.55" stroke="#fde68a" strokeWidth="0.8">{Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-20 + i * 10},10 l30,72`} />)}</g>
        <circle cx="30" cy="46" r="9" fill="#7f1d1d" stroke="#fde68a" />
      </svg>
    );
  } else if (especial) {
    dibujo = (
      <svg viewBox="0 0 60 92" aria-hidden="true">
        <rect x="1" y="1" width="58" height="90" rx="6" fill="url(#cesp-esp)" stroke="#a16207" />
        <defs><linearGradient id="cesp-esp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fef9c3" /><stop offset="1" stopColor="#fcd34d" /></linearGradient></defs>
        <rect x="4" y="4" width="52" height="84" rx="4" fill="none" stroke="#a16207" strokeWidth="1" strokeDasharray="3 2" />
        <text x="30" y="52" textAnchor="middle" fontSize="26">{especial.e}</text>
        {!chica && <text x="30" y="76" textAnchor="middle" fontSize="8" fontWeight="900" fill="#713f12">{especial.t.toUpperCase()}</text>}
      </svg>
    );
  } else {
    const col = COLOR[c.p];
    const fig = FIGURA[c.n];
    dibujo = (
      <svg viewBox="0 0 60 92" aria-hidden="true">
        <rect x="1" y="1" width="58" height="90" rx="6" fill="#fffdf6" stroke="#d6d3d1" />
        {/* Pinta: arriba y abajo */}
        <path d="M5,5 H55" stroke={col} strokeWidth="1.6" strokeDasharray={PINTA[c.p]} fill="none" />
        <path d="M5,87 H55" stroke={col} strokeWidth="1.6" strokeDasharray={PINTA[c.p]} fill="none" />
        <path d="M5,5 V87 M55,5 V87" stroke={col} strokeWidth="1" opacity="0.5" />
        {/* Esquinas */}
        <text x="8" y="15" fontSize="10" fontWeight="900" fill={col} fontFamily="Georgia, serif">{c.n}</text>
        <g transform="rotate(180 30 46)"><text x="8" y="15" fontSize="10" fontWeight="900" fill={col} fontFamily="Georgia, serif">{c.n}</text></g>
        {fig ? (
          <>
            <rect x="12" y="18" width="36" height="56" rx="4" fill={`${col}14`} stroke={col} strokeWidth="0.7" />
            <text x="30" y="50" textAnchor="middle" fontSize="24">{fig.e}</text>
            <g transform="translate(30 63) scale(1.05)"><Palo p={c.p} /></g>
          </>
        ) : (
          (PIPS[c.n] || []).map(([x, y], i) => <g key={i} transform={`translate(${x} ${y}) scale(${c.n === 1 ? 2.6 : 1.45})`}><Palo p={c.p} /></g>)
        )}
      </svg>
    );
  }
  const etiqueta = oculta || (!c && !especial) ? 'Carta boca abajo' : especial ? especial.t : `${FIGURA[c.n]?.t ?? c.n} de ${c.p}`;
  const contenido = <>{dibujo}{marca && <span className="cesp-marca" title={marca.t}>{marca.e}</span>}</>;
  if (!onClick) return <span className={cls} role="img" aria-label={etiqueta}>{contenido}</span>;
  return <button type="button" className={cls} onClick={onClick} aria-pressed={sel} aria-label={etiqueta}>{contenido}</button>;
}
