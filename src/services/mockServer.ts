import { defaultTradingConfig } from "@/config/trading";
import { MarketEngine } from "@/engine/MarketEngine";
import { dispatchNuiMessage, registerMockTransport } from "@/services/nui";
import type { PlaceTradeRequest } from "@/types/nui";
import type { PlayerData } from "@/types/player";
import type { Trade } from "@/types/trading";

/**
 * Mock authority used when the UI runs outside FiveM.
 *
 * It mirrors exactly what the QBCore server does: it owns the balance, stamps
 * trade ids and timestamps, validates every request, and settles positions on
 * its own clock. The React layer only ever asks; it never decides.
 */

const MOCK_PLAYER: PlayerData = {
  identifier: "char1:9f2c41",
  name: "M. Nabil",
  accountId: "URP-004182",
  balance: 125_430,
};

let started = false;
let balance = MOCK_PLAYER.balance;
let lastTradeAt = 0;
let counter = 0;
const openTrades = new Map<string, Trade>();
const history: Trade[] = [];

function reject(reason: string): void {
  dispatchNuiMessage({ action: "TRADE_REJECTED", data: { reason } });
}

function pushBalance(): void {
  dispatchNuiMessage({ action: "BALANCE_UPDATE", data: { balance } });
}

function settle(trade: Trade): void {
  const exitPrice = MarketEngine.getPrice(trade.assetId);
  const won =
    trade.direction === "up" ? exitPrice > trade.entryPrice : exitPrice < trade.entryPrice;

  const settled: Trade = {
    ...trade,
    exitPrice,
    status: won ? "won" : "lost",
    payout: won ? Math.round(trade.amount * (1 + trade.payoutRate)) : 0,
  };

  openTrades.delete(trade.id);
  history.unshift(settled);
  balance += settled.payout;

  dispatchNuiMessage({ action: "TRADE_SETTLED", data: settled });
  pushBalance();
  dispatchNuiMessage({ action: "TRADE_HISTORY", data: history.slice(0, 200) });
}

function handlePlaceTrade(request: PlaceTradeRequest): void {
  const config = defaultTradingConfig;
  const now = Date.now();

  if (!config.marketEnabled || MarketEngine.status === "closed" || MarketEngine.status === "maintenance") {
    reject("Market is currently closed");
    return;
  }
  if (now - lastTradeAt < config.cooldownMs) {
    reject("Slow down — trade cooldown active");
    return;
  }
  if (openTrades.size >= config.maxOpenTrades) {
    reject(`Maximum ${config.maxOpenTrades} open positions`);
    return;
  }
  const amount = Math.floor(Number(request.amount));
  if (!Number.isFinite(amount) || amount < config.minimumTrade || amount > config.maximumTrade) {
    reject("Invalid investment amount");
    return;
  }
  if (amount > balance) {
    reject("Insufficient balance");
    return;
  }
  if (!config.durations.includes(Number(request.duration))) {
    reject("Invalid trade duration");
    return;
  }
  const snapshot = MarketEngine.getSnapshot(request.assetId);
  if (!snapshot) {
    reject("Unknown asset");
    return;
  }
  if (request.direction !== "up" && request.direction !== "down") {
    reject("Invalid direction");
    return;
  }

  counter += 1;
  lastTradeAt = now;
  balance -= amount;

  const trade: Trade = {
    id: `T${now.toString(36).toUpperCase()}${counter}`,
    assetId: snapshot.id,
    symbol: snapshot.symbol,
    direction: request.direction,
    amount,
    entryPrice: snapshot.price,
    duration: request.duration,
    openedAt: now,
    expiresAt: now + request.duration * 1_000,
    status: "open",
    payoutRate: snapshot.payout,
    payout: 0,
    precision: snapshot.precision,
  };

  openTrades.set(trade.id, trade);
  dispatchNuiMessage({ action: "TRADE_CREATED", data: trade });
  pushBalance();

  setTimeout(() => {
    const live = openTrades.get(trade.id);
    if (!live) return;
    live.status = "settling";
    dispatchNuiMessage({ action: "TRADE_UPDATE", data: { ...live } });
    setTimeout(() => settle(live), 1_200);
  }, request.duration * 1_000);
}

export function startMockServer(): void {
  if (started) return;
  started = true;

  registerMockTransport((action, data) => {
    switch (action) {
      case "placeTrade":
        handlePlaceTrade(data as PlaceTradeRequest);
        break;
      case "requestHistory":
        dispatchNuiMessage({ action: "TRADE_HISTORY", data: history.slice(0, 200) });
        break;
      case "requestPlayerData":
        pushBalance();
        break;
      case "closeTerminal":
        dispatchNuiMessage({ action: "CLOSE_TERMINAL" });
        break;
    }
  });

  // Emulate the server opening the terminal for the player.
  setTimeout(() => {
    dispatchNuiMessage({
      action: "OPEN_TERMINAL",
      data: {
        player: { ...MOCK_PLAYER, balance },
        config: defaultTradingConfig,
        openTrades: [],
        history,
        marketStatus: MarketEngine.status,
      },
    });
  }, 60);
}
