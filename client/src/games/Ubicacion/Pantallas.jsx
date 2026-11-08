// client/src/games/Ubicacion/Pantallas.jsx
// Piezas visuales de la partida de «Test del viajero» (modo local y online), con el mismo
// lenguaje que Conecta o ¿Sabes quién soy?: cabecera con el degradado del juego, tarjetas
// blancas y barra de botones fija abajo. Mobile first.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { formatearKm, formatearPuntos, PENALIZACION_SIN_MARCA } from './geo.js';

export const inicial = (n = '?') => n.trim().charAt(0).toUpperCase() || '?';
const urlWiki = (l) => (l?.wiki ? `https://en.wikipedia.org/wiki/${encodeURIComponent(l.wiki)}` : null);

function BotonSalir({ onClick, texto = 'Portada' }) {
  return (
    <button type="button" className="ubp-salir" onClick={onClick}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>{texto}</span>
    </button>
  );
}

/** Cabecera con ronda y marcador de jugadores (puntos = km acumulados). */
export function Hero({ onSalir, ronda, total, jugadores = [], yoId, turnoId, confirmados, chipExtra, children }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.querySelector('.activo')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [turnoId]);
  return (
    <header className="ubp-hero">
      <span className="ubp-hero-deco" aria-hidden="true"><Icon name="globe" size={150} strokeWidth={1.3} /></span>
      <div className="ubp-hero-top">
        <BotonSalir onClick={onSalir} />
        <div className="ubp-chips">
          {ronda != null && <span className="ubp-chip"><Icon name="flagFinish" size={14} /> Ronda {ronda}/{total}</span>}
          {chipExtra}
        </div>
      </div>
      {jugadores.length > 0 && (
        <ol className="ubp-marcador" ref={ref} aria-label="Jugadores">
          {jugadores.map((j) => {
            const listo = confirmados?.includes(j.id);
            return (
              <li key={j.id} className={`ubp-jugador${j.id === turnoId ? ' activo' : ''}${listo ? ' listo' : ''}`} style={{ '--c': j.color }}>
                <span className="ubp-avatar">{listo ? '✓' : inicial(j.nombre)}</span>
                <span className="ubp-jugador-datos">
                  <span className="ubp-jugador-nombre">{j.nombre}{j.id === yoId ? ' (tú)' : ''}</span>
                  <strong>{formatearPuntos(j.puntos ?? 0)} pts</strong>
                </span>
              </li>
            );
          })}
        </ol>
      )}
      {children}
    </header>
  );
}

export function BarraTiempo({ segundos, total }) {
  if (segundos == null) return null;
  const pct = Math.max(0, Math.min(100, (segundos / total) * 100));
  const nivel = segundos <= 10 ? 'critico' : segundos <= 25 ? 'aviso' : '';
  return (
    <div className={`ubp-tiempo ${nivel}`} role="timer" aria-label={`${Math.ceil(segundos)} segundos`}>
      <div className="ubp-tiempo-barra"><span style={{ width: `${pct}%` }} /></div>
      <span className="ubp-tiempo-num"><Icon name="clock" size={15} /> {Math.ceil(segundos)}s</span>
    </div>
  );
}

/** Foto grande con cuenta atrás para memorizar el lugar. */
export function TarjetaFoto({ src, segundos, total, cargando, onLoad, onError }) {
  const [rota, setRota] = useState(false);
  return (
    <div className="ubp-tarjeta ubp-foto-tarjeta">
      <p className="ubp-etiqueta"><Icon name="eye" size={14} /> ¡Memoriza este lugar!</p>
      <div className="ubp-foto-marco">
        {rota ? (
          <div className="ubp-foto-rota">📷 No se ha podido cargar la foto</div>
        ) : (
          <img
            className="ubp-foto"
            src={src}
            alt="Lugar emblemático que hay que situar en el mapa"
            onLoad={onLoad}
            onError={() => { setRota(true); onError?.(); }}
          />
        )}
        <span className={`ubp-foto-reloj${segundos != null && segundos <= 3 ? ' critico' : ''}`}>
          <Icon name="clock" size={15} /> {cargando ? 'Cargando…' : `${Math.ceil(segundos ?? 0)} s`}
        </span>
      </div>
      {!cargando && segundos != null && (
        <div className="ubp-foto-progreso"><span style={{ width: `${(segundos / total) * 100}%` }} /></div>
      )}
      <p className="ubp-credito">Foto de Wikimedia Commons (licencia libre)</p>
    </div>
  );
}

