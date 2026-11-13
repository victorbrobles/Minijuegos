// client/src/games/Colores/ColoresLocal.jsx
// Modo «un único dispositivo»: cada jugador elige sus colores en secreto y se pasa el móvil.
import { useRegistrarPartida, ganadoresPorPuntos } from '../../lib/registros.js';
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { SelectorJugadores, BloqueConfig } from '../../components/MenuJuego.jsx';
import {
  Hero, BarraTiempo, TarjetaElemento, Paleta, ResultadoRonda, Clasificacion, Podio, ModalSalir,
  PildorasRondas, SEGUNDOS_RESPUESTA, colorJugador, inicial
} from './Pantallas.jsx';
import './Colores.css';
import { limitesLocal } from '../limites.js';

const { min: MIN_JUGADORES, max: MAX_JUGADORES } = limitesLocal('colores');

export default function ColoresLocal({ onVolver, onExit, onAbrirAyuda }) {
  const [fase, setFase] = useState('setup'); // setup | cargando | privacidad | turno | resultados | clasificacion | final
  const [modalSalir, setModalSalir] = useState(false);
  const [numJugadores, setNumJugadores] = useState(MIN_JUGADORES);
  const [nombres, setNombres] = useState(() => Array.from({ length: MAX_JUGADORES }, () => ''));
  const [rondas, setRondas] = useState(15);
  const [error, setError] = useState('');

  const [jugadores, setJugadores] = useState([]);
  const [puntos, setPuntos] = useState({});
  const [preguntas, setPreguntas] = useState([]);
  const [ronda, setRonda] = useState(1);
  const [turno, setTurno] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [seleccion, setSeleccion] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [restante, setRestante] = useState(SEGUNDOS_RESPUESTA);
  const confirmarRef = useRef(null);

  const totalRondas = Math.min(rondas, preguntas.length || rondas);
  const pregunta = preguntas[ronda - 1];
  const jugador = jugadores[turno];

  const empezar = async () => {
    const js = nombres.slice(0, numJugadores).map((n, i) => ({ id: i + 1, nombre: n.trim() || `Jugador ${i + 1}` }));
    setError('');
    setFase('cargando');
    try {
      // Arreglo: las preguntas se piden al empezar cada partida (antes se cargaban una sola vez
      // y una partida nueva repetía los mismos elementos; si aún no habían llegado, salía siempre Pikachu)
      const r = await fetch(`/api/colores/preguntas?n=${rondas}`);
      const data = await r.json();
      if (!r.ok || !data.preguntas?.length) throw new Error();
      setPreguntas(data.preguntas);
      setJugadores(js);
      setPuntos(Object.fromEntries(js.map((j) => [j.id, 0])));
      setRonda(1);
      nuevaRonda();
    } catch {
      setError('No se pudieron cargar los elementos. ¿Está arrancado el servidor?');
      setFase('setup');
    }
  };

  const nuevaRonda = () => {
    setTurno(0);
    setRespuestas({});
    setSeleccion([]);
    setResultado(null);
    setFase('privacidad');
  };

  const toggle = (id) => {
    setSeleccion((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < pregunta.numColores ? [...s, id] : s));
  };

  const confirmar = () => {
    const nuevas = { ...respuestas, [jugador.id]: seleccion };
    setRespuestas(nuevas);
    setSeleccion([]);
    if (turno + 1 < jugadores.length) {
      setTurno(turno + 1);
      setFase('privacidad');
    } else {
      cerrarRonda(nuevas);
    }
  };
  confirmarRef.current = confirmar;

  // Reloj del turno: al acabar se confirma lo que se lleve elegido
  useEffect(() => {
    if (fase !== 'turno') return undefined;
    const fin = Date.now() + SEGUNDOS_RESPUESTA * 1000;
    setRestante(SEGUNDOS_RESPUESTA);
    const id = setInterval(() => {
      const r = (fin - Date.now()) / 1000;
      if (r <= 0) { clearInterval(id); confirmarRef.current(); } else setRestante(r);
    }, 200);
    return () => clearInterval(id);
  }, [fase, turno, ronda]);

  const cerrarRonda = (resp) => {
    const correctos = new Set(pregunta.colores);
    const desglose = jugadores.map((j) => {
      const elegidos = resp[j.id] || [];
      const aciertos = elegidos.filter((c) => correctos.has(c)).length;
      return { id: j.id, jugador: j.nombre, elegidos, aciertos, pleno: aciertos === pregunta.colores.length };
    });
    setPuntos((p) => {
      const n = { ...p };
      desglose.forEach((d) => { n[d.id] = (n[d.id] ?? 0) + d.aciertos; });
      return n;
    });
    setResultado({ desglose, coloresCorrectos: pregunta.colores, item: pregunta.item });
    setFase('resultados');
  };

  const siguiente = () => {
    if (ronda >= totalRondas) { setFase('final'); return; }
    setRonda(ronda + 1);
    nuevaRonda();
  };

  const conPuntos = jugadores.map((j) => ({ ...j, puntos: puntos[j.id] ?? 0 }));
  const hero = (extra = {}) => (
    <Hero onSalir={() => setModalSalir(true)} ronda={ronda} total={totalRondas} jugadores={conPuntos} {...extra} />
  );
  const modal = modalSalir && (
    <ModalSalir
      texto="Se perderá la partida en curso y volverás a la portada."
      onSeguir={() => setModalSalir(false)}
      onSalir={() => { setModalSalir(false); onExit?.(); }}
    />
  );

  // Salón de la fama: se guarda la partida al llegar a la pantalla final
  useRegistrarPartida('colores', fase === 'final' ? ganadoresPorPuntos((conPuntos || []).filter((j) => !j.fuera && !j.abandonado).map((j) => ({ nombre: j.nombre, puntos: j.puntos ?? null }))) : null);
  if (fase === 'setup') {
    return (
      <div className="colores-contenedor">
        <SelectorJugadores
          onVolver={onVolver}
          onAyuda={onAbrirAyuda}
          min={MIN_JUGADORES}
          max={MAX_JUGADORES}
          numJugadores={numJugadores}
          onCambiarNum={(n) => setNumJugadores(Math.max(MIN_JUGADORES, Math.min(MAX_JUGADORES, n)))}
          nombres={nombres.slice(0, numJugadores)}
          onNombre={(i, v) => setNombres((ns) => ns.map((x, k) => (k === i ? v : x)))}
          onEmpezar={empezar}
          error={error}
          maxLength={20}
        >
          <BloqueConfig titulo="Número de rondas" style={{ marginTop: '1.2rem' }}>
            <PildorasRondas valor={rondas} onCambiar={setRondas} />
          </BloqueConfig>
        </SelectorJugadores>
      </div>
    );
  }

  if (fase === 'cargando' || !pregunta) {
    return (
      <div className="colores-contenedor qq-en-partida">
        <section className="game clp-escena">
          <div className="clp-tarjeta clp-cargando"><span className="clp-cargando-gotas"><i /><i /><i /></span><p>Mezclando colores…</p></div>
        </section>
      </div>
    );
  }

  return (
    <div className="colores-contenedor qq-en-partida">
      {fase === 'privacidad' && jugador && (
        <section className="game clp-escena">
          {hero({ turnoId: jugador.id, listos: Object.keys(respuestas).map(Number) })}
          <div className="clp-tarjeta clp-pasa">
            <span className="clp-pasa-avatar" style={{ '--c': colorJugador(jugador.id) }}>{inicial(jugador.nombre)}</span>
            <p className="clp-etiqueta centrada">Pasa el móvil a</p>
            <h2 className="clp-pasa-nombre">{jugador.nombre}</h2>
            <p className="clp-texto">Responde en secreto: que nadie más mire. Tendrás {SEGUNDOS_RESPUESTA} segundos.</p>
            <p className="clp-turno-num">Turno {turno + 1} de {jugadores.length}</p>
          </div>
          <div className="clp-barra">
            <button type="button" className="clp-boton grande" onClick={() => setFase('turno')}>
              <Icon name="eye" size={22} /> Soy {jugador.nombre}, ¡a jugar!
            </button>
          </div>
        </section>
      )}

      {fase === 'turno' && jugador && (
        <section className="game clp-escena">
          {hero({ turnoId: jugador.id, listos: Object.keys(respuestas).map(Number) })}
          <BarraTiempo segundos={restante} />
          <TarjetaElemento item={pregunta.item} numColores={pregunta.numColores} seleccion={seleccion} />
          <Paleta seleccion={seleccion} max={pregunta.numColores} onToggle={toggle} />
          <div className="clp-barra">
            <button type="button" className="clp-boton grande" disabled={seleccion.length !== pregunta.numColores} onClick={confirmar}>
              <Icon name="check" size={22} />
              {seleccion.length === pregunta.numColores ? 'Confirmar mis colores' : `Faltan ${pregunta.numColores - seleccion.length}`}
            </button>
          </div>
        </section>
      )}

      {fase === 'resultados' && resultado && (
        <section className="game clp-escena">
          {hero()}
          <ResultadoRonda resultado={resultado} />
          <div className="clp-barra estatica">
            <button type="button" className="clp-boton grande" onClick={() => setFase('clasificacion')}>
              <Icon name="chart" size={22} /> Ver clasificación
            </button>
          </div>
        </section>
      )}

      {fase === 'clasificacion' && resultado && (
        <section className="game clp-escena">
          {hero()}
          <Clasificacion
            jugadores={conPuntos}
            sumadas={Object.fromEntries(resultado.desglose.map((d) => [d.id, d.aciertos]))}
            subtitulo={`Tras la ronda ${ronda} de ${totalRondas}`}
          />
          <div className="clp-barra estatica">
            <button type="button" className="clp-boton grande" onClick={siguiente}>
              {ronda >= totalRondas ? <><Icon name="crown" size={22} /> Ver el podio</> : <><Icon name="play" size={22} /> Siguiente ronda</>}
            </button>
            {ronda < totalRondas && (
              <button type="button" className="clp-enlace" onClick={() => setFase('final')}>
                <Icon name="flagFinish" size={16} /> Terminar la partida aquí
              </button>
            )}
          </div>
        </section>
      )}

      {fase === 'final' && (
        <section className="game clp-escena">
          <Podio jugadores={conPuntos} />
          <Clasificacion jugadores={conPuntos} titulo="Clasificación final" />
          <div className="clp-barra estatica">
            <button type="button" className="clp-boton grande" onClick={empezar}>
              <Icon name="refresh" size={22} /> Revancha (mismos jugadores)
            </button>
            <button type="button" className="clp-enlace" onClick={() => setFase('setup')}>
              <Icon name="users" size={16} /> Cambiar jugadores
            </button>
            <button type="button" className="clp-enlace" onClick={() => onExit?.()}>
              <Icon name="home" size={16} /> Volver a la portada
            </button>
          </div>
        </section>
      )}
      {modal}
    </div>
  );
}
