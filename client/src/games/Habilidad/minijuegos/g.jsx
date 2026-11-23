// Minijuegos (7/7): diez de un toque o un gesto, para picarse en grupo: toques, vuelo, anillos de colores,
// llena el vaso, rompe ladrillos, bolos, penaltis, corta fruta, órbita y martillo de feria.
import React, { useRef, useState } from 'react';
import { useEscena, rng, crea, tocado, THREE } from '../tres.js';
import { Hud, Mensaje } from '../comun.jsx';
import { sonar, vibrar } from '../../../lib/sonido.js';

/** Punto del plano z = 0 bajo el dedo (para los juegos «de frente»). */
const enPlano = (() => {
  const ray = new THREE.Raycaster(); const v = new THREE.Vector2(); const plano = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  return (ctx, e, z = 0) => {
    const r = ctx.el.getBoundingClientRect(); v.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(v, ctx.camera); plano.constant = -z; const p = new THREE.Vector3(); return ray.ray.intersectPlane(plano, p) ? p : null;
  };
})();
const texturaBalon = () => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d');
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, 256, 128); x.fillStyle = '#111827';
  for (let i = 0; i < 9; i++) { const cx = (i * 61) % 256; const cy = 20 + ((i * 37) % 90); x.beginPath(); for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2 - Math.PI / 2; x.lineTo(cx + Math.cos(a) * 14, cy + Math.sin(a) * 14); } x.closePath(); x.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};

/* ───────── 1. Toques ───────── */
function Toques({ semilla, alTerminar }) {
  const ref = useRef(null); const [n, setN] = useState(0); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene } = ctx; const r = rng(semilla);
    const cesped = crea.suelo(30, 20, 0x16a34a, { celda: 1.5, contraste: 0.06, lineas: false }); cesped.position.set(0, 0, -4); scene.add(cesped);
    const porteria = new THREE.Group(); [-2.4, 2.4].forEach((x) => { const p = crea.cilindro(0.08, 0.08, 2.4, 0xffffff, 10); p.position.set(x, 1.2, 0); porteria.add(p); }); const lar = crea.cilindro(0.08, 0.08, 4.9, 0xffffff, 10); lar.rotation.z = Math.PI / 2; lar.position.y = 2.4; porteria.add(lar); porteria.position.z = -7; scene.add(porteria);
    const balon = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 20), new THREE.MeshStandardMaterial({ map: texturaBalon(), roughness: 0.45 })); balon.castShadow = true; scene.add(balon);
    const zona = new THREE.Mesh(new THREE.SphereGeometry(1.05, 12, 8), new THREE.MeshBasicMaterial({ visible: false })); balon.add(zona);
    const sombra = crea.sombraSuave(0.6); sombra.position.y = 0.01; scene.add(sombra);
    const st = { p: new THREE.Vector3(0, 5, 0), v: new THREE.Vector3(0, 0, 0), n: 0, fin: false, t: 0, esperando: true };
    balon.position.copy(st.p);
    ctx.encuadrar({ centro: [0, 4.4, 0], ancho: 7.4, alto: 10, desde: [0, 0.12, 1] });
    return {
      toque(e) {
        if (st.fin) return; const t = tocado(ctx, e, [balon]); if (!t) return;
        const q = enPlano(ctx, e); const off = q ? Math.max(-1, Math.min(1, (st.p.x - q.x) / 0.8)) : 0;
        st.esperando = false; st.n++; setN(st.n);
        // Cada vez más difícil: el bote se desvía más al azar y la zona donde vale tocar encoge
        const desvio = r.entre(-1, 1) * Math.min(2.6, st.n * 0.06);
        st.v.set(off * 3.2 + desvio, 9.5 + Math.min(3, st.n * 0.04), 0);
        zona.scale.setScalar(Math.max(0.55, 1 - st.n * 0.012)); sonar('toque', { minimo: 0, vibrar: false }); vibrar(8);
        ctx.onda(st.p.clone().setZ(0.3), 0xffffff, { radio: 1.4, eje: 'z' });
        if (st.n % 10 === 0) { ctx.chispas(st.p.clone(), 0xfacc15, 24); setMsg(`🔥 ${st.n}`); setTimeout(() => setMsg(null), 600); }
      },
      frame(dt) {
        if (!st.fin && !st.esperando) {
          st.t += dt; const g = 15 + Math.min(16, st.n * 0.35);
          st.v.y -= g * dt; st.p.addScaledVector(st.v, dt);
          if (Math.abs(st.p.x) > 3.3) { st.p.x = Math.sign(st.p.x) * 3.3; st.v.x *= -0.8; }
          if (st.p.y < 0.42) { st.fin = true; st.p.y = 0.42; sonar('fallo'); vibrar(120); ctx.temblor(0.25); setMsg('💥 ¡Se cayó!'); setTimeout(() => alTerminar(st.n), 900); }
          if (st.t > 90) { st.fin = true; alTerminar(st.n); }
        }
        if (st.esperando) st.p.y = 5 + Math.sin(performance.now() / 300) * 0.15;
        balon.position.copy(st.p); balon.rotation.z -= st.v.x * dt * 2; balon.rotation.x += dt * 4;
        sombra.position.x = st.p.x; sombra.scale.setScalar(Math.max(0.3, 1.2 - st.p.y * 0.08));
      }
    };
  }, { cielo: [0x38bdf8, 0xe0f2fe], niebla: 40 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`⚽ ${n} toques`} der="Toca el balón" /><Mensaje texto={msg} /><p className="hb-pista">Toca el balón para darle (por un lado, sale hacia el otro)</p></div>;
}

