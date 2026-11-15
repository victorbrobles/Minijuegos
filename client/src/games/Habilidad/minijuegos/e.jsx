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
    const { scene, camera } = ctx; const r = rng(semilla);
    const cubo = crea.caja(4.6, 2.2, 0.6, 0xf8fafc); scene.add(cubo);
    const cartel = marcador({ tam: 1.6, fondo: null, ancho: 800 }); cartel.position.set(0, 0, 0.5); scene.add(cartel);
    const st = { t: 0, pts: 0, palabra: 0, tinta: 1, fin: false };
    const nueva = () => { st.palabra = r.entero(0, 3); do { st.tinta = r.entero(0, 3); } while (r() < 0.75 && st.tinta === st.palabra); cartel.poner(TINTAS[st.palabra][0], TINTAS[st.tinta][1]); cubo.rotation.y = r.entre(-0.3, 0.3); };
    nueva();
    ctl.current.elegir = (k) => { if (st.fin) return; if (k === st.tinta) { st.pts++; sonar('tic', { minimo: 0, vibrar: false }); } else { st.pts = Math.max(0, st.pts - 1); sonar('fallo', { vibrar: false }); vibrar(40); setMsg('✗'); setTimeout(() => setMsg(null), 250); } nueva(); };
    camera.position.set(0, 0.5, 7); camera.lookAt(0, 0, 0);
    return {
      frame(dt, t) {
        if (st.fin) return; st.t += dt; cubo.position.y = Math.sin(t * 2) * 0.15; cartel.position.y = cubo.position.y;
        if (st.t >= 30) { st.fin = true; alTerminar(st.pts); }
        setHud((h) => (h.pts !== st.pts || h.t !== Math.ceil(30 - st.t) ? { pts: st.pts, t: Math.max(0, Math.ceil(30 - st.t)) } : h));
      }
    };
  }, { fondo: 0x1e293b });
  return (
    <div className="hb-caja">
      <div ref={ref} className="hb-lienzo" /><Hud izq={`🎨 ${hud.pts} pts`} der={`⏱️ ${hud.t}s`} /><Mensaje texto={msg} tipo="mal" />
      <p className="hb-pista">Toca el color de la TINTA, no lo que pone</p>
      <div className="hb-colores">{TINTAS.map(([n, c], k) => <button key={n} type="button" style={{ background: c }} onPointerDown={(e) => { e.preventDefault(); ctl.current.elegir?.(k); }} aria-label={n} />)}</div>
    </div>
  );
}

/* ───────── Encaja la pieza ───────── */
const FORMAS = [[[0, 0], [1, 0], [2, 0], [0, 1]], [[0, 0], [1, 0], [2, 0], [1, 1]], [[0, 0], [1, 0], [1, 1], [2, 1]], [[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [1, 0], [0, 1], [0, 2], [1, 2]], [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]]];
const rotar = (celdas, k) => { let c = celdas; for (let i = 0; i < k; i++) c = c.map(([x, y]) => [-y, x]); const mx = Math.min(...c.map((p) => p[0])); const my = Math.min(...c.map((p) => p[1])); return c.map(([x, y]) => [x - mx, y - my]); };
const clave = (c) => c.map(([x, y]) => `${x},${y}`).sort().join('|');
function Encajar({ semilla, alTerminar }) {
  const ref = useRef(null); const ctl = useRef({}); const [hud, setHud] = useState({ n: 1, ok: 0 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla);
    const suelo = crea.caja(8, 0.2, 40, 0x334155); suelo.position.set(0, -2.6, -14); scene.add(suelo);
    const st = { i: 0, ok: 0, z: 6, rot: 0, rotVisual: 0, pieza: null, muro: null, forma: null, objetivo: null, fin: false, pausa: 0 };
    const montar = () => {
      if (st.pieza) scene.remove(st.pieza); if (st.muro) scene.remove(st.muro);
      st.forma = r.de(FORMAS); st.objetivo = rotar(st.forma, r.entero(0, 3)); st.rot = r.entero(0, 3); st.rotVisual = st.rot * Math.PI / 2;
      const muro = new THREE.Group(); const hueco = new Set(st.objetivo.map(([x, y]) => `${x},${y}`));
      const ox = Math.max(...st.objetivo.map((p) => p[0])) / 2; const oy = Math.max(...st.objetivo.map((p) => p[1])) / 2;
      for (let x = -4; x <= 6; x++) for (let y = -3; y <= 5; y++) { if (hueco.has(`${x},${y}`)) continue; const b = crea.caja(1, 1, 0.6, 0xf97316); b.position.set(x - ox, y - oy, 0); muro.add(b); }
      muro.position.z = -14; scene.add(muro); st.muro = muro;
      const pieza = new THREE.Group(); const cx = 1; const cy = 1;
      st.forma.forEach(([x, y]) => { const b = crea.caja(0.92, 0.92, 0.92, 0x22d3ee); b.position.set(x - cx, y - cy, 0); pieza.add(b); });
      pieza.position.set(0, 0, 4); scene.add(pieza); st.pieza = pieza; st.z = 4;
    };
    montar();
    ctl.current.girar = (k) => { if (!st.fin && st.pausa <= 0) { st.rot = (st.rot + k + 4) % 4; sonar('toque', { minimo: 0 }); } };
    camera.position.set(3, 3, 9); camera.lookAt(0, 0, -6);
    return {
      frame(dt) {
        if (st.fin) return;
        if (st.pausa > 0) { st.pausa -= dt; if (st.pausa <= 0) { st.i++; if (st.i >= 10) { st.fin = true; alTerminar(st.ok); return; } montar(); setHud({ n: st.i + 1, ok: st.ok }); } return; }
        st.z -= (5 + st.i * 1.2) * dt; st.pieza.position.z = st.z;
        st.rotVisual += (st.rot * Math.PI / 2 - st.rotVisual) * Math.min(1, dt * 14); st.pieza.rotation.z = st.rotVisual;
        if (st.z <= -13.5) {
          const bien = clave(rotar(st.forma, st.rot)) === clave(st.objetivo);
          if (bien) { st.ok++; sonar('acierto'); setMsg('✅ ¡Encaja!'); } else { sonar('fallo'); vibrar(100); setMsg('💥 ¡No cabe!'); }
          st.pausa = 0.9; setHud({ n: st.i + 1, ok: st.ok }); setTimeout(() => setMsg(null), 800);
        }
      }
    };
  }, { fondo: 0x0f172a });
  return (
    <div className="hb-caja">
      <div ref={ref} className="hb-lienzo" /><Hud izq={`🧩 Pieza ${Math.min(10, hud.n)}/10`} der={`✅ ${hud.ok}`} /><Mensaje texto={msg} />
      <Botones><Boton ancho onPulsar={() => ctl.current.girar?.(1)}>⟲ Girar</Boton><Boton ancho onPulsar={() => ctl.current.girar?.(-1)}>Girar ⟳</Boton></Botones>
    </div>
  );
}

