// client/src/games/Rascacielos/Rascacielos.jsx
// «Rascacielos infinito» (1 jugador, 3D): cada planta entra deslizándose; toca para soltarla. Lo que sobresale se corta
// y cae, así que la siguiente planta es más estrecha. Si la clavas (perfecta) no pierdes nada y, con 3 seguidas, la
// planta vuelve a crecer. Cada 10 plantas llega una planta dorada que da premio si la clavas. Cada vez va más rápido
// y el cielo cambia con la altura: día, atardecer, noche y espacio.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { THREE, useEscena, mat } from '../Habilidad/tres.js';
import Icon from '../../components/Icon.jsx';
import { PortadaUnJugador, FinUnJugador, ConfirmarSalida, useRecord } from '../../components/UnJugador.jsx';
import { sonar, vibrar } from '../../lib/sonido.js';
import './Rascacielos.css';
import { useAbrirAyuda } from '../../lib/ayuda.js';

const ID = 'rascacielos';
const ALTO = 0.6; // altura de cada planta
const LADO = 3; // lado de la primera planta
const PERFECTA = 0.1; // margen para contar como perfecta
const fmt = (n) => n.toLocaleString('es-ES');
export const velocidad = (n) => Math.min(9, 2.4 + n * 0.09);

// Colores del cielo según la altura (planta): día → atardecer → noche → espacio
const CIELOS = [[0, 0x7dd3fc], [25, 0xfdba74], [45, 0x6d28d9], [65, 0x0f172a], [90, 0x020617]];
function colorCielo(n, c = new THREE.Color()) {
  let i = 0; while (i < CIELOS.length - 2 && n > CIELOS[i + 1][0]) i++;
  const [a, ca] = CIELOS[i]; const [b, cb] = CIELOS[i + 1];
  return c.set(ca).lerp(new THREE.Color(cb), Math.max(0, Math.min(1, (n - a) / (b - a))));
}
const colorPlanta = (n) => new THREE.Color().setHSL(((n * 0.023) + 0.55) % 1, 0.55, 0.58);

/**
 * Lógica pura de soltar una planta: dada la de abajo (centro y ancho en el eje que se mueve) y la que cae,
 * devuelve { tipo: 'fuera' | 'perfecta' | 'corte', centro, ancho, sobra: { centro, ancho } }.
 */
export function soltar(abajoC, abajoW, c, w) {
  const d = c - abajoC;
  if (Math.abs(d) <= PERFECTA) return { tipo: 'perfecta', centro: abajoC, ancho: w };
  const solape = w / 2 + abajoW / 2 - Math.abs(d);
  if (solape <= 0.02) return { tipo: 'fuera' };
  const ancho = Math.min(solape, w);
  const centro = d > 0 ? abajoC + abajoW / 2 - ancho / 2 : abajoC - abajoW / 2 + ancho / 2;
  const sobraW = w - ancho;
  const sobraC = d > 0 ? centro + ancho / 2 + sobraW / 2 : centro - ancho / 2 - sobraW / 2;
  return { tipo: 'corte', centro, ancho, sobra: { centro: sobraC, ancho: sobraW } };
}

