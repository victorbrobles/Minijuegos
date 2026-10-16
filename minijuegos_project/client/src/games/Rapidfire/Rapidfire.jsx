import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';
import { CATEGORIAS } from './retos.js';

const TIEMPO_S = 60; // tiempo de cada turno[cite: 8]
const PREPARACION_S = 3; // cuenta atrás antes de que empiece a correr el tiempo (0 para quitarla)[cite: 8]
const PUNTOS_POR_ACIERTO = 2; // puntos por cada elemento del reto[cite: 8]
const NUM_OPCIONES = 3; // categorías entre las que elige el jugador[cite: 8]

const aleatorio = (n) => Math.floor(Math.random() * n); //[cite: 8]

function barajar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = aleatorio(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
} //[cite: 8]

// Un turno: cuenta atrás de preparación, luego TIEMPO_S segundos para decir todos los elementos.[cite: 8]
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
  }, []); //[cite: 8]

  const preparando = prep > 0; //[cite: 8]

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
        <p className="rf-n">{reto.n}</p>
        <p className="rf-texto">{reto.texto}</p>
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
          <Icon name="check" size={22} strokeWidth={2.500} />Correcto
        </button>
        <button className="rebote" disabled={preparando} onClick={onRebote}>
          <Icon name="refresh" size={22} strokeWidth={2.500} />Rebote
        </button>
      </div>
      <button className="secondary danger full" onClick={onRendirse}>
        <Icon name="flag" size={20} />Rendirse (nadie puntúa)
      </button>
      {esRebote && <p className="previa">Rebote: el jugador debe decir las que faltan.</p>}
    </section>
  ); //[cite: 8]
}

