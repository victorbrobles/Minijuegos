// client/src/games/Golpe/GolpeOnline.jsx
// Menú online, sala de espera, partida y clasificación (el servidor guarda el estado; cada móvil ve solo lo suyo).
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { PantallaJuego, PantallaFin, Avatar } from './Vistas.jsx';
import { OPCIONES_MISIONES } from './engine.js';
import {
  MenuInicioJuego, FormCrearSala, FormUnirseSala, CabeceraSala, ListaSala, EsperandoAnfitrion, BloqueConfig
} from '../../components/MenuJuego.jsx';
import './Golpe.css';
import { limitesOnline, textoSala } from '../limites.js';

const LIM_ON = limitesOnline('golpe');

export const CLAVE_SESION_GOLPE = 'golpe_online_session';
const API = '/api/golpe/online';

const leerSesion = () => {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_SESION_GOLPE));
  } catch {
    return null;
  }
};

const post = async (url, body) => {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Algo ha fallado.');
  return data;
};

export function ModalSalir({ titulo, texto, onSeguir, onSalir }) {
  return (
    <div className="rg-modal-fondo" onClick={onSeguir}>
      <div className="rg-modal gpp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gpp-modal-icono">🚪</div>
        <h3>{titulo}</h3>
        <p className="hint">{texto}</p>
        <div className="gpp-dos">
          <button type="button" className="gpp-boton secundario" onClick={onSeguir}>Seguir</button>
          <button type="button" className="gpp-boton peligro" onClick={onSalir}>Salir</button>
        </div>
      </div>
    </div>
  );
}

