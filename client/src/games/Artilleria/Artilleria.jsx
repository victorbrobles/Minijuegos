// client/src/games/Artilleria/Artilleria.jsx
// «Artillería»: tanques sobre colinas. Arrastra desde tu tanque para apuntar (dirección = ángulo, largo = fuerza),
// ajusta con los botones, elige munición y ¡fuego! Ojo al viento. Online o en un solo móvil por turnos.
import React, { useEffect, useRef, useState } from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import LocalPorTurnos from '../comun/LocalPorTurnos.jsx';
import Lienzo2D, { useReloj } from '../comun/Lienzo2D.jsx';
import { Hero, AvisoTurno, useLatido, colorDe } from '../Pulsador/Vistas.jsx';
import { sonar, vibrar } from '../../lib/sonido.js';
import * as E from './engine.js';
import './Artilleria.css';

const sy = (y) => E.H - y; // el mundo tiene la y hacia arriba; el lienzo, hacia abajo

function dibujarTerreno(ctx, k, terreno) {
  const g = ctx.createLinearGradient(0, 0, 0, E.H * k);
  g.addColorStop(0, '#7dd3fc'); g.addColorStop(1, '#e0f2fe');
  ctx.fillStyle = g; ctx.fillRect(0, 0, E.W * k, E.H * k);
  ctx.beginPath(); ctx.moveTo(0, E.H * k);
  terreno.forEach((h, i) => ctx.lineTo(i * E.PASO * k, sy(h) * k));
  ctx.lineTo(E.W * k, E.H * k); ctx.closePath();
  const t = ctx.createLinearGradient(0, sy(90) * k, 0, E.H * k);
  t.addColorStop(0, '#65a30d'); t.addColorStop(0.08, '#4d7c0f'); t.addColorStop(0.1, '#92400e'); t.addColorStop(1, '#451a03');
  ctx.fillStyle = t; ctx.fill();
  ctx.strokeStyle = '#3f6212'; ctx.lineWidth = 2; ctx.stroke();
}

