import { useEffect, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { ROLES, BANDOS, ORDEN_ROLES } from './roles.js';
import { esLobo, bandoVisible, distanciaAsientos, guiaNoche, vivos, EVENTOS, OBJETOS } from './engine.js';
import { ConsultarRol } from './TarjetaRol.jsx';

/* ───────── Piezas reutilizables ───────── */

export function ElegirUno({ e, opciones, onConfirmar, texto = 'Confirmar', extra = null }) {
  const [sel, setSel] = useState(null);
  return (
    <>
      <div className="names-grid lb-eleccion">
        {opciones.map((id) => (
          <button key={id} type="button" className={`secondary lb-op ${sel === id ? 'sel' : ''}`} onClick={() => setSel(id)}>
            {e.jugadores[id].nombre}
          </button>
        ))}
      </div>
      <button type="button" className="big full" disabled={sel == null} onClick={() => onConfirmar(sel)}>
        <Icon name="check" size={20} strokeWidth={2.5} /> {texto}
      </button>
      {extra}
    </>
  );
}

function ElegirDos({ e, opciones, onConfirmar }) {
  const [sel, setSel] = useState([]);
  const alternar = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 2 ? [...s, id] : s));
  return (
    <>
      <div className="names-grid lb-eleccion">
        {opciones.map((id) => (
          <button key={id} type="button" className={`secondary lb-op ${sel.includes(id) ? 'sel' : ''}`} onClick={() => alternar(id)}>
            {e.jugadores[id].nombre}
          </button>
        ))}
      </div>
      <p className="hint small center">Elegidos: {sel.length}/2</p>
      <button type="button" className="big full" disabled={sel.length !== 2} onClick={() => onConfirmar(sel[0], sel[1])}>
        <Icon name="check" size={20} strokeWidth={2.5} /> Confirmar
      </button>
    </>
  );
}

// Los jugadores sin acción también «tardan» unos segundos para no delatar su rol por el tiempo de su turno
function Dormir({ onListo, mensaje }) {
  const [t, setT] = useState(() => 4 + Math.floor(Math.random() * 4));
  useEffect(() => {
    if (t <= 0) return undefined;
    const h = setTimeout(() => setT((x) => x - 1), 1000);
    return () => clearTimeout(h);
  }, [t]);
  return (
    <>
      {mensaje && <div className="lb-resultado"><p>{mensaje}</p></div>}
      <button type="button" className="big full" disabled={t > 0} onClick={onListo}>
        {t > 0 ? <><Icon name="hourglass" size={20} /> Un momento… ({t})</> : <><Icon name="check" size={20} strokeWidth={2.5} /> Terminar turno</>}
      </button>
    </>
  );
}

function Resultado({ children, onListo, texto = 'Entendido, terminar turno' }) {
  return (
    <>
      <div className="lb-resultado">{children}</div>
      <button type="button" className="big full" onClick={onListo}><Icon name="check" size={20} strokeWidth={2.5} /> {texto}</button>
    </>
  );
}

const nombreBando = (b) => BANDOS[b].nombre;
const pickOtro = (b) => { const o = ['lobos', 'pueblo', 'solitario'].filter((x) => x !== b); return o[Math.floor(Math.random() * o.length)]; };

/* ───────── Turno ───────── */

