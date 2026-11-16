// client/src/pages/Creditos.jsx
// Créditos y avisos legales: de dónde salen las fotos, el audio, los mapas, los logotipos y los datos de los juegos.
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import './Estadisticas.css';
import './Creditos.css';

export default function Creditos() {
  const [fotos, setFotos] = useState(null);
  useEffect(() => {
    fetch('/api/rasgos/creditos').then((r) => (r.ok ? r.json() : null)).then((d) => setFotos(d?.fotos || [])).catch(() => setFotos([]));
  }, []);
  return (
    <div className="game-shell est-pagina crd-pagina">
      <Link to="/" className="back" aria-label="Volver a la portada"><Icon name="arrowLeft" size={20} strokeWidth={2.5} /><span>Portada</span></Link>
      <header className="est-cab">
        <span className="est-cab-ico">📜</span>
        <div><p>Al juego, juego</p><h1>Créditos y avisos legales</h1></div>
      </header>

      <section className="est-tarjeta">
        <h2>ℹ️ Sobre esta web</h2>
        <p>«Al juego, juego» es un proyecto personal para jugar con amigos y familia, sin ánimo de lucro y sin publicidad.</p>
        <p>No tiene relación, patrocinio ni afiliación con ningún club, liga, federación, futbolista, marca, artista o empresa de los que aparecen en los juegos.</p>
        <p>Los nombres, marcas, logotipos y escudos pertenecen a sus respectivos propietarios. Se usan únicamente para identificarlos en juegos de preguntas.</p>
        <p>Las mecánicas de algunos juegos se inspiran en juegos clásicos o populares, pero todos los nombres, textos, preguntas y gráficos de esta web son propios.</p>
        <p>Si eres titular de algún derecho y quieres que se retire o corrija algún contenido, escríbenos desde el apartado de contacto de la portada y lo atenderemos lo antes posible.</p>
      </section>

      <section className="est-tarjeta">
        <h2>🧩 Recursos de terceros</h2>
        <ul className="crd-lista">
          <li><b>Mapas</b> (Test del viajero): imágenes de satélite y rótulos © <a href="https://www.esri.com" target="_blank" rel="noreferrer">Esri</a> (Maxar, Earthstar Geographics, HERE, Garmin) · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">colaboradores de OpenStreetMap</a>. Los nombres en español los añade el propio juego.</li>
          <li><b>Fragmentos de canciones</b> (Afina ese oído, Luces, Cámara… ¡Música!): fragmentos de 30 segundos facilitados por la API pública de <a href="https://www.deezer.com" target="_blank" rel="noreferrer">Deezer</a>. No se descargan ni se guardan en esta web.</li>
          <li><b>Iconos de marcas</b> (Logo Mania): <a href="https://simpleicons.org" target="_blank" rel="noreferrer">Simple Icons</a> (CC0). Las marcas pertenecen a sus propietarios.</li>
          <li><b>Escudos</b> (Modo carrera, El club de los cuatro, 301 Goles): no se usan escudos reales; se dibujan con los colores y las siglas de cada club o selección.</li>
          <li><b>Datos de futbolistas</b>: nombres, clubes y trayectorias son datos públicos. Las «medias» y los precios de Director Deportivo, Manager por un Día y Futbolista Misterioso son valoraciones aproximadas propias, no oficiales ni de ningún videojuego.</li>
          <li><b>Tipografías</b>: <a href="https://fonts.google.com" target="_blank" rel="noreferrer">Google Fonts</a> (SIL Open Font License).</li>
        </ul>
      </section>

      <section className="est-tarjeta">
        <h2>📷 Fotos de El paparazzi</h2>
        <p>Fotos de <a href="https://commons.wikimedia.org" target="_blank" rel="noreferrer">Wikimedia Commons</a> con licencias libres. En el juego se muestran recortadas y, al resolver cada ronda, completas y con su crédito.</p>
        {!fotos ? <p className="pzp-nota">Cargando…</p> : (
          <ul className="crd-fotos">
            {fotos.map((f) => (
              <li key={f.nombre}>
                <b>{f.nombre}</b>
                <span>
                  Foto: {f.autor} · {f.licenciaUrl ? <a href={f.licenciaUrl} target="_blank" rel="noreferrer">{f.licencia}</a> : f.licencia}
                  {f.fuenteUrl && <> · <a href={f.fuenteUrl} target="_blank" rel="noreferrer">fuente</a></>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
