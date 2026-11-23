// Minijuegos (2/6): para en 10 s, equilibrista, laberinto, topos y ¿cuántos hay?
import React, { useRef, useState } from 'react';
import { useEscena, rng, crea, tocado, THREE, marcador, mat } from '../tres.js';
import { Hud, Botones, Mensaje } from '../comun.jsx';
import { sonar, vibrar } from '../../../lib/sonido.js';

/** Botón que se mantiene pulsado (equilibrista). */
function Mantener({ ctl, k, children }) {
  return <button type="button" className="hb-boton ancho" onPointerDown={(e) => { e.preventDefault(); ctl.current[k] = true; }} onPointerUp={() => { ctl.current[k] = false; }} onPointerLeave={() => { ctl.current[k] = false; }} onPointerCancel={() => { ctl.current[k] = false; }}>{children}</button>;
}

/* ───────── Para en 10 segundos ───────── */
const RONDAS_DIEZ = 5;
function Diez({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ intento: 1, error: 0, meta: null }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene } = ctx; const r = rng(semilla);
    // Cinco rondas, cada una con un tiempo objetivo distinto (la esfera da una vuelta cada 15 s)
    const metas = r.barajar([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]).slice(0, RONDAS_DIEZ);
    const VUELTA = 15;
    const reloj = new THREE.Group(); scene.add(reloj);
    const caja = crea.cilindro(2.9, 2.9, 0.6, 0x1e293b, 64, { metalness: 0.6, roughness: 0.25 }); caja.rotation.x = Math.PI / 2; reloj.add(caja);
    const bisel = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.16, 16, 80), mat(0xe2e8f0, { metalness: 0.9, roughness: 0.15 })); bisel.position.z = 0.32; reloj.add(bisel);
    const esfera = crea.cilindro(2.62, 2.62, 0.05, 0xf8fafc, 64); esfera.rotation.x = Math.PI / 2; esfera.position.z = 0.31; reloj.add(esfera);
    for (let k = 0; k < 60; k++) {
      const largo = k % 5 === 0 ? 0.36 : 0.14; const a = (k / 60) * Math.PI * 2;
      const t = crea.caja(k % 5 === 0 ? 0.07 : 0.03, largo, 0.02, k % 5 === 0 ? 0x0f172a : 0x94a3b8); t.position.set(Math.sin(a) * (2.35 - largo / 2), Math.cos(a) * (2.35 - largo / 2), 0.35); t.rotation.z = -a; reloj.add(t);
    }
    const corona = crea.cilindro(0.3, 0.3, 0.4, 0xcbd5e1, 24, { metalness: 0.9, roughness: 0.2 }); corona.position.set(0, 3.15, 0); reloj.add(corona);
    const marca = crea.caja(0.16, 0.5, 0.04, 0x22c55e, { emissive: 0x22c55e, emissiveIntensity: 0.8 }); marca.geometry.translate(0, 2.05, 0); marca.position.z = 0.37; reloj.add(marca);
    const aguja = crea.caja(0.1, 2.2, 0.06, 0xef4444); aguja.geometry.translate(0, 0.9, 0); aguja.position.z = 0.42; reloj.add(aguja);
    const centro = crea.cilindro(0.16, 0.16, 0.1, 0x0f172a, 20); centro.rotation.x = Math.PI / 2; centro.position.z = 0.45; reloj.add(centro);
    const tapa = crea.cilindro(2.62, 2.62, 0.08, 0x0f172a, 64, { metalness: 0.4, roughness: 0.3 }); tapa.rotation.x = Math.PI / 2; tapa.position.z = 0.5; tapa.visible = false; reloj.add(tapa);
    const interroga = crea.cartel('?', 2.4, 2.4, { fondo: null, color: '#a78bfa', fuente: 'bold 200px sans-serif' }); interroga.position.z = 0.56; interroga.visible = false; reloj.add(interroga);
    const m = marcador({ tam: 1.05 }); m.position.set(0, -3.9, 0); scene.add(m);
    const st = { t: 0, corriendo: true, intento: 0, errores: [], fin: false };
    const meta = () => metas[st.errores.length];
    const ponerMeta = () => { marca.rotation.z = -(meta() / VUELTA) * Math.PI * 2; setHud((h) => ({ ...h, meta: meta() })); };
    ponerMeta();
    ctx.encuadrar({ centro: [0, -0.4, 0], ancho: 6.6, alto: 8.4, desde: [0, 0.02, 1] });
    return {
      toque() {
        if (st.fin || !st.corriendo) return;
        st.corriendo = false; const err = Math.abs(st.t - meta()); st.errores.push(Math.round(err * 1000));
        tapa.visible = false; interroga.visible = false; aguja.visible = true; aguja.rotation.z = -(st.t / VUELTA) * Math.PI * 2;
        m.poner(`${st.t.toFixed(2)} s`, err < 0.1 ? '#4ade80' : '#fde047'); sonar(err < 0.1 ? 'victoria' : 'acierto');
        if (err < 0.15) ctx.chispas(new THREE.Vector3(0, 0, 0.8), 0x4ade80, 30, { fuerza: 5 });
        setMsg(err < 0.05 ? '🎯 ¡Clavado!' : `Error: ${err.toFixed(2)} s`);
        setHud((h) => ({ ...h, intento: st.errores.length + 1, error: st.errores.reduce((a, b) => a + b, 0) }));
        setTimeout(() => {
          setMsg(null);
          if (st.errores.length >= RONDAS_DIEZ) { st.fin = true; alTerminar(st.errores.reduce((a, b) => a + b, 0)); return; }
          st.t = 0; st.corriendo = true; ponerMeta();
        }, 1600);
      },
      frame(dt, t) {
        reloj.rotation.y = Math.sin(t * 0.6) * 0.08;
        if (!st.corriendo) return;
        st.t += dt; aguja.rotation.z = -(st.t / VUELTA) * Math.PI * 2;
        const oculto = st.t >= 3; aguja.visible = !oculto; tapa.visible = oculto; interroga.visible = oculto; m.poner(oculto ? '?? s' : `${st.t.toFixed(2)} s`);
        if (st.t > meta() + 10) { st.corriendo = false; st.errores.push(10000); if (st.errores.length >= RONDAS_DIEZ) { st.fin = true; alTerminar(st.errores.reduce((a, b) => a + b, 0)); } else { st.t = 0; st.corriendo = true; ponerMeta(); } }
      }
    };
  }, { cielo: [0x312e81, 0x0f172a], niebla: false });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`⏱️ Ronda ${Math.min(RONDAS_DIEZ, hud.intento)}/${RONDAS_DIEZ}`} centro={hud.meta ? `🎯 ${hud.meta} s` : null} der={`Error: ${(hud.error / 1000).toFixed(2)} s`} /><Mensaje texto={msg} /></div>;
}

