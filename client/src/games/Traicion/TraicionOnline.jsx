import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Traicion.css';

const CLAVE_SESION_TR = 'traicion_online_session';
const HABITACIONES = ['Laboratorio', 'Generador', 'Comunicaciones', 'Almacén', 'Enfermería', 'Seguridad'];

export default function TraicionOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu');
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const [sala, setSala] = useState(null);
  const [sesion, setSesion] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(CLAVE_SESION_TR)); } catch { return null; }
  });

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/traicion/sala/${sesion.code}?token=${sesion.token}`)
        .then(r => r.ok ? r.json() : Promise.reject('Sala no disponible'))
        .then(d => {
          if (d.success) {
            setSala(d);
            setVista('sala');
          }
        }).catch(() => {
          sessionStorage.removeItem(CLAVE_SESION_TR);
          setSesion(null);
          setSala(null);
          setVista('menu');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 1000);
    return () => clearInterval(intervalRef.current);
  }, [sesion]);

  const peticionPost = async (endpoint, extraBody = {}) => {
    setCargando(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/traicion/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion?.token, code: sesion?.code, ...extraBody })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.token) {
        const nueva = { code: data.code, token: data.token };
        sessionStorage.setItem(CLAVE_SESION_TR, JSON.stringify(nueva));
        setSesion(nueva);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleCrear = () => nombre.trim() && peticionPost('crear', { nombre });
  const handleUnirse = () => nombre.trim() && codigoInput && peticionPost('unirse', { nombre, joinCode: codigoInput.toUpperCase() });
  
  const handleSalir = () => { 
    if (sesion) peticionPost(`sala/${sesion.code}/salir`); 
    sessionStorage.removeItem(CLAVE_SESION_TR); 
    setSesion(null); 
    setSala(null);
    setVista('menu'); 
    setModalSalir(false);
  };

  const copiarCodigo = () => {
    if (!sala?.code) return;
    navigator.clipboard?.writeText(sala.code);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };

  // -------------------------------------------------------------
  // VISTAS DE MENÚS (Crear, Unirse, Portada)
  // -------------------------------------------------------------

  if (vista === 'menu') {
    return (
      <div className="tr-contenedor">
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="lock" size={42} strokeWidth={1.6} />
            </span>
            <h1 className="title">Traiciones</h1>
            <p className="hint">Reparad la base o eliminadlos a todos en secreto. Mínimo 7 jugadores.</p>

            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

            <div className="lb-menu">
              <button className="big full" onClick={() => { setVista('crear'); setErrorMsg(''); }}>
                <Icon name="crown" size={22} /> Crear partida
              </button>
              <button className="big full" onClick={() => { setVista('unirse'); setErrorMsg(''); }}>
                <Icon name="users" size={22} /> Unirse a partida
              </button>
              <button className="secondary full" onClick={onLocal}>
                <Icon name="home" size={20} /> Jugar en un dispositivo
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (vista === 'crear' || vista === 'unirse') {
    return (
      <div className="tr-contenedor">
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name={vista === 'crear' ? 'crown' : 'users'} size={40} strokeWidth={1.6} />
            </span>
            <h2 className="title">{vista === 'crear' ? 'Crear partida' : 'Unirse a partida'}</h2>
            
            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              {vista === 'unirse' && (
                <>
                  <label className="field-label">Código de la sala</label>
                  <input 
                    className="lb-input-codigo" 
                    placeholder="ABCD" 
                    value={codigoInput} 
                    onChange={(e) => setCodigoInput(e.target.value.toUpperCase())} 
                    maxLength={4} 
                    style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                  />
                </>
              )}
              
              <label className="field-label" style={{ marginTop: '1rem' }}>Tu nombre</label>
              <input 
                placeholder="Tu nombre" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                maxLength={15} 
                autoFocus
              />

              {errorMsg && <p className="error">{errorMsg}</p>}

              <button 
                className="big full" 
                style={{ marginTop: '1rem' }} 
                disabled={cargando || !nombre.trim() || (vista === 'unirse' && codigoInput.length < 4)}
                onClick={vista === 'crear' ? handleCrear : handleUnirse}
              >
                <Icon name="check" size={22} strokeWidth={2.5} /> Continuar
              </button>
              <button className="secondary full" style={{ marginTop: '0.6rem' }} onClick={() => setVista('menu')}>
                Volver
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!sala) return <div className="panel center"><p>Cargando sala...</p></div>;

  const yo = sala.jugadores.find(j => j.esTu);
  const esAdmin = sala.esAdmin;
  const faltan = 7 - sala.jugadores.length;

  return (
    <div className="tr-contenedor">
      {/* -------------------------------------------------------------
          SALA: LOBBY
          ------------------------------------------------------------- */}
      {sala.estado === 'lobby' && (
        <section className="game">
          <div className="panel center">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.35rem 1.1rem',
                borderRadius: '9999px', border: '1.5px solid #22c55e', backgroundColor: '#f0fdf4',
                color: '#16a34a', fontSize: '0.85rem', fontWeight: 600
              }}>
                <Icon name="lock" size={15} /> Sala de espera
              </span>
            </div>
            <p className="hint">Código de la partida</p>
            <button type="button" className="qq-codigo-btn" onClick={copiarCodigo} title="Copiar código">
              {sala.code}
            </button>
            <p className="hint small">
              {codigoCopiado ? '¡Copiado al portapapeles!' : 'Compártelo con los demás.'}
            </p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/15)</h3>
            <div className="lb-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.esTu ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">{j.nombre} {j.esTu && '(tú)'} {j.esAdmin && '👑'} {j.bot && '🤖'}</span>
                  {esAdmin && !j.esTu && (
                    <button type="button" className="secondary lb-quitar" style={{padding:'0.2rem 0.5rem', fontSize:'0.75rem', height:'auto'}} onClick={() => peticionPost(`sala/${sesion.code}/expulsar`, { id: j.id })}>
                      Quitar
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {faltan > 0 ? (
              <p className="hint" style={{ marginTop: '0.8rem' }}>Faltan {faltan} jugador{faltan === 1 ? '' : 'es'} para poder empezar (mínimo 7).</p>
            ) : (
              <p className="hint ok" style={{ marginTop: '0.8rem' }}>¡Ya sois suficientes! El anfitrión puede empezar cuando quiera.</p>
            )}
            
            {esAdmin && sala.jugadores.length < 15 && (
              <button type="button" className="secondary full" style={{marginTop:'1rem'}} onClick={() => peticionPost(`sala/${sesion.code}/addBot`)}>
                <Icon name="chip" size={18} /> Añadir bot de prueba
              </button>
            )}
          </div>

          {esAdmin && (
            <div className="panel" style={{ marginTop: '1rem' }}>
              <h3 className="panel-title"><Icon name="settings" size={20} /> Opciones de partida</h3>
              <label className="field-label">Número de infectados</label>
              <select value={sala.numInfectados || 2} onChange={(e) => peticionPost(`sala/${sesion.code}/config`, { numInfectados: Number(e.target.value) })}>
                <option value={1}>1 Infectado</option>
                <option value={2}>2 Infectados (Recomendado 7-10 jug)</option>
                <option value={3}>3 Infectados (Recomendado 11-15 jug)</option>
                <option value={4}>4 Infectados (Caos total)</option>
              </select>
            </div>
          )}

          <div className="actions" style={{ marginTop: '1rem' }}>
            {esAdmin && (
              <button 
                className="big full" 
                disabled={faltan > 0} 
                onClick={() => peticionPost(`sala/${sesion.code}/iniciar`)}
              >
                <Icon name="play" size={22} /> Empezar Partida
              </button>
            )}
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir
            </button>
          </div>
        </section>
      )}

      {/* -------------------------------------------------------------
          FASES DE JUEGO OCULTAS (Noche / Oscuras)
          ------------------------------------------------------------- */}
      {['despliegue', 'accion', 'votacion'].includes(sala.estado) && (
        <section className="game tr-escena-noche">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.ronda}</span>
            <span className="chip alt">Sala: {sala.code}</span>
          </div>

          <div className="panel center" style={{background: 'transparent', boxShadow: 'none', color: 'white'}}>
            
            {/* ROL CARD */}
            {yo && (
              <div className={`tr-rol-card ${yo.rol?.toLowerCase()}`}>
                <h3 className="tr-rol-title">Eres {yo.rol}</h3>
                <p style={{fontSize: '0.9rem', opacity: 0.9}}>
                  {!yo.vivo ? 'Estás muerto. Solo puedes observar en silencio.' : (yo.rol === 'Infectado' ? 'Sabotea y asesina sin ser descubierto.' : 'Repara la base y encuentra a los infectados.')}
                </p>
              </div>
            )}

            {/* DESPLIEGUE */}
            {sala.estado === 'despliegue' && (
              yo?.vivo && !yo.habitacion ? (
                <>
                  <h3 className="panel-title" style={{color:'white'}}>Elige tu destino</h3>
                  <p className="hint" style={{color:'#cbd5e1'}}>Selecciona a qué habitación vas a ir en secreto.</p>
                  <div className="tr-rooms-grid">
                    {HABITACIONES.map(h => (
                      <button key={h} className="tr-room-btn" onClick={() => peticionPost(`sala/${sesion.code}/mover`, { habitacion: h })}>
                        {h}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{padding: '2rem 1rem'}}>
                  <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
                  <p className="hint" style={{marginTop:'1rem', color:'#cbd5e1'}}>Esperando a que el resto se despliegue...</p>
                </div>
              )
            )}

            {/* ACCION (Infectados) */}
            {sala.estado === 'accion' && (
              yo?.vivo && yo.rol === 'Infectado' && !yo.accion ? (
                <>
                  <h3 className="panel-title" style={{color:'white'}}>Estás en {yo.habitacion}</h3>
                  <p className="hint" style={{color:'#cbd5e1'}}>¿Qué vas a hacer aquí?</p>
                  <div className="lb-form" style={{ marginTop: '1rem' }}>
                    <button className="secondary full" style={{background:'white', color:'black'}} onClick={() => peticionPost(`sala/${sesion.code}/accion`, { accion: 'trabajar' })}>
                      🛠️ Trabajar (Disimular)
                    </button>
                    <button className="secondary danger full" style={{marginTop:'0.8rem'}} onClick={() => peticionPost(`sala/${sesion.code}/accion`, { accion: 'sabotear' })}>
                      💥 Sabotear (-15% Progreso)
                    </button>
                    {sala.enHabitacion?.filter(j => j.id !== yo.id).map(j => (
                      <button key={j.id} className="big full" style={{marginTop:'0.8rem', background:'#dc2626', borderColor:'#991b1b'}} onClick={() => peticionPost(`sala/${sesion.code}/accion`, { accion: `matar_${j.id}` })}>
                        🔪 Eliminar a {j.nombre}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{padding: '2rem 1rem'}}>
                  <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
                  <p className="hint" style={{marginTop:'1rem', color:'#cbd5e1'}}>Acciones en curso en la base...</p>
                </div>
              )
            )}

            {/* VOTACION */}
            {sala.estado === 'votacion' && (
              yo?.vivo && !yo.voto ? (
                <>
                  <h3 className="panel-title" style={{color:'white'}}>Votación secreta</h3>
                  <p className="hint" style={{color:'#cbd5e1'}}>¿A quién expulsamos a la nieve?</p>
                  <div className="lb-form" style={{ marginTop: '1rem' }}>
                    <button className="secondary full" style={{background:'white', color:'black'}} onClick={() => peticionPost(`sala/${sesion.code}/votar`, { voto: 'nadie' })}>
                      A nadie (Omitir voto)
                    </button>
                    <div style={{display:'flex', flexDirection:'column', gap:'0.6rem', marginTop:'1rem'}}>
                      {sala.jugadores.filter(j => j.vivo && j.id !== yo.id).map(j => (
                        <button key={j.id} className="secondary danger full" onClick={() => peticionPost(`sala/${sesion.code}/votar`, { voto: j.id })}>
                          Expulsar a {j.nombre}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div style={{padding: '2rem 1rem'}}>
                  <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
                  <p className="hint" style={{marginTop:'1rem', color:'#cbd5e1'}}>Esperando a que todos voten...</p>
                </div>
              )
            )}

          </div>
        </section>
      )}

      {/* -------------------------------------------------------------
          FASES PÚBLICAS (Reporte / Resultado)
          ------------------------------------------------------------- */}
      {['reporte', 'resultado'].includes(sala.estado) && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.ronda}</span>
            <span className="chip alt">Sala: {sala.code}</span>
          </div>
          
          <div className="panel center">
            <div className="end-card" style={{padding:'0', background:'transparent', boxShadow:'none', color:'inherit'}}>
              <span className="end-icon" style={{background:'#f1f5f9', color:'#3b82f6'}}><Icon name="check" size={44} /></span>
              <h1 className="title">Reporte de la Ronda</h1>
            </div>
            
            <div className="tr-progress-bar">
              <div className="tr-progress-fill" style={{width: `${sala.progreso}%`}}></div>
            </div>
            <p className="hint">Progreso de rescate: <strong>{sala.progreso}%</strong></p>

            <div className="tr-reporte-box">
              {sala.historialReporte?.map((r, i) => (
                <p key={i} className={r.includes('💀') || r.includes('❄️') || r.includes('💥') ? 'danger' : ''}>{r}</p>
              ))}
            </div>

            {sala.estado === 'reporte' && (
              <p className="hint">¡Hablad en voz alta! Buscad coartadas o mentid para sobrevivir.</p>
            )}

            <div className="actions" style={{ marginTop: '1.2rem' }}>
              {esAdmin && sala.estado === 'reporte' && (
                <button className="big full" onClick={() => peticionPost(`sala/${sesion.code}/continuar`)}>
                  <Icon name="landmark" size={20} /> Pasar a Votación
                </button>
              )}
              {esAdmin && sala.estado === 'resultado' && (
                <button className="big full" onClick={() => peticionPost(`sala/${sesion.code}/siguiente`)}>
                  <Icon name="forward" size={20} /> Siguiente Ronda
                </button>
              )}
              {!esAdmin && (
                <p className="hint center">Esperando al anfitrión...</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* -------------------------------------------------------------
          FIN DE PARTIDA
          ------------------------------------------------------------- */}
      {sala.estado === 'fin' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon">
              <Icon name={sala.ganador === 'Infectados' ? 'skull' : 'trophy'} size={44} />
            </span>
            <h1 className="title">Partida Terminada</h1>
            <p className="final-score" style={{color: sala.ganador === 'Infectados' ? '#dc2626' : '#16a34a'}}>
              Han ganado los {sala.ganador}
            </p>
          </div>

          <div className="panel reveal-panel" style={{marginTop:'1rem'}}>
            <h3 className="reveal-title"><Icon name="eye" size={20} /> Identidades reveladas</h3>
            <div className="reveal-list">
              {sala.jugadores.map((j) => (
                <div key={j.id} className="reveal-row">
                  <span className="reveal-name" style={{textDecoration: !j.vivo ? 'line-through' : 'none', opacity: !j.vivo ? 0.6 : 1}}>
                    {j.nombre} {j.bot && '🤖'}
                  </span>
                  <span className="reveal-card" style={{color: j.rol === 'Infectado' ? '#dc2626' : '#64748b'}}>{j.rol}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            {esAdmin ? (
              <button className="big full" onClick={() => peticionPost(`sala/${sesion.code}/iniciar`)}>
                <Icon name="refresh" size={20} /> Jugar de nuevo
              </button>
            ) : (
              <p className="hint center">El anfitrión puede iniciar otra partida.</p>
            )}
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir al menú
            </button>
          </div>
        </section>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA SALIR */}
      {modalSalir && (
        <div className="rg-modal-fondo" onClick={() => setModalSalir(false)}>
          <div className="rg-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}>
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🚪</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>¿Abandonar la partida?</h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              Perderás tu progreso actual. ¿Estás seguro?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button type="button" className="secondary full" onClick={() => setModalSalir(false)}>No, quedarme</button>
              <button type="button" className="secondary danger full" onClick={handleSalir}>Sí, salir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}