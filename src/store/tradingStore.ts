import { create } from "zustand";
import { defaultTradingConfig } from "@/config/trading";
import type { PlayerData } from "@/types/player";
import type { Trade, TradingConfig, TradingStats } from "@/types/trading";

interface TradingState {
  player: PlayerData | null;
  config: TradingConfig;
  connected: boolean;
  error: string | null;
  openTrades: Trade[];
  history: Trade[];
  lastSettled: Trade | null;
  setPlayer: (player: PlayerData) => void;
  setConfig: (config: TradingConfig) => void;
  setConnected: (value: boolean) => void;
  setError: (value: string | null) => void;
  setBalance: (balance: number) => void;
  addTrade: (trade: Trade) => void;
  updateTrade: (trade: Trade) => void;
  settleTrade: (trade: Trade) => void;
  setHistory: (trades: Trade[]) => void;
  dismissSettled: () => void;
}

export const useTradingStore = create<TradingState>((set) => ({
  player: null,
  config: defaultTradingConfig,
  connected: false,
  error: null,
  openTrades: [],
  history: [],
  lastSettled: null,
  setPlayer: (player) => set({ player }),
  setConfig: (config) => set({ config }),
  setConnected: (connected) => set({ connected }),
  setError: (error) => set({ error }),
  setBalance: (balance) =>
    set((state) => ({ player: state.player ? { ...state.player, balance } : state.player })),
  addTrade: (trade) => set((state) => ({ openTrades: [...state.openTrades, trade] })),
  updateTrade: (trade) =>
    set((state) => ({
      openTrades: state.openTrades.map((t) => (t.id === trade.id ? trade : t)),
    })),
  settleTrade: (trade) =>
    set((state) => ({
      openTrades: state.openTrades.filter((t) => t.id !== trade.id),
      history: [trade, ...state.history.filter((t) => t.id !== trade.id)],
      lastSettled: trade,
    })),
  setHistory: (history) => set({ history }),
  dismissSettled: () => set({ lastSettled: null }),
}));

export function computeStats(history: Trade[]): TradingStats {
  const settled = history.filter((t) => t.status === "won" || t.status === "lost");
  const wins = settled.filter((t) => t.status === "won");
  const losses = settled.filter((t) => t.status === "lost");
  const totalProfit = wins.reduce((sum, t) => sum + (t.payout - t.amount), 0);
  const totalLoss = losses.reduce((sum, t) => sum + t.amount, 0);
  const results = settled.map((t) => (t.status === "won" ? t.payout - t.amount : -t.amount));

  const counts = new Map<string, number>();
  for (const trade of settled) counts.set(trade.symbol, (counts.get(trade.symbol) ?? 0) + 1);
  let mostTradedAsset: string | null = null;
  let top = 0;
  for (const [symbol, count] of counts) {
    if (count > top) {
      top = count;
      mostTradedAsset = symbol;
    }
  }

  return {
    totalTrades: settled.length,
    wins: wins.length,
    losses: losses.length,
    winRate: settled.length ? (wins.length / settled.length) * 100 : 0,
    volume: settled.reduce((sum, t) => sum + t.amount, 0),
    totalProfit,
    totalLoss,
    bestTrade: results.length ? Math.max(...results) : 0,
    worstTrade: results.length ? Math.min(...results) : 0,
    mostTradedAsset,
  };
}
