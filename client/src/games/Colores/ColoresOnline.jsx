// client/src/games/Colores/ColoresOnline.jsx
// Modo online: todos eligen sus colores a la vez desde su propio móvil.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import {
  MenuModoOnline, FormCrearSala, FormUnirseSala, CabeceraSala, ListaSala, EsperandoAnfitrion, BloqueConfig
} from '../../components/MenuJuego.jsx';
import {
  Hero, BarraTiempo, TarjetaElemento, Paleta, Chips, ResultadoRonda, Clasificacion, Podio, ModalSalir, PildorasRondas
} from './Pantallas.jsx';
import './Colores.css';
import { limitesOnline, textoSala } from '../limites.js';

const LIM_ON = limitesOnline('colores');

export const CLAVE_SESION_COLORES = 'colores_online_session';

const post = (ruta, body) => fetch(`/api/colores/online${ruta}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});

export default function ColoresOnline({ onVolver, onSalir, onAbrirAyuda }) {
  const [sesion, setSesion] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(CLAVE_SESION_COLORES)); } catch { return null; }
  });
  const [vista, setVista] = useState(() => (sesion ? 'sala' : 'online_menu')); // online_menu | crear | unirse | sala
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [rondas, setRondas] = useState(15);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalLobby, setModalLobby] = useState(false);
  const [modalPartida, setModalPartida] = useState(false);
  const [sala, setSala] = useState(null);
  const [seleccion, setSeleccion] = useState([]);
  const [finRonda, setFinRonda] = useState(null);
  const [restante, setRestante] = useState(null);
  const enviadoRef = useRef(false);

  const olvidar = () => { try { sessionStorage.removeItem(CLAVE_SESION_COLORES); } catch { /* nada */ } };

  // Sondeo del estado de la sala
  useEffect(() => {
    if (!sesion) { setSala(null); return undefined; }
    const consultar = () => {
      fetch(`/api/colores/online/sala/${sesion.code}?token=${sesion.token}`)
        .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
        .then((d) => { if (d.success) { setSala(d); setVista('sala'); } })
        .catch(() => {
          olvidar();
          setSesion(null);
          setSala(null);
          setVista('online_menu');
          setError('La sala se ha cerrado o se ha perdido la conexión.');
        });
    };
    consultar();
    const id = setInterval(consultar, 600);
    return () => clearInterval(id);
  }, [sesion]);

  const ronda = sala?.ronda;
  const idxRonda = sala?.rondaActualIdx;
  const votando = sala?.estado === 'jugando' && ronda?.estadoRonda === 'votando';

  // Nueva ronda: se limpia la selección y se fija el final según el reloj del servidor
  useEffect(() => {
    setSeleccion([]);
    enviadoRef.current = false;
    setFinRonda(null);
  }, [idxRonda, sala?.estado]);

  useEffect(() => {
    if (votando && ronda?.restanteMs != null && finRonda == null) setFinRonda(Date.now() + ronda.restanteMs);
  }, [votando, ronda?.restanteMs, finRonda]);

  // Reloj: al acabar se envía lo que se lleve elegido (el servidor también cierra la ronda solo)
  const seleccionRef = useRef(seleccion);
  seleccionRef.current = seleccion;
  useEffect(() => {
    if (!votando || ronda?.yaRespondio || finRonda == null) return undefined;
    const id = setInterval(() => {
      const r = (finRonda - Date.now()) / 1000;
      setRestante(Math.max(0, r));
      if (r <= 0) { clearInterval(id); enviar(seleccionRef.current); }
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [votando, ronda?.yaRespondio, finRonda]);

  const enviar = async (colores) => {
    if (enviadoRef.current || !sesion) return;
    enviadoRef.current = true;
    try {
      const r = await post(`/sala/${sesion.code}/responder`, { token: sesion.token, colores });
      if (!r.ok) enviadoRef.current = false;
    } catch {
      enviadoRef.current = false;
    }
  };

  const accion = async (ruta) => {
    try {
      const r = await post(`/sala/${sesion.code}/${ruta}`, { token: sesion.token });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setError('');
    } catch (e) {
      setError(e.message || 'Error de conexión');
    }
  };

  const abandonar = () => {
    const actual = sesion;
    olvidar();
    setSesion(null);
    setSala(null);
    if (actual) {
      fetch(`/api/colores/online/sala/${actual.code}/salir`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: actual.token }), keepalive: true
      }).catch(() => {});
    }
  };

  const entrar = async (ruta, body) => {
    setCargando(true);
    setError('');
    try {
      const r = await post(ruta, body);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      const nueva = { code: d.code, token: d.token };
      sessionStorage.setItem(CLAVE_SESION_COLORES, JSON.stringify(nueva));
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
      <div className="colores-contenedor">
        <MenuModoOnline onVolver={onVolver} onAyuda={onAbrirAyuda} onCrear={() => { setError(''); setVista('crear'); }} onUnirse={() => { setError(''); setVista('unirse'); }} error={error} />
      </div>
    );
  }
  if (vista === 'crear') {
    return (
      <div className="colores-contenedor">
        <FormCrearSala
          onVolver={() => { setError(''); setVista('online_menu'); }}
          onAyuda={onAbrirAyuda}
          nombre={nombre}
          setNombre={setNombre}
          onCrear={() => entrar('/crear', { nombre: nombre.trim(), rondas })}
          cargando={cargando}
          error={error}
          descripcion={`Introduce tu nombre para abrir la sala y ser el anfitrión (${textoSala('colores')}).`}
        >
          <BloqueConfig titulo="Número de rondas" style={{ marginTop: '1rem' }}>
            <PildorasRondas valor={rondas} onCambiar={setRondas} />
          </BloqueConfig>
        </FormCrearSala>
      </div>
    );
  }
  if (vista === 'unirse') {
    return (
      <div className="colores-contenedor">
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
      <div className="colores-contenedor qq-en-partida">
        <section className="game clp-escena">
          <div className="clp-tarjeta clp-cargando"><span className="clp-cargando-gotas"><i /><i /><i /></span><p>Conectando con la sala…</p></div>
        </section>
      </div>
    );
  }

  // ---------- Sala de espera ----------
  if (sala.estado === 'lobby') {
    return (
      <div className="colores-contenedor">
        <section className="game qq-pantalla">
          <CabeceraSala codigo={sala.code} onVolver={() => setModalLobby(true)} onAyuda={onAbrirAyuda} />
          <ListaSala jugadores={sala.jugadores} yoId={sala.yoId} max={LIM_ON.max} min={LIM_ON.min} anfitrionId={sala.anfitrionId}>
            <p className="hint" style={{ marginTop: '0.8rem' }}>🎨 {sala.totalRondas} rondas</p>
          </ListaSala>
          {error && <p className="error" style={{ margin: '0.8rem 0' }}>{error}</p>}
          {sala.esAdmin ? (
            <button type="button" className="big full qq-btn-principal" style={{ marginTop: '1rem' }} disabled={sala.jugadores.length < LIM_ON.min} onClick={() => accion('iniciar')}>
              <Icon name="play" size={22} /> {sala.jugadores.length < LIM_ON.min ? 'Esperando jugadores…' : '¡Empezar partida!'}
            </button>
          ) : (
            <EsperandoAnfitrion />
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

  const listos = sala.jugadores.filter((j) => j.haRespondido).map((j) => j.id);
  const salirPartida = () => { setModalPartida(false); abandonar(); onSalir?.(); };
  const modal = modalPartida && (
    <ModalSalir
      texto={sala.esAdmin ? 'Eres el anfitrión: si sales, otro jugador pasará a dirigir la partida.' : 'Abandonarás la partida en curso.'}
      onSeguir={() => setModalPartida(false)}
      onSalir={salirPartida}
    />
  );
  const hero = (extra = {}) => (
    <Hero onSalir={() => setModalPartida(true)} ronda={(sala.rondaActualIdx ?? 0) + 1} total={sala.totalRondas} jugadores={sala.jugadores} yoId={sala.yoId} {...extra} />
  );

  // ---------- Final ----------
  if (sala.estado === 'final') {
    return (
      <div className="colores-contenedor qq-en-partida">
        <section className="game clp-escena">
          <Podio jugadores={sala.jugadores} yoId={sala.yoId} />
          <Clasificacion jugadores={sala.jugadores} yoId={sala.yoId} titulo="Clasificación final" />
          <div className="clp-barra estatica">
            {sala.esAdmin && (
              <button type="button" className="clp-boton grande" onClick={() => accion('reiniciar')}>
                <Icon name="refresh" size={22} /> Revancha (volver a la sala)
              </button>
            )}
            <button type="button" className={sala.esAdmin ? 'clp-enlace' : 'clp-boton grande'} onClick={salirPartida}>
              <Icon name="home" size={sala.esAdmin ? 16 : 22} /> Volver a la portada
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (!ronda) return null;

  // ---------- Elegir colores ----------
  if (ronda.estadoRonda === 'votando') {
    const yaRespondio = ronda.yaRespondio;
    const mostrada = yaRespondio ? ronda.miSeleccion : seleccion;
    return (
      <div className="colores-contenedor qq-en-partida">
        <section className="game clp-escena">
          {hero({ listos })}
          <BarraTiempo segundos={restante} />
          <TarjetaElemento item={ronda.item} numColores={ronda.numColores} seleccion={mostrada} />
          {yaRespondio ? (
            <div className="clp-tarjeta clp-esperando">
              <p className="clp-etiqueta">Tu respuesta</p>
              <Chips colores={ronda.miSeleccion} />
              <p className="clp-texto">⏳ Esperando al resto… {ronda.totalRespondieron}/{ronda.totalJugadores} han respondido</p>
              {sala.esAdmin && (
                <button type="button" className="clp-enlace oscuro" onClick={() => accion('cerrar-ronda')}>
                  <Icon name="forward" size={16} /> Cerrar la ronda ya
                </button>
              )}
            </div>
          ) : (
            <>
              <Paleta
                seleccion={seleccion}
                max={ronda.numColores}
                onToggle={(id) => setSeleccion((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < ronda.numColores ? [...s, id] : s))}
              />
              <div className="clp-barra">
                <button type="button" className="clp-boton grande" disabled={seleccion.length !== ronda.numColores} onClick={() => enviar(seleccion)}>
                  <Icon name="check" size={22} />
                  {seleccion.length === ronda.numColores ? 'Confirmar mis colores' : `Faltan ${ronda.numColores - seleccion.length}`}
                </button>
              </div>
            </>
          )}
        </section>
        {modal}
      </div>
    );
  }

  // ---------- Resultado de la ronda ----------
  const res = ronda.resultadoRonda;
  const ultima = (sala.rondaActualIdx ?? 0) + 1 >= sala.totalRondas;
  return (
    <div className="colores-contenedor qq-en-partida">
      <section className="game clp-escena">
        {hero()}
        {res && <ResultadoRonda resultado={res} yoId={sala.yoId} />}
        {res && (
          <Clasificacion
            jugadores={sala.jugadores}
            yoId={sala.yoId}
            sumadas={Object.fromEntries(res.desglose.map((d) => [d.id, d.aciertos]))}
            subtitulo={`Tras la ronda ${(sala.rondaActualIdx ?? 0) + 1} de ${sala.totalRondas}`}
          />
        )}
        {error && <p className="error" style={{ margin: 0 }}>{error}</p>}
        <div className="clp-barra estatica">
          {sala.esAdmin ? (
            <>
              <button type="button" className="clp-boton grande" onClick={() => accion(ultima ? 'finalizar' : 'siguiente-ronda')}>
                {ultima ? <><Icon name="crown" size={22} /> Ver el podio</> : <><Icon name="play" size={22} /> Siguiente ronda</>}
              </button>
              {!ultima && (
                <button type="button" className="clp-enlace" onClick={() => accion('finalizar')}>
                  <Icon name="flagFinish" size={16} /> Terminar la partida aquí
                </button>
              )}
            </>
          ) : (
            <p className="clp-espera-texto">⏳ Esperando a que el anfitrión continúe…</p>
          )}
        </div>
      </section>
      {modal}
    </div>
  );
}
