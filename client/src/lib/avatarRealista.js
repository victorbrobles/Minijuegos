// client/src/lib/avatarRealista.js
// Avatar de cuerpo entero con volumen (degradados y sombras), dibujado en SVG. Lo usa la web (para dibujarlo) y el
// servidor (para validar las piezas, vía avatarPartes.js). svgAvatar(a, { modo: 'cuerpo' | 'cara', fondo }) devuelve el SVG.

export const PIELES = ['#ffe3d1', '#f9d3b8', '#f1c09c', '#e3a982', '#cf9269', '#b67a52', '#9a6140', '#7d4a2e', '#5f3720', '#432616'];
export const COLORES_PELO = ['#16120f', '#2c1d14', '#4a2c1b', '#6e4226', '#93602f', '#b98545', '#d9ad66', '#ecd08f', '#a8452a', '#d26a3b', '#8f8f94', '#e8e6e1', '#3b6fd8', '#d94f9b'];
export const COLORES_OJOS = ['#4b2e1e', '#7a4f2a', '#3f7a3a', '#3a74b5', '#5d6b78', '#1d1d1d'];
export const COLORES_ROPA = ['#f8fafc', '#1f2937', '#64748b', '#b91c1c', '#ea580c', '#eab308', '#15803d', '#0d9488', '#2563eb', '#1e3a8a', '#7c3aed', '#db2777', '#f9a8d4', '#a3734f', '#5b7fa6'];

export const PIEZAS = [
  { id: 'piel', nombre: 'Piel', n: PIELES.length, colores: PIELES },
  { id: 'pelo', nombre: 'Peinado', n: 16, opciones: ['Rapado', 'Corto', 'Raya al lado', 'Largo liso', 'Largo rizado', 'Media melena', 'Coleta', 'Moño', 'Afro', 'Trenzas', 'Calvo', 'Corto rizado', 'De punta', 'Flequillo', 'Cresta', 'Dos coletas'] },
  { id: 'colorPelo', nombre: 'Color de pelo', n: COLORES_PELO.length, colores: COLORES_PELO },
  { id: 'ojos', nombre: 'Ojos', n: 6, opciones: ['Normales', 'Grandes', 'Rasgados', 'Sonrientes', 'Con pestañas', 'Adormilados'] },
  { id: 'colorOjos', nombre: 'Color de ojos', n: COLORES_OJOS.length, colores: COLORES_OJOS },
  { id: 'boca', nombre: 'Boca', n: 5, opciones: ['Sonrisa', 'Risa', 'Seria', 'Pícara', 'Sorpresa'] },
  { id: 'barba', nombre: 'Barba', n: 6, opciones: ['Sin barba', 'De tres días', 'Perilla', 'Bigote', 'Barba corta', 'Barba larga'] },
  { id: 'gafas', nombre: 'Gafas', n: 5, opciones: ['Sin gafas', 'Redondas', 'Rectangulares', 'De sol', 'De pasta'] },
  { id: 'arriba', nombre: 'Parte de arriba', n: 10, opciones: ['Camiseta', 'Camisa', 'Sudadera', 'Chaqueta vaquera', 'Jersey de cuello alto', 'Top de tirantes', 'Traje', 'Vestido', 'Abrigo', 'Polo'] },
  { id: 'colorArriba', nombre: 'Color de arriba', n: COLORES_ROPA.length, colores: COLORES_ROPA },
  { id: 'abajo', nombre: 'Parte de abajo', n: 5, opciones: ['Vaqueros', 'Pantalón', 'Pantalón corto', 'Falda', 'Chándal'] },
  { id: 'colorAbajo', nombre: 'Color de abajo', n: COLORES_ROPA.length, colores: COLORES_ROPA },
  { id: 'calzado', nombre: 'Calzado', n: 5, opciones: ['Deportivas blancas', 'Deportivas negras', 'Botas', 'Zapatos', 'Zapatillas de color'] },
  { id: 'extra', nombre: 'Complementos', n: 10, opciones: ['Nada', 'Gorra', 'Gorro de lana', 'Pendientes', 'Collar', 'Auriculares', 'Sombrero', 'Bufanda', 'Diadema', 'Pajarita'] },
  // Piezas añadidas con los avatares 3D: los avatares guardados antes no las tienen y usan el valor `def`
  { id: 'colorExtra', nombre: 'Color del complemento', n: COLORES_ROPA.length, colores: COLORES_ROPA, def: 3 },
  { id: 'cuerpo', nombre: 'Cuerpo', n: 4, opciones: ['Delgado', 'Medio', 'Fuerte', 'Robusto'], def: 1 }
];

export const AVATAR_INICIAL = { piel: 2, pelo: 1, colorPelo: 2, ojos: 0, colorOjos: 0, boca: 0, barba: 0, gafas: 0, arriba: 0, colorArriba: 8, abajo: 0, colorAbajo: 14, calzado: 0, extra: 0, colorExtra: 3, cuerpo: 1 };

/* ───────── utilidades de color ───────── */
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const aHex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mezclar = (a, b, t) => { const x = hex(a); const y = hex(b); return aHex(x.map((v, i) => v + (y[i] - v) * t)); };
const oscuro = (c, t) => mezclar(c, '#000000', t);
const claro = (c, t) => mezclar(c, '#ffffff', t);

let contador = 0;

/**
 * Dibuja el avatar en SVG. modo 'cuerpo': personaje entero (200 × 420) · 'cara': busto recortado en círculo.
 * Las piezas que se animan (salas) van en grupos con clase: av-tronco, av-cabeza, av-brazo-i/d, av-pierna-i/d, av-ojos.
 */
