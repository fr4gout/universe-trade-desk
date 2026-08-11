import { useEffect, useRef } from "react";

interface SparklineProps {
  values: number[];
  positive: boolean;
  width?: number;
  height?: number;
}

export function Sparkline({ values, positive, width = 58, height = 20 }: SparklineProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || values.length < 2) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const stepX = width / (values.length - 1);
    const color = getComputedStyle(canvas).getPropertyValue(
      positive ? "--color-positive" : "--color-negative",
    );

    ctx.beginPath();
    values.forEach((value, index) => {
      const x = index * stepX;
      const y = height - 2 - ((value - min) / range) * (height - 4);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color.trim() || "#6BBFFF";
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [values, positive, width, height]);

  return <canvas ref={ref} style={{ width, height }} aria-hidden />;
}
