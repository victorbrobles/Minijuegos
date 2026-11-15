// Minijuegos (6/6): ascensor exacto, serpiente, sprint, ¿qué ha cambiado? y clava cuchillos.
import React, { useRef, useState } from 'react';
import { useEscena, rng, crea, tocado, THREE } from '../tres.js';
import { Hud, Botones, Boton, Mensaje } from '../comun.jsx';
import { sonar, vibrar } from '../../../lib/sonido.js';

/* ───────── Ascensor exacto ───────── */
function Ascensor({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ i: 1, pts: 0, piso: 0 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla); const ALTO = 2;
    const edificio = crea.caja(5, 20, 0.5, 0x475569); edificio.position.set(0, 9, -1); scene.add(edificio);
    const marcas = []; for (let k = 0; k < 10; k++) { const m = crea.caja(5, 0.08, 0.6, 0xfde047); m.position.set(0, k * ALTO, -0.6); scene.add(m); marcas.push(m); const n = crea.texto(String(k), { tam: 0.6, color: '#0f172a', fondo: '#fde047' }); n.position.set(-3.1, k * ALTO + 0.5, 0); scene.add(n); }
    const cabina = crea.caja(2, 1.9, 1.4, 0xe2e8f0); scene.add(cabina);
    const pisos = Array.from({ length: 8 }, () => r.entero(1, 8));
    const st = { i: 0, y: 0, dir: 1, vel: 4, para: false, pts: 0, fin: false };
    const destacar = () => marcas.forEach((m, k) => { m.material = new THREE.MeshStandardMaterial({ color: k === pisos[st.i] ? 0x22c55e : 0xfde047, emissive: k === pisos[st.i] ? 0x22c55e : 0, emissiveIntensity: 0.6 }); });
    destacar();
    camera.position.set(4, 4, 11); camera.lookAt(0, 4, 0);
    return {
      toque() {
        if (st.para || st.fin) return; st.para = true;
        const err = Math.abs(st.y - pisos[st.i] * ALTO); const p = Math.max(0, Math.round(100 - err * 120)); st.pts += p;
        setMsg(p >= 95 ? '🎯 ¡Clavado! +' + p : `+${p}`); sonar(p > 80 ? 'acierto' : 'carta');
        setHud({ i: Math.min(8, st.i + 2), pts: st.pts, piso: pisos[st.i + 1] ?? pisos[st.i] });
        setTimeout(() => { setMsg(null); st.i++; if (st.i >= 8) { st.fin = true; alTerminar(st.pts); return; } st.para = false; st.vel = 4 + st.i * 0.9; destacar(); }, 1000);
      },
      frame(dt) {
        if (!st.para && !st.fin) { st.y += st.dir * st.vel * dt; if (st.y > 18) { st.y = 18; st.dir = -1; } if (st.y < 0) { st.y = 0; st.dir = 1; } }
        cabina.position.y = st.y + 0.95;
        camera.position.y += (st.y + 3 - camera.position.y) * 0.08; camera.lookAt(0, camera.position.y - 1.5, 0);
      }
    };
  }, { fondo: 0x0f172a });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🛗 Viaje ${hud.i}/8`} der={`${hud.pts} pts`} /><Mensaje texto={msg} /><p className="hb-pista">Toca para parar el ascensor justo en la planta verde</p></div>;
}

/* ───────── Serpiente ───────── */
function Serpiente({ semilla, alTerminar }) {
  const ref = useRef(null); const ctl = useRef({}); const [hud, setHud] = useState({ largo: 3, t: 60 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla); const N = 12;
    const tablero = crea.caja(N + 0.4, 0.3, N + 0.4, 0x14532d); tablero.position.y = -0.2; scene.add(tablero);
    const pos = (x) => x - (N - 1) / 2;
    const st = { cuerpo: [[5, 6], [4, 6], [3, 6]], dir: [1, 0], sig: [1, 0], paso: 0, t: 0, comida: null, mallas: [], fin: false, crecer: 0 };
    const manzana = crea.esfera(0.4, 0xef4444); scene.add(manzana);
    const ponComida = () => { let c; do { c = [r.entero(0, N - 1), r.entero(0, N - 1)]; } while (st.cuerpo.some(([x, z]) => x === c[0] && z === c[1])); st.comida = c; manzana.position.set(pos(c[0]), 0.4, pos(c[1])); };
    ponComida();
    const dibujar = () => { while (st.mallas.length < st.cuerpo.length) { const m = crea.caja(0.9, 0.6, 0.9, st.mallas.length ? 0x4ade80 : 0x16a34a); scene.add(m); st.mallas.push(m); } st.cuerpo.forEach(([x, z], i) => st.mallas[i].position.set(pos(x), 0.3, pos(z))); };
    dibujar();
    ctl.current.girar = (k) => { const [dx, dz] = st.dir; st.sig = k > 0 ? [-dz, dx] : [dz, -dx]; sonar('toque', { minimo: 0 }); };
    camera.position.set(0, 13, 7); camera.lookAt(0, 0, 0.5);
    const acabar = () => { st.fin = true; vibrar(150); sonar('fallo'); setMsg('💥 ¡Chocaste!'); setTimeout(() => alTerminar(st.cuerpo.length), 900); };
    return {
      toque(e) { const rr = ctx.el.getBoundingClientRect(); ctl.current.girar(e.clientX - rr.left < rr.width / 2 ? -1 : 1); },
      frame(dt) {
        if (st.fin) return; st.t += dt; st.paso += dt;
        const ritmo = Math.max(0.09, 0.2 - st.cuerpo.length * 0.004);
        if (st.paso >= ritmo) {
          st.paso = 0; st.dir = st.sig; const [hx, hz] = st.cuerpo[0]; const n = [hx + st.dir[0], hz + st.dir[1]];
          if (n[0] < 0 || n[1] < 0 || n[0] >= N || n[1] >= N || st.cuerpo.some(([x, z]) => x === n[0] && z === n[1])) { acabar(); return; }
          st.cuerpo.unshift(n);
          if (n[0] === st.comida[0] && n[1] === st.comida[1]) { st.crecer += 1; sonar('acierto', { vibrar: false }); ponComida(); }
          if (st.crecer > 0) st.crecer--; else st.cuerpo.pop();
          dibujar();
        }
        if (st.t >= 60) { st.fin = true; alTerminar(st.cuerpo.length); }
        setHud((h) => (h.largo !== st.cuerpo.length || h.t !== Math.ceil(60 - st.t) ? { largo: st.cuerpo.length, t: Math.max(0, Math.ceil(60 - st.t)) } : h));
      }
    };
  }, { fondo: 0x052e16 });
  return (
    <div className="hb-caja">
      <div ref={ref} className="hb-lienzo" /><Hud izq={`🐍 Largo ${hud.largo}`} der={`⏱️ ${hud.t}s`} /><Mensaje texto={msg} tipo="mal" />
      <Botones><Boton ancho onPulsar={() => ctl.current.girar?.(-1)}>↶ Izquierda</Boton><Boton ancho onPulsar={() => ctl.current.girar?.(1)}>Derecha ↷</Boton></Botones>
    </div>
  );
}

/* ───────── Sprint 100 m ───────── */
function Sprint({ alTerminar }) {
  const ref = useRef(null); const ctl = useRef({}); const [hud, setHud] = useState({ m: 0, t: 0 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx;
    const pista = crea.caja(4, 0.2, 120, 0xb91c1c); pista.position.set(0, -0.1, -55); scene.add(pista);
    for (let z = 0; z >= -100; z -= 10) { const l = crea.caja(4, 0.02, 0.12, 0xffffff); l.position.set(0, 0.01, z); scene.add(l); }
    const meta = crea.caja(4, 0.03, 0.5, 0xfacc15); meta.position.set(0, 0.02, -100); scene.add(meta);
    const corredor = new THREE.Group(); const cuerpo = crea.caja(0.6, 1, 0.4, 0x2563eb); cuerpo.position.y = 1.2; corredor.add(cuerpo); const cabeza = crea.esfera(0.25, 0xfcd34d); cabeza.position.y = 1.95; corredor.add(cabeza);
    const piernas = [-0.15, 0.15].map((x) => { const p = crea.caja(0.18, 0.7, 0.18, 0x1e293b); p.geometry.translate(0, -0.35, 0); p.position.set(x, 0.7, 0); corredor.add(p); return p; });
    scene.add(corredor);
    const st = { z: 0, v: 0, t: 0, ultimo: null, empezado: false, fin: false, fase: 0 };
    ctl.current.pie = (k) => {
      if (st.fin) return; st.empezado = true;
      if (k !== st.ultimo) { st.v = Math.min(12, st.v + 0.9); st.ultimo = k; sonar('tic', { minimo: 0, vibrar: false }); } else { st.v *= 0.6; setMsg('¡Alterna!'); setTimeout(() => setMsg(null), 300); }
    };
    return {
      frame(dt) {
        if (st.empezado && !st.fin) { st.t += dt; st.v = Math.max(0, st.v - 3.2 * dt); st.z -= st.v * dt; st.fase += st.v * dt * 1.8; if (st.z <= -100) { st.fin = true; sonar('victoria'); alTerminar(Math.round(st.t * 100) / 100); } if (st.t > 40) { st.fin = true; alTerminar(40); } }
        corredor.position.z = st.z; piernas[0].rotation.x = Math.sin(st.fase) * 0.8; piernas[1].rotation.x = -Math.sin(st.fase) * 0.8;
        camera.position.set(4, 3, st.z + 6); camera.lookAt(0, 1, st.z - 4);
        ctx.sol.position.set(5, 12, st.z + 5); ctx.sol.target.position.set(0, 0, st.z);
        setHud((h) => (Math.floor(-st.z) !== h.m || Math.floor(st.t * 10) !== Math.floor(h.t * 10) ? { m: Math.floor(-st.z), t: st.t } : h));
      }
    };
  }, { fondo: 0x93c5fd });
  return (
    <div className="hb-caja">
      <div ref={ref} className="hb-lienzo" /><Hud izq={`🏃 ${hud.m}/100 m`} der={`⏱️ ${hud.t.toFixed(1).replace('.', ',')} s`} /><Mensaje texto={msg} tipo="mal" />
      <Botones><Boton ancho onPulsar={() => ctl.current.pie?.(0)}>👟 Izq.</Boton><Boton ancho onPulsar={() => ctl.current.pie?.(1)}>Der. 👟</Boton></Botones>
    </div>
  );
}

/* ───────── ¿Qué ha cambiado? ───────── */
const COLS = [0xef4444, 0x3b82f6, 0x22c55e, 0xfacc15, 0xa855f7, 0xf97316];
function Cambio({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ ronda: 1, ok: 0, txt: 'Memoriza la mesa' }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla);
    const mesa = crea.caja(9, 0.3, 6, 0x713f12); mesa.position.y = -0.15; scene.add(mesa);
    const telon = crea.caja(9.2, 0.2, 6.2, 0x111827); telon.position.y = 9; scene.add(telon);
    const st = { ronda: 0, ok: 0, objs: [], fase: 'ver', t: 0, cambiado: null, fin: false };
    const figura = (f, c) => (f === 0 ? crea.caja(0.8, 0.8, 0.8, c) : f === 1 ? crea.esfera(0.45, c) : crea.cilindro(0, 0.5, 1, c));
    const montar = () => {
      st.objs.forEach((o) => scene.remove(o.m)); st.objs = [];
      const n = 5 + Math.min(4, st.ronda);
      const huecos = r.barajar(Array.from({ length: 15 }, (_, i) => [(i % 5 - 2) * 1.7, (Math.floor(i / 5) - 1) * 1.8])).slice(0, n);
      huecos.forEach(([x, z]) => { const f = r.entero(0, 2); const c = r.de(COLS); const m = figura(f, c); m.position.set(x, 0.45, z); scene.add(m); st.objs.push({ m, f, c, x, z }); });
      st.fase = 'ver'; st.t = 0; telon.position.y = 9;
    };
    montar();
    camera.position.set(0, 8.5, 6.5); camera.lookAt(0, 0, 0.4);
    return {
      toque(e) {
        if (st.fase !== 'elegir' || st.fin) return;
        const t = tocado(ctx, e, st.objs.map((o) => o.m)); if (!t) return;
        const bien = t.obj === st.cambiado.m; if (bien) { st.ok++; sonar('acierto'); setMsg('✅ ¡Ese!'); } else { sonar('fallo'); setMsg('❌ Era el que brilla'); st.cambiado.m.material = new THREE.MeshStandardMaterial({ color: st.cambiado.m.material.color, emissive: 0xffffff, emissiveIntensity: 0.6 }); }
        st.fase = 'pausa'; setHud({ ronda: Math.min(6, st.ronda + 2), ok: st.ok, txt: '' });
        setTimeout(() => { setMsg(null); st.ronda++; if (st.ronda >= 6) { st.fin = true; alTerminar(st.ok); } else { montar(); setHud((h) => ({ ...h, txt: 'Memoriza la mesa' })); } }, 1200);
      },
      frame(dt) {
        st.t += dt;
        if (st.fase === 'ver' && st.t > Math.max(2, 3.2 - st.ronda * 0.2)) { st.fase = 'tapar'; st.t = 0; }
        if (st.fase === 'tapar') {
          telon.position.y = Math.max(0.3, telon.position.y - dt * 35);
          if (telon.position.y <= 0.31 && !st.cambiado?.hecho) {
            const o = r.de(st.objs); const tipo = r.entero(0, 1);
            if (tipo === 0) { let c; do { c = r.de(COLS); } while (c === o.c); o.m.material = new THREE.MeshStandardMaterial({ color: c }); } else { scene.remove(o.m); const f = (o.f + r.entero(1, 2)) % 3; o.m = figura(f, o.c); o.m.position.set(o.x, 0.45, o.z); scene.add(o.m); }
            st.cambiado = { m: o.m, hecho: true }; st.t = 0; st.fase = 'destapar';
          }
        }
        if (st.fase === 'destapar' && st.t > 0.5) { telon.position.y = Math.min(9, telon.position.y + dt * 35); if (telon.position.y >= 9) { st.fase = 'elegir'; setHud((h) => ({ ...h, txt: '¿Qué ha cambiado?' })); } }
      }
    };
  }, { fondo: 0x1c1917 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`👀 Ronda ${hud.ronda}/6 · ✅ ${hud.ok}`} der={hud.txt} /><Mensaje texto={msg} /></div>;
}

/* ───────── Clava cuchillos ───────── */
function Cuchillos({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ n: 0, quedan: 6, nivel: 1 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla);
    const diana = new THREE.Group(); const tronco = crea.cilindro(1.6, 1.6, 0.6, 0xa16207, 40); tronco.rotation.x = Math.PI / 2; diana.add(tronco); diana.position.y = 2.5; scene.add(diana);
    const cuchillo = () => { const g = new THREE.Group(); const hoja = crea.caja(0.14, 1.1, 0.05, 0xe5e7eb, { metalness: 0.9, roughness: 0.2 }); hoja.position.y = 0.55; g.add(hoja); const mango = crea.caja(0.2, 0.6, 0.12, 0x111827); mango.position.y = -0.3; g.add(mango); return g; };
    const st = { nivel: 0, clavados: [], quedan: 6, n: 0, vuelo: null, ang: 0, w: 2, fin: false, t: 0 };
    const preparar = () => {
      st.clavados.forEach((c) => diana.remove(c.m)); st.clavados = [];
      const previos = 1 + st.nivel; for (let k = 0; k < previos; k++) { const a = r.entre(0, Math.PI * 2); const c = cuchillo(); c.rotation.z = a + Math.PI; c.position.set(Math.cos(a - Math.PI / 2) * 2.2, Math.sin(a - Math.PI / 2) * 2.2, 0); c.position.set(Math.sin(a) * 2.2, -Math.cos(a) * 2.2, 0); diana.add(c); st.clavados.push({ m: c, a }); }
      st.quedan = 6 + st.nivel * 2; st.w = 1.8 + st.nivel * 0.6; setHud({ n: st.n, quedan: st.quedan, nivel: st.nivel + 1 });
    };
    preparar();
    const listo = cuchillo(); listo.position.set(0, -2.6, 0); scene.add(listo);
    camera.position.set(0, 1.2, 12.5); camera.lookAt(0, 1.1, 0);
    return {
      toque() { if (!st.fin && !st.vuelo) { st.vuelo = { y: -2.6 }; sonar('toque', { minimo: 0 }); } },
      frame(dt) {
        if (st.fin) return; st.t += dt;
        const w = st.w * (1 + 0.5 * Math.sin(st.t * (0.8 + st.nivel * 0.3)));
        diana.rotation.z += w * dt;
        if (st.vuelo) {
          st.vuelo.y += 26 * dt; listo.position.y = st.vuelo.y;
          if (st.vuelo.y >= 2.5 - 1.6 - 0.6) {
            // Ángulo del punto de impacto (abajo de la diana) en el sistema de la diana
            const a = (-diana.rotation.z % (Math.PI * 2) + Math.PI * 4) % (Math.PI * 2);
            const choca = st.clavados.some((c) => { const d = Math.abs(((c.a - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI); return d < 0.22; });
            if (choca) { st.fin = true; vibrar(200); sonar('fallo'); setMsg('💥 ¡Choque de cuchillos!'); listo.rotation.z = 2; setTimeout(() => alTerminar(st.n), 900); return; }
            const c = cuchillo(); c.rotation.z = a + Math.PI; c.position.set(Math.sin(a) * 2.2, -Math.cos(a) * 2.2, 0); diana.add(c); st.clavados.push({ m: c, a });
            st.n++; st.quedan--; st.vuelo = null; listo.position.y = -2.6; sonar('carta'); vibrar(15);
            if (st.quedan <= 0) { st.nivel++; sonar('acierto'); if (st.nivel >= 4) { st.fin = true; alTerminar(st.n); return; } setMsg(`✅ ¡Nivel ${st.nivel + 1}!`); setTimeout(() => setMsg(null), 800); preparar(); } else setHud({ n: st.n, quedan: st.quedan, nivel: st.nivel + 1 });
          }
        }
        if (st.t > 60) { st.fin = true; alTerminar(st.n); }
      }
    };
  }, { fondo: 0x3f1d0b });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🔪 ${hud.n} clavados`} der={`Nivel ${hud.nivel} · quedan ${hud.quedan}`} /><Mensaje texto={msg} tipo="mal" /><p className="hb-pista">Toca para lanzar. No toques los otros cuchillos</p></div>;
}

