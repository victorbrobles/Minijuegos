// Minijuegos (4/6): corte perfecto, círculo perfecto, del 1 al 16, frena al límite y petanca.
import React, { useRef, useState } from 'react';
import { useEscena, rng, crea, tocado, enSuelo, THREE } from '../tres.js';
import { Hud, Mensaje } from '../comun.jsx';
import { sonar, vibrar } from '../../../lib/sonido.js';

/* ───────── Corte perfecto ───────── */
function Corte({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ ronda: 1, media: null }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla);
    const mesa = crea.caja(14, 0.3, 4, 0x57534e); mesa.position.y = -0.65; scene.add(mesa);
    const sierra = new THREE.Group(); const hoja = crea.cilindro(0.9, 0.9, 0.05, 0xd1d5db, 24); hoja.rotation.x = Math.PI / 2; sierra.add(hoja); const marca = crea.caja(0.03, 3, 0.03, 0xef4444); marca.position.y = -0.6; sierra.add(marca); scene.add(sierra);
    const st = { ronda: 0, errores: [], fase: 'corta', x: 0, dir: 1, vel: 3, tronco: null, L: 4, c: 0, piezas: [], fin: false };
    const nuevo = () => {
      st.piezas.forEach((p) => scene.remove(p)); st.piezas = []; if (st.tronco) scene.remove(st.tronco);
      st.L = r.entre(3, 7); st.c = r.entre(-1.5, 1.5);
      st.tronco = crea.cilindro(0.45, 0.45, st.L, 0xa16207, 20); st.tronco.rotation.z = Math.PI / 2; st.tronco.position.set(st.c, 0, 0); scene.add(st.tronco);
      st.x = st.c - st.L / 2; st.dir = 1; st.vel = 2.6 + st.ronda * 0.45; st.fase = 'corta';
    };
    nuevo();
    camera.position.set(0, 2.2, 8); camera.lookAt(0, 0, 0);
    return {
      toque() {
        if (st.fase !== 'corta' || st.fin) return;
        const err = (Math.abs(st.x - st.c) / st.L) * 100; st.errores.push(err); st.fase = 'pausa';
        sonar(err < 2 ? 'victoria' : 'carta');
        const izq = st.x - (st.c - st.L / 2); const der = st.c + st.L / 2 - st.x;
        scene.remove(st.tronco); st.tronco = null;
        [[izq, st.c - st.L / 2 + izq / 2, -1], [der, st.x + der / 2, 1]].forEach(([l, cx, s]) => { if (l <= 0.01) return; const p = crea.cilindro(0.45, 0.45, l, 0xa16207, 20); p.rotation.z = Math.PI / 2; p.position.set(cx, 0, 0); p.userData.s = s; scene.add(p); st.piezas.push(p); });
        setMsg(err < 1 ? '🎯 ¡Perfecto!' : `${err.toFixed(1)} % desviado`);
        const media = st.errores.reduce((a, b) => a + b, 0) / st.errores.length; setHud({ ronda: Math.min(6, st.errores.length + 1), media });
        setTimeout(() => { setMsg(null); st.ronda++; if (st.ronda >= 6) { st.fin = true; alTerminar(Math.round(media * 10) / 10); } else nuevo(); }, 1300);
      },
      frame(dt) {
        if (st.fase === 'corta') { st.x += st.dir * st.vel * dt; const a = st.c - st.L / 2; const b = st.c + st.L / 2; if (st.x > b) { st.x = b; st.dir = -1; } if (st.x < a) { st.x = a; st.dir = 1; } }
        sierra.position.set(st.x, 1.5, 0); hoja.rotation.y += dt * 20;
        st.piezas.forEach((p) => { p.position.x += p.userData.s * dt * 1.5; });
      }
    };
  }, { fondo: 0x292524 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🪚 Tronco ${hud.ronda}/6`} der={hud.media != null ? `Desvío medio ${hud.media.toFixed(1)} %` : 'Corta justo por la mitad'} /><Mensaje texto={msg} /></div>;
}

/* ───────── Círculo perfecto ───────── */
function Circulo({ alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ intento: 1, mejor: null }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx;
    const suelo = crea.caja(14, 0.2, 14, 0xf1f5f9); suelo.position.y = -0.1; scene.add(suelo);
    const centro = crea.cilindro(0.1, 0.1, 0.05, 0x94a3b8); scene.add(centro);
    const st = { pts: [], dibujando: false, intento: 0, mejor: 0, linea: null, fin: false };
    const geo = new THREE.BufferGeometry(); const linea = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x7c3aed })); scene.add(linea);
    const tubo = { m: null };
    const pinta = () => {
      geo.setFromPoints(st.pts.map((p) => new THREE.Vector3(p.x, 0.03, p.z)));
      if (tubo.m) scene.remove(tubo.m);
      if (st.pts.length > 3) { const curva = new THREE.CatmullRomCurve3(st.pts.map((p) => new THREE.Vector3(p.x, 0.08, p.z))); tubo.m = new THREE.Mesh(new THREE.TubeGeometry(curva, st.pts.length * 2, 0.08, 6), new THREE.MeshStandardMaterial({ color: 0x7c3aed })); scene.add(tubo.m); }
    };
    const evaluar = () => {
      const p = st.pts; if (p.length < 12) return 0;
      const cx = p.reduce((a, q) => a + q.x, 0) / p.length; const cz = p.reduce((a, q) => a + q.z, 0) / p.length;
      const rs = p.map((q) => Math.hypot(q.x - cx, q.z - cz)); const R = rs.reduce((a, b) => a + b, 0) / rs.length;
      if (R < 0.8) return 0;
      const desv = Math.sqrt(rs.reduce((a, b) => a + (b - R) ** 2, 0) / rs.length) / R;
      let giro = 0; for (let i = 1; i < p.length; i++) { let d = Math.atan2(p[i].z - cz, p[i].x - cx) - Math.atan2(p[i - 1].z - cz, p[i - 1].x - cx); if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; giro += d; }
      const cobertura = Math.min(1, Math.abs(giro) / (2 * Math.PI));
      const cierre = Math.hypot(p[0].x - p.at(-1).x, p[0].z - p.at(-1).z) / R;
      return Math.max(0, Math.round((100 - desv * 260) * cobertura * Math.max(0.6, 1 - Math.max(0, cierre - 0.3) * 0.4) * 10) / 10);
    };
    camera.position.set(0, 12, 0.01); camera.lookAt(0, 0, 0);
    return {
      toque(e) { if (st.fin) return; st.pts = []; st.dibujando = true; const p = enSuelo(ctx, e, 0); if (p) st.pts.push(p); },
      mover(e) { if (!st.dibujando) return; const p = enSuelo(ctx, e, 0); if (p && (!st.pts.length || p.distanceTo(st.pts.at(-1)) > 0.08)) { st.pts.push(p); if (st.pts.length % 3 === 0) pinta(); } },
      soltar() {
        if (!st.dibujando || st.fin) return; st.dibujando = false; pinta();
        const v = evaluar(); st.intento++; st.mejor = Math.max(st.mejor, v);
        setMsg(v ? `⭕ ${v.toFixed(1)} % redondo` : 'Eso no es un círculo 😅'); sonar(v > 90 ? 'victoria' : 'acierto');
        setHud({ intento: Math.min(3, st.intento + 1), mejor: st.mejor });
        if (st.intento >= 3) { st.fin = true; setTimeout(() => alTerminar(st.mejor), 1300); }
      }
    };
  }, { fondo: 0xe2e8f0, sombras: false });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`⭕ Intento ${hud.intento}/3`} der={hud.mejor != null ? `Mejor: ${hud.mejor.toFixed(1)} %` : 'Dibuja un círculo con el dedo'} /><Mensaje texto={msg} /></div>;
}

/* ───────── Del 1 al 16 ───────── */
function Numeros({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ sig: 1, t: 0 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla);
    const orden = r.barajar(Array.from({ length: 16 }, (_, i) => i + 1));
    const fichas = orden.map((n, i) => {
      const g = new THREE.Group(); const b = crea.caja(1.5, 0.4, 1.5, 0x0ea5e9); g.add(b);
      const c = crea.cartel(String(n), 1.3, 1.3, { fondo: '#e0f2fe', fuente: 'bold 130px sans-serif' }); c.rotation.x = -Math.PI / 2; c.position.y = 0.21; g.add(c);
      g.position.set((i % 4 - 1.5) * 1.7, 0, (Math.floor(i / 4) - 1.5) * 1.7); g.rotation.y = r.entre(-0.25, 0.25); scene.add(g);
      return { g, n, hecha: false, temblor: 0 };
    });
    const st = { sig: 1, t: 0, pen: 0, fin: false };
    camera.position.set(0, 9.5, 3); camera.lookAt(0, 0, 0.3);
    return {
      toque(e) {
        if (st.fin) return;
        const t = tocado(ctx, e, fichas.filter((f) => !f.hecha).map((f) => f.g)); if (!t) return;
        const f = fichas.find((x) => x.g === t.obj);
        if (f.n === st.sig) { f.hecha = true; st.sig++; sonar('tic', { minimo: 0 }); setHud({ sig: st.sig, t: st.t }); if (st.sig > 16) { st.fin = true; sonar('victoria'); alTerminar(Math.round((st.t + st.pen) * 10) / 10); } } else { st.pen += 1; f.temblor = 0.4; sonar('fallo'); setMsg('+1 s'); setTimeout(() => setMsg(null), 400); }
      },
      frame(dt) {
        if (!st.fin) st.t += dt;
        fichas.forEach((f) => { if (f.hecha) { f.g.position.y = Math.max(-0.35, f.g.position.y - dt * 3); f.g.children[0].material = f.g.children[0].material.color.getHex() === 0x22c55e ? f.g.children[0].material : new THREE.MeshStandardMaterial({ color: 0x22c55e }); } if (f.temblor > 0) { f.temblor -= dt; f.g.position.x += Math.sin(f.temblor * 60) * 0.02; } });
        if (!st.fin && st.t >= 60) { st.fin = true; alTerminar(60 + (17 - st.sig) * 2); }
        setHud((h) => (Math.floor(h.t) !== Math.floor(st.t) ? { sig: st.sig, t: st.t } : h));
      }
    };
  }, { fondo: 0x082f49 });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🔢 Busca el ${Math.min(16, hud.sig)}`} der={`⏱️ ${Math.floor(hud.t)} s`} /><Mensaje texto={msg} tipo="mal" /></div>;
}

