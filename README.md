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

## Minijuego: ¿Con quién he jugado? (`Jugadores/`)
- Online o en un dispositivo, 2–15 jugadores, 5/10/15 parejas. Hay que decir un futbolista que coincidiera en algún **club** (no selección) con los dos, aunque fuera en clubes distintos.
- Respuestas (`server/data/seeds/jugadores/index.js`): las escritas a mano más las calculadas con la base de futbolistas de «Fútbol en raya» (clubes con años). Se descartan las que la base desmiente (con un año de margen por los fichajes de invierno).
- Pulsador y respuesta escrita: si está en la lista, acierto (+3); si no, decide el anfitrión (o el grupo). Fallo −1. Motor `server/jugadores/engine.js` (`npm run sync:jugadores`). Prueba: `node server/scripts/jugadores-sim.mjs`.

## Minijuego: El club de los cuatro (`CuatroClubes/`)
- Online o en un dispositivo, 2–10 jugadores, 3/5/8 rondas. Por turnos (pantalla «Turno de…» con «¡Listo!», 90 s) cada uno dice un futbolista y suma un punto por cada uno de los cuatro clubes en los que jugó (pleno = 4). No se repiten futbolistas en la ronda.
- Puntuación automática con la base de futbolistas (`server/data/seeds/cuatroclubes/index.js`); si no lo conocemos o pudo jugar en un club sin datos (Parma, Getafe…), el anfitrión marca los clubes. Al acabar la ronda se ven las mejores respuestas posibles.
- Motor `server/cuatroclubes/engine.js` (`npm run sync:cuatroclubes`). Prueba: `node server/scripts/cuatroclubes-sim.mjs`.

## Minijuego: Fútbol en raya (`FutbolGrid/`)
- Online (2–12, dos equipos: cada uno elige el suyo en la sala de espera) o en un dispositivo (jugadores alternos en Azul ✕ y Rojo ◯).
- El equipo en turno elige casilla y tiene 90 s para un futbolista que cumpla fila y columna; acierte o falle, turno del rival. No se repiten futbolistas. Tres en raya gana; si no queda ninguna casilla posible, empate.
- Respuestas: base de ~800 futbolistas (`jugadores1-4.js`: clubes con años, selección, títulos) y entrenadores con sus etapas (`clubes.js`); `respuestas.js` calcula qué futbolistas cumplen cada casilla y se suman a las escritas a mano (las que la base desmiente por selección, club o entrenador se descartan). Los 40 tableros son jugables; algunas categorías imposibles se cambiaron en `index.js` (CAMBIOS).
- Rendirse: termina sin ganador y desvela, por cada casilla libre, futbolistas válidos (sin usar) y cuántos había.
- Respuestas tolerantes (apellido, nombre conocido, alias como «cr7» o «kun», tildes, erratas) y nunca se envían al cliente online.
- Motor `server/futbolgrid/engine.js` (`npm run sync:futbolgrid`). Prueba: `node server/scripts/futbolgrid-sim.mjs`.

## Minijuego: FrankensFootball (`FootballSplit/`)
- Online o en un dispositivo, 2–12 jugadores, 5/10/15 caras. Cada cara mezcla pelo, ojos y barbilla de tres futbolistas (sin repetir en la partida).
- Cada vez que cambia el turno sale «Turno de…» con «¡Listo!» (ahí empieza el reloj de 60 s). Tocas un trozo y escribes de quién es; acierto +5 (con pista +2) y sigues; fallo o pase, turno del siguiente. La ronda acaba con la cara completa o tras una vuelta: primero pantalla de soluciones y después la de puntuaciones con «Nueva ronda».
- Los nombres ya no se envían al cliente hasta acertarlos. Motor `server/footballsplit/engine.js` (`npm run sync:footballsplit`). Prueba: `node server/scripts/footballsplit-sim.mjs`.

## Minijuego: ¡Qué jugadón! (`Jugadas/`)
- Motor en `server/lib/jugadasEngine.js` (sin cambios de reglas). Pantallas nuevas (`JugadasPartida.jsx`), sala de espera común con conexión y «Quitar».

