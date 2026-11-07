// client/src/games/Rapidfire/RapidfireLocal.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';
import './Rapidfire.css';

const TIEMPO_S = 60;
const PREPARACION_S = 3;
const PUNTOS_POR_ACIERTO = 2;
const NUM_OPCIONES = 3;
const MIN_JUGADORES = 2;
const MAX_JUGADORES = 10;

const COLORES = ['#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#ec4899', '#0d9488', '#ea580c', '#475569', '#65a30d'];

const aleatorio = (n) => Math.floor(Math.random() * n);

function barajar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = aleatorio(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function BotonVolver({ onClick, texto = 'Volver' }) {
  return (
    <button type="button" className="qq-link-volver" onClick={onClick}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>{texto}</span>
    </button>
  );
}

function Turno({ jugador, ronda, esRebote, motivo, categoria, reto, onAcierto, onRebote, onTiempo, onRendirse, onSalirPortada }) {
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
      <div className="panel qq-menu-panel">
        <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
          <BotonVolver texto="Volver a la portada" onClick={onSalirPortada} />
          <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
            {esRebote ? 'Rebote' : `Ronda ${ronda}`}
          </span>
        </div>

        {motivo && (
          <p className="rf-aviso" role="status" style={{ marginBottom: '1rem' }}>
            <Icon name={motivo === 'tiempo' ? 'hourglass' : 'refresh'} size={22} />
            {motivo === 'tiempo' ? '¡Se acabó el tiempo!' : '¡Rebote!'} Le toca a <strong>{jugador.nombre}</strong>
          </p>
        )}

        <div className="starter" style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <span>Turno de: <strong>{jugador.nombre}</strong></span>
        </div>

        <p className="categoria" style={{ display: 'inline-flex', margin: '0 auto 1rem', width: 'fit-content' }}>
          <Icon name={categoria.icono} size={16} /> {categoria.nombre}
        </p>

        <div className="sigla-card rf-reto">
          <p className="rf-n" style={{ color: '#dc2626', fontSize: '3.5rem', fontWeight: '900', lineHeight: 1 }}>{reto.n}</p>
          <p className="rf-texto" style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: '600', marginTop: '0.5rem' }}>{reto.texto}</p>
        </div>

        <div className="timer" role="timer" aria-label="Tiempo restante" style={{ marginTop: '0.5rem' }}>
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
            <Icon name="check" size={22} strokeWidth={2.5} /> Correcto
          </button>
          <button className="rebote" disabled={preparando} onClick={onRebote}>
            <Icon name="refresh" size={22} strokeWidth={2.5} /> Rebote
          </button>
        </div>

        <div className="qq-tablero-footer">
          <button type="button" className="qq-link-otra-ronda" onClick={onRendirse}>
            Rendirse (nadie puntúa)
          </button>
        </div>
        {esRebote && <p className="previa">Rebote: el jugador debe decir las que faltan.</p>}
      </div>
    </section>
  );
}

