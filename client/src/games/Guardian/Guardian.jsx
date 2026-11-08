// client/src/games/Guardian/Guardian.jsx
// El Guardián del Puente — elige los objetos que cruzan para que pesen EXACTAMENTE lo pedido,
// respetando las peculiaridades de cada objeto. 3 vidas, cada puente es un poco más difícil.
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import {
  PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, Aviso, Barra, useRecord
} from '../../components/UnJugador.jsx';
import { generarReto, evaluar } from './motor.js';
import './Guardian.css';

const ID = 'guardian';
const VIDAS = 3;

export default function Guardian() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada'); // portada | juego | cruzado | fin
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [nivel, setNivel] = useState(1);
  const [reto, setReto] = useState(null);
  const [sel, setSel] = useState([]);
  const [vidas, setVidas] = useState(VIDAS);
  const [restante, setRestante] = useState(60);
  const [aviso, setAviso] = useState({ texto: '', tipo: 'malo', clave: 0 });
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [motivoFin, setMotivoFin] = useState('');
  const finRef = useRef(0);
  const vidasRef = useRef(VIDAS);
  const nivelRef = useRef(1);

  const preparar = (nv) => {
    const r = generarReto(nv);
    setReto(r);
    setSel(r.objetos.map(() => false));
    finRef.current = Date.now() + r.segundos * 1000;
    setRestante(r.segundos);
    setFase('juego');
  };

  const empezar = () => {
    setNivel(1);
    nivelRef.current = 1;
    setVidas(VIDAS);
    vidasRef.current = VIDAS;
    setNuevoRecord(false);
    preparar(1);
  };

  const terminar = (cruzados, motivo) => {
    setMotivoFin(motivo);
    setNuevoRecord(cruzados > 0 && registrar(cruzados));
    setFase('fin');
  };

  const perderVida = (texto) => {
    const quedan = vidasRef.current - 1;
    vidasRef.current = quedan;
    setVidas(quedan);
    setAviso((a) => ({ texto, tipo: 'malo', clave: a.clave + 1 }));
    if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
    if (quedan <= 0) terminar(nivelRef.current - 1, texto);
    return quedan;
  };

  // Reloj
  useEffect(() => {
    if (fase !== 'juego') return undefined;
    const id = setInterval(() => {
      const r = (finRef.current - Date.now()) / 1000;
      if (r <= 0) {
        clearInterval(id);
        const quedan = perderVida('¡Se acabó el tiempo! El puente se cierra.');
        if (quedan > 0) preparar(nivelRef.current);
      } else setRestante(r);
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, reto]);

  const cruzar = () => {
    const ev = evaluar(reto, sel);
    if (!sel.some(Boolean)) return;
    if (ev.rota) {
      perderVida(`¡Regla rota! ${ev.rota.texto}`);
      return;
    }
    if (ev.peso !== reto.objetivo) {
      perderVida(`Pesaba ${ev.peso} kg y el puente pedía ${reto.objetivo} kg.`);
      return;
    }
    setAviso((a) => ({ texto: `¡Exacto! ${reto.objetivo} kg justos.`, tipo: 'bueno', clave: a.clave + 1 }));
    setFase('cruzado');
  };

  const toggle = (i) => fase === 'juego' && setSel((s) => s.map((v, k) => (k === i ? !v : v)));

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Eres el guardián de un puente mágico: solo se abre si lo que cruza pesa <strong>exactamente</strong> lo que pide.</p>
      <ul>
        <li>Toca los objetos que quieras que crucen y pulsa <strong>¡Que crucen!</strong></li>
        <li>Lee bien las <strong>peculiaridades</strong>: hay objetos que no pueden ir juntos, que se empapan y pesan el doble, que se comen a otros…</li>
        <li>El globo de helio <strong>resta</strong> peso.</li>
        <li>No verás el peso total: haz la cuenta tú. Cada error o quedarte sin tiempo cuesta una vida.</li>
      </ul>
    </AyudaUnJugador>
  );

  if (fase === 'portada') {
    return (
      <div className="gd-contenedor">
        <PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record}
          textoRecord={(r) => `${r.valor} ${r.valor === 1 ? 'puente' : 'puentes'}`} />
        {ayudaModal}
      </div>
    );
  }

  if (fase === 'fin') {
    const cruzados = nivel - 1;
    return (
      <div className="gd-contenedor">
        <Aviso {...aviso} />
        <FinUnJugador
          icono="landmark"
          etiqueta="El puente se ha cerrado"
          titulo={cruzados >= 10 ? '¡Guardián legendario!' : cruzados >= 5 ? '¡Gran guardián!' : 'Fin del turno'}
          puntos={cruzados}
          unidad={cruzados === 1 ? 'puente superado' : 'puentes superados'}
          nuevoRecord={nuevoRecord}
          record={record}
          textoRecord={(r) => `${r.valor} puentes`}
          exito={cruzados > 0}
          onRepetir={empezar}
          onMenu={() => setFase('portada')}
        >
          {motivoFin && <p className="uj-mini">{motivoFin}</p>}
        </FinUnJugador>
      </div>
    );
  }

  const cruzado = fase === 'cruzado';
  const numSel = sel.filter(Boolean).length;

  return (
    <div className="gd-contenedor qq-en-partida">
      <Aviso {...aviso} />
      <section className="game uj-escena">
        <CabeceraPartida
          onSalir={() => setSalir(true)}
          chips={[
            <><Icon name="flag" size={14} /> Puente {nivel}</>,
            <>{Array.from({ length: VIDAS }, (_, i) => (i < vidas ? '❤️' : '🖤')).join('')}</>
          ]}
        >
          <div className="gd-objetivo">
            <span>El puente pide</span>
            <strong>{reto.objetivo} kg</strong>
          </div>
        </CabeceraPartida>

        {!cruzado && <Barra valor={restante / reto.segundos} etiqueta={`${Math.ceil(restante)} s`} invertida peligroDesde={0.75} />}

        <div className={`gd-puente${cruzado ? ' abierto' : ''}`} aria-hidden="true">
          <div className="gd-carga">
            {reto.objetos.map((o, i) => (sel[i] ? <span key={o.id}>{o.emoji}</span> : null))}
            {!numSel && <em>Elige qué cruza…</em>}
          </div>
          <div className="gd-tablero" />
        </div>

        <div className="gd-objetos">
          {reto.objetos.map((o, i) => (
            <button key={o.id} type="button" className={`gd-objeto${sel[i] ? ' activo' : ''}${o.globo ? ' globo' : ''}`} onClick={() => toggle(i)} aria-pressed={sel[i]}>
              <span className="gd-emoji">{o.emoji}</span>
              <span className="gd-nombre">{o.nombre}</span>
              <span className="gd-peso">{o.peso} kg</span>
            </button>
          ))}
        </div>

        <div className="uj-tarjeta gd-reglas">
          <p className="uj-etiqueta"><Icon name="book" size={14} /> Peculiaridades de hoy</p>
          <ul>
            {reto.objetos.some((o) => o.globo) && <li>El globo de helio tira hacia arriba: <strong>resta</strong> su peso.</li>}
            {reto.reglas.map((r, k) => <li key={k}>{r.texto}</li>)}
          </ul>
        </div>

        <div className="uj-acciones">
          {cruzado ? (
            <button type="button" className="uj-boton grande exito" onClick={() => { nivelRef.current = nivel + 1; setNivel(nivel + 1); preparar(nivel + 1); }}>
              <Icon name="forward" size={20} /> Siguiente puente
            </button>
          ) : (
            <button type="button" className="uj-boton grande" disabled={!numSel} onClick={cruzar}>
              <Icon name="landmark" size={20} /> ¡Que crucen! ({numSel})
            </button>
          )}
        </div>
      </section>
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
