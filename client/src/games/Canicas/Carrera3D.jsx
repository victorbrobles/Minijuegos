// client/src/games/Canicas/Carrera3D.jsx
// La carrera en 3D: pista de varias vueltas, canicas, cámara de persecución, mandos (joystick que aparece donde
// pones el dedo, botón de derrape y de objeto; o teclado), objetos (misiles, aceite, rayo, estrella…), rebufo,
// minimapa y marcador. Sirve para online (rivales sincronizados) y para la práctica (rivales bot).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { construirCircuito } from './circuitos.js';
import { CANICAS, OBJETOS, sortearObjeto, IDS_OBJETOS } from './canicas.js';
import { crearMundo, crearCanica, posSalida, controlar, revisar, saltar, golpear, crearBot, dirBot, paso, enRango, RADIO, CARGAS } from './fisica.js';
import { sonar, vibrar } from '../../lib/sonido.js';

const DT = 1 / 60;
const fmt = (ms) => (ms == null ? '—' : `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}.${String(Math.floor((ms % 1000) / 100))}`);
const COLOR_CARGA = [null, '#38bdf8', '#fb923c', '#c084fc'];

/* ───────── Texturas pequeñas ───────── */
function textura(dibujar, w = 64, h = 64, rep = null) {
  const lienzo = document.createElement('canvas'); lienzo.width = w; lienzo.height = h;
  dibujar(lienzo.getContext('2d'), w, h);
  const tx = new THREE.CanvasTexture(lienzo);
  if (rep) { tx.wrapS = THREE.RepeatWrapping; tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(...rep); }
  return tx;
}
const flechas = (color) => textura((cx, w, h) => {
  cx.fillStyle = color; cx.fillRect(0, 0, w, h); cx.fillStyle = 'rgba(255,255,255,0.9)';
  [0, 1].forEach((k) => { const y = 8 + k * 26; cx.beginPath(); cx.moveTo(8, y + 20); cx.lineTo(32, y); cx.lineTo(56, y + 20); cx.lineTo(56, y + 28); cx.lineTo(32, y + 8); cx.lineTo(8, y + 28); cx.closePath(); cx.fill(); });
});