/* ───────── Equilibrista ───────── */
function Equilibrio({ semilla, alTerminar }) {
  const ref = useRef(null); const ctl = useRef({}); const [t, setT] = useState(0); const [msg, setMsg] = useState(null); const [viento, setViento] = useState(0);
  useEscena(ref, (ctx) => {
    const { scene } = ctx; const r = rng(semilla);
    const roca = crea.cilindro(1.2, 2.6, 3, 0x57534e, 7, { roughness: 0.9, flatShading: true }); roca.position.y = -2.6; scene.add(roca);
    const pie = crea.cilindro(0.08, 0.45, 1.2, 0x334155, 4); pie.position.y = -0.65; scene.add(pie);
    const tabla = new THREE.Group(); const madera = crea.caja(7.2, 0.22, 1.2, 0xc2853f, { roughness: 0.75 }); tabla.add(madera);
    [-3.55, 3.55].forEach((x) => { const tope = crea.caja(0.12, 0.3, 1.2, 0x7c4a1e); tope.position.set(x, 0.2, 0); tabla.add(tope); });
    scene.add(tabla);
    const bola = crea.esfera(0.36, 0xf43f5e, { roughness: 0.15, metalness: 0.2 }); scene.add(bola);
    // Nubes y rachas de viento visibles
    const nubes = []; for (let i = 0; i < 6; i++) { const n = new THREE.Group(); for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(r.entre(0.5, 0.9), 14, 10), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: 0.9 })); b.position.set(k * 0.7, r.entre(-0.2, 0.2), 0); n.add(b); } n.position.set(r.entre(-9, 9), r.entre(2.5, 5), r.entre(-8, -4)); scene.add(n); nubes.push(n); }
    const rayas = []; for (let i = 0; i < 18; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.03, 0.03), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })); l.position.set(r.entre(-7, 7), r.entre(-1, 3), r.entre(-2, 2)); scene.add(l); rayas.push(l); }
    const rachas = Array.from({ length: 30 }, () => ({ en: r.entre(1, 3), f: r.entre(-1, 1) }));
    const st = { a: 0, w: 0, x: 0, v: 0, t: 0, viento: 0, prox: 1.5, k: 0, fin: false, cae: 0 };
    ctx.encuadrar({ centro: [0, 0.6, 0], ancho: 9, alto: 6.5, desde: [0, 0.22, 1] });
    return {
      frame(dt) {
        nubes.forEach((n) => { n.position.x += (0.3 + st.viento * 1.5) * dt; if (n.position.x > 12) n.position.x = -12; if (n.position.x < -12) n.position.x = 12; });
        rayas.forEach((l) => { l.position.x += st.viento * 14 * dt; l.material.opacity = Math.min(0.7, Math.abs(st.viento) * 0.8); if (l.position.x > 8) l.position.x = -8; if (l.position.x < -8) l.position.x = 8; });
        if (st.fin) { st.cae += dt; bola.position.y -= dt * 8 * st.cae; bola.position.x += st.v * dt; return; }
        st.t += dt; st.prox -= dt;
        if (st.prox <= 0) { const rc = rachas[st.k++ % rachas.length]; st.viento = rc.f * (0.7 + st.t * 0.03); st.prox = rc.en; setViento(Math.round(st.viento * 10) / 10); }
        const u = (ctl.current.der ? 1 : 0) - (ctl.current.izq ? 1 : 0);
        st.w += (u * 2.2 + st.viento * 0.9 - st.w * 1.6) * dt;
        st.a = Math.max(-0.5, Math.min(0.5, st.a + st.w * dt));
        st.v += -9.8 * Math.sin(st.a) * dt * 0.9; st.v *= 0.995; st.x += st.v * dt;
        tabla.rotation.z = st.a;
        bola.position.set(st.x * Math.cos(st.a), 0.47 + st.x * Math.sin(st.a), 0); bola.rotation.z -= st.v * dt / 0.36;
        if (Math.abs(st.x) > 3.5) { st.fin = true; sonar('fallo'); ctx.temblor(0.3); setMsg('💥 ¡Se cayó!'); setTimeout(() => alTerminar(Math.round(st.t * 10) / 10), 900); }
        if (st.t >= 40) { st.fin = true; alTerminar(40); }
        setT((x) => (Math.floor(x * 10) !== Math.floor(st.t * 10) ? st.t : x));
      }
    };
  }, { cielo: [0x7dd3fc, 0xfef3c7], niebla: 40 });
  const flecha = viento > 0.15 ? '💨 →' : viento < -0.15 ? '← 💨' : '🍃';
  return (
    <div className="hb-caja">
      <div ref={ref} className="hb-lienzo" /><Hud izq={`⚖️ ${t.toFixed(1).replace('.', ',')} s`} centro={flecha} der="Aguanta 40 s" /><Mensaje texto={msg} tipo="mal" />
      <Botones><Mantener ctl={ctl} k="der">↺ Inclinar</Mantener><Mantener ctl={ctl} k="izq">Inclinar ↻</Mantener></Botones>
    </div>
  );
}

