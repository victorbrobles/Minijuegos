// client/src/games/Trescientosuno/TrescientosunoLocal.jsx
import { EscudoDibujado } from '../Trayectoria/Vistas.jsx';
import { useRegistrarPartida } from '../../lib/registros.js';
import { nombreIdentidad } from '../../lib/identidad.js';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import './Trescientosuno.css';
import { centrarActivo } from '../../lib/centrarActivo.js';
import { limitesLocal } from '../limites.js';
import { SelectorRondas, SelectorJugadores } from '../../components/MenuJuego.jsx';
import { rondasPorDefecto, totalRondas } from '../rondas.js';
import { avisarNombres } from '../../lib/nombres.js';
import CaraJugador from '../../components/CaraJugador.jsx';

const { min: MIN_JUGADORES, max: MAX_JUGADORES } = limitesLocal('trescientosuno');
const TIEMPO_TURNO = 60;

const COLORES = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'];
export const colorJugador = (i) => COLORES[((i % COLORES.length) + COLORES.length) % COLORES.length];
export const inicial = (nombre = '?') => nombre.trim().charAt(0).toUpperCase() || '?';
export const indiceColor = (j, i) => (typeof j?.id === 'number' ? j.id - 1 : i);

// Escudos DIBUJADOS (no se usan escudos reales: son marcas de clubes y federaciones): colores y siglas de cada equipo
const ESCUDOS_301 = {
  alemania: ['#000000', '#dd0000', 'GER'], argentina: ['#75aadb', '#ffffff', 'ARG'], arsenal: ['#ef0107', '#ffffff', 'ARS'],
  athletic_bilbao: ['#ee2523', '#ffffff', 'ATH'], atletico_madrid: ['#cb3524', '#ffffff', 'ATM'], barcelona: ['#a50044', '#004d98', 'FCB'],
  bayern: ['#dc052d', '#ffffff', 'BAY'], betis: ['#0bb363', '#ffffff', 'RBB'], brasil: ['#ffdf00', '#009c3b', 'BRA'],
  celta: ['#8ac3ee', '#ffffff', 'RCC'], chelsea: ['#034694', '#ffffff', 'CFC'], depor: ['#0067b1', '#ffffff', 'RCD'],
  dortmund: ['#fde100', '#000000', 'BVB'], espana: ['#c60b1e', '#ffc400', 'ESP'], espanyol: ['#007fc8', '#ffffff', 'RCDE'],
  francia: ['#002395', '#ffffff', 'FRA'], getafe: ['#005999', '#ffffff', 'GCF'], holanda: ['#ff6600', '#ffffff', 'NED'],
  inglaterra: ['#ffffff', '#cf081f', 'ENG'], inter: ['#0068a8', '#000000', 'INT'], italia: ['#0066b3', '#ffffff', 'ITA'],
  juventus: ['#ffffff', '#000000', 'JUV'], liverpool: ['#c8102e', '#ffffff', 'LFC'], man_city: ['#6cabdd', '#ffffff', 'MCI'],
  man_united: ['#da291c', '#000000', 'MUN'], milan: ['#fb090b', '#000000', 'ACM'], napoli: ['#12a0d7', '#ffffff', 'NAP'],
  osasuna: ['#d91a21', '#0a346f', 'OSA'], portugal: ['#da291c', '#046a38', 'POR'], psg: ['#004170', '#da291c', 'PSG'],
  real_madrid: ['#ffffff', '#1e3a8a', 'RMA'], real_sociedad: ['#0067b1', '#ffffff', 'RSO'], sevilla: ['#ffffff', '#d4021d', 'SFC'],
  spurs: ['#ffffff', '#132257', 'THF'], valencia: ['#ffffff', '#000000', 'VCF'], villarreal: ['#ffe667', '#005187', 'VIL'],
  zaragoza: ['#ffffff', '#0047ab', 'RZG']
};
/** Datos para dibujar el escudo de un equipo de 301 Goles. */
export const clubDibujado = (eq) => {
  const [c1, c2, siglas] = ESCUDOS_301[eq?.id] || ['#475569', '#ffffff', null];
  return { nombre: eq?.nombre || '', colores: [c1, c2], siglas: siglas || undefined };
};

/* ==========================================================================
   COMPONENTES DE TABLERO COMPARTIDOS (SISTEMA VISUAL .qqp-* / .cnp-*)
   ========================================================================== */

