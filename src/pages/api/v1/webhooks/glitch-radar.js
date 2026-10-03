export const prerender = false;

export async function POST({ request }) {
  let body = {};
  try {
    body = await request.json();
  } catch (err) {
    // Empty body fallback
  }

  const targetUrl = body.target_url;
  const thresholdPct = body.threshold_pct || 35.0;
  const signingSecret = body.secret || 'whsec_live_99d10e823b49910c2847aef9';

  if (!targetUrl) {
    return new Response(
      JSON.stringify({
        error: 'BAD_REQUEST',
        message: 'Missing required field in JSON payload: target_url',
        code: 400,
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    );
  }

  const payload = {
    status: 'active',
    subscription_id: 'sub_wh_091823fa',
    target_url: targetUrl,
    threshold_pct: thresholdPct,
    signing_secret: signingSecret,
    signature_header: 'X-Cawlix-Signature',
    algorithm: 'HMAC-SHA256',
    active_channels: ['LOW_LATENCY_WEBHOOK', 'TELEGRAM_GATEWAY'],
    instructions:
      'Compute HMAC-SHA256 of the raw webhook request body using your signing_secret and compare with X-Cawlix-Signature header.',
    created_at: new Date().toISOString(),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
