// Minijuegos (1/6): cruzar la carretera, torre de bloques, memoria de luces, semáforo y tiro al blanco.
import React, { useRef, useState } from 'react';
import { useEscena, rng, crea, tocado, THREE, mat } from '../tres.js';
import { Hud, Botones, Boton, Mensaje } from '../comun.jsx';
import { sonar, vibrar } from '../../../lib/sonido.js';

/* ───────── Cruza la carretera ───────── */
function Cruzar({ semilla, alTerminar }) {
  const ref = useRef(null); const ctl = useRef({}); const [hud, setHud] = useState({ carril: 0, t: 60 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla);
    const carriles = []; const coches = [];
    for (let i = 0; i < 90; i++) {
      const hierba = i < 2 || r() < 0.28;
      const z = -i;
      const suelo = crea.caja(14, 0.2, 1, hierba ? (i % 2 ? 0x4ade80 : 0x22c55e) : 0x374151); suelo.position.set(0, -0.1, z); scene.add(suelo);
      const c = { hierba, dir: r() < 0.5 ? -1 : 1, vel: r.entre(2.2, 3.5) + i * 0.045 };
      if (!hierba) {
        const raya = crea.caja(14, 0.01, 0.06, 0xfef3c7); raya.position.set(0, 0.01, z - 0.5); scene.add(raya);
        const n = r.entero(1, 3); let x = r.entre(-9, -5);
        for (let k = 0; k < n; k++) {
          const largo = r.entre(1.2, 2.4); const coche = crea.caja(largo, 0.6, 0.7, r.de([0xef4444, 0x3b82f6, 0xf59e0b, 0xa855f7, 0xf8fafc, 0x06b6d4]));
          coche.position.set(x, 0.35, z); scene.add(coche); coches.push({ m: coche, carril: i, largo, c });
          x += largo + r.entre(2.5, 5.5);
        }
      } else if (i > 1) for (let k = 0; k < 2; k++) { const arbol = crea.cilindro(0, 0.45, 1.2, 0x15803d, 8); arbol.position.set(r.de([-6, -5, 5, 6]), 0.6, z); scene.add(arbol); }
      carriles.push(c);
    }
    const pollo = new THREE.Group(); const cuerpo = crea.caja(0.6, 0.6, 0.6, 0xfacc15); cuerpo.position.y = 0.3; const pico = crea.caja(0.2, 0.15, 0.2, 0xf97316); pico.position.set(0, 0.4, -0.38); pollo.add(cuerpo, pico); scene.add(pollo);
    const st = { carril: 0, x: 0, max: 0, t: 0, salto: 0, fin: false };
    const acabar = () => { if (st.fin) return; st.fin = true; vibrar(150); sonar('fallo'); setMsg('💥 ¡Atropellado!'); setTimeout(() => alTerminar(st.max), 900); };
    const mover = (dc, dx) => { if (st.fin) return; st.carril = Math.max(0, st.carril + dc); st.x = Math.max(-5, Math.min(5, st.x + dx)); st.salto = 1; st.max = Math.max(st.max, st.carril); sonar('toque', { minimo: 0 }); };
    ctl.current = { mover };
    camera.position.set(2, 7, 5);
    return {
      toque: () => mover(1, 0),
      frame(dt) {
        if (!st.fin) st.t += dt;
        coches.forEach((k) => { k.m.position.x += k.c.dir * k.c.vel * dt; if (k.m.position.x > 10) k.m.position.x -= 20; if (k.m.position.x < -10) k.m.position.x += 20; });
        st.salto = Math.max(0, st.salto - dt * 6);
        pollo.position.x += (st.x - pollo.position.x) * 0.4; pollo.position.z += (-st.carril - pollo.position.z) * 0.4; pollo.position.y = Math.sin(st.salto * Math.PI) * 0.4;
        if (!st.fin) {
          const golpe = coches.some((k) => k.carril === st.carril && Math.abs(k.m.position.x - st.x) < k.largo / 2 + 0.3);
          if (golpe) acabar();
          if (st.t >= 60) { st.fin = true; alTerminar(st.max); }
        }
        camera.position.x += (pollo.position.x * 0.3 + 2 - camera.position.x) * 0.1; camera.position.z += (pollo.position.z + 5.5 - camera.position.z) * 0.1;
        camera.lookAt(pollo.position.x * 0.3, 0, pollo.position.z - 2.5);
        ctx.sol.position.set(pollo.position.x + 5, 12, pollo.position.z + 6); ctx.sol.target.position.set(pollo.position.x, 0, pollo.position.z);
        setHud((h) => (h.carril !== st.max || h.t !== Math.ceil(60 - st.t) ? { carril: st.max, t: Math.max(0, Math.ceil(60 - st.t)) } : h));
      }
    };
  }, { fondo: 0x7dd3fc });
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
    const base = crea.caja(3, 2, 3, 0x334155); base.position.y = -1; scene.add(base);
    const color = (k) => new THREE.Color().setHSL(((semilla % 360) / 360 + k * 0.045) % 1, 0.7, 0.55).getHex();
    let top = { x: 0, z: 0, w: 3, d: 3 };
    const st = { n: 0, eje: 'x', pos: -6, dir: 1, vel: 3.2, fin: false, actual: null, caidas: [], t: 0 };
    const nuevo = () => {
      st.eje = st.n % 2 ? 'z' : 'x'; st.pos = r() < 0.5 ? -6 : 6; st.dir = st.pos < 0 ? 1 : -1;
      const m = crea.caja(top.w, H, top.d, color(st.n)); m.position.set(top.x, st.n * H + H / 2, top.z); scene.add(m); st.actual = m;
    };
    nuevo();
    camera.position.set(8, 8, 8);
    const soltar = () => {
      if (st.fin) return;
      const m = st.actual; const a = st.eje; const tam = a === 'x' ? top.w : top.d;
      const delta = m.position[a] - top[a];
      if (Math.abs(delta) >= tam) { // falla del todo
        st.fin = true; sonar('fallo'); setMsg('💥 ¡Fuera!'); st.caidas.push({ m, vy: 0 }); setTimeout(() => alTerminar(st.n), 1000); return;
      }
      if (Math.abs(delta) < 0.12) { m.position[a] = top[a]; setMsg('✨ ¡Perfecto!'); sonar('acierto'); setTimeout(() => setMsg(null), 600); } else {
        const queda = tam - Math.abs(delta);
        const nuevoCentro = top[a] + delta / 2;
        const corte = crea.caja(a === 'x' ? Math.abs(delta) : top.w, H, a === 'z' ? Math.abs(delta) : top.d, color(st.n));
        corte.position.copy(m.position); corte.position[a] = nuevoCentro + Math.sign(delta) * (queda / 2 + Math.abs(delta) / 2);
        scene.add(corte); st.caidas.push({ m: corte, vy: 0 });
        m.scale[a] = queda / tam; m.position[a] = nuevoCentro;
        if (a === 'x') top.w = queda; else top.d = queda;
        sonar('toque', { minimo: 0 });
      }
      top = { ...top, x: m.position.x, z: m.position.z };
      st.n += 1; setN(st.n); st.vel = Math.min(9, st.vel + 0.25); nuevo();
    };
    return {
      toque: soltar,
      frame(dt) {
        st.t += dt; if (!st.fin && st.t > 90) { st.fin = true; alTerminar(st.n); }
        if (!st.fin) { st.pos += st.dir * st.vel * dt; if (Math.abs(st.pos) > 6) { st.dir *= -1; st.pos = Math.sign(st.pos) * 6; } st.actual.position[st.eje] = top[st.eje] + st.pos; }
        st.caidas.forEach((c) => { c.vy -= 20 * dt; c.m.position.y += c.vy * dt; c.m.rotation.x += dt; });
        const y = st.n * H; camera.position.y += (8 + y - camera.position.y) * 0.08; camera.lookAt(0, y - 1, 0);
      }
    };
  }, { fondo: 0x0f172a });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🧱 ${n} pisos`} der="Toca para soltar" /><Mensaje texto={msg} /></div>;
}

/* ───────── Memoria de luces ───────── */
function Secuencia({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ nivel: 1, texto: 'Mira…' }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla);
    const COL = [0xef4444, 0xf97316, 0xfacc15, 0x22c55e, 0x06b6d4, 0x3b82f6, 0x8b5cf6, 0xec4899, 0xf8fafc];
    const pads = COL.map((c, i) => { const m = crea.caja(1.6, 0.35, 1.6, c, { emissive: c, emissiveIntensity: 0.05 }); m.position.set((i % 3 - 1) * 1.9, 0, (Math.floor(i / 3) - 1) * 1.9); scene.add(m); return m; });
    const seq = Array.from({ length: 15 }, () => r.entero(0, 8));
    const st = { nivel: 1, fase: 'mostrar', i: 0, reloj: 0.8, luz: [], pos: 0, fin: false };
    const encender = (k, dur = 0.35) => { st.luz[k] = dur; sonar('tic', { minimo: 0, vibrar: false }); };
    camera.position.set(0, 7.5, 4.5); camera.lookAt(0, 0, 0.3);
    return {
      toque(e) {
        if (st.fase !== 'turno' || st.fin) return;
        const t = tocado(ctx, e, pads); if (!t) return;
        const k = pads.indexOf(t.obj); encender(k, 0.25);
        if (k !== seq[st.pos]) { st.fin = true; sonar('fallo'); setMsg('❌ ¡Fallo!'); setTimeout(() => alTerminar(st.nivel - 1), 900); return; }
        st.pos += 1;
        if (st.pos >= st.nivel) {
          if (st.nivel >= 15) { st.fin = true; alTerminar(15); return; }
          st.nivel += 1; st.fase = 'mostrar'; st.i = 0; st.reloj = 0.9; setHud({ nivel: st.nivel, texto: 'Mira…' }); sonar('acierto');
        }
      },
      frame(dt) {
        pads.forEach((p, k) => { st.luz[k] = Math.max(0, (st.luz[k] || 0) - dt); p.material.emissiveIntensity = st.luz[k] > 0 ? 1.2 : 0.05; p.position.y = st.luz[k] > 0 ? 0.12 : 0; });
        if (st.fase === 'mostrar') {
          st.reloj -= dt;
          if (st.reloj <= 0) {
            if (st.i < st.nivel) { encender(seq[st.i], Math.max(0.22, 0.4 - st.nivel * 0.015)); st.i += 1; st.reloj = Math.max(0.33, 0.6 - st.nivel * 0.02); } else { st.fase = 'turno'; st.pos = 0; setHud({ nivel: st.nivel, texto: '¡Tu turno!' }); }
          }
        }
      }
    };
  }, { fondo: 0x111827 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`💡 Nivel ${hud.nivel}`} der={hud.texto} /><Mensaje texto={msg} tipo="mal" /></div>;
}

/* ───────── Semáforo (reflejos) ───────── */
function Semaforo({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ ronda: 1, ultimo: null }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla);
    const caja = crea.caja(1.6, 4.4, 1, 0x1f2937); caja.position.y = 2.4; scene.add(caja);
    const poste = crea.cilindro(0.15, 0.15, 3, 0x475569); poste.position.y = -0.9; scene.add(poste);
    const luces = [0xef4444, 0xf59e0b, 0x22c55e].map((c, i) => { const m = crea.esfera(0.55, c, { emissive: c, emissiveIntensity: 0.05 }); m.position.set(0, 3.8 - i * 1.4, 0.55); scene.add(m); return m; });
    const esperas = Array.from({ length: 5 }, () => r.entre(1.4, 3.8));
    const st = { ronda: 0, fase: 'roja', t: 0, tiempos: [], fin: false };
    const pon = (k) => luces.forEach((l, i) => { l.material.emissiveIntensity = i === k ? 1.6 : 0.05; });
    pon(0);
    camera.position.set(0, 2.4, 9); camera.lookAt(0, 2.2, 0);
    const siguiente = () => { if (st.tiempos.length >= 5) { st.fin = true; const media = st.tiempos.reduce((a, b) => a + b, 0) / 5; setTimeout(() => alTerminar(Math.round(media)), 900); return; } st.ronda = st.tiempos.length; st.fase = 'roja'; st.t = 0; pon(0); setHud({ ronda: st.ronda + 1, ultimo: st.tiempos.at(-1) }); };
    return {
      toque() {
        if (st.fin || st.fase === 'pausa') return;
        if (st.fase === 'roja' || st.fase === 'ambar') { st.tiempos.push(1000); sonar('fallo'); setMsg('🚫 ¡Antes de tiempo! +1000 ms'); st.fase = 'pausa'; setTimeout(() => { setMsg(null); siguiente(); }, 1200); return; }
        const ms = Math.round(st.t * 1000); st.tiempos.push(ms); sonar('acierto'); setMsg(`⚡ ${ms} ms`); st.fase = 'pausa'; setTimeout(() => { setMsg(null); siguiente(); }, 1000);
      },
      frame(dt) {
        st.t += dt;
        if (st.fase === 'roja' && st.t > esperas[st.ronda] - 0.5) { st.fase = 'ambar'; pon(1); }
        if (st.fase === 'ambar' && st.t > esperas[st.ronda]) { st.fase = 'verde'; st.t = 0; pon(2); }
      }
    };
  }, { fondo: 0x0b1120 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🚦 Ronda ${hud.ronda}/5`} der={hud.ultimo != null ? `Último: ${hud.ultimo} ms` : 'Toca en verde'} /><Mensaje texto={msg} /></div>;
}

