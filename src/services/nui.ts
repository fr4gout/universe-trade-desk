import type { NuiInboundAction, NuiMessage, NuiOutboundAction } from "@/types/nui";

type Handler = (data: unknown) => void;

const handlers = new Map<NuiInboundAction, Set<Handler>>();

declare global {
  interface Window {
    GetParentResourceName?: () => string;
    invokeNative?: unknown;
  }
}

/** True when the UI is actually rendered inside a FiveM CEF browser. */
export const isFiveM = (): boolean =>
  typeof window !== "undefined" && typeof window.invokeNative !== "undefined";

/** Development mode uses the local mock server instead of Lua callbacks. */
export const DEV_MODE = !isFiveM();

const resourceName = (): string =>
  (typeof window !== "undefined" && window.GetParentResourceName?.()) || "universe_trading";

/** Dispatches an inbound message to registered listeners. */
export function dispatchNuiMessage(message: NuiMessage): void {
  const set = handlers.get(message.action);
  if (!set) return;
  for (const handler of set) handler(message.data);
}

export function onNuiMessage<T = unknown>(
  action: NuiInboundAction,
  handler: (data: T) => void,
): () => void {
  const set = handlers.get(action) ?? new Set<Handler>();
  set.add(handler as Handler);
  handlers.set(action, set);
  return () => {
    set.delete(handler as Handler);
  };
}

let mockHandler: ((action: NuiOutboundAction, data: unknown) => void) | null = null;

export function registerMockTransport(
  handler: (action: NuiOutboundAction, data: unknown) => void,
): void {
  mockHandler = handler;
}

export async function sendNuiMessage(
  action: NuiOutboundAction,
  data: unknown = {},
): Promise<void> {
  if (DEV_MODE) {
    mockHandler?.(action, data);
    return;
  }
  try {
    await fetch(`https://${resourceName()}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(data),
    });
  } catch {
    // The Lua side may be unavailable; the UI surfaces this as an error state.
  }
}

export function closeTradingTerminal(): void {
  void sendNuiMessage("closeTerminal");
}

/** Bridges FiveM's window messages into the local dispatcher. */
export function attachWindowBridge(): () => void {
  const listener = (event: MessageEvent<NuiMessage>) => {
    const payload = event.data;
    if (!payload || typeof payload !== "object" || !("action" in payload)) return;
    dispatchNuiMessage(payload);
  };
  window.addEventListener("message", listener);
  return () => window.removeEventListener("message", listener);
}
