const DEFAULT_LANGUAGE = 'en';

const dictionaries = {
  en: {
    footer: {
      note: 'Built as a static reader for the “How to LÖVE” book. Toggle the theme or language anytime.'
    },
    credit: 'Original book by {author}.',
    chapter: {
      loading: 'Loading chapter…',
      loadError: {
        title: 'Unable to load this chapter',
        message: 'Please check the repository files to confirm the markdown exists.'
      },
      notFound: {
        title: 'Chapter not found',
        message: 'We could not find the chapter you were looking for. Try selecting another one from the directory.'
      }
    }
  },
  'zh-cn': {
    footer: {
      note: '“How to LÖVE” 教程的静态阅读器。你可以随时切换主题和语言。'
    },
    credit: '原著来自 {author}。',
    chapter: {
      loading: '章节加载中…',
      loadError: {
        title: '无法加载该章节',
        message: '请检查仓库中的文件，确认对应的 Markdown 是否存在。'
      },
      notFound: {
        title: '未找到章节',
        message: '没有找到请求的章节，请返回目录选择其他章节。'
      }
    }
  },
  'zh-tw': {
    footer: {
      note: '「How to LÖVE」 教程的靜態閱讀器。你可以隨時切換主題和語言。'
    },
    credit: '原著來自 {author}。',
    chapter: {
      loading: '章節載入中…',
      loadError: {
        title: '無法載入該章節',
        message: '請檢查倉庫中的檔案，確認對應的 Markdown 是否存在。'
      },
      notFound: {
        title: '找不到章節',
        message: '沒有找到請求的章節，請返回目錄選擇其他章節。'
      }
    }
  }
};

function getDictionary(language) {
  return dictionaries[language] || dictionaries[DEFAULT_LANGUAGE] || {};
}

function resolveValue(language, key) {
  const parts = key.split('.');
  let current = getDictionary(language);
  for (const part of parts) {
    if (current && Object.prototype.hasOwnProperty.call(current, part)) {
      current = current[part];
    } else {
      current = undefined;
      break;
    }
  }
  if (current === undefined && language !== DEFAULT_LANGUAGE) {
    return resolveValue(DEFAULT_LANGUAGE, key);
  }
  return current;
}

function applyReplacements(value, replacements) {
  if (typeof value !== 'string') {
    return value;
  }
  return Object.keys(replacements || {}).reduce(
    (result, placeholder) => result.replace(new RegExp(`{${placeholder}}`, 'g'), replacements[placeholder]),
    value
  );
}

export function translate(language, key, replacements) {
  const value = resolveValue(language, key);
  if (value === undefined) {
    return key;
  }
  return applyReplacements(value, replacements);
}

export { DEFAULT_LANGUAGE };