/* ───────── Pista en 3D ───────── */
function mallaPista(c) {
  const g = new THREE.Group();
  const def = c.def;
  const hexS = `#${def.suelo.toString(16).padStart(6, '0')}`;
  const txSuelo = textura((cx, w, h) => {
    cx.fillStyle = hexS; cx.fillRect(0, 0, w, h);
    cx.fillStyle = 'rgba(255,255,255,0.10)'; cx.fillRect(0, 0, w, h / 2); // bandas cada pocos metros: se nota la velocidad
    cx.fillStyle = 'rgba(255,255,255,0.55)'; cx.fillRect(2, 0, 2, h); cx.fillRect(w - 4, 0, 2, h); // líneas de los bordes
    cx.fillStyle = 'rgba(255,255,255,0.35)'; cx.fillRect(w / 2 - 1, h * 0.15, 2, h * 0.35); // discontinua central
  }, 64, 64);
  txSuelo.wrapT = THREE.RepeatWrapping; txSuelo.anisotropy = 4;
  const matSuelo = new THREE.MeshStandardMaterial({ map: txSuelo, roughness: def.hielo ? 0.12 : 0.75, metalness: def.hielo ? 0.25 : 0, side: THREE.DoubleSide });
  const matBorde = new THREE.MeshStandardMaterial({ color: def.borde, roughness: 0.5, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
  const matBajo = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9, side: THREE.DoubleSide });
  const matPiano = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
  const tramo = (M, cerrada, barandillas, huecos = []) => {
    const sv = []; const st = []; const bv = []; const uv = []; const pv = []; const pc = [];
    const n = M.length; const fin = cerrada ? n : n - 1;
    const L = M.map((m) => m.p.clone().addScaledVector(m.n, -m.ancho / 2)); const R = M.map((m) => m.p.clone().addScaledVector(m.n, m.ancho / 2));
    const abajo = (v, m) => v.clone().addScaledVector(m.u, -0.7);
    for (let i = 0; i < fin; i++) {
      const j = (i + 1) % n;
      if (M[i].hueco || M[j].hueco) continue;
      sv.push(...L[i].toArray(), ...R[i].toArray(), ...L[j].toArray(), ...R[i].toArray(), ...R[j].toArray(), ...L[j].toArray());
      const v0 = i / 5; const v1 = (i + 1) / 5;
      st.push(0, v0, 1, v0, 0, v1, 1, v0, 1, v1, 0, v1);
      [L, R].forEach((E) => { const a = E[i]; const b = E[j]; uv.push(...a.toArray(), ...b.toArray(), ...abajo(a, M[i]).toArray(), ...b.toArray(), ...abajo(b, M[j]).toArray(), ...abajo(a, M[i]).toArray()); });
      [[L, -1], [R, 1]].forEach(([E, lado]) => {
        const abierto = !barandillas || huecos.some((h) => h.lado === lado && enRango(i, h.desde, h.hasta, cerrada ? n : 0));
        const a = E[i]; const b = E[j];
        if (!abierto) {
          const au = a.clone().addScaledVector(M[i].u, 1.0); const bu = b.clone().addScaledVector(M[j].u, 1.0);
          bv.push(...a.toArray(), ...b.toArray(), ...au.toArray(), ...b.toArray(), ...bu.toArray(), ...au.toArray());
        } else {
          // Piano rojo y blanco en el borde sin barandilla (avisa del vacío)
          const dentro = (v, m) => v.clone().addScaledVector(m.n, -lado * 0.7).addScaledVector(m.u, 0.02);
          const a2 = dentro(a, M[i]); const b2 = dentro(b, M[j]);
          const ay = a.clone().addScaledVector(M[i].u, 0.02); const by = b.clone().addScaledVector(M[j].u, 0.02);
          pv.push(...ay.toArray(), ...by.toArray(), ...a2.toArray(), ...by.toArray(), ...b2.toArray(), ...a2.toArray());
          const col = Math.floor(i / 2) % 2 ? [0.94, 0.2, 0.2] : [1, 1, 1];
          for (let q = 0; q < 6; q++) pc.push(...col);
        }
      });
    }
    const geo = (arr) => { const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3)); gg.computeVertexNormals(); return gg; };
    const gs = geo(sv); gs.setAttribute('uv', new THREE.Float32BufferAttribute(st, 2));
    const suelo = new THREE.Mesh(gs, matSuelo); suelo.receiveShadow = true; g.add(suelo);
    g.add(new THREE.Mesh(geo(uv), matBajo));
    if (bv.length) g.add(new THREE.Mesh(geo(bv), matBorde));
    if (pv.length) { const gp = geo(pv); gp.setAttribute('color', new THREE.Float32BufferAttribute(pc, 3)); g.add(new THREE.Mesh(gp, matPiano)); }
  };
  tramo(c.principal.muestras, true, true, c.huecos);
  c.ramas.forEach((r) => tramo(r.muestras, false, r.barandillas, r.huecos || []));
  // Arco de salida/meta a cuadros
  const m0 = c.meta;
  const poste = new THREE.CylinderGeometry(0.25, 0.25, 6, 10); const mp = new THREE.MeshStandardMaterial({ color: 0x334155 });
  [-1, 1].forEach((s) => { const p = new THREE.Mesh(poste, mp); p.position.copy(m0.p).addScaledVector(m0.n, (s * m0.ancho) / 2 + s * 0.4).add(new THREE.Vector3(0, 3, 0)); g.add(p); });
  const cuadros = textura((cx) => { for (let x = 0; x < 16; x++) for (let y = 0; y < 4; y++) { cx.fillStyle = (x + y) % 2 ? '#111' : '#fff'; cx.fillRect(x * 4, y * 4, 4, 4); } }, 64, 16);
  cuadros.magFilter = THREE.NearestFilter;
  const banda = new THREE.Mesh(new THREE.PlaneGeometry(m0.ancho + 0.8, 1.2), new THREE.MeshBasicMaterial({ map: cuadros, side: THREE.DoubleSide }));
  banda.position.copy(m0.p).add(new THREE.Vector3(0, 6, 0)); banda.lookAt(m0.p.clone().add(m0.t).add(new THREE.Vector3(0, 6, 0))); g.add(banda);
  const tumbar = (malla, m, alzar) => { malla.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(m.n, m.t, m.u)); malla.position.copy(m.p).addScaledVector(m.u, alzar); };
  const linea = new THREE.Mesh(new THREE.PlaneGeometry(m0.ancho, 1.2), new THREE.MeshBasicMaterial({ map: cuadros, side: THREE.DoubleSide }));
  tumbar(linea, m0, 0.03); g.add(linea);
  // Turbos (naranja) y rampas de salto (azul)
  const placa = (m, tx, largo, alzar = 0) => {
    const t = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(3.2, m.ancho * 0.6), largo), new THREE.MeshBasicMaterial({ map: tx, transparent: true, side: THREE.DoubleSide }));
    tumbar(t, m, 0.05 + alzar); g.add(t);
  };
  const txTurbo = flechas('#f97316'); const txSalto = flechas('#2563eb');
  c.turbos.forEach(({ m }) => placa(m, txTurbo, 2.4));
  c.saltos.forEach(({ m }) => {
    placa(m, txSalto, 3, 0.05);
    const rampa = new THREE.Mesh(new THREE.BoxGeometry(Math.min(3.2, m.ancho * 0.6), 0.25, 2.6), new THREE.MeshStandardMaterial({ color: 0x1d4ed8 }));
    rampa.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(m.n, m.u, m.t.clone().negate())); rampa.rotateX(0.22);
    rampa.position.copy(m.p).addScaledVector(m.u, 0.3); g.add(rampa);
  });
  // Paisaje: árboles/rocas y el suelo (lava en el volcán)
  const pts = c.principal.muestras;
  const minY = Math.min(...pts.map((m) => m.p.y));
  const rnd = (() => { let a = 7; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; })();
  const cono = def.lava ? new THREE.DodecahedronGeometry(1.4) : new THREE.ConeGeometry(1.3, 4, 7); const matArbol = new THREE.MeshStandardMaterial({ color: def.arbol, flatShading: true });
  const arboles = new THREE.InstancedMesh(cono, matArbol, 180); const mtx = new THREE.Matrix4();
  for (let k = 0; k < 180; k++) {
    const m = pts[Math.floor(rnd() * pts.length)];
    const p = m.p.clone().addScaledVector(m.n, (rnd() < 0.5 ? -1 : 1) * (m.ancho / 2 + 6 + rnd() * 24));
    p.y = minY - 8 + 2;
    const s = 0.8 + rnd() * 1.8; mtx.compose(p, new THREE.Quaternion(), new THREE.Vector3(s, s, s)); arboles.setMatrixAt(k, mtx);
  }
  g.add(arboles);
  const suelo = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), def.lava ? new THREE.MeshBasicMaterial({ color: 0xea580c }) : new THREE.MeshStandardMaterial({ color: def.campo }));
  suelo.rotation.x = -Math.PI / 2; suelo.position.y = minY - 8; g.add(suelo);
  return g;
}

