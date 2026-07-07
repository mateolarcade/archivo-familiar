(function () {
  const FAMILY_PASSWORD = "familia2026";
  const MAX_PASSWORD_ATTEMPTS = 3;
  const ACCESS_STORAGE_KEY = "archivoFamiliarAccessGranted";
  const introScreen = document.getElementById("intro-screen");
  const passwordScreen = document.getElementById("password-screen");
  const passwordForm = document.getElementById("password-form");
  const passwordInput = document.getElementById("family-password");
  const passwordSubmit = document.getElementById("password-submit");
  const passwordToggle = document.getElementById("password-toggle");
  const passwordMessage = document.getElementById("password-message");
  const passwordRetry = document.getElementById("password-retry");
  const catalogScreen = document.getElementById("catalog-screen");
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const movieGrid = document.getElementById("movie-grid");
  const emptyState = document.getElementById("empty-state");
  const resultsCount = document.getElementById("results-count");
  const movies = Array.isArray(window.MOVIES) ? window.MOVIES : [];
  const sortedMovies = movies.slice().sort(compareMovies);
  let remainingPasswordAttempts = MAX_PASSWORD_ATTEMPTS;
  function hasFamilyAccess() {
    try { return window.sessionStorage.getItem(ACCESS_STORAGE_KEY) === "true"; }
    catch (error) { return false; }
  }
  function grantFamilyAccess() {
    try { window.sessionStorage.setItem(ACCESS_STORAGE_KEY, "true"); }
    catch (error) {}
  }
  function getIntroDuration() { return window.APP_CONFIG && Number.isFinite(window.APP_CONFIG.introDurationMs) ? window.APP_CONFIG.introDurationMs : 3000; }
  function createAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    try { return new AudioContext(); }
    catch (error) { return null; }
  }
  function scheduleTone(audioContext, startTime, duration, frequency, volume, type) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type || "sine";
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
  }
  function scheduleTvStatic(audioContext, startTime, duration) {
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) {
      data[index] = (Math.random() * 2 - 1) * 0.46;
    }
    const noise = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();
    noise.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1800, startTime);
    filter.frequency.linearRampToValueAtTime(3400, startTime + duration);
    filter.Q.setValueAtTime(0.72, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.09, startTime + 0.12);
    gain.gain.setValueAtTime(0.09, startTime + duration - 0.18);
    gain.gain.linearRampToValueAtTime(0.0001, startTime + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    noise.start(startTime);
    noise.stop(startTime + duration);
  }
  function playIntroSequenceSound() {
    const audioContext = createAudioContext();
    if (!audioContext) return;
    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }
    const now = audioContext.currentTime + 0.03;
    scheduleTone(audioContext, now, 0.34, 72, 0.18, "sawtooth");
    scheduleTone(audioContext, now + 0.03, 0.24, 1180, 0.045, "square");
    scheduleTone(audioContext, now + 0.18, 0.28, 54, 0.11, "sine");
    scheduleTvStatic(audioContext, now + 0.8, 2.35);
    [3.3, 3.95, 4.5].forEach((offset) => {
      scheduleTone(audioContext, now + offset, 0.22, 880, 0.13, "sine");
      scheduleTone(audioContext, now + offset + 0.02, 0.2, 1760, 0.035, "triangle");
    });
    scheduleTone(audioContext, now + 4.5, 0.5, 880, 0.07, "sine");
    window.setTimeout(() => audioContext.close().catch(() => {}), getIntroDuration() + 140);
  }
  function showPasswordScreen() {
    introScreen.classList.add("is-hidden");
    passwordScreen.classList.remove("is-hidden");
    window.setTimeout(() => passwordInput && passwordInput.focus(), 80);
  }
  function showCatalog() {
    introScreen.classList.add("is-hidden");
    passwordScreen.classList.add("is-hidden");
    catalogScreen.classList.remove("is-hidden");
    renderMovies(sortedMovies);
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
    passwordMessage.textContent = "Te quedaste sin intentos para ingresar. Por favor, comunicate con el representante de REC para obtener la contraseña correcta.";
  }
  function handlePasswordSubmit(event) {
    event.preventDefault();
    if (remainingPasswordAttempts <= 0) return;
    if (passwordInput.value === FAMILY_PASSWORD) {
      grantFamilyAccess();
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
  function startExperience() {
    playIntroSequenceSound();
    window.setTimeout(() => {
      if (hasFamilyAccess()) {
        showCatalog();
        return;
      }
      showPasswordScreen();
    }, getIntroDuration());
  }
  function getMovieSearchText(movie) {
    return [movie.title, movie.description, movie.category, movie.type, movie.duration, movie.year, movie.location, Array.isArray(movie.people) ? movie.people.join(" ") : movie.people].join(" ").toLowerCase();
  }
  function compareMovies(firstMovie, secondMovie) {
    const firstYear = Number.parseInt(firstMovie.year, 10);
    const secondYear = Number.parseInt(secondMovie.year, 10);
    const yearComparison = (Number.isNaN(firstYear) ? Number.MAX_SAFE_INTEGER : firstYear) - (Number.isNaN(secondYear) ? Number.MAX_SAFE_INTEGER : secondYear);
    if (yearComparison !== 0) return yearComparison;
    return String(firstMovie.title || "").localeCompare(String(secondMovie.title || ""), "es", { sensitivity: "base" });
  }
  function renderMovies(list) {
    movieGrid.innerHTML = "";
    const fragment = document.createDocumentFragment();
    list.forEach((movie) => {
      const category = movie.category || movie.type || "Video REC";
      const card = document.createElement("article");
      card.className = "movie-card";
      card.innerHTML = "<a class=\"poster-link\" href=\"player.html?id=" + encodeURIComponent(movie.id) + "\" aria-label=\"Ver video de " + escapeAttribute(movie.title) + "\"><img src=\"" + escapeAttribute(movie.poster) + "\" alt=\"Portada de " + escapeAttribute(movie.title) + "\" loading=\"lazy\"><span class=\"poster-play-icon\" aria-hidden=\"true\">&#9658;</span><span class=\"play-badge\">Video</span></a><div class=\"movie-info\"><div class=\"movie-title-row\"><h3>" + escapeHtml(movie.title) + "</h3><span>" + escapeHtml(movie.rating || "ATP") + "</span></div><p>" + escapeHtml(movie.description) + "</p><div class=\"meta-row\"><span>" + escapeHtml(category) + "</span><span>" + escapeHtml(movie.duration) + "</span><span>" + escapeHtml(movie.year) + "</span></div></div>";
      fragment.appendChild(card);
    });
    movieGrid.appendChild(fragment);
    emptyState.classList.toggle("is-hidden", list.length > 0);
    resultsCount.textContent = list.length === 1 ? "1 resultado" : list.length + " resultados";
  }
  function handleSearch(event) { event.preventDefault(); const query = searchInput.value.trim().toLowerCase(); renderMovies(query ? sortedMovies.filter((movie) => getMovieSearchText(movie).includes(query)) : sortedMovies); }
  function escapeHtml(value) { return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
  function escapeAttribute(value) { return escapeHtml(value).replaceAll("\x60", "&#096;"); }
  if (searchForm) searchForm.addEventListener("submit", handleSearch);
  if (searchInput) searchInput.addEventListener("input", handleSearch);
  if (passwordForm) passwordForm.addEventListener("submit", handlePasswordSubmit);
  if (passwordToggle && passwordInput) passwordToggle.addEventListener("click", () => {
    const shouldShow = passwordInput.type === "password";
    passwordInput.type = shouldShow ? "text" : "password";
    passwordToggle.setAttribute("aria-label", shouldShow ? "Ocultar contraseña" : "Mostrar contraseña");
    passwordToggle.setAttribute("aria-pressed", String(shouldShow));
    passwordInput.focus();
  });
  if (passwordRetry) passwordRetry.addEventListener("click", () => window.location.reload());
  startExperience();
})();
