// Minijuegos (4/6): corte perfecto, círculo perfecto, del 1 al 16, frena al límite y petanca.
import React, { useRef, useState } from 'react';
import { useEscena, rng, crea, tocado, enSuelo, THREE, mat } from '../tres.js';
import { Hud, Mensaje, Botones, Boton } from '../comun.jsx';
import { sonar, vibrar } from '../../../lib/sonido.js';

/* ───────── Corte perfecto ───────── */
function texturaCorteza() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 256; const x = c.getContext('2d');
  x.fillStyle = '#7c4a1e'; x.fillRect(0, 0, 128, 256);
  for (let i = 0; i < 40; i++) { x.strokeStyle = i % 2 ? '#5b3412' : '#9a6234'; x.lineWidth = 2 + (i % 3); x.beginPath(); const xx = (i * 37) % 128; x.moveTo(xx, 0); x.bezierCurveTo(xx + 8, 80, xx - 8, 170, xx + 4, 256); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function texturaAnillos() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128; const x = c.getContext('2d');
  x.fillStyle = '#e7c08b'; x.fillRect(0, 0, 128, 128);
  for (let r = 60; r > 4; r -= 7) { x.strokeStyle = r % 14 ? '#c98f4f' : '#b4783c'; x.lineWidth = 2; x.beginPath(); x.arc(64, 64, r, 0, Math.PI * 2); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function Corte({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ ronda: 1, media: null }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene } = ctx; const r = rng(semilla);
    const mesa = crea.caja(15, 0.5, 4, 0x92400e, { roughness: 0.7 }); mesa.position.y = -0.75; scene.add(mesa);
    const suelo = crea.suelo(40, 30, 0x44403c, { celda: 1 }); suelo.position.y = -3; scene.add(suelo);
    [-6.5, 6.5].forEach((x) => { const pata = crea.caja(0.4, 2.4, 3.4, 0x78350f); pata.position.set(x, -2, 0); scene.add(pata); });
    const corteza = texturaCorteza(); const anillos = texturaAnillos();
    const matTronco = [new THREE.MeshStandardMaterial({ map: corteza, roughness: 0.9 }), new THREE.MeshStandardMaterial({ map: anillos, roughness: 0.8 }), new THREE.MeshStandardMaterial({ map: anillos, roughness: 0.8 })];
    const tronco = (L) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, L, 28), matTronco); m.rotation.z = Math.PI / 2; m.castShadow = true; m.receiveShadow = true; return m; };
    // Sierra circular con dientes
    const sierra = new THREE.Group();
    const hoja = new THREE.Group(); const disco = crea.cilindro(0.9, 0.9, 0.05, 0xd1d5db, 40, { metalness: 0.95, roughness: 0.2 }); disco.rotation.x = Math.PI / 2; hoja.add(disco);
    for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2; const d = crea.caja(0.12, 0.16, 0.05, 0x9ca3af, { metalness: 0.95, roughness: 0.2 }); d.position.set(Math.cos(a) * 0.95, Math.sin(a) * 0.95, 0); d.rotation.z = a; hoja.add(d); }
    const eje = crea.cilindro(0.18, 0.18, 0.2, 0xef4444); eje.rotation.x = Math.PI / 2; hoja.add(eje); sierra.add(hoja);
    const carcasa = crea.caja(2.2, 0.5, 0.5, 0xf59e0b); carcasa.position.set(0, 0.95, 0); sierra.add(carcasa);
    const laser = new THREE.Mesh(new THREE.BoxGeometry(0.02, 2.4, 0.02), new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.7 })); laser.position.y = -1.1; sierra.add(laser);
    scene.add(sierra);
    const st = { ronda: 0, errores: [], fase: 'corta', x: 0, dir: 1, vel: 3, tronco: null, L: 4, c: 0, piezas: [], fin: false };
    const nuevo = () => {
      st.piezas.forEach((p) => scene.remove(p)); st.piezas = []; if (st.tronco) scene.remove(st.tronco);
      st.L = r.entre(3, 6); st.c = r.entre(-1, 1);
      st.tronco = tronco(st.L); st.tronco.position.set(st.c, 0, 0); scene.add(st.tronco);
      st.x = st.c - st.L / 2; st.dir = 1; st.vel = 2.6 + st.ronda * 0.32; st.fase = 'corta';
    };
    nuevo();
    ctx.encuadrar({ centro: [0, 0.5, 0], ancho: 8, alto: 4.4, desde: [0, 0.35, 1] });
    return {
      toque() {
        if (st.fase !== 'corta' || st.fin) return;
        const err = (Math.abs(st.x - st.c) / st.L) * 100; st.errores.push(err); st.fase = 'pausa';
        sonar(err < 2 ? 'victoria' : 'carta');
        ctx.chispas(new THREE.Vector3(st.x, 0.4, 0.3), 0xfde68a, 30, { fuerza: 3.5, tam: 0.06 });
        const izq = st.x - (st.c - st.L / 2); const der = st.c + st.L / 2 - st.x;
        scene.remove(st.tronco); st.tronco = null;
        [[izq, st.c - st.L / 2 + izq / 2, -1], [der, st.x + der / 2, 1]].forEach(([l, cx, s]) => { if (l <= 0.01) return; const p = tronco(l); p.position.set(cx, 0, 0); p.userData.s = s; scene.add(p); st.piezas.push(p); });
        setMsg(err < 1 ? '🎯 ¡Perfecto!' : `${err.toFixed(1)} % desviado`);
        const media = st.errores.reduce((a, b) => a + b, 0) / st.errores.length; setHud({ ronda: Math.min(10, st.errores.length + 1), media });
        setTimeout(() => { setMsg(null); st.ronda++; if (st.ronda >= 10) { st.fin = true; alTerminar(Math.round(media * 10) / 10); } else nuevo(); }, 1300);
      },
      frame(dt) {
        if (st.fase === 'corta') { st.x += st.dir * st.vel * dt; const a = st.c - st.L / 2; const b = st.c + st.L / 2; if (st.x > b) { st.x = b; st.dir = -1; } if (st.x < a) { st.x = a; st.dir = 1; } }
        sierra.position.set(st.x, 1.6, 0); hoja.rotation.z -= dt * 20;
        st.piezas.forEach((p) => { p.position.x += p.userData.s * dt * 1.5; p.rotation.x += p.userData.s * dt * 0.6; });
      }
    };
  }, { cielo: [0x57534e, 0x1c1917], niebla: 40 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🪚 Tronco ${hud.ronda}/10`} der={hud.media != null ? `Desvío medio ${hud.media.toFixed(1)} %` : 'Corta justo por la mitad'} /><Mensaje texto={msg} /></div>;
}

/* ───────── Círculo perfecto ───────── */
function Circulo({ alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ intento: 1, mejor: null }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene } = ctx;
    const pizarra = crea.caja(11, 0.3, 11, 0x0f3d2e, { roughness: 0.95 }); pizarra.position.y = -0.15; scene.add(pizarra);
    const marcoP = crea.caja(11.8, 0.4, 11.8, 0x92400e, { roughness: 0.6 }); marcoP.position.y = -0.3; scene.add(marcoP);
    const centro = crea.cilindro(0.09, 0.09, 0.04, 0xffffff); centro.position.y = 0.02; scene.add(centro);
    const st = { pts: [], dibujando: false, intento: 0, mejor: 0, fin: false };
    const tiza = new THREE.MeshStandardMaterial({ color: 0xfefce8, roughness: 0.9, emissive: 0xfefce8, emissiveIntensity: 0.15 });
    const tubo = { m: null }; let ideal = null;
    const pinta = () => {
      if (tubo.m) { scene.remove(tubo.m); tubo.m.geometry.dispose(); tubo.m = null; }
      if (st.pts.length > 3) { const curva = new THREE.CatmullRomCurve3(st.pts.map((p) => new THREE.Vector3(p.x, 0.06, p.z))); tubo.m = new THREE.Mesh(new THREE.TubeGeometry(curva, st.pts.length * 2, 0.09, 6), tiza); scene.add(tubo.m); }
    };
    const evaluar = () => {
      const p = st.pts; if (p.length < 12) return { v: 0 };
      const cx = p.reduce((a, q) => a + q.x, 0) / p.length; const cz = p.reduce((a, q) => a + q.z, 0) / p.length;
      const rs = p.map((q) => Math.hypot(q.x - cx, q.z - cz)); const R = rs.reduce((a, b) => a + b, 0) / rs.length;
      if (R < 0.8) return { v: 0 };
      const desv = Math.sqrt(rs.reduce((a, b) => a + (b - R) ** 2, 0) / rs.length) / R;
      let giro = 0; for (let i = 1; i < p.length; i++) { let d = Math.atan2(p[i].z - cz, p[i].x - cx) - Math.atan2(p[i - 1].z - cz, p[i - 1].x - cx); if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; giro += d; }
      const cobertura = Math.min(1, Math.abs(giro) / (2 * Math.PI));
      const cierre = Math.hypot(p[0].x - p.at(-1).x, p[0].z - p.at(-1).z) / R;
      return { v: Math.max(0, Math.round((100 - desv * 260) * cobertura * Math.max(0.6, 1 - Math.max(0, cierre - 0.3) * 0.4) * 10) / 10), cx, cz, R };
    };
    ctx.encuadrar({ centro: [0, 0, 0], ancho: 11.2, alto: 11.2, desde: [0, 1, 0.001], margen: 1.02 });
    return {
      toque(e) { if (st.fin) return; if (ideal) { scene.remove(ideal); ideal = null; } st.pts = []; st.dibujando = true; const p = enSuelo(ctx, e, 0); if (p) st.pts.push(p); },
      mover(e) { if (!st.dibujando) return; const p = enSuelo(ctx, e, 0); if (p && (!st.pts.length || p.distanceTo(st.pts.at(-1)) > 0.08)) { st.pts.push(p); if (st.pts.length % 3 === 0) pinta(); } },
      soltar() {
        if (!st.dibujando || st.fin) return; st.dibujando = false; pinta();
        const { v, cx, cz, R } = evaluar(); st.intento++; st.mejor = Math.max(st.mejor, v);
        if (v) {
          ideal = new THREE.Mesh(new THREE.RingGeometry(R - 0.04, R + 0.04, 96), new THREE.MeshBasicMaterial({ color: v > 90 ? 0x4ade80 : 0xfacc15, transparent: true, opacity: 0.85, side: THREE.DoubleSide })); ideal.rotation.x = -Math.PI / 2; ideal.position.set(cx, 0.03, cz); scene.add(ideal);
          if (v > 90) ctx.chispas(new THREE.Vector3(cx, 0.3, cz), 0x4ade80, 36, { fuerza: 5 });
        }
        setMsg(v ? `⭕ ${v.toFixed(1)} % redondo` : 'Eso no es un círculo 😅'); sonar(v > 90 ? 'victoria' : 'acierto');
        setHud({ intento: Math.min(5, st.intento + 1), mejor: st.mejor });
        if (st.intento >= 5) { st.fin = true; setTimeout(() => alTerminar(st.mejor), 1300); }
      }
    };
  }, { cielo: [0x334155, 0x0f172a], niebla: false });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`⭕ Intento ${hud.intento}/5`} der={hud.mejor != null ? `Mejor: ${hud.mejor.toFixed(1)} %` : 'Dibuja un círculo con el dedo'} /><Mensaje texto={msg} /></div>;
}

/* ───────── Del 1 al 16 ───────── */
function Numeros({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ sig: 1, t: 0 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene } = ctx; const r = rng(semilla);
    const base = crea.caja(7.6, 0.3, 7.6, 0x0c4a6e, { roughness: 0.4, metalness: 0.3 }); base.position.y = -0.35; scene.add(base);
    const borde = crea.marco(7.4, 7.4, 0x38bdf8, { intensidad: 1 }); borde.position.y = -0.18; scene.add(borde);
    const COL = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b'];
    const orden = r.barajar(Array.from({ length: 16 }, (_, i) => i + 1));
    const fichas = orden.map((n, i) => {
      const g = new THREE.Group(); const b = crea.caja(1.55, 0.42, 1.55, 0xf8fafc, { roughness: 0.25 }); g.add(b);
      const c = crea.cartel(String(n), 1.35, 1.35, { fondo: '#ffffff', color: COL[n % 4], fuente: 'bold 140px sans-serif', radio: 30 }); c.rotation.x = -Math.PI / 2; c.position.y = 0.22; g.add(c);
      g.position.set((i % 4 - 1.5) * 1.75, 0, (Math.floor(i / 4) - 1.5) * 1.75); g.rotation.y = r.entre(-0.2, 0.2); scene.add(g);
      return { g, n, hecha: false, temblor: 0, base: b };
    });
    const verde = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.3, emissive: 0x166534, emissiveIntensity: 0.4 });
    const st = { sig: 1, t: 0, pen: 0, fin: false };
    ctx.encuadrar({ centro: [0, 0, 0.1], ancho: 7.6, alto: 7.6, desde: [0, 1, 0.34] });
    return {
      toque(e) {
        if (st.fin) return;
        const t = tocado(ctx, e, fichas.filter((f) => !f.hecha).map((f) => f.g)); if (!t) return;
        const f = fichas.find((x) => x.g === t.obj);
        if (f.n === st.sig) {
          f.hecha = true; f.base.material = verde; st.sig++; sonar('tic', { minimo: 0 }); setHud({ sig: st.sig, t: st.t });
          ctx.chispas(f.g.position.clone().setY(0.5), 0x4ade80, 12, { fuerza: 3 });
          if (st.sig > 16) { st.fin = true; sonar('victoria'); ctx.chispas(new THREE.Vector3(0, 1, 0), 0xfacc15, 50, { fuerza: 6 }); alTerminar(Math.round((st.t + st.pen) * 10) / 10); }
        } else { st.pen += 1; f.temblor = 0.4; sonar('fallo'); ctx.temblor(0.15); setMsg('+1 s'); setTimeout(() => setMsg(null), 400); }
      },
      frame(dt) {
        if (!st.fin) st.t += dt;
        fichas.forEach((f) => { if (f.hecha) f.g.position.y = Math.max(-0.28, f.g.position.y - dt * 3); if (f.temblor > 0) { f.temblor -= dt; f.g.rotation.y += Math.sin(f.temblor * 60) * 0.04; } });
        if (!st.fin && st.t >= 60) { st.fin = true; alTerminar(60 + (17 - st.sig) * 2); }
        setHud((h) => (Math.floor(h.t) !== Math.floor(st.t) ? { sig: st.sig, t: st.t } : h));
      }
    };
  }, { cielo: [0x075985, 0x020617], niebla: false });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🔢 Busca el ${Math.min(16, hud.sig)}`} der={`⏱️ ${Math.floor(hud.t)} s`} /><Mensaje texto={msg} tipo="mal" /></div>;
}

