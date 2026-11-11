// GeoQuiz · Monumentos y lugares (ampliación)
import { R, O, E, P } from '../_tipos.js';

const mp = (m, pais) => R('Monumento y país', `¿En qué país está ${m}?`, pais);
const parque = (p, pais) => R('Parques nacionales', `¿En qué país está el parque nacional de ${p}?`, pais);
const isla = (i, pais) => R('Islas turísticas', `¿A qué país pertenece la isla de ${i}?`, pais);

export default [
  mp('la Gran Muralla', 'China'), mp('el Taj Mahal', 'India'), mp('el Cristo Redentor', 'Brasil'), mp('el Coliseo', 'Italia'),
  mp('Stonehenge', 'Reino Unido|Inglaterra'), mp('la Acrópolis', 'Grecia'), mp('la Alhambra', 'España'), mp('el castillo de Neuschwanstein', 'Alemania'),
  mp('la Ópera de Sídney', 'Australia'), mp('el Monte Rushmore', 'Estados Unidos|EEUU'), mp('Teotihuacán', 'México'), mp('Tikal', 'Guatemala'),
  mp('la isla de Pascua con sus moáis', 'Chile'), mp('las pirámides de Guiza', 'Egipto'), mp('Abu Simbel', 'Egipto'), mp('la Mezquita Azul', 'Turquía'),
  mp('el templo de Borobudur', 'Indonesia'), mp('la Pagoda Shwedagon', 'Myanmar|Birmania'), mp('el Templo Dorado de Amritsar', 'India'), mp('el Kremlin', 'Rusia'),
  mp('la catedral de San Basilio', 'Rusia'), mp('Mont-Saint-Michel', 'Francia'), mp('el palacio de Versalles', 'Francia'), mp('la Torre Eiffel', 'Francia'),
  mp('el Big Ben', 'Reino Unido'), mp('la Sagrada Familia', 'España'), mp('el acueducto de Segovia', 'España'), mp('la Torre de Pisa', 'Italia'),
  mp('Pompeya', 'Italia'), mp('Dubrovnik', 'Croacia'), mp('las Meteoras', 'Grecia'), mp('Capadocia', 'Turquía'),
  mp('el Partenón', 'Grecia'), mp('el Atomium', 'Bélgica'), mp('los molinos de Kinderdijk', 'Países Bajos|Holanda'), mp('la Sirenita', 'Dinamarca'),
  mp('el santuario de Fushimi Inari', 'Japón'), mp('el Gran Buda de Kamakura', 'Japón'), mp('Ha Long', 'Vietnam'), mp('la Gran Barrera de Coral', 'Australia'),
  mp('Uluru (Ayers Rock)', 'Australia'), mp('el Salar de Uyuni', 'Bolivia'), mp('el Glaciar Perito Moreno', 'Argentina'), mp('las líneas de Nazca', 'Perú'),
  mp('el Museo del Prado', 'España'), mp('el Museo del Hermitage', 'Rusia'), mp('el Rijksmuseum', 'Países Bajos|Holanda'), mp('la Casa Blanca', 'Estados Unidos|EEUU'),
  parque('Yellowstone', 'Estados Unidos|EEUU'), parque('Banff', 'Canadá'), parque('Torres del Paine', 'Chile'), parque('Serengueti', 'Tanzania'),
  parque('Kruger', 'Sudáfrica'), parque('Doñana', 'España'), parque('Ordesa y Monte Perdido', 'España'), parque('Plitvice', 'Croacia'),
  parque('Yosemite', 'Estados Unidos|EEUU'), parque('Masái Mara (reserva)', 'Kenia'), parque('Teide', 'España'), parque('Galápagos', 'Ecuador'),
  isla('Bali', 'Indonesia'), isla('Phuket', 'Tailandia'), isla('Santorini', 'Grecia'), isla('Capri', 'Italia'), isla('Mykonos', 'Grecia'),
  isla('Ibiza', 'España'), isla('Madeira', 'Portugal'), isla('Bora Bora', 'Francia'), isla('Zanzíbar', 'Tanzania'), isla('Cozumel', 'México'),
  isla('Malta (isla principal)', 'Malta'), isla('Mallorca', 'España'), isla('Lanzarote', 'España'), isla('Sicilia', 'Italia'),
  E('Maravillas del mundo', 'Las siete nuevas maravillas del mundo (2007)', ['Gran Muralla China|Gran Muralla', 'Petra', 'Cristo Redentor', 'Machu Picchu', 'Chichén Itzá', 'Coliseo', 'Taj Mahal']),
  E('Maravillas del mundo', 'Las siete maravillas del mundo antiguo', ['Pirámide de Guiza|Gran Pirámide', 'Jardines colgantes de Babilonia', 'Templo de Artemisa', 'Estatua de Zeus', 'Mausoleo de Halicarnaso', 'Coloso de Rodas', 'Faro de Alejandría']),
  O('Maravillas del mundo', '¿Cuál es la única maravilla del mundo antiguo que sigue en pie?', 'La Gran Pirámide de Guiza', ['El Faro de Alejandría', 'El Coloso de Rodas', 'El Templo de Artemisa']),
  O('Patrimonio de la Humanidad', '¿Qué país tiene más lugares Patrimonio de la Humanidad?', 'Italia', ['China', 'España', 'Francia'], 'Italia y China se disputan el primer puesto.'),
  O('Patrimonio de la Humanidad', '¿Cuál de estas ciudades españolas tiene su casco histórico declarado Patrimonio de la Humanidad?', 'Segovia', ['Valencia', 'Murcia', 'Bilbao']),
  O('Aeropuertos famosos', '¿En qué ciudad está el aeropuerto JFK?', 'Nueva York', ['Washington', 'Chicago', 'Boston']),
  O('Aeropuertos famosos', '¿En qué ciudad está el aeropuerto de Heathrow?', 'Londres', ['Mánchester', 'Dublín', 'Edimburgo']),
  O('Aeropuertos famosos', '¿En qué ciudad está el aeropuerto Charles de Gaulle?', 'París', ['Lyon', 'Bruselas', 'Marsella']),
  O('Aeropuertos famosos', '¿En qué ciudad está el aeropuerto de Barajas?', 'Madrid', ['Barcelona', 'Sevilla', 'Valencia']),
  O('Aeropuertos famosos', '¿En qué ciudad está el aeropuerto de El Prat?', 'Barcelona', ['Madrid', 'Palma', 'Girona']),
  O('Aeropuertos famosos', '¿En qué ciudad está el aeropuerto de Schiphol?', 'Ámsterdam', ['Bruselas', 'Copenhague', 'Hamburgo']),
  O('Aeropuertos famosos', '¿En qué ciudad está el aeropuerto de Changi?', 'Singapur', ['Hong Kong', 'Bangkok', 'Kuala Lumpur']),
  P('Lugar por descripción', ['Es una ciudad excavada en roca rosa.', 'Está en Oriente Próximo.', 'Fue capital de los nabateos.', 'Sale en «Indiana Jones y la última cruzada».', 'Su edificio más famoso es «El Tesoro».'], 'Petra'),
  P('Lugar por descripción', ['Es una ciudad inca.', 'Está a más de 2400 metros de altura.', 'La redescubrió Hiram Bingham en 1911.', 'Está en Perú.', 'Su nombre significa «montaña vieja».'], 'Machu Picchu'),
  P('Lugar por descripción', ['Es un monumento de piedras gigantes en círculo.', 'Tiene unos 5000 años.', 'Está en Inglaterra.', 'Se alinea con el sol en los solsticios.', 'Está cerca de Salisbury.'], 'Stonehenge'),
  P('Lugar por descripción', ['Es un templo enorme en el sudeste asiático.', 'Aparece en la bandera de su país.', 'Está en Camboya.', 'Fue hinduista y luego budista.', 'Está cerca de Siem Reap.'], 'Angkor Wat|Angkor')
];
