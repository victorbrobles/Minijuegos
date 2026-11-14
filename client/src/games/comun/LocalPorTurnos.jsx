// client/src/games/comun/LocalPorTurnos.jsx
// Modo «un solo dispositivo» común para juegos con motor propio (Dragón, Subasta, Patata, Pirámides…).
// El motor dice a quién le toca usar el móvil en privado (`turnoLocal`); entonces aparece «Pasa el móvil a…» y,
// tras confirmarlo, su pantalla privada. Si no le toca a nadie, se ve la pantalla común de la mesa.
//
// Motor: crearPartida(jugadores, items, reglas, ahora) · vistaDe(p, id, ahora) · accion(p, id, d, ahora)
//        tick(p, ahora) · turnoLocal(p) → id | null · pausar?(p, bool) (relojes que se paran mientras se pasa el móvil)
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';
import { TurnoDe, PantallaFin, ModalSalir, useLatido } from '../Pulsador/Vistas.jsx';
import { limitesLocal } from '../limites.js';

export default function LocalPorTurnos({ juego, E, onVolver, onExit, onAbrirAyuda }) {
  const LIM = limitesLocal(juego.id);
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(() => Array(LIM.min).fill(''));
  const [config, setConfig] = useState({ ...juego.config });
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState(null);
  const [modal, setModal] = useState(false);
  const [confirmado, setConfirmado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const est = useRef(null);
  const [, setVer] = useState(0);
  const refrescar = () => setVer((x) => x + 1);
  useLatido(juego.tiempoReal ? 250 : 100000);

  const empezar = async () => {
    const limpios = nombres.map((n) => n.trim());
    if (limpios.some((n) => !n)) return setError('Todos los jugadores necesitan un nombre.');
    if (new Set(limpios.map((n) => n.toLowerCase())).size !== limpios.length) return setError('Hay nombres repetidos.');
    setError(''); setCargando(true);
    try {
      const items = juego.cargarItems ? await juego.cargarItems() : [];
      est.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), items, { ...config }, Date.now());
      setConfirmado(null); setPaso('juego');
    } catch (e) { setError(e.message || 'No se pudo preparar la partida.'); } finally { setCargando(false); }
    return undefined;
  };

  const p = est.current;
  if (p && paso === 'juego') E.tick(p, Date.now());
  const quien = p && paso === 'juego' && p.fase !== 'fin' ? E.turnoLocal(p) : null;
  const tapado = quien != null && confirmado !== quien;
  useEffect(() => { if (p && E.pausar) E.pausar(p, tapado, Date.now()); }, [tapado, p]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (quien == null) setConfirmado(null); }, [quien]);

  if (paso === 'config') {
    return (
      <div className={`pzp-contenedor ${juego.id}`}>
        <SelectorJugadores onVolver={onVolver} onAyuda={onAbrirAyuda} min={LIM.min} max={LIM.max} numJugadores={nombres.length}
          onCambiarNum={(n) => setNombres((l) => (n > l.length ? [...l, ...Array(n - l.length).fill('')] : l.slice(0, n)))}
          nombres={nombres} onNombre={(i, valor) => setNombres((l) => l.map((x, k) => (k === i ? valor : x)))}
          onEmpezar={empezar} textoBoton={cargando ? 'Preparando…' : juego.textoEmpezar || '¡Empezar!'} puedeEmpezar={!cargando} error={error}>
          {juego.Config && <juego.Config juego={juego} config={config} onCambiar={(c) => setConfig((x) => ({ ...x, ...c }))} />}
        </SelectorJugadores>
      </div>
    );
  }

  const mostrar = (t) => { setAviso(t); setTimeout(() => setAviso(null), 3000); };
  const enviarComo = (id) => (tipo, d = {}) => {
    const r = E.accion(p, id, { ...d, tipo }, Date.now());
    if (r && !r.ok && r.error) mostrar(r.error);
    refrescar();
    return r;
  };
  const salir = () => setModal(true);
  const envoltorio = (c) => (
    <div className={`pzp-contenedor ${juego.id} qq-en-partida`}>
      {aviso && <p className="pzp-toast" role="alert">{aviso}</p>}
      <section className="game pzp-escena">{c}</section>
      {modal && <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso." onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />}
    </div>
  );

  if (p.fase === 'fin') {
    const Fin = juego.Fin || PantallaFin;
    return envoltorio(
      <Fin v={E.vistaDe(p, -1, Date.now())} juego={juego} onSalir={salir}>
        <div className="pzp-barra estatica">
          <button type="button" className="pzp-boton grande" onClick={() => setPaso('config')}><Icon name="refresh" size={20} /> Nueva partida</button>
          <button type="button" className="pzp-boton secundario" onClick={() => onExit?.()}><Icon name="door" size={18} /> Salir a la portada</button>
        </div>
      </Fin>
    );
  }
  if (tapado) {
    const v = E.vistaDe(p, -1, Date.now());
    return envoltorio(
      <TurnoDe v={v} id={quien} puedo local juego={juego} onSalir={salir} onListo={() => setConfirmado(quien)}
        texto={juego.textoPasar?.(v, quien) || 'Que nadie más mire la pantalla.'} boton={`Soy ${v.jugadores.find((j) => j.id === quien)?.nombre}`} />
    );
  }
  const id = quien ?? -1;
  return envoltorio(<juego.Partida v={E.vistaDe(p, id, Date.now())} enviar={enviarComo(quien)} onSalir={salir} local admin />);
}
