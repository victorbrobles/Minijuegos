// Minijuegos (6/6): ascensor exacto, serpiente, sprint, ¿qué ha cambiado? y clava cuchillos.
import React, { useRef, useState } from 'react';
import { useEscena, rng, crea, tocado, THREE } from '../tres.js';
import { Hud, Botones, Boton, Mensaje } from '../comun.jsx';
import { sonar, vibrar } from '../../../lib/sonido.js';

/* ───────── Ascensor exacto ───────── */
function Ascensor({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ i: 1, pts: 0 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla); const ALTO = 2; const PISOS = 10;
    const suelo = crea.suelo(60, 60, 0x334155, { celda: 2 }); suelo.position.y = -0.05; scene.add(suelo);
    // Torre de cristal con estructura
    const torre = crea.caja(6, PISOS * ALTO + 1, 3, 0x0f172a, { roughness: 0.1, metalness: 0.7 }); torre.position.set(0, (PISOS * ALTO + 1) / 2, -2.2); scene.add(torre);
    const hueco = crea.caja(2.6, PISOS * ALTO + 1, 0.4, 0x1e293b, { roughness: 0.5 }); hueco.position.set(0, (PISOS * ALTO + 1) / 2, -0.6); scene.add(hueco);
    [-1.4, 1.4].forEach((x) => { const g = crea.caja(0.12, PISOS * ALTO + 1, 0.12, 0x94a3b8, { metalness: 0.9, roughness: 0.3 }); g.position.set(x, (PISOS * ALTO + 1) / 2, -0.3); scene.add(g); });
    const ventanas = [];
    for (let k = 0; k < PISOS; k++) {
      [-2.3, 2.3].forEach((x) => { const v = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.2), new THREE.MeshStandardMaterial({ color: 0xfde68a, emissive: 0xfbbf24, emissiveIntensity: r() < 0.6 ? 0.8 : 0.05 })); v.position.set(x, k * ALTO + 1, -0.69); scene.add(v); ventanas.push(v); });
    }
    const marcas = []; const etiquetas = [];
    for (let k = 0; k < PISOS; k++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.07, 0.5), crea.neon(0x38bdf8, 0.4)); m.position.set(0, k * ALTO, -0.2); scene.add(m); marcas.push(m);
      const n = crea.texto(k === 0 ? 'B' : String(k), { tam: 0.55, color: '#0f172a', fondo: '#e2e8f0' }); n.position.set(-2.1, k * ALTO + 0.35, 0.2); scene.add(n); etiquetas.push(n);
    }
    const flecha = crea.texto('▶', { tam: 0.8, color: '#22c55e' }); scene.add(flecha);
    // Cabina con puertas y luz
    const cabina = new THREE.Group();
    const caja = crea.caja(2.2, 1.9, 1.3, 0xe2e8f0, { metalness: 0.6, roughness: 0.25 }); cabina.add(caja);
    [-0.5, 0.5].forEach((x) => { const p = crea.caja(0.96, 1.6, 0.05, 0x94a3b8, { metalness: 0.9, roughness: 0.2 }); p.position.set(x, -0.05, 0.66); cabina.add(p); });
    const luzC = crea.caja(1.2, 0.12, 0.06, 0xffffff, { emissive: 0xffffff, emissiveIntensity: 1.5 }); luzC.position.set(0, 0.85, 0.68); cabina.add(luzC);
    const cable = crea.cilindro(0.03, 0.03, 1, 0x111827, 6); scene.add(cable);
    scene.add(cabina);
    const pisos = []; while (pisos.length < 8) { const p = r.entero(1, PISOS - 1); if (p !== pisos.at(-1)) pisos.push(p); }
    const st = { i: 0, y: 0, dir: 1, vel: 4, para: false, pts: 0, fin: false };
    const destacar = () => marcas.forEach((m, k) => { const si = k === pisos[st.i]; m.material = crea.neon(si ? 0x22c55e : 0x38bdf8, si ? 2.4 : 0.4); m.scale.y = si ? 2 : 1; });
    destacar();
    return {
      toque() {
        if (st.para || st.fin) return; st.para = true;
        const err = Math.abs(st.y - pisos[st.i] * ALTO); const p = Math.max(0, Math.round(100 - err * 120)); st.pts += p;
        setMsg(p >= 95 ? `🎯 ¡Clavado! +${p}` : `+${p}`); sonar(p > 80 ? 'acierto' : 'carta');
        if (p > 80) ctx.chispas(new THREE.Vector3(0, st.y + 0.2, 0.8), 0x4ade80, 26, { fuerza: 4 }); else ctx.temblor(0.15);
        setHud({ i: Math.min(8, st.i + 2), pts: st.pts });
        setTimeout(() => { setMsg(null); st.i++; if (st.i >= 8) { st.fin = true; alTerminar(st.pts); return; } st.para = false; st.vel = 4 + st.i * 0.9; destacar(); }, 1000);
      },
      frame(dt) {
        const tope = (PISOS - 1) * ALTO;
        if (!st.para && !st.fin) { st.y += st.dir * st.vel * dt; if (st.y > tope) { st.y = tope; st.dir = -1; } if (st.y < 0) { st.y = 0; st.dir = 1; } }
        cabina.position.set(0, st.y + 0.95, 0.2);
        const largo = PISOS * ALTO + 1 - (st.y + 1.9); cable.scale.y = Math.max(0.01, largo); cable.position.set(0, st.y + 1.9 + largo / 2, 0.2);
        const obj = pisos[Math.min(7, st.i)] * ALTO; flecha.position.set(1.9, obj + 0.4, 0.3);
        const k = ctx.ancho(0.75);
        const cy = st.y * 0.6 + obj * 0.4 + 1.5;
        camera.position.x = 3.2 * k; camera.position.z = 10 * k; camera.position.y += (cy + 1.5 - camera.position.y) * Math.min(1, dt * 5);
        camera.lookAt(0, camera.position.y - 1.4, 0);
      }
    };
  }, { cielo: [0x1e1b4b, 0xf97316], niebla: 80 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🛗 Viaje ${hud.i}/8`} der={`${hud.pts} pts`} /><Mensaje texto={msg} /><p className="hb-pista">Toca para parar el ascensor en la planta verde</p></div>;
}

/* ───────── Serpiente ───────── */
const DIRS = { arriba: [0, -1], abajo: [0, 1], izq: [-1, 0], der: [1, 0] };
function Serpiente({ semilla, alTerminar }) {
  const ref = useRef(null); const ctl = useRef({}); const [hud, setHud] = useState({ largo: 3, t: 60 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene } = ctx; const r = rng(semilla); const N = 12;
    const base = crea.caja(N + 0.8, 0.5, N + 0.8, 0x0f172a, { roughness: 0.3, metalness: 0.5 }); base.position.y = -0.3; scene.add(base);
    const tablero = crea.suelo(N, N, 0x14532d, { celda: 0.125, contraste: 0.05 }); tablero.position.y = -0.04; scene.add(tablero);
    const borde = crea.marco(N + 0.2, N + 0.2, 0x4ade80, { intensidad: 1.8, alto: 0.3, grosor: 0.12 }); borde.position.y = 0.1; scene.add(borde);
    const pos = (x) => x - (N - 1) / 2;
    const st = { cuerpo: [[5, 6], [4, 6], [3, 6]], dir: [1, 0], cola: [], paso: 0, t: 0, comida: null, mallas: [], fin: false, crecer: 0, ini: null };
    const manzana = new THREE.Group(); const fruta = crea.esfera(0.38, 0xef4444, { roughness: 0.2 }); manzana.add(fruta);
    const rabo = crea.cilindro(0.03, 0.03, 0.25, 0x78350f, 6); rabo.position.y = 0.42; manzana.add(rabo);
    const hoja = crea.esfera(0.12, 0x22c55e); hoja.scale.set(1.4, 0.3, 0.7); hoja.position.set(0.12, 0.48, 0); manzana.add(hoja);
    scene.add(manzana);
    const brillo = new THREE.PointLight(0xef4444, 6, 4); scene.add(brillo);
    const ponComida = () => { let c; do { c = [r.entero(0, N - 1), r.entero(0, N - 1)]; } while (st.cuerpo.some(([x, z]) => x === c[0] && z === c[1])); st.comida = c; };
    ponComida();
    const matCuerpo = [crea.neon(0x22c55e, 0.25), crea.neon(0x4ade80, 0.25)];
    const cabeza = new THREE.Group(); const craneo = crea.caja(0.9, 0.6, 0.9, 0x16a34a, { emissive: 0x16a34a, emissiveIntensity: 0.3 }); cabeza.add(craneo);
    [-0.22, 0.22].forEach((z) => { const o = crea.esfera(0.12, 0xffffff); o.position.set(0.32, 0.25, z); cabeza.add(o); const p = crea.esfera(0.06, 0x0f172a); p.position.set(0.4, 0.27, z); cabeza.add(p); });
    scene.add(cabeza);
    const geoSeg = crea.caja(0.78, 0.5, 0.78, 0).geometry;
    const dibujar = () => {
      while (st.mallas.length < st.cuerpo.length - 1) { const m = new THREE.Mesh(geoSeg, matCuerpo[st.mallas.length % 2]); m.castShadow = true; scene.add(m); st.mallas.push(m); }
      while (st.mallas.length > st.cuerpo.length - 1) scene.remove(st.mallas.pop());
    };
    dibujar();
    const opuesta = (a, b) => a[0] === -b[0] && a[1] === -b[1];
    ctl.current.dir = (nombre) => {
      const d = DIRS[nombre]; const ult = st.cola.length ? st.cola.at(-1) : st.dir;
      if (st.fin || opuesta(d, ult) || (d[0] === ult[0] && d[1] === ult[1])) return;
      if (st.cola.length < 3) st.cola.push(d); sonar('toque', { minimo: 0, vibrar: false });
    };
    ctx.encuadrar({ centro: [0, 0, 1.2], ancho: N + 1, alto: N + 3.4, desde: [0, 1, 0.3] });
    const acabar = () => { st.fin = true; vibrar(150); sonar('fallo'); ctx.temblor(0.4); ctx.chispas(cabeza.position.clone(), 0x4ade80, 40, { fuerza: 5 }); setMsg('💥 ¡Chocaste!'); setTimeout(() => alTerminar(st.cuerpo.length), 900); };
    return {
      toque(e) { st.ini = [e.clientX, e.clientY]; },
      mover(e) {
        if (!st.ini) return; const dx = e.clientX - st.ini[0]; const dy = e.clientY - st.ini[1];
        if (Math.hypot(dx, dy) < 22) return;
        ctl.current.dir(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'der' : 'izq') : (dy > 0 ? 'abajo' : 'arriba')); st.ini = [e.clientX, e.clientY];
      },
      soltar() { st.ini = null; },
      frame(dt, t) {
        manzana.position.set(pos(st.comida[0]), 0.45 + Math.sin(t * 4) * 0.08, pos(st.comida[1])); manzana.rotation.y = t * 1.5; brillo.position.copy(manzana.position).setY(1);
        if (st.fin) return; st.t += dt; st.paso += dt;
        const ritmo = Math.max(0.1, 0.22 - st.cuerpo.length * 0.004);
        if (st.paso >= ritmo) {
          st.paso = 0; if (st.cola.length) st.dir = st.cola.shift(); const [hx, hz] = st.cuerpo[0]; const n = [hx + st.dir[0], hz + st.dir[1]];
          if (n[0] < 0 || n[1] < 0 || n[0] >= N || n[1] >= N || st.cuerpo.slice(0, -1).some(([x, z]) => x === n[0] && z === n[1])) { acabar(); return; }
          st.cuerpo.unshift(n);
          if (n[0] === st.comida[0] && n[1] === st.comida[1]) { st.crecer += 1; sonar('acierto', { vibrar: false }); ctx.chispas(new THREE.Vector3(pos(n[0]), 0.5, pos(n[1])), 0xef4444, 18, { fuerza: 3 }); ponComida(); }
          if (st.crecer > 0) st.crecer--; else st.cuerpo.pop();
          dibujar();
        }
        // Movimiento suave entre casillas
        const u = Math.min(1, st.paso / ritmo);
        const prev = (i) => st.cuerpo[i + 1] || st.cuerpo[i];
        const [hx, hz] = st.cuerpo[0]; const [px, pz] = prev(0);
        cabeza.position.set(pos(px + (hx - px) * u), 0.3, pos(pz + (hz - pz) * u)); cabeza.rotation.y = -Math.atan2(st.dir[1], st.dir[0]);
        st.mallas.forEach((m, k) => { const [x, z] = st.cuerpo[k + 1]; const [ax, az] = prev(k + 1); m.position.set(pos(ax + (x - ax) * u), 0.25, pos(az + (z - az) * u)); });
        if (st.t >= 60) { st.fin = true; sonar('victoria'); alTerminar(st.cuerpo.length); }
        setHud((h) => (h.largo !== st.cuerpo.length || h.t !== Math.ceil(60 - st.t) ? { largo: st.cuerpo.length, t: Math.max(0, Math.ceil(60 - st.t)) } : h));
      }
    };
  }, { cielo: [0x052e16, 0x020617], niebla: false });
  const B = (n, txt) => <Boton onPulsar={() => ctl.current.dir?.(n)}>{txt}</Boton>;
  return (
    <div className="hb-caja">
      <div ref={ref} className="hb-lienzo" /><Hud izq={`🐍 Largo ${hud.largo}`} der={`⏱️ ${hud.t}s`} /><Mensaje texto={msg} tipo="mal" />
      <Botones>{B('izq', '◀')}{B('arriba', '▲')}{B('abajo', '▼')}{B('der', '▶')}</Botones>
    </div>
  );
}

/* ───────── Sprint 100 m ───────── */
function atleta(color) {
  const g = new THREE.Group();
  const torso = crea.caja(0.5, 0.75, 0.32, color); torso.position.y = 1.25; g.add(torso);
  const dorsal = crea.cartel('7', 0.3, 0.3, { fondo: '#ffffff', color: '#0f172a', radio: 20 }); dorsal.position.set(0, 1.3, -0.17); dorsal.rotation.y = Math.PI; g.add(dorsal);
  const cabeza = crea.esfera(0.22, 0xf1c27d); cabeza.position.y = 1.85; g.add(cabeza);
  const pelo = crea.esfera(0.23, 0x1f2937); pelo.scale.y = 0.6; pelo.position.y = 1.95; g.add(pelo);
  const miembro = (x, y, w, h, c) => { const p = new THREE.Group(); const m = crea.caja(w, h, w, c); m.position.y = -h / 2; p.add(m); p.position.set(x, y, 0); g.add(p); return p; };
  g.userData.piernas = [miembro(-0.13, 0.88, 0.18, 0.85, 0x1e293b), miembro(0.13, 0.88, 0.18, 0.85, 0x1e293b)];
  g.userData.brazos = [miembro(-0.34, 1.58, 0.13, 0.65, 0xf1c27d), miembro(0.34, 1.58, 0.13, 0.65, 0xf1c27d)];
  g.rotation.y = Math.PI; // mira hacia -z
  return g;
}
function Sprint({ alTerminar }) {
  const ref = useRef(null); const ctl = useRef({}); const [hud, setHud] = useState({ m: 0, t: 0 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(100);
    const cesped = crea.suelo(80, 180, 0x3f8f2f, { celda: 3, contraste: 0.05, lineas: false }); cesped.position.set(0, -0.12, -50); scene.add(cesped);
    const pista = crea.suelo(6, 130, 0xc2410c, { celda: 0.5, contraste: 0.03, lineas: false }); pista.position.set(0, 0, -50); scene.add(pista);
    [-3, -1, 1, 3].forEach((x) => { const l = crea.caja(0.06, 0.02, 130, 0xffffff); l.position.set(x, 0.01, -50); scene.add(l); });
    for (let z = 0; z >= -100; z -= 10) { const l = crea.caja(6, 0.02, 0.1, 0xffffff); l.position.set(0, 0.012, z); scene.add(l); if (z < 0) { const n = crea.texto(`${-z}`, { tam: 0.5, color: '#ffffff', fondo: 'rgba(15,23,42,0.7)' }); n.position.set(3.8, 0.5, z); scene.add(n); } }
    for (let i = 0; i < 12; i++) { const c = crea.caja(0.5, 0.02, 0.5, i % 2 ? 0xffffff : 0x0f172a); c.position.set(-2.75 + i * 0.5, 0.015, -100); scene.add(c); }
    const cinta = crea.caja(6, 0.05, 0.03, 0xfacc15); cinta.position.set(0, 1.2, -100); scene.add(cinta);
    [-3.1, 3.1].forEach((x) => { const p = crea.cilindro(0.06, 0.06, 1.3, 0xffffff, 8); p.position.set(x, 0.65, -100); scene.add(p); });
    // Gradas con público
    for (let fila = 0; fila < 4; fila++) {
      const g = crea.caja(1.4, 0.6, 130, 0x475569); g.position.set(-5.5 - fila * 1.3, 0.3 + fila * 0.6, -50); scene.add(g);
    }
    const publico = new THREE.InstancedMesh(new THREE.SphereGeometry(0.25, 10, 8), new THREE.MeshStandardMaterial({ roughness: 0.5 }), 4 * 92);
    { const m4 = new THREE.Matrix4(); const col = new THREE.Color(); let i = 0; for (let fila = 0; fila < 4; fila++) for (let z = 8; z > -110 && i < 4 * 92; z -= 1.3) { m4.makeTranslation(-5.5 - fila * 1.3 + r.entre(-0.3, 0.3), 0.85 + fila * 0.6, z); publico.setMatrixAt(i, m4); publico.setColorAt(i, col.setHex(r.de([0xef4444, 0x3b82f6, 0xfacc15, 0xffffff, 0x22c55e, 0xa855f7]))); i++; } publico.count = i; }
    scene.add(publico);
    const tu = atleta(0x2563eb); tu.position.x = 0; scene.add(tu);
    const rivales = [[-2, 0xdc2626, 8.2], [2, 0xf59e0b, 7.4]].map(([x, c, v]) => { const a = atleta(c); a.position.x = x; scene.add(a); return { a, v, z: 0, fase: r.entre(0, 6) }; });
    const st = { z: 0, v: 0, t: 0, ultimo: null, empezado: false, fin: false, fase: 0 };
    const animar = (a, fase, v) => { const amp = Math.min(1, v / 8) * 0.9; a.userData.piernas[0].rotation.x = Math.sin(fase) * amp; a.userData.piernas[1].rotation.x = -Math.sin(fase) * amp; a.userData.brazos[0].rotation.x = -Math.sin(fase) * amp; a.userData.brazos[1].rotation.x = Math.sin(fase) * amp; a.position.y = Math.abs(Math.sin(fase)) * 0.08 * amp; };
    ctl.current.pie = (k) => {
      if (st.fin) return; st.empezado = true;
      if (k !== st.ultimo) { st.v = Math.min(12, st.v + 0.9); st.ultimo = k; sonar('tic', { minimo: 0, vibrar: false }); } else { st.v *= 0.6; setMsg('¡Alterna!'); setTimeout(() => setMsg(null), 300); }
    };
    return {
      frame(dt) {
        if (st.empezado && !st.fin) {
          st.t += dt; st.v = Math.max(0, st.v - 3.2 * dt); st.z -= st.v * dt; st.fase += st.v * dt * 1.6;
          rivales.forEach((o) => { if (o.z > -104) { const v = Math.min(o.v, o.v * st.t * 1.2); o.z -= v * dt; o.fase += v * dt * 1.6; animar(o.a, o.fase, v); } else animar(o.a, 0, 0); o.a.position.z = o.z; });
          if (st.z <= -100) { st.fin = true; sonar('victoria'); cinta.visible = false; ctx.chispas(new THREE.Vector3(0, 1.5, -100), 0xfacc15, 50, { fuerza: 6 }); alTerminar(Math.round(st.t * 100) / 100); }
          if (st.t > 40) { st.fin = true; alTerminar(40); }
        }
        tu.position.z = st.z; animar(tu, st.fase, st.v);
        const k = ctx.ancho(0.9);
        camera.position.set(0.9, 3 + k * 0.5, st.z + 5 * k); camera.lookAt(0, 0.8, st.z - 7);
        ctx.seguirSol(0, st.z);
        setHud((h) => (Math.floor(-st.z) !== h.m || Math.floor(st.t * 10) !== Math.floor(h.t * 10) ? { m: Math.min(100, Math.floor(-st.z)), t: st.t } : h));
      }
    };
  }, { cielo: [0x60a5fa, 0xe0f2fe], niebla: 90 });
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
    const { scene } = ctx; const r = rng(semilla);
    const suelo = crea.suelo(40, 40, 0x292524, { celda: 2 }); suelo.position.y = -2.5; scene.add(suelo);
    const mesa = crea.caja(9.6, 0.4, 6.6, 0x7c4a1e, { roughness: 0.55 }); mesa.position.y = -0.2; scene.add(mesa);
    const tapete = crea.caja(9, 0.04, 6, 0x312e81, { roughness: 0.95 }); tapete.position.y = 0.02; scene.add(tapete);
    const huecos = Array.from({ length: 15 }, (_, i) => [(i % 5 - 2) * 1.7, (Math.floor(i / 5) - 1) * 1.8]);
    huecos.forEach(([x, z]) => { const p = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.62, 32), new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.5 })); p.rotation.x = -Math.PI / 2; p.position.set(x, 0.05, z); scene.add(p); });
    // Tapa alta que cubre la mesa entera
    const tapa = new THREE.Group(); const caja = crea.caja(9.8, 1.8, 6.8, 0x1e293b, { roughness: 0.3, metalness: 0.4 }); tapa.add(caja);
    const marcoT = crea.marco(9.8, 6.8, 0xa855f7, { intensidad: 1.6 }); marcoT.position.y = 0.9; tapa.add(marcoT);
    const ojo = crea.cartel('👀', 2.2, 2.2, { fondo: null, fuente: '200px sans-serif' }); ojo.rotation.x = -Math.PI / 2; ojo.position.set(0, 0.92, 0); tapa.add(ojo);
    tapa.position.y = 12; scene.add(tapa);
    const st = { ronda: 0, ok: 0, objs: [], fase: 'ver', t: 0, cambiado: null, fin: false };
    const figura = (f, c) => (f === 0 ? crea.caja(0.8, 0.8, 0.8, c) : f === 1 ? crea.esfera(0.45, c) : f === 2 ? crea.cilindro(0, 0.5, 1, c) : crea.cilindro(0.4, 0.4, 0.8, c));
    const altura = (f) => (f === 2 ? 0.52 : 0.45);
    const ver = (v) => st.objs.forEach((o) => { o.m.visible = v; });
    const montar = () => {
      st.objs.forEach((o) => scene.remove(o.m)); st.objs = [];
      const n = 5 + Math.min(5, st.ronda);
      r.barajar([...huecos]).slice(0, n).forEach(([x, z]) => { const f = r.entero(0, 3); const c = r.de(COLS); const m = figura(f, c); m.position.set(x, altura(f), z); m.rotation.y = r() * 3; scene.add(m); st.objs.push({ m, f, c, x, z }); });
      st.fase = 'ver'; st.t = 0; tapa.position.y = 12; st.cambiado = null;
    };
    montar();
    ctx.encuadrar({ centro: [0, 0, 0.2], ancho: 9.8, alto: 7, desde: [0, 1, 0.6] });
    return {
      toque(e) {
        if (st.fase !== 'elegir' || st.fin) return;
        const t = tocado(ctx, e, st.objs.map((o) => o.m)); if (!t) return;
        const bien = t.obj === st.cambiado;
        if (bien) { st.ok++; sonar('acierto'); setMsg('✅ ¡Ese!'); ctx.chispas(t.obj.position.clone().setY(0.8), 0x4ade80, 30, { fuerza: 5 }); }
        else { sonar('fallo'); setMsg('❌ Era el que brilla'); }
        st.cambiado.material = new THREE.MeshStandardMaterial({ color: st.cambiado.material.color, emissive: 0xffffff, emissiveIntensity: 0.5 });
        ctx.onda(st.cambiado.position.clone().setY(0.06), bien ? 0x4ade80 : 0xffffff);
        st.fase = 'pausa'; setHud({ ronda: Math.min(6, st.ronda + 2), ok: st.ok, txt: '' });
        setTimeout(() => { setMsg(null); st.ronda++; if (st.ronda >= 6) { st.fin = true; alTerminar(st.ok); } else { montar(); setHud((h) => ({ ...h, txt: 'Memoriza la mesa' })); } }, 1300);
      },
      frame(dt) {
        st.t += dt;
        if (st.fase === 'ver' && st.t > Math.max(2.2, 3.4 - st.ronda * 0.2)) { st.fase = 'tapar'; st.t = 0; setHud((h) => ({ ...h, txt: '…' })); }
        if (st.fase === 'tapar') {
          tapa.position.y = Math.max(0.92, tapa.position.y - dt * 32);
          if (tapa.position.y <= 0.93) {
            ver(false); ctx.temblor(0.15);
            const o = r.de(st.objs);
            if (r() < 0.5) { let c; do { c = r.de(COLS); } while (c === o.c); o.c = c; o.m.material = new THREE.MeshStandardMaterial({ color: c, roughness: 0.38 }); }
            else { scene.remove(o.m); let f; do { f = r.entero(0, 3); } while (f === o.f); o.f = f; o.m = figura(f, o.c); o.m.position.set(o.x, altura(f), o.z); o.m.visible = false; scene.add(o.m); }
            st.cambiado = o.m; st.t = 0; st.fase = 'tapado';
          }
        }
        if (st.fase === 'tapado' && st.t > 0.7) { ver(true); st.fase = 'destapar'; }
        if (st.fase === 'destapar') { tapa.position.y = Math.min(12, tapa.position.y + dt * 30); if (tapa.position.y >= 12) { st.fase = 'elegir'; setHud((h) => ({ ...h, txt: '¿Qué ha cambiado?' })); } }
      }
    };
  }, { cielo: [0x3b0764, 0x0f0a1e], niebla: 45 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`👀 Ronda ${hud.ronda}/6 · ✅ ${hud.ok}`} der={hud.txt} /><Mensaje texto={msg} /></div>;
}

/* ───────── Clava cuchillos ───────── */
function texturaTronco() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d');
  const g = x.createRadialGradient(128, 128, 10, 128, 128, 128); g.addColorStop(0, '#f2cf96'); g.addColorStop(1, '#c48a4a'); x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  for (let rr = 120; rr > 6; rr -= 11) { x.strokeStyle = 'rgba(120,70,30,0.45)'; x.lineWidth = 2.5; x.beginPath(); x.arc(128, 128, rr, 0, Math.PI * 2); x.stroke(); }
  x.strokeStyle = 'rgba(90,50,20,0.5)'; x.lineWidth = 2; x.beginPath(); x.moveTo(128, 128); x.lineTo(240, 170); x.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function Cuchillos({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ n: 0, quedan: 6, nivel: 1 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene } = ctx; const r = rng(semilla); const R = 1.6;
    const pared = crea.caja(20, 20, 0.4, 0x3f1d0b, { roughness: 0.9 }); pared.position.set(0, 2, -2); scene.add(pared);
    const diana = new THREE.Group();
    const caraM = new THREE.MeshStandardMaterial({ map: texturaTronco(), roughness: 0.8 });
    const tronco = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.6, 48), [new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 }), caraM, caraM]); tronco.rotation.x = Math.PI / 2; tronco.castShadow = true; diana.add(tronco);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(R + 0.02, 0.06, 8, 64), new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.9, roughness: 0.3 })); aro.position.z = 0.25; diana.add(aro);
    diana.position.y = 2.5; scene.add(diana);
    const cuchillo = () => {
      const g = new THREE.Group();
      const hoja = crea.caja(0.16, 1.1, 0.04, 0xe5e7eb, { metalness: 0.95, roughness: 0.15 }); hoja.position.y = 0.55; g.add(hoja);
      const punta = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 4), hoja.material); punta.position.y = 1.22; punta.rotation.y = Math.PI / 4; punta.scale.z = 0.3; g.add(punta);
      const guarda = crea.caja(0.42, 0.08, 0.1, 0xfacc15, { metalness: 0.8, roughness: 0.3 }); g.add(guarda);
      const mango = crea.caja(0.18, 0.6, 0.12, 0x7f1d1d); mango.position.y = -0.32; g.add(mango);
      return g;
    };
    const st = { nivel: 0, clavados: [], quedan: 6, n: 0, vuelo: null, w: 2, fin: false, t: 0, golpe: 0, caido: null };
    const clavar = (a) => { const c = cuchillo(); c.rotation.z = a; c.position.set(Math.sin(a) * (R + 0.9), -Math.cos(a) * (R + 0.9), 0.1); diana.add(c); st.clavados.push({ m: c, a }); };
    const preparar = () => {
      st.clavados.forEach((c) => diana.remove(c.m)); st.clavados = [];
      for (let k = 0; k < 1 + st.nivel; k++) clavar(r.entre(0, Math.PI * 2));
      st.quedan = 6 + st.nivel * 2; st.w = 1.8 + st.nivel * 0.6; setHud({ n: st.n, quedan: st.quedan, nivel: st.nivel + 1 });
    };
    preparar();
    const listo = cuchillo(); listo.position.set(0, -2.4, 0.1); scene.add(listo);
    ctx.encuadrar({ centro: [0, 1.3, 0], ancho: 5.4, alto: 8.8, desde: [0, 0.05, 1] });
    return {
      toque() { if (!st.fin && !st.vuelo) { st.vuelo = { y: -2.4 }; sonar('toque', { minimo: 0 }); } },
      frame(dt) {
        st.golpe = Math.max(0, st.golpe - dt * 6); diana.position.y = 2.5 + st.golpe * 0.12;
        if (st.caido) { st.caido.v -= 20 * dt; st.caido.m.position.y += st.caido.v * dt; st.caido.m.rotation.z += dt * 8; }
        if (st.fin) return; st.t += dt;
        const w = st.w * (1 + 0.5 * Math.sin(st.t * (0.8 + st.nivel * 0.3)));
        diana.rotation.z += w * dt;
        if (st.vuelo) {
          st.vuelo.y += 28 * dt; listo.position.y = st.vuelo.y;
          if (st.vuelo.y >= 2.5 - R - 0.9) {
            const a = (-diana.rotation.z % (Math.PI * 2) + Math.PI * 4) % (Math.PI * 2);
            const choca = st.clavados.some((c) => { const d = Math.abs(((c.a - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI); return d < 0.22; });
            if (choca) { st.fin = true; vibrar(200); sonar('fallo'); ctx.temblor(0.4); ctx.chispas(new THREE.Vector3(0, 2.5 - R, 0.3), 0xfacc15, 30); setMsg('💥 ¡Choque de cuchillos!'); st.caido = { m: listo, v: 4 }; setTimeout(() => alTerminar(st.n), 1000); return; }
            clavar(a); st.golpe = 1; ctx.chispas(new THREE.Vector3(0, 2.5 - R, 0.3), 0xd6a46a, 14, { fuerza: 3, tam: 0.06 });
            st.n++; st.quedan--; st.vuelo = null; listo.position.y = -2.4; sonar('carta'); vibrar(15);
            if (st.quedan <= 0) {
              st.nivel++; sonar('acierto'); ctx.chispas(new THREE.Vector3(0, 2.5, 0.5), 0xfacc15, 50, { fuerza: 6 });
              if (st.nivel >= 4) { st.fin = true; alTerminar(st.n); return; }
              setMsg(`✅ ¡Nivel ${st.nivel + 1}!`); setTimeout(() => setMsg(null), 800); preparar();
            } else setHud({ n: st.n, quedan: st.quedan, nivel: st.nivel + 1 });
          }
        }
        if (st.t > 60) { st.fin = true; alTerminar(st.n); }
      }
    };
  }, { cielo: [0x451a03, 0x1c0a00], niebla: false });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🔪 ${hud.n} clavados`} der={`Nivel ${hud.nivel} · quedan ${hud.quedan}`} /><Mensaje texto={msg} tipo="mal" /><p className="hb-pista">Toca para lanzar. No toques los otros cuchillos</p></div>;
}

