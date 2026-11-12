// client/src/games/Invento/InventoLocal.jsx
// Un solo dispositivo: el móvil pasa de mano en mano para inventar y para votar en secreto; los resultados, juntos.
import React, { useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { Partida, Fin, Config } from './Partida.jsx';
import { ModalSalir, TurnoDe } from '../Pulsador/Vistas.jsx';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';
import { limitesLocal } from '../limites.js';

const LIM_JUG = limitesLocal('invento');

export default function InventoLocal({ juego, onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(() => Array(LIM_JUG.min).fill(''));
  const [config, setConfig] = useState({ rondas: 3, segundos: 180 });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState(null);
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
      const r = await fetch('/api/invento/cartas');
      const d = await r.json();
      // En un dispositivo no hay reloj: cada uno inventa a su ritmo
      estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), d.mazos, config, Date.now());
      estRef.current.hasta = null;
      setConfirmado(null);
      setPaso('juego');
    } catch {
      setError('No se han podido cargar las cartas.');
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
          onEmpezar={empezar} textoBoton={cargando ? 'Barajando…' : '¡Repartir cartas!'} error={error}
        >
          <Config config={{ ...config, segundos: config.segundos }} onCambiar={(c) => setConfig((x) => ({ ...x, ...c }))} />
        </SelectorJugadores>
      </div>
    );
  }

  const est = estRef.current;
  est.hasta = null;
  const activos = est.jugadores.filter((j) => !j.fuera);
  let quien = null;
  if (est.fase === 'inventar') quien = activos.find((j) => !est.inventos[j.id]) || null;
  if (est.fase === 'votar') quien = activos.find((j) => !est.votos[j.id]) || null;
  const salir = modal && <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso y volverás a la portada." onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />;
  const envoltorio = (c) => (
    <div className={`pzp-contenedor ${juego.id} qq-en-partida`}>
      {aviso && <p className="pzp-toast" role="alert">{aviso}</p>}
      <section className="game pzp-escena">{c}</section>
      {salir}
    </div>
  );
  const mostrar = (t) => { setAviso(t); setTimeout(() => setAviso(null), 2800); };

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
  if (quien) {
    const clave = `${est.ronda}-${est.fase}-${quien.id}`;
    const v = E.vistaDe(est, quien.id);
    if (confirmado !== clave) {
      return envoltorio(
        <TurnoDe v={v} id={quien.id} puedo onListo={() => setConfirmado(clave)} boton={`Soy ${quien.nombre}`}
          texto={est.fase === 'inventar' ? 'Pásale el móvil: va a recibir sus tres cartas y a inventar en secreto.' : 'Pásale el móvil: va a votar en secreto.'} />
      );
    }
    const enviar = (tipo, d = {}) => {
      let r;
      if (tipo === 'cambiar') r = E.cambiarCarta(est, quien.id, d.carta);
      else if (tipo === 'inventar') r = E.inventar(est, quien.id, d.nombre, d.desc, Date.now());
      else if (tipo === 'votar') r = E.votar(est, quien.id, d.votos);
      if (r && !r.ok) mostrar(r.error);
      refrescar();
    };
    return envoltorio(<Partida v={v} enviar={enviar} onSalir={() => setModal(true)} local />);
  }
  // Resultados: todos juntos
  const v = E.vistaDe(est, -1);
  return envoltorio(<Partida v={v} onSalir={() => setModal(true)} local enviar={(tipo) => { if (tipo === 'siguiente') { E.siguiente(est, Date.now()); setConfirmado(null); refrescar(); } }} />);
}
