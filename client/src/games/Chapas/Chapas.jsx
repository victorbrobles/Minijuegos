// client/src/games/Chapas/Chapas.jsx
// «Fútbol chapas»: campo visto desde arriba. Toca una de tus chapas, arrastra hacia atrás (como un tirachinas) y
// suelta. Online por equipos o en un solo móvil por turnos.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import LocalPorTurnos from '../comun/LocalPorTurnos.jsx';
import Lienzo2D, { useReloj } from '../comun/Lienzo2D.jsx';
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

function dibujarCuerpos(ctx, k, pos, girar, sel) {
  const tr = ([x, y]) => (girar ? [(E.W - x) * k, (E.H - y) * k] : [x * k, y * k]);
  IDS.forEach((id, i) => {
    if (id.startsWith('poste')) return;
    const p = pos[i] || pos[id]; if (!p) return;
    const [x, y] = tr(p);
    if (id === 'balon') {
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.arc(x + 1.5, y + 2, E.RB * k, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, E.RB * k, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(x, y, E.RB * k * 0.42, 0, Math.PI * 2); ctx.fill();
      return;
    }
    const eq = Number(id[1]);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.arc(x + 2, y + 3, E.RC * k, 0, Math.PI * 2); ctx.fill();
    const g = ctx.createRadialGradient(x - E.RC * k * 0.3, y - E.RC * k * 0.3, 1, x, y, E.RC * k);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, COLOR[eq]); g.addColorStop(1, '#0f172a');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, E.RC * k, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = sel === id ? '#facc15' : 'rgba(255,255,255,0.8)'; ctx.lineWidth = sel === id ? 4 : 1.5;
    ctx.beginPath(); ctx.arc(x, y, E.RC * k * (sel === id ? 1.15 : 0.72), 0, Math.PI * 2); ctx.stroke();
  });
}

function Campo({ v, enviar, local }) {
  const miEquipo = local ? v.turnoEquipo : v.yo?.equipo ?? 0;
  const girar = !local && miEquipo === 1; // tu portería siempre abajo
  const miTurno = v.fase === 'turno' && (local || v.turno === v.yo?.id);
  const anim = useRef(null);
  const [animando, setAnimando] = useState(false);
  const [gol, setGol] = useState(null);
  const tiro = useRef(null); // arrastre en curso
  const [ver, setVer] = useState(0);
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

  const dibujar = (ctx, k) => {
    dibujarCampo(ctx, k, girar);
    if (anim.current) {
      const f = Math.min(anim.current.frames.length - 1, Math.floor(((performance.now() - anim.current.t0) / 1000) * 30));
      dibujarCuerpos(ctx, k, anim.current.frames[f], girar);
      return f < anim.current.frames.length - 1;
    }
    dibujarCuerpos(ctx, k, posiciones, girar, tiro.current?.chapa);
    const t = tiro.current;
    if (t?.fin) {
      const tr = (x, y) => (girar ? [(E.W - x) * k, (E.H - y) * k] : [x * k, y * k]);
      const [cx, cy] = tr(t.x0, t.y0); const [fx, fy] = tr(t.fin[0], t.fin[1]);
      const dx = t.x0 - t.fin[0]; const dy = t.y0 - t.fin[1];
      const fuerza = Math.min(1, (Math.hypot(dx, dy) * FUERZA) / E.VMAX);
      const [ax, ay] = tr(t.x0 + dx * 1.2, t.y0 + dy * 1.2);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(fx, fy); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = `hsl(${120 - fuerza * 120}, 90%, 55%)`; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ax, ay); ctx.stroke();
      const ang = Math.atan2(ay - cy, ax - cx);
      ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.moveTo(ax + Math.cos(ang) * 10, ay + Math.sin(ang) * 10);
      ctx.lineTo(ax + Math.cos(ang + 2.5) * 10, ay + Math.sin(ang + 2.5) * 10); ctx.lineTo(ax + Math.cos(ang - 2.5) * 10, ay + Math.sin(ang - 2.5) * 10); ctx.fill();
    }
    return false;
  };

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
      <Lienzo2D ancho={E.W} alto={E.H} dibujar={dibujar} version={`${ver}-${ultimoN}-${girar}`} onPuntero={puntero} />
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
