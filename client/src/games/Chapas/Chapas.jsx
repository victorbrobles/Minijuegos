// client/src/games/Chapas/Chapas.jsx
// «Fútbol chapas» (individual, 2-5 jugadores): estadio 3D. Con 2 jugadores el campo es rectangular; con más, es un
// polígono con una portería por jugador. La cámara gira para que la portería de quien tira (en un móvil) o la tuya
// (online) quede siempre abajo. Toca una de tus chapas, arrastra hacia atrás (como un tirachinas) y suelta.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import LocalPorTurnos from '../comun/LocalPorTurnos.jsx';
import { useReloj } from '../comun/Lienzo2D.jsx';
import Lienzo3D from '../comun/Lienzo3D.jsx';
import { THREE, crea } from '../Habilidad/tres.js';
import { Hero, Pildoras, AvisoTurno, useLatido } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import { sonar, vibrar } from '../../lib/sonido.js';
import * as E from './engine.js';
import './Chapas.css';

export const COLOR = ['#ef4444', '#2563eb', '#f59e0b', '#22c55e', '#a855f7'];
const EMBLEMA = ['🔴', '🔵', '🟠', '🟢', '🟣'];
// Arrastrar unas 13 unidades ya da la fuerza máxima (cabe en cualquier pantalla)
const FUERZA = E.VMAX / 13;

/* ───────── Campo (textura 2D que se pone sobre el césped 3D) ───────── */
function texturaCampo(cp) {
  const k = 14; const c = document.createElement('canvas'); c.width = cp.W * k; c.height = cp.H * k; const x = c.getContext('2d');
  // Recorte con la forma del campo
  const forma = () => { x.beginPath(); if (cp.n <= 2) { x.rect(0, 0, c.width, c.height); return; } cp.lados.forEach((l, i) => (i ? x.lineTo(l.a[0] * k, l.a[1] * k) : x.moveTo(l.a[0] * k, l.a[1] * k))); x.closePath(); };
  x.fillStyle = '#14532d'; x.fillRect(0, 0, c.width, c.height);
  x.save(); forma(); x.clip();
  for (let i = 0; i < 14; i++) { x.fillStyle = i % 2 ? '#15803d' : '#16a34a'; x.fillRect(0, (i * c.height) / 14, c.width, c.height / 14 + 1); }
  x.strokeStyle = 'rgba(255,255,255,0.88)'; x.lineWidth = k * 0.4;
  const [cx, cy] = cp.centro; x.beginPath(); x.arc(cx * k, cy * k, 9 * k, 0, Math.PI * 2); x.stroke();
  x.beginPath(); x.arc(cx * k, cy * k, 0.7 * k, 0, Math.PI * 2); x.fillStyle = '#ffffff'; x.fill();
  // Áreas delante de cada portería
  cp.lados.forEach((l) => {
    if (l.dueno == null) return; const [mx, my] = l.medio; const [nx, ny] = l.n; const [tx, ty] = l.t;
    const caja = (an, pr) => { x.beginPath(); x.moveTo((mx - tx * an) * k, (my - ty * an) * k); x.lineTo((mx - tx * an + nx * pr) * k, (my - ty * an + ny * pr) * k); x.lineTo((mx + tx * an + nx * pr) * k, (my + ty * an + ny * pr) * k); x.lineTo((mx + tx * an) * k, (my + ty * an) * k); x.stroke(); };
    caja(15, cp.n <= 2 ? 16 : 11); caja(7, cp.n <= 2 ? 6 : 4.5);
    x.fillStyle = `${COLOR[l.dueno]}33`; x.beginPath(); x.moveTo((mx - tx * 15) * k, (my - ty * 15) * k); x.lineTo((mx - tx * 15 + nx * (cp.n <= 2 ? 16 : 11)) * k, (my - ty * 15 + ny * (cp.n <= 2 ? 16 : 11)) * k); x.lineTo((mx + tx * 15 + nx * (cp.n <= 2 ? 16 : 11)) * k, (my + ty * 15 + ny * (cp.n <= 2 ? 16 : 11)) * k); x.lineTo((mx + tx * 15) * k, (my + ty * 15) * k); x.fill();
  });
  if (cp.n <= 2) { x.beginPath(); x.moveTo(0, cy * k); x.lineTo(c.width, cy * k); x.stroke(); }
  else cp.lados.forEach((l) => { x.beginPath(); x.moveTo(cx * k, cy * k); x.lineTo(l.a[0] * k, l.a[1] * k); x.setLineDash([k, k]); x.stroke(); x.setLineDash([]); });
  x.restore();
  forma(); x.lineWidth = k * 0.6; x.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function texturaBalon() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d');
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, 256, 128); x.fillStyle = '#111827';
  for (let i = 0; i < 9; i++) { const cx = (i * 61) % 256; const cy = 20 + ((i * 37) % 90); x.beginPath(); for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2 - Math.PI / 2; x.lineTo(cx + Math.cos(a) * 14, cy + Math.sin(a) * 14); } x.closePath(); x.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ───────── Estadio 3D ───────── */
