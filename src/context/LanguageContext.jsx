import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TRANSLATIONS, t as translateFn, getRetailerName as getRetailerNameFn } from '../utils/i18n.js';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'cawlix_lang';

export function LanguageProvider({ children }) {
  // Default to Arabic for native Egyptian platform focus, but respect localStorage
  const [lang, setLangState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'ar' || stored === 'en') return stored;
      } catch {
        // Fallback
      }
    }
    return 'ar';
  });

  const isRtl = lang === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';

  // Apply layout direction and document language
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', dir);
      document.documentElement.setAttribute('lang', lang);

      // Add arabic font class or style if needed
      if (lang === 'ar') {
        document.body.style.fontFamily = "'Cairo', 'Alexandria', 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      } else {
        document.body.style.fontFamily = "'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      }
    }
  }, [lang, dir]);

  const setLang = useCallback((newLang) => {
    if (newLang !== 'ar' && newLang !== 'en') return;
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, newLang);
      } catch {
        // Quota / sandboxed
      }
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  }, [setLang]);

  const t = useCallback(
    (key, fallback = '') => {
      return translateFn(key, lang, fallback);
    },
    [lang]
  );

  const getRetailerName = useCallback(
    (slugOrName) => {
      return getRetailerNameFn(slugOrName, lang);
    },
    [lang]
  );

  const value = {
    lang,
    setLang,
    toggleLang,
    isRtl,
    dir,
    t,
    getRetailerName,
    translations: TRANSLATIONS,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback if called outside provider
    return {
      lang: 'ar',
      setLang: () => {},
      toggleLang: () => {},
      isRtl: true,
      dir: 'rtl',
      t: (key, fallback = '') => translateFn(key, 'ar', fallback),
      getRetailerName: (slug) => getRetailerNameFn(slug, 'ar'),
      translations: TRANSLATIONS,
    };
  }
  return context;
}
