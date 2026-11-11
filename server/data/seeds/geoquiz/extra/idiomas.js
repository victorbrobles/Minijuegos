// GeoQuiz · Idiomas (ampliación)
import { R, O, E, ORD } from '../_tipos.js';

const que = (frase, idioma) => R('¿Qué idioma es?', `«${frase}» — ¿en qué idioma está?`, idioma);
const esc = (frase, idioma, otras) => O('Idioma por escritura', `«${frase}» — ¿en qué idioma está?`, idioma, otras);
const en = (es, ing) => R('Traducción al inglés', `¿Cómo se dice «${es}» en inglés?`, ing);
const es = (ing, esp) => R('Traducción al español', `¿Qué significa «${ing}» en español?`, esp);
const oficial = (pais, idioma) => R('País e idioma', `¿Qué idioma oficial se habla en ${pais}?`, idioma);

export default [
  que('Bonjour, ça va ?', 'Francés'), que('Bom dia', 'Portugués'), que('Buongiorno', 'Italiano'), que('Hej, hur mår du?', 'Sueco'),
  que('Tak skal du have', 'Danés'), que('Takk', 'Noruego'), que('Dobrý den', 'Checo'), que('Mulțumesc', 'Rumano'),
  que('Efharistó', 'Griego'), que('Spasibo', 'Ruso'), que('Shukran', 'Árabe'), que('Xièxie', 'Chino|Chino mandarín|Mandarín'),
  que('Kamsahamnida', 'Coreano'), que('Terima kasih', 'Indonesio|Malayo'), que('Salamat po', 'Tagalo|Filipino'), que('Eskerrik asko', 'Euskera|Vasco'),
  que('Moitas grazas', 'Gallego'), que('Moltes gràcies', 'Catalán'), que('Diolch', 'Galés'), que('Go raibh maith agat', 'Irlandés|Gaélico irlandés'),
  que('Dziękuję bardzo, do widzenia', 'Polaco'), que('Hvala lijepa', 'Croata'), que('Aitäh', 'Estonio'), que('Paldies', 'Letón'),
  que('Ačiū', 'Lituano'), que('Toda raba', 'Hebreo'), que('Merci beaucoup', 'Francés'), que('Dhanyavaad', 'Hindi'),
  que('Khop khun krap', 'Tailandés'), que('Cảm ơn', 'Vietnamita'), que('Grazzi', 'Maltés'), que('Takk fyrir', 'Islandés'),
  esc('Спасибо', 'Ruso', ['Búlgaro', 'Griego', 'Serbio']), esc('Ευχαριστώ', 'Griego', ['Ruso', 'Georgiano', 'Armenio']),
  esc('ありがとう', 'Japonés', ['Chino', 'Coreano', 'Tailandés']), esc('谢谢', 'Chino', ['Japonés', 'Coreano', 'Vietnamita']),
  esc('감사합니다', 'Coreano', ['Japonés', 'Chino', 'Mongol']), esc('धन्यवाद', 'Hindi', ['Bengalí', 'Tamil', 'Tailandés']),
  esc('Շնորհակալություն', 'Armenio', ['Georgiano', 'Griego', 'Ruso']), esc('תודה', 'Hebreo', ['Árabe', 'Persa', 'Griego']),
  esc('شكرا', 'Árabe', ['Hebreo', 'Hindi', 'Griego']), esc('ধন্যবাদ', 'Bengalí', ['Hindi', 'Tailandés', 'Tamil']),
  esc('ขอบคุณ', 'Tailandés', ['Laosiano', 'Jemer', 'Birmano']), esc('Дякую', 'Ucraniano', ['Polaco', 'Griego', 'Georgiano']),
  en('mesa', 'Table'), en('ventana', 'Window'), en('cocina', 'Kitchen'), en('lluvia', 'Rain'), en('pájaro', 'Bird'),
  en('fresa', 'Strawberry'), en('tobillo', 'Ankle'), en('zanahoria', 'Carrot'), en('hormiga', 'Ant'), en('tijeras', 'Scissors'),
  en('martillo', 'Hammer'), en('nube', 'Cloud'), en('lechuga', 'Lettuce'), en('cerdo', 'Pig'), en('puente', 'Bridge'),
  es('cheese', 'Queso'), es('knife', 'Cuchillo'), es('shoulder', 'Hombro'), es('owl', 'Búho|Lechuza'), es('mushroom', 'Seta|Champiñón|Hongo'),
  es('lighthouse', 'Faro'), es('ladder', 'Escalera'), es('pumpkin', 'Calabaza'), es('beard', 'Barba'), es('toothbrush', 'Cepillo de dientes'),
  es('rabbit', 'Conejo'), es('blanket', 'Manta|Cobija|Frazada'), es('sheep', 'Oveja'), es('bee', 'Abeja'), es('wolf', 'Lobo'),
  oficial('Brasil', 'Portugués'), oficial('Angola', 'Portugués'), oficial('Haití', 'Francés|Criollo haitiano'), oficial('Argelia', 'Árabe'),
  oficial('Guinea Ecuatorial', 'Español'), oficial('Filipinas', 'Filipino|Tagalo|Inglés'), oficial('Irán', 'Persa|Farsi'), oficial('Israel', 'Hebreo'),
  oficial('Etiopía', 'Amárico'), oficial('Pakistán', 'Urdu|Inglés'), oficial('Belice', 'Inglés'), oficial('Islandia', 'Islandés'),
  E('Idiomas oficiales', '¿Cuáles son las lenguas oficiales de Canadá?', ['Inglés', 'Francés']),
  E('Idiomas oficiales', '¿Qué lenguas son cooficiales en alguna comunidad de España, además del castellano?', ['Catalán|Valenciano', 'Gallego', 'Euskera|Vasco', 'Aranés|Occitano']),
  E('Idiomas oficiales', '¿Cuáles son los idiomas oficiales de la ONU?', ['Inglés', 'Francés', 'Español', 'Ruso', 'Chino', 'Árabe']),
  E('Idiomas oficiales', '¿En qué países de Europa es oficial el francés?', ['Francia', 'Bélgica', 'Suiza', 'Luxemburgo', 'Mónaco']),
  E('Idiomas oficiales', '¿En qué países de Europa es oficial el alemán?', ['Alemania', 'Austria', 'Suiza', 'Liechtenstein', 'Luxemburgo', 'Bélgica']),
  O('Falsos amigos', '¿Qué significa realmente «library» en inglés?', 'Biblioteca', ['Librería', 'Libreta', 'Libertad']),
  O('Falsos amigos', '¿Qué significa realmente «exit» en inglés?', 'Salida', ['Éxito', 'Examen', 'Exilio']),
  O('Falsos amigos', '¿Qué significa realmente «assist» en inglés?', 'Ayudar', ['Asistir a clase', 'Asistente', 'Asustar']),
  O('Falsos amigos', '¿Qué significa realmente «realize» en inglés?', 'Darse cuenta', ['Realizar', 'Reanudar', 'Revisar']),
  O('Falsos amigos', '¿Qué significa realmente «fabric» en inglés?', 'Tela', ['Fábrica', 'Fábula', 'Fabricante']),
  O('Falsos amigos', '¿Qué significa realmente «argument» en inglés?', 'Discusión', ['Argumento de una película', 'Acuerdo', 'Regalo']),
  O('Falsos amigos', '¿Qué significa realmente «burro» en italiano?', 'Mantequilla', ['Burro', 'Barro', 'Borracho']),
  O('Falsos amigos', '¿Qué significa realmente «salir» en francés?', 'Ensuciar', ['Salir', 'Saltar', 'Saludar']),
  O('¿Cómo se dice?', '¿Cómo se dice «hola» en italiano?', 'Ciao', ['Hallo', 'Olá', 'Salut']),
  O('¿Cómo se dice?', '¿Cómo se dice «gracias» en portugués?', 'Obrigado', ['Merci', 'Danke', 'Grazie']),
  O('¿Cómo se dice?', '¿Cómo se dice «buenas noches» en francés?', 'Bonne nuit', ['Bonjour', 'Bon appétit', 'Au revoir']),
  O('¿Cómo se dice?', '¿Cómo se dice «cerveza» en alemán?', 'Bier', ['Wein', 'Wasser', 'Brot']),
  O('¿Cómo se dice?', '¿Cómo se dice «agua» en francés?', 'Eau', ['Wasser', 'Acqua', 'Água']),
  O('¿Cómo se dice?', '¿Cómo se dice «amor» en italiano?', 'Amore', ['Liebe', 'Love', 'Amour']),
  ORD('Idiomas más hablados', 'Ordena por número total de hablantes (de más a menos)', ['Inglés', 'Chino mandarín', 'Hindi', 'Español', 'Francés'], 'de más a menos')
];
