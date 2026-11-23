// client/src/games/Estelas/Estelas.jsx
// «Estelas»: líneas de luz en tiempo real. Toca a la izquierda o a la derecha de la pantalla para girar (o desliza
// hacia donde quieras ir; en ordenador, flechas). Online (el servidor manda) o práctica contra bots.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import { claveSesion } from '../Pulsador/PulsadorOnline.jsx';
import Lienzo3D from '../comun/Lienzo3D.jsx';
import { THREE, crea } from '../Habilidad/tres.js';
import { Hero, Pildoras, useLatido } from '../Pulsador/Vistas.jsx';
import { BloqueConfig, PanelMenu, Cabecera } from '../../components/MenuJuego.jsx';
import Icon from '../../components/Icon.jsx';
import { nombreIdentidad } from '../../lib/identidad.js';
import { sonar, vibrar } from '../../lib/sonido.js';
import * as E from './engine.js';
import './Estelas.css';

export const NEON = ['#22d3ee', '#f472b6', '#facc15', '#4ade80', '#a78bfa', '#fb923c', '#f87171', '#e2e8f0'];
const API = '/api/estelas';

/* ───────── Escena 3D: arena de neón ───────── */
// Cada rastro es un muro de luz (una caja por casilla, en InstancedMesh por jugador); la cabeza es una moto de luz
// con su propio brillo. Suelo de rejilla luminosa, bordes de neón y la ciudad de fondo.
function montarArena(ctx, util) {
  const { scene } = ctx; const { a3 } = util; const MAX = E.C * E.F;
  const suelo = new THREE.Mesh(new THREE.PlaneGeometry(E.C, E.F), new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.25, metalness: 0.6 })); suelo.rotation.x = -Math.PI / 2; suelo.receiveShadow = true; scene.add(suelo);
  const pts = []; for (let x = 0; x <= E.C; x += 2) pts.push(x - E.C / 2, 0.01, -E.F / 2, x - E.C / 2, 0.01, E.F / 2); for (let y = 0; y <= E.F; y += 2) pts.push(-E.C / 2, 0.01, y - E.F / 2, E.C / 2, 0.01, y - E.F / 2);
  const rej = new THREE.BufferGeometry(); rej.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); scene.add(new THREE.LineSegments(rej, new THREE.LineBasicMaterial({ color: 0x1e3a8a, transparent: true, opacity: 0.55 })));
  const borde = crea.marco(E.C, E.F, 0x38bdf8, { grosor: 0.35, alto: 1.4, intensidad: 2.2 }); borde.position.y = 0.7; scene.add(borde);
  const afuera = crea.suelo(E.C + 80, E.F + 80, 0x0b1026, { celda: 4, contraste: 0.04 }); afuera.position.y = -0.05; scene.add(afuera);
  // Ciudad de fondo: torres con ventanas que brillan
  for (let k = 0; k < 40; k++) { const h = 6 + Math.random() * 26; const ang = (k / 40) * Math.PI * 2; const d = 52 + Math.random() * 14; const t = crea.caja(4 + Math.random() * 4, h, 4 + Math.random() * 4, 0x0f172a, { emissive: [0x1d4ed8, 0x7c3aed, 0x0e7490][k % 3], emissiveIntensity: 0.35, roughness: 0.4 }); t.position.set(Math.cos(ang) * d, h / 2, Math.sin(ang) * d); scene.add(t); }
  const capas = new Map(); const geoMuro = new THREE.BoxGeometry(0.92, 1.1, 0.92); const m4 = new THREE.Matrix4();
  const capaDe = (j) => {
    let c = capas.get(j.id);
    if (!c) {
      const col = new THREE.Color(NEON[j.color % NEON.length]);
      const muro = new THREE.InstancedMesh(geoMuro, new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.3, roughness: 0.3, transparent: true, opacity: 0.92 }), MAX); muro.count = 0; scene.add(muro);
      const moto = new THREE.Group(); const cuerpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.9, 6, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: col, emissiveIntensity: 2 })); cuerpo.rotation.x = Math.PI / 2; cuerpo.position.y = 0.6; moto.add(cuerpo);
      const luz = new THREE.PointLight(col, 18, 10); luz.position.y = 1.4; moto.add(luz); scene.add(moto);
      const halo = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.15, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })); halo.rotation.x = -Math.PI / 2; halo.position.y = 0.05; moto.add(halo);
      c = { muro, moto, halo, n: 0, ronda: null, muerto: false }; capas.set(j.id, c);
    }
    return c;
  };
  ctx.encuadrar({ centro: [0, 0, 1.5], ancho: E.C + 2, alto: E.F * 0.82, desde: [0, 1, 0.55], margen: 1.02 });
  return { ctx, a3, capas, capaDe, m4 };
}
function pintarArena(o, jugadores, miId, t) {
  const vistos = new Set();
  jugadores.forEach((j) => {
    const c = o.capaDe(j); vistos.add(j.id);
    if (j.rastro.length < c.n) c.n = 0; // ronda nueva
    for (let i = c.n; i < j.rastro.length; i++) { const [x, y] = j.rastro[i]; o.m4.makeTranslation(x + 0.5 - E.C / 2, 0.55, y + 0.5 - E.F / 2); c.muro.setMatrixAt(i, o.m4); }
    c.n = j.rastro.length; c.muro.count = c.n; c.muro.instanceMatrix.needsUpdate = true;
    c.muro.material.opacity = j.vivo ? 0.92 : 0.3; c.muro.material.emissiveIntensity = j.vivo ? 1.3 : 0.3;
    const cab = j.rastro[j.rastro.length - 1]; const ant = j.rastro[j.rastro.length - 2];
    c.moto.visible = Boolean(cab) && j.vivo;
    if (cab) { c.moto.position.set(cab[0] + 0.5 - E.C / 2, 0, cab[1] + 0.5 - E.F / 2); if (ant) c.moto.rotation.y = Math.atan2(cab[0] - ant[0], cab[1] - ant[1]); }
    c.halo.visible = j.id === miId; c.halo.scale.setScalar(1 + Math.sin(t * 6) * 0.12);
    if (!j.vivo && !c.muerto && cab) { c.muerto = true; o.ctx.chispas(new THREE.Vector3(cab[0] - E.C / 2, 1, cab[1] - E.F / 2), new THREE.Color(NEON[j.color % NEON.length]).getHex(), 40, { fuerza: 8, tam: 0.25 }); o.ctx.temblor(0.4); }
    if (j.vivo) c.muerto = false;
  });
  o.capas.forEach((c, id) => { if (!vistos.has(id)) { c.muro.count = 0; c.moto.visible = false; } });
}

