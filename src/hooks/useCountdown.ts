import { useEffect, useState } from "react";

/** Returns milliseconds remaining until `expiresAt`, ticking 10x per second. */
export function useCountdown(expiresAt: number): number {
  const [remaining, setRemaining] = useState(() => Math.max(0, expiresAt - Date.now()));

  useEffect(() => {
    setRemaining(Math.max(0, expiresAt - Date.now()));
    const id = setInterval(() => {
      setRemaining(Math.max(0, expiresAt - Date.now()));
    }, 100);
    return () => clearInterval(id);
  }, [expiresAt]);

  return remaining;
}
