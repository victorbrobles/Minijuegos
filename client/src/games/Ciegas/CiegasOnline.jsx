// client/src/games/Ciegas/CiegasOnline.jsx
import SalonFama from '../../components/SalonFama.jsx';
import { useRegistrarPartida, ganadoresPorPuntos } from '../../lib/registros.js';
import { nombreIdentidad } from '../../lib/identidad.js';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Ciegas.css';
import {
  Cabecera,
  CajaTemaRanking,
  Avatar,
  OrdenTurnos,
  SelectorCategorias,
  TableroArmarTopCiegas,
  ListaTopCinco,
  BotonPrincipal,
  EnlaceSecundario,
  CATEGORIAS_CIEGAS,
  colorJugador,
  indiceColor
} from './CiegasLocal.jsx';
import { limitesOnline, textoSala } from '../limites.js';
import { ChipJugadores } from '../../components/MenuJuego.jsx';
import { SelectorRondas } from '../../components/MenuJuego.jsx';
import { rondasPorDefecto } from '../rondas.js';

const LIM_ON = limitesOnline('ciegas');

const CLAVE_SESION_CIEGAS = 'ciegas_online_session';

function BotonVolver({ onClick, texto = 'Volver' }) {
  return (
    <button type="button" className="qq-link-volver" onClick={onClick}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>{texto}</span>
    </button>
  );
}

