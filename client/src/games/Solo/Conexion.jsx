// client/src/games/Solo/Conexion.jsx
// «Conexión» (1 jugador): une a dos futbolistas a través de compañeros de equipo. Escribe un jugador que haya
// coincidido con el último de la cadena; cuando el último coincida con el destino, la cadena se cierra sola.
// 5 retos (los dos primeros se pueden cerrar con 1 eslabón; los demás, con 2). Puntos: 5 por reto, −1 por cada
// eslabón de más, por cada intento fallido y por la pista.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, useRecord, Aviso } from '../../components/UnJugador.jsx';
import { cargarSolo, Cargando, Buscador } from './comun.jsx';
import './Solo.css';

const ID = 'conexion';
const MAX_ESLABONES = 5;
const comprobar = (a, b) => fetch('/api/solo/conexion/enlace', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ a, b }) }).then((r) => r.json());

export default function Conexion() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada');
  const [error, setError] = useState('');
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [datos, setDatos] = useState(null);
  const [k, setK] = useState(0);
  const [cadena, setCadena] = useState([]); // [{ nombre, motivo }]
  const [fallos, setFallos] = useState(0);
  const [pista, setPista] = useState(false);
  const [estado, setEstado] = useState('jugando'); // jugando | hecho | rendido
  const [puntosReto, setPuntosReto] = useState([]);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState({ t: '', k: 0 });

  const empezar = async () => {
    setFase('cargando'); setError('');
    try {
      const d = await cargarSolo(ID);
      setDatos(d); setK(0); setPuntosReto([]); iniciar(d.retos[0]); setFase('jugando');
    } catch (e) { setError(e.message); }
  };
  function iniciar(r) { setCadena([{ nombre: r.desde, motivo: null }]); setFallos(0); setPista(false); setEstado('jugando'); }
  const reto = datos?.retos[k];
  const total = puntosReto.reduce((a, b) => a + b, 0);

  const cerrar = (cad, f = fallos, p = pista) => {
    const extra = Math.max(0, cad.length - 2 - reto.eslabones);
    const pts = Math.max(1, 5 - extra - f - (p ? 1 : 0));
    setPuntosReto((l) => [...l, pts]); setEstado('hecho');
    setAviso({ t: `🔗 ¡Conectados! +${pts}`, k: Date.now(), tipo: 'bueno' });
  };
  const añadir = async (texto) => {
    if (ocupado || estado !== 'jugando') return;
    if (cadena.length - 1 >= MAX_ESLABONES) { setAviso({ t: `Máximo ${MAX_ESLABONES} eslabones: quita alguno`, k: Date.now(), tipo: 'malo' }); return; }
    setOcupado(true);
    try {
      const ultimo = cadena.at(-1).nombre;
      const r = await comprobar(ultimo, texto);
      if (r.error) { setAviso({ t: r.error, k: Date.now(), tipo: 'malo' }); return; }
      if (cadena.some((c) => c.nombre === r.nombre)) { setAviso({ t: 'Ese ya está en la cadena', k: Date.now() }); return; }
      if (!r.ok) { setFallos((f) => f + 1); setAviso({ t: `✗ ${ultimo} y ${r.nombre} no coincidieron (en mis datos) · −1`, k: Date.now(), tipo: 'malo' }); return; }
      let cad = [...cadena, { nombre: r.nombre, motivo: r.motivo }];
      if (r.nombre === reto.hasta) { setCadena(cad); cerrar(cad); return; }
      const fin = await comprobar(r.nombre, reto.hasta);
      if (fin.ok) cad = [...cad, { nombre: reto.hasta, motivo: fin.motivo }];
      setCadena(cad);
      if (fin.ok) cerrar(cad);
    } catch { setAviso({ t: 'Sin conexión con el servidor', k: Date.now(), tipo: 'malo' }); } finally { setOcupado(false); }
  };
  const siguiente = () => {
    if (k + 1 >= datos.retos.length) { setNuevoRecord(total > 0 && registrar(total)); setFase('fin'); return; }
    setK(k + 1); iniciar(datos.retos[k + 1]);
  };
  const rendirse = () => { setPuntosReto((l) => [...l, 0]); setEstado('rendido'); };

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Tienes que <b>unir a dos futbolistas</b> con una cadena de compañeros de equipo.</p>
      <p>Escribe un jugador que haya coincidido con el último de la cadena (en un club o como titulares en un partido histórico). Cuando el último de tu cadena haya jugado con el destino, ¡la cadena se cierra sola!</p>
      <p>Hay <b>5 retos</b>: los dos primeros se pueden cerrar con un jugador en medio y los demás con dos.</p>
      <p>Cada reto vale <b>5 puntos</b>: restan los eslabones de más, los intentos fallidos y la pista. Si te rindes, 0.</p>
      <p>Ojo: solo valen las coincidencias que hay en los datos del juego (los grandes partidos y trayectorias de la web y las plantillas de 2025/26).</p>
    </AyudaUnJugador>
  );
  if (fase === 'portada') return <><PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record} textoRecord={(r) => `${r.valor} puntos`} />{ayudaModal}</>;
  if (fase === 'cargando') return <Cargando error={error} onReintentar={empezar} />;
  if (fase === 'fin') {
    return (
      <FinUnJugador icono="trophy" etiqueta="Fin de los 5 retos" titulo={total >= 20 ? '¡Agenda de oro!' : total >= 12 ? '¡Muy bien conectado!' : 'Fin de la partida'}
        puntos={total} unidad="puntos" nuevoRecord={nuevoRecord} record={record} textoRecord={(r) => `${r.valor} puntos`}
        exito={total > 0} onRepetir={empezar} onMenu={() => setFase('portada')}>
        <p className="uj-mini">{puntosReto.map((p, i) => `Reto ${i + 1}: ${p}`).join(' · ')}</p>
      </FinUnJugador>
    );
  }

  const mostrar = estado === 'rendido' ? reto.solucion : cadena;
  const abierta = estado === 'jugando';
  return (
    <div className="qq-en-partida">
      <section className="game uj-escena rto-escena">
        <CabeceraPartida onSalir={() => setSalir(true)} chips={[<><Icon name="star" size={14} /> {total} pts</>, <>🔗 Reto {k + 1}/5</>, <>✗ {fallos}</>]}>
          <p className="cx-objetivo">De <b>{reto.desde}</b> a <b>{reto.hasta}</b> <small>({reto.eslabones === 1 ? 'se puede con 1 jugador en medio' : 'se puede con 2 jugadores en medio'})</small></p>
        </CabeceraPartida>
        <div className="rto-juego">
          <ol className="cx-cadena">
            {mostrar.map((c, i) => (
              <li key={c.nombre + i} className={i === 0 || c.nombre === reto.hasta ? 'extremo' : ''}>
                {c.motivo && <small className="cx-motivo">🤝 {c.motivo}</small>}
                <b>{c.nombre}</b>
              </li>
            ))}
            {abierta && <li className="cx-hueco">❔ … ❔</li>}
            {abierta && <li className="extremo"><b>{reto.hasta}</b></li>}
          </ol>
          {estado === 'rendido' && <p className="sl-nota sl-blanco">Una solución posible ↑</p>}
          {abierta && (
            <div className="uj-tarjeta">
              <p className="sl-nota">¿Quién jugó con <b>{cadena.at(-1).nombre}</b>?</p>
              <Buscador lista={datos.nombres} onElegir={añadir} deshabilitado={ocupado} placeholder="Escribe un futbolista…" />
              {pista && <p className="op-pista" style={{ marginTop: '0.5rem' }}>💡 Un camino pasa por <b>{reto.solucion[1].nombre}</b>.</p>}
              <div className="sl-fila" style={{ marginTop: '0.6rem' }}>
                {cadena.length > 1 && <button type="button" className="uj-boton secundario" onClick={() => setCadena(cadena.slice(0, -1))}>↩ Quitar último</button>}
                {!pista && <button type="button" className="uj-boton secundario" onClick={() => setPista(true)}>💡 Pista (−1)</button>}
              </div>
            </div>
          )}
          {abierta ? <button type="button" className="uj-boton secundario" onClick={rendirse}>🏳️ Me rindo</button>
            : <button type="button" className="uj-boton grande" onClick={siguiente}><Icon name="forward" size={20} /> {k + 1 >= datos.retos.length ? 'Ver resultado' : 'Siguiente reto'}</button>}
        </div>
      </section>
      <Aviso texto={aviso.t} clave={aviso.k} tipo={aviso.tipo} duracion={2000} />
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
