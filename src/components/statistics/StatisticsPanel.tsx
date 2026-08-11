import { useMemo } from "react";
import { computeStats, useTradingStore } from "@/store/tradingStore";
import { EmptyState } from "@/components/common/EmptyState";
import { formatCurrency, formatPercent } from "@/utils/format";
import { cn } from "@/lib/utils";

export function StatisticsPanel() {
  const history = useTradingStore((s) => s.history);
  const stats = useMemo(() => computeStats(history), [history]);

  if (stats.totalTrades === 0) {
    return (
      <EmptyState
        title="No statistics yet"
        description="Performance metrics appear once positions have settled."
      />
    );
  }

  const winShare = stats.winRate;

  return (
    <div className="scroll-thin grid h-full grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-px overflow-auto bg-hairline">
      <div className="col-span-2 flex flex-col justify-center bg-surface p-4">
        <span className="label-xs">Win Rate</span>
        <span className="num mt-1 text-[24px] leading-none">
          {formatPercent(winShare, 1)}
        </span>
        <div className="mt-3 flex h-1.5 w-full overflow-hidden bg-surface-sunken">
          <div className="bg-positive" style={{ width: `${winShare}%` }} />
          <div className="bg-negative" style={{ width: `${100 - winShare}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px]">
          <span className="text-positive">{stats.wins} WINS</span>
          <span className="text-negative">{stats.losses} LOSSES</span>
        </div>
      </div>

      <Stat label="Total Trades" value={String(stats.totalTrades)} />
      <Stat label="Total Volume" value={formatCurrency(stats.volume)} />
      <Stat label="Total Profit" value={formatCurrency(stats.totalProfit, true)} tone="positive" />
      <Stat label="Total Loss" value={formatCurrency(-stats.totalLoss, true)} tone="negative" />
      <Stat label="Best Trade" value={formatCurrency(stats.bestTrade, true)} tone="positive" />
      <Stat label="Worst Trade" value={formatCurrency(stats.worstTrade, true)} tone="negative" />
      <Stat label="Most Traded" value={stats.mostTradedAsset ?? "—"} />
    </div>
  );
}

function Stat({
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
          "num mt-1 text-[15px]",
          tone === "positive" && "text-positive",
          tone === "negative" && "text-negative",
        )}
      >
        {value}
      </span>
    </div>
  );
}
