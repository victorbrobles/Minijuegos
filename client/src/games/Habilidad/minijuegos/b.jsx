// Minijuegos (2/6): para en 10 s, equilibrista, laberinto, topos y ¿cuántos hay?
import React, { useRef, useState } from 'react';
import { useEscena, rng, crea, tocado, THREE, marcador } from '../tres.js';
import { Hud, Botones, Boton, Mensaje } from '../comun.jsx';
import { sonar, vibrar } from '../../../lib/sonido.js';

/** Botón que se mantiene pulsado (equilibrista). */
function Mantener({ ctl, k, children }) {
  return <button type="button" className="hb-boton ancho" onPointerDown={(e) => { e.preventDefault(); ctl.current[k] = true; }} onPointerUp={() => { ctl.current[k] = false; }} onPointerLeave={() => { ctl.current[k] = false; }} onPointerCancel={() => { ctl.current[k] = false; }}>{children}</button>;
}

/* ───────── Para en 10 segundos ───────── */
function Diez({ alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ intento: 1, error: 0 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx;
    const reloj = crea.cilindro(2.6, 2.6, 0.4, 0x334155, 48); reloj.rotation.x = Math.PI / 2; scene.add(reloj);
    const aguja = crea.caja(0.12, 2.2, 0.1, 0xef4444); aguja.geometry.translate(0, 1.1, 0); aguja.position.z = 0.3; scene.add(aguja);
    const m = marcador({ tam: 1.1 }); m.position.set(0, -3.6, 0); scene.add(m);
    const st = { t: 0, corriendo: true, intento: 0, errores: [], fin: false };
    camera.position.set(0, -0.6, 10); camera.lookAt(0, -0.8, 0);
    return {
      toque() {
        if (st.fin || !st.corriendo) return;
        st.corriendo = false; const err = Math.abs(st.t - 10); st.errores.push(Math.round(err * 1000));
        m.poner(`${st.t.toFixed(2)} s`, err < 0.1 ? '#4ade80' : '#fde047'); sonar(err < 0.1 ? 'victoria' : 'acierto');
        setMsg(err < 0.05 ? '🎯 ¡Clavado!' : `Error: ${err.toFixed(2)} s`);
        setHud({ intento: st.errores.length + 1, error: st.errores.reduce((a, b) => a + b, 0) });
        setTimeout(() => {
          setMsg(null);
          if (st.errores.length >= 3) { st.fin = true; alTerminar(st.errores.reduce((a, b) => a + b, 0)); return; }
          st.t = 0; st.corriendo = true;
        }, 1600);
      },
      frame(dt) {
        if (!st.corriendo) return;
        st.t += dt; aguja.rotation.z = -(st.t / 10) * Math.PI * 2;
        aguja.visible = st.t < 3; m.poner(st.t < 3 ? `${st.t.toFixed(2)} s` : '?? s');
        if (st.t > 20) { st.corriendo = false; st.errores.push(10000); if (st.errores.length >= 3) { st.fin = true; alTerminar(st.errores.reduce((a, b) => a + b, 0)); } else { st.t = 0; st.corriendo = true; } }
      }
    };
  }, { fondo: 0x0f172a });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`⏱️ Intento ${Math.min(3, hud.intento)}/3`} der={`Error total: ${(hud.error / 1000).toFixed(2)} s`} /><Mensaje texto={msg} /></div>;
}

