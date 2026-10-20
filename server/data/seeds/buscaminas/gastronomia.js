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
    t: ['Paella', 'Ratatouille', 'Moussaka', 'Tacos', 'Ceviche']
  },
  {
    c: 'Platos e ingredientes clásicos de la cocina mexicana',
    f: ['Tacos al pastor', 'Guacamole con totopos', 'Enchiladas verdes', 'Quesadillas de queso'],
    m: ['Mole poblano', 'Pozole rojo', 'Chiles en nogada'],
    d: ['Tamales de elote', 'Cochinita pibil', 'Chilaquiles con salsa roja'],
    t: ['Arepas', 'Ceviche con maracuyá', 'Empanadas tucumanas', 'Nachos con queso cheddar (Tex-Mex)', 'Burrito de California']
  },
  {
    c: 'Platos y preparaciones de la cocina tradicional japonesa',
    f: ['Sushi variado', 'Ramen de fideos', 'Sashimi de atún rojo', 'Tempura de langostinos'],
    m: ['Gyoza al vapor', 'Yakitori de pollo', 'Sopa de miso blanco'],
    d: ['Okonomiyaki', 'Takoyaki de pulpo', 'Tonkatsu de cerdo ibérico'],
    t: ['Pad Thai', 'Dim Sum cantón', 'Rollito de primavera', 'Kimchi fermentado', 'Pho de ternera']
  },
  {
    c: 'Platos y recetas de la alta cocina tradicional francesa',
    f: ['Ratatouille', 'Sopa de cebolla gratinada', 'Quiche Lorraine', 'Soufflé de queso'],
    m: ['Boeuf Bourguignon', 'Confit de pato', 'Coq au vin'],
    d: ['Cassoulet de Castelnaudary', 'Bouillabaisse de Marsella', 'Tartiflette savoyarda'],
    t: ['Lasaña', 'Fabada', 'Moussaka', 'Gulash', 'Risotto']
  },
  {
    c: 'Platos e ingredientes típicos de la cocina tradicional china',
    f: ['Pato laqueado a la pequinesa', 'Arroz frito tres delicias', 'Dim sum de cerdo', 'Rollito de primavera'],
    m: ['Pollo Kung Pao', 'Mapo tofu picante', 'Sopa wantán'],
    d: ['Chow mein de verduras', 'Cerdo agridulce cantonés', 'Baozi relleno al vapor'],
    t: ['Sushi de salmón', 'Pad thai', 'Ramen de miso', 'Kimchi', 'Pho bo']
  },
  {
    c: 'Platos tradicionales de la gastronomía griega y mediterránea oriental',
    f: ['Moussaka de berenjena', 'Salsa tzatziki', 'Ensalada griega con feta', 'Gyros de pollo'],
    m: ['Souvlaki en brocheta', 'Spanakopita de espinacas', 'Dolmades en hoja de parra'],
    d: ['Taramosalata de huevas', 'Pastitsio al horno', 'Kleftiko de cordero'],
    t: ['Cuscús con verduras', 'Hummus libanés', 'Pizza calzone', 'Ratatouille', 'Paella de marisco']
  },
  {
    c: 'Especialidades culinarias de la cocina de la India',
    f: ['Pollo Tikka Masala', 'Pan Naan tierno', 'Samosa de verduras', 'Pollo al curry'],
    m: ['Pollo Butter Chicken', 'Biryani de cordero', 'Lassi de mango'],
    d: ['Dosa crujiente del sur', 'Dal makhani de lentejas', 'Palak paneer con queso'],
    t: ['Ramen', 'Rollito de primavera', 'Ceviche', 'Kebab döner', 'Chow mein']
  },
  {
    c: 'Platos y comidas típicas de la cultura popular de Estados Unidos',
    f: ['Hamburguesa con queso cheddar', 'Perrito caliente (Hot Dog)', 'Costillas BBQ a la barbacoa', 'Tarta de manzana (Apple Pie)'],
    m: ['Macarrones con queso (Mac and Cheese)', 'Alitas de pollo Buffalo', 'Clam chowder de Nueva Inglaterra'],
    d: ['Gumbo de Luisiana', 'Philly cheesesteak', 'Jambalaya criolla'],
    t: ['Paella mixta', 'Tacos al pastor', 'Sushi maki', 'Pastel de nata', 'Wiener Schnitzel']
  },
  {
    c: 'Platos emblemáticos de la gastronomía de Tailandia',
    f: ['Pad Thai de fideos', 'Sopa Tom Yum picante', 'Curry verde tailandés', 'Arroz pegajoso con mango'],
    m: ['Curry rojo de pollo', 'Som Tum (ensalada de papaya verde)', 'Tom Kha Gai con coco'],
    d: ['Massaman curry de ternera', 'Pad See Ew', 'Khao Soi de fideos crujientes'],
    t: ['Sushi nigiri', 'Rollito vietnamita fresco', 'Ramen tonkotsu', 'Gyoza frita', 'Dim sum']
  },

  // 11 - 20: Cocinas del Mundo II
  {
    c: 'Especialidades de la laureada gastronomía peruana',
    f: ['Ceviche clásico de pescado', 'Causa limeña', 'Lomo saltado', 'Ají de gallina'],
    m: ['Anticuchos de corazón', 'Papas a la huancaína', 'Arroz chaufa de mariscos'],
    d: ['Tiradito de corvina', 'Rocoto relleno arequipeño', 'Seco de cabrito con frijoles'],
    t: ['Arepas asadas', 'Tacos de carnitas', 'Empanadas salteñas', 'Feijoada', 'Guacamole']
  },
  {
    c: 'Platos y elementos de la gastronomía tradicional argentina',
    f: ['Asado a la parrilla', 'Empanadas criollas', 'Milanesa napolitana', 'Alfajores de maicena'],
    m: ['Choripán con chimichurri', 'Provoleta a la brasa', 'Matambre a la pizza'],
    d: ['Locro criollo del 25 de Mayo', 'Vacío a la estaca', 'Bife de chorizo con guarnición'],
    t: ['Feijoada completa', 'Ceviche mixto', 'Arepa rellena de queso', 'Tacos de suadero', 'Bandeja paisa']
  },
  {
    c: 'Especialidades culinarias de Turquía y Oriente Medio',
    f: ['Kebab döner', 'Hummus de garbanzo', 'Falafel crujiente', 'Baklava de pistacho'],
    m: ['Lahmacun (pizza turca)', 'Shakshuka de huevos', 'Babas ganoush de berenjena'],
    d: ['Kofte especiado a la brasa', 'Börek de queso feta', 'Pide tradicional al horno'],
    t: ['Moussaka griega', 'Tacos al pastor', 'Pollo tikka masala', 'Ceviche', 'Risotto de marisco']
  },
  {
    c: 'Platos tradicionales de la gastronomía alemana y centroeuropea',
    f: ['Bratwurst a la parrilla', 'Chucrut fermentado (Sauerkraut)', 'Codillo de cerdo (Eisbein)', 'Pretzel salado'],
    m: ['Currywurst con patatas', 'Kartoffelsalat (ensalada de patata)', 'Schnitzel vienés'],
    d: ['Sauerbraten marinado', 'Spätzle de huevo', 'Knödel de patata'],
    t: ['Pizza cuatro quesos', 'Gazpacho andaluz', 'Lasaña boloñesa', 'Paella valenciana', 'Ratatouille']
  },
  {
    c: 'Platos típicos de la gastronomía de Marruecos y el Magreb',
    f: ['Cuscús con verduras y cordero', 'Tajín de pollo con limón encurtido', 'Pastela moruna hojaldrada', 'Té verde a la menta'],
    m: ['Harira (sopa tradicional)', 'Zaalouk de berenjena', 'Kofta de ternera en salsa'],
    d: ['Tajín de kefta con huevos', 'Msemen (panqueque hojaldrado)', 'Briouats de carne picada'],
    t: ['Hummus libanés', 'Sushi maki', 'Moussaka', 'Tacos dorados', 'Pad thai']
  },
  {
    c: 'Platos tradicionales de la gastronomía portuguesa',
    f: ['Bacalhau à Brás', 'Pasteles de Belém (Nata)', 'Francesinha de Oporto', 'Sardinas asadas'],
    m: ['Caldo verde con chouriço', 'Bacalhau com natas', 'Polvo à lagareiro'],
    d: ['Cataplana de mariscos del Algarve', 'Arroz de pato al horno', 'Bifana de cerdo'],
    t: ['Paella mixta', 'Empanada gallega', 'Pizza romana', 'Fabada asturiana', 'Ratatouille']
  },
  {
    c: 'Platos e ingredientes de la cocina de Vietnam',
    f: ['Sopa Pho de ternera', 'Bánh mì (bocadillo vietnamita)', 'Rollitos de primavera frescos (Goi cuon)', 'Café vietnamita con leche condensada'],
    m: ['Bun cha de cerdo a la brasa', 'Bánh xèo (crepe crujiente)', 'Cao lau de fideos'],
    d: ['Bo luc lac de ternera salteada', 'Cha ca La Vong de pescado', 'Canh chua de marisco'],
    t: ['Pad thai', 'Ramen de cerdo', 'Sushi nigiri', 'Tom yum soup', 'Dim sum']
  },
  {
    c: 'Especialidades culinarias de Colombia y Venezuela',
    f: ['Arepa reina pepiada', 'Bandeja paisa', 'Tequeños de queso fritos', 'Empanadas de maíz'],
    m: ['Pabellón criollo', 'Ajiaco santafereño', 'Sancocho de gallina'],
    d: ['Hallaca navideña', 'Cachapa con queso de mano', 'Pandebono caliente'],
    t: ['Tacos al pastor', 'Ceviche limeño', 'Enchiladas suizas', 'Feijoada', 'Choripán argentino']
  },
  {
    c: 'Platos e ingredientes de la gastronomía de Corea del Sur',
    f: ['Kimchi de col fermentada', 'Bibimbap con verduras y huevo', 'Barbacoa coreana (KBBQ)', 'Tteokbokki picante'],
    m: ['Bulgogi de ternera marinada', 'Pollo frito coreano crujiente', 'Japchae de fideos de boniato'],
    d: ['Samgyeopsal a la plancha', 'Sundubu-jjigae de tofu suave', 'Kimchi jjigae caliente'],
    t: ['Sushi de atún', 'Ramen japonés', 'Pato laqueado', 'Dim sum', 'Pad thai']
  },
  {
    c: 'Platos tradicionales de la gastronomía de Brasil',
    f: ['Feijoada completa con arroz', 'Pão de queijo horneado', 'Picanha a la brasa', 'Brigadeiro de chocolate'],
    m: ['Moqueca bahiana de pescado', 'Acarajé frito con camarones', 'Coxinha de pollo desmechado'],
    d: ['Vatapá con leche de coco', 'Farofa de mandioca tostada', 'Pastel de palmito frito'],
    t: ['Ceviche peruano', 'Asado argentino con chimichurri', 'Arepa rellena', 'Tacos de carnitas', 'Empanada chilena']
  },

  // 21 - 30: Ingredientes y Alimentos Básicos
  {
    c: 'Variedades y tipos de quesos reconocidos en todo el mundo',
    f: ['Queso Manchego', 'Parmesano (Parmigiano Reggiano)', 'Mozzarella di Bufala', 'Queso Cheddar curado'],
    m: ['Queso Brie francés', 'Queso Gouda holandés', 'Queso Roquefort azul'],
    d: ['Queso Camembert de Normandía', 'Gruyère suizo', 'Gorgonzola italiano'],
    t: ['Tofu de soja', 'Mantequilla con sal', 'Nata montada', 'Yogur griego', 'Cuajada fresca']
  },
  {
    c: 'Cortes nobles de carne vacuna / ternera',
    f: ['Solomillo de ternera', 'Chuletón con hueso', 'Entrecot a la plancha', 'Costillar vacuno'],
    m: ['Lomo alto', 'Lomo bajo deshuesado', 'T-bone steak'],
    d: ['Picaña de ternera', 'Vacío de ternera', 'Babilla tierna'],
    t: ['Pechuga de pollo', 'Contramuslo de pavo', 'Magret de pato', 'Panceta de cerdo', 'Secreto ibérico']
  },
  {
    c: 'Cortes gastronómicos procedentes del cerdo ibérico',
    f: ['Jamón ibérico de bellota', 'Secreto ibérico', 'Pluma ibérica', 'Presa ibérica'],
    m: ['Solomillo de cerdo ibérico', 'Lomo ibérico embuchado', 'Costillas ibéricas adobadas'],
    d: ['Carrillera ibérica estofada', 'Lagarto ibérico a la brasa', 'Abanico ibérico'],
    t: ['Entrecot vacuno', 'Magret de pato', 'Chuletón de buey', 'Picaña de ternera', 'Alitas de pollo']
  },
  {
    c: 'Tipos de pescado azul ricos en ácidos grasos Omega-3',
    f: ['Salmón atlántico', 'Atún rojo salvaje', 'Sardina común', 'Boquerón fresco'],
    m: ['Caballa del Cantábrico', 'Bonito del norte', 'Jurel (chicharro)'],
    d: ['Pez espada (emperador)', 'Arenque ahumado', 'Anguila de río'],
    t: ['Merluza blanca', 'Bacalao fresco', 'Lenguado de costa', 'Gallo del norte', 'Rape blanco']
  },
  {
    c: 'Tipos de pescado blanco con bajo contenido en grasa',
    f: ['Merluza de pincho', 'Bacalao desalado', 'Lenguado común', 'Rape de ría'],
    m: ['Lubina salvaje', 'Dorada de mar', 'Rodaballo salvaje'],
    d: ['Gallo de costa', 'Abadejo fresco', 'Pescadilla de lonja'],
    t: ['Salmón fresco', 'Sardina asada', 'Atún rojo', 'Caballa fresca', 'Arenque marinado']
  },
  {
    c: 'Mariscos moluscos y crustáceos de consumo habitual',
    f: ['Langostino tigre', 'Gamba roja', 'Mejillón de roca', 'Almeja fina'],
    m: ['Centollo gallego', 'Bogavante azul', 'Cigala de costa'],
    d: ['Percebe de acantilado', 'Nécora de la ría', 'Berberecho vivo'],
    t: ['Merluza de pincho', 'Pulpo (cefalópodo, no marisco con concha/caparazón)', 'Anchoa en salazón', 'Salmón ahumado', 'Rape']
  },
  {
    c: 'Variedades de arroz cultivadas y consumidas en el mundo',
    f: ['Arroz bomba', 'Arroz basmati aromático', 'Arroz jazmín tailandés', 'Arroz arborio para risotto'],
    m: ['Arroz carnaroli italiano', 'Arroz integral de grano largo', 'Arroz glutinoso asiático'],
    d: ['Arroz salvaje (zizania)', 'Arroz rojo de la Camarga', 'Arroz senia valenciano'],
    t: ['Cuscús de trigo', 'Semillas de quinoa', 'Trigo sarraceno', 'Polenta de maíz', 'Copos de avena']
  },
  {
    c: 'Tipos de pasta italiana seca o fresca tradicional',
    f: ['Spaghetti largos', 'Penne rigate (macarrones)', 'Tagliatelle al huevo', 'Ravioli rellenos'],
    m: ['Fettuccine planos', 'Fusilli en espiral', 'Gnocchi de patata'],
    d: ['Tortellini bolognesi', 'Rigatoni estriados', 'Farfalle en lazo'],
    t: ['Cuscús fino', 'Quinoa cocida', 'Arroz basmati', 'Polenta de maíz', 'Fideos de soja']
  },
  {
    c: 'Tipos de pan tradicionales de diversas culturas',
    f: ['Baguette francesa', 'Pan de masa madre rústico', 'Pan de pita árabe', 'Focaccia italiana'],
    m: ['Pan Naan indio', 'Pan chapata (ciabatta)', 'Pan de molde brioche'],
    d: ['Pumpernickel alemán de centeno', 'Bagel neoyorquino', 'Injera etíope fermentada'],
    t: ['Tortilla de patata', 'Crepe dulce', 'Gofre belga', 'Taco de harina de maíz', 'Empanadilla frita']
  },
  {
    c: 'Cortes tradicionales de carne de pollo o aves',
    f: ['Pechuga de pollo fileteada', 'Contramuslo deshuesado', 'Muslo de pollo (jamoncito)', 'Alitas de pollo'],
    m: ['Solomillo de pechuga', 'Carcasa de ave para caldo', 'Magret de pechuga de pato'],
    d: ['Mollejas de ave confitadas', 'Hígado de pollo limpio', 'Cuello de pavo'],
    t: ['Chuletón vacuno', 'Carrillera de cerdo', 'Secreto ibérico', 'Picaña de ternera', 'Costillar de cerdo']
  },

  // 31 - 40: Frutas, Verduras y Especias
  {
    c: 'Frutas tropicales y exóticas reconocidas',
    f: ['Plátano de Canarias', 'Piña tropical madura', 'Mango dulce', 'Papaya fresca'],
    m: ['Maracuyá (fruta de la pasión)', 'Coco maduro', 'Guayaba rosada'],
    d: ['Pitahaya (fruta del dragón)', 'Carambola estrellada', 'Lichi fresco'],
    t: ['Manzana reineta', 'Pera conferencia', 'Cereza del Jerte', 'Uva blanca', 'Melocotón de Calanda']
  },
  {
    c: 'Cítricos de uso gastronómico habitual',
    f: ['Limón amarillo', 'Naranja dulce', 'Mandarina clementina', 'Lima verde ácida'],
    m: ['Pomelo rosa', 'Naranja amarga de Sevilla', 'Kumquat enano'],
    d: ['Yuzu japonés', 'Mano de Buda', 'Bergamota aromática'],
    t: ['Manzana golden', 'Plátano maduro', 'Fresón de Palos', 'Kiwi verde', 'Sandía sin pepitas']
  },
  {
    c: 'Frutas del bosque y bayas dulces o ácidas',
    f: ['Fresa silvestre', 'Frambuesa roja', 'Arándano azul fresco', 'Mora de zarza'],
    m: ['Grosella roja brillante', 'Grosella negra', 'Fresa de bosque'],
    d: ['Endrina silvestre', 'Camemoro ártico', 'Baya de saúco madura'],
    t: ['Plátano', 'Melón piel de sapo', 'Manzana fuji', 'Mango tropical', 'Papaya']
  },
  {
    c: 'Setas y hongos silvestres o de cultivo muy apreciados en cocina',
    f: ['Champiñón de París', 'Seta Boletus edulis', 'Níscalo de pinar', 'Trufa negra de invierno'],
    m: ['Chanterelle (rebozuelo)', 'Hongo Shiitake', 'Seta de ostra'],
    d: ['Amanita caesarea (oronja)', 'Trompeta de la muerte', 'Colmenilla de primavera'],
    t: ['Amanita phalloides (mortal)', 'Alga wakame', 'Musgo verde', 'Líquenes de roca', 'Helecho']
  },
  {
    c: 'Verduras y hortalizas de hoja verde comestibles',
    f: ['Espinaca fresca', 'Lechuga romana crujiente', 'Acelga de huerta', 'Col rizada (kale)'],
    m: ['Rúcula silvestre', 'Canónigos tiernos', 'Endivia blanca'],
    d: ['Berro de agua', 'Borraja tierna', 'Hojas de mostaza verde'],
    t: ['Tomate maduro', 'Zanahoria naranja', 'Berenjena morada', 'Pimiento rojo asado', 'Calabacín verde']
  },
  {
    c: 'Legumbres secas o cocidas básicas en la alimentación',
    f: ['Garbanzo lechoso', 'Lenteja pardina', 'Alubia blanca (judía)', 'Guisante verde'],
    m: ['Alubia roja de riñón', 'Lenteja roja pelada', 'Haba seca'],
    d: ['Alubia tolosana negra', 'Garrofó de paella', 'Azuki japonesa roja'],
    t: ['Arroz bomba', 'Semillas de quinoa', 'Maíz dulce en grano', 'Trigo sarraceno', 'Patata monalisa']
  },
  {
    c: 'Tubérculos y raíces comestibles utilizadas en la cocina',
    f: ['Patata agria de freír', 'Zanahoria dulce', 'Boniato / Batata naranja', 'Cebolla común'],
    m: ['Yuca / Mandioca cocida', 'Remolacha roja', 'Nabo blanco'],
    d: ['Chirivía aromática', 'Tupinambo (aguaturma)', 'Ñame tropical'],
    t: ['Tomate de huerta', 'Pimiento verde', 'Calabacín tierno', 'Berenjena listada', 'Pepino holandés']
  },
  {
    c: 'Frutos secos naturales y semillas oleaginosas',
    f: ['Nueces de nogal', 'Almendras crudas peladas', 'Avellanas tostadas', 'Pistachos tostados'],
    m: ['Cacahuetes tostados', 'Castañas asadas de otoño', 'Anacardos naturales'],
    d: ['Nueces de macadamia', 'Piñones nacionales de pino piñonero', 'Nueces de Brasil'],
    t: ['Pipas de girasol', 'Pipas de calabaza', 'Kikos de maíz frito', 'Uvas pasas dulces', 'Dátiles de rama']
  },
  {
    c: 'Hierbas aromáticas culinarias empleadas en fresco o seco',
    f: ['Orégano silvestre seco', 'Albahaca dulce fresca', 'Romero leñoso aromático', 'Perejil rizado fresco'],
    m: ['Tomillo común', 'Cilantro fresco', 'Hierbabuena fresca'],
    d: ['Estragón francés fresco', 'Eneldo aromático de pescado', 'Salvia común de huerto'],
    t: ['Canela en rama', 'Pimienta negra en grano', 'Nuez moscada entera', 'Clavo de olor', 'Azafrán en hebras']
  },
  {
    c: 'Especias clásicas empleadas en la cocina internacional',
    f: ['Pimienta negra en grano', 'Canela de Ceilán en rama', 'Pimentón dulce de La Vera', 'Comino molido'],
    m: ['Cúrcuma en polvo', 'Clavo de olor aromático', 'Nuez moscada rallada'],
    d: ['Azafrán puro en hebras', 'Cardamomo verde en vaina', 'Anís estrellado entero'],
    t: ['Sal marina yodada', 'Levadura de panadería', 'Bicarbonato sódico alimentario', 'Azúcar blanco', 'Vinagre de manzana']
  },

  // 41 - 50: Postres, Repostería y Chocolates
  {
    c: 'Postres y tartas de fama internacional de pastelería',
    f: ['Tiramisú italiano de café', 'Tarta de queso horneada (Cheesecake)', 'Brownie de chocolate y nueces', 'Tarta de manzana tibia'],
    m: ['Crème brûlée caramelizada', 'Profiteroles rellenos de nata', 'Tarta Sacher de Viena'],
    d: ['Tarta Selva Negra alemana', 'Tarta Tatin invertida', 'Mille-feuille (milhojas francés)'],
    t: ['Tortilla francesa de huevo', 'Empanada gallega de atún', 'Quiche Lorraine salada', 'Focaccia con romero', 'Gazpacho andaluz']
  },
  {
    c: 'Piezas tradicionales de la bollería y pastelería francesa',
    f: ['Croissant de mantequilla', 'Pain au chocolat (napolitana)', 'Macaron de colores', 'Éclair de chocolate'],
    m: ['Brioche suave trenzado', 'Madeleine (magdalena francesa)', 'Canelé de Burdeos'],
    d: ['Kouign-amann bretón', 'Financier de almendra', 'Choux con azúcar perla'],
    t: ['Churros con azúcar', 'Donut glaseado de masa frita', 'Ensaimada mallorquina', 'Sobaos pasiegos', 'Torrijas de leche']
  },
  {
    c: 'Dulces y postres típicos de la repostería española',
    f: ['Churros con chocolate caliente', 'Torrijas de Semana Santa', 'Crema catalana tostada', 'Arroz con leche asturiano'],
    m: ['Ensaimada de Mallorca', 'Tarta de Santiago de almendra', 'Polvorón tradicional de Estepa'],
    d: ['Piononos de Santa Fe', 'Bartolillos de crema madrileños', 'Pestiños con miel andaluces'],
    t: ['Croissant francés', 'Tiramisú con mascarpone', 'Macaron parisino', 'Brownie americano', 'Baklava turco']
  },
  {
    c: 'Ingredientes puros en la elaboración tradicional del chocolate',
    f: ['Pasta o licor de cacao', 'Manteca de cacao', 'Azúcar blanco o moreno', 'Cacao en polvo desgrasado'],
    m: ['Leche en polvo (chocolate con leche)', 'Vainilla natural en vaina', 'Lecitina de soja (emulsionante)'],
    d: ['Nibs de cacao tostado', 'Grasa láctea anhidra', 'Cacao fino de aroma Criollo'],
    t: ['Harina de trigo repostera', 'Levadura química', 'Aceite de oliva virgen', 'Huevo entero crudo', 'Gelatina de cerdo']
  },
  {
    c: 'Postres tradicionales italianos reconocidos en todo el mundo',
    f: ['Tiramisú clásico', 'Panna cotta con frutos rojos', 'Cannoli sicilianos rellenos', 'Helado artesanal (Gelato)'],
    m: ['Zabaione (sabayón de vino)', 'Sfogliatella napolitana', 'Babà napolitano al ron'],
    d: ['Zuccotto florentino', 'Torta caprese de almendra y cacao', 'Seadas sardas con miel'],
    t: ['Crema catalana', 'Crème brûlée francesa', 'Baklava oriental', 'Brownie con helado', 'Flan de huevo casero']
  },
  {
    c: 'Dulces y pastas de miel tradicionales de Oriente Medio y el Magreb',
    f: ['Baklava de hojaldre y pistacho', 'Halva de sésamo y azúcar', 'Turkish delight (Loukoum)', 'Chebakia marroquí'],
    m: ['Kunafa / Knafeh con queso dulce', 'Ma\'amoul relleno de dátiles', 'Basbousa de sémola empapada'],
    d: ['Qatayef frito relleno de nuez', 'Awameh (bolitas fritas en almíbar)', 'Ghoriba de almendra'],
    t: ['Tarta Selva Negra', 'Churros con chocolate', 'Tarta de queso Philadelphia', 'Croissant de mantequilla', 'Macaron']
  },
  {
    c: 'Frutas empleadas habitualmente en almíbar o compotas dulces',
    f: ['Melocotón en almíbar', 'Pera al vino dulce', 'Manzana caramelizada', 'Cereza en almíbar'],
    m: ['Higo confitado en miel', 'Albaricoque en almíbar', 'Piña en su jugo dulce'],
    d: ['Marmelo (membrillo en dulce)', 'Kumquat en almíbar especiado', 'Marrón glacé (castaña confitada)'],
    t: ['Aguacate maduro', 'Pepino holandés', 'Ajo blanco', 'Cebolla tierna', 'Tomate verde']
  },
  {
    c: 'Ingredientes básicos del flan de huevo tradicional casero',
    f: ['Huevos enteros de gallina', 'Leche entera fresca', 'Azúcar blanco de caña', 'Caramelo líquido para el molde'],
    m: ['Yema de huevo adicional', 'Cáscara de limón fresca', 'Rama de canela aromatizada'],
    d: ['Vaina de vainilla natural raspada', 'Pizca de sal común fina', 'Azúcar caramelizado al fuego'],
    t: ['Harina de trigo repostera', 'Levadura química en polvo', 'Cacao puro en polvo', 'Aceite de girasol', 'Queso crema de untar']
  },
  {
    c: 'Tipos de tartas horneadas tradicionales con relleno de queso',
    f: ['Cheesecake neoyorquino al horno', 'Tarta de queso de La Viña (San Sebastián)', 'Tarta de ricota italiana', 'Tarta de queso fría con gelatina'],
    m: ['Tarta de queso de cabra curado', 'Käsekuchen alemana de quark', 'Tarta de mascarpone horneada'],
    d: ['Fiadone de brocciu corso', 'Flaó ibicenco con hierbabuena', 'Ostkaka sueca tradicional'],
    t: ['Tarta Selva Negra', 'Tarta de manzana hojaldrada', 'Tarta de Santiago', 'Tiramisú con café', 'Torta Sacher vienesa']
  },
  {
    c: 'Masas y dulces fritos tradicionales de festividades',
    f: ['Churros de lazo fritos', 'Porras madrileñas gruesas', 'Buñuelos de viento rellenos', 'Torrijas fritas de sartén'],
    m: ['Pestiños andaluces con miel', 'Donuts glaseados tradicionales', 'Fritillas manchegas de sartén'],
    d: ['Flores fritas manchegas crujientes', 'Orejas de Carnaval gallegas', 'Casadielles fritas asturianas'],
    t: ['Bizcocho genovés al horno', 'Magdalenas caseras al horno', 'Galletas de mantequilla al horno', 'Macarons parisinos', 'Merengue italiano horneado']
  },

  // 51 - 60: Bebidas, Vinos y Cafés
  {
    c: 'Variedades de uva tinta empleadas para la elaboración de vino',
    f: ['Tempranillo de Rioja', 'Cabernet Sauvignon', 'Merlot bordelés', 'Syrah / Shiraz'],
    m: ['Garnacha tinta de Aragón', 'Pinot Noir de Borgoña', 'Monastrell del Levante'],
    d: ['Nebbiolo de Piamonte', 'Sangiovese de Toscana', 'Malbec argentino'],
    t: ['Chardonnay (uva blanca)', 'Verdejo (uva blanca)', 'Albariño (uva blanca)', 'Sauvignon Blanc (uva blanca)', 'Macabeo (uva blanca)']
  },
  {
    c: 'Variedades de uva blanca empleadas para la elaboración de vino',
    f: ['Chardonnay', 'Verdejo de Rueda', 'Albariño de Rías Baixas', 'Sauvignon Blanc'],
    m: ['Garnacha blanca', 'Viura (Macabeo)', 'Riesling alemán'],
    d: ['Godello de Valdeorras', 'Moscatel de grano menudo', 'Gewürztraminer aromático'],
    t: ['Tempranillo', 'Cabernet Sauvignon', 'Merlot', 'Syrah', 'Garnacha tinta']
  },
  {
    c: 'Estilos y tipos de cerveza elaborados internacionalmente',
    f: ['Lager rubia tradicional', 'IPA (India Pale Ale)', 'Stout negra cremosa', 'Pilsner clásica checa'],
    m: ['Pale Ale dorada', 'Cerveza de trigo (Weizenbier)', 'Porter oscura de malta'],
    d: ['Lambic de fermentación espontánea', 'Saison belga de granja', 'Gose alemana ácida con sal'],
    t: ['Vino tinto de crianza', 'Sidra natural asturiana', 'Whisky de malta añejo', 'Vodka destilado', 'Kombucha de té verde']
  },
  {
    c: 'Preparaciones clásicas de café servidas en cafeterías',
    f: ['Café espresso solo', 'Café con leche (Latte)', 'Capuchino con espuma', 'Café americano aguado'],
    m: ['Café cortado con poca leche', 'Café bombón con leche condensada', 'Café moca con chocolate'],
    d: ['Ristretto corto concentrado', 'Flat White de doble espresso', 'Café frappé griego helado'],
    t: ['Té matcha batido', 'Té verde de jazmín', 'Infusión de manzanilla con anís', 'Chocolate a la taza', 'Rooibos sudafricano']
  },
  {
    c: 'Variedades de té originarias de la planta Camellia sinensis',
    f: ['Té negro clásico', 'Té verde japonés o chino', 'Té blanco de brotes tiernos', 'Té rojo (Pu-erh fermentado)'],
    m: ['Té Oolong (azul semi-fermentado)', 'Té Earl Grey aromatizado con bergamota', 'Té matcha en polvo ceremonial'],
    d: ['Té Sencha japonés común', 'Té Lapsang Souchong ahumado', 'Té Darjeeling de la India'],
    t: ['Infusión de manzanilla', 'Infusión de tila para dormir', 'Menta poleo digestivo', 'Rooibos sudafricano (arbusto distinto)', 'Agua de Jamaica con hibisco']
  },
  {
    c: 'Cócteles alcohólicos clásicos reconocidos por la IBA',
    f: ['Mojito cubano con ron', 'Margarita con tequila', 'Piña Colada tropical', 'Dry Martini con ginebra'],
    m: ['Negroni con campari y vermut', 'Old Fashioned de whisky bourbon', 'Daiquiri clásico de limón y ron'],
    d: ['Manhattan con whisky de centeno', 'Whiskey Sour con clara de huevo', 'Bloody Mary con zumo de tomate'],
    t: ['Sangría casera de jarra', 'Tinto de verano con limón', 'Cerveza con gaseosa (clara)', 'Agua de Valencia casera', 'Kalimotxo de fiesta']
  },
  {
    c: 'Bebidas alcohólicas espirituosas destiladas blancas',
    f: ['Vodka de cereal o patata', 'Ginebra seca con enebro', 'Tequila blanco 100% agave', 'Ron blanco agrícola'],
    m: ['Pisco peruano o chileno', 'Mezcal blanco de maguey', 'Grappa de orujo italiana'],
    d: ['Orujo blanco gallego', 'Cachaça brasileña de caña pura', 'Aguardiente anisado seco'],
    t: ['Whisky escocés añejado en roble', 'Brandy solera de Jerez', 'Coñac francés de barrica', 'Ron añejo reserva', 'Cerveza negra tostada']
  },
  {
    c: 'Bebidas espirituosas destiladas oscuras envejecidas en madera',
    f: ['Whisky escocés de malta (Scotch)', 'Bourbon americano de maíz', 'Ron añejo dorado', 'Brandy de Jerez'],
    m: ['Coñac de uva francés', 'Armagnac tradicional de Gascuña', 'Whiskey irlandés triple destilado'],
    d: ['Calvados de manzana normando', 'Rye whiskey de centeno puro', 'Ron extra viejo solera'],
    t: ['Ginebra London Dry', 'Vodka neutro destilado', 'Tequila blanco cristalino', 'Anís dulce transparente', 'Pisco puro quebranta']
  },
  {
    c: 'Vinos generosos y licorosos tradicionales de España y Portugal',
    f: ['Vino Fino de Jerez', 'Manzanilla de Sanlúcar', 'Vino de Oporto dulce', 'Vino Pedro Ximénez muy dulce'],
    m: ['Vino Amontillado envejecido', 'Vino Oloroso con cuerpo', 'Palo Cortado misterioso'],
    d: ['Vino de Madeira envejecido', 'Fondillón alicantino de monastrell', 'Moscatel dulce de Málaga'],
    t: ['Cava brut nature espumoso', 'Txakoli blanco joven', 'Vino albariño del año', 'Ribera del Duero roble', 'Lambrusco de Módena']
  },
  {
    c: 'Alimentos o bebidas fermentadas con probióticos vivos',
    f: ['Yogur natural fermentado', 'Kéfir de leche entera', 'Chucrut de col fermentada', 'Kombucha de té endulzado'],
    m: ['Miso de soja japonés', 'Kimchi coreano con chile', 'Tempeh de habas de soja'],
    d: ['Natto de soja viscoso', 'Kvass de pan de centeno', 'Umeboshi de ciruela japonesa'],
    t: ['Leche UHT esterilizada en brik', 'Vinagre destilado filtrado', 'Cerveza pasteurizada de lata', 'Zumo de naranja envasado', 'Queso fundido en lonchas']
  },

  // 61 - 70: Salsas, Condimentos y Aceites
  {
    c: 'Grandes salsas madre y derivadas clásicas de la cocina',
    f: ['Salsa bechamel blanca', 'Salsa de tomate casera', 'Salsa mayonesa emulsionada', 'Salsa holandesa de mantequilla'],
    m: ['Salsa española de fondo oscuro', 'Salsa velouté de ave', 'Salsa bearnesa de estragón'],
    d: ['Salsa alioli tradicional con mortero', 'Salsa bordelesa con vino tinto', 'Salsa mornay con queso fundido'],
    t: ['Kétchup industrial con vinagre', 'Mostaza de bote procesada', 'Aceite de girasol refinado', 'Salsa de soja en botella', 'Vinagre de manzana']
  },
  {
    c: 'Salsas frías emulsionadas y aderezos reconocidos',
    f: ['Salsa mayonesa clásica', 'Salsa rosa / cóctel con marisco', 'Salsa césar para ensalada', 'Salsa tártara con alcaparras'],
    m: ['Salsa alioli con ajo machacado', 'Salsa vinagreta francesa clásica', 'Salsa pesto genovés verde'],
    d: ['Salsa gribiche con huevo duro', 'Salsa rouille provenzal para sopa', 'Salsa remoulade francesa con mostaza'],
    t: ['Salsa bechamel caliente al fuego', 'Salsa boloñesa con carne picada', 'Salsa española de carne oscura', 'Caldo de puchero caliente', 'Sopa de pescado']
  },
  {
    c: 'Salsas picantes y pastas de chile del mundo',
    f: ['Salsa Tabasco original fermentada', 'Salsa Sriracha de chile y ajo', 'Wasabi japonés rallado', 'Salsa valentina picante'],
    m: ['Pasta Harissa tunecina con especias', 'Pasta Gochujang coreana de chile', 'Salsa Sambal oelek indonesia'],
    d: ['Salsa chimichurri picante argentino', 'Pasta de ají amarillo peruano', 'Mole poblano con chile ancho'],
    t: ['Salsa mayonesa suave', 'Kétchup de tomate dulce', 'Salsa bechamel con nuez moscada', 'Salsa tártara fría', 'Pesto genovés con albahaca']
  },
  {
    c: 'Variedades de aceituna empleadas para producir Aceite de Oliva Virgen Extra (AOVE)',
    f: ['Aceituna Picual de Jaén', 'Aceituna Arbequina catalana', 'Aceituna Hojiblanca andaluza', 'Aceituna Cornicabra toledana'],
    m: ['Aceituna Manzanilla sevillana', 'Aceituna Empeltre del Bajo Aragón', 'Aceituna Frantoio italiana'],
    d: ['Aceituna Picudo de Córdoba', 'Aceituna Leccino de la Toscana', 'Aceituna Koroneiki griega'],
    t: ['Aceituna de mesa rellena de anchoa', 'Aceituna negra oxidada de pizza', 'Semilla de girasol tostada', 'Grano de maíz dulce', 'Semilla de colza']
  },
  {
    c: 'Tipos de vinagres con denominación o método tradicional',
    f: ['Vinagre de Jerez con solera', 'Vinagre balsámico tradicional de Módena', 'Vinagre de vino blanco', 'Vinagre de manzana o sidra'],
    m: ['Vinagre de vino tinto', 'Vinagre de arroz para sushi', 'Vinagre de malta británico'],
    d: ['Vinagre de Condado de Huelva', 'Vinagre de Montilla-Moriles', 'Vinagre negro chino de Chinkiang'],
    t: ['Vino blanco verdejo joven', 'Aceite de oliva virgen extra', 'Salsa de soja tamari', 'Zumo exprimido de limón', 'Salmuera líquida']
  },
  {
    c: 'Ingredientes básicos de la salsa pesto genovés tradicional',
    f: ['Hojas frescas de albahaca genovesa', 'Piñones nacionales tostados', 'Queso Parmigiano Reggiano rallado', 'Aceite de oliva virgen extra'],
    m: ['Diente de ajo pelado', 'Queso Pecorino Fiore Sardo', 'Sal marina gruesa'],
    d: ['Albahaca de hoja pequeña DOP', 'Piñón silvestre mediterráneo', 'Pecorino romano curado'],
    t: ['Hojas frescas de espinaca', 'Nueces de nogal peladas', 'Nata líquida de cocinar', 'Tomate maduro triturado', 'Cebolla picada fina']
  },
  {
    c: 'Ingredientes de la salsa alioli tradicional al mortero (sin huevo)',
    f: ['Dientes de ajo frescos morados', 'Aceite de oliva virgen extra', 'Sal marina fina', 'Zumo de limón (gotas emulsionantes)'],
    m: ['Ajo pelado sin germen', 'Aceite añadido en hilo fino', 'Mano de mortero de madera'],
    d: ['Sal gorda machacada de base', 'Gotas de agua fría de apoyo', 'Mortero amarillo de cerámica'],
    t: ['Yema cruda de huevo de gallina', 'Leche entera de vaca', 'Mostaza de Dijon francesa', 'Mayonesa de bote comprada', 'Vinagre balsámico oscuro']
  },
  {
    c: 'Ingredientes clásicos de la salsa boloñesa italiana (ragù alla bolognese)',
    f: ['Carne picada de ternera magra', 'Zanahoria fresca picada', 'Apio fresco picado fino', 'Cebolla blanca picada'],
    m: ['Pancetta de cerdo curada', 'Vino blanco seco o tinto', 'Salsa de tomate concentrada'],
    d: ['Leche entera incorporada al final', 'Caldo de carne suave', 'Pimienta negra recién molida'],
    t: ['Champiñón laminado de lata', 'Orégano seco en abundancia (no típico de Bolonia)', 'Nata para cocinar espesa', 'Guisantes verdes cocidos', 'Kétchup de tomate']
  },
  {
    c: 'Ingredientes tradicionales del auténtico guacamole mexicano al molcajete',
    f: ['Aguacate maduro de variedad Hass', 'Cebolla blanca fresca picada', 'Cilantro fresco picado', 'Zumo de lima recién exprimido'],
    m: ['Chile serrano o jalapeño verde', 'Sal marina al gusto', 'Tomate rojo fresco picado en cubos'],
    d: ['Diente de ajo machacado opcional', 'Chile jalapeño sin semillas', 'Aceite de oliva (gotas opcionales)'],
    t: ['Nata agria o crema agria', 'Mayonesa de bote cremosa', 'Queso cheddar rallado', 'Comino en polvo en exceso', 'Pimienta negra de bote']
  },
  {
    c: 'Ingredientes esenciales para preparar la salsa chimichurri argentina',
    f: ['Perejil fresco picado fino', 'Ajo picado muy menudo', 'Aceite de girasol o de oliva suave', 'Vinagre de vino blanco o tinto'],
    m: ['Orégano seco aromático', 'Ají molido argentino picante', 'Sal común al gusto'],
    d: ['Pimienta negra recién molida', 'Agua tibia para hidratar especias', 'Hoja seca de laurel picada'],
    t: ['Cilantro fresco en manojo', 'Tomate maduro triturado', 'Cebolla morada en juliana', 'Salsa de soja oriental', 'Mayonesa espesa']
  },

  // 71 - 80: Cocina Tradicional de las Regiones de España
  {
    c: 'Platos típicos de la gastronomía de Andalucía',
    f: ['Gazpacho andaluz fresquito', 'Salmorejo cordobés denso', 'Pescaíto frito enharinado', 'Rabo de toro estofado'],
    m: ['Flamenquín de lomo y jamón', 'Tortillitas de camarones de Cádiz', 'Habas con jamón serrano'],
    d: ['Ajoblanco malagueño con uvas', 'Pipirrana jiennense de tomate', 'Papas aliñás con cebolleta'],
    t: ['Fabada con compango', 'Cocido madrileño con garbanzos', 'Pulpo á feira gallego', 'Calçots con salsa romesco', 'Marmitako de bonito']
  },
  {
    c: 'Platos tradicionales de la cocina de Galicia',
    f: ['Pulpo á feira con pimentón', 'Empanada gallega de atún', 'Caldo gallego de grelos', 'Pimientos de Padrón fritos'],
    m: ['Lacón con grelos y patatas', 'Mariscada de la ría', 'Tarta de Santiago de almendra'],
    d: ['Zamburiñas a la plancha', 'Filloas gallegas de sartén', 'Percebes de las Rías Baixas'],
    t: ['Paella valenciana mixta', 'Salmorejo cordobés frío', 'Cochinillo asado de Segovia', 'Marmitako de atún', 'Pisto manchego']
  },
  {
    c: 'Platos y recetas de la gastronomía del País Vasco',
    f: ['Bacalao al pil-pil ligado', 'Marmitako de bonito del norte', 'Chuletón de buey a la brasa', 'Pintxos variados de barra'],
    m: ['Bacalao a la vizcaína', 'Kokotxas de merluza en salsa verde', 'Txangurro a la donostiarra'],
    d: ['Gilda tradicional con guindilla', 'Merluza en salsa verde con almejas', 'Pantxineta hojaldrada con crema'],
    t: ['Gazpacho andaluz', 'Cocido madrileño en tres vuelcos', 'Fabada asturiana caliente', 'Calçots con romesco', 'Ensaimada rellena']
  },
  {
    c: 'Platos tradicionales de la gastronomía de Cataluña',
    f: ['Calçots con salsa romesco', 'Pa amb tomàquet (pan con tomate)', 'Escalivada de pimientos y berenjenas', 'Crema catalana tostada'],
    m: ['Butifarra con mongetes (alubias)', 'Canelones tradicionales de San Esteban', 'Fideuá de marisco con alioli'],
    d: ['Esqueixada de bacalao desmigado', 'Suquet de peix marinero', 'Escudella i carn d\'olla'],
    t: ['Fabada asturiana', 'Salmorejo cordobés', 'Cocido montañés con berza', 'Rabo de toro estofado', 'Gofio escaldado']
  },
  {
    c: 'Platos típicos de la cocina de Asturias',
    f: ['Fabada asturiana con faba grande', 'Cachopo de ternera y jamón', 'Arroz con leche requemado', 'Sidra natural escanciada'],
    m: ['Pote asturiano con berza y alubias', 'Pastel de cabracho horneado', 'Chorizo a la sidra en cazuela'],
    d: ['Casadielles de nuez fritas', 'Tortos de maíz con huevos y picadillo', 'Pixín (rape) al horno'],
    t: ['Gazpacho andaluz', 'Calçots con salsa de romesco', 'Paella valenciana con conejo', 'Zarajos de Cuenca fritos', 'Papas arrugadas con mojo']
  },
  {
    c: 'Platos tradicionales de Madrid y Castilla',
    f: ['Cocido madrileño tradicional', 'Cochinillo asado al estilo segoviano', 'Sopa de ajo (castellana)', 'Lechazo asado de Aranda'],
    m: ['Callos a la madrileña con morro', 'Bocadillo de calamares fritos', 'Judiones de La Granja con oreja'],
    d: ['Entresijos y gallinejas fritas', 'Huevos rotos de Casa Lucio con jamón', 'Besugo a la madrileña al horno'],
    t: ['Pulpo á feira con cachelos', 'Marmitako de bonito fresco', 'Paella marinera de arroz', 'Salmorejo con jamón ibérico', 'Gofio amasado']
  },
  {
    c: 'Platos e ingredientes de la gastronomía de la Comunidad Valenciana',
    f: ['Paella valenciana tradicional', 'Horchata de chufa fría de Alboraya', 'Fideuá de Gandía con marisco', 'Arroz a banda marinero'],
    m: ['Arroz negro con sepia y alioli', 'All i pebre de anguilas de la Albufera', 'Fartons glaseados para horchata'],
    d: ['Arroz al horno (arròs al forn)', 'Esgarraet de pimiento asado y bacalao', 'Arroz caldoso con bogavante'],
    t: ['Fabada asturiana tradicional', 'Caldo gallego de ternera', 'Cachopo relleno de queso Cabrales', 'Cocido madrileño con tocino', 'Ajoblanco']
  },
  {
    c: 'Especialidades culinarias de las Islas Canarias',
    f: ['Papas arrugadas con piel y sal', 'Mojo picón rojo picante', 'Mojo verde de cilantro', 'Gofio canario de millo'],
    m: ['Almogrote gomero de queso curado', 'Ropa vieja canaria con garbanzos', 'Sancocho canario con cherne'],
    d: ['Conejo en salmorejo especiado', 'Queso majorero curado de cabra', 'Príncipe Alberto de chocolate y almendra'],
    t: ['Crema catalana caramelizada', 'Fabada asturiana de fabas', 'Cocido madrileño caliente', 'Pulpo á feira gallego', 'Calçots asados']
  },
  {
    c: 'Platos tradicionales de las Islas Baleares',
    f: ['Ensaimada de Mallorca lisa o rellena', 'Sobrasada mallorquina untable', 'Caldereta de langosta de Menorca', 'Tumbet mallorquín de verduras'],
    m: ['Frito mallorquín de vísceras', 'Queso Mahón-Menorca artesano', 'Coca de trampó con verduras'],
    d: ['Flaó ibicenco con queso y menta', 'Arròs brut especiado con caza', 'Panades de carne mallorquinas'],
    t: ['Gazpacho andaluz fresquito', 'Cachopo de ternera con patatas', 'Papas arrugadas con mojo', 'Salmorejo cordobés', 'Pisto manchego']
  },
  {
    c: 'Especialidades gastronómicas de Castilla-La Mancha y Extremadura',
    f: ['Pisto manchego con tomate y pimiento', 'Queso manchego curado con DO', 'Migas manchegas con chorizo', 'Gaspacho manchego con torta'],
    m: ['Duelo y quebranto con huevos y chorizo', 'Morteruelo conquense de caza', 'Atascaburras de patata y bacalao'],
    d: ['Caldereta de cordero extremeña', 'Torta del Casar de leche cruda', 'Zarajos de Cuenca asados'],
    t: ['Paella valenciana con judías', 'Marmitako de atún del norte', 'Pulpo á feira con sal gorda', 'Calçots con salsa de almendra', 'Fabada']
  },

  // 81 - 90: Tapas, Aperitivos y Embutidos de Calidad
  {
    c: 'Tapas clásicas servidas habitualmente en bares de España',
    f: ['Patatas bravas con salsa picante', 'Croquetas caseras de jamón ibérico', 'Ensaladilla rusa con atún', 'Boquerones en vinagre marinados'],
    m: ['Calamares a la romana fritos', 'Tortilla de patatas en pincho', 'Gambas al ajillo en cazuela'],
    d: ['Tigres (mejillones rellenos y rebozados)', 'Torreznos crujientes de Soria', 'Pinchos morunos de carne adobada'],
    t: ['Hot dog con kétchup y mostaza', 'Hamburguesa con patatas fritas', 'Nuggets de pollo fritos', 'Rollito de primavera con salsa agridulce', 'Tacos']
  },
  {
    c: 'Embutidos y chacinas tradicionales procedentes del cerdo',
    f: ['Chorizo curado español', 'Salchichón ibérico de bellota', 'Lomo embuchado seco', 'Morcilla de Burgos con arroz'],
    m: ['Fuet catalán alargado', 'Sobrasada de Mallorca untable', 'Chistorra de Navarra a la brasa'],
    d: ['Butifarra negra de sangre', 'Botillo del Bierzo cocido', 'Morcón ibérico de bellota'],
    t: ['Pechuga de pavo braseada', 'Cecina de vaca curada', 'Pastrami de ternera especiado', 'Queso curado de oveja', 'Tofu ahumado']
  },
  {
    c: 'Quesos españoles amparados por Denominación de Origen Protegida (DOP)',
    f: ['Queso Manchego de oveja', 'Queso Cabrales azul de cueva', 'Torta del Casar extremeña', 'Queso Idiazábal ahumado'],
    m: ['Queso Mahón-Menorca', 'Queso Tetilla gallego', 'Queso Majorero de Fuerteventura'],
    d: ['Queso Gamoneu de los Picos de Europa', 'Queso Roncal navarro', 'Queso Picón Bejes-Tresviso'],
    t: ['Queso Parmigiano Reggiano', 'Queso Roquefort francés', 'Queso Gouda holandés', 'Queso Cheddar inglés', 'Queso Feta griego']
  },
  {
    c: 'Ingredientes de una paella valenciana tradicional reglada',
    f: ['Arroz redondo de variedad bomba', 'Carne de pollo de corral troceada', 'Carne de conejo de campo', 'Bajoqueta (judía verde plana)'],
    m: ['Garrofó blanco ancho valenciano', 'Tomate natural triturado', 'Aceite de oliva virgen extra'],
    d: ['Azafrán en hebras tostadas', 'Romero fresco en rama', 'Caracoles (vaquetes) de monte'],
    t: ['Chorizo picado en rodajas', 'Guisantes congelados de lata', 'Cebolla picada fina', 'Pimiento rojo asado', 'Mejillones de roca']
  },
  {
    c: 'Ingredientes de un gazpacho andaluz tradicional refrescante',
    f: ['Tomates rojos maduros de pera', 'Pepino verde pelado', 'Pimiento verde italiano fresco', 'Aceite de oliva virgen extra'],
    m: ['Diente de ajo sin germen', 'Vinagre de vino blanco o Jerez', 'Pan blanco duro del día anterior'],
    d: ['Sal marina al gusto', 'Agua muy fría para aligerar', 'Pizca de pimiento rojo'],
    t: ['Zumo de naranja concentrado', 'Mayonesa de bote', 'Cebolla dulce pochada', 'Pimienta de cayena en polvo', 'Nata para cocinar']
  },
  {
    c: 'Ingredientes del salmorejo cordobés tradicional',
    f: ['Tomates maduros rojos con piel fina', 'Pan de hogaza o telera cordobesa', 'Aceite de oliva virgen extra', 'Diente de ajo fresco'],
    m: ['Sal marina común', 'Jamón ibérico picado de guarnición', 'Huevo duro picado fino'],
    d: ['Aceite virgen extra de variedad Picudo', 'Miga densa de pan candeal', 'Gotas de vinagre (opcional no canónico)'],
    t: ['Pepino verde fresco pelado', 'Pimiento verde italiano', 'Cebolla fresca en dados', 'Agua para aligerar la textura', 'Zanahoria']
  },
  {
    c: 'Ingredientes de la fabada asturiana tradicional de puchero',
    f: ['Fabes asturianas de la Granja secas', 'Chorizo asturiano ahumado', 'Morcilla asturiana ahumada', 'Panceta curada de cerdo'],
    m: ['Lacón de cerdo curado', 'Agua fría mineral de cocción', 'Poco de azafrán en hebra'],
    d: ['Hueso de jamón para sabor', 'Cebolla entera para retirar', 'Laurel seco en hoja'],
    t: ['Garbanzos lechosos cocidos', 'Lentejas pardinas secas', 'Arroz bomba para espesar', 'Zanahoria troceada', 'Patatas en dados']
  },
  {
    c: 'Ingredientes que componen el compango asturiano tradicional',
    f: ['Chorizo ahumado de cerdo', 'Morcilla asturiana de cebolla y sangre', 'Panceta curada entreverada', 'Lacón de cerdo curado'],
    m: ['Tocino ibérico salado', 'Chorizo curado al humo de roble', 'Morcilla seca ahumada'],
    d: ['Hueso de espinazo curado', 'Costilla de cerdo adobada y ahumada', 'Oreja de cerdo curada'],
    t: ['Pechuga de pollo fileteada', 'Carne picada de ternera magra', 'Salchicha de Frankfurt cocida', 'Chorizo parrillero criollo', 'Lomo de buey']
  },
  {
    c: 'Pescados y mariscos habituales en la fritura andaluza (pescaíto frito)',
    f: ['Boquerones limpios enharinados', 'Calamares frescos en anillas', 'Chocos (sepia) cortados en tiras', 'Puntillitas (calamaritos pequeños)'],
    m: ['Cazón adobado en adobo (bienmesabe)', 'Salmonetes pequeños de roca', 'Acedías frescas de Sanlúcar'],
    d: ['Pijotas frescas enroscadas', 'Chanquetes de criadero permitidos', 'Lenguaditos pequeños de estero'],
    t: ['Salmón ahumado en lonchas', 'Trucha de río asalmonada', 'Filete de emperador a la plancha', 'Bacalao en salazón crudo', 'Lubina grande']
  },
  {
    c: 'Variedades de empanadas saladas tradicionales de España y Latinoamérica',
    f: ['Empanada gallega de bonito', 'Empanada tucumana de carne cortada a cuchillo', 'Empanada chilena de pino con aceituna', 'Hornazo salmantino de embutido'],
    m: ['Empanadilla de atún y tomate', 'Empanada salteña con patata hervida', 'Empanada colombiana de harina de maíz frita'],
    d: ['Empanada berciana con acelga y patata', 'Empanada gallega de zamburiñas', 'Llandera asturiana de compango'],
    t: ['Croissant de jamón y queso', 'Pizza calzone italiana cerrada', 'Quiche Lorraine horneada', 'Börek turco de hojaldre', 'Taco mexicano']
  },

  // 91 - 100: Productos Gourmet, Curiosidades y Técnicas
  {
    c: 'Alimentos gourmet y productos de lujo gastronómico internacional',
    f: ['Caviar de esturión Beluga', 'Trufa blanca de Alba italiana', 'Jamón ibérico 100% de bellota', 'Carne de vacuno de Kobe japonesa'],
    m: ['Azafrán puro en hebras de La Mancha', 'Foie gras de pato entero mi-cuit', 'Ostras Gillardeau francesas'],
    d: ['Café Kopi Luwak fermentado de civeta', 'Trufa negra de invierno de Teruel', 'Angulas del Cantábrico vivas'],
    t: ['Mortadela de cerdo con aceitunas', 'Surimi de palitos de cangrejo', 'Margarina vegetal industrial', 'Kétchup comercial', 'Atún en lata']
  },
  {
    c: 'Variedades de setas y hongos venenosos o tóxicos (mortales en Europa)',
    f: ['Amanita phalloides (cicuta verde)', 'Amanita muscaria (matamoscas)', 'Amanita verna (cicuta de primavera)', 'Amanita virosa (ángel destructor)'],
    m: ['Cortinarius orellanus', 'Gyromitra esculenta (falsa colmenilla cruda)', 'Galerina marginata'],
    d: ['Lepiota brunneoincarnata', 'Boletus satanas (hongo del diablo)', 'Entoloma sinuatum (pérfida)'],
    t: ['Boletus edulis comestible', 'Champiñón silvestre fresco', 'Níscalo de pinar sabroso', 'Amanita caesarea excelente', 'Trompeta negra']
  },
  {
    c: 'Técnicas de cocción mediante calor húmedo en cocina profesional',
    f: ['Hervir en agua a 100°C', 'Cocinar al vapor bajo presión o rejilla', 'Escaldar / Blanquear en agua hirviendo', 'Escalfar / Pochar en líquido a baja temperatura'],
    m: ['Guisar en cazuela con caldo tapado', 'Estofar en sus propios jugos a fuego lento', 'Baño María controlado con agua caliente'],
    d: ['Confitar en grasa a baja temperatura (60-80°C)', 'Sous-vide al vacío en agua termostatizada', 'Cocción a fuego lento (Simmering)'],
    t: ['Asar al horno de convección seco', 'Gratinar bajo la salamandra', 'Saltear al wok a fuego vivo', 'Tostar en plancha de hierro seca', 'Flambear con alcohol']
  },
  {
    c: 'Técnicas de cocción mediante calor seco en cocina',
    f: ['Asar carnes al horno tradicional', 'Cocinar a la parrilla sobre brasas de carbón', 'Saltear alimentos en sartén con poco aceite', 'Gratinar la superficie al horno o grill'],
    m: ['Cocinar a la plancha de acero bien caliente', 'Dorar en sartén a fuego vivo', 'Hornear masas de pan y bollería'],
    d: ['Tostar granos y frutos secos al calor', 'Flambear con fuego directo de licor', 'Caramelizar azúcares con soplete'],
    t: ['Hervir patatas en agua con sal', 'Cocinar al vapor con vaporera', 'Escalfar huevos en agua y vinagre', 'Blanquear verduras en olla', 'Pochar pescado']
  },
  {
    c: 'Tipos de cortes clásicos de verduras en la cocina francesa profesional',
    f: ['Juliana (tiras finas y alargadas)', 'Brunoise (dados diminutos de 2 mm)', 'Mirepoix (dados medianos aromáticos)', 'Chiffonade (tiras muy finas de hoja verde)'],
    m: ['Bastonetes (bastones uniformes)', 'Jardinera (dados de medio centímetro)', 'Rodajas o Vichy para zanahoria'],
    d: ['Torneado de patatas o verduras con puntilla', 'Paisana (láminas planas cuadradas)', 'Concassé de tomate sin piel ni pepitas'],
    t: ['Picar con picadora eléctrica', 'Triturar con batidora de mano', 'Rallar con rallador grueso', 'Machacar con mortero de piedra', 'Licuar con extractor']
  },
  {
    c: 'Partes de la planta de las que proceden diversos alimentos comunes',
    f: ['Fruto (tomate, manzana, calabacín)', 'Semilla (garbanzo, lenteja, arroz)', 'Raíz (zanahoria, nabo, rábano)', 'Hoja (espinaca, lechuga, acelga)'],
    m: ['Tallo comestible (espárrago, apio)', 'Flor o capullo (alcachofa, brócoli, coliflor)', 'Tubérculo subterráneo (patata)'],
    d: ['Bulbo engrosado (cebolla, ajo, hinojo)', 'Corteza aromática (canela)', 'Rizoma rastrero (jengibre, cúrcuma)'],
    t: ['Polen en polvo puro', 'Savia pura envasada', 'Clorofila sintética en pastillas', 'Madera de tronco de roble', 'Seda vegetal de capullo']
  },
  {
    c: 'Caldos y fondos de base empleados en la alta cocina',
    f: ['Fondo oscuro de huesos de ternera asados', 'Fondo blanco de carcasa de ave y verdura', 'Fumet marinero de espinas de pescado blanco', 'Caldo de verduras de huerta'],
    m: ['Caldo de puchero con carnes variadas', 'Glace de carne concentrada reducida', 'Caldo corto (court-bouillon) para hervir pescado'],
    d: ['Demi-glace densa de fondo oscuro', 'Fumet de marisco con cabezas sofritas', 'Consomé clarificado con clara de huevo'],
    t: ['Agua con pastilla de caldo industrial concentrado', 'Aceite de freír usado', 'Salsa de tomate con azúcar', 'Leche entera fresca hervida', 'Nata líquida']
  },
  {
    c: 'Alimentos vegetales ricos en proteínas aptos para dietas vegetarianas o veganas',
    f: ['Lentejas cocidas de bote o puchero', 'Garbanzos cocidos con espinacas', 'Tofu firme de soja cuajada', 'Soja texturizada para guisos'],
    m: ['Seitán elaborado con gluten de trigo', 'Tempeh de soja fermentada', 'Semillas de cáñamo comestibles'],
    d: ['Edamame de vainas verdes cocidas', 'Levadura nutricional en copos', 'Altramuces amarillos en salmuera'],
    t: ['Pechuga de pollo cocida', 'Atún claro enlatado en aceite', 'Clara de huevo pasteurizada', 'Gelatina de carne en láminas', 'Lomo de ternera']
  },
  {
    c: 'Ingredientes de la auténtica salsa carbonara de Roma (sin nata)',
    f: ['Yemas de huevo frescas batidas', 'Queso Pecorino Romano rallado maduro', 'Guanciale de careta de cerdo curada', 'Pimienta negra recién molida en abundancia'],
    m: ['Huevo entero añadido a las yemas', 'Agua de cocción de la pasta rica en almidón', 'Parmesano mezclado con Pecorino'],
    d: ['Grasa fundida del propio guanciale crujiente', 'Pasta larga tipo espagueti o rigatoni', 'Sal moderada por el punto del pecorino'],
    t: ['Nata líquida de cocinar', 'Champiñones laminados de lata', 'Cebolla picada pochada en aceite', 'Bacon ahumado de supermercado', 'Ajo dorado en sartén']
  },
  {
    c: 'Métodos tradicionales de conservación de alimentos antes de la refrigeración',
    f: ['Salazón en sal marina seca (bacalao, jamón)', 'Ahumado con humo de leña noble', 'Secado y deshidratación solar al aire', 'Encurtido en vinagre y sal'],
    m: ['Escabeche en vinagre, aceite y aromáticos', 'Confitado cubierto en grasa animal', 'Fermentación láctica de vegetales'],
    d: ['Liofilización natural en altura andina', 'Adobo con pimentón y orégano', 'Curación al aire frío de sierra'],
    t: ['Congelación en congelador eléctrico', 'Pasteurización industrial UHT', 'Envasado al vacío con selladora plástica', 'Irradiación ionizante', 'Esterilización en autoclave']
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