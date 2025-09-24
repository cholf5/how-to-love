import { translate } from './i18n.js';

const state = {
  data: null,
  language: 'en',
  chapterId: null,
  theme: 'light',
  scrollRestoration: null,
  scrollRestorationPending: null
};

const dom = {
  app: document.getElementById('app'),
  languageDropdown: document.getElementById('language-dropdown'),
  languageDropdownButton: document.getElementById('language-dropdown-button'),
  languageDropdownMenu: document.getElementById('language-dropdown-menu'),
  languageDropdownCurrent: document.getElementById('language-dropdown-current'),
  languageSelect: document.getElementById('language-select'),
  themeToggle: document.getElementById('theme-toggle'),
  brandLink: document.getElementById('brand-link'),
  footerNote: document.getElementById('footer-note')
};

let languageDropdownCloseTimeout = null;

const PLACEHOLDER_TOKEN = '\u0000';
const CPP_LANGUAGE_ALIASES = new Set(['cpp', 'c++', 'cc', 'cxx', 'hpp', 'h++']);
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const COOKIE_KEYS = {
  theme: 'how-to-love:theme',
  language: 'how-to-love:language'
};
const STORAGE_KEYS = {
  scrollProgress: 'how-to-love:scroll-progress'
};

function setCookie(key, value, maxAge = COOKIE_MAX_AGE) {
  document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

function getCookie(key) {
  const cookies = document.cookie ? document.cookie.split(';') : [];
  for (const cookie of cookies) {
    const [rawName, ...rest] = cookie.trim().split('=');
    if (decodeURIComponent(rawName) === key) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return null;
}

function getLocalStorage() {
  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
}

function readScrollProgressStore() {
  const storage = getLocalStorage();
  if (!storage) {
    return {};
  }
  try {
    const raw = storage.getItem(STORAGE_KEYS.scrollProgress);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (error) {
    // Ignore malformed JSON and fallback to empty store.
  }
  return {};
}

function writeScrollProgressStore(store) {
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }
  try {
    storage.setItem(STORAGE_KEYS.scrollProgress, JSON.stringify(store));
  } catch (error) {
    // Ignore storage write failures.
  }
}

function createScrollProgressKey(language, chapterId) {
  const safeLanguage = typeof language === 'string' ? language : '';
  const safeChapter = typeof chapterId === 'string' ? chapterId : '';
  return `${safeLanguage}::${safeChapter}`;
}

function loadScrollProgress(language, chapterId) {
  const store = readScrollProgressStore();
  const key = createScrollProgressKey(language, chapterId);
  const value = store[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value >= 0 && value <= 1) {
      return value;
    }
  }
  return null;
}

function persistScrollProgress(language, chapterId, ratio) {
  if (typeof ratio !== 'number' || !Number.isFinite(ratio)) {
    return;
  }
  const clamped = Math.min(1, Math.max(0, ratio));
  const store = readScrollProgressStore();
  const key = createScrollProgressKey(language, chapterId);
  store[key] = clamped;
  writeScrollProgressStore(store);
}

function persistCurrentScrollProgress() {
  const ratio = captureScrollProgress();
  const pending = state.scrollRestorationPending;
  const effectiveRatio = pending != null ? pending : ratio;
  persistScrollProgress(state.language, state.chapterId, effectiveRatio);
  return effectiveRatio;
}
const basePath = (() => {
  const { pathname } = window.location;
  if (pathname.endsWith('/')) {
    return pathname;
  }
  const lastSlash = pathname.lastIndexOf('/');
  if (lastSlash === -1) {
    return '/';
  }
  const lastSegment = pathname.slice(lastSlash + 1);
  if (!lastSegment || lastSegment.includes('.')) {
    return pathname.slice(0, lastSlash + 1) || '/';
  }
  return `${pathname}/`;
})();

async function init() {
  const response = await fetch('book/chapters.json');
  state.data = await response.json();

  const params = new URLSearchParams(window.location.search);
  const defaultLanguage = state.data.defaultLanguage || 'en';
  const paramLanguage = params.get('lang');
  const cookieLanguage = getCookie(COOKIE_KEYS.language);
  state.language = paramLanguage && state.data.languages[paramLanguage]
    ? paramLanguage
    : cookieLanguage && state.data.languages[cookieLanguage]
      ? cookieLanguage
      : defaultLanguage;

  persistLanguage();
  const chapter = params.get('chapter');
  if (chapter && findChapter(state.language, chapter)) {
    state.chapterId = chapter;
  }

  state.scrollRestoration = loadScrollProgress(state.language, state.chapterId);

  setupTheme();
  setupLanguageSelect();
  setupEvents();
  render();
}

function setupTheme() {
  const storedTheme = getCookie(COOKIE_KEYS.theme);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  state.theme = storedTheme === 'dark' || storedTheme === 'light'
    ? storedTheme
    : prefersDark
      ? 'dark'
      : 'light';
  applyTheme();
}

function setupLanguageSelect() {
  if (!dom.languageSelect || !dom.languageDropdownMenu || !dom.languageDropdownCurrent) {
    return;
  }
  dom.languageSelect.innerHTML = '';
  dom.languageDropdownMenu.innerHTML = '';
  Object.entries(state.data.languages).forEach(([code, info]) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = info.label;
    dom.languageSelect.appendChild(option);

    const item = document.createElement('li');
    item.setAttribute('role', 'none');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'language-dropdown__option';
    button.dataset.value = code;
    button.textContent = info.label;
    button.setAttribute('role', 'option');
    button.setAttribute('aria-selected', 'false');
    button.addEventListener('click', () => handleLanguageSelection(code));
    item.appendChild(button);
    dom.languageDropdownMenu.appendChild(item);
  });
  dom.languageSelect.value = state.language;
  updateLanguageDropdownSelection();
  updateFooter();
}

