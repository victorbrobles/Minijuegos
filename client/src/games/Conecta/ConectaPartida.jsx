// client/src/games/Conecta/ConectaPartida.jsx
// Pantallas de una ronda de Conecta 4 por turnos. Las usan el modo local y el online.
// Recibe la «vista» del motor (engine.js) y llama a onAccion(tipo, datos).
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';

// Colores de los grupos según el orden en que se resuelven
export const COLORES_GRUPO = ['#f59e0b', '#22c55e', '#3b82f6', '#a855f7'];
const COLORES_JUGADOR = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#84cc16', '#6366f1'];
const colorJugador = (id) => COLORES_JUGADOR[(Number(id) - 1 + COLORES_JUGADOR.length * 10) % COLORES_JUGADOR.length];
const inicial = (n = '?') => n.trim().charAt(0).toUpperCase() || '?';

// Cuenta atrás local a partir de los ms restantes que da el motor/servidor
function useCuentaAtras(restanteMs, clave) {
  const [fin, setFin] = useState(null);
  const [ahora, setAhora] = useState(Date.now());
  useEffect(() => {
    setFin(restanteMs == null ? null : Date.now() + restanteMs);
  }, [restanteMs, clave]);
  useEffect(() => {
    if (fin == null) return undefined;
    const id = setInterval(() => setAhora(Date.now()), 200);
    return () => clearInterval(id);
  }, [fin]);
  return fin == null ? null : Math.max(0, Math.ceil((fin - ahora) / 1000));
}

function BotonPortada({ onClick }) {
  return (
    <button type="button" className="cnp-salir" onClick={onClick}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>Portada</span>
    </button>
  );
}

function Vidas({ n, max = 3 }) {
  return (
    <span className="cnp-vidas" aria-label={`${n} vidas`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < n ? 'llena' : 'vacia'}>♥</span>
      ))}
    </span>
  );
}

