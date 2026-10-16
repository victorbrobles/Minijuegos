import { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { ROLES, BANDOS } from './roles.js';
import { esLobo, bandoDe, guiaNoche, OBJETOS } from './engine.js';

// Estado de las habilidades del jugador, en lenguaje claro
function habilidades(e, j) {
  const est = j?.estado || {};
  const l = [];
  switch (j?.rol) {
    case 'bruja': l.push(`Poción de vida: ${est.pocionVida ? 'disponible' : 'gastada'}`, `Poción de veneno: ${est.pocionVeneno ? 'disponible' : 'gastada'}`); break;
    case 'lobo_alfa': l.push(`Mordisco infectado: ${est.infeccionUsada ? 'gastado' : 'disponible'}`); break;
    case 'juez': l.push(`Veredicto: ${est.juezUsado ? 'usado' : e.flags?.juezArmado ? 'armado para el próximo juicio' : 'disponible'}`); break;
    case 'hechicero': l.push(`Rebobinar la noche: ${est.hechizoUsado ? 'usado' : 'disponible'}`); break;
    case 'falsificador': l.push(`Falsificación: ${est.falsificacionUsada ? 'usada' : 'disponible'}`); break;
    case 'notario': l.push(`Cartas selladas: ${est.notarioCartas || 0}/3`); break;
    case 'banquero': l.push(`Fichas por repartir: ${est.fichasBanquero || 0}`); break;
    case 'agente_doble': l.push(`Tu lealtad real: ${est.bando === 'lobos' ? 'LOBOS (el Vidente te ve como Pueblo)' : 'PUEBLO (el Vidente te ve como Lobo)'}`); break;
    case 'camaleon': l.push(est.bando ? `Te has unido al bando: ${est.bando === 'lobos' ? 'Lobos' : 'Pueblo'}` : 'Todavía no tienes bando'); break;
    case 'piromano': {
      const vivosRoc = (est.rociados || []).filter((id) => e.jugadores?.[id]?.vivo).map((id) => e.jugadores[id].nombre);
      l.push(`Incendio: ${est.incendioUsado ? 'usado' : 'disponible'}`, `Rociados vivos: ${vivosRoc.length ? vivosRoc.join(', ') : 'ninguno'}`);
      break;
    }
    case 'protector': if (est.ultimoProtegido != null) l.push(`Protegiste anoche a ${e.jugadores?.[est.ultimoProtegido]?.nombre || 'alguien'} (no puedes repetir)`); break;
    default: break;
  }
  if (est.objeto && OBJETOS[est.objeto]) l.push(`Objeto: ${OBJETOS[est.objeto].nombre} — ${OBJETOS[est.objeto].texto}`);
  if (e.fichas?.[j?.id] > 0) l.push(`Tienes ${e.fichas[j.id]} ficha(s) de favor: te libran de un linchamiento`);
  if (est.contagiado) l.push('Estás contagiado (cuentas para la epidemia del Contagiado)');
  if (est.huesped != null) l.push(`Tu huésped: ${e.jugadores?.[est.huesped]?.nombre || 'Huésped'}${e.jugadores?.[est.huesped]?.vivo ? '' : ' (ha muerto)'}`);
  if (e.amantes && e.amantes.includes(j?.id)) {
    const otroId = e.amantes.find((x) => x !== j.id);
    const otro = e.jugadores?.[otroId];
    if (otro) l.push(`Enamorado/a de ${otro.nombre}${otro.vivo ? '' : ' (ha muerto)'}`);
  }
  return l;
}

export default function TarjetaRol({ e, id, completa = true }) {
  const idNum = Number(id);
  const j = e?.jugadores ? (e.jugadores.find((p) => Number(p.id) === idNum) || e.jugadores[id]) : null;

  if (!j || !j.rol || !ROLES[j.rol]) {
    return (
      <div className="lb-ficha">
        <p className="hint center" style={{ margin: '1rem 0' }}>Cargando tu rol secreto...</p>
      </div>
    );
  }

  const r = ROLES[j.rol];
  const bandoReal = bandoDe(j);
  const sinBando = j.rol === 'camaleon' && !j.estado?.bando;
  const b = sinBando
    ? { nombre: 'Sin bando (por ahora)', color: '#f59e0b', texto: 'Cuentas como Pueblo si la partida termina antes de elegir bando.' }
    : (BANDOS[bandoReal] || BANDOS.pueblo);
  const hab = habilidades(e, j);

  // En online lee e.companeros que envía el servidor; en local busca en e.jugadores de forma segura
  const companeros = esLobo(j)
    ? (e.companeros && Array.isArray(e.companeros) && e.companeros.length > 0
        ? e.companeros.map((cid) => e.jugadores.find((x) => Number(x.id) === Number(cid))).filter(Boolean)
        : e.jugadores.filter((x) => esLobo(x) && Number(x.id) !== idNum))
    : [];

  const [mostrarDetalle, setMostrarDetalle] = useState(completa);

  return (
    <div className="lb-ficha" style={{ '--rol': b.color }}>
      <div className="lb-ficha-cab">
        <span className="lb-ficha-icono"><Icon name={r.icono} size={44} strokeWidth={1.7} /></span>
        <div>
          <p className="lb-bando">{b.nombre}</p>
          <h2 className="lb-ficha-nombre">{r.nombre}</h2>
        </div>
      </div>
      <p className="lb-ficha-resumen">{r.resumen}</p>

      <div className="lb-haz">
        <p className="lb-haz-titulo"><Icon name="moon" size={18} /> Tu turno de noche</p>
        <p>{guiaNoche(e, j.id)}</p>
      </div>
      <div className="lb-haz dia">
        <p className="lb-haz-titulo"><Icon name="sun" size={18} /> De día</p>
        <p>{r.guiaDia}</p>
      </div>

      {hab.length > 0 && (
        <ul className="lb-hab">
          {hab.map((h, i) => <li key={i}>{h}</li>)}
        </ul>
      )}
      {companeros.length > 0 && (
        <p className="lb-companeros"><Icon name="paw" size={16} /> Tus compañeros: <strong>{companeros.map((c) => `${c.nombre}${c.vivo ? '' : ' (muerto)'}`).join(', ')}</strong></p>
      )}

      <button type="button" className="secondary lb-detalle-btn" onClick={() => setMostrarDetalle((v) => !v)}>
        {mostrarDetalle ? 'Ocultar reglas completas' : 'Ver reglas completas del rol'}
      </button>
      {mostrarDetalle && <p className="lb-detalle">{r.detalle}</p>}
      <p className="lb-bando-texto">{b.texto}</p>
    </div>
  );
}

export function ConsultarRol({ e, onCerrar, idFijo = null }) {
  const [quien, setQuien] = useState(idFijo);
  const [visto, setVisto] = useState(idFijo != null);

  return (
    <div className="rg-modal-fondo" onClick={onCerrar}>
      <div className="rg-modal lb-modal" onClick={(ev) => ev.stopPropagation()}>
        {quien == null && (
          <>
            <h3 className="lb-modal-titulo"><Icon name="eye" size={22} /> Consultar mi rol</h3>
            <p className="hint">¿Quién eres? Después, que nadie más mire la pantalla.</p>
            <div className="names-grid">
              {(e.jugadores || []).map((j) => (
                <button key={j.id} type="button" className="secondary" onClick={() => setQuien(j.id)}>
                  {j.nombre}{!j.vivo && <span className="badge">Eliminado</span>}
                </button>
              ))}
            </div>
            <button type="button" className="secondary full" style={{ marginTop: '1rem' }} onClick={onCerrar}>Cancelar</button>
          </>
        )}
        {quien != null && !visto && (
          <>
            <h3 className="lb-modal-titulo"><Icon name="lock" size={22} /> Solo para {e.jugadores?.find((p) => Number(p.id) === Number(quien))?.nombre || 'ti'}</h3>
            <p className="hint">Comprueba que nadie más mira la pantalla.</p>
            <button type="button" className="big full" onClick={() => setVisto(true)}>Mostrar mi rol</button>
            <button type="button" className="secondary full" style={{ marginTop: '.8rem' }} onClick={() => setQuien(null)}>No soy yo</button>
          </>
        )}
        {quien != null && visto && (
          <>
            <TarjetaRol e={e} id={quien} completa={false} />
            <button type="button" className="big full" onClick={onCerrar}><Icon name="check" size={20} strokeWidth={2.5} /> Cerrar y ocultar</button>
          </>
        )}
      </div>
    </div>
  );
}