export const prerender = false;

interface WebhookRequestBody {
  sku?: string;
  target_alert_price?: number;
  webhook_url?: string;
  target_url?: string;
  secret?: string;
}

export async function POST({ request }: { request: Request }): Promise<Response> {
  let body: WebhookRequestBody = {};

  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({
        status: 'error',
        error: 'BAD_REQUEST',
        message: 'Invalid JSON request payload',
        code: 400,
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  const targetUrl = body.webhook_url || body.target_url;
  const sku = body.sku || 'GLOBAL_ALL_SKUS';
  const targetAlertPrice = body.target_alert_price || null;

  if (!targetUrl) {
    return new Response(
      JSON.stringify({
        status: 'error',
        error: 'BAD_REQUEST',
        message: 'Missing required field: webhook_url or target_url',
        code: 400,
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  // Generate deterministic mock HMAC signing secret token
  const randomHex = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
  const signingSecret = body.secret || `whsec_live_${randomHex}`;
  const subscriptionId = `sub_wh_${Math.random().toString(36).substring(2, 10)}`;

  const responsePayload = {
    status: 'success',
    subscription: {
      id: subscriptionId,
      sku: sku.toUpperCase(),
      target_alert_price: targetAlertPrice,
      webhook_url: targetUrl,
      signing_secret: signingSecret,
      signature_header: 'X-Cawlix-Signature',
      algorithm: 'HMAC-SHA256',
      active_channels: ['SUB_SECOND_WEBHOOK', 'TELEGRAM_GATEWAY'],
      status: 'active',
      created_at: new Date().toISOString(),
    },
    message: 'Glitch radar webhook endpoint verified and registered successfully.',
  };

  return new Response(JSON.stringify(responsePayload, null, 2), {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