/** Arena con los rastros. fuente() → { jugadores: [{ id, color, vivo, rastro }] } */
function Tablero({ fuente, miId, onGiro, miDir }) {
  const toque = useRef(null);
  const puntero = (tipo, x, y, e) => {
    if (tipo === 'down') { toque.current = { x: e.clientX, y: e.clientY, mx: x }; return; }
    if (tipo !== 'up' || !toque.current) return;
    const dx = e.clientX - toque.current.x; const dy = e.clientY - toque.current.y;
    const t = toque.current; toque.current = null;
    const actual = miDir();
    if (Math.hypot(dx, dy) > 24) onGiro(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
    else onGiro(t.mx < E.C / 2 ? (actual + 3) % 4 : (actual + 1) % 4);
  };
  return <Lienzo3D ancho={E.C} alto={E.F} proporcion="5 / 6" opciones={{ cielo: [0x020617, 0x1e1b4b], sombras: false, exposicion: 1.1 }} montar={montarArena} dibujar={(o, t) => pintarArena(o, fuente().jugadores, miId, t)} onPuntero={puntero} />;
}

function useTecladoGiros(onGiro, miDir) {
  useEffect(() => {
    const f = (e) => {
      const m = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 }[e.key];
      if (m !== undefined) { e.preventDefault(); onGiro(m); }
      if (e.key === 'a' || e.key === 'A') onGiro((miDir() + 3) % 4);
      if (e.key === 'd' || e.key === 'D') onGiro((miDir() + 1) % 4);
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  });
}

function Aviso({ s, ahora, nombres }) {
  useLatido(200);
  if (s.fase === 'cuenta') { const n = Math.ceil((s.inicio - ahora()) / 1000); return n > 0 ? <div className="es-aviso cuenta" key={n}>{n}</div> : null; }
  if (s.fase === 'finRonda') return <div className="es-aviso">{s.ultimoGanador ? <>🏆 Ronda para <b>{nombres[s.ultimoGanador]}</b></> : '💥 ¡Choque múltiple!'}</div>;
  return null;
}

/* ───────── Online ───────── */
function PartidaOnline({ v, onSalir, sala }) {
  const espejo = useRef({ ronda: 0, paso: -1, fase: v.fase, inicio: v.inicio, jugadores: new Map() });
  const giros = useRef([]);
  const [ver, setVer] = useState(0);
  const base = useRef({ servidor: Date.now(), local: Date.now() });
  const token = useMemo(() => { try { return JSON.parse(sessionStorage.getItem(claveSesion('estelas')))?.token; } catch { return null; } }, []);
  const miId = v.yo?.id;
  const muerto = useRef(false);

  useEffect(() => {
    let vivo = true; let ocupado = false;
    const sync = async () => {
      if (ocupado) return; ocupado = true;
      const e = espejo.current; const g = giros.current; giros.current = [];
      try {
        const r = await fetch(`${API}/online/sala/${sala?.code}/sync`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, giros: g, desde: e.ronda ? e.paso : -1, ronda: e.ronda }) });
        const d = r.ok ? await r.json() : null;
        if (!vivo || !d || !d.jugadores) return;
        base.current = { servidor: d.ahora, local: Date.now() };
        if (d.ronda !== e.ronda) { e.jugadores = new Map(); e.ronda = d.ronda; muerto.current = false; }
        d.jugadores.forEach((j) => {
          const prev = e.jugadores.get(j.id) || { rastro: [] };
          const rastro = prev.rastro.slice(0, j.desde).concat(j.nuevos);
          e.jugadores.set(j.id, { id: j.id, color: j.color, vivo: j.vivo, dir: j.dir, rastro });
          if (j.id === miId && !j.vivo && !muerto.current && d.fase === 'jugando') { muerto.current = true; sonar('fallo'); vibrar([100, 50, 100]); }
        });
        Object.assign(e, { paso: d.paso, fase: d.fase, inicio: d.inicio, hasta: d.hasta, ultimoGanador: d.ultimoGanador });
        setVer((x) => x + 1);
      } catch { giros.current = [...g, ...giros.current]; } finally { ocupado = false; }
    };
    sync();
    const i = setInterval(sync, 85);
    return () => { vivo = false; clearInterval(i); };
  }, [sala?.code, token, miId]);

  const miDir = () => { const g = giros.current; if (g.length) return g[g.length - 1]; return espejo.current.jugadores.get(miId)?.dir ?? 0; };
  const girar = (d) => { const a = miDir(); if (d === a || (d + 2) % 4 === a) return; giros.current.push(d); vibrar(8); };
  useTecladoGiros(girar, miDir);
  const ahora = () => base.current.servidor + (Date.now() - base.current.local);
  const nombres = Object.fromEntries(v.jugadores.map((j) => [j.id, j.nombre]));
  const s = espejo.current;
  const yo = s.jugadores.get(miId);
  return (
    <>
      <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={`⚡ Ronda ${v.ronda}/${v.rondas}`} etiqueta={yo && !yo.vivo && s.fase === 'jugando' ? '💥 Te has estrellado' : 'Último en pie gana la ronda'}
        titulo={<span className="es-yo" style={{ color: NEON[(v.jugadores.find((j) => j.id === miId)?.color || 0) % NEON.length] }}>Tú eres este color</span>}
        extra={(j) => <i className="es-punto" style={{ background: NEON[j.color % NEON.length], opacity: j.vivo ? 1 : 0.3 }} />} />
      <div className="es-caja">
        <Tablero fuente={() => ({ jugadores: [...s.jugadores.values()] })} version={ver} miId={miId} onGiro={girar} miDir={miDir} />
        <Aviso s={s} ahora={ahora} nombres={nombres} />
      </div>
      <p className="es-ayuda">Toca a la izquierda o a la derecha para girar · desliza para ir en esa dirección</p>
    </>
  );
}

