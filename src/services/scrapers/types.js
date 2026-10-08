/**
 * Normalized Listing Data Contract & Scraping Subsystem Types
 *
 * @typedef {Object} NormalizedListingData
 * @property {string} platformSlug - Standardized platform identifier (e.g., 'TRADELINE', 'BTECH_EG', '2B_EG', 'AMZN_EG', 'NOON_EG')
 * @property {number} currentPrice - Normalized current shelf price in EGP
 * @property {number|null} originalPrice - Normalized crossed-out original price, or null if no discount
 * @property {'EGP'} currency - Currency identifier, strictly 'EGP' for Egyptian domestic market
 * @property {boolean} inStock - Inventory status (true = in stock, false = out of stock)
 * @property {number} [stockCount] - Specific unit count if reported by retailer
 * @property {number} rating - Average customer review rating (0.0 to 5.0)
 * @property {number} reviewsCount - Total verified review count
 * @property {string} warrantyInfo - Official domestic warranty coverage statement
 * @property {string} materialNotes - Sourced material specifications or Egyptian packaging notes
 * @property {string} scrapedAt - ISO timestamp of when the audit occurred
 * @property {string} [sourceUrl] - Original product URL that was audited
 * @property {string} [extractionMethod] - Strategy used ('JSON_LD', 'API_PAYLOAD', 'MICRODATA', 'DOM_FALLBACK')
 */

/**
 * Standard Platform Slugs
 */
export const PLATFORM_SLUGS = {
  TRADELINE: 'TRADELINE',
  BTECH: 'BTECH_EG',
  TWOB: '2B_EG',
  AMAZON: 'AMZN_EG',
  NOON: 'NOON_EG',
  JUMIA: 'JUMIA_EG',
  RAYA: 'RAYA_EG',
  ELARABY: 'ELARABY_EG',
  DUBAI_PHONE: 'DUBAI_PHONE',
  DREAM_2000: 'DREAM_2000',
  VODAFONE: 'VODAFONE_EG',
  CARREFOUR: 'CARREFOUR_EG',
};
