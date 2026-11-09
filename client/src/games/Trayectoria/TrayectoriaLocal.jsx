// client/src/games/Trayectoria/TrayectoriaLocal.jsx
// Modo «un único dispositivo»: el móvil queda en la mesa. Quien lo sepa pulsa, se elige quién ha sido y escribe
// el nombre. Mismo motor que el online; los futbolistas se cargan aparte para no engordar la web.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { PantallaRonda, PantallaResultado, PantallaFin, Pulsador, FormRespuesta, ModalSalir, SelectorRondas, SelectorDificultad, Avatar } from './Vistas.jsx';
import { SelectorJugadores, BloqueConfig } from '../../components/MenuJuego.jsx';
import './Trayectoria.css';

const barajar = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

export default function TrayectoriaLocal({ onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(['', '']);
  const [rondas, setRondas] = useState(10);
  const [dificultad, setDificultad] = useState('mixta');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [modal, setModal] = useState(false);
  const [eligiendo, setEligiendo] = useState(false);
  const estRef = useRef(null);
  const usados = useRef(new Set());
  const [, setVer] = useState(0);
  const avisoTimer = useRef(null);
  const refrescar = () => setVer((x) => x + 1);

  useEffect(() => {
    if (paso !== 'juego') return undefined;
    const i = setInterval(() => { if (estRef.current && E.tick(estRef.current, Date.now())) refrescar(); else refrescar(); }, 250);
    return () => clearInterval(i);
  }, [paso]);
  useEffect(() => () => clearTimeout(avisoTimer.current), []);

  const mostrar = (texto, tipo = '') => { setAviso({ texto, tipo }); clearTimeout(avisoTimer.current); avisoTimer.current = setTimeout(() => setAviso(null), 3000); };

  const empezar = async () => {
    const limpios = nombres.map((n) => n.trim());
    if (limpios.some((n) => !n)) return setError('Todos los jugadores necesitan un nombre.');
    if (new Set(limpios.map((n) => n.toLowerCase())).size !== limpios.length) return setError('Hay nombres repetidos.');
    setError(''); setCargando(true);
    try {
      const { RETOS_TRAYECTORIAS } = await import('../../../../server/data/seeds/trayectoria/trayectorias.seed.js');
      const pool = RETOS_TRAYECTORIAS.filter((r) => dificultad === 'mixta' || r.dificultad === dificultad);
      let libres = pool.filter((r) => !usados.current.has(r.id));
      if (libres.length < rondas) { usados.current = new Set(); libres = pool; }
      const retos = barajar(libres).slice(0, rondas);
      retos.forEach((r) => usados.current.add(r.id));
      estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), retos, Date.now());
      setEligiendo(false);
      setPaso('juego');
    } catch {
      setError('No se han podido cargar los futbolistas. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
    return undefined;
  };

  if (paso === 'config') {
    return (
      <div className="mcp-contenedor">
        <SelectorJugadores
          onVolver={onVolver} onAyuda={onAbrirAyuda} min={E.AJUSTES.min} max={E.AJUSTES.max}
          numJugadores={nombres.length}
          onCambiarNum={(n) => setNombres((l) => (n > l.length ? [...l, ...Array(n - l.length).fill('')] : l.slice(0, n)))}
          nombres={nombres}
          onNombre={(i, valor) => setNombres((l) => l.map((x, k) => (k === i ? valor : x)))}
          onEmpezar={empezar} textoBoton={cargando ? 'Cargando…' : '¡Empezar partida!'} error={error}
        >
          <BloqueConfig titulo="Número de futbolistas">
            <SelectorRondas valor={rondas} onCambiar={setRondas} />
          </BloqueConfig>
          <BloqueConfig titulo="Dificultad">
            <SelectorDificultad valor={dificultad} onCambiar={setDificultad} />
          </BloqueConfig>
        </SelectorJugadores>
      </div>
    );
  }

  const est = estRef.current;
  const v = { ...E.vistaDe(est, -1), yo: null };
  const onSalir = () => setModal(true);
  const hacer = (fn) => { const r = fn(); if (r && !r.ok) mostrar(r.error, 'mal'); refrescar(); return r; };

  let contenido;
  if (est.fase === 'fin') {
    contenido = (
      <PantallaFin v={v} onSalir={onSalir}>
        <div className="mcp-barra estatica">
          <button type="button" className="mcp-boton grande" onClick={() => setPaso('config')}><Icon name="refresh" size={20} /> Nueva partida</button>
          <button type="button" className="mcp-boton secundario" onClick={() => onExit?.()}><Icon name="door" size={18} /> Salir a la portada</button>
        </div>
      </PantallaFin>
    );
  } else if (est.fase === 'resuelta') {
    contenido = (
      <PantallaResultado v={v} onSalir={onSalir}>
        <div className="mcp-barra estatica">
          <button type="button" className="mcp-boton grande" onClick={() => hacer(() => E.siguiente(est, Date.now()))}>
            <Icon name="play" size={20} /> {v.ronda >= v.rondas ? 'Ver resultado final' : 'Siguiente futbolista'}
          </button>
          {v.ronda < v.rondas && <button type="button" className="mcp-enlace" onClick={() => hacer(() => E.terminar(est))}><Icon name="flagFinish" size={15} /> Terminar la partida ya</button>}
        </div>
      </PantallaResultado>
    );
  } else {
    const p = v.pulsado;
    const quien = v.jugadores.find((j) => j.id === p?.jugadorId);
    const libres = v.jugadores.filter((j) => !j.fuera && !v.bloqueados.includes(j.id));
    let controles;
    if (p) {
      controles = (
        <FormRespuesta key={p.hasta} v={v} nombre={quien?.nombre}
          onEnviar={(t) => {
            const r = hacer(() => E.responder(est, p.jugadorId, t, Date.now()));
            if (r?.ok && !r.correcto) mostrar(`¡${quien?.nombre} ha fallado! Sigue la ronda.`, 'mal');
          }}
          onCancelar={() => hacer(() => E.cancelarPulsado(est, Date.now()))} />
      );
    } else if (eligiendo) {
      controles = (
        <div className="mcp-tarjeta">
          <p className="mcp-etiqueta">¿Quién ha pulsado?</p>
          <div className="mcp-quien">
            {libres.map((j) => (
              <button key={j.id} type="button" className="mcp-quien-btn" onClick={() => { setEligiendo(false); hacer(() => E.pulsar(est, j.id, Date.now())); }}>
                <Avatar id={j.id} nombre={j.nombre} /> {j.nombre}
              </button>
            ))}
          </div>
          <button type="button" className="mcp-enlace oscuro" onClick={() => { setEligiendo(false); hacer(() => E.seguir(est, Date.now())); }}>Ha sido sin querer: seguir</button>
        </div>
      );
    } else {
      controles = (
        <>
          <Pulsador deshabilitado={!libres.length} onPulsar={() => { hacer(() => E.pausar(est, Date.now())); setEligiendo(true); }} />
          <div className="mcp-barra estatica">
            <button type="button" className="mcp-enlace" onClick={() => hacer(() => E.rendirse(est))}><Icon name="flagFinish" size={15} /> Nadie lo sabe: ver la solución</button>
          </div>
        </>
      );
    }
    contenido = (
      <PantallaRonda onPista={() => hacer(() => E.desvelarPista(est, Date.now()))} v={v} onSalir={onSalir} mio={Boolean(p)}
        etiqueta={p ? `${quien?.nombre} ha pulsado` : `Futbolista ${v.ronda} de ${v.rondas}`}
        titulo={p ? `¡Escríbelo, ${quien?.nombre}!` : '¿Quién es el futbolista?'}
        controles={controles} />
    );
  }

  return (
    <div className="mcp-contenedor qq-en-partida">
      {aviso && <p className="mcp-toast" role="alert" onClick={() => setAviso(null)}>{aviso.texto}</p>}
      <section className="game mcp-escena">{contenido}</section>
      {modal && (
        <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso y volverás a la portada."
          onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />
      )}
    </div>
  );
}
