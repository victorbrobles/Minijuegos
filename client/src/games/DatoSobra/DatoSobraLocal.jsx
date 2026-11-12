// client/src/games/DatoSobra/DatoSobraLocal.jsx
// Un solo dispositivo: pantalla de turno antes de responder y antes de que cada retador decida (en secreto).
import React, { useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { Partida, Fin, Config } from './Partida.jsx';
import { ModalSalir, TurnoDe } from '../Pulsador/Vistas.jsx';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';
import { limitesLocal } from '../limites.js';

const LIM_JUG = limitesLocal('datosobra');

export default function DatoSobraLocal({ juego, onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(() => Array(LIM_JUG.min).fill(''));
  const [config, setConfig] = useState({ rondas: 3 });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modal, setModal] = useState(false);
  const [confirmado, setConfirmado] = useState(null);
  const estRef = useRef(null);
  const [, setVer] = useState(0);
  const refrescar = () => setVer((x) => x + 1);

  const empezar = async () => {
    const limpios = nombres.map((n) => n.trim());
    if (limpios.some((n) => !n)) return setError('Todos los jugadores necesitan un nombre.');
    if (new Set(limpios.map((n) => n.toLowerCase())).size !== limpios.length) return setError('Hay nombres repetidos.');
    setError(''); setCargando(true);
    try {
      const d = await (await fetch(`/api/datosobra/local?n=${config.rondas}&j=${nombres.length}`)).json();
      estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), d.items, { ...config, sinReloj: true }, Date.now());
      setPaso('juego');
    } catch {
      setError('No se han podido cargar los futbolistas.');
    } finally {
      setCargando(false);
    }
    return undefined;
  };

  if (paso === 'config') {
    return (
      <div className={`pzp-contenedor ${juego.id}`}>
        <SelectorJugadores
          onVolver={onVolver} onAyuda={onAbrirAyuda} min={LIM_JUG.min} max={LIM_JUG.max}
          numJugadores={nombres.length}
          onCambiarNum={(n) => setNombres((l) => (n > l.length ? [...l, ...Array(n - l.length).fill('')] : l.slice(0, n)))}
          nombres={nombres}
          onNombre={(i, valor) => setNombres((l) => l.map((x, k) => (k === i ? valor : x)))}
          onEmpezar={empezar} textoBoton={cargando ? 'Buscando futbolistas…' : '¡A cazar mentiras!'} error={error}
        >
          <Config config={config} onCambiar={(c) => setConfig((x) => ({ ...x, ...c }))} />
        </SelectorJugadores>
      </div>
    );
  }
  const est = estRef.current;
  const salir = modal && <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso y volverás a la portada." onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />;
  const envoltorio = (c) => (
    <div className={`pzp-contenedor ${juego.id} qq-en-partida`}>
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
  // ¿Quién tiene el móvil? En la respuesta, el del turno; en los desafíos, cada retador por orden
  let quien = null;
  if (est.fase === 'responder') quien = est.turno;
  if (est.fase === 'desafiar') quien = est.jugadores.find((j) => !j.fuera && j.id !== est.turno && est.decisiones[j.id] === undefined)?.id ?? null;
  const enviar = (tipo, d = {}) => {
    if (tipo === 'responder') E.responder(est, est.turno, d.indice);
    else if (tipo === 'desafiar') E.desafiar(est, quien, d.indice);
    else if (tipo === 'siguiente') E.siguiente(est);
    else if (tipo === 'terminar') E.terminar(est);
    refrescar();
  };
  if (quien !== null) {
    const clave = `${est.ronda}-${est.fase}-${quien}`;
    const v = E.vistaDe(est, quien);
    if (confirmado !== clave) {
      const nombre = v.jugadores.find((j) => j.id === quien).nombre;
      const turno = v.jugadores.find((j) => j.id === est.turno).nombre;
      return envoltorio(
        <TurnoDe juego={juego} onSalir={() => setModal(true)} v={v} id={quien} puedo onListo={() => setConfirmado(clave)} boton={`Soy ${nombre}`}
          texto={est.fase === 'responder' ? `Pásale el móvil: tiene que encontrar la mentira sobre ${v.futbolista}.`
            : `Pásale el móvil: decide en secreto si acepta la respuesta de ${turno} o la desafía.`} />
      );
    }
    return envoltorio(<Partida v={v} enviar={enviar} onSalir={() => setModal(true)} local />);
  }
  return envoltorio(<Partida v={E.vistaDe(est, -1)} enviar={enviar} onSalir={() => setModal(true)} local />);
}
