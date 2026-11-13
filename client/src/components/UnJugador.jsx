// client/src/components/UnJugador.jsx
// Piezas comunes de los juegos para un jugador: portada con récord, cabecera de la partida,
// pantalla final, ayuda y récords guardados en el navegador.
// Usan los colores del juego (--g1 / --g2, desde meta.js) y el estilo del resto de la web.
import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { registrarPartida } from '../lib/registros.js';
import { nombreCompleto } from '../lib/identidad.js';
import { PanelMenu, CabeceraJuego } from './MenuJuego.jsx';
import './UnJugador.css';

// ---------------------------------------------------------------------------
// Récords (localStorage; si el navegador no lo permite, el juego sigue funcionando)
// ---------------------------------------------------------------------------
const CLAVE = (juegoId) => `minijuegos_record_${juegoId}`;

export function leerRecord(juegoId) {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE(juegoId)));
    return v && typeof v === 'object' ? v : null;
  } catch {
    return null;
  }
}

/** Guarda { valor, ... } si mejora el récord (mayor es mejor, salvo menorEsMejor). Devuelve true si es récord nuevo. */
export function guardarRecord(juegoId, valor, extra = {}, { menorEsMejor = false } = {}) {
  const actual = leerRecord(juegoId);
  const mejora = !actual || (menorEsMejor ? valor < actual.valor : valor > actual.valor);
  if (mejora) {
    try {
      localStorage.setItem(CLAVE(juegoId), JSON.stringify({ valor, ...extra, fecha: Date.now() }));
    } catch {
      /* sin almacenamiento */
    }
  }
  return mejora;
}

/**
 * Salón de la fama de los juegos de un jugador: cada partida terminada se guarda con la identidad de la sesión.
 * `juegoId` puede llevar un sufijo de nivel («crimen-normal»): se registra en el juego («crimen»).
 */
export function registrarUnJugador(juegoId, valor, { menorEsMejor = false } = {}) {
  const yo = nombreCompleto();
  if (!yo || !Number.isFinite(Number(valor))) return;
  registrarPartida(String(juegoId).split('-')[0], [{ nombre: yo, puntos: Number(valor), gana: true }], { orden: menorEsMejor ? 'asc' : 'desc' });
}

export function useRecord(juegoId) {
  const [record, setRecord] = useState(() => leerRecord(juegoId));
  const registrar = useCallback((valor, extra, opciones) => {
    const nuevo = guardarRecord(juegoId, valor, extra, opciones);
    registrarUnJugador(juegoId, valor, opciones);
    setRecord(leerRecord(juegoId));
    return nuevo;
  }, [juegoId]);
  return [record, registrar];
}

// ---------------------------------------------------------------------------
// Pantallas
// ---------------------------------------------------------------------------

/** Portada del juego: icono, título y descripción (meta.js), récord, opciones y botón Jugar. */
export function PortadaUnJugador({ juegoId, onJugar, onAyuda, record, textoRecord, textoBoton = '¡Jugar!', iconoBoton = 'play', deshabilitado, children }) {
  return (
    <section className="game qq-pantalla">
      <PanelMenu onAyuda={onAyuda}>
        <CabeceraJuego juegoId={juegoId} />
        <span className="uj-solo"><Icon name="users" size={14} /> Para 1 jugador</span>
        {record && (
          <p className="uj-record">
            <Icon name="trophy" size={16} /> Tu récord: <strong>{textoRecord ? textoRecord(record) : record.valor}</strong>
          </p>
        )}
        {children && <div className="uj-opciones">{children}</div>}
        <button type="button" className="big full qq-btn-principal" disabled={deshabilitado} onClick={onJugar}>
          <Icon name={iconoBoton} size={22} /> {textoBoton}
        </button>
      </PanelMenu>
    </section>
  );
}

/** Cabecera de la partida con el degradado del juego: salir, chips de estado y contenido extra. */
export function CabeceraPartida({ titulo, onSalir, chips = [], children }) {
  return (
    <header className="uj-hero">
      <div className="uj-hero-top">
        <button type="button" className="uj-salir" onClick={onSalir}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          <span>Salir</span>
        </button>
        <div className="uj-hero-chips">
          {chips.filter(Boolean).map((c, i) => <span key={i} className="uj-chip">{c}</span>)}
        </div>
      </div>
      {titulo && <h2 className="uj-hero-titulo">{titulo}</h2>}
      {children}
    </header>
  );
}