export function Aviso({ evento }) {
  const [visible, setVisible] = useState(null);
  const ultimo = useRef(evento?.n ?? 0);

  useEffect(() => {
    if (!evento || evento.n === ultimo.current) return undefined;
    ultimo.current = evento.n;
    setVisible(evento);
    const id = setTimeout(() => setVisible(null), 3500);
    return () => clearTimeout(id);
  }, [evento]);

  if (!visible) return null;
  const bueno = visible.tipo === 'acierto' || visible.tipo === 'ganador';
  const malo = visible.tipo === 'eliminado' || visible.tipo === 'fallo';

  return (
    <div className={`cnp-aviso${bueno ? ' bueno' : ''}${malo ? ' malo' : ''}`} role="status" aria-live="polite">
      <span aria-hidden="true">
        {visible.tipo === 'ganador' ? '🏆' : bueno ? '⚽' : visible.tipo === 'eliminado' ? '💀' : visible.tipo === 'plantado' ? '🛑' : 'ℹ️'}
      </span>
      {visible.texto}
    </div>
  );
}

export function BotonPortada({ onClick, texto = 'Portada' }) {
  return (
    <button type="button" className="qqp-salir" onClick={onClick}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>{texto}</span>
    </button>
  );
}

export function Avatar({ nombre, color, grande = false }) {
  return (
    <span className={`qqp-avatar${grande ? ' grande' : ''}`} style={{ '--c': color }}>
      <CaraJugador nombre={nombre} />
    </span>
  );
}

export function EscudoEquipo({ equipo, size = 52 }) {
  if (!equipo) return null;

  return (
    <span
      className="tcu-hero-escudo"
      style={{ width: `${size}px`, height: `${size}px` }}
      title={equipo.nombre}
    >
      <EscudoDibujado club={clubDibujado(equipo)} clase="tcu-escudo-svg" />
    </span>
  );
}

export function Cabecera({ onSalir, textoSalir = 'Portada', chips, etiqueta, titulo, avatar, children }) {
  return (
    <header className="qqp-hero">
      <span className="qqp-hero-deco" aria-hidden="true">
        <Icon name="goal301" size={150} strokeWidth={1.4} />
      </span>
      <div className="qqp-hero-top">
        {onSalir ? <BotonPortada onClick={onSalir} texto={textoSalir} /> : <span />}
        <div className="qqp-hero-chips">
          {chips}
        </div>
      </div>
      <div className="qqp-hero-cuerpo">
        {avatar}
        <div className="qqp-hero-textos">
          {etiqueta && <p className="qqp-hero-etiqueta">{etiqueta}</p>}
          <h2 className="qqp-hero-titulo">{titulo}</h2>
        </div>
      </div>
      {children}
    </header>
  );
}

