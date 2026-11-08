// client/src/games/Traiciones/TraicionesOnline.jsx
// Menús, sala de espera y partida online de Traiciones (el servidor es la única fuente de verdad).
import React, { useState, useEffect, useRef } from 'react';
import Icon from './IconoT.jsx';
import { OPCIONES_DEBATE, numTraidores } from './engine.js';
import { PantallaDeFase, PantallaFin, Avatar } from './Vistas.jsx';
import {
  MenuInicioJuego, FormCrearSala, FormUnirseSala, CabeceraSala, ListaSala, EsperandoAnfitrion, BloqueConfig
} from '../../components/MenuJuego.jsx';
import './Traiciones.css';

export const CLAVE_SESION_TRAICIONES = 'traiciones_online_session';
const API = '/api/traiciones/online';
const MIN = 4;
const MAX = 12;

const leerSesion = () => {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_SESION_TRAICIONES));
  } catch {
    return null;
  }
};

const post = async (url, body, opciones = {}) => {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), ...opciones });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Algo ha fallado.');
  return data;
};

/** Qué papeles habrá con `n` jugadores (lo mismo que reparte el motor). */
function composicion(n, especiales) {
  const t = numTraidores(Math.max(n, MIN));
  const extra = [];
  if (especiales) {
    if (n >= 5) extra.push('Vigía');
    if (n >= 6) extra.push('Protegido');
    if (n >= 7) extra.push('Bufón');
  }
  return `${t} ${t === 1 ? 'traidor' : 'traidores'}${extra.length ? ` · ${extra.join(', ')}` : ''}`;
}

function ModalSalir({ titulo, texto, onSeguir, onSalir }) {
  return (
    <div className="rg-modal-fondo" onClick={onSeguir}>
      <div className="rg-modal trp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="trp-modal-icono">🚪</div>
        <h3>{titulo}</h3>
        <p className="hint">{texto}</p>
        <div className="trp-fila">
          <button type="button" className="trp-boton secundario" onClick={onSeguir}>Seguir</button>
          <button type="button" className="trp-boton peligro" onClick={onSalir}>Salir</button>
        </div>
      </div>
    </div>
  );
}

function Lobby({ sala, llamar, onSalir, onAbrirAyuda }) {
  const n = sala.jugadores.length;
  const cfg = sala.config;
  const anfitrionId = sala.anfitrionId;
  return (
    <section className="game qq-pantalla">
      <CabeceraSala codigo={sala.code} onVolver={onSalir} onAyuda={onAbrirAyuda} />
      <ListaSala
        jugadores={sala.jugadores}
        yoId={sala.yoId}
        max={MAX}
        min={MIN}
        anfitrionId={anfitrionId}
        renderExtra={(j) => (
          <span className="tr-sala-extra">
            <i className={`tr-conexion${j.conectado ? '' : ' off'}`} title={j.conectado ? 'Conectado' : 'Sin conexión'} />
            {sala.esAdmin && j.id !== anfitrionId && (
              <button type="button" className="tr-quitar" onClick={() => llamar('expulsar', { id: j.id })} aria-label={`Quitar a ${j.nombre}`}>Quitar</button>
            )}
          </span>
        )}
      >
        {n >= MIN && <p className="hint ok" style={{ marginTop: '0.8rem' }}>¡Ya podéis jugar! Con {n}: {composicion(n, cfg.rolesEspeciales)}.</p>}
      </ListaSala>

      {sala.esAdmin ? (
        <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
          <h3 className="qq-sala-titulo"><Icon name="settings" size={20} /> Ajustes de la partida</h3>
          <BloqueConfig titulo="Papeles especiales">
            <div className="trp-pildoras">
              <button type="button" className={`trp-pildora${cfg.rolesEspeciales ? ' activo' : ''}`} onClick={() => llamar('config', { rolesEspeciales: true })}>Vigía, Protegido y Bufón</button>
              <button type="button" className={`trp-pildora${!cfg.rolesEspeciales ? ' activo' : ''}`} onClick={() => llamar('config', { rolesEspeciales: false })}>Solo viajeros y traidores</button>
            </div>
          </BloqueConfig>
          <BloqueConfig titulo="Tiempo de debate en las asambleas">
            <div className="trp-pildoras">
              {OPCIONES_DEBATE.map((s) => (
                <button key={s} type="button" className={`trp-pildora${cfg.segDebate === s ? ' activo' : ''}`} onClick={() => llamar('config', { segDebate: s })}>
                  {s === 0 ? 'Sin límite' : `${s} s`}
                </button>
              ))}
            </div>
          </BloqueConfig>
          <button type="button" className="big full qq-btn-principal" disabled={n < MIN} onClick={() => llamar('iniciar')}>
            <Icon name="play" size={22} /> {n < MIN ? `Esperando jugadores (mínimo ${MIN})…` : '¡Repartir papeles y empezar!'}
          </button>
        </div>
      ) : (
        <EsperandoAnfitrion texto="Cuando estéis todos, el anfitrión repartirá los papeles en secreto.">
          <div className="tr-config-resumen">
            <span><Icon name="mask" size={15} /> {cfg.rolesEspeciales ? 'Con papeles especiales' : 'Solo viajeros y traidores'}</span>
            <span><Icon name="clock" size={15} /> Debate: {cfg.segDebate === 0 ? 'sin límite' : `${cfg.segDebate} s`}</span>
          </div>
        </EsperandoAnfitrion>
      )}
    </section>
  );
}

