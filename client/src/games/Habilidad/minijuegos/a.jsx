// Minijuegos (1/6): cruzar la carretera, torre de bloques, memoria de luces, semáforo y tiro al blanco.
import React, { useRef, useState } from 'react';
import { useEscena, rng, crea, tocado, THREE, mat } from '../tres.js';
import { Hud, Botones, Boton, Mensaje } from '../comun.jsx';
import { sonar, vibrar } from '../../../lib/sonido.js';

/* ───────── Piezas ───────── */
function pollito() {
  const g = new THREE.Group();
  const cuerpo = crea.caja(0.62, 0.58, 0.66, 0xfde047); cuerpo.position.y = 0.42; g.add(cuerpo);
  const ala = (x) => { const a = crea.caja(0.08, 0.28, 0.36, 0xfacc15); a.position.set(x, 0.42, 0.02); g.add(a); };
  ala(-0.34); ala(0.34);
  const cresta = crea.caja(0.14, 0.18, 0.3, 0xef4444); cresta.position.set(0, 0.78, 0.02); g.add(cresta);
  const pico = crea.caja(0.2, 0.12, 0.18, 0xf97316); pico.position.set(0, 0.5, -0.4); g.add(pico);
  [-0.17, 0.17].forEach((x) => { const o = crea.esfera(0.06, 0x111827); o.position.set(x, 0.58, -0.33); g.add(o); const b = crea.esfera(0.022, 0xffffff); b.position.set(x + 0.02, 0.6, -0.385); g.add(b); });
  [-0.14, 0.14].forEach((x) => { const p = crea.caja(0.08, 0.16, 0.08, 0xf97316); p.position.set(x, 0.08, 0); g.add(p); });
  return g;
}
function coche(color, largo) {
  const g = new THREE.Group();
  const carroceria = crea.caja(largo, 0.42, 0.78, color); carroceria.position.y = 0.36; g.add(carroceria);
  const cabina = crea.caja(largo * 0.5, 0.34, 0.68, 0xe2e8f0, { roughness: 0.1, metalness: 0.3 }); cabina.position.set(-largo * 0.05, 0.72, 0); g.add(cabina);
  const techo = crea.caja(largo * 0.46, 0.08, 0.66, color); techo.position.set(-largo * 0.05, 0.9, 0); g.add(techo);
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) => {
    const r = crea.cilindro(0.17, 0.17, 0.14, 0x111827, 18); r.rotation.x = Math.PI / 2; r.position.set(sx * largo * 0.32, 0.17, sz * 0.38); g.add(r);
  });
  [-0.24, 0.24].forEach((z) => { const f = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), crea.neon(0xfef9c3, 2)); f.position.set(largo / 2 + 0.01, 0.4, z); g.add(f); });
  return g;
}
function arbol(r) {
  const g = new THREE.Group();
  const tronco = crea.cilindro(0.1, 0.14, 0.5, 0x7c4a1e, 10); tronco.position.y = 0.25; g.add(tronco);
  const verde = r.de([0x15803d, 0x16a34a, 0x22c55e]);
  const copa = crea.esfera(0.45, verde); copa.position.y = 0.8; copa.scale.y = 1.1; g.add(copa);
  const copa2 = crea.esfera(0.32, verde); copa2.position.set(0.12, 1.15, 0.05); g.add(copa2);
  return g;
}