export default function GolpeOnline({ onVolver, onSalir, onAbrirAyuda }) {
  const [sesion, setSesion] = useState(leerSesion);
  const [menu, setMenu] = useState('menu');
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [errorMenu, setErrorMenu] = useState('');
  const [cargando, setCargando] = useState(false);
  const [sala, setSala] = useState(null);
  const [modal, setModal] = useState(null);
  const [aviso, setAviso] = useState('');
  const [sinRed, setSinRed] = useState(false);
  const [offset, setOffset] = useState(0);
  const sesionRef = useRef(sesion);
  sesionRef.current = sesion;
  const fallos = useRef(0);
  const pedidas = useRef(0);
  const aplicada = useRef(0);
  const avisoTimer = useRef(null);

  const mostrarAviso = (t) => {
    setAviso(t);
    clearTimeout(avisoTimer.current);
    avisoTimer.current = setTimeout(() => setAviso(''), 3500);
  };
  useEffect(() => () => clearTimeout(avisoTimer.current), []);

  const cerrarSesion = (mensaje = '') => {
    try { sessionStorage.removeItem(CLAVE_SESION_GOLPE); } catch { /* nada */ }
    setSesion(null); setSala(null); setModal(null); setMenu('menu'); setErrorMenu(mensaje);
  };

  const consultar = async () => {
    const s = sesionRef.current;
    if (!s) return;
    const n = ++pedidas.current;
    try {
      const r = await fetch(`${API}/sala/${s.code}?token=${encodeURIComponent(s.token)}`);
      if (sesionRef.current !== s) return;
      if (r.status === 403 || r.status === 404) {
        cerrarSesion(r.status === 403 ? 'Ya no formas parte de esa sala.' : 'La sala se ha cerrado.');
        return;
      }
      if (!r.ok) throw new Error('error');
      const d = await r.json();
      fallos.current = 0;
      setSinRed(false);
      if (n < aplicada.current) return;
      aplicada.current = n;
      if (d.ahora) setOffset(d.ahora - Date.now());
      setSala(d);
    } catch {
      fallos.current += 1;
      if (fallos.current >= 3) setSinRed(true);
      if (fallos.current >= 40) cerrarSesion('Se ha perdido la conexión con la sala.');
    }
  };

  useEffect(() => {
    if (!sesion) return undefined;
    consultar();
    const i = setInterval(consultar, 600);
    return () => clearInterval(i);
  }, [sesion]); // eslint-disable-line react-hooks/exhaustive-deps

  const entrar = async (ruta, cuerpo) => {
    setErrorMenu(''); setCargando(true);
    try {
      const d = await post(`${API}/${ruta}`, cuerpo);
      const nueva = { code: d.code, token: d.token };
      try { sessionStorage.setItem(CLAVE_SESION_GOLPE, JSON.stringify(nueva)); } catch { /* nada */ }
      pedidas.current = 0; aplicada.current = 0;
      setSesion(nueva);
    } catch (e) {
      setErrorMenu(e.message);
    } finally {
      setCargando(false);
    }
  };

  const llamar = async (ruta, cuerpo = {}) => {
    const s = sesionRef.current;
    if (!s) return;
    try {
      await post(`${API}/sala/${s.code}/${ruta}`, { token: s.token, ...cuerpo });
      await consultar();
    } catch (e) {
      mostrarAviso(e.message);
    }
  };
  const enviar = (tipo, datos = {}) => llamar('accion', { tipo, ...datos });

  const salirDeSala = (aPortada) => {
    const s = sesionRef.current;
    if (s?.code && s?.token) {
      fetch(`${API}/sala/${s.code}/salir`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: s.token }), keepalive: true }).catch(() => {});
    }
    cerrarSesion('');
    if (aPortada) onSalir?.();
  };

  if (!sesion) {
    return (
      <div className="gpp-contenedor">
        {menu === 'menu' && (
          <MenuInicioJuego juegoId="golpe" onCrear={() => { setMenu('crear'); setErrorMenu(''); }} onUnirse={() => { setMenu('unirse'); setErrorMenu(''); }} onAyuda={onAbrirAyuda} error={errorMenu} />
        )}
        {menu === 'crear' && (
          <FormCrearSala onVolver={() => { setMenu('menu'); setErrorMenu(''); }} onAyuda={onAbrirAyuda} nombre={nombre} setNombre={setNombre}
            onCrear={() => entrar('crear', { nombre: nombre.trim() })} cargando={cargando} error={errorMenu}
            descripcion={`Introduce tu nombre para abrir la sala y ser el anfitrión (${textoSala('golpe')}, cada uno con su móvil).`} />
        )}
        {menu === 'unirse' && (
          <FormUnirseSala onVolver={() => { setMenu('menu'); setErrorMenu(''); }} onAyuda={onAbrirAyuda} codigo={codigo} setCodigo={setCodigo}
            nombre={nombre} setNombre={setNombre} onUnirse={() => entrar('unirse', { code: codigo.trim().toUpperCase(), nombre: nombre.trim() })}
            cargando={cargando} error={errorMenu} />
        )}
      </div>
    );
  }

  if (!sala) {
    return (
      <div className="gpp-contenedor">
        <section className="game gpp-escena">
          <div className="gpp-tarjeta gpp-centro">
            <span className="gpp-carga" aria-hidden="true">💼</span>
            <p style={{ fontWeight: 800 }}>Conectando con la sala {sesion.code}…</p>
            <button type="button" className="gpp-boton secundario" onClick={() => salirDeSala(false)}>Cancelar</button>
          </div>
        </section>
      </div>
    );
  }

  const v = sala.vista;
  const n = sala.jugadores.length;
  const enPartida = sala.estado !== 'lobby';
  const ranking = [...sala.jugadores].sort((a, b) => b.puntos - a.puntos);

  return (
    <div className={`gpp-contenedor ${enPartida ? 'qq-en-partida' : ''}`}>
      {sinRed && <p className="gpp-sinred">⚠ Sin conexión con el servidor. Reintentando…</p>}
      {aviso && <p className="gpp-toast" role="alert" onClick={() => setAviso('')}>{aviso}</p>}

      {sala.estado === 'lobby' && (
        <section className="game qq-pantalla">
          <CabeceraSala codigo={sala.code} onVolver={() => setModal('lobby')} onAyuda={onAbrirAyuda} />
          <ListaSala
            jugadores={sala.jugadores} yoId={sala.yoId} max={sala.max} min={sala.min} anfitrionId={sala.anfitrionId}
            renderExtra={(j) => (
              <span className="gpp-sala-extra">
                <i className={`gpp-conexion${j.conectado ? '' : ' off'}`} title={j.conectado ? 'Conectado' : 'Sin conexión'} />
                {sala.esAdmin && j.id !== sala.anfitrionId && (
                  <button type="button" className="gpp-quitar" onClick={() => llamar('expulsar', { id: j.id })} aria-label={`Quitar a ${j.nombre}`}>Quitar</button>
                )}
              </span>
            )}
          />
          <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
            <h3 className="qq-sala-titulo"><Icon name="scale" size={20} /> La partida</h3>
            <BloqueConfig titulo="Número de misiones">
              <div className="gpp-pildoras">
                {OPCIONES_MISIONES.map((n) => (
                  <button key={n} type="button" className={`gpp-pildora${sala.config.misiones === n ? ' activo' : ''}`} disabled={!sala.esAdmin} onClick={() => llamar('config', { misiones: n })}>{n} misiones</button>
                ))}
              </div>
            </BloqueConfig>
            {sala.esAdmin && (
              <button type="button" className="big full qq-btn-principal" disabled={n < sala.min} onClick={() => llamar('iniciar')}>
                <Icon name="play" size={22} /> {n < sala.min ? `Esperando jugadores (mínimo ${sala.min})…` : '¡Que empiece el golpe!'}
              </button>
            )}
          </div>
          {!sala.esAdmin && <EsperandoAnfitrion texto="Cuando estéis todos, el anfitrión empezará la partida." />}
        </section>
      )}

      {sala.estado === 'jugando' && v && (
        <section className="game gpp-escena">
          {v.fase !== 'fin' ? (
            <PantallaJuego v={v} enviar={enviar} offset={offset} onSalir={() => setModal('partida')} admin={{ esAdmin: sala.esAdmin, onForzar: () => llamar('forzar') }} />
          ) : (
            <PantallaFin v={v} onSalir={() => setModal('partida')}>
              <div className="gpp-barra estatica">
                {sala.esAdmin ? (
                  <>
                    <button type="button" className="gpp-boton grande" disabled={n < sala.min} onClick={() => llamar('siguiente-partida')}>
                      <Icon name="refresh" size={20} /> Otra partida (mismos jugadores)
                    </button>
                    <button type="button" className="gpp-boton secundario" onClick={() => llamar('finalizar')}>
                      <Icon name="trophy" size={18} /> Terminar y ver la clasificación
                    </button>
                  </>
                ) : <p className="gpp-esperando">⏳ Esperando a que el anfitrión decida qué hacer…</p>}
              </div>
            </PantallaFin>
          )}
        </section>
      )}

      {sala.estado === 'final' && (
        <section className="game gpp-escena">
          <header className="gpp-hero fin">
            <span className="gpp-plano" aria-hidden="true" />
            <div className="gpp-hero-top">
              <button type="button" className="gpp-salir" onClick={() => setModal('partida')}><Icon name="door" size={15} /> Salir</button>
              <div className="gpp-chips"><span className="gpp-chip">{sala.numPartida} {sala.numPartida === 1 ? 'partida' : 'partidas'}</span></div>
            </div>
            <p className="gpp-hero-etiqueta">Clasificación de la sala</p>
            <h1 className="gpp-hero-titulo">{ranking[0]?.puntos > 0 ? `¡Gana ${ranking.filter((j) => j.puntos === ranking[0].puntos).map((j) => j.nombre).join(' y ')}!` : 'Nadie ha puntuado'}</h1>
          </header>
          <div className="gpp-tarjeta">
            <p className="gpp-etiqueta">3 puntos por partida ganada</p>
            <ol className="gpp-ranking">
              {ranking.map((j, i) => (
                <li key={j.id} className={i === 0 && j.puntos > 0 ? 'lider' : ''}>
                  <span className="gpp-pos">{i + 1}</span><Avatar id={j.id} nombre={j.nombre} />
                  <span className="gpp-ranking-nombre">{j.nombre}{j.id === sala.yoId ? ' (tú)' : ''}</span>
                  <strong>{j.puntos}</strong>
                </li>
              ))}
            </ol>
          </div>
          <div className="gpp-barra estatica">
            {sala.esAdmin
              ? <button type="button" className="gpp-boton grande" onClick={() => llamar('reiniciar')}><Icon name="refresh" size={20} /> Volver a la sala de espera</button>
              : <p className="gpp-esperando">⏳ El anfitrión decidirá si jugáis otra vez</p>}
          </div>
        </section>
      )}

      {modal === 'lobby' && (
        <ModalSalir titulo="¿Salir de la sala?"
          texto={sala.esAdmin ? 'Eres el anfitrión: si sales, otro jugador pasará a serlo (si no queda nadie, la sala se cerrará).' : 'Abandonarás la sala de espera y volverás al menú.'}
          onSeguir={() => setModal(null)} onSalir={() => salirDeSala(false)} />
      )}
      {modal === 'partida' && (
        <ModalSalir titulo="¿Salir de la partida?"
          texto={`${sala.estado === 'jugando' && v?.fase !== 'fin' ? 'Abandonarás la partida y quedarás fuera de la clasificación. ' : ''}${sala.esAdmin ? 'Otro jugador pasará a ser el anfitrión.' : 'Volverás a la portada.'}`}
          onSeguir={() => setModal(null)} onSalir={() => salirDeSala(true)} />
      )}
    </div>
  );
}
