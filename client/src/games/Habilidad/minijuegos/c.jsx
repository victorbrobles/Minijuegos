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
    const LARGO = 1300;
    const pista = crea.caja(LARGO, 0.3, 3, 0xc2410c, { roughness: 0.85 }); pista.position.set(LARGO / 2 - 10, -0.15, 0); scene.add(pista);
    [-1.45, 1.45].forEach((z) => { const l = crea.caja(LARGO, 0.02, 0.08, 0xffffff); l.position.set(LARGO / 2 - 10, 0.01, z); scene.add(l); });
    const cesped = crea.suelo(LARGO + 20, 60, 0x15803d, { celda: 2, contraste: 0.04, lineas: false }); cesped.position.set(LARGO / 2 - 10, -0.29, 0); scene.add(cesped);
    for (let k = 0; k < LARGO / 10; k++) { const linea = crea.caja(0.12, 0.012, 3, 0xffffff); linea.position.set(k * 10, 0.006, 0); scene.add(linea); }
    // Grada al fondo
    for (let x = -10; x < LARGO; x += 6) { const g = crea.caja(6, 1.6, 2, r.de([0x1e3a8a, 0x1d4ed8, 0x2563eb])); g.position.set(x, 0.5, -6); scene.add(g); }
    // Obstáculos generados sobre la marcha según la velocidad (cada vez más rápida):
    //  · vallas: hay que saltarlas (el salto es corto, así que hay que calcular bien el momento);
    //  · pájaros a la altura de la cabeza al saltar: NO hay que saltar (y a veces vienen justo detrás de una valla).
    // Las combinaciones se van endureciendo: dobles, triples y valla + pájaro. Aguantar los 60 s es muy difícil.
    const VY = 9.2; const G = 34; const AIRE = (2 * VY) / G; // ~0,54 s en el aire, salto de ~1,25 m
    const obs = []; let sigX = 14;
    const ponerValla = (x, dif) => { const alto = r.entre(0.6, 0.78 + dif * 0.3); const o = valla(alto, r.de([0xdb2777, 0x0ea5e9, 0x16a34a, 0xf59e0b])); o.position.set(x, 0, 0); scene.add(o); obs.push({ o, x, abajo: 0, arriba: alto, ancho: 0.4 }); };
    const ponerPajaro = (x) => {
      const g = new THREE.Group(); const cuerpo = crea.esfera(0.24, 0x1f2937); cuerpo.scale.set(1.5, 0.9, 0.9); g.add(cuerpo);
      const pico = crea.cilindro(0, 0.08, 0.22, 0xf59e0b, 8); pico.rotation.z = Math.PI / 2; pico.position.x = -0.42; g.add(pico);
      const alas = [-1, 1].map((s2) => { const a = crea.caja(0.36, 0.04, 0.5, 0x374151); a.position.set(0, 0.05, s2 * 0.32); g.add(a); return a; });
      const y = r.entre(2.0, 2.25); g.position.set(x, y, 0); scene.add(g); obs.push({ o: g, x, abajo: y - 0.22, arriba: y + 0.22, ancho: 0.6, alas, pajaro: true });
    };
    const generar = (hasta, v, t) => {
      while (sigX < hasta) {
        const dif = Math.min(1, 0.35 + t / 35); // ya exigente al empezar → al máximo a los 23 s
        const tipo = r();
        let x = sigX;
        if (tipo < 0.12 + dif * 0.18) {
          // Pájaro: hay que quedarse en el suelo (a veces con una valla justo antes o después)
          ponerPajaro(x);
          if (r() < 0.25 + dif * 0.45) { x += v * r.entre(AIRE * 0.75, AIRE * 1.1); ponerValla(x, dif); }
        } else {
          ponerValla(x, dif);
          // Serie: la siguiente valla justo donde se aterriza (hay que volver a saltar al instante)
          const serie = r() < 0.2 + dif * 0.6 ? r.entero(1, dif > 0.5 ? 3 : 1) : 0;
          for (let k = 0; k < serie; k++) { x += v * (AIRE + r.entre(0.05, 0.16)); ponerValla(x, dif); }
          // …o un pájaro justo detrás: si saltas tarde, te lo comes
          if (r() < dif * 0.35) { x += v * r.entre(AIRE * 0.95, AIRE * 1.2); ponerPajaro(x); }
        }
        // Sin tramos largos: la siguiente siempre llega enseguida (entre 0,8 y 1,2 s de carrera como mucho)
        sigX = x + v * r.entre(AIRE + 0.18 + (1 - dif) * 0.25, AIRE + 0.4 + (1 - dif) * 0.3);
      }
    };
    const jugador = corredor(); jugador.rotation.y = Math.PI / 2; scene.add(jugador);
    const st = { x: 0, y: 0, vy: 0, vel: 11, t: 0, fin: false, fase: 0 };
    const saltar = () => { if (st.fin || st.y > 0.02) return; st.vy = VY; sonar('toque', { minimo: 0 }); };
    const tecla = (e) => { if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); saltar(); } };
    window.addEventListener('keydown', tecla);
    return {
      fin: () => window.removeEventListener('keydown', tecla),
      toque: saltar,
      frame(dt, tt) {
        obs.forEach((o) => { if (o.alas) o.alas.forEach((a, k) => { a.rotation.x = Math.sin(tt * 14 + k * Math.PI) * 0.6; }); });
        if (!st.fin) {
          st.t += dt; st.vel = Math.min(27, 11 + st.t * 0.45); st.x += st.vel * dt;
          generar(st.x + 70, st.vel, st.t);
          for (let i = obs.length - 1; i >= 0; i--) if (obs[i].x < st.x - 15) { scene.remove(obs[i].o); obs.splice(i, 1); }
          st.vy -= G * dt; st.y += st.vy * dt; if (st.y <= 0) { st.y = 0; st.vy = 0; }
          // El corredor ocupa de st.y a st.y + 1,7 m
          const choque = obs.find((o) => Math.abs(o.x - st.x) < o.ancho / 2 + 0.25 && st.y < o.arriba - 0.03 && st.y + 1.7 > o.abajo);
          if (choque) { st.fin = true; vibrar(150); sonar('fallo'); ctx.temblor(0.5); ctx.chispas(new THREE.Vector3(st.x + 0.3, choque.arriba, 0), 0xffffff, 24); choque.o.rotation.z = -1.2; jugador.rotation.z = 1.2; setMsg('💥 ¡Choque!'); setTimeout(() => alTerminar(Math.floor(st.x)), 900); }
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
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🏃 ${m} m`} der="Salta vallas · no saltes pájaros" /><Mensaje texto={msg} tipo="mal" /></div>;
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

/* ───────── Canasta (solo fuerza) ───────── */
// Desliza hacia arriba para tirar: el tiro va siempre recto a la canasta (que no se mueve) y lo único que cuenta es la
// FUERZA, según el largo del gesto. Si fallas, repites desde el mismo sitio; si entra, la bola aparece en otro sitio
// (más cerca o más lejos), así que la fuerza necesaria cambia. Triple tras 6,75 m, +1 si es limpia, x2 en racha.
function Canasta({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ pts: 0, t: 45, racha: 0, triple: false, dist: 0 }); const [msg, setMsg] = useState(null);
  const [carga, setCarga] = useState(null); // { pot } mientras se arrastra (barra de fuerza)
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla); const TIEMPO = 45; const G = 9.8;
    const H = new THREE.Vector3(0, 3.05, 0); // centro del aro
    // Pabellón: parqué, líneas, zona, pared con público y focos
    const parquet = crea.suelo(18, 16, 0xd97706, { celda: 0.6, contraste: 0.05 }); parquet.position.set(0, 0, 5); scene.add(parquet);
    const blanco = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const arco = new THREE.Mesh(new THREE.RingGeometry(6.7, 6.8, 80, 1, 0, Math.PI), blanco); arco.rotation.x = -Math.PI / 2; arco.rotation.z = Math.PI; arco.position.set(0, 0.012, 0); scene.add(arco);
    const zona = new THREE.Mesh(new THREE.PlaneGeometry(4.9, 5.8), new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.7 })); zona.rotation.x = -Math.PI / 2; zona.position.set(0, 0.008, 2.9); scene.add(zona);
    const tiro = new THREE.Mesh(new THREE.RingGeometry(1.75, 1.85, 48, 1, 0, Math.PI), blanco); tiro.rotation.x = -Math.PI / 2; tiro.position.set(0, 0.014, 5.8); scene.add(tiro);
    const fondo = crea.caja(30, 12, 0.4, 0x0f172a); fondo.position.set(0, 6, -3.2); scene.add(fondo);
    const publico = new THREE.InstancedMesh(new THREE.SphereGeometry(0.15, 8, 6), new THREE.MeshStandardMaterial({ roughness: 0.6 }), 900);
    { const m4 = new THREE.Matrix4(); const c = new THREE.Color(); let n = 0; for (let f = 0; f < 10; f++) for (let x = -13; x <= 13 && n < 900; x += 0.42) { m4.makeTranslation(x + r.entre(-0.08, 0.08), 1.4 + f * 0.48, -2.9); publico.setMatrixAt(n, m4); publico.setColorAt(n, c.setHex(r.de([0xef4444, 0x3b82f6, 0xfacc15, 0xffffff, 0x22c55e, 0xf97316]))); n++; } publico.count = n; }
    scene.add(publico);
    [-7, 7].forEach((x) => { const l = new THREE.SpotLight(0xffffff, 50, 30, 0.5, 0.5); l.position.set(x, 11, 6); l.target.position.set(0, 2, 0); scene.add(l, l.target); });
    // Canasta: poste, brazo, tablero con cuadro, aro y red
    const canasta = new THREE.Group();
    const poste = crea.cilindro(0.12, 0.14, 3.9, 0x334155, 12); poste.position.set(0, -1.1, -1.5); canasta.add(poste);
    const brazo = crea.caja(0.14, 0.14, 1.1, 0x334155); brazo.position.set(0, 0.7, -1); canasta.add(brazo);
    const tablero = crea.caja(1.8, 1.05, 0.06, 0xf8fafc, { roughness: 0.1, transparent: true, opacity: 0.9 }); tablero.position.set(0, 0.55, -0.42); canasta.add(tablero);
    const cuadro = crea.marco(0.59, 0.45, 0xef4444, { intensidad: 0.4, grosor: 0.05 }); cuadro.rotation.x = Math.PI / 2; cuadro.position.set(0, 0.33, -0.38); canasta.add(cuadro);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.02, 10, 40), new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.5, roughness: 0.3, emissive: 0x7c2d12, emissiveIntensity: 0.3 })); aro.rotation.x = Math.PI / 2; canasta.add(aro);
    const red = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.15, 0.42, 16, 3, true), new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.85 })); red.position.y = -0.21; canasta.add(red);
    canasta.position.copy(H); scene.add(canasta);
    const R_ARO = 0.23; const R_BOLA = 0.12; const TABLERO_Z = H.z - 0.39;
    // Sitios de tiro: distancia (m) y ángulo respecto al frente de la canasta
    const puesto = { d: 3.2, ang: 0, pos: new THREE.Vector3() };
    const nuevoPuesto = (primero) => {
      if (primero) { puesto.d = 3.2; puesto.ang = 0; } else {
        let d; let a; do { d = r.entre(2.8, 7.6); a = r.entre(-1.15, 1.15); } while (Math.abs(d - puesto.d) < 0.8 && Math.abs(a - puesto.ang) < 0.3);
        puesto.d = d; puesto.ang = a;
      }
      puesto.pos.set(Math.sin(puesto.ang) * puesto.d, 0, Math.cos(puesto.ang) * puesto.d);
      marca.position.set(puesto.pos.x, 0.02, puesto.pos.z); ctx.onda(marca.position.clone(), 0xfacc15, { radio: 1 });
      setHud((h) => ({ ...h, triple: puesto.d > 6.75, dist: puesto.d }));
    };
    const marca = new THREE.Mesh(new THREE.RingGeometry(0.32, 0.4, 32), new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide })); marca.rotation.x = -Math.PI / 2; scene.add(marca);
    // Bolas: la de la mano y las que vuelan
    const texBalon = (() => { const c = document.createElement('canvas'); c.width = 128; c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#ea580c'; x.fillRect(0, 0, 128, 64); x.strokeStyle = '#1c1917'; x.lineWidth = 3; [[0, 32, 128, 32], [64, 0, 64, 64]].forEach(([a, b, cc, d]) => { x.beginPath(); x.moveTo(a, b); x.lineTo(cc, d); x.stroke(); }); x.beginPath(); x.arc(0, 32, 30, -1.2, 1.2); x.stroke(); x.beginPath(); x.arc(128, 32, 30, Math.PI - 1.2, Math.PI + 1.2); x.stroke(); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
    const matBalon = new THREE.MeshStandardMaterial({ map: texBalon, roughness: 0.65 });
    const matFuego = new THREE.MeshStandardMaterial({ map: texBalon, roughness: 0.4, emissive: 0xf97316, emissiveIntensity: 0.9 });
    const balon = () => { const m = new THREE.Mesh(new THREE.SphereGeometry(R_BOLA, 24, 16), matBalon); m.castShadow = true; scene.add(m); return m; };
    const st = { t: 0, pts: 0, racha: 0, mano: null, vuelo: [], ini: null, fin: false, enfriar: 0 };
    const salida = () => { const dir = H.clone().sub(puesto.pos).setY(0).normalize(); return puesto.pos.clone().addScaledVector(dir, 0.35).setY(2.05); };
    const enMano = () => { st.mano = balon(); st.mano.material = st.racha >= 3 ? matFuego : matBalon; st.mano.position.copy(salida()); };
    nuevoPuesto(true); enMano();
    const cam = { p: new THREE.Vector3(), mira: new THREE.Vector3() };
    const camDestino = () => { const dir = puesto.pos.clone().setY(0).normalize(); const k = ctx.ancho(0.75); return { p: puesto.pos.clone().addScaledVector(dir, 3.4 * k).setY(3.1 + 0.4 * k), mira: H.clone().setY(2.2) }; };
    { const d = camDestino(); cam.p.copy(d.p); cam.mira.copy(d.mira); }
    // Gesto → velocidad. Fuerza: largo del deslizamiento respecto a la pantalla. Dirección: su inclinación.
    const velDe = (dx, dy, rr) => {
      const pot = Math.min(1, Math.max(0, dy / (rr.height * 0.5)));
      const v0 = 5.5 + pot * 5; const elev = THREE.MathUtils.degToRad(62); // tiro con buena parábola (entra desde arriba)
      const dir = H.clone().sub(puesto.pos).setY(0).normalize(); void dx; // siempre recto: solo cuenta la fuerza
      return { v: new THREE.Vector3(dir.x * Math.cos(elev) * v0, Math.sin(elev) * v0, dir.z * Math.cos(elev) * v0), pot };
    };
    const lanzar = (v) => {
      const b = { m: st.mano, p: st.mano.position.clone(), v, tv: 0, aro: false, dentro: false, fuego: st.racha >= 3 };
      st.vuelo.push(b); st.mano = null; st.enfriar = 0.35; sonar('toque', { minimo: 0 });
    };
    const anotar = (b) => {
      const triple = puesto.d > 6.75; let p = triple ? 3 : 2; const limpia = !b.aro; if (limpia) p += 1;
      if (b.fuego) p *= 2;
      st.pts += p; st.racha += 1; sonar('victoria'); red.scale.y = 1.5;
      ctx.chispas(H.clone(), b.fuego ? 0xf97316 : 0xfacc15, b.fuego ? 50 : 28, { fuerza: 4 });
      setMsg(`${triple ? '🎯 ¡Triple!' : '🏀 ¡Canasta!'}${limpia ? ' Limpia' : ''} +${p}${b.fuego ? ' 🔥' : ''}`); setTimeout(() => setMsg(null), 800);
      if (st.racha === 3) { setMsg('🔥 ¡En racha! Puntos dobles'); setTimeout(() => setMsg(null), 900); }
      nuevoPuesto(false);
    };
    return {
      toque(e) { if (!st.fin && st.mano) st.ini = [e.clientX, e.clientY]; },
      mover(e) {
        if (!st.ini || !st.mano) return; const rr = ctx.el.getBoundingClientRect();
        const dx = e.clientX - st.ini[0]; const dy = st.ini[1] - e.clientY;
        if (dy < 10) { setCarga(null); return; }
        const { pot } = velDe(dx, dy, rr); setCarga({ pot });
        st.mano.position.copy(salida()).add(new THREE.Vector3(0, -0.25 * pot, 0));
      },
      soltar(e) {
        setCarga(null);
        if (!st.ini || !st.mano) { st.ini = null; return; }
        const rr = ctx.el.getBoundingClientRect(); const dx = e.clientX - st.ini[0]; const dy = st.ini[1] - e.clientY; st.ini = null;
        st.mano.position.copy(salida());
        if (dy < 25 || st.fin) return;
        lanzar(velDe(dx, dy, rr).v);
      },
      frame(dt) {
        if (!st.fin) st.t += dt;
        if (!st.mano && !st.fin) { st.enfriar -= dt; if (st.enfriar <= 0) enMano(); }
        for (let i = st.vuelo.length - 1; i >= 0; i--) {
          const b = st.vuelo[i]; b.tv += dt;
          for (let k = 0; k < 3; k++) { // subpasos: colisiones más fiables
            const h = dt / 3; const yAntes = b.p.y;
            b.v.y -= G * h; b.p.addScaledVector(b.v, h);
            // Aro (toro): distancia al anillo
            const dxz = Math.hypot(b.p.x - H.x, b.p.z - H.z); const dAro = Math.hypot(dxz - R_ARO, b.p.y - H.y);
            if (dAro < R_BOLA + 0.02) {
              const n = new THREE.Vector3(b.p.x - H.x, 0, b.p.z - H.z).normalize().multiplyScalar(dxz > R_ARO ? 1 : -1); n.y = (b.p.y - H.y) / Math.max(0.01, dAro); n.normalize();
              const vn = b.v.dot(n); if (vn < 0) { b.v.addScaledVector(n, -1.55 * vn); b.v.multiplyScalar(0.8); b.aro = true; sonar('tic', { minimo: 0, vibrar: false }); }
              b.p.copy(new THREE.Vector3(H.x, H.y, H.z).add(new THREE.Vector3((b.p.x - H.x) / dxz * R_ARO, 0, (b.p.z - H.z) / dxz * R_ARO)).addScaledVector(n, R_BOLA + 0.021));
            }
            // Tablero
            if (b.v.z < 0 && b.p.z - R_BOLA < TABLERO_Z && b.p.z > TABLERO_Z - 0.2 && Math.abs(b.p.x - H.x) < 0.9 && b.p.y > H.y + 0.02 && b.p.y < H.y + 1.08) { b.v.z = -b.v.z * 0.6; b.p.z = TABLERO_Z + R_BOLA; b.aro = b.aro || false; sonar('tic', { minimo: 0, vibrar: false }); }
            // Canasta: cruza la altura del aro hacia abajo por dentro
            if (!b.dentro && yAntes > H.y && b.p.y <= H.y && b.v.y < 0 && Math.hypot(b.p.x - H.x, b.p.z - H.z) < R_ARO - R_BOLA * 0.6) { b.dentro = true; if (!st.fin) anotar(b); b.v.x *= 0.3; b.v.z *= 0.3; }
            // Suelo
            if (b.p.y < R_BOLA) { b.p.y = R_BOLA; b.v.y = Math.abs(b.v.y) * 0.55; b.v.x *= 0.8; b.v.z *= 0.8; }
          }
          b.m.position.copy(b.p); b.m.rotation.x -= dt * 9;
          if (b.tv > 2.8) { if (!b.dentro && !st.fin) st.racha = 0; scene.remove(b.m); st.vuelo.splice(i, 1); }
        }
        red.scale.y += (1 - red.scale.y) * Math.min(1, dt * 6);
        const d = camDestino(); const s2 = 1 - Math.exp(-dt * 3); cam.p.lerp(d.p, s2); cam.mira.lerp(d.mira, s2);
        camera.position.copy(cam.p); camera.lookAt(cam.mira);
        if (!st.fin && st.t >= TIEMPO) { st.fin = true; alTerminar(st.pts); }
        setHud((h) => (h.pts !== st.pts || h.t !== Math.ceil(TIEMPO - st.t) || h.racha !== st.racha ? { ...h, pts: st.pts, t: Math.max(0, Math.ceil(TIEMPO - st.t)), racha: st.racha } : h));
      }
    };
  }, { cielo: [0x0f172a, 0x020617], niebla: 45, exposicion: 1.15 });
  return (
    <div className="hb-caja">
      <div ref={ref} className="hb-lienzo" />
      <Hud izq={`🏀 ${hud.pts} pts`} centro={hud.racha >= 3 ? `🔥 ×2` : hud.triple ? '🎯 Triple' : `${hud.dist.toFixed(1).replace('.', ',')} m`} der={`⏱️ ${hud.t}s`} />
      <Mensaje texto={msg} />
      {carga && <div className="hb-fuerza"><i style={{ height: `${Math.round(carga.pot * 100)}%` }} /></div>}
      <p className="hb-pista">Desliza hacia arriba: cuanto más largo, más fuerte</p>
    </div>
  );
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
  { id: 'saltar', nombre: 'Salta obstáculos', emoji: '🏃', como: 'Corres solo y cada vez más rápido: toca la pantalla (o espacio) para saltar las vallas. El salto es corto: calcula el momento. ¡No saltes cuando venga un pájaro! Salen vallas dobles y triples y combinaciones con pájaros. Aguantar los 60 segundos es muy difícil.', mejor: 'mas', unidad: 'm', duracion: 60, C: Saltar },
  { id: 'meteoritos', nombre: 'Lluvia de meteoritos', emoji: '☄️', como: 'Arrastra el dedo a izquierda o derecha (en cualquier parte de la pantalla) para mover tu nave y esquivar los meteoritos. El círculo rojo marca dónde caen. Aguanta 45 segundos.', mejor: 'mas', unidad: 's', duracion: 45, C: Meteoritos, formato: (v) => `${v.toFixed(1).replace('.', ',')} s` },
  { id: 'canasta', nombre: 'Canasta', emoji: '🏀', como: 'Desliza el dedo hacia arriba para tirar: el tiro va recto a la canasta y solo cuenta la FUERZA (cuanto más largo el gesto, más fuerte). Si fallas, repites desde el mismo sitio; si encestas, la bola sale en otro sitio y la fuerza necesaria cambia. Canasta 2, triple 3, sin tocar aro +1 y tres seguidas: puntos dobles. 45 segundos.', mejor: 'mas', unidad: 'pts', duracion: 45, C: Canasta },
  { id: 'ritmo', nombre: 'Al ritmo', emoji: '🎵', como: 'Pulsa el botón del color justo cuando la bola llega al aro. En el momento exacto: +3; casi: +1; si pulsas sin nota, −1. Con racha de 10, punto extra.', mejor: 'mas', unidad: 'pts', duracion: 30, C: Ritmo }
];
