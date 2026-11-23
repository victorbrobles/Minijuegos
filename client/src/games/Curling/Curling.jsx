// client/src/games/Curling/Curling.jsx
// «Curling»: se ve la zona de la diana. Desliza sobre el hielo para apuntar, elige el efecto y mantén pulsado
// «LANZAR»: la barra de fuerza sube y baja; suelta en el punto justo. Online o en un solo móvil por turnos.
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

const PERIODO = 1500; // ms de la barra de fuerza (ida y vuelta)

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
function piedraModelo(color) {
  const g = new THREE.Group();
  const granito = crea.cilindro(E.R, E.R * 0.92, 0.85, 0x6b7280, 40, { roughness: 0.45, metalness: 0.1 }); granito.position.y = 0.45; g.add(granito);
  const banda = crea.cilindro(E.R * 1.01, E.R * 1.01, 0.22, 0x9ca3af, 40, { roughness: 0.3 }); banda.position.y = 0.45; g.add(banda);
  const tapa = crea.cilindro(E.R * 0.7, E.R * 0.75, 0.12, 0x111827, 32); tapa.position.y = 0.92; g.add(tapa);
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.3, emissive: new THREE.Color(color), emissiveIntensity: 0.25 });
  const asa = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, E.R * 1.3), mat); asa.position.set(0, 1.22, -0.15); g.add(asa);
  const pie = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.4, 0.32), mat); pie.position.set(0, 1.0, 0.4); g.add(pie);
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  return g;
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
  const piedras = []; const pedir = (i, color) => { if (!piedras[i]) { piedras[i] = { m: piedraModelo(color), color }; scene.add(piedras[i].m); } else if (piedras[i].color !== color) { scene.remove(piedras[i].m); piedras[i] = { m: piedraModelo(color), color }; scene.add(piedras[i].m); } return piedras[i].m; };
  const linea = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 1), new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.45 })); linea.rotation.x = -Math.PI / 2; linea.position.y = 0.02; scene.add(linea);
  const diana = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.95, 24), new THREE.MeshBasicMaterial({ color: 0xfacc15 })); diana.rotation.x = -Math.PI / 2; diana.position.y = 0.03; scene.add(diana);
  const efectos = { 1: crea.texto('↻', { tam: 3, color: '#0f172a' }), '-1': crea.texto('↺', { tam: 3, color: '#0f172a' }) }; Object.values(efectos).forEach((e) => scene.add(e));
  const cam = { p: a3(E.W / 2, E.HOG - 22, 15), mira: a3(E.CASA.x, E.CASA.y, 0) };
  return { ctx, piedras, pedir, linea, diana, efectos, cam };
}
function pintarPabellon(o, lista, apunta, util, dt) {
  const { a3 } = util;
  lista.forEach(([x, y, color], i) => { const m = o.pedir(i, color); m.visible = y > -5; m.position.copy(a3(x, y)); m.rotation.y += i === 0 && apunta?.anim ? dt * 2 : 0; });
  o.piedras.forEach((p, i) => { if (i >= lista.length) p.m.visible = false; });
  // Línea de puntería hasta la casa
  const ver = Boolean(apunta?.mio);
  o.linea.visible = ver; o.diana.visible = ver; Object.entries(o.efectos).forEach(([k, e]) => { e.visible = ver && String(apunta?.efecto) === k; });
  if (ver) {
    const rad = (apunta.ang * Math.PI) / 180; const xCasa = E.SALIDA.x + Math.tan(rad) * (E.CASA.y - E.SALIDA.y); const yIni = E.HOG - 20;
    const xIni = E.SALIDA.x + Math.tan(rad) * (yIni - E.SALIDA.y);
    const a = a3(xIni, yIni, 0.02); const b = a3(xCasa, E.CASA.y, 0.02); const mid = a.clone().add(b).multiplyScalar(0.5); const largo = a.distanceTo(b);
    o.linea.position.set(mid.x, 0.02, mid.z); o.linea.scale.y = largo; o.linea.rotation.z = Math.atan2(b.x - a.x, b.z - a.z);
    o.diana.position.set(b.x, 0.03, b.z);
    if (apunta.efecto) o.efectos[String(apunta.efecto)].position.set(b.x + apunta.efecto * 3, 2.5, b.z - 4);
  }
  // Cámara: detrás de la piedra mientras viaja; si no, mirando la casa
  const cam = o.ctx.camera; const k = o.ctx.ancho(0.6); let destP; let destM;
  if (apunta?.anim && lista.length) { const [x, y] = lista[0]; const yc = Math.min(y, E.CASA.y - 6); destP = a3(E.W / 2, yc - 16 * k, 8 + 3 * k); destM = a3(x * 0.3 + E.W / 2 * 0.7, Math.min(E.CASA.y, y + 14), 0); }
  else { destP = a3(E.W / 2, E.HOG - 8 - 10 * k, 13 + 6 * k); destM = a3(E.CASA.x, E.CASA.y - 2, 0); }
  const s = 1 - Math.exp(-(dt || 0.016) * 3); o.cam.p.lerp(destP, s); o.cam.mira.lerp(destM, s);
  cam.position.copy(o.cam.p); cam.lookAt(o.cam.mira);
}

