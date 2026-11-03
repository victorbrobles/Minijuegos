// generar-covers.mjs
import fs from 'node:fs';
import path from 'node:path';

// Detecta si se ejecuta desde la raíz del proyecto o desde /client
const posiblesRutas = [
  path.resolve(process.cwd(), 'client/public/covers'),
  path.resolve(process.cwd(), 'public/covers'),
  path.resolve(process.cwd(), 'covers')
];

const coversDir = posiblesRutas.find((p) => fs.existsSync(path.dirname(p))) || posiblesRutas[0];
fs.mkdirSync(coversDir, { recursive: true });

// Tarjeta lateral flotante estilo quien-es-quien.svg
function sideCard({ x, y, w = 116, h = 138, rot = 0, c1, c2, inner }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const id = `sc_${Math.abs(x)}_${Math.abs(y)}_${Math.abs(rot)}`;
  return `
  <g transform="rotate(${rot} ${cx} ${cy})" filter="url(#dropShadow)">
    <defs>
      <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="100%" stop-color="${c2}" />
      </linearGradient>
    </defs>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="url(#${id})" stroke="#ffffff" stroke-width="5.5" />
    <g transform="translate(${x}, ${y})">
      ${inner}
    </g>
  </g>`;
}

// Plantilla base idéntica al layout de quien-es-quien.svg
function buildCoverSVG({ id, colores, cards, centerArt, badgeArt }) {
  const [bg1, bg2] = colores;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg1}" />
      <stop offset="100%" stop-color="${bg2}" />
    </linearGradient>
    <linearGradient id="centerBg_${id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <filter id="dropShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.38" />
    </filter>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.45" />
    </filter>
  </defs>

  <!-- Fondo con degradado oficial de meta.js -->
  <rect width="600" height="450" fill="url(#bg_${id})" />

  <!-- Anillos decorativos tipo radar (estilo quien-es-quien) -->
  <g opacity="0.12">
    <circle cx="300" cy="215" r="235" fill="none" stroke="#ffffff" stroke-width="16" stroke-dasharray="22 18" />
    <circle cx="300" cy="215" r="165" fill="#ffffff" fill-opacity="0.18" />
    <circle cx="300" cy="215" r="105" fill="#ffffff" fill-opacity="0.22" />
  </g>

  <!-- 4 Tarjetas flotantes laterales -->
  ${sideCard({ x: 56, y: 26, rot: -11, ...cards[0] })}
  ${sideCard({ x: 426, y: 26, rot: 11, ...cards[1] })}
  ${sideCard({ x: 24, y: 198, rot: 7, ...cards[2] })}
  ${sideCard({ x: 454, y: 192, rot: -8, ...cards[3] })}

  <!-- Tarjeta principal central -->
  <g filter="url(#dropShadow)">
    <rect x="212" y="20" width="176" height="205" rx="26" fill="#0f172a" stroke="#facc15" stroke-width="6.5" />
    <rect x="224" y="32" width="152" height="181" rx="18" fill="url(#centerBg_${id})" stroke="#334155" stroke-width="2.5" />
    <g transform="translate(212, 20)">
      ${centerArt}
    </g>
  </g>

  <!-- Elemento superpuesto (esquina inferior derecha del marco central) -->
  <g filter="url(#softGlow)">
    ${badgeArt}
  </g>

  <!-- Contenedor inferior oscuro para título/UI -->
  <rect x="34" y="262" width="532" height="156" rx="28" fill="#091126" fill-opacity="0.93" stroke="#eab308" stroke-width="3.5" filter="url(#dropShadow)" />
