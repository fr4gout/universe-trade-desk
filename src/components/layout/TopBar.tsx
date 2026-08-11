import { Settings, X } from "lucide-react";
import { useMarketStore } from "@/store/marketStore";
import { useTradingStore } from "@/store/tradingStore";
import { useUiStore } from "@/store/uiStore";
import { useLivePrice } from "@/hooks/useMarket";
import type { AssetSnapshot } from "@/types/market";
import { formatCurrency, formatPercent, formatPrice } from "@/utils/format";
import { cn } from "@/lib/utils";
import { closeTradingTerminal } from "@/services/nui";

const STATUS_LABEL: Record<string, string> = {
  open: "Market Open",
  closed: "Market Closed",
  high_volatility: "High Volatility",
  low_liquidity: "Low Liquidity",
  maintenance: "Maintenance",
};

export function TopBar({ asset }: { asset: AssetSnapshot | undefined }) {
  const status = useMarketStore((s) => s.status);
  const player = useTradingStore((s) => s.player);
  const toggleSettings = useUiStore((s) => s.toggleSettings);
  const price = useLivePrice(asset?.id ?? "", 200);

  const positive = (asset?.changePercent ?? 0) >= 0;

  return (
    <header className="flex h-11 shrink-0 items-center justify-between gap-4 border-b border-hairline bg-surface-sunken px-3">
      <div className="flex items-center gap-3">
        <div className="leading-none">
          <p className="text-[11px] font-bold tracking-[0.18em]">UNIVERSE ROLEPLAY</p>
          <p className="label-xs mt-0.5">Trading Terminal</p>
        </div>
        <span className="h-6 w-px bg-hairline" />
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              status === "open"
                ? "bg-positive"
                : status === "closed" || status === "maintenance"
                  ? "bg-negative"
                  : "bg-warning",
            )}
          />
          <span className="label-xs">{STATUS_LABEL[status]}</span>
        </span>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-[12px] font-semibold tracking-tight">
          {asset?.symbol ?? "—"}
        </span>
        <span className="num text-[15px]">
          {asset ? formatPrice(price || asset.price, asset.precision) : "—"}
        </span>
        <span
          className={cn("num text-[11px]", positive ? "text-positive" : "text-negative")}
        >
          {asset ? formatPrice(asset.change, asset.precision) : "—"}
        </span>
        <span
          className={cn(
            "num px-1.5 py-0.5 text-[11px]",
            positive ? "bg-positive-muted text-positive" : "bg-negative-muted text-negative",
          )}
        >
          {formatPercent(asset?.changePercent ?? 0)}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right leading-none">
          <p className="num text-[13px]">{formatCurrency(player?.balance ?? 0)}</p>
          <p className="label-xs mt-0.5">Wallet</p>
        </div>
        <div className="flex h-7 w-7 items-center justify-center border border-hairline bg-surface text-[10px] font-semibold">
          {(player?.name ?? "??").slice(0, 2).toUpperCase()}
        </div>
        <button
          type="button"
          aria-label="Settings"
          onClick={() => toggleSettings()}
          className="border border-hairline p-1.5 text-label transition-colors duration-150 hover:text-foreground"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Close terminal"
          onClick={closeTradingTerminal}
          className="border border-hairline p-1.5 text-label transition-colors duration-150 hover:border-negative/50 hover:text-negative"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
