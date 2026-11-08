// client/src/games/Excusas/Excusas.jsx
// Excusas a Domicilio — tu jefe te pregunta por chat y tú montas excusas con fichas.
// Todo vale… salvo contradecir lo que el jefe ya sabe de ti o repetirte. Aguanta 10 días.
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import {
  PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, Barra, useRecord
} from '../../components/UnJugador.jsx';
import { HECHOS, REACCIONES_OK, AVISOS_JEFE } from './datos.js';
import { DIAS, nuevaPartida, generarOpciones, evaluar, avanzar } from './motor.js';
import './Excusas.css';

const ID = 'excusas';
const azar = (l) => l[Math.floor(Math.random() * l.length)];
const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

export default function Excusas() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada'); // portada | juego | fin
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [verFicha, setVerFicha] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [estado, setEstado] = useState(null);
  const [opciones, setOpciones] = useState(null);
  const [eleccion, setEleccion] = useState({ sujeto: null, accion: null, objeto: null });
  const [chat, setChat] = useState([]);
  const [escribiendo, setEscribiendo] = useState(false);
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const chatRef = useRef(null);

  const empezar = () => {
    const e = nuevaPartida();
    setEstado(e);
    setOpciones(generarOpciones(e));
    setEleccion({ sujeto: null, accion: null, objeto: null });
    setChat([
      { de: 'sistema', texto: `Lunes, 9:47 · Llegas tarde. Muy tarde.` },
      { de: 'jefe', texto: e.preguntas[0] }
    ]);
    setNuevoRecord(false);
    setFase('juego');
  };

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [chat, escribiendo]);

  const listo = eleccion.sujeto && eleccion.accion && eleccion.objeto;
  const frase = listo ? `${eleccion.sujeto.texto} ${eleccion.accion} ${eleccion.objeto.texto}.` : '';

  const enviar = () => {
    if (!listo || escribiendo) return;
    const res = evaluar(estado, eleccion.sujeto, eleccion.objeto);
    const sig = avanzar(estado, eleccion.sujeto, eleccion.objeto, res);
    const nuevos = [{ de: 'yo', texto: frase }];
    let reaccion;
    if (res.tipo === 'pillado') reaccion = `¿Perdona? ${HECHOS[res.hecho]} ¿A quién intentas engañar? 😡`;
    else if (res.tipo === 'absurda') reaccion = 'Eso no tiene ni pies ni cabeza. 🙄';
    else if (res.tipo === 'repetida') reaccion = `¿Otra vez con «${res.texto}»? Ya me lo dijiste. 🤨`;
    else reaccion = azar(REACCIONES_OK);
    setChat((c) => [...c, ...nuevos]);
    setEleccion({ sujeto: null, accion: null, objeto: null });
    setEscribiendo(true);
    if (navigator.vibrate && res.tipo !== 'ok') navigator.vibrate([30, 40, 30]);

    setTimeout(() => {
      const mensajes = [{ de: 'jefe', texto: reaccion, tipo: res.tipo }];
      const despedido = sig.credibilidad <= 0;
      const terminado = despedido || sig.dia > DIAS;
      if (!terminado) {
        if (sig.revelado) mensajes.push({ de: 'jefe', texto: `${azar(AVISOS_JEFE)} ${HECHOS[sig.revelado]}`, tipo: 'dato' });
        const d = sig.dia - 1;
        mensajes.push({ de: 'sistema', texto: `${d >= 5 ? 'Semana 2 · ' : ''}${DIAS_SEMANA[d % 5][0].toUpperCase()}${DIAS_SEMANA[d % 5].slice(1)}` });
        mensajes.push({ de: 'jefe', texto: sig.preguntas[(sig.dia - 1) % sig.preguntas.length] });
      }
      setChat((c) => [...c, ...mensajes]);
      setEstado(sig);
      setOpciones(generarOpciones(sig));
      setEscribiendo(false);
      if (terminado) {
        const sobrevividos = despedido ? sig.dia - 2 : DIAS;
        setNuevoRecord(registrar(sobrevividos * 100 + sig.credibilidad, { dias: sobrevividos }));
        setTimeout(() => setFase('fin'), 1400);
      }
    }, 900);
  };

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Tu jefe te escribe por el chat y te pide explicaciones. Monta una <strong>excusa</strong> eligiendo una ficha de cada fila: <em>quién</em>, <em>qué hizo</em> y <em>a qué</em>.</p>
      <ul>
        <li>Cualquier locura vale… mientras <strong>no contradiga lo que el jefe sabe</strong> de ti. Si sabe que no tienes perro, no culpes a tu perro.</li>
        <li>Lo que sabe está en tu <strong>ficha de empleado</strong>, y va descubriendo cosas nuevas.</li>
        <li>Repetir una ficha o decir algo absurdo («mi bici ha roto mi bici») también resta credibilidad.</li>
        <li>Si tu credibilidad llega a 0, te despiden. Aguanta {DIAS} días laborables.</li>
      </ul>
    </AyudaUnJugador>
  );

  if (fase === 'portada') {
    return (
      <div className="ex-contenedor">
        <PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record}
          textoRecord={(r) => (r.dias >= DIAS ? `¡${DIAS} días sin que te despidan! (${r.valor} pts)` : `${r.dias ?? 0} días (${r.valor} pts)`)} textoBoton="Abrir el chat del trabajo" iconoBoton="heartchat" />
        {ayudaModal}
      </div>
    );
  }

  if (fase === 'fin') {
    const despedido = estado.credibilidad <= 0;
    const dias = despedido ? estado.dia - 2 : DIAS;
    return (
      <div className="ex-contenedor">
        <FinUnJugador
          icono={despedido ? 'x' : 'trophy'}
          etiqueta={despedido ? 'Carta de despido' : `${DIAS} días después…`}
          titulo={despedido ? '¡Estás despedido!' : estado.credibilidad >= 80 ? '¡Maestro de las excusas!' : 'Has sobrevivido… por los pelos'}
          puntos={dias * 100 + estado.credibilidad}
          unidad="puntos"
          nuevoRecord={nuevoRecord}
          record={record}
          textoRecord={(r) => `${r.valor} puntos`}
          exito={!despedido}
          onRepetir={empezar}
          onMenu={() => setFase('portada')}
        >
          <p className="uj-mini">{dias} {dias === 1 ? 'día aguantado' : 'días aguantados'} · credibilidad final {estado.credibilidad} %</p>
        </FinUnJugador>
      </div>
    );
  }

  const filas = [
    { clave: 'sujeto', titulo: '¿Quién?', items: opciones.sujetos, texto: (p) => p.texto },
    { clave: 'accion', titulo: '¿Qué hizo?', items: opciones.acciones, texto: (p) => p },
    { clave: 'objeto', titulo: '¿A qué?', items: opciones.objetos, texto: (p) => p.texto }
  ];

  return (
    <div className="ex-contenedor qq-en-partida">
      <section className="game uj-escena">
        <CabeceraPartida
          onSalir={() => setSalir(true)}
          chips={[<><Icon name="clock" size={14} /> Día {Math.min(estado.dia, DIAS)}/{DIAS}</>]}
        >
          <div className="ex-credibilidad">
            <span>Credibilidad</span>
            <Barra valor={estado.credibilidad / 100} etiqueta={`${estado.credibilidad} %`} invertida peligroDesde={0.6} icono="heart" />
          </div>
        </CabeceraPartida>

        <button type="button" className="ex-ficha-boton" onClick={() => setVerFicha(!verFicha)}>
          🗂️ Lo que el jefe sabe de ti ({estado.sabe.length}) <Icon name={verFicha ? 'x' : 'eye'} size={15} />
        </button>
        {verFicha && (
          <ul className="uj-tarjeta ex-ficha">
            {estado.sabe.map((h) => <li key={h}>{HECHOS[h]}</li>)}
          </ul>
        )}

        <div className="ex-movil">
          <div className="ex-movil-cabecera">
            <span className="ex-avatar">👔</span>
            <span><strong>El jefe</strong><small>{escribiendo ? 'escribiendo…' : 'en línea'}</small></span>
          </div>
          <div className="ex-chat" ref={chatRef}>
            {chat.map((m, i) => (
              <div key={i} className={`ex-msg ${m.de}${m.tipo ? ` ${m.tipo}` : ''}`}>{m.texto}</div>
            ))}
            {escribiendo && <div className="ex-msg jefe escribiendo"><i /><i /><i /></div>}
          </div>
        </div>

        <div className="uj-tarjeta ex-constructor">
          {filas.map((f) => (
            <div key={f.clave} className="ex-fila">
              <span className="uj-etiqueta">{f.titulo}</span>
              <div className="ex-fichas">
                {f.items.map((p, i) => {
                  const activo = eleccion[f.clave] === p;
                  return (
                    <button key={i} type="button" className={`ex-pieza ${f.clave}${activo ? ' activa' : ''}`} onClick={() => setEleccion({ ...eleccion, [f.clave]: p })} disabled={escribiendo}>
                      {f.texto(p)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="ex-envio">
            <p className={`ex-previa${listo ? '' : ' vacia'}`}>{listo ? `«${frase}»` : 'Elige una ficha de cada fila…'}</p>
            <button type="button" className="uj-boton" onClick={enviar} disabled={!listo || escribiendo}>
              <Icon name="forward" size={18} /> Enviar
            </button>
          </div>
        </div>
      </section>
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
