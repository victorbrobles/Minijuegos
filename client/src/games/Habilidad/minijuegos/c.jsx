// Minijuegos (3/6): parejas, salta obstáculos, lluvia de meteoritos, canasta y al ritmo.
import React, { useRef, useState } from 'react';
import { useEscena, rng, crea, tocado, THREE, mat } from '../tres.js';
import { Hud, Mensaje } from '../comun.jsx';
import { sonar, vibrar } from '../../../lib/sonido.js';

/* ───────── Parejas ───────── */
const SIMBOLOS = ['🍎', '⚽', '🚀', '🐱', '🎸', '🌵', '🍩', '⭐', '🐙', '🎲'];
function dorsoCarta() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 256, 256); g.addColorStop(0, '#8b5cf6'); g.addColorStop(1, '#db2777'); x.fillStyle = g; x.beginPath(); x.roundRect(0, 0, 256, 256, 36); x.fill();
  x.strokeStyle = 'rgba(255,255,255,0.55)'; x.lineWidth = 8; x.beginPath(); x.roundRect(18, 18, 220, 220, 24); x.stroke();
  x.fillStyle = 'rgba(255,255,255,0.18)'; for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) { x.beginPath(); x.arc(36 + i * 37, 36 + j * 37, 5, 0, Math.PI * 2); x.fill(); }
  x.fillStyle = '#ffffff'; x.font = 'bold 120px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('?', 128, 136);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function Parejas({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ t: 0, hechas: 0 });
  useEscena(ref, (ctx) => {
    const { scene } = ctx; const r = rng(semilla);
    const mesa = crea.caja(8.4, 0.3, 8.4, 0x1e1b4b, { roughness: 0.5 }); mesa.position.y = -0.3; scene.add(mesa);
    const tapete = crea.caja(7.9, 0.04, 7.9, 0x312e81, { roughness: 0.95 }); tapete.position.y = -0.13; scene.add(tapete);
    const borde = crea.marco(8.2, 8.2, 0xa78bfa, { intensidad: 0.9 }); borde.position.y = -0.12; scene.add(borde);
    const texDorso = dorsoCarta();
    const simbolos = r.barajar([...r.barajar(SIMBOLOS).slice(0, 8)].flatMap((s) => [s, s]));
    const fichas = simbolos.map((s, i) => {
      const g = new THREE.Group(); const base = crea.caja(1.6, 0.14, 1.6, 0xf8fafc, { roughness: 0.3 }); g.add(base);
      const cara = crea.cartel(s, 1.4, 1.4, { fondo: '#ffffff', fuente: '150px sans-serif', radio: 30 }); cara.rotation.x = Math.PI / 2; cara.position.y = -0.075; g.add(cara);
      const dorso = new THREE.Mesh(new THREE.PlaneGeometry(1.48, 1.48), new THREE.MeshStandardMaterial({ map: texDorso, roughness: 0.35, transparent: true })); dorso.rotation.x = -Math.PI / 2; dorso.position.y = 0.075; g.add(dorso);
      g.position.set((i % 4 - 1.5) * 1.85, 0, (Math.floor(i / 4) - 1.5) * 1.85); scene.add(g);
      return { g, s, giro: 0, objetivo: 0, hecha: false, brillo: 0 };
    });
    const st = { t: 0, abiertas: [], hechas: 0, bloqueo: 0, fin: false };
    ctx.encuadrar({ centro: [0, 0, 0.1], ancho: 8, alto: 8, desde: [0, 1, 0.38] });
    return {
      toque(e) {
        if (st.fin || st.bloqueo > 0) return;
        const t = tocado(ctx, e, fichas.map((f) => f.g)); if (!t) return;
        const f = fichas.find((x) => x.g === t.obj); if (f.hecha || st.abiertas.includes(f)) return;
        f.objetivo = Math.PI; st.abiertas.push(f); sonar('toque', { minimo: 0 });
        if (st.abiertas.length === 2) {
          const [a, b] = st.abiertas;
          if (a.s === b.s) {
            a.hecha = b.hecha = true; st.abiertas = []; st.hechas++; sonar('acierto'); setHud({ t: st.t, hechas: st.hechas });
            [a, b].forEach((x) => { x.brillo = 1; ctx.chispas(x.g.position.clone().setY(0.6), 0xfacc15, 16); });
            if (st.hechas === 8) { st.fin = true; setTimeout(() => alTerminar(Math.round(st.t * 10) / 10), 500); }
          } else st.bloqueo = 0.75;
        }
      },
      frame(dt) {
        if (!st.fin) st.t += dt;
        if (st.bloqueo > 0) { st.bloqueo -= dt; if (st.bloqueo <= 0) { st.abiertas.forEach((f) => { f.objetivo = 0; }); st.abiertas = []; } }
        fichas.forEach((f) => {
          f.giro += (f.objetivo - f.giro) * Math.min(1, dt * 12); f.g.rotation.z = f.giro; f.g.position.y = Math.sin(f.giro) * 0.6;
          if (f.brillo > 0) { f.brillo -= dt; f.g.scale.setScalar(1 + Math.sin(f.brillo * Math.PI) * 0.12); }
          if (f.hecha && f.brillo <= 0) f.g.position.y = -0.04;
        });
        if (!st.fin && st.t >= 90) { st.fin = true; alTerminar(90 + (8 - st.hechas) * 3); }
        setHud((h) => (Math.floor(h.t) !== Math.floor(st.t) ? { t: st.t, hechas: st.hechas } : h));
      }
    };
  }, { cielo: [0x4c1d95, 0x0b0620], niebla: false });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🃏 ${hud.hechas}/8 parejas`} der={`⏱️ ${Math.floor(hud.t)} s`} /></div>;
}

/* ───────── Salta obstáculos ───────── */
function corredor() {
  const g = new THREE.Group();
  const cuerpo = crea.caja(0.5, 0.62, 0.36, 0x2563eb); cuerpo.position.y = 0.95; g.add(cuerpo);
  const dorsal = crea.caja(0.3, 0.24, 0.02, 0xffffff); dorsal.position.set(0, 1.0, 0.19); g.add(dorsal);
  const cabeza = crea.esfera(0.22, 0xfcd9b6); cabeza.position.y = 1.45; g.add(cabeza);
  const pelo = crea.esfera(0.23, 0x3f2a1d); pelo.scale.set(1, 0.6, 1); pelo.position.y = 1.55; g.add(pelo);
  const cinta = crea.cilindro(0.235, 0.235, 0.06, 0xef4444, 20); cinta.position.y = 1.5; g.add(cinta);
  const piernas = [-0.13, 0.13].map((z) => { const p = crea.caja(0.15, 0.62, 0.15, 0x1e293b); p.geometry.translate(0, -0.31, 0); p.position.set(0, 0.66, z); g.add(p); const zap = crea.caja(0.26, 0.1, 0.16, 0xf97316); zap.position.set(0.06, -0.6, 0); p.add(zap); return p; });
  const brazos = [-0.3, 0.3].map((z) => { const b = crea.caja(0.12, 0.5, 0.12, 0xfcd9b6); b.geometry.translate(0, -0.22, 0); b.position.set(0, 1.22, z); g.add(b); return b; });
  g.userData = { piernas, brazos };
  return g;
}
function valla(alto, color) {
  const g = new THREE.Group();
  [-1, 1].forEach((s) => { const p = crea.caja(0.1, alto, 0.1, 0xe5e7eb); p.position.set(0, alto / 2, s * 1.1); g.add(p); });
  const barra = crea.caja(0.16, 0.22, 2.4, color); barra.position.y = alto - 0.11; g.add(barra);
  const raya = crea.caja(0.17, 0.08, 2.42, 0xffffff); raya.position.y = alto - 0.11; g.add(raya);
  return g;
}
function Saltar({ semilla, alTerminar }) {
  const ref = useRef(null); const [m, setM] = useState(0); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla);
    const pista = crea.caja(800, 0.3, 3, 0xc2410c, { roughness: 0.85 }); pista.position.set(390, -0.15, 0); scene.add(pista);
    [-1.45, 1.45].forEach((z) => { const l = crea.caja(800, 0.02, 0.08, 0xffffff); l.position.set(390, 0.01, z); scene.add(l); });
    const cesped = crea.suelo(820, 60, 0x15803d, { celda: 2, contraste: 0.04, lineas: false }); cesped.position.set(390, -0.29, 0); scene.add(cesped);
    for (let k = 0; k < 80; k++) { const linea = crea.caja(0.12, 0.012, 3, 0xffffff); linea.position.set(k * 10, 0.006, 0); scene.add(linea); }
    // Grada al fondo
    for (let x = -10; x < 800; x += 6) { const g = crea.caja(6, 1.6, 2, r.de([0x1e3a8a, 0x1d4ed8, 0x2563eb])); g.position.set(x, 0.5, -6); scene.add(g); }
    const obs = []; let x = 16;
    for (let i = 0; i < 70; i++) { const alto = r.entre(0.55, 1.12); const o = valla(alto, r.de([0xdb2777, 0x0ea5e9, 0x16a34a, 0xf59e0b])); o.position.set(x, 0, 0); scene.add(o); obs.push({ o, x, alto, ancho: 0.4 }); x += r.entre(7, 12) + i * 0.08; }
    const jugador = corredor(); jugador.rotation.y = Math.PI / 2; scene.add(jugador);
    const st = { x: 0, y: 0, vy: 0, vel: 7, t: 0, fin: false, fase: 0 };
    const saltar = () => { if (st.fin || st.y > 0.02) return; st.vy = 10.5; sonar('toque', { minimo: 0 }); };
    return {
      toque: saltar,
      frame(dt) {
        if (!st.fin) {
          st.t += dt; st.vel = Math.min(15, 7 + st.t * 0.15); st.x += st.vel * dt;
          st.vy -= 28 * dt; st.y += st.vy * dt; if (st.y <= 0) { st.y = 0; st.vy = 0; }
          const choque = obs.find((o) => Math.abs(o.x - st.x) < o.ancho / 2 + 0.28 && st.y < o.alto - 0.08);
          if (choque) { st.fin = true; vibrar(150); sonar('fallo'); ctx.temblor(0.5); ctx.chispas(new THREE.Vector3(st.x + 0.3, choque.alto, 0), 0xffffff, 24); choque.o.rotation.z = -1.2; jugador.rotation.z = 1.2; setMsg('💥 ¡Choque!'); setTimeout(() => alTerminar(Math.floor(st.x)), 900); }
          if (st.t >= 60) { st.fin = true; alTerminar(Math.floor(st.x)); }
          st.fase += st.vel * dt * 1.6;
        }
        jugador.position.set(st.x, st.y, 0);
        const aire = st.y > 0.02; const { piernas, brazos } = jugador.userData;
        piernas[0].rotation.z = aire ? 0.9 : Math.sin(st.fase) * 0.9; piernas[1].rotation.z = aire ? -0.5 : -Math.sin(st.fase) * 0.9;
        brazos[0].rotation.z = aire ? -1.6 : -Math.sin(st.fase) * 0.8; brazos[1].rotation.z = aire ? 1.2 : Math.sin(st.fase) * 0.8;
        // Cámara por detrás y algo de lado: la pista se ve de frente y las vallas llegan con tiempo (vale para móvil)
        const k = ctx.ancho(1);
        camera.position.set(st.x - 4.6 - k, 2.6 + k * 0.5, 2.4 + k * 0.4); camera.lookAt(st.x + 7, 0.7, -0.2);
        ctx.seguirSol(st.x, 0);
        setM((v) => (v !== Math.floor(st.x) ? Math.floor(st.x) : v));
      }
    };
  }, { cielo: [0x38bdf8, 0xfef3c7], niebla: 70 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🏃 ${m} m`} der="Toca para saltar" /><Mensaje texto={msg} tipo="mal" /></div>;
}

