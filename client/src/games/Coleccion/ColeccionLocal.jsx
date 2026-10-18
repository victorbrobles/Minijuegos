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

const generarMazo = () => {
  let mazo = [];
  let uid = 1;
  // 80 Cartas de recursos (8 palos x 10 cartas)
  PALOS.forEach(p => {
    for (let i = 0; i < 10; i++) {
      mazo.push({ uid: uid++, tipo: 'palo', palo: p.id, icono: p.icono, nombre: p.nombre });
    }
  });
  // 13 cartas de Suministros (3 + 10 extras)
  for (let i = 0; i < 13; i++) {
    mazo.push({ uid: uid++, tipo: 'accion', accion: 'robar_tres', icono: '📦', nombre: 'Suministros', desc: 'Robas 3 cartas de una en una.' });
  }
  // 3 copias de las otras 7 acciones (21 cartas)
  ACCIONES.filter(a => a.id !== 'robar_tres').forEach(a => {
    for (let i = 0; i < 3; i++) {
      mazo.push({ uid: uid++, tipo: 'accion', accion: a.id, icono: a.icono, nombre: a.nombre, desc: a.desc });
    }
  });
  return mazo.sort(() => Math.random() - 0.5);
};

export default function ColeccionLocal({ onSalir }) {
  const [paso, setPaso] = useState('setup');
  const [nombres, setNombres] = useState(['Jugador 1', 'Jugador 2', 'Jugador 3', 'Jugador 4']);
  const [e, setE] = useState(null);

  const [modal, setModal] = useState(null);
  const [purgaSeleccionadas, setPurgaSeleccionadas] = useState([]);
  const [resumenAccion, setResumenAccion] = useState(null);
  const [avisoDerrota, setAvisoDerrota] = useState(null);

  const iniciarPartida = () => {
    let mazo = generarMazo();
    const jugadores = nombres.map((n, i) => ({
      id: i + 1,
      nombre: n || `Jugador ${i + 1}`,
      vivo: true,
      mano: mazo.splice(0, 4) // 4 cartas iniciales
    }));
    
    // Aseguramos que la primera carta del descarte sea un palo normal
    let primeraDescarteIdx = mazo.findIndex(c => c.tipo === 'palo');
    const descarte = [mazo.splice(primeraDescarteIdx, 1)[0]];

    setE({
      jugadores,
      mazo,
      descarte,
      accionesGastadas: [],
      turnoIdx: 0,
      faseTurno: 'robar',
      robosSuministros: 0,
      ganador: null,
      log: ['¡Partida iniciada! Cada jugador comienza con 4 cartas.']
    });
    setPaso('pasar_movil');
  };

  const rellenarMazo = (st) => {
    if (st.mazo.length === 0) {
      const top = st.descarte.pop();
      const cartasReutilizables = [...st.descarte, ...(st.accionesGastadas || [])];
      st.mazo = cartasReutilizables.sort(() => Math.random() - 0.5);
      st.descarte = top ? [top] : [];
      st.accionesGastadas = [];
    }
  };

  const comprobarVictoriaDerrota = (st) => {
    let eliminado = null;

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
        st.log.unshift(`🏆 ¡${j.nombre} ha reunido 5 cartas iguales y gana la partida!`);
      } else if (palosDistintos >= 5) {
        j.vivo = false;
        // Solo las cartas de palo van al descarte; las acciones al pozo gastado
        j.mano.forEach(c => {
          if (c.tipo === 'palo') st.descarte.push(c);
          else (st.accionesGastadas = st.accionesGastadas || []).push(c);
        });
        j.mano = [];
        st.log.unshift(`💀 ¡${j.nombre} acumuló 5 palos diferentes y fue eliminado!`);
        eliminado = j;
      }
    });

    const vivos = st.jugadores.filter(j => j.vivo);
    if (vivos.length === 1 && !st.ganador) {
      st.ganador = vivos[0].nombre;
      st.log.unshift(`🏆 ¡${vivos[0].nombre} es el último superviviente y gana!`);
    }

    if (eliminado) {
      setAvisoDerrota(eliminado);
    }
  };

  const avanzarTurno = (st) => {
    let next = (st.turnoIdx + 1) % st.jugadores.length;
    while (!st.jugadores[next].vivo && st.jugadores.filter(j => j.vivo).length > 1) {
      next = (next + 1) % st.jugadores.length;
    }
    st.turnoIdx = next;
    st.faseTurno = 'robar';
    st.robosSuministros = 0;
  };

  const robar = (origen) => {
    const st = { ...e };
    const j = st.jugadores[st.turnoIdx];

    rellenarMazo(st);
    const carta = origen === 'mazo' ? st.mazo.pop() : st.descarte.pop();
    if (carta) {
      j.mano.push(carta);
      st.log.unshift(`📥 ${j.nombre} robó del ${origen}.`);
    }

    comprobarVictoriaDerrota(st);
    if (st.ganador) {
      setE(st);
      setPaso('fin');
      return;
    }

    if (!j.vivo) {
      setE(st);
      return;
    }

    // Si está bajo efecto de Suministros
    if (st.robosSuministros > 0) {
      st.robosSuministros -= 1;
      if (st.robosSuministros > 0) {
        // Aún le quedan robos de suministros: permanece en robar, sin poder jugar acciones intermedias
        st.faseTurno = 'robar';
        setE(st);
      } else {
        // Ha robado la 3ª carta: finaliza el turno inmediatamente
        setResumenAccion({
          titulo: 'Suministros completados',
          icono: '📦',
          mensaje: 'Has robado las 3 cartas de una en una. Tu turno ha finalizado.',
          manoFinal: [...j.mano]
        });
        setE(st);
      }
      return;
    }

    st.faseTurno = 'jugar';
    setE(st);
  };

  const finalizarAccion = (carta, callbackEfecto) => {
    const st = { ...e };
    const yo = st.jugadores[st.turnoIdx];

    yo.mano = yo.mano.filter(c => c.uid !== carta.uid);

    // Las cartas de acción NUNCA van al descarte
    if (carta.tipo === 'palo') {
      st.descarte.push(carta);
    } else {
      (st.accionesGastadas = st.accionesGastadas || []).push(carta);
    }

    const infoResultado = callbackEfecto(st, yo);

    comprobarVictoriaDerrota(st);
    setModal(null);
    setPurgaSeleccionadas([]);
    setE(st);

    if (st.ganador) {
      setPaso('fin');
      return;
    }

    if (!yo.vivo) {
      return;
    }

    if (infoResultado) {
      setResumenAccion({
        ...infoResultado,
        manoFinal: [...yo.mano]
      });
    }
  };

  const confirmarFinTurno = () => {
    const st = { ...e };
    setResumenAccion(null);
    avanzarTurno(st);
    setE(st);
    setPaso('pasar_movil');
  };

  const iniciarUsoCarta = (carta) => {
    if (e.faseTurno !== 'jugar') return;

    if (carta.tipo === 'palo') {
      finalizarAccion(carta, (st, yo) => {
        st.log.unshift(`📤 ${yo.nombre} descartó ${carta.nombre}.`);
        return {
          titulo: 'Palo descartado',
          icono: carta.icono,
          mensaje: `Has descartado ${carta.nombre}. Tu turno ha finalizado.`
        };
      });
      return;
    }

    if (carta.accion === 'robar_tres') {
      // Activa los 3 robos individuales sin acciones intermedias
      const st = { ...e };
      const yo = st.jugadores[st.turnoIdx];
      yo.mano = yo.mano.filter(c => c.uid !== carta.uid);
      (st.accionesGastadas = st.accionesGastadas || []).push(carta); // No va al descarte
      st.robosSuministros = 3;
      st.faseTurno = 'robar';
      st.log.unshift(`📦 ${yo.nombre} activó Suministros: roba 3 cartas de una en una.`);
      setE(st);
      return;
    }

    if (carta.accion === 'descartar_tres') {
      setPurgaSeleccionadas([]);
      setModal({ tipo: 'descartar_tres', carta });
      return;
    }

    setModal({ tipo: carta.accion, carta, pasoInterno: 1, targetId: null });
  };

  if (paso === 'setup') {
    return (
      <div className="col-contenedor">
        <section className="game">
          <GameIntro gameId="coleccion" titulo="Colecciona con Cabeza" />
          <div className="panel">
            <h3 className="panel-title"><Icon name="users" size={22} /> Jugadores (2-8)</h3>
            <div className="names-grid" style={{ marginBottom: '1rem' }}>
              {nombres.map((n, i) => (
                <input key={i} value={n} onChange={(ev) => setNombres(prev => prev.map((x, k) => k === i ? ev.target.value : x))} maxLength={15} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="secondary full" disabled={nombres.length >= 8} onClick={() => setNombres([...nombres, `Jugador ${nombres.length + 1}`])}>+ Añadir</button>
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
        <section className="game center" style={{ padding: '3.5rem 1.5rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.8rem' }}>📱</div>
          <h2 className="title" style={{ fontSize: '1.6rem' }}>Pasa el móvil a:<br />{yo.nombre}</h2>
          <p className="hint" style={{ marginTop: '1rem' }}>No mires la pantalla si no es tu turno.</p>
          <button className="big full" style={{ marginTop: '2rem' }} onClick={() => setPaso('jugando')}>
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
            <p className="final-score" style={{ color: '#16a34a' }}>🏆 Ganador: {e.ganador}</p>
          </div>
          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title">Historial de jugadas</h3>
            {e.log.slice(0, 5).map((l, i) => <p key={i} className="hint small" style={{ marginBottom: '0.4rem' }}>{l}</p>)}
          </div>
          <div className="actions">
            <button className="big full" onClick={() => setPaso('setup')}><Icon name="refresh" size={22} /> Jugar de nuevo</button>
            <button className="secondary full" onClick={onSalir}>Salir</button>
          </div>
        </section>
      </div>
    );
  }

  const topDescarte = e.descarte[e.descarte.length - 1];
  const rivalesVivos = e.jugadores.filter(j => j.vivo && j.id !== yo.id);

  const renderModal = () => {
    if (!modal) return null;
    const { tipo, carta, pasoInterno, targetId } = modal;
    const targetJugador = e.jugadores.find(j => j.id === targetId);

    return (
      <div className="rg-modal-fondo" onClick={() => setModal(null)}>
        <div className="rg-modal" onClick={ev => ev.stopPropagation()} style={{ maxWidth: '440px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.4rem', color: '#1e1b4b' }}>{carta.nombre} {carta.icono}</h3>
          <p className="hint small" style={{ marginBottom: '1.2rem' }}>{carta.desc}</p>

          {/* Ruleta */}
          {tipo === 'intercambio_azar' && (
            <div>
              <p className="field-label">Elige un rival para intercambiar a ciegas:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {rivalesVivos.map(r => (
                  <button key={r.id} className="secondary full" disabled={r.mano.length === 0} onClick={() => {
                    finalizarAccion(carta, (st, actYo) => {
                      const t = st.jugadores.find(x => x.id === r.id);
                      const miC = actYo.mano.splice(Math.floor(Math.random() * actYo.mano.length), 1)[0];
                      const suC = t.mano.splice(Math.floor(Math.random() * t.mano.length), 1)[0];
                      actYo.mano.push(suC);
                      t.mano.push(miC);
                      st.log.unshift(`🔀 ${actYo.nombre} intercambió cartas a ciegas con ${t.nombre}.`);
                      return {
                        titulo: 'Intercambio realizado',
                        icono: '🔀',
                        mensaje: `Has entregado un(a) ${miC.nombre} y recibido ${suC.icono} ${suC.nombre} de ${t.nombre}.`
                      };
                    });
                  }}>
                    {r.nombre} ({r.mano.length} cartas)
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Purga */}
          {tipo === 'descartar_tres' && (
            <div>
              <p className="field-label">Selecciona hasta 3 cartas de tu mano para purgar:</p>
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
                finalizarAccion(carta, (st, actYo) => {
                  const descartadas = actYo.mano.filter(c => purgaSeleccionadas.includes(c.uid));
                  actYo.mano = actYo.mano.filter(c => !purgaSeleccionadas.includes(c.uid));
                  // Los palos van al descarte; las acciones nunca al descarte
                  descartadas.forEach(c => {
                    if (c.tipo === 'palo') st.descarte.push(c);
                    else (st.accionesGastadas = st.accionesGastadas || []).push(c);
                  });
                  st.log.unshift(`🗑️ ${actYo.nombre} purgó ${descartadas.length} carta(s).`);
                  return {
                    titulo: 'Purga completada',
                    icono: '🗑️',
                    mensaje: `Has descartado ${descartadas.length} carta(s) con éxito.`
                  };
                });
              }}>
                Confirmar descarte ({purgaSeleccionadas.length})
              </button>
            </div>
          )}

          {/* Robo Preciso */}
          {tipo === 'robar_elegida' && (
            <div>
              {pasoInterno === 1 && (
                <>
                  <p className="field-label">¿A qué rival quieres robarle?</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {rivalesVivos.map(r => (
                      <button key={r.id} className="secondary full" disabled={r.mano.length === 0} onClick={() => setModal({ ...modal, pasoInterno: 2, targetId: r.id })}>
                        {r.nombre} ({r.mano.length} cartas)
                      </button>
                    ))}
                  </div>
                </>
              )}
              {pasoInterno === 2 && targetJugador && (
                <>
                  <p className="field-label">Toca la carta que quieres quedarte de {targetJugador.nombre}:</p>
                  <div className="col-mano" style={{ padding: '0.8rem', minHeight: 'auto' }}>
                    {targetJugador.mano.map(c => (
                      <div key={c.uid} className="col-carta" onClick={() => {
                        finalizarAccion(carta, (st, actYo) => {
                          const t = st.jugadores.find(x => x.id === targetId);
                          t.mano = t.mano.filter(x => x.uid !== c.uid);
                          actYo.mano.push(c);
                          st.log.unshift(`🎯 ${actYo.nombre} le quitó ${c.nombre} a ${t.nombre}.`);
                          return {
                            titulo: 'Robo preciso exitoso',
                            icono: '🎯',
                            mensaje: `Le has quitado ${c.icono} ${c.nombre} a ${t.nombre}.`
                          };
                        });
                      }}>
                        <span className="card-top-icon">{c.icono}</span>
                        <span className="card-center-icon">{c.icono}</span>
                        <span className="card-footer-name">{c.nombre}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Regalo Envenenado */}
          {tipo === 'dar_carta' && (
            <div>
              {pasoInterno === 1 && (
                <>
                  <p className="field-label">¿Qué carta de tu mano quieres endosarle a un rival?</p>
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
                  <p className="field-label">¿A qué rival se la entregas?</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {rivalesVivos.map(r => (
                      <button key={r.id} className="secondary full" onClick={() => {
                        finalizarAccion(carta, (st, actYo) => {
                          const t = st.jugadores.find(x => x.id === r.id);
                          const regalada = actYo.mano.find(x => x.uid === modal.miCartaId);
                          actYo.mano = actYo.mano.filter(x => x.uid !== modal.miCartaId);
                          t.mano.push(regalada);
                          st.log.unshift(`🎁 ${actYo.nombre} le dio un(a) ${regalada.nombre} a ${t.nombre}.`);
                          return {
                            titulo: 'Regalo entregado',
                            icono: '🎁',
                            mensaje: `Le has metido ${regalada.icono} ${regalada.nombre} a ${t.nombre}.`
                          };
                        });
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
              {pasoInterno === 1 && (
                <>
                  <p className="field-label">¿A quién quieres espiar?</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {rivalesVivos.map(r => (
                      <button key={r.id} className="secondary full" onClick={() => setModal({ ...modal, pasoInterno: 2, targetId: r.id })}>
                        {r.nombre} ({r.mano.length} cartas)
                      </button>
                    ))}
                  </div>
                </>
              )}
              {pasoInterno === 2 && targetJugador && (
                <>
                  <p className="field-label">Mano completa de {targetJugador.nombre}:</p>
                  <div className="col-mano" style={{ padding: '0.8rem', minHeight: 'auto', marginBottom: '1rem' }}>
                    {targetJugador.mano.map(c => (
                      <div key={c.uid} className="col-carta disabled">
                        <span className="card-top-icon">{c.icono}</span>
                        <span className="card-center-icon">{c.icono}</span>
                        <span className="card-footer-name">{c.nombre}</span>
                      </div>
                    ))}
                  </div>
                  <button className="big full" onClick={() => {
                    finalizarAccion(carta, (st, actYo) => {
                      st.log.unshift(`👁️‍🗨️ ${actYo.nombre} espió la mano de ${targetJugador.nombre}.`);
                      return {
                        titulo: 'Espionaje realizado',
                        icono: '👁️‍🗨️',
                        mensaje: `Has visto la mano completa de ${targetJugador.nombre}.`
                      };
                    });
                  }}>
                    Continuar
                  </button>
                </>
              )}
            </div>
          )}

          {/* Duelo */}
          {tipo === 'retar' && (
            <div>
              {pasoInterno === 1 && (
                <>
                  <p className="field-label">¿A qué rival retas a duelo?</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {rivalesVivos.map(r => (
                      <button key={r.id} className="secondary full" disabled={r.mano.length === 0} onClick={() => setModal({ ...modal, pasoInterno: 2, targetId: r.id })}>
                        {r.nombre} ({r.mano.length} cartas)
                      </button>
                    ))}
                  </div>
                </>
              )}
              {pasoInterno === 2 && targetJugador && (
                <>
                  <p className="field-label">¿Qué palo le pides a {targetJugador.nombre}?</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    {PALOS.map(p => (
                      <button key={p.id} className="secondary" onClick={() => {
                        finalizarAccion(carta, (st, actYo) => {
                          const t = st.jugadores.find(x => x.id === targetId);
                          const idxPalo = t.mano.findIndex(x => x.palo === p.id);
                          if (idxPalo !== -1) {
                            const ganada = t.mano.splice(idxPalo, 1)[0];
                            actYo.mano.push(ganada);
                            st.log.unshift(`⚔️ Duelo: ${actYo.nombre} acertó y le quitó ${p.icono} ${p.nombre} a ${t.nombre}!`);
                            return {
                              titulo: '¡HAS GANADO EL DUELO!',
                              dueloGanado: true,
                              icono: '⚔️',
                              mensaje: `¡Acertaste! ${t.nombre} tenía ese palo y te ha entregado ${ganada.icono} ${ganada.nombre}.`
                            };
                          } else {
                            let perdida = null;
                            if (actYo.mano.length > 0) {
                              perdida = actYo.mano.splice(Math.floor(Math.random() * actYo.mano.length), 1)[0];
                              t.mano.push(perdida);
                            }
                            st.log.unshift(`⚔️ Duelo: ${t.nombre} no tenía ese palo. ¡${actYo.nombre} perdió una carta!`);
                            return {
                              titulo: '¡HAS PERDIDO EL DUELO!',
                              dueloGanado: false,
                              icono: '❌',
                              mensaje: `${t.nombre} NO tenía ese palo. Como penalización, le has tenido que entregar ${perdida ? `${perdida.icono}${perdida.nombre}` : 'nada'}.`
                            };
                          }
                        });
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
              <p className="field-label">¿Con quién intercambias tu mano entera?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {rivalesVivos.map(r => (
                  <button key={r.id} className="secondary full" onClick={() => {
                    finalizarAccion(carta, (st, actYo) => {
                      const t = st.jugadores.find(x => x.id === r.id);
                      const temp = [...actYo.mano];
                      actYo.mano = [...t.mano];
                      t.mano = temp;
                      st.log.unshift(`🌪️ ¡Torbellino! ${actYo.nombre} y ${t.nombre} intercambiaron sus manos.`);
                      return {
                        titulo: '¡Torbellino ejecutado!',
                        icono: '🌪️',
                        mensaje: `Has intercambiado todas tus cartas con ${t.nombre}.`
                      };
                    });
                  }}>
                    {r.nombre} ({r.mano.length} cartas)
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
          {e.jugadores.map(j => (
            <div key={j.id} className={`col-jug-chip ${!j.vivo ? 'muerto' : ''} ${j.id === yo.id ? 'activo' : ''}`}>
              {j.nombre} {j.vivo && `(${j.mano.length})`}
            </div>
          ))}
        </div>

        {e.log.length > 0 && <p className="hint center small" style={{ marginBottom: '0.8rem' }}>{e.log[0]}</p>}

        <div className="col-zonas-comunes">
          <div className="col-mazo-container">
            <span className="field-label">Mazo ({e.mazo.length})</span>
            <div className={`col-carta reverso ${e.faseTurno !== 'robar' ? 'disabled' : ''}`} onClick={() => e.faseTurno === 'robar' && robar('mazo')}>
              <span className="card-center-icon">🃏</span>
              <span className="card-footer-name" style={{ color: '#ffffff' }}>Robar</span>
            </div>
          </div>
          <div className="col-mazo-container">
            <span className="field-label">Descarte</span>
            {topDescarte ? (
              <div className={`col-carta ${e.faseTurno !== 'robar' ? 'disabled' : ''}`} onClick={() => e.faseTurno === 'robar' && robar('descarte')}>
                <span className="card-top-icon">{topDescarte.icono}</span>
                <span className="card-center-icon">{topDescarte.icono}</span>
                <span className="card-footer-name">{topDescarte.nombre}</span>
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
          <h3 className="panel-title">Mano de {yo.nombre}</h3>
          
          {e.robosSuministros > 0 && (
            <div style={{ marginBottom: '0.8rem' }}>
              <span className="badge" style={{ background: '#fef08a', color: '#854d0e', padding: '0.35rem 0.8rem', fontWeight: 800 }}>
                📦 Suministros activo: Roba de 1 en 1 (te quedan {e.robosSuministros} robos)
              </span>
            </div>
          )}

          <p className="hint small" style={{ marginBottom: '1rem' }}>
            {e.faseTurno === 'robar' ? (
              e.robosSuministros > 0 
                ? 'Roba del Mazo o Descarte para continuar los Suministros.' 
                : '👉 Paso 1: Roba una carta del Mazo o del Descarte.'
            ) : (
              '👉 Paso 2: Descarta un palo o activa una carta de acción.'
            )}
          </p>

          <div className={`col-mano ${e.faseTurno === 'jugar' ? 'activa' : ''}`}>
            {yo.mano.map(c => (
              <div key={c.uid} className={`col-carta ${c.tipo === 'accion' ? 'accion' : ''} ${e.faseTurno !== 'jugar' ? 'disabled' : ''}`} onClick={() => iniciarUsoCarta(c)}>
                <span className="card-top-icon">{c.icono}</span>
                <span className="card-center-icon">{c.icono}</span>
                <span className="card-footer-name">{c.nombre}</span>
              </div>
            ))}
            {yo.mano.length === 0 && <p className="hint small">No tienes cartas.</p>}
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

      {/* Pantalla de confirmación tras acción */}
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
                {resumenAccion.manoFinal.map(c => (
                  <div key={c.uid} className={`col-carta disabled ${c.tipo === 'accion' ? 'accion' : ''}`} style={{ width: '74px', height: '105px' }}>
                    <span className="card-top-icon">{c.icono}</span>
                    <span className="card-center-icon" style={{ fontSize: '1.8rem' }}>{c.icono}</span>
                    <span className="card-footer-name">{c.nombre}</span>
                  </div>
                ))}
                {resumenAccion.manoFinal.length === 0 && <p className="hint small">Te has quedado sin cartas.</p>}
              </div>
            </div>

            <button className="big full" onClick={confirmarFinTurno}>
              <Icon name="check" size={20} /> Finalizar Turno
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE DERROTA / ELIMINACIÓN */}
      {avisoDerrota && (
        <div className="rg-modal-fondo">
          <div className="rg-modal" style={{ maxWidth: '440px', padding: '2rem 1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.6rem' }}>💀</div>
            <h2 style={{ color: '#dc2626', margin: '0 0 0.6rem' }}>¡HAS SIDO ELIMINADO!</h2>
            <p className="hint" style={{ fontSize: '1rem', color: '#334155', lineHeight: '1.4', marginBottom: '1.5rem' }}>
              <strong>{avisoDerrota.nombre}</strong>, has acumulado <strong>5 palos diferentes</strong> en tu mano. Has quedado fuera de la partida y tus cartas pasan al descarte.
            </p>
            <button className="big full" style={{ background: '#dc2626', borderColor: '#b91c1c' }} onClick={() => {
              setAvisoDerrota(null);
              const st = { ...e };
              avanzarTurno(st);
              setE(st);
              setPaso('pasar_movil');
            }}>
              Aceptar y pasar dispositivo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}