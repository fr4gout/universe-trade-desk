import { useEffect, useRef, useState } from "react";
import { MarketEngine } from "@/engine/MarketEngine";
import { useMarketStore } from "@/store/marketStore";

const LIST_THROTTLE_MS = 400;

/**
 * Bridges engine ticks into React at a throttled rate so the whole tree never
 * re-renders on every simulation tick.
 */
export function useMarketTicker(): void {
  useEffect(() => {
    MarketEngine.start();
    useMarketStore.getState().syncFromEngine();
    let last = 0;
    return MarketEngine.subscribe(() => {
      const now = Date.now();
      if (now - last < LIST_THROTTLE_MS) return;
      last = now;
      useMarketStore.getState().syncFromEngine();
    });
  }, []);
}

/** High-frequency price read for a single asset, isolated to one component. */
export function useLivePrice(assetId: string, intervalMs = 200): number {
  const [price, setPrice] = useState(() => MarketEngine.getPrice(assetId));
  const last = useRef(0);

  useEffect(() => {
    setPrice(MarketEngine.getPrice(assetId));
    return MarketEngine.subscribe(() => {
      const now = Date.now();
      if (now - last.current < intervalMs) return;
      last.current = now;
      setPrice(MarketEngine.getPrice(assetId));
    });
  }, [assetId, intervalMs]);

  return price;
}