export default function Rapidfire() {
  const navigate = useNavigate();

  // 'config' · 'categorias' · 'turno' · 'puntuaciones' · 'final'[cite: 8]
  const [paso, setPaso] = useState('config');
  const [modalAyuda, setModalAyuda] = useState(false);
  const [jugadores, setJugadores] = useState([
    { id: 1, nombre: 'Jugador 1' },
    { id: 2, nombre: 'Jugador 2' }
  ]); //[cite: 8]
  const [puntos, setPuntos] = useState({}); // id de jugador -> puntos[cite: 8]
  const [ronda, setRonda] = useState(1);
  const [turno, setTurno] = useState(0); // índice del jugador que tiene el turno ahora[cite: 8]
  const [intento, setIntento] = useState(0); // 0 = jugador inicial; >0 = rebotes dentro de la ronda[cite: 8]
  const [motivo, setMotivo] = useState(null); // 'tiempo' | 'rebote' (por qué ha cambiado el turno)[cite: 8]
  const [opciones, setOpciones] = useState([]); // las 3 categorías ofrecidas[cite: 8]
  const [categoria, setCategoria] = useState(null);
  const [reto, setReto] = useState(null); // { n, texto }[cite: 8]
  const [ultimo, setUltimo] = useState(null); // resultado de la ronda anterior[cite: 8]
  const usados = useRef(new Set()); // retos ya salidos, para no repetirlos[cite: 8]
  // Orden aleatorio de turnos:[cite: 8]
  const bolsa = useRef([]); // jugadores que aún no han abierto ronda en este ciclo[cite: 8]
  const ultimoAbre = useRef(-1); // quién abrió la última ronda[cite: 8]
  const intentados = useRef(new Set()); // jugadores que ya han tenido el turno en el reto actual[cite: 8]

  const handleNumJugadores = (e) => {
    const num = parseInt(e.target.value, 10);
    setJugadores(Array.from({ length: num }, (_, i) => ({
      id: i + 1,
      nombre: jugadores[i]?.nombre ?? `Jugador ${i + 1}`
    })));
  }; //[cite: 8]

  const handleNombre = (index, valor) => {
    setJugadores(jugadores.map((j, i) => (i === index ? { ...j, nombre: valor } : j)));
  }; //[cite: 8]

  const siguienteApertura = () => {
    if (bolsa.current.length === 0) bolsa.current = jugadores.map((_, i) => i);
    const sinRepetir = bolsa.current.filter((i) => i !== ultimoAbre.current);
    const candidatos = sinRepetir.length > 0 ? sinRepetir : bolsa.current;
    const elegido = candidatos[aleatorio(candidatos.length)];
    bolsa.current = bolsa.current.filter((i) => i !== elegido);
    ultimoAbre.current = elegido;
    return elegido;
  }; //[cite: 8]

  const siguienteRebote = (actual) => {
    let candidatos = jugadores.map((_, i) => i).filter((i) => !intentados.current.has(i));
    if (candidatos.length === 0) {
      intentados.current = new Set([actual]);
      candidatos = jugadores.map((_, i) => i).filter((i) => i !== actual);
    }
    const elegido = candidatos[aleatorio(candidatos.length)];
    intentados.current.add(elegido);
    return elegido;
  }; //[cite: 8]

  const sortearOpciones = () => setOpciones(barajar(CATEGORIAS).slice(0, NUM_OPCIONES)); //[cite: 8]

  const empezar = () => {
    const lista = jugadores.map((j) => ({ ...j, nombre: j.nombre.trim() || `Jugador ${j.id}` }));
    setJugadores(lista);
    setPuntos(Object.fromEntries(lista.map((j) => [j.id, 0])));
    usados.current = new Set();
    setRonda(1);
    bolsa.current = [];
    ultimoAbre.current = -1;
    setTurno(siguienteApertura()); // empieza uno al azar[cite: 8]
    setUltimo(null);
    sortearOpciones();
    setPaso('categorias');
  }; //[cite: 8]

  const elegirCategoria = (cat) => {
    let libres = cat.retos.map((_, i) => i).filter((i) => !usados.current.has(`${cat.id}:${i}`));
    if (libres.length === 0) { // ya han salido todos: se vuelve a empezar con esa categoría[cite: 8]
      cat.retos.forEach((_, i) => usados.current.delete(`${cat.id}:${i}`));
      libres = cat.retos.map((_, i) => i);
    }
    const i = libres[aleatorio(libres.length)];
    usados.current.add(`${cat.id}:${i}`);
    const [n, texto] = cat.retos[i];
    intentados.current = new Set([turno]); // el que abre ya ha tenido su turno en este reto[cite: 8]
    setCategoria(cat);
    setReto({ n, texto });
    setIntento(0);
    setMotivo(null);
    setPaso('turno');
  }; //[cite: 8]

  const pasarTurno = (porque) => {
    setTurno(siguienteRebote(turno));
    setIntento((k) => k + 1);
    setMotivo(porque);
  }; //[cite: 8]

  const cerrarRonda = (resultado) => {
    setUltimo(resultado);
    setTurno(siguienteApertura());
    setPaso('puntuaciones');
  }; //[cite: 8]

  const acierto = () => {
    const jugador = jugadores[turno];
    const ganados = reto.n * PUNTOS_POR_ACIERTO;
    setPuntos((p) => ({ ...p, [jugador.id]: (p[jugador.id] ?? 0) + ganados }));
    cerrarRonda({ tipo: intento > 0 ? 'rebote' : 'acierto', jugador: jugador.nombre, puntos: ganados });
  }; //[cite: 8]

  const rendirse = () => cerrarRonda({ tipo: 'rendido' }); //[cite: 8]

  const continuar = () => {
    setRonda((r) => r + 1);
    sortearOpciones();
    setPaso('categorias');
  }; //[cite: 8]

  const nuevaPartida = () => {
    setPaso('config');
  }; //[cite: 8]

  const ranking = [...jugadores].sort((a, b) => (puntos[b.id] ?? 0) - (puntos[a.id] ?? 0)); //[cite: 8]
  const maximo = ranking.length ? (puntos[ranking[0].id] ?? 0) : 0; //[cite: 8]
  const ganadores = maximo > 0 ? ranking.filter((j) => (puntos[j.id] ?? 0) === maximo) : []; //[cite: 8]

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
  ); //[cite: 8]

  // 1. Configuración de jugadores[cite: 8]
  if (paso === 'config') {
    return (
      <section className="game" style={{ position: 'relative' }}>
        {/* Botón flotante de ayuda */}
        <button
          type="button"
          className="btn-ayuda-flotante"
          onClick={() => setModalAyuda(true)}
          title="Reglas y sistema de puntuación"
        >
          <span className="btn-ayuda-flotante-signo">?</span>
        </button>

        {/* Modal explicativo */}
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
                  <li>Configura los jugadores y pulsa <em>¡Empezar!</em>. Se sorteará quién abre la ronda.</li>
                  <li>El jugador en turno elige 1 de las 3 categorías temáticas sorteadas.</li>
                  <li>Aparece un reto con el número de elementos requeridos (ej. <em>Di 5 películas de terror</em>).</li>
                  <li>Hay <strong>3 segundos de preparación</strong> antes de que empiecen a correr los <strong>60 segundos</strong>.</li>
                  <li>Si dice todos los elementos requeridos a tiempo, pulsa <strong>«Correcto»</strong>.</li>
                  <li>Si falla o se agota el tiempo, el turno pasa por <strong>rebote aleatorio</strong> a otro jugador para decir los elementos que falten.</li>
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
          <Icon name="dice" size={24} />¡Empezar! Sortear quién abre
        </button>
      </section>
    ); //[cite: 8]
  }

  // 2. Elegir una de las tres categorías[cite: 8]
  if (paso === 'categorias') {
    const jugador = jugadores[turno];
    return (
      <section className="game">
        <p className="categoria"><Icon name="flagFinish" size={16} />Ronda {ronda}</p>
        <div className="starter">
          <Icon name="dice" size={28} />
          <p>{ronda === 1 ? 'Empieza' : 'Abre la ronda'} <strong>{jugador.nombre}</strong></p>
        </div>
        <h3 className="section-title">{jugador.nombre}, elige una categoría</h3>
        <div className="rf-opciones">
          {opciones.map((c) => (
            <CategoryCard
              key={c.id}
              nombre={c.nombre}
              icono={c.icono}
              indice={CATEGORIAS.indexOf(c)}
              onClick={() => elegirCategoria(c)}
            />
          ))}
        </div>
      </section>
    ); //[cite: 8]
  }

  // 3. Turno con el reto y el cronómetro[cite: 8]
  if (paso === 'turno') {
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
    ); //[cite: 8]
  }

  // 4. Puntuaciones entre rondas[cite: 8]
  if (paso === 'puntuaciones') {
    return (
      <section className="game">
        <div className="end-card">
          <span className="end-icon"><Icon name="trophy" size={44} /></span>
          <h1 className="title">Puntuaciones</h1>
          {ultimo && (
            <p className="reveal">
              {ultimo.tipo === 'rendido'
                ? 'Os habéis rendido: nadie suma puntos esta ronda.'
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
    ); //[cite: 8]
  }

  // 5. Final[cite: 8]
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
        <button className="secondary danger" onClick={() => navigate('/')}>
          <Icon name="door" size={20} />Salir al menú principal
        </button>
      </div>
    </section>
  ); //[cite: 8]
}