# Universe Terminal

MASTER DEVELOPMENT PROMPT — FIVE M TRADING TERMINAL

PROJECT: UNIVERSE ROLEPLAY — NEXT-GEN TRADING TERMINAL

Build a complete, production-quality FiveM NUI trading terminal for my FiveM roleplay server.

The application should feel like a serious, premium financial trading terminal inspired by the functionality of platforms such as Quotex, but DO NOT copy Quotex branding, logos, exact layouts, proprietary graphics, or visual identity.

Create an original trading experience specifically designed for a FiveM roleplay economy.

1. CORE TECHNOLOGY

Use:

React

TypeScript

Tailwind CSS

Vite

FiveM NUI

HTML5 Canvas or SVG for charts

CSS animations

React hooks

Context or Zustand for application state where appropriate

Use the existing template as the starting point:

https://github.com/avilchiis/app_template

First inspect the repository structure and understand its existing FiveM/NUI integration before modifying it.

Do not unnecessarily replace the existing FiveM infrastructure.

2. PRIMARY GOAL

Create a sophisticated trading application where players can:

View simulated financial assets

Monitor live-looking price movements

Select an asset

Select trade duration

Enter investment amount

Predict price direction

Open UP/DOWN positions

Watch positions in real time

See profit/loss movement

Receive settlement results

View trading history

View account balance

View available assets

Monitor market status

Manage open positions

The system is for FiveM roleplay gameplay, not real-world financial trading.

Everything should operate using the server's in-game economy.

3. DESIGN PHILOSOPHY

The UI must NOT look AI-generated.

Avoid:

Generic SaaS dashboards

Excessive glassmorphism

Huge rounded cards

Random gradients

Purple/blue AI startup aesthetics

Excessive neon

Overly rounded UI

Excessive shadows

Fake futuristic decorations

Unnecessary glowing borders

Generic template layouts

Instead create a design that feels like a professional proprietary trading terminal designed by an experienced financial product designer.

Think:

Bloomberg-inspired information density

Modern fintech terminal

Premium trading workstation

Dark professional interface

Dense but organized data

Sharp hierarchy

Minimal decoration

Excellent spacing

Strong typography

Subtle animation

High information clarity

The interface should feel like something a professional trading company could have internally developed.

4. VISUAL SYSTEM

Primary background:

#060810

Primary accent:

#6BBFFF

Supporting surfaces:

rgba(14, 18, 36, 0.7)

Text:

#FFFFFF

Secondary text:

slate/gray tones

Positive:

Use a restrained green.

Negative:

Use a restrained red.

Do NOT overuse the accent color.

The #6BBFFF color should primarily represent:

Selected states

Active controls

Important indicators

Chart interactions

Buttons

Focus states

Price highlights

Use neutral dark surfaces for most of the interface.

5. WINDOW SIZE / FIVE M NUI

This is NOT supposed to be a fullscreen website.

The trading terminal should appear as a large centered workstation panel inside the game.

Target visual footprint:

Approximately:

78–88vw width

78–86vh height

with comfortable margins around the application.

It should feel like the player opened a dedicated trading workstation.

Include:

subtle outer shadow

very subtle border

dark surrounding backdrop

professional window framing

Do not make the interface unnecessarily oversized.

6. MAIN APPLICATION STRUCTURE

Create the application around the following structure:

Trading Terminal
│
├── Top Navigation
│
├── Market Watch
│
├── Main Chart Workspace
│
├── Trading Panel
│
├── Open Positions
│
├── Account / Wallet
│
└── Trading History


The layout should adapt intelligently to the available FiveM NUI viewport.

7. TOP BAR

Create a professional terminal header.

Left:

Universe Roleplay logo/name

Trading Terminal label

Market status indicator

Center:

Selected asset

Current price

Price movement

Percentage movement

Right:

Account balance

Player identifier/avatar

Settings

Close terminal

Example:

UNIVERSE ROLEPLAY
TRADING TERMINAL

BTC/USD     68,421.24     +1.24%

                         $125,430.00
                         WALLET


Keep it compact.

8. LEFT MARKET WATCH PANEL

Create a compact asset watchlist.

Example assets:

BTC/USD
ETH/USD
GOLD/USD
OIL/USD
EUR/USD
GBP/USD
USD/JPY
TECH
ENERGY
CRYPTO


