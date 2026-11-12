// client/src/games/CuatroClubes/CuatroClubesOnline.jsx
// Menú online, sala de espera, partida y clasificación. El anfitrión hace de juez con los futbolistas que no conocemos.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { PantallaJuego, PantallaResultado, PantallaFin, Avatar, ModalSalir, SelectorRondas } from './Vistas.jsx';
import {
  MenuModoOnline, FormCrearSala, FormUnirseSala, CabeceraSala, ListaSala, EsperandoAnfitrion, BloqueConfig
} from '../../components/MenuJuego.jsx';
import './CuatroClubes.css';
import { limitesOnline, textoSala } from '../limites.js';

const LIM_ON = limitesOnline('cuatroclubes');

export const CLAVE_SESION_CUATROCLUBES = 'cuatroclubes_online_session';
const API = '/api/cuatroclubes/online';

const leerSesion = () => {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_SESION_CUATROCLUBES));
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

export default function CuatroClubesOnline({ onVolver, onSalir, onAbrirAyuda }) {
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
    try { sessionStorage.removeItem(CLAVE_SESION_CUATROCLUBES); } catch { /* nada */ }
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
      try { sessionStorage.setItem(CLAVE_SESION_CUATROCLUBES, JSON.stringify(nueva)); } catch { /* nada */ }
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
      <div className="c4p-contenedor">
        {menu === 'menu' && (
          <MenuModoOnline onVolver={onVolver} onCrear={() => { setMenu('crear'); setErrorMenu(''); }} onUnirse={() => { setMenu('unirse'); setErrorMenu(''); }} onAyuda={onAbrirAyuda} error={errorMenu} />
        )}
        {menu === 'crear' && (
          <FormCrearSala onVolver={() => { setMenu('menu'); setErrorMenu(''); }} onAyuda={onAbrirAyuda} nombre={nombre} setNombre={setNombre}
            onCrear={() => entrar('crear', { nombre: nombre.trim() })} cargando={cargando} error={errorMenu}
            descripcion={`Introduce tu nombre para abrir la sala y ser el anfitrión (${textoSala('cuatroclubes')}, cada uno con su móvil).`} />
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
      <div className="c4p-contenedor">
        <section className="game c4p-escena">
          <div className="c4p-tarjeta c4p-centro">
            <span className="c4p-carga" aria-hidden="true">🛡️</span>
            <p style={{ fontWeight: 800 }}>Conectando con la sala {sesion.code}…</p>
            <button type="button" className="c4p-boton secundario" onClick={() => salirDeSala(false)}>Cancelar</button>
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
    <div className={`c4p-contenedor ${enPartida ? 'qq-en-partida' : ''}`}>
      {sinRed && <p className="c4p-sinred">⚠ Sin conexión con el servidor. Reintentando…</p>}
      {aviso && <p className="c4p-toast" role="alert" onClick={() => setAviso('')}>{aviso}</p>}

      {sala.estado === 'lobby' && (
        <section className="game qq-pantalla">
          <CabeceraSala codigo={sala.code} onVolver={() => setModal('lobby')} onAyuda={onAbrirAyuda} />
          <ListaSala
            jugadores={sala.jugadores} yoId={sala.yoId} max={sala.max} min={sala.min} anfitrionId={sala.anfitrionId}
            renderExtra={(j) => (
              <span className="c4p-sala-extra">
                <i className={`c4p-conexion${j.conectado ? '' : ' off'}`} title={j.conectado ? 'Conectado' : 'Sin conexión'} />
                {sala.esAdmin && j.id !== sala.anfitrionId && (
                  <button type="button" className="c4p-quitar" onClick={() => llamar('expulsar', { id: j.id })} aria-label={`Quitar a ${j.nombre}`}>Quitar</button>
                )}
              </span>
            )}
          />
          <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
            <h3 className="qq-sala-titulo"><Icon name="dice" size={20} /> La partida</h3>
            <BloqueConfig titulo="Número de rondas">
              <SelectorRondas valor={sala.config.rondas} onCambiar={sala.esAdmin ? (n) => llamar('config', { rondas: n }) : null} />
            </BloqueConfig>
            <p className="c4p-nota-juez">👑 El anfitrión hace de juez con los futbolistas que no estén en nuestra base.</p>
            {sala.esAdmin && (
              <button type="button" className="big full qq-btn-principal" disabled={n < sala.min} onClick={() => llamar('iniciar')}>
                <Icon name="play" size={22} /> {n < sala.min ? `Esperando jugadores (mínimo ${sala.min})…` : '¡Empezar partida!'}
              </button>
            )}
          </div>
          {!sala.esAdmin && <EsperandoAnfitrion texto="Cuando estéis todos, el anfitrión empezará la partida." />}
        </section>
      )}

      {sala.estado === 'jugando' && v && (
        <section className="game c4p-escena">
          {v.fase === 'jugando' ? (
            <PantallaJuego v={v} enviar={enviar} offset={offset} onSalir={() => setModal('partida')} miTurno={v.turno === sala.yoId}
              admin={{ esAdmin: sala.esAdmin, onForzar: () => llamar('forzar'), atascado: !v.revision && !sala.jugadores.find((j) => j.id === v.turno)?.conectado }} />
          ) : v.fase === 'resuelta' ? (
            <PantallaResultado v={v} onSalir={() => setModal('partida')}>
              <div className="c4p-barra estatica">
                {sala.esAdmin ? (
                  <>
                    <button type="button" className="c4p-boton grande" onClick={() => enviar('siguiente')}>
                      <Icon name="play" size={20} /> {v.ronda >= v.rondas ? 'Ver resultado final' : 'Siguientes cuatro clubes'}
                    </button>
                    {v.ronda < v.rondas && <button type="button" className="c4p-enlace" onClick={() => enviar('terminar')}><Icon name="flagFinish" size={15} /> Terminar la partida ya</button>}
                  </>
                ) : <p className="c4p-esperando">⏳ El anfitrión pasará a los siguientes clubes…</p>}
              </div>
            </PantallaResultado>
          ) : (
            <PantallaFin v={v} onSalir={() => setModal('partida')}>
              <div className="c4p-barra estatica">
                {sala.esAdmin ? (
                  <>
                    <button type="button" className="c4p-boton grande" disabled={n < sala.min} onClick={() => llamar('siguiente-partida')}>
                      <Icon name="refresh" size={20} /> Otra partida (mismos jugadores)
                    </button>
                    <button type="button" className="c4p-boton secundario" onClick={() => llamar('finalizar')}>
                      <Icon name="trophy" size={18} /> Terminar y ver la clasificación
                    </button>
                  </>
                ) : <p className="c4p-esperando">⏳ Esperando a que el anfitrión decida qué hacer…</p>}
              </div>
            </PantallaFin>
          )}
        </section>
      )}

      {sala.estado === 'final' && (
        <section className="game c4p-escena">
          <header className="c4p-hero fin">
            <span className="c4p-cuatro-fondo" aria-hidden="true">4</span>
            <div className="c4p-hero-top">
              <button type="button" className="c4p-salir" onClick={() => setModal('partida')}><Icon name="door" size={15} /> Salir</button>
              <div className="c4p-chips"><span className="c4p-chip">{sala.numPartida} {sala.numPartida === 1 ? 'partida' : 'partidas'}</span></div>
            </div>
            <p className="c4p-hero-etiqueta">Clasificación de la sala</p>
            <h1 className="c4p-hero-titulo">{ranking[0]?.puntos > 0 ? `¡Gana ${ranking.filter((j) => j.puntos === ranking[0].puntos).map((j) => j.nombre).join(' y ')}!` : 'Nadie ha puntuado'}</h1>
          </header>
          <div className="c4p-tarjeta">
            <p className="c4p-etiqueta">3 puntos por partida ganada</p>
            <ol className="c4p-ranking">
              {ranking.map((j, i) => (
                <li key={j.id} className={i === 0 && j.puntos > 0 ? 'lider' : ''}>
                  <span className="c4p-pos">{i + 1}</span><Avatar id={j.id} nombre={j.nombre} />
                  <span className="c4p-ranking-nombre">{j.nombre}{j.id === sala.yoId ? ' (tú)' : ''}</span>
                  <strong>{j.puntos}</strong>
                </li>
              ))}
            </ol>
          </div>
          <div className="c4p-barra estatica">
            {sala.esAdmin
              ? <button type="button" className="c4p-boton grande" onClick={() => llamar('reiniciar')}><Icon name="refresh" size={20} /> Volver a la sala de espera</button>
              : <p className="c4p-esperando">⏳ El anfitrión decidirá si jugáis otra vez</p>}
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