function Podio({ sala, llamar, onSalir }) {
  const ranking = [...sala.jugadores].sort((a, b) => b.puntos - a.puntos);
  const max = ranking[0]?.puntos ?? 0;
  const ganadores = ranking.filter((j) => j.puntos === max && max > 0);
  return (
    <section className="game trp-escena">
      <header className="trp-hero fin podio">
        <span className="trp-sol" aria-hidden="true" />
        <span className="trp-dunas" aria-hidden="true" />
        <div className="trp-hero-top">
          <button type="button" className="trp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
          <div className="trp-chips"><span className="trp-chip"><Icon name="flag" size={14} /> {sala.numPartida} {sala.numPartida === 1 ? 'partida' : 'partidas'}</span></div>
        </div>
        <p className="trp-hero-etiqueta">Fin del viaje</p>
        <h1 className="trp-hero-titulo">
          {ganadores.length === 0 ? 'Nadie ha puntuado' : ganadores.length > 1 ? `Empate: ${ganadores.map((g) => g.nombre).join(' y ')}` : `¡Gana ${ganadores[0].nombre}!`}
        </h1>
      </header>
      <div className="trp-tarjeta">
        <p className="trp-etiqueta"><Icon name="trophy" size={14} /> Clasificación final</p>
        <ol className="tr-ranking">
          {ranking.map((j, i) => (
            <li key={j.id} className={j.puntos === max && max > 0 ? 'lider' : ''}>
              <span className="tr-pos">{i + 1}</span>
              <Avatar id={j.id} nombre={j.nombre} />
              <span className="tr-ranking-nombre">{j.nombre}{j.id === sala.yoId ? ' (tú)' : ''}</span>
              <strong>{j.puntos} pts</strong>
            </li>
          ))}
        </ol>
      </div>
      <div className="trp-barra">
        {sala.esAdmin
          ? <button type="button" className="trp-boton grande" onClick={() => llamar('reiniciar')}><Icon name="refresh" size={22} /> Volver a la sala de espera</button>
          : <p className="trp-esperando"><strong><Icon name="hourglass" size={16} /> El anfitrión decidirá si jugáis otra vez</strong></p>}
      </div>
    </section>
  );
}