/* ───────── Práctica contra bots ───────── */
const NOMBRES_BOTS = ['Neón', 'Láser', 'Pixel', 'Voltio', 'Plasma', 'Quásar', 'Fotón'];
function Practica({ onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [bots, setBots] = useState(3);
  const [rondas, setRondas] = useState(5);
  const p = useRef(null);
  const [ver, setVer] = useState(0);
  const empezar = () => {
    const yo = (nombreIdentidad() || 'Tú').split('#')[0];
    p.current = E.crearPartida([{ id: 1, nombre: yo }, ...NOMBRES_BOTS.slice(0, bots).map((n, i) => ({ id: i + 2, nombre: n, bot: true }))], [], { rondas }, Date.now());
    setPaso('juego');
  };
  useEffect(() => {
    if (paso !== 'juego') return undefined;
    let vivoAntes = true;
    const i = setInterval(() => {
      const q = p.current; if (!q) return;
      E.tick(q, Date.now());
      const yo = q.jugadores[0];
      if (vivoAntes && !yo.vivo && q.fase !== 'cuenta') { sonar('fallo'); vibrar([100, 50, 100]); }
      vivoAntes = yo.vivo || q.fase === 'cuenta';
      setVer((x) => x + 1);
    }, 40);
    return () => clearInterval(i);
  }, [paso]);
  const miDir = () => { const j = p.current?.jugadores[0]; return j ? (j.cola.length ? j.cola[j.cola.length - 1] : j.dir) : 0; };
  const girar = (d) => { if (p.current) { E.girar(p.current, 1, d); vibrar(8); } };
  useTecladoGiros(girar, miDir);

  if (paso === 'config') {
    return (
      <section className="game qq-pantalla">
        <PanelMenu onVolver={onVolver} onAyuda={onAbrirAyuda}>
          <Cabecera icono="zap" titulo="Práctica contra bots" descripcion="Tú contra líneas de luz de la máquina." />
          <p className="pzp-etiqueta">Rivales</p>
          <Pildoras opciones={[1, 3, 5, 7].map((n) => [n, `${n} ${n === 1 ? 'bot' : 'bots'}`])} valor={bots} onCambiar={setBots} />
          <p className="pzp-etiqueta">Rondas</p>
          <Pildoras opciones={E.OPCIONES_RONDAS.map((n) => [n, `${n} rondas`])} valor={rondas} onCambiar={setRondas} />
          <button type="button" className="big full qq-btn-principal" style={{ marginTop: '1rem' }} onClick={empezar}><Icon name="play" size={20} /> ¡Encender!</button>
        </PanelMenu>
      </section>
    );
  }
  const q = p.current;
  const v = E.vistaDe(q, 1, Date.now());
  const nombres = Object.fromEntries(q.jugadores.map((j) => [j.id, j.nombre]));
  if (q.fase === 'fin') {
    const pos = q.fin.tabla.findIndex((t) => t.id === 1) + 1;
    return (
      <section className="game pzp-escena">
        <div className="pzp-tarjeta es-final">
          <p className="es-final-puesto">{['🥇', '🥈', '🥉'][pos - 1] || '🏁'} {pos}.º de {q.jugadores.length}</p>
          <ol className="es-tabla">{q.fin.tabla.map((t) => <li key={t.id}><i style={{ background: NEON[q.jugadores.find((j) => j.id === t.id).color % NEON.length] }} />{t.nombre}<b>{t.puntos}</b></li>)}</ol>
          <div className="pzp-dos">
            <button type="button" className="pzp-boton" onClick={empezar}>🔁 Otra</button>
            <button type="button" className="pzp-boton secundario" onClick={() => setPaso('config')}>⚙️ Cambiar</button>
          </div>
          <button type="button" className="pzp-enlace oscuro" onClick={() => onExit?.()}>Salir a la portada</button>
        </div>
      </section>
    );
  }
  return (
    <section className="game pzp-escena estelas">
      <Hero v={v} juego={JUEGO} onSalir={() => setPaso('config')} chip={`⚡ Ronda ${v.ronda}/${v.rondas}`} etiqueta="Práctica" titulo="Último en pie gana la ronda"
        extra={(j) => <i className="es-punto" style={{ background: NEON[j.color % NEON.length], opacity: j.vivo ? 1 : 0.3 }} />} />
      <div className="es-caja">
        <Tablero fuente={() => ({ jugadores: q.jugadores.map((j) => ({ id: j.id, color: j.color, vivo: j.vivo, rastro: j.rastro })) })} version={ver} miId={1} onGiro={girar} miDir={miDir} />
        <Aviso s={q} ahora={() => Date.now()} nombres={nombres} />
      </div>
      <p className="es-ayuda">Toca a la izquierda o a la derecha para girar · desliza para ir en esa dirección</p>
    </section>
  );
}

function Config({ config, onCambiar }) {
  return (
    <BloqueConfig titulo="Rondas">
      <Pildoras opciones={E.OPCIONES_RONDAS.map((n) => [n, `${n} rondas`])} valor={config.rondas} onCambiar={onCambiar && ((rondas) => onCambiar({ rondas }))} />
    </BloqueConfig>
  );
}

const JUEGO = {
  id: 'estelas',
  api: API,
  emoji: '⚡',
  config: { rondas: 5 },
  Partida: (props) => <PartidaOnline {...props} />,
  Config,
  Local: (props) => <Practica {...props} />,
  menuLocal: { icono: 'zap', titulo: 'Práctica contra bots', texto: 'Tú solo contra líneas de la máquina' },
  textoEmpezar: '¡Encender las estelas!',
  notaSala: '⚡ En tiempo real: cada uno juega en su móvil. No choques con ningún rastro.',
  ganador: (n) => `¡${n.join(' y ')} ${n.length > 1 ? 'brillan' : 'brilla'} más que nadie!`,
  detalleFin: (j) => `${j.puntos} ${j.puntos === 1 ? 'punto' : 'puntos'}`
};

export default function Estelas({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