function clearLanguageDropdownCloseTimeout() {
  if (languageDropdownCloseTimeout) {
    window.clearTimeout(languageDropdownCloseTimeout);
    languageDropdownCloseTimeout = null;
  }
}

function openLanguageDropdown() {
  if (!dom.languageDropdown || !dom.languageDropdownButton) {
    return;
  }
  clearLanguageDropdownCloseTimeout();
  dom.languageDropdown.classList.add('is-open');
  dom.languageDropdownButton.setAttribute('aria-expanded', 'true');
}

function closeLanguageDropdown(options) {
  if (!dom.languageDropdown || !dom.languageDropdownButton) {
    return;
  }

  const defaults = { immediate: false, force: false };
  const normalizedOptions = typeof options === 'object' && options !== null
    ? { ...defaults, ...options }
    : { ...defaults, immediate: Boolean(options) };
  const { immediate, force } = normalizedOptions;
  const dropdown = dom.languageDropdown;
  const button = dom.languageDropdownButton;

  const doClose = () => {
    dropdown.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
  };

  if (immediate) {
    clearLanguageDropdownCloseTimeout();
    doClose();
    return;
  }

  clearLanguageDropdownCloseTimeout();
  languageDropdownCloseTimeout = window.setTimeout(() => {
    languageDropdownCloseTimeout = null;
    if (force || (!dropdown.matches(':hover') && !dropdown.matches(':focus-within'))) {
      doClose();
    }
  }, 200);
}

function captureScrollProgress() {
  const maxScroll = Math.max(
    document.documentElement.scrollHeight - window.innerHeight,
    0
  );
  if (maxScroll <= 0) {
    return 0;
  }
  const current = window.scrollY || document.documentElement.scrollTop || 0;
  return current / maxScroll;
}

function restoreScrollProgress() {
  if (state.scrollRestoration == null) {
    return;
  }
  const ratio = state.scrollRestoration;
  state.scrollRestoration = null;
  state.scrollRestorationPending = ratio;
  window.requestAnimationFrame(() => {
    const maxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      0
    );
    if (maxScroll <= 0) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      state.scrollRestorationPending = null;
      return;
    }
    const target = Math.min(maxScroll, Math.max(0, ratio * maxScroll));
    window.scrollTo({ top: target, behavior: 'auto' });
    state.scrollRestorationPending = null;
  });
}

