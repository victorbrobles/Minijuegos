// client/src/games/Canicas/fisica.js
// Física de «Carrera de Canicas» (cannon-es inyectada): la pista (suelo y barandillas como malla de triángulos),
// las canicas y su control. La usan la escena 3D y el bot (rivales de práctica y pruebas).
import { progresoDe } from './circuitos.js';
import { CANICAS } from './canicas.js';

export const RADIO = 0.5;
const ALTO_BARANDILLA = 1.6;
const FUERZA = 13;
const VMAX = 19;

function cintas(c) {
  // Devuelve [{ vertices, indices }] del principal y los ramales (suelo + barandillas)
  const out = [];
  const tramo = (muestras, conBarandillas, huecos = []) => {
    const v = []; const idx = [];
    const add = (p) => { v.push(p.x, p.y, p.z); return v.length / 3 - 1; };
    const L = []; const R = [];
    muestras.forEach((m) => { L.push(add(m.p.clone().addScaledVector(m.n, -m.ancho / 2))); R.push(add(m.p.clone().addScaledVector(m.n, m.ancho / 2))); });
    for (let i = 0; i < muestras.length - 1; i++) idx.push(L[i], R[i], L[i + 1], R[i], R[i + 1], L[i + 1]);
    if (conBarandillas) {
      [-1, 1].forEach((lado) => {
        const base = lado < 0 ? L : R;
        const arriba = muestras.map((m, i) => add(m.p.clone().addScaledVector(m.n, (lado * m.ancho) / 2).addScaledVector(m.u, ALTO_BARANDILLA)));
        for (let i = 0; i < muestras.length - 1; i++) {
          if (huecos.some((h) => h.lado === lado && i >= h.desde && i <= h.hasta)) continue;
          idx.push(base[i], base[i + 1], arriba[i], base[i + 1], arriba[i + 1], arriba[i]);
        }
      });
    }
    out.push({ vertices: v, indices: idx });
  };
  tramo(c.principal.muestras, true, c.huecos);
  c.ramas.forEach((r) => tramo(r.muestras, r.barandillas, r.huecos || []));
  return out;
}
export const cintasDe = cintas;

export function paso(w, dt) { w.mundo.step(1 / 120, dt, 4); }

export function crearMundo(c, C) {
  const mundo = new C.World({ gravity: new C.Vec3(0, -18, 0) });
  mundo.solver.iterations = 8;
  const mPista = new C.Material('pista'); const mCanica = new C.Material('canica');
  mundo.addContactMaterial(new C.ContactMaterial(mPista, mCanica, { friction: c.def.hielo ? 0.04 : 0.45, restitution: 0.15 }));
  mundo.addContactMaterial(new C.ContactMaterial(mCanica, mCanica, { friction: 0.1, restitution: 0.8 }));
  cintas(c).forEach(({ vertices, indices }) => {
    const b = new C.Body({ mass: 0, type: C.Body.STATIC, material: mPista });
    b.addShape(new C.Trimesh(vertices, indices));
    mundo.addBody(b);
  });
  return { mundo, mCanica, C, c };
}

/** Canica nueva en la parrilla: fila y columna según el orden. */
export function posSalida(c, orden) {
  const M = c.principal.muestras; const m = M[Math.max(1, 6 - Math.floor(orden / 3) * 3)];
  const lado = ((orden % 3) - 1) * (m.ancho / 3.2);
  return m.p.clone().addScaledVector(m.n, lado).addScaledVector(m.u, RADIO + 0.2);
}

export function crearCanica(w, tipo, pos, { kinematica = false } = {}) {
  const def = CANICAS[tipo] || CANICAS.cometa;
  const b = new w.C.Body({ mass: kinematica ? 0 : def.masa, type: kinematica ? w.C.Body.KINEMATIC : w.C.Body.DYNAMIC, material: w.mCanica, linearDamping: 0.08, angularDamping: 0.15 });
  b.addShape(new w.C.Sphere(RADIO));
  b.position.set(pos.x, pos.y, pos.z);
  if (def.fantasma) b.collisionFilterGroup = 2; // las fantasma no chocan con canicas
  w.mundo.addBody(b);
  return { body: b, tipo, def, turboHasta: 0, rayoHasta: 0, derrapeHasta: 0, escudo: false, objeto: def.turbo ? 'turbo' : null, saltoListo: 0, pista: { i: 0 }, prog: 0, checkpoint: null, terminada: false, recargaEn: 15 };
}

/** Aplica el control: dir = [x, z] en el mundo (longitud ≤ 1). */
export function controlar(k, dir, t, dt) {
  const b = k.body; const d = k.def;
  if (t < k.derrapeHasta) { b.angularVelocity.y += (Math.random() - 0.5) * 2; dir = [0, 0]; }
  const turbo = t < k.turboHasta; const lento = t < k.rayoHasta;
  // Empuje desde el centro (aceleración directa, sin giros raros)
  const a = FUERZA * d.acel * d.agarre;
  const v = b.velocity;
  v.x += dir[0] * a * dt; v.z += dir[1] * a * dt;
  const vh = Math.hypot(v.x, v.z);
  if (turbo && vh > 0.1) { v.x += (v.x / vh) * 30 * dt; v.z += (v.z / vh) * 30 * dt; }
  // Velocidad punta
  const vmax = VMAX * d.vmax * (turbo ? 1.45 : 1) * (lento ? 0.45 : 1);
  if (vh > vmax) { const k2 = Math.pow(vmax / vh, Math.min(1, dt * 4)); v.x *= k2; v.z *= k2; }
  // Los choques contra la barandilla no lanzan la canica por los aires (salvo saltos)
  if (v.y > 5 && t > (k.saltoHasta || 0)) v.y = 5;
  // Agarre: corrige parte del derrape lateral hacia donde se quiere ir
  if (d.agarre > 1 && (dir[0] || dir[1]) && vh > 2) {
    const dl = Math.hypot(dir[0], dir[1]); const tx = dir[0] / dl; const tz = dir[1] / dl;
    const lat = -v.x * tz + v.z * tx; const corr = Math.min(1, dt * 2 * (d.agarre - 1));
    v.x -= -tz * lat * corr; v.z -= tx * lat * corr;
  }
}

