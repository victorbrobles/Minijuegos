// client/src/games/Rasgos/RasgosLocal.jsx
import { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import './Rasgos.css';

const TIEMPO_S = 60;
const MIN_JUGADORES = 2;
const MAX_JUGADORES = 15;

const llamar = async (ruta, cuerpo) => {
  const res = await fetch(`/api/rasgos${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error del servidor');
  return data;
};

function Ronda({ partidaId, indice, total, rasgo, jugadores, puntos, onPuntos, onTerminar }) {
  const [imagenLista, setImagenLista] = useState(false);
  const [errorImagen, setErrorImagen] = useState(null);
  const [intentoImagen, setIntentoImagen] = useState(0);
  const [restante, setRestante] = useState(TIEMPO_S);
  const [bloqueados, setBloqueados] = useState([]);
  const [pulsadorActivo, setPulsadorActivo] = useState(false);
  const [respuestaTexto, setRespuestaTexto] = useState('');
  const [errorModal, setErrorModal] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [cerrando, setCerrando] = useState(false);
  const [errorCierre, setErrorCierre] = useState(null);

  const empezada = useRef(false);
  const cerrandoRef = useRef(false);

  const activo = imagenLista && !pulsadorActivo && !cerrando;

  useEffect(() => {
    if (!activo) return;
    let anterior = Date.now();
    const id = setInterval(() => {
      const ahora = Date.now();
      const delta = (ahora - anterior) / 1000;
      anterior = ahora;
      setRestante((r) => Math.max(0, r - delta));
    }, 100);
    return () => clearInterval(id);
  }, [activo]);

  const cerrarRonda = async (tipo, extra = {}) => {
    if (cerrandoRef.current) return;
    cerrandoRef.current = true;
    setCerrando(true);
    setErrorCierre(null);
    try {
      const { nombre, attribution } = await llamar('/solucion', { partidaId, ronda: indice });
      onTerminar({ tipo, nombre, attribution, ...extra });
    } catch (err) {
      cerrandoRef.current = false;
      setErrorCierre({ mensaje: err.message, tipo });
    }
  };

  useEffect(() => {
    if (activo && restante <= 0) cerrarRonda('tiempo');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activo, restante]);

  const imagenCargada = async () => {
    if (empezada.current) return;
    try {
      await llamar('/empezar', { partidaId, ronda: indice });
      empezada.current = true;
      setErrorImagen(null);
      setImagenLista(true);
    } catch (err) {
      setErrorImagen(err.message);
    }
  };

  const handlePulsarBotonRojo = () => {
    if (!activo) return;
    setPulsadorActivo(true);
    setRespuestaTexto('');
    setErrorModal(null);
    setAviso(null);
  };

  const cancelarRespuesta = () => {
    setPulsadorActivo(false);
    setRespuestaTexto('');
  };

  const confirmarRespuestaJugador = async (jugador) => {
    if (!respuestaTexto.trim() || !pulsadorActivo) return;
    const segundos = Math.max(1, Math.ceil(restante));
    setErrorModal(null);

    try {
      const data = await llamar('/validar', {
        partidaId,
        ronda: indice,
        jugadorId: jugador.id,
        respuesta: respuestaTexto
      });

      setPulsadorActivo(false);
      setRespuestaTexto('');

      if (data.correcto) {
        onPuntos(jugador.id, segundos);
        onTerminar({
          tipo: 'acierto',
          jugador,
          puntos: segundos,
          nombre: data.nombreReal,
          attribution: data.attribution
        });
      } else {
        onPuntos(jugador.id, -segundos);
        const nuevos = [...bloqueados, jugador.id];
        setBloqueados(nuevos);

        if (nuevos.length >= jugadores.length) {
          await cerrarRonda('todos');
        } else {
          setAviso(`${jugador.nombre} ha fallado (-${segundos} pts). Queda fuera de esta ronda.`);
        }
      }
    } catch (err) {
      setErrorModal(err.message);
    }
  };

  const bajoTiempo = imagenLista && restante <= 10;
  const jugadoresDisponibles = jugadores.filter((j) => !bloqueados.includes(j.id));

  return (
    <section className="game">
      <div className="hud">
        <span className="chip"><Icon name="flagFinish" size={18} />Ronda {indice + 1} de {total}</span>
      </div>

      <div className="rg-foto">
        <img
          key={intentoImagen}
          src={`/api/rasgos/imagen/${partidaId}/${indice}?i=${intentoImagen}`}
          alt="Detalle físico de un famoso"
          draggable={false}
          onLoad={imagenCargada}
          onError={() => setErrorImagen('No se ha podido cargar la imagen.')}
        />
        {!imagenLista && (
          <div className="rg-foto-cargando" role="status">
            {errorImagen ? (
              <>
                <span>{errorImagen}</span>
                <button
                  onClick={() => {
                    setErrorImagen(null);
                    setIntentoImagen((n) => n + 1);
                  }}
                >
                  <Icon name="refresh" size={20} />Reintentar
                </button>
              </>
            ) : (
              <span>Cargando imagen…</span>
            )}
          </div>
        )}
      </div>

      <div className="timer" role="timer" aria-label="Tiempo restante">
        <div className={`timer-bar${bajoTiempo ? ' low' : ''}`} style={{ width: `${(restante / TIEMPO_S) * 100}%` }} />
      </div>
      <p className="timer-text">
        <Icon name="clock" size={16} />
        {Math.ceil(restante)} s
      </p>

      {aviso && <p className="rg-aviso" role="status">{aviso}</p>}
      {errorCierre && (
        <p className="error" role="alert">
          {errorCierre.mensaje}{' '}
          <button className="secondary" onClick={() => cerrarRonda(errorCierre.tipo)}>Reintentar</button>
        </p>
      )}

      {/* MARCADOR DE PUNTOS COMPACTO */}
      <div className="scoreboard-container" style={{ marginTop: '0.8rem', justifyContent: 'center' }}>
        {jugadores.map((j) => {
          const fuera = bloqueados.includes(j.id);
          return (
            <div key={j.id} className={`score-pill ${fuera ? 'locked' : ''}`}>
              <span>{j.nombre}: <strong>{puntos[j.id] ?? 0} pts</strong></span>
              {fuera && <span style={{ marginLeft: '4px' }}>❌</span>}
            </div>
          );
        })}
      </div>

      {/* CONTROL PRINCIPAL CON PULSADOR ROJO */}
      <div className="interactive-controls" style={{ marginTop: '1rem' }}>
        {!pulsadorActivo ? (
          <div className="pulsador-container">
            <button
              type="button"
              className="btn-pulsador-rojo"
              onClick={handlePulsarBotonRojo}
              disabled={!activo || jugadoresDisponibles.length === 0}
            >
              <span className="pulsador-icono">🔴</span>
              <span className="pulsador-texto">¡PULSAR PARA RESPONDER!</span>
            </button>
          </div>
        ) : (
          <div className="respuesta-pulsada-box">
            <div className="respuesta-pulsada-header">
              <span className="pulsado-badge">🔴 Tiempo detenido para responder (+{Math.max(1, Math.ceil(restante))} pts)</span>
              <p className="hint small" style={{ margin: '0.4rem 0 0.8rem' }}>
                Escribe el nombre del famoso y selecciona el jugador que ha contestado:
              </p>
            </div>

            <input
              autoFocus
              type="text"
              className="player-text-input respuesta-input-grande"
              placeholder="Nombre del famoso..."
              value={respuestaTexto}
              onChange={(e) => setRespuestaTexto(e.target.value)}
              maxLength={100}
            />

            {errorModal && <p className="error" style={{ marginTop: '0.6rem' }}>{errorModal}</p>}

            <p className="form-label" style={{ marginTop: '0.8rem', textAlign: 'center' }}>
              ¿Quién responde?
            </p>

            <div className="modal-players-grid">
              {jugadoresDisponibles.map((j) => (
                <button
                  key={j.id}
                  type="button"
                  className="btn-modal-player"
                  disabled={!respuestaTexto.trim()}
                  onClick={() => confirmarRespuestaJugador(j)}
                >
                  {j.nombre}
                </button>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '0.8rem' }}>
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={cancelarRespuesta}
              >
                Cancelar y reanudar tiempo
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function RasgosLocal({ onVolver, onExit }) {
  const [paso, setPaso] = useState('config');
  const [modalAyuda, setModalAyuda] = useState(false);
  const [jugadores, setJugadores] = useState([
    { id: 1, nombre: 'Jugador 1' },
    { id: 2, nombre: 'Jugador 2' }
  ]);
  const [puntos, setPuntos] = useState({});
  const [partidaId, setPartidaId] = useState(null);
  const [rondas, setRondas] = useState([]);
  const [ronda, setRonda] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [creando, setCreando] = useState(false);
  const [errorConfig, setErrorConfig] = useState(null);

  const handleNumJugadores = (e) => {
    const num = parseInt(e.target.value, 10);
    setJugadores(Array.from({ length: num }, (_, i) => ({
      id: i + 1,
      nombre: jugadores[i]?.nombre ?? `Jugador ${i + 1}`
    })));
  };

  const handleNombre = (index, valor) => {
    setJugadores(jugadores.map((j, i) => (i === index ? { ...j, nombre: valor } : j)));
  };

  const empezar = async () => {
    const lista = jugadores.map((j) => ({ ...j, nombre: j.nombre.trim() || `Jugador ${j.id}` }));
    setCreando(true);
    setErrorConfig(null);
    try {
      const data = await llamar('/partida', { jugadores: lista.length });
      setJugadores(lista);
      setPuntos(Object.fromEntries(lista.map((j) => [j.id, 0])));
      setPartidaId(data.partidaId);
      setRondas(data.rondas);
      setRonda(0);
      setResultado(null);
      setPaso('ronda');
    } catch (err) {
      setErrorConfig(err.message);
    } finally {
      setCreando(false);
    }
  };

  const sumarPuntos = (id, delta) => setPuntos((p) => ({ ...p, [id]: (p[id] ?? 0) + delta }));

  const terminarRonda = (res) => {
    setResultado(res);
    setPaso('resultado');
  };

  const siguiente = () => {
    setRonda((r) => r + 1);
    setResultado(null);
    setPaso('ronda');
  };

  const ranking = [...jugadores].sort((a, b) => (puntos[b.id] ?? 0) - (puntos[a.id] ?? 0));
  const maximo = ranking.length ? (puntos[ranking[0].id] ?? 0) : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => (puntos[j.id] ?? 0) === maximo) : [];

  const tabla = (
    <div className="scoreboard">
      {ranking.map((j, i) => {
        const pts = puntos[j.id] ?? 0;
        const primero = maximo > 0 && pts === maximo;
        return (
          <div key={j.id} className={`score-row${primero ? ' first' : ''}`}>
            <span className="score-name">
              {primero ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
              {j.nombre}
            </span>
            <span className="score-pts">{pts} pts</span>
          </div>
        );
      })}
    </div>
  );

  // 1. Configuración de jugadores
  if (paso === 'config') {
    return (
      <section className="game" style={{ position: 'relative' }}>
        <button
          type="button"
          className="btn-ayuda-flotante"
          onClick={() => setModalAyuda(true)}
          title="Reglas y puntuación"
        >
          <span className="btn-ayuda-flotante-signo">?</span>
        </button>

        {modalAyuda && (
          <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
            <div className="rg-modal modal-ayuda-juego" onClick={(e) => e.stopPropagation()}>
              <div className="modal-ayuda-header">
                <span className="modal-ayuda-signo-title">?</span>
                <h3>¿Cómo se juega a Rasgos de Famosos?</h3>
              </div>
              <div className="modal-ayuda-cuerpo">
                <p><strong>1. Dinámica del juego:</strong></p>
                <ul>
                  <li>Se muestra un detalle físico recortado del rostro de un famoso.</li>
                  <li>Dispones de un cronómetro de <strong>60 segundos</strong>.</li>
                  <li><strong>Pulsa el botón rojo</strong> para parar el tiempo e introducir el nombre del famoso.</li>
                </ul>
                <p><strong>2. Puntuación:</strong></p>
                <div className="tabla-ayuda-puntos">
                  <div className="fila-ayuda-puntos verde">
                    <span>⏱️ Acierto</span>
                    <strong>Suma los segundos restantes (+segundos)</strong>
                  </div>
                  <div className="fila-ayuda-puntos rojo">
                    <span>❌ Fallo</span>
                    <strong>Resta los segundos restantes (-segundos) y quedas fuera</strong>
                  </div>
                </div>
              </div>
              <div className="rg-modal-acciones">
                <button className="big full" onClick={() => setModalAyuda(false)}>
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

        <GameIntro gameId="rasgos" titulo="Rasgos de famosos (Un solo dispositivo)" />

        <div className="panel">
          <div className="hud" style={{ marginBottom: '1rem' }}>
            <button className="btn-back-inline" onClick={onVolver}>
              &larr; Cambiar modo
            </button>
          </div>

          <h3 className="panel-title"><Icon name="users" size={22} />Participantes</h3>
          <label className="field-label" htmlFor="rg-num-jugadores">
            Número de jugadores ({MIN_JUGADORES} a {MAX_JUGADORES})
          </label>
          <select id="rg-num-jugadores" value={jugadores.length} onChange={handleNumJugadores}>
            {Array.from({ length: MAX_JUGADORES - MIN_JUGADORES + 1 }, (_, i) => (
              <option key={i + MIN_JUGADORES} value={i + MIN_JUGADORES}>{i + MIN_JUGADORES} jugadores</option>
            ))}
          </select>

          <span className="field-label">Nombres</span>
          <div className="names-grid">
            {jugadores.map((j, idx) => (
              <input
                key={j.id}
                type="text"
                value={j.nombre}
                onChange={(e) => handleNombre(idx, e.target.value)}
                placeholder={`Jugador ${j.id}`}
                maxLength={30}
              />
            ))}
          </div>
        </div>
        {errorConfig && <p className="error" role="alert">{errorConfig}</p>}
        <button className="big full" onClick={empezar} disabled={creando}>
          <Icon name="play" size={24} />{creando ? 'Preparando…' : '¡Empezar!'}
        </button>
      </section>
    );
  }

  // 2. Ronda en juego
  if (paso === 'ronda') {
    return (
      <Ronda
        key={ronda}
        partidaId={partidaId}
        indice={ronda}
        total={rondas.length}
        rasgo={rondas[ronda]?.rasgo}
        jugadores={jugadores}
        puntos={puntos}
        onPuntos={sumarPuntos}
        onTerminar={terminarRonda}
      />
    );
  }

  // 3. Resultado de la ronda
  if (paso === 'resultado') {
    const ultima = ronda + 1 >= rondas.length;
    return (
      <section className="game">
        <div className="end-card">
          <span className="end-icon"><Icon name="trophy" size={44} /></span>
          <h1 className="title">Puntuaciones</h1>
          <p className="categoria"><Icon name="eye" size={16} />Ronda {ronda + 1} de {rondas.length}</p>
          <p className="rg-nombre-famoso">{resultado.nombre}</p>
          <img
            className="rg-reveal-foto"
            src={`/api/rasgos/foto/${partidaId}/${ronda}`}
            alt={`Foto de ${resultado.nombre}`}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          {resultado.attribution && (
            <p className="rg-atribucion">
              Foto original por{' '}
              <a href={resultado.attribution.fuenteUrl} target="_blank" rel="noopener noreferrer">
                {resultado.attribution.autor}
              </a>{' '}
              (Wikimedia Commons), bajo licencia{' '}
              <a href={resultado.attribution.licenciaUrl} target="_blank" rel="noopener noreferrer">
                {resultado.attribution.licencia}
              </a>.
            </p>
          )}
          <p className="reveal">
            {resultado.tipo === 'acierto' && (
              <><strong>{resultado.jugador.nombre}</strong> acierta y suma <strong>{resultado.puntos} {resultado.puntos === 1 ? 'punto' : 'puntos'}</strong>.</>
            )}
            {resultado.tipo === 'tiempo' && '¡Se acabó el tiempo! Nadie lo ha adivinado.'}
            {resultado.tipo === 'todos' && 'Todos habéis fallado esta ronda.'}
          </p>
          {tabla}
        </div>
        <div className="actions">
          {ultima ? (
            <button onClick={() => setPaso('final')}>
              <Icon name="trophy" size={20} />Ver resultados finales
            </button>
          ) : (
            <>
              <button onClick={siguiente}>
                <Icon name="play" size={20} />Siguiente ronda ({ronda + 2} de {rondas.length})
              </button>
              <button className="secondary" onClick={() => setPaso('final')}>
                <Icon name="flagFinish" size={20} />Finalizar el juego
              </button>
            </>
          )}
        </div>
      </section>
    );
  }

  // 4. Podio final
  return (
    <section className="game">
      <div className="end-card">
        <span className="end-icon"><Icon name="crown" size={44} /></span>
        <h1 className="title">Puntuaciones finales</h1>
        <p className="final-score">
          {ganadores.length === 0
            ? 'Nadie ha sumado puntos'
            : ganadores.length === 1
              ? <>¡Gana {ganadores[0].nombre}!</>
              : <>Empate entre {ganadores.map((g) => g.nombre).join(', ')}</>}
        </p>
        {tabla}
      </div>
      <div className="actions">
        <button onClick={() => { setErrorConfig(null); setPaso('config'); }}>
          <Icon name="refresh" size={20} />Nueva partida
        </button>
        <button className="secondary danger" onClick={onVolver}>
          <Icon name="door" size={20} />Volver al menú
        </button>
      </div>
    </section>
  );
}