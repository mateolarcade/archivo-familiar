# Archivo Familiar v4.0

Web app estatica tipo catalogo privado de streaming. Esta version usa Google Drive como unico sistema de permisos para los videos.

Flujo: catalogo, detalle del video, boton Intentar reproducir, iframe de Google Drive. Si la cuenta tiene permisos, Drive reproduce. Si no tiene permisos, Drive muestra su propio mensaje dentro del iframe.

Archivos principales: index.html, app.js, player.html, player.js, style.css y data/movies.js.

Para cargar videos reales, edita data/movies.js y reemplaza cada drivePreviewUrl por una URL con este formato:

https://drive.google.com/file/d/FILE_ID/preview

Importante: la app no solicita correo, no envia emails, no usa base de datos y no intenta leer el contenido interno del iframe. Todo el control de acceso depende de los permisos de la carpeta privada de Google Drive.
