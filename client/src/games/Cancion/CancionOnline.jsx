// client/src/games/Cancion/CancionOnline.jsx
// Modo online: todos escuchan la misma canción a la vez. El servidor lleva el reloj de la canción
// y cada móvil se sincroniza con él (posición y volumen).
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import {
  MenuModoOnline, FormCrearSala, FormUnirseSala, CabeceraSala, ListaSala, EsperandoAnfitrion, BloqueConfig
} from '../../components/MenuJuego.jsx';
import { cargar, reproducirDesde, pausar, detener, posicion, sonando as estaSonando, desbloquearAudio } from './audioPlayerCancion.js';
import {
  Hero, Disco, Pulsador, FormRespuesta, Aviso, Solucion, Clasificacion, Podio, ModalSalir, PildorasRondas, Cargando
} from './Pantallas.jsx';
import './Cancion.css';

export const CLAVE_SESION_CANCION = 'cancion_online_session';

const post = (ruta, body) => fetch(`/api/cancion/online${ruta}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});

export default function CancionOnline({ onVolver, onSalir, onAbrirAyuda }) {
  const [sesion, setSesion] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(CLAVE_SESION_CANCION)); } catch { return null; }
  });
  const [vista, setVista] = useState(() => (sesion ? 'sala' : 'online_menu'));
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [rondas, setRondas] = useState(10);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalLobby, setModalLobby] = useState(false);
  const [modalPartida, setModalPartida] = useState(false);
  const [sala, setSala] = useState(null);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [segundoLocal, setSegundoLocal] = useState(0);
  const [necesitaToque, setNecesitaToque] = useState(false);
  const recibido = useRef(0);

  const olvidar = () => { try { sessionStorage.removeItem(CLAVE_SESION_CANCION); } catch { /* nada */ } };

  useEffect(() => () => detener(), []);

  // Sondeo del estado de la sala
  useEffect(() => {
    if (!sesion) { setSala(null); return undefined; }
    let activo = true;
    const consultar = () => {
      fetch(`/api/cancion/online/sala/${sesion.code}?token=${sesion.token}`)
        .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
        .then((d) => {
          if (!activo || !d.success) return;
          recibido.current = Date.now();
          setSala(d);
          setVista('sala');
        })
        .catch(() => {
          if (!activo) return;
          olvidar();
          detener();
          setSesion(null);
          setSala(null);
          setVista('online_menu');
          setError('La sala se ha cerrado o se ha perdido la conexión.');
        });
    };
    consultar();
    const id = setInterval(consultar, 450);
    return () => { activo = false; clearInterval(id); };
  }, [sesion]);

  const ronda = sala?.ronda;
  const audioUrl = ronda?.audio;
  const estadoRonda = ronda?.estado;

  // Carga la canción de la ronda
  useEffect(() => {
    if (!audioUrl) return;
    cargar(audioUrl, { onTick: (s) => setSegundoLocal(s) });
    setSegundoLocal(0);
    setTexto('');
  }, [audioUrl]);

  // Sincroniza el audio con el reloj del servidor
  useEffect(() => {
    if (!ronda || sala?.estado !== 'jugando') { pausar(); return; }
    if (ronda.estado === 'sonando') {
      const objetivo = ronda.posicionMs / 1000 + (Date.now() - recibido.current) / 1000;
      if (!estaSonando() || Math.abs(posicion() - objetivo) > 0.8) {
        reproducirDesde(objetivo).then((ok) => setNecesitaToque(!ok));
      }
    } else {
      pausar();
      setSegundoLocal(ronda.posicionMs / 1000);
    }
  }, [sala]); // eslint-disable-line react-hooks/exhaustive-deps

  const activarSonido = async () => {
    desbloquearAudio();
    if (ronda?.estado === 'sonando') {
      const ok = await reproducirDesde(ronda.posicionMs / 1000 + (Date.now() - recibido.current) / 1000);
      setNecesitaToque(!ok);
    } else {
      setNecesitaToque(false);
    }
  };

  const accion = async (ruta, extra = {}) => {
    try {
      const r = await post(`/sala/${sesion.code}/${ruta}`, { token: sesion.token, ...extra });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setError('');
      return d;
    } catch (e) {
      setError(e.message || 'Error de conexión');
      setTimeout(() => setError(''), 3500);
      return null;
    }
  };

  const pulsar = async () => {
    desbloquearAudio();
    pausar();
    setTexto('');
    await accion('pulsar');
  };

  const teclear = (v) => {
    setTexto(v);
    post(`/sala/${sesion.code}/teclear`, { token: sesion.token, texto: v }).catch(() => {});
  };

  const responder = async () => {
    if (enviando) return;
    setEnviando(true);
    await accion('responder', { respuesta: texto });
    setTexto('');
    setEnviando(false);
  };

  const abandonar = () => {
    const actual = sesion;
    olvidar();
    detener();
    setSesion(null);
    setSala(null);
    if (actual) {
      fetch(`/api/cancion/online/sala/${actual.code}/salir`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: actual.token }), keepalive: true
      }).catch(() => {});
    }
  };

  const entrar = async (ruta, body) => {
    desbloquearAudio();
    setCargando(true);
    setError('');
    try {
      const r = await post(ruta, body);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      const nueva = { code: d.code, token: d.token };
      sessionStorage.setItem(CLAVE_SESION_CANCION, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (e) {
      setError(e.message || 'Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  // ---------- Menús ----------
  if (vista === 'online_menu') {
    return (
      <div className="cancion-contenedor">
        <MenuModoOnline onVolver={onVolver} onAyuda={onAbrirAyuda} onCrear={() => { setError(''); setVista('crear'); }} onUnirse={() => { setError(''); setVista('unirse'); }} error={error} />
      </div>
    );
  }
  if (vista === 'crear') {
    return (
      <div className="cancion-contenedor">
        <FormCrearSala
          onVolver={() => { setError(''); setVista('online_menu'); }}
          onAyuda={onAbrirAyuda}
          nombre={nombre}
          setNombre={setNombre}
          onCrear={() => entrar('/crear', { nombre: nombre.trim(), rondas })}
          cargando={cargando}
          error={error}
          descripcion="Introduce tu nombre para abrir la sala. Como anfitrión pondrás las canciones (de 2 a 20 jugadores)."
        >
          <BloqueConfig titulo="Número de canciones" style={{ marginTop: '1rem' }}>
            <PildorasRondas valor={rondas} onCambiar={setRondas} />
          </BloqueConfig>
        </FormCrearSala>
      </div>
    );
  }
  if (vista === 'unirse') {
    return (
      <div className="cancion-contenedor">
        <FormUnirseSala
          onVolver={() => { setError(''); setVista('online_menu'); }}
          onAyuda={onAbrirAyuda}
          codigo={codigo}
          setCodigo={setCodigo}
          nombre={nombre}
          setNombre={setNombre}
          onUnirse={() => entrar('/unirse', { code: codigo.trim().toUpperCase(), nombre: nombre.trim() })}
          cargando={cargando}
          error={error}
        />
      </div>
    );
  }

  if (!sala) {
    return (
      <div className="cancion-contenedor qq-en-partida">
        <section className="game afp-escena"><Cargando texto="Conectando con la sala…" /></section>
      </div>
    );
  }

  // ---------- Sala de espera ----------
  if (sala.estado === 'lobby') {
    return (
      <div className="cancion-contenedor">
        <section className="game qq-pantalla">
          <CabeceraSala codigo={sala.code} onVolver={() => setModalLobby(true)} onAyuda={onAbrirAyuda} />
          <ListaSala jugadores={sala.jugadores} yoId={sala.yoId} max={20} min={2} anfitrionId={sala.anfitrionId}>
            <p className="hint" style={{ marginTop: '0.8rem' }}>🎵 {sala.totalRondas} canciones · 🔊 subid el volumen del móvil</p>
          </ListaSala>
          {error && <p className="error" style={{ margin: '0.8rem 0' }}>{error}</p>}
          {sala.esAdmin ? (
            <button type="button" className="big full qq-btn-principal" style={{ marginTop: '1rem' }} disabled={sala.jugadores.length < 2} onClick={() => { desbloquearAudio(); accion('iniciar'); }}>
              <Icon name="play" size={22} /> {sala.jugadores.length < 2 ? 'Esperando jugadores…' : '¡Empezar partida!'}
            </button>
          ) : (
            <EsperandoAnfitrion>
              <button type="button" className="secondary full" style={{ marginTop: '0.8rem' }} onClick={desbloquearAudio}>
                🔊 Probar que tengo sonido activado
              </button>
            </EsperandoAnfitrion>
          )}
        </section>
        {modalLobby && (
          <ModalSalir
            titulo="¿Salir de la sala?"
            texto={sala.esAdmin ? 'Eres el anfitrión: si sales, otro jugador pasará a serlo.' : 'Abandonarás la sala de espera.'}
            onSeguir={() => setModalLobby(false)}
            onSalir={() => { setModalLobby(false); abandonar(); setVista('online_menu'); }}
          />
        )}
      </div>
    );
  }

  const salirPartida = () => { setModalPartida(false); abandonar(); onSalir?.(); };
  const modal = modalPartida && (
    <ModalSalir
      texto={sala.esAdmin ? 'Eres el anfitrión: si sales, otro jugador pasará a dirigir la partida.' : 'Abandonarás la partida en curso.'}
      onSeguir={() => setModalPartida(false)}
      onSalir={salirPartida}
    />
  );
  const hero = () => (
    <Hero onSalir={() => setModalPartida(true)} ronda={sala.rondaNum} total={sala.totalRondas} jugadores={sala.jugadores} yoId={sala.yoId} turnoId={ronda?.pulsado?.jugadorId} />
  );

  // ---------- Final ----------
  if (sala.estado === 'final') {
    return (
      <div className="cancion-contenedor qq-en-partida">
        <section className="game afp-escena">
          <Podio jugadores={sala.jugadores} yoId={sala.yoId} />
          <Clasificacion jugadores={sala.jugadores} yoId={sala.yoId} titulo="Clasificación final" />
          <div className="afp-barra estatica">
            {sala.esAdmin && (
              <button type="button" className="afp-boton grande" onClick={() => accion('reiniciar')}>
                <Icon name="refresh" size={22} /> Revancha (volver a la sala)
              </button>
            )}
            <button type="button" className={sala.esAdmin ? 'afp-enlace' : 'afp-boton grande'} onClick={salirPartida}>
              <Icon name="home" size={sala.esAdmin ? 16 : 22} /> Volver a la portada
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (sala.estado === 'cargando' || !ronda) {
    return (
      <div className="cancion-contenedor qq-en-partida">
        <section className="game afp-escena">{hero()}<Cargando /></section>
        {modal}
      </div>
    );
  }

  const yo = sala.jugadores.find((j) => j.id === sala.yoId);
  const pulsado = ronda.pulsado;
  const soyYo = pulsado?.jugadorId === sala.yoId;
  const segundo = estadoRonda === 'sonando' ? segundoLocal : ronda.posicionMs / 1000;

  // ---------- Solución ----------
  if (estadoRonda === 'resuelta' && ronda.solucion) {
    const ultima = sala.rondaNum >= sala.totalRondas;
    return (
      <div className="cancion-contenedor qq-en-partida">
        <section className="game afp-escena">
          {hero()}
          <Solucion titulo={ronda.solucion.titulo} artista={ronda.solucion.artista} mensaje={ronda.mensaje} sumas={ronda.aciertos || {}} jugadores={sala.jugadores} yoId={sala.yoId} />
          <Clasificacion jugadores={sala.jugadores} yoId={sala.yoId} subtitulo={`Tras la canción ${sala.rondaNum} de ${sala.totalRondas}`} />
          {error && <p className="error" style={{ margin: 0 }}>{error}</p>}
          <div className="afp-barra estatica">
            {sala.esAdmin ? (
              <>
                <button type="button" className="afp-boton grande" onClick={() => accion(ultima ? 'finalizar' : 'siguiente-ronda')}>
                  {ultima ? <><Icon name="crown" size={22} /> Ver el podio</> : <><Icon name="play" size={22} /> Siguiente canción</>}
                </button>
                {!ultima && (
                  <button type="button" className="afp-enlace" onClick={() => accion('finalizar')}>
                    <Icon name="flagFinish" size={16} /> Terminar la partida aquí
                  </button>
                )}
              </>
            ) : (
              <p className="afp-espera">⏳ Esperando a que el anfitrión ponga otra canción…</p>
            )}
          </div>
        </section>
        {modal}
      </div>
    );
  }

  // ---------- Canción en juego ----------
  return (
    <div className="cancion-contenedor qq-en-partida">
      <Aviso mensaje={ronda.mensaje} />
      <section className="game afp-escena">
        {hero()}
        <Disco segundo={segundo} sonando={estadoRonda === 'sonando'} estado={estadoRonda} />

        {necesitaToque && (
          <button type="button" className="afp-activar" onClick={activarSonido}>
            🔇 Tu móvil ha bloqueado el sonido. <strong>Toca aquí para escuchar</strong>
          </button>
        )}
        {error && <p className="error" style={{ margin: 0 }}>{error}</p>}

        {soyYo ? (
          <FormRespuesta
            valor={texto}
            onCambiar={teclear}
            onEnviar={responder}
            restante={(pulsado.restanteMs - (Date.now() - recibido.current)) / 1000}
            enviando={enviando}
          />
        ) : pulsado ? (
          <div className="afp-tarjeta afp-otro-responde" style={{ '--c': '#f59e0b' }}>
            <p className="afp-etiqueta">¡Ha pulsado {pulsado.nombre}!</p>
            <p className="afp-tecleando">{pulsado.texto ? <>«{pulsado.texto}»</> : <span className="afp-puntos-escribe"><i /><i /><i /></span>}</p>
            <p className="afp-pista">Tiene {Math.max(0, Math.ceil(pulsado.restanteMs / 1000))} segundos para responder.</p>
          </div>
        ) : estadoRonda === 'espera' ? (
          <div className="afp-tarjeta afp-otro-responde">
            <p className="afp-tecleando">🎧 {sala.esAdmin ? 'Cuando estéis listos, ¡dale al play!' : 'El anfitrión va a poner la canción…'}</p>
          </div>
        ) : yo?.bloqueado ? (
          <div className="afp-tarjeta afp-otro-responde">
            <p className="afp-tecleando">❌ Has fallado esta canción. Espera a la siguiente.</p>
          </div>
        ) : (
          <Pulsador onPulsar={pulsar} deshabilitado={estadoRonda !== 'sonando'} />
        )}

        {sala.esAdmin && !pulsado && (
          <div className="afp-barra estatica">
            {estadoRonda === 'espera' && (
              <button type="button" className="afp-boton grande" onClick={() => { desbloquearAudio(); accion('reproducir'); }}>
                <Icon name="play" size={24} /> Reproducir la canción
              </button>
            )}
            {estadoRonda === 'sonando' && (
              <button type="button" className="afp-enlace" onClick={() => accion('reproducir')}><Icon name="pause" size={16} /> Pausar para todos</button>
            )}
            {estadoRonda === 'pausa' && (
              <button type="button" className="afp-boton grande" onClick={() => accion('reproducir')}><Icon name="play" size={24} /> Seguir escuchando</button>
            )}
            {estadoRonda !== 'espera' && (
              <button type="button" className="afp-enlace" onClick={() => accion('solucion')}><Icon name="flagFinish" size={16} /> Revelar la solución</button>
            )}
          </div>
        )}
      </section>
      {modal}
    </div>
  );
}
