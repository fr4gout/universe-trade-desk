import { useMemo, useState } from "react";
import { PriceChart } from "./PriceChart";
import { useUiStore } from "@/store/uiStore";
import { useTradingStore } from "@/store/tradingStore";
import type { AssetSnapshot } from "@/types/market";
import { formatPercent, formatPrice } from "@/utils/format";
import { cn } from "@/lib/utils";
import { useLivePrice } from "@/hooks/useMarket";

const RANGES = [
  { label: "1M", candles: 24 },
  { label: "5M", candles: 60 },
  { label: "15M", candles: 90 },
  { label: "1H", candles: 160 },
];

interface ChartWorkspaceProps {
  asset: AssetSnapshot | undefined;
}

export function ChartWorkspace({ asset }: ChartWorkspaceProps) {
  const [range, setRange] = useState(RANGES[2]!);
  const settings = useUiStore((s) => s.settings);
  const updateSettings = useUiStore((s) => s.updateSettings);
  const openTrades = useTradingStore((s) => s.openTrades);
  const livePrice = useLivePrice(asset?.id ?? "", 250);

  const tradesForAsset = useMemo(
    () => openTrades.filter((t) => t.assetId === asset?.id),
    [openTrades, asset?.id],
  );

  if (!asset) {
    return (
      <div className="flex h-full items-center justify-center border border-hairline bg-surface">
        <p className="label-xs">Market data unavailable</p>
      </div>
    );
  }

  const precision =
    settings.pricePrecision === "extended" ? asset.precision + 1 : asset.precision;
  const positive = asset.changePercent >= 0;

  return (
    <section className="flex min-h-0 min-w-0 flex-col overflow-hidden border border-hairline bg-surface">
      <header className="flex h-9 shrink-0 items-center justify-between gap-3 border-b border-hairline px-3">
        <div className="flex items-baseline gap-3">
          <span className="text-[13px] font-semibold tracking-tight">{asset.symbol}</span>
          <span className="label-xs">{asset.name}</span>
          <span className="num text-[13px]">{formatPrice(livePrice || asset.price, precision)}</span>
          <span
            className={cn(
              "num text-[11px]",
              positive ? "text-positive" : "text-negative",
            )}
          >
            {formatPercent(asset.changePercent)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex border border-hairline">
            {RANGES.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setRange(item)}
                className={cn(
                  "px-2 py-1 text-[10px] tracking-wider transition-colors duration-150",
                  range.label === item.label
                    ? "bg-primary/15 text-primary"
                    : "text-label hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex border border-hairline">
            {(["candles", "bars", "line"] as const).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => updateSettings({ candleStyle: style })}
                className={cn(
                  "px-2 py-1 text-[10px] uppercase tracking-wider transition-colors duration-150",
                  settings.candleStyle === style
                    ? "bg-primary/15 text-primary"
                    : "text-label hover:text-foreground",
                )}
              >
                {style.slice(0, 4)}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => updateSettings({ chartGrid: !settings.chartGrid })}
            className={cn(
              "border border-hairline px-2 py-1 text-[10px] uppercase tracking-wider transition-colors duration-150",
              settings.chartGrid ? "text-primary" : "text-label hover:text-foreground",
            )}
          >
            Grid
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1">
        <PriceChart
          assetId={asset.id}
          precision={precision}
          candleStyle={settings.candleStyle}
          showGrid={settings.chartGrid}
          trades={tradesForAsset}
          visibleCandles={range.candles}
        />
      </div>
    </section>
  );
}
