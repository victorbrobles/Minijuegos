// client/src/games/Chapas/Chapas.jsx
// «Fútbol chapas»: campo visto desde arriba. Toca una de tus chapas, arrastra hacia atrás (como un tirachinas) y
// suelta. Online por equipos o en un solo móvil por turnos.
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

const COLOR = ['#ef4444', '#2563eb'];
const NOMBRE_EQ = ['Rojos', 'Azules'];
const IDS = E.colocacion().map((c) => c.id);
const FUERZA = 2.4; // velocidad por unidad arrastrada

function dibujarCampo(ctx, k, girar) {
  const W = E.W * k; const H = E.H * k;
  ctx.save();
  for (let i = 0; i < 10; i++) { ctx.fillStyle = i % 2 ? '#15803d' : '#16a34a'; ctx.fillRect(0, (i * H) / 10, W, H / 10 + 1); }
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = Math.max(1.5, k * 0.35);
  ctx.strokeRect(k * 0.6, k * 0.6, W - k * 1.2, H - k * 1.2);
  ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(W / 2, H / 2, 9 * k, 0, Math.PI * 2); ctx.stroke();
  [0, 1].forEach((lado) => {
    const y = lado ? H - 16 * k : 0;
    ctx.strokeRect(W / 2 - 15 * k, y, 30 * k, 16 * k);
    ctx.strokeRect(W / 2 - 7 * k, lado ? H - 6 * k : 0, 14 * k, 6 * k);
  });
  // Porterías (red)
  const eq = (lado) => (girar ? 1 - lado : lado);
  [0, 1].forEach((lado) => {
    ctx.fillStyle = `${COLOR[eq(lado) === 0 ? 1 : 0]}55`;
    const y = lado ? H : -3 * k;
    ctx.fillRect(W / 2 - (E.PORTERIA / 2) * k, y, E.PORTERIA * k, 3 * k);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(W / 2 - (E.PORTERIA / 2) * k - 2, lado ? H - 3 : 0, E.PORTERIA * k + 4, 3);
  });
  ctx.restore();
}

