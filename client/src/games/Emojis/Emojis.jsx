// client/src/games/Emojis/Emojis.jsx
// «Biografía en emojis»: adivina al famoso con los menos emojis posibles. Online (todos a la vez).
import React, { useState } from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import { useReloj } from '../comun/Lienzo2D.jsx';
import { Hero, Pildoras, useLatido } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import * as E from './engine.js';
import './Emojis.css';

function Fila({ v }) {
  useLatido(250);
  const ahora = useReloj(v);
  const vistos = v.fase === 'adivinar' ? Math.min(v.total, 1 + Math.floor(Math.max(0, ahora() - v.inicio) / v.msEmoji)) : v.emojis.length;
  const restante = Math.max(0, Math.ceil((v.limite - ahora()) / 1000));
  return (
    <div className="pzp-tarjeta em-fila">
      {v.categoria && <p className="pzp-etiqueta">{v.categoria.emoji} {v.categoria.nombre}</p>}
      <div className="em-emojis">
        {Array.from({ length: v.total || 5 }, (_, i) => (
          <span key={i} className={i < vistos && v.emojis[i] ? 'ya' : ''}>{i < vistos && v.emojis[i] ? v.emojis[i] : '❔'}</span>
        ))}
      </div>
      {v.fase === 'adivinar' && <p className="em-valor">Si aciertas ahora: <b>+{Math.max(1, 6 - vistos)}</b> · ⏱️ {restante}s</p>}
    </div>
  );
}

function Escribir({ v, enviar }) {
  const [elegido, setElegido] = useState(null);
  const [texto, setTexto] = useState('');
  const limpios = E.limpiarEmojis(texto);
  return (
    <div className="pzp-tarjeta em-escribir">
      <p className="pzp-etiqueta">Elige a quién vas a contar</p>
      <div className="em-cands">
        {v.candidatos.map((c, i) => <button key={c.n} type="button" className={elegido === i ? 'sel' : ''} onClick={() => setElegido(i)}><b>{c.n}</b><small>{c.cat}</small></button>)}
      </div>
      <p className="pzp-etiqueta">Cuenta su vida en emojis (de 2 a {E.MAX_EMOJIS}; saldrán de uno en uno)</p>
      <input className="em-input" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="🇪🇸 ⚽ 🏆 …" inputMode="text" />
      <div className="em-emojis chicos">{limpios.length ? limpios.map((e, i) => <span key={i} className="ya">{e}</span>) : <span>❔</span>}</div>
      <p className="pzp-nota">Ganas 2 puntos por cada jugador que acierte. Solo cuentan los emojis (las letras se ignoran).</p>
      <button type="button" className="pzp-boton grande" disabled={elegido == null || limpios.length < 2} onClick={() => enviar('escribir', { elegido, emojis: limpios.join('') })}>✅ ¡Listo!</button>
    </div>
  );
}

function Partida({ v, enviar, onSalir }) {
  const autor = v.jugadores.find((j) => j.id === v.autor);
  const soyAutor = v.autor != null && v.autor === v.yo?.id;
  const marcas = (j) => (v.fase === 'adivinar' && v.respondidos.includes(j.id) ? <small className="em-ok">✔</small> : j.id === v.autor ? <small className="em-ok">✏️</small> : null);
  const chip = `🤔 Ronda ${v.ronda}/${v.rondas}`;
  if (v.fase === 'escribir') {
    return (
      <>
        <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={chip} extra={marcas} etiqueta={soyAutor ? 'Te toca ser autor' : 'Modo autor'} titulo={soyAutor ? 'Cuéntalo en emojis' : `${autor?.nombre} está escribiendo…`} />
        {soyAutor ? <Escribir v={v} enviar={enviar} /> : <p className="pzp-esperando">✏️ {autor?.nombre} elige un famoso y lo cuenta en emojis…</p>}
      </>
    );
  }
  if (v.fase === 'resultado' && v.resultado) {
    const r = v.resultado;
    return (
      <>
        <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={chip} etiqueta="Era…" titulo={r.nombre} clase="fin" />
        <Fila v={v} />
        <ul className="em-resultados">
          {v.jugadores.filter((j) => j.id !== r.autor && !j.fuera).map((j) => {
            const x = r.respuestas[j.id];
            return <li key={j.id} className={x?.bien ? 'bien' : 'mal'}><b>{j.nombre}</b><span>{x ? (x.bien ? `✅ con ${x.vistos} ${x.vistos === 1 ? 'emoji' : 'emojis'}` : `❌ dijo ${x.nombre}`) : '⌛ no contestó'}</span><em>{x?.bien ? `+${x.pts}` : ''}</em></li>;
          })}
          {r.autor != null && <li className="autor"><b>✏️ {v.jugadores.find((j) => j.id === r.autor)?.nombre}</b><span>autor</span><em>+{r.ptsAutor}</em></li>}
        </ul>
      </>
    );
  }
  const mia = v.miRespuesta;
  return (
    <>
      <Hero v={v} juego={JUEGO} onSalir={onSalir} chip={chip} extra={marcas} etiqueta={v.modo === 'autor' ? `Emojis de ${autor?.nombre}` : '¿Quién es?'} titulo="Adivina con los menos emojis posibles" />
      <Fila v={v} />
      {soyAutor ? <p className="pzp-esperando">✏️ Eres el autor: mira cómo adivinan…</p> : mia ? (
        <p className={`em-mia ${mia.bien ? 'bien' : 'mal'}`}>{mia.bien ? `✅ ¡Correcto! +${mia.pts}` : `❌ No era ${mia.nombre}`}</p>
      ) : (
        <div className="em-opciones">
          {v.opciones.map((n, i) => <button key={n} type="button" onClick={() => enviar('responder', { opcion: i })}>{n}</button>)}
        </div>
      )}
    </>
  );
}

function Config({ config, onCambiar }) {
  return (
    <>
      <BloqueConfig titulo="Modo">
        <Pildoras opciones={[['banco', '📚 Emojis preparados'], ['autor', '✏️ Los escribís vosotros']]} valor={config.modo} onCambiar={onCambiar && ((modo) => onCambiar({ modo }))} />
      </BloqueConfig>
      <BloqueConfig titulo="Rondas">
        <Pildoras opciones={E.OPCIONES_RONDAS.map((n) => [n, `${n} rondas`])} valor={config.rondas} onCambiar={onCambiar && ((rondas) => onCambiar({ rondas }))} />
      </BloqueConfig>
    </>
  );
}

const JUEGO = {
  id: 'emojis',
  api: '/api/emojis',
  emoji: '🤔',
  config: { rondas: 10, modo: 'banco' },
  sinLocal: true,
  Partida: (props) => <Partida {...props} />,
  Config,
  textoEmpezar: '¡A adivinar!',
  notaSala: '🤔 Todos a la vez: cuanto antes aciertes, más puntos. Si fallas, te quedas fuera de esa ronda.',
  ganador: (n) => `¡${n.join(' y ')} ${n.length > 1 ? 'hablan' : 'habla'} emoji mejor que nadie!`,
  detalleFin: (j) => `${j.puntos} ${j.puntos === 1 ? 'punto' : 'puntos'}`
};

export default function Emojis({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
