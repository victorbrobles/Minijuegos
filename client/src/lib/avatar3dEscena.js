// client/src/lib/avatar3dEscena.js
// Avatar 3D hecho por código (sin modelos externos): cuerpo, cara, pelo, ropa y complementos con piezas básicas de
// three.js y luz suave tipo dibujo animado. Lo carga lib/avatar3d.js solo cuando hace falta dibujar un avatar que no
// está ya en la caché. Las piezas (números de opción) son las de lib/avatarRealista.js.
import * as THREE from 'three';
import { PIELES, COLORES_PELO, COLORES_OJOS, COLORES_ROPA } from './avatarRealista.js';

const col = (c) => new THREE.Color(c);
const M = (c, extra = {}) => new THREE.MeshStandardMaterial({ color: col(c), roughness: 0.6, metalness: 0, ...extra });
const tela = (c) => new THREE.MeshStandardMaterial({ color: col(c), roughness: 0.88 });
const brillo = (c, m = 0.6) => new THREE.MeshStandardMaterial({ color: col(c), roughness: 0.28, metalness: m });
const oscurece = (c, k) => col(c).multiplyScalar(k);
const pos = (o, x = 0, y = 0, z = 0) => { o.position.set(x, y, z); o.castShadow = true; return o; };
const malla = (g, m, x, y, z) => pos(new THREE.Mesh(g, m), x, y, z);
const esfera = (r, m, seg = 36) => new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.7)), m);
const capsula = (r, l, m) => new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 8, 20), m);
const toro = (r, t, m, arco = Math.PI * 2, segT = 28, segR = 10) => new THREE.Mesh(new THREE.TorusGeometry(r, t, segR, segT, arco), m);
const azar = (s) => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

/** Cápsula entre dos puntos (brazos, piernas, mechones…). */
function hueso(a, b, r, m) {
  const A = new THREE.Vector3(...a); const B = new THREE.Vector3(...b);
  const c = capsula(r, A.distanceTo(B), m);
  c.position.copy(A.clone().add(B).multiplyScalar(0.5));
  c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  c.castShadow = true; return c;
}
/** Media esfera (casquete) desde arriba: pelo, gorros… */
const casquete = (r, corte, m) => new THREE.Mesh(new THREE.SphereGeometry(r, 48, 28, 0, Math.PI * 2, 0, Math.PI * corte), m);

