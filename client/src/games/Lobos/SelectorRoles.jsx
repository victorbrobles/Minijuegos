import { useMemo } from 'react';
import Icon from '../../components/Icon.jsx';
import { ROLES, BANDOS, ORDEN_ROLES, CLASICOS } from './roles.js';
import { MEC_NINGUNA, MEC_TODAS } from './engine.js';
import { TIPOS, componer, validar, aRecuento, deRecuento, complejidadTotal } from './composiciones.js';
import { simularComposicion } from './simulacion.js';

// Piezas compartidas por el modo de un solo dispositivo y el modo en red:
// elección de roles (recomendadas / personalizada), mecánicas globales y medidor de equilibrio.

export const MECANICAS = [
  { id: 'eventos', corto: 'eventos', nombre: 'Eventos nocturnos', texto: 'Algunas noches ocurre algo: Luna de Sangre (dos víctimas), Niebla (visiones falsas), Eclipse (sin debate) o Noche de Paz.' },
  { id: 'objetos', corto: 'objetos', nombre: 'Objetos sueltos', texto: 'Algunos días aparece un Amuleto, una Daga o un Pergamino: se lo queda el primero que lo reclame.' },
  { id: 'rumores', corto: 'rumores', nombre: 'Rumores del pueblo', texto: 'Cada amanecer circula un rumor que puede ser cierto o falso con la misma probabilidad.' },
  { id: 'modif', corto: 'votos especiales', nombre: 'Votaciones con modificadores', texto: 'Algunos días cambian las reglas del linchamiento: voto doble, gana el menos votado o quórum mínimo.' }
];


/* ───────── Estimación de equilibrio (simulación con bots) ───────── */
function etiquetaEquilibrio(l, p) {
  const d = l + p || 1;
  const x = l / d;
  if (x >= 0.42 && x <= 0.58) return { texto: 'Equilibrada', clase: 'ok' };
  if (x > 0.58 && x <= 0.68) return { texto: 'Algo favorable a los lobos', clase: 'warn' };
  if (x > 0.68) return { texto: 'Muy favorable a los lobos', clase: 'mal' };
  if (x >= 0.32) return { texto: 'Algo favorable al pueblo', clase: 'warn' };
  return { texto: 'Muy favorable al pueblo', clase: 'mal' };
}

export function Equilibrio({ roles, mec }) {
  const clave = `${roles.join(',')}|${JSON.stringify(mec)}`;
  const est = useMemo(() => simularComposicion(roles, 300, { pDeduccion: 0.3, mec }), [clave]); // eslint-disable-line react-hooks/exhaustive-deps
  const et = etiquetaEquilibrio(est.lobos, est.pueblo);
  const pc = (x) => `${Math.round(x * 100)}%`;
  return (
    <div className="lb-equilibrio">
      <div className="lb-equilibrio-cab">
        <strong>Equilibrio estimado</strong>
        <span className={`lb-etiqueta ${et.clase}`}>{et.texto}</span>
      </div>
      <div className="lb-barra" role="img" aria-label={`Lobos ${pc(est.lobos)}, pueblo ${pc(est.pueblo)}`}>
        <span className="l" style={{ width: pc(est.lobos) }}>{est.lobos >= 0.12 ? pc(est.lobos) : ''}</span>
        <span className="o" style={{ width: pc(Math.max(0, est.otros)) }} />
        <span className="p" style={{ width: pc(est.pueblo) }}>{est.pueblo >= 0.12 ? pc(est.pueblo) : ''}</span>
      </div>
      <div className="lb-leyenda"><span className="l">Lobos</span>{est.otros > 0.03 && <span className="o">Solitarios / epidemia</span>}<span className="p">Pueblo</span></div>
      <p className="hint small">Simulación con jugadores virtuales de nivel medio (~{est.rondas.toFixed(1)} rondas por partida). Si vuestro grupo deduce muy bien, el pueblo ganará más de lo indicado.</p>
    </div>
  );
}

