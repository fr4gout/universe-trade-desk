import { useEffect } from "react";

export interface ShortcutHandlers {
  onClose: () => void;
  onUp: () => void;
  onDown: () => void;
  onConfirm: () => void;
  onSearch: () => void;
  onWallet: () => void;
  onHistory: () => void;
}

const isTypingTarget = (target: EventTarget | null): boolean => {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable;
};

export function useKeyboardShortcuts(handlers: ShortcutHandlers): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const typing = isTypingTarget(event.target);

      if (event.key === "Escape") {
        event.preventDefault();
        handlers.onClose();
        return;
      }
      if (event.key === "/" && !typing) {
        event.preventDefault();
        handlers.onSearch();
        return;
      }
      if (typing && event.key !== "Enter") return;

      switch (event.key) {
        case "1":
          handlers.onUp();
          break;
        case "2":
          handlers.onDown();
          break;
        case "Enter":
          handlers.onConfirm();
          break;
        case "b":
        case "B":
          handlers.onWallet();
          break;
        case "h":
        case "H":
          handlers.onHistory();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers]);
}
