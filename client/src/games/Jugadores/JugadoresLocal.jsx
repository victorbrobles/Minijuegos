// client/src/games/Jugadores/JugadoresLocal.jsx
// Modo «un único dispositivo»: el móvil queda en la mesa. Quien lo sepa pulsa, se elige quién ha sido y escribe
// el nombre; si no está en la lista, decide el grupo. Mismo motor que el online; las parejas se piden al servidor.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { PantallaRonda, PantallaResultado, PantallaFin, Pulsador, FormRespuesta, Revision, ModalSalir, SelectorRondas, Avatar } from './Vistas.jsx';
import { SelectorJugadores, BloqueConfig } from '../../components/MenuJuego.jsx';
import './Jugadores.css';
import { limitesLocal } from '../limites.js';

const LIM_JUG = limitesLocal('jugadores');

const barajar = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

export default function JugadoresLocal({ onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(() => Array(LIM_JUG.min).fill(''));
  const [rondas, setRondas] = useState(10);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [modal, setModal] = useState(false);
  const [eligiendo, setEligiendo] = useState(false);
  const estRef = useRef(null);
  const [, setVer] = useState(0);
  const avisoTimer = useRef(null);
  const refrescar = () => setVer((x) => x + 1);

  useEffect(() => {
    if (paso !== 'juego') return undefined;
    const i = setInterval(() => { if (estRef.current && E.tick(estRef.current, Date.now())) refrescar(); else refrescar(); }, 250);
    return () => clearInterval(i);
  }, [paso]);
  useEffect(() => () => clearTimeout(avisoTimer.current), []);

  const mostrar = (texto, tipo = '') => { setAviso({ texto, tipo }); clearTimeout(avisoTimer.current); avisoTimer.current = setTimeout(() => setAviso(null), 3000); };

  const empezar = async () => {
    const limpios = nombres.map((n) => n.trim());
    if (limpios.some((n) => !n)) return setError('Todos los jugadores necesitan un nombre.');
    if (new Set(limpios.map((n) => n.toLowerCase())).size !== limpios.length) return setError('Hay nombres repetidos.');
    setError(''); setCargando(true);
    try {
      const r = await fetch(`/api/jugadores/retos?n=${rondas}`);
      const d = await r.json();
      if (!d.success) throw new Error();
      estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), d.retos, Date.now());
      setEligiendo(false);
      setPaso('juego');
    } catch {
      setError('No se han podido cargar las parejas. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
    return undefined;
  };

  if (paso === 'config') {
    return (
      <div className="cqp-contenedor">
        <SelectorJugadores
          onVolver={onVolver} onAyuda={onAbrirAyuda} min={LIM_JUG.min} max={LIM_JUG.max}
          numJugadores={nombres.length}
          onCambiarNum={(n) => setNombres((l) => (n > l.length ? [...l, ...Array(n - l.length).fill('')] : l.slice(0, n)))}
          nombres={nombres}
          onNombre={(i, valor) => setNombres((l) => l.map((x, k) => (k === i ? valor : x)))}
          onEmpezar={empezar} textoBoton={cargando ? 'Cargando…' : '¡Empezar partida!'} error={error}
        >
          <BloqueConfig titulo="Número de parejas">
            <SelectorRondas valor={rondas} onCambiar={setRondas} />
          </BloqueConfig>
        </SelectorJugadores>
      </div>
    );
  }

  const est = estRef.current;
  const v = { ...E.vistaDe(est, -1), yo: null };
  const onSalir = () => setModal(true);
  const hacer = (fn) => { const r = fn(); if (r && !r.ok) mostrar(r.error, 'mal'); refrescar(); return r; };

  let contenido;
  if (est.fase === 'fin') {
    contenido = (
      <PantallaFin v={v} onSalir={onSalir}>
        <div className="cqp-barra estatica">
          <button type="button" className="cqp-boton grande" onClick={() => setPaso('config')}><Icon name="refresh" size={20} /> Nueva partida</button>
          <button type="button" className="cqp-boton secundario" onClick={() => onExit?.()}><Icon name="door" size={18} /> Salir a la portada</button>
        </div>
      </PantallaFin>
    );
  } else if (est.fase === 'resuelta') {
    contenido = (
      <PantallaResultado v={v} onSalir={onSalir}>
        <div className="cqp-barra estatica">
          <button type="button" className="cqp-boton grande" onClick={() => hacer(() => E.siguiente(est, Date.now()))}>
            <Icon name="play" size={20} /> {v.ronda >= v.rondas ? 'Ver resultado final' : 'Siguiente pareja'}
          </button>
          {v.ronda < v.rondas && <button type="button" className="cqp-enlace" onClick={() => hacer(() => E.terminar(est))}><Icon name="flagFinish" size={15} /> Terminar la partida ya</button>}
        </div>
      </PantallaResultado>
    );
  } else {
    const p = v.pulsado;
    const quien = v.jugadores.find((j) => j.id === p?.jugadorId);
    const libres = v.jugadores.filter((j) => !j.fuera && !v.bloqueados.includes(j.id));
    let controles;
    if (v.revision) {
      controles = <Revision v={v} puedeJuzgar juez="el grupo" onJuzgar={(vale) => hacer(() => E.juzgar(est, vale, Date.now()))} />;
    } else if (p) {
      controles = (
        <FormRespuesta key={p.hasta} v={v} nombre={quien?.nombre}
          onEnviar={(t) => {
            hacer(() => E.responder(est, p.jugadorId, t, Date.now()));
          }}
          onCancelar={() => hacer(() => E.cancelarPulsado(est, Date.now()))} />
      );
    } else if (eligiendo) {
      controles = (
        <div className="cqp-tarjeta">
          <p className="cqp-etiqueta">¿Quién ha pulsado?</p>
          <div className="cqp-quien">
            {libres.map((j) => (
              <button key={j.id} type="button" className="cqp-quien-btn" onClick={() => { setEligiendo(false); hacer(() => E.pulsar(est, j.id, Date.now())); }}>
                <Avatar id={j.id} nombre={j.nombre} /> {j.nombre}
              </button>
            ))}
          </div>
          <button type="button" className="cqp-enlace oscuro" onClick={() => { setEligiendo(false); hacer(() => E.seguir(est, Date.now())); }}>Ha sido sin querer: seguir</button>
        </div>
      );
    } else {
      controles = (
        <>
          <Pulsador deshabilitado={!libres.length} onPulsar={() => { hacer(() => E.pausa(est, Date.now())); setEligiendo(true); }} />
          <div className="cqp-barra estatica">
            <button type="button" className="cqp-enlace" onClick={() => hacer(() => E.rendirse(est))}><Icon name="flagFinish" size={15} /> Nadie lo sabe: ver respuestas</button>
          </div>
        </>
      );
    }
    contenido = (
      <PantallaRonda v={v} onSalir={onSalir} mio={Boolean(p)}
        etiqueta={v.revision ? 'Decidís vosotros' : p ? `${quien?.nombre} ha pulsado` : `Pareja ${v.ronda} de ${v.rondas}`}
        titulo={p ? `¡Escríbelo, ${quien?.nombre}!` : '¿Con quién han jugado los dos?'}>
        {controles}
      </PantallaRonda>
    );
  }

  return (
    <div className="cqp-contenedor qq-en-partida">
      {aviso && <p className="cqp-toast" role="alert" onClick={() => setAviso(null)}>{aviso.texto}</p>}
      <section className="game cqp-escena">{contenido}</section>
      {modal && (
        <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso y volverás a la portada."
          onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />
      )}
    </div>
  );
}
