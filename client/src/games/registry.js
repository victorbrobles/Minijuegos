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
import SumaCero from './SumaCero/SumaCero.jsx';
import Golpe from './Golpe/Golpe.jsx';
import UnoADiez from './UnoADiez/UnoADiez.jsx';
import Fundadores from './Fundadores/Fundadores.jsx';
import Telepatia from './Telepatia/Telepatia.jsx';
import Descarte from './Descarte/Descarte.jsx';
import Bingoball from './Bingoball/Bingoball.jsx';
import Cuentas from './Cuentas/Cuentas.jsx';
import Conoce from './Conoce/Conoce.jsx';
import Logos from './Logos/Logos.jsx';
import Hipotesis from './Hipotesis/Hipotesis.jsx';
import Trescientosuno from './Trescientosuno/Trescientosuno.jsx';
import Jugadores from './Jugadores/Jugadores.jsx';
import Furbo from './Furbo/Furbo.jsx';
import FutbolGrid from './FutbolGrid/FutbolGrid.jsx';
import FootballSplit from './FootballSplit/FootballSplit.jsx';
import Jugadas from './Jugadas/Jugadas.jsx';
import CuatroClubes from './CuatroClubes/CuatroClubes.jsx';
import GeoQuiz from './GeoQuiz/GeoQuiz.jsx';

import VerdaderoFalso from './VerdaderoFalso/VerdaderoFalso.jsx';
import Pecera from './Pecera/Pecera.jsx';
import CriptoHacker from './CriptoHacker/CriptoHacker.jsx';
import Anomalias from './Anomalias/Anomalias.jsx';
import Trinchera from './Trinchera/Trinchera.jsx';
import Ovejas from './Ovejas/Ovejas.jsx';
import Segundero from './Segundero/Segundero.jsx';
import Encadenada from './Encadenada/Encadenada.jsx';
import MapaMentiroso from './MapaMentiroso/MapaMentiroso.jsx';
import Ordenalos from './Ordenalos/Ordenalos.jsx';
import Excusas from './Excusas/Excusas.jsx';
import Semaforo from './Semaforo/Semaforo.jsx';
import UnTrazo from './UnTrazo/UnTrazo.jsx';

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
  'unoadiez': UnoADiez,
  'fundadores': Fundadores,
  'telepatia': Telepatia,
  'descarte': Descarte,
  'bingoball': Bingoball,
  'cuentas': Cuentas,
  'sumacero': SumaCero,
  'golpe': Golpe,
  'conoce': Conoce,
  'logos': Logos,
  'hipotesis': Hipotesis,
  'trescientosuno': Trescientosuno,
  'jugadores': Jugadores,
  'furbo': Furbo,
  'futbolgrid': FutbolGrid,
  'footballsplit': FootballSplit,
  'jugadas': Jugadas,
  'cuatroclubes': CuatroClubes,
  'geoquiz': GeoQuiz,
  'verdaderofalso': VerdaderoFalso,
  'pecera': Pecera,
  'criptohacker': CriptoHacker,
  'anomalias': Anomalias,
  'trinchera': Trinchera,
  'ovejas': Ovejas,
  'segundero': Segundero,
  'encadenada': Encadenada,
  'mapamentiroso': MapaMentiroso,
  'ordenalos': Ordenalos,
  'excusas': Excusas,
  'semaforo': Semaforo,
  'untrazo': UnTrazo
};

export default registry;
