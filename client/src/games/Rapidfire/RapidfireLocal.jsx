// client/src/games/Rapidfire/RapidfireLocal.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';
import './Rapidfire.css';

const TIEMPO_S = 60;
const PREPARACION_S = 3;
const PUNTOS_POR_ACIERTO = 2;
const NUM_OPCIONES = 3;

const aleatorio = (n) => Math.floor(Math.random() * n);

function barajar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = aleatorio(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Turno({ jugador, ronda, esRebote, motivo, categoria, reto, onAcierto, onRebote, onTiempo, onRendirse }) {
  const [prep, setPrep] = useState(PREPARACION_S);
  const [restante, setRestante] = useState(TIEMPO_S);
  const alAcabarse = useRef(onTiempo);
  alAcabarse.current = onTiempo;

  useEffect(() => {
    const finPrep = Date.now() + PREPARACION_S * 1000;
    const finTurno = finPrep + TIEMPO_S * 1000;
    let avisado = false;
    const id = setInterval(() => {
      const ahora = Date.now();
      if (ahora < finPrep) {
        setPrep(Math.ceil((finPrep - ahora) / 1000));
        return;
      }
      setPrep(0);
      const r = (finTurno - ahora) / 1000;
      if (r <= 0) {
        setRestante(0);
        if (!avisado) {
          avisado = true;
          clearInterval(id);
          alAcabarse.current();
        }
        return;
      }
      setRestante(r);
    }, 100);
    return () => clearInterval(id);
  }, []);

  const preparando = prep > 0;

  return (
    <section className="game">
      {motivo && (
        <p className="rf-aviso" role="status">
          <Icon name={motivo === 'tiempo' ? 'hourglass' : 'refresh'} size={22} />
          {motivo === 'tiempo' ? '¡Se acabó el tiempo!' : '¡Rebote!'} Le toca a <strong>{jugador.nombre}</strong>
        </p>
      )}

      <div className="hud">
        <span className="chip"><Icon name="users" size={18} />{jugador.nombre}</span>
        <span className="chip alt">{esRebote ? 'Rebote' : `Ronda ${ronda}`}</span>
      </div>

      <p className="categoria"><Icon name={categoria.icono} size={16} />{categoria.nombre}</p>

      <div className="sigla-card rf-reto">
        <p className="rf-n" style={{ color: '#dc2626', fontSize: '3.5rem', fontWeight: '900', lineHeight: 1 }}>{reto.n}</p>
        <p className="rf-texto" style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: '600', marginTop: '0.5rem' }}>{reto.texto}</p>
      </div>

      <div className="timer" role="timer" aria-label="Tiempo restante">
        <div
          className={`timer-bar${!preparando && restante <= 10 ? ' low' : ''}`}
          style={{ width: `${(restante / TIEMPO_S) * 100}%` }}
        />
      </div>
      <p className="timer-text">
        <Icon name="clock" size={16} />
        {preparando ? `Preparados… ${prep}` : `${Math.ceil(restante)} s`}
      </p>

      <div className="rf-botones">
        <button className="ok" disabled={preparando} onClick={onAcierto}>
          <Icon name="check" size={22} strokeWidth={2.5} />Correcto
        </button>
        <button className="rebote" disabled={preparando} onClick={onRebote}>
          <Icon name="refresh" size={22} strokeWidth={2.5} />Rebote
        </button>
      </div>
      <button className="secondary danger full" onClick={onRendirse}>
        <Icon name="flag" size={20} />Rendirse (nadie puntúa)
      </button>
      {esRebote && <p className="previa">Rebote: el jugador debe decir las que faltan.</p>}
    </section>
  );
}

