import { X } from "lucide-react";
import { useUiStore } from "@/store/uiStore";
import { useTradingStore } from "@/store/tradingStore";
import { cn } from "@/lib/utils";

const SHORTCUTS: Array<[string, string]> = [
  ["ESC", "Close terminal"],
  ["1", "Select UP"],
  ["2", "Select DOWN"],
  ["ENTER", "Confirm trade"],
  ["/", "Focus asset search"],
  ["B", "Open wallet"],
  ["H", "Open history"],
];

export function SettingsPanel() {
  const open = useUiStore((s) => s.settingsOpen);
  const toggle = useUiStore((s) => s.toggleSettings);
  const settings = useUiStore((s) => s.settings);
  const update = useUiStore((s) => s.updateSettings);
  const durations = useTradingStore((s) => s.config.durations);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/60">
      <div className="w-[420px] border border-hairline-strong bg-card shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]">
        <header className="flex items-center justify-between border-b border-hairline px-3 py-2">
          <span className="label-xs">Terminal Settings</span>
          <button
            type="button"
            aria-label="Close settings"
            onClick={() => toggle(false)}
            className="text-label transition-colors duration-150 hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </header>

        <div className="scroll-thin max-h-[60vh] overflow-y-auto px-3 py-2">
          <Toggle
            label="Sound effects"
            value={settings.soundEnabled}
            onChange={(v) => update({ soundEnabled: v })}
          />
          <Toggle
            label="Notifications"
            value={settings.notificationsEnabled}
            onChange={(v) => update({ notificationsEnabled: v })}
          />
          <Toggle
            label="Animations"
            value={settings.animationsEnabled}
            onChange={(v) => update({ animationsEnabled: v })}
          />
          <Toggle
            label="Chart grid"
            value={settings.chartGrid}
            onChange={(v) => update({ chartGrid: v })}
          />
          <Choice
            label="Candle style"
            value={settings.candleStyle}
            options={["candles", "bars", "line"]}
            onChange={(v) => update({ candleStyle: v as typeof settings.candleStyle })}
          />
          <Choice
            label="Price precision"
            value={settings.pricePrecision}
            options={["asset", "extended"]}
            onChange={(v) => update({ pricePrecision: v as typeof settings.pricePrecision })}
          />
          <Choice
            label="Default duration"
            value={String(settings.defaultDuration)}
            options={durations.map(String)}
            onChange={(v) => update({ defaultDuration: Number(v) })}
          />

          <div className="mt-3 border-t border-hairline pt-2">
            <span className="label-xs">Keyboard shortcuts</span>
            <ul className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1">
              {SHORTCUTS.map(([key, action]) => (
                <li key={key} className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">{action}</span>
                  <kbd className="num border border-hairline px-1 text-[10px] text-label">
                    {key}
                  </kbd>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 text-[10px] text-label">
            Preferences are stored locally. Balances, trades and settlement remain
            server-authoritative.
          </p>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-hairline py-2">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        className={cn(
          "h-4 w-8 border transition-colors duration-150",
          value ? "border-primary/60 bg-primary/25" : "border-hairline bg-surface-sunken",
        )}
      >
        <span
          className={cn(
            "block h-3 w-3 bg-foreground transition-transform duration-150",
            value ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-hairline py-2">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="flex border border-hairline">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "px-2 py-0.5 text-[10px] uppercase tracking-wider transition-colors duration-150",
              value === option ? "bg-primary/15 text-primary" : "text-label hover:text-foreground",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