// Marcador superior: jugadores con vidas y puntos, el del turno resaltado
function Marcador({ jugadores, turnoId, yoId }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.querySelector('.activo')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [turnoId]);
  return (
    <ol className="cnp-marcador" ref={ref} aria-label="Jugadores">
      {jugadores.map((j) => (
        <li
          key={j.id}
          className={`cnp-jugador${j.id === turnoId ? ' activo' : ''}${j.eliminado ? ' eliminado' : ''}`}
          style={{ '--c': colorJugador(j.id) }}
        >
          <span className="cnp-jugador-avatar">{inicial(j.nombre)}</span>
          <span className="cnp-jugador-datos">
            <span className="cnp-jugador-nombre">{j.nombre}{j.id === yoId ? ' (tú)' : ''}</span>
            <span className="cnp-jugador-linea">
              {j.eliminado ? <span className="cnp-eliminado">Eliminado</span> : <Vidas n={j.vidas} />}
              <strong>{j.puntos} pts</strong>
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function BarraTiempo({ segundos, total }) {
  if (segundos == null) return null;
  const pct = Math.max(0, Math.min(100, (segundos / total) * 100));
  const nivel = segundos <= 10 ? 'critico' : segundos <= 30 ? 'aviso' : '';
  return (
    <div className={`cnp-tiempo ${nivel}`} role="timer" aria-label={`${segundos} segundos`}>
      <div className="cnp-tiempo-barra"><span style={{ width: `${pct}%` }} /></div>
      <span className="cnp-tiempo-num"><Icon name="clock" size={15} /> {segundos}s</span>
    </div>
  );
}

// Grupos ya resueltos (barras de color)
function Resueltas({ resueltas }) {
  if (!resueltas.length) return null;
  return (
    <div className="cnp-resueltas">
      {resueltas.map((r, i) => (
        <div key={r.id} className="cnp-resuelta" style={{ '--gc': COLORES_GRUPO[i % 4] }}>
          <div className="cnp-resuelta-cab">
            <strong>{r.tema ?? 'Conexión encontrada'}</strong>
            <span>{r.nombre} · +{r.puntos}</span>
          </div>
          <p className="cnp-resuelta-items">{r.elementos.join(' · ')}</p>
        </div>
      ))}
    </div>
  );
}

// Aviso flotante con el último suceso de la ronda
function Aviso({ evento }) {
  const [visible, setVisible] = useState(null);
  const ultimo = useRef(evento?.n ?? 0);
  useEffect(() => {
    if (!evento || evento.n === ultimo.current) return undefined;
    ultimo.current = evento.n;
    setVisible(evento);
    const id = setTimeout(() => setVisible(null), 3800);
    return () => clearTimeout(id);
  }, [evento]);
  if (!visible) return null;
  const bueno = ['acierto', 'tema_ok', 'ultima_ok'].includes(visible.tipo);
  const malo = ['fallo', 'tiempo', 'ultima_ko', 'tema_ko'].includes(visible.tipo);
  return (
    <div className={`cnp-aviso${bueno ? ' bueno' : ''}${malo ? ' malo' : ''}`} role="status" aria-live="polite">
      <span aria-hidden="true">{bueno ? '🎉' : malo ? (visible.eliminado ? '💀' : '💔') : 'ℹ️'}</span>
      {visible.texto}
    </div>
  );
}

// Formulario para adivinar qué une a un grupo
function FormTema({ elementos, titulo, sub, onEnviar, onSaltar, textoSaltar = 'No lo sé', color }) {
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const enviar = async (e) => {
    e.preventDefault();
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    await onEnviar(texto.trim());
    setEnviando(false);
  };
  return (
    <form className="cnp-tarjeta cnp-tema" onSubmit={enviar}>
      <p className="cnp-etiqueta">{sub}</p>
      <h3 className="cnp-tema-titulo">{titulo}</h3>
      <div className="cnp-tema-items" style={{ '--gc': color }}>
        {elementos.map((el) => <span key={el}>{el}</span>)}
      </div>
      <label className="cnp-etiqueta" htmlFor="cnp-tema-input">¿Qué los une?</label>
      <input
        id="cnp-tema-input"
        className="cnp-input"
        type="text"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Escribe la conexión…"
        autoComplete="off"
        maxLength={120}
        autoFocus
      />
      <div className="cnp-fila-botones">
        {onSaltar && (
          <button type="button" className="cnp-boton secundario" onClick={onSaltar} disabled={enviando}>
            {textoSaltar}
          </button>
        )}
        <button type="submit" className="cnp-boton" disabled={!texto.trim() || enviando}>
          <Icon name="check" size={20} /> Comprobar
        </button>
      </div>
    </form>
  );
}

/**
 * - partida: vista del motor
 * - yoId: id del jugador en este dispositivo (online). null en local: juega quien tenga el turno.
 * - esAdmin: puede saltar turnos y terminar la ronda
 * - onAccion(tipo, datos) -> Promise<{ error? }>
 * - finRonda: contenido de botones al terminar la ronda
 */
export default function ConectaPartida({ partida, yoId = null, esAdmin, onAccion, onSalir, finRonda, local = false }) {
  const [seleccion, setSeleccion] = useState([]);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [confirmarFin, setConfirmarFin] = useState(false);

  const t = partida.turno;
  const claveTurno = t ? `${t.jugadorId}-${t.paso}` : 'fin';
  const segundos = useCuentaAtras(t?.restanteMs ?? null, claveTurno);
  const puedoJugar = Boolean(t) && (local || t.jugadorId === yoId);
  const yo = partida.jugadores.find((j) => j.id === yoId);

  // Al cambiar de turno o de paso se limpia la selección
  useEffect(() => { setSeleccion([]); setError(''); }, [claveTurno, partida.tablero.length]);

  const accion = async (tipo, datos) => {
    setEnviando(true);
    setError('');
    const r = await onAccion(tipo, datos);
    if (r?.error) setError(r.error);
    setEnviando(false);
    return r;
  };

  const tocar = (id) => {
    if (!puedoJugar || t.paso !== 'elegir') return;
    setSeleccion((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 4 ? [...s, id] : s));
  };

  const colorSiguiente = COLORES_GRUPO[Math.min(partida.resueltas.length, 3)];
  const esUltima = partida.fase === 'ultima';

  // ---------- Cabecera común ----------
  const cabecera = (
    <header className="cnp-hero">
      <div className="cnp-hero-top">
        <BotonPortada onClick={onSalir} />
        <div className="cnp-hero-chips">
          <span className="cnp-chip"><Icon name="flagFinish" size={14} /> Ronda {partida.ronda}</span>
          {partida.categoria && <span className="cnp-chip cnp-chip-cat">{partida.categoria}</span>}
        </div>
      </div>
      <Marcador jugadores={partida.jugadores} turnoId={t?.jugadorId} yoId={yoId} />
    </header>
  );

  const pieAdmin = (esAdmin || local) && partida.fase !== 'fin' && (
    <div className="cnp-admin">
      {!local && t && !puedoJugar && (
        <button type="button" className="cnp-enlace" onClick={() => accion('saltar-turno')}>
          <Icon name="forward" size={16} /> Saltar turno de {t.nombre}
        </button>
      )}
      <button type="button" className="cnp-enlace peligro" onClick={() => setConfirmarFin(true)}>
        <Icon name="flagFinish" size={16} /> Terminar ronda
      </button>
    </div>
  );

  const modalFin = confirmarFin && (
    <div className="rg-modal-fondo" onClick={() => setConfirmarFin(false)}>
      <div className="rg-modal cnp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cnp-modal-icono">🏁</div>
        <h3>¿Terminar la ronda?</h3>
        <p className="hint">Se mostrarán las soluciones y se guardarán las puntuaciones actuales.</p>
        <div className="cnp-fila-botones">
          <button type="button" className="cnp-boton secundario" onClick={() => setConfirmarFin(false)}>Seguir jugando</button>
          <button type="button" className="cnp-boton peligro" onClick={() => { setConfirmarFin(false); accion('finalizar-ronda'); }}>Terminar</button>
        </div>
      </div>
    </div>
  );

  // ---------- FIN DE RONDA ----------
  if (partida.fase === 'fin') {
    const ranking = [...partida.jugadores].sort((a, b) => b.puntos - a.puntos);
    const max = ranking[0]?.puntos ?? 0;
    const orden = partida.soluciones
      ? [...partida.soluciones].sort((a, b) => {
          const ia = partida.resueltas.findIndex((r) => r.id === a.id);
          const ib = partida.resueltas.findIndex((r) => r.id === b.id);
          return (ia === -1 ? 9 : ia) - (ib === -1 ? 9 : ib);
        })
      : [];
    const motivos = {
      resuelta: '¡Las 4 conexiones descubiertas!',
      fallos: 'Nadie ha adivinado la última conexión.',
      eliminados: 'Todos los jugadores han sido eliminados.',
      anfitrion: 'La ronda se ha terminado antes de tiempo.'
    };
    return (
      <section className="game cnp-escena">
        {cabecera}
        <Aviso evento={partida.evento} />
        <div className="cnp-tarjeta">
          <p className="cnp-etiqueta">Fin de la ronda {partida.ronda}</p>
          <h3 className="cnp-titulo">{motivos[partida.motivoFin] || 'Ronda terminada'}</h3>
          <div className="cnp-soluciones">
            {orden.map((g) => {
              const idx = partida.resueltas.findIndex((r) => r.id === g.id);
              return (
                <div key={g.id} className={`cnp-solucion${idx === -1 ? ' sin-resolver' : ''}`} style={{ '--gc': idx === -1 ? '#94a3b8' : COLORES_GRUPO[idx % 4] }}>
                  <div className="cnp-resuelta-cab">
                    <strong>{g.tema}</strong>
                    <span>{g.resueltoPor ? `${g.resueltoPor} · +${g.puntos}${g.temaAcertado ? ' ★' : ''}` : 'Sin resolver'}</span>
                  </div>
                  <p className="cnp-resuelta-items">{g.elementos.join(' · ')}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="cnp-tarjeta">
          <p className="cnp-etiqueta">Puntuaciones</p>
          <ol className="cnp-ranking">
            {ranking.map((j, i) => (
              <li key={j.id} className={max > 0 && j.puntos === max ? 'lider' : ''} style={{ '--c': colorJugador(j.id) }}>
                <span className="cnp-ranking-pos">{max > 0 && j.puntos === max ? <Icon name="crown" size={18} /> : i + 1}</span>
                <span className="cnp-jugador-avatar">{inicial(j.nombre)}</span>
                <span className="cnp-ranking-nombre">{j.nombre}{j.id === yoId ? ' (tú)' : ''}</span>
                <strong>{j.puntos} pts</strong>
              </li>
            ))}
          </ol>
        </div>

        <div className="cnp-barra estatica">{finRonda}</div>
      </section>
    );
  }

  // ---------- TURNO: PANTALLA «LISTO» ----------
  if (t && t.paso === 'listo' && (puedoJugar || local)) {
    const j = partida.jugadores.find((x) => x.id === t.jugadorId);
    return (
      <section className="game cnp-escena">
        {cabecera}
        <Aviso evento={partida.evento} />
        <div className="cnp-tarjeta cnp-listo">
          <span className="cnp-listo-avatar" style={{ '--c': colorJugador(t.jugadorId) }}>{inicial(t.nombre)}</span>
          <p className="cnp-etiqueta">{local ? 'Pasa el móvil a' : '¡Es tu turno!'}</p>
          <h2 className="cnp-listo-nombre">{t.nombre}</h2>
          {j && <Vidas n={j.vidas} />}
          <p className="cnp-texto">
            {esUltima
              ? <>Queda la <strong>última conexión</strong>: tendrás <strong>{partida.segundosTurno} s</strong> para adivinar qué une a los 4 elementos que quedan.</>
              : <>Tendrás <strong>{partida.segundosTurno} s</strong> para encontrar <strong>4 elementos</strong> que formen una conexión. Si fallas, pierdes una vida.</>}
          </p>
        </div>
        {error && <p className="error" style={{ margin: 0 }}>{error}</p>}
        <div className="cnp-barra">
          <button type="button" className="cnp-boton grande" disabled={enviando} onClick={() => accion('listo')}>
            <Icon name="play" size={22} /> ¡Listo!
          </button>
          {pieAdmin}
        </div>
        {modalFin}
      </section>
    );
  }

  // ---------- RESTO DE PASOS ----------
  const esperando = !puedoJugar;
  let banner = null;
  if (t && esperando) {
    const textos = {
      listo: `Esperando a que ${t.nombre} esté listo…`,
      elegir: `${t.nombre} está buscando una conexión…`,
      tema: `${t.nombre} está adivinando qué los une…`,
      adivinar: `${t.nombre} intenta adivinar la última conexión…`
    };
    banner = (
      <div className="cnp-turno-de" style={{ '--c': colorJugador(t.jugadorId) }}>
        <span className="cnp-jugador-avatar">{inicial(t.nombre)}</span>
        <div>
          <p className="cnp-etiqueta">Turno de {t.nombre}</p>
          <p className="cnp-turno-texto">{textos[t.paso]}</p>
        </div>
        {yo?.eliminado && <span className="cnp-eliminado">Estás eliminado</span>}
      </div>
    );
  }

  return (
    <section className={`game cnp-escena${puedoJugar && t?.paso === 'elegir' ? ' con-barra' : ''}`}>
      {cabecera}
      <Aviso evento={partida.evento} />

      {banner}
      {t && t.paso !== 'listo' && <BarraTiempo segundos={segundos} total={partida.segundosTurno} />}

      <Resueltas resueltas={partida.resueltas} />

      {/* Paso «tema»: adivinar qué une al grupo recién encontrado */}
      {t?.paso === 'tema' && t.grupo && (puedoJugar ? (
        <FormTema
          elementos={t.grupo.elementos}
          color={COLORES_GRUPO[(partida.resueltas.length - 1) % 4]}
          sub="¡Conexión correcta! Pregunta extra"
          titulo={`+1 punto si adivinas qué une a estos 4`}
          onEnviar={(texto) => accion('tema', { texto })}
          onSaltar={() => accion('tema', { texto: '' })}
        />
      ) : (
        <div className="cnp-tema-items solo" style={{ '--gc': COLORES_GRUPO[(partida.resueltas.length - 1) % 4] }}>
          {t.grupo.elementos.map((el) => <span key={el}>{el}</span>)}
        </div>
      ))}

      {/* Última conexión */}
      {esUltima && partida.ultimaPendiente && (
        puedoJugar && t?.paso === 'adivinar' ? (
          <FormTema
            elementos={partida.ultimaPendiente}
            color={COLORES_GRUPO[3]}
            sub="Última conexión"
            titulo="¿Qué une a los 4 elementos que quedan?"
            onEnviar={(texto) => accion('tema', { texto })}
            onSaltar={() => accion('tema', { texto: '' })}
            textoSaltar="Pasar"
          />
        ) : (
          <div className="cnp-tarjeta cnp-ultima">
            <p className="cnp-etiqueta">Última conexión · ¿qué los une?</p>
            <div className="cnp-tema-items" style={{ '--gc': COLORES_GRUPO[3] }}>
              {partida.ultimaPendiente.map((el) => <span key={el}>{el}</span>)}
            </div>
            {partida.intentosUltima.length > 0 && (
              <p className="hint small" style={{ margin: '0.6rem 0 0' }}>
                Ya lo han intentado: {partida.intentosUltima.map((id) => partida.jugadores.find((j) => j.id === id)?.nombre).filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        )
      )}

      {/* Tablero */}
      {!esUltima && partida.tablero.length > 0 && t?.paso !== 'tema' && (
        <div
          className={`cnp-tablero${puedoJugar && t?.paso === 'elegir' ? ' activo' : ' bloqueado'}`}
          style={{ '--sel': colorSiguiente }}
          lang="es"
        >
          {partida.tablero.map((p) => {
            const sel = seleccion.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                className={`cnp-pieza${sel ? ' sel' : ''}`}
                onClick={() => tocar(p.id)}
                disabled={!puedoJugar || t?.paso !== 'elegir' || enviando}
                aria-pressed={sel}
              >
                <span>{p.texto}</span>
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="error" style={{ margin: 0 }}>{error}</p>}

      <div className="cnp-barra">
        {puedoJugar && t?.paso === 'elegir' && (
          <div className="cnp-fila-botones">
            <button type="button" className="cnp-boton secundario" disabled={!seleccion.length || enviando} onClick={() => setSeleccion([])}>
              Borrar
            </button>
            <button
              type="button"
              className="cnp-boton"
              disabled={seleccion.length !== 4 || enviando}
              onClick={() => accion('confirmar', { ids: seleccion })}
            >
              <Icon name="check" size={20} /> Comprobar {seleccion.length}/4
            </button>
          </div>
        )}
        {pieAdmin}
      </div>
      {modalFin}
    </section>
  );
}
