import { createFileRoute } from "@tanstack/react-router";
import { TradingTerminal } from "@/components/layout/TradingTerminal";

const title = "Universe Roleplay — Trading Terminal";
const description =
  "A professional simulated trading workstation for Universe Roleplay: live market watch, candlestick charts, UP/DOWN positions and server-settled results.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TradingTerminal,
  ssr: false,
});
