import type { Candle } from "@/types/market";
import { CANDLE_HISTORY, CANDLE_INTERVAL_MS } from "@/config/trading";
import { randomBetween } from "./PriceGenerator";

export function bucketFor(timestamp: number): number {
  return Math.floor(timestamp / CANDLE_INTERVAL_MS) * CANDLE_INTERVAL_MS;
}

export function pushTick(candles: Candle[], price: number, now: number): void {
  const bucket = bucketFor(now);
  const last = candles[candles.length - 1];

  if (!last || last.timestamp !== bucket) {
    candles.push({
      timestamp: bucket,
      open: last ? last.close : price,
      high: price,
      low: price,
      close: price,
      volume: Math.round(randomBetween(40, 220)),
    });
    if (candles.length > CANDLE_HISTORY) candles.shift();
    return;
  }

  last.close = price;
  if (price > last.high) last.high = price;
  if (price < last.low) last.low = price;
  last.volume += Math.round(randomBetween(3, 26));
}

/** Builds a plausible warm-up history so the chart is never empty on open. */
export function seedCandles(
  step: () => number,
  now: number,
  count: number,
): Candle[] {
  const candles: Candle[] = [];
  const start = bucketFor(now) - count * CANDLE_INTERVAL_MS;
  for (let i = 0; i < count; i += 1) {
    const timestamp = start + i * CANDLE_INTERVAL_MS;
    const open = step();
    let high = open;
    let low = open;
    let close = open;
    for (let t = 0; t < 20; t += 1) {
      close = step();
      if (close > high) high = close;
      if (close < low) low = close;
    }
    candles.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume: Math.round(randomBetween(60, 320)),
    });
  }
  return candles;
}
