// client/src/games/Estelas/Estelas.jsx
// «Estelas»: líneas de luz en tiempo real. Toca a la izquierda o a la derecha de la pantalla para girar (o desliza
// hacia donde quieras ir; en ordenador, flechas). Online (el servidor manda) o práctica contra bots.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import { claveSesion } from '../Pulsador/PulsadorOnline.jsx';
import Lienzo2D from '../comun/Lienzo2D.jsx';
import { Hero, Pildoras, useLatido } from '../Pulsador/Vistas.jsx';
import { BloqueConfig, PanelMenu, Cabecera } from '../../components/MenuJuego.jsx';
import Icon from '../../components/Icon.jsx';
import { nombreIdentidad } from '../../lib/identidad.js';
import { sonar, vibrar } from '../../lib/sonido.js';
import * as E from './engine.js';
import './Estelas.css';

export const NEON = ['#22d3ee', '#f472b6', '#facc15', '#4ade80', '#a78bfa', '#fb923c', '#f87171', '#e2e8f0'];
const API = '/api/estelas';

/** Dibuja la cuadrícula con los rastros. fuente() → { jugadores: [{ id, color, vivo, rastro }] } */
function Tablero({ fuente, version, miId, onGiro, miDir }) {
  const toque = useRef(null);
  const dibujar = (ctx, k) => {
    const s = fuente();
    ctx.fillStyle = '#020617'; ctx.fillRect(0, 0, E.C * k, E.F * k);
    ctx.strokeStyle = 'rgba(148,163,184,0.08)'; ctx.lineWidth = 1;
    for (let x = 0; x <= E.C; x += 4) { ctx.beginPath(); ctx.moveTo(x * k, 0); ctx.lineTo(x * k, E.F * k); ctx.stroke(); }
    for (let y = 0; y <= E.F; y += 4) { ctx.beginPath(); ctx.moveTo(0, y * k); ctx.lineTo(E.C * k, y * k); ctx.stroke(); }
    s.jugadores.forEach((j) => {
      const c = NEON[j.color % NEON.length];
      ctx.globalAlpha = j.vivo ? 1 : 0.35;
      ctx.fillStyle = c;
      j.rastro.forEach(([x, y]) => ctx.fillRect(x * k + 0.5, y * k + 0.5, k - 1, k - 1));
      const cab = j.rastro[j.rastro.length - 1];
      if (cab && j.vivo) {
        ctx.shadowColor = c; ctx.shadowBlur = 12; ctx.fillStyle = '#ffffff';
        ctx.fillRect(cab[0] * k - 1, cab[1] * k - 1, k + 2, k + 2); ctx.shadowBlur = 0;
        if (j.id === miId) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.strokeRect(cab[0] * k - 4, cab[1] * k - 4, k + 8, k + 8); }
      }
      ctx.globalAlpha = 1;
    });
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3; ctx.strokeRect(1.5, 1.5, E.C * k - 3, E.F * k - 3);
    return false;
  };
  const puntero = (tipo, x, y, e) => {
    if (tipo === 'down') { toque.current = { x: e.clientX, y: e.clientY, mx: x }; return; }
    if (tipo !== 'up' || !toque.current) return;
    const dx = e.clientX - toque.current.x; const dy = e.clientY - toque.current.y;
    const t = toque.current; toque.current = null;
    const actual = miDir();
    if (Math.hypot(dx, dy) > 24) onGiro(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
    else onGiro(t.mx < E.C / 2 ? (actual + 3) % 4 : (actual + 1) % 4);
  };
  return <Lienzo2D ancho={E.C} alto={E.F} dibujar={dibujar} version={version} onPuntero={puntero} />;
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