/** Pantalla final: resultado, récord y botones. */
export function FinUnJugador({ icono = 'trophy', etiqueta = 'Fin de la partida', titulo, puntos, unidad = 'puntos', nuevoRecord, record, textoRecord, onRepetir, onMenu, children, exito = true }) {
  return (
    <section className="game uj-escena">
      <div className={`uj-tarjeta uj-fin${exito ? '' : ' derrota'}`}>
        <span className="uj-fin-icono"><Icon name={icono} size={40} /></span>
        <p className="uj-etiqueta">{etiqueta}</p>
        <h2 className="uj-fin-titulo">{titulo}</h2>
        {puntos != null && <p className="uj-fin-puntos"><strong>{puntos}</strong> {unidad}</p>}
        {nuevoRecord && <p className="uj-nuevo-record">🏆 ¡Nuevo récord!</p>}
        {!nuevoRecord && record && <p className="uj-mini">Tu récord: {textoRecord ? textoRecord(record) : record.valor}</p>}
        {children}
      </div>
      <div className="uj-acciones">
        {onRepetir && (
          <button type="button" className="uj-boton grande" onClick={onRepetir}>
            <Icon name="refresh" size={20} /> Jugar otra vez
          </button>
        )}
        {onMenu && (
          <button type="button" className="uj-enlace" onClick={onMenu}>
            <Icon name="home" size={16} /> Volver al menú del juego
          </button>
        )}
      </div>
    </section>
  );
}

/** Ventana de ayuda «Cómo jugar». */
export function AyudaUnJugador({ titulo, onCerrar, children }) {
  return (
    <div className="rg-modal-fondo" onClick={onCerrar}>
      <div className="rg-modal aprox-modal-ayuda" onClick={(e) => e.stopPropagation()}>
        <div className="aprox-modal-header">
          <span className="aprox-modal-signo-title">?</span>
          <h3>{titulo}</h3>
        </div>
        <div className="aprox-modal-cuerpo">{children}</div>
        <button type="button" className="big full qq-btn-principal" onClick={onCerrar}>¡Entendido!</button>
      </div>
    </div>
  );
}

/** Confirmación de salida durante la partida. */
export function ConfirmarSalida({ onSeguir, onSalir, texto = 'Se perderá la partida en curso.' }) {
  return (
    <div className="rg-modal-fondo" onClick={onSeguir}>
      <div className="rg-modal uj-modal" onClick={(e) => e.stopPropagation()}>
        <div className="uj-modal-icono">🚪</div>
        <h3>¿Salir de la partida?</h3>
        <p className="hint">{texto}</p>
        <div className="uj-fila">
          <button type="button" className="uj-boton secundario" onClick={onSeguir}>Seguir jugando</button>
          <button type="button" className="uj-boton peligro" onClick={onSalir}>Salir</button>
        </div>
      </div>
    </div>
  );
}

/** Aviso breve flotante (acierto, fallo…). Cambia `clave` para volver a mostrarlo. */
export function Aviso({ texto, tipo = 'info', clave, duracion = 2200 }) {
  const [visible, setVisible] = useState(false);
  const primero = useRef(true);
  useEffect(() => {
    if (primero.current && !texto) { primero.current = false; return undefined; }
    primero.current = false;
    if (!texto) return undefined;
    setVisible(true);
    const id = setTimeout(() => setVisible(false), duracion);
    return () => clearTimeout(id);
  }, [clave, texto, duracion]);
  if (!visible || !texto) return null;
  return <div className={`uj-aviso ${tipo}`} role="status" aria-live="polite">{texto}</div>;
}

/** Barra de progreso (tiempo, rastreo…). valor de 0 a 1. */
export function Barra({ valor, etiqueta, peligroDesde = 0.75, invertida = false, icono = 'clock' }) {
  const v = Math.max(0, Math.min(1, valor));
  const nivelPeligro = invertida ? 1 - v : v;
  const nivel = nivelPeligro >= peligroDesde ? 'critico' : nivelPeligro >= peligroDesde * 0.66 ? 'aviso' : '';
  return (
    <div className={`uj-barra-progreso ${nivel}`}>
      <div className="uj-barra-pista"><span style={{ width: `${v * 100}%` }} /></div>
      {etiqueta != null && <span className="uj-barra-texto"><Icon name={icono} size={15} /> {etiqueta}</span>}
    </div>
  );
}

export const barajar = (lista) => {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
