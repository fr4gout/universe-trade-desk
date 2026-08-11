export type TradeDirection = "up" | "down";

export type TradeStatus = "open" | "settling" | "won" | "lost" | "cancelled";

export interface Trade {
  id: string;
  assetId: string;
  symbol: string;
  direction: TradeDirection;
  amount: number;
  entryPrice: number;
  exitPrice?: number;
  duration: number;
  openedAt: number;
  expiresAt: number;
  status: TradeStatus;
  payoutRate: number;
  payout: number;
  precision: number;
}

export interface TradingStats {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  volume: number;
  totalProfit: number;
  totalLoss: number;
  bestTrade: number;
  worstTrade: number;
  mostTradedAsset: string | null;
}

export interface TradingConfig {
  minimumTrade: number;
  maximumTrade: number;
  durations: number[];
  presets: number[];
  defaultPayout: number;
  defaultDuration: number;
  maxOpenTrades: number;
  cooldownMs: number;
  marketEnabled: boolean;
}
