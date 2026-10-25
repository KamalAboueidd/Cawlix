import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { en, dictionaries, translate } from '../locales/index.js';
import { getRetailerName as getRetailerNameFn, formatCurrency as formatCurrencyFn } from '../utils/i18n.js';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'cawlix_lang';

export function LanguageProvider({ children }) {
  // Purely English system
  const [lang] = useState('en');
  const isRtl = false;
  const dir = 'ltr';

  // Enforce English LTR and clean up any past Arabic localStorage keys
  useEffect(() => {
    if (typeof document !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('cawlix-lang');
      } catch {
        // Ignored
      }
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'en');
      document.body.style.fontFamily = "'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    }
  }, []);

  const setLang = useCallback(() => {}, []);
  const toggleLang = useCallback(() => {}, []);

  /**
   * Main translation function resolving exclusively to English
   */
  const t = useCallback(
    (key, params = {}, fallback = '') => {
      if (typeof params === 'string') {
        fallback = params;
        params = {};
      }
      return translate('en', key, params, fallback);
    },
    []
  );

  const getRetailerName = useCallback(
    (slugOrName) => {
      return getRetailerNameFn(slugOrName, 'en');
    },
    []
  );

  const formatCurrency = useCallback(
    (amount) => {
      return formatCurrencyFn(amount, 'en');
    },
    []
  );

  const value = {
    lang: 'en',
    setLang,
    toggleLang,
    isRtl: false,
    dir: 'ltr',
    t,
    getRetailerName,
    formatCurrency,
    dictionary: en,
    dictionaries,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: 'en',
      setLang: () => {},
      toggleLang: () => {},
      isRtl: false,
      dir: 'ltr',
      t: (key, params = {}, fallback = '') => {
        if (typeof params === 'string') {
          fallback = params;
          params = {};
        }
        return translate('en', key, params, fallback);
      },
      getRetailerName: (slug) => getRetailerNameFn(slug, 'en'),
      formatCurrency: (val) => formatCurrencyFn(val, 'en'),
      dictionary: en,
      dictionaries,
    };
  }
  return context;
}

