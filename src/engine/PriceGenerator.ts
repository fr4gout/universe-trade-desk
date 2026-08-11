/**
 * Deterministic-ish market simulation.
 *
 * Price movement is composed of a slow trend, momentum carry-over, a
 * mean-reversion pull towards the anchor price, volatility regimes, session
 * modifiers and gaussian noise, plus rare volatility spikes. This produces a
 * believable tape instead of a random walk.
 */

let seed = 0x2f6e2b1;

function random(): number {
  // xorshift32 — stable, fast, no allocations.
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return ((seed >>> 0) % 1_000_000) / 1_000_000;
}

export function gaussian(): number {
  const u = Math.max(random(), 1e-6);
  const v = Math.max(random(), 1e-6);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function randomBetween(min: number, max: number): number {
  return min + random() * (max - min);
}

export interface PriceState {
  price: number;
  anchor: number;
  trend: number;
  momentum: number;
  volatility: number;
  regime: number;
  spikeTicks: number;
  eventBias: number;
  eventTicks: number;
}

export function createPriceState(basePrice: number, volatility: number): PriceState {
  return {
    price: basePrice,
    anchor: basePrice,
    trend: gaussian() * 0.00002,
    momentum: 0,
    volatility,
    regime: 1,
    spikeTicks: 0,
    eventBias: 0,
    eventTicks: 0,
  };
}

/** Session modifier: markets breathe over the in-game day. */
function sessionModifier(now: number): number {
  const minuteOfDay = (now / 60_000) % 1_440;
  const wave = Math.sin((minuteOfDay / 1_440) * Math.PI * 2);
  return 0.82 + 0.35 * (wave * 0.5 + 0.5);
}

export function stepPrice(state: PriceState, now: number): number {
  // Trend drifts slowly and occasionally reverses.
  state.trend += gaussian() * 0.0000045;
  state.trend *= 0.9985;
  if (random() < 0.0016) state.trend = -state.trend * randomBetween(0.6, 1.3);

  // Volatility regime switching.
  if (random() < 0.0025) state.regime = randomBetween(0.55, 1.75);
  if (state.spikeTicks > 0) {
    state.spikeTicks -= 1;
  } else if (random() < 0.0008) {
    state.spikeTicks = Math.round(randomBetween(6, 22));
  }

  if (state.eventTicks > 0) {
    state.eventTicks -= 1;
    if (state.eventTicks === 0) state.eventBias = 0;
  }

  const spike = state.spikeTicks > 0 ? 2.6 : 1;
  const sigma =
    state.volatility * 0.00042 * state.regime * spike * sessionModifier(now);

  const meanReversion = (state.anchor - state.price) / state.anchor * 0.008;
  const noise = gaussian() * sigma;

  state.momentum = state.momentum * 0.86 + noise * 0.42;

  const delta =
    state.trend + state.momentum + meanReversion + noise + state.eventBias;

  state.price = Math.max(state.price * (1 + delta), state.anchor * 0.35);
  // The anchor slowly follows price so the market can genuinely drift.
  state.anchor += (state.price - state.anchor) * 0.0006;

  return state.price;
}

export function applyEventImpact(state: PriceState, impact: number): void {
  state.eventBias = impact / 4_000;
  state.eventTicks = Math.round(randomBetween(120, 320));
  state.regime = Math.min(2.2, state.regime * randomBetween(1.15, 1.6));
}
