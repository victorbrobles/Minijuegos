// client/src/games/Canicas/Carrera3D.jsx
// La carrera en 3D: pista, canicas, cámara de persecución, control (giroscopio, joystick o teclado), objetos,
// minimapa y marcador. Sirve para online (rivales sincronizados) y para la práctica (rivales bot).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { construirCircuito } from './circuitos.js';
import { CANICAS, OBJETOS, sortearObjeto } from './canicas.js';
import { crearMundo, crearCanica, posSalida, controlar, revisar, saltar, crearBot, dirBot, paso, RADIO } from './fisica.js';
import { sonar, vibrar } from '../../lib/sonido.js';

const DT = 1 / 60;
const fmt = (ms) => (ms == null ? '—' : `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}.${String(Math.floor((ms % 1000) / 100))}`);

/* ───────── Pista en 3D ───────── */
function mallaPista(c) {
  const g = new THREE.Group();
  const def = c.def;
  const matSuelo = new THREE.MeshStandardMaterial({ color: def.suelo, roughness: def.hielo ? 0.15 : 0.7, metalness: def.hielo ? 0.2 : 0 });
  const matBorde = new THREE.MeshStandardMaterial({ color: def.borde, roughness: 0.5, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
  const matBajo = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 });
  const tramo = (M, barandillas, huecos = []) => {
    const sv = []; const bv = []; const uv = [];
    const L = M.map((m) => m.p.clone().addScaledVector(m.n, -m.ancho / 2)); const R = M.map((m) => m.p.clone().addScaledVector(m.n, m.ancho / 2));
    for (let i = 0; i < M.length - 1; i++) {
      sv.push(...L[i].toArray(), ...R[i].toArray(), ...L[i + 1].toArray(), ...R[i].toArray(), ...R[i + 1].toArray(), ...L[i + 1].toArray());
      // Faldón por debajo (da grosor a la pista)
      const d = (v, m) => v.clone().addScaledVector(m.u, -0.6);
      [[L, -1], [R, 1]].forEach(([E]) => { const a = E[i]; const b = E[i + 1]; uv.push(...a.toArray(), ...b.toArray(), ...d(a, M[i]).toArray(), ...b.toArray(), ...d(b, M[i + 1]).toArray(), ...d(a, M[i]).toArray()); });
      if (barandillas) {
        [[L, -1], [R, 1]].forEach(([E, lado]) => {
          if (huecos.some((h) => h.lado === lado && i >= h.desde && i <= h.hasta)) return;
          const a = E[i]; const b = E[i + 1]; const au = a.clone().addScaledVector(M[i].u, 1.0); const bu = b.clone().addScaledVector(M[i + 1].u, 1.0);
          bv.push(...a.toArray(), ...b.toArray(), ...au.toArray(), ...b.toArray(), ...bu.toArray(), ...au.toArray());
        });
      }
    }
    const geo = (arr) => { const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3)); gg.computeVertexNormals(); return gg; };
    const suelo = new THREE.Mesh(geo(sv), matSuelo); suelo.material.side = THREE.DoubleSide; suelo.receiveShadow = true; g.add(suelo);
    g.add(new THREE.Mesh(geo(uv), matBajo));
    if (bv.length) g.add(new THREE.Mesh(geo(bv), matBorde));
  };
  tramo(c.principal.muestras, true, c.huecos);
  c.ramas.forEach((r) => tramo(r.muestras, r.barandillas, r.huecos || []));
  // Líneas de salida y meta (arco a cuadros)
  const arco = (m, color) => {
    const a = new THREE.Group();
    const poste = new THREE.CylinderGeometry(0.2, 0.2, 5, 10); const mp = new THREE.MeshStandardMaterial({ color });
    [-1, 1].forEach((s) => { const p = new THREE.Mesh(poste, mp); p.position.copy(m.p).addScaledVector(m.n, (s * m.ancho) / 2 + s * 0.3).add(new THREE.Vector3(0, 2.5, 0)); a.add(p); });
    const lienzo = document.createElement('canvas'); lienzo.width = 64; lienzo.height = 16; const cx = lienzo.getContext('2d');
    for (let x = 0; x < 16; x++) for (let y = 0; y < 4; y++) { cx.fillStyle = (x + y) % 2 ? '#111' : '#fff'; cx.fillRect(x * 4, y * 4, 4, 4); }
    const tx = new THREE.CanvasTexture(lienzo); tx.magFilter = THREE.NearestFilter;
    const banda = new THREE.Mesh(new THREE.PlaneGeometry(m.ancho + 0.6, 1), new THREE.MeshBasicMaterial({ map: tx, side: THREE.DoubleSide }));
    banda.position.copy(m.p).add(new THREE.Vector3(0, 5, 0)); banda.lookAt(m.p.clone().add(m.t).add(new THREE.Vector3(0, 5, 0))); a.add(banda);
    return a;
  };
  g.add(arco(c.salida, 0x334155), arco(c.meta, 0xef4444));
  // Turbos
  c.turbos.forEach(({ m }) => {
    const t = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(3, m.ancho * 0.6), 2.2), new THREE.MeshBasicMaterial({ color: 0xff7a00, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
    t.position.copy(m.p).addScaledVector(m.u, 0.04); t.lookAt(t.position.clone().add(m.u)); t.rotateZ(Math.atan2(m.t.x, m.t.z)); g.add(t);
  });
  // Paisaje: árboles/rocas alrededor
  const pts = c.principal.muestras;
  const minY = Math.min(...pts.map((m) => m.p.y));
  const rnd = (() => { let a = 7; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; })();
  const cono = new THREE.ConeGeometry(1.2, 3.5, 7); const matArbol = new THREE.MeshStandardMaterial({ color: def.hielo ? 0xf8fafc : def.id === 'canon' ? 0x9a3412 : 0x166534 });
  for (let k = 0; k < 140; k++) {
    const m = pts[Math.floor(rnd() * pts.length)];
    const p = m.p.clone().addScaledVector(m.n, (rnd() < 0.5 ? -1 : 1) * (m.ancho / 2 + 4 + rnd() * 18));
    p.y = minY - 6 + rnd() * 3;
    const a = new THREE.Mesh(cono, matArbol); a.position.copy(p); a.scale.setScalar(0.8 + rnd() * 1.6); g.add(a);
  }
  const suelo = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshStandardMaterial({ color: def.hielo ? 0xe2e8f0 : def.id === 'canon' ? 0xc2410c : 0x15803d }));
  suelo.rotation.x = -Math.PI / 2; suelo.position.y = minY - 7; g.add(suelo);
  return g;
}

