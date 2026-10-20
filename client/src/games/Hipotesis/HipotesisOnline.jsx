// client/src/games/Hipotesis/HipotesisOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import { PantallaDeFase, PantallaFin, Ayuda } from './Vistas.jsx';
import { AJUSTES, OPCIONES_RONDAS } from './engine.js';
import './Hipotesis.css';

const CLAVE_SESION = 'hipotesis_online_session';
const API = '/api/hipotesis/online';

const post = async (url, body) => {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Algo ha fallado.');
  return data;
};

export default function HipotesisOnline({ onLocal }) {
  const [vista, setVista] = useState('menu'); // menu | crear | unirse | sala
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [modalAyuda, setModalAyuda] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [sala, setSala] = useState(null);
  const [offset, setOffset] = useState(0);
  const fallos = useRef(0);
  const [sesion, setSesion] = useState(() => { try { return JSON.parse(sessionStorage.getItem(CLAVE_SESION)); } catch { return null; } });

  const cerrarSesion = (mensaje) => {
    sessionStorage.removeItem(CLAVE_SESION);
    setSesion(null); setSala(null); setVista('menu');
    if (mensaje) setErrorMsg(mensaje);
  };

  const consultar = async (s = sesion) => {
    if (!s) return;
    try {
      const r = await fetch(`${API}/sala/${s.code}?token=${s.token}`);
      if (r.status === 403 || r.status === 404) { cerrarSesion('La sala se ha cerrado o ya no formas parte de ella.'); return; }
      if (!r.ok) throw new Error('error');
      const d = await r.json();
      setOffset(d.ahora - Date.now()); setSala(d); fallos.current = 0; setVista('sala');
    } catch {
      fallos.current += 1;
      if (fallos.current >= 8) cerrarSesion('Se ha perdido la conexión con la sala.');
    }
  };

  useEffect(() => {
    if (!sesion) { setSala(null); return undefined; }
    consultar(sesion);
    const i = setInterval(() => consultar(sesion), 800);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesion]);

  const entrar = async (ruta, cuerpo) => {
    setErrorMsg(''); setCargando(true);
    try {
      const d = await post(`${API}/${ruta}`, cuerpo);
      const nueva = { code: d.code, token: d.token };
      sessionStorage.setItem(CLAVE_SESION, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (e) { setErrorMsg(e.message); } finally { setCargando(false); }
  };

  const llamar = async (ruta, cuerpo = {}) => {
    if (!sesion) return;
    try { await post(`${API}/sala/${sesion.code}/${ruta}`, { token: sesion.token, ...cuerpo }); setErrorMsg(''); await consultar(); }
    catch (e) { setErrorMsg(e.message); }
  };
  const enviar = (tipo, datos = {}) => llamar('accion', { tipo, ...datos });

  const salir = async () => {
    if (sesion) { try { await post(`${API}/sala/${sesion.code}/salir`, { token: sesion.token }); } catch { /* ignorar */ } }
    cerrarSesion();
  };
  const copiar = () => { if (!sala?.code) return; navigator.clipboard?.writeText(sala.code); setCopiado(true); setTimeout(() => setCopiado(false), 2000); };

  const esAdmin = Boolean(sala?.esAdmin);
  const jugadores = sala?.jugadores || [];
  const ranking = [...jugadores].sort((a, b) => b.puntos - a.puntos);
  const puntosTotales = Object.fromEntries(jugadores.map((j) => [j.id, j.puntos]));

  const Marcador = () => (
    <div className="hp-card">
      <h3><Icon name="trophy" size={18} /> Marcador de la sala</h3>
      <div className="scoreboard">
        {ranking.map((j, i) => (
          <div key={j.id} className={`score-row${i === 0 && j.puntos > 0 ? ' first' : ''}`}>
            <span className="score-name">{i === 0 && j.puntos > 0 ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>} {j.nombre}</span>
            <span className="score-pts">{j.puntos} pts</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="hp-wrap">
      {(vista !== 'sala' || sala?.estado === 'lobby') && (
        <button type="button" className="btn-ayuda-flotante" onClick={() => setModalAyuda(true)} title="Reglas"><span className="btn-ayuda-flotante-signo">?</span></button>
      )}
      {modalAyuda && <Ayuda onCerrar={() => setModalAyuda(false)} />}
      {errorMsg && vista !== 'crear' && vista !== 'unirse' && <p className="error">{errorMsg}</p>}

      {vista === 'menu' && (
        <section className="game"><div className="panel hp-centro">
          <span className="hp-logo"><Icon name="bulb" size={44} strokeWidth={1.7} /></span>
          <h1 className="title">La Hipótesis Ganadora</h1>
          <p className="hint">Cada ronda el laboratorio esconde una verdad y tú solo conoces un trocito. Formula una hipótesis (cierta o de farol), apuesta por las de los demás y descubre quién miente. De 3 a 8 jugadores.</p>
          <div className="actions">
            <button className="big full" onClick={() => { setVista('crear'); setErrorMsg(''); }}><Icon name="crown" size={22} /> Crear partida</button>
            <button className="big full" onClick={() => { setVista('unirse'); setErrorMsg(''); }}><Icon name="users" size={22} /> Unirse a partida</button>
            <button className="secondary full" onClick={onLocal}><Icon name="home" size={20} /> Jugar en un solo dispositivo</button>
          </div>
        </div></section>
      )}

      {(vista === 'crear' || vista === 'unirse') && (
        <section className="game"><div className="panel hp-centro">
          <span className="hp-logo"><Icon name={vista === 'crear' ? 'crown' : 'users'} size={40} strokeWidth={1.7} /></span>
          <h2 className="title">{vista === 'crear' ? 'Crear partida' : 'Unirse a partida'}</h2>
          <div style={{ textAlign: 'left', marginTop: '1rem' }}>
            {vista === 'unirse' && (<>
              <label className="field-label" htmlFor="hp-code">Código de la sala</label>
              <input id="hp-code" type="text" placeholder="ABCD" value={codigoInput} maxLength={4} autoFocus onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: 800 }} />
            </>)}
            <label className="field-label" htmlFor="hp-nombre">Tu nombre</label>
            <input id="hp-nombre" type="text" placeholder="Tu nombre" value={nombre} maxLength={20} autoFocus={vista === 'crear'} onChange={(e) => setNombre(e.target.value)} />
            {errorMsg && <p className="error" style={{ marginTop: '.8rem' }}>{errorMsg}</p>}
            <button className="big full" style={{ marginTop: '1rem' }} disabled={cargando || !nombre.trim() || (vista === 'unirse' && codigoInput.trim().length < 4)}
              onClick={() => (vista === 'crear' ? entrar('crear', { nombre: nombre.trim() }) : entrar('unirse', { code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() }))}>
              <Icon name="check" size={22} strokeWidth={2.5} /> {vista === 'crear' ? 'Crear sala' : 'Entrar en la partida'}
            </button>
            <button className="secondary full" style={{ marginTop: '.6rem' }} onClick={() => { setVista('menu'); setErrorMsg(''); }}>Volver</button>
          </div>
        </div></section>
      )}

      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game">
          <div className="panel hp-centro">
            <p className="hint" style={{ marginBottom: '.2rem' }}>Código de la partida</p>
            <button type="button" className="hp-codigo" onClick={copiar}>{sala.code}</button>
            <p className="hint small">{copiado ? '¡Copiado!' : 'Pulsa el código para copiarlo y compártelo.'}</p>
          </div>
          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title"><Icon name="users" size={20} /> Jugadores ({jugadores.length}/{AJUSTES.max})</h3>
            <div className="hp-lista">
              {jugadores.map((j) => (
                <div key={j.id} className={`hp-lj ${j.id === sala.yoId ? 'yo' : ''}`}>
                  <span><span className={`hp-punto ${j.conectado ? '' : 'off'}`} />{j.nombre}{j.id === sala.yoId ? ' (tú)' : ''}{j.id === 1 ? ' 👑' : ''}</span>
                </div>
              ))}
            </div>
            {jugadores.length < AJUSTES.min && <p className="hint" style={{ marginTop: '.8rem' }}>Faltan {AJUSTES.min - jugadores.length} jugadores (mínimo {AJUSTES.min}).</p>}
          </div>
          {esAdmin ? (
            <div className="panel" style={{ marginTop: '1rem' }}>
              <h3 className="panel-title"><Icon name="settings" size={20} /> Ajustes</h3>
              <span style={{ fontWeight: 700 }}>Número de rondas</span>
              <div className="hp-opciones" style={{ marginTop: '.4rem' }}>
                {OPCIONES_RONDAS.map((r) => <button key={r} type="button" className={sala.config.rondas === r ? 'on' : ''} onClick={() => llamar('config', { rondas: r })}>{r} rondas</button>)}
              </div>
            </div>
          ) : <div className="panel hp-centro" style={{ marginTop: '1rem' }}><p className="hint" style={{ margin: 0 }}>Rondas: {sala.config.rondas}. Esperando al anfitrión…</p></div>}
          <div className="actions" style={{ marginTop: '1rem' }}>
            {esAdmin && <button className="big full" disabled={jugadores.length < AJUSTES.min} onClick={() => llamar('iniciar')}><Icon name="play" size={22} /> {jugadores.length < AJUSTES.min ? 'Esperando jugadores…' : '¡Empezar el congreso!'}</button>}
            <button className="secondary danger full" onClick={() => setModalSalir(true)}><Icon name="door" size={20} /> Salir de la sala</button>
          </div>
        </section>
      )}

      {vista === 'sala' && sala && sala.estado === 'jugando' && sala.vista && (
        sala.vista.fase !== 'fin' ? (
          <>
            <PantallaDeFase v={sala.vista} enviar={enviar} offset={offset} />
            <div className="actions">
              {esAdmin && <button type="button" className="secondary full" onClick={() => llamar('forzar')}><Icon name="forward" size={18} /> Forzar avance (si alguien está ausente)</button>}
              <button type="button" className="secondary danger full" onClick={() => setModalSalir(true)}><Icon name="door" size={20} /> Abandonar partida</button>
            </div>
          </>
        ) : (
          <PantallaFin v={sala.vista} puntosTotales={puntosTotales}>
            <Marcador />
            <div className="actions">
              {esAdmin ? (<>
                <button className="big full" disabled={jugadores.length < AJUSTES.min} onClick={() => llamar('siguiente-partida')}><Icon name="refresh" size={22} /> Otra partida</button>
                <button className="secondary danger full" onClick={() => llamar('finalizar')}><Icon name="trophy" size={20} /> Finalizar y ver podio</button>
              </>) : <p className="hint hp-centro">Esperando a que el anfitrión decida…</p>}
              <button className="secondary danger full" onClick={() => setModalSalir(true)}><Icon name="door" size={20} /> Salir de la sala</button>
            </div>
          </PantallaFin>
        )
      )}

      {vista === 'sala' && sala && sala.estado === 'final' && (
        <section className="game">
          <div className="end-card">
            <span className="end-icon"><Icon name="crown" size={44} /></span>
            <h1 className="title">Puntuaciones finales</h1>
            <p className="final-score">{ranking[0]?.puntos > 0 ? `Ganador: ${ranking.filter((j) => j.puntos === ranking[0].puntos).map((j) => j.nombre).join(' y ')}` : 'Sin ganador'}</p>
            <div className="scoreboard">
              {ranking.map((j, i) => (
                <div key={j.id} className={`score-row${i === 0 && j.puntos > 0 ? ' first' : ''}`}>
                  <span className="score-name">{i === 0 && j.puntos > 0 ? <Icon name="crown" size={22} /> : <span className="pos">{i + 1}</span>} {j.nombre}</span>
                  <span className="score-pts">{j.puntos} pts</span>
                </div>
              ))}
            </div>
          </div>
          <div className="actions" style={{ marginTop: '1.2rem' }}>
            {esAdmin && <button className="big full" onClick={() => llamar('reiniciar')}><Icon name="refresh" size={22} /> Volver a la sala de espera</button>}
            <button className="secondary danger full" onClick={() => setModalSalir(true)}><Icon name="door" size={20} /> Salir de la sala</button>
          </div>
        </section>
      )}

      {modalSalir && (
        <div className="hp-modal-fondo" onClick={() => setModalSalir(false)}>
          <div className="hp-modal" onClick={(e) => e.stopPropagation()}>
            <h3>¿Salir de la sala?</h3>
            <p>{sala?.estado === 'jugando' ? 'Si abandonas, tu hipótesis desaparece y la partida continúa sin ti.' : 'Abandonarás la sala de espera.'}</p>
            <div className="hp-modal-acciones">
              <button type="button" className="secondary full" onClick={() => setModalSalir(false)}>No, quedarme</button>
              <button type="button" className="secondary danger full" onClick={() => { setModalSalir(false); salir(); }}>Sí, salir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
