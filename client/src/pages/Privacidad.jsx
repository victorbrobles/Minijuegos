// client/src/pages/Privacidad.jsx
// /privacidad — política de privacidad y aviso legal, en lenguaje sencillo. Los datos de contacto están en src/legal.js.
import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { LEGAL } from '../legal.js';
import './Estadisticas.css';
import './Creditos.css';

const Correo = () => <a href={`mailto:${LEGAL.contacto}`}>{LEGAL.contacto}</a>;

export default function Privacidad() {
  return (
    <div className="game-shell est-pagina crd-pagina">
      <Link to="/" className="back" aria-label="Volver a la portada"><Icon name="arrowLeft" size={20} strokeWidth={2.5} /><span>Portada</span></Link>
      <header className="est-cab">
        <span className="est-cab-ico">🔒</span>
        <div><p>{LEGAL.web}</p><h1>Privacidad y aviso legal</h1></div>
      </header>

      <section className="est-tarjeta">
        <h2>👋 En pocas palabras</h2>
        <ul className="crd-lista">
          <li>No hace falta registrarse ni dar tu correo: solo eliges un <b>nombre de jugador</b> (puede ser un apodo).</li>
          <li><b>No hay publicidad</b>, no vendemos ni cedemos datos y no usamos cookies de seguimiento.</li>
          <li>Guardamos lo justo para que funcionen los juegos: récords, grupos, retos… y puedes pedir que se borre cuando quieras.</li>
        </ul>
      </section>

      <section className="est-tarjeta">
        <h2>🗂️ Qué datos se guardan y para qué</h2>
        <ul className="crd-lista">
          <li><b>Tu nombre de jugador</b> (por ejemplo, «Ana#1234»), tu avatar y tu color: para que aparezcas en los récords, los podios y los grupos.</li>
          <li><b>Resultados de las partidas</b>, el reto diario, los retos a amigos y tus logros: para los récords, el salón de la fama y las estadísticas.</li>
          <li><b>Grupos de amigos</b>: quién forma parte, la liga del grupo y las preguntas que escribáis. Las preguntas solo las ven los miembros del grupo.</li>
          <li><b>Valoraciones</b> 👍/👎 de los juegos.</li>
          <li><b>«Pasar a otro móvil»</b>: si creas un código, se guarda una copia de lo que tienes en este navegador (nombre, favoritos, récords, ajustes) para poder recuperarlo en otro móvil.</li>
          <li><b>Estadísticas de uso anónimas</b>: cuántas visitas hay al día y qué juegos se abren o se terminan. Para no contar dos veces a la misma persona en un día se usa una huella cifrada de la conexión que <b>cambia cada día</b>: no se guarda tu IP, no permite saber quién eres y no se puede seguir a nadie de un día para otro.</li>
          <li><b>Seguridad</b>: para frenar abusos, el servidor mira cuántas peticiones llegan de cada conexión en el último minuto. Se olvida enseguida y no se guarda.</li>
        </ul>
        <p>Los tratamos porque son necesarios para darte el servicio que usas (los juegos, los récords, los grupos) y, en el caso de las estadísticas y la seguridad, por el interés legítimo de que la web funcione bien y no se abuse de ella.</p>
      </section>

      <section className="est-tarjeta">
        <h2>📱 Lo que se guarda en tu móvil</h2>
        <p>Esta web <b>no usa cookies</b>. Guarda en el almacenamiento de tu navegador lo necesario para funcionar: tu nombre de jugador, favoritos, últimos juegos, récords, logros y ajustes (letra, sonido, ronda de castigo…). No sirve para seguirte ni sale de tu móvil salvo que crees un código de «pasar a otro móvil». Puedes borrarlo cuando quieras desde los ajustes de tu navegador.</p>
      </section>

      <section className="est-tarjeta">
        <h2>🌍 Servicios externos</h2>
        <ul className="crd-lista">
          <li><b>Alojamiento</b>: la web funciona en <b>Render</b> y los datos se guardan en <b>Turso</b>. Pueden tener servidores fuera de la Unión Europea, con las garantías que exige la normativa europea.</li>
          <li>Algunos juegos cargan contenido de otros servicios, que reciben la dirección de tu conexión como cualquier web que visitas: fotos de <b>Wikimedia</b>, mapas de <b>Esri</b>, datos de <b>Wikipedia</b> (Test del viajero) y fragmentos de canciones de <b>Deezer</b>. Ver los <Link to="/creditos">créditos</Link>.</li>
          <li><b>Música</b>: los fragmentos de 30 segundos de Deezer (en «Afina ese oído» y «Luces, Cámara… ¡Música!») son solo para <b>uso privado y familiar</b>, como exigen sus condiciones.</li>
        </ul>
      </section>

      <section className="est-tarjeta">
        <h2>⏳ Cuánto tiempo y tus derechos</h2>
        <p>Los datos se guardan mientras la web exista o hasta que pidas que se borren. Puedes pedir <b>ver, corregir o borrar</b> tus datos (por ejemplo, todo lo de tu nombre de jugador), u oponerte a su uso, escribiendo a <Correo />. Si crees que no se han atendido bien tus derechos, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).</p>
        <p><b>Menores</b>: si tienes menos de 14 años, usa la web con permiso de tus padres o tutores y elige un apodo, no tu nombre completo.</p>
      </section>

      <section className="est-tarjeta">
        <h2>⚖️ Aviso legal</h2>
        <ul className="crd-lista">
          <li><b>Responsable</b>: {LEGAL.responsable}. Contacto: <Correo />.</li>
          <li><b>Qué es</b>: «{LEGAL.web}» es una web gratuita de juegos para jugar con amigos, sin ánimo de lucro y sin publicidad. Está en desarrollo, así que puede cambiar o tener fallos.</li>
          <li><b>Contenido de terceros</b>: los nombres, marcas, logotipos y escudos pertenecen a sus propietarios y solo se usan para identificarlos en juegos de preguntas (ver <Link to="/creditos">créditos</Link>). Si eres titular de algún derecho y quieres que se retire algo, escribe a <Correo /> y se retirará lo antes posible.</li>
          <li><b>Lo que escriben los jugadores</b> (nombres, preguntas de grupo) es responsabilidad de quien lo escribe. Si ves algo ofensivo o ilegal, avísanos en <Correo /> y se borrará.</li>
          <li><b>Uso</b>: la web se ofrece tal cual, para entretenimiento. No te hagas responsable del «castigo» que te toque en la ronda de castigo 😉: juega con cabeza y, si hay alcohol, con moderación y solo si eres mayor de edad.</li>
          <li>Se rige por la legislación española.</li>
        </ul>
        <p className="pzp-nota">Última actualización: {LEGAL.actualizado}.</p>
      </section>
    </div>
  );
}