/* ───────── Pesca rápida ───────── */
function Pesca({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ n: 0, t: 40 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla);
    const agua = new THREE.Mesh(new THREE.BoxGeometry(14, 7, 3), new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.35 })); agua.position.y = -3.5; scene.add(agua);
    const fondo = crea.caja(14, 0.3, 3, 0xfde68a); fondo.position.y = -7.1; scene.add(fondo);
    const barca = crea.caja(1.8, 0.5, 1, 0x92400e); scene.add(barca);
    const anzuelo = crea.esfera(0.18, 0xe5e7eb, { metalness: 0.8 }); scene.add(anzuelo);
    const sedal = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0xffffff })); scene.add(sedal);
    const peces = [];
    const st = { t: 0, n: 0, x: 0, dir: 1, y: 0.3, baja: 0, preso: null, prox: 0, fin: false };
    const pez = () => { const oro = r() < 0.15; const m = crea.esfera(0.45, oro ? 0xfacc15 : r.de([0xf97316, 0xec4899, 0x22c55e, 0xa855f7])); m.scale.set(1.6, 0.8, 0.6); const dir = r() < 0.5 ? 1 : -1; m.position.set(-8 * dir, r.entre(-6.2, -1.2), 0); const cola = crea.cilindro(0, 0.35, 0.5, m.material.color.getHex(), 3); cola.rotation.z = (dir * Math.PI) / 2; cola.position.x = -0.7 * dir / 1.6; m.add(cola); scene.add(m); peces.push({ m, dir, vel: r.entre(1.5, 3.4) * (oro ? 1.5 : 1), oro }); };
    camera.position.set(0, -1.5, 13); camera.lookAt(0, -2.8, 0);
    return {
      toque() { if (!st.fin && st.baja === 0 && !st.preso) { st.baja = 1; sonar('toque', { minimo: 0 }); } },
      frame(dt) {
        if (st.fin) return; st.t += dt; st.prox -= dt;
        if (st.prox <= 0) { pez(); st.prox = r.entre(0.5, 1.1); }
        if (st.baja === 0 && !st.preso) { st.x += st.dir * 3.2 * dt; if (Math.abs(st.x) > 5.5) st.dir *= -1; }
        if (st.baja === 1) { st.y -= 11 * dt; if (st.y < -6.6) st.baja = -1; }
        if (st.baja === -1) { st.y += 12 * dt; if (st.y >= 0.3) { st.y = 0.3; st.baja = 0; if (st.preso) { scene.remove(st.preso.m); st.n += st.preso.oro ? 3 : 1; sonar('acierto'); setMsg(st.preso.oro ? '🐠 ¡Dorado! +3' : '🐟 +1'); setTimeout(() => setMsg(null), 500); st.preso = null; } } }
        barca.position.set(st.x, 0.5, 0); anzuelo.position.set(st.x, st.y, 0);
        sedal.geometry.setFromPoints([new THREE.Vector3(st.x, 0.6, 0), new THREE.Vector3(st.x, st.y, 0)]);
        peces.forEach((p) => { if (p === st.preso) { p.m.position.set(st.x, st.y - 0.4, 0); return; } p.m.position.x += p.dir * p.vel * dt; });
        if (st.baja === 1 && !st.preso) { const p = peces.find((q) => q !== st.preso && Math.abs(q.m.position.x - st.x) < 0.75 && Math.abs(q.m.position.y - st.y) < 0.45); if (p) { st.preso = p; st.baja = -1; vibrar(30); } }
        for (let i = peces.length - 1; i >= 0; i--) if (Math.abs(peces[i].m.position.x) > 9 && peces[i] !== st.preso) { scene.remove(peces[i].m); peces.splice(i, 1); }
        if (st.t >= 40) { st.fin = true; alTerminar(st.n); }
        setHud((h) => (h.n !== st.n || h.t !== Math.ceil(40 - st.t) ? { n: st.n, t: Math.max(0, Math.ceil(40 - st.t)) } : h));
      }
    };
  }, { fondo: 0x7dd3fc });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🎣 ${hud.n} peces`} der={`⏱️ ${hud.t}s`} /><Mensaje texto={msg} /><p className="hb-pista">Toca para echar el anzuelo</p></div>;
}

/* ───────── Trileros ───────── */
function Trileros({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ ronda: 1, ok: 0, txt: 'Mira dónde está la bola' }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla);
    const mesa = crea.caja(10, 0.3, 5, 0x166534); mesa.position.y = -0.15; scene.add(mesa);
    const vasos = [-2.5, 0, 2.5].map((x) => { const v = crea.cilindro(0.55, 0.9, 1.4, 0xdc2626, 28); v.position.set(x, 0.7, 0); scene.add(v); return { m: v, pos: x }; });
    const bola = crea.esfera(0.32, 0xfacc15); bola.position.y = 0.32; scene.add(bola);
    const st = { ronda: 0, ok: 0, con: 0, fase: 'mostrar', t: 0, swaps: [], si: 0, prog: 0, fin: false };
    const preparar = () => { st.con = r.entero(0, 2); bola.position.x = vasos[st.con].pos; st.fase = 'mostrar'; st.t = 0; const n = 3 + st.ronda * 2; st.swaps = Array.from({ length: n }, () => { const a = r.entero(0, 2); let b; do { b = r.entero(0, 2); } while (b === a); return [a, b]; }); st.si = 0; st.prog = 0; setHud({ ronda: st.ronda + 1, ok: st.ok, txt: 'Mira dónde está la bola' }); };
    preparar();
    camera.position.set(0, 5.5, 7); camera.lookAt(0, 0.5, 0);
    return {
      toque(e) {
        if (st.fase !== 'elegir' || st.fin) return;
        const t = tocado(ctx, e, vasos.map((v) => v.m)); if (!t) return;
        const k = vasos.findIndex((v) => v.m === t.obj); const bien = k === st.con;
        if (bien) { st.ok++; sonar('acierto'); setMsg('✅ ¡Ahí estaba!'); } else { sonar('fallo'); setMsg('❌ ¡No!'); }
        st.fase = 'revelar'; st.t = 0; st.elegido = k;
      },
      frame(dt) {
        st.t += dt;
        vasos.forEach((v) => { v.m.position.x += (v.pos - v.m.position.x) * Math.min(1, dt * 30); });
        bola.position.x = vasos[st.con].pos;
        if (st.fase === 'mostrar') { const sube = st.t < 1.4 ? Math.min(1, st.t * 4) : Math.max(0, 1 - (st.t - 1.4) * 4); vasos.forEach((v) => { v.m.position.y = 0.7 + sube * 1.4; }); if (st.t > 1.7) { st.fase = 'mezclar'; st.t = 0; setHud((h) => ({ ...h, txt: 'Mezclando…' })); } }
        if (st.fase === 'mezclar') {
          const dur = Math.max(0.16, 0.45 - st.ronda * 0.05); st.prog += dt / dur;
          const [a, b] = st.swaps[st.si]; const pa = [-2.5, 0, 2.5]; const xa = vasos[a].base ?? vasos[a].pos; const xb = vasos[b].base ?? vasos[b].pos;
          if (vasos[a].base === undefined) { vasos[a].base = vasos[a].pos; vasos[b].base = vasos[b].pos; }
          const u = Math.min(1, st.prog); vasos[a].pos = xa + (xb - xa) * u; vasos[b].pos = xb + (xa - xb) * u;
          vasos[a].m.position.z = Math.sin(u * Math.PI) * 1.1; vasos[b].m.position.z = -Math.sin(u * Math.PI) * 1.1;
          if (u >= 1) { vasos[a].pos = xb; vasos[b].pos = xa; delete vasos[a].base; delete vasos[b].base; vasos[a].m.position.z = 0; vasos[b].m.position.z = 0; st.prog = 0; st.si++; void pa; if (st.si >= st.swaps.length) { st.fase = 'elegir'; setHud((h) => ({ ...h, txt: '¿Dónde está?' })); } }
        }
        if (st.fase === 'revelar') { const sube = Math.min(1, st.t * 4); vasos.forEach((v, k) => { v.m.position.y = 0.7 + (k === st.con || k === st.elegido ? sube * 1.4 : 0); }); if (st.t > 1.3) { setMsg(null); vasos.forEach((v) => { v.m.position.y = 0.7; }); st.ronda++; if (st.ronda >= 6) { st.fin = true; alTerminar(st.ok); st.fase = 'fin'; } else preparar(); } }
      }
    };
  }, { fondo: 0x14532d });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🥤 Ronda ${hud.ronda}/6 · ✅ ${hud.ok}`} der={hud.txt} /><Mensaje texto={msg} /></div>;
}

