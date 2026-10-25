import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ar, en, dictionaries, translate } from '../locales/index.js';
import { getRetailerName as getRetailerNameFn, formatCurrency as formatCurrencyFn } from '../utils/i18n.js';

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

  // Apply layout direction, document language, and typography
  // Only console and dashboard pages should be RTL in Arabic; public pages are in English LTR
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const updateDirection = () => {
      const pathname = typeof window !== 'undefined' ? window.location.pathname || '/' : '/';
      const isConsoleRoute = pathname.startsWith('/console') || pathname.startsWith('/dashboard');

      const effectiveDir = (isConsoleRoute && isRtl) ? 'rtl' : 'ltr';
      const effectiveLang = isConsoleRoute ? lang : 'en';

      document.documentElement.setAttribute('dir', effectiveDir);
      document.documentElement.setAttribute('lang', effectiveLang);

      if (isConsoleRoute && isRtl) {
        document.body.style.fontFamily = "'Cairo', 'Alexandria', 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      } else {
        document.body.style.fontFamily = "'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      }
    };

    updateDirection();
    window.addEventListener('popstate', updateDirection);
    return () => window.removeEventListener('popstate', updateDirection);
  }, [lang, dir, isRtl]);

  const setLang = useCallback((updaterOrLang) => {
    setLangState((prev) => {
      const next = typeof updaterOrLang === 'function' ? updaterOrLang(prev) : updaterOrLang;
      if (next !== 'ar' && next !== 'en') return prev;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // Quota or sandboxed
        }
      }
      return next;
    });
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  }, [setLang]);

  /**
   * Main translation function with dot-notation path and token interpolation
   * e.g. t('matrix.badges.bestDeal', { retailer: 'أمازون مصر' })
   * e.g. t('nav.overview')
   */
  const t = useCallback(
    (key, params = {}, fallback = '') => {
      if (typeof params === 'string') {
        fallback = params;
        params = {};
      }
      return translate(lang, key, params, fallback);
    },
    [lang]
  );

  const getRetailerName = useCallback(
    (slugOrName) => {
      return getRetailerNameFn(slugOrName, lang);
    },
    [lang]
  );

  const formatCurrency = useCallback(
    (amount) => {
      return formatCurrencyFn(amount, lang);
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
    formatCurrency,
    dictionary: dictionaries[lang],
    dictionaries,
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
      t: (key, params = {}, fallback = '') => {
        if (typeof params === 'string') {
          fallback = params;
          params = {};
        }
        return translate('ar', key, params, fallback);
      },
      getRetailerName: (slug) => getRetailerNameFn(slug, 'ar'),
      formatCurrency: (val) => formatCurrencyFn(val, 'ar'),
      dictionary: ar,
      dictionaries,
    };
  }
  return context;
}