export function ChipsRoles({ roles }) {
  const rec = aRecuento(roles);
  return (
    <div className="lb-chips">
      {ORDEN_ROLES.filter((r) => rec[r]).map((r) => (
        <span key={r} className="lb-chip-rol" style={{ '--rol': BANDOS[ROLES[r].bando].color }}>
          <Icon name={ROLES[r].icono} size={15} /> {ROLES[r].nombre}{rec[r] > 1 ? ` ×${rec[r]}` : ''}
        </span>
      ))}
    </div>
  );
}

export function ListaRolesExplicados({ roles, conDetalle = false }) {
  const unicos = ORDEN_ROLES.filter((r) => roles.includes(r));
  return (
    <div className="lb-explicados">
      {unicos.map((r) => (
        <div key={r} className="lb-explicado" style={{ '--rol': BANDOS[ROLES[r].bando].color }}>
          <span className="lb-explicado-icono"><Icon name={ROLES[r].icono} size={22} /></span>
          <div><strong>{ROLES[r].nombre}</strong> <small>({BANDOS[ROLES[r].bando].nombre})</small><p>{ROLES[r].resumen}</p>
            {conDetalle && <details className="lb-mas"><summary>Cómo funciona</summary><p>{ROLES[r].detalle}</p></details>}
          </div>
        </div>
      ))}
    </div>
  );
}


export const selInicial = (n) => ({ tab: 'recomendadas', tipoSel: 'equilibrada', custom: aRecuento(componer('equilibrada', n)) });
export const rolesDeSel = (sel, n) => (sel.tab === 'recomendadas' ? componer(sel.tipoSel, n) : deRecuento(sel.custom));