## Minijuego: Modo carrera (`Trayectoria/`)
- Online o en un único dispositivo, de 2 a 15 jugadores; 5, 10 o 15 futbolistas y dificultad mixta, fácil, media o difícil.
- Los clubes salen uno a uno cada 6 s (sin nacionalidad ni número total de clubes a la vista). Quien lo sepa pulsa «¡Lo sé!» (el reloj se para) y tiene 20 s para escribirlo. Puntos: 1 + clubes aún ocultos (máx. 5, mín. 2). Tras el último club quedan 15 s; en los retos difíciles se puede pulsar «Desvelar pista» (+15 s, acertar vale 1). Fallar resta 1 y deja fuera de esa ronda.
- Escudos: imagen conocida (miniatura PNG de Wikipedia, para que ningún SVG se salga de su caja) y, si no hay o no carga, escudo dibujado con los colores y siglas del club (`server/data/seeds/trayectoria/escudos.js`, los 336 clubes).
- Motor en `server/trayectoria/engine.js` (copia con `npm run sync:trayectoria`). Prueba: `node server/scripts/trayectoria-sim.mjs`. En local los futbolistas se cargan en un trozo aparte.

## Minijuego: Bingoball (`Bingoball/`)
- Solo online, de 2 a 15 jugadores. En la sala de espera solo se ven los jugadores; al pulsar «¡Jugar!» el anfitrión elige el tipo de bingo (Selecciones, Champions, LaLiga, Grandes Ligas o Leyendas). Cartón de 12 categorías (4 × 3); cada 15 s sale un futbolista (cromo con equipación propia) y se marca la casilla en la que encaja.
- Acierto +2, fallo −1 (y sin marcar hasta el siguiente), bingo +20 (termina la partida).
- Línea opcional: con una fila completa sale «Cantar línea»; el bingo se pausa para todos mientras el jugador confirma (20 s). Si la canta, +5 y la fila cambia por 3 categorías nuevas que no tenga en el cartón. Solo una línea por bingo (la primera); después el botón desaparece para todos.
- Sorteo ponderado: peso = casillas abiertas (de todos) en las que encaja × factor de recencia (bajo si acaba de salir, alto si hace mucho o nunca ha salido); 0 si no sirve a nadie.
- Motor en `server/bingoball/engine.js` (copia con `npm run sync:bingoball`). Prueba: `node server/scripts/bingoball-sim.mjs`.

## Minijuego: ¡Descarta y Elimina! (`Descarte/`)
- De 3 a 12 jugadores, online o en un único dispositivo; partidas de 3, 5 o 7 tableros con 26 letras (sin Ñ; 1, 2 o 3 puntos según lo difícil que sea la letra).
- Turno del retador → «listo» → elige rival (alguien que no haya jugado en esta vuelta) y una de tres categorías → turno del retado → «listo» → ve la categoría y tiene 30 s para decir una palabra que empiece por una letra del tablero: acierto (la letra se elimina y suma), fallo o pasar turno (cuenta como fallo). El tablero acaba sin letras o cuando todos fallan seguidos.
- Online el retado toca la letra de su palabra y el anfitrión decide si es correcta (si el retado es el anfitrión, decide el retador).
- Motor en `server/descarte/engine.js` con copia en el cliente (`npm run sync:descarte`). Prueba: `node server/scripts/descarte-sim.mjs`.

## Minijuego: 6 Pistas (`Pistas/`)
- Colores grises del juego (antes salían morados) y pulsador rediseñado en el modo un dispositivo.
- Online: ids de jugador únicos aunque alguien salga, nombre obligatorio, solo el anfitrión revela la solución, sala de espera común (quitar jugadores, estado de conexión) y reconexión si falla la red.

## Minijuego: El Golpe (`Golpe/`)
- Solo online, de 3 a 8 jugadores, 3 o 5 misiones (museo, banco, prisión y central eléctrica). Cada misión tiene 3 pasos con 4 opciones; en secreto cada opción es segura, peligrosa (funciona, pero arriesgada) o imposible (el plan fracasa).
- Fases: encargo (pistas privadas y objetivo secreto) → plan (una opción por paso) → debate con chat → votación del mejor plan (no el tuyo) y acusación del traidor → resolución (se ejecuta el más votado y se revela todo).
- Objetivos secretos: traidor (uno por misión), ambicioso, oportunista, manipulador e infiltrado.
- Puntos: +3 plan viable, +2 si alguien vota tu plan, +3 objetivo cumplido, +2 por acertar al traidor, +2 al traidor que sabotea sin que la mitad de los demás le acuse.
- Motor en `server/golpe/engine.js` (copia en el cliente con `npm run sync:golpe`). Pruebas: `node server/scripts/golpe-sim.mjs` y `node server/scripts/golpe-e2e.mjs [jugadores]`. Portada provisional.

