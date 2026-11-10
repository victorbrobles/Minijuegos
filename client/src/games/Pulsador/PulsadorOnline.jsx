// client/src/games/Pulsador/PulsadorOnline.jsx
// Menú online, sala de espera, partida y clasificación de los juegos de pulsador: cada uno con su móvil y su pulsador.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { PantallaJuego, PantallaResultado, PantallaFin, Avatar, ModalSalir } from './Vistas.jsx';
import ConfigJuego from './Config.jsx';
import {
  MenuModoOnline, FormCrearSala, FormUnirseSala, CabeceraSala, ListaSala, EsperandoAnfitrion, BloqueConfig
} from '../../components/MenuJuego.jsx';

export const claveSesion = (id) => `${id}_online_session`;

const leerSesion = (clave) => {
  try {
    return JSON.parse(sessionStorage.getItem(clave));
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

export default function PulsadorOnline({ juego, onVolver, onSalir, onAbrirAyuda }) {
  const CLAVE = claveSesion(juego.id);
  const API = `${juego.api}/online`;
  const [sesion, setSesion] = useState(() => leerSesion(CLAVE));
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
  const [t0, setT0] = useState(0);
  const tecleo = useRef({ t: 0, timer: null });
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
    try { sessionStorage.removeItem(CLAVE); } catch { /* nada */ }
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
      setT0(d.ahora);
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
      try { sessionStorage.setItem(CLAVE, JSON.stringify(nueva)); } catch { /* nada */ }
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
  const enviar = (tipo, datos = {}) => {
    if (tipo !== 'teclear') return llamar('accion', { tipo, ...datos });
    // Lo que escribe quien ha pulsado se manda como mucho cada 400 ms (y sin avisos si falla).
    const s = sesionRef.current;
    clearTimeout(tecleo.current.timer);
    const mandar = () => { tecleo.current.t = Date.now(); post(`${API}/sala/${s.code}/accion`, { token: s.token, tipo, ...datos }).catch(() => {}); };
    const espera = 400 - (Date.now() - tecleo.current.t);
    if (espera <= 0) mandar(); else tecleo.current.timer = setTimeout(mandar, espera);
    return undefined;
  };
  useEffect(() => () => clearTimeout(tecleo.current.timer), []);

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
      <div className={`pzp-contenedor ${juego.id}`}>
        {menu === 'menu' && (
          <MenuModoOnline onVolver={onVolver} onCrear={() => { setMenu('crear'); setErrorMenu(''); }} onUnirse={() => { setMenu('unirse'); setErrorMenu(''); }} onAyuda={onAbrirAyuda} error={errorMenu} />
        )}
        {menu === 'crear' && (
          <FormCrearSala onVolver={() => { setMenu('menu'); setErrorMenu(''); }} onAyuda={onAbrirAyuda} nombre={nombre} setNombre={setNombre}
            onCrear={() => entrar('crear', { nombre: nombre.trim() })} cargando={cargando} error={errorMenu}
            descripcion="Introduce tu nombre para abrir la sala y ser el anfitrión (de 2 a 15 jugadores, cada uno con su móvil y su pulsador)." />
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
      <div className={`pzp-contenedor ${juego.id}`}>
        <section className="game pzp-escena">
          <div className="pzp-tarjeta pzp-centro">
            <span className="pzp-carga" aria-hidden="true">{juego.emoji}</span>
            <p style={{ fontWeight: 800 }}>Conectando con la sala {sesion.code}…</p>
            <button type="button" className="pzp-boton secundario" onClick={() => salirDeSala(false)}>Cancelar</button>
          </div>
        </section>
      </div>
    );
  }

  const v = sala.vista;
  const Fin = juego.Fin || PantallaFin;
  const n = sala.jugadores.length;
  const enPartida = sala.estado !== 'lobby';
  const ranking = [...sala.jugadores].sort((a, b) => b.puntos - a.puntos);

  return (
    <div className={`pzp-contenedor ${juego.id} ${enPartida ? 'qq-en-partida' : ''}`}>
      {sinRed && <p className="pzp-sinred">⚠ Sin conexión con el servidor. Reintentando…</p>}
      {aviso && <p className="pzp-toast" role="alert" onClick={() => setAviso('')}>{aviso}</p>}

      {sala.estado === 'lobby' && (
        <section className="game qq-pantalla">
          <CabeceraSala codigo={sala.code} onVolver={() => setModal('lobby')} onAyuda={onAbrirAyuda} />
          <ListaSala
            jugadores={sala.jugadores} yoId={sala.yoId} max={sala.max} min={sala.min} anfitrionId={sala.anfitrionId}
            renderExtra={(j) => (
              <span className="pzp-sala-extra">
                <i className={`pzp-conexion${j.conectado ? '' : ' off'}`} title={j.conectado ? 'Conectado' : 'Sin conexión'} />
                {sala.esAdmin && j.id !== sala.anfitrionId && (
                  <button type="button" className="pzp-quitar" onClick={() => llamar('expulsar', { id: j.id })} aria-label={`Quitar a ${j.nombre}`}>Quitar</button>
                )}
              </span>
            )}
          />
          <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
            <h3 className="qq-sala-titulo"><Icon name="dice" size={20} /> La partida</h3>
            {(() => { const C = juego.Config || ConfigJuego; return <C juego={juego} sala={sala} config={sala.config} onCambiar={sala.esAdmin ? (c) => llamar('config', { ...sala.config, ...c }) : null} />; })()}
            <p className="pzp-nota-sala">{juego.notaSala ?? '🔴 Cada uno tiene su pulsador en el móvil: el primero que pulse, responde.'}</p>
            {sala.esAdmin && (
              <button type="button" className="big full qq-btn-principal" disabled={n < sala.min || sala.preparando} onClick={() => llamar('iniciar')}>
                <Icon name="play" size={22} /> {sala.preparando ? 'Preparando la partida…' : n < sala.min ? `Esperando jugadores (mínimo ${sala.min})…` : '¡Empezar partida!'}
              </button>
            )}
          </div>
          {!sala.esAdmin && <EsperandoAnfitrion texto="Cuando estéis todos, el anfitrión empezará la partida." />}
        </section>
      )}

      {sala.estado === 'jugando' && v && (
        <section className="game pzp-escena">
          {v.fase !== 'fin' && juego.Partida ? (
            <juego.Partida v={v} sala={sala} enviar={enviar} t0={t0} offset={offset} onSalir={() => setModal('partida')} />
          ) : v.fase === 'jugando' ? (
            <PantallaJuego key={v.ronda} v={v} juego={juego} t0={t0} offset={offset} enviar={enviar} onSalir={() => setModal('partida')} controles={sala.esAdmin} />
          ) : v.fase === 'resuelta' ? (
            <PantallaResultado v={v} juego={juego} onSalir={() => setModal('partida')}>
              <div className="pzp-barra estatica">
                {sala.esAdmin ? (
                  <>
                    <button type="button" className="pzp-boton grande" onClick={() => enviar('siguiente')}>
                      <Icon name="play" size={20} /> {v.ronda >= v.rondas ? 'Ver resultado final' : 'Siguiente ronda'}
                    </button>
                    {v.ronda < v.rondas && <button type="button" className="pzp-enlace" onClick={() => enviar('terminar')}><Icon name="flagFinish" size={15} /> Terminar la partida ya</button>}
                  </>
                ) : <p className="pzp-esperando">⏳ El anfitrión pasará a la siguiente ronda…</p>}
              </div>
            </PantallaResultado>
          ) : (
            <Fin v={v} juego={juego} onSalir={() => setModal('partida')}>
              <div className="pzp-barra estatica">
                {sala.esAdmin ? (
                  <>
                    <button type="button" className="pzp-boton grande" disabled={n < sala.min || sala.preparando} onClick={() => llamar('siguiente-partida')}>
                      <Icon name="refresh" size={20} /> Otra partida (mismos jugadores)
                    </button>
                    <button type="button" className="pzp-boton secundario" onClick={() => llamar('finalizar')}>
                      <Icon name="trophy" size={18} /> Terminar y ver la clasificación
                    </button>
                  </>
                ) : <p className="pzp-esperando">⏳ Esperando a que el anfitrión decida qué hacer…</p>}
              </div>
            </Fin>
          )}
        </section>
      )}

      {sala.estado === 'final' && (
        <section className="game pzp-escena">
          <header className="pzp-hero fin">
            <span className="pzp-hero-fondo" aria-hidden="true">{juego.emoji}</span>
            <div className="pzp-hero-top">
              <button type="button" className="pzp-salir" onClick={() => setModal('partida')}><Icon name="door" size={15} /> Salir</button>
              <div className="pzp-chips"><span className="pzp-chip">{sala.numPartida} {sala.numPartida === 1 ? 'partida' : 'partidas'}</span></div>
            </div>
            <p className="pzp-hero-etiqueta">Clasificación de la sala</p>
            <h1 className="pzp-hero-titulo">{ranking[0]?.puntos > 0 ? `¡Gana ${ranking.filter((j) => j.puntos === ranking[0].puntos).map((j) => j.nombre).join(' y ')}!` : 'Nadie ha puntuado'}</h1>
          </header>
          <div className="pzp-tarjeta">
            <p className="pzp-etiqueta">3 puntos por partida ganada</p>
            <ol className="pzp-ranking">
              {ranking.map((j, i) => (
                <li key={j.id} className={i === 0 && j.puntos > 0 ? 'lider' : ''}>
                  <span className="pzp-pos">{i + 1}</span><Avatar id={j.id} nombre={j.nombre} />
                  <span className="pzp-ranking-nombre">{j.nombre}{j.id === sala.yoId ? ' (tú)' : ''}</span>
                  <strong>{j.puntos}</strong>
                </li>
              ))}
            </ol>
          </div>
          <div className="pzp-barra estatica">
            {sala.esAdmin
              ? <button type="button" className="pzp-boton grande" onClick={() => llamar('reiniciar')}><Icon name="refresh" size={20} /> Volver a la sala de espera</button>
              : <p className="pzp-esperando">⏳ El anfitrión decidirá si jugáis otra vez</p>}
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