/* ───────── 2. Vuelo ───────── */
function Vuelo({ semilla, alTerminar }) {
  const ref = useRef(null); const [n, setN] = useState(0); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla); const ALTO = 9;
    const suelo = crea.suelo(4000, 30, 0x65a30d, { celda: 2, contraste: 0.05, lineas: false }); suelo.position.set(1900, 0, -5); scene.add(suelo);
    const avion = new THREE.Group();
    const cuerpo = crea.caja(0.9, 0.22, 0.3, 0xf97316); avion.add(cuerpo);
    const ala = crea.caja(0.4, 0.05, 1.3, 0xfde68a); ala.position.x = 0.05; avion.add(ala);
    const cola = crea.caja(0.18, 0.32, 0.05, 0xef4444); cola.position.set(-0.4, 0.15, 0); avion.add(cola);
    const helice = crea.caja(0.04, 0.5, 0.08, 0x334155); helice.position.x = 0.47; avion.add(helice);
    scene.add(avion);
    const torres = []; let sigX = 12;
    const ponerTorre = (dif) => {
      const hueco = Math.max(1.85, 3.6 - dif * 1.75); const yc = r.entre(1.4 + hueco / 2, ALTO - 0.6 - hueco / 2);
      const g = new THREE.Group(); const col = r.de([0x6366f1, 0x0ea5e9, 0x14b8a6, 0xa855f7]);
      const abajo = crea.caja(1.2, yc - hueco / 2, 1.2, col); abajo.position.y = (yc - hueco / 2) / 2; g.add(abajo);
      const arriba = crea.caja(1.2, ALTO + 6 - (yc + hueco / 2), 1.2, col); arriba.position.y = yc + hueco / 2 + (ALTO + 6 - (yc + hueco / 2)) / 2; g.add(arriba);
      [yc - hueco / 2, yc + hueco / 2].forEach((y) => { const b = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 1.3), crea.neon(0xfde047, 1)); b.position.y = y; g.add(b); });
      g.position.x = sigX; scene.add(g);
      // Desde la mitad, algunas torres suben y bajan
      const mueve = dif > 0.35 && r() < dif * 0.7 ? { amp: r.entre(0.5, 0.6 + dif * 0.9), fase: r.entre(0, 6), vel: r.entre(1, 1.6 + dif) } : null;
      torres.push({ g, x: sigX, yc, yc0: yc, hueco, pasada: false, mueve });
      sigX += Math.max(3.8, 7 - dif * 3.2) + r.entre(0, 1.2 * (1 - dif * 0.6));
    };
    for (let i = 0; i < 60; i++) { const n = crea.esfera(r.entre(0.6, 1.2), 0xffffff, { roughness: 1 }); n.scale.set(1.6, 0.7, 1); n.position.set(r.entre(0, 1500), r.entre(5, 11), r.entre(-8, -4)); scene.add(n); }
    const st = { x: 0, y: 4, vy: 0, n: 0, fin: false, t: 0, empezado: false };
    return {
      toque() { if (st.fin) return; st.empezado = true; st.vy = 6.6; sonar('toque', { minimo: 0, vibrar: false }); },
      frame(dt) {
        helice.rotation.x += dt * 40;
        if (!st.fin && st.empezado) {
          st.t += dt; const dif = Math.min(1, st.n / 30); const vel = 4.2 + dif * 3.6;
          torres.forEach((o) => { if (!o.mueve) return; const yc = o.yc0 + Math.sin(st.t * o.mueve.vel + o.mueve.fase) * o.mueve.amp; o.g.position.y = yc - o.yc0; o.yc = Math.max(1.4 + o.hueco / 2 - 0.4, Math.min(ALTO - 0.6 - o.hueco / 2 + 0.4, yc)); });
          st.x += vel * dt; st.vy -= 17 * dt; st.y += st.vy * dt;
          while (sigX < st.x + 30) ponerTorre(dif);
          const choque = st.y < 0.25 || st.y > ALTO + 0.4 || torres.some((o) => Math.abs(o.x - st.x) < 0.6 + 0.4 && Math.abs(st.y - o.yc) > o.hueco / 2 - 0.18);
          torres.forEach((o) => { if (!o.pasada && o.x < st.x - 0.6) { o.pasada = true; st.n++; setN(st.n); sonar('tic', { minimo: 0, vibrar: false }); if (st.n % 10 === 0) { setMsg(`✈️ ${st.n}`); setTimeout(() => setMsg(null), 600); } } });
          for (let i = torres.length - 1; i >= 0; i--) if (torres[i].x < st.x - 12) { scene.remove(torres[i].g); torres.splice(i, 1); }
          if (choque) { st.fin = true; vibrar(150); sonar('fallo'); ctx.temblor(0.5); ctx.chispas(new THREE.Vector3(st.x, st.y, 0), 0xf97316, 30); setMsg('💥 ¡Choque!'); setTimeout(() => alTerminar(st.n), 900); }
          if (st.t > 120) { st.fin = true; alTerminar(st.n); }
        } else if (!st.empezado) st.y = 4 + Math.sin(performance.now() / 300) * 0.2;
        avion.position.set(st.x, st.y, 0); avion.rotation.z = Math.max(-0.7, Math.min(0.6, st.vy * 0.08));
        const k = ctx.ancho(0.8);
        camera.position.set(st.x + 2.5, ALTO / 2, 9 * k); camera.lookAt(st.x + 2.5, ALTO / 2, 0); ctx.seguirSol(st.x, 0);
      }
    };
  }, { cielo: [0x7dd3fc, 0xfef3c7], niebla: 60 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`✈️ ${n} torres`} der="Toca para subir" /><Mensaje texto={msg} tipo="mal" /></div>;
}

