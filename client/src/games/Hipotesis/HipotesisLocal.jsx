// client/src/games/Hipotesis/HipotesisLocal.jsx
// Modo «un único dispositivo»: el motor corre en el navegador y el móvil pasa de mano en mano para formular
// y para juzgar (las dos cosas son secretas). La revelación se ve todos juntos. Sin cuenta atrás.
import React, { useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { PantallaJuego, PantallaFin, Avatar } from './Vistas.jsx';
import { ModalSalir, SelectorRondas } from './HipotesisOnline.jsx';
import { SelectorJugadores, BloqueConfig } from '../../components/MenuJuego.jsx';
import './Hipotesis.css';

export default function HipotesisLocal({ onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombres, setNombres] = useState(['', '', '']);
  const [rondas, setRondas] = useState(5);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [modal, setModal] = useState(false);
  const [confirmado, setConfirmado] = useState(null);
  const estRef = useRef(null);
  const [, setVer] = useState(0);
  const avisoTimer = useRef(null);

  const empezar = () => {
    const limpios = nombres.map((n) => n.trim());
    if (limpios.some((n) => !n)) return setError('Todos los jugadores necesitan un nombre.');
    if (new Set(limpios.map((n) => n.toLowerCase())).size !== limpios.length) return setError('Hay nombres repetidos.');
    setError('');
    estRef.current = E.crearPartida(limpios.map((nombre, i) => ({ id: i + 1, nombre })), { rondas }, { local: true });
    setConfirmado(null);
    setPaso('juego');
    return undefined;
  };

  if (paso === 'config') {
    return (
      <div className="hpp-contenedor">
        <SelectorJugadores
          onVolver={onVolver} onAyuda={onAbrirAyuda} min={E.AJUSTES.min} max={E.AJUSTES.max}
          numJugadores={nombres.length}
          onCambiarNum={(n) => setNombres((l) => (n > l.length ? [...l, ...Array(n - l.length).fill('')] : l.slice(0, n)))}
          nombres={nombres}
          onNombre={(i, valor) => setNombres((l) => l.map((x, k) => (k === i ? valor : x)))}
          onEmpezar={empezar} textoBoton="¡Que empiece el congreso!" error={error}
        >
          <BloqueConfig titulo="Número de rondas">
            <SelectorRondas valor={rondas} onCambiar={setRondas} />
          </BloqueConfig>
        </SelectorJugadores>
      </div>
    );
  }

  const est = estRef.current;
  const refrescar = () => setVer((x) => x + 1);
  const salir = modal && (
    <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso y volverás a la portada." onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />
  );
  const mostrarAviso = (t) => { setAviso(t); clearTimeout(avisoTimer.current); avisoTimer.current = setTimeout(() => setAviso(''), 3000); };

  if (est.fase === 'fin') {
    const v = E.vistaDe(est, -1);
    return (
      <div className="hpp-contenedor qq-en-partida">
        <section className="game hpp-escena">
          <PantallaFin v={{ ...v, yo: null }} onSalir={() => setModal(true)}>
            <div className="hpp-barra estatica">
              <button type="button" className="hpp-boton grande" onClick={() => setPaso('config')}><Icon name="refresh" size={20} /> Nueva partida</button>
            </div>
          </PantallaFin>
        </section>
        {salir}
      </div>
    );
  }

  // Revelación: pantalla común para todos
  if (est.fase === 'revelacion') {
    const v = { ...E.vistaDe(est, -1), yo: { id: -1, listo: false } };
    const enviar = (tipo) => {
      if (tipo !== 'continuar') return;
      est.jugadores.filter((j) => !j.fuera).forEach((j) => E.continuar(est, j.id));
      setConfirmado(null);
      refrescar();
    };
    return (
      <div className="hpp-contenedor qq-en-partida">
        <section className="game hpp-escena">
          <PantallaJuego v={v} enviar={enviar} onSalir={() => setModal(true)} local />
        </section>
        {salir}
      </div>
    );
  }

  // Formular y juzgar: de uno en uno, pasando el móvil
  const quienId = E.faltan(est)[0];
  const quien = est.jugadores.find((j) => j.id === quienId);
  const clave = `${est.ronda}-${est.fase}-${quienId}`;
  if (confirmado !== clave) {
    const texto = est.fase === 'formular'
      ? 'Va a ver sus casillas y formular su hipótesis en secreto. Que nadie más mire.'
      : 'Va a decidir en secreto si se fía de cada hipótesis.';
    return (
      <div className="hpp-contenedor qq-en-partida">
        <section className="game hpp-escena">
          <div className="hpp-tarjeta hpp-gate">
            <Avatar id={quien.id} nombre={quien.nombre} grande />
            <p className="hpp-etiqueta centrada">Pasa el móvil · ronda {est.ronda} · {est.fase === 'formular' ? 'formular' : 'juicio'}</p>
            <h2>Le toca a {quien.nombre}</h2>
            <p className="hpp-texto">{texto}</p>
            <button type="button" className="hpp-boton grande" onClick={() => setConfirmado(clave)}><Icon name="eye" size={20} /> Soy {quien.nombre}</button>
            <button type="button" className="hpp-enlace oscuro" style={{ marginTop: '0.6rem' }} onClick={() => setModal(true)}>Salir de la partida</button>
          </div>
        </section>
        {salir}
      </div>
    );
  }

  const v = E.vistaDe(est, quienId);
  const enviar = (tipo, datos = {}) => {
    let r = null;
    if (tipo === 'formular') r = E.formular(est, quienId, datos.hipotesis);
    else if (tipo === 'juzgar') r = E.juzgar(est, quienId, { votos: datos.votos, seguro: datos.seguro ?? null });
    else if (tipo === 'reaccion') r = E.reaccionar(est, quienId, datos.hid, datos.emoji);
    if (r && !r.ok) mostrarAviso(r.error);
    refrescar();
  };
  return (
    <div className="hpp-contenedor qq-en-partida">
      {aviso && <p className="hpp-toast" role="alert" onClick={() => setAviso('')}>{aviso}</p>}
      <section className="game hpp-escena">
        <PantallaJuego v={v} enviar={enviar} onSalir={() => setModal(true)} local />
      </section>
      {salir}
    </div>
  );
}
