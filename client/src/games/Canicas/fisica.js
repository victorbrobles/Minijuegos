// client/src/games/Canicas/fisica.js
// Física de «Carrera de Canicas» (cannon-es inyectada). La canica se conduce como un kart: el joystick gira el
// rumbo, acelera sola y el agarre corrige el deslizamiento lateral (si entras muy deprisa en una curva, te vas hacia
// fuera). El derrape (mantener pulsado) gira más cerrado y carga un miniturbo: azul, naranja y morado.
// La usan la escena 3D y los bots (rivales de práctica y simulaciones).
import { progresoDe, envolver } from './circuitos.js';
import { CANICAS } from './canicas.js';

export const RADIO = 0.5;
const ALTO_BARANDILLA = 1.6;
export const VMAX = 21;
const ACEL = 16;
const FRENO = 22;
const GIRO_MAX = 2.3; // rad/s
const AGARRE = 7; // 1/s: cuánto del deslizamiento lateral se corrige
const AGARRE_HIELO = 1.7;
export const CARGAS = [0.75, 1.6, 2.6]; // segundos de derrape para azul, naranja y morado
const MINI_TURBO = [0.55, 1.0, 1.5];

function cintas(c) {
  const out = [];
  const tramo = (muestras, cerrada, conBarandillas, huecos = []) => {
    const v = []; const idx = [];
    const add = (p) => { v.push(p.x, p.y, p.z); return v.length / 3 - 1; };
    const L = []; const R = [];
    muestras.forEach((m) => { L.push(add(m.p.clone().addScaledVector(m.n, -m.ancho / 2))); R.push(add(m.p.clone().addScaledVector(m.n, m.ancho / 2))); });
    const n = muestras.length; const fin = cerrada ? n : n - 1;
    for (let i = 0; i < fin; i++) {
      const j = (i + 1) % n;
      if (muestras[i].hueco || muestras[j].hueco) continue;
      idx.push(L[i], R[i], L[j], R[i], R[j], L[j]);
    }
    if (conBarandillas) {
      [-1, 1].forEach((lado) => {
        const base = lado < 0 ? L : R;
        const arriba = muestras.map((m) => add(m.p.clone().addScaledVector(m.n, (lado * m.ancho) / 2).addScaledVector(m.u, ALTO_BARANDILLA)));
        for (let i = 0; i < fin; i++) {
          const j = (i + 1) % n;
          if (muestras[i].hueco || huecos.some((h) => h.lado === lado && enRango(i, h.desde, h.hasta, cerrada ? n : 0))) continue;
          idx.push(base[i], base[j], arriba[i], base[j], arriba[j], arriba[i]);
        }
      });
    }
    out.push({ vertices: v, indices: idx });
  };
  tramo(c.principal.muestras, true, true, c.huecos);
  c.ramas.forEach((r) => tramo(r.muestras, false, r.barandillas, r.huecos || []));
  return out;
}
/** ¿i está entre desde y hasta? (con vuelta si n > 0) */
export function enRango(i, desde, hasta, n = 0) {
  if (!n) return i >= desde && i <= hasta;
  const d = ((i - desde) % n + n) % n; const largo = ((hasta - desde) % n + n) % n;
  return d <= largo;
}
export const cintasDe = cintas;

export function paso(w, dt) { w.mundo.step(1 / 120, dt, 4); }

export function crearMundo(c, C) {
  const mundo = new C.World({ gravity: new C.Vec3(0, -20, 0) });
  mundo.solver.iterations = 8;
  const mPista = new C.Material('pista'); const mCanica = new C.Material('canica');
  mundo.addContactMaterial(new C.ContactMaterial(mPista, mCanica, { friction: 0.05, restitution: 0.25 }));
  mundo.addContactMaterial(new C.ContactMaterial(mCanica, mCanica, { friction: 0.05, restitution: 0.9 }));
  cintas(c).forEach(({ vertices, indices }) => {
    const b = new C.Body({ mass: 0, type: C.Body.STATIC, material: mPista });
    b.addShape(new C.Trimesh(vertices, indices));
    mundo.addBody(b);
  });
  return { mundo, mCanica, C, c };
}

/** Puesto en la parrilla (antes de la línea de meta): filas de 3. */
export function muestraSalida(c, orden) { return envolver(c, -5 - Math.floor(orden / 3) * 4); }
export function posSalida(c, orden) {
  const m = c.principal.muestras[muestraSalida(c, orden)];
  const lado = ((orden % 3) - 1) * (m.ancho / 3.3);
  return m.p.clone().addScaledVector(m.n, lado).addScaledVector(m.u, RADIO + 0.15);
}