## Minijuego: Lleva la cuenta (`Cuentas/`)
- Solo online, de 2 a 8 jugadores. Cada uno recibe unos números del 1 al 100 (secretos) y hay que colocarlos en orden ascendente sin hablar. Gana quien se queda antes sin números (puntos de sala 3/2/1).
- Turno: soltar un número, usar una carta de acción al azar (3 por jugador en toda la partida) o pasar. Soltar uno que no toca: −1 vida (el número vuelve a la mano). Pasar o usar una acción dos turnos seguidos teniendo el número que tocaba: −1 vida. Con 2 vidas perdidas quedas eliminado.
- Cartas de acción: Chivatazo, Radar, Escudo, Encasquetar, Quemar, Espía, Congelar, Ruleta, Carga pesada y Apagón.
- Motor en `server/cuentas/engine.js` con copia idéntica en el cliente (`npm run sync:cuentas`). Pruebas: `node server/scripts/cuentas-sim.mjs` y `node server/scripts/cuentas-e2e.mjs [jugadores]`.

## Minijuego: Suma Cero (`SumaCero/`)
- De 2 a 6 jugadores. Cada uno empieza con 5 cartas de −10 a +10: hay que conseguir que la mano sume 0 (o lo más cerca posible).
- Turno: robar (del mazo o la de arriba del descarte) y después descartar una carta o usar una especial. En lugar de robar puedes plantarte: cada rival juega un último turno… y puede fastidiarte.
- Especiales: Mano rápida (robar al azar), Purga (descarta su carta más alta), Cambio de manos, Doble, Espejo (cambia signos), Congelar y Avalancha (todos los demás roban 2).
- Puntos por ronda (menos es mejor): |suma| + 2 por especial sin usar, −3 si la suma es 0 exacto y +5 si te plantas y no tienes la mejor mano. Partidas de 3, 5 o 7 rondas.
- Motor en `server/sumacero/engine.js` con copia idéntica en el cliente (`npm run sync:sumacero`). Pruebas: `node server/scripts/sumacero-sim.mjs` y `node server/scripts/sumacero-e2e.mjs [jugadores]`. La portada (`client/public/covers/sumacero.webp`) es provisional.

## Minijuego: Colecciona con cabeza (`Coleccion/`)
- Cada jugador (2 a 6) recibe un encargo secreto: la colección que debe reunir en su vitrina (pleno, doble pareja, trío y uno, familia o arcoíris de 5 palos). Varios pueden ir a por lo mismo sin saberlo. Gana quien cumpla su encargo (en cualquier momento, aunque sea por culpa de otro).
- Turno: robar 2 y hacer 2 jugadas (poner carta en la vitrina, devolverla a la mano o jugar acción). Mano máx. 7, vitrina máx. 6. 🌟 Comodines valen por cualquier palo.
- 14 cartas de acción: Mapache, Bomba, Trueque, Regalo envenenado, Congelar, Espía, Cambiazo de encargo, Nuevo encargo, Imán, Doble o nada, Rebuscar, Tornado, Turbo y Escudo (se activa solo).
- Motor en `server/coleccion/engine.js` con copia idéntica en el cliente (`npm run sync:coleccion`). Pruebas: `node server/scripts/coleccion-sim.mjs` y `node server/scripts/coleccion-e2e.mjs [jugadores]`.