function setupEvents() {
  dom.languageSelect.addEventListener('change', event => {
    const nextLanguage = event.target.value;
    if (!state.data.languages[nextLanguage]) {
      return;
    }
    const currentProgress = persistCurrentScrollProgress();
    const chapterExistsInNextLanguage = Boolean(
      state.chapterId && findChapter(nextLanguage, state.chapterId)
    );
    state.scrollRestoration = chapterExistsInNextLanguage
      ? currentProgress
      : null;
    if (chapterExistsInNextLanguage) {
      persistScrollProgress(nextLanguage, state.chapterId, currentProgress);
    }

    state.language = nextLanguage;
    updateLanguageDropdownSelection();
    if (!findChapter(nextLanguage, state.chapterId)) {
      state.chapterId = null;
      state.scrollRestoration = null;
    }
    persistLanguage();
    updateUrl();
    updateFooter();
    render(true);
  });

  if (dom.languageDropdown && dom.languageDropdownButton) {
    dom.languageDropdown.addEventListener('mouseenter', () => {
      openLanguageDropdown();
    });

    dom.languageDropdown.addEventListener('mouseleave', () => {
      closeLanguageDropdown({ force: true });
    });

    dom.languageDropdown.addEventListener('focusin', () => {
      openLanguageDropdown();
    });

    dom.languageDropdown.addEventListener('focusout', event => {
      if (!dom.languageDropdown.contains(event.relatedTarget)) {
        closeLanguageDropdown();
      }
    });

    dom.languageDropdownButton.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeLanguageDropdown(true);
        dom.languageDropdownButton.blur();
      }
    });
  }

  dom.themeToggle.addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme();
  });

  dom.brandLink.addEventListener('click', event => {
    event.preventDefault();
    if (state.chapterId !== null) {
      persistCurrentScrollProgress();
      state.chapterId = null;
      state.scrollRestoration = loadScrollProgress(state.language, state.chapterId);
      updateUrl();
      render();
    }
  });

  window.addEventListener('popstate', () => {
    persistCurrentScrollProgress();
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang');
    const chapter = params.get('chapter');
    if (lang && state.data.languages[lang]) {
      state.language = lang;
    }
    if (chapter && findChapter(state.language, chapter)) {
      state.chapterId = chapter;
    } else {
      state.chapterId = null;
    }
    state.scrollRestoration = loadScrollProgress(state.language, state.chapterId);
    dom.languageSelect.value = state.language;
    updateLanguageDropdownSelection();
    persistLanguage();
    updateFooter();
    render(true);
  });

  window.addEventListener('keydown', event => {
    if (!state.chapterId) {
      return;
    }
    if (event.defaultPrevented) {
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    const target = event.target;
    if (target && typeof target.closest === 'function') {
      if (target.closest('input, textarea, select, [contenteditable="true"]')) {
        return;
      }
    }

    const languageInfo = state.data.languages[state.language];
    if (!languageInfo) {
      return;
    }

    const { previous, next } = getChapterNeighbors(languageInfo, state.chapterId);
    if (event.key === 'ArrowLeft' && previous) {
      event.preventDefault();
      persistCurrentScrollProgress();
      state.chapterId = previous.id;
      state.scrollRestoration = null;
      updateUrl();
      render();
    } else if (event.key === 'ArrowRight' && next) {
      event.preventDefault();
      persistCurrentScrollProgress();
      state.chapterId = next.id;
      state.scrollRestoration = null;
      updateUrl();
      render();
    }
  });

  const handlePageHide = () => {
    persistCurrentScrollProgress();
  };
  window.addEventListener('beforeunload', handlePageHide);
  window.addEventListener('pagehide', handlePageHide);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      handlePageHide();
    }
  });
}

function handleLanguageSelection(code) {
  if (!dom.languageSelect || !dom.languageDropdownButton) {
    return;
  }
  if (!state.data.languages[code] || dom.languageSelect.value === code) {
    closeLanguageDropdown(true);
    return;
  }
  dom.languageSelect.value = code;
  const changeEvent = new Event('change', { bubbles: true });
  dom.languageSelect.dispatchEvent(changeEvent);
  closeLanguageDropdown(true);
}

function updateLanguageDropdownSelection() {
  if (!dom.languageSelect || !dom.languageDropdownCurrent || !dom.languageDropdownMenu) {
    return;
  }
  const activeCode = dom.languageSelect.value;
  const activeLanguage = state.data.languages[activeCode];
  if (activeLanguage) {
    dom.languageDropdownCurrent.textContent = activeLanguage.label;
  } else {
    dom.languageDropdownCurrent.textContent = '';
  }

  dom.languageDropdownMenu.querySelectorAll('.language-dropdown__option').forEach(optionButton => {
    const isActive = optionButton.dataset.value === activeCode;
    optionButton.classList.toggle('is-active', isActive);
    optionButton.setAttribute('aria-selected', String(isActive));
  });
}

function updateFooter() {
  const languageInfo = state.data.languages[state.language];
  if (!languageInfo) {
    dom.footerNote.textContent = '';
    return;
  }
  dom.footerNote.textContent = translate(state.language, 'footer.note');
}

function applyTheme() {
  document.body.dataset.theme = state.theme;
  const icon = state.theme === 'light' ? '🌙' : '☀️';
  dom.themeToggle.querySelector('.icon').textContent = icon;
  setCookie(COOKIE_KEYS.theme, state.theme);
}

function persistLanguage() {
  if (state.data && state.data.languages && state.data.languages[state.language]) {
    setCookie(COOKIE_KEYS.language, state.language);
  }
}

function updateUrl(replace = false) {
  const params = new URLSearchParams();
  if (state.language !== state.data.defaultLanguage) {
    params.set('lang', state.language);
  }
  if (state.chapterId) {
    params.set('chapter', state.chapterId);
  }
  const nextUrl = `${window.location.pathname}?${params.toString()}`.replace(/\?$/, '');
  if (replace) {
    window.history.replaceState({}, '', nextUrl);
  } else {
    window.history.pushState({}, '', nextUrl);
  }
}

