// server/data/unoadiez.seed.js

export const CATEGORIAS_1_AL_10 = [
  // Entretenimiento y cultura
  "Series de televisión",
  "Películas",
  "Videojuegos",
  "Géneros musicales",
  "Cantantes y artistas",
  "Bandas de música",
  "Superhéroes",
  "Villanos de ficción",
  "Dibujos animados",
  "Películas de animación / Disney",
  "Actores y actrices",
  "Juegos de mesa",
  "Instrumentos musicales",
  "Bailes y estilos de baile",
  "Youtubers / Streamers",
  "Reality shows",
  "Programas de televisión",
  "Libros y novelas",

  // Comida y bebida
  "Platos de comida",
  "Frutas",
  "Verduras",
  "Pizzas e ingredientes",
  "Postres y dulces",
  "Comida rápida",
  "Cadenas de comida rápida",
  "Salsas y condimentos",
  "Bebidas",
  "Sabores de helado",
  "Snacks y aperitivos",
  "Cosas para desayunar",
  "Tipos de queso",
  "Comida internacional",
  "Cosas que echarle a una hamburguesa",
  "Marcas de chocolate",

  // Deportes y aficiones
  "Deportes",
  "Deportes de riesgo",
  "Ejercicios de gimnasio",
  "Hobbies y aficiones",
  "Equipos de fútbol",
  "Futbolistas",
  "Atletas y deportistas famosos",
  "Juegos de cartas",
  "Planes de fin de semana",
  "Actividades al aire libre",
  "Planes para una cita",

  // Cotidiano y estilo de vida
  "Meses del año",
  "Días de la semana",
  "Estaciones del año",
  "Momentos del día",
  "Tareas del hogar",
  "Asignaturas del colegio / instituto",
  "Profesiones y trabajos",
  "Marcas de ropa",
  "Marcas de coches",
  "Marcas de zapatillas",
  "Tipos de calzado",
  "Prendas de ropa",
  "Redes sociales",
  "Aplicaciones del móvil",
  "Marcas de tecnología",
  "Electrodomésticos",
  "Muebles de una casa",
  "Habitaciones de una casa",
  "Colores",
  "Olores",
  "Sonidos",

  // Geografía, viajes y lugares
  "Países para viajar",
  "Ciudades del mundo",
  "Destinos de vacaciones",
  "Playas",
  "Montañas y naturaleza",
  "Medios de transporte",
  "Lugares para vivir",
  "Monumentos del mundo",
  "Parques temáticos",
  "Hoteles y alojamientos",

  // Animales y naturaleza
  "Animales domésticos / mascotas",
  "Animales salvajes",
  "Animales marinos",
  "Aves",
  "Insectos",
  "Dinosaurios",
  "Fenómenos meteorológicos / climas",

  // Cosas y objetos
  "Objetos que llevas en los bolsillos",
  "Inventos de la humanidad",
  "Regalos de cumpleaños",
  "Cosas que comprarías con mucho dinero",
  "Herramientas de bricolaje",
  "Juguetes clásicos",

  // Personalidad y situaciones
  "Cualidades de una persona",
  "Defectos de una persona",
  "Excusas para no salir",
  "Temas de conversación",
  "Superpoderes",
  "Lugares para esconderse",
  "Cosas que te dan pereza",
  "Placeres de la vida"
];

export const getRandomCategoria = () => {
  return CATEGORIAS_1_AL_10[Math.floor(Math.random() * CATEGORIAS_1_AL_10.length)];
};