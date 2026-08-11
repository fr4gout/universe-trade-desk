import { create } from "zustand";
import type { AssetSnapshot, MarketEvent, MarketStatus } from "@/types/market";
import { MarketEngine } from "@/engine/MarketEngine";

interface MarketState {
  assets: AssetSnapshot[];
  selectedAssetId: string;
  status: MarketStatus;
  events: MarketEvent[];
  search: string;
  ready: boolean;
  selectAsset: (id: string) => void;
  setSearch: (value: string) => void;
  setStatus: (status: MarketStatus) => void;
  syncFromEngine: () => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  assets: [],
  selectedAssetId: "btcusd",
  status: "open",
  events: [],
  search: "",
  ready: false,
  selectAsset: (id) => set({ selectedAssetId: id }),
  setSearch: (search) => set({ search }),
  setStatus: (status) => {
    MarketEngine.setStatus(status);
    set({ status });
  },
  syncFromEngine: () =>
    set({
      assets: MarketEngine.getSnapshots(),
      events: MarketEngine.events,
      ready: true,
    }),
}));

export const selectSelectedAsset = (state: MarketState): AssetSnapshot | undefined =>
  state.assets.find((asset) => asset.id === state.selectedAssetId);