export function saltar(k, t, fuerza = 9) {
  const b = k.body; b.velocity.y = Math.max(b.velocity.y, fuerza); k.saltoHasta = t + 0.4;
}

/**
 * Comprueba progreso, turbos, cajas y caídas. Devuelve eventos: { meta, caja, caida, turbo }.
 * cajas: [{ p, hasta }] (se recogen y reaparecen), t: tiempo de carrera.
 */
export function revisar(c, k, cajas, t) {
  const b = k.body; const ev = {};
  const pr = progresoDe(c, b.position, k.pista);
  if (pr.dist < 5 && b.position.y > -50) {
    k.prog = Math.max(k.prog, pr.prog);
    if (pr.rama === null && pr.dist < 3) k.checkpoint = pr.i;
  }
  // Caída: lejos de la pista o muy por debajo
  const ref = c.principal.muestras[k.pista.i].p;
  if (pr.dist > 9 || b.position.y < ref.y - 12) {
    const M = c.principal.muestras; const i = Math.max(2, (k.checkpoint ?? 3) - 4); const m = M[i];
    b.position.set(m.p.x, m.p.y + 1.2, m.p.z); b.velocity.set(m.t.x * 4, 0, m.t.z * 4); b.angularVelocity.set(0, 0, 0);
    k.pista.i = i; ev.caida = true; k.recienCaida = true;
  }
  // Turbos del suelo
  c.turbos.forEach((tb) => { if (tb.m.p.distanceToSquared(b.position) < 7 && t > (k.turboSuelo || 0)) { k.turboHasta = Math.max(k.turboHasta, t + (k.def.turbo ? 2.4 : 1.2)); k.turboSuelo = t + 1.5; ev.turbo = true; } });
  // Cajas de objetos
  const r2 = k.def.iman ? 36 : 3;
  cajas.forEach((cj) => {
    if (cj.hasta > t || k.objeto) return;
    if (cj.p.distanceToSquared(b.position) < r2) { cj.hasta = t + 4; ev.caja = true; }
  });
  if (k.def.recarga && !k.objeto && t > k.recargaEn) { k.recargaEn = t + 15; ev.caja = true; }
  if (!k.terminada && pr.prog > 0.985 && pr.rama === null) { k.terminada = true; ev.meta = true; }
  return ev;
}

/* ───────── Bot ───────── */
/** El bot elige al empezar si coge cada atajo y apunta unos metros por delante en su camino. */
export function crearBot(c, azar = Math.random) {
  return { atajos: c.ramas.map(() => azar() < 0.5), rama: null, k: 0, error: (azar() - 0.5) * 0.6, curva: 0 };
}
export function dirBot(c, k, bot) {
  const b = k.body; const M = c.principal.muestras;
  if (k.recienCaida) { if (bot.rama !== null) bot.atajos[bot.rama] = false; bot.rama = null; k.recienCaida = false; }
  let objetivo;
  if (bot.rama !== null) {
    const r = c.ramas[bot.rama]; const R = r.muestras;
    while (bot.k < R.length - 1 && R[bot.k].p.distanceToSquared(b.position) < 36) bot.k += 1;
    // Si se le pasó la entrada del atajo, sigue por el principal
    if (R[bot.k].p.distanceToSquared(b.position) > 100) { bot.rama = null; bot.atajos[c.ramas.indexOf(r)] = false; return dirBot(c, k, bot); }
    objetivo = R[Math.min(R.length - 1, bot.k + 3)].p;
    const a = R[Math.min(R.length - 1, bot.k + 2)].t; const bb = R[Math.min(R.length - 1, bot.k + 14)].t;
    bot.curva = Math.max(0.12, 1 - (a.x * bb.x + a.z * bb.z)); // en los atajos sin barandilla, siempre con cuidado
    if (bot.k >= R.length - 2) { bot.rama = null; k.pista.i = r.i1; }
  } else {
    const i = k.pista.i;
    const ri = c.ramas.findIndex((r, n) => bot.atajos[n] && i >= r.i0 - 6 && i <= r.i0);
    if (ri >= 0) { bot.rama = ri; bot.k = 0; return dirBot(c, k, bot); }
    objetivo = M[Math.min(M.length - 1, i + 9)].p;
    // ¿Viene una curva cerrada? Se mira el cambio de dirección de la pista más adelante
    const a = M[Math.min(M.length - 1, i + 4)].t; const bb = M[Math.min(M.length - 1, i + 22)].t;
    bot.curva = 1 - (a.x * bb.x + a.z * bb.z);
  }
  const dx = objetivo.x - b.position.x; const dz = objetivo.z - b.position.z; const l = Math.hypot(dx, dz) || 1;
  // Frena si va muy deprisa hacia otro lado
  const v = b.velocity; const vh = Math.hypot(v.x, v.z);
  const alineado = vh > 0.1 ? (v.x * dx + v.z * dz) / (vh * l) : 1;
  const ang = Math.atan2(dz, dx) + bot.error * 0.1;
  const limite = bot.curva > 0.25 ? 9 : bot.curva > 0.1 ? 12 : 99;
  const fuerza = (alineado < 0.6 && vh > 11) || vh > limite ? -0.7 : 1;
  return [Math.cos(ang) * fuerza, Math.sin(ang) * fuerza];
}