export default function RapidfireLocal({ onVolver, onExit }) {
  const navigate = useNavigate();

  const [paso, setPaso] = useState('config');
  const [modalAyuda, setModalAyuda] = useState(false);
  const [categoriasTodas, setCategoriasTodas] = useState([]);
  const [jugadores, setJugadores] = useState([
    { id: 1, nombre: 'Jugador 1' },
    { id: 2, nombre: 'Jugador 2' }
  ]);
  const [puntos, setPuntos] = useState({});
  const [ronda, setRonda] = useState(1);
  const [jugadorInicialRonda, setJugadorInicialRonda] = useState(0);
  const [proximoInicialRonda, setProximoInicialRonda] = useState(0);
  const [turno, setTurno] = useState(0);
  const [intento, setIntento] = useState(0);
  const [motivo, setMotivo] = useState(null);
  const [opciones, setOpciones] = useState([]);
  const [categoria, setCategoria] = useState(null);
  const [reto, setReto] = useState(null);
  const [ultimo, setUltimo] = useState(null);
  const usados = useRef([]);
  const intentados = useRef(new Set());

  useEffect(() => {
    fetch('/api/rapidfire/categorias')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategoriasTodas(d.categorias);
      })
      .catch((err) => console.error('Error al cargar categorías de rapidfire:', err));
  }, []);

  const handleNumJugadores = (e) => {
    const num = parseInt(e.target.value, 10);
    setJugadores(Array.from({ length: num }, (_, i) => ({
      id: i + 1,
      nombre: jugadores[i]?.nombre ?? `Jugador ${i + 1}`
    })));
  };

  const handleNombre = (index, valor) => {
    setJugadores(jugadores.map((j, i) => (i === index ? { ...j, nombre: valor } : j)));
  };

  const sortearOpciones = (cats = categoriasTodas) => {
    if (!cats.length) return;
    setOpciones(barajar(cats).slice(0, NUM_OPCIONES));
  };

  const empezar = () => {
    const lista = jugadores.map((j) => ({ ...j, nombre: j.nombre.trim() || `Jugador ${j.id}` }));
    setJugadores(lista);
    setPuntos(Object.fromEntries(lista.map((j) => [j.id, 0])));
    usados.current = [];
    setRonda(1);

    const primer = aleatorio(lista.length);
    setJugadorInicialRonda(primer);
    setProximoInicialRonda((primer + 1) % lista.length);
    setTurno(primer);
    
    setUltimo(null);
    sortearOpciones(categoriasTodas);
    setPaso('categorias');
  };

  const elegirCategoria = async (cat) => {
    try {
      const res = await fetch('/api/rapidfire/reto-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoriaId: cat.id, usados: usados.current })
      });
      const data = await res.json();

      if (data.success) {
        usados.current.push(data.retoClave);
        intentados.current = new Set([turno]);
        setCategoria(cat);
        setReto(data.reto);
        setIntento(0);
        setMotivo(null);
        setPaso('turno');
      }
    } catch (e) {
      console.error('Error al pedir reto:', e);
    }
  };

  const pasarTurno = (porque) => {
    let sig = (turno + 1) % jugadores.length;
    let intentosLoop = 0;
    while (intentados.current.has(sig) && intentosLoop < jugadores.length) {
      sig = (sig + 1) % jugadores.length;
      intentosLoop++;
    }

    if (!intentados.current.has(sig)) {
      intentados.current.add(sig);
      setTurno(sig);
      setIntento((k) => k + 1);
      setMotivo(porque);
    } else {
      setProximoInicialRonda((jugadorInicialRonda + 1) % jugadores.length);
      cerrarRonda({ tipo: 'rendido' });
    }
  };

  const cerrarRonda = (resultado) => {
    setUltimo(resultado);
    setPaso('puntuaciones');
  };

  const acierto = () => {
    const jugador = jugadores[turno];
    const ganados = reto.n * PUNTOS_POR_ACIERTO;
    setPuntos((p) => ({ ...p, [jugador.id]: (p[jugador.id] ?? 0) + ganados }));

    // Siempre avanza de forma secuencial al que le sigue al que abrió la ronda actual
    setProximoInicialRonda((jugadorInicialRonda + 1) % jugadores.length);

    cerrarRonda({ tipo: intento > 0 ? 'rebote' : 'acierto', jugador: jugador.nombre, puntos: ganados });
  };

  const rendirse = () => {
    setProximoInicialRonda((jugadorInicialRonda + 1) % jugadores.length);
    cerrarRonda({ tipo: 'rendido' });
  };

  const continuar = () => {
    setRonda((r) => r + 1);
    setJugadorInicialRonda(proximoInicialRonda);
    setTurno(proximoInicialRonda);
    intentados.current = new Set();
    setMotivo(null);
    setIntento(0);
    sortearOpciones(categoriasTodas);
    setPaso('categorias');
  };

  const nuevaPartida = () => {
    setPaso('config');
  };

  const ranking = [...jugadores].sort((a, b) => (puntos[b.id] ?? 0) - (puntos[a.id] ?? 0));
  const maximo = ranking.length ? (puntos[ranking[0].id] ?? 0) : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => (puntos[j.id] ?? 0) === maximo) : [];

  const tabla = (
    <div className="scoreboard">
      {ranking.map((j, i) => {
        const pts = puntos[j.id] ?? 0;
        const primero = maximo > 0 && pts === maximo;
        return (
          <div key={j.id} className={`score-row${primero ? ' first' : ''}`}>
            <span className="score-name">
              {primero ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
              {j.nombre}
            </span>
            <span className="score-pts">{pts} pts</span>
          </div>
        );
      })}
    </div>
  );

  if (paso === 'config') {
    return (
      <section className="game" style={{ position: 'relative' }}>
        <button
          type="button"
          className="btn-ayuda-flotante"
          onClick={() => setModalAyuda(true)}
          title="Reglas y sistema de puntuación"
        >
          <span className="btn-ayuda-flotante-signo">?</span>
        </button>

        {modalAyuda && (
          <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
            <div className="rg-modal modal-ayuda-juego" onClick={(e) => e.stopPropagation()}>
              <div className="modal-ayuda-header">
                <span className="modal-ayuda-signo-title">?</span>
                <h3>¿Cómo se juega a Rapidfire?</h3>
              </div>

              <div className="modal-ayuda-cuerpo">
                <p><strong>1. Dinámica del juego:</strong></p>
                <ul>
                  <li>Configura los jugadores y pulsa <em>¡Empezar!</em>. El primer turno de la primera ronda se sortea. En las siguientes será secuencial.</li>
                  <li>El jugador en turno elige 1 de las 3 categorías temáticas sorteadas.</li>
                  <li>Aparece un reto con el número de elementos requeridos (ej. <em>Di 5 películas de terror</em>).</li>
                  <li>Hay <strong>3 segundos de preparación</strong> antes de que empiecen a correr los <strong>60 segundos</strong>.</li>
                  <li>Si fallas o se agota el tiempo, el turno pasa por <strong>rebote</strong> al siguiente jugador de forma secuencial.</li>
                  <li>La siguiente ronda siempre la abrirá el jugador siguiente al que empezó la ronda actual, independientemente de quién acierte o si hay rebotes.</li>
                </ul>

                <p><strong>2. Sistema de puntuación:</strong></p>
                <div className="tabla-ayuda-puntos">
                  <div className="fila-ayuda-puntos verde">
                    <span>🎯 Reto completado con éxito</span>
                    <strong>+2 puntos por cada elemento pedido (N × 2 pts)</strong>
                  </div>
                  <div className="fila-ayuda-puntos azul">
                    <span>🔄 Reto completado en rebote</span>
                    <strong>El jugador del rebote se lleva los puntos totales</strong>
                  </div>
                  <div className="fila-ayuda-puntos rojo">
                    <span>🏳️ Rendirse / Ninguno lo logra</span>
                    <strong>0 puntos para todos en la ronda</strong>
                  </div>
                </div>
              </div>

              <div className="rg-modal-acciones">
                <button className="big full" onClick={() => setModalAyuda(false)}>
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

        <GameIntro gameId="rapidfire" titulo="Rapidfire" />

        <div className="panel">
          <div className="hud" style={{ marginBottom: '1rem' }}>
            <button className="btn-back-inline" onClick={onVolver}>
              &larr; Cambiar a modo Online
            </button>
          </div>

          <h3 className="panel-title"><Icon name="users" size={22} />Jugadores</h3>
          <label className="field-label" htmlFor="rf-num-jugadores">Número de jugadores (2 a 10)</label>
          <select id="rf-num-jugadores" value={jugadores.length} onChange={handleNumJugadores}>
            {[...Array(9)].map((_, i) => (
              <option key={i + 2} value={i + 2}>{i + 2} jugadores</option>
            ))}
          </select>

          <span className="field-label">Nombres</span>
          <div className="names-grid">
            {jugadores.map((j, idx) => (
              <input
                key={j.id}
                type="text"
                value={j.nombre}
                onChange={(e) => handleNombre(idx, e.target.value)}
                placeholder={`Jugador ${j.id}`}
                aria-label={`Nombre del jugador ${j.id}`}
              />
            ))}
          </div>
        </div>
        <button className="big full" onClick={empezar}>
          <Icon name="dice" size={24} />¡Empezar! Sortear primer turno
        </button>
      </section>
    );
  }

  if (paso === 'categorias') {
    const jugador = jugadores[turno];
    return (
      <section className="game">
        <div className="hud">
          <span className="chip"><Icon name="flagFinish" size={18} />Ronda {ronda}</span>
          <span className="chip alt">Turno de: {jugador.nombre}</span>
        </div>
        <div className="starter">
          <Icon name="dice" size={28} />
          <p>{ronda === 1 ? 'Empieza al azar' : 'Abre la ronda'} <strong>{jugador.nombre}</strong></p>
        </div>
        <h3 className="section-title">{jugador.nombre}, elige una categoría</h3>
        <div className="rf-opciones">
          {opciones.map((c, idx) => (
            <CategoryCard
              key={c.id}
              nombre={c.nombre}
              icono={c.icono}
              indice={idx}
              onClick={() => elegirCategoria(c)}
            />
          ))}
        </div>
      </section>
    );
  }

  if (paso === 'turno' && categoria && reto) {
    return (
      <Turno
        key={intento}
        jugador={jugadores[turno]}
        ronda={ronda}
        esRebote={intento > 0}
        motivo={motivo}
        categoria={categoria}
        reto={reto}
        onAcierto={acierto}
        onRebote={() => pasarTurno('rebote')}
        onTiempo={() => pasarTurno('tiempo')}
        onRendirse={rendirse}
      />
    );
  }

  if (paso === 'puntuaciones') {
    return (
      <section className="game">
        <div className="end-card">
          <span className="end-icon"><Icon name="trophy" size={44} /></span>
          <h1 className="title">Puntuaciones</h1>
          {ultimo && (
            <p className="reveal">
              {ultimo.tipo === 'rendido'
                ? 'Os habéis rendido o nadie lo logró: nadie suma puntos esta ronda.'
                : ultimo.tipo === 'rebote'
                  ? <><strong>{ultimo.jugador}</strong> ha cogido el rebote y se lleva <strong>{ultimo.puntos} puntos</strong>.</>
                  : <><strong>{ultimo.jugador}</strong> lo ha dicho todo y suma <strong>{ultimo.puntos} puntos</strong>.</>}
            </p>
          )}
          {tabla}
        </div>
        <div className="actions">
          <button onClick={continuar}>
            <Icon name="play" size={20} />Continuar: ronda {ronda + 1}
          </button>
          <button className="secondary" onClick={() => setPaso('final')}>
            <Icon name="flagFinish" size={20} />Finalizar el juego
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="game">
      <div className="end-card">
        <span className="end-icon"><Icon name="crown" size={44} /></span>
        <h1 className="title">Puntuaciones finales</h1>
        <p className="final-score">
          {ganadores.length === 0
            ? 'Nadie ha sumado puntos'
            : ganadores.length === 1
              ? <>¡Gana {ganadores[0].nombre}!</>
              : <>Empate entre {ganadores.map((g) => g.nombre).join(', ')}</>}
        </p>
        {tabla}
      </div>
      <div className="actions">
        <button onClick={nuevaPartida}>
          <Icon name="refresh" size={20} />Nueva partida
        </button>
        <button className="secondary danger" onClick={() => (onExit ? onExit() : navigate('/'))}>
          <Icon name="door" size={20} />Salir al menú principal
        </button>
      </div>
    </section>
  );
}