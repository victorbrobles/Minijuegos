// Minijuegos (5/6): colores traicioneros, encaja la pieza, pesca rápida, trileros y dedo veloz.
import React, { useRef, useState } from 'react';
import { useEscena, rng, crea, tocado, THREE, marcador } from '../tres.js';
import { Hud, Botones, Boton, Mensaje } from '../comun.jsx';
import { sonar, vibrar } from '../../../lib/sonido.js';

/* ───────── Colores traicioneros ───────── */
const TINTAS = [['ROJO', '#ef4444'], ['AZUL', '#3b82f6'], ['VERDE', '#22c55e'], ['AMARILLO', '#eab308']];
function Stroop({ semilla, alTerminar }) {
  const ref = useRef(null); const ctl = useRef({}); const [hud, setHud] = useState({ pts: 0, t: 30 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene } = ctx; const r = rng(semilla);
    const suelo = crea.suelo(40, 40, 0x1e1b4b, { celda: 1, contraste: 0.05 }); suelo.position.y = -2.2; scene.add(suelo);
    const panel = new THREE.Group();
    const fondo = crea.caja(5.6, 2.6, 0.4, 0x0f172a, { roughness: 0.2, metalness: 0.5 }); panel.add(fondo);
    const borde = crea.marco(5.6, 2.6, 0xa855f7, { intensidad: 1.6 }); borde.rotation.x = Math.PI / 2; borde.position.z = 0.22; panel.add(borde);
    const cartel = marcador({ tam: 1.25, fondo: null, ancho: 900 }); cartel.position.set(0, 0, 0.3); cartel.material.depthTest = false; cartel.renderOrder = 5; panel.add(cartel);
    scene.add(panel);
    const pedestal = crea.cilindro(1.6, 2, 0.6, 0x312e81, 40); pedestal.position.y = -1.9; scene.add(pedestal);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.04, 8, 64), crea.neon(0xa855f7, 2)); aro.rotation.x = Math.PI / 2; aro.position.y = -1.58; scene.add(aro);
    // Orbes de colores flotando alrededor (decoración)
    const orbes = TINTAS.map(([, c], k) => { const o = crea.esfera(0.22, new THREE.Color(c).getHex(), { emissive: new THREE.Color(c), emissiveIntensity: 1.2 }); o.userData.a = (k / 4) * Math.PI * 2; scene.add(o); return o; });
    const st = { t: 0, pts: 0, palabra: 0, tinta: 1, fin: false, golpe: 0 };
    const nueva = () => { st.palabra = r.entero(0, 3); do { st.tinta = r.entero(0, 3); } while (r() < 0.75 && st.tinta === st.palabra); cartel.poner(TINTAS[st.palabra][0], TINTAS[st.tinta][1]); st.golpe = 1; };
    nueva();
    ctl.current.elegir = (k) => {
      if (st.fin) return;
      if (k === st.tinta) { st.pts++; sonar('tic', { minimo: 0, vibrar: false }); ctx.chispas(new THREE.Vector3(0, 0, 0.6), new THREE.Color(TINTAS[k][1]).getHex(), 16, { fuerza: 4 }); }
      else { st.pts = Math.max(0, st.pts - 1); sonar('fallo', { vibrar: false }); vibrar(40); ctx.temblor(0.2); setMsg('✗'); setTimeout(() => setMsg(null), 250); }
      nueva();
    };
    ctx.encuadrar({ centro: [0, -0.3, 0], ancho: 6.4, alto: 4.6, desde: [0, 0.12, 1] });
    return {
      frame(dt, t) {
        st.golpe = Math.max(0, st.golpe - dt * 5); panel.scale.setScalar(1 + st.golpe * 0.08);
        panel.position.y = Math.sin(t * 2) * 0.1; panel.rotation.y = Math.sin(t * 0.8) * 0.12;
        orbes.forEach((o) => { const a = o.userData.a + t * 0.8; o.position.set(Math.cos(a) * 3.4, Math.sin(t * 2 + o.userData.a) * 0.3 - 1, Math.sin(a) * 1.2 - 0.5); });
        if (st.fin) return; st.t += dt;
        if (st.t >= 30) { st.fin = true; alTerminar(st.pts); }
        setHud((h) => (h.pts !== st.pts || h.t !== Math.ceil(30 - st.t) ? { pts: st.pts, t: Math.max(0, Math.ceil(30 - st.t)) } : h));
      }
    };
  }, { cielo: [0x312e81, 0x0f0a1e], niebla: 40 });
  return (
    <div className="hb-caja">
      <div ref={ref} className="hb-lienzo" /><Hud izq={`🎨 ${hud.pts} pts`} der={`⏱️ ${hud.t}s`} /><Mensaje texto={msg} tipo="mal" />
      <p className="hb-pista">Toca el color de la TINTA, no lo que pone</p>
      <div className="hb-colores">{TINTAS.map(([n, c], k) => <button key={n} type="button" style={{ '--c': c }} onPointerDown={(e) => { e.preventDefault(); ctl.current.elegir?.(k); }} aria-label={n} />)}</div>
    </div>
  );
}