/* ───────── Tiro al blanco ───────── */
function Diana({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ pts: 0, t: 30 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla);
    const pared = crea.caja(12, 8, 0.4, 0x7c2d12); pared.position.set(0, 3, -0.3); scene.add(pared);
    const st = { t: 0, pts: 0, prox: 0.3, dianas: [], fin: false };
    const crear = () => {
      const g = new THREE.Group(); const R = 0.75;
      [[R, 0xffffff], [R * 0.66, 0xef4444], [R * 0.33, 0xfacc15]].forEach(([rr, c], i) => { const d = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, 0.1 + i * 0.02, 32), mat(c)); d.rotation.x = Math.PI / 2; d.position.z = i * 0.02; g.add(d); });
      g.position.set(r.entre(-3.6, 3.6), r.entre(0.4, 5.6), 0); g.scale.setScalar(0.01); scene.add(g);
      st.dianas.push({ g, vida: Math.max(0.8, 1.4 - st.t * 0.02), edad: 0, R });
    };
    camera.position.set(0, 3, 10); camera.lookAt(0, 3, 0);
    return {
      toque(e) {
        if (st.fin) return;
        const t = tocado(ctx, e, st.dianas.map((d) => d.g));
        if (!t) { st.pts = Math.max(0, st.pts - 1); sonar('fallo', { vibrar: false }); return; }
        const d = st.dianas.find((x) => x.g === t.obj); const dist = Math.hypot(t.punto.x - d.g.position.x, t.punto.y - d.g.position.y) / (d.R * d.g.scale.x);
        const p = dist < 0.36 ? 3 : dist < 0.7 ? 2 : 1; st.pts += p; setMsg(`+${p}`); setTimeout(() => setMsg(null), 300); sonar('acierto', { minimo: 0, vibrar: false });
        scene.remove(d.g); st.dianas = st.dianas.filter((x) => x !== d);
      },
      frame(dt) {
        if (st.fin) return;
        st.t += dt; st.prox -= dt;
        if (st.prox <= 0) { crear(); st.prox = Math.max(0.35, 0.75 - st.t * 0.012); }
        st.dianas.forEach((d) => { d.edad += dt; const k = d.edad < 0.15 ? d.edad / 0.15 : d.edad > d.vida - 0.15 ? Math.max(0.01, (d.vida - d.edad) / 0.15) : 1; d.g.scale.setScalar(Math.max(0.01, k)); });
        st.dianas.filter((d) => d.edad >= d.vida).forEach((d) => scene.remove(d.g)); st.dianas = st.dianas.filter((d) => d.edad < d.vida);
        if (st.t >= 30) { st.fin = true; alTerminar(st.pts); }
        setHud((h) => (h.pts !== st.pts || h.t !== Math.ceil(30 - st.t) ? { pts: st.pts, t: Math.max(0, Math.ceil(30 - st.t)) } : h));
      }
    };
  }, { fondo: 0x1c1917 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🎯 ${hud.pts} pts`} der={`⏱️ ${hud.t}s`} /><Mensaje texto={msg} /></div>;
}

export default [
  { id: 'cruzar', nombre: 'Cruza la carretera', emoji: '🐔', como: 'Toca la pantalla (o ▲) para avanzar y ◀ ▶ para apartarte. Cruza todos los carriles que puedas sin que te pille un coche.', mejor: 'mas', unidad: 'carriles', duracion: 60, C: Cruzar },
  { id: 'apilar', nombre: 'Torre perfecta', emoji: '🧱', como: 'El bloque va y viene: toca para soltarlo encima de la torre. Lo que sobresale se cae. Si lo clavas, no pierdes nada.', mejor: 'mas', unidad: 'pisos', duracion: 90, C: Apilar },
  { id: 'secuencia', nombre: 'Memoria de luces', emoji: '💡', como: 'Mira el orden en que se encienden las baldosas y repítelo. Cada ronda, una luz más.', mejor: 'mas', unidad: 'luces', duracion: 120, C: Secuencia },
  { id: 'semaforo', nombre: 'Semáforo', emoji: '🚦', como: 'Toca en cuanto se ponga verde. Cinco rondas. Si tocas antes de tiempo, +1000 ms.', mejor: 'menos', unidad: 'ms', peor: 1000, duracion: 40, C: Semaforo, formato: (v) => `${Math.round(v)} ms` },
  { id: 'diana', nombre: 'Tiro al blanco', emoji: '🎯', como: 'Toca las dianas antes de que desaparezcan: el centro vale 3, el rojo 2 y el blanco 1. Fallar resta 1.', mejor: 'mas', unidad: 'pts', duracion: 30, C: Diana }
];
