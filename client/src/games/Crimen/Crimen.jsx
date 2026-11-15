// client/src/games/Crimen/Crimen.jsx
// «Escena del Crimen» (1 jugador): puzle de deducción. Coloca a cada persona en la casa usando las pistas: una por fila
// y una por columna, nunca encima de una mesa, planta o estantería. El asesino es el único sospechoso que estaba en la
// misma habitación que la víctima. Generador: ./generador.js.
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { PortadaUnJugador, CabeceraPartida, FinUnJugador, ConfirmarSalida, leerRecord, guardarRecord, registrarUnJugador, Aviso } from '../../components/UnJugador.jsx';
import { RetoAmigo, datosDeReto, recordarPartida } from '../Solo/comun.jsx';
import '../Solo/Solo.css';
import { generarCaso, MUEBLES, NIVELES, COLUMNAS } from './generador.js';
import './Crimen.css';
import { useAbrirAyuda } from '../../lib/ayuda.js';

const ID = 'crimen';
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** `reto` (reto diario): { nivel, semilla, onFin(gana, segundos) } → se juega directamente ese caso. */
export default function Crimen({ reto } = {}) {
  const navigate = useNavigate();
  const [fase, setFase] = useState(reto ? 'juego' : 'portada'); // portada | juego | fin
  const [nivel, setNivel] = useState(reto?.nivel || 'normal');
  const abrirAyuda = useAbrirAyuda();
  const [salir, setSalir] = useState(false);
  // Récord (menor tiempo) por nivel
  const record = leerRecord(`${ID}-${nivel}`);
  const registrar = (valor, extra, op) => { registrarUnJugador(ID, valor, op); return guardarRecord(`${ID}-${nivel}`, valor, extra, op); };
  const [caso, setCaso] = useState(() => (reto ? generarCaso(reto.nivel, reto.semilla) : null));
  const [coloc, setColoc] = useState({}); // persona → celda
  const [tachadas, setTachadas] = useState({}); // celda → true
  const [modo, setModo] = useState('colocar'); // colocar | tachar
  const [sel, setSel] = useState(1);
  const [pistasHechas, setPistasHechas] = useState({});
  const [inicio, setInicio] = useState(() => Date.now());
  const [, setReloj] = useState(0);
  const [resultado, setResultado] = useState(null); // { gana, segundos, acusado }
  const [aviso, setAviso] = useState({ t: '', k: 0, tipo: 'info' });
  const [acusar, setAcusar] = useState(false);
  const [nuevoRecord, setNuevoRecord] = useState(false);

  useEffect(() => {
    if (fase !== 'juego') return undefined;
    const t = setInterval(() => setReloj((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [fase]);

  const empezar = async () => {
    // El 8×8 puede tardar un poco en generarse: primero se pinta «Preparando el caso…»
    setFase('preparando');
    // ¿Se ha entrado con el enlace de un reto entre amigos? Entonces se juega exactamente ese caso
    const deReto = await datosDeReto('crimen');
    const nv = deReto?.nivel && NIVELES[deReto.nivel] ? deReto.nivel : nivel;
    const semilla = deReto?.semilla ?? Date.now();
    if (nv !== nivel) setNivel(nv);
    recordarPartida('crimen', { nivel: nv, semilla });
    setTimeout(() => {
      setCaso(generarCaso(nv, semilla));
      setColoc({}); setTachadas({}); setPistasHechas({}); setModo('colocar'); setSel(1); setResultado(null); setNuevoRecord(false);
      setInicio(Date.now()); setFase('juego');
    }, 60);
  };

  const enCelda = useMemo(() => Object.fromEntries(Object.entries(coloc).map(([p, c]) => [c, Number(p)])), [coloc]);

  if (fase === 'preparando') {
    return (
      <div className="crm-contenedor">
        <section className="game uj-escena"><div className="uj-tarjeta crm-preparando"><span>🔎</span><p>Preparando el caso…</p><small>{NIVELES[nivel].nombre} · {NIVELES[nivel].n}×{NIVELES[nivel].n}</small></div></section>
      </div>
    );
  }
  if (fase === 'portada') {
    return (
      <div className="crm-contenedor">
        <PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={abrirAyuda} record={record} textoRecord={(r) => `${mmss(r.valor)} (${NIVELES[nivel].nombre})`} textoBoton="Abrir el caso" iconoBoton="search">
          <div className="qq-chips">
            {Object.entries(NIVELES).map(([k, x]) => (
              <button key={k} type="button" className={`qq-chip${nivel === k ? ' activo' : ''}`} onClick={() => setNivel(k)}>{x.nombre} · {x.n}×{x.n}</button>
            ))}
          </div>
        </PortadaUnJugador>
      </div>
    );
  }

  if (fase === 'fin') {
    const asesino = caso.personas[caso.asesino];
    return (
      <div className="crm-contenedor">
        <FinUnJugador icono={resultado.gana ? 'trophy' : 'skull'} etiqueta={resultado.gana ? 'Caso cerrado' : 'El asesino se ha escapado'}
          titulo={resultado.gana ? `¡Era ${asesino.nombre}!` : `Era ${asesino.nombre}, no ${caso.personas[resultado.acusado].nombre}`}
          puntos={resultado.gana ? mmss(resultado.segundos) : null} unidad="minutos" nuevoRecord={nuevoRecord} record={record}
          textoRecord={(r) => mmss(r.valor)} exito={resultado.gana} onRepetir={empezar} onMenu={() => setFase('portada')}>
          <Tablero caso={caso} coloc={Object.fromEntries(caso.pos.map((c, p) => [p, c]))} enCelda={Object.fromEntries(caso.pos.map((c, p) => [c, p]))} tachadas={{}} resuelto />
          {!reto && resultado.gana && <RetoAmigo juego="crimen" puntos={resultado.segundos} orden="asc" formato={(x) => `${mmss(x)} (${NIVELES[nivel].nombre})`} />}
        </FinUnJugador>
      </div>
    );
  }

  const n = caso.n;
  const tocar = (c) => {
    const m = caso.mueble[c];
    if (modo === 'tachar') { setTachadas((t) => ({ ...t, [c]: !t[c] })); return; }
    if (enCelda[c] != null) { setColoc((x) => { const y = { ...x }; delete y[enCelda[c]]; return y; }); return; }
    if (m && MUEBLES[m].bloquea) { setAviso({ t: `Nadie puede estar encima de ${MUEBLES[m].nombre}.`, k: Math.random(), tipo: 'error' }); return; }
    setColoc((x) => ({ ...x, [sel]: c }));
    // Siguiente persona sin colocar
    const siguiente = caso.personas.map((_, p) => p).find((p) => p !== sel && coloc[p] == null);
    if (siguiente != null) setSel(siguiente);
  };
  const conflictos = (() => {
    const f = {}; const k = {}; const mal = new Set();
    Object.entries(coloc).forEach(([p, c]) => { const fi = Math.floor(c / n); const co = c % n; (f[fi] ||= []).push(Number(p)); (k[co] ||= []).push(Number(p)); });
    Object.values(f).concat(Object.values(k)).forEach((l) => { if (l.length > 1) l.forEach((p) => mal.add(p)); });
    return mal;
  })();
  const completo = Object.keys(coloc).length === caso.personas.length;
  const comprobar = () => {
    const bien = caso.pos.every((c, p) => coloc[p] === c);
    if (bien) acusarA(caso.asesino);
    else setAviso({ t: conflictos.size ? 'Hay dos personas en la misma fila o columna.' : 'Algo no cuadra con las pistas. Revísalo.', k: Math.random(), tipo: 'error' });
  };
  const acusarA = (p) => {
    const segundos = Math.round((Date.now() - inicio) / 1000);
    const gana = p === caso.asesino;
    if (reto) { setAcusar(false); reto.onFin(gana, segundos); return; }
    if (gana) setNuevoRecord(registrar(segundos, {}, { menorEsMejor: true }));
    setResultado({ gana, segundos, acusado: p }); setAcusar(false); setFase('fin');
  };

  return (
    <div className="crm-contenedor qq-en-partida">
      <section className="game uj-escena">
        <CabeceraPartida onSalir={() => setSalir(true)} chips={[<>🔎 {NIVELES[nivel].nombre}</>, <><Icon name="clock" size={14} /> {mmss(Math.round((Date.now() - inicio) / 1000))}</>]}>
          <p className="crm-mision">¿Quién mató a <b>Víctor</b>? Solo el asesino estaba en su habitación.</p>
        </CabeceraPartida>

        {/* En el móvil caben a la vez: personas, plano y pistas (con su propio scroll) */}
        <div className="crm-personas">
          {caso.personas.map((per, p) => (
            <button key={per.nombre} type="button" className={`crm-persona${sel === p && modo === 'colocar' ? ' sel' : ''}${coloc[p] != null ? ' puesta' : ''}${conflictos.has(p) ? ' mal' : ''}${per.victima ? ' victima' : ''}`}
              onClick={() => { setSel(p); setModo('colocar'); }}>
              <span>{per.e}</span>{per.nombre}
            </button>
          ))}
          <button type="button" className={`crm-persona tachar${modo === 'tachar' ? ' sel' : ''}`} onClick={() => setModo(modo === 'tachar' ? 'colocar' : 'tachar')}><span>✖</span>Tachar</button>
        </div>

        <div className="crm-zona">
          <Tablero caso={caso} coloc={coloc} enCelda={enCelda} tachadas={tachadas} onTocar={tocar} conflictos={conflictos} />
          <div className="uj-tarjeta crm-pistas">
            <p className="uj-etiqueta">Pistas · toca para marcarlas</p>
            <ul>
              {caso.pistas.map((q, i) => (
                <li key={q} className={pistasHechas[i] ? 'hecha' : ''} onClick={() => setPistasHechas((x) => ({ ...x, [i]: !x[i] }))}>{q}</li>
              ))}
              <li className="regla">Una persona por fila y por columna. Nadie encima de 🍽️ 📚 🪴.</li>
            </ul>
          </div>
        </div>

        <div className="crm-acciones">
          <button type="button" className="uj-boton grande" disabled={!completo} onClick={comprobar}><Icon name="check" size={20} /> Comprobar</button>
          <button type="button" className="uj-boton secundario" onClick={() => setAcusar(true)}>🫵 Acusar</button>
        </div>
      </section>
      {acusar && (
        <div className="rg-modal-fondo" onClick={() => setAcusar(false)}>
          <div className="rg-modal uj-modal" onClick={(e) => e.stopPropagation()}>
            <div className="uj-modal-icono">🫵</div>
            <h3>¿Quién es el asesino?</h3>
            <p className="hint">Si te equivocas, el caso se cierra sin resolver.</p>
            <div className="crm-sospechosos">
              {caso.personas.map((per, p) => !per.victima && <button key={per.nombre} type="button" className="crm-persona" onClick={() => acusarA(p)}><span>{per.e}</span>{per.nombre}</button>)}
            </div>
            <button type="button" className="uj-enlace" onClick={() => setAcusar(false)}>Seguir investigando</button>
          </div>
        </div>
      )}
      <Aviso texto={aviso.t} clave={aviso.k} tipo={aviso.tipo} />
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} texto={reto ? 'Si sales, el reto de hoy contará como fallado.' : undefined} />}
    </div>
  );
}

function Tablero({ caso, enCelda, tachadas, onTocar, conflictos, resuelto }) {
  const { n, sala, mueble, salas, colores, personas } = caso;
  const etiquetada = new Set();
  return (
    <div className="crm-tablero" style={{ '--n': n }}>
      <span />
      {Array.from({ length: n }, (_, k) => <span key={k} className="crm-coord">{COLUMNAS[k]}</span>)}
      {Array.from({ length: n }, (_, f) => (
        <React.Fragment key={f}>
          <span className="crm-coord">{f + 1}</span>
          {Array.from({ length: n }, (_, k) => {
            const c = f * n + k; const s = sala[c];
            const borde = (d) => (d < 0 || d >= n * n || sala[d] !== s);
            const st = {
              background: colores[s],
              borderTopWidth: f === 0 || borde(c - n) ? 3 : 1, borderBottomWidth: f === n - 1 || borde(c + n) ? 3 : 1,
              borderLeftWidth: k === 0 || borde(c - 1) || c % n === 0 ? 3 : 1, borderRightWidth: k === n - 1 || borde(c + 1) ? 3 : 1
            };
            const p = enCelda[c];
            const nombreSala = !etiquetada.has(s) && (etiquetada.add(s), salas[s]);
            const m = mueble[c];
            return (
              <button key={c} type="button" className={`crm-celda${m && MUEBLES[m].bloquea ? ' bloqueada' : ''}${tachadas[c] ? ' tachada' : ''}${p != null && conflictos?.has(p) ? ' mal' : ''}${resuelto && p === caso.asesino ? ' asesino' : ''}`}
                style={st} onClick={onTocar ? () => onTocar(c) : undefined} disabled={!onTocar}>
                {nombreSala && <small className="crm-sala">{nombreSala}</small>}
                {m && <i className="crm-mueble">{MUEBLES[m].e}</i>}
                {p != null && <b className={`crm-ficha${personas[p].victima ? ' victima' : ''}`}>{personas[p].e}<em>{personas[p].nombre}</em></b>}
                {tachadas[c] && p == null && <span className="crm-x">✖</span>}
              </button>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