## Minijuego: La Hipótesis Ganadora (`Hipotesis/`)
- Cada ronda hay una verdad absoluta oculta (una fila de casillas) y cada jugador ve solo 2 o 3. Todos formulan en secreto una hipótesis, cierta o de farol; después se desvelan y cada uno decide en cuáles confía (✅/❌, y una con ⭐ «¡Seguro!» que vale doble). Al final se revela la verdad hipótesis a hipótesis.
- Escenarios (cambian cada ronda, con sus propios tipos de hipótesis): laboratorio, baraja, barrio y caja fuerte. Eventos sorpresa: ronda doble, rumor, topo, ronda sincera, juicio a ciegas, chismorreo y relámpago.
- Puntos: acertar el juicio +1 (⭐ +2 / −1); autor +1 por creyente si era cierta, +2 por creyente y −1 por quien le pilla si era farol; +1 a la hipótesis ganadora (la más creída).
- Motor en `server/hipotesis/engine.js` con copia idéntica en el cliente (`npm run sync:hipotesis`). Pruebas: `node server/scripts/hipotesis-sim.mjs` y `node server/scripts/hipotesis-e2e.mjs [jugadores]`.

## Minijuego: Fundadores (`Fundadores/`)
- Cada jugador (2 a 9) levanta su propio pueblo. Empieza con 2 monedas y 4 planos.
- Cada ronda se retiran al azar oficios hasta que quedan tantos como jugadores (los retirados son públicos); por orden, empezando por quien tiene el sello, cada uno elige uno en secreto. Los 10 oficios se llaman por número y quien tenga el llamado juega su turno: cobrar 2 monedas o robar 2 planos y quedarse 1 → habilidad del oficio → construir.
- Oficios: Saboteadora, Cobrador, Cartógrafa, Heraldo (sello/prioridad), Guardiana, Mercader, Maestra de obras, Capitán (derribar), Prestamista y Alcaldesa. Edificios de 5 tipos; los Singulares dan ventajas.
- Termina la ronda en la que alguien completa el pueblo (6, 7 u 8 edificios). Puntos: edificios + variedad + completar + monedas sobrantes + medallas + ventajas.
- Motor en `server/fundadores/engine.js` con copia idéntica en el cliente (`npm run sync:fundadores`). Pruebas: `node server/scripts/fundadores-sim.mjs` y `node server/scripts/fundadores-e2e.mjs [jugadores]`.

## Minijuego: Furbo! (`Furbo/`)
- Menús, sala de espera y selector de jugadores con los componentes comunes; partida en `FurboPartida.jsx` (cabecera con fase, ronda, reloj y marcador, que muestra lo sumado en cada ronda) para los dos modos.
- Lógica en `server/lib/furboEngine.js`. En un solo dispositivo no hay cuenta atrás (el móvil cambia de manos), salvo en la Prórroga. Si alguien abandona online, la ronda que le esperaba se resuelve al momento.
- Preguntas en `server/data/seeds/furbo/bancos/` (`base.js`, `manual.js` y las generadas desde `hechos.js`), unidas en `preguntas.js`.

## Minijuego: Traiciones (`Traiciones/`)
- Solo online (un móvil por jugador, de 4 a 12). Menús y sala de espera con los componentes comunes; el anfitrión puede quitar a quien se haya quedado colgado en la sala.
- Pantallas de partida en `Vistas.jsx` (cabecera con la sala o la fase, mapa, tareas, armas del traidor, debate, votación, veredicto y final) y pruebas de cada sala en `Minijuegos.jsx`.
- La lógica vive en `server/traiciones/engine.js`; el cliente usa una copia idéntica (`node server/scripts/sync-traiciones.mjs` tras cambiarlo). Si una prueba se supera antes del tiempo mínimo de la sala, la tarea se remata sola al llegar a ese tiempo.
- Pruebas: `node server/scripts/traiciones-sim.mjs` (equilibrio) y `node server/scripts/traiciones-e2e.mjs [jugadores]` (salas online con bots y reloj acelerado).

