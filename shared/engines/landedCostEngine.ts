// ─────────────────────────────────────────────────────────────────────────────
// Landed-Cost Engine
// Computes the full import economics for sourcing products from Amazon US,
// Newegg, or B&H Photo into Egypt.
//
// Formula:
//   Landed Cost = (Base USD × FX Rate)
//               + Freight Cost
//               + Customs Tariff (on CIF value)
//               + 14% Egyptian VAT (on CIF + duty)
//               + Bank Clearance Margin (default 2% on USD purchase)
//
// CIF = Cost + Insurance + Freight (standard customs valuation basis)
// ─────────────────────────────────────────────────────────────────────────────

import type {
  LandedCostInput,
  LandedCostResult,
  FreightMethod,
} from '../types/index.js';

// ── Freight rate tables (EGP per kg, approximate 2024 rates) ─────────────────

const FREIGHT_RATES_EGP_PER_KG: Record<FreightMethod, { base: number; perKg: number }> = {
  air_express: { base: 350, perKg: 120 }, // DHL Express / FedEx Priority
  air_economy: { base: 200, perKg: 60 },  // Aramex Economy / viaUSA
  sea_freight: { base: 800, perKg: 15 },  // Only viable for 50kg+
};

// Egyptian VAT rate (standard)
const VAT_RATE = 0.14;

// Insurance estimate as % of goods value (standard CIF add-on)
const INSURANCE_RATE = 0.005; // 0.5%

/**
 * Computes freight cost in EGP based on weight and method.
 */
function computeFreightCost(
  weightKg: number,
  method: FreightMethod,
  fxRate: number,
): number {
  const rate = FREIGHT_RATES_EGP_PER_KG[method];
  // Minimum 0.5 kg billable weight
  const billableWeight = Math.max(0.5, weightKg);
  return rate.base + rate.perKg * billableWeight;
}

/**
 * Computes the full landed cost of importing a product from the US into Egypt.
 *
 * @param input - Purchase and import parameters
 * @returns Fully itemized LandedCostResult in EGP
 */
export function computeLandedCost(input: LandedCostInput): LandedCostResult {
  const {
    basePriceUSD,
    fxRateEGP,
    weightKg,
    freightMethod,
    customsTariffRate,
    bankClearanceMarginRate = 0.02,
  } = input;

  // ── 1. Convert base price to EGP ─────────────────────────────────────────
  const basePriceEGP = basePriceUSD * fxRateEGP;

  // ── 2. Bank clearance margin (card issuer's FX premium on USD purchase) ──
  //       Applied to the USD amount, expressed in EGP
  const bankClearanceEGP = basePriceEGP * bankClearanceMarginRate;

  // ── 3. Freight cost in EGP ───────────────────────────────────────────────
  const freightCostEGP = computeFreightCost(weightKg, freightMethod, fxRateEGP);

  // ── 4. Insurance (for CIF calculation) ──────────────────────────────────
  const insuranceEGP = basePriceEGP * INSURANCE_RATE;

  // ── 5. CIF Value (Customs Inspection Focal Point) ────────────────────────
  //       CIF = Goods + Insurance + Freight
  const cifEGP = basePriceEGP + insuranceEGP + freightCostEGP;

  // ── 6. Customs tariff — applied on CIF value ─────────────────────────────
  const customsDutyEGP = cifEGP * Math.max(0, Math.min(1, customsTariffRate));

  // ── 7. VAT — applied on (CIF + Duty) ────────────────────────────────────
  const vatBase = cifEGP + customsDutyEGP;
  const vatEGP = vatBase * VAT_RATE;

  // ── 8. Total landed cost ─────────────────────────────────────────────────
  const totalLandedCostEGP =
    basePriceEGP +
    bankClearanceEGP +
    freightCostEGP +
    customsDutyEGP +
    vatEGP;

  return {
    basePriceEGP,
    freightCostEGP,
    customsDutyEGP,
    vatEGP,
    bankClearanceEGP,
    totalLandedCostEGP,
    landedVsLocalMultiplier: 0, // caller can set this vs cheapest local price
  };
}

/**
 * Given a landed cost result and the cheapest local EGP equivalent, compute
 * the multiplier and return an enriched result.
 */
export function enrichWithLocalComparison(
  result: LandedCostResult,
  cheapestLocalEGP: number,
): LandedCostResult {
  return {
    ...result,
    landedVsLocalMultiplier:
      cheapestLocalEGP > 0
        ? result.totalLandedCostEGP / cheapestLocalEGP
        : 0,
  };
}

/**
 * Formats a landed cost breakdown as a human-readable string.
 */
export function formatLandedCostBreakdown(
  result: LandedCostResult,
  basePriceUSD: number,
  fxRate: number,
): string {
  const fmt = (n: number) => `EGP ${n.toLocaleString('en-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtUSD = (n: number) => `USD ${n.toFixed(2)}`;

  return [
    `Base Price (US)      ${fmtUSD(basePriceUSD)} → ${fmt(result.basePriceEGP)}`,
    `Bank Clearance       ${fmt(result.bankClearanceEGP)}`,
    `Freight Cost         ${fmt(result.freightCostEGP)}`,
    `Customs Duty         ${fmt(result.customsDutyEGP)}`,
    `14% VAT              ${fmt(result.vatEGP)}`,
    `─────────────────────────────────────────────`,
    `Total Landed Cost    ${fmt(result.totalLandedCostEGP)}`,
    result.landedVsLocalMultiplier > 0
      ? `vs Cheapest Local    ${result.landedVsLocalMultiplier.toFixed(2)}x`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Returns suggested freight method based on weight and urgency.
 */
export function suggestFreightMethod(
  weightKg: number,
  urgencyDays: number,
): FreightMethod {
  if (urgencyDays <= 3 || weightKg < 5) return 'air_express';
  if (weightKg < 50) return 'air_economy';
  return 'sea_freight';
}