/* ───────── Dedo veloz ───────── */
function Veloz({ alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ n: 0, t: 10, empezado: false });
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx;
    const globo = crea.esfera(0.6, 0xef4444, { roughness: 0.2 }); globo.position.y = 1; scene.add(globo);
    const nudo = crea.cilindro(0.04, 0.12, 0.2, 0xef4444); scene.add(nudo);
    const hilo = crea.cilindro(0.01, 0.01, 3, 0xffffff); hilo.position.y = -1.5; scene.add(hilo);
    const st = { n: 0, t: 0, empezado: false, fin: false, escala: 1 };
    camera.position.set(0, 1.5, 8); camera.lookAt(0, 1, 0);
    return {
      toque() { if (st.fin) return; st.empezado = true; st.n++; st.escala = 1 + st.n * 0.035; sonar('toque', { minimo: 0, vibrar: false }); vibrar(5); },
      frame(dt, t) {
        if (st.empezado && !st.fin) { st.t += dt; if (st.t >= 10) { st.fin = true; sonar('victoria'); alTerminar(st.n); } }
        const e = globo.scale.x + (st.escala - globo.scale.x) * 0.3; globo.scale.set(e, e * 1.12, e); globo.position.y = 1 + 0.6 * e; nudo.position.y = globo.position.y - 0.6 * e * 1.12; globo.rotation.z = Math.sin(t * 2) * 0.05;
        setHud((h) => (h.n !== st.n || h.t !== Math.ceil(10 - st.t) ? { n: st.n, t: Math.max(0, Math.ceil(10 - st.t)), empezado: st.empezado } : h));
      }
    };
  }, { fondo: 0xfdf2f8 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`👆 ${hud.n} toques`} der={hud.empezado ? `⏱️ ${hud.t}s` : 'El tiempo empieza con el primer toque'} /></div>;
}

