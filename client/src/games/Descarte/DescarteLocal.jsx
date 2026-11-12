// client/src/games/Descarte/DescarteLocal.jsx
// Modo «un único dispositivo»: el móvil pasa del retador (elige rival y categoría) al retado, que ve su categoría,
// dice la palabra en voz alta y marca acierto (tocando la letra), fallo o pasar turno. Mismo motor que el online.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { TODAS_LAS_CATEGORIAS } from '../../../../server/data/seeds/descarte/descarte.js';
import { PantallaJuego, PantallaTablero, PantallaFin } from './Vistas.jsx';
import { ModalSalir, SelectorTableros } from './DescarteOnline.jsx';
import { SelectorJugadores, BloqueConfig } from '../../components/MenuJuego.jsx';
import './Descarte.css';
import { limitesLocal } from '../limites.js';

const LIM_JUG = limitesLocal('descarte');

const ACCIONES = {
  retar: (est, d) => E.retar(est, est.retadorId, d),
  empezar: (est) => E.empezar(est, est.rivalId, Date.now()),
  marcar: (est, d) => E.marcar(est, d.letra ?? null, Boolean(d.pasa)),
  'siguiente-tablero': (est) => E.siguienteTablero(est),
  terminar: (est) => E.terminar(est)
};

export default function DescarteLocal({ onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(() => Array(LIM_JUG.min).fill(''));
  const [tableros, setTableros] = useState(5);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState(null);
  const [modal, setModal] = useState(false);
  const estRef = useRef(null);
  const [, setVer] = useState(0);
  const avisoTimer = useRef(null);
  const refrescar = () => setVer((x) => x + 1);

  // El reloj de 30 s: si se agota, cuenta como fallo.
  useEffect(() => {
    if (paso !== 'juego') return undefined;
    const i = setInterval(() => { if (estRef.current && E.tick(estRef.current, Date.now())) refrescar(); }, 250);
    return () => clearInterval(i);
  }, [paso]);
  useEffect(() => () => clearTimeout(avisoTimer.current), []);

  const empezar = () => {
    const limpios = nombres.map((n) => n.trim());
    if (limpios.some((n) => !n)) return setError('Todos los jugadores necesitan un nombre.');
    if (new Set(limpios.map((n) => n.toLowerCase())).size !== limpios.length) return setError('Hay nombres repetidos.');
    setError('');
    estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), { tableros }, TODAS_LAS_CATEGORIAS);
    setPaso('juego');
    return undefined;
  };

  if (paso === 'config') {
    return (
      <div className="dsp-contenedor">
        <SelectorJugadores
          onVolver={onVolver} onAyuda={onAbrirAyuda} min={LIM_JUG.min} max={LIM_JUG.max}
          numJugadores={nombres.length}
          onCambiarNum={(n) => setNombres((l) => (n > l.length ? [...l, ...Array(n - l.length).fill('')] : l.slice(0, n)))}
          nombres={nombres}
          onNombre={(i, valor) => setNombres((l) => l.map((x, k) => (k === i ? valor : x)))}
          onEmpezar={empezar} textoBoton="¡Empezar partida!" error={error}
        >
          <BloqueConfig titulo="Número de tableros">
            <SelectorTableros valor={tableros} onCambiar={setTableros} />
          </BloqueConfig>
        </SelectorJugadores>
      </div>
    );
  }

  const est = estRef.current;
  const v = { ...E.vistaDe(est, -1), yo: null };
  const mostrar = (texto) => { setAviso(texto); clearTimeout(avisoTimer.current); avisoTimer.current = setTimeout(() => setAviso(null), 3000); };
  const enviar = (tipo, datos = {}) => {
    const r = ACCIONES[tipo]?.(est, datos);
    if (r && !r.ok) mostrar(r.error);
    refrescar();
  };
  const onSalir = () => setModal(true);

  let contenido;
  if (est.fase === 'fin') {
    contenido = (
      <PantallaFin v={v} onSalir={onSalir}>
        <div className="dsp-barra estatica">
          <button type="button" className="dsp-boton grande" onClick={() => setPaso('config')}><Icon name="refresh" size={20} /> Nueva partida</button>
          <button type="button" className="dsp-boton secundario" onClick={() => onExit?.()}><Icon name="door" size={18} /> Salir a la portada</button>
        </div>
      </PantallaFin>
    );
  } else if (est.fase === 'tablero') {
    contenido = (
      <PantallaTablero v={v} onSalir={onSalir}>
        <div className="dsp-barra estatica">
          <button type="button" className="dsp-boton grande" onClick={() => enviar('siguiente-tablero')}><Icon name="play" size={20} /> Empezar el tablero {v.tablero + 1}</button>
          <button type="button" className="dsp-boton secundario" onClick={() => enviar('terminar')}><Icon name="flagFinish" size={18} /> Terminar la partida ya</button>
        </div>
      </PantallaTablero>
    );
  } else {
    contenido = <PantallaJuego v={v} enviar={enviar} onSalir={onSalir} local />;
  }

  return (
    <div className="dsp-contenedor qq-en-partida">
      {aviso && <p className="dsp-toast" role="alert" onClick={() => setAviso(null)}>{aviso}</p>}
      <section className="game dsp-escena">{contenido}</section>
      {modal && (
        <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso y volverás a la portada."
          onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />
      )}
    </div>
  );
}
