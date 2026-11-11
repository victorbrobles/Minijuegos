// Portadas al estilo del resto: mesa de juego cálida, gente alrededor, piezas encima y título grueso con contorno.
const sharp = require('sharp');
const OUT = require('path').join(__dirname, '../../client/public/covers/');
const PREV = require('os').tmpdir() + '/';

const defs = `<defs>
 <filter id="grano" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.13  0 0 0 0 0.08  0 0 0 0.22 0"/><feComposite in2="SourceGraphic" operator="in"/><feBlend in="SourceGraphic" mode="multiply"/></filter>
 <filter id="sombra" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="10" stdDeviation="9" flood-color="#000" flood-opacity=".45"/></filter>
 <filter id="sombraT" x="-10%" y="-20%" width="120%" height="160%"><feDropShadow dx="0" dy="9" stdDeviation="2" flood-color="#120a05" flood-opacity="1"/></filter>
 <radialGradient id="lampara" cx="50%" cy="38%" r="62%"><stop offset="0" stop-color="#ffd89a" stop-opacity=".55"/><stop offset=".55" stop-color="#ffb35c" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
 <radialGradient id="vineta" cx="50%" cy="50%" r="75%"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>
 <linearGradient id="madera" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a6332"/><stop offset="1" stop-color="#4e2f15"/></linearGradient>
</defs>`;