export function OrdenTurnos({ jugadores, activoId, yoId = null, eventoResta = null }) {
  const ref = useRef(null);
  useEffect(() => {
    centrarActivo(ref.current);
  }, [activoId]);

  return (
    <ol className="qqp-orden" ref={ref} aria-label="Marcador de jugadores">
      {jugadores.map((j, i) => {
        const esActivo = j.id === activoId;
        const eliminado = j.estado === 'eliminado';
        const plantado = j.estado === 'plantado';
        const ganador = j.estado === 'ganador';
        const pts = j.puntuacionActual ?? j.puntos ?? 0;
        const mostrarResta =
          eventoResta &&
          eventoResta.jugadorId === j.id &&
          (eventoResta.tipo === 'acierto' || eventoResta.tipo === 'ganador') &&
          eventoResta.valor;

        return (
          <li
            key={j.id}
            className={`qqp-orden-item${esActivo ? ' activo' : ''}${eliminado ? ' eliminado' : ''}${plantado ? ' plantado' : ''}`}
            style={{ '--c': colorJugador(indiceColor(j, i)) }}
            aria-current={esActivo ? 'step' : undefined}
          >
            <span className="qqp-orden-avatar">
              {eliminado ? '💀' : plantado ? '🛑' : ganador ? '🏆' : <CaraJugador nombre={j.nombre} />}
            </span>
            <span className="qqp-orden-nombre">
              {j.nombre}{yoId && j.id === yoId ? ' (tú)' : ''}
            </span>
            <span className="qqp-orden-pts">
              {eliminado ? 'OUT' : pts}
            </span>
            {mostrarResta && (
              <span className="tcu-chip-resta">-{eventoResta.valor}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function TarjetaEquipo({ equipo, seleccionado, onClick }) {
  return (
    <button
      type="button"
      className={`tcu-equipo-card${seleccionado ? ' sel' : ''}`}
      onClick={onClick}
      title={equipo.nombre}
    >
      <div className="tcu-equipo-logo-wrap">
        <EscudoDibujado club={clubDibujado(equipo)} clase="tcu-escudo-svg" />
      </div>
      <span className="tcu-equipo-nombre">{equipo.nombre}</span>
    </button>
  );
}

export function BotonPrincipal({ children, onClick, disabled, type = 'button' }) {
  return (
    <button type={type} className="qqp-boton" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function EnlaceSecundario({ children, onClick }) {
  return (
    <button type="button" className="qqp-enlace" onClick={onClick}>
      {children}
    </button>
  );
}

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

/* ==========================================================================
   MODO LOCAL: 301 GOLES
   ========================================================================== */

export default function TrescientosunoLocal({ onVolver, onExit, onAbrirAyuda }) {
  const navigate = useNavigate();

  const [fase, setFase] = useState('setup');
  const [modalSalirPortada, setModalSalirPortada] = useState(false);
  // Serie de partidas: en cada una, 3 puntos al primero, 2 al segundo y 1 al tercero
  const [rondasSel, setRondasSel] = useState(rondasPorDefecto('trescientosuno'));
  const maxPartidas = totalRondas('trescientosuno', rondasSel);
  const [serie, setSerie] = useState({ partida: 1, puntos: {} });
  const sumadaRef = useRef(0);

  const [numJugadores, setNumJugadores] = useState(MIN_JUGADORES);
  const [jugadores, setJugadores] = useState(() => Array.from({ length: MIN_JUGADORES }, (_, i) => ({ id: i + 1, nombre: i === 0 ? nombreIdentidad() : '', puntos: 0, estado: 'vivo', comodines: ['x2', 'x3', 'x5', 'revelar'] })));

  const [equipos, setEquipos] = useState([]);
  const [filtroEquipo, setFiltroEquipo] = useState('');
  const [equipoSel, setEquipoSel] = useState(null);

  const [objetivo, setObjetivo] = useState(301);
  const [estadistica, setEstadistica] = useState('goles');

  const [turnoIndex, setTurnoIndex] = useState(0);
  const [jugadoresUsados, setJugadoresUsados] = useState([]);
  const [inputJugador, setInputJugador] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [ultimoAcierto, setUltimoAcierto] = useState(null);

  // Aviso flotante estilo Conecta
  const [eventoAviso, setEventoAviso] = useState(null);
  const avisoSeqRef = useRef(0);

  // Estados Comodines
  const [comodinActivo, setComodinActivo] = useState(null);
  const [opcionesReveladas, setOpcionesReveladas] = useState(null);

  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_TURNO);
  const timerRef = useRef(null);
  const jugadoresRef = useRef(jugadores);
  const turnoRef = useRef(0);
  const timeoutRef = useRef(null);
  const finTurnoRef = useRef(0);
  const turnoCerradoRef = useRef(false);

  useEffect(() => {
    fetch('/api/trescientosuno/equipos')
      .then((r) => r.json())
      .then((d) => { if (d.success) setEquipos(d.equipos); })
      .catch(() => {});
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const lanzarAviso = (tipo, texto) => {
    avisoSeqRef.current += 1;
    setEventoAviso({ n: avisoSeqRef.current, tipo, texto });
  };

  const handleSalirAPortada = () => {
    setModalSalirPortada(false);
    if (typeof onExit === 'function') {
      onExit();
    } else {
      try {
        navigate('/');
      } catch {
        window.location.href = '/';
      }
    }
  };

  const guardarJugadores = (lista) => { jugadoresRef.current = lista; setJugadores(lista); };
  const guardarTurno = (i) => { turnoRef.current = i; setTurnoIndex(i); };
  const detenerTemporizador = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    turnoCerradoRef.current = true;
  };
  const despuesDe = (ms, fn) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(fn, ms);
  };

  const handleNumJugadoresChange = (cantidad) => {
    const cant = Math.min(MAX_JUGADORES, Math.max(MIN_JUGADORES, cantidad));
    setNumJugadores(cant);
    setJugadores((prev) => {
      const nuevaLista = [];
      for (let i = 1; i <= cant; i++) {
        const existente = prev.find((p) => p.id === i);
        nuevaLista.push(existente || { id: i, nombre: '', puntos: 0, estado: 'vivo', comodines: ['x2', 'x3', 'x5', 'revelar'] });
      }
      jugadoresRef.current = nuevaLista;
      return nuevaLista;
    });
  };

  const handleNombreJugador = (id, nuevoNombre) => {
    setJugadores((prev) => {
      const lista = prev.map((j) => (j.id === id ? { ...j, nombre: nuevoNombre } : j));
      jugadoresRef.current = lista;
      return lista;
    });
  };

  const iniciarJuego = () => {
    if (avisarNombres(jugadoresRef.current)) return;
    const jActualizados = jugadoresRef.current.map((j) => ({
      ...j,
      nombre: j.nombre.trim() || `Jugador ${j.id}`,
      puntos: objetivo,
      estado: 'vivo',
      comodines: ['x2', 'x3', 'x5', 'revelar']
    }));

    guardarJugadores(jActualizados);
    setJugadoresUsados([]);
    setUltimoAcierto(null);
    setComodinActivo(null);
    setOpcionesReveladas(null);
    const startIndex = Math.floor(Math.random() * jActualizados.length);
    guardarTurno(startIndex);
    setFase('jugando');
    iniciarTemporizador();
  };

  const iniciarTemporizador = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    turnoCerradoRef.current = false;
    finTurnoRef.current = Date.now() + TIEMPO_TURNO * 1000;
    setTiempoRestante(TIEMPO_TURNO);
    timerRef.current = setInterval(() => {
      const restante = Math.max(0, Math.ceil((finTurnoRef.current - Date.now()) / 1000));
      setTiempoRestante(restante);
      if (restante <= 0) {
        detenerTemporizador();
        consumirComodinActivo();
        const curr = jugadoresRef.current[turnoRef.current];
        setUltimoAcierto({ tipo: 'fallo', msj: '¡Tiempo agotado!', jugadorId: curr.id });
        lanzarAviso('fallo', `¡Se agotó el tiempo de ${curr.nombre}!`);
        despuesDe(2000, pasarTurno);
      }
    }, 250);
  };

  const pasarTurno = () => {
    detenerTemporizador();
    setMensajeError('');
    setInputJugador('');
    setUltimoAcierto(null);
    setComodinActivo(null);
    setOpcionesReveladas(null);

    const lista = jugadoresRef.current;
    if (!lista.some((j) => j.estado === 'vivo')) {
      setFase('resultados');
      return;
    }

    let nextIndex = (turnoRef.current + 1) % lista.length;
    while (lista[nextIndex].estado !== 'vivo') {
      nextIndex = (nextIndex + 1) % lista.length;
    }
    guardarTurno(nextIndex);
    iniciarTemporizador();
  };

  const actualizarActual = (cambios) => {
    const nuevos = jugadoresRef.current.map((j, i) => (i === turnoRef.current ? { ...j, ...cambios } : j));
    guardarJugadores(nuevos);
    return nuevos;
  };

  const consumirComodinActivo = () => {
    if (!comodinActivo) return;
    const jActual = jugadoresRef.current[turnoRef.current];
    actualizarActual({ comodines: jActual.comodines.filter((c) => c !== comodinActivo) });
  };

  const handleEliminacion = (motivo) => {
    detenerTemporizador();
    consumirComodinActivo();
    const currId = jugadoresRef.current[turnoRef.current].id;
    actualizarActual({ estado: 'eliminado' });
    setUltimoAcierto({ tipo: 'eliminado', msj: motivo, jugadorId: currId });
    lanzarAviso('eliminado', motivo);
    despuesDe(3000, pasarTurno);
  };

  const handlePlantarse = () => {
    detenerTemporizador();
    const curr = jugadoresRef.current[turnoRef.current];
    actualizarActual({ estado: 'plantado' });
    const texto = `${curr.nombre} se ha plantado en ${curr.puntos}.`;
    setUltimoAcierto({ tipo: 'plantado', msj: texto, jugadorId: curr.id });
    lanzarAviso('plantado', texto);
    despuesDe(1500, pasarTurno);
  };

  const handlePasar = () => {
    detenerTemporizador();
    const curr = jugadoresRef.current[turnoRef.current];
    const texto = `${curr.nombre} ha pasado el turno.`;
    setUltimoAcierto({ tipo: 'fallo', msj: texto, jugadorId: curr.id });
    lanzarAviso('info', texto);
    despuesDe(2000, pasarTurno);
  };

  const activarRevelar = async () => {
    setComodinActivo('revelar');
    try {
      const res = await fetch('/api/trescientosuno/revelar-opciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipoId: equipoSel.id, usados: jugadoresUsados })
      });
      const data = await res.json();
      if (data.success) {
        setOpcionesReveladas(data.opciones);
      } else {
        setMensajeError(data.error || 'Error al obtener opciones');
      }
    } catch {
      setMensajeError('Error de conexión.');
    }
  };

  const validarJugador = async (nombreAValidar) => {
    if (ultimoAcierto) return;
    if (!nombreAValidar.trim()) {
      setMensajeError('No has escrito ningún jugador.');
      return;
    }

    try {
      const res = await fetch('/api/trescientosuno/validar-jugador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipoId: equipoSel.id, nombreJugador: nombreAValidar })
      });

      if (!res.ok) {
        try {
          const errData = await res.json();
          setMensajeError(errData.error || `Error del servidor: ${res.status}`);
        } catch {
          setMensajeError(`Error del servidor: ${res.status}`);
        }
        return;
      }

      const data = await res.json();

      if (!(data.success && data.encontrado)) {
        setMensajeError(data.mensaje || 'Jugador no encontrado.');
        return;
      }

      const jbd = data.jugador;
      if (jugadoresUsados.includes(jbd.nombre)) {
        setMensajeError(`${jbd.nombre} ya ha sido dicho.`);
        return;
      }

      if (turnoCerradoRef.current) return;

      let multiplicador = 1;
      if (comodinActivo === 'x2') multiplicador = 2;
      if (comodinActivo === 'x3') multiplicador = 3;
      if (comodinActivo === 'x5') multiplicador = 5;

      const valorBase = Number(jbd[estadistica]) || 0;
      const valorEstadistica = valorBase * multiplicador;

      if (valorBase === 0) {
        handleEliminacion(`${jbd.nombre} tiene 0 ${estadistica}. ¡Eliminado!`);
        return;
      }

      detenerTemporizador();
      consumirComodinActivo();
      const curr = jugadoresRef.current[turnoRef.current];
      const nuevaPuntuacion = curr.puntos - valorEstadistica;
      setJugadoresUsados((prev) => [...prev, jbd.nombre]);

      if (nuevaPuntuacion === 0) {
        actualizarActual({ puntos: 0, estado: 'ganador' });
        const msj = `¡DIANA! ${jbd.nombre} (-${valorEstadistica}). ¡${curr.nombre} ha clavado el 0!`;
        setUltimoAcierto({ tipo: 'ganador', msj, jugadorId: curr.id, valor: valorEstadistica });
        lanzarAviso('ganador', msj);
        despuesDe(3500, () => setFase('resultados'));
      } else if (nuevaPuntuacion < 0) {
        actualizarActual({ puntos: nuevaPuntuacion });
        handleEliminacion(`${jbd.nombre} restó ${valorEstadistica}. Te has pasado de 0.`);
      } else {
        actualizarActual({ puntos: nuevaPuntuacion });
        const msj = `¡${jbd.nombre} resta ${valorEstadistica} ${estadistica} (quedan ${nuevaPuntuacion})!`;
        setUltimoAcierto({ tipo: 'acierto', msj: `¡${jbd.nombre}! (-${valorEstadistica})`, jugadorId: curr.id, valor: valorEstadistica });
        lanzarAviso('acierto', msj);
        despuesDe(2500, pasarTurno);
      }
    } catch {
      setMensajeError('Error de conexión.');
    }
  };

  const getGanador = () => {
    const validos = jugadores.filter((j) => j.puntos >= 0 && j.estado !== 'eliminado');
    if (validos.length === 0) return null;
    return [...validos].sort((a, b) => a.puntos - b.puntos);
  };
  const rankingFinal = getGanador();

  useEffect(() => {
    if (fase !== 'resultados' || sumadaRef.current === serie.partida) return;
    sumadaRef.current = serie.partida;
    const orden = getGanador() || [];
    setSerie((s) => {
      const puntos = { ...s.puntos };
      orden.slice(0, 3).forEach((j, i) => { puntos[j.id] = (puntos[j.id] || 0) + (3 - i); });
      return { ...s, puntos };
    });
  }, [fase]); // eslint-disable-line react-hooks/exhaustive-deps
  const rankingSerie = [...jugadores].sort((a, b) => (serie.puntos[b.id] || 0) - (serie.puntos[a.id] || 0));
  const jActual = jugadores[turnoIndex];

  const normalizar = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const equiposVisibles = filtroEquipo.trim()
    ? equipos.filter((eq) => normalizar(eq.nombre).includes(normalizar(filtroEquipo.trim())))
    : equipos;

  const enPartidaActiva = fase !== 'setup';

  // Salón de la fama: se guarda la partida al llegar a la pantalla final
  useRegistrarPartida('trescientosuno', fase === 'resultados' ? (jugadores || []).filter((j) => j.nombre).map((j) => ({ nombre: j.nombre, puntos: null, gana: j.estado === 'ganador' })) : null);
  return (
    <div className={`tcu-contenedor ${enPartidaActiva ? 'qq-en-partida' : ''}`}>
      <Aviso evento={eventoAviso} />

      {/* 1. CONFIGURACIÓN DE JUGADORES (Única pantalla local con botón de ayuda) */}
      {fase === 'setup' && (
        <SelectorJugadores
          onVolver={onVolver} onAyuda={onAbrirAyuda} min={MIN_JUGADORES} max={MAX_JUGADORES}
          numJugadores={numJugadores} onCambiarNum={handleNumJugadoresChange} nombres={jugadores} maxLength={20}
          onNombre={(idx, valor) => handleNombreJugador(jugadores[idx].id, valor)}
          onEmpezar={() => { if (avisarNombres(jugadores)) return; setSerie({ partida: 1, puntos: {} }); sumadaRef.current = 0; setFase('equipo'); }} textoBoton="Elegir equipo" iconoBoton="play"
        >
          <SelectorRondas juegoId="trescientosuno" valor={rondasSel} onCambiar={setRondasSel} />
        </SelectorJugadores>
      )}

      {/* 2. SELECTOR DE EQUIPO CON BUSCADOR (Sin botón de ayuda) */}
      {fase === 'equipo' && (
        <section className="game qqp-escena">
          <header className="qqp-hero">
            <span className="qqp-hero-deco" aria-hidden="true">
              <Icon name="goal301" size={150} strokeWidth={1.4} />
            </span>
            <div className="qqp-hero-top">
              <BotonPortada texto="Volver" onClick={() => setFase('setup')} />
              <div className="qqp-hero-chips">
                <span className="qqp-chip">
                  <Icon name="users" size={14} /> <span>{jugadores.length} {jugadores.length === 1 ? 'jugador' : 'jugadores'}</span>
                </span>
              </div>
            </div>
            <p className="qqp-hero-etiqueta">Paso 1 de 2</p>
            <h2 className="qqp-hero-titulo">Selecciona un equipo</h2>
            <p className="qqp-hero-aviso">
              Toca el escudo del club o selección cuyos futbolistas tendréis que nombrar.
            </p>

            <label className="qqp-buscador">
              <Icon name="search" size={18} />
              <input
                type="search"
                value={filtroEquipo}
                onChange={(e) => setFiltroEquipo(e.target.value)}
                placeholder="Buscar club o selección…"
                aria-label="Buscar club o selección"
              />
            </label>
          </header>

          {equiposVisibles.length ? (
            <div className="tcu-grid-equipos">
              {equiposVisibles.map((eq) => (
                <TarjetaEquipo
                  key={eq.id}
                  equipo={eq}
                  seleccionado={equipoSel?.id === eq.id}
                  onClick={() => {
                    setEquipoSel(eq);
                    setFase('config');
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="qqp-vacio">No hay ningún equipo que coincida con «{filtroEquipo}».</p>
          )}
        </section>
      )}

      {/* 3. CONFIGURACIÓN DE ESTADÍSTICA Y OBJETIVO (Sin botón de ayuda) */}
      {fase === 'config' && equipoSel && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setFase('equipo')}
            textoSalir="Cambiar equipo"
            etiqueta="Paso 2 de 2 · Reglas de la ronda"
            titulo={equipoSel.nombre}
            avatar={<EscudoEquipo equipo={equipoSel} size={64} />}
          />

          <div className="qqp-tarjeta">
            <div className="tcu-ajustes">
              <div className="form-group">
                <label className="qq-label-destacado" htmlFor="tcu-local-stat">
                  Estadística a restar
                </label>
                <div className="select-wrapper">
                  <select
                    id="tcu-local-stat"
                    className="game-select qq-input-moderno"
                    value={estadistica}
                    onChange={(e) => setEstadistica(e.target.value)}
                  >
                    <option value="goles">⚽ Goles históricos</option>
                    <option value="asistencias">👟 Asistencias históricas</option>
                    <option value="partidos">🏟️ Partidos jugados</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="qq-label-destacado" htmlFor="tcu-local-obj">
                  Puntuación inicial (Objetivo: 0)
                </label>
                <input
                  id="tcu-local-obj"
                  type="number"
                  className="player-text-input qq-input-moderno"
                  value={objetivo}
                  onChange={(e) => setObjetivo(Math.max(1, Number(e.target.value) || 1))}
                  min="1"
                />
              </div>
            </div>
          </div>

          <div className="qqp-barra">
            <BotonPrincipal onClick={iniciarJuego}>
              <Icon name="play" size={22} /> ¡Comenzar partida!
            </BotonPrincipal>
          </div>
        </section>
      )}

      {/* 4. PARTIDA EN JUEGO (Sin botón de ayuda) */}
      {fase === 'jugando' && jActual && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            etiqueta={`Objetivo: clavar 0 ${estadistica}`}
            titulo={`Turno de ${jActual.nombre}`}
            avatar={<EscudoEquipo equipo={equipoSel} size={54} />}
            chips={
              <span className="qqp-chip">
                <Icon name="shield" size={14} /> <span>{equipoSel.nombre}</span>
              </span>
            }
          >
            <div className="qqp-identidad tcu-hero-status">
              <div className="tcu-hero-status-row">
                <span>
                  Te quedan: <strong className="tcu-pts-destacado">{jActual.puntos}</strong> {estadistica}
                </span>
                <span className={`tcu-timer-pill${tiempoRestante <= 10 ? ' low' : ''}`}>
                  <Icon name="clock" size={14} /> {tiempoRestante}s
                </span>
              </div>
              <div className="tcu-timer-track" role="timer">
                <div
                  className={`tcu-timer-fill${tiempoRestante <= 10 ? ' low' : ''}`}
                  style={{ width: `${(tiempoRestante / TIEMPO_TURNO) * 100}%` }}
                />
              </div>
            </div>

            <OrdenTurnos
              jugadores={jugadores}
              activoId={jActual.id}
              eventoResta={ultimoAcierto}
            />
          </Cabecera>

          <div className="qqp-tarjeta tcu-turno-card">
            {ultimoAcierto ? (
              <div className="tcu-evento-display">
                <span className="evento-icon">
                  {ultimoAcierto.tipo === 'acierto' && '⚽'}
                  {ultimoAcierto.tipo === 'ganador' && '🏆'}
                  {ultimoAcierto.tipo === 'fallo' && '❌'}
                  {ultimoAcierto.tipo === 'plantado' && '🛑'}
                  {ultimoAcierto.tipo === 'eliminado' && '💀'}
                </span>
                <h3>{ultimoAcierto.msj}</h3>
              </div>
            ) : (
              <>
                {jActual.comodines && jActual.comodines.length > 0 && (
                  <div className="tcu-comodines-bloque">
                    <span className="qqp-carta-cara-titulo">Comodines disponibles</span>
                    <div className="tcu-comodines">
                      {jActual.comodines.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`btn-comodin ${comodinActivo === c ? 'activo' : ''} ${c === 'revelar' && comodinActivo === 'revelar' ? 'revelar' : ''}`}
                          onClick={() => {
                            if (c === 'revelar') {
                              if (comodinActivo === 'revelar') {
                                setComodinActivo(null);
                                setOpcionesReveladas(null);
                              } else {
                                activarRevelar();
                              }
                            } else {
                              setComodinActivo(comodinActivo === c ? null : c);
                            }
                          }}
                        >
                          {c === 'revelar' ? '🔍 Revelar' : `⭐ ${c.toUpperCase()}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {comodinActivo === 'revelar' && opcionesReveladas ? (
                  <div className="opciones-revelar-grid">
                    <p className="qqp-carta-cara-titulo" style={{ justifyContent: 'center' }}>
                      Elige un futbolista revelado
                    </p>
                    {opcionesReveladas.length > 0 ? (
                      opcionesReveladas.map((op) => (
                        <button
                          key={op.nombre}
                          type="button"
                          className="btn-opcion-revelada"
                          onClick={() => validarJugador(op.nombre)}
                        >
                          ⚽ {op.nombre}
                        </button>
                      ))
                    ) : (
                      <p className="hint">No quedan jugadores disponibles.</p>
                    )}
                    <button
                      type="button"
                      className="tcu-btn-sec"
                      onClick={() => {
                        setComodinActivo(null);
                        setOpcionesReveladas(null);
                      }}
                    >
                      Cancelar y escribir manualmente
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      validarJugador(inputJugador);
                    }}
                    className="tcu-form"
                  >
                    <input
                      type="text"
                      value={inputJugador}
                      onChange={(e) => {
                        setInputJugador(e.target.value);
                        setMensajeError('');
                      }}
                      placeholder={`Futbolista del ${equipoSel.nombre}…`}
                      className="player-text-input qq-input-moderno"
                      autoFocus
                    />
                    {mensajeError && <p className="error" style={{ margin: '0 0 0.8rem' }}>{mensajeError}</p>}

                    <BotonPrincipal type="submit" disabled={!inputJugador.trim()}>
                      <Icon name="check" size={20} strokeWidth={2.5} /> Comprobar futbolista
                    </BotonPrincipal>

                    <div className="tcu-sub-actions">
                      <button type="button" className="tcu-btn-sec" onClick={handlePasar}>
                        Pasar turno
                      </button>
                      <button type="button" className="tcu-btn-sec warn" onClick={handlePlantarse}>
                        🛑 Plantarse ({jActual.puntos})
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>

          {jugadoresUsados.length > 0 && (
            <div className="qqp-tarjeta tcu-usados-card">
              <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.6rem' }}>
                Futbolistas ya dichos ({jugadoresUsados.length})
              </p>
              <div className="tcu-usados-chips">
                {jugadoresUsados.map((nombre) => (
                  <span key={nombre} className="tcu-usado-pill">{nombre}</span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 5. RESULTADOS Y PODIO FINAL */}
      {fase === 'resultados' && (
        <section className="game qqp-escena">
          <Cabecera
            onSalir={() => setModalSalirPortada(true)}
            etiqueta="Partida finalizada"
            titulo="Clasificación Final"
            avatar={<EscudoEquipo equipo={equipoSel} size={54} />}
          >
            <div className="qqp-identidad">
              <span className="qqp-identidad-icono"><Icon name="trophy" size={16} /></span>
              <span>
                {!rankingFinal
                  ? 'Todos los jugadores han caído eliminados.'
                  : rankingFinal[0].puntos === 0
                    ? <>¡Diana perfecta de <strong>{rankingFinal[0].nombre}</strong> (clavó el 0)!</>
                    : <>Ganador: <strong>{rankingFinal[0].nombre}</strong> (se quedó a <strong>{rankingFinal[0].puntos}</strong>)</>}
              </span>
            </div>
          </Cabecera>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="users" size={16} /> Marcador final ({estadistica})
            </p>
            <ul className="qqp-rivales">
              {[...jugadores]
                .sort((a, b) => (a.estado === 'eliminado') - (b.estado === 'eliminado') || a.puntos - b.puntos)
                .map((j, i) => {
                  const esGanador = rankingFinal && rankingFinal[0].id === j.id && j.estado !== 'eliminado';
                  return (
                    <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                      <span className="qqp-rival-avatar">
                        {j.estado === 'eliminado' ? '💀' : esGanador ? '👑' : i + 1}
                      </span>
                      <span className="qqp-rival-datos">
                        <span className="qqp-rival-nombre">
                          {j.estado === 'eliminado'
                            ? 'Eliminado'
                            : j.estado === 'plantado'
                              ? 'Plantado'
                              : esGanador
                                ? '¡Ganador!'
                                : `Puesto ${i + 1}`}
                        </span>
                        <strong className="qqp-rival-tarjeta">{j.nombre}</strong>
                      </span>
                      <span className="tcu-ranking-pts">
                        {j.estado === 'eliminado' ? 'Eliminado' : `${j.puntos} ${estadistica}`}
                      </span>
                    </li>
                  );
                })}
            </ul>
          </div>

          <div className="qqp-tarjeta">
            <p className="qqp-carta-cara-titulo" style={{ marginBottom: '0.8rem' }}>
              <Icon name="trophy" size={16} /> {serie.partida >= maxPartidas ? 'Clasificación final de la serie' : `Serie · partida ${serie.partida} de ${maxPartidas}`}
            </p>
            <ul className="qqp-rivales">
              {rankingSerie.map((j, i) => (
                <li key={j.id} className="qqp-rival" style={{ '--c': colorJugador(indiceColor(j, i)) }}>
                  <span className="qqp-rival-avatar">{i === 0 && (serie.puntos[j.id] || 0) > 0 ? '👑' : i + 1}</span>
                  <span className="qqp-rival-datos"><strong className="qqp-rival-tarjeta">{j.nombre}</strong></span>
                  <span className="tcu-ranking-pts">{serie.puntos[j.id] || 0} pts</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="qqp-barra">
            {serie.partida < maxPartidas ? (
              <BotonPrincipal
                onClick={() => {
                  setUltimoAcierto(null);
                  setSerie((s) => ({ ...s, partida: s.partida + 1 }));
                  setFase('equipo');
                }}
              >
                <Icon name="play" size={20} /> Siguiente partida ({serie.partida + 1} de {maxPartidas})
              </BotonPrincipal>
            ) : (
              <BotonPrincipal
                onClick={() => {
                  setUltimoAcierto(null);
                  setSerie({ partida: 1, puntos: {} });
                  sumadaRef.current = 0;
                  setFase('equipo');
                }}
              >
                <Icon name="refresh" size={20} /> Jugar otra serie
              </BotonPrincipal>
            )}
            <EnlaceSecundario onClick={() => setModalSalirPortada(true)}>
              Salir a la portada principal
            </EnlaceSecundario>
          </div>
        </section>
      )}

      {/* MODAL: SALIR A LA PORTADA */}
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
              Se cancelará la partida actual y volverás a la portada principal de juegos. ¿Estás seguro?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button
                type="button"
                className="secondary full"
                onClick={() => setModalSalirPortada(false)}
              >
                No, continuar
              </button>
              <button
                type="button"
                className="secondary danger full"
                style={{ background: '#ef4444', color: '#ffffff', borderColor: '#dc2626' }}
                onClick={handleSalirAPortada}
              >
                Sí, salir a portada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}