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
export function crearEscena(nivel) {
  const sala = SALAS[(nivel - 1) % SALAS.length];
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
