// client/src/games/UnaPieza/UnaPiezaLocal.jsx
// Un solo dispositivo: el móvil pasa de mano en mano en cada turno (sin reloj).
import React, { useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { Partida, Fin, Config } from './Partida.jsx';
import { ModalSalir, TurnoDe } from '../Pulsador/Vistas.jsx';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';
import { limitesLocal } from '../limites.js';

const LIM_JUG = limitesLocal('unapieza');

const barajar = (l) => { const b = [...l]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

export default function UnaPiezaLocal({ juego, onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(() => Array(LIM_JUG.min).fill(''));
  const [config, setConfig] = useState({ rondas: 3, segundos: 60 });
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
    estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), barajar(E.FIGURAS), config, Date.now());
    setPaso('juego');
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
          onEmpezar={empezar} textoBoton="¡A encajar piezas!" error={error}
        >
          <Config config={config} onCambiar={(c) => setConfig((x) => ({ ...x, ...c }))} />
        </SelectorJugadores>
      </div>
    );
  }

  const est = estRef.current;
  est.hasta = null; // en un dispositivo no hay reloj por turno
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
  const enviar = (tipo, d = {}) => {
    const ahora = Date.now();
    let r;
    if (tipo === 'colocar') r = E.colocar(est, est.turno, d, ahora);
    else if (tipo === 'pasar') r = E.pasar(est, est.turno, d.cambiar ?? null, ahora);
    else if (tipo === 'siguiente') r = E.siguiente(est, ahora);
    else if (tipo === 'terminar') r = E.terminar(est);
    if (r && !r.ok) mostrar(r.error);
    else if (tipo === 'colocar' && r) mostrar(`+${r.puntos} · ${r.detalle}`);
    refrescar();
  };
  const v = E.vistaDe(est, est.fase === 'jugando' ? est.turno : -1);
  // Pantalla de turno: cada uno tiene su mano y su objetivo secreto
  const clave = est.nturno;
  if (est.fase === 'jugando' && confirmado !== clave) {
    const nombre = v.jugadores.find((j) => j.id === est.turno).nombre;
    return envoltorio(
      <TurnoDe juego={juego} onSalir={() => setModal(true)} v={v} id={est.turno} puedo onListo={() => setConfirmado(clave)} boton={`Soy ${nombre}`}
        texto={`Pásale el móvil: va a ver sus piezas y su objetivo secreto. ${v.figura.e} ${v.figura.nombre}: quedan ${v.huecos} huecos.`} />
    );
  }
  return envoltorio(<Partida v={v} enviar={enviar} onSalir={() => setModal(true)} local />);
}
