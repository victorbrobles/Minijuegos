// client/src/games/QuienEsQuien/TableroPartida.jsx
// Pantallas de partida de «¿Sabes quién soy?» (modo local y online).
// Mismo estilo que el resto de la web: tarjetas con el degradado del juego,
// tarjetas blancas y botones en relieve. Pensado sobre todo para el móvil.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';

const COLORES = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'];
export const colorJugador = (i) => COLORES[((i % COLORES.length) + COLORES.length) % COLORES.length];
const inicial = (nombre = '?') => nombre.trim().charAt(0).toUpperCase() || '?';
const indiceColor = (j, i) => (typeof j.id === 'number' ? j.id - 1 : i);

function BotonPortada({ onClick }) {
  return (
    <button type="button" className="qqp-salir" onClick={onClick}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>Portada</span>
    </button>
  );
}

// Tarjeta superior con el degradado del juego
function Cabecera({ onSalir, categoria, etiqueta, titulo, avatar, chips, children }) {
  return (
    <header className="qqp-hero">
      <span className="qqp-hero-deco" aria-hidden="true"><Icon name="whois" size={150} strokeWidth={1.4} /></span>
      <div className="qqp-hero-top">
        <BotonPortada onClick={onSalir} />
        <div className="qqp-hero-chips">
          {chips}
          {categoria && (
            <span className="qqp-chip" title="Categoría de la ronda">
              <Icon name={categoria.icono || 'star'} size={14} /> <span>{categoria.nombre}</span>
            </span>
          )}
        </div>
      </div>
      <div className="qqp-hero-cuerpo">
        {avatar}
        <div className="qqp-hero-textos">
          {etiqueta && <p className="qqp-hero-etiqueta">{etiqueta}</p>}
          <h2 className="qqp-hero-titulo">{titulo}</h2>
        </div>
      </div>
      {children}
    </header>
  );
}

function Avatar({ nombre, color, grande = false }) {
  return (
    <span className={`qqp-avatar${grande ? ' grande' : ''}`} style={{ '--c': color }}>
      {inicial(nombre)}
    </span>
  );
}

