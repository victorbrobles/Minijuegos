// client/src/games/UnoADiez/UnoADiezLocal.jsx
// Un solo dispositivo: el móvil pasa del que da la pista al que adivina; las pistas se dicen en voz alta.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { Partida, Config } from './Partida.jsx';
import { PantallaFin, ModalSalir } from '../Pulsador/Vistas.jsx';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';

export default function UnoADiezLocal({ juego, onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(['', '', '']);
  const [config, setConfig] = useState(juego.config);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modal, setModal] = useState(false);
  const estRef = useRef(null);
  const [, setVer] = useState(0);
  const refrescar = () => setVer((x) => x + 1);

  useEffect(() => {
    if (paso !== 'juego') return undefined;
    const i = setInterval(() => { if (estRef.current && E.tick(estRef.current, Date.now())) refrescar(); }, 150);
    return () => clearInterval(i);
  }, [paso]);

  const empezar = async () => {
    const limpios = nombres.map((n) => n.trim());
    if (limpios.some((n) => !n)) return setError('Todos los jugadores necesitan un nombre.');
    if (new Set(limpios.map((n) => n.toLowerCase())).size !== limpios.length) return setError('Hay nombres repetidos.');
    setError(''); setCargando(true);
    try {
      const r = await fetch('/api/unoadiez/categorias');
      const d = await r.json();
      if (!d.success) throw new Error();
      estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), d.categorias, { vueltas: config.vueltas, local: true }, Date.now());
      setPaso('juego');
    } catch {
      setError('No se ha podido preparar la partida. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
    return undefined;
  };

  if (paso === 'config') {
    return (
      <div className={`pzp-contenedor ${juego.id}`}>
        <SelectorJugadores
          onVolver={onVolver} onAyuda={onAbrirAyuda} min={E.AJUSTES.min} max={E.AJUSTES.max}
          numJugadores={nombres.length}
          onCambiarNum={(n) => setNombres((l) => (n > l.length ? [...l, ...Array(n - l.length).fill('')] : l.slice(0, n)))}
          nombres={nombres}
          onNombre={(i, valor) => setNombres((l) => l.map((x, k) => (k === i ? valor : x)))}
          onEmpezar={empezar} textoBoton={cargando ? 'Preparando…' : '¡Empezar partida!'} error={error}
        >
          <Config config={config} onCambiar={(c) => setConfig((x) => ({ ...x, ...c }))} />
        </SelectorJugadores>
      </div>
    );
  }

  const est = estRef.current;
  const v = { ...E.vistaDe(est, -1), yo: null };
  const enviar = (tipo, d = {}) => {
    const t = Date.now();
    if (tipo === 'pista') E.darPista(est, null, '', t);
    else if (tipo === 'otra') E.otraPista(est, null, t);
    else if (tipo === 'adivinar') E.adivinar(est, null, d.numero);
    else if (tipo === 'siguiente') E.siguiente(est, t);
    else if (tipo === 'terminar') E.terminar(est);
    refrescar();
  };
  const onSalir = () => setModal(true);
  return (
    <div className={`pzp-contenedor ${juego.id} qq-en-partida`}>
      <section className="game pzp-escena">
        {est.fase === 'fin' ? (
          <PantallaFin v={v} juego={juego} onSalir={onSalir}>
            <div className="pzp-barra estatica">
              <button type="button" className="pzp-boton grande" onClick={() => setPaso('config')}><Icon name="refresh" size={20} /> Nueva partida</button>
              <button type="button" className="pzp-boton secundario" onClick={() => onExit?.()}><Icon name="door" size={18} /> Salir a la portada</button>
            </div>
          </PantallaFin>
        ) : (
          <>
            <Partida v={v} enviar={enviar} onSalir={onSalir} local />
            {v.fase === 'resultado' && v.turnoN < v.turnos && (
              <div className="pzp-barra estatica">
                <button type="button" className="pzp-enlace" onClick={() => enviar('terminar')}><Icon name="flagFinish" size={15} /> Terminar la partida ya</button>
              </div>
            )}
          </>
        )}
      </section>
      {modal && (
        <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso y volverás a la portada."
          onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />
      )}
    </div>
  );
}
