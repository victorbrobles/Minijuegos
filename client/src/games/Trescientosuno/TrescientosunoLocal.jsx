import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import './Trescientosuno.css';

const MIN_JUGADORES = 2;
const MAX_JUGADORES = 12;
const TIEMPO_TURNO = 60;

// Sustituye este diccionario y la función getLogoUrl en la parte superior de ambos archivos

const ESCUDOS_MAP = {
  // Clubes (Tus URLs exactas)
  barcelona: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
  fcbarcelona: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
  madrid: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
  realmadrid: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
  atletico: "https://assets.football-logos.cc/logos/spain/512x512/atletico-madrid.0e6714cc.png",
  atleticomadrid: "https://assets.football-logos.cc/logos/spain/512x512/atletico-madrid.0e6714cc.png",
  atleticodemadrid: "https://assets.football-logos.cc/logos/spain/512x512/atletico-madrid.0e6714cc.png",
  manutd: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
  manunited: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
  manchesterunited: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
  mancity: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
  manchestercity: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
  liverpool: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
  chelsea: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
  arsenal: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
  tottenham: "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
  spurs: "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
  psg: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
  parissaintgermain: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
  bayern: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
  bayernmunchen: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
  dortmund: "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg",
  juventus: "https://assets.football-logos.cc/logos/italy/512x512/juventus.4efced70.png",
  inter: "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg",
  milan: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg",
  roma: "https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg",
  napoli: "https://assets.football-logos.cc/logos/italy/512x512/napoli.cbf9f0a6.png",
  napoles: "https://assets.football-logos.cc/logos/italy/512x512/napoli.cbf9f0a6.png",
  sevilla: "https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg",
  valencia: "https://upload.wikimedia.org/wikipedia/en/c/ce/Valenciacf.svg",
  villarreal: "https://assets.football-logos.cc/logos/spain/512x512/villarreal.dca647c8.png",
  sociedad: "https://upload.wikimedia.org/wikipedia/en/f/f1/Real_Sociedad_logo.svg",
  realsociedad: "https://upload.wikimedia.org/wikipedia/en/f/f1/Real_Sociedad_logo.svg",
  betis: "https://assets.football-logos.cc/logos/spain/512x512/real-betis.ff95aa03.png",
  realbetis: "https://assets.football-logos.cc/logos/spain/512x512/real-betis.ff95aa03.png",
  athletic: "https://upload.wikimedia.org/wikipedia/en/9/98/Club_Athletic_Bilbao_logo.svg",
  athleticbilbao: "https://upload.wikimedia.org/wikipedia/en/9/98/Club_Athletic_Bilbao_logo.svg",
  athleticclub: "https://upload.wikimedia.org/wikipedia/en/9/98/Club_Athletic_Bilbao_logo.svg",
  porto: "https://upload.wikimedia.org/wikipedia/en/f/f1/FC_Porto.svg",
  benfica: "https://upload.wikimedia.org/wikipedia/en/a/a2/SL_Benfica_logo.svg",
  sporting: "https://upload.wikimedia.org/wikipedia/en/e/e1/Sporting_Clube_de_Portugal_%28Logo%29.svg",
  ajax: "https://upload.wikimedia.org/wikipedia/en/7/79/Ajax_Amsterdam.svg",
  miami: "https://upload.wikimedia.org/wikipedia/en/5/5c/Inter_Miami_CF_logo.svg",
  intermiami: "https://upload.wikimedia.org/wikipedia/en/5/5c/Inter_Miami_CF_logo.svg",
  monaco: "https://upload.wikimedia.org/wikipedia/en/b/ba/AS_Monaco_FC.svg",
  lyon: "https://upload.wikimedia.org/wikipedia/en/c/c6/Olympique_Lyonnais.svg",
  marseille: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg",
  river: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Escudo_del_C_A_River_Plate.svg",
  riverplate: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Escudo_del_C_A_River_Plate.svg",
  boca: "https://upload.wikimedia.org/wikipedia/commons/4/41/CABJ_escudo.svg",
  bocajuniors: "https://upload.wikimedia.org/wikipedia/commons/4/41/CABJ_escudo.svg",
  depor: "https://assets.football-logos.cc/logos/spain/512x512/deportivo-la-coruna.2a147b0c.png",
  deportivo: "https://assets.football-logos.cc/logos/spain/512x512/deportivo-la-coruna.2a147b0c.png",
  deportivodelacoruna: "https://assets.football-logos.cc/logos/spain/512x512/deportivo-la-coruna.2a147b0c.png",
  celta: "https://upload.wikimedia.org/wikipedia/en/1/12/RC_Celta_de_Vigo_logo.svg",
  celtadevigo: "https://upload.wikimedia.org/wikipedia/en/1/12/RC_Celta_de_Vigo_logo.svg",
  espanyol: "https://upload.wikimedia.org/wikipedia/en/d/d6/Rcd_espanyol_logo.svg",

  // Clubes extraídos
  getafe: "https://upload.wikimedia.org/wikipedia/en/4/46/Getafe_logo.svg",
  getafecf: "https://upload.wikimedia.org/wikipedia/en/4/46/Getafe_logo.svg",
  zaragoza: "https://assets.football-logos.cc/logos/spain/512x512/zaragoza.966d5396.png",
  osasuna: "https://assets.football-logos.cc/logos/spain/512x512/osasuna.44c61200.png",

  // Selecciones
  alemania: "https://upload.wikimedia.org/wikipedia/en/e/e3/DFBEagle.svg",
  seleccionalemana: "https://upload.wikimedia.org/wikipedia/en/e/e3/DFBEagle.svg",
  argentina: "https://assets.football-logos.cc/logos/argentina/512x512/argentina-national-team.5c235057.png",
  seleccionargentina: "https://assets.football-logos.cc/logos/argentina/512x512/argentina-national-team.5c235057.png",
  brasil: "https://assets.football-logos.cc/logos/brazil/512x512/brazil-national-team.004213f2.png",
  seleccionbrasilena: "https://assets.football-logos.cc/logos/brazil/512x512/brazil-national-team.004213f2.png",
  espana: "https://assets.football-logos.cc/logos/spain/512x512/spain-national-team.4ad85efc.png",
  seleccionespanola: "https://assets.football-logos.cc/logos/spain/512x512/spain-national-team.4ad85efc.png",
  francia: "https://assets.football-logos.cc/logos/france/512x512/france-national-team.a17f83af.png",
  seleccionfrancesa: "https://assets.football-logos.cc/logos/france/512x512/france-national-team.a17f83af.png",
  holanda: "https://upload.wikimedia.org/wikipedia/en/7/78/Netherlands_national_football_team_logo.svg",
  seleccionholandesa: "https://upload.wikimedia.org/wikipedia/en/7/78/Netherlands_national_football_team_logo.svg",
  inglaterra: "https://assets.football-logos.cc/logos/england/512x512/england-national-team.daba5ba0.png",
  seleccioninglesa: "https://assets.football-logos.cc/logos/england/512x512/england-national-team.daba5ba0.png",
  italia: "https://assets.football-logos.cc/logos/italy/512x512/italy-national-team.2d467c1f.png",
  seleccionitaliana: "https://assets.football-logos.cc/logos/italy/512x512/italy-national-team.2d467c1f.png",
  portugal: "https://assets.football-logos.cc/logos/portugal/512x512/portuguese-football-federation.1a0b6707.png",
  seleccionportuguesa: "https://assets.football-logos.cc/logos/portugal/512x512/portuguese-football-federation.1a0b6707.png"
};

