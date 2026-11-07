// client/src/games/Hipotesis/HipotesisOnline.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import { PantallaDeFase, PantallaFin, Ayuda } from './Vistas.jsx';
import { AJUSTES, OPCIONES_RONDAS } from './engine.js';
import './Hipotesis.css';
import { MenuInicioJuego, MenuModoOnline, FormCrearSala, FormUnirseSala, CabeceraSala, ListaSala, EsperandoAnfitrion } from '../../components/MenuJuego.jsx';

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
    setSesion(null); setSala(null); setVista('online_menu');
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
      {modalAyuda && <Ayuda onCerrar={() => setModalAyuda(false)} />}
      {errorMsg && vista === 'sala' && <p className="error">{errorMsg}</p>}

      {vista === 'menu' && (
        <MenuInicioJuego
          juegoId="hipotesis"
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

      {vista === 'crear' && (
        <FormCrearSala
          onVolver={() => { setVista('online_menu'); setErrorMsg(''); }}
          onAyuda={() => setModalAyuda(true)}
          nombre={nombre}
          setNombre={setNombre}
          onCrear={() => entrar('crear', { nombre: nombre.trim() })}
          cargando={cargando}
          error={errorMsg}
          descripcion="Introduce tu nombre para abrir la sala y ser el anfitrión (de 3 a 8 jugadores)."
        />
      )}

      {vista === 'unirse' && (
        <FormUnirseSala
          onVolver={() => { setVista('online_menu'); setErrorMsg(''); }}
          onAyuda={() => setModalAyuda(true)}
          codigo={codigoInput}
          setCodigo={setCodigoInput}
          nombre={nombre}
          setNombre={setNombre}
          onUnirse={() => entrar('unirse', { code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })}
          cargando={cargando}
          error={errorMsg}
        />
      )}

      {vista === 'sala' && sala && sala.estado === 'lobby' && (
        <section className="game qq-pantalla">
          <CabeceraSala codigo={sala.code} onVolver={() => setModalSalir(true)} onAyuda={() => setModalAyuda(true)} />
          <ListaSala
            jugadores={jugadores}
            yoId={sala.yoId}
            max={AJUSTES.max}
            min={AJUSTES.min}
            renderExtra={(j) => <span className={`hp-punto ${j.conectado ? '' : 'off'}`} title={j.conectado ? 'Conectado' : 'Desconectado'} />}
          />
          {esAdmin ? (
            <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
              <h3 className="qq-sala-titulo"><Icon name="settings" size={20} /> Ajustes</h3>
              <span className="qq-label-destacado" style={{ marginTop: '0.6rem' }}>Número de rondas</span>
              <div className="qq-chips">
                {OPCIONES_RONDAS.map((r) => (
                  <button key={r} type="button" className={`qq-chip ${sala.config.rondas === r ? 'activo' : ''}`} onClick={() => llamar('config', { rondas: r })}>
                    {r} rondas
                  </button>
                ))}
              </div>
              <button type="button" className="big full qq-btn-principal" style={{ marginTop: '1.4rem' }} disabled={jugadores.length < AJUSTES.min} onClick={() => llamar('iniciar')}>
                <Icon name="play" size={22} /> {jugadores.length < AJUSTES.min ? 'Esperando jugadores…' : '¡Empezar el congreso!'}
              </button>
            </div>
          ) : (
            <EsperandoAnfitrion texto={`Rondas: ${sala.config.rondas}. El anfitrión comenzará la partida cuando estéis todos listos.`} />
          )}
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
