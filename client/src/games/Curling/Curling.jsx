// client/src/games/Curling/Curling.jsx
// «Curling»: se ve la zona de la diana. Desliza sobre el hielo para apuntar, elige el efecto y mantén pulsado
// «LANZAR»: la barra de fuerza sube y baja; suelta en el punto justo. Online o en un solo móvil por turnos.
import React, { useEffect, useRef, useState } from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import LocalPorTurnos from '../comun/LocalPorTurnos.jsx';
import Lienzo2D, { useReloj } from '../comun/Lienzo2D.jsx';
import { Hero, Pildoras, AvisoTurno, useLatido, colorDe } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import { sonar, vibrar } from '../../lib/sonido.js';
import * as E from './engine.js';
import './Curling.css';

const Y0 = 80; const Y1 = 146; // tramo de pista que se ve
const ALTO = Y1 - Y0;
const sy = (y) => Y1 - y;
const PERIODO = 1500; // ms de la barra de fuerza (ida y vuelta)

function dibujarPista(ctx, k) {
  ctx.fillStyle = '#f0f9ff'; ctx.fillRect(0, 0, E.W * k, ALTO * k);
  const cx = E.CASA.x * k; const cy = sy(E.CASA.y) * k;
  [[12, '#2563eb'], [8, '#ffffff'], [4, '#dc2626'], [1.4, '#ffffff']].forEach(([r, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(cx, cy, r * k, 0, Math.PI * 2); ctx.fill(); });
  ctx.strokeStyle = 'rgba(15,23,42,0.35)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, ALTO * k); ctx.moveTo(0, cy); ctx.lineTo(E.W * k, cy); ctx.stroke();
  ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, sy(E.FONDO) * k); ctx.lineTo(E.W * k, sy(E.FONDO) * k); ctx.stroke();
  ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, sy(E.HOG) * k); ctx.lineTo(E.W * k, sy(E.HOG) * k); ctx.stroke();
  ctx.fillStyle = '#94a3b8'; ctx.fillRect(0, 0, 0.6 * k, ALTO * k); ctx.fillRect(E.W * k - 0.6 * k, 0, 0.6 * k, ALTO * k);
}
function piedra(ctx, k, x, y, color, brillo) {
  if (y < Y0 - 2) return;
  const px = x * k; const py = sy(y) * k; const r = E.R * k;
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.arc(px + 1.5, py + 2, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#9ca3af'; ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(px, py, r * 0.68, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = brillo ? '#facc15' : '#1f2937'; ctx.lineWidth = brillo ? 3 : 1.2; ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.stroke();
}
function minimapa(ctx, k, puntos) {
  // Toda la pista en una tira a la izquierda: para seguir la piedra antes de que llegue a la casa
  const h = ALTO * k * 0.9; const x0 = 0.9 * k; const y0 = ALTO * k * 0.05; const w = 2.2 * k;
  ctx.fillStyle = 'rgba(15,23,42,0.12)'; ctx.fillRect(x0, y0, w, h);
  ctx.fillStyle = 'rgba(37,99,235,0.5)'; ctx.fillRect(x0, y0 + h * (1 - Y1 / E.L), w, h * (ALTO / E.L));
  puntos.forEach(([y, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x0 + w / 2, y0 + h * (1 - y / E.L), w * 0.45, 0, Math.PI * 2); ctx.fill(); });
}

function Pista({ v, enviar, local }) {
  const miTurno = v.fase === 'turno' && (local || v.turno === v.yo?.id);
  const [ang, setAng] = useState(0);
  const [efecto, setEfecto] = useState(0);
  const [ver, setVer] = useState(0);
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

  const dibujar = (ctx, k) => {
    dibujarPista(ctx, k);
    const a = anim.current;
    if (a) {
      const f = Math.min(a.frames.length - 1, Math.floor(((performance.now() - a.t0) / 1000) * 40));
      const fr = a.frames[f];
      a.ids.forEach((s, i) => piedra(ctx, k, fr[i][0], fr[i][1], colorDe(s.de), i === 0));
      minimapa(ctx, k, [[fr[0][1], colorDe(a.ids[0].de)]]);
      return f < a.frames.length - 1;
    }
    v.piedras.forEach((s) => piedra(ctx, k, s.x, s.y, colorDe(s.de)));
    if (miTurno) {
      // Línea de puntería hasta la casa (recta: el efecto la curvará)
      const rad = (ang * Math.PI) / 180;
      const xCasa = E.SALIDA.x + Math.tan(rad) * (E.CASA.y - E.SALIDA.y);
      ctx.strokeStyle = 'rgba(15,23,42,0.55)'; ctx.setLineDash([5, 5]); ctx.lineWidth = 2;
      const xBase = E.SALIDA.x + Math.tan(rad) * (Y0 - E.SALIDA.y);
      ctx.beginPath(); ctx.moveTo(xBase * k, ALTO * k); ctx.lineTo(xCasa * k, sy(E.CASA.y) * k); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(xCasa * k, sy(E.CASA.y) * k, 0.8 * k, 0, Math.PI * 2); ctx.fill();
      if (efecto) { ctx.fillStyle = '#0f172a'; ctx.font = `800 ${Math.round(2.6 * k)}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText(efecto > 0 ? '↻' : '↺', xCasa * k + efecto * 3 * k, sy(E.CASA.y + 6) * k); }
    }
    return false;
  };
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
      <Lienzo2D ancho={E.W} alto={ALTO} dibujar={dibujar} version={`${ver}-${ultimoN}-${ang}-${efecto}`} onPuntero={puntero} altoMax={460} />
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