/* ───────── Equilibrista ───────── */
function Equilibrio({ semilla, alTerminar }) {
  const ref = useRef(null); const ctl = useRef({}); const [t, setT] = useState(0); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla);
    const pie = crea.cilindro(0.1, 0.5, 2, 0x475569, 4); pie.position.y = -1; scene.add(pie);
    const tabla = new THREE.Group(); const madera = crea.caja(7, 0.2, 1.2, 0xb45309); tabla.add(madera); scene.add(tabla);
    const bola = crea.esfera(0.35, 0xf43f5e); scene.add(bola);
    const rachas = Array.from({ length: 30 }, () => ({ en: r.entre(1, 3), f: r.entre(-1, 1) }));
    const st = { a: 0, w: 0, x: 0, v: 0, t: 0, viento: 0, prox: 1.5, k: 0, fin: false, cae: 0 };
    camera.position.set(0, 2.5, 9); camera.lookAt(0, 0, 0);
    return {
      frame(dt) {
        if (st.fin) { st.cae += dt; bola.position.y -= dt * 8 * st.cae; bola.position.x += st.v * dt; return; }
        st.t += dt; st.prox -= dt;
        if (st.prox <= 0) { const rc = rachas[st.k++ % rachas.length]; st.viento = rc.f * (0.7 + st.t * 0.03); st.prox = rc.en; }
        const u = (ctl.current.der ? 1 : 0) - (ctl.current.izq ? 1 : 0);
        st.w += (u * 2.2 + st.viento * 0.9 - st.w * 1.6) * dt;
        st.a = Math.max(-0.5, Math.min(0.5, st.a + st.w * dt));
        st.v += -9.8 * Math.sin(st.a) * dt * 0.9; st.v *= 0.995; st.x += st.v * dt;
        tabla.rotation.z = st.a;
        bola.position.set(st.x * Math.cos(st.a), 0.45 + st.x * Math.sin(st.a), 0);
        if (Math.abs(st.x) > 3.5) { st.fin = true; sonar('fallo'); setMsg('💥 ¡Se cayó!'); setTimeout(() => alTerminar(Math.round(st.t * 10) / 10), 900); }
        if (st.t >= 40) { st.fin = true; alTerminar(40); }
        setT((x) => (Math.floor(x * 10) !== Math.floor(st.t * 10) ? st.t : x));
      }
    };
  }, { fondo: 0x164e63 });
  return (
    <div className="hb-caja">
      <div ref={ref} className="hb-lienzo" /><Hud izq={`⚖️ ${t.toFixed(1).replace('.', ',')} s`} der="Aguanta 40 s" /><Mensaje texto={msg} tipo="mal" />
      <Botones><Mantener ctl={ctl} k="der">↺ Inclinar</Mantener><Mantener ctl={ctl} k="izq">Inclinar ↻</Mantener></Botones>
    </div>
  );
}

