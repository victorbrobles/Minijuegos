// client/src/games/Curling/Curling.jsx
// «Curling»: desliza sobre el hielo para apuntar, elige el efecto (y si quieres, la piedra pesada) y mantén pulsado
// «LANZAR»: la barra de fuerza sube y baja; suelta en el punto justo. Mientras la piedra desliza, FROTA la pantalla
// para barrer: llega más lejos y se curva menos. El hielo cambia cada manga. Online o en un solo móvil por turnos.
import React, { useEffect, useRef, useState } from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import LocalPorTurnos from '../comun/LocalPorTurnos.jsx';
import { useReloj } from '../comun/Lienzo2D.jsx';
import Lienzo3D from '../comun/Lienzo3D.jsx';
import { THREE, crea } from '../Habilidad/tres.js';
import { Hero, Pildoras, AvisoTurno, useLatido, colorDe } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import { sonar, vibrar } from '../../lib/sonido.js';
import * as E from './engine.js';
import './Curling.css';

const PERIODO = 1100; // ms de la barra de fuerza (ida y vuelta)

/* ───────── Escena 3D: pabellón de hielo ───────── */
function texturaHielo() {
  const k = 14; const c = document.createElement('canvas'); c.width = E.W * k; c.height = E.L * k; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, c.height); g.addColorStop(0, '#f8fdff'); g.addColorStop(1, '#e6f4fb'); x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(148,163,184,${Math.random() * 0.12})`; x.fillRect(Math.random() * c.width, Math.random() * c.height, 1.5, 1.5); } // «pebble» del hielo
  const Y = (y) => y * k; const X = (xx) => xx * k;
  // Casa (anillos) en las dos puntas, como en una pista de verdad
  [E.CASA.y, E.L - E.CASA.y].forEach((cy) => [[12, '#1d4ed8'], [8, '#f8fdff'], [4, '#dc2626'], [1.4, '#f8fdff']].forEach(([r, col]) => { x.fillStyle = col; x.beginPath(); x.arc(X(E.CASA.x), Y(cy), r * k, 0, Math.PI * 2); x.fill(); }));
  x.strokeStyle = 'rgba(15,23,42,0.35)'; x.lineWidth = 3; x.beginPath(); x.moveTo(X(E.W / 2), 0); x.lineTo(X(E.W / 2), c.height); x.stroke();
  [[E.HOG, '#1d4ed8', 8], [E.L - E.HOG, '#1d4ed8', 8], [E.FONDO, '#dc2626', 4], [E.CASA.y, '#0f172a', 2]].forEach(([y, col, w]) => { x.strokeStyle = col; x.lineWidth = w; x.beginPath(); x.moveTo(0, Y(y)); x.lineTo(c.width, Y(y)); x.stroke(); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function piedraModelo(color, pesada) {
  const g = new THREE.Group();
  const granito = crea.cilindro(E.R, E.R * 0.92, 0.85, pesada ? 0x374151 : 0x6b7280, 40, { roughness: 0.45, metalness: pesada ? 0.4 : 0.1 }); granito.position.y = 0.45; g.add(granito);
  const banda = crea.cilindro(E.R * 1.01, E.R * 1.01, 0.22, pesada ? 0xf97316 : 0x9ca3af, 40, pesada ? { emissive: 0xf97316, emissiveIntensity: 0.9 } : { roughness: 0.3 }); banda.position.y = 0.45; g.add(banda);
  const tapa = crea.cilindro(E.R * 0.7, E.R * 0.75, 0.12, 0x111827, 32); tapa.position.y = 0.92; g.add(tapa);
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.3, emissive: new THREE.Color(color), emissiveIntensity: 0.25 });
  const asa = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, E.R * 1.3), mat); asa.position.set(0, 1.22, -0.15); g.add(asa);
  const pie = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.4, 0.32), mat); pie.position.set(0, 1.0, 0.4); g.add(pie);
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  return g;
}
/** Barrendero: cuerpo, cabeza y escoba (la escoba se anima al barrer). */
function barrenderoModelo() {
  const g = new THREE.Group();
  const ropa = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 });
  const cuerpo = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 1.7, 16), ropa); cuerpo.position.y = 1.05; g.add(cuerpo);
  const cabeza = crea.esfera(0.38, 0xfcd9b6); cabeza.position.y = 2.2; g.add(cabeza);
  const gorro = crea.cilindro(0.3, 0.4, 0.3, 0x0f172a, 16); gorro.position.y = 2.5; g.add(gorro);
  const escoba = new THREE.Group(); g.add(escoba);
  const palo = crea.cilindro(0.06, 0.06, 2.4, 0xfacc15, 8); palo.position.set(0, 0.95, 0); palo.rotation.z = 0.75; escoba.add(palo);
  const cepillo = crea.caja(1.1, 0.16, 0.36, 0x111827); cepillo.position.set(-0.85, 0.08, 0); escoba.add(cepillo);
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  return { g, ropa, escoba };
}
function montarPabellon(ctx, util) {
  const { scene } = ctx; const { a3 } = util;
  const hielo = new THREE.Mesh(new THREE.PlaneGeometry(E.W, E.L), new THREE.MeshStandardMaterial({ map: texturaHielo(), roughness: 0.12, metalness: 0.05, envMapIntensity: 1.2 })); hielo.rotation.x = -Math.PI / 2; hielo.receiveShadow = true; scene.add(hielo);
  const suelo = crea.suelo(E.W + 60, E.L + 60, 0x1e293b, { celda: 4 }); suelo.position.y = -0.3; scene.add(suelo);
  [-1, 1].forEach((s) => { const b = crea.caja(1, 1.2, E.L, 0x1e40af, { roughness: 0.4 }); b.position.set(s * (E.W / 2 + 0.5), 0.3, 0); scene.add(b); const neon = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, E.L), crea.neon(0x38bdf8, 1.6)); neon.position.set(s * (E.W / 2 + 0.5), 0.95, 0); scene.add(neon); });
  const fondoB = crea.caja(E.W + 2, 1.2, 1, 0x1e40af); fondoB.position.set(0, 0.3, E.L / 2 + 0.5); scene.add(fondoB);
  // Gradas y público a los lados, banderolas y focos
  const publico = new THREE.InstancedMesh(new THREE.SphereGeometry(0.7, 8, 6), new THREE.MeshStandardMaterial({ roughness: 0.6 }), 1200);
  { const m4 = new THREE.Matrix4(); const c = new THREE.Color(); let n = 0;
    [-1, 1].forEach((s) => { for (let f = 0; f < 4; f++) { const esc = crea.caja(3.4, 1.8, E.L, 0x334155); esc.position.set(s * (E.W / 2 + 5 + f * 3), 0.9 + f * 1.8, 0); scene.add(esc); for (let z = -E.L / 2; z < E.L / 2 && n < 1200; z += 1.7) { m4.makeTranslation(s * (E.W / 2 + 5 + f * 3) + (Math.random() - 0.5) * 0.6, 2.4 + f * 1.8, z); publico.setMatrixAt(n, m4); publico.setColorAt(n, c.setHex([0xef4444, 0xffffff, 0x3b82f6, 0xfacc15, 0x22c55e][Math.floor(Math.random() * 5)])); n++; } } });
    publico.count = n; }
  scene.add(publico);
  for (let z = -E.L / 2 + 10; z < E.L / 2; z += 22) { const luz = crea.caja(8, 0.4, 3, 0xffffff, { emissive: 0xffffff, emissiveIntensity: 1.4 }); luz.position.set(0, 22, z); scene.add(luz); }
  const piedras = [];
  const pedir = (i, color, pesada) => {
    const clave = `${color}${pesada ? 'P' : ''}`;
    if (piedras[i]?.clave !== clave) { if (piedras[i]) scene.remove(piedras[i].m); piedras[i] = { m: piedraModelo(color, pesada), clave }; scene.add(piedras[i].m); }
    return piedras[i].m;
  };
  const linea = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 1), new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.45 })); linea.rotation.x = -Math.PI / 2; linea.position.y = 0.02; scene.add(linea);
  const diana = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.95, 24), new THREE.MeshBasicMaterial({ color: 0xfacc15 })); diana.rotation.x = -Math.PI / 2; diana.position.y = 0.03; scene.add(diana);
  const efectos = { 1: crea.texto('↺', { tam: 3, color: '#0f172a' }), '-1': crea.texto('↻', { tam: 3, color: '#0f172a' }) }; // +x = izquierda en pantalla Object.values(efectos).forEach((e) => scene.add(e));
  const barrenderos = [barrenderoModelo(), barrenderoModelo()]; barrenderos.forEach((b) => { b.g.visible = false; scene.add(b.g); });
  const cam = { p: a3(E.W / 2, E.HOG - 22, 15), mira: a3(E.CASA.x, E.CASA.y, 0) };
  return { ctx, piedras, pedir, linea, diana, efectos, barrenderos, cam, chispa: 0 };
}
// lista: [[x, y, color, pesada], …] (la primera es la que se mueve si hay tiro); apunta: { anim, mio, ang, efecto, barre, color }
function pintarPabellon(o, lista, apunta, util, dt, t) {
  const { a3 } = util;
  lista.forEach(([x, y, color, pesada], i) => { const m = o.pedir(i, color, pesada); m.visible = y > -5; m.position.copy(a3(x, y)); m.rotation.y += i === 0 && apunta?.anim ? dt * 2 : 0; });
  o.piedras.forEach((p, i) => { if (i >= lista.length) p.m.visible = false; });
  // Guía de puntería: solo el primer tramo (el efecto y la fuerza los tienes que calcular tú)
  const ver = Boolean(apunta?.mio);
  o.linea.visible = ver; o.diana.visible = ver; Object.entries(o.efectos).forEach(([k, e]) => { e.visible = ver && String(apunta?.efecto) === k; });
  if (ver) {
    const rad = (apunta.ang * Math.PI) / 180; const yFin = E.HOG + 6; const yIni = E.HOG - 26;
    const xIni = E.SALIDA.x + Math.tan(rad) * (yIni - E.SALIDA.y); const xFin = E.SALIDA.x + Math.tan(rad) * (yFin - E.SALIDA.y);
    const a = a3(xIni, yIni, 0.02); const b = a3(xFin, yFin, 0.02); const mid = a.clone().add(b).multiplyScalar(0.5); const largo = a.distanceTo(b);
    o.linea.position.set(mid.x, 0.02, mid.z); o.linea.scale.y = largo; o.linea.rotation.z = Math.atan2(b.x - a.x, b.z - a.z);
    o.diana.position.set(b.x, 0.03, b.z);
    if (apunta.efecto) o.efectos[String(apunta.efecto)].position.set(b.x + apunta.efecto * 3, 2.5, b.z - 2);
  }
  // Barrenderos delante de la piedra que desliza
  const moviendo = apunta?.barre != null && lista.length && lista[0][1] > -5;
  o.barrenderos.forEach((b, i) => {
    b.g.visible = Boolean(moviendo);
    if (!moviendo) return;
    const [x, y] = lista[0]; const lado = i ? 1 : -1; const n = apunta.barre;
    b.g.position.copy(a3(x + lado * 2.3, y + 2.4 + i * 0.9)); b.g.rotation.y = lado > 0 ? 0 : Math.PI;
    b.ropa.color.set(apunta.color || '#2563eb');
    b.escoba.position.z = n ? Math.sin(t * 26 + i * 2) * (0.25 + n * 0.22) : 0;
    b.escoba.position.x = n ? -0.2 : 0.3;
  });
  if (moviendo && apunta.barre) {
    o.chispa -= dt;
    if (o.chispa <= 0) { o.chispa = 0.12 / apunta.barre; const [x, y] = lista[0]; o.ctx.chispas?.(a3(x + (Math.random() - 0.5) * 2, y + 2.6, 0.1), 0xe0f2fe, 4, { fuerza: 2, tam: 0.07, gravedad: 6 }); }
  }
  // Cámara: detrás de la piedra mientras viaja; si no, mirando la casa
  const cam = o.ctx.camera; const k = o.ctx.ancho(0.6); let destP; let destM;
  if (apunta?.anim && lista.length) { const [x, y] = lista[0]; const yc = Math.min(y, E.CASA.y - 6); destP = a3(E.W / 2, yc - 16 * k, 8 + 3 * k); destM = a3(x * 0.3 + E.W / 2 * 0.7, Math.min(E.CASA.y, y + 14), 0); }
  else { destP = a3(E.W / 2, E.HOG - 8 - 10 * k, 13 + 6 * k); destM = a3(E.CASA.x, E.CASA.y - 2, 0); }
  const s = 1 - Math.exp(-(dt || 0.016) * 3); o.cam.p.lerp(destP, s); o.cam.mira.lerp(destM, s);
  cam.position.copy(o.cam.p); cam.lookAt(o.cam.mira);
}

const FPS_SIM = 120; // fotogramas de simulación por segundo real (la piedra se ve a doble velocidad)
const nivelDe = (e) => (e > 260 ? 3 : e > 150 ? 2 : e > 55 ? 1 : 0);

function Pista({ v, enviar, local }) {
  const miTurno = v.fase === 'turno' && (local || v.turno === v.yo?.id);
  const tirador = v.jugadores.find((j) => j.id === v.turno);
  const hielo = E.HIELOS.find((h) => h.id === v.hielo) || E.HIELOS[1];
  const [ang, setAng] = useState(0);
  const [efecto, setEfecto] = useState(0);
  const [pesada, setPesada] = useState(false);
  const angRef = useRef(0); angRef.current = ang; const efectoRef = useRef(0); efectoRef.current = efecto;
  const [, setVer] = useState(0);
  const [animando, setAnimando] = useState(false);
  const anim = useRef(null);
  const carga = useRef(null);
  const [pot, setPot] = useState(null);
  // Lanzamiento en directo (el que tira barre mientras la piedra desliza)
  const vivo = useRef(null); const [enVivo, setEnVivo] = useState(false);
  const propio = useRef(false);
  const energia = useRef(0); const nivel = useRef(0); const ultimoPt = useRef(null);
  const medidor = useRef(null);
  const datos = useRef({}); datos.current = { v, enviar };
  const ocupado = animando || enVivo;

  const ultimoN = v.ultimo?.n;
  useEffect(() => {
    const u = v.ultimo;
    if (propio.current) { propio.current = false; vivo.current = null; setEnVivo(false); setPesada(false); return undefined; }
    vivo.current = null; setEnVivo(false);
    if (!u?.tiro) return undefined;
    const r = E.simularLanzamiento(u.antes, u.tiro, u.de, u.hielo);
    anim.current = { frames: r.frames, ids: [{ de: u.de, pesada: u.tiro.pesada }, ...u.antes], t0: performance.now(), barrido: u.tiro.barrido || [] };
    setAnimando(true); setVer((x) => x + 1); sonar('toque');
    const t = setTimeout(() => { setAnimando(false); anim.current = null; setVer((x) => x + 1); }, (r.frames.length / 40) * 1000 + 200);
    return () => clearTimeout(t);
  }, [ultimoN]); // eslint-disable-line react-hooks/exhaustive-deps

  const puntero = (tipo, x) => {
    if (!miTurno || ocupado || tipo === 'up') return;
    if (tipo === 'down' || tipo === 'move') {
      const a = (Math.atan((x - E.SALIDA.x) / (E.CASA.y - E.SALIDA.y)) * 180) / Math.PI;
      setAng(Math.max(-10, Math.min(10, Math.round(a * 10) / 10))); setVer((n) => n + 1);
    }
  };

  // Barrer: frotar la pantalla (cuanto más rápido, más fuerte) o pulsar la barra espaciadora
  const frotar = (e) => {
    if (!vivo.current || vivo.current.hecho) return;
    if (e.type === 'pointerdown') { ultimoPt.current = [e.clientX, e.clientY]; return; }
    if (e.type !== 'pointermove' || (e.pointerType !== 'mouse' && !ultimoPt.current)) return;
    if (e.pointerType === 'mouse' && !e.buttons && !ultimoPt.current) { ultimoPt.current = [e.clientX, e.clientY]; return; }
    const [x0, y0] = ultimoPt.current || [e.clientX, e.clientY];
    energia.current = Math.min(420, energia.current + Math.abs(e.clientX - x0) + Math.abs(e.clientY - y0) * 0.6);
    ultimoPt.current = [e.clientX, e.clientY];
  };
  const soltarDedo = (e) => { if (e.pointerType !== 'mouse') ultimoPt.current = null; };
  useEffect(() => {
    if (!enVivo) return undefined;
    const tecla = (e) => { if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); energia.current = Math.min(420, energia.current + 85); } };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [enVivo]);

  // Barra de fuerza: sube y baja mientras se mantiene pulsado (rápida: hay que soltar en el momento justo)
  useEffect(() => {
    if (pot == null) return undefined;
    let r; const paso = () => { if (!carga.current) return; const t = ((performance.now() - carga.current) % PERIODO) / PERIODO; setPot(Math.round((t < 0.5 ? t * 2 : 2 - t * 2) * 100)); r = requestAnimationFrame(paso); };
    r = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(r);
  }, [pot != null]); // eslint-disable-line react-hooks/exhaustive-deps
  const empezarCarga = (e) => { if (!miTurno || ocupado) return; try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* nada */ } carga.current = performance.now(); setPot(0); };
  const soltar = () => {
    if (!carga.current) return;
    const t = ((performance.now() - carga.current) % PERIODO) / PERIODO; const valor = Math.round((t < 0.5 ? t * 2 : 2 - t * 2) * 100);
    carga.current = null; setPot(null); vibrar(15); sonar('toque');
    // Empieza el lanzamiento en directo: la misma simulación que hará el servidor, con el barrido que vayas haciendo
    const barrido = [];
    const usaPesada = pesada && tirador?.pesada;
    const tiro = E.tiroDe(ang, valor, efecto, usaPesada, barrido);
    vivo.current = { sim: E.crearLanzamiento(v.piedras, tiro, v.turno, v.hielo), barrido, t0: performance.now(), datos: { ang, pot: valor, efecto, pesada: usaPesada }, de: v.turno, hecho: false };
    energia.current = 0; nivel.current = 0; ultimoPt.current = null;
    setEnVivo(true);
  };
  const terminarVivo = () => {
    const vv = vivo.current; if (!vv || vv.enviado) return;
    vv.enviado = true;
    let b = vv.barrido.slice(); while (b.length && !b[b.length - 1]) b.pop();
    propio.current = true;
    setTimeout(() => {
      datos.current.enviar('lanzar', { ...vv.datos, barrido: b });
      // Si por lo que sea no llega respuesta, no se queda bloqueado
      setTimeout(() => { if (vivo.current === vv) { propio.current = false; vivo.current = null; setEnVivo(false); } }, 6000);
    }, 0);
  };

  return (
    <div className="cu-caja" onPointerDown={frotar} onPointerMove={frotar} onPointerUp={soltarDedo} onPointerCancel={soltarDedo}>
      <Lienzo3D ancho={E.W} alto={E.L} opciones={{ cielo: [0x0f172a, 0x1e3a8a], exposicion: 1.1 }} montar={montarPabellon}
        dibujar={(o, t, util, dt) => {
          // Energía del barrido: sube al frotar y se va gastando
          energia.current *= Math.exp(-(dt || 0.016) * 5); nivel.current = nivelDe(energia.current);
          if (medidor.current) medidor.current.dataset.n = String(nivel.current);
          const a = anim.current; const vv = vivo.current; let lista; let barre = null; let color = null;
          if (vv) {
            if (!vv.hecho) {
              const objetivo = Math.floor(((performance.now() - vv.t0) / 1000) * FPS_SIM);
              let k = 0;
              while (vv.sim.f <= objetivo && !vv.sim.acabado && k < 60) {
                const slot = Math.floor(vv.sim.f / E.BARRIDO_FRAMES);
                while (vv.barrido.length <= slot) vv.barrido.push(nivel.current);
                vv.sim.paso(); k += 1;
              }
              if (vv.sim.acabado) { vv.hecho = true; E.cerrarLanzamiento(vv.sim.cs); terminarVivo(); }
            }
            lista = vv.sim.cs.map((c) => [c.x, c.fuera ? -10 : c.y, colorDe(c.de), c.pesada]);
            barre = vv.hecho ? null : nivel.current; color = colorDe(vv.de);
          } else if (a) {
            const f = Math.min(a.frames.length - 1, Math.floor(((performance.now() - a.t0) / 1000) * 40));
            lista = a.ids.map((s, i) => [a.frames[f][i][0], a.frames[f][i][1], colorDe(s.de), s.pesada]);
            barre = f < a.frames.length - 1 ? E.barridoEn(a.barrido, f * 3) : null; color = colorDe(a.ids[0].de);
          } else lista = v.piedras.map((s) => [s.x, s.y, colorDe(s.de), s.pesada]);
          pintarPabellon(o, lista, { anim: Boolean(a || vv), mio: miTurno && !a && !vv, ang: angRef.current, efecto: efectoRef.current, barre, color }, util, dt, t);
        }}
        onPuntero={puntero} />
      {enVivo && (
        <div className="cu-barrer" ref={medidor} data-n="0">
          <b>🧹 ¡Frota la pantalla para barrer!</b>
          <span className="cu-escoba"><i /><i /><i /></span>
          <small>Barrer = llega más lejos y se curva menos · en ordenador: arrastra o pulsa espacio</small>
        </div>
      )}
      {miTurno && !ocupado && (
        <div className="cu-mandos">
          <p className="cu-ayuda">Desliza sobre el hielo para apuntar · {ang > 0 ? '+' : ''}{ang}° · <span className={`cu-hielo cu-hielo-${hielo.id}`}>{hielo.emoji} {hielo.nombre}</span></p>
          <div className="cu-efecto">
            {/* La cámara mira la pista desde atrás: la x del juego crece hacia la izquierda de la pantalla */}
            {[[1, '↺ Izquierda'], [0, '· Recta'], [-1, 'Derecha ↻']].map(([e, t]) => <button key={e} type="button" className={efecto === e ? 'sel' : ''} onClick={() => setEfecto(e)}>{t}</button>)}
          </div>
          <button type="button" className={`cu-pesada${pesada && tirador?.pesada ? ' sel' : ''}`} disabled={!tirador?.pesada} onClick={() => setPesada((x) => !x)}>
            💥 Piedra pesada {tirador?.pesada ? (pesada ? '· activada' : '· 1 por manga') : '· ya usada'}
          </button>
          <div className="cu-barra"><i style={{ width: `${pot ?? 0}%` }} /></div>
          <button type="button" className="pzp-boton grande cu-lanzar" onPointerDown={empezarCarga} onPointerUp={soltar} onPointerCancel={soltar} onContextMenu={(e) => e.preventDefault()}>
            {pot == null ? '🥌 Mantén pulsado y suelta' : `Fuerza ${pot}`}
          </button>
        </div>
      )}
      {!miTurno && v.fase === 'turno' && !ocupado && <p className="cu-ayuda cu-espera">{hielo.emoji} {hielo.nombre} · {tirador?.nombre} está apuntando…</p>}
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
  const extra = (j) => <small className="cu-quedan"><i style={{ background: colorDe(j.id) }} />{'●'.repeat(j.quedan)}</small>;
  if (v.fase === 'manga' && v.resumen) {
    return (
      <>
        <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={`🥌 Manga ${v.manga}/${v.mangas}`} extra={extra} etiqueta="Fin de la manga"
          titulo={v.resumen.ganador != null ? `${v.resumen.nombre} suma ${v.resumen.puntos} ${v.resumen.puntos === 1 ? 'punto' : 'puntos'}` : 'Nadie en la casa: manga en blanco'} clase="fin" />
        <Pista v={{ ...v, piedras: v.resumen.piedras, fase: 'manga' }} enviar={enviar} local={local} />
      </>
    );
  }
  return (
    <>
      <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={`🥌 Manga ${v.manga}/${v.mangas} · piedra ${Math.min(v.total, v.lanzadas + 1)}/${v.total}`} turno={v.turno} extra={extra}
        etiqueta={mio ? (local ? `Lanza ${turno?.nombre}` : '¡Te toca lanzar!') : `Lanza ${turno?.nombre}`} titulo="Acerca tus piedras al centro" />
      {!local && <AvisoTurno clave={v.turno === v.yo?.id ? `t${v.ultimo?.n ?? 0}` : null} emoji="🥌" texto="¡Te toca lanzar!" id={v.yo?.id} />}
      <p className="pzp-nota cu-reloj">⏱️ <Restante v={v} /></p>
      <Pista v={v} enviar={enviar} local={local} />
    </>
  );
}

function Config({ config, onCambiar }) {
  return (
    <BloqueConfig titulo="Mangas">
      <Pildoras opciones={E.OPCIONES_MANGAS.map((n) => [n, `${n} mangas`])} valor={config.mangas} onCambiar={onCambiar && ((mangas) => onCambiar({ mangas }))} />
    </BloqueConfig>
  );
}

const JUEGO = {
  id: 'curling',
  api: '/api/curling',
  emoji: '🥌',
  config: { mangas: 3 },
  tiempoReal: true,
  Partida: (props) => <Partida {...props} />,
  Config,
  Local: (props) => <LocalPorTurnos {...props} E={E} />,
  textoEmpezar: '¡Al hielo!',
  notaSala: '🥌 Por turnos: apunta, elige efecto, suelta la barra de fuerza y frota la pantalla para barrer mientras desliza.',
  ganador: (n) => `¡${n.join(' y ')} ${n.length > 1 ? 'dominan' : 'domina'} el hielo!`,
  detalleFin: (j) => `${j.puntos} ${j.puntos === 1 ? 'punto' : 'puntos'}`
};

export default function Curling({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
