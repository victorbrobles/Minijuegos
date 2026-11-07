// server/data/seeds/geoquiz/idiomas.js — Idiomas y traducciones
import { R, O, E, ORD } from './_tipos.js';

export default {
  id: 'idiomas',
  nombre: 'Idiomas y traducciones',
  icono: 'letters',
  preguntas: [
    // ¿Qué idioma es?
    R('¿Qué idioma es?', '«Guten Morgen» — ¿en qué idioma está?', 'Alemán'),
    R('¿Qué idioma es?', '«Obrigado» — ¿en qué idioma está?', 'Portugués'),
    R('¿Qué idioma es?', '«Grazie mille» — ¿en qué idioma está?', 'Italiano'),
    R('¿Qué idioma es?', '«Dziękuję» — ¿en qué idioma está?', 'Polaco'),
    R('¿Qué idioma es?', '«Kiitos» — ¿en qué idioma está?', 'Finés|Finlandés'),
    R('¿Qué idioma es?', '«Asante sana» — ¿en qué idioma está?', 'Suajili|Swahili|Suahili'),
    R('¿Qué idioma es?', '«Teşekkür ederim» — ¿en qué idioma está?', 'Turco'),
    R('¿Qué idioma es?', '«Köszönöm» — ¿en qué idioma está?', 'Húngaro'),
    R('¿Qué idioma es?', '«Dank je wel» — ¿en qué idioma está?', 'Neerlandés|Holandés'),

    // Idioma por escritura
    O('Idioma por escritura', '«Привет» — ¿en qué idioma está?', 'Ruso', ['Griego', 'Hebreo', 'Armenio']),
    O('Idioma por escritura', '«Γειά σου» — ¿en qué idioma está?', 'Griego', ['Ruso', 'Georgiano', 'Armenio']),
    O('Idioma por escritura', '«שלום» — ¿en qué idioma está?', 'Hebreo', ['Árabe', 'Persa', 'Hindi']),
    O('Idioma por escritura', '«こんにちは» — ¿en qué idioma está?', 'Japonés', ['Chino', 'Coreano', 'Tailandés']),
    O('Idioma por escritura', '«안녕하세요» — ¿en qué idioma está?', 'Coreano', ['Japonés', 'Chino', 'Vietnamita']),
    O('Idioma por escritura', '«नमस्ते» — ¿en qué idioma está?', 'Hindi', ['Tailandés', 'Bengalí', 'Árabe']),
    O('Idioma por escritura', '«สวัสดี» — ¿en qué idioma está?', 'Tailandés', ['Hindi', 'Jemer', 'Coreano']),
    O('Idioma por escritura', '«مرحبا» — ¿en qué idioma está?', 'Árabe', ['Hebreo', 'Hindi', 'Griego']),
    O('Idioma por escritura', '«გამარჯობა» — ¿en qué idioma está?', 'Georgiano', ['Armenio', 'Griego', 'Ruso']),

    // Traducciones
    R('Traducción al inglés', '¿Cómo se dice «mariposa» en inglés?', 'Butterfly'),
    R('Traducción al inglés', '¿Cómo se dice «cuchara» en inglés?', 'Spoon'),
    R('Traducción al inglés', '¿Cómo se dice «ardilla» en inglés?', 'Squirrel'),
    R('Traducción al inglés', '¿Cómo se dice «almohada» en inglés?', 'Pillow'),
    R('Traducción al inglés', '¿Cómo se dice «rodilla» en inglés?', 'Knee'),
    R('Traducción al español', '¿Qué significa «strawberry» en español?', 'Fresa|Frutilla'),
    R('Traducción al español', '¿Qué significa «thunder» en español?', 'Trueno'),
    R('Traducción al español', '¿Qué significa «wheel» en español?', 'Rueda'),
    R('Traducción al español', '¿Qué significa «library» en español?', 'Biblioteca'),

    // País e idioma
    R('País e idioma', '¿Qué idioma oficial se habla en Mozambique?', 'Portugués'),
    R('País e idioma', '¿Qué idioma oficial se habla en Surinam?', 'Neerlandés|Holandés'),
    R('País e idioma', '¿Qué idioma oficial se habla en Senegal?', 'Francés'),
    R('País e idioma', '¿Cuál es el idioma oficial de Austria?', 'Alemán'),
    E('Idiomas oficiales', '¿Cuáles son las lenguas oficiales de Suiza?', ['Alemán', 'Francés', 'Italiano', 'Romanche']),
    E('Idiomas oficiales', '¿Cuáles son las lenguas oficiales de Bélgica?', ['Neerlandés|Holandés|Flamenco', 'Francés', 'Alemán']),
    E('Idiomas oficiales', '¿Cuáles son las lenguas oficiales de Singapur?', ['Inglés', 'Malayo', 'Chino mandarín|Mandarín|Chino', 'Tamil']),

    // Falsos amigos
    O('Falsos amigos', '¿Qué significa realmente «actually» en inglés?', 'En realidad', ['Actualmente', 'Exactamente', 'Activamente']),
    O('Falsos amigos', '¿Qué significa realmente «embarrassed» en inglés?', 'Avergonzado', ['Embarazada', 'Enfadado', 'Emocionado']),
    O('Falsos amigos', '¿Qué significa realmente «carpet» en inglés?', 'Alfombra', ['Carpeta', 'Carpa', 'Cortina']),
    O('Falsos amigos', '¿Qué significa realmente «sensible» en inglés?', 'Sensato', ['Sensible', 'Sensual', 'Visible']),
    O('Falsos amigos', '¿Qué significa realmente «constipated» en inglés?', 'Estreñido', ['Resfriado', 'Constipado', 'Cansado']),

    // ¿Cómo se dice?
    O('¿Cómo se dice?', '¿Cómo se dice «gracias» en japonés?', 'Arigatō', ['Konnichiwa', 'Sayōnara', 'Ohayō']),
    O('¿Cómo se dice?', '¿Cómo se dice «adiós» en alemán?', 'Auf Wiedersehen', ['Guten Tag', 'Danke schön', 'Gute Nacht']),
    O('¿Cómo se dice?', '¿Cómo se dice «por favor» en francés?', "S'il vous plaît", ['Merci beaucoup', 'Excusez-moi', 'Au revoir']),
    O('¿Cómo se dice?', '¿Cómo se dice «buenos días» en italiano?', 'Buongiorno', ['Buonanotte', 'Arrivederci', 'Prego']),

    // Idiomas más hablados
    ORD('Idiomas más hablados', 'Ordena estos idiomas por número de hablantes nativos', ['Chino mandarín', 'Español', 'Inglés', 'Hindi', 'Japonés'], 'de más a menos hablantes nativos')
  ]
};