export function crearCanica(w, tipo, pos, { kinematica = false, c = w.c, orden = 0 } = {}) {
  const def = CANICAS[tipo] || CANICAS.cometa;
  const b = new w.C.Body({ mass: kinematica ? 0 : def.masa, type: kinematica ? w.C.Body.KINEMATIC : w.C.Body.DYNAMIC, material: w.mCanica, linearDamping: 0.02, angularDamping: 0.3 });
  b.addShape(new w.C.Sphere(RADIO));
  b.position.set(pos.x, pos.y, pos.z);
  if (def.fantasma) b.collisionFilterGroup = 2; // las fantasma no chocan con canicas
  w.mundo.addBody(b);
  const i0 = muestraSalida(c, orden); const m = c.principal.muestras[i0];
  return {
    body: b, tipo, def, ang: Math.atan2(m.t.z, m.t.x), suelo: true,
    turboHasta: 0, rayoHasta: 0, golpeHasta: 0, estrellaHasta: 0, saltoHasta: 0, escudo: false, derrape: null, derrapePrevio: false,
    objeto: def.turbo ? 'turbo' : null, usos: 0, saltoListo: 0, pista: { i: i0 }, sPrev: m.s, recorrido: -(c.principal.largo - m.s), prog: 0, vuelta: 0,
    checkpoint: i0, recorridoCheckpoint: -(c.principal.largo - m.s), terminada: false, recargaEn: 12, rebufo: 0
  };
}

const giroA = (a) => Math.atan2(Math.sin(a), Math.cos(a));

/** Conducción. mando = { giro: -1..1 (positivo = derecha), freno: bool, derrape: bool } */
export function controlar(k, mando, t, dt, hielo = false) {
  const b = k.body; const d = k.def; const v = b.velocity;
  const golpe = t < k.golpeHasta;
  const turbo = t < k.turboHasta; const estrella = t < k.estrellaHasta; const lento = t < k.rayoHasta;
  let giro = Math.max(-1, Math.min(1, mando.giro || 0));
  const fx = Math.cos(k.ang); const fz = Math.sin(k.ang);
  const vh = Math.hypot(v.x, v.z);
  if (golpe) {
    // Trompo: sin control y frenando
    k.ang += 11 * dt; k.derrape = null;
    const fr = Math.exp(-2.2 * dt); v.x *= fr; v.z *= fr;
    return;
  }
  // Derrape: empieza al pulsar girando y con algo de velocidad; se suelta para cobrar el miniturbo
  const pulsado = Boolean(mando.derrape);
  if (pulsado && !k.derrapePrevio && k.suelo && vh > 7 && Math.abs(giro) > 0.2) {
    k.derrape = { dir: Math.sign(giro), carga: 0 };
    if (v.y < 2.5) v.y = 2.5; // saltito al empezar
  }
  if (k.derrape && (!pulsado || vh < 5)) {
    const nivel = CARGAS.filter((x) => k.derrape.carga >= x).length;
    if (nivel && vh >= 5) { k.turboHasta = Math.max(k.turboHasta, t + MINI_TURBO[nivel - 1] * (d.turbo ? 1.5 : 1)); k.miniTurbo = { nivel, t }; }
    k.derrape = null;
  }
  k.derrapePrevio = pulsado;
  // Giro del rumbo
  const factorVel = Math.min(1, 0.4 + vh / 14);
  let rate;
  if (k.derrape) {
    const dir = k.derrape.dir;
    rate = dir * GIRO_MAX * (0.7 + 0.55 * Math.max(-1, Math.min(1, giro * dir)));
    if (k.suelo) k.derrape.carga += dt * (0.75 + 0.5 * Math.abs(giro));
  } else {
    giro = Math.sign(giro) * Math.pow(Math.abs(giro), 1.25);
    rate = GIRO_MAX * giro * factorVel;
  }
  k.ang = giroA(k.ang + rate * dt * (k.suelo ? 1 : 0.35));
  if (!k.suelo) return; // en el aire: sin empuje ni agarre
  // Empuje hacia delante (acelera sola) o freno
  const nfx = Math.cos(k.ang); const nfz = Math.sin(k.ang);
  const vf = v.x * nfx + v.z * nfz;
  if (mando.freno) {
    if (vf > 1) { const f = Math.min(vf, FRENO * dt); v.x -= nfx * f; v.z -= nfz * f; }
    else if (vf > -5) { v.x -= nfx * 9 * dt; v.z -= nfz * 9 * dt; } // marcha atrás
  } else {
    const a = ACEL * d.acel * (turbo ? 2.4 : 1) * (estrella ? 1.4 : 1) * (vf < 6 ? 1.4 : 1);
    v.x += nfx * a * dt; v.z += nfz * a * dt;
  }
  // Agarre: corrige el deslizamiento lateral (en el derrape, bastante menos)
  const rx = -nfz; const rz = nfx;
  const vl = v.x * rx + v.z * rz;
  let agarre = (hielo && d.agarre < 1.5 ? AGARRE_HIELO : AGARRE) * d.agarre;
  if (k.derrape) agarre *= 0.42;
  const corr = vl * (1 - Math.exp(-agarre * dt));
  v.x -= rx * corr; v.z -= rz * corr;
  // Velocidad punta
  const vmax = VMAX * d.vmax * (turbo ? 1.38 : 1) * (estrella ? 1.22 : 1) * (lento ? 0.55 : 1) * (k.nivelBot || 1);
  const vh2 = Math.hypot(v.x, v.z);
  if (vh2 > vmax) { const f = Math.pow(vmax / vh2, Math.min(1, dt * 5)); v.x *= f; v.z *= f; }
  if (v.y > 6 && t > k.saltoHasta) v.y = 6;
}

