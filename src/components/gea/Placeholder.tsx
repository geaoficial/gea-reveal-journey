type Props = {
  label: string;
  className?: string;
  aspect?: string;
  tint?: "black" | "sunset" | "silver";
};

export function Placeholder({ label, className = "", aspect, tint = "black" }: Props) {
  const bg =
    tint === "sunset"
      ? "linear-gradient(135deg, #1a0f08 0%, #3a1e0c 45%, #7a3a18 100%)"
      : tint === "silver"
        ? "linear-gradient(135deg, #0f0f10 0%, #1c1d20 60%, #2a2b2f 100%)"
        : "linear-gradient(135deg, #060606 0%, #101010 60%, #1a1a1a 100%)";
  return (
    <div
      className={`relative overflow-hidden grain ${className}`}
      style={{ aspectRatio: aspect, background: bg }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-[10px] uppercase tracking-[0.4em] text-gea-cream/40"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {label}
        </span>
      </div>
      <div className="absolute inset-0 ring-1 ring-inset ring-white/5" />
    </div>
  );
}
