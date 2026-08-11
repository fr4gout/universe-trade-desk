# Universe Roleplay — Trading Terminal (NUI UI)

A dense, dark, professional trading workstation rendered as a centered panel over a game-style backdrop. Built entirely as the React/TypeScript UI layer with a clean FiveM NUI abstraction and a full mock mode, so it runs standalone here and drops into a FiveM resource later. No money math is treated as authoritative on the client — the UI always renders what the "server" (mock adapter today, QBCore Lua later) reports.

## What gets built

**Terminal shell**
- Centered workstation panel (~82vw × 82vh), 1px borders, restrained radius, subtle outer shadow, dark backdrop.
- Top bar: brand + "Trading Terminal", market status pill, selected asset with live price/change, wallet balance, player chip, settings, close.
- Grid layout: market watch (left) · chart workspace (center) · trade panel (right) · positions + history strip (bottom). Adapts from 1080p to ultrawide with CSS grid, no overflow.

**Market watch**
- Searchable/filterable list of 10 simulated assets (BTC, ETH, GOLD, OIL, EUR/USD, GBP/USD, USD/JPY, TECH, ENERGY, CRYPTO).
- Per row: symbol, price, % change, canvas sparkline, status dot. Click selects the chart asset.

**Chart workspace**
- Canvas candlestick chart: grid, price axis, time axis, last-price line, crosshair + tooltip, volume histogram.
- Trade overlays: entry marker, expiry line, settlement result marker.
- Timeframe/candle-style controls; drawn on a rAF loop independent of React state.

**Market engine**
- Per-asset simulation with trend, momentum, volatility, mean reversion, noise, session modifiers and occasional spikes — believable, not white noise.
- Candle aggregation from ticks; volatility profile per asset class.
- Market events (tech surge, energy demand, crypto spike, etc.) that actually shift volatility/trend, surfaced as a news ticker.

**Trading**
- Trade panel: asset, live price, amount input with steppers + presets, duration chips (15/30/60/120/300s), payout %, potential profit, UP/DOWN controls as terminal buttons.
- Inline confirmation state (direction, entry, amount, duration, return) — no heavy modal.
- Open positions: entry vs current price, countdown, progress bar, live P/L, estimated payout, max concurrent positions.
- Settlement: short EXPIRING → SETTLING → RESULT transition, then a clean win/loss result card, balance animation, history row.

**Wallet, history, statistics, settings**
- Wallet: available balance, total profit/loss, win rate, trade count, compact equity sparkline.
- History table: time, asset, direction, entry, exit, amount, result, payout; asset/result/date filters and pagination.
- Statistics: totals, win rate, volume, best/worst trade, most traded asset with compact charts.
- Settings: chart theme, candle style, grid, sound, notifications, animations, price precision, default duration — persisted to localStorage only.
- Notifications (toast), optional subtle sounds via WebAudio, keyboard shortcuts (ESC, 1, 2, Enter, /, B, H) with a shortcuts help view.
- Empty states and error states for every panel.

## Design system

Background `#060810`, surfaces `rgba(14,18,36,.7)`, accent `#6BBFFF` reserved for selection/active/focus/highlights, restrained green/red for P/L, slate secondary text. Grotesk UI face + tabular monospace for all numerics. Micro-interactions 120–180ms, reduced-motion respected. All values as semantic tokens in `src/styles.css`; no hardcoded color utilities in components.

## Technical notes

- Single route `src/routes/index.tsx` renders the terminal; route-level `head()` metadata.
- State: Zustand stores (`marketStore`, `tradingStore`, `uiStore`) with selector subscriptions; price ticks flow through the engine and a rAF-driven chart renderer, not per-tick React re-renders. Memoized rows, throttled UI updates.
- NUI layer: `services/nui.ts` (`sendNuiMessage`, `onNuiMessage`, `closeTerminal`) + `useFiveMNui()` hook handling `OPEN_TERMINAL`, `CLOSE_TERMINAL`, `PLAYER_DATA`, `BALANCE_UPDATE`, `MARKET_UPDATE`, `TRADE_CREATED`, `TRADE_UPDATE`, `TRADE_SETTLED`, `TRADE_HISTORY`. Outside FiveM it auto-falls back to a mock transport that emulates a QBCore-backed server: validates balance/limits/cooldowns/duplicates, stamps trade IDs and timestamps, and settles trades itself.
- Central `tradingConfig` (min/max trade, durations, payout, max open trades, cooldown, presets, market toggle) so nothing about the economy is hardcoded in components.
- Strict TypeScript throughout (`types/market.ts`, `types/trading.ts`, `types/player.ts`), no `any`.
- Folder layout follows the requested structure: `components/{layout,trading,chart,market,wallet,history,statistics,settings,common}`, `hooks`, `store`, `services`, `engine`, `types`, `data/mock`, `utils`.

## Out of scope for this pass

Per your answer, no Lua/`fxmanifest.lua`/SQL files are written here — the NUI message contract and payload types are documented in code so the QBCore server side plugs in without UI changes.
