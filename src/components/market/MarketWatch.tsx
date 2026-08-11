import { memo, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useMarketStore } from "@/store/marketStore";
import type { AssetSnapshot } from "@/types/market";
import { Sparkline } from "@/components/common/Sparkline";
import { formatPercent, formatPrice } from "@/utils/format";
import { cn } from "@/lib/utils";
import { playSound } from "@/hooks/useSound";

const AssetRow = memo(function AssetRow({
  asset,
  selected,
  onSelect,
}: {
  asset: AssetSnapshot;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const positive = asset.changePercent >= 0;
  const prev = useRef(asset.price);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (asset.price === prev.current) return;
    setFlash(asset.price > prev.current ? "up" : "down");
    prev.current = asset.price;
    const id = setTimeout(() => setFlash(null), 420);
    return () => clearTimeout(id);
  }, [asset.price]);

  return (
    <button
      type="button"
      onClick={() => {
        onSelect(asset.id);
        playSound("click");
      }}
      aria-pressed={selected}
      className={cn(
        "grid w-full grid-cols-[1fr_auto] items-center gap-x-2 gap-y-0.5 border-l-2 px-3 py-1.5 text-left transition-colors duration-150",
        selected
          ? "border-l-primary bg-primary/10"
          : "border-l-transparent hover:bg-surface-raised",
      )}
    >
      <span className="text-[11px] font-medium tracking-tight">{asset.symbol}</span>
      <span
        className={cn(
          "num text-[11px]",
          flash === "up" && "flash-up",
          flash === "down" && "flash-down",
        )}
      >
        {formatPrice(asset.price, asset.precision)}
      </span>
      <span className="flex items-center gap-1.5">
        <Sparkline values={asset.spark} positive={positive} />
        <span
          className={cn(
            "h-1 w-1 rounded-full",
            asset.status === "open" ? "bg-positive" : "bg-warning",
          )}
        />
      </span>
      <span
        className={cn("num text-[10px]", positive ? "text-positive" : "text-negative")}
      >
        {formatPercent(asset.changePercent)}
      </span>
    </button>
  );
});

interface MarketWatchProps {
  searchRef: React.RefObject<HTMLInputElement | null>;
}

export function MarketWatch({ searchRef }: MarketWatchProps) {
  const assets = useMarketStore((s) => s.assets);
  const selectedAssetId = useMarketStore((s) => s.selectedAssetId);
  const selectAsset = useMarketStore((s) => s.selectAsset);
  const search = useMarketStore((s) => s.search);
  const setSearch = useMarketStore((s) => s.setSearch);

  const query = search.trim().toLowerCase();
  const filtered = query
    ? assets.filter(
        (a) =>
          a.symbol.toLowerCase().includes(query) || a.name.toLowerCase().includes(query),
      )
    : assets;

  return (
    <section className="flex min-h-0 flex-col border border-hairline bg-surface">
      <header className="flex h-8 shrink-0 items-center justify-between border-b border-hairline px-3">
        <h2 className="label-xs">Market Watch</h2>
        <span className="num text-[10px] text-label">{filtered.length}</span>
      </header>

      <div className="flex h-8 shrink-0 items-center gap-2 border-b border-hairline px-3">
        <Search className="h-3 w-3 text-label" aria-hidden />
        <input
          ref={searchRef}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search assets  /"
          aria-label="Search assets"
          className="w-full bg-transparent text-[11px] text-foreground placeholder:text-label focus:outline-none"
        />
      </div>

      <div className="scroll-thin min-h-0 flex-1 divide-y divide-hairline overflow-y-auto">
        {filtered.map((asset) => (
          <AssetRow
            key={asset.id}
            asset={asset}
            selected={asset.id === selectedAssetId}
            onSelect={selectAsset}
          />
        ))}
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            No assets match “{search}”.
          </p>
        )}
      </div>
    </section>
  );
}