/** Botón con miniatura para volver a ver la foto durante el turno. */
export function BotonFoto({ src, onClick }) {
  return (
    <button type="button" className="ubp-boton-foto" onClick={onClick} title="Ver la foto otra vez">
      <img src={src} alt="" />
      <span><Icon name="eye" size={14} /> Ver foto</span>
    </button>
  );
}

export function ModalFoto({ src, onCerrar }) {
  return (
    <div className="rg-modal-fondo" onClick={onCerrar}>
      <div className="rg-modal ubp-modal-foto" onClick={(e) => e.stopPropagation()}>
        <img src={src} alt="Lugar de esta ronda" />
        <button type="button" className="ubp-boton" onClick={onCerrar}>Cerrar</button>
      </div>
    </div>
  );
}

/** Resultado de la ronda: lugar revelado y lo que suma cada jugador. */
export function TablaRonda({ lugar, filas, onEnfocar, yoId }) {
  const url = urlWiki(lugar);
  return (
    <div className="ubp-tarjeta">
      <div className="ubp-lugar">
        <span className="ubp-lugar-icono"><Icon name="pin" size={24} /></span>
        <span>
          <span className="ubp-etiqueta">Era…</span>
          <strong>{lugar.nombre}</strong>
          <small>{lugar.pais}</small>
        </span>
      </div>
      <ol className="ubp-filas">
        {filas.map((f, i) => (
          <li key={f.id}>
            <button type="button" className={`ubp-fila${i === 0 && f.real ? ' mejor' : ''}`} style={{ '--c': f.color }} onClick={() => f.real && onEnfocar?.(f.real)} disabled={!f.real}>
              <span className="ubp-pos">{i === 0 && f.real ? '🎯' : i + 1}</span>
              <span className="ubp-avatar">{inicial(f.nombre)}</span>
              <span className="ubp-fila-nombre">
                {f.nombre}{f.id === yoId ? ' (tú)' : ''}
                <small>{f.real ? `a ${formatearKm(f.km)}` : 'Sin marcador'}</small>
              </span>
              <strong className="ubp-suma">+{formatearPuntos(f.puntos)}</strong>
            </button>
          </li>
        ))}
      </ol>
      <p className="ubp-credito">
        Toca un jugador para ver su marcador. Foto de Wikimedia Commons
        {url && <> · <a href={url} target="_blank" rel="noreferrer">ver origen</a></>}
      </p>
    </div>
  );
}

