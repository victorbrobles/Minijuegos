// client/src/games/Jugadores/JugadoresOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import '../Adivina/Adivina.css';
import './Jugadores.css';

const CLAVE_SESION_JUG = 'jugadores_online_session';
const TIEMPO_S = 120;

export default function JugadoresOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); 
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);
  const [modalRespuestas, setModalRespuestas] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_JUG));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [modalAsignar, setModalAsignar] = useState(null); 
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/jugadores/online/sala/${sesion.code}?token=${sesion.token}`)
        .then((r) => {
          if (!r.ok) throw new Error('Sala no disponible');
          return r.json();
        })
        .then((d) => {
          if (d.success) {
            setSala(d);
            setVista('sala');
          }
        })
        .catch(() => {
          sessionStorage.removeItem(CLAVE_SESION_JUG);
          setSesion(null);
          setSala(null);
          setVista('menu');
          setErrorMsg('La sala se ha cerrado.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 600);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [sesion]);

  const apiFetch = async (endpoint, payload) => {
    const res = await fetch(`/api/jugadores/online/${endpoint}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  };

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setCargando(true);
    try {
      const data = await apiFetch('crear', { nombre: nombre.trim() });
      if (!data.success) throw new Error(data.error);
      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_JUG, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) { setErrorMsg(err.message); } finally { setCargando(false); }
  };

  const handleUnirse = async () => {
    if (!nombre.trim() || !codigoInput.trim()) return;
    setCargando(true);
    try {
      const data = await apiFetch('unirse', { code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() });
      if (!data.success) throw new Error(data.error);
      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_JUG, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) { setErrorMsg(err.message); } finally { setCargando(false); }
  };

  const accionSala = async (accion, extra = {}) => {
    return apiFetch(`sala/${sesion.code}/${accion}`, { token: sesion.token, ...extra });
  };

  const handleAsignar = (jugadorId) => {
    accionSala('asignar', { playerId: jugadorId, tipo: modalAsignar });
    setModalAsignar(null);
  };

  const handleSalir = () => {
    if (sala) {
      accionSala('abandonar').catch(() => console.error("Error al abandonar sala"));
    }
    sessionStorage.removeItem(CLAVE_SESION_JUG);
    setSesion(null);
    setSala(null);
    setVista('menu');
  };
  
  const copiarCodigo = () => {
    if (!sala?.code) return;
    navigator.clipboard?.writeText(sala.code);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };

  const esAdmin = sala?.esAdmin;
  const ronda = sala?.ronda;
  const ranking = sala?.jugadores ? [...sala.jugadores].sort((a, b) => b.puntos - a.puntos) : [];
  const maximo = ranking.length ? ranking[0].puntos : 0;
  const mostrarAyuda = vista === 'menu' || vista === 'crear' || vista === 'unirse' || (vista === 'sala' && sala?.estado === 'lobby');

  const jugadoresDisponibles = sala?.jugadores ? sala.jugadores.filter(j => !(ronda?.bloqueados || []).includes(j.id)) : [];

  return (
    <div className="rk-contenedor">
      {mostrarAyuda && (
        <button type="button" className="rk-btn-ayuda" onClick={() => setModalAyuda(true)} title="Reglas">
          <span className="rk-btn-ayuda-signo">?</span>
        </button>
      )}

      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal rk-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="rk-modal-header">
              <span className="rk-modal-signo-title">?</span>
              <h3>¿Cómo se juega a ¿Con quién jugaste?</h3>
            </div>
            <div className="rk-modal-cuerpo">
              <p>Aparecerá en pantalla una dupla de jugadores de fútbol[cite: 5].</p>
              <ul>
                <li>El <strong>Anfitrión (👑)</strong> hace de juez y escucha las respuestas del grupo por voz[cite: 5].</li>
                <li><strong>Acierto:</strong> +3 puntos y fin de la ronda[cite: 5].</li>
                <li><strong>Fallo:</strong> -1 punto y bloqueo del jugador en esta ronda. La ronda sigue si hay más participantes[cite: 5].</li>
              </ul>
            </div>
            <div className="rg-modal-acciones">
              <button className="big full" onClick={() => setModalAyuda(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}

      {/* MENÚ */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica"><Icon name="users" size={42} strokeWidth={1.6} /></span>
            <h1 className="title">¿Con quién jugaste?</h1>
            <p className="hint">Une los puntos entre dos jugadores que jamás imaginarías que compartieron vestuario de forma indirecta.</p>
            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}
            <div className="lb-menu">
              <button className="big full" onClick={() => { setVista('crear'); setErrorMsg(''); }}><Icon name="crown" size={22} /> Crear partida Online</button>
              <button className="big full" onClick={() => { setVista('unirse'); setErrorMsg(''); }}><Icon name="users" size={22} /> Unirse con código</button>
              <button className="secondary full" onClick={onLocal}><Icon name="home" size={20} /> Jugar en un solo dispositivo</button>
            </div>
          </div>
        </section>
      )}

      {/* CREAR */}
      {vista === 'crear' && (
        <section className="game">
          <div className="panel center">
            <h2 className="title">Crear sala Online</h2>
            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <input type="text" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={20} autoFocus />
              <button className="big full" style={{ marginTop: '1rem' }} disabled={cargando || !nombre.trim()} onClick={handleCrear}>Crear sala</button>
              <button className="secondary full" style={{ marginTop: '0.6rem' }} onClick={() => setVista('menu')}>Volver</button>
            </div>
          </div>
        </section>
      )}

      {/* UNIRSE */}
      {vista === 'unirse' && (
        <section className="game">
          <div className="panel center">
            <h2 className="title">Unirse a partida</h2>
            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <input type="text" placeholder="CÓDIGO" value={codigoInput} onChange={(e) => setCodigoInput(e.target.value.toUpperCase())} maxLength={4} style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }} autoFocus />
              <input type="text" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={20} style={{ marginTop: '0.8rem' }} />
              <button className="big full" style={{ marginTop: '1rem' }} disabled={cargando || !nombre.trim() || codigoInput.trim().length < 4} onClick={handleUnirse}>Entrar a la sala</button>
              <button className="secondary full" style={{ marginTop: '0.6rem' }} onClick={() => setVista('menu')}>Volver</button>
            </div>
          </div>
        </section>
      )}

      {/* LOBBY */}
      {vista === 'sala' && sala?.estado === 'lobby' && (
        <section className="game">
          <div className="panel center">
            <p className="categoria" style={{ display: 'inline-flex', padding: '0.3rem 0.8rem', borderRadius: '12px', alignItems: 'center', gap: '0.3rem', color: '#059669', background: '#dcfce7', border: '1px solid #34d399', fontSize: '0.85rem', fontWeight: 'bold' }}>
              <Icon name="lock" size={16} /> Sala de espera
            </p>
            <p className="hint" style={{ marginTop: '0.8rem', marginBottom: '0.2rem' }}>Código de la partida</p>
            <div style={{ display: 'inline-block', border: '2px dashed #3b82f6', borderRadius: '16px', background: '#eff6ff', padding: '1rem 2.5rem', margin: '0.5rem 0' }}>
              <h2 style={{ fontSize: '3.5rem', margin: '0', letterSpacing: '8px', color: '#1d4ed8', fontWeight: '900', cursor: 'pointer' }} onClick={copiarCodigo}>{sala.code}</h2>
            </div>
            <p className="hint small" style={{ fontStyle: 'italic', marginBottom: '0' }}>
              {codigoCopiado ? '¡Copiado al portapapeles!' : 'Comparte este código para que se unan (2 a 15 jugadores).'}
            </p>
          </div>
          
          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/15)</h3>
            <div className="lb-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === sala.yoId ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">{j.nombre}{j.id === sala.yoId ? ' (Tú)' : ''}{j.id === sala.adminId ? ' 👑' : ''}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.2rem' }}>
            {esAdmin ? (
              <button className="big full" disabled={sala.jugadores.length < 2} onClick={() => accionSala('iniciar')}>¡Empezar Partida!</button>
            ) : (
              <p className="hint center">Esperando al anfitrión...</p>
            )}
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>Salir de la sala</button>
          </div>
        </section>
      )}

      {/* JUGANDO */}
      {vista === 'sala' && sala?.estado === 'jugando' && ronda && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaNum} de {sala.maxRondas}</span>
          </div>

          <div className="panel center" style={{ margin: '2rem 0', padding: '2rem 1rem' }}>
            <h3 style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '2px', marginBottom: '1rem' }}>Compañero en común</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b', textAlign: 'center' }}>{ronda.reto.jugador1}</div>
              <Icon name="refresh" size={28} color="#94a3b8" />
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b', textAlign: 'center' }}>{ronda.reto.jugador2}</div>
            </div>
          </div>

          <div className="timer" role="timer" aria-label="Tiempo restante">
            <div className={`timer-bar${ronda.segsRestantes <= 15 ? ' low' : ''}`} style={{ width: `${(ronda.segsRestantes / TIEMPO_S) * 100}%` }} />
          </div>
          <p className="timer-text"><Icon name="clock" size={16} />{ronda.segsRestantes} s</p>

          {esAdmin ? (
            <div style={{ marginTop: '2rem', background: '#f8fafc', padding: '1.5rem 1rem', borderRadius: '12px', border: '2px dashed #cbd5e1' }}>
              <p className="hint small" style={{ marginBottom: '1rem', textAlign: 'center' }}>👑 Eres el juez. Valida las respuestas en voz alta:</p>
              
              <button 
                type="button" 
                className="secondary full" 
                style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold' }} 
                onClick={() => setModalRespuestas(true)}
              >
                 <Icon name="eye" size={18} /> Ver posibles respuestas (Chuleta)
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <button className="ok" onClick={() => setModalAsignar('acierto')}><Icon name="check" size={20} /> Correcto</button>
                <button className="secondary danger" style={{ background: '#ef4444', color: '#fff', borderColor: '#dc2626' }} onClick={() => setModalAsignar('fallo')}><Icon name="close" size={20} /> Fallo</button>
              </div>
              <button className="secondary full" style={{ marginTop: '0.6rem' }} onClick={() => accionSala('asignar', { tipo: 'rendirse' })}><Icon name="flag" size={18} /> Nadie lo sabe</button>
            </div>
          ) : (
            <div className="status-alert info" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              Debatid por voz. El anfitrión (👑) validará la respuesta.
            </div>
          )}
          
          {modalRespuestas && esAdmin && (
            <div className="rg-modal-fondo" onClick={() => setModalRespuestas(false)}>
              <div className="rg-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <h3 style={{ marginBottom: '1rem', color: '#1e1b4b' }}>Posibles Respuestas</h3>
                <p className="hint small" style={{ marginBottom: '1rem', fontStyle: 'italic' }}>Aquí tienes algunos jugadores que han compartido vestuario con ambos.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem', background: '#f1f5f9', padding: '1rem', borderRadius: '12px', textAlign: 'left' }}>
                  {ronda.reto.comunes && ronda.reto.comunes.length > 0 ? (
                    ronda.reto.comunes.map((c, i) => (
                      <div key={i} style={{ padding: '0.4rem 0', borderBottom: i !== ronda.reto.comunes.length - 1 ? '1px solid #cbd5e1' : 'none', fontWeight: 'bold', color: '#0f172a' }}>
                        • {c}
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#64748b' }}>No hay datos registrados.</div>
                  )}
                </div>
                
                <button className="big full" onClick={() => setModalRespuestas(false)}>Cerrar</button>
              </div>
            </div>
          )}

          {modalAsignar && (
            <div className="rg-modal-fondo" onClick={() => setModalAsignar(null)}>
              <div className="rg-modal" onClick={(e) => e.stopPropagation()}>
                <h3>¿Quién {modalAsignar === 'acierto' ? 'ha acertado (+3)?' : 'ha fallado (-1 y bloqueado)?'}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
                  {modalAsignar === 'acierto' ? (
                    sala.jugadores.map((j) => (
                      <button key={j.id} className="secondary full" onClick={() => handleAsignar(j.id)}>{j.nombre}</button>
                    ))
                  ) : (
                    jugadoresDisponibles.map((j) => (
                      <button key={j.id} className="secondary full" style={{ borderColor: '#ef4444', color: '#dc2626' }} onClick={() => handleAsignar(j.id)}>{j.nombre} ❌</button>
                    ))
                  )}
                </div>
                <button className="secondary danger full" style={{ marginTop: '1rem' }} onClick={() => setModalAsignar(null)}>Cancelar</button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* RESUMEN */}
      {vista === 'sala' && sala?.estado === 'resumen' && ronda && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <h1 className="title">Puntuaciones</h1>
            {ronda.ultimo && (
              <p className="reveal" style={{ fontSize: '1.2rem', margin: '1rem 0' }}>
                {ronda.ultimo.tipo === 'rendido' ? 'Se acabó el tiempo o nadie lo adivinó. 0 puntos.' :
                 ronda.ultimo.tipo === 'acierto' ? <><strong>{ronda.ultimo.jugador}</strong> acertó y suma <span style={{color: '#059669'}}>+3 pts</span>.</> :
                 <><strong>{ronda.ultimo.jugador}</strong> falló y resta <span style={{color: '#dc2626'}}>-1 pt</span>.</>}
              </p>
            )}
            <div className="scoreboard">
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row${(maximo > 0 && j.puntos === maximo) ? ' first' : ''}`}>
                  <span className="score-name">{(maximo > 0 && j.puntos === maximo) ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>} {j.nombre}</span>
                  <span className="score-pts">{j.puntos} pts</span>
                </div>
              ))}
            </div>
          </div>
          <div className="actions">
            {esAdmin ? (
              <>
                <button className="big full" onClick={() => accionSala('siguiente-ronda')}><Icon name="play" size={20} /> {sala.rondaNum >= sala.maxRondas ? 'Ver Podio Final' : 'Siguiente ronda'}</button>
                <button className="secondary danger full" onClick={() => accionSala('finalizar')}><Icon name="flagFinish" size={20} /> Terminar partida</button>
              </>
            ) : (
              <p className="hint center">Esperando al anfitrión...</p>
            )}
          </div>
        </section>
      )}

      {/* FINAL */}
      {vista === 'sala' && sala?.estado === 'final' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={48} /></span>
            <h1 className="title">Clasificación Final</h1>
            <div className="scoreboard" style={{ marginTop: '1.5rem' }}>
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row${(maximo > 0 && j.puntos === maximo) ? ' first' : ''}`}>
                  <span className="score-name">{(maximo > 0 && j.puntos === maximo) ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>} {j.nombre}</span>
                  <span className="score-pts">{j.puntos} pts</span>
                </div>
              ))}
            </div>
          </div>
          <div className="actions" style={{ marginTop: '1.5rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}><Icon name="door" size={20} /> Salir al menú</button>
          </div>
        </section>
      )}
      
      {modalSalir && (
        <div className="rg-modal-fondo" onClick={() => setModalSalir(false)}>
          <div className="rg-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>¿Abandonar la partida?</h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem' }}>Si sales de la sala perderás tu progreso actual en la partida.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginTop: '1rem' }}>
              <button type="button" className="secondary full" onClick={() => setModalSalir(false)}>Quedarme</button>
              <button type="button" className="secondary danger full" onClick={() => { setModalSalir(false); handleSalir(); }}>Sí, salir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}