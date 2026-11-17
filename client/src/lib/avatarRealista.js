// client/src/lib/avatarRealista.js
// Avatar de cuerpo entero con volumen (degradados y sombras), dibujado en SVG. Lo usa la web (para dibujarlo) y el
// servidor (para validar las piezas, vía avatarPartes.js). svgAvatar(a, { modo: 'cuerpo' | 'cara', fondo }) devuelve el SVG.

export const PIELES = ['#ffe3d1', '#f9d3b8', '#f1c09c', '#e3a982', '#cf9269', '#b67a52', '#9a6140', '#7d4a2e', '#5f3720', '#432616'];
export const COLORES_PELO = ['#16120f', '#2c1d14', '#4a2c1b', '#6e4226', '#93602f', '#b98545', '#d9ad66', '#ecd08f', '#a8452a', '#d26a3b', '#8f8f94', '#e8e6e1', '#3b6fd8', '#d94f9b'];
export const COLORES_OJOS = ['#4b2e1e', '#7a4f2a', '#3f7a3a', '#3a74b5', '#5d6b78', '#1d1d1d'];
export const COLORES_ROPA = ['#f8fafc', '#1f2937', '#64748b', '#b91c1c', '#ea580c', '#eab308', '#15803d', '#0d9488', '#2563eb', '#1e3a8a', '#7c3aed', '#db2777', '#f9a8d4', '#a3734f', '#5b7fa6'];

export const PIEZAS = [
  { id: 'piel', nombre: 'Piel', n: PIELES.length, colores: PIELES },
  { id: 'pelo', nombre: 'Peinado', n: 12, opciones: ['Rapado', 'Corto', 'Raya al lado', 'Largo liso', 'Largo rizado', 'Media melena', 'Coleta', 'Moño', 'Afro', 'Trenzas', 'Calvo', 'Corto rizado'] },
  { id: 'colorPelo', nombre: 'Color de pelo', n: COLORES_PELO.length, colores: COLORES_PELO },
  { id: 'ojos', nombre: 'Ojos', n: 5, opciones: ['Normales', 'Grandes', 'Rasgados', 'Sonrientes', 'Con pestañas'] },
  { id: 'colorOjos', nombre: 'Color de ojos', n: COLORES_OJOS.length, colores: COLORES_OJOS },
  { id: 'boca', nombre: 'Boca', n: 5, opciones: ['Sonrisa', 'Risa', 'Seria', 'Pícara', 'Sorpresa'] },
  { id: 'barba', nombre: 'Barba', n: 6, opciones: ['Sin barba', 'De tres días', 'Perilla', 'Bigote', 'Barba corta', 'Barba larga'] },
  { id: 'gafas', nombre: 'Gafas', n: 5, opciones: ['Sin gafas', 'Redondas', 'Rectangulares', 'De sol', 'De pasta'] },
  { id: 'arriba', nombre: 'Parte de arriba', n: 7, opciones: ['Camiseta', 'Camisa', 'Sudadera', 'Chaqueta vaquera', 'Jersey de cuello alto', 'Top de tirantes', 'Traje'] },
  { id: 'colorArriba', nombre: 'Color de arriba', n: COLORES_ROPA.length, colores: COLORES_ROPA },
  { id: 'abajo', nombre: 'Parte de abajo', n: 5, opciones: ['Vaqueros', 'Pantalón', 'Pantalón corto', 'Falda', 'Chándal'] },
  { id: 'colorAbajo', nombre: 'Color de abajo', n: COLORES_ROPA.length, colores: COLORES_ROPA },
  { id: 'calzado', nombre: 'Calzado', n: 5, opciones: ['Deportivas blancas', 'Deportivas negras', 'Botas', 'Zapatos', 'Zapatillas de color'] },
  { id: 'extra', nombre: 'Complementos', n: 7, opciones: ['Nada', 'Gorra', 'Gorro de lana', 'Pendientes', 'Collar', 'Auriculares', 'Sombrero'] }
];

export const AVATAR_INICIAL = { piel: 2, pelo: 1, colorPelo: 2, ojos: 0, colorOjos: 0, boca: 0, barba: 0, gafas: 0, arriba: 0, colorArriba: 8, abajo: 0, colorAbajo: 14, calzado: 0, extra: 0 };