/* ───────── Encaja la pieza ───────── */
const FORMAS = [[[0, 0], [1, 0], [2, 0], [0, 1]], [[0, 0], [1, 0], [2, 0], [1, 1]], [[0, 0], [1, 0], [1, 1], [2, 1]], [[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [1, 0], [0, 1], [0, 2], [1, 2]], [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]]];
const rotar = (celdas, k) => { let c = celdas; for (let i = 0; i < ((k % 4) + 4) % 4; i++) c = c.map(([x, y]) => [-y, x]); const mx = Math.min(...c.map((p) => p[0])); const my = Math.min(...c.map((p) => p[1])); return c.map(([x, y]) => [x - mx, y - my]); };
const clave = (c) => c.map(([x, y]) => `${x},${y}`).sort().join('|');
/** Centra unas celdas: cada una con su posición respecto al centro de su caja. */
const centradas = (c) => { const ox = Math.max(...c.map((p) => p[0])) / 2; const oy = Math.max(...c.map((p) => p[1])) / 2; return c.map(([x, y]) => [x - ox, y - oy]); };
function Encajar({ semilla, alTerminar }) {
  const ref = useRef(null); const ctl = useRef({}); const [hud, setHud] = useState({ n: 1, ok: 0 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla); const MURO = -16;
    // Túnel de neón
    const suelo = crea.suelo(9, 60, 0x1e1b4b, { celda: 1, contraste: 0.06 }); suelo.position.set(0, -2.6, -10); scene.add(suelo);
    const lineas = [];
    for (let z = 10; z > -30; z -= 4) { const l = crea.marco(9, 4.6, 0x22d3ee, { intensidad: 1.2, grosor: 0.05 }); l.rotation.x = Math.PI / 2; l.position.set(0, -0.3, z); scene.add(l); lineas.push(l); }
    [-4.5, 4.5].forEach((x) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 60), crea.neon(0xec4899, 1.8)); b.position.set(x, -2.55, -10); scene.add(b); });
    const matPieza = new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x0891b2, emissiveIntensity: 0.6, roughness: 0.2, metalness: 0.2, transparent: true, opacity: 0.72 });
    const geoCelda = crea.caja(0.9, 0.9, 0.9, 0).geometry;
    const st = { i: 0, ok: 0, z: 6, rot: 0, pieza: null, muro: null, forma: null, objetivo: null, fin: false, pausa: 0, giro: 0, paso: false, bien: false };
    const ponCeldas = () => {
      const g = st.pieza; while (g.children.length) g.remove(g.children[0]);
      centradas(rotar(st.forma, st.rot)).forEach(([x, y]) => { const b = new THREE.Mesh(geoCelda, matPieza); b.castShadow = true; b.position.set(x, y, 0); g.add(b); });
    };
    const montar = () => {
      if (st.pieza) scene.remove(st.pieza); if (st.muro) scene.remove(st.muro);
      st.forma = r.de(FORMAS); st.objetivo = rotar(st.forma, r.entero(0, 3)); do { st.rot = r.entero(0, 3); } while (clave(rotar(st.forma, st.rot)) === clave(st.objetivo));
      const muro = new THREE.Group(); const hueco = centradas(st.objetivo); const libre = new Set(hueco.map(([x, y]) => `${x},${y}`));
      const fx = hueco[0][0] % 1; const fy = hueco[0][1] % 1; // desplazamiento de media celda
      const colMuro = r.de([0xf97316, 0xe11d48, 0x7c3aed, 0x0d9488]);
      for (let ix = -4; ix <= 4; ix++) for (let iy = -1; iy <= 4; iy++) {
        const x = ix + fx; const y = iy + fy; if (libre.has(`${x},${y}`)) continue;
        const cerca = hueco.some(([hx, hy]) => Math.abs(hx - x) + Math.abs(hy - y) === 1);
        const b = crea.caja(0.98, 0.98, 0.8, cerca ? 0xfde68a : colMuro, cerca ? { emissive: 0xf59e0b, emissiveIntensity: 0.5 } : undefined); b.position.set(x, y, 0); muro.add(b);
      }
      muro.position.set(0, -0.5, MURO); scene.add(muro); st.muro = muro;
      st.pieza = new THREE.Group(); scene.add(st.pieza); st.z = 6; st.giro = 0; st.paso = false; ponCeldas();
    };
    montar();
    ctl.current.girar = (k) => { if (st.fin || st.pausa > 0 || st.paso) return; st.rot = (st.rot + k + 4) % 4; ponCeldas(); st.giro = -k * Math.PI / 2; sonar('toque', { minimo: 0 }); };
    return {
      frame(dt) {
        const k = ctx.ancho(0.75);
        camera.position.set(0, 2.4 + 0.5 * k, st.z + 6.5 * k); camera.lookAt(0, 0.2, MURO);
        lineas.forEach((l) => { l.position.z += dt * 14; if (l.position.z > st.z + 8) l.position.z -= 40; });
        if (st.fin) return;
        st.giro *= Math.pow(0.0005, dt); st.pieza.rotation.z = st.giro;
        if (st.pausa > 0) {
          st.pausa -= dt; if (st.bien) { st.z -= 14 * dt; st.pieza.position.set(0, -0.5, st.z); }
          if (st.pausa <= 0) { st.i++; if (st.i >= 10) { st.fin = true; alTerminar(st.ok); return; } montar(); setHud({ n: st.i + 1, ok: st.ok }); }
          return;
        }
        st.z -= (4.5 + st.i * 1.1) * dt; st.pieza.position.set(0, -0.5, st.z);
        if (st.z <= MURO + 0.9) {
          const bien = clave(rotar(st.forma, st.rot)) === clave(st.objetivo); st.bien = bien;
          if (bien) { st.ok++; sonar('acierto'); setMsg('✅ ¡Encaja!'); ctx.chispas(new THREE.Vector3(0, 0, MURO), 0x22d3ee, 40, { fuerza: 6 }); st.muro.children.forEach((b) => { b.material = crea.neon(0x22c55e, 0.6); }); }
          else { sonar('fallo'); vibrar(100); ctx.temblor(0.5); setMsg('💥 ¡No cabe!'); ctx.chispas(new THREE.Vector3(0, -0.5, MURO + 1), 0xf97316, 40, { fuerza: 6 }); st.pieza.visible = false; }
          st.pausa = 1; setHud({ n: st.i + 1, ok: st.ok }); setTimeout(() => setMsg(null), 850);
        }
      }
    };
  }, { cielo: [0x0f0a2e, 0x1e1b4b], niebla: 45 });
  return (
    <div className="hb-caja">
      <div ref={ref} className="hb-lienzo" /><Hud izq={`🧩 Pieza ${Math.min(10, hud.n)}/10`} der={`✅ ${hud.ok}`} /><Mensaje texto={msg} />
      <Botones><Boton ancho onPulsar={() => ctl.current.girar?.(1)}>⟲ Girar</Boton><Boton ancho onPulsar={() => ctl.current.girar?.(-1)}>Girar ⟳</Boton></Botones>
    </div>
  );
}

