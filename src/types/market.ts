export type MarketStatus =
  | "open"
  | "closed"
  | "high_volatility"
  | "low_liquidity"
  | "maintenance";

export type AssetClass = "crypto" | "metal" | "energy" | "forex" | "index";

export interface AssetDefinition {
  id: string;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  basePrice: number;
  /** Per-tick volatility factor (relative). */
  volatility: number;
  /** Decimal places used when rendering the price. */
  precision: number;
  payout: number;
}

export interface AssetSnapshot {
  id: string;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  price: number;
  /** Absolute change over the session. */
  change: number;
  /** Percentage change over the session. */
  changePercent: number;
  precision: number;
  payout: number;
  status: MarketStatus;
  volatility: number;
  spark: number[];
}

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketEvent {
  id: string;
  title: string;
  detail: string;
  assetIds: string[];
  impact: number;
  createdAt: number;
}