/* ───────── Laberinto ───────── */
function Laberinto({ semilla, alTerminar }) {
  const ref = useRef(null); const [t, setT] = useState(0);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla); const N = 7; const S = 1.5;
    // Laberinto por búsqueda en profundidad
    const muro = Array.from({ length: N * N }, () => ({ n: true, e: true, s: true, o: true })); const vis = new Set([0]); const pila = [0];
    while (pila.length) {
      const c = pila.at(-1); const f = Math.floor(c / N); const k = c % N;
      const vec = [[f - 1, k, 'n', 's'], [f + 1, k, 's', 'n'], [f, k + 1, 'e', 'o'], [f, k - 1, 'o', 'e']].filter(([a, b]) => a >= 0 && a < N && b >= 0 && b < N && !vis.has(a * N + b));
      if (!vec.length) { pila.pop(); continue; }
      const [a, b, d1, d2] = r.de(vec); muro[c][d1] = false; muro[a * N + b][d2] = false; vis.add(a * N + b); pila.push(a * N + b);
    }
    const cx = (k) => (k - (N - 1) / 2) * S; const rects = [];
    const pared = (x0, z0, x1, z1) => { const w = Math.max(0.18, x1 - x0); const d = Math.max(0.18, z1 - z0); const m = crea.caja(w, 0.6, d, 0x6366f1); m.position.set((x0 + x1) / 2, 0.3, (z0 + z1) / 2); scene.add(m); rects.push([(x0 + x1) / 2 - w / 2, (z0 + z1) / 2 - d / 2, (x0 + x1) / 2 + w / 2, (z0 + z1) / 2 + d / 2]); };
    for (let f = 0; f < N; f++) for (let k = 0; k < N; k++) {
      const m = muro[f * N + k]; const x = cx(k); const z = cx(f); const h = S / 2;
      if (m.s) pared(x - h, z + h, x + h, z + h); if (m.e) pared(x + h, z - h, x + h, z + h);
      if (f === 0 && m.n) pared(x - h, z - h, x + h, z - h); if (k === 0 && m.o) pared(x - h, z - h, x - h, z + h);
    }
    const suelo = crea.caja(N * S + 0.4, 0.2, N * S + 0.4, 0x1e1b4b); suelo.position.y = -0.1; scene.add(suelo);
    const meta = crea.caja(1, 0.05, 1, 0x22c55e, { emissive: 0x22c55e, emissiveIntensity: 0.6 }); meta.position.set(cx(N - 1), 0.03, cx(N - 1)); scene.add(meta);
    const bola = crea.esfera(0.32, 0xfacc15); bola.position.set(cx(0), 0.32, cx(0)); scene.add(bola);
    const st = { t: 0, x: cx(0), z: cx(0), dx: 0, dz: 0, inicio: null, fin: false };
    const choca = (x, z) => rects.some(([a, b, c, d]) => { const px = Math.max(a, Math.min(x, c)); const pz = Math.max(b, Math.min(z, d)); return (x - px) ** 2 + (z - pz) ** 2 < 0.31 * 0.31; });
    camera.position.set(0, 12, 4.5); camera.lookAt(0, 0, 0.4);
    return {
      toque(e) { st.inicio = [e.clientX, e.clientY]; },
      mover(e) { if (!st.inicio) return; const dx = (e.clientX - st.inicio[0]) / 60; const dz = (e.clientY - st.inicio[1]) / 60; const l = Math.hypot(dx, dz); st.dx = l > 1 ? dx / l : dx; st.dz = l > 1 ? dz / l : dz; },
      soltar() { st.inicio = null; st.dx = 0; st.dz = 0; },
      frame(dt) {
        if (st.fin) return;
        st.t += dt; const v = 4.2 * dt;
        const nx = st.x + st.dx * v; if (!choca(nx, st.z)) st.x = nx;
        const nz = st.z + st.dz * v; if (!choca(st.x, nz)) st.z = nz;
        bola.position.set(st.x, 0.32, st.z); bola.rotation.x += st.dz * v / 0.32; bola.rotation.z -= st.dx * v / 0.32;
        if (Math.hypot(st.x - cx(N - 1), st.z - cx(N - 1)) < 0.5) { st.fin = true; sonar('victoria'); alTerminar(Math.round(st.t * 10) / 10); }
        if (st.t >= 90) { st.fin = true; alTerminar(90); }
        setT((x) => (Math.floor(x) !== Math.floor(st.t) ? st.t : x));
      }
    };
  }, { fondo: 0x0f0a2e });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🌀 ${Math.floor(t)} s`} der="Arrastra el dedo para mover la bola hasta la salida verde" /></div>;
}

/* ───────── Topos ───────── */
function Topos({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ pts: 0, t: 30 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla);
    const cesped = crea.caja(9, 0.4, 9, 0x65a30d); cesped.position.y = -0.2; scene.add(cesped);
    const hoyos = []; const bichos = [];
    for (let i = 0; i < 9; i++) {
      const x = (i % 3 - 1) * 2.5; const z = (Math.floor(i / 3) - 1) * 2.5;
      const h = crea.cilindro(0.85, 0.85, 0.05, 0x1c1917); h.position.set(x, 0.01, z); scene.add(h);
      hoyos.push({ x, z, ocupado: false });
    }
    const crearBicho = (tipo) => {
      const g = new THREE.Group();
      const col = tipo === 'oro' ? 0xfacc15 : tipo === 'bomba' ? 0x111827 : 0x92400e;
      const cuerpo = crea.cilindro(0.55, 0.65, 1, col); cuerpo.position.y = 0.5; g.add(cuerpo);
      const cabeza = crea.esfera(0.55, col); cabeza.position.y = 1.05; g.add(cabeza);
      if (tipo === 'bomba') { const mecha = crea.cilindro(0.05, 0.05, 0.4, 0xf97316); mecha.position.y = 1.7; g.add(mecha); } else { [-0.2, 0.2].forEach((dx) => { const ojo = crea.esfera(0.09, 0xffffff); ojo.position.set(dx, 1.2, 0.45); g.add(ojo); }); const nariz = crea.esfera(0.12, 0xfb7185); nariz.position.set(0, 1.05, 0.55); g.add(nariz); }
      return g;
    };
    const st = { t: 0, pts: 0, prox: 0.4, fin: false };
    camera.position.set(0, 9, 7.5); camera.lookAt(0, 0, 0.5);
    return {
      toque(e) {
        if (st.fin) return;
        const t = tocado(ctx, e, bichos.filter((b) => b.arriba > 0.4).map((b) => b.g)); if (!t) return;
        const b = bichos.find((x) => x.g === t.obj); if (!b || b.golpeado) return;
        b.golpeado = true; b.vida = Math.min(b.vida, b.edad + 0.12);
        const p = b.tipo === 'oro' ? 3 : b.tipo === 'bomba' ? -3 : 1; st.pts = Math.max(0, st.pts + p);
        setMsg(p > 0 ? `+${p}` : '💣 −3'); setTimeout(() => setMsg(null), 350); if (p < 0) { vibrar(120); sonar('fallo'); } else sonar('acierto', { minimo: 0, vibrar: false });
      },
      frame(dt) {
        if (st.fin) return;
        st.t += dt; st.prox -= dt;
        if (st.prox <= 0) {
          const libres = hoyos.filter((h) => !h.ocupado);
          if (libres.length) { const h = r.de(libres); const x = r(); const tipo = x < 0.12 ? 'oro' : x < 0.32 ? 'bomba' : 'topo'; const g = crearBicho(tipo); g.position.set(h.x, -1.8, h.z); scene.add(g); h.ocupado = true; bichos.push({ g, h, tipo, edad: 0, vida: Math.max(0.6, 1.05 - st.t * 0.015), arriba: 0 }); }
          st.prox = Math.max(0.28, 0.6 - st.t * 0.01);
        }
        bichos.forEach((b) => { b.edad += dt; const sube = Math.min(1, b.edad / 0.12, (b.vida - b.edad) / 0.12); b.arriba = Math.max(0, sube); b.g.position.y = -1.8 + 1.8 * b.arriba; });
        bichos.filter((b) => b.edad >= b.vida).forEach((b) => { scene.remove(b.g); b.h.ocupado = false; });
        for (let i = bichos.length - 1; i >= 0; i--) if (bichos[i].edad >= bichos[i].vida) bichos.splice(i, 1);
        if (st.t >= 30) { st.fin = true; alTerminar(st.pts); }
        setHud((h) => (h.pts !== st.pts || h.t !== Math.ceil(30 - st.t) ? { pts: st.pts, t: Math.max(0, Math.ceil(30 - st.t)) } : h));
      }
    };
  }, { fondo: 0x86efac });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🔨 ${hud.pts} pts`} der={`⏱️ ${hud.t}s`} /><Mensaje texto={msg} /></div>;
}

