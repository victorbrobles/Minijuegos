import React, { useState, useMemo } from 'react';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import './Traicion.css';

const MIN_JUGADORES = 7;
const MAX_JUGADORES = 15;
const HABITACIONES = ['Laboratorio', 'Generador', 'Comunicaciones', 'Almacén', 'Enfermería', 'Seguridad'];

const nombresPorDefecto = (n) => Array.from({ length: n }, (_, i) => `Jugador ${i + 1}`);

export default function TraicionLocal({ onSalir }) {
  const [fase, setFase] = useState('setup'); // setup, pasar_movil, turno_despliegue, turno_accion, reporte, votacion, fin
  const [numJugadores, setNumJugadores] = useState(MIN_JUGADORES);
  const [nombres, setNombres] = useState(nombresPorDefecto(MIN_JUGADORES));
  const [numInfectados, setNumInfectados] = useState(2);
  const [modalAyuda, setModalAyuda] = useState(false);

  // Estado del juego
  const [e, setE] = useState(null);
  const [jugadorActivoIdx, setJugadorActivoIdx] = useState(0);
  const [faseActual, setFaseActual] = useState('');

  const cambiarNumJugadores = (ev) => {
    const k = Number(ev.target.value);
    setNumJugadores(k);
    setNombres((prev) => (k > prev.length ? [...prev, ...nombresPorDefecto(k).slice(prev.length)] : prev.slice(0, k)));
    
    // Auto-ajustar número de infectados recomendado
    if (k < 9) setNumInfectados(2);
    else if (k < 12) setNumInfectados(3);
    else setNumInfectados(4);
  };

  const iniciarPartida = () => {
    let roles = Array(numJugadores).fill('Investigador');
    for (let i = 0; i < numInfectados; i++) roles[i] = 'Infectado';
    roles = roles.sort(() => Math.random() - 0.5);

    const estadoInicial = {
      jugadores: nombres.map((n, i) => ({
        id: i + 1,
        nombre: n.trim() || `Jugador ${i + 1}`,
        rol: roles[i],
        vivo: true,
        habitacion: null,
        accion: null,
        voto: null
      })),
      progreso: 0,
      ronda: 1,
      reporte: []
    };
    setE(estadoInicial);
    prepararPasarMovil(estadoInicial, 0, 'despliegue');
  };

  const prepararPasarMovil = (st, idx, fasePasar) => {
    let nextIdx = idx;
    while (nextIdx < st.jugadores.length && !st.jugadores[nextIdx].vivo) {
      nextIdx++;
    }

    if (nextIdx >= st.jugadores.length) {
      if (fasePasar === 'despliegue') prepararPasarMovil(st, 0, 'accion');
      else if (fasePasar === 'accion') procesarRonda(st);
      return;
    }

    if (fasePasar === 'accion' && st.jugadores[nextIdx].rol !== 'Infectado') {
      st.jugadores[nextIdx].accion = 'trabajar';
      prepararPasarMovil(st, nextIdx + 1, fasePasar);
      return;
    }

    setJugadorActivoIdx(nextIdx);
    setFaseActual(fasePasar);
    setE(st);
    setFase('pasar_movil');
  };

  const seleccionarHabitacion = (hab) => {
    const st = { ...e };
    st.jugadores[jugadorActivoIdx].habitacion = hab;
    prepararPasarMovil(st, jugadorActivoIdx + 1, 'despliegue');
  };

  const seleccionarAccion = (accionStr) => {
    const st = { ...e };
    st.jugadores[jugadorActivoIdx].accion = accionStr;
    prepararPasarMovil(st, jugadorActivoIdx + 1, 'accion');
  };

  const procesarRonda = (st) => {
    let nuevoProgreso = st.progreso;
    const reporte = [];
    const muertos = [];

    st.jugadores.forEach(j => {
      if (!j.vivo) return;
      if (j.accion === 'trabajar') nuevoProgreso += 5;
      if (j.accion === 'sabotear') {
        nuevoProgreso -= 15;
        reporte.push("💥 ¡Alarma: Se han saboteado las instalaciones!");
      }
      if (j.accion?.startsWith('matar_')) {
        const victimaId = parseInt(j.accion.split('_')[1]);
        const victima = st.jugadores.find(v => v.id === victimaId);
        if (victima && !muertos.includes(victima.id)) {
          muertos.push(victima.id);
          reporte.push(`💀 ¡Se ha encontrado el cadáver de ${victima.nombre} en ${victima.habitacion}!`);
        }
      }
    });

    st.progreso = Math.max(0, nuevoProgreso);
    muertos.forEach(mId => st.jugadores.find(x => x.id === mId).vivo = false);
    st.reporte = reporte.length ? reporte : ["La ronda ha sido tranquila..."];

    const ganador = verificarFinPartida(st);
    setE(st);
    if (ganador) setFase('fin');
    else setFase('reporte');
  };

  const votar = (idTarget) => {
    const st = { ...e };
    st.jugadores[jugadorActivoIdx].voto = idTarget;
    
    let nextIdx = jugadorActivoIdx + 1;
    while (nextIdx < st.jugadores.length && !st.jugadores[nextIdx].vivo) nextIdx++;

    if (nextIdx >= st.jugadores.length) procesarVotacion(st);
    else {
      setJugadorActivoIdx(nextIdx);
      setFaseActual('votacion');
      setE(st);
      setFase('pasar_movil');
    }
  };

  const procesarVotacion = (st) => {
    const conteo = {};
    st.jugadores.filter(j => j.vivo).forEach(j => {
      if (j.voto !== 'nadie') conteo[j.voto] = (conteo[j.voto] || 0) + 1;
    });

    let expulsadoId = null; let max = 0; let empate = false;
    for (const [id, votos] of Object.entries(conteo)) {
      if (votos > max) { max = votos; expulsadoId = parseInt(id); empate = false; }
      else if (votos === max) empate = true;
    }

    if (expulsadoId && !empate) {
      const exp = st.jugadores.find(j => j.id === expulsadoId);
      exp.vivo = false;
      st.reporte = [`❄️ La base ha expulsado a la nieve a ${exp.nombre}.`];
    } else {
      st.reporte = ["⚖️ Nadie ha sido expulsado por empate o falta de votos."];
    }

    st.jugadores.forEach(j => { j.habitacion = null; j.accion = null; j.voto = null; });
    st.ronda += 1;
    
    const ganador = verificarFinPartida(st);
    setE(st);
    if (ganador) setFase('fin');
    else prepararPasarMovil(st, 0, 'despliegue');
  };

  const verificarFinPartida = (st) => {
    const vivos = st.jugadores.filter(j => j.vivo);
    const inf = vivos.filter(j => j.rol === 'Infectado').length;
    const inv = vivos.length - inf;

    if (st.progreso >= 100) return 'investigadores';
    if (inf >= inv || inf === 0) return inf >= inv ? 'infectados' : 'investigadores';
    return null;
  };

  const ayuda = modalAyuda && (
    <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
      <div className="rg-modal modal-ayuda-juego" onClick={(ev) => ev.stopPropagation()}>
        <div className="modal-ayuda-header"><span className="modal-ayuda-signo-title">?</span><h3>Cómo se juega a «Traiciones»</h3></div>
        <div className="modal-ayuda-cuerpo">
          <p><strong>1. Despliegue:</strong> En secreto, cada jugador elige a qué habitación va.</p>
          <p><strong>2. Acción (Solo Infectados):</strong> Los infectados deciden si disimular, sabotear la base, o asesinar a quien esté con ellos en la misma habitación.</p>
          <p><strong>3. Reporte y Debate:</strong> Se muestran los asesinatos y sabotajes. ¡Hablad! Cread coartadas y buscad contradicciones.</p>
          <p><strong>4. Votación:</strong> En secreto, votáis para expulsar a un sospechoso a la nieve.</p>
        </div>
        <div className="rg-modal-acciones"><button className="big full" onClick={() => setModalAyuda(false)}>Entendido</button></div>
      </div>
    </div>
  );

  if (fase === 'setup') {
    return (
      <div className="tr-contenedor">
        {ayuda}
        <section className="game" style={{ position: 'relative' }}>
          <button type="button" className="btn-ayuda-flotante" onClick={() => setModalAyuda(true)} title="Reglas">
            <span className="btn-ayuda-flotante-signo">?</span>
          </button>
          
          <GameIntro gameId="traicion" titulo="Traiciones (Local)" />
          
          <div className="panel">
            <h3 className="panel-title"><Icon name="users" size={22} /> Ajustes de Partida</h3>
            
            <label className="field-label" htmlFor="tr-num">Número de jugadores (Mín. {MIN_JUGADORES})</label>
            <select id="tr-num" value={numJugadores} onChange={cambiarNumJugadores}>
              {Array.from({ length: MAX_JUGADORES - MIN_JUGADORES + 1 }, (_, i) => i + MIN_JUGADORES).map((k) => (
                <option key={k} value={k}>{k} jugadores</option>
              ))}
            </select>

            <label className="field-label" htmlFor="tr-inf" style={{marginTop:'1rem'}}>Número de Infectados</label>
            <select id="tr-inf" value={numInfectados} onChange={(e) => setNumInfectados(Number(e.target.value))}>
              <option value={1}>1 Infectado</option>
              <option value={2}>2 Infectados</option>
              <option value={3}>3 Infectados</option>
              <option value={4}>4 Infectados (Caos)</option>
            </select>

            <span className="field-label" style={{marginTop:'1rem'}}>Nombres</span>
            <div className="names-grid">
              {nombres.map((nombre, i) => (
                <input key={i} type="text" value={nombre} maxLength={20} placeholder={`Jugador ${i + 1}`}
                  onChange={(ev) => setNombres((p) => p.map((x, k) => (k === i ? ev.target.value : x)))} />
              ))}
            </div>
          </div>
          
          <div className="actions">
            <button className="big full" onClick={iniciarPartida}><Icon name="play" size={22} /> Empezar Partida</button>
            <button className="secondary full" onClick={onSalir}>Volver</button>
          </div>
        </section>
      </div>
    );
  }

  const j = e?.jugadores[jugadorActivoIdx];

  if (fase === 'pasar_movil') {
    return (
      <div className="tr-contenedor">
        <section className="game center tr-escena-noche">
          <span className="lb-luna"><Icon name="lock" size={64} strokeWidth={1.5} /></span>
          <p className="categoria">Ronda {e.ronda} · Fase secreta</p>
          <h1 className="title">Pasa el móvil a <span className="hl">{j.nombre}</span></h1>
          <p className="hint">Que nadie más mire la pantalla.</p>
          <button className="big full" style={{marginTop:'2rem'}} onClick={() => setFase(faseActual === 'despliegue' ? 'turno_despliegue' : (faseActual === 'accion' ? 'turno_accion' : 'votacion_secreta'))}>
            <Icon name="check" size={22} /> Soy {j.nombre}
          </button>
        </section>
      </div>
    );
  }

  if (fase === 'turno_despliegue') {
    return (
      <div className="tr-contenedor">
        <section className="game tr-escena-noche">
          <div className="hud">
            <span className="chip"><Icon name="users" size={18} />{j.nombre}</span>
            <span className="chip alt">Ronda {e.ronda}</span>
          </div>
          <div className="panel center" style={{background: 'transparent', boxShadow: 'none', color: 'white'}}>
            <div className={`tr-rol-card ${j.rol.toLowerCase()}`}>
              <h2 className="tr-rol-title">Eres {j.rol}</h2>
              <p style={{fontSize: '0.9rem', opacity: 0.9}}>
                {j.rol === 'Infectado' ? 'Elimina a los demás sin ser visto.' : 'Repara la base y sobrevive.'}
              </p>
            </div>
            <h3 style={{marginTop: '1rem'}}>¿A qué habitación vas a ir?</h3>
            <div className="tr-rooms-grid">
              {HABITACIONES.map(h => (
                <button key={h} className="tr-room-btn" onClick={() => seleccionarHabitacion(h)}>{h}</button>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (fase === 'turno_accion') {
    const enMiHabitacion = e.jugadores.filter(x => x.vivo && x.habitacion === j.habitacion && x.id !== j.id);
    return (
      <div className="tr-contenedor">
        <section className="game tr-escena-noche">
          <div className="hud">
            <span className="chip"><Icon name="users" size={18} />{j.nombre}</span>
          </div>
          <div className="panel center" style={{background: 'transparent', boxShadow: 'none', color: 'white'}}>
            <h3>Estás en {j.habitacion}</h3>
            <p className="hint" style={{marginBottom:'1rem'}}>Nadie te ve. ¿Qué vas a hacer?</p>
            <div className="lb-form">
              <button className="secondary full" style={{background:'white', color:'black'}} onClick={() => seleccionarAccion('trabajar')}>
                🛠️ Trabajar (Disimular)
              </button>
              <button className="secondary danger full" style={{marginTop:'0.8rem'}} onClick={() => seleccionarAccion('sabotear')}>
                💥 Sabotear (-15% Progreso)
              </button>
              {enMiHabitacion.map(v => (
                <button key={v.id} className="big full" style={{marginTop:'0.8rem', background:'#dc2626', borderColor:'#991b1b'}} onClick={() => seleccionarAccion(`matar_${v.id}`)}>
                  🔪 Matar a {v.nombre}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (fase === 'reporte') {
    return (
      <div className="tr-contenedor">
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="check" size={44} /></span>
            <p className="categoria">Fin de la ronda {e.ronda}</p>
            <h1 className="title">Reporte de la Base</h1>
            
            <div className="tr-progress-bar">
              <div className="tr-progress-fill" style={{width: `${e.progreso}%`}}></div>
            </div>
            <p className="final-score" style={{fontSize:'1.1rem'}}>Progreso del rescate: {e.progreso}%</p>
          </div>
          
          <div className="panel" style={{marginTop:'1rem'}}>
            <h3 className="panel-title"><Icon name="bell" size={20} /> Sucesos recientes</h3>
            <div className="tr-reporte-box">
              {e.reporte.map((r, i) => <p key={i} className={r.includes('💀') || r.includes('💥') || r.includes('❄️') ? 'danger' : ''}>{r}</p>)}
            </div>
            <p className="hint center">¡Hablad! Es el momento de buscar contradicciones.</p>
          </div>

          <div className="actions">
            <button className="big full" onClick={() => { setJugadorActivoIdx(e.jugadores.findIndex(x=>x.vivo)); setFaseActual('votacion'); setFase('pasar_movil'); }}>
              <Icon name="landmark" size={22} /> Pasar a Votación
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (fase === 'votacion_secreta') {
    return (
      <div className="tr-contenedor">
        <section className="game tr-escena-noche">
          <div className="hud">
            <span className="chip"><Icon name="users" size={18} />{j.nombre}</span>
          </div>
          <div className="panel center" style={{background: 'transparent', boxShadow: 'none', color: 'white'}}>
            <h3 className="title">Votación secreta</h3>
            <p className="hint" style={{marginBottom:'1.5rem'}}>¿A quién quieres expulsar a la nieve?</p>
            <div className="lb-form">
              <button className="secondary full" style={{background:'white', color:'black'}} onClick={() => votar('nadie')}>
                A nadie (Omitir)
              </button>
              <div style={{display:'flex', flexDirection:'column', gap:'0.6rem', marginTop:'1rem'}}>
                {e.jugadores.filter(x => x.vivo && x.id !== j.id).map(x => (
                  <button key={x.id} className="secondary danger full" onClick={() => votar(x.id)}>
                    Expulsar a {x.nombre}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (fase === 'fin') {
    const ganador = verificarFinPartida(e);
    return (
      <div className="tr-contenedor">
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name={ganador === 'infectados' ? 'skull' : 'trophy'} size={44} /></span>
            <p className="categoria">Fin de la partida</p>
            <h1 className="title">¡Han ganado los {ganador.toUpperCase()}!</h1>
          </div>
          
          <div className="panel reveal-panel" style={{marginTop:'1rem'}}>
            <h3 className="reveal-title"><Icon name="eye" size={20} /> Identidades reveladas</h3>
            <div className="reveal-list">
              {e.jugadores.map(x => (
                <div key={x.id} className="reveal-row">
                  <span className="reveal-name" style={{textDecoration: !x.vivo ? 'line-through' : 'none'}}>{x.nombre}</span>
                  <span className="reveal-card" style={{color: x.rol === 'Infectado' ? '#dc2626' : '#64748b'}}>{x.rol}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="actions">
            <button className="big full" onClick={() => setFase('setup')}><Icon name="refresh" size={22} /> Jugar de nuevo</button>
            <button className="secondary full" onClick={onSalir}>Volver al menú</button>
          </div>
        </section>
      </div>
    );
  }

  return null;
}