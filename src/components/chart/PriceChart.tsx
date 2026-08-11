import { useEffect, useRef } from "react";
import { MarketEngine } from "@/engine/MarketEngine";
import type { Trade } from "@/types/trading";
import type { CandleStyle } from "@/store/uiStore";
import { formatPrice, formatTime } from "@/utils/format";

interface PriceChartProps {
  assetId: string;
  precision: number;
  candleStyle: CandleStyle;
  showGrid: boolean;
  trades: Trade[];
  visibleCandles?: number;
}

interface Pointer {
  x: number;
  y: number;
  active: boolean;
}

const PADDING_RIGHT = 74;
const PADDING_BOTTOM = 22;
const PADDING_TOP = 10;
const VOLUME_HEIGHT_RATIO = 0.16;

function css(el: HTMLElement, name: string, fallback: string): string {
  const value = getComputedStyle(el).getPropertyValue(name).trim();
  return value || fallback;
}

/**
 * Canvas candlestick renderer. Draws on its own rAF loop reading the engine
 * directly, so live price movement never triggers React re-renders.
 */
export function PriceChart({
  assetId,
  precision,
  candleStyle,
  showGrid,
  trades,
  visibleCandles = 90,
}: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const pointer = useRef<Pointer>({ x: 0, y: 0, active: false });
  const tradesRef = useRef<Trade[]>(trades);
  tradesRef.current = trades;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let width = 0;
    let height = 0;

    const palette = {
      grid: css(wrap, "--color-hairline", "rgba(80,90,120,.35)"),
      text: css(wrap, "--color-label", "#7b8496"),
      up: css(wrap, "--color-positive", "#2fbf7e"),
      down: css(wrap, "--color-negative", "#e5484d"),
      accent: css(wrap, "--color-primary", "#6BBFFF"),
      fg: css(wrap, "--color-foreground", "#fff"),
      surface: css(wrap, "--color-surface-sunken", "#0b0e18"),
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = wrap.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    resize();

    const draw = () => {
      frame = requestAnimationFrame(draw);
      if (width < 40 || height < 40) return;

      const all = MarketEngine.getCandles(assetId);
      if (all.length < 2) return;
      const candles = all.slice(-visibleCandles);

      const plotW = width - PADDING_RIGHT;
      const plotH = height - PADDING_BOTTOM - PADDING_TOP;
      const volH = plotH * VOLUME_HEIGHT_RATIO;
      const priceH = plotH - volH - 6;

      let min = Infinity;
      let max = -Infinity;
      let maxVol = 0;
      for (const c of candles) {
        if (c.low < min) min = c.low;
        if (c.high > max) max = c.high;
        if (c.volume > maxVol) maxVol = c.volume;
      }
      const openTradesForAsset = tradesRef.current.filter((t) => t.assetId === assetId);
      for (const t of openTradesForAsset) {
        if (t.entryPrice < min) min = t.entryPrice;
        if (t.entryPrice > max) max = t.entryPrice;
      }
      const pad = (max - min) * 0.12 || max * 0.001;
      min -= pad;
      max += pad;
      const range = max - min || 1;

      const stepX = plotW / candles.length;
      const bodyW = Math.max(1, Math.min(9, stepX * 0.62));
      const yOf = (price: number) =>
        PADDING_TOP + priceH - ((price - min) / range) * priceH;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = palette.surface;
      ctx.fillRect(0, 0, width, height);

      // Grid + price axis
      ctx.font = "10px ui-monospace, monospace";
      ctx.textBaseline = "middle";
      const rows = 6;
      for (let i = 0; i <= rows; i += 1) {
        const y = PADDING_TOP + (priceH / rows) * i;
        if (showGrid) {
          ctx.strokeStyle = palette.grid;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, Math.round(y) + 0.5);
          ctx.lineTo(plotW, Math.round(y) + 0.5);
          ctx.stroke();
        }
        const price = max - (range / rows) * i;
        ctx.fillStyle = palette.text;
        ctx.textAlign = "left";
        ctx.fillText(formatPrice(price, precision), plotW + 8, y);
      }

      // Time axis
      ctx.textAlign = "center";
      const timeEvery = Math.max(1, Math.floor(candles.length / 8));
      for (let i = 0; i < candles.length; i += timeEvery) {
        const x = i * stepX + stepX / 2;
        if (showGrid) {
          ctx.strokeStyle = palette.grid;
          ctx.beginPath();
          ctx.moveTo(Math.round(x) + 0.5, PADDING_TOP);
          ctx.lineTo(Math.round(x) + 0.5, PADDING_TOP + priceH);
          ctx.stroke();
        }
        ctx.fillStyle = palette.text;
        ctx.fillText(formatTime(candles[i]!.timestamp).slice(0, 5), x, height - 10);
      }

      // Volume
      const volBase = PADDING_TOP + priceH + volH + 6;
      for (let i = 0; i < candles.length; i += 1) {
        const c = candles[i]!;
        const h = maxVol ? (c.volume / maxVol) * volH : 0;
        ctx.fillStyle = c.close >= c.open ? palette.up : palette.down;
        ctx.globalAlpha = 0.28;
        ctx.fillRect(i * stepX + (stepX - bodyW) / 2, volBase - h, bodyW, h);
        ctx.globalAlpha = 1;
      }

      // Price series
      if (candleStyle === "line") {
        ctx.beginPath();
        candles.forEach((c, i) => {
          const x = i * stepX + stepX / 2;
          const y = yOf(c.close);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = palette.accent;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      } else {
        for (let i = 0; i < candles.length; i += 1) {
          const c = candles[i]!;
          const bull = c.close >= c.open;
          const color = bull ? palette.up : palette.down;
          const x = i * stepX + stepX / 2;
          ctx.strokeStyle = color;
          ctx.fillStyle = color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(Math.round(x) + 0.5, yOf(c.high));
          ctx.lineTo(Math.round(x) + 0.5, yOf(c.low));
          ctx.stroke();

          const yOpen = yOf(c.open);
          const yClose = yOf(c.close);
          if (candleStyle === "bars") {
            ctx.beginPath();
            ctx.moveTo(x - bodyW / 2, yOpen);
            ctx.lineTo(x, yOpen);
            ctx.moveTo(x, yClose);
            ctx.lineTo(x + bodyW / 2, yClose);
            ctx.stroke();
          } else {
            const top = Math.min(yOpen, yClose);
            const h = Math.max(1, Math.abs(yClose - yOpen));
            ctx.fillRect(x - bodyW / 2, top, bodyW, h);
          }
        }
      }

      // Last price line + tag
      const last = candles[candles.length - 1]!;
      const lastY = yOf(last.close);
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, Math.round(lastY) + 0.5);
      ctx.lineTo(plotW, Math.round(lastY) + 0.5);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = palette.accent;
      ctx.fillRect(plotW + 4, lastY - 8, PADDING_RIGHT - 8, 16);
      ctx.fillStyle = "#07121d";
      ctx.textAlign = "left";
      ctx.fillText(formatPrice(last.close, precision), plotW + 8, lastY);

      // Trade overlays
      for (const trade of openTradesForAsset) {
        const y = yOf(trade.entryPrice);
        const color = trade.direction === "up" ? palette.up : palette.down;
        ctx.strokeStyle = color;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(plotW, Math.round(y) + 0.5);
        ctx.stroke();
        ctx.setLineDash([]);

        const firstTs = candles[0]!.timestamp;
        const spanMs = last.timestamp - firstTs || 1;
        const entryX = ((trade.openedAt - firstTs) / spanMs) * (plotW - stepX);
        if (entryX > 0 && entryX < plotW) {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(entryX, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        const expiryX = ((trade.expiresAt - firstTs) / spanMs) * (plotW - stepX);
        if (expiryX > 0 && expiryX < plotW) {
          ctx.strokeStyle = palette.accent;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(Math.round(expiryX) + 0.5, PADDING_TOP);
          ctx.lineTo(Math.round(expiryX) + 0.5, PADDING_TOP + priceH);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Crosshair + tooltip
      const p = pointer.current;
      if (p.active && p.x < plotW) {
        ctx.strokeStyle = palette.grid;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(Math.round(p.x) + 0.5, PADDING_TOP);
        ctx.lineTo(Math.round(p.x) + 0.5, PADDING_TOP + priceH);
        ctx.moveTo(0, Math.round(p.y) + 0.5);
        ctx.lineTo(plotW, Math.round(p.y) + 0.5);
        ctx.stroke();
        ctx.setLineDash([]);

        const hoverPrice = max - ((p.y - PADDING_TOP) / priceH) * range;
        ctx.fillStyle = palette.grid;
        ctx.fillRect(plotW + 4, p.y - 8, PADDING_RIGHT - 8, 16);
        ctx.fillStyle = palette.fg;
        ctx.textAlign = "left";
        ctx.fillText(formatPrice(hoverPrice, precision), plotW + 8, p.y);

        const index = Math.min(candles.length - 1, Math.max(0, Math.floor(p.x / stepX)));
        const c = candles[index]!;
        const lines = [
          `${formatTime(c.timestamp)}`,
          `O ${formatPrice(c.open, precision)}  H ${formatPrice(c.high, precision)}`,
          `L ${formatPrice(c.low, precision)}  C ${formatPrice(c.close, precision)}`,
          `VOL ${c.volume}`,
        ];
        const boxW = 168;
        const boxH = lines.length * 13 + 10;
        const bx = Math.min(p.x + 12, plotW - boxW - 4);
        const by = Math.min(Math.max(PADDING_TOP, p.y - boxH - 10), PADDING_TOP + priceH - boxH);
        ctx.fillStyle = "rgba(8,11,22,0.94)";
        ctx.fillRect(bx, by, boxW, boxH);
        ctx.strokeStyle = palette.grid;
        ctx.strokeRect(bx + 0.5, by + 0.5, boxW, boxH);
        ctx.fillStyle = palette.fg;
        lines.forEach((line, i) => ctx.fillText(line, bx + 8, by + 13 + i * 13));
      }
    };

    frame = requestAnimationFrame(draw);

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        active: true,
      };
    };
    const onLeave = () => {
      pointer.current.active = false;
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [assetId, precision, candleStyle, showGrid, visibleCandles]);

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
