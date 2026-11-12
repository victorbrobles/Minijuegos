// client/src/games/GeoQuiz/GeoQuizLocal.jsx
// Modo un solo dispositivo: los jugadores se pasan el móvil por turnos.
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { SelectorJugadores, BloqueConfig } from '../../components/MenuJuego.jsx';
import * as E from './engine.js';
import GeoQuizPartida from './GeoQuizPartida.jsx';
import GeoQuizConfig, { configPorDefecto } from './GeoQuizConfig.jsx';
import './GeoQuiz.css';
import { limitesLocal } from '../limites.js';

const { min: MIN_JUGADORES, max: MAX_JUGADORES } = limitesLocal('geoquiz');

export default function GeoQuizLocal({ onVolver, onExit, onAbrirAyuda }) {
  const navigate = useNavigate();
  const [fase, setFase] = useState('setup'); // 'setup' | 'juego'
  const [nombres, setNombres] = useState(() => Array.from({ length: MIN_JUGADORES }, (_, i) => `Jugador ${i + 1}`));
  const [config, setConfig] = useState(configPorDefecto);
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);

  const partidaRef = useRef(null);
  const [, setVersion] = useState(0);
  const refrescar = () => setVersion((v) => v + 1);

  useEffect(() => {
    fetch('/api/geoquiz/categorias')
      .then((r) => r.json())
      .then((d) => { if (d.success) setCategorias(d.categorias); })
      .catch(() => setError('No se pudo conectar con el servidor.'));
  }, []);

  // Reloj: aplica los fines de tiempo
  useEffect(() => {
    if (fase !== 'juego') return undefined;
    const id = setInterval(() => {
      if (partidaRef.current && E.tick(partidaRef.current, Date.now())) refrescar();
    }, 250);
    return () => clearInterval(id);
  }, [fase]);

  const salirAPortada = () => {
    setModalSalir(false);
    if (typeof onExit === 'function') onExit();
    else {
      try {
        navigate('/');
      } catch {
        window.location.href = '/';
      }
    }
  };

  const cambiarNum = (n) => {
    setNombres((prev) => (n > prev.length
      ? [...prev, ...Array.from({ length: n - prev.length }, (_, i) => `Jugador ${prev.length + i + 1}`)]
      : prev.slice(0, n)));
  };

  const empezar = async () => {
    setError('');
    setCargando(true);
    try {
      const cat = config.modo === 'especialista' ? `?categoria=${encodeURIComponent(config.categoria)}` : '';
      const r = await fetch(`/api/geoquiz/preguntas${cat}`);
      const d = await r.json();
      if (!d.success || !d.preguntas?.length) throw new Error();
      const jugadores = nombres.map((n, i) => ({ id: i + 1, nombre: n.trim() || `Jugador ${i + 1}` }));
      partidaRef.current = E.crearPartida(jugadores, d.preguntas, { modo: config.modo, rondas: config.rondas });
      setFase('juego');
      refrescar();
    } catch {
      setError('No se pudieron cargar las preguntas. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const accion = async (tipo, datos = {}) => {
    const p = partidaRef.current;
    if (!p) return { error: 'No hay partida.' };
    const ahora = Date.now();
    const id = p.turno?.jugadorId;
    let r;
    switch (tipo) {
      case 'listo': r = E.empezarTurno(p, id, ahora); break;
      case 'responder': r = E.responder(p, id, datos.valor, ahora); break;
      case 'enumerar': r = E.enumerar(p, id, datos.texto, ahora); break;
      case 'pista': r = E.pedirPista(p, id, ahora); break;
      case 'plantarse': r = E.plantarse(p, id, ahora); break;
      case 'continuar': r = E.continuar(p, ahora); break;
      case 'saltar-turno': r = E.saltarTurno(p, ahora); break;
      case 'finalizar': r = E.finalizar(p); break;
      default: r = { error: 'Acción desconocida.' };
    }
    refrescar();
    return r;
  };

  const enPartida = fase === 'juego';

  return (
    <div className={`gq-contenedor ${enPartida ? 'qq-en-partida' : ''}`}>
      {fase === 'setup' && (
        <SelectorJugadores
          onVolver={onVolver}
          onAyuda={onAbrirAyuda}
          min={MIN_JUGADORES}
          max={MAX_JUGADORES}
          numJugadores={nombres.length}
          onCambiarNum={cambiarNum}
          nombres={nombres}
          onNombre={(i, v) => setNombres((prev) => prev.map((x, k) => (k === i ? v : x)))}
          onEmpezar={empezar}
          puedeEmpezar={!cargando && categorias.length > 0}
          textoBoton={cargando ? 'Preparando preguntas…' : '¡Empezar GeoQuiz!'}
          error={error}
        >
          <BloqueConfig>
            <GeoQuizConfig config={config} onCambiar={setConfig} categorias={categorias} />
          </BloqueConfig>
        </SelectorJugadores>
      )}

      {fase === 'juego' && partidaRef.current && (
        <GeoQuizPartida
          local
          partida={E.vista(partidaRef.current, Date.now())}
          onAccion={accion}
          onSalir={() => setModalSalir(true)}
          finPartida={(
            <>
              <button type="button" className="gq-boton grande" onClick={empezar}>
                <Icon name="refresh" size={20} /> Revancha
              </button>
              <button type="button" className="gq-enlace" onClick={() => setFase('setup')}>
                <Icon name="settings" size={16} /> Cambiar jugadores o modo
              </button>
            </>
          )}
        />
      )}

      {modalSalir && (
        <div className="rg-modal-fondo" onClick={() => setModalSalir(false)}>
          <div className="rg-modal gq-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gq-modal-icono">🚪</div>
            <h3>¿Salir a la portada?</h3>
            <p className="hint">Se perderá la partida actual.</p>
            <div className="gq-fila">
              <button type="button" className="gq-boton secundario" onClick={() => setModalSalir(false)}>Seguir jugando</button>
              <button type="button" className="gq-boton peligro" onClick={salirAPortada}>Salir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
