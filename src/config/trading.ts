import type { TradingConfig } from "@/types/trading";
import type { AssetDefinition } from "@/types/market";

/**
 * Economy configuration. In a live FiveM deployment the server pushes an
 * overriding copy of this object through the PLAYER_DATA / OPEN_TERMINAL NUI
 * message, so nothing about the economy is hardcoded in the UI components.
 */
export const defaultTradingConfig: TradingConfig = {
  minimumTrade: 500,
  maximumTrade: 100_000,
  durations: [15, 30, 60, 120, 300],
  presets: [500, 1_000, 5_000, 10_000, 25_000],
  defaultPayout: 0.82,
  defaultDuration: 60,
  maxOpenTrades: 5,
  cooldownMs: 1_500,
  marketEnabled: true,
};

export const assetDefinitions: AssetDefinition[] = [
  {
    id: "btcusd",
    symbol: "BTC/USD",
    name: "Bitcoin",
    assetClass: "crypto",
    basePrice: 68_421.24,
    volatility: 1.65,
    precision: 2,
    payout: 0.85,
  },
  {
    id: "ethusd",
    symbol: "ETH/USD",
    name: "Ethereum",
    assetClass: "crypto",
    basePrice: 3_512.68,
    volatility: 1.45,
    precision: 2,
    payout: 0.84,
  },
  {
    id: "xauusd",
    symbol: "GOLD/USD",
    name: "Gold Spot",
    assetClass: "metal",
    basePrice: 2_318.44,
    volatility: 0.7,
    precision: 2,
    payout: 0.8,
  },
  {
    id: "wtiusd",
    symbol: "OIL/USD",
    name: "Crude Oil WTI",
    assetClass: "energy",
    basePrice: 82.16,
    volatility: 1.1,
    precision: 2,
    payout: 0.81,
  },
  {
    id: "eurusd",
    symbol: "EUR/USD",
    name: "Euro / Dollar",
    assetClass: "forex",
    basePrice: 1.0842,
    volatility: 0.32,
    precision: 4,
    payout: 0.78,
  },
  {
    id: "gbpusd",
    symbol: "GBP/USD",
    name: "Sterling / Dollar",
    assetClass: "forex",
    basePrice: 1.2694,
    volatility: 0.38,
    precision: 4,
    payout: 0.78,
  },
  {
    id: "usdjpy",
    symbol: "USD/JPY",
    name: "Dollar / Yen",
    assetClass: "forex",
    basePrice: 156.32,
    volatility: 0.42,
    precision: 3,
    payout: 0.78,
  },
  {
    id: "tech",
    symbol: "TECH",
    name: "Technology Index",
    assetClass: "index",
    basePrice: 18_942.5,
    volatility: 0.9,
    precision: 2,
    payout: 0.8,
  },
  {
    id: "energy",
    symbol: "ENERGY",
    name: "Energy Index",
    assetClass: "index",
    basePrice: 4_218.9,
    volatility: 0.95,
    precision: 2,
    payout: 0.8,
  },
  {
    id: "crypto",
    symbol: "CRYPTO",
    name: "Crypto Composite",
    assetClass: "index",
    basePrice: 1_284.36,
    volatility: 1.35,
    precision: 2,
    payout: 0.83,
  },
];

/** Chart candle interval in milliseconds. */
export const CANDLE_INTERVAL_MS = 5_000;
/** Simulation tick rate in milliseconds. */
export const TICK_INTERVAL_MS = 250;
/** Number of candles retained per asset. */
export const CANDLE_HISTORY = 220;
