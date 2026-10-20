// client/src/games/Fundadores/FundadoresLocal.jsx
import React, { useRef, useState } from 'react';
import Icon from './IconoF.jsx';
import * as E from './engine.js';
import { PantallaDeFase, PantallaFin, Ayuda, Registro } from './Vistas.jsx';
import './Fundadores.css';
import '../Adivina/Adivina.css';

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
        
        <div className="panel fd-center" style={{ position: 'relative', padding: '2.4rem 1.6rem 2rem' }}>
          {/* Botón ? blanco puro */}
          <button
            type="button"
            onClick={() => setModalAyuda(true)}
            title="Reglas del juego"
            style={{
              position: 'absolute',
              top: '1.1rem',
              right: '1.1rem',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1.5px solid #c7d2fe',
              background: '#ffffff',
              backgroundImage: 'none',
              color: '#4338ca',
              fontSize: '1.2rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.15)',
              padding: 0,
              zIndex: 5
            }}
          >
            ?
          </button>

          {/* Círculo suave con icono temático */}
          <div
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              backgroundColor: '#fff7ed',
              color: 'var(--g1, #ea580c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.1rem auto',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.12)'
            }}
          >
            <Icon name="landmark" size={38} strokeWidth={2} />
          </div>

          <h1 className="title" style={{ margin: '0 0 0.6rem 0' }}>Fundadores</h1>
          <p className="hint" style={{ maxWidth: '540px', margin: '0 auto 1.6rem auto', lineHeight: '1.45' }}>
            Pasaos el móvil: cada uno elige su oficio en secreto y juega su turno cuando se le llame. De 3 a 7 jugadores.
          </p>

          <div className="fd-nombres" style={{ textAlign: 'left', maxWidth: '480px', margin: '0 auto' }}>
            {nombres.map((n, i) => (
              <div key={i} className="fd-nombre-fila">
                <input type="text" placeholder={`Jugador ${i + 1}`} value={n} maxLength={20} onChange={(e) => setNombres((l) => l.map((x, k) => (k === i ? e.target.value : x)))} />
                {nombres.length > E.AJUSTES.min && <button type="button" className="secondary danger" onClick={() => setNombres((l) => l.filter((_, k) => k !== i))}><Icon name="x" size={16} /></button>}
              </div>
            ))}
            {nombres.length < E.AJUSTES.max && <button type="button" className="secondary" onClick={() => setNombres((l) => [...l, ''])}><Icon name="users" size={18} /> Añadir jugador</button>}
          </div>
          {error && <p className="error" style={{ marginTop: '.8rem' }}>{error}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', maxWidth: '480px', margin: '1.4rem auto 0 auto' }}>
            <button type="button" className="big full" onClick={empezar}><Icon name="play" size={22} /> ¡A construir!</button>
            <button type="button" className="secondary full" onClick={onVolver}>Volver</button>
          </div>
        </div>
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