## Juegos de pulsador: El paparazzi, Luces, Cámara... ¡Música! y Frases Célebres (`Pulsador/`)
Los tres comparten motor (`server/pulsador/engine.js`, copiado al cliente con `npm run sync:pulsador`), salas online (`server/lib/salasJuego.js`) y pantallas (`client/src/games/Pulsador/`); `juegos.js` tiene los textos de cada uno y `REGLAS` en el motor, sus tiempos y puntos. Cada ronda empieza con una cuenta atrás de 3 s; el reloj corre y quien pulsa lo para y tiene unos segundos para responder. Online cada uno tiene su pulsador (los demás ven lo que escribe); en un dispositivo hay un pulsador común y se elige quién ha pulsado. Simulación: `node scripts/pulsador-sim.mjs`.
- **El paparazzi** (`/api/rasgos`): recorte de la foto de un famoso (el servidor recorta; la foto completa solo se sirve al resolver la ronda). 60 s; acertar suma los segundos que quedaban y fallar los resta. Para probar sin red: `RASGOS_IMAGEN_PRUEBA=/ruta/a/una.jpg`.
- **Luces, Cámara... ¡Música!** (`/api/adivina`): canciones (modernas, antiguas o de todo) o películas, con tres pistas que se destapan solas cada 20 s (10/5/3 puntos). La tercera pista de las canciones es el fragmento de Deezer (se pide al momento por `/audio`, porque sus URLs caducan); si no hay audio, se muestra el título con huecos.
- **Frases Célebres** (`/api/frasescelebres`): frase y cuatro autores; quien pulsa elige (+3 / −1).

## Entre dos aguas, Del 1 al 10 y Logo Mania (`MasMenos/`, `UnoADiez/`, `Logos/`)
Cada uno tiene su motor puro (`server/masmenos`, `server/unoadiez`, `server/logos`, copiados al cliente con `npm run sync:masmenos`, `sync:unoadiez` y `sync:logos-motor`) y comparte con los juegos de pulsador las salas online (`server/lib/salasJuego.js`) y las pantallas (`client/src/games/Pulsador/`: cabecera, «Turno de…», final, sala de espera). Simulaciones: `node scripts/masmenos-sim.mjs`, `unoadiez-sim.mjs`, `logos-sim.mjs`.
- **Entre dos aguas** (`/api/masmenos`): por turnos, dos elementos con la cifra oculta; elige el mayor (30 s) y encadena la racha. Nunca se enfrentan dos cifras a menos de un 3 %. Datos en `server/data/seeds/masmenos/` (población, historia, taquilla, canciones, estadios, puntos de fusión, PIB, tecnología, animales y monumentos), con valores reales redondeados.
- **Del 1 al 10** (`/api/unoadiez`): el que da la pista ve el número y la categoría y pone un ejemplo (online lo escribe; en un dispositivo lo dice en voz alta tras pasarse el móvil). Puntuación de golf: gana quien menos tiene.
- **Logo Mania** (`/api/logos`): online todos responden a la vez; en un dispositivo, por turnos con su propio reloj. ±segundos restantes, pasar = 0. La imagen online se pide por sala y ronda para no delatar la marca.

## Minijuego: Mus (`Mus/`)
Mus clásico por parejas con la baraja española de 40, a 8 reyes (treses = reyes, doses = ases): mus o no hay mus, descartes, lances de grande, chica, pares y juego (o punto), envites, reenvites y órdago, y conteo al final de la mano. Partidas a 30 o 40 puntos, a 1 juego o al mejor de 3. Motor en `server/mus/engine.js` (copia en el cliente con `npm run sync:mus`), con bots que deciden simulando manos rivales. Online (`/api/mus`, salas de `lib/salasJuego.js`): de 2 a 4 personas, el anfitrión elige pareja y los huecos los ocupa la máquina; quien abandona pasa a jugar como bot. Contra la máquina: tú y tu pareja 🤖 contra dos 🤖. Simulación: `node scripts/mus-sim.mjs`. Portada provisional.

## Minijuego: Los Siete Reinos (`Reinos/`)
Estrategia de 2 a 7 reinos en un mapa de 37 hexágonos (capitales, granjas, minas, ciudades y 7 tronos). Cada ronda: ingresos y manutención (2 soldados comen 1 de alimento), dos órdenes secretas por reino (conquistar, entrenar, fortificar, comerciar o negociar alianzas e intercambios), respuestas a las propuestas y resolución simultánea: pactos → mercado → reclutas y murallas → movimientos y batallas (sin azar: soldados + 2 por nivel de muralla al defender; los aliados suman). Atacar a un aliado es traición (rompe la alianza y resta 2). Puntos: trono 3, territorio 1, objetivo secreto 5 (dos por reino); dominar 4 tronos gana en el acto. Motor en `server/reinos/engine.js` (`npm run sync:reinos`), online en `/api/reinos`; en un dispositivo, el móvil pasa de reino en reino. Simulación: `node scripts/reinos-sim.mjs`. Portada provisional.