function Escena({ onEstado, onFin }) {
  const ref = useRef(null);
  const ctl = useRef({});
  useEscena(ref, (ctx) => {
    const { scene, camera, sol } = ctx;
    scene.fog = new THREE.Fog(0x7dd3fc, 30, 90);
    // Ciudad de fondo
    const suelo = new THREE.Mesh(new THREE.CircleGeometry(60, 40), mat(0x4ade80)); suelo.rotation.x = -Math.PI / 2; suelo.position.y = -0.01; suelo.receiveShadow = true; scene.add(suelo);
    const plaza = new THREE.Mesh(new THREE.BoxGeometry(LADO + 1.2, 0.3, LADO + 1.2), mat(0x94a3b8)); plaza.position.y = -0.15; plaza.receiveShadow = true; scene.add(plaza);
    for (let i = 0; i < 46; i++) {
      const a = (i / 46) * Math.PI * 2 + Math.random() * 0.1; const r = 12 + Math.random() * 20;
      const h = 0.6 + Math.random() * 3.2; const w = 0.8 + Math.random() * 1.4;
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), mat([0xcbd5e1, 0x94a3b8, 0xe2e8f0, 0xfda4af, 0xa5b4fc][i % 5]));
      b.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r); b.castShadow = true; scene.add(b);
    }
    // Estrellas (se ven al subir)
    const pos = []; for (let i = 0; i < 500; i++) { const v = new THREE.Vector3().randomDirection().multiplyScalar(70); v.y = Math.abs(v.y) + 10; pos.push(v.x, v.y, v.z); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const estrellas = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.35, transparent: true, opacity: 0 })); scene.add(estrellas);
    // Nubes
    const nubes = new THREE.Group(); scene.add(nubes);
    for (let i = 0; i < 14; i++) {
      const n = new THREE.Group();
      for (let j = 0; j < 4; j++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.8 + Math.random() * 0.6, 10, 8), mat(0xffffff, { transparent: true, opacity: 0.85 })); s.position.set(j * 0.9, Math.random() * 0.4, Math.random() * 0.5); n.add(s); }
      const a = Math.random() * Math.PI * 2; const r = 8 + Math.random() * 10;
      n.position.set(Math.cos(a) * r, 8 + Math.random() * 30, Math.sin(a) * r); nubes.add(n);
    }

    const planta = (w, d, n, dorada) => {
      const g = new THREE.Group();
      const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(w, ALTO, d), dorada ? mat(0xfbbf24, { metalness: 0.6, roughness: 0.3 }) : new THREE.MeshStandardMaterial({ color: colorPlanta(n), roughness: 0.5 }));
      cuerpo.castShadow = true; cuerpo.receiveShadow = true; g.add(cuerpo);
      const ventanas = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, ALTO * 0.38, d + 0.02), new THREE.MeshStandardMaterial({ color: 0x1e3a8a, emissive: 0xfde68a, emissiveIntensity: 0, roughness: 0.2, metalness: 0.3 }));
      ventanas.position.y = 0.04; g.add(ventanas); g.userData = { w, d, ventanas };
      return g;
    };
    const st = { torre: [], cayendo: [], n: 0, eje: 'x', t: 0, mov: null, fin: false, combo: 0, puntos: 0, camY: 4, alejar: 0 };
    const base = planta(LADO, LADO, 0, false); base.position.set(0, ALTO / 2, 0); scene.add(base);
    st.torre.push({ x: 0, z: 0, w: LADO, d: LADO, m: base });

    const nueva = () => {
      const top = st.torre[st.torre.length - 1]; st.n = st.torre.length;
      st.eje = st.n % 2 ? 'x' : 'z';
      const dorada = st.n % 10 === 0;
      const m = planta(top.w, top.d, st.n, dorada); scene.add(m);
      st.mov = { m, w: top.w, d: top.d, x: top.x, z: top.z, fase: Math.random() < 0.5 ? 0 : Math.PI, dorada };
      st.t = 0;
    };
    nueva();
    const avisar = (extra = {}) => onEstado({ plantas: st.torre.length - 1, puntos: st.puntos, combo: st.combo, ...extra });

    const pulsar = () => {
      if (st.fin || !st.mov) return;
      const mv = st.mov; const top = st.torre[st.torre.length - 1];
      const ejeW = st.eje === 'x' ? 'w' : 'd';
      const r = soltar(top[st.eje], top[ejeW], mv[st.eje], mv[ejeW]);
      const y = st.torre.length * ALTO + ALTO / 2;
      if (r.tipo === 'fuera') {
        st.fin = true; st.cayendo.push({ m: mv.m, v: 0, giro: new THREE.Vector3(Math.random(), 0, Math.random()).multiplyScalar(2) });
        st.mov = null; sonar('fallo'); vibrar([80, 40, 80]); avisar({ aviso: '💥 ¡Fuera!' });
        setTimeout(() => { st.alejar = 1; }, 500);
        setTimeout(() => onFin({ plantas: st.torre.length - 1, puntos: st.puntos }), 2600);
        return;
      }
      const nuevo = { x: mv.x, z: mv.z, w: mv.w, d: mv.d };
      let texto = null;
      if (r.tipo === 'perfecta') {
        st.combo++; nuevo[st.eje] = r.centro;
        let extra = 2; texto = st.combo >= 2 ? `✨ ¡Perfecta x${st.combo}!` : '✨ ¡Perfecta!';
        if (mv.dorada) { extra += 5; texto = '🏆 ¡Planta dorada clavada! +7'; }
        if (st.combo >= 3) { nuevo.w = Math.min(LADO, nuevo.w + 0.15); nuevo.d = Math.min(LADO, nuevo.d + 0.15); }
        st.puntos += 1 + extra; sonar(st.combo >= 3 ? 'logro' : 'acierto', { minimo: 0 }); vibrar(25);
      } else {
        st.combo = 0; nuevo[st.eje] = r.centro; nuevo[ejeW] = r.ancho; st.puntos += 1;
        sonar('carta', { minimo: 0 });
        // Trozo que sobra: cae girando
        const sw = st.eje === 'x' ? r.sobra.ancho : mv.w; const sd = st.eje === 'z' ? r.sobra.ancho : mv.d;
        const trozo = planta(sw, sd, st.n, mv.dorada);
        trozo.position.set(st.eje === 'x' ? r.sobra.centro : mv.x, y, st.eje === 'z' ? r.sobra.centro : mv.z); scene.add(trozo);
        const sentido = Math.sign(r.sobra.centro - r.centro) || 1;
        st.cayendo.push({ m: trozo, v: 0, giro: st.eje === 'x' ? new THREE.Vector3(0, 0, -sentido * 2.5) : new THREE.Vector3(sentido * 2.5, 0, 0) });
      }
      scene.remove(mv.m);
      const fija = planta(nuevo.w, nuevo.d, st.n, mv.dorada); fija.position.set(nuevo.x, y, nuevo.z); scene.add(fija);
      if (r.tipo === 'perfecta') fija.userData.destello = 0.5;
      st.torre.push({ ...nuevo, m: fija });
      avisar({ aviso: texto });
      nueva();
    };
    ctl.current.pulsar = pulsar;
    if (import.meta.env.DEV) {
      // Solo en desarrollo: las pruebas automáticas pueden saber si la planta está alineada
      window.__rascacielos = { desfase: () => { if (!st.mov) return 99; const top = st.torre[st.torre.length - 1]; return Math.abs(st.mov[st.eje] - top[st.eje]); } };
    }

    const colorFondo = new THREE.Color();
    return {
      toque: () => pulsar(),
      frame(dt) {
        st.t += dt;
        const mv = st.mov;
        if (mv) {
          const rango = LADO * 0.95 + 0.6;
          const p = Math.sin(st.t * velocidad(st.n) * 0.75 + mv.fase) * rango;
          const top = st.torre[st.torre.length - 1];
          if (st.eje === 'x') { mv.x = top.x + p; mv.z = top.z; } else { mv.z = top.z + p; mv.x = top.x; }
          mv.m.position.set(mv.x, st.torre.length * ALTO + ALTO / 2, mv.z);
        }
        for (const c of st.cayendo) {
          c.v -= 18 * dt; c.m.position.y += c.v * dt;
          c.m.rotation.x += c.giro.x * dt; c.m.rotation.z += c.giro.z * dt;
          if (c.m.position.y < -8) { scene.remove(c.m); c.quitar = true; }
        }
        st.cayendo = st.cayendo.filter((c) => !c.quitar);
        for (const t of st.torre) {
          if (t.m.userData.destello > 0) { t.m.userData.destello -= dt; t.m.scale.setScalar(1 + t.m.userData.destello * 0.12); }
        }
        // Cámara: sube con la torre; al perder, se aleja para ver la torre entera
        const altura = st.torre.length * ALTO;
        const objetivoY = altura + 2.2;
        st.camY += (objetivoY - st.camY) * Math.min(1, dt * 3);
        const lejos = 9 + st.alejar * Math.max(0, altura * 0.9);
        if (st.alejar) st.alejar = Math.min(1, st.alejar + dt * 0.6);
        const yCam = st.alejar ? st.camY * (1 - st.alejar * 0.5) : st.camY;
        camera.position.set(lejos * 0.72, yCam + 2.4, lejos * 0.72);
        camera.lookAt(0, yCam - 1.5, 0);
        // Cielo, sol, estrellas y ventanas encendidas al anochecer
        const n = st.torre.length;
        colorCielo(n, colorFondo); scene.background = colorFondo; scene.fog.color.copy(colorFondo);
        const noche = Math.max(0, Math.min(1, (n - 40) / 25));
        estrellas.material.opacity = noche; estrellas.position.y = st.camY * 0.6;
        sol.intensity = 1.25 - noche * 0.7; sol.position.set(5, st.camY + 12, 7); sol.target.position.set(0, st.camY - 4, 0);
        for (const t of st.torre.slice(-25)) t.m.userData.ventanas.material.emissiveIntensity = noche * 0.9;
        if (mv) mv.m.userData.ventanas.material.emissiveIntensity = noche * 0.9;
        nubes.children.forEach((c, i) => { c.position.x += Math.sin(i) * dt * 0.3; });
      }
    };
  }, { fondo: 0x7dd3fc });

  useEffect(() => {
    const tecla = (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); ctl.current.pulsar?.(); } };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, []);
  return <div ref={ref} className="rsc-lienzo" />;
}

