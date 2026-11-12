// client/src/games/OnceFantasma/OnceFantasmaLocal.jsx
// Un solo dispositivo: antes de cada turno, pantalla para pasar el móvil; en el rebote, el grupo dice los que faltan
// y quien escribe elige a quién se le apunta. Sin reloj de turno (cada uno se planta cuando quiere).
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { Partida, Fin, Config } from './Partida.jsx';
import { ModalSalir, TurnoDe } from '../Pulsador/Vistas.jsx';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';
import { limitesLocal } from '../limites.js';

const LIM_JUG = limitesLocal('oncefantasma');

export default function OnceFantasmaLocal({ juego, onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(() => Array(LIM_JUG.min).fill(''));
  const [config, setConfig] = useState({ onces: 1, segundos: 180 });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modal, setModal] = useState(false);
  const [quien, setQuien] = useState(null);
  const [confirmado, setConfirmado] = useState(null);
  const estRef = useRef(null);
  const [, setVer] = useState(0);
  const refrescar = () => setVer((x) => x + 1);

  // El reloj destapa pistas también en un dispositivo (solo con el turno ya empezado)
  useEffect(() => {
    if (paso !== 'juego') return undefined;
    const t = setInterval(() => {
      const est = estRef.current;
      if (est?.fase === 'turno' && confirmado === `t${est.ronda}`) { E.tick(est, Date.now()); refrescar(); }
    }, 1000);
    return () => clearInterval(t);
  }, [paso, confirmado]);

  const empezar = async () => {
    const limpios = nombres.map((n) => n.trim());
    if (limpios.some((n) => !n)) return setError('Todos los jugadores necesitan un nombre.');
    if (new Set(limpios.map((n) => n.toLowerCase())).size !== limpios.length) return setError('Hay nombres repetidos.');
    setError(''); setCargando(true);
    try {
      const r = await fetch(`/api/oncefantasma/local?n=${Math.ceil((limpios.length * config.onces) / 2)}`);
      const d = await r.json();
      estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), d.partidos, { ...config, sinReloj: true }, Date.now());
      setConfirmado(null);
      setPaso('juego');
    } catch {
      setError('No se han podido cargar las alineaciones.');
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
          onEmpezar={empezar} textoBoton={cargando ? 'Buscando los onces…' : '¡Saltar al campo!'} error={error}
        >
          <Config config={config} onCambiar={(c) => setConfig((x) => ({ ...x, ...c }))} />
        </SelectorJugadores>
      </div>
    );
  }

  const est = estRef.current;
  const salir = modal && <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso y volverás a la portada." onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />;
  const envoltorio = (c) => (
    <div className={`pzp-contenedor ${juego.id} qq-en-partida`}>
      <section className="game pzp-escena">{c}</section>
      {salir}
    </div>
  );
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
  const v = E.vistaDe(est, est.fase === 'turno' ? est.turnos[est.ronda - 1].jugador : -1);
  // Pantallas intermedias: antes del turno de cada uno y antes del rebote
  if (est.fase === 'turno' && confirmado !== `t${est.ronda}`) {
    const t = est.turnos[est.ronda - 1];
    return envoltorio(
      <TurnoDe v={v} id={t.jugador} puedo boton={`Soy ${v.jugadores.find((j) => j.id === t.jugador).nombre}`}
        onListo={() => { est.proximaPista = Date.now() + E.AJUSTES.segPista * 1000; setConfirmado(`t${est.ronda}`); }}
        texto={`Pásale el móvil: va a reconstruir el once de ${t.equipo} (${t.partido}).`} />
    );
  }
  if (est.fase === 'rebote' && confirmado !== `r${est.ronda}`) {
    const t = est.turnos[est.ronda - 1];
    const faltan = est.huecos.filter((h) => !h.por).length;
    return envoltorio(
      <div className="pzp-tarjeta pzp-gate ofx-gate-rebote">
        <p className="pzp-etiqueta centrada">Rebote</p>
        <span className="ofx-gate-emoji">🔁</span>
        <h2>¡A {v.jugadores.find((j) => j.id === t.jugador).nombre} le faltan {faltan}!</h2>
        <p className="pzp-texto">Poned el móvil en el centro: los demás podéis decir los futbolistas que faltan (valen menos puntos). Quien escribe elige a quién se le apunta.</p>
        <button type="button" className="pzp-boton grande" onClick={() => { setQuien(est.jugadores.find((j) => !j.fuera && j.id !== t.jugador)?.id ?? null); setConfirmado(`r${est.ronda}`); }}><Icon name="play" size={20} /> ¡Al rebote!</button>
      </div>
    );
  }
  const enviar = (tipo, d = {}) => {
    const ahora = Date.now();
    const t = est.turnos[est.ronda - 1];
    if (tipo === 'adivinar') {
      const id = est.fase === 'turno' ? t.jugador : d.jugador;
      if (!id) return;
      E.adivinar(est, id, d.texto, ahora);
      if (est.fase === 'rebote' || est.fase === 'resultado') est.ultimoLocal = est.ultimos[id];
    } else if (tipo === 'pista') E.pista(est, Math.random, ahora);
    else if (tipo === 'plantarse') E.plantarse(est, t.jugador, ahora);
    else if (tipo === 'cerrarRebote') E.pasarRebote(est, null);
    else if (tipo === 'siguiente') E.siguiente(est, ahora);
    else if (tipo === 'terminar') E.terminar(est);
    refrescar();
  };
  // En el rebote, los avisos de acierto/fallo son los del último que ha dicho algo
  const vista = est.fase === 'rebote' ? { ...v, yo: { id: -1, puedo: true, ultimo: est.ultimoLocal || null } } : v;
  return envoltorio(<Partida v={vista} enviar={enviar} onSalir={() => setModal(true)} local jugadorLocal={quien} onJugador={setQuien} />);
}
