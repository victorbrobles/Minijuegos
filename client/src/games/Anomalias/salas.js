// client/src/games/Anomalias/salas.js
// Salas vigiladas por la cámara. Cada objeto: [emoji, x %, y %, tamaño (% del ancho)].
// y < 60 está en la pared; y > 60, en el suelo.
export const SALAS = [
  {
    id: 'salon',
    nombre: 'Salón',
    pared: ['#fde68a', '#fcd34d'],
    suelo: ['#b45309', '#92400e'],
    ventana: { x: 14, y: 12, w: 20, h: 28 },
    objetos: [
      ['🖼️', 52, 22, 12], ['🕰️', 80, 18, 9], ['🛋️', 50, 70, 24], ['🪴', 90, 66, 12], ['📺', 18, 62, 13],
      ['💡', 70, 52, 8], ['📚', 33, 80, 9], ['🧸', 62, 72, 8], ['☕', 42, 88, 7], ['🐈', 78, 86, 10],
      ['🪑', 8, 82, 10], ['🎸', 92, 40, 10], ['📻', 30, 46, 8], ['🧶', 58, 90, 7]
    ],
    extra: ['🦆', '🎈', '🍎', '🧦', '🔑', '🎩', '🕯️', '🪀']
  },
  {
    id: 'cocina',
    nombre: 'Cocina',
    pared: ['#bae6fd', '#7dd3fc'],
    suelo: ['#e2e8f0', '#94a3b8'],
    ventana: { x: 40, y: 10, w: 22, h: 26 },
    objetos: [
      ['🧊', 10, 52, 14], ['🍳', 30, 58, 9], ['🫖', 46, 58, 8], ['🍌', 60, 58, 8], ['🧂', 72, 57, 6],
      ['⏰', 80, 22, 8], ['🔪', 90, 46, 7], ['🍞', 28, 30, 8], ['🧲', 14, 28, 7], ['🍷', 68, 30, 7],
      ['🪣', 24, 86, 10], ['🐕', 60, 84, 12], ['🧹', 88, 76, 12], ['🥕', 44, 90, 7]
    ],
    extra: ['🍕', '🧀', '🥚', '🍩', '🧃', '🧁', '🥦', '🍯']
  },
  {
    id: 'dormitorio',
    nombre: 'Dormitorio',
    pared: ['#e9d5ff', '#c4b5fd'],
    suelo: ['#7c2d12', '#431407'],
    ventana: { x: 70, y: 12, w: 20, h: 28 },
    objetos: [
      ['🛏️', 40, 72, 26], ['🖼️', 34, 24, 10], ['🪞', 12, 40, 11], ['🧸', 52, 64, 8], ['📕', 64, 78, 7],
      ['🕯️', 70, 60, 6], ['👟', 18, 88, 9], ['🎒', 86, 82, 11], ['🌙', 54, 18, 7], ['🪀', 30, 90, 6],
      ['🧦', 76, 92, 6], ['🎮', 50, 90, 8], ['⏰', 72, 52, 6], ['🪴', 92, 62, 10]
    ],
    extra: ['👻', '🕷️', '🎁', '🔦', '🍪', '🧤', '🎲', '🪁']
  },
  {
    id: 'bano',
    nombre: 'Baño',
    pared: ['#ccfbf1', '#99f6e4'],
    suelo: ['#e5e7eb', '#9ca3af'],
    ventana: { x: 62, y: 10, w: 16, h: 20 },
    objetos: [
      ['🛁', 30, 72, 26], ['🚽', 76, 74, 14], ['🪞', 44, 24, 12], ['🧴', 56, 50, 6], ['🪥', 34, 50, 6], ['🧻', 90, 58, 8], ['🧼', 46, 54, 6], ['🦆', 26, 64, 7], ['🧽', 14, 56, 7], ['🪒', 64, 52, 6], ['🌿', 8, 36, 10], ['🩴', 56, 90, 8], ['🧺', 92, 86, 10], ['🕯️', 22, 28, 6]
    ],
    extra: ['🐙', '🍌', '🎈', '🧸', '📱', '🥾', '🐸', '🎩']
  },
  {
    id: 'oficina',
    nombre: 'Oficina',
    pared: ['#e0e7ff', '#c7d2fe'],
    suelo: ['#475569', '#334155'],
    ventana: { x: 8, y: 10, w: 22, h: 28 },
    objetos: [
      ['🖥️', 48, 56, 13], ['⌨️', 48, 66, 10], ['🖱️', 60, 66, 6], ['☕', 36, 64, 7], ['📎', 30, 70, 5], ['🗂️', 82, 60, 11], ['🪴', 92, 78, 11], ['🕰️', 70, 20, 8], ['📊', 46, 24, 12], ['🖨️', 16, 70, 12], ['🪑', 48, 86, 12], ['📅', 86, 30, 8], ['🗑️', 72, 90, 8], ['📞', 64, 56, 7]
    ],
    extra: ['🦖', '🍕', '🎸', '🧦', '🐠', '🎯', '🍩', '🔑']
  },
  {
    id: 'jardin',
    nombre: 'Jardín',
    pared: ['#bfdbfe', '#93c5fd'],
    suelo: ['#4d7c0f', '#365314'],
    ventana: { x: 72, y: 8, w: 18, h: 16 },
    objetos: [
      ['🌳', 14, 42, 22], ['🏡', 52, 40, 22], ['🌻', 84, 66, 9], ['🪣', 32, 80, 9], ['🌷', 72, 84, 8], ['🐕', 58, 78, 11], ['🦋', 40, 22, 6], ['🪨', 10, 86, 9], ['⛲', 88, 44, 12], ['🍄', 46, 92, 6], ['🐦', 26, 18, 6], ['🪴', 64, 64, 8], ['🐌', 20, 92, 6], ['🪑', 94, 84, 9]
    ],
    extra: ['🐧', '☃️', '🎅', '🦒', '🚀', '🛸', '🐊', '🎃']
  },
  {
    id: 'aula',
    nombre: 'Aula',
    pared: ['#fef9c3', '#fde68a'],
    suelo: ['#a16207', '#713f12'],
    ventana: { x: 80, y: 10, w: 14, h: 30 },
    objetos: [
      ['📝', 40, 28, 18], ['🌍', 10, 56, 10], ['🕰️', 64, 16, 8], ['📚', 22, 70, 9], ['✏️', 46, 72, 6], ['🎒', 70, 84, 11], ['📐', 56, 72, 7], ['🍎', 34, 64, 7], ['🔬', 84, 62, 9], ['🖍️', 60, 88, 6], ['🪑', 30, 88, 11], ['📏', 16, 40, 8], ['🧮', 92, 82, 9], ['🗺️', 66, 40, 11]
    ],
    extra: ['🐍', '🎮', '🍔', '👑', '🎺', '🦉', '🧲', '🎲']
  },
  {
    id: 'garaje',
    nombre: 'Garaje',
    pared: ['#d6d3d1', '#a8a29e'],
    suelo: ['#57534e', '#292524'],
    ventana: { x: 6, y: 12, w: 14, h: 18 },
    objetos: [
      ['🚗', 44, 72, 28], ['🚲', 86, 70, 14], ['🧰', 14, 84, 10], ['🔧', 30, 30, 7], ['🔨', 40, 30, 7], ['🪜', 92, 40, 10], ['🛞', 70, 88, 10], ['🪚', 52, 28, 9], ['💡', 66, 16, 7], ['⛽', 10, 62, 10], ['🧯', 24, 62, 7], ['📦', 76, 52, 9], ['🪣', 60, 92, 7], ['🧹', 96, 82, 9]
    ],
    extra: ['🐄', '🎂', '🧸', '🌵', '🎻', '🐢', '🍉', '👑']
  },
  {
    id: 'playa',
    nombre: 'Playa',
    pared: ['#7dd3fc', '#38bdf8'],
    suelo: ['#fde68a', '#facc15'],
    ventana: { x: 4, y: 6, w: 10, h: 10 },
    objetos: [
      ['☀️', 82, 14, 12], ['⛱️', 30, 62, 18], ['🏖️', 58, 80, 14], ['⛵', 60, 40, 10], ['🐚', 18, 88, 6], ['🦀', 44, 92, 7], ['🏐', 74, 72, 8], ['🧴', 36, 80, 6], ['🩴', 84, 90, 7], ['🍉', 22, 76, 8], ['🐦', 40, 20, 6], ['🏄', 88, 48, 9], ['🌴', 8, 50, 14], ['🪣', 64, 90, 7]
    ],
    extra: ['⛄', '🧣', '🎄', '🐻‍❄️', '🧤', '📺', '🛷', '🎿']
  },
  {
    id: 'tienda',
    nombre: 'Tienda',
    pared: ['#fbcfe8', '#f9a8d4'],
    suelo: ['#9f1239', '#881337'],
    ventana: { x: 40, y: 8, w: 20, h: 16 },
    objetos: [
      ['👗', 12, 44, 12], ['👕', 26, 44, 10], ['👒', 80, 30, 9], ['👠', 72, 62, 8], ['👜', 86, 62, 9], ['🕶️', 62, 30, 8], ['🧥', 92, 44, 10], ['🪞', 46, 46, 11], ['💰', 30, 72, 8], ['🛍️', 50, 84, 10], ['🧣', 16, 80, 8], ['⌚', 60, 72, 6], ['🪴', 94, 86, 10], ['👟', 76, 88, 9]
    ],
    extra: ['🐟', '🍗', '🔧', '🚀', '🐸', '🪓', '🧯', '🥁']
  }
];