export function svgAvatar(a, { modo = 'cuerpo', fondo = null } = {}) {
  const id = `av${++contador}`;
  const piel = PIELES[a.piel] ?? PIELES[2];
  const pelo = COLORES_PELO[a.colorPelo] ?? COLORES_PELO[2];
  const ojos = COLORES_OJOS[a.colorOjos] ?? COLORES_OJOS[0];
  const ropa = COLORES_ROPA[a.colorArriba] ?? COLORES_ROPA[8];
  const pant = COLORES_ROPA[a.colorAbajo] ?? COLORES_ROPA[14];
  const cE = COLORES_ROPA[a.colorExtra ?? 3] ?? COLORES_ROPA[3];
  const defs = [];
  const vol = (nombre, c, fuerza = 0.16) => {
    defs.push(`<linearGradient id="${id}${nombre}" x1="0" x2="1"><stop offset="0" stop-color="${oscuro(c, fuerza)}"/><stop offset="0.3" stop-color="${c}"/><stop offset="0.62" stop-color="${claro(c, 0.06)}"/><stop offset="1" stop-color="${oscuro(c, fuerza * 1.2)}"/></linearGradient>`);
    return `url(#${id}${nombre})`;
  };
  const vert = (nombre, c1, c2) => {
    defs.push(`<linearGradient id="${id}${nombre}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`);
    return `url(#${id}${nombre})`;
  };
  defs.push(`<radialGradient id="${id}cara" cx="0.42" cy="0.34" r="0.78"><stop offset="0" stop-color="${claro(piel, 0.14)}"/><stop offset="0.55" stop-color="${piel}"/><stop offset="1" stop-color="${oscuro(piel, 0.16)}"/></radialGradient>`);
  defs.push(`<radialGradient id="${id}iris" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stop-color="${claro(ojos, 0.35)}"/><stop offset="0.6" stop-color="${ojos}"/><stop offset="1" stop-color="${oscuro(ojos, 0.45)}"/></radialGradient>`);
  defs.push(`<radialGradient id="${id}pelo" cx="0.4" cy="0.25" r="0.85"><stop offset="0" stop-color="${claro(pelo, 0.22)}"/><stop offset="0.55" stop-color="${pelo}"/><stop offset="1" stop-color="${oscuro(pelo, 0.22)}"/></radialGradient>`);
  const fPiel = vol('piel', piel, 0.12);
  const fCara = `url(#${id}cara)`;
  const sPiel = oscuro(piel, 0.24);
  const fPelo = `url(#${id}pelo)`;
  const fPeloV = vert('pelov', claro(pelo, 0.16), oscuro(pelo, 0.16));
  const brillo = claro(pelo, 0.45);
  const fRopa = vol('ropa', ropa);
  const fPant = vol('pant', pant);
  const fExtra = vol('extra', cE);
  const linea = (c) => oscuro(c, 0.28);
  // Contorno suave (un tono más oscuro que el relleno): da el acabado de dibujo animado
  const borde = (c, w = 1.3) => `stroke="${oscuro(c, 0.38)}" stroke-width="${w}" stroke-linejoin="round"`;
  const espejo = (svg) => `<g transform="translate(200 0) scale(-1 1)">${svg}</g>`;
  const ambos = (svg) => svg + espejo(svg);
  const mechas = (lista, op = 0.35) => lista.map((d) => `<path d="${d}" stroke="${brillo}" stroke-width="2" fill="none" opacity="${op}" stroke-linecap="round"/>`).join('');
  const lineasPelo = (lista) => lista.map((d) => `<path d="${d}" stroke="${oscuro(pelo, 0.3)}" stroke-width="1.1" fill="none" opacity="0.55" stroke-linecap="round"/>`).join('');

  /* ───────── Pelo ───────── */
  const rizos = (puntos, r, fill) => puntos.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${r + ((i * 7) % 5) - 2}" fill="${fill}" ${borde(pelo, 1)}/>`).join('');
  const arco = (cx, cy, rx, ry, desde, hasta, n) => Array.from({ length: n }, (_, i) => {
    const t = (desde + ((hasta - desde) * i) / (n - 1)) * Math.PI / 180;
    return [Math.round(cx + rx * Math.cos(t)), Math.round(cy + ry * Math.sin(t))];
  });
  const raya = `M100 38 C80 44 66 60 62 100 C57 68 64 42 100 33 C136 42 143 68 138 100 C134 60 120 44 100 38 Z`;
  const casquete = `M61 84 C58 50 76 35 100 35 C124 35 142 50 139 84 C134 63 120 54 100 54 C80 54 66 63 61 84Z`;
  const tupe = `M60 88 C55 50 74 33 100 33 C128 33 147 50 140 90 C138 74 132 64 124 59 C112 66 92 67 76 60 C68 66 63 76 60 88 Z`;
  let peloDetras = '';
  let peloDelante = '';
  const pp = (d, extra = '') => `<path d="${d}" fill="${fPelo}" ${borde(pelo)}/>${extra}`;
  switch (a.pelo) {
    case 0: peloDelante = `<path d="M62 84 C60 52 76 40 100 40 C124 40 140 52 138 84 C134 64 122 52 100 52 C78 52 66 64 62 84Z" fill="${pelo}" opacity="0.55"/>${Array.from({ length: 60 }, (_, i) => [66 + (i * 29) % 68, 42 + (i * 13) % 20]).filter(([x, y]) => ((x - 100) / 36) ** 2 + ((y - 62) / 20) ** 2 < 1 && y < 58).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="0.8" fill="${oscuro(pelo, 0.3)}" opacity="0.45"/>`).join('')}`; break;
    case 1: peloDelante = pp(tupe, mechas(['M74 46 Q98 34 126 48', 'M80 54 Q98 46 116 54']) + lineasPelo(['M88 60 Q92 50 100 46', 'M108 62 Q112 52 120 50'])); break;
    case 2: peloDelante = pp(`M59 92 C54 48 76 32 102 32 C131 33 147 52 141 92 C137 70 128 60 117 55 C104 58 84 64 68 72 C64 78 61 85 59 92 Z`, mechas(['M70 60 Q96 44 124 50']) + lineasPelo(['M117 55 Q110 44 100 38', 'M100 60 Q96 48 88 42', 'M84 64 Q80 54 74 50'])); break;
    case 3:
      peloDetras = `<path d="M57 84 C55 46 76 33 100 33 C124 33 145 46 143 84 L148 212 Q128 222 114 212 L113 150 L87 150 L86 212 Q72 222 52 212 Z" fill="${fPeloV}" ${borde(pelo)}/>${lineasPelo(['M62 120 Q60 170 64 208', 'M138 120 Q140 170 136 208', 'M70 150 Q70 184 74 212', 'M130 150 Q130 184 126 212'])}`;
      peloDelante = pp(raya, mechas(['M98 40 Q80 52 70 92', 'M102 40 Q120 52 130 92'], 0.3)); break;
    case 4: {
      const bordeR = arco(100, 118, 54, 92, 180, 360, 22).concat(arco(100, 118, 54, 92, 0, 40, 4), arco(100, 118, 54, 92, 140, 180, 4));
      peloDetras = `<ellipse cx="100" cy="116" rx="52" ry="88" fill="${oscuro(pelo, 0.08)}"/>${rizos(bordeR, 15, fPelo)}`;
      peloDelante = rizos(arco(100, 82, 41, 44, 190, 350, 9), 11, fPelo) + `<circle cx="64" cy="98" r="9" fill="${fPelo}"/><circle cx="136" cy="98" r="9" fill="${fPelo}"/>`;
      break;
    }
    case 5:
      peloDetras = `<path d="M56 86 C54 46 76 33 100 33 C124 33 146 46 144 86 L146 140 Q132 150 118 140 L118 112 L82 112 L82 140 Q68 150 54 140 Z" fill="${fPeloV}" ${borde(pelo)}/>${lineasPelo(['M62 110 Q62 126 66 140', 'M138 110 Q138 126 134 140'])}`;
      peloDelante = pp(raya, mechas(['M98 40 Q82 52 72 88'], 0.3)); break;
    case 6:
      peloDetras = `<path d="M126 58 C152 66 160 122 148 178 C142 156 138 124 124 96 Z" fill="${fPeloV}" ${borde(pelo)}/>${lineasPelo(['M134 76 Q148 116 146 166'])}`;
      peloDelante = pp(casquete, `<rect x="128" y="62" width="10" height="8" rx="3" fill="${cE}" ${borde(cE, 1)} transform="rotate(20 132 65)"/>` + mechas(['M74 50 Q100 40 126 50'])); break;
    case 7:
      peloDetras = `<circle cx="100" cy="27" r="17" fill="${fPelo}" ${borde(pelo)}/><path d="M90 22 Q100 14 110 24" stroke="${brillo}" stroke-width="2" fill="none" opacity="0.4"/><rect x="88" y="38" width="24" height="5" rx="2.5" fill="${cE}"/>`;
      peloDelante = pp(casquete, mechas(['M74 50 Q100 40 126 50'])); break;
    case 8:
      peloDetras = `<circle cx="100" cy="74" r="56" fill="${oscuro(pelo, 0.06)}"/>${rizos(arco(100, 74, 54, 54, 0, 360, 26), 10, fPelo)}`;
      peloDelante = rizos(arco(100, 80, 38, 38, 200, 340, 8), 9, fPelo); break;
    case 9: {
      const trenza = (x) => Array.from({ length: 9 }, (_, i) => `<ellipse cx="${x + (i % 2 ? 2 : -2)}" cy="${118 + i * 11}" rx="7.5" ry="7" fill="${fPelo}" ${borde(pelo, 1)}/>`).join('') + `<rect x="${x - 5}" y="214" width="10" height="5" rx="2" fill="${cE}"/>`;
      peloDetras = trenza(62) + trenza(138);
      peloDelante = pp(raya); break;
    }
    case 11: peloDelante = rizos(arco(100, 82, 40, 44, 180, 360, 14), 9, fPelo); break;
    case 12: // de punta
      peloDelante = pp('M60 90 C56 62 63 48 70 44 L66 28 L80 38 L84 20 L95 33 L102 15 L109 32 L119 19 L122 37 L135 28 L131 46 C140 54 144 70 140 90 C136 70 128 60 118 56 C104 62 88 62 76 58 C68 64 63 76 60 90Z', mechas(['M84 26 L90 40', 'M102 20 L103 38', 'M118 24 L114 40']) + lineasPelo(['M76 58 Q82 50 90 46', 'M104 60 Q108 50 114 46'])); break;
    case 13: // flequillo
      peloDetras = `<path d="M58 86 C56 100 58 112 62 120 L68 120 L66 90 Z M142 86 C144 100 142 112 138 120 L132 120 L134 90 Z" fill="${fPeloV}"/>`;
      peloDelante = pp('M59 96 C54 48 76 32 100 32 C124 32 146 48 141 96 C139 86 137 80 134 77 L128 72 L122 78 L115 72 L108 78 L100 72 L92 78 L85 72 L78 78 L72 72 L66 77 C63 81 61 88 59 96Z', mechas(['M72 46 Q100 34 128 46']) + lineasPelo(['M85 72 L88 56', 'M100 72 L100 52', 'M115 72 L112 56', 'M72 72 L78 56', 'M128 72 L122 56'])); break;
    case 14: // cresta
      peloDelante = `<path d="M62 84 C60 52 76 40 100 40 C124 40 140 52 138 84 C134 64 122 52 100 52 C78 52 66 64 62 84Z" fill="${pelo}" opacity="0.4"/>` + pp('M88 64 C86 50 86 36 90 26 L94 34 L97 16 L101 30 L106 14 L108 30 L113 22 L113 40 C114 50 113 58 112 64 Q100 58 88 64Z', mechas(['M100 22 L100 52'], 0.4)); break;
    case 15: // dos coletas
      peloDetras = ambos(`<path d="M66 70 C40 74 30 110 40 146 C46 128 52 110 64 96 Z" fill="${fPeloV}" ${borde(pelo)}/><circle cx="62" cy="72" r="5" fill="${cE}" ${borde(cE, 1)}/>`) + lineasPelo(['M50 92 Q40 116 42 138', 'M150 92 Q160 116 158 138']);
      peloDelante = pp(raya, mechas(['M98 40 Q80 52 70 90', 'M102 40 Q120 52 130 90'], 0.3)); break;
    default: break; // 10: calvo
  }

  /* ───────── Cabeza y cara ───────── */
  const orejas = ambos(`<ellipse cx="61" cy="90" rx="7.5" ry="12" fill="${piel}" ${borde(piel, 1.1)}/><path d="M60 84 Q55 90 59 97" stroke="${sPiel}" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M62 88 Q60 91 62 94" stroke="${sPiel}" stroke-width="1" fill="none" opacity="0.6"/>`);
  const cara = `<path d="M100 42 C127 42 139 62 139 86 C139 107 131 120 119 127 C111 132 105 134 100 134 C95 134 89 132 81 127 C69 120 61 107 61 86 C61 62 73 42 100 42 Z" fill="${fCara}" ${borde(piel, 1.3)}/>`
    + `<path d="M70 112 Q80 128 100 131 Q120 128 130 112 Q122 124 100 127 Q78 124 70 112Z" fill="${sPiel}" opacity="0.18"/>`; // sombra de la mandíbula
  const calvo = a.pelo === 10 || a.pelo === 0 || a.pelo === 14;
  const cejaColor = calvo ? oscuro(pelo, 0.2) : oscuro(pelo, 0.08);
  const cejas = ambos(`<path d="M72.5 79 Q81 70.5 94 74.5 Q93.5 76.5 92.5 76.8 Q82 74 74 79.6 Z" fill="${cejaColor}" stroke="${cejaColor}" stroke-width="1.2" stroke-linejoin="round"/>`);
  defs.push(`<clipPath id="${id}ojo"><path d="M74 88 Q84 ${88 - ({ 1: 7.6, 2: 4.4, 5: 6 }[a.ojos] ?? 6.2)} 94 88 Q84 ${88 + ({ 1: 7.6, 2: 4.4, 5: 6 }[a.ojos] ?? 6.2) * 0.85} 74 88 Z"/></clipPath>`);
  const ojo = () => {
    if (a.ojos === 3) return `<path d="M75 89.5 Q84 81 93 89.5" stroke="#2b1d16" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M76 87.5 L73.5 85.5" stroke="#2b1d16" stroke-width="1.6" stroke-linecap="round"/>`;
    const g = a.ojos === 1; const r = a.ojos === 2;
    const alto = g ? 7.6 : r ? 4.4 : 6.2;
    const iris = g ? 5.8 : r ? 4.3 : 5;
    let s = `<path d="M74 88 Q84 ${88 - alto} 94 88 Q84 ${88 + alto * 0.85} 74 88 Z" fill="#ffffff"/>`;
    s += `<g clip-path="url(#${id}ojo)"><circle cx="84" cy="88.4" r="${iris}" fill="url(#${id}iris)"/><circle cx="84" cy="88.4" r="${iris * 0.46}" fill="#0d0d0d"/>`
      + `<circle cx="86" cy="86.3" r="${iris * 0.3}" fill="#ffffff"/><circle cx="82.2" cy="90.3" r="${iris * 0.13}" fill="#ffffff" opacity="0.8"/>`
      + `<path d="M74 88 Q84 ${88 - alto} 94 88 L94 ${86 - alto} L74 ${86 - alto} Z" fill="${oscuro(piel, 0.1)}" opacity="0.18"/>`
      + (a.ojos === 5 ? `<path d="M72 ${88 - alto - 1} L96 ${88 - alto - 1} L96 87.6 Q84 85 72 87.6 Z" fill="${piel}"/><path d="M72.5 87.6 Q84 85 95.5 87.6" stroke="${sPiel}" stroke-width="0.8" fill="none"/>` : '')
      + `</g>`;
    s += `<path d="M73.2 88.4 Q84 ${87 - alto} 94.8 87.6" stroke="#22160f" stroke-width="${a.ojos === 4 ? 2.8 : 2.1}" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M76 89.5 Q84 ${88 + alto * 0.9} 92.5 89.5" stroke="${sPiel}" stroke-width="0.8" fill="none" opacity="0.7"/>`;
    s += `<path d="M75 ${84.5 - alto} Q84 ${80 - alto} 93 ${84 - alto}" stroke="${sPiel}" stroke-width="0.9" fill="none" opacity="0.45"/>`; // pliegue del párpado
    if (a.ojos === 4) s += `<path d="M74 88 L69.5 85.5 M75.5 85.2 L72 81.6 M78.5 83.2 L76.5 79.2" stroke="#22160f" stroke-width="1.5" stroke-linecap="round"/>`;
    return s;
  };
  const ojosSvg = ojo() + `<g transform="translate(32 0)">${ojo()}</g>`;
  const nariz = `<path d="M100.5 92 Q97 102 95.5 105" stroke="${sPiel}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`
    + `<path d="M94.5 105.5 Q96 109 100 108.6 Q104 109 105.5 105.5" stroke="${sPiel}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`
    + `<ellipse cx="97" cy="106.6" rx="1.5" ry="1" fill="${oscuro(piel, 0.4)}" opacity="0.6"/><ellipse cx="103" cy="106.6" rx="1.5" ry="1" fill="${oscuro(piel, 0.4)}" opacity="0.6"/>`
    + `<ellipse cx="101.5" cy="102" rx="2.2" ry="1.6" fill="${claro(piel, 0.4)}" opacity="0.6"/>`;
  const labio = mezclar(oscuro(piel, 0.18), '#c2415a', 0.38);
  const labioOsc = oscuro(labio, 0.25);
  let boca;
  switch (a.boca) {
    case 1: boca = `<path d="M86.5 114.5 Q100 112.5 113.5 114.5 Q108 129 100 129 Q92 129 86.5 114.5 Z" fill="#5c1622" ${borde(labio, 1.2)}/><path d="M88.5 115.4 Q100 114 111.5 115.4 L110.2 119.2 Q100 120.6 89.8 119.2 Z" fill="#ffffff"/><path d="M92.5 125.5 Q100 129.5 107.5 125.5 Q100 122.5 92.5 125.5Z" fill="#e2788a"/>`; break;
    case 2: boca = `<path d="M89.5 117 Q95 115 100 116 Q105 115 110.5 117 Q100 120.5 89.5 117Z" fill="${labio}"/><path d="M89.5 117 Q100 121.5 110.5 117" stroke="${labioOsc}" stroke-width="1.1" fill="none"/><path d="M95 119.4 Q100 120.6 105 119.4" stroke="${claro(labio, 0.3)}" stroke-width="0.9" fill="none" opacity="0.7"/>`; break;
    case 3: boca = `<path d="M88.5 117 Q99 119.5 111.5 112.5" stroke="${labioOsc}" stroke-width="2.3" fill="none" stroke-linecap="round"/><path d="M91.5 118.6 Q101 122.4 109.5 115.8" stroke="${labio}" stroke-width="2.1" fill="none" stroke-linecap="round"/><path d="M111.5 112.5 Q113.5 111.5 113 109.5" stroke="${sPiel}" stroke-width="1" fill="none"/>`; break;
    case 4: boca = `<ellipse cx="100" cy="119" rx="5.4" ry="7" fill="#5c1622"/><ellipse cx="100" cy="119" rx="5.4" ry="7" fill="none" stroke="${labio}" stroke-width="2.2"/><ellipse cx="100" cy="122" rx="3" ry="2.4" fill="#e2788a"/>`; break;
    default: boca = `<path d="M87.5 115.6 Q100 119 112.5 115.6 Q106.5 125 100 125 Q93.5 125 87.5 115.6 Z" fill="${labio}"/><path d="M87.5 115.6 Q100 120.2 112.5 115.6" stroke="${labioOsc}" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M95 121.8 Q100 123.4 105 121.8" stroke="${claro(labio, 0.35)}" stroke-width="1" fill="none" opacity="0.7"/>`;
  }
  const mejillas = `<ellipse cx="75" cy="104" rx="8" ry="5" fill="#f26b7a" opacity="0.16"/><ellipse cx="125" cy="104" rx="8" ry="5" fill="#f26b7a" opacity="0.16"/>`;
  const cBarba = oscuro(pelo, 0.05);
  let barba = '';
  switch (a.barba) {
    case 1: barba = `<path d="M63 98 C64 118 80 132 100 134 C120 132 136 118 137 98 C132 112 120 120 112 116 Q100 112 88 116 C80 120 68 112 63 98 Z" fill="${cBarba}" opacity="0.2"/>${Array.from({ length: 40 }, (_, i) => `<circle cx="${70 + (i * 37) % 60}" cy="${108 + (i * 17) % 22}" r="0.6" fill="${cBarba}" opacity="0.45"/>`).join('')}`; break;
    case 2: barba = `<path d="M89.5 113 Q100 108.5 110.5 113 Q105 116 100 115 Q95 116 89.5 113Z" fill="${cBarba}"/><path d="M92.5 125 Q100 140 107.5 125 Q100 128.5 92.5 125Z" fill="${cBarba}" ${borde(pelo, 0.8)}/>`; break;
    case 3: barba = `<path d="M86 113.5 Q93 106.5 100 110 Q107 106.5 114 113.5 Q107 117.5 100 115 Q93 117.5 86 113.5Z" fill="${cBarba}" ${borde(pelo, 0.8)}/>${mechas(['M90 111 Q95 109 99 111'], 0.3)}`; break;
    case 4: barba = `<path d="M63 96 C64 120 80 134 100 136 C120 134 136 120 137 96 C133 110 124 116 114 114 Q100 106 86 114 C76 116 67 110 63 96 Z" fill="${cBarba}" ${borde(pelo, 1)}/>${lineasPelo(['M74 118 Q80 126 88 130', 'M126 118 Q120 126 112 130'])}`; break;
    case 5: barba = `<path d="M62 94 C62 130 80 152 100 154 C120 152 138 130 138 94 C134 108 124 115 114 113 Q100 104 86 113 C76 115 66 108 62 94 Z" fill="${cBarba}" ${borde(pelo, 1)}/>${mechas(['M88 128 Q100 146 112 128'], 0.25)}${lineasPelo(['M76 120 Q84 138 94 148', 'M124 120 Q116 138 106 148', 'M100 132 L100 150'])}`; break;
    default: break;
  }
  let gafas = '';
  const montura = (extra, c = '#1f2937') => ambos(extra) + `<path d="M95 87 Q100 84 105 87" stroke="${c}" stroke-width="2" fill="none"/>` + ambos(`<path d="M72 86 L62 84" stroke="${c}" stroke-width="2"/>`);
  switch (a.gafas) {
    case 1: gafas = montura(`<circle cx="84" cy="88" r="10" fill="#ffffff" fill-opacity="0.14" stroke="#b08d57" stroke-width="1.8"/><path d="M78 83 Q81 81 84 81" stroke="#ffffff" stroke-width="1.2" fill="none" opacity="0.7"/>`, '#b08d57'); break;
    case 2: gafas = montura(`<rect x="72" y="80" width="23" height="16" rx="3" fill="#ffffff" fill-opacity="0.14" stroke="#1f2937" stroke-width="2"/><path d="M75 83 L80 83" stroke="#ffffff" stroke-width="1.2" opacity="0.7"/>`); break;
    case 3: gafas = montura(`<path d="M71 81 L96 81 L95 91 Q93 98 84 98 Q74 98 72 91 Z" fill="#111827" stroke="#111827" stroke-width="1.5"/><path d="M74 84 L83 84 M75 87 L79 87" stroke="#ffffff" stroke-width="1.4" opacity="0.45"/>`, '#111827'); break;
    case 4: gafas = montura(`<rect x="71.5" y="79.5" width="24" height="17" rx="5" fill="#ffffff" fill-opacity="0.14" stroke="${cE}" stroke-width="3.6"/><path d="M75 83 L80 83" stroke="#ffffff" stroke-width="1.2" opacity="0.7"/>`, cE); break;
    default: break;
  }

  /* ───────── Cuerpo ───────── */
  const k = [0.88, 1, 1.12, 1.24][a.cuerpo ?? 1] ?? 1; // complexión: anchura del tronco, brazos y piernas
  const ancho = (svg, cx = 100, f = k) => (f === 1 ? svg : `<g transform="translate(${cx} 0) scale(${f} 1) translate(${-cx} 0)">${svg}</g>`);
  const cuello = `<path d="M88 118 L88 152 Q100 158 112 152 L112 118 Z" fill="${fPiel}" ${borde(piel, 1)}/><path d="M88 128 Q100 146 112 128 L112 138 Q100 150 88 138 Z" fill="${sPiel}" opacity="0.4"/>`;
  const mano = `<ellipse cx="60" cy="262" rx="7" ry="9.5" fill="${piel}" ${borde(piel, 1)}/><path d="M55.5 263 Q60 271 64.5 263 M57.5 266 L57 270 M60 267 L60 271.5 M62.5 266 L63 270" stroke="${sPiel}" stroke-width="1" fill="none" stroke-linecap="round"/><path d="M53.5 258 Q52 262 54.5 265" stroke="${sPiel}" stroke-width="1" fill="none"/>`;
  const brazo = `<path d="M70 157 Q60 160 58 178 L54 246 Q54 257 60 257 Q66 257 66 246 L70 186 Z" fill="${fPiel}" ${borde(piel, 1.1)}/>${mano}`;
  const torso = `M72 154 Q100 146 128 154 Q134 158 134 172 L131 264 L69 264 L66 172 Q66 158 72 154 Z`;
  const tronco = (f = fRopa, c = ropa) => `<path d="${torso}" fill="${f}" ${borde(c)}/>` + ((a.cuerpo ?? 1) === 3 ? `<path d="M70 200 Q66 248 76 260 L124 260 Q134 248 130 200 Q100 214 70 200Z" fill="${f}"/><path d="M76 236 Q100 252 124 236" stroke="${oscuro(c, 0.25)}" stroke-width="1.2" fill="none" opacity="0.6"/>` : '');
  const mangaCorta = (f, c = ropa) => `<path d="M72 154 Q59 158 56 180 L55 194 L69 196 L70 172 Z" fill="${f}" ${borde(c, 1.1)}/><path d="M55.5 191.5 L69 193.5" stroke="${oscuro(c, 0.25)}" stroke-width="1.4"/><path d="M62 170 Q60 180 61 190" stroke="${oscuro(c, 0.2)}" stroke-width="0.9" fill="none" opacity="0.6"/>`;
  const mangaLarga = (f, c = ropa, puno = oscuro(c, 0.12)) => `<path d="M72 154 Q59 158 56 180 L52 247 L67 249 L70 186 Z" fill="${f}" ${borde(c, 1.1)}/><path d="M52.5 241 L67.5 243 L67 250 L52 248 Z" fill="${puno}"/><path d="M63 190 Q61 210 63 232 M57 206 Q60 210 64 208" stroke="${oscuro(c, 0.22)}" stroke-width="1" fill="none" opacity="0.6"/>`;
  const escote = `<path d="M88 151 Q100 166 112 151 Z" fill="${fPiel}"/>`;
  const botones = (ys, c, x = 103) => ys.map((y) => `<circle cx="${x}" cy="${y}" r="1.8" fill="${c}"/><circle cx="${x - 0.5}" cy="${y - 0.5}" r="0.6" fill="#ffffff" opacity="0.6"/>`).join('');
  let arriba = '';
  let manga = '';
  let tapaPiernas = false; // vestido: lleva su propia falda
  switch (a.arriba) {
    case 1: // camisa
      manga = mangaLarga(fRopa); arriba = tronco() + `<path d="M100 150 L100 264" stroke="${linea(ropa)}" stroke-width="1.2"/>${botones([172, 192, 212, 232, 252], linea(ropa))}<path d="M88 150 L100 166 L94 172 L84 156 Z M112 150 L100 166 L106 172 L116 156 Z" fill="${claro(ropa, 0.1)}" ${borde(ropa, 1)}/><rect x="76" y="176" width="14" height="12" rx="2" fill="none" stroke="${linea(ropa)}" stroke-width="1"/>`; break;
    case 2: // sudadera
      manga = mangaLarga(fRopa); arriba = `<path d="M80 152 Q100 172 120 152 Q118 140 100 140 Q82 140 80 152 Z" fill="${oscuro(ropa, 0.18)}" ${borde(ropa)}/>` + tronco() + `<path d="M84 152 Q100 166 116 152" stroke="${oscuro(ropa, 0.25)}" stroke-width="3" fill="none"/><path d="M94 160 L93 184 M106 160 L107 184" stroke="${claro(ropa, 0.6)}" stroke-width="1.6" stroke-linecap="round"/><circle cx="93" cy="185.5" r="1.8" fill="${claro(ropa, 0.6)}"/><circle cx="107" cy="185.5" r="1.8" fill="${claro(ropa, 0.6)}"/><path d="M78 222 L122 222 L126 250 L74 250 Z" fill="${oscuro(ropa, 0.08)}" ${borde(ropa, 1)}/><rect x="69" y="256" width="62" height="8" fill="${oscuro(ropa, 0.14)}"/>`; break;
    case 3: { // chaqueta vaquera sobre camiseta blanca
      const vaq = ropa === COLORES_ROPA[0] ? '#7fa3cc' : ropa;
      const fVaq = vol('vaq', vaq, 0.18);
      arriba = `<path d="${torso}" fill="#f8fafc" ${borde('#e2e8f0')}/>${escote}`
        + ambos(`<path d="M72 154 Q84 149 90 151 L95 264 L69 264 L66 172 Q66 158 72 154Z" fill="${fVaq}" ${borde(vaq)}/><path d="M90 151 L84 176 L95 190" stroke="${oscuro(vaq, 0.3)}" stroke-width="1.4" fill="${claro(vaq, 0.08)}"/><rect x="73" y="182" width="14" height="12" rx="2" fill="none" stroke="${claro(vaq, 0.45)}" stroke-width="1.2" stroke-dasharray="2 1.5"/><path d="M93 200 L94 262" stroke="${claro(vaq, 0.45)}" stroke-width="1.2" stroke-dasharray="2 1.5"/><circle cx="91" cy="214" r="1.8" fill="#c9a227"/><circle cx="91.5" cy="236" r="1.8" fill="#c9a227"/>`);
      manga = mangaLarga(fVaq, vaq, oscuro(vaq, 0.15)); break;
    }
    case 4: // jersey de cuello alto
      manga = mangaLarga(fRopa); arriba = tronco() + `<rect x="86" y="134" width="28" height="22" rx="6" fill="${fRopa}" ${borde(ropa)}/>${[140, 145, 150].map((y) => `<path d="M88 ${y} L112 ${y}" stroke="${oscuro(ropa, 0.16)}" stroke-width="1"/>`).join('')}${[176, 200, 224].map((y) => `<path d="M72 ${y} Q100 ${y + 4} 128 ${y}" stroke="${oscuro(ropa, 0.12)}" stroke-width="1" fill="none" stroke-dasharray="3 2"/>`).join('')}<rect x="69" y="254" width="62" height="10" fill="${oscuro(ropa, 0.1)}"/>`; break;
    case 5: // top de tirantes
      arriba = `<path d="M70 172 Q100 182 130 172 L131 264 L69 264 L68 180 Z" fill="${fRopa}" ${borde(ropa)}/><path d="M80 154 L78 176 M120 154 L122 176" stroke="${ropa}" stroke-width="3.5" stroke-linecap="round"/><path d="M70 176 Q100 186 130 176" stroke="${claro(ropa, 0.3)}" stroke-width="1.2" fill="none" opacity="0.7"/>`; break;
    case 6: // traje
      manga = mangaLarga(fRopa, ropa, '#f8fafc'); arriba = tronco() + `<path d="M88 151 L100 192 L112 151 Z" fill="#f8fafc"/><path d="M98 156 L102 156 L104 186 L100 192 L96 186 Z" fill="${cE}" ${borde(cE, 0.8)}/>`
        + ambos(`<path d="M88 151 L100 192 L86 176 L82 158 Z" fill="${oscuro(ropa, 0.1)}" ${borde(ropa, 1)}/><path d="M74 214 L88 214" stroke="${linea(ropa)}" stroke-width="1.2"/>`) + botones([214, 234], linea(ropa), 100) + `<path d="M112 168 L120 166 L121 171 L113 172Z" fill="#f8fafc"/>`; break;
    case 7: // vestido
      tapaPiernas = true;
      manga = mangaCorta(fRopa); arriba = tronco() + escote + `<path d="M68 244 L132 244 L132 252 L68 252 Z" fill="${oscuro(ropa, 0.2)}"/><circle cx="100" cy="248" r="4" fill="${claro(ropa, 0.25)}" ${borde(ropa, 0.8)}/>`; break;
    case 8: // abrigo largo (por encima de las piernas)
      manga = mangaLarga(fRopa); arriba = `<path d="${torso}" fill="${fRopa}" ${borde(ropa)}/><path d="M66 250 L134 250 L140 336 Q100 342 60 336 Z" fill="${fRopa}" ${borde(ropa)}/>`
        + `<path d="M88 151 L100 172 L112 151 Z" fill="${claro(ropa, 0.6)}"/>` + ambos(`<path d="M86 150 L100 178 L84 172 L76 156 Z" fill="${oscuro(ropa, 0.12)}" ${borde(ropa, 1)}/><rect x="72" y="270" width="18" height="14" rx="3" fill="none" stroke="${linea(ropa)}" stroke-width="1.1"/>`)
        + `<path d="M100 178 L100 338" stroke="${linea(ropa)}" stroke-width="1.3"/>` + botones([196, 220, 244], linea(ropa), 94) + botones([196, 220, 244], linea(ropa), 106) + `<rect x="68" y="244" width="64" height="7" fill="${oscuro(ropa, 0.15)}"/>`; break;
    case 9: // polo
      manga = mangaCorta(fRopa); arriba = tronco() + escote + `<path d="M98 152 L98 176 L102 176 L102 152" fill="${claro(ropa, 0.08)}" stroke="${linea(ropa)}" stroke-width="1"/>${botones([160, 170], '#f8fafc', 100)}<path d="M84 150 L98 154 L92 164 Z M116 150 L102 154 L108 164 Z" fill="${claro(ropa, 0.12)}" ${borde(ropa, 1)}/><path d="M117 176 L125 176" stroke="${claro(ropa, 0.6)}" stroke-width="2.4" stroke-linecap="round"/>`; break;
    default: // camiseta (con un dibujito en el pecho)
      manga = mangaCorta(fRopa); arriba = tronco() + escote + `<path d="M87 151 Q100 168 113 151" stroke="${oscuro(ropa, 0.2)}" stroke-width="2" fill="none"/><path d="M100 196 l4 8 9 1 -7 6 2 9 -8 -5 -8 5 2 -9 -7 -6 9 -1z" fill="${claro(ropa, 0.55)}" opacity="0.85"/>`;
  }
  const arrugas = `<path d="M80 236 Q86 240 84 252 M120 230 Q114 238 117 252" stroke="${oscuro(ropa, 0.22)}" stroke-width="1" fill="none" opacity="0.5"/><ellipse cx="100" cy="157" rx="15" ry="4" fill="#000000" opacity="0.08"/>`;

  /* ───────── Piernas, parte de abajo y calzado ───────── */
  const pielI = `<path d="M74 298 L97 298 L95 388 L79 388 Z" fill="${fPiel}" ${borde(piel, 1)}/>`;
  const pielD = `<path d="M103 298 L126 298 L121 388 L105 388 Z" fill="${fPiel}" ${borde(piel, 1)}/>`;
  const perneraI = `<path d="M68 262 L100 262 L98 390 L75 390 Q69 326 68 262 Z" fill="${fPant}" ${borde(pant)}/>`;
  const perneraD = `<path d="M100 262 L132 262 Q131 326 125 390 L102 390 Z" fill="${fPant}" ${borde(pant)}/>`;
  const cinturilla = `<rect x="68" y="260" width="64" height="8" fill="${oscuro(pant, 0.12)}"/>`;
  let piernaI; let piernaD; let cadera;
  switch (tapaPiernas ? 3 : a.abajo) {
    case 1: piernaI = perneraI + `<path d="M86 278 L87 388" stroke="${oscuro(pant, 0.2)}" stroke-width="1" opacity="0.7"/>`; piernaD = perneraD + `<path d="M114 278 L113 388" stroke="${oscuro(pant, 0.2)}" stroke-width="1" opacity="0.7"/>`; cadera = cinturilla + `<rect x="74" y="261" width="4" height="7" fill="${oscuro(pant, 0.25)}"/><rect x="122" y="261" width="4" height="7" fill="${oscuro(pant, 0.25)}"/>`; break;
    case 2: piernaI = pielI + `<path d="M68 262 L100 262 L98 316 L72 316 Q69 290 68 262 Z" fill="${fPant}" ${borde(pant)}/><path d="M72 310 L98 310" stroke="${oscuro(pant, 0.2)}" stroke-width="1.2"/>`; piernaD = pielD + `<path d="M100 262 L132 262 Q131 290 128 316 L102 316 Z" fill="${fPant}" ${borde(pant)}/><path d="M102 310 L128 310" stroke="${oscuro(pant, 0.2)}" stroke-width="1.2"/>`; cadera = cinturilla; break;
    case 3: {
      const cF = tapaPiernas ? ropa : pant; const fF = tapaPiernas ? fRopa : fPant;
      piernaI = pielI; piernaD = pielD;
      cadera = `<path d="M68 ${tapaPiernas ? 250 : 258} L132 ${tapaPiernas ? 250 : 258} L144 328 Q100 338 56 328 Z" fill="${fF}" ${borde(cF)}/><path d="M80 270 L72 326 M100 270 L100 332 M120 270 L128 326" stroke="${oscuro(cF, 0.18)}" stroke-width="1" opacity="0.6"/><path d="M57 324 Q100 334 143 324" stroke="${claro(cF, 0.3)}" stroke-width="1.6" fill="none" opacity="0.6"/>`; break;
    }
    case 4: piernaI = perneraI + `<path d="M71 268 L77 388" stroke="#ffffff" stroke-width="3" opacity="0.9"/><path d="M75 380 L98 380" stroke="${oscuro(pant, 0.2)}" stroke-width="2"/>`; piernaD = perneraD + `<path d="M129 268 L123 388" stroke="#ffffff" stroke-width="3" opacity="0.9"/><path d="M102 380 L125 380" stroke="${oscuro(pant, 0.2)}" stroke-width="2"/>`; cadera = cinturilla + `<path d="M96 262 L95 272 M104 262 L105 272" stroke="#ffffff" stroke-width="1.2"/>`; break;
    default:
      piernaI = perneraI + `<path d="M78 330 Q86 334 94 330" stroke="${oscuro(pant, 0.22)}" stroke-width="1" fill="none" opacity="0.55"/><path d="M85 300 L86 386" stroke="${claro(pant, 0.3)}" stroke-width="1" opacity="0.6" stroke-dasharray="3 2"/><path d="M74 382 L98 382" stroke="${claro(pant, 0.25)}" stroke-width="1.4"/>`;
      piernaD = perneraD + `<path d="M106 330 Q114 334 122 330" stroke="${oscuro(pant, 0.22)}" stroke-width="1" fill="none" opacity="0.55"/><path d="M115 300 L114 386" stroke="${claro(pant, 0.3)}" stroke-width="1" opacity="0.6" stroke-dasharray="3 2"/><path d="M102 382 L125 382" stroke="${claro(pant, 0.25)}" stroke-width="1.4"/>`;
      cadera = `<path d="M100 268 L100 300" stroke="${oscuro(pant, 0.3)}" stroke-width="1.2"/>${cinturilla}<rect x="95" y="260.5" width="10" height="7" rx="1.5" fill="none" stroke="#c9a227" stroke-width="1.4"/><path d="M72 268 Q80 276 86 270 M128 268 Q120 276 114 270" stroke="${oscuro(pant, 0.3)}" stroke-width="1" fill="none"/>`;
  }
  const zapato = (c, suela, alto = 0, detalle = '') => `<path d="M75 ${384 - alto} L97 ${384 - alto} L98 398 Q98 405 92 405 L69 405 Q62 405 64 398 Q66 390 75 384 Z" fill="${c}" ${borde(c, 1.1)}/><path d="M63 401 L98 401 L98 405 L66 405 Q62 405 63 401 Z" fill="${suela}"/><path d="M68 394 Q72 390 78 390" stroke="#ffffff" stroke-width="1.2" fill="none" opacity="0.35"/>${detalle}`;
  const cordones = (c) => `<path d="M80 388 L90 386 M80.5 391.5 L91 389.5 M81 395 L92 393" stroke="${c}" stroke-width="1.3" stroke-linecap="round"/>`;
  let calzado;
  switch (a.calzado) {
    case 1: calzado = zapato('#1f2937', '#f8fafc', 0, cordones('#f8fafc')); break;
    case 2: calzado = zapato('#7c4a24', '#3b2414', 26, `<path d="M75 366 L97 366" stroke="#5b3416" stroke-width="2"/>${cordones('#d6b48a')}`); break;
    case 3: calzado = zapato('#111827', '#111827', 0, `<path d="M72 392 Q80 388 90 390" stroke="#4b5563" stroke-width="1" fill="none"/><path d="M70 396 Q74 392 80 393" stroke="#ffffff" stroke-width="1.4" fill="none" opacity="0.4"/>`); break;
    case 4: calzado = zapato(cE, '#f8fafc', 0, cordones('#f8fafc')); break;
    default: calzado = zapato('#f8fafc', '#cbd5e1', 0, cordones('#94a3b8') + `<path d="M72 397 L96 397" stroke="#cbd5e1" stroke-width="1.2"/>`);
  }

  /* ───────── Complementos ───────── */
  let extra = '';
  let cuelloExtra = ''; // bufanda, pajarita y collar van sobre la ropa
  let tapaPelo = false;
  switch (a.extra) {
    case 1: tapaPelo = true; extra = `<path d="M60 74 C58 42 76 32 100 32 C124 32 142 42 140 74 Z" fill="${fExtra}" ${borde(cE)}/><path d="M118 66 Q150 62 160 74 Q140 78 118 74 Z" fill="${oscuro(cE, 0.12)}" ${borde(cE, 1)}/><path d="M100 33 L100 72 M80 37 Q76 52 78 72 M120 37 Q124 52 122 72" stroke="${oscuro(cE, 0.25)}" stroke-width="1" fill="none"/><circle cx="100" cy="33" r="3" fill="${oscuro(cE, 0.2)}"/><circle cx="88" cy="56" r="7" fill="#f8fafc" opacity="0.9"/>`; break;
    case 2: tapaPelo = true; extra = `<path d="M60 78 C58 36 142 36 140 78 Z" fill="${fExtra}" ${borde(cE)}/>${[70, 82, 94, 106, 118, 130].map((x) => `<path d="M${x} 44 L${x} 72" stroke="${oscuro(cE, 0.15)}" stroke-width="1.2"/>`).join('')}<rect x="57" y="68" width="86" height="14" rx="7" fill="${oscuro(cE, 0.12)}" ${borde(cE, 1)}/><circle cx="100" cy="32" r="9" fill="#f8fafc" ${borde('#e2e8f0', 1)}/>`; break;
    case 3: extra = ambos(`<circle cx="60" cy="103" r="3.4" fill="#f5c542" stroke="#b8860b" stroke-width="0.8"/><path d="M60 106 L60 112" stroke="#b8860b" stroke-width="1"/><circle cx="60" cy="113.5" r="2.4" fill="${cE}"/>`); break;
    case 4: cuelloExtra = `<path d="M86 152 Q100 174 114 152" stroke="#f5c542" stroke-width="1.8" fill="none"/><path d="M100 166 L104 172 L100 178 L96 172 Z" fill="${cE}" stroke="#b8860b" stroke-width="1"/>`; break;
    case 5: extra = `<path d="M57 92 C55 34 145 34 143 92" stroke="#1f2937" stroke-width="5" fill="none"/>` + ambos(`<rect x="51" y="81" width="13" height="22" rx="5.5" fill="${fExtra}" ${borde(cE, 1.3)}/><rect x="54" y="85" width="4" height="14" rx="2" fill="#ffffff" opacity="0.35"/>`); break;
    case 6: tapaPelo = true; extra = `<ellipse cx="100" cy="64" rx="62" ry="12" fill="${oscuro(cE, 0.1)}" ${borde(cE)}/><path d="M70 62 C70 30 130 30 130 62 Z" fill="${fExtra}" ${borde(cE)}/><rect x="70" y="53" width="60" height="9" fill="${oscuro(cE, 0.35)}"/>`; break;
    case 7: cuelloExtra = `<path d="M80 146 Q100 162 120 146 L122 160 Q100 176 78 160 Z" fill="${fExtra}" ${borde(cE)}/><path d="M106 160 L114 206 L101 208 L98 164 Z" fill="${fExtra}" ${borde(cE)}/>${[172, 186].map((y) => `<path d="M${100 + (y - 160) * 0.07} ${y} L${110 + (y - 160) * 0.1} ${y - 1}" stroke="${claro(cE, 0.5)}" stroke-width="3"/>`).join('')}<path d="M101 208 L101 213 M105 207.5 L105.5 212.5 M109 207 L110 212 M113 206.5 L114 211" stroke="${cE}" stroke-width="1.6" stroke-linecap="round"/>`; break;
    case 8: extra = `<path d="M61 80 C60 38 140 38 139 80" stroke="${cE}" stroke-width="5.5" fill="none" stroke-linecap="round"/><path d="M61 80 C60 38 140 38 139 80" stroke="${claro(cE, 0.4)}" stroke-width="1.5" fill="none" opacity="0.6" stroke-dasharray="1 4"/><path d="M118 44 L130 36 L128 48 Z M118 44 L106 36 L108 48 Z" fill="${cE}" ${borde(cE, 1)}/><circle cx="118" cy="44" r="3" fill="${oscuro(cE, 0.15)}"/>`; break;
    case 9: cuelloExtra = `<path d="M100 154 L86 147 L86 163 Z M100 154 L114 147 L114 163 Z" fill="${fExtra}" ${borde(cE, 1.1)}/><rect x="96.5" y="150.5" width="7" height="7" rx="2" fill="${oscuro(cE, 0.15)}"/>`; break;
    default: break;
  }
  if (tapaPelo && a.pelo !== 10) peloDelante = `<path d="M61 92 C60 78 64 72 70 70 L130 70 C136 72 140 78 139 92 C134 80 124 76 100 76 C76 76 66 80 61 92Z" fill="${fPelo}" ${borde(pelo, 1)}/>`;

  const cuerpo = modo === 'cuerpo';
  const sombraSuelo = cuerpo ? `<ellipse cx="100" cy="408" rx="${46 * k}" ry="6" fill="#000000" opacity="0.15"/>` : '';
  const dx = (k - 1) * 30; // los brazos se separan con la complexión
  const cabeza = `<g class="av-cabeza">${orejas}${cara}${mejillas}${barba}${boca}${nariz}<g class="av-ojos">${ojosSvg}</g>${cejas}${gafas}${peloDelante}${extra}</g>`;
  const brazos = `<g class="av-brazo-i"><g transform="translate(${-dx} 0)">${brazo}${manga}</g></g><g class="av-brazo-d"><g transform="translate(${dx} 0)">${espejo(brazo + manga)}</g></g>`;
  const kp = 1 + (k - 1) * 0.7;
  const contenido = cuerpo
    ? `${sombraSuelo}<g class="av-todo"><g class="av-pierna-i">${ancho(piernaI + calzado, 86, kp)}</g><g class="av-pierna-d">${ancho(piernaD + espejo(calzado), 114, kp)}</g>`
      + `<g class="av-tronco"><g class="av-cabeza-atras">${peloDetras}</g><g class="av-cadera">${ancho(cadera)}</g>${brazos}${cuello}${ancho(arriba + arrugas)}${cuelloExtra}${cabeza}</g></g>`
    : `<g class="av-cabeza-atras">${peloDetras}</g>${brazos}${cuello}${ancho(arriba)}${cuelloExtra}${cabeza}`;
  const vb = cuerpo ? '0 0 200 420' : '42 22 116 116';
  const fondoSvg = fondo ? (cuerpo ? `<rect x="0" y="0" width="200" height="420" fill="${fondo}"/>` : `<circle cx="100" cy="80" r="58" fill="${fondo}"/><circle cx="88" cy="58" r="40" fill="#ffffff" opacity="0.12"/>`) : '';
  const recorte = !cuerpo ? `<clipPath id="${id}rc"><circle cx="100" cy="80" r="58"/></clipPath>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"><defs>${defs.join('')}${recorte}</defs><g${!cuerpo ? ` clip-path="url(#${id}rc)"` : ''}>${fondoSvg}${contenido}</g></svg>`;
}

export function avatarAleatorio(azar = Math.random) {
  const a = {};
  PIEZAS.forEach((p) => { a[p.id] = Math.floor(azar() * p.n); });
  if (azar() < 0.6) a.barba = 0;
  if (azar() < 0.6) a.gafas = 0;
  if (azar() < 0.55) a.extra = 0;
  if (azar() < 0.75) a.colorPelo = Math.floor(azar() * 10);
  return a;
}