/* ───────── Cruza la carretera ───────── */
function Cruzar({ semilla, alTerminar }) {
  const ref = useRef(null); const ctl = useRef({}); const [hud, setHud] = useState({ carril: 0, t: 60 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla);
    const coches = [];
    for (let i = 0; i < 90; i++) {
      const hierba = i < 2 || r() < 0.28; const z = -i;
      const suelo = crea.caja(16, 0.24, 1, hierba ? (i % 2 ? 0x4ade80 : 0x3fca73) : 0x334155); suelo.position.set(0, -0.12, z); scene.add(suelo);
      const c = { hierba, dir: r() < 0.5 ? -1 : 1, vel: r.entre(2.2, 3.5) + i * 0.045 };
      if (!hierba) {
        for (let x = -7; x <= 7; x += 1.4) { const raya = crea.caja(0.6, 0.012, 0.06, 0xfef3c7); raya.position.set(x, 0.006, z - 0.48); scene.add(raya); }
        const n = r.entero(1, 3); let x = r.entre(-9, -5);
        for (let k = 0; k < n; k++) {
          const largo = r.entre(1.3, 2.3); const m = coche(r.de([0xef4444, 0x3b82f6, 0xf59e0b, 0xa855f7, 0xf8fafc, 0x06b6d4, 0x10b981]), largo);
          if (c.dir < 0) m.rotation.y = Math.PI;
          m.position.set(x, 0, z); scene.add(m); coches.push({ m, carril: i, largo, c });
          x += largo + r.entre(2.5, 5.5);
        }
      } else if (i > 1) {
        for (let k = 0; k < 3; k++) { const a = arbol(r); a.position.set(r.de([-7, -6, -5.2, 5.2, 6, 7]), 0, z + r.entre(-0.2, 0.2)); a.scale.setScalar(r.entre(0.8, 1.15)); scene.add(a); }
        if (r() < 0.4) { const flor = crea.esfera(0.08, r.de([0xf472b6, 0xfacc15, 0xffffff])); flor.position.set(r.entre(-4, 4), 0.05, z); scene.add(flor); }
      }
    }
    const pollo = pollito(); scene.add(pollo);
    const st = { carril: 0, x: 0, max: 0, t: 0, salto: 0, fin: false };
    const acabar = () => { if (st.fin) return; st.fin = true; vibrar(150); sonar('fallo'); ctx.temblor(0.5); ctx.chispas(pollo.position.clone().setY(0.5), 0xfde047, 30); pollo.scale.set(1.4, 0.25, 1.4); setMsg('💥 ¡Atropellado!'); setTimeout(() => alTerminar(st.max), 900); };
    const mover = (dc, dx) => {
      if (st.fin) return; st.carril = Math.max(0, st.carril + dc); st.x = Math.max(-5, Math.min(5, st.x + dx)); st.salto = 1;
      if (st.carril > st.max) { st.max = st.carril; if (st.max % 10 === 0) { ctx.chispas(new THREE.Vector3(st.x, 0.6, -st.carril), 0x22c55e, 16); sonar('acierto', { minimo: 0 }); } }
      pollo.rotation.y = dx < 0 ? Math.PI / 2 : dx > 0 ? -Math.PI / 2 : 0;
      sonar('toque', { minimo: 0 });
    };
    ctl.current = { mover };
    return {
      toque: () => mover(1, 0),
      frame(dt) {
        if (!st.fin) st.t += dt;
        coches.forEach((k) => { k.m.position.x += k.c.dir * k.c.vel * dt; if (k.m.position.x > 11) k.m.position.x -= 22; if (k.m.position.x < -11) k.m.position.x += 22; });
        st.salto = Math.max(0, st.salto - dt * 6);
        pollo.position.x += (st.x - pollo.position.x) * 0.4; pollo.position.z += (-st.carril - pollo.position.z) * 0.4;
        if (!st.fin) { pollo.position.y = Math.sin(st.salto * Math.PI) * 0.45; const sq = 1 - Math.sin(st.salto * Math.PI) * 0.15; pollo.scale.set(1, 1 / sq, 1); }
        if (!st.fin) {
          const golpe = coches.some((k) => k.carril === st.carril && Math.abs(k.m.position.x - st.x) < k.largo / 2 + 0.3);
          if (golpe) acabar();
          if (st.t >= 60) { st.fin = true; alTerminar(st.max); }
        }
        // Cámara: más alta y lejos si la pantalla es estrecha (móvil en vertical)
        const k = ctx.ancho(0.9);
        camera.position.x += (pollo.position.x * 0.3 + 1.6 * k - camera.position.x) * 0.1; camera.position.y = 6.5 * Math.sqrt(k);
        camera.position.z += (pollo.position.z + 5 * k - camera.position.z) * 0.1;
        camera.lookAt(pollo.position.x * 0.3, 0, pollo.position.z - 2.5);
        ctx.seguirSol(pollo.position.x, pollo.position.z);
        setHud((h) => (h.carril !== st.max || h.t !== Math.ceil(60 - st.t) ? { carril: st.max, t: Math.max(0, Math.ceil(60 - st.t)) } : h));
      }
    };
  }, { fondo: 0x7dd3fc, niebla: 30 });
  return (
    <div className="hb-caja">
      <div ref={ref} className="hb-lienzo" />
      <Hud izq={`🐔 ${hud.carril} carriles`} der={`⏱️ ${hud.t}s`} />
      <Mensaje texto={msg} tipo="mal" />
      <Botones><Boton onPulsar={() => ctl.current.mover?.(0, -1)}>◀</Boton><Boton ancho onPulsar={() => ctl.current.mover?.(1, 0)}>▲ Avanzar</Boton><Boton onPulsar={() => ctl.current.mover?.(0, 1)}>▶</Boton></Botones>
    </div>
  );
}