/** Construye el avatar. Devuelve { grupo, yCabeza } (alto total ≈ 5,4). */
export function construirAvatar(a) {
  const g = new THREE.Group();
  const cPiel = PIELES[a.piel] ?? PIELES[2];
  const cPelo = COLORES_PELO[a.colorPelo] ?? COLORES_PELO[2];
  const cOjos = COLORES_OJOS[a.colorOjos] ?? COLORES_OJOS[0];
  const cArr = COLORES_ROPA[a.colorArriba] ?? COLORES_ROPA[8];
  const cAbj = COLORES_ROPA[a.colorAbajo] ?? COLORES_ROPA[14];
  const cExtra = COLORES_ROPA[a.colorExtra ?? 3] ?? COLORES_ROPA[3];
  const mp = new THREE.MeshStandardMaterial({ color: col(cPiel), roughness: 0.55, emissive: oscurece(cPiel, 0.1) });
  const mpOsc = new THREE.MeshStandardMaterial({ color: oscurece(cPiel, 0.86), roughness: 0.55 });
  const mPelo = M(cPelo, { roughness: 0.48 });
  const mArr = tela(cArr); const mAbj = tela(cAbj); const mExtra = tela(cExtra);
  const blanco = tela('#f8fafc');

  const tipoArr = a.arriba ?? 0; const tipoAbj = a.abajo ?? 0;
  const vestido = tipoArr === 7; const abrigo = tipoArr === 8;
  const k = [0.86, 1, 1.15, 1.28][a.cuerpo ?? 1] ?? 1; // complexión
  const hombro = 0.6 * k;

  // ── Piernas y calzado
  const yCad = 1.25; const sep = 0.25 * Math.max(1, k * 0.95);
  const corto = tipoAbj === 2; const falda = tipoAbj === 3 || vestido;
  const grosorPierna = 0.22 * Math.sqrt(k);
  [-1, 1].forEach((s) => {
    const x = s * sep;
    if (corto) { g.add(hueso([x, yCad, 0], [x, yCad - 0.55, 0], grosorPierna * 1.12, mAbj)); g.add(hueso([x, yCad - 0.45, 0], [x, 0.3, 0], 0.16, mp)); }
    else if (falda) g.add(hueso([x, yCad, 0], [x, 0.3, 0], 0.15, mp));
    else {
      g.add(hueso([x, yCad, 0], [x, 0.3, 0], grosorPierna, mAbj));
      if (tipoAbj === 4) g.add(hueso([x + s * grosorPierna * 0.98, yCad - 0.05, 0], [x + s * grosorPierna * 0.98, 0.35, 0], 0.03, blanco)); // chándal: raya
      if (tipoAbj === 0) g.add(malla(new THREE.TorusGeometry(grosorPierna * 1.02, 0.03, 6, 20), tela(oscurece(cAbj, 0.7)), x, 0.38, 0).rotateX(Math.PI / 2)); // vaquero: dobladillo
    }
    // Calzado
    const tipoZ = a.calzado ?? 0;
    const cZap = ['#f8fafc', '#111827', '#5b3a1e', '#3b2416', cArr][tipoZ] ?? '#f8fafc';
    const zap = malla(new THREE.CapsuleGeometry(0.2, 0.3, 8, 16), M(cZap, { roughness: tipoZ === 3 ? 0.3 : 0.55 }), x, 0.17, 0.12); zap.rotation.x = Math.PI / 2; zap.scale.set(1.05, 1, 0.75); g.add(zap);
    if (tipoZ === 2) g.add(malla(new THREE.CylinderGeometry(0.21, 0.2, 0.42, 20), M(cZap), x, 0.38, 0));
    if (tipoZ !== 3 && tipoZ !== 2) { const suela = malla(new THREE.CylinderGeometry(0.21, 0.21, 0.06, 20), tipoZ === 1 ? blanco : M('#e2e8f0'), x, 0.05, 0.12); suela.scale.z = 1.9; g.add(suela); }
  });
  if (falda) {
    const largo = vestido ? 0.85 : 0.72;
    const f = malla(new THREE.CylinderGeometry(0.5 * k, 0.8 * k, largo, 36, 1, true), vestido ? mArr.clone() : mAbj.clone(), 0, yCad + 0.1 - largo / 2, 0);
    f.material.side = THREE.DoubleSide; f.scale.z = 0.8; g.add(f);
  }

  // ── Torso
  const yT = yCad + 0.62;
  const torso = malla(new THREE.CapsuleGeometry(hombro, 0.55, 12, 28), mArr, 0, yT, 0); torso.scale.set(1, 1, 0.72); g.add(torso);
  if ((a.cuerpo ?? 1) === 3) { const b = malla(new THREE.SphereGeometry(hombro * 0.95, 28, 20), mArr, 0, yT - 0.22, 0.1); b.scale.set(1, 0.85, 0.85); g.add(b); }
  if (!falda) { const cad = malla(new THREE.CapsuleGeometry(hombro * 0.82, 0.1, 8, 20), mAbj, 0, yCad + 0.08, 0); cad.scale.set(1, 1, 0.75); g.add(cad); }
  const zF = hombro * 0.72; // frente del torso
  if (tipoArr === 1 || tipoArr === 9) { // camisa / polo: cuello y botones
    [-1, 1].forEach((s) => { const c = malla(new THREE.BoxGeometry(0.2, 0.15, 0.05), tipoArr === 1 ? blanco : mArr, s * 0.13, yT + 0.55, hombro * 0.56); c.rotation.z = s * -0.5; g.add(c); });
    (tipoArr === 1 ? [0.3, 0.05, -0.2] : [0.35, 0.2]).forEach((y) => g.add(malla(new THREE.SphereGeometry(0.03, 10, 8), blanco, 0, yT + y, zF + 0.01)));
  } else if (tipoArr === 2) { // sudadera
    const cap = malla(new THREE.TorusGeometry(0.42, 0.13, 10, 28), mArr, 0, yT + 0.58, -0.12); cap.rotation.x = Math.PI / 2.3; g.add(cap);
    [-0.12, 0.12].forEach((x) => g.add(hueso([x, yT + 0.45, zF], [x, yT + 0.05, zF + 0.02], 0.022, blanco)));
    g.add(malla(new THREE.BoxGeometry(0.7 * k, 0.28, 0.05), tela(oscurece(cArr, 0.85)), 0, yT - 0.32, zF - 0.02));
  } else if (tipoArr === 3 || tipoArr === 6 || abrigo) { // chaqueta vaquera, traje o abrigo: abierta con camisa dentro
    g.add(malla(new THREE.BoxGeometry(0.34, 0.95, 0.05), tipoArr === 3 ? tela('#f1f5f9') : blanco, 0, yT + 0.05, zF));
    [-1, 1].forEach((s) => { const sol = malla(new THREE.BoxGeometry(0.22, 0.44, 0.06), tipoArr === 6 ? tela(oscurece(cArr, 0.8)) : mArr, s * 0.2, yT + 0.36, zF - 0.01); sol.rotation.z = s * 0.35; g.add(sol); });
    if (tipoArr === 6) { g.add(malla(new THREE.BoxGeometry(0.1, 0.5, 0.04), tela('#b91c1c'), 0, yT + 0.12, zF + 0.03)); } // corbata
    else [0.1, -0.15, -0.4].forEach((y) => g.add(malla(new THREE.SphereGeometry(0.035, 10, 8), brillo(tipoArr === 3 ? '#cbd5e1' : '#1f2937'), 0.21, yT + y, zF + 0.01)));
    if (abrigo) { const fald = malla(new THREE.CylinderGeometry(hombro * 0.95, hombro * 1.05, 0.7, 28, 1, true), mArr.clone(), 0, yCad - 0.12, 0); fald.material.side = THREE.DoubleSide; fald.scale.z = 0.78; g.add(fald); }
  } else if (tipoArr === 4) { // jersey de cuello alto
    g.add(malla(new THREE.CylinderGeometry(0.3, 0.33, 0.26, 20), mArr, 0, yT + 0.68, 0));
    [0.2, 0, -0.2].forEach((y) => g.add(malla(new THREE.TorusGeometry(hombro * 0.98, 0.02, 6, 30), tela(oscurece(cArr, 0.85)), 0, yT + y, 0).rotateX(Math.PI / 2)));
  } else if (tipoArr === 0) { // camiseta con logo
    g.add(malla(new THREE.CircleGeometry(0.15, 24), tela(oscurece(cArr, 0.55)), 0, yT + 0.12, zF + 0.005));
  } else if (vestido) {
    g.add(malla(new THREE.TorusGeometry(hombro * 0.85, 0.05, 6, 30), tela(oscurece(cArr, 0.8)), 0, yCad + 0.12, 0).rotateX(Math.PI / 2)); // cinturón
  }

  // ── Brazos (manga corta: antebrazo de piel; tirantes: brazo entero de piel)
  const mangaCorta = tipoArr === 0 || tipoArr === 5 || tipoArr === 9 || vestido;
  [-1, 1].forEach((s) => {
    const h = [s * (hombro + 0.08), yT + 0.42, 0]; const codo = [s * (hombro + 0.22), yT - 0.12, 0.05]; const mano = [s * (hombro + 0.26), yT - 0.62, 0.12];
    g.add(hueso(h, codo, 0.17 * k ** 0.6, tipoArr === 5 ? mp : mArr));
    g.add(hueso(codo, mano, 0.145 * k ** 0.5, mangaCorta ? mp : mArr));
    const m = esfera(0.16, mp, 20); pos(m, mano[0], mano[1] - 0.08, mano[2]); m.scale.set(0.95, 1.1, 0.85); g.add(m);
    const pulgar = esfera(0.07, mp, 12); pos(pulgar, mano[0] - s * 0.12, mano[1] - 0.02, mano[2] + 0.06); g.add(pulgar);
  });
  if (tipoArr === 5) [-1, 1].forEach((s) => g.add(hueso([s * 0.28, yT + 0.25, zF - 0.03], [s * 0.36, yT + 0.62, 0], 0.045, mArr))); // tirantes

  // ── Cabeza
  const yC = yT + hombro * 0.4 + 1.22;
  g.add(malla(new THREE.CylinderGeometry(0.2, 0.24, 0.4, 20), mp, 0, yC - 0.95, 0));
  const cab = esfera(1, mp, 56); cab.scale.set(0.92, 1, 0.9); pos(cab, 0, yC, 0); g.add(cab);
  const menton = esfera(0.62, mp); menton.scale.set(1.05, 0.8, 0.95); pos(menton, 0, yC - 0.42, 0.16); g.add(menton);
  [-1, 1].forEach((s) => { const o = esfera(0.2, mp, 20); o.scale.set(0.55, 1, 0.8); pos(o, s * 0.9, yC - 0.05, 0); g.add(o); });
  const nariz = esfera(0.13, mpOsc, 20); nariz.scale.set(1, 0.9, 1.1); pos(nariz, 0, yC - 0.17, 0.9); g.add(nariz);
  [-1, 1].forEach((s) => { const m = malla(new THREE.CircleGeometry(0.15, 20), new THREE.MeshBasicMaterial({ color: 0xff8a8a, transparent: true, opacity: 0.25 }), s * 0.47, yC - 0.3, 0.77); m.rotation.y = s * 0.55; m.castShadow = false; g.add(m); });

  // Ojos: 0 normales · 1 grandes · 2 rasgados · 3 sonrientes · 4 con pestañas · 5 adormilados
  const tipoO = a.ojos ?? 0; const ro = tipoO === 1 ? 0.21 : 0.18;
  const mCeja = M(oscurece(cPelo, a.pelo === 10 || a.pelo === 0 ? 0.75 : 0.95), { roughness: 0.6 });
  [-1, 1].forEach((s) => {
    const x = s * 0.33; const y = yC + 0.02; const z = 0.74;
    if (tipoO === 3) { const arco = malla(new THREE.TorusGeometry(0.13, 0.035, 8, 20, Math.PI), M('#1f1410'), x, y - 0.04, z + 0.12); g.add(arco); }
    else {
      const bl = esfera(ro, M('#ffffff', { roughness: 0.2 }), 24); bl.scale.set(1, tipoO === 2 ? 0.7 : 1.08, 0.55); pos(bl, x, y, z); g.add(bl);
      const iris = esfera(ro * 0.66, M(cOjos, { roughness: 0.25 }), 20); iris.scale.set(1, 1, 0.45); pos(iris, x - s * 0.01, y - 0.01, z + ro * 0.38); g.add(iris);
      const pup = esfera(ro * 0.36, M('#0b0b0b', { roughness: 0.1 }), 16); pup.scale.set(1, 1, 0.4); pos(pup, x - s * 0.01, y - 0.01, z + ro * 0.5); g.add(pup);
      const br = esfera(ro * 0.17, new THREE.MeshBasicMaterial({ color: 0xffffff }), 10); pos(br, x + 0.05, y + 0.06, z + ro * 0.6); g.add(br);
      const cierre = tipoO === 5 ? 0.45 : tipoO === 2 ? 0.34 : 0.2;
      const par = new THREE.Mesh(new THREE.SphereGeometry(ro * 1.07, 24, 12, 0, Math.PI * 2, 0, Math.PI * cierre), mp); par.scale.set(1, tipoO === 2 ? 0.78 : 1.08, 0.62); pos(par, x, y, z); par.rotation.x = 0.2; g.add(par);
      if (tipoO === 4) { const p = malla(new THREE.TorusGeometry(ro * 1.04, 0.026, 6, 20, Math.PI), M('#111111'), x, y + 0.01, z + 0.05); g.add(p); [0.6, 1.0].forEach((t) => g.add(hueso([x + s * Math.cos(t) * ro, y + Math.sin(t) * ro, z + 0.06], [x + s * Math.cos(t) * ro * 1.45, y + Math.sin(t) * ro * 1.45, z + 0.06], 0.014, M('#111111')))); }
    }
    g.add(hueso([x - s * 0.15, y + 0.31, z + 0.13], [x + s * 0.13, y + 0.35, z + 0.11], 0.042, mCeja));
  });
  // Boca: 0 sonrisa · 1 risa · 2 seria · 3 pícara · 4 sorpresa
  const mBoca = M('#7f1d1d', { roughness: 0.4 }); const tipoB = a.boca ?? 0;
  if (tipoB === 1) {
    const forma = new THREE.Shape(); forma.moveTo(-0.2, 0); forma.quadraticCurveTo(0, -0.3, 0.2, 0); forma.lineTo(-0.2, 0);
    g.add(malla(new THREE.ShapeGeometry(forma, 16), mBoca, 0, yC - 0.3, 0.875));
    const lengua = malla(new THREE.CircleGeometry(0.085, 16), M('#f87171'), 0, yC - 0.43, 0.878); lengua.scale.x = 1.4; g.add(lengua);
    g.add(malla(new THREE.PlaneGeometry(0.3, 0.05), M('#ffffff'), 0, yC - 0.325, 0.879));
  } else if (tipoB === 2) g.add(hueso([-0.13, yC - 0.4, 0.85], [0.13, yC - 0.4, 0.85], 0.03, mBoca));
  else if (tipoB === 4) { const o = malla(new THREE.CircleGeometry(0.1, 20), mBoca, 0, yC - 0.4, 0.875); o.scale.y = 1.25; g.add(o); }
  else { const b = malla(new THREE.TorusGeometry(0.15, 0.035, 8, 22, Math.PI * 0.8), mBoca, 0, yC - 0.3, 0.86); b.rotation.z = Math.PI * 1.1 + (tipoB === 3 ? 0.35 : 0); g.add(b); }

  // Barba: 0 nada · 1 de tres días · 2 perilla · 3 bigote · 4 corta · 5 larga
  const tipoBa = a.barba ?? 0;
  if (tipoBa === 1) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.71, 36, 20, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.42), new THREE.MeshStandardMaterial({ color: col(cPelo), transparent: true, opacity: 0.32, roughness: 1 })); s.scale.set(1.04, 0.92, 1.02); pos(s, 0, yC - 0.32, 0.16); g.add(s); }
  if (tipoBa === 2) { const p = esfera(0.17, mPelo, 18); p.scale.set(1, 1.2, 0.8); pos(p, 0, yC - 0.66, 0.66); g.add(p); }
  if (tipoBa === 3 || tipoBa >= 4) [-1, 1].forEach((s) => g.add(hueso([s * 0.03, yC - 0.27, 0.9], [s * 0.2, yC - 0.33, 0.84], 0.05, mPelo)));
  if (tipoBa >= 4) { const bb = new THREE.Mesh(new THREE.SphereGeometry(0.72, 36, 20, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.45), mPelo); bb.scale.set(1.02, tipoBa === 5 ? 1.55 : 0.95, 1); pos(bb, 0, yC - 0.32, 0.13); g.add(bb); g.add(malla(new THREE.CircleGeometry(0.12, 18), mBoca, 0, yC - 0.42, 0.86)); }

  // ── Pelo: 0 rapado · 1 corto · 2 raya al lado · 3 largo liso · 4 largo rizado · 5 media melena · 6 coleta · 7 moño
  //          8 afro · 9 trenzas · 10 calvo · 11 corto rizado · 12 de punta · 13 flequillo · 14 cresta · 15 dos coletas
  const tipoP = a.pelo ?? 1; const r = azar(97 + tipoP * 13 + (a.colorPelo ?? 0));
  const sombrero = [1, 2, 6].includes(a.extra);
  const casco = (corte, esc, giro = -0.32) => { const c = casquete(1, corte, mPelo); c.scale.set(0.92 * esc, esc, 0.9 * esc); pos(c, 0, yC, 0); c.rotation.x = giro; return c; };
  const flequillo = (n = 5, y = 0.62, z = 0.55) => { for (let i = 0; i < n; i++) { const m = esfera(0.27, mPelo, 18); m.scale.set(1, 0.62, 0.62); pos(m, -0.5 + (i * 1) / (n - 1), yC + y - Math.abs(i - (n - 1) / 2) * 0.03, z); g.add(m); } };
  const melenaAtras = (largo) => { const e = malla(new THREE.CylinderGeometry(0.88, 0.96, largo, 32, 1, true, Math.PI * 0.55, Math.PI * 0.9), mPelo.clone(), 0, yC - largo / 2 + 0.2, -0.05); e.material.side = THREE.DoubleSide; g.add(e); };
  const rizos = (n, R, rr, yMin) => { for (let i = 0; i < n; i++) { const th = r() * Math.PI * 2; const ph = r() * yMin; const m = esfera(rr, mPelo, 14); pos(m, Math.sin(ph) * Math.cos(th) * R * 0.92, yC + 0.15 + Math.cos(ph) * R, Math.sin(ph) * Math.sin(th) * R * 0.88 - 0.08); if (m.position.z > 0.5 && m.position.y < yC + 0.62) continue; g.add(m); } };
  if (tipoP === 0) g.add(casco(0.47, 1.02, -0.12));
  if ([1, 2, 3, 4, 5, 6, 7, 9, 12, 13, 15].includes(tipoP)) g.add(casco(0.5, 1.07));
  if (tipoP === 1) flequillo(4, 0.66, 0.5);
  if (tipoP === 2) { for (let i = 0; i < 4; i++) { const m = esfera(0.28, mPelo, 18); m.scale.set(1.1, 0.55, 0.62); pos(m, 0.45 - i * 0.28, yC + 0.66 + i * 0.03, 0.5); m.rotation.z = 0.3; g.add(m); } }
  if ([3, 5, 6, 7, 9, 15].includes(tipoP)) flequillo(5);
  if (tipoP === 3 || tipoP === 4) melenaAtras(tipoP === 3 ? 1.95 : 1.75);
  if (tipoP === 3) [-1, 1].forEach((s) => { const m = capsula(0.2, 1.1, mPelo); pos(m, s * 0.83, yC - 0.55, 0.22); m.rotation.z = s * 0.08; g.add(m); });
  if (tipoP === 4) { rizos(26, 1.05, 0.26, 1.2); [-1, 1].forEach((s) => { for (let i = 0; i < 5; i++) { const m = esfera(0.24, mPelo, 14); pos(m, s * (0.84 + (i % 2) * 0.06), yC - 0.1 - i * 0.3, 0.1 - (i % 2) * 0.12); g.add(m); } }); }
  if (tipoP === 5) [-1, 1].forEach((s) => { const m = capsula(0.24, 0.45, mPelo); pos(m, s * 0.82, yC - 0.3, 0.1); m.rotation.z = s * 0.15; g.add(m); });
  if (tipoP === 6 && !sombrero) { const c = capsula(0.24, 0.8, mPelo); pos(c, 0, yC - 0.15, -1.0); c.rotation.x = 0.45; g.add(c); g.add(malla(new THREE.TorusGeometry(0.16, 0.06, 8, 16), mExtra, 0, yC + 0.28, -0.88)); }
  if (tipoP === 7 && !sombrero) { g.add(pos(esfera(0.42, mPelo, 24), 0, yC + 1.03, -0.22)); g.add(malla(new THREE.TorusGeometry(0.3, 0.06, 8, 20), mExtra, 0, yC + 0.82, -0.15).rotateX(Math.PI / 2.4)); }
  if (tipoP === 8) rizos(sombrero ? 40 : 72, 1.25, 0.34, 1.65);
  if (tipoP === 11) rizos(36, 1.02, 0.24, 1.2);
  if (tipoP === 9) [-1, 1].forEach((s) => { for (let i = 0; i < 6; i++) { const m = esfera(0.15, mPelo, 14); m.scale.set(1, 1.2, 1); pos(m, s * (0.78 - i * 0.01), yC - 0.35 - i * 0.24, -0.25 + i * 0.02); g.add(m); } g.add(malla(new THREE.SphereGeometry(0.08, 10, 8), mExtra, s * 0.76, yC - 1.82, -0.15)); });
  if (tipoP === 12 && !sombrero) for (let i = 0; i < 11; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.75, 12), mPelo); const ang = -1.2 + (i / 10) * 2.4; pos(c, Math.sin(ang) * 0.6, yC + 0.78 + r() * 0.1, 0.2 + Math.cos(ang) * 0.25); c.rotation.set(0.9 + r() * 0.3, 0, -ang * 0.5); g.add(c); }
  if (tipoP === 13) flequillo(6, 0.5, 0.64);
  if (tipoP === 14) { g.add(casco(0.46, 1.018, -0.12)); if (!sombrero) for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.62 - Math.abs(i - 2) * 0.06, 10), mPelo); pos(c, 0, yC + 0.85 + Math.cos((i - 2) * 0.32) * 0.15, 0.7 - i * 0.34); c.rotation.x = -0.25 + i * 0.2; g.add(c); } }
  if (tipoP === 15) [-1, 1].forEach((s) => { const c = capsula(0.2, 0.7, mPelo); pos(c, s * 0.95, yC - 0.1, -0.2); c.rotation.z = s * 0.5; g.add(c); g.add(malla(new THREE.SphereGeometry(0.1, 12, 10), mExtra, s * 0.8, yC + 0.22, -0.2)); });

  // ── Gafas: 0 nada · 1 redondas · 2 rectangulares · 3 de sol · 4 de pasta
  const tipoG = a.gafas ?? 0;
  if (tipoG) {
    const mg = tipoG === 1 ? brillo('#a16207', 0.8) : M('#111827', { roughness: 0.3, metalness: 0.2 });
    const grosor = tipoG === 4 ? 0.055 : tipoG === 1 ? 0.022 : 0.035;
    [-1, 1].forEach((s) => {
      const aro = malla(new THREE.TorusGeometry(0.25, grosor, 8, tipoG === 2 ? 4 : 28), mg, s * 0.33, yC + 0.02, 0.86);
      if (tipoG === 2) { aro.rotation.z = Math.PI / 4; aro.scale.set(1.25, 0.95, 1); }
      g.add(aro);
      if (tipoG === 3) { const cr = malla(new THREE.CircleGeometry(0.25, 28), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.08, metalness: 0.6 }), s * 0.33, yC + 0.02, 0.87); g.add(cr); }
      g.add(hueso([s * 0.57, yC + 0.05, 0.8], [s * 0.88, yC + 0.08, 0.1], grosor * 0.8, mg));
    });
    g.add(hueso([-0.09, yC + 0.05, 0.92], [0.09, yC + 0.05, 0.92], grosor * 0.9, mg));
  }

  // ── Complementos: 0 nada · 1 gorra · 2 gorro de lana · 3 pendientes · 4 collar · 5 auriculares · 6 sombrero
  //                 7 bufanda · 8 diadema · 9 pajarita
  const tipoE = a.extra ?? 0; const oro = brillo('#facc15', 0.8);
  if (tipoE === 1) {
    const c = casquete(1.1, 0.42, M(cExtra, { roughness: 0.7 })); pos(c, 0, yC + 0.08, 0); c.scale.setScalar(0.95); g.add(c);
    const v = malla(new THREE.CylinderGeometry(0.75, 0.75, 0.06, 32, 1, false, -Math.PI / 2, Math.PI), M(cExtra, { roughness: 0.7 }), 0, yC + 0.52, 0.55); v.scale.z = 0.9; v.rotation.x = 0.15; g.add(v);
    g.add(pos(esfera(0.08, M(cExtra), 10), 0, yC + 1.12, 0));
  }
  if (tipoE === 2) { const c = casquete(1.1, 0.45, tela(cExtra)); pos(c, 0, yC + 0.1, 0); c.scale.y = 1.15; g.add(c); g.add(pos(esfera(0.22, blanco, 16), 0, yC + 1.38, 0)); g.add(malla(new THREE.TorusGeometry(0.98, 0.12, 10, 40), tela(oscurece(cExtra, 0.8)), 0, yC + 0.35, 0).rotateX(Math.PI / 2)); }
  if (tipoE === 3) [-1, 1].forEach((s) => g.add(malla(new THREE.TorusGeometry(0.08, 0.02, 8, 16), oro, s * 0.9, yC - 0.28, 0.05)));
  if (tipoE === 4) { for (let i = 0; i < 14; i++) { const t = Math.PI * (0.15 + (i / 13) * 0.7); g.add(malla(new THREE.SphereGeometry(0.05, 10, 8), brillo('#f8fafc', 0.3), Math.cos(t) * 0.36, yC - 0.98 - Math.sin(t) * 0.18, Math.sin(t) * 0.3 + 0.08)); } }
  if (tipoE === 5) { const mc = M(cExtra, { roughness: 0.35 }); g.add(malla(new THREE.TorusGeometry(1.05, 0.07, 10, 40, Math.PI), mc, 0, yC + 0.05, 0)); [-1, 1].forEach((s) => { const c = malla(new THREE.CylinderGeometry(0.3, 0.3, 0.22, 24), mc, s * 1.0, yC - 0.08, 0); c.rotation.z = Math.PI / 2; g.add(c); }); }
  if (tipoE === 6) { const mS = M(cExtra, { roughness: 0.8 }); g.add(malla(new THREE.CylinderGeometry(1.6, 1.6, 0.06, 40), mS, 0, yC + 0.62, 0)); g.add(malla(new THREE.CylinderGeometry(0.78, 0.88, 0.75, 32), mS, 0, yC + 0.98, 0)); g.add(malla(new THREE.CylinderGeometry(0.885, 0.885, 0.16, 32), tela('#111827'), 0, yC + 0.7, 0)); }
  if (tipoE === 7) { const mB = tela(cExtra); g.add(malla(new THREE.TorusGeometry(0.36, 0.16, 10, 28), mB, 0, yC - 0.98, 0.05).rotateX(Math.PI / 2)); g.add(hueso([0.2, yC - 1.05, 0.38], [0.28, yC - 1.75, 0.45], 0.12, mB)); }
  if (tipoE === 8) g.add(malla(new THREE.TorusGeometry(0.98, 0.06, 8, 40, Math.PI), M(cExtra, { roughness: 0.4 }), 0, yC + 0.12, 0.18).rotateX(-0.35));
  if (tipoE === 9) { const mP = M(cExtra, { roughness: 0.5 }); [-1, 1].forEach((s) => { const l = malla(new THREE.ConeGeometry(0.13, 0.24, 4), mP, s * 0.12, yT + 0.66, zF - 0.05); l.rotation.z = s * Math.PI / 2; g.add(l); }); g.add(pos(esfera(0.06, mP, 10), 0, yT + 0.66, zF - 0.02)); }

  return { grupo: g, yCabeza: yC };
}

