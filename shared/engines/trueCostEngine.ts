// ─────────────────────────────────────────────────────────────────────────────
// True-Cost Engine
// Calculates exact out-of-pocket spend including all financial instruments.
//
// Formula:
//   Effective Cost = Base Price
//                  - Coupon Discount
//                  - Bank Card Cashback (capped if limit applies)
//                  + Compulsory Shipping
//                  + Installment Admin Fee
// ─────────────────────────────────────────────────────────────────────────────

import type { TrueCostInput, TrueCostResult } from '../types/index.js';

/**
 * Computes the true out-of-pocket cost after all discounts and fees.
 *
 * @param input - All cost components for a single purchase
 * @returns Fully itemized TrueCostResult
 */
export function computeTrueCost(input: TrueCostInput): TrueCostResult {
  const {
    basePrice,
    couponDiscount = 0,
    bankCard,
    installmentMonths,
    compulsoryShipping = 0,
  } = input;

  // 1. Coupon saving — direct reduction off base price
  const couponSaving = Math.max(0, Math.min(couponDiscount, basePrice));
  const priceAfterCoupon = basePrice - couponSaving;

  // 2. Bank cashback — applied to post-coupon price
  let cashbackSaving = 0;
  if (bankCard && bankCard.cashbackRate > 0) {
    const rawCashback = priceAfterCoupon * bankCard.cashbackRate;
    cashbackSaving = bankCard.cashbackCap !== undefined
      ? Math.min(rawCashback, bankCard.cashbackCap)
      : rawCashback;
  }

  // 3. Installment admin fee — flat fee charged by bank for 0%-interest plans
  let installmentFee = 0;
  if (bankCard?.installmentFee && installmentMonths && installmentMonths > 1) {
    installmentFee = bankCard.installmentFee;
  }

  // 4. Shipping — always additive
  const shippingCost = Math.max(0, compulsoryShipping);

  // 5. Effective cost
  const effectiveCost =
    priceAfterCoupon - cashbackSaving + shippingCost + installmentFee;

  const savingsTotal = couponSaving + cashbackSaving;
  const savingsPct = basePrice > 0 ? (savingsTotal / basePrice) * 100 : 0;

  return {
    basePrice,
    couponSaving,
    cashbackSaving,
    shippingCost,
    installmentFee,
    effectiveCost: Math.max(0, effectiveCost),
    savingsTotal,
    savingsPct,
  };
}

/**
 * Formats a cost result into a human-readable breakdown string (for console/debug).
 */
export function formatTrueCostBreakdown(result: TrueCostResult, currency = 'EGP'): string {
  const fmt = (n: number) => `${currency} ${n.toFixed(2)}`;
  return [
    `Base Price         ${fmt(result.basePrice)}`,
    `- Coupon Saving    ${fmt(result.couponSaving)}`,
    `- Cashback         ${fmt(result.cashbackSaving)}`,
    `+ Shipping         ${fmt(result.shippingCost)}`,
    `+ Installment Fee  ${fmt(result.installmentFee)}`,
    `────────────────────────────────`,
    `  Effective Cost   ${fmt(result.effectiveCost)}`,
    `  Total Savings    ${fmt(result.savingsTotal)} (${result.savingsPct.toFixed(1)}%)`,
  ].join('\n');
}
