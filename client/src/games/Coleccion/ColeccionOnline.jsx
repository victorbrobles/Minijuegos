import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Coleccion.css';

const CLAVE_SESION_COL = 'coleccion_online_session';

const PALOS = [
  { id: 'manzana', nombre: 'Manzana', icono: '🍎' },
  { id: 'seta', nombre: 'Seta', icono: '🍄' },
  { id: 'diamante', nombre: 'Diamante', icono: '💎' },
  { id: 'espada', nombre: 'Espada', icono: '🗡️' },
  { id: 'pocion', nombre: 'Poción', icono: '🧪' },
  { id: 'corona', nombre: 'Corona', icono: '👑' },
  { id: 'luna', nombre: 'Luna', icono: '🌙' },
  { id: 'rayo', nombre: 'Rayo', icono: '⚡' }
];

const ACCIONES = [
  { id: 'intercambio_azar', nombre: 'Ruleta', icono: '🔀', desc: 'Intercambias 1 carta al azar con un rival.' },
  { id: 'robar_tres', nombre: 'Suministros', icono: '📦', desc: 'Robas 3 cartas de una en una. Al robar la 3ª acaba tu turno.' },
  { id: 'descartar_tres', nombre: 'Purga', icono: '🗑️', desc: 'Descarta hasta 3 cartas de tu mano.' },
  { id: 'robar_elegida', nombre: 'Robo Preciso', icono: '🎯', desc: 'Miras la mano de un rival y le robas la que elijas.' },
  { id: 'dar_carta', nombre: 'Regalo Envenenado', icono: '🎁', desc: 'Le encasquetas una carta de tu mano a un rival.' },
  { id: 'ver_mano', nombre: 'Espionaje', icono: '👁️‍🗨️', desc: 'Miras todas las cartas de un rival.' },
  { id: 'retar', nombre: 'Duelo', icono: '⚔️', desc: 'Pides un palo. Si lo tiene te lo da; si no, te roba él.' },
  { id: 'cambiar_mano', nombre: 'Torbellino', icono: '🌪️', desc: 'Intercambias tu mano entera con la de un rival.' }
];

