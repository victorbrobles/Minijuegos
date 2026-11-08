// client/src/games/Trinchera/Trinchera.jsx
// Trinchera 1914 — gestiona moral, comida, munición y salud de tu compañía con decisiones difíciles.
// Aguanta del 25 de noviembre hasta Navidad. Si un recurso llega a cero, se acabó.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import {
  PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, Aviso, useRecord
} from '../../components/UnJugador.jsx';
import { RECURSOS, FINALES } from './cartas.js';
import { nuevoEstado, robar, decidir, fechaDe, DIAS, MAXIMO, CADA_RACION } from './motor.js';
import './Trinchera.css';

const ID = 'trinchera';

function Puntos({ ef }) {
  return (
    <span className="tn-puntos" aria-hidden="true">
      {RECURSOS.map((r) => {
        const v = ef[r.id];
        if (!v) return null;
        return <span key={r.id} className={`tn-punto${Math.abs(v) >= 2 ? ' grande' : ''}`} title={r.nombre}>{r.emoji}</span>;
      })}
    </span>
  );
}

export default function Trinchera() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada'); // portada | juego | fin
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [estado, setEstado] = useState(null);
  const [cambios, setCambios] = useState({});
  const [clave, setClave] = useState(0);
  const [aviso, setAviso] = useState({ texto: '', tipo: 'info', clave: 0 });
  const [nuevoRecord, setNuevoRecord] = useState(false);

  const empezar = () => {
    setEstado(robar(nuevoEstado()));
    setCambios({});
    setNuevoRecord(false);
    setFase('juego');
  };

  const elegir = (op) => {
    const antes = estado.rec;
    const sig = decidir(estado, op);
    const dif = {};
    RECURSOS.forEach((r) => { const d = sig.rec[r.id] - antes[r.id]; if (d) dif[r.id] = d; });
    setCambios(dif);
    setClave((k) => k + 1);
    if (sig.racion && !sig.fin) setAviso((a) => ({ texto: '🥫 Hoy toca reparto de raciones: −1 de comida', tipo: 'info', clave: a.clave + 1 }));
    setEstado(sig);
    if (sig.fin) {
      const dias = sig.fin.tipo === 'navidad' ? DIAS + 1 : sig.dia - 1;
      setNuevoRecord(registrar(dias));
      setTimeout(() => setFase('fin'), sig.fin.tipo === 'navidad' ? 0 : 700);
    }
  };

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Es el invierno de 1914. Mandas una pequeña compañía en una trinchera del frente. Tu objetivo: <strong>llegar a Navidad</strong>.</p>
      <ul>
        <li>Cada día llega una situación con <strong>dos decisiones</strong>.</li>
        <li>Debajo de cada decisión ves <strong>qué recursos</strong> se verán afectados (más grande = más efecto), pero no si suben o bajan. Piénsalo.</li>
        <li>Recursos: 🎖️ moral, 🥫 comida, 💥 munición y 🩹 salud. Si cualquiera llega a <strong>cero</strong>, pierdes. El máximo es {MAXIMO}.</li>
        <li>Cada {CADA_RACION} días se reparte una ración extra de comida.</li>
        <li>Algunas decisiones tienen consecuencias días después…</li>
      </ul>
    </AyudaUnJugador>
  );

  if (fase === 'portada') {
    return (
      <div className="tn-contenedor">
        <PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record}
          textoRecord={(r) => (r.valor > DIAS ? '¡Llegaste a Navidad!' : `${r.valor} días`)} textoBoton="Entrar en la trinchera" />
        {ayudaModal}
      </div>
    );
  }

  if (fase === 'fin') {
    const navidad = estado.fin.tipo === 'navidad';
    const dias = navidad ? DIAS + 1 : estado.dia - 1;
    const final = navidad ? null : FINALES[estado.fin.recurso];
    return (
      <div className="tn-contenedor">
        <FinUnJugador
          icono={navidad ? 'trophy' : 'flag'}
          etiqueta={navidad ? '25 de diciembre de 1914' : `${fechaDe(estado.dia - 1)} de 1914`}
          titulo={navidad ? (estado.fin.opcion === 'a' ? 'La tregua de Navidad' : 'Una Navidad en silencio') : final.titulo}
          puntos={dias}
          unidad={dias === 1 ? 'día aguantado' : 'días aguantados'}
          nuevoRecord={nuevoRecord}
          record={record}
          textoRecord={(r) => (r.valor > DIAS ? 'llegar a Navidad' : `${r.valor} días`)}
          exito={navidad}
          onRepetir={empezar}
          onMenu={() => setFase('portada')}
        >
          <p className="tn-final">
            {navidad
              ? estado.fin.opcion === 'a'
                ? 'Salís de la trinchera. Os dais la mano, intercambiáis chocolate y cigarrillos y jugáis un partido de fútbol sobre la escarcha. Por un día, no hay guerra. Tu compañía ha sobrevivido.'
                : 'Escucháis los villancicos desde el refugio. Nadie dispara en todo el día. Tu compañía ha sobrevivido hasta Navidad.'
              : final.texto}
          </p>
        </FinUnJugador>
      </div>
    );
  }

  const { carta, rec, dia } = estado;
  const terminado = Boolean(estado.fin);

  return (
    <div className="tn-contenedor qq-en-partida">
      <Aviso {...aviso} />
      <section className="game uj-escena">
        <CabeceraPartida
          onSalir={() => setSalir(true)}
          chips={[<><Icon name="clock" size={14} /> Día {Math.min(dia, DIAS + 1)} de {DIAS + 1}</>]}
          titulo={`${fechaDe(Math.min(dia, DIAS + 1))} de 1914`}
        >
          <div className="tn-progreso"><span style={{ width: `${(Math.min(dia - 1, DIAS) / DIAS) * 100}%` }} /><em>🎄</em></div>
        </CabeceraPartida>

        <div className="tn-recursos">
          {RECURSOS.map((r) => {
            const v = rec[r.id];
            const d = cambios[r.id];
            return (
              <div key={r.id} className={`tn-recurso${v <= 2 ? ' peligro' : ''}`}>
                <div className="tn-medidor">
                  <span style={{ height: `${(v / MAXIMO) * 100}%` }} />
                  <b>{r.emoji}</b>
                </div>
                <span className="tn-nombre">{r.nombre}</span>
                {d ? <span key={clave} className={`tn-cambio ${d > 0 ? 'sube' : 'baja'}`}>{d > 0 ? `+${d}` : d}</span> : null}
              </div>
            );
          })}
        </div>

        {carta && !terminado && (
          <div key={`${dia}-${clave}`} className="uj-tarjeta tn-carta">
            <p className="tn-quien">{carta.quien}</p>
            <p className="tn-texto">{carta.texto}</p>
          </div>
        )}

        {carta && !terminado && (
          <div className="tn-opciones">
            {['a', 'b'].map((op) => (
              <button key={op} type="button" className={`tn-opcion ${op}`} onClick={() => elegir(op)}>
                <span>{carta[op].texto}</span>
                <Puntos ef={carta[op].ef} />
              </button>
            ))}
          </div>
        )}
      </section>
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
