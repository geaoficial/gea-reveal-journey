import { forwardRef } from "react";
import { formatUnlockDate } from "@/lib/vip";

type Props = {
  name: string | null;
  memberId: string;
  unlockedAt: string | null;
  /** Modo estático para exportar como imagem (sem animações). */
  exportMode?: boolean;
};

/**
 * Cartão Clube GEA — inspirado no cartão de visita oficial da marca:
 * preto fosco absoluto, logo GEA em prata escovada com relevo,
 * divisor vertical fino e tipografia técnica minimalista.
 */
export const VipCard = forwardRef<HTMLDivElement, Props>(function VipCard(
  { name, memberId, unlockedAt, exportMode = false },
  ref
) {
  const silverText: React.CSSProperties = {
    background:
      "linear-gradient(180deg, #f4f4f4 0%, #d4d4d4 40%, #8a8a8a 70%, #cfcfcf 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
  };

  return (
    <div
      ref={ref}
      className="relative aspect-[1.75/1] w-full max-w-md overflow-hidden rounded-[14px]"
      style={{
        background:
          "radial-gradient(120% 100% at 30% 20%, #141414 0%, #0a0a0a 55%, #050505 100%)",
        boxShadow: exportMode
          ? "none"
          : "0 40px 100px -40px rgba(0,0,0,0.95), 0 0 0 1px rgba(200,200,200,0.06)",
      }}
    >
      {/* Textura de papel fosco */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.35] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.4) 1px, transparent 1px)",
          backgroundSize: "3px 3px, 5px 5px",
          backgroundPosition: "0 0, 1px 2px",
        }}
      />
      {/* Luz superior sutil */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.05) 0%, transparent 45%)",
        }}
      />

      <div className="relative flex h-full items-stretch px-6 py-6 sm:px-8 sm:py-7">
        {/* Logo GEA — lado esquerdo */}
        <div className="flex flex-1 items-center justify-center">
          <div
            className="text-5xl sm:text-6xl leading-none"
            style={{
              ...silverText,
              fontWeight: 400,
              letterSpacing: "0.04em",
              textShadow: exportMode
                ? undefined
                : "0 1px 0 rgba(255,255,255,0.08), 0 -1px 0 rgba(0,0,0,0.6)",
            }}
          >
            GEA
          </div>
        </div>

        {/* Divisor vertical prateado */}
        <div
          aria-hidden
          className="mx-4 w-px shrink-0 self-stretch sm:mx-6"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(210,210,210,0.55) 20%, rgba(210,210,210,0.55) 80%, transparent 100%)",
          }}
        />

        {/* Bloco de informações — lado direito */}
        <div className="flex flex-[1.4] flex-col justify-center gap-3">
          <div>
            <div
              className="text-[0.85rem] sm:text-[0.95rem] leading-tight"
              style={{ ...silverText, fontWeight: 500, letterSpacing: "0.08em" }}
            >
              {(name || "MEMBRO ANÔNIMO").toUpperCase()}
            </div>
            <div
              className="mt-1 text-[0.5rem] uppercase"
              style={{
                letterSpacing: "0.42em",
                color: "rgba(200,200,200,0.5)",
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
              }}
            >
              Membro Fundador · GEA
            </div>
          </div>

          <div
            aria-hidden
            className="h-px w-full"
            style={{
              background:
                "linear-gradient(90deg, rgba(210,210,210,0.35), transparent)",
            }}
          />

          <ul
            className="flex flex-col gap-1.5 text-[0.68rem] sm:text-[0.72rem]"
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              color: "rgba(230,230,230,0.85)",
              letterSpacing: "0.08em",
            }}
          >
            <li className="flex items-center gap-2">
              <Dot />
              <span className="tabular-nums">Nº {memberId || "----"}</span>
            </li>
            <li className="flex items-center gap-2">
              <Dot />
              <span>@geastoree</span>
            </li>
            <li className="flex items-center gap-2">
              <Dot />
              <span>Desde {formatUnlockDate(unlockedAt)}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Reflexo diagonal */}
      {!exportMode && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, transparent 42%, rgba(255,255,255,0.05) 50%, transparent 58%)",
          }}
        />
      )}
    </div>
  );
});

function Dot() {
  return (
    <span
      aria-hidden
      className="inline-block h-[5px] w-[5px] shrink-0 rounded-full"
      style={{
        background:
          "radial-gradient(circle at 30% 30%, #f0f0f0 0%, #9a9a9a 60%, #4a4a4a 100%)",
        boxShadow: "0 0 4px rgba(220,220,220,0.25)",
      }}
    />
  );
}
