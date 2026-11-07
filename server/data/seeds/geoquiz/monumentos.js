// server/data/seeds/geoquiz/monumentos.js — Monumentos, lugares y turismo
import { R, O, E, P } from './_tipos.js';

export default {
  id: 'monumentos',
  nombre: 'Monumentos y turismo',
  icono: 'tower',
  preguntas: [
    // Monumento → país
    R('Monumento y país', '¿En qué país está Machu Picchu?', 'Perú'),
    R('Monumento y país', '¿En qué país está Petra?', 'Jordania'),
    R('Monumento y país', '¿En qué país está Angkor Wat?', 'Camboya'),
    R('Monumento y país', '¿En qué país está Chichén Itzá?', 'México'),
    R('Monumento y país', '¿En qué país está Stonehenge?', 'Reino Unido|Inglaterra'),
    R('Monumento y país', '¿En qué país están los moáis de la isla de Pascua?', 'Chile'),
    R('Monumento y país', '¿En qué país está el castillo de Neuschwanstein?', 'Alemania'),
    R('Monumento y país', '¿En qué país está el Burj Khalifa, el edificio más alto del mundo?', 'Emiratos Árabes Unidos|Emiratos|EAU'),
    R('Monumento y país', '¿En qué país está el templo de Borobudur?', 'Indonesia'),
    R('Monumento y país', '¿En qué país está el Mont Saint-Michel?', 'Francia'),
    R('Monumento y país', '¿En qué país está la Acrópolis?', 'Grecia'),

    // Maravillas del mundo
    E('Maravillas del mundo', 'Las siete maravillas del mundo moderno (2007)', [
      'Gran Muralla China|Muralla China', 'Petra', 'Cristo Redentor', 'Machu Picchu', 'Chichén Itzá', 'Coliseo', 'Taj Mahal'
    ]),
    O('Maravillas del mundo', '¿Cuál es la única de las siete maravillas del mundo antiguo que sigue en pie?', 'La Gran Pirámide de Guiza', ['El Faro de Alejandría', 'El Coloso de Rodas', 'Los Jardines Colgantes de Babilonia']),

    // Parques nacionales
    R('Parques nacionales', '¿En qué país está el parque nacional de Yellowstone?', 'Estados Unidos|EEUU|EE UU|USA'),
    R('Parques nacionales', '¿En qué país está el parque nacional del Serengueti?', 'Tanzania'),
    R('Parques nacionales', '¿En qué país está el parque nacional Torres del Paine?', 'Chile'),
    R('Parques nacionales', '¿En qué país está el parque nacional Kruger?', 'Sudáfrica'),
    R('Parques nacionales', '¿A qué país pertenecen las islas Galápagos?', 'Ecuador'),

    // Islas turísticas
    R('Islas turísticas', '¿A qué país pertenece la isla de Bali?', 'Indonesia'),
    R('Islas turísticas', '¿A qué país pertenece Santorini?', 'Grecia'),
    R('Islas turísticas', '¿A qué país pertenece Phuket?', 'Tailandia'),
    R('Islas turísticas', '¿A qué país pertenece Zanzíbar?', 'Tanzania'),
    R('Islas turísticas', '¿A qué país pertenece Madeira?', 'Portugal'),
    R('Islas turísticas', '¿A qué país pertenece Bora Bora?', 'Francia', 'Forma parte de la Polinesia Francesa.'),

    // Lugar por descripción
    P('Lugar por descripción', [
      'Es un paisaje natural de Asia',
      'Es famoso por sus «chimeneas de hadas» de roca',
      'Hay ciudades subterráneas excavadas en la piedra',
      'Al amanecer se llena de globos aerostáticos',
      'Está en Turquía'
    ], 'Capadocia'),
    P('Lugar por descripción', [
      'Es un paisaje natural de América del Sur',
      'Está a más de 3.600 metros de altitud',
      'Es el mayor desierto de sal del mundo',
      'Cuando llueve se convierte en un espejo gigante',
      'Está en Bolivia'
    ], 'Salar de Uyuni|Uyuni'),
    P('Lugar por descripción', [
      'Es un monumento de Asia',
      'Es un mausoleo de mármol blanco',
      'Lo mandó construir un emperador para su esposa fallecida',
      'Es uno de los símbolos del arte mogol',
      'Está en Agra, en la India'
    ], 'Taj Mahal'),

    O('Patrimonio de la Humanidad', '¿Qué país tiene más lugares declarados Patrimonio de la Humanidad por la UNESCO?', 'Italia', ['China', 'España', 'Francia']),
    O('Aeropuertos famosos', '¿En qué ciudad está el aeropuerto de Heathrow?', 'Londres', ['Dublín', 'Edimburgo', 'Manchester']),
    O('Aeropuertos famosos', '¿En qué ciudad está el aeropuerto JFK?', 'Nueva York', ['Washington', 'Chicago', 'Los Ángeles'])
  ]
};
