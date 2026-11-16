// client/src/components/FinPartida.jsx
// Al terminar una partida aparece una tarjetita abajo con:
//  - 👍/👎 para valorar el juego (solo la primera vez)
//  - 🍷 «Ronda de castigo» para el que ha quedado último (si sois 2 o más y está activada en ⚙️ Ajustes)
// La ruleta saca el mismo castigo en todos los móviles de la partida (depende del juego y de los resultados).
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { metaDe, META } from '../games/meta.js';
import { partirNombre } from '../lib/identidad.js';
import { leerAjustes } from '../lib/ajustes.js';
import { miVoto, votar } from '../lib/valoraciones.js';
import { CASTIGOS_ADULTOS, CASTIGOS_FAMILIAR, semilla } from '../lib/castigos.js';
import { sonar } from '../lib/sonido.js';
import './FinPartida.css';

const plano = (n) => partirNombre(String(n || '')).nombre.trim();

/** Quién se lleva el castigo: el de menos puntos (o más, si gana el que menos tiene); si no hay puntos, uno de los que no ganan. */
export function perdedorDe(jugadores, orden, rnd) {
  const js = jugadores.filter((j) => plano(j.nombre));
  if (js.length < 2) return null;
  const conPuntos = js.filter((j) => j.puntos != null && Number.isFinite(Number(j.puntos)));
  if (conPuntos.length === js.length) {
    const peor = orden === 'asc' ? Math.max(...js.map((j) => Number(j.puntos))) : Math.min(...js.map((j) => Number(j.puntos)));
    const ultimos = js.filter((j) => Number(j.puntos) === peor);
    if (ultimos.length < js.length) return { nombres: ultimos.map((j) => plano(j.nombre)), sorteo: false };
  }
  const noGanan = js.filter((j) => !j.gana);
  const bolsa = noGanan.length && noGanan.length < js.length ? noGanan : js;
  if (bolsa.length === 1) return { nombres: [plano(bolsa[0].nombre)], sorteo: false };
  return { nombres: [plano(bolsa[Math.floor(rnd() * bolsa.length)].nombre)], sorteo: true };
}

