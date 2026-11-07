// client/src/games/GeoQuiz/GeoQuizOnline.jsx
// Modo online: cada jugador desde su móvil. Menús comunes + sala de espera con la configuración.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import {
  MenuInicioJuego, MenuModoOnline, FormCrearSala, FormUnirseSala, CabeceraSala, ListaSala, EsperandoAnfitrion
} from '../../components/MenuJuego.jsx';
import GeoQuizPartida from './GeoQuizPartida.jsx';
import GeoQuizConfig, { resumenConfig } from './GeoQuizConfig.jsx';
import './GeoQuiz.css';

const CLAVE_SESION = 'geoquiz_online_session';
const API = '/api/geoquiz/online';
const MAX_JUGADORES = 12;

const post = async (url, body) => {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Algo ha fallado.');
  return data;
};

export default function GeoQuizOnline({ onLocal, onSalir, onAbrirAyuda }) {
  const [vista, setVista] = useState('menu'); // 'menu' | 'online_menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [sala, setSala] = useState(null);
  const fallos = useRef(0);
  const [sesion, setSesion] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(CLAVE_SESION)); } catch { return null; }
  });

  useEffect(() => {
    fetch('/api/geoquiz/categorias')
      .then((r) => r.json())
      .then((d) => { if (d.success) setCategorias(d.categorias); })
      .catch(() => {});
  }, []);

  const cerrarSesion = (mensaje) => {
    sessionStorage.removeItem(CLAVE_SESION);
    setSesion(null);
    setSala(null);
    setVista('online_menu');
    if (mensaje) setErrorMsg(mensaje);
  };

  // Sondeo del estado de la sala
  useEffect(() => {
    if (!sesion) return undefined;
    let activo = true;
    const consultar = async () => {
      try {
        const r = await fetch(`${API}/sala/${sesion.code}?token=${sesion.token}`);
        if (r.status === 403 || r.status === 404) { if (activo) cerrarSesion('La sala se ha cerrado o ya no formas parte de ella.'); return; }
        if (!r.ok) throw new Error();
        const d = await r.json();
        if (!activo) return;
        fallos.current = 0;
        setSala(d);
        setVista('sala');
      } catch {
        fallos.current += 1;
        if (fallos.current >= 8 && activo) cerrarSesion('Se ha perdido la conexión con la sala.');
      }
    };
    consultar();
    const id = setInterval(consultar, 700);
    return () => { activo = false; clearInterval(id); };
  }, [sesion]);

  const entrar = async (ruta, cuerpo) => {
    setErrorMsg('');
    setCargando(true);
    try {
      const d = await post(`${API}/${ruta}`, cuerpo);
      const nueva = { code: d.code, token: d.token };
      sessionStorage.setItem(CLAVE_SESION, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setCargando(false);
    }
  };

  const llamar = async (ruta, extra = {}) => {
    if (!sesion) return { error: 'Sin sesión.' };
    try {
      const d = await post(`${API}/sala/${sesion.code}/${ruta}`, { token: sesion.token, ...extra });
      if (d.success && d.code) setSala(d);
      return d;
    } catch (e) {
      return { error: e.message };
    }
  };

  const accion = async (tipo, datos = {}) => {
    const d = await llamar('accion', { tipo, ...datos });
    return d.error ? d : (d.resultado || { ok: true });
  };

  const salirDeSala = () => {
    const s = sesion;
    setModalSalir(false);
    if (s) fetch(`${API}/sala/${s.code}/salir`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: s.token }), keepalive: true }).catch(() => {});
    const enPartida = sala?.estado === 'juego';
    cerrarSesion('');
    if (enPartida && typeof onSalir === 'function') onSalir();
  };

  const ayuda = onAbrirAyuda;
  const enPartida = vista === 'sala' && sala?.estado === 'juego';

  return (
    <div className={`gq-contenedor ${enPartida ? 'qq-en-partida' : ''}`}>
      {vista === 'menu' && (
        <MenuInicioJuego
          juegoId="geoquiz"
          onOnline={() => { setVista('online_menu'); setErrorMsg(''); }}
          onLocal={onLocal}
          onAyuda={ayuda}
          error={errorMsg}
        />
      )}

      {vista === 'online_menu' && (
        <MenuModoOnline
          onVolver={() => { setVista('menu'); setErrorMsg(''); }}
          onCrear={() => { setVista('crear'); setErrorMsg(''); }}
          onUnirse={() => { setVista('unirse'); setErrorMsg(''); }}
          onAyuda={ayuda}
          error={errorMsg}
        />
      )}

      {vista === 'crear' && (
        <FormCrearSala
          onVolver={() => { setVista('online_menu'); setErrorMsg(''); }}
          onAyuda={ayuda}
          nombre={nombre}
          setNombre={setNombre}
          onCrear={() => entrar('crear', { nombre: nombre.trim() })}
          cargando={cargando}
          error={errorMsg}
          descripcion={`Introduce tu nombre para abrir la sala y ser el anfitrión (hasta ${MAX_JUGADORES} jugadores).`}
        />
      )}

      {vista === 'unirse' && (
        <FormUnirseSala
          onVolver={() => { setVista('online_menu'); setErrorMsg(''); }}
          onAyuda={ayuda}
          codigo={codigoInput}
          setCodigo={setCodigoInput}
          nombre={nombre}
          setNombre={setNombre}
          onUnirse={() => entrar('unirse', { code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })}
          cargando={cargando}
          error={errorMsg}
        />
      )}

      {vista === 'sala' && sala?.estado === 'lobby' && (
        <section className="game qq-pantalla">
          <CabeceraSala codigo={sala.code} onVolver={() => setModalSalir(true)} onAyuda={ayuda} />
          <ListaSala jugadores={sala.jugadores} yoId={sala.yoId} max={MAX_JUGADORES} min={1} />

          {sala.esAdmin ? (
            <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
              <h3 className="qq-sala-titulo"><Icon name="settings" size={20} /> Partida</h3>
              <GeoQuizConfig config={sala.config} categorias={categorias} onCambiar={(config) => llamar('config', { config })} />
              <button type="button" className="big full qq-btn-principal" style={{ marginTop: '1.4rem' }} onClick={() => llamar('iniciar')}>
                <Icon name="play" size={22} /> ¡Empezar GeoQuiz!
              </button>
            </div>
          ) : (
            <EsperandoAnfitrion texto={`${resumenConfig(sala.config, categorias)}. El anfitrión empezará la partida cuando estéis todos.`} />
          )}
        </section>
      )}

      {vista === 'sala' && sala?.estado === 'juego' && sala.partida && (
        <GeoQuizPartida
          partida={sala.partida}
          yoId={sala.yoId}
          esAdmin={sala.esAdmin}
          onAccion={accion}
          onSalir={() => setModalSalir(true)}
          finPartida={sala.esAdmin ? (
            <>
              <button type="button" className="gq-boton grande" onClick={() => llamar('iniciar')}>
                <Icon name="refresh" size={20} /> Revancha
              </button>
              <button type="button" className="gq-enlace" onClick={() => llamar('reiniciar')}>
                <Icon name="settings" size={16} /> Volver a la sala de espera
              </button>
            </>
          ) : (
            <p className="gq-espera">Esperando a que el anfitrión decida si jugáis otra…</p>
          )}
        />
      )}

      {modalSalir && (
        <div className="rg-modal-fondo" onClick={() => setModalSalir(false)}>
          <div className="rg-modal gq-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gq-modal-icono">🚪</div>
            <h3>¿Salir de la sala?</h3>
            <p className="hint">
              {sala?.estado === 'juego'
                ? 'Abandonarás la partida; los demás seguirán jugando.'
                : 'Saldrás de la sala de espera.'}
            </p>
            <div className="gq-fila">
              <button type="button" className="gq-boton secundario" onClick={() => setModalSalir(false)}>Quedarme</button>
              <button type="button" className="gq-boton peligro" onClick={salirDeSala}>Salir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