function dibujarTanque(ctx, k, j, terreno, activo) {
  const t = k * 1.9; // los tanques se dibujan más grandes que su tamaño real para que se vean bien en el móvil
  const y = E.altura(terreno, j.x); const x = j.x * k; const yy = sy(y) * k;
  if (j.vida <= 0) {
    ctx.font = `${Math.round(5 * t)}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('💀', x, yy - 1);
    return;
  }
  const c = colorDe(j.id);
  const a = ((j.ang ?? 90) * Math.PI) / 180;
  ctx.strokeStyle = '#1f2937'; ctx.lineWidth = Math.max(3, t * 0.9); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, yy - 2.6 * t); ctx.lineTo(x + Math.cos(a) * 5 * t, yy - 2.6 * t - Math.sin(a) * 5 * t); ctx.stroke();
  ctx.fillStyle = c; ctx.strokeStyle = activo ? '#facc15' : '#0f172a'; ctx.lineWidth = activo ? 3 : 1.5;
  ctx.beginPath(); ctx.arc(x, yy - 2.4 * t, 2.1 * t, Math.PI, 0); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(x - 3.6 * t, yy - 2.4 * t, 7.2 * t, 2.4 * t, t); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#1f2937'; [-2.4, 0, 2.4].forEach((d) => { ctx.beginPath(); ctx.arc(x + d * t, yy - 0.5 * t, 0.7 * t, 0, Math.PI * 2); ctx.fill(); });
  // Vida y nombre
  ctx.fillStyle = 'rgba(15,23,42,0.6)'; ctx.fillRect(x - 5 * t, yy - 8.4 * t, 10 * t, 1.3 * t);
  ctx.fillStyle = j.vida > 50 ? '#22c55e' : j.vida > 25 ? '#f59e0b' : '#ef4444'; ctx.fillRect(x - 5 * t, yy - 8.4 * t, (10 * t * j.vida) / 100, 1.3 * t);
  ctx.fillStyle = '#0f172a'; ctx.font = `800 ${Math.max(10, Math.round(2.6 * t))}px sans-serif`; ctx.textAlign = 'center';
  ctx.fillText(j.nombre.slice(0, 10), x, yy - 9.4 * t);
}

function Escenario({ v, enviar, local }) {
  const yo = local ? v.jugadores.find((j) => j.id === v.turno) : v.jugadores.find((j) => j.id === v.yo?.id);
  const miTurno = v.fase === 'turno' && (local || v.turno === v.yo?.id);
  const [ang, setAng] = useState(yo?.ang ?? 60);
  const [pot, setPot] = useState(yo?.pot ?? 60);
  const [arma, setArma] = useState('normal');
  const [ver, setVer] = useState(0);
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

  const dibujar = (ctx, k) => {
    const a = anim.current;
    if (a) {
      const f = ((performance.now() - a.t0) / 1000) * 30;
      const fin = f >= a.r.frames;
      dibujarTerreno(ctx, k, fin ? a.r.terreno : a.antes.terreno);
      a.antes.tanques.forEach((t) => { const j = v.jugadores.find((x) => x.id === t.id); dibujarTanque(ctx, k, { ...j, vida: fin ? (a.r.tanques.find((x) => x.id === t.id)?.vida ?? t.vida) : t.vida, ang: t.id === a.de ? a.tiro.ang : j.ang }, a.antes.terreno, t.id === a.de); });
      a.r.proyectiles.forEach((pr) => {
        const i = Math.floor(f);
        if (i < pr.frames.length - 1 && (!pr.impacto || i < pr.impacto.frame)) {
          const [x, y] = pr.frames[i];
          ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(x * k, sy(y) * k, Math.max(4, k * 1.4), 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = 'rgba(15,23,42,0.25)'; ctx.lineWidth = 2; ctx.beginPath();
          pr.frames.slice(Math.max(0, i - 8), i + 1).forEach(([px, py], n) => (n ? ctx.lineTo(px * k, sy(py) * k) : ctx.moveTo(px * k, sy(py) * k))); ctx.stroke();
        } else if (pr.impacto) {
          const dt = (f - pr.impacto.frame) / 18;
          if (dt >= 0 && dt < 1) {
            const r = (E.ARMAS[a.tiro.arma] || E.ARMAS.normal).radio * k * (0.4 + dt * 0.8);
            const g = ctx.createRadialGradient(pr.impacto.x * k, sy(pr.impacto.y) * k, 1, pr.impacto.x * k, sy(pr.impacto.y) * k, r);
            g.addColorStop(0, `rgba(255,255,200,${1 - dt})`); g.addColorStop(0.4, `rgba(249,115,22,${0.9 - dt * 0.8})`); g.addColorStop(1, 'rgba(239,68,68,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(pr.impacto.x * k, sy(pr.impacto.y) * k, r, 0, Math.PI * 2); ctx.fill();
          }
        }
      });
      return f < a.r.frames + 20;
    }
    dibujarTerreno(ctx, k, v.terreno);
    v.jugadores.forEach((j) => dibujarTanque(ctx, k, miTurno && j.id === yo?.id ? { ...j, ang } : j, v.terreno, j.id === v.turno));
    // Viento
    ctx.fillStyle = 'rgba(15,23,42,0.7)'; ctx.font = `800 ${Math.max(11, Math.round(3.4 * k))}px sans-serif`; ctx.textAlign = 'center';
    ctx.fillText(`💨 ${v.viento === 0 ? 'sin viento' : `${v.viento > 0 ? '→' : '←'} ${Math.abs(v.viento)}`}`, (E.W / 2) * k, 6 * k);
    if (miTurno && yo) {
      // Flecha de puntería (sin trayectoria: hay que calcularla a ojo)
      const x = yo.x * k; const y = sy(E.altura(v.terreno, yo.x)) * k - 2.6 * k * 1.9; const l = (6 + pot * 0.22) * k; const r = (ang * Math.PI) / 180;
      ctx.strokeStyle = 'rgba(250,204,21,0.9)'; ctx.lineWidth = 3; ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(r) * l, y - Math.sin(r) * l); ctx.stroke(); ctx.setLineDash([]);
    }
    return false;
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
      <Lienzo2D ancho={E.W} alto={E.H} dibujar={dibujar} version={`${ver}-${ultimoN}-${v.turno}`} onPuntero={puntero} altoMax={420} />
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
