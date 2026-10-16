import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { leerRecord, guardarRecord } from './records.js';
import Icon, { ICONO_CATEGORIA } from '../../components/Icon.jsx';

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

// categoria: nombre de la categoría, o null para mezclar todas
export default function Partida({ categoria, onCambiarCategoria }) {
  // fase: 'cargando' | 'jugando' | 'comprobando' | 'fin' | 'error'
  const [fase, setFase] = useState('cargando');
  const [actual, setActual] = useState(null);       // { id, sigla, categoria }
  const [respuesta, setRespuesta] = useState('');
  const [puntos, setPuntos] = useState(0);
  const [vistas, setVistas] = useState([]);         // ids ya mostradas en esta partida
  const [restante, setRestante] = useState(SEGUNDOS);
  const [ultima, setUltima] = useState(null);       // última respuesta acertada
  const [final, setFinal] = useState(null);         // { motivo, sigla, respuestaCorrecta, ganado }
  const [record, setRecord] = useState(() => leerRecord(categoria));
  const [partida, setPartida] = useState(0);        // cambia al repetir, para reiniciar
  const inputRef = useRef(null);
  const limite = useRef(0);                         // instante en que se acaba el tiempo

  const nombreCategoria = categoria ?? 'Todas las categorías';

  const terminar = useCallback((puntosFinales, datos) => {
    setFinal(datos);
    setFase('fin');
    setRecord((r) => {
      if (puntosFinales <= r) return r;
      guardarRecord(categoria, puntosFinales);
      return puntosFinales;
    });
  }, [categoria]);

  const mostrar = useCallback((data, excluidas) => {
    setActual(data);
    setVistas([...excluidas, data.id]);
    setRespuesta('');
    limite.current = Date.now() + SEGUNDOS * 1000;
    setRestante(SEGUNDOS);
    setFase('jugando');
  }, []);

  const cargarSiguiente = useCallback(async (excluir, puntosActuales) => {
    try {
      const data = await api(urlSiguiente(categoria, excluir));
      if (data.fin) return terminar(puntosActuales, { ganado: true });
      mostrar(data, excluir);
    } catch {
      setFase('error');
    }
  }, [categoria, terminar, mostrar]);

  // Nueva partida (al entrar y al pulsar "Jugar otra vez")
  useEffect(() => {
    let cancelado = false;
    setPuntos(0);
    setUltima(null);
    setFinal(null);
    setFase('cargando');
    api(urlSiguiente(categoria, []))
      .then((data) => {
        if (cancelado) return;
        if (data.fin) return terminar(0, { ganado: true });
        mostrar(data, []);
      })
      .catch(() => !cancelado && setFase('error'));
    return () => { cancelado = true; };
  }, [partida, categoria, terminar, mostrar]);

  // Enviar una respuesta (vacía = tiempo agotado)
  const enviar = useCallback(async (texto, motivoFallo) => {
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
  }, [actual, puntos, vistas, cargarSiguiente, terminar]);

  // Cuenta atrás
  useEffect(() => {
    if (fase !== 'jugando') return;
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

  // Foco automático en el input en cada sigla
  useEffect(() => {
    if (fase === 'jugando') inputRef.current?.focus();
  }, [fase, actual]);

  function onSubmit(e) {
    e.preventDefault();
    if (fase !== 'jugando' || !respuesta.trim()) return;
    enviar(respuesta, 'fallo');
  }

  if (fase === 'error') {
    return (
      <section className="game">
        <h1 className="title">{nombreCategoria}</h1>
        <p className="error">No se pudo conectar con el servidor. ¿Está arrancado?</p>
        <div className="row">
          <button onClick={() => setPartida((p) => p + 1)}><Icon name="refresh" size={20} />Reintentar</button>
          <button className="secondary" onClick={onCambiarCategoria}>Cambiar categoría</button>
        </div>
      </section>
    );
  }

  if (fase === 'fin') {
    return (
      <section className="game">
        <div className="end-card">
          <span className="end-icon"><Icon name={final.ganado ? 'crown' : 'flagFinish'} size={44} /></span>
          <p className="categoria"><Icon name={ICONO_CATEGORIA[nombreCategoria] ?? 'star'} size={16} />{nombreCategoria}</p>
          <h1 className="title">{final.ganado ? '¡Te las sabes todas!' : 'Fin de la partida'}</h1>
          <p className="final-score">
            <span className="final-number">{puntos}</span>
            <span> {puntos === 1 ? 'punto' : 'puntos'}</span>
          </p>
          <p className="record"><Icon name="trophy" size={18} />Tu mejor puntuación: <strong>{record}</strong></p>
          {!final.ganado && (
            <p className="reveal">
              {final.motivo === 'tiempo' ? 'Se acabó el tiempo. ' : 'Fallaste. '}
              <strong>{final.sigla}</strong> significa <strong>{final.respuestaCorrecta}</strong>.
            </p>
          )}
        </div>
        <div className="actions">
          <button onClick={() => setPartida((p) => p + 1)}><Icon name="refresh" size={20} />Jugar otra vez</button>
          <button className="secondary" onClick={onCambiarCategoria}>Cambiar categoría</button>
          <Link to="/" className="button secondary">Volver al menú</Link>
        </div>
      </section>
    );
  }

  const cargando = fase === 'cargando' || !actual;
  const porcentaje = Math.max(0, (restante / SEGUNDOS) * 100);

  return (
    <section className="game">
      <div className="hud">
        <span className="chip"><Icon name="star" size={18} />Puntos: <strong>{puntos}</strong></span>
        <span className="chip alt"><Icon name="trophy" size={18} />Récord: <strong>{record}</strong></span>
      </div>

      {cargando ? (
        <p className="loading">Cargando…</p>
      ) : (
        <>
          <div className="sigla-card">
            <p className="categoria"><Icon name={ICONO_CATEGORIA[actual.categoria] ?? 'star'} size={16} />{actual.categoria}</p>
            <p className="sigla" aria-label={`Sigla: ${actual.sigla}`}>{actual.sigla}</p>
          </div>

          <div className="timer" role="timer" aria-label="Tiempo restante">
            <div
              className={`timer-bar${restante <= 5 ? ' low' : ''}`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>
          <p className="timer-text"><Icon name="clock" size={16} />{Math.ceil(restante)} s</p>

          <form onSubmit={onSubmit} className="row">
            <input
              ref={inputRef}
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              placeholder="¿Qué significa?"
              aria-label="Tu respuesta"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              disabled={fase !== 'jugando'}
            />
            <button type="submit" disabled={fase !== 'jugando'}><Icon name="check" size={20} strokeWidth={2.500} />Responder</button>
          </form>

          {ultima && (
            <p className="previa">
              Antes: <strong>{ultima.sigla}</strong> = {ultima.respuesta}
            </p>
          )}
        </>
      )}
    </section>
  );
}