const getLogoUrl = (eq) => {
  if (!eq) return null;
  const normalizar = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, '');
  
  const idKey = normalizar(eq.id);
  const nameKey = normalizar(eq.nombre);
  
  return ESCUDOS_MAP[idKey] || ESCUDOS_MAP[nameKey] || null;
};

export default function TrescientosunoLocal({ onVolver, onExit }) {
  const navigate = useNavigate();

  const [fase, setFase] = useState('setup');
  const [modalAyuda, setModalAyuda] = useState(false);

  const [numJugadores, setNumJugadores] = useState(3);
  const [jugadores, setJugadores] = useState([
    { id: 1, nombre: 'Jugador 1', puntos: 0, estado: 'vivo' },
    { id: 2, nombre: 'Jugador 2', puntos: 0, estado: 'vivo' },
    { id: 3, nombre: 'Jugador 3', puntos: 0, estado: 'vivo' }
  ]);

  const [equipos, setEquipos] = useState([]);
  const [equipoSel, setEquipoSel] = useState(null);
  
  const [objetivo, setObjetivo] = useState(301);
  const [estadistica, setEstadistica] = useState('goles');

  const [turnoIndex, setTurnoIndex] = useState(0);
  const [jugadoresUsados, setJugadoresUsados] = useState([]);
  const [inputJugador, setInputJugador] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [ultimoAcierto, setUltimoAcierto] = useState(null);

  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_TURNO);
  const timerRef = useRef(null);
  const jugadoresRef = useRef(jugadores);
  const turnoRef = useRef(0);
  const timeoutRef = useRef(null);
  const finTurnoRef = useRef(0);
  const turnoCerradoRef = useRef(false);

  useEffect(() => {
    fetch('/api/trescientosuno/equipos')
      .then(r => r.json())
      .then(d => { if (d.success) setEquipos(d.equipos); })
      .catch(() => {});
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const guardarJugadores = (lista) => { jugadoresRef.current = lista; setJugadores(lista); };
  const guardarTurno = (i) => { turnoRef.current = i; setTurnoIndex(i); };
  const detenerTemporizador = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    turnoCerradoRef.current = true;
  };
  const despuesDe = (ms, fn) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(fn, ms);
  };

  const handleNumJugadoresChange = (cantidad) => {
    const cant = Math.min(MAX_JUGADORES, Math.max(MIN_JUGADORES, cantidad));
    setNumJugadores(cant);
    setJugadores((prev) => {
      const nuevaLista = [];
      for (let i = 1; i <= cant; i++) {
        const existente = prev.find((p) => p.id === i);
        nuevaLista.push(existente || { id: i, nombre: `Jugador ${i}`, puntos: 0, estado: 'vivo' });
      }
      jugadoresRef.current = nuevaLista;
      return nuevaLista;
    });
  };

  const handleNombreJugador = (id, nuevoNombre) => {
    setJugadores((prev) => {
      const lista = prev.map((j) => (j.id === id ? { ...j, nombre: nuevoNombre } : j));
      jugadoresRef.current = lista;
      return lista;
    });
  };

  const iniciarJuego = () => {
    const jActualizados = jugadoresRef.current.map(j => ({
      ...j,
      nombre: j.nombre.trim() || `Jugador ${j.id}`,
      puntos: objetivo,
      estado: 'vivo'
    }));
    
    guardarJugadores(jActualizados);
    setJugadoresUsados([]);
    setUltimoAcierto(null);
    const startIndex = Math.floor(Math.random() * jActualizados.length);
    guardarTurno(startIndex);
    setFase('jugando');
    iniciarTemporizador();
  };

  const iniciarTemporizador = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    turnoCerradoRef.current = false;
    finTurnoRef.current = Date.now() + TIEMPO_TURNO * 1000;
    setTiempoRestante(TIEMPO_TURNO);
    timerRef.current = setInterval(() => {
      const restante = Math.max(0, Math.ceil((finTurnoRef.current - Date.now()) / 1000));
      setTiempoRestante(restante);
      if (restante <= 0) handlePierdeTurno('¡Tiempo agotado!');
    }, 250);
  };

  const pasarTurno = () => {
    detenerTemporizador();
    setMensajeError('');
    setInputJugador('');
    setUltimoAcierto(null);

    const lista = jugadoresRef.current;
    if (!lista.some(j => j.estado === 'vivo')) {
      setFase('resultados');
      return;
    }

    let nextIndex = (turnoRef.current + 1) % lista.length;
    while (lista[nextIndex].estado !== 'vivo') {
      nextIndex = (nextIndex + 1) % lista.length;
    }
    guardarTurno(nextIndex);
    iniciarTemporizador();
  };

  const actualizarActual = (cambios) => {
    const nuevos = jugadoresRef.current.map((j, i) => (i === turnoRef.current ? { ...j, ...cambios } : j));
    guardarJugadores(nuevos);
    return nuevos;
  };

  const handlePierdeTurno = (motivo) => {
    detenerTemporizador();
    const currId = jugadoresRef.current[turnoRef.current].id;
    setUltimoAcierto({ tipo: 'fallo', msj: motivo, jugadorId: currId });
    despuesDe(2000, pasarTurno);
  };

  const handleEliminacion = (motivo) => {
    detenerTemporizador();
    const currId = jugadoresRef.current[turnoRef.current].id;
    actualizarActual({ estado: 'eliminado' });
    setUltimoAcierto({ tipo: 'eliminado', msj: motivo, jugadorId: currId });
    despuesDe(3000, pasarTurno);
  };

  const handlePlantarse = () => {
    detenerTemporizador();
    const currId = jugadoresRef.current[turnoRef.current].id;
    actualizarActual({ estado: 'plantado' });
    setUltimoAcierto({ tipo: 'plantado', msj: `${jugadoresRef.current[turnoRef.current].nombre} se ha plantado.`, jugadorId: currId });
    despuesDe(1500, pasarTurno);
  };

  const validarJugadorSubmit = async (e) => {
    e.preventDefault();
    if (ultimoAcierto) return;
    
    if (!inputJugador.trim()) {
      handlePierdeTurno('No has escrito ningún jugador.');
      return;
    }

    try {
      const res = await fetch('/api/trescientosuno/validar-jugador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipoId: equipoSel.id, nombreJugador: inputJugador })
      });
      
      if (!res.ok) {
        try {
          const errData = await res.json();
          handlePierdeTurno(errData.error || `Error del servidor: ${res.status}`);
        } catch {
          handlePierdeTurno(`Error del servidor: ${res.status}`);
        }
        return;
      }
      
      const data = await res.json();

      if (!(data.success && data.encontrado)) {
        handlePierdeTurno(data.mensaje || 'Jugador no encontrado.');
        return;
      }

      const jbd = data.jugador;
      if (jugadoresUsados.includes(jbd.nombre)) {
        handlePierdeTurno(`${jbd.nombre} ya ha sido dicho.`);
        return;
      }

      if (turnoCerradoRef.current) return;
      const valorEstadistica = Number(jbd[estadistica]) || 0;
      
      if (valorEstadistica === 0) {
        handleEliminacion(`${jbd.nombre} tiene 0 ${estadistica}. ¡Eliminado!`);
        return;
      }

      detenerTemporizador();
      const currId = jugadoresRef.current[turnoRef.current].id;
      const nuevaPuntuacion = jugadoresRef.current[turnoRef.current].puntos - valorEstadistica;
      setJugadoresUsados((prev) => [...prev, jbd.nombre]);

      if (nuevaPuntuacion === 0) {
        actualizarActual({ puntos: 0, estado: 'ganador' });
        setUltimoAcierto({ tipo: 'ganador', msj: `¡DIANA! ${jbd.nombre} (${valorEstadistica}). ¡Ha clavado el 0!`, jugadorId: currId, valor: valorEstadistica });
        despuesDe(3500, () => setFase('resultados'));
      } else if (nuevaPuntuacion < 0) {
        actualizarActual({ puntos: nuevaPuntuacion });
        handleEliminacion(`${jbd.nombre} restó ${valorEstadistica}. Te has pasado de 0.`);
      } else {
        actualizarActual({ puntos: nuevaPuntuacion });
        setUltimoAcierto({ tipo: 'acierto', msj: `¡${jbd.nombre}!`, jugadorId: currId, valor: valorEstadistica });
        despuesDe(2500, pasarTurno);
      }
    } catch (err) {
      handlePierdeTurno('Error de conexión.');
    }
  };

  const getGanador = () => {
    const validos = jugadores.filter(j => j.puntos >= 0 && j.estado !== 'eliminado');
    if (validos.length === 0) return null;
    return [...validos].sort((a, b) => a.puntos - b.puntos);
  };
  const rankingFinal = getGanador();

  return (
    <div className="tcu-contenedor">
      {fase === 'setup' && (
        <button type="button" className="btn-ayuda-flotante" onClick={() => setModalAyuda(true)} title="Reglas">
          <span className="btn-ayuda-flotante-signo">?</span>
        </button>
      )}

      {modalAyuda && (
        <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="rg-modal modal-ayuda-juego" onClick={(e) => e.stopPropagation()}>
            <div className="modal-ayuda-header">
              <span className="modal-ayuda-signo-title">?</span>
              <h3>¿Cómo se juega a 301 Goles?</h3>
            </div>
            <div className="modal-ayuda-cuerpo">
              <p><strong>1. Dinámica del juego:</strong></p>
              <ul>
                <li>Se selecciona un equipo y una estadística a restar (Goles, Asistencias o Partidos).</li>
                <li>Por turnos, introduce el nombre de un jugador que haya estado en ese club.</li>
                <li>Se restarán de tu marcador los puntos correspondientes a ese jugador en el club.</li>
                <li>Si no lo aciertas o no respondes a tiempo, perderás tu turno pero seguirás vivo.</li>
                <li>¡Cuidado! Si te pasas del 0 exacto, o nombras a alguien con 0 en esa estadística, quedas eliminado.</li>
              </ul>
            </div>
            <div className="rg-modal-acciones">
              <button className="btn-start" style={{ width: '100%' }} onClick={() => setModalAyuda(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {fase === 'setup' && (
        <>
          <div className="game-intro-banner">
            <div className="game-intro-icon-box">
              <span style={{ fontSize: '2.2rem' }}>🎯</span>
            </div>
            <div className="game-intro-text">
              <h2>301 Goles (Un dispositivo)</h2>
              <p>Resta puntuación adivinando jugadores hasta llegar a cero sin pasarte.</p>
            </div>
          </div>

          <div className="game-setup-white-card">
            <div className="hud" style={{ marginBottom: '1rem' }}>
              <button className="btn-back-inline" onClick={onVolver}>
                &larr; Cambiar a modo Online
              </button>
            </div>

            <div className="section-title">
              <Icon name="users" size={22} />
              <span>Participantes</span>
            </div>

            <div className="form-group">
              <label className="form-label">Número de jugadores ({MIN_JUGADORES} a {MAX_JUGADORES})</label>
              <div className="select-wrapper">
                <select
                  className="game-select"
                  value={numJugadores}
                  onChange={(e) => handleNumJugadoresChange(Number(e.target.value))}
                >
                  {Array.from({ length: MAX_JUGADORES - MIN_JUGADORES + 1 }, (_, i) => i + MIN_JUGADORES).map((num) => (
                    <option key={num} value={num}>
                      {num} jugadores
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nombres</label>
              <div className="players-inputs-grid">
                {jugadores.map((j) => (
                  <input
                    key={j.id}
                    type="text"
                    className="player-text-input"
                    value={j.nombre}
                    placeholder={`Jugador ${j.id}`}
                    onChange={(e) => handleNombreJugador(j.id, e.target.value)}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-start" onClick={() => setFase('equipo')}>
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}

      {fase === 'equipo' && (
        <section className="game">
          <div className="hud"><span className="chip"><Icon name="shield" size={18} /> Selecciona un Equipo/Selección</span></div>
          <div className="tcu-grid-equipos">
            {equipos.map(eq => {
              const urlImagen = getLogoUrl(eq);
              return (
                <div 
                  key={eq.id} 
                  className="tcu-equipo-card" 
                  title={eq.nombre}
                  onClick={() => { setEquipoSel(eq); setFase('config'); }}
                >
                  {urlImagen ? (
                    <img 
                      src={urlImagen} 
                      alt={eq.nombre} 
                      className="tcu-escudo-img" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <div className="tcu-escudo-texto" style={{ display: urlImagen ? 'none' : 'block' }}>
                    {eq.nombre}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {fase === 'config' && (() => {
        const urlImagenSel = getLogoUrl(equipoSel);
        return (
          <section className="game">
            <div className="panel">
              <h2 className="title center">Configuración de Partida</h2>
              <div className="tcu-equipo-sel center">
                <div className="tcu-escudo-big">
                  {urlImagenSel ? (
                    <>
                      <img 
                        src={urlImagenSel} 
                        alt={equipoSel.nombre} 
                        className="tcu-escudo-img"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="tcu-escudo-texto" style={{ display: 'none' }}>
                        {equipoSel.nombre}
                      </div>
                    </>
                  ) : (
                    <div className="tcu-escudo-texto">{equipoSel.nombre}</div>
                  )}
                </div>
                <h3>{equipoSel.nombre}</h3>
              </div>
              
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="form-label">Estadística a restar</label>
                <div className="select-wrapper">
                  <select className="game-select" value={estadistica} onChange={(e) => setEstadistica(e.target.value)}>
                    <option value="goles">Goles</option>
                    <option value="asistencias">Asistencias</option>
                    <option value="partidos">Partidos Jugados</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="form-label">Puntuación Objetivo</label>
                <input 
                  type="number" 
                  className="player-text-input" 
                  value={objetivo} 
                  onChange={(e) => setObjetivo(Number(e.target.value))}
                  min="1"
                />
              </div>
            </div>
            <button className="big full btn-start" style={{ marginTop: '1rem', width: '100%' }} onClick={iniciarJuego}>
              <Icon name="play" size={24} /> ¡Comenzar!
            </button>
          </section>
        );
      })()}

      {fase === 'jugando' && (
        <section className="game">
          <div className="hud">
            <span className="chip"><Icon name="shield" size={18} /> {equipoSel.nombre}</span>
            <span className="chip alt">Objetivo: 0 {estadistica}</span>
          </div>

          <div className="tcu-marcador-grid">
            {jugadores.map((j, i) => (
              <div key={j.id} className={`tcu-marcador-item ${i === turnoIndex ? 'activo' : ''} ${j.estado}`}>
                <div className="nombre">{j.nombre}</div>
                <div className="puntos">{j.estado === 'eliminado' ? 'X' : j.puntos}</div>
                
                {ultimoAcierto && ultimoAcierto.jugadorId === j.id && (ultimoAcierto.tipo === 'acierto' || ultimoAcierto.tipo === 'ganador') && (
                  <div className="floating-resta">- {ultimoAcierto.valor}</div>
                )}
              </div>
            ))}
          </div>

          <div className="panel center tcu-turno-panel">
            {ultimoAcierto ? (
              <div className="tcu-evento-display">
                <span className="evento-icon">
                   {ultimoAcierto.tipo === 'acierto' && '⚽'}
                   {ultimoAcierto.tipo === 'ganador' && '🏆'}
                   {ultimoAcierto.tipo === 'fallo' && '❌'}
                   {ultimoAcierto.tipo === 'plantado' && '🛑'}
                   {ultimoAcierto.tipo === 'eliminado' && '💀'}
                </span>
                <h3>{ultimoAcierto.msj}</h3>
              </div>
            ) : (
              <>
                <h2 className="title">Turno de {jugadores[turnoIndex].nombre}</h2>
                <div className="timer-bar-container">
                  <div className={`timer-bar ${tiempoRestante <= 10 ? 'low' : ''}`} style={{ width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%` }} />
                </div>
                <p className="timer-text">{tiempoRestante} s</p>

                <form onSubmit={validarJugadorSubmit} className="tcu-form">
                  <input 
                    type="text" 
                    value={inputJugador} 
                    onChange={(e) => { setInputJugador(e.target.value); setMensajeError(''); }} 
                    placeholder={`Dime un jugador del ${equipoSel.nombre}...`}
                    className="player-text-input"
                    autoFocus 
                  />
                  {mensajeError && <p className="error" style={{ marginBottom: '1rem' }}>{mensajeError}</p>}
                  <div className="tcu-actions">
                    <button type="submit" className="btn-start" style={{ width: '100%' }}>Enviar</button>
                    <button type="button" className="secondary danger" onClick={handlePlantarse}>Plantarse</button>
                  </div>
                </form>
              </>
            )}
          </div>

          {jugadoresUsados.length > 0 && (
            <div className="tcu-usados">
              <strong>Ya dichos:</strong> {jugadoresUsados.join(', ')}
            </div>
          )}
        </section>
      )}

      {fase === 'resultados' && (
        <section className="game">
          <div className="end-card panel">
            <span className="end-icon"><Icon name="trophy" size={48} /></span>
            <h1 className="title">Fin de la partida</h1>
            <p className="final-score">
              {!rankingFinal ? 'Todos han sido eliminados.' : `Ganador: ${rankingFinal[0].nombre} (se quedó a ${rankingFinal[0].puntos})`}
            </p>
            <div className="scoreboard">
              {[...jugadores].sort((a, b) => (a.estado === 'eliminado') - (b.estado === 'eliminado') || a.puntos - b.puntos).map((j) => (
                <div key={j.id} className="score-row">
                  <span className="score-name">{j.nombre} {j.estado === 'plantado' && '(Plantado)'}</span>
                  <span className="score-pts">{j.estado === 'eliminado' ? 'Eliminado' : j.puntos}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="actions" style={{ marginTop: '1.5rem' }}>
            <button onClick={() => { setUltimoAcierto(null); setFase('equipo'); }}><Icon name="refresh" size={20} /> Jugar otro equipo</button>
            <button className="secondary danger" onClick={() => (onExit ? onExit() : navigate('/'))}><Icon name="door" size={20} /> Salir</button>
          </div>
        </section>
      )}
    </div>
  );
}