/* ───────── Frena al límite ───────── */
function deportivo() {
  const g = new THREE.Group();
  const cuerpo = crea.caja(1.7, 0.5, 3, 0xdc2626, { metalness: 0.4, roughness: 0.25 }); cuerpo.position.y = 0.45; g.add(cuerpo);
  const cabina = crea.caja(1.4, 0.45, 1.4, 0x0f172a, { metalness: 0.6, roughness: 0.05 }); cabina.position.set(0, 0.92, 0.25); g.add(cabina);
  const aleron = crea.caja(1.7, 0.08, 0.35, 0x111827); aleron.position.set(0, 0.95, 1.35); g.add(aleron);
  [[-0.86, -0.95], [0.86, -0.95], [-0.86, 0.95], [0.86, 0.95]].forEach(([x, z]) => { const r = crea.cilindro(0.3, 0.3, 0.24, 0x111827, 20); r.rotation.z = Math.PI / 2; r.position.set(x, 0.3, z); g.add(r); const llanta = crea.cilindro(0.16, 0.16, 0.25, 0xd1d5db, 12, { metalness: 0.9, roughness: 0.2 }); llanta.rotation.z = Math.PI / 2; llanta.position.set(x * 1.01, 0.3, z); g.add(llanta); });
  const luces = [-0.55, 0.55].map((x) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.05), new THREE.MeshStandardMaterial({ color: 0x7f1d1d, emissive: 0xef4444, emissiveIntensity: 0.2 })); l.position.set(x, 0.55, 1.52); g.add(l); return l; });
  g.userData.luces = luces;
  return g;
}
function Frenada({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ intento: 1, total: 0 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla); const LINEA = -40;
    const carretera = crea.caja(6, 0.2, 70, 0x1f2937, { roughness: 0.9 }); carretera.position.set(0, -0.1, -20); scene.add(carretera);
    const arcen = crea.suelo(60, 80, 0x65a30d, { celda: 2, contraste: 0.04, lineas: false }); arcen.position.set(0, -0.2, -20); scene.add(arcen);
    for (let z = 4; z > -45; z -= 4) { const raya = crea.caja(0.15, 0.02, 2, 0xfef9c3); raya.position.set(0, 0.01, z); scene.add(raya); }
    [-2.9, 2.9].forEach((x) => { const b = crea.caja(0.1, 0.02, 70, 0xffffff); b.position.set(x, 0.01, -20); scene.add(b); });
    for (let z = 0; z > -40; z -= 10) [-3.6, 3.6].forEach((x) => { const cartel = crea.texto(`${-z} m`, { tam: 0.5, fondo: '#facc15', color: '#0f172a' }); cartel.position.set(x, 0.6, z); scene.add(cartel); });
    // Línea de meta a cuadros y muro con franjas
    for (let i = 0; i < 12; i++) for (let j = 0; j < 2; j++) { const c = crea.caja(0.5, 0.025, 0.2, (i + j) % 2 ? 0xffffff : 0x0f172a); c.position.set(-2.75 + i * 0.5, 0.015, LINEA + 0.1 - j * 0.2); scene.add(c); }
    const muro = new THREE.Group(); for (let i = 0; i < 8; i++) { const b = crea.caja(0.8, 1.6, 1, i % 2 ? 0xfacc15 : 0x111827); b.position.set(-2.8 + i * 0.8, 0.8, 0); muro.add(b); } muro.position.z = LINEA - 2.5; scene.add(muro);
    for (let i = 0; i < 16; i++) { const a = crea.esfera(r.entre(0.6, 1.2), r.de([0x15803d, 0x166534, 0x22c55e])); a.position.set(r.de([-1, 1]) * r.entre(5, 9), 0.6, r.entre(-45, 5)); scene.add(a); }
    const coche = deportivo(); scene.add(coche);
    const marcas = [];
    const velocidades = [r.entre(12, 14), r.entre(14, 16), r.entre(15, 17), r.entre(17, 19), r.entre(19, 21), r.entre(20, 23)];
    const MURO = LINEA - 2.0; // cara del muro
    const st = { i: 0, z: 0, v: 0, frenando: false, fase: 'corre', res: [], fin: false, marca: 0 };
    const empezar = () => { st.z = 0; st.v = velocidades[st.i]; st.frenando = false; st.fase = 'corre'; coche.rotation.y = 0; marcas.forEach((m) => scene.remove(m)); marcas.length = 0; coche.userData.luces.forEach((l) => { l.material.emissiveIntensity = 0.2; }); };
    empezar();
    return {
      toque() { if (st.fase === 'corre' && !st.fin && !st.frenando) { st.frenando = true; sonar('toque', { minimo: 0 }); coche.userData.luces.forEach((l) => { l.material.emissiveIntensity = 3; }); } },
      frame(dt) {
        if (st.fase === 'corre') {
          if (st.frenando) {
            st.v = Math.max(0, st.v - 11 * dt); st.marca -= dt;
            if (st.marca <= 0 && st.v > 0) { st.marca = 0.03; [-0.86, 0.86].forEach((x) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.5), new THREE.MeshBasicMaterial({ color: 0x0a0a0a, transparent: true, opacity: 0.6 })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.012, st.z + 1); scene.add(m); marcas.push(m); }); }
          }
          st.z -= st.v * dt; const frente = st.z - 1.5;
          // Pasarse de la línea castiga: 10 m más lo que te pases; si llegas al muro, choque y 20 m
          if (frente <= MURO) { st.z = MURO + 1.5; st.fase = 'fin'; coche.rotation.y = 0.5; vibrar(250); sonar('fallo'); ctx.temblor(0.8); ctx.chispas(new THREE.Vector3(0, 0.8, MURO), 0xfacc15, 50, { fuerza: 6 }); st.res.push(2000); setMsg('💥 ¡Contra el muro! +20 m'); siguiente(); }
          else if (st.v === 0 && frente < LINEA) { st.fase = 'fin'; const pasado = Math.round((LINEA - frente) * 100); vibrar(120); sonar('fallo'); ctx.temblor(0.3); st.res.push(1000 + pasado); setMsg(`🚫 Te pasaste ${pasado} cm: +10 m`); siguiente(); }
          else if (st.v === 0) { st.fase = 'fin'; const cm = Math.round((frente - LINEA) * 100); st.res.push(cm); sonar(cm < 50 ? 'victoria' : 'acierto'); if (cm < 50) ctx.chispas(new THREE.Vector3(0, 0.5, LINEA), 0x4ade80, 30); setMsg(cm < 20 ? `🎯 ¡A ${cm} cm!` : `A ${cm} cm de la línea`); siguiente(); }
          coche.position.z = st.z; coche.position.y = st.frenando && st.v > 0 ? -0.03 : 0; coche.rotation.x = st.frenando && st.v > 0 ? 0.03 : 0;
        }
        const k = ctx.ancho(0.9);
        camera.position.set(2.6 * k, 2.6 + k, st.z + 6.5 * k); camera.lookAt(0, 0.4, st.z - 9);
        ctx.seguirSol(0, st.z);
      }
    };
    function siguiente() {
      setHud({ intento: Math.min(6, st.res.length + 1), total: st.res.reduce((a, b) => a + b, 0) });
      setTimeout(() => { setMsg(null); st.i++; if (st.i >= 6) { st.fin = true; alTerminar(st.res.reduce((a, b) => a + b, 0)); } else empezar(); }, 1500);
    }
  }, { cielo: [0x60a5fa, 0xfef3c7], niebla: 70 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🚗 Intento ${hud.intento}/6`} der={`Total ${(hud.total / 100).toFixed(2).replace('.', ',')} m`} /><Mensaje texto={msg} /><p className="hb-pista">Toca para frenar: para lo más cerca posible de la línea de cuadros</p></div>;
}

/* ───────── Petanca ───────── */
function Petanca({ semilla, alTerminar }) {
  const ref = useRef(null); const ctl = useRef({}); const [hud, setHud] = useState({ quedan: 4, mejor: null }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla);
    const pista = crea.suelo(7, 18, 0xd6c49b, { celda: 0.4, contraste: 0.03, lineas: false }); pista.position.set(0, 0, -5); scene.add(pista);
    const cesped = crea.suelo(40, 50, 0x4d7c0f, { celda: 2, contraste: 0.04, lineas: false }); cesped.position.set(0, -0.02, -5); scene.add(cesped);
    [-3.6, 3.6].forEach((x) => { const b = crea.caja(0.2, 0.4, 18.4, 0x92400e); b.position.set(x, 0.1, -5); scene.add(b); });
    const fondo = crea.caja(7.4, 0.4, 0.2, 0x92400e); fondo.position.set(0, 0.1, -14.1); scene.add(fondo);
    for (let i = 0; i < 10; i++) { const a = crea.esfera(r.entre(0.8, 1.4), r.de([0x15803d, 0x166534])); a.position.set(r.de([-1, 1]) * r.entre(5, 9), 0.6, r.entre(-16, 2)); scene.add(a); }
    const boliche = crea.esfera(0.18, 0xfacc15, { roughness: 0.3, emissive: 0xf59e0b, emissiveIntensity: 0.6 }); boliche.position.set(r.entre(-1.6, 1.6), 0.18, -r.entre(7, 11)); scene.add(boliche);
    const anilloB = new THREE.Mesh(new THREE.RingGeometry(0.25, 0.32, 32), new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.7, side: THREE.DoubleSide })); anilloB.rotation.x = -Math.PI / 2; anilloB.position.set(boliche.position.x, 0.01, boliche.position.z); scene.add(anilloB);
    const flecha = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.6, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })); flecha.rotation.x = -Math.PI / 2; flecha.visible = false; scene.add(flecha);
    const st = { bolas: [], actual: null, ini: null, quedan: 4, mejor: Infinity, fin: false, salida: 0 };
    const nueva = () => { const b = crea.esfera(0.32, 0x94a3b8, { metalness: 0.95, roughness: 0.18 }); b.position.set(st.salida, 0.32, 3); scene.add(b); st.actual = { m: b, v: new THREE.Vector3(), mueve: false }; };
    // Desde dónde se lanza: ◀ ▶ (o las flechas del teclado) mueven la bola por la línea de tiro antes de lanzar
    ctl.current.lado = (d) => { const a = st.actual; if (!a || a.mueve || st.fin) return; st.salida = Math.max(-2.6, Math.min(2.6, st.salida + d * 0.4)); a.m.position.x = st.salida; sonar('tic', { minimo: 0, vibrar: false }); };
    const tecla = (e) => { if (e.key === 'ArrowLeft') ctl.current.lado(-1); if (e.key === 'ArrowRight') ctl.current.lado(1); };
    window.addEventListener('keydown', tecla);
    nueva();
    return {
      fin: () => window.removeEventListener('keydown', tecla),
      toque(e) { if (st.actual && !st.actual.mueve && !st.fin) st.ini = [e.clientX, e.clientY]; },
      mover(e) {
        if (!st.ini || !st.actual || st.actual.mueve) return; const dx = e.clientX - st.ini[0]; const dy = st.ini[1] - e.clientY;
        if (dy < 15) { flecha.visible = false; return; }
        const p = Math.min(1.4, Math.hypot(dx, dy) / 250); const ang = Math.atan2(dx * 0.6, dy);
        flecha.visible = true; flecha.position.set(st.salida + Math.sin(ang) * (0.8 + p), 0.05, 3 - Math.cos(ang) * (0.8 + p)); flecha.rotation.set(-Math.PI / 2, 0, -ang); flecha.scale.set(1, 1 + p, 1);
      },
      soltar(e) {
        flecha.visible = false;
        if (!st.ini || !st.actual || st.actual.mueve) return; const dx = e.clientX - st.ini[0]; const dy = st.ini[1] - e.clientY; st.ini = null;
        if (dy < 20) return; const p = Math.min(1.4, Math.hypot(dx, dy) / 250); const v = 11 * p;
        st.actual.v.set((dx / Math.hypot(dx, dy)) * v * 0.6, 0, -v); st.actual.mueve = true; sonar('toque', { minimo: 0 });
      },
      frame(dt) {
        const k = ctx.ancho(0.85);
        camera.position.set(0, 4.5 * Math.sqrt(k), 7 * k); camera.lookAt(0, 0, -4.5);
        const a = st.actual; if (!a || !a.mueve) return;
        const vel = a.v.length(); const nv = Math.max(0, vel - 4.5 * dt);
        if (vel > 0) a.v.multiplyScalar(nv / vel);
        a.m.position.addScaledVector(a.v, dt); a.m.rotation.x -= a.v.z * dt * 3;
        st.bolas.forEach((b) => { const d = b.m.position.distanceTo(a.m.position); if (d < 0.64 && d > 0) { const n = a.m.position.clone().sub(b.m.position).setY(0).normalize(); const vn = a.v.dot(n); if (vn < 0) { a.v.addScaledVector(n, -vn * 1.6); sonar('tic', { minimo: 0, vibrar: false }); } } });
        if (Math.abs(a.m.position.x) > 3.2) { a.v.x *= -0.5; a.m.position.x = Math.sign(a.m.position.x) * 3.2; }
        if (nv === 0 || a.m.position.z < -13.8) {
          a.mueve = false; const fuera = a.m.position.z < -13.8; const d = Math.round(Math.hypot(a.m.position.x - boliche.position.x, a.m.position.z - boliche.position.z) * 100);
          st.mejor = Math.min(st.mejor, fuera ? 9999 : d); st.quedan--; st.bolas.push(a);
          if (!fuera && d < 40) { ctx.chispas(a.m.position.clone().setY(0.4), 0xfacc15, 24); ctx.onda(new THREE.Vector3(boliche.position.x, 0.02, boliche.position.z), 0xfacc15); }
          setMsg(fuera ? 'Fuera de la pista' : `A ${d} cm del boliche`); sonar(d < 30 ? 'victoria' : 'carta');
          setHud({ quedan: st.quedan, mejor: st.mejor });
          setTimeout(() => { setMsg(null); if (st.quedan <= 0) { st.fin = true; alTerminar(Math.min(1000, st.mejor)); } else nueva(); }, 1100);
          st.actual = null;
        }
      }
    };
  }, { cielo: [0x7dd3fc, 0xfef9c3], niebla: 50 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🟡 Quedan ${hud.quedan} bolas`} der={hud.mejor != null && hud.mejor < 9999 ? `Mejor: ${hud.mejor} cm` : 'Acércate al boliche'} /><Mensaje texto={msg} /><p className="hb-pista" style={{ bottom: '5rem' }}>◀ ▶ elige el sitio · desliza hacia arriba para lanzar</p><Botones lados><Boton onPulsar={() => ctl.current.lado?.(-1)}>◀</Boton><Boton onPulsar={() => ctl.current.lado?.(1)}>▶</Boton></Botones></div>;
}

