// client/src/games/Jugadores/JugadoresLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import '../Adivina/Adivina.css';

const TIEMPO_S = 120;
const MAX_RONDAS = 20;

export default function JugadoresLocal({ onVolver, onExit }) {
  const navigate = useNavigate();
  const [paso, setPaso] = useState('config'); // config, jugando, resumen, final
  const [modalAyuda, setModalAyuda] = useState(false);
  const [modalAsignar, setModalAsignar] = useState(null); // 'acierto' | 'fallo'

  const [jugadores, setJugadores] = useState([
    { id: 1, nombre: 'Jugador 1' },
    { id: 2, nombre: 'Jugador 2' }
  ]);
  const [puntos, setPuntos] = useState({});
  const [ronda, setRonda] = useState(1);
  const [usados, setUsados] = useState([]);
  const [reto, setReto] = useState(null);
  const [ultimo, setUltimo] = useState(null);
  const [restante, setRestante] = useState(TIEMPO_S);
  
  const timerRef = useRef(null);

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

  const cargarReto = async () => {
    try {
      const res = await fetch('/api/jugadores/reto-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usados })
      });
      const data = await res.json();
      if (data.success) {
        setUsados([...usados, data.reto.id]);
        setReto(data.reto);
        setRestante(TIEMPO_S);
        setPaso('jugando');
        iniciarTimer();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const iniciarTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const empezar = () => {
    const lista = jugadores.map((j) => ({ ...j, nombre: j.nombre.trim() || `Jugador ${j.id}` }));
    setJugadores(lista);
    setPuntos(Object.fromEntries(lista.map((j) => [j.id, 0])));
    setUsados([]);
    setRonda(1);
    setUltimo(null);
    cargarReto();
  };

  const asignarPunto = (jugadorId) => {
    const p = jugadores.find((j) => j.id === jugadorId);
    if (!p) return;
    
    if (timerRef.current) clearInterval(timerRef.current);

    const puntosCambiados = modalAsignar === 'acierto' ? 3 : -1;
    setPuntos((prev) => ({ ...prev, [p.id]: (prev[p.id] ?? 0) + puntosCambiados }));
    
    setUltimo({ tipo: modalAsignar, jugador: p.nombre, puntos: puntosCambiados });
    setModalAsignar(null);
    setPaso('resumen');
  };

  const rendirse = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setUltimo({ tipo: 'rendido' });
    setModalAsignar(null);
    setPaso('resumen');
  };

  const continuar = () => {
    if (ronda >= MAX_RONDAS) {
      setPaso('final');
    } else {
      setRonda(ronda + 1);
      cargarReto();
    }
  };

  const ranking = [...jugadores].sort((a, b) => (puntos[b.id] ?? 0) - (puntos[a.id] ?? 0));
  const maximo = ranking.length ? (puntos[ranking[0].id] ?? 0) : 0;
  const ganadores = ranking.filter((j) => (puntos[j.id] ?? 0) === maximo);

  if (paso === 'config') {
    return (
      <section className="game">
        <button type="button" className="btn-ayuda-flotante" onClick={() => setModalAyuda(true)} title="Reglas">
          <span className="btn-ayuda-flotante-signo">?</span>
        </button>

        {modalAyuda && (
          <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
            <div className="rg-modal" onClick={(e) => e.stopPropagation()}>
              <h3>¿Cómo se juega a ¿Con quién jugaste?</h3>
              <p>Aparecerá en pantalla una dupla de jugadores de fútbol difíciles de relacionar. Solo comparten una cosa: <strong>han tenido al menos un compañero de equipo en común a lo largo de su carrera.</strong></p>
              <ul>
                <li>Tenéis 120 segundos en grupo para debatir y gritar compañeros en común.</li>
                <li>El juez (o la persona con el dispositivo) marcará el acierto o fallo para el que lo diga primero.</li>
                <li><strong>Acierto:</strong> +3 puntos.</li>
                <li><strong>Fallo:</strong> -1 punto.</li>
              </ul>
              <button className="big full" style={{ marginTop: '1rem' }} onClick={() => setModalAyuda(false)}>Entendido</button>
            </div>
          </div>
        )}

        <GameIntro gameId="jugadores" titulo="¿Con quién jugaste?" />

        <div className="panel">
          <div className="hud" style={{ marginBottom: '1rem' }}><button className="btn-back-inline" onClick={onVolver}>&larr; Cambiar a modo Online</button></div>
          <h3 className="panel-title"><Icon name="users" size={22} />Jugadores</h3>
          <select value={jugadores.length} onChange={handleNumJugadores} style={{ marginBottom: '1rem', width: '100%', padding: '0.8rem', borderRadius: '8px' }}>
            {[...Array(14)].map((_, i) => (<option key={i + 2} value={i + 2}>{i + 2} jugadores</option>))}
          </select>
          <div className="names-grid">
            {jugadores.map((j, idx) => (
              <input key={j.id} type="text" value={j.nombre} onChange={(e) => handleNombre(idx, e.target.value)} placeholder={`Jugador ${j.id}`} maxLength={20} />
            ))}
          </div>
        </div>
        <button className="big full" onClick={empezar}><Icon name="play" size={24} /> Empezar Partida</button>
      </section>
    );
  }

  if (paso === 'jugando' && reto) {
    return (
      <section className="game">
        <div className="hud">
          <span className="chip"><Icon name="flagFinish" size={18} />Ronda {ronda} de {MAX_RONDAS}</span>
        </div>

        <div className="panel center" style={{ margin: '2rem 0', padding: '3rem 1rem' }}>
          <h3 style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '2px', marginBottom: '1rem' }}>Compañero en común</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b', textAlign: 'center' }}>{reto.jugador1}</div>
            <Icon name="refresh" size={28} color="#94a3b8" />
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b', textAlign: 'center' }}>{reto.jugador2}</div>
          </div>
        </div>

        <div className="timer" role="timer" aria-label="Tiempo restante">
          <div className={`timer-bar${restante <= 15 ? ' low' : ''}`} style={{ width: `${(restante / TIEMPO_S) * 100}%` }} />
        </div>
        <p className="timer-text"><Icon name="clock" size={16} />{restante} s</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
          <button className="ok" onClick={() => setModalAsignar('acierto')}><Icon name="check" size={22} /> ¡Correcto!</button>
          <button className="secondary danger" style={{ background: '#ef4444', color: '#fff', borderColor: '#dc2626' }} onClick={() => setModalAsignar('fallo')}><Icon name="close" size={22} /> ¡Fallo!</button>
        </div>
        <button className="secondary full" style={{ marginTop: '1rem' }} onClick={rendirse}><Icon name="flag" size={18} /> Nadie lo sabe (Pasar)</button>

        {/* Modal de Asignación */}
        {modalAsignar && (
          <div className="rg-modal-fondo" onClick={() => setModalAsignar(null)}>
            <div className="rg-modal" onClick={(e) => e.stopPropagation()}>
              <h3>¿Quién {modalAsignar === 'acierto' ? 'ha acertado (+3)?' : 'ha fallado (-1)?'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
                {jugadores.map((j) => (
                  <button key={j.id} className="secondary full" onClick={() => asignarPunto(j.id)}>
                    {j.nombre}
                  </button>
                ))}
              </div>
              <button className="secondary danger full" style={{ marginTop: '1rem' }} onClick={() => setModalAsignar(null)}>Cancelar</button>
            </div>
          </div>
        )}
      </section>
    );
  }

  if (paso === 'resumen') {
    return (
      <section className="game">
        <div className="end-card">
          <span className="end-icon"><Icon name="trophy" size={44} /></span>
          <h1 className="title">Puntuaciones</h1>
          {ultimo && (
            <p className="reveal" style={{ fontSize: '1.2rem', margin: '1rem 0' }}>
              {ultimo.tipo === 'rendido' ? 'Nadie lo adivinó. 0 puntos para todos.' :
               ultimo.tipo === 'acierto' ? <><strong>{ultimo.jugador}</strong> acertó y suma <span style={{color: '#059669'}}>+3 pts</span>.</> :
               <><strong>{ultimo.jugador}</strong> falló y resta <span style={{color: '#dc2626'}}>-1 pt</span>.</>}
            </p>
          )}
          <div className="scoreboard">
            {ranking.map((j, i) => (
              <div key={j.id} className={`score-row${(maximo > 0 && puntos[j.id] === maximo) ? ' first' : ''}`}>
                <span className="score-name">
                  {(maximo > 0 && puntos[j.id] === maximo) ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                  {j.nombre}
                </span>
                <span className="score-pts">{puntos[j.id] ?? 0} pts</span>
              </div>
            ))}
          </div>
        </div>
        <div className="actions">
          <button onClick={continuar}><Icon name="play" size={20} />{ronda >= MAX_RONDAS ? 'Ver Podio Final' : `Continuar a la Ronda ${ronda + 1}`}</button>
          <button className="secondary danger" onClick={() => setPaso('final')}><Icon name="flagFinish" size={20} /> Terminar partida</button>
        </div>
      </section>
    );
  }

  return (
    <section className="game">
      <div className="end-card">
        <span className="end-icon"><Icon name="crown" size={48} /></span>
        <h1 className="title">Clasificación Final</h1>
        <div className="scoreboard" style={{ marginTop: '1.5rem' }}>
          {ranking.map((j, i) => (
            <div key={j.id} className={`score-row${(maximo > 0 && puntos[j.id] === maximo) ? ' first' : ''}`}>
              <span className="score-name">
                {(maximo > 0 && puntos[j.id] === maximo) ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                {j.nombre}
              </span>
              <span className="score-pts">{puntos[j.id] ?? 0} pts</span>
            </div>
          ))}
        </div>
      </div>
      <div className="actions">
        <button onClick={() => setPaso('config')}><Icon name="refresh" size={20} /> Nueva Partida</button>
        <button className="secondary danger" onClick={() => (onExit ? onExit() : navigate('/'))}><Icon name="door" size={20} /> Salir al menú</button>
      </div>
    </section>
  );
}