export function saltar(k, t, fuerza = 9) {
  const b = k.body; b.velocity.y = Math.max(b.velocity.y, fuerza); k.saltoHasta = t + 0.5; k.suelo = false;
}

/** Golpe (misil, aceite, rayo fuerte, estrella): trompo. Devuelve 'escudo' si lo para el escudo, false si es invencible. */
export function golpear(k, t, dur = 1.1) {
  if (t < k.estrellaHasta || t < k.golpeHasta) return false;
  if (k.escudo) { k.escudo = false; return 'escudo'; }
  k.golpeHasta = t + dur * (k.def.dura ? 0.5 : 1); k.derrape = null;
  const v = k.body.velocity; const f = k.def.dura ? 0.6 : 0.3; v.x *= f; v.z *= f;
  return true;
}

/** Recoloca la canica en la pista (tras caerse), un poco antes del último punto seguro. */
function recolocar(c, k) {
  const M = c.principal.muestras;
  let atras = 4;
  for (let d = -4; d < 45; d++) if (M[envolver(c, k.checkpoint + d)].hueco) { atras = 30; break; }
  const i = envolver(c, k.checkpoint - atras); const m = M[i];
  const b = k.body;
  b.position.set(m.p.x + m.u.x * 1.2, m.p.y + m.u.y * 1.2, m.p.z + m.u.z * 1.2);
  b.velocity.set(m.t.x * 6, 0, m.t.z * 6); b.angularVelocity.set(0, 0, 0);
  k.ang = Math.atan2(m.t.z, m.t.x); k.pista.i = i; k.sPrev = m.s; k.recorrido = k.recorridoCheckpoint - atras; k.derrape = null; k.golpeHasta = 0;
}

/**
 * Comprueba posición, vueltas, turbos, rampas, cajas y caídas. Devuelve eventos: { meta, caja, caida, turbo, salto, vuelta }.
 * cajas: [{ p, hasta }] (se recogen y reaparecen), t: tiempo de carrera.
 */
