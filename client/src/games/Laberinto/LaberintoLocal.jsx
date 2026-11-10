// client/src/games/Laberinto/LaberintoLocal.jsx
// Un solo dispositivo: el móvil pasa de explorador en explorador cada turno (los objetos y los cepos son secretos).
import React, { useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { Partida, Fin, Config } from './Partida.jsx';
import { ModalSalir, TurnoDe } from '../Pulsador/Vistas.jsx';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';

export default function LaberintoLocal({ juego, onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(['', '']);
  const [config, setConfig] = useState({ rondasMax: 30 });
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
    setError('');
    estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), config, Date.now());
    estRef.current.hasta = null;
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
          onEmpezar={empezar} textoBoton="¡Entrar en el laberinto!" error={error}
        >
          <Config config={config} onCambiar={(c) => setConfig((x) => ({ ...x, ...c }))} />
        </SelectorJugadores>
      </div>
    );
  }

  const est = estRef.current;
  est.hasta = null; // en un dispositivo no hay reloj de turno
  const salir = modal && <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso y volverás a la portada." onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />;
  const envoltorio = (c) => (
    <div className={`pzp-contenedor ${juego.id} qq-en-partida`}>
      {aviso && <p className="pzp-toast" role="alert">{aviso}</p>}
      <section className="game pzp-escena">{c}</section>
      {salir}
    </div>
  );
  if (est.fase === 'fin') {
    return envoltorio(
      <Fin v={E.vistaDe(est, -1)} onSalir={() => setModal(true)}>
        <div className="pzp-barra estatica">
          <button type="button" className="pzp-boton grande" onClick={() => setPaso('config')}><Icon name="refresh" size={20} /> Otro laberinto</button>
          <button type="button" className="pzp-boton secundario" onClick={() => onExit?.()}><Icon name="door" size={18} /> Salir a la portada</button>
        </div>
      </Fin>
    );
  }
  const quien = est.jugadores.find((j) => j.id === est.turno.jugadorId);
  const clave = `${est.ronda}-${quien.id}-${est.nlog > 0 ? est.ronda : 0}`;
  const v = E.vistaDe(est, quien.id);
  if (confirmado !== clave) {
    const P = E.PERSONAJES[quien.personaje];
    return envoltorio(
      <TurnoDe v={v} id={quien.id} puedo onListo={() => setConfirmado(clave)} boton={`Soy ${quien.nombre}`}
        texto={`${P.e} ${P.nombre}. Pásale el móvil: sus objetos y sus cepos son secretos.`} />
    );
  }
  const enviar = (tipo, d = {}) => {
    const t = Date.now();
    const id = quien.id;
    const acciones = {
      mover: () => E.mover(est, id, d.sala, t), robar: () => E.robar(est, id, d.victima, t), cepo: () => E.ponerCepo(est, id),
      barricada: () => E.barricada(est, id, d.sala), teletransporte: () => E.teletransporte(est, id, d.sala, t), pacto: () => E.proponerPacto(est, id, d.a),
      responderPacto: () => E.responderPacto(est, id, d.propuesta, d.acepta), fin: () => E.terminarTurno(est, id, t)
    };
    const r = acciones[tipo]?.();
    if (r && !r.ok) { setAviso(r.error); setTimeout(() => setAviso(null), 2500); }
    refrescar();
  };
  return envoltorio(<Partida v={v} enviar={enviar} onSalir={() => setModal(true)} local />);
}
