// «El experto»: dos marcas rivales. Cada una esconde una pregunta fácil (1 punto) y otra difícil (3 puntos);
// en cada ronda se sortea cuál esconde cuál. [[marca, fácil, difícil], [marca, fácil, difícil]]
// Pregunta: [enunciado, correcta, incorrecta, incorrecta, incorrecta]

export const EXPERTO = [
  [
    ['McDonald\'s',
      ['¿De qué color son los arcos del logo de McDonald\'s?', 'Amarillo', 'Rojo', 'Naranja', 'Blanco'],
      ['¿En qué año abrió el primer McDonald\'s de España?', '1981', '1975', '1988', '1992']],
    ['Burger King',
      ['¿Cómo se llama la hamburguesa más famosa de Burger King?', 'Whopper', 'Big Mac', 'Big King XXL', 'Royale'],
      ['¿En qué estado de EE. UU. nació Burger King?', 'Florida', 'California', 'Texas', 'Nueva York']]
  ],
  [
    ['Coca-Cola',
      ['¿En qué ciudad se inventó la Coca-Cola?', 'Atlanta', 'Nueva York', 'Chicago', 'Los Ángeles'],
      ['¿Cómo se llamaba el farmacéutico que inventó la Coca-Cola?', 'John Pemberton', 'Caleb Bradham', 'Asa Candler', 'Frank Robinson']],
    ['Pepsi',
      ['¿Qué colores tiene el logo circular de Pepsi?', 'Rojo, blanco y azul', 'Rojo y amarillo', 'Verde y blanco', 'Negro y dorado'],
      ['¿Cómo se llamaba la bebida antes de llamarse Pepsi-Cola?', 'Brad\'s Drink', 'Pemberton\'s Wine', 'Cola Royal', 'Dr. Cola']]
  ],
  [
    ['Nike',
      ['¿Cómo se llama el famoso logo de Nike?', 'Swoosh', 'Swish', 'Check', 'Wing'],
      ['¿Cuánto cobró Carolyn Davidson por diseñar el logo de Nike?', '35 dólares', '500 dólares', '3.500 dólares', '1 dólar']],
    ['Adidas',
      ['¿Cuántas franjas tiene el logo de Adidas?', '3', '2', '4', '5'],
      ['¿En qué país está la sede de Adidas?', 'Alemania', 'Suiza', 'Austria', 'Países Bajos']]
  ],
  [
    ['Apple',
      ['¿Qué fruta es el logo de Apple?', 'Una manzana', 'Una pera', 'Una cereza', 'Un melocotón'],
      ['¿Qué científico aparecía en el primer logo de Apple, de 1976?', 'Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Nikola Tesla']],
    ['Samsung',
      ['¿De qué país es Samsung?', 'Corea del Sur', 'Japón', 'China', 'Taiwán'],
      ['¿Qué significa «Samsung» en coreano?', 'Tres estrellas', 'Sol naciente', 'Gran montaña', 'Cielo azul']]
  ],
  [
    ['PlayStation',
      ['¿Qué empresa fabrica la PlayStation?', 'Sony', 'Nintendo', 'Microsoft', 'Sega'],
      ['¿En qué año salió la primera PlayStation en Japón?', '1994', '1990', '1997', '1999']],
    ['Xbox',
      ['¿Qué empresa fabrica la Xbox?', 'Microsoft', 'Sony', 'Apple', 'Nintendo'],
      ['¿Cómo se llamaba el juego estrella que salió con la primera Xbox?', 'Halo', 'Gears of War', 'Forza', 'Fable']]
  ],
  [
    ['Nintendo',
      ['¿Cómo se llama el fontanero más famoso de Nintendo?', 'Mario', 'Luigi', 'Wario', 'Link'],
      ['¿Qué fabricaba Nintendo cuando se fundó en 1889?', 'Cartas de juego', 'Juguetes de madera', 'Relojes', 'Radios']],
    ['Sega',
      ['¿Cómo se llama el erizo azul de Sega?', 'Sonic', 'Knuckles', 'Tails', 'Shadow'],
      ['¿Cuál fue la última videoconsola de Sega?', 'Dreamcast', 'Saturn', 'Mega Drive', 'Game Gear']]
  ],
  [
    ['Mercedes-Benz',
      ['¿Cuántas puntas tiene la estrella de Mercedes?', '3', '4', '5', '6'],
      ['¿Cómo se llamaba la hija de quien dio nombre a la marca Mercedes?', 'Mercedes Jellinek', 'Mercedes Benz', 'Mercedes Daimler', 'Mercedes Maybach']],
    ['BMW',
      ['¿De qué país es BMW?', 'Alemania', 'Austria', 'Suiza', 'Suecia'],
      ['¿Qué significan las siglas BMW en español?', 'Fábrica de Motores Bávara', 'Motores Berlineses del Oeste', 'Máquinas Bávaras de Viena', 'Fábrica Berlinesa de Vehículos']]
  ],
  [
    ['Ferrari',
      ['¿Qué animal aparece en el logo de Ferrari?', 'Un caballo', 'Un toro', 'Un león', 'Un águila'],
      ['¿En qué ciudad italiana está la fábrica de Ferrari?', 'Maranello', 'Turín', 'Módena', 'Bolonia']],
    ['Lamborghini',
      ['¿Qué animal aparece en el logo de Lamborghini?', 'Un toro', 'Un caballo', 'Un tigre', 'Un lobo'],
      ['¿Qué fabricaba Ferruccio Lamborghini antes de hacer coches?', 'Tractores', 'Motos', 'Aviones', 'Lavadoras']]
  ],
  [
    ['Audi',
      ['¿Cuántos aros tiene el logo de Audi?', '4', '3', '5', '6'],
      ['¿Cuál de estas marcas NO formó parte de Auto Union (los aros de Audi)?', 'Opel', 'Horch', 'DKW', 'Wanderer']],
    ['Volkswagen',
      ['¿Qué significa «Volkswagen»?', 'Coche del pueblo', 'Coche rápido', 'Coche alemán', 'Coche pequeño'],
      ['¿Cómo se llama la ciudad alemana donde está la sede de Volkswagen?', 'Wolfsburgo', 'Stuttgart', 'Múnich', 'Ingolstadt']]
  ],
  [
    ['Toyota',
      ['¿De qué país es Toyota?', 'Japón', 'Corea del Sur', 'China', 'Tailandia'],
      ['¿Cómo se llama el famoso híbrido de Toyota lanzado en 1997?', 'Prius', 'Corolla', 'Auris', 'Yaris']],
    ['Honda',
      ['¿Qué letra aparece en el logo de los coches Honda?', 'H', 'O', 'A', 'N'],
      ['¿Cómo se llama el robot humanoide que presentó Honda en el año 2000?', 'ASIMO', 'AIBO', 'Pepper', 'QRIO']]
  ],
  [
    ['Seat',
      ['¿Qué modelo de Seat lleva el nombre de una isla?', 'Ibiza', 'León', 'Toledo', 'Arona'],
      ['¿Qué significa la «T» de SEAT?', 'Turismo', 'Transporte', 'Técnica', 'Tracción']],
    ['Renault',
      ['¿Qué forma tiene el logo de Renault?', 'Un rombo', 'Un círculo', 'Un triángulo', 'Una estrella'],
      ['¿Qué modelo de Renault se fabricó en España con el apodo de «el Cuatro Latas»?', 'Renault 4', 'Renault 5', 'Renault 12', 'Renault 8']]
  ],
  [
    ['Peugeot',
      ['¿Qué animal aparece en el logo de Peugeot?', 'Un león', 'Un tigre', 'Un caballo', 'Un águila'],
      ['¿Qué fabricaba Peugeot antes que coches, entre otras cosas?', 'Molinillos de pimienta', 'Barcos', 'Relojes de cuco', 'Pianos']],
    ['Citroën',
      ['¿Cuántas «V» invertidas tiene el logo de Citroën?', '2', '1', '3', '4'],
      ['¿Qué modelo de Citroën de 1955 se apodó en España «el Tiburón» por su forma?', 'DS', '2CV', 'Mehari', 'Visa']]
  ],
  [
    ['Zara',
      ['¿A qué grupo empresarial pertenece Zara?', 'Inditex', 'Tendam', 'LVMH', 'H&M'],
      ['¿En qué ciudad abrió la primera tienda de Zara?', 'A Coruña', 'Madrid', 'Santiago de Compostela', 'Vigo']],
    ['H&M',
      ['¿De qué país es H&M?', 'Suecia', 'Alemania', 'Dinamarca', 'Países Bajos'],
      ['¿Qué significaba la «H» de H&M al principio?', 'Hennes', 'Hansson', 'Holm', 'Hugo']]
  ],
  [
    ['Mercadona',
      ['¿Cómo se llama la marca blanca más conocida de Mercadona?', 'Hacendado', 'Carrefour Bio', 'Dia', 'Auchan'],
      ['¿En qué ciudad tiene su sede Mercadona?', 'Valencia', 'Madrid', 'Alicante', 'Barcelona']],
    ['Carrefour',
      ['¿De qué país es Carrefour?', 'Francia', 'Bélgica', 'Alemania', 'Italia'],
      ['¿Qué significa la palabra francesa «carrefour»?', 'Cruce de caminos', 'Mercado', 'Gran almacén', 'Plaza mayor']]
  ],
  [
    ['Lidl',
      ['¿De qué país es Lidl?', 'Alemania', 'Austria', 'Países Bajos', 'Suiza'],
      ['¿Qué otra cadena de supermercados es del mismo grupo que Lidl?', 'Kaufland', 'Aldi', 'Edeka', 'Rewe']],
    ['Aldi',
      ['¿De qué país es Aldi?', 'Alemania', 'Suecia', 'Francia', 'Bélgica'],
      ['¿Qué significa «Aldi»?', 'Albrecht Discount', 'Alles Discount', 'Aldo Distribución', 'Alemania Discount']]
  ],
  [
    ['Real Madrid',
      ['¿Cómo se llama el estadio del Real Madrid?', 'Santiago Bernabéu', 'Metropolitano', 'Vicente Calderón', 'Camp Nou'],
      ['¿Qué rey concedió el título de «Real» al Madrid en 1920?', 'Alfonso XIII', 'Alfonso XII', 'Juan Carlos I', 'Fernando VII']],
    ['FC Barcelona',
      ['¿Cómo se llama el estadio del Barça?', 'Spotify Camp Nou', 'Montjuïc', 'Sarrià', 'Cornellà']
      , ['¿Quién fundó el FC Barcelona en 1899?', 'Joan Gamper', 'Josep Sunyol', 'Agustí Montal', 'Narcís de Carreras']]
  ],
  [
    ['Netflix',
      ['¿De qué color es el logo de Netflix?', 'Rojo', 'Azul', 'Verde', 'Morado'],
      ['¿Qué alquilaba Netflix por correo antes de ser una plataforma de streaming?', 'DVD', 'Videojuegos', 'Libros', 'Discos de vinilo']],
    ['Disney+',
      ['¿Qué estudio de animación de la lámpara pertenece a Disney?', 'Pixar', 'DreamWorks', 'Illumination', 'Blue Sky']
      , ['¿Qué castillo alemán inspiró el castillo del logo de Disney?', 'Neuschwanstein', 'Hohenzollern', 'Heidelberg', 'Lichtenstein']]
  ],
  [
    ['Spotify',
      ['¿De qué color es el logo de Spotify?', 'Verde', 'Azul', 'Rojo', 'Amarillo'],
      ['¿En qué ciudad se fundó Spotify?', 'Estocolmo', 'Oslo', 'Copenhague', 'Helsinki']],
    ['Apple Music',
      ['¿Qué aparato musical de Apple, lanzado en 2001, llevaba «1.000 canciones en tu bolsillo»?', 'iPod', 'iPhone', 'iPad', 'Walkman'],
      ['¿Cómo se llamaba la tienda de música online de Apple lanzada en 2003?', 'iTunes Store', 'Apple Records', 'iMusic', 'Music Box']]
  ],
  [
    ['Facebook',
      ['¿Quién fundó Facebook?', 'Mark Zuckerberg', 'Jeff Bezos', 'Elon Musk', 'Larry Page'],
      ['¿Cómo se llamaba Facebook al principio?', 'TheFacebook', 'FaceMash', 'Friendster', 'MyFace']],
    ['Twitter',
      ['¿Qué animal fue el logo de Twitter hasta 2023?', 'Un pájaro', 'Un gato', 'Un pez', 'Un perro'],
      ['¿Cómo se llamaba el pájaro de Twitter?', 'Larry', 'Tweety', 'Jack', 'Bird']]
  ],
  [
    ['Instagram',
      ['¿Qué objeto aparece en el logo de Instagram?', 'Una cámara de fotos', 'Un móvil', 'Un corazón', 'Una lupa'],
      ['¿Cuánto pagó Facebook por Instagram en 2012?', '1.000 millones de dólares', '100 millones', '10.000 millones', '500 millones']],
    ['TikTok',
      ['¿Qué símbolo es el logo de TikTok?', 'Una nota musical', 'Un reloj', 'Un rayo', 'Una estrella'],
      ['¿Cómo se llama la empresa china propietaria de TikTok?', 'ByteDance', 'Tencent', 'Alibaba', 'Huawei']]
  ],
  [
    ['WhatsApp',
      ['¿De qué color es el logo de WhatsApp?', 'Verde', 'Azul', 'Rojo', 'Naranja'],
      ['¿Qué empresa compró WhatsApp en 2014?', 'Facebook', 'Google', 'Microsoft', 'Apple']],
    ['Telegram',
      ['¿Qué dibujo aparece en el logo de Telegram?', 'Un avión de papel', 'Un sobre', 'Un bocadillo', 'Una paloma'],
      ['¿De qué país son los hermanos que fundaron Telegram?', 'Rusia', 'Ucrania', 'Alemania', 'Estonia']]
  ],
  [
    ['Google',
      ['¿Qué colores tiene el logo de Google?', 'Azul, rojo, amarillo y verde', 'Rojo, blanco y negro', 'Solo azul', 'Morado y naranja'],
      ['¿Cómo se llamaba Google en 1996?', 'BackRub', 'Googol', 'Search', 'PageRank']],
    ['Microsoft',
      ['¿Cuántos cuadrados tiene el logo de Microsoft?', '4', '3', '6', '9'],
      ['¿Con quién fundó Bill Gates Microsoft en 1975?', 'Paul Allen', 'Steve Jobs', 'Steve Wozniak', 'Steve Ballmer']]
  ],
  [
    ['Amazon',
      ['¿Quién fundó Amazon?', 'Jeff Bezos', 'Elon Musk', 'Bill Gates', 'Tim Cook'],
      ['¿Qué vendía Amazon al principio?', 'Libros', 'Ropa', 'Música', 'Electrónica']],
    ['eBay',
      ['¿A qué se dedica principalmente eBay?', 'Compraventa y subastas por internet', 'Música en streaming', 'Viajes', 'Comida a domicilio'],
      ['¿Qué fue, según se cuenta, lo primero que se vendió en eBay?', 'Un puntero láser roto', 'Una muñeca Barbie', 'Una pelota firmada', 'Un ordenador viejo']]
  ],
  [
    ['Heineken',
      ['¿De qué color es la estrella de Heineken?', 'Roja', 'Verde', 'Azul', 'Dorada'],
      ['¿De qué país es Heineken?', 'Países Bajos', 'Alemania', 'Bélgica', 'Dinamarca']],
    ['Carlsberg',
      ['¿De qué país es Carlsberg?', 'Dinamarca', 'Suecia', 'Noruega', 'Alemania'],
      ['¿Cómo dice el eslogan de Carlsberg que es su cerveza?', 'Probablemente la mejor del mundo', 'La reina de las cervezas', 'La más fría', 'La cerveza del norte']]
  ],
  [
    ['Mahou',
      ['¿De qué ciudad es Mahou?', 'Madrid', 'Barcelona', 'Sevilla', 'Bilbao'],
      ['¿Cuántas estrellas tiene la cerveza más famosa de Mahou?', 'Cinco', 'Tres', 'Cuatro', 'Siete']],
    ['Estrella Galicia',
      ['¿De qué color es la estrella de Estrella Galicia?', 'Roja', 'Azul', 'Verde', 'Amarilla'],
      ['¿En qué ciudad se fundó Estrella Galicia?', 'A Coruña', 'Vigo', 'Lugo', 'Ourense']]
  ],
  [
    ['Cola Cao',
      ['¿Qué tipo de producto es el Cola Cao?', 'Cacao en polvo', 'Galletas', 'Refresco', 'Cereales'],
      ['¿Qué empresa catalana creó el Cola Cao?', 'Nutrexpa', 'Gallina Blanca', 'Chupa Chups', 'Ferrero']],
    ['Nesquik',
      ['¿Qué animal es la mascota de Nesquik?', 'Un conejo', 'Un oso', 'Un tigre', 'Un mono'],
      ['¿Cómo se llama el conejo de Nesquik?', 'Quicky', 'Bugs', 'Nesqui', 'Coco']]
  ],
  [
    ['Milka',
      ['¿De qué color es la vaca de Milka?', 'Lila', 'Marrón', 'Blanca y negra', 'Azul'],
      ['¿En qué país nació Milka?', 'Suiza', 'Alemania', 'Austria', 'Bélgica']],
    ['Lindt',
      ['¿De qué país es Lindt?', 'Suiza', 'Bélgica', 'Francia', 'Alemania'],
      ['¿Cómo se llaman las famosas bolitas de chocolate de Lindt?', 'Lindor', 'Pralinor', 'Rocher', 'Bonbon']]
  ],
  [
    ['Kinder',
      ['¿Qué significa «Kinder» en alemán?', 'Niños', 'Chocolate', 'Leche', 'Sorpresa'],
      ['¿Qué empresa italiana fabrica Kinder?', 'Ferrero', 'Barilla', 'Perugina', 'Lavazza']],
    ['Nutella',
      ['¿De qué es la crema Nutella?', 'Cacao y avellanas', 'Cacao y almendras', 'Leche y cacahuete', 'Chocolate blanco'],
      ['¿En qué año se lanzó Nutella con ese nombre?', '1964', '1946', '1982', '1990']]
  ],
  [
    ['Chupa Chups',
      ['¿Qué pintor diseñó el logo de Chupa Chups?', 'Salvador Dalí', 'Pablo Picasso', 'Joan Miró', 'Joaquín Sorolla'],
      ['¿Cómo se llamaba el fundador de Chupa Chups?', 'Enric Bernat', 'Josep Ferrer', 'Isak Andic', 'Ramon Areces']],
    ['Haribo',
      ['¿Qué gominola es la más famosa de Haribo?', 'Ositos de oro', 'Ladrillos', 'Fresas', 'Huevos fritos'],
      ['¿Qué ciudad alemana está escondida en el nombre de Haribo?', 'Bonn', 'Berlín', 'Bremen', 'Bochum']]
  ],
  [
    ['Starbucks',
      ['¿Qué figura aparece en el logo de Starbucks?', 'Una sirena', 'Una reina', 'Un barco', 'Una taza'],
      ['¿En qué ciudad abrió la primera tienda de Starbucks?', 'Seattle', 'San Francisco', 'Nueva York', 'Chicago']],
    ['Nespresso',
      ['¿A qué empresa pertenece Nespresso?', 'Nestlé', 'Philips', 'Lavazza', 'Danone'],
      ['¿Qué actor protagoniza desde 2006 los anuncios de Nespresso?', 'George Clooney', 'Brad Pitt', 'Leonardo DiCaprio', 'Johnny Depp']]
  ],
  [
    ['KFC',
      ['¿Qué significan las siglas KFC?', 'Kentucky Fried Chicken', 'King Food Chicken', 'Kansas Fried Chicken', 'Kentucky Fast Chicken'],
      ['¿Cuántas hierbas y especias lleva, según la marca, la receta secreta de KFC?', '11', '7', '15', '21']],
    ['Telepizza',
      ['¿Qué vende principalmente Telepizza?', 'Pizzas', 'Hamburguesas', 'Bocadillos', 'Pollo'],
      ['¿En qué ciudad abrió el primer Telepizza en 1987?', 'Madrid', 'Barcelona', 'Valencia', 'Sevilla']]
  ],
  [
    ['Domino\'s',
      ['¿Qué ficha de juego aparece en el logo de Domino\'s?', 'Una ficha de dominó', 'Un dado', 'Una carta', 'Una ficha de parchís'],
      ['¿Qué representan los tres puntos del logo de Domino\'s?', 'Sus tres primeros locales', 'Los tres fundadores', 'Tres ingredientes', 'Tres ciudades']],
    ['Pizza Hut',
      ['¿Qué parte de una casa aparece en el logo de Pizza Hut?', 'Un tejado', 'Una puerta', 'Una ventana', 'Una chimenea'],
      ['¿En qué ciudad de EE. UU. nació Pizza Hut?', 'Wichita', 'Chicago', 'Detroit', 'Boston']]
  ],
  [
    ['Puma',
      ['¿Qué animal es el logo de Puma?', 'Un puma', 'Un tigre', 'Un león', 'Un guepardo'],
      ['¿Cómo se llamaba el fundador de Puma, hermano de Adi Dassler?', 'Rudolf Dassler', 'Hans Dassler', 'Karl Dassler', 'Horst Dassler']],
    ['Reebok',
      ['¿De qué país es originaria Reebok?', 'Reino Unido', 'Estados Unidos', 'Australia', 'Canadá'],
      ['¿Qué es un «rhebok», de donde viene el nombre?', 'Un antílope africano', 'Un pájaro', 'Un río', 'Un tipo de zapato']]
  ],
  [
    ['Converse',
      ['¿Cómo se llaman las zapatillas más famosas de Converse?', 'All Star', 'Air Max', 'Old Skool', 'Superstar'],
      ['¿Qué jugador de baloncesto da nombre a las Converse más famosas?', 'Chuck Taylor', 'Michael Jordan', 'Larry Bird', 'Magic Johnson']],
    ['Vans',
      ['¿A qué deporte se asocia sobre todo Vans?', 'Monopatín', 'Tenis', 'Golf', 'Fútbol'],
      ['¿Cómo dice el eslogan de Vans?', 'Off the wall', 'Just do it', 'Be original', 'Never stop']]
  ],
  [
    ['Rolex',
      ['¿Qué símbolo aparece en el logo de Rolex?', 'Una corona', 'Una estrella', 'Un león', 'Un ancla'],
      ['¿En qué ciudad se fundó Rolex en 1905?', 'Londres', 'Ginebra', 'Zúrich', 'Berna']],
    ['Omega',
      ['¿De qué país es Omega?', 'Suiza', 'Francia', 'Alemania', 'Italia'],
      ['¿Qué modelo de Omega llevaron los astronautas a la Luna?', 'Speedmaster', 'Seamaster', 'Constellation', 'De Ville']]
  ],
  [
    ['Chanel',
      ['¿Qué letras forman el logo de Chanel?', 'Dos C', 'Una C y una H', 'Dos L', 'Una C y una N'],
      ['¿Qué número tiene el perfume más famoso de Chanel?', '5', '7', '19', '22']],
    ['Dior',
      ['¿De qué país es Dior?', 'Francia', 'Italia', 'Suiza', 'Bélgica'],
      ['¿Cómo se llamó la primera colección de Christian Dior en 1947?', 'New Look', 'Belle Époque', 'Haute Couture', 'Paris Mode']]
  ],
  [
    ['Gucci',
      ['¿De qué país es Gucci?', 'Italia', 'Francia', 'España', 'Suiza'],
      ['¿En qué ciudad italiana se fundó Gucci?', 'Florencia', 'Milán', 'Roma', 'Venecia']],
    ['Prada',
      ['¿De qué país es Prada?', 'Italia', 'Francia', 'Alemania', 'Reino Unido'],
      ['¿Qué película de 2006 lleva el nombre de Prada?', 'El diablo viste de Prada', 'Prada en Nueva York', 'Sexo en Nueva York', 'Mi Prada favorita']]
  ],
  [
    ['Louis Vuitton',
      ['¿Qué letras forman el monograma de Louis Vuitton?', 'L y V', 'L y U', 'V y T', 'L y W'],
      ['¿Qué fabricaba Louis Vuitton cuando empezó en 1854?', 'Baúles de viaje', 'Perfumes', 'Relojes', 'Pañuelos']],
    ['Hermès',
      ['¿De qué país es Hermès?', 'Francia', 'Italia', 'Grecia', 'Suiza'],
      ['¿Qué actriz da nombre al bolso más famoso de Hermès, junto al Birkin?', 'Grace Kelly', 'Audrey Hepburn', 'Marilyn Monroe', 'Brigitte Bardot']]
  ],
  [
    ['Lacoste',
      ['¿Qué animal es el logo de Lacoste?', 'Un cocodrilo', 'Un caimán', 'Una iguana', 'Una tortuga'],
      ['¿A qué deporte jugaba René Lacoste?', 'Tenis', 'Golf', 'Ciclismo', 'Rugby']],
    ['Ralph Lauren',
      ['¿Qué deporte aparece en el logo de Ralph Lauren?', 'Polo', 'Golf', 'Hípica de salto', 'Críquet'],
      ['¿Cómo se llama de verdad Ralph Lauren?', 'Ralph Lifshitz', 'Ralph Lawrence', 'Ralph Laurent', 'Ralph Lowe']]
  ],
  [
    ['IKEA',
      ['¿De qué país es IKEA?', 'Suecia', 'Dinamarca', 'Noruega', 'Finlandia'],
      ['¿Qué significa la «I» de IKEA?', 'Ingvar', 'Industria', 'Interior', 'Ikast']],
    ['Leroy Merlin',
      ['¿De qué país es Leroy Merlin?', 'Francia', 'Alemania', 'Bélgica', 'España'],
      ['¿A qué grupo familiar francés pertenece Leroy Merlin, junto a Decathlon y Alcampo?', 'Mulliez', 'Bettencourt', 'Arnault', 'Peugeot']]
  ],
  [
    ['Decathlon',
      ['¿Qué vende Decathlon?', 'Artículos de deporte', 'Muebles', 'Electrónica', 'Comida'],
      ['¿Cómo se llama la marca de montaña de Decathlon?', 'Quechua', 'Domyos', 'Kipsta', 'Artengo']],
    ['Sprinter',
      ['¿Qué vende Sprinter?', 'Ropa y calzado deportivo', 'Bicicletas', 'Libros', 'Juguetes'],
      ['¿A qué grupo británico pertenece Sprinter?', 'JD Sports', 'Sports Direct', 'Frasers', 'Primark']]
  ],
  [
    ['El Corte Inglés',
      ['¿De qué color es el triángulo del logo de El Corte Inglés?', 'Verde', 'Azul', 'Rojo', 'Negro'],
      ['¿Qué fue El Corte Inglés antes de ser grandes almacenes?', 'Una sastrería', 'Una zapatería', 'Una farmacia', 'Una librería']],
    ['Fnac',
      ['¿De qué país es Fnac?', 'Francia', 'España', 'Bélgica', 'Italia'],
      ['¿Qué significa la «F» de Fnac?', 'Federación', 'Francia', 'Fábrica', 'Fondo']]
  ],
  [
    ['Iberia',
      ['¿De qué país es Iberia?', 'España', 'Portugal', 'México', 'Argentina'],
      ['¿Con qué aerolínea británica se fusionó Iberia para formar IAG?', 'British Airways', 'easyJet', 'Virgin', 'Monarch']],
    ['Ryanair',
      ['¿De qué país es Ryanair?', 'Irlanda', 'Reino Unido', 'Escocia', 'Países Bajos'],
      ['¿Qué instrumento aparece en el logo de Ryanair?', 'Un arpa', 'Una gaita', 'Una flauta', 'Un violín']]
  ],
  [
    ['Movistar',
      ['¿A qué empresa pertenece Movistar?', 'Telefónica', 'Vodafone', 'Orange', 'Iberdrola'],
      ['¿Cómo se llamaba el servicio de móviles analógico de Telefónica anterior a Movistar?', 'MoviLine', 'Telefónica Móvil', 'Airtel', 'Amena']],
    ['Vodafone',
      ['¿De qué color es el logo de Vodafone?', 'Rojo', 'Azul', 'Verde', 'Naranja'],
      ['¿Cómo se llamaba Vodafone en España antes de llegar la marca?', 'Airtel', 'Amena', 'Retevisión', 'Uni2']]
  ],
  [
    ['Banco Santander',
      ['¿Qué símbolo aparece en el logo del Santander?', 'Una llama', 'Un árbol', 'Una estrella', 'Un barco'],
      ['¿Qué deporte patrocinó el Santander durante años con Ferrari?', 'Fórmula 1', 'Tenis', 'Vela', 'Ciclismo']],
    ['BBVA',
      ['¿Qué significa la segunda «B» de BBVA?', 'Bilbao', 'Banco', 'Barcelona', 'Burgos'],
      ['¿Qué dos bancos se fusionaron en 1999 para formar el BBVA?', 'BBV y Argentaria', 'Bilbao y Vizcaya solo', 'Banesto y Central', 'Hispano y Central']]
  ],
  [
    ['Repsol',
      ['¿Qué vende Repsol principalmente?', 'Combustible y energía', 'Ropa', 'Coches', 'Comida'],
      ['¿Con qué equipo de MotoGP se asocia Repsol desde hace décadas?', 'Honda', 'Ducati', 'Yamaha', 'Suzuki']],
    ['Cepsa',
      ['¿Qué vende Cepsa principalmente?', 'Combustible y energía', 'Seguros', 'Muebles', 'Electrodomésticos'],
      ['¿Cómo pasó a llamarse Cepsa en 2024?', 'Moeve', 'Galp', 'Petronor', 'Naturgy']]
  ],
  [
    ['LEGO',
      ['¿De qué país es LEGO?', 'Dinamarca', 'Suecia', 'Alemania', 'Países Bajos'],
      ['¿Qué significa «leg godt», origen del nombre LEGO?', 'Juega bien', 'Construye mucho', 'Piezas pequeñas', 'Niño feliz']],
    ['Playmobil',
      ['¿De qué país es Playmobil?', 'Alemania', 'Dinamarca', 'Suiza', 'Austria'],
      ['¿En qué año salieron los primeros muñecos de Playmobil?', '1974', '1958', '1985', '1990']]
  ],
  [
    ['Barbie',
      ['¿Cómo se llama el novio de Barbie?', 'Ken', 'Ben', 'Max', 'Tom'],
      ['¿Cómo se llama de nombre completo Barbie?', 'Barbara Millicent Roberts', 'Barbara Ann Smith', 'Barbie Mattel', 'Barbara Handler']],
    ['Nancy',
      ['¿Qué tipo de juguete es Nancy?', 'Una muñeca', 'Un peluche', 'Un coche', 'Un juego de mesa'],
      ['¿Qué empresa española fabrica la muñeca Nancy?', 'Famosa', 'Falca', 'Educa', 'Imaginarium']]
  ],
  [
    ['Michelin',
      ['¿Qué fabrica Michelin?', 'Neumáticos', 'Coches', 'Motos', 'Bicicletas'],
      ['¿Cómo se llama el muñeco de Michelin?', 'Bibendum', 'Michelino', 'Pneu', 'Gommy']],
    ['Pirelli',
      ['¿De qué país es Pirelli?', 'Italia', 'Francia', 'Alemania', 'Japón'],
      ['¿Qué famoso producto publica Pirelli cada año?', 'Un calendario', 'Una guía de restaurantes', 'Un mapa de carreteras', 'Un catálogo de coches']]
  ],
  [
    ['Sony',
      ['¿De qué país es Sony?', 'Japón', 'Corea del Sur', 'China', 'Estados Unidos'],
      ['¿Cómo se llamaba el reproductor de cassette portátil de Sony de 1979?', 'Walkman', 'Discman', 'iPod', 'Boombox']],
    ['Philips',
      ['¿De qué país es Philips?', 'Países Bajos', 'Alemania', 'Bélgica', 'Suecia'],
      ['¿Qué formato inventó Philips en los años 60 y luego desarrolló el CD con Sony?', 'El casete compacto', 'El vinilo', 'El VHS', 'El MP3']]
  ],
  [
    ['Huawei',
      ['¿De qué país es Huawei?', 'China', 'Japón', 'Corea del Sur', 'Taiwán'],
      ['¿En qué ciudad china tiene su sede Huawei?', 'Shenzhen', 'Pekín', 'Shanghái', 'Cantón']],
    ['Xiaomi',
      ['¿De qué país es Xiaomi?', 'China', 'Japón', 'Singapur', 'Corea del Sur'],
      ['¿Qué significa «Xiaomi»?', 'Pequeño arroz', 'Gran dragón', 'Tecnología barata', 'Estrella brillante']]
  ],
  [
    ['Canon',
      ['¿Qué fabrica Canon sobre todo?', 'Cámaras e impresoras', 'Coches', 'Relojes', 'Neveras'],
      ['¿De qué diosa budista viene el nombre de Canon?', 'Kannon', 'Amaterasu', 'Benzaiten', 'Inari']],
    ['Nikon',
      ['¿De qué país es Nikon?', 'Japón', 'Alemania', 'Corea del Sur', 'Estados Unidos'],
      ['¿A qué gran grupo empresarial japonés pertenece Nikon?', 'Mitsubishi', 'Toyota', 'Sony', 'Hitachi']]
  ],
  [
    ['Harley-Davidson',
      ['¿Qué fabrica Harley-Davidson?', 'Motos', 'Coches', 'Camiones', 'Bicicletas'],
      ['¿En qué ciudad de EE. UU. se fundó Harley-Davidson?', 'Milwaukee', 'Detroit', 'Chicago', 'Denver']],
    ['Ducati',
      ['¿De qué país es Ducati?', 'Italia', 'España', 'Japón', 'Alemania'],
      ['¿Qué marca de coches es dueña de Ducati?', 'Audi', 'Ferrari', 'Fiat', 'BMW']]
  ],
  [
    ['Ray-Ban',
      ['¿Qué vende Ray-Ban?', 'Gafas', 'Relojes', 'Zapatos', 'Bolsos'],
      ['¿Cómo se llama el modelo de gafas de Ray-Ban creado para los pilotos?', 'Aviator', 'Wayfarer', 'Clubmaster', 'Erika']],
    ['Oakley',
      ['¿A qué se asocia sobre todo Oakley?', 'Gafas deportivas', 'Ropa de fiesta', 'Relojes de lujo', 'Bolsos'],
      ['¿A qué empresa italiana pertenece Oakley, igual que Ray-Ban?', 'Luxottica', 'Safilo', 'Prada', 'Benetton']]
  ],
  [
    ['Heinz',
      ['¿Qué salsa es la más famosa de Heinz?', 'Kétchup', 'Mayonesa', 'Mostaza', 'Barbacoa'],
      ['¿Qué número aparece en las etiquetas de Heinz?', '57', '42', '99', '27']],
    ['Hellmann\'s',
      ['¿Qué salsa es la más famosa de Hellmann\'s?', 'Mayonesa', 'Kétchup', 'Alioli', 'Mostaza'],
      ['¿En qué ciudad nació la mayonesa Hellmann\'s?', 'Nueva York', 'Londres', 'París', 'Ámsterdam']]
  ],
  [
    ['Oreo',
      ['¿De qué color es el relleno clásico de Oreo?', 'Blanco', 'Marrón', 'Rosa', 'Amarillo'],
      ['¿Qué versión de Android se llamó como la galleta Oreo?', 'Android 8', 'Android 4', 'Android 10', 'Android 12']],
    ['Príncipe',
      ['¿Qué tipo de producto es Príncipe?', 'Galletas', 'Cereales', 'Chocolatinas', 'Yogures'],
      ['¿A qué empresa pertenece hoy Príncipe?', 'Mondelez', 'Nestlé', 'Gullón', 'Cuétara']]
  ],
  [
    ['Danone',
      ['¿Qué producto es el más famoso de Danone?', 'Yogur', 'Galletas', 'Zumos', 'Chocolate'],
      ['¿Dónde nació Danone?', 'Barcelona', 'París', 'Lyon', 'Ginebra']],
    ['Pascual',
      ['¿Qué producto es el más famoso de Pascual?', 'Leche', 'Pan', 'Galletas', 'Café'],
      ['¿En qué provincia nació Leche Pascual?', 'Burgos', 'Asturias', 'León', 'Cantabria']]
  ],
  [
    ['Red Bull',
      ['¿Qué animal aparece en el logo de Red Bull?', 'Un toro', 'Un caballo', 'Un búfalo', 'Un ciervo'],
      ['¿De qué país es Red Bull?', 'Austria', 'Tailandia', 'Alemania', 'Suiza']],
    ['Monster',
      ['¿Qué letra forman los zarpazos del logo de Monster?', 'M', 'W', 'N', 'V'],
      ['¿De qué color son los zarpazos del logo de Monster?', 'Verde', 'Rojo', 'Azul', 'Morado']]
  ],
  [
    ['Bimbo',
      ['¿Qué animal es la mascota de Bimbo?', 'Un oso', 'Un perro', 'Un conejo', 'Un gato'],
      ['¿De qué país es Grupo Bimbo?', 'México', 'España', 'Argentina', 'Estados Unidos']],
    ['Panrico',
      ['¿Qué bollo redondo con agujero hizo famoso Panrico?', 'Donuts', 'Croissant', 'Magdalena', 'Ensaimada'],
      ['¿Qué bollo de Panrico lleva una barrita de chocolate dentro?', 'Bollycao', 'Tigretón', 'Pantera Rosa', 'Qé!']]
  ],
  [
    ['Calvin Klein',
      ['¿Qué letras forman el logo de Calvin Klein?', 'CK', 'KC', 'CL', 'KK'],
      ['¿De qué país es Calvin Klein?', 'Estados Unidos', 'Alemania', 'Francia', 'Canadá']],
    ['Tommy Hilfiger',
      ['¿Qué forma tiene el logo de Tommy Hilfiger?', 'Una bandera', 'Un escudo', 'Una corona', 'Una estrella'],
      ['¿De qué país es Tommy Hilfiger?', 'Estados Unidos', 'Países Bajos', 'Reino Unido', 'Canadá']]
  ],
  [
    ['Versace',
      ['¿De qué país es Versace?', 'Italia', 'Grecia', 'Francia', 'España'],
      ['¿Qué figura mitológica aparece en el logo de Versace?', 'Medusa', 'Atenea', 'Afrodita', 'Hera']],
    ['Armani',
      ['¿Cómo se llama de nombre el fundador de Armani?', 'Giorgio', 'Gianni', 'Giovanni', 'Giuseppe'],
      ['¿En qué ciudad tiene su sede Armani?', 'Milán', 'Roma', 'Florencia', 'Turín']]
  ],
  [
    ['Tesla',
      ['¿Qué tipo de coches fabrica Tesla?', 'Eléctricos', 'De gasolina', 'Diésel', 'De hidrógeno'],
      ['¿En honor a quién se llama Tesla?', 'Nikola Tesla', 'Elon Tesla', 'Thomas Edison', 'Henry Ford']],
    ['BYD',
      ['¿De qué país es BYD?', 'China', 'Japón', 'Corea del Sur', 'India'],
      ['¿Qué significa BYD según la marca?', 'Build Your Dreams', 'Best Your Drive', 'Battery Yes Drive', 'Big Yellow Dragon']]
  ],
  [
    ['Volvo',
      ['¿De qué país es Volvo?', 'Suecia', 'Noruega', 'Dinamarca', 'Finlandia'],
      ['¿Qué invento de seguridad de Volvo regaló la marca para que lo usaran todos?', 'El cinturón de tres puntos', 'El airbag', 'El ABS', 'El reposacabezas']],
    ['Saab',
      ['¿De qué país es Saab?', 'Suecia', 'Alemania', 'Finlandia', 'Noruega'],
      ['¿Qué fabricaba Saab antes que coches?', 'Aviones', 'Barcos', 'Motos', 'Trenes']]
  ],
  [
    ['Fiat',
      ['¿De qué país es Fiat?', 'Italia', 'Francia', 'España', 'Suiza'],
      ['¿En qué ciudad italiana se fundó Fiat?', 'Turín', 'Milán', 'Roma', 'Módena']],
    ['Alfa Romeo',
      ['¿De qué país es Alfa Romeo?', 'Italia', 'Portugal', 'Grecia', 'España'],
      ['¿Qué animal aparece en el escudo de Alfa Romeo?', 'Una serpiente', 'Un dragón', 'Un águila', 'Un león']]
  ],
  [
    ['Porsche',
      ['¿Cuál es el modelo más famoso de Porsche?', '911', '208', 'Golf', 'Clio'],
      ['¿El escudo de qué ciudad aparece en el logo de Porsche?', 'Stuttgart', 'Múnich', 'Berlín', 'Hamburgo']],
    ['Maserati',
      ['¿De qué país es Maserati?', 'Italia', 'Mónaco', 'Francia', 'Austria'],
      ['¿Qué objeto aparece en el logo de Maserati?', 'Un tridente', 'Una lanza', 'Una espada', 'Un ancla']]
  ],
  [
    ['Mastercard',
      ['¿Cuántos círculos tiene el logo de Mastercard?', '2', '3', '1', '4'],
      ['¿Cómo dice su famoso eslogan en inglés?', 'Priceless', 'Everywhere', 'Go further', 'Just pay']],
    ['Visa',
      ['¿De qué color son las letras clásicas de Visa?', 'Azul', 'Rojo', 'Verde', 'Negro'],
      ['¿Cómo se llamaba Visa antes de 1976?', 'BankAmericard', 'Diners Club', 'CardOne', 'Charge Plus']]
  ],
  [
    ['Uber',
      ['¿A qué se dedica Uber?', 'Transporte con conductor', 'Comida rápida', 'Alquiler de pisos', 'Mensajería'],
      ['¿Cómo se llama el servicio de comida a domicilio de Uber?', 'Uber Eats', 'Uber Food', 'Uber Menu', 'Uber Chef']],
    ['Cabify',
      ['¿De qué país es Cabify?', 'España', 'México', 'Argentina', 'Chile'],
      ['¿En qué año se fundó Cabify?', '2011', '2005', '2016', '2019']]
  ],
  [
    ['Airbnb',
      ['¿Qué se alquila en Airbnb?', 'Alojamientos', 'Coches', 'Bicicletas', 'Barcos'],
      ['¿Qué alquilaron los fundadores de Airbnb la primera vez en su piso?', 'Colchones hinchables', 'Sofás cama', 'Hamacas', 'Tiendas de campaña']],
    ['Booking',
      ['¿Qué se reserva en Booking?', 'Hoteles y alojamientos', 'Vuelos solo', 'Restaurantes', 'Entradas de cine'],
      ['¿De qué país es Booking.com?', 'Países Bajos', 'Estados Unidos', 'Alemania', 'Suiza']]
  ],
  [
    ['Disney',
      ['¿Cómo se llama el ratón más famoso de Disney?', 'Mickey', 'Jerry', 'Speedy', 'Stuart'],
      ['¿Cuál fue el primer largometraje de animación de Disney?', 'Blancanieves', 'Pinocho', 'Dumbo', 'Fantasía']],
    ['Warner Bros',
      ['¿Qué conejo es el personaje más famoso de Warner Bros?', 'Bugs Bunny', 'Roger Rabbit', 'Tambor', 'Peter Rabbit'],
      ['¿Cuántos hermanos Warner fundaron el estudio?', '4', '2', '3', '5']]
  ],
  [
    ['Pixar',
      ['¿Cuál fue la primera película larga de Pixar?', 'Toy Story', 'Buscando a Nemo', 'Cars', 'Monstruos S.A.'],
      ['¿Cómo se llama la lámpara del logo de Pixar?', 'Luxo Jr.', 'Lumière', 'Lampy', 'Pixie']],
    ['DreamWorks',
      ['¿Qué ogro verde es el personaje más famoso de DreamWorks?', 'Shrek', 'Hulk', 'Grinch', 'Fiona']
      , ['¿Qué director de cine cofundó DreamWorks?', 'Steven Spielberg', 'George Lucas', 'James Cameron', 'Martin Scorsese']]
  ],
  [
    ['Marvel',
      ['¿Cuál de estos superhéroes es de Marvel?', 'Spider-Man', 'Batman', 'Superman', 'Aquaman'],
      ['¿Cómo se llamaba Marvel cuando se fundó en 1939?', 'Timely Comics', 'Atlas Comics', 'National Comics', 'Detective Comics']],
    ['DC',
      ['¿Cuál de estos superhéroes es de DC?', 'Batman', 'Iron Man', 'Thor', 'Hulk'],
      ['¿Qué significan las siglas DC?', 'Detective Comics', 'Dark Comics', 'Disney Comics', 'Digital Comics']]
  ],
  [
    ['Ford',
      ['¿Cómo se llamaba el fundador de Ford?', 'Henry Ford', 'Harrison Ford', 'Gerald Ford', 'Tom Ford'],
      ['¿Cómo se llamaba el primer coche de Ford fabricado en cadena?', 'Modelo T', 'Mustang', 'Modelo A', 'Fiesta']],
    ['Chevrolet',
      ['¿Qué forma tiene el logo de Chevrolet?', 'Una pajarita', 'Una estrella', 'Un círculo', 'Un rombo'],
      ['¿De qué país era Louis Chevrolet, cofundador de la marca?', 'Suiza', 'Francia', 'Bélgica', 'Canadá']]
  ],
  [
    ['Fanta',
      ['¿De qué sabor es la Fanta más famosa?', 'Naranja', 'Limón', 'Uva', 'Fresa'],
      ['¿En qué país se creó la Fanta, durante la Segunda Guerra Mundial?', 'Alemania', 'Estados Unidos', 'Italia', 'España']],
    ['Kas',
      ['¿De qué país es Kas?', 'España', 'Italia', 'Francia', 'Portugal'],
      ['¿En qué ciudad se creó Kas?', 'Vitoria', 'Bilbao', 'Pamplona', 'Logroño']]
  ],
  [
    ['Bacardí',
      ['¿Qué bebida es Bacardí?', 'Ron', 'Ginebra', 'Vodka', 'Whisky'],
      ['¿Qué animal aparece en el logo de Bacardí?', 'Un murciélago', 'Un búho', 'Un cuervo', 'Un loro']],
    ['Havana Club',
      ['¿Qué bebida es Havana Club?', 'Ron', 'Tequila', 'Ginebra', 'Coñac'],
      ['¿De qué país es Havana Club?', 'Cuba', 'República Dominicana', 'Puerto Rico', 'Jamaica']]
  ],
  [
    ['Absolut',
      ['¿Qué bebida es Absolut?', 'Vodka', 'Ron', 'Tequila', 'Whisky'],
      ['¿De qué país es Absolut?', 'Suecia', 'Rusia', 'Polonia', 'Finlandia']],
    ['Smirnoff',
      ['¿Qué bebida es Smirnoff?', 'Vodka', 'Ginebra', 'Ron', 'Brandy'],
      ['¿En qué país nació Smirnoff?', 'Rusia', 'Suecia', 'Ucrania', 'Reino Unido']]
  ],
  [
    ['Jack Daniel\'s',
      ['¿Qué bebida es Jack Daniel\'s?', 'Whisky', 'Ron', 'Vodka', 'Ginebra'],
      ['¿Qué número aparece en la etiqueta de Jack Daniel\'s?', '7', '5', '3', '12']],
    ['Johnnie Walker',
      ['¿Qué bebida es Johnnie Walker?', 'Whisky', 'Ginebra', 'Coñac', 'Ron'],
      ['¿Cómo se llama el personaje que camina en el logo de Johnnie Walker?', 'Striding Man', 'Walking Joe', 'The Gentleman', 'Mr. Walker Jr.']]
  ],
  [
    ['Lufthansa',
      ['¿De qué país es Lufthansa?', 'Alemania', 'Austria', 'Suiza', 'Países Bajos'],
      ['¿Qué ave aparece en el logo de Lufthansa?', 'Una grulla', 'Un águila', 'Una cigüeña', 'Una gaviota']],
    ['Air France',
      ['¿De qué país es Air France?', 'Francia', 'Bélgica', 'Suiza', 'Canadá'],
      ['¿Con qué aerolínea neerlandesa está fusionada Air France?', 'KLM', 'Transavia', 'Martinair', 'Brussels Airlines']]
  ],
  [
    ['Sanitas',
      ['¿A qué se dedica Sanitas?', 'Seguros de salud', 'Seguros de coche', 'Banca', 'Viajes'],
      ['¿A qué grupo británico pertenece Sanitas?', 'Bupa', 'Aviva', 'Prudential', 'Legal & General']],
    ['Mapfre',
      ['¿A qué se dedica Mapfre?', 'Seguros', 'Telefonía', 'Energía', 'Supermercados'],
      ['¿De qué país es Mapfre?', 'España', 'Francia', 'México', 'Portugal']]
  ]
];