/* ───────── Torre de bloques ───────── */
function Apilar({ semilla, alTerminar }) {
  const ref = useRef(null); const [n, setN] = useState(0); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla); const H = 0.5;
    const base = crea.caja(3, 2, 3, 0x1e293b, { roughness: 0.5, metalness: 0.3 }); base.position.y = -1; scene.add(base);
    const brillo = crea.marco(3, 3, 0x8b5cf6); brillo.position.y = -0.02; scene.add(brillo);
    // Estrellas al fondo
    const estrellas = new THREE.Group();
    for (let i = 0; i < 160; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.04 + r() * 0.05, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff })); const a = r() * Math.PI * 2; const d = r.entre(25, 40); s.position.set(Math.cos(a) * d, r.entre(-5, 45), Math.sin(a) * d); estrellas.add(s); }
    scene.add(estrellas);
    const color = (k) => new THREE.Color().setHSL(((semilla % 360) / 360 + k * 0.035) % 1, 0.75, 0.58).getHex();
    let top = { x: 0, z: 0, w: 3, d: 3 };
    const st = { n: 0, eje: 'x', pos: -6, dir: 1, vel: 3.2, fin: false, actual: null, caidas: [], t: 0, racha: 0 };
    const bloque = (w, d, c) => crea.caja(w, H, d, c, { roughness: 0.25, metalness: 0.1, envMapIntensity: 1 });
    const nuevo = () => {
      st.eje = st.n % 2 ? 'z' : 'x'; st.pos = r() < 0.5 ? -6 : 6; st.dir = st.pos < 0 ? 1 : -1;
      const m = bloque(top.w, top.d, color(st.n)); m.position.set(top.x, st.n * H + H / 2, top.z); scene.add(m); st.actual = m;
    };
    nuevo();
    const soltar = () => {
      if (st.fin) return;
      const m = st.actual; const a = st.eje; const tam = a === 'x' ? top.w : top.d;
      const delta = m.position[a] - top[a];
      if (Math.abs(delta) >= tam) { // falla del todo
        st.fin = true; sonar('fallo'); ctx.temblor(0.4); setMsg('💥 ¡Fuera!'); st.caidas.push({ m, vy: 0, giro: 2 }); setTimeout(() => alTerminar(st.n), 1000); return;
      }
      if (Math.abs(delta) < 0.12) {
        m.position[a] = top[a]; st.racha++; setMsg(st.racha > 1 ? `✨ ¡Perfecto ×${st.racha}!` : '✨ ¡Perfecto!'); sonar('acierto'); setTimeout(() => setMsg(null), 600);
        ctx.onda(new THREE.Vector3(top.x, m.position.y - H / 2 + 0.02, top.z), 0xffffff, { radio: Math.max(top.w, top.d) * 0.9 });
        ctx.chispas(new THREE.Vector3(top.x, m.position.y, top.z), color(st.n), 16);
      } else {
        st.racha = 0;
        const queda = tam - Math.abs(delta);
        const nuevoCentro = top[a] + delta / 2;
        const corte = bloque(a === 'x' ? Math.abs(delta) : top.w, a === 'z' ? Math.abs(delta) : top.d, color(st.n));
        corte.position.copy(m.position); corte.position[a] = nuevoCentro + Math.sign(delta) * (queda / 2 + Math.abs(delta) / 2);
        scene.add(corte); st.caidas.push({ m: corte, vy: 0, giro: Math.sign(delta) });
        scene.remove(m);
        const recortado = bloque(a === 'x' ? queda : top.w, a === 'z' ? queda : top.d, color(st.n)); recortado.position.copy(m.position); recortado.position[a] = nuevoCentro; scene.add(recortado); st.actual = recortado;
        if (a === 'x') top.w = queda; else top.d = queda;
        sonar('toque', { minimo: 0 });
      }
      top = { ...top, x: st.actual.position.x, z: st.actual.position.z };
      st.n += 1; setN(st.n); st.vel = Math.min(9, st.vel + 0.25); nuevo();
    };
    return {
      toque: soltar,
      frame(dt, t) {
        st.t += dt; if (!st.fin && st.t > 90) { st.fin = true; alTerminar(st.n); }
        if (!st.fin) { st.pos += st.dir * st.vel * dt; if (Math.abs(st.pos) > 6) { st.dir *= -1; st.pos = Math.sign(st.pos) * 6; } st.actual.position[st.eje] = top[st.eje] + st.pos; }
        st.caidas.forEach((c) => { c.vy -= 20 * dt; c.m.position.y += c.vy * dt; c.m.rotation.x += dt * c.giro; c.m.rotation.z += dt * c.giro * 0.5; });
        estrellas.rotation.y = t * 0.02;
        const y = st.n * H; const k = ctx.ancho(1);
        camera.position.set(8 * k, camera.position.y + (8 * k * 0.9 + y - camera.position.y) * 0.08, 8 * k); camera.lookAt(0, y - 0.6, 0);
        ctx.sol.position.set(6, y + 14, 8); ctx.sol.target.position.set(0, y, 0);
      }
    };
  }, { cielo: [0x312e81, 0x0b1026], niebla: 70 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🧱 ${n} pisos`} der="Toca para soltar" /><Mensaje texto={msg} /></div>;
}

/* ───────── Memoria de luces ───────── */
function Secuencia({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ nivel: 1, texto: 'Mira…' }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene } = ctx; const r = rng(semilla);
    const COL = [0xef4444, 0xf97316, 0xfacc15, 0x22c55e, 0x06b6d4, 0x3b82f6, 0x8b5cf6, 0xec4899, 0xf8fafc];
    const placa = crea.caja(6.6, 0.4, 6.6, 0x0f172a, { roughness: 0.3, metalness: 0.5 }); placa.position.y = -0.35; scene.add(placa);
    const borde = crea.marco(6.6, 6.6, 0x6366f1, { intensidad: 1.6 }); borde.position.y = -0.14; scene.add(borde);
    const pads = COL.map((c, i) => {
      const m = crea.caja(1.75, 0.3, 1.75, c, { emissive: c, emissiveIntensity: 0.06, roughness: 0.15, metalness: 0.1 });
      m.position.set((i % 3 - 1) * 2.05, 0, (Math.floor(i / 3) - 1) * 2.05); scene.add(m);
      const luz = new THREE.PointLight(c, 0, 4); luz.position.set(m.position.x, 1.2, m.position.z); scene.add(luz); m.userData.luz = luz;
      return m;
    });
    const seq = Array.from({ length: 15 }, () => r.entero(0, 8));
    const st = { nivel: 1, fase: 'mostrar', i: 0, reloj: 0.8, luz: [], pos: 0, fin: false };
    const encender = (k, dur = 0.35) => { st.luz[k] = dur; sonar('tic', { minimo: 0, vibrar: false }); };
    ctx.encuadrar({ centro: [0, 0, 0], ancho: 7.2, alto: 7.2, desde: [0, 1, 0.42] });
    return {
      toque(e) {
        if (st.fase !== 'turno' || st.fin) return;
        const t = tocado(ctx, e, pads); if (!t) return;
        const k = pads.indexOf(t.obj); encender(k, 0.25);
        if (k !== seq[st.pos]) { st.fin = true; sonar('fallo'); ctx.temblor(0.35); setMsg('❌ ¡Fallo!'); setTimeout(() => alTerminar(st.nivel - 1), 900); return; }
        st.pos += 1;
        if (st.pos >= st.nivel) {
          if (st.nivel >= 15) { st.fin = true; alTerminar(15); return; }
          ctx.chispas(new THREE.Vector3(0, 0.6, 0), 0xffffff, 20, { fuerza: 5 });
          st.nivel += 1; st.fase = 'mostrar'; st.i = 0; st.reloj = 0.9; setHud({ nivel: st.nivel, texto: 'Mira…' }); sonar('acierto');
        }
      },
      frame(dt) {
        pads.forEach((p, k) => {
          st.luz[k] = Math.max(0, (st.luz[k] || 0) - dt); const on = st.luz[k] > 0;
          p.material.emissiveIntensity += ((on ? 2.2 : 0.06) - p.material.emissiveIntensity) * Math.min(1, dt * 20);
          p.userData.luz.intensity = on ? 6 : 0; p.position.y += ((on ? 0.14 : 0) - p.position.y) * Math.min(1, dt * 18);
        });
        if (st.fase === 'mostrar') {
          st.reloj -= dt;
          if (st.reloj <= 0) {
            if (st.i < st.nivel) { encender(seq[st.i], Math.max(0.22, 0.4 - st.nivel * 0.015)); st.i += 1; st.reloj = Math.max(0.33, 0.6 - st.nivel * 0.02); } else { st.fase = 'turno'; st.pos = 0; setHud({ nivel: st.nivel, texto: '¡Tu turno!' }); }
          }
        }
      }
    };
  }, { cielo: [0x1e1b4b, 0x020617], niebla: false });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`💡 Nivel ${hud.nivel}`} der={hud.texto} /><Mensaje texto={msg} tipo="mal" /></div>;
}

/* ───────── Semáforo (reflejos) ───────── */
function halo(color) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); const col = `#${new THREE.Color(color).getHexString()}`;
  g.addColorStop(0, col); g.addColorStop(0.35, `${col}aa`); g.addColorStop(1, `${col}00`); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  s.scale.setScalar(2.6); return s;
}
function Semaforo({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ ronda: 1, ultimo: null }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene } = ctx; const r = rng(semilla);
    const suelo = crea.suelo(40, 40, 0x334155, { celda: 1.5 }); suelo.position.y = -2.4; scene.add(suelo);
    const caja = crea.caja(1.7, 4.6, 1.1, 0x111827, { roughness: 0.4, metalness: 0.3 }); caja.position.y = 2.4; scene.add(caja);
    const marco = crea.caja(2.05, 4.95, 0.1, 0x1f2937); marco.position.set(0, 2.4, -0.58); scene.add(marco); const franja = crea.marco(2.05, 4.95, 0xfacc15, { intensidad: 0.4, grosor: 0.08 }); franja.rotation.x = Math.PI / 2; franja.position.set(0, 2.4, -0.62); scene.add(franja);
    const poste = crea.cilindro(0.16, 0.2, 4.8, 0x475569, 16); poste.position.set(0, 0, 0); scene.add(poste);
    const luces = [0xef4444, 0xf59e0b, 0x22c55e].map((c, i) => {
      const y = 3.85 - i * 1.45;
      const visera = crea.cilindro(0.62, 0.62, 0.5, 0x0b0f19, 24, { side: THREE.DoubleSide }); visera.rotation.x = Math.PI / 2; visera.position.set(0, y, 0.75); scene.add(visera);
      const m = crea.esfera(0.52, c, { emissive: c, emissiveIntensity: 0.04, roughness: 0.15 }); m.position.set(0, y, 0.5); scene.add(m);
      const h = halo(c); h.position.set(0, y, 0.9); h.visible = false; scene.add(h);
      const luz = new THREE.PointLight(c, 0, 8); luz.position.set(0, y, 1.6); scene.add(luz);
      return { m, h, luz };
    });
    const esperas = Array.from({ length: 5 }, () => r.entre(1.4, 3.8));
    const st = { ronda: 0, fase: 'roja', t: 0, tiempos: [], fin: false };
    const pon = (k) => luces.forEach((l, i) => { const on = i === k; l.m.material.emissiveIntensity = on ? 2.4 : 0.04; l.h.visible = on; l.luz.intensity = on ? 12 : 0; });
    pon(0);
    ctx.encuadrar({ centro: [0, 1.8, 0], ancho: 4.5, alto: 7.5, desde: [0.15, 0.05, 1] });
    const siguiente = () => { if (st.tiempos.length >= 5) { st.fin = true; const media = st.tiempos.reduce((a, b) => a + b, 0) / 5; setTimeout(() => alTerminar(Math.round(media)), 900); return; } st.ronda = st.tiempos.length; st.fase = 'roja'; st.t = 0; pon(0); setHud({ ronda: st.ronda + 1, ultimo: st.tiempos.at(-1) }); };
    return {
      toque() {
        if (st.fin || st.fase === 'pausa') return;
        if (st.fase === 'roja' || st.fase === 'ambar') { st.tiempos.push(1000); sonar('fallo'); ctx.temblor(0.3); setMsg('🚫 ¡Antes de tiempo! +1000 ms'); st.fase = 'pausa'; setTimeout(() => { setMsg(null); siguiente(); }, 1200); return; }
        const ms = Math.round(st.t * 1000); st.tiempos.push(ms); sonar('acierto'); ctx.chispas(new THREE.Vector3(0, 0.95, 1), 0x22c55e, 26, { fuerza: 5 }); setMsg(`⚡ ${ms} ms`); st.fase = 'pausa'; setTimeout(() => { setMsg(null); siguiente(); }, 1000);
      },
      frame(dt) {
        st.t += dt;
        if (st.fase === 'roja' && st.t > esperas[st.ronda] - 0.5) { st.fase = 'ambar'; pon(1); }
        if (st.fase === 'ambar' && st.t > esperas[st.ronda]) { st.fase = 'verde'; st.t = 0; pon(2); }
      }
    };
  }, { cielo: [0x1e293b, 0x020617], niebla: 40 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🚦 Ronda ${hud.ronda}/5`} der={hud.ultimo != null ? `Último: ${hud.ultimo} ms` : 'Toca en verde'} /><Mensaje texto={msg} /></div>;
}

/* ───────── Tiro al blanco ───────── */
const ANILLOS = [[1, 0xf8fafc], [0.8, 0x0f172a], [0.6, 0x3b82f6], [0.4, 0xef4444], [0.2, 0xfacc15]];
function Diana({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ pts: 0, t: 30 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene } = ctx; const r = rng(semilla);
    const pared = crea.caja(14, 10, 0.4, 0x3f2a1d, { roughness: 0.9 }); pared.position.set(0, 3, -0.7); scene.add(pared);
    for (let k = 0; k < 9; k++) { const tabla = crea.caja(14, 1.08, 0.2, k % 2 ? 0xc2853f : 0xb87333, { roughness: 0.85 }); tabla.position.set(0, -1.6 + k * 1.15, -0.45); scene.add(tabla); }
    const suelo = crea.suelo(30, 20, 0x78350f, { celda: 1 }); suelo.position.y = -2; scene.add(suelo);
    const st = { t: 0, pts: 0, prox: 0.3, dianas: [], fin: false };
    const R = 0.8;
    const crear = () => {
      const g = new THREE.Group();
      ANILLOS.forEach(([k, c], i) => { const d = new THREE.Mesh(new THREE.CylinderGeometry(R * k, R * k, 0.12 + i * 0.015, 40), mat(c, { roughness: 0.5 })); d.rotation.x = Math.PI / 2; d.position.z = i * 0.012; d.castShadow = true; g.add(d); });
      const pata = crea.cilindro(0.05, 0.05, 0.8, 0x78350f, 8); pata.position.set(0, -R - 0.3, -0.1); g.add(pata);
      g.position.set(r.entre(-2.9, 2.9), r.entre(0.6, 5.2), 0); g.scale.setScalar(0.01); scene.add(g);
      st.dianas.push({ g, vida: Math.max(0.85, 1.45 - st.t * 0.02), edad: 0 });
    };
    ctx.encuadrar({ centro: [0, 2.9, 0], ancho: 7.6, alto: 7.4, desde: [0, 0.02, 1] });
    return {
      toque(e) {
        if (st.fin) return;
        const t = tocado(ctx, e, st.dianas.map((d) => d.g));
        if (!t) { st.pts = Math.max(0, st.pts - 1); sonar('fallo', { vibrar: false }); setMsg('−1'); setTimeout(() => setMsg(null), 300); return; }
        const d = st.dianas.find((x) => x.g === t.obj); const dist = Math.hypot(t.punto.x - d.g.position.x, t.punto.y - d.g.position.y) / (R * d.g.scale.x);
        const p = dist < 0.22 ? 5 : dist < 0.42 ? 3 : dist < 0.62 ? 2 : 1; st.pts += p;
        setMsg(p === 5 ? '🎯 ¡Centro! +5' : `+${p}`); setTimeout(() => setMsg(null), 320); sonar(p === 5 ? 'victoria' : 'acierto', { minimo: 0, vibrar: false });
        ctx.chispas(t.punto.clone().setZ(0.3), p >= 3 ? 0xfacc15 : 0xffffff, p * 6 + 8, { fuerza: 4.5 });
        scene.remove(d.g); st.dianas = st.dianas.filter((x) => x !== d);
      },
      frame(dt) {
        if (st.fin) return;
        st.t += dt; st.prox -= dt;
        if (st.prox <= 0) { crear(); st.prox = Math.max(0.35, 0.75 - st.t * 0.012); }
        st.dianas.forEach((d) => { d.edad += dt; const k = d.edad < 0.15 ? d.edad / 0.15 : d.edad > d.vida - 0.15 ? Math.max(0.01, (d.vida - d.edad) / 0.15) : 1; d.g.scale.setScalar(Math.max(0.01, k)); d.g.rotation.y = (1 - k) * 1.2; });
        st.dianas.filter((d) => d.edad >= d.vida).forEach((d) => scene.remove(d.g)); st.dianas = st.dianas.filter((d) => d.edad < d.vida);
        if (st.t >= 30) { st.fin = true; alTerminar(st.pts); }
        setHud((h) => (h.pts !== st.pts || h.t !== Math.ceil(30 - st.t) ? { pts: st.pts, t: Math.max(0, Math.ceil(30 - st.t)) } : h));
      }
    };
  }, { cielo: [0xfcd34d, 0xb45309], niebla: false });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🎯 ${hud.pts} pts`} der={`⏱️ ${hud.t}s`} /><Mensaje texto={msg} /></div>;
}

