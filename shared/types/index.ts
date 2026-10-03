// ─────────────────────────────────────────────────────────────────────────────
// Cawlix Tracker — Shared TypeScript Types
// ─────────────────────────────────────────────────────────────────────────────

// ── Currency & Pricing ───────────────────────────────────────────────────────

export type Currency = 'EGP' | 'USD' | 'EUR' | 'GBP' | 'AED';

export interface MonetaryAmount {
  value: number;
  currency: Currency;
}

// ── Retailer Registry ────────────────────────────────────────────────────────

export type RetailerId =
  | 'amazon_eg'
  | 'btech'
  | 'noon_eg'
  | 'tradeline'
  | 'carrefour_eg'
  | 'jumia_eg'
  | 'raneen'
  | '2b'
  | 'hisense_eg'
  | 'hyper_one'
  | 'amazon_us'
  | 'newegg'
  | 'bh_photo';

export type RetailerRegion = 'EG' | 'US' | 'EU' | 'AE';

export interface Retailer {
  id: RetailerId;
  name: string;
  region: RetailerRegion;
  currency: Currency;
  logoSlug: string;
  supportsInstallments: boolean;
  supportsCardCashback: boolean;
}

// ── Product ───────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  imageUrl?: string;
  specs: Record<string, string | number>;
  trackedSince: string; // ISO date
}

// ── Price Point ───────────────────────────────────────────────────────────────

export interface PricePoint {
  productId: string;
  retailerId: RetailerId;
  timestamp: string; // ISO datetime
  basePrice: number;
  currency: Currency;
  inStock: boolean;
  promoLabel?: string;
  sourceUrl: string;
}

// ── True-Cost Engine Types ────────────────────────────────────────────────────

export interface BankCard {
  id: string;
  issuer: string;
  network: 'Visa' | 'Mastercard' | 'Meeza';
  cashbackRate: number;        // 0.0 – 1.0 (e.g. 0.05 = 5%)
  cashbackCap?: number;        // max EGP cashback per transaction
  installmentFee?: number;     // flat admin fee in EGP
}

export interface TrueCostInput {
  basePrice: number;
  currency: Currency;
  couponDiscount?: number;
  bankCard?: BankCard;
  installmentMonths?: number;
  compulsoryShipping?: number;
}

export interface TrueCostResult {
  basePrice: number;
  couponSaving: number;
  cashbackSaving: number;
  shippingCost: number;
  installmentFee: number;
  effectiveCost: number;       // final out-of-pocket
  savingsTotal: number;
  savingsPct: number;
}

// ── Ghost Deal Detector Types ─────────────────────────────────────────────────

export type DealVerdict = 'AUTHENTIC_BARGAIN' | 'GHOST_MARKUP' | 'INCONCLUSIVE';

export interface PriceWindow {
  timestamp: string;
  price: number;
}

export interface GhostDealInput {
  windows: PriceWindow[];       // 90-day series (chronological)
  salePrice: number;
  saleCurrency: Currency;
  saleTimestamp: string;
}

export interface GhostDealResult {
  verdict: DealVerdict;
  authenticityScore: number;    // 0 – 100
  baselineMedian: number;
  preSpikeMax: number;
  inflationPct: number;
  actualDiscount: number;
  actualDiscountPct: number;
  flags: string[];
}

// ── Landed-Cost Engine Types ──────────────────────────────────────────────────

export type FreightMethod = 'air_express' | 'air_economy' | 'sea_freight';

export interface LandedCostInput {
  basePriceUSD: number;
  fxRateEGP: number;           // 1 USD = X EGP
  weightKg: number;
  freightMethod: FreightMethod;
  customsTariffRate: number;   // 0.0 – 1.0 (HS code rate)
  bankClearanceMarginRate?: number; // default 0.02 (2%)
}

export interface LandedCostResult {
  basePriceEGP: number;
  freightCostEGP: number;
  customsDutyEGP: number;
  vatEGP: number;
  bankClearanceEGP: number;
  totalLandedCostEGP: number;
  landedVsLocalMultiplier: number; // vs cheapest EG retailer if provided
}

// ── Telemetry Feed ────────────────────────────────────────────────────────────

export type TelemetryEventType =
  | 'PRICE_DROP'
  | 'PRICE_SPIKE'
  | 'RESTOCK'
  | 'OOS'
  | 'GHOST_FLAG'
  | 'ARBITRAGE_SIGNAL'
  | 'FX_UPDATE';

export interface TelemetryEvent {
  id: string;
  type: TelemetryEventType;
  retailerId: RetailerId;
  productId?: string;
  message: string;
  delta?: number;              // price change amount
  deltaPct?: number;
  timestamp: string;           // ISO datetime
  severity: 'info' | 'warn' | 'critical';
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface OTPRequest {
  email: string;
}

export interface OTPVerify {
  email: string;
  otp: string;
}

export interface Session {
  userId: string;
  email: string;
  accessToken: string;
  expiresAt: number; // unix timestamp
  plan: 'free' | 'pro' | 'enterprise';
}