export default function SelectorRoles({ n, sel, setSel, mec, setMec }) {
  const { tab, tipoSel, custom } = sel;
  const setTab = (t) => setSel((s) => ({ ...s, tab: t }));
  const setTipoSel = (t) => setSel((s) => ({ ...s, tipoSel: t }));
  const setCustom = (fn) => setSel((s) => ({ ...s, custom: typeof fn === 'function' ? fn(s.custom) : fn }));
  const rolesCustom = useMemo(() => deRecuento(custom), [custom]);
  const validacion = useMemo(() => validar(rolesCustom, n), [rolesCustom, n]);
  const total = Object.values(custom).reduce((s, x) => s + x, 0);
  const bloqueado = validacion.errores.length > 0;

  const cargarBase = (tipo) => setCustom(aRecuento(componer(tipo, n)));
  const cambiarRol = (rol, delta) => setCustom((c) => {
    const actual = c[rol] || 0;
    const max = ROLES[rol].unico ? 1 : 99;
    return { ...c, [rol]: Math.min(max, Math.max(0, actual + delta)) };
  });
  const rellenarAldeanos = () => setCustom((c) => {
    const t = Object.values(c).reduce((s, x) => s + x, 0);
    return { ...c, aldeano: Math.max(0, (c.aldeano || 0) + (n - t)) };
  });

  return (
    <>
          <div className="lb-tabs">
            <button type="button" className={`lb-tab ${tab === 'recomendadas' ? 'on' : ''}`} onClick={() => setTab('recomendadas')}>Recomendadas</button>
            <button type="button" className={`lb-tab ${tab === 'personalizada' ? 'on' : ''}`} onClick={() => { if (!total) cargarBase(tipoSel); setTab('personalizada'); }}>Personalizada</button>
          </div>

          {tab === 'recomendadas' && (
            <>
              <div className="lb-tipos">
                {Object.values(TIPOS).map((t) => {
                  const roles = componer(t.id, n);
                  const sel = tipoSel === t.id;
                  return (
                    <div key={t.id} className={`lb-tipo ${sel ? 'sel' : ''}`} onClick={() => setTipoSel(t.id)} role="button" tabIndex={0}
                      onKeyDown={(ev) => { if (ev.key === 'Enter') setTipoSel(t.id); }}>
                      <div className="lb-tipo-cab">
                        <span className="lb-tipo-icono"><Icon name={t.icono} size={26} /></span>
                        <div>
                          <h3>{t.nombre} {t.id === 'equilibrada' && <span className="badge">Recomendada</span>}</h3>
                          <p className="lb-lema">{t.lema}</p>
                        </div>
                      </div>
                      <p className="lb-tipo-desc">{t.descripcion}</p>
                      <div className="lb-tags">
                        {Object.keys(t.mec).length > 0 && <span>Mecánicas sugeridas: {Object.keys(t.mec).map((k) => MECANICAS.find((m) => m.id === k).corto).join(', ')}</span>}
                        <span>Caos {'●'.repeat(t.caos)}{'○'.repeat(3 - t.caos)}</span>
                        <span>Dificultad: {complejidadTotal(roles)}</span>
                      </div>
                      <ChipsRoles roles={roles} />
                      {sel && (
                        <>
                          <Equilibrio roles={roles} mec={mec} />
                          {validar(roles, n).avisos.map((a) => <p key={a} className="lb-aviso-comp">⚠ {a}</p>)}
                          <ListaRolesExplicados roles={roles} />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {tab === 'personalizada' && (
            <div className="panel">
              <h3 className="panel-title"><Icon name="dice" size={22} /> Tu combinación</h3>
              <p className="hint small">Parte de una base recomendada y ajústala:</p>
              <div className="lb-bases">
                {Object.values(TIPOS).map((t) => <button key={t.id} type="button" className="secondary" onClick={() => cargarBase(t.id)}>{t.nombre}</button>)}
              </div>
              <p className={`lb-contador ${total === n ? 'ok' : 'mal'}`}>Roles: {total} / {n} jugadores</p>
              {ORDEN_ROLES.map((r) => {
                const rol = ROLES[r];
                const c = custom[r] || 0;
                return (
                  <div key={r} className="lb-rol-fila" style={{ '--rol': BANDOS[rol.bando].color }}>
                    <span className="lb-explicado-icono"><Icon name={rol.icono} size={22} /></span>
                    <div className="lb-rol-fila-info">
                      <strong>{rol.nombre}</strong>{!CLASICOS.includes(r) && <span className="badge">Nuevo</span>} <small>({BANDOS[rol.bando].nombre}{rol.unico ? ' · único' : ''}{rol.incierto ? ' · 50 % lobo' : ''})</small>
                      <p>{rol.resumen}</p>
                    </div>
                    <div className="lb-stepper">
                      <button type="button" className="secondary" disabled={c === 0} onClick={() => cambiarRol(r, -1)} aria-label={`Quitar ${rol.nombre}`}>−</button>
                      <span>{c}</span>
                      <button type="button" className="secondary" disabled={(rol.unico && c >= 1)} onClick={() => cambiarRol(r, 1)} aria-label={`Añadir ${rol.nombre}`}>+</button>
                    </div>
                  </div>
                );
              })}
              {total < n && <button type="button" className="secondary full" onClick={rellenarAldeanos}>Rellenar los {n - total} huecos con aldeanos</button>}
              {total > n && <p className="lb-aviso-comp">Sobran {total - n} roles: quita alguno.</p>}
              {validacion.errores.map((m) => <p key={m} className="error" style={{ marginTop: '.6rem' }}>{m}</p>)}
              {validacion.avisos.map((m) => <p key={m} className="lb-aviso-comp">⚠ {m}</p>)}
              {!bloqueado && <Equilibrio roles={rolesCustom} mec={mec} />}
            </div>
          )}


          <div className="panel lb-mec">
            <h3 className="panel-title"><Icon name="zap" size={22} /> Mecánicas globales (opcionales)</h3>
            <p className="hint small">Añaden caos a cualquier partida. Todas están desactivadas por defecto.</p>
            {MECANICAS.map((m) => (
              <label key={m.id} className="lb-check lb-mec-fila">
                <input type="checkbox" checked={!!mec[m.id]} onChange={(ev) => setMec((x) => ({ ...x, [m.id]: ev.target.checked }))} />
                <span><strong>{m.nombre}.</strong> {m.texto}</span>
              </label>
            ))}
            <div className="lb-bases">
              <button type="button" className="secondary" onClick={() => setMec({ ...MEC_NINGUNA })}>Ninguna</button>
              <button type="button" className="secondary" onClick={() => setMec({ ...MEC_NINGUNA, ...TIPOS[tipoSel].mec })}>Sugeridas para «{TIPOS[tipoSel].nombre}»</button>
              <button type="button" className="secondary" onClick={() => setMec({ ...MEC_TODAS })}>Todas</button>
            </div>
          </div>


    </>
  );
}
