export default Array.from({ length: 20 }, (_, idx) => {
  const plantillas = [
    {
      c: 'Platos típicos e ingredientes de la gastronomía de España',
      f: ['Paella valenciana', 'Tortilla de patatas', 'Jamón ibérico', 'Gazpacho andaluz'],
      m: ['Croquetas de jamón', 'Pulpo a la gallega', 'Cocido madrileño'],
      d: ['Fabada asturiana', 'Salmorejo cordobés', 'Pisto manchego'],
      t: ['Guacamole', 'Pizza margarita', 'Sushi de salmón', 'Tacos al pastor', 'Croissant']
    },
    {
      c: 'Platos tradicionales de la gastronomía italiana',
      f: ['Pizza napolitana', 'Espaguetis a la carbonara', 'Lasaña boloñesa', 'Risotto'],
      m: ['Tiramisú', 'Raviolis de espinaca', 'Carpaccio de ternera'],
      d: ['Ossobuco a la milanesa', 'Focaccia genovesa', 'Gnocchi al pesto'],
      t: ['Paella', 'Ratatouille', 'Moussaka', 'Tacos', 'Burrito']
    },
    {
      c: 'Platos e ingredientes clásicos de la cocina mexicana',
      f: ['Tacos al pastor', 'Guacamole con totopos', 'Enchiladas', 'Quesadillas'],
      m: ['Mole poblano', 'Pozole rojo', 'Chiles en nogada'],
      d: ['Tamales de elote', 'Cochinita pibil', 'Chilaquiles verdes'],
      t: ['Arepas', 'Ceviche peruano', 'Empanadas argentinas', 'Nachos con queso cheddar (Tex-Mex)', 'Burrito californiano']
    },
    {
      c: 'Frutas tropicales',
      f: ['Plátano / Banana', 'Piña / Ananá', 'Mango', 'Papaya'],
      m: ['Maracuyá (Fruta de la pasión)', 'Coco', 'Guayaba'],
      d: ['Pitahaya (Fruta del dragón)', 'Carambola', 'Lichi'],
      t: ['Manzana reineta', 'Pera conferencia', 'Cereza del Jerte', 'Uva blanca', 'Melocotón']
    },
    {
      c: 'Ingredientes básicos de la tortilla de patatas clásica (con cebolla)',
      f: ['Huevos de gallina', 'Patatas', 'Cebolla', 'Aceite de oliva virgen extra'],
      m: ['Sal común', 'Aceite de oliva suave', 'Aceite de girasol (alternativa)'],
      d: ['Huevos camperos', 'Patata agria', 'Cebolla dulce'],
      t: ['Harina de trigo', 'Leche entera', 'Pimiento rojo', 'Chorizo picado', 'Ajo picado']
    },
    {
      c: 'Variedades y tipos de quesos reconocidos en el mundo',
      f: ['Queso Manchego', 'Parmesano (Parmigiano)', 'Mozzarella', 'Queso Cheddar'],
      m: ['Brie', 'Gouda', 'Roquefort'],
      d: ['Camembert', 'Gruyère', 'Gorgonzola'],
      t: ['Tofu', 'Mantequilla', 'Nata montada', 'Yogur griego', 'Cuajada sin cuajar']
    },
    {
      c: 'Hierbas y especias aromáticas utilizadas en cocina',
      f: ['Orégano', 'Pimienta negra', 'Romero', 'Albahaca'],
      m: ['Tomillo', 'Canela en rama', 'Pimentón dulce'],
      d: ['Azafrán en hebras', 'Cúrcuma en polvo', 'Nuez moscada'],
      t: ['Sal marina', 'Levadura química', 'Bicarbonato sódico', 'Azúcar moreno', 'Vinagre balsámico']
    },
    {
      c: 'Platos tradicionales de la cocina japonesa',
      f: ['Sushi variado', 'Ramen de fideos', 'Sashimi de atún', 'Tempura de langostinos'],
      m: ['Gyoza al vapor', 'Yakitori de pollo', 'Sopa de miso'],
      d: ['Okonomiyaki', 'Takoyaki', 'Tonkatsu de cerdo'],
      t: ['Pad Thai', 'Dim Sum chino', 'Rollito de primavera', 'Kimchi coreano', 'Pho vietnamita']
    },
    {
      c: 'Postres y dulces típicos de pastelería internacional',
      f: ['Tiramisú', 'Tarta de queso (Cheesecake)', 'Brownie de chocolate', 'Croissant de mantequilla'],
      m: ['Crepes dulces', 'Churros con chocolate', 'Profiteroles con nata'],
      d: ['Macarons franceses', 'Crème brûlée', 'Baklava turco'],
      t: ['Tortilla francesa', 'Empanada gallega', 'Quiche lorraine', 'Focaccia', 'Crema de verduras']
    },
    {
      c: 'Cortes de carne vacuna / ternera',
      f: ['Solomillo', 'Chuletón', 'Entrecot', 'Costillar'],
      m: ['Lomo alto', 'Lomo bajo', 'T-bone steak'],
      d: ['Picaña', 'Vacío', 'Babilla'],
      t: ['Pechuga', 'Contramuslo', 'Magret', 'Panceta de cerdo', 'Secreto ibérico']
    },
    {
      c: 'Tipos de pasta italiana tradicionales',
      f: ['Spaghetti', 'Macarrones (Penne)', 'Tagliatelle', 'Ravioli'],
      m: ['Fettuccine', 'Fusilli (Espirales)', 'Gnocchi'],
      d: ['Tortellini', 'Rigatoni', 'Farfalle (Lazos)'],
      t: ['Cuscús', 'Quinoa', 'Arroz basmati', 'Polenta', 'Noodles de huevo']
    },
    {
      c: 'Bebidas alcohólicas fermentadas o destiladas clásicas',
      f: ['Cerveza', 'Vino tinto', 'Whisky', 'Vodka'],
      m: ['Ron blanco', 'Ginebra', 'Tequila'],
      d: ['Brandy', 'Vermut', 'Champán / Cava'],
      t: ['Agua mineral', 'Zumo de naranja', 'Kombucha sin alcohol', 'Tónica', 'Refresco de cola']
    },
    {
      c: 'Pescados azules ricos en ácidos grasos Omega-3',
      f: ['Salmón', 'Atún rojo', 'Sardina', 'Boquerón / Anchoa'],
      m: ['Caballa', 'Bonito del norte', 'Chicharro / Jurel'],
      d: ['Pez espada / Emperador', 'Arenque', 'Anguila'],
      t: ['Merluza', 'Bacalao fresco', 'Lenguado', 'Gallo', 'Lubina de piscifactoría']
    },
    {
      c: 'Salsas tradicionales de la cocina mundial',
      f: ['Mayonesa', 'Kétchup', 'Salsa de soja', 'Salsa barbacoa'],
      m: ['Salsa bechamel', 'Pesto genovés', 'Salsa tártara'],
      d: ['Salsa holandesa', 'Chimichurri', 'Guacamole'],
      t: ['Aceite de oliva', 'Vinagre de Módena', 'Caldo de pollo', 'Zumo de limón', 'Nata líquida']
    },
    {
      c: 'Frutos secos naturales comestibles',
      f: ['Nueces', 'Almendras', 'Avellanas', 'Pistachos'],
      m: ['Cacahuetes / Maní (legumbre seca)', 'Castañas', 'Anacardos'],
      d: ['Nueces de macadamia', 'Piñones', 'Nueces de Brasil'],
      t: ['Pipas de girasol', 'Pipas de calabaza', 'Kikos de maíz', 'Pasas sultanas', 'Dátiles']
    },
    {
      c: 'Embutidos y fiambres derivados del cerdo',
      f: ['Chorizo ibérico', 'Salchichón', 'Jamón serrano', 'Lomo embuchado'],
      m: ['Morcilla de Burgos', 'Fuet catalán', 'Sobrasada mallorquina'],
      d: ['Butifarra blanca', 'Mortadela de Bolonia', 'Chistorra'],
      t: ['Pechuga de pavo', 'Cecina de vaca', 'Pastrami de ternera', 'Queso curado', 'Tofu ahumado']
    },
    {
      c: 'Variedades de uva para la elaboración de vino',
      f: ['Tempranillo', 'Cabernet Sauvignon', 'Chardonnay', 'Merlot'],
      m: ['Garnacha', 'Sauvignon Blanc', 'Syrah'],
      d: ['Albariño', 'Verdejo', 'Pinot Noir'],
      t: ['Uva de mesa moscatel', 'Sultana sin pepitas', 'Uva Red Globe', 'Pasas de Corinto', 'Manzana fuji']
    },
    {
      c: 'Platos de comida rápida reconocidos mundialmente',
      f: ['Hamburguesa con queso', 'Perrito caliente (Hot Dog)', 'Porción de pizza', 'Nuggets de pollo'],
      m: ['Patatas fritas', 'Kebab döner', 'Aros de cebolla'],
      d: ['Taco crujiente', 'Alitas de pollo BBQ', 'Sandwich Club'],
      t: ['Entrecot a la plancha', 'Bogavante al horno', 'Solomillo Wellington', 'Paella de marisco', 'Sopa castellana']
    },
    {
      c: 'Verduras y hortalizas de hoja verde',
      f: ['Espinacas', 'Lechuga romana', 'Acelgas', 'Col rizada (Kale)'],
      m: ['Rúcula', 'Canónigos', 'Endivias'],
      d: ['Berros', 'Borraja', 'Hojas de mostaza'],
      t: ['Tomate maduro', 'Zanahoria', 'Berenjena', 'Pimiento rojo', 'Calabacín']
    },
    {
      c: 'Tipos y variedades de café',
      f: ['Café espresso', 'Café con leche (Latte)', 'Capuchino', 'Café americano'],
      m: ['Café cortado', 'Café bombón', 'Café moca (Mocha)'],
      d: ['Café frappé', 'Ristretto', 'Flat White'],
      t: ['Té matcha', 'Té verde', 'Infusión de manzanilla', 'Chocolate caliente', 'Rooibos']
    }
  ];

  const p = plantillas[idx];
  return {
    id: `gastronomia_${idx + 1}`,
    consigna: p.c,
    correctos: { faciles: p.f, medios: p.m, dificiles: p.d },
    trampas: p.t
  };
});