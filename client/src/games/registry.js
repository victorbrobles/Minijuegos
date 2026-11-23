import { lazy } from 'react';
// Todos los juegos se descargan al abrirlos; su CSS sigue siendo global (ver estilosJuegos.js)
import './estilosJuegos.js';

// Cada juego guarda su cargador para poder precargarlo (al tocar su ficha) antes de abrirlo.
const diferido = (cargar) => Object.assign(lazy(cargar), { precargar: cargar });
const Siglas = diferido(() => import('./Siglas/Siglas.jsx'));
const QuienEsQuien = diferido(() => import('./QuienEsQuien/QuienEsQuien.jsx'));
const Rapidfire = diferido(() => import('./Rapidfire/Rapidfire.jsx'));
const Trayectoria = diferido(() => import('./Trayectoria/Trayectoria'));
const Rasgos = diferido(() => import('./Rasgos/Rasgos.jsx'));
const Rankings = diferido(() => import('./Rankings/Rankings.jsx'));
const Aproximacion = diferido(() => import('./Aproximacion/Aproximacion.jsx'));
const Ubicacion = diferido(() => import('./Ubicacion/Ubicacion.jsx'));
const Adivina = diferido(() => import('./Adivina/Adivina.jsx'));
const Pistas = diferido(() => import('./Pistas/Pistas.jsx'));
const Velocidad = diferido(() => import('./Velocidad/Velocidad.jsx'));
const QuienMas = diferido(() => import('./QuienMas/QuienMas.jsx'));
const ConfianzaCiega = diferido(() => import('./ConfianzaCiega/ConfianzaCiega'));
const Lobos = diferido(() => import('./Lobos/Lobos.jsx'));
const FrasesCelebres = diferido(() => import('./FrasesCelebres/FrasesCelebres.jsx'));
const Conecta = diferido(() => import('./Conecta/Conecta.jsx'));
const Impostor = diferido(() => import('./Impostor/Impostor.jsx'));
const Colores = diferido(() => import('./Colores/Colores.jsx'));
const Buscaminas = diferido(() => import('./Buscaminas/Buscaminas.jsx'));
const Popular = diferido(() => import('./Popular/Popular.jsx'));
const MasMenos = diferido(() => import('./MasMenos/MasMenos.jsx'));
const Cancion = diferido(() => import('./Cancion/Cancion.jsx'));
const Ciegas = diferido(() => import('./Ciegas/Ciegas.jsx'));
const Traiciones = diferido(() => import('./Traiciones/Traiciones.jsx'));
const Coleccion = diferido(() => import('./Coleccion/Coleccion.jsx'));
const SumaCero = diferido(() => import('./SumaCero/SumaCero.jsx'));
const Golpe = diferido(() => import('./Golpe/Golpe.jsx'));
const UnoADiez = diferido(() => import('./UnoADiez/UnoADiez.jsx'));
const Fundadores = diferido(() => import('./Fundadores/Fundadores.jsx'));
const Telepatia = diferido(() => import('./Telepatia/Telepatia.jsx'));
const Descarte = diferido(() => import('./Descarte/Descarte.jsx'));
const Bingoball = diferido(() => import('./Bingoball/Bingoball.jsx'));
const Cuentas = diferido(() => import('./Cuentas/Cuentas.jsx'));
const Mus = diferido(() => import('./Mus/Mus.jsx'));
const Reinos = diferido(() => import('./Reinos/Reinos.jsx'));
const Invento = diferido(() => import('./Invento/Invento.jsx'));
const Director = diferido(() => import('./Director/Director.jsx'));
const Laberinto = diferido(() => import('./Laberinto/Laberinto.jsx'));
const Hemeroteca = diferido(() => import('./Hemeroteca/Hemeroteca.jsx'));
const Acta = diferido(() => import('./Acta/Acta.jsx'));
const OnceFantasma = diferido(() => import('./OnceFantasma/OnceFantasma.jsx'));
const UnaPieza = diferido(() => import('./UnaPieza/UnaPieza.jsx'));
const DatoSobra = diferido(() => import('./DatoSobra/DatoSobra.jsx'));
const Pareja = diferido(() => import('./Pareja/Pareja.jsx'));
const Tablero = diferido(() => import('./Tablero/Tablero.jsx'));
const MusAvanzado = diferido(() => import('./MusAvanzado/MusAvanzado.jsx'));
const Conoce = diferido(() => import('./Conoce/Conoce.jsx'));
const Logos = diferido(() => import('./Logos/Logos.jsx'));
const Hipotesis = diferido(() => import('./Hipotesis/Hipotesis.jsx'));
const Trescientosuno = diferido(() => import('./Trescientosuno/Trescientosuno.jsx'));
const Jugadores = diferido(() => import('./Jugadores/Jugadores.jsx'));
const Furbo = diferido(() => import('./Furbo/Furbo.jsx'));
const FutbolGrid = diferido(() => import('./FutbolGrid/FutbolGrid.jsx'));
const Jugadas = diferido(() => import('./Jugadas/Jugadas.jsx'));
const CuatroClubes = diferido(() => import('./CuatroClubes/CuatroClubes.jsx'));
const GeoQuiz = diferido(() => import('./GeoQuiz/GeoQuiz.jsx'));

