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
  const sortMenuButton = document.getElementById("sort-menu-button");
  const sortMenuLabel = document.getElementById("sort-menu-label");
  const sortMenuOptions = document.getElementById("sort-menu-options");
  const sortOptionButtons = Array.from(document.querySelectorAll("[data-sort-value]"));
  const sortDirectionButton = document.getElementById("sort-direction");
  const carouselToggle = document.getElementById("carousel-toggle");
  const catalogTitle = document.getElementById("catalog-title");
  const catalogArea = document.querySelector(".catalog-area");
  const featuredSection = document.querySelector(".featured");
  const helpScreen = document.getElementById("help-screen");
  const menuButton = document.getElementById("menu-button");
  const helpMenu = document.getElementById("help-menu");
  const sectionLinks = Array.from(document.querySelectorAll("[data-section-link]"));
  const photoViewer = document.getElementById("photo-viewer");
  const photoViewerFrame = document.getElementById("photo-viewer-frame");
  const photoViewerClose = document.getElementById("photo-viewer-close");
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
  const sortState = { key: "year", direction: "asc" };
  const sortLabels = { year: "Año", category: "Categoría", title: "Título", duration: "Duración" };
  let isCarouselMode = false;
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
    if (carouselToggle) carouselToggle.classList.toggle("is-hidden", isHelp);
    if (isHelp) {
      document.title = "REC | Centro de Ayuda";
      return;
    }
    const section = sections[currentSection];
    document.title = "REC | " + section.title;
    catalogTitle.textContent = section.title;
    if (carouselToggle) carouselToggle.classList.toggle("is-hidden", section !== sections.videos);
    if (section !== sections.videos) setCarouselMode(false);
    renderItems(getVisibleItems(section), section);
  }
  function renderItems(list, section) {
    movieGrid.innerHTML = "";
    if (section === sections.videos && isCarouselMode) {
      movieGrid.className = "decade-carousels";
      renderDecadeCarousels(list, section);
      emptyState.classList.toggle("is-hidden", list.length > 0);
      emptyState.querySelector("h3").textContent = section.empty;
      resultsCount.textContent = list.length === 1 ? "1 resultado" : list.length + " resultados";
      return;
    }
    movieGrid.className = getGridClassName(section);
    const fragment = document.createDocumentFragment();
    list.forEach((item) => {
      fragment.appendChild(createItemCard(item, section));
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
  function getGridClassName(section) {
    if (section === sections.audios) return "media-list audio-list";
    if (section === sections.documents) return "media-list document-list";
    if (section === sections.photos) return "photo-grid";
    return "movie-grid";
  }
  function createItemCard(item, section) {
    if (section === sections.photos) return createPhotoCard(item);
    if (section === sections.audios) return createAudioRow(item);
    if (section === sections.documents) return createDocumentRow(item);
    return createVideoCard(item, section);
  }
  function createVideoCard(item, section, posterOnly) {
    const category = item.category || item.type || section.badge + " REC";
    const href = getItemHref(item, section);
    const imageMarkup = item.poster || item.thumbnail ? "<img src=\"" + escapeAttribute(item.poster || item.thumbnail) + "\" alt=\"Portada de " + escapeAttribute(item.title) + "\" loading=\"lazy\">" : "<span class=\"poster-placeholder\">" + escapeHtml(section.badge) + "</span>";
    const card = document.createElement("article");
    card.className = "movie-card";
    card.innerHTML = "<a class=\"poster-link\" href=\"" + escapeAttribute(href) + "\" aria-label=\"" + escapeAttribute(section.linkLabel + item.title) + "\">" + imageMarkup + "<span class=\"poster-play-icon\" aria-hidden=\"true\">&#9658;</span><span class=\"play-badge\">" + escapeHtml(posterOnly ? item.year : section.badge) + "</span></a>" + (posterOnly ? "" : "<div class=\"movie-info\"><div class=\"movie-title-row\"><h3>" + escapeHtml(item.title) + "</h3><span>" + escapeHtml(item.rating || "ATP") + "</span></div><p>" + escapeHtml(item.description) + "</p><div class=\"meta-row\"><span>" + escapeHtml(category) + "</span><span>" + escapeHtml(item.duration || item.format || "") + "</span><span>" + escapeHtml(item.year || "") + "</span></div></div>");
    return card;
  }
  function renderDecadeCarousels(list, section) {
    const groups = getDecadeGroups(list);
    const fragment = document.createDocumentFragment();
    groups.forEach((group) => {
      const carousel = document.createElement("section");
      carousel.className = "decade-carousel";
      carousel.innerHTML = "<h3>" + escapeHtml(group.label) + "</h3><div class=\"decade-track\"></div>";
      const track = carousel.querySelector(".decade-track");
      group.items.forEach((item) => track.appendChild(createVideoCard(item, section, true)));
      fragment.appendChild(carousel);
    });
    movieGrid.appendChild(fragment);
  }
  function getDecadeGroups(list) {
    const groupsByLabel = new Map();
    list.forEach((item) => {
      const year = getSortableNumber(item.year);
      if (Number.isNaN(year)) return;
      const label = getDecadeLabel(year);
      if (!groupsByLabel.has(label)) groupsByLabel.set(label, []);
      groupsByLabel.get(label).push(item);
    });
    return Array.from(groupsByLabel.entries()).map(([label, items]) => ({ label, items })).sort((firstGroup, secondGroup) => getDecadeSortValue(firstGroup.label) - getDecadeSortValue(secondGroup.label));
  }
  function getDecadeLabel(year) {
    if (year >= 2010) return "+2010";
    const decade = Math.floor(year / 10) * 10;
    if (decade === 2000) return "Los 2000";
    const decadeText = String(decade).slice(-2);
    return "Los " + decadeText;
  }
  function getDecadeSortValue(label) {
    if (label === "+2010") return 2010;
    if (label === "Los 2000") return 2000;
    const number = Number.parseInt(label.replace(/\D/g, ""), 10);
    return Number.isNaN(number) ? Number.MAX_SAFE_INTEGER : number >= 80 ? 1900 + number : 2000 + number;
  }
  function createPhotoCard(item) {
    const card = document.createElement("article");
    card.className = "media-card photo-card";
    card.innerHTML = "<button class=\"photo-open-button\" type=\"button\" aria-label=\"Abrir " + escapeAttribute(item.title) + "\"><span class=\"embedded-preview photo-preview\"><iframe src=\"" + escapeAttribute(item.url) + "\" title=\"" + escapeAttribute(item.title) + "\" loading=\"lazy\" allow=\"autoplay; fullscreen\" allowfullscreen></iframe></span></button><div class=\"media-row-copy photo-copy\"><h3>" + escapeHtml(item.title) + "</h3><p>" + escapeHtml(item.description) + "</p><a class=\"primary-link mobile-media-action\" href=\"" + escapeAttribute(item.url) + "\" target=\"_blank\" rel=\"noopener\">Ver foto</a></div>";
    card.querySelector(".photo-open-button").addEventListener("click", () => openPhotoViewer(item));
    return card;
  }
  function createAudioRow(item) {
    const row = document.createElement("article");
    row.className = "media-row audio-row";
    row.innerHTML = "<div class=\"media-row-copy\"><h3>" + escapeHtml(item.title) + "</h3><p>" + escapeHtml(item.description) + "</p><a class=\"primary-link mobile-media-action\" href=\"" + escapeAttribute(item.url) + "\" target=\"_blank\" rel=\"noopener\">Escuchar audio</a></div><div class=\"embedded-preview audio-preview\"><iframe src=\"" + escapeAttribute(item.url) + "\" title=\"" + escapeAttribute(item.title) + "\" loading=\"lazy\" allow=\"autoplay\"></iframe></div>";
    return row;
  }
  function createDocumentRow(item) {
    const row = document.createElement("article");
    row.className = "media-row document-row";
    row.innerHTML = "<div class=\"embedded-preview document-preview\"><iframe src=\"" + escapeAttribute(item.url) + "\" title=\"" + escapeAttribute(item.title) + "\" loading=\"lazy\" allow=\"autoplay; fullscreen\" allowfullscreen></iframe></div><div class=\"media-row-copy\"><h3>" + escapeHtml(item.title) + "</h3><p>" + escapeHtml(item.description) + "</p><a class=\"media-open-link\" href=\"" + escapeAttribute(item.url) + "\" target=\"_blank\" rel=\"noopener\">Abrir documento</a><a class=\"primary-link mobile-media-action\" href=\"" + escapeAttribute(item.url) + "\" target=\"_blank\" rel=\"noopener\">Ver documento</a></div>";
    return row;
  }
  function openPhotoViewer(item) {
    if (!photoViewer || !photoViewerFrame) return;
    photoViewerFrame.src = item.url;
    photoViewer.classList.remove("is-hidden");
    document.body.classList.add("viewer-open");
    if (photoViewerClose) photoViewerClose.focus();
  }
  function closePhotoViewer() {
    if (!photoViewer || !photoViewerFrame) return;
    photoViewer.classList.add("is-hidden");
    photoViewerFrame.src = "";
    document.body.classList.remove("viewer-open");
  }
  function handleSearch(event) {
    event.preventDefault();
    const section = sections[currentSection] || sections.videos;
    renderItems(getVisibleItems(section), section);
  }
  function getVisibleItems(section) {
    const query = searchInput.value.trim().toLowerCase();
    const visibleItems = query ? section.items.filter((item) => getItemSearchText(item).includes(query)) : section.items.slice();
    return visibleItems.sort(compareItemsBySortState);
  }
  function compareItemsBySortState(firstItem, secondItem) {
    const direction = sortState.direction === "desc" ? -1 : 1;
    let result = 0;
    if (sortState.key === "year") {
      result = compareNumbers(getSortableNumber(firstItem.year), getSortableNumber(secondItem.year));
    } else if (sortState.key === "duration") {
      result = compareNumbers(getSortableNumber(firstItem.duration || firstItem.format), getSortableNumber(secondItem.duration || secondItem.format));
    } else {
      result = String(firstItem[sortState.key] || "").localeCompare(String(secondItem[sortState.key] || ""), "es", { sensitivity: "base" });
    }
    if (result === 0) {
      result = String(firstItem.title || "").localeCompare(String(secondItem.title || ""), "es", { sensitivity: "base" });
    }
    return result * direction;
  }
  function compareNumbers(firstNumber, secondNumber) {
    const firstValue = Number.isNaN(firstNumber) ? Number.MAX_SAFE_INTEGER : firstNumber;
    const secondValue = Number.isNaN(secondNumber) ? Number.MAX_SAFE_INTEGER : secondNumber;
    return firstValue - secondValue;
  }
  function getSortableNumber(value) {
    const match = String(value || "").match(/\d+/);
    return match ? Number.parseInt(match[0], 10) : Number.NaN;
  }
  function updateSortDirectionButton() {
    const isDescending = sortState.direction === "desc";
    sortDirectionButton.textContent = isDescending ? "↓" : "↑";
    sortDirectionButton.setAttribute("aria-label", isDescending ? "Orden decreciente" : "Orden creciente");
    sortDirectionButton.setAttribute("aria-pressed", String(isDescending));
  }
  function closeSortMenu() {
    if (sortMenuOptions) sortMenuOptions.classList.add("is-hidden");
    if (sortMenuButton) sortMenuButton.setAttribute("aria-expanded", "false");
  }
  function updateSortMenu() {
    if (sortMenuLabel) sortMenuLabel.textContent = sortLabels[sortState.key] || "Año";
    sortOptionButtons.forEach((button) => {
      button.setAttribute("aria-selected", String(button.dataset.sortValue === sortState.key));
    });
  }
  function setCarouselMode(shouldUseCarousels) {
    isCarouselMode = shouldUseCarousels;
    if (carouselToggle) {
      carouselToggle.setAttribute("aria-pressed", String(isCarouselMode));
      carouselToggle.setAttribute("aria-label", isCarouselMode ? "Desactivar carruseles" : "Activar carruseles");
    }
  }
  function escapeHtml(value) { return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
  function escapeAttribute(value) { return escapeHtml(value).replaceAll("\x60", "&#096;"); }
  if (searchForm) searchForm.addEventListener("submit", handleSearch);
  if (searchInput) searchInput.addEventListener("input", handleSearch);
  if (sortMenuButton && sortMenuOptions) sortMenuButton.addEventListener("click", () => {
    const isOpen = sortMenuOptions.classList.toggle("is-hidden") === false;
    sortMenuButton.setAttribute("aria-expanded", String(isOpen));
  });
  sortOptionButtons.forEach((button) => button.addEventListener("click", () => {
    sortState.key = button.dataset.sortValue || "year";
    updateSortMenu();
    closeSortMenu();
    const section = sections[currentSection] || sections.videos;
    renderItems(getVisibleItems(section), section);
  }));
  document.addEventListener("click", (event) => {
    if (!sortMenuOptions || !sortMenuButton) return;
    if (!sortMenuOptions.contains(event.target) && !sortMenuButton.contains(event.target)) closeSortMenu();
  });
  if (sortDirectionButton) sortDirectionButton.addEventListener("click", () => {
    sortState.direction = sortState.direction === "asc" ? "desc" : "asc";
    updateSortDirectionButton();
    const section = sections[currentSection] || sections.videos;
    renderItems(getVisibleItems(section), section);
  });
  if (carouselToggle) carouselToggle.addEventListener("click", () => {
    const section = sections[currentSection] || sections.videos;
    if (section !== sections.videos) return;
    setCarouselMode(!isCarouselMode);
    renderItems(getVisibleItems(section), section);
  });
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
  if (photoViewerClose) photoViewerClose.addEventListener("click", closePhotoViewer);
  if (photoViewer) photoViewer.addEventListener("click", (event) => {
    if (event.target === photoViewer) closePhotoViewer();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closePhotoViewer();
  });
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
  window.setTimeout(startExperience, 300);
})();