export default [
  { id: 'cruzar', nombre: 'Cruza la carretera', emoji: '🐔', como: 'Toca la pantalla (o ▲) para avanzar y ◀ ▶ para apartarte. Cruza todos los carriles que puedas sin que te pille un coche.', mejor: 'mas', unidad: 'carriles', duracion: 60, C: Cruzar },
  { id: 'apilar', nombre: 'Torre perfecta', emoji: '🧱', como: 'El bloque va y viene: toca para soltarlo encima de la torre. Lo que sobresale se cae. Si lo clavas, no pierdes nada.', mejor: 'mas', unidad: 'pisos', duracion: 90, C: Apilar },
  { id: 'secuencia', nombre: 'Memoria de luces', emoji: '💡', como: 'Mira el orden en que se encienden las baldosas y repítelo. Cada ronda, una luz más.', mejor: 'mas', unidad: 'luces', duracion: 120, C: Secuencia },
  { id: 'semaforo', nombre: 'Semáforo', emoji: '🚦', como: 'Toca en cuanto se ponga verde. Cinco rondas. Si tocas antes de tiempo, +1000 ms.', mejor: 'menos', unidad: 'ms', peor: 1000, duracion: 40, C: Semaforo, formato: (v) => `${Math.round(v)} ms` },
  { id: 'diana', nombre: 'Tiro al blanco', emoji: '🎯', como: 'Toca las dianas antes de que desaparezcan: el centro vale 5, y cuanto más lejos del centro, menos (3, 2 y 1). Fallar resta 1.', mejor: 'mas', unidad: 'pts', duracion: 30, C: Diana }
];
