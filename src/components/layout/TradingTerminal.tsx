import { useCallback, useEffect, useMemo, useRef } from "react";
import { Toaster } from "sonner";
import { TopBar } from "@/components/layout/TopBar";
import { MarketWatch } from "@/components/market/MarketWatch";
import { ChartWorkspace } from "@/components/chart/ChartWorkspace";
import { TradePanel } from "@/components/trading/TradePanel";
import { OpenPositions } from "@/components/trading/OpenPositions";
import { SettlementResult } from "@/components/trading/SettlementResult";
import { HistoryTable } from "@/components/history/HistoryTable";
import { WalletPanel } from "@/components/wallet/WalletPanel";
import { StatisticsPanel } from "@/components/statistics/StatisticsPanel";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { useMarketStore } from "@/store/marketStore";
import { useTradingStore } from "@/store/tradingStore";
import { useUiStore, type WorkspaceTab } from "@/store/uiStore";
import { useTradeDraftStore } from "@/store/tradeDraftStore";
import { useFiveMNui, placeTrade } from "@/hooks/useFiveMNui";
import { useMarketTicker } from "@/hooks/useMarket";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { closeTradingTerminal } from "@/services/nui";
import { cn } from "@/lib/utils";

const TABS: Array<{ id: WorkspaceTab; label: string }> = [
  { id: "positions", label: "Open Positions" },
  { id: "history", label: "History" },
  { id: "wallet", label: "Wallet" },
  { id: "statistics", label: "Statistics" },
];

export function TradingTerminal() {
  useFiveMNui();
  useMarketTicker();

  const searchRef = useRef<HTMLInputElement | null>(null);
  const assets = useMarketStore((s) => s.assets);
  const selectedAssetId = useMarketStore((s) => s.selectedAssetId);
  const events = useMarketStore((s) => s.events);
  const connected = useTradingStore((s) => s.connected);
  const tab = useUiStore((s) => s.tab);
  const setTab = useUiStore((s) => s.setTab);
  const hydrateSettings = useUiStore((s) => s.hydrateSettings);

  const asset = useMemo(
    () => assets.find((item) => item.id === selectedAssetId),
    [assets, selectedAssetId],
  );

  useEffect(() => {
    hydrateSettings();
  }, [hydrateSettings]);

  const handlers = useMemo(
    () => ({
      onClose: () => {
        if (useUiStore.getState().settingsOpen) {
          useUiStore.getState().toggleSettings(false);
          return;
        }
        closeTradingTerminal();
      },
      onUp: () => useTradeDraftStore.getState().setDirection("up"),
      onDown: () => useTradeDraftStore.getState().setDirection("down"),
      onConfirm: () => {
        const draft = useTradeDraftStore.getState();
        const current = useMarketStore.getState().selectedAssetId;
        if (!draft.direction) return;
        placeTrade({
          assetId: current,
          direction: draft.direction,
          amount: draft.amount,
          duration: draft.duration,
        });
        draft.reset();
      },
      onSearch: () => searchRef.current?.focus(),
      onWallet: () => setTab("wallet"),
      onHistory: () => setTab("history"),
    }),
    [setTab],
  );

  useKeyboardShortcuts(handlers);

  const renderTab = useCallback(() => {
    switch (tab) {
      case "history":
        return <HistoryTable />;
      case "wallet":
        return <WalletPanel />;
      case "statistics":
        return <StatisticsPanel />;
      default:
        return <OpenPositions />;
    }
  }, [tab]);

  return (
    <main className="flex h-screen w-screen items-center justify-center bg-background p-[3vh]">
      <div className="relative flex h-[84vh] w-[84vw] min-w-[900px] flex-col overflow-hidden border border-hairline-strong bg-surface-sunken shadow-[0_40px_120px_-40px_rgba(0,0,0,0.95)]">
        <TopBar asset={asset} />

        {!connected && (
          <div className="border-b border-hairline bg-negative-muted px-3 py-1 text-[10px] tracking-wider text-negative">
            Connecting to trading server…
          </div>
        )}

        <div className="grid min-h-0 flex-1 grid-cols-[220px_minmax(0,1fr)_262px] gap-px bg-hairline xl:grid-cols-[248px_minmax(0,1fr)_286px]">
          <MarketWatch searchRef={searchRef} />

          <div className="grid min-h-0 grid-rows-[minmax(0,1.55fr)_minmax(0,1fr)] gap-px">
            <ChartWorkspace asset={asset} />

            <section className="flex min-h-0 flex-col border border-hairline bg-surface">
              <header className="flex h-8 shrink-0 items-center gap-px border-b border-hairline">
                {TABS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={cn(
                      "h-full px-3 text-[10px] uppercase tracking-[0.09em] transition-colors duration-150",
                      tab === item.id
                        ? "border-b border-primary bg-primary/10 text-primary"
                        : "text-label hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </header>
              <div className="min-h-0 flex-1">{renderTab()}</div>
            </section>
          </div>

          <TradePanel asset={asset} />
        </div>

        <footer className="flex h-7 shrink-0 items-center gap-3 overflow-hidden border-t border-hairline bg-surface-sunken px-3">
          <span className="label-xs shrink-0">Market Wire</span>
          <div className="flex min-w-0 items-center gap-4 overflow-hidden">
            {events.length === 0 ? (
              <span className="text-[10px] text-label">No market events reported.</span>
            ) : (
              events.slice(0, 4).map((event) => (
                <span key={event.id} className="flex shrink-0 items-center gap-1.5 text-[10px]">
                  <span className="font-semibold tracking-wider">{event.title}</span>
                  <span className="text-label">{event.detail}</span>
                  <span
                    className={cn(
                      "num",
                      event.impact >= 0 ? "text-positive" : "text-negative",
                    )}
                  >
                    {event.impact >= 0 ? "+" : ""}
                    {event.impact.toFixed(1)}%
                  </span>
                </span>
              ))
            )}
          </div>
        </footer>

        <SettlementResult />
        <SettingsPanel />
      </div>
      <Toaster position="bottom-right" theme="dark" toastOptions={{ className: "text-xs" }} />
    </main>
  );
}
