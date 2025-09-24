import { translate } from './i18n.js';

const state = {
  data: null,
  language: 'en',
  chapterId: null,
  theme: 'light'
};

const dom = {
  app: document.getElementById('app'),
  languageSelect: document.getElementById('language-select'),
  themeToggle: document.getElementById('theme-toggle'),
  brandLink: document.getElementById('brand-link'),
  footerNote: document.getElementById('footer-note')
};

const PLACEHOLDER_TOKEN = '\u0000';
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
  state.language = params.get('lang') && state.data.languages[params.get('lang')]
    ? params.get('lang')
    : state.data.defaultLanguage || 'en';
  const chapter = params.get('chapter');
  if (chapter && findChapter(state.language, chapter)) {
    state.chapterId = chapter;
  }

  setupTheme();
  setupLanguageSelect();
  setupEvents();
  render();
}

function setupTheme() {
  const storedTheme = window.localStorage.getItem('how-to-love:theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  state.theme = storedTheme || (prefersDark ? 'dark' : 'light');
  applyTheme();
}

function setupLanguageSelect() {
  dom.languageSelect.innerHTML = '';
  Object.entries(state.data.languages).forEach(([code, info]) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = info.label;
    dom.languageSelect.appendChild(option);
  });
  dom.languageSelect.value = state.language;
  updateFooter();
}

function setupEvents() {
  dom.languageSelect.addEventListener('change', event => {
    const nextLanguage = event.target.value;
    if (!state.data.languages[nextLanguage]) {
      return;
    }
    state.language = nextLanguage;
    state.chapterId = null;
    updateUrl();
    updateFooter();
    render();
  });

  dom.themeToggle.addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme();
  });

  dom.brandLink.addEventListener('click', event => {
    event.preventDefault();
    if (state.chapterId !== null) {
      state.chapterId = null;
      updateUrl();
      render();
    }
  });

  window.addEventListener('popstate', () => {
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
    dom.languageSelect.value = state.language;
    updateFooter();
    render(true);
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
  window.localStorage.setItem('how-to-love:theme', state.theme);
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

function render(skipUrlUpdate = false) {
  dom.app.innerHTML = '';
  const languageInfo = state.data.languages[state.language];
  if (!languageInfo) {
    dom.app.textContent = 'Language configuration missing.';
    return;
  }

  if (!state.chapterId) {
    if (!skipUrlUpdate) {
      updateUrl(true);
    }
    renderContents(languageInfo);
  } else {
    renderChapter(languageInfo);
  }
}

function renderContents(languageInfo) {
  const hero = document.createElement('section');
  hero.className = 'hero';

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

  hero.append(title, subtitle, credit);
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

  chapters.forEach((chapter, index) => {
    const card = document.createElement('a');
    card.className = 'chapter-card';
    card.href = createChapterUrl(state.language, chapter.id);
    card.dataset.chapterId = chapter.id;

    const label = document.createElement('span');
    label.textContent = chapterLabel(index, chapter.id);

    const strong = document.createElement('strong');
    strong.textContent = chapter.title;

    card.append(label, strong);
    card.addEventListener('click', event => {
      event.preventDefault();
      state.chapterId = chapter.id;
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

function chapterLabel(index, id) {
  if (id.startsWith('chapter')) {
    return `#${Number(index).toString().padStart(2, '0')}`;
  }
  return '☆';
}

function renderChapter(languageInfo) {
  const chapter = findChapter(languageInfo, state.chapterId);
  if (!chapter) {
    renderNotFound(languageInfo);
    return;
  }

  updateUrl(true);

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
      container.appendChild(navBottom);
      article.scrollTop = 0;
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
    });

  dom.app.appendChild(container);
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
    state.chapterId = null;
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
    state.chapterId = null;
    updateUrl();
    render();
  });

  const allEntries = [
    ...(languageInfo.chapters || []),
    ...(languageInfo.bonus || [])
  ];
  const currentIndex = allEntries.findIndex(item => item.id === chapterId);

  if (currentIndex > 0) {
    const prevChapter = allEntries[currentIndex - 1];
    previous.textContent = languageInfo.navigation.previous;
    previous.href = createChapterUrl(state.language, prevChapter.id);
    previous.addEventListener('click', event => {
      event.preventDefault();
      state.chapterId = prevChapter.id;
      updateUrl();
      render();
    });
  } else {
    previous.className = 'disabled';
    previous.textContent = languageInfo.navigation.previous;
    previous.tabIndex = -1;
    previous.setAttribute('aria-disabled', 'true');
  }

  if (currentIndex >= 0 && currentIndex < allEntries.length - 1) {
    const nextChapter = allEntries[currentIndex + 1];
    next.textContent = languageInfo.navigation.next;
    next.href = createChapterUrl(state.language, nextChapter.id);
    next.addEventListener('click', event => {
      event.preventDefault();
      state.chapterId = nextChapter.id;
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
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  let html = '';
  let inCode = false;
  let codeLang = '';
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

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (!inCode) {
        flushParagraph();
        closeList();
        inCode = true;
        codeLang = trimmed.slice(3).trim();
        html += `<pre><code${codeLang ? ` class="language-${escapeAttribute(codeLang)}"` : ''}>`;
      } else {
        html = html.replace(/\n?$/, '');
        html += '</code></pre>';
        inCode = false;
        codeLang = '';
      }
      return;
    }

    if (inCode) {
      html += `${escapeHtml(line)}\n`;
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

    if (index === lines.length - 1) {
      flushParagraph();
      closeList();
    }
  });

  if (inCode) {
    html = html.replace(/\n?$/, '');
    html += '</code></pre>';
  }

  closeList();
  flushParagraph();

  return html;
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