function mallaCanica(tipo, fantasma = false) {
  const def = CANICAS[tipo] || CANICAS.cometa;
  const tx = textura((cx) => {
    cx.fillStyle = `#${def.color.toString(16).padStart(6, '0')}`; cx.fillRect(0, 0, 128, 64);
    cx.fillStyle = 'rgba(255,255,255,0.75)'; cx.fillRect(0, 26, 128, 12);
    cx.font = '28px serif'; cx.fillText(def.emoji, 48, 30);
  }, 128, 64);
  const m = new THREE.Mesh(new THREE.SphereGeometry(RADIO, 28, 18), new THREE.MeshStandardMaterial({ map: tx, roughness: 0.25, metalness: 0.1, transparent: fantasma, opacity: fantasma ? 0.55 : 1 }));
  m.castShadow = true;
  return m;
}

/* ───────── Mandos ───────── */
function useTeclado(entrada, acciones) {
  useEffect(() => {
    const teclas = new Set();
    const act = () => {
      const e = entrada.current;
      e.tGiro = (teclas.has('ArrowRight') || teclas.has('d') ? 1 : 0) - (teclas.has('ArrowLeft') || teclas.has('a') ? 1 : 0);
      e.tFreno = teclas.has('ArrowDown') || teclas.has('s');
      e.tDerrape = teclas.has(' ') || teclas.has('Shift');
    };
    const d = (e) => {
      if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
      if (!teclas.has(e.key)) {
        if (['e', 'Enter', 'x'].includes(e.key)) acciones.current.objeto?.();
        if (['q', 'ArrowUp', 'w'].includes(e.key)) acciones.current.saltar?.();
      }
      teclas.add(e.key); act();
    };
    const u = (e) => { teclas.delete(e.key); act(); };
    window.addEventListener('keydown', d); window.addEventListener('keyup', u);
    return () => { window.removeEventListener('keydown', d); window.removeEventListener('keyup', u); };
  }, [entrada, acciones]);
}

/** Joystick que aparece donde se pone el dedo (mitad izquierda). Izquierda/derecha gira; abajo frena (y marcha atrás). */
function ZonaJoystick({ entrada }) {
  const base = useRef(null); const pomo = useRef(null); const toque = useRef(null);
  const RADIO_JOY = 52;
  const mover = (e) => {
    const t = toque.current; if (!t || e.pointerId !== t.id) return;
    let dx = e.clientX - t.x; let dy = e.clientY - t.y; const l = Math.hypot(dx, dy);
    if (l > RADIO_JOY) { dx *= RADIO_JOY / l; dy *= RADIO_JOY / l; }
    pomo.current.style.transform = `translate(${dx}px, ${dy}px)`;
    const x = dx / RADIO_JOY; const zm = 0.1;
    entrada.current.jGiro = Math.abs(x) < zm ? 0 : Math.sign(x) * (Math.abs(x) - zm) / (1 - zm);
    entrada.current.jFreno = dy / RADIO_JOY > 0.6;
  };
  const empezar = (e) => {
    if (toque.current) return;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* nada */ }
    const r = e.currentTarget.getBoundingClientRect();
    toque.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    base.current.style.left = `${e.clientX - r.left}px`; base.current.style.top = `${e.clientY - r.top}px`; base.current.classList.add('activo');
    mover(e);
  };
  const soltar = (e) => {
    if (!toque.current || e.pointerId !== toque.current.id) return;
    toque.current = null; entrada.current.jGiro = 0; entrada.current.jFreno = false;
    pomo.current.style.transform = 'translate(0px, 0px)'; base.current.classList.remove('activo');
  };
  return (
    <div className="cn-zona" onPointerDown={empezar} onPointerMove={mover} onPointerUp={soltar} onPointerCancel={soltar}>
      <div ref={base} className="cn-joy"><i ref={pomo} /></div>
      <span className="cn-zona-pista">Desliza aquí para girar ↔ · abajo frena</span>
    </div>
  );
}