/* ───────── 3. Anillos de colores ───────── */
const COL4 = [0xef4444, 0xfacc15, 0x22c55e, 0x3b82f6];
function Anillos({ semilla, alTerminar }) {
  const ref = useRef(null); const [n, setN] = useState(0); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla); const R = 1.7; const SEP = 7;
    const bola = crea.esfera(0.22, 0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.6 }); scene.add(bola);
    const anillos = []; let sigY = 6;
    const ponerAnillo = (k) => {
      const g = new THREE.Group();
      COL4.forEach((c, i) => { const arco = new THREE.Mesh(new THREE.TorusGeometry(R, 0.17, 10, 40, Math.PI / 2 - 0.04), crea.neon(c, 0.9)); arco.rotation.z = (i * Math.PI) / 2 + 0.02; g.add(arco); });
      g.position.y = sigY; scene.add(g);
      const vel = (r() < 0.5 ? -1 : 1) * (0.8 + Math.min(2.8, k * 0.2));
      const ritmo = k > 4 ? { amp: Math.min(1.4, (k - 4) * 0.12), f: r.entre(1, 2.2) } : null; // acelera y frena
      const cambio = new THREE.Mesh(new THREE.OctahedronGeometry(0.28), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 })); cambio.position.y = sigY + SEP / 2; scene.add(cambio);
      anillos.push({ g, y: sigY, vel, ritmo, cruces: 0, cambio, cogido: false }); sigY += Math.max(5.2, SEP - k * 0.12);
    };
    for (let i = 0; i < 4; i++) ponerAnillo(i);
    const st = { y: 2, vy: 0, color: 0, n: 0, fin: false, camY: 3, empezado: false, t: 0 };
    const ponColor = (c) => { st.color = c; bola.material.color.setHex(COL4[c]); bola.material.emissive.setHex(COL4[c]); };
    ponColor(r.entero(0, 3));
    // Color del arco que está en el ángulo a (0 = derecha), según el giro del anillo
    const colorEn = (o, a) => { const rel = (((a - o.g.rotation.z) % (Math.PI * 2)) + Math.PI * 4) % (Math.PI * 2); return Math.floor(rel / (Math.PI / 2)); };
    return {
      toque() { if (st.fin) return; st.empezado = true; st.vy = 6.8; sonar('toque', { minimo: 0, vibrar: false }); },
      frame(dt) {
        anillos.forEach((o) => { const v = o.ritmo ? o.vel * (1 + Math.sin(performance.now() / 1000 * o.ritmo.f) * o.ritmo.amp) : o.vel; o.g.rotation.z += v * dt; o.cambio.rotation.y += dt * 3; });
        if (st.fin) return;
        if (st.empezado) {
          st.t += dt; const yA = st.y; st.vy -= 16 * dt; st.y += st.vy * dt;
          for (const o of anillos) {
            // Cruces por abajo (ángulo -90°) y por arriba (90°)
            [[o.y - R, -Math.PI / 2], [o.y + R, Math.PI / 2]].forEach(([yc, ang]) => {
              if (st.fin) return;
              if ((yA - yc) * (st.y - yc) <= 0 && yA !== st.y) {
                if (colorEn(o, ang) !== st.color) { st.fin = true; vibrar(150); sonar('fallo'); ctx.temblor(0.4); ctx.chispas(new THREE.Vector3(0, st.y, 0), COL4[st.color], 30); setMsg('💥 ¡Color equivocado!'); setTimeout(() => alTerminar(st.n), 900); }
                else if (ang > 0 && st.vy > 0 && !o.pasado) { o.pasado = true; st.n++; setN(st.n); sonar('acierto', { vibrar: false }); }
              }
            });
            if (!o.cogido && Math.abs(st.y - o.cambio.position.y) < 0.4) { o.cogido = true; scene.remove(o.cambio); let c; do { c = r.entero(0, 3); } while (c === st.color); ponColor(c); ctx.onda(new THREE.Vector3(0, st.y, 0.2), COL4[c], { radio: 1.5, eje: 'z' }); }
          }
          while (sigY < st.y + SEP * 3) ponerAnillo(anillos.length);
          for (let i = anillos.length - 1; i >= 0; i--) if (anillos[i].y < st.camY - 12) { scene.remove(anillos[i].g); if (!anillos[i].cogido) scene.remove(anillos[i].cambio); anillos.splice(i, 1); }
          if (!st.fin && st.y < st.camY - 5.5) { st.fin = true; sonar('fallo'); setMsg('⬇️ ¡Te caíste!'); setTimeout(() => alTerminar(st.n), 800); }
          if (st.t > 120) { st.fin = true; alTerminar(st.n); }
        }
        st.camY = Math.max(st.camY, st.y + 1.5);
        bola.position.y = st.y; const k = ctx.ancho(0.6);
        camera.position.set(0, st.camY, 11 * k); camera.lookAt(0, st.camY, 0);
      }
    };
  }, { cielo: [0x1e1b4b, 0x020617], niebla: false });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🎡 ${n} anillos`} der="Pasa por tu color" /><Mensaje texto={msg} tipo="mal" /><p className="hb-pista">Toca para saltar: cruza cada anillo por el trozo de tu color</p></div>;
}

/* ───────── 4. Llena el vaso ───────── */
function Vaso({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ i: 1, err: 0 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene } = ctx; const r = rng(semilla); const ALTO = 3.2; const RAD = 0.95;
    const mesa = crea.caja(8, 0.3, 4, 0x92400e, { roughness: 0.5 }); mesa.position.y = -0.15; scene.add(mesa);
    const vidrio = new THREE.Mesh(new THREE.CylinderGeometry(RAD + 0.06, RAD - 0.06, ALTO, 40, 1, true), new THREE.MeshStandardMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.28, roughness: 0.05, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false })); vidrio.position.y = ALTO / 2; scene.add(vidrio);
    const fondoV = crea.cilindro(RAD - 0.06, RAD - 0.06, 0.08, 0xe0f2fe, 40); fondoV.position.y = 0.04; scene.add(fondoV);
    const liquido = new THREE.Mesh(new THREE.CylinderGeometry(RAD - 0.02, RAD - 0.08, 1, 40), new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, transparent: true, opacity: 0.92, emissive: 0x92400e, emissiveIntensity: 0.25 })); scene.add(liquido);
    const espuma = crea.cilindro(RAD - 0.02, RAD - 0.02, 0.12, 0xfffbeb, 40); scene.add(espuma);
    const linea = new THREE.Mesh(new THREE.TorusGeometry(RAD + 0.08, 0.03, 8, 48), crea.neon(0xef4444, 1.4)); linea.rotation.x = Math.PI / 2; scene.add(linea);
    const grifo = crea.caja(0.35, 0.3, 1.6, 0x94a3b8, { metalness: 0.9, roughness: 0.2 }); grifo.position.set(0, ALTO + 1.1, -0.5); scene.add(grifo);
    const chorro = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1, 10), new THREE.MeshStandardMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.85 })); scene.add(chorro);
    const objetivos = Array.from({ length: 5 }, () => r.entre(0.35, 0.9));
    const st = { i: 0, nivel: 0, llenando: false, caida: 0, errores: [], fase: 'listo', fin: false };
    const ponerObjetivo = () => { linea.position.y = objetivos[st.i] * ALTO; st.nivel = 0; st.fase = 'listo'; };
    ponerObjetivo();
    ctx.encuadrar({ centro: [0, 2.1, 0], ancho: 4.4, alto: 6, desde: [0, 0.22, 1] });
    const cerrar = () => {
      const err = st.nivel > 1 ? 50 : Math.abs(st.nivel - objetivos[st.i]) * 100; st.errores.push(err);
      setMsg(st.nivel > 1 ? '💦 ¡Rebosó! +50' : err < 2 ? `🎯 ¡Perfecto! ${err.toFixed(1)} %` : `${err.toFixed(1)} % de diferencia`); sonar(err < 3 ? 'victoria' : 'carta');
      if (err < 3) ctx.chispas(new THREE.Vector3(0, ALTO * st.nivel, 0.5), 0xfde047, 26);
      setHud({ i: Math.min(5, st.i + 2), err: st.errores.reduce((a, b) => a + b, 0) });
      setTimeout(() => { setMsg(null); st.i++; if (st.i >= 5) { st.fin = true; alTerminar(Math.round(st.errores.reduce((a, b) => a + b, 0) * 10) / 10); } else ponerObjetivo(); }, 1300);
    };
    return {
      toque() { if (st.fase === 'listo' && !st.fin) { st.fase = 'llenando'; st.llenando = true; } },
      soltar() { if (st.fase === 'llenando') { st.llenando = false; st.fase = 'cayendo'; st.caida = 0.18; } },
      frame(dt) {
        const vel = 0.2 + st.i * 0.06; // cada vaso se llena más deprisa
        if (st.llenando || st.fase === 'cayendo') st.nivel = Math.min(1.08, st.nivel + vel * dt);
        if (st.fase === 'cayendo') { st.caida -= dt; if (st.caida <= 0) { st.fase = 'hecho'; cerrar(); } }
        if (st.llenando && st.nivel >= 1.08) { st.llenando = false; st.fase = 'cayendo'; st.caida = 0; }
        const h = Math.max(0.001, Math.min(1, st.nivel) * ALTO); liquido.scale.y = h; liquido.position.y = h / 2 + 0.04; espuma.position.y = h + 0.06; espuma.visible = st.nivel > 0.02;
        const cae = st.llenando || st.fase === 'cayendo'; chorro.visible = cae; const largo = ALTO + 0.95 - h; chorro.scale.y = largo; chorro.position.set(0, h + largo / 2, 0);
      }
    };
  }, { cielo: [0x7c2d12, 0x1c1917], niebla: false });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🥛 Vaso ${hud.i}/5`} der={`Error: ${hud.err.toFixed(1).replace('.', ',')} %`} /><Mensaje texto={msg} /><p className="hb-pista">Mantén pulsado para llenar y suelta en la línea roja</p></div>;
}

