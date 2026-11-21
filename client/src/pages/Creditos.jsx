// client/src/pages/Creditos.jsx
// Créditos y avisos legales: de dónde salen las fotos, el audio, los mapas, los logotipos y los datos de los juegos.
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { LEGAL } from '../legal.js';
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
        <div><p>Los 100+ minijuegos</p><h1>Créditos y avisos legales</h1></div>
      </header>

      <section className="est-tarjeta">
        <h2>ℹ️ Sobre esta web</h2>
        <p>«Los 100+ minijuegos» es un proyecto personal para jugar con amigos y familia, sin ánimo de lucro y sin publicidad.</p>
        <p>No tiene relación, patrocinio ni afiliación con ningún club, liga, federación, futbolista, marca, artista o empresa de los que aparecen en los juegos.</p>
        <p>Los nombres, marcas, logotipos y escudos pertenecen a sus respectivos propietarios. Se usan únicamente para identificarlos en juegos de preguntas.</p>
        <p>Las mecánicas de algunos juegos se inspiran en juegos clásicos o populares, pero todos los nombres, textos, preguntas y gráficos de esta web son propios.</p>
        <p>Si eres titular de algún derecho y quieres que se retire o corrija algún contenido, escribe a <a href={`mailto:${LEGAL.contacto}`}>{LEGAL.contacto}</a> y lo atenderemos lo antes posible.</p>
        <p>Consulta también la <Link to="/privacidad">política de privacidad y el aviso legal</Link>.</p>
      </section>

      <section className="est-tarjeta">
        <h2>🧩 Recursos de terceros</h2>
        <ul className="crd-lista">
          <li><b>Mapas</b> (Test del viajero): imágenes de satélite y rótulos © <a href="https://www.esri.com" target="_blank" rel="noreferrer">Esri</a> (Maxar, Earthstar Geographics, HERE, Garmin) · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">colaboradores de OpenStreetMap</a>. Los nombres en español los añade el propio juego.</li>
          <li><b>Fragmentos de canciones</b> (Afina ese oído, Luces, Cámara… ¡Música!): fragmentos de 30 segundos facilitados por la API pública de <a href="https://www.deezer.com" target="_blank" rel="noreferrer">Deezer</a>. No se descargan ni se guardan en esta web. Según las condiciones de Deezer, su escucha está limitada a un <b>uso estrictamente privado y en el ámbito familiar</b>; la canción completa solo está disponible para usuarios de Deezer con su suscripción.</li>
          <li><b>Logomanía</b>: no muestra logotipos reales. Las marcas solo se nombran en las preguntas y los dibujos los hacen los propios jugadores. Las marcas pertenecen a sus propietarios.</li>
          <li><b>Escudos</b> (Modo carrera, El club de los cuatro, 301 Goles): no se usan escudos reales; se dibujan con los colores y las siglas de cada club o selección.</li>
          <li><b>Datos de futbolistas</b>: nombres, clubes y trayectorias son datos públicos. Las «medias» y los precios de Director Deportivo, Manager por un Día y Futbolista Misterioso son valoraciones aproximadas propias, no oficiales ni de ningún videojuego.</li>
          <li><b>Tipografías</b>: Bricolage Grotesque y Figtree (SIL Open Font License), servidas desde esta misma web.</li>
          <li><b>Juegos de habilidad</b> (Fútbol chapas, Artillería, Curling, Estelas, Carrera de Canicas, Minigolf, Torre Inestable…): física, circuitos y gráficos hechos para esta web.</li>
        </ul>
      </section>

      <section className="est-tarjeta">
        <h2>🛠️ Hecha con software libre</h2>
        <p>Gracias a los proyectos de código abierto con los que está construida esta web (licencias MIT, Apache 2.0, BSD y similares):</p>
        <ul className="crd-lista">
          <li><b>Interfaz</b>: <a href="https://react.dev" target="_blank" rel="noreferrer">React</a>, React Router y <a href="https://vitejs.dev" target="_blank" rel="noreferrer">Vite</a>.</li>
          <li><b>3D y física</b>: <a href="https://threejs.org" target="_blank" rel="noreferrer">three.js</a> y <a href="https://github.com/pmndrs/cannon-es" target="_blank" rel="noreferrer">cannon-es</a>.</li>
          <li><b>Mapas</b>: <a href="https://leafletjs.com" target="_blank" rel="noreferrer">Leaflet</a>.</li>
          <li><b>Partidas online</b>: <a href="https://socket.io" target="_blank" rel="noreferrer">Socket.IO</a> y <a href="https://expressjs.com" target="_blank" rel="noreferrer">Express</a>.</li>
          <li><b>Datos</b>: <a href="https://github.com/tursodatabase/libsql" target="_blank" rel="noreferrer">libSQL</a> (SQLite) y <a href="https://turso.tech" target="_blank" rel="noreferrer">Turso</a>.</li>
          <li><b>Imágenes y códigos QR</b>: <a href="https://sharp.pixelplumbing.com" target="_blank" rel="noreferrer">sharp</a> y <a href="https://github.com/soldair/node-qrcode" target="_blank" rel="noreferrer">node-qrcode</a>.</li>
        </ul>
      </section>

      <section className="est-tarjeta">
        <h2>📷 Fotos de El paparazzi</h2>
        <p>Fotos de <a href="https://commons.wikimedia.org" target="_blank" rel="noreferrer">Wikimedia Commons</a> con licencias libres. En el juego se muestran recortadas y, al resolver cada ronda, completas y con su crédito.</p>
        <p>Las fotos de <b>Test del viajero</b> también son de Wikimedia Commons (imagen principal del artículo de Wikipedia de cada lugar): su autor y su licencia se muestran en el juego al revelar cada lugar.</p>
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
