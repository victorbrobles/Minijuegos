// Minijuegos (3/6): parejas, salta obstáculos, lluvia de meteoritos, canasta y al ritmo.
import React, { useRef, useState } from 'react';
import { useEscena, rng, crea, tocado, enSuelo, THREE } from '../tres.js';
import { Hud, Mensaje } from '../comun.jsx';
import { sonar, vibrar } from '../../../lib/sonido.js';

/* ───────── Parejas ───────── */
const SIMBOLOS = ['🍎', '⚽', '🚀', '🐱', '🎸', '🌵', '🍩', '⭐', '🐙', '🎲'];
function Parejas({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ t: 0, hechas: 0 });
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla);
    const simbolos = r.barajar([...r.barajar(SIMBOLOS).slice(0, 8)].flatMap((s) => [s, s]));
    const fichas = simbolos.map((s, i) => {
      const g = new THREE.Group(); const base = crea.caja(1.5, 0.2, 1.5, 0x7c3aed); g.add(base);
      const cara = crea.cartel(s, 1.3, 1.3, { fondo: '#ffffff', fuente: '150px sans-serif' }); cara.rotation.x = -Math.PI / 2; cara.position.y = -0.11; cara.rotation.y = Math.PI; g.add(cara);
      const dorso = crea.cartel('?', 1.3, 1.3, { fondo: '#a78bfa', color: '#ffffff' }); dorso.rotation.x = -Math.PI / 2; dorso.position.y = 0.11; g.add(dorso);
      g.position.set((i % 4 - 1.5) * 1.75, 0, (Math.floor(i / 4) - 1.5) * 1.75); scene.add(g);
      return { g, s, giro: 0, objetivo: 0, hecha: false };
    });
    const st = { t: 0, abiertas: [], hechas: 0, bloqueo: 0, fin: false };
    camera.position.set(0, 9.5, 3.5); camera.lookAt(0, 0, 0.3);
    return {
      toque(e) {
        if (st.fin || st.bloqueo > 0) return;
        const t = tocado(ctx, e, fichas.map((f) => f.g)); if (!t) return;
        const f = fichas.find((x) => x.g === t.obj); if (f.hecha || st.abiertas.includes(f)) return;
        f.objetivo = Math.PI; st.abiertas.push(f); sonar('toque', { minimo: 0 });
        if (st.abiertas.length === 2) {
          const [a, b] = st.abiertas;
          if (a.s === b.s) { a.hecha = b.hecha = true; st.abiertas = []; st.hechas++; sonar('acierto'); setHud({ t: st.t, hechas: st.hechas }); if (st.hechas === 8) { st.fin = true; setTimeout(() => alTerminar(Math.round(st.t * 10) / 10), 500); } } else st.bloqueo = 0.75;
        }
      },
      frame(dt) {
        if (!st.fin) st.t += dt;
        if (st.bloqueo > 0) { st.bloqueo -= dt; if (st.bloqueo <= 0) { st.abiertas.forEach((f) => { f.objetivo = 0; }); st.abiertas = []; } }
        fichas.forEach((f) => { f.giro += (f.objetivo - f.giro) * Math.min(1, dt * 14); f.g.rotation.z = f.giro; f.g.position.y = Math.sin(f.giro) * 0.4; });
        if (!st.fin && st.t >= 90) { st.fin = true; alTerminar(90 + (8 - st.hechas) * 3); }
        setHud((h) => (Math.floor(h.t) !== Math.floor(st.t) ? { t: st.t, hechas: st.hechas } : h));
      }
    };
  }, { fondo: 0x2e1065 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🃏 ${hud.hechas}/8 parejas`} der={`⏱️ ${Math.floor(hud.t)} s`} /></div>;
}

/* ───────── Salta obstáculos ───────── */
function Saltar({ semilla, alTerminar }) {
  const ref = useRef(null); const [m, setM] = useState(0); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla);
    const pista = crea.caja(400, 0.3, 3, 0xf97316); pista.position.set(190, -0.15, 0); scene.add(pista);
    for (let k = 0; k < 40; k++) { const linea = crea.caja(0.15, 0.02, 3, 0xffffff); linea.position.set(k * 10, 0.01, 0); scene.add(linea); }
    const obs = []; let x = 14;
    for (let i = 0; i < 70; i++) { const alto = r.entre(0.6, 1.3); const ancho = r.entre(0.5, 1.1); const o = crea.caja(ancho, alto, 2.4, r.de([0x1d4ed8, 0xdb2777, 0x059669])); o.position.set(x, alto / 2, 0); scene.add(o); obs.push({ o, x, alto, ancho }); x += r.entre(5.5, 11) + i * 0.08; }
    const jugador = crea.caja(0.7, 0.9, 0.7, 0xfacc15); scene.add(jugador);
    const st = { x: 0, y: 0, vy: 0, vel: 7, t: 0, fin: false };
    camera.position.set(-3, 3.2, 9);
    const saltar = () => { if (st.fin || st.y > 0.01) return; st.vy = 9.2; sonar('toque', { minimo: 0 }); };
    return {
      toque: saltar,
      frame(dt) {
        if (!st.fin) {
          st.t += dt; st.vel = Math.min(15, 7 + st.t * 0.16); st.x += st.vel * dt;
          st.vy -= 26 * dt; st.y = Math.max(0, st.y + st.vy * dt); if (st.y === 0) st.vy = 0;
          if (obs.some((o) => Math.abs(o.x - st.x) < o.ancho / 2 + 0.33 && st.y < o.alto - 0.05)) { st.fin = true; vibrar(150); sonar('fallo'); setMsg('💥 ¡Choque!'); setTimeout(() => alTerminar(Math.floor(st.x)), 900); }
          if (st.t >= 60) { st.fin = true; alTerminar(Math.floor(st.x)); }
        }
        jugador.position.set(st.x, 0.45 + st.y, 0); jugador.rotation.z = st.y > 0 ? -st.t * 8 : 0;
        camera.position.x = st.x - 1; camera.lookAt(st.x + 4, 1, 0);
        ctx.sol.position.set(st.x + 4, 12, 6); ctx.sol.target.position.set(st.x, 0, 0);
        setM((v) => (v !== Math.floor(st.x) ? Math.floor(st.x) : v));
      }
    };
  }, { fondo: 0xfde68a });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🏃 ${m} m`} der="Toca para saltar" /><Mensaje texto={msg} tipo="mal" /></div>;
}