These are simulated in-game assets.

Each asset should display:

symbol

current price

percentage change

mini sparkline

market status

Example:

BTC/USD
68,421.24
+1.24%


Clicking an asset updates the main chart.

Add search/filter functionality.

9. MAIN CHART

This is the centerpiece.

Create a sophisticated financial chart.

Prefer:

Candlestick chart

Grid

Price axis

Time axis

Current price line

Crosshair

Hover tooltip

Volume visualization

Entry markers

Expiration marker

Trade result markers

Chart should visually resemble a professional trading terminal.

Do not create a simple fake line chart.

10. CANDLESTICK SYSTEM

Generate realistic simulated market candles.

Each candle should contain:

interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}


Implement a deterministic market simulation.

Avoid completely random movement.

Price movement should use:

trend

momentum

volatility

mean reversion

noise

market sessions

occasional volatility spikes

The result should look believable rather than random.

11. MARKET ENGINE

Create a dedicated market simulation engine.

Example:

MarketEngine
│
├── AssetManager
├── PriceGenerator
├── CandleGenerator
├── VolatilityManager
├── TrendManager
├── MarketSession
└── EventGenerator


Each asset should have different characteristics.

Example:

BTC:

high volatility

GOLD:

medium volatility

EUR/USD:

lower volatility

OIL:

medium/high volatility

12. SERVER AUTHORITATIVE TRADING

IMPORTANT:

The client must NEVER be trusted with money calculations.

FiveM server-side code must validate:

player balance

investment amount

trade duration

selected asset

trade direction

trade creation time

expiration time

final settlement price

payout

cooldowns

duplicate trades

invalid requests

The client should only provide UI interaction.

Never allow the NUI JavaScript to directly modify player money.

13. FIVE M NUI COMMUNICATION

Create a clean abstraction for FiveM communication.

Example:

interface NuiMessage {
  action: string;
  data?: unknown;
}


Use functions such as:

sendNuiMessage()
onNuiMessage()
closeTradingTerminal()


Create a dedicated hook:

useFiveMNui()


Support:

OPEN_TERMINAL
CLOSE_TERMINAL
PLAYER_DATA
BALANCE_UPDATE
MARKET_UPDATE
TRADE_CREATED
TRADE_UPDATE
TRADE_SETTLED
TRADE_HISTORY


Development mode should work without FiveM using mock data.

14. TRADE PANEL

The right side should contain the trading controls.

Example:

TRADE

BTC/USD
68,421.24

Investment

$ 5,000

Duration

30s
60s
120s
300s

Expected Return

+82%

Potential Profit

$4,100

[ UP ]
Price will rise

[ DOWN ]
Price will fall


The panel must update dynamically.

15. TRADE DURATION

Support:

15 seconds
30 seconds
60 seconds
120 seconds
300 seconds


Make the duration system configurable from the server.

Do not hardcode the economy.

16. TRADE AMOUNT

Provide:

input field

increment/decrement

preset amounts

minimum trade

maximum trade

available balance

Example presets:

$500
$1,000
$5,000
$10,000
$25,000


But make these configurable.

Prevent:

negative values

NaN

decimal abuse

values above balance

values above configured maximum

17. UP / DOWN TRADING

Create two visually distinct controls.

UP:

↑
UP
Price rises


DOWN:

↓
DOWN
Price falls


Do not make these giant cartoon buttons.

They should feel like professional terminal controls.

When selected:

highlight the control

show confirmation state

show entry price

show expiry time

18. TRADE CONFIRMATION

Before placing a trade, show a compact confirmation state.

Example:

CONFIRM POSITION

BTC/USD

Direction       UP
Entry Price     68,421.24
Investment      $5,000
Duration        60 sec
Potential Return 82%

[Cancel] [Confirm Trade]


Avoid unnecessary modal animations.

19. OPEN POSITION

Once a trade is created, display it in an open-position panel.

Example:

OPEN POSITION

BTC/USD
UP

Entry
68,421.24

Current
68,517.92

Investment
$5,000

Remaining
00:42

P/L
+$1,820


Add:

countdown

progress indicator

current price

entry price

estimated payout

live P/L

20. EXPIRATION ANIMATION

When a trade reaches expiration:

Create a short professional settlement animation.

Example sequence:

EXPIRING
↓
SETTLING
↓
RESULT


