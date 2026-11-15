// client/src/games/Minigolf/fisica.js
// Física de «Minigolf» (cannon-es, inyectada): suelo, rampas, paredes, obstáculos (postes, muros, molinos,
// bloques que se deslizan), arena, turbos, agua y vacío. La usan la escena 3D y el bot que valida los hoyos.
import { CASILLA, DIRS, aMundo, aLocal, alturaEn } from './hoyos.js';

export const RADIO = 0.18;
export const RADIO_HOYO = 0.3;
export const VEL_MAX = 13;
const GRAVEDAD = -15;
const FRENO = 1.9; // deceleración por rodar (u/s²)
const FRENO_ARENA = 8;
const DT = 1 / 120;

export function crearSimulador(hoyo, C) {
  const mundo = new C.World({ gravity: new C.Vec3(0, GRAVEDAD, 0) });
  mundo.solver.iterations = 12;
  const mSuelo = new C.Material('suelo'); const mPared = new C.Material('pared'); const mBola = new C.Material('bola');
  mundo.addContactMaterial(new C.ContactMaterial(mBola, mSuelo, { friction: 0, restitution: 0.12 }));
  mundo.addContactMaterial(new C.ContactMaterial(mBola, mPared, { friction: 0, restitution: 0.72 }));
  const estatico = (mat) => new C.Body({ mass: 0, type: C.Body.STATIC, material: mat });
  const qYaw = (t) => { const [fx, fz] = DIRS[t.dir]; const q = new C.Quaternion(); q.setFromAxisAngle(new C.Vec3(0, 1, 0), Math.atan2(-fz, fx)); return q; };
  const enMundo = (t, u, v) => aMundo(t, u, v);
  const piezas = []; // para dibujar: { forma, t, u, y, v, su, sy, sv, tilt, mat, r, h }
  const caja = (t, u, y, v, su, sy, sv, mat, extra = {}) => {
    const b = estatico(mat);
    b.addShape(new C.Box(new C.Vec3(su / 2, sy / 2, sv / 2)));
    const [x, z] = enMundo(t, u, v);
    b.position.set(x, y, z);
    const q = qYaw(t);
    if (extra.tilt) { const p = new C.Quaternion(); p.setFromAxisAngle(new C.Vec3(0, 0, 1), extra.tilt); b.quaternion.copy(q.mult(p)); } else b.quaternion.copy(q);
    mundo.addBody(b);
    piezas.push({ forma: 'caja', x, y, z, su, sy, sv, q: [b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w], clase: extra.clase || (mat === mSuelo ? 'suelo' : 'pared') });
    return b;
  };
  const GROSOR = 0.4;
  const suelo = (t, u0, u1, v0, v1, hA = t.h0, hB = t.h0, clase = 'suelo') => {
    const largo = u1 - u0; const ang = Math.atan2(hB - hA, largo); const L = largo / Math.cos(ang);
    const um = (u0 + u1) / 2 + Math.sin(ang) * (GROSOR / 2); const ym = (hA + hB) / 2 - Math.cos(ang) * (GROSOR / 2);
    caja(t, um, ym, (v0 + v1) / 2, L, GROSOR, v1 - v0, mSuelo, { tilt: ang, clase });
  };
  const regiones = []; // arena, agua, turbo
  const moviles = [];
  let hMin = Infinity;
  hoyo.casillas.forEach((t, i) => {
    hMin = Math.min(hMin, t.h0, t.h1);
    const R = t.rasgo;
    // Suelo
    if (R?.tipo === 'puente') suelo(t, -2, 2, R.centro - R.ancho / 2, R.centro + R.ancho / 2, t.h0, t.h0, 'puente');
    else if (R?.tipo === 'salto') {
      const g0 = 0.2; const g1 = g0 + R.hueco;
      suelo(t, -2, g0, -2, 2);
      suelo(t, -0.9, g0, -1.6, 1.6, t.h0, t.h0 + R.rampa, 'rampita');
      suelo(t, g1, 2, -2, 2);
    } else suelo(t, -2, 2, -2, 2, t.h0, t.h1);
    // Paredes en los lados que no conectan
    const abiertos = new Set();
    if (i < hoyo.casillas.length - 1) abiertos.add(t.dout);
    if (i > 0) abiertos.add((t.din + 2) % 4);
    const yLo = Math.min(t.h0, t.h1) - 0.4; const yHi = Math.max(t.h0, t.h1) + 0.45;
    for (let s = 0; s < 4; s++) {
      if (abiertos.has(s)) continue;
      const [dx, dz] = DIRS[s]; const b = estatico(mPared);
      const he = new C.Vec3(dx ? 0.1 : CASILLA / 2 + 0.1, (yHi - yLo) / 2, dz ? 0.1 : CASILLA / 2 + 0.1);
      b.addShape(new C.Box(he));
      b.position.set(t.cx + dx * (CASILLA / 2 + 0.1), (yHi + yLo) / 2, t.cz + dz * (CASILLA / 2 + 0.1));
      mundo.addBody(b);
      piezas.push({ forma: 'caja', x: b.position.x, y: b.position.y, z: b.position.z, su: he.x * 2, sy: he.y * 2, sv: he.z * 2, q: [0, 0, 0, 1], clase: 'pared', mundoAlineada: true });
    }
    if (!R) return;
    if (R.tipo === 'postes') R.postes.forEach(([u, v, rr]) => {
      const b = estatico(mPared); b.addShape(new C.Cylinder(rr, rr, 0.6, 16)); const [x, z] = enMundo(t, u, v); b.position.set(x, t.h0 + 0.3, z); mundo.addBody(b);
      piezas.push({ forma: 'poste', x, y: t.h0 + 0.3, z, r: rr, h: 0.6 });
    });
    if (R.tipo === 'muro') {
      const a = R.centro - R.hueco / 2; const bb = R.centro + R.hueco / 2;
      if (a > -2) caja(t, 0, t.h0 + 0.22, (a - 2) / 2, 0.25, 0.45, a + 2, mPared, { clase: 'muro' });
      if (bb < 2) caja(t, 0, t.h0 + 0.22, (bb + 2) / 2, 0.25, 0.45, 2 - bb, mPared, { clase: 'muro' });
    }
    if (R.tipo === 'molino') {
      const [x, z] = enMundo(t, 0, 0);
      const eje = estatico(mPared); eje.addShape(new C.Cylinder(0.16, 0.16, 0.9, 12)); eje.position.set(x, t.h0 + 0.45, z); mundo.addBody(eje);
      piezas.push({ forma: 'poste', x, y: t.h0 + 0.45, z, r: 0.16, h: 0.9, clase: 'eje' });
      const aspa = new C.Body({ mass: 0, type: C.Body.KINEMATIC, material: mPared });
      aspa.addShape(new C.Box(new C.Vec3(R.largo / 2, 0.16, 0.11)));
      aspa.position.set(x, t.h0 + 0.22, z);
      mundo.addBody(aspa);
      moviles.push({ tipo: 'molino', body: aspa, w: R.w, largo: R.largo });
    }
    if (R.tipo === 'deslizante') {
      const bloque = new C.Body({ mass: 0, type: C.Body.KINEMATIC, material: mPared });
      bloque.addShape(new C.Box(new C.Vec3(0.3, 0.2, R.ancho / 2)));
      bloque.quaternion.copy(qYaw(t));
      mundo.addBody(bloque);
      moviles.push({ tipo: 'deslizante', body: bloque, t, periodo: R.periodo, amp: 2 - R.ancho / 2 - 0.05, ancho: R.ancho });
    }
    if (R.tipo === 'arena') regiones.push({ tipo: 'arena', t, u0: R.u0, u1: R.u1, v0: -2, v1: 2 });
    if (R.tipo === 'agua') regiones.push({ tipo: 'agua', t, u0: -1.6, u1: 1.6, v0: R.lado > 0 ? 0.2 : -2, v1: R.lado > 0 ? 2 : -0.2 });
    if (R.tipo === 'turbo') regiones.push({ tipo: 'turbo', t, u0: -0.6, u1: 0.6, v0: R.v - 0.6, v1: R.v + 0.6, fuerza: R.fuerza });
  });

  const bola = new C.Body({ mass: 0.3, material: mBola, linearDamping: 0.02, angularDamping: 0.3 });
  bola.addShape(new C.Sphere(RADIO));
  mundo.addBody(bola);
  const s = {
    mundo, bola, piezas, moviles, regiones, hoyo, t: 0, moviendo: false, quieto: 0, ultimoReposo: null, turboHasta: 0,
    colocar(p) { bola.position.set(p[0], p[1] + RADIO + 0.02, p[2]); bola.velocity.setZero(); bola.angularVelocity.setZero(); s.moviendo = false; s.quieto = 0; s.ultimoReposo = [p[0], p[1], p[2]]; },
    golpear(dx, dz, potencia) {
      const l = Math.hypot(dx, dz) || 1; const v = Math.max(0.05, Math.min(1, potencia)) * VEL_MAX;
      s.ultimoReposo = [bola.position.x, bola.position.y - RADIO - 0.02, bola.position.z];
      bola.velocity.set((dx / l) * v, 0, (dz / l) * v); s.moviendo = true; s.quieto = 0;
    },
    /** Avanza el reloj (los obstáculos se mueven siempre) y la bola si está rodando. Devuelve un evento o null. */
    paso(dt = DT) {
      s.t += dt;
      moverObstaculos(s);
      if (!s.moviendo) { bola.velocity.setZero(); mundo.step(dt); if (s.ultimoReposo) bola.position.set(s.ultimoReposo[0], s.ultimoReposo[1] + RADIO + 0.02, s.ultimoReposo[2]); return null; }
      mundo.step(dt);
      return revisar(s, dt);
    },
    /** Casilla en la que está la bola (o la más cercana). */
    casillaDe(x = bola.position.x, z = bola.position.z) {
      let mejor = 0; let dist = Infinity;
      hoyo.casillas.forEach((t, i) => { const d = Math.hypot(x - t.cx, z - t.cz); if (d < dist) { dist = d; mejor = i; } });
      return mejor;
    },
    hMin
  };
  s.colocar(hoyo.salida);
  return s;
}