export default [
  { id: 'ascensor', nombre: 'Ascensor exacto', emoji: '🛗', como: 'El ascensor sube y baja: toca para pararlo justo a la altura de la planta verde. Ocho viajes, cada vez más rápido.', mejor: 'mas', unidad: 'pts', duracion: 60, C: Ascensor },
  { id: 'serpiente', nombre: 'Serpiente', emoji: '🐍', como: 'Gira a izquierda o derecha (botones o tocando cada mitad de la pantalla) para comer manzanas sin chocar con las paredes ni contigo. 60 segundos.', mejor: 'mas', unidad: 'de largo', duracion: 60, C: Serpiente },
  { id: 'sprint', nombre: 'Sprint 100 m', emoji: '🏃‍♂️', como: 'Pulsa los dos botones alternando, lo más rápido que puedas, para correr 100 metros. Si repites pie, frenas.', mejor: 'menos', unidad: 's', peor: 40, duracion: 40, C: Sprint, formato: (v) => `${v.toFixed(2).replace('.', ',')} s` },
  { id: 'cambio', nombre: '¿Qué ha cambiado?', emoji: '👀', como: 'Memoriza la mesa. Se tapa un momento y algo cambia de color o de forma: tócalo. Seis rondas.', mejor: 'mas', unidad: 'aciertos', duracion: 75, C: Cambio },
  { id: 'cuchillos', nombre: 'Clava cuchillos', emoji: '🔪', como: 'Toca para lanzar cuchillos al tronco que gira. Si chocas con otro cuchillo, se acaba. Cuatro niveles, cada vez más rápidos.', mejor: 'mas', unidad: 'cuchillos', duracion: 60, C: Cuchillos }
];