export default function TurnoNoche({ e, id, onTerminar }) {
  const j = e.jugadores[id];
  const r = ROLES[j.rol];
  const est = j.estado;
  const [verRol, setVerRol] = useState(false);
  const [avisosVistos, setAvisosVistos] = useState(j.avisos.length === 0);
  const [paso, setPaso] = useState('inicio');
  const [datos, setDatos] = useState({});
  const [objPaso, setObjPaso] = useState(j.estado.objeto === 'daga' || j.estado.objeto === 'pergamino' ? 'pregunta' : 'listo');
  const [extra, setExtra] = useState(null);
  const nombre = (x) => e.jugadores[x].nombre;

  const vivosIds = vivos(e).map((x) => x.id);
  const otros = vivosIds.filter((x) => x !== id);
  const terminar = (acc) => onTerminar(extra ? { ...(acc || {}), objeto: extra } : acc);

  const textoAviso = (a) => {
    if (a.tipo === 'amor') return `💘 Cupido os ha unido: estás enamorado/a de ${nombre(a.con)}. Si uno muere, el otro también. Si sois de bandos distintos y sobrevivís los dos hasta el final, ganáis juntos.`;
    if (a.tipo === 'infectado') return '🐺 Anoche el Lobo Alfa te infectó. Ahora eres un LOBO y ganas con la manada. Verás a tus compañeros cuando te toque votar víctima.';
    if (a.tipo === 'herencia') return `🪱 Tu huésped, ${a.de}, ha muerto. Has heredado su rol: ahora eres ${ROLES[a.rol].nombre} (${nombreBando(ROLES[a.rol].bando)}), con los usos que a él le quedaban.`;
    if (a.tipo === 'ficha') return '🪙 Alguien te ha entregado una ficha de favor. Si el pueblo fuera a linchar a quien la tiene, la ficha se gasta y se libra. (No sabes quién te la dio.)';
    if (a.tipo === 'contagio') return '🤒 Te notas febril: estás contagiado. Conservas tu rol y tu bando, pero cuentas para la epidemia del Contagiado.';
    if (a.tipo === 'camaleon') return `🦎 Tu primer acusador fue ${a.acusador}, del bando ${nombreBando(a.bandoAcusador)}. Por eso te unes al bando contrario: ahora eres del bando ${nombreBando(a.nuevo)}${a.nuevo === 'lobos' ? ' y votarás víctima con la manada' : ''}.`;
    return '';
  };

  const cabecera = (
    <>
      <div className="hud">
        <span className="chip"><Icon name={r.icono} size={18} />{j.nombre} · {r.nombre}</span>
        <button type="button" className="secondary lb-mirol" onClick={() => setVerRol(true)}><Icon name="eye" size={18} /> Mi rol</button>
      </div>
      {verRol && <ConsultarRol e={e} idFijo={id} onCerrar={() => setVerRol(false)} />}
    </>
  );

  // Avisos pendientes (enamorado, infectado, herencia…) antes de empezar
  if (!avisosVistos) {
    return (
      <section className="game">
        {cabecera}
        <div className="panel">
          <h3 className="panel-title"><Icon name="bell" size={22} /> Noticias para ti</h3>
          {j.avisos.map((a, i) => <p key={i} className="lb-aviso">{textoAviso(a)}</p>)}
          <button type="button" className="big full" onClick={() => setAvisosVistos(true)}>Entendido, continuar</button>
        </div>
      </section>
    );
  }

  const evento = e.noche?.evento ? EVENTOS[e.noche.evento] : null;
  const guia = (
    <div className="lb-haz">
      <p className="lb-haz-titulo"><Icon name="moon" size={18} /> Qué debes hacer</p>
      <p>{guiaNoche(e, id)}</p>
    </div>
  );
  const bannerEvento = evento && (
    <p className="lb-evento"><Icon name={evento.icono} size={18} /> <strong>{evento.nombre}:</strong> {evento.texto}</p>
  );
  const envoltorio = (contenido) => (
    <section className="game">
      {cabecera}
      <div className="panel">{bannerEvento}{guia}{contenido}</div>
    </section>
  );

  // Objeto misterioso (daga / pergamino): se ofrece antes de la acción del rol
  if (objPaso !== 'listo') {
    const o = OBJETOS[j.estado.objeto];
    return (
      <section className="game">
        {cabecera}
        <div className="panel">
          {objPaso === 'pregunta' && (
            <>
              <h3 className="panel-title"><Icon name={o.icono} size={22} /> Tienes: {o.nombre}</h3>
              <p>{o.texto}</p>
              <button type="button" className="big full" onClick={() => setObjPaso('elegir')}>Usar {o.nombre.toLowerCase()} esta noche</button>
              <button type="button" className="secondary full" style={{ marginTop: '.7rem' }} onClick={() => setObjPaso('listo')}>Guardarla para otra noche</button>
            </>
          )}
          {objPaso === 'elegir' && (
            <>
              <h3 className="panel-title"><Icon name={o.icono} size={22} /> {o.nombre}: elige objetivo</h3>
              <ElegirUno e={e} opciones={otros} texto="Confirmar"
                onConfirmar={(t) => {
                  setExtra({ tipo: j.estado.objeto, objetivo: t });
                  setObjPaso(j.estado.objeto === 'pergamino' ? 'resultado' : 'listo');
                  setDatos((d) => ({ ...d, objObjetivo: t }));
                }} />
            </>
          )}
          {objPaso === 'resultado' && (
            <Resultado onListo={() => setObjPaso('listo')} texto="Entendido, continuar">
              <p className="lb-res-titulo">{nombre(datos.objObjetivo)}</p>
              <p className="lb-res-grande">{ROLES[e.jugadores[datos.objObjetivo].rol].nombre}</p>
              <p className="hint small">Rol exacto (el bando real del Camaleón o del Agente Doble podría ser otro).</p>
            </Resultado>
          )}
        </div>
      </section>
    );
  }

  const dormir = (msg) => envoltorio(<Dormir mensaje={msg} onListo={() => terminar(null)} />);

  switch (esLobo(j) ? '__lobo' : j.rol) {
    /* ───── Lobos (incluye Camaleón/Agente Doble de ese bando) ───── */
    case '__lobo': {
      if (j.rol === 'falsificador' && !est.falsificacionUsada && paso === 'falsoObj') {
        return envoltorio(<ElegirUno e={e} opciones={vivosIds} texto="Elegir jugador" onConfirmar={(t) => { setDatos((d) => ({ ...d, falsoObjetivo: t })); setPaso('falsoRol'); }} extra={<button type="button" className="secondary full" style={{ marginTop: '.7rem' }} onClick={() => setPaso('inicio')}>Volver</button>} />);
      }
      if (j.rol === 'falsificador' && !est.falsificacionUsada && paso === 'falsoRol') {
        return envoltorio(
          <>
            <p className="field-label">¿Qué rol se revelará cuando muera {nombre(datos.falsoObjetivo)}?</p>
            <div className="names-grid lb-eleccion">
              {ORDEN_ROLES.map((r) => (
                <button key={r} type="button" className="secondary lb-op" onClick={() => { setDatos((d) => ({ ...d, falso: { objetivo: d.falsoObjetivo, rol: r } })); setPaso('inicio'); }}>{ROLES[r].nombre}</button>
              ))}
            </div>
          </>
        );
      }
      const manada = vivos(e).filter((x) => esLobo(x) && x.id !== id);
      const manadaTxt = manada.length
        ? <p className="lb-companeros"><Icon name="paw" size={16} /> Tu manada: <strong>{manada.map((m) => m.nombre).join(', ')}</strong></p>
        : <p className="lb-companeros"><Icon name="paw" size={16} /> Estás solo: el resto de la manada ha caído.</p>;
      const votosPrevios = manada.filter((m) => e.noche.acc[m.id]?.objetivo != null);
      if (e.flags.sinAtaque) {
        return envoltorio(<>{manadaTxt}<Dormir mensaje="El sacrificio del Mártir os impide atacar esta noche. Descansad." onListo={() => terminar(null)} /></>);
      }
      const objetivos = vivosIds.filter((x) => !esLobo(e.jugadores[x]));
      return envoltorio(
        <>
          {manadaTxt}
          {votosPrevios.length > 0 && (
            <p className="hint small">Votos de la manada hasta ahora: {votosPrevios.map((m) => `${m.nombre} → ${nombre(e.noche.acc[m.id].objetivo)}`).join(' · ')}</p>
          )}
          {j.rol === 'lobo_alfa' && !est.infeccionUsada && (
            <button type="button" className={`secondary lb-toggle ${datos.infectar ? 'on' : ''}`} onClick={() => setDatos((d) => ({ ...d, infectar: !d.infectar }))}>
              <Icon name="paw" size={18} /> Mordisco infectado: {datos.infectar ? 'ACTIVADO (la víctima final se convertirá en lobo)' : 'desactivado'}
            </button>
          )}
          {j.rol === 'falsificador' && !est.falsificacionUsada && (
            <button type="button" className={`secondary lb-toggle ${datos.falso ? 'on' : ''}`} onClick={() => setPaso('falsoObj')}>
              <Icon name="edit" size={18} /> {datos.falso ? `Falsificación lista: ${nombre(datos.falso.objetivo)} aparecerá como ${ROLES[datos.falso.rol].nombre} (pulsa para cambiar)` : 'Preparar falsificación (un solo uso)'}
            </button>
          )}
          <p className="field-label">¿A quién atacáis?</p>
          <ElegirUno e={e} opciones={objetivos} texto="Confirmar víctima" onConfirmar={(t) => terminar({ objetivo: t, infectar: !!datos.infectar, falsificar: datos.falso })} />
        </>
      );
    }

    /* ───── Información ───── */
    case 'vidente': {
      if (paso === 'resultado') {
        const t = e.jugadores[datos.objetivo];
        const b = datos.mostrado;
        return envoltorio(
          <Resultado onListo={() => terminar({ objetivo: datos.objetivo })}>
            <p className="lb-res-titulo">{t.nombre}</p>
            <p className="lb-res-grande" style={{ color: BANDOS[b].color }}>{b === 'lobos' ? '🐺 Es un LOBO' : b === 'pueblo' ? '🏡 Es del PUEBLO' : '🔥 Es un SOLITARIO'}</p>
            {e.noche.evento === 'niebla' && <p className="hint small">La niebla enturbia tu visión: este resultado puede ser falso.</p>}
          </Resultado>
        );
      }
      return envoltorio(<ElegirUno e={e} opciones={otros} texto="Investigar" onConfirmar={(t) => {
        let b = bandoVisible(e.jugadores[t]);
        if (e.noche.evento === 'niebla' && Math.random() < 0.5) b = pickOtro(b);
        setDatos({ objetivo: t, mostrado: b }); setPaso('resultado');
      }} />);
    }
    case 'cartografo': {
      if (paso === 'resultado') {
        const d = datos.dist;
        return envoltorio(
          <Resultado onListo={() => terminar({ a: datos.a, b: datos.b })}>
            <p className="lb-res-titulo">{nombre(datos.a)} y {nombre(datos.b)}</p>
            <p className="lb-res-grande">Distancia: {d} {d === 1 ? 'asiento' : 'asientos'}</p>
            {e.noche.evento === 'niebla' && <p className="hint small">La niebla enturbia tu visión: la distancia puede ser errónea.</p>}
            <p className="hint small">Asientos en círculo: {e.jugadores.map((x) => x.nombre).join(' → ')} → (vuelta al inicio)</p>
          </Resultado>
        );
      }
      return envoltorio(<ElegirDos e={e} opciones={e.jugadores.map((x) => x.id)} onConfirmar={(a, b) => {
        let d = distanciaAsientos(e, a, b);
        if (e.noche.evento === 'niebla' && Math.random() < 0.5) d = Math.max(1, Math.min(Math.floor(e.jugadores.length / 2), d + (Math.random() < 0.5 ? -1 : 1)));
        setDatos({ a, b, dist: d }); setPaso('resultado');
      }} />);
    }

    /* ───── Protección y pociones ───── */
    case 'protector': {
      const opciones = vivosIds.filter((x) => x !== est.ultimoProtegido);
      return envoltorio(<ElegirUno e={e} opciones={opciones} texto="Proteger" onConfirmar={(t) => terminar({ objetivo: t })} />);
    }
    case 'bruja': {
      const v = e.noche.victima;
      const info = (
        <div className="lb-resultado">
          <p className="lb-res-titulo">Esta noche los lobos atacan a…</p>
          <p className="lb-res-grande">{v != null ? nombre(v) : 'nadie'}</p>
        </div>
      );
      if (!est.pocionVida && !est.pocionVeneno) return envoltorio(<><div className="lb-resultado"><p>Los lobos atacan a: <strong>{v != null ? nombre(v) : 'nadie'}</strong>. No tienes pociones.</p></div><Dormir onListo={() => terminar(null)} /></>);
      const puedeSalvar = est.pocionVida && v != null;
      if (paso === 'inicio' && puedeSalvar) {
        return envoltorio(
          <>
            {info}
            <button type="button" className="big full" onClick={() => { setDatos({ salvar: true }); setPaso('veneno'); }}><Icon name="heart" size={20} /> Salvar con la poción de vida</button>
            <button type="button" className="secondary full" style={{ marginTop: '.7rem' }} onClick={() => { setDatos({ salvar: false }); setPaso('veneno'); }}>No salvar</button>
          </>
        );
      }
      const salvo = paso === 'veneno' ? !!datos.salvar : false;
      // Paso del veneno
      if (!est.pocionVeneno) return envoltorio(<Resultado onListo={() => terminar({ salvar: salvo, veneno: null })}><p>{salvo ? 'Has usado tu poción de vida.' : 'No usas ninguna poción.'}</p></Resultado>);
      return envoltorio(
        <>
          <p className="field-label">¿Quieres envenenar a alguien? (un solo uso)</p>
          <ElegirUno
            e={e} opciones={otros} texto="Envenenar"
            onConfirmar={(t) => terminar({ salvar: salvo, veneno: t })}
            extra={<button type="button" className="secondary full" style={{ marginTop: '.7rem' }} onClick={() => terminar({ salvar: salvo, veneno: null })}>No envenenar a nadie</button>}
          />
        </>
      );
    }

    /* ───── Preparación (primera noche) ───── */
    case 'cupido': {
      if (e.ronda !== 1) return dormir();
      if (paso === 'resultado') {
        return envoltorio(
          <Resultado onListo={() => terminar({ a: datos.a, b: datos.b })}>
            <p className="lb-res-titulo">💘 Enamorados</p>
            <p className="lb-res-grande">{nombre(datos.a)} y {nombre(datos.b)}</p>
            <p className="hint small">Se enterarán en su propio turno de esta noche.</p>
          </Resultado>
        );
      }
      return envoltorio(<ElegirDos e={e} opciones={vivosIds} onConfirmar={(a, b) => { setDatos({ a, b }); setPaso('resultado'); }} />);
    }
    case 'parasito': {
      if (e.ronda !== 1 || est.huesped != null) return dormir(est.huesped != null ? `Tu huésped es ${nombre(est.huesped)}.` : null);
      return envoltorio(<ElegirUno e={e} opciones={otros} texto="Elegir huésped" onConfirmar={(t) => terminar({ objetivo: t })} />);
    }

    /* ───── Poderes de un solo uso y trastornos ───── */
    case 'ladron':
      return envoltorio(<ElegirUno e={e} opciones={otros} texto="Robar su voto" onConfirmar={(t) => terminar({ objetivo: t })} />);
    case 'juez': {
      if (est.juezUsado || e.flags.juezArmado) return dormir();
      return envoltorio(
        <>
          <button type="button" className="big full" onClick={() => terminar({ armar: true })}><Icon name="landmark" size={20} /> Armar mi veredicto para mañana</button>
          <button type="button" className="secondary full" style={{ marginTop: '.7rem' }} onClick={() => terminar(null)}>No esta noche</button>
        </>
      );
    }
    case 'hechicero': {
      if (est.hechizoUsado) return dormir();
      return envoltorio(
        <>
          <button type="button" className="big full" onClick={() => terminar({ rebobinar: true })}><Icon name="hourglass" size={20} /> Rebobinar esta noche</button>
          <button type="button" className="secondary full" style={{ marginTop: '.7rem' }} onClick={() => terminar(null)}>No esta noche</button>
        </>
      );
    }
    case 'piromano': {
      const rociadosVivos = est.rociados.filter((x) => e.jugadores[x].vivo);
      if (paso === 'rociar') {
        const opciones = otros.filter((x) => !est.rociados.includes(x));
        return envoltorio(<ElegirUno e={e} opciones={opciones} texto="Rociar" onConfirmar={(t) => terminar({ rociar: t })} extra={<button type="button" className="secondary full" style={{ marginTop: '.7rem' }} onClick={() => setPaso('inicio')}>Volver</button>} />);
      }
      return envoltorio(
        <>
          <p className="hint">Rociados vivos: <strong>{rociadosVivos.length ? rociadosVivos.map(nombre).join(', ') : 'ninguno'}</strong></p>
          <button type="button" className="big full" disabled={otros.filter((x) => !est.rociados.includes(x)).length === 0} onClick={() => setPaso('rociar')}><Icon name="flame" size={20} /> Rociar a alguien</button>
          {!est.incendioUsado && (
            <button type="button" className="big full danger" disabled={rociadosVivos.length === 0} onClick={() => terminar({ incendiar: true })}>
              <Icon name="flame" size={20} /> Prender fuego ({rociadosVivos.length} rociados vivos)
            </button>
          )}
          <button type="button" className="secondary full" style={{ marginTop: '.7rem' }} onClick={() => terminar(null)}>No hacer nada</button>
        </>
      );
    }

    /* ───── Roles nuevos ───── */
    case 'banquero': {
      if (est.fichasBanquero <= 0) return dormir();
      return envoltorio(<ElegirUno e={e} opciones={otros} texto="Entregar ficha" onConfirmar={(t) => terminar({ objetivo: t })} extra={<button type="button" className="secondary full" style={{ marginTop: '.7rem' }} onClick={() => terminar(null)}>No dar ninguna esta noche</button>} />);
    }
    case 'viuda':
      return envoltorio(<ElegirUno e={e} opciones={otros} texto="Marcar" onConfirmar={(t) => terminar({ objetivo: t })} />);
    case 'contagiado':
      return envoltorio(<ElegirUno e={e} opciones={otros} texto="Visitar" onConfirmar={(t) => terminar({ objetivo: t })} />);
    case 'notario': {
      if (est.notarioCartas >= 3) return dormir();
      if (paso === 'veredicto') {
        return envoltorio(
          <>
            <p className="field-label">Carta sobre <strong>{nombre(datos.sobre)}</strong>. Se leerá cuando mueras. ¿Qué escribes?</p>
            <button type="button" className="big full" onClick={() => terminar({ sobre: datos.sobre, veredicto: 'pueblo' })}>🏡 «{nombre(datos.sobre)} es del Pueblo»</button>
            <button type="button" className="big full danger" style={{ marginTop: '.7rem' }} onClick={() => terminar({ sobre: datos.sobre, veredicto: 'nopueblo' })}>🐺 «{nombre(datos.sobre)} NO es del Pueblo»</button>
          </>
        );
      }
      return envoltorio(
        <ElegirUno e={e} opciones={otros} texto="Elegir destinatario" onConfirmar={(t) => { setDatos((d) => ({ ...d, sobre: t })); setPaso('veredicto'); }}
          extra={<button type="button" className="secondary full" style={{ marginTop: '.7rem' }} onClick={() => terminar(null)}>No escribir ninguna carta esta noche</button>} />
      );
    }
    case 'eco':
      return dormir(e.eco ? `Un difunto te susurra: «${e.eco}»` : 'Esta noche los muertos guardan silencio.');

    /* ───── Sin acción nocturna ───── */
    default:
      return dormir();
  }
}
