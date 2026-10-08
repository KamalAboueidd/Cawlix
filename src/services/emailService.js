/**
 * BREVO TRANSACTIONAL EMAIL SERVICE (CAWLIX)
 * Dispatches real-time price drop, All-Time Low (ATL), and arbitrage alert emails.
 * Supports Brevo SMTP REST API with Pitch-Black HTML templates and graceful fallback.
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Generates an institutional Pitch-Black HTML email template for price drop alerts
 * @param {Object} alert
 * @returns {string} HTML content
 */
export function generateAlertEmailHtml(alert) {
  const {
    productTitle,
    retailerName,
    oldPrice,
    newPrice,
    savingsEgp,
    savingsPct,
    type,
    listingUrl,
    productId,
  } = alert;

  const typeLabels = {
    ALL_TIME_LOW: 'ALL-TIME LOW (ATL) DETECTED',
    MEDIAN_ARBITRAGE: 'MEDIAN ARBITRAGE ADVANTAGE',
    PRICE_CRASH: 'FLASH CRASH / PRICE ANOMALY',
  };

  const badgeText = typeLabels[type] || 'PRICE DROP ALERT';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Cawlix Price Anomaly Alert</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #000000;
      color: #EDEDED;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    .wrapper {
      width: 100%;
      background-color: #000000;
      padding: 32px 16px;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background-color: #0A0A0A;
      border: 1px solid #1F1F1F;
      border-radius: 8px;
      overflow: hidden;
    }
    .header {
      padding: 24px;
      border-bottom: 1px solid #1F1F1F;
      background-color: #000000;
    }
    .brand {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #FFFFFF;
      text-transform: uppercase;
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      color: #10B981;
      background-color: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 3px 8px;
      border-radius: 4px;
      letter-spacing: 0.04em;
      font-family: monospace;
      margin-top: 10px;
    }
    .content {
      padding: 24px;
    }
    .title {
      font-size: 18px;
      font-weight: 600;
      color: #EDEDED;
      margin: 0 0 16px 0;
      line-height: 1.4;
    }
    .price-box {
      background-color: #000000;
      border: 1px solid #1F1F1F;
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 20px;
    }
    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 6px;
    }
    .old-price {
      font-size: 14px;
      color: #777777;
      text-decoration: line-through;
      font-family: monospace;
    }
    .new-price {
      font-size: 26px;
      font-weight: 700;
      color: #10B981;
      font-family: monospace;
      letter-spacing: -0.02em;
    }
    .savings {
      font-size: 13px;
      color: #10B981;
      font-family: monospace;
      font-weight: 600;
    }
    .retailer {
      font-size: 12px;
      color: #888888;
      margin-top: 4px;
    }
    .cta-btn {
      display: inline-block;
      background-color: #EDEDED;
      color: #000000;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      padding: 10px 20px;
      border-radius: 6px;
      margin-top: 8px;
    }
    .footer {
      padding: 18px 24px;
      border-top: 1px solid #1A1A1A;
      font-size: 11px;
      color: #555555;
      font-family: monospace;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="brand">CAWLIX TELEMETRY</div>
        <div class="badge">${badgeText}</div>
      </div>
      <div class="content">
        <h1 class="title">${productTitle}</h1>
        <div class="price-box">
          <div class="retailer">Domestic Node: <strong>${retailerName}</strong></div>
          <div style="margin-top: 10px;">
            ${oldPrice ? `<span class="old-price">EGP ${oldPrice.toLocaleString()}</span> &nbsp;` : ''}
            <span class="new-price">EGP ${newPrice.toLocaleString()}</span>
          </div>
          <div class="savings">
            ✓ Savings: EGP ${savingsEgp.toLocaleString()} (-${savingsPct}%)
          </div>
        </div>
        <a href="${listingUrl || 'https://cawlix.com'}" class="cta-btn">Inspect in Market Matrix →</a>
      </div>
      <div class="footer">
        Cawlix 12-Platform Domestic Surveillance · Cairo, Egypt · High-Fidelity Shelf Auditing
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Dispatches an alert email through Brevo SMTP API or local development proxy
 * @param {Object} options
 * @param {string} options.toEmail
 * @param {string} [options.toName]
 * @param {Object} options.alert
 * @returns {Promise<Object>}
 */
export async function sendBrevoAlertEmail({ toEmail, toName = 'Cawlix Subscriber', alert }) {
  if (!toEmail) {
    return { success: false, error: 'Recipient email is required' };
  }

  const apiKey =
    typeof process !== 'undefined' && process.env?.BREVO_API_KEY
      ? process.env.BREVO_API_KEY
      : typeof import.meta !== 'undefined' && import.meta.env?.VITE_BREVO_API_KEY
      ? import.meta.env.VITE_BREVO_API_KEY
      : null;

  const subject = `⚡ [Cawlix Alert] ${alert.type.replace(/_/g, ' ')}: ${alert.productTitle} at ${alert.retailerName} (EGP ${alert.newPrice.toLocaleString()})`;
  const htmlContent = generateAlertEmailHtml(alert);

  // If no live Brevo API key is configured, log simulated dispatch gracefully
  if (!apiKey || apiKey === 'YOUR_BREVO_API_KEY') {
    console.info(`[Brevo SMTP Simulation] Dispatching price drop alert to ${toEmail}:`, {
      subject,
      product: alert.productTitle,
      newPrice: alert.newPrice,
      savings: alert.savingsEgp,
    });
    return {
      success: true,
      simulated: true,
      recipient: toEmail,
      subject,
      timestamp: new Date().toISOString(),
    };
  }

  // Live Brevo REST API Dispatch
  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: 'Cawlix Intelligence',
          email: 'alerts@cawlix.com',
        },
        to: [
          {
            email: toEmail,
            name: toName,
          },
        ],
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.warn('[Brevo API Response Error]:', response.status, errBody);
      return { success: false, status: response.status, error: errBody };
    }

    const data = await response.json();
    return { success: true, messageId: data.messageId, recipient: toEmail };
  } catch (error) {
    console.error('[Brevo SMTP Dispatch Failure]:', error);
    return { success: false, error: error.message };
  }
}
