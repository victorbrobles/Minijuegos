// client/src/pages/AdminPanel.jsx
// /admin/panel — herramientas del administrador, por pestañas:
//   Salas en directo · Buzón · Errores · Juegos (estado, «Nuevo», Top, valoraciones, CSV) · Anuncio · Moderación ·
//   Cuentas · Servidor (memoria, Turso, copias) · Reto diario.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { useAdmin } from '../lib/admin.js';
import { TOP_CREADOR, metaDe } from '../games/meta.js';
import { miniatura as miniDe } from '../lib/portadas.js';

const miniatura = (id) => miniDe(metaDe(id).imagen) || '';
import { recargarPortada } from '../lib/soporte.js';
import './AdminEstadisticas.css';
import './AdminPanel.css';
import '../components/Soporte.css';

const API = '/api/admin/panel';
async function pedir(ruta, cuerpo) {
  const r = await fetch(API + ruta, cuerpo === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || `Error ${r.status}`);
  return d;
}
const fecha = (t) => (t ? new Date(t).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) : '—');
const hace = (t) => {
  if (!t) return '—';
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return `hace ${s} s`;
  if (s < 3600) return `hace ${Math.round(s / 60)} min`;
  if (s < 86400) return `hace ${Math.round(s / 3600)} h`;
  return `hace ${Math.round(s / 86400)} d`;
};
const num = (n) => Number(n || 0).toLocaleString('es-ES');

/** Carga datos de una ruta del panel (y los recarga cada `cada` ms si se indica). */
function useDatos(ruta, cada = 0) {
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  const cargar = useCallback(() => pedir(ruta).then((x) => { setD(x); setError(''); }).catch((e) => setError(e.message)), [ruta]);
  useEffect(() => {
    cargar();
    if (!cada) return undefined;
    const t = setInterval(cargar, cada);
    return () => clearInterval(t);
  }, [cargar, cada]);
  return [d, cargar, error, setD];
}
function Aviso({ texto, onCerrar }) {
  if (!texto) return null;
  return <p className={`ap-aviso${texto.startsWith('✅') ? '' : ' mal'}`} role="status">{texto}<button type="button" onClick={onCerrar} aria-label="Cerrar">✕</button></p>;
}
function useAviso() {
  const [aviso, setAviso] = useState('');
  const hacer = async (f, ok) => {
    try { const r = await f(); if (ok) setAviso(`✅ ${typeof ok === 'function' ? ok(r) : ok}`); return r; } catch (e) { setAviso(`⚠️ ${e.message}`); return null; }
  };
  return [<Aviso key="aviso" texto={aviso} onCerrar={() => setAviso('')} />, hacer];
}

/* ───────── 🟢 Salas en directo ───────── */
function Salas() {
  const [d, cargar, error] = useDatos('/salas', 4000);
  const [aviso, hacer] = useAviso();
  const [pruebas, setPruebas] = useState([]);
  const accion = (s, tipo, datos = {}, confirmar) => {
    if (confirmar && !window.confirm(confirmar)) return;
    hacer(() => pedir(`/salas/${s.juego}/${s.code}/${tipo}`, datos), 'Hecho.').then(cargar);
  };
  const prueba = async (s) => {
    const ventana = window.open('', '_blank'); // abrirla ya (si no, el navegador la bloquea al llegar la respuesta)
    const r = await hacer(() => pedir(`/salas/${s.juego}/${s.code}/prueba`, {}));
    if (!r) { ventana?.close(); return; }
    const url = `/juego/${s.juego}?probar=${r.code}.${r.token}`;
    if (ventana) ventana.location.href = url;
    setPruebas((p) => [{ nombre: r.nombre, url, juego: s.nombre, code: r.code }, ...p].slice(0, 8));
    cargar();
  };
  const salas = d?.salas || [];
  return (
    <section className="ae-caja">
      <h2>🟢 Salas en directo <small>{salas.length} abiertas · {num(salas.reduce((a, s) => a + s.jugadores.length, 0))} jugadores · se actualiza sola</small></h2>
      {aviso}
      {error && <p className="ap-aviso mal">{error}</p>}
      {pruebas.length > 0 && (
        <div className="ap-pruebas">
          <b>🧪 Jugadores de prueba</b> (cada uno, en otra pestaña):
          {pruebas.map((p) => <a key={p.url} href={p.url} target="_blank" rel="noreferrer">{p.nombre} · {p.juego} {p.code} ↗</a>)}
        </div>
      )}
      {!salas.length && d && <p className="ae-nota">No hay ninguna sala abierta ahora mismo.</p>}
      <div className="ap-salas">
        {salas.map((s) => (
          <article key={`${s.juego}-${s.code}`} className="ap-sala">
            <header>
              <img src={miniatura(s.juego)} alt="" loading="lazy" />
              <span><b>{s.nombre}</b><small>Sala <code>{s.code}</code> · {s.estado}{s.ronda ? ` · ronda ${s.ronda}` : ''} · {hace(s.actividad)}</small></span>
            </header>
            <ul>
              {s.jugadores.map((j) => (
                <li key={j.id}>
                  <span>{j.anfitrion ? '👑 ' : ''}{j.prueba ? '🧪 ' : ''}{j.nombre}</span>
                  <button type="button" onClick={() => accion(s, 'expulsar', { id: j.id }, `¿Echar a ${j.nombre} de la sala?`)}>Echar</button>
                </li>
              ))}
            </ul>
            <div className="ap-botones">
              {s.acciones.prueba && <button type="button" onClick={() => prueba(s)}>🧪 Jugador de prueba</button>}
              {s.acciones.forzar && <button type="button" onClick={() => accion(s, 'forzar')}>⏩ Forzar avance</button>}
              {s.acciones.terminar && <button type="button" onClick={() => accion(s, 'terminar', {}, '¿Terminar la partida y pasar a la pantalla final?')}>🏁 Terminar</button>}
              <button type="button" className="peligro" onClick={() => accion(s, 'cerrar', {}, `¿Cerrar la sala ${s.code}? Todos saldrán de ella.`)}>✕ Cerrar sala</button>
            </div>
          </article>
        ))}
      </div>
      <p className="ae-nota">🧪 <b>Modo pruebas</b>: crea tú una sala online en cualquier juego, pulsa «Jugador de prueba» (se abre en otra pestaña como otro jugador) y usa «Forzar avance» o «Terminar» para llegar rápido a cualquier pantalla. Solo en los juegos con salas comunes; en el resto puedes cerrar la sala o echar a alguien.</p>
    </section>
  );
}

