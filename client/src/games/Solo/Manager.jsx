// client/src/games/Solo/Manager.jsx
// «Manager por un día» (1 jugador): con 220 M€ ficha un once (1 portero, 4 defensas, 3 medios y 3 delanteros) en
// tres mercados de 12 ofertas. La media de cada futbolista está oculta: tu ojo de ojeador decide. Después se simula
// una liga de 20 equipos a 38 jornadas. Puntos = puntos en la liga.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, useRecord, Aviso } from '../../components/UnJugador.jsx';
import { cargarSolo, Cargando } from './comun.jsx';
import './Solo.css';

const ID = 'manager';
export const HUECOS = { POR: 1, DEF: 4, MED: 3, DEL: 3 };
const NOMBRE_POS = { POR: 'Portero', DEF: 'Defensa', MED: 'Medio', DEL: 'Delantero' };
const CANTERANO = 60;
const fmt = (n) => `${n.toLocaleString('es-ES')} M€`;

function poisson(l) { let k = 0; let p = Math.exp(-l); let s = p; const u = Math.random(); while (u > s && k < 9) { k++; p *= l / k; s += p; } return k; }
/** Liga a doble vuelta entre equipos { nombre, fuerza }. Devuelve la clasificación ordenada. */
export function simularLiga(equipos) {
  const t = equipos.map((e) => ({ ...e, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0 }));
  for (let a = 0; a < t.length; a++) {
    for (let b = 0; b < t.length; b++) {
      if (a === b) continue;
      const la = 1.2 * Math.exp((t[a].fuerza - t[b].fuerza) * 0.055) + 0.2;
      const lb = 1.2 * Math.exp((t[b].fuerza - t[a].fuerza) * 0.055);
      const ga = poisson(la); const gb = poisson(lb);
      for (const [x, gf, gc] of [[t[a], ga, gb], [t[b], gb, ga]]) {
        x.pj++; x.gf += gf; x.gc += gc;
        if (gf > gc) { x.g++; x.pts += 3; } else if (gf === gc) { x.e++; x.pts += 1; } else x.p++;
      }
    }
  }
  return t.sort((x, y) => y.pts - x.pts || (y.gf - y.gc) - (x.gf - x.gc) || y.gf - x.gf);
}