export function revisar(c, k, cajas, t) {
  const b = k.body; const ev = {}; const L = c.principal.largo;
  const pos = b.position;
  const pr = progresoDe(c, pos, k.pista);
  const m = pr.m;
  const dx = pos.x - m.p.x; const dy = pos.y - m.p.y; const dz = pos.z - m.p.z;
  const alto = dx * m.u.x + dy * m.u.y + dz * m.u.z; const lat = dx * m.n.x + dy * m.n.y + dz * m.n.z;
  const sobre = Math.abs(lat) <= m.ancho / 2 + 0.25 && !m.hueco;
  k.ramaActual = pr.rama; k.kRama = pr.k; k.lat = lat;
  k.suelo = sobre && alto < RADIO + 0.45 && alto > -0.6 && t > k.saltoHasta - 0.35;
  // Recorrido (para las vueltas): lo que avanza la «s» del principal
  let ds = pr.s - k.sPrev; if (ds > L / 2) ds -= L; if (ds < -L / 2) ds += L;
  if (Math.abs(ds) < 30) k.recorrido += ds;
  k.sPrev = pr.s;
  const vueltas = c.vueltas;
  const vuelta = Math.max(0, Math.floor(k.recorrido / L));
  if (vuelta > k.vuelta && vuelta < vueltas) { k.vuelta = vuelta; ev.vuelta = vuelta + 1; }
  k.prog = Math.max(0, Math.min(1, k.recorrido / (L * vueltas)));
  if (pr.rama === null && k.suelo && Math.abs(lat) < m.ancho / 2 - 0.6) { k.checkpoint = pr.i; k.recorridoCheckpoint = k.recorrido; }
  // Caída: lejos de la pista o por debajo
  // Atascada fuera del suelo (encima de una barandilla, en una esquina…): se la recoloca
  const vq = Math.hypot(b.velocity.x, b.velocity.z);
  k.quieto = vq < 1.2 && !k.suelo ? (k.quieto || 0) + 1 / 60 : 0;
  if (k.quieto > 3) { k.quieto = 0; k.rescatar = true; }
  // Sin avanzar en 6 s (atascada en una esquina o encima de una barandilla): también
  if (!k.marca || k.recorrido > k.marca.r + 4) k.marca = { r: k.recorrido, t };
  else if (t - k.marca.t > 6 && !k.terminada) { k.marca = { r: k.recorrido, t }; k.rescatar = true; }
  if (k.rescatar || pr.dist > 14 || alto < -7) { k.rescatar = false; recolocar(c, k); ev.caida = true; k.recienCaida = true; return ev; }
  // Turbos del suelo y rampas de salto
  c.turbos.forEach((tb) => { if (tb.m.p.distanceToSquared(pos) < 6 && t > (k.turboSuelo || 0)) { k.turboHasta = Math.max(k.turboHasta, t + (k.def.turbo ? 1.5 : 1)); k.turboSuelo = t + 1; ev.turbo = true; } });
  c.saltos.forEach((sl) => { if (sl.m.p.distanceToSquared(pos) < 8 && t > (k.rampa || 0)) { const vh0 = Math.hypot(b.velocity.x, b.velocity.z); const vs = Math.min(22, Math.max(vh0, 19)); b.velocity.x = sl.m.t.x * vs; b.velocity.z = sl.m.t.z * vs; k.ang = Math.atan2(sl.m.t.z, sl.m.t.x); b.velocity.y = 10.5; k.saltoHasta = t + 0.6; k.rampa = t + 1; k.suelo = false; k.turboHasta = Math.max(k.turboHasta, t + 0.5); ev.salto = true; } });
  // Cajas de objetos
  const r2 = k.def.iman ? 40 : 3.2;
  cajas.forEach((cj) => {
    if (cj.hasta > t || (k.objeto && !k.def.iman)) return;
    if (cj.p.distanceToSquared(pos) < r2) { cj.hasta = t + 3; if (!k.objeto) ev.caja = k.def.iman && Math.random() < 0.3 ? 2 : 1; }
  });
  if (k.def.recarga && !k.objeto && t > k.recargaEn) { k.recargaEn = t + 12; ev.caja = 1; }
  if (!k.terminada && k.recorrido >= L * vueltas) { k.terminada = true; ev.meta = true; }
  return ev;
}

