// client/src/games/Pulsador/PulsadorLocal.jsx
// Un solo dispositivo: el móvil queda en medio de la mesa con un único pulsador; quien pulsa dice quién es y responde.
// Mismo motor que el online; las rondas se piden al servidor.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { PantallaJuego, PantallaResultado, PantallaFin, ModalSalir, TurnoDe } from './Vistas.jsx';
import ConfigJuego from './Config.jsx';
import { urlLocal } from './juegos.js';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';
import { limitesLocal } from '../limites.js';

export default function PulsadorLocal({ juego, onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const lim = limitesLocal(juego.id);
  const [nombres, setNombres] = useState(() => Array(lim.min).fill(''));
  const [config, setConfig] = useState(juego.config);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [modal, setModal] = useState(false);
  const estRef = useRef(null);
  const [, setVer] = useState(0);
  const avisoTimer = useRef(null);
  const refrescar = () => setVer((x) => x + 1);
  // Pantalla de turno antes de responder (juegos con `pantallaTurno`): mientras se ve, el reloj de respuesta espera
  const [listo, setListo] = useState(null);
  const listoRef = useRef(null);
  listoRef.current = listo;
  const claveTurno = (est) => (est?.fase === 'jugando' && est.pulsado?.jugadorId != null ? `${est.ronda}-${est.pulsado.jugadorId}-${est.bloqueados.length}` : null);
  const enPantallaTurno = (est) => Boolean(juego.pantallaTurno && claveTurno(est) && listoRef.current !== claveTurno(est));

  useEffect(() => {
    if (paso !== 'juego') return undefined;
    const i = setInterval(() => {
      const est = estRef.current;
      if (!est) return;
      if (enPantallaTurno(est)) est.pulsado.hasta = Date.now() + est.reglas.segRespuesta * 1000;
      E.tick(est, Date.now());
      refrescar();
    }, 200);
    return () => clearInterval(i);
  }, [paso]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(avisoTimer.current), []);

  const empezar = async () => {
    const limpios = nombres.map((n) => n.trim());
    if (limpios.some((n) => !n)) return setError('Todos los jugadores necesitan un nombre.');
    if (new Set(limpios.map((n) => n.toLowerCase())).size !== limpios.length) return setError('Hay nombres repetidos.');
    setError(''); setCargando(true);
    try {
      const r = await fetch(urlLocal(juego, config));
      const d = await r.json();
      if (!r.ok || !d.success || !d.items?.length) throw new Error(d.error);
      estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), d.items, d.reglas, Date.now());
      setPaso('juego');
    } catch (e) {
      setError(e?.message || 'No se ha podido preparar la partida. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
    return undefined;
  };

  if (paso === 'config') {
    return (
      <div className={`pzp-contenedor ${juego.id}`}>
        <SelectorJugadores
          onVolver={onVolver} onAyuda={onAbrirAyuda} min={lim.min} max={lim.max}
          numJugadores={nombres.length}
          onCambiarNum={(n) => setNombres((l) => (n > l.length ? [...l, ...Array(n - l.length).fill('')] : l.slice(0, n)))}
          nombres={nombres}
          onNombre={(i, valor) => setNombres((l) => l.map((x, k) => (k === i ? valor : x)))}
          onEmpezar={empezar} textoBoton={cargando ? 'Preparando…' : '¡Empezar partida!'} error={error}
        >
          <ConfigJuego juego={juego} config={config} onCambiar={(c) => setConfig((x) => ({ ...x, ...c }))} />
        </SelectorJugadores>
      </div>
    );
  }

  const est = estRef.current;
  const ahora = Date.now();
  const v = { ...E.vistaDe(est, -1, ahora), yo: null };
  const mostrar = (t) => { setAviso(t); clearTimeout(avisoTimer.current); avisoTimer.current = setTimeout(() => setAviso(null), 3000); };
  const enviar = (tipo, d = {}) => {
    const t = Date.now();
    let r;
    if (tipo === 'pulsar') {
      r = E.pulsar(est, null, t);
      // Jugando solo no hace falta decir quién ha pulsado
      if (r?.ok && est.jugadores.length === 1) r = E.identificar(est, est.jugadores[0].id);
    }
    else if (tipo === 'identificar') r = E.identificar(est, d.id);
    else if (tipo === 'cancelar') r = E.cancelar(est, t);
    else if (tipo === 'responder') r = E.responder(est, null, d.respuesta, t);
    else if (tipo === 'pista') r = E.adelantarPista(est, t);
    else if (tipo === 'rendirse') r = E.rendirse(est, t);
    else if (tipo === 'terminar') r = E.terminar(est);
    else if (tipo === 'siguiente') r = E.siguiente(est, t);
    if (r && !r.ok) mostrar(r.error);
    refrescar();
  };
  const onSalir = () => setModal(true);

  let contenido;
  if (est.fase === 'fin') {
    contenido = (
      <PantallaFin v={v} juego={juego} onSalir={onSalir}>
        <div className="pzp-barra estatica">
          <button type="button" className="pzp-boton grande" onClick={() => setPaso('config')}><Icon name="refresh" size={20} /> Nueva partida</button>
          <button type="button" className="pzp-boton secundario" onClick={() => onExit?.()}><Icon name="door" size={18} /> Salir a la portada</button>
        </div>
      </PantallaFin>
    );
  } else if (est.fase === 'resuelta') {
    contenido = (
      <PantallaResultado v={v} juego={juego} onSalir={onSalir}>
        <div className="pzp-barra estatica">
          <button type="button" className="pzp-boton grande" onClick={() => enviar('siguiente')}><Icon name="play" size={20} /> {v.ronda >= v.rondas ? 'Ver resultado final' : 'Siguiente ronda'}</button>
          {v.ronda < v.rondas && <button type="button" className="pzp-enlace" onClick={() => enviar('terminar')}><Icon name="flagFinish" size={15} /> Terminar la partida ya</button>}
        </div>
      </PantallaResultado>
    );
  } else if (enPantallaTurno(est)) {
    const id = est.pulsado.jugadorId;
    const nombre = v.jugadores.find((j) => j.id === id)?.nombre;
    contenido = (
      <TurnoDe juego={juego} onSalir={() => setModal(true)} v={v} id={id} puedo boton={`Soy ${nombre}: ¡a responder!`}
        onListo={() => { est.pulsado.hasta = Date.now() + est.reglas.segRespuesta * 1000; setListo(claveTurno(est)); }}
        texto={`Ha pulsado ${nombre}. Pásale el móvil para que responda: el reloj no corre hasta que pulse el botón.`} />
    );
  } else {
    contenido = <PantallaJuego key={v.ronda} v={v} juego={juego} t0={ahora} enviar={enviar} onSalir={onSalir} local controles />;
  }
  return (
    <div className={`pzp-contenedor ${juego.id} qq-en-partida`}>
      {aviso && <p className="pzp-toast" role="alert" onClick={() => setAviso(null)}>{aviso}</p>}
      <section className="game pzp-escena">{contenido}</section>
      {modal && (
        <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso y volverás a la portada."
          onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />
      )}
    </div>
  );
}