function mallaCanica(tipo, fantasma = false) {
  const def = CANICAS[tipo] || CANICAS.cometa;
  const lienzo = document.createElement('canvas'); lienzo.width = 128; lienzo.height = 64; const cx = lienzo.getContext('2d');
  cx.fillStyle = `#${def.color.toString(16).padStart(6, '0')}`; cx.fillRect(0, 0, 128, 64);
  cx.fillStyle = 'rgba(255,255,255,0.75)'; cx.fillRect(0, 26, 128, 12);
  cx.font = '28px serif'; cx.fillText(def.emoji, 48, 30);
  const m = new THREE.Mesh(new THREE.SphereGeometry(RADIO, 32, 20), new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(lienzo), roughness: 0.25, metalness: 0.1, transparent: fantasma, opacity: fantasma ? 0.55 : 1 }));
  m.castShadow = true;
  return m;
}

/* ───────── Controles ───────── */
function useControles() {
  const entrada = useRef({ x: 0, y: 0 });
  const [modo, setModo] = useState('joystick');
  const base = useRef(null);
  const giro = useRef(null);
  useEffect(() => {
    const teclas = new Set();
    const act = () => { if (modo === 'giroscopio') return; entrada.current = { x: (teclas.has('ArrowRight') || teclas.has('d') ? 1 : 0) - (teclas.has('ArrowLeft') || teclas.has('a') ? 1 : 0), y: (teclas.has('ArrowUp') || teclas.has('w') ? 1 : 0) - (teclas.has('ArrowDown') || teclas.has('s') ? 1 : 0) }; };
    const d = (e) => { if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault(); teclas.add(e.key); act(); };
    const u = (e) => { teclas.delete(e.key); act(); };
    window.addEventListener('keydown', d); window.addEventListener('keyup', u);
    return () => { window.removeEventListener('keydown', d); window.removeEventListener('keyup', u); };
  }, [modo]);
  useEffect(() => {
    if (modo !== 'giroscopio') return undefined;
    const f = (e) => {
      if (e.beta == null) return;
      const ang = (screen.orientation?.angle ?? window.orientation ?? 0) % 360;
      let fb = e.beta; let lr = e.gamma;
      if (ang === 90) { fb = -e.gamma; lr = e.beta; } else if (ang === 270 || ang === -90) { fb = e.gamma; lr = -e.beta; }
      giro.current = { fb, lr };
      if (!base.current) base.current = { fb, lr };
      const cl = (v) => Math.max(-1, Math.min(1, v));
      entrada.current = { x: cl((lr - base.current.lr) / 22), y: cl((base.current.fb - fb) / 22) };
    };
    window.addEventListener('deviceorientation', f);
    return () => window.removeEventListener('deviceorientation', f);
  }, [modo]);
  const activarGiroscopio = async () => {
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const r = await DeviceOrientationEvent.requestPermission(); if (r !== 'granted') return false;
      }
      if (typeof DeviceOrientationEvent === 'undefined') return false;
      base.current = null; setModo('giroscopio'); return true;
    } catch { return false; }
  };
  const calibrar = () => { base.current = giro.current ? { ...giro.current } : null; };
  return { entrada, modo, setModo, activarGiroscopio, calibrar };
}

