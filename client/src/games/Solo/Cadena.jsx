// client/src/games/Solo/Cadena.jsx
// «Categorías encadenadas» (1 jugador): 90 segundos y una categoría cerrada («Provincias de Andalucía»,
// «Once del España campeón del mundo»…). Escribe todas las respuestas que puedas: al llegar al mínimo, la categoría
// queda superada y ganas segundos extra. Puedes seguir sumando respuestas o pasar a la siguiente.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, useRecord, Barra, Aviso } from '../../components/UnJugador.jsx';
import { cargarSolo, useCuenta, Cargando, coincide } from './comun.jsx';
import './Solo.css';

const ID = 'cadena';
const SEGUNDOS = 90;
const BONUS = 15;
const SALTO = 10;
export const minimo = (n) => Math.min(n, Math.max(3, Math.ceil(n * 0.6)));

export default function Cadena() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada');
  const [error, setError] = useState('');
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [cats, setCats] = useState([]);
  const [k, setK] = useState(0);
  const [hallados, setHallados] = useState([]);
  const [texto, setTexto] = useState('');
  const [puntos, setPuntos] = useState(0);
  const [superadas, setSuperadas] = useState(0);
  const [faltaron, setFaltaron] = useState(null);
  const [sacudir, setSacudir] = useState(0);
  const [aviso, setAviso] = useState({ t: '', k: 0 });
  const puntosRef = React.useRef(0);
  const cuenta = useCuenta(fase === 'jugando', () => acabar());

  const empezar = async () => {
    setFase('cargando'); setError('');
    try {
      const d = await cargarSolo(ID);
      setCats(d.categorias); setK(0); setHallados([]); setPuntos(0); puntosRef.current = 0; setSuperadas(0); setFaltaron(null); setTexto('');
      cuenta.empezar(SEGUNDOS); setFase('jugando');
    } catch (e) { setError(e.message); }
  };
  function acabar() {
    const p = puntosRef.current;
    setNuevoRecord(p > 0 && registrar(p)); setFase('fin');
  }
  const cat = cats[k];
  const necesarias = cat ? minimo(cat.opciones.length) : 0;
  const pasar = () => {
    const ok = hallados.length >= necesarias;
    if (!ok) cuenta.sumar(-SALTO);
    setFaltaron({ titulo: cat.titulo, lista: cat.opciones.filter((o) => !hallados.includes(o.nombre)).map((o) => o.nombre) });
    if (k + 1 >= cats.length) { acabar(); return; }
    setK(k + 1); setHallados([]); setTexto('');
  };
  const enviar = (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    const o = cat.opciones.find((x) => coincide(texto, x.nombre, x.alias));
    if (!o) { setSacudir((s) => s + 1); setAviso({ t: 'No está en la lista', k: Date.now(), tipo: 'malo' }); setTexto(''); return; }
    if (hallados.includes(o.nombre)) { setAviso({ t: 'Ya la tienes', k: Date.now() }); setTexto(''); return; }
    const h = [...hallados, o.nombre]; setHallados(h); setTexto('');
    puntosRef.current += 1; setPuntos(puntosRef.current);
    if (h.length === necesarias) { cuenta.sumar(BONUS); setSuperadas((s) => s + 1); setAviso({ t: `¡Categoría superada! +${BONUS} s`, k: Date.now(), tipo: 'bueno' }); }
    if (h.length === cat.opciones.length) setTimeout(pasar, 600);
  };

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Empiezas con <b>{SEGUNDOS} segundos</b>. Sale una categoría con una lista cerrada de respuestas: escribe todas las que sepas.</p>
      <p>Cuando llegas al <b>mínimo</b> (más o menos el 60 %), la categoría queda superada y ganas <b>+{BONUS} s</b>. Puedes seguir sumando o pasar a la siguiente.</p>
      <p>Si pasas sin llegar al mínimo, pierdes {SALTO} s.</p>
      <p>Cada respuesta correcta es un punto. Se aceptan apellidos y pequeñas erratas.</p>
    </AyudaUnJugador>
  );
  if (fase === 'portada') return <><PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record} textoRecord={(r) => `${r.valor} respuestas`} />{ayudaModal}</>;
  if (fase === 'cargando') return <Cargando error={error} onReintentar={empezar} />;
  if (fase === 'fin') {
    return (
      <FinUnJugador icono="clock" etiqueta="¡Tiempo!" titulo={puntos >= 40 ? '¡Enciclopedia andante!' : puntos >= 20 ? '¡Muy bien!' : 'Fin de la partida'}
        puntos={puntos} unidad={puntos === 1 ? 'respuesta' : 'respuestas'} nuevoRecord={nuevoRecord} record={record}
        textoRecord={(r) => `${r.valor} respuestas`} exito={puntos > 0} onRepetir={empezar} onMenu={() => setFase('portada')}>
        <p className="uj-mini">{superadas} {superadas === 1 ? 'categoría superada' : 'categorías superadas'}.</p>
        {cat && <p className="uj-mini">En «{cat.titulo}» te faltaron: {cat.opciones.filter((o) => !hallados.includes(o.nombre)).map((o) => o.nombre).join(', ') || 'ninguna'}.</p>}
      </FinUnJugador>
    );
  }

  const ok = hallados.length >= necesarias;
  return (
    <div className="qq-en-partida">
      <section className="game uj-escena rto-escena">
        <CabeceraPartida onSalir={() => setSalir(true)} chips={[<><Icon name="star" size={14} /> {puntos}</>, <>✅ {superadas}</>]} />
        <div className="rto-juego">
          <Barra valor={Math.min(1, cuenta.restante / SEGUNDOS)} etiqueta={`${Math.ceil(cuenta.restante)} s`} invertida />
          <div className="uj-tarjeta">
            <p className="cad-titulo"><span>{cat.emoji}</span>{cat.titulo}</p>
            <p className="sl-nota">{hallados.length} de {cat.opciones.length} · mínimo {necesarias} {ok && '· ✅ superada'}</p>
            <div className="cad-progreso"><span style={{ width: `${(hallados.length / cat.opciones.length) * 100}%` }} className={ok ? 'ok' : ''} /><i style={{ left: `${(necesarias / cat.opciones.length) * 100}%` }} /></div>
            <form onSubmit={enviar} key={sacudir} className={sacudir ? 'sl-sacudir' : ''}>
              <input className="sl-input" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe una respuesta…" autoFocus autoComplete="off" autoCorrect="off" spellCheck="false" enterKeyHint="send" />
            </form>
            <div className="sl-chips cad-hallados">{hallados.map((h) => <span key={h} className="sl-chip bien">{h}</span>)}</div>
          </div>
          <button type="button" className={`uj-boton ${ok ? 'grande' : 'secundario'}`} onClick={pasar}>
            <Icon name="forward" size={18} /> {ok ? 'Siguiente categoría' : `Pasar (−${SALTO} s)`}
          </button>
          {faltaron && faltaron.lista.length > 0 && <p className="sl-nota sl-blanco">En «{faltaron.titulo}» faltaron: {faltaron.lista.join(', ')}.</p>}
        </div>
      </section>
      <Aviso texto={aviso.t} clave={aviso.k} tipo={aviso.tipo} duracion={1200} />
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