/* ───────── Lluvia de meteoritos ───────── */
function Meteoritos({ semilla, alTerminar }) {
  const ref = useRef(null); const [t, setT] = useState(0); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla);
    const suelo = crea.caja(10, 0.5, 5, 0x57534e); suelo.position.y = -0.25; scene.add(suelo);
    const jugador = crea.caja(0.7, 0.9, 0.7, 0x22d3ee); jugador.position.y = 0.45; scene.add(jugador);
    const st = { t: 0, x: 0, obj: 0, prox: 0.6, met: [], fin: false };
    camera.position.set(0, 6, 8.5); camera.lookAt(0, 0.5, 0);
    return {
      toque(e) { const p = enSuelo(ctx, e, 0); if (p) st.obj = Math.max(-4.5, Math.min(4.5, p.x)); },
      mover(e) { if (e.buttons || e.pointerType === 'touch') { const p = enSuelo(ctx, e, 0); if (p) st.obj = Math.max(-4.5, Math.min(4.5, p.x)); } },
      frame(dt) {
        if (st.fin) return;
        st.t += dt; st.prox -= dt;
        st.x += (st.obj - st.x) * Math.min(1, dt * 9); jugador.position.x = st.x;
        if (st.prox <= 0) {
          const apunta = r() < 0.45 ? st.x + r.entre(-0.8, 0.8) : r.entre(-4.6, 4.6);
          const x = Math.max(-4.7, Math.min(4.7, apunta)); const z = r.entre(-1.8, 1.8);
          const m = crea.esfera(0.55, 0x9a3412, { emissive: 0xf97316, emissiveIntensity: 0.6 }); m.position.set(x, 14, z); scene.add(m);
          const sombra = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.75, 24), new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8, side: THREE.DoubleSide })); sombra.rotation.x = -Math.PI / 2; sombra.position.set(x, 0.02, z); scene.add(sombra);
          st.met.push({ m, sombra, x, z, vel: 9 + st.t * 0.25 });
          st.prox = Math.max(0.18, 0.62 - st.t * 0.011);
        }
        st.met.forEach((k) => { k.m.position.y -= k.vel * dt; k.sombra.scale.setScalar(1 - Math.min(0.6, k.m.position.y / 25)); });
        st.met.filter((k) => k.m.position.y <= 0.3).forEach((k) => {
          scene.remove(k.m); scene.remove(k.sombra);
          if (Math.abs(k.x - st.x) < 0.85 && Math.abs(k.z) < 1.0) { st.fin = true; vibrar(200); sonar('fallo'); setMsg('☄️ ¡Impacto!'); setTimeout(() => alTerminar(Math.round(st.t * 10) / 10), 900); }
        });
        st.met = st.met.filter((k) => k.m.position.y > 0.3);
        if (!st.fin && st.t >= 45) { st.fin = true; alTerminar(45); }
        setT((v) => (Math.floor(v * 10) !== Math.floor(st.t * 10) ? st.t : v));
      }
    };
  }, { fondo: 0x1e1b4b });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`☄️ ${t.toFixed(1).replace('.', ',')} s`} der="Arrastra para esquivar" /><Mensaje texto={msg} tipo="mal" /></div>;
}

