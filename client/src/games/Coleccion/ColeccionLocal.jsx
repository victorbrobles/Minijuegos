import React, { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import GameIntro from '../../components/GameIntro.jsx';
import './Coleccion.css';

const PALOS = [
  { id: 'manzana', nombre: 'Manzana', icono: '🍎' },
  { id: 'seta', nombre: 'Seta', icono: '🍄' },
  { id: 'diamante', nombre: 'Diamante', icono: '💎' },
  { id: 'espada', nombre: 'Espada', icono: '🗡️' },
  { id: 'pocion', nombre: 'Poción', icono: '🧪' },
  { id: 'pergamino', nombre: 'Pergamino', icono: '📜' },
  { id: 'corona', nombre: 'Corona', icono: '👑' },
  { id: 'ojo', nombre: 'Ojo', icono: '👁️' },
  { id: 'luna', nombre: 'Luna', icono: '🌙' },
  { id: 'rayo', nombre: 'Rayo', icono: '⚡' }
];

const ACCIONES = [
  { id: 'ladron', nombre: 'Ladrón', icono: '🥷', desc: 'Roba 1 carta a un rival' },
  { id: 'cambio', nombre: 'Intercambio', icono: '🔄', desc: 'Da una tuya y roba otra' },
  { id: 'suministros', nombre: 'Suministros', icono: '📦', desc: 'Roba 2 cartas extra' }
];

const generarMazo = () => {
  let mazo = [];
  let idCounter = 1;
  PALOS.forEach(p => {
    for (let i = 0; i < 8; i++) mazo.push({ uid: idCounter++, tipo: 'palo', palo: p.id, icono: p.icono, nombre: p.nombre });
  });
  ACCIONES.forEach(a => {
    for (let i = 0; i < 5; i++) mazo.push({ uid: idCounter++, tipo: 'accion', accion: a.id, icono: a.icono, nombre: a.nombre });
  });
  return mazo.sort(() => Math.random() - 0.5);
};

export default function ColeccionLocal({ onSalir }) {
  const [paso, setPaso] = useState('setup'); 
  const [nombres, setNombres] = useState(['Jugador 1', 'Jugador 2', 'Jugador 3', 'Jugador 4']);
  const [e, setE] = useState(null); 
  const [modalAccion, setModalAccion] = useState(null);

  const iniciarPartida = () => {
    let mazo = generarMazo();
    // Cada jugador comienza con 4 cartas en la mano
    const jugadores = nombres.map((n, i) => ({
      id: i + 1, nombre: n || `Jugador ${i+1}`, vivo: true, mano: mazo.splice(0, 4)
    }));
    const descarte = [mazo.pop()];

    setE({
      jugadores, mazo, descarte, turnoIdx: 0, faseTurno: 'robar', ganador: null, log: ['¡Partida iniciada con 4 cartas por jugador!']
    });
    setPaso('pasar_movil');
  };

  const rellenarMazo = (st) => {
    if (st.mazo.length === 0) {
      const top = st.descarte.pop();
      st.mazo = st.descarte.sort(() => Math.random() - 0.5);
      st.descarte = [top];
    }
  };

  const comprobarVictoriaDerrota = (st) => {
    st.jugadores.filter(j => j.vivo).forEach(j => {
      const palosCount = {};
      let palosDistintos = 0;
      j.mano.forEach(c => {
        if (c.tipo === 'palo') {
          if (!palosCount[c.palo]) { palosCount[c.palo] = 0; palosDistintos++; }
          palosCount[c.palo]++;
        }
      });

      const maxMismoPalo = Math.max(0, ...Object.values(palosCount));
      
      if (maxMismoPalo >= 5) {
        st.ganador = j.nombre;
        st.log.unshift(`🏆 ¡${j.nombre} ha reunido 5 cartas iguales y gana!`);
      } else if (palosDistintos >= 5) {
        j.vivo = false;
        st.descarte.push(...j.mano);
        j.mano = [];
        st.log.unshift(`💀 ¡${j.nombre} acumuló 5 tipos distintos y fue eliminado!`);
      }
    });

    const vivos = st.jugadores.filter(j => j.vivo);
    if (vivos.length === 1 && !st.ganador) {
      st.ganador = vivos[0].nombre;
      st.log.unshift(`🏆 ¡${vivos[0].nombre} es el único superviviente!`);
    }
  };

  const avanzarTurno = (st) => {
    let next = (st.turnoIdx + 1) % st.jugadores.length;
    while (!st.jugadores[next].vivo && st.jugadores.filter(j=>j.vivo).length > 1) {
      next = (next + 1) % st.jugadores.length;
    }
    st.turnoIdx = next;
    st.faseTurno = 'robar';
  };

  const robar = (origen) => {
    const st = { ...e };
    const j = st.jugadores[st.turnoIdx];
    
    rellenarMazo(st);
    const carta = origen === 'mazo' ? st.mazo.pop() : st.descarte.pop();
    j.mano.push(carta);
    st.log.unshift(`📥 ${j.nombre} robó del ${origen}.`);

    comprobarVictoriaDerrota(st);
    
    if (st.ganador || !j.vivo) {
      if (!st.ganador) avanzarTurno(st);
      setE(st);
      if (st.ganador) setPaso('fin'); else setPaso('pasar_movil');
      return;
    }

    st.faseTurno = 'jugar';
    setE(st);
  };

  const ejecutarAccion = (carta, payload) => {
    const st = { ...e };
    const yo = st.jugadores[st.turnoIdx];
    
    yo.mano = yo.mano.filter(c => c.uid !== carta.uid);
    st.descarte.push(carta);

    if (carta.tipo === 'palo') {
      st.log.unshift(`📤 ${yo.nombre} descartó ${carta.nombre}.`);
    } 
    else if (carta.accion === 'suministros') {
      rellenarMazo(st); yo.mano.push(st.mazo.pop());
      rellenarMazo(st); yo.mano.push(st.mazo.pop());
      st.log.unshift(`📦 ${yo.nombre} jugó Suministros (2 cartas extra).`);
    }
    else if (carta.accion === 'ladron') {
      const target = st.jugadores.find(j => j.id === payload.targetId);
      const robada = target.mano.splice(Math.floor(Math.random() * target.mano.length), 1)[0];
      yo.mano.push(robada);
      rellenarMazo(st);
      target.mano.push(st.mazo.pop());
      st.log.unshift(`🥷 ${yo.nombre} le robó a ${target.nombre}.`);
    }
    else if (carta.accion === 'cambio') {
      const target = st.jugadores.find(j => j.id === payload.targetId);
      yo.mano = yo.mano.filter(c => c.uid !== payload.miCartaId);
      const miCarta = e.jugadores[st.turnoIdx].mano.find(c => c.uid === payload.miCartaId);
      
      const robada = target.mano.splice(Math.floor(Math.random() * target.mano.length), 1)[0];
      target.mano.push(miCarta);
      yo.mano.push(robada);
      st.log.unshift(`🔄 ${yo.nombre} intercambió con ${target.nombre}.`);
    }

    comprobarVictoriaDerrota(st);
    if (st.ganador) {
      setE(st);
      setPaso('fin');
      return;
    }

    avanzarTurno(st);
    setE(st);
    setModalAccion(null);
    setPaso('pasar_movil');
  };

  const handleClickCartaMano = (carta) => {
    if (e.faseTurno !== 'jugar') return;
    if (carta.tipo === 'palo' || carta.accion === 'suministros') {
      ejecutarAccion(carta);
    } else {
      const rivalesConCartas = e.jugadores.filter(j => j.vivo && j.id !== e.jugadores[e.turnoIdx].id && j.mano.length > 0);
      if (rivalesConCartas.length === 0) {
        alert("Ningún rival tiene cartas.");
        return;
      }
      setModalAccion({ carta, step: 1, targetId: null, miCartaId: null });
    }
  };

  if (paso === 'setup') {
    return (
      <div className="col-contenedor">
        <section className="game">
          <GameIntro gameId="coleccion" titulo="Colecciona con Cabeza" />
          <div className="panel">
            <h3 className="panel-title"><Icon name="users" size={22} /> Jugadores (2-8)</h3>
            <div className="names-grid" style={{marginBottom: '1rem'}}>
              {nombres.map((n, i) => (
                <input key={i} value={n} onChange={(ev) => setNombres(prev => prev.map((x, k) => k === i ? ev.target.value : x))} maxLength={15} />
              ))}
            </div>
            <div style={{display:'flex', gap:'10px'}}>
              <button className="secondary full" disabled={nombres.length >= 8} onClick={() => setNombres([...nombres, `Jugador ${nombres.length+1}`])}>+ Añadir</button>
              <button className="secondary danger full" disabled={nombres.length <= 2} onClick={() => setNombres(nombres.slice(0, -1))}>- Quitar</button>
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

  const yo = e?.jugadores[e?.turnoIdx];

  if (paso === 'pasar_movil') {
    return (
      <div className="col-contenedor">
        <section className="game center" style={{padding: '3rem 1.5rem'}}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.8rem' }}>📱</div>
          <h2 className="title" style={{fontSize: '1.6rem'}}>Pasa el móvil a:<br/>{yo.nombre}</h2>
          <p className="hint" style={{marginTop:'1rem'}}>¡Asegúrate de que nadie más mire tus cartas!</p>
          <button className="big full" style={{marginTop: '2rem'}} onClick={() => setPaso('jugando')}>
            <Icon name="eye" size={22} /> Soy {yo.nombre}
          </button>
        </section>
      </div>
    );
  }

  if (paso === 'fin') {
    return (
      <div className="col-contenedor">
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="trophy" size={44} /></span>
            <h1 className="title">¡Partida Terminada!</h1>
            <p className="final-score" style={{color: '#16a34a'}}>🏆 Ganador: {e.ganador}</p>
          </div>
          <div className="panel" style={{marginTop:'1rem'}}>
            <h3 className="panel-title">Resumen final</h3>
            {e.log.slice(0, 5).map((l, i) => <p key={i} className="hint small" style={{marginBottom:'0.4rem'}}>{l}</p>)}
          </div>
          <div className="actions">
            <button className="big full" onClick={() => setPaso('setup')}><Icon name="refresh" size={22} /> Jugar de nuevo</button>
            <button className="secondary full" onClick={onSalir}>Salir</button>
          </div>
        </section>
      </div>
    );
  }

  const renderModalAccion = () => {
    if (!modalAccion) return null;
    const { carta, step, targetId } = modalAccion;
    const vivosRival = e.jugadores.filter(j => j.vivo && j.id !== yo.id && j.mano.length > 0);

    return (
      <div className="rg-modal-fondo" onClick={() => setModalAccion(null)}>
        <div className="rg-modal" onClick={ev => ev.stopPropagation()} style={{maxWidth: '400px', padding: '1.5rem'}}>
          <h3 style={{marginBottom:'1rem'}}>{carta.nombre} {carta.icono}</h3>
          {step === 1 && (
            <>
              <p className="hint" style={{marginBottom:'1rem'}}>¿A qué rival le vas a robar una carta?</p>
              <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
                {vivosRival.map(j => (
                  <button key={j.id} className="secondary full" onClick={() => {
                    if (carta.accion === 'ladron') ejecutarAccion(carta, { targetId: j.id });
                    else setModalAccion({ ...modalAccion, step: 2, targetId: j.id });
                  }}>
                    {j.nombre} ({j.mano.length} cartas)
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 2 && carta.accion === 'cambio' && (
            <>
              <p className="hint" style={{marginBottom:'1rem'}}>¿Qué carta tuya le vas a dar?</p>
              <div className="col-mano" style={{padding:'1rem'}}>
                {yo.mano.filter(c => c.uid !== carta.uid).map(c => (
                  <div key={c.uid} className={`col-carta ${c.tipo==='accion'?'accion':''}`} onClick={() => ejecutarAccion(carta, { targetId, miCartaId: c.uid })}>
                    <span className="card-icon">{c.icono}</span>
                    <small className="card-name">{c.nombre}</small>
                  </div>
                ))}
              </div>
            </>
          )}
          <button className="secondary danger full" style={{marginTop:'1rem'}} onClick={() => setModalAccion(null)}>Cancelar</button>
        </div>
      </div>
    );
  };

  const topDescarte = e.descarte[e.descarte.length - 1];

  return (
    <div className="col-contenedor">
      <section className="game">
        <div className="col-jugadores-top">
          {e.jugadores.map(j => (
            <div key={j.id} className={`col-jug-chip ${!j.vivo ? 'muerto' : ''} ${j.id === yo.id ? 'activo' : ''}`}>
              {j.nombre} {j.vivo && `(${j.mano.length})`}
            </div>
          ))}
        </div>

        {e.log.length > 0 && <p className="hint center small" style={{marginBottom:'1rem'}}>{e.log[0]}</p>}

        <div className="col-zonas-comunes">
          <div className="col-mazo-container">
            <span className="field-label">Mazo ({e.mazo.length})</span>
            <div className={`col-carta reverso ${e.faseTurno !== 'robar' ? 'disabled' : ''}`} onClick={() => e.faseTurno === 'robar' && robar('mazo')}>
              <span className="card-icon">🃏</span>
              <small className="card-name">Robar</small>
            </div>
          </div>
          <div className="col-mazo-container">
            <span className="field-label">Descarte</span>
            {topDescarte ? (
              <div className={`col-carta ${topDescarte.tipo==='accion'?'accion':''} ${e.faseTurno !== 'robar' ? 'disabled' : ''}`} onClick={() => e.faseTurno === 'robar' && robar('descarte')}>
                <span className="card-icon">{topDescarte.icono}</span>
                <small className="card-name">{topDescarte.nombre}</small>
              </div>
            ) : (
              <div className="col-carta disabled"><small className="card-name">Vacío</small></div>
            )}
          </div>
        </div>

        <div className="panel center" style={{padding:'1rem'}}>
          <h3 className="panel-title">Tu Mano</h3>
          <p className="hint small" style={{marginBottom:'1rem'}}>
            {e.faseTurno === 'robar' ? 'Paso 1: Roba del Mazo o del Descarte.' : 'Paso 2: Descarta un palo o juega una carta de acción.'}
          </p>
          <div className={`col-mano ${e.faseTurno === 'jugar' ? 'activa' : ''}`}>
            {yo.mano.map(c => (
              <div key={c.uid} className={`col-carta ${c.tipo==='accion'?'accion':''}`} onClick={() => handleClickCartaMano(c)}>
                <span className="card-icon">{c.icono}</span>
                <small className="card-name">{c.nombre}</small>
              </div>
            ))}
            {yo.mano.length === 0 && <p className="hint small">No tienes cartas en la mano.</p>}
          </div>
        </div>

        {/* Leyenda de cartas */}
        <div className="col-leyenda">
          <span className="field-label" style={{fontSize:'0.8rem'}}>📖 Leyenda de Acciones</span>
          <div className="col-leyenda-grid">
            {ACCIONES.map(a => (
              <div key={a.id} className="col-leyenda-item">
                <span>{a.icono}</span> <strong>{a.nombre}:</strong> {a.desc}
              </div>
            ))}
          </div>
        </div>
      </section>
      {renderModalAccion()}
    </div>
  );
}