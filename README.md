# Archivo Familiar

Web app estatica tipo catalogo de streaming, lista para subir a GitHub y desplegar en Vercel.

Contraseña inicial: `familia2026`. Cambiala en `data/config.js`.

Para agregar videos, edita `data/movies.js`. Cada item usa `id`, `title`, `description`, `type`, `duration`, `year`, `rating`, `poster` y `videoUrl`.

El reproductor abre contenido con `player.html?id=ID_DEL_VIDEO` y muestra un fallback si el ID no existe.

Nota: como es un sitio 100% estatico, la contraseña es una barrera visual/simple, no seguridad real de backend.