function Ruleta({ fin, modo, onCerrar }) {
  const lista = modo === 'adultos' ? CASTIGOS_ADULTOS : CASTIGOS_FAMILIAR;
  const [tirada, setTirada] = useState(0);
  const [girando, setGirando] = useState(true);
  const base = `${fin.juego}|${fin.jugadores.map((j) => `${plano(j.nombre)}:${j.puntos ?? ''}:${j.gana ? 1 : 0}`).sort().join(',')}`;
  const rnd = semilla(`${base}|${tirada}`);
  const perdedor = perdedorDe(fin.jugadores, fin.orden, semilla(base));
  // 8 casillas: la que toca va la primera; las otras, al azar (con la misma semilla)
  const indices = [];
  while (indices.length < 8) { const i = Math.floor(rnd() * lista.length); if (!indices.includes(i)) indices.push(i); }
  const casillas = indices.map((i) => lista[i]);
  const elegido = casillas[0];
  const [angulo, setAngulo] = useState(0);
  useEffect(() => {
    setGirando(true);
    const g = setTimeout(() => setAngulo((tirada + 1) * 5 * 360), 60); // 5 vueltas y cae en la primera casilla
    const t = setTimeout(() => { setGirando(false); sonar('victoria'); navigator.vibrate?.([60, 40, 120]); }, 3200);
    return () => { clearTimeout(t); clearTimeout(g); };
  }, [tirada]);
  const quien = perdedor?.nombres.length > 1 ? `${perdedor.nombres.slice(0, -1).join(', ')} y ${perdedor.nombres.at(-1)}` : perdedor?.nombres[0];
  return createPortal(
    <div className="fp-fondo" onClick={() => !girando && onCerrar()}>
      <div className="fp-ruleta" role="dialog" aria-label="Ronda de castigo" onClick={(e) => e.stopPropagation()}>
        <p className="fp-sup">{modo === 'adultos' ? '🍷 …y el que pierda paga el vino' : '😈 Ronda de castigo'}</p>
        <h3>{perdedor?.sorteo ? <>La suerte elige a <b>{quien}</b></> : <>Le toca a <b>{quien}</b></>}</h3>
        <div className="fp-rueda-caja">
          <span className="fp-aguja" aria-hidden="true">▼</span>
          <svg className="fp-rueda" viewBox="-100 -100 200 200" style={{ transform: `rotate(${angulo}deg)` }} aria-hidden="true">
            {casillas.map(([emoji], i) => {
              const a0 = ((i * 45) - 90 - 22.5) * (Math.PI / 180); const a1 = a0 + Math.PI / 4;
              const am = a0 + Math.PI / 8;
              return (
                <g key={i}>
                  <path d={`M0 0 L${96 * Math.cos(a0)} ${96 * Math.sin(a0)} A96 96 0 0 1 ${96 * Math.cos(a1)} ${96 * Math.sin(a1)} Z`} fill={['#7c3aed', '#db2777', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7'][i]} stroke="#ffffff" strokeWidth="2" />
                  <text x={64 * Math.cos(am)} y={64 * Math.sin(am)} fontSize="22" textAnchor="middle" dominantBaseline="central">{emoji}</text>
                </g>
              );
            })}
            <circle r="16" fill="#ffffff" stroke="#e2e8f0" strokeWidth="3" />
          </svg>
        </div>
        <div className={`fp-castigo${girando ? '' : ' visto'}`} aria-live="polite">
          {girando ? <p className="fp-girando">Girando…</p> : <><span>{elegido[0]}</span><p>{elegido[1]}</p></>}
        </div>
        <div className="fp-acciones">
          <button type="button" className="fp-sec" disabled={girando} onClick={() => setTirada((n) => n + 1)}>🔄 Otra</button>
          <button type="button" className="fp-pri" disabled={girando} onClick={onCerrar}>¡Hecho!</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function FinPartida() {
  const [fin, setFin] = useState(null);
  const [voto, setVoto] = useState(0);
  const [ruleta, setRuleta] = useState(false);
  const temporizador = useRef(null);
  useEffect(() => {
    const alAcabar = (e) => {
      const d = e.detail || {};
      if (!d.juego || !META[d.juego]) return;
      clearTimeout(temporizador.current);
      // Se deja ver primero la pantalla final del juego
      temporizador.current = setTimeout(() => { setFin({ ...d, pedirVoto: miVoto(d.juego) === 0 }); setVoto(0); setRuleta(false); }, 1600);
    };
    window.addEventListener('mj-fin-partida', alAcabar);
    return () => { window.removeEventListener('mj-fin-partida', alAcabar); clearTimeout(temporizador.current); };
  }, []);
  // Se va sola a los 25 s (salvo con la ruleta abierta)
  useEffect(() => {
    if (!fin || ruleta) return undefined;
    const t = setTimeout(() => setFin(null), 25000);
    return () => clearTimeout(t);
  }, [fin, ruleta]);
  if (!fin) return null;
  const modo = leerAjustes().castigo || 'familiar';
  const hayCastigo = modo !== 'no' && fin.jugadores.filter((j) => plano(j.nombre)).length >= 2;
  if (!hayCastigo && !fin.pedirVoto) return null;
  const m = metaDe(fin.juego);
  const darVoto = (v) => { votar(fin.juego, v); setVoto(v); setFin((f) => ({ ...f, votadoAhora: true })); if (!hayCastigo) setTimeout(() => setFin(null), 1400); };
  return (
    <>
      <aside className="fp-tarjeta" role="status">
        <button type="button" className="fp-cerrar" onClick={() => setFin(null)} aria-label="Cerrar">✕</button>
        {fin.pedirVoto && (
          <div className="fp-valorar">
            <span>{fin.votadoAhora ? '¡Gracias! 🙌' : <>¿Qué tal <b>{m.titulo}</b>?</>}</span>
            <div>
              <button type="button" className={voto === 1 ? 'activo' : ''} onClick={() => darVoto(1)} aria-label="Me ha gustado">👍</button>
              <button type="button" className={voto === -1 ? 'activo' : ''} onClick={() => darVoto(-1)} aria-label="No me ha gustado">👎</button>
            </div>
          </div>
        )}
        {hayCastigo && (
          <button type="button" className="fp-castigo-btn" onClick={() => setRuleta(true)}>
            {modo === 'adultos' ? '🍷' : '😈'} <span>Ronda de castigo</span> <small>para el que ha perdido</small>
          </button>
        )}
      </aside>
      {ruleta && <Ruleta fin={fin} modo={modo} onCerrar={() => { setRuleta(false); setFin(null); }} />}
    </>
  );
}
