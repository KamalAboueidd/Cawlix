/**
 * DUAL-LANGUAGE LOCALIZATION & EGYPTIAN MARKET TERMINOLOGY (CAWLIX)
 * Central bridge connecting application views to the exhaustive dictionaries in src/locales/
 */
import { ar, en, dictionaries, translate } from '../locales/index.js';

export { ar, en, dictionaries };

export const RETAILER_NAMES = {
  AMZN_EG: { ar: 'أمازون مصر', en: 'Amazon Egypt' },
  NOON_EG: { ar: 'نون مصر', en: 'Noon Egypt' },
  BTECH_EG: { ar: 'بي تك', en: 'B.TECH' },
  TRADELINE: { ar: 'تريد لاين', en: 'Tradeline' },
  TRADELINE_EG: { ar: 'تريد لاين', en: 'Tradeline' },
  JUMIA_EG: { ar: 'جوميا مصر', en: 'Jumia Egypt' },
  '2B_EG': { ar: 'تو بي مصر', en: '2B Egypt' },
  TWOB_EG: { ar: 'تو بي مصر', en: '2B Egypt' },
  RAYA_EG: { ar: 'راية شوب', en: 'Raya Shop' },
  ELARABY_EG: { ar: 'مجموعة العربي', en: 'El Araby Group' },
  DUBAI_PHONE: { ar: 'دبي فون', en: 'Dubai Phone' },
  DUBAI_PHONE_EG: { ar: 'دبي فون', en: 'Dubai Phone' },
  DREAM_2000: { ar: 'دريم 2000', en: 'Dream 2000' },
  DREAM2000_EG: { ar: 'دريم 2000', en: 'Dream 2000' },
  VODAFONE_EG: { ar: 'فودافون شوب مصر', en: 'Vodafone Egypt' },
  CARREFOUR_EG: { ar: 'كارفور مصر', en: 'Carrefour Egypt' },
};

/**
 * Resolves localized retailer brand name safely from any platform slug or name string.
 * @param {string} slugOrName - e.g. 'AMZN_EG', 'noon', 'btech'
 * @param {'ar'|'en'} lang
 * @returns {string}
 */
export function getRetailerName(slugOrName, lang = 'ar') {
  if (!slugOrName) return lang === 'ar' ? 'متجر محلي' : 'Domestic Retailer';
  const raw = String(slugOrName).toUpperCase().trim();

  const dict = dictionaries[lang] || dictionaries.ar;
  if (dict.retailers && dict.retailers[raw]) {
    return dict.retailers[raw];
  }

  if (RETAILER_NAMES[raw]) {
    return RETAILER_NAMES[raw][lang] || RETAILER_NAMES[raw].ar;
  }

  // Flexible substring resolution
  if (raw.includes('AMAZON') || raw.includes('AMZN')) return dict.retailers?.AMZN_EG || 'أمازون مصر';
  if (raw.includes('NOON')) return dict.retailers?.NOON_EG || 'نون مصر';
  if (raw.includes('BTECH') || raw.includes('B.TECH')) return dict.retailers?.BTECH_EG || 'بي تك';
  if (raw.includes('TRADELINE')) return dict.retailers?.TRADELINE || 'تريد لاين';
  if (raw.includes('JUMIA')) return dict.retailers?.JUMIA_EG || 'جوميا مصر';
  if (raw.includes('2B') || raw.includes('TWOB')) return dict.retailers?.['2B_EG'] || 'تو بي مصر';
  if (raw.includes('RAYA')) return dict.retailers?.RAYA_EG || 'راية شوب';
  if (raw.includes('ELARABY') || raw.includes('EL ARABY') || raw.includes('ARABY')) return dict.retailers?.ELARABY_EG || 'مجموعة العربي';
  if (raw.includes('DUBAI')) return dict.retailers?.DUBAI_PHONE || 'دبي فون';
  if (raw.includes('DREAM')) return dict.retailers?.DREAM_2000 || 'دريم 2000';
  if (raw.includes('VODAFONE')) return dict.retailers?.VODAFONE_EG || 'فودافون شوب مصر';
  if (raw.includes('CARREFOUR')) return dict.retailers?.CARREFOUR_EG || 'كارفور مصر';

  return slugOrName;
}

/**
 * Format currency with localized Egyptian numbers and currency label.
 * e.g. 67499 -> "67,499 ج.م" (ar) or "67,499 EGP" (en)
 * @param {number|string} amount
 * @param {'ar'|'en'} lang
 * @returns {string}
 */
export function formatCurrency(amount, lang = 'ar') {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return lang === 'ar' ? '0 ج.م' : '0 EGP';
  }
  const formatted = Math.round(Number(amount)).toLocaleString('en-US');
  return lang === 'ar' ? `${formatted} ج.م` : `${formatted} EGP`;
}

/**
 * Translates a key with dot-notation, flat key, and token interpolation.
 * @param {string} key
 * @param {'ar'|'en'} lang
 * @param {object} [params]
 * @param {string} [fallback]
 * @returns {string}
 */
export function t(key, lang = 'ar', params = {}, fallback = '') {
  // Support both (key, lang, fallback) and (key, lang, params, fallback) signatures
  if (typeof params === 'string') {
    fallback = params;
    params = {};
  }
  return translate(lang, key, params, fallback);
}

// Legacy flat export for existing components
export const TRANSLATIONS = {
  ...ar,
};