const VerdaderoFalso = diferido(() => import('./VerdaderoFalso/VerdaderoFalso.jsx'));
const Pecera = diferido(() => import('./Pecera/Pecera.jsx'));
const CriptoHacker = diferido(() => import('./CriptoHacker/CriptoHacker.jsx'));
const Anomalias = diferido(() => import('./Anomalias/Anomalias.jsx'));
const Trinchera = diferido(() => import('./Trinchera/Trinchera.jsx'));
const Ovejas = diferido(() => import('./Ovejas/Ovejas.jsx'));
const Segundero = diferido(() => import('./Segundero/Segundero.jsx'));
const Encadenada = diferido(() => import('./Encadenada/Encadenada.jsx'));
const MapaMentiroso = diferido(() => import('./MapaMentiroso/MapaMentiroso.jsx'));
const Ordenalos = diferido(() => import('./Ordenalos/Ordenalos.jsx'));
const Excusas = diferido(() => import('./Excusas/Excusas.jsx'));
const Semaforo = diferido(() => import('./Semaforo/Semaforo.jsx'));
const UnTrazo = diferido(() => import('./UnTrazo/UnTrazo.jsx'));
const Escondite = diferido(() => import('./Escondite/Escondite.jsx'));
const PonOrden = diferido(() => import('./PonOrden/PonOrden.jsx'));
const Intruso = diferido(() => import('./Intruso/Intruso.jsx'));
const Lapiz = diferido(() => import('./Lapiz/Lapiz.jsx'));
const Fichajes = diferido(() => import('./Fichajes/Fichajes.jsx'));
const Eco = diferido(() => import('./Eco/Eco.jsx'));
const CuatroCuatros = diferido(() => import('./CuatroCuatros/CuatroCuatros.jsx'));
const Garabato = diferido(() => import('./Garabato/Garabato.jsx'));
// Los juegos en 3D se cargan aparte (three.js pesa mucho)
const Torre = diferido(() => import('./Torre/Torre.jsx'));
const Minigolf = diferido(() => import('./Minigolf/Minigolf.jsx'));
const Canicas = diferido(() => import('./Canicas/Canicas.jsx'));
const Chapas = diferido(() => import('./Chapas/Chapas.jsx'));
const Artilleria = diferido(() => import('./Artilleria/Artilleria.jsx'));
const Curling = diferido(() => import('./Curling/Curling.jsx'));
const Estelas = diferido(() => import('./Estelas/Estelas.jsx'));
const Draft = diferido(() => import('./Draft/Draft.jsx'));
const Emojis = diferido(() => import('./Emojis/Emojis.jsx'));
const Conocerse = diferido(() => import('./Conocerse/Conocerse.jsx'));
const Habilidad = diferido(() => import('./Habilidad/Habilidad.jsx'));
const ViaLibre = diferido(() => import('./ViaLibre/ViaLibre.jsx'));
const Rascacielos = diferido(() => import('./Rascacielos/Rascacielos.jsx'));
const Letras = diferido(() => import('./Palabras/Letras.jsx'));
const Palabra = diferido(() => import('./Palabras/Palabra.jsx'));
const Patata = diferido(() => import('./Patata/Patata.jsx'));
const Subasta = diferido(() => import('./Subasta/Subasta.jsx'));
const Dragon = diferido(() => import('./Dragon/Dragon.jsx'));
const Piramides = diferido(() => import('./Piramides/Piramides.jsx'));
const Transmision = diferido(() => import('./Transmision/Transmision.jsx'));
const Escalera = diferido(() => import('./Solo/Escalera.jsx'));
const Cronologia = diferido(() => import('./Solo/Cronologia.jsx'));
const Cadena = diferido(() => import('./Solo/Cadena.jsx'));
const QuienSoy = diferido(() => import('./Solo/QuienSoy.jsx'));
const OncePerdido = diferido(() => import('./Solo/OncePerdido.jsx'));
const Conexion = diferido(() => import('./Solo/Conexion.jsx'));
const DueloFutbol = diferido(() => import('./Solo/DueloFutbol.jsx'));
const Manager = diferido(() => import('./Solo/Manager.jsx'));
const Misterioso = diferido(() => import('./Solo/Misterioso.jsx'));
const Crimen = diferido(() => import('./Crimen/Crimen.jsx'));

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
  'mus': Mus,
  'reinos': Reinos,
  'invento': Invento,
  'director': Director,
  'laberinto': Laberinto,
  'hemeroteca': Hemeroteca,
  'acta': Acta,
  'oncefantasma': OnceFantasma,
  'unapieza': UnaPieza,
  'datosobra': DatoSobra,
  'pareja': Pareja,
  'tablero': Tablero,
  'musavanzado': MusAvanzado,
  'sumacero': SumaCero,
  'golpe': Golpe,
  'conoce': Conoce,
  'logos': Logos,
  'hipotesis': Hipotesis,
  'trescientosuno': Trescientosuno,
  'jugadores': Jugadores,
  'furbo': Furbo,
  'futbolgrid': FutbolGrid,
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
  'untrazo': UnTrazo,
  'escondite': Escondite,
  'ponorden': PonOrden,
  'intruso': Intruso,
  'lapiz': Lapiz,
  'fichajes': Fichajes,
  'eco': Eco,
  'crimen': Crimen,
  'escalera': Escalera,
  'cronologia': Cronologia,
  'cadena': Cadena,
  'quiensoy': QuienSoy,
  'onceperdido': OncePerdido,
  'conexion': Conexion,
  'duelofutbol': DueloFutbol,
  'manager': Manager,
  'misterioso': Misterioso,
  'patata': Patata,
  'subasta': Subasta,
  'dragon': Dragon,
  'piramides': Piramides,
  'transmision': Transmision,
  'cuatrocuatros': CuatroCuatros,
  'garabato': Garabato,
  'torre': Torre,
  'minigolf': Minigolf,
  'canicas': Canicas,
  'chapas': Chapas,
  'artilleria': Artilleria,
  'curling': Curling,
  'estelas': Estelas,
  'draft': Draft,
  'emojis': Emojis,
  'conocerse': Conocerse,
  'habilidad': Habilidad,
  'vialibre': ViaLibre,
  'rascacielos': Rascacielos,
  'letras': Letras,
  'palabra': Palabra
};

export default registry;

/** Empieza a descargar el código de un juego (no hace nada si ya está o no existe). */
export function precargarJuego(id) {
  try { registry[id]?.precargar?.(); } catch { /* sin red: ya se cargará al abrirlo */ }
}