export default function Rascacielos() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada');
  const abrirAyuda = useAbrirAyuda();
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [partida, setPartida] = useState(0);
  const [hud, setHud] = useState({ plantas: 0, puntos: 0, combo: 0 });
  const [aviso, setAviso] = useState(null);
  const [final, setFinal] = useState(null);

  const empezar = () => { setHud({ plantas: 0, puntos: 0, combo: 0 }); setAviso(null); setFinal(null); setPartida((p) => p + 1); setFase('jugando'); };
  const onEstado = useCallback((e) => {
    setHud({ plantas: e.plantas, puntos: e.puntos, combo: e.combo });
    if (e.aviso) { setAviso({ texto: e.aviso, id: Math.random() }); }
  }, []);
  useEffect(() => { if (!aviso) return undefined; const t = setTimeout(() => setAviso(null), 1100); return () => clearTimeout(t); }, [aviso]);
  const onFin = useCallback((f) => {
    setFinal(f); setNuevoRecord(f.puntos > 0 && registrar(f.puntos, { plantas: f.plantas })); setFase('fin');
  }, [registrar]);

  if (fase === 'portada') {
    return <><PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={abrirAyuda} record={record}
      textoRecord={(r) => `${fmt(r.valor)} puntos${r.plantas != null ? ` · ${r.plantas} plantas` : ''}`} /></>;
  }
  if (fase === 'fin') {
    const p = final.plantas;
    return (
      <FinUnJugador icono="trophy" etiqueta="¡Se acabó la obra!" titulo={p >= 80 ? '¡Hasta las estrellas!' : p >= 45 ? '¡Rascacielos de noche!' : p >= 25 ? '¡Bonito edificio!' : p >= 10 ? 'Un buen bloque' : 'Una casita'}
        puntos={fmt(final.puntos)} unidad="puntos" nuevoRecord={nuevoRecord} record={record} textoRecord={(r) => `${fmt(r.valor)} puntos`}
        exito={p > 0} onRepetir={empezar} onMenu={() => setFase('portada')}>
        <p className="uj-mini">🏢 {p} {p === 1 ? 'planta' : 'plantas'}.</p>
      </FinUnJugador>
    );
  }
  return (
    <div className="qq-en-partida">
      <section className="game rsc-escena">
        <div className="rsc-caja">
          <Escena key={partida} onEstado={onEstado} onFin={onFin} />
          <div className="rsc-hud">
            <button type="button" onClick={() => setSalir(true)} aria-label="Salir"><Icon name="door" size={16} /></button>
            <div className="rsc-altura"><strong>{hud.plantas}</strong><small>plantas</small></div>
            <span>⭐ {fmt(hud.puntos)}{hud.combo >= 2 ? ` · 🔥x${hud.combo}` : ''}</span>
          </div>
          {aviso && <p key={aviso.id} className="rsc-aviso">{aviso.texto}</p>}
          {hud.plantas === 0 && <p className="rsc-pista">Toca para soltar la planta</p>}
        </div>
      </section>
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
      
    </div>
  );
}