/* ───────── Laberinto ───────── */
function Laberinto({ semilla, alTerminar }) {
  const ref = useRef(null); const ctl = useRef({}); const [t, setT] = useState(0);
  useEscena(ref, (ctx) => {
    const { scene } = ctx; const r = rng(semilla); const N = 11; const S = 1.1; const RB = 0.24;
    // Laberinto por búsqueda en profundidad
    const muro = Array.from({ length: N * N }, () => ({ n: true, e: true, s: true, o: true })); const vis = new Set([0]); const pila = [0];
    while (pila.length) {
      const c = pila.at(-1); const f = Math.floor(c / N); const k = c % N;
      const vec = [[f - 1, k, 'n', 's'], [f + 1, k, 's', 'n'], [f, k + 1, 'e', 'o'], [f, k - 1, 'o', 'e']].filter(([a, b]) => a >= 0 && a < N && b >= 0 && b < N && !vis.has(a * N + b));
      if (!vec.length) { pila.pop(); continue; }
      const [a, b, d1, d2] = r.de(vec); muro[c][d1] = false; muro[a * N + b][d2] = false; vis.add(a * N + b); pila.push(a * N + b);
    }
    const cx = (k) => (k - (N - 1) / 2) * S; const rects = [];
    const matMuro = new THREE.MeshStandardMaterial({ color: 0x4f46e5, roughness: 0.3, metalness: 0.2, emissive: 0x312e81, emissiveIntensity: 0.4 });
    const matBorde = new THREE.MeshStandardMaterial({ color: 0xa5b4fc, emissive: 0x818cf8, emissiveIntensity: 1.2 });
    const pared = (x0, z0, x1, z1) => {
      const w = Math.max(0.2, x1 - x0 + 0.2); const d = Math.max(0.2, z1 - z0 + 0.2);
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.55, d), matMuro); m.position.set((x0 + x1) / 2, 0.275, (z0 + z1) / 2); m.castShadow = true; m.receiveShadow = true; scene.add(m);
      const tope = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, d), matBorde); tope.position.set(m.position.x, 0.57, m.position.z); scene.add(tope);
      rects.push([(x0 + x1) / 2 - w / 2, (z0 + z1) / 2 - d / 2, (x0 + x1) / 2 + w / 2, (z0 + z1) / 2 + d / 2]);
    };
    for (let f = 0; f < N; f++) for (let k = 0; k < N; k++) {
      const m = muro[f * N + k]; const x = cx(k); const z = cx(f); const h = S / 2;
      if (m.s) pared(x - h, z + h, x + h, z + h); if (m.e) pared(x + h, z - h, x + h, z + h);
      if (f === 0 && m.n) pared(x - h, z - h, x + h, z - h); if (k === 0 && m.o) pared(x - h, z - h, x - h, z + h);
    }
    const suelo = crea.suelo(N * S + 0.6, N * S + 0.6, 0x1e1b4b, { celda: S / 4, contraste: 0.05 }); scene.add(suelo);
    const base = crea.caja(N * S + 1.2, 0.4, N * S + 1.2, 0x0f0a2e); base.position.y = -0.21; scene.add(base);
    const meta = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.05, 32), crea.neon(0x22c55e, 1.6)); meta.position.set(cx(N - 1), 0.03, cx(N - 1)); scene.add(meta);
    const haz = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 3, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false })); haz.position.set(meta.position.x, 1.5, meta.position.z); scene.add(haz);
    const salida = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 32), crea.neon(0xfacc15, 0.8)); salida.position.set(cx(0), 0.02, cx(0)); scene.add(salida);
    const bola = crea.esfera(RB, 0xe2e8f0, { metalness: 0.9, roughness: 0.12 }); bola.position.set(cx(0), RB, cx(0)); scene.add(bola);
    const luzBola = new THREE.PointLight(0xfde68a, 3, 3); scene.add(luzBola);
    const st = { t: 0, x: cx(0), z: cx(0), fin: false };
    const choca = (x, z) => rects.some(([a, b, c, d]) => { const px = Math.max(a, Math.min(x, c)); const pz = Math.max(b, Math.min(z, d)); return (x - px) ** 2 + (z - pz) ** 2 < RB * RB; });
    // Flechas del teclado (en ordenador), igual que mantener pulsados los botones
    const TECLAS = { ArrowUp: 'arriba', ArrowDown: 'abajo', ArrowLeft: 'izq', ArrowRight: 'der' };
    const tecla = (v) => (e) => { const k = TECLAS[e.key]; if (k) { e.preventDefault(); ctl.current[k] = v; } };
    const baja = tecla(true); const sube = tecla(false);
    window.addEventListener('keydown', baja); window.addEventListener('keyup', sube);
    // Vista cenital (algo inclinada) que encaja el laberinto entero en cualquier pantalla
    // Vista cenital que encaja el laberinto entero y deja sitio debajo para las flechas
    ctx.encuadrar({ centro: [0, 0, 1.6], ancho: N * S + 0.8, alto: N * S + 4.4, desde: [0, 1, 0.12], margen: 1.03 });
    return {
      fin() { window.removeEventListener('keydown', baja); window.removeEventListener('keyup', sube); },
      frame(dt, tt) {
        meta.material.emissiveIntensity = 1.2 + Math.sin(tt * 4) * 0.5; haz.rotation.y += dt;
        if (st.fin) return;
        const c = ctl.current; let dx = (c.der ? 1 : 0) - (c.izq ? 1 : 0); let dz = (c.abajo ? 1 : 0) - (c.arriba ? 1 : 0);
        if (dx && dz) { dx *= Math.SQRT1_2; dz *= Math.SQRT1_2; }
        st.t += dt; const v = 3.2 * dt;
        // (en pasos cortos para no atravesar paredes)
        for (let i = 0; i < 3; i++) {
          const nx = st.x + dx * v / 3; if (!choca(nx, st.z)) st.x = nx;
          const nz = st.z + dz * v / 3; if (!choca(st.x, nz)) st.z = nz;
        }
        bola.position.set(st.x, RB, st.z); bola.rotation.x += dz * v / RB; bola.rotation.z -= dx * v / RB; luzBola.position.set(st.x, 0.9, st.z);
        if (Math.hypot(st.x - cx(N - 1), st.z - cx(N - 1)) < 0.5) { st.fin = true; sonar('victoria'); ctx.chispas(new THREE.Vector3(st.x, 0.5, st.z), 0x4ade80, 40, { fuerza: 5 }); alTerminar(Math.round(st.t * 10) / 10); }
        if (st.t >= 120) { st.fin = true; alTerminar(120); }
        setT((x) => (Math.floor(x) !== Math.floor(st.t) ? st.t : x));
      }
    };
  }, { cielo: [0x1e1b4b, 0x050314], niebla: false });
  return (
    <div className="hb-caja">
      <div ref={ref} className="hb-lienzo" /><Hud izq={`🌀 ${Math.floor(t)} s`} der="Mantén pulsadas las flechas" />
      <Botones><Mantener ctl={ctl} k="izq">◀</Mantener><Mantener ctl={ctl} k="arriba">▲</Mantener><Mantener ctl={ctl} k="abajo">▼</Mantener><Mantener ctl={ctl} k="der">▶</Mantener></Botones>
    </div>
  );
}