/* ───────── 5. Rompe ladrillos ───────── */
function Ladrillos({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ pts: 0, vidas: 3, t: 60 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene } = ctx; const r = rng(semilla); const W = 7; const Hh = 11;
    const fondo = crea.caja(W + 0.6, Hh + 0.6, 0.3, 0x0f172a); fondo.position.set(0, Hh / 2, -0.4); scene.add(fondo);
    const marco = crea.marco(W, Hh, 0x22d3ee, { intensidad: 1.4, grosor: 0.12, alto: 0.2 }); marco.rotation.x = Math.PI / 2; marco.position.set(0, Hh / 2, 0); scene.add(marco);
    const pala = crea.caja(1.5, 0.28, 0.4, 0xf472b6, { emissive: 0xdb2777, emissiveIntensity: 0.5 }); pala.position.set(0, 0.7, 0); scene.add(pala);
    const bola = crea.esfera(0.16, 0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.8 }); scene.add(bola);
    const ladrillos = [];
    const COLS = [0xef4444, 0xf97316, 0xfacc15, 0x22c55e, 0x3b82f6, 0xa855f7];
    const muro = () => { for (let f = 0; f < 6; f++) for (let c = 0; c < 7; c++) { const m = crea.caja(0.9, 0.38, 0.4, COLS[f], { emissive: COLS[f], emissiveIntensity: 0.25 }); const x = -W / 2 + 0.5 + c * 1; const y = Hh - 1 - f * 0.5; m.position.set(x, y, 0); scene.add(m); ladrillos.push({ m, x, y, pts: 6 - f }); } };
    muro();
    const st = { px: 0, b: new THREE.Vector3(0, 1.1, 0), v: new THREE.Vector2(), pegada: true, vidas: 3, pts: 0, t: 0, fin: false, rapidez: 7 };
    ctx.encuadrar({ centro: [0, Hh / 2, 0], ancho: W + 0.8, alto: Hh + 0.8, desde: [0, 0, 1] });
    const mover = (e) => { const q = enPlano(ctx, e); if (q) st.px = Math.max(-W / 2 + 0.75, Math.min(W / 2 - 0.75, q.x)); };
    const pierde = () => { st.vidas--; sonar('fallo'); vibrar(100); ctx.temblor(0.3); if (st.vidas <= 0) { st.fin = true; setMsg('💥 Sin vidas'); setTimeout(() => alTerminar(st.pts), 900); } else { st.pegada = true; setMsg(`💔 Quedan ${st.vidas}`); setTimeout(() => setMsg(null), 700); } };
    return {
      toque(e) { mover(e); if (st.pegada && !st.fin) { st.pegada = false; const a = r.entre(-0.5, 0.5); st.v.set(Math.sin(a), Math.cos(a)).multiplyScalar(st.rapidez); sonar('toque', { minimo: 0, vibrar: false }); } },
      mover,
      frame(dt) {
        pala.position.x += (st.px - pala.position.x) * Math.min(1, dt * 20);
        if (st.fin) return; st.t += dt;
        if (st.pegada) { st.b.set(pala.position.x, 1.05, 0); }
        else for (let k = 0; k < 4; k++) {
          const h = dt / 4; st.b.x += st.v.x * h; st.b.y += st.v.y * h;
          if (Math.abs(st.b.x) > W / 2 - 0.16) { st.b.x = Math.sign(st.b.x) * (W / 2 - 0.16); st.v.x *= -1; }
          if (st.b.y > Hh - 0.16) { st.b.y = Hh - 0.16; st.v.y = -Math.abs(st.v.y); }
          if (st.v.y < 0 && st.b.y < 1 && st.b.y > 0.5 && Math.abs(st.b.x - pala.position.x) < 0.85) {
            const off = (st.b.x - pala.position.x) / 0.85; const a = off * 1.05; const s = st.v.length(); st.v.set(Math.sin(a) * s, Math.cos(a) * s); st.b.y = 1; sonar('tic', { minimo: 0, vibrar: false });
          }
          for (let i = ladrillos.length - 1; i >= 0; i--) {
            const l = ladrillos[i]; const dx = st.b.x - l.x; const dy = st.b.y - l.y;
            if (Math.abs(dx) < 0.45 + 0.16 && Math.abs(dy) < 0.19 + 0.16) {
              if (Math.abs(dx) / 0.61 > Math.abs(dy) / 0.35) st.v.x *= -1; else st.v.y *= -1;
              scene.remove(l.m); ladrillos.splice(i, 1); st.pts += l.pts; ctx.chispas(new THREE.Vector3(l.x, l.y, 0.3), l.m.material.color.getHex(), 10, { fuerza: 3 }); sonar('tic', { minimo: 0, vibrar: false });
              if (!ladrillos.length) { muro(); st.rapidez += 1.5; st.v.multiplyScalar(st.rapidez / st.v.length()); setMsg('🧱 ¡Muro nuevo, más rápido!'); setTimeout(() => setMsg(null), 900); }
              break;
            }
          }
          if (st.b.y < 0) { pierde(); break; }
        }
        bola.position.copy(st.b);
        if (!st.fin && st.t >= 60) { st.fin = true; alTerminar(st.pts); }
        setHud((h) => (h.pts !== st.pts || h.vidas !== st.vidas || h.t !== Math.ceil(60 - st.t) ? { pts: st.pts, vidas: st.vidas, t: Math.max(0, Math.ceil(60 - st.t)) } : h));
      }
    };
  }, { cielo: [0x1e1b4b, 0x020617], niebla: false });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🧱 ${hud.pts} pts · ${'❤️'.repeat(hud.vidas)}`} der={`⏱️ ${hud.t}s`} /><Mensaje texto={msg} /><p className="hb-pista">Arrastra para mover la pala · toca para sacar</p></div>;
}

/* ───────── 6. Bolos ───────── */
function Bolos({ alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ tirada: 1, total: 0 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const L = 16;
    const pista = crea.suelo(2.2, L + 4, 0xd6a46a, { celda: 0.2, contraste: 0.04, lineas: false }); pista.position.set(0, 0, -L / 2 + 1); scene.add(pista);
    [-1.25, 1.25].forEach((x) => { const c = crea.caja(0.3, 0.15, L + 4, 0x334155); c.position.set(x, -0.05, -L / 2 + 1); scene.add(c); });
    const suelo = crea.suelo(30, 40, 0x1e293b, { celda: 2 }); suelo.position.set(0, -0.12, -8); scene.add(suelo);
    const pared = crea.caja(10, 5, 0.3, 0x0f172a); pared.position.set(0, 2.4, -L - 1.6); scene.add(pared);
    const neon = crea.marco(2.4, 0.1, 0xec4899, { intensidad: 2 }); neon.position.set(0, 1.6, -L - 1.4); scene.add(neon);
    for (let z = 0; z > -L; z -= 3) [-1, 1].forEach((x) => { const flecha = crea.cartel('▲', 0.25, 0.25, { fondo: null, color: '#7c2d12', fuente: 'bold 200px sans-serif' }); flecha.rotation.x = -Math.PI / 2; flecha.position.set(x * 0.6, 0.012, z - 3); scene.add(flecha); });
    const perfil = [[0, 0], [0.09, 0.02], [0.12, 0.2], [0.09, 0.42], [0.05, 0.55], [0.07, 0.65], [0.05, 0.75], [0, 0.78]].map(([x, y]) => new THREE.Vector2(x, y));
    const geoBolo = new THREE.LatheGeometry(perfil, 20); const matBolo = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
    const POS = []; for (let f = 0; f < 4; f++) for (let k = 0; k <= f; k++) POS.push([(k - f / 2) * 0.32, -L - f * 0.28]);
    let bolos = [];
    const colocar = () => { bolos.forEach((b) => scene.remove(b.m)); bolos = POS.map(([x, z]) => { const m = new THREE.Mesh(geoBolo, matBolo); m.castShadow = true; const banda = crea.cilindro(0.062, 0.062, 0.04, 0xef4444, 16); banda.position.y = 0.6; m.add(banda); m.position.set(x, 0, z); scene.add(m); return { m, v: new THREE.Vector2(), caido: false, inc: 0, dir: 0 }; }); };
    colocar();
    const bola = crea.esfera(0.21, 0x7c3aed, { metalness: 0.3, roughness: 0.15 }); scene.add(bola);
    const st = { efecto: 0, tirada: 0, total: 0, rodando: false, b: new THREE.Vector3(0, 0.21, 1), v: new THREE.Vector3(), x0: 0, ini: null, fin: false, t: 0, curva: 0 };
    bola.position.copy(st.b);
    return {
      toque(e) { if (!st.rodando && !st.fin) st.ini = [e.clientX, e.clientY, performance.now()]; },
      mover(e) { if (st.ini && !st.rodando) { const rr = ctx.el.getBoundingClientRect(); st.x0 = Math.max(-0.85, Math.min(0.85, ((e.clientX - rr.left) / rr.width - 0.5) * 2.4)); st.b.x = st.x0; bola.position.x = st.x0; } },
      soltar(e) {
        if (!st.ini || st.rodando) { st.ini = null; return; }
        const dy = st.ini[1] - e.clientY; const dx = e.clientX - st.ini[0]; const ms = Math.max(60, performance.now() - st.ini[2]); st.ini = null;
        if (dy < 40) return;
        const vel = Math.min(16, Math.max(6, (dy / ms) * 9)); const ang = Math.atan2(dx, dy) * 0.25;
        st.v.set(Math.sin(ang) * vel, 0, -Math.cos(ang) * vel); st.rodando = true; st.t = 0; st.efecto = (Math.random() < 0.5 ? -1 : 1) * (0.06 + Math.random() * 0.12); sonar('toque', { minimo: 0 });
      },
      frame(dt) {
        if (st.rodando) {
          st.t += dt; st.b.addScaledVector(st.v, dt); bola.rotation.x -= st.v.z * dt / 0.21;
          // La pista no es perfecta: la bola se va abriendo hacia un lado (distinto en cada tirada)
          st.v.x += st.efecto * dt;
          if (Math.abs(st.b.x) > 1.05 && st.b.z > -L + 0.5) { st.v.x = 0; st.efecto = 0; st.b.x = Math.sign(st.b.x) * 1.1; } // canal
          bolos.forEach((p) => {
            if (p.caido) return; const d = Math.hypot(p.m.position.x - st.b.x, p.m.position.z - st.b.z);
            if (d < 0.3) {
              p.caido = true; p.v.set((p.m.position.x - st.b.x) * 6 + st.v.x * 0.3, (p.m.position.z - st.b.z) * 4 + st.v.z * 0.3); sonar('tic', { minimo: 0, vibrar: false });
              // La bola se desvía y pierde fuerza con cada bolo que tumba
              st.v.x += (st.b.x - p.m.position.x) * 4; st.v.multiplyScalar(0.82);
            }
          });
          // Los bolos que caen tiran a los de al lado
          bolos.forEach((p) => {
            if (!p.caido || p.v.length() < 0.5) return;
            p.m.position.x += p.v.x * dt; p.m.position.z += p.v.y * dt; p.v.multiplyScalar(Math.pow(0.04, dt));
            // Un bolo solo tira a otro si va con fuerza y le da de lleno
            bolos.forEach((q) => { if (q.caido || q === p || p.v.length() < 2.2) return; if (Math.hypot(q.m.position.x - p.m.position.x, q.m.position.z - p.m.position.z) < 0.24) { q.caido = true; q.v.set(p.v.x * 0.5 + (q.m.position.x - p.m.position.x) * 2, p.v.y * 0.5); } });
          });
          bolos.forEach((p) => { if (p.caido && p.inc < 1.5) { p.inc = Math.min(1.5, p.inc + dt * 6); p.m.rotation.set(Math.cos(Math.atan2(p.v.x, -p.v.y)) * -p.inc, 0, Math.sin(Math.atan2(p.v.x, -p.v.y)) * -p.inc); p.m.position.y = 0.08 * p.inc; } });
          if (st.b.z < -L - 1.4 || st.t > 4) {
            st.rodando = false; const caidos = bolos.filter((p) => p.caido).length; st.total += caidos; st.tirada++;
            setMsg(caidos === 10 ? '🎳 ¡PLENO!' : `${caidos} bolos`); sonar(caidos === 10 ? 'victoria' : 'acierto'); if (caidos === 10) ctx.chispas(new THREE.Vector3(0, 0.6, -L), 0xfacc15, 50, { fuerza: 5 });
            setHud({ tirada: Math.min(5, st.tirada + 1), total: st.total });
            setTimeout(() => { setMsg(null); if (st.tirada >= 5) { st.fin = true; alTerminar(st.total); return; } colocar(); st.b.set(0, 0.21, 1); st.x0 = 0; }, 1300);
          }
        }
        bola.position.copy(st.b);
        const k = ctx.ancho(0.7); const zc = st.rodando ? Math.max(-L + 4, st.b.z + 3.2 * k) : 3.2 * k + 1;
        camera.position.set(0, 1.5 + 0.5 * k, zc); camera.lookAt(0, 0.2, zc - 7);
      }
    };
  }, { cielo: [0x312e81, 0x0f172a], niebla: 40, exposicion: 1.15 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🎳 Tirada ${hud.tirada}/5`} der={`${hud.total} bolos`} /><Mensaje texto={msg} /><p className="hb-pista">Coloca la bola arrastrando y lánzala deslizando hacia arriba</p></div>;
}