## Minijuego: El Invento del Siglo (`Invento/`)
Cada ronda, cada jugador recibe un objeto, un problema y una característica absurda (puede cambiar una carta) e inventa un producto con nombre y descripción. Luego se vota en anónimo, por letra, en tres categorías (lo compraría, el más absurdo, triunfará): 1 punto por voto y +2 por ganar una categoría. Motor en `server/invento/engine.js` (`npm run sync:invento`), cartas en `server/data/seeds/invento/`, online en `/api/invento` (de 3 a 12, con tiempo para inventar); en un dispositivo, el móvil pasa para inventar y votar en secreto. Simulación: `node scripts/invento-sim.mjs`.

## Minijuego: Director Deportivo (`Director/`)
Cada club elige formación y, en varios mercados, puja en secreto por futbolistas reales (197, temporada 2025/26: posición, edad, media y potencial aproximados; el precio sale de media, edad y potencial). Gana la puja más alta. Luego se elige táctica y se simula una liga a doble vuelta (completada con clubes de la máquina hasta 6), donde cuentan las líneas, jugar en tu posición, la química (mismo club o país), la edad (los jóvenes crecen, los veteranos bajan), el banquillo y la táctica frente a la del rival. Motor en `server/director/engine.js` (`npm run sync:director`), datos en `server/data/seeds/director/`, online en `/api/director`. Simulación: `node scripts/director-sim.mjs`.

## Minijuego: El Laberinto (`Laberinto/`)

Dos juegos bajo la misma portada: al entrar se elige uno (`Laberinto.jsx`) y empieza el ciclo habitual de ese juego (online o en un dispositivo) con las pantallas comunes de `Pulsador/`.

- **El Minotauro** (`Minotauro.jsx`, motor `server/minotauro/engine.js`, `npm run sync:minotauro`, ruta `/api/minotauro`, de 3 a 8). Laberinto de 11×11 con atajos y niebla (cada uno ve a 2 casillas por los pasillos y recuerda lo visto). A uno le toca en secreto ser el Minotauro (conoce el laberinto pero no ve a nadie lejos). Todos trazan a la vez su recorrido (exploradores 2 pasos o 3 corriendo, que hace ruido; Minotauro 3) y se mueven paso a paso: si coinciden o se cruzan, el explorador queda atrapado y pasa a ser ayudante (también caza). Las 3 llaves brillan para los exploradores; con todas se abren las 2 salidas. Ganan los exploradores si escapa un tercio (mínimo uno); si no, el Minotauro y sus ayudantes. Trampas (aturden un turno), antorchas (más visión) y ruidos (correr, abrir candados, pasos cercanos del Minotauro). Simulación con bots: `node scripts/minotauro-sim.mjs`.
- **Constructores y corredores** (`Constructores.jsx`, motor `server/constructores/engine.js`, `npm run sync:constructores`, ruta `/api/constructores`, de 2 a 8). Cada ronda, cada jugador construye en secreto un laberinto de 9×9 para un rival (26 muros, 6 hielos, 4 flechas y 2 portales; la pantalla comprueba que tenga salida) y luego todos corren a la vez el suyo, con niebla opcional, deslizando el dedo o con flechas. El servidor repite los movimientos para validar la llegada y mide el tiempo. Puntos por puestos (5, 3, 2, 1) para el corredor más rápido y para el constructor cuyo laberinto más tarda. Simulación: `node scripts/constructores-sim.mjs`.

## Bancos de contenido (ampliados)

Cada juego guarda su contenido en ficheros de datos; las ampliaciones van en ficheros `extra*` que se suman sin repetir:

| Juego | Registros |
|---|---|
| GeoQuiz | 1160 preguntas (100+ en cada una de sus 10 categorías) · `server/data/seeds/geoquiz/extra/` |
| Verdadero o Falso | 222 afirmaciones |
| ¿Qué sobra en la pecera? | 201 retos (`retosExtra*.js`) |
| Trinchera 1914 | 201 cartas (`cartasExtra*.js`) |
| Excusas a domicilio | 46 sujetos × 46 acciones × 46 objetos y 44 preguntas del jefe |
| El Invento del Siglo | 229 objetos, 204 problemas y 200 rasgos |
| Director Deportivo | 244 futbolistas |
| La Hemeroteca | 209 titulares (`extra.js`) |
| Acta del Partido | 117 partidos (`extra1.js`, `extra2.js`) |
| El Once Fantasma | 17 finales con sus dos onces |
| El Dato que Sobra | 201 futbolistas (`extra1.js`, `extra2.js`) |
| La Pareja Perfecta | 323 parejas en 9 categorías |
| El Tablero de Puntos | 2559 preguntas en 25 categorías (≥20 por nivel de 100 a 500) · `server/data/seeds/tablero/cats/` y `extra/` |
| Una Pieza Más | 30 siluetas |

Las portadas de los juegos nuevos se generan con `node server/scripts/portadas.cjs [ids]`.

## Minijuego: Mus Avanzado (`MusAvanzado/`)

El mus con 5 cartas y seis categorías, individual (4-8) o por parejas (4 o 6). Baraja de 40 a 8 reyes (treses = reyes, doses = ases). Gana quien llega antes a 20, 30 o 40 puntos, o quien gana un órdago querido.

1. El anfitrión configura modo, puntos, categorías (grande, chica, pares, escalera, color y juego; mínimo 3) y cartas especiales opcionales (comodines, espejos, dobles, bombas, mutantes, ases y reyes invertidos).
2. Cada **mano** reparte 5 cartas. Antes de cada categoría cada uno tira de 0 a 5 cartas y roba otras tantas; lo que se queda sigue en la siguiente categoría.
3. Se **habla como en el mus**: paso, envido (cualquier cantidad) u órdago; los demás quieren, suben, no quieren (se retiran de esa categoría) u órdago. Tras una subida vuelven a hablar todos. Si nadie quiere, el que envidó cobra el deje en el acto.
4. **Conteo** al final de la mano: por categoría se enseñan las cartas (como estaban al cerrarse) de los que siguieron, gana la mejor según el mus (empate: el más cercano a la mano) y se cobra lo querido, 1 en paso (grande y chica) y los extras de cada jugador del bando ganador: pares 1-5, escalera de 4/5 → 2/5, color de 4/5 → 1/5, juego 31 → 3, otro juego → 2, ganar a punto → 1. Un órdago querido se resuelve en el momento y da la partida.

Motor en `server/musavanzado/engine.js` (`evaluar` prueba comodines, espejos y dobles por fuerza bruta; `npm run sync:musavanzado`); simulación en `server/scripts/musavanzado-sim.mjs`; ruta `/api/musavanzado`. En un dispositivo se pasa el móvil para cambiar cartas y en cada turno de habla.

## Minijuego: El Dato que Sobra (`DatoSobra/`)

Cuatro afirmaciones sobre un futbolista, tres ciertas y una falsa (34 futbolistas en `server/data/seeds/datosobra/futbolistas.js`, cada uno con la explicación de la mentira). Por turnos, un jugador señala la mentira (+3 si acierta); después los demás deciden en secreto si aceptan o desafían señalando otra: ganar un desafío da +4 y perderlo resta 1 (y suma 1 a quien aguantó). Motor en `server/datosobra/engine.js` (`npm run sync:datosobra`), simulación en `server/scripts/datosobra-sim.mjs`; ruta `/api/datosobra`.

## Minijuego: La Pareja Perfecta (`Pareja/`)

Sale un elemento (actor, inventor, país, personaje, cantante o pintor) y cuatro posibles parejas. Usa el motor de pulsador (reglas `pareja`, respuesta por opciones) con un `multiplicador` por ítem: el primer tercio de la partida es fácil (×1), luego medio (×2) y al final difícil (×3). Datos en `server/data/seeds/pareja/parejas.js` (los distractores salen de la misma categoría); ruta `/api/pareja`.

## Minijuego: El Tablero de Puntos (`Tablero/`)