/* ───────── Escena 3D ───────── */
function texturaCampo() {
  // Se dibuja el campo 2D (rayas y líneas) en una textura grande y se pone sobre el césped 3D
  const k = 16; const c = document.createElement('canvas'); c.width = E.W * k; c.height = E.H * k; const x = c.getContext('2d');
  dibujarCampo(x, k, false);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function texturaBalon() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d');
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, 256, 128); x.fillStyle = '#111827';
  for (let i = 0; i < 9; i++) { const cx = (i * 61) % 256; const cy = 20 + ((i * 37) % 90); x.beginPath(); for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2 - Math.PI / 2; x.lineTo(cx + Math.cos(a) * 14, cy + Math.sin(a) * 14); } x.closePath(); x.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function montarEstadio(ctx, util, girar) {
  const { scene } = ctx; const { a3 } = util;
  const cesped = new THREE.Mesh(new THREE.PlaneGeometry(E.W, E.H), new THREE.MeshStandardMaterial({ map: texturaCampo(), roughness: 0.85 })); cesped.rotation.x = -Math.PI / 2; cesped.receiveShadow = true; scene.add(cesped);
  const borde = crea.suelo(E.W + 30, E.H + 30, 0x14532d, { celda: 4, contraste: 0.04, lineas: false }); borde.position.y = -0.05; scene.add(borde);
  // Vallas publicitarias alrededor del campo
  const valla = (w, x, z, ry, txt, col) => { const v = crea.cartel(txt, w, 2.2, { fondo: col, color: '#ffffff', fuente: 'bold 34px sans-serif' }); v.position.set(x, 1.1, z); v.rotation.y = ry; scene.add(v); const tras = crea.caja(w, 2.2, 0.3, 0x0f172a); tras.position.set(x - Math.sin(ry) * 0.2, 1.1, z - Math.cos(ry) * 0.2); tras.rotation.y = ry; scene.add(tras); };
  [[-1, 0], [1, Math.PI]].forEach(([s, ry], k) => valla(E.W + 6, 0, s * (E.H / 2 + 5), ry, k ? '⚽ FÚTBOL CHAPAS ⚽' : '🏆 LOS 100+ MINIJUEGOS', k ? '#1d4ed8' : '#dc2626'));
  [[-1, Math.PI / 2], [1, -Math.PI / 2]].forEach(([s, ry]) => valla(E.H + 6, s * (E.W / 2 + 4), 0, ry, '⚽  GOL  ⚽  GOL  ⚽', '#15803d'));
  // Grada con público a los lados
  const publico = new THREE.InstancedMesh(new THREE.SphereGeometry(0.9, 8, 6), new THREE.MeshStandardMaterial({ roughness: 0.6 }), 1400);
  { const m4 = new THREE.Matrix4(); const c = new THREE.Color(); let n = 0;
    [-1, 1].forEach((s) => { for (let f = 0; f < 5; f++) { const esc = crea.caja(5, 2.4, E.H + 30, 0x1e293b); esc.position.set(s * (E.W / 2 + 9 + f * 4.2), 1.2 + f * 2.4, 0); scene.add(esc); for (let z = -E.H / 2 - 12; z < E.H / 2 + 12 && n < 1400; z += 2.1) { m4.makeTranslation(s * (E.W / 2 + 9 + f * 4.2) + (Math.random() - 0.5), 3.2 + f * 2.4, z); publico.setMatrixAt(n, m4); publico.setColorAt(n, c.setHex(s < 0 ? (Math.random() < 0.6 ? 0xef4444 : 0xffffff) : (Math.random() < 0.6 ? 0x2563eb : 0xffffff))); n++; } } });
    publico.count = n; }
  scene.add(publico);
  // Torres de focos en las esquinas
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    const torre = crea.cilindro(0.6, 0.9, 34, 0x475569, 8); torre.position.set(sx * (E.W / 2 + 14), 17, sz * (E.H / 2 + 10)); scene.add(torre);
    const panel = crea.caja(7, 4, 0.8, 0xffffff, { emissive: 0xffffff, emissiveIntensity: 1.6 }); panel.position.set(sx * (E.W / 2 + 14), 34, sz * (E.H / 2 + 10)); panel.lookAt(0, 0, 0); scene.add(panel);
  });
  // Porterías con red (línea de fondo y = 0 arriba e y = H abajo)
  [0, 1].forEach((lado) => {
    const g = new THREE.Group(); const sz = lado ? 1 : -1; const PR = E.PORTERIA;
    [-PR / 2, PR / 2].forEach((x) => { const p = crea.cilindro(0.45, 0.45, 4, 0xffffff, 12); p.position.set(x, 2, 0); g.add(p); });
    const lar = crea.cilindro(0.45, 0.45, PR + 0.9, 0xffffff, 12); lar.rotation.z = Math.PI / 2; lar.position.y = 4; g.add(lar);
    const pts = []; for (let x = -PR / 2; x <= PR / 2 + 1e-6; x += 1) pts.push(x, 0, 3.5 * sz, x, 4, 3.5 * sz, x, 4, 0, x, 4, 3.5 * sz); for (let y = 0; y <= 4; y += 1) pts.push(-PR / 2, y, 3.5 * sz, PR / 2, y, 3.5 * sz);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    g.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })));
    g.position.copy(a3(E.W / 2, lado ? E.H : 0)); scene.add(g);
  });
  // Chapas: cilindro con borde blanco y escudo; balón con textura
  const chapas = {}; const balon = new THREE.Mesh(new THREE.SphereGeometry(E.RB, 32, 20), new THREE.MeshStandardMaterial({ map: texturaBalon(), roughness: 0.4 })); balon.castShadow = true; scene.add(balon);
  IDS.forEach((id) => {
    if (id === 'balon' || id.startsWith('poste')) return;
    const eq = Number(id[1]); const g = new THREE.Group();
    const cuerpo = crea.cilindro(E.RC, E.RC * 1.04, 1.3, Number(COLOR[eq].replace('#', '0x')), 40, { roughness: 0.25, metalness: 0.3 }); cuerpo.position.y = 0.65; g.add(cuerpo);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(E.RC * 0.98, 0.22, 10, 40), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.6, roughness: 0.2 })); aro.rotation.x = Math.PI / 2; aro.position.y = 1.3; g.add(aro);
    const escudo = crea.cartel(eq ? '🔵' : '🔴', E.RC * 1.1, E.RC * 1.1, { fondo: null, fuente: '180px sans-serif' }); escudo.rotation.x = -Math.PI / 2; escudo.position.y = 1.33; g.add(escudo);
    scene.add(g); chapas[id] = g;
  });
  const anillo = new THREE.Mesh(new THREE.RingGeometry(E.RC * 1.25, E.RC * 1.55, 40), new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.95, side: THREE.DoubleSide })); anillo.rotation.x = -Math.PI / 2; anillo.visible = false; scene.add(anillo);
  const flecha = new THREE.Group(); const fMat = new THREE.MeshBasicMaterial({ color: 0x22c55e }); const asta = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 1), fMat); asta.position.z = 0.5; flecha.add(asta); const punta = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.6, 16), fMat); punta.rotation.x = Math.PI / 2; flecha.add(punta); flecha.visible = false; scene.add(flecha);
  ctx.encuadrar({ centro: [0, 0, 0], ancho: E.W + 6, alto: E.H * 0.82, desde: girar ? [0, 1, -0.62] : [0, 1, 0.62], margen: 1.02 });
  return { chapas, balon, anillo, flecha, asta, punta, fMat, prev: {} };
}
function pintarEstadio(o, pos, sel, tiro, util) {
  const { a3 } = util;
  IDS.forEach((id, i) => {
    if (id.startsWith('poste')) return; const p = pos[i] || pos[id]; if (!p) return;
    const m = id === 'balon' ? o.balon : o.chapas[id]; if (!m) return;
    const nuevo = a3(p[0], p[1], id === 'balon' ? E.RB : 0); const ant = o.prev[id];
    if (id === 'balon' && ant) { const d = nuevo.clone().sub(ant); if (d.lengthSq() > 1e-6) { const eje = new THREE.Vector3(d.z, 0, -d.x).normalize(); o.balon.rotateOnWorldAxis(eje, d.length() / E.RB); } }
    m.position.copy(nuevo); o.prev[id] = nuevo;
  });
  const s = sel && o.chapas[sel]; o.anillo.visible = Boolean(s); if (s) o.anillo.position.set(s.position.x, 0.06, s.position.z);
  if (tiro?.fin) {
    const dx = tiro.x0 - tiro.fin[0]; const dy = tiro.y0 - tiro.fin[1]; const fuerza = Math.min(1, (Math.hypot(dx, dy) * FUERZA) / E.VMAX);
    const largo = 4 + Math.hypot(dx, dy) * 1.2; const ini = a3(tiro.x0, tiro.y0, 1); const ang = Math.atan2(dx, dy);
    o.flecha.visible = true; o.flecha.position.copy(ini).add(new THREE.Vector3(Math.sin(ang) * (E.RC + largo), 0, Math.cos(ang) * (E.RC + largo))); o.flecha.rotation.set(0, ang + Math.PI, 0);
    o.asta.scale.z = largo; o.asta.position.z = largo / 2; o.fMat.color.setHSL((120 - fuerza * 120) / 360, 0.9, 0.55);
  } else o.flecha.visible = false;
}