/* ───────── Pesca rápida ───────── */
function pezModelo(color, oro) {
  const g = new THREE.Group();
  const cuerpo = crea.esfera(0.45, color, { roughness: 0.25, metalness: oro ? 0.7 : 0.05, emissive: oro ? 0x92400e : 0, emissiveIntensity: oro ? 0.5 : 0 }); cuerpo.scale.set(1.6, 0.9, 0.6); g.add(cuerpo);
  const cola = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.6, 3), cuerpo.material); cola.rotation.z = Math.PI / 2; cola.position.x = -0.85; cola.scale.z = 0.3; g.add(cola); g.userData.cola = cola;
  const aleta = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 3), cuerpo.material); aleta.position.set(0, 0.45, 0); aleta.scale.z = 0.3; g.add(aleta);
  [0.27, -0.27].forEach((z) => { const ojo = crea.esfera(0.1, 0xffffff); ojo.position.set(0.48, 0.1, z * 0.8); g.add(ojo); const p = crea.esfera(0.055, 0x0f172a); p.position.set(0.55, 0.1, z * 0.9); g.add(p); });
  return g;
}
function Pesca({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ n: 0, t: 40 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene } = ctx; const r = rng(semilla); const ANCHO = 12;
    const agua = new THREE.Mesh(new THREE.BoxGeometry(40, 7.4, 4), new THREE.MeshStandardMaterial({ color: 0x0369a1, transparent: true, opacity: 0.45, roughness: 0.1, depthWrite: false })); agua.position.set(0, -3.7, -0.5); scene.add(agua);
    const fondoMar = new THREE.Mesh(new THREE.PlaneGeometry(40, 8), new THREE.MeshBasicMaterial({ color: 0x0c4a6e })); fondoMar.position.set(0, -3.7, -2.6); scene.add(fondoMar);
    // Superficie con olas
    const geoOla = new THREE.PlaneGeometry(40, 4, 80, 4); const ola = new THREE.Mesh(geoOla, new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7, roughness: 0.05, metalness: 0.2, side: THREE.DoubleSide })); ola.rotation.x = -Math.PI / 2; ola.position.set(0, 0, -0.5); scene.add(ola);
    const arena = crea.suelo(40, 6, 0xfcd34d, { celda: 0.6, contraste: 0.05, lineas: false }); arena.position.set(0, -7.3, -0.5); scene.add(arena);
    for (let i = 0; i < 18; i++) { const h = r.entre(0.8, 2.2); const alga = crea.cilindro(0.03, 0.09, h, r.de([0x15803d, 0x22c55e, 0x65a30d]), 6); alga.position.set(r.entre(-9, 9), -7.3 + h / 2, r.entre(-2, 0.5)); alga.userData.f = r.entre(0, 6); scene.add(alga); }
    for (let i = 0; i < 8; i++) { const roca = crea.esfera(r.entre(0.3, 0.7), r.de([0x78716c, 0xf472b6, 0xfb923c])); roca.scale.y = 0.6; roca.position.set(r.entre(-9, 9), -7.2, r.entre(-2, 0.5)); scene.add(roca); }
    const burbujas = Array.from({ length: 14 }, () => { const b = new THREE.Mesh(new THREE.SphereGeometry(r.entre(0.05, 0.12), 8, 6), new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.6 })); b.position.set(r.entre(-8, 8), r.entre(-7, -0.5), -0.3); scene.add(b); return b; });
    // Barca
    const barca = new THREE.Group();
    const casco = crea.caja(2.2, 0.55, 1.1, 0xb45309); barca.add(casco);
    const franja = crea.caja(2.25, 0.12, 1.15, 0xfef3c7); franja.position.y = 0.2; barca.add(franja);
    const pescador = crea.esfera(0.26, 0xfcd34d); pescador.position.set(-0.4, 0.65, 0); barca.add(pescador);
    const gorro = crea.cilindro(0.15, 0.28, 0.2, 0xef4444); gorro.position.set(-0.4, 0.9, 0); barca.add(gorro);
    const cana = crea.cilindro(0.025, 0.04, 2, 0x451a03, 6); cana.position.set(0.2, 0.9, 0); cana.rotation.z = -0.7; barca.add(cana);
    scene.add(barca);
    const anzuelo = crea.esfera(0.16, 0xe5e7eb, { metalness: 0.9, roughness: 0.2 }); scene.add(anzuelo);
    const sedal = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0xffffff })); scene.add(sedal);
    const peces = [];
    const st = { t: 0, n: 0, x: 0, dir: 1, y: 0.3, baja: 0, preso: null, prox: 0, fin: false, lim: 6 };
    const pez = () => {
      const oro = r() < 0.15; const dir = r() < 0.5 ? 1 : -1;
      const m = pezModelo(oro ? 0xfacc15 : r.de([0xf97316, 0xec4899, 0x22c55e, 0xa855f7, 0x38bdf8]), oro); m.scale.x = dir;
      m.position.set(-(st.lim + 1.5) * dir, r.entre(-6.4, -1.4), 0); scene.add(m);
      peces.push({ m, dir, vel: r.entre(1.5, 3.4) * (oro ? 1.5 : 1), oro, f: r.entre(0, 6) });
    };
    ctx.encuadrar({ centro: [0, -3.3, 0], ancho: ANCHO, alto: 9.6, desde: [0, 0.05, 1] });
    return {
      ajustar(a) { st.lim = (Math.max(ANCHO, 9.6 * a) * 1.08) / 2 - 0.4; },
      toque() { if (!st.fin && st.baja === 0 && !st.preso) { st.baja = 1; sonar('toque', { minimo: 0 }); ctx.onda(new THREE.Vector3(st.x + 1.3, 0.05, 0), 0xffffff, { radio: 1.2 }); } },
      frame(dt, t) {
        const pos = geoOla.attributes.position; for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) * 0.9 + t * 2) * 0.08 + Math.cos(pos.getY(i) * 2 + t) * 0.05); pos.needsUpdate = true;
        scene.children.forEach((o) => { if (o.userData.f !== undefined && o.geometry?.type === 'CylinderGeometry') o.rotation.z = Math.sin(t * 1.5 + o.userData.f) * 0.15; });
        burbujas.forEach((b) => { b.position.y += dt * 0.8; if (b.position.y > -0.2) b.position.y = -7; });
        if (st.fin) return; st.t += dt; st.prox -= dt;
        if (st.prox <= 0) { pez(); st.prox = r.entre(0.5, 1.1); }
        const lim = st.lim - 1.3;
        if (st.baja === 0 && !st.preso) { st.x += st.dir * 3.2 * dt; if (Math.abs(st.x) > lim) { st.x = Math.sign(st.x) * lim; st.dir *= -1; } }
        if (st.baja === 1) { st.y -= 11 * dt; if (st.y < -6.6) st.baja = -1; }
        if (st.baja === -1) {
          st.y += 12 * dt;
          if (st.y >= 0.3) {
            st.y = 0.3; st.baja = 0;
            if (st.preso) { scene.remove(st.preso.m); st.n += st.preso.oro ? 3 : 1; sonar('acierto'); ctx.chispas(new THREE.Vector3(st.x + 1.3, 0.4, 0), st.preso.oro ? 0xfacc15 : 0x7dd3fc, 22); setMsg(st.preso.oro ? '🐠 ¡Dorado! +3' : '🐟 +1'); setTimeout(() => setMsg(null), 500); st.preso = null; }
          }
        }
        const hx = st.x + 1.3;
        barca.position.set(st.x, 0.25 + Math.sin(t * 2.4) * 0.06, 0); barca.rotation.z = Math.sin(t * 1.8) * 0.05; anzuelo.position.set(hx, st.y, 0);
        sedal.geometry.setFromPoints([new THREE.Vector3(hx, 1.6, 0), new THREE.Vector3(hx, st.y, 0)]);
        peces.forEach((p) => { p.m.userData.cola.rotation.y = Math.sin(t * 12 + p.f) * 0.5; if (p === st.preso) { p.m.position.set(hx, st.y - 0.45, 0); p.m.rotation.z = Math.PI / 2 * p.dir + Math.sin(t * 20) * 0.3; return; } p.m.position.x += p.dir * p.vel * dt; p.m.position.y += Math.sin(t * 3 + p.f) * dt * 0.3; });
        if (st.baja === 1 && !st.preso) { const p = peces.find((q) => Math.abs(q.m.position.x - hx) < 0.8 && Math.abs(q.m.position.y - st.y) < 0.5); if (p) { st.preso = p; st.baja = -1; vibrar(30); } }
        for (let i = peces.length - 1; i >= 0; i--) if (Math.abs(peces[i].m.position.x) > st.lim + 2 && peces[i] !== st.preso) { scene.remove(peces[i].m); peces.splice(i, 1); }
        if (st.t >= 40) { st.fin = true; alTerminar(st.n); }
        setHud((h) => (h.n !== st.n || h.t !== Math.ceil(40 - st.t) ? { n: st.n, t: Math.max(0, Math.ceil(40 - st.t)) } : h));
      }
    };
  }, { cielo: [0x38bdf8, 0xfde68a], niebla: false });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🎣 ${hud.n} peces`} der={`⏱️ ${hud.t}s`} /><Mensaje texto={msg} /><p className="hb-pista">Toca para echar el anzuelo</p></div>;
}

/* ───────── Trileros ───────── */
function vasoModelo() {
  const g = new THREE.Group();
  const cuerpo = crea.cilindro(0.58, 0.88, 1.5, 0xdc2626, 36, { roughness: 0.25, metalness: 0.1 }); cuerpo.position.y = 0.75; g.add(cuerpo);
  const tapa = crea.cilindro(0.58, 0.58, 0.06, 0xb91c1c, 36); tapa.position.y = 1.5; g.add(tapa);
  [0.35, 0.95].forEach((y) => { const f = crea.cilindro(0.88 - y * 0.2 + 0.015, 0.88 - y * 0.2 + 0.03, 0.14, 0xffffff, 36); f.position.y = y; g.add(f); });
  const borde = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.05, 8, 40), mat2(0xfacc15)); borde.rotation.x = Math.PI / 2; borde.position.y = 0.03; g.add(borde);
  return g;
}
const mat2 = (c) => new THREE.MeshStandardMaterial({ color: c, metalness: 0.8, roughness: 0.25 });
function Trileros({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ ronda: 1, ok: 0, txt: 'Mira dónde está la bola' }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene } = ctx; const r = rng(semilla); const X = [-2.5, 0, 2.5];
    const suelo = crea.suelo(40, 40, 0x292524, { celda: 1.5, contraste: 0.04 }); suelo.position.y = -1.6; scene.add(suelo);
    const mesa = crea.caja(10, 0.3, 5.4, 0x15803d, { roughness: 0.95 }); mesa.position.y = -0.15; scene.add(mesa);
    const madera = crea.caja(10.8, 0.4, 6.2, 0x78350f, { roughness: 0.5 }); madera.position.y = -0.3; scene.add(madera);
    const oro = crea.marco(10.3, 5.7, 0xfacc15, { intensidad: 0.5, grosor: 0.1 }); oro.position.y = 0.02; scene.add(oro);
    const foco = new THREE.SpotLight(0xfff7e0, 60, 20, 0.6, 0.5); foco.position.set(0, 8, 2); foco.target.position.set(0, 0, 0); scene.add(foco, foco.target);
    const vasos = X.map((x) => { const v = vasoModelo(); v.position.set(x, 0, 0); scene.add(v); return { m: v, pos: x }; });
    const bola = crea.esfera(0.32, 0xfacc15, { metalness: 0.6, roughness: 0.15, emissive: 0xb45309, emissiveIntensity: 0.4 }); bola.position.y = 0.32; scene.add(bola);
    const st = { ronda: 0, ok: 0, con: 0, fase: 'mostrar', t: 0, swaps: [], si: 0, prog: 0, fin: false, elegido: -1 };
    const preparar = () => {
      st.con = r.entero(0, 2); st.fase = 'mostrar'; st.t = 0; st.elegido = -1;
      const n = 3 + st.ronda * 2; st.swaps = Array.from({ length: n }, () => { const a = r.entero(0, 2); let b; do { b = r.entero(0, 2); } while (b === a); return [a, b]; });
      st.si = 0; st.prog = 0; setHud({ ronda: st.ronda + 1, ok: st.ok, txt: 'Mira dónde está la bola' });
    };
    preparar();
    ctx.encuadrar({ centro: [0, 0.4, 0.2], ancho: 8.6, alto: 5, desde: [0, 0.85, 0.85] });
    const elegibles = () => vasos.map((v) => v.m);
    return {
      toque(e) {
        if (st.fase !== 'elegir' || st.fin) return;
        const t = tocado(ctx, e, elegibles()); if (!t) return;
        const k = vasos.findIndex((v) => v.m === t.obj); const bien = k === st.con;
        if (bien) { st.ok++; sonar('acierto'); setMsg('✅ ¡Ahí estaba!'); ctx.chispas(new THREE.Vector3(vasos[k].pos, 0.6, 0), 0xfacc15, 30, { fuerza: 5 }); } else { sonar('fallo'); ctx.temblor(0.2); setMsg('❌ ¡No!'); }
        st.fase = 'revelar'; st.t = 0; st.elegido = k; setHud((h) => ({ ...h, ok: st.ok }));
      },
      frame(dt, t) {
        st.t += dt;
        if (st.fase !== 'mezclar') vasos.forEach((v) => { v.m.position.x += (v.pos - v.m.position.x) * Math.min(1, dt * 30); v.m.position.z *= 0.8; });
        if (st.fase === 'mostrar') {
          const sube = st.t < 1.5 ? Math.min(1, st.t * 4) : Math.max(0, 1 - (st.t - 1.5) * 4);
          vasos.forEach((v) => { v.m.position.y = sube * 1.6; v.m.rotation.z = sube * 0.15; });
          if (st.t > 1.8) { st.fase = 'mezclar'; st.t = 0; setHud((h) => ({ ...h, txt: 'Mezclando…' })); }
        }
        if (st.fase === 'mezclar') {
          const dur = Math.max(0.17, 0.45 - st.ronda * 0.05); st.prog += dt / dur;
          const [a, b] = st.swaps[st.si]; const va = vasos[a]; const vb = vasos[b];
          if (va.base === undefined) { va.base = va.pos; vb.base = vb.pos; }
          const u = Math.min(1, st.prog); const s = u * u * (3 - 2 * u);
          va.m.position.x = va.base + (vb.base - va.base) * s; vb.m.position.x = vb.base + (va.base - vb.base) * s;
          va.m.position.z = Math.sin(u * Math.PI) * 1.1; vb.m.position.z = -Math.sin(u * Math.PI) * 1.1;
          if (u >= 1) { const pa = va.base; va.pos = vb.base; vb.pos = pa; delete va.base; delete vb.base; va.m.position.z = 0; vb.m.position.z = 0; st.prog = 0; st.si++; sonar('tic', { minimo: 0, vibrar: false }); if (st.si >= st.swaps.length) { st.fase = 'elegir'; setHud((h) => ({ ...h, txt: '¿Dónde está?' })); } }
        }
        if (st.fase === 'elegir') vasos.forEach((v) => { v.m.position.y = Math.abs(Math.sin(t * 3 + v.pos)) * 0.05; });
        if (st.fase === 'revelar') {
          const sube = Math.min(1, st.t * 4);
          vasos.forEach((v, k) => { const arriba = k === st.con || k === st.elegido; v.m.position.y = arriba ? sube * 1.6 : 0; v.m.rotation.z = arriba ? sube * 0.15 : 0; });
          if (st.t > 1.4) { setMsg(null); vasos.forEach((v) => { v.m.position.y = 0; v.m.rotation.z = 0; }); st.ronda++; if (st.ronda >= 6) { st.fin = true; alTerminar(st.ok); st.fase = 'fin'; } else preparar(); }
        }
        // La bola va debajo de su vaso y solo se ve cuando está levantado
        const vc = vasos[st.con].m; bola.position.set(vc.position.x, 0.32, vc.position.z);
        bola.visible = (st.fase === 'mostrar' || st.fase === 'revelar') && vc.position.y > 0.5;
      }
    };
  }, { cielo: [0x1c1917, 0x0c0a09], niebla: 40, exposicion: 1.15 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🥤 Ronda ${hud.ronda}/6 · ✅ ${hud.ok}`} der={hud.txt} /><Mensaje texto={msg} /></div>;
}

