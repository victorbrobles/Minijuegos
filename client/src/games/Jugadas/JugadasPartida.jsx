// client/src/games/Jugadas/JugadasPartida.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Jugadas.css';
import '../Adivina/Adivina.css';

/* ------------------------------------------------------------------ Reloj */
function Reloj({ restante, total }) {
  if (restante == null) return null;
  const seg = Math.ceil(restante / 1000);
  const pct = total ? Math.max(0, Math.min(100, (restante / total) * 100)) : 100;
  const bajo = seg <= 10;
  return (
    <div className="furbo-reloj" role="timer">
      <div className="furbo-reloj-barra">
        <div className={`furbo-reloj-fill ${bajo ? 'low' : ''}`} style={{ width: `${pct}%` }} />
      </div>
      <p className={`furbo-reloj-texto ${bajo ? 'low' : ''}`}>
        <Icon name="clock" size={16} /> {seg} s (= +{seg} pts)
      </p>
    </div>
  );
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
    <div className="jugadas-campo-wrap">
      <svg
        viewBox="-4 -4 108 108"
        className="jugadas-campo-svg"
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

      {esGol && <div className="jugadas-badge-gol">⚽ ¡GOL!</div>}
    </div>
  );
}

/* ------------------------------------------------------------ Clasificación */
function Clasificacion({ jugadores }) {
  const ranking = [...jugadores].sort((a, b) => b.puntos - a.puntos);
  const maximo = ranking.length ? ranking[0].puntos : 0;
  return (
    <div className="scoreboard">
      {ranking.map((j, i) => {
        const lider = maximo > 0 && j.puntos === maximo;
        return (
          <div key={j.id} className={`score-row${lider ? ' first' : ''}`}>
            <span className="score-name">
              {lider ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
              {j.nombre}{j.ausente ? ' (salió)' : ''}
            </span>
            <span className="score-pts">{j.puntos} pts</span>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------- Componente Principal */
export default function JugadasPartida({
  vista,
  viewerId = null,
  local = false,
  esHost = false,
  onAccion,
  onTiempo,
  finalAcciones = null,
  pie = null
}) {
  const ronda = vista.ronda;
  const [texto, setTexto] = useState('');

  // Cuenta atrás sincronizada con el servidor
  const [, setTic] = useState(0);
  const vistaRef = useRef(null);
  const recibidoRef = useRef(Date.now());
  if (vistaRef.current !== vista) {
    vistaRef.current = vista;
    recibidoRef.current = Date.now();
  }
  const hayReloj = ronda?.restanteMs != null;
  useEffect(() => {
    if (!hayReloj) return undefined;
    const id = setInterval(() => setTic((t) => t + 1), 250);
    return () => clearInterval(id);
  }, [hayReloj]);

  const restante = hayReloj ? Math.max(0, ronda.restanteMs - (Date.now() - recibidoRef.current)) : null;
  const claveTurno = ronda ? `${vista.rondaNum}-${ronda.etapa}` : `${vista.estado}`;

  // Limpiar el input cuando cambia el turno o la ronda
  useEffect(() => {
    setTexto('');
  }, [claveTurno]);

  // En modo local avisa cuando el reloj llega a 0
  const enviadoRef = useRef(null);
  useEffect(() => {
    if (!local || restante == null || restante > 0) return;
    if (enviadoRef.current === claveTurno) return;
    enviadoRef.current = claveTurno;
    if (onTiempo) onTiempo();
  }, [local, restante, claveTurno, onTiempo]);

  const jugadores = vista.jugadores;
  const nombre = (id) => jugadores.find((j) => j.id === id)?.nombre ?? '—';

  const turnoId =
    vista.estado === 'ronda' && ronda
      ? ronda.etapa === 'j1'
        ? ronda.activoId
        : ronda.etapa === 'rebote'
        ? ronda.reboteId
        : null
      : null;

  const actorId = local ? turnoId : viewerId;
  const esMiTurno = turnoId != null && actorId === turnoId;

  const enviarRespuesta = (e) => {
    e.preventDefault();
    if (!texto.trim() || !esMiTurno) return;
    onAccion({ tipo: 'responder', jugadorId: actorId, texto: texto.trim() });
  };

  const pasarTurno = () => {
    if (!esMiTurno) return;
    onAccion({ tipo: 'pasar', jugadorId: actorId });
  };

  /* ---------------------------------------------------------------- FINAL */
  if (vista.estado === 'fin') {
    const ranking = [...jugadores].sort((a, b) => b.puntos - a.puntos);
    const maximo = ranking.length ? ranking[0].puntos : 0;
    const ganadores = maximo > 0 ? ranking.filter((j) => j.puntos === maximo) : [];
    return (
      <section className="game">
        <div className="end-card">
          <span className="end-icon"><Icon name="crown" size={44} /></span>
          <h1 className="title">Final del partido</h1>
          <p className="final-score">
            {ganadores.length === 0
              ? 'Nadie ha conseguido puntos'
              : ganadores.length === 1
              ? <>¡Victoria para {ganadores[0].nombre} con {maximo} puntos!</>
              : <>Empate entre {ganadores.map((g) => g.nombre).join(', ')} con {maximo} puntos</>}
          </p>
          <Clasificacion jugadores={jugadores} />
        </div>
        {finalAcciones}
      </section>
    );
  }

  /* ---------------------------------------------- RONDA EN CURSO / REVELADO */
  const enResultado = vista.estado === 'resultado';
  const res = ronda?.resultado || {};

  return (
    <section className="game">
      {/* Cabecera y Marcador */}
      <div className="hud">
        <span className="chip"><Icon name="flagFinish" size={18} /> ⚽ Jugadas Icónicas</span>
        <span className="chip">Ronda {vista.rondaNum}/{vista.totalRondas}</span>
        <span className="chip">Vuelta {vista.vueltaActual}/{vista.totalVueltas}</span>
      </div>

      <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
        {jugadores.map((j) => (
          <div
            key={j.id}
            className={`score-pill ${j.ausente ? 'locked' : ''} ${turnoId === j.id ? 'jugadas-pill-activa' : ''}`}
          >
            <span>{j.nombre}: <strong>{j.puntos} pts</strong></span>
          </div>
        ))}
      </div>

      {/* Campo 2D */}
      {ronda && <CampoJugada ronda={ronda} />}

      {/* Pista de la jugada */}
      {ronda?.pista && (
        <div className="jugadas-pista">
          <span>💡 <strong>Pista:</strong> {ronda.pista}</span>
        </div>
      )}

      {/* Estado de la ronda */}
      {!enResultado && ronda && (
        <>
          <Reloj restante={restante} total={ronda.totalMs} />

          {ronda.etapa === 'rebote' && (
            <div className="status-alert error" style={{ marginBottom: '0.8rem' }}>
              {ronda.motivoJ1 === 'paso'
                ? `${nombre(ronda.activoId)} ha pasado turno. ¡Rebote para ${nombre(ronda.reboteId)}!`
                : ronda.motivoJ1 === 'tiempo'
                ? `Se agotó el tiempo de ${nombre(ronda.activoId)}. ¡Rebote para ${nombre(ronda.reboteId)}!`
                : `${nombre(ronda.activoId)} dijo «${ronda.intentoJ1}» y falló. ¡Rebote para ${nombre(ronda.reboteId)}!`}
            </div>
          )}

          <div className="panel" style={{ marginTop: '0.6rem' }}>
            <p className="hint center" style={{ marginBottom: '0.6rem' }}>
              {ronda.etapa === 'j1' ? (
                <>🎯 Turno de <strong>{nombre(ronda.activoId)}</strong> (Rebote: {nombre(ronda.reboteId)})</>
              ) : (
                <>↩️ Rebote único para <strong>{nombre(ronda.reboteId)}</strong></>
              )}
            </p>

            {esMiTurno ? (
              <form onSubmit={enviarRespuesta}>
                <input
                  autoFocus
                  type="text"
                  className="player-text-input respuesta-input-grande"
                  placeholder="Ej.: Maradona a Inglaterra, Iniesta a Holanda..."
                  maxLength={60}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                />
                <div className="jugadas-acciones-turno">
                  <button type="submit" className="big full" disabled={!texto.trim()}>
                    Adivinar jugada
                  </button>
                  <button type="button" className="secondary full" onClick={pasarTurno}>
                    ⏭️ Pasar
                  </button>
                </div>
              </form>
            ) : (
              <p className="hint center">
                Esperando a que <strong>{nombre(turnoId)}</strong> adivine la jugada...
              </p>
            )}
          </div>
        </>
      )}

      {/* Resultado de la ronda */}
      {enResultado && ronda && (
        <>
          <div className="furbo-respuesta-real" style={{ marginTop: '0.8rem' }}>
            ⚽ {ronda.titulo}
          </div>

          {res.ganadorId ? (
            <div className="status-alert success">
              ¡<strong>{nombre(res.ganadorId)}</strong> acierta{res.esRebote ? ' en el rebote' : ''} y suma <strong>+{res.puntos} puntos</strong>!
            </div>
          ) : (
            <div className="status-alert error">
              Nadie ha acertado la jugada en esta ronda.
            </div>
          )}

          <div style={{ marginTop: '1rem' }}>
            <Clasificacion jugadores={jugadores} />
          </div>

          <div className="actions">
            {esHost ? (
              <button type="button" onClick={() => onAccion({ tipo: 'continuar' })}>
                <Icon name="play" size={20} />{' '}
                {vista.rondaNum < vista.totalRondas
                  ? `Siguiente jugada (${vista.rondaNum + 1}/${vista.totalRondas})`
                  : 'Ver clasificación final'}
              </button>
            ) : (
              <p className="hint center" style={{ width: '100%' }}>Esperando al anfitrión...</p>
            )}

            {esHost && vista.puedeFinalizar && (
              <button
                type="button"
                className="secondary danger"
                onClick={() => onAccion({ tipo: 'finalizar' })}
              >
                <Icon name="flagFinish" size={20} /> Finalizar partida
              </button>
            )}
          </div>
        </>
      )}

      {pie}
    </section>
  );
}