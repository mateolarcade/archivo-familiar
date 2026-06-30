(function () {
  const playerContent = document.getElementById("player-content");
  const movies = Array.isArray(window.MOVIES) ? window.MOVIES : [];
  const params = new URLSearchParams(window.location.search);
  const movie = movies.find((item) => item.id === params.get("id"));
  function renderNotFound() { document.title = "Contenido no encontrado | Archivo Familiar"; playerContent.innerHTML = `<section class="not-found"><p class="eyebrow">Contenido no disponible</p><h1>No encontramos ese video</h1><p>El enlace puede estar incompleto o el ID no existe en el catalogo.</p><a class="primary-link" href="index.html?view=catalog">Volver al catalogo</a></section>`; }
  function renderPlayer(item) { document.title = `${item.title} | Archivo Familiar`; playerContent.innerHTML = `<section class="watch-layout"><div class="video-frame"><iframe src="${escapeAttribute(item.videoUrl)}" title="${escapeAttribute(item.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div><div class="watch-info"><p class="eyebrow">${escapeHtml(item.type)}</p><h1>${escapeHtml(item.title)}</h1><p>${escapeHtml(item.description)}</p><div class="meta-row"><span>${escapeHtml(item.rating)}</span><span>${escapeHtml(item.duration)}</span><span>${escapeHtml(item.year)}</span></div></div></section>`; }
  function escapeHtml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
  function escapeAttribute(value) { return escapeHtml(value).replaceAll("\x60", "&#096;"); }
  if (!movie) renderNotFound(); else renderPlayer(movie);
})();
