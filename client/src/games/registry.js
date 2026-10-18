import Siglas from './Siglas/Siglas.jsx';
import QuienEsQuien from './QuienEsQuien/QuienEsQuien.jsx';
import Rapidfire from './Rapidfire/Rapidfire.jsx';
import Trayectoria from './Trayectoria/Trayectoria';
import Rasgos from './Rasgos/Rasgos.jsx';
import Rankings from './Rankings/Rankings.jsx';
import Aproximacion from './Aproximacion/Aproximacion.jsx';
import Ubicacion from './Ubicacion/Ubicacion.jsx';
import Adivina from './Adivina/Adivina.jsx';
import Pistas from './Pistas/Pistas.jsx';
import Velocidad from './Velocidad/Velocidad.jsx';
import QuienMas from './QuienMas/QuienMas.jsx';
import ConfianzaCiega from './ConfianzaCiega/ConfianzaCiega';
import Lobos from './Lobos/Lobos.jsx';
import FrasesCelebres from './FrasesCelebres/FrasesCelebres.jsx';
import Conecta from './Conecta/Conecta.jsx';
import Impostor from './Impostor/Impostor.jsx';
import Colores from './Colores/Colores.jsx';
import Buscaminas from './Buscaminas/Buscaminas.jsx';
import Popular from './Popular/Popular.jsx';
import MasMenos from './MasMenos/MasMenos.jsx';
import Cancion from './Cancion/Cancion.jsx';
import Ciegas from './Ciegas/Ciegas.jsx';
import Traiciones from './Traiciones/Traiciones.jsx';
import Coleccion from './Coleccion/Coleccion.jsx';
import UnoADiez from './UnoADiez/UnoADiez.jsx';

// id del juego (el mismo que en server/data/games.json) -> componente React
const registry = {
  'siglas': Siglas,
  'quien-es-quien': QuienEsQuien,
  'rapidfire': Rapidfire,
  'trayectoria': Trayectoria,
  'rasgos': Rasgos,
  'rankings': Rankings,
  'aproximacion': Aproximacion,
  'ubicacion': Ubicacion,
  'adivina': Adivina,
  'pistas': Pistas,
  'velocidad': Velocidad,
  'quienmas': QuienMas,
  'confianzaciega': ConfianzaCiega,
  'lobos': Lobos,
  'frasescelebres': FrasesCelebres,
  'conecta': Conecta,
  'impostor': Impostor,
  'colores': Colores,
  'buscaminas': Buscaminas,
  'popular': Popular,
  'masmenos': MasMenos,
  'cancion': Cancion,
  'ciegas': Ciegas,
  'traiciones': Traiciones,
  'coleccion': Coleccion,
  'unoadiez': UnoADiez
};

export default registry;
