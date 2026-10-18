// client/src/games/Traiciones/TraicionesLocal.jsx
// Modo de un solo dispositivo: el móvil pasa de mano en mano en las fases secretas.
import React, { useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { PantallaDeFase, PantallaFin, Ayuda, Hud, Informe, Registro, Diario, Privado, Temporizador, TarjetaVeredicto } from './Vistas.jsx';
import './Traiciones.css';

function PasaMovil({ nombre, texto, boton = 'Soy yo', onListo }) {
  return (
    <div className="tr-pasa">
      <Icon name="users" size={44} />
      <h1>{nombre}</h1>
      <p>{texto || 'Pásale el dispositivo. Que nadie más mire la pantalla.'}</p>
      <button type="button" className="big full" onClick={onListo}><Icon name="eye" size={22} /> {boton}</button>
    </div>
  );
}

function LocalAsamblea({ est, v, onDiario, onVotar }) {
  const [limite] = useState(() => (est.config.segDebate > 0 ? Date.now() + est.config.segDebate * 1000 : null));
  const vivos = est.jugadores.filter((j) => j.vivo);
  return (
    <div className="tr-wrap">
      <Hud v={v} publico />
      {limite && <Temporizador limite={limite} />}
      {v.evento && v.evento.id !== 'despejado' && <div className="tr-card tr-center"><strong>{v.evento.nombre}</strong><p className="tr-muted" style={{ margin: 0 }}>{v.evento.desc}</p></div>}
      <Informe v={v} />
      <div className="tr-card">
        <h3><Icon name="book" size={18} /> Diarios privados</h3>
        <p className="tr-muted">Cada jugador puede consultar en secreto lo que vivió hoy. Después debatid en voz alta: ¿dónde estuvisteis y con quién?</p>
        <div className="tr-sel-gente">
          {vivos.map((j) => <button key={j.id} type="button" onClick={() => onDiario(j.id)}>{j.nombre}</button>)}
        </div>
      </div>
      <Registro v={v} />
      <button type="button" className="big full" onClick={onVotar}><Icon name="scale" size={22} /> Pasar a la votación</button>
    </div>
  );
}

function LocalVotacion({ est, v, onConfirmar }) {
  const vivos = est.jugadores.filter((j) => j.vivo);
  const [votos, setVotos] = useState({});
  return (
    <div className="tr-wrap">
      <Hud v={v} publico />
      <div className="tr-card tr-center">
        <h2><Icon name="scale" size={22} /> ¿A quién expulsáis?</h2>
        <p className="tr-muted">Los votos son públicos: cada uno dice en voz alta su voto y se anota aquí.</p>
      </div>
      <div className="tr-card" style={{ display: 'grid', gap: '.5rem' }}>
        {vivos.map((j) => (
          <div key={j.id} className="tr-votar-fila">
            <span>{j.nombre}</span>
            <select value={votos[j.id] ?? ''} onChange={(e) => setVotos((s) => ({ ...s, [j.id]: e.target.value }))}>
              <option value="">En blanco</option>
              {vivos.filter((x) => x.id !== j.id).map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
            </select>
          </div>
        ))}
      </div>
      <button type="button" className="big full" onClick={() => onConfirmar(votos)}><Icon name="check" size={22} strokeWidth={2.5} /> Confirmar votos</button>
    </div>
  );
}

export default function TraicionesLocal({ onVolver }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(['', '', '', '']);
  const [especiales, setEspeciales] = useState(true);
  const [segDebate, setSegDebate] = useState(0);
  const [error, setError] = useState('');
  const [ayuda, setAyuda] = useState(false);
  const estRef = useRef(null);
  const [, setVer] = useState(0);
  const refrescar = () => setVer((x) => x + 1);
  const [turno, setTurno] = useState(null);       // jugador que ya ha confirmado que tiene el móvil
  const [diario, setDiario] = useState(null);     // { id, confirmado }

  const empezar = () => {
    const limpios = nombres.map((n) => n.trim());
    if (limpios.some((n) => !n)) return setError('Todos los jugadores necesitan un nombre.');
    if (new Set(limpios.map((n) => n.toLowerCase())).size !== limpios.length) return setError('Hay nombres repetidos.');
    setError('');
    estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), { rolesEspeciales: especiales, segDebate });
    setTurno(null); setDiario(null);
    setPaso('juego');
  };

  const est = estRef.current;

  // ---------------- Configuración ----------------
  if (paso === 'config') {
    return (
      <div className="tr-wrap">
        <button type="button" className="btn-ayuda-flotante" onClick={() => setAyuda(true)}><span className="btn-ayuda-flotante-signo">?</span></button>
        {ayuda && <Ayuda onCerrar={() => setAyuda(false)} />}
        <div className="panel tr-center">
          <span className="tr-logo"><Icon name="dagger" size={44} strokeWidth={1.7} /></span>
          <h1 className="title">Traiciones · un dispositivo</h1>
          <p className="hint">Pasaos el móvil en las fases secretas. De 4 a 12 jugadores.</p>
          <div className="tr-nombres" style={{ textAlign: 'left' }}>
            {nombres.map((n, i) => (
              <div key={i} className="tr-nombre-fila">
                <input type="text" placeholder={`Jugador ${i + 1}`} value={n} maxLength={20} onChange={(e) => setNombres((l) => l.map((x, k) => (k === i ? e.target.value : x)))} />
                {nombres.length > 4 && <button type="button" className="secondary danger" onClick={() => setNombres((l) => l.filter((_, k) => k !== i))}><Icon name="x" size={16} /></button>}
              </div>
            ))}
            {nombres.length < 12 && <button type="button" className="secondary" onClick={() => setNombres((l) => [...l, ''])}><Icon name="users" size={18} /> Añadir jugador</button>}
          </div>
          <div className="tr-config" style={{ marginTop: '1rem', textAlign: 'left' }}>
            <label className="fila"><span>Roles especiales (Vigía, Protegido, Bufón)</span>
              <input type="checkbox" checked={especiales} style={{ width: 24, height: 24 }} onChange={(e) => setEspeciales(e.target.checked)} /></label>
            <div><span style={{ fontWeight: 700 }}>Tiempo de debate</span>
              <div className="tr-opciones" style={{ marginTop: '.4rem' }}>
                {E.OPCIONES_DEBATE.map((s) => <button key={s} type="button" className={segDebate === s ? 'on' : ''} onClick={() => setSegDebate(s)}>{s === 0 ? 'Sin límite' : `${s} s`}</button>)}
              </div></div>
          </div>
          {error && <p className="error" style={{ marginTop: '.8rem' }}>{error}</p>}
          <div className="actions">
            <button type="button" className="big full" onClick={empezar}><Icon name="play" size={22} /> Repartir roles</button>
            <button type="button" className="secondary full" onClick={onVolver}>Volver</button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- Partida ----------------
  const vivos = est.jugadores.filter((j) => j.vivo);
  const publico = (id) => E.vistaDe(est, id);

  // Fin
  if (est.fase === 'fin') {
    const v = publico(est.jugadores[0].id);
    return (
      <PantallaFin v={{ ...v, yo: { ...v.yo, id: -1 } }}>
        <div className="actions">
          <button type="button" className="big full" onClick={() => { setPaso('config'); }}><Icon name="refresh" size={22} /> Nueva partida</button>
          <button type="button" className="secondary full" onClick={onVolver}>Salir</button>
        </div>
      </PantallaFin>
    );
  }

  // Consulta del diario privado durante la asamblea
  if (diario) {
    if (!diario.confirmado) {
      return <PasaMovil nombre={est.jugadores.find((j) => j.id === diario.id).nombre} texto="Vas a ver tu diario privado." onListo={() => setDiario({ ...diario, confirmado: true })} />;
    }
    const v = publico(diario.id);
    return (
      <div className="tr-wrap">
        <div className="tr-card"><h3><Icon name="book" size={18} /> Diario de {v.yo.nombre}</h3><Privado etiqueta="Diario oculto"><Diario v={v} /></Privado></div>
        <button type="button" className="big full" onClick={() => setDiario(null)}><Icon name="check" size={22} /> Cerrar y esconder</button>
      </div>
    );
  }

  const faseSecreta = ['roles', 'puestos', 'accion'].includes(est.fase);
  if (faseSecreta) {
    const siguiente = E.quienFalta(est)[0];
    if (turno !== siguiente.id) {
      const textos = { roles: 'Vas a ver tu rol secreto.', puestos: 'Vas a elegir tu puesto en secreto.', accion: 'Vas a ver quién coincidió contigo.' };
      return <PasaMovil nombre={siguiente.nombre} texto={`${textos[est.fase]} Que nadie más mire.`} onListo={() => setTurno(siguiente.id)} />;
    }
    const v = publico(siguiente.id);
    const enviar = async (tipo, datos = {}) => {
      const id = siguiente.id;
      if (tipo === 'rol') E.confirmarRol(est, id);
      else if (tipo === 'puesto') E.elegirPuesto(est, id, datos.puesto, datos.ojo || null);
      else if (tipo === 'accion') E.accion(est, id, { tipo: datos.accion, objetivo: datos.objetivo });
      setTurno(null);
      refrescar();
    };
    return <PantallaDeFase v={v} enviar={enviar} />;
  }

  const base = publico(vivos[0].id);
  if (est.fase === 'asamblea') {
    return <LocalAsamblea key={est.jornada} est={est} v={base} onDiario={(id) => setDiario({ id, confirmado: false })} onVotar={() => { E.forzar(est); refrescar(); }} />;
  }
  if (est.fase === 'votacion') {
    return <LocalVotacion est={est} v={base} onConfirmar={(sel) => {
      vivos.forEach((j) => { if (est.fase === 'votacion') E.votar(est, j.id, sel[j.id] ? Number(sel[j.id]) : null); });
      refrescar();
    }} />;
  }
  // veredicto
  return (
    <div className="tr-wrap">
      <Hud v={base} publico />
      <TarjetaVeredicto v={base} />
      <button type="button" className="big full" onClick={() => { E.forzar(est); refrescar(); }}><Icon name="forward" size={22} /> Siguiente jornada</button>
    </div>
  );
}
