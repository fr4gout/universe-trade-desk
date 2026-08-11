import { create } from "zustand";

export type WorkspaceTab = "positions" | "history" | "wallet" | "statistics";
export type CandleStyle = "candles" | "bars" | "line";

export interface TerminalSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  animationsEnabled: boolean;
  chartGrid: boolean;
  candleStyle: CandleStyle;
  pricePrecision: "asset" | "extended";
  defaultDuration: number;
}

const STORAGE_KEY = "urp.terminal.settings";

const defaultSettings: TerminalSettings = {
  soundEnabled: true,
  notificationsEnabled: true,
  animationsEnabled: true,
  chartGrid: true,
  candleStyle: "candles",
  pricePrecision: "asset",
  defaultDuration: 60,
};

function loadSettings(): TerminalSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<TerminalSettings>) };
  } catch {
    return defaultSettings;
  }
}

interface UiState {
  tab: WorkspaceTab;
  settingsOpen: boolean;
  shortcutsOpen: boolean;
  settings: TerminalSettings;
  hydrated: boolean;
  setTab: (tab: WorkspaceTab) => void;
  toggleSettings: (open?: boolean) => void;
  toggleShortcuts: (open?: boolean) => void;
  updateSettings: (patch: Partial<TerminalSettings>) => void;
  hydrateSettings: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  tab: "positions",
  settingsOpen: false,
  shortcutsOpen: false,
  settings: defaultSettings,
  hydrated: false,
  setTab: (tab) => set({ tab }),
  toggleSettings: (open) => set((s) => ({ settingsOpen: open ?? !s.settingsOpen })),
  toggleShortcuts: (open) => set((s) => ({ shortcutsOpen: open ?? !s.shortcutsOpen })),
  updateSettings: (patch) => {
    const settings = { ...get().settings, ...patch };
    set({ settings });
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Preferences are best-effort only; never block the UI.
    }
  },
  hydrateSettings: () => set({ settings: loadSettings(), hydrated: true }),
}));
