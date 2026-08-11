import { useMemo, useState } from "react";
import { useTradingStore } from "@/store/tradingStore";
import { EmptyState } from "@/components/common/EmptyState";
import { formatCurrency, formatPrice, formatTime } from "@/utils/format";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

export function HistoryTable() {
  const history = useTradingStore((s) => s.history);
  const [asset, setAsset] = useState("all");
  const [result, setResult] = useState("all");
  const [page, setPage] = useState(0);

  const symbols = useMemo(
    () => Array.from(new Set(history.map((t) => t.symbol))),
    [history],
  );

  const filtered = useMemo(
    () =>
      history.filter(
        (t) =>
          (asset === "all" || t.symbol === asset) &&
          (result === "all" || t.status === result),
      ),
    [history, asset, result],
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const rows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  if (history.length === 0) {
    return (
      <EmptyState
        title="No trading history"
        description="Complete your first trade to see settled activity here."
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-hairline px-3 py-1.5">
        <Select value={asset} onChange={setAsset} options={["all", ...symbols]} label="Asset" />
        <Select value={result} onChange={setResult} options={["all", "won", "lost"]} label="Result" />
        <span className="num ml-auto text-[10px] text-label">
          {filtered.length} RECORDS
        </span>
      </div>

      <div className="scroll-thin min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead className="sticky top-0 bg-surface-sunken">
            <tr className="[&>th]:label-xs [&>th]:px-3 [&>th]:py-1.5 [&>th]:text-left">
              <th>Time</th>
              <th>Asset</th>
              <th>Dir</th>
              <th className="!text-right">Entry</th>
              <th className="!text-right">Exit</th>
              <th className="!text-right">Amount</th>
              <th>Result</th>
              <th className="!text-right">Payout</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((trade) => {
              const won = trade.status === "won";
              return (
                <tr
                  key={trade.id}
                  className="border-t border-hairline transition-colors duration-150 hover:bg-surface-raised"
                >
                  <td className="num px-3 py-1.5 text-label">{formatTime(trade.openedAt)}</td>
                  <td className="px-3 py-1.5 font-medium">{trade.symbol}</td>
                  <td
                    className={cn(
                      "px-3 py-1.5 text-[10px] font-semibold tracking-wider",
                      trade.direction === "up" ? "text-positive" : "text-negative",
                    )}
                  >
                    {trade.direction.toUpperCase()}
                  </td>
                  <td className="num px-3 py-1.5 text-right">
                    {formatPrice(trade.entryPrice, trade.precision)}
                  </td>
                  <td className="num px-3 py-1.5 text-right">
                    {trade.exitPrice ? formatPrice(trade.exitPrice, trade.precision) : "—"}
                  </td>
                  <td className="num px-3 py-1.5 text-right">{formatCurrency(trade.amount)}</td>
                  <td
                    className={cn(
                      "px-3 py-1.5 text-[10px] font-semibold tracking-wider",
                      won ? "text-positive" : "text-negative",
                    )}
                  >
                    {won ? "WIN" : "LOSS"}
                  </td>
                  <td
                    className={cn(
                      "num px-3 py-1.5 text-right",
                      won ? "text-positive" : "text-negative",
                    )}
                  >
                    {formatCurrency(won ? trade.payout - trade.amount : -trade.amount, true)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-hairline px-3 py-1.5">
        <span className="num text-[10px] text-label">
          PAGE {current + 1} / {pages}
        </span>
        <div className="flex gap-1">
          <PagerButton disabled={current === 0} onClick={() => setPage(current - 1)}>
            Prev
          </PagerButton>
          <PagerButton disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>
            Next
          </PagerButton>
        </div>
      </div>
    </div>
  );
}

function PagerButton({
  children,
  disabled,
  onClick,
}: {
  children: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="border border-hairline px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground transition-colors duration-150 hover:text-foreground disabled:opacity-35"
    >
      {children}
    </button>
  );
}

function Select({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <label className="flex items-center gap-1.5">
      <span className="label-xs">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border border-hairline bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
