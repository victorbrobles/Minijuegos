// client/src/games/CuatroClubes/CuatroClubesLocal.jsx
// Modo «un único dispositivo»: el móvil va pasando de jugador en jugador según el turno; el grupo hace de juez con los
// futbolistas que no conocemos. Mismo motor que el online; las combinaciones se piden al servidor.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { PantallaJuego, PantallaResultado, PantallaFin, ModalSalir, SelectorRondas } from './Vistas.jsx';
import { SelectorJugadores, BloqueConfig } from '../../components/MenuJuego.jsx';
import './CuatroClubes.css';
import { limitesLocal } from '../limites.js';

const LIM_JUG = limitesLocal('cuatroclubes');

export default function CuatroClubesLocal({ onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(() => Array(LIM_JUG.min).fill(''));
  const [rondas, setRondas] = useState(5);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [modal, setModal] = useState(false);
  const estRef = useRef(null);
  const [, setVer] = useState(0);
  const avisoTimer = useRef(null);
  const refrescar = () => setVer((x) => x + 1);

  useEffect(() => {
    if (paso !== 'juego') return undefined;
    const i = setInterval(() => { if (estRef.current) { E.tick(estRef.current, Date.now()); refrescar(); } }, 300);
    return () => clearInterval(i);
  }, [paso]);
  useEffect(() => () => clearTimeout(avisoTimer.current), []);

  const empezar = async () => {
    const limpios = nombres.map((n) => n.trim());
    if (limpios.some((n) => !n)) return setError('Todos los jugadores necesitan un nombre.');
    if (new Set(limpios.map((n) => n.toLowerCase())).size !== limpios.length) return setError('Hay nombres repetidos.');
    setError(''); setCargando(true);
    try {
      const r = await fetch(`/api/cuatroclubes/retos?n=${rondas}`);
      const d = await r.json();
      if (!d.success) throw new Error();
      estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), d.retos, d.base, Date.now());
      setPaso('juego');
    } catch {
      setError('No se han podido cargar los clubes. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
    return undefined;
  };

  if (paso === 'config') {
    return (
      <div className="c4p-contenedor">
        <SelectorJugadores
          onVolver={onVolver} onAyuda={onAbrirAyuda} min={LIM_JUG.min} max={LIM_JUG.max}
          numJugadores={nombres.length}
          onCambiarNum={(n) => setNombres((l) => (n > l.length ? [...l, ...Array(n - l.length).fill('')] : l.slice(0, n)))}
          nombres={nombres}
          onNombre={(i, valor) => setNombres((l) => l.map((x, k) => (k === i ? valor : x)))}
          onEmpezar={empezar} textoBoton={cargando ? 'Cargando…' : '¡Empezar partida!'} error={error}
        >
          <BloqueConfig titulo="Número de rondas">
            <SelectorRondas valor={rondas} onCambiar={setRondas} />
          </BloqueConfig>
        </SelectorJugadores>
      </div>
    );
  }

  const est = estRef.current;
  const v = { ...E.vistaDe(est, -1), yo: null };
  const mostrar = (t) => { setAviso(t); clearTimeout(avisoTimer.current); avisoTimer.current = setTimeout(() => setAviso(null), 3000); };
  const enviar = (tipo, d = {}) => {
    const ahora = Date.now();
    let r;
    const turno = est.orden[est.turnoIdx];
    if (tipo === 'responder') r = E.responder(est, turno, d.respuesta, ahora);
    else if (tipo === 'listo') r = E.listo(est, turno, ahora);
    else if (tipo === 'pasar') r = E.pasar(est, turno);
    else if (tipo === 'juzgar') r = E.juzgar(est, d.clubes);
    else if (tipo === 'terminar') r = E.terminar(est);
    else if (tipo === 'siguiente') r = E.siguiente(est, ahora);
    if (r && !r.ok) mostrar(r.error);
    refrescar();
  };
  const onSalir = () => setModal(true);

  let contenido;
  if (est.fase === 'fin') {
    contenido = (
      <PantallaFin v={v} onSalir={onSalir}>
        <div className="c4p-barra estatica">
          <button type="button" className="c4p-boton grande" onClick={() => setPaso('config')}><Icon name="refresh" size={20} /> Nueva partida</button>
          <button type="button" className="c4p-boton secundario" onClick={() => onExit?.()}><Icon name="door" size={18} /> Salir a la portada</button>
        </div>
      </PantallaFin>
    );
  } else if (est.fase === 'resuelta') {
    contenido = (
      <PantallaResultado v={v} onSalir={onSalir}>
        <div className="c4p-barra estatica">
          <button type="button" className="c4p-boton grande" onClick={() => enviar('siguiente')}><Icon name="play" size={20} /> {v.ronda >= v.rondas ? 'Ver resultado final' : 'Siguientes cuatro clubes'}</button>
          {v.ronda < v.rondas && <button type="button" className="c4p-enlace" onClick={() => enviar('terminar')}><Icon name="flagFinish" size={15} /> Terminar la partida ya</button>}
        </div>
      </PantallaResultado>
    );
  } else {
    contenido = <PantallaJuego v={v} enviar={enviar} onSalir={onSalir} miTurno local />;
  }
  return (
    <div className="c4p-contenedor qq-en-partida">
      {aviso && <p className="c4p-toast" role="alert" onClick={() => setAviso(null)}>{aviso}</p>}
      <section className="game c4p-escena">{contenido}</section>
      {modal && (
        <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso y volverás a la portada."
          onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />
      )}
    </div>
  );
}