function ensureScrollRestoration() {
  if (state.scrollRestoration == null) {
    state.scrollRestoration = loadScrollProgress(state.language, state.chapterId);
  }
}

function render(skipUrlUpdate = false) {
  dom.app.innerHTML = '';
  const languageInfo = state.data.languages[state.language];
  if (!languageInfo) {
    dom.app.textContent = 'Language configuration missing.';
    return;
  }

  ensureScrollRestoration();

  document.documentElement.lang = state.language;
  dom.brandLink.textContent = languageInfo.bookTitle || dom.brandLink.textContent;

  const activeChapter = state.chapterId
    ? findChapter(languageInfo, state.chapterId)
    : null;

  updateDocumentTitle(languageInfo, activeChapter);

  if (!state.chapterId) {
    if (!skipUrlUpdate) {
      updateUrl(true);
    }
    renderContents(languageInfo);
  } else {
    renderChapter(languageInfo, skipUrlUpdate, activeChapter);
  }
}

function updateDocumentTitle(languageInfo, chapter) {
  const baseTitle = (languageInfo && languageInfo.bookTitle) || 'How to LÖVE';
  if (chapter && chapter.title) {
    document.title = `${baseTitle} - ${chapter.title}`;
  } else {
    document.title = baseTitle;
  }
}

function renderContents(languageInfo) {
  const hero = document.createElement('section');
  hero.className = 'hero';

  const banner = document.createElement('img');
  banner.src = 'images/logo-banner.png';
  banner.alt = 'How to LÖVE banner';
  banner.className = 'hero-banner';

  const title = document.createElement('h1');
  title.className = 'hero-title';
  title.textContent = languageInfo.bookTitle;

  const subtitle = document.createElement('p');
  subtitle.className = 'hero-subtitle';
  subtitle.textContent = languageInfo.description;

  const credit = document.createElement('p');
  credit.className = 'hero-credit';
  const creditLink = '<a href="https://github.com/Sheepolution/how-to-love" target="_blank" rel="noopener">Sheepolution</a>';
  credit.innerHTML = translate(state.language, 'credit', { author: creditLink });

  hero.append(banner, title, subtitle, credit);
  dom.app.appendChild(hero);

  const mainSection = document.createElement('section');
  mainSection.className = 'chapters-section';

  mainSection.appendChild(buildSectionHeader(languageInfo.contentsTitle));
  mainSection.appendChild(buildChapterGrid(languageInfo.chapters));

  if (languageInfo.bonus && languageInfo.bonus.length > 0) {
    mainSection.appendChild(buildSectionHeader(languageInfo.bonusTitle));
    mainSection.appendChild(buildChapterGrid(languageInfo.bonus));
  }

  dom.app.appendChild(mainSection);
  restoreScrollProgress();
}

function buildSectionHeader(label) {
  const wrapper = document.createElement('div');
  wrapper.className = 'section-header';

  const title = document.createElement('h2');
  title.className = 'section-title';
  title.textContent = label;

  const divider = document.createElement('div');
  divider.className = 'divider';

  wrapper.append(title, divider);
  return wrapper;
}

function buildChapterGrid(chapters) {
  const grid = document.createElement('div');
  grid.className = 'chapter-grid';

  chapters.forEach(chapter => {
    const card = document.createElement('a');
    card.className = 'chapter-card';
    card.href = createChapterUrl(state.language, chapter.id);
    card.dataset.chapterId = chapter.id;

    const strong = document.createElement('strong');
    strong.textContent = chapter.title;

    card.append(strong);
    card.addEventListener('click', event => {
      event.preventDefault();
      persistCurrentScrollProgress();
      state.chapterId = chapter.id;
      state.scrollRestoration = loadScrollProgress(state.language, state.chapterId);
      updateUrl();
      render();
    });

    grid.appendChild(card);
  });

  return grid;
}

function createChapterUrl(language, id) {
  const params = new URLSearchParams();
  if (language !== state.data.defaultLanguage) {
    params.set('lang', language);
  }
  if (id) {
    params.set('chapter', id);
  }
  const query = params.toString();
  const base = window.location.pathname.replace(/index\.html$/, '');
  return query ? `${base}?${query}` : base;
}

