// client/src/games/Solo/Cronologia.jsx
// «Línea del tiempo» (1 jugador): sale un acontecimiento (invento, película, libro, hecho histórico…) y hay que
// colocarlo en su sitio de la línea, entre los que ya tienes. Cada acierto suma una carta; con 3 fallos se acaba.
// Los fallos también se quedan en la línea (en su sitio correcto y en rojo): cada carta es una pista más.
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, useRecord, Aviso } from '../../components/UnJugador.jsx';
import { cargarSolo, Cargando } from './comun.jsx';
import './Solo.css';

const ID = 'cronologia';
const VIDAS = 3;
export const anioTexto = (a) => (a < 0 ? `${-a} a. C.` : String(a));

export default function Cronologia() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada');
  const [error, setError] = useState('');
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [mazo, setMazo] = useState([]);
  const [linea, setLinea] = useState([]); // cartas colocadas, ordenadas por año
  const [i, setI] = useState(1);
  const [vidas, setVidas] = useState(VIDAS);
  const [aciertos, setAciertos] = useState(0);
  const [ultima, setUltima] = useState(null);
  const [aviso, setAviso] = useState({ t: '', k: 0 });
  const ultimaRef = useRef(null);

  useEffect(() => { ultimaRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, [ultima]);

  const empezar = async () => {
    setFase('cargando'); setError('');
    try {
      const d = await cargarSolo(ID);
      setMazo(d.cartas); setLinea([{ ...d.cartas[0], ok: true }]); setI(1); setVidas(VIDAS); setAciertos(0); setUltima(null); setFase('jugando');
    } catch (e) { setError(e.message); }
  };
  const colocar = (pos) => {
    const c = mazo[i];
    const antes = linea[pos - 1]; const despues = linea[pos];
    const ok = (!antes || antes.anio <= c.anio) && (!despues || c.anio <= despues.anio);
    const carta = { ...c, ok, nueva: true };
    const nueva = [...linea.map((x) => ({ ...x, nueva: false })), carta].sort((a, b) => a.anio - b.anio || (a === carta ? 1 : -1));
    setLinea(nueva); setUltima(c.texto);
    const v = ok ? vidas : vidas - 1;
    if (ok) setAciertos((n) => n + 1); else setVidas(v);
    setAviso({ t: ok ? `✓ ¡Bien! ${anioTexto(c.anio)}` : `✗ Era ${anioTexto(c.anio)}`, k: Date.now(), tipo: ok ? 'bueno' : 'malo' });
    if (v <= 0 || i + 1 >= mazo.length) {
      const puntos = aciertos + (ok ? 1 : 0);
      setTimeout(() => { setNuevoRecord(puntos > 0 && registrar(puntos)); setFase('fin'); }, 1300);
      return;
    }
    setI(i + 1);
  };

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Arriba aparece un acontecimiento: un invento, una película, un libro, un hecho histórico, el nacimiento de un personaje…</p>
      <p>Pulsa el hueco <b>«Aquí»</b> de la línea del tiempo donde creas que va: antes, entre o después de las cartas que ya tienes.</p>
      <p>Si aciertas, suma un punto. Si fallas, pierdes una vida ({VIDAS} en total) y la carta se coloca en su sitio en rojo.</p>
      <p>Cuantas más cartas tengas, más finos serán los huecos. ¿Hasta dónde llegas?</p>
    </AyudaUnJugador>
  );
  if (fase === 'portada') return <><PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record} textoRecord={(r) => `${r.valor} cartas`} />{ayudaModal}</>;
  if (fase === 'cargando') return <Cargando error={error} onReintentar={empezar} />;
  if (fase === 'fin') {
    return (
      <FinUnJugador icono="clock" etiqueta={vidas <= 0 ? 'Sin vidas' : '¡Te has acabado el mazo!'} titulo={aciertos >= 20 ? '¡Historiador de élite!' : aciertos >= 10 ? '¡Muy bien!' : 'Fin de la partida'}
        puntos={aciertos} unidad={aciertos === 1 ? 'carta bien colocada' : 'cartas bien colocadas'} nuevoRecord={nuevoRecord} record={record}
        textoRecord={(r) => `${r.valor} cartas`} exito={aciertos > 0} onRepetir={empezar} onMenu={() => setFase('portada')}>
        <ol className="cro-linea mini">{linea.map((c) => <li key={c.texto} className={c.ok ? '' : 'mal'}><b>{anioTexto(c.anio)}</b><span>{c.emoji} {c.texto}</span></li>)}</ol>
      </FinUnJugador>
    );
  }

  const actual = mazo[i];
  return (
    <div className="qq-en-partida">
      <section className="game uj-escena rto-escena">
        <CabeceraPartida onSalir={() => setSalir(true)} chips={[
          <><Icon name="star" size={14} /> {aciertos} bien</>,
          <>{Array.from({ length: VIDAS }, (_, k) => (k < vidas ? '❤️' : '🖤')).join('')}</>
        ]}>
          <div className="cro-actual" key={actual.texto}>
            <span>{actual.emoji}</span>
            <b>{actual.texto}</b>
            <small>¿Dónde va en la línea?</small>
          </div>
        </CabeceraPartida>
        <ol className="cro-linea">
          {linea.map((c, pos) => (
            <React.Fragment key={c.texto}>
              <li className="cro-hueco"><button type="button" onClick={() => colocar(pos)}>{pos === 0 ? '⬆ Antes de todo' : '↔ Aquí'}</button></li>
              <li ref={c.texto === ultima ? ultimaRef : null} className={`cro-carta${c.ok ? '' : ' mal'}${c.nueva ? ' nueva' : ''}`}><b>{anioTexto(c.anio)}</b><span>{c.emoji} {c.texto}</span></li>
            </React.Fragment>
          ))}
          <li className="cro-hueco"><button type="button" onClick={() => colocar(linea.length)}>⬇ Después de todo</button></li>
        </ol>
      </section>
      <Aviso texto={aviso.t} clave={aviso.k} tipo={aviso.tipo} duracion={1300} />
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