export default [
  { id: 'corte', nombre: 'Corte perfecto', emoji: '🪚', como: 'La sierra recorre el tronco de lado a lado: toca para cortarlo justo por la mitad. Diez troncos, cada vez más rápido.', mejor: 'menos', unidad: '%', peor: 50, duracion: 90, C: Corte, formato: (v) => `${v.toFixed(1).replace('.', ',')} % de desvío` },
  { id: 'circulo', nombre: 'Círculo perfecto', emoji: '⭕', como: 'Dibuja con el dedo el círculo más perfecto que puedas, de una vez y cerrándolo. Cinco intentos: cuenta el mejor.', mejor: 'mas', unidad: '%', duracion: 90, C: Circulo, formato: (v) => `${v.toFixed(1).replace('.', ',')} %` },
  { id: 'numeros', nombre: 'Del 1 al 16', emoji: '🔢', como: 'Toca los números del 1 al 16 en orden lo más rápido posible. Cada fallo suma 1 segundo.', mejor: 'menos', unidad: 's', peor: 92, duracion: 60, C: Numeros, formato: (v) => `${v.toFixed(1).replace('.', ',')} s` },
  { id: 'frenada', nombre: 'Frena al límite', emoji: '🚗', como: 'El coche va derecho a un muro. Toca para frenar y para lo más cerca posible de la línea de cuadros sin pasarte. Si te pasas, +10 m de castigo; si chocas contra el muro, +20 m. Seis intentos, cada vez más rápido.', mejor: 'menos', unidad: 'cm', peor: 12000, duracion: 75, C: Frenada, formato: (v) => `${(v / 100).toFixed(2).replace('.', ',')} m` },
  { id: 'petanca', nombre: 'Petanca', emoji: '🟡', como: 'Elige desde dónde lanzas con ◀ ▶ y desliza hacia arriba para lanzar la bola (verás la flecha de dirección) y déjala lo más cerca posible del boliche amarillo. Cuatro bolas: cuenta la mejor.', mejor: 'menos', unidad: 'cm', peor: 1000, duracion: 60, C: Petanca, formato: (v) => `${Math.round(v)} cm` }
];
