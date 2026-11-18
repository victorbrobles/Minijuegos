// client/src/games/comun/fisica2d.js
// Física 2D sencilla de discos (chapas, piedras de curling): roce, choques elásticos entre discos y paredes que pone
// cada juego. Solo usa sumas, productos, divisiones y raíces cuadradas, así que da exactamente el mismo resultado en
// el servidor y en cualquier móvil: el servidor calcula el tiro y cada móvil lo reproduce para animarlo.
//
// cuerpo = { id, x, y, vx, vy, r, m (Infinity = fijo) }

const r3 = (v) => Math.round(v * 1000) / 1000;

/**
 * Simula hasta que todo se para (o hasta `pasosMax` fotogramas de 1/60 s).
 * opciones: roce (deceleración por segundo), rebote (entre discos), sub (subpasos), cadaFrame (guardar cada n),
 *   paredes(cuerpos) → choques con los bordes; evento(cuerpos) → algo que corta la simulación (gol, fuera…)
 *   fuerza(cuerpo, dt) → fuerza extra (efecto del curling)
 */
export function simular(cuerposIniciales, { roce = 20, rebote = 0.9, sub = 4, cadaFrame = 2, pasosMax = 900, paredes, evento, fuerza, roceDe } = {}) {
  const cs = cuerposIniciales.map((c) => ({ ...c }));
  const frames = [cs.map((c) => [r3(c.x), r3(c.y)])];
  const dt = 1 / 60 / sub;
  let fin = null;
  for (let f = 1; f <= pasosMax && !fin; f++) {
    for (let s = 0; s < sub && !fin; s++) {
      // Movimiento y roce
      for (const c of cs) {
        if (c.m === Infinity || c.fuera) continue;
        if (fuerza) fuerza(c, dt);
        const v = Math.sqrt(c.vx * c.vx + c.vy * c.vy);
        if (v > 0) {
          const baja = (roceDe ? roceDe(c) : roce) * dt;
          if (v <= baja) { c.vx = 0; c.vy = 0; } else { const k = (v - baja) / v; c.vx *= k; c.vy *= k; }
        }
        c.x += c.vx * dt; c.y += c.vy * dt;
      }
      // Choques entre discos
      for (let i = 0; i < cs.length; i++) {
        const a = cs[i]; if (a.fuera) continue;
        for (let j = i + 1; j < cs.length; j++) {
          const b = cs[j]; if (b.fuera) continue;
          if (a.m === Infinity && b.m === Infinity) continue;
          const dx = b.x - a.x; const dy = b.y - a.y; const d2 = dx * dx + dy * dy; const rr = a.r + b.r;
          if (d2 >= rr * rr || d2 === 0) continue;
          const d = Math.sqrt(d2); const nx = dx / d; const ny = dy / d;
          const ia = a.m === Infinity ? 0 : 1 / a.m; const ib = b.m === Infinity ? 0 : 1 / b.m;
          // Separarlos
          const solape = rr - d; const tot = ia + ib;
          a.x -= nx * solape * (ia / tot); a.y -= ny * solape * (ia / tot);
          b.x += nx * solape * (ib / tot); b.y += ny * solape * (ib / tot);
          const vrel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (vrel >= 0) continue;
          const jimp = (-(1 + rebote) * vrel) / tot;
          a.vx -= jimp * ia * nx; a.vy -= jimp * ia * ny;
          b.vx += jimp * ib * nx; b.vy += jimp * ib * ny;
          a.toco = true; b.toco = true;
        }
      }
      if (paredes) paredes(cs);
      if (evento) fin = evento(cs) || null;
    }
    if (f % cadaFrame === 0 || fin) frames.push(cs.map((c) => [r3(c.x), r3(c.y)]));
    if (!fin && cs.every((c) => c.m === Infinity || c.fuera || (c.vx === 0 && c.vy === 0))) break;
  }
  frames.push(cs.map((c) => [r3(c.x), r3(c.y)]));
  cs.forEach((c) => { c.vx = 0; c.vy = 0; c.x = r3(c.x); c.y = r3(c.y); });
  return { cuerpos: cs, frames, evento: fin };
}

/** Rebote contra un borde recto: devuelve la componente de velocidad invertida y amortiguada. */
export const rebotar = (v, k = 0.75) => -v * k;
