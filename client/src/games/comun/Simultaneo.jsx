// client/src/games/comun/Simultaneo.jsx
// Pantallas comunes de los juegos por rondas simultáneas (motor: ./simultaneo.js): sala online con las piezas de
// ../Pulsador y modo «un dispositivo» pasando el móvil. Cada juego aporta:
//   Responder({ v, id, enviarRespuesta, enviarBorrador, local })  -> formulario de su respuesta
//   Resultado({ v })                                              -> lo que se ve al resolver la ronda
//   Revision({ v, votar, local, yo })  (opcional)                -> revisión de respuestas
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { Hero, Cuenta, useRestante, PantallaFin, ModalSalir, TurnoDe, Avatar } from '../Pulsador/Vistas.jsx';
import { SelectorJugadores, SelectorRondas } from '../../components/MenuJuego.jsx';
import { limitesLocal } from '../limites.js';
import { rondasPorDefecto } from '../rondas.js';
import { errorNombres } from '../../lib/nombres.js';
import '../Pulsador/Pulsador.css';
import './Simultaneo.css';

const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';

/** Cuenta atrás local (modo un dispositivo): llama a onFin al llegar a 0. Devuelve los ms que quedan. */
export function useCuentaLocal(segundos, onFin, activa = true) {
  const [fin] = useState(() => Date.now() + segundos * 1000);
  const [, set] = useState(0);
  const hecho = useRef(false);
  const cb = useRef(onFin);
  cb.current = onFin;
  useEffect(() => {
    if (!activa || !segundos) return undefined;
    const t = setInterval(() => {
      set((x) => x + 1);
      if (Date.now() >= fin && !hecho.current) { hecho.current = true; cb.current?.(); }
    }, 200);
    return () => clearInterval(t);
  }, [activa, segundos, fin]);
  return Math.max(0, fin - Date.now());
}

