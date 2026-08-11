import { useUiStore } from "@/store/uiStore";

type SoundName = "open" | "win" | "loss" | "click" | "notify";

const TONES: Record<SoundName, { freq: number; duration: number; type: OscillatorType }> = {
  open: { freq: 620, duration: 0.09, type: "sine" },
  win: { freq: 880, duration: 0.14, type: "sine" },
  loss: { freq: 210, duration: 0.16, type: "triangle" },
  click: { freq: 420, duration: 0.04, type: "square" },
  notify: { freq: 540, duration: 0.07, type: "sine" },
};

let ctx: AudioContext | null = null;

/** Subtle, short synthesised cues — no sampled casino audio. */
export function playSound(name: SoundName): void {
  if (typeof window === "undefined") return;
  if (!useUiStore.getState().settings.soundEnabled) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const tone = TONES[name];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = tone.type;
    osc.frequency.value = tone.freq;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + tone.duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + tone.duration + 0.02);
  } catch {
    // Audio is optional; failures must never surface to the player.
  }
}

export function useSound() {
  return { play: playSound };
}
