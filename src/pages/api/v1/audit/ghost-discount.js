export const prerender = false;

export async function GET({ request }) {
  const url = new URL(request.url);
  const sku = url.searchParams.get('sku');
  const windowDays = parseInt(url.searchParams.get('window_days') || '90', 10);

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

  const baselineMedian = 28500;
  const currentShelf = 29900;
  const spikeMagnitude = 16100;
  const authenticityScore = 18;

  const payload = {
    status: 'success',
    sku: sku,
    window_days: windowDays,
    baseline_median_egp: baselineMedian,
    current_shelf_egp: currentShelf,
    advertised_discount_pct: 35.0,
    real_discount_pct: -4.9,
    pre_sale_spike_detected: true,
    spike_magnitude_egp: spikeMagnitude,
    authenticity_score: authenticityScore,
    verdict: 'CRITICAL_GHOST_MARKUP',
    evaluation_metrics: {
      rolling_window_days: windowDays,
      historical_sample_points: 1296,
      max_historical_egp: 44600,
      min_historical_egp: 28200,
      confidence_interval: 0.998,
    },
    evaluated_at: new Date().toISOString(),
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
