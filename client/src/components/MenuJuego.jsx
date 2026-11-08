// client/src/components/MenuJuego.jsx
// Piezas comunes de los menús iniciales de los minijuegos:
// menú principal (online / un dispositivo), submenú online, crear partida,
// unirse con código, sala de espera y selector de jugadores del modo local.
// El título, la descripción, el icono y los colores salen siempre de meta.js.
import { useState } from 'react';
import Icon from './Icon.jsx';
import { metaDe } from '../games/meta.js';
import './MenuJuego.css';

export function BotonVolver({ onClick, texto = 'Volver' }) {
  return (
    <button type="button" className="qq-link-volver" onClick={onClick}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>{texto}</span>
    </button>
  );
}

export function BotonAyuda({ onClick }) {
  if (typeof onClick !== 'function') return null;
  return (
    <button type="button" className="qq-btn-ayuda" onClick={onClick} title="Cómo jugar" aria-label="Cómo jugar">
      ?
    </button>
  );
}

// Tarjeta base de todos los menús: barra superior (volver + ayuda) y contenido.
export function PanelMenu({ onVolver, textoVolver, onAyuda, centrado = true, className = '', style, children }) {
  const conVolver = typeof onVolver === 'function';
  return (
    <div className={`panel ${centrado ? 'center ' : ''}qq-menu-panel ${className}`.trim()} style={style}>
      {(conVolver || onAyuda) && (
        <div className={`qq-card-top${conVolver ? '' : ' solo-derecha'}`}>
          {conVolver && <BotonVolver onClick={onVolver} texto={textoVolver} />}
          <BotonAyuda onClick={onAyuda} />
        </div>
      )}
      {children}
    </div>
  );
}

export function OpcionMenu({ icono, titulo, texto, onClick, principal = false }) {
  return (
    <button type="button" className={`qq-opcion-card ${principal ? 'principal' : 'secundaria'}`} onClick={onClick}>
      <span className="qq-opcion-icono">
        <Icon name={icono} size={26} />
      </span>
      <div className="qq-opcion-textos">
        <strong>{titulo}</strong>
        <span>{texto}</span>
      </div>
    </button>
  );
}

function Cabecera({ icono, titulo, descripcion, h1 = false, tamIcono = 40 }) {
  const Titulo = h1 ? 'h1' : 'h2';
  return (
    <>
      <div className="qq-hero-icono">
        <Icon name={icono} size={tamIcono} strokeWidth={1.7} />
      </div>
      <Titulo className="title qq-main-title">{titulo}</Titulo>
      {descripcion && <p className="hint qq-main-desc">{descripcion}</p>}
    </>
  );
}

function Error({ texto }) {
  if (!texto) return null;
  return <p className="error" style={{ margin: '0.8rem 0' }}>{texto}</p>;
}

// Icono, título y descripción del juego (de meta.js) para pantallas iniciales propias.
export function CabeceraJuego({ juegoId }) {
  const m = metaDe(juegoId);
  return <Cabecera icono={m.icono} titulo={m.titulo} descripcion={m.descripcion} h1 tamIcono={44} />;
}

/**
 * Menú principal de un juego (primera pantalla).
 * - Con `onLocal`: "Jugar online" + "Jugar en un único dispositivo".
 * - Sin `onLocal` (juegos solo online): "Crear partida" + "Unirse con código".
 */
export function MenuInicioJuego({ juegoId, onOnline, onLocal, onCrear, onUnirse, onAyuda, error, onVolver, textoVolver }) {
  const m = metaDe(juegoId);
  const soloOnline = typeof onLocal !== 'function';
  return (
    <section className="game qq-pantalla">
      <PanelMenu onAyuda={onAyuda} onVolver={onVolver} textoVolver={textoVolver}>
        <Cabecera icono={m.icono} titulo={m.titulo} descripcion={m.descripcion} h1 tamIcono={44} />
        <Error texto={error} />
        <div className="qq-menu-opciones">
          {soloOnline ? (
            <>
              <OpcionMenu principal icono="crown" titulo="Crear partida" texto="Sé el anfitrión, genera un código y administra el juego" onClick={onCrear} />
              <OpcionMenu icono="users" titulo="Unirse con código" texto="Introduce el código de 4 letras de tu anfitrión" onClick={onUnirse} />
            </>
          ) : (
            <>
              <OpcionMenu principal icono="globe" titulo="Jugar online" texto="Cada jugador desde su propio móvil con código de sala" onClick={onOnline} />
              <OpcionMenu icono="users" titulo="Jugar en un único dispositivo" texto="Pasando el móvil por turnos entre los jugadores" onClick={onLocal} />
            </>
          )}
        </div>
      </PanelMenu>
    </section>
  );
}

