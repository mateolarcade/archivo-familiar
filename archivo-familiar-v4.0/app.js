(function () {
  const introScreen = document.getElementById("intro-screen");
  const catalogScreen = document.getElementById("catalog-screen");
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const movieGrid = document.getElementById("movie-grid");
  const emptyState = document.getElementById("empty-state");
  const resultsCount = document.getElementById("results-count");
  const featuredButton = document.getElementById("featured-button");
  const movies = Array.isArray(window.MOVIES) ? window.MOVIES : [];
  function shouldSkipIntro() { return new URLSearchParams(window.location.search).get("view") === "catalog"; }
  function showCatalog() {
    introScreen.classList.add("is-hidden");
    catalogScreen.classList.remove("is-hidden");
    renderMovies(movies);
    if (movies[0] && featuredButton) featuredButton.href = "player.html?id=" + encodeURIComponent(movies[0].id);
  }
  function startExperience() { if (shouldSkipIntro()) { showCatalog(); return; } window.setTimeout(showCatalog, 3000); }
  function getMovieSearchText(movie) {
    return [movie.title, movie.description, movie.category, movie.type, movie.duration, movie.year, movie.location, Array.isArray(movie.people) ? movie.people.join(" ") : movie.people].join(" ").toLowerCase();
  }
  function renderMovies(list) {
    movieGrid.innerHTML = "";
    const fragment = document.createDocumentFragment();
    list.forEach((movie) => {
      const category = movie.category || movie.type || "Video familiar";
      const card = document.createElement("article");
      card.className = "movie-card";
      card.innerHTML = "<a class=\"poster-link\" href=\"player.html?id=" + encodeURIComponent(movie.id) + "\" aria-label=\"Ver detalle de " + escapeAttribute(movie.title) + "\"><img src=\"" + escapeAttribute(movie.poster) + "\" alt=\"Portada de " + escapeAttribute(movie.title) + "\" loading=\"lazy\"><span class=\"play-badge\">Detalle</span></a><div class=\"movie-info\"><div class=\"movie-title-row\"><h3>" + escapeHtml(movie.title) + "</h3><span>" + escapeHtml(movie.rating || "ATP") + "</span></div><p>" + escapeHtml(movie.description) + "</p><div class=\"meta-row\"><span>" + escapeHtml(category) + "</span><span>" + escapeHtml(movie.duration) + "</span><span>" + escapeHtml(movie.year) + "</span></div></div>";
      fragment.appendChild(card);
    });
    movieGrid.appendChild(fragment);
    emptyState.classList.toggle("is-hidden", list.length > 0);
    resultsCount.textContent = list.length === 1 ? "1 resultado" : list.length + " resultados";
  }
  function handleSearch(event) { event.preventDefault(); const query = searchInput.value.trim().toLowerCase(); renderMovies(query ? movies.filter((movie) => getMovieSearchText(movie).includes(query)) : movies); }
  function escapeHtml(value) { return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
  function escapeAttribute(value) { return escapeHtml(value).replaceAll("\x60", "&#096;"); }
  if (searchForm) searchForm.addEventListener("submit", handleSearch);
  if (searchInput) searchInput.addEventListener("input", handleSearch);
  startExperience();
})();