</svg>`;
}

// Helpers gráficos reutilizables para las mini-tarjetas laterales
const mini = {
  avatar: (skin, hair, shirt, glasses = false) => `
    <circle cx="58" cy="56" r="24" fill="${skin}" />
    <path d="M34 52 Q58 26 82 52 Z" fill="${hair}" />
    <circle cx="50" cy="56" r="3" fill="#0f172a" />
    <circle cx="66" cy="56" r="3" fill="#0f172a" />
    ${glasses ? `<rect x="42" y="50" width="14" height="10" rx="2" fill="none" stroke="#0f172a" stroke-width="2.5"/><rect x="60" y="50" width="14" height="10" rx="2" fill="none" stroke="#0f172a" stroke-width="2.5"/><line x1="56" y1="55" x2="60" y2="55" stroke="#0f172a" stroke-width="2.5"/>` : ''}
    <path d="M49 65 Q58 72 67 65" fill="none" stroke="#0f172a" stroke-width="2.8" stroke-linecap="round" />
    <path d="M26 106 Q58 76 90 106 Z" fill="${shirt}" />
    <rect x="20" y="110" width="76" height="12" rx="6" fill="#0f172a" fill-opacity="0.35" />`,
  shield: (c1, c2) => `
    <path d="M58 24 L88 36 V66 C88 88 58 104 58 104 C58 104 28 88 28 66 V36 Z" fill="${c1}" stroke="#ffffff" stroke-width="3.5" />
    <path d="M58 28 L84 39 V65 C84 84 58 98 58 98 Z" fill="${c2}" />
    <circle cx="58" cy="62" r="11" fill="#ffffff" fill-opacity="0.9" />
    <rect x="22" y="112" width="72" height="10" rx="5" fill="#0f172a" fill-opacity="0.3" />`,
  jersey: (shirt, trim, num) => `
    <path d="M36 30 L48 26 H68 L80 30 L94 48 L82 60 L74 52 V102 H42 V52 L34 60 L22 48 Z" fill="${shirt}" stroke="${trim}" stroke-width="3" />
    <text x="58" y="76" font-family="system-ui, sans-serif" font-size="24" font-weight="900" fill="${trim}" text-anchor="middle">${num}</text>
    <rect x="22" y="112" width="72" height="10" rx="5" fill="#0f172a" fill-opacity="0.3" />`,
  textBadge: (txt, sub = '') => `
    <rect x="18" y="28" width="80" height="62" rx="14" fill="#0f172a" fill-opacity="0.35" stroke="#ffffff" stroke-width="2" stroke-opacity="0.5" />
    <text x="58" y="69" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle">${txt}</text>
    ${sub ? `<text x="58" y="106" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle" opacity="0.9">${sub}</text>` : `<rect x="22" y="108" width="72" height="10" rx="5" fill="#0f172a" fill-opacity="0.3" />`}`,
  star: (color = '#fde047') => `
    <polygon points="58,24 67,46 91,48 73,64 78,88 58,75 38,88 43,64 25,48 49,46" fill="${color}" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round" />
    <rect x="22" y="108" width="72" height="10" rx="5" fill="#0f172a" fill-opacity="0.3" />`,
  iconCircle: (svgInner) => `
    <circle cx="58" cy="58" r="32" fill="#0f172a" fill-opacity="0.32" stroke="#ffffff" stroke-width="2.5" stroke-opacity="0.6" />
    ${svgInner}
    <rect x="22" y="108" width="72" height="10" rx="5" fill="#0f172a" fill-opacity="0.3" />`
};

const badgeCircle = (bg, stroke, inner) => `
  <g transform="translate(358, 178)">
    <circle cx="0" cy="0" r="42" fill="${bg}" stroke="#ffffff" stroke-width="6" />
    <circle cx="0" cy="0" r="33" fill="none" stroke="${stroke}" stroke-width="3" stroke-opacity="0.5" />
    ${inner}
  </g>`;

const soccerBall = (cx, cy, r) => `
  <g transform="translate(${cx}, ${cy})">
    <circle cx="0" cy="0" r="${r}" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
    <polygon points="0,${-r * 0.45} ${r * 0.42},${-r * 0.14} ${r * 0.26},${r * 0.36} ${-r * 0.26},${r * 0.36} ${-r * 0.42},${-r * 0.14}" fill="#0f172a" />
    <line x1="0" y1="${-r * 0.45}" x2="0" y2="${-r}" stroke="#0f172a" stroke-width="2.5" />
    <line x1="${r * 0.42}" y1="${-r * 0.14}" x2="${r * 0.95}" y2="${-r * 0.3}" stroke="#0f172a" stroke-width="2.5" />
    <line x1="${r * 0.26}" y1="${r * 0.36}" x2="${r * 0.6}" y2="${r * 0.8}" stroke="#0f172a" stroke-width="2.5" />
    <line x1="${-r * 0.26}" y1="${r * 0.36}" x2="${-r * 0.6}" y2="${r * 0.8}" stroke="#0f172a" stroke-width="2.5" />
    <line x1="${-r * 0.42}" y1="${-r * 0.14}" x2="${-r * 0.95}" y2="${-r * 0.3}" stroke="#0f172a" stroke-width="2.5" />
  </g>`;

// Definición de las 40 portadas basadas en client/src/games/meta.js
const JUEGOS = [
  {
    id: 'bingoball',
    colores: ['#2563eb', '#0f172a'],
    cards: [
      { c1: '#3b82f6', c2: '#1d4ed8', inner: mini.shield('#ef4444', '#b91c1c') },
      { c1: '#10b981', c2: '#047857', inner: mini.jersey('#facc15', '#1e3a8a', '10') },
      { c1: '#f59e0b', c2: '#b45309', inner: mini.textBadge('BINGO', 'LÍNEA') },
      { c1: '#8b5cf6', c2: '#5b21b6', inner: mini.star('#fde047') }
    ],
    centerArt: `
      <rect x="26" y="24" width="124" height="30" rx="8" fill="#2563eb" />
      <text x="88" y="45" font-family="system-ui, sans-serif" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">BINGO</text>
      ${[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => {
        const hit = r === c;
        return `<rect x="${28 + c * 31}" y="${62 + r * 30}" width="26" height="24" rx="5" fill="${hit ? '#22c55e' : '#334155'}" stroke="${hit ? '#86efac' : '#475569'}" stroke-width="1.5" />`;
      }).join('')).join('')}
      <line x1="34" y1="68" x2="142" y2="172" stroke="#facc15" stroke-width="5" stroke-linecap="round" />`,
    badgeArt: `<g transform="translate(358, 178)">${soccerBall(0, 0, 38)}</g>`
  },
  {
    id: 'trayectoria',
    colores: ['#22c55e', '#14532d'],
    cards: [
      { c1: '#ef4444', c2: '#991b1b', inner: mini.shield('#ffffff', '#ef4444') },
      { c1: '#3b82f6', c2: '#1e40af', inner: mini.shield('#facc15', '#2563eb') },
      { c1: '#f59e0b', c2: '#b45309', inner: mini.jersey('#ffffff', '#0f172a', '9') },
      { c1: '#10b981', c2: '#065f46', inner: mini.textBadge('2018', '2024') }
    ],
    centerArt: `
      <path d="M48 55 H128 L48 115 H128" fill="none" stroke="#475569" stroke-width="5" stroke-dasharray="8 6" stroke-linecap="round" />
      <circle cx="48" cy="55" r="18" fill="#ef4444" stroke="#ffffff" stroke-width="3" />
      <circle cx="128" cy="55" r="18" fill="#3b82f6" stroke="#ffffff" stroke-width="3" />
      <circle cx="48" cy="115" r="18" fill="#f59e0b" stroke="#ffffff" stroke-width="3" />
      <circle cx="128" cy="115" r="20" fill="#22c55e" stroke="#facc15" stroke-width="4" />
      <text x="128" y="123" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle">?</text>
      <rect x="36" y="152" width="104" height="24" rx="12" fill="#22c55e" fill-opacity="0.25" stroke="#22c55e" stroke-width="2" />
      <text x="88" y="168" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#86efac" text-anchor="middle">CARRERA</text>`,
    badgeArt: `<g transform="translate(358, 178)">${soccerBall(0, 0, 38)}</g>`
  },
  {
    id: 'traiciones',
    colores: ['#d97706', '#451a03'],
    cards: [
      { c1: '#f59e0b', c2: '#b45309', inner: mini.iconCircle(`<path d="M58 36 L72 74 L58 66 L44 74 Z" fill="#fde047"/>`) },
      { c1: '#dc2626', c2: '#7f1d1d', inner: mini.textBadge('🤫', 'TRAIDOR') },
      { c1: '#0ea5e9', c2: '#0369a1', inner: mini.iconCircle(`<path d="M44 66 Q58 38 72 66 Z" fill="#38bdf8"/><circle cx="58" cy="44" r="8" fill="#fde047"/>`) },
      { c1: '#7c3aed', c2: '#4c1d95', inner: mini.star('#facc15') }
    ],
    centerArt: `
      <circle cx="88" cy="76" r="42" fill="#f59e0b" fill-opacity="0.2" />
      <!-- Daga dorada -->
      <path d="M88 30 L102 110 L88 124 L74 110 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2" />
      <line x1="88" y1="34" x2="88" y2="114" stroke="#ef4444" stroke-width="3" />
      <rect x="62" y="108" width="52" height="10" rx="5" fill="#facc15" stroke="#b45309" stroke-width="2" />
      <rect x="81" y="118" width="14" height="32" rx="4" fill="#92400e" stroke="#facc15" stroke-width="2" />
      <circle cx="88" cy="154" r="9" fill="#facc15" />`,
    badgeArt: badgeCircle('#dc2626', '#fca5a5', `<path d="M-16 -8 Q0 -24 16 -8 Q0 8 -16 -8 Z" fill="#ffffff"/><circle cx="0" cy="-8" r="5" fill="#0f172a"/><path d="M-12 14 H12" stroke="#facc15" stroke-width="4" stroke-linecap="round"/>`)
  },
  {
    id: 'fundadores',
    colores: ['#ea580c', '#7c2d12'],
    cards: [
      { c1: '#f97316', c2: '#c2410c', inner: mini.iconCircle(`<rect x="42" y="44" width="32" height="28" fill="#fde047"/><polygon points="36,44 58,28 80,44" fill="#ffffff"/>`) },
      { c1: '#3b82f6', c2: '#1d4ed8', inner: mini.textBadge('👑', 'ALCALDE') },
      { c1: '#10b981', c2: '#047857', inner: mini.star('#fde047') },
      { c1: '#a855f7', c2: '#6b21a8', inner: mini.textBadge('🏛️', 'GREMIO') }
    ],
    centerArt: `
      <polygon points="88,34 142,68 34,68" fill="#facc15" stroke="#ca8a04" stroke-width="3" stroke-linejoin="round" />
      <rect x="42" y="68" width="92" height="8" rx="3" fill="#e2e8f0" />
      <rect x="48" y="76" width="14" height="66" fill="#cbd5e1" />
      <rect x="81" y="76" width="14" height="66" fill="#cbd5e1" />
      <rect x="114" y="76" width="14" height="66" fill="#cbd5e1" />
      <rect x="34" y="142" width="108" height="14" rx="4" fill="#f59e0b" />
      <rect x="26" y="156" width="124" height="12" rx="4" fill="#d97706" />`,
    badgeArt: badgeCircle('#ea580c', '#fed7aa', `<path d="M-14 14 L10 -10 M4 -18 L18 -4 L10 4 L-4 -10 Z" stroke="#ffffff" stroke-width="4" fill="#facc15" stroke-linejoin="round"/>`)
  },
  {
    id: 'coleccion',
    colores: ['#06b6d4', '#1e40af'],
    cards: [
      { c1: '#f43f5e', c2: '#be123c', inner: mini.textBadge('x5', 'IGUALES') },
      { c1: '#22c55e', c2: '#15803d', inner: mini.star('#fde047') },
      { c1: '#f59e0b', c2: '#b45309', inner: mini.textBadge('🃏', 'COMODÍN') },
      { c1: '#8b5cf6', c2: '#5b21b6', inner: mini.textBadge('⚠️', '5 TIPOS') }
    ],
    centerArt: `
      <g transform="translate(88, 115)">
        <rect x="-56" y="-75" width="58" height="84" rx="10" transform="rotate(-22)" fill="#f43f5e" stroke="#ffffff" stroke-width="3" />
        <rect x="-28" y="-82" width="58" height="84" rx="10" transform="rotate(-7)" fill="#f59e0b" stroke="#ffffff" stroke-width="3" />
        <rect x="-2" y="-82" width="58" height="84" rx="10" transform="rotate(8)" fill="#06b6d4" stroke="#ffffff" stroke-width="3" />
        <rect x="18" y="-72" width="58" height="84" rx="10" transform="rotate(22)" fill="#22c55e" stroke="#ffffff" stroke-width="3" />
        <circle cx="12" cy="-36" r="14" fill="#fde047" />
      </g>`,
    badgeArt: badgeCircle('#0284c7', '#bae6fd', `<text x="0" y="10" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="#facc15" text-anchor="middle">5/5</text>`)
  },
  {
    id: 'cuentas',
    colores: ['#38bdf8', '#0369a1'],
    cards: [
      { c1: '#22c55e', c2: '#15803d', inner: mini.textBadge('01', 'INICIO') },
      { c1: '#f59e0b', c2: '#b45309', inner: mini.textBadge('42', 'SUBE') },
      { c1: '#a855f7', c2: '#6b21a8', inner: mini.textBadge('87', 'ORDEN') },
      { c1: '#ef4444', c2: '#b91c1c', inner: mini.textBadge('100', 'FINAL') }
    ],
    centerArt: `
      <rect x="30" y="88" width="52" height="72" rx="10" fill="#0284c7" stroke="#ffffff" stroke-width="3" />
      <text x="56" y="132" font-family="system-ui, sans-serif" font-size="24" font-weight="900" fill="#ffffff" text-anchor="middle">24</text>
      <rect x="64" y="58" width="52" height="72" rx="10" fill="#f59e0b" stroke="#ffffff" stroke-width="3" />
      <text x="90" y="102" font-family="system-ui, sans-serif" font-size="24" font-weight="900" fill="#ffffff" text-anchor="middle">58</text>
      <rect x="96" y="30" width="52" height="72" rx="10" fill="#22c55e" stroke="#facc15" stroke-width="3.5" />
      <text x="122" y="74" font-family="system-ui, sans-serif" font-size="24" font-weight="900" fill="#ffffff" text-anchor="middle">99</text>`,
    badgeArt: badgeCircle('#f59e0b', '#fef08a', `<path d="M-12 6 L0 -10 L12 6 M0 -10 V14" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`)
  },
  {
    id: 'descarte',
    colores: ['#f43f5e', '#881337'],
    cards: [
      { c1: '#3b82f6', c2: '#1d4ed8', inner: mini.textBadge('A', 'LIBRE') },
      { c1: '#ef4444', c2: '#991b1b', inner: mini.textBadge('M', '❌') },
      { c1: '#10b981', c2: '#047857', inner: mini.textBadge('R', 'LIBRE') },
      { c1: '#f59e0b', c2: '#b45309', inner: mini.textBadge('30s', 'TIEMPO') }
    ],
    centerArt: `
      <rect x="38" y="36" width="100" height="100" rx="18" fill="#1e293b" stroke="#475569" stroke-width="3" />
      <text x="88" y="106" font-family="system-ui, sans-serif" font-size="64" font-weight="900" fill="#94a3b8" text-anchor="middle">A</text>
      <line x1="46" y1="44" x2="130" y2="128" stroke="#f43f5e" stroke-width="12" stroke-linecap="round" />
      <line x1="130" y1="44" x2="46" y2="128" stroke="#f43f5e" stroke-width="12" stroke-linecap="round" />
      <rect x="38" y="148" width="100" height="22" rx="11" fill="#f43f5e" />
      <text x="88" y="163" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle">ELIMINADA</text>`,
    badgeArt: badgeCircle('#e11d48', '#fecdd3', `<path d="M-12 -12 L12 12 M12 -12 L-12 12" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>`)
  },
  {
    id: 'lobos',
    colores: ['#dc2626', '#1e1b4b'],
    cards: [
      { c1: '#ef4444', c2: '#7f1d1d', inner: mini.textBadge('🐺', 'LOBO') },
      { c1: '#3b82f6', c2: '#1e3a8a', inner: mini.textBadge('👁️', 'VIDENTE') },
      { c1: '#10b981', c2: '#064e3b', inner: mini.textBadge('🧪', 'BRUJA') },
      { c1: '#f59e0b', c2: '#78350f', inner: mini.textBadge('🌾', 'ALDEANO') }
    ],
    centerArt: `
      <circle cx="88" cy="86" r="54" fill="#dc2626" stroke="#f87171" stroke-width="3" />
      <circle cx="72" cy="68" r="10" fill="#b91c1c" opacity="0.6" />
      <circle cx="108" cy="96" r="14" fill="#b91c1c" opacity="0.6" />
      <!-- Silueta de lobo aullando -->
      <path d="M56 142 L64 98 L54 84 L70 74 L74 56 L86 68 L104 62 L98 82 L112 96 L108 142 Z" fill="#090d16" />
      <circle cx="84" cy="74" r="3" fill="#facc15" />`,
    badgeArt: badgeCircle('#991b1b', '#fca5a5', `<path d="M-14 -14 L10 14 M-2 -16 L16 8 M-18 -4 L4 18" stroke="#facc15" stroke-width="4" stroke-linecap="round"/>`)
  },
  {
    id: 'impostor',
    colores: ['#9333ea', '#3b0764'],
    cards: [
      { c1: '#ec4899', c2: '#9d174d', inner: mini.avatar('#fde047', '#9333ea', '#f43f5e', true) },
      { c1: '#06b6d4', c2: '#0e7490', inner: mini.textBadge('🤫', 'SECRETO') },
      { c1: '#f59e0b', c2: '#b45309', inner: mini.textBadge('💬', 'PISTA') },
      { c1: '#22c55e', c2: '#15803d', inner: mini.avatar('#fed7aa', '#1e293b', '#3b82f6', false) }
    ],
    centerArt: `
      <path d="M40 52 C40 34 136 34 136 52 V106 C136 142 88 164 88 164 C88 164 40 142 40 106 Z" fill="#a855f7" stroke="#ffffff" stroke-width="4" />
      <path d="M88 38 V162 C88 162 134 140 134 106 V52 C134 40 88 38 88 38 Z" fill="#6b21a8" />
      <ellipse cx="66" cy="84" rx="12" ry="8" fill="#0f172a" />
      <ellipse cx="110" cy="84" rx="12" ry="8" fill="#facc15" />
      <path d="M64 124 Q88 140 112 124" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" />`,
    badgeArt: badgeCircle('#7e22ce', '#e9d5ff', `<text x="0" y="11" font-family="system-ui, sans-serif" font-size="32" font-weight="900" fill="#facc15" text-anchor="middle">?</text>`)
  },
  {
    id: 'conecta',
    colores: ['#0284c7', '#1e3a8a'],
    cards: [
      { c1: '#facc15', c2: '#ca8a04', inner: mini.textBadge('G1', 'FÁCIL') },
      { c1: '#22c55e', c2: '#15803d', inner: mini.textBadge('G2', 'MEDIO') },
      { c1: '#38bdf8', c2: '#0284c7', inner: mini.textBadge('G3', 'DIFÍCIL') },
      { c1: '#a855f7', c2: '#6b21a8', inner: mini.textBadge('G4', 'EXPERTO') }
    ],
    centerArt: `
      ${['#facc15', '#22c55e', '#38bdf8', '#a855f7'].map((col, r) =>
        [0, 1, 2, 3].map((c) => `<rect x="${28 + c * 31}" y="${34 + r * 36}" width="26" height="28" rx="6" fill="${col}" />`).join('')
      ).join('')}`,
    badgeArt: badgeCircle('#0369a1', '#7dd3fc', `<path d="M-12 4 L-4 -4 M4 4 L12 -4 M-6 -8 H6 A10 10 0 0 1 6 12 H-6 A10 10 0 0 1 -6 -8 Z" fill="none" stroke="#facc15" stroke-width="4" stroke-linecap="round"/>`)
  },
  {
    id: 'buscaminas',
    colores: ['#64748b', '#090d16'],
    cards: [
      { c1: '#22c55e', c2: '#15803d', inner: mini.textBadge('+1', 'SEGURO') },
      { c1: '#eab308', c2: '#a16207', inner: mini.textBadge('+2', 'RIESGO') },
      { c1: '#ef4444', c2: '#991b1b', inner: mini.textBadge('💣', 'BOOM') },
      { c1: '#3b82f6', c2: '#1d4ed8', inner: mini.textBadge('+3', 'EXPERTO') }
    ],
    centerArt: `
      <circle cx="88" cy="108" r="44" fill="#0f172a" stroke="#475569" stroke-width="4" />
      <circle cx="72" cy="92" r="10" fill="#ffffff" opacity="0.25" />
      <rect x="78" y="54" width="20" height="14" rx="3" fill="#475569" />
      <path d="M88 54 Q96 34 118 38" fill="none" stroke="#fde047" stroke-width="4" stroke-linecap="round" />
      <polygon points="122,38 132,30 126,42 138,46 124,48 126,60 116,50 106,54 114,44 108,34" fill="#ef4444" />
      <circle cx="122" cy="42" r="5" fill="#facc15" />`,
    badgeArt: badgeCircle('#ef4444', '#fca5a5', `<text x="0" y="10" font-family="system-ui, sans-serif" font-size="26" font-weight="900" fill="#ffffff" text-anchor="middle">!</text>`)
  },
  {
    id: 'rasgos',
    colores: ['#f97316', '#9a3412'],
    cards: [
      { c1: '#ec4899', c2: '#be185d', inner: mini.avatar('#fde047', '#0f172a', '#3b82f6', true) },
      { c1: '#8b5cf6', c2: '#5b21b6', inner: mini.textBadge('👀', 'OJOS') },
      { c1: '#06b6d4', c2: '#0e7490', inner: mini.textBadge('📸', 'ZOOM') },
      { c1: '#22c55e', c2: '#15803d', inner: mini.star('#fde047') }
    ],
    centerArt: `
      <circle cx="88" cy="96" r="42" fill="#fed7aa" />
      <path d="M46 84 Q88 42 130 84 Z" fill="#eab308" />
      <rect x="54" y="82" width="28" height="16" rx="4" fill="#0f172a" />
      <rect x="94" y="82" width="28" height="16" rx="4" fill="#0f172a" />
      <line x1="82" y1="90" x2="94" y2="90" stroke="#0f172a" stroke-width="4" />
      <path d="M72 116 Q88 128 104 116" fill="none" stroke="#ef4444" stroke-width="4" stroke-linecap="round" />
      <!-- Visor de cámara -->
      <path d="M34 52 V36 H50 M126 36 H142 V52 M34 140 V156 H50 M126 156 H142 V140" fill="none" stroke="#facc15" stroke-width="4" stroke-linecap="round" />`,
    badgeArt: badgeCircle('#ea580c', '#fed7aa', `<circle cx="0" cy="0" r="14" fill="none" stroke="#ffffff" stroke-width="4"/><circle cx="0" cy="0" r="5" fill="#facc15"/>`)
  },
  {
    id: 'adivina',
    colores: ['#ec4899', '#831843'],
    cards: [
      { c1: '#f43f5e', c2: '#be123c', inner: mini.textBadge('🎬', 'CINE') },
      { c1: '#8b5cf6', c2: '#5b21b6', inner: mini.textBadge('🎵', 'AUDIO') },
      { c1: '#f59e0b', c2: '#b45309', inner: mini.star('#fde047') },
      { c1: '#06b6d4', c2: '#0e7490', inner: mini.textBadge('20s', 'CLIP') }
    ],
    centerArt: `
      <!-- Claqueta de cine -->
      <rect x="34" y="72" width="108" height="84" rx="10" fill="#1e293b" stroke="#ffffff" stroke-width="3" />
      <g transform="rotate(-10 34 72)">
        <rect x="34" y="48" width="108" height="22" rx="5" fill="#facc15" stroke="#ffffff" stroke-width="2.5" />
        <path d="M52 48 L42 70 M82 48 L72 70 M112 48 L102 70" stroke="#0f172a" stroke-width="8" />
      </g>
      <path d="M76 98 L108 116 L76 134 Z" fill="#ec4899" />`,
    badgeArt: badgeCircle('#db2777', '#fbcfe8', `<path d="M-6 10 V-14 L14 -18 V6" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="-10" cy="10" r="6" fill="#facc15"/><circle cx="10" cy="6" r="6" fill="#facc15"/>`)
  },
  {
    id: 'cancion',
    colores: ['#a3e635', '#15803d'],
    cards: [
      { c1: '#22c55e', c2: '#15803d', inner: mini.textBadge('🔈', 'BAJO') },
      { c1: '#eab308', c2: '#a16207', inner: mini.textBadge('🔉', 'SUBE') },
      { c1: '#ef4444', c2: '#b91c1c', inner: mini.textBadge('🔊', 'TOPE') },
      { c1: '#3b82f6', c2: '#1d4ed8', inner: mini.textBadge('30s', 'PUNTOS') }
    ],
    centerArt: `
      <!-- Barras de ecualizador -->
      <rect x="34" y="118" width="14" height="38" rx="7" fill="#4ade80" />
      <rect x="56" y="96" width="14" height="60" rx="7" fill="#a3e635" />
      <rect x="78" y="68" width="14" height="88" rx="7" fill="#facc15" />
      <rect x="100" y="48" width="14" height="108" rx="7" fill="#fb923c" />
      <rect x="122" y="32" width="14" height="124" rx="7" fill="#ef4444" />`,
    badgeArt: badgeCircle('#16a34a', '#bbf7d0', `<path d="M-12 -6 H-4 L8 -16 V16 L-4 6 H-12 Z" fill="#ffffff"/><path d="M14 -8 Q22 0 14 8" fill="none" stroke="#facc15" stroke-width="4" stroke-linecap="round"/>`)
  },
  {
    id: 'frasescelebres',
    colores: ['#06b6d4', '#164e63'],
    cards: [
      { c1: '#f59e0b', c2: '#b45309', inner: mini.textBadge('🏛️', 'HISTORIA') },
      { c1: '#ec4899', c2: '#9d174d', inner: mini.textBadge('🎤', 'FAMOSOS') },
      { c1: '#22c55e', c2: '#15803d', inner: mini.textBadge('⚽', 'DEPORTE') },
      { c1: '#8b5cf6', c2: '#5b21b6', inner: mini.textBadge('🎬', 'CINE') }
    ],
    centerArt: `
      <rect x="28" y="38" width="120" height="96" rx="18" fill="#0891b2" stroke="#67e8f9" stroke-width="3" />
      <polygon points="62,134 86,134 54,162" fill="#0891b2" />
      <text x="88" y="114" font-family="Georgia, serif" font-size="88" font-weight="900" fill="#facc15" text-anchor="middle">“”</text>`,
    badgeArt: badgeCircle('#0e7490', '#a5f3fc', `<path d="M-10 14 L14 -14 C18 -10 14 4 -2 10 Z" fill="#facc15" stroke="#ffffff" stroke-width="2.5"/>`)
  },
  {
    id: 'colores',
    colores: ['#f472b6', '#f59e0b'],
    cards: [
      { c1: '#ef4444', c2: '#b91c1c', inner: mini.iconCircle(`<circle cx="58" cy="58" r="20" fill="#ef4444" stroke="#ffffff" stroke-width="3"/>`) },
      { c1: '#3b82f6', c2: '#1d4ed8', inner: mini.iconCircle(`<circle cx="58" cy="58" r="20" fill="#3b82f6" stroke="#ffffff" stroke-width="3"/>`) },
      { c1: '#eab308', c2: '#a16207', inner: mini.iconCircle(`<circle cx="58" cy="58" r="20" fill="#facc15" stroke="#ffffff" stroke-width="3"/>`) },
      { c1: '#22c55e', c2: '#15803d', inner: mini.iconCircle(`<circle cx="58" cy="58" r="20" fill="#22c55e" stroke="#ffffff" stroke-width="3"/>`) }
    ],
    centerArt: `
      <circle cx="68" cy="78" r="34" fill="#ef4444" fill-opacity="0.9" stroke="#ffffff" stroke-width="3" />
      <circle cx="108" cy="78" r="34" fill="#3b82f6" fill-opacity="0.9" stroke="#ffffff" stroke-width="3" />
      <circle cx="88" cy="116" r="34" fill="#facc15" fill-opacity="0.9" stroke="#ffffff" stroke-width="3" />`,
    badgeArt: badgeCircle('#db2777', '#fbcfe8', `<circle cx="-10" cy="-6" r="6" fill="#ef4444"/><circle cx="6" cy="-10" r="6" fill="#38bdf8"/><circle cx="10" cy="6" r="6" fill="#facc15"/><circle cx="-6" cy="10" r="6" fill="#4ade80"/>`)
  },
  {
    id: 'siglas',
    colores: ['#6366f1', '#312e81'],
    cards: [
      { c1: '#ec4899', c2: '#9d174d', inner: mini.textBadge('ONU', 'SIGLA') },
      { c1: '#06b6d4', c2: '#0e7490', inner: mini.textBadge('VIP', 'SIGLA') },
      { c1: '#f59e0b', c2: '#b45309', inner: mini.textBadge('ADN', 'SIGLA') },
      { c1: '#22c55e', c2: '#15803d', inner: mini.textBadge('SOS', 'SIGLA') }
    ],
    centerArt: `
      <rect x="26" y="54" width="38" height="48" rx="8" fill="#4f46e5" stroke="#a5b4fc" stroke-width="2.5" />
      <text x="45" y="88" font-family="system-ui, sans-serif" font-size="26" font-weight="900" fill="#ffffff" text-anchor="middle">A.</text>
      <rect x="69" y="54" width="38" height="48" rx="8" fill="#6366f1" stroke="#a5b4fc" stroke-width="2.5" />
      <text x="88" y="88" font-family="system-ui, sans-serif" font-size="26" font-weight="900" fill="#facc15" text-anchor="middle">B.</text>
      <rect x="112" y="54" width="38" height="48" rx="8" fill="#4f46e5" stroke="#a5b4fc" stroke-width="2.5" />
      <text x="131" y="88" font-family="system-ui, sans-serif" font-size="26" font-weight="900" fill="#ffffff" text-anchor="middle">C.</text>
      <rect x="34" y="122" width="108" height="12" rx="6" fill="#38bdf8" />
      <rect x="48" y="142" width="80" height="12" rx="6" fill="#94a3b8" />`,
    badgeArt: badgeCircle('#4f46e5', '#c7d2fe', `<circle cx="-4" cy="-4" r="12" fill="none" stroke="#facc15" stroke-width="4"/><line x1="5" y1="5" x2="16" y2="16" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>`)
  },
  {
    id: 'rankings',
    colores: ['#facc15', '#a16207'],
    cards: [
      { c1: '#eab308', c2: '#a16207', inner: mini.textBadge('#1', 'ORO') },
      { c1: '#94a3b8', c2: '#475569', inner: mini.textBadge('#2', 'PLATA') },
      { c1: '#d97706', c2: '#78350f', inner: mini.textBadge('#3', 'BRONCE') },
      { c1: '#3b82f6', c2: '#1d4ed8', inner: mini.textBadge('TOP', 'ORDEN') }
    ],
    centerArt: `
      <!-- Podio 1-2-3 -->
      <rect x="30" y="96" width="38" height="64" rx="6" fill="#94a3b8" />
      <text x="49" y="132" font-family="system-ui, sans-serif" font-size="24" font-weight="900" fill="#0f172a" text-anchor="middle">2</text>
      <rect x="69" y="64" width="38" height="96" rx="6" fill="#facc15" />
      <text x="88" y="114" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="#0f172a" text-anchor="middle">1</text>
      <rect x="108" y="112" width="38" height="48" rx="6" fill="#d97706" />
      <text x="127" y="142" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle">3</text>
      <polygon points="74,52 80,36 88,46 96,36 102,52" fill="#fde047" />`,
    badgeArt: badgeCircle('#ca8a04', '#fef08a', `<path d="M-8 -12 V12 M-16 -4 L-8 -12 L0 -4 M8 12 V-12 M0 4 L8 12 L16 4" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`)
  },
  {
    id: 'aproximacion',
    colores: ['#8b5cf6', '#4c1d95'],
    cards: [
      { c1: '#06b6d4', c2: '#0e7490', inner: mini.textBadge('≈', 'ESTIMA') },
      { c1: '#f43f5e', c2: '#be123c', inner: mini.textBadge('🎯', 'CERCA') },
      { c1: '#22c55e', c2: '#15803d', inner: mini.textBadge('10⁶', 'CIFRAS') },
      { c1: '#f59e0b', c2: '#b45309', inner: mini.star('#fde047') }
    ],
    centerArt: `
      <circle cx="88" cy="96" r="56" fill="#ef4444" stroke="#ffffff" stroke-width="3" />
      <circle cx="88" cy="96" r="38" fill="#ffffff" />
      <circle cx="88" cy="96" r="22" fill="#ef4444" />
      <circle cx="88" cy="96" r="9" fill="#facc15" />
      <line x1="138" y1="42" x2="90" y2="94" stroke="#0f172a" stroke-width="5" stroke-linecap="round" />
      <polygon points="136,44 148,32 146,48 130,50" fill="#38bdf8" />`,
    badgeArt: badgeCircle('#7c3aed', '#ddd6fe', `<text x="0" y="10" font-family="system-ui, sans-serif" font-size="24" font-weight="900" fill="#facc15" text-anchor="middle">±1</text>`)
  },
  {
    id: 'velocidad',
    colores: ['#84cc16', '#365314'],
    cards: [
      { c1: '#ef4444', c2: '#b91c1c', inner: mini.textBadge('60s', 'RELOJ') },
      { c1: '#3b82f6', c2: '#1d4ed8', inner: mini.textBadge('⚡', 'VELOZ') },
      { c1: '#f59e0b', c2: '#b45309', inner: mini.textBadge('x2', 'ESPECIAL') },
      { c1: '#22c55e', c2: '#15803d', inner: mini.star('#fde047') }
    ],
    centerArt: `
      <rect x="74" y="24" width="28" height="10" rx="4" fill="#facc15" />
      <circle cx="88" cy="104" r="54" fill="#1e293b" stroke="#84cc16" stroke-width="6" />
      <path d="M88 60 A44 44 0 0 1 132 104 L88 104 Z" fill="#ef4444" opacity="0.85" />
      <line x1="88" y1="104" x2="116" y2="78" stroke="#facc15" stroke-width="5" stroke-linecap="round" />
      <circle cx="88" cy="104" r="6" fill="#ffffff" />
      <text x="88" y="138" font-family="system-ui, sans-serif" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle">60s</text>`,
    badgeArt: badgeCircle('#65a30d', '#d9f99d', `<polygon points="4,-18 -14,2 -2,2 -6,18 14,-2 2,-2" fill="#facc15"/>`)
  },
  {
    id: 'rapidfire',
    colores: ['#ef4444', '#7f1d1d'],
    cards: [
      { c1: '#f97316', c2: '#c2410c', inner: mini.textBadge('🔥', 'RACHA') },
      { c1: '#eab308', c2: '#a16207', inner: mini.textBadge('🔄', 'REBOTE') },
      { c1: '#3b82f6', c2: '#1d4ed8', inner: mini.textBadge('60s', 'TURNO') },
      { c1: '#ec4899', c2: '#9d174d', inner: mini.star('#fde047') }
    ],
    centerArt: `
      <polygon points="104,28 52,102 86,102 68,166 130,86 94,86" fill="#facc15" stroke="#ffffff" stroke-width="3" stroke-linejoin="round" />`,
    badgeArt: badgeCircle('#dc2626', '#fecaca', `<path d="M-12 0 A12 12 0 1 1 8 9 M8 9 L14 2 M8 9 L1 12" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>`)
  },
  {
    id: 'pistas',
    colores: ['#475569', '#1e293b'],
    cards: [
      { c1: '#3b82f6', c2: '#1d4ed8', inner: mini.textBadge('#1', 'PISTA 1') },
      { c1: '#eab308', c2: '#a16207', inner: mini.textBadge('#3', 'PISTA 3') },
      { c1: '#ef4444', c2: '#991b1b', inner: mini.textBadge('❤️❤️❤️', 'VIDAS') },
      { c1: '#10b981', c2: '#047857', inner: mini.textBadge('#6', 'FINAL') }
    ],
    centerArt: `
      <!-- Sombrero de detective y lupa -->
      <ellipse cx="88" cy="86" rx="58" ry="14" fill="#64748b" />
      <path d="M46 84 C46 44 130 44 130 84 Z" fill="#94a3b8" />
      <rect x="48" y="74" width="80" height="8" rx="3" fill="#facc15" />
      <text x="88" y="152" font-family="system-ui, sans-serif" font-size="44" font-weight="900" fill="#facc15" text-anchor="middle">?</text>`,
    badgeArt: badgeCircle('#334155', '#cbd5e1', `<circle cx="-4" cy="-4" r="12" fill="#38bdf8" fill-opacity="0.4" stroke="#ffffff" stroke-width="4"/><line x1="5" y1="5" x2="16" y2="16" stroke="#facc15" stroke-width="6" stroke-linecap="round"/>`)
  },
  {
    id: 'ubicacion',
    colores: ['#10b981', '#064e3b'],
    cards: [
      { c1: '#3b82f6', c2: '#1d4ed8', inner: mini.textBadge('🗼', 'PARÍS') },
      { c1: '#f59e0b', c2: '#b45309', inner: mini.textBadge('🗽', 'NY') },
      { c1: '#ef4444', c2: '#b91c1c', inner: mini.textBadge('📍', 'SEÑUELO') },
      { c1: '#8b5cf6', c2: '#5b21b6', inner: mini.textBadge('🌍', 'MUNDO') }
    ],
    centerArt: `
      <circle cx="88" cy="102" r="54" fill="#0284c7" stroke="#38bdf8" stroke-width="3" />
      <path d="M54 78 Q72 64 88 82 T124 90 L114 128 Q88 136 62 118 Z" fill="#22c55e" />
      <ellipse cx="88" cy="102" rx="54" ry="22" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.4" />
      <!-- Pin de ubicación -->
      <path d="M88 88 C88 88 112 58 112 42 A24 24 0 1 0 64 42 C64 58 88 88 88 88 Z" fill="#ef4444" stroke="#ffffff" stroke-width="3" />
      <circle cx="88" cy="42" r="8" fill="#facc15" />`,
    badgeArt: badgeCircle('#059669', '#a7f3d0', `<polygon points="0,-18 6,-4 18,0 6,4 0,18 -6,4 -18,0 -6,-4" fill="#facc15"/>`)
  },
  {
    id: 'masmenos',
    colores: ['#3b82f6', '#1d4ed8'],
    cards: [
      { c1: '#22c55e', c2: '#15803d', inner: mini.textBadge('▲', 'MAYOR') },
      { c1: '#ef4444', c2: '#b91c1c', inner: mini.textBadge('▼', 'MENOR') },
      { c1: '#f59e0b', c2: '#b45309', inner: mini.textBadge('🔥', 'RACHA') },
      { c1: '#8b5cf6', c2: '#5b21b6', inner: mini.textBadge('VS', 'DUELO') }
    ],
    centerArt: `
      <rect x="28" y="34" width="120" height="58" rx="12" fill="#22c55e" />
      <polygon points="88,46 108,74 68,74" fill="#ffffff" />
      <rect x="28" y="106" width="120" height="58" rx="12" fill="#ef4444" />
      <polygon points="88,152 108,124 68,124" fill="#ffffff" />`,
    badgeArt: badgeCircle('#1e40af', '#93c5fd', `<text x="0" y="9" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#facc15" text-anchor="middle">VS</text>`)
  },
  {
    id: 'conoce',
    colores: ['#818cf8', '#3730a3'],
    cards: [
      { c1: '#ec4899', c2: '#be185d', inner: mini.avatar('#fde047', '#9a3412', '#22c55e', false) },
      { c1: '#06b6d4', c2: '#0e7490', inner: mini.avatar('#fed7aa', '#0f172a', '#f43f5e', true) },
      { c1: '#f59e0b', c2: '#b45309', inner: mini.textBadge('15', 'RONDAS') },
      { c1: '#10b981', c2: '#047857', inner: mini.textBadge('❤️', 'AMIGOS') }
    ],
    centerArt: `
      <rect x="26" y="42" width="92" height="66" rx="16" fill="#6366f1" stroke="#ffffff" stroke-width="3" />
      <polygon points="44,108 62,108 38,126" fill="#6366f1" />
      <rect x="58" y="78" width="92" height="66" rx="16" fill="#ec4899" stroke="#ffffff" stroke-width="3" />
      <polygon points="118,144 134,144 142,162" fill="#ec4899" />
      <path d="M104 102 C104 94 92 94 92 102 C92 94 80 94 80 102 C80 114 92 122 92 122 C92 122 104 114 104 102 Z" fill="#ffffff" />`,
    badgeArt: badgeCircle('#4f46e5', '#c7d2fe', `<text x="0" y="10" font-family="system-ui, sans-serif" font-size="26" font-weight="900" fill="#facc15" text-anchor="middle">?</text>`)
  },
  {
    id: 'ciegas',
    colores: ['#f59e0b', '#92400e'],
    cards: [
      { c1: '#3b82f6', c2: '#1d4ed8', inner: mini.textBadge('1º', 'CIEGAS') },
      { c1: '#ef4444', c2: '#b91c1c', inner: mini.textBadge('3º', 'AZAR') },
      { c1: '#10b981', c2: '#047857', inner: mini.textBadge('5º', 'ORDEN') },
      { c1: '#8b5cf6', c2: '#5b21b6', inner: mini.textBadge('🗳️', 'VOTOS') }
    ],
    centerArt: `
      ${[1, 2, 3, 4, 5].map((n, i) => `
        <rect x="32" y="${32 + i * 28}" width="26" height="22" rx="6" fill="#facc15" />
        <text x="45" y="${48 + i * 28}" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#0f172a" text-anchor="middle">${n}</text>
        <rect x="64" y="${32 + i * 28}" width="80" height="22" rx="6" fill="#334155" />
        <text x="104" y="${48 + i * 28}" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#94a3b8" text-anchor="middle">???</text>
      `).join('')}`,
    badgeArt: badgeCircle('#d97706', '#fde68a', `<path d="M-16 0 Q0 -14 16 0 Q0 14 -16 0 Z" fill="none" stroke="#ffffff" stroke-width="3.5"/><line x1="-16" y1="14" x2="16" y2="-14" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>`)
  },
  {
    id: 'unoadiez',
    colores: ['#c084fc', '#9d174d'],
    cards: [
      { c1: '#3b82f6', c2: '#1d4ed8', inner: mini.textBadge('1', 'MÍNIMO') },
      { c1: '#10b981', c2: '#047857', inner: mini.textBadge('5', 'MEDIO') },
      { c1: '#f59e0b', c2: '#b45309', inner: mini.textBadge('8', 'ALTO') },
      { c1: '#ef4444', c2: '#b91c1c', inner: mini.textBadge('10', 'TOPE') }
    ],
    centerArt: `
      <path d="M36 126 A52 52 0 1 1 140 126" fill="none" stroke="#334155" stroke-width="16" stroke-linecap="round" />
      <path d="M36 126 A52 52 0 0 1 124 62" fill="none" stroke="#ec4899" stroke-width="16" stroke-linecap="round" />
      <line x1="88" y1="116" x2="118" y2="68" stroke="#facc15" stroke-width="6" stroke-linecap="round" />
      <circle cx="88" cy="116" r="9" fill="#ffffff" />
      <text x="88" y="156" font-family="system-ui, sans-serif" font-size="24" font-weight="900" fill="#facc15" text-anchor="middle">1 - 10</text>`,
    badgeArt: badgeCircle('#be185d', '#fbcfe8', `<text x="0" y="10" font-family="system-ui, sans-serif" font-size="26" font-weight="900" fill="#ffffff" text-anchor="middle">10</text>`)
  },
  {
    id: 'quienmas',
    colores: ['#fb7185', '#be123c'],
    cards: [
      { c1: '#f59e0b', c2: '#b45309', inner: mini.avatar('#fde047', '#7c2d12', '#3b82f6', false) },
      { c1: '#8b5cf6', c2: '#5b21b6', inner: mini.avatar('#fed7aa', '#0f172a', '#10b981', true) },
      { c1: '#06b6d4', c2: '#0e7490', inner: mini.textBadge('🗳️', 'VOTA') },
      { c1: '#22c55e', c2: '#15803d', inner: mini.textBadge('🌶️', 'PICANTE') }
    ],
    centerArt: `
      <circle cx="88" cy="96" r="28" fill="#facc15" />
      <circle cx="80" cy="92" r="3.5" fill="#0f172a" />
      <circle cx="96" cy="92" r="3.5" fill="#0f172a" />
      <path d="M80 104 Q88 112 96 104" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
      <!-- Flechas apuntando al centro -->
      <path d="M32 42 L56 66 M144 42 L120 66 M32 150 L56 126 M144 150 L120 126" stroke="#fb7185" stroke-width="6" stroke-linecap="round" />`,
    badgeArt: badgeCircle('#e11d48', '#fecdd3', `<text x="0" y="9" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle">+1</text>`)
  },
  {
    id: 'telepatia',
    colores: ['#2dd4bf', '#115e59'],
    cards: [
      { c1: '#8b5cf6', c2: '#5b21b6', inner: mini.textBadge('🧠', 'MENTE 1') },
      { c1: '#ec4899', c2: '#9d174d', inner: mini.textBadge('🧠', 'MENTE 2') },
      { c1: '#f59e0b', c2: '#b45309', inner: mini.textBadge('⚡', 'CONEXIÓN') },
      { c1: '#3b82f6', c2: '#1d4ed8', inner: mini.star('#fde047') }
    ],
    centerArt: `
      <circle cx="48" cy="108" r="22" fill="#2dd4bf" />
      <circle cx="128" cy="108" r="22" fill="#f472b6" />
      <path d="M64 78 Q88 46 112 78" fill="none" stroke="#facc15" stroke-width="4" stroke-linecap="round" />
      <path d="M56 62 Q88 22 120 62" fill="none" stroke="#38bdf8" stroke-width="4" stroke-dasharray="6 6" stroke-linecap="round" />
      <polygon points="88,42 92,52 102,54 94,60 96,70 88,64 80,70 82,60 74,54 84,52" fill="#fde047" />`,
    badgeArt: badgeCircle('#0d9488', '#99f6e4', `<path d="M-14 0 Q0 -16 14 0 Q0 16 -14 0 Z" fill="none" stroke="#facc15" stroke-width="4"/><circle cx="0" cy="0" r="5" fill="#ffffff"/>`)
  },
  {
    id: 'confianzaciega',
    colores: ['#14b8a6', '#0f766e'],
    cards: [
      { c1: '#f59e0b', c2: '#b45309', inner: mini.textBadge('🎲', 'APUESTA') },
      { c1: '#ec4899', c2: '#9d174d', inner: mini.textBadge('2m', 'TIEMPO') },
      { c1: '#3b82f6', c2: '#1d4ed8', inner: mini.textBadge('🔒', 'SECRETO') },
      { c1: '#22c55e', c2: '#15803d', inner: mini.star('#fde047') }
    ],
    centerArt: `
      <g transform="rotate(-12 66 84)">
        <rect x="36" y="54" width="60" height="60" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="3" />
        <circle cx="52" cy="70" r="5" fill="#0f172a" />
        <circle cx="66" cy="84" r="5" fill="#ef4444" />
        <circle cx="80" cy="98" r="5" fill="#0f172a" />
      </g>
      <g transform="rotate(14 112 114)">
        <rect x="82" y="84" width="60" height="60" rx="12" fill="#facc15" stroke="#ca8a04" stroke-width="3" />
        <circle cx="96" cy="98" r="5" fill="#0f172a" />
        <circle cx="128" cy="98" r="5" fill="#0f172a" />
        <circle cx="96" cy="130" r="5" fill="#0f172a" />
        <circle cx="128" cy="130" r="5" fill="#0f172a" />
      </g>`,
    badgeArt: badgeCircle('#0f766e', '#99f6e4', `<text x="0" y="9" font-family="system-ui, sans-serif" font-size="20" font-weight="900" fill="#facc15" text-anchor="middle">2:00</text>`)
  },
  {
    id: 'popular',
    colores: ['#fb923c', '#dc2626'],
    cards: [
      { c1: '#eab308', c2: '#a16207', inner: mini.textBadge('+5', 'TOP 1') },
      { c1: '#f97316', c2: '#c2410c', inner: mini.textBadge('+4', 'TOP 2') },
      { c1: '#ec4899', c2: '#9d174d', inner: mini.textBadge('+3', 'TOP 3') },
      { c1: '#3b82f6', c2: '#1d4ed8', inner: mini.textBadge('🔥', 'MODA') }
    ],
    centerArt: `
      <path d="M88 28 C88 28 138 72 138 114 A50 50 0 1 1 38 114 C38 82 64 56 68 48 C68 66 80 72 88 28 Z" fill="#f97316" stroke="#fde047" stroke-width="3" />
      <path d="M88 68 C88 68 116 96 116 122 A28 28 0 1 1 60 122 C60 100 88 68 88 68 Z" fill="#facc15" />`,
    badgeArt: badgeCircle('#dc2626', '#fed7aa', `<text x="0" y="9" font-family="system-ui, sans-serif" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">TOP 5</text>`)
  },
  {
    id: 'logos',
    colores: ['#22d3ee', '#0284c7'],
    cards: [
      { c1: '#ef4444', c2: '#b91c1c', inner: mini.shield('#facc15', '#ef4444') },
      { c1: '#22c55e', c2: '#15803d', inner: mini.star('#ffffff') },
      { c1: '#f59e0b', c2: '#b45309', inner: mini.iconCircle(`<polygon points="58,34 82,76 34,76" fill="#ffffff"/>`) },
      { c1: '#8b5cf6', c2: '#5b21b6', inner: mini.textBadge('®', 'MARCA') }
    ],
    centerArt: `
      <polygon points="88,28 138,54 138,112 88,154 38,112 38,54" fill="#0284c7" stroke="#facc15" stroke-width="4" />
      <path d="M58 94 Q82 116 122 72 Q90 126 58 94 Z" fill="#ffffff" />
      <circle cx="88" cy="64" r="10" fill="#facc15" />`,
    badgeArt: badgeCircle('#0369a1', '#a5f3fc', `<text x="0" y="10" font-family="system-ui, sans-serif" font-size="26" font-weight="900" fill="#facc15" text-anchor="middle">™</text>`)
  },
  {
    id: 'hipotesis',
    colores: ['#60a5fa', '#1e3a8a'],
    cards: [
      { c1: '#10b981', c2: '#047857', inner: mini.textBadge('🧪', 'MUESTRA') },
      { c1: '#f59e0b', c2: '#b45309', inner: mini.textBadge('💡', 'IDEA') },
      { c1: '#ec4899', c2: '#9d174d', inner: mini.textBadge('🃏', 'FAROL') },
      { c1: '#8b5cf6', c2: '#5b21b6', inner: mini.textBadge('🔬', 'LAB') }
    ],
    centerArt: `
      <!-- Matraz de laboratorio -->
      <path d="M72 36 H104 M78 36 V72 L42 142 A12 12 0 0 0 52 158 H124 A12 12 0 0 0 134 142 L98 72 V36" fill="#1e3a8a" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" />
      <path d="M54 118 L44 140 A8 8 0 0 0 52 152 H124 A8 8 0 0 0 132 140 L122 118 Z" fill="#22c55e" />
      <circle cx="78" cy="134" r="6" fill="#86efac" />
      <circle cx="98" cy="112" r="5" fill="#86efac" />
      <circle cx="88" cy="92" r="4" fill="#fde047" />`,
    badgeArt: badgeCircle('#2563eb', '#bfdbfe', `<circle cx="0" cy="-4" r="12" fill="#facc15"/><rect x="-6" y="8" width="12" height="8" rx="2" fill="#ffffff"/>`)
  },
  {
    id: 'trescientosuno',
    colores: ['#34d399', '#047857'],
    cards: [
      { c1: '#3b82f6', c2: '#1d4ed8', inner: mini.jersey('#ffffff', '#1d4ed8', '9') },
      { c1: '#ef4444', c2: '#b91c1c', inner: mini.shield('#ef4444', '#facc15') },
      { c1: '#f59e0b', c2: '#b45309', inner: mini.textBadge('⚽', 'GOLES') },
      { c1: '#8b5cf6', c2: '#5b21b6', inner: mini.textBadge('👟', 'ASIST.') }
    ],
    centerArt: `
      <!-- Portería y marcador 301 -->
      <path d="M28 148 V52 H148 V148" fill="none" stroke="#ffffff" stroke-width="6" stroke-linejoin="round" />
      <rect x="36" y="64" width="104" height="64" rx="10" fill="#065f46" stroke="#34d399" stroke-width="2.5" />
      <text x="88" y="108" font-family="system-ui, sans-serif" font-size="36" font-weight="900" fill="#facc15" text-anchor="middle">301</text>`,
    badgeArt: `<g transform="translate(358, 178)">${soccerBall(0, 0, 38)}</g>`
  },
  {
    id: 'jugadores',
    colores: ['#f97316', '#b91c1c'],
    cards: [
      { c1: '#3b82f6', c2: '#1d4ed8', inner: mini.jersey('#3b82f6', '#ffffff', '7') },
      { c1: '#22c55e', c2: '#15803d', inner: mini.jersey('#22c55e', '#facc15', '10') },
      { c1: '#eab308', c2: '#a16207', inner: mini.shield('#facc15', '#b91c1c') },
      { c1: '#8b5cf6', c2: '#5b21b6', inner: mini.textBadge('🤝', 'COMPAÑERO') }
    ],
    centerArt: `
      <circle cx="48" cy="64" r="22" fill="#3b82f6" stroke="#ffffff" stroke-width="3" />
      <circle cx="128" cy="64" r="22" fill="#ef4444" stroke="#ffffff" stroke-width="3" />
      <line x1="58" y1="82" x2="78" y2="118" stroke="#facc15" stroke-width="4" stroke-dasharray="6 4" />
      <line x1="118" y1="82" x2="98" y2="118" stroke="#facc15" stroke-width="4" stroke-dasharray="6 4" />
      <circle cx="88" cy="134" r="26" fill="#22c55e" stroke="#facc15" stroke-width="4" />
      <text x="88" y="144" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle">?</text>`,
    badgeArt: `<g transform="translate(358, 178)">${soccerBall(0, 0, 38)}</g>`
  },
  {
    id: 'furbo',
    colores: ['#4ade80', '#166534'],
    cards: [
      { c1: '#eab308', c2: '#a16207', inner: mini.star('#ffffff') },
      { c1: '#3b82f6', c2: '#1d4ed8', inner: mini.shield('#38bdf8', '#1e3a8a') },
      { c1: '#ef4444', c2: '#b91c1c', inner: mini.jersey('#ef4444', '#facc15', '10') },
      { c1: '#a855f7', c2: '#6b21a8', inner: mini.textBadge('🏆', 'QUIZ') }
    ],
    centerArt: `
      <!-- Copa dorada -->
      <path d="M54 40 H122 V78 C122 104 88 118 88 118 C88 118 54 104 54 78 Z" fill="#facc15" stroke="#fef08a" stroke-width="3" />
      <path d="M54 50 H38 V72 C38 84 54 88 54 88 M122 50 H138 V72 C138 84 122 88 122 88" fill="none" stroke="#facc15" stroke-width="5" />
      <rect x="78" y="116" width="20" height="24" fill="#eab308" />
      <rect x="58" y="140" width="60" height="16" rx="5" fill="#ca8a04" />`,
    badgeArt: `<g transform="translate(358, 178)">${soccerBall(0, 0, 38)}</g>`
  },
  {
    id: 'futbolgrid',
    colores: ['#a855f7', '#b91c1c'],
    cards: [
      { c1: '#3b82f6', c2: '#1d4ed8', inner: mini.shield('#ffffff', '#2563eb') },
      { c1: '#22c55e', c2: '#15803d', inner: mini.textBadge('⭕', 'EQUIPO 1') },
      { c1: '#ef4444', c2: '#991b1b', inner: mini.textBadge('❌', 'EQUIPO 2') },
      { c1: '#f59e0b', c2: '#b45309', inner: mini.shield('#facc15', '#dc2626') }
    ],
    centerArt: `
      <!-- Tablero 3x3 tres en raya -->
      <line x1="66" y1="36" x2="66" y2="156" stroke="#64748b" stroke-width="4" stroke-linecap="round" />
      <line x1="110" y1="36" x2="110" y2="156" stroke="#64748b" stroke-width="4" stroke-linecap="round" />
      <line x1="28" y1="76" x2="148" y2="76" stroke="#64748b" stroke-width="4" stroke-linecap="round" />
      <line x1="28" y1="116" x2="148" y2="116" stroke="#64748b" stroke-width="4" stroke-linecap="round" />
      <circle cx="47" cy="56" r="11" fill="none" stroke="#22c55e" stroke-width="5" />
      <circle cx="88" cy="96" r="11" fill="none" stroke="#22c55e" stroke-width="5" />
      <circle cx="129" cy="136" r="11" fill="none" stroke="#22c55e" stroke-width="5" />
      <path d="M120 47 L138 65 M138 47 L120 65" stroke="#ef4444" stroke-width="5" stroke-linecap="round" />
      <line x1="36" y1="45" x2="140" y2="147" stroke="#facc15" stroke-width="5" stroke-linecap="round" />`,
    badgeArt: `<g transform="translate(358, 178)">${soccerBall(0, 0, 38)}</g>`
  },
  {
    id: 'footballsplit',
    colores: ['#818cf8', '#0f172a'],
    cards: [
      { c1: '#f59e0b', c2: '#b45309', inner: mini.textBadge('1/3', 'PELO') },
      { c1: '#ec4899', c2: '#9d174d', inner: mini.textBadge('2/3', 'OJOS') },
      { c1: '#22c55e', c2: '#15803d', inner: mini.textBadge('3/3', 'BOCA') },
      { c1: '#3b82f6', c2: '#1d4ed8', inner: mini.jersey('#38bdf8', '#ffffff', '?') }
    ],
    centerArt: `
      <!-- Rostro dividido en 3 franjas -->
      <rect x="34" y="34" width="108" height="38" rx="8" fill="#f59e0b" />
      <path d="M52 72 Q88 36 124 72 Z" fill="#0f172a" />
      <rect x="34" y="78" width="108" height="38" rx="8" fill="#38bdf8" />
      <circle cx="68" cy="97" r="5" fill="#0f172a" />
      <circle cx="108" cy="97" r="5" fill="#0f172a" />
      <rect x="34" y="122" width="108" height="38" rx="8" fill="#4ade80" />
      <path d="M70 138 Q88 152 106 138" fill="none" stroke="#0f172a" stroke-width="4" stroke-linecap="round" />
      <line x1="24" y1="75" x2="152" y2="75" stroke="#facc15" stroke-width="3" stroke-dasharray="6 4" />
      <line x1="24" y1="119" x2="152" y2="119" stroke="#facc15" stroke-width="3" stroke-dasharray="6 4" />`,
    badgeArt: `<g transform="translate(358, 178)">${soccerBall(0, 0, 38)}</g>`
  },
  {
    id: 'jugadas',
    colores: ['#fbbf24', '#b45309'],
    cards: [
      { c1: '#22c55e', c2: '#15803d', inner: mini.jersey('#22c55e', '#ffffff', '10') },
      { c1: '#3b82f6', c2: '#1d4ed8', inner: mini.jersey('#3b82f6', '#facc15', '8') },
      { c1: '#ef4444', c2: '#b91c1c', inner: mini.textBadge('📋', 'PIZARRA') },
      { c1: '#8b5cf6', c2: '#5b21b6', inner: mini.textBadge('⚽', '¡GOL!') }
    ],
    centerArt: `
      <!-- Pizarra táctica -->
      <rect x="28" y="30" width="120" height="136" rx="10" fill="#15803d" stroke="#ffffff" stroke-width="3" />
      <line x1="28" y1="98" x2="148" y2="98" stroke="#ffffff" stroke-width="2" stroke-opacity="0.6" />
      <circle cx="88" cy="98" r="18" fill="none" stroke="#ffffff" stroke-width="2" stroke-opacity="0.6" />
      <path d="M52 136 Q64 82 116 58" fill="none" stroke="#facc15" stroke-width="4" stroke-dasharray="6 4" stroke-linecap="round" />
      <polygon points="122,54 110,52 116,66" fill="#facc15" />
      <circle cx="52" cy="136" r="9" fill="#ef4444" stroke="#ffffff" stroke-width="2" />
      <circle cx="108" cy="112" r="9" fill="#3b82f6" stroke="#ffffff" stroke-width="2" />`,
    badgeArt: `<g transform="translate(358, 178)">${soccerBall(0, 0, 38)}</g>`
  },
  {
    id: 'cuatroclubes',
    colores: ['#e879f9', '#9d174d'],
    cards: [
      { c1: '#ef4444', c2: '#991b1b', inner: mini.shield('#ef4444', '#ffffff') },
      { c1: '#3b82f6', c2: '#1e40af', inner: mini.shield('#3b82f6', '#facc15') },
      { c1: '#22c55e', c2: '#15803d', inner: mini.shield('#22c55e', '#ffffff') },
      { c1: '#f59e0b', c2: '#b45309', inner: mini.shield('#facc15', '#0f172a') }
    ],
    centerArt: `
      <!-- 4 escudos conectados a 1 jugador -->
      <rect x="32" y="34" width="48" height="48" rx="10" fill="#ef4444" stroke="#ffffff" stroke-width="2.5" />
      <rect x="96" y="34" width="48" height="48" rx="10" fill="#3b82f6" stroke="#ffffff" stroke-width="2.5" />
      <rect x="32" y="110" width="48" height="48" rx="10" fill="#22c55e" stroke="#ffffff" stroke-width="2.5" />
      <rect x="96" y="110" width="48" height="48" rx="10" fill="#f59e0b" stroke="#ffffff" stroke-width="2.5" />
      <circle cx="88" cy="96" r="24" fill="#0f172a" stroke="#facc15" stroke-width="4" />
      <text x="88" y="105" font-family="system-ui, sans-serif" font-size="24" font-weight="900" fill="#facc15" text-anchor="middle">4</text>`,
    badgeArt: `<g transform="translate(358, 178)">${soccerBall(0, 0, 38)}</g>`
  }
];

let creados = 0;
for (const juego of JUEGOS) {
  const filePath = path.join(coversDir, `${juego.id}.svg`);
  const svgContent = buildCoverSVG(juego);
  fs.writeFileSync(filePath, svgContent, 'utf8');
  creados++;
}

console.log(`✅ Se han generado ${creados} portadas SVG en: ${coversDir}`);