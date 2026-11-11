// client/src/games/Reinos/ReinosLocal.jsx
// Un solo dispositivo: el móvil pasa de reino en reino para dar las órdenes en secreto (y para responder a las
// propuestas, si hace falta). La crónica de la ronda la leéis todos juntos.
import React, { useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { Partida, Fin, Config, CronicaComun } from './Partida.jsx';
import { ModalSalir } from '../Pulsador/Vistas.jsx';
import { SelectorJugadores } from '../../components/MenuJuego.jsx';

export default function ReinosLocal({ juego, onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(['', '', '']);
  const [config, setConfig] = useState({ rondas: 8 });
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState(null);
  const [modal, setModal] = useState(false);
  const [confirmado, setConfirmado] = useState(null);
  const estRef = useRef(null);
  const [, setVer] = useState(0);
  const refrescar = () => setVer((x) => x + 1);

  const empezar = () => {
    const limpios = nombres.map((n) => n.trim());
    if (limpios.some((n) => !n)) return setError('Todos los jugadores necesitan un nombre.');
    if (new Set(limpios.map((n) => n.toLowerCase())).size !== limpios.length) return setError('Hay nombres repetidos.');
    setError('');
    estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), config, Date.now());
    setConfirmado(null);
    setPaso('juego');
    return undefined;
  };

  if (paso === 'config') {
    return (
      <div className={`pzp-contenedor ${juego.id}`}>
        <SelectorJugadores
          onVolver={onVolver} onAyuda={onAbrirAyuda} min={E.AJUSTES.min} max={E.AJUSTES.max}
          numJugadores={nombres.length}
          onCambiarNum={(n) => setNombres((l) => (n > l.length ? [...l, ...Array(n - l.length).fill('')] : l.slice(0, n)))}
          nombres={nombres}
          onNombre={(i, valor) => setNombres((l) => l.map((x, k) => (k === i ? valor : x)))}
          onEmpezar={empezar} textoBoton="¡Repartir los reinos!" error={error}
        >
          <Config config={config} onCambiar={(c) => setConfig((x) => ({ ...x, ...c }))} />
        </SelectorJugadores>
      </div>
    );
  }

  const est = estRef.current;
  const vivos = est.reinos.filter((r) => !r.fuera && !r.eliminado);
  // ¿A quién le toca el móvil?
  let quien = null;
  if (est.fase === 'ordenes') quien = vivos.find((r) => !r.listo) || null;
  else if (est.fase === 'diplomacia') quien = vivos.find((r) => est.propuestas.some((x) => x.a === r.id && x.estado === 'pendiente')) || null;
  const mostrar = (t) => { setAviso(t); setTimeout(() => setAviso(null), 3000); };
  const salir = modal && (
    <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso y volverás a la portada." onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />
  );
  const envoltorio = (c) => (
    <div className={`pzp-contenedor ${juego.id} qq-en-partida`}>
      {aviso && <p className="pzp-toast" role="alert">{aviso}</p>}
      <section className="game pzp-escena">{c}</section>
      {salir}
    </div>
  );

  if (est.fase === 'fin') {
    return envoltorio(
      <Fin v={E.vistaDe(est, -1)} onSalir={() => setModal(true)}>
        <div className="pzp-barra estatica">
          <button type="button" className="pzp-boton grande" onClick={() => setPaso('config')}><Icon name="refresh" size={20} /> Nueva partida</button>
          <button type="button" className="pzp-boton secundario" onClick={() => onExit?.()}><Icon name="door" size={18} /> Salir a la portada</button>
        </div>
      </Fin>
    );
  }

  if (quien) {
    const claveTurno = `${est.ronda}-${est.fase}-${quien.id}`;
    if (confirmado !== claveTurno) {
      return envoltorio(
        <div className="pzp-tarjeta pzp-gate">
          <p className="pzp-etiqueta centrada">Ronda {est.ronda} · {est.fase === 'ordenes' ? 'órdenes secretas' : 'diplomacia'}</p>
          <span className="rnp-escudo" style={{ '--c': quien.c, width: 76, height: 84, fontSize: '2.4rem', borderRadius: '18px 18px 36px 36px' }}>{quien.e}</span>
          <h2 style={{ marginTop: '0.6rem' }}>{quien.nombre}</h2>
          <p className="pzp-texto">Pásale el móvil a <strong>{quien.jugador}</strong>. Que nadie más mire.</p>
          <button type="button" className="pzp-boton grande" onClick={() => setConfirmado(claveTurno)}><Icon name="eye" size={20} /> Soy {quien.jugador}</button>
          <button type="button" className="pzp-enlace oscuro" style={{ marginTop: '0.6rem' }} onClick={() => setModal(true)}>Salir de la partida</button>
        </div>
      );
    }
    const v = E.vistaDe(est, quien.id);
    const enviar = (tipo, d = {}) => {
      let r;
      if (tipo === 'ordenar') r = E.ordenar(est, quien.id, d.acciones);
      else if (tipo === 'responder') r = E.responder(est, quien.id, d.propuesta, d.acepta);
      else if (tipo === 'retirar') r = E.retirar(est, quien.id);
      if (r && !r.ok) mostrar(r.error);
      refrescar();
    };
    return envoltorio(<Partida key={`${quien.id}-${est.ronda}-${est.fase}`} v={v} enviar={enviar} onSalir={() => setModal(true)} local />);
  }

  // Crónica (todos juntos)
  return envoltorio(
    <CronicaComun v={E.vistaDe(est, -1)} onSalir={() => setModal(true)} onSeguir={() => { E.forzar(est); setConfirmado(null); refrescar(); }} />
  );
}
