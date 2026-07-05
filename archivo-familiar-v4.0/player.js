(function () {
  const playerContent = document.getElementById("player-content");
  const movies = Array.isArray(window.MOVIES) ? window.MOVIES : [];
  const params = new URLSearchParams(window.location.search);
  const movie = movies.find((item) => item.id === params.get("id"));

  function getDrivePreviewUrl(item) { return item.drivePreviewUrl || item.videoUrl || ""; }
  function getDriveViewUrl(item) { return getDrivePreviewUrl(item).replace(/\/preview(\?.*)?$/, "/view"); }

  function renderNotFound() {
    document.title = "Contenido no encontrado | Archivo Familiar";
    playerContent.innerHTML = "<section class=\"not-found\"><p class=\"eyebrow\">Contenido no disponible</p><h1>No encontramos ese video</h1><p>El enlace puede estar incompleto o el ID no existe en el catalogo.</p><a class=\"primary-link\" href=\"index.html\">Volver al catalogo</a></section>";
  }

  function renderDetail(item) {
    const category = item.category || item.type || "Video familiar";
    const people = Array.isArray(item.people) ? item.people.join(", ") : item.people || "No especificado";
    document.title = item.title + " | Archivo Familiar";
    playerContent.innerHTML = "<section class=\"detail-layout\"><aside class=\"detail-poster\"><img src=\"" + escapeAttribute(item.poster) + "\" alt=\"Portada de " + escapeAttribute(item.title) + "\"></aside><article class=\"detail-panel\"><p class=\"eyebrow\">" + escapeHtml(category) + "</p><h1>" + escapeHtml(item.title) + "</h1><p class=\"mobile-location\"><span>Lugar</span><strong>" + escapeHtml(item.location || "No especificado") + "</strong></p><div class=\"detail-meta-grid\"><div class=\"detail-meta-year\"><span>A&ntilde;o</span><strong>" + escapeHtml(item.year) + "</strong></div><div class=\"detail-meta-location\"><span>Lugar</span><strong>" + escapeHtml(item.location || "No especificado") + "</strong></div><div class=\"detail-meta-duration\"><span>Duracion</span><strong>" + escapeHtml(item.duration) + "</strong></div><div class=\"detail-meta-category\"><span>Categoria</span><strong>" + escapeHtml(category) + "</strong></div></div><div class=\"people-block description-block\"><span>Descripcion</span><p>" + escapeHtml(item.description) + "</p></div><p class=\"detail-description\"><strong>Personas que aparecen:</strong> " + escapeHtml(people) + "</p><p class=\"mobile-detail-description\">" + escapeHtml(item.description) + "</p><button id=\"play-button\" class=\"primary-link play-button\" type=\"button\">Reproducir en celular</button></article></section><section class=\"watch-layout\" aria-label=\"Reproductor de video\"><div id=\"video-frame\" class=\"video-frame\"></div>" + renderAccessCard() + "</section>";
    document.getElementById("play-button").addEventListener("click", () => window.open(getDriveViewUrl(item), "_blank", "noopener"));
    loadDrivePlayer(item);
  }

  function loadDrivePlayer(item) {
    const frame = document.getElementById("video-frame");
    const src = getDrivePreviewUrl(item);
    frame.classList.remove("video-frame-placeholder");
    frame.innerHTML = "<iframe src=\"" + escapeAttribute(src) + "\" title=\"" + escapeAttribute(item.title) + "\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>";
  }

  function renderAccessCard() {
    return "<article class=\"access-card\" aria-label=\"Informacion de acceso al Archivo Familiar\"><div class=\"access-icon\" aria-hidden=\"true\">&#128274;</div><div><h2>Acceso al Archivo Familiar</h2><p>Los videos del Archivo Familiar se encuentran protegidos mediante los permisos de Google Drive.</p><p>Si el video no se reproduce o aparece un mensaje indicando que no tenes acceso, significa que tu cuenta de Google todavia no fue autorizada para visualizar la coleccion.</p><p>Cuando el administrador comparta la carpeta con tu cuenta de Google, automaticamente podras acceder a todos los videos disponibles sin necesidad de solicitar permisos nuevamente para cada uno.</p></div></article>";
  }

  function escapeHtml(value) { return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
  function escapeAttribute(value) { return escapeHtml(value).replaceAll("\x60", "&#096;"); }

  if (!movie) renderNotFound(); else renderDetail(movie);
})();
