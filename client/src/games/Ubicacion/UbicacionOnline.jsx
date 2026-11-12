// client/src/games/Ubicacion/UbicacionOnline.jsx
// Modo online: todos sitúan su marcador a la vez desde su propio móvil.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import {
  MenuModoOnline, FormCrearSala, FormUnirseSala, CabeceraSala, ListaSala, EsperandoAnfitrion, BloqueConfig
} from '../../components/MenuJuego.jsx';
import MapaMundi from './MapaMundi.jsx';
import { resolverImagenes, OPCIONES_RONDAS } from './geo.js';
import {
  Hero, BarraTiempo, TarjetaFoto, BotonFoto, ModalFoto, TablaRonda, Clasificacion, Podio, ModalSalir, inicial
} from './Pantallas.jsx';
import './Ubicacion.css';
import { limitesOnline, textoSala } from '../limites.js';

const LIM_ON = limitesOnline('ubicacion');

export const CLAVE_SESION_UBICACION = 'ubicacion_online_session';
const SEGUNDOS_FOTO = 10;
const SEGUNDOS_TURNO = 90;

const post = (url, body) => fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});

export default function UbicacionOnline({ onVolver, onSalir, onAbrirAyuda }) {
  const [nombre, setNombre] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [rondas, setRondas] = useState(7);
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modalSalirLobby, setModalSalirLobby] = useState(false);
  const [modalSalirPartida, setModalSalirPartida] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(CLAVE_SESION_UBICACION)); } catch { return null; }
  });
  // Si ya había una sala guardada (recarga de la página), se vuelve directamente a ella
  const [vista, setVista] = useState(() => (sesion ? 'sala' : 'online_menu')); // online_menu | crear | unirse | sala
  const [sala, setSala] = useState(null);
  const [verImagen, setVerImagen] = useState(false);
  const [enfoque, setEnfoque] = useState(null);
  const [miPosicionLocal, setMiPosicionLocal] = useState(null);
  const intervalRef = useRef(null);

  const olvidarSesion = () => {
    try { sessionStorage.removeItem(CLAVE_SESION_UBICACION); } catch { /* sin almacenamiento */ }
  };

  // Sondeo del estado de la sala
  useEffect(() => {
    if (!sesion) {
      clearInterval(intervalRef.current);
      setSala(null);
      return undefined;
    }
    const consultar = () => {
      fetch(`/api/ubicacion/online/sala/${sesion.code}?token=${sesion.token}`)
        .then((r) => { if (!r.ok) throw new Error('Sala no disponible'); return r.json(); })
        .then((d) => { if (d.success) { setSala(d); setVista('sala'); } })
        .catch(() => {
          olvidarSesion();
          setSesion(null);
          setSala(null);
          setVista('online_menu');
          setErrorMsg('La sala se ha cerrado.');
        });
    };
    consultar();
    intervalRef.current = setInterval(consultar, 500);
    return () => clearInterval(intervalRef.current);
  }, [sesion]);

  // Arreglo: al cambiar de ronda se olvida el marcador local de la ronda anterior (antes solo
  // lo hacía el anfitrión y los invitados arrastraban su marca a la ronda siguiente)
  const rondaNum = sala?.rondaNum;
  useEffect(() => {
    setMiPosicionLocal(null);
    setEnfoque(null);
    setVerImagen(false);
  }, [rondaNum]);

  const abandonarSala = () => {
    clearInterval(intervalRef.current);
    const actual = sesion;
    olvidarSesion();
    setSesion(null);
    setSala(null);
    if (actual?.code && actual?.token) {
      fetch(`/api/ubicacion/online/sala/${actual.code}/salir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: actual.token }),
        keepalive: true
      }).catch(() => {});
    }
  };

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setCargando(true);
    setErrorMsg('');
    try {
      const rLote = await fetch(`/api/ubicacion/lote?n=${rondas + 8}`);
      if (!rLote.ok) throw new Error('No se pudo conectar con el catálogo de lugares.');
      const conFoto = await resolverImagenes(await rLote.json());
      if (!conFoto.length) throw new Error('No se pudieron descargar las fotos de los lugares. Comprueba la conexión.');
      const res = await post('/api/ubicacion/online/crear', { nombre: nombre.trim(), lugares: conFoto, rondas });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_UBICACION, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleUnirse = async () => {
    if (!nombre.trim() || !codigoInput.trim()) return;
    setCargando(true);
    setErrorMsg('');
    try {
      const res = await post('/api/ubicacion/online/unirse', { code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_UBICACION, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const accion = async (ruta, extra = {}) => {
    try {
      const res = await post(`/api/ubicacion/online/sala/${sesion.code}/${ruta}`, { token: sesion.token, ...extra });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const ronda = sala?.ronda;
  const yoId = sala?.yoId;
  const esAdmin = sala?.esAdmin;
  const miJugador = sala?.jugadores?.find((j) => j.id === yoId);
  const miColor = miJugador?.color || '#2563eb';
  const yaConfirmado = Boolean(ronda?.miMarcador?.confirmado);
  const miPos = miPosicionLocal || (ronda?.miMarcador?.lat != null ? { lat: ronda.miMarcador.lat, lng: ronda.miMarcador.lng } : null);

  const colocarMarcador = (lat, lng) => {
    if (yaConfirmado) return;
    setMiPosicionLocal({ lat, lng });
    post(`/api/ubicacion/online/sala/${sesion.code}/posicionar`, { token: sesion.token, lat, lng }).catch(() => {});
  };

  const volverMenu = () => { setErrorMsg(''); setVista('online_menu'); };

  // ---------- Menús ----------
  if (vista === 'online_menu') {
    return (
      <div className="ub-contenedor">
        <MenuModoOnline
          onVolver={onVolver}
          onAyuda={onAbrirAyuda}
          onCrear={() => { setErrorMsg(''); setVista('crear'); }}
          onUnirse={() => { setErrorMsg(''); setVista('unirse'); }}
          error={errorMsg}
        />
      </div>
    );
  }

  if (vista === 'crear') {
    return (
      <div className="ub-contenedor">
        <FormCrearSala
          onVolver={volverMenu}
          onAyuda={onAbrirAyuda}
          nombre={nombre}
          setNombre={setNombre}
          onCrear={handleCrear}
          cargando={cargando}
          error={errorMsg}
          descripcion={`Introduce tu nombre para abrir la sala y ser el anfitrión (${textoSala('ubicacion')}).`}
        >
          <BloqueConfig titulo="Número de rondas" style={{ marginTop: '1rem' }}>
            <div className="ubp-pildoras">
              {OPCIONES_RONDAS.map((n) => (
                <button key={n} type="button" className={`ubp-pildora${rondas === n ? ' activo' : ''}`} onClick={() => setRondas(n)}>
                  {n} rondas
                </button>
              ))}
            </div>
          </BloqueConfig>
          {cargando && <p className="hint" style={{ marginTop: '0.8rem' }}>🌍 Buscando lugares y descargando fotos…</p>}
        </FormCrearSala>
      </div>
    );
  }

  if (vista === 'unirse') {
    return (
      <div className="ub-contenedor">
        <FormUnirseSala
          onVolver={volverMenu}
          onAyuda={onAbrirAyuda}
          codigo={codigoInput}
          setCodigo={setCodigoInput}
          nombre={nombre}
          setNombre={setNombre}
          onUnirse={handleUnirse}
          cargando={cargando}
          error={errorMsg}
        />
      </div>
    );
  }

  if (!sala) {
    return (
      <div className="ub-contenedor qq-en-partida">
        <section className="game ubp-escena">
          <div className="ubp-tarjeta ubp-cargando"><span className="ubp-globo">🌍</span><p>Conectando con la sala…</p></div>
        </section>
      </div>
    );
  }

  // ---------- Sala de espera ----------
  if (sala.estado === 'lobby') {
    return (
      <div className="ub-contenedor">
        <section className="game qq-pantalla">
          <CabeceraSala codigo={sala.code} onVolver={() => setModalSalirLobby(true)} onAyuda={onAbrirAyuda} />
          <ListaSala
            jugadores={sala.jugadores}
            yoId={yoId}
            max={LIM_ON.max}
            min={LIM_ON.min}
            anfitrionId={sala.anfitrionId}
            renderExtra={(j) => <span className="ubp-punto" style={{ background: j.color }} />}
          >
            <p className="hint" style={{ marginTop: '0.8rem' }}>🗺️ {sala.totalRondas} rondas</p>
          </ListaSala>
          {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}
          {esAdmin ? (
            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1rem' }}
              disabled={sala.jugadores.length < LIM_ON.min}
              onClick={() => accion('iniciar')}
            >
              <Icon name="play" size={22} /> {sala.jugadores.length < LIM_ON.min ? 'Esperando jugadores…' : '¡Empezar el viaje!'}
            </button>
          ) : (
            <EsperandoAnfitrion />
          )}
        </section>
        {modalSalirLobby && (
          <ModalSalir
            titulo="¿Salir de la sala?"
            texto="Abandonarás la sala de espera y volverás al menú online."
            onSeguir={() => setModalSalirLobby(false)}
            onSalir={() => { setModalSalirLobby(false); abandonarSala(); setVista('online_menu'); }}
          />
        )}
      </div>
    );
  }

  const jugadores = sala.jugadores;
  const salirDePartida = () => { setModalSalirPartida(false); abandonarSala(); onSalir?.(); };
  const modalSalir = modalSalirPartida && (
    <ModalSalir
      titulo="¿Salir de la partida?"
      texto={esAdmin ? 'Saldrás de la sala y otro jugador pasará a ser el anfitrión.' : 'Abandonarás la partida en curso.'}
      onSeguir={() => setModalSalirPartida(false)}
      onSalir={salirDePartida}
    />
  );
  const hero = (extra = {}) => (
    <Hero onSalir={() => setModalSalirPartida(true)} ronda={sala.rondaNum} total={sala.totalRondas} jugadores={jugadores} yoId={yoId} {...extra} />
  );

  // ---------- Final ----------
  if (sala.estado === 'final') {
    return (
      <div className="ub-contenedor qq-en-partida">
        <section className="game ubp-escena">
          <Podio jugadores={jugadores} yoId={yoId} />
          <Clasificacion jugadores={jugadores} yoId={yoId} titulo="Clasificación final" />
          <div className="ubp-barra estatica">
            <button type="button" className="ubp-boton grande" onClick={salirDePartida}>
              <Icon name="home" size={22} /> Volver a la portada
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (!ronda) return null;

  // ---------- Foto ----------
  if (ronda.faseRonda === 'foto') {
    return (
      <div className="ub-contenedor qq-en-partida">
        <section className="game ubp-escena">
          {hero()}
          <TarjetaFoto src={ronda.lugar.imagenUrl} segundos={ronda.segundosRestantesFoto} total={SEGUNDOS_FOTO} />
        </section>
        {modalSalir}
      </div>
    );
  }

  // ---------- Mapa ----------
  if (ronda.faseRonda === 'mapa') {
    const marcadores = [];
    if (miPos) {
      marcadores.push({
        id: 'mi-marcador', ...miPos, color: miColor, glifo: '★', grande: true, arrastrable: !yaConfirmado,
        etiqueta: yaConfirmado ? 'Confirmado' : 'Tú'
      });
    }
    (ronda.destellosVisibles || []).forEach((d) => marcadores.push({
      id: d.id, lat: d.lat, lng: d.lng, color: d.color, glifo: inicial(d.nombre), fantasma: true, interactivo: false, etiqueta: `📡 ${d.nombre}`
    }));
    const radar = ronda.destellosVisibles?.length > 0;

    return (
      <div className="ub-contenedor qq-en-partida">
        {verImagen && <ModalFoto src={ronda.lugar.imagenUrl} onCerrar={() => setVerImagen(false)} />}
        <section className="game ubp-escena">
          {hero({ confirmados: ronda.jugadoresConfirmados })}
          <BarraTiempo segundos={ronda.segundosRestantesMapa} total={SEGUNDOS_TURNO} />
          {radar && <div className="ubp-radar" role="status">📡 ¡Radar! Se ven los marcadores sin confirmar</div>}
          <div className="ubp-instruccion" style={{ '--c': miColor }}>
            <span className="ubp-avatar">{yaConfirmado ? '✓' : inicial(miJugador?.nombre)}</span>
            <p>
              {yaConfirmado
                ? <>Marcador confirmado. Esperando al resto…</>
                : miPos
                  ? <>Arrastra tu marcador para afinar y <strong>confirma</strong>. Sin confirmar, el radar lo enseña cada 15 s.</>
                  : <>Toca el mapa para situar tu marcador <strong>★</strong></>}
            </p>
            <BotonFoto src={ronda.lugar.imagenUrl} onClick={() => setVerImagen(true)} />
          </div>
          <MapaMundi
            key={`mapa-online-${sala.rondaNum}`}
            marcadores={marcadores}
            onClickMapa={colocarMarcador}
            onMoverMarcador={(id, lat, lng) => colocarMarcador(lat, lng)}
          />
          {errorMsg && <p className="error" style={{ margin: 0 }}>{errorMsg}</p>}
          <div className="ubp-barra estatica">
            {yaConfirmado ? (
              <p className="ubp-espera">⏳ {ronda.jugadoresConfirmados.length}/{jugadores.length} jugadores han confirmado</p>
            ) : (
              <button type="button" className="ubp-boton grande" disabled={!miPos} onClick={() => accion('confirmar')}>
                <Icon name="check" size={22} /> Confirmar mi marcador
              </button>
            )}
          </div>
        </section>
        {modalSalir}
      </div>
    );
  }

  // ---------- Resultados de la ronda ----------
  if (ronda.faseRonda === 'resultados' && ronda.resultado) {
    const res = ronda.resultado;
    const filas = res.filas.map((f) => ({ ...f, id: f.jugadorId }));
    const ultima = sala.rondaNum >= sala.totalRondas;
    return (
      <div className="ub-contenedor qq-en-partida">
        <section className="game ubp-escena">
          {hero()}
          <MapaMundi
            key={`res-online-${sala.rondaNum}`}
            marcadores={[
              { id: 'correcto', lat: res.lugar.lat, lng: res.lugar.lng, color: '#111827', glifo: '✓', grande: true, z: 1000, etiqueta: res.lugar.nombre },
              ...filas.filter((f) => f.real).map((f) => ({
                id: `jugador-${f.id}`, lat: f.real.lat, lng: f.real.lng, color: f.color, glifo: inicial(f.nombre), etiqueta: f.nombre
              }))
            ]}
            lineas={filas.filter((f) => f.real).map((f) => ({ desde: f.real, hasta: res.lugar, color: f.color }))}
            ajustar
            enfoque={enfoque}
          />
          <TablaRonda lugar={res.lugar} filas={filas} onEnfocar={setEnfoque} yoId={yoId} />
          <Clasificacion
            jugadores={jugadores}
            yoId={yoId}
            sumadas={Object.fromEntries(filas.map((f) => [f.id, f.puntos]))}
            subtitulo={`Tras la ronda ${sala.rondaNum} de ${sala.totalRondas} · gana quien menos sume`}
          />
          <div className="ubp-barra estatica">
            {esAdmin ? (
              <>
                <button type="button" className="ubp-boton grande" onClick={() => accion(ultima ? 'finalizar' : 'siguiente-ronda')}>
                  {ultima ? <><Icon name="crown" size={22} /> Ver el podio</> : <><Icon name="play" size={22} /> Siguiente ronda</>}
                </button>
                {!ultima && (
                  <button type="button" className="ubp-enlace" onClick={() => accion('finalizar')}>
                    <Icon name="flagFinish" size={16} /> Terminar la partida aquí
                  </button>
                )}
              </>
            ) : (
              <p className="ubp-espera">⏳ Esperando a que el anfitrión continúe…</p>
            )}
          </div>
        </section>
        {modalSalir}
      </div>
    );
  }

  return null;
}
