import { ar } from './ar.js';
import { en } from './en.js';

export { ar, en };

export const dictionaries = { ar, en };

/**
 * Safely resolves a nested dot-notation key (e.g. 'nav.overview' or 'matrix.badges.bestDeal')
 * or a flat key ('nav_overview') from a dictionary.
 * Supports token interpolation: e.g. {retailer: 'أمازون مصر'} into "أرخص سعر لدى {retailer}"
 */
export function translate(lang = 'ar', key = '', params = {}, fallback = '') {
  const dict = dictionaries[lang] || dictionaries.ar;
  const fallbackDict = lang === 'ar' ? dictionaries.en : dictionaries.ar;

  if (!key) return fallback;

  let val = null;

  // 1. Try dot-notation path: 'matrix.badges.bestDeal'
  if (key.includes('.')) {
    const parts = key.split('.');
    let current = dict;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        current = null;
        break;
      }
    }
    if (typeof current === 'string') {
      val = current;
    } else {
      // Try fallback dictionary
      let fbCurrent = fallbackDict;
      for (const part of parts) {
        if (fbCurrent && typeof fbCurrent === 'object' && part in fbCurrent) {
          fbCurrent = fbCurrent[part];
        } else {
          fbCurrent = null;
          break;
        }
      }
      if (typeof fbCurrent === 'string') val = fbCurrent;
    }
  }

  // 2. Try direct key match: dict[key]
  if (val === null && dict && typeof dict[key] === 'string') {
    val = dict[key];
  }

  // 3. Try fallback dictionary direct match
  if (val === null && fallbackDict && typeof fallbackDict[key] === 'string') {
    val = fallbackDict[key];
  }

  // If still not found, return user-provided fallback or key itself
  if (val === null) {
    val = fallback || key;
  }

  // 4. Token interpolation: replace {paramName} with params[paramName]
  if (typeof val === 'string' && params && typeof params === 'object') {
    return val.replace(/\{(\w+)\}/g, (match, token) => {
      return token in params ? String(params[token]) : match;
    });
  }

  return val;
}