function moverObstaculos(s) {
  s.moviles.forEach((m) => {
    if (m.tipo === 'molino') {
      const q = m.body.quaternion; q.setFromAxisAngle({ x: 0, y: 1, z: 0 }, m.w * s.t);
      m.body.angularVelocity.set(0, m.w, 0);
    } else {
      const fase = (2 * Math.PI * s.t) / m.periodo; const v = m.amp * Math.sin(fase); const dv = (m.amp * 2 * Math.PI * Math.cos(fase)) / m.periodo;
      const [x, z] = aMundo(m.t, 0, v); const [x2, z2] = aMundo(m.t, 0, v + 1);
      m.body.position.set(x, m.t.h0 + 0.2, z);
      m.body.velocity.set((x2 - x) * dv, 0, (z2 - z) * dv);
    }
  });
}

function enSuelo(s) {
  for (const c of s.mundo.contacts) {
    if (c.bi !== s.bola && c.bj !== s.bola) continue;
    const ny = c.bi === s.bola ? -c.ni.y : c.ni.y;
    if (ny > 0.5) return true;
  }
  return false;
}

function revisar(s, dt) {
  const b = s.bola; const p = b.position; const v = b.velocity;
  // Hoyo: cerca del centro y no demasiado rápida
  const [hx, hy, hz] = s.hoyo.hoyo;
  const vh = Math.hypot(v.x, v.z);
  if (Math.hypot(p.x - hx, p.z - hz) < RADIO_HOYO && vh < 5.5 && p.y < hy + RADIO + 0.25) { s.moviendo = false; return 'embocada'; }
  // Fuera del recorrido
  if (p.y < s.hMin - 1.5) return castigo(s, 'fuera');
  const ci = s.casillaDe(); const t = s.hoyo.casillas[ci];
  const [u, w] = aLocal(t, p.x, p.z);
  const enRegion = (tipo) => s.regiones.find((r) => r.tipo === tipo && r.t === t && u >= r.u0 && u <= r.u1 && w >= r.v0 && w <= r.v1);
  if (enRegion('agua') && p.y < t.h0 + RADIO + 0.2) return castigo(s, 'agua');
  const suelo = enSuelo(s);
  // Rodar frena (más en la arena)
  if (suelo && vh > 0) {
    const freno = (enRegion('arena') ? FRENO_ARENA : FRENO) * dt;
    const k = Math.max(0, vh - freno) / vh;
    v.x *= k; v.z *= k;
  }
  const turbo = enRegion('turbo');
  if (turbo && s.t > s.turboHasta) {
    const [fx, fz] = DIRS[t.dir]; v.x += fx * turbo.fuerza; v.z += fz * turbo.fuerza; s.turboHasta = s.t + 0.6;
  }
  if (Math.hypot(v.x, v.y, v.z) < 0.1 && suelo) s.quieto += 1; else s.quieto = 0;
  if (s.quieto > 30) {
    s.moviendo = false; v.set(0, 0, 0); b.angularVelocity.set(0, 0, 0);
    s.ultimoReposo = [p.x, p.y - RADIO - 0.02, p.z];
    return 'parada';
  }
  return null;
}