Do not use flashy casino-style animations.

Use:

subtle chart marker

price comparison

result transition

balance update

21. TRADE RESULTS

Winning:

POSITION CLOSED

BTC/USD
UP

Entry
68,421.24

Exit
68,690.32

Investment
$5,000

Profit
+$4,100

Payout
$9,100

[Close]


Losing:

POSITION CLOSED

BTC/USD
DOWN

Entry
68,421.24

Exit
68,690.32

Investment
$5,000

Loss
-$5,000


Keep the result interface clean and professional.

22. TRADING HISTORY

Create a dedicated history view.

Columns:

TIME
ASSET
DIRECTION
ENTRY
EXIT
AMOUNT
RESULT
PAYOUT


Example:

21:04:32
BTC/USD
UP
68,421
68,790
$5,000
WIN
+$4,100


Support:

pagination

filtering

asset filtering

result filtering

date filtering

23. PORTFOLIO / WALLET

Create an account section displaying:

AVAILABLE BALANCE

$125,430

TOTAL PROFIT
+$48,320

TOTAL LOSS
-$21,200

WIN RATE
68.4%

TRADES
124


Use subtle data visualization.

Do not create fake complexity.

24. STATISTICS

Create a statistics screen.

Display:

total trades

winning trades

losing trades

win rate

total volume

total profit

total loss

best trade

worst trade

most traded asset

Use compact professional charts.

25. MARKET STATUS

Create a market status system.

Possible states:

MARKET OPEN
MARKET CLOSED
HIGH VOLATILITY
LOW LIQUIDITY
MAINTENANCE


For FiveM gameplay, these can be configured by server administrators.

26. MARKET EVENTS

Create simulated events that affect market behavior.

Examples:

MARKET NEWS

TECH SECTOR SURGES

Volatility increased

+2.4%


Other examples:

GLOBAL MARKET PRESSURE
ENERGY DEMAND INCREASE
CRYPTO VOLATILITY SPIKE
CURRENCY STABILITY


These should affect the simulation engine rather than being purely cosmetic.

27. REAL-TIME UPDATES

Use an efficient update system.

Avoid unnecessary React rerenders.

Market prices should update smoothly.

Use:

requestAnimationFrame where appropriate

memoized components

selective state updates

throttled UI updates

efficient chart rendering

Do NOT update the entire React tree every tick.

28. PERFORMANCE TARGET

The application must run smoothly inside FiveM.

Target:

60 FPS UI
Low CPU usage
Low memory usage
No unnecessary loops
No memory leaks
No excessive DOM nodes


The UI must remain responsive while the game is running.

Avoid heavy libraries unless they provide meaningful value.

29. RESPONSIVE NUI

The application should adapt to:

1080p

1440p

ultrawide monitors

different FiveM resolutions

Do not let:

charts overflow

controls overlap

text clip

tables break

buttons move outside the terminal

Use responsive CSS grid/flex layouts.

30. ANIMATION SYSTEM

Use subtle professional animations.

Examples:

chart updates

price changes

panel transitions

button states

modal transitions

trade creation

trade settlement

balance changes

Animation timing:

120ms–180ms


for micro interactions.

Use slower transitions only where necessary.

Do not animate everything.

31. MICRO INTERACTIONS

Add polished details:

price flash on movement

subtle hover states

button press feedback

active asset indicator

countdown transitions

balance number transitions

trade entry marker

expiration marker

toast notifications

These should make the UI feel expensive without becoming distracting.

32. NOTIFICATION SYSTEM

Create an internal notification system.

Examples:

TRADE OPENED
BTC/USD UP position opened.

TRADE WON
Position settled successfully.

TRADE LOST
Position expired below entry price.

INSUFFICIENT BALANCE
You don't have enough funds.

MARKET CLOSED
Trading is currently unavailable.


Notifications should be compact.

33. SOUND SYSTEM

Add optional subtle sound effects:

trade opened

trade settled

notification

button interaction

Make sound configurable.

Do not use annoying casino-style sounds.

34. KEYBOARD SHORTCUTS

Support:

ESC
Close terminal

1
Select UP

2
Select DOWN

Enter
Confirm trade

/
Focus asset search

B
Open balance

H
Open history


Show shortcuts inside settings/help.

35. SETTINGS

Create a settings panel.