function Joystick({ entrada }) {
  const ref = useRef(null); const [pos, setPos] = useState([0, 0]);
  const mover = (e) => {
    const r = ref.current.getBoundingClientRect(); const cx = r.left + r.width / 2; const cy = r.top + r.height / 2;
    let x = (e.clientX - cx) / (r.width / 2); let y = (e.clientY - cy) / (r.height / 2); const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; }
    setPos([x, y]); entrada.current = { x, y: -y };
  };
  const soltar = () => { setPos([0, 0]); entrada.current = { x: 0, y: 0 }; };
  return (
    <div ref={ref} className="cn-joy" onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); mover(e); }} onPointerMove={(e) => { if (e.buttons || e.pointerType === 'touch') mover(e); }} onPointerUp={soltar} onPointerCancel={soltar}>
      <i style={{ transform: `translate(${pos[0] * 34}px, ${pos[1] * 34}px)` }} />
    </div>
  );
}

function Minimapa({ c, puntos }) {
  const { caminos, caja } = useMemo(() => {
    const todos = [c.principal.muestras, ...c.ramas.map((r) => r.muestras)];
    const xs = todos.flat().map((m) => m.p.x); const zs = todos.flat().map((m) => m.p.z);
    const cajaR = [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)];
    return { caja: cajaR, caminos: todos.map((M, i) => ({ d: M.filter((_, k) => k % 3 === 0).map((m, k) => `${k ? 'L' : 'M'}${m.p.x.toFixed(1)} ${m.p.z.toFixed(1)}`).join(' '), rama: i > 0 })) };
  }, [c]);
  const [x0, z0, x1, z1] = caja; const pad = 8;
  return (
    <svg className="cn-mapa" viewBox={`${x0 - pad} ${z0 - pad} ${x1 - x0 + pad * 2} ${z1 - z0 + pad * 2}`}>
      {caminos.map((k, i) => <path key={i} d={k.d} fill="none" stroke={k.rama ? '#fde68a' : '#ffffff'} strokeWidth={k.rama ? 2.5 : 4} strokeDasharray={k.rama ? '3 3' : undefined} strokeLinecap="round" strokeLinejoin="round" />)}
      <circle cx={c.meta.p.x} cy={c.meta.p.z} r="4" fill="#ef4444" />
      {puntos.map((p) => <circle key={p.id} cx={p.x} cy={p.z} r={p.yo ? 5 : 3.6} fill={p.color} stroke="#0f172a" strokeWidth="1.2" />)}
    </svg>
  );
}

/**
 * props: circuitoId, canica, orden, rivales [{ id, nombre, canica, orden, bot }], inicio (ms, reloj local), yoNombre,
 *   sync(estado) → Promise<{ otros, eventos, trampas }> (online) · onObjeto(tipo, datos) · onLlegada(ms)
 */
