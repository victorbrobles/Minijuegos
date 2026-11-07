// client/src/games/Fundadores/FundadoresLocal.jsx
import React, { useRef, useState } from 'react';
import Icon from './IconoF.jsx';
import * as E from './engine.js';
import { PantallaDeFase, PantallaFin, Ayuda, Registro } from './Vistas.jsx';
import './Fundadores.css';
import '../Adivina/Adivina.css';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';

export default function FundadoresLocal({ onVolver }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(['', '', '']);
  const [error, setError] = useState('');
  const [modalAyuda, setModalAyuda] = useState(false);
  const estRef = useRef(null);
  const [, setVer] = useState(0);
  const [confirmado, setConfirmado] = useState(null);
  const refrescar = () => setVer((x) => x + 1);

  const empezar = () => {
    const limpios = nombres.map((n) => n.trim());
    if (limpios.some((n) => !n)) return setError('Todos los jugadores necesitan un nombre.');
    if (new Set(limpios.map((n) => n.toLowerCase())).size !== limpios.length) return setError('Hay nombres repetidos.');
    setError('');
    estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })));
    setConfirmado(null);
    setPaso('juego');
  };
  const est = estRef.current;

  if (paso === 'config') {
    return (
      <div className="fd-wrap">
        {modalAyuda && <Ayuda onCerrar={() => setModalAyuda(false)} />}
        <SelectorJugadores
          onVolver={onVolver}
          onAyuda={() => setModalAyuda(true)}
          min={E.AJUSTES.min}
          max={E.AJUSTES.max}
          numJugadores={nombres.length}
          onCambiarNum={(n) => setNombres((l) => (n > l.length ? [...l, ...Array(n - l.length).fill('')] : l.slice(0, n)))}
          nombres={nombres}
          onNombre={(i, valor) => setNombres((l) => l.map((x, k) => (k === i ? valor : x)))}
          onEmpezar={empezar}
          textoBoton="¡A construir!"
          error={error}
        />
      </div>
    );
  }

  // ---- fin
  if (est.fase === 'fin') {
    const v = E.vistaDe(est, est.jugadores[0].id);
    return (
      <PantallaFin v={{ ...v, yo: { ...v.yo, id: -1 } }}>
        <div className="actions">
          <button type="button" className="big full" onClick={() => setPaso('config')}><Icon name="refresh" size={22} /> Nueva partida</button>
          <button type="button" className="secondary full" onClick={onVolver}>Salir</button>
        </div>
      </PantallaFin>
    );
  }

  const quien = est.fase === 'elegir'
    ? est.jugadores.find((j) => !j.fuera && !est.elecciones[j.id])
    : est.jugadores.find((j) => j.id === est.turno.jugadorId);
  const clave = est.fase === 'elegir' ? `${est.ronda}-e-${quien.id}` : `${est.ronda}-t-${est.paso}-${quien.id}`;

  if (confirmado !== clave) {
    const v = E.vistaDe(est, quien.id);
    const texto = est.fase === 'elegir'
      ? 'Vas a elegir tu oficio en secreto. Que nadie más mire la pantalla.'
      : `Es el turno del ${E.nombreRol(est.turno.rol)}. Estás jugando tú.`;
    return (
      <div className="fd-wrap">
        <div className="fd-pasa">
          <Icon name="users" size={44} />
          <h1>{quien.nombre}</h1>
          <p>{texto}</p>
          <button type="button" className="big full" onClick={() => setConfirmado(clave)}><Icon name="eye" size={22} /> Soy {quien.nombre}</button>
        </div>
        <Registro v={v} abierto />
      </div>
    );
  }

  const v = E.vistaDe(est, quien.id);
  const enviar = async (tipo, datos = {}) => {
    const id = quien.id; let r;
    if (tipo === 'elegir-rol') r = E.elegirRol(est, id, datos.rol);
    else if (tipo === 'basica') r = E.basica(est, id, datos.basica);
    else if (tipo === 'pendiente') r = E.elegirPendiente(est, id, datos.uid);
    else if (tipo === 'habilidad') r = E.habilidad(est, id, datos.params);
    else if (tipo === 'construir') r = E.construir(est, id, datos.uid);
    else if (tipo === 'terminar') r = E.terminarTurno(est, id);
    setError(r && !r.ok ? r.error : '');
    refrescar();
  };
  return (
    <div className="fd-wrap">
      {error && <p className="error">{error}</p>}
      <PantallaDeFase v={v} enviar={enviar} />
    </div>
  );
}