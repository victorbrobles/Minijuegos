// client/src/games/Tablero/TableroLocal.jsx
// Un solo dispositivo: primero se eligen las categorías por turnos; luego el móvil pasa al jugador del turno,
// que elige casilla y responde (sin reloj). Si falla, el siguiente tiene rebote en la misma pantalla.
import React, { useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { Partida, Fin, Config, AvisoResultado } from './Partida.jsx';
import { ModalSalir, TurnoDe } from '../Pulsador/Vistas.jsx';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';
import { limitesLocal } from '../limites.js';

const LIM_JUG = limitesLocal('tablero');

export default function TableroLocal({ juego, onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(() => Array(LIM_JUG.min).fill(''));
  const [config, setConfig] = useState({ categorias: 4, segundos: 20 });
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
      const d = await (await fetch('/api/tablero/local')).json();
      estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), d.banco, { ...config, sinReloj: true }, Date.now());
      setPaso('juego');
    } catch {
      setError('No se han podido cargar las preguntas.');
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
          onEmpezar={empezar} textoBoton={cargando ? 'Montando el tablero…' : '¡Al tablero!'} error={error}
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
      {est.fase !== 'fin' && <AvisoResultado v={E.vistaDe(est, -1)} />}
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
    if (tipo === 'categoria') E.elegirCategoria(est, est.turno, d.cat);
    else if (tipo === 'elegir') E.elegir(est, est.turno, d.cat, d.v);
    else if (tipo === 'responder') E.responder(est, est.fase === 'rebote' ? est.rebote.id : est.turno, d.opcion);
    else if (tipo === 'terminar') E.terminar(est);
    refrescar();
  };
  const v = E.vistaDe(est, est.turno);
  // Pantalla de turno antes de que cada jugador elija casilla
  if (est.fase === 'elegir' && confirmado !== est.jugadas) {
    const nombre = v.jugadores.find((j) => j.id === est.turno).nombre;
    return envoltorio(
      <TurnoDe juego={juego} onSalir={() => setModal(true)} v={v} id={est.turno} puedo onListo={() => setConfirmado(est.jugadas)} boton={`Soy ${nombre}`}
        texto={`Pásale el móvil: elige casilla y responde. Quedan ${v.quedan} casillas.`}>
        {est.ultimo && <p className="tbx-gate-ultimo">{v.jugadores.find((j) => j.id === est.ultimo.id).nombre} {est.ultimo.bien ? 'acertó' : 'falló'}{est.ultimo.rebote ? ' el rebote' : ''}: {est.ultimo.puntos > 0 ? '+' : ''}{est.ultimo.puntos}</p>}
      </TurnoDe>
    );
  }
  return envoltorio(<Partida v={v} enviar={enviar} onSalir={() => setModal(true)} local />);
}
