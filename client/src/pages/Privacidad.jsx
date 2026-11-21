// client/src/pages/Privacidad.jsx
// /privacidad — política de privacidad, cookies y aviso legal, en lenguaje sencillo. Los datos de contacto están en src/legal.js.
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
        <div><p>{LEGAL.web}</p><h1>Privacidad, cookies y aviso legal</h1></div>
      </header>

      <section className="est-tarjeta">
        <h2>👋 En pocas palabras</h2>
        <ul className="crd-lista">
          <li>Puedes jugar <b>sin cuenta</b>, solo con un nick (puede ser un apodo), o crear una cuenta con tu <b>correo y una contraseña</b> para tener tus datos en cualquier móvil.</li>
          <li><b>No hay publicidad</b>, no vendemos ni cedemos datos y no usamos cookies de seguimiento ni de analítica: solo la cookie técnica de la sesión si entras con tu cuenta.</li>
          <li>Guardamos lo justo para que funcionen los juegos: récords, grupos, retos… y puedes pedir que se borre cuando quieras.</li>
        </ul>
      </section>

      <section className="est-tarjeta">
        <h2>🗂️ Qué datos se guardan y para qué</h2>
        <ul className="crd-lista">
          <li><b>Tu nombre de jugador</b> (por ejemplo, «Ana#1234»), tu avatar y tu color: para que aparezcas en los récords, los podios y los grupos.</li>
          <li><b>Si creas una cuenta</b>: tu <b>correo</b> (solo para entrar; no te enviaremos nada), tu <b>contraseña cifrada</b> (nunca se guarda tal cual: ni nosotros podemos verla) y una copia de lo que guardas en el navegador (favoritos, récords, logros, ajustes) para tenerlo en cualquier móvil.</li>
          <li><b>Resultados de las partidas</b>, el reto diario, los retos a amigos y tus logros: para los récords, el salón de la fama y las estadísticas.</li>
          <li><b>Grupos de amigos</b>: quién forma parte, la liga del grupo y las preguntas que escribáis. Las preguntas solo las ven los miembros del grupo.</li>
          <li><b>Valoraciones</b> 👍/👎 de los juegos.</li>
          <li><b>«Pasar a otro móvil»</b>: si creas un código, se guarda una copia de lo que tienes en este navegador (nombre, favoritos, récords, ajustes) para poder recuperarlo en otro móvil.</li>
          <li><b>Estadísticas de uso anónimas</b>: cuántas visitas hay al día y qué juegos se abren o se terminan. Para no contar dos veces a la misma persona en un día se usa una huella cifrada de la conexión que <b>cambia cada día</b>: no se guarda tu IP, no permite saber quién eres y no se puede seguir a nadie de un día para otro.</li>
          <li><b>Seguridad</b>: para frenar abusos, el servidor mira cuántas peticiones llegan de cada conexión en el último minuto. Se olvida enseguida y no se guarda.</li>
        </ul>
        <p><b>Seguridad de tu cuenta</b>: la sesión se cierra sola tras <b>15 minutos sin usar la app</b>, y al cambiar la contraseña se cierran las sesiones abiertas en otros móviles. Tras varios intentos fallidos de contraseña, se frena el acceso durante unos minutos.</p>
        <p>Si olvidas la contraseña, escribe al contacto: como la web no envía correos, el administrador te dará una contraseña provisional para que la cambies.</p>
        <p>Los tratamos porque son necesarios para darte el servicio que usas (los juegos, los récords, los grupos) y, en el caso de las estadísticas y la seguridad, por el interés legítimo de que la web funcione bien y no se abuse de ella.</p>
      </section>

      <section className="est-tarjeta">
        <h2>🍪 Cookies y lo que se guarda en tu móvil</h2>
        <p>Esta web usa <b>una única cookie</b>, y solo si inicias sesión con tu cuenta. Es una cookie <b>técnica e imprescindible</b> para que funcione la cuenta, por eso no hace falta pedirte permiso para usarla (art. 22.2 de la LSSI). <b>Sin cuenta no se usa ninguna cookie.</b></p>
        <div className="crd-tabla" role="table" aria-label="Cookies que usa la web">
          <div role="row" className="crd-fila crd-cab"><span role="columnheader">Nombre</span><span role="columnheader">Para qué sirve</span><span role="columnheader">Cuánto dura</span></div>
          <div role="row" className="crd-fila">
            <span role="cell"><code>mj_sesion</code></span>
            <span role="cell">Recordar que has iniciado sesión con tu cuenta (y, solo para el administrador, el modo administrador). Va firmada por el servidor (no se puede falsificar), ningún script de la página puede leerla y no sirve para seguirte ni para publicidad.</span>
            <span role="cell">Se borra al cerrar sesión o tras 15 minutos sin usar la app (como máximo, 6 meses).</span>
          </div>
        </div>
        <p>No hay cookies de terceros: los servicios externos de algunos juegos (ver más abajo) no ponen cookies desde esta web.</p>
        <p>Además, la web guarda en el almacenamiento de tu navegador lo necesario para funcionar: tu nombre de jugador, favoritos, últimos juegos, récords, logros y ajustes (letra, sonido, ronda de castigo…). No sale de tu móvil salvo que tengas cuenta (se copia en ella) o crees un código de «pasar a otro móvil». Puedes borrarlo cuando quieras desde los ajustes de tu navegador.</p>
      </section>

      <section className="est-tarjeta">
        <h2>🌍 Servicios externos</h2>
        <ul className="crd-lista">
          <li><b>Alojamiento</b>: la web funciona en <b>Render</b> y los datos se guardan en el propio servidor con una copia permanente en <b>Turso</b> (base de datos). Pueden tener servidores fuera de la Unión Europea, con las garantías que exige la normativa europea (cláusulas contractuales tipo).</li>
          <li><b>Copias de seguridad</b>: para no perder nada si algo falla, el servidor guarda copias automáticas cada pocas horas y solo conserva las de los últimos dos días. Lo que borres desaparece también de esas copias en ese plazo.</li>
          <li>Algunos juegos cargan contenido de otros servicios, que reciben la dirección de tu conexión como cualquier web que visitas: fotos de <b>Wikimedia</b>, mapas de <b>Esri</b>, datos de <b>Wikipedia</b> (Test del viajero) y fragmentos de canciones de <b>Deezer</b>. Algunos de estos juegos no están visibles ahora mismo para todo el mundo. Ver los <Link to="/creditos">créditos</Link>.</li>
          <li><b>Música</b>: los fragmentos de 30 segundos de Deezer (en «Afina ese oído» y «Luces, Cámara… ¡Música!») son solo para <b>uso privado y familiar</b>, como exigen sus condiciones.</li>
        </ul>
      </section>

      <section className="est-tarjeta">
        <h2>⏳ Cuánto tiempo y tus derechos</h2>
        <p>Los datos se guardan mientras la web exista o hasta que pidas que se borren (más el plazo de dos días de las copias de seguridad). Las cuentas no se borran solas por no usarlas. Si tienes cuenta, puedes <b>borrarla tú mismo</b> en ⚙️ Ajustes → Tu cuenta: se borran la cuenta y todo lo guardado con tu nick (récords, grupos, retos, valoraciones). También puedes pedir <b>ver, corregir o borrar</b> tus datos (por ejemplo, todo lo de tu nombre de jugador), u oponerte a su uso, escribiendo a <Correo />. Si crees que no se han atendido bien tus derechos, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).</p>
        <p><b>Menores</b>: si tienes menos de 14 años, usa la web con permiso de tus padres o tutores y elige un apodo, no tu nombre completo.</p>
      </section>

      <section className="est-tarjeta">
        <h2>⚖️ Aviso legal</h2>
        <ul className="crd-lista">
          <li><b>Responsable</b>: {LEGAL.responsable}. Contacto: <Correo />.</li>
          <li><b>Qué es</b>: «{LEGAL.web}» es una web gratuita de juegos para jugar con amigos, sin ánimo de lucro y sin publicidad. Está en desarrollo, así que puede cambiar o tener fallos.</li>
          <li><b>Propiedad intelectual</b>: el diseño, los textos, las preguntas, las ilustraciones y el código de la web son propios. No se pueden copiar ni reutilizar con fines comerciales sin permiso.</li>
          <li><b>Contenido de terceros</b>: los nombres, marcas, logotipos y escudos pertenecen a sus propietarios y solo se usan para identificarlos en juegos de preguntas (ver <Link to="/creditos">créditos</Link>). Si eres titular de algún derecho y quieres que se retire algo, escribe a <Correo /> y se retirará lo antes posible.</li>
          <li><b>Lo que escriben los jugadores</b> (nombres, preguntas de grupo) es responsabilidad de quien lo escribe. Si ves algo ofensivo o ilegal, avísanos en <Correo /> y se borrará.</li>
          <li><b>Normas</b>: no se permite usar nombres o preguntas ofensivos, suplantar a otra persona, ni intentar saltarse la seguridad de la web o sobrecargarla. Se pueden borrar los nombres, preguntas o cuentas que incumplan estas normas.</li>
          <li><b>Disponibilidad</b>: se hace lo posible para que la web funcione siempre y no se pierdan datos (copias de seguridad automáticas), pero al ser un proyecto gratuito no se garantiza que esté disponible en todo momento.</li>
          <li><b>Uso</b>: la web se ofrece tal cual, para entretenimiento. No te hagas responsable del «castigo» que te toque en la ronda de castigo 😉: juega con cabeza y, si hay alcohol, con moderación y solo si eres mayor de edad.</li>
          <li>Se rige por la legislación española.</li>
        </ul>
        <p className="pzp-nota">Última actualización: {LEGAL.actualizado}.</p>
      </section>
    </div>
  );
}