/* ───────── 7. Penaltis ───────── */
function Penaltis({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ tiro: 1, goles: 0 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla); const AN = 7.32; const AL = 2.44; const PZ = -11;
    const cesped = crea.suelo(40, 30, 0x15803d, { celda: 1.5, contraste: 0.07, lineas: false }); cesped.position.set(0, 0, -6); scene.add(cesped);
    const blanco = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const area = new THREE.Mesh(new THREE.PlaneGeometry(16.5, 0.1), blanco); area.rotation.x = -Math.PI / 2; area.position.set(0, 0.01, PZ + 5.5); scene.add(area);
    const punto = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), blanco); punto.rotation.x = -Math.PI / 2; punto.position.set(0, 0.012, 0); scene.add(punto);
    const marco = new THREE.Group(); [-AN / 2, AN / 2].forEach((x) => { const p = crea.cilindro(0.06, 0.06, AL, 0xffffff, 12); p.position.set(x, AL / 2, 0); marco.add(p); }); const lar = crea.cilindro(0.06, 0.06, AN, 0xffffff, 12); lar.rotation.z = Math.PI / 2; lar.position.y = AL; marco.add(lar);
    const red = new THREE.Mesh(new THREE.BoxGeometry(AN, AL, 1.6), new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.35 })); red.position.set(0, AL / 2, -0.8); marco.add(red);
    marco.position.z = PZ; scene.add(marco);
    const grada = new THREE.InstancedMesh(new THREE.SphereGeometry(0.25, 8, 6), new THREE.MeshStandardMaterial(), 700);
    { const m4 = new THREE.Matrix4(); const c = new THREE.Color(); let n = 0; for (let f = 0; f < 7; f++) for (let x = -20; x < 20 && n < 700; x += 0.6) { m4.makeTranslation(x, 1 + f * 0.7, PZ - 6 - f * 0.6); grada.setMatrixAt(n, m4); grada.setColorAt(n, c.setHex(r.de([0xffffff, 0xdc2626, 0x1d4ed8, 0xfacc15]))); n++; } grada.count = n; }
    scene.add(grada);
    const portero = new THREE.Group(); const cuerpoP = crea.caja(0.6, 1.1, 0.35, 0x22c55e); cuerpoP.position.y = 1.15; portero.add(cuerpoP);
    const cabeza = crea.esfera(0.17, 0xf1c27d); cabeza.position.y = 1.85; portero.add(cabeza);
    [-1, 1].forEach((s) => { const b = crea.caja(0.14, 0.7, 0.14, 0x22c55e); b.position.set(s * 0.42, 1.4, 0); b.rotation.z = s * 0.5; portero.add(b); const guante = crea.esfera(0.11, 0xfacc15); guante.position.set(s * 0.6, 1.75, 0); portero.add(guante); });
    const piernas = crea.caja(0.5, 0.6, 0.3, 0x111827); piernas.position.y = 0.3; portero.add(piernas);
    portero.position.z = PZ + 0.3; scene.add(portero);
    const balon = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 16), new THREE.MeshStandardMaterial({ map: texturaBalon(), roughness: 0.45 })); balon.castShadow = true; scene.add(balon);
    const mira = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.22, 24), new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.9 })); mira.visible = false; scene.add(mira);
    const st = { tiro: 0, goles: 0, vuela: false, t: 0, desde: new THREE.Vector3(0, 0.11, 0), a: new THREE.Vector3(), dur: 0.6, ini: null, fin: false, salto: null };
    balon.position.copy(st.desde);
    // Del gesto al punto de la portería: horizontal según la inclinación, altura según el largo
    const objetivo = (dx, dy, rr) => new THREE.Vector3(Math.atan2(dx, dy) * 9.5, Math.max(0.15, Math.min(3.4, (dy / (rr.height * 0.55)) * 3.3)), PZ);
    const k = () => ctx.ancho(0.75);
    return {
      toque(e) { if (!st.vuela && !st.fin) st.ini = [e.clientX, e.clientY]; },
      mover(e) { if (!st.ini) return; const rr = ctx.el.getBoundingClientRect(); const dx = e.clientX - st.ini[0]; const dy = st.ini[1] - e.clientY; if (dy < 15) { mira.visible = false; return; } const o = objetivo(dx, dy, rr); mira.visible = true; mira.position.set(o.x, o.y, PZ + 0.05); },
      soltar(e) {
        mira.visible = false; if (!st.ini || st.vuela) { st.ini = null; return; }
        const rr = ctx.el.getBoundingClientRect(); const dx = e.clientX - st.ini[0]; const dy = st.ini[1] - e.clientY; st.ini = null; if (dy < 30) return;
        st.a.copy(objetivo(dx, dy, rr)); st.vuela = true; st.t = 0; st.dur = 0.55; sonar('toque', { minimo: 0 });
        // El portero se tira: cada vez acierta más el lado (y llega más lejos)
        const lista = Math.min(0.8, 0.45 + st.tiro * 0.04); const adivina = r() < lista; const alcance = 2.3 + Math.min(0.8, st.tiro * 0.09);
        // Si adivina, se tira hacia el balón (hasta donde llega); si no, a un lado al azar o se queda en el centro
        const x = adivina ? Math.sign(st.a.x || 1) * Math.min(alcance, Math.abs(st.a.x)) : r.de([-1, 0, 1]) * alcance;
        st.salto = { x, y: adivina ? Math.min(0.9, Math.max(0.2, st.a.y - 1.1)) : 0.3, alcance };
      },
      frame(dt) {
        if (st.vuela) {
          st.t += dt; const u = Math.min(1, st.t / st.dur);
          balon.position.set(st.desde.x + (st.a.x - st.desde.x) * u, st.desde.y + (st.a.y - st.desde.y) * u + Math.sin(u * Math.PI) * 0.4, st.desde.z + (st.a.z - st.desde.z) * u);
          balon.rotation.x -= dt * 20;
          const s = Math.min(1, st.t / 0.35); portero.position.x = st.salto.x * s; portero.position.y = st.salto.y * Math.sin(s * Math.PI * 0.5); portero.rotation.z = -Math.sign(st.salto.x) * s * 1.1;
          if (u >= 1) {
            st.vuela = false; const dentro = Math.abs(st.a.x) < AN / 2 - 0.12 && st.a.y < AL - 0.08;
            // ¿Lo para? Alcance del portero desde su posición final (tumbado, con brazos)
            const px = portero.position.x; const parado = dentro && Math.abs(st.a.x - px) < 1.0 && st.a.y < 1.95 + st.salto.y;
            const gol = dentro && !parado; if (gol) st.goles++; st.tiro++;
            if (gol) { sonar('victoria'); ctx.chispas(st.a.clone(), 0xfacc15, 30); red.scale.z = 1.25; setMsg('⚽ ¡GOL!'); } else { sonar('fallo'); setMsg(parado ? '🧤 ¡Parada!' : '❌ Fuera'); }
            setHud({ tiro: Math.min(10, st.tiro + 1), goles: st.goles });
            setTimeout(() => { setMsg(null); red.scale.z = 1; portero.position.set(0, 0, PZ + 0.3); portero.rotation.z = 0; balon.position.copy(st.desde); if (st.tiro >= 10) { st.fin = true; alTerminar(st.goles); } }, 1200);
          }
        } else if (!st.fin) portero.position.x = Math.sin(performance.now() / 400) * 0.5;
        const kk = k(); camera.position.set(0, 1.5 + 0.3 * kk, 3.2 * kk + 0.8); camera.lookAt(0, 1.1, PZ);
      }
    };
  }, { cielo: [0x0c4a6e, 0x082f49], niebla: 50, exposicion: 1.1 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`⚽ Tiro ${hud.tiro}/10`} der={`${hud.goles} goles`} /><Mensaje texto={msg} /><p className="hb-pista">Desliza hacia arriba: inclinación = lado, largo = altura</p></div>;
}