export default [
  { id: 'ascensor', nombre: 'Ascensor exacto', emoji: '🛗', como: 'El ascensor sube y baja: toca para pararlo justo a la altura de la planta verde. Ocho viajes, cada vez más rápido.', mejor: 'mas', unidad: 'pts', duracion: 60, C: Ascensor },
  { id: 'serpiente', nombre: 'Serpiente', emoji: '🐍', como: 'Desliza el dedo hacia donde quieras ir (o usa las flechas) para comer manzanas sin chocar con las paredes ni contigo. 60 segundos.', mejor: 'mas', unidad: 'de largo', duracion: 60, C: Serpiente },
  { id: 'sprint', nombre: 'Sprint 100 m', emoji: '🏃‍♂️', como: 'Pulsa los dos botones alternando, lo más rápido que puedas, para correr 100 metros. Si repites pie, frenas.', mejor: 'menos', unidad: 's', peor: 40, duracion: 40, C: Sprint, formato: (v) => `${v.toFixed(2).replace('.', ',')} s` },
  { id: 'cambio', nombre: '¿Qué ha cambiado?', emoji: '👀', como: 'Memoriza la mesa. Se tapa un momento y algo cambia de color o de forma: tócalo. Seis rondas.', mejor: 'mas', unidad: 'aciertos', duracion: 75, C: Cambio },
  { id: 'cuchillos', nombre: 'Clava cuchillos', emoji: '🔪', como: 'Toca para lanzar cuchillos al tronco que gira. Si chocas con otro cuchillo, se acaba. Cuatro niveles, cada vez más rápidos.', mejor: 'mas', unidad: 'cuchillos', duracion: 60, C: Cuchillos }
];