/* ───────── Bot ───────── */
/** El bot elige en cada paso si coge el camino alternativo y apunta unos metros por delante. */
export function crearBot(c, azar = Math.random, nivel = 0.94) {
  return { rama: null, k: 0, decidido: {}, evitar: {}, nivel, error: (azar() - 0.5) * 0.3, azar };
}
export function dirBot(c, k, bot, hielo = false, rec = 0) {
  const b = k.body; const M = c.principal.muestras; const N = c.N; const p = b.position; const v = b.velocity;
  k.nivelBot = bot.nivel;
  const vh = Math.hypot(v.x, v.z);
  if (k.recienCaida) { if (bot.rama !== null) bot.evitar[bot.rama] = (bot.evitar[bot.rama] || 0) + 1; bot.rama = null; k.recienCaida = false; }
  if (!rec && bot.rama === null && k.ramaActual != null && !(bot.forzar && !bot.forzar[k.ramaActual])) {
    const r = c.ramas[k.ramaActual]; const pM = M[k.pista.i].p;
    if (pM.distanceTo(p) > M[k.pista.i].ancho / 2 + 0.5) { bot.rama = k.ramaActual; bot.k = k.kRama || 0; }
    else if (r) { /* aún pegado al principal: sigue su plan */ }
  }
  const mira = Math.round(5 + vh * 0.4);
  let objetivo; let curva;
  const radioDe = (S, a, z) => { const ta = S[a].t; const tb = S[z].t; const ang = Math.acos(Math.max(-1, Math.min(1, ta.x * tb.x + ta.z * tb.z))); return ang < 1e-3 ? 999 : Math.abs(z - a) / ang; };
  if (bot.rama !== null) {
    const r = c.ramas[bot.rama]; const R = r.muestras;
    // Muestra más cercana por delante
    let mejor = bot.k; let bd = Infinity;
    for (let j = bot.k; j < Math.min(R.length, bot.k + 40); j++) { const dd = R[j].p.distanceToSquared(p); if (dd < bd) { bd = dd; mejor = j; } }
    bot.k = mejor;
    if (bd > 110) { bot.rama = null; return dirBot(c, k, bot, hielo, rec + 1); }
    objetivo = R[Math.min(R.length - 1, bot.k + Math.round(3 + vh * 0.3))].p;
    bot.anchoRama = r.ancho;
    curva = radioDe(R, Math.min(R.length - 1, bot.k + 2), Math.min(R.length - 1, bot.k + 16));
    if (bot.k >= R.length - 3) { bot.rama = null; k.pista.i = r.i1; }
    // (la rampa ya da la velocidad para el salto)
  } else {
    const i = k.pista.i;
    const ri = c.ramas.findIndex((r, n) => { const d = ((r.i0 - i) % N + N) % N; return d <= 6 && d >= 1; });
    if (ri >= 0) {
      const clave = `${ri}:${k.vuelta}`;
      if (!(clave in bot.decidido)) bot.decidido[clave] = bot.forzar ? Boolean(bot.forzar[ri]) : bot.azar() < 0.6 / (1 + (bot.evitar[ri] || 0) * 2);
      if (bot.decidido[clave] && ((c.ramas[ri].i0 - i + N) % N) <= 1) { bot.rama = ri; bot.k = 0; return dirBot(c, k, bot, hielo, rec + 1); }
    }
    objetivo = M[(i + mira) % N].p;
    curva = radioDe(M, (i + 3) % N, (i + 18) % N) ;
    curva = Math.min(curva, radioDe(M, (i + 10) % N, (i + 26) % N));
  }
  // Trazada: rumbo de la pista un poco más adelante, corregido por lo desviado que va del centro (control tipo Stanley)
  const enRama = bot.rama !== null;
  const S = enRama ? c.ramas[bot.rama].muestras : M;
  const j = enRama ? bot.k : k.pista.i;
  const muestra = (q) => (enRama ? S[Math.min(S.length - 1, q)] : S[((q % N) + N) % N]);
  const ma = muestra(j); const tA = muestra(j + Math.round(2 + vh * 0.18)).t;
  const err = (p.x - ma.p.x) * ma.n.x + (p.z - ma.p.z) * ma.n.z;
  const deseado = Math.atan2(tA.z, tA.x) - Math.atan(2.2 * (err + bot.error) / (vh + 3)) + 0 * objetivo.x;
  const dif = giroA(deseado - k.ang);
  const agarre = (hielo && k.def.agarre < 1.5 ? AGARRE_HIELO : AGARRE) * k.def.agarre;
  let limite = Math.sqrt(curva * agarre * (hielo ? 3 : 2.6));
  if (bot.rama !== null && !c.ramas[bot.rama].barandillas && !c.ramas[bot.rama].hueco) limite = Math.min(limite, 9 + c.ramas[bot.rama].ancho * 2);
  // Atascado (contra una barandilla): marcha atrás un momento
  if (vh < 1.5) bot.atasco = (bot.atasco || 0) + 1 / 60; else bot.atasco = 0;
  if (bot.atasco > 4) { bot.atasco = 0; k.recienCaida = true; k.rescatar = true; }
  if (bot.atasco > 0.8) return { giro: -Math.sign(dif || 1), freno: true, derrape: false };
  return { giro: Math.max(-1, Math.min(1, dif * 2.4)), freno: vh > limite + 1, derrape: false };
}
