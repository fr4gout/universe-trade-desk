import type { PlayerData } from "@/types/player";
import type { Trade } from "@/types/trading";
import type { MarketStatus } from "@/types/market";
import type { TradingConfig } from "@/types/trading";

/**
 * NUI message contract shared with the FiveM client/server side.
 *
 * Inbound  (Lua  -> NUI): dispatched through window "message" events.
 * Outbound (NUI  -> Lua): POSTed to https://<resource>/<action>.
 *
 * The NUI layer never computes authoritative money. It renders whatever the
 * server reports and only ever *requests* actions.
 */
export type NuiInboundAction =
  | "OPEN_TERMINAL"
  | "CLOSE_TERMINAL"
  | "PLAYER_DATA"
  | "BALANCE_UPDATE"
  | "MARKET_UPDATE"
  | "TRADE_CREATED"
  | "TRADE_UPDATE"
  | "TRADE_SETTLED"
  | "TRADE_HISTORY"
  | "TRADE_REJECTED";

export type NuiOutboundAction =
  | "closeTerminal"
  | "placeTrade"
  | "requestHistory"
  | "requestPlayerData";

export interface NuiMessage<T = unknown> {
  action: NuiInboundAction;
  data?: T;
}

export interface OpenTerminalPayload {
  player: PlayerData;
  config: TradingConfig;
  openTrades: Trade[];
  history: Trade[];
  marketStatus: MarketStatus;
}

export interface PlaceTradeRequest {
  assetId: string;
  direction: "up" | "down";
  amount: number;
  duration: number;
}

export interface TradeRejectedPayload {
  reason: string;
}
