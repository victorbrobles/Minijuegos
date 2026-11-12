// client/src/games/SumaCero/SumaCeroLocal.jsx
// Modo «un único dispositivo»: el motor corre en el navegador y el móvil pasa de mano en mano en cada turno.
// El resultado de cada ronda se ve todos juntos.
import React, { useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import AvisoEfecto from '../../components/AvisoEfecto.jsx';
import * as E from './engine.js';
import { PantallaJuego, PantallaResultado, PantallaFin, Avatar } from './Vistas.jsx';
import { ModalSalir, SelectorRondas } from './SumaCeroOnline.jsx';
import { SelectorJugadores, BloqueConfig } from '../../components/MenuJuego.jsx';
import './SumaCero.css';
import { limitesLocal } from '../limites.js';

const LIM_JUG = limitesLocal('sumacero');

const ACCIONES = {
  robar: (est, id, d) => E.robar(est, id, d.origen),
  plantarse: (est, id) => E.plantarse(est, id),
  descartar: (est, id, d) => E.descartar(est, id, d.uid),
  especial: (est, id, d) => E.jugarEspecial(est, id, d.uid, d.params || {})
};

export default function SumaCeroLocal({ onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(() => Array(LIM_JUG.min).fill(''));
  const [rondas, setRondas] = useState(3);
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
    estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), { rondas });
    setConfirmado(null);
    setPaso('juego');
    return undefined;
  };

  if (paso === 'config') {
    return (
      <div className="szp-contenedor">
        <SelectorJugadores
          onVolver={onVolver} onAyuda={onAbrirAyuda} min={LIM_JUG.min} max={LIM_JUG.max}
          numJugadores={nombres.length}
          onCambiarNum={(n) => setNombres((l) => (n > l.length ? [...l, ...Array(n - l.length).fill('')] : l.slice(0, n)))}
          nombres={nombres}
          onNombre={(i, valor) => setNombres((l) => l.map((x, k) => (k === i ? valor : x)))}
          onEmpezar={empezar} textoBoton="¡Repartir cartas!" error={error}
        >
          <BloqueConfig titulo="Número de rondas">
            <SelectorRondas valor={rondas} onCambiar={setRondas} />
          </BloqueConfig>
        </SelectorJugadores>
      </div>
    );
  }

  const est = estRef.current;
  const refrescar = () => setVer((x) => x + 1);
  const salir = modal && (
    <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso y volverás a la portada." onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />
  );
  const mostrar = (texto) => { setAviso(texto); clearTimeout(avisoTimer.current); avisoTimer.current = setTimeout(() => setAviso(null), 3000); };
  const previo = enManoRef.current;
  const avisosPrevio = previo != null ? (est.avisos?.[previo] || []) : [];
  const envoltorio = (contenido, conAvisoPrevio = true) => (
    <div className="szp-contenedor qq-en-partida">
      {aviso && <p className="szp-toast" role="alert" onClick={() => setAviso(null)}>{aviso}</p>}
      <section className="game szp-escena">{contenido}</section>
      {conAvisoPrevio && avisosPrevio.length > 0 && (
        <AvisoEfecto avisos={avisosPrevio} nombre={est.jugadores.find((j) => j.id === previo)?.nombre}
          onVisto={(n) => { E.visto(est, previo, n); refrescar(); }} />
      )}
      {salir}
    </div>
  );

  if (est.fase === 'fin') {
    return envoltorio(
      <PantallaFin v={{ ...E.vistaDe(est, -1), yo: null }} onSalir={() => setModal(true)}>
        <div className="szp-barra estatica">
          <button type="button" className="szp-boton grande" onClick={() => setPaso('config')}><Icon name="refresh" size={20} /> Nueva partida</button>
        </div>
      </PantallaFin>
    );
  }

  if (est.fase === 'resultado') {
    const v = { ...E.vistaDe(est, -1), yo: null };
    return envoltorio(
      <PantallaResultado v={v} local onSalir={() => setModal(true)}
        enviar={() => { est.jugadores.filter((j) => !j.fuera).forEach((j) => E.continuar(est, j.id)); setConfirmado(null); refrescar(); }} />
    );
  }

  const quienId = est.turno.jugadorId;
  const quien = est.jugadores.find((j) => j.id === quienId);
  const clave = `${est.ronda}-${est.nlog}-${quienId}-${est.turno.paso === 'robar' ? 'r' : 'j'}`;
  const claveTurno = `${est.ronda}-${quienId}-${est.ronda * 1000 + est.log.filter((l) => l.texto.includes(quien.nombre)).length}`;
  if (confirmado === null || !confirmado.startsWith(`${est.ronda}-${quienId}-`)) {
    const v = E.vistaDe(est, -1);
    return envoltorio(
      <>
        <div className="szp-tarjeta szp-gate">
          <Avatar id={quien.id} nombre={quien.nombre} grande />
          <p className="szp-etiqueta centrada">Pasa el móvil · ronda {est.ronda}{est.plantado != null ? ' · ¡último turno!' : ''}</p>
          <h2>Le toca a {quien.nombre}</h2>
          <p className="szp-texto">Su mano es secreta: que nadie más mire.</p>
          <button type="button" className="szp-boton grande" onClick={() => setConfirmado(claveTurno)}><Icon name="eye" size={20} /> Soy {quien.nombre}</button>
          <button type="button" className="szp-enlace oscuro" style={{ marginTop: '0.6rem' }} onClick={() => setModal(true)}>Salir de la partida</button>
        </div>
        {v.log.length > 0 && (
          <div className="szp-tarjeta">
            <p className="szp-etiqueta">📖 Lo último que ha pasado</p>
            <div className="szp-log">{[...v.log].slice(-6).reverse().map((l) => <p key={l.n}>{l.texto}</p>)}</div>
          </div>
        )}
      </>
    );
  }

  const v = E.vistaDe(est, quienId);
  enManoRef.current = quienId;
  const enviar = (tipo, datos = {}) => {
    enManoRef.current = quienId;
    const r = ACCIONES[tipo]?.(est, quienId, datos);
    if (r && !r.ok) mostrar(r.error);
    // al acabar el turno (cambia de jugador) se vuelve a pedir que se pase el móvil
    if (est.turno?.jugadorId !== quienId) setConfirmado(null);
    refrescar();
  };
  return envoltorio(
    <>
      <PantallaJuego key={clave} v={v} enviar={enviar} onSalir={() => setModal(true)} />
      {v.yo.avisos.length > 0 && <AvisoEfecto avisos={v.yo.avisos} onVisto={(n) => { E.visto(est, quienId, n); refrescar(); }} />}
    </>,
    false
  );
}
