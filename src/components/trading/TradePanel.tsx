import { ArrowDown, ArrowUp, Minus, Plus } from "lucide-react";
import { useTradeDraftStore } from "@/store/tradeDraftStore";
import { useTradingStore } from "@/store/tradingStore";
import { placeTrade } from "@/hooks/useFiveMNui";
import { playSound } from "@/hooks/useSound";
import type { AssetSnapshot } from "@/types/market";
import { formatCurrency, formatPrice } from "@/utils/format";
import { sanitizeAmount, validateAmount } from "@/utils/validation";
import { cn } from "@/lib/utils";
import { useLivePrice } from "@/hooks/useMarket";

interface TradePanelProps {
  asset: AssetSnapshot | undefined;
}

export function TradePanel({ asset }: TradePanelProps) {
  const { amount, duration, direction, setAmount, setDuration, setDirection, reset } =
    useTradeDraftStore();
  const config = useTradingStore((s) => s.config);
  const player = useTradingStore((s) => s.player);
  const openTrades = useTradingStore((s) => s.openTrades);
  const error = useTradingStore((s) => s.error);
  const livePrice = useLivePrice(asset?.id ?? "", 250);

  const balance = player?.balance ?? 0;
  const payoutRate = asset?.payout ?? config.defaultPayout;
  const potentialProfit = Math.round(amount * payoutRate);
  const validation = validateAmount(amount, balance, config);
  const marketOpen =
    config.marketEnabled && (asset?.status === "open" || asset?.status === "high_volatility");
  const atCapacity = openTrades.length >= config.maxOpenTrades;
  const canTrade = Boolean(asset) && validation.valid && marketOpen && !atCapacity;

  const step = (delta: number) =>
    setAmount(Math.max(0, Math.min(config.maximumTrade, amount + delta)));

  const confirm = () => {
    if (!asset || !direction || !canTrade) return;
    placeTrade({ assetId: asset.id, direction, amount, duration });
    playSound("click");
    reset();
  };

  return (
    <section className="flex min-h-0 flex-col border border-hairline bg-surface">
      <header className="flex h-8 shrink-0 items-center justify-between border-b border-hairline px-3">
        <h2 className="label-xs">Trade</h2>
        <span className="num text-[10px] text-label">
          {openTrades.length}/{config.maxOpenTrades} OPEN
        </span>
      </header>

      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">
        <div className="flex items-baseline justify-between border-b border-hairline px-3 py-2">
          <span className="text-[12px] font-semibold tracking-tight">
            {asset?.symbol ?? "—"}
          </span>
          <span className="num text-[13px] text-primary">
            {asset ? formatPrice(livePrice || asset.price, asset.precision) : "—"}
          </span>
        </div>

        {/* Investment */}
        <div className="border-b border-hairline px-3 py-2.5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="label-xs">Investment</span>
            <span className="num text-[10px] text-label">
              BAL {formatCurrency(balance)}
            </span>
          </div>
          <div className="flex items-stretch border border-hairline-strong">
            <button
              type="button"
              aria-label="Decrease amount"
              onClick={() => step(-config.minimumTrade)}
              className="px-2 text-label transition-colors duration-150 hover:bg-surface-raised hover:text-foreground"
            >
              <Minus className="h-3 w-3" />
            </button>
            <div className="flex flex-1 items-center gap-1 border-x border-hairline px-2 py-1.5">
              <span className="num text-[12px] text-label">$</span>
              <input
                value={amount ? amount.toLocaleString("en-US") : ""}
                onChange={(event) => setAmount(sanitizeAmount(event.target.value))}
                inputMode="numeric"
                aria-label="Investment amount"
                className="num w-full bg-transparent text-right text-[13px] focus:outline-none"
              />
            </div>
            <button
              type="button"
              aria-label="Increase amount"
              onClick={() => step(config.minimumTrade)}
              className="px-2 text-label transition-colors duration-150 hover:bg-surface-raised hover:text-foreground"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <div className="mt-1.5 grid grid-cols-5 gap-1">
            {config.presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={cn(
                  "num border border-hairline py-1 text-[10px] transition-colors duration-150",
                  amount === preset
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : "text-label hover:text-foreground",
                )}
              >
                {preset >= 1000 ? `${preset / 1000}K` : preset}
              </button>
            ))}
          </div>
          {!validation.valid && (
            <p className="mt-1.5 text-[10px] text-negative">{validation.reason}</p>
          )}
        </div>

        {/* Duration */}
        <div className="border-b border-hairline px-3 py-2.5">
          <span className="label-xs">Duration</span>
          <div className="mt-1.5 grid grid-cols-5 gap-1">
            {config.durations.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setDuration(value)}
                className={cn(
                  "num border border-hairline py-1 text-[10px] transition-colors duration-150",
                  duration === value
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : "text-label hover:text-foreground",
                )}
              >
                {value}s
              </button>
            ))}
          </div>
        </div>

        {/* Return */}
        <div className="border-b border-hairline px-3 py-2.5">
          <div className="flex items-center justify-between py-0.5">
            <span className="label-xs">Expected Return</span>
            <span className="num text-[12px] text-positive">
              +{Math.round(payoutRate * 100)}%
            </span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="label-xs">Potential Profit</span>
            <span className="num text-[12px]">{formatCurrency(potentialProfit)}</span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="label-xs">Total Payout</span>
            <span className="num text-[12px]">
              {formatCurrency(amount + potentialProfit)}
            </span>
          </div>
        </div>

        {/* Direction */}
        {direction === null ? (
          <div className="grid grid-cols-1 gap-1.5 p-3">
            <DirectionButton
              variant="up"
              disabled={!canTrade}
              onClick={() => {
                setDirection("up");
                playSound("click");
              }}
            />
            <DirectionButton
              variant="down"
              disabled={!canTrade}
              onClick={() => {
                setDirection("down");
                playSound("click");
              }}
            />
          </div>
        ) : (
          <div className="p-3">
            <div className="border border-primary/40 bg-primary/5">
              <div className="border-b border-hairline px-3 py-1.5">
                <span className="label-xs text-primary">Confirm Position</span>
              </div>
              <dl className="px-3 py-2 text-[11px]">
                <Row label="Asset" value={asset?.symbol ?? "—"} />
                <Row
                  label="Direction"
                  value={direction.toUpperCase()}
                  tone={direction === "up" ? "positive" : "negative"}
                />
                <Row
                  label="Entry Price"
                  value={asset ? formatPrice(livePrice || asset.price, asset.precision) : "—"}
                />
                <Row label="Investment" value={formatCurrency(amount)} />
                <Row label="Duration" value={`${duration}s`} />
                <Row label="Return" value={`${Math.round(payoutRate * 100)}%`} />
              </dl>
              <div className="grid grid-cols-2 gap-px border-t border-hairline bg-hairline">
                <button
                  type="button"
                  onClick={reset}
                  className="bg-surface px-3 py-2 text-[11px] tracking-wide text-muted-foreground transition-colors duration-150 hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirm}
                  className="bg-primary px-3 py-2 text-[11px] font-semibold tracking-wide text-primary-foreground transition-opacity duration-150 hover:opacity-90"
                >
                  Confirm Trade
                </button>
              </div>
            </div>
          </div>
        )}

        {(atCapacity || !marketOpen || error) && (
          <p className="px-3 pb-3 text-[10px] text-negative">
            {error ??
              (!marketOpen
                ? "Market is currently unavailable for trading."
                : `Maximum ${config.maxOpenTrades} concurrent positions reached.`)}
          </p>
        )}
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="flex items-center justify-between py-[3px]">
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

function DirectionButton({
  variant,
  disabled,
  onClick,
}: {
  variant: "up" | "down";
  disabled: boolean;
  onClick: () => void;
}) {
  const up = variant === "up";
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-2.5 border px-3 py-2 text-left transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40",
        up
          ? "border-positive/40 bg-positive-muted hover:bg-positive/20"
          : "border-negative/40 bg-negative-muted hover:bg-negative/20",
      )}
    >
      <Icon className={cn("h-4 w-4", up ? "text-positive" : "text-negative")} />
      <span className="flex flex-col leading-tight">
        <span
          className={cn(
            "text-[12px] font-semibold tracking-wide",
            up ? "text-positive" : "text-negative",
          )}
        >
          {up ? "UP" : "DOWN"}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {up ? "Price will rise" : "Price will fall"}
        </span>
      </span>
      <span className="num ml-auto text-[10px] text-label">{up ? "1" : "2"}</span>
    </button>
  );
}
