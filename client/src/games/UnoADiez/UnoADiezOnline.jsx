// client/src/games/UnoADiez/UnoADiezOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './UnoADiez.css';
import '../Adivina/Adivina.css';
import { MenuInicioJuego, MenuModoOnline, FormCrearSala, FormUnirseSala, CabeceraSala, EsperandoAnfitrion } from '../../components/MenuJuego.jsx';

const CLAVE_SESION_UAD = 'unoadiez_online_session';

export default function UnoADiezOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu');
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const [sala, setSala] = useState(null);
  const [sesion, setSesion] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(CLAVE_SESION_UAD)); } catch { return null; }
  });

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/unoadiez/sala/${sesion.code}?token=${sesion.token}`)
        .then(r => r.ok ? r.json() : Promise.reject('Sala no disponible'))
        .then(d => {
          if (d.success) {
            setSala(d);
            setVista('sala');
          }
        }).catch(() => {
          sessionStorage.removeItem(CLAVE_SESION_UAD);
          setSesion(null);
          setSala(null);
          setVista('online_menu');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 1000);
    return () => clearInterval(intervalRef.current);
  }, [sesion]);

  // Cierra automáticamente el modal al empezar la partida
  useEffect(() => {
    if (sala && sala.estado !== 'lobby') {
      setModalAyuda(false);
    }
  }, [sala?.estado]);

  const peticionPost = async (endpoint, extraBody = {}) => {
    setCargando(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/unoadiez/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion?.token, code: sesion?.code, ...extraBody })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.token) {
        const nueva = { code: data.code, token: data.token };
        sessionStorage.setItem(CLAVE_SESION_UAD, JSON.stringify(nueva));
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
    sessionStorage.removeItem(CLAVE_SESION_UAD); 
    setSesion(null); 
    setSala(null);
    setVista('online_menu'); 
    setModalSalir(false);
  };

  const copiarCodigo = () => {
    if (!sala?.code) return;
    navigator.clipboard?.writeText(sala.code);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };



  const ModalAyuda = () => modalAyuda ? (
    <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
      <div
        className="rg-modal aprox-modal-ayuda"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px', maxHeight: '88vh', overflowY: 'auto', textAlign: 'left' }}
      >
        <div className="aprox-modal-header">
          <span className="aprox-modal-signo-title">?</span>
          <h3>¿Cómo se juega a Del 1 al 10...?</h3>
        </div>

        <div className="aprox-modal-cuerpo">
          <p><strong>1. Dinámica de la ronda:</strong></p>
          <ul>
            <li>En cada turno hay un <strong>Adivinador</strong> y un <strong>Pistador</strong>.</li>
            <li>El Pistador consulta en la pantalla de su móvil un <strong>número del 1 al 10</strong> y una <strong>categoría aleatoria</strong>.</li>
            <li>Debe dar una pista en voz alta que represente ese valor del 1 al 10. <em>(Ejemplo: para "Nivel de miedo" con un 10, algo aterrador; con un 1, un cachorro)</em>.</li>
          </ul>

          <p><strong>2. Adivinar o Pasar:</strong></p>
          <ul>
            <li>El Adivinador tiene <strong>60 segundos</strong> para marcar su predicción en el teclado numérico.</li>
            <li>Si duda, puede pulsar <strong>Pasar</strong> para que otro jugador le dé una nueva pista con otra categoría.</li>
          </ul>

          <p><strong>3. Puntuación (¡Gana el que MENOS puntos sume!):</strong></p>
          <ul>
            <li><strong>🎯 Acierto exacto:</strong> Sumas únicamente el número de pistas pedidas en la ronda <em>(+1 punto a la 1ª pista)</em>.</li>
            <li><strong>🤏 A 1 de distancia:</strong> Sumas pistas + 1 de penalización <em>(+2 puntos a la 1ª pista)</em>.</li>
            <li><strong>❌ Fallo (más de 1 de diferencia):</strong> Sumas pistas + 10 de penalización <em>(+11 puntos a la 1ª pista)</em>.</li>
          </ul>
        </div>

        <div className="rg-modal-acciones" style={{ marginTop: '1.2rem' }}>
          <button className="big full" onClick={() => setModalAyuda(false)}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  ) : null;

  if (vista === 'menu') {
    return (
      <div className="uad-contenedor" style={{ position: 'relative' }}>
        <ModalAyuda />
        <MenuInicioJuego
            juegoId="unoadiez"
            onOnline={() => { setVista('online_menu'); setErrorMsg(''); }}
            onLocal={onLocal}
            onAyuda={() => setModalAyuda(true)}
            error={errorMsg}
          />
      </div>
    );
  }

  if (vista === 'online_menu') {
    return (
      <div className="uad-contenedor" style={{ position: 'relative' }}>
        <ModalAyuda />
        <MenuModoOnline
          onVolver={() => { setVista('menu'); setErrorMsg(''); }}
          onCrear={() => { setVista('crear'); setErrorMsg(''); }}
          onUnirse={() => { setVista('unirse'); setErrorMsg(''); }}
          onAyuda={() => setModalAyuda(true)}
          error={errorMsg}
        />
      </div>
    );
  }

  if (vista === 'crear' || vista === 'unirse') {
    return (
      <div className="uad-contenedor" style={{ position: 'relative' }}>
        <ModalAyuda />
        {vista === 'crear' ? (
          <FormCrearSala
            onVolver={() => { setVista('online_menu'); setErrorMsg(''); }}
            onAyuda={() => setModalAyuda(true)}
            nombre={nombre}
            setNombre={setNombre}
            onCrear={handleCrear}
            cargando={cargando}
            error={errorMsg}
            maxLength={15}
          />
        ) : (
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
            maxLength={15}
          />
        )}
      </div>
    );
  }

  if (!sala) return <div className="panel center"><p>Cargando sala...</p></div>;

  const yo = sala.jugadores.find(j => j.esTu);
  const esAdmin = sala.esAdmin;
  const esElAdivinador = sala.adivinadorId === yo?.id;
  const esElPistador = sala.pistadorId === yo?.id;
  const nombreAdivinador = sala.jugadores.find(j => j.id === sala.adivinadorId)?.nombre || 'Adivinador';
  const nombrePistador = sala.jugadores.find(j => j.id === sala.pistadorId)?.nombre || 'Pistador';

  const ranking = [...sala.jugadores].sort((a, b) => a.puntos - b.puntos);
  const minPuntos = ranking.length > 0 ? ranking[0].puntos : 0;
  const ganadores = ranking.filter(j => j.puntos === minPuntos);

  return (
    <div className="uad-contenedor" style={{ position: 'relative' }}>
      <ModalAyuda />

      {/* 1. LOBBY */}
      {sala.estado === 'lobby' && (
        <section className="game qq-pantalla">
          <CabeceraSala codigo={sala.code} onVolver={() => setModalSalir(true)} onAyuda={() => setModalAyuda(true)} />

          <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
            <h3 className="qq-sala-titulo"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/10)</h3>
            <div className="lb-lista qq-sala-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.esTu ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">{j.nombre} {j.esTu && '(tú)'} {j.id === 1 && '👑'}</span>
                </div>
              ))}
            </div>
            {sala.jugadores.length < 2 && (
              <p className="hint" style={{ marginTop: '0.8rem' }}>Falta al menos 1 jugador para empezar (mínimo 2).</p>
            )}
          </div>

          <div className="actions" style={{ marginTop: '1rem' }}>
            {esAdmin && (
              <button 
                className="big full qq-btn-principal" 
                disabled={sala.jugadores.length < 2} 
                onClick={() => peticionPost(`sala/${sesion.code}/iniciar`)}
              >
                <Icon name="play" size={22} /> Empezar Partida
              </button>
            )}
          </div>

          {!esAdmin && <EsperandoAnfitrion />}
        </section>
      )}

      {/* 2. JUGANDO (RONDA ACTIVA) - La ayuda ya no aparece aquí */}
      {sala.estado === 'jugando' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="target" size={18} />Adivina: {nombreAdivinador}</span>
            <span className="chip alt"><Icon name="clock" size={16} /> {sala.segundosRestantes}s</span>
          </div>

          <div className="panel center">
            {!esElAdivinador && sala.numeroSecreto && (
              <div style={{ marginBottom: '1rem' }}>
                <p className="field-label">El número que {nombreAdivinador} debe adivinar es:</p>
                <div className="uad-badge-secret">
                  <span>🎯 {sala.numeroSecreto}</span>
                </div>
              </div>
            )}

            <div className="uad-categoria-box">
              <span className="field-label">Categoría de la pista {sala.intentosRonda}:</span>
              <p className="uad-categoria-texto">«{sala.categoriaActual}»</p>
            </div>

            {esElPistador ? (
              <div style={{ padding: '0.5rem 0' }}>
                <span className="badge" style={{ background: '#fef9c3', color: '#854d0e', fontSize: '1rem', padding: '0.4rem 1rem' }}>
                  🗣️ ¡TE TOCA DAR LA PISTA!
                </span>
                <p className="hint" style={{ marginTop: '0.8rem', lineHeight: '1.4' }}>
                  Di en voz alta una respuesta de esta categoría que represente un <strong>{sala.numeroSecreto} del 1 al 10</strong>.
                </p>
              </div>
            ) : esElAdivinador ? (
              <div>
                <p className="field-label">Escucha la pista en voz alta de <strong>{nombrePistador}</strong> y elige:</p>
                <div className="uad-teclado-grid">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                    <button key={n} type="button" className="uad-btn-num" onClick={() => peticionPost(`sala/${sesion.code}/adivinar`, { numero: n })}>
                      {n}
                    </button>
                  ))}
                </div>
                <button type="button" className="secondary full" onClick={() => peticionPost(`sala/${sesion.code}/pasar`)}>
                  <Icon name="forward" size={18} /> Pasar (Pedir pista a otro jugador)
                </button>
              </div>
            ) : (
              <div style={{ padding: '0.8rem 0' }}>
                <p className="hint">
                  <strong>{nombrePistador}</strong> está dando una pista en voz alta para un <strong>{sala.numeroSecreto}</strong>.<br />
                  Esperando a que <strong>{nombreAdivinador}</strong> responda...
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. RESOLUCIÓN */}
      {sala.estado === 'resolucion' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="target" size={44} /></span>
            <h1 className="title">Resultado</h1>
            <p className="reveal">
              El número era: <strong>{sala.numeroSecreto}</strong><br />
              {nombreAdivinador} eligió: <strong>{sala.ultimoGuess}</strong>
            </p>

            <div className={`uad-score-badge ${Math.abs(sala.ultimoGuess - sala.numeroSecreto) === 0 ? 'acierto' : (Math.abs(sala.ultimoGuess - sala.numeroSecreto) === 1 ? 'cerca' : 'fallo')}`}>
              +{sala.puntosSumados} puntos
            </div>

            <p className="hint small">
              {Math.abs(sala.ultimoGuess - sala.numeroSecreto) === 0 && `¡Acierto exacto! Suma ${sala.puntosSumados} pts (rondas necesitadas).`}
              {Math.abs(sala.ultimoGuess - sala.numeroSecreto) === 1 && `¡A 1 de distancia! Suma ${sala.puntosSumados} pts (rondas + 1).`}
              {Math.abs(sala.ultimoGuess - sala.numeroSecreto) > 1 && `¡Fallo! Suma ${sala.puntosSumados} pts (rondas + 10).`}
            </p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="podium" size={20} /> Marcador general</h3>
            <div className="scoreboard">
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row ${i === 0 ? 'first' : ''}`}>
                  <span className="score-name">{i + 1}. {j.nombre} {j.esTu && '(Tú)'}</span>
                  <span className="score-pts">{j.puntos} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            {esAdmin ? (
              <button className="big full" onClick={() => peticionPost(`sala/${sesion.code}/siguiente`)}>
                <Icon name="forward" size={22} /> Siguiente Turno
              </button>
            ) : (
              <p className="hint center">Esperando a que el anfitrión continúe...</p>
            )}
          </div>
        </section>
      )}

      {/* 4. FIN / PODIO */}
      {sala.estado === 'fin' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <h1 className="title">¡Partida Terminada!</h1>
            <p className="final-score" style={{ color: '#16a34a' }}>
              🏆 Ganador: {ganadores.map(g => g.nombre).join(', ')} con {minPuntos} pts
            </p>
          </div>

          <div className="panel reveal-panel" style={{ marginTop: '1rem' }}>
            <h3 className="reveal-title"><Icon name="podium" size={20} /> Clasificación Final</h3>
            <div className="scoreboard">
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row ${j.puntos === minPuntos ? 'first' : ''}`}>
                  <span className="score-name">{i + 1}. {j.nombre} {j.esTu && '(Tú)'}</span>
                  <span className="score-pts">{j.puntos} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '1.2rem' }}>
            {esAdmin && (
              <button className="big full" onClick={() => peticionPost(`sala/${sesion.code}/iniciar`)}>
                <Icon name="refresh" size={20} /> Jugar otra vez
              </button>
            )}
            <button className="secondary danger full" onClick={handleSalir}>
              <Icon name="door" size={20} /> Salir al menú
            </button>
          </div>
        </section>
      )}

      {/* MODAL SALIR */}
      {modalSalir && (
        <div className="rg-modal-fondo" onClick={() => setModalSalir(false)}>
          <div className="rg-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}>
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🚪</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>¿Abandonar la partida?</h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              Perderás tu puntuación actual. ¿Deseas salir?
            </p>
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