export default function Manager() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada'); // portada | cargando | mercado | simulando | fin
  const [error, setError] = useState('');
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [datos, setDatos] = useState(null);
  const [mercado, setMercado] = useState(0);
  const [plantilla, setPlantilla] = useState([]);
  const [dinero, setDinero] = useState(0);
  const [tabla, setTabla] = useState(null);
  const [aviso, setAviso] = useState({ t: '', k: 0 });

  const empezar = async () => {
    setFase('cargando'); setError('');
    try {
      const d = await cargarSolo(ID);
      setDatos(d); setMercado(0); setPlantilla([]); setDinero(d.presupuesto); setTabla(null); setFase('mercado');
    } catch (e) { setError(e.message); }
  };
  const cuantos = (pos) => plantilla.filter((j) => j.pos === pos).length;
  const fichar = (j) => {
    if (plantilla.includes(j)) { setPlantilla(plantilla.filter((x) => x !== j)); setDinero(dinero + j.precio); return; }
    if (cuantos(j.pos) >= HUECOS[j.pos]) { setAviso({ t: `Ya tienes ${HUECOS[j.pos] === 1 ? 'portero' : `los ${HUECOS[j.pos]} ${NOMBRE_POS[j.pos].toLowerCase()}s`}`, k: Date.now(), tipo: 'malo' }); return; }
    if (j.precio > dinero) { setAviso({ t: 'No te llega el dinero', k: Date.now(), tipo: 'malo' }); return; }
    setPlantilla([...plantilla, j]); setDinero(dinero - j.precio);
  };
  const seguir = () => {
    if (mercado < 2) { setMercado(mercado + 1); return; }
    // Huecos sin cubrir: canteranos
    const once = [...plantilla];
    for (const [pos, n] of Object.entries(HUECOS)) for (let i = once.filter((j) => j.pos === pos).length; i < n; i++) once.push({ nombre: `Canterano (${NOMBRE_POS[pos]})`, pos, precio: 0, m: CANTERANO, canterano: true });
    setPlantilla(once);
    const fuerza = once.reduce((a, j) => a + j.m, 0) / once.length;
    const t = simularLiga([{ nombre: 'Tu equipo', fuerza, yo: true }, ...datos.rivales]);
    setTabla(t); setFase('simulando');
    setTimeout(() => {
      const yo = t.find((x) => x.yo);
      setNuevoRecord(registrar(yo.pts)); setFase('fin');
    }, 2200);
  };

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Eres el nuevo mánager. Con <b>220 M€</b> tienes que fichar un once: <b>1 portero, 4 defensas, 3 medios y 3 delanteros</b>.</p>
      <p>Hay <b>3 mercados</b> con 12 ofertas cada uno. Ves el nombre, el puesto, la edad, el club y el precio… pero <b>no su media</b>: ahí entra tu ojo de ojeador. Los jóvenes con potencial rinden algo más y los veteranos, algo menos.</p>
      <p>Si al final te falta algún puesto, lo cubrirá un canterano (media {CANTERANO}).</p>
      <p>Después se juega una <b>liga de 20 equipos a 38 jornadas</b>. Tu puntuación son los puntos que sumes.</p>
    </AyudaUnJugador>
  );
  if (fase === 'portada') return <><PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record} textoRecord={(r) => `${r.valor} puntos en liga`} />{ayudaModal}</>;
  if (fase === 'cargando') return <Cargando error={error} onReintentar={empezar} />;
  if (fase === 'simulando') {
    return <section className="game uj-escena rto-escena"><div className="uj-tarjeta sl-centro mg-simulando"><span>⚽</span><p>Simulando la temporada…</p><small>38 jornadas · 380 partidos</small></div></section>;
  }
  if (fase === 'fin') {
    const pos = tabla.findIndex((x) => x.yo) + 1; const yo = tabla[pos - 1];
    const mejor = plantilla.filter((j) => !j.canterano).sort((a, b) => b.m - a.m)[0];
    const ganga = plantilla.filter((j) => !j.canterano && j.precio > 0).sort((a, b) => b.m / b.precio - a.m / a.precio)[0];
    return (
      <FinUnJugador icono="trophy" etiqueta={`${pos}.º de 20 · ${yo.g}G ${yo.e}E ${yo.p}P`} titulo={pos === 1 ? '¡Campeones de liga!' : pos <= 4 ? '¡A la Champions!' : pos <= 10 ? 'Temporada tranquila' : pos <= 17 ? 'Sufriendo hasta el final' : 'Descenso…'}
        puntos={yo.pts} unidad="puntos en liga" nuevoRecord={nuevoRecord} record={record} textoRecord={(r) => `${r.valor} puntos en liga`}
        exito={pos <= 10} onRepetir={empezar} onMenu={() => setFase('portada')}>
        <table className="mg-tabla">
          <tbody>
            {tabla.map((x, i) => (i < 5 || x.yo || i === tabla.length - 1 ? (
              <tr key={x.nombre} className={x.yo ? 'yo' : ''}><td>{i + 1}</td><td>{x.nombre}</td><td>{x.gf}:{x.gc}</td><td><b>{x.pts}</b></td></tr>
            ) : null))}
          </tbody>
        </table>
        <ul className="mg-plantilla">
          {plantilla.map((j) => <li key={j.nombre}><span>{j.pos}</span><b>{j.nombre}</b><em>{j.m}</em></li>)}
        </ul>
        {mejor && <p className="uj-mini">⭐ Tu mejor jugador: {mejor.nombre} ({mejor.m}){ganga && ganga !== mejor ? ` · 💰 Mejor fichaje: ${ganga.nombre} (${ganga.m} por ${fmt(ganga.precio)})` : ''}</p>}
      </FinUnJugador>
    );
  }

  const ofertas = datos.mercados[mercado];
  const completo = Object.entries(HUECOS).every(([p, n]) => cuantos(p) >= n);
  return (
    <div className="qq-en-partida">
      <section className="game uj-escena rto-escena">
        <CabeceraPartida onSalir={() => setSalir(true)} chips={[<>🏪 Mercado {mercado + 1}/3</>, <>💰 {fmt(dinero)}</>, <>👕 {plantilla.length}/11</>]}>
          <div className="mg-huecos">
            {Object.entries(HUECOS).map(([p, n]) => <span key={p} className={cuantos(p) >= n ? 'ok' : ''}>{p} {cuantos(p)}/{n}</span>)}
          </div>
        </CabeceraPartida>
        <div className="rto-juego">
          <div className="mg-ofertas">
            {ofertas.map((j) => {
              const mio = plantilla.includes(j);
              const imposible = !mio && (cuantos(j.pos) >= HUECOS[j.pos] || j.precio > dinero);
              return (
                <button key={j.nombre} type="button" className={`mg-oferta${mio ? ' mio' : ''}${imposible ? ' no' : ''}`} onClick={() => fichar(j)}>
                  <span className={`mg-pos ${j.pos}`}>{j.pos}</span>
                  <b>{j.nombre}</b>
                  <small>{j.club} · {j.edad} años · {j.pais}</small>
                  <em>{mio ? '✓ Fichado' : fmt(j.precio)}</em>
                </button>
              );
            })}
          </div>
          {plantilla.length > 0 && <p className="sl-nota sl-blanco">Tu plantilla: {plantilla.map((j) => j.nombre).join(', ')}</p>}
          <button type="button" className="uj-boton grande" onClick={seguir}>
            {mercado < 2 ? <><Icon name="forward" size={20} /> Cerrar mercado {mercado + 1}</> : <><Icon name="play" size={20} /> {completo ? '¡A jugar la liga!' : 'Jugar la liga (con canteranos)'}</>}
          </button>
        </div>
      </section>
      <Aviso texto={aviso.t} clave={aviso.k} tipo={aviso.tipo} duracion={1500} />
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
