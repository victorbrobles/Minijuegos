// client/src/games/Artilleria/Artilleria.jsx
// «Artillería»: tanques sobre colinas. Arrastra desde tu tanque para apuntar (dirección = ángulo, largo = fuerza),
// ajusta con los botones, elige munición y ¡fuego! Ojo al viento. Online o en un solo móvil por turnos.
import React, { useEffect, useRef, useState } from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import LocalPorTurnos from '../comun/LocalPorTurnos.jsx';
import { useReloj } from '../comun/Lienzo2D.jsx';
import Lienzo3D from '../comun/Lienzo3D.jsx';
import { THREE, crea, marcador } from '../Habilidad/tres.js';
import { Hero, AvisoTurno, useLatido, colorDe } from '../Pulsador/Vistas.jsx';
import { sonar, vibrar } from '../../lib/sonido.js';
import * as E from './engine.js';
import './Artilleria.css';

/* ───────── Escena 3D: campo de batalla de perfil ───────── */
const ESC = 3.4; // los tanques se ven más grandes que su tamaño real para que se distingan en el móvil
const P = (x, yArriba, z = 0) => new THREE.Vector3(x - E.W / 2, yArriba, z); // coordenadas del mundo (y hacia arriba)
function geometriaTerreno(terreno) {
  const forma = new THREE.Shape(); forma.moveTo(-E.W / 2, -80);
  terreno.forEach((h, i) => forma.lineTo(i * E.PASO - E.W / 2, h)); forma.lineTo(E.W / 2, -80); forma.closePath();
  const g = new THREE.ExtrudeGeometry(forma, { depth: 40, bevelEnabled: false, steps: 1 }); g.translate(0, 0, -30); return g;
}
function texturaTierra() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#4d7c0f'); g.addColorStop(0.06, '#65a30d'); g.addColorStop(0.08, '#78350f'); g.addColorStop(0.5, '#5b2a0b'); g.addColorStop(1, '#2b1404'); x.fillStyle = g; x.fillRect(0, 0, 64, 256);
  for (let i = 0; i < 400; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * 0.25})`; x.fillRect(Math.random() * 64, 20 + Math.random() * 236, 2, 2); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function tanqueModelo(color) {
  const g = new THREE.Group(); const c = new THREE.Color(color);
  const casco = crea.caja(7.2, 2.2, 5, c.getHex(), { roughness: 0.45, metalness: 0.35 }); casco.position.y = 1.9; g.add(casco);
  const orugas = [-2.1, 2.1].map((z) => { const o = crea.caja(8, 1.6, 1.2, 0x1f2937, { roughness: 0.8 }); o.position.set(0, 0.8, z); g.add(o); for (let k = -3; k <= 3; k += 1.5) { const r = crea.cilindro(0.6, 0.6, 1.3, 0x4b5563, 16); r.rotation.x = Math.PI / 2; r.position.set(k, 0.75, z); g.add(r); } return o; });
  const torreta = crea.esfera(2, c.clone().offsetHSL(0, 0, -0.08).getHex(), { roughness: 0.4, metalness: 0.4 }); torreta.scale.set(1, 0.75, 1); torreta.position.y = 3; g.add(torreta);
  const canon = new THREE.Group(); canon.position.y = 3.4; const tubo = crea.cilindro(0.38, 0.45, 6, 0x111827, 16, { metalness: 0.7, roughness: 0.3 }); tubo.rotation.z = -Math.PI / 2; tubo.position.x = 3; canon.add(tubo); const boca = crea.cilindro(0.55, 0.55, 0.8, 0x111827, 16); boca.rotation.z = -Math.PI / 2; boca.position.x = 6; canon.add(boca); g.add(canon);
  const nombre = marcador({ tam: 2.4, fondo: 'rgba(15,23,42,0.75)', ancho: 640 }); nombre.position.y = 10.5; g.add(nombre);
  const fondoVida = new THREE.Mesh(new THREE.PlaneGeometry(10, 0.9), new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.7 })); fondoVida.position.y = 8.3; g.add(fondoVida);
  const vida = new THREE.Mesh(new THREE.PlaneGeometry(10, 0.9), new THREE.MeshBasicMaterial({ color: 0x22c55e })); vida.position.set(0, 8.3, 0.01); g.add(vida);
  const aro = new THREE.Mesh(new THREE.TorusGeometry(5, 0.25, 8, 40), new THREE.MeshBasicMaterial({ color: 0xfacc15 })); aro.rotation.x = Math.PI / 2; aro.position.y = 0.3; g.add(aro);
  g.scale.setScalar(ESC / 1.9); g.traverse((m) => { if (m.isMesh && m !== vida && m !== fondoVida) m.castShadow = true; });
  return { g, canon, vida, nombre, aro, orugas };
}
function montarBatalla(ctx) {
  const { scene } = ctx;
  // Fondo: montañas lejanas, nubes y sol
  for (let k = 0; k < 11; k++) { const h = 70 + Math.random() * 60; const m = new THREE.Mesh(new THREE.ConeGeometry(30 + Math.random() * 20, h, 5), new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 1, flatShading: true })); m.position.set(-E.W * 0.75 + k * 36 + Math.random() * 10, h / 2 - 10, -160); scene.add(m); const nieve = new THREE.Mesh(new THREE.ConeGeometry(8, 16, 5), new THREE.MeshStandardMaterial({ color: 0xf8fafc, flatShading: true })); nieve.position.set(m.position.x, h - 18, -159); scene.add(nieve); }
  const nubes = []; for (let k = 0; k < 8; k++) { const n = new THREE.Group(); for (let b = 0; b < 4; b++) { const e = crea.esfera(3 + Math.random() * 3, 0xffffff, { roughness: 1 }); e.position.set(b * 4 - 6, Math.random() * 2, 0); n.add(e); } n.position.set(-E.W / 2 + Math.random() * E.W, 110 + Math.random() * 30, -50); scene.add(n); nubes.push(n); }
  const sol = crea.esfera(8, 0xfde68a, { emissive: 0xfbbf24, emissiveIntensity: 1.5 }); sol.position.set(70, 125, -80); scene.add(sol);
  const matTierra = new THREE.MeshStandardMaterial({ map: texturaTierra(), roughness: 0.95 }); const matCesped = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.9 });
  const terreno = new THREE.Mesh(new THREE.BufferGeometry(), [matTierra, matCesped]); terreno.receiveShadow = true; terreno.castShadow = true; scene.add(terreno);
  // UV del frente según la altura, para que la tierra tenga capas
  const ponerTerreno = (alturas) => { terreno.geometry.dispose(); const g = geometriaTerreno(alturas); const pos = g.attributes.position; const uv = g.attributes.uv; for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / 30, 1 - Math.max(0, Math.min(1, (90 - pos.getY(i)) / 110))); terreno.geometry = g; };
  const tanques = {}; const balas = []; const fx = { ultimo: null };
  const bala = () => { const m = crea.esfera(1.3, 0x111827, { metalness: 0.6, roughness: 0.3 }); const estela = Array.from({ length: 10 }, (_, k) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.9 - k * 0.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.55 - k * 0.05 })); scene.add(e); return e; }); scene.add(m); return { m, estela }; };
  const flecha = new THREE.Group(); const fMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.9 }); const fAsta = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 0.5), fMat); fAsta.position.x = 0.5; flecha.add(fAsta); const fPunta = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.4, 12), fMat); fPunta.rotation.z = -Math.PI / 2; flecha.add(fPunta); flecha.visible = false; scene.add(flecha);
  const viento = marcador({ tam: 6, fondo: 'rgba(15,23,42,0.7)', ancho: 900 }); viento.position.set(0, E.H - 12, 0); scene.add(viento);
  const banderas = [-60, 60].map((x) => { const g = new THREE.Group(); const m = crea.cilindro(0.3, 0.3, 14, 0xe5e7eb, 8); m.position.y = 7; g.add(m); const tela = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.6, 8, 1), new THREE.MeshStandardMaterial({ color: 0xef4444, side: THREE.DoubleSide })); tela.position.set(3, 12, 0); g.add(tela); scene.add(g); return { g, tela, x }; });
  ctx.encuadrar({ centro: [0, E.H / 2 - 8, 0], ancho: E.W + 4, alto: E.H - 10, desde: [0, 0.08, 1], margen: 1.01 });
  return { ctx, terreno, ponerTerreno, tanques, balas, bala, fx, flecha, fMat, fAsta, viento, banderas, nubes, terrenoActual: null };
}
function pintarBatalla(o, estado, util, dt, t) {
  const { terreno, jugadores, viento, proyectiles, f, armaRadio, apunta, turno } = estado;
  if (o.terrenoActual !== terreno) { o.terrenoActual = terreno; o.ponerTerreno(terreno); }
  // Tanques
  jugadores.forEach((j) => {
    let tq = o.tanques[j.id]; if (!tq) { tq = tanqueModelo(colorDe(j.id)); o.tanques[j.id] = tq; o.ctx.scene.add(tq.g); }
    const yS = E.altura(terreno, j.x); const yI = E.altura(terreno, j.x - 3); const yD = E.altura(terreno, j.x + 3);
    tq.g.position.copy(P(j.x, yS)); tq.g.rotation.z = Math.atan2(yD - yI, 6) * 0.8;
    tq.canon.rotation.z = (((j.ang ?? 90) * Math.PI) / 180) - tq.g.rotation.z;
    const vivo = j.vida > 0; tq.g.visible = true; tq.canon.visible = vivo; tq.vida.scale.x = Math.max(0.001, j.vida / 100); tq.vida.position.x = -5 * (1 - j.vida / 100);
    tq.vida.material.color.setHex(j.vida > 50 ? 0x22c55e : j.vida > 25 ? 0xf59e0b : 0xef4444);
    tq.nombre.poner(vivo ? j.nombre.slice(0, 10) : `💀 ${j.nombre.slice(0, 8)}`); tq.aro.visible = vivo && j.id === turno; tq.aro.rotation.z += dt * 2;
    if (!vivo) tq.g.rotation.z = 0.25;
  });
  // Proyectiles con estela y explosiones
  while (o.balas.length < proyectiles.length) o.balas.push(o.bala());
  o.balas.forEach((b, k) => {
    const pr = proyectiles[k]; const i = Math.floor(f ?? -1);
    const vuela = pr && i >= 0 && i < pr.frames.length - 1 && (!pr.impacto || i < pr.impacto.frame);
    b.m.visible = vuela; b.estela.forEach((e, n) => { const q = vuela && pr.frames[Math.max(0, i - n)]; e.visible = Boolean(q); if (q) e.position.copy(P(q[0], q[1])); });
    if (vuela) b.m.position.copy(P(pr.frames[i][0], pr.frames[i][1]));
    const clave = pr?.impacto ? `${estado.n}-${k}` : null;
    if (pr?.impacto && i >= pr.impacto.frame && o.fx[clave] !== true) {
      o.fx[clave] = true; const p = P(pr.impacto.x, pr.impacto.y); const r = (armaRadio || 8) * 0.6;
      o.ctx.chispas(p, 0xf97316, 60, { fuerza: 22, tam: 0.9, gravedad: 30 }); o.ctx.chispas(p, 0xfde68a, 30, { fuerza: 14, tam: 0.7, gravedad: 20 }); o.ctx.chispas(p, 0x44403c, 30, { fuerza: 12, tam: 1.1, gravedad: 25 });
      o.ctx.onda(p.clone().setZ(1), 0xfb923c, { radio: r, eje: 'z' }); o.ctx.temblor(1.4);
    }
  });
  // Flecha de puntería
  o.flecha.visible = Boolean(apunta);
  if (apunta) { const largo = 6 + apunta.pot * 0.22; const r = (apunta.ang * Math.PI) / 180; o.flecha.position.copy(P(apunta.x, E.altura(terreno, apunta.x) + 2.6 * ESC, 2)); o.flecha.rotation.z = r; o.fAsta.scale.x = largo; o.fAsta.position.x = largo / 2; o.flecha.children[1].position.x = largo; }
  // Viento: cartel y banderas
  o.viento.poner(viento === 0 ? 'Sin viento' : `Viento ${viento > 0 ? '→' : '←'} ${Math.abs(viento)}`);
  o.banderas.forEach((b) => { b.g.position.copy(P(E.W / 2 + b.x, E.altura(terreno, E.W / 2 + b.x))); b.tela.rotation.y = viento < 0 ? Math.PI : 0; b.tela.position.x = viento < 0 ? -3 : 3; b.tela.scale.x = 0.4 + Math.min(1, Math.abs(viento) / 10) * 0.6; b.tela.rotation.x = Math.sin(t * 6) * 0.15; });
  o.nubes.forEach((n) => { n.position.x += (viento || 0.5) * dt * 0.6; if (n.position.x > E.W / 2 + 30) n.position.x = -E.W / 2 - 30; if (n.position.x < -E.W / 2 - 30) n.position.x = E.W / 2 + 30; });
}

function Escenario({ v, enviar, local }) {
  const yo = local ? v.jugadores.find((j) => j.id === v.turno) : v.jugadores.find((j) => j.id === v.yo?.id);
  const miTurno = v.fase === 'turno' && (local || v.turno === v.yo?.id);
  const [ang, setAng] = useState(yo?.ang ?? 60);
  const [pot, setPot] = useState(yo?.pot ?? 60);
  const [arma, setArma] = useState('normal');
  const [, setVer] = useState(0);
  const anim = useRef(null);
  const [animando, setAnimando] = useState(false);
  const arrastre = useRef(false);

  // Al empezar mi turno, recupero mi último ángulo y fuerza
  useEffect(() => { if (miTurno && yo) { setAng(yo.ang); setPot(yo.pot); setArma('normal'); } }, [v.turno, miTurno]); // eslint-disable-line react-hooks/exhaustive-deps

  const ultimoN = v.ultimo?.n;
  useEffect(() => {
    const u = v.ultimo;
    if (!u?.tiro) return undefined;
    const r = E.simularDisparo(u.antes, u.tiro);
    anim.current = { r, antes: u.antes, de: u.de, t0: performance.now(), tiro: u.tiro };
    setAnimando(true); setVer((x) => x + 1); sonar('pulsador', { vibrar: false });
    const ms = (r.frames / 30) * 1000 + 700;
    const t1 = setTimeout(() => { sonar('fallo', { vibrar: false }); if (r.danos[v.yo?.id]) vibrar([120, 60, 120]); }, (r.frames / 30) * 1000);
    const t2 = setTimeout(() => { setAnimando(false); anim.current = null; setVer((x) => x + 1); }, ms);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [ultimoN]); // eslint-disable-line react-hooks/exhaustive-deps

  const angRef = useRef(ang); angRef.current = ang; const potRef = useRef(pot); potRef.current = pot;
  const dibujar3 = (o, t, util, dt) => {
    const a = anim.current;
    if (a) {
      const f = ((performance.now() - a.t0) / 1000) * 30; const fin = f >= a.r.frames;
      const jug = a.antes.tanques.map((tq) => { const j = v.jugadores.find((x) => x.id === tq.id); return { ...j, x: tq.x ?? j.x, vida: fin ? (a.r.tanques.find((x) => x.id === tq.id)?.vida ?? tq.vida) : tq.vida, ang: tq.id === a.de ? a.tiro.ang : j.ang }; });
      pintarBatalla(o, { terreno: fin ? a.r.terreno : a.antes.terreno, jugadores: jug, viento: v.viento, proyectiles: a.r.proyectiles, f, n: a.t0, armaRadio: (E.ARMAS[a.tiro.arma] || E.ARMAS.normal).radio, turno: a.de }, util, dt, t);
      return;
    }
    pintarBatalla(o, { terreno: v.terreno, jugadores: v.jugadores.map((j) => (miTurno && j.id === yo?.id ? { ...j, ang: angRef.current } : j)), viento: v.viento, proyectiles: [], f: null, n: 0, turno: v.turno, apunta: miTurno && yo ? { x: yo.x, ang: angRef.current, pot: potRef.current } : null }, util, dt, t);
  };
  const puntero = (tipo, x, y) => {
    if (!miTurno || animando || !yo) return;
    if (tipo === 'down') arrastre.current = true;
    if (tipo === 'up') { arrastre.current = false; return; }
    if (!arrastre.current) return;
    const ty = E.altura(v.terreno, yo.x) + 2.6;
    const dx = x - yo.x; const dy = (E.H - y) - ty;
    setAng(Math.round(Math.max(0, Math.min(180, (Math.atan2(dy, dx) * 180) / Math.PI))));
    setPot(Math.round(Math.max(5, Math.min(100, (Math.hypot(dx, dy) - 6) / 0.22))));
    setVer((n) => n + 1);
  };
  const ajustar = (a, p) => { setAng((x) => Math.max(0, Math.min(180, x + a))); setPot((x) => Math.max(5, Math.min(100, x + p))); setVer((n) => n + 1); };
  const fuego = () => enviar('disparar', { ang, pot, arma });

  return (
    <div className="ar-caja">
      <Lienzo3D ancho={E.W} alto={E.H} plano="pared" proporcion="16 / 10" opciones={{ cielo: [0x38bdf8, 0xfef3c7], exposicion: 1.05 }} montar={montarBatalla} dibujar={dibujar3} onPuntero={puntero} />
      {miTurno && !animando && yo && (
        <div className="ar-mandos">
          <div className="ar-ajuste">
            <span>Ángulo <b>{ang}°</b></span>
            <button type="button" onClick={() => ajustar(1, 0)}>◀</button><button type="button" onClick={() => ajustar(-1, 0)}>▶</button>
          </div>
          <div className="ar-ajuste">
            <span>Fuerza <b>{pot}</b></span>
            <button type="button" onClick={() => ajustar(0, -1)}>−</button><button type="button" onClick={() => ajustar(0, 1)}>+</button>
          </div>
          <div className="ar-armas">
            {E.IDS_ARMAS.map((id) => {
              const quedan = id === 'normal' ? '∞' : yo.armas[id];
              return <button key={id} type="button" className={arma === id ? 'sel' : ''} disabled={quedan === 0} onClick={() => setArma(id)}>{E.ARMAS[id].emoji} {E.ARMAS[id].nombre}<small>{quedan}</small></button>;
            })}
          </div>
          <button type="button" className="pzp-boton grande ar-fuego" onClick={fuego}>🔥 ¡Fuego!</button>
          <p className="ar-ayuda">Arrastra desde tu tanque para apuntar: la dirección es el ángulo y el largo, la fuerza.</p>
        </div>
      )}
    </div>
  );
}

function Restante({ v }) {
  useLatido(500);
  const ahora = useReloj(v);
  return <>{Math.max(0, Math.ceil((v.limite - ahora()) / 1000))}s</>;
}

function Partida({ v, enviar, onSalir, local }) {
  const turno = v.jugadores.find((j) => j.id === v.turno);
  const mio = local || v.turno === v.yo?.id;
  const extra = (j) => <small className="ar-vida">{j.vida > 0 ? `❤️ ${j.vida}` : '💀'}</small>;
  return (
    <>
      <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={`💥 Turno ${v.ronda}`} turno={v.turno} extra={extra}
        etiqueta={mio ? (local ? `Dispara ${turno?.nombre}` : '¡Te toca disparar!') : `Apunta ${turno?.nombre}`} titulo={`💨 Viento ${v.viento === 0 ? 'en calma' : `${v.viento > 0 ? '→' : '←'} ${Math.abs(v.viento)}`}`} />
      {!local && <AvisoTurno clave={v.turno === v.yo?.id ? `t${v.ultimo?.n ?? 0}` : null} emoji="💥" texto="¡Te toca disparar!" id={v.yo?.id} />}
      <p className="pzp-nota ar-reloj">⏱️ <Restante v={v} /></p>
      <Escenario v={v} enviar={enviar} local={local} />
    </>
  );
}

const JUEGO = {
  id: 'artilleria',
  api: '/api/artilleria',
  emoji: '💥',
  config: {},
  tiempoReal: true,
  Partida: (props) => <Partida {...props} />,
  Local: (props) => <LocalPorTurnos {...props} E={E} />,
  textoEmpezar: '¡A las trincheras!',
  notaSala: '💥 Por turnos: apunta, calcula el viento y dispara. Gana el último tanque en pie.',
  ganador: (n) => `¡${n.join(' y ')} ${n.length > 1 ? 'dominan' : 'domina'} el campo de batalla!`,
  detalleFin: (j) => (j.puntos > 0 ? `${j.puntos} de vida` : 'destruido'),
  unidadPuntos: '❤️'
};

export default function Artilleria({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