/* ───────── Frena al límite ───────── */
function Frenada({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ intento: 1, total: 0 }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla); const LINEA = -40;
    const carretera = crea.caja(5, 0.2, 60, 0x374151); carretera.position.set(0, -0.1, -20); scene.add(carretera);
    for (let z = 0; z > -45; z -= 4) { const raya = crea.caja(0.15, 0.02, 2, 0xfefce8); raya.position.set(0, 0.01, z); scene.add(raya); }
    const linea = crea.caja(5, 0.03, 0.3, 0xef4444); linea.position.set(0, 0.02, LINEA); scene.add(linea);
    const muro = crea.caja(6, 2, 1, 0xa8a29e); muro.position.set(0, 1, LINEA - 2.5); scene.add(muro);
    const coche = new THREE.Group(); const cuerpo = crea.caja(1.6, 0.6, 2.8, 0xdc2626); cuerpo.position.y = 0.5; coche.add(cuerpo); const cabina = crea.caja(1.3, 0.5, 1.4, 0x1e293b); cabina.position.set(0, 1.05, 0.2); coche.add(cabina); scene.add(coche);
    const velocidades = [r.entre(13, 16), r.entre(16, 19), r.entre(19, 22)];
    const st = { i: 0, z: 0, v: 0, frenando: false, fase: 'corre', res: [], fin: false };
    const empezar = () => { st.z = 0; st.v = velocidades[st.i]; st.frenando = false; st.fase = 'corre'; coche.rotation.y = 0; };
    empezar();
    return {
      toque() { if (st.fase === 'corre' && !st.fin) { st.frenando = true; sonar('toque', { minimo: 0 }); } },
      frame(dt) {
        if (st.fase === 'corre') {
          if (st.frenando) st.v = Math.max(0, st.v - 11 * dt);
          st.z -= st.v * dt; const frente = st.z - 1.4;
          if (frente < LINEA) { st.fase = 'fin'; coche.rotation.y = 0.4; vibrar(150); sonar('fallo'); st.res.push(1000); setMsg('💥 ¡Te pasaste! +10 m'); siguiente(); }
          else if (st.v === 0) { st.fase = 'fin'; const cm = Math.round((frente - LINEA) * 100); st.res.push(cm); sonar(cm < 50 ? 'victoria' : 'acierto'); setMsg(cm < 20 ? `🎯 ¡A ${cm} cm!` : `A ${cm} cm de la línea`); siguiente(); }
          coche.position.z = st.z;
        }
        camera.position.set(3, 4, st.z + 7); camera.lookAt(0, 0.5, st.z - 8);
        ctx.sol.position.set(4, 12, st.z + 5); ctx.sol.target.position.set(0, 0, st.z);
      }
    };
    function siguiente() {
      setHud({ intento: Math.min(3, st.res.length + 1), total: st.res.reduce((a, b) => a + b, 0) });
      setTimeout(() => { setMsg(null); st.i++; if (st.i >= 3) { st.fin = true; alTerminar(st.res.reduce((a, b) => a + b, 0)); } else empezar(); }, 1500);
    }
  }, { fondo: 0x7dd3fc });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🚗 Intento ${hud.intento}/3`} der={`Total ${(hud.total / 100).toFixed(2).replace('.', ',')} m`} /><Mensaje texto={msg} /><p className="hb-pista">Toca para frenar: para lo más cerca posible de la línea roja</p></div>;
}

/* ───────── Petanca ───────── */
function Petanca({ semilla, alTerminar }) {
  const ref = useRef(null); const [hud, setHud] = useState({ quedan: 4, mejor: null }); const [msg, setMsg] = useState(null);
  useEscena(ref, (ctx) => {
    const { scene, camera } = ctx; const r = rng(semilla);
    const pista = crea.caja(7, 0.2, 18, 0xd6c49b); pista.position.set(0, -0.1, -5); scene.add(pista);
    [-3.5, 3.5].forEach((x) => { const b = crea.caja(0.2, 0.4, 18, 0x78350f); b.position.set(x, 0.1, -5); scene.add(b); });
    const boliche = crea.esfera(0.14, 0xfacc15); boliche.position.set(r.entre(-1.6, 1.6), 0.14, -r.entre(7, 11)); scene.add(boliche);
    const st = { bolas: [], actual: null, ini: null, quedan: 4, mejor: Infinity, fin: false };
    const nueva = () => { const b = crea.esfera(0.32, 0x94a3b8, { metalness: 0.8, roughness: 0.25 }); b.position.set(0, 0.32, 3); scene.add(b); st.actual = { m: b, v: new THREE.Vector3(), mueve: false }; };
    nueva();
    camera.position.set(0, 4.5, 7); camera.lookAt(0, 0, -4);
    return {
      toque(e) { if (st.actual && !st.actual.mueve && !st.fin) st.ini = [e.clientX, e.clientY]; },
      soltar(e) {
        if (!st.ini || !st.actual || st.actual.mueve) return; const dx = e.clientX - st.ini[0]; const dy = st.ini[1] - e.clientY; st.ini = null;
        if (dy < 20) return; const p = Math.min(1.4, Math.hypot(dx, dy) / 250); const v = 11 * p;
        st.actual.v.set((dx / Math.hypot(dx, dy)) * v * 0.6, 0, -v); st.actual.mueve = true; sonar('toque', { minimo: 0 });
      },
      frame(dt) {
        const a = st.actual; if (!a || !a.mueve) return;
        const vel = a.v.length(); const nv = Math.max(0, vel - 4.5 * dt);
        if (vel > 0) a.v.multiplyScalar(nv / vel);
        a.m.position.addScaledVector(a.v, dt); a.m.rotation.x -= a.v.z * dt * 3;
        if (Math.abs(a.m.position.x) > 3.2) { a.v.x *= -0.5; a.m.position.x = Math.sign(a.m.position.x) * 3.2; }
        if (nv === 0 || a.m.position.z < -14) {
          a.mueve = false; const d = Math.round(Math.hypot(a.m.position.x - boliche.position.x, a.m.position.z - boliche.position.z) * 100);
          st.mejor = Math.min(st.mejor, a.m.position.z < -14 ? 9999 : d); st.quedan--; st.bolas.push(a);
          setMsg(a.m.position.z < -14 ? 'Fuera de la pista' : `A ${d} cm del boliche`); sonar(d < 30 ? 'victoria' : 'carta');
          setHud({ quedan: st.quedan, mejor: st.mejor });
          setTimeout(() => { setMsg(null); if (st.quedan <= 0) { st.fin = true; alTerminar(Math.min(1000, st.mejor)); } else nueva(); }, 1100);
          st.actual = null;
        }
      }
    };
  }, { fondo: 0x86efac });
  return <div className="hb-caja"><div ref={ref} className="hb-lienzo" /><Hud izq={`🟡 Quedan ${hud.quedan} bolas`} der={hud.mejor != null && hud.mejor < 9999 ? `Mejor: ${hud.mejor} cm` : 'Acércate al boliche'} /><Mensaje texto={msg} /><p className="hb-pista">Desliza hacia arriba para lanzar (más largo, más fuerte)</p></div>;
}

export default [
  { id: 'corte', nombre: 'Corte perfecto', emoji: '🪚', como: 'La sierra recorre el tronco de lado a lado: toca para cortarlo justo por la mitad. Seis troncos, cada vez más rápido.', mejor: 'menos', unidad: '%', peor: 50, duracion: 60, C: Corte, formato: (v) => `${v.toFixed(1).replace('.', ',')} % de desvío` },
  { id: 'circulo', nombre: 'Círculo perfecto', emoji: '⭕', como: 'Dibuja con el dedo el círculo más perfecto que puedas, de una vez y cerrándolo. Tres intentos: cuenta el mejor.', mejor: 'mas', unidad: '%', duracion: 60, C: Circulo, formato: (v) => `${v.toFixed(1).replace('.', ',')} %` },
  { id: 'numeros', nombre: 'Del 1 al 16', emoji: '🔢', como: 'Toca los números del 1 al 16 en orden lo más rápido posible. Cada fallo suma 1 segundo.', mejor: 'menos', unidad: 's', peor: 92, duracion: 60, C: Numeros, formato: (v) => `${v.toFixed(1).replace('.', ',')} s` },
  { id: 'frenada', nombre: 'Frena al límite', emoji: '🚗', como: 'El coche va derecho a un muro. Toca para frenar y para lo más cerca posible de la línea roja sin pasarte. Tres intentos, cada vez más rápido.', mejor: 'menos', unidad: 'cm', peor: 3000, duracion: 40, C: Frenada, formato: (v) => `${(v / 100).toFixed(2).replace('.', ',')} m` },
  { id: 'petanca', nombre: 'Petanca', emoji: '🟡', como: 'Desliza hacia arriba para lanzar la bola y déjala lo más cerca posible del boliche amarillo. Cuatro bolas: cuenta la mejor.', mejor: 'menos', unidad: 'cm', peor: 1000, duracion: 60, C: Petanca, formato: (v) => `${Math.round(v)} cm` }
];
