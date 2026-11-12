// client/src/games/Coleccion/ColeccionLocal.jsx
// Modo «un único dispositivo»: el motor corre en el navegador y el móvil pasa de mano en mano en cada turno
// (la mano y el encargo de cada uno son secretos).
import React, { useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import AvisoEfecto from '../../components/AvisoEfecto.jsx';
import * as E from './engine.js';
import { PantallaJuego, PantallaFin, Avatar } from './Vistas.jsx';
import { ModalSalir } from './ColeccionOnline.jsx';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';
import './Coleccion.css';
import { limitesLocal } from '../limites.js';

const LIM_JUG = limitesLocal('coleccion');

const ACCIONES = {
  colocar: (est, id, d) => E.colocar(est, id, d.uid),
  retirar: (est, id, d) => E.retirar(est, id, d.uid),
  accion: (est, id, d) => E.jugarAccion(est, id, d.uid, d.params || {}),
  terminar: (est, id) => E.terminarTurno(est, id),
  descartar: (est, id, d) => E.descartar(est, id, d.uid)
};

export default function ColeccionLocal({ onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(() => Array(LIM_JUG.min).fill(''));
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState(null);
  const [modal, setModal] = useState(false);
  const [confirmado, setConfirmado] = useState(null);
  const estRef = useRef(null);
  // Quién tenía el móvil en la última jugada: ve los avisos de su carta antes de pasarlo
  const enManoRef = useRef(null);
  const [, setVer] = useState(0);
  const avisoTimer = useRef(null);

  const empezar = () => {
    const limpios = nombres.map((n) => n.trim());
    if (limpios.some((n) => !n)) return setError('Todos los jugadores necesitan un nombre.');
    if (new Set(limpios.map((n) => n.toLowerCase())).size !== limpios.length) return setError('Hay nombres repetidos.');
    setError('');
    estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })));
    setConfirmado(null);
    setPaso('juego');
    return undefined;
  };

  if (paso === 'config') {
    return (
      <div className="cxp-contenedor">
        <SelectorJugadores
          onVolver={onVolver} onAyuda={onAbrirAyuda} min={LIM_JUG.min} max={LIM_JUG.max}
          numJugadores={nombres.length}
          onCambiarNum={(n) => setNombres((l) => (n > l.length ? [...l, ...Array(n - l.length).fill('')] : l.slice(0, n)))}
          nombres={nombres}
          onNombre={(i, valor) => setNombres((l) => l.map((x, k) => (k === i ? valor : x)))}
          onEmpezar={empezar} textoBoton="¡Repartir encargos!" error={error}
        />
      </div>
    );
  }

  const est = estRef.current;
  const salir = modal && (
    <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso y volverás a la portada." onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />
  );
  const mostrar = (texto, tipo) => { setAviso({ texto, tipo }); clearTimeout(avisoTimer.current); avisoTimer.current = setTimeout(() => setAviso(null), 3500); };

  if (est.fase === 'fin') {
    const v = E.vistaDe(est, -1);
    return (
      <div className="cxp-contenedor qq-en-partida">
        <section className="game cxp-escena">
          <PantallaFin v={{ ...v, yo: null }} onSalir={() => setModal(true)}>
            <div className="cxp-barra estatica">
              <button type="button" className="cxp-boton grande" onClick={() => setPaso('config')}><Icon name="refresh" size={20} /> Nueva partida</button>
            </div>
          </PantallaFin>
        </section>
        {salir}
      </div>
    );
  }

  const quienId = est.turno.jugadorId;
  const quien = est.jugadores.find((j) => j.id === quienId);
  const clave = `${est.nlog}-${quienId}-${est.ronda}`;
  const claveTurno = `${quienId}-${est.ronda}`;
  if (confirmado !== claveTurno) {
    const v = E.vistaDe(est, -1);
    const previo = enManoRef.current;
    const avisosPrevio = previo != null ? (est.avisos?.[previo] || []) : [];
    return (
      <div className="cxp-contenedor qq-en-partida">
        {avisosPrevio.length > 0 && (
          <AvisoEfecto avisos={avisosPrevio} nombre={est.jugadores.find((j) => j.id === previo)?.nombre}
            onVisto={(n) => { E.visto(est, previo, n); setVer((x) => x + 1); }} />
        )}
        <section className="game cxp-escena">
          <div className="cxp-tarjeta cxp-gate">
            <Avatar id={quien.id} nombre={quien.nombre} grande />
            <p className="cxp-etiqueta centrada">Pasa el móvil · ronda {est.ronda}</p>
            <h2>Le toca a {quien.nombre}</h2>
            <p className="cxp-texto">Su mano y su encargo son secretos: que nadie más mire.</p>
            <button type="button" className="cxp-boton grande" onClick={() => setConfirmado(claveTurno)}><Icon name="eye" size={20} /> Soy {quien.nombre}</button>
            <button type="button" className="cxp-enlace oscuro" style={{ marginTop: '0.6rem' }} onClick={() => setModal(true)}>Salir de la partida</button>
          </div>
          {v.log.length > 0 && (
            <div className="cxp-tarjeta">
              <p className="cxp-etiqueta">📖 Lo último que ha pasado</p>
              <div className="cxp-log">{[...v.log].slice(-6).reverse().map((l) => <p key={l.n}>{l.texto}</p>)}</div>
            </div>
          )}
        </section>
        {salir}
      </div>
    );
  }

  const v = E.vistaDe(est, quienId);
  enManoRef.current = quienId;
  const enviar = (tipo, datos = {}) => {
    // El efecto de las cartas de acción se ve en el aviso personal (AvisoEfecto)
    const r = ACCIONES[tipo]?.(est, quienId, datos);
    if (r && !r.ok) mostrar(r.error, 'error');
    setVer((x) => x + 1);
  };
  return (
    <div className="cxp-contenedor qq-en-partida" key={clave}>
      {aviso && <p className={`cxp-toast ${aviso.tipo}`} role="alert" onClick={() => setAviso(null)}>{aviso.texto}</p>}
      <section className="game cxp-escena">
        <PantallaJuego v={v} enviar={enviar} onSalir={() => setModal(true)} />
      </section>
      {v.yo.avisos.length > 0 && <AvisoEfecto avisos={v.yo.avisos} onVisto={(n) => { E.visto(est, quienId, n); setVer((x) => x + 1); }} />}
      {salir}
    </div>
  );
}