// Emojis que se notan al darles la vuelta en espejo
const ASIMETRICOS = ['🐈', '🐕', '🎸', '🪑', '🔪', '🧹', '👟', '🥕', '🍌', '☕', '🍳', '🛏️', '📺', '🌙', '🎒', '🪣', '🫖', '🍷', '🧲'];

const azar = (n) => Math.floor(Math.random() * n);
const elegir = (l) => l[azar(l.length)];

/** Tipos de anomalía por nivel (del más evidente al más sutil). */
function tiposPara(nivel) {
  if (nivel <= 2) return ['desaparece', 'aparece', 'cambia'];
  if (nivel <= 5) return ['desaparece', 'aparece', 'cambia', 'mueve', 'color'];
  if (nivel <= 8) return ['cambia', 'mueve', 'color', 'gira', 'tamano'];
  return ['mueve', 'color', 'gira', 'tamano', 'voltea'];
}

/** Escena base: objetos visibles para el nivel. */
// Cada partida empieza en una sala distinta (y luego las recorre todas en orden)
let desfase = 0;
export function crearEscena(nivel) {
  if (nivel === 1) desfase = azar(SALAS.length);
  const sala = SALAS[(nivel - 1 + desfase) % SALAS.length];
  const cuantos = Math.min(6 + nivel, sala.objetos.length);
  const objetos = [...sala.objetos]
    .map((o, i) => ({ id: i, emoji: o[0], x: o[1], y: o[2], t: o[3], giro: 0, escala: 1, tono: 0, volteo: false }))
    .sort(() => Math.random() - 0.5)
    .slice(0, cuantos);
  return { sala, objetos };
}