// Fila con el orden de turnos (modo local)
export function OrdenTurnos({ jugadores, turnoIdx }) {
  const ref = useRef(null);
  useEffect(() => {
    // Mantiene visible al jugador activo cuando hay muchos
    ref.current?.querySelector('.activo')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [turnoIdx]);
  return (
    <ol className="qqp-orden" ref={ref} aria-label="Orden de turnos">
      {jugadores.map((j, i) => (
        <li
          key={j.id}
          className={`qqp-orden-item${i === turnoIdx ? ' activo' : ''}${i < turnoIdx ? ' hecho' : ''}`}
          style={{ '--c': colorJugador(indiceColor(j, i)) }}
          aria-current={i === turnoIdx ? 'step' : undefined}
        >
          <span className="qqp-orden-avatar">{inicial(j.nombre)}</span>
          <span className="qqp-orden-nombre">{j.nombre}</span>
        </li>
      ))}
    </ol>
  );
}

/** Pantalla «pasa el móvil a…» (modo local). */
export function PantallaPasarMovil({ jugadores, turnoIdx, categoria, onEmpezar, onSalir }) {
  const jugador = jugadores[turnoIdx];
  const color = colorJugador(indiceColor(jugador, turnoIdx));
  return (
    <section className="game qqp-escena">
      <Cabecera
        onSalir={onSalir}
        categoria={categoria}
        etiqueta={`Turno ${turnoIdx + 1} de ${jugadores.length}`}
        titulo="Pasad el móvil"
      >
        <OrdenTurnos jugadores={jugadores} turnoIdx={turnoIdx} />
      </Cabecera>

      <div className="qqp-tarjeta qqp-pasar">
        <Avatar nombre={jugador.nombre} color={color} grande />
        <p className="qqp-pasar-para">Le toca a</p>
        <h3 className="qqp-pasar-nombre">{jugador.nombre}</h3>
        <p className="qqp-texto">
          Coge el móvil sin mirar la pantalla de los demás. Tu personaje seguirá oculto para ti.
        </p>
      </div>

      <div className="qqp-barra">
        <button type="button" className="qqp-boton" onClick={onEmpezar}>
          <Icon name="eye" size={22} /> Soy {jugador.nombre}, ¡a jugar!
        </button>
      </div>
    </section>
  );
}

/**
 * Pantalla de juego: zona «mantén pulsado» con los personajes de los demás.
 * - rivales: [{ id, nombre, tarjeta }]
 * - acciones: botones propios del modo (pasar turno, otra ronda…)
 */
export function PantallaTablero({ etiqueta, titulo, colorTitulo, rivales, categoria, onSalir, acciones, pie, vacio, chips, orden }) {
  const [mirando, setMirando] = useState(false);
  const vibrado = useRef(false);

  const mostrar = (e) => {
    if (e?.type === 'pointerdown' && e.button > 0) return;
    setMirando(true);
    if (!vibrado.current && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(12);
      vibrado.current = true;
    }
  };
  const ocultar = () => {
    setMirando(false);
    vibrado.current = false;
  };

  // Si la app pasa a segundo plano mientras se mira, se tapa
  useEffect(() => {
    const tapar = () => setMirando(false);
    document.addEventListener('visibilitychange', tapar);
    window.addEventListener('blur', tapar);
    return () => {
      document.removeEventListener('visibilitychange', tapar);
      window.removeEventListener('blur', tapar);
    };
  }, []);

  const teclaAbajo = (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
      e.preventDefault();
      mostrar(e);
    }
  };
  const teclaArriba = (e) => {
    if (e.key === ' ' || e.key === 'Enter') ocultar();
  };

  return (
    <section className="game qqp-escena">
      <Cabecera
        onSalir={onSalir}
        categoria={categoria}
        etiqueta={etiqueta}
        titulo={titulo}
        chips={chips}
        avatar={colorTitulo ? <Avatar nombre={titulo} color={colorTitulo} /> : null}
      >
        <div className="qqp-identidad">
          <span className="qqp-identidad-icono"><Icon name="lock" size={16} strokeWidth={2.4} /></span>
          <span>Tu personaje: <strong>oculto</strong></span>
          <span className="qqp-identidad-interrogantes" aria-hidden="true">???</span>
        </div>
        {orden}
      </Cabecera>

      <div
        className={`qqp-carta${mirando ? ' mirando' : ''}`}
        role="button"
        tabIndex={0}
        aria-pressed={mirando}
        aria-label="Mantén pulsado para ver los personajes de los demás"
        onPointerDown={mostrar}
        onPointerUp={ocultar}
        onPointerLeave={ocultar}
        onPointerCancel={ocultar}
        onKeyDown={teclaAbajo}
        onKeyUp={teclaArriba}
        onBlur={ocultar}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="qqp-carta-dorso" aria-hidden={mirando}>
          <span className="qqp-carta-icono"><Icon name="eye" size={34} strokeWidth={2} /></span>
          <p className="qqp-carta-titulo">Mantén pulsado para mirar</p>
          <p className="qqp-carta-sub">Verás los personajes de los demás mientras no sueltes</p>
          <span className="qqp-carta-dedo" aria-hidden="true" />
        </div>

        <div className="qqp-carta-cara" aria-hidden={!mirando}>
          <p className="qqp-carta-cara-titulo">
            <Icon name="users" size={16} /> Personajes de los demás
          </p>
          {rivales.length ? (
            <ul className="qqp-rivales">
              {rivales.map((j, i) => (
                <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                  <span className="qqp-rival-avatar">{inicial(j.nombre)}</span>
                  <span className="qqp-rival-datos">
                    <span className="qqp-rival-nombre">{j.nombre}</span>
                    <strong className="qqp-rival-tarjeta">{j.tarjeta}</strong>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="qqp-carta-sub">{vacio || 'Todavía no hay personajes repartidos.'}</p>
          )}
        </div>
      </div>


      {(acciones || pie) && (
        <div className="qqp-barra">
          {acciones}
          {pie}
        </div>
      )}
    </section>
  );
}

export function BotonPrincipal({ children, onClick, disabled }) {
  return (
    <button type="button" className="qqp-boton" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function EnlaceSecundario({ children, onClick }) {
  return (
    <button type="button" className="qqp-enlace" onClick={onClick}>
      {children}
    </button>
  );
}

const COLORES_CATEGORIA = [
  ['#f97316', '#ef4444'], ['#8b5cf6', '#6366f1'], ['#06b6d4', '#3b82f6'], ['#ec4899', '#f43f5e'],
  ['#22c55e', '#84cc16'], ['#3b82f6', '#8b5cf6'], ['#f59e0b', '#f97316'], ['#14b8a6', '#22c55e']
];

/**
 * Selector de categoría con el mismo estilo que la partida.
 * - categorias: [{ id, nombre, icono, totalPersonajes }]
 * - onElegir(cat), onVolver, onAyuda
 * - aviso: texto bajo el título (p. ej. qué pasa al elegir)
 * - cargando / error: estado del reparto (modo online)
 */
export function SelectorCategorias({ categorias, onElegir, onVolver, onAyuda, aviso, cargando, error }) {
  const [filtro, setFiltro] = useState('');
  const normalizar = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const visibles = filtro.trim()
    ? categorias.filter((c) => normalizar(c.nombre).includes(normalizar(filtro.trim())))
    : categorias;

  return (
    <section className="game qqp-escena">
      <header className="qqp-hero">
        <span className="qqp-hero-deco" aria-hidden="true"><Icon name="whois" size={150} strokeWidth={1.4} /></span>
        <div className="qqp-hero-top">
          {onVolver ? (
            <button type="button" className="qqp-salir" onClick={onVolver}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Volver</span>
            </button>
          ) : <span />}
          {onAyuda && (
            <button type="button" className="qqp-ayuda" onClick={onAyuda} title="Cómo jugar" aria-label="Cómo jugar">?</button>
          )}
        </div>
        <p className="qqp-hero-etiqueta">Nueva ronda</p>
        <h2 className="qqp-hero-titulo">Elige la temática</h2>
        {aviso && <p className="qqp-hero-aviso">{aviso}</p>}

        <label className="qqp-buscador">
          <Icon name="search" size={18} />
          <input
            type="search"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar categoría…"
            aria-label="Buscar categoría"
          />
        </label>
      </header>

      {cargando && (
        <p className="qqp-estado" role="status">
          <span className="qqp-spinner" aria-hidden="true" /> Repartiendo personajes…
        </p>
      )}
      {error && <p className="error" style={{ margin: 0 }}>{error}</p>}

      {visibles.length ? (
        <ul className={`qqp-categorias${cargando ? ' bloqueado' : ''}`}>
          {visibles.map((cat) => {
            const i = categorias.indexOf(cat);
            const [c1, c2] = COLORES_CATEGORIA[i % COLORES_CATEGORIA.length];
            const custom = cat.id === 'custom';
            return (
              <li key={cat.id}>
                <button
                  type="button"
                  className={`qqp-categoria${custom ? ' custom' : ''}`}
                  style={{ '--c1': c1, '--c2': c2 }}
                  onClick={() => onElegir(cat)}
                  disabled={cargando}
                >
                  <span className="qqp-categoria-icono"><Icon name={cat.icono || 'star'} size={24} /></span>
                  <span className="qqp-categoria-textos">
                    <span className="qqp-categoria-nombre">{cat.nombre}</span>
                    <span className="qqp-categoria-info">
                      {custom ? 'Escribe tu propia lista' : cat.totalPersonajes ? `${cat.totalPersonajes} personajes` : 'Toca para jugar'}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="qqp-vacio">No hay ninguna categoría con «{filtro}».</p>
      )}
    </section>
  );
}
