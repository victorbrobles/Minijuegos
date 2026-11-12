// client/src/games/Cancion/CancionLocal.jsx
// Modo «un único dispositivo»: suena la canción en el móvil, quien la sepa pulsa y elige su nombre.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { SelectorJugadores, BloqueConfig } from '../../components/MenuJuego.jsx';
import { cargar, reproducirDesde, pausar, detener, posicion, desbloquearAudio, alError, DURACION_S } from './audioPlayerCancion.js';
import {
  Hero, Disco, Pulsador, FormRespuesta, Aviso, Solucion, Clasificacion, Podio, ModalSalir, PildorasRondas, Cargando,
  SEGUNDOS_RESPUESTA, colorJugador, inicial
} from './Pantallas.jsx';
import './Cancion.css';
import { limitesLocal } from '../limites.js';

const { min: MIN_JUGADORES, max: MAX_JUGADORES } = limitesLocal('cancion');

export default function CancionLocal({ onVolver, onExit, onAbrirAyuda }) {
  const [fase, setFase] = useState('setup'); // setup | cargando | ronda | resuelta | clasificacion | final
  const [numJugadores, setNumJugadores] = useState(MIN_JUGADORES);
  const [nombres, setNombres] = useState(() => Array.from({ length: MAX_JUGADORES }, (_, i) => `Jugador ${i + 1}`));
  const [rondas, setRondas] = useState(15);
  const [error, setError] = useState('');
  const [modalSalir, setModalSalir] = useState(false);

  const [jugadores, setJugadores] = useState([]);
  const [ronda, setRonda] = useState(1);
  const [usados, setUsados] = useState([]);
  const [cancion, setCancion] = useState(null); // { id, audio }
  const [estado, setEstado] = useState('espera'); // espera | sonando | eligiendo | respondiendo | pausa
  const [segundo, setSegundo] = useState(0);
  const [bloqueados, setBloqueados] = useState([]);
  const [quien, setQuien] = useState(null);
  const [texto, setTexto] = useState('');
  const [restante, setRestante] = useState(SEGUNDOS_RESPUESTA);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [solucion, setSolucion] = useState(null);
  const [sumas, setSumas] = useState({});
  const [bloqueoAudio, setBloqueoAudio] = useState(false);
  const segundoPulsado = useRef(0);
  // La canción actual en una ref: el aviso de «fin del fragmento» llega desde el reproductor
  const cancionRef = useRef(null);
  const revelarRef = useRef(null);

  useEffect(() => () => detener(), []);

  const empezar = () => {
    desbloquearAudio();
    const js = nombres.slice(0, numJugadores).map((n, i) => ({ id: i + 1, nombre: n.trim() || `Jugador ${i + 1}`, puntos: 0 }));
    setJugadores(js);
    setRonda(1);
    setUsados([]);
    nuevaCancion([]);
  };

  const nuevaCancion = async (lista) => {
    detener();
    setFase('cargando');
    setError('');
    try {
      const r = await fetch('/api/cancion/iniciar-ronda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usados: lista })
      });
      const data = await r.json();
      if (!r.ok || !data.success) throw new Error(data.error);
      setCancion(data);
      cancionRef.current = data;
      setUsados([...lista, data.id]);
      setBloqueados([]);
      setQuien(null);
      setTexto('');
      setMensaje(null);
      setSolucion(null);
      setSumas({});
      setSegundo(0);
      setEstado('espera');
      cargar(data.audio, {
        onTick: (s) => setSegundo(s),
        onFin: () => revelarRef.current?.('nadie')
      });
      alError(() => setMensaje({ tipo: 'fallo', texto: 'No se ha podido cargar esta canción. Pulsa «Otra canción».' }));
      setFase('ronda');
    } catch (e) {
      setError(e.message || 'No se pudo cargar la canción. ¿Está arrancado el servidor?');
      setFase(jugadores.length ? 'clasificacion' : 'setup');
    }
  };

  const tocarPlay = async () => {
    desbloquearAudio();
    const ok = await reproducirDesde(posicion());
    setBloqueoAudio(!ok);
    if (ok) setEstado('sonando');
  };

  const pausarCancion = () => { pausar(); setEstado('pausa'); };

  // Alguien pulsa: se para la canción y se elige quién ha sido
  const pulsar = () => {
    pausar();
    segundoPulsado.current = posicion();
    setEstado('eligiendo');
  };

  const elegirJugador = (j) => {
    setQuien(j);
    setTexto('');
    setRestante(SEGUNDOS_RESPUESTA);
    setEstado('respondiendo');
  };

  const reanudar = async () => {
    setQuien(null);
    setTexto('');
    if (posicion() >= DURACION_S - 0.2) { revelar('nadie'); return; }
    const ok = await reproducirDesde(posicion());
    setEstado(ok ? 'sonando' : 'pausa');
  };

  // Cuenta atrás para responder
  const respuestaRef = useRef(null);
  useEffect(() => {
    if (estado !== 'respondiendo') return undefined;
    const fin = Date.now() + SEGUNDOS_RESPUESTA * 1000;
    const id = setInterval(() => {
      const r = (fin - Date.now()) / 1000;
      if (r <= 0) { clearInterval(id); respuestaRef.current?.(true); } else setRestante(r);
    }, 200);
    return () => clearInterval(id);
  }, [estado, quien]);

  const sumar = (id, pts) => {
    setJugadores((js) => js.map((j) => (j.id === id ? { ...j, puntos: Math.max(0, j.puntos + pts) } : j)));
    setSumas((s) => ({ ...s, [id]: (s[id] || 0) + pts }));
  };

  const responder = async (porTiempo = false) => {
    if (!quien || enviando) return;
    setEnviando(true);
    try {
      const r = await fetch('/api/cancion/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cancionRef.current.id, respuesta: porTiempo ? '' : texto, segundo: segundoPulsado.current })
      });
      const d = await r.json();
      if (d.acierto) {
        sumar(quien.id, d.puntosAcierto);
        detener();
        setSolucion({ titulo: d.tituloReal, artista: d.artistaReal });
        setMensaje({ tipo: 'acierto', texto: `¡${quien.nombre} la ha acertado en ${Math.max(1, Math.round(segundoPulsado.current))} s! +${d.puntosAcierto} puntos` });
        setFase('resuelta');
      } else {
        sumar(quien.id, -d.puntosFallo);
        const nuevos = [...bloqueados, quien.id];
        setBloqueados(nuevos);
        const fuera = quien.nombre;
        if (nuevos.length >= jugadores.length) {
          revelar('todos');
        } else {
          setMensaje({ tipo: 'fallo', texto: `${porTiempo ? '¡Se acabó el tiempo!' : '¡Incorrecto!'} ${fuera} −${d.puntosFallo}. ¡Rebote para el resto!` });
          reanudar();
        }
      }
    } catch {
      setMensaje({ tipo: 'fallo', texto: 'Error de conexión al comprobar la respuesta.' });
    } finally {
      setEnviando(false);
    }
  };
  respuestaRef.current = responder;

  const revelar = async (motivo) => {
    detener();
    try {
      const r = await fetch('/api/cancion/solucion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cancionRef.current?.id })
      });
      const d = await r.json();
      setSolucion({ titulo: d.titulo, artista: d.artista });
    } catch {
      setSolucion({ titulo: '¿?', artista: '' });
    }
    setMensaje({
      tipo: motivo === 'rendirse' ? 'info' : 'fallo',
      texto: motivo === 'todos' ? '¡Habéis fallado todos!' : motivo === 'rendirse' ? 'Os habéis rendido.' : 'Se acabó la canción y nadie la ha adivinado.'
    });
    setFase('resuelta');
  };

  revelarRef.current = revelar;

  const siguiente = () => {
    if (ronda >= rondas) { setFase('final'); return; }
    setRonda(ronda + 1);
    nuevaCancion(usados);
  };

  const hero = (extra = {}) => (
    <Hero onSalir={() => setModalSalir(true)} ronda={ronda} total={rondas} jugadores={jugadores.map((j) => ({ ...j, bloqueado: bloqueados.includes(j.id) }))} {...extra} />
  );
  const modal = modalSalir && (
    <ModalSalir
      texto="Se perderá la partida en curso y volverás a la portada."
      onSeguir={() => setModalSalir(false)}
      onSalir={() => { setModalSalir(false); detener(); onExit?.(); }}
    />
  );

  if (fase === 'setup') {
    return (
      <div className="cancion-contenedor">
        <SelectorJugadores
          onVolver={onVolver}
          onAyuda={onAbrirAyuda}
          min={MIN_JUGADORES}
          max={MAX_JUGADORES}
          numJugadores={numJugadores}
          onCambiarNum={(n) => setNumJugadores(Math.max(MIN_JUGADORES, Math.min(MAX_JUGADORES, n)))}
          nombres={nombres.slice(0, numJugadores)}
          onNombre={(i, v) => setNombres((ns) => ns.map((x, k) => (k === i ? v : x)))}
          onEmpezar={empezar}
          error={error}
          maxLength={20}
        >
          <BloqueConfig titulo="Número de canciones" style={{ marginTop: '1.2rem' }}>
            <PildorasRondas valor={rondas} onCambiar={setRondas} />
          </BloqueConfig>
          <p className="hint" style={{ marginTop: '0.8rem' }}>🔊 Sube el volumen del móvil: la canción empieza casi en silencio.</p>
        </SelectorJugadores>
      </div>
    );
  }

  if (fase === 'cargando') {
    return (
      <div className="cancion-contenedor qq-en-partida">
        <section className="game afp-escena">{jugadores.length > 0 && hero()}<Cargando /></section>
      </div>
    );
  }

  const disponibles = jugadores.filter((j) => !bloqueados.includes(j.id));

  return (
    <div className="cancion-contenedor qq-en-partida">
      <Aviso mensaje={mensaje} />

      {fase === 'ronda' && (
        <section className="game afp-escena">
          {hero({ turnoId: quien?.id })}
          <Disco segundo={segundo} sonando={estado === 'sonando'} estado={estado === 'sonando' ? 'sonando' : estado === 'espera' ? 'espera' : 'pausa'} />

          {bloqueoAudio && <p className="afp-bloqueo">🔇 El móvil ha bloqueado el sonido. Vuelve a pulsar «Reproducir».</p>}

          {estado === 'espera' && (
            <div className="afp-barra estatica">
              <button type="button" className="afp-boton grande" onClick={tocarPlay}>
                <Icon name="play" size={24} /> Reproducir la canción
              </button>
              <button type="button" className="afp-enlace" onClick={() => nuevaCancion(usados)}>
                <Icon name="refresh" size={16} /> Otra canción
              </button>
            </div>
          )}

          {estado === 'sonando' && (
            <>
              <Pulsador onPulsar={pulsar} deshabilitado={!disponibles.length} />
              <div className="afp-barra estatica">
                <button type="button" className="afp-enlace" onClick={pausarCancion}><Icon name="pause" size={16} /> Pausar</button>
              </div>
            </>
          )}

          {estado === 'pausa' && (
            <div className="afp-barra estatica">
              <button type="button" className="afp-boton grande" onClick={tocarPlay}>
                <Icon name="play" size={24} /> Seguir escuchando
              </button>
              <button type="button" className="afp-enlace" onClick={() => revelar('rendirse')}>
                <Icon name="flagFinish" size={16} /> Rendirse y ver la solución
              </button>
            </div>
          )}

          {estado === 'eligiendo' && (
            <div className="afp-tarjeta">
              <p className="afp-etiqueta">¿Quién ha pulsado?</p>
              <div className="afp-quien">
                {disponibles.map((j) => (
                  <button key={j.id} type="button" className="afp-quien-btn" style={{ '--c': colorJugador(j.id) }} onClick={() => elegirJugador(j)}>
                    <span className="afp-avatar">{inicial(j.nombre)}</span>
                    {j.nombre}
                  </button>
                ))}
              </div>
              <button type="button" className="afp-enlace oscuro" onClick={reanudar}>Ha sido sin querer: seguir</button>
            </div>
          )}

          {estado === 'respondiendo' && quien && (
            <FormRespuesta
              nombre={quien.nombre}
              valor={texto}
              onCambiar={setTexto}
              onEnviar={() => responder(false)}
              restante={restante}
              enviando={enviando}
            />
          )}
        </section>
      )}

      {fase === 'resuelta' && solucion && (
        <section className="game afp-escena">
          {hero()}
          <Solucion titulo={solucion.titulo} artista={solucion.artista} mensaje={mensaje} sumas={sumas} jugadores={jugadores} />
          <div className="afp-barra estatica">
            <button type="button" className="afp-boton grande" onClick={() => setFase('clasificacion')}>
              <Icon name="chart" size={22} /> Ver clasificación
            </button>
          </div>
        </section>
      )}

      {fase === 'clasificacion' && (
        <section className="game afp-escena">
          {hero()}
          {error && <p className="error" style={{ margin: 0 }}>{error}</p>}
          <Clasificacion jugadores={jugadores} subtitulo={`Tras la canción ${ronda} de ${rondas}`} />
          <div className="afp-barra estatica">
            <button type="button" className="afp-boton grande" onClick={siguiente}>
              {ronda >= rondas ? <><Icon name="crown" size={22} /> Ver el podio</> : <><Icon name="play" size={22} /> Siguiente canción</>}
            </button>
            {ronda < rondas && (
              <button type="button" className="afp-enlace" onClick={() => setFase('final')}>
                <Icon name="flagFinish" size={16} /> Terminar la partida aquí
              </button>
            )}
          </div>
        </section>
      )}

      {fase === 'final' && (
        <section className="game afp-escena">
          <Podio jugadores={jugadores} />
          <Clasificacion jugadores={jugadores} titulo="Clasificación final" />
          <div className="afp-barra estatica">
            <button type="button" className="afp-boton grande" onClick={empezar}>
              <Icon name="refresh" size={22} /> Revancha (mismos jugadores)
            </button>
            <button type="button" className="afp-enlace" onClick={() => setFase('setup')}><Icon name="users" size={16} /> Cambiar jugadores</button>
            <button type="button" className="afp-enlace" onClick={() => { detener(); onExit?.(); }}><Icon name="home" size={16} /> Volver a la portada</button>
          </div>
        </section>
      )}
      {modal}
    </div>
  );
}