export default function Carrera3D({ circuitoId, canica, orden = 0, rivales = [], inicio, sync, onObjeto, onLlegada, colorDe }) {
  const caja = useRef(null);
  const ctl = useControles();
  const [hud, setHud] = useState({ puesto: 1, prog: 0, t: 0, objeto: null, aviso: null, meta: null, salto: true });
  const c = useMemo(() => construirCircuito(circuitoId), [circuitoId]);
  const G = useRef(null);

  useEffect(() => {
    const el = caja.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = true;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(c.def.cielo); scene.fog = new THREE.Fog(c.def.cielo, 60, 170);
    const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 400);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 1.1));
    const sol = new THREE.DirectionalLight(0xffffff, 1.3); sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024);
    Object.assign(sol.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 80 }); scene.add(sol, sol.target);
    scene.add(mallaPista(c));
    // Física y canicas
    const w = crearMundo(c, CANNON);
    const yo = crearCanica(w, canica, posSalida(c, orden));
    const mallaYo = mallaCanica(canica); scene.add(mallaYo);
    const otros = new Map();
    rivales.forEach((r) => {
      const k = crearCanica(w, r.canica, posSalida(c, r.orden), { kinematica: !r.bot });
      if (yo.def.fantasma || CANICAS[r.canica]?.fantasma) k.body.collisionResponse = false;
      const m = mallaCanica(r.canica, !r.bot); scene.add(m);
      otros.set(r.id, { ...r, k, m, buffer: [], bot: r.bot ? crearBot(c) : null, llegada: null });
    });
    // Cajas de objetos
    const cajas = c.cajas.map((p) => ({ p, hasta: 0 }));
    const geoCaja = new THREE.BoxGeometry(1.1, 1.1, 1.1);
    const lienzo = document.createElement('canvas'); lienzo.width = 64; lienzo.height = 64; const cx = lienzo.getContext('2d');
    cx.fillStyle = '#facc15'; cx.fillRect(0, 0, 64, 64); cx.fillStyle = '#7c2d12'; cx.font = 'bold 48px sans-serif'; cx.textAlign = 'center'; cx.fillText('?', 32, 50);
    const matCaja = new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(lienzo), transparent: true, opacity: 0.92 });
    const mallasCaja = cajas.map((cj) => { const m = new THREE.Mesh(geoCaja, matCaja); m.position.copy(cj.p); scene.add(m); return m; });
    // Manchas de aceite
    const mallasTrampa = new Map();
    const trampasLocales = []; // práctica
    const geoMancha = new THREE.CircleGeometry(1.3, 20); const matMancha = new THREE.MeshBasicMaterial({ color: 0x111827, transparent: true, opacity: 0.85 });

    const st = { renderer, scene, camera, w, yo, otros, t: 0, rumbo: new THREE.Vector3().copy(c.principal.muestras[4].t).setY(0).normalize(), camPos: null, desdeEv: 0, trampas: [], llegue: false, inicioLocal: inicio, ultimoSync: 0, offset: 0, aviso: null };
    G.current = st;
    const ajustar = () => { renderer.setSize(el.clientWidth, el.clientHeight); camera.aspect = el.clientWidth / el.clientHeight; camera.updateProjectionMatrix(); };
    ajustar(); const ro = new ResizeObserver(ajustar); ro.observe(el);
    const avisar = (txt) => { st.aviso = { txt, hasta: performance.now() + 1600 }; };

    const usarObjeto = (k, quien) => {
      const o = k.objeto; if (!o) return; k.objeto = null; const tt = st.t;
      if (o === 'turbo') k.turboHasta = tt + (k.def.turbo ? 4 : 2);
      if (o === 'escudo') k.escudo = true;
      if (o === 'muelle') saltar(k, tt, 13);
      if (o === 'aceite') {
        const v = k.body.velocity; const vh = Math.hypot(v.x, v.z) || 1;
        const pos = [k.body.position.x - (v.x / vh) * 2.5, k.body.position.y - RADIO + 0.05, k.body.position.z - (v.z / vh) * 2.5];
        if (sync && quien === 'yo') onObjeto?.('aceite', { pos }); else trampasLocales.push({ id: Math.random(), pos, de: quien, hasta: tt + 40 });
      }
      if (o === 'rayo') {
        if (sync && quien === 'yo') onObjeto?.('rayo', {});
        else {
          const progQuien = k.prog;
          [st.yo, ...[...otros.values()].map((x) => x.k)].forEach((x) => { if (x !== k && x.prog > progQuien) { if (x.escudo) x.escudo = false; else x.rayoHasta = tt + 2.5; } });
          if (st.yo !== k && st.yo.prog > progQuien) avisar('⚡ ¡Te han dado con un rayo!');
        }
      }
      if (quien === 'yo') { sonar(o === 'rayo' ? 'pulsador' : 'reaccion'); avisar(`${OBJETOS[o].emoji} ${OBJETOS[o].nombre}`); }
    };
    st.usarObjeto = () => usarObjeto(yo, 'yo');
    st.saltar = () => { if (yo.def.salto && st.t > yo.saltoListo) { saltar(yo, st.t, 9); yo.saltoListo = st.t + 4; sonar('toque'); } };

    // Sincronización online
    const sincronizar = async () => {
      if (!sync) return;
      const p = yo.body.position; const v = yo.body.velocity;
      try {
        const r = await sync({ s: { p: [p.x, p.y, p.z], v: [v.x, v.y, v.z], prog: yo.prog }, desde: st.desdeEv });
        if (!r?.otros) return;
        const ahoraL = performance.now();
        r.otros.forEach((o) => {
          const x = otros.get(o.id); if (!x) return;
          if (o.s) { x.buffer.push({ t: ahoraL, p: o.s.p, v: o.s.v, prog: o.s.prog }); if (x.buffer.length > 6) x.buffer.shift(); x.k.prog = o.s.prog; }
          x.llegada = o.llegada;
        });
        (r.eventos || []).forEach((e) => {
          st.desdeEv = Math.max(st.desdeEv, e.n);
          if (e.tipo === 'rayo' && yo.prog > e.prog && !st.llegue && otros.has(e.de)) {
            { if (yo.escudo) { yo.escudo = false; avisar('🛡️ ¡El escudo te salvó del rayo!'); } else { yo.rayoHasta = st.t + 2.5; avisar('⚡ ¡Rayo! Vas más lenta'); vibrar([60, 40, 60]); } }
          }
        });
        st.trampas = r.trampas || [];
      } catch { /* sin red: se reintenta */ }
    };

    let raf; let ant = performance.now(); let acum = 0;
    const bucle = (ahora) => {
      raf = requestAnimationFrame(bucle);
      acum += Math.min(0.1, (ahora - ant) / 1000); ant = ahora;
      const empezada = Date.now() >= st.inicioLocal;
      while (acum >= DT) {
        acum -= DT;
        if (!empezada) { // en la parrilla, quietas
          const s0 = posSalida(c, orden); yo.body.position.set(s0.x, s0.y, s0.z); yo.body.velocity.set(0, 0, 0);
          otros.forEach((x) => { if (x.bot) { const s1 = posSalida(c, x.orden); x.k.body.position.set(s1.x, s1.y, s1.z); x.k.body.velocity.set(0, 0, 0); } });
        } else {
          st.t += DT;
          // Mi canica: control relativo a la cámara
          const e = st.llegue ? { x: 0, y: 0 } : ctl.entrada.current;
          const f = st.rumbo; const r = new THREE.Vector3(-f.z, 0, f.x);
          let dx = f.x * e.y + r.x * e.x; let dz = f.z * e.y + r.z * e.x; const l = Math.hypot(dx, dz); if (l > 1) { dx /= l; dz /= l; }
          controlar(yo, [dx, dz], st.t, DT);
          // Bots (práctica)
          otros.forEach((x) => {
            if (!x.bot) return;
            if (x.k.terminada) { controlar(x.k, [0, 0], st.t, DT); return; }
            controlar(x.k, dirBot(c, x.k, x.bot), st.t, DT);
            if (x.k.objeto && Math.random() < 0.01) usarObjeto(x.k, x.id);
          });
        }
        // Rivales online: se interpolan ~150 ms por detrás
        otros.forEach((x) => {
          if (x.bot || !x.buffer.length) return;
          const objetivo = performance.now() - 150; const b = x.buffer;
          let a = b[0]; let z = b[b.length - 1];
          for (let i = 0; i < b.length - 1; i++) if (b[i].t <= objetivo && b[i + 1].t >= objetivo) { a = b[i]; z = b[i + 1]; }
          const u = z.t === a.t ? 1 : Math.max(0, Math.min(1, (objetivo - a.t) / (z.t - a.t)));
          const px = a.p[0] + (z.p[0] - a.p[0]) * u; const py = a.p[1] + (z.p[1] - a.p[1]) * u; const pz = a.p[2] + (z.p[2] - a.p[2]) * u;
          x.k.body.position.set(px, py, pz); x.k.body.velocity.set(z.v[0], z.v[1], z.v[2]);
        });
        paso(w, DT);
        if (empezada) {
          const ev = revisar(c, yo, cajas, st.t);
          if (ev.caida) { avisar('💨 ¡Te has caído!'); sonar('fallo'); }
          if (ev.turbo) sonar('reaccion');
          if (ev.caja) { yo.objeto = sortearObjeto(st.puesto || 1, otros.size + 1); sonar('acierto'); vibrar(20); }
          if (ev.meta && !st.llegue) { st.llegue = true; st.miTiempo = st.t * 1000; onLlegada?.(st.miTiempo, st.puesto); sonar('victoria'); }
          otros.forEach((x) => {
            if (!x.bot) return;
            const e2 = revisar(c, x.k, cajas, st.t);
            if (e2.caja) x.k.objeto = sortearObjeto(2, otros.size + 1);
            if (e2.meta && !x.llegada) x.llegada = st.t * 1000;
          });
          // Manchas de aceite (online o de los bots)
          const todas = [...st.trampas, ...trampasLocales.filter((tr) => tr.hasta > st.t)];
          todas.forEach((tr) => {
            const p = yo.body.position; if ((p.x - tr.pos[0]) ** 2 + (p.z - tr.pos[2]) ** 2 > 2.6 || Math.abs(p.y - tr.pos[1]) > 2 || tr.de === 'yo') return;
            if (yo.def.fantasma) return;
            if (yo.escudo) { yo.escudo = false; avisar('🛡️ ¡El escudo te salvó!'); } else { yo.derrapeHasta = st.t + 1.4; avisar('🛢️ ¡Aceite!'); vibrar(80); }
            if (sync && tr.id && typeof tr.id === 'number' && tr.de !== undefined) onObjeto?.('pisada', { trampa: tr.id });
            tr.hasta = -1; const i = trampasLocales.indexOf(tr); if (i >= 0) trampasLocales.splice(i, 1); st.trampas = st.trampas.filter((x) => x !== tr);
          });
        }
      }
      if (sync && ahora - st.ultimoSync > 120) { st.ultimoSync = ahora; sincronizar(); }
      // Puesto: por progreso (y quien ya llegó, delante)
      const lista = [{ id: 'yo', prog: st.llegue ? 2 + 1 / (st.miTiempo || 1) : yo.prog }, ...[...otros.values()].map((x) => ({ id: x.id, prog: x.llegada ? 2 + 1 / x.llegada : x.k.prog }))];
      lista.sort((a, b) => b.prog - a.prog); st.puesto = lista.findIndex((x) => x.id === 'yo') + 1;
      // Dibujo
      const pY = yo.body.position;
      mallaYo.position.set(pY.x, pY.y, pY.z); mallaYo.quaternion.set(yo.body.quaternion.x, yo.body.quaternion.y, yo.body.quaternion.z, yo.body.quaternion.w);
      otros.forEach((x) => { x.m.position.copy(x.k.body.position); x.m.quaternion.copy(x.k.body.quaternion); });
      cajas.forEach((cj, i) => { mallasCaja[i].visible = cj.hasta <= st.t; mallasCaja[i].rotation.y = ahora / 600; mallasCaja[i].position.y = cj.p.y + Math.sin(ahora / 400 + i) * 0.15; });
      const todasT = [...st.trampas, ...trampasLocales];
      const vivas = new Set();
      todasT.forEach((tr) => { const key = String(tr.id); vivas.add(key); if (!mallasTrampa.has(key)) { const m = new THREE.Mesh(geoMancha, matMancha); m.rotation.x = -Math.PI / 2; m.position.set(tr.pos[0], tr.pos[1] + 0.03, tr.pos[2]); scene.add(m); mallasTrampa.set(key, m); } });
      mallasTrampa.forEach((m, key) => { if (!vivas.has(key)) { scene.remove(m); mallasTrampa.delete(key); } });
      // Cámara de persecución: el rumbo sigue a la velocidad (si va deprisa) o a la pista
      const v = yo.body.velocity; const vh = Math.hypot(v.x, v.z);
      const tPista = c.principal.muestras[Math.min(c.principal.muestras.length - 1, yo.pista.i + 3)].t;
      const deseado = vh > 3 ? new THREE.Vector3(v.x, 0, v.z).normalize() : new THREE.Vector3(tPista.x, 0, tPista.z).normalize();
      st.rumbo.lerp(deseado, 0.05).normalize();
      const objetivoCam = new THREE.Vector3(pY.x, pY.y, pY.z).addScaledVector(st.rumbo, -8.5).add(new THREE.Vector3(0, 5.2, 0));
      if (!st.camPos) st.camPos = objetivoCam.clone();
      st.camPos.lerp(objetivoCam, 0.12);
      camera.position.copy(st.camPos); camera.lookAt(pY.x + st.rumbo.x * 5, pY.y - 0.6, pY.z + st.rumbo.z * 5);
      sol.position.set(pY.x + 10, pY.y + 25, pY.z + 8); sol.target.position.set(pY.x, pY.y, pY.z);
      renderer.render(scene, camera);
      // Marcador (unas 6 veces por segundo)
      if (!st.ultHud || ahora - st.ultHud > 160) {
        st.ultHud = ahora;
        const mapa = [{ id: 'yo', x: pY.x, z: pY.z, color: '#facc15', yo: true }, ...[...otros.values()].map((x) => ({ id: x.id, x: x.k.body.position.x, z: x.k.body.position.z, color: colorDe ? colorDe(x.id) : '#94a3b8' }))];
        setHud({
          puesto: st.puesto, total: otros.size + 1, prog: Math.min(1, yo.prog), t: empezada ? st.t * 1000 : 0, cuenta: empezada ? 0 : Math.ceil((st.inicioLocal - Date.now()) / 1000),
          objeto: yo.objeto, escudo: yo.escudo, aviso: st.aviso && st.aviso.hasta > ahora ? st.aviso.txt : null, meta: st.llegue ? st.miTiempo : null, mapa,
          salto: yo.def.salto ? st.t > yo.saltoListo : null, rayo: st.t < yo.rayoHasta, turbo: st.t < yo.turboHasta
        });
      }
    };
    raf = requestAnimationFrame(bucle);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); el.removeChild(renderer.domElement); };
  }, [c]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (G.current) G.current.inicioLocal = inicio; }, [inicio]);

  const st = G.current;
  return (
    <div className="cn-caja">
      <div ref={caja} className="cn-escena" />
      <div className="cn-arriba">
        <span className="cn-puesto">{hud.puesto}.º<small>/{hud.total || 1}</small></span>
        <span className="cn-tiempo">{fmt(hud.t)}</span>
      </div>
      <div className="cn-progreso"><i style={{ width: `${hud.prog * 100}%` }} /><b>{Math.round(hud.prog * 100)}%</b></div>
      {hud.mapa && <Minimapa c={c} puntos={hud.mapa} />}
      {hud.cuenta > 0 && <div className="cn-cuenta" key={hud.cuenta}>{hud.cuenta}</div>}
      {hud.cuenta === 0 && hud.t > 0 && hud.t < 900 && <div className="cn-cuenta ya">¡YA!</div>}
      {hud.aviso && <div className="cn-aviso">{hud.aviso}</div>}
      {(hud.rayo || hud.turbo || hud.escudo) && <div className="cn-estados">{hud.turbo && '🚀'}{hud.rayo && '⚡'}{hud.escudo && '🛡️'}</div>}
      {hud.meta != null && <div className="cn-meta">🏁 ¡META! {hud.puesto}.º · {fmt(hud.meta)}</div>}
      <div className="cn-mandos">
        {ctl.modo === 'joystick' ? <Joystick entrada={ctl.entrada} /> : (
          <button type="button" className="cn-calibrar" onClick={ctl.calibrar}>🎯 Calibrar<br /><small>pon el móvil recto y pulsa</small></button>
        )}
        <div className="cn-botones">
          <button type="button" className="cn-giro" onClick={async () => { if (ctl.modo === 'giroscopio') ctl.setModo('joystick'); else if (!(await ctl.activarGiroscopio())) alert('Este dispositivo no deja usar el giroscopio (en iPhone hace falta https). Usa el joystick.'); }}>{ctl.modo === 'giroscopio' ? '🕹️ Joystick' : '📱 Inclinar'}</button>
          {hud.salto !== null && <button type="button" className="cn-salto" disabled={!hud.salto} onClick={() => st?.saltar()}>⤴</button>}
          <button type="button" className={`cn-objeto${hud.objeto ? ' lleno' : ''}`} disabled={!hud.objeto} onClick={() => st?.usarObjeto()} aria-label={hud.objeto ? `Usar ${OBJETOS[hud.objeto].nombre}` : 'Sin objeto'}>{hud.objeto ? OBJETOS[hud.objeto].emoji : '·'}</button>
        </div>
      </div>
    </div>
  );
}