function Minimapa({ c, puntos }) {
  const { caminos, caja } = useMemo(() => {
    const todos = [c.principal.muestras, ...c.ramas.map((r) => r.muestras)];
    const xs = todos.flat().map((m) => m.p.x); const zs = todos.flat().map((m) => m.p.z);
    const cajaR = [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)];
    return { caja: cajaR, caminos: todos.map((M, i) => ({ d: M.filter((_, k) => k % 3 === 0).map((m, k) => `${k ? 'L' : 'M'}${m.p.x.toFixed(1)} ${m.p.z.toFixed(1)}`).join(' ') + (i === 0 ? 'Z' : ''), rama: i > 0 })) };
  }, [c]);
  const [x0, z0, x1, z1] = caja; const pad = 8;
  return (
    <svg className="cn-mapa" viewBox={`${x0 - pad} ${z0 - pad} ${x1 - x0 + pad * 2} ${z1 - z0 + pad * 2}`}>
      {caminos.map((k, i) => <path key={i} d={k.d} fill="none" stroke={k.rama ? '#fde68a' : '#ffffff'} strokeWidth={k.rama ? 4 : 7} strokeDasharray={k.rama ? '6 5' : undefined} strokeLinecap="round" strokeLinejoin="round" />)}
      <circle cx={c.meta.p.x} cy={c.meta.p.z} r="6" fill="#ef4444" />
      {puntos.map((p) => <circle key={p.id} cx={p.x} cy={p.z} r={p.yo ? 8 : 6} fill={p.color} stroke="#0f172a" strokeWidth="2" />)}
    </svg>
  );
}

/**
 * props: circuitoId, canica, orden, rivales [{ id, nombre, canica, orden, bot }], inicio (ms, reloj local),
 *   sync(estado) → Promise<{ otros, eventos, trampas }> (online) · onObjeto(tipo, datos) · onLlegada(ms, puesto)
 */