/** Devuelve { objetos (escena cambiada), objetivo (id tocable), tipo, texto } */
export function aplicarAnomalia(escena, nivel) {
  const { sala } = escena;
  const objetos = escena.objetos.map((o) => ({ ...o }));
  let tipo = elegir(tiposPara(nivel));
  const sutil = Math.min(1, (nivel - 1) / 10); // 0 → evidente, 1 → muy sutil
  let candidatos = objetos;
  if (tipo === 'voltea') {
    candidatos = objetos.filter((x) => ASIMETRICOS.includes(x.emoji));
    if (!candidatos.length) { tipo = 'gira'; candidatos = objetos; }
  }
  const o = elegir(candidatos);
  let texto = '';
  switch (tipo) {
    case 'desaparece':
      o.oculto = true;
      texto = `Ha desaparecido: ${o.emoji}`;
      break;
    case 'aparece': {
      const libres = sala.extra.filter((e) => !objetos.some((x) => x.emoji === e));
      const nuevo = { id: 100, emoji: elegir(libres), x: 15 + azar(70), y: 30 + azar(60), t: 7, giro: 0, escala: 1, tono: 0, volteo: false };
      objetos.push(nuevo);
      return { objetos, objetivo: 100, tipo, texto: `Ha aparecido: ${nuevo.emoji}` };
    }
    case 'cambia': {
      const otro = elegir(sala.extra.filter((e) => !objetos.some((x) => x.emoji === e)));
      texto = `${o.emoji} se ha convertido en ${otro}`;
      o.emoji = otro;
      break;
    }
    case 'mueve': {
      const d = 14 - sutil * 8; // de 14 % a 6 %
      const ang = Math.random() * Math.PI * 2;
      o.x = Math.max(6, Math.min(94, o.x + Math.cos(ang) * d));
      o.y = Math.max(8, Math.min(94, o.y + Math.sin(ang) * d * 0.75));
      texto = `${o.emoji} se ha movido de sitio`;
      break;
    }
    case 'color':
      o.tono = (Math.random() < 0.5 ? 1 : -1) * (170 - sutil * 90);
      texto = `${o.emoji} ha cambiado de color`;
      break;
    case 'gira':
      o.giro = (Math.random() < 0.5 ? 1 : -1) * (40 - sutil * 20);
      texto = `${o.emoji} se ha inclinado`;
      break;
    case 'tamano':
      o.escala = Math.random() < 0.5 ? 1.45 - sutil * 0.2 : 0.62 + sutil * 0.12;
      texto = `${o.emoji} ha cambiado de tamaño`;
      break;
    case 'voltea':
      o.volteo = true;
      texto = `${o.emoji} se ha dado la vuelta`;
      break;
    default:
  }
  return { objetos, objetivo: o.id, tipo, texto };
}

export const tiempos = (nivel) => ({
  observar: Math.max(2.5, 5 - nivel * 0.2),
  buscar: Math.max(4, 9 - nivel * 0.35)
});
