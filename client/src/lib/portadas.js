// client/src/lib/portadas.js
// Miniaturas de las portadas (320×320, en /covers/mini/) para las fichas de la portada: pesan un tercio.
// Si a una portada nueva aún no le han hecho miniatura, se usa la grande.
export const miniatura = (imagen) => (imagen ? imagen.replace(/\/covers\/([^/]+)$/, '/covers/mini/$1') : imagen);
