// client/src/games/Fundadores/FundadoresLocal.jsx
// Modo «un único dispositivo»: el motor corre en el navegador y el móvil se pasa de mano en mano
// cada vez que alguien tiene que ver algo secreto (elegir oficio o jugar su turno con su mano de planos).
import React, { useRef, useState } from 'react';
import Icon from './IconoF.jsx';
import * as E from './engine.js';
import { PantallaJuego, PantallaFin, Avatar, Registro } from './Vistas.jsx';
import { ModalSalir, SelectorDuracion } from './FundadoresOnline.jsx';
import { SelectorJugadores, BloqueConfig } from '../../components/MenuJuego.jsx';
import './Fundadores.css';
import { limitesLocal } from '../limites.js';

const LIM_JUG = limitesLocal('fundadores');

const ACCIONES = {
  'elegir-rol': (est, id, d) => E.elegirRol(est, id, d.rol),
  recurso: (est, id, d) => E.recurso(est, id, d.recurso),
  plano: (est, id, d) => E.quedarPlano(est, id, d.uid),
  habilidad: (est, id, d) => E.habilidad(est, id, d.params || {}),
  omitir: (est, id) => E.omitirHabilidad(est, id),
  construir: (est, id, d) => E.construir(est, id, d.uid),
  edificio: (est, id, d) => E.usarEdificio(est, id, d.efecto, d.params || {}),
  terminar: (est, id) => E.terminarTurno(est, id)
};

export default function FundadoresLocal({ onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(() => Array(LIM_JUG.min).fill(''));
  const [duracion, setDuracion] = useState('normal');
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [modal, setModal] = useState(false);
  const [confirmado, setConfirmado] = useState(null);
  const estRef = useRef(null);
  const [, setVer] = useState(0);
  const avisoTimer = useRef(null);

  const empezar = () => {
    const limpios = nombres.map((n) => n.trim());
    if (limpios.some((n) => !n)) return setError('Todos los jugadores necesitan un nombre.');
    if (new Set(limpios.map((n) => n.toLowerCase())).size !== limpios.length) return setError('Hay nombres repetidos.');
    setError('');
    estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), { duracion });
    setConfirmado(null);
    setPaso('juego');
    return undefined;
  };

  if (paso === 'config') {
    return (
      <div className="fdp-contenedor">
        <SelectorJugadores
          onVolver={onVolver} onAyuda={onAbrirAyuda} min={LIM_JUG.min} max={LIM_JUG.max}
          numJugadores={nombres.length}
          onCambiarNum={(n) => setNombres((l) => (n > l.length ? [...l, ...Array(n - l.length).fill('')] : l.slice(0, n)))}
          nombres={nombres}
          onNombre={(i, valor) => setNombres((l) => l.map((x, k) => (k === i ? valor : x)))}
          onEmpezar={empezar} textoBoton="¡A fundar el pueblo!" error={error}
        >
          <BloqueConfig titulo="Duración (edificios para completar el pueblo)">
            <SelectorDuracion valor={duracion} onCambiar={setDuracion} />
          </BloqueConfig>
        </SelectorJugadores>
      </div>
    );
  }

  const est = estRef.current;
  const salir = (
    modal && <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso y volverás a la portada." onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />
  );

  if (est.fase === 'fin') {
    const v = E.vistaDe(est, est.jugadores[0].id);
    return (
      <div className="fdp-contenedor qq-en-partida">
        <section className="game fdp-escena">
          <PantallaFin v={{ ...v, yo: { ...v.yo, id: -1 } }} yoId={-1} onSalir={() => setModal(true)}>
            <div className="fdp-barra estatica">
              <button type="button" className="fdp-boton grande" onClick={() => setPaso('config')}><Icon name="refresh" size={20} /> Nueva partida</button>
            </div>
          </PantallaFin>
        </section>
        {salir}
      </div>
    );
  }

  const quienId = est.fase === 'eleccion' ? E.eligeAhora(est) : est.turno.jugadorId;
  const quien = est.jugadores.find((j) => j.id === quienId);
  const clave = est.fase === 'eleccion' ? `${est.ronda}-e-${quienId}` : `${est.ronda}-t-${est.turnoRol}-${quienId}`;
  const v = E.vistaDe(est, quienId);

  if (confirmado !== clave) {
    const texto = est.fase === 'eleccion'
      ? 'Va a elegir su oficio en secreto. Que nadie más mire la pantalla.'
      : `Le toca jugar como ${E.nombreRol(est.turno.rol)}. Sus planos son secretos.`;
    return (
      <div className="fdp-contenedor qq-en-partida">
        <section className="game fdp-escena">
          <div className="fdp-tarjeta fdp-gate">
            <Avatar id={quien.id} nombre={quien.nombre} grande />
            <p className="fdp-etiqueta centrada">Pasa el móvil · ronda {est.ronda}</p>
            <h2>Le toca a {quien.nombre}</h2>
            <p className="fdp-texto">{texto}</p>
            <button type="button" className="fdp-boton grande" onClick={() => setConfirmado(clave)}><Icon name="eye" size={20} /> Soy {quien.nombre}</button>
            <button type="button" className="fdp-enlace oscuro" style={{ marginTop: '0.6rem' }} onClick={() => setModal(true)}>Salir de la partida</button>
          </div>
          <Registro v={v} />
        </section>
        {salir}
      </div>
    );
  }

  const enviar = (tipo, datos = {}) => {
    const r = ACCIONES[tipo]?.(est, quienId, datos);
    if (r && !r.ok) {
      setAviso(r.error);
      clearTimeout(avisoTimer.current);
      avisoTimer.current = setTimeout(() => setAviso(''), 3000);
    }
    setVer((x) => x + 1);
  };

  return (
    <div className="fdp-contenedor qq-en-partida">
      {aviso && <p className="fdp-toast" role="alert" onClick={() => setAviso('')}>{aviso}</p>}
      <section className="game fdp-escena">
        <PantallaJuego v={v} enviar={enviar} onSalir={() => setModal(true)} />
      </section>
      {salir}
    </div>
  );
}
