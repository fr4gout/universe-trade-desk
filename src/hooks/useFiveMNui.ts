import { useEffect } from "react";
import { toast } from "sonner";
import {
  attachWindowBridge,
  closeTradingTerminal,
  DEV_MODE,
  onNuiMessage,
  sendNuiMessage,
} from "@/services/nui";
import { startMockServer } from "@/services/mockServer";
import { MarketEngine } from "@/engine/MarketEngine";
import { useTradingStore } from "@/store/tradingStore";
import { useMarketStore } from "@/store/marketStore";
import { useUiStore } from "@/store/uiStore";
import type { OpenTerminalPayload, PlaceTradeRequest, TradeRejectedPayload } from "@/types/nui";
import type { Trade } from "@/types/trading";
import type { MarketStatus } from "@/types/market";
import { formatCurrency } from "@/utils/format";
import { playSound } from "./useSound";

/**
 * Wires the NUI transport into the stores. All state that involves money comes
 * from the server side of this bridge — never from local calculation.
 */
export function useFiveMNui(): void {
  const trading = useTradingStore;
  const notify = (title: string, description?: string) => {
    if (!useUiStore.getState().settings.notificationsEnabled) return;
    toast(title, { description });
  };

  useEffect(() => {
    MarketEngine.start();
    if (DEV_MODE) startMockServer();
    const detach = attachWindowBridge();

    const unsubs = [
      onNuiMessage<OpenTerminalPayload>("OPEN_TERMINAL", (data) => {
        trading.getState().setPlayer(data.player);
        if (data.config) trading.getState().setConfig(data.config);
        trading.getState().setHistory(data.history ?? []);
        for (const t of data.openTrades ?? []) trading.getState().addTrade(t);
        if (data.marketStatus) useMarketStore.getState().setStatus(data.marketStatus);
        trading.getState().setConnected(true);
        trading.getState().setError(null);
      }),
      onNuiMessage<{ balance: number }>("BALANCE_UPDATE", (data) => {
        trading.getState().setBalance(data.balance);
      }),
      onNuiMessage<OpenTerminalPayload["player"]>("PLAYER_DATA", (player) => {
        trading.getState().setPlayer(player);
      }),
      onNuiMessage<{ status: MarketStatus }>("MARKET_UPDATE", (data) => {
        if (data?.status) useMarketStore.getState().setStatus(data.status);
      }),
      onNuiMessage<Trade>("TRADE_CREATED", (trade) => {
        trading.getState().addTrade(trade);
        playSound("open");
        notify("TRADE OPENED", `${trade.symbol} ${trade.direction.toUpperCase()} position opened.`);
      }),
      onNuiMessage<Trade>("TRADE_UPDATE", (trade) => {
        trading.getState().updateTrade(trade);
      }),
      onNuiMessage<Trade>("TRADE_SETTLED", (trade) => {
        trading.getState().settleTrade(trade);
        playSound(trade.status === "won" ? "win" : "loss");
        notify(
          trade.status === "won" ? "TRADE WON" : "TRADE LOST",
          trade.status === "won"
            ? `Settled at ${formatCurrency(trade.payout)} payout.`
            : "Position expired against your direction.",
        );
      }),
      onNuiMessage<Trade[]>("TRADE_HISTORY", (trades) => {
        trading.getState().setHistory(trades ?? []);
      }),
      onNuiMessage<TradeRejectedPayload>("TRADE_REJECTED", (data) => {
        trading.getState().setError(data.reason);
        notify("TRADE REJECTED", data.reason);
        setTimeout(() => trading.getState().setError(null), 4_000);
      }),
      onNuiMessage("CLOSE_TERMINAL", () => {
        trading.getState().setConnected(false);
      }),
    ];

    return () => {
      detach();
      for (const unsub of unsubs) unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function placeTrade(request: PlaceTradeRequest): void {
  void sendNuiMessage("placeTrade", request);
}

export function requestHistory(): void {
  void sendNuiMessage("requestHistory");
}

export { closeTradingTerminal };
