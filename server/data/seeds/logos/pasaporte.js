// «El pasaporte»: ¿de qué país es la marca? (país donde nació la marca)
// [marca, país, país trampa opcional (el que mucha gente cree)]

export const PAISES = [
  'España', 'Estados Unidos', 'Alemania', 'Francia', 'Italia', 'Reino Unido', 'Japón', 'Suecia', 'Suiza',
  'Países Bajos', 'Corea del Sur', 'China', 'Dinamarca', 'Finlandia', 'Noruega', 'Bélgica', 'Austria',
  'Canadá', 'México', 'Brasil', 'Argentina', 'Portugal', 'Irlanda', 'Australia', 'Taiwán', 'India', 'Rusia'
];

export const PASAPORTE = [
  // España
  ['Zara', 'España', 'Italia'], ['Mango', 'España', 'Italia'], ['Desigual', 'España', 'Francia'], ['Chupa Chups', 'España', 'Italia'],
  ['Loewe', 'España', 'Francia'], ['Balenciaga', 'España', 'Francia'], ['Camper', 'España', 'Italia'], ['Pull&Bear', 'España', 'Reino Unido'],
  ['Bershka', 'España', 'Alemania'], ['Massimo Dutti', 'España', 'Italia'], ['Stradivarius', 'España', 'Italia'], ['Oysho', 'España', 'Japón'],
  ['Tous', 'España', 'Francia'], ['Mahou', 'España'], ['Estrella Damm', 'España'], ['Cola Cao', 'España'], ['Telepizza', 'España', 'Italia'],
  ['Mercadona', 'España'], ['El Corte Inglés', 'España', 'Reino Unido'], ['Seat', 'España', 'Alemania'], ['Cupra', 'España', 'Alemania'],
  ['Freixenet', 'España', 'Francia'], ['Iberia', 'España'], ['Movistar', 'España'], ['Pikolinos', 'España', 'Italia'],
  ['Munich', 'España', 'Alemania'], ['Joma', 'España', 'Italia'], ['Kelme', 'España', 'Italia'], ['Bimbo', 'México', 'España'],
  ['Cortefiel', 'España'], ['Adolfo Domínguez', 'España'], ['Purificación García', 'España'], ['Lladró', 'España', 'Italia'],
  ['Talgo', 'España', 'Alemania'], ['Mapfre', 'España'], ['Fnac', 'Francia', 'España'], ['Puig', 'España', 'Francia'],
  ['Glovo', 'España', 'Alemania'], ['Cabify', 'España', 'México'],
  ['Wallapop', 'España', 'Estados Unidos'], ['Idealista', 'España', 'Italia'], ['Gallina Blanca', 'España'], ['Chocolates Valor', 'España', 'Suiza'],
  ['Scalpers', 'España'], ['Hawkers', 'España', 'Estados Unidos'], // Estados Unidos
  ['Nike', 'Estados Unidos', 'Alemania'], ['Coca-Cola', 'Estados Unidos'], ['Levi\'s', 'Estados Unidos', 'Reino Unido'], ['Converse', 'Estados Unidos', 'Reino Unido'],
  ['Vans', 'Estados Unidos', 'Australia'], ['Timberland', 'Estados Unidos', 'Canadá'], ['Ralph Lauren', 'Estados Unidos', 'Reino Unido'],
  ['Tommy Hilfiger', 'Estados Unidos', 'Países Bajos'], ['Calvin Klein', 'Estados Unidos', 'Alemania'], ['Häagen-Dazs', 'Estados Unidos', 'Dinamarca'],
  ['Ben & Jerry\'s', 'Estados Unidos', 'Reino Unido'], ['KFC', 'Estados Unidos'], ['Burger King', 'Estados Unidos'], ['Starbucks', 'Estados Unidos', 'Italia'],
  ['Heinz', 'Estados Unidos', 'Alemania'], ['Kellogg\'s', 'Estados Unidos', 'Reino Unido'], ['Pringles', 'Estados Unidos', 'Reino Unido'],
  ['Oreo', 'Estados Unidos', 'Reino Unido'], ['M&M\'s', 'Estados Unidos', 'Reino Unido'], ['Harley-Davidson', 'Estados Unidos'], ['Jeep', 'Estados Unidos'],
  ['Tesla', 'Estados Unidos'], ['Gillette', 'Estados Unidos', 'Alemania'], ['Colgate', 'Estados Unidos', 'Reino Unido'], ['Tupperware', 'Estados Unidos', 'Alemania'],
  ['Zippo', 'Estados Unidos', 'Suiza'], ['Ray-Ban', 'Estados Unidos', 'Italia'], ['Jack Daniel\'s', 'Estados Unidos', 'Irlanda'], ['Budweiser', 'Estados Unidos', 'Alemania'],
  ['Wrangler', 'Estados Unidos'], ['The North Face', 'Estados Unidos', 'Canadá'], ['Under Armour', 'Estados Unidos'], ['New Balance', 'Estados Unidos', 'Reino Unido'],
  ['Skechers', 'Estados Unidos'], ['Crocs', 'Estados Unidos', 'Australia'], ['GoPro', 'Estados Unidos', 'Japón'], ['Polaroid', 'Estados Unidos', 'Japón'],
  ['Kodak', 'Estados Unidos', 'Japón'], ['Xerox', 'Estados Unidos', 'Japón'], ['Dr Pepper', 'Estados Unidos'], ['Gatorade', 'Estados Unidos'],
  ['Tabasco', 'Estados Unidos', 'México'], ['Doritos', 'Estados Unidos', 'México'], ['Taco Bell', 'Estados Unidos', 'México'], ['Domino\'s', 'Estados Unidos', 'Italia'],
  ['Pizza Hut', 'Estados Unidos', 'Italia'], ['Subway', 'Estados Unidos'], ['Dunkin\'', 'Estados Unidos'], ['Nerf', 'Estados Unidos'],
  ['Hasbro', 'Estados Unidos'], ['Mattel', 'Estados Unidos'], ['Barbie', 'Estados Unidos'], ['Monopoly', 'Estados Unidos', 'Reino Unido'],
  ['Victoria\'s Secret', 'Estados Unidos', 'Reino Unido'], ['Abercrombie & Fitch', 'Estados Unidos', 'Reino Unido'], ['Hollister', 'Estados Unidos'],
  ['Gap', 'Estados Unidos'], ['Guess', 'Estados Unidos', 'Italia'], ['Michael Kors', 'Estados Unidos', 'Italia'], ['Tiffany & Co.', 'Estados Unidos', 'Francia'],
  ['Estée Lauder', 'Estados Unidos', 'Francia'], ['Maybelline', 'Estados Unidos', 'Francia'], ['Revlon', 'Estados Unidos', 'Francia'], ['Kiehl\'s', 'Estados Unidos'],
  ['Fender', 'Estados Unidos'], ['Gibson', 'Estados Unidos'], ['Bose', 'Estados Unidos', 'Japón'], ['Beats', 'Estados Unidos'],
  ['Jacuzzi', 'Estados Unidos', 'Italia'], ['Post-it', 'Estados Unidos', 'Japón'], ['WD-40', 'Estados Unidos'],
  ['Chevrolet', 'Estados Unidos', 'Suiza'], ['Ford', 'Estados Unidos'], ['Cadillac', 'Estados Unidos', 'Francia'], ['Dodge', 'Estados Unidos'],
  ['Chrysler', 'Estados Unidos'], ['Boeing', 'Estados Unidos'], ['Uber', 'Estados Unidos'], ['Airbnb', 'Estados Unidos'], ['Netflix', 'Estados Unidos'],
  ['Wilson', 'Estados Unidos'], ['Spalding', 'Estados Unidos'], ['Oakley', 'Estados Unidos', 'Italia'], ['Columbia', 'Estados Unidos', 'Canadá'],
  ['Carhartt', 'Estados Unidos'], ['Dickies', 'Estados Unidos'], ['Champion', 'Estados Unidos', 'Reino Unido'], ['Reebok', 'Reino Unido', 'Estados Unidos'],
  // Alemania
  ['Adidas', 'Alemania', 'Estados Unidos'], ['Puma', 'Alemania', 'Estados Unidos'], ['Hugo Boss', 'Alemania', 'Suiza'], ['Nivea', 'Alemania', 'Francia'],
  ['Haribo', 'Alemania', 'Bélgica'], ['Milka', 'Suiza', 'Alemania'], ['Ritter Sport', 'Alemania', 'Suiza'], ['Volkswagen', 'Alemania'], ['BMW', 'Alemania'], ['Mercedes-Benz', 'Alemania'], ['Audi', 'Alemania'], ['Porsche', 'Alemania'], ['Opel', 'Alemania', 'Estados Unidos'],
  ['Bosch', 'Alemania', 'Suiza'], ['Siemens', 'Alemania'], ['Miele', 'Alemania', 'Suecia'], ['Braun', 'Alemania', 'Estados Unidos'], ['Faber-Castell', 'Alemania', 'Suiza'],
  ['Staedtler', 'Alemania'], ['Pelikan', 'Alemania'], ['Montblanc', 'Alemania', 'Francia'], ['Playmobil', 'Alemania', 'Dinamarca'], ['Lufthansa', 'Alemania'],
  ['Birkenstock', 'Alemania', 'Suiza'], ['Jägermeister', 'Alemania', 'Austria'], ['Beck\'s', 'Alemania', 'Países Bajos'], ['Paulaner', 'Alemania'],
  ['Lidl', 'Alemania'], ['Aldi', 'Alemania'], ['Leica', 'Alemania', 'Japón'], ['Sennheiser', 'Alemania', 'Dinamarca'], ['Kärcher', 'Alemania', 'Suiza'],
  ['Tchibo', 'Alemania'], ['Melitta', 'Alemania', 'Italia'], ['Dr. Oetker', 'Alemania', 'Austria'], ['Schwarzkopf', 'Alemania', 'Austria'],
  ['Zalando', 'Alemania', 'Italia'], ['Rimowa', 'Alemania', 'Italia'], ['Steiff', 'Alemania'], ['Wella', 'Alemania', 'Francia'], ['Uhu', 'Alemania'],
  ['Pritt', 'Alemania', 'Reino Unido'], ['Tempo', 'Alemania'], ['Continental', 'Alemania', 'Estados Unidos'], ['Varta', 'Alemania'],
  // Francia
  ['Chanel', 'Francia'], ['Louis Vuitton', 'Francia', 'Italia'], ['Dior', 'Francia', 'Italia'], ['Hermès', 'Francia', 'Italia'], ['Lacoste', 'Francia', 'Italia'],
  ['Danone', 'España', 'Francia'], ['L\'Oréal', 'Francia', 'Italia'], ['Évian', 'Francia', 'Suiza'], ['Perrier', 'Francia', 'Italia'], ['Peugeot', 'Francia'],
  ['Renault', 'Francia'], ['Citroën', 'Francia'], ['Michelin', 'Francia', 'Estados Unidos'], ['Bic', 'Francia', 'Estados Unidos'],
  ['Decathlon', 'Francia'], ['Carrefour', 'Francia'], ['Yves Saint Laurent', 'Francia'], ['Cartier', 'Francia', 'Suiza'], ['Givenchy', 'Francia'],
  ['Moët & Chandon', 'Francia'], ['Ricard', 'Francia'], ['Le Coq Sportif', 'Francia'], ['Quechua', 'Francia', 'Suiza'], ['Garnier', 'Francia'],
  ['Président', 'Francia'], ['Ubisoft', 'Francia', 'Canadá'], ['Air France', 'Francia'], ['Lancôme', 'Francia'],
  ['Kenzo', 'Francia', 'Japón'], ['Longchamp', 'Francia', 'Italia'], ['Tefal', 'Francia', 'Alemania'], ['Moulinex', 'Francia', 'Alemania'], ['Rossignol', 'Francia', 'Suiza'],
  // Italia
  ['Ferrari', 'Italia'], ['Lamborghini', 'Italia'], ['Fiat', 'Italia'], ['Alfa Romeo', 'Italia'], ['Maserati', 'Italia'], ['Ducati', 'Italia'], ['Vespa', 'Italia'],
  ['Gucci', 'Italia', 'Francia'], ['Prada', 'Italia', 'Francia'], ['Versace', 'Italia', 'Francia'], ['Armani', 'Italia'], ['Dolce & Gabbana', 'Italia'],
  ['Barilla', 'Italia'], ['Nutella', 'Italia', 'Francia'], ['Ferrero Rocher', 'Italia', 'Bélgica'], ['Lavazza', 'Italia'], ['Illy', 'Italia'],
  ['Pirelli', 'Italia', 'Alemania'], ['Benetton', 'Italia'], ['Diesel', 'Italia', 'Estados Unidos'], ['Kappa', 'Italia', 'España'], ['Fila', 'Italia', 'Corea del Sur'],
  ['Lotto', 'Italia'], ['Diadora', 'Italia'], ['Luxottica', 'Italia'], ['Bialetti', 'Italia'], ['De\'Longhi', 'Italia'],
  ['San Pellegrino', 'Italia', 'Francia'], ['Peroni', 'Italia'], ['Martini', 'Italia', 'Francia'], ['Campari', 'Italia'], ['Aperol', 'Italia'],
  ['Bulgari', 'Italia', 'Francia'], ['Fendi', 'Italia', 'Francia'], ['Valentino', 'Italia', 'Francia'], ['Tic Tac', 'Italia', 'Estados Unidos'], ['Pagani', 'Italia'],
  // Reino Unido
  ['Burberry', 'Reino Unido'], ['Dr. Martens', 'Reino Unido', 'Alemania'], ['Rolls-Royce', 'Reino Unido'], ['Bentley', 'Reino Unido'], ['Aston Martin', 'Reino Unido'],
  ['Jaguar', 'Reino Unido'], ['Land Rover', 'Reino Unido'], ['Mini', 'Reino Unido', 'Alemania'], ['McLaren', 'Reino Unido'], ['Lotus', 'Reino Unido'],
  ['Cadbury', 'Reino Unido'], ['Lipton', 'Reino Unido', 'Estados Unidos'], ['Twinings', 'Reino Unido'], ['Dyson', 'Reino Unido', 'Japón'], ['Fred Perry', 'Reino Unido'],
  ['Umbro', 'Reino Unido'], ['Barbour', 'Reino Unido'], ['Primark', 'Irlanda', 'Reino Unido'], ['Topshop', 'Reino Unido'], ['Superdry', 'Reino Unido', 'Japón'],
  ['Lush', 'Reino Unido'], ['The Body Shop', 'Reino Unido'], ['Tesco', 'Reino Unido'], ['Vodafone', 'Reino Unido'],
  ['BP', 'Reino Unido'], ['Johnnie Walker', 'Reino Unido', 'Irlanda'], ['Gordon\'s', 'Reino Unido'], ['Bombay Sapphire', 'Reino Unido', 'India'],
  ['Hendrick\'s', 'Reino Unido'], ['Marshall', 'Reino Unido', 'Estados Unidos'], ['Hunter', 'Reino Unido'], ['Clarks', 'Reino Unido'], ['Mulberry', 'Reino Unido'],
  ['Deliveroo', 'Reino Unido'], ['Kit Kat', 'Reino Unido', 'Suiza'],
  // Irlanda
  ['Guinness', 'Irlanda'], ['Baileys', 'Irlanda'], ['Jameson', 'Irlanda'], ['Ryanair', 'Irlanda'], ['Kerrygold', 'Irlanda'],
  // Japón
  ['Sony', 'Japón'], ['Toyota', 'Japón'], ['Honda', 'Japón'], ['Nissan', 'Japón'], ['Mazda', 'Japón'], ['Subaru', 'Japón'], ['Mitsubishi', 'Japón'],
  ['Suzuki', 'Japón'], ['Yamaha', 'Japón'], ['Kawasaki', 'Japón'], ['Lexus', 'Japón', 'Estados Unidos'], ['Nintendo', 'Japón'], ['Canon', 'Japón'], ['Nikon', 'Japón'],
  ['Panasonic', 'Japón'], ['Casio', 'Japón'], ['Seiko', 'Japón', 'Suiza'], ['Asics', 'Japón'], ['Mizuno', 'Japón'], ['Uniqlo', 'Japón'], ['Muji', 'Japón'],
  ['Shiseido', 'Japón'], ['Bridgestone', 'Japón', 'Estados Unidos'], ['Fujifilm', 'Japón'], ['Pokémon', 'Japón'], ['Sega', 'Japón'], ['Bandai', 'Japón'],
  ['Pilot', 'Japón'], ['Brother', 'Japón', 'Estados Unidos'], ['Hello Kitty', 'Japón'], ['Kikkoman', 'Japón', 'China'], ['Onitsuka Tiger', 'Japón'],
  ['Toshiba', 'Japón'], ['Olympus', 'Japón', 'Alemania'], ['Pioneer', 'Japón', 'Estados Unidos'], ['Square Enix', 'Japón'], ['Capcom', 'Japón'], ['Konami', 'Japón'],
  // Suecia
  ['IKEA', 'Suecia', 'Dinamarca'], ['H&M', 'Suecia', 'Alemania'], ['Volvo', 'Suecia'], ['Spotify', 'Suecia', 'Estados Unidos'], ['Ericsson', 'Suecia', 'Finlandia'],
  ['Electrolux', 'Suecia', 'Alemania'], ['Absolut', 'Suecia', 'Rusia'], ['Saab', 'Suecia'], ['Scania', 'Suecia', 'Alemania'], ['Tetra Pak', 'Suecia', 'Alemania'],
  ['Mojang', 'Suecia'], ['Husqvarna', 'Suecia'], ['Hasselblad', 'Suecia', 'Alemania'], ['Fjällräven', 'Suecia', 'Noruega'], ['Klarna', 'Suecia'], ['Acne Studios', 'Suecia'], ['Koenigsegg', 'Suecia', 'Alemania'], ['Oatly', 'Suecia'],
  // Suiza
  ['Nestlé', 'Suiza', 'Francia'], ['Swatch', 'Suiza'], ['Omega', 'Suiza'], ['TAG Heuer', 'Suiza'], ['Victorinox', 'Suiza'],
  ['Lindt', 'Suiza', 'Bélgica'], ['Toblerone', 'Suiza'], ['Nespresso', 'Suiza', 'Italia'], ['Ricola', 'Suiza'], ['Logitech', 'Suiza', 'Estados Unidos'],
  ['Ovomaltine', 'Suiza'], ['Maggi', 'Suiza', 'Alemania'], ['Rivella', 'Suiza'], ['On Running', 'Suiza'], ['Swiss', 'Suiza'], ['Patek Philippe', 'Suiza'],
  ['Tissot', 'Suiza'], ['Freitag', 'Suiza'], ['Caran d\'Ache', 'Suiza', 'Francia'],
  // Países Bajos
  ['Philips', 'Países Bajos'], ['Heineken', 'Países Bajos', 'Alemania'], ['KLM', 'Países Bajos'], ['G-Star Raw', 'Países Bajos'],
  ['Booking.com', 'Países Bajos', 'Estados Unidos'], ['TomTom', 'Países Bajos'], ['Bavaria', 'Países Bajos', 'Alemania'],
  ['Gazelle', 'Países Bajos'], ['Scotch & Soda', 'Países Bajos', 'Reino Unido'], ['ING', 'Países Bajos'], ['Grolsch', 'Países Bajos'], ['Douwe Egberts', 'Países Bajos'],
  // Dinamarca, Noruega, Finlandia
  ['LEGO', 'Dinamarca', 'Suecia'], ['Pandora', 'Dinamarca', 'Italia'], ['Carlsberg', 'Dinamarca', 'Alemania'], ['Bang & Olufsen', 'Dinamarca', 'Suecia'],
  ['Ecco', 'Dinamarca', 'Italia'], ['Jack & Jones', 'Dinamarca', 'Estados Unidos'], ['Vero Moda', 'Dinamarca', 'Italia'], ['Maersk', 'Dinamarca'], ['Tuborg', 'Dinamarca'], ['Lurpak', 'Dinamarca'], ['Flying Tiger', 'Dinamarca'], ['Nokia', 'Finlandia', 'Japón'], ['Rovio', 'Finlandia'], ['Supercell', 'Finlandia', 'Suecia'], ['Marimekko', 'Finlandia'], ['Fiskars', 'Finlandia'],
  ['Kone', 'Finlandia'], ['Fazer', 'Finlandia'], ['Iittala', 'Finlandia', 'Italia'], ['Norwegian', 'Noruega'], ['Helly Hansen', 'Noruega'], ['Freia', 'Noruega'],
  // Bélgica, Austria, Portugal
  ['Stella Artois', 'Bélgica', 'Francia'], ['Leffe', 'Bélgica'], ['Duvel', 'Bélgica'], ['Godiva', 'Bélgica', 'Suiza'], ['Côte d\'Or', 'Bélgica', 'Francia'],
  ['Neuhaus', 'Bélgica'], ['Lotus Biscoff', 'Bélgica', 'Países Bajos'], ['Red Bull', 'Austria', 'Tailandia'], ['Swarovski', 'Austria', 'Suiza'], ['Manner', 'Austria'],
  ['KTM', 'Austria'], ['Glock', 'Austria'], ['Pez', 'Austria', 'Estados Unidos'], ['Atomic', 'Austria'],
  ['Sagres', 'Portugal'], ['Super Bock', 'Portugal'], ['Delta Cafés', 'Portugal', 'España'], ['Mateus', 'Portugal'], ['TAP', 'Portugal'],
  // Corea, China, Taiwán, India
  ['Samsung', 'Corea del Sur', 'Japón'], ['LG', 'Corea del Sur', 'Japón'], ['Hyundai', 'Corea del Sur', 'Japón'], ['Kia', 'Corea del Sur', 'Japón'],
  ['Kumho', 'Corea del Sur'], ['Lenovo', 'China', 'Japón'], ['Huawei', 'China'], ['Xiaomi', 'China', 'Japón'], ['TikTok', 'China', 'Estados Unidos'],
  ['Alibaba', 'China'], ['DJI', 'China', 'Japón'], ['BYD', 'China'], ['Tsingtao', 'China', 'Japón'], ['Asus', 'Taiwán', 'Japón'], ['Acer', 'Taiwán', 'Japón'], ['Giant', 'Taiwán', 'Estados Unidos'], ['HTC', 'Taiwán', 'Japón'], ['Tata', 'India'], // América
  ['BlackBerry', 'Canadá', 'Estados Unidos'], ['Canada Goose', 'Canadá'], ['Lululemon', 'Canadá', 'Estados Unidos'], ['Tim Hortons', 'Canadá'], ['Shopify', 'Canadá'],
  ['Aldo', 'Canadá', 'Italia'], ['Corona', 'México', 'España'], ['Sol', 'México', 'España'], ['Jose Cuervo', 'México'], ['Havaianas', 'Brasil', 'Portugal'],
  ['Embraer', 'Brasil'], ['Quilmes', 'Argentina'], ['Mercado Libre', 'Argentina'], ['Billabong', 'Australia', 'Estados Unidos'],
  ['Quiksilver', 'Australia', 'Estados Unidos'], ['Rip Curl', 'Australia'], ['Vegemite', 'Australia'], ['Atlassian', 'Australia'],
  ['Kaspersky', 'Rusia'], ['Smirnoff', 'Rusia', 'Reino Unido'], ['Tetris', 'Rusia', 'Japón']
];