/* ───────── 📬 Buzón de fallos y sugerencias ───────── */
const TIPO_REPORTE = { fallo: '🐞 Fallo', contenido: '📝 Contenido', sugerencia: '💡 Idea' };
function Buzon() {
  const [filtro, setFiltro] = useState('nuevo');
  const [d, cargar] = useDatos(`/reportes${filtro ? `?estado=${filtro}` : ''}`);
  const [aviso, hacer] = useAviso();
  const cambiar = (r, cuerpo) => hacer(() => pedir(`/reportes/${r.id}`, cuerpo)).then(cargar);
  return (
    <section className="ae-caja">
      <h2>📬 Buzón <small>{d?.nuevos ?? '…'} sin leer</small><a className="ap-csv" href={`${API}/exportar/reportes`}>⬇ CSV</a></h2>
      {aviso}
      <div className="ae-orden">
        {[['nuevo', 'Sin leer'], ['visto', 'Vistos'], ['resuelto', 'Resueltos'], ['', 'Todos']].map(([id, t]) => (
          <button type="button" key={id} className={filtro === id ? 'activo' : ''} onClick={() => setFiltro(id)}>{t}</button>
        ))}
      </div>
      {d && !d.reportes.length && <p className="ae-nota">No hay nada aquí. 🎉</p>}
      <ul className="ap-lista">
        {(d?.reportes || []).map((r) => (
          <li key={r.id} className={`ap-reporte ${r.estado}`}>
            <div className="ap-meta"><b>{TIPO_REPORTE[r.tipo] || r.tipo}</b> · {r.juego ? <Link to={`/juego/${r.juego}`}>{r.nombreJuego}</Link> : 'Web'} · {fecha(r.fecha)}{r.quien ? ` · ${r.quien}` : ''}</div>
            <p>{r.mensaje}</p>
            <small className="ap-nav">{r.ruta} · {r.navegador?.slice(0, 90)}</small>
            <div className="ap-botones">
              {r.estado !== 'visto' && <button type="button" onClick={() => cambiar(r, { estado: 'visto' })}>👁 Visto</button>}
              {r.estado !== 'resuelto' && <button type="button" onClick={() => cambiar(r, { estado: 'resuelto' })}>✅ Resuelto</button>}
              {r.estado !== 'nuevo' && <button type="button" onClick={() => cambiar(r, { estado: 'nuevo' })}>↩ Sin leer</button>}
              <button type="button" className="peligro" onClick={() => window.confirm('¿Borrar este aviso?') && cambiar(r, { borrar: true })}>🗑</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ───────── 🧯 Registro de errores ───────── */
function Errores() {
  const [d, cargar] = useDatos('/errores');
  const [aviso, hacer] = useAviso();
  const [abierto, setAbierto] = useState(null);
  const borrar = (cuerpo, q) => window.confirm(q) && hacer(() => pedir('/errores/borrar', cuerpo)).then(cargar);
  const lista = d?.errores || [];
  return (
    <section className="ae-caja">
      <h2>🧯 Errores de la web <small>{lista.length} distintos · {num(lista.reduce((a, e) => a + e.veces, 0))} veces</small><a className="ap-csv" href={`${API}/exportar/errores`}>⬇ CSV</a></h2>
      {aviso}
      <p className="ae-nota">Errores de JavaScript que han tenido los navegadores de la gente (solo en la web publicada). El mismo error en el mismo juego se agrupa con su contador.</p>
      {lista.length > 0 && <button type="button" className="ap-secundario" onClick={() => borrar({ todos: true }, '¿Vaciar todo el registro de errores?')}>🗑 Vaciar el registro</button>}
      {d && !lista.length && <p className="ae-nota">Ningún error registrado. 🎉</p>}
      <ul className="ap-lista">
        {lista.map((e) => (
          <li key={e.firma} className="ap-error">
            <button type="button" className="ap-error-cab" onClick={() => setAbierto(abierto === e.firma ? null : e.firma)} aria-expanded={abierto === e.firma}>
              <em>×{num(e.veces)}</em><span><b>{e.mensaje}</b><small>{e.juego ? e.nombreJuego : 'Web'} · última {hace(e.ultima)} · primera {fecha(e.primera)}</small></span>
            </button>
            {abierto === e.firma && (
              <div className="ap-error-det">
                <pre>{e.pila || 'Sin pila.'}</pre>
                <small>{e.ruta} · {e.navegador}</small>
                <button type="button" className="ap-secundario" onClick={() => borrar({ firma: e.firma }, '¿Borrar este error del registro (por ejemplo, ya arreglado)?')}>🗑 Borrar (arreglado)</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ───────── 🎮 Juegos: estado, «Nuevo», Top del Creador y valoraciones ───────── */
const ORDENES = [['nombre', 'Nombre'], ['partidasMes', 'Más jugados'], ['menos', 'Menos jugados'], ['si', 'Más 👍'], ['no', 'Más 👎'], ['estado', 'Estado']];
function Juegos() {
  const [d, cargar, , setD] = useDatos('/juegos');
  const [aviso, hacer] = useAviso();
  const [orden, setOrden] = useState('partidasMes');
  const [buscar, setBuscar] = useState('');
  const cambiar = async (g, cuerpo) => {
    const r = await hacer(() => pedir(`/juegos/${g.id}`, cuerpo));
    if (r) { setD((x) => ({ ...x, juegos: x.juegos.map((j) => (j.id === g.id ? { ...j, estado: r.ajustes.estado || 'normal', nuevo: r.ajustes.nuevo ?? null } : j)) })); recargarPortada(); }
  };
  const juegos = useMemo(() => {
    const t = buscar.trim().toLowerCase();
    const l = (d?.juegos || []).filter((g) => !t || g.nombre.toLowerCase().includes(t) || g.id.includes(t));
    const f = {
      nombre: (a, b) => a.nombre.localeCompare(b.nombre, 'es'), menos: (a, b) => a.partidasMes - b.partidasMes || a.visitasMes - b.visitasMes,
      estado: (a, b) => (a.estado === 'normal') - (b.estado === 'normal')
    }[orden] || ((a, b) => b[orden] - a[orden]);
    return [...l].sort(f);
  }, [d, orden, buscar]);
  return (
    <>
      <Top juegos={d?.juegos || []} top={d?.top} onCambio={cargar} />
      <section className="ae-caja">
        <h2>🎮 Juegos <small>partidas y visitas de los últimos 30 días</small><a className="ap-csv" href={`${API}/exportar/juegos`}>⬇ CSV</a></h2>
        {aviso}
        <p className="ae-nota"><b>En mantenimiento</b>: sigue en la portada, pero al entrar sale un aviso. <b>Oculto</b>: desaparece de la portada (tú lo sigues viendo). <b>Nuevo</b>: la etiqueta de la portada.</p>
        <div className="ae-orden">
          <input className="ap-filtro" value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Buscar juego" aria-label="Buscar juego" />
          {ORDENES.map(([id, t]) => <button type="button" key={id} className={orden === id ? 'activo' : ''} onClick={() => setOrden(id)}>{t}</button>)}
        </div>
        <div className="ae-tabla-caja">
          <table className="ae-tabla ap-tabla-juegos">
            <thead><tr><th>Juego</th><th>Estado</th><th>Nuevo</th><th>👍</th><th>👎</th><th>Partidas</th><th>Visitas</th><th>Total</th></tr></thead>
            <tbody>
              {juegos.map((g) => (
                <tr key={g.id} className={g.estado !== 'normal' ? `ap-${g.estado}` : ''}>
                  <td><Link to={`/juego/${g.id}`} className="ae-juego"><img src={miniatura(g.id)} alt="" loading="lazy" /><b>{g.nombre}</b></Link></td>
                  <td>
                    <select value={g.estado} onChange={(e) => cambiar(g, { estado: e.target.value })} aria-label={`Estado de ${g.nombre}`}>
                      <option value="normal">✅ Normal</option><option value="mantenimiento">🛠️ Mantenimiento</option><option value="oculto">🙈 Oculto</option>
                    </select>
                  </td>
                  <td>
                    <select value={g.nuevo === null ? '' : String(g.nuevo)} onChange={(e) => cambiar(g, { nuevo: e.target.value === '' ? null : e.target.value === 'true' })} aria-label={`Etiqueta Nuevo de ${g.nombre}`}>
                      <option value="">De serie ({g.nuevoDeSerie ? 'sí' : 'no'})</option><option value="true">Sí</option><option value="false">No</option>
                    </select>
                  </td>
                  <td>{num(g.si)}</td><td>{num(g.no)}</td><td>{num(g.partidasMes)}</td><td>{num(g.visitasMes)}</td><td>{num(g.partidas)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
function Top({ juegos, top, onCambio }) {
  const [lista, setLista] = useState(null);
  const [aviso, hacer] = useAviso();
  const [nuevo, setNuevo] = useState('');
  useEffect(() => { if (juegos.length) setLista((top?.length ? top : TOP_CREADOR).filter((id) => juegos.some((g) => g.id === id))); }, [top, juegos]);
  if (!lista) return null;
  const nombre = (id) => juegos.find((g) => g.id === id)?.nombre || id;
  const mover = (i, d) => setLista((l) => { const c = [...l]; const j = i + d; if (j < 0 || j >= c.length) return l; [c[i], c[j]] = [c[j], c[i]]; return c; });
  const guardar = (valor) => hacer(() => pedir('/top', { lista: valor }), valor ? 'Top guardado: ya sale así en la portada.' : 'Vuelve el Top de serie.').then(() => { recargarPortada(); onCambio(); });
  return (
    <section className="ae-caja">
      <h2>⭐ Top 15 del Creador <small>{top?.length ? 'cambiado desde el panel' : 'el de serie'}</small></h2>
      {aviso}
      <ol className="ap-top">
        {lista.map((id, i) => (
          <li key={id}>
            <img src={miniatura(id)} alt="" loading="lazy" /><span>{nombre(id)}</span>
            <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir">▲</button>
            <button type="button" onClick={() => mover(i, 1)} disabled={i === lista.length - 1} aria-label="Bajar">▼</button>
            <button type="button" onClick={() => setLista((l) => l.filter((x) => x !== id))} aria-label="Quitar">✕</button>
          </li>
        ))}
      </ol>
      {lista.length < 15 && (
        <div className="ap-fila">
          <select value={nuevo} onChange={(e) => setNuevo(e.target.value)} aria-label="Añadir juego al Top">
            <option value="">Añadir un juego…</option>
            {[...juegos].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')).filter((g) => !lista.includes(g.id)).map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
          </select>
          <button type="button" disabled={!nuevo} onClick={() => { setLista((l) => [...l, nuevo]); setNuevo(''); }}>Añadir</button>
        </div>
      )}
      <div className="ap-botones">
        <button type="button" className="principal" onClick={() => guardar(lista)} disabled={!lista.length}>Guardar el Top</button>
        {top?.length > 0 && <button type="button" onClick={() => guardar(null)}>Volver al de serie</button>}
      </div>
    </section>
  );
}

/* ───────── 📢 Anuncio en la portada ───────── */
function Anuncio() {
  const [d, cargar] = useDatos('/anuncio');
  const [aviso, hacer] = useAviso();
  const [f, setF] = useState({ texto: '', tipo: 'info', horas: 48, enlace: '' });
  const a = d?.anuncio;
  const publicar = (cuerpo, ok) => hacer(() => pedir('/anuncio', cuerpo), ok).then(() => { cargar(); recargarPortada(); });
  return (
    <section className="ae-caja">
      <h2>📢 Anuncio en la portada</h2>
      {aviso}
      {a ? (
        <div className={`sop-anuncio ${a.tipo} ap-actual`}>
          <p>{a.texto}<br /><small>{a.hasta ? `Hasta el ${fecha(a.hasta)}` : 'Sin fecha de fin'}{a.enlace ? ` · enlace ${a.enlace}` : ''}</small></p>
          <button type="button" onClick={() => publicar({ texto: '' }, 'Anuncio quitado.')}>Quitar</button>
        </div>
      ) : <p className="ae-nota">Ahora mismo no hay ningún anuncio.</p>}
      <form className="ap-form" onSubmit={(e) => { e.preventDefault(); publicar(f, 'Anuncio publicado.'); }}>
        <label>Texto<textarea rows={3} maxLength={300} value={f.texto} onChange={(e) => setF({ ...f, texto: e.target.value })} placeholder="Ej.: ¡Nuevo juego: Qué malo es conocerse! Pruébalo con tus amigos." /></label>
        <div className="ap-fila">
          <label>Tipo<select value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}><option value="info">📢 Información</option><option value="novedad">✨ Novedad</option><option value="aviso">⚠️ Aviso</option></select></label>
          <label>Dura<select value={f.horas} onChange={(e) => setF({ ...f, horas: Number(e.target.value) })}>
            {[[6, '6 horas'], [24, '1 día'], [48, '2 días'], [168, '1 semana'], [720, '1 mes'], [0, 'Sin fin']].map(([h, t]) => <option key={h} value={h}>{t}</option>)}
          </select></label>
          <label>Enlace (opcional)<input value={f.enlace} onChange={(e) => setF({ ...f, enlace: e.target.value })} placeholder="/juego/conocerse" /></label>
        </div>
        <button type="submit" className="principal" disabled={!f.texto.trim()}>{a ? 'Sustituir el anuncio' : 'Publicar'}</button>
      </form>
      <p className="ae-nota">Quien lo cierre no lo vuelve a ver; si publicas uno nuevo, sí.</p>
    </section>
  );
}

/* ───────── 🧹 Moderación ───────── */
function Moderacion() {
  const [d, cargar] = useDatos('/moderacion');
  const [aviso, hacer] = useAviso();
  const [palabras, setPalabras] = useState(null);
  const [bloq, setBloq] = useState({ jugador: '', motivo: '' });
  useEffect(() => { if (d && palabras === null) setPalabras(d.palabras.join(', ')); }, [d, palabras]);
  const borrar = (cuerpo, q) => (!q || window.confirm(q)) && hacer(() => pedir('/moderacion/borrar', cuerpo), 'Hecho.').then(cargar);
  const bloquear = (jugador, quitar, motivo = '') => hacer(() => pedir('/moderacion/bloquear', { jugador, quitar, motivo }), quitar ? `${jugador} desbloqueado.` : `${jugador} bloqueado.`).then(cargar);
  if (!d) return <section className="ae-caja"><p className="ae-nota">Cargando…</p></section>;
  return (
    <>
      <section className="ae-caja">
        <h2>🚫 Palabras prohibidas <small>{d.palabras.length}</small></h2>
        {aviso}
        <p className="ae-nota">Separadas por comas o en líneas. Se rechazan en nicks, nombres de jugador, nombres de grupo, preguntas y textos, sin importar mayúsculas, tildes ni trucos como «t0nt0».</p>
        <textarea className="ap-area" rows={4} value={palabras ?? ''} onChange={(e) => setPalabras(e.target.value)} />
        <button type="button" className="principal" onClick={() => hacer(() => pedir('/moderacion/palabras', { texto: palabras }), (r) => `Guardadas ${r.palabras.length} palabras.`).then((r) => { if (r) setPalabras(r.palabras.join(', ')); cargar(); })}>Guardar palabras</button>
      </section>
      <section className="ae-caja">
        <h2>⛔ Jugadores bloqueados <small>{d.bloqueados.length}</small></h2>
        <form className="ap-fila" onSubmit={(e) => { e.preventDefault(); bloquear(bloq.jugador.trim(), false, bloq.motivo); setBloq({ jugador: '', motivo: '' }); }}>
          <input value={bloq.jugador} onChange={(e) => setBloq({ ...bloq, jugador: e.target.value })} placeholder="Nick#1234" aria-label="Jugador a bloquear" />
          <input value={bloq.motivo} onChange={(e) => setBloq({ ...bloq, motivo: e.target.value })} placeholder="Motivo (opcional)" aria-label="Motivo" />
          <button type="submit" disabled={!bloq.jugador.trim()}>Bloquear</button>
        </form>
        <p className="ae-nota">Un jugador bloqueado no puede crear salas, grupos ni preguntas, ni guardar resultados con ese nombre; si tiene cuenta, tampoco puede iniciar sesión.</p>
        <ul className="ae-cuentas">
          {d.bloqueados.map((b) => (
            <li key={b.jugador}><span><b>{b.jugador}</b><small>{b.motivo || 'Sin motivo'} · {fecha(b.fecha)}</small></span><button type="button" onClick={() => bloquear(b.jugador, true)}>Desbloquear</button></li>
          ))}
        </ul>
      </section>
      <section className="ae-caja">
        <h2>👥 Grupos <small>los 100 más recientes</small></h2>
        <ul className="ae-cuentas">
          {d.grupos.map((g) => (
            <li key={g.codigo}>
              <span><b>{g.nombre}</b><small>{g.codigo} · de {g.creador} · {g.miembros} miembros · {fecha(g.creado)}</small></span>
              <span className="ap-botones">
                <button type="button" onClick={() => { const n = window.prompt('Nombre nuevo del grupo:', g.nombre); if (n) borrar({ tipo: 'renombrar', id: g.codigo, nombre: n }); }}>✏️</button>
                <button type="button" className="peligro" onClick={() => borrar({ tipo: 'grupo', id: g.codigo }, `¿Borrar el grupo «${g.nombre}» con sus miembros, preguntas y noches?`)}>🗑</button>
              </span>
            </li>
          ))}
          {!d.grupos.length && <li className="ae-nota">No hay grupos.</li>}
        </ul>
      </section>
      <section className="ae-caja">
        <h2>❓ Preguntas de los grupos <small>las 150 más recientes</small></h2>
        <ul className="ae-cuentas">
          {d.preguntas.map((p) => (
            <li key={p.id}>
              <span><b>{p.texto}</b><small>{p.autor} · grupo {p.codigo} · {p.juego} · {fecha(p.creado)}</small></span>
              <span className="ap-botones">
                <button type="button" onClick={() => bloquear(p.autor, false, 'Pregunta inapropiada')}>⛔</button>
                <button type="button" className="peligro" onClick={() => borrar({ tipo: 'pregunta', id: p.id }, '¿Borrar esta pregunta?')}>🗑</button>
              </span>
            </li>
          ))}
          {!d.preguntas.length && <li className="ae-nota">No hay preguntas propias.</li>}
        </ul>
      </section>
      <section className="ae-caja">
        <h2>🏷️ Nombres que han jugado <small>los 150 últimos</small></h2>
        <ul className="ap-nicks">
          {d.jugadores.map((j) => {
            const esBloq = d.bloqueados.some((b) => b.jugador.toLowerCase() === j.jugador.toLowerCase());
            return (
              <li key={j.jugador} className={esBloq ? 'bloq' : ''}>
                <span>{j.jugador}<small>{j.partidas} partidas · {hace(j.ultima)}</small></span>
                {j.jugador.includes('#') && <button type="button" onClick={() => bloquear(j.jugador, esBloq, 'Nombre inapropiado')}>{esBloq ? 'Desbloquear' : '⛔'}</button>}
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}

/* ───────── 👤 Cuentas ───────── */
function Cuentas() {
  const [q, setQ] = useState('');
  const [d, setD] = useState(null);
  const [aviso, hacer] = useAviso();
  const [provisional, setProvisional] = useState(null);
  const [bloqueados, setBloqueados] = useState([]);
  const buscar = useCallback((texto) => {
    fetch(`/api/usuarios/admin/buscar?q=${encodeURIComponent(texto)}`).then((r) => r.json()).then(setD).catch(() => {});
    pedir('/moderacion').then((m) => setBloqueados(m.bloqueados.map((b) => b.jugador.toLowerCase()))).catch(() => {});
  }, []);
  useEffect(() => { buscar(''); }, [buscar]);
  const restablecer = async (u) => {
    if (!window.confirm(`¿Dar una contraseña provisional a ${u.jugador} (${u.email})? La actual dejará de funcionar.`)) return;
    const r = await fetch('/api/usuarios/admin/restablecer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: u.email }) }).then((x) => x.json());
    setProvisional(r.error ? { error: r.error } : { ...r, email: u.email });
  };
  const bloquear = (u, quitar) => (quitar || window.confirm(`¿Bloquear la cuenta ${u.jugador}? Se cerrarán sus sesiones y no podrá entrar.`))
    && hacer(() => pedir('/cuentas/bloquear', { email: u.email, quitar }), quitar ? 'Cuenta desbloqueada.' : 'Cuenta bloqueada.').then(() => buscar(q));
  const borrar = (u) => window.prompt(`Esto borra la cuenta ${u.jugador} y TODOS sus datos (resultados, perfil, grupos, votos…). No se puede deshacer.\n\nEscribe BORRAR para confirmarlo:`) === 'BORRAR'
    && hacer(() => pedir('/cuentas/borrar', { email: u.email }), 'Cuenta borrada.').then(() => buscar(q));
  return (
    <section className="ae-caja">
      <h2>👤 Cuentas <small>{d?.total ?? '…'} en total</small><a className="ap-csv" href={`${API}/exportar/cuentas`}>⬇ CSV</a></h2>
      {aviso}
      <form className="ae-buscar" onSubmit={(e) => { e.preventDefault(); buscar(q); }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por correo o nick" aria-label="Buscar cuenta" />
        <button type="submit">Buscar</button>
      </form>
      {provisional && (
        <p className={`ae-provisional${provisional.error ? ' mal' : ''}`}>
          {provisional.error ? provisional.error : <>Contraseña provisional de <b>{provisional.jugador}</b>: <code>{provisional.provisional}</code>. Pásasela y dile que la cambie en ⚙️ Ajustes → Tu cuenta.</>}
        </p>
      )}
      <ul className="ae-cuentas">
        {(d?.usuarios || []).map((u) => {
          const esBloq = bloqueados.includes(u.jugador.toLowerCase());
          return (
            <li key={u.email} className={esBloq ? 'ap-bloq' : ''}>
              <span><b>{esBloq ? '⛔ ' : ''}{u.jugador}</b><small>{u.email} · último acceso {u.acceso ? new Date(u.acceso).toLocaleDateString('es-ES') : '—'}</small></span>
              <span className="ap-botones">
                <button type="button" onClick={() => restablecer(u)}>🔑</button>
                <button type="button" onClick={() => bloquear(u, esBloq)}>{esBloq ? 'Desbloquear' : '⛔'}</button>
                <button type="button" className="peligro" onClick={() => borrar(u)}>🗑</button>
              </span>
            </li>
          );
        })}
        {d && !d.usuarios?.length && <li className="ae-nota">No hay cuentas que coincidan.</li>}
      </ul>
      <p className="ae-nota">🔑 contraseña provisional · ⛔ bloquear (cierra sus sesiones) · 🗑 borrar la cuenta y sus datos.</p>
    </section>
  );
}

/* ───────── 🖥️ Servidor y copias ───────── */
const duracion = (ms) => { const h = Math.floor(ms / 3600000); const d = Math.floor(h / 24); return d ? `${d} d ${h % 24} h` : `${h} h ${Math.floor(ms / 60000) % 60} min`; };
const tam = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);
function Servidor() {
  const [d, cargar] = useDatos('/servidor', 10000);
  const [aviso, hacer] = useAviso();
  if (!d) return <section className="ae-caja"><p className="ae-nota">Cargando…</p></section>;
  const { servidor: s, datos, copias } = d;
  const bien = datos.turso === 'ok' || datos.turso === 'sin configurar';
  const restaurar = (c) => {
    if (window.prompt(`Restaurar la copia del ${fecha(c.fecha)} sustituye TODOS los datos actuales (cuentas, resultados, grupos…) por los de esa copia. Antes se guarda una copia de seguridad de lo de ahora.\n\nEscribe RESTAURAR para confirmarlo:`) !== 'RESTAURAR') return;
    hacer(() => pedir('/copias/restaurar', { nombre: c.nombre, confirmar: 'RESTAURAR' }), (r) => `Restauradas ${r.tablas} tablas. Lo de antes quedó en ${r.seguridad}.`).then(cargar);
  };
  return (
    <>
      <div className="ae-tarjetas">
        <div className="ae-tarjeta"><span>⏱️</span><b>{duracion(s.encendidoMs)}</b><small>encendido</small><em>desde {fecha(s.arrancado)}</em></div>
        <div className="ae-tarjeta"><span>🧠</span><b>{s.memoriaMB} MB</b><small>memoria usada</small><em>{s.memoriaLibreMB} MB libres de {s.memoriaTotalMB}</em></div>
        <div className="ae-tarjeta"><span>🟢</span><b>{s.salas}</b><small>salas abiertas</small><em>{s.jugadoresEnSalas} jugadores</em></div>
        <div className="ae-tarjeta"><span>⚙️</span><b>{s.cargaCpu.toFixed(2)}</b><small>carga de CPU</small><em>Node {s.node}</em></div>
      </div>
      <section className="ae-caja">
        <h2>🗄️ Base de datos</h2>
        {aviso}
        <ul className="ap-datos">
          <li><span>Origen al arrancar</span><b>{datos.origen}</b></li>
          <li><span>Copia en Turso</span><b className={bien ? 'ok' : 'mal'}>{datos.turso}</b></li>
          <li><span>Cambios sin subir</span><b>{num(datos.pendientes)}</b></li>
          <li><span>Última subida</span><b>{fecha(datos.ultimaSubida)}</b></li>
          {datos.ultimoError && <li><span>Último error</span><b className="mal">{datos.ultimoError}</b></li>}
        </ul>
        <div className="ap-botones">
          <button type="button" onClick={() => hacer(() => pedir('/servidor/subir', {}), 'Subida hecha.').then(cargar)}>⬆ Subir a Turso ahora</button>
          <button type="button" onClick={() => hacer(() => pedir('/copias/hacer', {}), 'Copia guardada.').then(cargar)}>💾 Hacer una copia ahora</button>
        </div>
      </section>
      <section className="ae-caja">
        <h2>💾 Copias en fichero <small>{copias.length}</small></h2>
        <ul className="ae-cuentas">
          {copias.map((c) => (
            <li key={c.nombre}>
              <span><b>{fecha(c.fecha)}</b><small>{c.nombre} · {tam(c.bytes)}</small></span>
              <span className="ap-botones">
                <a className="ap-boton-enlace" href={`${API}/copias/${encodeURIComponent(c.nombre)}`}>⬇ Descargar</a>
                <button type="button" className="peligro" onClick={() => restaurar(c)}>↺ Restaurar</button>
              </span>
            </li>
          ))}
          {!copias.length && <li className="ae-nota">Todavía no hay copias.</li>}
        </ul>
      </section>
    </>
  );
}

/* ───────── 📅 Reto diario ───────── */
function Reto() {
  const [d, , , setD] = useDatos('/reto');
  const [aviso, hacer] = useAviso();
  const hoy = d?.dias?.[0]?.fecha; // el primero es hoy (hora de España)
  const cambiar = (dia, tipo) => hacer(() => pedir('/reto', { fecha: dia.fecha, tipo }), `Reto del ${dia.fecha} cambiado.`).then((r) => { if (r) setD((x) => ({ ...x, dias: r.dias })); });
  if (!d) return <section className="ae-caja"><p className="ae-nota">Cargando…</p></section>;
  return (
    <section className="ae-caja">
      <h2>📅 Reto diario <small>hoy y los próximos días</small></h2>
      {aviso}
      <ul className="ap-retos">
        {d.dias.map((dia) => (
          <li key={dia.fecha} className={dia.fecha === hoy ? 'hoy' : ''}>
            <span className="ap-reto-dia"><b>{new Date(`${dia.fecha}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</b>{dia.fecha === hoy && <em>HOY</em>}</span>
            <span className="ap-reto-tipo">{dia.emoji} {dia.titulo}<small>{dia.generado ? `${num(dia.intentos)} intentos · ${num(dia.superados)} superados` : 'aún sin generar'}</small></span>
            <span className="ap-botones">
              <select value={dia.tipo} onChange={(e) => cambiar(dia, e.target.value)} aria-label={`Tipo de reto del ${dia.fecha}`}>
                {d.tipos.map((t) => <option key={t.id} value={t.id}>{t.emoji} {t.titulo}</option>)}
              </select>
              <button type="button" onClick={() => cambiar(dia, null)} title="Otro reto del mismo tipo">🎲</button>
            </span>
          </li>
        ))}
      </ul>
      <p className="ae-nota">Cambia el tipo o pulsa 🎲 para sacar otro contenido del mismo tipo. Si ya hay gente que lo ha jugado hoy, sus intentos se mantienen.</p>
    </section>
  );
}

const PESTANAS = [
  ['salas', '🟢', 'Salas', Salas], ['buzon', '📬', 'Buzón', Buzon], ['errores', '🧯', 'Errores', Errores], ['juegos', '🎮', 'Juegos', Juegos],
  ['anuncio', '📢', 'Anuncio', Anuncio], ['moderacion', '🧹', 'Moderación', Moderacion], ['cuentas', '👤', 'Cuentas', Cuentas],
  ['servidor', '🖥️', 'Servidor', Servidor], ['reto', '📅', 'Reto diario', Reto]
];
const CLAVE_PESTANA = 'minijuegos-admin-pestana';

export default function AdminPanel() {
  const esAdmin = useAdmin();
  const [pestana, setPestana] = useState(() => { try { return sessionStorage.getItem(CLAVE_PESTANA) || 'salas'; } catch { return 'salas'; } });
  useEffect(() => { try { sessionStorage.setItem(CLAVE_PESTANA, pestana); } catch { /* nada */ } }, [pestana]);
  const [nuevos, setNuevos] = useState(0);
  useEffect(() => { if (esAdmin) pedir('/reportes?estado=nuevo').then((d) => setNuevos(d.nuevos)).catch(() => {}); }, [esAdmin, pestana]);
  if (!esAdmin) return <Navigate to="/admin" replace />;
  const Actual = (PESTANAS.find((p) => p[0] === pestana) || PESTANAS[0])[3];
  return (
    <div className="ae-pagina ap-pagina">
      <Link to="/" className="back"><Icon name="arrowLeft" size={20} strokeWidth={2.5} />Portada</Link>
      <header className="ae-cab">
        <div><small>Modo administrador</small><h1>🛡️ Panel de control</h1></div>
        <Link to="/admin/estadisticas" className="ap-cab-enlace">📊 Estadísticas de uso</Link>
      </header>
      <nav className="ap-pestanas" aria-label="Secciones del panel">
        {PESTANAS.map(([id, emoji, texto]) => (
          <button type="button" key={id} className={pestana === id ? 'activo' : ''} onClick={() => setPestana(id)} aria-current={pestana === id ? 'page' : undefined}>
            <span aria-hidden="true">{emoji}</span>{texto}{id === 'buzon' && nuevos > 0 && <em>{nuevos}</em>}
          </button>
        ))}
      </nav>
      <Actual />
    </div>
  );
}
