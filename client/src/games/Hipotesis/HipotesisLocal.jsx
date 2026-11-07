// client/src/games/Hipotesis/HipotesisLocal.jsx
// Modo de un solo dispositivo: el móvil pasa de mano en mano para formular hipótesis y apostar en secreto.
import React, { useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { PantallaDeFase, PantallaFin, Ayuda, Marcador, Resolucion } from './Vistas.jsx';
import './Hipotesis.css';
import { SelectorJugadores, BloqueConfig } from '../../components/MenuJuego.jsx';

export default function HipotesisLocal({ onVolver }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(['', '', '']);
  const [rondas, setRondas] = useState(E.CONFIG_DEFECTO.rondas);
  const [error, setError] = useState('');
  const [ayuda, setAyuda] = useState(false);
  const estRef = useRef(null);
  const [, setVer] = useState(0);
  const [confirmado, setConfirmado] = useState(null);
  const refrescar = () => setVer((x) => x + 1);

  const empezar = () => {
    const limpios = nombres.map((n) => n.trim());
    if (limpios.some((n) => !n)) return setError('Todos los jugadores necesitan un nombre.');
    if (new Set(limpios.map((n) => n.toLowerCase())).size !== limpios.length) return setError('Hay nombres repetidos.');
    setError('');
    estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), { rondas });
    setConfirmado(null); setPaso('juego');
    return undefined;
  };
  const est = estRef.current;

  if (paso === 'config') {
    return (
      <div className="hp-wrap">
        {ayuda && <Ayuda onCerrar={() => setAyuda(false)} />}
        <SelectorJugadores
          onVolver={onVolver}
          onAyuda={() => setAyuda(true)}
          min={E.AJUSTES.min}
          max={E.AJUSTES.max}
          numJugadores={nombres.length}
          onCambiarNum={(n) => setNombres((l) => (n > l.length ? [...l, ...Array(n - l.length).fill('')] : l.slice(0, n)))}
          nombres={nombres}
          onNombre={(i, valor) => setNombres((l) => l.map((x, k) => (k === i ? valor : x)))}
          onEmpezar={empezar}
          textoBoton="¡Empezar el congreso!"
          error={error}
        >
          <BloqueConfig titulo="Número de rondas">
            <div className="qq-chips">
              {E.OPCIONES_RONDAS.map((r) => (
                <button key={r} type="button" className={`qq-chip ${rondas === r ? 'activo' : ''}`} onClick={() => setRondas(r)}>
                  {r} rondas
                </button>
              ))}
            </div>
          </BloqueConfig>
        </SelectorJugadores>
      </div>
    );
  }

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

  // Resolución: pantalla pública para todos
  if (est.fase === 'resolucion') {
    const v = E.vistaDe(est, est.jugadores[0].id);
    const vp = { ...v, yo: { ...v.yo, id: -1 } };
    return (
      <div className="hp-wrap">
        <div className="hp-top"><span className="hp-chip"><Icon name="book" size={16} /> Ronda {v.ronda}/{v.rondas}</span></div>
        <Resolucion key={v.ronda} v={vp} />
        <Marcador v={vp} />
        <button type="button" className="big full" onClick={() => { E.forzar(est); setConfirmado(null); refrescar(); }}><Icon name="forward" size={22} /> {v.ronda >= v.rondas ? 'Ver resultado final' : 'Siguiente ronda'}</button>
      </div>
    );
  }

  // Fases secretas: formular y apostar, jugador a jugador
  const quien = E.quienFalta(est)[0];
  const clave = `${est.ronda}-${est.fase}-${quien.id}`;
  if (confirmado !== clave) {
    return (
      <div className="hp-wrap">
        <div className="hp-pasa">
          <Icon name="users" size={44} />
          <h1>{quien.nombre}</h1>
          <p>{est.fase === 'hipotesis' ? 'Vas a formular tu hipótesis en secreto.' : 'Vas a apostar por las hipótesis de los demás.'} Que nadie más mire la pantalla.</p>
          <button type="button" className="big full" onClick={() => setConfirmado(clave)}><Icon name="eye" size={22} /> Soy {quien.nombre}</button>
        </div>
      </div>
    );
  }
  const v = E.vistaDe(est, quien.id);
  const enviar = async (tipo, datos = {}) => {
    const id = quien.id; let r;
    if (tipo === 'lupa') r = E.usarLupa(est, id, datos.m);
    else if (tipo === 'hipotesis') r = E.enviarHipotesis(est, id, datos.hipotesis);
    else if (tipo === 'apostar') r = E.apostar(est, id, { posiciones: datos.posiciones, doble: datos.doble, censura: datos.censura });
    else if (tipo === 'detectar') r = E.detectar(est, id, datos.a);
    else if (tipo === 'reaccion') r = E.reaccionar(est, id, datos.a, datos.emoji);
    setError(r && !r.ok ? r.error : '');
    // al enviar hipótesis/apuestas el jugador ya no tiene nada más que hacer: se pasa el móvil
    if (r?.ok && (tipo === 'hipotesis' || tipo === 'apostar')) setConfirmado(null);
    refrescar();
  };
  return (
    <div className="hp-wrap">
      {error && <p className="error">{error}</p>}
      <PantallaDeFase v={v} enviar={enviar} />
    </div>
  );
}
