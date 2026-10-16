import Icon, { ICONO_CATEGORIA, DEGRADADOS, DEGRADADO_TODAS } from './Icon.jsx';

// Tarjeta de categoría: icono + título (+ récord si se indica)
export default function CategoryCard({ nombre, indice, todas = false, secreta = false, record, icono, onClick }) {
  const [g1, g2] = todas ? DEGRADADO_TODAS : secreta ? ['#334155', '#7c3aed'] : DEGRADADOS[indice % DEGRADADOS.length];
  return (
    <button className={`cat-card${secreta ? ' secreta' : ''}`} style={{ '--g1': g1, '--g2': g2 }} onClick={onClick}>
      {secreta && <span className="secret-badge"><Icon name="lock" size={13} strokeWidth={2.500} />Admin</span>}
      <span className="cat-icon"><Icon name={icono ?? ICONO_CATEGORIA[nombre] ?? 'star'} size={34} /></span>
      <h2>{nombre}</h2>
      {record !== undefined && (
        <span className="cat-record"><Icon name="trophy" size={15} strokeWidth={2.200} />Récord: {record}</span>
      )}
    </button>
  );
}
