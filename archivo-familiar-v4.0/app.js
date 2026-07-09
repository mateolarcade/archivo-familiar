(function () {
  const FAMILY_PASSWORD = "familia2026";
  const MAX_PASSWORD_ATTEMPTS = 3;
  const ACCESS_STORAGE_KEY = "archivoFamiliarAccessGranted";
  const introScreen = document.getElementById("intro-screen");
  const introStartButton = document.getElementById("intro-start-button");
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
  const catalogTitle = document.getElementById("catalog-title");
  const catalogArea = document.querySelector(".catalog-area");
  const featuredSection = document.querySelector(".featured");
  const helpScreen = document.getElementById("help-screen");
  const menuButton = document.getElementById("menu-button");
  const helpMenu = document.getElementById("help-menu");
  const sectionLinks = Array.from(document.querySelectorAll("[data-section-link]"));
  const movies = Array.isArray(window.MOVIES) ? window.MOVIES : [];
  const sortedMovies = movies.slice().sort(compareMovies);
  const photos = Array.isArray(window.PHOTOS) ? window.PHOTOS : [];
  const audios = Array.isArray(window.AUDIOS) ? window.AUDIOS : [];
  const documents = Array.isArray(window.DOCUMENTS) ? window.DOCUMENTS : [];
  const sections = {
    videos: { title: "Videos disponibles", empty: "No se encontraron videos", items: sortedMovies, badge: "Video", linkLabel: "Ver video de " },
    photos: { title: "Fotos disponibles", empty: "No se encontraron fotos", items: photos, badge: "Foto", linkLabel: "Ver foto " },
    audios: { title: "Audios disponibles", empty: "No se encontraron audios", items: audios, badge: "Audio", linkLabel: "Escuchar audio " },
    documents: { title: "Documentos disponibles", empty: "No se encontraron documentos", items: documents, badge: "Documento", linkLabel: "Abrir documento " }
  };
  let currentSection = getRequestedSection();
  let remainingPasswordAttempts = MAX_PASSWORD_ATTEMPTS;
  let introHasStarted = false;
  function hasFamilyAccess() {
    try { return window.sessionStorage.getItem(ACCESS_STORAGE_KEY) === "true"; }
    catch (error) { return false; }
  }
  function grantFamilyAccess() {
    try { window.sessionStorage.setItem(ACCESS_STORAGE_KEY, "true"); }
    catch (error) {}
  }
  function shouldOpenCatalogDirectly() {
    const params = new URLSearchParams(window.location.search);
    return params.get("catalog") === "1";
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
    scheduleTone(audioContext, now, 0.74, 64, 0.18, "sawtooth");
    scheduleTone(audioContext, now + 0.05, 0.28, 1280, 0.045, "square");
    scheduleTone(audioContext, now + 0.36, 0.48, 48, 0.13, "sine");
    scheduleTvStatic(audioContext, now + 1, 4);
    [1.08, 1.92, 2.76, 3.6, 4.44].forEach((offset) => {
      scheduleTone(audioContext, now + offset, 0.18, 1040, 0.12, "sine");
      scheduleTone(audioContext, now + offset + 0.018, 0.16, 2080, 0.032, "triangle");
    });
    scheduleTone(audioContext, now + 5, 1, 1040, 0.08, "sine");
    scheduleTone(audioContext, now + 5, 1, 2080, 0.022, "triangle");
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
    showSection(currentSection);
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
    if (introHasStarted) return;
    introHasStarted = true;
    introScreen.classList.add("is-running");
    if (introStartButton) introStartButton.disabled = true;
    playIntroSequenceSound();
    window.setTimeout(() => {
      if (hasFamilyAccess()) {
        showCatalog();
        return;
      }
      showPasswordScreen();
    }, getIntroDuration());
  }
  function getRequestedSection() {
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section") || "videos";
    return section === "help" || sections[section] ? section : "videos";
  }
  function getItemSearchText(item) {
    return [item.title, item.description, item.category, item.type, item.duration, item.year, item.location, Array.isArray(item.people) ? item.people.join(" ") : item.people].join(" ").toLowerCase();
  }
  function compareMovies(firstMovie, secondMovie) {
    const firstYear = Number.parseInt(firstMovie.year, 10);
    const secondYear = Number.parseInt(secondMovie.year, 10);
    const yearComparison = (Number.isNaN(firstYear) ? Number.MAX_SAFE_INTEGER : firstYear) - (Number.isNaN(secondYear) ? Number.MAX_SAFE_INTEGER : secondYear);
    if (yearComparison !== 0) return yearComparison;
    return String(firstMovie.title || "").localeCompare(String(secondMovie.title || ""), "es", { sensitivity: "base" });
  }
  function showSection(sectionName) {
    currentSection = sectionName === "help" || sections[sectionName] ? sectionName : "videos";
    const isHelp = currentSection === "help";
    if (featuredSection) featuredSection.classList.toggle("is-hidden", isHelp);
    if (catalogArea) catalogArea.classList.toggle("is-hidden", isHelp);
    if (helpScreen) helpScreen.classList.toggle("is-hidden", !isHelp);
    if (searchForm) searchForm.classList.toggle("is-hidden", isHelp);
    if (searchInput) searchInput.value = "";
    sectionLinks.forEach((link) => link.classList.toggle("is-active", link.dataset.sectionLink === currentSection));
    if (helpMenu) helpMenu.classList.add("is-hidden");
    if (menuButton) menuButton.setAttribute("aria-expanded", "false");
    if (isHelp) {
      document.title = "REC | Centro de Ayuda";
      return;
    }
    const section = sections[currentSection];
    document.title = "REC | " + section.title;
    catalogTitle.textContent = section.title;
    renderItems(section.items, section);
  }
  function renderItems(list, section) {
    movieGrid.innerHTML = "";
    const fragment = document.createDocumentFragment();
    list.forEach((item) => {
      const category = item.category || item.type || section.badge + " REC";
      const href = getItemHref(item, section);
      const imageMarkup = item.poster || item.thumbnail ? "<img src=\"" + escapeAttribute(item.poster || item.thumbnail) + "\" alt=\"Portada de " + escapeAttribute(item.title) + "\" loading=\"lazy\">" : "<span class=\"poster-placeholder\">" + escapeHtml(section.badge) + "</span>";
      const card = document.createElement("article");
      card.className = "movie-card";
      card.innerHTML = "<a class=\"poster-link\" href=\"" + escapeAttribute(href) + "\" aria-label=\"" + escapeAttribute(section.linkLabel + item.title) + "\">" + imageMarkup + "<span class=\"poster-play-icon\" aria-hidden=\"true\">&#9658;</span><span class=\"play-badge\">" + escapeHtml(section.badge) + "</span></a><div class=\"movie-info\"><div class=\"movie-title-row\"><h3>" + escapeHtml(item.title) + "</h3><span>" + escapeHtml(item.rating || "ATP") + "</span></div><p>" + escapeHtml(item.description) + "</p><div class=\"meta-row\"><span>" + escapeHtml(category) + "</span><span>" + escapeHtml(item.duration || item.format || "") + "</span><span>" + escapeHtml(item.year || "") + "</span></div></div>";
      fragment.appendChild(card);
    });
    movieGrid.appendChild(fragment);
    emptyState.classList.toggle("is-hidden", list.length > 0);
    emptyState.querySelector("h3").textContent = section.empty;
    resultsCount.textContent = list.length === 1 ? "1 resultado" : list.length + " resultados";
  }
  function getItemHref(item, section) {
    if (section === sections.videos) return "player.html?id=" + encodeURIComponent(item.id);
    return item.url || item.src || "#";
  }
  function handleSearch(event) {
    event.preventDefault();
    const section = sections[currentSection] || sections.videos;
    const query = searchInput.value.trim().toLowerCase();
    renderItems(query ? section.items.filter((item) => getItemSearchText(item).includes(query)) : section.items, section);
  }
  function escapeHtml(value) { return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
  function escapeAttribute(value) { return escapeHtml(value).replaceAll("\x60", "&#096;"); }
  if (searchForm) searchForm.addEventListener("submit", handleSearch);
  if (searchInput) searchInput.addEventListener("input", handleSearch);
  if (menuButton && helpMenu) menuButton.addEventListener("click", () => {
    const isOpen = helpMenu.classList.toggle("is-hidden") === false;
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
  sectionLinks.forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    showSection(link.dataset.sectionLink);
    window.history.pushState({}, "", link.href);
  }));
  window.addEventListener("popstate", () => showSection(getRequestedSection()));
  if (passwordForm) passwordForm.addEventListener("submit", handlePasswordSubmit);
  if (passwordToggle && passwordInput) passwordToggle.addEventListener("click", () => {
    const shouldShow = passwordInput.type === "password";
    passwordInput.type = shouldShow ? "text" : "password";
    passwordToggle.setAttribute("aria-label", shouldShow ? "Ocultar contraseña" : "Mostrar contraseña");
    passwordToggle.setAttribute("aria-pressed", String(shouldShow));
    passwordInput.focus();
  });
  if (passwordRetry) passwordRetry.addEventListener("click", () => window.location.reload());
  if (shouldOpenCatalogDirectly()) {
    if (hasFamilyAccess()) showCatalog();
    else showPasswordScreen();
    return;
  }
  if (introStartButton) introStartButton.addEventListener("click", startExperience);
})();
