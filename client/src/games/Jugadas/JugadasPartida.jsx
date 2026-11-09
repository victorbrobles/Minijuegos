// client/src/games/Jugadas/JugadasPartida.jsx
// Pantallas de «¡Qué jugadón!» (online y un solo dispositivo) con el estilo de los juegos renovados.
// Recibe la vista del motor (server/lib/jugadasEngine.js) y manda acciones con onAccion({ tipo, ... }).
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Jugadas.css';

export const COLORES = ['#d97706', '#2563eb', '#dc2626', '#16a34a', '#9333ea', '#0d9488', '#ea580c', '#db2777', '#4f46e5', '#65a30d', '#0891b2', '#78716c'];
export const colorDe = (id) => COLORES[((Number(id) || 1) - 1) % COLORES.length];
const inicial = (n) => (n || '?').trim().charAt(0).toUpperCase();
export function Avatar({ id, nombre }) {
  return <span className="jgp-avatar" style={{ '--c': colorDe(id) }}>{inicial(nombre)}</span>;
}

/* -------------------------------------------------- Utilidad de color texto */
function colorTextoFicha(hex) {
  const limpio = String(hex || '#ffffff').replace('#', '');
  if (limpio.length !== 6) return '#ffffff';
  const r = parseInt(limpio.slice(0, 2), 16);
  const g = parseInt(limpio.slice(2, 4), 16);
  const b = parseInt(limpio.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.65 ? '#0f172a' : '#ffffff';
}

/* ------------------------------------------------ Reproductor 2D del Campo */
function CampoJugada({ ronda }) {
  const [posiciones, setPosiciones] = useState(null);
  const [esGol, setEsGol] = useState(false);

  useEffect(() => {
    const frames = ronda?.frames;
    if (!frames || frames.length < 2) return undefined;

    // Construimos la línea de tiempo acumulada
    let acumulado = 0;
    const tiempos = frames.map((f, idx) => {
      if (idx === 0) return 0;
      // Ralentizamos la animación multiplicando los ms por 1.5
      acumulado += (f[0] || 800) * 1.5; 
      return acumulado;
    });
    const pausaFinalMs = 1100; // pausa antes de repetir en bucle
    const duracionCiclo = acumulado + pausaFinalMs;

    let rafId;
    const inicio = performance.now();

    const animar = (ahora) => {
      const t = (ahora - inicio) % duracionCiclo;

      if (t >= acumulado) {
        const ultimo = frames[frames.length - 1];
        setPosiciones({
          balon: ultimo[1],
          actores: ultimo.slice(2)
        });
        setEsGol(ultimo[1][0] >= 99);
      } else {
        setEsGol(false);
        let idx = 0;
        while (idx < tiempos.length - 2 && t >= tiempos[idx + 1]) {
          idx += 1;
        }
        const t0 = tiempos[idx];
        const t1 = tiempos[idx + 1];
        const alpha = t1 > t0 ? (t - t0) / (t1 - t0) : 0;

        const f0 = frames[idx];
        const f1 = frames[idx + 1];

        const interp = (p0, p1) => [
          p0[0] + (p1[0] - p0[0]) * alpha,
          p0[1] + (p1[1] - p0[1]) * alpha
        ];

        setPosiciones({
          balon: interp(f0[1], f1[1]),
          actores: f0.slice(2).map((coord, i) => interp(coord, f1[i + 2] || coord))
        });
      }

      rafId = requestAnimationFrame(animar);
    };

    rafId = requestAnimationFrame(animar);
    return () => cancelAnimationFrame(rafId);
  }, [ronda?.jugadaId, ronda?.frames]);

  const fInicial = ronda?.frames?.[0];
  const balon = posiciones?.balon || fInicial?.[1] || [50, 50];
  const coordsActores = posiciones?.actores || fInicial?.slice(2) || [];
  const [colorAtq, colorDef] = ronda?.colores || ['#dc2626', '#1d4ed8'];

  return (
    <div className="jgp-campo">
      <svg
        viewBox="-4 -4 108 108"
        className="jgp-campo-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id="cesped-franjas" width="20" height="100" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="10" height="100" fill="#15803d" />
            <rect x="10" y="0" width="10" height="100" fill="#166534" />
          </pattern>
        </defs>

        {/* Césped exterior e interior */}
        <rect x="-4" y="-4" width="108" height="108" rx="4" fill="#14532d" />
        <rect x="0" y="0" width="100" height="100" fill="url(#cesped-franjas)" stroke="#ffffff" strokeWidth="0.7" />

        {/* Línea de medio campo y círculo central */}
        <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.85)" strokeWidth="0.6" />
        <circle cx="50" cy="50" r="10" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.6" />
        <circle cx="50" cy="50" r="0.9" fill="#ffffff" />

        {/* Área izquierda */}
        <rect x="0" y="21" width="16" height="58" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.6" />
        <rect x="0" y="36" width="5.5" height="28" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.6" />
        <circle cx="11" cy="50" r="0.8" fill="#ffffff" />
        <path d="M 16 40 A 10 10 0 0 1 16 60" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.6" />
        <rect x="-2.4" y="44" width="2.4" height="12" fill="rgba(255,255,255,0.25)" stroke="#ffffff" strokeWidth="0.6" />

        {/* Área derecha (portería donde se ataca) */}
        <rect x="84" y="21" width="16" height="58" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.6" />
        <rect x="94.5" y="36" width="5.5" height="28" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.6" />
        <circle cx="89" cy="50" r="0.8" fill="#ffffff" />
        <path d="M 84 40 A 10 10 0 0 0 84 60" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.6" />
        <rect x="100" y="44" width="2.6" height="12" fill="rgba(255,255,255,0.35)" stroke="#ffffff" strokeWidth="0.7" />

        {/* Córners */}
        <path d="M 0 2 A 2 2 0 0 0 2 0" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.5" />
        <path d="M 0 98 A 2 2 0 0 1 2 100" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.5" />
        <path d="M 98 0 A 2 2 0 0 0 100 2" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.5" />
        <path d="M 98 100 A 2 2 0 0 1 100 98" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.5" />

        {/* Jugadores (Fichas MÁS GRANDES) */}
        {(ronda?.actores || []).map((codigo, i) => {
          const pos = coordsActores[i] || [50, 50];
          const esPorteroAtq = codigo.startsWith('PA');
          const esPorteroRival = codigo.startsWith('P') && !esPorteroAtq;
          const esAtacante = codigo.startsWith('A') || esPorteroAtq;
          const dorsal = codigo.replace(/^[A-Z]+/, '');

          let bg = esAtacante ? colorAtq : colorDef;
          if (esPorteroRival) bg = '#10b981';
          if (esPorteroAtq) bg = '#f59e0b';
          const fg = colorTextoFicha(bg);

          return (
            <g key={`${codigo}-${i}`} transform={`translate(${pos[0]}, ${pos[1]})`}>
              <circle
                r="4.5"
                fill={bg}
                stroke={esAtacante ? '#ffffff' : '#0f172a'}
                strokeWidth="0.65"
              />
              <text
                y="1.5"
                textAnchor="middle"
                fill={fg}
                fontSize="4.2"
                fontWeight="800"
                style={{ userSelect: 'none' }}
              >
                {dorsal}
              </text>
            </g>
          );
        })}

        {/* Balón MÁS GRANDE */}
        <g transform={`translate(${balon[0]}, ${balon[1]})`}>
          <circle r="2.6" fill="#ffffff" stroke="#0f172a" strokeWidth="0.55" />
          <circle r="1.0" fill="#0f172a" />
        </g>
      </svg>

      {esGol && <div className="jgp-gol">⚽ ¡GOL!</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ Piezas */
function Hero({ vista, turnoId, onSalir, etiqueta, titulo, clase = '', viewerId }) {
  return (
    <header className={`jgp-hero ${clase}`}>
      <span className="jgp-pizarra-fondo" aria-hidden="true">✕ ○ →</span>
      <div className="jgp-hero-top">
        <button type="button" className="jgp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
        <div className="jgp-chips">
          <span className="jgp-chip">⚽ {Math.min(vista.rondaNum, vista.totalRondas)}/{vista.totalRondas}</span>
          <span className="jgp-chip">Vuelta {Math.min(vista.vueltaActual, vista.totalVueltas)}/{vista.totalVueltas}</span>
        </div>
      </div>
      <p className="jgp-hero-etiqueta">{etiqueta}</p>
      <h1 className="jgp-hero-titulo">{titulo}</h1>
      <div className="jgp-marcador">
        {[...vista.jugadores].sort((a, b) => b.puntos - a.puntos).map((j) => (
          <span key={j.id} className={`jgp-marca${turnoId === j.id ? ' turno' : ''}${j.id === viewerId ? ' yo' : ''}${j.ausente ? ' fuera' : ''}`}>
            <Avatar id={j.id} nombre={j.nombre} />
            <span className="jgp-marca-nombre">{j.nombre}</span>
            <span className="jgp-marca-datos">{j.puntos}</span>
          </span>
        ))}
      </div>
    </header>
  );
}

function Reloj({ restante, total }) {
  if (restante == null) return null;
  const seg = Math.ceil(restante / 1000);
  const pct = total ? Math.max(0, Math.min(100, (restante / total) * 100)) : 100;
  return (
    <div className={`jgp-reloj${seg <= 10 ? ' critico' : ''}`} role="timer">
      <div className="jgp-reloj-barra"><span style={{ width: `${pct}%` }} /></div>
      <strong>{seg}s</strong>
      <small>= +{seg} pts</small>
    </div>
  );
}

function Ranking({ jugadores, viewerId }) {
  const orden = [...jugadores].sort((a, b) => b.puntos - a.puntos);
  const max = orden[0]?.puntos ?? 0;
  return (
    <ol className="jgp-ranking">
      {orden.map((j, i) => (
        <li key={j.id} className={max > 0 && j.puntos === max ? 'lider' : ''}>
          <span className="jgp-pos">{j.ausente ? '🚪' : i + 1}</span>
          <Avatar id={j.id} nombre={j.nombre} />
          <span className="jgp-ranking-nombre">{j.nombre}{j.id === viewerId ? ' (tú)' : ''}</span>
          <strong>{j.puntos}</strong>
        </li>
      ))}
    </ol>
  );
}

/* ---------------------------------------------------------------- Pantalla */
export default function JugadasPartida({ vista, viewerId = null, local = false, esHost = false, onAccion, onTiempo, onSalir, finalAcciones = null, pie = null }) {
  const ronda = vista.ronda;
  const [texto, setTexto] = useState('');

  // Cuenta atrás a partir de lo que quedaba cuando llegó la vista
  const [, setTic] = useState(0);
  const vistaRef = useRef(null);
  const recibidoRef = useRef(Date.now());
  if (vistaRef.current !== vista) {
    vistaRef.current = vista;
    recibidoRef.current = Date.now();
  }
  const hayReloj = ronda?.restanteMs != null && vista.estado === 'ronda';
  useEffect(() => {
    if (!hayReloj) return undefined;
    const id = setInterval(() => setTic((t) => t + 1), 250);
    return () => clearInterval(id);
  }, [hayReloj]);
  const restante = hayReloj ? Math.max(0, ronda.restanteMs - (Date.now() - recibidoRef.current)) : null;
  const claveTurno = ronda ? `${vista.rondaNum}-${ronda.etapa}` : `${vista.estado}`;
  useEffect(() => { setTexto(''); }, [claveTurno]);

  // En un dispositivo, al llegar a 0 se avisa al motor
  const enviadoRef = useRef(null);
  useEffect(() => {
    if (!local || restante == null || restante > 0) return;
    if (enviadoRef.current === claveTurno) return;
    enviadoRef.current = claveTurno;
    onTiempo?.();
  }, [local, restante, claveTurno, onTiempo]);

  const jugadores = vista.jugadores;
  const nombre = (id) => jugadores.find((j) => j.id === id)?.nombre ?? '—';
  const turnoId = vista.estado === 'ronda' && ronda ? (ronda.etapa === 'j1' ? ronda.activoId : ronda.etapa === 'rebote' ? ronda.reboteId : null) : null;
  const actorId = local ? turnoId : viewerId;
  const esMiTurno = turnoId != null && actorId === turnoId;
  const enviar = (e) => {
    e.preventDefault();
    if (!texto.trim() || !esMiTurno) return;
    onAccion({ tipo: 'responder', jugadorId: actorId, texto: texto.trim() });
  };

  if (vista.estado === 'fin') {
    const orden = [...jugadores].sort((a, b) => b.puntos - a.puntos);
    const max = orden[0]?.puntos ?? 0;
    const ganadores = max > 0 ? orden.filter((j) => j.puntos === max) : [];
    return (
      <>
        <Hero vista={vista} onSalir={onSalir} viewerId={viewerId} etiqueta="Final del partido"
          titulo={ganadores.length ? `¡Gana ${ganadores.map((g) => g.nombre).join(' y ')}!` : 'Nadie ha puntuado'} clase="fin" />
        <div className="jgp-tarjeta">
          <p className="jgp-etiqueta">Clasificación</p>
          <Ranking jugadores={jugadores} viewerId={viewerId} />
        </div>
        {finalAcciones}
      </>
    );
  }

  const enResultado = vista.estado === 'resultado';
  const res = ronda?.resultado || {};
  let etiqueta; let titulo;
  if (enResultado) {
    etiqueta = res.ganadorId ? `¡${nombre(res.ganadorId)} lo ha sacado${res.esRebote ? ' en el rebote' : ''}!` : 'Nadie lo ha sacado';
    titulo = res.ganadorId ? '¡Jugadón acertado!' : 'Se ha resistido';
  } else if (ronda?.etapa === 'rebote') {
    etiqueta = `Rebote para ${nombre(ronda.reboteId)}`;
    titulo = esMiTurno && !local ? '¡Te llega el rebote!' : '¿Qué jugada es?';
  } else {
    etiqueta = local ? `Turno de ${nombre(turnoId)}` : esMiTurno ? 'Tu turno' : `Turno de ${nombre(turnoId)}`;
    titulo = '¿Qué jugada es?';
  }

  return (
    <>
      <Hero vista={vista} turnoId={turnoId} onSalir={onSalir} viewerId={viewerId} etiqueta={etiqueta} titulo={titulo}
        clase={enResultado ? 'fin' : esMiTurno && !local ? 'mio' : ''} />
      {!enResultado && <Reloj restante={restante} total={ronda?.totalMs} />}
      {ronda && <CampoJugada ronda={ronda} />}
      {ronda?.pista && <div className="jgp-pista"><span>💡</span> <p><strong>Pista:</strong> {ronda.pista}</p></div>}

      {!enResultado && ronda && (
        <>
          {ronda.etapa === 'rebote' && (
            <div className="jgp-aviso">
              {ronda.motivoJ1 === 'paso' ? `${nombre(ronda.activoId)} ha pasado.`
                : ronda.motivoJ1 === 'tiempo' ? `A ${nombre(ronda.activoId)} se le acabó el tiempo.`
                  : `${nombre(ronda.activoId)} dijo «${ronda.intentoJ1}» y falló.`} ¡Rebote para {nombre(ronda.reboteId)}!
            </div>
          )}
          {esMiTurno ? (
            <form className="jgp-tarjeta jgp-respuesta" onSubmit={enviar}>
              <p className="jgp-etiqueta">{local ? `Responde, ${nombre(turnoId)}` : 'Tu respuesta'}{ronda.etapa === 'j1' && ronda.reboteId ? ` · si fallas, rebote para ${nombre(ronda.reboteId)}` : ''}</p>
              <input autoFocus className="jgp-input" placeholder="Ej.: Iniesta a Holanda, Maradona a Inglaterra…" maxLength={60}
                value={texto} onChange={(e) => setTexto(e.target.value)} autoComplete="off" />
              <div className="jgp-dos">
                <button type="button" className="jgp-boton secundario" onClick={() => onAccion({ tipo: 'pasar', jugadorId: actorId })}>⏭️ Pasar</button>
                <button type="submit" className="jgp-boton" disabled={!texto.trim()}><Icon name="check" size={20} /> Adivinar</button>
              </div>
            </form>
          ) : (
            <p className="jgp-esperando">⏳ {nombre(turnoId)} está pensando la jugada…</p>
          )}
        </>
      )}

      {enResultado && ronda && (
        <>
          <div className={`jgp-tarjeta jgp-solucion${res.ganadorId ? ' bien' : ''}`}>
            <span className="jgp-solucion-icono" aria-hidden="true">{res.ganadorId ? '🎉' : '⚽'}</span>
            <p className="jgp-etiqueta centrada">Era…</p>
            <h2>{ronda.titulo}</h2>
            <p className="jgp-texto">{res.ganadorId ? `${nombre(res.ganadorId)} suma ${res.puntos} puntos${res.respuestaDada ? ` con «${res.respuestaDada}»` : ''}.` : 'Nadie ha acertado esta jugada.'}</p>
          </div>
          <div className="jgp-tarjeta">
            <p className="jgp-etiqueta">Clasificación</p>
            <Ranking jugadores={jugadores} viewerId={viewerId} />
          </div>
          <div className="jgp-barra estatica">
            {esHost ? (
              <>
                <button type="button" className="jgp-boton grande" onClick={() => onAccion({ tipo: 'continuar' })}>
                  <Icon name="play" size={20} /> {vista.rondaNum < vista.totalRondas ? `Siguiente jugada (${vista.rondaNum + 1}/${vista.totalRondas})` : 'Ver clasificación final'}
                </button>
                {vista.puedeFinalizar && (
                  <button type="button" className="jgp-boton secundario" onClick={() => onAccion({ tipo: 'finalizar' })}>
                    <Icon name="flagFinish" size={18} /> Terminar aquí (vuelta completa)
                  </button>
                )}
              </>
            ) : <p className="jgp-esperando">⏳ Esperando al anfitrión…</p>}
          </div>
        </>
      )}
      {pie}
    </>
  );
}
