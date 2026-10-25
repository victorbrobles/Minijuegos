import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import './Trescientosuno.css';

const CLAVE_SESION_trescientosuno = 'trescientosuno_online_session';

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

export default function TrescientosunoOnline({ onLocal, onSalir }) {
  const [vista, setVista] = useState('menu'); 
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);
  
  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_trescientosuno));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const intervalRef = useRef(null);

  const [equipos, setEquipos] = useState([]);
  const [equipoSel, setEquipoSel] = useState(null);
  const [estadisticaSel, setEstadisticaSel] = useState('goles');
  const [objetivoSel, setObjetivoSel] = useState(301);

  const [inputJugador, setInputJugador] = useState('');
  const [errorJuego, setErrorJuego] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return;
    }

    const consultarEstado = () => {
      fetch(`/api/trescientosuno/online/sala/${sesion.code}?token=${sesion.token}`)
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
          sessionStorage.removeItem(CLAVE_SESION_trescientosuno);
          setSesion(null);
          setSala(null);
          setVista('menu');
          setErrorMsg('La sala se ha cerrado o se ha perdido la conexión.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  const llamar = async (ruta, body = {}) => {
    const res = await fetch(`/api/trescientosuno/online/sala/${sesion.code}/${ruta}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: sesion.token, ...body })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'No se ha podido completar la acción.');
    return data;
  };

  const accionAdmin = async (ruta, body) => {
    setErrorMsg('');
    setCargando(true);
    try {
      await llamar(ruta, body);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const estadoSala = sala?.estado;
  useEffect(() => {
    if (estadoSala !== 'configuracion' || equipos.length > 0) return;
    fetch('/api/trescientosuno/equipos')
      .then((r) => r.json())
      .then((d) => { if (d.success) setEquipos(d.equipos); })
      .catch(() => setErrorMsg('No se han podido cargar los equipos.'));
  }, [estadoSala, equipos.length]);

  const turnoId = sala?.turnoActualId;
  useEffect(() => { setInputJugador(''); setErrorJuego(''); }, [turnoId, estadoSala]);

  const enviarJugador = async (e) => {
    e.preventDefault();
    if (!inputJugador.trim() || enviando) return;
    setEnviando(true);
    setErrorJuego('');
    try {
      await llamar('jugar', { nombreJugador: inputJugador });
      setInputJugador('');
    } catch (err) {
      setErrorJuego(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const plantarse = async () => {
    if (enviando) return;
    setEnviando(true);
    setErrorJuego('');
    try {
      await llamar('plantarse');
    } catch (err) {
      setErrorJuego(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setErrorMsg('');
    setCargando(true);
    try {
      const res = await fetch('/api/trescientosuno/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la sala.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_trescientosuno, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleUnirse = async () => {
    if (!nombre.trim() || !codigoInput.trim()) return;
    setErrorMsg('');
    setCargando(true);
    try {
      const res = await fetch('/api/trescientosuno/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al unirse.');

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_trescientosuno, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleSalir = async () => {
    if (sesion) {
      try {
        await fetch(`/api/trescientosuno/online/sala/${sesion.code}/salir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: sesion.token })
        });
      } catch {
      }
    }
    sessionStorage.removeItem(CLAVE_SESION_trescientosuno);
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

  const esAdmin = Boolean(sala?.esAdmin);
  const yoId = sala?.yoId;
  const mostrarAyuda = vista === 'menu' || vista === 'crear' || vista === 'unirse' || (vista === 'sala' && sala?.estado === 'lobby');

  return (
    <div className="tcu-contenedor">
      {mostrarAyuda && (
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

      {vista === 'menu' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica"><span style={{ fontSize: '2.4rem' }}>🎯</span></span>
            <h1 className="title">301 Goles Online</h1>
            <p className="hint">Resta puntuación adivinando jugadores hasta llegar a cero sin pasarte.</p>
            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}
            <div className="lb-menu">
              <button className="btn-start" style={{ width: '100%', marginBottom: '0.5rem' }} onClick={() => { setVista('crear'); setErrorMsg(''); }}>
                <Icon name="crown" size={22} /> Crear partida
              </button>
              <button className="btn-start" style={{ width: '100%', marginBottom: '0.5rem' }} onClick={() => { setVista('unirse'); setErrorMsg(''); }}>
                <Icon name="users" size={22} /> Unirse a partida
              </button>
              <button className="secondary full" onClick={onLocal}>
                <Icon name="home" size={20} /> Jugar en un solo dispositivo
              </button>
            </div>
          </div>
        </section>
      )}
      
      {vista === 'crear' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="crown" size={40} strokeWidth={1.6} />
            </span>
            <h2 className="title">Crear partida</h2>
            <p className="hint">Introduce tu nombre para crear la sala y ser el anfitrión.</p>

            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <label className="form-label" htmlFor="tcu-host-nombre">Tu nombre</label>
              <input
                id="tcu-host-nombre"
                className="player-text-input"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
                autoFocus
              />
              {errorMsg && <p className="error">{errorMsg}</p>}

              <button
                className="btn-start"
                style={{ width: '100%', marginTop: '1rem' }}
                disabled={cargando || !nombre.trim()}
                onClick={handleCrear}
              >
                <Icon name="check" size={22} strokeWidth={2.5} /> Crear sala
              </button>
              <button
                className="secondary full"
                style={{ marginTop: '0.6rem' }}
                onClick={() => { setVista('menu'); setErrorMsg(''); }}
              >
                Volver
              </button>
            </div>
          </div>
        </section>
      )}

      {vista === 'unirse' && (
        <section className="game">
          <div className="panel center">
            <span className="lb-luna chica">
              <Icon name="users" size={40} strokeWidth={1.6} />
            </span>
            <h2 className="title">Unirse a partida</h2>
            <p className="hint">Introduce el código de 4 letras que te ha dado el anfitrión.</p>

            <div className="lb-form" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
              <label className="form-label" htmlFor="tcu-code-input">Código de la sala</label>
              <input
                id="tcu-code-input"
                className="player-text-input"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                autoFocus
              />

              <label className="form-label" htmlFor="tcu-guest-nombre" style={{ marginTop: '1rem' }}>Tu nombre</label>
              <input
                id="tcu-guest-nombre"
                className="player-text-input"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
              />
              {errorMsg && <p className="error">{errorMsg}</p>}

              <button
                className="btn-start"
                style={{ width: '100%', marginTop: '1rem' }}
                disabled={cargando || !nombre.trim() || codigoInput.trim().length < 4}
                onClick={handleUnirse}
              >
                <Icon name="check" size={22} strokeWidth={2.5} /> Entrar en la partida
              </button>
              <button
                className="secondary full"
                style={{ marginTop: '0.6rem' }}
                onClick={() => { setVista('menu'); setErrorMsg(''); }}
              >
                Volver
              </button>
            </div>
          </div>
        </section>
      )}

      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game">
          <div className="panel center">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 1.1rem',
                  borderRadius: '9999px',
                  border: '1.5px solid var(--g1)',
                  backgroundColor: '#f0fdf4',
                  color: 'var(--g2)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  lineHeight: 1
                }}
              >
                <Icon name="lock" size={15} />
                Sala de espera
              </span>
            </div>
            <p className="hint">Código de la partida</p>
            <button
              type="button"
              className="qq-codigo-btn"
              onClick={copiarCodigo}
              title="Copiar código"
            >
              {sala.code}
            </button>
            <p className="hint small">
              {codigoCopiado ? '¡Copiado al portapapeles!' : 'Pulsa el código para copiarlo y compártelo con los demás.'}
            </p>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({sala.jugadores.length})</h3>
            <div className="lb-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === yoId ? 'yo' : ''}`}>
                  <span className="lb-punto on" />
                  <span className="lb-jug-nombre">
                    {j.nombre}{j.id === yoId ? ' (tú)' : ''}{j.esAdmin ? ' 👑' : ''}
                  </span>
                </div>
              ))}
            </div>
            {sala.jugadores.length < 2 && (
              <p className="hint" style={{ marginTop: '0.8rem' }}>
                Falta al menos 1 jugador más para poder empezar.
              </p>
            )}
          </div>

          {esAdmin ? (
            <div style={{ marginTop: '1.2rem' }}>
              {errorMsg && <p className="error">{errorMsg}</p>}
              <button
                className="btn-start"
                style={{ width: '100%' }}
                disabled={cargando || sala.jugadores.length < 2}
                onClick={() => accionAdmin('empezar')}
              >
                <Icon name="play" size={22} />
                {sala.jugadores.length < 2 ? 'Esperando jugadores...' : '¡Empezar juego!'}
              </button>
            </div>
          ) : (
            <div className="panel center" style={{ padding: '2rem 1.5rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
              <h3 style={{ margin: '0.5rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">El anfitrión empezará la partida cuando estéis todos.</p>
            </div>
          )}

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {vista === 'sala' && sala && sala.estado === 'configuracion' && (
        <section className="game">
          {esAdmin ? (
            <>
              <div className="panel">
                <h2 className="title center">Elige equipo y reglas</h2>
                <p className="hint center">Los jugadores tendrán que decir futbolistas de este equipo.</p>

                <div className="tcu-grid-equipos">
                  {equipos.map((eq) => {
                    const urlImagen = getLogoUrl(eq);
                    return (
                      <div
                        key={eq.id}
                        className={`tcu-equipo-card ${equipoSel?.id === eq.id ? 'sel' : ''}`}
                        title={eq.nombre}
                        onClick={() => setEquipoSel(eq)}
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
                {equipos.length === 0 && <p className="hint center" style={{ marginTop: '1rem' }}>Cargando equipos...</p>}

                <div className="tcu-ajustes">
                  <div className="form-group">
                    <label className="form-label" htmlFor="tcu-stat">Estadística a restar</label>
                    <div className="select-wrapper">
                      <select id="tcu-stat" className="game-select" value={estadisticaSel} onChange={(e) => setEstadisticaSel(e.target.value)}>
                        <option value="goles">Goles</option>
                        <option value="asistencias">Asistencias</option>
                        <option value="partidos">Partidos jugados</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="tcu-obj">Puntuación objetivo</label>
                    <input 
                      id="tcu-obj" 
                      type="number" 
                      className="player-text-input" 
                      value={objetivoSel} 
                      onChange={(e) => setObjetivoSel(Number(e.target.value))}
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {errorMsg && <p className="error">{errorMsg}</p>}
              <button
                className="big full btn-start"
                style={{ marginTop: '1rem', width: '100%' }}
                disabled={cargando || !equipoSel}
                onClick={() => accionAdmin('configurar', { equipoId: equipoSel.id, estadistica: estadisticaSel, objetivo: objetivoSel })}
              >
                <Icon name="play" size={24} /> {equipoSel ? `¡Comenzar con ${equipoSel.nombre}!` : 'Elige un equipo'}
              </button>
            </>
          ) : (
            <div className="panel center" style={{ padding: '2rem 1.5rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={40} /></span>
              <h3 style={{ margin: '0.5rem 0' }}>El anfitrión está eligiendo equipo...</h3>
              <p className="hint">La partida empezará en cuanto termine de configurarla.</p>
            </div>
          )}
          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="secondary danger full" onClick={() => setModalSalir(true)}>
              <Icon name="door" size={20} /> Salir de la sala
            </button>
          </div>
        </section>
      )}

      {vista === 'sala' && sala && sala.estado === 'jugando' && (() => {
        const stat = sala.configuracion.estadistica;
        const jTurno = sala.jugadores.find((j) => j.id === sala.turnoActualId);
        const esMiTurno = sala.turnoActualId === yoId;
        const ev = sala.evento;
        
        return (
          <section className="game">
            <div className="hud">
              <span className="chip"><Icon name="shield" size={18} /> {sala.equipoSeleccionado?.nombre}</span>
              <span className="chip alt">Objetivo: 0 {stat}</span>
            </div>

            <div className="tcu-marcador-grid">
              {sala.jugadores.map((j) => (
                <div
                  key={j.id}
                  className={`tcu-marcador-item ${j.id === sala.turnoActualId ? 'activo' : ''} ${j.estado}`}
                >
                  <div className="nombre">{j.nombre}{j.id === yoId ? ' (tú)' : ''}</div>
                  <div className="puntos">{j.estado === 'eliminado' ? 'X' : j.puntuacionActual}</div>
                  
                  {ev && ev.jugadorId === j.id && (ev.tipo === 'acierto' || ev.tipo === 'ganador') && (
                    <div className="floating-resta">- {ev.valor}</div>
                  )}
                </div>
              ))}
            </div>

            <div className="panel center tcu-turno-panel">
              {ev ? (
                <div className="tcu-evento-display">
                  <span className="evento-icon">
                     {ev.tipo === 'acierto' && '⚽'}
                     {ev.tipo === 'ganador' && '🏆'}
                     {ev.tipo === 'fallo' && '❌'}
                     {ev.tipo === 'plantado' && '🛑'}
                     {ev.tipo === 'eliminado' && '💀'}
                  </span>
                  <h3>{ev.mensaje}</h3>
                </div>
              ) : esMiTurno ? (
                <>
                  <h2 className="title">¡Es tu turno!</h2>
                  <div className="timer-bar-container">
                    <div
                      className={`timer-bar ${sala.tiempoRestante <= 10 ? 'low' : ''}`}
                      style={{ width: `${(sala.tiempoRestante / sala.tiempoTurno) * 100}%` }}
                    />
                  </div>
                  <p className="timer-text">{sala.tiempoRestante} s</p>
                  <form onSubmit={enviarJugador} className="tcu-form">
                    <input
                      type="text"
                      value={inputJugador}
                      onChange={(e) => { setInputJugador(e.target.value); setErrorJuego(''); }}
                      placeholder={`Dime un jugador del ${sala.equipoSeleccionado?.nombre}...`}
                      className="player-text-input"
                      autoFocus
                    />
                    {errorJuego && <p className="error" style={{ marginBottom: '1rem' }}>{errorJuego}</p>}
                    <div className="tcu-actions">
                      <button type="submit" className="btn-start" style={{ width: '100%' }} disabled={enviando || !inputJugador.trim()}>Enviar</button>
                      <button type="button" className="secondary danger" disabled={enviando} onClick={plantarse}>Plantarse</button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="title">Turno de {jTurno?.nombre}</h2>
                  <div className="timer-bar-container">
                    <div
                      className={`timer-bar ${sala.tiempoRestante <= 10 ? 'low' : ''}`}
                      style={{ width: `${(sala.tiempoRestante / sala.tiempoTurno) * 100}%` }}
                    />
                  </div>
                  <p className="timer-text">{sala.tiempoRestante} s</p>
                  <p className="tcu-turno-aviso">Esperando su respuesta...</p>
                </>
              )}
            </div>

            {sala.jugadoresUsados.length > 0 && (
              <div className="tcu-usados">
                <strong>Ya dichos:</strong> {sala.jugadoresUsados.join(', ')}
              </div>
            )}

            <div className="actions" style={{ marginTop: '1rem' }}>
              <button className="secondary danger full" onClick={() => setModalSalir(true)}>
                <Icon name="door" size={20} /> Salir de la partida
              </button>
            </div>
          </section>
        );
      })()}

      {vista === 'sala' && sala && sala.estado === 'resultados' && (() => {
        const ranking = [...sala.jugadores].sort(
          (a, b) => (a.estado === 'eliminado') - (b.estado === 'eliminado') || a.puntuacionActual - b.puntuacionActual
        );
        const mejor = ranking.find((j) => j.estado !== 'eliminado');
        return (
          <section className="game">
            <div className="end-card panel">
              <span className="end-icon"><Icon name="trophy" size={48} /></span>
              <h1 className="title">Fin de la partida</h1>
              <p className="final-score">
                {!mejor
                  ? 'Todos han sido eliminados.'
                  : mejor.estado === 'ganador'
                    ? `Ganador: ${mejor.nombre} (¡clavó el 0!)`
                    : `Ganador: ${mejor.nombre} (se quedó a ${mejor.puntuacionActual})`}
              </p>
              <div className="scoreboard">
                {ranking.map((j) => (
                  <div key={j.id} className="score-row">
                    <span className="score-name">{j.nombre}{j.id === yoId ? ' (tú)' : ''} {j.estado === 'plantado' && '(Plantado)'}</span>
                    <span className="score-pts">{j.estado === 'eliminado' ? 'Eliminado' : j.puntuacionActual}</span>
                  </div>
                ))}
              </div>
            </div>
            {errorMsg && <p className="error">{errorMsg}</p>}
            <div className="actions" style={{ marginTop: '1.5rem' }}>
              {esAdmin ? (
                <button disabled={cargando || sala.jugadores.length < 2} onClick={() => accionAdmin('revancha')}>
                  <Icon name="refresh" size={20} /> Jugar otro equipo
                </button>
              ) : (
                <p className="hint center">Esperando a que el anfitrión elija el siguiente equipo...</p>
              )}
              <button className="secondary danger" onClick={() => setModalSalir(true)}>
                <Icon name="door" size={20} /> Salir
              </button>
            </div>
          </section>
        );
      })()}

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