export default function RapidfireLocal({ onVolver, onExit, onAbrirAyuda }) {
  const navigate = useNavigate();

  const [paso, setPaso] = useState('config');
  const [modalSalirPortada, setModalSalirPortada] = useState(false);
  const [categoriasTodas, setCategoriasTodas] = useState([]);
  
  const [numJugadores, setNumJugadores] = useState(2);
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

  const handleSalirAPortada = () => {
    setModalSalirPortada(false);
    if (typeof onExit === 'function') {
      onExit();
    } else {
      try {
        navigate('/');
      } catch {
        window.location.href = '/';
      }
    }
  };

  const actualizarCantidadJugadores = (nuevoNum) => {
    const num = Math.max(MIN_JUGADORES, Math.min(MAX_JUGADORES, nuevoNum));
    setNumJugadores(num);
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

  const enPartidaActiva = paso !== 'config';

  return (
    <div className={`rf-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
      {/* 1. CONFIGURACIÓN */}
      {paso === 'config' && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver onClick={onVolver} />
              <button
                type="button"
                className="qq-btn-ayuda"
                onClick={onAbrirAyuda}
                title="Cómo jugar"
                aria-label="Cómo jugar"
              >
                ?
              </button>
            </div>

            <div className="qq-config-header">
              <div className="qq-hero-icono chico">
                <Icon name="users" size={32} />
              </div>
              <div>
                <h2 className="qq-config-titulo">Jugadores</h2>
                <p className="qq-config-sub">
                  Configura quiénes van a participar ({MIN_JUGADORES} a {MAX_JUGADORES} jugadores)
                </p>
              </div>
            </div>

            <div className="qq-selector-cantidad-box">
              <label className="qq-label-destacado" htmlFor="rf-num-jugadores">
                Número de participantes
              </label>
              <div className="qq-stepper-row">
                <button
                  type="button"
                  className="qq-stepper-btn"
                  disabled={numJugadores <= MIN_JUGADORES}
                  onClick={() => actualizarCantidadJugadores(numJugadores - 1)}
                >
                  &minus;
                </button>
                <select
                  id="rf-num-jugadores"
                  className="qq-select-jugadores"
                  value={numJugadores}
                  onChange={(e) => actualizarCantidadJugadores(parseInt(e.target.value, 10))}
                >
                  {Array.from({ length: MAX_JUGADORES - MIN_JUGADORES + 1 }, (_, i) => (
                    <option key={i + MIN_JUGADORES} value={i + MIN_JUGADORES}>
                      {i + MIN_JUGADORES} jugadores
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="qq-stepper-btn"
                  disabled={numJugadores >= MAX_JUGADORES}
                  onClick={() => actualizarCantidadJugadores(numJugadores + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <span className="qq-label-destacado" style={{ marginTop: '1.2rem', display: 'block' }}>
              Nombres de los jugadores
            </span>
            <div className="qq-nombres-grid">
              {jugadores.map((j, idx) => (
                <div key={j.id} className="qq-jugador-input-card">
                  <span
                    className="qq-jugador-badge"
                    style={{ background: COLORES[idx % COLORES.length] }}
                  >
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={j.nombre}
                    onChange={(e) => handleNombre(idx, e.target.value)}
                    placeholder={`Jugador ${j.id}`}
                    maxLength={20}
                    required
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1.5rem' }}
              onClick={empezar}
            >
              <Icon name="dice" size={24} /> ¡Iniciar juego!
            </button>
          </div>
        </section>
      )}

      {/* 2. CATEGORÍAS */}
      {paso === 'categorias' && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
              <span className="qq-tablero-badge" style={{ marginBottom: 0 }}>
                Ronda {ronda}
              </span>
            </div>

            <div className="starter" style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
              <Icon name="dice" size={28} />
              <p style={{ margin: 0 }}>
                {ronda === 1 ? 'Empieza al azar' : 'Abre la ronda'}: <strong>{jugadores[turno].nombre}</strong>
              </p>
            </div>

            <div className="qq-section-header">
              <h3 className="qq-section-title">{jugadores[turno].nombre}, elige una categoría:</h3>
            </div>

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
          </div>
        </section>
      )}

      {/* 3. TURNO */}
      {paso === 'turno' && categoria && reto && (
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
          onSalirPortada={() => setModalSalirPortada(true)}
        />
      )}

      {/* 4. PUNTUACIONES DE LA RONDA */}
      {paso === 'puntuaciones' && (
        <section className="game">
          <div className="panel qq-menu-panel">
            <div className="qq-card-top" style={{ marginBottom: '0.8rem' }}>
              <BotonVolver texto="Volver a la portada" onClick={() => setModalSalirPortada(true)} />
            </div>

            <div className="end-card" style={{ border: 'none', boxShadow: 'none', padding: '0 0 1rem' }}>
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

            <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <button type="button" className="big full qq-btn-principal" onClick={continuar}>
                <Icon name="play" size={20} /> Continuar: ronda {ronda + 1}
              </button>
              <div className="qq-tablero-footer" style={{ marginTop: 0, paddingTop: '0.6rem', borderTop: 'none' }}>
                <button type="button" className="qq-link-otra-ronda" onClick={() => setPaso('final')}>
                  Finalizar juego
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. PODIO FINAL */}
      {paso === 'final' && (
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
          <div className="actions" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="big full qq-btn-principal" onClick={nuevaPartida}>
              <Icon name="refresh" size={20} /> Nueva partida
            </button>
            <button type="button" className="secondary danger full" onClick={handleSalirAPortada}>
              <Icon name="door" size={20} /> Volver a la portada
            </button>
          </div>
        </section>
      )}

      {/* MODAL: SALIR A LA PORTADA */}
      {modalSalirPortada && (
        <div className="rg-modal-fondo" onClick={() => setModalSalirPortada(false)}>
          <div
            className="rg-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🚪</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>
              ¿Salir a la portada?
            </h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              Se cancelará la partida actual y volverás a la portada principal. ¿Estás seguro?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button
                type="button"
                className="secondary full"
                onClick={() => setModalSalirPortada(false)}
              >
                No, continuar
              </button>
              <button
                type="button"
                className="secondary danger full"
                style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }}
                onClick={handleSalirAPortada}
              >
                Sí, salir a portada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}