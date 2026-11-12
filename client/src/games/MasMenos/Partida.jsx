// client/src/games/MasMenos/Partida.jsx
// Pantallas de «Entre dos aguas» (online y en un dispositivo) con las piezas comunes de ../Pulsador.
import React, { useEffect, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { Hero, TurnoDe, Cuenta, useRestante, Pildoras } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import { AJUSTES, OPCIONES_TURNOS } from './engine.js';

const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';
export function cifra(valor, unidad) {
  if (valor == null) return '?';
  const n = unidad === 'Año' ? String(valor) : new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(valor);
  return unidad === 'Año' ? n : `${n} ${unidad}`;
}

function Carta({ c, i, v, onElegir }) {
  const revelado = v.fase === 'revelado';
  const elegida = v.eleccion?.lado === i;
  const clase = revelado && elegida ? (v.eleccion.bien ? ' bien' : ' mal') : '';
  return (
    <button type="button" className={`pzp-carta${clase}`} disabled={!onElegir} onClick={() => onElegir?.(i)}>
      {c.nueva && v.racha > 0 && v.fase === 'eligiendo' && <span className="pzp-nueva">NUEVA</span>}
      <small>{c.detalle}</small>
      <strong>{c.nombre}</strong>
      <span className={`pzp-cifra${c.valor == null ? ' oculta' : ' revela'}`}>{cifra(c.valor, c.unidad)}</span>
    </button>
  );
}

/** Lo que se ve durante la partida (todo salvo el final). `local`: todos en el mismo móvil. */
export function Partida({ v, enviar, offset = 0, onSalir, local = false }) {
  const miTurno = local || v.turno === v.yo?.id;
  const restante = useRestante(v.fase === 'eligiendo' ? v.hasta : null, offset);
  const cat = v.categoria;
  const chip = `${cat.emoji} ${cat.nombre}`;
  if (v.fase === 'turno') {
    const u = v.ultimoTurno;
    return (
      <>
        <Hero v={v} juego={{ emoji: cat.emoji }} onSalir={onSalir} chip={chip} etiqueta={`Turno ${v.turnoN} de ${v.turnos}`} titulo={cat.pregunta} turno={v.turno} />
        <TurnoDe local={local} v={v} id={v.turno} puedo={miTurno} onListo={() => enviar('listo')}
          texto={miTurno ? 'Saldrán dos con la cifra oculta: elige el que tiene más. Cada acierto suma 1 a tu racha; al primer fallo, se acaba.' : null}>
          {u && <p className="pzp-resumen">{nombreDe(v, u.jugadorId)} hizo una racha de {u.racha}{u.motivo === 'tiempo' ? ' (se le acabó el tiempo)' : ''}</p>}
        </TurnoDe>
      </>
    );
  }
  const elegible = miTurno && v.fase === 'eligiendo';
  return (
    <>
      <Hero v={v} juego={{ emoji: cat.emoji }} onSalir={onSalir} chip={chip} etiqueta={`${miTurno && !local ? 'Tu turno' : `Turno de ${nombreDe(v, v.turno)}`}`} titulo={cat.pregunta} turno={v.turno} />
      <div className="pzp-reloj">
        <span className="pzp-racha">🔥 Racha {v.racha}</span>
        {v.fase === 'eligiendo' ? <div style={{ flex: 1 }}><Cuenta ms={restante} total={AJUSTES.segEleccion * 1000} /></div>
          : <strong style={{ flex: 1, textAlign: 'right' }}>{v.eleccion?.bien ? '✅ ¡Bien!' : '❌ ¡Fallo!'}</strong>}
      </div>
      <div className="pzp-duelo">
        {v.cartas.map((c, i) => <Carta key={`${i}-${c.nombre}`} c={c} i={i} v={v} onElegir={elegible ? (lado) => enviar('elegir', { lado }) : null} />)}
        <span className="pzp-vs">VS</span>
      </div>
      {!miTurno && <p className="pzp-esperando">👀 {nombreDe(v, v.turno)} está eligiendo…</p>}
    </>
  );
}

/** Categoría (o al azar) y vueltas. */
export function Config({ config, onCambiar }) {
  const [cats, setCats] = useState([]);
  useEffect(() => {
    let vivo = true;
    fetch('/api/masmenos/categorias').then((r) => r.json()).then((d) => { if (vivo) setCats(d.categorias || []); }).catch(() => {});
    return () => { vivo = false; };
  }, []);
  const elegir = (categoria) => onCambiar?.({ categoria });
  return (
    <>
      <BloqueConfig titulo="Categoría">
        <div className="pzp-cats">
          <button type="button" className={`pzp-cat${config.categoria === 'azar' ? ' activo' : ''}`} disabled={!onCambiar} onClick={() => elegir('azar')}><span>🎲</span><span>Al azar</span></button>
          {cats.map((c) => (
            <button key={c.id} type="button" className={`pzp-cat${config.categoria === c.id ? ' activo' : ''}`} disabled={!onCambiar} onClick={() => elegir(c.id)}>
              <span>{c.emoji}</span><span>{c.nombre}</span>
            </button>
          ))}
        </div>
      </BloqueConfig>
      <BloqueConfig titulo="Turnos de la partida">
        <Pildoras opciones={OPCIONES_TURNOS.map((n) => [n, `${n} turnos`])} valor={config.turnos} onCambiar={onCambiar && ((turnos) => onCambiar({ turnos }))} />
      </BloqueConfig>
    </>
  );
}

/** Lo que el anfitrión puede hacer durante la partida online. */
export function PartidaOnline({ v, sala, enviar, offset, onSalir }) {
  return (
    <>
      <Partida v={v} enviar={enviar} offset={offset} onSalir={onSalir} />
      {sala.esAdmin && v.fase === 'turno' && (
        <div className="pzp-barra estatica">
          <button type="button" className="pzp-enlace" onClick={() => enviar('terminar')}><Icon name="flagFinish" size={15} /> Terminar la partida ya</button>
        </div>
      )}
    </>
  );
}