/* ───────── 8. Corta fruta ───────── */
const FRUTAS = [[0xef4444, 0.42, 1], [0xf97316, 0.4, 1], [0x22c55e, 0.55, 1], [0xfacc15, 0.36, 1], [0xa855f7, 0.3, 2]];
function Fruta({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ pts: 0, t: 40 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla);
    const tabla = crea.caja(12, 16, 0.3, 0x78350f, { roughness: 0.8 }); tabla.position.set(0, 4, -2); scene.add(tabla);
    const objetos = []; const trozos = [];
    const lanzar = (t) => {
      const bomba = r() < Math.min(0.28, 0.1 + t * 0.006);
      const [col, rad, pts] = bomba ? [0x111827, 0.4, 0] : r.de(FRUTAS);
      const m = crea.esfera(rad, col, { roughness: 0.35 }); if (bomba) { const mecha = crea.cilindro(0.03, 0.03, 0.3, 0xfde68a, 6); mecha.position.y = rad + 0.1; m.add(mecha); }
      m.position.set(r.entre(-3, 3), -1.5, 0); scene.add(m);
      objetos.push({ m, v: new THREE.Vector3(r.entre(-1.6, 1.6) - m.position.x * 0.3, r.entre(10.5, 13), 0), rad, bomba, pts, col });
    };
    const st = { t: 0, pts: 0, prox: 0.5, fin: false, ant: null, combo: 0, comboT: 0 };
    const estela = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffffff })); scene.add(estela); const puntos = [];
    ctx.encuadrar({ centro: [0, 4, 0], ancho: 8, alto: 11, desde: [0, 0, 1] });
    const cortar = (a, b) => {
      for (let i = objetos.length - 1; i >= 0; i--) {
        const o = objetos[i]; const p = o.m.position; const ab = b.clone().sub(a); const t = Math.max(0, Math.min(1, p.clone().sub(a).dot(ab) / Math.max(1e-6, ab.lengthSq()))); const c = a.clone().addScaledVector(ab, t);
        if (c.distanceTo(p) < o.rad + 0.15) {
          scene.remove(o.m); objetos.splice(i, 1);
          if (o.bomba) { st.pts = Math.max(0, st.pts - 5); sonar('fallo'); vibrar(150); ctx.temblor(0.5); ctx.chispas(p.clone(), 0xf97316, 40, { fuerza: 6 }); setMsg('💣 ¡Bomba! −5'); setTimeout(() => setMsg(null), 700); continue; }
          st.combo = st.comboT > 0 ? st.combo + 1 : 1; st.comboT = 0.25; const extra = st.combo >= 3 ? 1 : 0;
          st.pts += o.pts + extra; sonar('tic', { minimo: 0, vibrar: false }); ctx.chispas(p.clone(), o.col, 16, { fuerza: 3 });
          if (st.combo === 3) { setMsg('✨ ¡Combo!'); setTimeout(() => setMsg(null), 500); }
          [-1, 1].forEach((s) => { const h = new THREE.Mesh(new THREE.SphereGeometry(o.rad, 16, 10, 0, Math.PI), o.m.material); h.position.copy(p); h.rotation.y = s * Math.PI / 2; scene.add(h); trozos.push({ m: h, v: new THREE.Vector3(s * 2.5, 2, 0) }); });
        }
      }
    };
    return {
      toque(e) { st.ant = enPlano(ctx, e); puntos.length = 0; },
      mover(e) { if (!st.ant || st.fin) return; const q = enPlano(ctx, e); if (!q) return; cortar(st.ant, q); st.ant = q; puntos.push(q.clone().setZ(0.6)); if (puntos.length > 10) puntos.shift(); estela.geometry.setFromPoints(puntos); },
      soltar() { st.ant = null; puntos.length = 0; estela.geometry.setFromPoints([]); },
      frame(dt) {
        if (!st.fin) {
          st.t += dt; st.prox -= dt; st.comboT -= dt;
          if (st.prox <= 0) { const n = st.t > 20 ? r.entero(1, 3) : r.entero(1, 2); for (let i = 0; i < n; i++) lanzar(st.t); st.prox = Math.max(0.45, 1.1 - st.t * 0.015); }
          if (st.t >= 40) { st.fin = true; alTerminar(st.pts); }
        }
        for (let i = objetos.length - 1; i >= 0; i--) { const o = objetos[i]; o.v.y -= 12 * dt; o.m.position.addScaledVector(o.v, dt); o.m.rotation.x += dt * 2; if (o.m.position.y < -2.5 && o.v.y < 0) { scene.remove(o.m); objetos.splice(i, 1); } }
        for (let i = trozos.length - 1; i >= 0; i--) { const t = trozos[i]; t.v.y -= 12 * dt; t.m.position.addScaledVector(t.v, dt); t.m.rotation.z += dt * 4; if (t.m.position.y < -3) { scene.remove(t.m); trozos.splice(i, 1); } }
        if (puntos.length && !st.ant) estela.geometry.setFromPoints([]);
        void camera;
        setHud((h) => (h.pts !== st.pts || h.t !== Math.ceil(40 - st.t) ? { pts: st.pts, t: Math.max(0, Math.ceil(40 - st.t)) } : h));
      }
    };
  }, { cielo: [0x422006, 0x1c0a00], niebla: false });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🍉 ${hud.pts} pts`} der={`⏱️ ${hud.t}s`} /><Mensaje texto={msg} /><p className="hb-pista">Desliza para cortar la fruta · ¡ojo con las bombas!</p></div>;
}

/* ───────── 9. Órbita ───────── */
function Orbita({ semilla, alTerminar }) {
  const ref = useRef(null); const [n, setN] = useState(0); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene } = ctx; const r = rng(semilla); const RADIOS = [2.1, 3.3];
    const planeta = crea.esfera(1.2, 0x6366f1, { emissive: 0x312e81, emissiveIntensity: 0.6, roughness: 0.5 }); scene.add(planeta);
    const anilloP = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.05, 8, 60), crea.neon(0xa5b4fc, 0.8)); anilloP.rotation.x = 1.2; scene.add(anilloP);
    RADIOS.forEach((rad) => { const o = new THREE.Mesh(new THREE.RingGeometry(rad - 0.02, rad + 0.02, 120), new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.35 })); scene.add(o); });
    for (let i = 0; i < 120; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(r.entre(0.02, 0.05), 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff })); s.position.set(r.entre(-12, 12), r.entre(-12, 12), -6); scene.add(s); }
    const nave = new THREE.Group(); const cono = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 12), crea.neon(0x22d3ee, 1.2)); cono.rotation.z = -Math.PI / 2; nave.add(cono); scene.add(nave);
    const rocas = [];
    const st = { ang: Math.PI / 2, orb: 1, rad: RADIOS[1], vel: 1.1, n: 0, fin: false, t: 0, sigAng: Math.PI / 2 + 1.4 };
    const ponerRoca = () => {
      const orb = r.entero(0, 1); const a = st.sigAng; const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3), new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.7, emissive: 0x7c2d12, emissiveIntensity: 0.4 }));
      m.position.set(Math.cos(a) * RADIOS[orb], Math.sin(a) * RADIOS[orb], 0); scene.add(m); rocas.push({ m, a, orb, pasada: false });
      // A veces dos casi seguidas en órbitas distintas (hay que cambiar rápido)
      st.sigAng += r() < Math.min(0.5, st.t * 0.01) ? r.entre(0.45, 0.6) : r.entre(0.8, 1.5);
    };
    for (let i = 0; i < 5; i++) ponerRoca();
    ctx.encuadrar({ centro: [0, 0, 0], ancho: 8, alto: 8, desde: [0, 0, 1] });
    return {
      toque() { if (st.fin) return; st.orb = 1 - st.orb; sonar('toque', { minimo: 0, vibrar: false }); },
      frame(dt) {
        rocas.forEach((o) => { o.m.rotation.x += dt; o.m.rotation.y += dt * 1.3; });
        planeta.rotation.y += dt * 0.3;
        if (st.fin) return;
        st.t += dt; st.vel = 1.1 + Math.min(1.8, st.t * 0.035); st.ang += st.vel * dt;
        st.rad += (RADIOS[st.orb] - st.rad) * Math.min(1, dt * 14);
        nave.position.set(Math.cos(st.ang) * st.rad, Math.sin(st.ang) * st.rad, 0); nave.rotation.z = st.ang + Math.PI / 2;
        while (st.sigAng < st.ang + Math.PI * 1.6) ponerRoca();
        for (let i = rocas.length - 1; i >= 0; i--) {
          const o = rocas[i]; const d = o.a - st.ang;
          if (Math.abs(d) < 0.16 && Math.abs(st.rad - RADIOS[o.orb]) < 0.5) { st.fin = true; vibrar(150); sonar('fallo'); ctx.temblor(0.4); ctx.chispas(nave.position.clone(), 0x22d3ee, 30); setMsg('💥 ¡Choque!'); setTimeout(() => alTerminar(st.n), 900); return; }
          if (!o.pasada && d < -0.2) { o.pasada = true; st.n++; setN(st.n); }
          if (d < -Math.PI * 0.6) { scene.remove(o.m); rocas.splice(i, 1); }
        }
        if (st.t > 120) { st.fin = true; alTerminar(st.n); }
      }
    };
  }, { cielo: [0x0b1026, 0x000000], niebla: false });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🪐 ${n} esquivadas`} der="Toca para cambiar de órbita" /><Mensaje texto={msg} tipo="mal" /></div>;
}