function montarEstadio(ctx, util, n) {
  const { scene } = ctx; const { a3 } = util; const cp = E.campo(n); const ids = E.idsDe(n);
  const cesped = new THREE.Mesh(new THREE.PlaneGeometry(cp.W, cp.H), new THREE.MeshStandardMaterial({ map: texturaCampo(cp), roughness: 0.85 })); cesped.rotation.x = -Math.PI / 2; cesped.receiveShadow = true; scene.add(cesped);
  const fuera = crea.suelo(cp.W + 70, cp.H + 70, 0x14532d, { celda: 4, contraste: 0.04, lineas: false }); fuera.position.y = -0.05; scene.add(fuera);
  // Vallas publicitarias por cada lado del campo (sin tapar las porterías)
  const textos = ['🏆 LOS 100+ MINIJUEGOS', '⚽ FÚTBOL CHAPAS', '⚽ GOL ⚽ GOL ⚽', '🥅 ¡A PUERTA!'];
  cp.lados.forEach((l, i) => {
    const [nx, ny] = l.n; const ang = Math.atan2(nx, ny); const largo = l.largo + 4;
    const v = crea.cartel(textos[i % textos.length], largo, 2.2, { fondo: COLOR[(l.dueno ?? i + 1) % COLOR.length], color: '#ffffff', fuente: 'bold 30px sans-serif' });
    const p = a3(l.medio[0] - nx * 5.5, l.medio[1] - ny * 5.5, 1.1); v.position.copy(p); v.rotation.y = ang; scene.add(v);
    const tras = crea.caja(largo, 2.2, 0.3, 0x0f172a); tras.position.copy(a3(l.medio[0] - nx * 5.8, l.medio[1] - ny * 5.8, 1.1)); tras.rotation.y = ang; scene.add(tras);
  });
  // Grada con público alrededor y torres de focos
  const publico = new THREE.InstancedMesh(new THREE.SphereGeometry(0.9, 8, 6), new THREE.MeshStandardMaterial({ roughness: 0.6 }), 2200);
  { const m4 = new THREE.Matrix4(); const c = new THREE.Color(); let k = 0; const R0 = Math.max(cp.W, cp.H) * 0.5 + 12;
    for (let f = 0; f < 4; f++) { const R = R0 + f * 3.6; const paso = 2.1 / R; for (let a = 0; a < Math.PI * 2 && k < 2200; a += paso) { m4.makeTranslation(Math.cos(a) * R, 1.6 + f * 2.2, Math.sin(a) * R); publico.setMatrixAt(k, m4); publico.setColorAt(k, c.set(COLOR[Math.floor(Math.random() * Math.max(2, n))]).lerp(new THREE.Color(0xffffff), Math.random() * 0.35)); k++; }
      const anillo = new THREE.Mesh(new THREE.RingGeometry(R - 1.6, R + 1.6, 64), new THREE.MeshStandardMaterial({ color: 0x1e293b, side: THREE.DoubleSide })); anillo.rotation.x = -Math.PI / 2; anillo.position.y = 0.6 + f * 2.2; scene.add(anillo); }
    publico.count = k; }
  scene.add(publico);
  [0, 1, 2, 3].forEach((q) => { const a = q * Math.PI / 2 + Math.PI / 4; const R = Math.max(cp.W, cp.H) * 0.5 + 26; const torre = crea.cilindro(0.6, 0.9, 34, 0x475569, 8); torre.position.set(Math.cos(a) * R, 17, Math.sin(a) * R); scene.add(torre); const panel = crea.caja(7, 4, 0.8, 0xffffff, { emissive: 0xffffff, emissiveIntensity: 1.6 }); panel.position.set(Math.cos(a) * R, 34, Math.sin(a) * R); panel.lookAt(0, 0, 0); scene.add(panel); });
  // Porterías con red, una en cada lado con dueño, con un toque de su color
  cp.lados.forEach((l) => {
    if (l.dueno == null) return; const g = new THREE.Group(); const PR = E.PORTERIA;
    [-PR / 2, PR / 2].forEach((x) => { const p = crea.cilindro(0.45, 0.45, 4, 0xffffff, 12); p.position.set(x, 2, 0); g.add(p); });
    const lar = crea.cilindro(0.45, 0.45, PR + 0.9, 0xffffff, 12); lar.rotation.z = Math.PI / 2; lar.position.y = 4; g.add(lar);
    const pts = []; for (let x = -PR / 2; x <= PR / 2 + 1e-6; x += 1) pts.push(x, 0, -3.5, x, 4, -3.5, x, 4, 0, x, 4, -3.5); for (let y = 0; y <= 4; y += 1) pts.push(-PR / 2, y, -3.5, PR / 2, y, -3.5);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    g.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })));
    const franja = new THREE.Mesh(new THREE.BoxGeometry(PR, 0.25, 0.25), crea.neon(new THREE.Color(COLOR[l.dueno]).getHex(), 1.4)); franja.position.set(0, 4.5, 0); g.add(franja);
    g.position.copy(a3(l.medio[0], l.medio[1])); g.rotation.y = Math.atan2(l.n[0], l.n[1]); scene.add(g);
  });
  // Chapas: cilindro con borde blanco y emblema de su color; balón con textura
  const chapas = {}; const balon = new THREE.Mesh(new THREE.SphereGeometry(E.RB, 32, 20), new THREE.MeshStandardMaterial({ map: texturaBalon(), roughness: 0.4 })); balon.castShadow = true; scene.add(balon);
  ids.forEach((id) => {
    if (id === 'balon' || id.startsWith('poste')) return;
    const eq = Number(id[1]); const g = new THREE.Group();
    const cuerpo = crea.cilindro(E.RC, E.RC * 1.04, 1.3, new THREE.Color(COLOR[eq]).getHex(), 40, { roughness: 0.25, metalness: 0.3 }); cuerpo.position.y = 0.65; g.add(cuerpo);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(E.RC * 0.98, 0.22, 10, 40), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.6, roughness: 0.2 })); aro.rotation.x = Math.PI / 2; aro.position.y = 1.3; g.add(aro);
    const escudo = crea.cartel(EMBLEMA[eq], E.RC * 1.1, E.RC * 1.1, { fondo: null, fuente: '180px sans-serif' }); escudo.rotation.x = -Math.PI / 2; escudo.position.y = 1.33; g.add(escudo);
    scene.add(g); chapas[id] = g;
  });
  const anillo = new THREE.Mesh(new THREE.RingGeometry(E.RC * 1.25, E.RC * 1.55, 40), new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.95, side: THREE.DoubleSide })); anillo.rotation.x = -Math.PI / 2; anillo.visible = false; scene.add(anillo);
  const flecha = new THREE.Group(); const fMat = new THREE.MeshBasicMaterial({ color: 0x22c55e }); const asta = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 1), fMat); asta.position.z = 0.5; flecha.add(asta); const punta = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.6, 16), fMat); punta.rotation.x = Math.PI / 2; flecha.add(punta); flecha.visible = false; scene.add(flecha);
  return { ctx, cp, ids, chapas, balon, anillo, flecha, asta, fMat, prev: {}, giro: null };
}
function pintarEstadio(o, pos, sel, tiro, util, abajo, dt) {
  const { a3 } = util;
  o.ids.forEach((id, i) => {
    if (id.startsWith('poste')) return; const p = Array.isArray(pos) ? pos[i] : pos[id];
    const m = id === 'balon' ? o.balon : o.chapas[id]; if (!m) return;
    if (!p) { m.visible = false; return; } m.visible = true;
    const nuevo = a3(p[0], p[1], id === 'balon' ? E.RB : 0); const ant = o.prev[id];
    if (id === 'balon' && ant) { const d = nuevo.clone().sub(ant); if (d.lengthSq() > 1e-6) { const eje = new THREE.Vector3(d.z, 0, -d.x).normalize(); o.balon.rotateOnWorldAxis(eje, d.length() / E.RB); } }
    m.position.copy(nuevo); o.prev[id] = nuevo;
  });
  const s = sel && o.chapas[sel]; o.anillo.visible = Boolean(s); if (s) o.anillo.position.set(s.position.x, 0.06, s.position.z);
  if (tiro?.fin) {
    const dx = tiro.x0 - tiro.fin[0]; const dy = tiro.y0 - tiro.fin[1]; const fuerza = Math.min(1, (Math.hypot(dx, dy) * FUERZA) / E.VMAX);
    const largo = 4 + fuerza * 16; const ini = a3(tiro.x0, tiro.y0, 1); const ang = Math.atan2(dx, dy);
    o.flecha.visible = true; o.flecha.position.copy(ini).add(new THREE.Vector3(Math.sin(ang) * (E.RC + largo), 0, Math.cos(ang) * (E.RC + largo))); o.flecha.rotation.set(0, ang + Math.PI, 0);
    o.asta.scale.z = largo; o.asta.position.z = largo / 2; o.fMat.color.setHSL((120 - fuerza * 120) / 360, 0.9, 0.55);
  } else o.flecha.visible = false;
  // Cámara: detrás de la portería de `abajo` (gira suave al cambiar de turno) encuadrando todo el campo
  const l = o.cp.lados.find((x) => x.dueno === abajo) || o.cp.lados[0];
  const objetivo = Math.atan2(-l.n[0], -l.n[1]); // dirección desde el centro hacia esa portería
  if (o.giro == null) o.giro = objetivo;
  let dif = objetivo - o.giro; while (dif > Math.PI) dif -= Math.PI * 2; while (dif < -Math.PI) dif += Math.PI * 2;
  if (Math.abs(dif) > 0.002 || !o.encuadrado) {
    o.giro += dif * Math.min(1, (dt || 0.016) * 3.5); o.encuadrado = true;
    const c = a3(o.cp.centro[0], o.cp.centro[1]);
    // Medidas reales del campo vistas desde esta cámara (ancho a lo largo de la pantalla y fondo hacia delante)
    const sg = Math.sin(o.giro); const cg = Math.cos(o.giro); let x0 = Infinity; let x1 = -Infinity; let z0 = Infinity; let z1 = -Infinity;
    o.cp.lados.forEach(({ a }) => { const dx = a[0] - o.cp.centro[0]; const dz = a[1] - o.cp.centro[1]; const u = dx * cg - dz * sg; const w = dx * sg + dz * cg; x0 = Math.min(x0, u); x1 = Math.max(x1, u); z0 = Math.min(z0, w); z1 = Math.max(z1, w); });
    // Se centra en el campo (no en el centro del polígono) para aprovechar toda la pantalla
    const cu = (x0 + x1) / 2; const cw = (z0 + z1) / 2 + (z1 - z0) * 0.04; /* un poco hacia la cámara: la perspectiva agranda lo cercano */ const cx = c.x + cu * cg + cw * sg; const cz = c.z - cu * sg + cw * cg;
    o.ctx.encuadrar({ centro: [cx, 0, cz], ancho: x1 - x0 + 6, alto: (z1 - z0) * 0.85 + 9, desde: [sg * 0.62, 1, cg * 0.62], margen: 1.07 });
  }
}

