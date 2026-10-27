// client/src/games/Jugadores/JugadoresOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import '../Adivina/Adivina.css';

const CLAVE_SESION_JUG = 'jugadores_online_session';

export default function JugadoresOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_JUG));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [modalAsignar, setModalAsignar] = useState(null); // 'acierto' | 'fallo'
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

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setCargando(true);
    try {
      const res = await fetch('/api/jugadores/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_JUG, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) { setErrorMsg(err.message); }
    finally { setCargando(false); }
  };

  const handleUnirse = async () => {
    if (!nombre.trim() || !codigoInput.trim()) return;
    setCargando(true);
    try {
      const res = await fetch('/api/jugadores/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_JUG, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) { setErrorMsg(err.message); }
    finally { setCargando(false); }
  };

  const accionAdmin = async (endpoint, payload = {}) => {
    try {
      await fetch(`/api/jugadores/online/sala/${sesion.code}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, ...payload })
      });
    } catch (err) { console.error(err); }
  };

  const handleAsignar = (jugadorId) => {
    accionAdmin('asignar', { playerId: jugadorId, tipo: modalAsignar });
    setModalAsignar(null);
  };

  const handleSalir = () => {
    sessionStorage.removeItem(CLAVE_SESION_JUG);
    setSesion(null);
    setSala(null);
    setVista('menu');
  };

  const esAdmin = sala?.esAdmin;
  const ronda = sala?.ronda;
  const ranking = sala?.jugadores ? [...sala.jugadores].sort((a, b) => b.puntos - a.puntos) : [];
  const maximo = ranking.length ? ranking[0].puntos : 0;
  const ganadores = maximo > 0 ? ranking.filter((j) => j.puntos === maximo) : [];
  const mostrarAyuda = vista === 'menu' || vista === 'crear' || vista === 'unirse' || (vista === 'sala' && sala?.estado === 'lobby');

  return (
    <div className="cancion-contenedor">
      {mostrarAyuda && (
        <button type="button" className="btn-ayuda-flotante" onClick={() => setModalAyuda(true)} title="Reglas">
          <span className="btn-ayuda-flotante-signo">?</span>
        </button>
      )}

      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal" onClick={(e) => e.stopPropagation()}>
            <h3>¿Cómo se juega a ¿Con quién jugaste?</h3>
            <p>Aparecerá en pantalla una dupla de jugadores de fútbol que <strong>han tenido al menos un compañero en común a lo largo de su carrera.</strong></p>
            <ul>
              <li>El <strong>Anfitrión (👑)</strong> hace de juez y escucha las respuestas del grupo por voz durante los 120 segundos.</li>
              <li>Si alguien lo adivina, el juez pulsa "Correcto" y le adjudica los puntos. Si alguien dice una locura, puede pulsar "Fallo" y restarle puntos.</li>
              <li><strong>Acierto:</strong> +3 puntos.</li>
              <li><strong>Fallo:</strong> -1 punto.</li>
            </ul>
            <button className="big full" style={{ marginTop: '1rem' }} onClick={() => setModalAyuda(false)}>Entendido</button>
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

      {/* CREAR / UNIRSE */}
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
            <p className="categoria"><Icon name="lock" size={16} />Sala de espera</p>
            <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', letterSpacing: '4px' }}>{sala.code}</h2>
          </div>
          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/15)</h3>
            <div className="lb-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === sala.yoId ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">{j.nombre}{j.id === sala.yoId ? ' (Tú)' : ''}{j.id === 1 ? ' 👑' : ''}</span>
                </div>
              ))}
            </div>
          </div>
          {esAdmin ? (
            <button className="big full" style={{ marginTop: '1.2rem' }} disabled={sala.jugadores.length < 2} onClick={() => accionAdmin('iniciar')}>¡Empezar Partida!</button>
          ) : (
            <p className="hint center" style={{ marginTop: '1.2rem' }}>Esperando al anfitrión...</p>
          )}
          <button className="secondary danger full" style={{ marginTop: '1rem' }} onClick={() => setModalSalir(true)}>Salir de la sala</button>
        </section>
      )}

      {/* JUGANDO */}
      {vista === 'sala' && sala?.estado === 'jugando' && ronda && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Ronda {sala.rondaNum} de {sala.maxRondas}</span>
          </div>

          <div className="panel center" style={{ margin: '2rem 0', padding: '3rem 1rem' }}>
            <h3 style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '2px', marginBottom: '1rem' }}>Compañero en común</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b', textAlign: 'center' }}>{ronda.reto.jugador1}</div>
              <Icon name="refresh" size={28} color="#94a3b8" />
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b', textAlign: 'center' }}>{ronda.reto.jugador2}</div>
            </div>
          </div>

          <div className="timer" role="timer" aria-label="Tiempo restante">
            <div className={`timer-bar${ronda.segsRestantes <= 15 ? ' low' : ''}`} style={{ width: `${(ronda.segsRestantes / TIEMPO_TURNO) * 100}%` }} />
          </div>
          <p className="timer-text"><Icon name="clock" size={16} />{ronda.segsRestantes} s</p>

          {esAdmin ? (
            <div style={{ marginTop: '2rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '2px dashed #cbd5e1' }}>
              <p className="hint small" style={{ marginBottom: '0.8rem', textAlign: 'center' }}>👑 Eres el juez. Valida las respuestas en voz alta:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <button className="ok" onClick={() => setModalAsignar('acierto')}><Icon name="check" size={20} /> Correcto</button>
                <button className="secondary danger" style={{ background: '#ef4444', color: '#fff', borderColor: '#dc2626' }} onClick={() => setModalAsignar('fallo')}><Icon name="close" size={20} /> Fallo</button>
              </div>
              <button className="secondary full" style={{ marginTop: '0.6rem' }} onClick={() => accionAdmin('asignar', { tipo: 'rendirse' })}><Icon name="flag" size={18} /> Nadie lo sabe</button>
            </div>
          ) : (
            <div className="status-alert info" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              Debatid por voz. El anfitrión (👑) validará la respuesta.
            </div>
          )}

          {/* Modal Asignar Admin */}
          {modalAsignar && (
            <div className="rg-modal-fondo" onClick={() => setModalAsignar(null)}>
              <div className="rg-modal" onClick={(e) => e.stopPropagation()}>
                <h3>¿Quién {modalAsignar === 'acierto' ? 'ha acertado (+3)?' : 'ha fallado (-1)?'}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
                  {sala.jugadores.map((j) => (
                    <button key={j.id} className="secondary full" onClick={() => handleAsignar(j.id)}>{j.nombre}</button>
                  ))}
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
                {ronda.ultimo.tipo === 'rendido' ? 'Nadie lo adivinó. 0 puntos.' :
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
                <button className="big full" onClick={() => accionAdmin('siguiente-ronda')}><Icon name="play" size={20} /> {sala.rondaNum >= sala.maxRondas ? 'Ver Podio Final' : 'Siguiente ronda'}</button>
                <button className="secondary danger full" onClick={() => accionAdmin('finalizar')}><Icon name="flagFinish" size={20} /> Terminar partida</button>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button type="button" className="secondary full" onClick={() => setModalSalir(false)}>No, quedarme</button>
              <button type="button" className="secondary danger full" style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }} onClick={() => { setModalSalir(false); handleSalir(); }}>Sí, salir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}