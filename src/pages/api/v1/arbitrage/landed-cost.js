export const prerender = false;

export async function GET({ request }) {
  const url = new URL(request.url);
  const originHub = (url.searchParams.get('origin_hub') || 'JFK').toUpperCase();
  const weightKg = parseFloat(url.searchParams.get('weight_kg') || '1.5');
  const cifUsd = parseFloat(url.searchParams.get('cif_usd') || url.searchParams.get('source_price_usd') || '1299');
  const hsCode = url.searchParams.get('hs_code') || '8471.30';

  const fxRate = 48.5; // Commercial bank clearing rate (EGP/USD)
  const freightRatePerKg = originHub === 'DE' ? 14.0 : 16.5; // USD/kg
  const freightUsd = weightKg * freightRatePerKg;

  const basePriceEgp = Math.round(cifUsd * fxRate);
  const freightEgp = Math.round(freightUsd * fxRate);
  const declaredCifEgp = basePriceEgp + freightEgp;

  // Duty rate logic by HS Code
  let customsDutyRate = 0.05;
  let devFeeRate = 0.0;
  if (hsCode === '8471.30') {
    // Portable computers / laptops: 0% customs duty
    customsDutyRate = 0.0;
  } else if (hsCode === '8517.13') {
    // Smartphones: 10% customs + 5% dev fee
    customsDutyRate = 0.1;
    devFeeRate = 0.05;
  }

  const customsDutyEgp = Math.round(declaredCifEgp * customsDutyRate);
  const devFeeEgp = Math.round(declaredCifEgp * devFeeRate);
  const vatBaseEgp = declaredCifEgp + customsDutyEgp + devFeeEgp;
  const vat14Egp = Math.round(vatBaseEgp * 0.14);
  const bankCommissionEgp = Math.round(basePriceEgp * 0.03); // 3% international settlement spread

  const totalSettlementEgp = declaredCifEgp + customsDutyEgp + devFeeEgp + vat14Egp + bankCommissionEgp;

  const payload = {
    status: 'success',
    calculation_parameters: {
      origin_hub: originHub,
      source_price_usd: cifUsd,
      weight_kg: weightKg,
      hs_code: hsCode,
      effective_fx_rate: fxRate,
    },
    cost_breakdown_egp: {
      source_price_shelf: basePriceEgp,
      air_freight_cargo: freightEgp,
      declared_cif_subtotal: declaredCifEgp,
      customs_duty: customsDutyEgp,
      statutory_development_fee: devFeeEgp,
      statutory_vat_14pct: vat14Egp,
      banking_fx_commission_3pct: bankCommissionEgp,
      total_landed_settlement: totalSettlementEgp,
    },
    currency: 'EGP',
    calculated_at: new Date().toISOString(),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
