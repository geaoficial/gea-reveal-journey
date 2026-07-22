import { useEffect, useSyncExternalStore } from "react";

/**
 * Adaptive performance monitor.
 * Samples real FPS via requestAnimationFrame and downgrades cinematic
 * effects when the browser starts dropping frames. Exposes a tier that
 * components can read + CSS variables that global effects can inherit
 * (--fx-blur-scale, --fx-layer-opacity).
 *
 * Tiers:
 *  - "cinema"   : full blur radii, all optional layers
 *  - "balanced" : ~65% blur, secondary layers dimmed
 *  - "lite"     : ~35% blur, secondary layers hidden
 */
export type PerfTier = "cinema" | "balanced" | "lite";

type Listener = () => void;

let currentTier: PerfTier = "cinema";
let started = false;
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l();
}

function applyCssVars(tier: PerfTier) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const scale = tier === "cinema" ? 1 : tier === "balanced" ? 0.65 : 0.35;
  const layers = tier === "cinema" ? 1 : tier === "balanced" ? 0.7 : 0.4;
  root.style.setProperty("--fx-blur-scale", String(scale));
  root.style.setProperty("--fx-layer-opacity", String(layers));
  root.dataset.perfTier = tier;
}

function setTier(next: PerfTier) {
  if (next === currentTier) return;
  currentTier = next;
  applyCssVars(next);
  emit();
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  applyCssVars(currentTier);

  // Honor reduced motion / save-data preemptively.
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  if (reduced) {
    setTier("lite");
    return;
  }

  let last = performance.now();
  let ema = 60; // exponential moving average of FPS
  let lowStreak = 0;
  let highStreak = 0;
  let rafId = 0;
  let hidden = false;

  const onVisibility = () => {
    hidden = document.hidden;
    if (!hidden) last = performance.now(); // avoid a huge delta spike
  };
  document.addEventListener("visibilitychange", onVisibility);

  const tick = (now: number) => {
    const dt = now - last;
    last = now;
    if (!hidden && dt > 0 && dt < 500) {
      const fps = 1000 / dt;
      // Smooth: fast response but resistant to single-frame jank.
      ema = ema * 0.9 + fps * 0.1;

      // Degrade
      if (ema < 32) {
        lowStreak += 1;
        highStreak = 0;
        if (lowStreak > 60 && currentTier !== "lite") setTier("lite");
      } else if (ema < 46) {
        lowStreak += 1;
        highStreak = 0;
        if (lowStreak > 90 && currentTier === "cinema") setTier("balanced");
      } else if (ema > 56) {
        highStreak += 1;
        lowStreak = 0;
        // Recover slowly to avoid oscillation.
        if (highStreak > 300) {
          if (currentTier === "lite") setTier("balanced");
          else if (currentTier === "balanced") setTier("cinema");
          highStreak = 0;
        }
      } else {
        lowStreak = Math.max(0, lowStreak - 1);
        highStreak = Math.max(0, highStreak - 1);
      }
    }
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);

  // No cleanup: this is a global singleton for the app lifetime.
  void rafId;
}

function subscribe(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** Read current performance tier. SSR-safe (returns "cinema"). */
export function usePerfTier(): PerfTier {
  useEffect(() => {
    start();
  }, []);
  return useSyncExternalStore(
    subscribe,
    () => currentTier,
    () => "cinema" as PerfTier,
  );
}

/** Convenience: numeric blur multiplier ∈ [0.35, 1]. */
export function blurFor(tier: PerfTier, base: number): number {
  const scale = tier === "cinema" ? 1 : tier === "balanced" ? 0.65 : 0.35;
  return Math.round(base * scale);
}
