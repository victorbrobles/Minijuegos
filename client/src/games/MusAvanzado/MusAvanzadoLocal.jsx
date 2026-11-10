// client/src/games/MusAvanzado/MusAvanzadoLocal.jsx
// Un solo dispositivo: el pacto se hace en común y el móvil pasa de mano en mano para cambiar cartas y apostar.
import React, { useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { Partida, Fin, Config } from './Partida.jsx';
import { ModalSalir, TurnoDe } from '../Pulsador/Vistas.jsx';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';

export default function MusAvanzadoLocal({ juego, onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(['', '', '', '']);
  const [config, setConfig] = useState({ modo: 'individual', fichas: 20 });
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState(null);
  const [modal, setModal] = useState(false);
  const [confirmado, setConfirmado] = useState(null);
  const estRef = useRef(null);
  const [, setVer] = useState(0);
  const refrescar = () => setVer((x) => x + 1);

  const empezar = () => {
    const limpios = nombres.map((n) => n.trim());
    if (limpios.some((n) => !n)) return setError('Todos los jugadores necesitan un nombre.');
    if (new Set(limpios.map((n) => n.toLowerCase())).size !== limpios.length) return setError('Hay nombres repetidos.');
    try {
      estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), { ...config, sinReloj: true }, Date.now());
    } catch (e) {
      return setError(e.message);
    }
    setError('');
    setConfirmado(null);
    setPaso('juego');
    return undefined;
  };

  if (paso === 'config') {
    return (
      <div className={`pzp-contenedor ${juego.id}`}>
        <SelectorJugadores
          onVolver={onVolver} onAyuda={onAbrirAyuda} min={E.AJUSTES.min} max={E.AJUSTES.max}
          numJugadores={nombres.length}
          onCambiarNum={(n) => setNombres((l) => (n > l.length ? [...l, ...Array(n - l.length).fill('')] : l.slice(0, n)))}
          nombres={nombres}
          onNombre={(i, valor) => setNombres((l) => l.map((x, k) => (k === i ? valor : x)))}
          onEmpezar={empezar} textoBoton="¡A la mesa!" error={error}
        >
          <Config config={config} onCambiar={(c) => setConfig((x) => ({ ...x, ...c }))} />
          {config.modo === 'parejas' && <p className="pzp-nota">Por parejas: 4 o 6 jugadores. Van juntos el 1.º con el 3.º y el 2.º con el 4.º (con 6: 1-4, 2-5 y 3-6).</p>}
        </SelectorJugadores>
      </div>
    );
  }

  const est = estRef.current;
  const salir = modal && <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso y volverás a la portada." onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />;
  const mostrar = (t) => { setAviso(t); setTimeout(() => setAviso(null), 2800); };
  const envoltorio = (c) => (
    <div className={`pzp-contenedor ${juego.id} qq-en-partida`}>
      {aviso && <p className="pzp-toast" role="alert">{aviso}</p>}
      <section className="game pzp-escena">{c}</section>
      {salir}
    </div>
  );
  if (est.fase === 'fin') {
    return envoltorio(
      <Fin v={E.vistaDe(est, -1)} juego={juego} onSalir={() => setModal(true)}>
        <div className="pzp-barra estatica">
          <button type="button" className="pzp-boton grande" onClick={() => setPaso('config')}><Icon name="refresh" size={20} /> Nueva partida</button>
          <button type="button" className="pzp-boton secundario" onClick={() => onExit?.()}><Icon name="door" size={18} /> Salir a la portada</button>
        </div>
      </Fin>
    );
  }

  // ¿Quién tiene el móvil?
  let quien = null;
  if (est.fase === 'cambio') quien = est.jugadores.find((j) => !j.fuera && est.cambios[j.id] === undefined)?.id ?? null;
  if (est.fase === 'apuestas') quien = E.quienHabla(est);
  const enviar = (tipo, d = {}) => {
    const ahora = Date.now();
    let r;
    if (tipo === 'proponer') r = E.proponer(est, est.jugadores[0].id, d.cambio);
    else if (tipo === 'aceptar') r = E.aceptar(est, d.jugador, ahora);
    else if (tipo === 'cambiar') r = E.cambiar(est, quien, d.ids, ahora);
    else if (tipo === 'anunciar') r = E.anunciar(est, quien, d.nivel, d.subida, ahora);
    else if (tipo === 'pasar') r = E.pasar(est, quien, ahora);
    else if (tipo === 'desafiar') r = E.desafiar(est, quien);
    else if (tipo === 'siguiente') r = E.siguiente(est, ahora);
    else if (tipo === 'terminar') r = E.terminar(est);
    if (r && !r.ok) mostrar(r.error);
    refrescar();
  };
  if (quien !== null) {
    const clave = `${est.ronda}-${est.fase}-${quien}-${est.registro.length}`;
    const v = E.vistaDe(est, quien);
    if (confirmado !== clave) {
      return envoltorio(
        <TurnoDe v={v} id={quien} puedo onListo={() => setConfirmado(clave)} boton={`Soy ${v.jugadores.find((j) => j.id === quien).nombre}`}
          texto={est.fase === 'cambio' ? 'Pásale el móvil: va a ver sus cartas y cambiar las que quiera.' : 'Pásale el móvil: le toca hablar. ¡Que nadie mire sus cartas!'} />
      );
    }
    return envoltorio(<Partida v={v} enviar={enviar} onSalir={() => setModal(true)} local />);
  }
  return envoltorio(<Partida v={E.vistaDe(est, -1)} enviar={enviar} onSalir={() => setModal(true)} local />);
}