25 categorías (cine, historia, ciencia, música, deporte, geografía, fútbol, literatura, arte, gastronomía, animales, tecnología, videojuegos, series y TV, mitología, lengua, espacio, cuerpo humano, España, cómics, inventos, capitales y banderas, matemáticas, naturaleza y monumentos), cada una con al menos 100 preguntas y 20 por nivel. Al empezar, por turnos (empieza alguien al azar) cada jugador elige una categoría libre hasta completar las del tablero (3 a 6). Casillas de 100, 200, 300, 400 y 500; el primer turno es al azar y luego en orden. Acertar suma su valor y fallar lo resta, y entonces hay rebote solo para el siguiente jugador (sin la opción fallada): si acierta suma, si falla no resta. Una casilla oculta (nunca de 100) vale el doble. Preguntas en `server/data/seeds/tablero/preguntas.js` (clásicas), `cats/<id>.js` (nuevas), `extra/nivel400.js` y `extra/relleno.js`; motor en `server/tablero/engine.js` (`npm run sync:tablero`), simulación en `server/scripts/tablero-sim.mjs`; ruta `/api/tablero`.

## Minijuego: La Hemeroteca (`Hemeroteca/`)

Titulares históricos de periódico a los que les faltan palabras. Usa el motor de pulsador (`server/pulsador/engine.js`, reglas `hemeroteca`): las pistas se destapan cada 15 s (titular con huecos, época, pista con el año e iniciales) y acertar da 10, 7, 5 o 3 puntos según las pistas vistas. Las respuestas aceptan grupos de palabras clave (`coincideClaves`). Datos en `server/data/seeds/hemeroteca/titulares.js`; ruta `/api/hemeroteca`.

## Minijuego: Acta del Partido (`Acta/`)

Un partido histórico contado con su acta incompleta (cinco datos de más vagos a más reveladores). Motor de pulsador con reglas `acta`: 10, 8, 6, 4 o 2 puntos según los datos vistos. Vale escribir los dos equipos o el nombre del partido. Datos en `server/data/seeds/acta/partidos.js`; ruta `/api/acta`.

## Minijuego: El Once Fantasma (`OnceFantasma/`)

14 finales históricas con sus DOS onces titulares (`server/data/seeds/oncefantasma/onces.js`; en cada línea los jugadores van de izquierda a derecha, vistos desde su portería). Por turnos, a cada jugador le toca reconstruir un once (los dos onces de un partido van a jugadores seguidos): solo él adivina, cada acierto destapa una pista de otro compañero y el reloj destapa más (10/7/5/3 puntos según las pistas; +5 si completa su once). Si se planta o se le acaba el tiempo con huecos, hay REBOTE para los demás (5/4/3/2). Motor en `server/oncefantasma/engine.js` (`npm run sync:oncefantasma`), simulación en `server/scripts/oncefantasma-sim.mjs`; ruta `/api/oncefantasma`. En un dispositivo hay pantalla de turno antes de cada once y antes del rebote.

## Minijuego: Una Pieza Más (`UnaPieza/`)

Tablero 8×8 con una silueta (casa, cohete, pez…) que se rellena por turnos con piezas de 1 a 5 casillas que se pueden girar y voltear. Puntúan las casillas, cerrar filas/columnas (+2), el objetivo secreto de cada figura (+4), la última pieza (+5) y bloquear al siguiente (+2, solo si antes podía colocar). Quien no puede colocar nada rellena una casilla suelta, así que toda figura se completa. Motor en `server/unapieza/engine.js` (`npm run sync:unapieza`), simulación en `server/scripts/unapieza-sim.mjs`; ruta `/api/unapieza`.

## Minijuego: Afina ese oído (`Cancion/`)
- El fragmento de 30 s se busca en Deezer (intentando que coincida el artista) y se sirve desde `/api/cancion/audio/:clave`, para que el volumen progresivo funcione también en móviles. Si una canción no tiene fragmento, se elige otra.
- Online, el servidor lleva el reloj de la canción (`posicionMs`) y cada móvil se sincroniza; la canción se pausa al pulsar, se reanuda tras un fallo y la ronda termina sola al acabar el fragmento o el tiempo de respuesta (20 s).
- Puntos: de 10 a 3 según el segundo en que se pulsa; fallar resta 3. Partidas de 5, 10, 15 o 20 canciones.
- Canciones en `server/data/seeds/cancion/parteN.js` (`{ id, titulo, artista, alias }`). Al cargar se quitan duplicados y alias que solo sean el nombre del artista. `parte6.js` es la ampliación.