/* ───────── Lluvia de meteoritos ───────── */
function Meteoritos({ semilla, alTerminar }) {
  const ref = useRef(null); const [t, setT] = useState(0); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene } = ctx; const r = rng(semilla);
    const suelo = crea.caja(12, 0.6, 4, 0xb45309, { roughness: 0.95 }); suelo.position.y = -0.3; scene.add(suelo);
    const borde = crea.marco(12, 4, 0xfb923c, { intensidad: 0.6 }); borde.position.y = 0.02; scene.add(borde);
    const roca = crea.suelo(60, 40, 0x7c2d12, { celda: 3, contraste: 0.03, lineas: false }); roca.position.y = -0.6; scene.add(roca);
    for (let i = 0; i < 12; i++) { const p = new THREE.Mesh(new THREE.DodecahedronGeometry(r.entre(0.25, 0.6), 0), mat(0x78350f, { roughness: 1, flatShading: true })); p.castShadow = true; p.position.set(r.entre(-6, 6), -0.05, r.entre(-1.8, 1.8) - (r() < 0.5 ? 3 : -3)); scene.add(p); }
    const estrellas = new THREE.Group(); for (let i = 0; i < 200; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(r.entre(0.03, 0.08), 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff })); s.position.set(r.entre(-40, 40), r.entre(2, 40), r.entre(-40, -15)); estrellas.add(s); } scene.add(estrellas);
    const planeta = new THREE.Mesh(new THREE.SphereGeometry(4, 32, 24), new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.7, emissive: 0x4c1d95, emissiveIntensity: 0.3 })); planeta.position.set(9, 12, -30); scene.add(planeta);
    // Nave del jugador
    const nave = new THREE.Group();
    const cuerpo = crea.caja(0.9, 0.5, 0.9, 0x22d3ee, { metalness: 0.5, roughness: 0.2 }); cuerpo.position.y = 0.4; nave.add(cuerpo);
    const cupula = crea.esfera(0.32, 0xe0f2fe, { roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.85 }); cupula.position.y = 0.75; nave.add(cupula);
    const luzNave = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.04, 8, 24), crea.neon(0x22d3ee, 2)); luzNave.rotation.x = Math.PI / 2; luzNave.position.y = 0.17; nave.add(luzNave);
    nave.scale.setScalar(1.35); scene.add(nave);
    const st = { t: 0, x: 0, obj: 0, prox: 0.6, met: [], fin: false, ini: null };
    ctx.encuadrar({ centro: [0, 2, 0], ancho: 11, alto: 9, desde: [0, 0.38, 1] });
    return {
      // Arrastre relativo: mueve la nave lo mismo que el dedo (en cualquier parte de la pantalla)
      toque(e) { st.ini = { x: e.clientX, obj: st.obj }; },
      mover(e) { if (!st.ini) return; const rr = ctx.el.getBoundingClientRect(); st.obj = Math.max(-5, Math.min(5, st.ini.obj + ((e.clientX - st.ini.x) / rr.width) * 13)); },
      soltar() { st.ini = null; },
      frame(dt, tt) {
        estrellas.rotation.z = tt * 0.004; planeta.rotation.y += dt * 0.1;
        if (st.fin) return;
        st.t += dt; st.prox -= dt;
        st.x += (st.obj - st.x) * Math.min(1, dt * 12); nave.position.x = st.x; nave.rotation.z = (st.x - st.obj) * 0.25; nave.position.y = Math.sin(tt * 4) * 0.05;
        if (st.prox <= 0) {
          const apunta = r() < 0.45 ? st.x + r.entre(-0.8, 0.8) : r.entre(-5, 5);
          const x = Math.max(-5.2, Math.min(5.2, apunta));
          const tam = r.entre(0.45, 0.7);
          const m = new THREE.Group(); const piedra = new THREE.Mesh(new THREE.IcosahedronGeometry(tam, 1), new THREE.MeshStandardMaterial({ color: 0x7c2d12, emissive: 0xf97316, emissiveIntensity: 0.9, roughness: 0.8, flatShading: true })); m.add(piedra); m.userData.piedra = piedra;
          m.position.set(x, 16, 0); scene.add(m);
          const estela = new THREE.Mesh(new THREE.ConeGeometry(tam * 0.9, tam * 5, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xfb923c, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending })); estela.position.y = tam * 2.5; m.add(estela);
          const aviso = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.78, 32), new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false })); aviso.rotation.x = -Math.PI / 2; aviso.position.set(x, 0.03, 0); scene.add(aviso);
          st.met.push({ m, aviso, x, vel: 9 + st.t * 0.25, tam });
          st.prox = Math.max(0.18, 0.62 - st.t * 0.011);
        }
        st.met.forEach((k) => { k.m.position.y -= k.vel * dt; k.m.userData.piedra.rotation.x += dt * 3; k.m.userData.piedra.rotation.z += dt * 2; k.aviso.scale.setScalar(1 - Math.min(0.6, k.m.position.y / 26)); k.aviso.material.opacity = 0.5 + Math.sin(tt * 18) * 0.35; });
        st.met.filter((k) => k.m.position.y <= 0.3).forEach((k) => {
          scene.remove(k.m); scene.remove(k.aviso);
          ctx.chispas(new THREE.Vector3(k.x, 0.3, 0), 0xfb923c, 18, { fuerza: 4 }); ctx.onda(new THREE.Vector3(k.x, 0.05, 0), 0xf97316, { radio: 1.6 });
          const crater = new THREE.Mesh(new THREE.CircleGeometry(0.5, 20), new THREE.MeshBasicMaterial({ color: 0x18181b, transparent: true, opacity: 0.6 })); crater.rotation.x = -Math.PI / 2; crater.position.set(k.x, 0.011, r.entre(-0.4, 0.4)); scene.add(crater);
          if (Math.abs(k.x - st.x) < 0.55 + k.tam * 0.5) { st.fin = true; vibrar(200); sonar('fallo'); ctx.temblor(0.6); ctx.chispas(nave.position.clone().setY(0.6), 0x22d3ee, 40, { fuerza: 6 }); nave.visible = false; setMsg('☄️ ¡Impacto!'); setTimeout(() => alTerminar(Math.round(st.t * 10) / 10), 900); }
          else ctx.temblor(0.08);
        });
        st.met = st.met.filter((k) => k.m.position.y > 0.3);
        if (!st.fin && st.t >= 45) { st.fin = true; alTerminar(45); }
        setT((v) => (Math.floor(v * 10) !== Math.floor(st.t * 10) ? st.t : v));
      }
    };
  }, { cielo: [0x1e1b4b, 0x7c2d12], niebla: false });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`☄️ ${t.toFixed(1).replace('.', ',')} s`} der="Arrastra para esquivar" /><Mensaje texto={msg} tipo="mal" /></div>;
}