/* ───────── Canasta ───────── */
function Canasta({ alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ n: 0, t: 30 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx;
    const suelo = crea.caja(12, 0.2, 14, 0xc2410c); suelo.position.set(0, -0.1, -3); scene.add(suelo);
    const canasta = new THREE.Group();
    const tablero = crea.caja(2.2, 1.4, 0.1, 0xf8fafc); tablero.position.set(0, 0.7, -0.6); canasta.add(tablero);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.04, 8, 32), new THREE.MeshStandardMaterial({ color: 0xf97316 })); aro.rotation.x = Math.PI / 2; canasta.add(aro);
    const red = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.3, 0.5, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true })); red.position.y = -0.25; canasta.add(red);
    canasta.position.set(0, 3.5, -6); scene.add(canasta);
    const bola = crea.esfera(0.24, 0xea580c); scene.add(bola);
    const st = { t: 0, n: 0, vuelo: false, p: new THREE.Vector3(0, 0.5, 2), v: new THREE.Vector3(), ini: null, tv: 0, fin: false, encestado: false };
    bola.position.copy(st.p);
    camera.position.set(0, 2.6, 5.6); camera.lookAt(0, 2.4, -4);
    const reset = () => { st.vuelo = false; st.p.set(0, 0.5, 2); bola.position.copy(st.p); st.encestado = false; };
    return {
      toque(e) { if (!st.vuelo && !st.fin) st.ini = [e.clientX, e.clientY, performance.now()]; },
      soltar(e) {
        if (!st.ini || st.vuelo) return; const dx = e.clientX - st.ini[0]; const dy = st.ini[1] - e.clientY; st.ini = null;
        if (dy < 30) return; const p = Math.min(1.35, Math.hypot(dx, dy) / 280);
        st.v.set((dx / Math.hypot(dx, dy)) * p * 3.2, 9 * p, -7.5 * p); st.vuelo = true; st.tv = 0; sonar('toque', { minimo: 0 });
      },
      frame(dt) {
        if (!st.fin) st.t += dt;
        canasta.position.x = st.t > 10 ? Math.sin((st.t - 10) * 1.1) * 1.6 : 0;
        if (st.vuelo) {
          st.tv += dt; const yAntes = st.p.y;
          st.v.y -= 12 * dt; st.p.addScaledVector(st.v, dt); bola.position.copy(st.p); bola.rotation.x -= dt * 8;
          const c = canasta.position;
          if (!st.encestado && yAntes > c.y && st.p.y <= c.y && st.v.y < 0 && Math.hypot(st.p.x - c.x, st.p.z - c.z) < 0.42) { st.encestado = true; st.n++; sonar('victoria'); setMsg('🏀 ¡Canasta!'); setTimeout(() => setMsg(null), 600); }
          // Rebote en el tablero
          if (st.p.z < c.z - 0.5 && st.p.z > c.z - 0.75 && Math.abs(st.p.x - c.x) < 1.1 && Math.abs(st.p.y - c.y - 0.7) < 0.7) { st.v.z = Math.abs(st.v.z) * 0.5; }
          if (st.p.y < -1 || st.tv > 2.6) reset();
        }
        if (!st.fin && st.t >= 30) { st.fin = true; alTerminar(st.n); }
        setHud((h) => (h.n !== st.n || h.t !== Math.ceil(30 - st.t) ? { n: st.n, t: Math.max(0, Math.ceil(30 - st.t)) } : h));
      }
    };
  }, { fondo: 0x172554 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🏀 ${hud.n} canastas`} der={`⏱️ ${hud.t}s`} /><Mensaje texto={msg} /><p className="hb-pista">Desliza el dedo hacia arriba para lanzar</p></div>;
}

/* ───────── Al ritmo ───────── */
function Ritmo({ semilla, alTerminar }) {
  const ref = useRef(null); const ctl = useRef({}); const [hud, setHud] = useState({ pts: 0, t: 30 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla); const V = 9; const COL = [0xec4899, 0x22d3ee, 0xfacc15];
    COL.forEach((c, i) => { const carril = crea.caja(1.6, 0.1, 30, 0x1f2937); carril.position.set((i - 1) * 1.8, -0.05, -12); scene.add(carril); const meta = crea.caja(1.6, 0.12, 0.25, c, { emissive: c, emissiveIntensity: 0.5 }); meta.position.set((i - 1) * 1.8, 0.02, 0); scene.add(meta); });
    const notas = []; let t = 1.2;
    while (t < 28.5) { const carril = r.entero(0, 2); const m = crea.esfera(0.45, COL[carril], { emissive: COL[carril], emissiveIntensity: 0.4 }); scene.add(m); notas.push({ t, carril, m, hecha: false }); t += r.entre(0.32, 0.8) * Math.max(0.6, 1 - t * 0.012); }
    const st = { t: 0, pts: 0, fin: false };
    ctl.current.pulsar = (carril) => {
      if (st.fin) return;
      const cand = notas.filter((n) => !n.hecha && n.carril === carril && Math.abs(n.t - st.t) < 0.16).sort((a, b) => Math.abs(a.t - st.t) - Math.abs(b.t - st.t))[0];
      if (!cand) { st.pts = Math.max(0, st.pts - 1); setMsg('✗'); return; }
      const d = Math.abs(cand.t - st.t); const p = d < 0.06 ? 3 : 1; st.pts += p; cand.hecha = true; scene.remove(cand.m);
      setMsg(p === 3 ? '¡Perfecto! +3' : '¡Bien! +1'); sonar('tic', { minimo: 0, vibrar: false }); vibrar(10);
    };
    camera.position.set(0, 4.5, 4.5); camera.lookAt(0, 0, -6);
    return {
      frame(dt) {
        if (st.fin) return;
        st.t += dt;
        notas.forEach((n) => { if (!n.hecha) n.m.position.set((n.carril - 1) * 1.8, 0.45, -(n.t - st.t) * V); if (!n.hecha && st.t - n.t > 0.2) { n.hecha = true; scene.remove(n.m); } });
        if (st.t >= 30) { st.fin = true; alTerminar(st.pts); }
        setHud((h) => (h.pts !== st.pts || h.t !== Math.ceil(30 - st.t) ? { pts: st.pts, t: Math.max(0, Math.ceil(30 - st.t)) } : h));
      }
    };
  }, { fondo: 0x0b0b1f });
  return (
    <div className="hb-caja">
      <div ref={ref} className="hb-lienzo" /><Hud izq={`🎵 ${hud.pts} pts`} der={`⏱️ ${hud.t}s`} /><Mensaje texto={msg} />
      <div className="hb-carriles">{['#ec4899', '#22d3ee', '#facc15'].map((c, i) => <button key={c} type="button" style={{ background: c }} onPointerDown={(e) => { e.preventDefault(); ctl.current.pulsar?.(i); }} aria-label={`Carril ${i + 1}`} />)}</div>
    </div>
  );
}

export default [
  { id: 'parejas', nombre: 'Parejas', emoji: '🃏', como: 'Da la vuelta a las fichas de dos en dos y encuentra las 8 parejas lo más rápido posible.', mejor: 'menos', unidad: 's', peor: 114, duracion: 90, C: Parejas, formato: (v) => `${v.toFixed(1).replace('.', ',')} s` },
  { id: 'saltar', nombre: 'Salta obstáculos', emoji: '🏃', como: 'Corres solo y cada vez más rápido: toca para saltar los obstáculos. Llega lo más lejos posible.', mejor: 'mas', unidad: 'm', duracion: 60, C: Saltar },
  { id: 'meteoritos', nombre: 'Lluvia de meteoritos', emoji: '☄️', como: 'Arrastra el dedo para mover tu cubo y esquiva los meteoritos (el círculo rojo marca dónde caen). Aguanta 45 segundos.', mejor: 'mas', unidad: 's', duracion: 45, C: Meteoritos, formato: (v) => `${v.toFixed(1).replace('.', ',')} s` },
  { id: 'canasta', nombre: 'Canasta', emoji: '🏀', como: 'Desliza el dedo hacia arriba para lanzar: la longitud del gesto es la fuerza y el ángulo, la dirección. A los 10 segundos la canasta empieza a moverse.', mejor: 'mas', unidad: 'canastas', duracion: 30, C: Canasta },
  { id: 'ritmo', nombre: 'Al ritmo', emoji: '🎵', como: 'Pulsa el botón del color justo cuando la bola llega a la línea. En el momento exacto: +3; casi: +1; si pulsas sin nota, −1.', mejor: 'mas', unidad: 'pts', duracion: 30, C: Ritmo }
];
