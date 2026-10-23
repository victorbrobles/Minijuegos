// server/data/seeds/buscaminas/gastronomia.js

const plantillas = [
  // 1 - 10: Cocinas del Mundo I
  {
    c: 'Platos e ingredientes emblemáticos de la gastronomía de España',
    f: ['Paella valenciana', 'Tortilla de patatas', 'Jamón ibérico', 'Gazpacho andaluz'],
    m: ['Croquetas de jamón', 'Pulpo a la gallega', 'Cocido madrileño'],
    d: ['Fabada asturiana', 'Salmorejo cordobés', 'Pisto manchego'],
    t: ['Guacamole', 'Pizza margarita', 'Sushi de salmón', 'Tacos al pastor', 'Croissant']
  },
  {
    c: 'Platos tradicionales de la gastronomía italiana',
    f: ['Pizza napolitana', 'Espaguetis a la carbonara', 'Lasaña boloñesa', 'Risotto de setas'],
    m: ['Tiramisú', 'Raviolis de espinaca y ricotta', 'Carpaccio de ternera'],
    d: ['Ossobuco a la milanesa', 'Focaccia genovesa', 'Gnocchi al pesto'],
    t: ['Paella valenciana', 'Ratatouille', 'Moussaka', 'Tacos al pastor', 'Ceviche de pescado']
  },
  {
    c: 'Platos e ingredientes clásicos de la cocina tradicional mexicana',
    f: ['Tacos al pastor', 'Guacamole con totopos', 'Enchiladas verdes', 'Quesadillas de queso'],
    m: ['Mole poblano', 'Pozole rojo', 'Chiles en nogada'],
    d: ['Tamales de elote', 'Cochinita pibil', 'Chilaquiles con salsa roja'],
    t: ['Arepas de maíz', 'Ceviche mixto', 'Empanadas tucumanas', 'Feijoada', 'Choripán']
  },
  {
    c: 'Platos y preparaciones de la cocina tradicional japonesa',
    f: ['Sushi variado', 'Ramen de fideos', 'Sashimi de atún rojo', 'Tempura de langostinos'],
    m: ['Gyoza al vapor', 'Yakitori de pollo', 'Sopa de miso'],
    d: ['Okonomiyaki', 'Takoyaki de pulpo', 'Tonkatsu de cerdo'],
    t: ['Pad Thai', 'Dim Sum cantón', 'Rollito de primavera', 'Kimchi', 'Pho de ternera']
  },
  {
    c: 'Platos y recetas de la alta cocina tradicional francesa',
    f: ['Ratatouille', 'Sopa de cebolla gratinada', 'Quiche Lorraine', 'Soufflé de queso'],
    m: ['Boeuf Bourguignon', 'Confit de pato', 'Coq au vin'],
    d: ['Cassoulet', 'Bouillabaisse', 'Tartiflette'],
    t: ['Lasaña boloñesa', 'Fabada asturiana', 'Moussaka griega', 'Goulash húngaro', 'Risotto de setas']
  },
  {
    c: 'Platos e ingredientes típicos de la cocina tradicional china',
    f: ['Pato laqueado pequinés', 'Arroz frito tres delicias', 'Dim sum de cerdo', 'Rollito de primavera'],
    m: ['Pollo Kung Pao', 'Mapo tofu picante', 'Sopa wantán'],
    d: ['Chow mein de verduras', 'Cerdo agridulce cantonés', 'Baozi al vapor'],
    t: ['Sushi variado', 'Pad Thai', 'Ramen de fideos', 'Kimchi coreano', 'Pho de ternera']
  },
  {
    c: 'Platos tradicionales de la gastronomía griega',
    f: ['Moussaka', 'Salsa tzatziki', 'Ensalada griega con feta', 'Gyros de pollo'],
    m: ['Souvlaki en brocheta', 'Spanakopita de espinacas', 'Dolmades en hoja de parra'],
    d: ['Taramosalata de huevas', 'Pastitsio al horno', 'Kleftiko de cordero'],
    t: ['Hummus de garbanzo', 'Cuscús con verduras', 'Falafel crujiente', 'Baba ganoush', 'Fideuá de marisco']
  },
  {
    c: 'Especialidades culinarias de la cocina de la India',
    f: ['Pollo Tikka Masala', 'Pan Naan', 'Samosa de verduras', 'Pollo al curry'],
    m: ['Pollo Butter Chicken', 'Biryani de cordero', 'Lassi de mango'],
    d: ['Dosa crujiente', 'Dal makhani de lentejas', 'Palak paneer'],
    t: ['Ramen japonés', 'Rollito de primavera', 'Pad Thai', 'Kebab döner', 'Chow mein']
  },
  {
    c: 'Platos y comidas típicas de la gastronomía tradicional estadounidense',
    f: ['Hamburguesa con queso', 'Perrito caliente (Hot Dog)', 'Costillas BBQ', 'Tarta de manzana (Apple Pie)'],
    m: ['Mac and Cheese', 'Alitas Buffalo', 'Clam chowder'],
    d: ['Gumbo de Luisiana', 'Philly cheesesteak', 'Jambalaya'],
    t: ['Paella mixta', 'Tacos al pastor', 'Sushi variado', 'Pasteles de Belém', 'Wiener Schnitzel']
  },
  {
    c: 'Platos emblemáticos de la gastronomía de Tailandia',
    f: ['Pad Thai', 'Sopa Tom Yum', 'Curry verde tailandés', 'Mango sticky rice'],
    m: ['Curry rojo de pollo', 'Som Tum (ensalada de papaya)', 'Tom Kha Gai'],
    d: ['Massaman curry', 'Pad See Ew', 'Khao Soi'],
    t: ['Sushi variado', 'Rollito vietnamita', 'Ramen japonés', 'Gyoza al vapor', 'Dim sum']
  },

  // 11 - 20: Cocinas del Mundo II
  {
    c: 'Especialidades reconocidas de la gastronomía peruana',
    f: ['Ceviche clásico de pescado', 'Causa limeña', 'Lomo saltado', 'Ají de gallina'],
    m: ['Anticuchos de corazón', 'Papas a la huancaína', 'Arroz chaufa'],
    d: ['Tiradito de corvina', 'Rocoto relleno arequipeño', 'Seco de cabrito'],
    t: ['Arepas de maíz', 'Tacos al pastor', 'Empanadas salteñas', 'Feijoada', 'Guacamole']
  },
  {
    c: 'Platos y preparaciones de la gastronomía tradicional argentina',
    f: ['Asado a la parrilla', 'Empanadas criollas', 'Milanesa napolitana', 'Alfajores de maicena'],
    m: ['Choripán con chimichurri', 'Provoleta a la brasa', 'Matambre a la pizza'],
    d: ['Locro criollo', 'Vacío a la estaca', 'Bife de chorizo'],
    t: ['Feijoada completa', 'Ceviche mixto', 'Arepas de maíz', 'Tacos al pastor', 'Bandeja paisa']
  },
  {
    c: 'Especialidades culinarias de Oriente Medio y Turquía',
    f: ['Kebab döner', 'Hummus de garbanzo', 'Falafel crujiente', 'Baklava de pistacho'],
    m: ['Lahmacun', 'Shakshuka', 'Baba ganoush'],
    d: ['Kofte especiado', 'Börek de queso feta', 'Pide tradicional'],
    t: ['Moussaka griega', 'Tacos al pastor', 'Pollo Tikka Masala', 'Ceviche de pescado', 'Risotto de setas']
  },
  {
    c: 'Platos tradicionales de la gastronomía alemana y austriaca',
    f: ['Bratwurst', 'Chucrut (Sauerkraut)', 'Codillo de cerdo (Eisbein)', 'Pretzel salado'],
    m: ['Currywurst', 'Kartoffelsalat', 'Wiener Schnitzel'],
    d: ['Sauerbraten', 'Spätzle de huevo', 'Knödel de patata'],
    t: ['Pizza cuatro quesos', 'Gazpacho andaluz', 'Lasaña boloñesa', 'Paella valenciana', 'Ratatouille']
  },
  {
    c: 'Platos típicos de la gastronomía de Marruecos y el Magreb',
    f: ['Cuscús de verduras y cordero', 'Tajín de pollo y limón encurtido', 'Pastela moruna', 'Té a la menta'],
    m: ['Sopa Harira', 'Zaalouk de berenjena', 'Kofta en salsa de tomate'],
    d: ['Tajín de kefta con huevos', 'Msemen (panqueque hojaldrado)', 'Briouats de carne picada'],
    t: ['Hummus libanés', 'Moussaka griega', 'Sushi variado', 'Pad Thai', 'Tacos al pastor']
  },
  {
    c: 'Platos tradicionales de la gastronomía portuguesa',
    f: ['Bacalhau à Brás', 'Pasteles de Belém', 'Francesinha de Oporto', 'Sardinas asadas'],
    m: ['Caldo verde con chouriço', 'Bacalhau com natas', 'Polvo à lagareiro'],
    d: ['Cataplana de mariscos', 'Arroz de pato', 'Bifana de cerdo'],
    t: ['Paella valenciana', 'Empanada gallega', 'Pizza napolitana', 'Fabada asturiana', 'Ratatouille']
  },
  {
    c: 'Platos e ingredientes tradicionales de la cocina de Vietnam',
    f: ['Sopa Pho de ternera', 'Bánh mì', 'Goi cuon (rollitos frescos)', 'Café con leche condensada'],
    m: ['Bun cha de cerdo', 'Bánh xèo (crepe crujiente)', 'Cao lau de fideos'],
    d: ['Bo luc lac (ternera salteada)', 'Cha ca La Vong', 'Canh chua de marisco'],
    t: ['Pad Thai', 'Ramen de fideos', 'Sushi variado', 'Sopa Tom Yum', 'Dim sum']
  },
  {
    c: 'Especialidades culinarias tradicionales de Colombia y Venezuela',
    f: ['Arepa reina pepiada', 'Bandeja paisa', 'Tequeños de queso', 'Empanadas de maíz'],
    m: ['Pabellón criollo', 'Ajiaco santafereño', 'Sancocho'],
    d: ['Hallaca navideña', 'Cachapa con queso de mano', 'Pandebono'],
    t: ['Tacos al pastor', 'Ceviche clásico de pescado', 'Enchiladas verdes', 'Feijoada', 'Choripán con chimichurri']
  },
  {
    c: 'Platos e ingredientes tradicionales de la gastronomía de Corea del Sur',
    f: ['Kimchi', 'Bibimbap', 'Barbacoa coreana (KBBQ)', 'Tteokbokki picante'],
    m: ['Bulgogi de ternera', 'Pollo frito coreano', 'Japchae de fideos de boniato'],
    d: ['Samgyeopsal', 'Sundubu-jjigae de tofu', 'Kimchi jjigae'],
    t: ['Sushi variado', 'Ramen japonés', 'Pato laqueado pequinés', 'Dim sum', 'Pad Thai']
  },
  {
    c: 'Platos y elementos culinarios tradicionales de Brasil',
    f: ['Feijoada completa', 'Pão de queijo', 'Picanha a la brasa', 'Brigadeiro de chocolate'],
    m: ['Moqueca bahiana', 'Acarajé con camarones', 'Coxinha de pollo'],
    d: ['Vatapá', 'Farofa de mandioca', 'Pastel de palmito'],
    t: ['Ceviche clásico de pescado', 'Asado argentino', 'Arepas de maíz', 'Tacos al pastor', 'Empanadas criollas']
  },

  // 21 - 30: Ingredientes y Alimentos Básicos
  {
    c: 'Variedades de quesos internacionales protegidos o tradicionales',
    f: ['Queso Manchego', 'Parmigiano Reggiano', 'Mozzarella di Bufala', 'Queso Cheddar'],
    m: ['Queso Brie', 'Queso Gouda', 'Queso Roquefort'],
    d: ['Queso Camembert', 'Queso Gruyère', 'Queso Gorgonzola'],
    t: ['Tofu', 'Mantequilla con sal', 'Nata montada', 'Yogur griego', 'Cuajada']
  },
  {
    c: 'Cortes gastronómicos nobles procedentes del despiece vacuno',
    f: ['Solomillo de ternera', 'Chuletón con hueso', 'Entrecot a la plancha', 'Costillar vacuno'],
    m: ['Lomo alto', 'Lomo bajo deshuesado', 'T-bone steak'],
    d: ['Picaña', 'Vacío de ternera', 'Babilla'],
    t: ['Pechuga de pollo', 'Contramuslo de pavo', 'Magret de pato', 'Panceta de cerdo', 'Secreto ibérico']
  },
  {
    c: 'Cortes de carne procedentes del despiece del cerdo ibérico',
    f: ['Jamón ibérico de bellota', 'Secreto ibérico', 'Pluma ibérica', 'Presa ibérica'],
    m: ['Solomillo de cerdo', 'Lomo embuchado', 'Costillas de cerdo adobadas'],
    d: ['Carrillera de cerdo', 'Lagarto ibérico', 'Abanico ibérico'],
    t: ['Entrecot a la plancha', 'Magret de pato', 'Chuletón con hueso', 'Picaña', 'Alitas de pollo']
  },
  {
    c: 'Especies de pescado azul ricas en ácidos grasos Omega-3',
    f: ['Salmón atlántico', 'Atún rojo', 'Sardina común', 'Boquerón'],
    m: ['Caballa', 'Bonito del norte', 'Jurel (chicharro)'],
    d: ['Pez espada (emperador)', 'Arenque', 'Anguila'],
    t: ['Merluza de pincho', 'Bacalao desalado', 'Lenguado común', 'Gallo de costa', 'Rape de ría']
  },
  {
    c: 'Especies de pescado blanco de bajo contenido graso',
    f: ['Merluza de pincho', 'Bacalao desalado', 'Lenguado común', 'Rape de ría'],
    m: ['Lubina salvaje', 'Dorada de mar', 'Rodaballo'],
    d: ['Gallo de costa', 'Abadejo', 'Pescadilla'],
    t: ['Salmón atlántico', 'Sardina común', 'Atún rojo', 'Caballa', 'Arenque']
  },
  {
    c: 'Especies de mariscos (crustáceos y moluscos bivalvos)',
    f: ['Langostino tigre', 'Gamba roja', 'Mejillón de roca', 'Almeja fina'],
    m: ['Centollo gallego', 'Bogavante azul', 'Cigala'],
    d: ['Percebe', 'Nécora', 'Berberecho'],
    t: ['Merluza de pincho', 'Calamar común', 'Sepia', 'Pulpo de roca', 'Rape de ría']
  },
  {
    c: 'Variedades de arroz cultivadas para gastronomía',
    f: ['Arroz bomba', 'Arroz basmati', 'Arroz jazmín', 'Arroz arborio'],
    m: ['Arroz carnaroli', 'Arroz integral', 'Arroz glutinoso'],
    d: ['Arroz salvaje (zizania)', 'Arroz rojo de Camarga', 'Arroz senia'],
    t: ['Cuscús de trigo', 'Semillas de quinoa', 'Trigo sarraceno', 'Polenta de maíz', 'Copos de avena']
  },
  {
    c: 'Tipos y formatos tradicionales de pasta italiana',
    f: ['Spaghetti', 'Penne rigate', 'Tagliatelle', 'Ravioli'],
    m: ['Fettuccine', 'Fusilli', 'Gnocchi'],
    d: ['Tortellini', 'Rigatoni', 'Farfalle'],
    t: ['Cuscús de trigo', 'Semillas de quinoa', 'Arroz basmati', 'Polenta de maíz', 'Fideos shirataki']
  },
  {
    c: 'Panes tradicionales característicos de diversas culturas',
    f: ['Baguette', 'Pan de masa madre', 'Pan de pita', 'Focaccia'],
    m: ['Pan Naan', 'Ciabatta (chapata)', 'Pan brioche'],
    d: ['Pumpernickel', 'Bagel', 'Injera'],
    t: ['Tortilla de patatas', 'Crepe dulce', 'Gofre belga', 'Tacos al pastor', 'Empanadilla de atún']
  },
  {
    c: 'Partes y despieces culinarios de aves de corral',
    f: ['Pechuga de pollo', 'Contramuslo deshuesado', 'Muslo de pollo (jamoncito)', 'Alitas de pollo'],
    m: ['Solomillo de pollo', 'Carcasa para caldo', 'Magret de pato'],
    d: ['Mollejas de ave', 'Hígado de pollo', 'Cuello de pavo'],
    t: ['Chuletón con hueso', 'Carrillera de cerdo', 'Secreto ibérico', 'Picaña', 'Costillar vacuno']
  },

  // 31 - 40: Frutas, Verduras y Especias
  {
    c: 'Frutas tropicales y subtropicales de consumo habitual',
    f: ['Plátano', 'Piña', 'Mango', 'Papaya'],
    m: ['Maracuyá', 'Coco', 'Guayaba'],
    d: ['Pitahaya', 'Carambola', 'Lichi'],
    t: ['Manzana reineta', 'Pera conferencia', 'Cereza', 'Uva blanca', 'Melocotón']
  },
  {
    c: 'Frutas pertenecientes a la familia de los cítricos',
    f: ['Limón', 'Naranja', 'Mandarina', 'Lima'],
    m: ['Pomelo', 'Naranja amarga', 'Kumquat'],
    d: ['Yuzu', 'Mano de Buda', 'Bergamota'],
    t: ['Manzana reineta', 'Plátano', 'Fresa silvestre', 'Kiwi verde', 'Sandía']
  },
  {
    c: 'Frutos del bosque y bayas comestibles',
    f: ['Fresa silvestre', 'Frambuesa', 'Arándano azul', 'Mora'],
    m: ['Grosella roja', 'Grosella negra', 'Madroño'],
    d: ['Endrina', 'Camemoro', 'Baya de saúco'],
    t: ['Plátano', 'Melón piel de sapo', 'Manzana reineta', 'Mango', 'Papaya']
  },
  {
    c: 'Setas y hongos silvestres o cultivados de alto valor gastronómico',
    f: ['Champiñón de París', 'Boletus edulis', 'Níscalo', 'Trufa negra'],
    m: ['Rebozuelo (Chanterelle)', 'Shiitake', 'Seta de ostra'],
    d: ['Amanita caesarea (oronja)', 'Trompeta de la muerte', 'Colmenilla'],
    t: ['Amanita phalloides', 'Alga wakame', 'Musgo verde', 'Líquen', 'Helecho macho']
  },
  {
    c: 'Verduras y hortalizas de hoja verde comestibles',
    f: ['Espinaca', 'Lechuga romana', 'Acelga', 'Col rizada (kale)'],
    m: ['Rúcula', 'Canónigos', 'Endivia'],
    d: ['Berro de agua', 'Borraja', 'Hojas de mostaza'],
    t: ['Tomate pera', 'Zanahoria', 'Berenjena', 'Pimiento rojo', 'Calabacín']
  },
  {
    c: 'Variedades de legumbres de consumo seco o cocido',
    f: ['Garbanzo lechoso', 'Lenteja pardina', 'Alubia blanca', 'Guisante verde'],
    m: ['Alubia roja', 'Lenteja roja', 'Haba seca'],
    d: ['Alubia tolosana', 'Garrofó', 'Soja azuki'],
    t: ['Arroz bomba', 'Semillas de quinoa', 'Maíz dulce', 'Trigo sarraceno', 'Patata agria']
  },
  {
    c: 'Tubérculos y raíces comestibles utilizadas en la cocina',
    f: ['Patata agria', 'Zanahoria', 'Boniato / Batata', 'Cebolla común'],
    m: ['Yuca / Mandioca', 'Remolacha roja', 'Nabo'],
    d: ['Chirivía', 'Tupinambo', 'Ñame'],
    t: ['Tomate pera', 'Pimiento verde', 'Calabacín', 'Berenjena', 'Pepino']
  },
  {
    c: 'Frutos secos naturales y semillas oleaginosas comestibles',
    f: ['Nueces de nogal', 'Almendras', 'Avellanas', 'Pistachos'],
    m: ['Cacahuetes', 'Castañas', 'Anacardos'],
    d: ['Nueces de macadamia', 'Piñones nacionales', 'Nueces de Brasil'],
    t: ['Pipas de girasol', 'Pipas de calabaza', 'Kikos de maíz', 'Uvas pasas', 'Dátiles']
  },
  {
    c: 'Hierbas aromáticas empleadas como condimento fresco o seco',
    f: ['Orégano', 'Albahaca', 'Romero', 'Perejil'],
    m: ['Tomillo', 'Cilantro', 'Hierbabuena'],
    d: ['Estragón', 'Eneldo', 'Salvia'],
    t: ['Canela en rama', 'Pimienta negra en grano', 'Nuez moscada', 'Clavo de olor', 'Azafrán en hebras']
  },
  {
    c: 'Especias secas molidas o enteras de origen vegetal',
    f: ['Pimienta negra en grano', 'Canela en rama', 'Pimentón dulce', 'Comino molido'],
    m: ['Cúrcuma en polvo', 'Clavo de olor', 'Nuez moscada'],
    d: ['Azafrán en hebras', 'Cardamomo verde', 'Anís estrellado'],
    t: ['Sal marina común', 'Levadura de panadería', 'Bicarbonato sódico', 'Azúcar blanco', 'Vinagre de manzana']
  },

  // 41 - 50: Postres, Repostería y Chocolates
  {
    c: 'Postres y tartas clásicas reconocidas en la pastelería internacional',
    f: ['Tiramisú', 'Cheesecake (tarta de queso)', 'Brownie de chocolate', 'Tarta de manzana'],
    m: ['Crème brûlée', 'Profiteroles', 'Tarta Sacher'],
    d: ['Tarta Selva Negra', 'Tarta Tatin', 'Milhojas (Mille-feuille)'],
    t: ['Tortilla de patatas', 'Empanada gallega', 'Quiche Lorraine', 'Focaccia', 'Gazpacho andaluz']
  },
  {
    c: 'Especialidades tradicionales de la bollería y pastelería francesa',
    f: ['Croissant', 'Pain au chocolat', 'Macaron', 'Éclair'],
    m: ['Brioche', 'Madeleine (magdalena)', 'Canelé'],
    d: ['Kouign-amann', 'Financier', 'Choux con azúcar perla'],
    t: ['Churros de lazo', 'Donut glaseado', 'Ensaimada de Mallorca', 'Sobaos pasiegos', 'Torrijas de leche']
  },
  {
    c: 'Dulces y postres típicos de la repostería española',
    f: ['Churros de lazo', 'Torrijas de leche', 'Crema catalana', 'Arroz con leche'],
    m: ['Ensaimada de Mallorca', 'Tarta de Santiago', 'Polvorón tradicional'],
    d: ['Piononos de Santa Fe', 'Bartolillos madrileños', 'Pestiños con miel'],
    t: ['Croissant', 'Tiramisú', 'Macaron', 'Brownie de chocolate', 'Baklava de pistacho']
  },
  {
    c: 'Componentes e ingredientes utilizados en la fabricación de chocolate',
    f: ['Pasta de cacao', 'Manteca de cacao', 'Azúcar blanco', 'Cacao en polvo'],
    m: ['Leche en polvo', 'Vainilla natural', 'Lecitina de soja'],
    d: ['Nibs de cacao', 'Grasa láctea', 'Cacao criollo'],
    t: ['Harina de trigo', 'Levadura química', 'Aceite de oliva virgen extra', 'Huevo entero crudo', 'Gelatina en polvo']
  },
  {
    c: 'Postres y dulces tradicionales de la gastronomía italiana',
    f: ['Tiramisú', 'Panna cotta', 'Cannoli sicilianos', 'Gelato artesanal'],
    m: ['Zabaione (sabayón)', 'Sfogliatella', 'Babà al ron'],
    d: ['Zuccotto florentino', 'Torta caprese', 'Seadas con miel'],
    t: ['Crema catalana', 'Crème brûlée', 'Baklava de pistacho', 'Brownie de chocolate', 'Flan de huevo']
  },
  {
    c: 'Dulces y pastas tradicionales de Oriente Medio y el Magreb',
    f: ['Baklava de pistacho', 'Halva de sésamo', 'Loukoum (delicia turca)', 'Chebakia'],
    m: ['Kunafa / Knafeh', 'Ma\'amoul de dátiles', 'Basbousa de sémola'],
    d: ['Qatayef', 'Awameh', 'Ghoriba de almendra'],
    t: ['Tarta Selva Negra', 'Churros de lazo', 'Cheesecake (tarta de queso)', 'Croissant', 'Macaron']
  },
  {
    c: 'Frutas habitualmente preparadas en almíbar o compota',
    f: ['Melocotón en almíbar', 'Pera al vino', 'Manzana caramelizada', 'Cereza en almíbar'],
    m: ['Higo confitado', 'Albaricoque en almíbar', 'Piña en su jugo'],
    d: ['Membrillo en dulce', 'Kumquat confitado', 'Castaña glaseada (marrón glacé)'],
    t: ['Aguacate maduro', 'Pepino', 'Ajo blanco', 'Cebolla común', 'Tomate verde']
  },
  {
    c: 'Ingredientes de la receta canónica del flan de huevo tradicional',
    f: ['Huevos enteros', 'Leche entera', 'Azúcar blanco', 'Caramelo líquido'],
    m: ['Yema de huevo', 'Cáscara de limón', 'Rama de canela'],
    d: ['Vaina de vainilla', 'Pizca de sal', 'Azúcar caramelizado'],
    t: ['Harina de trigo', 'Levadura química', 'Cacao en polvo', 'Aceite de girasol', 'Queso mascarpone']
  },
  {
    c: 'Tipos y variedades de tartas elaboradas a base de queso',
    f: ['New York Cheesecake', 'Tarta de queso de La Viña', 'Tarta de ricota', 'Tarta de queso fría con gelatina'],
    m: ['Tarta de queso de cabra', 'Käsekuchen alemana', 'Tarta de mascarpone'],
    d: ['Fiadone corso', 'Flaó ibicenco', 'Ostkaka sueca'],
    t: ['Tarta Selva Negra', 'Tarta de manzana', 'Tarta de Santiago', 'Tiramisú', 'Tarta Sacher']
  },
  {
    c: 'Masas y dulces fritos tradicionales de sartén',
    f: ['Churros de lazo', 'Porras madrileñas', 'Buñuelos de viento', 'Torrijas de leche'],
    m: ['Pestiños con miel', 'Donuts glaseados', 'Fritillas'],
    d: ['Flores manchegas', 'Orejas de Carnaval', 'Casadielles fritas'],
    t: ['Bizcocho genovés', 'Magdalenas caseras', 'Galletas de mantequilla', 'Macaron', 'Merengue']
  },

  // 51 - 60: Bebidas, Vinos y Cafés
  {
    c: 'Variedades de uva tinta empleadas en la vinificación',
    f: ['Tempranillo', 'Cabernet Sauvignon', 'Merlot', 'Syrah / Shiraz'],
    m: ['Garnacha tinta', 'Pinot Noir', 'Monastrell'],
    d: ['Nebbiolo', 'Sangiovese', 'Malbec'],
    t: ['Chardonnay', 'Verdejo', 'Albariño', 'Sauvignon Blanc', 'Macabeo (Viura)']
  },
  {
    c: 'Variedades de uva blanca empleadas en la vinificación',
    f: ['Chardonnay', 'Verdejo', 'Albariño', 'Sauvignon Blanc'],
    m: ['Garnacha blanca', 'Viura (Macabeo)', 'Riesling'],
    d: ['Godello', 'Moscatel de grano menudo', 'Gewürztraminer'],
    t: ['Tempranillo', 'Cabernet Sauvignon', 'Merlot', 'Syrah / Shiraz', 'Garnacha tinta']
  },
  {
    c: 'Estilos y familias de cerveza elaboradas en el mundo',
    f: ['Lager rubia', 'IPA (India Pale Ale)', 'Stout negra', 'Pilsner'],
    m: ['Pale Ale', 'Weizenbier (trigo)', 'Porter'],
    d: ['Lambic de fermentación espontánea', 'Saison belga', 'Gose alemana'],
    t: ['Vino tinto de crianza', 'Sidra natural asturiana', 'Whisky de malta', 'Vodka de cereal', 'Kombucha']
  },
  {
    c: 'Bebidas a base de café preparadas habitualmente en hostelería',
    f: ['Café espresso solo', 'Café con leche (Latte)', 'Capuchino', 'Café americano'],
    m: ['Café cortado', 'Café bombón', 'Café moca'],
    d: ['Ristretto corto', 'Flat White', 'Café frappé'],
    t: ['Té matcha', 'Té verde con jazmín', 'Infusión de manzanilla', 'Chocolate a la taza', 'Rooibos']
  },
  {
    c: 'Tipos de té derivados de la planta Camellia sinensis',
    f: ['Té negro', 'Té verde', 'Té blanco', 'Té rojo (Pu-erh)'],
    m: ['Té Oolong (azul)', 'Té Earl Grey', 'Té matcha'],
    d: ['Té Sencha', 'Té Lapsang Souchong', 'Té Darjeeling'],
    t: ['Infusión de manzanilla', 'Infusión de tila', 'Menta poleo', 'Rooibos', 'Agua de Jamaica']
  },
  {
    c: 'Cócteles clásicos oficiales reconocidos por la IBA',
    f: ['Mojito', 'Margarita', 'Piña Colada', 'Dry Martini'],
    m: ['Negroni', 'Old Fashioned', 'Daiquiri'],
    d: ['Manhattan', 'Whiskey Sour', 'Bloody Mary'],
    t: ['Sangría de vino tinto', 'Tinto de verano', 'Clara de cerveza con limón', 'Agua de Valencia', 'Kalimotxo']
  },
  {
    c: 'Bebidas destiladas de color blanco o transparentes (aguardientes blancos)',
    f: ['Vodka de cereal', 'Ginebra seca', 'Tequila blanco', 'Ron blanco'],
    m: ['Pisco', 'Mezcal joven', 'Grappa italiana'],
    d: ['Orujo blanco', 'Cachaça', 'Aguardiente anisado'],
    t: ['Whisky de malta', 'Brandy solera', 'Coñac de uva', 'Ron añejo', 'Bourbon']
  },
  {
    c: 'Bebidas destiladas envejecidas en barrica de madera',
    f: ['Whisky de malta', 'Bourbon de maíz', 'Ron añejo', 'Brandy solera'],
    m: ['Coñac de uva', 'Armagnac', 'Whiskey irlandés'],
    d: ['Calvados de manzana', 'Rye whiskey (centeno)', 'Ron extra viejo'],
    t: ['Ginebra seca', 'Vodka de cereal', 'Tequila blanco', 'Anís dulce transparente', 'Pisco']
  },
  {
    c: 'Vinos generosos y encabezados de crianza bajo velo de flor o de licor',
    f: ['Fino de Jerez', 'Manzanilla de Sanlúcar', 'Vino de Oporto', 'Pedro Ximénez'],
    m: ['Amontillado', 'Oloroso', 'Palo Cortado'],
    d: ['Madeira', 'Fondillón de Alicante', 'Moscatel dulce'],
    t: ['Cava brut nature', 'Txakoli joven', 'Vino albariño joven', 'Ribera del Duero roble', 'Lambrusco de Módena']
  },
  {
    c: 'Alimentos y bebidas que contienen probióticos o cultivos vivos fermentados',
    f: ['Yogur natural', 'Kéfir de leche', 'Chucrut (Sauerkraut)', 'Kombucha'],
    m: ['Pasta de miso', 'Kimchi', 'Tempeh de soja'],
    d: ['Natto', 'Kvass', 'Umeboshi'],
    t: ['Leche UHT esterilizada', 'Vinagre destilado', 'Cerveza pasteurizada', 'Zumo de naranja envasado', 'Queso fundido en lonchas']
  },

  // 61 - 70: Salsas, Condimentos y Aceites
  {
    c: 'Grandes salsas madre de la cocina tradicional y sus derivadas directas',
    f: ['Salsa bechamel', 'Salsa de tomate casera', 'Salsa mayonesa', 'Salsa holandesa'],
    m: ['Salsa española', 'Salsa velouté', 'Salsa bearnesa'],
    d: ['Salsa alioli tradicional', 'Salsa bordelesa', 'Salsa mornay'],
    t: ['Kétchup comercial', 'Mostaza de bote', 'Aceite de girasol', 'Salsa de soja comercial', 'Vinagre de manzana']
  },
  {
    c: 'Salsas y aderezos servidos habitualmente en frío',
    f: ['Salsa mayonesa', 'Salsa rosa / cóctel', 'Salsa césar', 'Salsa tártara'],
    m: ['Salsa alioli tradicional', 'Salsa vinagreta clásica', 'Salsa pesto genovés'],
    d: ['Salsa gribiche', 'Salsa rouille', 'Salsa remoulade'],
    t: ['Salsa bechamel', 'Salsa boloñesa', 'Salsa española', 'Caldo de puchero', 'Sopa de pescado']
  },
  {
    c: 'Salsas y pastas de condimento con marcado sabor picante',
    f: ['Salsa Tabasco original', 'Salsa Sriracha', 'Wasabi rallado', 'Salsa valentina'],
    m: ['Pasta Harissa', 'Gochujang coreano', 'Sambal oelek'],
    d: ['Chimichurri picante', 'Pasta de ají amarillo', 'Mole poblano'],
    t: ['Salsa mayonesa', 'Kétchup de tomate', 'Salsa bechamel', 'Salsa tártara', 'Salsa pesto genovés']
  },
  {
    c: 'Variedades de aceituna empleadas para producir aceite de oliva virgen extra',
    f: ['Aceituna Picual', 'Aceituna Arbequina', 'Aceituna Hojiblanca', 'Aceituna Cornicabra'],
    m: ['Aceituna Manzanilla', 'Aceituna Empeltre', 'Aceituna Frantoio'],
    d: ['Aceituna Picudo', 'Aceituna Leccino', 'Aceituna Koroneiki'],
    t: ['Aceituna rellena de anchoa', 'Aceituna negra de pizza', 'Semillas de girasol', 'Maíz dulce', 'Semillas de colza']
  },
  {
    c: 'Tipos de vinagre elaborados por métodos tradicionales o con denominación',
    f: ['Vinagre de Jerez', 'Vinagre balsámico de Módena', 'Vinagre de vino blanco', 'Vinagre de manzana (sidra)'],
    m: ['Vinagre de vino tinto', 'Vinagre de arroz', 'Vinagre de malta'],
    d: ['Vinagre de Condado de Huelva', 'Vinagre de Montilla-Moriles', 'Vinagre negro de Chinkiang'],
    t: ['Vino blanco verdejo', 'Aceite de oliva virgen extra', 'Salsa de soja tamari', 'Zumo de limón', 'Salmuera líquida']
  },
  {
    c: 'Ingredientes presentes en la receta clásica del pesto genovés',
    f: ['Hojas de albahaca fresca', 'Piñones tostados', 'Queso Parmigiano Reggiano', 'Aceite de oliva virgen extra'],
    m: ['Diente de ajo pelado', 'Queso Pecorino Fiore Sardo', 'Sal marina gruesa'],
    d: ['Albahaca DOP de hoja pequeña', 'Piñones del Mediterráneo', 'Pecorino Romano'],
    t: ['Espinaca fresca', 'Nueces de nogal', 'Nata para cocinar', 'Tomate triturado', 'Cebolla común']
  },
  {
    c: 'Ingredientes de la receta canónica del alioli al mortero (sin huevo)',
    f: ['Dientes de ajo frescos', 'Aceite de oliva virgen extra', 'Sal marina común', 'Zumo de limón'],
    m: ['Ajo pelado sin germen', 'Aceite añadido en hilo', 'Mano de mortero'],
    d: ['Sal marina gorda', 'Gotas de agua fría', 'Mortero cerámico'],
    t: ['Yema cruda de huevo', 'Leche entera', 'Mostaza de Dijon', 'Mayonesa en bote', 'Vinagre balsámico de Módena']
  },
  {
    c: 'Ingredientes tradicionales del ragù alla bolognese (salsa boloñesa clásica)',
    f: ['Carne picada de ternera', 'Zanahoria fresca picada', 'Apio fresco picado', 'Cebolla picada'],
    m: ['Pancetta de cerdo', 'Vino blanco seco', 'Salsa de tomate concentrada'],
    d: ['Leche entera incorporada', 'Caldo de carne', 'Pimienta negra recién molida'],
    t: ['Champiñón laminado de lata', 'Orégano seco abundante', 'Nata para cocinar', 'Guisante verde', 'Kétchup de tomate']
  },
  {
    c: 'Ingredientes canónicos del guacamole tradicional mexicano',
    f: ['Aguacate Hass maduro', 'Cebolla blanca picada', 'Cilantro fresco', 'Zumo de lima'],
    m: ['Chile serrano fresco', 'Sal marina común', 'Tomate rojo en dados'],
    d: ['Diente de ajo machacado', 'Chile jalapeño sin semillas', 'Aceite de oliva virgen extra'],
    t: ['Crema agria (sour cream)', 'Mayonesa comercial', 'Queso cheddar rallado', 'Comino en polvo', 'Pimienta negra molida']
  },
  {
    c: 'Ingredientes esenciales para preparar la salsa chimichurri argentina',
    f: ['Perejil fresco picado', 'Ajo fresco picado', 'Aceite de girasol u oliva', 'Vinagre de vino blanco'],
    m: ['Orégano seco', 'Ají molido picante', 'Sal marina común'],
    d: ['Pimienta negra recién molida', 'Agua tibia de hidratación', 'Hoja de laurel molida'],
    t: ['Cilantro fresco', 'Tomate maduro triturado', 'Cebolla morada', 'Salsa de soja comercial', 'Mayonesa comercial']
  },

  // 71 - 80: Cocina Tradicional de las Regiones de España
  {
    c: 'Platos típicos y tradicionales de la gastronomía de Andalucía',
    f: ['Gazpacho andaluz', 'Salmorejo cordobés', 'Pescaíto frito', 'Rabo de toro estofado'],
    m: ['Flamenquín de lomo y jamón', 'Tortillitas de camarones', 'Habas con jamón'],
    d: ['Ajoblanco malagueño', 'Pipirrana jiennense', 'Papas aliñás'],
    t: ['Fabada asturiana', 'Cocido madrileño', 'Pulpo a la gallega', 'Calçots con romesco', 'Marmitako de bonito']
  },
  {
    c: 'Platos y recetas representativas de la cocina de Galicia',
    f: ['Pulpo a la gallega', 'Empanada gallega', 'Caldo gallego', 'Pimientos de Padrón'],
    m: ['Lacón con grelos', 'Mariscada de la ría', 'Tarta de Santiago'],
    d: ['Zamburiñas a la plancha', 'Filloas de sartén', 'Percebes de la ría'],
    t: ['Paella valenciana', 'Salmorejo cordobés', 'Cochinillo asado segoviano', 'Marmitako de bonito', 'Pisto manchego']
  },
  {
    c: 'Platos e iconos gastronómicos del País Vasco',
    f: ['Bacalao al pil-pil', 'Marmitako de bonito', 'Chuletón de buey a la brasa', 'Pintxos variados de barra'],
    m: ['Bacalao a la vizcaína', 'Kokotxas de merluza en salsa verde', 'Txangurro a la donostiarra'],
    d: ['Gilda tradicional', 'Merluza en salsa verde', 'Pantxineta'],
    t: ['Gazpacho andaluz', 'Cocido madrileño', 'Fabada asturiana', 'Calçots con romesco', 'Ensaimada de Mallorca']
  },
  {
    c: 'Platos tradicionales de la cocina catalana',
    f: ['Calçots con romesco', 'Pan con tomate (pa amb tomàquet)', 'Escalivada', 'Crema catalana'],
    m: ['Butifarra con mongetes (alubias)', 'Canelones de San Esteban', 'Fideuá de marisco'],
    d: ['Esqueixada de bacalao', 'Suquet de peix', 'Escudella i carn d\'olla'],
    t: ['Fabada asturiana', 'Salmorejo cordobés', 'Cocido montañés', 'Rabo de toro estofado', 'Papas arrugadas con mojo']
  },
  {
    c: 'Platos típicos del recetario tradicional de Asturias',
    f: ['Fabada asturiana', 'Cachopo de ternera', 'Arroz con leche asturiano', 'Sidra natural'],
    m: ['Pote asturiano', 'Pastel de cabracho', 'Chorizo a la sidra'],
    d: ['Casadielles de nuez', 'Tortos de maíz con picadillo', 'Pixín (rape) al horno'],
    t: ['Gazpacho andaluz', 'Calçots con romesco', 'Paella valenciana', 'Zarajos de Cuenca', 'Papas arrugadas con mojo']
  },
  {
    c: 'Platos tradicionales de la cocina de Madrid y Castilla',
    f: ['Cocido madrileño', 'Cochinillo asado segoviano', 'Sopa de ajo castellana', 'Lechazo asado'],
    m: ['Callos a la madrileña', 'Bocadillo de calamares', 'Judiones de La Granja'],
    d: ['Entresijos y gallinejas', 'Huevos rotos de Casa Lucio', 'Besugo a la madrileña'],
    t: ['Pulpo a la gallega', 'Marmitako de bonito', 'Paella valenciana', 'Salmorejo cordobés', 'Gofio escaldado']
  },
  {
    c: 'Platos tradicionales de la gastronomía de la Comunidad Valenciana',
    f: ['Paella valenciana', 'Horchata de chufa', 'Fideuá de Gandía', 'Arroz a banda'],
    m: ['Arroz negro con sepia', 'All i pebre de anguilas', 'Fartons glaseados'],
    d: ['Arroz al horno (arròs al forn)', 'Esgarraet de pimiento y bacalao', 'Arroz caldoso con bogavante'],
    t: ['Fabada asturiana', 'Caldo gallego', 'Cachopo de ternera', 'Cocido madrileño', 'Ajoblanco malagueño']
  },
  {
    c: 'Especialidades culinarias tradicionales de las Islas Canarias',
    f: ['Papas arrugadas', 'Mojo picón rojo', 'Mojo verde de cilantro', 'Gofio escaldado'],
    m: ['Almogrote gomero', 'Ropa vieja canaria', 'Sancocho con cherne'],
    d: ['Conejo en salmorejo canario', 'Queso Majorero de cabra', 'Príncipe Alberto de chocolate'],
    t: ['Crema catalana', 'Fabada asturiana', 'Cocido madrileño', 'Pulpo a la gallega', 'Calçots con romesco']
  },
  {
    c: 'Platos tradicionales de la gastronomía de las Islas Baleares',
    f: ['Ensaimada de Mallorca', 'Sobrasada de Mallorca', 'Caldereta de langosta menorquina', 'Tumbet mallorquín'],
    m: ['Frito mallorquín', 'Queso Mahón-Menorca', 'Coca de trampó'],
    d: ['Flaó ibicenco', 'Arròs brut', 'Panades de carne'],
    t: ['Gazpacho andaluz', 'Cachopo de ternera', 'Papas arrugadas', 'Salmorejo cordobés', 'Pisto manchego']
  },
  {
    c: 'Especialidades gastronómicas de Castilla-La Mancha y Extremadura',
    f: ['Pisto manchego', 'Queso Manchego curado', 'Migas manchegas', 'Gazpacho manchego'],
    m: ['Duelos y quebrantos', 'Morteruelo conquense', 'Atascaburras'],
    d: ['Caldereta de cordero', 'Torta del Casar', 'Zarajos de Cuenca'],
    t: ['Paella valenciana', 'Marmitako de bonito', 'Pulpo a la gallega', 'Calçots con romesco', 'Fabada asturiana']
  },

  // 81 - 90: Tapas, Aperitivos y Embutidos de Calidad
  {
    c: 'Tapas clásicas servidas habitualmente en las barras de España',
    f: ['Patatas bravas', 'Croquetas de jamón', 'Ensaladilla rusa', 'Boquerones en vinagre'],
    m: ['Calamares a la romana', 'Tortilla de patatas en pincho', 'Gambas al ajillo'],
    d: ['Tigres (mejillones rellenos)', 'Torreznos de Soria', 'Pinchos morunos'],
    t: ['Perrito caliente (Hot Dog)', 'Hamburguesa con queso', 'Nuggets de pollo', 'Rollito de primavera', 'Tacos al pastor']
  },
  {
    c: 'Embutidos y chacinas tradicionales procedentes del cerdo',
    f: ['Chorizo curado español', 'Salchichón ibérico', 'Lomo embuchado', 'Morcilla de Burgos'],
    m: ['Fuet catalán', 'Sobrasada de Mallorca', 'Chistorra de Navarra'],
    d: ['Butifarra negra', 'Botillo del Bierzo', 'Morcón ibérico'],
    t: ['Pechuga de pavo braseada', 'Cecina de vaca curada', 'Pastrami de ternera', 'Queso Manchego', 'Tofu']
  },
  {
    c: 'Quesos españoles con Denominación de Origen Protegida (DOP)',
    f: ['Queso Manchego', 'Queso Cabrales', 'Torta del Casar', 'Queso Idiazábal'],
    m: ['Queso Mahón-Menorca', 'Queso Tetilla', 'Queso Majorero'],
    d: ['Queso Gamoneu', 'Queso Roncal', 'Queso Picón Bejes-Tresviso'],
    t: ['Parmigiano Reggiano', 'Queso Roquefort', 'Queso Gouda', 'Queso Cheddar', 'Queso Feta']
  },
  {
    c: 'Ingredientes de la receta tradicional de la paella valenciana canónica',
    f: ['Arroz bomba', 'Carne de pollo', 'Carne de conejo', 'Bajoqueta (judía verde)'],
    m: ['Garrofó valenciano', 'Tomate triturado', 'Aceite de oliva virgen extra'],
    d: ['Azafrán en hebras', 'Romero fresco', 'Caracoles de monte (vaquetes)'],
    t: ['Chorizo en rodajas', 'Guisante verde', 'Cebolla común', 'Pimiento rojo', 'Mejillón de roca']
  },
  {
    c: 'Ingredientes de la receta canónica del gazpacho andaluz tradicional',
    f: ['Tomate pera maduro', 'Pepino verde pelado', 'Pimiento verde italiano', 'Aceite de oliva virgen extra'],
    m: ['Diente de ajo sin germen', 'Vinagre de vino blanco', 'Pan blanco duro del día anterior'],
    d: ['Sal marina común', 'Agua mineral fría', 'Pimiento rojo fresco'],
    t: ['Zumo concentrado de naranja', 'Mayonesa comercial', 'Cebolla común', 'Pimienta de cayena', 'Nata para cocinar']
  },
  {
    c: 'Ingredientes que componen la receta tradicional del salmorejo cordobés',
    f: ['Tomate maduro rojo', 'Pan de telera cordobesa', 'Aceite de oliva virgen extra', 'Diente de ajo pelado'],
    m: ['Sal marina común', 'Jamón ibérico picado', 'Huevo duro picado'],
    d: ['Aceite virgen extra variedad Picudo', 'Miga de pan candeal', 'Gotas de vinagre de Jerez'],
    t: ['Pepino verde pelado', 'Pimiento verde italiano', 'Cebolla común', 'Agua mineral fría', 'Zanahoria']
  },
  {
    c: 'Ingredientes tradicionales de la fabada asturiana de puchero',
    f: ['Fabes asturianas de la Granja', 'Chorizo asturiano ahumado', 'Morcilla asturiana ahumada', 'Panceta curada'],
    m: ['Lacón curado', 'Agua mineral fría', 'Azafrán en hebras'],
    d: ['Hueso de jamón', 'Cebolla común para retirar', 'Hoja seca de laurel'],
    t: ['Garbanzo lechoso', 'Lenteja pardina', 'Arroz bomba', 'Zanahoria', 'Patata agria']
  },
  {
    c: 'Chacinas e ingredientes que componen el compango tradicional asturiano',
    f: ['Chorizo asturiano ahumado', 'Morcilla asturiana ahumada', 'Panceta curada', 'Lacón curado'],
    m: ['Tocino salado', 'Chorizo ahumado al roble', 'Morcilla seca de sangre'],
    d: ['Hueso de espinazo de cerdo', 'Costilla adobada ahumada', 'Oreja de cerdo curada'],
    t: ['Pechuga de pollo', 'Carne picada de ternera', 'Salchicha de Frankfurt', 'Choripán con chimichurri', 'Lomo bajo deshuesado']
  },
  {
    c: 'Especies de pescados y cefalópodos habituales en el pescaíto frito andaluz',
    f: ['Boquerones enharinados', 'Calamares en anillas', 'Chocos (sepia en tiras)', 'Puntillitas (chipirones)'],
    m: ['Cazón en adobo (bienmesabe)', 'Salmonete de roca pequeño', 'Acedías de Sanlúcar'],
    d: ['Pijotas enroscadas', 'Chanquetes de criadero', 'Lenguaditos de estero'],
    t: ['Salmón atlántico', 'Trucha de río', 'Pez espada (emperador)', 'Bacalao en salazón', 'Lubina grande salvaje']
  },
  {
    c: 'Variedades tradicionales de empanadas saladas en España y Latinoamérica',
    f: ['Empanada gallega de atún', 'Empanada tucumana de carne cortada a cuchillo', 'Empanada chilena de pino', 'Hornazo salmantino'],
    m: ['Empanadilla de atún y tomate', 'Empanada salteña con patata', 'Empanada colombiana de maíz'],
    d: ['Empanada berciana con acelga', 'Empanada de zamburiñas', 'Llandera asturiana de compango'],
    t: ['Croissant relleno de queso', 'Pizza calzone', 'Quiche Lorraine', 'Börek de queso feta', 'Tacos al pastor']
  },

  // 91 - 100: Productos Gourmet, Curiosidades y Técnicas
  {
    c: 'Productos gastronómicos gourmet de alto valor en el mercado internacional',
    f: ['Caviar de esturión Beluga', 'Trufa blanca de Alba', 'Jamón ibérico de bellota', 'Carne de vacuno de Kobe'],
    m: ['Azafrán de La Mancha en hebra', 'Foie gras de pato entero', 'Ostras Gillardeau'],
    d: ['Café Kopi Luwak', 'Trufa negra de invierno', 'Angulas vivas del Cantábrico'],
    t: ['Mortadela de cerdo corriente', 'Surimi de palitos de cangrejo', 'Margarina vegetal', 'Kétchup comercial', 'Atún en lata en aceite']
  },
  {
    c: 'Especies de setas y hongos catalogadas como altamente tóxicas o mortales en Europa',
    f: ['Amanita phalloides', 'Amanita muscaria', 'Amanita verna', 'Amanita virosa'],
    m: ['Cortinarius orellanus', 'Gyromitra esculenta (cruda)', 'Galerina marginata'],
    d: ['Lepiota brunneoincarnata', 'Boletus satanas', 'Entoloma sinuatum'],
    t: ['Boletus edulis', 'Champiñón de París', 'Níscalo', 'Amanita caesarea (oronja)', 'Trompeta de la muerte']
  },
  {
    c: 'Técnicas de cocción mediante calor húmedo en cocina profesional',
    f: ['Hervir en agua', 'Cocinar al vapor', 'Escaldar / Blanquear', 'Escalfar / Pochar'],
    m: ['Guisar en cazuela tapada', 'Estofar a fuego lento', 'Baño María'],
    d: ['Confitar en grasa suave', 'Sous-vide al vacío en agua', 'Simmering (fuego lento continuo)'],
    t: ['Asar al horno tradicional', 'Gratinar al grill', 'Saltear al wok', 'Tostar en plancha seca', 'Flambear con alcohol']
  },
  {
    c: 'Técnicas de cocción mediante calor seco en cocina',
    f: ['Asar al horno tradicional', 'Cocinar a la parrilla sobre brasas', 'Saltear en sartén', 'Gratinar al grill'],
    m: ['Cocinar a la plancha de acero', 'Dorar a fuego vivo', 'Hornear masas de panadería'],
    d: ['Tostar frutos secos al calor', 'Flambear con licor', 'Caramelizar con soplete'],
    t: ['Hervir en agua', 'Cocinar al vapor', 'Escalfar / Pochar', 'Escaldar / Blanquear', 'Confitar en grasa suave']
  },
  {
    c: 'Tipos de cortes de verduras reglados en la cocina profesional francesa',
    f: ['Juliana (tiras finas alargadas)', 'Brunoise (dados de 2 mm)', 'Mirepoix (dados aromáticos)', 'Chiffonade (tiras de hoja verde)'],
    m: ['Bastonetes (bastones uniformes)', 'Jardinera (dados de 5 mm)', 'Rodajas Vichy'],
    d: ['Torneado con puntilla', 'Paisana (láminas planas)', 'Concassé de tomate'],
    t: ['Picar con picadora eléctrica', 'Triturar con batidora', 'Rallar con rallador grueso', 'Machacar con mortero', 'Licuar con extractor']
  },
  {
    c: 'Partes botánicas de las plantas que dan origen a alimentos comunes',
    f: ['Fruto (tomate o manzana)', 'Semilla (garbanzo o arroz)', 'Raíz (zanahoria o nabo)', 'Hoja (espinaca o acelga)'],
    m: ['Tallo comestible (espárrago)', 'Inflorescencia (alcachofa o brócoli)', 'Tubérculo (patata)'],
    d: ['Bulbo subterráneo (cebolla o ajo)', 'Corteza seca (canela)', 'Rizoma subterráneo (jengibre)'],
    t: ['Polen puro en polvo', 'Savia pura envasada', 'Clorofila en pastillas', 'Madera de roble', 'Seda vegetal']
  },
  {
    c: 'Tipos de caldos y fondos base en la cocina profesional',
    f: ['Fondo oscuro de ternera', 'Fondo blanco de ave', 'Fumet de pescado blanco', 'Caldo de verduras'],
    m: ['Caldo de puchero', 'Glace de carne concentrada', 'Court-bouillon para hervir pescado'],
    d: ['Demi-glace de fondo oscuro', 'Fumet de marisco', 'Consomé clarificado'],
    t: ['Agua con pastilla de caldo industrial', 'Aceite de freír usado', 'Salsa de tomate casera', 'Leche entera hervida', 'Nata para cocinar']
  },
  {
    c: 'Alimentos de origen vegetal de alto contenido proteico',
    f: ['Lentejas cocidas', 'Garbanzos cocidos', 'Tofu de soja', 'Soja texturizada'],
    m: ['Seitán (gluten de trigo)', 'Tempeh de soja', 'Semillas de cáñamo'],
    d: ['Edamame en vaina', 'Levadura nutricional en copos', 'Altramuces en salmuera'],
    t: ['Pechuga de pollo', 'Atún rojo enlatado', 'Clara de huevo', 'Gelatina animal en láminas', 'Solomillo de ternera']
  },
  {
    c: 'Ingredientes presentes en la receta canónica de la carbonara romana tradicional',
    f: ['Yemas de huevo frescas', 'Queso Pecorino Romano rallado', 'Guanciale de careta de cerdo', 'Pimienta negra recién molida'],
    m: ['Huevo entero batido', 'Agua de cocción de la pasta', 'Queso Parmigiano Reggiano'],
    d: ['Grasa fundida del guanciale', 'Pasta larga tipo espagueti', 'Sal marina común en cocción'],
    t: ['Nata para cocinar', 'Champiñón laminado de lata', 'Cebolla común pochada', 'Bacon ahumado en tiras', 'Diente de ajo dorado']
  },
  {
    c: 'Técnicas tradicionales de conservación de alimentos empleadas históricamente',
    f: ['Salazón en sal marina seca', 'Ahumado con leña noble', 'Secado y deshidratación al sol', 'Encurtido en vinagre y sal'],
    m: ['Escabeche aromatizado', 'Confitado cubierto en grasa animal', 'Fermentación láctica'],
    d: ['Liofilización natural andina', 'Adobo con pimentón y orégano', 'Curación al aire frío de sierra'],
    t: ['Congelación en congelador eléctrico', 'Pasteurización industrial UHT', 'Envasado al vacío con selladora', 'Irradiación ionizante', 'Esterilización en autoclave']
  }
];

export default Array.from({ length: 100 }, (_, idx) => {
  const p = plantillas[idx];
  return {
    id: `gastronomia_${idx + 1}`,
    consigna: p.c,
    correctos: { faciles: p.f, medios: p.m, dificiles: p.d },
    trampas: p.t
  };
});