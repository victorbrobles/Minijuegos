// client/src/games/Ordenalos/Ordenalos.jsx
// Ordénalos sin mirar — cajas con pesos ocultos. Solo puedes comparar dos a la vez en la balanza.
// Ordénalas de la más ligera a la más pesada usando el menor número de pesadas posible.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import {
  PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, Aviso, useRecord, barajar
} from '../../components/UnJugador.jsx';
import './Ordenalos.css';

const ID = 'ordenalos';
const VIDAS = 3;
const LETRAS = 'ABCDEFG';
// Pesadas necesarias en el peor caso para ordenar n elementos (mínimo teórico)
const PRESUPUESTO = { 3: 3, 4: 5, 5: 7, 6: 10, 7: 13 };
const COLORES = ['#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#eab308', '#14b8a6'];

const cajasPara = (ronda) => (ronda < 2 ? 4 : ronda < 4 ? 5 : ronda < 6 ? 6 : 7);

function nuevasCajas(n) {
  const pesos = barajar(Array.from({ length: 30 }, (_, i) => (i + 1) * 3)).slice(0, n);
  return pesos.map((peso, i) => ({ id: i, letra: LETRAS[i], peso, color: COLORES[i] }));
}

export default function Ordenalos() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada'); // portada | pesar | ordenar | resultado | fin
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [ronda, setRonda] = useState(0);
  const [cajas, setCajas] = useState([]);
  const [seleccion, setSeleccion] = useState([]);
  const [pesadas, setPesadas] = useState([]); // { ligera, pesada }
  const [balanza, setBalanza] = useState(null); // { izq, der, gana }
  const [orden, setOrden] = useState([]);
  const [vidas, setVidas] = useState(VIDAS);
  const [estrellas, setEstrellas] = useState(0);
  const [ganadas, setGanadas] = useState(0);
  const [aviso, setAviso] = useState({ texto: '', tipo: 'info', clave: 0 });
  const [nuevoRecord, setNuevoRecord] = useState(false);

  const preparar = (r) => {
    setRonda(r);
    setCajas(nuevasCajas(cajasPara(r)));
    setSeleccion([]);
    setPesadas([]);
    setBalanza(null);
    setOrden([]);
    setFase('pesar');
  };

  const empezar = () => {
    setVidas(VIDAS);
    setEstrellas(0);
    setNuevoRecord(false);
    preparar(0);
  };

  const presupuesto = PRESUPUESTO[cajas.length] || 13;

  const tocarCaja = (c) => {
    if (fase === 'pesar') {
      if (seleccion.includes(c.id)) { setSeleccion(seleccion.filter((x) => x !== c.id)); return; }
      const sel = [...seleccion, c.id];
      if (sel.length < 2) { setSeleccion(sel); return; }
      const [a, b] = sel.map((id) => cajas[id]);
      const pesada = a.peso > b.peso ? a : b;
      const ligera = a.peso > b.peso ? b : a;
      setBalanza({ izq: a, der: b, gana: pesada.id });
      setPesadas((p) => [...p, { ligera: ligera.letra, pesada: pesada.letra }]);
      setSeleccion([]);
    } else if (fase === 'ordenar') {
      if (orden.includes(c.id)) setOrden(orden.filter((x) => x !== c.id));
      else setOrden([...orden, c.id]);
    }
  };

  const comprobar = () => {
    const correcto = [...cajas].sort((a, b) => a.peso - b.peso).map((c) => c.id);
    const ok = orden.every((id, i) => id === correcto[i]);
    let e = 0;
    if (ok) {
      e = pesadas.length <= presupuesto ? 3 : pesadas.length <= presupuesto + 2 ? 2 : 1;
      setEstrellas((s) => s + e);
    } else {
      setVidas((v) => v - 1);
      if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
    }
    setGanadas(ok ? e : -1);
    setFase('resultado');
  };

  const siguiente = () => {
    if (vidas <= 0) {
      setNuevoRecord(estrellas > 0 && registrar(estrellas));
      setFase('fin');
      return;
    }
    preparar(ganadas > 0 ? ronda + 1 : ronda);
  };

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Cada caja tiene un peso <strong>secreto</strong>. Tienes que ordenarlas de la más <strong>ligera</strong> a la más <strong>pesada</strong>.</p>
      <ul>
        <li>Toca dos cajas para ponerlas en la <strong>balanza</strong>: verás cuál pesa más (pero no cuánto).</li>
        <li>Las pesadas quedan apuntadas. Usa la lógica: si A &lt; B y B &lt; C, no hace falta comparar A y C.</li>
        <li>Cuando lo tengas, pulsa <strong>Ordenar</strong>, toca las cajas en orden y comprueba.</li>
        <li>⭐⭐⭐ si no pasas del número de pesadas marcado, ⭐⭐ con hasta 2 más y ⭐ si te pasas más. Si el orden está mal pierdes una vida.</li>
      </ul>
    </AyudaUnJugador>
  );

  if (fase === 'portada') {
    return (
      <div className="or-contenedor">
        <PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record}
          textoRecord={(r) => `${r.valor} ⭐`} />
        {ayudaModal}
      </div>
    );
  }

  if (fase === 'fin') {
    return (
      <div className="or-contenedor">
        <FinUnJugador
          icono="scale"
          etiqueta="Te has quedado sin vidas"
          titulo={estrellas >= 24 ? '¡Balanza humana!' : estrellas >= 12 ? '¡Muy lógico!' : 'Fin de la partida'}
          puntos={estrellas}
          unidad="estrellas"
          nuevoRecord={nuevoRecord}
          record={record}
          textoRecord={(r) => `${r.valor} estrellas`}
          exito={estrellas > 0}
          onRepetir={empezar}
          onMenu={() => setFase('portada')}
        />
      </div>
    );
  }

  const resultado = fase === 'resultado';
  const correcto = [...cajas].sort((a, b) => a.peso - b.peso);

  return (
    <div className="or-contenedor qq-en-partida">
      <Aviso {...aviso} />
      <section className="game uj-escena">
        <CabeceraPartida
          onSalir={() => setSalir(true)}
          chips={[
            <>⭐ {estrellas}</>,
            <>{Array.from({ length: VIDAS }, (_, i) => (i < vidas ? '❤️' : '🖤')).join('')}</>
          ]}
          titulo={fase === 'pesar' ? 'Pesa las cajas de dos en dos' : fase === 'ordenar' ? 'Toca las cajas de ligera a pesada' : ganadas > 0 ? '¡Orden correcto!' : 'Orden incorrecto'}
        >
          <div className="or-contador">
            <span>Pesadas: <strong>{pesadas.length}</strong></span>
            <span className={pesadas.length > presupuesto ? 'pasado' : ''}>Objetivo: {presupuesto} o menos</span>
          </div>
        </CabeceraPartida>

        {fase === 'pesar' && (
          <div className={`or-balanza${balanza ? (balanza.gana === balanza.izq.id ? ' izq' : ' der') : ''}`} key={pesadas.length}>
            <div className="or-brazo">
              <span className="or-plato">{balanza ? <b style={{ background: balanza.izq.color }}>{balanza.izq.letra}</b> : <em>?</em>}</span>
              <span className="or-plato">{balanza ? <b style={{ background: balanza.der.color }}>{balanza.der.letra}</b> : <em>?</em>}</span>
            </div>
            <div className="or-pie" />
            {balanza && (
              <p className="or-veredicto">
                {cajas[balanza.gana].letra} pesa más que {balanza.gana === balanza.izq.id ? balanza.der.letra : balanza.izq.letra}
              </p>
            )}
          </div>
        )}

        <div className="or-cajas">
          {cajas.map((c) => {
            const pos = orden.indexOf(c.id);
            return (
              <button
                key={c.id}
                type="button"
                className={`or-caja${seleccion.includes(c.id) ? ' elegida' : ''}${pos >= 0 ? ' colocada' : ''}`}
                style={{ '--c': c.color }}
                onClick={() => tocarCaja(c)}
                disabled={resultado}
              >
                <span className="or-letra">{c.letra}</span>
                {resultado ? <span className="or-peso">{c.peso} kg</span> : <span className="or-peso">📦</span>}
                {pos >= 0 && <span className="or-num">{pos + 1}</span>}
              </button>
            );
          })}
        </div>

        {(fase === 'ordenar' || resultado) && (
          <div className="or-fila-orden">
            <span>Ligera</span>
            {cajas.map((_, i) => {
              const c = cajas[orden[i]];
              const bien = resultado && c && correcto[i].id === c.id;
              return (
                <span key={i} className={`or-hueco${c ? ' lleno' : ''}${resultado ? (bien ? ' bien' : ' mal') : ''}`} style={c ? { '--c': c.color } : undefined}>
                  {c ? c.letra : i + 1}
                </span>
              );
            })}
            <span>Pesada</span>
          </div>
        )}

        {resultado && (
          <div className="uj-tarjeta or-resultado">
            {ganadas > 0
              ? <p className="or-estrellas">{'⭐'.repeat(ganadas)}{'☆'.repeat(3 - ganadas)}</p>
              : <p>El orden era: <strong>{correcto.map((c) => c.letra).join(' < ')}</strong></p>}
            <p className="uj-mini">{pesadas.length} pesadas · objetivo {presupuesto}</p>
          </div>
        )}

        {pesadas.length > 0 && !resultado && (
          <div className="or-registro">
            <p className="uj-etiqueta">Lo que sabes</p>
            <div>{pesadas.map((p, i) => <span key={i}>{p.ligera} &lt; {p.pesada}</span>)}</div>
          </div>
        )}

        <div className="uj-acciones">
          {fase === 'pesar' && (
            <button type="button" className="uj-boton grande" onClick={() => { setSeleccion([]); setFase('ordenar'); }} disabled={!pesadas.length}>
              <Icon name="check" size={20} /> Ya lo sé: ordenar
            </button>
          )}
          {fase === 'ordenar' && (
            <>
              <button type="button" className="uj-boton grande exito" onClick={comprobar} disabled={orden.length !== cajas.length}>
                <Icon name="check" size={20} /> Comprobar
              </button>
              <button type="button" className="uj-enlace" onClick={() => { setOrden([]); setFase('pesar'); }}>
                <Icon name="scale" size={16} /> Volver a pesar
              </button>
            </>
          )}
          {resultado && (
            <button type="button" className="uj-boton grande" onClick={siguiente}>
              {vidas <= 0 ? <><Icon name="flagFinish" size={20} /> Ver resultado</> : <><Icon name="forward" size={20} /> {ganadas > 0 ? 'Siguientes cajas' : 'Otras cajas'}</>}
            </button>
          )}
        </div>
      </section>
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
