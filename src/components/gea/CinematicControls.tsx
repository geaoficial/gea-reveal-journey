import { useEffect, useState } from "react";

type Level = "off" | "soft" | "default" | "strong";

const LEVELS: Record<Level, { grain: number; vignette: number; label: string }> = {
  off: { grain: 0.0, vignette: 0.0, label: "Off" },
  soft: { grain: 0.04, vignette: 0.35, label: "Suave" },
  default: { grain: 0.07, vignette: 0.55, label: "Padrão" },
  strong: { grain: 0.12, vignette: 0.75, label: "Forte" },
};

const STORAGE_KEY = "gea.cinematic.level";

function applyLevel(level: Level) {
  const { grain, vignette } = LEVELS[level];
  const root = document.documentElement;
  root.style.setProperty("--grain-opacity", String(grain));
  root.style.setProperty("--vignette-opacity", String(vignette));
}

export function CinematicControls() {
  const [level, setLevel] = useState<Level>("default");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as Level | null) ?? "default";
    const valid = saved in LEVELS ? saved : "default";
    setLevel(valid);
    applyLevel(valid);
    setMounted(true);
  }, []);

  const select = (l: Level) => {
    setLevel(l);
    applyLevel(l);
    localStorage.setItem(STORAGE_KEY, l);
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 font-body">
      {open && (
        <div className="rounded-full border border-white/10 bg-black/70 px-2 py-2 backdrop-blur-md">
          <div className="flex gap-1">
            {(Object.keys(LEVELS) as Level[]).map((l) => (
              <button
                key={l}
                onClick={() => select(l)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] rounded-full transition-colors ${
                  level === l
                    ? "bg-gea-cream text-gea-black"
                    : "text-gea-cream/60 hover:text-gea-cream"
                }`}
              >
                {LEVELS[l].label}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Ajustar intensidade cinematográfica"
        className="h-10 w-10 rounded-full border border-white/10 bg-black/70 text-gea-cream/70 backdrop-blur-md transition-colors hover:text-gea-cream flex items-center justify-center"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}
