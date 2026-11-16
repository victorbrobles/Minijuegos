// client/src/pages/AdminEstadisticas.jsx
// /admin/estadisticas — panel de uso para el administrador: visitantes por día, cuántos usan la app instalada,
// partidas terminadas y, por juego, cuántas veces se abre, cuántas se acaba (y cuántas se deja a medias) y su valoración.
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { adminHeaders, useAdmin } from '../lib/admin.js';
import { metaDe } from '../games/meta.js';
import { miniatura } from '../lib/portadas.js';
import { useValoraciones, porcentaje } from '../lib/valoraciones.js';
import './AdminEstadisticas.css';

const PERIODOS = [[7, '7 días'], [30, '30 días'], [90, '3 meses'], [365, '1 año']];
const num = (n) => Number(n || 0).toLocaleString('es-ES');
const diaCorto = (d) => new Date(`${d}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

function Tarjeta({ icono, valor, texto, nota }) {
  return <div className="ae-tarjeta"><span>{icono}</span><b>{valor}</b><small>{texto}</small>{nota && <em>{nota}</em>}</div>;
}

export default function AdminEstadisticas() {
  const esAdmin = useAdmin();
  const [dias, setDias] = useState(30);
  const [d, setD] = useState(null);
  const [orden, setOrden] = useState('aperturas');
  const valoraciones = useValoraciones();
  useEffect(() => {
    if (!esAdmin) return undefined;
    let vivo = true;
    setD(null);
    fetch(`/api/metricas/resumen?dias=${dias}`, { headers: adminHeaders() })
      .then((r) => r.json()).then((x) => { if (vivo) setD(x); }).catch(() => vivo && setD({ error: 'No se pudo cargar.' }));
    return () => { vivo = false; };
  }, [dias, esAdmin]);

  // Días sin visitas también salen (a cero) para que la gráfica no engañe
  const serie = useMemo(() => {
    if (!d?.porDia) return [];
    const mapa = Object.fromEntries(d.porDia.map((x) => [x.dia, x]));
    const out = [];
    for (let i = Math.min(dias, 90) - 1; i >= 0; i--) {
      const dia = new Date(Date.now() - i * 86400000).toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
      out.push({ dia, visitantes: mapa[dia]?.visitantes || 0, enApp: mapa[dia]?.enApp || 0 });
    }
    return out;
  }, [d, dias]);
  const maximo = Math.max(1, ...serie.map((x) => x.visitantes));

  const juegos = useMemo(() => (d?.juegos || []).map((j) => ({
    ...j,
    acaba: j.abren ? Math.min(100, Math.round((j.acaban / j.abren) * 100)) : null,
    valor: porcentaje(valoraciones?.[j.juego])
  })).sort((a, b) => (orden === 'acaba' ? (a.acaba ?? 101) - (b.acaba ?? 101) : orden === 'valor' ? (b.valor ?? -1) - (a.valor ?? -1) : b[orden] - a[orden])), [d, valoraciones, orden]);

  if (!esAdmin) {
    return (
      <div className="game-shell ae-pagina">
        <section className="ae-caja"><p>Esta página es solo para el administrador. Activa el modo administrador al final de la portada.</p><Link to="/">Ir a la portada</Link></section>
      </div>
    );
  }
  const t = d?.totales || {};
  return (
    <div className="game-shell ae-pagina">
      <Link to="/" className="back" aria-label="Volver a la portada"><Icon name="arrowLeft" size={20} strokeWidth={2.5} /><span>Portada</span></Link>
      <header className="ae-cab">
        <div><small>Administración</small><h1>📊 Estadísticas de uso</h1></div>
        <div className="ae-periodos" role="tablist">
          {PERIODOS.map(([n, txt]) => <button key={n} type="button" role="tab" aria-selected={dias === n} className={dias === n ? 'activo' : ''} onClick={() => setDias(n)}>{txt}</button>)}
        </div>
      </header>

      {!d && <p className="loading">Cargando…</p>}
      {d?.error && <section className="ae-caja"><p>{d.error}</p></section>}
      {d && !d.error && (
        <>
          <div className="ae-tarjetas">
            <Tarjeta icono="👥" valor={num(t.visitas)} texto="visitas (personas distintas cada día)" nota={`${num(t.mediaDiaria)} al día de media`} />
            <Tarjeta icono="📲" valor={num(t.enApp)} texto="con la app instalada" nota={t.visitas ? `${Math.round((t.enApp / t.visitas) * 100)} % de las visitas` : null} />
            <Tarjeta icono="⬇️" valor={num(t.instalaciones)} texto="instalaciones" />
            <Tarjeta icono="🎲" valor={num(t.partidas)} texto="partidas terminadas" />
          </div>

          <section className="ae-caja">
            <h2>Personas por día</h2>
            <div className="ae-grafica" role="img" aria-label={`Visitantes por día en los últimos ${serie.length} días`}>
              {serie.map((x) => (
                <div key={x.dia} className="ae-barra" title={`${diaCorto(x.dia)}: ${x.visitantes} personas (${x.enApp} con la app)`}>
                  <span style={{ height: `${(x.visitantes / maximo) * 100}%` }}><i style={{ height: x.visitantes ? `${(x.enApp / x.visitantes) * 100}%` : 0 }} /></span>
                </div>
              ))}
            </div>
            <div className="ae-eje"><span>{serie[0] && diaCorto(serie[0].dia)}</span><span>Máx. {maximo}</span><span>Hoy</span></div>
            <p className="ae-leyenda"><i className="web" /> En el navegador <i className="app" /> Con la app instalada</p>
          </section>

          <section className="ae-caja">
            <h2>Juegos <small>{juegos.length} con actividad</small></h2>
            <div className="ae-orden">
              Ordenar por:
              {[['aperturas', 'Más abiertos'], ['partidas', 'Más partidas'], ['acaba', 'Más abandonos'], ['valor', 'Mejor valorados']].map(([k, txt]) => (
                <button key={k} type="button" className={orden === k ? 'activo' : ''} onClick={() => setOrden(k)}>{txt}</button>
              ))}
            </div>
            {juegos.length === 0 ? <p className="ae-nota">Aún no hay datos en este periodo.</p> : (
              <div className="ae-tabla-caja">
                <table className="ae-tabla">
                  <thead><tr><th>Juego</th><th>Abierto</th><th title="Personas distintas cada día, sumadas">Personas/día</th><th>Partidas</th><th title="Días en que alguien lo abrió y terminó al menos una partida">Acaban</th><th>👍</th></tr></thead>
                  <tbody>
                    {juegos.map((j) => {
                      const m = metaDe(j.juego);
                      return (
                        <tr key={j.juego}>
                          <td><Link to={`/juego/${j.juego}`} className="ae-juego">{m.imagen ? <img src={miniatura(m.imagen)} alt="" loading="lazy" /> : <span />}<b>{m.titulo}</b></Link></td>
                          <td>{num(j.aperturas)}</td>
                          <td>{num(j.personas)}</td>
                          <td>{num(j.partidas)}</td>
                          <td><span className={`ae-pct ${j.acaba == null ? '' : j.acaba < 40 ? 'mal' : j.acaba < 70 ? 'medio' : 'bien'}`}>{j.acaba == null ? '—' : `${j.acaba} %`}</span></td>
                          <td>{j.valor == null ? '—' : `${j.valor} %`}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <p className="ae-nota">«Acaban»: de las veces que alguien abre el juego (una por persona y día), en cuántas termina al menos una partida. Un porcentaje bajo indica que la gente lo deja a medias o no lo entiende. Los datos son anónimos y no se guarda nada en el móvil: cada persona se cuenta por día (no se puede seguir a nadie de un día a otro).</p>
          </section>
        </>
      )}
    </div>
  );
}