/* ───────── Dedo veloz ───────── */
function Veloz({ alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ n: 0, t: 10, empezado: false });
  useEscena(ref, (ctx) => {
    const { scene } = ctx; const r = rng(7);
    const suelo = crea.suelo(40, 40, 0xfbcfe8, { celda: 1, contraste: 0.04 }); suelo.position.y = -2.5; scene.add(suelo);
    const globo = new THREE.Group(); const piel = crea.esfera(0.6, 0xef4444, { roughness: 0.15, metalness: 0.05 }); globo.add(piel);
    const brillo = crea.esfera(0.12, 0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.8 }); brillo.position.set(-0.22, 0.25, 0.45); brillo.scale.set(1, 1.4, 0.5); globo.add(brillo);
    scene.add(globo);
    const nudo = crea.cilindro(0.04, 0.12, 0.2, 0xb91c1c); scene.add(nudo);
    const hilo = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0xffffff })); scene.add(hilo);
    const inflador = new THREE.Group(); const tubo = crea.cilindro(0.35, 0.35, 1.6, 0x3b82f6); tubo.position.y = -1.7; inflador.add(tubo);
    const vastago = crea.cilindro(0.06, 0.06, 1, 0xd1d5db, 8, { metalness: 0.9 }); inflador.add(vastago);
    const asa = crea.caja(0.9, 0.12, 0.2, 0x1e293b); inflador.add(asa); inflador.position.x = 1.6; scene.add(inflador);
    const fondo = Array.from({ length: 10 }, () => { const b = crea.esfera(r.entre(0.25, 0.45), r.de([0xf472b6, 0xa78bfa, 0x60a5fa, 0xfacc15, 0x34d399])); b.position.set(r.entre(-6, 6), r.entre(-1, 5), r.entre(-6, -3)); b.userData.f = r.entre(0, 6); scene.add(b); return b; });
    const st = { n: 0, t: 0, empezado: false, fin: false, escala: 1, bomba: 0 };
    ctx.encuadrar({ centro: [0, 1, 0], ancho: 5, alto: 7.4, desde: [0, 0.1, 1] });
    return {
      toque() {
        if (st.fin) return; st.empezado = true; st.n++; st.escala = 1 + st.n * 0.03; st.bomba = 1; sonar('toque', { minimo: 0, vibrar: false }); vibrar(5);
        if (st.n % 10 === 0) ctx.onda(new THREE.Vector3(0, globo.position.y, 0), 0xffffff, { radio: 2, eje: 'z' });
      },
      frame(dt, t) {
        if (st.empezado && !st.fin) {
          st.t += dt;
          if (st.t >= 10) { st.fin = true; sonar('victoria'); globo.visible = false; ctx.chispas(globo.position.clone(), 0xef4444, 50, { fuerza: 7, tam: 0.14 }); ctx.chispas(globo.position.clone(), 0xfacc15, 30, { fuerza: 6 }); ctx.temblor(0.4); alTerminar(st.n); }
        }
        const e = piel.scale.x + (Math.min(3.2, st.escala) - piel.scale.x) * 0.3; piel.scale.set(e, e * 1.12, e); brillo.position.set(-0.22 * e, 0.25 * e, 0.45 * e);
        globo.position.y = 0.2 + 0.67 * e; globo.rotation.z = Math.sin(t * 2) * 0.05;
        const yNudo = globo.position.y - 0.67 * e; nudo.position.y = yNudo; hilo.geometry.setFromPoints([new THREE.Vector3(0, yNudo, 0), new THREE.Vector3(0.6, -0.6, 0), new THREE.Vector3(1.6, -0.9, 0)]);
        st.bomba = Math.max(0, st.bomba - dt * 8); vastago.position.y = -0.4 + st.bomba * -0.5 + 0.5; asa.position.y = vastago.position.y + 0.5;
        fondo.forEach((b) => { b.position.y += Math.sin(t + b.userData.f) * dt * 0.2; });
        setHud((h) => (h.n !== st.n || h.t !== Math.ceil(10 - st.t) ? { n: st.n, t: Math.max(0, Math.ceil(10 - st.t)), empezado: st.empezado } : h));
      }
    };
  }, { cielo: [0xfbcfe8, 0xfdf2f8], niebla: 30 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`👆 ${hud.n} toques`} der={hud.empezado ? `⏱️ ${hud.t}s` : 'Empieza al primer toque'} /><p className="hb-pista">¡Toca sin parar para inflar el globo!</p></div>;
}