let R = null; // renderizador compartido
function renderizador() {
  if (R) return R;
  const canvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 1.25));
  const sol = new THREE.DirectionalLight(0xfff1e0, 2.4); sol.position.set(3, 7, 6); sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024); sol.shadow.radius = 5;
  Object.assign(sol.shadow.camera, { left: -4, right: 4, top: 7.5, bottom: -1 }); scene.add(sol);
  const contra = new THREE.DirectionalLight(0xbfdbfe, 1.5); contra.position.set(-4, 5, -5); scene.add(contra);
  const suelo = new THREE.Mesh(new THREE.CircleGeometry(2.1, 40), new THREE.ShadowMaterial({ opacity: 0.22 })); suelo.rotation.x = -Math.PI / 2; suelo.receiveShadow = true; scene.add(suelo);
  R = { renderer, scene, suelo };
  return R;
}
function liberar(o) {
  o.traverse((m) => { if (m.isMesh) { m.geometry.dispose(); (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => x.dispose()); } });
}

/**
 * Dibuja el avatar y devuelve una imagen (data URL, fondo transparente).
 * modo 'cara': busto cuadrado (se recorta en círculo con CSS) · 'cuerpo': cuerpo entero (proporción 200 × 420).
 */
export function fotoAvatar(a, modo = 'cara', ancho = 160) {
  const { renderer, scene, suelo } = renderizador();
  const { grupo, yCabeza } = construirAvatar(a);
  grupo.rotation.y = modo === 'cara' ? -0.14 : -0.3;
  scene.add(grupo);
  const alto = modo === 'cara' ? ancho : Math.round((ancho * 420) / 200);
  renderer.setSize(ancho, alto, false);
  const cam = new THREE.PerspectiveCamera(modo === 'cara' ? 24 : 26, ancho / alto, 0.1, 100);
  if (modo === 'cara') { cam.position.set(0, yCabeza + 0.12, 6.7); cam.lookAt(0, yCabeza - 0.12, 0); suelo.visible = false; }
  else { const h = yCabeza + 1.3; cam.position.set(0, h * 0.55, 12.6); cam.lookAt(0, h * 0.49, 0); suelo.visible = true; }
  renderer.render(scene, cam);
  let url = renderer.domElement.toDataURL('image/webp', 0.9);
  if (!url.startsWith('data:image/webp')) url = renderer.domElement.toDataURL('image/png');
  scene.remove(grupo); liberar(grupo);
  return url;
}
