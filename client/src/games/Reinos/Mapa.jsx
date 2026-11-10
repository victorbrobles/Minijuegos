// client/src/games/Reinos/Mapa.jsx
// Mapa de hexágonos de «Los Siete Reinos»: color del dueño, tipo de territorio, soldados y murallas.
import React from 'react';
import { TIPOS } from './engine.js';

const R = 26; // radio del hexágono (unidades del SVG)
const W = Math.sqrt(3) * R;
const centro = (x) => ({ cx: W * (x.q + x.r / 2), cy: 1.5 * R * x.r });
const puntos = (cx, cy) => Array.from({ length: 6 }, (_, k) => {
  const a = (Math.PI / 180) * (60 * k - 30);
  return `${(cx + R * 0.96 * Math.cos(a)).toFixed(1)},${(cy + R * 0.96 * Math.sin(a)).toFixed(1)}`;
}).join(' ');

/**
 * resaltados: { [id]: 'origen' | 'destino' | 'mio' | 'objetivo' } · onTocar(id) si se puede tocar.
 * flechas: [{ desde, hacia, c }] (órdenes de conquista ya puestas).
 */
export default function Mapa({ v, resaltados = {}, onTocar, flechas = [] }) {
  const pos = v.mapa.map(centro);
  const xs = pos.map((p) => p.cx); const ys = pos.map((p) => p.cy);
  const min = { x: Math.min(...xs) - W / 2 - 4, y: Math.min(...ys) - R - 4 };
  const ancho = Math.max(...xs) - min.x + W / 2 + 4;
  const alto = Math.max(...ys) - min.y + R + 4;
  const color = (id) => v.reinos.find((r) => r.id === id)?.c;
  return (
    <svg className="rnp-mapa" viewBox={`${min.x} ${min.y} ${ancho} ${alto}`} role="img" aria-label="Mapa de los reinos">
      <defs>
        <marker id="rnp-punta" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#0f172a" />
        </marker>
      </defs>
      {v.mapa.map((x, i) => {
        const { cx, cy } = pos[i];
        const c = color(x.dueno);
        const marca = resaltados[x.id];
        const tocable = Boolean(onTocar && marca && marca !== 'apagado');
        return (
          <g key={x.id} className={`rnp-hex${marca ? ` ${marca}` : ''}${tocable ? ' tocable' : ''}`} onClick={tocable ? () => onTocar(x.id) : undefined}>
            <polygon points={puntos(cx, cy)} fill={c ? `color-mix(in srgb, ${c} 55%, #ffffff)` : x.tipo === 'trono' ? '#fef3c7' : '#f5f0e6'}
              stroke={c || (x.tipo === 'trono' ? '#d97706' : '#cbbfa6')} strokeWidth={x.tipo === 'trono' || x.tipo === 'capital' ? 3 : 1.5} />
            <text x={cx} y={cy - 6} textAnchor="middle" fontSize="14">{TIPOS[x.tipo].e}</text>
            {x.muralla > 0 && <text x={cx} y={cy + 4} textAnchor="middle" fontSize="7" fill="#57534e" fontWeight="800">{'▰'.repeat(x.muralla)}</text>}
            <g>
              <circle cx={cx} cy={cy + 13} r="8" fill={c || '#78716c'} stroke="#ffffff" strokeWidth="1.5" />
              <text x={cx} y={cy + 16.5} textAnchor="middle" fontSize="10" fontWeight="900" fill="#ffffff">{x.soldados}</text>
            </g>
          </g>
        );
      })}
      {flechas.map((f, k) => {
        const a = pos[f.desde]; const b = pos[f.hacia];
        return <line key={k} x1={a.cx} y1={a.cy} x2={a.cx + (b.cx - a.cx) * 0.78} y2={a.cy + (b.cy - a.cy) * 0.78} stroke="#0f172a" strokeWidth="3" strokeDasharray="4 3" markerEnd="url(#rnp-punta)" />;
      })}
    </svg>
  );
}