function Campo({ v, enviar, local }) {
  const miEquipo = local ? v.turnoEquipo : v.yo?.equipo ?? 0;
  const girar = !local && miEquipo === 1; // tu portería siempre abajo
  const miTurno = v.fase === 'turno' && (local || v.turno === v.yo?.id);
  const anim = useRef(null);
  const [animando, setAnimando] = useState(false);
  const [gol, setGol] = useState(null);
  const tiro = useRef(null); // arrastre en curso
  const [, setVer] = useState(0);
  const posiciones = useMemo(() => IDS.map((id) => v.posiciones[id]), [v.posiciones]);

  // Animar el último tiro (el mismo cálculo que hizo el servidor)
  const ultimoN = v.ultimo?.n;
  useEffect(() => {
    const u = v.ultimo;
    if (!u?.tiro) return undefined;
    const r = E.simularTiro(u.antes, u.tiro);
    anim.current = { frames: r.frames, t0: performance.now() };
    setAnimando(true); setVer((x) => x + 1); sonar('toque');
    const ms = (r.frames.length / 30) * 1000;
    const t = setTimeout(() => {
      setAnimando(false); anim.current = null; setVer((x) => x + 1);
      if (u.gol != null) { setGol(u.gol); sonar('victoria'); vibrar([80, 50, 80]); setTimeout(() => setGol(null), 1800); }
    }, ms);
    return () => clearTimeout(t);
  }, [ultimoN]); // eslint-disable-line react-hooks/exhaustive-deps

  const puntero = (tipo, x0, y0) => {
    if (!miTurno || animando) return;
    const [x, y] = girar ? [E.W - x0, E.H - y0] : [x0, y0];
    if (tipo === 'down') {
      const mia = IDS.filter((id) => id.startsWith(`e${v.turnoEquipo}c`)).map((id) => ({ id, p: v.posiciones[id] }))
        .map((c) => ({ ...c, d: Math.hypot(c.p[0] - x, c.p[1] - y) })).sort((a, b) => a.d - b.d)[0];
      if (mia && mia.d < E.RC * 2.2) { tiro.current = { chapa: mia.id, x0: mia.p[0], y0: mia.p[1], fin: null }; setVer((n) => n + 1); }
    } else if (tipo === 'move' && tiro.current) { tiro.current.fin = [x, y]; setVer((n) => n + 1); }
    else if (tipo === 'up' && tiro.current) {
      const t = tiro.current; tiro.current = null; setVer((n) => n + 1);
      if (!t.fin) return;
      const vx = (t.x0 - t.fin[0]) * FUERZA; const vy = (t.y0 - t.fin[1]) * FUERZA;
      if (Math.hypot(vx, vy) < 4) return;
      enviar('tirar', { chapa: t.chapa, vx, vy });
    }
  };

  return (
    <div className="ch-campo">
      <Lienzo3D key={girar ? 'g' : 'n'} ancho={E.W} alto={E.H} proporcion="3 / 4" opciones={{ cielo: [0x020617, 0x1e3a8a], exposicion: 1.1 }}
        montar={(ctx, util) => montarEstadio(ctx, util, girar)}
        dibujar={(o, t, util) => { const a = anim.current; let pos = posiciones; if (a) { const f = Math.min(a.frames.length - 1, Math.floor(((performance.now() - a.t0) / 1000) * 30)); pos = a.frames[f]; } pintarEstadio(o, pos, a ? null : tiro.current?.chapa, a ? null : tiro.current, util); }}
        onPuntero={(tipo, x, y) => puntero(tipo, girar ? E.W - x : x, girar ? E.H - y : y)} />
      {gol != null && <div className="ch-gol" style={{ '--c': COLOR[gol] }}>¡GOOOL!<small>de los {NOMBRE_EQ[gol]}</small></div>}
      {miTurno && !animando && <p className="ch-ayuda">Toca una chapa {local ? `de los ${NOMBRE_EQ[v.turnoEquipo]}` : 'tuya'}, arrastra hacia atrás y suelta</p>}
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
  const extra = (j) => <small className="ch-eq" style={{ '--c': COLOR[j.equipo] }}>{NOMBRE_EQ[j.equipo]}</small>;
  return (
    <>
      <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={`⚽ ${v.marcador[0]} - ${v.marcador[1]} · a ${v.goles}`} turno={v.turno} extra={extra}
        etiqueta={miTurno ? (local ? `Turno de ${turno?.nombre} (${NOMBRE_EQ[v.turnoEquipo]})` : '¡Te toca!') : `Tira ${turno?.nombre}`} titulo={<span className="ch-marcador"><b style={{ color: COLOR[0] }}>{v.marcador[0]}</b> – <b style={{ color: COLOR[1] }}>{v.marcador[1]}</b></span>} />
      {!local && <AvisoTurno clave={v.turno === v.yo?.id ? `t${v.ultimo?.n ?? 0}` : null} emoji="⚽" texto="¡Te toca tirar!" id={v.yo?.id} />}
      <p className="pzp-nota ch-reloj">⏱️ <Restante v={v} /> para tirar</p>
      <Campo v={v} enviar={enviar} local={local} />
    </>
  );
}

function Config({ config, onCambiar }) {
  return (
    <BloqueConfig titulo="Goles para ganar">
      <Pildoras opciones={E.OPCIONES_GOLES.map((n) => [n, `${n} goles`])} valor={config.goles} onCambiar={onCambiar && ((goles) => onCambiar({ goles }))} />
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
  notaSala: '⚽ Los jugadores se reparten en dos equipos (rojos y azules) y tiran por turnos.',
  ganador: (n) => `¡${n.join(' y ')} ${n.length > 1 ? 'ganan' : 'gana'} el partido!`,
  detalleFin: (j) => `${j.puntos} ${j.puntos === 1 ? 'gol' : 'goles'} de su equipo`,
  unidadPuntos: '⚽'
};

export default function Chapas({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