export default function ColeccionOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu');
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);

  const [modal, setModal] = useState(null);
  const [purgaSeleccionadas, setPurgaSeleccionadas] = useState([]);
  const [manoEspiada, setManoEspiada] = useState(null);
  const [resumenAccion, setResumenAccion] = useState(null);
  const [avisoDerrotaVisto, setAvisoDerrotaVisto] = useState(false);

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
      return data;
    } catch (err) {
      setErrorMsg(err.message);
      return null;
    } finally {
      setCargando(false);
      setModal(null);
      setPurgaSeleccionadas([]);
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
            <p className="hint">Consigue 5 cartas iguales. ¡Si juntas 5 palos diferentes, pierdes!</p>
            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}
            <div className="lb-menu">
              <button className="big full" onClick={() => { setVista('crear'); setErrorMsg(''); }}><Icon name="crown" size={22} /> Crear partida</button>
              <button className="big full" onClick={() => { setVista('unirse'); setErrorMsg(''); }}><Icon name="users" size={22} /> Unirse a partida</button>
              <button className="secondary full" onClick={onLocal}>Modo en un dispositivo</button>
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
                <>
                  <label className="field-label">Código de la sala</label>
                  <input className="lb-input-codigo" placeholder="ABCD" value={codigoInput} onChange={(e) => setCodigoInput(e.target.value.toUpperCase())} maxLength={4} style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }} />
                </>
              )}
              <label className="field-label" style={{ marginTop: '1rem' }}>Tu nombre</label>
              <input placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={15} autoFocus />
              {errorMsg && <p className="error">{errorMsg}</p>}
              <button className="big full" style={{ marginTop: '1rem' }} disabled={cargando || !nombre.trim() || (vista === 'unirse' && codigoInput.length < 4)} onClick={vista === 'crear' ? handleCrear : handleUnirse}>
                <Icon name="check" size={22} strokeWidth={2.5} /> Continuar
              </button>
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
            {faltan > 0 && <p className="hint" style={{ marginTop: '0.8rem' }}>Faltan {faltan} jugador(es) para poder iniciar.</p>}
          </div>
          <div className="actions" style={{ marginTop: '1rem' }}>
            {esAdmin && <button className="big full" disabled={faltan > 0} onClick={() => peticionPost('iniciar')}><Icon name="play" size={22} /> Empezar Partida</button>}
            <button className="secondary danger full" onClick={() => setModalSalir(true)}><Icon name="door" size={20} /> Salir</button>
          </div>
        </section>
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
            <p className="final-score" style={{ color: '#16a34a' }}>Ganador: {sala.ganador}</p>
          </div>
          <div className="panel reveal-panel" style={{ marginTop: '1rem' }}>
            <h3 className="reveal-title"><Icon name="eye" size={20} /> Registro de sucesos</h3>
            {sala.log.slice(0, 5).map((l, i) => <p key={i} className="hint small" style={{ marginBottom: '0.4rem' }}>{l}</p>)}
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
  const rivalesVivos = sala.jugadores.filter(j => j.vivo && j.id !== yo?.id);

  const ejecutarAccionOnline = async (payload) => {
    const res = await peticionPost('jugar', payload);
    if (res?.resultado) {
      setResumenAccion(res.resultado);
    }
  };

  const handleClickCarta = (carta) => {
    if (!miTurno || sala.faseTurno !== 'jugar') return;

    if (carta.tipo === 'palo' || carta.accion === 'robar_tres') {
      ejecutarAccionOnline({ cartaId: carta.uid });
      return;
    }

    if (carta.accion === 'descartar_tres') {
      setPurgaSeleccionadas([]);
      setModal({ tipo: 'descartar_tres', carta });
      return;
    }

    setModal({ tipo: carta.accion, carta, pasoInterno: 1, targetId: null });
  };

  const renderModal = () => {
    if (!modal) return null;
    const { tipo, carta, pasoInterno, targetId } = modal;

    return (
      <div className="rg-modal-fondo" onClick={() => setModal(null)}>
        <div className="rg-modal" onClick={ev => ev.stopPropagation()} style={{ maxWidth: '440px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.4rem', color: '#1e1b4b' }}>{carta.nombre} {carta.icono}</h3>
          <p className="hint small" style={{ marginBottom: '1.2rem' }}>{carta.desc}</p>

          {/* Purga */}
          {tipo === 'descartar_tres' && (
            <div>
              <p className="field-label">Elige hasta 3 cartas de tu mano para descartar:</p>
              <div className="col-mano" style={{ padding: '0.8rem', minHeight: 'auto', marginBottom: '1rem' }}>
                {yo.mano.filter(c => c.uid !== carta.uid).map(c => {
                  const sel = purgaSeleccionadas.includes(c.uid);
                  return (
                    <div key={c.uid} className={`col-carta ${sel ? 'seleccionada-purga' : ''}`} onClick={() => {
                      if (sel) setPurgaSeleccionadas(purgaSeleccionadas.filter(id => id !== c.uid));
                      else if (purgaSeleccionadas.length < 3) setPurgaSeleccionadas([...purgaSeleccionadas, c.uid]);
                    }}>
                      <span className="card-top-icon">{c.icono}</span>
                      <span className="card-center-icon">{c.icono}</span>
                      <span className="card-footer-name">{c.nombre}</span>
                    </div>
                  );
                })}
              </div>
              <button className="big full" onClick={() => {
                ejecutarAccionOnline({ cartaId: carta.uid, purgaIds: purgaSeleccionadas });
              }}>
                Descartar ({purgaSeleccionadas.length}) y Confirmar
              </button>
            </div>
          )}

          {/* Ruleta */}
          {tipo === 'intercambio_azar' && (
            <div>
              <p className="field-label">Selecciona el rival:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {rivalesVivos.map(r => (
                  <button key={r.id} className="secondary full" disabled={r.cartasCount === 0} onClick={() => {
                    ejecutarAccionOnline({ cartaId: carta.uid, targetId: r.id });
                  }}>
                    {r.nombre} ({r.cartasCount} cartas)
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Robo Preciso */}
          {tipo === 'robar_elegida' && (
            <div>
              <p className="field-label">Selecciona el rival al que sustraerle una carta al azar:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {rivalesVivos.map(r => (
                  <button key={r.id} className="secondary full" disabled={r.cartasCount === 0} onClick={() => {
                    ejecutarAccionOnline({ cartaId: carta.uid, targetId: r.id, tipoRobo: 'preciso' });
                  }}>
                    {r.nombre} ({r.cartasCount} cartas)
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Regalo Envenenado */}
          {tipo === 'dar_carta' && (
            <div>
              {pasoInterno === 1 && (
                <>
                  <p className="field-label">Selecciona qué carta tuya le vas a dar:</p>
                  <div className="col-mano" style={{ padding: '0.8rem', minHeight: 'auto' }}>
                    {yo.mano.filter(c => c.uid !== carta.uid).map(c => (
                      <div key={c.uid} className="col-carta" onClick={() => setModal({ ...modal, pasoInterno: 2, miCartaId: c.uid })}>
                        <span className="card-top-icon">{c.icono}</span>
                        <span className="card-center-icon">{c.icono}</span>
                        <span className="card-footer-name">{c.nombre}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {pasoInterno === 2 && (
                <>
                  <p className="field-label">¿A quién se la vas a meter?</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {rivalesVivos.map(r => (
                      <button key={r.id} className="secondary full" onClick={() => {
                        ejecutarAccionOnline({ cartaId: carta.uid, targetId: r.id, miCartaId: modal.miCartaId });
                      }}>
                        {r.nombre}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Espionaje */}
          {tipo === 'ver_mano' && (
            <div>
              <p className="field-label">¿A quién quieres espiar?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {rivalesVivos.map(r => (
                  <button key={r.id} className="secondary full" onClick={async () => {
                    const data = await peticionPost('espiar', { targetId: r.id });
                    if (data?.mano) setManoEspiada({ nombre: r.nombre, mano: data.mano });
                  }}>
                    {r.nombre} ({r.cartasCount} cartas)
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Duelo */}
          {tipo === 'retar' && (
            <div>
              {pasoInterno === 1 && (
                <>
                  <p className="field-label">¿A quién retas a duelo?</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {rivalesVivos.map(r => (
                      <button key={r.id} className="secondary full" disabled={r.cartasCount === 0} onClick={() => setModal({ ...modal, pasoInterno: 2, targetId: r.id })}>
                        {r.nombre} ({r.cartasCount} cartas)
                      </button>
                    ))}
                  </div>
                </>
              )}
              {pasoInterno === 2 && (
                <>
                  <p className="field-label">¿Qué palo le pides?</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    {PALOS.map(p => (
                      <button key={p.id} className="secondary" onClick={() => {
                        ejecutarAccionOnline({ cartaId: carta.uid, targetId, paloPedido: p.id });
                      }}>
                        {p.icono} {p.nombre}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Torbellino */}
          {tipo === 'cambiar_mano' && (
            <div>
              <p className="field-label">¿Con quién intercambias toda tu mano?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {rivalesVivos.map(r => (
                  <button key={r.id} className="secondary full" onClick={() => {
                    ejecutarAccionOnline({ cartaId: carta.uid, targetId: r.id, efecto: 'torbellino' });
                  }}>
                    {r.nombre} ({r.cartasCount} cartas)
                  </button>
                ))}
              </div>
            </div>
          )}

          <button className="secondary danger full" style={{ marginTop: '1.2rem' }} onClick={() => setModal(null)}>
            Cancelar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="col-contenedor">
      <section className="game">
        {/* Barra superior con solo los símbolos de los 8 palos */}
        <div className="col-palos-barra">
          <span className="col-palos-hint">8 Palos:</span>
          {PALOS.map(p => (
            <span key={p.id} className="col-palo-simbolo" title={p.nombre}>{p.icono}</span>
          ))}
        </div>

        <div className="col-jugadores-top">
          {sala.jugadores.map(j => (
            <div key={j.id} className={`col-jug-chip ${!j.vivo ? 'muerto' : ''} ${sala.turnoActivo === j.id ? 'activo' : ''}`}>
              {j.nombre} {j.vivo && `(${j.cartasCount})`}
            </div>
          ))}
        </div>

        {sala.log.length > 0 && <p className="hint center small" style={{ marginBottom: '0.8rem' }}>{sala.log[0]}</p>}

        <div className="col-zonas-comunes">
          <div className="col-mazo-container">
            <span className="field-label">Mazo ({sala.mazoCount})</span>
            <div className={`col-carta reverso ${(!miTurno || sala.faseTurno !== 'robar') ? 'disabled' : ''}`} onClick={() => miTurno && sala.faseTurno === 'robar' && peticionPost('robar', { origen: 'mazo' })}>
              <span className="card-center-icon">🃏</span>
              <span className="card-footer-name" style={{ color: '#ffffff' }}>Robar</span>
            </div>
          </div>
          <div className="col-mazo-container">
            <span className="field-label">Descarte</span>
            {sala.topDescarte ? (
              <div className={`col-carta ${(!miTurno || sala.faseTurno !== 'robar') ? 'disabled' : ''}`} onClick={() => miTurno && sala.faseTurno === 'robar' && peticionPost('robar', { origen: 'descarte' })}>
                <span className="card-top-icon">{sala.topDescarte.icono}</span>
                <span className="card-center-icon">{sala.topDescarte.icono}</span>
                <span className="card-footer-name">{sala.topDescarte.nombre}</span>
              </div>
            ) : (
              <div className="col-carta disabled">
                <span className="card-center-icon">📭</span>
                <span className="card-footer-name">Vacío</span>
              </div>
            )}
          </div>
        </div>

        <div className="panel center" style={{ padding: '1.2rem 1rem' }}>
          <h3 className="panel-title">{yo?.vivo ? 'Tu Mano' : 'Eliminado 💀'}</h3>

          {sala.robosSuministros > 0 && miTurno && (
            <div style={{ marginBottom: '0.8rem' }}>
              <span className="badge" style={{ background: '#fef08a', color: '#854d0e', padding: '0.35rem 0.8rem', fontWeight: 800 }}>
                📦 Suministros activos: Roba de 1 en 1 (te quedan {sala.robosSuministros} robos)
              </span>
            </div>
          )}

          {yo?.vivo && (
            <p className="hint small" style={{ marginBottom: '1rem' }}>
              {miTurno ? (
                sala.faseTurno === 'robar' ? (
                  sala.robosSuministros > 0 
                    ? 'Roba del Mazo o Descarte para continuar los Suministros.' 
                    : '👉 Paso 1: Roba del Mazo o del Descarte.'
                ) : '👉 Paso 2: Descarta un palo o juega una acción.'
              ) : 'Esperando el turno del rival...'}
            </p>
          )}

          <div className={`col-mano ${miTurno && sala.faseTurno === 'jugar' ? 'activa' : ''}`}>
            {yo?.mano?.map(c => (
              <div key={c.uid} className={`col-carta ${c.tipo === 'accion' ? 'accion' : ''} ${(!miTurno || sala.faseTurno !== 'jugar') ? 'disabled' : ''}`} onClick={() => handleClickCarta(c)}>
                <span className="card-top-icon">{c.icono}</span>
                <span className="card-center-icon">{c.icono}</span>
                <span className="card-footer-name">{c.nombre}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-leyenda">
          <span className="field-label" style={{ fontSize: '0.85rem' }}>📖 Cartas de Acción</span>
          <div className="col-leyenda-grid">
            {ACCIONES.map(a => (
              <div key={a.id} className="col-leyenda-item">
                <span>{a.icono}</span>
                <div><strong>{a.nombre}:</strong> {a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {renderModal()}

      {/* Modal Ver Mano (Espionaje) */}
      {manoEspiada && (
        <div className="rg-modal-fondo" onClick={() => setManoEspiada(null)}>
          <div className="rg-modal" onClick={ev => ev.stopPropagation()} style={{ maxWidth: '440px', padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 1rem' }}>Mano de {manoEspiada.nombre}</h3>
            <div className="col-mano" style={{ padding: '0.8rem', minHeight: 'auto', marginBottom: '1.5rem' }}>
              {manoEspiada.mano.map(c => (
                <div key={c.uid} className="col-carta disabled">
                  <span className="card-top-icon">{c.icono}</span>
                  <span className="card-center-icon">{c.icono}</span>
                  <span className="card-footer-name">{c.nombre}</span>
                </div>
              ))}
            </div>
            <button className="big full" onClick={() => setManoEspiada(null)}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Pantalla modal tras acción (Online) */}
      {resumenAccion && (
        <div className="rg-modal-fondo">
          <div className="rg-modal" style={{ maxWidth: '500px', padding: '1.8rem 1.4rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.8rem', marginBottom: '0.4rem' }}>{resumenAccion.icono}</div>
            
            <h2 style={{
              margin: '0 0 0.5rem', 
              color: resumenAccion.dueloGanado === false ? '#dc2626' : (resumenAccion.dueloGanado === true ? '#16a34a' : '#1e1b4b')
            }}>
              {resumenAccion.titulo}
            </h2>

            <p style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '1.5rem', lineHeight: '1.4' }}>
              {resumenAccion.mensaje}
            </p>

            <div className="panel" style={{ padding: '1rem', background: '#f8fafc', marginBottom: '1.5rem' }}>
              <span className="field-label" style={{ marginBottom: '0.6rem' }}>Tu mano actual:</span>
              <div className="col-mano" style={{ padding: '0.6rem', minHeight: 'auto', background: 'transparent', border: 'none' }}>
                {yo?.mano?.map(c => (
                  <div key={c.uid} className={`col-carta disabled ${c.tipo === 'accion' ? 'accion' : ''}`} style={{ width: '74px', height: '105px' }}>
                    <span className="card-top-icon">{c.icono}</span>
                    <span className="card-center-icon" style={{ fontSize: '1.8rem' }}>{c.icono}</span>
                    <span className="card-footer-name">{c.nombre}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="big full" onClick={() => {
              setResumenAccion(null);
              peticionPost('finalizarTurno');
            }}>
              <Icon name="check" size={20} /> Finalizar Turno
            </button>
          </div>
        </div>
      )}

      {/* MODAL DERROTA ONLINE */}
      {!yo?.vivo && !avisoDerrotaVisto && sala.estado === 'jugando' && (
        <div className="rg-modal-fondo">
          <div className="rg-modal" style={{ maxWidth: '440px', padding: '2rem 1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.6rem' }}>💀</div>
            <h2 style={{ color: '#dc2626', margin: '0 0 0.6rem' }}>¡HAS SIDO ELIMINADO!</h2>
            <p className="hint" style={{ fontSize: '1rem', color: '#334155', lineHeight: '1.4', marginBottom: '1.5rem' }}>
              Has acumulado <strong>5 palos diferentes</strong> en tu mano. Has quedado fuera de la partida, pero puedes seguir observando el desenlace.
            </p>
            <button className="big full" onClick={() => setAvisoDerrotaVisto(true)}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}