import type {
  AssetSnapshot,
  Candle,
  MarketEvent,
  MarketStatus,
} from "@/types/market";
import { assetDefinitions, TICK_INTERVAL_MS } from "@/config/trading";
import {
  applyEventImpact,
  createPriceState,
  randomBetween,
  stepPrice,
  type PriceState,
} from "./PriceGenerator";
import { pushTick, seedCandles } from "./CandleGenerator";

interface AssetRuntime {
  snapshot: AssetSnapshot;
  state: PriceState;
  candles: Candle[];
  sessionOpen: number;
}

type Listener = () => void;

const EVENT_TEMPLATES: Array<Omit<MarketEvent, "id" | "createdAt">> = [
  {
    title: "TECH SECTOR SURGES",
    detail: "Index buying accelerates, volatility increased",
    assetIds: ["tech"],
    impact: 2.4,
  },
  {
    title: "GLOBAL MARKET PRESSURE",
    detail: "Risk-off flows across majors",
    assetIds: ["eurusd", "gbpusd", "tech"],
    impact: -1.8,
  },
  {
    title: "ENERGY DEMAND INCREASE",
    detail: "Crude inventories drawn down sharply",
    assetIds: ["wtiusd", "energy"],
    impact: 2.1,
  },
  {
    title: "CRYPTO VOLATILITY SPIKE",
    detail: "Liquidity thins across digital assets",
    assetIds: ["btcusd", "ethusd", "crypto"],
    impact: -2.9,
  },
  {
    title: "CURRENCY STABILITY",
    detail: "Central bank guidance calms FX desks",
    assetIds: ["eurusd", "gbpusd", "usdjpy"],
    impact: 0.6,
  },
  {
    title: "SAFE HAVEN BID",
    detail: "Metals bid as sentiment deteriorates",
    assetIds: ["xauusd"],
    impact: 1.4,
  },
];

class MarketEngineImpl {
  private runtimes = new Map<string, AssetRuntime>();
  private listeners = new Set<Listener>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private started = false;
  private eventTimer = 0;

  events: MarketEvent[] = [];
  status: MarketStatus = "open";

  start(): void {
    if (this.started) return;
    this.started = true;
    const now = Date.now();

    for (const def of assetDefinitions) {
      const state = createPriceState(def.basePrice, def.volatility);
      const candles = seedCandles(() => stepPrice(state, now), now, 160);
      const sessionOpen = candles[0]?.open ?? def.basePrice;
      this.runtimes.set(def.id, {
        state,
        candles,
        sessionOpen,
        snapshot: {
          id: def.id,
          symbol: def.symbol,
          name: def.name,
          assetClass: def.assetClass,
          price: state.price,
          change: state.price - sessionOpen,
          changePercent: ((state.price - sessionOpen) / sessionOpen) * 100,
          precision: def.precision,
          payout: def.payout,
          status: "open",
          volatility: def.volatility,
          spark: candles.slice(-32).map((c) => c.close),
        },
      });
    }

    this.timer = setInterval(() => this.tick(), TICK_INTERVAL_MS);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.started = false;
    this.runtimes.clear();
  }

  private tick(): void {
    const now = Date.now();
    for (const runtime of this.runtimes.values()) {
      const price = stepPrice(runtime.state, now);
      pushTick(runtime.candles, price, now);
      const snap = runtime.snapshot;
      snap.price = price;
      snap.change = price - runtime.sessionOpen;
      snap.changePercent = (snap.change / runtime.sessionOpen) * 100;
      snap.status = this.status;
    }

    this.eventTimer += TICK_INTERVAL_MS;
    if (this.eventTimer > 45_000 && Math.random() < 0.05) {
      this.eventTimer = 0;
      this.emitEvent();
    }

    for (const listener of this.listeners) listener();
  }

  private emitEvent(): void {
    const template =
      EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)]!;
    const event: MarketEvent = {
      ...template,
      impact: template.impact * randomBetween(0.7, 1.4),
      id: `evt_${Date.now().toString(36)}`,
      createdAt: Date.now(),
    };
    for (const assetId of event.assetIds) {
      const runtime = this.runtimes.get(assetId);
      if (runtime) applyEventImpact(runtime.state, event.impact);
    }
    this.events = [event, ...this.events].slice(0, 12);
  }

  setStatus(status: MarketStatus): void {
    this.status = status;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshots(): AssetSnapshot[] {
    return Array.from(this.runtimes.values(), (r) => ({
      ...r.snapshot,
      spark: r.candles.slice(-32).map((c) => c.close),
    }));
  }

  getSnapshot(assetId: string): AssetSnapshot | undefined {
    const runtime = this.runtimes.get(assetId);
    if (!runtime) return undefined;
    return { ...runtime.snapshot, spark: runtime.candles.slice(-32).map((c) => c.close) };
  }

  getPrice(assetId: string): number {
    return this.runtimes.get(assetId)?.snapshot.price ?? 0;
  }

  getCandles(assetId: string): Candle[] {
    return this.runtimes.get(assetId)?.candles ?? [];
  }
}

export const MarketEngine = new MarketEngineImpl();