Options:

Chart Theme
Candle Style
Chart Grid
Sound Effects
Notifications
Animations
Price Precision
Default Trade Duration


Store client-safe preferences locally.

Do not store financial authority data locally.

36. COMPONENT ARCHITECTURE

Use reusable components.

Example:

src/
│
├── app/
│   ├── App.tsx
│   ├── routes/
│   └── providers/
│
├── components/
│   ├── layout/
│   ├── trading/
│   ├── chart/
│   ├── market/
│   ├── wallet/
│   ├── history/
│   ├── statistics/
│   ├── settings/
│   └── common/
│
├── hooks/
│   ├── useFiveMNui.ts
│   ├── useMarket.ts
│   ├── useTrading.ts
│   ├── useCountdown.ts
│   └── useSound.ts
│
├── store/
│   ├── tradingStore.ts
│   ├── marketStore.ts
│   └── uiStore.ts
│
├── services/
│   ├── nui.ts
│   ├── market.ts
│   └── trading.ts
│
├── engine/
│   ├── MarketEngine.ts
│   ├── PriceGenerator.ts
│   ├── CandleGenerator.ts
│   ├── Volatility.ts
│   └── TrendModel.ts
│
├── types/
│   ├── trading.ts
│   ├── market.ts
│   └── player.ts
│
├── data/
│   └── mock/
│
├── styles/
│   └── globals.css
│
└── utils/
    ├── formatCurrency.ts
    ├── formatPrice.ts
    └── validation.ts


37. TYPESCRIPT TYPES

Create strongly typed interfaces.

Example:

interface Asset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  volatility: number;
  precision: number;
  status: MarketStatus;
}


interface Trade {
  id: string;
  assetId: string;
  direction: "up" | "down";
  amount: number;
  entryPrice: number;
  exitPrice?: number;
  duration: number;
  openedAt: number;
  expiresAt: number;
  status: "open" | "won" | "lost" | "cancelled";
  payout: number;
}


Keep the entire application type-safe.

Avoid:

any


unless absolutely unavoidable.

38. FIVE M CLIENT/SERVER ARCHITECTURE

Create clear separation:

React NUI
    ↓
NUI Callback
    ↓
FiveM Client
    ↓
FiveM Server
    ↓
Economy / Database


The server controls:

money

trades

settlement

timestamps

trade IDs

payout

history

The client controls:

UI

visual market rendering

interaction

animations

39. DATABASE DESIGN

Prepare database support for:

trading_accounts
trades
trade_history
market_events


Example trade record:

id
player_identifier
asset
direction
amount
entry_price
exit_price
duration
opened_at
expires_at
status
payout
created_at


Do not expose database credentials to the NUI.

40. SECURITY

Implement validation for:

spoofed trade requests

invalid amounts

duplicate trade IDs

manipulated timestamps

manipulated prices

impossible durations

rapid request spam

client-side payout manipulation

The client should never decide whether a trade won.

The server must calculate settlement.

41. ADMIN CONFIGURATION

Make the system configurable.

Example:

TradingConfig = {
  minimumTrade: 500,
  maximumTrade: 100000,
  durations: [15, 30, 60, 120, 300],
  defaultPayout: 0.82,
  maxOpenTrades: 5,
  marketEnabled: true
};


Allow administrators to configure:

assets

volatility

payouts

durations

limits

market hours

maximum open trades

cooldowns

42. ECONOMY INTEGRATION

Do NOT create a separate fake wallet unless explicitly configured.

Integrate with the existing FiveM economy.

Create an adapter layer:

EconomyAdapter


so it can later connect to:

QBCore

ESX

custom economy

ox_inventory/economy systems

Do not hard-code one framework unnecessarily.

43. MOCK DEVELOPMENT MODE

Create a development mode.

When running outside FiveM:

DEV_MODE=true


the application should automatically use:

mock player

mock balance

mock market

mock trades

simulated price movement

This makes UI development possible without launching FiveM.

44. UX FLOW

The complete player flow should be:

Open Trading Terminal
        ↓
Load Account
        ↓
Load Market
        ↓
Select Asset
        ↓
Analyze Chart
        ↓
Select Duration
        ↓
Enter Amount
        ↓
Select UP/DOWN
        ↓
Confirm Trade
        ↓
Position Opens
        ↓
Live Countdown
        ↓