function Pista({ v, enviar, local }) {
  const miTurno = v.fase === 'turno' && (local || v.turno === v.yo?.id);
  const [ang, setAng] = useState(0);
  const [efecto, setEfecto] = useState(0);
  const angRef = useRef(0); angRef.current = ang; const efectoRef = useRef(0); efectoRef.current = efecto;
  const [, setVer] = useState(0);
  const [animando, setAnimando] = useState(false);
  const anim = useRef(null);
  const carga = useRef(null);
  const [pot, setPot] = useState(null);

  const ultimoN = v.ultimo?.n;
  useEffect(() => {
    const u = v.ultimo;
    if (!u?.tiro) return undefined;
    const r = E.simularLanzamiento(u.antes, u.tiro, u.de);
    anim.current = { frames: r.frames, ids: [{ de: u.de }, ...u.antes], t0: performance.now() };
    setAnimando(true); setVer((x) => x + 1); sonar('toque');
    const t = setTimeout(() => { setAnimando(false); anim.current = null; setVer((x) => x + 1); }, (r.frames.length / 40) * 1000 + 200);
    return () => clearTimeout(t);
  }, [ultimoN]); // eslint-disable-line react-hooks/exhaustive-deps

  const puntero = (tipo, x) => {
    if (!miTurno || animando || tipo === 'up') return;
    if (tipo === 'down' || tipo === 'move') {
      const a = (Math.atan((x - E.SALIDA.x) / (E.CASA.y - E.SALIDA.y)) * 180) / Math.PI;
      setAng(Math.max(-10, Math.min(10, Math.round(a * 10) / 10))); setVer((n) => n + 1);
    }
  };

  // Barra de fuerza: sube y baja mientras se mantiene pulsado
  useEffect(() => {
    if (pot == null) return undefined;
    let r; const paso = () => { if (!carga.current) return; const t = ((performance.now() - carga.current) % PERIODO) / PERIODO; setPot(Math.round((t < 0.5 ? t * 2 : 2 - t * 2) * 100)); r = requestAnimationFrame(paso); };
    r = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(r);
  }, [pot != null]); // eslint-disable-line react-hooks/exhaustive-deps
  const empezarCarga = (e) => { if (!miTurno || animando) return; try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* nada */ } carga.current = performance.now(); setPot(0); };
  const soltar = () => {
    if (!carga.current) return;
    const t = ((performance.now() - carga.current) % PERIODO) / PERIODO; const valor = Math.round((t < 0.5 ? t * 2 : 2 - t * 2) * 100);
    carga.current = null; setPot(null); vibrar(15);
    enviar('lanzar', { ang, pot: valor, efecto });
  };

  return (
    <div className="cu-caja">
      <Lienzo3D ancho={E.W} alto={E.L} opciones={{ cielo: [0x0f172a, 0x1e3a8a], exposicion: 1.1 }} montar={montarPabellon}
        dibujar={(o, t, util, dt) => {
          const a = anim.current; let lista;
          if (a) { const f = Math.min(a.frames.length - 1, Math.floor(((performance.now() - a.t0) / 1000) * 40)); lista = a.ids.map((s, i) => [a.frames[f][i][0], a.frames[f][i][1], colorDe(s.de)]); }
          else lista = v.piedras.map((s) => [s.x, s.y, colorDe(s.de)]);
          pintarPabellon(o, lista, { anim: Boolean(a), mio: miTurno && !a, ang: angRef.current, efecto: efectoRef.current }, util, dt);
        }}
        onPuntero={puntero} />
      {miTurno && !animando && (
        <div className="cu-mandos">
          <p className="cu-ayuda">Desliza sobre el hielo para apuntar · ángulo {ang > 0 ? '+' : ''}{ang}°</p>
          <div className="cu-efecto">
            {[[-1, '↺ Izquierda'], [0, '· Recta'], [1, 'Derecha ↻']].map(([e, t]) => <button key={e} type="button" className={efecto === e ? 'sel' : ''} onClick={() => setEfecto(e)}>{t}</button>)}
          </div>
          <div className="cu-barra"><i style={{ width: `${pot ?? 0}%` }} /><span className="cu-ideal" /></div>
          <button type="button" className="pzp-boton grande cu-lanzar" onPointerDown={empezarCarga} onPointerUp={soltar} onPointerCancel={soltar} onContextMenu={(e) => e.preventDefault()}>
            {pot == null ? '🥌 Mantén pulsado y suelta' : `Fuerza ${pot}`}
          </button>
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
  notaSala: '🥌 Por turnos: apunta, elige efecto y suelta la barra de fuerza en el punto justo.',
  ganador: (n) => `¡${n.join(' y ')} ${n.length > 1 ? 'dominan' : 'domina'} el hielo!`,
  detalleFin: (j) => `${j.puntos} ${j.puntos === 1 ? 'punto' : 'puntos'}`
};

export default function Curling({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
