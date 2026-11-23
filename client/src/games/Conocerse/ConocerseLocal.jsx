// client/src/games/Conocerse/ConocerseLocal.jsx
// Un solo dispositivo: el móvil pasa de mano en mano para responder y para elegir en secreto; el desglose y los
// puntos se ven juntos.
import React, { useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { PREGUNTAS } from './preguntas.js';
import { Partida, Fin, Config } from './Partida.jsx';
import { ModalSalir, TurnoDe } from '../Pulsador/Vistas.jsx';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';
import { limitesLocal } from '../limites.js';

const LIM_JUG = limitesLocal('conocerse');

export default function ConocerseLocal({ juego, onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(() => Array(LIM_JUG.min).fill(''));
  const [config, setConfig] = useState({ vueltas: 3 });
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
    estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), PREGUNTAS, config, Date.now());
    setConfirmado(null);
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
          onEmpezar={empezar} textoBoton="¡A conocerse!" error={error}
        >
          <Config config={config} sala={{ jugadores: nombres }} onCambiar={(c) => setConfig((x) => ({ ...x, ...c }))} />
        </SelectorJugadores>
      </div>
    );
  }

  const est = estRef.current;
  const activos = est.jugadores.filter((j) => !j.fuera);
  const prota = est.jugadores.find((j) => j.id === est.protagonista);
  let quien = null;
  if (est.fase === 'responder') quien = activos.find((j) => j.id !== est.protagonista && !est.respuestas[j.id]) || null;
  if (est.fase === 'elegir') quien = activos.find((j) => est.votos[j.id] == null) || null;
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
      const texto = est.fase === 'responder'
        ? `Pásale el móvil: va a escribir en secreto lo que cree que contestaría ${prota?.nombre}.`
        : quien.id === est.protagonista ? 'Pásale el móvil: la pregunta era para ti. Elige en secreto la respuesta buena.' : `Pásale el móvil: va a apostar en secreto por la respuesta que elegirá ${prota?.nombre}.`;
      return envoltorio(
        <TurnoDe juego={juego} onSalir={() => setModal(true)} v={v} id={quien.id} puedo onListo={() => setConfirmado(clave)} boton={`Soy ${quien.nombre}`} texto={texto} chip={`🙈 ${est.ronda}/${est.rondas}`} />
      );
    }
    const enviar = (tipo, d = {}) => {
      const r = E.accion(est, quien.id, { tipo, ...d }, { esAdmin: true });
      if (r && !r.ok) mostrar(r.error);
      refrescar();
    };
    return envoltorio(<Partida v={v} enviar={enviar} onSalir={() => setModal(true)} local />);
  }
  // Desglose y puntos: todos juntos
  const v = E.vistaDe(est, -1);
  return envoltorio(<Partida v={v} onSalir={() => setModal(true)} local enviar={(tipo) => { if (tipo === 'siguiente') { E.siguiente(est); setConfirmado(null); refrescar(); } }} />);
}