/* ───────── Campo con la jugada ───────── */
function Campo({ v, enviar, local }) {
  const n = v.n || v.jugadores.length || 2;
  const ids = useMemo(() => E.idsDe(n), [n]);
  // Tu portería abajo: en un móvil, la de quien tira; online, la tuya
  const abajo = local ? v.turnoEquipo : (v.yo?.equipo ?? 0);
  const miTurno = v.fase === 'turno' && (local || v.turno === v.yo?.id);
  const anim = useRef(null);
  const [animando, setAnimando] = useState(false);
  const [gol, setGol] = useState(null);
  const tiro = useRef(null); // arrastre en curso
  const [, setVer] = useState(0);

  // Animar el último tiro (el mismo cálculo que hizo el servidor)
  const ultimoN = v.ultimo?.n;
  useEffect(() => {
    const u = v.ultimo;
    if (!u?.tiro) return undefined;
    const r = E.simularTiro(u.antes, u.tiro, n);
    anim.current = { frames: r.frames, t0: performance.now() };
    setAnimando(true); setVer((x) => x + 1); sonar('toque');
    const ms = (r.frames.length / 30) * 1000;
    const t = setTimeout(() => {
      setAnimando(false); anim.current = null; setVer((x) => x + 1);
      if (u.encaja != null) { setGol({ de: u.gol, propia: u.propia, encaja: u.encaja }); sonar('victoria'); vibrar([80, 50, 80]); setTimeout(() => setGol(null), 1800); }
    }, ms);
    return () => clearTimeout(t);
  }, [ultimoN]); // eslint-disable-line react-hooks/exhaustive-deps

  const puntero = (tipo, x, y) => {
    if (!miTurno || animando) return;
    if (tipo === 'down') {
      const mia = ids.filter((id) => id.startsWith(`e${v.turnoEquipo}c`) && v.posiciones[id]).map((id) => ({ id, p: v.posiciones[id] }))
        .map((c) => ({ ...c, d: Math.hypot(c.p[0] - x, c.p[1] - y) })).sort((a, b) => a.d - b.d)[0];
      if (mia && mia.d < E.RC * 2.4) { tiro.current = { chapa: mia.id, x0: mia.p[0], y0: mia.p[1], fin: null }; setVer((k) => k + 1); }
    } else if (tipo === 'move' && tiro.current) { tiro.current.fin = [x, y]; setVer((k) => k + 1); }
    else if (tipo === 'up' && tiro.current) {
      const t = tiro.current; tiro.current = null; setVer((k) => k + 1);
      if (!t.fin) return;
      let vx = (t.x0 - t.fin[0]) * FUERZA; let vy = (t.y0 - t.fin[1]) * FUERZA; const vv = Math.hypot(vx, vy);
      if (vv < 4) return;
      if (vv > E.VMAX) { vx *= E.VMAX / vv; vy *= E.VMAX / vv; }
      enviar('tirar', { chapa: t.chapa, vx, vy });
    }
  };
  const nombre = (i) => v.jugadores[i]?.nombre;
  return (
    <div className="ch-campo">
      <Lienzo3D key={`c${n}`} ancho={E.campo(n).W} alto={E.campo(n).H} proporcion={n <= 2 ? '3 / 4' : '1 / 1'} opciones={{ cielo: [0x020617, 0x1e3a8a], exposicion: 1.1 }}
        montar={(ctx, util) => montarEstadio(ctx, util, n)}
        dibujar={(o, t, util, dt) => { const a = anim.current; let pos = v.posiciones; if (a) { const f = Math.min(a.frames.length - 1, Math.floor(((performance.now() - a.t0) / 1000) * 30)); pos = a.frames[f]; } pintarEstadio(o, pos, a ? null : tiro.current?.chapa, a ? null : tiro.current, util, abajo, dt); }}
        onPuntero={puntero} />
      {gol && <div className="ch-gol" style={{ '--c': COLOR[gol.de ?? gol.encaja] }}>{gol.propia ? '¡En propia!' : '¡GOOOL!'}<small>{gol.propia ? `de ${nombre(gol.encaja)}: punto para los demás` : `de ${nombre(gol.de)}`}</small></div>}
      {miTurno && !animando && <p className="ch-ayuda">Toca una de tus chapas {EMBLEMA[v.turnoEquipo]}, arrastra hacia atrás y suelta</p>}
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
  const miTurno = local || v.turno === v.yo?.id;
  const extra = (j) => <small className="ch-eq" style={{ '--c': COLOR[j.equipo] }}>{EMBLEMA[j.equipo]} {v.marcador[j.equipo]}</small>;
  return (
    <>
      <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={`⚽ a ${v.goles} goles`} turno={v.turno} extra={extra}
        etiqueta={miTurno ? (local ? `Turno de ${turno?.nombre} ${EMBLEMA[v.turnoEquipo] || ''}` : '¡Te toca!') : `Tira ${turno?.nombre}`}
        titulo={<span className="ch-marcador">{v.marcador.map((g, i) => <b key={i} style={{ color: COLOR[i] }}>{i ? ' · ' : ''}{g}</b>)}</span>} />
      {!local && <AvisoTurno clave={v.turno === v.yo?.id ? `t${v.ultimo?.n ?? 0}` : null} emoji="⚽" texto="¡Te toca tirar!" id={v.yo?.id} />}
      {v.fase === 'turno' && <p className="pzp-nota ch-reloj">⏱️ <Restante v={v} /> para tirar</p>}
      <Campo v={v} enviar={enviar} local={local} />
    </>
  );
}

function Config({ config, onCambiar }) {
  return (
    <BloqueConfig titulo="Goles para ganar">
      <Pildoras opciones={E.OPCIONES_GOLES.map((k) => [k, `${k} goles`])} valor={config.goles} onCambiar={onCambiar && ((goles) => onCambiar({ goles }))} />
    </BloqueConfig>
  );
}

const JUEGO = {
  id: 'chapas',
  api: '/api/chapas',
  emoji: '⚽',
  config: { goles: 3 },
  tiempoReal: true,
  Partida: (props) => <Partida {...props} />,
  Config,
  Local: (props) => <LocalPorTurnos {...props} E={E} />,
  textoEmpezar: '¡Al campo!',
  notaSala: '⚽ Cada uno con sus 3 chapas y su portería (2 a 5 jugadores). Con más de 2, el campo tiene una portería por jugador.',
  ganador: (nombres) => `¡${nombres.join(' y ')} ${nombres.length > 1 ? 'ganan' : 'gana'} el partido!`,
  detalleFin: (j) => `${j.puntos} ${j.puntos === 1 ? 'gol' : 'goles'}`,
  unidadPuntos: '⚽'
};

export default function Chapas({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
