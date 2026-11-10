// client/src/games/OnceFantasma/OnceFantasmaLocal.jsx
// Un solo dispositivo: el grupo mira la misma pantalla; quien escribe elige a quién se le apunta el acierto.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { Partida, Fin, Config } from './Partida.jsx';
import { ModalSalir } from '../Pulsador/Vistas.jsx';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';

export default function OnceFantasmaLocal({ juego, onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(['', '']);
  const [config, setConfig] = useState({ rondas: 2, segundos: 240 });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modal, setModal] = useState(false);
  const [quien, setQuien] = useState(1);
  const estRef = useRef(null);
  const [, setVer] = useState(0);
  const refrescar = () => setVer((x) => x + 1);

  // El reloj destapa pistas y cierra la ronda también en un dispositivo
  useEffect(() => {
    if (paso !== 'juego') return undefined;
    const t = setInterval(() => {
      const est = estRef.current;
      if (est?.fase === 'jugando') { E.tick(est, Date.now()); refrescar(); }
    }, 1000);
    return () => clearInterval(t);
  }, [paso]);

  const empezar = async () => {
    const limpios = nombres.map((n) => n.trim());
    if (limpios.some((n) => !n)) return setError('Todos los jugadores necesitan un nombre.');
    if (new Set(limpios.map((n) => n.toLowerCase())).size !== limpios.length) return setError('Hay nombres repetidos.');
    setError(''); setCargando(true);
    try {
      const r = await fetch(`/api/oncefantasma/local?n=${config.rondas}`);
      const d = await r.json();
      estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), d.onces, config, Date.now());
      setQuien(1);
      setPaso('juego');
    } catch {
      setError('No se han podido cargar las alineaciones.');
    } finally {
      setCargando(false);
    }
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
          onEmpezar={empezar} textoBoton={cargando ? 'Buscando el once…' : '¡Saltar al campo!'} error={error}
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
  const enviar = (tipo, d = {}) => {
    const ahora = Date.now();
    if (tipo === 'adivinar') E.adivinar(est, d.jugador, d.texto, ahora);
    else if (tipo === 'pista') E.pista(est, Math.random, ahora);
    else if (tipo === 'rendirse') E.rendirse(est);
    else if (tipo === 'siguiente') E.siguiente(est, ahora);
    else if (tipo === 'terminar') E.terminar(est);
    refrescar();
  };
  return envoltorio(<Partida v={E.vistaDe(est, quien)} enviar={enviar} onSalir={() => setModal(true)} local jugadorLocal={quien} onJugador={setQuien} />);
}
