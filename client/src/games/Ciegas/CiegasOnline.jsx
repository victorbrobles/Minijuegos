// client/src/games/Ciegas/CiegasOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Ciegas.css';
import '../Adivina/Adivina.css';
import { MenuInicioJuego, MenuModoOnline, FormCrearSala, FormUnirseSala, CabeceraSala, EsperandoAnfitrion } from '../../components/MenuJuego.jsx';

const CLAVE_SESION_CIEGAS = 'ciegas_online_session';
const CATEGORIAS = [
  { id: 'comida', label: 'Comida' },
  { id: 'deporte', label: 'Deporte' },
  { id: 'deportistas', label: 'Deportistas' },
  { id: 'famosos', label: 'Famosos' },
  { id: 'culturapop', label: 'Cultura Pop' },
  { id: 'geografia', label: 'Geografía' }
];

export default function CiegasOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_CIEGAS));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/ciegas/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_CIEGAS);
          setSesion(null);
          setSala(null);
          setVista('online_menu');
          setErrorMsg('La sala se ha cerrado.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 600);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  // Cerrar ayuda si el anfitrión arranca la partida
  useEffect(() => {
    if (sala && sala.estado !== 'lobby') {
      setModalAyuda(false);
    }
  }, [sala?.estado]);

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setCargando(true);
    try {
      const res = await fetch('/api/ciegas/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_CIEGAS, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleUnirse = async () => {
    if (!nombre.trim() || !codigoInput.trim()) return;
    setCargando(true);
    try {
      const res = await fetch('/api/ciegas/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_CIEGAS, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleConfigurarCategoria = async (cat) => {
    try {
      await fetch(`/api/ciegas/online/sala/${sesion.code}/configurar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, categoria: cat })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleIniciarRonda = async () => {
    setErrorMsg('');
    try {
      const res = await fetch(`/api/ciegas/online/sala/${sesion.code}/iniciar-ronda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleColocarPosicion = async (posicion) => {
    try {
      await fetch(`/api/ciegas/online/sala/${sesion.code}/colocar-posicion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, posicion })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnviarVoto = async (prediccion) => {
    try {
      await fetch(`/api/ciegas/online/sala/${sesion.code}/votar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, prediccion })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSalir = () => {
    sessionStorage.removeItem(CLAVE_SESION_CIEGAS);
    setSesion(null);
    setSala(null);
    setVista('online_menu');
  };

  const copiarCodigo = () => {
    if (!sala?.code) return;
    navigator.clipboard?.writeText(sala.code);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };

  const ronda = sala?.ronda;
  const esAdmin = sala?.esAdmin;
  const yoId = sala?.yoId;
  const jugadorActivo = sala?.jugadores?.find((j) => j.id === sala.jugadorActivoId);
  const soyElActivo = sala?.jugadorActivoId === yoId;
  const miVoto = ronda?.votos ? ronda.votos[yoId] : undefined;

  // Solo se muestra en menús o durante el lobby

  return (
    <div className="cancion-contenedor">
      {/* Botón flotante único idéntico al de CancionOnline */}

      {/* Modal con las reglas completas basadas en CiegasLocal */}
      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal aprox-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="aprox-modal-header">
              <span className="aprox-modal-signo-title">?</span>
              <h3>¿Cómo se juega a Ranking a Ciegas?</h3>
            </div>

            <div className="aprox-modal-cuerpo">
              <p><strong>1. Ranking a Ciegas:</strong></p>
              <ul>
                <li>En cada ronda, un jugador activo debe posicionar 5 elementos en un ranking del 1º al 5º.</li>
                <li>Los elementos van apareciendo secuencialmente uno a uno, sin conocer cuáles saldrán después.</li>
                <li><strong>Una vez colocado un elemento en un puesto, no se puede reubicar.</strong></li>
              </ul>
              <p><strong>2. Votación y Puntos:</strong></p>
              <ul>
                <li>El resto de jugadores observan el top armado final sin saber el orden en el que fue saliendo.</li>
                <li>Cada participante vota cuántos elementos cree que han quedado exactamente en su posición real (de 0 a 5).</li>
                <li>¡El jugador activo suma los puntos asignados por las predicciones de sus compañeros!</li>
              </ul>
            </div>

            <div className="rg-modal-acciones">
              <button className="big full" onClick={() => setModalAyuda(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. MENÚ ONLINE */}
      {vista === 'menu' && (
        <MenuInicioJuego
          juegoId="ciegas"
          onOnline={() => { setVista('online_menu'); setErrorMsg(''); }}
          onLocal={onLocal}
          onAyuda={() => setModalAyuda(true)}
          error={errorMsg}
        />
      )}

      {vista === 'online_menu' && (
        <MenuModoOnline
          onVolver={() => { setVista('menu'); setErrorMsg(''); }}
          onCrear={() => { setVista('crear'); setErrorMsg(''); }}
          onUnirse={() => { setVista('unirse'); setErrorMsg(''); }}
          onAyuda={() => setModalAyuda(true)}
          error={errorMsg}
        />
      )}

      {/* 2. CREAR SALA */}
      {vista === 'crear' && (
        <FormCrearSala
          onVolver={() => { setVista('online_menu'); setErrorMsg(''); }}
          onAyuda={() => setModalAyuda(true)}
          nombre={nombre}
          setNombre={setNombre}
          onCrear={handleCrear}
          cargando={cargando}
          error={errorMsg}
        />
      )}

      {/* 3. UNIRSE A SALA */}
      {vista === 'unirse' && (
        <FormUnirseSala
          onVolver={() => { setVista('online_menu'); setErrorMsg(''); }}
          onAyuda={() => setModalAyuda(true)}
          codigo={codigoInput}
          setCodigo={setCodigoInput}
          nombre={nombre}
          setNombre={setNombre}
          onUnirse={handleUnirse}
          cargando={cargando}
          error={errorMsg}
        />
      )}

      {/* 4. LOBBY (Alineado exactamente igual que CancionOnline) */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game qq-pantalla">
          <CabeceraSala codigo={sala.code} onVolver={() => setModalSalir(true)} onAyuda={() => setModalAyuda(true)} />

          <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
            <h3 className="qq-sala-titulo"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/10)</h3>
            <div className="lb-lista qq-sala-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === yoId ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">{j.nombre}{j.id === yoId ? ' (Tú)' : ''}{j.id === 1 ? ' 👑' : ''}</span>
                </div>
              ))}
            </div>

            {esAdmin && (
              <div style={{ marginTop: '1.2rem' }}>
                <label className="field-label" htmlFor="cat-online-ciegas">
                  Categoría seleccionada
                </label>
                <select
                  id="cat-online-ciegas"
                  value={sala.categoria}
                  onChange={(e) => handleConfigurarCategoria(e.target.value)}
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

          {esAdmin ? (
            <button
              className="big full qq-btn-principal"
              style={{ marginTop: '1.2rem' }}
              disabled={sala.jugadores.length < 4}
              onClick={handleIniciarRonda}
            >
              <Icon name="play" size={22} /> {sala.jugadores.length < 4 ? 'Esperando rivales (mínimo 4)...' : '¡Empezar Partida!'}
            </button>
          ) : (
            <EsperandoAnfitrion />
          )}

        </section>
      )}

      {/* 5. JUGANDO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'armando_ranking' && ronda && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />En juego</span>
            <span className="chip alt">🎲 Jugador activo: {jugadorActivo?.nombre}</span>
          </div>

          <div className="scoreboard-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
            {sala.jugadores.map((j) => (
              <div key={j.id} className="score-pill">
                <span>{j.nombre}: <strong>{j.puntos} pts</strong></span>
              </div>
            ))}
          </div>

          <div className="panel">
            <p className="categoria" style={{ textTransform: 'uppercase', textAlign: 'center' }}>{sala.categoria}</p>
            <h3 style={{ textAlign: 'center', margin: '0.4rem 0 1.2rem', color: '#1e1b4b' }}>
              {ronda.tema}
            </h3>

            {soyElActivo ? (
              <>
                <div className="ciegas-item-actual-card">
                  <span className="hint small">Elemento #{ronda.indiceSecuencia + 1} de 5 a colocar:</span>
                  <h2 className="ciegas-item-titulo">{ronda.itemsSecuencia[ronda.indiceSecuencia]}</h2>
                </div>

                <p className="hint small" style={{ textAlign: 'center', margin: '1rem 0 0.5rem' }}>
                  Elige una posición libre (no podrás cambiarla):
                </p>

                <div className="ciegas-slots-lista">
                  {ronda.topArmado.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`ciegas-slot-btn ${item ? 'ocupado' : 'libre'}`}
                      disabled={item !== null}
                      onClick={() => handleColocarPosicion(idx + 1)}
                    >
                      <span className="ciegas-slot-num">{idx + 1}º</span>
                      <span className="ciegas-slot-text">{item || '— Asignar en este puesto —'}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="ciegas-espera-box">
                <span className="hint">Esperando a que <strong>{jugadorActivo?.nombre}</strong> arme su top a ciegas...</span>
                <div className="ciegas-preview-progreso">
                  {ronda.topArmado.map((item, idx) => (
                    <div key={idx} className={`ciegas-slot-indicador ${item ? 'relleno' : ''}`}>
                      {idx + 1}º {item ? '✔' : '...'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button className="secondary danger full" style={{ marginTop: '1.2rem' }} onClick={() => setModalSalir(true)}>
            Salir de la sala
          </button>
        </section>
      )}

      {/* 6. VOTANDO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'votando' && ronda && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="flagFinish" size={18} />Votación</span>
            <span className="chip alt">Votos: {Object.keys(ronda.votos || {}).length} / {sala.jugadores.length - 1}</span>
          </div>

          <div className="panel">
            <p className="categoria" style={{ textTransform: 'uppercase', textAlign: 'center' }}>{sala.categoria}</p>
            <h3 style={{ textAlign: 'center', margin: '0.4rem 0 0.8rem', color: '#1e1b4b' }}>
              {ronda.tema}
            </h3>
            <p className="hint small" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              Top 5 terminado por <strong>{jugadorActivo?.nombre}</strong>:
            </p>

            <div className="ciegas-top-bloque">
              {ronda.topArmado.map((item, idx) => (
                <div key={idx} className="ciegas-top-row">
                  <span className="ciegas-slot-num">{idx + 1}º</span>
                  <span className="ciegas-slot-text">{item}</span>
                </div>
              ))}
            </div>

            {soyElActivo ? (
              <div className="status-alert info" style={{ marginTop: '1rem' }}>
                Has completado tu ranking. Esperando a que el resto de jugadores emitan sus votos...
              </div>
            ) : (
              <>
                <p style={{ textAlign: 'center', fontWeight: '800', margin: '1.2rem 0 0.6rem', color: '#1e1b4b' }}>
                  ¿Cuántos elementos crees que están colocados en su posición exacta?
                </p>

                <div className="ciegas-voto-grid">
                  {[0, 1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`ciegas-btn-voto ${miVoto === num ? 'seleccionado' : ''}`}
                      onClick={() => handleEnviarVoto(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                {miVoto !== undefined && (
                  <p className="hint small" style={{ textAlign: 'center', marginTop: '0.6rem' }}>
                    Has votado por: <strong>{miVoto} aciertos</strong>.
                  </p>
                )}
              </>
            )}
          </div>

          <button className="secondary danger full" style={{ marginTop: '1.2rem' }} onClick={() => setModalSalir(true)}>
            Salir de la sala
          </button>
        </section>
      )}

      {/* 7. RESULTADOS ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'resultados' && ronda && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <h1 className="title">Resultados de la ronda</h1>
            <p className="categoria" style={{ textTransform: 'uppercase' }}>{sala.categoria}</p>
            <p className="reveal" style={{ fontSize: '1.2rem', margin: '0.4rem 0 1rem' }}>
              {ronda.tema}
            </p>

            <div className="ciegas-solucion-box">
              <h4 style={{ margin: '0 0 0.8rem', color: '#1e1b4b', textAlign: 'center' }}>
                Top 5 completado por {jugadorActivo?.nombre}:
              </h4>
              {ronda.topArmado.map((nom, idx) => (
                <div key={idx} className="ciegas-top-row" style={{ marginBottom: '0.4rem' }}>
                  <span className="ciegas-slot-num">{idx + 1}º</span>
                  <span className="ciegas-slot-text">{nom}</span>
                </div>
              ))}
            </div>

            <div className="panel" style={{ marginTop: '1rem', textAlign: 'left' }}>
              <h4 style={{ color: '#1e1b4b', margin: '0 0 0.6rem' }}>
                Votaciones del grupo:
              </h4>
              {sala.jugadores.map((j) => {
                if (j.id === sala.jugadorActivoId) return null;
                const suVoto = ronda.votos?.[j.id] ?? 0;
                return (
                  <div key={j.id} className="ciegas-resumen-voto-row">
                    <span>{j.nombre} le otorgó</span>
                    <span className="pts-verde">+{suVoto} pts</span>
                  </div>
                );
              })}

              <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '2px dashed #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '1.05rem', color: '#1e1b4b' }}>
                  🎉 <strong>{jugadorActivo?.nombre}</strong> suma un total de{' '}
                  <strong style={{ color: '#059669', fontSize: '1.2rem' }}>
                    +{ronda.totalPuntosGanados || 0} pts
                  </strong>
                </span>
              </div>
            </div>

            <div className="scoreboard">
              {[...sala.jugadores]
                .sort((a, b) => b.puntos - a.puntos)
                .map((j, i) => (
                  <div key={j.id} className={`score-row${i === 0 && j.puntos > 0 ? ' first' : ''}`}>
                    <span className="score-name">
                      {i === 0 && j.puntos > 0 ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>}
                      {j.nombre}
                    </span>
                    <span className="score-pts">{j.puntos} pts</span>
                  </div>
                ))}
            </div>
          </div>

          {esAdmin ? (
            <div className="actions">
              <button onClick={handleIniciarRonda}>
                <Icon name="play" size={20} /> Siguiente ronda
              </button>
              <button className="secondary danger" onClick={() => setModalSalir(true)}>
                <Icon name="door" size={20} /> Salir al menú
              </button>
            </div>
          ) : (
            <div className="panel center" style={{ marginTop: '1rem' }}>
              <p className="hint">Esperando a que el anfitrión lance la siguiente ronda...</p>
              <button className="secondary danger full" style={{ marginTop: '0.8rem' }} onClick={() => setModalSalir(true)}>
                Salir de la sala
              </button>
            </div>
          )}
        </section>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA SALIR */}
      {modalSalir && (
        <div className="rg-modal-fondo" onClick={() => setModalSalir(false)}>
          <div 
            className="rg-modal" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🚪</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>
              ¿Abandonar la partida?
            </h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              Si sales de la sala perderás tu progreso actual en la partida. ¿Estás seguro de que deseas salir?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button 
                type="button" 
                className="secondary full" 
                onClick={() => setModalSalir(false)}
              >
                No, quedarme
              </button>
              <button 
                type="button" 
                className="secondary danger full" 
                style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }}
                onClick={() => {
                  setModalSalir(false);
                  handleSalir();
                }}
              >
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}