export default [
  { id: 'stroop', nombre: 'Colores traicioneros', emoji: '🎨', como: 'Sale el nombre de un color pintado de otro color. Toca el color de la TINTA, no lo que pone. +1 si aciertas, −1 si fallas. 30 segundos.', mejor: 'mas', unidad: 'pts', duracion: 30, C: Stroop },
  { id: 'encajar', nombre: 'Encaja la pieza', emoji: '🧩', como: 'La pieza avanza hacia un muro con un hueco. Gírala (⟲ ⟳) para que pase justo por el hueco. Diez piezas, cada vez más rápidas.', mejor: 'mas', unidad: 'piezas', duracion: 60, C: Encajar },
  { id: 'pesca', nombre: 'Pesca rápida', emoji: '🎣', como: 'La barca va de lado a lado: toca para echar el anzuelo justo cuando pase un pez. Los dorados valen 3. 40 segundos.', mejor: 'mas', unidad: 'peces', duracion: 40, C: Pesca },
  { id: 'trileros', nombre: 'Trileros', emoji: '🥤', como: 'Fíjate en qué vaso está la bola. Se mezclan cada vez más rápido: después, toca el vaso correcto. Seis rondas.', mejor: 'mas', unidad: 'aciertos', duracion: 75, C: Trileros },
  { id: 'veloz', nombre: 'Dedo veloz', emoji: '👆', como: 'Toca la pantalla lo más rápido que puedas durante 10 segundos para inflar el globo.', mejor: 'mas', unidad: 'toques', duracion: 25, C: Veloz }
];