export default function TraicionesOnline({ onSalir, onAbrirAyuda }) {
  const [sesion, setSesion] = useState(leerSesion);
  const [menu, setMenu] = useState('menu'); // 'menu' | 'crear' | 'unirse'
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [errorMenu, setErrorMenu] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modal, setModal] = useState(null); // null | 'lobby' | 'partida'
  const [sala, setSala] = useState(null);
  const [offset, setOffset] = useState(0);
  const [aviso, setAviso] = useState('');
  const [sinRed, setSinRed] = useState(false);
  const fallos = useRef(0);
  const pedidas = useRef(0);
  const aplicada = useRef(0);
  const sesionRef = useRef(sesion);
  sesionRef.current = sesion;
  const avisoTimer = useRef(null);

  const mostrarAviso = (texto) => {
    setAviso(texto);
    clearTimeout(avisoTimer.current);
    avisoTimer.current = setTimeout(() => setAviso(''), 3500);
  };
  useEffect(() => () => clearTimeout(avisoTimer.current), []);

  const cerrarSesion = (mensaje) => {
    try { sessionStorage.removeItem(CLAVE_SESION_TRAICIONES); } catch { /* nada */ }
    setSesion(null);
    setSala(null);
    setModal(null);
    setMenu('menu');
    setErrorMenu(mensaje || '');
  };

  // Las respuestas pueden llegar desordenadas (sondeo + acciones): solo se aplica la más reciente.
  const consultar = async () => {
    const s = sesionRef.current;
    if (!s) return;
    const n = ++pedidas.current;
    try {
      const r = await fetch(`${API}/sala/${s.code}?token=${encodeURIComponent(s.token)}`);
      if (sesionRef.current !== s) return;
      if (r.status === 403 || r.status === 404) {
        const d = await r.json().catch(() => ({}));
        cerrarSesion(d.error === 'No perteneces a esta sala.' ? 'Ya no formas parte de esa sala (el anfitrión te ha quitado o has salido).' : 'La sala se ha cerrado o ya no formas parte de ella.');
        return;
      }
      if (!r.ok) throw new Error('error');
      const d = await r.json();
      fallos.current = 0;
      setSinRed(false);
      if (n < aplicada.current) return;
      aplicada.current = n;
      setOffset(d.ahora - Date.now());
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
    const i = setInterval(consultar, 500);
    return () => clearInterval(i);
  }, [sesion]); // eslint-disable-line react-hooks/exhaustive-deps

  const entrar = async (ruta, cuerpo) => {
    setErrorMenu('');
    setCargando(true);
    try {
      const d = await post(`${API}/${ruta}`, cuerpo);
      const nueva = { code: d.code, token: d.token };
      try { sessionStorage.setItem(CLAVE_SESION_TRAICIONES, JSON.stringify(nueva)); } catch { /* nada */ }
      pedidas.current = 0;
      aplicada.current = 0;
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
      fetch(`${API}/sala/${s.code}/salir`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: s.token }), keepalive: true
      }).catch(() => {});
    }
    cerrarSesion('');
    if (aPortada) onSalir?.();
  };

  // ---------------------------------------------------------------- Sin sala: menús
  if (!sesion) {
    return (
      <div className="tr-contenedor">
        {menu === 'menu' && (
          <MenuInicioJuego
            juegoId="traiciones"
            onCrear={() => { setMenu('crear'); setErrorMenu(''); }}
            onUnirse={() => { setMenu('unirse'); setErrorMenu(''); }}
            onAyuda={onAbrirAyuda}
            error={errorMenu}
          />
        )}
        {menu === 'crear' && (
          <FormCrearSala
            onVolver={() => { setMenu('menu'); setErrorMenu(''); }}
            onAyuda={onAbrirAyuda}
            nombre={nombre}
            setNombre={setNombre}
            onCrear={() => entrar('crear', { nombre: nombre.trim() })}
            cargando={cargando}
            error={errorMenu}
            descripcion={`Introduce tu nombre para abrir la sala y ser el anfitrión. Cada jugador necesita su móvil (de ${MIN} a ${MAX} jugadores).`}
          />
        )}
        {menu === 'unirse' && (
          <FormUnirseSala
            onVolver={() => { setMenu('menu'); setErrorMenu(''); }}
            onAyuda={onAbrirAyuda}
            codigo={codigo}
            setCodigo={setCodigo}
            nombre={nombre}
            setNombre={setNombre}
            onUnirse={() => entrar('unirse', { code: codigo.trim().toUpperCase(), nombre: nombre.trim() })}
            cargando={cargando}
            error={errorMenu}
          />
        )}
      </div>
    );
  }

  if (!sala) {
    return (
      <div className="tr-contenedor">
        <section className="game trp-escena">
          <div className="trp-tarjeta tr-center">
            <span className="trp-carga" aria-hidden="true">🐪</span>
            <p style={{ fontWeight: 800 }}>Conectando con la sala {sesion.code}…</p>
            <button type="button" className="trp-boton secundario" onClick={() => salirDeSala(false)}>Cancelar</button>
          </div>
        </section>
      </div>
    );
  }

  const v = sala.vista;
  const enPartida = sala.estado !== 'lobby';
  const puntosTotales = Object.fromEntries(sala.jugadores.map((j) => [j.id, j.puntos]));
  const admin = { esAdmin: sala.esAdmin, onForzar: () => llamar('forzar') };
  const abrirSalir = () => setModal(sala.estado === 'lobby' ? 'lobby' : 'partida');

  return (
    <div className={`tr-contenedor ${enPartida ? 'qq-en-partida' : ''}`}>
      {sinRed && <p className="tr-sinred">⚠ Sin conexión con el servidor. Reintentando…</p>}
      {aviso && <p className="tr-toast" role="alert" onClick={() => setAviso('')}>{aviso}</p>}

      {sala.estado === 'lobby' && <Lobby sala={sala} llamar={llamar} onSalir={abrirSalir} onAbrirAyuda={onAbrirAyuda} />}

      {sala.estado === 'jugando' && v && (
        <section className={`game trp-escena fase-${v.fase}`}>
          {v.fase !== 'fin' ? (
            <PantallaDeFase v={v} enviar={enviar} offset={offset} onSalir={abrirSalir} admin={admin} />
          ) : (
            <PantallaFin v={v} puntosTotales={puntosTotales} offset={offset} onSalir={abrirSalir}>
              <div className="trp-barra estatica">
                {sala.esAdmin ? (
                  <>
                    <button type="button" className="trp-boton grande" disabled={sala.jugadores.length < MIN} onClick={() => llamar('siguiente-partida')}>
                      <Icon name="refresh" size={22} /> {sala.jugadores.length < MIN ? `Hacen falta ${MIN} jugadores` : 'Otra partida (mismos jugadores)'}
                    </button>
                    <button type="button" className="trp-boton secundario" onClick={() => llamar('finalizar')}>
                      <Icon name="trophy" size={20} /> Terminar y ver la clasificación
                    </button>
                  </>
                ) : (
                  <p className="trp-esperando"><strong><Icon name="hourglass" size={16} /> Esperando a que el anfitrión decida qué hacer…</strong></p>
                )}
              </div>
            </PantallaFin>
          )}
        </section>
      )}

      {sala.estado === 'final' && <Podio sala={sala} llamar={llamar} onSalir={abrirSalir} />}

      {modal === 'lobby' && (
        <ModalSalir
          titulo="¿Salir de la sala?"
          texto={sala.esAdmin ? 'Eres el anfitrión: si sales, otro jugador pasará a ser el anfitrión (si no queda nadie, la sala se cerrará).' : 'Abandonarás la sala de espera y volverás al menú.'}
          onSeguir={() => setModal(null)}
          onSalir={() => salirDeSala(false)}
        />
      )}
      {modal === 'partida' && (
        <ModalSalir
          titulo="¿Salir de la partida?"
          texto={`${sala.estado === 'jugando' && v?.fase !== 'fin' ? 'Abandonarás la caravana: los demás verán que te has ido y se revelará tu papel. ' : ''}${sala.esAdmin ? 'Otro jugador pasará a ser el anfitrión.' : 'Volverás a la portada.'}`}
          onSeguir={() => setModal(null)}
          onSalir={() => salirDeSala(true)}
        />
      )}
    </div>
  );
}
