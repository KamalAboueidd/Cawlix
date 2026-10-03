export const prerender = false;

export async function GET({ request }) {
  const url = new URL(request.url);
  const sku = url.searchParams.get('sku');
  const retailer_id = (url.searchParams.get('retailer_id') || 'amzn_eg').toLowerCase();

  if (!sku) {
    return new Response(
      JSON.stringify({
        error: 'BAD_REQUEST',
        message: 'Missing required query parameter: sku',
        code: 400,
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    );
  }

  const RETAILER_NAMES = {
    amzn_eg: 'Amazon Egypt',
    noon_eg: 'Noon Egypt',
    btech_eg: 'B.TECH',
    raya_eg: 'RayaShop',
    '2b_eg': '2B Egypt',
    dream_eg: 'Dream 2000',
    shennawy_eg: 'El Shennawy',
    trade_eg: 'Tradeline',
    amzn_us: 'Amazon US Air Freight',
  };

  const retailerName = RETAILER_NAMES[retailer_id] || 'Amazon Egypt';
  const listedPrice = sku.toLowerCase().includes('tv') ? 24499 : sku.toLowerCase().includes('macbook') ? 169700 : 29900;

  const payload = {
    status: 'success',
    sku: sku,
    retailer_id: retailer_id,
    retailer_name: retailerName,
    listed_price_egp: listedPrice,
    currency: 'EGP',
    in_stock: true,
    stock_count: 14,
    seller: {
      name: `${retailerName} Direct 1P`,
      is_verified: true,
      rating: 4.9,
    },
    probe_latency_ms: 118,
    last_synced_at: new Date().toISOString(),
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
