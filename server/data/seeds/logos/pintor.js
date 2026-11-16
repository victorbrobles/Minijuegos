// «El pintor»: marcas con un logo que se puede dibujar. 'Marca|otros nombres aceptados'
// Ordenadas más o menos de fáciles a difíciles de dibujar (el orden no importa: se sacan al azar).

export const PINTOR = [
  // Muy reconocibles
  'Apple', 'Nike', 'McDonald\'s|McDonalds|Mcdonald', 'Adidas', 'Mercedes-Benz|Mercedes', 'Audi', 'Twitter', 'WhatsApp|Whatsapp',
  'YouTube|Youtube', 'Instagram', 'Facebook', 'Spotify', 'Netflix', 'Google', 'Microsoft', 'Windows', 'Starbucks', 'Shell',
  'Olimpiadas|Juegos Olímpicos|Juegos Olimpicos|JJOO', 'Mastercard|MasterCard', 'Pepsi', 'Coca-Cola|Coca Cola', 'BMW', 'Volkswagen|VW',
  'Toyota', 'Ferrari', 'Lamborghini', 'Puma', 'Lacoste', 'Red Bull|Redbull', 'Chupa Chups|Chupachups', 'Pac-Man|Pacman',
  'Android', 'Snapchat', 'TikTok|Tik Tok', 'Telegram', 'Wikipedia', 'Firefox', 'Chrome|Google Chrome', 'Safari',
  'Pokémon|Pokemon|Pokeball', 'Superman', 'Batman', 'Spider-Man|Spiderman', 'Capitán América|Capitan America', 'Star Wars',
  'Playboy', 'WWF', 'Cruz Roja', 'Renault', 'Citroën|Citroen', 'Opel', 'Mitsubishi', 'Peugeot', 'Chevrolet', 'Subaru',
  'Mazda', 'Hyundai', 'Honda', 'Tesla', 'Volvo', 'Seat', 'Mini', 'Jaguar', 'Maserati', 'Porsche', 'Alfa Romeo',
  'Rolex', 'Converse', 'Vans', 'Levi\'s|Levis', 'Ralph Lauren|Polo Ralph Lauren', 'Chanel', 'Gucci', 'Louis Vuitton',
  'Versace', 'Le Coq Sportif', 'Kappa', 'The North Face|North Face', 'Under Armour|UnderArmour', 'Reebok', 'New Balance',
  'Jordan|Air Jordan', 'Asics', 'Umbro', 'Fila', 'Tommy Hilfiger', 'Superdry',
  // Comida y bebida
  'Burger King', 'KFC', 'Subway', 'Domino\'s|Dominos', 'Pizza Hut', 'Taco Bell', 'Heineken', 'Mahou', 'Corona',
  'Guinness', 'Haribo', 'Kinder', 'Nutella', 'Milka', 'Toblerone', 'Kit Kat|KitKat', 'M&M\'s|M&Ms', 'Pringles',
  'Lay\'s|Lays', 'Doritos', 'Danone', 'Nestlé|Nestle', 'Nesquik', 'Cola Cao|ColaCao', 'Kellogg\'s|Kelloggs', 'Bimbo',
  'Monster|Monster Energy', 'Bacardí|Bacardi', 'Martini', 'Jägermeister|Jagermeister', 'Barilla', 'Heinz', 'Oreo',
  'Pez', 'Michelin', 'Tic Tac', 'Fanta', 'Sprite', 'Schweppes', 'Lipton', 'Nespresso', 'Dunkin\'|Dunkin|Dunkin Donuts',
  'Telepizza', 'Cruzcampo', 'Estrella Galicia', 'Estrella Damm|Damm', 'Häagen-Dazs|Haagen Dazs', 'Ben & Jerry\'s|Ben and Jerrys',
  'Frosties',
  // Tecnología, ocio e internet
  'PlayStation|Play Station', 'Xbox', 'Nintendo', 'Sega', 'Steam', 'Twitch', 'Discord', 'Reddit', 'Pinterest',
  'LinkedIn|Linkedin', 'Skype', 'Dropbox', 'Airbnb', 'Uber', 'Amazon', 'eBay|Ebay', 'PayPal|Paypal', 'Visa', 'Intel',
  'Nvidia', 'IBM', 'HP', 'Dell', 'Samsung', 'LG', 'Sony', 'Canon', 'Nikon', 'Tinder', 'Duolingo', 'Shazam',
  'Zoom', 'Slack', 'Opera', 'Linux|Tux', 'Angry Birds', 'Tetris', 'Minecraft', 'Fortnite', 'Among Us', 'Mario|Super Mario',
  'Disney', 'Pixar', 'DreamWorks|Dreamworks', 'Warner Bros|Warner', 'Paramount', 'Universal', 'Marvel', 'DC|DC Comics',
  'Hello Kitty', 'Mickey Mouse|Mickey', 'Los Simpson|Simpson|Simpsons', 'Bob Esponja|SpongeBob', 'Lego', 'Playmobil',
  'Barbie', 'Hot Wheels', 'Monopoly', 'Nerf', 'Rubik|Cubo de Rubik',
  // Marcas y organizaciones varias
  'IKEA|Ikea', 'Carrefour', 'Lidl', 'Mercadona', 'El Corte Inglés|El Corte Ingles|Corte Ingles', 'MediaMarkt|Media Markt',
  'Decathlon', 'Leroy Merlin', 'Zara', 'H&M|HM', 'Primark', 'FedEx', 'DHL', 'UPS', 'Correos', 'Renfe', 'Iberia',
  'Ryanair', 'Lufthansa', 'Qantas', 'Movistar', 'Vodafone', 'Orange', 'Santander|Banco Santander', 'BBVA',
  'CaixaBank|La Caixa|Caixa', 'Repsol', 'BP', 'Cepsa', 'UNICEF', 'ONU|Naciones Unidas', 'Unión Europea|Union Europea|UE',
  'FIFA', 'UEFA|Champions League|Champions', 'NBA', 'NFL', 'Fórmula 1|Formula 1|F1', 'LaLiga|La Liga', 'Real Madrid',
  'FC Barcelona|Barcelona|Barça|Barca', 'Atlético de Madrid|Atletico de Madrid|Atleti', 'Juventus', 'Bayern|Bayern Munich',
  'Manchester United', 'Chelsea', 'Liverpool', 'Arsenal', 'PSG|Paris Saint-Germain', 'Boca Juniors|Boca', 'Lakers|Los Angeles Lakers',
  'Chicago Bulls|Bulls', 'Wilson', 'Spalding', 'Harley-Davidson|Harley Davidson|Harley', 'Ducati', 'Yamaha', 'Kawasaki',
  'Vespa', 'Jeep', 'Land Rover', 'Rolls-Royce|Rolls Royce', 'Bentley', 'Aston Martin', 'Bugatti', 'Fiat', 'Kia', 'Dacia',
  'Cupra', 'Skoda', 'Nissan', 'Lexus', 'Ford', 'Pirelli', 'Swatch', 'Omega', 'Pandora', 'Swarovski', 'Ray-Ban|Rayban',
  'Crocs', 'Timberland', 'Quiksilver', 'Billabong', 'Rip Curl', 'Fred Perry', 'Hummel', 'Champion', 'Mizuno', 'Joma',
  'Hermès|Hermes', 'Fendi', 'Dior', 'Prada', 'Armani', 'Dolce & Gabbana|Dolce Gabbana', 'Calvin Klein', 'Desigual',
  'Mango', 'Pull&Bear|Pull and Bear', 'Bershka', 'Stradivarius', 'Camper', 'Victoria\'s Secret|Victorias Secret',
  'Duracell', 'Energizer', 'Bic', 'Post-it|Postit', 'Tupperware', 'Nivea', 'Dove', 'Colgate', 'Gillette', 'L\'Oréal|Loreal',
  'Mr. Proper|Don Limpio', 'Tous'
];
