export const prerender = false;

interface LandedCostCalculationParameters {
  origin_hub: string;
  source_price_usd: number;
  weight_kg: number;
  hs_category: string;
  hs_code: string;
  effective_fx_rate: number;
  statutory_duty_pct: number;
}

interface LandedCostBreakdownEgp {
  source_price_shelf: number;
  air_freight_cargo: number;
  declared_cif_subtotal: number;
  customs_duty: number;
  statutory_vat_14pct: number;
  banking_fx_commission_3pct: number;
  total_landed_settlement: number;
}

interface LandedCostArbitrageResponse {
  status: 'success' | 'error';
  calculation_parameters: LandedCostCalculationParameters;
  cost_breakdown_egp: LandedCostBreakdownEgp;
  local_benchmark_comparison: {
    domestic_cairo_retail_egp: number;
    net_arbitrage_delta_egp: number;
    arbitrage_margin_pct: number;
    verdict: 'IMPORT_RECOMMENDED' | 'BUY_LOCAL_PREFERRED';
  };
  currency: 'EGP';
  calculated_at: string;
}

export async function GET({ request }: { request: Request }): Promise<Response> {
  const url = new URL(request.url);
  const originHub = (url.searchParams.get('origin_hub') || 'JFK').toUpperCase();
  const cifUsd = parseFloat(url.searchParams.get('cif_usd') || url.searchParams.get('source_price_usd') || '1299');
  const weightKg = parseFloat(url.searchParams.get('weight_kg') || '1.5');
  const hsCategory = (url.searchParams.get('hs_category') || 'laptop').toLowerCase();

  // Statutory Equations:
  // Commercial FX Rate: 48.50 EGP/USD
  const fxRate = 48.50;

  // Air Cargo Freight: USD 15 base + USD 12 per kg
  const freightUsd = 15.0 + (12.0 * weightKg);
  const freightEgp = Math.round(freightUsd * fxRate);
  const basePriceEgp = Math.round(cifUsd * fxRate);
  const declaredCifEgp = basePriceEgp + freightEgp;

  // Customs Tariff by category:
  // Laptops (0%), Phones (10%), Audio/Accessories (20%)
  let dutyPct = 0;
  let hsCode = '8471.30';

  if (hsCategory.includes('phone') || hsCategory.includes('mobile')) {
    dutyPct = 10;
    hsCode = '8517.13';
  } else if (hsCategory.includes('audio') || hsCategory.includes('accessory') || hsCategory.includes('display')) {
    dutyPct = 20;
    hsCode = '8518.30';
  } else {
    // Default: Laptop (0%)
    dutyPct = 0;
    hsCode = '8471.30';
  }

  const customsDutyEgp = Math.round(declaredCifEgp * (dutyPct / 100));

  // Statutory VAT: Compounded 14% on total CIF (Value + Air Freight + Duty)
  const vatBaseEgp = declaredCifEgp + customsDutyEgp;
  const statutoryVatEgp = Math.round(vatBaseEgp * 0.14);

  // Bank FX Markup Fee: 3.0% on transaction value
  const bankFxCommissionEgp = Math.round(basePriceEgp * 0.03);

  const totalLandedSettlementEgp = declaredCifEgp + customsDutyEgp + statutoryVatEgp + bankFxCommissionEgp;

  // Benchmark against domestic shelf retail
  const estimatedDomesticShelfEgp = Math.round(basePriceEgp * 1.35);
  const arbitrageDeltaEgp = estimatedDomesticShelfEgp - totalLandedSettlementEgp;
  const arbitrageMarginPct = parseFloat(((arbitrageDeltaEgp / estimatedDomesticShelfEgp) * 100).toFixed(1));
  const verdict = arbitrageDeltaEgp > 2500 ? 'IMPORT_RECOMMENDED' : 'BUY_LOCAL_PREFERRED';

  const payload: LandedCostArbitrageResponse = {
    status: 'success',
    calculation_parameters: {
      origin_hub: originHub,
      source_price_usd: cifUsd,
      weight_kg: weightKg,
      hs_category: hsCategory,
      hs_code: hsCode,
      effective_fx_rate: fxRate,
      statutory_duty_pct: dutyPct,
    },
    cost_breakdown_egp: {
      source_price_shelf: basePriceEgp,
      air_freight_cargo: freightEgp,
      declared_cif_subtotal: declaredCifEgp,
      customs_duty: customsDutyEgp,
      statutory_vat_14pct: statutoryVatEgp,
      banking_fx_commission_3pct: bankFxCommissionEgp,
      total_landed_settlement: totalLandedSettlementEgp,
    },
    local_benchmark_comparison: {
      domestic_cairo_retail_egp: estimatedDomesticShelfEgp,
      net_arbitrage_delta_egp: arbitrageDeltaEgp,
      arbitrage_margin_pct: arbitrageMarginPct,
      verdict: verdict,
    },
    currency: 'EGP',
    calculated_at: new Date().toISOString(),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