// Submenú del modo online: crear o unirse.
export function MenuModoOnline({ onVolver, onCrear, onUnirse, onAyuda, error, longitudCodigo = 4 }) {
  return (
    <section className="game qq-pantalla">
      <PanelMenu onVolver={onVolver} onAyuda={onAyuda}>
        <Cabecera
          icono="globe"
          titulo="Modo Online"
          descripcion="Crea una sala nueva para compartir el código con tus amigos o únete a una ya creada."
        />
        <Error texto={error} />
        <div className="qq-menu-opciones">
          <OpcionMenu principal icono="crown" titulo="Crear partida" texto="Sé el anfitrión, genera un código y administra el juego" onClick={onCrear} />
          <OpcionMenu icono="users" titulo="Unirse con código" texto={`Introduce el código de ${longitudCodigo} letras de tu anfitrión`} onClick={onUnirse} />
        </div>
      </PanelMenu>
    </section>
  );
}

export function FormCrearSala({ onVolver, onAyuda, nombre, setNombre, onCrear, cargando, error, descripcion, children, maxLength = 20 }) {
  const enviar = (e) => {
    e.preventDefault();
    if (!cargando && nombre.trim()) onCrear();
  };
  return (
    <section className="game qq-pantalla">
      <PanelMenu onVolver={onVolver} onAyuda={onAyuda}>
        <Cabecera
          icono="crown"
          titulo="Crear partida"
          descripcion={descripcion || 'Introduce tu nombre para abrir la sala y ser el anfitrión.'}
        />
        <form className="lb-form qq-form-estilizado" onSubmit={enviar}>
          <label className="field-label" htmlFor="qq-host-nombre">Tu nombre</label>
          <input
            id="qq-host-nombre"
            className="qq-input-moderno"
            type="text"
            placeholder="Ej. Alex"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={maxLength}
            autoFocus
          />
          {children}
          {error && <p className="error">{error}</p>}
          <button type="submit" className="big full qq-btn-principal" disabled={cargando || !nombre.trim()}>
            <Icon name="check" size={22} strokeWidth={2.5} /> Crear sala
          </button>
        </form>
      </PanelMenu>
    </section>
  );
}

export function FormUnirseSala({
  onVolver, onAyuda, codigo, setCodigo, nombre, setNombre, onUnirse, cargando, error,
  longitudCodigo = 4, maxLength = 20, descripcion
}) {
  const valido = !cargando && nombre.trim() && codigo.trim().length >= longitudCodigo;
  const enviar = (e) => {
    e.preventDefault();
    if (valido) onUnirse();
  };
  return (
    <section className="game qq-pantalla">
      <PanelMenu onVolver={onVolver} onAyuda={onAyuda}>
        <Cabecera
          icono="users"
          titulo="Unirse a partida"
          descripcion={descripcion || 'Introduce el código que te ha compartido el anfitrión y tu nombre.'}
        />
        <form className="lb-form qq-form-estilizado" onSubmit={enviar}>
          <label className="field-label" htmlFor="qq-code-input">Código de la partida</label>
          <input
            id="qq-code-input"
            className="qq-input-moderno qq-input-codigo"
            type="text"
            placeholder="ABCD"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            maxLength={longitudCodigo}
            autoFocus
          />
          <label className="field-label" htmlFor="qq-guest-nombre" style={{ marginTop: '1rem' }}>Tu nombre</label>
          <input
            id="qq-guest-nombre"
            className="qq-input-moderno"
            type="text"
            placeholder="Tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={maxLength}
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" className="big full qq-btn-principal" disabled={!valido}>
            <Icon name="check" size={22} strokeWidth={2.5} /> Entrar en la partida
          </button>
        </form>
      </PanelMenu>
    </section>
  );
}

