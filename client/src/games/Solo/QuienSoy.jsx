// client/src/games/Solo/QuienSoy.jsx
// «¿Quién soy? Contrarreloj» (1 jugador): 3 minutos para adivinar cuantos famosos puedas. Para cada uno, haz
// preguntas de sí o no (cada pregunta cuesta 4 s); los famosos que ya no encajan se tachan solos. Señala al que
// creas que es: si aciertas, +8 s y al siguiente; si fallas, −15 s.
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, useRecord, Barra, Aviso } from '../../components/UnJugador.jsx';
import { cargarSolo, useCuenta, Cargando } from './comun.jsx';
import '../../reto/Reto.css';
import './Solo.css';

const ID = 'quiensoy';
const SEGUNDOS = 180;
const COSTE = 4;
const PREMIO = 8;
const CASTIGO = 15;
const ICONO = { deporte: '🏅', musica: '🎵', cine: '🎬', ciencia: '🔬', literatura: '📚', arte: '🎨', historia: '🏛️' };

export default function QuienSoy() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada');
  const [error, setError] = useState('');
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [datos, setDatos] = useState(null);
  const [n, setN] = useState(0);
  const [hechas, setHechas] = useState([]); // [{ id, si }]
  const [fallados, setFallados] = useState([]);
  const [aciertos, setAciertos] = useState([]);
  const [aviso, setAviso] = useState({ t: '', k: 0 });
  const aciertosRef = React.useRef(0);
  const cuenta = useCuenta(fase === 'jugando', () => { setNuevoRecord(aciertosRef.current > 0 && registrar(aciertosRef.current)); setFase('fin'); });

  const empezar = async () => {
    setFase('cargando'); setError('');
    try {
      const d = await cargarSolo(ID);
      setDatos(d); setN(0); setHechas([]); setFallados([]); setAciertos([]); aciertosRef.current = 0;
      cuenta.empezar(SEGUNDOS); setFase('jugando');
    } catch (e) { setError(e.message); }
  };

  const objetivo = datos?.objetivos[n];
  const vivos = useMemo(() => {
    if (!datos) return [];
    return datos.candidatos.map((_, i) => i).filter((i) => !fallados.includes(i) && hechas.every((h) => datos.preguntas.find((p) => p.id === h.id).si.includes(i) === h.si));
  }, [datos, hechas, fallados]);

  const preguntar = (p) => {
    if (hechas.some((h) => h.id === p.id)) return;
    setHechas([...hechas, { id: p.id, si: p.si.includes(objetivo) }]);
    cuenta.sumar(-COSTE);
  };
  const señalar = (i) => {
    if (i === objetivo) {
      aciertosRef.current += 1; setAciertos((a) => [...a, datos.candidatos[i].nombre]);
      cuenta.sumar(PREMIO); setAviso({ t: `✓ ¡Era ${datos.candidatos[i].nombre}! +${PREMIO} s`, k: Date.now(), tipo: 'bueno' });
      setN((x) => (x + 1) % datos.objetivos.length); setHechas([]); setFallados([]);
    } else {
      setFallados((f) => [...f, i]); cuenta.sumar(-CASTIGO); setAviso({ t: `✗ No es ${datos.candidatos[i].nombre} · −${CASTIGO} s`, k: Date.now(), tipo: 'malo' });
    }
  };

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Tienes <b>3 minutos</b>. La máquina piensa en un famoso de la lista y tú haces preguntas de sí o no.</p>
      <p>Cada pregunta cuesta <b>{COSTE} s</b>, y los famosos que ya no encajan se tachan solos.</p>
      <p>Cuando lo tengas, tócalo: si aciertas ganas <b>+{PREMIO} s</b> y sale otro; si fallas, <b>−{CASTIGO} s</b>.</p>
      <p>Pregunta bien: ¡con pocas preguntas puedes descartar a la mitad!</p>
    </AyudaUnJugador>
  );
  if (fase === 'portada') return <><PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record} textoRecord={(r) => `${r.valor} famosos`} />{ayudaModal}</>;
  if (fase === 'cargando') return <Cargando error={error} onReintentar={empezar} />;
  if (fase === 'fin') {
    return (
      <FinUnJugador icono="clock" etiqueta="¡Tiempo!" titulo={aciertos.length >= 8 ? '¡Detective de famosos!' : aciertos.length >= 4 ? '¡Muy bien!' : 'Fin de la partida'}
        puntos={aciertos.length} unidad={aciertos.length === 1 ? 'famoso adivinado' : 'famosos adivinados'} nuevoRecord={nuevoRecord} record={record}
        textoRecord={(r) => `${r.valor} famosos`} exito={aciertos.length > 0} onRepetir={empezar} onMenu={() => setFase('portada')}>
        {aciertos.length > 0 && <div className="sl-chips" style={{ justifyContent: 'center' }}>{aciertos.map((a) => <span key={a} className="sl-chip bien">{a}</span>)}</div>}
        <p className="uj-mini">El último era {datos.candidatos[objetivo].nombre}.</p>
      </FinUnJugador>
    );
  }

  const orden = [...datos.candidatos.keys()].sort((a, b) => (vivos.includes(a) ? 0 : 1) - (vivos.includes(b) ? 0 : 1) || a - b);
  return (
    <div className="qq-en-partida">
      <section className="game uj-escena rto-escena">
        <CabeceraPartida onSalir={() => setSalir(true)} chips={[<>✅ {aciertos.length}</>, <>❓ {hechas.length} preguntas</>, <>👥 {vivos.length} posibles</>]} />
        <div className="rto-juego">
          <Barra valor={Math.min(1, cuenta.restante / SEGUNDOS)} etiqueta={`${Math.ceil(cuenta.restante)} s`} invertida />
          <div className="uj-tarjeta rto-famoso-preguntas">
            <p className="uj-etiqueta">Pregunta (−{COSTE} s)</p>
            <div className="rto-chips">
              {datos.preguntas.map((p) => {
                const h = hechas.find((x) => x.id === p.id);
                return <button key={p.id} type="button" className={`rto-chip${h ? (h.si ? ' si' : ' no') : ''}`} onClick={() => preguntar(p)} disabled={Boolean(h)}>{p.texto}{h && <b>{h.si ? 'Sí' : 'No'}</b>}</button>;
              })}
            </div>
          </div>
          <div className="uj-tarjeta">
            <p className="uj-etiqueta">¿Quién es? Tócalo para señalarlo</p>
            <div className="rto-famosos">
              {orden.map((i) => {
                const c = datos.candidatos[i]; const fuera = !vivos.includes(i);
                return <button key={c.nombre} type="button" className={`rto-famoso${fuera ? ' fuera' : ''}${fallados.includes(i) ? ' mal' : ''}`} disabled={fuera} onClick={() => señalar(i)}>{ICONO[c.campo] || '⭐'} {c.nombre}</button>;
              })}
            </div>
          </div>
        </div>
      </section>
      <Aviso texto={aviso.t} clave={aviso.k} tipo={aviso.tipo} duracion={1500} />
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