/* ───────── ¿Cuántos hay? ───────── */
const COLORES = [['rojos', 'rojas', 0xef4444], ['azules', 'azules', 0x3b82f6], ['amarillos', 'amarillas', 0xfacc15]];
const FORMAS = [['cubos', 'm'], ['esferas', 'f'], ['conos', 'm']];
function Contar({ semilla, alTerminar }) {
  const ref = useRef(null); const ctl = useRef({}); const [pregunta, setPregunta] = useState(null); const [hud, setHud] = useState({ ronda: 1, pts: 0 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla);
    const mesa = crea.caja(10, 0.3, 7, 0x78350f); mesa.position.y = -0.15; scene.add(mesa);
    const tapa = crea.caja(10.2, 0.2, 7.2, 0x1e293b); tapa.position.y = 8; scene.add(tapa);
    const st = { ronda: 0, fase: 'ver', t: 0, objetos: [], pts: 0, aciertos: 0, inicioResp: 0, fin: false, sol: 0 };
    const montar = () => {
      st.objetos.forEach((o) => scene.remove(o)); st.objetos = [];
      const n = r.entero(8, 13 + st.ronda * 2); const lista = [];
      for (let i = 0; i < n; i++) {
        const f = r.entero(0, 2); const c = r.entero(0, 2);
        const m = f === 0 ? crea.caja(0.7, 0.7, 0.7, COLORES[c][2]) : f === 1 ? crea.esfera(0.42, COLORES[c][2]) : crea.cilindro(0, 0.45, 0.9, COLORES[c][2]);
        let x; let z; let k = 0; do { x = r.entre(-4.3, 4.3); z = r.entre(-2.8, 2.8); k++; } while (k < 30 && lista.some((o) => Math.hypot(o.x - x, o.z - z) < 1));
        m.position.set(x, 0.42, z); m.rotation.y = r() * 3; scene.add(m); st.objetos.push(m); lista.push({ x, z, f, c });
      }
      const modo = r.entero(0, 2); const fo = r.entero(0, 2); const co = r.entero(0, 2);
      const sol = lista.filter((o) => (modo !== 1 ? o.f === fo : true) && (modo !== 0 ? o.c === co : true)).length;
      const texto = modo === 0 ? `¿Cuántos ${FORMAS[fo][0]} había?`.replace('Cuántos esferas', 'Cuántas esferas') : modo === 1 ? `¿Cuántas figuras ${COLORES[co][1]} había?` : `¿Cuántos ${FORMAS[fo][0]} ${FORMAS[fo][1] === 'f' ? COLORES[co][1] : COLORES[co][0]} había?`.replace('Cuántos esferas', 'Cuántas esferas');
      const opciones = new Set([sol]); while (opciones.size < 4) opciones.add(Math.max(0, sol + r.entero(-3, 3)));
      st.sol = sol; st.texto = texto; st.opciones = [...opciones].sort((a, b) => a - b);
      tapa.position.y = 8; st.fase = 'ver'; st.t = 0;
    };
    montar();
    ctl.current.responder = (v) => {
      if (st.fase !== 'pregunta' || st.fin) return;
      const seg = (performance.now() - st.inicioResp) / 1000; const bien = v === st.sol;
      if (bien) { st.aciertos++; st.pts += 100 + Math.max(0, Math.round(50 - seg * 10)); sonar('acierto'); setMsg('✅ ¡Correcto!'); } else { sonar('fallo'); setMsg(`❌ Eran ${st.sol}`); }
      st.fase = 'pausa'; setPregunta(null); setHud({ ronda: Math.min(6, st.ronda + 2), pts: st.pts });
      setTimeout(() => { setMsg(null); st.ronda++; if (st.ronda >= 6) { st.fin = true; alTerminar(st.pts); } else montar(); }, 1100);
    };
    camera.position.set(0, 9, 6); camera.lookAt(0, 0, 0.3);
    return {
      frame(dt) {
        st.t += dt;
        const verT = Math.max(1.6, 2.6 - st.ronda * 0.15);
        if (st.fase === 'ver' && st.t > verT) { st.fase = 'tapando'; }
        if (st.fase === 'tapando') { tapa.position.y = Math.max(0.3, tapa.position.y - dt * 30); if (tapa.position.y <= 0.31) { st.fase = 'pregunta'; st.inicioResp = performance.now(); setPregunta({ texto: st.texto, opciones: st.opciones }); } }
      }
    };
  }, { fondo: 0x0c4a6e });
  return (
    <div className="hb-caja">
      <div ref={ref} className="hb-lienzo" /><Hud izq={`🔢 Ronda ${hud.ronda}/6`} der={`${hud.pts} pts`} /><Mensaje texto={msg} />
      {pregunta && <div className="hb-pregunta"><p>{pregunta.texto}</p><div>{pregunta.opciones.map((o) => <button key={o} type="button" onClick={() => ctl.current.responder(o)}>{o}</button>)}</div></div>}
    </div>
  );
}