/** Clasificación general: de menos a más puntos (gana quien menos tiene). */
export function Clasificacion({ jugadores, sumadas = {}, yoId, titulo = 'Clasificación', subtitulo }) {
  const orden = [...jugadores].sort((a, b) => (a.puntos ?? 0) - (b.puntos ?? 0));
  const minimo = orden.length ? orden[0].puntos ?? 0 : 0;
  return (
    <div className="ubp-tarjeta">
      <p className="ubp-etiqueta">{subtitulo || 'Gana quien menos kilómetros acumule'}</p>
      <h3 className="ubp-titulo">{titulo}</h3>
      <ol className="ubp-ranking">
        {orden.map((j, i) => {
          const lider = (j.puntos ?? 0) === minimo;
          return (
            <li key={j.id} className={lider ? 'lider' : ''} style={{ '--c': j.color }}>
              <span className="ubp-pos">{lider ? <Icon name="crown" size={18} /> : i + 1}</span>
              <span className="ubp-avatar">{inicial(j.nombre)}</span>
              <span className="ubp-ranking-nombre">{j.nombre}{j.id === yoId ? ' (tú)' : ''}</span>
              {sumadas[j.id] != null && <small className="ubp-delta">+{formatearPuntos(sumadas[j.id])}</small>}
              <strong>{formatearPuntos(j.puntos ?? 0)}</strong>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Podio final. */
export function Podio({ jugadores, yoId }) {
  const orden = [...jugadores].sort((a, b) => (a.puntos ?? 0) - (b.puntos ?? 0));
  const minimo = orden[0]?.puntos ?? 0;
  const ganadores = orden.filter((j) => (j.puntos ?? 0) === minimo);
  const top = orden.slice(0, 3);
  const alturas = ['primero', 'segundo', 'tercero'];
  const colocacion = top.length === 3 ? [top[1], top[0], top[2]] : top.length === 2 ? [top[1], top[0]] : top;
  return (
    <div className="ubp-tarjeta ubp-podio-tarjeta">
      <p className="ubp-etiqueta">Fin del viaje</p>
      <h2 className="ubp-ganador">
        {ganadores.length > 1 ? <>¡Empate entre {ganadores.map((g) => g.nombre).join(' y ')}!</> : <>¡Gana {ganadores[0]?.nombre}!</>}
      </h2>
      <p className="ubp-texto">Con solo <strong>{formatearPuntos(minimo)} km</strong> de error acumulado.</p>
      <div className="ubp-podio">
        {colocacion.map((j) => {
          const puesto = top.indexOf(j);
          return (
            <div key={j.id} className={`ubp-podio-col ${alturas[puesto]}`} style={{ '--c': j.color }}>
              <span className="ubp-avatar grande">{inicial(j.nombre)}</span>
              <span className="ubp-podio-nombre">{j.nombre}{j.id === yoId ? ' (tú)' : ''}</span>
              <span className="ubp-podio-pts">{formatearPuntos(j.puntos ?? 0)}</span>
              <span className="ubp-podio-base">{puesto + 1}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ModalSalir({ titulo = '¿Salir de la partida?', texto, onSeguir, onSalir, textoSalir = 'Salir' }) {
  return (
    <div className="rg-modal-fondo" onClick={onSeguir}>
      <div className="rg-modal ubp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ubp-modal-icono">🚪</div>
        <h3>{titulo}</h3>
        <p className="hint">{texto}</p>
        <div className="ubp-fila-botones">
          <button type="button" className="ubp-boton secundario" onClick={onSeguir}>Seguir</button>
          <button type="button" className="ubp-boton peligro" onClick={onSalir}>{textoSalir}</button>
        </div>
      </div>
    </div>
  );
}

/** Texto de ayuda común (modal «Cómo jugar»). */
export function TextoAyuda() {
  return (
    <>
      <ul>
        <li><strong>Observa la foto:</strong> al empezar cada ronda verás un lugar o monumento durante 10 segundos.</li>
        <li><strong>Sitúalo en el mapa:</strong> toca el mapa para colocar tu marcador. Puedes arrastrarlo para afinar y volver a ver la foto.</li>
        <li><strong>En un dispositivo (por turnos):</strong> además de tu marcador real (★) colocas 2 señuelos. El siguiente jugador verá tus 3 marcas con «?» sin saber cuál es la buena. El último solo coloca la real.</li>
        <li><strong>Online (a la vez):</strong> cada 15 segundos un radar enseña durante 1 segundo los marcadores de los rivales que aún no han confirmado.</li>
      </ul>
      <p style={{ marginTop: '0.9rem', fontWeight: 800, color: '#0f172a' }}>Puntuación</p>
      <ul>
        <li>Cada ronda sumas <strong>tantos puntos como kilómetros</strong> te separen del lugar real.</li>
        <li>Si no colocas tu marcador a tiempo, sumas <strong>{formatearPuntos(PENALIZACION_SIN_MARCA)} puntos</strong>.</li>
        <li>Al final <strong>gana quien menos puntos tenga</strong>. ¡Como en el golf!</li>
      </ul>
    </>
  );
}
