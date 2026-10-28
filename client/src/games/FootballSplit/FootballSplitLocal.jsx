// client/src/games/FootballSplit/FootballSplitLocal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import './FootballSplit.css';
import '../Adivina/Adivina.css'; 

export default function FootballSplitLocal({ onVolver, onExit }) {
  const navigate = useNavigate();
  const [paso, setPaso] = useState('config');
  const [modalAyuda, setModalAyuda] = useState(false);
  
  const [jugadores, setJugadores] = useState([{ id: 1, nombre: 'Jugador 1' }, { id: 2, nombre: 'Jugador 2' }]);
  const [reto, setReto] = useState(null);
  const [estadoReto, setEstadoReto] = useState({ top: false, middle: false, bottom: false });
  const [intentos, setIntentos] = useState(0);
  const [turnoIdx, setTurnoIdx] = useState(0);
  const [inputStr, setInputStr] = useState("");
  const [feedback, setFeedback] = useState(null);

  const handleNumJugadores = (e) => {
    const num = parseInt(e.target.value, 10);
    setJugadores(Array.from({ length: num }, (_, i) => ({ id: i + 1, nombre: jugadores[i]?.nombre ?? `Jugador ${i + 1}` })));
  };

  const cargarReto = async () => {
    try {
      const res = await fetch('/api/footballsplit/reto');
      const data = await res.json();
      setReto(data.reto);
      setEstadoReto({ top: false, middle: false, bottom: false });
      setIntentos(0);
      setTurnoIdx(0);
      setPaso('jugando');
    } catch(e) { console.error(e); }
  };

  const normalizar = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

  const validarRespuesta = (e) => {
    e.preventDefault();
    if (!inputStr.trim()) return;

    setIntentos(prev => prev + 1);
    let acierto = false;
    const normInput = normalizar(inputStr);
    const nuevoEstado = { ...estadoReto };

    ['top', 'middle', 'bottom'].forEach(p => {
      if (!nuevoEstado[p]) {
        const normReal = normalizar(reto.partes[p].jugador);
        if (normReal === normInput || normReal.includes(normInput) || normInput.includes(normReal)) {
          nuevoEstado[p] = true;
          acierto = true;
        }
      }
    });

    if (acierto) {
      setEstadoReto(nuevoEstado);
      setFeedback({ tipo: 'success', msj: '¡Adivinado!' });
      
      if (nuevoEstado.top && nuevoEstado.middle && nuevoEstado.bottom) {
        setTimeout(() => setPaso('victoria'), 1500);
      }
    } else {
      setFeedback({ tipo: 'error', msj: 'Incorrecto' });
      setTurnoIdx((turnoIdx + 1) % jugadores.length);
      if (intentos + 1 >= 20) {
        setTimeout(() => setPaso('derrota'), 1500);
      }
    }
    
    setInputStr("");
    setTimeout(() => setFeedback(null), 1500);
  };

  const pedirPista = (parte) => {
    setIntentos(prev => prev + 1);
    alert(`Pista: ${reto.partes[parte].pista}`);
    if (intentos + 1 >= 20) setPaso('derrota');
  };

  const getEstiloImagen = (recorte) => {
    if (!recorte) return { objectFit: 'cover' };
    const cx = (recorte.x + recorte.ancho / 2) * 100;
    const cy = (recorte.y + recorte.alto / 2) * 100;
    const scale = 1 / recorte.ancho;
    return {
      objectFit: 'cover',
      objectPosition: `${cx}% ${cy}%`,
      transform: `scale(${scale})`,
      transformOrigin: `${cx}% ${cy}%`
    };
  };

  return (
    <div className="rk-contenedor">
      {paso === 'config' && (
        <button type="button" className="rk-btn-ayuda" onClick={() => setModalAyuda(true)} title="Reglas">
          <span className="rk-btn-ayuda-signo">?</span>
        </button>
      )}
      
      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal rk-modal-ayuda" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', textAlign: 'left', padding: '2rem' }}>
            <div className="rk-modal-header">
              <span className="rk-modal-signo-title">?</span>
              <h3>¿Cómo jugar a Football Split?</h3>
            </div>
            <div className="rk-modal-cuerpo">
              <p style={{ textAlign: 'center', marginBottom: '1rem' }}>Se mostrará una cara formada por 3 jugadores diferentes.</p>
              <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <li>Jugáis <strong>en equipo</strong>. Tenéis 20 intentos en total.</li>
                <li>En cada turno, el jugador activo debe escribir el nombre de uno de los 3 jugadores.</li>
                <li>Podéis pedir una pista por cada parte, pero consumirá 1 intento.</li>
              </ul>
            </div>
            <div className="rg-modal-acciones">
              <button className="big full" onClick={() => setModalAyuda(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}

      {paso === 'config' && (
        <section className="game">
          <GameIntro gameId="footballsplit" titulo="Football Split" />
          <div className="panel">
            <div className="hud" style={{ marginBottom: '1rem' }}><button className="btn-back-inline" onClick={onVolver}>&larr; Cambiar a modo Online</button></div>
            <h3 className="panel-title"><Icon name="users" size={22} />Jugadores Cooperativos</h3>
            <select value={jugadores.length} onChange={handleNumJugadores} style={{ marginBottom: '1rem', width: '100%', padding: '0.8rem', borderRadius: '8px' }}>
              {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} jugador{n>1?'es':''}</option>)}
            </select>
            <div className="names-grid">
              {jugadores.map((j, idx) => (
                <input key={j.id} type="text" value={j.nombre} onChange={(e) => {
                  const nuevos = [...jugadores]; nuevos[idx].nombre = e.target.value; setJugadores(nuevos);
                }} placeholder={`Jugador ${j.id}`} maxLength={20} />
              ))}
            </div>
          </div>
          <button className="big full" onClick={cargarReto}><Icon name="play" size={24} /> Empezar Partida</button>
        </section>
      )}

      {paso === 'jugando' && reto && (
        <section className="game">
          <div className="hud space-between">
            <span className="chip"><Icon name="users" size={18} /> Turno: <strong>{jugadores[turnoIdx].nombre}</strong></span>
            <button className="secondary danger" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setPaso('derrota')}>Rendirse</button>
          </div>

          <form onSubmit={validarRespuesta} style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
            <input type="text" placeholder="🔍 Escribe un jugador..." value={inputStr} onChange={e => setInputStr(e.target.value)} autoFocus style={{ flex: 1, padding: '0.8rem', borderRadius: '20px', border: '2px solid #cbd5e1' }} />
            <button type="submit" className="ok" disabled={!inputStr.trim()}>Probar</button>
          </form>

          {feedback && (
            <div style={{ textAlign: 'center', padding: '0.5rem', borderRadius: '8px', background: feedback.tipo === 'success' ? '#dcfce7' : '#fee2e2', color: feedback.tipo === 'success' ? '#15803d' : '#991b1b', fontWeight: 'bold', marginBottom: '1rem' }}>
              {feedback.msj}
            </div>
          )}

          <div className="fs-split-container">
            {['top', 'middle', 'bottom'].map((p) => (
              <div key={p} className={`fs-slice ${estadoReto[p] ? 'solved' : ''}`}>
                {reto.partes[p].img && (
                  <img src={reto.partes[p].img} alt={`Parte ${p}`} style={getEstiloImagen(reto.partes[p].recorte)} />
                )}
                <div className="fs-slice-status">
                  {estadoReto[p] ? <Icon name="check" size={16} /> : '?'}
                </div>
                {!estadoReto[p] && (
                  <button type="button" className="fs-slice-hint" onClick={() => pedirPista(p)}>
                    <Icon name="eye" size={14} /> Pista
                  </button>
                )}
                {estadoReto[p] && <div className="fs-solved-name">{reto.partes[p].jugador}</div>}
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <div className="fs-attempts">Intentos {intentos}/20</div>
          </div>
        </section>
      )}

      {(paso === 'victoria' || paso === 'derrota') && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name={paso === 'victoria' ? 'trophy' : 'close'} size={48} /></span>
            <h1 className="title">{paso === 'victoria' ? '¡Lo habéis logrado!' : '¡Fin del juego!'}</h1>
            <p className="hint">Usasteis {intentos} intentos.</p>
            
            <div style={{ margin: '1.5rem 0', background: '#f1f5f9', padding: '1rem', borderRadius: '12px', textAlign: 'left' }}>
              <h3 style={{ marginBottom: '0.8rem' }}>La solución era:</h3>
              <p><strong>Pelo:</strong> {reto?.partes.top.jugador}</p>
              <p><strong>Cara:</strong> {reto?.partes.middle.jugador}</p>
              <p><strong>Barbilla:</strong> {reto?.partes.bottom.jugador}</p>
            </div>
          </div>
          <div className="actions">
            <button className="big full" onClick={cargarReto}><Icon name="refresh" size={20} /> Jugar otro Split</button>
            <button className="secondary danger full" onClick={() => setPaso('config')}><Icon name="door" size={20} /> Salir</button>
          </div>
        </section>
      )}
    </div>
  );
}
