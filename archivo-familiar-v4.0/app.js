(function () {
  const FAMILY_PASSWORD = "familia2026";
  const MAX_PASSWORD_ATTEMPTS = 3;
  const introScreen = document.getElementById("intro-screen");
  const passwordScreen = document.getElementById("password-screen");
  const passwordForm = document.getElementById("password-form");
  const passwordInput = document.getElementById("family-password");
  const passwordSubmit = document.getElementById("password-submit");
  const passwordMessage = document.getElementById("password-message");
  const passwordRetry = document.getElementById("password-retry");
  const catalogScreen = document.getElementById("catalog-screen");
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const movieGrid = document.getElementById("movie-grid");
  const emptyState = document.getElementById("empty-state");
  const resultsCount = document.getElementById("results-count");
  const featuredButton = document.getElementById("featured-button");
  const movies = Array.isArray(window.MOVIES) ? window.MOVIES : [];
  let remainingPasswordAttempts = MAX_PASSWORD_ATTEMPTS;
  function getIntroDuration() { return window.APP_CONFIG && Number.isFinite(window.APP_CONFIG.introDurationMs) ? window.APP_CONFIG.introDurationMs : 3000; }
  function showPasswordScreen() {
    introScreen.classList.add("is-hidden");
    passwordScreen.classList.remove("is-hidden");
    window.setTimeout(() => passwordInput && passwordInput.focus(), 80);
  }
  function showCatalog() {
    introScreen.classList.add("is-hidden");
    passwordScreen.classList.add("is-hidden");
    catalogScreen.classList.remove("is-hidden");
    renderMovies(movies);
    if (movies[0] && featuredButton) featuredButton.href = "player.html?id=" + encodeURIComponent(movies[0].id);
  }
  function playAccessSound() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const audioContext = new AudioContext();
    const now = audioContext.currentTime;
    [523.25, 659.25, 783.99].forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now + index * 0.08);
      gain.gain.setValueAtTime(0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.08, now + index * 0.08 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.22);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now + index * 0.08);
      oscillator.stop(now + index * 0.08 + 0.24);
    });
    window.setTimeout(() => audioContext.close(), 800);
  }
  function lockPasswordForm() {
    passwordInput.disabled = true;
    passwordSubmit.disabled = true;
    passwordRetry.classList.remove("is-hidden");
    passwordMessage.textContent = "Te quedaste sin intentos para ingresar. Por favor, comunicate con el representante familiar para obtener la contraseña correcta.";
  }
  function handlePasswordSubmit(event) {
    event.preventDefault();
    if (remainingPasswordAttempts <= 0) return;
    if (passwordInput.value === FAMILY_PASSWORD) {
      playAccessSound();
      showCatalog();
      return;
    }
    remainingPasswordAttempts -= 1;
    passwordInput.value = "";
    if (remainingPasswordAttempts <= 0) {
      lockPasswordForm();
      return;
    }
    passwordMessage.textContent = "La contraseña ingresada es incorrecta. Intentos restantes: " + remainingPasswordAttempts;
    passwordInput.focus();
  }
  function startExperience() { window.setTimeout(showPasswordScreen, getIntroDuration()); }
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
  if (passwordForm) passwordForm.addEventListener("submit", handlePasswordSubmit);
  if (passwordRetry) passwordRetry.addEventListener("click", () => window.location.reload());
  startExperience();
})();
