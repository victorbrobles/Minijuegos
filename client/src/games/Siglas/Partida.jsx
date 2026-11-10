// client/src/games/Siglas/Partida.jsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { leerRecord, guardarRecord } from './records.js';
import Icon, { ICONO_CATEGORIA } from '../../components/Icon.jsx';
import './Siglas.css';

const SEGUNDOS = 20;

async function api(url, opciones) {
  const res = await fetch(url, opciones);
  if (!res.ok) throw new Error('error');
  return res.json();
}

function urlSiguiente(categoria, excluir) {
  const p = new URLSearchParams();
  if (categoria) p.set('categoria', categoria);
  if (excluir.length) p.set('excluir', excluir.join(','));
  const q = p.toString();
  return `/api/siglas/siguiente${q ? `?${q}` : ''}`;
}

function Aviso({ evento }) {
  const [visible, setVisible] = useState(null);
  const ultimo = useRef(evento?.n ?? 0);

  useEffect(() => {
    if (!evento || evento.n === ultimo.current) return undefined;
    ultimo.current = evento.n;
    setVisible(evento);
    const id = setTimeout(() => setVisible(null), 2600);
    return () => clearTimeout(id);
  }, [evento]);

  if (!visible) return null;

  return (
    <div className="cnp-aviso bueno" role="status" aria-live="polite">
      <span aria-hidden="true">🎉</span>
      {visible.texto}
    </div>
  );
}