export default [
  { id: 'stroop', nombre: 'Colores traicioneros', emoji: '🎨', como: 'Sale el nombre de un color pintado de otro color. Toca el color de la TINTA, no lo que pone. +1 si aciertas, −1 si fallas. 30 segundos.', mejor: 'mas', unidad: 'pts', duracion: 30, C: Stroop },
  { id: 'encajar', nombre: 'Encaja la pieza', emoji: '🧩', como: 'La pieza avanza hacia un muro con un hueco. Gírala (⟲ ⟳) para que pase justo por el hueco. Diez piezas, cada vez más rápidas.', mejor: 'mas', unidad: 'piezas', duracion: 60, C: Encajar },
  { id: 'pesca', nombre: 'Pesca rápida', emoji: '🎣', como: 'La barca va de lado a lado: toca para echar el anzuelo justo cuando pase un pez. Los dorados valen 3. 40 segundos.', mejor: 'mas', unidad: 'peces', duracion: 40, C: Pesca },
  { id: 'trileros', nombre: 'Trileros', emoji: '🥤', como: 'Fíjate en qué vaso está la bola. Se mezclan cada vez más rápido: después, toca el vaso correcto. Seis rondas.', mejor: 'mas', unidad: 'aciertos', duracion: 75, C: Trileros },
  { id: 'veloz', nombre: 'Dedo veloz', emoji: '👆', como: 'Toca la pantalla lo más rápido que puedas durante 10 segundos para inflar el globo.', mejor: 'mas', unidad: 'toques', duracion: 25, C: Veloz }
];
