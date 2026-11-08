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
- Interfaz de partida en `Escena.jsx` (cabecera de noche/día, la aldea con todos los vecinos y la pantalla «pasa el móvil»); los menús usan los componentes comunes de `MenuJuego.jsx`.
- Online: si el anfitrión abandona la sala, el papel pasa a otro jugador humano (`adminId` en `server/lobos/sala.js`); si no queda nadie en la sala de espera, se cierra.

## Minijuego: GeoQuiz
- Quiz de geografía por turnos (local en un dispositivo u online, de 2 a 12 jugadores). Se sortea quién empieza y luego se sigue el orden;
  cada turno empieza con la pantalla «Turno de…» y el botón «Listo».
- Modos: **GeoMix** (todo mezclado), **Especialista** (una categoría), **Contrarreloj** (60 s por turno con preguntas rápidas) y
  **Supervivencia** (3 vidas, gana el último en pie).
- Tipos de prueba: respuesta única, test de opciones, enumerar, pistas progresivas, ordenar y aproximación numérica.
- Reglas en `server/geoquiz/engine.js`, con una **copia idéntica** en `client/src/games/GeoQuiz/engine.js` para el modo local (cambia las dos a la vez).
- Preguntas en `server/data/seeds/geoquiz/` (un fichero por categoría; formato explicado en `_tipos.js`). Las respuestas admiten alias
  separados por `|` (`'Países Bajos|Holanda'`); al comprobarlas se ignoran tildes, mayúsculas y artículos y se perdonan pequeñas erratas.

## Juegos para un jugador (categoría «🎯 Para un jugador»)
- Son solo frontend y guardan el récord en el navegador (`localStorage`, clave `minijuegos_record_<id>`).
- Piezas comunes en `client/src/components/UnJugador.jsx` (+ `UnJugador.css`): portada con récord (`PortadaUnJugador`), cabecera de partida,
  pantalla final, ayuda, confirmar salida, avisos, barra de tiempo y `useRecord`. Usan los colores de cada juego de `meta.js`.
- **¿Verdadero o falso? Exprés** (`VerdaderoFalso/`): 3 s por afirmación sin pausa; un fallo termina la partida. Afirmaciones en `afirmaciones.js` (`[texto, esVerdadera, explicación]`).
- **¿Qué sobra en la pecera?** (`Pecera/`): retos escritos a mano en `retos.js` (6 elementos, intruso, trampa y explicaciones).
- **Cripto-Hacker** (`CriptoHacker/`): deducción tipo Mastermind; cada intento y el tiempo suben el rastreo hasta el 100 %.
- **Inspector de Anomalías** (`Anomalias/`): salas y objetos en `salas.js`; los cambios son más sutiles cuanto más alto es el nivel.
- **Trinchera 1914** (`Trinchera/`): cartas en `cartas.js` (efectos `m`/`c`/`u`/`s`, con historias encadenadas mediante `activa`/`requiere`) y reglas en `motor.js`.
- **Cuenta Ovejas** (`Ovejas/`): `motor.js` genera la manada (tipos, carriles, velocidades, arbustos) según el nivel.
- **El Segundero Interior** (`Segundero/`): 6 rondas con distracciones definidas en `RONDAS` (contador oculto, pulsos de otro ritmo, destellos, contador falso).
- **Palabra Encadenada** (`Encadenada/`): palabras de 4 letras en `diccionario.js` (sin tildes ni Ñ); `motor.js` calcula los caminos más cortos con BFS. Para aceptar más palabras, añádelas al diccionario.
- **El Mapa Mentiroso** (`MapaMentiroso/`): `motor.js` genera ruta y pueblos; desde el nivel 3 la brújula se gira y desde el 5 una indicación va al revés.
- **Ordénalos sin mirar** (`Ordenalos/`): pesos ocultos; el objetivo de pesadas es el mínimo teórico para ordenar n elementos.
- **Excusas a Domicilio** (`Excusas/`): fichas, hechos y preguntas en `datos.js`; `motor.js` detecta contradicciones con lo que sabe el jefe, repeticiones y excusas absurdas.
- **Semáforo Invertido** (`Semaforo/`): efecto Stroop con una regla que cambia cada 10 s.
- **Un Solo Trazo** (`UnTrazo/`): `motor.js` genera figuras en una cuadrícula sin líneas cruzadas; una figura es posible si es conexa y tiene 0 o 2 puntos de grado impar.

