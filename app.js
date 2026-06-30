(function () {
  const introScreen = document.getElementById("intro-screen");
  const loginScreen = document.getElementById("login-screen");
  const catalogScreen = document.getElementById("catalog-screen");
  const loginForm = document.getElementById("login-form");
  const passwordInput = document.getElementById("password-input");
  const loginMessage = document.getElementById("login-message");
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const movieGrid = document.getElementById("movie-grid");
  const emptyState = document.getElementById("empty-state");
  const resultsCount = document.getElementById("results-count");
  const featuredButton = document.getElementById("featured-button");
  const config = window.APP_CONFIG || {};
  const movies = Array.isArray(window.MOVIES) ? window.MOVIES : [];
  const maxAttempts = Number(config.maxLoginAttempts) || 3;
  const password = String(config.familyPassword || "");
  let attempts = 0;
  function showOnly(screen) { [introScreen, loginScreen, catalogScreen].forEach((item) => { if (item) item.classList.toggle("is-hidden", item !== screen); }); }
  function isLoggedIn() { return config.rememberLoginInSession && sessionStorage.getItem("archivoFamiliarAuth") === "ok"; }
  function openCatalog() { showOnly(catalogScreen); renderMovies(movies); if (movies[0] && featuredButton) featuredButton.href = `player.html?id=${encodeURIComponent(movies[0].id)}`; if (searchInput) searchInput.focus(); }
  function openLogin() { showOnly(loginScreen); window.setTimeout(() => { if (passwordInput) passwordInput.focus(); }, 80); }
  function startExperience() { if (isLoggedIn()) { openCatalog(); return; } showOnly(introScreen); window.setTimeout(openLogin, 3300); }
  function handleLogin(event) { event.preventDefault(); const typedPassword = passwordInput.value.trim(); if (typedPassword === password) { if (config.rememberLoginInSession) sessionStorage.setItem("archivoFamiliarAuth", "ok"); loginMessage.textContent = ""; openCatalog(); return; } attempts += 1; passwordInput.value = ""; passwordInput.focus(); if (attempts >= maxAttempts) { loginMessage.textContent = "Por favor, contactarse con el representante familiar"; passwordInput.disabled = true; document.getElementById("login-button").disabled = true; } else { loginMessage.textContent = "Contraseña incorrecta"; } }
  function movieMatches(movie, query) { return [movie.title, movie.description, movie.type, movie.duration, movie.year, movie.rating].join(" ").toLowerCase().includes(query); }
  function renderMovies(list) { movieGrid.innerHTML = ""; const fragment = document.createDocumentFragment(); list.forEach((movie) => { const card = document.createElement("article"); card.className = "movie-card"; card.innerHTML = `<a class="poster-link" href="player.html?id=${encodeURIComponent(movie.id)}" aria-label="Ver ${escapeHtml(movie.title)}"><img src="${escapeAttribute(movie.poster)}" alt="Poster de ${escapeAttribute(movie.title)}" loading="lazy"><span class="play-badge">Ver</span></a><div class="movie-info"><div class="movie-title-row"><h3>${escapeHtml(movie.title)}</h3><span>${escapeHtml(movie.rating)}</span></div><p>${escapeHtml(movie.description)}</p><div class="meta-row"><span>${escapeHtml(movie.type)}</span><span>${escapeHtml(movie.duration)}</span><span>${escapeHtml(movie.year)}</span></div></div>`; fragment.appendChild(card); }); movieGrid.appendChild(fragment); emptyState.classList.toggle("is-hidden", list.length > 0); resultsCount.textContent = list.length === 1 ? "1 resultado" : `${list.length} resultados`; }
  function handleSearch(event) { event.preventDefault(); const query = searchInput.value.trim().toLowerCase(); renderMovies(query ? movies.filter((movie) => movieMatches(movie, query)) : movies); }
  function escapeHtml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
  function escapeAttribute(value) { return escapeHtml(value).replaceAll("\x60", "&#096;"); }
  if (loginForm) loginForm.addEventListener("submit", handleLogin);
  if (searchForm) searchForm.addEventListener("submit", handleSearch);
  if (searchInput) searchInput.addEventListener("input", handleSearch);
  startExperience();
})();