/* ───────── 10. Martillo de feria ───────── */
function Martillo({ alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ golpe: 1, total: 0 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene } = ctx; const ALTO = 7;
    const suelo = crea.suelo(20, 12, 0x7c2d12, { celda: 1, contraste: 0.05 }); scene.add(suelo);
    const torre = crea.caja(0.9, ALTO, 0.5, 0xb91c1c); torre.position.set(0, ALTO / 2 + 0.6, -0.4); scene.add(torre);
    for (let i = 1; i <= 10; i++) { const m = crea.caja(0.95, 0.04, 0.52, i % 5 === 0 ? 0xfacc15 : 0xfde68a); m.position.set(0, 0.6 + (i / 10) * (ALTO - 0.5), -0.38); scene.add(m); }
    const guia = crea.cilindro(0.05, 0.05, ALTO, 0xe5e7eb, 8, { metalness: 0.9 }); guia.position.set(0, ALTO / 2 + 0.6, 0.05); scene.add(guia);
    const disco = crea.cilindro(0.28, 0.28, 0.2, 0x3b82f6, 20, { emissive: 0x1d4ed8, emissiveIntensity: 0.4 }); disco.rotation.x = Math.PI / 2; scene.add(disco);
    const campana = crea.esfera(0.45, 0xfacc15, { metalness: 0.8, roughness: 0.2 }); campana.scale.y = 0.75; campana.position.set(0, ALTO + 0.9, 0.05); scene.add(campana);
    const base = crea.caja(1.4, 0.6, 1.2, 0x1f2937); base.position.y = 0.3; scene.add(base);
    const yunque = crea.caja(0.8, 0.12, 0.6, 0xef4444, { emissive: 0xef4444, emissiveIntensity: 0.4 }); yunque.position.set(0, 0.66, 0.2); scene.add(yunque);
    // Medidor: una aguja que oscila cada vez más deprisa; toca cuando esté arriba del todo
    const medidor = new THREE.Group(); medidor.position.set(1.9, 3.2, 0);
    const fondoM = crea.caja(0.5, 4.2, 0.1, 0x0f172a); medidor.add(fondoM);
    const franjas = [[0xef4444, 0.35], [0xf97316, 0.25], [0xfacc15, 0.2], [0x22c55e, 0.12], [0x4ade80, 0.08]]; let yb = -2;
    franjas.forEach(([c, h]) => { const f = new THREE.Mesh(new THREE.BoxGeometry(0.42, 4 * h, 0.04), crea.neon(c, 0.6)); f.position.set(0, yb + 2 * h, 0.07); medidor.add(f); yb += 4 * h; });
    const aguja = crea.caja(0.7, 0.08, 0.12, 0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.8 }); aguja.position.z = 0.12; medidor.add(aguja); scene.add(medidor);
    const st = { golpe: 0, total: 0, fase: 'oscila', t: 0, valor: 0, y: 0, vy: 0, fin: false };
    ctx.encuadrar({ centro: [0.6, 4.3, 0], ancho: 5.2, alto: 9.4, desde: [0.05, 0.1, 1] });
    return {
      toque() {
        if (st.fase !== 'oscila' || st.fin) return;
        st.fase = 'sube'; const v = Math.pow(st.valor, 1.6); st.vy = Math.sqrt(2 * 20 * (ALTO - 0.4) * Math.max(0.05, Math.min(1, v / 0.96))); st.y = 0; st.res = Math.round(v * 100);
        sonar('toque', { minimo: 0 }); ctx.temblor(0.25); ctx.chispas(new THREE.Vector3(0, 0.75, 0.3), 0xfacc15, 14);
      },
      frame(dt) {
        if (st.fase === 'oscila') { st.t += dt * (0.9 + st.golpe * 0.25); const f = st.t % 1; st.valor = f < 0.5 ? f * 2 : 2 - f * 2; aguja.position.y = -2 + st.valor * 4; } // ida y vuelta a velocidad constante
        if (st.fase === 'sube') {
          st.vy -= 20 * dt; st.y += st.vy * dt;
          if (st.y >= ALTO - 0.4) { st.y = ALTO - 0.4; st.vy = -2; if (!st.tocoCampana) { st.tocoCampana = true; sonar('victoria'); ctx.chispas(campana.position.clone(), 0xfacc15, 40, { fuerza: 5 }); campana.scale.setScalar(1.25); } }
          if (st.vy < 0 && st.y <= 0) {
            st.y = 0; st.fase = 'hecho'; st.total += st.res; st.golpe++;
            setMsg(st.res >= 96 ? `🔔 ¡CAMPANA! ${st.res}` : `💪 ${st.res}`); if (st.res < 96) sonar('acierto');
            setHud({ golpe: Math.min(5, st.golpe + 1), total: st.total });
            setTimeout(() => { setMsg(null); campana.scale.set(1, 0.75, 1); st.tocoCampana = false; if (st.golpe >= 5) { st.fin = true; alTerminar(st.total); } else { st.fase = 'oscila'; st.t = 0; } }, 1100);
          }
        }
        disco.position.set(0, 0.85 + st.y, 0.05);
      }
    };
  }, { cielo: [0x4c1d95, 0x1e1b4b], niebla: false });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🔨 Golpe ${hud.golpe}/5`} der={`${hud.total} pts`} /><Mensaje texto={msg} /><p className="hb-pista">Toca cuando la aguja esté arriba del todo</p></div>;
}

export default [
  { id: 'toques', nombre: 'Toques', emoji: '⚽', como: 'Toca el balón para darle y que no caiga al suelo. Si lo tocas por un lado, sale hacia el otro. Con cada toque cae más deprisa, se desvía más y hay que acertarle más de lleno: cuenta los toques seguidos.', mejor: 'mas', unidad: 'toques', duracion: 90, C: Toques },
  { id: 'vuelo', nombre: 'Vuelo', emoji: '✈️', como: 'Toca para que la avioneta suba y pasa por los huecos de las torres sin chocar. Con cada torre va más rápido, los huecos se estrechan, las torres se juntan y algunas empiezan a moverse.', mejor: 'mas', unidad: 'torres', duracion: 120, C: Vuelo },
  { id: 'anillos', nombre: 'Anillos de colores', emoji: '🎡', como: 'Toca para saltar hacia arriba. Los anillos giran: solo puedes cruzarlos por el trozo de TU color. Los rombos blancos te cambian de color. Cada anillo gira más rápido, están más juntos y, luego, aceleran y frenan.', mejor: 'mas', unidad: 'anillos', duracion: 120, C: Anillos },
  { id: 'vaso', nombre: 'Llena el vaso', emoji: '🥛', como: 'Mantén pulsado para servir y suelta para que el vaso quede justo en la línea roja (ojo: lo que está cayendo también entra). Cinco vasos, cada vez más deprisa. Si rebosa, +50.', mejor: 'menos', unidad: '%', peor: 250, duracion: 75, C: Vaso, formato: (v) => `${v.toFixed(1).replace('.', ',')} % de error` },
  { id: 'ladrillos', nombre: 'Rompe ladrillos', emoji: '🧱', como: 'Mueve la pala arrastrando y no dejes caer la bola. Cada ladrillo da puntos (los de arriba, más). Tres vidas y 60 segundos; si rompes el muro, sale otro más rápido.', mejor: 'mas', unidad: 'pts', duracion: 60, C: Ladrillos },
  { id: 'bolos', nombre: 'Bolos', emoji: '🎳', como: 'Arrastra para colocar la bola y desliza hacia arriba para lanzarla: la inclinación y la rapidez del gesto cuentan. La bola se abre un poco hacia un lado y pierde fuerza con cada bolo: para hacer pleno hay que entrar justo en el hueco entre el primero y el segundo. Cinco tiradas.', mejor: 'mas', unidad: 'bolos', duracion: 75, C: Bolos },
  { id: 'penaltis', nombre: 'Penaltis', emoji: '🥅', como: 'Desliza hacia arriba para chutar: la inclinación decide el lado y el largo, la altura (verás la mira). Si el portero adivina el lado, lo para salvo que lo pegues mucho al palo. Cada vez adivina más. Diez penaltis.', mejor: 'mas', unidad: 'goles', duracion: 90, C: Penaltis },
  { id: 'fruta', nombre: 'Corta fruta', emoji: '🍉', como: 'Desliza el dedo para cortar la fruta que salta (la uva vale 2 y los combos suman). Si cortas una bomba, −5. 40 segundos.', mejor: 'mas', unidad: 'pts', duracion: 40, C: Fruta },
  { id: 'orbita', nombre: 'Órbita', emoji: '🪐', como: 'Tu nave gira alrededor del planeta. Toca para cambiar entre la órbita de dentro y la de fuera y esquiva las rocas. Cada vez va más rápido.', mejor: 'mas', unidad: 'rocas', duracion: 120, C: Orbita },
  { id: 'martillo', nombre: 'Martillo de feria', emoji: '🔨', como: 'La aguja sube y baja sin parar: toca cuando esté arriba del todo para golpear con toda la fuerza y hacer sonar la campana. Un poco antes o después ya pierde mucho. Cinco golpes, cada vez más rápidos.', mejor: 'mas', unidad: 'pts', duracion: 60, C: Martillo }
];
