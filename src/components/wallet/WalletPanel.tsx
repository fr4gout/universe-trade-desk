import { useMemo } from "react";
import { computeStats, useTradingStore } from "@/store/tradingStore";
import { formatCurrency, formatPercent } from "@/utils/format";
import { Sparkline } from "@/components/common/Sparkline";
import { cn } from "@/lib/utils";

export function WalletPanel() {
  const player = useTradingStore((s) => s.player);
  const history = useTradingStore((s) => s.history);
  const stats = useMemo(() => computeStats(history), [history]);

  const equity = useMemo(() => {
    const start = player?.balance ?? 0;
    let running = start;
    const series = [start];
    for (const trade of history) {
      running -= trade.status === "won" ? trade.payout - trade.amount : -trade.amount;
      series.unshift(running);
    }
    return series.slice(-40);
  }, [history, player?.balance]);

  return (
    <div className="scroll-thin grid h-full grid-cols-[minmax(220px,1fr)_repeat(auto-fit,minmax(140px,1fr))] gap-px overflow-auto bg-hairline">
      <div className="flex flex-col justify-between bg-surface p-4">
        <div>
          <span className="label-xs">Available Balance</span>
          <p className="num mt-1 text-[26px] leading-none">
            {formatCurrency(player?.balance ?? 0)}
          </p>
          <p className="mt-1 text-[10px] text-label">
            {player?.accountId ?? "—"} · {player?.name ?? "—"}
          </p>
        </div>
        <div className="mt-3">
          <Sparkline
            values={equity.length > 1 ? equity : [0, 0]}
            positive={stats.totalProfit >= stats.totalLoss}
            width={200}
            height={34}
          />
        </div>
      </div>

      <Metric label="Total Profit" value={formatCurrency(stats.totalProfit, true)} tone="positive" />
      <Metric label="Total Loss" value={formatCurrency(-stats.totalLoss, true)} tone="negative" />
      <Metric label="Win Rate" value={formatPercent(stats.winRate, 1)} />
      <Metric label="Trades" value={String(stats.totalTrades)} />
      <Metric label="Volume" value={formatCurrency(stats.volume)} />
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="flex flex-col justify-center bg-surface p-4">
      <span className="label-xs">{label}</span>
      <span
        className={cn(
          "num mt-1 text-[17px]",
          tone === "positive" && "text-positive",
          tone === "negative" && "text-negative",
        )}
      >
        {value}
      </span>
    </div>
  );
}
