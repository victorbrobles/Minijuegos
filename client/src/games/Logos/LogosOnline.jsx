// client/src/games/Logos/LogosOnline.jsx
// Menú online, sala de espera y partida (el servidor guarda el estado y cada móvil lo consulta).
import { nombreIdentidad } from '../../lib/identidad.js';
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import LogosPartida from './LogosPartida.jsx';
import { ConfigPartida } from './LogosComun.jsx';
import {
  MenuModoOnline, FormCrearSala, FormUnirseSala, CabeceraSala, ListaSala, EsperandoAnfitrion
} from '../../components/MenuJuego.jsx';
import './Logos.css';
import { limitesOnline } from '../limites.js';

export const CLAVE_SESION_LOGOS = 'logos_online_session';
const { min: MIN, max: MAX } = limitesOnline('logos');
const API = '/api/logos/online';

const leerSesion = () => {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_SESION_LOGOS));
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
      <div className="rg-modal lgm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="lgm-modal-icono">🚪</div>
        <h3>{titulo}</h3>
        <p className="hint">{texto}</p>
        <div className="lgm-dos">
          <button type="button" className="lgm-boton secundario" onClick={onSeguir}>Seguir</button>
          <button type="button" className="lgm-boton peligro" onClick={onSalir}>Salir</button>
        </div>
      </div>
    </div>
  );
}

export default function LogosOnline({ onVolver, onSalir, onAbrirAyuda }) {
  const [sesion, setSesion] = useState(leerSesion);
  const [menu, setMenu] = useState('menu'); // 'menu' | 'crear' | 'unirse'
  const [nombre, setNombre] = useState(nombreIdentidad);
  const [codigo, setCodigo] = useState('');
  const [errorMenu, setErrorMenu] = useState('');
  const [cargando, setCargando] = useState(false);
  const [sala, setSala] = useState(null);
  const [modal, setModal] = useState(null);
  const [aviso, setAviso] = useState('');
  const [sinRed, setSinRed] = useState(false);
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
    try { sessionStorage.removeItem(CLAVE_SESION_LOGOS); } catch { /* nada */ }
    setSesion(null);
    setSala(null);
    setModal(null);
    setMenu('menu');
    setErrorMenu(mensaje);
  };

  // Antes, un solo fallo de red echaba al jugador de la sala. Ahora solo se cierra si la sala ya no
  // existe (404/403) o tras muchos fallos seguidos; y se descartan respuestas que llegan desordenadas.
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
      try { sessionStorage.setItem(CLAVE_SESION_LOGOS, JSON.stringify(nueva)); } catch { /* nada */ }
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
  const enviarAccion = (accion) => llamar('accion', { accion });

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

  // ---------------------------------------------------------------- Menús
  if (!sesion) {
    return (
      <div className="lgm-contenedor">
        {menu === 'menu' && (
          <MenuModoOnline
            onVolver={onVolver}
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
            descripcion={`Introduce tu nombre para abrir la sala y ser el anfitrión (de ${MIN} a ${MAX} jugadores).`}
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
      <div className="lgm-contenedor">
        <section className="game lgm-escena">
          <div className="lgm-tarjeta lgm-centro">
            <span className="lgm-carga" aria-hidden="true">🏷️</span>
            <p style={{ fontWeight: 800 }}>Conectando con la sala {sesion.code}…</p>
            <button type="button" className="lgm-boton secundario" onClick={() => salirDeSala(false)}>Cancelar</button>
          </div>
        </section>
      </div>
    );
  }

  const enPartida = sala.estado !== 'lobby' && sala.vista;
  const n = sala.jugadores.length;

  return (
    <div className={`lgm-contenedor ${enPartida ? 'qq-en-partida' : ''}`}>
      {sinRed && <p className="lgm-sinred">⚠ Sin conexión con el servidor. Reintentando…</p>}
      {aviso && <p className="lgm-toast" role="alert" onClick={() => setAviso('')}>{aviso}</p>}

      {sala.estado === 'lobby' && (
        <section className="game qq-pantalla">
          <CabeceraSala codigo={sala.code} onVolver={() => setModal('lobby')} onAyuda={onAbrirAyuda} />
          <ListaSala
            jugadores={sala.jugadores}
            yoId={sala.yoId}
            max={MAX}
            min={MIN}
            anfitrionId={sala.anfitrionId}
            renderExtra={(j) => (
              <span className="lgm-sala-extra">
                <i className={`lgm-conexion${j.conectado === false ? ' off' : ''}`} title={j.conectado === false ? 'Sin conexión' : 'Conectado'} />
                {sala.esAdmin && j.id !== sala.anfitrionId && (
                  <button type="button" className="lgm-quitar" onClick={() => llamar('expulsar', { id: j.id })} aria-label={`Quitar a ${j.nombre}`}>Quitar</button>
                )}
              </span>
            )}
          />
          <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
            <h3 className="qq-sala-titulo">🏷️ La partida</h3>
            {!sala.esAdmin && <p className="hint small" style={{ margin: '0 0 0.6rem' }}>Lo configura el anfitrión.</p>}
            <ConfigPartida
              config={sala.config}
              numJugadores={n}
              onChange={sala.esAdmin ? (config) => { setSala((s) => (s ? { ...s, config } : s)); llamar('config', { config }); } : null}
            />
            {sala.esAdmin && (
              <button type="button" className="big full qq-btn-principal" disabled={n < MIN} onClick={() => llamar('iniciar')}>
                <Icon name="play" size={22} /> {n < MIN ? 'Esperando rivales…' : '¡A jugar!'}
              </button>
            )}
          </div>
          {!sala.esAdmin && <EsperandoAnfitrion texto="El anfitrión empezará cuando estéis todos." />}
        </section>
      )}

      {enPartida && (
        <LogosPartida
          vista={sala.vista}
          viewerId={sala.yoId}
          esHost={Boolean(sala.esAdmin)}
          onAccion={enviarAccion}
          onSalir={() => setModal('partida')}
          finalAcciones={(
            <div className="lgm-barra estatica">
              {sala.esAdmin ? (
                <button type="button" className="lgm-boton grande" onClick={() => llamar('reiniciar')}>
                  <Icon name="refresh" size={20} /> Volver a la sala para otra partida
                </button>
              ) : (
                <p className="lgm-esperando">⏳ Esperando a que el anfitrión vuelva a la sala…</p>
              )}
            </div>
          )}
        />
      )}

      {modal === 'lobby' && (
        <ModalSalir
          titulo="¿Salir de la sala?"
          texto={sala.esAdmin ? 'Eres el anfitrión: si sales, otro jugador pasará a serlo (si no queda nadie, la sala se cerrará).' : 'Abandonarás la sala de espera y volverás al menú.'}
          onSeguir={() => setModal(null)}
          onSalir={() => salirDeSala(false)}
        />
      )}
      {modal === 'partida' && (
        <ModalSalir
          titulo="¿Salir de la partida?"
          texto={`Abandonarás la partida y volverás a la portada.${sala.esAdmin ? ' Otro jugador pasará a ser el anfitrión.' : ''}`}
          onSeguir={() => setModal(null)}
          onSalir={() => salirDeSala(true)}
        />
      )}
    </div>
  );
}