function renderChapter(languageInfo, skipUrlUpdate = false, chapterOverride = null) {
  const chapter = chapterOverride || findChapter(languageInfo, state.chapterId);
  if (!chapter) {
    renderNotFound(languageInfo);
    return;
  }

  if (!skipUrlUpdate) {
    updateUrl(true);
  }

  const container = document.createElement('section');
  container.className = 'chapter-view';

  const header = document.createElement('div');
  header.className = 'chapter-header';

  const h1 = document.createElement('h1');
  h1.textContent = chapter.title;
  header.appendChild(h1);

  container.appendChild(header);

  const navTop = buildChapterNavigation(languageInfo, chapter.id);
  container.appendChild(navTop);

  const article = document.createElement('article');
  article.className = 'chapter-body';

  const loader = document.createElement('div');
  loader.className = 'loading';
  loader.textContent = translate(state.language, 'chapter.loading');
  article.appendChild(loader);

  container.appendChild(article);

  const navBottom = buildChapterNavigation(languageInfo, chapter.id);

  fetch(chapter.path)
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to load markdown');
      }
      return res.text();
    })
    .then(markdown => {
      article.innerHTML = renderMarkdown(markdown);
      setupCodeCopyButtons(article);
      container.appendChild(navBottom);
      article.scrollTop = 0;
      restoreScrollProgress();
    })
    .catch(() => {
      article.innerHTML = '';
      const notice = document.createElement('div');
      notice.className = 'notice';
      const title = document.createElement('h2');
      title.textContent = translate(state.language, 'chapter.loadError.title');
      const message = document.createElement('p');
      message.textContent = translate(state.language, 'chapter.loadError.message');
      notice.append(title, message);
      article.appendChild(notice);
      container.appendChild(navBottom);
      restoreScrollProgress();
    });

  dom.app.appendChild(container);
}

function setupCodeCopyButtons(root) {
  const buttons = root.querySelectorAll('.code-copy-button');
  buttons.forEach(button => {
    button.addEventListener('click', async () => {
      const codeBlock = button.closest('.code-block');
      if (!codeBlock) {
        return;
      }
      const codeElement = codeBlock.querySelector('code');
      if (!codeElement) {
        return;
      }
      const codeText = codeElement.textContent;
      const defaultLabel = button.dataset.label || '';
      const successLabel = button.dataset.success || defaultLabel;
      const errorLabel = button.dataset.error || defaultLabel;

      try {
        button.disabled = true;
        await copyCodeToClipboard(codeText);
        showCopyFeedback(button, successLabel, 'copied');
      } catch (error) {
        console.error(error);
        showCopyFeedback(button, errorLabel, 'error');
      } finally {
        button.disabled = false;
      }
    });
  });
}

async function copyCodeToClipboard(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    await navigator.clipboard.writeText(text);
    return;
  }

  return new Promise((resolve, reject) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (successful) {
        resolve();
      } else {
        reject(new Error('Copy command was unsuccessful'));
      }
    } catch (error) {
      document.body.removeChild(textarea);
      reject(error);
    }
  });
}

function showCopyFeedback(button, message, statusClass) {
  const labelElement = button.querySelector('.code-copy-label');
  if (!labelElement) {
    return;
  }

  if (button.__copyResetTimeout) {
    clearTimeout(button.__copyResetTimeout);
  }

  button.classList.remove('copied', 'error');
  if (statusClass) {
    button.classList.add(statusClass);
  }

  if (typeof button.blur === 'function') {
    button.blur();
  }

  labelElement.textContent = message;
  button.setAttribute('aria-label', message);
  button.setAttribute('title', message);

  const defaultLabel = button.dataset.label || message;
  button.__copyResetTimeout = window.setTimeout(() => {
    labelElement.textContent = defaultLabel;
    button.setAttribute('aria-label', defaultLabel);
    button.setAttribute('title', defaultLabel);
    button.classList.remove('copied', 'error');
    button.__copyResetTimeout = null;
  }, 2000);
}

function renderNotFound(languageInfo) {
  const section = document.createElement('section');
  section.className = 'notice';
  const heading = document.createElement('h2');
  heading.textContent = translate(state.language, 'chapter.notFound.title');
  const message = document.createElement('p');
  message.textContent = translate(state.language, 'chapter.notFound.message');
  const backLink = document.createElement('a');
  backLink.href = createChapterUrl(state.language, '');
  backLink.textContent = languageInfo.navigation.contents;
  backLink.addEventListener('click', event => {
    event.preventDefault();
    persistCurrentScrollProgress();
    state.chapterId = null;
    state.scrollRestoration = loadScrollProgress(state.language, state.chapterId);
    updateUrl();
    render();
  });
  section.append(heading, message, backLink);
  dom.app.appendChild(section);
}