export default [
  { id: 'diez', nombre: 'Para en 10 segundos', emoji: '⏱️', como: 'El reloj arranca y a los 3 segundos se esconde. Toca cuando creas que van exactamente 10 segundos. Tres intentos: cuenta el error total.', mejor: 'menos', unidad: 's', peor: 30000, duracion: 75, C: Diez, formato: (v) => `${(v / 1000).toFixed(2).replace('.', ',')} s de error` },
  { id: 'equilibrio', nombre: 'Equilibrista', emoji: '⚖️', como: 'Mantén pulsado para inclinar la tabla y que la bola no se caiga. El viento sopla cada vez más fuerte. Aguanta hasta 40 segundos.', mejor: 'mas', unidad: 's', duracion: 40, C: Equilibrio, formato: (v) => `${v.toFixed(1).replace('.', ',')} s` },
  { id: 'laberinto', nombre: 'Laberinto', emoji: '🌀', como: 'Arrastra el dedo por la pantalla para guiar la bola hasta la salida verde lo antes posible.', mejor: 'menos', unidad: 's', peor: 90, duracion: 90, C: Laberinto, formato: (v) => `${v.toFixed(1).replace('.', ',')} s` },
  { id: 'topos', nombre: 'Topos', emoji: '🔨', como: 'Toca los topos que asoman (+1). Los dorados valen +3. ¡Ojo con las bombas (−3)! 30 segundos.', mejor: 'mas', unidad: 'pts', duracion: 30, C: Topos },
  { id: 'contar', nombre: '¿Cuántos hay?', emoji: '🔢', como: 'Unas figuras aparecen un momento sobre la mesa. Cuando se tapen, responde la pregunta. Cuanto antes contestes, más puntos.', mejor: 'mas', unidad: 'pts', duracion: 75, C: Contar }
];