/* ───────── utilidades de color ───────── */
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const aHex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mezclar = (a, b, t) => { const x = hex(a); const y = hex(b); return aHex(x.map((v, i) => v + (y[i] - v) * t)); };
const oscuro = (c, t) => mezclar(c, '#000000', t);
const claro = (c, t) => mezclar(c, '#ffffff', t);

let contador = 0;

export function svgAvatar(a, { modo = 'cuerpo', fondo = null } = {}) {
  const id = `av${++contador}`;
  const piel = PIELES[a.piel] ?? PIELES[2];
  const pelo = COLORES_PELO[a.colorPelo] ?? COLORES_PELO[2];
  const ojos = COLORES_OJOS[a.colorOjos] ?? COLORES_OJOS[0];
  const ropa = COLORES_ROPA[a.colorArriba] ?? COLORES_ROPA[8];
  const pant = COLORES_ROPA[a.colorAbajo] ?? COLORES_ROPA[14];
  const defs = [];
  // Degradado «de volumen»: más oscuro en los bordes que en el centro
  const vol = (nombre, c, fuerza = 0.16) => {
    defs.push(`<linearGradient id="${id}${nombre}" x1="0" x2="1"><stop offset="0" stop-color="${oscuro(c, fuerza)}"/><stop offset="0.35" stop-color="${c}"/><stop offset="0.65" stop-color="${c}"/><stop offset="1" stop-color="${oscuro(c, fuerza)}"/></linearGradient>`);
    return `url(#${id}${nombre})`;
  };
  const vert = (nombre, c1, c2) => {
    defs.push(`<linearGradient id="${id}${nombre}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`);
    return `url(#${id}${nombre})`;
  };
  defs.push(`<radialGradient id="${id}cara" cx="0.42" cy="0.36" r="0.75"><stop offset="0" stop-color="${claro(piel, 0.1)}"/><stop offset="0.6" stop-color="${piel}"/><stop offset="1" stop-color="${oscuro(piel, 0.14)}"/></radialGradient>`);
  const fPiel = vol('piel', piel, 0.12);
  const fCara = `url(#${id}cara)`;
  const sPiel = oscuro(piel, 0.22);
  const fPelo = vert('pelo', claro(pelo, 0.18), oscuro(pelo, 0.12));
  const brillo = claro(pelo, 0.4);
  const fRopa = vol('ropa', ropa);
  const fPant = vol('pant', pant);
  const linea = (c) => oscuro(c, 0.28);
  const espejo = (svg) => `<g transform="translate(200 0) scale(-1 1)">${svg}</g>`;
  const ambos = (svg) => svg + espejo(svg);

  /* ───────── Pelo ───────── */
  const rizos = (puntos, r, fill) => puntos.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${r + ((i * 7) % 5) - 2}" fill="${fill}"/>`).join('');
  const arco = (cx, cy, rx, ry, desde, hasta, n) => Array.from({ length: n }, (_, i) => {
    const t = (desde + ((hasta - desde) * i) / (n - 1)) * Math.PI / 180;
    return [Math.round(cx + rx * Math.cos(t)), Math.round(cy + ry * Math.sin(t))];
  });
  const raya = `M100 38 C80 44 66 60 62 100 C57 68 64 42 100 33 C136 42 143 68 138 100 C134 60 120 44 100 38 Z`;
  let peloDetras = '';
  let peloDelante = '';
  switch (a.pelo) {
    case 0: peloDelante = `<path d="M62 84 C60 52 76 40 100 40 C124 40 140 52 138 84 C134 64 122 52 100 52 C78 52 66 64 62 84Z" fill="${pelo}" opacity="0.6"/>`; break;
    case 1: peloDelante = `<path d="M60 88 C55 50 74 33 100 33 C128 33 147 50 140 90 C138 74 132 64 124 59 C112 66 92 67 76 60 C68 66 63 76 60 88 Z" fill="${fPelo}"/><path d="M74 46 Q98 34 126 48" stroke="${brillo}" stroke-width="3" fill="none" opacity="0.35" stroke-linecap="round"/>`; break;
    case 2: peloDelante = `<path d="M59 92 C54 48 76 32 102 32 C131 33 147 52 141 92 C137 70 128 60 117 55 C104 58 84 64 68 72 C64 78 61 85 59 92 Z" fill="${fPelo}"/><path d="M70 60 Q96 44 124 50" stroke="${brillo}" stroke-width="3" fill="none" opacity="0.35" stroke-linecap="round"/>`; break;
    case 3:
      peloDetras = `<path d="M57 84 C55 46 76 33 100 33 C124 33 145 46 143 84 L148 212 Q128 222 114 212 L113 150 L87 150 L86 212 Q72 222 52 212 Z" fill="${fPelo}"/>`;
      peloDelante = `<path d="${raya}" fill="${fPelo}"/><path d="M98 40 Q80 52 70 92 M102 40 Q120 52 130 92" stroke="${brillo}" stroke-width="2" fill="none" opacity="0.3"/>`; break;
    case 4: {
      const borde = arco(100, 118, 54, 92, 180, 360 + 0, 22).concat(arco(100, 118, 54, 92, 0, 40, 4), arco(100, 118, 54, 92, 140, 180, 4));
      peloDetras = `<ellipse cx="100" cy="116" rx="52" ry="88" fill="${oscuro(pelo, 0.08)}"/>${rizos(borde, 15, fPelo)}`;
      peloDelante = rizos(arco(100, 82, 41, 44, 190, 350, 9), 11, fPelo) + `<circle cx="64" cy="98" r="9" fill="${fPelo}"/><circle cx="136" cy="98" r="9" fill="${fPelo}"/>`;
      break;
    }
    case 5:
      peloDetras = `<path d="M56 86 C54 46 76 33 100 33 C124 33 146 46 144 86 L146 140 Q132 150 118 140 L118 112 L82 112 L82 140 Q68 150 54 140 Z" fill="${fPelo}"/>`;
      peloDelante = `<path d="${raya}" fill="${fPelo}"/>`; break;
    case 6:
      peloDetras = `<path d="M126 58 C152 66 160 122 148 178 C142 156 138 124 124 96 Z" fill="${fPelo}"/>`;
      peloDelante = `<path d="M61 84 C58 50 76 35 100 35 C124 35 142 50 139 84 C134 63 120 54 100 54 C80 54 66 63 61 84Z" fill="${fPelo}"/><rect x="128" y="62" width="9" height="7" rx="3" fill="${oscuro(ropa, 0.1)}" transform="rotate(20 132 65)"/>`; break;
    case 7:
      peloDetras = `<circle cx="100" cy="27" r="17" fill="${fPelo}"/><path d="M90 22 Q100 14 110 24" stroke="${brillo}" stroke-width="2" fill="none" opacity="0.4"/>`;
      peloDelante = `<path d="M61 84 C58 50 76 36 100 36 C124 36 142 50 139 84 C134 63 120 54 100 54 C80 54 66 63 61 84Z" fill="${fPelo}"/>`; break;
    case 8:
      peloDetras = `<circle cx="100" cy="74" r="56" fill="${oscuro(pelo, 0.06)}"/>${rizos(arco(100, 74, 54, 54, 0, 360, 26), 10, fPelo)}`;
      peloDelante = rizos(arco(100, 80, 38, 38, 200, 340, 8), 9, fPelo); break;
    case 9: {
      const trenza = (x) => Array.from({ length: 9 }, (_, i) => `<ellipse cx="${x + (i % 2 ? 2 : -2)}" cy="${118 + i * 11}" rx="7.5" ry="7" fill="${fPelo}"/>`).join('');
      peloDetras = trenza(62) + trenza(138);
      peloDelante = `<path d="${raya}" fill="${fPelo}"/>`; break;
    }
    case 11: peloDelante = rizos(arco(100, 82, 40, 44, 180, 360, 14), 9, fPelo); break;
    default: break; // 10: calvo
  }

  /* ───────── Cabeza y cara ───────── */
  const orejas = ambos(`<ellipse cx="61" cy="90" rx="7" ry="11.5" fill="${piel}"/><path d="M59 85 Q56 90 59 96" stroke="${sPiel}" stroke-width="1.6" fill="none"/>`);
  const cara = `<path d="M100 42 C127 42 139 62 139 86 C139 107 131 120 119 127 C111 132 105 134 100 134 C95 134 89 132 81 127 C69 120 61 107 61 86 C61 62 73 42 100 42 Z" fill="${fCara}"/>`;
  const cejaColor = a.pelo === 10 || a.pelo === 0 ? oscuro(pelo, 0.2) : oscuro(pelo, 0.08);
  const cejas = ambos(`<path d="M73 78 Q82 71 93 75" stroke="${cejaColor}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`);
  const ojo = () => {
    switch (a.ojos) {
      case 3: return `<path d="M76 89 Q84 82 92 89" stroke="#2b1d16" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
      default: {
        const g = a.ojos === 1; const r = a.ojos === 2;
        const alto = g ? 7.5 : r ? 4.5 : 6;
        const iris = g ? 5.6 : r ? 4.2 : 4.8;
        let s = `<path d="M74 88 Q84 ${88 - alto} 94 88 Q84 ${88 + alto * 0.85} 74 88 Z" fill="#ffffff"/>`;
        s += `<circle cx="84" cy="88" r="${iris}" fill="${ojos}"/><circle cx="84" cy="88" r="${iris * 0.48}" fill="#111111"/><circle cx="85.8" cy="86.2" r="${iris * 0.28}" fill="#ffffff"/>`;
        s += `<path d="M73.5 88 Q84 ${87 - alto} 94.5 88" stroke="#2b1d16" stroke-width="${a.ojos === 4 ? 2.6 : 2}" fill="none" stroke-linecap="round"/>`;
        if (a.ojos === 4) s += `<path d="M74 88 L70 85 M76 84.5 L73 81" stroke="#2b1d16" stroke-width="1.6" stroke-linecap="round"/>`;
        return s;
      }
    }
  };
  // El ojo derecho es el izquierdo en espejo (así el brillo cae en el mismo lado en los dos: se recoloca)
  const ojosSvg = ojo() + `<g transform="translate(32 0)">${ojo()}</g>`;
  const nariz = `<path d="M100 92 Q96.5 103 95 106 Q99 110 105 106" stroke="${sPiel}" stroke-width="1.7" fill="none" stroke-linecap="round"/><path d="M101 94 Q102 100 101 103" stroke="${claro(piel, 0.25)}" stroke-width="1.4" fill="none" opacity="0.7"/>`;
  const labio = mezclar(oscuro(piel, 0.18), '#c2415a', 0.35);
  let boca;
  switch (a.boca) {
    case 1: boca = `<path d="M87 115 Q100 113 113 115 Q107 128 100 128 Q93 128 87 115 Z" fill="#6b1f2a"/><path d="M88.5 115.5 Q100 114 111.5 115.5 L110 119 Q100 120 90 119 Z" fill="#ffffff"/><path d="M93 125 Q100 128 107 125 Q100 123 93 125Z" fill="#e2788a"/>`; break;
    case 2: boca = `<path d="M90 117 Q95 115 100 116 Q105 115 110 117 Q100 120 90 117Z" fill="${labio}"/><path d="M90 117 Q100 122 110 117" stroke="${oscuro(labio, 0.2)}" stroke-width="1" fill="none"/>`; break;
    case 3: boca = `<path d="M89 117 Q99 119 111 113" stroke="${oscuro(labio, 0.25)}" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M92 118.5 Q101 122 109 116" stroke="${labio}" stroke-width="2" fill="none" stroke-linecap="round"/>`; break;
    case 4: boca = `<ellipse cx="100" cy="119" rx="5" ry="6.5" fill="#6b1f2a"/><ellipse cx="100" cy="119" rx="5" ry="6.5" fill="none" stroke="${labio}" stroke-width="2"/>`; break;
    default: boca = `<path d="M88 116 Q100 119 112 116 Q106 124 100 124 Q94 124 88 116 Z" fill="${labio}"/><path d="M88 116 Q100 120 112 116" stroke="${oscuro(labio, 0.3)}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
  }
  const mejillas = `<ellipse cx="76" cy="104" rx="7" ry="4.5" fill="#f26b7a" opacity="0.14"/><ellipse cx="124" cy="104" rx="7" ry="4.5" fill="#f26b7a" opacity="0.14"/>`;
  const cBarba = oscuro(pelo, 0.05);
  let barba = '';
  switch (a.barba) {
    case 1: barba = `<path d="M63 98 C64 118 80 132 100 134 C120 132 136 118 137 98 C132 112 120 120 112 116 Q100 112 88 116 C80 120 68 112 63 98 Z" fill="${cBarba}" opacity="0.22"/>`; break;
    case 2: barba = `<path d="M90 113 Q100 109 110 113 Q105 116 100 115 Q95 116 90 113Z" fill="${cBarba}"/><path d="M93 125 Q100 138 107 125 Q100 128 93 125Z" fill="${cBarba}"/>`; break;
    case 3: barba = `<path d="M87 113 Q100 106 113 113 Q107 117 100 115 Q93 117 87 113Z" fill="${cBarba}"/>`; break;
    case 4: barba = `<path d="M63 96 C64 120 80 134 100 136 C120 134 136 120 137 96 C133 110 124 116 114 114 Q100 106 86 114 C76 116 67 110 63 96 Z" fill="${cBarba}"/>`; break;
    case 5: barba = `<path d="M62 94 C62 130 80 150 100 152 C120 150 138 130 138 94 C134 108 124 115 114 113 Q100 104 86 113 C76 115 66 108 62 94 Z" fill="${cBarba}"/><path d="M88 128 Q100 146 112 128" stroke="${brillo}" stroke-width="1.5" fill="none" opacity="0.25"/>`; break;
    default: break;
  }
  let gafas = '';
  const montura = (extra) => ambos(extra) + `<path d="M95 87 Q100 84 105 87" stroke="#1f2937" stroke-width="2" fill="none"/>`;
  switch (a.gafas) {
    case 1: gafas = montura(`<circle cx="84" cy="88" r="10" fill="#ffffff" fill-opacity="0.12" stroke="#1f2937" stroke-width="2"/>`); break;
    case 2: gafas = montura(`<rect x="72" y="80" width="23" height="16" rx="3" fill="#ffffff" fill-opacity="0.12" stroke="#1f2937" stroke-width="2"/>`); break;
    case 3: gafas = montura(`<path d="M71 81 L96 81 L95 91 Q93 98 84 98 Q74 98 72 91 Z" fill="#111827" stroke="#111827" stroke-width="1.5"/><path d="M75 84 L82 84" stroke="#ffffff" stroke-width="1.5" opacity="0.5"/>`); break;
    case 4: gafas = montura(`<rect x="71.5" y="79.5" width="24" height="17" rx="5" fill="#ffffff" fill-opacity="0.12" stroke="${oscuro(ropa, 0.1)}" stroke-width="3.6"/>`); break;
    default: break;
  }

  /* ───────── Cuerpo ───────── */
  const cuello = `<path d="M88 118 L88 152 Q100 158 112 152 L112 118 Z" fill="${fPiel}"/><path d="M88 128 Q100 144 112 128 L112 138 Q100 148 88 138 Z" fill="${sPiel}" opacity="0.45"/>`;
  const brazo = `<path d="M70 157 Q60 160 58 178 L54 246 Q54 257 60 257 Q66 257 66 246 L70 186 Z" fill="${fPiel}"/><ellipse cx="60" cy="262" rx="6.5" ry="9" fill="${piel}"/><path d="M56 262 Q60 270 64 262" stroke="${sPiel}" stroke-width="1.2" fill="none"/>`;
  const torso = `M72 154 Q100 146 128 154 Q134 158 134 172 L131 264 L69 264 L66 172 Q66 158 72 154 Z`;
  // Las mangas van con cada brazo (piezas articuladas para poder animarlo): aquí solo la izquierda; la derecha es su espejo
  const mangaCorta = (c) => `<path d="M72 154 Q59 158 56 180 L55 194 L69 196 L70 172 Z" fill="${c}"/><path d="M55.5 192 L69 194" stroke="${oscuro(ropa, 0.25)}" stroke-width="1.2"/>`;
  const mangaLarga = (c, puno = oscuro(ropa, 0.12)) => `<path d="M72 154 Q59 158 56 180 L52 247 L67 249 L70 186 Z" fill="${c}"/><path d="M52.5 241 L67.5 243 L67 250 L52 248 Z" fill="${puno}"/><path d="M63 190 Q61 210 63 232" stroke="${oscuro(ropa, 0.2)}" stroke-width="1" fill="none" opacity="0.6"/>`;
  let arriba = '';
  let manga = '';
  switch (a.arriba) {
    case 1: // camisa
      manga = mangaLarga(fRopa); arriba = `<path d="${torso}" fill="${fRopa}"/><path d="M100 150 L100 264" stroke="${linea(ropa)}" stroke-width="1.2"/>${[172, 192, 212, 232, 252].map((y) => `<circle cx="103" cy="${y}" r="1.6" fill="${linea(ropa)}"/>`).join('')}<path d="M88 150 L100 166 L94 172 L84 156 Z M112 150 L100 166 L106 172 L116 156 Z" fill="${claro(ropa, 0.08)}" stroke="${linea(ropa)}" stroke-width="1"/>`; break;
    case 2: // sudadera
      manga = mangaLarga(fRopa); arriba = `<path d="M80 152 Q100 172 120 152 Q118 140 100 140 Q82 140 80 152 Z" fill="${oscuro(ropa, 0.18)}"/><path d="${torso}" fill="${fRopa}"/><path d="M84 152 Q100 166 116 152" stroke="${oscuro(ropa, 0.25)}" stroke-width="3" fill="none"/><path d="M94 160 L93 184 M106 160 L107 184" stroke="${claro(ropa, 0.6)}" stroke-width="1.6" stroke-linecap="round"/><path d="M78 222 L122 222 L126 250 L74 250 Z" fill="${oscuro(ropa, 0.08)}" stroke="${linea(ropa)}" stroke-width="1"/><rect x="69" y="256" width="62" height="8" fill="${oscuro(ropa, 0.14)}"/>`; break;
    case 3: { // chaqueta vaquera sobre camiseta blanca
      const vaq = ropa === COLORES_ROPA[0] ? '#7fa3cc' : ropa;
      const fVaq = vol('vaq', vaq, 0.18);
      arriba = `<path d="${torso}" fill="#f8fafc"/><path d="M88 151 Q100 166 112 151 Z" fill="${fPiel}"/>`
        + ambos(`<path d="M72 154 Q84 149 90 151 L95 264 L69 264 L66 172 Q66 158 72 154Z" fill="${fVaq}"/><path d="M90 151 L84 176 L95 190" stroke="${oscuro(vaq, 0.3)}" stroke-width="1.4" fill="${claro(vaq, 0.08)}"/><rect x="73" y="182" width="14" height="12" rx="2" fill="none" stroke="${claro(vaq, 0.45)}" stroke-width="1.2" stroke-dasharray="2 1.5"/><path d="M93 200 L94 262" stroke="${claro(vaq, 0.45)}" stroke-width="1.2" stroke-dasharray="2 1.5"/>`)
        ; manga = mangaLarga(fVaq, oscuro(vaq, 0.15)); break;
    }
    case 4: // jersey de cuello alto
      manga = mangaLarga(fRopa); arriba = `<path d="${torso}" fill="${fRopa}"/><rect x="86" y="134" width="28" height="22" rx="6" fill="${fRopa}"/>${[140, 145, 150].map((y) => `<path d="M88 ${y} L112 ${y}" stroke="${oscuro(ropa, 0.16)}" stroke-width="1"/>`).join('')}<rect x="69" y="254" width="62" height="10" fill="${oscuro(ropa, 0.1)}"/>`; break;
    case 5: // top de tirantes
      arriba = `<path d="M70 172 Q100 182 130 172 L131 264 L69 264 L68 180 Z" fill="${fRopa}"/><path d="M80 154 L78 176 M120 154 L122 176" stroke="${ropa}" stroke-width="3.5" stroke-linecap="round"/>`; break;
    case 6: { // traje
      manga = mangaLarga(fRopa, '#f8fafc'); arriba = `<path d="${torso}" fill="${fRopa}"/><path d="M88 151 L100 192 L112 151 Z" fill="#f8fafc"/><path d="M98 156 L102 156 L104 186 L100 192 L96 186 Z" fill="#b91c1c"/>`
        + ambos(`<path d="M88 151 L100 192 L86 176 L82 158 Z" fill="${oscuro(ropa, 0.1)}" stroke="${linea(ropa)}" stroke-width="1"/>`) + `<circle cx="100" cy="214" r="1.8" fill="${linea(ropa)}"/><circle cx="100" cy="234" r="1.8" fill="${linea(ropa)}"/>`; break;
    }
    default: // camiseta
      manga = mangaCorta(fRopa); arriba = `<path d="${torso}" fill="${fRopa}"/><path d="M88 151 Q100 166 112 151 Z" fill="${fPiel}"/><path d="M87 151 Q100 168 113 151" stroke="${oscuro(ropa, 0.2)}" stroke-width="2" fill="none"/>`;
  }
  const arrugas = `<path d="M80 236 Q86 240 84 252 M120 230 Q114 238 117 252" stroke="${oscuro(ropa, 0.22)}" stroke-width="1" fill="none" opacity="0.5"/>`;

  /* ───────── Piernas, parte de abajo y calzado ───────── */
  // Cada pierna (con su pernera y su zapato) es una pieza aparte; la cintura (o la falda) va encima
  const pielI = `<path d="M74 298 L97 298 L95 388 L79 388 Z" fill="${fPiel}"/>`;
  const pielD = `<path d="M103 298 L126 298 L121 388 L105 388 Z" fill="${fPiel}"/>`;
  const perneraI = `<path d="M68 262 L100 262 L98 390 L75 390 Q69 326 68 262 Z" fill="${fPant}"/>`;
  const perneraD = `<path d="M100 262 L132 262 Q131 326 125 390 L102 390 Z" fill="${fPant}"/>`;
  const cinturilla = `<rect x="68" y="260" width="64" height="8" fill="${oscuro(pant, 0.12)}"/>`;
  let piernaI; let piernaD; let cadera;
  switch (a.abajo) {
    case 1: piernaI = perneraI + `<path d="M86 278 L87 388" stroke="${oscuro(pant, 0.2)}" stroke-width="1" opacity="0.7"/>`; piernaD = perneraD + `<path d="M114 278 L113 388" stroke="${oscuro(pant, 0.2)}" stroke-width="1" opacity="0.7"/>`; cadera = cinturilla; break;
    case 2: piernaI = pielI + `<path d="M68 262 L100 262 L98 316 L72 316 Q69 290 68 262 Z" fill="${fPant}"/>`; piernaD = pielD + `<path d="M100 262 L132 262 Q131 290 128 316 L102 316 Z" fill="${fPant}"/>`; cadera = cinturilla; break;
    case 3: piernaI = pielI; piernaD = pielD; cadera = `<path d="M68 258 L132 258 L142 326 Q100 334 58 326 Z" fill="${fPant}"/><path d="M80 270 L74 324 M100 270 L100 330 M120 270 L126 324" stroke="${oscuro(pant, 0.18)}" stroke-width="1" opacity="0.6"/>`; break;
    case 4: piernaI = perneraI + `<path d="M71 268 L77 388" stroke="#ffffff" stroke-width="3" opacity="0.9"/>`; piernaD = perneraD + `<path d="M129 268 L123 388" stroke="#ffffff" stroke-width="3" opacity="0.9"/>`; cadera = cinturilla; break;
    default:
      piernaI = perneraI + `<path d="M85 300 L86 386" stroke="${claro(pant, 0.3)}" stroke-width="1" opacity="0.6"/>`;
      piernaD = perneraD + `<path d="M115 300 L114 386" stroke="${claro(pant, 0.3)}" stroke-width="1" opacity="0.6"/>`;
      cadera = `<path d="M100 268 L100 300" stroke="${oscuro(pant, 0.3)}" stroke-width="1.2"/>${cinturilla}<rect x="96" y="261" width="8" height="6" rx="1" fill="none" stroke="#c9a227" stroke-width="1.2"/>`;
  }
  const zapato = (c, suela, alto = 0, detalle = '') => `<path d="M75 ${384 - alto} L97 ${384 - alto} L98 398 Q98 405 92 405 L69 405 Q62 405 64 398 Q66 390 75 384 Z" fill="${c}"/><path d="M63 401 L98 401 L98 405 L66 405 Q62 405 63 401 Z" fill="${suela}"/>${detalle}`;
  let calzado; // el izquierdo; el derecho es su espejo
  switch (a.calzado) {
    case 1: calzado = zapato('#1f2937', '#f8fafc', 0, `<path d="M76 390 L88 389" stroke="#f8fafc" stroke-width="1.5"/>`); break;
    case 2: calzado = zapato('#7c4a24', '#3b2414', 26); break;
    case 3: calzado = zapato('#111827', '#111827', 0, `<path d="M72 392 Q80 388 90 390" stroke="#4b5563" stroke-width="1" fill="none"/>`); break;
    case 4: calzado = zapato(ropa, '#f8fafc', 0, `<path d="M78 389 L92 388" stroke="#f8fafc" stroke-width="1.6"/>`); break;
    default: calzado = zapato('#f8fafc', '#cbd5e1', 0, `<path d="M76 390 L88 389 M72 395 L94 395" stroke="#cbd5e1" stroke-width="1.2"/>`);
  }

  /* ───────── Complementos ───────── */
  let extra = '';
  let tapaPelo = false;
  switch (a.extra) {
    case 1: tapaPelo = true; extra = `<path d="M60 74 C58 42 76 32 100 32 C124 32 142 42 140 74 Z" fill="${fRopa}"/><path d="M118 66 Q150 62 160 74 Q140 78 118 74 Z" fill="${oscuro(ropa, 0.12)}"/><circle cx="100" cy="33" r="3" fill="${oscuro(ropa, 0.2)}"/>`; break;
    case 2: tapaPelo = true; extra = `<path d="M60 78 C58 36 142 36 140 78 Z" fill="${fRopa}"/><rect x="57" y="68" width="86" height="14" rx="7" fill="${oscuro(ropa, 0.12)}"/><circle cx="100" cy="32" r="9" fill="#f8fafc"/>`; break;
    case 3: extra = ambos(`<circle cx="60" cy="102" r="3.2" fill="#f5c542" stroke="#b8860b" stroke-width="0.8"/>`); break;
    case 4: extra = `<path d="M86 152 Q100 172 114 152" stroke="#f5c542" stroke-width="1.8" fill="none"/><circle cx="100" cy="168" r="3.2" fill="#f5c542"/>`; break;
    case 5: extra = `<path d="M57 92 C55 34 145 34 143 92" stroke="#1f2937" stroke-width="5" fill="none"/>` + ambos(`<rect x="52" y="82" width="12" height="20" rx="5" fill="${ropa}" stroke="#1f2937" stroke-width="1.5"/>`); break;
    case 6: tapaPelo = true; extra = `<ellipse cx="100" cy="64" rx="62" ry="12" fill="${oscuro(ropa, 0.1)}"/><path d="M70 62 C70 30 130 30 130 62 Z" fill="${fRopa}"/><rect x="70" y="54" width="60" height="8" fill="${oscuro(ropa, 0.3)}"/>`; break;
    default: break;
  }
  if (tapaPelo && a.pelo !== 10) peloDelante = `<path d="M61 92 C60 78 64 72 70 70 L130 70 C136 72 140 78 139 92 C134 80 124 76 100 76 C76 76 66 80 61 92Z" fill="${fPelo}"/>`;

  const cuerpo = modo === 'cuerpo';
  const sombraSuelo = cuerpo ? `<ellipse cx="100" cy="408" rx="46" ry="6" fill="#000000" opacity="0.15"/>` : '';
  // Piezas articuladas (grupos con clase) para poder animarlas: piernas, cadera, tronco (con brazos y cabeza dentro)
  const cabeza = `<g class="av-cabeza">${orejas}${cara}${mejillas}${barba}${boca}${nariz}<g class="av-ojos">${ojosSvg}</g>${cejas}${gafas}${peloDelante}${extra}</g>`;
  const brazos = `<g class="av-brazo-i">${brazo}${manga}</g><g class="av-brazo-d">${espejo(brazo + manga)}</g>`;
  const contenido = cuerpo
    ? `${sombraSuelo}<g class="av-todo"><g class="av-pierna-i">${piernaI}${calzado}</g><g class="av-pierna-d">${piernaD}${espejo(calzado)}</g>`
      + `<g class="av-tronco"><g class="av-cabeza-atras">${peloDetras}</g><g class="av-cadera">${cadera}</g>${brazos}${cuello}${arriba}${arrugas}${cabeza}</g></g>`
    : `<g class="av-cabeza-atras">${peloDetras}</g>${brazos}${cuello}${arriba}${cabeza}`;
  const vb = cuerpo ? '0 0 200 420' : '42 22 116 116';
  const fondoSvg = fondo ? (cuerpo ? `<rect x="0" y="0" width="200" height="420" fill="${fondo}"/>` : `<circle cx="100" cy="80" r="58" fill="${fondo}"/>`) : '';
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
