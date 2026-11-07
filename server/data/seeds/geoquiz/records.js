// server/data/seeds/geoquiz/records.js — Números y récords geográficos
// Las preguntas numéricas (N) se puntúan por cercanía al valor real.
import { R, O, N } from './_tipos.js';

export default {
  id: 'records',
  nombre: 'Números y récords',
  icono: 'trophy',
  preguntas: [
    // Aproximación
    N('Aproximación', '¿Cuántos metros mide el Everest?', 8849, 'metros'),
    N('Aproximación', '¿Cuántos kilómetros mide el río Nilo?', 6650, 'km'),
    N('Aproximación', '¿Cuántos metros de profundidad tiene el lago Baikal?', 1642, 'metros'),
    N('Aproximación', '¿Cuántos países son miembros de la ONU?', 193, 'países'),
    N('Aproximación', '¿Cuántos países hay en África?', 54, 'países'),
    N('Aproximación', '¿Cuántos metros mide el Aconcagua?', 6961, 'metros'),
    N('Aproximación', '¿Cuántos metros mide el Mont Blanc?', 4806, 'metros'),
    N('Aproximación', '¿Cuántos metros de profundidad tiene la fosa de las Marianas?', 10935, 'metros'),
    N('Aproximación', '¿A cuántos metros de altitud está el lago Titicaca?', 3812, 'metros'),
    N('Aproximación', '¿Con cuántos países tiene frontera terrestre Rusia?', 14, 'países'),
    N('Aproximación', '¿Cuántos millones de km² mide Rusia?', 17.1, 'millones de km²'),
    N('Aproximación', '¿Cuántos millones de km² mide Groenlandia?', 2.17, 'millones de km²'),

    // Récords
    R('Récords', '¿Cuál es la isla más grande del mundo?', 'Groenlandia'),
    R('Récords', '¿Cuál es el país más pequeño del mundo?', 'Ciudad del Vaticano|Vaticano'),
    R('Récords', '¿Cuál es el lago más grande del mundo por superficie?', 'Mar Caspio|Caspio'),
    R('Récords', '¿Cuál es el país más grande de América del Sur?', 'Brasil'),
    R('Récords', '¿Qué país limita con más países, empatado con Rusia?', 'China'),
    O('Récords', '¿Cuál es el desierto más extenso del mundo?', 'La Antártida', ['El Sahara', 'El Gobi', 'El Ártico'], 'Un desierto es un lugar con muy pocas precipitaciones, no necesariamente cálido.'),
    O('Récords', '¿Cuál es la capital (sede de gobierno) más alta del mundo?', 'La Paz', ['Quito', 'Bogotá', 'Katmandú']),
    O('Récords', '¿Cuál es el océano más grande?', 'Pacífico', ['Atlántico', 'Índico', 'Ártico']),
    O('Récords', '¿Cuál es el país más grande del mundo?', 'Rusia', ['Canadá', 'China', 'Estados Unidos']),
    O('Récords', '¿Cuál es el río más caudaloso del mundo?', 'Amazonas', ['Nilo', 'Congo', 'Yangtsé'])
  ]
};