function buildChapterNavigation(languageInfo, chapterId) {
  const wrapper = document.createElement('nav');
  wrapper.className = 'chapter-nav';

  const previous = document.createElement('a');
  const next = document.createElement('a');
  const home = document.createElement('a');
  home.textContent = languageInfo.navigation.contents;
  home.href = createChapterUrl(state.language, '');
  home.addEventListener('click', event => {
    event.preventDefault();
    persistCurrentScrollProgress();
    state.chapterId = null;
    state.scrollRestoration = loadScrollProgress(state.language, state.chapterId);
    updateUrl();
    render();
  });

  const { previous: prevChapter, next: nextChapter } = getChapterNeighbors(languageInfo, chapterId);

  if (prevChapter) {
    previous.textContent = languageInfo.navigation.previous;
    previous.href = createChapterUrl(state.language, prevChapter.id);
    previous.addEventListener('click', event => {
      event.preventDefault();
      persistCurrentScrollProgress();
      state.chapterId = prevChapter.id;
      state.scrollRestoration = loadScrollProgress(state.language, state.chapterId);
      updateUrl();
      render();
    });
  } else {
    previous.className = 'disabled';
    previous.textContent = languageInfo.navigation.previous;
    previous.tabIndex = -1;
    previous.setAttribute('aria-disabled', 'true');
  }

  if (nextChapter) {
    next.textContent = languageInfo.navigation.next;
    next.href = createChapterUrl(state.language, nextChapter.id);
    next.addEventListener('click', event => {
      event.preventDefault();
      persistCurrentScrollProgress();
      state.chapterId = nextChapter.id;
      state.scrollRestoration = loadScrollProgress(state.language, state.chapterId);
      updateUrl();
      render();
    });
  } else {
    next.className = 'disabled';
    next.textContent = languageInfo.navigation.next;
    next.tabIndex = -1;
    next.setAttribute('aria-disabled', 'true');
  }

  wrapper.append(previous, home, next);
  return wrapper;
}

function getChapterEntries(languageInfo) {
  if (!languageInfo) {
    return [];
  }
  return [
    ...(languageInfo.chapters || []),
    ...(languageInfo.bonus || [])
  ];
}

function getChapterNeighbors(languageInfo, chapterId) {
  const entries = getChapterEntries(languageInfo);
  const currentIndex = entries.findIndex(item => item.id === chapterId);
  return {
    previous: currentIndex > 0 ? entries[currentIndex - 1] : null,
    next: currentIndex >= 0 && currentIndex < entries.length - 1 ? entries[currentIndex + 1] : null
  };
}

function findChapter(languageInfoOrKey, chapterId) {
  const languageInfo = typeof languageInfoOrKey === 'string'
    ? state.data.languages[languageInfoOrKey]
    : languageInfoOrKey;
  if (!languageInfo) {
    return null;
  }
  return [...(languageInfo.chapters || []), ...(languageInfo.bonus || [])].find(ch => ch.id === chapterId) || null;
}

function renderMarkdown(markdown) {
  const normalized = markdown
    .replace(/\r\n?/g, '\n')
    .replace(/\t/g, '    ');
  const lines = normalized.split('\n');
  let html = '';
  let inCode = false;
  let codeLang = '';
  let codeLines = [];
  let listType = null;
  let paragraph = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      html += `<p>${parseInline(paragraph.join(' '))}</p>`;
      paragraph = [];
    }
  };

  const closeList = () => {
    if (listType) {
      html += listType === 'ol' ? '</ol>' : '</ul>';
      listType = null;
    }
  };

  const flushCodeBlock = () => {
    if (inCode) {
      html += buildCodeBlock(codeLines.join('\n'), codeLang);
      inCode = false;
      codeLang = '';
      codeLines = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (!inCode) {
        flushParagraph();
        closeList();
        inCode = true;
        codeLang = trimmed.slice(3).trim();
        codeLines = [];
      } else {
        flushCodeBlock();
      }
      return;
    }

    if (inCode) {
      codeLines.push(line);
      if (index === lines.length - 1) {
        flushCodeBlock();
      }
      return;
    }

    if (!trimmed) {
      flushParagraph();
      closeList();
      return;
    }

    if (/^(-{3,}|_{3,}|\*{3,})$/.test(trimmed.replace(/\s+/g, ''))) {
      flushParagraph();
      closeList();
      html += '<hr>';
      return;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      closeList();
      const level = headingMatch[1].length;
      html += `<h${level}>${parseInline(headingMatch[2].trim())}</h${level}>`;
      return;
    }

    const orderedMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      if (listType !== 'ol') {
        closeList();
        listType = 'ol';
        html += '<ol>';
      }
      html += `<li>${parseInline(orderedMatch[2])}</li>`;
      return;
    }

    const unorderedMatch = line.match(/^\s*[-+*]\s+(.*)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (listType !== 'ul') {
        closeList();
        listType = 'ul';
        html += '<ul>';
      }
      html += `<li>${parseInline(unorderedMatch[1])}</li>`;
      return;
    }

    paragraph.push(line);
  });

  flushCodeBlock();
  closeList();
  flushParagraph();

  return html;
}

