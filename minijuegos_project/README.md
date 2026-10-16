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
