import { ArrowDown, ArrowUp } from "lucide-react";
import { useTradingStore } from "@/store/tradingStore";
import { useCountdown } from "@/hooks/useCountdown";
import { useLivePrice } from "@/hooks/useMarket";
import { EmptyState } from "@/components/common/EmptyState";
import { formatClock, formatCurrency, formatPrice } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { Trade } from "@/types/trading";

export function OpenPositions() {
  const openTrades = useTradingStore((s) => s.openTrades);

  if (openTrades.length === 0) {
    return (
      <EmptyState
        title="No open positions"
        description="Your active trades will appear here with live P/L and countdown."
      />
    );
  }

  return (
    <div className="scroll-thin grid h-full grid-cols-[repeat(auto-fill,minmax(258px,1fr))] gap-px overflow-y-auto bg-hairline">
      {openTrades.map((trade) => (
        <PositionCard key={trade.id} trade={trade} />
      ))}
    </div>
  );
}

function PositionCard({ trade }: { trade: Trade }) {
  const price = useLivePrice(trade.assetId, 200);
  const remaining = useCountdown(trade.expiresAt);
  const elapsed = Math.min(1, 1 - remaining / (trade.duration * 1_000));
  const up = trade.direction === "up";
  const winning = up ? price > trade.entryPrice : price < trade.entryPrice;
  const pl = winning ? Math.round(trade.amount * trade.payoutRate) : -trade.amount;
  const settling = trade.status === "settling" || remaining <= 0;

  return (
    <article className="flex flex-col gap-2 bg-surface p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold tracking-tight">{trade.symbol}</span>
          <span
            className={cn(
              "flex items-center gap-0.5 px-1 py-px text-[9px] font-semibold tracking-wider",
              up ? "bg-positive-muted text-positive" : "bg-negative-muted text-negative",
            )}
          >
            {up ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
            {up ? "UP" : "DOWN"}
          </span>
        </div>
        <span className="num text-[11px] text-label">
          {settling ? "SETTLING" : formatClock(remaining)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Field label="Entry" value={formatPrice(trade.entryPrice, trade.precision)} />
        <Field
          label="Current"
          value={formatPrice(price, trade.precision)}
          tone={winning ? "positive" : "negative"}
        />
        <Field label="Stake" value={formatCurrency(trade.amount)} />
      </div>

      <div className="h-[3px] w-full bg-surface-sunken">
        <div
          className="h-full bg-primary transition-[width] duration-150 ease-linear"
          style={{ width: `${elapsed * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between border-t border-hairline pt-1.5">
        <span className="label-xs">Projected P/L</span>
        <span
          className={cn(
            "num text-[13px]",
            winning ? "text-positive" : "text-negative",
          )}
        >
          {formatCurrency(pl, true)}
        </span>
      </div>
    </article>
  );
}

function Field({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="label-xs">{label}</span>
      <span
        className={cn(
          "num text-[11px]",
          tone === "positive" && "text-positive",
          tone === "negative" && "text-negative",
        )}
      >
        {value}
      </span>
    </div>
  );
}