export default function Partida({
  categoria,
  onCambiarCategoria,
  onSalirPortada,
  onAyuda
}) {
  const navigate = useNavigate();

  // fase: 'cargando' | 'jugando' | 'comprobando' | 'fin' | 'error'
  const [fase, setFase] = useState('cargando');
  const [actual, setActual] = useState(null); // { id, sigla, categoria }
  const [respuesta, setRespuesta] = useState('');
  const [puntos, setPuntos] = useState(0);
  const [vistas, setVistas] = useState([]);
  const [restante, setRestante] = useState(SEGUNDOS);
  const [ultima, setUltima] = useState(null);
  const [final, setFinal] = useState(null);
  const [record, setRecord] = useState(() => leerRecord(categoria));
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [partida, setPartida] = useState(0);
  const [modalSalirPortada, setModalSalirPortada] = useState(false);

  const [eventoAviso, setEventoAviso] = useState(null);
  const avisoSeqRef = useRef(0);

  const inputRef = useRef(null);
  const limite = useRef(0);

  const nombreCategoria = categoria ?? 'Todas las categorías';
  const iconoCat = ICONO_CATEGORIA?.[actual?.categoria || nombreCategoria] ?? 'star';

  const salirAPortada = () => {
    setModalSalirPortada(false);
    if (typeof onSalirPortada === 'function') {
      onSalirPortada();
    } else {
      try {
        navigate('/');
      } catch {
        window.location.href = '/';
      }
    }
  };

  const terminar = useCallback(
    (puntosFinales, datos) => {
      setFinal(datos);
      setFase('fin');
      setRecord((r) => {
        if (puntosFinales <= r) {
          setNuevoRecord(false);
          return r;
        }
        guardarRecord(categoria, puntosFinales);
        setNuevoRecord(true);
        return puntosFinales;
      });
    },
    [categoria]
  );

  const mostrar = useCallback((data, excluidas) => {
    setActual(data);
    setVistas([...excluidas, data.id]);
    setRespuesta('');
    limite.current = Date.now() + SEGUNDOS * 1000;
    setRestante(SEGUNDOS);
    setFase('jugando');
  }, []);

  const cargarSiguiente = useCallback(
    async (excluir, puntosActuales) => {
      try {
        const data = await api(urlSiguiente(categoria, excluir));
        if (data.fin) return terminar(puntosActuales, { ganado: true });
        mostrar(data, excluir);
      } catch {
        setFase('error');
      }
    },
    [categoria, terminar, mostrar]
  );

  useEffect(() => {
    let cancelado = false;
    setPuntos(0);
    setUltima(null);
    setFinal(null);
    setNuevoRecord(false);
    setFase('cargando');
    api(urlSiguiente(categoria, []))
      .then((data) => {
        if (cancelado) return;
        if (data.fin) return terminar(0, { ganado: true });
        mostrar(data, []);
      })
      .catch(() => !cancelado && setFase('error'));
    return () => {
      cancelado = true;
    };
  }, [partida, categoria, terminar, mostrar]);

  const enviar = useCallback(
    async (texto, motivoFallo) => {
      setFase('comprobando');
      try {
        const r = await api('/api/siglas/comprobar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: actual.id, respuesta: texto })
        });
        if (r.correcta) {
          const nuevos = puntos + 1;
          setPuntos(nuevos);
          setUltima({ sigla: actual.sigla, respuesta: r.respuestaCorrecta });
          avisoSeqRef.current += 1;
          setEventoAviso({
            n: avisoSeqRef.current,
            texto: `¡Correcto! ${actual.sigla} = «${r.respuestaCorrecta}» (+1 pt)`
          });
          await cargarSiguiente(vistas, nuevos);
        } else {
          terminar(puntos, {
            motivo: motivoFallo,
            sigla: actual.sigla,
            respuestaCorrecta: r.respuestaCorrecta
          });
        }
      } catch {
        setFase('error');
      }
    },
    [actual, puntos, vistas, cargarSiguiente, terminar]
  );

  useEffect(() => {
    if (fase !== 'jugando') return undefined;
    const t = setInterval(() => {
      const ms = limite.current - Date.now();
      if (ms <= 0) {
        clearInterval(t);
        setRestante(0);
        enviar('', 'tiempo');
      } else {
        setRestante(ms / 1000);
      }
    }, 100);
    return () => clearInterval(t);
  }, [fase, enviar]);

  useEffect(() => {
    if (fase === 'jugando') inputRef.current?.focus();
  }, [fase, actual]);

  function onSubmit(e) {
    e.preventDefault();
    if (fase !== 'jugando' || !respuesta.trim()) return;
    enviar(respuesta, 'fallo');
  }

  /* 1. PANTALLA DE ERROR */
  if (fase === 'error') {
    return (
      <section className="game qqp-escena">
        <div className="panel center qq-menu-panel">
          <div className="qq-hero-icono">
            <Icon name="zap" size={40} />
          </div>
          <h2 className="title qq-main-title">{nombreCategoria}</h2>
          <p className="error" style={{ margin: '0.8rem 0' }}>
            No se pudo conectar con el servidor. ¿Está arrancado?
          </p>
          <div className="qqp-barra" style={{ position: 'static', padding: 0 }}>
            <button
              type="button"
              className="qqp-boton"
              onClick={() => setPartida((p) => p + 1)}
            >
              <Icon name="refresh" size={20} /> Reintentar
            </button>
            <button
              type="button"
              className="qqp-enlace"
              style={{ color: '#475569' }}
              onClick={onCambiarCategoria}
            >
              Cambiar categoría
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* 2. PANTALLA DE FIN DE PARTIDA */
  if (fase === 'fin' && final) {
    return (
      <section className="game qqp-escena">
        <header className="qqp-hero">
          <span className="qqp-hero-deco" aria-hidden="true">
            <Icon name={final.ganado ? 'crown' : 'trophy'} size={150} strokeWidth={1.4} />
          </span>

          <div className="qqp-hero-top">
            <button type="button" className="qqp-salir" onClick={salirAPortada}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Portada</span>
            </button>

            <div className="qqp-hero-chips">
              <span className="qqp-chip">
                <Icon name={ICONO_CATEGORIA?.[nombreCategoria] ?? 'star'} size={14} />{' '}
                <span>{nombreCategoria}</span>
              </span>
            </div>
          </div>

          <div className="qqp-hero-cuerpo">
            <span
              className="qqp-avatar"
              style={{ '--c': final.ganado ? '#f59e0b' : '#ef4444' }}
            >
              {final.ganado ? '👑' : '🏁'}
            </span>
            <div className="qqp-hero-textos">
              <p className="qqp-hero-etiqueta">
                {final.ganado
                  ? '¡Categoría completada!'
                  : final.motivo === 'tiempo'
                  ? '¡Se agotó el tiempo!'
                  : 'Partida terminada'}
              </p>
              <h2 className="qqp-hero-titulo">
                {final.ganado ? '¡Te las sabes todas!' : 'Fin de la racha'}
              </h2>
            </div>
          </div>

          {!final.ganado && final.sigla && (
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono">
                <Icon name="eye" size={16} />
              </span>
              <span>
                <strong>{final.sigla}</strong> significa{' '}
                <strong>«{final.respuestaCorrecta}»</strong>
              </span>
            </div>
          )}
        </header>

        <div className="qqp-tarjeta qqp-pasar">
          {nuevoRecord && puntos > 0 && (
            <span className="siglas-nuevo-record-badge">🔥 ¡Nuevo récord personal!</span>
          )}
          <p className="qqp-pasar-para">Puntuación conseguida</p>
          <h3 className="qqp-pasar-nombre siglas-puntos-gigante">
            {puntos} {puntos === 1 ? 'punto' : 'puntos'}
          </h3>

          <div className="siglas-record-resumen">
            <Icon name="trophy" size={18} />
            <span>
              Mejor marca en {nombreCategoria}: <strong>{record} pts</strong>
            </span>
          </div>
        </div>

        <div className="qqp-barra">
          <button
            type="button"
            className="qqp-boton"
            onClick={() => setPartida((p) => p + 1)}
          >
            <Icon name="refresh" size={20} /> Jugar otra vez
          </button>
          <button type="button" className="qqp-enlace" onClick={onCambiarCategoria}>
            <Icon name="star" size={16} /> Cambiar de categoría
          </button>
          <button type="button" className="qqp-enlace" onClick={salirAPortada}>
            Salir a la portada principal
          </button>
        </div>
      </section>
    );
  }

  /* 3. EN JUEGO */
  const cargando = fase === 'cargando' || !actual;
  const porcentaje = Math.max(0, (restante / SEGUNDOS) * 100);
  const SegundosRedondeados = Math.ceil(restante);

  return (
    <section className="game qqp-escena">
      <Aviso evento={eventoAviso} />

      <header className="qqp-hero">
        <span className="qqp-hero-deco" aria-hidden="true">
          <Icon name="zap" size={150} strokeWidth={1.4} />
        </span>

        <div className="qqp-hero-top">
          <button type="button" className="qqp-salir" onClick={onCambiarCategoria}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Categorías</span>
          </button>

          <div className="qqp-hero-chips">
            <span className="qqp-chip">
              <Icon name={iconoCat} size={14} />{' '}
              <span>{actual?.categoria || nombreCategoria}</span>
            </span>
            {onAyuda && (
              <button
                type="button"
                className="qqp-ayuda"
                onClick={onAyuda}
                title="Cómo jugar"
                aria-label="Cómo jugar"
              >
                ?
              </button>
            )}
          </div>
        </div>

        <div className="qqp-identidad siglas-consigna-box" style={{ marginTop: '0.2rem' }}>
          <div className="siglas-hero-stats">
            <span className="siglas-hero-stat ok">
              ⭐ Puntos: <strong>{puntos}</strong>
            </span>
            <span className="siglas-hero-stat">
              🏆 Récord: <strong>{record}</strong>
            </span>
            <span className={`siglas-hero-stat timer${restante <= 5 ? ' low' : ''}`}>
              <Icon name="clock" size={14} /> {SegundosRedondeados}s
            </span>
          </div>

          <div className="siglas-timer-track" role="timer" aria-label="Tiempo restante">
            <div
              className={`siglas-timer-fill${restante <= 5 ? ' low' : ''}`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>
      </header>

      {cargando ? (
        <div className="qqp-tarjeta qqp-pasar">
          <span className="qqp-spinner" aria-hidden="true" />
          <p className="qqp-texto" style={{ marginTop: '0.75rem' }}>
            Cargando sigla…
          </p>
        </div>
      ) : (
        <div className="qqp-tarjeta">
          <div className="siglas-display-box">
            <span className="siglas-cat-pill">
              <Icon name={iconoCat} size={14} /> {actual.categoria}
            </span>
            <h2 className="siglas-acronimo-gigante" aria-label={`Sigla: ${actual.sigla}`}>
              {actual.sigla}
            </h2>
            <p className="siglas-sub-instruccion">
              Escribe el significado completo de esta sigla antes de que se agote el tiempo
            </p>
          </div>

          <form onSubmit={onSubmit} className="siglas-form-respuesta">
            <label className="qq-label-destacado" htmlFor="siglas-input-resp">
              ¿Qué significa «{actual.sigla}»?
            </label>
            <div className="siglas-form-row">
              <input
                id="siglas-input-resp"
                ref={inputRef}
                type="text"
                className="qq-input-moderno"
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                placeholder="Escribe su significado…"
                aria-label="Tu respuesta"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                disabled={fase !== 'jugando'}
              />
              <button
                type="submit"
                className="siglas-btn-responder"
                disabled={fase !== 'jugando' || !respuesta.trim()}
              >
                <Icon name="check" size={18} strokeWidth={2.5} /> Responder
              </button>
            </div>
          </form>

          {ultima && (
            <div className="siglas-previa-banner">
              <span>✅ Anterior acertada:</span>
              <strong>{ultima.sigla}</strong> = «{ultima.respuesta}»
            </div>
          )}
        </div>
      )}

      <div className="qqp-barra">
        <button
          type="button"
          className="qqp-enlace"
          onClick={() => setModalSalirPortada(true)}
        >
          Salir a la portada principal
        </button>
      </div>

      {/* MODAL SALIR A PORTADA */}
      {modalSalirPortada && (
        <div className="rg-modal-fondo" onClick={() => setModalSalirPortada(false)}>
          <div
            className="rg-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🚪</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>
              ¿Salir a la portada?
            </h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              Perderás la racha actual y volverás a la portada principal de juegos. ¿Estás seguro?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button
                type="button"
                className="secondary full"
                onClick={() => setModalSalirPortada(false)}
              >
                No, continuar
              </button>
              <button
                type="button"
                className="secondary danger full"
                style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }}
                onClick={salirAPortada}
              >
                Sí, salir a portada
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}