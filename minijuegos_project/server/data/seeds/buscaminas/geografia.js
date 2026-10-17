export default Array.from({ length: 20 }, (_, idx) => {
  const plantillas = [
    {
      c: 'Países miembros oficiales de la Unión Europea',
      f: ['España', 'Francia', 'Alemania', 'Italia'],
      m: ['Polonia', 'Portugal', 'Grecia'],
      d: ['Eslovaquia', 'Estonia', 'Luxemburgo'],
      t: ['Reino Unido', 'Suiza', 'Noruega', 'Islandia', 'Andorra']
    },
    {
      c: 'Capitales de países del continente europeo',
      f: ['Madrid', 'París', 'Berlín', 'Roma'],
      m: ['Lisboa', 'Viena', 'Ámsterdam'],
      d: ['Liubliana', 'Vilna', 'Skopie'],
      t: ['Barcelona', 'Milán', 'Ginebra', 'Múnich', 'Zúrich']
    },
    {
      c: 'Países pertenecientes al continente africano',
      f: ['Egipto', 'Marruecos', 'Sudáfrica', 'Nigeria'],
      m: ['Kenia', 'Senegal', 'Camerún'],
      d: ['Botsuana', 'Eritrea', 'Madagascar'],
      t: ['Yemen', 'Guyana', 'Jordania', 'Surinam', 'Papúa Nueva Guinea']
    },
    {
      c: 'Ríos más largos del mundo (longitud superior a 4.000 km)',
      f: ['Amazonas', 'Nilo', 'Yangtsé', 'Misisipi'],
      m: ['Yeniséi', 'Río Amarillo (Huang He)', 'Mekong'],
      d: ['Lena', 'Irtish', 'Paraná'],
      t: ['Danubio', 'Rin', 'Sena', 'Támesis', 'Ebro']
    },
    {
      c: 'Países soberanos de América del Sur',
      f: ['Brasil', 'Argentina', 'Colombia', 'Chile'],
      m: ['Perú', 'Uruguay', 'Ecuador'],
      d: ['Bolivia', 'Paraguay', 'Surinam'],
      t: ['México', 'Costa Rica', 'Panamá', 'Cuba', 'Puerto Rico']
    },
    {
      c: 'Montañas y picos que superan los 8.000 metros sobre el nivel del mar',
      f: ['Everest', 'K2', 'Kangchenjunga', 'Lhotse'],
      m: ['Makalu', 'Cho Oyu', 'Nanga Parbat'],
      d: ['Dhaulagiri', 'Annapurna I', 'Manaslu'],
      t: ['Aconcagua', 'Mont Blanc', 'Kilimanjaro', 'Elbrús', 'Denali (McKinley)']
    },
    {
      c: 'Países que limitan territorialmente con España',
      f: ['Francia', 'Portugal', 'Andorra', 'Reino Unido (Gibraltar)'],
      m: ['Marruecos (Ceuta y Melilla)', 'Reino Unido', 'Andorra'],
      d: ['Marruecos', 'Francia (frontera pirinaica)', 'Portugal (La Raya)'],
      t: ['Italia', 'Argelia', 'Túnez', 'Mauritania', 'Bélgica']
    },
    {
      c: 'Países con mayor superficie territorial del planeta',
      f: ['Rusia', 'Canadá', 'China', 'Estados Unidos'],
      m: ['Brasil', 'Australia', 'India'],
      d: ['Argentina', 'Kazajistán', 'Argelia'],
      t: ['Francia', 'Alemania', 'Japón', 'España', 'Reino Unido']
    },
    {
      c: 'Capitales de países de América Latina',
      f: ['Buenos Aires', 'Bogotá', 'Santiago de Chile', 'Lima'],
      m: ['Montevideo', 'Ciudad de México', 'Caracas'],
      d: ['Asunción', 'Quito', 'La Paz'],
      t: ['Río de Janeiro', 'São Paulo', 'Medellín', 'Cancún', 'Guayaquil']
    },
    {
      c: 'Países pertenecientes al continente asiático',
      f: ['Japón', 'Corea del Sur', 'China', 'India'],
      m: ['Tailandia', 'Vietnam', 'Filipinas'],
      d: ['Bután', 'Kazajistán', 'Mongolia'],
      t: ['Madagascar', 'Australia', 'Egipto', 'Nueva Zelanda', 'Fiyi']
    },
    {
      c: 'Mares y océanos oficiales del planeta',
      f: ['Océano Pacífico', 'Océano Atlántico', 'Mar Mediterráneo', 'Mar Caribe'],
      m: ['Mar Rojo', 'Mar Báltico', 'Océano Índico'],
      d: ['Mar de Bering', 'Mar del Norte', 'Mar de Coral'],
      t: ['Lago Victoria', 'Mar Caspio (lago)', 'Lago Superior', 'Lago Baikal', 'Mar Muerto (lago)']
    },
    {
      c: 'Provincias de la comunidad autónoma de Andalucía (España)',
      f: ['Sevilla', 'Málaga', 'Granada', 'Cádiz'],
      m: ['Córdoba', 'Huelva', 'Almería'],
      d: ['Jaén', 'Sevilla', 'Málaga'],
      t: ['Badajoz', 'Murcia', 'Albacete', 'Ciudad Real', 'Cáceres']
    },
    {
      c: 'Países que no tienen salida directa al mar (sin litoral)',
      f: ['Suiza', 'Austria', 'Bolivia', 'Paraguay'],
      m: ['República Checa', 'Hungría', 'Luxemburgo'],
      d: ['Mongolia', 'Nepal', 'Botsuana'],
      t: ['Portugal', 'Bélgica', 'Uruguay', 'Polonia', 'Dinamarca']
    },
    {
      c: 'Islas más grandes del mundo por superficie',
      f: ['Groenlandia', 'Nueva Guinea', 'Borneo', 'Madagascar'],
      m: ['Isla de Baffin', 'Sumatra', 'Gran Bretaña'],
      d: ['Honshu', 'Isla Victoria', 'Isla de Ellesmere'],
      t: ['Australia (continente)', 'Islandia', 'Cuba', 'Mallorca', 'Irlanda']
    },
    {
      c: 'Ciudades que han sido sede de los Juegos Olímpicos de Verano',
      f: ['Barcelona', 'Londres', 'París', 'Tokio'],
      m: ['Río de Janeiro', 'Atenas', 'Pekín'],
      d: ['Sídney', 'Atlanta', 'Los Ángeles'],
      t: ['Madrid', 'Buenos Aires', 'Berlín (moderno)', 'Nueva York', 'Toronto']
    },
    {
      c: 'Desiertos más extensos del planeta',
      f: ['Desierto del Sáhara', 'Desierto de Arabia', 'Desierto de Gobi', 'Desierto de Kalahari'],
      m: ['Gran Desierto de Victoria', 'Desierto de Atacama', 'Desierto de Sonora'],
      d: ['Desierto de Taklamakán', 'Desierto de Thar', 'Desierto de Namib'],
      t: ['Selva del Amazonas', 'Taiga siberiana', 'Gran Cañón', 'Estepa rusa', 'Valle de la Muerte']
    },
    {
      c: 'Volcanes activos conocidos del planeta',
      f: ['Vesubio', 'Etna', 'Kilauea', 'Krakatoa'],
      m: ['Popocatépetl', 'Fuji', 'Teide'],
      d: ['Cotopaxi', 'Mauna Loa', 'Eyjafjallajökull'],
      t: ['Everest', 'Aconcagua', 'Mont Blanc', 'Kilimanjaro (extinto)', 'Matterhorn']
    },
    {
      c: 'Capitales de países de África',
      f: ['El Cairo', 'Rabat', 'Nairobi', 'Dakar'],
      m: ['Pretoria', 'Abuya', 'Túnez'],
      d: ['Addis Abeba', 'Luanda', 'Maputo'],
      t: ['Johannesburgo', 'Casablanca', 'Lagos', 'Alejandría', 'Ciudad del Cabo (legislativa)']
    },
    {
      c: 'Países por los que cruza la línea del Ecuador (paralelo 0°)',
      f: ['Ecuador', 'Colombia', 'Brasil', 'Kenia'],
      m: ['Indonesia', 'Uganda', 'República Democrática del Congo'],
      d: ['Gabón', 'Somalia', 'Santo Tomé y Príncipe'],
      t: ['Perú', 'Venezuela', 'Argentina', 'Tanzania', 'México']
    },
    {
      c: 'Comunidades autónomas de España con costa marítima',
      f: ['Andalucía', 'Cataluña', 'Galicia', 'Comunidad Valenciana'],
      m: ['Asturias', 'Cantabria', 'País Vasco'],
      d: ['Islas Baleares', 'Islas Canarias', 'Región de Murcia'],
      t: ['Castilla y León', 'Castilla-La Mancha', 'Madrid', 'Extremadura', 'Aragón']
    }
  ];

  const p = plantillas[idx];
  return {
    id: `geografia_${idx + 1}`,
    consigna: p.c,
    correctos: { faciles: p.f, medios: p.m, dificiles: p.d },
    trampas: p.t
  };
});