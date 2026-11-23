// client/src/games/Estelas/Estelas.jsx
// «Estelas»: motos de luz en tiempo real con movimiento libre: la moto gira hacia donde apuntas con el dedo (o el
// cursor en ordenador; también ← →) y deja una estela que se va apagando. Online (el servidor manda) o práctica.
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
// Cada estela es un muro de luz hecho de tramos (InstancedMesh por jugador) que se apaga según su edad (mezcla
// aditiva: cuanto más vieja, más oscura, hasta desaparecer). La moto brilla y lleva su propia luz.
const MAX_TRAMOS = E.VIDA + 8;
function montarArena(ctx) {
  const { scene } = ctx;
  const suelo = new THREE.Mesh(new THREE.PlaneGeometry(E.C, E.F), new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.25, metalness: 0.6 })); suelo.rotation.x = -Math.PI / 2; suelo.receiveShadow = true; scene.add(suelo);
  const pts = []; for (let x = 0; x <= E.C; x += 2) pts.push(x - E.C / 2, 0.01, -E.F / 2, x - E.C / 2, 0.01, E.F / 2); for (let y = 0; y <= E.F; y += 2) pts.push(-E.C / 2, 0.01, y - E.F / 2, E.C / 2, 0.01, y - E.F / 2);
  const rej = new THREE.BufferGeometry(); rej.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); scene.add(new THREE.LineSegments(rej, new THREE.LineBasicMaterial({ color: 0x1e3a8a, transparent: true, opacity: 0.55 })));
  const borde = crea.marco(E.C, E.F, 0x38bdf8, { grosor: 0.35, alto: 1.4, intensidad: 2.2 }); borde.position.y = 0.7; scene.add(borde);
  const afuera = crea.suelo(E.C + 80, E.F + 80, 0x0b1026, { celda: 4, contraste: 0.04 }); afuera.position.y = -0.05; scene.add(afuera);
  for (let k = 0; k < 40; k++) { const h = 6 + Math.random() * 26; const ang = (k / 40) * Math.PI * 2; const d = 52 + Math.random() * 14; const t = crea.caja(4 + Math.random() * 4, h, 4 + Math.random() * 4, 0x0f172a, { emissive: [0x1d4ed8, 0x7c3aed, 0x0e7490][k % 3], emissiveIntensity: 0.35, roughness: 0.4 }); t.position.set(Math.cos(ang) * d, h / 2, Math.sin(ang) * d); scene.add(t); }
  const capas = new Map(); const geoTramo = new THREE.BoxGeometry(1, 1.1, 0.5); const m4 = new THREE.Matrix4(); const q = new THREE.Quaternion(); const eje = new THREE.Vector3(0, 1, 0); const col = new THREE.Color();
  const capaDe = (j) => {
    let c = capas.get(j.id);
    if (!c) {
      const neon = new THREE.Color(NEON[j.color % NEON.length]);
      const muro = new THREE.InstancedMesh(geoTramo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), MAX_TRAMOS); muro.count = 0; muro.frustumCulled = false; scene.add(muro);
      const moto = new THREE.Group(); const cuerpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 1, 6, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: neon, emissiveIntensity: 2 })); cuerpo.rotation.z = Math.PI / 2; cuerpo.position.y = 0.6; moto.add(cuerpo);
      const luz = new THREE.PointLight(neon, 18, 10); luz.position.y = 1.4; moto.add(luz); scene.add(moto);
      const halo = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.15, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })); halo.rotation.x = -Math.PI / 2; halo.position.y = 0.05; moto.add(halo);
      c = { muro, moto, halo, neon, muerto: false, pos: null }; capas.set(j.id, c);
    }
    return c;
  };
  const mira = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.75, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, side: THREE.DoubleSide })); mira.rotation.x = -Math.PI / 2; mira.position.y = 0.05; mira.visible = false; scene.add(mira);
  ctx.encuadrar({ centro: [0, 0, 1.5], ancho: E.C + 2, alto: E.F * 0.82, desde: [0, 1, 0.55], margen: 1.02 });
  return { ctx, capas, capaDe, m4, q, eje, col, mira };
}
const a3 = (x, y, h = 0) => new THREE.Vector3(x - E.C / 2, h, y - E.F / 2);
function pintarArena(o, estado, miId, mira, t, dt) {
  const { jugadores, paso } = estado; const vistos = new Set();
  jugadores.forEach((j) => {
    const c = o.capaDe(j); vistos.add(j.id); const r = j.rastro || [];
    // Tramos entre puntos seguidos; el brillo baja con la edad hasta apagarse
    let n = 0;
    for (let k = 1; k < r.length && n < MAX_TRAMOS; k++) {
      const a = r[k - 1]; const b = r[k]; const dx = b[0] - a[0]; const dy = b[1] - a[1]; const largo = Math.hypot(dx, dy); if (largo < 0.01 || largo > 3) continue;
      o.q.setFromAxisAngle(o.eje, -Math.atan2(dy, dx));
      o.m4.compose(a3((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0.55), o.q, new THREE.Vector3(largo + 0.05, 1, 1));
      c.muro.setMatrixAt(n, o.m4);
      const vida = Math.max(0, 1 - (paso - b[2]) / E.VIDA); o.col.copy(c.neon).multiplyScalar(j.vivo ? 0.15 + vida * 1.1 : 0.12 * vida); c.muro.setColorAt(n, o.col); n++;
    }
    c.muro.count = n; c.muro.instanceMatrix.needsUpdate = true; if (c.muro.instanceColor) c.muro.instanceColor.needsUpdate = true;
    // Moto (suavizada entre sincronizaciones)
    c.moto.visible = j.vivo;
    if (j.vivo) {
      const dest = a3(j.x, j.y); if (!c.pos || c.pos.distanceTo(dest) > 4) c.pos = dest.clone(); else c.pos.lerp(dest, Math.min(1, (dt || 0.016) * 14));
      c.moto.position.copy(c.pos); c.moto.rotation.y = -j.ang;
    }
    c.halo.visible = j.id === miId; c.halo.scale.setScalar(1 + Math.sin(t * 6) * 0.12);
    if (!j.vivo && !c.muerto && c.pos) { c.muerto = true; o.ctx.chispas(c.pos.clone().setY(1), c.neon.getHex(), 40, { fuerza: 8, tam: 0.25 }); o.ctx.temblor(0.4); }
    if (j.vivo) c.muerto = false;
  });
  o.capas.forEach((c, id) => { if (!vistos.has(id)) { c.muro.count = 0; c.moto.visible = false; } });
  o.mira.visible = Boolean(mira); if (mira) o.mira.position.copy(a3(mira[0], mira[1], 0.05));
}

/** Arena con las motos. fuente() → { paso, jugadores: [{ id, color, vivo, x, y, ang, rastro }] }. onApuntar(x, y) */
function Tablero({ fuente, miId, onApuntar }) {
  const mira = useRef(null); const abajo = useRef(false);
  const puntero = (tipo, x, y, e) => {
    // Con ratón vale con mover el cursor; con el dedo, mientras toca la pantalla
    if (tipo === 'down') abajo.current = true;
    if (tipo === 'up') { abajo.current = false; return; }
    if (tipo === 'move' && e.pointerType !== 'mouse' && !abajo.current) return;
    mira.current = [x, y]; onApuntar(x, y);
  };
  return <Lienzo3D ancho={E.C} alto={E.F} proporcion="5 / 6" opciones={{ cielo: [0x020617, 0x1e1b4b], sombras: false, exposicion: 1.1 }} montar={montarArena} dibujar={(o, t, util, dt) => pintarArena(o, fuente(), miId, mira.current, t, dt)} onPuntero={puntero} />;
}

/** En ordenador, también con las flechas ← → (giran mientras se mantienen). */
function useTecladoGiro(onAng, miAng) {
  useEffect(() => {
    const giro = { d: 0 }; let t = null;
    const aplicar = () => { if (giro.d) onAng(miAng() + giro.d * 1.2); };
    const baja = (e) => { const d = { ArrowLeft: -1, ArrowRight: 1, a: -1, A: -1, d: 1, D: 1 }[e.key]; if (d) { e.preventDefault(); giro.d = d; aplicar(); if (!t) t = setInterval(aplicar, 60); } };
    const sube = (e) => { if ({ ArrowLeft: 1, ArrowRight: 1, a: 1, A: 1, d: 1, D: 1 }[e.key]) { giro.d = 0; clearInterval(t); t = null; } };
    window.addEventListener('keydown', baja); window.addEventListener('keyup', sube);
    return () => { window.removeEventListener('keydown', baja); window.removeEventListener('keyup', sube); clearInterval(t); };
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
  const objetivo = useRef(null); // { mira: [x, y] } o { ang }
  const [ver, setVer] = useState(0);
  const base = useRef({ servidor: Date.now(), local: Date.now() });
  const token = useMemo(() => { try { return JSON.parse(sessionStorage.getItem(claveSesion('estelas')))?.token; } catch { return null; } }, []);
  const miId = v.yo?.id;
  const muerto = useRef(false);

  useEffect(() => {
    let vivo = true; let ocupado = false;
    const sync = async () => {
      if (ocupado) return; ocupado = true;
      const e = espejo.current; const o = objetivo.current;
      try {
        const r = await fetch(`${API}/online/sala/${sala?.code}/sync`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, ...(o || {}), desde: e.ronda ? e.paso : -1, ronda: e.ronda }) });
        const d = r.ok ? await r.json() : null;
        if (!vivo || !d || !d.jugadores) return;
        base.current = { servidor: d.ahora, local: Date.now() };
        if (d.ronda !== e.ronda) { e.jugadores = new Map(); e.ronda = d.ronda; muerto.current = false; }
        d.jugadores.forEach((j) => {
          // Se añaden los puntos nuevos y se quitan los que ya se han apagado
          const prev = e.jugadores.get(j.id) || { rastro: [] }; const ult = prev.rastro.length ? prev.rastro[prev.rastro.length - 1][2] : -1;
          const rastro = prev.rastro.concat(j.nuevos.filter((q) => q[2] > ult)).filter((q) => q[2] >= d.paso - E.VIDA);
          e.jugadores.set(j.id, { id: j.id, color: j.color, vivo: j.vivo, x: j.x, y: j.y, ang: j.ang, rastro });
          if (j.id === miId && !j.vivo && !muerto.current && d.fase === 'jugando') { muerto.current = true; sonar('fallo'); vibrar([100, 50, 100]); }
        });
        Object.assign(e, { paso: d.paso, fase: d.fase, inicio: d.inicio, hasta: d.hasta, ultimoGanador: d.ultimoGanador });
        setVer((x) => x + 1);
      } catch { /* se reintenta en la siguiente */ } finally { ocupado = false; }
    };
    sync();
    const i = setInterval(sync, 85);
    return () => { vivo = false; clearInterval(i); };
  }, [sala?.code, token, miId]);

  const apuntar = (x, y) => { objetivo.current = { mira: [x, y] }; };
  const miAng = () => espejo.current.jugadores.get(miId)?.ang ?? 0;
  useTecladoGiro((ang) => { objetivo.current = { ang }; }, miAng);
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
        <Tablero fuente={() => ({ paso: s.paso, jugadores: [...s.jugadores.values()] })} miId={miId} onApuntar={apuntar} />
        <Aviso s={s} ahora={ahora} nombres={nombres} />
      </div>
      <p className="es-ayuda">Apunta con el dedo (o con el cursor) hacia donde quieras ir · ← → en el teclado</p>
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
  const miAng = () => p.current?.jugadores[0]?.ang ?? 0;
  const apuntar = (x, y) => { if (p.current) E.apuntar(p.current, 1, { mira: [x, y] }); };
  useTecladoGiro((ang) => { if (p.current) E.apuntar(p.current, 1, { ang }); }, miAng);

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
        <Tablero fuente={() => ({ paso: q.paso, jugadores: q.jugadores.filter((j) => !j.fuera) })} miId={1} onApuntar={apuntar} />
        <Aviso s={q} ahora={() => Date.now()} nombres={nombres} />
      </div>
      <p className="es-ayuda">Apunta con el dedo (o con el cursor) hacia donde quieras ir · ← → en el teclado</p>
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