function buildCodeBlock(code, language) {
  const normalizedLanguage = (language || '').trim();
  const languageKey = normalizedLanguage.toLowerCase();
  const classNames = [];
  if (normalizedLanguage) {
    classNames.push(`language-${sanitizeLanguage(normalizedLanguage)}`);
  }
  let contentHtml = escapeHtml(code);
  if (languageKey === 'lua') {
    contentHtml = highlightLua(code);
    classNames.push('hljs');
  } else if (CPP_LANGUAGE_ALIASES.has(languageKey)) {
    contentHtml = highlightCpp(code);
    classNames.push('hljs');
  }
  const classAttr = classNames.length ? ` class="${classNames.join(' ')}"` : '';
  const copyLabel = translate(state.language, 'chapter.copyCode.label');
  const copySuccess = translate(state.language, 'chapter.copyCode.success');
  const copyError = translate(state.language, 'chapter.copyCode.error');
  const copyLabelAttr = escapeHtml(copyLabel);
  const copySuccessAttr = escapeHtml(copySuccess);
  const copyErrorAttr = escapeHtml(copyError);
  const buttonAttributes = [
    'type="button"',
    'class="code-copy-button"',
    `aria-label="${copyLabelAttr}"`,
    `title="${copyLabelAttr}"`,
    `data-label="${copyLabelAttr}"`,
    `data-success="${copySuccessAttr}"`,
    `data-error="${copyErrorAttr}"`
  ].join(' ');
  const buttonIcon = '<svg class="code-copy-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg>';
  const button = `<button ${buttonAttributes}>${buttonIcon}<span class="visually-hidden code-copy-label">${escapeHtml(copyLabel)}</span></button>`;
  return `<div class="code-block">${button}<pre><code${classAttr}>${contentHtml}</code></pre></div>`;
}

