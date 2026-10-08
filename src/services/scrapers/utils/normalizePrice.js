/**
 * Institutional-grade Numeric Price Normalizer for Egyptian E-Commerce
 * Converts messy scraped currency strings (Western, Eastern Arabic numerals,
 * formatted thousands separators, currency symbols) into standardized float/integer numbers.
 */

// Eastern Arabic numerals mapping
const ARABIC_NUMERALS_MAP = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
  '٫': '.', // Arabic decimal separator
  '٬': '',  // Arabic thousands separator
  '،': '',  // Arabic comma
};

/**
 * Standardizes Eastern Arabic digits into Western digits
 * @param {string} str
 * @returns {string}
 */
export function convertArabicNumerals(str) {
  if (!str) return '';
  return String(str).replace(/[٠-٩٫٬،]/g, (match) => ARABIC_NUMERALS_MAP[match] || match);
}

/**
 * Normalizes any Egyptian price string or number into a clean positive float
 *
 * @param {string|number|null|undefined} raw
 * @returns {number|null} Standardized numeric price, or null if unparseable
 *
 * @example
 * normalizePrice("64,999 EGP") // 64999
 * normalizePrice("ج.م 64,999.50") // 64999.5
 * normalizePrice("٦٤,٩٩٩ ج.م") // 64999
 * normalizePrice("16.499,00 L.E") // 16499
 * normalizePrice(86999) // 86999
 */
export function normalizePrice(raw) {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') {
    return isNaN(raw) || raw < 0 ? null : Math.round(raw * 100) / 100;
  }

  // Convert to string and handle Eastern Arabic numerals
  let cleaned = convertArabicNumerals(String(raw).trim());

  // Remove common Egyptian currency tokens, Arabic letters, and directional markers
  cleaned = cleaned
    .replace(/[\u00A0\u200E\u200F\u202A-\u202E]/g, ' ') // zero-width / bidirectional chars
    .replace(/(EGP|LE|L\.E\.|E£|EGP\.|ج\.م|ج\.م\.|جنيه|جنيه مصري)/gi, ' ')
    .replace(/[\u0600-\u06FF]/g, ' ') // Strip any remaining Arabic characters
    .trim();

  // Strip leading non-digit characters (like dots or punctuation left over from currency)
  cleaned = cleaned.replace(/^[^\d]+/, '').replace(/[^\d]+$/, '').trim();

  // If already pure digits
  if (/^\d+$/.test(cleaned)) {
    return parseInt(cleaned, 10);
  }

  // Handle European formatting: "16.499,00" -> thousands separator is dot, decimal is comma
  if (/^\d{1,3}(\.\d{3})+(,\d{2})?$/.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    const val = parseFloat(cleaned);
    return isNaN(val) ? null : val;
  }

  // Handle standard Egyptian/US formatting: "16,499.00" -> thousands separator is comma, decimal is dot
  if (/^\d{1,3}(,\d{3})+(\.\d{2})?$/.test(cleaned)) {
    cleaned = cleaned.replace(/,/g, '');
    const val = parseFloat(cleaned);
    return isNaN(val) ? null : val;
  }

  // General fallback: strip everything except digits and decimal point
  const matches = cleaned.match(/\d+[\d.,]*/);
  if (!matches) return null;

  let candidate = matches[0];

  // If contains both ',' and '.'
  if (candidate.includes(',') && candidate.includes('.')) {
    if (candidate.lastIndexOf('.') > candidate.lastIndexOf(',')) {
      // "1,234.56" -> remove comma
      candidate = candidate.replace(/,/g, '');
    } else {
      // "1.234,56" -> remove dot, replace comma with dot
      candidate = candidate.replace(/\./g, '').replace(',', '.');
    }
  } else if (candidate.includes(',')) {
    // Check if comma is decimal (e.g., "64,50" -> 64.5) or thousands (e.g., "64,500" -> 64500)
    const parts = candidate.split(',');
    if (parts.length === 2 && parts[1].length === 3) {
      // Thousands separator
      candidate = candidate.replace(/,/g, '');
    } else if (parts.length === 2 && parts[1].length <= 2) {
      // Decimal separator
      candidate = parts[0] + '.' + parts[1];
    } else {
      candidate = candidate.replace(/,/g, '');
    }
  } else if (candidate.includes('.')) {
    // Check if dot is thousands separator (e.g. "64.500" -> 64500) or decimal ("64.5")
    const parts = candidate.split('.');
    if (parts.length === 2 && parts[1].length === 3) {
      candidate = candidate.replace(/\./g, '');
    }
  }

  const parsed = parseFloat(candidate);
  if (isNaN(parsed) || parsed <= 0) return null;

  return Math.round(parsed * 100) / 100;
}

/**
 * Normalizes stock status to boolean
 * @param {string|boolean|number} rawStatus
 * @returns {boolean}
 */
export function normalizeInStock(rawStatus) {
  if (typeof rawStatus === 'boolean') return rawStatus;
  if (typeof rawStatus === 'number') return rawStatus > 0;
  if (!rawStatus) return false;

  const s = String(rawStatus).toLowerCase();
  if (
    s.includes('instock') ||
    s.includes('in_stock') ||
    s.includes('in stock') ||
    s.includes('متوفر') ||
    s.includes('متاح') ||
    s.includes('available')
  ) {
    return true;
  }
  if (
    s.includes('outofstock') ||
    s.includes('out_of_stock') ||
    s.includes('out of stock') ||
    s.includes('غير متوفر') ||
    s.includes('نفذت الكمية') ||
    s.includes('soldout') ||
    s.includes('sold out')
  ) {
    return false;
  }
  return true;
}
