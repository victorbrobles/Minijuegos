import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Coleccion.css';

const CLAVE_SESION_COL = 'coleccion_online_session';

export default function ColeccionOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu');
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAccion, setModalAccion] = useState(null);

  const [sala, setSala] = useState(null);
  const [sesion, setSesion] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(CLAVE_SESION_COL)); } catch { return null; }
  });

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/coleccion/sala/${sesion.code}?token=${sesion.token}`)
        .then(r => r.ok ? r.json() : Promise.reject('Sala no disponible'))
        .then(d => {
          if (d.success) {
            setSala(d);
            setVista('sala');
          }
        }).catch(() => {
          sessionStorage.removeItem(CLAVE_SESION_COL);
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
      const res = await fetch(`/api/coleccion/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion?.token, code: sesion?.code, ...extraBody })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.token) {
        const nueva = { code: data.code, token: data.token };
        sessionStorage.setItem(CLAVE_SESION_COL, JSON.stringify(nueva));
        setSesion(nueva);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
      setModalAccion(null);
    }
  };

  const handleCrear = () => nombre.trim() && peticionPost('crear', { nombre });
  const handleUnirse = () => nombre.trim() && codigoInput && peticionPost('unirse', { nombre, joinCode: codigoInput.toUpperCase() });
  
  const handleSalir = () => { 
    if (sesion) peticionPost(`sala/${sesion.code}/salir`); 
    sessionStorage.removeItem(CLAVE_SESION_COL); 
    setSesion(null); 
    setSala(null);
    setVista('menu'); 
    setModalSalir(false);
  };

  if (vista === 'menu') {
    return (
      <div className="col-contenedor">
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica"><Icon name="cards" size={42} strokeWidth={1.6} /></span>
            <h1 className="title">Colecciona con Cabeza</h1>
            <p className="hint">Consigue 5 cartas iguales. ¡Si tienes 5 distintas, pierdes!</p>
            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}
            <div className="lb-menu">
              <button className="big full" onClick={() => { setVista('crear'); setErrorMsg(''); }}><Icon name="crown" size={22} /> Crear partida</button>
              <button className="big full" onClick={() => { setVista('unirse'); setErrorMsg(''); }}><Icon name="users" size={22} /> Unirse a partida</button>
              <button className="secondary full" onClick={onLocal}><Icon name="home" size={20} /> Jugar en un dispositivo</button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (vista === 'crear' || vista === 'unirse') {
    return (
      <div className="col-contenedor">
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica"><Icon name={vista === 'crear' ? 'crown' : 'users'} size={40} /></span>
            <h2 className="title">{vista === 'crear' ? 'Crear partida' : 'Unirse a partida'}</h2>
            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              {vista === 'unirse' && (
                <><label className="field-label">Código de la sala</label>
                <input className="lb-input-codigo" placeholder="ABCD" value={codigoInput} onChange={(e) => setCodigoInput(e.target.value.toUpperCase())} maxLength={4} style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }} /></>
              )}
              <label className="field-label" style={{ marginTop: '1rem' }}>Tu nombre</label>
              <input placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={15} autoFocus />
              {errorMsg && <p className="error">{errorMsg}</p>}
              <button className="big full" style={{ marginTop: '1rem' }} disabled={cargando || !nombre.trim() || (vista === 'unirse' && codigoInput.length < 4)} onClick={vista === 'crear' ? handleCrear : handleUnirse}><Icon name="check" size={22} strokeWidth={2.5} /> Continuar</button>
              <button className="secondary full" style={{ marginTop: '0.6rem' }} onClick={() => setVista('menu')}>Volver</button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!sala) return <div className="panel center"><p>Cargando sala...</p></div>;

  const yo = sala.jugadores.find(j => j.esTu);
  const esAdmin = yo?.esAdmin;
  const faltan = 2 - sala.jugadores.length;

  if (sala.estado === 'lobby') {
    return (
      <div className="col-contenedor">
        <section className="game">
          <div className="panel center">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}><span className="chip alt"><Icon name="lock" size={15} />Sala de espera</span></div>
            <p className="hint">Código de la partida</p>
            <button type="button" className="qq-codigo-btn" onClick={() => { navigator.clipboard?.writeText(sala.code); }}>{sala.code}</button>
          </div>
          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/8)</h3>
            <div className="lb-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.esTu ? 'yo' : ''}`}><span className="lb-jug-nombre">{j.nombre} {j.esTu && '(tú)'} {j.esAdmin && '👑'}</span></div>
              ))}
            </div>
            {faltan > 0 && <p className="hint" style={{ marginTop: '0.8rem' }}>Faltan {faltan} jugadores.</p>}
          </div>
          <div className="actions" style={{ marginTop: '1rem' }}>
            {esAdmin && <button className="big full" disabled={faltan > 0} onClick={() => peticionPost('iniciar')}><Icon name="play" size={22} /> Empezar Partida</button>}
            <button className="secondary danger full" onClick={() => setModalSalir(true)}><Icon name="door" size={20} /> Salir</button>
          </div>
        </section>
        {modalSalir && (
          <div className="rg-modal-fondo" onClick={() => setModalSalir(false)}>
            <div className="rg-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', padding: '1.8rem 1.4rem' }}>
              <h3 style={{ margin: '0 0 0.6rem' }}>¿Abandonar la partida?</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <button type="button" className="secondary full" onClick={() => setModalSalir(false)}>Quedarme</button>
                <button type="button" className="secondary danger full" onClick={handleSalir}>Salir</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (sala.estado === 'fin') {
    return (
      <div className="col-contenedor">
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <h1 className="title">Partida Terminada</h1>
            <p className="final-score" style={{color: '#16a34a'}}>Ganador: {sala.ganador}</p>
          </div>
          <div className="panel reveal-panel" style={{marginTop:'1rem'}}>
            <h3 className="reveal-title"><Icon name="eye" size={20} /> Registro de sucesos</h3>
            {sala.log.slice(0, 5).map((l, i) => <p key={i} className="hint small" style={{marginBottom:'0.4rem'}}>{l}</p>)}
          </div>
          <div className="actions" style={{ marginTop: '1.2rem' }}>
            {esAdmin && <button className="big full" onClick={() => peticionPost('iniciar')}><Icon name="refresh" size={20} /> Jugar de nuevo</button>}
            <button className="secondary danger full" onClick={handleSalir}><Icon name="door" size={20} /> Salir al menú</button>
          </div>
        </section>
      </div>
    );
  }

  const miTurno = sala.turnoActivo === yo?.id;
  const vivosRival = sala.jugadores.filter(j => j.vivo && j.id !== yo?.id);

  const handleClickMano = (carta) => {
    if (!miTurno || sala.faseTurno !== 'jugar') return;
    if (carta.tipo === 'palo' || carta.accion === 'suministros') {
      peticionPost('jugar', { cartaId: carta.uid });
    } else {
      setModalAccion({ carta, step: 1, targetId: null, miCartaId: null });
    }
  };

  return (
    <div className="col-contenedor">
      <section className="game">
        <div className="col-jugadores-top">
          {sala.jugadores.map(j => (
            <div key={j.id} className={`col-jug-chip ${!j.vivo ? 'muerto' : ''} ${sala.turnoActivo === j.id ? 'activo' : ''}`}>
              {j.nombre} {j.vivo && `(${j.cartasCount})`}
            </div>
          ))}
        </div>

        {sala.log.length > 0 && <p className="hint center small" style={{marginBottom:'1rem'}}>{sala.log[0]}</p>}

        <div className="col-zonas-comunes">
          <div className="col-mazo-container">
            <span className="field-label">Mazo ({sala.mazoCount})</span>
            <div className={`col-carta reverso ${(!miTurno || sala.faseTurno !== 'robar') ? 'disabled' : ''}`} onClick={() => miTurno && sala.faseTurno === 'robar' && peticionPost('robar', { origen: 'mazo' })}>
              <span>🃏</span><small>Robar</small>
            </div>
          </div>
          <div className="col-mazo-container">
            <span className="field-label">Descarte</span>
            {sala.topDescarte ? (
              <div className={`col-carta ${sala.topDescarte.tipo==='accion'?'accion':''} ${(!miTurno || sala.faseTurno !== 'robar') ? 'disabled' : ''}`} onClick={() => miTurno && sala.faseTurno === 'robar' && peticionPost('robar', { origen: 'descarte' })}>
                <span>{sala.topDescarte.icono}</span><small>{sala.topDescarte.nombre}</small>
              </div>
            ) : (
              <div className="col-carta disabled"><small>Vacío</small></div>
            )}
          </div>
        </div>

        <div className="panel center" style={{padding:'1rem'}}>
          <h3 className="panel-title">{yo?.vivo ? 'Tu Mano' : 'Estás eliminado 💀'}</h3>
          {yo?.vivo && (
            <p className="hint small" style={{marginBottom:'1rem'}}>
              {miTurno ? (sala.faseTurno === 'robar' ? 'Paso 1: Roba del Mazo o del Descarte.' : 'Paso 2: Descarta un Palo o juega una Acción.') : 'Es el turno de otro jugador.'}
            </p>
          )}
          <div className={`col-mano ${miTurno && sala.faseTurno === 'jugar' ? 'activa' : ''}`}>
            {yo?.mano?.map(c => (
              <div key={c.uid} className={`col-carta ${c.tipo==='accion'?'accion':''} ${(!miTurno || sala.faseTurno !== 'jugar') ? 'disabled' : ''}`} onClick={() => handleClickMano(c)}>
                <span>{c.icono}</span><small>{c.nombre}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal Acciones */}
      {modalAccion && (
        <div className="rg-modal-fondo" onClick={() => setModalAccion(null)}>
          <div className="rg-modal" onClick={ev => ev.stopPropagation()} style={{maxWidth: '400px', padding: '1.5rem'}}>
            <h3 style={{marginBottom:'1rem'}}>{modalAccion.carta.nombre} {modalAccion.carta.icono}</h3>
            {modalAccion.step === 1 && (
              <>
                <p className="hint" style={{marginBottom:'1rem'}}>¿A quién le vas a aplicar el efecto?</p>
                <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
                  {vivosRival.map(j => (
                    <button key={j.id} className="secondary full" onClick={() => {
                      if (modalAccion.carta.accion === 'ladron') peticionPost('jugar', { cartaId: modalAccion.carta.uid, targetId: j.id });
                      else setModalAccion({ ...modalAccion, step: 2, targetId: j.id });
                    }}>
                      {j.nombre} ({j.cartasCount} cartas)
                    </button>
                  ))}
                </div>
              </>
            )}
            {modalAccion.step === 2 && modalAccion.carta.accion === 'cambio' && (
              <>
                <p className="hint" style={{marginBottom:'1rem'}}>¿Qué carta tuya le vas a dar?</p>
                <div className="col-mano" style={{padding:'1rem'}}>
                  {yo.mano.filter(c => c.uid !== modalAccion.carta.uid).map(c => (
                    <div key={c.uid} className={`col-carta ${c.tipo==='accion'?'accion':''}`} onClick={() => peticionPost('jugar', { cartaId: modalAccion.carta.uid, targetId: modalAccion.targetId, miCartaId: c.uid })}>
                      <span>{c.icono}</span><small>{c.nombre}</small>
                    </div>
                  ))}
                </div>
              </>
            )}
            <button className="secondary danger full" style={{marginTop:'1rem'}} onClick={() => setModalAccion(null)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}