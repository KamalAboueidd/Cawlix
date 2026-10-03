// ─────────────────────────────────────────────────────────────────────────────
// Telemetry Simulator
// Drives realistic Bloomberg-style WebSocket-equivalent event streams.
// Used to populate the TelemetryConsole during demo / offline mode.
// ─────────────────────────────────────────────────────────────────────────────

import type { TelemetryEvent, TelemetryEventType, RetailerId } from '@shared/types/index';

const RETAILERS: RetailerId[] = [
  'amazon_eg', 'btech', 'noon_eg', 'tradeline',
  'carrefour_eg', 'jumia_eg', 'raneen', '2b',
];

const PRODUCTS = [
  { id: 'p001', name: 'Samsung 55" QLED S90C' },
  { id: 'p002', name: 'iPhone 15 Pro 256GB' },
  { id: 'p003', name: 'Sony WH-1000XM5' },
  { id: 'p004', name: 'MacBook Air M3 13"' },
  { id: 'p005', name: 'LG OLED C3 65"' },
  { id: 'p006', name: 'PS5 Slim Digital' },
  { id: 'p007', name: 'Dyson V15 Detect' },
  { id: 'p008', name: 'RTX 4080 Super' },
];

let _eventCounter = 0;

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randFloat(min: number, max: number, dp = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(dp));
}

function generateEventId(): string {
  return `EVT-${Date.now()}-${(++_eventCounter).toString().padStart(4, '0')}`;
}

function buildPriceDropEvent(retailer: RetailerId, product: { id: string; name: string }): TelemetryEvent {
  const delta = randFloat(-500, -50);
  const deltaPct = randFloat(-18, -2, 1);
  return {
    id: generateEventId(),
    type: 'PRICE_DROP',
    retailerId: retailer,
    productId: product.id,
    message: `${product.name} dropped ${Math.abs(deltaPct)}% on ${retailer.replace(/_/g, ' ').toUpperCase()} — new low EGP ${Math.abs(delta + randFloat(1500, 8000, 0))}`,
    delta,
    deltaPct,
    timestamp: new Date().toISOString(),
    severity: Math.abs(deltaPct) > 10 ? 'critical' : 'info',
  };
}

function buildPriceSpikeEvent(retailer: RetailerId, product: { id: string; name: string }): TelemetryEvent {
  const delta = randFloat(200, 1500);
  const deltaPct = randFloat(5, 22, 1);
  return {
    id: generateEventId(),
    type: 'PRICE_SPIKE',
    retailerId: retailer,
    productId: product.id,
    message: `SPIKE: ${product.name} +${deltaPct}% on ${retailer.replace(/_/g, ' ').toUpperCase()} — possible pre-sale inflation`,
    delta,
    deltaPct,
    timestamp: new Date().toISOString(),
    severity: 'warn',
  };
}

function buildGhostFlagEvent(retailer: RetailerId, product: { id: string; name: string }): TelemetryEvent {
  const score = Math.floor(Math.random() * 35);
  return {
    id: generateEventId(),
    type: 'GHOST_FLAG',
    retailerId: retailer,
    productId: product.id,
    message: `GHOST MARKUP DETECTED — ${product.name} @ ${retailer.replace(/_/g, ' ').toUpperCase()} | Authenticity Score: ${score}/100`,
    timestamp: new Date().toISOString(),
    severity: 'critical',
  };
}

function buildArbitrageSignal(): TelemetryEvent {
  const product = rand(PRODUCTS);
  const spread = randFloat(800, 4500, 0);
  return {
    id: generateEventId(),
    type: 'ARBITRAGE_SIGNAL',
    retailerId: 'amazon_us',
    productId: product.id,
    message: `ARB SIGNAL — ${product.name}: US landed cost EGP ${spread} below cheapest local. Spread viable.`,
    delta: spread,
    timestamp: new Date().toISOString(),
    severity: 'info',
  };
}

function buildFxUpdate(): TelemetryEvent {
  const rate = randFloat(48.5, 50.2, 4);
  return {
    id: generateEventId(),
    type: 'FX_UPDATE',
    retailerId: 'amazon_us',
    message: `FX TICK: USD/EGP = ${rate} (CBE reference + bank margin 2%)`,
    timestamp: new Date().toISOString(),
    severity: 'info',
  };
}

function buildRestockEvent(retailer: RetailerId, product: { id: string; name: string }): TelemetryEvent {
  return {
    id: generateEventId(),
    type: 'RESTOCK',
    retailerId: retailer,
    productId: product.id,
    message: `RESTOCK: ${product.name} back in stock @ ${retailer.replace(/_/g, ' ').toUpperCase()}`,
    timestamp: new Date().toISOString(),
    severity: 'info',
  };
}

export function generateTelemetryEvent(): TelemetryEvent {
  const roll = Math.random();
  const retailer = rand(RETAILERS);
  const product = rand(PRODUCTS);

  if (roll < 0.30) return buildPriceDropEvent(retailer, product);
  if (roll < 0.50) return buildPriceSpikeEvent(retailer, product);
  if (roll < 0.62) return buildGhostFlagEvent(retailer, product);
  if (roll < 0.74) return buildArbitrageSignal();
  if (roll < 0.85) return buildFxUpdate();
  return buildRestockEvent(retailer, product);
}

/**
 * Starts the telemetry simulation loop.
 * Returns a cleanup function that stops the loop.
 *
 * @param onEvent - Callback fired each time a new event is generated
 * @param intervalMs - Target interval between events (default: 1200ms)
 */
export function startTelemetrySimulator(
  onEvent: (event: TelemetryEvent) => void,
  intervalMs = 1200,
): () => void {
  // Emit one burst of events immediately (cold start feel)
  const burst = Math.floor(Math.random() * 4) + 2;
  for (let i = 0; i < burst; i++) {
    setTimeout(() => onEvent(generateTelemetryEvent()), i * 80);
  }

  const id = setInterval(() => {
    // Occasionally emit 2 events close together for realism
    const count = Math.random() < 0.15 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      setTimeout(() => onEvent(generateTelemetryEvent()), i * 60);
    }
  }, intervalMs + Math.random() * 600 - 300); // ±300ms jitter

  return () => clearInterval(id);
}
