// client/src/games/Torre/piezas.js
// Piezas de «Torre Inestable». Medidas completas (no mitades) en unidades del juego; la plataforma mide 3,5 × 3,5.
// partes: { forma: 'caja', t: [x, y, z], o: [x, y, z] } · { forma: 'cilindro', r, h, o } · { forma: 'cuna', t, o }
export const PIEZAS = {
  cubo: { nombre: 'Cubo', nivel: 0, partes: [{ forma: 'caja', t: [1, 1, 1], o: [0, 0, 0] }] },
  bloque: { nombre: 'Bloque', nivel: 0, partes: [{ forma: 'caja', t: [2, 0.8, 1], o: [0, 0, 0] }] },
  losa: { nombre: 'Losa', nivel: 0, partes: [{ forma: 'caja', t: [2, 0.3, 1.6], o: [0, 0, 0] }] },
  viga: { nombre: 'Viga', nivel: 0, partes: [{ forma: 'caja', t: [3, 0.5, 0.6], o: [0, 0, 0] }] },
  pilar: { nombre: 'Pilar', nivel: 1, partes: [{ forma: 'caja', t: [0.5, 1.8, 0.5], o: [0, 0, 0] }] },
  cilindro: { nombre: 'Cilindro', nivel: 1, partes: [{ forma: 'cilindro', r: 0.5, h: 1, o: [0, 0, 0] }] },
  cuna: { nombre: 'Cuña', nivel: 1, partes: [{ forma: 'cuna', t: [1.6, 0.9, 1], o: [0, 0, 0] }] },
  ele: { nombre: 'Ele', nivel: 1, partes: [{ forma: 'caja', t: [1.8, 0.6, 0.6], o: [0, -0.3, 0] }, { forma: 'caja', t: [0.6, 0.6, 0.6], o: [-0.6, 0.3, 0] }] },
  cruz: { nombre: 'Cruz', nivel: 2, partes: [{ forma: 'caja', t: [1.8, 0.5, 0.6], o: [0, 0, 0] }, { forma: 'caja', t: [0.6, 0.5, 1.8], o: [0, 0, 0] }] },
  te: { nombre: 'Te', nivel: 2, partes: [{ forma: 'caja', t: [1.8, 0.5, 0.6], o: [0, 0.35, 0] }, { forma: 'caja', t: [0.6, 1, 0.6], o: [0, -0.4, 0] }] },
  rueda: { nombre: 'Rueda', nivel: 2, partes: [{ forma: 'cilindro', r: 0.7, h: 0.35, o: [0, 0, 0] }] },
  dado: { nombre: 'Dado', nivel: 2, partes: [{ forma: 'caja', t: [0.6, 0.6, 0.6], o: [0, 0, 0] }] },
  tablon: { nombre: 'Tablón', nivel: 2, partes: [{ forma: 'caja', t: [3.4, 0.25, 0.7], o: [0, 0, 0] }] }
};
export const PLATAFORMA = 3.5;

/** Volumen aproximado (para la masa). */
export function volumen(def, k = 1) {
  return def.partes.reduce((s, p) => s + (p.forma === 'cilindro' ? Math.PI * p.r * p.r * p.h : p.forma === 'cuna' ? (p.t[0] * p.t[1] * p.t[2]) / 2 : p.t[0] * p.t[1] * p.t[2]), 0) * k ** 3;
}

/** Vértices de la cuña (prisma triangular rectángulo) con el centro de masas en el origen. */
export function verticesCuna([sx, sy, sz]) {
  const a = sx / 2; const b = sy / 2; const c = sz / 2; const dx = a / 3; const dy = b / 3;
  return [[-a, -b, -c], [a, -b, -c], [-a, b, -c], [-a, -b, c], [a, -b, c], [-a, b, c]].map(([x, y, z]) => [x + dx, y + dy, z]);
}
export const CARAS_CUNA = [[0, 1, 4, 3], [0, 2, 1], [3, 4, 5], [0, 3, 5, 2], [1, 2, 5, 4]];

/** Puntos extremos de una pieza (sin girar) para calcular su caja al girarla. */
export function puntosPieza(def, k = 1) {
  const out = [];
  def.partes.forEach((p) => {
    const [ox, oy, oz] = p.o;
    if (p.forma === 'cuna') { verticesCuna(p.t).forEach(([x, y, z]) => out.push([(x + ox) * k, (y + oy) * k, (z + oz) * k])); return; }
    const [hx, hy, hz] = p.forma === 'cilindro' ? [p.r, p.h / 2, p.r] : p.t.map((v) => v / 2);
    if (p.forma === 'cilindro') {
      for (let i = 0; i < 12; i++) { const ang = (i / 12) * Math.PI * 2; for (const sy of [-1, 1]) out.push([(Math.cos(ang) * hx + ox) * k, (sy * hy + oy) * k, (Math.sin(ang) * hz + oz) * k]); }
      return;
    }
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) out.push([(sx * hx + ox) * k, (sy * hy + oy) * k, (sz * hz + oz) * k]);
  });
  return out;
}