export default function CiegasOnline({
  tituloJuego = 'Ranking a Ciegas',
  descripcionJuego,
  onLocal,
  onSalir,
  onAbrirAyuda
}) {
  const [rondasSel, setRondasSel] = useState(rondasPorDefecto('ciegas'));
  const navigate = useNavigate();
  const [vista, setVista] = useState('menu'); // 'menu' | 'online_menu' | 'crear' | 'unirse' | 'sala'
  const [nombre, setNombre] = useState(nombreIdentidad);
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  const [modalSalirLobby, setModalSalirLobby] = useState(false);
  const [modalSalirPortada, setModalSalirPortada] = useState(false);
  const [eligiendoCategoria, setEligiendoCategoria] = useState(false);

  const [sesion, setSesion] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_SESION_CIEGAS));
    } catch {
      return null;
    }
  });

  const [sala, setSala] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sesion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSala(null);
      return undefined;
    }

    const consultarEstado = () => {
      fetch(`/api/ciegas/online/sala/${sesion.code}?token=${sesion.token}`)
        .then((r) => {
          if (!r.ok) throw new Error('Sala no disponible');
          return r.json();
        })
        .then((d) => {
          if (d.success) {
            setSala(d);
            setVista('sala');
          }
        })
        .catch(() => {
          sessionStorage.removeItem(CLAVE_SESION_CIEGAS);
          setSesion(null);
          setSala(null);
          setVista('online_menu');
          setErrorMsg('La sala se ha cerrado o se ha perdido la conexión.');
        });
    };

    consultarEstado();
    intervalRef.current = setInterval(consultarEstado, 600);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sesion]);

  const redirigirAPortada = () => {
    if (typeof onSalir === 'function') {
      onSalir();
    } else {
      try {
        navigate('/');
      } catch {
        window.location.href = '/';
      }
    }
  };

  const handleCerrarSalaYSalirAPortada = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    sessionStorage.removeItem(CLAVE_SESION_CIEGAS);
    setSesion(null);
    setSala(null);
    setModalSalirPortada(false);
    redirigirAPortada();
  };

  const handleVolverMenuOnline = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    sessionStorage.removeItem(CLAVE_SESION_CIEGAS);
    setSesion(null);
    setSala(null);
    setModalSalirLobby(false);
    setEligiendoCategoria(false);
    setVista('online_menu');
  };

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setCargando(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/ciegas/online/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_CIEGAS, JSON.stringify(nueva));
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
      const res = await fetch('/api/ciegas/online/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigoInput.trim().toUpperCase(), nombre: nombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nueva = { code: data.code, token: data.token };
      sessionStorage.setItem(CLAVE_SESION_CIEGAS, JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleElegirCategoriaYArrancar = async (cat) => {
    const catId = typeof cat === 'object' ? cat.id : cat;
    setErrorMsg('');
    setEligiendoCategoria(false);
    try {
      await fetch(`/api/ciegas/online/sala/${sesion.code}/configurar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, categoria: catId })
      });
      const res = await fetch(`/api/ciegas/online/sala/${sesion.code}/iniciar-ronda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, rondas: rondasSel })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleIniciarRonda = async () => {
    setErrorMsg('');
    setEligiendoCategoria(false);
    try {
      const res = await fetch(`/api/ciegas/online/sala/${sesion.code}/iniciar-ronda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, rondas: rondasSel })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleColocarPosicion = async (posicion) => {
    try {
      await fetch(`/api/ciegas/online/sala/${sesion.code}/colocar-posicion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, posicion })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnviarVoto = async (prediccion) => {
    try {
      await fetch(`/api/ciegas/online/sala/${sesion.code}/votar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sesion.token, prediccion })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const copiarCodigo = () => {
    if (!sala?.code) return;
    navigator.clipboard?.writeText(sala.code);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };

  const ronda = sala?.ronda;
  const esAdmin = Boolean(sala?.esAdmin);
  const yoId = sala?.yoId;
  const jugadorActivo = sala?.jugadores?.find((j) => j.id === sala?.jugadorActivoId);
  const soyElActivo = sala?.jugadorActivoId === yoId;
  const miVoto = ronda?.votos ? ronda.votos[yoId] : undefined;

  const categoriaInfo =
    CATEGORIAS_CIEGAS.find((c) => c.id === sala?.categoria) || CATEGORIAS_CIEGAS[0];

  const ranking = sala?.jugadores ? [...sala.jugadores].sort((a, b) => b.puntos - a.puntos) : [];
  const maximoPuntos = ranking.length ? ranking[0].puntos : 0;

  const enPartidaActiva = vista === 'sala' && sala && (sala.estado !== 'lobby' || eligiendoCategoria);

  // Salón de la fama: se guarda la partida al llegar a la pantalla final
  useRegistrarPartida('ciegas', sala?.estado === 'resultados' && sala?.rondaNum >= sala?.maxRondas ? ganadoresPorPuntos((sala?.jugadores || []).filter((j) => !j.fuera && !j.abandonado).map((j) => ({ nombre: j.nombre, puntos: j.puntos ?? null }))) : null);
  return (
    <div className={`ciegas-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
      {/* 1. MENÚ PRINCIPAL */}
      {vista === 'menu' && (
        <section className="game">
          <div className="panel center qq-menu-panel">
            <div className="qq-card-top solo-derecha">
              <button
                type="button"
                className="qq-btn-ayuda"
                onClick={onAbrirAyuda}
                title="Cómo jugar"
                aria-label="Cómo jugar"
              >
                ?
              </button>
            </div>

            <div className="qq-hero-icono">
              <Icon name="trophy" size={44} strokeWidth={1.7} />
            </div>
            <h1 className="title qq-main-title">{tituloJuego}</h1>
            <ChipJugadores juegoId="ciegas" />
            <p className="hint qq-main-desc">{descripcionJuego}</p>
            <SalonFama juegoId="ciegas" />

            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

            <div className="qq-menu-opciones">
              <button
                type="button"
                className="qq-opcion-card principal"
                onClick={() => {
                  setVista('online_menu');
                  setErrorMsg('');
                }}
              >
                <span className="qq-opcion-icono">
                  <Icon name="globe" size={26} />
                </span>
                <div className="qq-opcion-textos">
                  <strong>Jugar online</strong>
                  <span>Cada jugador desde su propio móvil con código de sala</span>
                </div>
              </button>

              <button
                type="button"
                className="qq-opcion-card secundaria"
                onClick={onLocal}
              >
                <span className="qq-opcion-icono">
                  <Icon name="users" size={26} />
                </span>
                <div className="qq-opcion-textos">
                  <strong>Jugar en un único dispositivo</strong>
                  <span>Pasando el móvil por turnos entre los jugadores</span>
                </div>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 1B. SUBMENÚ ONLINE */}
      {vista === 'online_menu' && (
        <section className="game">
          <div className="panel center qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver
                onClick={() => {
                  setVista('menu');
                  setErrorMsg('');
                }}
              />
              <button
                type="button"
                className="qq-btn-ayuda"
                onClick={onAbrirAyuda}
                title="Cómo jugar"
                aria-label="Cómo jugar"
              >
                ?
              </button>
            </div>

            <div className="qq-hero-icono">
              <Icon name="globe" size={40} strokeWidth={1.7} />
            </div>
            <h2 className="title qq-main-title">Modo Online</h2>
            <p className="hint qq-main-desc">
              Crea una sala nueva para compartir el código con tus amigos o únete a una ya creada.
            </p>

            {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

            <div className="qq-menu-opciones">
              <button
                type="button"
                className="qq-opcion-card principal"
                onClick={() => {
                  setVista('crear');
                  setErrorMsg('');
                }}
              >
                <span className="qq-opcion-icono">
                  <Icon name="crown" size={26} />
                </span>
                <div className="qq-opcion-textos">
                  <strong>Crear partida</strong>
                  <span>Sé el anfitrión, genera un código y elige la temática</span>
                </div>
              </button>

              <button
                type="button"
                className="qq-opcion-card secundaria"
                onClick={() => {
                  setVista('unirse');
                  setErrorMsg('');
                }}
              >
                <span className="qq-opcion-icono">
                  <Icon name="users" size={26} />
                </span>
                <div className="qq-opcion-textos">
                  <strong>Unirse con código</strong>
                  <span>Introduce el código de 4 letras de tu anfitrión</span>
                </div>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. CREAR SALA */}
      {vista === 'crear' && (
        <section className="game">
          <div className="panel center qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver
                onClick={() => {
                  setVista('online_menu');
                  setErrorMsg('');
                }}
              />
              <button
                type="button"
                className="qq-btn-ayuda"
                onClick={onAbrirAyuda}
                title="Cómo jugar"
                aria-label="Cómo jugar"
              >
                ?
              </button>
            </div>

            <div className="qq-hero-icono">
              <Icon name="crown" size={40} strokeWidth={1.6} />
            </div>
            <h2 className="title qq-main-title">Crear partida</h2>
            <p className="hint qq-main-desc">
              Introduce tu nombre para abrir la sala y ser el anfitrión.
            </p>

            <div className="lb-form qq-form-estilizado">
              <label className="field-label" htmlFor="ciegas-host-nombre">Tu nombre</label>
              <input
                id="ciegas-host-nombre"
                className="qq-input-moderno"
                type="text"
                placeholder="Ej. Alex"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
                autoFocus
              />
              {errorMsg && <p className="error">{errorMsg}</p>}

              <button
                type="button"
                className="big full qq-btn-principal"
                disabled={cargando || !nombre.trim()}
                onClick={handleCrear}
              >
                <Icon name="check" size={22} strokeWidth={2.5} /> Crear sala
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3. UNIRSE A SALA */}
      {vista === 'unirse' && (
        <section className="game">
          <div className="panel center qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver
                onClick={() => {
                  setVista('online_menu');
                  setErrorMsg('');
                }}
              />
              <button
                type="button"
                className="qq-btn-ayuda"
                onClick={onAbrirAyuda}
                title="Cómo jugar"
                aria-label="Cómo jugar"
              >
                ?
              </button>
            </div>

            <div className="qq-hero-icono">
              <Icon name="users" size={40} strokeWidth={1.6} />
            </div>
            <h2 className="title qq-main-title">Unirse a partida</h2>
            <p className="hint qq-main-desc">
              Introduce el código que te ha compartido el anfitrión y tu nombre.
            </p>

            <div className="lb-form qq-form-estilizado">
              <label className="field-label" htmlFor="ciegas-code-input">Código de la partida</label>
              <input
                id="ciegas-code-input"
                className="lb-input-codigo qq-input-moderno"
                type="text"
                placeholder="ABCD"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                maxLength={4}
                autoFocus
              />

              <label className="field-label" htmlFor="ciegas-guest-nombre" style={{ marginTop: '1rem' }}>
                Tu nombre
              </label>
              <input
                id="ciegas-guest-nombre"
                className="qq-input-moderno"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
              />
              {errorMsg && <p className="error">{errorMsg}</p>}

              <button
                type="button"
                className="big full qq-btn-principal"
                disabled={cargando || !nombre.trim() || codigoInput.trim().length < 4}
                onClick={handleUnirse}
              >
                <Icon name="check" size={22} strokeWidth={2.5} /> Entrar en la partida
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4A. SALA DE ESPERA (LOBBY - DE 3 A 10 JUGADORES) */}
      {vista === 'sala' && sala && sala.estado === 'lobby' && !eligiendoCategoria && (
        <section className="game">
          <div className="panel center qq-menu-panel">
            <div className="qq-card-top">
              <BotonVolver onClick={() => setModalSalirLobby(true)} />
              <button
                type="button"
                className="qq-btn-ayuda"
                onClick={onAbrirAyuda}
                title="Cómo jugar"
                aria-label="Cómo jugar"
              >
                ?
              </button>
            </div>

            <span className="qq-badge-sala"><Icon name="lock" size={15} /> Sala de espera</span>
            <p className="hint">Código de la partida</p>
            <button
              type="button"
              className="qq-codigo-btn"
              onClick={copiarCodigo}
              title="Copiar código"
            >
              {sala.code}
            </button>
            <p className="hint small">
              {codigoCopiado
                ? '¡Copiado al portapapeles!'
                : 'Pulsa el código para copiarlo y compártelo con los demás.'}
            </p>
          </div>

          <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
            <h3 className="qq-sala-titulo">
              <Icon name="users" size={20} /> Jugadores ({sala.jugadores.length}/10)
            </h3>
            <div className="lb-lista qq-sala-lista">
              {sala.jugadores.map((j) => (
                <div key={j.id} className={`lb-jug ${j.id === yoId ? 'yo' : ''}`}>
                  <span className="lb-jug-nombre">
                    {j.nombre}{j.id === yoId ? ' (tú)' : ''}{j.id === 1 ? ' 👑' : ''}
                  </span>
                </div>
              ))}
            </div>
            {sala.jugadores.length < LIM_ON.min && (
              <p className="hint" style={{ marginTop: '0.8rem' }}>
                {LIM_ON.min - sala.jugadores.length === 1 ? 'Falta al menos 1 jugador' : `Faltan al menos ${LIM_ON.min - sala.jugadores.length} jugadores`} para poder empezar (mínimo {LIM_ON.min}).
              </p>
            )}
          </div>

          {errorMsg && <p className="error" style={{ margin: '0.8rem 0' }}>{errorMsg}</p>}

          {esAdmin && (
            <div className="panel qq-menu-panel" style={{ marginTop: '1rem' }}>
              <SelectorRondas juegoId="ciegas" valor={rondasSel} onCambiar={setRondasSel} numJugadores={sala.jugadores.length} />
            </div>
          )}
          {esAdmin ? (
            <button
              type="button"
              className="big full qq-btn-principal"
              style={{ marginTop: '1rem' }}
              disabled={sala.jugadores.length < LIM_ON.min}
              onClick={() => setEligiendoCategoria(true)}
            >
              <Icon name="play" size={22} />
              {sala.jugadores.length < LIM_ON.min ? `Esperando rivales (mínimo ${LIM_ON.min})...` : '¡Iniciar juego!'}
            </button>
          ) : (
            <div className="panel center" style={{ padding: '1.8rem 1.4rem', marginTop: '1rem' }}>
              <span className="lb-luna chica"><Icon name="hourglass" size={36} /></span>
              <h3 style={{ margin: '0.4rem 0' }}>Esperando al anfitrión...</h3>
              <p className="hint">
                El anfitrión iniciará la partida y elegirá la temática cuando estéis todos listos.
              </p>
            </div>
          )}
        </section>
      )}

      {/* 4B. SELECTOR DE CATEGORÍA (ANFITRIÓN) */}
      {vista === 'sala' && sala && eligiendoCategoria && esAdmin && (
        <SelectorCategorias
          categorias={CATEGORIAS_CIEGAS}
          rondaActual={1}
          onElegir={handleElegirCategoriaYArrancar}
          onSalir={() => setEligiendoCategoria(false)}
          textoSalir="Volver"
          onAyuda={onAbrirAyuda}
          aviso="Al tocar una categoría comenzará la ronda en los móviles de todos los jugadores."
        />
      )}

      {/* 5. JUGANDO ONLINE: ARMANDO EL RANKING (CON DRAG & DROP + CONFIRMAR/DESHACER) */}
      {vista === 'sala' && sala && sala.estado === 'armando_ranking' && ronda && !eligiendoCategoria && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={categoriaInfo}
            etiqueta={
              soyElActivo
                ? `¡Es tu turno! · Elemento ${ronda.indiceSecuencia + 1} de 5`
                : `Armando el Top 5 · Elemento ${ronda.indiceSecuencia + 1} de 5`
            }
            titulo={soyElActivo ? '¡Coloca a ciegas!' : `Turno de ${jugadorActivo?.nombre}`}
            avatar={
              jugadorActivo ? (
                <Avatar
                  nombre={jugadorActivo.nombre}
                  color={colorJugador(indiceColor(jugadorActivo, 0))}
                />
              ) : undefined
            }
          >
            <CajaTemaRanking categoriaNombre={categoriaInfo?.nombre} tema={ronda.tema} />
            <OrdenTurnos
              jugadores={sala.jugadores}
              activoId={sala.jugadorActivoId}
            />
          </Cabecera>

          {soyElActivo ? (
            <TableroArmarTopCiegas
              itemActual={ronda.itemsSecuencia[ronda.indiceSecuencia]}
              numeroElemento={ronda.indiceSecuencia + 1}
              topArmado={ronda.topArmado}
              onConfirmarPuesto={(slotIdx) => handleColocarPosicion(slotIdx + 1)}
            />
          ) : (
            <div className="qqp-tarjeta qqp-pasar">
              <span className="lb-luna chica"><Icon name="hourglass" size={34} /></span>
              <p className="qqp-pasar-para">Armando el Top 5</p>
              <h3 className="qqp-pasar-nombre" style={{ fontSize: '1.65rem' }}>
                {jugadorActivo?.nombre}
              </h3>
              <p className="qqp-texto">
                Está arrastrando y colocando los elementos uno a uno sin saber cuáles saldrán después…
              </p>

              <div className="ciegas-preview-progreso">
                {ronda.topArmado.map((item, idx) => (
                  <div key={idx} className={`ciegas-slot-indicador ${item ? 'relleno' : ''}`}>
                    {idx + 1}º {item ? '✓' : '…'}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 6. VOTANDO ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'votando' && ronda && !eligiendoCategoria && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={categoriaInfo}
            etiqueta={`Votación · ${Object.keys(ronda.votos || {}).length} de ${sala.jugadores.length - 1} votos`}
            titulo={
              soyElActivo
                ? 'Están valorando tu Top 5'
                : miVoto !== undefined
                ? '¡Voto registrado!'
                : `Valora el Top de ${jugadorActivo?.nombre}`
            }
            avatar={
              jugadorActivo ? (
                <Avatar
                  nombre={jugadorActivo.nombre}
                  color={colorJugador(indiceColor(jugadorActivo, 0))}
                />
              ) : undefined
            }
          >
            <CajaTemaRanking categoriaNombre={categoriaInfo?.nombre} tema={ronda.tema} />
            <OrdenTurnos
              jugadores={sala.jugadores}
              activoId={sala.jugadorActivoId}
              votadosMap={ronda.votos || {}}
            />
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.65rem' }}>
              <Icon name="eye" size={16} /> Top 5 terminado por {jugadorActivo?.nombre}
            </p>

            <ListaTopCinco topArmado={ronda.topArmado} />

            {soyElActivo ? (
              <p className="ciegas-espera-votos-msg">
                ⏳ Tus compañeros están votando cuántos puntos merece tu ranking…
              </p>
            ) : (
              <>
                <p className="ciegas-voto-label">
                  ¿Cuántos puntos (de 0 a 5) le das a este ranking?
                </p>

                <div className="ciegas-voto-grid">
                  {[0, 1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`ciegas-btn-voto ${miVoto === num ? 'seleccionado' : ''}`}
                      onClick={() => handleEnviarVoto(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                {miVoto !== undefined && (
                  <p className="ciegas-voto-confirmado">
                    ✓ Has otorgado <strong>+{miVoto} pts</strong>. Esperando al resto…
                  </p>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* 7. RESULTADOS ONLINE */}
      {vista === 'sala' && sala && sala.estado === 'resultados' && ronda && !eligiendoCategoria && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            categoria={categoriaInfo}
            etiqueta={`Ronda ${sala.rondaNum} de ${sala.maxRondas} completada`}
            titulo={`${jugadorActivo?.nombre} suma +${ronda.totalPuntosGanados || 0} pts`}
            avatar={
              jugadorActivo ? (
                <Avatar
                  nombre={jugadorActivo.nombre}
                  color={colorJugador(indiceColor(jugadorActivo, 0))}
                />
              ) : undefined
            }
          >
            <CajaTemaRanking categoriaNombre={categoriaInfo?.nombre} tema={ronda.tema} />
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.65rem' }}>
              <Icon name="trophy" size={16} /> Top 5 completado por {jugadorActivo?.nombre}
            </p>
            <ListaTopCinco topArmado={ronda.topArmado} />
          </div>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.65rem' }}>
              <Icon name="users" size={16} /> Votos otorgados por el grupo
            </p>
            <div className="ciegas-votos-desglose">
              {sala.jugadores.map((j) => {
                if (j.id === sala.jugadorActivoId) return null;
                const suVoto = ronda.votos?.[j.id] ?? 0;
                return (
                  <div key={j.id} className="ciegas-resumen-voto-row">
                    <span>
                      <strong>{j.nombre}{j.id === yoId ? ' (tú)' : ''}</strong> le otorgó
                    </span>
                    <span className="ciegas-badge-pts">+{suVoto} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="crown" size={16} /> Clasificación general
            </p>
            <ul className="qqp-rivales">
              {ranking.map((j, i) => {
                const lider = maximoPuntos > 0 && j.puntos === maximoPuntos;
                return (
                  <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                    <span className="qqp-rival-avatar">{lider ? '👑' : i + 1}</span>
                    <span className="qqp-rival-datos">
                      <span className="qqp-rival-nombre">{lider ? 'Líder actual' : `Puesto ${i + 1}`}</span>
                      <strong className="qqp-rival-tarjeta">
                        {j.nombre}{j.id === yoId ? ' (tú)' : ''}
                      </strong>
                    </span>
                    <span className="ciegas-ranking-pts">{j.puntos} pts</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="qqp-barra">
            {sala.rondaNum >= sala.maxRondas ? (
              <>
                <p className="qqp-estado">🏆 ¡Partida terminada! {ranking[0] ? `Gana ${ranking.filter((j) => j.puntos === maximoPuntos).map((j) => j.nombre).join(' y ')}.` : ''}</p>
                <EnlaceSecundario onClick={() => setModalSalirPortada(true)}>
                  Salir a la portada
                </EnlaceSecundario>
              </>
            ) : esAdmin ? (
              <>
                <BotonPrincipal onClick={handleIniciarRonda}>
                  <Icon name="play" size={20} /> Siguiente ronda ({sala.rondaNum + 1} de {sala.maxRondas} · {categoriaInfo.nombre})
                </BotonPrincipal>
                <EnlaceSecundario onClick={() => setEligiendoCategoria(true)}>
                  Cambiar temática para la siguiente ronda
                </EnlaceSecundario>
                <EnlaceSecundario onClick={() => setModalSalirPortada(true)}>
                  Salir a la portada
                </EnlaceSecundario>
              </>
            ) : (
              <p className="qqp-estado">
                <span className="qqp-spinner" aria-hidden="true" /> Esperando a que el anfitrión lance la siguiente ronda…
              </p>
            )}
          </div>
        </section>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA SALIR DEL LOBBY AL SUBMENÚ */}
      {modalSalirLobby && (
        <div className="rg-modal-fondo" onClick={() => setModalSalirLobby(false)}>
          <div
            className="rg-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🚪</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>
              ¿Salir de la sala?
            </h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              Si sales ahora abandonarás la sala de espera y volverás al menú anterior. ¿Estás seguro?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button
                type="button"
                className="secondary full"
                onClick={() => setModalSalirLobby(false)}
              >
                No, quedarme
              </button>
              <button
                type="button"
                className="secondary danger full"
                style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }}
                onClick={handleVolverMenuOnline}
              >
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CERRAR SALA Y SALIR A PORTADA */}
      {modalSalirPortada && (
        <div className="rg-modal-fondo" onClick={() => setModalSalirPortada(false)}>
          <div
            className="rg-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '420px', textAlign: 'center', padding: '1.8rem 1.4rem' }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🚪</div>
            <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.3rem' }}>
              ¿Salir a la portada?
            </h3>
            <p className="hint" style={{ fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: '1.4' }}>
              Abandonarás la partida actual y volverás a la portada principal. ¿Estás seguro?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button
                type="button"
                className="secondary full"
                onClick={() => setModalSalirPortada(false)}
              >
                No, quedarme
              </button>
              <button
                type="button"
                className="secondary danger full"
                style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }}
                onClick={handleCerrarSalaYSalirAPortada}
              >
                Sí, salir de la sala
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}