## Minijuego: Test del viajero (`Ubicacion/`)
- Puntuación «como en el golf»: cada ronda sumas tantos puntos como kilómetros te separan del lugar real; sin marcador sumas 20.000. Gana quien **menos** puntos tenga (constante `PENALIZACION_SIN_MARCA` en `client/src/games/Ubicacion/geo.js` y en `server/routes/ubicacion.js`).
- Partidas de 5, 10 o 15 rondas, en local (de 2 a 10 jugadores, con señuelos) u online.
- Pantallas de partida en `Pantallas.jsx` (cabecera, foto, resultados, clasificación y podio); menús con los componentes comunes de `MenuJuego.jsx`.
- Lugares en `server/data/seeds/ubicacion/ubicacion.seed.js` y `ampliacion.seed.js` (`l(id, nombre, país, lat, lng, artículo_de_Wikipedia_en_inglés)`). La foto se toma del artículo de Wikipedia; si no tiene foto de Commons, el lugar se descarta en esa partida.

## Minijuego: La vida en colores (`Colores/`)
- Pantallas de partida en `Pantallas.jsx` (paleta, huecos de colores, solución, clasificación y podio); menús con los componentes comunes.
- Partidas de 10, 15 o 25 rondas y 45 s por respuesta. Online, el servidor cierra la ronda al acabar el tiempo y acepta selecciones incompletas.
- Elementos en `server/data/seeds/colores/parteN.js` (`{ id, item, colores: [...] }`, con los colores de la paleta: rojo, azul, amarillo, verde, naranja, morado, marron, blanco, negro, gris, rosa). `parte6.js` es la ampliación.

## Minijuego: Traiciones (`Traiciones/`)
- Solo online (un móvil por jugador, de 4 a 12). Menús y sala de espera con los componentes comunes; el anfitrión puede quitar a quien se haya quedado colgado en la sala.
- Pantallas de partida en `Vistas.jsx` (cabecera con la sala o la fase, mapa, tareas, armas del traidor, debate, votación, veredicto y final) y pruebas de cada sala en `Minijuegos.jsx`.
- La lógica vive en `server/traiciones/engine.js`; el cliente usa una copia idéntica (`node server/scripts/sync-traiciones.mjs` tras cambiarlo). Si una prueba se supera antes del tiempo mínimo de la sala, la tarea se remata sola al llegar a ese tiempo.
- Pruebas: `node server/scripts/traiciones-sim.mjs` (equilibrio) y `node server/scripts/traiciones-e2e.mjs [jugadores]` (salas online con bots y reloj acelerado).

## Minijuego: Afina ese oído (`Cancion/`)
- El fragmento de 30 s se busca en Deezer (intentando que coincida el artista) y se sirve desde `/api/cancion/audio/:clave`, para que el volumen progresivo funcione también en móviles. Si una canción no tiene fragmento, se elige otra.
- Online, el servidor lleva el reloj de la canción (`posicionMs`) y cada móvil se sincroniza; la canción se pausa al pulsar, se reanuda tras un fallo y la ronda termina sola al acabar el fragmento o el tiempo de respuesta (20 s).
- Puntos: de 10 a 3 según el segundo en que se pulsa; fallar resta 3. Partidas de 5, 10, 15 o 20 canciones.
- Canciones en `server/data/seeds/cancion/parteN.js` (`{ id, titulo, artista, alias }`). Al cargar se quitan duplicados y alias que solo sean el nombre del artista. `parte6.js` es la ampliación.
