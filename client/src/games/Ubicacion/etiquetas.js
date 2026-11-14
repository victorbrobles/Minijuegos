// client/src/games/Ubicacion/etiquetas.js
// Nombres en español que se pintan sobre el mapa base (que no lleva etiquetas): [nombre, lat, lng, zoom mínimo].
// Las posiciones son aproximadas (el centro visual de cada país u océano).
export const OCEANOS = [
  ['Océano Pacífico', 0, -150, 2], ['Océano Pacífico', -10, 170, 2], ['Océano Atlántico', 15, -40, 2], ['Océano Atlántico', -25, -15, 2],
  ['Océano Índico', -20, 80, 2], ['Océano Glacial Ártico', 82, 0, 2], ['Océano Antártico', -62, 30, 2],
  ['Mar Mediterráneo', 35, 18, 4], ['Mar Caribe', 15, -75, 4], ['Mar del Norte', 56, 3, 5], ['Mar Báltico', 58, 19, 5], ['Mar Negro', 43, 34, 5],
  ['Mar Rojo', 20, 38.5, 5], ['Golfo de México', 25, -90, 4], ['Mar Arábigo', 15, 63, 4], ['Mar de China Meridional', 13, 114, 4], ['Mar de Japón', 40, 135, 5]
];

export const PAISES = [
  // Grandes (zoom 2)
  ['Rusia', 61, 98, 2], ['Canadá', 60, -105, 2], ['Estados Unidos', 39, -99, 2], ['Brasil', -10, -53, 2], ['China', 35, 103, 2], ['Australia', -25, 134, 2],
  ['India', 22, 79, 3], ['Argentina', -35, -65, 3], ['Kazajistán', 48, 67, 3], ['Argelia', 28, 2.5, 3], ['RD del Congo', -3, 23.5, 3], ['Groenlandia', 72, -41, 2],
  ['Arabia Saudí', 24, 45, 3], ['México', 23.5, -102, 3], ['Indonesia', -2, 117, 3], ['Sudán', 15.5, 30, 3], ['Libia', 27, 17, 3], ['Irán', 32.5, 54, 3],
  ['Mongolia', 46.5, 103, 3], ['Perú', -9.5, -75, 3], ['Chad', 15.5, 18.7, 3], ['Níger', 17.5, 9.4, 3], ['Angola', -12.3, 17.5, 3], ['Malí', 17.5, -3.5, 3],
  ['Sudáfrica', -29, 24.5, 3], ['Colombia', 4, -73, 3], ['Etiopía', 8.6, 39.6, 3], ['Bolivia', -16.7, -64.5, 3], ['Mauritania', 20.3, -10.3, 3],
  ['Egipto', 26.6, 30, 3], ['Tanzania', -6.3, 34.8, 3], ['Nigeria', 9.6, 8.1, 3], ['Venezuela', 7.1, -66.2, 3], ['Pakistán', 29.9, 69.4, 3],
  ['Namibia', -22, 17.2, 3], ['Mozambique', -17.3, 35.5, 3], ['Turquía', 39, 35.2, 3], ['Chile', -30, -71, 3], ['Zambia', -13.5, 27.8, 3],
  ['Birmania', 21.5, 96, 4], ['Afganistán', 33.8, 66, 4], ['Somalia', 6, 46, 4], ['República Centroafricana', 6.6, 20.5, 4], ['Ucrania', 49, 31.5, 3],
  ['Madagascar', -19.4, 46.7, 4], ['Botsuana', -22.2, 23.8, 4], ['Kenia', 0.5, 38, 4], ['Francia', 46.6, 2.4, 3], ['Yemen', 15.8, 47.5, 4],
  ['Tailandia', 15.6, 101, 4], ['España', 40.2, -3.6, 3], ['Turkmenistán', 39, 59.5, 4], ['Camerún', 5.7, 12.7, 4], ['Papúa Nueva Guinea', -6.5, 145, 4],
  ['Suecia', 63, 16.5, 3], ['Uzbekistán', 41.7, 63.8, 4], ['Marruecos', 31.8, -6.5, 4], ['Irak', 33, 43.7, 4], ['Paraguay', -23.2, -58.4, 4],
  ['Zimbabue', -19, 29.8, 4], ['Japón', 36.5, 138.5, 3], ['Alemania', 51.1, 10.4, 3], ['Finlandia', 64.5, 26, 3], ['Vietnam', 15.5, 106.5, 4],
  ['Malasia', 3.8, 102, 4], ['Noruega', 61.5, 9, 3], ['Costa de Marfil', 7.6, -5.5, 4], ['Polonia', 52, 19.4, 4], ['Omán', 21, 57, 4],
  ['Italia', 42.8, 12.5, 3], ['Filipinas', 12.5, 122, 4], ['Ecuador', -1.5, -78.4, 4], ['Burkina Faso', 12.3, -1.7, 4], ['Nueva Zelanda', -41.5, 172.5, 3],
  ['Gabón', -0.6, 11.6, 5], ['Sahara Occidental', 24.5, -13, 5], ['Guinea', 10.4, -10.9, 5], ['Reino Unido', 53.5, -2, 3], ['Uganda', 1.4, 32.4, 5],
  ['Ghana', 7.9, -1.1, 4], ['Rumanía', 45.9, 24.9, 4], ['Laos', 19.5, 102.5, 5], ['Guyana', 4.9, -58.9, 5], ['Bielorrusia', 53.7, 28, 4],
  ['Kirguistán', 41.4, 74.6, 5], ['Senegal', 14.5, -14.5, 4], ['Siria', 35, 38.5, 4], ['Camboya', 12.6, 104.9, 5], ['Uruguay', -32.8, -56, 4],
  ['Surinam', 4.1, -55.9, 5], ['Túnez', 34, 9.5, 4], ['Bangladés', 23.8, 90.3, 4], ['Nepal', 28.2, 84, 5], ['Tayikistán', 38.8, 71.2, 5],
  ['Grecia', 39.3, 22, 4], ['Nicaragua', 12.9, -85.2, 5], ['Corea del Norte', 40.2, 127.2, 5], ['Malaui', -13.2, 34.3, 5], ['Eritrea', 15.6, 39, 5],
  ['Benín', 9.6, 2.3, 5], ['Honduras', 14.8, -86.6, 5], ['Liberia', 6.4, -9.4, 5], ['Bulgaria', 42.7, 25.3, 5], ['Cuba', 21.8, -79, 4],
  ['Guatemala', 15.6, -90.3, 5], ['Islandia', 64.9, -18.6, 4], ['Corea del Sur', 36.4, 127.9, 4], ['Hungría', 47.1, 19.4, 5], ['Portugal', 39.6, -8, 4],
  ['Jordania', 31.2, 36.5, 5], ['Serbia', 44, 20.8, 5], ['Azerbaiyán', 40.3, 47.7, 5], ['Austria', 47.6, 14.1, 5], ['Emiratos Árabes Unidos', 23.8, 54.2, 5],
  ['Chequia', 49.8, 15.5, 5], ['Panamá', 8.5, -80.1, 5], ['Sierra Leona', 8.6, -11.8, 5], ['Irlanda', 53.2, -8.1, 4], ['Georgia', 42.2, 43.5, 5],
  ['Sri Lanka', 7.8, 80.7, 5], ['Lituania', 55.3, 23.9, 5], ['Letonia', 56.9, 24.9, 5], ['Togo', 8.6, 1, 6], ['Croacia', 45.1, 15.5, 5],
  ['Bosnia y Herzegovina', 44.2, 17.8, 6], ['Costa Rica', 9.9, -84.2, 5], ['Eslovaquia', 48.7, 19.7, 5], ['República Dominicana', 18.9, -70.5, 5],
  ['Estonia', 58.7, 25.5, 5], ['Dinamarca', 56, 9.3, 4], ['Países Bajos', 52.3, 5.6, 5], ['Suiza', 46.8, 8.2, 5], ['Bután', 27.4, 90.4, 6],
  ['Taiwán', 23.7, 121, 5], ['Guinea-Bisáu', 12, -15, 6], ['Moldavia', 47.2, 28.5, 6], ['Bélgica', 50.6, 4.6, 5], ['Lesoto', -29.6, 28.2, 6],
  ['Armenia', 40.2, 45, 6], ['Albania', 41.1, 20, 6], ['Ruanda', -2, 29.9, 6], ['Haití', 19, -72.4, 6], ['Belice', 17.2, -88.7, 6],
  ['Macedonia del Norte', 41.6, 21.7, 6], ['Yibuti', 11.8, 42.6, 6], ['El Salvador', 13.7, -88.9, 6], ['Eslovenia', 46.1, 14.8, 6], ['Israel', 31.2, 34.9, 6],
  ['Kuwait', 29.3, 47.6, 6], ['Montenegro', 42.8, 19.3, 6], ['Jamaica', 18.1, -77.3, 6], ['Catar', 25.3, 51.2, 6], ['Líbano', 33.9, 35.9, 6],
  ['Chipre', 35, 33.2, 6], ['Kosovo', 42.6, 20.9, 6], ['Luxemburgo', 49.8, 6.1, 7], ['Brunéi', 4.5, 114.7, 7], ['Gambia', 13.5, -15.4, 6],
  ['Esuatini', -26.5, 31.5, 6], ['Burundi', -3.4, 29.9, 6], ['Guinea Ecuatorial', 1.6, 10.4, 6], ['Timor Oriental', -8.8, 125.9, 6], ['Fiyi', -17.8, 178, 6],
  ['Bahamas', 24.5, -77.5, 6], ['Trinidad y Tobago', 10.5, -61.3, 7], ['Cabo Verde', 15.1, -23.6, 6], ['Mauricio', -20.3, 57.6, 7], ['Andorra', 42.55, 1.6, 8],
  ['Malta', 35.9, 14.4, 7], ['Mónaco', 43.74, 7.42, 9], ['San Marino', 43.94, 12.46, 9], ['Liechtenstein', 47.16, 9.55, 9], ['Ciudad del Vaticano', 41.903, 12.453, 11],
  ['Singapur', 1.35, 103.82, 7], ['Baréin', 26, 50.55, 7], ['Maldivas', 3.2, 73.2, 7], ['Seychelles', -4.68, 55.5, 7]
];