export default function Carrera3D({ circuitoId, canica, orden = 0, rivales = [], inicio, sync, onObjeto, onLlegada, colorDe }) {
  const caja = useRef(null);
  const entrada = useRef({ jGiro: 0, jFreno: false, tGiro: 0, tFreno: false, tDerrape: false, bDerrape: false });
  const acciones = useRef({});
  useTeclado(entrada, acciones);
  const [hud, setHud] = useState({ puesto: 1, prog: 0, t: 0, objeto: null, aviso: null, meta: null, salto: null, vuelta: 1 });
  const c = useMemo(() => construirCircuito(circuitoId), [circuitoId]);

  useEffect(() => {
    const el = caja.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = true;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(c.def.cielo); scene.fog = new THREE.Fog(c.def.cielo, 70, 210);
    const camera = new THREE.PerspectiveCamera(64, 1, 0.1, 500);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, c.def.lava ? 0.8 : 1.1));
    const sol = new THREE.DirectionalLight(c.def.lava ? 0xffb38a : 0xffffff, 1.3); sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024);
    Object.assign(sol.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 80 }); scene.add(sol, sol.target);
    scene.add(mallaPista(c));
    const hielo = Boolean(c.def.hielo);
    // Física y canicas
    const w = crearMundo(c, CANNON);
    const yo = crearCanica(w, canica, posSalida(c, orden), { c, orden });
    const mallaYo = mallaCanica(canica); scene.add(mallaYo);
    const otros = new Map();
    rivales.forEach((r, n) => {
      const k = crearCanica(w, r.canica, posSalida(c, r.orden), { kinematica: !r.bot, c, orden: r.orden });
      if (yo.def.fantasma || CANICAS[r.canica]?.fantasma) k.body.collisionResponse = false;
      const m = mallaCanica(r.canica, !r.bot); scene.add(m);
      otros.set(r.id, { ...r, k, m, buffer: [], bot: r.bot ? crearBot(c, Math.random, 0.9 + (n % 4) * 0.025 + Math.random() * 0.02) : null, llegada: null });
    });
    // Cajas de objetos
    const cajas = c.cajas.map((p) => ({ p, hasta: 0 }));
    const geoCaja = new THREE.BoxGeometry(1.1, 1.1, 1.1);
    const txCaja = textura((cx) => { const gr = cx.createLinearGradient(0, 0, 64, 64); gr.addColorStop(0, '#fde047'); gr.addColorStop(1, '#f97316'); cx.fillStyle = gr; cx.fillRect(0, 0, 64, 64); cx.fillStyle = '#7c2d12'; cx.font = 'bold 48px sans-serif'; cx.textAlign = 'center'; cx.fillText('?', 32, 50); });
    const matCaja = new THREE.MeshStandardMaterial({ map: txCaja, transparent: true, opacity: 0.92, emissive: 0x7c2d12, emissiveIntensity: 0.15 });
    const mallasCaja = cajas.map((cj) => { const m = new THREE.Mesh(geoCaja, matCaja); m.position.copy(cj.p); scene.add(m); return m; });
    // Manchas de aceite, misiles, escudo, estrella y chispas del derrape
    const mallasTrampa = new Map();
    const trampasLocales = [];
    const geoMancha = new THREE.CircleGeometry(1.4, 20); const matMancha = new THREE.MeshBasicMaterial({ color: 0x111827, transparent: true, opacity: 0.85 });
    const misiles = [];
    const geoMisil = new THREE.ConeGeometry(0.3, 1.1, 10); geoMisil.rotateX(Math.PI / 2);
    const matMisil = new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0x7f1d1d });
    const burbuja = new THREE.Mesh(new THREE.SphereGeometry(RADIO * 1.7, 20, 14), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.28 }));
    scene.add(burbuja);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(RADIO * 1.45, 20, 14), new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.35 }));
    scene.add(halo);
    const chispas = Array.from({ length: 10 }, () => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff })); s.visible = false; scene.add(s); return s; });

    let piloto = null; try { if (new URLSearchParams(window.location.search).has('autopiloto')) piloto = crearBot(c, Math.random, 1); } catch { /* nada */ }
    const st = { piloto, yo, otros, t: 0, camAng: yo.ang, camPos: null, desdeEv: 0, trampas: [], llegue: false, inicioLocal: inicio, ultimoSync: 0, aviso: null, puesto: orden + 1, rebufoT: 0, ruleta: null };
    const ajustar = () => { renderer.setSize(el.clientWidth, el.clientHeight); camera.aspect = el.clientWidth / el.clientHeight; camera.updateProjectionMatrix(); };
    ajustar(); const ro = new ResizeObserver(ajustar); ro.observe(el);
    const avisar = (txt, ms = 1600) => { st.aviso = { txt, hasta: performance.now() + ms }; };
    const todas = () => [{ id: 'yo', k: yo }, ...[...otros.values()].map((x) => ({ id: x.id, k: x.k, x }))];
    const progDe = (e) => (e.id === 'yo' ? (st.llegue ? 2 : yo.prog) : (e.x.llegada ? 2 : e.k.prog));

    // Golpe a alguien (yo, un bot o, online, solo visual)
    const golpearA = (e, dur, quien) => {
      if (e.id === 'yo') {
        const r = golpear(yo, st.t, dur);
        if (r === 'escudo') avisar('🛡️ ¡El escudo te ha salvado!');
        else if (r) { avisar(quien || '💥 ¡Trompo!'); sonar('fallo'); vibrar([60, 40, 60]); }
      } else if (e.x?.bot) golpear(e.k, st.t, dur);
    };
    const lanzarMisil = (desde, objetivo, efecto = true) => {
      const m = new THREE.Mesh(geoMisil, matMisil); m.position.copy(desde.k.body.position); scene.add(m);
      misiles.push({ m, objetivo, efecto, hasta: st.t + 5 });
    };
    // El de justo delante (por progreso)
    const delanteDe = (k) => {
      const mio = k === yo ? (st.llegue ? 2 : yo.prog) : k.prog;
      let mejor = null;
      todas().forEach((e) => { if (e.k === k) return; const p = progDe(e); if (p > mio && p < 2 && (!mejor || p < progDe(mejor))) mejor = e; });
      return mejor;
    };

    const darObjeto = (k, nuevo) => {
      if (nuevo === 'triple') k.usos = 3;
      if (!k.objeto) k.objeto = nuevo; else if (!k.reserva) k.reserva = nuevo;
    };
    const usarObjeto = (k, quien) => {
      const o = k.objeto; if (!o) return; const tt = st.t;
      if (o === 'triple' && k.usos > 1) k.usos -= 1; else { k.objeto = k.reserva || null; k.reserva = null; if (k.objeto === 'triple') k.usos = 3; }
      const yoUso = quien === 'yo';
      if (o === 'turbo' || o === 'triple') k.turboHasta = Math.max(k.turboHasta, tt + (o === 'turbo' ? 2 : 1.3) * (k.def.turbo ? 1.5 : 1));
      if (o === 'escudo') k.escudo = true;
      if (o === 'estrella') k.estrellaHasta = tt + 6;
      if (o === 'muelle') { saltar(k, tt, 13.5); k.turboHasta = Math.max(k.turboHasta, tt + 0.6); }
      if (o === 'aceite') {
        const pos = [k.body.position.x - Math.cos(k.ang) * 2.4, k.body.position.y - RADIO + 0.05, k.body.position.z - Math.sin(k.ang) * 2.4];
        if (sync && yoUso) onObjeto?.('aceite', { pos }); else trampasLocales.push({ id: `l${Math.random()}`, pos, de: quien, hasta: tt + 40 });
      }
      if (o === 'misil') {
        const quienUsa = yoUso ? { id: 'yo', k: yo } : todas().find((e) => e.k === k);
        const obj = delanteDe(k);
        if (!obj) { if (yoUso) avisar('🎯 No hay nadie delante'); }
        else {
          lanzarMisil(quienUsa, obj, !sync || !yoUso || obj.x?.bot);
          if (sync && yoUso && !obj.x?.bot) onObjeto?.('misil', { a: obj.id });
        }
      }
      if (o === 'rayo') {
        if (sync && yoUso) onObjeto?.('rayo', {});
        const mio = k === yo ? yo.prog : k.prog;
        todas().forEach((e) => {
          if (e.k === k || progDe(e) <= mio || progDe(e) >= 2) return;
          if (e.id === 'yo') { const r = golpear(yo, tt, 0.5); if (r === 'escudo') avisar('🛡️ ¡El escudo te salvó del rayo!'); else if (r) { yo.rayoHasta = tt + 3; avisar('⚡ ¡Rayo! Vas más lenta'); vibrar([60, 40, 60]); } }
          else if (e.x?.bot) { if (golpear(e.k, tt, 0.5) === true) e.k.rayoHasta = tt + 3; }
        });
      }
      if (yoUso) { sonar(o === 'rayo' ? 'pulsador' : 'reaccion'); if (o !== 'misil') avisar(`${OBJETOS[o].emoji} ${OBJETOS[o].nombre}`, 1100); }
    };
    acciones.current.objeto = () => { if (!st.ruleta && Date.now() >= st.inicioLocal) usarObjeto(yo, 'yo'); };
    acciones.current.saltar = () => { if (yo.def.salto && st.t > yo.saltoListo && yo.suelo) { saltar(yo, st.t, 9.5); yo.saltoListo = st.t + 3; sonar('toque'); } };

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
          const tirador = otros.get(e.de);
          if (!tirador) return; // es mío
          if (e.tipo === 'rayo' && yo.prog > e.prog && !st.llegue) {
            const res = golpear(yo, st.t, 0.5);
            if (res === 'escudo') avisar('🛡️ ¡El escudo te salvó del rayo!'); else if (res) { yo.rayoHasta = st.t + 3; avisar('⚡ ¡Rayo! Vas más lenta'); vibrar([60, 40, 60]); }
          }
          if (e.tipo === 'misil') {
            const obj = e.a === undefined ? null : (otros.get(e.a) ? { id: e.a, k: otros.get(e.a).k, x: otros.get(e.a) } : { id: 'yo', k: yo });
            if (obj) { lanzarMisil({ id: e.de, k: tirador.k }, obj, obj.id === 'yo'); if (obj.id === 'yo') avisar('🎯 ¡Te persigue un misil!', 1200); }
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
          const e = entrada.current;
          let mando = st.llegue ? { giro: 0, freno: true } : { giro: e.jGiro || e.tGiro, freno: e.jFreno || e.tFreno, derrape: e.bDerrape || e.tDerrape };
          if (st.piloto && !st.llegue) { mando = dirBot(c, yo, st.piloto, hielo); yo.nivelBot = 1; if (yo.objeto && Math.random() < 0.01) usarObjeto(yo, 'yo'); }
          controlar(yo, mando, st.t, DT, hielo);
          // Bots (práctica)
          otros.forEach((x) => {
            if (!x.bot) return;
            if (x.k.terminada) { controlar(x.k, { giro: 0, freno: true }, st.t, DT, hielo); return; }
            controlar(x.k, dirBot(c, x.k, x.bot, hielo), st.t, DT, hielo);
            const ob = x.k.objeto;
            if (ob && !x.k.ruleta && Math.random() < (ob === 'escudo' || ob === 'estrella' ? 0.05 : 0.008)) usarObjeto(x.k, x.id);
          });
        }
        // Rivales online: se interpolan ~150 ms por detrás
        otros.forEach((x) => {
          if (x.bot || !x.buffer.length) return;
          const objetivo = performance.now() - 150; const b = x.buffer;
          let a = b[0]; let z = b[b.length - 1];
          for (let i = 0; i < b.length - 1; i++) if (b[i].t <= objetivo && b[i + 1].t >= objetivo) { a = b[i]; z = b[i + 1]; }
          const u = z.t === a.t ? 1 : Math.max(0, Math.min(1, (objetivo - a.t) / (z.t - a.t)));
          x.k.body.position.set(a.p[0] + (z.p[0] - a.p[0]) * u, a.p[1] + (z.p[1] - a.p[1]) * u, a.p[2] + (z.p[2] - a.p[2]) * u);
          x.k.body.velocity.set(z.v[0], z.v[1], z.v[2]);
        });
        paso(w, DT);
        if (!empezada) continue;
        const ev = revisar(c, yo, cajas, st.t);
        if (ev.caida) { avisar('💨 ¡Te has caído!'); sonar('fallo'); }
        if (ev.turbo) sonar('reaccion');
        if (ev.salto) sonar('toque');
        if (ev.vuelta) { avisar(ev.vuelta === c.vueltas ? '🔔 ¡Última vuelta!' : `🏁 Vuelta ${ev.vuelta}/${c.vueltas}`, 1800); sonar('turno'); }
        if (ev.caja && !st.ruleta) { st.ruleta = { hasta: st.t + 0.9, n: ev.caja }; sonar('acierto'); vibrar(20); }
        if (st.ruleta && st.t >= st.ruleta.hasta) { for (let q = 0; q < st.ruleta.n; q++) darObjeto(yo, sortearObjeto(st.puesto || 1, otros.size + 1)); st.ruleta = null; }
        if (yo.miniTurbo && st.t - yo.miniTurbo.t < 0.05) { sonar('reaccion'); yo.miniTurbo = null; }
        if (ev.meta && !st.llegue) { st.llegue = true; st.miTiempo = st.t * 1000; onLlegada?.(st.miTiempo, st.puesto); sonar('victoria'); }
        otros.forEach((x) => {
          if (!x.bot) return;
          const e2 = revisar(c, x.k, cajas, st.t);
          if (e2.caja) { const pos = 1 + todas().filter((e) => progDe(e) > x.k.prog).length; darObjeto(x.k, sortearObjeto(pos, otros.size + 1)); }
          if (e2.meta && !x.llegada) x.llegada = st.t * 1000;
        });
        // Rebufo: pegado detrás de otra canica un rato → turbo corto
        if (!st.llegue && yo.suelo) {
          const fx = Math.cos(yo.ang); const fz = Math.sin(yo.ang); let detras = false;
          otros.forEach((x) => { const dx = x.k.body.position.x - yo.body.position.x; const dz = x.k.body.position.z - yo.body.position.z; const d = Math.hypot(dx, dz); if (d > 1.5 && d < 9 && (dx * fx + dz * fz) / d > 0.92 && Math.abs(x.k.body.position.y - yo.body.position.y) < 2) detras = true; });
          st.rebufoT = detras ? st.rebufoT + DT : 0;
          if (st.rebufoT > 1.3) { st.rebufoT = 0; yo.turboHasta = Math.max(yo.turboHasta, st.t + 0.9); avisar('💨 ¡Rebufo!', 900); sonar('reaccion'); }
        }
        // Estrella: aparta a quien toques (y te apartan las de los bots)
        otros.forEach((x) => {
          if (!x.bot) return;
          const d = x.k.body.position.distanceTo(yo.body.position);
          if (d < 1.25) { if (st.t < yo.estrellaHasta) golpear(x.k, st.t, 1); else if (st.t < x.k.estrellaHasta) golpearA({ id: 'yo' }, 1, '⭐ ¡Te ha arrollado una estrella!'); }
        });
        // Manchas de aceite (online o de los bots)
        const vivas = [...st.trampas, ...trampasLocales.filter((tr) => tr.hasta > st.t)];
        todas().forEach((e) => {
          if (e.id !== 'yo' && !e.x?.bot) return;
          const p = e.k.body.position;
          vivas.forEach((tr) => {
            if (tr.hasta < 0 || (p.x - tr.pos[0]) ** 2 + (p.z - tr.pos[2]) ** 2 > 2.6 || Math.abs(p.y - tr.pos[1]) > 1.5 || (tr.de === e.id && tr.hasta - st.t > 39)) return;
            if (e.k.def.fantasma || !e.k.suelo) return;
            if (e.id === 'yo') { golpearA(e, 1.1, '🛢️ ¡Aceite!'); if (sync && typeof tr.id === 'number') onObjeto?.('pisada', { trampa: tr.id }); } else golpear(e.k, st.t, 1.1);
            tr.hasta = -1; const i = trampasLocales.indexOf(tr); if (i >= 0) trampasLocales.splice(i, 1); st.trampas = st.trampas.filter((x2) => x2 !== tr);
          });
        });
        // Misiles: persiguen a su objetivo
        for (let i = misiles.length - 1; i >= 0; i--) {
          const ms = misiles[i]; const obj = ms.objetivo.k.body.position;
          const dir = new THREE.Vector3(obj.x - ms.m.position.x, obj.y + 0.3 - ms.m.position.y, obj.z - ms.m.position.z);
          const d = dir.length();
          if (d < 1.1 || st.t > ms.hasta) {
            if (ms.efecto) golpearA(ms.objetivo, 1.3, '🎯 ¡Misil!');
            scene.remove(ms.m); misiles.splice(i, 1); continue;
          }
          ms.m.position.addScaledVector(dir.normalize(), Math.min(d, 42 * DT)); ms.m.lookAt(obj.x, obj.y, obj.z);
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
      burbuja.visible = yo.escudo; burbuja.position.copy(mallaYo.position);
      halo.visible = st.t < yo.estrellaHasta; halo.position.copy(mallaYo.position); halo.material.color.setHSL((ahora / 400) % 1, 0.9, 0.6);
      cajas.forEach((cj, i) => { mallasCaja[i].visible = cj.hasta <= st.t; mallasCaja[i].rotation.y = ahora / 600; mallasCaja[i].position.y = cj.p.y + Math.sin(ahora / 400 + i) * 0.15; });
      const todasT = [...st.trampas, ...trampasLocales];
      const vivasT = new Set();
      todasT.forEach((tr) => { const key = String(tr.id); vivasT.add(key); if (!mallasTrampa.has(key)) { const m = new THREE.Mesh(geoMancha, matMancha); m.rotation.x = -Math.PI / 2; m.position.set(tr.pos[0], tr.pos[1] + 0.04, tr.pos[2]); scene.add(m); mallasTrampa.set(key, m); } });
      mallasTrampa.forEach((m, key) => { if (!vivasT.has(key)) { scene.remove(m); mallasTrampa.delete(key); } });
      // Chispas del derrape (color según la carga)
      const nivel = yo.derrape ? CARGAS.filter((x) => yo.derrape.carga >= x).length : 0;
      chispas.forEach((s, i) => {
        s.visible = Boolean(yo.derrape) && nivel > 0;
        if (!s.visible) return;
        s.material.color.set(COLOR_CARGA[nivel]);
        const a = yo.ang + Math.PI + (Math.random() - 0.5) * 1.2; const r = 0.5 + Math.random() * 0.4;
        s.position.set(pY.x + Math.cos(a) * r, pY.y - 0.35 + Math.random() * 0.3, pY.z + Math.sin(a) * r);
        s.scale.setScalar(0.6 + nivel * 0.4 + Math.random() * 0.5 + i * 0);
      });
      // Cámara de persecución detrás del rumbo (sin seguir el giro de los trompos)
      if (st.t >= yo.golpeHasta) { const dif = Math.atan2(Math.sin(yo.ang - st.camAng), Math.cos(yo.ang - st.camAng)); st.camAng += dif * Math.min(1, 6 * DT * 1.4); }
      const fx = Math.cos(st.camAng); const fz = Math.sin(st.camAng);
      const objetivoCam = new THREE.Vector3(pY.x - fx * 7.2, pY.y + 3.6, pY.z - fz * 7.2);
      if (!st.camPos) st.camPos = objetivoCam.clone();
      st.camPos.lerp(objetivoCam, 0.18);
      camera.position.copy(st.camPos); camera.lookAt(pY.x + fx * 6, pY.y + 0.4, pY.z + fz * 6);
      const vh = Math.hypot(yo.body.velocity.x, yo.body.velocity.z);
      const fov = 62 + Math.min(14, vh * 0.35) + (st.t < yo.turboHasta ? 6 : 0);
      if (Math.abs(camera.fov - fov) > 0.3) { camera.fov += (fov - camera.fov) * 0.1; camera.updateProjectionMatrix(); }
      sol.position.set(pY.x + 10, pY.y + 25, pY.z + 8); sol.target.position.set(pY.x, pY.y, pY.z);
      renderer.render(scene, camera);
      // Marcador (unas 6 veces por segundo)
      if (!st.ultHud || ahora - st.ultHud > 150) {
        st.ultHud = ahora;
        const mapa = [{ id: 'yo', x: pY.x, z: pY.z, color: '#facc15', yo: true }, ...[...otros.values()].map((x) => ({ id: x.id, x: x.k.body.position.x, z: x.k.body.position.z, color: colorDe ? colorDe(x.id) : '#94a3b8' }))];
        setHud({
          puesto: st.puesto, total: otros.size + 1, prog: Math.min(1, yo.prog), t: empezada ? st.t * 1000 : 0, cuenta: empezada ? 0 : Math.ceil((st.inicioLocal - Date.now()) / 1000),
          objeto: yo.objeto, usos: yo.objeto === 'triple' ? yo.usos : 0, reserva: yo.reserva, ruleta: st.ruleta ? IDS_OBJETOS[Math.floor(ahora / 90) % IDS_OBJETOS.length] : null,
          escudo: yo.escudo, aviso: st.aviso && st.aviso.hasta > ahora ? st.aviso.txt : null, meta: st.llegue ? st.miTiempo : null, mapa,
          salto: yo.def.salto ? st.t > yo.saltoListo : null, rayo: st.t < yo.rayoHasta, turbo: st.t < yo.turboHasta, estrella: st.t < yo.estrellaHasta,
          vuelta: Math.min(c.vueltas, yo.vuelta + 1), carga: nivel, velocidad: Math.round(vh * 3.6)
        });
      }
    };
    raf = requestAnimationFrame(bucle);
    st.fijarInicio = (v) => { st.inicioLocal = v; };
    acciones.current.st = st;
    return () => { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); el.removeChild(renderer.domElement); acciones.current = {}; };
  }, [c]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { acciones.current.st?.fijarInicio(inicio); }, [inicio]);

  const derrape = (v) => () => { entrada.current.bDerrape = v; };
  const objeto = hud.ruleta || hud.objeto;
  return (
    <div className="cn-caja">
      <div ref={caja} className="cn-escena" />
      <div className="cn-arriba">
        <span className="cn-puesto">{hud.puesto}.º<small>/{hud.total || 1}</small></span>
        <span className="cn-vuelta">Vuelta {hud.vuelta}/{c.vueltas}</span>
        <span className="cn-tiempo">{fmt(hud.t)}</span>
      </div>
      <div className="cn-progreso"><i style={{ width: `${hud.prog * 100}%` }} /><b>{hud.velocidad || 0} km/h</b></div>
      {hud.mapa && <Minimapa c={c} puntos={hud.mapa} />}
      {hud.cuenta > 0 && <div className="cn-cuenta" key={hud.cuenta}>{hud.cuenta}</div>}
      {hud.cuenta === 0 && hud.t > 0 && hud.t < 900 && <div className="cn-cuenta ya">¡YA!</div>}
      {hud.aviso && <div className="cn-aviso">{hud.aviso}</div>}
      {(hud.rayo || hud.turbo || hud.escudo || hud.estrella) && <div className="cn-estados">{hud.turbo && '🔥'}{hud.rayo && '⚡'}{hud.escudo && '🛡️'}{hud.estrella && '⭐'}</div>}
      {hud.meta != null && <div className="cn-meta">🏁 ¡META! {hud.puesto}.º · {fmt(hud.meta)}</div>}
      <div className="cn-mandos">
        <ZonaJoystick entrada={entrada} />
        <div className="cn-botones">
          <button type="button" className={`cn-objeto${objeto ? ' lleno' : ''}${hud.ruleta ? ' ruleta' : ''}`} disabled={!hud.objeto || Boolean(hud.ruleta)} onClick={() => acciones.current.objeto?.()} aria-label={hud.objeto ? `Usar ${OBJETOS[hud.objeto].nombre}` : 'Sin objeto'}>
            {objeto ? OBJETOS[objeto].emoji : '·'}{hud.usos > 1 && <sup>×{hud.usos}</sup>}{hud.reserva && <small>{OBJETOS[hud.reserva].emoji}</small>}
          </button>
          <div className="cn-fila">
            {hud.salto !== null && <button type="button" className="cn-salto" disabled={!hud.salto} onClick={() => acciones.current.saltar?.()}>⤴</button>}
            <button type="button" className={`cn-derrape carga-${hud.carga || 0}`} onPointerDown={(e) => { try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* nada */ } entrada.current.bDerrape = true; }} onPointerUp={derrape(false)} onPointerCancel={derrape(false)} onContextMenu={(e) => e.preventDefault()}>
              DERRAPE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