function castigo(s, tipo) {
  s.moviendo = false;
  const r = s.ultimoReposo || s.hoyo.salida;
  s.colocar(r);
  return tipo;
}

/** Simula un golpe completo (bot y pruebas): devuelve el evento final. */
export function simularGolpe(s, dx, dz, potencia, maxSeg = 16) {
  s.golpear(dx, dz, potencia);
  const pasos = Math.round(maxSeg / DT);
  for (let i = 0; i < pasos; i++) { const e = s.paso(DT); if (e) return e; }
  // Si no se para (atascada contra algo que se mueve), se da por parada
  s.moviendo = false; const p = s.bola.position; s.ultimoReposo = [p.x, p.y - RADIO - 0.02, p.z];
  return 'parada';
}

/** Golpe del bot: apunta al siguiente punto de paso con la fuerza justa y algo de error. */
export function golpeBot(s, azar = Math.random) {
  const h = s.hoyo; const ci = s.casillaDe(); const p = s.bola.position;
  const ultimo = ci >= h.casillas.length - 1;
  let objetivo = ultimo ? [h.hoyo[0], h.hoyo[2]] : h.paso[ci + 1];
  // Si ya pasó el punto de su casilla con holgura, mira dos casillas más allá en las rectas
  if (!ultimo && ci + 2 < h.casillas.length && h.casillas[ci + 1].din === h.casillas[ci + 1].dout && azar() < 0.3) objetivo = h.paso[ci + 2];
  const dx = objetivo[0] - p.x; const dz = objetivo[1] - p.z; const dist = Math.hypot(dx, dz);
  const salto = !ultimo && h.casillas[ci + 1]?.rasgo?.tipo === 'salto';
  const subir = !ultimo ? Math.max(0, h.casillas[ci + 1].h1 - h.casillas[ci].h0) : 0;
  let v = Math.sqrt(2 * FRENO * dist + 2 * 15 * subir * 0.55) * (ultimo ? 1.0 : 1.12);
  if (salto) v = Math.max(v, 7.5);
  v *= 1 + (azar() - 0.5) * 0.24;
  const ang = Math.atan2(dz, dx) + (azar() - 0.5) * 0.12;
  return simularGolpe(s, Math.cos(ang), Math.sin(ang), v / VEL_MAX);
}
