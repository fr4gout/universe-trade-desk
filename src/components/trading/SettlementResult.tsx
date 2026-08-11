import { useEffect, useState } from "react";
import { useTradingStore } from "@/store/tradingStore";
import { formatCurrency, formatPrice } from "@/utils/format";
import { cn } from "@/lib/utils";

/**
 * Settlement transition: EXPIRING -> SETTLING -> RESULT.
 * Deliberately understated — a marker change and a clean result card.
 */
export function SettlementResult() {
  const trade = useTradingStore((s) => s.lastSettled);
  const dismiss = useTradingStore((s) => s.dismissSettled);
  const [phase, setPhase] = useState<"settling" | "result">("settling");

  useEffect(() => {
    if (!trade) return;
    setPhase("settling");
    const id = setTimeout(() => setPhase("result"), 520);
    return () => clearTimeout(id);
  }, [trade]);

  useEffect(() => {
    if (!trade) return;
    const id = setTimeout(dismiss, 9_000);
    return () => clearTimeout(id);
  }, [trade, dismiss]);

  if (!trade) return null;
  const won = trade.status === "won";
  const profit = won ? trade.payout - trade.amount : -trade.amount;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-background/55">
      <div
        className={cn(
          "pointer-events-auto w-[300px] border bg-card shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]",
          won ? "border-positive/45" : "border-negative/45",
        )}
      >
        <header className="flex items-center justify-between border-b border-hairline px-3 py-2">
          <span className="label-xs">
            {phase === "settling" ? "Settling position" : "Position closed"}
          </span>
          <span
            className={cn(
              "text-[10px] font-semibold tracking-widest",
              won ? "text-positive" : "text-negative",
            )}
          >
            {phase === "settling" ? "···" : won ? "WIN" : "LOSS"}
          </span>
        </header>

        <div className="px-3 py-2.5">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[13px] font-semibold tracking-tight">{trade.symbol}</span>
            <span
              className={cn(
                "text-[11px] font-semibold tracking-wider",
                trade.direction === "up" ? "text-positive" : "text-negative",
              )}
            >
              {trade.direction.toUpperCase()}
            </span>
          </div>
          <dl className="text-[11px]">
            <Line label="Entry" value={formatPrice(trade.entryPrice, trade.precision)} />
            <Line
              label="Exit"
              value={trade.exitPrice ? formatPrice(trade.exitPrice, trade.precision) : "—"}
            />
            <Line label="Investment" value={formatCurrency(trade.amount)} />
            <Line
              label={won ? "Profit" : "Loss"}
              value={formatCurrency(profit, true)}
              tone={won ? "positive" : "negative"}
            />
            {won && <Line label="Payout" value={formatCurrency(trade.payout)} />}
          </dl>
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="w-full border-t border-hairline py-2 text-[11px] tracking-wide text-muted-foreground transition-colors duration-150 hover:bg-surface-raised hover:text-foreground"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function Line({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="flex items-center justify-between border-b border-hairline py-1 last:border-b-0">
      <dt className="label-xs">{label}</dt>
      <dd
        className={cn(
          "num",
          tone === "positive" && "text-positive",
          tone === "negative" && "text-negative",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
