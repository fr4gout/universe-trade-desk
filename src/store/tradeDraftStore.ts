import { create } from "zustand";
import { defaultTradingConfig } from "@/config/trading";
import type { TradeDirection } from "@/types/trading";

interface TradeDraftState {
  amount: number;
  duration: number;
  direction: TradeDirection | null;
  setAmount: (amount: number) => void;
  setDuration: (duration: number) => void;
  setDirection: (direction: TradeDirection | null) => void;
  reset: () => void;
}

export const useTradeDraftStore = create<TradeDraftState>((set) => ({
  amount: defaultTradingConfig.presets[1] ?? 1_000,
  duration: defaultTradingConfig.defaultDuration,
  direction: null,
  setAmount: (amount) => set({ amount }),
  setDuration: (duration) => set({ duration }),
  setDirection: (direction) => set({ direction }),
  reset: () => set({ direction: null }),
}));