function highlightLua(code) {
  const placeholders = [];

  const createPlaceholder = (className, value) => {
    const token = `${PLACEHOLDER_TOKEN}p${placeholders.length}q${PLACEHOLDER_TOKEN}`;
    placeholders.push({ className, value, token });
    return token;
  };

  let working = code;

  const multiLineCommentPattern = /--\[(=*)\[[\s\S]*?\]\1\]/g;
  working = working.replace(multiLineCommentPattern, match => createPlaceholder('hljs-comment', match));

  const multiLineStringPattern = /\[(=*)\[[\s\S]*?\]\1\]/g;
  working = working.replace(multiLineStringPattern, match => createPlaceholder('hljs-string', match));

  const stringPattern = /(['"])(?:\\.|(?!\1)[^\\\r\n])*\1/g;
  working = working.replace(stringPattern, match => createPlaceholder('hljs-string', match));

  const singleLineCommentPattern = /--(?!\[(=*)\[).*$/gm;
  working = working.replace(singleLineCommentPattern, match => createPlaceholder('hljs-comment', match));

  const numberPattern = /\b0x[\da-fA-F]+\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g;
  working = working.replace(numberPattern, match => createPlaceholder('hljs-number', match));

  const keywordPattern = /\b(?:and|break|do|else|elseif|end|false|for|function|if|in|local|nil|not|or|repeat|return|then|true|until|while)\b/g;
  working = working.replace(keywordPattern, match => createPlaceholder('hljs-keyword', match));

  const builtinPattern = /\b(?:assert|collectgarbage|dofile|ipairs|load|math|next|pairs|pcall|print|rawequal|rawget|rawset|require|select|self|string|table|tonumber|tostring|type|xpcall|coroutine|os|io|love)\b/g;
  working = working.replace(builtinPattern, match => createPlaceholder('hljs-built_in', match));

  let escaped = escapeHtml(working);

  placeholders.forEach(item => {
    const replacement = `<span class="${item.className}">${escapeHtml(item.value)}</span>`;
    escaped = escaped.split(item.token).join(replacement);
  });

  return escaped;
}

function highlightCpp(code) {
  const placeholders = [];

  const createPlaceholder = (className, value) => {
    const token = `${PLACEHOLDER_TOKEN}cpp${placeholders.length}${PLACEHOLDER_TOKEN}`;
    placeholders.push({ className, value, token });
    return token;
  };

  let working = code;

  const preprocessorPattern = /^[ \t]*#.*$/gm;
  working = working.replace(preprocessorPattern, match => createPlaceholder('hljs-meta', match));

  const rawStringPattern = /(?:u8|u|U|L)?R"([A-Za-z0-9_]{0,16})\(([\s\S]*?)\)\1"/g;
  working = working.replace(rawStringPattern, match => createPlaceholder('hljs-string', match));

  const stringPattern = /(?:u8|u|U|L)?"(?:\\.|[^"\\])*"/g;
  working = working.replace(stringPattern, match => createPlaceholder('hljs-string', match));

  const charPattern = /(?:u8|u|U|L)?'(?:\\.|[^'\\])+'/g;
  working = working.replace(charPattern, match => createPlaceholder('hljs-string', match));

  const multiLineCommentPattern = /\/\*[\s\S]*?\*\//g;
  working = working.replace(multiLineCommentPattern, match => createPlaceholder('hljs-comment', match));

  const singleLineCommentPattern = /\/\/.*$/gm;
  working = working.replace(singleLineCommentPattern, match => createPlaceholder('hljs-comment', match));

  const numberPattern = /\b(?:0x[0-9a-fA-F'._]+|0b[01'._]+|\d[\d'._]*(?:\.\d[\d'._]*)?(?:[eEpP][+-]?\d[\d'._]*)?)(?:[uUlLfF]*)\b/g;
  working = working.replace(numberPattern, match => createPlaceholder('hljs-number', match));

  const keywordPattern = /\b(?:alignas|alignof|asm|auto|bool|break|case|catch|char|char8_t|char16_t|char32_t|class|compl|concept|const|consteval|constexpr|constinit|const_cast|continue|co_await|co_return|co_yield|decltype|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|false|float|for|friend|goto|if|inline|int|long|mutable|namespace|new|noexcept|nullptr|operator|private|protected|public|register|reinterpret_cast|requires|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|true|try|typedef|typeid|typename|union|unsigned|using|virtual|void|volatile|wchar_t|while)\b/g;
  working = working.replace(keywordPattern, match => createPlaceholder('hljs-keyword', match));

  const builtinPattern = /\b(?:std|size_t|ptrdiff_t|int(?:8|16|32|64)_t|uint(?:8|16|32|64)_t|intmax_t|uintmax_t|intptr_t|uintptr_t)\b/g;
  working = working.replace(builtinPattern, match => createPlaceholder('hljs-built_in', match));

  let escaped = escapeHtml(working);

  placeholders.forEach(item => {
    const replacement = `<span class="${item.className}">${escapeHtml(item.value)}</span>`;
    escaped = escaped.split(item.token).join(replacement);
  });

  return escaped;
}

function sanitizeLanguage(value) {
  return value
    .toLowerCase()
    .replace(/[^0-9a-z+.#-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseInline(text) {
  const placeholders = [];

  const createPlaceholder = html => {
    const token = `${PLACEHOLDER_TOKEN}${placeholders.length}${PLACEHOLDER_TOKEN}`;
    placeholders.push(html);
    return token;
  };

  let working = text;

  working = working.replace(/`([^`]+)`/g, (_, code) => createPlaceholder(`<code>${escapeHtml(code)}</code>`));

  working = working.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g, (_, alt, url, title) => {
    const altEsc = escapeHtml(alt);
    const normalizedUrl = normalizeUrl(url);
    const urlEsc = escapeAttribute(normalizedUrl);
    const titleEsc = title ? escapeHtml(title) : '';
    const titleAttr = titleEsc ? ` title="${titleEsc}"` : '';
    return createPlaceholder(`<img src="${urlEsc}" alt="${altEsc}"${titleAttr}>`);
  });

  working = working.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    const labelEsc = escapeHtml(label);
    const normalizedUrl = normalizeUrl(url.trim());
    const urlEsc = escapeAttribute(normalizedUrl);
    return createPlaceholder(`<a href="${urlEsc}" target="_blank" rel="noopener">${labelEsc}</a>`);
  });

  working = escapeHtml(working);

  working = working.replace(/(\*\*|__)(.+?)\1/g, (_, __, content) => `<strong>${content}</strong>`);
  working = working.replace(/(\*|_)([^*_]+?)\1/g, (_, __, content) => `<em>${content}</em>`);

  placeholders.forEach((html, index) => {
    const token = `${PLACEHOLDER_TOKEN}${index}${PLACEHOLDER_TOKEN}`;
    working = working.split(token).join(html);
  });

  return working;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/\s/g, encodeURIComponent);
}

function normalizeUrl(rawUrl) {
  if (!rawUrl) {
    return rawUrl;
  }
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(rawUrl) || rawUrl.startsWith('//') || rawUrl.startsWith('#')) {
    return rawUrl;
  }
  if (rawUrl.startsWith('/')) {
    return `${basePath}${rawUrl.replace(/^\/+/, '')}`;
  }
  return rawUrl;
}

init().catch(error => {
  console.error(error);
  dom.app.innerHTML = '';
  const notice = document.createElement('div');
  notice.className = 'notice';
  const title = document.createElement('h2');
  title.textContent = 'Unable to load book configuration';
  const message = document.createElement('p');
  message.textContent = 'Check that book/chapters.json exists and is valid JSON.';
  notice.append(title, message);
  dom.app.appendChild(notice);
});
