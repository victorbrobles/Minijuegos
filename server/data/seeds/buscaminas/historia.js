// server/data/seeds/buscaminas/historia.js

const plantillas = [
  // 1 - 10: Roma, Grecia y Mundo Antiguo
  {
    c: 'Emperadores y líderes supremos del Imperio Romano',
    f: ['Augusto', 'Nerón', 'Calígula', 'Marco Aurelio'],
    m: ['Trajano', 'Tiberio', 'Adriano'],
    d: ['Claudio', 'Cómodo', 'Septimio Severo'],
    t: ['Alejandro Magno', 'Espartaco', 'Cicerón', 'Aníbal Barca', 'Cleopatra VII']
  },
  {
    c: 'Filósofos destacados de la Antigua Grecia',
    f: ['Sócrates', 'Platón', 'Aristóteles', 'Pitágoras'],
    m: ['Epicuro', 'Heráclito', 'Diógenes de Sínope'],
    d: ['Tales de Mileto', 'Zenón de Citio', 'Parménides'],
    t: ['Séneca (romano)', 'Marco Aurelio', 'Cicerón', 'Confucio', 'René Descartes']
  },
  {
    c: 'Dioses principales del panteón olímpico griego',
    f: ['Zeus', 'Poseidón', 'Hades (inframundo)', 'Atenea'],
    m: ['Apolo', 'Ares', 'Afrodita'],
    d: ['Hermes', 'Dioniso', 'Hefesto'],
    t: ['Odín', 'Thor', 'Júpiter (romano)', 'Anubis', 'Ra']
  },
  {
    c: 'Faraones y gobernantes célebres del Antiguo Egipto',
    f: ['Tutankamón', 'Cleopatra VII', 'Ramsés II', 'Keops (Jufu)'],
    m: ['Akenatón (Amenofis IV)', 'Hatshepsut', 'Nefertiti (reina)'],
    d: ['Tutmosis III', 'Seti I', 'Zoser (Djoser)'],
    t: ['Anubis', 'Ra', 'Osiris', 'Imhotep (arquitecto)', 'Horus']
  },
  {
    c: 'Las Siete Maravillas del Mundo Antiguo',
    f: ['Gran Pirámide de Guiza', 'Jardines Colgantes de Babilonia', 'Estatua de Zeus en Olimpia', 'Coloso de Rodas'],
    m: ['Faro de Alejandría', 'Templo de Artemisa en Éfeso', 'Mausoleo de Halicarnaso'],
    d: ['Pirámide de Keops (única en pie)', 'Templo de Artemisa', 'Mausoleo de Mausolo'],
    t: ['Coliseo de Roma', 'Gran Muralla China', 'Taj Mahal', 'Torre de Babel', 'Partenón de Atenas']
  },
  {
    c: 'Batallas y asedios clave de la Antigüedad clásica',
    f: ['Batalla de las Termópilas', 'Batalla de Maratón', 'Batalla de Cannas', 'Batalla de Zama'],
    m: ['Batalla de Gaugamela', 'Batalla de Salamina', 'Batalla de Accio'],
    d: ['Asedio de Alesia', 'Batalla de Farsalia', 'Batalla de Queronea'],
    t: ['Batalla de Waterloo', 'Batalla de Hastings', 'Batalla de Stalingrado', 'Batalla de Poitiers', 'Batalla de Lepanto']
  },
  {
    c: 'Reyes y figuras históricas de la Persia Aqueménida',
    f: ['Ciro II el Grande', 'Darío I el Grande', 'Jerjes I', 'Artajerjes I'],
    m: ['Cambises II', 'Darío III (rival de Alejandro)', 'Bardiya'],
    d: ['Artajerjes II', 'Ciro el Joven', 'Histaspes'],
    t: ['Nabucodonosor II (Babilonia)', 'Hammurabi', 'Asurbanipal (Asiria)', 'Saladino', 'Gengis Kan']
  },
  {
    c: 'Grandes generales y estrategas militares de la Antigüedad',
    f: ['Alejandro Magno', 'Julio César', 'Aníbal Barca', 'Escipión el Africano'],
    m: ['Pirro de Epiro', 'Leónidas I de Esparta', 'Epaminondas de Tebas'],
    d: ['Milcíades', 'Temístocles', 'Filipo II de Macedonia'],
    t: ['Napoleón Bonaparte', 'Carlomagno', 'Saladino', 'Oliver Cromwell', 'Simón Bolívar']
  },
  {
    c: 'Instituciones y cargos de la República Romana',
    f: ['Senado Romano', 'Cónsul', 'Tribuno de la plebe', 'Pretor'],
    m: ['Censor', 'Edil curul', 'Dictador (magistratura)'],
    d: ['Cuestor', 'Comicios centuriados', 'Pontifex Maximus'],
    t: ['Cortes Generales', 'Parlamento', 'Dux', 'Canciller', 'Inquisición']
  },
  {
    c: 'Pueblos prerromanos que habitaron la península ibérica',
    f: ['Íberos', 'Celtas', 'Tartessos', 'Celtíberos'],
    m: ['Lusitanos', 'Cántabros', 'Astures'],
    d: ['Turdetanos', 'Vacceos', 'Vetones'],
    t: ['Visigodos (germánicos)', 'Vándalos', 'Alanos', 'Suevos', 'Francos']
  },

  // 11 - 20: Edad Media, Reinos y Cruzadas
  {
    c: 'Monarcas francos de las dinastías Merovingia y Carolingia',
    f: ['Carlomagno (Carlos el Grande)', 'Clodoveo I', 'Carlos Martel', 'Pipino el Breve'],
    m: ['Luis el Piadoso (Ludovico Pío)', 'Carlos el Calvo', 'Lotario I'],
    d: ['Dagoberto I', 'Clotario I', 'Childeberto I'],
    t: ['Guillermo el Conquistador', 'Felipe II de Francia', 'San Luis (Luis IX)', 'Enrique IV de Francia', 'Luis XIV']
  },
  {
    c: 'Reyes de Inglaterra de la dinastía Plantagenet y Normandía',
    f: ['Guillermo el Conquistador', 'Ricardo Corazón de León', 'Juan sin Tierra', 'Enrique II'],
    m: ['Eduardo I (Longshanks)', 'Eduardo III', 'Enrique III'],
    d: ['Enrique V', 'Ricardo II', 'Esteban de Blois'],
    t: ['Enrique VIII (Tudor)', 'Isabel I (Tudor)', 'Carlos I (Estuardo)', 'Victoria I (Hannover)', 'Jorge III']
  },
  {
    c: 'Líderes militares y religiosos de las Cruzadas medievales',
    f: ['Ricardo Corazón de León', 'Saladino (Salah ad-Din)', 'Godofredo de Bouillón', 'Papa Urbano II'],
    m: ['Federico I Barbarroja', 'Felipe II de Francia (Augusto)', 'Balduino IV de Jerusalén'],
    d: ['Bohemundo de Tarento', 'Raimundo IV de Tolosa', 'Reinaldo de Châtillon'],
    t: ['Juana de Arco', 'Carlomagno', 'Napoleón Bonaparte', 'Hernán Cortés', 'Guillermo Tell']
  },
  {
    c: 'Líderes y conquistadores del Imperio Mongol',
    f: ['Gengis Kan (Temüjin)', 'Kublai Kan', 'Tamerlán (Timur)', 'Subutai'],
    m: ['Ogodei Kan', 'Batu Kan (Horda de Oro)', 'Hulagu Kan'],
    d: ['Jochi', 'Chagatai Kan', 'Möngke Kan'],
    t: ['Atila el Huno', 'Mao Zedong', 'Sun Tzu', 'Emperador Meiji', 'Tokugawa Ieyasu']
  },
  {
    c: 'Grandes batallas de la Edad Media',
    f: ['Batalla de Hastings (1066)', 'Batalla de las Navas de Tolosa (1212)', 'Batalla de Poitiers / Tours (732)', 'Batalla de Agincourt (1415)'],
    m: ['Batalla de Hattin (1187)', 'Batalla de Crécy (1346)', 'Batalla de Kulikovo (1380)'],
    d: ['Batalla de Bouvines (1214)', 'Batalla de Bannockburn (1314)', 'Batalla de Yarmuk (636)'],
    t: ['Batalla de Waterloo', 'Batalla de Lepanto', 'Batalla de Trafalgar', 'Batalla de Stalingrado', 'Batalla de Austerlitz']
  },
  {
    c: 'Órdenes militares religiosas creadas en la Edad Media',
    f: ['Caballeros Templarios', 'Caballeros Hospitalarios (Orden de Malta)', 'Orden Teutónica', 'Orden de Santiago'],
    m: ['Orden de Calatrava', 'Orden de Alcántara', 'Orden de Montesa'],
    d: ['Orden de los Hermanos Livonios de la Espada', 'Orden de San Juan de Jerusalén', 'Orden de Avis'],
    t: ['Compañía de Jesús (Jesuitas)', 'Francmasonería', 'Orden de los Rosacruces', 'Opus Dei', 'Legión Extranjera']
  },
  {
    c: 'Califatales y dinastías musulmanas de al-Ándalus y Oriente',
    f: ['Omeyas (Califato de Córdoba)', 'Abasíes', 'Almorávides', 'Almohades'],
    m: ['Nazaríes (Reino de Granada)', 'Fatimíes', 'Selyúcidas'],
    d: ['Mamelucos', 'Ayubíes', 'Reinos de Taifas'],
    t: ['Otomanos (Edad Moderna)', 'Safávidas', 'Mogoles de la India', 'Sijes', 'Persas sasánidas']
  },
  {
    c: 'Pueblos germánicos y bárbaros que invadieron el Imperio Romano',
    f: ['Visigodos', 'Vándalos', 'Ostrogodos', 'Francos'],
    m: ['Suevos', 'Alanos', 'Burgundios'],
    d: ['Lombardos', 'Anglos', 'Sajones'],
    t: ['Hunos (estepa asiática)', 'Mongoles', 'Vikingos (siglo VIII en adelante)', 'Sarracenos', 'Turcos seljúcidas']
  },
  {
    c: 'Líderes y exploradores de la Era Vikinga',
    f: ['Ragnar Lodbrok', 'Erik el Rojo', 'Leif Erikson', 'Ivar el Deshuesado'],
    m: ['Harald Hardrada', 'Björn Ironside', 'Rollo de Normandía'],
    d: ['Cnut el Grande (Canuto)', 'Harald Cabellera Hermosa', 'Olaf Tryggvason'],
    t: ['Guillermo el Conquistador', 'Atila', 'Carlomagno', 'Boudica', 'Vercingétorix']
  },
  {
    c: 'Reinos cristianos medievales de la península ibérica',
    f: ['Reino de Castilla', 'Reino de Aragón', 'Reino de Navarra', 'Reino de León'],
    m: ['Reino de Portugal', 'Reino de Asturias', 'Condado de Barcelona'],
    d: ['Reino de Galicia', 'Reino de Mallorca', 'Reino de Valencia'],
    t: ['Reino Nazarí de Granada (musulmán)', 'Califato de Córdoba', 'Taifa de Zaragoza', 'Reino de Nápoles', 'Corona de Francia']
  },

  // 21 - 30: América Precolombina y Era de los Descubrimientos
  {
    c: 'Civilizaciones y culturas de la América precolombina',
    f: ['Imperio Inca', 'Imperio Azteca (Mexica)', 'Civilización Maya', 'Cultura Tolteca'],
    m: ['Cultura Olmeca', 'Cultura Zapoteca', 'Confederación Muisca (Chibcha)'],
    d: ['Cultura Nazca', 'Cultura Chimú', 'Cultura Tiahuanaco'],
    t: ['Sioux (norteamericanos)', 'Apaches', 'Comanches', 'Cherokees', 'Gauchos']
  },
  {
    c: 'Gobernantes supremos del Imperio Azteca (Huey Tlatoanis)',
    f: ['Moctezuma II (Xocoyotzin)', 'Cuauhtémoc', 'Moctezuma I', 'Cuitláhuac'],
    m: ['Itzcóatl', 'Axayácatl', 'Ahuitzotl'],
    d: ['Acamapichtli', 'Huitzilíhuitl', 'Chimalpopoca'],
    t: ['Atahualpa (Inca)', 'Huáscar (Inca)', 'Pachacútec (Inca)', 'Tupac Amaru', 'Lautaro']
  },
  {
    c: 'Sapas Incas o soberanos del Tahuantinsuyo (Imperio Inca)',
    f: ['Atahualpa', 'Pachacútec', 'Huáscar', 'Manco Cápac'],
    m: ['Huayna Cápac', 'Túpac Yupanqui', 'Manco Inca'],
    d: ['Túpac Amaru I', 'Sinchi Roca', 'Mayta Cápac'],
    t: ['Moctezuma II', 'Cuauhtémoc', 'Nezahualcóyotl', 'Tecún Umán', 'Lautaro']
  },
  {
    c: 'Navegantes y exploradores de la Era de los Descubrimientos (siglos XV-XVI)',
    f: ['Cristóbal Colón', 'Juan Sebastián Elcano', 'Fernando de Magallanes', 'Vasco da Gama'],
    m: ['Américo Vespucio', 'Vasco Núñez de Balboa', 'Bartolomé Díaz'],
    d: ['Pedro Álvares Cabral', 'Juan Ponce de León', 'Francisco de Orellana'],
    t: ['James Cook (siglo XVIII)', 'Marco Polo (siglo XIII)', 'David Livingstone (siglo XIX)', 'Roald Amundsen', 'Charles Darwin']
  },
  {
    c: 'Conquistadores y adelantados españoles en el continente americano',
    f: ['Hernán Cortés', 'Francisco Pizarro', 'Diego de Almagro', 'Pedro de Valdivia'],
    m: ['Álvar Núñez Cabeza de Vaca', 'Hernando de Soto', 'Francisco Vázquez de Coronado'],
    d: ['Gonzalo Jiménez de Quesada', 'Alonso de Ojeda', 'Pedro de Alvarado'],
    t: ['Cristóbal Colón', 'Fernando el Católico', 'Carlos I de España', 'Felipe II', 'Bartolomé de las Casas']
  },
  {
    c: 'Ciudades mayas de la época clásica y posclásica',
    f: ['Chichén Itzá', 'Tikal', 'Palenque', 'Tulum'],
    m: ['Copán', 'Calakmul', 'Uxmal'],
    d: ['Yaxchilán', 'Bonampak', 'Coba'],
    t: ['Tenochtitlan (azteca)', 'Teotihuacán', 'Machu Picchu (inca)', 'Cuzco (inca)', 'Monte Albán']
  },
  {
    c: 'Capitulaciones, bulas y tratados marítimos de los siglos XV y XVI',
    f: ['Tratado de Tordesillas (1494)', 'Capitulaciones de Santa Fe (1492)', 'Bulas Alejandrinas (Inter Caetera)', 'Tratado de Zaragoza (1529)'],
    m: ['Tratado de Alcáçovas (1479)', 'Capitulación de Toledo (Pizarro)', 'Leyes de Burgos (1512)'],
    d: ['Leyes Nuevas (1542)', 'Ordenanzas de Alfaro', 'Capitulación de Valladolid'],
    t: ['Tratado de Versalles', 'Paz de Westfalia', 'Pacto de Varsovia', 'Tratado de Utrecht', 'Conferencia de Yalta']
  },
  {
    c: 'Productos agrícolas originarios de América introducidos en Europa tras 1492',
    f: ['Patata (papa)', 'Tomate', 'Maíz', 'Cacao (chocolate)'],
    m: ['Tabaco', 'Pimiento / Chile', 'Calabaza americana'],
    d: ['Vainilla', 'Mandioca (yuca)', 'Cacahuete (maní)'],
    t: ['Trigo (Eurasia)', 'Arroz (Asia)', 'Caña de azúcar (Asia)', 'Café (África)', 'Vid / Uva vinífera']
  },
  {
    c: 'Grandes virreinatos del Imperio Español en América',
    f: ['Virreinato de Nueva España', 'Virreinato del Perú', 'Virreinato del Río de la Plata', 'Virreinato de Nueva Granada'],
    m: ['Capitanía General de Guatemala', 'Capitanía General de Venezuela', 'Capitanía General de Chile'],
    d: ['Capitanía General de Cuba', 'Capitanía General de Puerto Rico', 'Real Audiencia de Charcas'],
    t: ['Virreinato de Brasil (portugués)', 'Trece Colonias (británicas)', 'Luisiana francesa', 'Nueva Francia', 'Nueva Ámsterdam']
  },
  {
    c: 'Ciudades sagradas y yacimientos incas en los Andes',
    f: ['Machu Picchu', 'Cuzco', 'Sacsayhuamán', 'Ollantaytambo'],
    m: ['Pisac', 'Choquequirao', 'Coricancha'],
    d: ['Moray', 'Tambomachay', 'Vilcashuamán'],
    t: ['Teotihuacán', 'Chichén Itzá', 'Palenque', 'Tikal', 'Monte Albán']
  },

  // 31 - 40: Renacimiento, Monarquías y Siglo de Oro
  {
    c: 'Monarcas de la dinastía Tudor en Inglaterra',
    f: ['Enrique VIII', 'Isabel I', 'María I (Bloody Mary)', 'Enrique VII'],
    m: ['Eduardo VI', 'Lady Jane Grey (reina de los 9 días)', 'Margarita Tudor'],
    d: ['Arturo Tudor (Príncipe de Gales)', 'Catalina Tudor', 'María Tudor (Reina de Francia)'],
    t: ['Jacobo I (Estuardo)', 'Carlos I (Estuardo)', 'Guillermo el Conquistador', 'Victoria I', 'Jorge III']
  },
  {
    c: 'Reyes de España de la Casa de Austria (Habsburgo)',
    f: ['Carlos I (V del Sacro Imperio)', 'Felipe II', 'Felipe III', 'Felipe IV'],
    m: ['Carlos II (El Hechizado)', 'Felipe I el Hermoso (consorte)', 'Juana I de Castilla (La Loca)'],
    d: ['Don Juan de Austria (hijo ilegítimo)', 'Mariana de Austria (regente)', 'Margarita de Austria'],
    t: ['Felipe V (Borbón)', 'Carlos III (Borbón)', 'Fernando VII (Borbón)', 'Amadeo I (Saboya)', 'Alfonso XII']
  },
  {
    c: 'Pintores y artistas universales del Renacimiento italiano',
    f: ['Leonardo da Vinci', 'Miguel Ángel Buonarroti', 'Rafael Sanzio', 'Sandro Botticelli'],
    m: ['Tiziano Vecellio', 'Donatello', 'Fra Angelico'],
    d: ['Piero della Francesca', 'Andrea Mantegna', 'Tintoretto'],
    t: ['Pablo Picasso', 'Diego Velázquez', 'Salvador Dalí', 'Vincent van Gogh', 'Claude Monet']
  },
  {
    c: 'Escultores y pintores del Siglo de Oro español',
    f: ['Diego Velázquez', 'El Greco', 'Bartolomé Esteban Murillo', 'Francisco de Zurbarán'],
    m: ['José de Ribera (El Españoleto)', 'Alonso Cano', 'Juan Martínez Montañés'],
    d: ['Pedro de Mena', 'Gregorio Fernández', 'Juan de Valdés Leal'],
    t: ['Francisco de Goya (siglo XVIII-XIX)', 'Pablo Picasso', 'Salvador Dalí', 'Joan Miró', 'Joaquín Sorolla']
  },
  {
    c: 'Grandes dramaturgos y escritores del Siglo de Oro español',
    f: ['Miguel de Cervantes', 'Lope de Vega', 'Francisco de Quevedo', 'Pedro Calderón de la Barca'],
    m: ['Luis de Góngora', 'Tirso de Molina', 'Garcilaso de la Vega'],
    d: ['Baltasar Gracián', 'Juan Ruiz de Alarcón', 'Fray Luis de León'],
    t: ['Federico García Lorca', 'Gustavo Adolfo Bécquer', 'Benito Pérez Galdós', 'Antonio Machado', 'Miguel de Unamuno']
  },
  {
    c: 'Científicos y astrónomos de la Revolución Científica (siglos XVI-XVII)',
    f: ['Galileo Galilei', 'Isaac Newton', 'Nicolás Copérnico', 'Johannes Kepler'],
    m: ['René Descartes', 'Francis Bacon', 'Robert Boyle'],
    d: ['Tycho Brahe', 'Christiaan Huygens', 'William Harvey'],
    t: ['Albert Einstein (siglo XX)', 'Charles Darwin (siglo XIX)', 'Marie Curie', 'Thomas Edison', 'Stephen Hawking']
  },
  {
    c: 'Esposas del rey Enrique VIII de Inglaterra',
    f: ['Catalina de Aragón', 'Ana Bolena', 'Juana Seymour', 'Catalina Parr'],
    m: ['Ana de Cléveris', 'Catalina Howard', 'María Tudor (su hija)'],
    d: ['Catalina de Aragón (primera)', 'Ana Bolena (decapitada)', 'Catalina Howard (decapitada)'],
    t: ['María Estuardo', 'Isabel I de Inglaterra', 'María Antonieta', 'Leonor de Aquitania', 'Juana la Loca']
  },
  {
    c: 'Monarcas absolutistas de la dinastía Borbón en Francia',
    f: ['Luis XIV (El Rey Sol)', 'Luis XVI (guillotinado)', 'Luis XV', 'Enrique IV (primer Borbón)'],
    m: ['Luis XIII', 'Luis XVIII (Restauración)', 'Carlos X'],
    d: ['Felipe I de Orleans', 'Luis de Francia (El Gran Delfín)', 'Cardenal Mazarino (regente)'],
    t: ['Napoleón Bonaparte', 'Carlomagno', 'Felipe Augusto', 'Francisco I (Valois)', 'Carlos IX']
  },
  {
    c: 'Personajes históricos de la Reforma Protestante (siglo XVI)',
    f: ['Martín Lutero', 'Juan Calvino', 'Enrique VIII', 'Ulrico Zuinglio'],
    m: ['Felipe Melanchthon', 'John Knox', 'Thomas Müntzer'],
    d: ['Erasmo de Róterdam (humanista crítico)', 'Jan Hus (precursor)', 'William Tyndale'],
    t: ['Ignacio de Loyola (Contrarreforma)', 'Santa Teresa de Jesús', 'Papa Paulo III', 'Tomás de Torquemada', 'Felipe II']
  },
  {
    c: 'Conflictos bélicos y tratados de los siglos XVI y XVII',
    f: ['Guerra de los Treinta Años', 'Paz de Westfalia (1648)', 'Batalla de Lepanto (1571)', 'Armada Invencible (1588)'],
    m: ['Guerra de los Ochenta Años (Flandes)', 'Paz de Augsburgo (1555)', 'Tratado de los Pirineos (1659)'],
    d: ['Paz de Cateau-Cambrésis (1559)', 'Guerra de las Comunidades de Castilla', 'Edicto de Nantes'],
    t: ['Guerra de los Cien Años', 'Tratado de Versalles', 'Batalla de Waterloo', 'Guerra de Secesión', 'Batalla de Trafalgar']
  },

  // 41 - 50: Revoluciones, Ilustración y Era Napoleónica
  {
    c: 'Filósofos pensadores del movimiento de la Ilustración (siglo XVIII)',
    f: ['Voltaire', 'Jean-Jacques Rousseau', 'Montesquieu', 'Denis Diderot'],
    m: ['John Locke', 'David Hume', 'Immanuel Kant'],
    d: ['Jean le Rond d\'Alembert', 'Condorcet', 'Barón de Holbach'],
    t: ['Karl Marx (siglo XIX)', 'Friedrich Nietzsche (siglo XIX)', 'Santo Tomás de Aquino', 'Platón', 'Nicolás Maquiavelo']
  },
  {
    c: 'Padres Fundadores de los Estados Unidos (Founding Fathers)',
    f: ['George Washington', 'Thomas Jefferson', 'Benjamin Franklin', 'John Adams'],
    m: ['Alexander Hamilton', 'James Madison', 'John Jay'],
    d: ['Thomas Paine', 'Samuel Adams', 'Patrick Henry'],
    t: ['Abraham Lincoln (siglo XIX)', 'Theodore Roosevelt', 'Franklin D. Roosevelt', 'John F. Kennedy', 'Martin Luther King']
  },
  {
    c: 'Líderes y figuras protagonistas de la Revolución Francesa (1789-1799)',
    f: ['Maximilien Robespierre', 'Luis XVI', 'María Antonieta', 'Jean-Paul Marat'],
    m: ['Georges Danton', 'Marqués de La Fayette', 'Louis de Saint-Just'],
    d: ['Jacques Necker', 'Camille Desmoulins', 'Emmanuel-Joseph Sieyès'],
    t: ['Napoleón III', 'Otto von Bismarck', 'Cavour', 'Oliver Cromwell', 'Giuseppe Garibaldi']
  },
  {
    c: 'Grandes batallas campales y navales de las Guerras Napoleónicas',
    f: ['Batalla de Waterloo (1815)', 'Batalla de Austerlitz (1805)', 'Batalla de Trafalgar (1805)', 'Batalla de Leipzig (1813)'],
    m: ['Batalla de Borodino (1812)', 'Batalla de Jena (1806)', 'Batalla de Bailén (1808)'],
    d: ['Batalla de Marengo (1800)', 'Batalla de Wagram (1809)', 'Batalla de Friedland (1807)'],
    t: ['Batalla de Stalingrado', 'Batalla de Gettysburg', 'Batalla de Verdún', 'Batalla de las Termópilas', 'Batalla de Hastings']
  },
  {
    c: 'Líderes militares y políticos de las Guerras Napoleónicas',
    f: ['Napoleón Bonaparte', 'Duque de Wellington (Arthur Wellesley)', 'Horatio Nelson', 'Zar Alejandro I'],
    m: ['Mariscal Michel Ney', 'Mariscal Joachim Murat', 'Gebhard Leberecht von Blücher'],
    d: ['Mijaíl Kutúzov', 'Klemens von Metternich', 'Mariscal Louis-Nicolas Davout'],
    t: ['Otto von Bismarck', 'Winston Churchill', 'Abraham Lincoln', 'George Patton', 'Káiser Guillermo II']
  },
  {
    c: 'Libertadores y próceres de la Independencia Hispanoamericana',
    f: ['Simón Bolívar', 'José de San Martín', 'Miguel Hidalgo y Costilla', 'Bernardo O\'Higgins'],
    m: ['Antonio José de Sucre', 'José María Morelos', 'Francisco de Miranda'],
    d: ['Manuel Belgrano', 'José Gervasio Artigas', 'Andrés de Santa Cruz'],
    t: ['Che Guevara (siglo XX)', 'Fidel Castro', 'Hernán Cortés', 'Francisco Pizarro', 'Emiliano Zapata']
  },
  {
    c: 'Inventos y avances clave de la Primera Revolución Industrial (siglo XVIII)',
    f: ['Máquina de vapor de James Watt', 'Hiladora Spinning Jenny', 'Locomotora de vapor de Stephenson', 'Telar mecánico de Cartwright'],
    m: ['Lanzadera volante de Kay', 'Barco de vapor de Robert Fulton', 'Bomba de agua de Newcomen'],
    d: ['Pudelado de hierro de Henry Cort', 'Hiladora continua de Arkwright', 'Desmotadora de algodón de Eli Whitney'],
    t: ['Bombilla eléctrica de Edison', 'Teléfono de Bell', 'Internet', 'Motor de combustión interna', 'Computadora electrónica']
  },
  {
    c: 'Constituciones históricas de España',
    f: ['Constitución de Cádiz de 1812 (La Pepa)', 'Constitución Española de 1978', 'Constitución de la República de 1931', 'Constitución de 1876 (Restauración)'],
    m: ['Constitución de 1845', 'Constitución de 1869 (Sexenio Democrático)', 'Constitución de 1837'],
    d: ['Estatuto Real de 1834', 'Estatuto de Bayona de 1808', 'Constitución non nata de 1856'],
    t: ['Constitución de los Estados Unidos', 'Declaración de Derechos de Virginia', 'Carta Magna inglesa', 'Constitución francesa de 1791', 'Código Napoleónico']
  },
  {
    c: 'Acontecimientos decisivos de la Guerra de la Independencia Española (1808-1814)',
    f: ['Levantamiento del 2 de Mayo en Madrid', 'Batalla de Bailén', 'Sitio de Zaragoza', 'Constitución de Cádiz de 1812'],
    m: ['Batalla de Vitoria', 'Sitio de Gerona', 'Batalla de Arapiles (Salamanca)'],
    d: ['Batalla de Somosierra', 'Batalla de Talavera', 'Tratado de Valençay (1813)'],
    t: ['Guerra Civil Española (1936)', 'Desastre del 98 en Cuba', 'Semana Trágica de Barcelona', 'Guerra de Sucesión Española', 'Guerra de la Oreja de Jenkins']
  },
  {
    c: 'Grandes compositores musicales del Clasicismo y primer Romanticismo',
    f: ['Wolfgang Amadeus Mozart', 'Ludwig van Beethoven', 'Franz Joseph Haydn', 'Franz Schubert'],
    m: ['Frédéric Chopin', 'Johann Sebastian Bach (Barroco puente)', 'Felix Mendelssohn'],
    d: ['Robert Schumann', 'Gioachino Rossini', 'Carl Maria von Weber'],
    t: ['Igor Stravinsky (siglo XX)', 'John Williams', 'Miles Davis', 'Freddie Mercury', 'Bob Dylan']
  },

  // 51 - 60: Siglo XIX, Unificaciones y Expansión Imperial
  {
    c: 'Artífices de la Unificación de Italia (Il Risorgimento)',
    f: ['Giuseppe Garibaldi', 'Conde de Cavour (Camillo Benso)', 'Víctor Manuel II', 'Giuseppe Mazzini'],
    m: ['Expedición de los Mil', 'Víctor Manuel II de Saboya', 'Mazzini (Joven Italia)'],
    d: ['Urbano Rattazzi', 'Massimo d\'Azeglio', 'Bettino Ricasoli'],
    t: ['Benito Mussolini (siglo XX)', 'Julio César', 'Napoleón Bonaparte', 'Maquiavelo', 'César Borgia']
  },
  {
    c: 'Artífices y protagonistas de la Unificación de Alemania (1871)',
    f: ['Otto von Bismarck (Canciller de Hierro)', 'Káiser Guillermo I', 'Helmuth von Moltke (el Viejo)', 'Albrecht von Roon'],
    m: ['Guerra Franco-Prusiana (1870)', 'Guerra de las Siete Semanas (1866)', 'Proclamación en Versalles'],
    d: ['Confederación del Norte de Alemania', 'Guerra de los Ducados (1864)', 'Káiser Federico III'],
    t: ['Adolf Hitler (siglo XX)', 'Káiser Guillermo II', 'Paul von Hindenburg', 'Karl Marx', 'Federico II el Grande']
  },
  {
    c: 'Figuras de la Guerra de Secesión de Estados Unidos (1861-1865)',
    f: ['Abraham Lincoln', 'General Ulysses S. Grant', 'General Robert E. Lee', 'General Stonewall Jackson'],
    m: ['Jefferson Davis (presidente confederado)', 'General William Tecumseh Sherman', 'General George Meade'],
    d: ['General J.E.B. Stuart', 'General George McClellan', 'General James Longstreet'],
    t: ['George Washington', 'Thomas Jefferson', 'Dwight D. Eisenhower', 'George Patton', 'Alexander Hamilton']
  },
  {
    c: 'Grandes batallas de la Guerra de Secesión Americana',
    f: ['Batalla de Gettysburg', 'Batalla de Fort Sumter', 'Batalla de Antietam', 'Batalla de Bull Run (Manassas)'],
    m: ['Batalla de Shiloh', 'Sitio de Vicksburg', 'Batalla de Chancellorsville'],
    d: ['Batalla de Fredericksburg', 'Batalla de Cold Harbor', 'Batalla de Appomattox Court House'],
    t: ['Batalla de Bunker Hill', 'Batalla de Yorktown', 'Batalla de Midway', 'Batalla de Pearl Harbor', 'Batalla de Normandía']
  },
  {
    c: 'Reinas y monarcas que gobernaron el Imperio Británico en el siglo XIX y XX',
    f: ['Reina Victoria I (1837-1901)', 'Reina Isabel II (1952-2022)', 'Rey Jorge VI', 'Rey Jorge V'],
    m: ['Rey Eduardo VII', 'Rey Eduardo VIII (abdicó)', 'Reina Isabel (Reina Madre)'],
    d: ['Guillermo IV (antecesor de Victoria)', 'Príncipe Alberto de Sajonia-Coburgo', 'Reina María de Teck'],
    t: ['Isabel I Tudor (siglo XVI)', 'María I Tudor', 'Ana Estuardo (siglo XVIII)', 'María Antonieta', 'Juana de Arco']
  },
  {
    c: 'Presidentes de los Estados Unidos asesinados durante su mandato',
    f: ['Abraham Lincoln (1865)', 'John F. Kennedy (1963)', 'James A. Garfield (1881)', 'William McKinley (1901)'],
    m: ['Lincoln (Teatro Ford)', 'Kennedy (Dallas)', 'McKinley (Búfalo)'],
    d: ['Garfield (estación de Washington)', 'John Wilkes Booth (asesino)', 'Lee Harvey Oswald (acusado)'],
    t: ['Theodore Roosevelt (sobrevivió atentado)', 'Ronald Reagan (sobrevivió atentado)', 'Franklin D. Roosevelt', 'Richard Nixon', 'Dwight D. Eisenhower']
  },
  {
    c: 'Guerras del siglo XIX en el panorama internacional',
    f: ['Guerras Napoleónicas', 'Guerra de Secesión estadounidense', 'Guerra Franco-Prusiana (1870)', 'Guerra de Crimea (1853-1856)'],
    m: ['Guerras Carlistas en España', 'Guerra Hispano-Estadounidense (1898)', 'Guerra de la Triple Alianza'],
    d: ['Guerra del Pacífico (Chile vs Perú/Bolivia)', 'Guerra de los Bóeres', 'Guerra del Opio en China'],
    t: ['Primera Guerra Mundial (siglo XX)', 'Segunda Guerra Mundial', 'Guerra de Vietnam', 'Guerra de Corea', 'Guerra de los Treinta Años']
  },
  {
    c: 'Acontecimientos del Desastre del 98 en el Imperio Español',
    f: ['Hundimiento del acorazado Maine', 'Guerra de Independencia de Cuba', 'Batalla de Cavite (Filipinas)', 'Tratado de París (1898)'],
    m: ['Batalla naval de Santiago de Cuba', 'Pérdida de Puerto Rico', 'Los Últimos de Filipinas (Sitio de Baler)'],
    d: ['Almirante Pascual Cervera', 'Grito de Baire (Cuba)', 'General Valeriano Weyler'],
    t: ['Guerra de Marruecos (Annual 1921)', 'Toma de Perejil', 'Pérdida de Gibraltar (1704)', 'Batalla de Lepanto', 'Guerra Civil Española']
  },
  {
    c: 'Científicos y teóricos del pensamiento del siglo XIX',
    f: ['Charles Darwin (evolución)', 'Karl Marx (socialismo científico)', 'Louis Pasteur (microbiología)', 'Gregor Mendel (genética)'],
    m: ['Friedrich Nietzsche (filosofía)', 'Michael Faraday (electromagnetismo)', 'James Clerk Maxwell (física)'],
    d: ['Dmitri Mendeléyev (tabla periódica)', 'Sigmund Freud (psicoanálisis temprano)', 'John Stuart Mill (utilitarismo)'],
    t: ['Albert Einstein (siglo XX)', 'Isaac Newton (siglo XVII)', 'René Descartes', 'Galileo Galilei', 'Stephen Hawking']
  },
  {
    c: 'Emperadores y zares de la dinastía Románov en Rusia (siglos XVIII-XX)',
    f: ['Nicolás II (último zar)', 'Pedro I el Grande', 'Catalina II la Grande', 'Alejandro II (el Libertador)'],
    m: ['Alejandro I (vencedor de Napoleón)', 'Nicolás I', 'Alejandro III'],
    d: ['Zarevich Alekséi', 'Pablo I', 'Iván VI'],
    t: ['Iván el Terrible (dinastía Rúrik)', 'Vladimir Lenin (soviético)', 'Iósif Stalin', 'León Trotski', 'Mijaíl Gorbachov']
  },

  // 61 - 70: Primera Guerra Mundial y Período de Entreguerras
  {
    c: 'Potencias aliadas (Triple Entente y asociados) en la Primera Guerra Mundial',
    f: ['Francia', 'Reino Unido', 'Imperio Ruso', 'Estados Unidos (1917)'],
    m: ['Reino de Italia (desde 1915)', 'Bélgica', 'Reino de Serbia'],
    d: ['Japón', 'Rumanía', 'Grecia'],
    t: ['Imperio Alemán (Potencias Centrales)', 'Imperio Austrohúngaro', 'Imperio Otomano', 'Bulgaria', 'España (neutral)']
  },
  {
    c: 'Potencias Centrales de la Primera Guerra Mundial',
    f: ['Imperio Alemán', 'Imperio Austrohúngaro', 'Imperio Otomano', 'Reino de Bulgaria'],
    m: ['Káiser Guillermo II', 'Emperador Francisco José I', 'Sultán Mehmed V'],
    d: ['Káiser Carlos I de Austria', 'Enver Pachá', 'General Paul von Hindenburg'],
    t: ['Reino Unido', 'Francia', 'Imperio Ruso', 'Italia', 'Estados Unidos']
  },
  {
    c: 'Grandes batallas terrestres y navales de la Primera Guerra Mundial',
    f: ['Batalla de Verdún (1916)', 'Batalla del Somme (1916)', 'Batalla de Galípoli (1915)', 'Batalla de Jutlandia (naval 1916)'],
    m: ['Primera Batalla del Marne (1914)', 'Batalla de Tannenberg (1914)', 'Batalla de Passchendaele (Ipres)'],
    d: ['Batalla de Caporetto (1917)', 'Batalla de Galitzia', 'Ofensiva de Brusílov'],
    t: ['Batalla de Stalingrado', 'Batalla de Midway', 'Batalla de El Alamein', 'Batalla de Normandía', 'Batalla de Waterloo']
  },
  {
    c: 'Líderes y gobernantes durante la Primera Guerra Mundial (1914-1918)',
    f: ['Káiser Guillermo II (Alemania)', 'Zar Nicolás II (Rusia)', 'Woodrow Wilson (EEUU)', 'David Lloyd George (Reino Unido)'],
    m: ['Georges Clemenceau (Francia)', 'Francisco José I (Austria-Hungría)', 'Mariscal Philippe Pétain (héroe de Verdún)'],
    d: ['Vittorio Emanuele Orlando (Italia)', 'General Ferdinand Foch', 'Mariscal Douglas Haig'],
    t: ['Winston Churchill (como Primer Ministro en IIGM)', 'Franklin D. Roosevelt', 'Adolf Hitler', 'Iósif Stalin', 'Harry S. Truman']
  },
  {
    c: 'Tratados de paz firmados al término de la Primera Guerra Mundial (1919-1920)',
    f: ['Tratado de Versalles (con Alemania)', 'Tratado de Saint-Germain (con Austria)', 'Tratado de Trianón (con Hungría)', 'Tratado de Sèvres (con el Imperio Otomano)'],
    m: ['Tratado de Neuilly (con Bulgaria)', 'Tratado de Lausana (revisión con Turquía)', 'Creación de la Sociedad de Naciones'],
    d: ['Pacto de Londres de 1915', 'Tratado de Brest-Litovsk (Rusia-Alemania 1918)', 'Armisticio del 11 de Noviembre'],
    t: ['Paz de Westfalia', 'Tratado de Utrecht', 'Conferencia de Yalta', 'Pacto de Varsovia', 'Tratado de Tordesillas']
  },
  {
    c: 'Líderes y dirigentes de la Revolución Rusa y nacimiento de la URSS (1917)',
    f: ['Vladimir Lenin', 'León Trotski', 'Iósif Stalin', 'Zar Nicolás II'],
    m: ['Aleksandr Kérenski', 'Félix Dzerzhinski (Checa)', 'Lev Kámenev'],
    d: ['Grigori Zinóviev', 'Nikolái Bujarin', 'Yákov Sverdlov'],
    t: ['Mijaíl Gorbachov (final de la URSS)', 'Nikita Jrushchov', 'Leonid Brézhnev', 'Boris Yeltsin', 'Dmitri Medvédev']
  },
  {
    c: 'Acontecimientos del Crack de 1929 y la Gran Depresión económica',
    f: ['Jueves Negro en Wall Street', 'Martes Negro (29 de octubre de 1929)', 'Desempleo masivo en EEUU', 'New Deal de Franklin D. Roosevelt'],
    m: ['Quiebra bancaria generalizada', 'Dust Bowl (tormentas de polvo)', 'Caída del patrón oro'],
    d: ['Herbert Hoover (presidente derrotado)', 'Bolsa de Valores de Nueva York (NYSE)', 'Ley Glass-Steagall de 1933'],
    t: ['Plan Marshall (1947)', 'Creación del Euro (1999)', 'Crisis de las hipotecas subprime (2008)', 'Hiperinflación de Weimar (1923 previa)', 'Acuerdos de Bretton Woods']
  },
  {
    c: 'Personajes históricos del período de entreguerras en Europa (1919-1939)',
    f: ['Benito Mussolini (Fascismo en Italia)', 'Adolf Hitler (Nazismo en Alemania)', 'Francisco Franco (Guerra Civil)', 'Mustafa Kemal Atatürk (Turquía)'],
    m: ['Neville Chamberlain (apaciguamiento)', 'Paul von Hindenburg', 'Édouard Daladier'],
    d: ['Galeazzo Ciano', 'Engelbert Dollfuss (Austria)', 'Józef Piłsudski (Polonia)'],
    t: ['Winston Churchill (gabinete de guerra 1940)', 'Charles de Gaulle (Londres 1940)', 'Harry S. Truman', 'Dwight Eisenhower', 'Clement Attlee']
  },
  {
    c: 'Nuevas tecnologías bélicas empleadas a gran escala en la Primera Guerra Mundial',
    f: ['Gases venenosos (gas mostaza / cloro)', 'Tanques blindados de combate (Mark I)', 'Aeronaves y cazas de combate', 'Submarinos militares (U-Boot)'],
    m: ['Ametralladoras pesadas (Maxim / Vickers)', 'Lanzallamas portátiles', 'Trincheras fortificadas con alambradas'],
    d: ['Dirigibles zepelín para bombardeo', 'Sonares primitivos (hidrófonos)', 'Cascos de acero reglamentarios (Brodie / Adrian)'],
    t: ['Bomba atómica de fisión', 'Misiles balísticos V2', 'Aviones a reacción supersónicos', 'Satélites de radar', 'Fusiles de asalto Kalashnikov']
  },
  {
    c: 'Pacto y crisis previas al estallido de la Segunda Guerra Mundial (1938-1939)',
    f: ['Pacto Ribbentrop-Mólotov', 'Acuerdos de Múnich (1938)', 'Anexión de Austria (Anschluss)', 'Invasión de Checoslovaquia'],
    m: ['Crisis de los Sudetes', 'Pacto de Acero (Alemania-Italia)', 'Reclamación del Corredor polaco (Danzig)'],
    d: ['Ocupación del territorio de Memel', 'Incidente de Gleiwitz (operación de bandera falsa)', 'Conferencia de Stresa'],
    t: ['Conferencia de Yalta (1945)', 'Conferencia de Potsdam', 'Juicios de Núremberg', 'Plan Barbarroja (1941)', 'Ataque a Pearl Harbor']
  },

  // 71 - 80: Segunda Guerra Mundial y Holocausto
  {
    c: 'Países del bando de los Aliados en la Segunda Guerra Mundial',
    f: ['Estados Unidos', 'Reino Unido', 'Unión Soviética', 'Francia (Francia Libre)'],
    m: ['Canadá', 'Australia', 'Polonia'],
    d: ['República de China', 'Brasil (FEB)', 'Noruega'],
    t: ['Alemania nazi', 'Imperio del Japón', 'Reino de Italia (Eje)', 'Hungría', 'Rumanía (hasta 1944)']
  },
  {
    c: 'Países del bando del Eje en la Segunda Guerra Mundial',
    f: ['Alemania nazi', 'Imperio del Japón', 'Reino de Italia (hasta 1943)', 'Reino de Hungría'],
    m: ['Reino de Rumanía', 'Reino de Bulgaria', 'Finlandia (cobeligerante contra URSS)'],
    d: ['Tailandia', 'Estado Independiente de Croacia (Ustacha)', 'República Eslovaca'],
    t: ['España (no beligerante formal)', 'Turquía (neutral)', 'Suecia (neutral)', 'Suiza (neutral)', 'Portugal (neutral)']
  },
  {
    c: 'Grandes batallas decisivas de la Segunda Guerra Mundial',
    f: ['Batalla de Stalingrado (1942-1943)', 'Desembarco de Normandía (Día D, 1944)', 'Batalla de Midway (naval 1942)', 'Batalla de El Alamein (1942)'],
    m: ['Batalla de Kursk (tanques 1943)', 'Batalla de las Ardenas (1944)', 'Batalla de Berlín (1945)'],
    d: ['Batalla de Guadalcanal', 'Batalla de Iwo Jima', 'Batalla de Montecassino'],
    t: ['Batalla de Verdún', 'Batalla de Waterloo', 'Batalla de Gettysburg', 'Batalla de Galípoli', 'Batalla de Trafalgar']
  },
  {
    c: 'Líderes de las potencias beligerantes en la Segunda Guerra Mundial (Los Tres Grandes y rivales)',
    f: ['Winston Churchill', 'Franklin D. Roosevelt', 'Iósif Stalin', 'Adolf Hitler'],
    m: ['Benito Mussolini', 'Emperador Hirohito', 'Harry S. Truman'],
    d: ['Charles de Gaulle', 'Hideki Tojo', 'Chiang Kai-shek'],
    t: ['Woodrow Wilson (Primera Guerra Mundial)', 'Káiser Guillermo II', 'Theodore Roosevelt', 'Vladimir Lenin', 'Neville Chamberlain']
  },
  {
    c: 'Generales y comandantes militares destacados de la Segunda Guerra Mundial',
    f: ['Dwight D. Eisenhower', 'George Patton', 'Erwin Rommel (El Zorro del Desierto)', 'Bernard Montgomery'],
    m: ['Georgy Zhúkov', 'Douglas MacArthur', 'Chester W. Nimitz'],
    d: ['Heinz Guderian', 'Erich von Manstein', 'Vasili Chuikov'],
    t: ['General Robert E. Lee', 'Ulysses S. Grant', 'Duque de Wellington', 'Mariscal Ney', 'General Custer']
  },
  {
    c: 'Campos de concentración y exterminio del régimen nazi',
    f: ['Auschwitz-Birkenau', 'Treblinka', 'Dachau', 'Sobibor'],
    m: ['Mauthausen (campo de los españoles)', 'Buchenwald', 'Chelmno'],
    d: ['Belzec', 'Majdanek', 'Bergen-Belsen'],
    t: ['Gulag de Kolimá (soviético)', 'Prisión de Spandau', 'Guantánamo', 'Alcatraz', 'Torre de Londres']
  },
  {
    c: 'Conferencias cumbre de los Aliados para planear el final de la Segunda Guerra Mundial',
    f: ['Conferencia de Yalta (1945)', 'Conferencia de Teherán (1943)', 'Conferencia de Potsdam (1945)', 'Conferencia de Casablanca (1943)'],
    m: ['Carta del Atlántico (1941)', 'Conferencia de El Cairo', 'Conferencia de Dumbarton Oaks'],
    d: ['Conferencia de San Francisco (creación de la ONU)', 'Conferencia de Quebec', 'Conferencia de Moscú (1944)'],
    t: ['Tratado de Versalles (1919)', 'Pacto de Varsovia', 'Acuerdos de Camp David', 'Tratado de Tordesillas', 'Paz de Westfalia']
  },
  {
    c: 'Operaciones militares aeronavales y terrestres célebres de la Segunda Guerra Mundial',
    f: ['Operación Overlord (Desembarco de Normandía)', 'Operación Barbarroja (Invasión de la URSS)', 'Operación Market Garden', 'Ataque a Pearl Harbor (Operación Z)'],
    m: ['Operación Antorcha (Norte de África)', 'Operación Ciudadela (Kursk)', 'Operación Bagration (contraataque soviético)'],
    d: ['Operación Urano (cerco de Stalingrado)', 'Operación Dinamo (evacuación de Dunkerque)', 'Operación Husky (invasión de Sicilia)'],
    t: ['Operación Tormenta del Desierto (1991)', 'Operación Rolling Thunder (Vietnam)', 'Operación Causa Justa (Panamá)', 'Crisis de los Misiles', 'Invasión de Bahía de Cochinos']
  },
  {
    c: 'Científicos del Proyecto Manhattan que desarrollaron la bomba atómica',
    f: ['J. Robert Oppenheimer', 'Enrico Fermi', 'Richard Feynman', 'Niels Bohr'],
    m: ['Leo Szilard', 'Hans Bethe', 'Edward Teller'],
    d: ['Ernest Lawrence', 'Klaus Fuchs (espía)', 'Isidor Isaac Rabi'],
    t: ['Albert Einstein (firmó carta, no trabajó en Los Álamos)', 'Werner Heisenberg (proyecto alemán)', 'Marie Curie', 'Max Planck', 'Nikola Tesla']
  },
  {
    c: 'Juicios y tribunales de posguerra tras la Segunda Guerra Mundial',
    f: ['Juicios de Núremberg (Alemania)', 'Tribunal Militar Internacional para el Lejano Oriente (Tokio)', 'Juicio de los médicos de Núremberg', 'Juicio a Hermann Göring'],
    m: ['Juicio a Rudolf Hess', 'Juicio a Joachim von Ribbentrop', 'Juicio de los jueces de Núremberg'],
    d: ['Juicio de Auschwitz de Cracovia', 'Proceso de Belsen', 'Tribunal de Jabárovsk (Unidad 731)'],
    t: ['Tribunal de la Inquisición', 'Juicio a Sócrates', 'Juicio a Galileo Galilei', 'Caso Dreyfus', 'Corte Penal Internacional (La Haya 2002)']
  },

  // 81 - 90: Guerra Fría, Descolonización y Siglo XX Tardío
  {
    c: 'Crisis y conflictos bélicos directos de la Guerra Fría',
    f: ['Guerra de Vietnam', 'Guerra de Corea', 'Crisis de los Misiles en Cuba (1962)', 'Guerra soviética en Afganistán (1979-1989)'],
    m: ['Bloqueo de Berlín (Puente aéreo 1948)', 'Construcción del Muro de Berlín (1961)', 'Invasión de Bahía de Cochinos (1961)'],
    d: ['Primavera de Praga (1968)', 'Revolución Húngara de 1956', 'Crisis del Canal de Suez (1956)'],
    t: ['Primera Guerra Mundial', 'Guerra de Secesión estadounidense', 'Guerra Franco-Prusiana', 'Guerras del Golfo (post-1991)', 'Guerra de las Malvinas (ajena al eje Este-Oeste)']
  },
  {
    c: 'Líderes supremos de la Unión Soviética (Secretarios Generales del PCUS)',
    f: ['Vladimir Lenin', 'Iósif Stalin', 'Nikita Jrushchov', 'Mijaíl Gorbachov'],
    m: ['Leonid Brézhnev', 'Yuri Andrópov', 'Konstantín Chernenko'],
    d: ['Gueorgui Malenkov', 'Alekséi Kosygin (Premier)', 'Anastás Mikoyán'],
    t: ['Boris Yeltsin (Federación Rusa)', 'Vladimir Putin', 'Dmitri Medvédev', 'León Trotski', 'Aleksandr Kérenski']
  },
  {
    c: 'Líderes de la descolonización y los derechos civiles del siglo XX',
    f: ['Nelson Mandela (Sudáfrica)', 'Martin Luther King Jr. (EEUU)', 'Mahatma Gandhi (India)', 'Malcolm X'],
    m: ['Rosa Parks', 'Patrice Lumumba (Congo)', 'Jawaharlal Nehru (India)'],
    d: ['Kwame Nkrumah (Ghana)', 'Jomo Kenyatta (Kenia)', 'Desmond Tutu (Sudáfrica)'],
    t: ['Winston Churchill', 'Margaret Thatcher', 'Charles de Gaulle', 'Richard Nixon', 'Cecil Rhodes']
  },
  {
    c: 'Hitos clave de la Carrera Espacial entre Estados Unidos y la Unión Soviética',
    f: ['Sputnik 1 en órbita (1957)', 'Yuri Gagarin primer humano en el espacio (1961)', 'Apolo 11 alunizaje tripulado (1969)', 'Perra Laika en órbita (1957)'],
    m: ['Valentina Tereshkova primera mujer espacial (1963)', 'Paseo espacial de Alekséi Leónov (1965)', 'Misión Apolo-Soyuz conjunta (1975)'],
    d: ['Luna 2 impacto en la Luna (1959)', 'Luna 3 fotos de cara oculta (1959)', 'Lanzamiento de la estación Mir (1986)'],
    t: ['Telescopio James Webb (2021)', 'Rover Curiosity en Marte (2012)', 'Estación Espacial Internacional (1998 en adelante)', 'Vuelo del Concorde', 'Proyecto Manhattan']
  },
  {
    c: 'Países miembros fundadores de la OTAN (Tratado de Washington de 1949)',
    f: ['Estados Unidos', 'Reino Unido', 'Francia', 'Canadá'],
    m: ['Italia', 'Bélgica', 'Países Bajos'],
    d: ['Noruega', 'Dinamarca', 'Islandia'],
    t: ['España (entró en 1982)', 'Alemania Occidental (entró en 1955)', 'Turquía (entró en 1952)', 'Polonia (1999)', 'Suecia (2024)']
  },
  {
    c: 'Países que firmaron el Pacto de Varsovia en 1955',
    f: ['Unión Soviética', 'Polonia', 'Alemania Oriental (RDA)', 'Checoslovaquia'],
    m: ['Hungría', 'Rumanía', 'Bulgaria'],
    d: ['Albania (abandonó en 1968)', 'República Popular de Polonia', 'RDA (NVA)'],
    t: ['Yugoslavia (no alineada)', 'China', 'Cuba', 'Corea del Norte', 'Vietnam']
  },
  {
    c: 'Conflictos bélicos entre Estados árabes e Israel en el siglo XX',
    f: ['Guerra de los Seis Días (1967)', 'Guerra de Yom Kipur (1973)', 'Guerra árabe-israelí de 1948', 'Guerra del Líbano de 1982'],
    m: ['Crisis de Suez (1956)', 'Guerra de Desgaste (1967-1970)', 'Operación Paz para Galilea'],
    d: ['Acuerdos de Camp David (1978)', 'Acuerdos de Oslo (1993)', 'Primera Intifada (1987)'],
    t: ['Guerra del Golfo (1991)', 'Guerra Irán-Irak', 'Guerra de Corea', 'Guerra de Vietnam', 'Guerra de las Malvinas']
  },
  {
    c: 'Presidentes de los Estados Unidos durante la segunda mitad del siglo XX',
    f: ['John F. Kennedy', 'Richard Nixon', 'Ronald Reagan', 'Bill Clinton'],
    m: ['Dwight D. Eisenhower', 'Lyndon B. Johnson', 'Jimmy Carter'],
    d: ['Harry S. Truman', 'Gerald Ford', 'George H. W. Bush'],
    t: ['Franklin D. Roosevelt (primera mitad)', 'Theodore Roosevelt', 'Woodrow Wilson', 'Abraham Lincoln', 'Barack Obama (siglo XXI)']
  },
  {
    c: 'Acontecimientos del proceso de Transición Democrática en España (1975-1982)',
    f: ['Muerte de Francisco Franco (1975)', 'Aprobación de la Constitución de 1978', 'Intento de golpe de Estado del 23-F (1981)', 'Elecciones generales de 1977'],
    m: ['Legalización del Partido Comunista (PCE)', 'Pactos de la Moncloa (1977)', 'Victoria del PSOE de Felipe González (1982)'],
    d: ['Proclamación de Juan Carlos I', 'Ley para la Reforma Política de 1976', 'Dimisión de Adolfo Suárez (1981)'],
    t: ['Guerra Civil Española (1936)', 'Entrada en la Unión Europea (1986 posterior)', 'Juegos Olímpicos de Barcelona (1992)', 'Guerra de Marruecos', 'Huelga general de 1988']
  },
  {
    c: 'Acontecimientos del colapso del bloque soviético y fin de la Guerra Fría (1989-1991)',
    f: ['Caída del Muro de Berlín (noviembre de 1989)', 'Disolución formal de la URSS (diciembre de 1991)', 'Reunificación de Alemania (1990)', 'Revolución de Terciopelo en Checoslovaquia'],
    m: ['Políticas de Glásnost y Perestroika de Gorbachov', 'Golpe de Estado en Moscú (agosto de 1991)', 'Ejecución de Ceaușescu en Rumanía'],
    d: ['Tratado de Belavezha (creación de la CEI)', 'Elecciones libres de Solidaridad en Polonia', 'Pícnic Paneuropeo en Hungría'],
    t: ['Construcción del Muro de Berlín (1961)', 'Crisis de los Misiles en Cuba (1962)', 'Primavera de Praga (1968)', 'Revolución Rusa (1917)', 'Guerra de Corea']
  },

  // 91 - 100: Patrimonio, Grandes Obras y Personajes Universales
  {
    c: 'Monumentos y sitios declarados Patrimonio de la Humanidad en España por la UNESCO',
    f: ['La Alhambra de Granada', 'La Sagrada Familia de Barcelona', 'El Acueducto de Segovia', 'La Mezquita-Catedral de Córdoba'],
    m: ['Catedral de Santiago de Compostela', 'Monasterio de El Escorial', 'Murallas de Ávila'],
    d: ['Cueva de Altamira', 'Monasterio de Poblet', 'Torre de Hércules de A Coruña'],
    t: ['Coliseo de Roma', 'Torre Eiffel de París', 'Torre de Pisa', 'Big Ben de Londres', 'Partenón de Atenas']
  },
  {
    c: 'Obras maestras de la escultura y pintura realizadas por Miguel Ángel Buonarroti',
    f: ['Estatua del David de Florencia', 'La Piedad del Vaticano', 'Bóveda de la Capilla Sixtina', 'El Juicio Final'],
    m: ['Estatua del Moisés', 'Tumba de los Médici', 'Baco con sátiro'],
    d: ['Piedad Rondanini', 'Tondo Doni', 'Esclavo moribundo'],
    t: ['La Gioconda (Mona Lisa de Da Vinci)', 'El hombre de Vitruvio (Da Vinci)', 'La Última Cena (Da Vinci)', 'Venus de Milo (helenística)', 'Victoria alada de Samotracia']
  },
  {
    c: 'Pinturas maestras que forman parte de la colección del Museo del Prado en Madrid',
    f: ['Las Meninas (Diego Velázquez)', 'El jardín de las delicias (El Bosco)', 'Los fusilamientos del 3 de mayo (Goya)', 'Las tres Gracias (Rubens)'],
    m: ['El caballero de la mano en el pecho (El Greco)', 'Saturno devorando a su hijo (Goya)', 'La maja desnuda (Goya)'],
    d: ['La fragua de Vulcano (Velázquez)', 'El triunfo de Baco / Los borrachos (Velázquez)', 'El descendimiento de la cruz (Van der Weyden)'],
    t: ['Guernica (Museo Reina Sofía)', 'La persistencia de la memoria (Dalí)', 'La Gioconda (Museo del Louvre)', 'La noche estrellada (MoMA Nueva York)', 'El grito (Oslo)']
  },
  {
    c: 'Grandes edificaciones y templos del Imperio Romano conservados en Europa',
    f: ['Coliseo de Roma (Anfiteatro Flavio)', 'Panteón de Agripa en Roma', 'Acueducto de Segovia en España', 'Teatro romano de Mérida'],
    m: ['Pont du Gard en Francia', 'Termas de Caracalla', 'Maison Carrée de Nimes'],
    d: ['Arena de Verona', 'Porta Nigra de Tréveris', 'Templo de Diana en Évora'],
    t: ['Partenón de Atenas (griego)', 'Santa Sofía de Constantinopla (bizantino)', 'Pirámides de Guiza', 'Stonehenge', 'Catedral de Notre Dame']
  },
  {
    c: 'Grandes obras de la literatura universal de la Antigüedad y Medievo',
    f: ['La Ilíada (Homero)', 'La Odisea (Homero)', 'La Divina Comedia (Dante Alighieri)', 'Cantar de mio Cid'],
    m: ['La Eneida (Virgilio)', 'El Decamerón (Boccaccio)', 'Cantar de Roldán'],
    d: ['Poema de Gilgamesh (Mesopotamia)', 'Metamorfosis (Ovidio)', 'Cuentos de Canterbury (Chaucer)'],
    t: ['Don Quijote de la Mancha (siglo XVII)', 'Hamlet (Shakespeare)', 'La Celestina (siglo XV tardío)', 'Fausto (Goethe)', 'Guerra y Paz (Tolstói)']
  },
  {
    c: 'Premios Nobel de la Paz galardonados por su lucha humanitaria o política',
    f: ['Nelson Mandela', 'Martin Luther King Jr.', 'Madre Teresa de Calcuta', 'Barack Obama'],
    m: ['Malala Yousafzai', '14º Dalái Lama (Tenzin Gyatso)', 'Kofi Annan'],
    d: ['Desmond Tutu', 'Rigoberta Menchú', 'Mijaíl Gorbachov'],
    t: ['Mahatma Gandhi (nunca lo recibió)', 'Albert Einstein (Nobel de Física)', 'Winston Churchill (Nobel de Literatura)', 'Abraham Lincoln (pre-Nobel)', 'Eleanor Roosevelt']
  },
  {
    c: 'Obras de teatro inmortales escritas por William Shakespeare',
    f: ['Hamlet', 'Romeo y Julieta', 'Macbeth', 'Otelo'],
    m: ['El sueño de una noche de verano', 'El rey Lear', 'El mercader de Venecia'],
    d: ['Julio César', 'La tempestad', 'Mucho ruido y pocas nueces'],
    t: ['La vida es sueño (Calderón)', 'Fuenteovejuna (Lope de Vega)', 'Fausto (Goethe)', 'El misántropo (Molière)', 'Don Juan Tenorio (Zorrilla)']
  },
  {
    c: 'Grandes obras arquitectónicas del gótico europeo',
    f: ['Catedral de Notre Dame de París', 'Catedral de Burgos', 'Catedral de Toledo', 'Catedral de Chartres'],
    m: ['Catedral de Colonia', 'Catedral de Milán (Duomo)', 'Catedral de León (vidrieras)'],
    d: ['Sainte-Chapelle de París', 'Catedral de Sevilla (gótica tardía)', 'Catedral de Salisbury'],
    t: ['Basílica de San Pedro en Roma (Renacimiento/Barroco)', 'Sagrada Familia (Modernismo)', 'Santa Sofía de Estambul (Bizantino)', 'Monasterio de El Escorial (Herreriano)', 'Panteón de Roma']
  },
  {
    c: 'Autores y obras clave de la filosofía moderna europea (siglos XVII-XIX)',
    f: ['René Descartes (Discurso del método)', 'Immanuel Kant (Crítica de la razón pura)', 'Karl Marx (El Capital)', 'Friedrich Nietzsche (Así habló Zaratustra)'],
    m: ['Baruch Spinoza (Ética)', 'Thomas Hobbes (Leviatán)', 'Arthur Schopenhauer (El mundo como voluntad y representación)'],
    d: ['Gottfried Leibniz (Monadología)', 'G.W.F. Hegel (Fenomenología del espíritu)', 'John Locke (Ensayo sobre el entendimiento humano)'],
    t: ['Platón (Antigua Grecia)', 'Aristóteles', 'Sócrates', 'Santo Tomás de Aquino', 'San Agustín de Hipona']
  },
  {
    c: 'Personalidades históricas que murieron ejecutadas por la guillotina en Francia',
    f: ['Rey Luis XVI', 'Reina María Antonieta', 'Maximilien Robespierre', 'Georges Danton'],
    m: ['Louis de Saint-Just', 'Madame Roland', 'Antoine Lavoisier (químico)'],
    d: ['Camille Desmoulins', 'Charlotte Corday (asesina de Marat)', 'Jacques Pierre Brissot'],
    t: ['Jean-Paul Marat (apuñalado en la bañera)', 'Napoleón Bonaparte (murió desterrado en Santa Elena)', 'Marqués de La Fayette (murió anciano en su cama)', 'Cardenal Richelieu', 'Voltaire']
  }
];

export default Array.from({ length: 100 }, (_, idx) => {
  const p = plantillas[idx];
  return {
    id: `historia_${idx + 1}`,
    consigna: p.c,
    correctos: { faciles: p.f, medios: p.m, dificiles: p.d },
    trampas: p.t
  };
});