// client/src/games/Director/DirectorLocal.jsx
// Un solo dispositivo: el móvil pasa de director en director para la formación, las pujas y la táctica (en secreto);
// los fichajes y la liga se ven todos juntos.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { Partida, Fin, Config } from './Partida.jsx';
import { ModalSalir, TurnoDe } from '../Pulsador/Vistas.jsx';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';
import { limitesLocal } from '../limites.js';

const LIM_JUG = limitesLocal('director');

export default function DirectorLocal({ juego, onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(() => Array(LIM_JUG.min).fill(''));
  const [config, setConfig] = useState({ presupuesto: 200, mercados: 4 });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [modal, setModal] = useState(false);
  const [confirmado, setConfirmado] = useState(null);
  const estRef = useRef(null);
  const [, setVer] = useState(0);
  const refrescar = () => setVer((x) => x + 1);

  useEffect(() => {
    if (paso !== 'juego') return undefined;
    const i = setInterval(() => { if (estRef.current && E.tick(estRef.current, Date.now())) refrescar(); }, 500);
    return () => clearInterval(i);
  }, [paso]);

  const empezar = async () => {
    const limpios = nombres.map((n) => n.trim());
    if (limpios.some((n) => !n)) return setError('Todos los jugadores necesitan un nombre.');
    if (new Set(limpios.map((n) => n.toLowerCase())).size !== limpios.length) return setError('Hay nombres repetidos.');
    setError(''); setCargando(true);
    try {
      const r = await fetch('/api/director/futbolistas');
      const d = await r.json();
      estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), d.futbolistas, config, Date.now());
      setConfirmado(null);
      setPaso('juego');
    } catch {
      setError('No se han podido cargar los futbolistas.');
    } finally {
      setCargando(false);
    }
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
          onEmpezar={empezar} textoBoton={cargando ? 'Abriendo el mercado…' : '¡Fundar los clubes!'} error={error}
        >
          <Config config={config} onCambiar={(c) => setConfig((x) => ({ ...x, ...c }))} />
        </SelectorJugadores>
      </div>
    );
  }

  const est = estRef.current;
  const humanos = est.clubes.filter((c) => !c.bot);
  const quien = ['formacion', 'mercado', 'tactica'].includes(est.fase) ? humanos.find((c) => !c.listo) || null : null;
  const salir = modal && <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso y volverás a la portada." onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />;
  const envoltorio = (c) => (
    <div className={`pzp-contenedor ${juego.id} qq-en-partida`}>
      {aviso && <p className="pzp-toast" role="alert">{aviso}</p>}
      <section className="game pzp-escena">{c}</section>
      {salir}
    </div>
  );
  const mostrar = (t) => { setAviso(t); setTimeout(() => setAviso(null), 3000); };

  if (est.fase === 'fin') {
    return envoltorio(
      <Fin v={E.vistaDe(est, -1)} onSalir={() => setModal(true)}>
        <div className="pzp-barra estatica">
          <button type="button" className="pzp-boton grande" onClick={() => setPaso('config')}><Icon name="refresh" size={20} /> Nueva temporada</button>
          <button type="button" className="pzp-boton secundario" onClick={() => onExit?.()}><Icon name="door" size={18} /> Salir a la portada</button>
        </div>
      </Fin>
    );
  }
  if (quien) {
    const clave = `${est.fase}-${est.mercado}-${quien.id}`;
    const v = E.vistaDe(est, quien.id);
    if (confirmado !== clave) {
      const vt = { ...v, jugadores: est.clubes.map((c) => ({ id: c.id, nombre: c.dueno })) };
      return envoltorio(<TurnoDe juego={juego} onSalir={() => setModal(true)} v={vt} id={quien.id} puedo onListo={() => setConfirmado(clave)} boton={`Soy ${quien.dueno}`} texto={`Pásale el móvil: ${est.fase === 'mercado' ? 'sus pujas son secretas' : est.fase === 'tactica' ? 'va a elegir táctica' : 'va a elegir formación'}.`} />);
    }
    const enviar = (tipo, d = {}) => {
      let r;
      if (tipo === 'formacion') r = E.elegirFormacion(est, quien.id, d.formacion);
      else if (tipo === 'pujar') r = E.pujar(est, quien.id, d.pujas);
      else if (tipo === 'tactica') r = E.elegirTactica(est, quien.id, d.tactica, Date.now());
      if (r && !r.ok) mostrar(r.error);
      refrescar();
    };
    return envoltorio(<Partida v={v} enviar={enviar} onSalir={() => setModal(true)} local />);
  }
  // Fichajes y liga: todos juntos (desde el primer club, sin pujas secretas a la vista)
  const v = E.vistaDe(est, -1);
  const enviar = (tipo) => {
    if (tipo === 'seguir') { E.forzar(est, Date.now()); setConfirmado(null); }
    if (tipo === 'jornada') E.avanzarJornada(est, Date.now());
    refrescar();
  };
  return envoltorio(<Partida v={v} enviar={enviar} onSalir={() => setModal(true)} local />);
}