// Persona de espaldas o de lado alrededor de la mesa (silueta con luz de lámpara)
const persona = (x, y, s, piel, pelo, ropa, giro = 0, peinado = 0) => `<g transform="translate(${x} ${y}) scale(${s}) rotate(${giro})" filter="url(#sombra)">
 <path d="M-120 210 Q-118 70 0 60 Q118 70 120 210 Z" fill="${ropa}"/><path d="M-120 210 Q-118 70 0 60 Q40 62 70 80 Q-20 90 -60 210Z" fill="#000" opacity=".18"/>
 <rect x="-22" y="20" width="44" height="50" rx="16" fill="${piel}"/>
 <ellipse cx="0" cy="-10" rx="56" ry="64" fill="${piel}"/>
 ${['<path d="M-58 -10 Q-62 -82 0 -80 Q62 -82 58 -10 Q50 -50 0 -48 Q-50 -50 -58 -10Z" fill="PELO"/>',
    '<path d="M-60 0 Q-66 -86 0 -84 Q66 -86 60 0 Q66 50 40 70 Q52 -40 0 -44 Q-52 -40 -40 70 Q-66 50 -60 0Z" fill="PELO"/>',
    '<path d="M-56 -20 Q-50 -80 0 -76 Q50 -80 56 -20 Q30 -60 -10 -50 Q-40 -46 -56 -20Z" fill="PELO"/><circle cx="0" cy="-86" r="20" fill="PELO"/>',
    '<path d="M-58 -16 Q-58 -74 0 -76 Q58 -74 58 -16 L58 -30 Q0 -56 -58 -30Z" fill="PELO"/><path d="M-70 -30 Q0 -70 70 -30 Q70 -20 -70 -20Z" fill="PELO" opacity=".9"/>'][peinado].replace(/PELO/g, pelo)}
 <ellipse cx="-20" cy="-30" rx="26" ry="36" fill="#fff" opacity=".1"/>
</g>`;
const PIELES = ['#e0ac80', '#c68642', '#8d5524', '#f1c27d', '#a86b45'];
const gente = (sem = 0) => {
  const k = (i) => (i + sem) % 5;
  return persona(105, 560, 1.05, PIELES[k(0)], '#2b1a10', '#c2410c', 14, k(0) % 4)
    + persona(925, 560, 1.05, PIELES[k(1)], '#141414', '#1d4ed8', -14, k(1) % 4)
    + persona(250, 470, 0.72, PIELES[k(2)], '#5b3416', '#15803d', 8, k(2) % 4)
    + persona(780, 470, 0.72, PIELES[k(3)], '#3b2416', '#7c3aed', -8, k(3) % 4);
};
// Escena: pared, lámpara, gente, mesa y viñeta. `piezas` va encima de la mesa.
const escena = (pared, sem, piezas) => `<g filter="url(#grano)">
 <rect width="1024" height="1024" fill="${pared}"/>
 <rect width="1024" height="1024" fill="url(#lampara)"/>
 ${gente(sem)}
 <path d="M-40 640 Q512 560 1064 640 L1064 1064 L-40 1064 Z" fill="url(#madera)"/>
 ${[0, 1, 2, 3, 4].map((i) => `<path d="M-40 ${700 + i * 75} Q512 ${640 + i * 75} 1064 ${700 + i * 75}" stroke="#3b220f" stroke-width="3" fill="none" opacity=".35"/>`).join('')}
 <ellipse cx="512" cy="760" rx="430" ry="150" fill="#ffd89a" opacity=".12"/>
</g>
${piezas}
<rect width="1024" height="1024" fill="url(#vineta)"/>`;
// Título grueso con contorno oscuro y sombra, en una o dos líneas
const titulo = (l1, l2, c1, c2, tam = 150, y0 = 175) => {
  const t = (txt, y, col, size) => `<text x="512" y="${y}" text-anchor="middle" font-family="'Bricolage Grotesque','Inter Display','Arial Black',sans-serif" font-weight="900" font-size="${size}" letter-spacing="-2"
    fill="${col}" stroke="#1b0f07" stroke-width="${size * 0.13}" stroke-linejoin="round" paint-order="stroke" filter="url(#sombraT)">${txt}</text>`;
  const fit = (s) => Math.min(tam, 900 / (s.length * 0.7));
  return `<g transform="rotate(-2 512 200)">${t(l1, l2 ? y0 : y0 + 60, c1, fit(l1))}${l2 ? t(l2, y0 + fit(l2) * 0.95, c2, fit(l2)) : ''}</g>`;
};
// Fichas y cartas sueltas por la mesa (ambiente)
const fichas = (cols) => cols.map((c, i) => `<g transform="translate(${[140, 900, 210, 830, 520][i]} ${[930, 920, 860, 850, 975][i]})"><ellipse rx="34" ry="14" fill="#000" opacity=".3" cy="10"/><ellipse rx="34" ry="14" fill="${c}"/><rect x="-34" y="-12" width="68" height="12" fill="${c}"/><ellipse rx="34" ry="14" cy="-12" fill="${c}" stroke="#fff" stroke-opacity=".35" stroke-width="3"/></g>`).join('');
const carta = (x, y, rot, fondo, cont = '', w = 150, h = 210) => `<g transform="translate(${x} ${y}) rotate(${rot})" filter="url(#sombra)"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="16" fill="#fff8e7"/><rect x="${-w / 2 + 10}" y="${-h / 2 + 10}" width="${w - 20}" height="${h - 20}" rx="10" fill="${fondo}"/>${cont}</g>`;
const T = (txt, size, col = '#fff8e7', y = 0, x = 0, w = 900) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="'Bricolage Grotesque','Inter Display',sans-serif" font-weight="${w}" font-size="${size}" fill="${col}">${txt}</text>`;
const F = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'];

const P = {
  ovejas: ['#24394a', 0, titulo('CUENTA', 'OVEJAS', '#fff3d6', '#fbbf24'), `
   <g transform="translate(512 760)" filter="url(#sombra)"><ellipse rx="300" ry="110" fill="#65a30d"/><ellipse rx="300" ry="110" fill="none" stroke="#3f6212" stroke-width="10"/>
   ${[[-170, -10], [-40, 30], [90, -20], [200, 25]].map(([x, y], i) => `<g transform="translate(${x} ${y})"><g fill="${i === 3 ? '#3a3a3a' : '#f8f4ea'}" stroke="#d7cdb6" stroke-width="3"><circle cx="-24" r="24"/><circle cy="-12" r="26"/><circle cx="24" r="24"/><circle cy="12" r="24"/></g><ellipse cx="-44" cy="-4" rx="15" ry="12" fill="#1d2b33"/></g>`).join('')}</g>
   ${carta(250, 880, -10, '#c2410c', T('7', 110, '#fff8e7', 40))}${carta(780, 880, 9, '#1d4ed8', T('9', 110, '#fff8e7', 40))}${fichas(F.slice(0, 2))}`],
  segundero: ['#2b2140', 1, titulo('EL SEGUNDERO', 'INTERIOR', '#fff3d6', '#38bdf8', 130), `
   <g transform="translate(512 760)" filter="url(#sombra)"><rect x="-26" y="-205" width="52" height="40" rx="10" fill="#1d2b33"/><circle r="175" fill="#fff8e7"/><circle r="150" fill="#fffdf6" stroke="#1d2b33" stroke-width="12"/>
   ${Array.from({ length: 12 }, (_, i) => `<rect x="-5" y="-142" width="10" height="${i % 3 === 0 ? 30 : 18}" fill="#1d2b33" transform="rotate(${i * 30})"/>`).join('')}
   <path d="M0 0 L0 -130 A130 130 0 0 1 92 -92 Z" fill="#d9663f" opacity=".85"/>${T('7,3', 96, '#1f4e5a', 30)}<path d="M0 0l62 52" stroke="#1d2b33" stroke-width="11" stroke-linecap="round"/><circle r="12" fill="#1d2b33"/></g>${fichas(F.slice(1, 4))}`],
  encadenada: ['#3a2340', 2, titulo('PALABRA', 'ENCADENADA', '#fff3d6', '#f472b6', 140), `
   ${['C', 'A', 'S', 'A'].map((l, i) => `<g transform="translate(${250 + i * 105} 720) rotate(${-4 + i * 2})" filter="url(#sombra)"><rect x="-46" y="-46" width="92" height="92" rx="14" fill="#fff8e7"/>${T(l, 66, '#1f4e5a', 24)}</g>`).join('')}
   ${['C', 'O', 'L', 'A'].map((l, i) => `<g transform="translate(${430 + i * 105} 860) rotate(${3 - i * 2})" filter="url(#sombra)"><rect x="-46" y="-46" width="92" height="92" rx="14" fill="${i === 2 ? '#d9663f' : '#fff8e7'}"/>${T(l, 66, i === 2 ? '#fff8e7' : '#1f4e5a', 24)}</g>`).join('')}${fichas(['#22c55e'])}`],
  mapamentiroso: ['#3b2a1c', 3, titulo('EL MAPA', 'MENTIROSO', '#fff3d6', '#f59e0b'), `
   <g transform="translate(512 790) rotate(-4)" filter="url(#sombra)"><path d="M-330 -170l220 -40 220 40 220 -40v340l-220 40-220-40-220 40z" fill="#f3e2b3"/>
   <path d="M-110 -210v340M110 -170v340" stroke="#d6c08d" stroke-width="4"/><path d="M-250 100c60-80 120-40 160-120s140-40 200-90" fill="none" stroke="#d9663f" stroke-width="10" stroke-dasharray="20 14" stroke-linecap="round"/>
   <path d="M60 -110l40 40M100 -110l-40 40" stroke="#d9663f" stroke-width="14" stroke-linecap="round"/><circle cx="200" cy="70" r="26" fill="#8fae8b"/><circle cx="-60" cy="-110" r="20" fill="#8a6fa3"/></g>
   <g transform="translate(860 900) rotate(35)" filter="url(#sombra)"><circle r="70" fill="#fff8e7"/><circle r="56" fill="none" stroke="#1d2b33" stroke-width="6"/><path d="M0-48l12 48H-12z" fill="#d9663f"/><path d="M0 48l12-48H-12z" fill="#1d2b33"/></g>`],
  ordenalos: ['#1f3a3a', 4, titulo('ORDÉNALOS', 'SIN MIRAR', '#fff3d6', '#fbbf24'), `
   <g transform="translate(512 720)" filter="url(#sombra)"><rect x="-12" y="-20" width="24" height="210" rx="6" fill="#1d2b33"/><rect x="-110" y="180" width="220" height="28" rx="12" fill="#1d2b33"/>
   <g transform="rotate(-9)"><rect x="-290" y="-30" width="580" height="20" rx="10" fill="#1d2b33"/><path d="M-330 70a80 22 0 0 0 160 0zM190 70a80 22 0 0 0 160 0z" fill="#fff8e7"/>
   <g transform="translate(-250 30)"><rect x="-45" y="-50" width="90" height="80" rx="10" fill="#d9663f"/>${T('A', 54, '#fff8e7', 8)}</g><g transform="translate(270 30)"><rect x="-45" y="-50" width="90" height="80" rx="10" fill="#8fae8b"/>${T('B', 54, '#fff8e7', 8)}</g></g></g>
   ${['C', 'D', 'E'].map((l, i) => `<g transform="translate(${190 + i * 320} 940) rotate(${-6 + i * 6})" filter="url(#sombra)"><rect x="-55" y="-50" width="110" height="100" rx="14" fill="${['#8a6fa3', '#d9a93f', '#4f86a6'][i]}"/>${T(l, 60, '#fff8e7', 20)}</g>`).join('')}`],
  excusas: ['#203a30', 0, titulo('EXCUSAS', 'A DOMICILIO', '#fff3d6', '#4ade80', 140), `
   <g transform="translate(512 790) rotate(-6)" filter="url(#sombra)"><rect x="-170" y="-250" width="340" height="480" rx="44" fill="#1d2b33"/><rect x="-148" y="-215" width="296" height="410" rx="18" fill="#e7ddd3"/>
   <rect x="-148" y="-215" width="296" height="54" fill="#075e54"/><rect x="-128" y="-140" width="200" height="60" rx="16" fill="#fff"/><rect x="-110" y="-120" width="150" height="10" rx="5" fill="#94a3b8"/><rect x="-110" y="-100" width="100" height="10" rx="5" fill="#94a3b8"/>
   <rect x="-50" y="-60" width="180" height="76" rx="16" fill="#d9fdd3"/>${T('¿PERDONA?', 30, '#166534', -10, 40)}<rect x="-128" y="40" width="210" height="60" rx="16" fill="#fff"/>${T('El perro…', 28, '#334155', 80, -24, 700)}</g>
   ${carta(200, 880, -12, '#d9663f', T('😅', 70, '#fff', 25))}${carta(830, 880, 10, '#8a6fa3', T('🐕', 70, '#fff', 25))}`],
  semaforo: ['#1e2433', 1, titulo('SEMÁFORO', 'INVERTIDO', '#fff3d6', '#ef4444'), `
   <g transform="translate(380 760)" filter="url(#sombra)"><rect x="-75" y="-230" width="150" height="380" rx="40" fill="#1d2b33"/>
   <circle cy="-150" r="50" fill="#22c55e"/><circle cy="-30" r="50" fill="#57534e"/><circle cy="90" r="50" fill="#ef4444"/><rect x="-14" y="150" width="28" height="90" fill="#1d2b33"/></g>
   ${carta(660, 720, 8, '#fff8e7', T('VERDE', 52, '#ef4444', 18), 260, 140)}${carta(700, 900, -6, '#fff8e7', T('ROJO', 56, '#22c55e', 20), 240, 130)}${fichas(['#eab308', '#3b82f6'])}`],
  untrazo: ['#2a2a3d', 2, titulo('UN SOLO', 'TRAZO', '#fff3d6', '#fb923c'), `
   <g transform="translate(512 780)" filter="url(#sombra)"><rect x="-270" y="-200" width="540" height="380" rx="24" fill="#fff8e7"/>
   <g stroke-linecap="round" stroke-linejoin="round"><path d="M-180 130L0 -130L180 130Z M-180 130L180 130 M0 -130L0 130 M-90 0L90 0" fill="none" stroke="#c9bda4" stroke-width="18"/><path d="M-180 130L0 -130L180 130L-180 130" fill="none" stroke="#d9663f" stroke-width="20"/></g>
   ${[[-180, 130], [0, -130], [180, 130], [0, 130], [-90, 0], [90, 0]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="22" fill="#fff" stroke="#1d2b33" stroke-width="8"/>`).join('')}
   <g transform="translate(150 30) rotate(-35)"><rect x="-13" y="-90" width="26" height="140" rx="6" fill="#d9a93f"/><path d="M-13 50l13 32 13-32z" fill="#e8c9a0"/></g></g>${fichas(['#22c55e', '#a855f7'])}`],
  mus: ['#14301f', 3, titulo('MUS', null, '#fff3d6', null, 230), `
   <g transform="translate(512 860)" filter="url(#sombra)"><ellipse rx="440" ry="140" fill="#166534" stroke="#a16207" stroke-width="14"/></g>
   ${[['12', '#b91c1c', -18], ['1', '#b45309', -6], ['7', '#1d4ed8', 6], ['11', '#15803d', 18]].map(([n, c, r], i) => carta(320 + i * 130, 760, r, '#fffdf6', `${T(n, 46, c, -55, -40)}<circle cy="15" r="34" fill="${c}" opacity=".85"/>`)).join('')}
   ${[0, 1, 2, 3, 4, 5].map((i) => `<g transform="translate(${130 + (i % 3) * 22} ${930 - i * 12})"><ellipse rx="44" ry="14" fill="${['#facc15', '#ef4444', '#facc15', '#22c55e', '#facc15', '#ef4444'][i]}" stroke="#fff" stroke-width="3"/></g>`).join('')}
   <g transform="translate(860 900)" filter="url(#sombra)"><path d="M-60 -10 Q-60 -60 0 -60 Q60 -60 60 -10 L40 40 L-40 40Z" fill="#fde68a"/>${T('¡ÓRDAGO!', 26, '#7c2d12', -10)}</g>`],
  reinos: ['#3b0f12', 4, titulo('LOS SIETE', 'REINOS', '#fde68a', '#fff3d6'), `
   <g transform="translate(512 770)" filter="url(#sombra)"><rect x="-330" y="-190" width="660" height="370" rx="20" fill="#78350f"/><rect x="-310" y="-170" width="620" height="330" rx="12" fill="#7dd3fc"/>
   ${[[-200, -80], [-60, -110], [80, -80], [220, -50], [-170, 40], [-30, 10], [110, 40], [240, 80], [-60, 110]].map(([x, y], i) => `<path transform="translate(${x} ${y})" d="M0 -55L48 -27L48 27L0 55L-48 27L-48 -27Z" fill="${['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#e2e8f0', '#14b8a6', '#ef4444', '#f59e0b'][i]}" stroke="#fef3c7" stroke-width="5"/>`).join('')}
   ${T('👑', 60, '#000', 30, -30)}</g>${fichas(['#fbbf24', '#fbbf24', '#ef4444'])}`],
  invento: ['#1e3a5f', 0, titulo('EL INVENTO', 'DEL SIGLO', '#fff3d6', '#fbbf24', 135), `
   <g transform="translate(512 770)" filter="url(#sombra)"><rect x="-300" y="-170" width="600" height="320" rx="10" fill="#1e40af"/>
   ${Array.from({ length: 11 }, (_, i) => `<path d="M${-300 + i * 60} -170v320" stroke="#93c5fd" stroke-width="1.5" opacity=".5"/>`).join('')}${Array.from({ length: 6 }, (_, i) => `<path d="M-300 ${-170 + i * 64}h600" stroke="#93c5fd" stroke-width="1.5" opacity=".5"/>`).join('')}
   <g stroke="#e0f2fe" stroke-width="6" fill="none" stroke-linecap="round"><circle cx="-90" cy="-10" r="70"/><path d="M-20 -10h160l40 -60M140 -10l40 60"/><rect x="-160" y="70" width="140" height="50" rx="10"/></g>${T('?', 70, '#fde68a', 30, 200)}</g>
   <g transform="translate(830 560)" filter="url(#sombra)"><circle r="80" fill="#fde047"/><rect x="-34" y="70" width="68" height="50" rx="10" fill="#94a3b8"/><path d="M-25 -10 Q0 30 25 -10" stroke="#a16207" stroke-width="8" fill="none"/></g>
   ${carta(190, 880, -10, '#0ea5e9', T('📦', 66, '#fff', 25))}${carta(850, 900, 8, '#ec4899', T('🤪', 66, '#fff', 25))}`],
  director: ['#0b1d3a', 1, titulo('DIRECTOR', 'DEPORTIVO', '#fff3d6', '#38bdf8'), `
   <g transform="translate(512 780)" filter="url(#sombra)"><rect x="-320" y="-180" width="640" height="340" rx="16" fill="#15803d" stroke="#fff" stroke-width="8"/>
   <path d="M0 -180v340" stroke="#fff" stroke-width="5" opacity=".8"/><circle r="56" fill="none" stroke="#fff" stroke-width="5" opacity=".8"/>
   ${[[-220, 0], [-120, -90], [-120, 90], [0, -40], [0, 40], [120, -100], [120, 100], [210, 0]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="20" fill="#fde047" stroke="#1d2b33" stroke-width="5"/>`).join('')}
   <path d="M-120 -90 Q-40 -150 0 -40" stroke="#fde047" stroke-width="6" stroke-dasharray="14 10" fill="none"/></g>
   ${carta(190, 890, -10, '#0369a1', `${T('89', 64, '#fde047', 0)}${T('MED', 30, '#fff8e7', 50)}`)}<g transform="translate(850 900) rotate(8)" filter="url(#sombra)"><rect x="-90" y="-50" width="180" height="100" rx="14" fill="#16a34a"/>${T('200 M€', 40, '#fff8e7', 14)}</g>`],
  laberinto: ['#1c1917', 2, titulo('EL', 'LABERINTO', '#fde68a', '#fff3d6', 150), `
   <g transform="translate(512 780)" filter="url(#sombra)"><rect x="-260" y="-200" width="520" height="380" rx="16" fill="#57534e"/>
   <g stroke="#1c1917" stroke-width="16" stroke-linecap="square" fill="none"><path d="M-240 -180h480v340h-480z"/><path d="M-160 -180v120h80M-240 -60h60M0 -180v80h120M160 -100v120h-120M-80 20v140M80 80h80v80M-160 80h80"/></g>
   <rect x="-235" y="-175" width="470" height="330" fill="#d6c7a6" opacity=".55"/><path d="M0 -20l38 38-38 38-38-38z" fill="#38bdf8" stroke="#e0f2fe" stroke-width="6"/></g>
   ${['🛡️', '🗝️', '🧭', '🔮'].map((e, i) => `<g transform="translate(${[180, 840, 250, 780][i]} ${[900, 900, 990, 990][i]})" filter="url(#sombra)"><circle r="44" fill="${F[i]}" stroke="#fff" stroke-width="5"/>${T(e, 44, '#000', 15)}</g>`).join('')}`],
  hemeroteca: ['#3a2f28', 3, titulo('LA', 'HEMEROTECA', '#fff3d6', '#fbbf24', 150), `
   <g transform="translate(512 780) rotate(-4)" filter="url(#sombra)"><rect x="-320" y="-200" width="640" height="380" rx="6" fill="#f5f0e1"/>
   ${T('EL DIARIO', 56, '#1d2b33', -130, 0, 900)}<rect x="-290" y="-110" width="580" height="6" fill="#1d2b33"/>
   <rect x="-290" y="-85" width="170" height="42" rx="4" fill="#1d2b33"/><rect x="-105" y="-85" width="150" height="42" rx="6" fill="none" stroke="#d9663f" stroke-width="7" stroke-dasharray="14 9"/><rect x="60" y="-85" width="230" height="42" rx="4" fill="#1d2b33"/>
   <rect x="-290" y="-25" width="290" height="42" rx="4" fill="#1d2b33"/><rect x="15" y="-25" width="160" height="42" rx="6" fill="none" stroke="#d9663f" stroke-width="7" stroke-dasharray="14 9"/>
   <rect x="-290" y="40" width="260" height="120" fill="#c9bda4"/>${[50, 80, 110, 140].map((y) => `<rect x="10" y="${y}" width="280" height="10" rx="5" fill="#a8a29e"/>`).join('')}</g>
   <g transform="translate(860 930)" filter="url(#sombra)"><circle r="70" fill="#fff8e7"/><circle cx="-10" cy="-10" r="34" fill="none" stroke="#1d2b33" stroke-width="12"/><path d="M14 14l32 32" stroke="#1d2b33" stroke-width="16" stroke-linecap="round"/></g>`],
  acta: ['#14301f', 4, titulo('ACTA DEL', 'PARTIDO', '#fff3d6', '#4ade80'), `
   <g transform="translate(500 790) rotate(-5)" filter="url(#sombra)"><rect x="-240" y="-230" width="480" height="440" rx="14" fill="#fffaf0"/><rect x="-70" y="-258" width="140" height="56" rx="14" fill="#1d2b33"/>
   ${T('ACTA OFICIAL', 36, '#1f4e5a', -165)}${T('? - ?', 76, '#d9663f', -90)}
   ${[-40, 15, 70, 125].map((y, i) => `<g transform="translate(-200 ${y})">${T(["12'", "45'", "78'", "90+3'"][i], 30, '#1d2b33', 10, 40, 800)}<rect x="${i === 1 ? 140 : 110}" y="-8" width="${[230, 180, 250, 160][i]}" height="16" rx="8" fill="#cbd5e1"/>${i === 1 ? '<rect x="104" y="-18" width="24" height="34" rx="4" fill="#facc15"/>' : ''}</g>`).join('')}</g>
   <g transform="translate(860 920)" filter="url(#sombra)"><circle r="78" fill="#fff"/><path d="M0-30l28 20-10 33h-36l-10-33z" fill="#1d2b33"/><path d="M0-78v48M74-24l-46 14M46 63l-28-40M-46 63l28-40M-74-24l46 14" stroke="#1d2b33" stroke-width="7"/></g>`],
  oncefantasma: ['#0f1d3d', 0, titulo('EL ONCE', 'FANTASMA', '#fff3d6', '#93c5fd'), `
   <g transform="translate(512 790)" filter="url(#sombra)"><rect x="-340" y="-200" width="680" height="380" rx="18" fill="#16a34a" stroke="#fff" stroke-width="8"/>
   ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${-340 + i * 113}" y="-200" width="56" height="380" fill="#15803d"/>`).join('')}<path d="M0 -200v380" stroke="#fff" stroke-width="5" opacity=".8"/><circle r="52" fill="none" stroke="#fff" stroke-width="5" opacity=".8"/>
   ${[[-270, -10, 1], [-170, -110, 3], [-170, 90, 2], [-60, -60, 6], [-60, 60, 8], [60, -130, 7], [60, 120, 11], [170, -30, 10], [260, 30, 9]].map(([x, y, n], i) => `<g transform="translate(${x} ${y})"><path d="M-30-26h60l9 12-11 9v35h-56v-35l-11-9z" fill="${i % 3 === 0 ? '#dc2626' : 'rgba(15,23,42,.5)'}" stroke="#fff" stroke-width="4" ${i % 3 === 0 ? '' : 'stroke-dasharray="8 6"'}/>${T(i % 3 === 0 ? n : '?', 28, '#fff', 18)}</g>`).join('')}</g>
   <g transform="translate(860 560)" filter="url(#sombra)"><path d="M-62 54v-62a62 62 0 0 1 124 0v62l-20-16-21 16-21-16-21 16-21-16z" fill="#f8fafc"/><circle cx="-21" cy="-8" r="10" fill="#1d2b33"/><circle cx="21" cy="-8" r="10" fill="#1d2b33"/></g>`],
  unapieza: ['#3d2410', 1, titulo('UNA PIEZA', 'MÁS', '#fff3d6', '#fbbf24', 150), `
   <g transform="translate(470 780) rotate(-4)" filter="url(#sombra)"><rect x="-230" y="-220" width="460" height="440" rx="22" fill="#78350f"/>
   ${['...##...', '..####..', '.######.', '########', '.######.', '.##..##.', '.##..##.', '.######.'].map((r, f) => [...r].map((x, k) => (x === '#' ? `<rect x="${-208 + k * 52}" y="${-208 + f * 52}" width="46" height="46" rx="7" fill="${(f * 8 + k) % 7 < 3 ? F[(f + k) % 4] : '#fef3c7'}"/>` : '')).join('')).join('')}</g>
   <g transform="translate(850 900) rotate(18)" filter="url(#sombra)">${[[0, 0], [0, 1], [0, 2], [1, 1]].map(([f, k]) => `<rect x="${-78 + k * 52}" y="${-52 + f * 52}" width="48" height="48" rx="8" fill="#d9a93f" stroke="#fff8e7" stroke-width="5"/>`).join('')}</g>
   <g transform="translate(160 920) rotate(-14)" filter="url(#sombra)">${[[0, 0], [1, 0], [2, 0], [2, 1]].map(([f, k]) => `<rect x="${-26 + k * 52}" y="${-78 + f * 52}" width="48" height="48" rx="8" fill="#8a6fa3" stroke="#fff8e7" stroke-width="5"/>`).join('')}</g>`],
  datosobra: ['#3d1f0f', 2, titulo('EL DATO', 'QUE SOBRA', '#fff3d6', '#fb923c'), `
   ${['A', 'B', 'C', 'D'].map((l, i) => `<g transform="translate(${470 + (i % 2 ? 16 : -16)} ${650 + i * 100}) rotate(${i % 2 ? 2 : -2})" filter="url(#sombra)"><rect x="-320" y="-42" width="600" height="84" rx="18" fill="${i === 2 ? '#fee2e2' : '#fffaf0'}" stroke="${i === 2 ? '#d9663f' : '#e2d6bd'}" stroke-width="6"/><rect x="-302" y="-28" width="56" height="56" rx="12" fill="${i === 2 ? '#d9663f' : '#1f4e5a'}"/>${T(l, 40, '#fff8e7', 15, -274)}<rect x="-226" y="-11" width="${[360, 290, 400, 320][i]}" height="22" rx="11" fill="#cbd5e1"/>${T(i === 2 ? '✗' : '✓', 54, i === 2 ? '#dc2626' : '#16a34a', 20, 240)}</g>`).join('')}
   <g transform="translate(880 560)" filter="url(#sombra)"><circle r="72" fill="#fff8e7"/>${T('⚽', 80, '#000', 28)}</g>`],
  pareja: ['#4a1530', 3, titulo('LA PAREJA', 'PERFECTA', '#fff3d6', '#f9a8d4'), `
   ${carta(330, 790, -8, '#1f4e5a', `<rect x="-90" y="-110" width="180" height="125" rx="8" fill="#fff"/><circle cy="-48" r="36" fill="#dc2626"/>${T('JAPÓN', 34, '#fff8e7', 75)}`, 240, 330)}
   ${carta(700, 790, 8, '#d9663f', `${T('¥', 150, '#fff8e7', 30)}${T('YEN', 34, '#fff8e7', 110)}`, 240, 330)}
   <g transform="translate(512 640)" filter="url(#sombra)"><path d="M0 60C-90 0-110-50-80-80c25-25 60-15 80 15 20-30 55-40 80-15 30 30 10 80-80 140z" fill="#f43f5e" stroke="#fff" stroke-width="10"/></g>${fichas(['#facc15', '#22c55e'])}`],
  tablero: ['#1e1145', 4, titulo('EL TABLERO', 'DE PUNTOS', '#fde68a', '#fff3d6', 140), `
   <g transform="translate(512 790)" filter="url(#sombra)"><rect x="-400" y="-210" width="800" height="400" rx="24" fill="#1e1b4b" stroke="#fbbf24" stroke-width="8"/>
   ${[0, 1, 2, 3].map((f) => [0, 1, 2, 3, 4].map((k) => { const v = [100, 200, 300, 500][f]; const usada = (f * 5 + k) % 4 === 1; return `<rect x="${-380 + k * 152}" y="${-190 + f * 94}" width="140" height="84" rx="12" fill="${usada ? '#312e81' : '#4338ca'}"/>${usada ? '' : T(v, 42, '#fde68a', -133 + f * 94, -310 + k * 152)}`; }).join('')).join('')}</g>
   <g transform="translate(880 560)" filter="url(#sombra)"><circle r="72" fill="#fff8e7"/><circle r="52" fill="none" stroke="#d9663f" stroke-width="12"/><circle r="26" fill="none" stroke="#d9663f" stroke-width="12"/><circle r="8" fill="#1d2b33"/></g>`],
  musavanzado: ['#0f2a1a', 0, titulo('MUS', 'AVANZADO', '#fff3d6', '#fbbf24', 160), `
   <g transform="translate(512 860)" filter="url(#sombra)"><ellipse rx="440" ry="140" fill="#166534" stroke="#a16207" stroke-width="14"/></g>
   ${[['12', '#b45309', -20], ['7', '#b91c1c', -8], ['★', '#7c3aed', 6], ['11', '#1d4ed8', 18]].map(([n, c, r], i) => carta(320 + i * 130, 760, r, i === 2 ? '#fde68a' : '#fffdf6', `${T(n, i === 2 ? 90 : 46, c, i === 2 ? 30 : -55, i === 2 ? 0 : -40)}${i === 2 ? '' : `<circle cy="15" r="34" fill="${c}" opacity=".85"/>`}`)).join('')}
   ${[0, 1, 2, 3, 4].map((i) => `<g transform="translate(${130 + (i % 2) * 24} ${940 - i * 14})"><ellipse rx="44" ry="14" fill="${F[i]}" stroke="#fff" stroke-width="3"/></g>`).join('')}
   <g transform="translate(870 900)" filter="url(#sombra)"><circle r="66" fill="#fff8e7"/>${T('?!', 70, '#d9663f', 25)}</g>`]
};

(async () => {
  const solo = process.argv[2] ? process.argv[2].split(',') : Object.keys(P);
  for (const id of solo) {
    const [pared, sem, tit, piezas] = P[id];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${defs}${escena(pared, sem, piezas)}${tit}</svg>`;
    if (process.argv[3] !== 'prueba') await sharp(Buffer.from(svg)).resize(512, 512).webp({ quality: 88 }).toFile(`${OUT}${id}.webp`);
    await sharp(Buffer.from(svg)).resize(256, 256).png().toFile(`${PREV}${id}.png`);
  }
  const ids = solo;
  const cols = 6;
  await sharp({ create: { width: cols * 256, height: Math.ceil(ids.length / cols) * 256, channels: 3, background: '#fff' } })
    .composite(ids.map((id, i) => ({ input: `${PREV}${id}.png`, left: (i % cols) * 256, top: Math.floor(i / cols) * 256 }))).png().toFile(`${PREV}hoja.png`);
  console.log('ok', ids.length);
})();