/* ───────── Canasta (tirachinas con trayectoria) ───────── */
// Arrastra el dedo hacia ABAJO (como estirar un tirachinas): cuanto más largo, más fuerte; hacia los lados apuntas.
// Mientras apuntas se ve el principio de la trayectoria. Al soltar, lanza.
function Canasta({ alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ n: 0, t: 30, racha: 0 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx;
    const parquet = crea.suelo(16, 18, 0xd97706, { celda: 0.7, contraste: 0.05 }); parquet.position.set(0, 0, -3); scene.add(parquet);
    const linea = new THREE.Mesh(new THREE.RingGeometry(3.1, 3.2, 48, 1, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })); linea.rotation.x = -Math.PI / 2; linea.position.set(0, 0.01, -6); scene.add(linea);
    const pared = crea.caja(16, 9, 0.4, 0x1e3a8a, { roughness: 0.8 }); pared.position.set(0, 4.5, -8.2); scene.add(pared);
    const canasta = new THREE.Group();
    const poste = crea.cilindro(0.1, 0.12, 3.6, 0x334155, 12); poste.position.set(0, -1.6, -1.3); canasta.add(poste);
    const brazo = crea.caja(0.14, 0.14, 0.9, 0x334155); brazo.position.set(0, 0.1, -0.95); canasta.add(brazo);
    const tablero = crea.caja(2, 1.3, 0.08, 0xf8fafc, { roughness: 0.1, transparent: true, opacity: 0.92 }); tablero.position.set(0, 0.62, -0.55); canasta.add(tablero);
    const cuadro = crea.marco(0.62, 0.48, 0xef4444, { intensidad: 0.3, grosor: 0.04 }); cuadro.rotation.x = Math.PI / 2; cuadro.position.set(0, 0.4, -0.5); canasta.add(cuadro);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.035, 10, 40), mat(0xf97316, { metalness: 0.5, roughness: 0.3 })); aro.rotation.x = Math.PI / 2; aro.castShadow = true; canasta.add(aro);
    const red = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.3, 0.55, 16, 3, true), new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.8 })); red.position.y = -0.28; canasta.add(red);
    const AROY = 3.05; const AROZ = -5.2;
    canasta.position.set(0, AROY, AROZ); scene.add(canasta);
    const bola = crea.esfera(0.24, 0xea580c, { roughness: 0.6 }); scene.add(bola);
    const sombraBola = crea.sombraSuave(0.35); sombraBola.position.y = 0.012; scene.add(sombraBola);
    // Puntos de la trayectoria
    const puntos = Array.from({ length: 14 }, (_, i) => { const p = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 - i * 0.06 })); p.visible = false; scene.add(p); return p; });
    const INICIO = new THREE.Vector3(0, 1.2, 2.2); const G = 12;
    const st = { t: 0, n: 0, racha: 0, vuelo: false, p: INICIO.clone(), v: new THREE.Vector3(), ini: null, apunta: null, tv: 0, fin: false, encestado: false, tocoAro: false };
    bola.position.copy(st.p);
    const velDesde = (dx, dy, rr) => {
      // dy > 0: arrastre hacia abajo. Potencia según la longitud (relativa a la pantalla), dirección según dx.
      const pot = Math.min(1, Math.max(0, dy / (rr.height * 0.38)));
      const lado = Math.max(-1, Math.min(1, -dx / (rr.width * 0.5)));
      const v0 = 6.5 + pot * 5.5; const ang = THREE.MathUtils.degToRad(52);
      return new THREE.Vector3(lado * 3.2, Math.sin(ang) * v0, -Math.cos(ang) * v0);
    };
    const reset = () => { st.vuelo = false; st.p.copy(INICIO); bola.position.copy(st.p); st.encestado = false; st.tocoAro = false; };
    const k = () => ctx.ancho(0.75);
    return {
      toque(e) { if (!st.vuelo && !st.fin) st.ini = [e.clientX, e.clientY]; },
      mover(e) {
        if (!st.ini || st.vuelo) return; const rr = ctx.el.getBoundingClientRect();
        const dx = e.clientX - st.ini[0]; const dy = e.clientY - st.ini[1];
        if (dy < 12) { st.apunta = null; puntos.forEach((p) => { p.visible = false; }); return; }
        st.apunta = velDesde(dx, dy, rr);
        // Se enseña solo el principio de la curva (lo justo para apuntar)
        puntos.forEach((p, i) => { const tt = (i + 1) * 0.045; p.position.set(INICIO.x + st.apunta.x * tt, INICIO.y + st.apunta.y * tt - 0.5 * G * tt * tt, INICIO.z + st.apunta.z * tt); p.visible = true; });
        bola.position.set(INICIO.x - dx * 0.002, INICIO.y - Math.min(0.4, dy * 0.0015), INICIO.z + Math.min(0.5, dy * 0.002));
      },
      soltar() {
        puntos.forEach((p) => { p.visible = false; });
        if (!st.ini || st.vuelo) { st.ini = null; return; } st.ini = null;
        if (!st.apunta) { bola.position.copy(INICIO); return; }
        st.v.copy(st.apunta); st.apunta = null; st.p.copy(INICIO); st.vuelo = true; st.tv = 0; sonar('toque', { minimo: 0 });
      },
      frame(dt, tt) {
        if (!st.fin) st.t += dt;
        canasta.position.x = st.t > 10 ? Math.sin((st.t - 10) * 1.1) * 1.6 : 0;
        if (st.vuelo) {
          st.tv += dt; const yAntes = st.p.y;
          st.v.y -= G * dt; st.p.addScaledVector(st.v, dt); bola.rotation.x -= dt * 10;
          const c = canasta.position;
          // Rebote en el aro (contra el tubo del aro)
          const dxz = Math.hypot(st.p.x - c.x, st.p.z - c.z); const dAro = Math.hypot(dxz - 0.46, st.p.y - c.y);
          if (dAro < 0.27 && !st.encestado) {
            const n = new THREE.Vector3(st.p.x - c.x, 0, st.p.z - c.z).normalize().multiplyScalar(dxz > 0.46 ? 1 : -1); n.y = (st.p.y - c.y) / Math.max(0.01, dAro); n.normalize();
            const vn = st.v.dot(n); if (vn < 0) { st.v.addScaledVector(n, -1.6 * vn); st.v.multiplyScalar(0.75); st.tocoAro = true; sonar('tic', { minimo: 0, vibrar: false }); }
          }
          // Rebote en el tablero
          if (st.p.z < c.z - 0.47 && st.p.z > c.z - 0.75 && Math.abs(st.p.x - c.x) < 1 && st.p.y > c.y - 0.05 && st.p.y < c.y + 1.3 && st.v.z < 0) { st.v.z = -st.v.z * 0.55; st.p.z = c.z - 0.47; sonar('tic', { minimo: 0, vibrar: false }); }
          // Canasta: cruza la altura del aro bajando y por dentro
          if (!st.encestado && yAntes > c.y && st.p.y <= c.y && st.v.y < 0 && dxz < 0.4) {
            st.encestado = true; st.n++; st.racha++; sonar('victoria'); ctx.chispas(new THREE.Vector3(c.x, c.y, c.z), 0xfacc15, 30, { fuerza: 4 });
            red.scale.y = 1.4; setMsg(st.tocoAro ? '🏀 ¡Canasta!' : st.racha > 1 ? `🔥 ¡Limpia! ×${st.racha}` : '✨ ¡Limpia!'); setTimeout(() => setMsg(null), 650);
          }
          if (st.p.y < 0.24) { st.p.y = 0.24; st.v.y = Math.abs(st.v.y) * 0.45; st.v.x *= 0.8; st.v.z *= 0.8; }
          bola.position.copy(st.p);
          if (st.tv > 2.6) { if (!st.encestado) st.racha = 0; reset(); }
        }
        red.scale.y += (1 - red.scale.y) * Math.min(1, dt * 6);
        sombraBola.position.set(bola.position.x, 0.012, bola.position.z); sombraBola.scale.setScalar(Math.max(0.4, 1.4 - bola.position.y * 0.2));
        const kk = k(); camera.position.set(0, 2.2 + kk * 0.5, 5.2 * kk); camera.lookAt(0, 2.2, -3.5);
        void tt;
        if (!st.fin && st.t >= 30) { st.fin = true; alTerminar(st.n); }
        setHud((h) => (h.n !== st.n || h.t !== Math.ceil(30 - st.t) || h.racha !== st.racha ? { n: st.n, t: Math.max(0, Math.ceil(30 - st.t)), racha: st.racha } : h));
      }
    };
  }, { cielo: [0x1e40af, 0x0f172a], niebla: 40 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🏀 ${hud.n} canastas`} centro={hud.racha > 1 ? `🔥 ×${hud.racha}` : null} der={`⏱️ ${hud.t}s`} /><Mensaje texto={msg} /><p className="hb-pista">Arrastra hacia abajo para tensar y suelta para lanzar</p></div>;
}

/* ───────── Al ritmo ───────── */
function Ritmo({ semilla, alTerminar }) {
  const ref = useRef(null); const ctl = useRef({}); const [hud, setHud] = useState({ pts: 0, t: 30, combo: 0 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene } = ctx; const r = rng(semilla); const V = 9; const COL = [0xec4899, 0x22d3ee, 0xfacc15];
    const fondo = crea.caja(7, 0.1, 40, 0x0b0b1f, { roughness: 0.2, metalness: 0.6 }); fondo.position.set(0, -0.12, -14); scene.add(fondo);
    const metas = COL.map((c, i) => {
      const carril = crea.caja(1.6, 0.06, 36, 0x111827, { roughness: 0.3, metalness: 0.4 }); carril.position.set((i - 1) * 1.8, -0.05, -14); scene.add(carril);
      [-0.82, 0.82].forEach((d) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 36), crea.neon(c, 0.8)); b.position.set((i - 1) * 1.8 + d, 0, -14); scene.add(b); });
      const meta = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.07, 10, 40), crea.neon(c, 1.2)); meta.rotation.x = -Math.PI / 2; meta.position.set((i - 1) * 1.8, 0.05, 0); scene.add(meta);
      return meta;
    });
    const notas = []; let t = 1.2;
    while (t < 28.5) { const carril = r.entero(0, 2); const m = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 16), new THREE.MeshStandardMaterial({ color: COL[carril], emissive: COL[carril], emissiveIntensity: 0.8, roughness: 0.2 })); scene.add(m); notas.push({ t, carril, m, hecha: false }); t += r.entre(0.32, 0.8) * Math.max(0.6, 1 - t * 0.012); }
    const st = { t: 0, pts: 0, combo: 0, fin: false, pulso: [0, 0, 0] };
    ctl.current.pulsar = (carril) => {
      if (st.fin) return;
      st.pulso[carril] = 1;
      const cand = notas.filter((n) => !n.hecha && n.carril === carril && Math.abs(n.t - st.t) < 0.16).sort((a, b) => Math.abs(a.t - st.t) - Math.abs(b.t - st.t))[0];
      if (!cand) { st.pts = Math.max(0, st.pts - 1); st.combo = 0; setMsg('✗'); return; }
      const d = Math.abs(cand.t - st.t); const p = d < 0.06 ? 3 : 1; st.combo++; const extra = st.combo >= 10 ? 1 : 0; st.pts += p + extra; cand.hecha = true; scene.remove(cand.m);
      ctx.chispas(new THREE.Vector3((carril - 1) * 1.8, 0.4, 0), COL[carril], p === 3 ? 22 : 10, { fuerza: 4 }); ctx.onda(new THREE.Vector3((carril - 1) * 1.8, 0.06, 0), COL[carril], { radio: 1.3 });
      setMsg(p === 3 ? '¡Perfecto! +3' : '¡Bien! +1'); sonar('tic', { minimo: 0, vibrar: false }); vibrar(10);
    };
    ctx.encuadrar({ centro: [0, 0, -5], ancho: 6.2, alto: 13, desde: [0, 0.55, 1] });
    return {
      frame(dt) {
        metas.forEach((m, i) => { st.pulso[i] = Math.max(0, st.pulso[i] - dt * 5); m.scale.setScalar(1 + st.pulso[i] * 0.25); m.material.emissiveIntensity = 1.2 + st.pulso[i] * 2; });
        if (st.fin) return;
        st.t += dt;
        notas.forEach((n) => {
          if (n.hecha) return;
          n.m.position.set((n.carril - 1) * 1.8, 0.42, -(n.t - st.t) * V);
          if (st.t - n.t > 0.2) { n.hecha = true; scene.remove(n.m); st.combo = 0; }
        });
        if (st.t >= 30) { st.fin = true; alTerminar(st.pts); }
        setHud((h) => (h.pts !== st.pts || h.t !== Math.ceil(30 - st.t) || h.combo !== st.combo ? { pts: st.pts, t: Math.max(0, Math.ceil(30 - st.t)), combo: st.combo } : h));
      }
    };
  }, { cielo: [0x312e81, 0x050314], niebla: 70 });
  return (
    <div className="hb-caja">
      <div ref={ref} className="hb-lienzo" /><Hud izq={`🎵 ${hud.pts} pts`} centro={hud.combo >= 5 ? `Combo ×${hud.combo}` : null} der={`⏱️ ${hud.t}s`} /><Mensaje texto={msg} />
      <div className="hb-carriles">{['#ec4899', '#22d3ee', '#facc15'].map((c, i) => <button key={c} type="button" style={{ '--c': c }} onPointerDown={(e) => { e.preventDefault(); ctl.current.pulsar?.(i); }} aria-label={`Carril ${i + 1}`} />)}</div>
    </div>
  );
}

export default [
  { id: 'parejas', nombre: 'Parejas', emoji: '🃏', como: 'Da la vuelta a las fichas de dos en dos y encuentra las 8 parejas lo más rápido posible.', mejor: 'menos', unidad: 's', peor: 114, duracion: 90, C: Parejas, formato: (v) => `${v.toFixed(1).replace('.', ',')} s` },
  { id: 'saltar', nombre: 'Salta obstáculos', emoji: '🏃', como: 'Corres solo y cada vez más rápido: toca la pantalla para saltar las vallas. Llega lo más lejos posible.', mejor: 'mas', unidad: 'm', duracion: 60, C: Saltar },
  { id: 'meteoritos', nombre: 'Lluvia de meteoritos', emoji: '☄️', como: 'Arrastra el dedo a izquierda o derecha (en cualquier parte de la pantalla) para mover tu nave y esquivar los meteoritos. El círculo rojo marca dónde caen. Aguanta 45 segundos.', mejor: 'mas', unidad: 's', duracion: 45, C: Meteoritos, formato: (v) => `${v.toFixed(1).replace('.', ',')} s` },
  { id: 'canasta', nombre: 'Canasta', emoji: '🏀', como: 'Como un tirachinas: arrastra el dedo hacia abajo para tensar (más largo, más fuerte) y hacia los lados para apuntar. Verás por dónde irá la bola. Suelta para lanzar. A los 10 segundos la canasta empieza a moverse.', mejor: 'mas', unidad: 'canastas', duracion: 30, C: Canasta },
  { id: 'ritmo', nombre: 'Al ritmo', emoji: '🎵', como: 'Pulsa el botón del color justo cuando la bola llega al aro. En el momento exacto: +3; casi: +1; si pulsas sin nota, −1. Con racha de 10, punto extra.', mejor: 'mas', unidad: 'pts', duracion: 30, C: Ritmo }
];
