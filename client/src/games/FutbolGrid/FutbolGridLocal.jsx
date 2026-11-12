// client/src/games/FutbolGrid/FutbolGridLocal.jsx
// Modo «un único dispositivo»: dos equipos con el móvil en la mesa. El equipo en turno elige casilla y escribe
// el futbolista. Mismo motor que el online; el grid (con respuestas) se pide al servidor.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { PantallaJuego, PantallaFin, ModalSalir } from './Vistas.jsx';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';
import './FutbolGrid.css';
import { limitesLocal } from '../limites.js';
import { SelectorRondas } from '../../components/MenuJuego.jsx';
import { rondasPorDefecto, totalRondas } from '../rondas.js';

const LIM_JUG = limitesLocal('futbolgrid');

export default function FutbolGridLocal({ onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(() => Array(LIM_JUG.min).fill(''));
  const [error, setError] = useState('');
  const [errorJuego, setErrorJuego] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modal, setModal] = useState(false);
  const [victorias, setVictorias] = useState({ X: 0, O: 0, empates: 0 });
  const [rondasSel, setRondasSel] = useState(rondasPorDefecto('futbolgrid'));
  const maxPartidas = totalRondas('futbolgrid', rondasSel);
  const jugadas = victorias.X + victorias.O + victorias.empates;
  const estRef = useRef(null);
  const contado = useRef(false);
  const empieza = useRef('O');
  const [, setVer] = useState(0);
  const refrescar = () => setVer((x) => x + 1);

  useEffect(() => {
    if (paso !== 'juego') return undefined;
    const i = setInterval(() => { if (estRef.current) { E.tick(estRef.current, Date.now()); refrescar(); } }, 300);
    return () => clearInterval(i);
  }, [paso]);

  const nuevaPartida = async (limpios) => {
    setCargando(true);
    try {
      const r = await fetch('/api/futbolgrid/grid');
      const d = await r.json();
      if (!d.success) throw new Error();
      empieza.current = empieza.current === 'X' ? 'O' : 'X';
      estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), d.grid, empieza.current);
      contado.current = false;
      setErrorJuego('');
      setPaso('juego');
    } catch {
      setError('No se ha podido cargar el tablero. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const empezar = () => {
    const limpios = nombres.map((n) => n.trim());
    if (limpios.some((n) => !n)) return setError('Todos los jugadores necesitan un nombre.');
    if (new Set(limpios.map((n) => n.toLowerCase())).size !== limpios.length) return setError('Hay nombres repetidos.');
    setError('');
    setVictorias({ X: 0, O: 0, empates: 0 });
    nuevaPartida(limpios);
    return undefined;
  };

  if (paso === 'config') {
    return (
      <div className="fgp-contenedor">
        <SelectorJugadores
          onVolver={onVolver} onAyuda={onAbrirAyuda} min={LIM_JUG.min} max={LIM_JUG.max}
          numJugadores={nombres.length}
          onCambiarNum={(n) => setNombres((l) => (n > l.length ? [...l, ...Array(n - l.length).fill('')] : l.slice(0, n)))}
          nombres={nombres}
          onNombre={(i, valor) => setNombres((l) => l.map((x, k) => (k === i ? valor : x)))}
          onEmpezar={empezar} textoBoton={cargando ? 'Cargando…' : '¡Empezar partida!'} error={error}
        >
          <SelectorRondas juegoId="futbolgrid" valor={rondasSel} onCambiar={setRondasSel} />
          <p className="fgp-nota-sala oscura">Los jugadores se reparten alternos: 1.º, 3.º… al equipo Azul ✕ y 2.º, 4.º… al Rojo ◯.</p>
        </SelectorJugadores>
      </div>
    );
  }

  const est = estRef.current;
  const v = E.vistaDe(est, -1);
  if (est.fase === 'fin' && !contado.current) {
    contado.current = true;
    const g = est.fin.ganador;
    setTimeout(() => setVictorias((x) => (g ? { ...x, [g]: x[g] + 1 } : { ...x, empates: x.empates + 1 })), 0);
  }
  const enviar = (tipo, datos = {}) => {
    const ahora = Date.now();
    let r;
    if (tipo === 'casilla') r = E.elegirCasilla(est, null, datos.celda, ahora);
    else if (tipo === 'cancelar') r = E.cancelarCasilla(est, null);
    else if (tipo === 'responder') r = E.responder(est, null, datos.respuesta, ahora);
    else if (tipo === 'pasar') r = E.pasar(est, null);
    else if (tipo === 'terminar') r = E.terminar(est);
    setErrorJuego(r && !r.ok ? r.error : '');
    refrescar();
  };
  const miembros = v.jugadores.filter((j) => j.equipo === v.turno).map((j) => j.nombre).join(', ');

  return (
    <div className="fgp-contenedor qq-en-partida">
      <section className="game fgp-escena">
        {est.fase === 'fin' ? (
          <PantallaFin v={v} onSalir={() => setModal(true)}>
            <div className="fgp-tarjeta fgp-centro">
              <p className="fgp-etiqueta centrada">Marcador de la sesión</p>
              <p className="fgp-marcador-sesion"><span className="eq-X">✕ {victorias.X}</span> <small>empates {victorias.empates}</small> <span className="eq-O">{victorias.O} ◯</span></p>
            </div>
            {jugadas >= maxPartidas && (
              <div className="fgp-tarjeta fgp-centro">
                <p className="fgp-etiqueta centrada">🏆 Fin de la serie ({maxPartidas} {maxPartidas === 1 ? 'partida' : 'partidas'})</p>
                <h2 style={{ margin: '0.2rem 0 0' }}>{victorias.X === victorias.O ? '¡Empate en la serie!' : `¡Gana la serie el equipo ${E.EQUIPOS[victorias.X > victorias.O ? 'X' : 'O'].nombre}!`}</h2>
              </div>
            )}
            <div className="fgp-barra estatica">
              {jugadas < maxPartidas ? (
                <button type="button" className="fgp-boton grande" disabled={cargando} onClick={() => nuevaPartida(nombres.map((n) => n.trim()))}><Icon name="refresh" size={20} /> Siguiente partida ({jugadas + 1} de {maxPartidas})</button>
              ) : (
                <button type="button" className="fgp-boton grande" disabled={cargando} onClick={empezar}><Icon name="refresh" size={20} /> Jugar otra serie</button>
              )}
              <button type="button" className="fgp-boton secundario" onClick={() => setPaso('config')}><Icon name="users" size={18} /> Cambiar jugadores</button>
            </div>
          </PantallaFin>
        ) : (
          <PantallaJuego v={v} enviar={enviar} onSalir={() => setModal(true)} miEquipo error={errorJuego}
            nombreTurno={`Turno del equipo ${E.EQUIPOS[v.turno].nombre}: ${miembros}`} admin={{ esAdmin: true, atascado: false }} />
        )}
      </section>
      {modal && (
        <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso y volverás a la portada."
          onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />
      )}
    </div>
  );
}