Market Continues
        ↓
Expiration
        ↓
Server Settlement
        ↓
Result
        ↓
Wallet Updated
        ↓
History Updated


Every step must feel immediate.

45. EMPTY STATES

Design proper empty states.

Examples:

NO OPEN POSITIONS

Your active trades will appear here.


NO TRADING HISTORY

Complete your first trade to see activity here.


Never leave empty blank areas.

46. ERROR STATES

Create proper error handling.

Examples:

Unable to connect to trading server.


Market data unavailable.


Trade could not be created.


Your balance changed. Please try again.


Errors should never crash the UI.

47. ACCESSIBILITY

Support:

readable contrast

keyboard navigation

visible focus states

semantic buttons

aria labels where useful

reduced-motion preference

Do not sacrifice the premium design for accessibility.

48. VISUAL DETAILS

Use:

thin 1px borders

subtle surface separation

restrained corner radius

clean typography

compact data labels

numerical alignment

monospace font for financial numbers where appropriate

consistent spacing

Financial numbers should feel precise.

For example:

68,421.240
+1.284%
$125,430.00
00:42


49. DO NOT DO

Do NOT:

copy Quotex UI

copy Quotex branding

use Quotex logos

create a casino aesthetic

use excessive neon

create giant buttons

make the entire interface glass

use excessive gradients

use excessive rounded cards

use random decorative elements

use placeholder lorem ipsum

create fake loading screens

create unnecessary pages

use excessive animation

trust the client for money

calculate settlement only in React

50. FINAL QUALITY STANDARD

The final result should look like a custom-built proprietary trading terminal for a premium FiveM RP server.

It should feel:

professional

technical

premium

fast

dense

believable

original

modern

practical

It should NOT feel:

AI generated

template generated

generic dashboard

casino UI

crypto scam website

random futuristic UI

Every component must have a purpose.

51. IMPLEMENTATION PROCESS

Follow this order:

PHASE 1 — Repository Analysis

Inspect the existing template:

https://github.com/avilchiis/app_template


Understand:

Vite setup

React structure

FiveM integration

NUI callbacks

build system

existing CSS

package dependencies

Do not destroy useful infrastructure.

PHASE 2 — Architecture

Implement:

folder structure

TypeScript types

state management

NUI communication layer

mock mode

configuration system

PHASE 3 — Design System

Implement:

colors

typography

spacing

surfaces

buttons

inputs

tables

notifications

modal system

PHASE 4 — Trading Interface

Implement:

market watch

chart

trading panel

open positions

wallet

history

PHASE 5 — Market Engine

Implement:

simulated assets

candle generation

trend

volatility

price updates

PHASE 6 — Trading Engine

Implement:

trade creation

countdown

open position

settlement

result

history

PHASE 7 — FiveM Integration

Implement:

NUI callbacks

client events

server events

economy adapter

database adapter

PHASE 8 — Security

Implement:

server validation

anti-spam

duplicate prevention

authoritative settlement

PHASE 9 — Performance

Optimize:

React rendering

chart rendering

state updates

animations

memory usage

PHASE 10 — Final Polish

Add:

micro-interactions

keyboard shortcuts

sound

notifications

loading states

error states

empty states

responsive behavior

52. CODE QUALITY

Use clean production-quality code.

Requirements:

strict TypeScript

reusable components

small focused components

no unnecessary duplication

no giant monolithic App.tsx

no magic numbers

centralized configuration

clear naming

comments only where useful

no unused imports

no console spam

no memory leaks

53. FINAL DELIVERABLE

Deliver a complete working FiveM resource with:

React UI
+
TypeScript
+
Tailwind CSS
+
FiveM NUI
+
Market Simulation
+
Trading Engine
+
Server Authority
+
Economy Integration Layer
+
Database Layer
+
Mock Development Mode
+
Responsive UI
+
Professional Trading Terminal


The finished UI should be visually impressive enough to become a signature feature of Universe Roleplay.

Prioritize original design, performance, usability, server-side security, and professional financial-terminal aesthetics over unnecessary visual effects.

Before writing large amounts of code, inspect the existing template and preserve its compatible FiveM architecture. Then implement the system incrementally, testing each layer before moving to the next.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://universe-trade-desk.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e4646702-dac6-4f7d-b4a2-ca0352a97969).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
