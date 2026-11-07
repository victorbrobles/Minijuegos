# Minigames Hub

Backend: Node + Express (`server/`). Frontend: React + Vite (`client/`).

## Arrancar
```bash
npm run install:all
npm run dev
```
- Web: http://localhost:5173
- API: http://localhost:3001/api/games

## Añadir un minijuego
1. Añade una entrada en `server/data/games.json` (el `id` será la URL: `/juego/<id>`).
2. Crea su componente en `client/src/games/<Nombre>/`.
3. Regístralo en `client/src/games/registry.js`.
4. Si necesita lógica en servidor, añade rutas en `server/routes/`.

## Menús iniciales unificados
- Todos los juegos usan las piezas de `client/src/components/MenuJuego.jsx` (menú principal, modo online, crear partida,
  unirse con código, sala de espera y selector de jugadores) y los estilos de `client/src/components/MenuJuego.css`.
- El título, la descripción, el icono y los colores salen de `client/src/games/meta.js`: `GamePage` pasa los colores
  como `--g1`/`--g2` (también al fondo de la página), así que no hay que poner colores fijos en el CSS de cada juego.
- Juegos con modo local: menú principal → *Jugar online* (crear / unirse) o *Jugar en un único dispositivo* (selector de jugadores).
  Juegos solo online (p. ej. Traiciones, Bingoball, Lleva la cuenta): el menú principal muestra directamente *Crear partida* / *Unirse con código*.

## Minijuego: Siglas y acrónimos
- Al entrar se elige una categoría (o todas mezcladas); cada sigla tiene 20 segundos y la partida acaba al fallar.
- Datos en SQLite (`server/data/minigames.db`, se crea solo). La fuente de verdad es `server/data/siglas.seed.js`,
  agrupado por categoría. Al guardar el archivo el servidor se reinicia y la base se sincroniza
  (se añaden, actualizan y eliminan siglas). Para una categoría nueva basta con añadir una clave nueva.
- Formato de cada entrada: `['SIGLA', 'Respuesta', ['alternativa opcional']]`.
- La comprobación se hace en el servidor e ignora mayúsculas, tildes, signos y palabras de relleno.

## Modo administrador y categorías ocultas
- En la portada hay un campo **Modo administrador**: se introduce el código de 6 dígitos de tu app de autenticación
  (MFA/TOTP: Google Authenticator, Authy, Microsoft Authenticator…). Si es válido, el servidor devuelve un token firmado
  (caduca a las 12 h) y en *Quién es Quién* aparecen las categorías ocultas. Sin código, todo funciona como siempre.
- Las categorías ocultas se escriben en `server/data/quienesquien.admin.seed.js` (mismo formato que el seed normal).
  Nunca se envían al navegador ni se reparten sin token de administrador, y "Todas las categorías" tampoco las mezcla.
- El secreto MFA está en `server/data/.admin-totp` (en `.gitignore`; también puede ir en la variable de entorno
  `ADMIN_TOTP_SECRET`). **No lo compartas ni lo subas a ningún repositorio**: quien tenga ese fichero puede generar códigos.
  Si el fichero no existe, el modo administrador queda desactivado y no se puede dar de alta desde la web.
- Cada código solo se puede usar una vez. Tras 5 fallos desde una IP (o 10 en total) el login se bloquea 15 minutos.
- El servidor solo **verifica** códigos: no genera ni da de alta ningún MFA. Usa el secreto que ya tienes en tu app
  de autenticación, guardado en `server/data/.admin-totp` (o en `ADMIN_TOTP_SECRET`).

## Minijuego: Rapidfire
- De 2 a 10 jugadores. Al empezar se sortea quién abre; ese jugador ve 3 categorías al azar (de 30) y elige una.
- Sale un reto de esa categoría (p. ej. «8 países que empiecen por M») con 60 s de cronómetro. Quien dirige la partida
  pulsa **Correcto** (suma 2 puntos por elemento), **Rebote** o **Rendirse**.
- Si se acaba el tiempo o hay rebote, el turno pasa a otro jugador **al azar** (entre los que aún no han probado ese reto)
  y el tiempo se reinicia; quien coge el rebote y acierta se lleva todos los puntos. Si alguien acierta, la ronda termina; si nadie puede, **Rendirse** cierra la ronda sin puntos.
- Entre rondas sale la tabla de puntuaciones, con **Continuar** o **Finalizar el juego** (puntuaciones finales y ganador).
  La siguiente ronda la abre un jugador al azar: todos abren una vez antes de que se repita ninguno.
- Es solo frontend. Los retos están en `client/src/games/Rapidfire/retos.js` (`[cantidad, 'texto']` por categoría);
  el tiempo, la cuenta atrás y los puntos son constantes al inicio de `Rapidfire.jsx`.

## Minijuego: Luna de Sangre (hombres lobo)
- De 7 a 14 jugadores (ideal 8–12), pasándose el dispositivo como el resto de juegos. Es solo frontend (`client/src/games/Lobos/`).
- `roles.js`: catálogo de 25 roles (17 originales + Falsificador, Eco, Notario, Banquero, Viuda Negra, Contagiado, Agente Doble y Camaleón) (textos, bando y guía de turno). `engine.js`: reglas puras (noche, muertes encadenadas, votación, victoria).
- `composiciones.js`: 4 tipos de partida recomendados (Clásica, Equilibrada, Estratégica, Caótica) por número de jugadores, más validación de combinaciones personalizadas.
- `simulacion.js`: simulación con bots que usa el mismo motor; la pantalla de roles muestra con ella el «equilibrio estimado».
  Para reajustar tablas: `node` + importar `simularComposicion(roles, 1500, { pDeduccion: 0.3 })`.
- En tu turno de noche y de votación hay un botón **Mi rol** con tu ficha e instrucciones; en el debate, **Consultar mi rol** (privado, por nombre).
- Añadir un rol: definirlo en `roles.js`, implementar su acción en `TurnoNoche.jsx` y su efecto en `engine.js` (`resolverNoche`/`matar`).
- Mecánicas globales opcionales (`engine.js`: `EVENTOS`, `OBJETOS`, `MODIFICADORES`, rumores): se activan en la pantalla de roles; todas desactivadas por defecto.
- Las composiciones (`composiciones.js`) priorizan los roles nuevos; la «Clásica» es la única que solo usa roles clásicos.

## Minijuego: GeoQuiz
- Quiz de geografía por turnos (local en un dispositivo u online, de 1 a 12 jugadores). Se sortea quién empieza y luego se sigue el orden;
  cada turno empieza con la pantalla «Turno de…» y el botón «Listo».
- Modos: **GeoMix** (todo mezclado), **Especialista** (una categoría), **Contrarreloj** (60 s por turno con preguntas rápidas) y
  **Supervivencia** (3 vidas, gana el último en pie).
- Tipos de prueba: respuesta única, test de opciones, enumerar, pistas progresivas, ordenar y aproximación numérica.
- Reglas en `server/geoquiz/engine.js`, con una **copia idéntica** en `client/src/games/GeoQuiz/engine.js` para el modo local (cambia las dos a la vez).
- Preguntas en `server/data/seeds/geoquiz/` (un fichero por categoría; formato explicado en `_tipos.js`). Las respuestas admiten alias
  separados por `|` (`'Países Bajos|Holanda'`); al comprobarlas se ignoran tildes, mayúsculas y artículos y se perdonan pequeñas erratas.