// Cabecera de la sala de espera: badge, código copiable, volver y ayuda.
export function CabeceraSala({ codigo, onVolver, onAyuda, texto }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = () => {
    if (!codigo) return;
    navigator.clipboard?.writeText(codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };
  return (
    <PanelMenu onVolver={onVolver} onAyuda={onAyuda}>
      <span className="qq-badge-sala"><Icon name="lock" size={15} /> Sala de espera</span>
      <p className="hint">Código de la partida</p>
      <button type="button" className="qq-codigo-btn" onClick={copiar} title="Copiar código">
        {codigo}
      </button>
      <p className="hint small">
        {copiado ? '¡Copiado al portapapeles!' : (texto || 'Pulsa el código para copiarlo y compártelo con los demás.')}
      </p>
    </PanelMenu>
  );
}

/**
 * Lista de jugadores de la sala de espera.
 * `renderExtra(j)` permite añadir contenido propio a cada jugador.
 */
export function ListaSala({ jugadores = [], yoId, max, min, anfitrionId = 1, renderExtra, children }) {
  const faltan = min ? min - jugadores.length : 0;
  return (
    <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
      <h3 className="qq-sala-titulo">
        <Icon name="users" size={20} /> Jugadores ({jugadores.length}{max ? `/${max}` : ''})
      </h3>
      <div className="lb-lista qq-sala-lista">
        {jugadores.map((j) => (
          <div key={j.id} className={`lb-jug ${j.id === yoId ? 'yo' : ''}`}>
            <span className="lb-jug-nombre">
              {j.nombre}{j.id === yoId ? ' (tú)' : ''}{j.id === anfitrionId || j.esAdmin || j.admin ? ' 👑' : ''}
            </span>
            {renderExtra?.(j)}
          </div>
        ))}
      </div>
      {faltan > 0 && (
        <p className="hint" style={{ marginTop: '0.8rem' }}>
          {faltan === 1
            ? `Falta al menos 1 jugador más para poder empezar (mínimo ${min}).`
            : `Faltan al menos ${faltan} jugadores para poder empezar (mínimo ${min}).`}
        </p>
      )}
      {children}
    </div>
  );
}

// Tarjeta "Esperando al anfitrión..." para los invitados.
export function EsperandoAnfitrion({ texto = 'El anfitrión comenzará la partida cuando estéis todos listos.', children }) {
  return (
    <div className="panel center qq-menu-panel" style={{ marginTop: '1rem', padding: '2rem 1.5rem' }}>
      <span className="qq-espera-icono"><Icon name="hourglass" size={36} /></span>
      <h3 style={{ margin: '0.5rem 0' }}>Esperando al anfitrión...</h3>
      <p className="hint">{texto}</p>
      {children}
    </div>
  );
}

const COLORES_JUGADOR = ['#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#ec4899', '#0d9488', '#ea580c', '#475569', '#65a30d'];

/**
 * Selector de jugadores del modo "un único dispositivo".
 * - numJugadores / onCambiarNum(n): cantidad (stepper + desplegable).
 * - nombres: lista de strings (o de objetos con `nombre`) y onNombre(idx, valor).
 * - children: opciones extra propias del juego (rondas, categorías...).
 */
export function SelectorJugadores({
  onVolver, onAyuda, min = 2, max = 10, numJugadores, onCambiarNum, nombres = [], onNombre,
  onEmpezar, textoBoton = '¡Iniciar juego!', iconoBoton = 'play', puedeEmpezar = true,
  titulo = 'Jugadores', subtitulo, error, children, maxLength = 20, sinNombres = false
}) {
  const fijo = min === max;
  return (
    <section className="game qq-pantalla">
      <PanelMenu onVolver={onVolver} onAyuda={onAyuda} centrado={false}>
        <div className="qq-config-header">
          <div className="qq-hero-icono chico">
            <Icon name="users" size={32} />
          </div>
          <div>
            <h2 className="qq-config-titulo">{titulo}</h2>
            <p className="qq-config-sub">
              {subtitulo || (fijo
                ? `Partida para ${min} jugadores`
                : `Configura quiénes van a participar (${min} a ${max} jugadores)`)}
            </p>
          </div>
        </div>

        {!fijo && typeof onCambiarNum === 'function' && (
          <div className="qq-selector-cantidad-box">
            <label className="qq-label-destacado" htmlFor="qq-num-jugadores">Número de participantes</label>
            <div className="qq-stepper-row">
              <button
                type="button"
                className="qq-stepper-btn"
                disabled={numJugadores <= min}
                onClick={() => onCambiarNum(numJugadores - 1)}
                aria-label="Quitar jugador"
              >
                &minus;
              </button>
              <select
                id="qq-num-jugadores"
                className="qq-select-jugadores"
                value={numJugadores}
                onChange={(e) => onCambiarNum(parseInt(e.target.value, 10))}
              >
                {Array.from({ length: max - min + 1 }, (_, i) => (
                  <option key={i + min} value={i + min}>{i + min} jugadores</option>
                ))}
              </select>
              <button
                type="button"
                className="qq-stepper-btn"
                disabled={numJugadores >= max}
                onClick={() => onCambiarNum(numJugadores + 1)}
                aria-label="Añadir jugador"
              >
                +
              </button>
            </div>
          </div>
        )}

        {!sinNombres && (
          <>
            <span className="qq-label-destacado" style={{ marginTop: '1.2rem' }}>Nombres de los jugadores</span>
            <div className="qq-nombres-grid">
              {nombres.map((n, idx) => {
                const valor = typeof n === 'string' ? n : (n?.nombre ?? '');
                return (
                  <div key={idx} className="qq-jugador-input-card">
                    <span className="qq-jugador-badge" style={{ background: COLORES_JUGADOR[idx % COLORES_JUGADOR.length] }}>
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={valor}
                      onChange={(e) => onNombre(idx, e.target.value)}
                      placeholder={`Jugador ${idx + 1}`}
                      maxLength={maxLength}
                      aria-label={`Nombre del jugador ${idx + 1}`}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}

        {children}

        {error && <p className="error" style={{ marginTop: '1rem' }}>{error}</p>}

        {typeof onEmpezar === 'function' && (
          <button
            type="button"
            className="big full qq-btn-principal"
            style={{ marginTop: '1.5rem' }}
            disabled={!puedeEmpezar}
            onClick={onEmpezar}
          >
            <Icon name={iconoBoton} size={24} /> {textoBoton}
          </button>
        )}
      </PanelMenu>
    </section>
  );
}

// Bloque para opciones extra dentro del selector (título + contenido).
export function BloqueConfig({ titulo, children, style }) {
  return (
    <div className="qq-bloque-config" style={style}>
      {titulo && <span className="qq-label-destacado">{titulo}</span>}
      {children}
    </div>
  );
}