/* ───────── Topos ───────── */
function Topos({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ pts: 0, t: 30 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene } = ctx; const r = rng(semilla);
    const cesped = crea.suelo(30, 30, 0x4d7c0f, { celda: 0.8, contraste: 0.05, lineas: false }); scene.add(cesped);
    const valla = new THREE.Group(); for (let x = -5; x <= 5; x += 0.8) { const p = crea.caja(0.16, 0.9, 0.12, 0xf5f5f4); p.position.set(x, 0.45, -5); valla.add(p); } const barra = crea.caja(10.4, 0.1, 0.1, 0xe7e5e4); barra.position.set(0, 0.65, -5.05); valla.add(barra); scene.add(valla);
    for (let i = 0; i < 25; i++) { const f = crea.esfera(0.09, r.de([0xf472b6, 0xfacc15, 0xffffff, 0xa78bfa])); f.position.set(r.entre(-5, 5), 0.06, r.entre(-4.5, 4.5)); if (Math.abs(f.position.x) > 3.6 || Math.abs(f.position.z) > 3.6) scene.add(f); }
    const hoyos = []; const bichos = [];
    for (let i = 0; i < 9; i++) {
      const x = (i % 3 - 1) * 2.4; const z = (Math.floor(i / 3) - 1) * 2.4;
      const monte = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.22, 12, 32), mat(0x7c4a1e, { roughness: 0.95 })); monte.rotation.x = -Math.PI / 2; monte.position.set(x, 0.05, z); monte.receiveShadow = true; scene.add(monte);
      const h = new THREE.Mesh(new THREE.CircleGeometry(0.72, 32), new THREE.MeshBasicMaterial({ color: 0x0c0a09 })); h.rotation.x = -Math.PI / 2; h.position.set(x, 0.02, z); scene.add(h);
      hoyos.push({ x, z, ocupado: false });
    }
    const crearBicho = (tipo) => {
      const g = new THREE.Group();
      const col = tipo === 'oro' ? 0xfacc15 : tipo === 'bomba' ? 0x1f2937 : 0x8b5a2b;
      const extra = tipo === 'oro' ? { metalness: 0.8, roughness: 0.2, emissive: 0x854d0e, emissiveIntensity: 0.3 } : undefined;
      if (tipo === 'bomba') {
        const b = crea.esfera(0.6, col, { metalness: 0.4, roughness: 0.3 }); b.position.y = 0.75; g.add(b);
        const boca = crea.cilindro(0.16, 0.16, 0.15, 0x475569); boca.position.y = 1.38; g.add(boca);
        const mecha = crea.cilindro(0.04, 0.04, 0.35, 0xd6d3d1); mecha.position.set(0.08, 1.58, 0); mecha.rotation.z = -0.4; g.add(mecha);
        const chispa = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), crea.neon(0xf97316, 3)); chispa.position.set(0.17, 1.74, 0); g.add(chispa);
      } else {
        const cuerpo = crea.cilindro(0.52, 0.62, 1, col, 24, extra); cuerpo.position.y = 0.5; g.add(cuerpo);
        const cabeza = crea.esfera(0.54, col, extra); cabeza.position.y = 1.05; g.add(cabeza);
        const hocico = crea.esfera(0.26, tipo === 'oro' ? 0xfde68a : 0xd6b48c); hocico.position.set(0, 0.95, 0.45); hocico.scale.set(1.2, 0.85, 0.9); g.add(hocico);
        [-0.2, 0.2].forEach((dx) => { const ojo = crea.esfera(0.09, 0x111827); ojo.position.set(dx, 1.22, 0.44); g.add(ojo); const brillo = crea.esfera(0.03, 0xffffff); brillo.position.set(dx + 0.03, 1.25, 0.52); g.add(brillo); });
        const nariz = crea.esfera(0.1, 0xfb7185); nariz.position.set(0, 1.02, 0.7); g.add(nariz);
        [-0.42, 0.42].forEach((dx) => { const o = crea.esfera(0.13, col); o.position.set(dx, 1.45, 0); g.add(o); });
        if (tipo === 'oro') { const corona = crea.cilindro(0.3, 0.25, 0.2, 0xfef08a, 6, { metalness: 0.9, roughness: 0.2 }); corona.position.y = 1.62; g.add(corona); }
      }
      return g;
    };
    const st = { t: 0, pts: 0, prox: 0.4, fin: false };
    ctx.encuadrar({ centro: [0, 0.5, 0.2], ancho: 7.8, alto: 7.4, desde: [0, 1, 0.62] });
    return {
      toque(e) {
        if (st.fin) return;
        const t = tocado(ctx, e, bichos.filter((b) => b.arriba > 0.4).map((b) => b.g)); if (!t) return;
        const b = bichos.find((x) => x.g === t.obj); if (!b || b.golpeado) return;
        b.golpeado = true; b.vida = Math.min(b.vida, b.edad + 0.12); b.g.scale.set(1.3, 0.6, 1.3);
        const p = b.tipo === 'oro' ? 3 : b.tipo === 'bomba' ? -3 : 1; st.pts = Math.max(0, st.pts + p);
        const pos = new THREE.Vector3(b.h.x, 1.2, b.h.z);
        if (p < 0) { ctx.chispas(pos, 0xf97316, 40, { fuerza: 6 }); ctx.temblor(0.5); } else { ctx.chispas(pos, b.tipo === 'oro' ? 0xfacc15 : 0xffffff, b.tipo === 'oro' ? 30 : 14); ctx.onda(new THREE.Vector3(b.h.x, 0.06, b.h.z), 0xffffff, { radio: 1.4 }); }
        setMsg(p > 0 ? `+${p}` : '💣 −3'); setTimeout(() => setMsg(null), 350); if (p < 0) { vibrar(120); sonar('fallo'); } else sonar('acierto', { minimo: 0, vibrar: false });
      },
      frame(dt, tt) {
        if (st.fin) return;
        st.t += dt; st.prox -= dt;
        if (st.prox <= 0) {
          const libres = hoyos.filter((h) => !h.ocupado);
          if (libres.length) { const h = r.de(libres); const x = r(); const tipo = x < 0.12 ? 'oro' : x < 0.32 ? 'bomba' : 'topo'; const g = crearBicho(tipo); g.position.set(h.x, -1.9, h.z); scene.add(g); h.ocupado = true; bichos.push({ g, h, tipo, edad: 0, vida: Math.max(0.6, 1.05 - st.t * 0.015), arriba: 0 }); }
          st.prox = Math.max(0.28, 0.6 - st.t * 0.01);
        }
        bichos.forEach((b) => { b.edad += dt; const sube = Math.min(1, b.edad / 0.12, (b.vida - b.edad) / 0.12); b.arriba = Math.max(0, sube); b.g.position.y = -1.9 + 1.9 * b.arriba; if (!b.golpeado) b.g.rotation.y = Math.sin(tt * 8 + b.h.x) * 0.15; });
        bichos.filter((b) => b.edad >= b.vida).forEach((b) => { scene.remove(b.g); b.h.ocupado = false; });
        for (let i = bichos.length - 1; i >= 0; i--) if (bichos[i].edad >= bichos[i].vida) bichos.splice(i, 1);
        if (st.t >= 30) { st.fin = true; alTerminar(st.pts); }
        setHud((h) => (h.pts !== st.pts || h.t !== Math.ceil(30 - st.t) ? { pts: st.pts, t: Math.max(0, Math.ceil(30 - st.t)) } : h));
      }
    };
  }, { cielo: [0x7dd3fc, 0xd9f99d], niebla: 35 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🔨 ${hud.pts} pts`} der={`⏱️ ${hud.t}s`} /><Mensaje texto={msg} /></div>;
}

/* ───────── ¿Cuántos hay? ───────── */
const COLORES = [['rojos', 'rojas', 0xef4444], ['azules', 'azules', 0x3b82f6], ['amarillos', 'amarillas', 0xfacc15]];
const FORMAS = [['cubos', 'm'], ['esferas', 'f'], ['conos', 'm']];
function Contar({ semilla, alTerminar }) {
  const ref = useRef(null); const ctl = useRef({}); const [pregunta, setPregunta] = useState(null); const [hud, setHud] = useState({ ronda: 1, pts: 0 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene } = ctx; const r = rng(semilla);
    const mesa = crea.caja(10.4, 0.4, 7.4, 0x7c4a1e, { roughness: 0.6 }); mesa.position.y = -0.2; scene.add(mesa);
    const tapete = crea.caja(9.8, 0.04, 6.8, 0x065f46, { roughness: 0.95 }); tapete.position.y = 0.02; scene.add(tapete);
    const suelo = crea.suelo(40, 40, 0x1f2937, { celda: 2 }); suelo.position.y = -2.5; scene.add(suelo);
    // Tapa: una caja grande que baja y cubre la mesa entera (más alta que cualquier figura)
    const tapa = new THREE.Group(); const caja = crea.caja(10.6, 1.8, 7.6, 0x1e293b, { roughness: 0.3, metalness: 0.4 }); tapa.add(caja);
    const asa = crea.caja(2.4, 0.3, 0.6, 0xfacc15, { metalness: 0.6, roughness: 0.25 }); asa.position.y = 1.05; tapa.add(asa);
    const interroga = crea.cartel('?', 2, 2, { fondo: null, color: '#facc15', fuente: 'bold 220px sans-serif' }); interroga.rotation.x = -Math.PI / 2; interroga.position.set(0, 0.92, 1.6); tapa.add(interroga);
    tapa.position.y = 12; scene.add(tapa);
    const st = { ronda: 0, fase: 'ver', t: 0, objetos: [], pts: 0, aciertos: 0, inicioResp: 0, fin: false, sol: 0 };
    const verObjetos = (v) => st.objetos.forEach((o) => { o.visible = v; });
    const montar = () => {
      st.objetos.forEach((o) => scene.remove(o)); st.objetos = [];
      const n = r.entero(8, 13 + st.ronda * 2); const lista = [];
      for (let i = 0; i < n; i++) {
        const f = r.entero(0, 2); const c = r.entero(0, 2);
        const m = f === 0 ? crea.caja(0.7, 0.7, 0.7, COLORES[c][2]) : f === 1 ? crea.esfera(0.42, COLORES[c][2]) : crea.cilindro(0, 0.45, 0.9, COLORES[c][2]);
        let x; let z; let k = 0; do { x = r.entre(-4.3, 4.3); z = r.entre(-2.8, 2.8); k++; } while (k < 30 && lista.some((o) => Math.hypot(o.x - x, o.z - z) < 1));
        m.position.set(x, f === 2 ? 0.49 : 0.44, z); m.rotation.y = r() * 3; scene.add(m); st.objetos.push(m); lista.push({ x, z, f, c });
      }
      const modo = r.entero(0, 2); const fo = r.entero(0, 2); const co = r.entero(0, 2);
      const sol = lista.filter((o) => (modo !== 1 ? o.f === fo : true) && (modo !== 0 ? o.c === co : true)).length;
      const texto = modo === 0 ? `¿Cuántos ${FORMAS[fo][0]} había?`.replace('Cuántos esferas', 'Cuántas esferas') : modo === 1 ? `¿Cuántas figuras ${COLORES[co][1]} había?` : `¿Cuántos ${FORMAS[fo][0]} ${FORMAS[fo][1] === 'f' ? COLORES[co][1] : COLORES[co][0]} había?`.replace('Cuántos esferas', 'Cuántas esferas');
      const opciones = new Set([sol]); while (opciones.size < 4) opciones.add(Math.max(0, sol + r.entero(-3, 3)));
      st.sol = sol; st.texto = texto; st.opciones = [...opciones].sort((a, b) => a - b);
      tapa.position.y = 12; st.fase = 'ver'; st.t = 0; verObjetos(true);
    };
    montar();
    ctl.current.responder = (v) => {
      if (st.fase !== 'pregunta' || st.fin) return;
      const seg = (performance.now() - st.inicioResp) / 1000; const bien = v === st.sol;
      if (bien) { st.aciertos++; st.pts += 100 + Math.max(0, Math.round(50 - seg * 10)); sonar('acierto'); setMsg('✅ ¡Correcto!'); ctx.chispas(new THREE.Vector3(0, 2, 0), 0x4ade80, 30, { fuerza: 5 }); } else { sonar('fallo'); setMsg(`❌ Eran ${st.sol}`); }
      st.fase = 'pausa'; setPregunta(null); setHud({ ronda: Math.min(6, st.ronda + 2), pts: st.pts });
      setTimeout(() => { setMsg(null); st.ronda++; if (st.ronda >= 6) { st.fin = true; alTerminar(st.pts); } else montar(); }, 1100);
    };
    ctx.encuadrar({ centro: [0, 0, 0.3], ancho: 10.6, alto: 7.8, desde: [0, 1, 0.55] });
    return {
      frame(dt) {
        st.t += dt;
        const verT = Math.max(1.6, 2.6 - st.ronda * 0.15);
        if (st.fase === 'ver' && st.t > verT) { st.fase = 'tapando'; }
        if (st.fase === 'tapando') {
          tapa.position.y = Math.max(0.92, tapa.position.y - dt * 32);
          if (tapa.position.y <= 0.93) { verObjetos(false); ctx.temblor(0.15); st.fase = 'pregunta'; st.inicioResp = performance.now(); setPregunta({ texto: st.texto, opciones: st.opciones }); }
        }
      }
    };
  }, { cielo: [0x0e7490, 0x082f49], niebla: 45 });
  return (
    <div className="hb-caja">
      <div ref={ref} className="hb-lienzo" /><Hud izq={`🔢 Ronda ${hud.ronda}/6`} der={`${hud.pts} pts`} /><Mensaje texto={msg} />
      {pregunta && <div className="hb-pregunta"><p>{pregunta.texto}</p><div>{pregunta.opciones.map((o) => <button key={o} type="button" onClick={() => ctl.current.responder(o)}>{o}</button>)}</div></div>}
    </div>
  );
}

export default [
  { id: 'diez', nombre: 'Para en 10 segundos', emoji: '⏱️', como: 'Cinco rondas, cada una con un tiempo distinto (marcado en verde). El reloj arranca y a los 3 segundos se tapa: toca cuando creas que ha pasado justo ese tiempo. Cuenta el error total.', mejor: 'menos', unidad: 's', peor: 50000, duracion: 130, C: Diez, formato: (v) => `${(v / 1000).toFixed(2).replace('.', ',')} s de error` },
  { id: 'equilibrio', nombre: 'Equilibrista', emoji: '⚖️', como: 'Mantén pulsado para inclinar la tabla y que la bola no se caiga. El viento (arriba verás hacia dónde sopla) es cada vez más fuerte. Aguanta hasta 40 segundos.', mejor: 'mas', unidad: 's', duracion: 40, C: Equilibrio, formato: (v) => `${v.toFixed(1).replace('.', ',')} s` },
  { id: 'laberinto', nombre: 'Laberinto', emoji: '🌀', como: 'Mantén pulsadas las flechas (o las del teclado) para mover la bola por el laberinto hasta la salida verde lo antes posible.', mejor: 'menos', unidad: 's', peor: 120, duracion: 120, C: Laberinto, formato: (v) => `${v.toFixed(1).replace('.', ',')} s` },
  { id: 'topos', nombre: 'Topos', emoji: '🔨', como: 'Toca los topos que asoman (+1). Los dorados valen +3. ¡Ojo con las bombas (−3)! 30 segundos.', mejor: 'mas', unidad: 'pts', duracion: 30, C: Topos },
  { id: 'contar', nombre: '¿Cuántos hay?', emoji: '🔢', como: 'Unas figuras aparecen un momento sobre la mesa. Cuando se tapen, responde la pregunta. Cuanto antes contestes, más puntos.', mejor: 'mas', unidad: 'pts', duracion: 75, C: Contar }
];