function Esperando({ v }) {
  const deben = v.jugadores.filter((j) => j.debe);
  return (
    <div className="pzp-tarjeta smx-espera">
      <p className="pzp-etiqueta">Respuestas</p>
      <ul>
        {deben.map((j) => (
          <li key={j.id} className={j.respondido ? 'ok' : ''}>
            <Avatar id={j.id} nombre={j.nombre} /> <span>{j.nombre}{j.id === v.yo?.id ? ' (tú)' : ''}</span>
            <b>{j.respondido ? '✓' : '…'}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Sumas({ v }) {
  const filas = v.jugadores.filter((j) => v.sumas?.[j.id]);
  if (!filas.length) return <p className="smx-nadie">Nadie suma en esta ronda.</p>;
  return (
    <div className="smx-sumas">
      {filas.map((j) => <span key={j.id} className={v.sumas[j.id] > 0 ? 'mas' : 'menos'}><Avatar id={j.id} nombre={j.nombre} /> {j.nombre} <b>{v.sumas[j.id] > 0 ? '+' : ''}{v.sumas[j.id]}</b></span>)}
    </div>
  );
}

// ---------------------------------------------------------------- Online
function PartidaOnline(def) {
  return function Partida({ v, sala, enviar, offset, onSalir }) {
    const restante = useRestante(v.hasta, offset);
    const yo = v.yo?.id;
    const mio = v.jugadores.find((j) => j.id === yo);
    const toca = v.fase === 'jugando' && mio?.debe && !mio?.respondido;
    const titulo = v.fase === 'jugando' ? (toca ? def.tituloResponder?.(v, yo) ?? '¡Responde!' : 'Esperando al resto…')
      : v.fase === 'revision' ? 'Revisad las respuestas' : 'Resultado de la ronda';
    return (
      <>
        <Hero v={v} juego={def} onSalir={onSalir} etiqueta={def.etiqueta?.(v) ?? ''} titulo={titulo} />
        {v.fase === 'jugando' && v.hasta && <Cuenta ms={restante} total={(v.segundos || 60) * 1000} />}
        {v.fase === 'jugando' && (toca
          ? <def.Responder key={`${v.ronda}`} v={v} id={yo} enviarRespuesta={(valor) => enviar('responder', { valor })} enviarBorrador={(valor) => enviar('borrador', { valor })} />
          : <>{def.Previa && <def.Previa v={v} id={yo} />}<Esperando v={v} /></>)}
        {v.fase === 'revision' && def.Revision && (
          <>
            <def.Revision v={v} yo={yo} votar={(clave) => enviar('votar', { clave })} />
            <div className="pzp-barra estatica">
              {sala.esAdmin
                ? <button type="button" className="pzp-boton grande" onClick={() => enviar('finRevision')}><Icon name="check" size={20} /> Dar por revisado y puntuar</button>
                : <p className="pzp-esperando">⏳ El anfitrión cerrará la revisión…</p>}
            </div>
          </>
        )}
        {v.fase === 'resuelta' && (
          <>
            <def.Resultado v={v} />
            <Sumas v={v} />
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
          </>
        )}
      </>
    );
  };
}

// ---------------------------------------------------------------- Un dispositivo
function Local(def) {
  const LIM = limitesLocal(def.id);
  return function LocalJuego({ juego, onVolver, onExit, onAbrirAyuda }) {
    const [paso, setPaso] = useState('config');
    const [nombres, setNombres] = useState(() => Array(LIM.min).fill(''));
    const [rondas, setRondas] = useState(rondasPorDefecto(def.id));
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const [modal, setModal] = useState(false);
    const [listo, setListo] = useState(null);
    const pRef = useRef(null);
    const [, setVer] = useState(0);
    const refrescar = () => setVer((x) => x + 1);

    const empezar = async () => {
      const e = errorNombres(nombres);
      if (e) return setError(e);
      setError(''); setCargando(true);
      try {
        const d = await (await fetch(`${def.api}/local?j=${nombres.length}&r=${rondas}`)).json();
        if (!d.items?.length) throw new Error();
        pRef.current = def.M.crearPartida(nombres.map((nombre, i) => ({ id: i + 1, nombre: nombre.trim() })), d.items, { sinReloj: true, ...(d.reglas || {}) }, Date.now());
        setListo(null);
        setPaso('juego');
      } catch {
        setError('No se ha podido preparar la partida.');
      } finally {
        setCargando(false);
      }
      return undefined;
    };

    if (paso === 'config') {
      return (
        <div className={`pzp-contenedor ${def.id}`}>
          <SelectorJugadores
            onVolver={onVolver} onAyuda={onAbrirAyuda} min={LIM.min} max={LIM.max} numJugadores={nombres.length}
            onCambiarNum={(n) => setNombres((l) => (n > l.length ? [...l, ...Array(n - l.length).fill('')] : l.slice(0, n)))}
            nombres={nombres} onNombre={(i, valor) => setNombres((l) => l.map((x, k) => (k === i ? valor : x)))}
            onEmpezar={empezar} textoBoton={cargando ? 'Preparando…' : '¡A jugar!'} error={error}>
            <SelectorRondas juegoId={def.id} valor={rondas} onCambiar={setRondas} numJugadores={nombres.length} />
          </SelectorJugadores>
        </div>
      );
    }

    const p = pRef.current;
    const salir = modal && <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso y volverás a la portada." onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />;
    const envolver = (c) => <div className={`pzp-contenedor ${def.id} qq-en-partida`}><section className="game pzp-escena">{c}</section>{salir}</div>;
    const general = def.M.vistaDe(p, -1);

    if (p.fase === 'fin') {
      return envolver(
        <PantallaFin v={general} juego={juego} onSalir={() => setModal(true)}>
          <div className="pzp-barra estatica">
            <button type="button" className="pzp-boton grande" onClick={() => setPaso('config')}><Icon name="refresh" size={20} /> Nueva partida</button>
            <button type="button" className="pzp-boton secundario" onClick={() => onExit?.()}><Icon name="door" size={18} /> Salir a la portada</button>
          </div>
        </PantallaFin>
      );
    }

    if (p.fase === 'jugando') {
      let pendientes = general.jugadores.filter((j) => j.debe && !j.respondido).map((j) => j.id);
      if (def.primero) { const f = def.primero(general); if (pendientes.includes(f)) pendientes = [f, ...pendientes.filter((x) => x !== f)]; }
      const id = pendientes[0];
      const v = def.M.vistaDe(p, id);
      const clave = `${p.ronda}:${id}`;
      if (listo !== clave) {
        return envolver(
          <TurnoDe v={{ ...v, yo: null }} id={id} puedo juego={def} onSalir={() => setModal(true)} onListo={() => setListo(clave)} boton={`Soy ${nombreDe(v, id)}`}
            texto={def.textoTurno?.(v, id) ?? 'Que nadie más mire la pantalla.'} />
        );
      }
      const enviarRespuesta = async (valor) => {
        const r = def.M.responder(p, id, valor, Date.now());
        if (r.ok) refrescar();
        return r.ok ? { ok: true } : { ok: false, error: r.error, datos: r };
      };
      return envolver(
        <>
          <Hero v={{ ...v, yo: null }} juego={def} onSalir={() => setModal(true)} etiqueta={`Turno de ${nombreDe(v, id)}`} titulo={def.tituloResponder?.(v, id) ?? '¡Responde!'} turno={id} />
          <def.Responder key={clave} v={v} id={id} local enviarRespuesta={enviarRespuesta} enviarBorrador={(valor) => def.M.borrador(p, id, valor)} />
        </>
      );
    }

    if (p.fase === 'revision') {
      return envolver(
        <>
          <Hero v={general} juego={def} onSalir={() => setModal(true)} etiqueta="Entre todos" titulo="Revisad las respuestas" />
          <def.Revision v={def.M.vistaDe(p, -1)} local votar={(clave) => { def.M.votar(p, -1, clave, { directo: true }); refrescar(); }} />
          <div className="pzp-barra estatica">
            <button type="button" className="pzp-boton grande" onClick={() => { def.M.finRevision(p); refrescar(); }}><Icon name="check" size={20} /> Puntuar la ronda</button>
          </div>
        </>
      );
    }

    // resuelta
    return envolver(
      <>
        <Hero v={general} juego={def} onSalir={() => setModal(true)} etiqueta={def.etiqueta?.(general) ?? ''} titulo="Resultado de la ronda" />
        <def.Resultado v={general} />
        <Sumas v={general} />
        <div className="pzp-barra estatica">
          <button type="button" className="pzp-boton grande" onClick={() => { def.M.siguiente(p, Date.now()); setListo(null); refrescar(); }}>
            <Icon name="play" size={20} /> {p.ronda >= p.rondas ? 'Ver resultado final' : 'Siguiente ronda'}
          </button>
          {p.ronda < p.rondas && <button type="button" className="pzp-enlace" onClick={() => { def.M.terminar(p); refrescar(); }}><Icon name="flagFinish" size={15} /> Terminar la partida ya</button>}
        </div>
      </>
    );
  };
}

function Config(def) {
  return function ConfigJuego({ config, onCambiar, sala }) {
    return <SelectorRondas juegoId={def.id} valor={config.rondas} onCambiar={onCambiar && ((rondas) => onCambiar({ rondas }))} numJugadores={sala?.jugadores?.length || 1} />;
  };
}

/** Objeto `juego` para JuegoPulsador a partir de la definición del juego. */
export function crearJuegoSimultaneo(def) {
  return {
    ...def,
    config: { rondas: rondasPorDefecto(def.id) },
    Local: Local(def),
    Partida: PartidaOnline(def),
    Config: Config(def),
    Fin: ({ v, juego, onSalir, children }) => <PantallaFin v={v} juego={juego} onSalir={onSalir}>{children}</PantallaFin>
  };
}

/** Formulario de texto común: devuelve el error (y datos) del envío para que el juego lo muestre. */
export function FormTexto({ placeholder, boton = 'Enviar', onEnviar, lista, autoFocus = true, children }) {
  const [texto, setTexto] = useState('');
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const enviar = async (e) => {
    e?.preventDefault();
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    const r = await onEnviar(texto.trim());
    setEnviando(false);
    if (r && !r.ok) setError({ texto: r.error, datos: r.datos });
    else setError(null);
  };
  return (
    <form className="smx-form" onSubmit={enviar}>
      <input className="smx-input" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={placeholder} autoFocus={autoFocus}
        list={lista ? 'smx-lista' : undefined} autoComplete="off" maxLength={80} />
      {lista && <datalist id="smx-lista">{lista.map((x) => <option key={x} value={x} />)}</datalist>}
      <button type="submit" className="pzp-boton grande" disabled={!texto.trim() || enviando}><Icon name="check" size={20} /> {boton}</button>
      {error && <div className="smx-error"><p>{error.texto}</p>{children?.(error.datos)}</div>}
    </form>
  );
}
